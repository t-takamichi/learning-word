import { Hono } from 'hono';
import type { AppEnv } from '../index';

const routes = new Hono<AppEnv>().get('/', (c) => {
  const userId = Number(c.req.query('userId'));
  const wordSetId = Number(c.req.query('wordSetId'));
  if (isNaN(userId) || isNaN(wordSetId)) {
    return c.json({ error: 'userId and wordSetId are required' }, 400);
  }
  const useCase = c.get('getSessionUseCase');
  const words = useCase.execute(userId, wordSetId);
  return c.json(words);
});

export const sessionRoutes = routes;
