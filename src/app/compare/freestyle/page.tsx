"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Shuffle, RefreshCw, Maximize2, ExternalLink, Code2 } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import Link from "next/link";
import HtmlPreviewModal from "@/components/HtmlPreviewModal";
import SourceCodePreviewModal from "@/components/SourceCodePreviewModal";

interface Submission {
  submission_id: string;
  challenge_id: string;
  challenge_title: string;
  challenge_phase_id: string;
  phase_key: string;
  phase_label: string;
  model_variant_id: string;
  model_variant_name: string;
  vendor_name: string;
  channel_id: string;
  channel_name: string;
  manual_touched: boolean;
  has_html: boolean;
}

export default function FreestylePage() {
  return (
    <Suspense fallback={<div className="relative section pt-24 text-center text-muted-foreground">加载中...</div>}>
      <FreestyleContent />
    </Suspense>
  );
}

function FreestyleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedA, setSelectedA] = useState(searchParams.get("a") || "");
  const [selectedB, setSelectedB] = useState(searchParams.get("b") || "");
  const [iframeKeys, setIframeKeys] = useState<Record<string, number>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sourceCodeId, setSourceCodeId] = useState<string | null>(null);

  // Fetch ALL published submissions with HTML
  useEffect(() => {
    setLoading(true);
    fetch("/api/submissions?is_published=true")
      .then((r) => r.json())
      .then((d) => {
        const all: Submission[] = (d.data || []).filter((s: Submission) => s.has_html);
        setSubmissions(all);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedA) params.set("a", selectedA);
    if (selectedB) params.set("b", selectedB);
    const qs = params.toString();
    router.replace(`/compare/freestyle${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [selectedA, selectedB, router]);

  const subA = submissions.find((s) => s.submission_id === selectedA);
  const subB = submissions.find((s) => s.submission_id === selectedB);

  // Build options with descriptive labels grouped by challenge
  const buildOptions = (excludeId?: string) => {
    const filtered = submissions.filter((s) => s.submission_id !== excludeId);
    // Group by challenge title
    const grouped: Record<string, Submission[]> = {};
    for (const s of filtered) {
      const key = s.challenge_title;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    }
    const options: { value: string; label: string }[] = [];
    for (const [challenge, subs] of Object.entries(grouped)) {
      for (const s of subs) {
        options.push({
          value: s.submission_id,
          label: `${s.model_variant_name} · ${s.channel_name} — ${challenge} (${s.phase_label})${s.manual_touched ? " ⚠️" : ""}`,
        });
      }
    }
    return options;
  };

  return (
    <div className="relative section pt-24">
      {/* Background wash that extends behind navbar to eliminate the dividing line */}
      <div
        className="absolute inset-0 -top-24 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(93,112,82,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-7xl mx-auto">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          返回对比
        </Link>

        <div className="mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Shuffle className="h-10 w-10 text-primary" />
            自由对比
          </h1>
          <p className="text-muted-foreground text-lg">
            任意选择两个作品进行并排对比 — 跨赛题、跨 Phase、甚至同一模型的不同作品
          </p>
        </div>

        {loading ? (
          <div className="card p-12 text-center text-muted-foreground">正在加载作品列表...</div>
        ) : (
          <>
            {/* Selectors */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="label mb-2 block">作品 A</label>
                <CustomSelect
                  options={buildOptions(selectedB)}
                  value={selectedA}
                  onChange={setSelectedA}
                  placeholder="选择作品 A..."
                />
                {subA && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {subA.challenge_title} · {subA.phase_label}
                    {subA.manual_touched && <span className="text-destructive ml-1">⚠️ 人工修订</span>}
                  </p>
                )}
              </div>
              <div>
                <label className="label mb-2 block">作品 B</label>
                <CustomSelect
                  options={buildOptions(selectedA)}
                  value={selectedB}
                  onChange={setSelectedB}
                  placeholder="选择作品 B..."
                />
                {subB && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {subB.challenge_title} · {subB.phase_label}
                    {subB.manual_touched && <span className="text-destructive ml-1">⚠️ 人工修订</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Compare view */}
            {subA && subB && (
              <div className="grid md:grid-cols-2 gap-4">
                {[subA, subB].map((s) => (
                  <div key={s.submission_id} className="card overflow-hidden">
                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                      <div>
                        <h3 className="font-heading font-bold">
                          {s.model_variant_name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {s.vendor_name} · {s.channel_name} — {s.challenge_title} ({s.phase_label})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.manual_touched && (
                          <span className="badge-destructive flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            人工修订
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <button onClick={() => setIframeKeys(prev => ({ ...prev, [s.submission_id]: (prev[s.submission_id] || 0) + 1 }))} className="p-1 rounded-md hover:bg-primary/10 transition-colors" title="刷新">
                            <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          <button onClick={() => setPreviewUrl(`/s/${s.submission_id}/index.html`)} className="p-1 rounded-md hover:bg-primary/10 transition-colors" title="预览">
                            <Maximize2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          <a href={`/s/${s.submission_id}/index.html`} target="_blank" rel="noopener noreferrer" className="p-1 rounded-md hover:bg-primary/10 transition-colors" title="新窗口打开">
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </a>
                          <button onClick={() => setSourceCodeId(s.submission_id)} className="p-1 rounded-md hover:bg-primary/10 transition-colors" title="查看源码">
                            <Code2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <iframe
                      key={iframeKeys[s.submission_id] || 0}
                      src={`/s/${s.submission_id}/index.html`}
                      sandbox="allow-scripts"
                      className="w-full h-[600px] border-0"
                      title={s.model_variant_name}
                    />
                  </div>
                ))}
              </div>
            )}

            {(selectedA && !selectedB) || (!selectedA && selectedB) ? (
              <div className="card p-12 text-center">
                <p className="text-muted-foreground">请再选择 1 个作品进行对比</p>
              </div>
            ) : null}

            {!selectedA && !selectedB && (
              <div className="card p-12 text-center">
                <p className="text-muted-foreground">
                  请从上方选择任意 2 个作品开始对比
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <HtmlPreviewModal
          url={previewUrl}
          title="作品预览"
          onClose={() => setPreviewUrl(null)}
        />
      )}

      {/* Source Code Modal */}
      {sourceCodeId && (
        <SourceCodePreviewModal
          submissionId={sourceCodeId}
          title="作品源码"
          onClose={() => setSourceCodeId(null)}
        />
      )}
    </div>
  );
}
