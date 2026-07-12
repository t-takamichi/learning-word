import { DB } from '../db';

export interface User {
  id: number;
  username: string;
}

export class UserRepository {
  constructor(private db: DB) {}

  getAll(): User[] {
    const stmt = this.db.prepare('SELECT id, username FROM users ORDER BY created_at ASC');
    return stmt.all() as unknown as User[];
  }

  create(username: string): User {
    const stmt = this.db.prepare('INSERT INTO users (username) VALUES (?)');
    stmt.run(username);
    const lastIdRow = this.db.prepare('SELECT last_insert_rowid() AS id').get() as { id: number };
    return { id: lastIdRow.id, username };
  }

  delete(id: number): void {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
  }
}
