import type { IAdminWordRepository } from '../domain/adminWord';
import type { Word, WordInput } from '@shared/types';

export class GetAdminWordsUseCase {
  constructor(private readonly repo: IAdminWordRepository) {}

  execute(): readonly Word[] {
    return this.repo.findAll();
  }
}

export class CreateWordUseCase {
  constructor(private readonly repo: IAdminWordRepository) {}

  execute(input: WordInput): Word {
    return this.repo.create(input);
  }
}

export class UpdateWordUseCase {
  constructor(private readonly repo: IAdminWordRepository) {}

  execute(id: number, input: Partial<WordInput>): Word {
    const updated = this.repo.update(id, input);
    if (!updated) throw new Error('Word not found');
    return updated;
  }
}

export class DeleteWordUseCase {
  constructor(private readonly repo: IAdminWordRepository) {}

  execute(id: number): void {
    const deleted = this.repo.delete(id);
    if (!deleted) throw new Error('Word not found');
  }
}
