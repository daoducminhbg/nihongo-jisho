-- ============================================================================
-- 0001 · Extensions & Enum types
-- Nihongo Jisho · Next-Gen Japanese Learning WebApp
-- ----------------------------------------------------------------------------
-- Quy ước: extensions nằm trong schema `extensions` (chuẩn Supabase).
-- Vì vậy mọi type/operator/function của extension đều được qualify tường minh
-- (extensions.vector, operator(extensions.<=>), extensions.gin_trgm_ops...)
-- để các function dùng `set search_path = ''` vẫn resolve đúng.
-- ============================================================================

create schema if not exists extensions;

-- gen_random_uuid(), digest()
create extension if not exists pgcrypto with schema extensions;

-- Fuzzy search: similarity(), % operator, gin_trgm_ops
create extension if not exists pg_trgm with schema extensions;

-- Semantic search: vector type, <=> cosine distance, hnsw index
create extension if not exists vector with schema extensions;

-- Bỏ dấu tiếng Việt khi tìm kiếm ("buon ba" -> "buồn bã")
create extension if not exists unaccent with schema extensions;

-- ----------------------------------------------------------------------------
-- Enum types
-- ----------------------------------------------------------------------------

-- Cấp độ JLPT. Thứ tự khai báo N5 -> N1 để ORDER BY tự nhiên theo độ khó tăng.
do $$ begin
  create type public.jlpt_level as enum ('N5', 'N4', 'N3', 'N2', 'N1');
exception when duplicate_object then null; end $$;

-- Loại nội dung học (dùng cho srs_cards polymorphic)
do $$ begin
  create type public.study_item_type as enum ('vocab', 'kanji', 'grammar');
exception when duplicate_object then null; end $$;

-- Trạng thái thẻ theo chuẩn FSRS / ts-fsrs
do $$ begin
  create type public.srs_state as enum ('new', 'learning', 'review', 'relearning');
exception when duplicate_object then null; end $$;

-- Chiều lật thẻ: nhận diện mặt chữ vs gợi nhớ chủ động
do $$ begin
  create type public.card_direction as enum ('jp_to_vi', 'vi_to_jp');
exception when duplicate_object then null; end $$;

-- Thuật toán xếp lịch: FSRS (mặc định) hoặc fallback SM-2
do $$ begin
  create type public.scheduler_kind as enum ('fsrs', 'sm2');
exception when duplicate_object then null; end $$;

-- Nguồn gốc dữ liệu: AI bóc tách từ ảnh/text, hay người dùng tự nhập
do $$ begin
  create type public.item_source as enum ('ai_vision', 'ai_text', 'manual', 'import');
exception when duplicate_object then null; end $$;

comment on type public.jlpt_level is 'Cấp độ JLPT, sắp thứ tự N5 (dễ) -> N1 (khó)';
comment on type public.srs_state is 'Trạng thái thẻ FSRS: new/learning/review/relearning';
