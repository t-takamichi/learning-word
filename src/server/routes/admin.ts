import { Hono } from 'hono';
import { basicAuth } from 'hono/basic-auth';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { WordInputSchema, WordPartialInputSchema } from '../schemas/wordInput';
import type {
  GetAdminWordsUseCase,
  CreateWordUseCase,
  UpdateWordUseCase,
  DeleteWordUseCase,
} from '../usecases/adminWord';
import type { AppEnv } from '../index';

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

const routes = new Hono<AppEnv>()
  .use(
    '*',
    basicAuth({
      username: process.env['ADMIN_USER'] ?? 'admin',
      password: process.env['ADMIN_PASS'] ?? 'changeme',
    })
  )
  .get('/words', (c) => {
    const words = c.get('getAdminWordsUseCase').execute();
    return c.json(words);
  })
  .post('/words', zValidator('json', WordInputSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          message: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        },
        400
      );
    }
  }), (c) => {
    const input = c.req.valid('json');
    const word = c.get('createWordUseCase').execute({
      word_set_id: input.word_set_id,
      english: input.english,
      vietnamese: input.vietnamese,
      japanese: input.japanese,
      example_en: input.example_en ?? null,
      example_vi: input.example_vi ?? null,
      example_ja: input.example_ja ?? null,
    });
    return c.json(word, 201);
  })

  .put(
    '/words/:id',
    zValidator('param', idParamSchema, (result, c) => {
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
    (c) => {
      const { id } = c.req.valid('param');
      const input = c.req.valid('json');
      try {
        const word = c.get('updateWordUseCase').execute(id, input);
        return c.json(word);
      } catch {
        return c.json({ success: false, message: '単語が見つかりません' }, 404);
      }
    }
  )
  .delete(
    '/words/:id',
    zValidator('param', idParamSchema, (result, c) => {
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
      const { id } = c.req.valid('param');
      try {
        c.get('deleteWordUseCase').execute(id);
        return c.json({ ok: true });
      } catch {
        return c.json({ success: false, message: '単語が見つかりません' }, 404);
      }
    }
  )
  .get(
    '/dictionary/search',
    zValidator('query', z.object({ q: z.string().default('') }), (result, c) => {
      if (!result.success) {
        return c.json({ success: false, message: '不正なクエリです' }, 400);
      }
    }),
    (c) => {
      const { q } = c.req.valid('query');
      const results = c.get('searchDictionaryUseCase').execute(q);
      return c.json(results);
    }
  )
  .get(
    '/dictionary/lookup',
    zValidator('query', z.object({ english: z.string().min(1) }), (result, c) => {
      if (!result.success) {
        return c.json({ success: false, message: '英単語は必須です' }, 400);
      }
    }),
    (c) => {
      const { english } = c.req.valid('query');
      const word = c.get('lookupDictionaryUseCase').execute(english);
      return c.json(word);
    }
  );

export const adminRoutes = routes;

