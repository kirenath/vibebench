import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";

export const metadata: Metadata = {
  title: "Powered By — VibeBench",
  description: "构建与运行 VibeBench 的核心技术栈、基础设施和开源依赖。",
};

export default function PoweredByPage() {
  return (
    <StaticPageLayout
      eyebrow="Tech Stack"
      title="技术支持"
      description="构建与运行 VibeBench 的核心技术栈、基础设施和开源依赖。"
      updatedAt="2026 年 3 月 22 日"
    >
      <h2>前端框架</h2>
      <ul>
        <li>
          <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
            <strong>Next.js 16</strong>
          </a>{" "}
          (App Router) — React 全栈框架，提供服务端渲染、路由和 API 层
        </li>
        <li>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            <strong>React 19</strong>
          </a>{" "}
          — 声明式 UI 构建
        </li>
        <li>
          <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer">
            <strong>Tailwind CSS 3</strong>
          </a>{" "}
          — 原子化 CSS 方案
        </li>
      </ul>

      <h2>数据与后端</h2>
      <ul>
        <li>
          <a href="https://www.postgresql.org" target="_blank" rel="noopener noreferrer">
            <strong>PostgreSQL</strong>
          </a>{" "}
          (via{" "}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
            Supabase
          </a>
          ) — 托管数据库，存储挑战题、模型信息和作品数据
        </li>
      </ul>

      <h2>开发工具</h2>
      <ul>
        <li>
          <a href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer">
            <strong>TypeScript</strong>
          </a>{" "}
          — 全项目类型安全
        </li>
        <li>
          <a href="https://pnpm.io" target="_blank" rel="noopener noreferrer">
            <strong>pnpm</strong>
          </a>{" "}
          — 高性能包管理器
        </li>
        <li>
          <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer">
            <strong>Lucide Icons</strong>
          </a>{" "}
          — 开源图标系统
        </li>
      </ul>
    </StaticPageLayout>
  );
}
