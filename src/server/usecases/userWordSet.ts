import type { IUserWordSetRepository, WordSetInput } from '../domain/userWordSet';
import type { WordSet } from '../repositories/wordSetRepository';

export class MaxWordSetRegistrationLimitReachedError extends Error {
  constructor(message: string = '単語セットの登録上限に達しました') {
    super(message);
    this.name = 'MaxWordSetRegistrationLimitReachedError';
  }
}

export class CreateUserWordSetUseCase {
  constructor(
    private readonly repo: IUserWordSetRepository,
    private readonly maxLimit: number = 50
  ) {}

  execute(userId: number, input: WordSetInput): WordSet {
    if (this.repo.countByUser(userId) >= this.maxLimit) {
      throw new MaxWordSetRegistrationLimitReachedError(
        'いまはここまで！よくがんばったね。新しく追加するまえに、いまの単語セットをたくさん復習してあげよう🌸'
      );
    }

    return this.repo.create(userId, input);
  }
}

export class UpdateUserWordSetUseCase {
  constructor(private readonly repo: IUserWordSetRepository) {}

  execute(userId: number, id: number, input: Partial<WordSetInput>): WordSet {
    const updated = this.repo.update(userId, id, input);
    if (!updated) throw new Error('WordSet not found');
    return updated;
  }
}

export class DeleteUserWordSetUseCase {
  constructor(private readonly repo: IUserWordSetRepository) {}

  execute(userId: number, id: number): void {
    const deleted = this.repo.delete(userId, id);
    if (!deleted) throw new Error('WordSet not found');
  }
}
