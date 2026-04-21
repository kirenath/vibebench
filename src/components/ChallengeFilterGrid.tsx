"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowUpDown, ChevronDown, Check } from "lucide-react";
import ChallengeIcon from "@/components/ChallengeIcon";
import { TAG_DEFINITIONS, DIFFICULTY_DEFINITIONS, type DifficultyKey } from "@/lib/tags";

interface ChallengeMetadata {
  icon?: string;
  tags?: string[];
  difficulty?: DifficultyKey;
}

export interface ChallengeRow {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  published_at: string | null;
  submission_count: string;
  metadata: ChallengeMetadata | null;
}

function getChallengeTags(metadata: ChallengeMetadata | null): string[] {
  return metadata?.tags ?? [];
}

const SORT_OPTIONS = [
  { value: "default",         label: "默认排序" },
  { value: "newest",          label: "最新发布" },
  { value: "oldest",          label: "最早发布" },
  { value: "most",            label: "作品最多" },
  { value: "least",           label: "作品最少" },
  { value: "difficulty_asc",  label: "难度升序" },
  { value: "difficulty_desc", label: "难度降序" },
] as const;

const DIFFICULTY_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

type SortKey = typeof SORT_OPTIONS[number]["value"];

export default function ChallengeFilterGrid({ challenges }: { challenges: ChallengeRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag") || "all";
  const activeDifficulty = searchParams.get("difficulty") || "all";
  const activeSort = (searchParams.get("sort") || "default") as SortKey;

  // Count challenges per tag (only tags with count > 0 are shown)
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of challenges) {
      for (const t of getChallengeTags(c.metadata)) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
    return counts;
  }, [challenges]);

  // Filter TAG_DEFINITIONS to only show tags with at least 1 challenge
  const visibleTags = useMemo(
    () => TAG_DEFINITIONS.filter((t) => (tagCounts[t.key] || 0) > 0),
    [tagCounts],
  );

  const difficultyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of challenges) {
      const d = c.metadata?.difficulty;
      if (d) counts[d] = (counts[d] || 0) + 1;
    }
    return counts;
  }, [challenges]);

  const filtered = useMemo(() => {
    let list =
      activeTag === "all"
        ? [...challenges]
        : challenges.filter((c) => getChallengeTags(c.metadata).includes(activeTag));

    if (activeDifficulty !== "all") {
      list = list.filter((c) => c.metadata?.difficulty === activeDifficulty);
    }

    if (activeSort === "newest") {
      list.sort((a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime());
    } else if (activeSort === "oldest") {
      list.sort((a, b) => new Date(a.published_at ?? 0).getTime() - new Date(b.published_at ?? 0).getTime());
    } else if (activeSort === "most") {
      list.sort((a, b) => Number(b.submission_count) - Number(a.submission_count));
    } else if (activeSort === "least") {
      list.sort((a, b) => Number(a.submission_count) - Number(b.submission_count));
    } else if (activeSort === "difficulty_asc") {
      list.sort((a, b) => (DIFFICULTY_ORDER[a.metadata?.difficulty ?? ""] ?? 99) - (DIFFICULTY_ORDER[b.metadata?.difficulty ?? ""] ?? 99));
    } else if (activeSort === "difficulty_desc") {
      list.sort((a, b) => (DIFFICULTY_ORDER[b.metadata?.difficulty ?? ""] ?? -1) - (DIFFICULTY_ORDER[a.metadata?.difficulty ?? ""] ?? -1));
    }

    return list;
  }, [challenges, activeTag, activeDifficulty, activeSort]);

  const updateParams = (key: string, value: string, defaultValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`/challenges${params.size ? `?${params}` : ""}`, { scroll: false });
  };

  const setTag = (tag: string) => updateParams("tag", tag, "all");
  const setDifficulty = (d: string) => updateParams("difficulty", d, "all");
  const setSort = (sort: string) => updateParams("sort", sort, "default");

  return (
    <>
      {/* Tag filter bar */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setTag("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTag === "all"
              ? "bg-primary/15 text-primary ring-1 ring-primary/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          全部({challenges.length})
        </button>
        {visibleTags.map((tag) => (
          <button
            key={tag.key}
            onClick={() => setTag(tag.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTag === tag.key
                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {tag.emoji} {tag.label}({tagCounts[tag.key] || 0})
          </button>
        ))}
      </div>

      {/* Difficulty filter bar */}
      {Object.keys(difficultyCounts).length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <span className="text-sm text-muted-foreground mr-1">难度</span>
          <button
            onClick={() => setDifficulty("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeDifficulty === "all"
                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            全部
          </button>
          {DIFFICULTY_DEFINITIONS.map((d) => {
            const count = difficultyCounts[d.key] || 0;
            if (count === 0) return null;
            return (
              <button
                key={d.key}
                onClick={() => setDifficulty(d.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ring-1 ring-inset ${
                  activeDifficulty === d.key
                    ? d.colorClass
                    : "bg-muted/50 text-muted-foreground ring-transparent hover:bg-muted"
                }`}
              >
                {d.label}({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Sort selector */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {filtered.length} 道赛题
        </p>
        <SortDropdown value={activeSort} onChange={setSort} />
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-muted-foreground">暂无已发布赛题</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((c, i) => (
            <Link
              key={c.id}
              href={`/challenges/${c.id}`}
              className="card card-hover p-0 overflow-hidden group rounded-2xl"
            >
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                {c.cover_image ? (
                  <img
                    src={c.cover_image}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <ChallengeIcon iconName={c.metadata?.icon ?? null} className="h-16 w-16 text-primary/40" />
                )}
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {c.title}
                </h3>
                {c.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {c.description}
                  </p>
                )}
                {/* Tag + difficulty badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <DifficultyBadge difficulty={c.metadata?.difficulty} />
                  <TagBadges tags={getChallengeTags(c.metadata)} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="badge-primary">
                    {c.submission_count} 个作品
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "默认排序";

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-foreground bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        {currentLabel}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1.5 w-36 bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden py-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition-colors ${
                opt.value === value
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-muted/50"
              }`}
            >
              {opt.label}
              {opt.value === value && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  if (!difficulty) return null;
  const def = DIFFICULTY_DEFINITIONS.find((d) => d.key === difficulty);
  if (!def) return null;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${def.colorClass}`}>
      {def.label}
    </span>
  );
}

function TagBadges({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <>
      {tags.map((tagKey) => {
        const def = TAG_DEFINITIONS.find((t) => t.key === tagKey);
        if (!def) return null;
        return (
          <span
            key={tagKey}
            className="inline-flex items-center gap-0.5 rounded-full bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground"
          >
            {def.emoji} {def.label}
          </span>
        );
      })}
    </>
  );
}
