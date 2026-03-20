# 手动修改记录

> 本文件记录所有对 AI 原始输出代码所做的人工修改。

## 环境配置（不涉及代码修改）

- 创建了 `.env.local` 配置 Supabase 数据库连接
- 在 Supabase SQL Editor 中执行了 `20250320000000_initial.sql` 建表
- 使用 Supabase Transaction Pooler（端口 6543）连接数据库

## 手动修改（由 Antigravity 协助）

- 更新了 `.gitignore`：添加临时文件排除（`提示词.md`、`tree.md`）、`uploads/` 目录、OS 文件（`.DS_Store`、`Thumbs.db`）
