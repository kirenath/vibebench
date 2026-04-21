import type { Metadata } from "next";
import StaticPageLayout from "@/components/StaticPageLayout";

export const metadata: Metadata = {
  title: "Changelog — VibeBench",
  description: "VibeBench 平台功能迭代、基础设施变更与内容更新的完整时间线。",
};

export default function ChangelogPage() {
  return (
    <StaticPageLayout
      eyebrow="Changelog"
      title="更新日志"
      description="VibeBench 平台功能迭代、基础设施变更与内容更新的完整时间线。"
      updatedAt="2026 年 4 月 21 日"
    >
      <h2>2026 年 4 月 21 日</h2>
      <ul>
        <li>新增赛题难度分级系统：支持入门 / 进阶 / 挑战三级难度标注，由维护者在 Admin 后台手动评定。</li>
        <li>赛题列表页新增难度筛选栏与难度排序，卡片和详情页展示难度标签。</li>
        <li>Admin 后台赛题编辑增加难度选择器，难度存储于 <code>metadata.difficulty</code>。</li>
      </ul>

      <h2>2026 年 4 月 9 日 – 10 日</h2>
      <ul>
        <li>新增赛题多标签分类体系：定义 <code>tags.ts</code> 标签数据源，覆盖工具、游戏、创意、设计、数据可视化等类别。</li>
        <li>新增 <code>ChallengeFilterGrid</code> 组件，赛题页支持按标签筛选与搜索。</li>
        <li>Admin 后台赛题管理增加标签编辑能力。</li>
        <li><code>CustomSelect</code> 组件增加拼音/首字母搜索支持，优化下拉选框可发现性。</li>
      </ul>

      <h2>2026 年 4 月 7 日 – 8 日</h2>
      <ul>
        <li>全屏预览弹窗（HtmlPreviewModal）增加键盘聚焦管理，ESC / 方向键交互更直觉。</li>
      </ul>

      <h2>2026 年 4 月 4 日 – 6 日</h2>
      <ul>
        <li>修复 iframe 预览跳转域名根目录、同源预览 CORS 报错及浏览历史污染问题。</li>
        <li>修复 iframe 资源路由的 CDN 域名匹配与缓存头设置。</li>
      </ul>

      <h2>2026 年 4 月 1 日 – 3 日</h2>
      <ul>
        <li>修复 Admin 后台作品管理界面布局与交互问题。</li>
        <li>更新 README，完善项目介绍与使用说明。</li>
      </ul>

      <h2>2026 年 3 月 28 日 – 31 日</h2>
      <ul>
        <li>模型详情页增加 Phase 维度展示，按挑战阶段分组呈现作品。</li>
        <li>新增 <code>ModelGrid</code> 组件：模型列表页支持按厂商筛选和关键词搜索。</li>
        <li>赛题详情页布局优化，改善作品卡片展示与排版。</li>
        <li>修复剪贴板读取授权（Permissions-Policy 与 Content-Security-Policy 配合）。</li>
        <li>修复沙箱路由 CDN 域名解析与缓存控制，消除 iframe 加载白屏问题。</li>
      </ul>

      <h2>2026 年 3 月 27 日</h2>
      <ul>
        <li>放宽 iframe sandbox 表单提交限制，解决部分作品内表单交互被阻断的问题。</li>
        <li>强制模型页面动态刷新（<code>force-dynamic</code>），避免新增数据后页面未更新。</li>
        <li>自由对比界面增加搜索框，快速定位待对比作品。</li>
      </ul>

      <h2>2026 年 3 月 26 日</h2>
      <ul>
        <li>优化 Admin 后台 <code>CustomSelect</code> 搜索功能，增加模糊匹配与空态提示。</li>
        <li>精简首页赛题展示，改为随机展示部分赛题卡片，降低首屏信息量。</li>
      </ul>

      <h2>2026 年 3 月 25 日</h2>
      <ul>
        <li>修复对比界面预览沙盒 URL 拼接问题。</li>
        <li>赛题页面切换为动态渲染（<code>force-dynamic</code>），确保新增赛题即时可见。</li>
        <li>修改作品排序逻辑，按创建时间倒序。</li>
        <li>修复 iframe 内文件下载与剪贴板功能（<code>next.config.ts</code> 增加跨域安全头）。</li>
      </ul>

      <h2>2026 年 3 月 24 日</h2>
      <ul>
        <li>完善 Admin 后台作品管理界面。</li>
      </ul>

      <h2>2026 年 3 月 23 日</h2>
      <ul>
        <li>静态资源存储迁移至 Cloudflare R2，实现 CDN 全球加速。</li>
        <li>新增源代码预览功能（SourceCodePreviewModal），支持 HTML 语法高亮。</li>
        <li>盲评投票增加结果反馈界面与浏览器指纹防重投机制。</li>
        <li>后台管理：增加 Phase 与成果编辑能力、优化上传与提交流程。</li>
        <li>修复多项 Bug（PRD 逻辑、UTF-8 编码、导航栏布局、SVG 图标等）。</li>
      </ul>

      <h2>2026 年 3 月 22 日</h2>
      <ul>
        <li>新增 License 页面，补全合规信息。</li>
        <li>Footer 导航优化、下拉选框改进。</li>
      </ul>

      <h2>2026 年 3 月 21 日</h2>
      <ul>
        <li>重构 Footer，从重复路由导航切换为品牌、共建、资源和合规信息架构。</li>
        <li>新增 FAQ、API Docs、Terms、Privacy、License 等公开占位页，减少死链。</li>
        <li>补充开源生态、社区入口与站点运行状态表达，使 footer 更接近平台名片。</li>
      </ul>

      <h2>2026 年 3 月 20 日</h2>
      <ul>
        <li>完成首页、赛题页、模型页、对比页和管理员后台的 MVP 应用骨架。</li>
        <li>落地 REST API、HTML 沙箱预览和 Organic / Natural 设计系统。</li>
        <li>建立 PostgreSQL 初始 Schema，支撑挑战题、模型、作品和附件等核心对象。</li>
      </ul>
    </StaticPageLayout>
  );
}
