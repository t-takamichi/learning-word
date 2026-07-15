import { createMiddleware } from 'hono/factory';
import { UserRepository } from '../repositories/userRepository';
import type { DB } from '../db';

export function authMiddleware(db: DB) {
  const repo = new UserRepository(db);
  return createMiddleware<{
    Variables: {
      user: { id: number; username: string };
    };
  }>(async (c, next) => {
    const token = c.req.header('X-User-Token');
    if (!token) {
      return c.json({ error: 'Unauthorized: Missing token' }, 401);
    }

    const user = repo.findByToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized: Invalid token' }, 401);
    }

    c.set('user', { id: user.id, username: user.username });
    await next();
  });
}
