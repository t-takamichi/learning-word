import { z } from 'zod';

export const WordInputSchema = z.object({
  word_set_id: z.number().int().positive('単語セットIDは必須です'),
  english: z.string().min(1, '英単語は必須です').max(100),
  vietnamese: z.string().min(1, 'ベトナム語訳は必須です').max(200),
  japanese: z.string().min(1, '日本語訳は必須です').max(200),
  example_en: z.string().max(500).optional().nullable(),
  example_vi: z.string().max(500).optional().nullable(),
  example_ja: z.string().max(500).optional().nullable(),
});


export const WordPartialInputSchema = WordInputSchema.partial();

export type WordInputDto = z.infer<typeof WordInputSchema>;
export type WordPartialInputDto = z.infer<typeof WordPartialInputSchema>;
