import { DB } from '../db';

export interface WordSet {
  id: number;
  name: string;
  levelTag: 'basic' | 'intermediate' | 'advanced';
  description: string | null;
  progress: {
    total: number;
    mastered: number;
  };
}

export class WordSetRepository {
  constructor(private db: DB) {}

  getWordSetsForUser(userId: number): WordSet[] {
    const stmtSets = this.db.prepare('SELECT id, name, level_tag, description FROM word_sets');
    const sets = stmtSets.all() as { id: number; name: string; level_tag: string; description: string | null }[];

    return sets.map(set => {
      const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM words WHERE word_set_id = ?');
      const totalRow = totalStmt.get(set.id) as { count: number };
      const total = totalRow.count;

      const masteredStmt = this.db.prepare(
        `SELECT COUNT(*) as count FROM learning_progress lp 
         INNER JOIN words w ON lp.word_id = w.id 
         WHERE lp.user_id = ? AND w.word_set_id = ? AND lp.status = 'mastered'`
      );
      const masteredRow = masteredStmt.get(userId, set.id) as { count: number };
      const mastered = masteredRow.count;

      return {
        id: set.id,
        name: set.name,
        levelTag: set.level_tag as 'basic' | 'intermediate' | 'advanced',
        description: set.description,
        progress: {
          total,
          mastered
        }
      };
    });
  }
}
