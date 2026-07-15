import { Hono } from 'hono';
import type { Context } from 'hono';
import { UserRepository } from '../repositories/userRepository';
import type { DB } from '../db';
import { randomBytes, pbkdf2Sync, randomUUID, timingSafeEqual } from 'node:crypto';
import { authMiddleware } from '../middleware/auth';

/**
 * Resolves the real client IP for rate limiting.
 *
 * In production the app runs behind our own (trusted) nginx, so the client IP
 * lives in the X-Real-IP header that nginx sets — the raw socket address would
 * be nginx itself (e.g. 127.0.0.1), which would collapse every user into one
 * bucket and turn the IP lockout into a service-wide DoS. We therefore trust the
 * proxy header. If no proxy header is present (e.g. Node exposed directly in dev)
 * we return null and skip IP-based lockout entirely, leaving the always-correct
 * per-username lockout as the protection — never collapsing everyone into one IP.
 */
function getClientIp(c: Context): string | null {
  const realIp = c.req.header('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim();
  const xff = c.req.header('x-forwarded-for');
  if (xff && xff.trim()) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return null;
}

function hashPin(pin: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(pin, salt, 210000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPin(pin: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const verifyHash = pbkdf2Sync(pin, salt, 210000, 64, 'sha512').toString('hex');
  
  const storedBuffer = Buffer.from(hash, 'hex');
  const verifyBuffer = Buffer.from(verifyHash, 'hex');
  
  if (storedBuffer.length !== verifyBuffer.length) {
    return false;
  }
  return timingSafeEqual(storedBuffer, verifyBuffer);
}

// Simple in-memory rate limiting for login attempts
interface RateLimitRecord {
  count: number;
  lastAttempt: number;
}

const ipAttempts = new Map<string, RateLimitRecord>();
const usernameAttempts = new Map<string, RateLimitRecord>();
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// Periodically clean up expired lockout records every 15 minutes to prevent memory leaks
const gcTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, val] of ipAttempts.entries()) {
    if (now - val.lastAttempt > LOCKOUT_TIME) {
      ipAttempts.delete(key);
    }
  }
  for (const [key, val] of usernameAttempts.entries()) {
    if (now - val.lastAttempt > LOCKOUT_TIME) {
      usernameAttempts.delete(key);
    }
  }
}, 15 * 60 * 1000);

// Prevent Node.js process from staying active if this is the only timer
if (gcTimer && typeof gcTimer.unref === 'function') {
  gcTimer.unref();
}

function checkLockout(ip: string | null, username: string): { allowed: boolean; waitTime?: number } {
  const now = Date.now();

  // 1. Check IP lockout (only when we could resolve a real per-client IP).
  const ipRecord = ip ? ipAttempts.get(ip) : undefined;
  if (ipRecord && ipRecord.count >= MAX_ATTEMPTS) {
    const elapsed = now - ipRecord.lastAttempt;
    if (elapsed < LOCKOUT_TIME) {
      return { allowed: false, waitTime: LOCKOUT_TIME - elapsed };
    }
  }

  // 2. Check Username lockout (Global)
  const userRecord = usernameAttempts.get(username.toLowerCase());
  if (userRecord && userRecord.count >= MAX_ATTEMPTS) {
    const elapsed = now - userRecord.lastAttempt;
    if (elapsed < LOCKOUT_TIME) {
      return { allowed: false, waitTime: LOCKOUT_TIME - elapsed };
    }
  }

  return { allowed: true };
}

function recordFailure(ip: string | null, username: string): void {
  const now = Date.now();
  const lowerUser = username.toLowerCase();

  // Update IP failure count (skip when no per-client IP is available).
  if (ip) {
    const ipRecord = ipAttempts.get(ip);
    if (ipRecord) {
      ipRecord.count += 1;
      ipRecord.lastAttempt = now;
    } else {
      ipAttempts.set(ip, { count: 1, lastAttempt: now });
    }
  }

  // Update Username failure count
  const userRecord = usernameAttempts.get(lowerUser);
  if (userRecord) {
    userRecord.count += 1;
    userRecord.lastAttempt = now;
  } else {
    usernameAttempts.set(lowerUser, { count: 1, lastAttempt: now });
  }
}

function resetAttempts(ip: string | null, username: string): void {
  if (ip) ipAttempts.delete(ip);
  usernameAttempts.delete(username.toLowerCase());
}

export function createUsersRoute(db: DB) {
  const repo = new UserRepository(db);
  const auth = authMiddleware(db);

  return new Hono()
    .post('/', async (c) => {
      const { username, pin } = await c.req.json<{ username?: string; pin?: string }>();
      if (!username || !username.trim()) {
        return c.json({ error: 'Username is required' }, 400);
      }
      if (!pin || !pin.trim()) {
        return c.json({ error: 'PIN/Passphrase is required' }, 400);
      }

      try {
        const pinHash = hashPin(pin.trim());
        const token = randomUUID();
        const user = repo.create(username.trim(), pinHash, token);
        return c.json({ id: user.id, username: user.username, token: user.token }, 201);
      } catch (e) {
        // Generalize error message to prevent username enumeration
        return c.json({ error: 'このユーザー名は利用できません。別のお名前を試してください。' }, 409);
      }
    })
    .post('/login', async (c) => {
      const { username, pin } = await c.req.json<{ username?: string; pin?: string }>();
      if (!username || !username.trim() || !pin || !pin.trim()) {
        return c.json({ error: 'Username and PIN are required' }, 400);
      }

      // Real client IP from our trusted nginx (null if not behind a proxy).
      const ip = getClientIp(c);

      const rateLimit = checkLockout(ip, username);
      if (!rateLimit.allowed) {
        const minutes = Math.ceil((rateLimit.waitTime || 0) / 60000);
        return c.json({ error: `ログイン試行回数が制限を超えました。${minutes}分後にもう一度試してください。` }, 429);
      }

      const user = repo.findByUsername(username.trim());
      if (!user || !user.pin_hash) {
        recordFailure(ip, username);
        return c.json({ error: 'ユーザー名または合言葉(PIN)が正しくありません。' }, 401);
      }

      const isValid = verifyPin(pin.trim(), user.pin_hash);
      if (!isValid) {
        recordFailure(ip, username);
        return c.json({ error: 'ユーザー名または合言葉(PIN)が正しくありません。' }, 401);
      }

      // Reset rate limit on success
      resetAttempts(ip, username);

      // Generate a new token on successful login
      const newToken = randomUUID();
      repo.updateToken(user.id, newToken);

      return c.json({ id: user.id, username: user.username, token: newToken });
    })
    .delete('/:id', auth, (c) => {
      const id = Number(c.req.param('id'));
      const activeUser = c.get('user');

      // Restrict delete only to the logged-in owner
      if (activeUser.id !== id) {
        return c.json({ error: 'Forbidden: Cannot delete other users' }, 403);
      }

      repo.delete(id);
      return c.json({ success: true });
    });
}
