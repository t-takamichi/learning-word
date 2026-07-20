import { z } from 'zod';

export const WordInputSchema = z.object({
  word_set_id: z.number().int().positive('単語セットIDは必須です'),
  english: z.string().min(1, '英単語は必須です').max(100),
  vietnamese: z.string().max(200).optional().nullable().transform((val) => val ?? ''),
  japanese: z.string().max(200).optional().nullable().transform((val) => val ?? ''),
  example_en: z.string().max(500).optional().nullable(),
  example_vi: z.string().max(500).optional().nullable(),
  example_ja: z.string().max(500).optional().nullable(),
}).refine(
  (data) => (data.vietnamese && data.vietnamese.trim().length > 0) || (data.japanese && data.japanese.trim().length > 0),
  {
    message: 'ベトナム語訳か日本語訳のどちらか片方は入力してください',
    path: ['japanese'],
  }
);

export const WordPartialInputSchema = z.object({
  word_set_id: z.number().int().positive().optional(),
  english: z.string().min(1).max(100).optional(),
  vietnamese: z.string().max(200).optional().nullable(),
  japanese: z.string().max(200).optional().nullable(),
  example_en: z.string().max(500).optional().nullable(),
  example_vi: z.string().max(500).optional().nullable(),
  example_ja: z.string().max(500).optional().nullable(),
});

export type WordInputDto = z.infer<typeof WordInputSchema>;
export type WordPartialInputDto = z.infer<typeof WordPartialInputSchema>;
