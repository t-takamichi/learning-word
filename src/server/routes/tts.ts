import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { ensurePiperReady, generateSpeechStream } from '../services/ttsService';

export const ttsRoutes = new Hono()
  .get('/', async (c) => {
    const text = c.req.query('text');
    if (!text) {
      return c.text('Missing text parameter', 400);
    }

    try {
      // Ensure Piper is downloaded and ready (idempotent check)
      await ensurePiperReady();

      const audioStream = await generateSpeechStream(text);

      c.header('Content-Type', 'audio/wav');
      c.header('Transfer-Encoding', 'chunked');

      return stream(c, async (streamInstance) => {
        streamInstance.onAbort(() => {
          console.log('TTS request aborted by client');
          audioStream.destroy();
        });

        for await (const chunk of audioStream) {
          await streamInstance.write(chunk);
        }
      });
    } catch (error: any) {
      console.error('Error generating TTS:', error);
      const status = error.message?.includes('busy') ? 503 : 500;
      return c.json({ success: false, message: error.message || 'TTS generation failed' }, status);
    }
  });
