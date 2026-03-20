import type {
  ChallengeDetailModel,
  CompareEntryModel,
  ComparePageModel,
  PhaseOption,
  PillTone,
  SubmissionCardModel,
  SurfaceShape,
  SurfaceTone
} from "@/lib/presentation/models";
import {
  buildChallengeHref,
  buildCompareHref,
  RECEIPT_COMPARE_DEFAULT_ENTRIES
} from "@/lib/presentation/urls";

type SeedSubmission = {
  token: string;
  modelName: string;
  vendorName: string;
  channelName: string;
  manualTouched: boolean;
  updatedLabel: string;
  summary: string;
  note: string;
  previewTitle: string;
  previewNote: string;
  metrics: Array<{
    label: string;
    value: string;
  }>;
  hasHtml: boolean;
  tone: SurfaceTone;
};

type SeedPhase = {
  key: string;
  label: string;
  description: string;
  intro: string;
  defaultCompareEntries: string[];
  submissions: SeedSubmission[];
};

type SeedChallenge = {
  id: string;
  title: string;
  description: string;
  homeDescription: string;
  note: string;
  tone: SurfaceTone;
  shape: SurfaceShape;
  rulesSummary: Array<{
    label: string;
    value: string;
  }>;
  rulesContent: string;
  promptContent: string;
  phases: SeedPhase[];
};

type ComparePageInput = {
  challengeId?: string;
  phaseKey?: string;
  entryTokens: string[];
  focusToken?: string;
};

