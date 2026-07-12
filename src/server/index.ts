import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { HTTPException } from 'hono/http-exception';
import { createDatabase } from './db';
import { WordRepository } from './repositories/wordRepository';
import { GetSessionUseCase } from './usecases/getSession';
import { sessionRoutes } from './routes/session';
import { ReviewRepository } from './repositories/reviewRepository';
import { SubmitReviewUseCase } from './usecases/submitReview';
import { reviewRoutes } from './routes/review';
import { GetWordsUseCase } from './usecases/getWords';
import { wordsRoutes } from './routes/words';
import { AdminWordRepository } from './repositories/adminWordRepository';
import {
  GetAdminWordsUseCase,
  CreateWordUseCase,
  UpdateWordUseCase,
  DeleteWordUseCase,
} from './usecases/adminWord';
import { adminRoutes } from './routes/admin';
import { ttsRoutes } from './routes/tts';
import { ensurePiperReady } from './services/ttsService';
import { DictionaryRepository } from './repositories/dictionaryRepository';
import { SearchDictionaryUseCase, LookupDictionaryUseCase } from './usecases/dictionary';


export type AppEnv = {
  Variables: {
    getSessionUseCase: GetSessionUseCase;
    submitReviewUseCase: SubmitReviewUseCase;
    getWordsUseCase: GetWordsUseCase;
    getAdminWordsUseCase: GetAdminWordsUseCase;
    createWordUseCase: CreateWordUseCase;
    updateWordUseCase: UpdateWordUseCase;
    deleteWordUseCase: DeleteWordUseCase;
    searchDictionaryUseCase: SearchDictionaryUseCase;
    lookupDictionaryUseCase: LookupDictionaryUseCase;
  };
};

const db = createDatabase();
const wordRepo = new WordRepository(db);
const getSessionUseCase = new GetSessionUseCase(wordRepo);
const getWordsUseCase = new GetWordsUseCase(wordRepo);

const reviewRepo = new ReviewRepository(db);
const submitReviewUseCase = new SubmitReviewUseCase(reviewRepo);

const adminWordRepo = new AdminWordRepository(db);
const getAdminWordsUseCase = new GetAdminWordsUseCase(adminWordRepo);
const createWordUseCase = new CreateWordUseCase(adminWordRepo);
const updateWordUseCase = new UpdateWordUseCase(adminWordRepo);
const deleteWordUseCase = new DeleteWordUseCase(adminWordRepo);

const dictionaryRepo = new DictionaryRepository(db);
const searchDictionaryUseCase = new SearchDictionaryUseCase(dictionaryRepo);
const lookupDictionaryUseCase = new LookupDictionaryUseCase(dictionaryRepo);

// Pre-warm Piper TTS in background so first request is fast
ensurePiperReady().catch((err) => {
  console.error('Failed to pre-warm Piper TTS:', err);
});

const app = new Hono<AppEnv>();

app.onError((err, c) => {
  console.error(err);
  if (err instanceof HTTPException) {
    return c.json({ success: false, message: err.message }, err.status);
  }
  return c.json({ success: false, message: 'Internal Server Error' }, 500);
});

app.use('/api/*', async (c, next) => {
  c.set('getSessionUseCase', getSessionUseCase);
  c.set('submitReviewUseCase', submitReviewUseCase);
  c.set('getWordsUseCase', getWordsUseCase);
  c.set('getAdminWordsUseCase', getAdminWordsUseCase);
  c.set('createWordUseCase', createWordUseCase);
  c.set('updateWordUseCase', updateWordUseCase);
  c.set('deleteWordUseCase', deleteWordUseCase);
  c.set('searchDictionaryUseCase', searchDictionaryUseCase);
  c.set('lookupDictionaryUseCase', lookupDictionaryUseCase);
  await next();
});

import { createUsersRoute } from './routes/users';
import { createWordSetsRoute } from './routes/wordSets';

const routes = app
  .route('/api/session', sessionRoutes)
  .route('/api/review', reviewRoutes)
  .route('/api/words', wordsRoutes)
  .route('/api/admin', adminRoutes)
  .route('/api/tts', ttsRoutes)
  .route('/api/users', createUsersRoute(db))
  .route('/api/word-sets', createWordSetsRoute(db));

app.use('/*', serveStatic({ root: './dist/client' }));
app.get('/*', serveStatic({ path: './dist/client/index.html' }));

export type AppType = typeof routes;

const port = 3001;
console.log(`Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });

