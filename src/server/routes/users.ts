import { Hono } from 'hono';
import { UserRepository } from '../repositories/userRepository';
import type { DB } from '../db';

export function createUsersRoute(db: DB) {
  const repo = new UserRepository(db);

  return new Hono()
    .get('/', (c) => {
      const users = repo.getAll();
      return c.json(users);
    })
    .post('/', async (c) => {
      const { username } = await c.req.json<{ username: string }>();
      if (!username || !username.trim()) {
        return c.json({ error: 'Username is required' }, 400);
      }
      try {
        const user = repo.create(username.trim());
        return c.json(user, 201);
      } catch (e) {
        return c.json({ error: 'Username already exists' }, 409);
      }
    })
    .delete('/:id', (c) => {
      const id = Number(c.req.param('id'));
      repo.delete(id);
      return c.json({ success: true });
    });
}
