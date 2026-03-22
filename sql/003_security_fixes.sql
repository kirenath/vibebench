-- 003_security_fixes.sql
-- 增量迁移：修复 Supabase 安全检查的 3 类问题
-- 在已执行过 001 + 002 的数据库上运行

begin;

-- ============================================================
-- 1. Fix: submission_overview 视图使用了 SECURITY DEFINER
--    改为 security_invoker = true
-- ============================================================

drop view if exists public.submission_overview;

create view public.submission_overview
  with (security_invoker = true)
as
select
  s.id as submission_id,
  c.id as challenge_id,
  c.title as challenge_title,
  c.is_published as challenge_is_published,
  cp.id as challenge_phase_id,
  cp.phase_key,
  cp.phase_label,
  cp.sort_order as phase_sort_order,
  v.id as vendor_id,
  v.name as vendor_name,
  mf.id as model_family_id,
  mf.name as model_family_name,
  mv.id as model_variant_id,
  mv.name as model_variant_name,
  ch.id as channel_id,
  ch.name as channel_name,
  s.is_published as submission_is_published,
  s.manual_touched,
  s.manual_notes,
  s.iteration_count,
  s.run_started_at,
  s.run_finished_at,
  s.duration_ms,
  s.timing_method,
  s.prompt_snapshot,
  s.notes,
  s.metadata,
  s.published_at,
  s.created_at,
  s.updated_at,
  exists (
    select 1
    from public.submission_artifacts sa
    where sa.submission_id = s.id
      and sa.type = 'html'
  ) as has_html,
  exists (
    select 1
    from public.submission_artifacts sa
    where sa.submission_id = s.id
      and sa.type = 'prd'
  ) as has_prd,
  exists (
    select 1
    from public.submission_artifacts sa
    where sa.submission_id = s.id
      and sa.type = 'screenshot'
  ) as has_screenshot
from public.submissions s
join public.challenge_phases cp on cp.id = s.challenge_phase_id
join public.challenges c on c.id = cp.challenge_id
join public.model_variants mv on mv.id = s.model_variant_id
join public.model_families mf on mf.id = mv.family_id
join public.vendors v on v.id = mf.vendor_id
join public.channels ch on ch.id = s.channel_id;

comment on view public.submission_overview is '供前端直接读取的 submission 汇总视图。';

-- ============================================================
-- 2. Warning: set_updated_at 函数 search_path 可变
--    加上 SET search_path = ''
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 3. Info: 9 张表启用了 RLS 但没有 Policy
--    添加 SELECT 公开 + service_role 完整权限的策略
--    eval_votes 额外开放匿名 INSERT（投票用）
-- ============================================================

-- vendors
create policy "vendors_select" on public.vendors
  for select using (true);
create policy "vendors_manage" on public.vendors
  for all to service_role using (true) with check (true);

-- model_families
create policy "model_families_select" on public.model_families
  for select using (true);
create policy "model_families_manage" on public.model_families
  for all to service_role using (true) with check (true);

-- model_variants
create policy "model_variants_select" on public.model_variants
  for select using (true);
create policy "model_variants_manage" on public.model_variants
  for all to service_role using (true) with check (true);

-- channels
create policy "channels_select" on public.channels
  for select using (true);
create policy "channels_manage" on public.channels
  for all to service_role using (true) with check (true);

-- challenges
create policy "challenges_select" on public.challenges
  for select using (true);
create policy "challenges_manage" on public.challenges
  for all to service_role using (true) with check (true);

-- challenge_phases
create policy "challenge_phases_select" on public.challenge_phases
  for select using (true);
create policy "challenge_phases_manage" on public.challenge_phases
  for all to service_role using (true) with check (true);

-- submissions
create policy "submissions_select" on public.submissions
  for select using (true);
create policy "submissions_manage" on public.submissions
  for all to service_role using (true) with check (true);

-- submission_artifacts
create policy "submission_artifacts_select" on public.submission_artifacts
  for select using (true);
create policy "submission_artifacts_manage" on public.submission_artifacts
  for all to service_role using (true) with check (true);

-- eval_votes
create policy "eval_votes_select" on public.eval_votes
  for select using (true);
create policy "eval_votes_insert" on public.eval_votes
  for insert with check (voter_token <> '');
create policy "eval_votes_manage" on public.eval_votes
  for all to service_role using (true) with check (true);

commit;
