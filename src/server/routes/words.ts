import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '../index';
import { WordInputSchema, WordPartialInputSchema } from '../schemas/wordInput';
import { MaxRegistrationLimitReachedError, WordSetNotVisibleError } from '../usecases/userWord';

const querySchema = z.object({
  wordSetId: z.coerce.number().int().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const routes = new Hono<AppEnv>()
  .get(
    '/',
    zValidator('query', querySchema, (result, c) => {
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
    (c) => {
      const user = c.get('user');
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const userId = user.id;
      const { wordSetId, page, limit } = c.req.valid('query');
      const useCase = c.get('getWordsUseCase');
      const result = useCase.execute(userId, wordSetId, page, limit);
      return c.json(result);
    }
  )
  .post(
    '/',
    zValidator('json', WordInputSchema, (result, c) => {
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

      const useCase = c.get('createUserWordUseCase');
      if (!useCase) return c.json({ error: 'UseCase not configured' }, 500);

      try {
        const result = useCase.execute(userId, {
          word_set_id: input.word_set_id,
          english: input.english,
          vietnamese: input.vietnamese,
          japanese: input.japanese,
          example_en: input.example_en ?? null,
          example_vi: input.example_vi ?? null,
          example_ja: input.example_ja ?? null,
        });
        return c.json(result);
      } catch (err) {
        if (err instanceof MaxRegistrationLimitReachedError || err instanceof WordSetNotVisibleError) {
          return c.json({ success: false, message: err.message }, 400);
        }
        throw err;
      }
    }
  )
  .put(
    '/:id',
    zValidator('json', WordPartialInputSchema, (result, c) => {
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

      const useCase = c.get('updateUserWordUseCase');
      if (!useCase) return c.json({ error: 'UseCase not configured' }, 500);

      try {
        const result = useCase.execute(userId, id, {
          word_set_id: input.word_set_id,
          english: input.english,
          vietnamese: input.vietnamese,
          japanese: input.japanese,
          example_en: input.example_en === undefined ? undefined : (input.example_en ?? null),
          example_vi: input.example_vi === undefined ? undefined : (input.example_vi ?? null),
          example_ja: input.example_ja === undefined ? undefined : (input.example_ja ?? null),
        });
        return c.json(result);
      } catch (err) {
        if (err instanceof WordSetNotVisibleError) {
          return c.json({ success: false, message: err.message }, 400);
        }
        return c.json({ success: false, message: '単語が見つかりません' }, 404);
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

      const useCase = c.get('deleteUserWordUseCase');
      if (!useCase) return c.json({ error: 'UseCase not configured' }, 500);

      try {
        useCase.execute(userId, id);
        return c.json({ success: true });
      } catch (err) {
        return c.json({ success: false, message: '単語が見つかりません' }, 404);
      }
    }
  );

export const wordsRoutes = routes;
