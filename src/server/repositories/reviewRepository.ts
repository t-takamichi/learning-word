import type { DB } from '../db';
import type { IReviewRepository, CurrentProgress, NextProgress, LearningStatus } from '../domain/review';

type DBRow = {
  readonly status: string;
  readonly review_count: number;
  readonly incorrect_count: number;
};

export class ReviewRepository implements IReviewRepository {
  constructor(private readonly db: DB) {}

  getProgress(userId: number, wordId: number): CurrentProgress | null {
    const row = this.db.prepare(
      'SELECT status, review_count, incorrect_count FROM learning_progress WHERE user_id = ? AND word_id = ?'
    ).get(userId, wordId) as DBRow | undefined;

    if (!row) {
      return null;
    }

    return {
      status: row.status as LearningStatus,
      reviewCount: row.review_count,
      incorrectCount: row.incorrect_count,
    };
  }

  upsertProgress(userId: number, wordId: number, progress: NextProgress): void {
    this.db.prepare(`
      INSERT OR REPLACE INTO learning_progress
        (user_id, word_id, status, review_count, incorrect_count, last_reviewed_at)
      VALUES
        (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      userId,
      wordId,
      progress.status,
      progress.reviewCount,
      progress.incorrectCount
    );
  }
}
