-- 기존 GTCC Supabase 프로젝트에 공지 이미지와 링크 기능을 추가합니다.
-- Supabase > SQL Editor에서 이 파일 전체를 한 번 실행하세요.

alter table public.notices add column if not exists image_url text;
alter table public.notices add column if not exists link_url text;
alter table public.notices add column if not exists link_label text;

-- 변경 기록에서 이전 공지로 복구할 때 이미지와 링크도 함께 복원합니다.
create or replace function public.restore_content_version(history_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
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

  if history_row.before_data is null then
    execute format(
      'update public.%I set published = false, deleted_at = now() where id = $1',
      history_row.entity_type
    ) using history_row.entity_id;
    return;
  end if;

  if history_row.entity_type = 'courses' then
    insert into public.courses
    select * from jsonb_populate_record(null::public.courses, history_row.before_data)
    on conflict (id) do update set
      slug = excluded.slug,
      title = excluded.title,
      category = excluded.category,
      group_key = excluded.group_key,
      image_url = excluded.image_url,
      tags = excluded.tags,
      summary = excluded.summary,
      curriculum = excluded.curriculum,
      duration = excluded.duration,
      exam_type = excluded.exam_type,
      benefit_label = excluded.benefit_label,
      sort_order = excluded.sort_order,
      published = excluded.published,
      deleted_at = excluded.deleted_at;
  elsif history_row.entity_type = 'notices' then
    insert into public.notices
    select * from jsonb_populate_record(null::public.notices, history_row.before_data)
    on conflict (id) do update set
      number = excluded.number,
      title = excluded.title,
      body = excluded.body,
      image_url = excluded.image_url,
      link_url = excluded.link_url,
      link_label = excluded.link_label,
      author = excluded.author,
      published_at = excluded.published_at,
      published = excluded.published,
      deleted_at = excluded.deleted_at;
  elsif history_row.entity_type = 'slides' then
    insert into public.slides
    select * from jsonb_populate_record(null::public.slides, history_row.before_data)
    on conflict (id) do update set
      image_url = excluded.image_url,
      alt_text = excluded.alt_text,
      sort_order = excluded.sort_order,
      published = excluded.published,
      deleted_at = excluded.deleted_at;
  end if;
end;
$$;

revoke all on function public.restore_content_version(bigint) from public;
grant execute on function public.restore_content_version(bigint) to authenticated;
