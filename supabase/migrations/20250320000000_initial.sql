begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.vendors (
  id text primary key,
  name text not null,
  description text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.model_families (
  id text primary key,
  vendor_id text not null references public.vendors(id) on delete restrict,
  name text not null,
  description text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.model_variants (
  id text primary key,
  family_id text not null references public.model_families(id) on delete restrict,
  name text not null,
  description text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.channels (
  id text primary key,
  name text not null,
  description text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.challenges (
  id text primary key,
  title text not null,
  description text,
  rules_markdown text,
  prompt_markdown text,
  cover_image text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint challenges_published_at_requires_published
    check (published_at is null or is_published)
);

create table public.challenge_phases (
  id uuid primary key default gen_random_uuid(),
  challenge_id text not null references public.challenges(id) on delete cascade,
  phase_key text not null,
  phase_label text not null,
  description text,
  sort_order integer not null default 0,
  is_default boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint challenge_phases_unique_key unique (challenge_id, phase_key)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_phase_id uuid not null references public.challenge_phases(id) on delete cascade,
  model_variant_id text not null references public.model_variants(id) on delete restrict,
  channel_id text not null references public.channels(id) on delete restrict,
  is_published boolean not null default false,
  manual_touched boolean not null default false,
  manual_notes text,
  iteration_count integer,
  run_started_at timestamptz,
  run_finished_at timestamptz,
  duration_ms bigint,
  timing_method text,
  prompt_snapshot text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint submissions_unique_current unique (challenge_phase_id, model_variant_id, channel_id),
  constraint submissions_iteration_count_nonnegative
    check (iteration_count is null or iteration_count >= 0),
  constraint submissions_duration_ms_nonnegative
    check (duration_ms is null or duration_ms >= 0),
  constraint submissions_run_window_valid
    check (
      run_started_at is null
      or run_finished_at is null
      or run_finished_at >= run_started_at
    ),
  constraint submissions_published_at_requires_published
    check (published_at is null or is_published),
  constraint submissions_timing_method_valid
    check (
      timing_method is null
      or timing_method in ('manual', 'measured', 'estimated')
    )
);

create table public.submission_artifacts (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  type text not null,
  file_path text not null,
  file_name text not null,
  mime_type text,
  checksum text,
  file_size bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint submission_artifacts_unique_type unique (submission_id, type),
  constraint submission_artifacts_type_valid
    check (type in ('html', 'prd', 'screenshot')),
  constraint submission_artifacts_file_size_nonnegative
    check (file_size is null or file_size >= 0)
);

create index vendors_sort_idx
  on public.vendors (sort_order, name);

create index channels_sort_idx
  on public.channels (sort_order, name);

create index model_families_vendor_sort_idx
  on public.model_families (vendor_id, sort_order, name);

create index model_variants_family_sort_idx
  on public.model_variants (family_id, sort_order, name);

create index challenges_published_sort_idx
  on public.challenges (is_published, sort_order, title)
  where is_published;

create index challenge_phases_challenge_sort_idx
  on public.challenge_phases (challenge_id, sort_order, phase_label);

create unique index challenge_phases_one_default_per_challenge_idx
  on public.challenge_phases (challenge_id)
  where is_default;

create index submissions_phase_publish_idx
  on public.submissions (challenge_phase_id, is_published, created_at desc);

create index submissions_variant_channel_idx
  on public.submissions (model_variant_id, channel_id, created_at desc);

create index submissions_public_idx
  on public.submissions (is_published, published_at desc nulls last);

create index submission_artifacts_type_idx
  on public.submission_artifacts (type);

create trigger set_updated_at_vendors
before update on public.vendors
for each row execute function public.set_updated_at();

create trigger set_updated_at_model_families
before update on public.model_families
for each row execute function public.set_updated_at();

create trigger set_updated_at_model_variants
before update on public.model_variants
for each row execute function public.set_updated_at();

create trigger set_updated_at_channels
before update on public.channels
for each row execute function public.set_updated_at();

create trigger set_updated_at_challenges
before update on public.challenges
for each row execute function public.set_updated_at();

create trigger set_updated_at_challenge_phases
before update on public.challenge_phases
for each row execute function public.set_updated_at();

create trigger set_updated_at_submissions
before update on public.submissions
for each row execute function public.set_updated_at();

create trigger set_updated_at_submission_artifacts
before update on public.submission_artifacts
for each row execute function public.set_updated_at();

create view public.submission_overview as
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

comment on table public.vendors is '模型厂商，例如 OpenAI、Anthropic。';
comment on table public.model_families is '模型产品线，例如 ChatGPT、Codex。';
comment on table public.model_variants is '具体模型版本，例如 gpt-5.4-pro。';
comment on table public.channels is '调用渠道，例如 web、api、codex-app。';
comment on table public.challenges is '挑战题目定义。';
comment on table public.challenge_phases is 'challenge 自带的 phase 配置。';
comment on table public.submissions is '某个 challenge phase + model variant + channel 下的当前作品。';
comment on table public.submission_artifacts is 'submission 的逻辑附件，如 html、prd、screenshot。';
comment on view public.submission_overview is '供前端直接读取的 submission 汇总视图。';
comment on column public.challenges.published_at is '由应用层在发布 challenge 时写入。';
comment on column public.submissions.manual_touched is '该作品是否经过人工修改，前台展示时需明显标记。';
comment on column public.submissions.published_at is '由应用层在发布 submission 时写入。';
comment on column public.submissions.timing_method is '合法值：manual、measured、estimated。';
comment on column public.submission_artifacts.checksum is '文件 checksum，用于去重和完整性校验。';
comment on column public.submission_artifacts.type is '合法值：html、prd、screenshot。';
comment on column public.submission_artifacts.file_path is '指向逻辑 artifact 的入口文件或主文件；html 资源目录下的 assets 不单独建行。';

commit;