const seededChallenges: SeedChallenge[] = [
  {
    id: "receipt",
    title: "Receipt Reborn",
    description:
      "把热敏小票题从最小数据读取页，重构成一个带有纸感、留白和节奏的展示页，用同一道题去观察不同模型对信息层级与氛围感的处理方式。",
    homeDescription:
      "围绕热敏小票题，观察不同模型如何处理信息密度、纸张质感与小尺寸界面的节奏。",
    note:
      "当前详情页和 compare 页先用本地展示模型承接，等真实 artifact 与 iframe 接入后可以直接替换数据来源。",
    tone: "sand",
    shape: "river",
    rulesSummary: [
      {
        label: "视觉约束",
        value: "保留热敏纸气质，不做玻璃拟物或 dashboard 式大面板。"
      },
      {
        label: "比较维度",
        value: "信息结构、温度感、可读性、细节克制。"
      },
      {
        label: "对比范围",
        value: "同一 phase 下 2 到 4 个模型 x 渠道组合。"
      }
    ],
    rulesContent: `目标不是做商业后台，而是把收据这种低保真媒介做出真实的呼吸感。

- 保留热敏纸的轻微粗糙、压缩和层级收束感
- 信息应该先可读，再追求装饰性
- 不允许用厚重霓虹、硬阴影和极冷科技蓝破坏题目气质
- 如果作品经过人工修订，前台必须显著标记`,
    promptContent: `请围绕 receipt 主题，做一个可以被公开比较的前端作品。

- 允许使用柔和背景、细颗粒纹理和不规则圆角
- 页面需要能在手机和桌面上正常阅读
- 需要预留 phase 切换和后续 compare 的承接空间
- 请优先交付完整界面骨架，不追求复杂交互`,
    phases: [
      {
        key: "phase1",
        label: "Warm Draft",
        description: "第一轮强调结构感和基础氛围，优先把收据视图站稳。",
        intro:
          "这一轮更像把纸张、层级和阅读路径先铺开，再看各家模型在限制条件下的取舍。",
        defaultCompareEntries: [...RECEIPT_COMPARE_DEFAULT_ENTRIES],
        submissions: [
          {
            token: "gpt-5.4-pro@web",
            modelName: "GPT-5.4 Pro",
            vendorName: "OpenAI",
            channelName: "Web",
            manualTouched: false,
            updatedLabel: "2026-03-19 21:10",
            summary:
              "布局最稳，卡片层级和留白关系成熟，适合作为 compare 的基准参考。",
            note:
              "预览位已准备好接入 HTML artifact；当前先保留纸感背景和窗口骨架。",
            previewTitle: "Stable receipt composition",
            previewNote: "偏克制的基线版本，适合作为对照组。",
            metrics: [
              { label: "迭代", value: "4 次" },
              { label: "时长", value: "11m" },
              { label: "状态", value: "Compare-ready" }
            ],
            hasHtml: true,
            tone: "moss"
          },
          {
            token: "claude-sonnet-4@api",
            modelName: "Claude Sonnet 4",
            vendorName: "Anthropic",
            channelName: "API",
            manualTouched: true,
            updatedLabel: "2026-03-19 20:48",
            summary:
              "更强调叙事气质和说明文案，经过人工微调后版心更集中，适合看文案与结构的平衡。",
            note:
              "人工修订版本，顶部会保留显著标记，后续接真实 PRD 时仍走同一展示接口。",
            previewTitle: "Narrative-first receipt",
            previewNote: "文案表达更强，比较适合观察信息密度控制。",
            metrics: [
              { label: "迭代", value: "3 次" },
              { label: "时长", value: "14m" },
              { label: "状态", value: "Manual notes" }
            ],
            hasHtml: true,
            tone: "clay"
          },
          {
            token: "gemini-2.5-pro@web",
            modelName: "Gemini 2.5 Pro",
            vendorName: "Google",
            channelName: "Web",
            manualTouched: false,
            updatedLabel: "2026-03-19 19:22",
            summary:
              "更敢用留白和大轮廓，整体观感轻盈，适合放进三栏 compare 看节奏变化。",
            note:
              "保留一个更轻的版式方向，等 iframe 接入后能直观看出与稳态方案的差异。",
            previewTitle: "Airy spacing study",
            previewNote: "大留白和软边容器更明显。",
            metrics: [
              { label: "迭代", value: "5 次" },
              { label: "时长", value: "9m" },
              { label: "状态", value: "Compare-ready" }
            ],
            hasHtml: true,
            tone: "sand"
          },
          {
            token: "qwen3-coder@api",
            modelName: "Qwen3 Coder",
            vendorName: "Qwen",
            channelName: "API",
            manualTouched: false,
            updatedLabel: "2026-03-18 23:40",
            summary:
              "元信息齐全，但 HTML 产物暂未进入 compare 流程，因此当前只展示展示位和基础说明。",
            note:
              "占位壳体已经准备好，等 artifact 上传后可直接替换为真实预览。",
            previewTitle: "Metadata-only placeholder",
            previewNote: "当前 phase 暂无可对比 HTML。",
            metrics: [
              { label: "迭代", value: "2 次" },
              { label: "时长", value: "8m" },
              { label: "状态", value: "No HTML yet" }
            ],
            hasHtml: false,
            tone: "stone"
          }
        ]
      },
      {
        key: "phase2",
        label: "Polished Pass",
        description: "第二轮开始强化细节、标注和 compare 承接信息。",
        intro:
          "这轮开始把 compare 入口、人工修订标记和细节描述做得更完整，方便后续真实数据接上后直接演化。",
        defaultCompareEntries: [
          "gpt-5.4-pro@web",
          "claude-sonnet-4@api",
          "gemini-2.5-pro@web",
          "deepseek-r1@api"
        ],
        submissions: [
          {
            token: "gpt-5.4-pro@web",
            modelName: "GPT-5.4 Pro",
            vendorName: "OpenAI",
            channelName: "Web",
            manualTouched: false,
            updatedLabel: "2026-03-20 10:12",
            summary:
              "第二轮继续作为稳态方案，标题区和 compare 跳转关系更清晰。",
            note:
              "保留为主参考列，适合和更激进的方案一起对比。",
            previewTitle: "Refined base layout",
            previewNote: "更强调切换关系和摘要区。",
            metrics: [
              { label: "迭代", value: "6 次" },
              { label: "时长", value: "15m" },
              { label: "状态", value: "Compare-ready" }
            ],
            hasHtml: true,
            tone: "moss"
          },
          {
            token: "claude-sonnet-4@api",
            modelName: "Claude Sonnet 4",
            vendorName: "Anthropic",
            channelName: "API",
            manualTouched: true,
            updatedLabel: "2026-03-20 09:44",
            summary:
              "说明面板更完整，同时保留人工修订标识，适合测试 compare 页头部的公平性提示。",
            note:
              "后续真实 compare 页接入后，这个面板将直接复用显著 manual badge。",
            previewTitle: "Edited comparison-ready panel",
            previewNote: "manual touched 标记在这一轮更突出。",
            metrics: [
              { label: "迭代", value: "4 次" },
              { label: "时长", value: "17m" },
              { label: "状态", value: "Manual notes" }
            ],
            hasHtml: true,
            tone: "clay"
          },
          {
            token: "gemini-2.5-pro@web",
            modelName: "Gemini 2.5 Pro",
            vendorName: "Google",
            channelName: "Web",
            manualTouched: false,
            updatedLabel: "2026-03-20 08:55",
            summary:
              "细节更柔和，边角和留白更自然，适合作为 Organic 风格的高表达样本。",
            note:
              "预留更大的 preview 区域，后续放入真实 iframe 时不会改动结构。",
            previewTitle: "Organic expression study",
            previewNote: "更偏情绪与节奏表达。",
            metrics: [
              { label: "迭代", value: "5 次" },
              { label: "时长", value: "12m" },
              { label: "状态", value: "Compare-ready" }
            ],
            hasHtml: true,
            tone: "sand"
          },
          {
            token: "deepseek-r1@api",
            modelName: "DeepSeek R1",
            vendorName: "DeepSeek",
            channelName: "API",
            manualTouched: false,
            updatedLabel: "2026-03-20 08:16",
            summary:
              "新增一条更偏理性的版式方案，用来拉开 compare 页四格布局的节奏差异。",
            note:
              "作为四栏 compare 的第四项，重点是观察说明密度与整体安静度。",
            previewTitle: "Structured comparison candidate",
            previewNote: "更偏理性和规整，但仍保留柔边与纸感。",
            metrics: [
              { label: "迭代", value: "3 次" },
              { label: "时长", value: "10m" },
              { label: "状态", value: "Compare-ready" }
            ],
            hasHtml: true,
            tone: "stone"
          }
        ]
      }
    ]
  }
];

