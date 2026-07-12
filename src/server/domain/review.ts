export type ReviewResult = 'good' | 'again';
export type LearningStatus = 'new' | 'weak' | 'mastered';

export interface CurrentProgress {
  readonly status: LearningStatus;
  readonly reviewCount: number;
  readonly incorrectCount: number;
}

export interface NextProgress {
  readonly status: LearningStatus;
  readonly reviewCount: number;
  readonly incorrectCount: number;
}

export interface IReviewRepository {
  getProgress(userId: number, wordId: number): CurrentProgress | null;
  upsertProgress(userId: number, wordId: number, progress: NextProgress): void;
}

export function calculateNextProgress(
  current: CurrentProgress | null,
  result: ReviewResult,
): NextProgress {
  const base: CurrentProgress = current ?? { status: 'new', reviewCount: 0, incorrectCount: 0 };

  if (result === 'again') {
    return {
      status: 'weak',
      reviewCount: base.reviewCount,
      incorrectCount: base.incorrectCount + 1,
    };
  }

  // ⭕ Good を押した場合: 前の状態にかかわらず、即座に status を 'mastered' とする。
  return {
    status: 'mastered',
    reviewCount: base.reviewCount + 1,
    incorrectCount: base.incorrectCount,
  };
}

