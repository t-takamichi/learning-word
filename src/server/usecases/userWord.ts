import type { IUserWordRepository } from '../domain/userWord';
import type { IWordSetVisibilityChecker } from '../domain/wordSetVisibility';
import type { Word, WordInput } from '@shared/types';

export class MaxRegistrationLimitReachedError extends Error {
  constructor(message: string = '単語の登録上限に達しました') {
    super(message);
    this.name = 'MaxRegistrationLimitReachedError';
  }
}

export class WordSetNotVisibleError extends Error {
  constructor(message: string = '単語セットが見つかりません') {
    super(message);
    this.name = 'WordSetNotVisibleError';
  }
}

export class CreateUserWordUseCase {
  constructor(
    private readonly repo: IUserWordRepository,
    private readonly wordSetVisibility: IWordSetVisibilityChecker,
    private readonly maxLimit: number = 500
  ) {}

  execute(userId: number, input: WordInput): Word {
    if (!this.wordSetVisibility.isVisibleToUser(input.word_set_id, userId)) {
      throw new WordSetNotVisibleError();
    }

    if (this.repo.countByUser(userId) >= this.maxLimit) {
      throw new MaxRegistrationLimitReachedError(
        'いまはここまで！よくがんばったね。新しく追加するまえに、いまの単語をたくさん復習してあげよう🌸'
      );
    }

    return this.repo.create(userId, input);
  }
}

export class UpdateUserWordUseCase {
  constructor(
    private readonly repo: IUserWordRepository,
    private readonly wordSetVisibility: IWordSetVisibilityChecker
  ) {}

  execute(userId: number, id: number, input: Partial<WordInput>): Word {
    if (input.word_set_id !== undefined && !this.wordSetVisibility.isVisibleToUser(input.word_set_id, userId)) {
      throw new WordSetNotVisibleError();
    }

    const updated = this.repo.update(userId, id, input);
    if (!updated) throw new Error('Word not found');
    return updated;
  }
}

export class DeleteUserWordUseCase {
  constructor(private readonly repo: IUserWordRepository) {}

  execute(userId: number, id: number): void {
    const deleted = this.repo.delete(userId, id);
    if (!deleted) throw new Error('Word not found');
  }
}