const seededChallengeMap = new Map(
  seededChallenges.map((challenge) => [challenge.id, challenge])
);

const fallbackTones: SurfaceTone[] = ["sand", "moss", "stone", "clay"];
const fallbackShapes: SurfaceShape[] = ["river", "canopy", "petal", "pebble"];

function getSubmissionTone(hasHtml: boolean, tone: SurfaceTone): PillTone {
  if (!hasHtml) {
    return "warn";
  }

  return tone === "clay" ? "clay" : tone === "sand" ? "sand" : "moss";
}

function dedupeTokens(tokens: string[]) {
  return Array.from(new Set(tokens.filter((token) => token.length > 0)));
}

function getChallengeSeed(id: string) {
  return seededChallengeMap.get(id);
}

function getDefaultPhase(challenge: SeedChallenge) {
  return challenge.phases[0];
}

function getActivePhase(challenge: SeedChallenge, phaseKey?: string) {
  return (
    challenge.phases.find((phase) => phase.key === phaseKey) ??
    getDefaultPhase(challenge)
  );
}

function getCompareReadyTokens(phase: SeedPhase) {
  return phase.submissions
    .filter((submission) => submission.hasHtml)
    .map((submission) => submission.token);
}

function buildPhaseTabs(
  challenge: SeedChallenge,
  activePhaseKey: string
): PhaseOption[] {
  return challenge.phases.map((phase) => ({
    key: phase.key,
    label: phase.label,
    description: phase.description,
    href: buildChallengeHref(challenge.id, phase.key),
    isActive: phase.key === activePhaseKey
  }));
}

function mapSubmission(
  challenge: SeedChallenge,
  phase: SeedPhase,
  submission: SeedSubmission
): SubmissionCardModel {
  const compareReadyTokens = getCompareReadyTokens(phase);
  const compareEntries = submission.hasHtml
    ? dedupeTokens([submission.token, ...phase.defaultCompareEntries]).filter(
        (token) => compareReadyTokens.includes(token)
      )
    : phase.defaultCompareEntries;

  return {
    id: `${phase.key}-${submission.token}`,
    token: submission.token,
    modelName: submission.modelName,
    vendorName: submission.vendorName,
    channelName: submission.channelName,
    statusLabel: submission.hasHtml ? "Compare-ready" : "Preview shell only",
    statusTone: getSubmissionTone(submission.hasHtml, submission.tone),
    manualTouched: submission.manualTouched,
    updatedLabel: submission.updatedLabel,
    summary: submission.summary,
    previewTitle: submission.previewTitle,
    previewNote: submission.previewNote,
    compareHref: buildCompareHref({
      challengeId: challenge.id,
      phaseKey: phase.key,
      entries: compareEntries.slice(0, Math.min(compareEntries.length, 4)),
      focus: submission.hasHtml ? submission.token : undefined
    }),
    metrics: submission.metrics,
    hasHtml: submission.hasHtml
  };
}

function mapCompareEntry(
  challenge: SeedChallenge,
  phase: SeedPhase,
  submission: SeedSubmission,
  selectedTokens: string[]
): CompareEntryModel {
  return {
    id: `${phase.key}-${submission.token}`,
    token: submission.token,
    modelName: submission.modelName,
    vendorName: submission.vendorName,
    channelName: submission.channelName,
    manualTouched: submission.manualTouched,
    note: submission.note,
    previewTitle: submission.previewTitle,
    previewNote: submission.previewNote,
    tone: submission.tone,
    statusLabel: submission.hasHtml ? "Compare-ready" : "Unavailable",
    focusHref: buildCompareHref({
      challengeId: challenge.id,
      phaseKey: phase.key,
      entries: selectedTokens,
      focus: submission.token
    })
  };
}

