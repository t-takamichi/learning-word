import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '../index';

const reviewSchema = z.object({
  wordId: z.number().int().positive(),
  result: z.enum(['good', 'again']),
});

const routes = new Hono<AppEnv>().post(
  '/',
  zValidator('json', reviewSchema, (result, c) => {
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
    const { wordId, result } = c.req.valid('json');
    const useCase = c.get('submitReviewUseCase');
    useCase.execute({ userId, wordId, result });
    return c.json({ ok: true } as const);
  }
);

export const reviewRoutes = routes;
