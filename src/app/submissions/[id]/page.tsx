"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface SubmissionDetail {
  submission_id: string;
  challenge_id: string;
  challenge_title: string;
  phase_label: string;
  phase_key: string;
  model_variant_id: string;
  model_variant_name: string;
  vendor_name: string;
  channel_name: string;
  channel_id: string;
  manual_touched: boolean;
  manual_notes: string | null;
  duration_ms: number | null;
  iteration_count: number | null;
  timing_method: string | null;
  prompt_snapshot: string | null;
  notes: string | null;
  has_html: boolean;
  has_prd: boolean;
  artifacts: Array<{ id: string; type: string; file_path: string; file_name: string }>;
}

export default function SubmissionPreviewPage() {
  const params = useParams();
  const id = params.id as string;
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showPrd, setShowPrd] = useState(false);
  const [prdContent, setPrdContent] = useState("");

  useEffect(() => {
    fetch(`/api/submissions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setSubmission(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const loadPrd = async () => {
    if (prdContent) { setShowPrd(true); return; }
    // We'd need a PRD content endpoint; for now show the file path
    setShowPrd(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="skeleton w-16 h-16 rounded-full mx-auto mb-4"></div>
          <div className="skeleton h-4 w-32 mx-auto mb-2"></div>
          <div className="skeleton h-3 w-24 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🍂</div>
        <h2 className="text-2xl font-heading font-bold text-bark-dark mb-3">作品不存在</h2>
        <p className="text-muted mb-6">该作品可能已被移除或尚未发布</p>
        <Link href="/" className="btn-primary">返回首页</Link>
      </div>
    );
  }

  const iframeUrl = submission.has_html ? `/s/${submission.submission_id}/index.html` : null;

  if (fullscreen && iframeUrl) {
    return (
      <div className="fixed inset-0 z-[100] bg-white">
        <button
          onClick={() => setFullscreen(false)}
          className="fixed top-4 right-4 z-[101] bg-bark-dark/80 text-white px-4 py-2 rounded-lg hover:bg-bark-dark transition-colors text-sm font-medium"
        >
          退出全屏
        </button>
        <iframe src={iframeUrl} className="w-full h-full border-0" sandbox="allow-scripts" title="作品预览" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Top Bar */}
      <div className="bg-white border-b border-sand-light px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/challenges/${submission.challenge_id}`} className="text-sm text-muted hover:text-bark transition-colors">
              ← {submission.challenge_title}
            </Link>
            <span className="text-sand">|</span>
            <span className="text-sm font-medium text-bark-dark">{submission.model_variant_name}</span>
            <span className="badge badge-neutral text-xs">{submission.channel_name}</span>
            <span className="badge badge-neutral text-xs">{submission.phase_label}</span>
            {submission.manual_touched && (
              <span className="badge badge-warning text-xs">⚠ 人工修订</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-secondary text-xs px-3 py-1.5">
              {sidebarOpen ? "隐藏信息" : "显示信息"}
            </button>
            {iframeUrl && (
              <button onClick={() => setFullscreen(true)} className="btn-secondary text-xs px-3 py-1.5">
                全屏
              </button>
            )}
            <Link
              href={`/compare?challenge=${submission.challenge_id}&phase=${submission.phase_key}&left=${submission.model_variant_id}@${submission.channel_id}`}
              className="btn-primary text-xs px-3 py-1.5"
            >
              对比
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 border-r border-sand-light bg-parchment overflow-y-auto p-5 shrink-0 hidden lg:block">
            <h3 className="font-heading font-semibold text-bark-dark mb-4">作品信息</h3>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-stone text-xs mb-0.5">模型</dt><dd className="text-bark-dark font-medium">{submission.model_variant_name}</dd></div>
              <div><dt className="text-stone text-xs mb-0.5">厂商</dt><dd className="text-bark">{submission.vendor_name}</dd></div>
              <div><dt className="text-stone text-xs mb-0.5">渠道</dt><dd className="text-bark">{submission.channel_name}</dd></div>
              <div><dt className="text-stone text-xs mb-0.5">Phase</dt><dd className="text-bark">{submission.phase_label}</dd></div>
              {submission.duration_ms != null && (
                <div><dt className="text-stone text-xs mb-0.5">耗时</dt><dd className="text-bark">{(submission.duration_ms / 1000).toFixed(1)} 秒 ({submission.timing_method || "未标注"})</dd></div>
              )}
              {submission.iteration_count != null && (
                <div><dt className="text-stone text-xs mb-0.5">迭代次数</dt><dd className="text-bark">{submission.iteration_count} 次</dd></div>
              )}
              {submission.manual_touched && (
                <div className="bg-warning-light p-3 rounded-lg">
                  <dt className="text-xs font-semibold text-amber-800 mb-1">⚠ 人工修订</dt>
                  <dd className="text-xs text-amber-700">{submission.manual_notes || "无备注"}</dd>
                </div>
              )}
              {submission.notes && (
                <div><dt className="text-stone text-xs mb-0.5">备注</dt><dd className="text-bark text-xs">{submission.notes}</dd></div>
              )}
            </dl>
            {submission.has_prd && (
              <button onClick={loadPrd} className="btn-secondary w-full mt-5 text-sm">
                查看 PRD 文档
              </button>
            )}
          </aside>
        )}

        {/* iframe Area */}
        <div className="flex-1 bg-white relative">
          {iframeUrl ? (
            <iframe
              src={iframeUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
              title="作品预览"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-heading font-semibold text-bark mb-2">无 HTML 预览</h3>
                <p className="text-muted">该作品暂无 HTML 文件可供预览</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRD Modal */}
      {showPrd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark-dark/50 backdrop-blur-sm" onClick={() => setShowPrd(false)}>
          <div className="card max-w-2xl w-full max-h-[80vh] overflow-y-auto mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-bark-dark">PRD 文档</h3>
              <button onClick={() => setShowPrd(false)} className="text-stone hover:text-bark transition-colors">&times;</button>
            </div>
            <div className="prose">
              <p className="text-muted text-sm">{prdContent || "PRD 文档内容加载中..."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