export function listSeededChallenges() {
  return seededChallenges;
}

export function getSeededChallengeCardMeta(id: string) {
  return getChallengeSeed(id);
}

export function getChallengeDetailModel(
  challengeId: string,
  phaseKey?: string
): ChallengeDetailModel {
  const challenge = getChallengeSeed(challengeId);

  if (!challenge) {
    return {
      status: "unavailable",
      title: "Challenge preview unavailable",
      description:
        "当前只有本地 UI seed 的 challenge 骨架。等真实详情查询接入后，这里会切回正式数据源。",
      heroPills: [
        { label: "Display shell only", tone: "warn" },
        { label: "No seeded detail", tone: "neutral" }
      ],
      phaseTabs: [],
      emptyState: {
        title: "这个 challenge 还没有展示层 seed",
        description:
          "你可以先回到首页查看当前设计系统，或者打开 receipt 的详情页作为 UI 预览参考。",
        cta: {
          label: "回到首页",
          href: "/",
          variant: "primary"
        },
        secondaryCta: {
          label: "查看 receipt",
          href: buildChallengeHref("receipt"),
          variant: "ghost"
        }
      }
    };
  }

  const activePhase = getActivePhase(challenge, phaseKey);
  const compareReadyCount = activePhase.submissions.filter(
    (submission) => submission.hasHtml
  ).length;

  return {
    status: "ready",
    title: challenge.title,
    description: challenge.description,
    heroPills: [
      { label: `${challenge.phases.length} phases`, tone: "sand" },
      { label: `${compareReadyCount} compare-ready`, tone: "moss" },
      { label: "Local presentation seed", tone: "neutral" }
    ],
    phaseTabs: buildPhaseTabs(challenge, activePhase.key),
    activePhaseLabel: activePhase.label,
    intro: activePhase.intro,
    rulesPanels: [
      {
        eyebrow: "Rules",
        title: "比较基准",
        content: challenge.rulesContent,
        tone: "stone"
      },
      {
        eyebrow: "Prompt",
        title: "交付边界",
        content: challenge.promptContent,
        tone: "sand"
      }
    ],
    summaryItems: challenge.rulesSummary,
    submissions: activePhase.submissions.map((submission) =>
      mapSubmission(challenge, activePhase, submission)
    ),
    compareCta: {
      label: `打开 ${activePhase.label} compare`,
      href: buildCompareHref({
        challengeId: challenge.id,
        phaseKey: activePhase.key,
        entries: activePhase.defaultCompareEntries.slice(0, 4)
      }),
      variant: "primary"
    }
  };
}

