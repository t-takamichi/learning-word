import type { DB } from '../db';
import type { IWordRepository, GetWordsResult } from '../domain/word';
import type { Word, WordWithProgress } from '@shared/types';

type WordRow = Word & {
  readonly status: 'new' | 'weak' | 'mastered';
  readonly review_count: number;
  readonly incorrect_count: number;
  readonly last_reviewed_at: string | null;
};

type CountRow = { readonly total: number };

export class WordRepository implements IWordRepository {
  constructor(private readonly db: DB) {}

  getSession(userId: number, wordSetId: number): readonly Word[] {
    // 優先枠 4件: weak / 未学習 / incorrect_count > 0 (特定のユーザーと単語セットに限定)
    const priority = this.db.prepare(`
      SELECT w.* FROM words w
      LEFT JOIN learning_progress p ON w.id = p.word_id AND p.user_id = ?
      WHERE w.word_set_id = ? AND (w.created_by IS NULL OR w.created_by = ?) AND (p.word_id IS NULL OR p.status = 'weak' OR p.incorrect_count > 0)
      ORDER BY COALESCE(p.incorrect_count, 999) DESC, RANDOM()
      LIMIT 4
    `).all(userId, wordSetId, userId) as Word[];

    const priorityIds = priority.map((w) => w.id);
    const placeholders = priorityIds.length > 0
      ? priorityIds.map(() => '?').join(',')
      : '0';

    // 通常枠 6件: 優先枠を除く (特定の単語セットに限定)
    const normal = this.db.prepare(`
      SELECT w.* FROM words w
      WHERE w.word_set_id = ? AND (w.created_by IS NULL OR w.created_by = ?) AND w.id NOT IN (${placeholders})
      ORDER BY RANDOM()
      LIMIT 6
    `).all(wordSetId, userId, ...priorityIds) as Word[];

    return [...priority, ...normal];
  }

  getWords(userId: number, wordSetId: number, page: number, limit: number): GetWordsResult {
    const offset = (page - 1) * limit;

    const rows = this.db.prepare(`
      SELECT
        w.*,
        COALESCE(p.status, 'new')            AS status,
        COALESCE(p.review_count, 0)          AS review_count,
        COALESCE(p.incorrect_count, 0)       AS incorrect_count,
        p.last_reviewed_at
      FROM words w
      LEFT JOIN learning_progress p ON w.id = p.word_id AND p.user_id = ?
      WHERE w.word_set_id = ? AND (w.created_by IS NULL OR w.created_by = ?)
      ORDER BY w.id ASC
      LIMIT ? OFFSET ?
    `).all(userId, wordSetId, userId, limit, offset) as WordRow[];

    const countRow = this.db.prepare(
      'SELECT COUNT(*) AS total FROM words WHERE word_set_id = ? AND (created_by IS NULL OR created_by = ?)'
    ).get(wordSetId, userId) as CountRow | undefined;

    const total = countRow?.total ?? 0;

    const words: WordWithProgress[] = rows.map((row) => ({
      id: row.id,
      word_set_id: row.word_set_id,
      english: row.english,
      vietnamese: row.vietnamese,
      japanese: row.japanese,
      example_en: row.example_en,
      example_vi: row.example_vi,
      example_ja: row.example_ja,
      created_by: row.created_by,
      created_at: row.created_at,
      progress: {
        word_id: row.id,
        status: row.status,
        review_count: row.review_count,
        incorrect_count: row.incorrect_count,
        last_reviewed_at: row.last_reviewed_at,
      },
    }));


    return { words, total };
  }
}
