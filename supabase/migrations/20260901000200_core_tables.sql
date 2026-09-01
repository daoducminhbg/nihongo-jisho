-- ============================================================================
-- 0002 · Core tables
-- profiles · vocabularies · kanjis · grammars · scan_captures
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: mở rộng auth.users (không sửa trực tiếp schema auth)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text,
  avatar_url    text,
  target_level  public.jlpt_level not null default 'N4',
  -- Ngày bắt đầu streak học liên tục
  streak_count  integer not null default 0 check (streak_count >= 0),
  last_studied_on date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is 'Thông tin hiển thị + tiến độ tổng của người học';

-- ----------------------------------------------------------------------------
-- vocabularies: từ vựng cá nhân
-- ----------------------------------------------------------------------------
-- context_sentences là JSONB array, mỗi phần tử:
-- {
--   "jp": "全力で行くぞ！",
--   "furigana": "ぜんりょくでいくぞ",
--   "vi": "Tớ sẽ dốc toàn lực!",
--   "conjugated": "行く",         -- dạng chia xuất hiện trong câu
--   "source": "Jujutsu Kaisen ep.5",
--   "capture_id": "uuid|null",
--   "seen_at": "2026-09-01T10:00:00Z"
-- }
create table if not exists public.vocabularies (
  id            uuid primary key default extensions.gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,

  word          text not null,                 -- dạng nguyên mẫu / dictionary form
  furigana      text,                           -- đọc kana của cả từ
  kanji         text,                           -- phần kanji (nếu có)
  romaji        text,                           -- hỗ trợ gõ "taberu"
  meaning       text not null,                  -- nghĩa tiếng Việt
  part_of_speech text,                          -- danh từ, động từ nhóm 1, i-adj...
  jlpt_level    public.jlpt_level,

  context_sentences jsonb not null default '[]'::jsonb
                    check (jsonb_typeof(context_sentences) = 'array'),
  -- Số lần gặp lại từ này -> phục vụ badge "[Đã học - lần gặp thứ N]"
  frequency     integer not null default 1 check (frequency >= 1),
  tags          text[] not null default '{}',
  notes         text,
  source        public.item_source not null default 'ai_vision',

  -- Gemini text-embedding-004 trả về 768 chiều
  embedding     extensions.vector(768),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Chống trùng ở tầng DB: cùng user + cùng từ + cùng cách đọc = 1 dòng
  constraint vocabularies_unique_per_user
    unique (user_id, word, furigana)
);

comment on table public.vocabularies is 'Kho từ vựng cá nhân, dedupe theo (user_id, word, furigana)';
comment on column public.vocabularies.context_sentences is
  'JSONB array các câu ngữ cảnh đã gặp; append thêm thay vì tạo dòng mới';

-- ----------------------------------------------------------------------------
-- kanjis: kho Hán tự cá nhân
-- ----------------------------------------------------------------------------
create table if not exists public.kanjis (
  id            uuid primary key default extensions.gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,

  character     text not null check (char_length(character) = 1),
  han_viet      text,                           -- Âm Hán-Việt, lưu IN HOA
  onyomi        text[] not null default '{}',   -- âm On (katakana)
  kunyomi       text[] not null default '{}',   -- âm Kun (hiragana)
  meaning       text not null,
  jlpt_level    public.jlpt_level,

  stroke_count  integer check (stroke_count > 0),
  -- KanjiVG: lưu mã hex codepoint (vd '098fd' cho 食) để load SVG,
  -- kèm cache mảng path 'd' attribute cho animation nét vẽ offline.
  kanjivg_id    text,
  strokes_data  jsonb check (strokes_data is null or jsonb_typeof(strokes_data) = 'array'),

  radicals      text[] not null default '{}',
  mnemonic      text,                            -- mẹo nhớ chữ
  tags          text[] not null default '{}',
  source        public.item_source not null default 'ai_vision',

  embedding     extensions.vector(768),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint kanjis_unique_per_user unique (user_id, character)
);

comment on column public.kanjis.kanjivg_id is
  'Hex codepoint KanjiVG (vd 098fd). strokes_data cache path SVG cho stroke animation';
comment on column public.kanjis.han_viet is 'Âm Hán-Việt, quy ước lưu IN HOA (vd THỰC)';

-- ----------------------------------------------------------------------------
-- grammars: kho ngữ pháp cá nhân
-- ----------------------------------------------------------------------------
-- examples JSONB array: [{ "jp": "...", "furigana": "...", "vi": "...", "note": "..." }]
create table if not exists public.grammars (
  id            uuid primary key default extensions.gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,

  title         text not null,                  -- vd "〜てしまう"
  structure     text not null,                  -- công thức: V-て + しまう
  explanation   text not null,                  -- giải thích nghĩa/sắc thái
  -- Văn phong: đời thường / anime slang / trang trọng / văn viết
  register      text,
  jlpt_level    public.jlpt_level,

  examples      jsonb not null default '[]'::jsonb
                check (jsonb_typeof(examples) = 'array'),
  context_sentences jsonb not null default '[]'::jsonb
                check (jsonb_typeof(context_sentences) = 'array'),
  frequency     integer not null default 1 check (frequency >= 1),
  tags          text[] not null default '{}',
  source        public.item_source not null default 'ai_vision',

  embedding     extensions.vector(768),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- lower() để "〜てしまう" và biến thể hoa/thường không tạo 2 dòng
  constraint grammars_unique_per_user unique (user_id, title)
);

comment on column public.grammars.register is
  'Sắc thái: casual | anime_slang | polite | formal | written';

-- ----------------------------------------------------------------------------
-- scan_captures: lịch sử scan ảnh/text qua AI Vision
-- ----------------------------------------------------------------------------
create table if not exists public.scan_captures (
  id            uuid primary key default extensions.gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,

  -- Path trong Supabase Storage bucket 'captures' (null nếu nhập text chay)
  image_path    text,
  extracted_text text,                          -- toàn văn câu tiếng Nhật
  translation   text,                           -- nghĩa bối cảnh tiếng Việt
  source_label  text,                           -- "Genshin Impact", "One Piece ch.1050"

  model         text,                           -- gemini-3.7-flash
  -- Payload JSON thô Gemini trả về, giữ lại để re-parse khi cải tiến schema
  raw_response  jsonb,
  token_usage   jsonb,

  created_at    timestamptz not null default now()
);

comment on table public.scan_captures is
  'Lịch sử OCR/AI extraction; context_sentences của vocab/grammar trỏ về capture_id này';

-- ----------------------------------------------------------------------------
-- vocabulary_kanji: liên kết từ vựng <-> kanji cấu thành
-- ----------------------------------------------------------------------------
-- Cho phép mở kanji "食" và thấy ngay các từ ghép đã học: 食べる, 食事, 朝食...
create table if not exists public.vocabulary_kanji (
  vocabulary_id uuid not null references public.vocabularies (id) on delete cascade,
  kanji_id      uuid not null references public.kanjis (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  primary key (vocabulary_id, kanji_id)
);

comment on table public.vocabulary_kanji is
  'Bảng nối: mở 1 kanji xem được mọi từ vựng đã học có chứa nó';
