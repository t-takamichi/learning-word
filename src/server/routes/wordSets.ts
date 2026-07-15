import { Hono } from 'hono';
import { WordSetRepository } from '../repositories/wordSetRepository';
import type { DB } from '../db';
import type { AppEnv } from '../index';

export function createWordSetsRoute(db: DB) {
  const repo = new WordSetRepository(db);

  return new Hono<AppEnv>()
    .get('/', (c) => {
      const user = c.get('user');
      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const userId = user.id;
      const sets = repo.getWordSetsForUser(userId);
      return c.json(sets);
    });
}
