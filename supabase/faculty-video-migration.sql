-- 기존 GTCC Supabase 프로젝트에 교수진·미리보기 영상 관리를 추가합니다.
-- Supabase SQL Editor에서 이 파일 전체를 한 번 실행하세요. 반복 실행해도 안전합니다.

create table if not exists public.faculty (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text not null default '',
  specialties text not null default '',
  bio text not null default '',
  image_url text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null default '온라인 강의 미리보기',
  caption text not null default '',
  youtube_url text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_history drop constraint if exists content_history_entity_type_check;
alter table public.content_history
  add constraint content_history_entity_type_check
  check (entity_type in ('courses', 'notices', 'slides', 'books', 'faculty', 'videos'));

create index if not exists faculty_public_idx on public.faculty (published, deleted_at, sort_order);
create index if not exists videos_public_idx on public.videos (published, deleted_at, sort_order);

drop trigger if exists faculty_touch_updated_at on public.faculty;
create trigger faculty_touch_updated_at before update on public.faculty
for each row execute function public.touch_updated_at();
drop trigger if exists faculty_audit on public.faculty;
create trigger faculty_audit after insert or update on public.faculty
for each row execute function public.audit_content_change();

drop trigger if exists videos_touch_updated_at on public.videos;
create trigger videos_touch_updated_at before update on public.videos
for each row execute function public.touch_updated_at();
drop trigger if exists videos_audit on public.videos;
create trigger videos_audit after insert or update on public.videos
for each row execute function public.audit_content_change();

alter table public.faculty enable row level security;
alter table public.videos enable row level security;

drop policy if exists "public reads published faculty" on public.faculty;
create policy "public reads published faculty" on public.faculty
for select using (published = true and deleted_at is null);
drop policy if exists "admins manage faculty" on public.faculty;
create policy "admins manage faculty" on public.faculty
for all using (public.is_gtcc_admin()) with check (public.is_gtcc_admin());

drop policy if exists "public reads published videos" on public.videos;
create policy "public reads published videos" on public.videos
for select using (published = true and deleted_at is null);
drop policy if exists "admins manage videos" on public.videos;
create policy "admins manage videos" on public.videos
for all using (public.is_gtcc_admin()) with check (public.is_gtcc_admin());

create or replace function public.restore_content_version(history_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $restore$
declare history_row public.content_history;
begin
  if not public.is_gtcc_admin() then raise exception '관리자 권한이 필요합니다.'; end if;
  select * into history_row from public.content_history where id = history_id;
  if history_row.id is null then raise exception '변경 기록을 찾을 수 없습니다.'; end if;
  if history_row.entity_type not in ('courses', 'notices', 'slides', 'books', 'faculty', 'videos') then
    raise exception '지원하지 않는 콘텐츠 종류입니다.';
  end if;
  if history_row.before_data is null then
    execute format('update public.%I set published = false, deleted_at = now() where id = $1', history_row.entity_type)
    using history_row.entity_id;
    return;
  end if;
  execute format('delete from public.%I where id = $1', history_row.entity_type) using history_row.entity_id;
  execute format('insert into public.%I select * from jsonb_populate_record(null::public.%I, $1)', history_row.entity_type, history_row.entity_type)
  using history_row.before_data;
end;
$restore$;
revoke all on function public.restore_content_version(bigint) from public;
grant execute on function public.restore_content_version(bigint) to authenticated;

create or replace function public.reorder_faculty(faculty_ids uuid[])
returns setof public.faculty
language plpgsql security definer set search_path = public
as $$
declare item_id uuid; item_position integer := 0;
begin
  if not public.is_gtcc_admin() then raise exception '관리자 권한이 필요합니다.'; end if;
  foreach item_id in array faculty_ids loop
    update public.faculty set sort_order = item_position * 10 where id = item_id and deleted_at is null;
    item_position := item_position + 1;
  end loop;
  return query select * from public.faculty where id = any(faculty_ids) and deleted_at is null order by sort_order;
end;
$$;
revoke all on function public.reorder_faculty(uuid[]) from public;
grant execute on function public.reorder_faculty(uuid[]) to authenticated;

create or replace function public.reorder_videos(video_ids uuid[])
returns setof public.videos
language plpgsql security definer set search_path = public
as $$
declare item_id uuid; item_position integer := 0;
begin
  if not public.is_gtcc_admin() then raise exception '관리자 권한이 필요합니다.'; end if;
  foreach item_id in array video_ids loop
    update public.videos set sort_order = item_position * 10 where id = item_id and deleted_at is null;
    item_position := item_position + 1;
  end loop;
  return query select * from public.videos where id = any(video_ids) and deleted_at is null order by sort_order;
end;
$$;
revoke all on function public.reorder_videos(uuid[]) from public;
grant execute on function public.reorder_videos(uuid[]) to authenticated;

create or replace function public.purge_deleted_content()
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if auth.role() <> 'service_role' and not public.is_gtcc_admin() then raise exception '관리자 권한이 필요합니다.'; end if;
  delete from public.courses where deleted_at < now() - interval '30 days';
  delete from public.notices where deleted_at < now() - interval '30 days';
  delete from public.slides where deleted_at < now() - interval '30 days';
  delete from public.books where deleted_at < now() - interval '30 days';
  delete from public.faculty where deleted_at < now() - interval '30 days';
  delete from public.videos where deleted_at < now() - interval '30 days';
end;
$$;
revoke all on function public.purge_deleted_content() from public;
grant execute on function public.purge_deleted_content() to authenticated;

-- 기존 홈페이지에 보이던 교수진과 영상을 최초 데이터로 등록합니다.
insert into public.faculty (slug, name, role, specialties, bio, image_url, sort_order, published)
values
  ('kim-hyeji', '김 혜지 교수', '상담·아동교육', '상담, 아동교육', '상담과 아동교육 분야의 현장 경험을 바탕으로 학습자의 성장을 돕습니다.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=640&q=82', 0, true),
  ('jonalyn', 'JONALYN 교수', 'TESOL·영어실무', 'TESOL, 영어실무', '영어교육 이론과 실제 수업 경험을 연결하는 실무 중심 교육을 진행합니다.', 'assets/hero-slides/조나.png', 10, true),
  ('kim-naksin', '김 낙신 교수', '탐정학·경비학실무', '탐정학, 경비학실무', '탐정 및 경비 분야의 전문 지식과 현장 사례를 알기 쉽게 전달합니다.', 'assets/hero-slides/@@001.jpg', 20, true)
on conflict (slug) do nothing;

insert into public.videos (title, caption, youtube_url, sort_order, published)
select '온라인 강의 미리보기', '핵심 개념부터 시험 대비까지', 'https://youtu.be/Oo6xlkKzxZs', 0, true
where not exists (select 1 from public.videos);
