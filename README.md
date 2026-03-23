<div align="center">
  <h1>VibeBench</h1>
  <p>同一道前端题，让不同 AI 来做，看看各自的 vibe 成果</p>
</div>

<p align="center">
  <a href="#这是什么">这是什么</a> ·
  <a href="#当前状态">当前状态</a> ·
  <a href="#仓库内容">仓库内容</a> ·
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

项目已完成 MVP 阶段，具备较完整的展示与评测能力：

- Next.js 16 (App Router + TypeScript) 应用
- 公开页面：首页、赛题列表/详情、模型目录/详情、横评对比
- **盲评对比（Eval）**：匿名展示两个作品，投票后揭示模型身份
- **自由对比（Freestyle）**：任意选择两个作品进行并排对比
- 静态页面：FAQ、Credits、Changelog、Terms、Privacy、License 等
- Admin 后台：登录、赛题管理、模型管理、作品管理，含路由鉴权
- 完整 REST API（CRUD for challenges, models, submissions, artifacts）
- HTML 作品沙箱渲染 + 源代码预览
- Organic/Natural 设计系统
- **Cloudflare R2 对象存储**：静态资源（HTML 作品、PRD、截图）托管于 R2，经 CDN 全球分发
- PostgreSQL Schema（含安全加固）+ 环境变量模板

## 仓库内容

```text
vibebench/
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   ├── components/       # Shared UI components
│   ├── lib/
│   │   ├── db.ts         # PostgreSQL 连接池
│   │   ├── auth.ts       # JWT 认证
│   │   ├── r2.ts         # Cloudflare R2 存储客户端
│   │   ├── upload.ts     # 文件上传（→ R2）
│   │   ├── constants.ts  # 环境变量 & 全局常量
│   │   └── ...           # api-helpers, site-config
│   └── middleware.ts     # Auth middleware
├── sql/
│   ├── 001_initial_schema.sql
│   ├── 002_eval_votes.sql
│   └── 003_security_fixes.sql
├── .env.example
├── LICENSE
├── package.json
└── tailwind.config.ts
```

### `sql/`

PostgreSQL 数据库结构与迁移脚本：

- `001_initial_schema.sql` — 初始表结构
- `002_eval_votes.sql` — 盲评投票表
- `003_security_fixes.sql` — 安全加固（RLS 策略等）

## 技术栈

| 层 | 方案 |
|---|---|
| 前端 | Next.js 16（App Router + TypeScript） |
| 数据库 | PostgreSQL（Supabase） |
| 对象存储 | Cloudflare R2（S3 兼容） |
| 认证 | 单管理员密码 + JWT Cookie |

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

更完整的字段设计见 [sql/](sql/) 目录下的数据库脚本。

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 初始化数据库

```bash
psql "$DATABASE_URL" -f sql/001_initial_schema.sql
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local 填入实际值（含 R2_* 系列变量）
```

生成管理员密码哈希：

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 12).then(h => console.log(h))"
```

### 4. 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 下一步计划

- 缩略图预览（自动截图）
- 动态 Open Graph 图片
- 模型目录筛选功能完善
- 对比页同步滚动

## 参与方式

欢迎通过 **[GitHub Issues](https://github.com/kirenath/vibebench/issues)** 或 **[Discussions](https://github.com/kirenath/vibebench/discussions)** 参与交流，这是目前最推荐的反馈方式。

> **为什么不用 PR？**  
> GitHub PR 流程较重（需要 fork、创建分支、选择目标分支等），对于当前项目阶段来说过于繁琐。  
> 如果你有想法或建议，直接开 Issue 或在 Discussions 里发帖就好！

### 适合通过 [Issue](https://github.com/kirenath/vibebench/issues/new/choose) 提交的内容

- 🎨 **作品投稿**（请使用 Issue 模板，附上模型、挑战题、Phase 等信息）
- 🐛 Bug 报告（页面异常、渲染问题等）
- 💡 功能建议或改进想法
- 📝 对 PRD 提需求、提反例、补边界条件
- 🗄️ 对数据库 Schema 提命名、一致性和扩展性建议
- ⚖️ 对展示规则、公平性规则和版权边界提出修改意见

### 适合通过 [Discussions](https://github.com/kirenath/vibebench/discussions) 讨论的内容

- 🤔 开放性问题和想法碰撞
- 📊 对评测标准和展示方式的讨论
- 🎨 设计和用户体验反馈
- 🔧 技术方案探讨
- 💬 挑战题提议和社区投稿意向

## 许可证

本项目基于 [AGPL-3.0](LICENSE) 许可证开源。

> **AGPL-3.0 简述**：你可以自由使用、修改和分发本项目代码，但如果你修改后通过网络提供服务（如部署为网站），必须公开你修改后的完整源代码，并同样以 AGPL-3.0 发布。

- **平台代码**：以 AGPL-3.0 许可证开源
- **维护者内容**：赛题提示词、HTML 评测成果及相关说明文档，同样适用 AGPL-3.0
- **第三方贡献内容**：版权归原作者所有，不纳入平台开源范围
- **品牌与第三方素材**：分别归属于各自的权利人

详见 [许可与版权](https://vibebench.app/license) 页面。
