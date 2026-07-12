import { Hono } from 'hono';
import { WordSetRepository } from '../repositories/wordSetRepository';
import type { DB } from '../db';

export function createWordSetsRoute(db: DB) {
  const repo = new WordSetRepository(db);

  return new Hono()
    .get('/', (c) => {
      const userId = Number(c.req.query('userId'));
      if (isNaN(userId)) {
        return c.json({ error: 'userId parameter is required' }, 400);
      }
      const sets = repo.getWordSetsForUser(userId);
      return c.json(sets);
    });
}
