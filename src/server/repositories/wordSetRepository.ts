import { DB } from '../db';
import type { IWordSetVisibilityChecker } from '../domain/wordSetVisibility';

export interface WordSet {
  id: number;
  name: string;
  levelTag: 'basic' | 'intermediate' | 'advanced';
  description: string | null;
  createdBy: number | null;
  progress: {
    total: number;
    mastered: number;
  };
}

export class WordSetRepository implements IWordSetVisibilityChecker {
  constructor(private db: DB) {}

  isVisibleToUser(wordSetId: number, userId: number): boolean {
    const row = this.db
      .prepare('SELECT 1 FROM word_sets WHERE id = ? AND (created_by IS NULL OR created_by = ?) LIMIT 1')
      .get(wordSetId, userId);
    return row !== undefined;
  }

  getWordSetsForUser(userId: number): WordSet[] {
    const stmtSets = this.db.prepare(
      'SELECT id, name, level_tag, description, created_by FROM word_sets WHERE (created_by IS NULL OR created_by = ?)'
    );
    const sets = stmtSets.all(userId) as { id: number; name: string; level_tag: string; description: string | null; created_by: number | null }[];

    return sets.map(set => {
      const totalStmt = this.db.prepare(
        'SELECT COUNT(*) as count FROM words WHERE word_set_id = ? AND (created_by IS NULL OR created_by = ?)'
      );
      const totalRow = totalStmt.get(set.id, userId) as { count: number };
      const total = totalRow.count;

      const masteredStmt = this.db.prepare(
        `SELECT COUNT(*) as count FROM learning_progress lp 
         INNER JOIN words w ON lp.word_id = w.id 
         WHERE lp.user_id = ? AND w.word_set_id = ? AND lp.status = 'mastered' AND (w.created_by IS NULL OR w.created_by = ?)`
      );
      const masteredRow = masteredStmt.get(userId, set.id, userId) as { count: number };
      const mastered = masteredRow.count;

      return {
        id: set.id,
        name: set.name,
        levelTag: set.level_tag as 'basic' | 'intermediate' | 'advanced',
        description: set.description,
        createdBy: set.created_by,
        progress: {
          total,
          mastered
        }
      };
    });
  }
}
