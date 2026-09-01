-- ============================================================================
-- 0003 · SRS engine tables (FSRS + fallback SM-2)
-- srs_cards · review_logs · user_settings
-- ============================================================================

-- ----------------------------------------------------------------------------
-- srs_cards: 1 dòng = 1 thẻ ôn tập
-- ----------------------------------------------------------------------------
-- item_id là polymorphic (trỏ tới vocabularies | kanjis | grammars) nên không
-- dùng được FK. Toàn vẹn tham chiếu được đảm bảo bằng trigger bên dưới +
-- trigger dọn thẻ khi item gốc bị xoá.
create table if not exists public.srs_cards (
  id            uuid primary key default extensions.gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,

  item_type     public.study_item_type not null,
  item_id       uuid not null,
  direction     public.card_direction not null default 'jp_to_vi',

  -- ---- FSRS state (ts-fsrs Card interface) ----
  state         public.srs_state not null default 'new',
  stability     double precision,                -- S: độ bền trí nhớ (ngày)
  difficulty    double precision                 -- D: thang 1..10
                check (difficulty is null or (difficulty >= 1 and difficulty <= 10)),
  elapsed_days  integer not null default 0,
  scheduled_days integer not null default 0,
  reps          integer not null default 0 check (reps >= 0),
  lapses        integer not null default 0 check (lapses >= 0),
  learning_steps integer not null default 0,     -- ts-fsrs v5: bước học hiện tại

  last_review   timestamptz,
  due           timestamptz not null default now(),

  -- ---- SM-2 fallback (chỉ dùng khi scheduler = 'sm2') ----
  ease_factor   double precision not null default 2.5,
  interval_days integer not null default 0,

  suspended     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Mỗi item + mỗi chiều lật = 1 thẻ độc lập
  constraint srs_cards_unique_per_direction
    unique (user_id, item_type, item_id, direction)
);

comment on table public.srs_cards is
  'Thẻ SRS. stability/difficulty theo FSRS; ease_factor/interval_days chỉ cho fallback SM-2';
comment on column public.srs_cards.item_id is
  'Polymorphic FK -> vocabularies|kanjis|grammars, ràng buộc bằng trigger';

-- ----------------------------------------------------------------------------
-- review_logs: lịch sử từng lần đánh giá
-- ----------------------------------------------------------------------------
-- Bắt buộc phải có nếu muốn chạy FSRS Optimizer để tinh chỉnh 21 tham số w
-- riêng cho từng người học. Mỗi dòng khớp ReviewLog của ts-fsrs.
create table if not exists public.review_logs (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users (id) on delete cascade,
  card_id       uuid not null references public.srs_cards (id) on delete cascade,

  -- 1=Again, 2=Hard, 3=Good, 4=Easy (khớp Rating enum của ts-fsrs)
  rating        smallint not null check (rating between 1 and 4),
  -- Trạng thái thẻ TRƯỚC khi đánh giá (optimizer cần giá trị này)
  state         public.srs_state not null,

  due           timestamptz,
  stability     double precision,
  difficulty    double precision,
  elapsed_days  integer not null default 0,
  last_elapsed_days integer not null default 0,
  scheduled_days integer not null default 0,

  review        timestamptz not null default now(),
  -- Thời gian người dùng suy nghĩ trước khi lật (ms) - tín hiệu phụ cho optimizer
  duration_ms   integer check (duration_ms is null or duration_ms >= 0)
);

comment on table public.review_logs is
  'Append-only. Dữ liệu đầu vào cho FSRS Optimizer (fit tham số w cá nhân hoá)';

-- ----------------------------------------------------------------------------
-- user_settings: cấu hình học tập
-- ----------------------------------------------------------------------------
create table if not exists public.user_settings (
  user_id       uuid primary key references auth.users (id) on delete cascade,

  scheduler     public.scheduler_kind not null default 'fsrs',
  -- 21 tham số FSRS-6. null = dùng default của ts-fsrs.
  -- Sau khi có >= ~400 review_logs, chạy optimizer rồi ghi mảng đã fit vào đây.
  fsrs_weights  double precision[],
  request_retention double precision not null default 0.9
                    check (request_retention > 0.7 and request_retention < 0.99),
  maximum_interval integer not null default 36500 check (maximum_interval > 0),
  enable_fuzz   boolean not null default true,
  -- Again -> học lại ngay trong phiên: các mốc phút của learning steps
  learning_steps text[] not null default '{1m,10m}',
  relearning_steps text[] not null default '{10m}',

  new_cards_per_day integer not null default 20 check (new_cards_per_day >= 0),
  reviews_per_day integer not null default 200 check (reviews_per_day >= 0),

  default_direction public.card_direction not null default 'jp_to_vi',
  -- Trộn hỗn hợp vocab+kanji+grammar trong 1 phiên
  mixed_session boolean not null default true,
  autoplay_audio boolean not null default true,
  speech_rate   double precision not null default 0.9
                check (speech_rate between 0.5 and 2.0),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on column public.user_settings.fsrs_weights is
  'Mảng w của FSRS-6 (21 phần tử). null = default ts-fsrs. Ghi đè sau khi chạy optimizer';

-- ----------------------------------------------------------------------------
-- Trigger: đảm bảo item_id tồn tại đúng bảng theo item_type
-- ----------------------------------------------------------------------------
create or replace function public.tg_srs_cards_validate_item()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_exists boolean;
begin
  case new.item_type
    when 'vocab' then
      select exists (
        select 1 from public.vocabularies
        where id = new.item_id and user_id = new.user_id
      ) into v_exists;
    when 'kanji' then
      select exists (
        select 1 from public.kanjis
        where id = new.item_id and user_id = new.user_id
      ) into v_exists;
    when 'grammar' then
      select exists (
        select 1 from public.grammars
        where id = new.item_id and user_id = new.user_id
      ) into v_exists;
  end case;

  if not v_exists then
    raise exception
      'srs_cards: item_id % không tồn tại trong bảng % của user %',
      new.item_id, new.item_type, new.user_id
      using errcode = 'foreign_key_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists srs_cards_validate_item on public.srs_cards;
create trigger srs_cards_validate_item
  before insert or update of item_id, item_type on public.srs_cards
  for each row execute function public.tg_srs_cards_validate_item();

-- ----------------------------------------------------------------------------
-- Trigger: xoá item gốc -> xoá thẻ SRS tương ứng (thay cho ON DELETE CASCADE)
-- ----------------------------------------------------------------------------
create or replace function public.tg_cleanup_srs_cards()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_type public.study_item_type;
begin
  v_type := case tg_table_name
              when 'vocabularies' then 'vocab'
              when 'kanjis'       then 'kanji'
              when 'grammars'     then 'grammar'
            end::public.study_item_type;

  delete from public.srs_cards
  where user_id = old.user_id
    and item_type = v_type
    and item_id = old.id;

  return old;
end;
$$;

revoke all on function public.tg_cleanup_srs_cards() from public, anon, authenticated;

drop trigger if exists cleanup_srs_cards on public.vocabularies;
create trigger cleanup_srs_cards
  after delete on public.vocabularies
  for each row execute function public.tg_cleanup_srs_cards();

drop trigger if exists cleanup_srs_cards on public.kanjis;
create trigger cleanup_srs_cards
  after delete on public.kanjis
  for each row execute function public.tg_cleanup_srs_cards();

drop trigger if exists cleanup_srs_cards on public.grammars;
create trigger cleanup_srs_cards
  after delete on public.grammars
  for each row execute function public.tg_cleanup_srs_cards();