export function getComparePageModel({
  challengeId,
  phaseKey,
  entryTokens,
  focusToken
}: ComparePageInput): ComparePageModel {
  if (!challengeId || !phaseKey || entryTokens.length === 0) {
    return {
      status: "unavailable",
      title: "Compare shell is waiting for a valid selection",
      description:
        "当前 compare 页只承接结构化展示，需要 `challenge`、`phase` 和 `entries` 三个参数才能构建布局。",
      headerPills: [
        { label: "Missing query", tone: "warn" },
        { label: "Preview shell", tone: "neutral" }
      ],
      errorState: {
        title: "缺少 compare 参数",
        description:
          "请从 challenge 详情页进入，或使用固定格式的 query：`/compare?challenge=receipt&phase=phase1&entries=...`。",
        cta: {
          label: "打开示例 compare",
          href: buildCompareHref({
            challengeId: "receipt",
            phaseKey: "phase1",
            entries: [...RECEIPT_COMPARE_DEFAULT_ENTRIES]
          }),
          variant: "primary"
        },
        secondaryCta: {
          label: "查看 challenge 详情",
          href: buildChallengeHref("receipt"),
          variant: "ghost"
        }
      }
    };
  }

  const challenge = getChallengeSeed(challengeId);

  if (!challenge) {
    return {
      status: "unavailable",
      title: "Unknown compare challenge",
      description: "当前 compare 页只内置了 receipt 的本地 UI seed。",
      headerPills: [
        { label: "Unknown challenge", tone: "warn" },
        { label: "Local seed only", tone: "neutral" }
      ],
      errorState: {
        title: "这个 compare challenge 还没有 seed",
        description:
          "展示层已经准备好，但本轮没有接真实查询层。你可以先用 receipt 验证 compare 布局。",
        cta: {
          label: "打开 receipt compare",
          href: buildCompareHref({
            challengeId: "receipt",
            phaseKey: "phase1",
            entries: [...RECEIPT_COMPARE_DEFAULT_ENTRIES]
          }),
          variant: "primary"
        },
        secondaryCta: {
          label: "回到首页",
          href: "/",
          variant: "ghost"
        }
      }
    };
  }

  const phase = challenge.phases.find((item) => item.key === phaseKey);

  if (!phase) {
    return {
      status: "unavailable",
      title: "Unknown compare phase",
      description: `${challenge.title} 当前没有匹配的 phase。`,
      headerPills: [
        { label: "Invalid phase", tone: "warn" },
        { label: challenge.title, tone: "sand" }
      ],
      errorState: {
        title: "phase 参数无效",
        description: "请从 challenge 详情页的 phase tabs 进入 compare，避免拼错 phase key。",
        cta: {
          label: "回到 challenge 详情",
          href: buildChallengeHref(challenge.id),
          variant: "primary"
        }
      }
    };
  }

  const uniqueTokens = dedupeTokens(entryTokens);

  if (uniqueTokens.length < 2 || uniqueTokens.length > 4) {
    return {
      status: "unavailable",
      title: "Compare entry count out of range",
      description: "compare 页要求 2 到 4 个有效 entry。",
      headerPills: [
        { label: "2-4 entries required", tone: "warn" },
        { label: phase.label, tone: "sand" }
      ],
      errorState: {
        title: "entries 数量不合法",
        description:
          "当前 compare 布局只支持 2、3、4 项。移动端会自动折叠为单 panel + tabs。",
        cta: {
          label: "使用推荐组合",
          href: buildCompareHref({
            challengeId: challenge.id,
            phaseKey: phase.key,
            entries: phase.defaultCompareEntries.slice(0, 4)
          }),
          variant: "primary"
        }
      }
    };
  }

  const submissionMap = new Map(
    phase.submissions.map((submission) => [submission.token, submission])
  );
  const invalidTokens = uniqueTokens.filter((token) => {
    const submission = submissionMap.get(token);
    return !submission || !submission.hasHtml;
  });

  if (invalidTokens.length > 0) {
    return {
      status: "unavailable",
      title: "Selected entries are not compare-ready",
      description:
        "当前 compare 页只接受该 phase 下存在且带 HTML artifact 的 entry token。",
      headerPills: [
        { label: "Unavailable entry", tone: "warn" },
        { label: phase.label, tone: "sand" }
      ],
      errorState: {
        title: "部分 entry 暂不可对比",
        description: `以下 entry 还不能进入 compare：${invalidTokens.join(", ")}`,
        cta: {
          label: "改用推荐组合",
          href: buildCompareHref({
            challengeId: challenge.id,
            phaseKey: phase.key,
            entries: phase.defaultCompareEntries.slice(0, 4)
          }),
          variant: "primary"
        },
        secondaryCta: {
          label: "返回 challenge 详情",
          href: buildChallengeHref(challenge.id, phase.key),
          variant: "ghost"
        }
      }
    };
  }

  const focusEntryId = uniqueTokens.includes(focusToken ?? "")
    ? focusToken
    : uniqueTokens[0];

  return {
    status: "ready",
    title: `${challenge.title} Compare`,
    description:
      "当前 compare 页先交付结构化外壳：规则摘要、响应式分栏、移动端单 panel tabs，以及 manual touched 的显著标记。",
    headerPills: [
      { label: challenge.title, tone: "sand" },
      { label: phase.label, tone: "moss" },
      { label: `${uniqueTokens.length} entries`, tone: "neutral" }
    ],
    challengeHref: buildChallengeHref(challenge.id, phase.key),
    challengeTitle: challenge.title,
    phaseTabs: challenge.phases.map((item) => ({
      key: item.key,
      label: item.label,
      description: item.description,
      href: buildCompareHref({
        challengeId: challenge.id,
        phaseKey: item.key,
        entries: item.defaultCompareEntries.slice(0, 4)
      }),
      isActive: item.key === phase.key
    })),
    activePhaseLabel: phase.label,
    ruleSummary: [
      ...challenge.rulesSummary,
      {
        label: "当前选择",
        value: uniqueTokens.join(" / ")
      }
    ],
    entries: uniqueTokens.map((token) =>
      mapCompareEntry(challenge, phase, submissionMap.get(token)!, uniqueTokens)
    ),
    focusEntryId
  };
}

export function getFallbackCardTone(index: number) {
  return fallbackTones[index % fallbackTones.length];
}

export function getFallbackCardShape(index: number) {
  return fallbackShapes[index % fallbackShapes.length];
}
