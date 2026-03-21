<div align="center">
  <h1>VibeBench</h1>
  <p>同一道前端题，让不同 AI 来做，看看各自 vibe 出了什么</p>
</div>

<p align="center">
  <a href="#这是什么">这是什么</a> ·
  <a href="#当前状态">当前状态</a> ·
  <a href="#仓库内容">仓库内容</a> ·
  <a href="#计划中的核心体验">核心体验</a> ·
  <a href="#数据模型">数据模型</a> ·
  <a href="#下一步计划">下一步计划</a>
</p>

---

## 这是什么

VibeBench 是一个 **AI Vibe Coding 展览与横评平台**。

它围绕同一道前端挑战题（Challenge），收集不同 AI 模型的产出，让你可以：

- 浏览同一题下不同模型的作品
- 按阶段（Phase）切换结果
- 发起 2 个作品的并排对比
- 查看每个作品的实现说明、生成背景和人工修订标记

> 这不是跑分 Benchmark，没有统一评分体系。  
> 这不是论文仓库，表达会偏轻松和可分享。  
> 这是一个把不同 AI "手艺"摆到一起看的展示橱窗。

## 当前状态

当前仓库已完成 **MVP 应用骨架**，包含完整的前后端代码：

- Next.js 16 (App Router + TypeScript) 应用
- 公开页面：首页、赛题列表/详情、模型目录/详情、横评对比
- Admin 后台：登录、赛题管理、模型管理、作品管理
- 完整 REST API（CRUD for challenges, models, submissions, artifacts）
- HTML 作品沙箱渲染
- Organic/Natural 设计系统（Fraunces + Nunito 字体、grain texture）
- PostgreSQL 初始 Schema + 环境变量模板

## 仓库内容

```text
vibebench/
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   ├── components/       # Shared UI components
│   └── lib/              # DB, auth, upload, constants
├── prd/
│   ├── prd.md            # Product requirements
│   └── design.md         # Design system spec
├── sql/
│   └── 001_initial_schema.sql
├── .env.example
├── package.json
└── tailwind.config.ts
```

### `prd/prd.md`

完整的产品定义文档，覆盖：

- 项目定位与 MVP 边界
- 核心对象与展示规则
- 页面与后台需求
- 安全策略、环境变量和 API 规划

### `sql/001_initial_schema.sql`

当前版本的 PostgreSQL 初始数据库结构，包含：

- `vendors`
- `model_families`
- `model_variants`
- `channels`
- `challenges`
- `challenge_phases`
- `submissions`
- `submission_artifacts`
- `submission_overview` 视图

## 计划中的核心体验

这些是项目要实现的核心能力，不代表它们已经全部完成：

### 首页

- 展示平台介绍和已发布挑战题
- 快速进入最近更新或推荐对比

### 展题详情

- 展示挑战题描述、规则说明和 Prompt
- 按 Phase 切换作品
- 查看作品元信息、PRD 和人工修订说明
- 在安全沙箱中实时预览 HTML 作品

### 横评对比

- 选择 2 个作品并排对比（1v1 横评）
- 桌面端左右分栏布局，移动端标签切换
- 支持分享链接复现当前对比配置

### 模型目录

- 按厂商、产品线、模型版本浏览
- 查看某个模型参与过哪些挑战题

### Admin 后台

- 管理员登录
- 赛题、模型、作品的 CRUD
- 控制作品与赛题的发布状态

## 技术方向

以下是当前确定的技术方向，同样属于规划中的实现方案：

| 层 | 方案 |
|---|---|
| 前端 | Next.js 16（App Router + TypeScript） |
| 数据库 | PostgreSQL（优先 Supabase） |
| 文件存储 | 本地 `uploads/`，后续可迁移 S3 / R2 |
| 认证 | 单管理员密码 + JWT Cookie |
| 部署 | PM2 + Cloudflare Tunnel |
| 域名 | Cloudflare 管理 |

## 数据模型

```text
Vendor → Model Family → Model Variant
                                    ↘
Challenge → Challenge Phase → Submission → Artifact
                                    ↗
                              Channel
```

- **Vendor**：模型厂商，如 OpenAI、Anthropic
- **Model Family**：产品线，如 ChatGPT、Codex
- **Model Variant**：具体版本，如 `gpt-5.4-pro`
- **Channel**：调用渠道，如 `web`、`api`、`codex-app`
- **Challenge**：一道前端挑战题
- **Challenge Phase**：某个挑战题下的阶段配置
- **Submission**：某个 `phase + model + channel` 下的展示单元
- **Artifact**：Submission 的附件，如 HTML、PRD、截图

更完整的字段设计和业务约束见 [prd/prd.md](prd/prd.md) 与 [sql/001_initial_schema.sql](sql/001_initial_schema.sql)。

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
psql "$DATABASE_URL" -f sql/001_initial_schema.sql
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local 填入实际值
```

生成管理员密码哈希：

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 12).then(h => console.log(h))"
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 下一步计划

- 编写 `receipt` 赛题数据迁移脚本 `scripts/migrate-receipt.ts`
- 缩略图预览（自动截图）
- 动态 Open Graph 图片
- 模型目录筛选功能完善
- 对比页同步滚动

## 贡献建议

在应用代码落地前，最有价值的贡献主要是：

- 对 PRD 提需求、提反例、补边界条件
- 对数据库 Schema 提命名、一致性和扩展性建议
- 对展示规则、公平性规则和版权边界提出修改意见

如果后续开放作品收录和社区投稿，README 会再补充更明确的提交流程。
