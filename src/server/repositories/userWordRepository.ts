import type { DB } from '../db';
import type { IUserWordRepository } from '../domain/userWord';
import type { Word, WordInput } from '@shared/types';

export class UserWordRepository implements IUserWordRepository {
  constructor(private readonly db: DB) {}

  create(userId: number, input: WordInput): Word {
    const stmt = this.db.prepare(`
      INSERT INTO words (word_set_id, english, vietnamese, japanese, example_en, example_vi, example_ja, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);
    const row = stmt.get(
      input.word_set_id,
      input.english,
      input.vietnamese,
      input.japanese,
      input.example_en ?? null,
      input.example_vi ?? null,
      input.example_ja ?? null,
      userId
    ) as Word | undefined;

    if (!row) {
      throw new Error('単語の作成に失敗しました');
    }
    return row;
  }

  update(userId: number, id: number, input: Partial<WordInput>): Word | null {
    const existing = this.db.prepare('SELECT * FROM words WHERE id = ? AND created_by = ?').get(id, userId) as Word | undefined;
    if (!existing) return null;

    const merged = {
      word_set_id: input.word_set_id ?? existing.word_set_id,
      english: input.english ?? existing.english,
      vietnamese: input.vietnamese ?? existing.vietnamese,
      japanese: input.japanese ?? existing.japanese,
      example_en: 'example_en' in input ? (input.example_en ?? null) : existing.example_en,
      example_vi: 'example_vi' in input ? (input.example_vi ?? null) : existing.example_vi,
      example_ja: 'example_ja' in input ? (input.example_ja ?? null) : existing.example_ja,
    };

    const stmt = this.db.prepare(`
      UPDATE words
      SET word_set_id = ?, english = ?, vietnamese = ?, japanese = ?,
          example_en = ?, example_vi = ?, example_ja = ?
      WHERE id = ? AND created_by = ?
      RETURNING *
    `);
    return (stmt.get(
      merged.word_set_id,
      merged.english,
      merged.vietnamese,
      merged.japanese,
      merged.example_en,
      merged.example_vi,
      merged.example_ja,
      id,
      userId
    ) as Word | undefined) ?? null;
  }

  delete(userId: number, id: number): boolean {
    const result = this.db.prepare('DELETE FROM words WHERE id = ? AND created_by = ?').run(id, userId);
    return result.changes > 0;
  }

  countByUser(userId: number): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM words WHERE created_by = ?').get(userId) as { count: number } | undefined;
    return row?.count ?? 0;
  }
}
