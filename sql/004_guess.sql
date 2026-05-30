-- 004_guess.sql
-- 增量迁移：/guess "猜模型" 功能
-- 在已执行过 001 + 002 + 003 的数据库上运行
--
-- 设计要点：
--  - 复用 eval 的浏览器指纹方案（FingerprintJS visitorId），同一玩家 guess/eval 共用同一指纹
--  - guess_players：指纹 -> 自定义名称的映射，is_author 标记作者作为胜率对比基准
--  - guess_attempts：每答一题落一行，可按玩家/难度聚合胜率，并做模型"拟人度"统计
--  - 写入由应用层（service_role / 直连 pg）完成；answer 接口需先 upsert guess_players 再插 attempt

begin;

-- ============================================================
-- 1. guess_players：玩家档案（指纹 -> 名称）
-- ============================================================

create table public.guess_players (
  player_token text primary key,
  display_name text,
  is_author boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guess_players_token_nonempty
    check (btrim(player_token) <> '' and char_length(player_token) <= 255),
  constraint guess_players_name_len
    check (
      display_name is null
      or (btrim(display_name) <> '' and char_length(display_name) between 1 and 40)
    )
);

-- 名称大小写 + 首尾空白不敏感唯一（仅当已设置名称时约束）
create unique index guess_players_name_unique_idx
  on public.guess_players (lower(btrim(display_name)))
  where display_name is not null;

-- 作者基准查询用（is_author 玩家很少，部分索引足够）
create index guess_players_author_idx
  on public.guess_players (is_author)
  where is_author;

create trigger set_updated_at_guess_players
before update on public.guess_players
for each row execute function public.set_updated_at();

-- ============================================================
-- 2. guess_attempts：每题作答记录
--    difficulty 语义：
--      easy   -> 选项为 4 个不同 model_family（猜系列）
--      medium -> 选项为不同 family 的 variant（跨系列猜版本）
--      hard   -> 选项为同一 family 的兄弟 variant（同系列内猜版本）
--    guessed_value：玩家所选选项的 id（easy 为 family_id，medium/hard 为 variant_id）
--    options：当题 4 个选项快照（jsonb 数组），用于事后做混淆分析
-- ============================================================

create table public.guess_attempts (
  id uuid primary key default gen_random_uuid(),
  player_token text not null
    references public.guess_players(player_token) on delete cascade,
  session_id uuid not null,
  difficulty text not null,
  submission_id uuid not null
    references public.submissions(id) on delete cascade,
  challenge_phase_id uuid not null
    references public.challenge_phases(id) on delete cascade,
  correct_variant_id text not null
    references public.model_variants(id) on delete cascade,
  guessed_value text not null,
  is_correct boolean not null,
  options jsonb not null,
  duration_ms integer,
  -- 出题 token 的唯一 id：保证同一题只能被提交一次（防止重复计分/重放）
  question_token_id uuid not null,
  created_at timestamptz not null default now(),
  constraint guess_attempts_difficulty_valid
    check (difficulty in ('easy', 'medium', 'hard')),
  constraint guess_attempts_duration_nonnegative
    check (duration_ms is null or duration_ms >= 0),
  -- 选项快照必须是含 4 个选项的 jsonb 数组（由后端出题时写入）
  constraint guess_attempts_options_shape
    check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  -- 每个出题 token 只能落一条作答
  constraint guess_attempts_token_unique
    unique (question_token_id)
);

create index guess_attempts_player_idx
  on public.guess_attempts (player_token, created_at desc);

create index guess_attempts_session_idx
  on public.guess_attempts (session_id, created_at);

create index guess_attempts_difficulty_idx
  on public.guess_attempts (difficulty, is_correct);

-- 模型"拟人度"统计用
create index guess_attempts_variant_idx
  on public.guess_attempts (correct_variant_id, is_correct);

create index guess_attempts_submission_idx
  on public.guess_attempts (submission_id);

-- ============================================================
-- 3. 统计视图
-- ============================================================

-- 3.1 玩家胜率（按难度）—— 作者对比、个人战绩、排行榜共用
create view public.guess_player_stats
  with (security_invoker = true)
as
select
  p.player_token,
  p.display_name,
  p.is_author,
  a.difficulty,
  count(*) as total,
  count(*) filter (where a.is_correct) as correct,
  round(
    100.0 * count(*) filter (where a.is_correct) / nullif(count(*), 0),
    1
  ) as win_rate
