import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '../index';

const routes = new Hono<AppEnv>()
  .get(
    '/search',
    zValidator('query', z.object({ q: z.string().default('') }), (result, c) => {
      if (!result.success) {
        return c.json({ success: false, message: '不正なクエリです' }, 400);
      }
    }),
    (c) => {
      const user = c.get('user');
      if (!user) return c.json({ error: 'Unauthorized' }, 401);

      const { q } = c.req.valid('query');
      const results = c.get('searchDictionaryUseCase').execute(q);
      return c.json(results);
    }
  )
  .get(
    '/lookup',
    zValidator('query', z.object({ english: z.string().min(1) }), (result, c) => {
      if (!result.success) {
        return c.json({ success: false, message: '英単語は必須です' }, 400);
      }
    }),
    (c) => {
      const user = c.get('user');
      if (!user) return c.json({ error: 'Unauthorized' }, 401);

      const { english } = c.req.valid('query');
      const word = c.get('lookupDictionaryUseCase').execute(english);
      return c.json(word);
    }
  );

export const dictionaryRoutes = routes;
