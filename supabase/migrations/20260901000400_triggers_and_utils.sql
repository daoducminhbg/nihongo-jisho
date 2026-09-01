-- ============================================================================
-- 0004 · Utility functions & triggers
-- updated_at · handle_new_user · immutable unaccent wrapper
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tự động cập nhật updated_at
-- ----------------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'vocabularies', 'kanjis', 'grammars', 'srs_cards', 'user_settings'
  ]
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I', t
    );
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.tg_set_updated_at()', t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Wrapper unaccent IMMUTABLE
-- ----------------------------------------------------------------------------
-- extensions.unaccent() chỉ là STABLE (phụ thuộc dictionary) nên Postgres từ
-- chối dùng nó trong index/generated column. Wrapper này khoá dictionary cụ thể
-- để đánh dấu IMMUTABLE một cách an toàn -> dùng được cho index trgm.
-- Mục đích: gõ "buon ba" vẫn khớp nghĩa "buồn bã".
create or replace function public.immutable_unaccent(text)
returns text
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, $1);
$$;

comment on function public.immutable_unaccent(text) is
  'Bỏ dấu tiếng Việt, IMMUTABLE để dùng trong index trgm';

-- ----------------------------------------------------------------------------
-- Cột search_text: gộp mọi field tìm kiếm được thành 1 cột stored
-- ----------------------------------------------------------------------------
-- Cho phép 1 index trgm duy nhất phục vụ mọi kiểu gõ:
-- "taberu" (romaji) / "たべる" (kana) / "食べる" (kanji) / "an" (nghĩa không dấu)
alter table public.vocabularies
  add column if not exists search_text text
  generated always as (
    word
    || ' ' || coalesce(furigana, '')
    || ' ' || coalesce(kanji, '')
    || ' ' || coalesce(romaji, '')
    || ' ' || public.immutable_unaccent(lower(meaning))
  ) stored;

alter table public.kanjis
  add column if not exists search_text text
  generated always as (
    character
    || ' ' || coalesce(han_viet, '')
    || ' ' || coalesce(public.immutable_unaccent(lower(han_viet)), '')
    || ' ' || array_to_string(onyomi, ' ')
    || ' ' || array_to_string(kunyomi, ' ')
    || ' ' || public.immutable_unaccent(lower(meaning))
  ) stored;

alter table public.grammars
  add column if not exists search_text text
  generated always as (
    title
    || ' ' || structure
    || ' ' || public.immutable_unaccent(lower(explanation))
  ) stored;

-- ----------------------------------------------------------------------------
-- Khởi tạo profile + settings khi có user mới
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
