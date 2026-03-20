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
- 发起 2 到 4 个作品的并排对比
- 查看每个作品的实现说明、生成背景和人工修订标记

> 这不是跑分 Benchmark，没有统一评分体系。  
> 这不是论文仓库，表达会偏轻松和可分享。  
> 这是一个把不同 AI "手艺"摆到一起看的展示橱窗。

## 当前状态

当前仓库还处在 **产品定义 + 数据结构落地** 阶段，不是完整可运行的 Web 应用。

目前已经提交到仓库的内容主要是：

- 产品需求文档（PRD）
- PostgreSQL 初始 Schema
- 项目级 README

还没有提交的内容包括：

- Next.js 应用代码
- Admin 后台实现
- 上传与沙箱渲染逻辑
- 环境变量模板、启动脚本和迁移脚本

如果你是第一次打开这个仓库，建议把它理解为：**一个正在成形的项目骨架**，而不是已经可以 `npm install && npm run dev` 的成品仓库。

## 仓库内容

```text
vibebench/
├── README.md
├── prd/
│   └── prd.md
└── sql/
    └── 001_initial_schema.sql
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
| 前端 | Next.js（App Router + TypeScript） |
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

## 本地查看

当前仓库没有应用代码，因此不存在完整的开发启动流程。

如果你现在想本地查看这个项目，主要有两种方式：

### 1. 阅读 PRD

直接打开 [prd/prd.md](prd/prd.md)，查看完整的产品和实现规划。

### 2. 初始化数据库 Schema

如果你想先验证数据结构，可以在本地 PostgreSQL 中执行：

```bash
psql "$DATABASE_URL" -f sql/001_initial_schema.sql
```

执行后你会得到项目当前定义的表、索引、触发器和 `submission_overview` 视图。

## 下一步计划

- 提交首版 Next.js 应用骨架
- 落地公开页面：首页、赛题详情页、横评对比页
- 落地 Admin 登录与内容管理后台
- 接入基于文件的 HTML 作品存储与沙箱渲染
- 补齐 `.env.example`、脚本、许可证和贡献文档

## 贡献建议

在应用代码落地前，最有价值的贡献主要是：

- 对 PRD 提需求、提反例、补边界条件
- 对数据库 Schema 提命名、一致性和扩展性建议
- 对展示规则、公平性规则和版权边界提出修改意见

如果后续开放作品收录和社区投稿，README 会再补充更明确的提交流程。
