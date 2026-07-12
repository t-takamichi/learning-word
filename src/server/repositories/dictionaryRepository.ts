import type { DB } from '../db';
import type { IDictionaryRepository } from '../domain/dictionary';
import type { DictionaryWord } from '@shared/types';

export class DictionaryRepository implements IDictionaryRepository {
  constructor(private readonly db: DB) {}

  search(query: string, limit: number = 10): readonly string[] {
    const stmt = this.db.prepare(`
      SELECT english 
      FROM dictionary_words 
      WHERE english LIKE ? 
      ORDER BY english ASC 
      LIMIT ?
    `);
    const rows = stmt.all(`${query}%`, limit) as { english: string }[];
    return rows.map((r) => r.english);
  }

  findByEnglish(english: string): DictionaryWord | null {
    const stmt = this.db.prepare(`
      SELECT * 
      FROM dictionary_words 
      WHERE english = ?
    `);
    const row = stmt.get(english) as DictionaryWord | undefined;
    return row ?? null;
  }
}
