import type { IReviewRepository, ReviewResult } from '../domain/review';
import { calculateNextProgress } from '../domain/review';

export interface SubmitReviewInput {
  readonly userId: number;
  readonly wordId: number;
  readonly result: ReviewResult;
}

export class SubmitReviewUseCase {
  constructor(private readonly reviewRepo: IReviewRepository) {}

  execute(input: SubmitReviewInput): void {
    const current = this.reviewRepo.getProgress(input.userId, input.wordId);
    const next = calculateNextProgress(current, input.result);
    this.reviewRepo.upsertProgress(input.userId, input.wordId, next);
  }
}
