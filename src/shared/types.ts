export type Word = {
  readonly id: number;
  readonly word_set_id: number;
  readonly english: string;
  readonly vietnamese: string;
  readonly japanese: string;
  readonly example_en: string | null;
  readonly example_vi: string | null;
  readonly example_ja: string | null;
  readonly created_by: number | null;
  readonly created_at: string;
};


export type LearningProgress = {
  readonly word_id: number;
  readonly status: 'new' | 'weak' | 'mastered';
  readonly review_count: number;
  readonly incorrect_count: number;
  readonly last_reviewed_at: string | null;
};

export type WordWithProgress = Word & {
  readonly progress: LearningProgress | null;
};

export type ReviewInput = {
  readonly userId: number;
  readonly wordId: number;
  readonly result: 'good' | 'again';
};

export type WordInput = Omit<Word, 'id' | 'created_at' | 'created_by'>;

export type WordsResponse = {
  readonly words: readonly WordWithProgress[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
};

export type DictionaryWord = {
  readonly id: number;
  readonly english: string;
  readonly vietnamese: string;
  readonly japanese: string;
  readonly example_en: string | null;
  readonly example_vi: string | null;
  readonly example_ja: string | null;
};

