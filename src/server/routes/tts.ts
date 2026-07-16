import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { ensurePiperReady, generateSpeechStream } from '../services/ttsService';

export const ttsRoutes = new Hono()
  .get('/', async (c) => {
    const text = c.req.query('text');
    if (!text) {
      return c.text('Missing text parameter', 400);
    }

    // クライアントの再生速度指定(rate)を、ピッチを保った発音長(length_scale)へ変換する。
    // rate<1（ゆっくり）→ length_scale>1。異常値を避けるため 0.5〜2.0 にクランプ。
    const rateParam = c.req.query('rate');
    let lengthScale = 1.0;
    if (rateParam) {
      const rate = parseFloat(rateParam);
      if (!isNaN(rate) && rate > 0) {
        lengthScale = Math.min(2.0, Math.max(0.5, 1 / rate));
      }
    }

    try {
      // Ensure Piper is downloaded and ready (idempotent check)
      await ensurePiperReady();

      const audioStream = await generateSpeechStream(text, lengthScale);

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
