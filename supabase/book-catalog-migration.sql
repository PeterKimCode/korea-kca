-- 기존 GTCC Supabase 프로젝트에 교재 관리 기능을 추가합니다.
-- 중요: SQL Editor에 이 파일 전체를 붙여 넣고 Ctrl+A로 전부 선택한 뒤 Run을 누르세요.
-- Supabase가 제안하는 별도의 "Enable RLS" 문장은 추가하지 않아도 됩니다.

begin;

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  image_url text not null,
  purchase_url text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_history drop constraint if exists content_history_entity_type_check;
alter table public.content_history
  add constraint content_history_entity_type_check
  check (entity_type in ('courses', 'notices', 'slides', 'books'));

create index if not exists books_public_idx
on public.books (published, deleted_at, sort_order);

drop trigger if exists books_touch_updated_at on public.books;
create trigger books_touch_updated_at before update on public.books
for each row execute function public.touch_updated_at();

drop trigger if exists books_audit on public.books;
create trigger books_audit after insert or update on public.books
for each row execute function public.audit_content_change();

alter table public.books enable row level security;

drop policy if exists "public reads published books" on public.books;
create policy "public reads published books" on public.books
for select using (published = true and deleted_at is null);

drop policy if exists "admins manage books" on public.books;
create policy "admins manage books" on public.books
for all using (public.is_gtcc_admin()) with check (public.is_gtcc_admin());

-- 교재도 기존 콘텐츠와 동일하게 변경 기록에서 복구합니다.
create or replace function public.restore_content_version(history_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $restore$
declare
  history_row public.content_history;
begin
  if not public.is_gtcc_admin() then
    raise exception '관리자 권한이 필요합니다.';
  end if;

  select * into history_row from public.content_history where id = history_id;
  if history_row.id is null then
    raise exception '변경 기록을 찾을 수 없습니다.';
  end if;

  if history_row.entity_type not in ('courses', 'notices', 'slides', 'books') then
    raise exception '지원하지 않는 콘텐츠 종류입니다.';
  end if;

  if history_row.before_data is null then
    execute format(
      'update public.%I set published = false, deleted_at = now() where id = $1',
      history_row.entity_type
    ) using history_row.entity_id;
    return;
  end if;

  -- 기존 행을 지운 뒤 기록에 저장된 전체 행을 그대로 복원합니다.
  execute format('delete from public.%I where id = $1', history_row.entity_type)
  using history_row.entity_id;

  execute format(
    'insert into public.%I select * from jsonb_populate_record(null::public.%I, $1)',
    history_row.entity_type,
    history_row.entity_type
  ) using history_row.before_data;
end;
$restore$;

revoke all on function public.restore_content_version(bigint) from public;
grant execute on function public.restore_content_version(bigint) to authenticated;

-- 위로·아래로 버튼에서 전달한 순서를 한 번에 저장합니다.
create or replace function public.reorder_books(book_ids uuid[])
returns setof public.books
language plpgsql
security definer
set search_path = public
as $reorder$
declare
  book_id uuid;
  book_position integer := 0;
begin
  if not public.is_gtcc_admin() then
    raise exception '관리자 권한이 필요합니다.';
  end if;

  foreach book_id in array book_ids loop
    update public.books
    set sort_order = book_position * 10
    where id = book_id and deleted_at is null;
    book_position := book_position + 1;
  end loop;

  return query
  select * from public.books
  where id = any(book_ids) and deleted_at is null
  order by sort_order;
end;
$reorder$;

revoke all on function public.reorder_books(uuid[]) from public;
grant execute on function public.reorder_books(uuid[]) to authenticated;

create or replace function public.purge_deleted_content()
returns void
language plpgsql
security definer
set search_path = public
as $purge$
begin
  if auth.role() <> 'service_role' and not public.is_gtcc_admin() then
    raise exception '관리자 권한이 필요합니다.';
  end if;

  delete from public.courses where deleted_at < now() - interval '30 days';
  delete from public.notices where deleted_at < now() - interval '30 days';
  delete from public.slides where deleted_at < now() - interval '30 days';
  delete from public.books where deleted_at < now() - interval '30 days';
end;
$purge$;

revoke all on function public.purge_deleted_content() from public;
grant execute on function public.purge_deleted_content() to authenticated;

commit;
