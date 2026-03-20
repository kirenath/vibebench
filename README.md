# VibeBench

第一阶段目标是先完成项目初始化、Supabase 接入、schema 落库流程接线，以及最小数据读取链路。

## 本地开发

1. 安装依赖：

```bash
npm install
```

2. 复制环境变量模板并填写：

```bash
copy .env.example .env.local
```

当前阶段至少需要填这两个变量才能打通最小读取：

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

`NEXT_PUBLIC_SUPABASE_ANON_KEY` 已预留，但当前最小链路不依赖它。

3. 手动执行 schema：

- 方式一：在 Supabase SQL Editor 中执行 [`sql/001_initial_schema.sql`](./sql/001_initial_schema.sql)
- 方式二：使用 Supabase CLI 执行 [`supabase/migrations/20260320190000_initial_schema.sql`](./supabase/migrations/20260320190000_initial_schema.sql)

4. 启动开发环境：

```bash
npm run dev
```

5. 访问以下地址验证：

- `/`：查看最小首页和数据库统计
- `/api/health`：检查环境变量和数据库连通性
- `/api/challenges`：读取已发布 challenge 列表

## 当前最小链路

- 使用 `SUPABASE_SERVICE_ROLE_KEY` 在服务端读取 `public` schema
- 读取已发布 `challenges`、已发布 `submissions`，以及 `submission_overview` 中可对比的 HTML 条目数
- 暂不做复杂 UI、不做后台、不做上传流程

## 说明

- 现有 schema 还没有补 RLS / policy，所以 phase 1 的最小读取走服务端 service role，避免前端直接暴露高权限 key。
- 公开接口目前只返回已发布 challenge，首页统计也只展示公开数据。
