import type { DB } from '../db';
import type { IAdminWordRepository } from '../domain/adminWord';
import type { Word, WordInput } from '@shared/types';

export class AdminWordRepository implements IAdminWordRepository {
  constructor(private readonly db: DB) {}

  findAll(): readonly Word[] {
    return this.db.prepare('SELECT * FROM words ORDER BY id DESC').all() as Word[];
  }

  findById(id: number): Word | null {
    return (this.db.prepare('SELECT * FROM words WHERE id = ?').get(id) as Word | undefined) ?? null;
  }

  create(input: WordInput): Word {
    const stmt = this.db.prepare(`
      INSERT INTO words (word_set_id, english, vietnamese, japanese, example_en, example_vi, example_ja)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);
    const row = stmt.get(
      input.word_set_id,
      input.english,
      input.vietnamese,
      input.japanese,
      input.example_en ?? null,
      input.example_vi ?? null,
      input.example_ja ?? null
    ) as Word | undefined;

    if (!row) {
      throw new Error('単語の作成に失敗しました');
    }
    return row;
  }

  update(id: number, input: Partial<WordInput>): Word | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const merged: WordInput = {
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
      WHERE id = ?
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
      id
    ) as Word | undefined) ?? null;
  }


  delete(id: number): boolean {
    const result = this.db.prepare('DELETE FROM words WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
