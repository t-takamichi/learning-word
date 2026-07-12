import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '../index';

const querySchema = z.object({
  userId: z.coerce.number().int().min(1),
  wordSetId: z.coerce.number().int().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const routes = new Hono<AppEnv>().get(
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
    const { userId, wordSetId, page, limit } = c.req.valid('query');
    const useCase = c.get('getWordsUseCase');
    const result = useCase.execute(userId, wordSetId, page, limit);
    return c.json(result);
  }
);

export const wordsRoutes = routes;
