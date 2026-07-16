import type { DB } from '../db';
import type { IUserWordSetRepository, WordSetInput } from '../domain/userWordSet';
import type { WordSet } from './wordSetRepository';

export class UserWordSetRepository implements IUserWordSetRepository {
  constructor(private readonly db: DB) {}

  create(userId: number, input: WordSetInput): WordSet {
    const stmt = this.db.prepare(`
      INSERT INTO word_sets (name, level_tag, description, created_by)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `);
    const row = stmt.get(
      input.name,
      input.level_tag,
      input.description ?? null,
      userId
    ) as { id: number; name: string; level_tag: string; description: string | null; created_by: number | null } | undefined;

    if (!row) {
      throw new Error('単語セットの作成に失敗しました');
    }

    return {
      id: row.id,
      name: row.name,
      levelTag: row.level_tag as 'basic' | 'intermediate' | 'advanced',
      description: row.description,
      createdBy: row.created_by,
      progress: { total: 0, mastered: 0 }
    };
  }

  update(userId: number, id: number, input: Partial<WordSetInput>): WordSet | null {
    const existing = this.db.prepare('SELECT * FROM word_sets WHERE id = ? AND created_by = ?').get(id, userId) as { id: number; name: string; level_tag: string; description: string | null; created_by: number | null } | undefined;
    if (!existing) return null;

    const merged = {
      name: input.name ?? existing.name,
      level_tag: input.level_tag ?? existing.level_tag,
      description: 'description' in input ? (input.description ?? null) : existing.description,
    };

    const stmt = this.db.prepare(`
      UPDATE word_sets
      SET name = ?, level_tag = ?, description = ?
      WHERE id = ? AND created_by = ?
      RETURNING *
    `);
    const row = stmt.get(
      merged.name,
      merged.level_tag,
      merged.description,
      id,
      userId
    ) as { id: number; name: string; level_tag: string; description: string | null; created_by: number | null } | undefined;

    if (!row) return null;

    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM words WHERE word_set_id = ? AND (created_by IS NULL OR created_by = ?)');
    const totalRow = totalStmt.get(id, userId) as { count: number };
    const total = totalRow.count;

    const masteredStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM learning_progress lp 
      INNER JOIN words w ON lp.word_id = w.id 
      WHERE lp.user_id = ? AND w.word_set_id = ? AND lp.status = 'mastered' AND (w.created_by IS NULL OR w.created_by = ?)
    `);
    const masteredRow = masteredStmt.get(userId, id, userId) as { count: number };
    const mastered = masteredRow.count;

    return {
      id: row.id,
      name: row.name,
      levelTag: row.level_tag as 'basic' | 'intermediate' | 'advanced',
      description: row.description,
      createdBy: row.created_by,
      progress: { total, mastered }
    };
  }

  delete(userId: number, id: number): boolean {
    const result = this.db.prepare('DELETE FROM word_sets WHERE id = ? AND created_by = ?').run(id, userId);
    return result.changes > 0;
  }

  countByUser(userId: number): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM word_sets WHERE created_by = ?').get(userId) as { count: number } | undefined;
    return row?.count ?? 0;
  }
}
