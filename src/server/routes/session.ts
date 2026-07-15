import { Hono } from 'hono';
import type { AppEnv } from '../index';

const routes = new Hono<AppEnv>().get('/', (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const userId = user.id;
  const wordSetId = Number(c.req.query('wordSetId'));
  if (isNaN(wordSetId)) {
    return c.json({ error: 'wordSetId is required' }, 400);
  }
  const useCase = c.get('getSessionUseCase');
  const words = useCase.execute(userId, wordSetId);
  return c.json(words);
});

export const sessionRoutes = routes;
