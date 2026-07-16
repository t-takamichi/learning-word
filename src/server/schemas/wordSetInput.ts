import { z } from 'zod';

export const WordSetInputSchema = z.object({
  name:        z.string().min(1, 'セット名は必須です').max(100),
  level_tag:   z.enum(['basic', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'レベルは basic / intermediate / advanced から選択してください' }),
  }),
  description: z.string().max(300).optional().nullable(),
});

export const WordSetPartialInputSchema = WordSetInputSchema.partial();
