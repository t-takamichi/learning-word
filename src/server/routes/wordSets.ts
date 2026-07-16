import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { WordSetRepository } from '../repositories/wordSetRepository';
import { UserWordSetRepository } from '../repositories/userWordSetRepository';
import { CreateUserWordSetUseCase, UpdateUserWordSetUseCase, DeleteUserWordSetUseCase, MaxWordSetRegistrationLimitReachedError } from '../usecases/userWordSet';
import { WordSetInputSchema, WordSetPartialInputSchema } from '../schemas/wordSetInput';
import type { DB } from '../db';
import type { AppEnv } from '../index';

export function createWordSetsRoute(db: DB) {
  const repo = new WordSetRepository(db);
  const userRepo = new UserWordSetRepository(db);
  const createUseCase = new CreateUserWordSetUseCase(userRepo);
  const updateUseCase = new UpdateUserWordSetUseCase(userRepo);
  const deleteUseCase = new DeleteUserWordSetUseCase(userRepo);

  return new Hono<AppEnv>()
    .get('/', (c) => {
      const user = c.get('user');
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const userId = user.id;
      const sets = repo.getWordSetsForUser(userId);
      return c.json(sets);
    })
    .post(
      '/',
      zValidator('json', WordSetInputSchema, (result, c) => {
        if (!result.success) {
          return c.json(
            {
              success: false,
              message: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
            },
            400
          );
        }
      }),
      async (c) => {
        const user = c.get('user');
        if (!user) return c.json({ error: 'Unauthorized' }, 401);
        const userId = user.id;
        const input = c.req.valid('json');

        try {
          const result = createUseCase.execute(userId, input);
          return c.json(result);
        } catch (err) {
          if (err instanceof MaxWordSetRegistrationLimitReachedError) {
            return c.json({ success: false, message: err.message }, 400);
          }
          throw err;
        }
      }
    )
    .put(
      '/:id',
      zValidator('json', WordSetPartialInputSchema, (result, c) => {
        if (!result.success) {
          return c.json(
            {
              success: false,
              message: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
            },
            400
          );
        }
      }),
      async (c) => {
        const user = c.get('user');
        if (!user) return c.json({ error: 'Unauthorized' }, 401);
        const userId = user.id;
        const id = Number(c.req.param('id'));
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
        const input = c.req.valid('json');

        try {
          const result = updateUseCase.execute(userId, id, input);
          return c.json(result);
        } catch (err) {
          return c.json({ success: false, message: '単語セットが見つかりません' }, 404);
        }
      }
    )
    .delete(
      '/:id',
      async (c) => {
        const user = c.get('user');
        if (!user) return c.json({ error: 'Unauthorized' }, 401);
        const userId = user.id;
        const id = Number(c.req.param('id'));
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        try {
          deleteUseCase.execute(userId, id);
          return c.json({ success: true });
        } catch (err) {
          return c.json({ success: false, message: '単語セットが見つかりません' }, 404);
        }
      }
    );
}
