export interface Vocabulary {
  id: string;
  user_id: string;
  word: string;
  furigana: string | null;
  kanji: string | null;
  meaning: string;
  word_type: string | null;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null;
  context_sentences: { sentence: string; meaning: string; source?: string }[];
  frequency: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Kanji {
  id: string;
  user_id: string;
  character: string;
  han_viet: string | null;
  onyomi: string | null;
  kunyomi: string | null;
  meaning: string;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null;
  example_words: { word: string; furigana: string; meaning: string }[];
  created_at: string;
}

export interface Grammar {
  id: string;
  user_id: string;
  title: string;
  structure: string | null;
  explanation: string;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null;
  examples: { sentence: string; meaning: string }[];
  nuance: string | null;
  created_at: string;
}

export interface SRSCard {
  id: string;
  user_id: string;
  item_type: 'vocab' | 'kanji' | 'grammar';
  item_id: string;
  state: 'new' | 'learning' | 'review' | 'relearning';
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  learning_steps?: number;
  last_review: string | null;
  created_at: string;
}

export interface SearchResult {
  item_type: 'vocab' | 'kanji' | 'grammar';
  item_id: string;
  display_text: string;
  sub_text: string | null;
  meaning: string | null;
  jlpt_level: string | null;
  similarity: number;
}
