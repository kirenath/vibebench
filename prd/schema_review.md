# 🔍 Codex SQL Schema 审阅报告

> 审阅对象：[001_initial_schema.sql](file:///c:/webDev/vibebench/sql/001_initial_schema.sql)
> 对照文档：[prd.md](file:///c:/webDev/vibebench/prd/prd.md)

---

## ✅ 做得好的地方

| 项 | 评价 |
|---|---|
| **PRD 一致性** | 7 张表 + 1 个视图完全对齐 PRD §2.1 和 §5.6，没有遗漏也没有私加 |
| **模型三层拆分** | `vendors → model_families → model_variants`，严格遵循 PRD 的层级设计 |
| **约束覆盖** | `submissions` 上加了 `iteration_count >= 0`、`duration_ms >= 0`、`run_finished_at >= run_started_at`、`published_at` 依赖 `is_published` 等业务约束，很细致 |
| **唯一约束** | `(challenge_phase_id, model_variant_id, channel_id)` 保证同一组合只有一条 submission，对齐 PRD §3.2 的覆盖逻辑 |
| **`challenge_phases` 默认项** | 用 partial unique index 保证每个 challenge 最多一个 `is_default = true`，思路正确 |
| **`submission_overview` 视图** | 预组装了前端需要的所有字段 + `has_html / has_prd / has_screenshot` 标记，减少前端多次联表 |
| **`updated_at` 自动触发器** | 每张表都挂了 trigger，省去应用层手动维护 |
| **事务包裹** | `BEGIN ... COMMIT` 包裹整个 DDL，原子执行 |
| **中文注释** | 每张表都有 `COMMENT`，后续维护友好 |

---

## ⚠️ 建议改进

### 1. `timing_method` 缺少约束

```sql
-- 当前
timing_method text,

-- 建议加 CHECK
timing_method text CHECK (
  timing_method IS NULL 
  OR timing_method IN ('manual', 'measured', 'estimated')
),
```

> [!NOTE]
> PRD §5.6 下方说"建议把 `timing_method` 等合法值放在应用层常量中统一校验"。这条建议本身没问题，但 Codex 的 SQL 里**既没有数据库约束，也没有在注释里说明合法值**。至少应该加个注释或 CHECK，否则极容易写入脏数据。权衡一下：如果你确定 MVP 只有你一个人操作，应用层校验即可；如果未来有迁移脚本或 PR 导入，建议加 CHECK。

---

### 2. `submission_artifacts.type` 缺少约束

同上，`type` 字段没有限制合法值。PRD 提到合法值为 `html / prd / screenshot`。

```sql
-- 建议
type text NOT NULL CHECK (type IN ('html', 'prd', 'screenshot')),
```

---

### 3. `challenges.published_at` 的约束命名有误导

```sql
constraint challenges_published_at_requires_public
  check (published_at is null or is_published)
```

约束名里的 `public` 容易和 PostgreSQL 的 `public` schema 混淆，建议改为：

```sql
constraint challenges_published_at_requires_published
```

同理 `submissions_published_at_requires_public` → `submissions_published_at_requires_published`。

---

### 4. `submission_artifacts` 的 `(submission_id, type)` 唯一约束可能过于严格

当前设计：**每个 submission 每种 type 只能有一个 artifact**。

但 PRD §5.7 文件结构里 `html/` 目录下有 `index.html` + `assets/...`，意味着一个 HTML 作品可能包含多个文件。如果你打算把每个文件都记录为一条 `submission_artifacts`，那这个唯一约束就会冲突。

> [!IMPORTANT]
> **需要确认**：`submission_artifacts` 的一条记录代表的是"一个 artifact 类型的根目录"还是"一个具体文件"？
> - 如果是根目录（如 `html/`），当前设计 OK
> - 如果是具体文件，需要移除 `(submission_id, type)` 唯一约束，改为 `(submission_id, type, file_path)` 

---

### 5. 缺少 `challenges.published_at` 的自动设置逻辑

当 `is_published` 从 `false` 改为 `true` 时，`published_at` 应该自动填充。当前 schema 没有这个 trigger，需要在应用层实现。同理 `submissions.published_at`。

不是 bug，但建议在注释里明确 **"published_at 由应用层在发布时写入"**。

---

### 6. `submission_artifacts` 的 `submission_id` 索引略冗余

```sql
create index submission_artifacts_submission_idx
  on public.submission_artifacts (submission_id);
```

但已经有唯一约束 `(submission_id, type)`，PostgreSQL 会自动为唯一约束创建索引。如果大部分查询都是 `WHERE submission_id = ? AND type = ?`，那唯一约束的索引已经覆盖了 `submission_id` 前缀查询，这个单独索引是冗余的。

> [!TIP]
> 不删也没大问题（浪费点存储），但在 MVP 数据量下完全可以去掉。

---

### 7. 视图中 `has_html/has_prd/has_screenshot` 使用 correlated subquery

```sql
exists (
  select 1
  from public.submission_artifacts sa
  where sa.submission_id = s.id
    and sa.type = 'html'
) as has_html,
```

这是 3 个相关子查询。数据量小的时候无所谓，但如果 submission 多了，可以考虑改为 `LEFT JOIN` + `BOOL_OR` 或用 lateral join。

> [!TIP]
> **MVP 阶段这样写完全没问题**，8 个模型 x 几个 challenge 的数据量不需要优化。只是提前标记一下。

---

## 🔎 PRD vs Schema 对照检查

| PRD 要求 | Schema 是否满足 | 备注 |
|----------|:---:|------|
| Vendor → Family → Variant 三层 | ✅ | |
| Channel 独立表 | ✅ | |
| Challenge + Phase 分表 | ✅ | |
| Phase 隶属 Challenge 不是全局枚举 | ✅ | `challenge_phases.challenge_id FK` |
| 每个 challenge 最多一个默认 phase | ✅ | partial unique index |
| Submission 唯一键 = phase + variant + channel | ✅ | |
| `manual_touched` + `manual_notes` | ✅ | |
| `iteration_count` / `duration_ms` / `timing_method` | ✅ | |
| `run_started_at` / `run_finished_at` | ✅ | |
| `prompt_snapshot` | ✅ | |
| `metadata jsonb` 灵活扩展 | ✅ | 每张表都有 |
| Artifact 按 type 区分 (html/prd/screenshot) | ✅ | |
| `checksum` / `file_size` / `mime_type` | ✅ | |
| 不保留历史版本 | ✅ | 唯一约束保证 |
| `is_published` + `published_at` 发布开关 | ✅ | challenge 和 submission 都有 |
| `pgcrypto` extension | ✅ | 用于 `gen_random_uuid()` |

---

## 📊 总评

| 维度 | 评分 |
|------|:---:|
| PRD 一致性 | ⭐⭐⭐⭐⭐ |
| 约束完整性 | ⭐⭐⭐⭐ |
| 索引设计 | ⭐⭐⭐⭐ |
| 命名规范 | ⭐⭐⭐⭐ |
| 可维护性 | ⭐⭐⭐⭐⭐ |

**总结**：Codex 这份 schema 质量很高，和 PRD 的对齐度几乎是 1:1 的。主要问题集中在**缺少合法值约束**（`timing_method`、`artifact type`）和一些**命名/冗余索引**的小瑕疵。无严重设计缺陷。

> 老实说，如果满分 10 分我给 **8.5 分** — 扣的分主要在 `timing_method` 和 `artifact.type` 没加约束。