from public.guess_players p
join public.guess_attempts a on a.player_token = p.player_token
group by p.player_token, p.display_name, p.is_author, a.difficulty;

-- 3.2 模型"难辨识度 / 拟人度"：某模型作品被展示时被正确认出的比例
--     identify_rate 越低 = 越难被认出 = 越"骗得过人类"
create view public.guess_model_stats
  with (security_invoker = true)
as
select
  a.correct_variant_id as model_variant_id,
  mv.name as model_variant_name,
  mf.id as model_family_id,
  mf.name as model_family_name,
  v.id as vendor_id,
  v.name as vendor_name,
  a.difficulty,
  count(*) as times_shown,
  count(*) filter (where a.is_correct) as times_identified,
  round(
    100.0 * count(*) filter (where a.is_correct) / nullif(count(*), 0),
    1
  ) as identify_rate
from public.guess_attempts a
join public.model_variants mv on mv.id = a.correct_variant_id
join public.model_families mf on mf.id = mv.family_id
join public.vendors v on v.id = mf.vendor_id
group by
  a.correct_variant_id, mv.name, mf.id, mf.name, v.id, v.name, a.difficulty;

-- 3.3 排行榜：有名字 + 达到最低答题量门槛（避免 1/1=100% 刷榜）
create view public.guess_leaderboard
  with (security_invoker = true)
as
select
  player_token,
  display_name,
  is_author,
  difficulty,
  total,
  correct,
  win_rate
from public.guess_player_stats
where display_name is not null
  and total >= 5;

-- ============================================================
-- 4. RLS
--    与 eval 不同：guess 有"正确答案"，绝不能让匿名角色直接写表
--    （否则可伪造 is_correct / correct_variant_id / player_token 刷榜）。
--    本功能所有写入均由 Next API 经受信 pg 连接（service_role / owner）完成，
--    因此仅开放 service_role 写入；公开只读保留（统计走 security_invoker 视图）。
-- ============================================================

alter table public.guess_players enable row level security;
alter table public.guess_attempts enable row level security;

-- guess_players：公开只读 + 仅 service_role 写入
create policy "guess_players_select" on public.guess_players
  for select using (true);
create policy "guess_players_manage" on public.guess_players
  for all to service_role using (true) with check (true);

-- guess_attempts：公开只读 + 仅 service_role 写入
create policy "guess_attempts_select" on public.guess_attempts
  for select using (true);
create policy "guess_attempts_manage" on public.guess_attempts
  for all to service_role using (true) with check (true);

-- ============================================================
-- 5. 注释
-- ============================================================

comment on table public.guess_players is 'guess 玩家档案：浏览器指纹（FingerprintJS visitorId）-> 自定义名称的映射。';
comment on column public.guess_players.player_token is '浏览器指纹，与 eval_votes.voter_token 同源。';
comment on column public.guess_players.display_name is '玩家自定义名称，大小写不敏感唯一；未设置时为 null。';
comment on column public.guess_players.is_author is '是否为作者；前台将作者胜率作为对比基准展示。';

comment on table public.guess_attempts is 'guess 每题作答记录，按玩家/难度聚合胜率，并支撑模型拟人度统计。';
comment on column public.guess_attempts.session_id is '一次答题会话（客户端生成 uuid），聚合 N 题为一局。';
comment on column public.guess_attempts.difficulty is '合法值：easy（猜系列）、medium（跨系列猜版本）、hard（同系列猜版本）。';
comment on column public.guess_attempts.correct_variant_id is '所展示作品的真实模型 variant（正确答案来源）。';
comment on column public.guess_attempts.guessed_value is '玩家所选选项 id：easy 为 family_id，medium/hard 为 variant_id。';
comment on column public.guess_attempts.options is '当题 4 个选项快照（jsonb 数组），用于混淆矩阵等事后分析。';
comment on column public.guess_attempts.question_token_id is '出题 JWT 的唯一 jti，唯一约束保证同一题只能作答一次（防重复计分）。';

comment on view public.guess_player_stats is '玩家胜率（按难度），用于个人战绩、作者对比与排行榜。';
comment on view public.guess_model_stats is '模型难辨识度：identify_rate 越低表示越难被人类认出（越"拟人/大众脸"）。';
comment on view public.guess_leaderboard is '排行榜：仅含已命名且答题数 >= 5 的玩家。';

commit;
