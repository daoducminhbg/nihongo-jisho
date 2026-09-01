-- ============================================================
-- Nihongo Jisho - Initial Database Schema
-- PostgreSQL 16 on Supabase
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- TABLE: vocabularies
-- Stores user's collected vocabulary words
-- ============================================================
CREATE TABLE vocabularies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word TEXT NOT NULL,                    -- Dictionary form (食べる)
  furigana TEXT,                         -- たべる
  kanji TEXT,                            -- 食べる (NULL if pure kana word)
  meaning TEXT NOT NULL,                 -- Vietnamese meaning
  word_type TEXT,                        -- Part of speech (動詞, 名詞, ...)
  jlpt_level TEXT CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
  context_sentences JSONB DEFAULT '[]'::jsonb,  -- [{sentence, meaning, source}]
  frequency INTEGER DEFAULT 1,           -- Encounter count
  tags TEXT[] DEFAULT '{}',
  embedding VECTOR(384),                 -- Optional semantic embedding
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word)
);

-- ============================================================
-- TABLE: kanjis
-- Stores user's collected kanji characters
-- ============================================================
CREATE TABLE kanjis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  character TEXT NOT NULL,               -- 食
  han_viet TEXT,                         -- THỰC (Sino-Vietnamese reading)
  onyomi TEXT,                           -- ショク、ジキ
  kunyomi TEXT,                          -- た.べる、く.う
  meaning TEXT NOT NULL,                 -- Vietnamese meaning
  jlpt_level TEXT CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
  example_words JSONB DEFAULT '[]'::jsonb,  -- [{word, furigana, meaning}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, character)
);

-- ============================================================
-- TABLE: grammars
-- Stores user's collected grammar patterns
-- ============================================================
CREATE TABLE grammars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,                   -- ～てしまう
  structure TEXT,                        -- Verb て-form + しまう
  explanation TEXT NOT NULL,             -- Usage explanation in Vietnamese
  jlpt_level TEXT CHECK (jlpt_level IN ('N5','N4','N3','N2','N1')),
  examples JSONB DEFAULT '[]'::jsonb,    -- [{sentence, meaning}]
  nuance TEXT,                           -- formal/informal/anime slang
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, title)
);

-- ============================================================
-- TABLE: srs_cards
-- FSRS (Free Spaced Repetition Scheduler) card state
-- ============================================================
CREATE TABLE srs_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('vocab', 'kanji', 'grammar')),
  item_id UUID NOT NULL,                 -- FK to vocabularies/kanjis/grammars
  state TEXT DEFAULT 'new' CHECK (state IN ('new', 'learning', 'review', 'relearning')),
  due TIMESTAMPTZ DEFAULT NOW(),
  stability REAL DEFAULT 0,
  difficulty REAL DEFAULT 0,
  elapsed_days INTEGER DEFAULT 0,
  scheduled_days INTEGER DEFAULT 0,
  reps INTEGER DEFAULT 0,
  lapses INTEGER DEFAULT 0,
  last_review TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- ============================================================
-- INDEXES for Fuzzy Search (pg_trgm)
-- ============================================================
CREATE INDEX idx_vocab_word_trgm ON vocabularies USING GIN (word gin_trgm_ops);
CREATE INDEX idx_vocab_furigana_trgm ON vocabularies USING GIN (furigana gin_trgm_ops);
CREATE INDEX idx_vocab_meaning_trgm ON vocabularies USING GIN (meaning gin_trgm_ops);
CREATE INDEX idx_vocab_user ON vocabularies (user_id);
CREATE INDEX idx_vocab_embedding ON vocabularies USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_kanji_character ON kanjis (character);
CREATE INDEX idx_kanji_han_viet_trgm ON kanjis USING GIN (han_viet gin_trgm_ops);
CREATE INDEX idx_kanji_meaning_trgm ON kanjis USING GIN (meaning gin_trgm_ops);
CREATE INDEX idx_kanji_user ON kanjis (user_id);

CREATE INDEX idx_grammar_title_trgm ON grammars USING GIN (title gin_trgm_ops);
CREATE INDEX idx_grammar_explanation_trgm ON grammars USING GIN (explanation gin_trgm_ops);
CREATE INDEX idx_grammar_user ON grammars (user_id);

CREATE INDEX idx_srs_due ON srs_cards (user_id, due) WHERE state IN ('review', 'relearning');
CREATE INDEX idx_srs_new ON srs_cards (user_id, created_at) WHERE state = 'new';
CREATE INDEX idx_srs_learning ON srs_cards (user_id, due) WHERE state = 'learning';

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Each user can only access their own data
-- ============================================================
ALTER TABLE vocabularies ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanjis ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammars ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own vocabularies" ON vocabularies
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own kanjis" ON kanjis
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own grammars" ON grammars
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own srs_cards" ON srs_cards
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vocabularies_updated_at
  BEFORE UPDATE ON vocabularies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCTION: search_all - Unified fuzzy search across all tables
-- ============================================================
CREATE OR REPLACE FUNCTION search_all(
  p_user_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  item_type TEXT,
  item_id UUID,
  display_text TEXT,
  sub_text TEXT,
  meaning TEXT,
  jlpt_level TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  -- Vocabulary results
  SELECT 
    'vocab'::TEXT AS item_type,
    v.id AS item_id,
    v.word AS display_text,
    v.furigana AS sub_text,
    v.meaning AS meaning,
    v.jlpt_level AS jlpt_level,
    GREATEST(
      COALESCE(similarity(v.word, p_query), 0),
      COALESCE(similarity(v.furigana, p_query), 0),
      COALESCE(similarity(v.meaning, p_query), 0)
    )::REAL AS similarity
  FROM vocabularies v
  WHERE v.user_id = p_user_id
    AND (
      v.word % p_query 
      OR v.furigana % p_query 
      OR v.meaning % p_query
      OR v.word = p_query
      OR v.furigana = p_query
    )
  
  UNION ALL
  
  -- Kanji results
  SELECT 
    'kanji'::TEXT AS item_type,
    k.id AS item_id,
    k.character AS display_text,
    k.han_viet AS sub_text,
    k.meaning AS meaning,
    k.jlpt_level AS jlpt_level,
    GREATEST(
      COALESCE(similarity(k.character, p_query), 0),
      COALESCE(similarity(k.han_viet, p_query), 0),
      COALESCE(similarity(k.meaning, p_query), 0)
    )::REAL AS similarity
  FROM kanjis k
  WHERE k.user_id = p_user_id
    AND (
      k.character = p_query 
      OR k.han_viet % p_query 
      OR k.meaning % p_query
      OR k.onyomi ILIKE '%' || p_query || '%'
      OR k.kunyomi ILIKE '%' || p_query || '%'
    )
  
  UNION ALL
  
  -- Grammar results
  SELECT 
    'grammar'::TEXT AS item_type,
    g.id AS item_id,
    g.title AS display_text,
    g.structure AS sub_text,
    g.explanation AS meaning,
    g.jlpt_level AS jlpt_level,
    GREATEST(
      COALESCE(similarity(g.title, p_query), 0),
      COALESCE(similarity(g.explanation, p_query), 0)
    )::REAL AS similarity
  FROM grammars g
  WHERE g.user_id = p_user_id
    AND (
      g.title % p_query 
      OR g.explanation % p_query
      OR g.title ILIKE '%' || p_query || '%'
    )
  
  ORDER BY similarity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
