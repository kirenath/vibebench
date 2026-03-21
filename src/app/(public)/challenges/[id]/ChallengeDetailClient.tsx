'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Eye, FileText, Clock, RotateCcw, ExternalLink, X } from 'lucide-react';
import type { Challenge, ChallengePhase, SubmissionOverview } from '@/types/database';

interface Props {
  challenge: Challenge;
  phases: ChallengePhase[];
  submissions: SubmissionOverview[];
  sandboxBaseUrl: string;
}

export default function ChallengeDetailClient({ challenge, phases, submissions, sandboxBaseUrl }: Props) {
  const defaultPhase = phases.find(p => p.is_default) || phases[0];
  const [activePhaseId, setActivePhaseId] = useState(defaultPhase?.id || '');
  const [previewSubmission, setPreviewSubmission] = useState<SubmissionOverview | null>(null);
  const [showPrd, setShowPrd] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  const filteredSubmissions = submissions.filter(s => s.challenge_phase_id === activePhaseId);

  function formatDuration(ms: number | null) {
    if (!ms) return null;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  }

  return (
    <section className="section" style={{ paddingTop: 'var(--space-8)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ marginBottom: 'var(--space-4)' }}>{challenge.title}</h1>
          {challenge.description && (
            <p className="text-muted text-lg">{challenge.description}</p>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
            {challenge.rules_markdown && (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowRules(true)}>
                <FileText size={16} /> 查看规则
              </button>
            )}
            <Link
              href={`/compare?challenge=${challenge.id}${activePhaseId ? `&phase=${phases.find(p => p.id === activePhaseId)?.phase_key}` : ''}`}
              className="btn btn-primary btn-sm"
            >
              <Eye size={16} /> 横评对比
            </Link>
          </div>
        </div>

        {/* Phase Tabs */}
        {phases.length > 1 && (
          <div className="tabs">
            {phases.map(p => (
              <button
                key={p.id}
                className={`tab ${activePhaseId === p.id ? 'active' : ''}`}
                onClick={() => setActivePhaseId(p.id)}
              >
                {p.phase_label}
              </button>
            ))}
          </div>
        )}

        {/* Submissions */}
        {filteredSubmissions.length > 0 ? (
          <div className="grid grid-3">
            {filteredSubmissions.map((s, i) => (
              <div key={s.submission_id} className={`card card-organic-${(i % 6) + 1}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <h4 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>{s.model_variant_name}</h4>
                    <p className="text-sm text-muted" style={{ margin: 0 }}>
                      {s.vendor_name} · {s.channel_name}
                    </p>
                  </div>
                  {s.manual_touched && (
                    <span className="badge badge-warning" title={s.manual_notes || '该作品经过人工修改'}>
                      <AlertTriangle size={10} /> 人工修订
                    </span>
                  )}
                </div>

                {/* Meta info */}
                <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)' }}>
                  {s.duration_ms && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {formatDuration(s.duration_ms)}
                    </span>
                  )}
                  {s.iteration_count != null && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RotateCcw size={12} /> {s.iteration_count} 轮
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {s.has_html && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setPreviewSubmission(s)}
                    >
                      <Eye size={14} /> 预览
                    </button>
                  )}
                  {s.has_prd && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowPrd(s.submission_id)}
                    >
                      <FileText size={14} /> PRD
                    </button>
                  )}
                  {!s.has_html && (
                    <span className="text-xs text-muted">暂无 HTML 作品</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>暂无作品</h3>
            <p className="text-muted">该 phase 下还没有已发布的作品</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewSubmission && (
        <div className="modal-overlay" onClick={() => setPreviewSubmission(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--color-card)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-float)',
              width: '95vw',
              maxWidth: '1200px',
              height: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: 'var(--space-4) var(--space-6)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <strong>{previewSubmission.model_variant_name}</strong>
                <span className="text-sm text-muted"> · {previewSubmission.vendor_name} · {previewSubmission.channel_name}</span>
                {previewSubmission.manual_touched && <span className="badge badge-warning" style={{ marginLeft: 8 }}>人工修订</span>}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <a
                  href={`${sandboxBaseUrl}/s/${previewSubmission.submission_id}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  <ExternalLink size={14} />
                </a>
                <button className="btn btn-ghost btn-sm" onClick={() => setPreviewSubmission(null)}>
                  <X size={14} />
                </button>
              </div>
            </div>
            <iframe
              src={`${sandboxBaseUrl}/s/${previewSubmission.submission_id}/`}
              sandbox="allow-scripts"
              style={{ flex: 1, border: 'none', width: '100%' }}
              title={`Preview: ${previewSubmission.model_variant_name}`}
            />
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && challenge.rules_markdown && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-content markdown-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ margin: 0 }}>规则说明</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowRules(false)}>
                <X size={14} />
              </button>
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{challenge.rules_markdown}</div>
          </div>
        </div>
      )}

      {/* PRD Modal (placeholder — loads text) */}
      {showPrd && (
        <div className="modal-overlay" onClick={() => setShowPrd(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ margin: 0 }}>PRD 文档</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPrd(null)}>
                <X size={14} />
              </button>
            </div>
            <iframe
              src={`${sandboxBaseUrl}/s/${showPrd}/prd.md`}
              style={{ width: '100%', minHeight: '400px', border: 'none' }}
              title="PRD Document"
            />
          </div>
        </div>
      )}
    </section>
  );
}
