import type { BootstrapStats } from "@/lib/queries/bootstrap";
import {
  getFallbackCardShape,
  getFallbackCardTone,
  getSeededChallengeCardMeta
} from "@/lib/presentation/challengeRegistry";
import type { HomePageModel } from "@/lib/presentation/models";
import { buildChallengeHref, buildCompareHref } from "@/lib/presentation/urls";

type HomePageMapperInput = {
  stats: BootstrapStats;
  missingEnvKeys: string[];
  appUrl: string;
};

function formatDateLabel(value: string | null) {
  if (!value) {
    return "Waiting for first publish";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getConnectionTone(stats: BootstrapStats) {
  switch (stats.connectionStatus) {
    case "connected":
      return "ok";
    case "schema-missing":
    case "query-failed":
      return "warn";
    default:
      return "neutral";
  }
}

function getConnectionLabel(stats: BootstrapStats) {
  switch (stats.connectionStatus) {
    case "connected":
      return "Supabase connected";
    case "schema-missing":
      return "Schema not applied";
    case "query-failed":
      return "Query failed";
    default:
      return "Supabase not configured";
  }
}

export function mapBootstrapStatsToHomePageModel({
  stats,
  missingEnvKeys,
  appUrl
}: HomePageMapperInput): HomePageModel {
  const envReady = missingEnvKeys.length === 0;
  const topChallenge = stats.publishedChallenges[0];
  const defaultChallengeHref = topChallenge
    ? buildChallengeHref(topChallenge.id)
    : buildChallengeHref("receipt");
  const defaultCompareHref = topChallenge
    ? buildCompareHref({
        challengeId: topChallenge.id,
        phaseKey: "phase1",
        entries: [
          "gpt-5.4-pro@web",
          "claude-sonnet-4@api",
          "gemini-2.5-pro@web"
        ]
      })
    : buildCompareHref({
        challengeId: "receipt",
        phaseKey: "phase1",
        entries: [
          "gpt-5.4-pro@web",
          "claude-sonnet-4@api",
          "gemini-2.5-pro@web"
        ]
      });

  return {
    hero: {
      eyebrow: "Organic / Natural UI",
      title: "VibeBench 正在从最小可读，过渡到有温度的公开展示层。",
      description:
        "这一轮只重构前台体验：把首页、challenge 详情页和 compare 页先搭成稳定的展示骨架，让后续真实数据、artifact 和 iframe 能直接接进来。",
      primaryCta: {
        label: topChallenge ? "查看最新 challenge" : "查看展示预览",
        href: defaultChallengeHref,
        ariaLabel: "打开当前 challenge 详情页",
        variant: "primary"
      },
      secondaryCta: {
        label: "打开 compare 骨架",
        href: defaultCompareHref,
        ariaLabel: "打开 compare 页面结构化预览",
        variant: "outline"
      },
      pills: [
        {
          label: envReady ? "Environment ready" : "Environment incomplete",
          tone: envReady ? "ok" : "warn"
        },
        {
          label: getConnectionLabel(stats),
          tone: getConnectionTone(stats)
        },
        {
          label: `${stats.counts.compareReadyEntries} compare-ready entries`,
          tone: "moss"
        }
      ],
      featuredLabel: topChallenge ? "Latest published challenge" : "UI preview mode",
      featuredValue: topChallenge?.title ?? "Receipt Reborn",
      featuredNote: topChallenge
        ? "首页继续复用现有 Supabase 读取，只在展示层补足结构和视觉语气。"
        : "数据库里暂时没有已发布 challenge，前台先用本地展示模型把骨架准备好。"
    },
    stats: [
      {
        label: "Published Challenges",
        value: `${stats.counts.publishedChallenges}`,
        detail: "当前公开 challenge 数量，继续由现有查询层提供。",
        tone: "sand"
      },
      {
        label: "Published Submissions",
        value: `${stats.counts.publishedSubmissions}`,
        detail: "公开作品总数，后续详情页会在不改接口的前提下承接它们。",
        tone: "moss"
      },
      {
        label: "Compare-ready Entries",
        value: `${stats.counts.compareReadyEntries}`,
        detail: "具备 HTML artifact 的条目数，是 compare 页的直接入口池。",
        tone: "clay"
      }
    ],
    challenges: stats.publishedChallenges.map((challenge, index) => {
      const seededMeta = getSeededChallengeCardMeta(challenge.id);

      return {
        id: challenge.id,
        title: challenge.title,
        description:
          seededMeta?.homeDescription ??
          "当前只读取最小 challenge 列表，更多文案和缩略元数据会在下一轮接详情查询时补齐。",
        updatedLabel: formatDateLabel(
          challenge.updatedAt ?? challenge.publishedAt
        ),
        href: buildChallengeHref(challenge.id),
        compareHref: buildCompareHref({
          challengeId: challenge.id,
          phaseKey: "phase1",
          entries: [
            "gpt-5.4-pro@web",
            "claude-sonnet-4@api",
            "gemini-2.5-pro@web"
          ]
        }),
        phaseCountLabel: seededMeta
          ? `${seededMeta.phases.length} 个 phase`
          : "Phase 元信息待接入",
        entryCountLabel: seededMeta
          ? `${Math.max(
              ...seededMeta.phases.map((phase) => phase.submissions.length)
            )} 个参赛位`
          : "展示骨架已预留 compare 入口",
        tone: seededMeta?.tone ?? getFallbackCardTone(index),
        shape: seededMeta?.shape ?? getFallbackCardShape(index),
        note:
          seededMeta?.note ??
          "当前 challenge 卡只使用现有列表查询，不扩展数据库读取。"
      };
    }),
    challengeEmptyState: {
      title: "还没有已发布 challenge",
      description:
        "数据库为空也不影响这轮 UI 重构。你可以先用 receipt 的本地展示模型验证设计系统和页面骨架。",
      cta: {
        label: "查看 receipt 预览",
        href: buildChallengeHref("receipt"),
        variant: "primary"
      },
      secondaryCta: {
        label: "打开 compare 骨架",
        href: buildCompareHref({
          challengeId: "receipt",
          phaseKey: "phase1",
          entries: [
            "gpt-5.4-pro@web",
            "claude-sonnet-4@api",
            "gemini-2.5-pro@web"
          ]
        }),
        variant: "ghost"
      }
    },
    foundation: {
      title: "工程底座保持可见",
      description:
        "现有 Supabase 服务端读取、健康检查和 API 路由全部保留，这一层只是换成更可持续的展示壳。",
      pills: [
        {
          label: envReady ? "Server env complete" : "Server env missing keys",
          tone: envReady ? "ok" : "warn"
        },
        {
          label: getConnectionLabel(stats),
          tone: getConnectionTone(stats)
        }
      ],
      missingEnvKeys,
      connectionMessage: stats.connectionMessage,
      appUrl,
      apiLinks: [
        {
          label: "Health API",
          href: "/api/health",
          ariaLabel: "Open health API route",
          variant: "ghost"
        },
        {
          label: "Challenges API",
          href: "/api/challenges",
          ariaLabel: "Open challenges API route",
          variant: "ghost"
        }
      ]
    }
  };
}
