import { DB } from '../db';

export interface User {
  id: number;
  username: string;
  pin_hash?: string;
  token?: string;
}

export class UserRepository {
  constructor(private db: DB) {}

  getAll(): User[] {
    const stmt = this.db.prepare('SELECT id, username FROM users ORDER BY created_at ASC');
    return stmt.all() as unknown as User[];
  }

  findById(id: number): User | null {
    const stmt = this.db.prepare('SELECT id, username, pin_hash, token FROM users WHERE id = ?');
    const row = stmt.get(id) as User | undefined;
    return row ?? null;
  }

  findByUsername(username: string): User | null {
    const stmt = this.db.prepare('SELECT id, username, pin_hash, token FROM users WHERE username = ?');
    const row = stmt.get(username) as User | undefined;
    return row ?? null;
  }

  findByToken(token: string): User | null {
    const stmt = this.db.prepare('SELECT id, username, pin_hash, token FROM users WHERE token = ?');
    const row = stmt.get(token) as User | undefined;
    return row ?? null;
  }

  create(username: string, pinHash: string, token: string): User {
    const stmt = this.db.prepare('INSERT INTO users (username, pin_hash, token) VALUES (?, ?, ?)');
    stmt.run(username, pinHash, token);
    const lastIdRow = this.db.prepare('SELECT last_insert_rowid() AS id').get() as { id: number };
    return { id: lastIdRow.id, username, token };
  }

  updateToken(id: number, token: string): void {
    const stmt = this.db.prepare('UPDATE users SET token = ? WHERE id = ?');
    stmt.run(token, id);
  }

  delete(id: number): void {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
  }
}
