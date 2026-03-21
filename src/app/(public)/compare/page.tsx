'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeftRight, X, ExternalLink, AlertTriangle } from 'lucide-react';
import type { Challenge, ChallengePhase, SubmissionOverview } from '@/types/database';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [phases, setPhases] = useState<ChallengePhase[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionOverview[]>([]);

  const [selectedChallenge, setSelectedChallenge] = useState(searchParams.get('challenge') || '');
  const [selectedPhase, setSelectedPhase] = useState(searchParams.get('phase') || '');
  const [leftKey, setLeftKey] = useState(searchParams.get('left') || '');
  const [rightKey, setRightKey] = useState(searchParams.get('right') || '');

  const sandboxBaseUrl = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
    : '';

  // Load challenges
  useEffect(() => {
    fetch('/api/challenges').then(r => r.json()).then(setChallenges);
  }, []);

  // Load phases when challenge changes
  useEffect(() => {
    if (!selectedChallenge) { setPhases([]); return; }
    fetch(`/api/challenges/${selectedChallenge}/phases`).then(r => r.json()).then((p: ChallengePhase[]) => {
      setPhases(p);
      const defaultPhase = p.find((ph: ChallengePhase) => ph.is_default) || p[0];
      if (defaultPhase && !selectedPhase) setSelectedPhase(defaultPhase.phase_key);
    });
  }, [selectedChallenge]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load submissions when challenge changes
  useEffect(() => {
    if (!selectedChallenge) { setSubmissions([]); return; }
    fetch(`/api/submissions?challenge_id=${selectedChallenge}`).then(r => r.json()).then(setSubmissions);
  }, [selectedChallenge]);

  // Update URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedChallenge) params.set('challenge', selectedChallenge);
    if (selectedPhase) params.set('phase', selectedPhase);
    if (leftKey) params.set('left', leftKey);
    if (rightKey) params.set('right', rightKey);
    const url = `/compare?${params.toString()}`;
    router.replace(url, { scroll: false });
  }, [selectedChallenge, selectedPhase, leftKey, rightKey, router]);

  // Filter submissions by selected phase
  const activePhase = phases.find(p => p.phase_key === selectedPhase);
  const phaseSubmissions = submissions.filter(
    s => s.challenge_phase_id === activePhase?.id && s.has_html
  );

  // Build submission options (model_variant_id~channel_id)
  const options = phaseSubmissions.map(s => ({
    key: `${s.model_variant_id}~${s.channel_id}`,
    label: `${s.model_variant_name} · ${s.channel_name}`,
    submission: s,
  }));

  const leftSubmission = options.find(o => o.key === leftKey)?.submission;
  const rightSubmission = options.find(o => o.key === rightKey)?.submission;

  return (
    <section className="section" style={{ paddingTop: 'var(--space-8)' }}>
      <div className="container">
        <h1 style={{ marginBottom: 'var(--space-6)' }}>
          <ArrowLeftRight size={32} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--color-primary)' }} />
          横评对比
        </h1>

        {/* Selectors */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
          {/* Challenge */}
          <div className="field" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label>赛题</label>
            <select
              className="input"
              value={selectedChallenge}
              onChange={e => { setSelectedChallenge(e.target.value); setLeftKey(''); setRightKey(''); }}
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <option value="">选择赛题</option>
              {challenges.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          {/* Phase */}
          {phases.length > 0 && (
            <div className="field" style={{ flex: '1 1 150px', marginBottom: 0 }}>
              <label>Phase</label>
              <select
                className="input"
                value={selectedPhase}
                onChange={e => setSelectedPhase(e.target.value)}
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                {phases.map(p => <option key={p.id} value={p.phase_key}>{p.phase_label}</option>)}
              </select>
            </div>
          )}

          {/* Left */}
          <div className="field" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label>左侧模型</label>
            <select
              className="input"
              value={leftKey}
              onChange={e => setLeftKey(e.target.value)}
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <option value="">选择模型</option>
              {options.filter(o => o.key !== rightKey).map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Right */}
          <div className="field" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label>右侧模型</label>
            <select
              className="input"
              value={rightKey}
              onChange={e => setRightKey(e.target.value)}
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <option value="">选择模型</option>
              {options.filter(o => o.key !== leftKey).map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Compare Frames */}
        {leftSubmission || rightSubmission ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', minHeight: '70vh' }}>
            <ComparePanel submission={leftSubmission} sandboxBaseUrl={sandboxBaseUrl} side="左" />
            <ComparePanel submission={rightSubmission} sandboxBaseUrl={sandboxBaseUrl} side="右" />
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: 'var(--space-8)' }}>
            <ArrowLeftRight size={48} style={{ opacity: 0.3, margin: '0 auto var(--space-4)' }} />
            <h3>选择赛题和两个模型开始对比</h3>
            <p className="text-muted">在上方选择器中选择赛题、phase，以及左右两侧要对比的模型</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ComparePanel({ submission, sandboxBaseUrl, side }: {
  submission?: SubmissionOverview;
  sandboxBaseUrl: string;
  side: string;
}) {
  if (!submission) {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p className="text-muted">请选择{side}侧模型</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <strong style={{ fontSize: 'var(--text-sm)' }}>{submission.model_variant_name}</strong>
          <span className="text-xs text-muted">{submission.channel_name}</span>
          {submission.manual_touched && (
            <span className="badge badge-warning" style={{ fontSize: '10px' }}>
              <AlertTriangle size={8} /> 人工修订
            </span>
          )}
        </div>
        <a
          href={`${sandboxBaseUrl}/s/${submission.submission_id}/`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          <ExternalLink size={14} />
        </a>
      </div>
      {/* Iframe */}
      <iframe
        src={`${sandboxBaseUrl}/s/${submission.submission_id}/`}
        sandbox="allow-scripts"
        style={{ flex: 1, border: 'none', width: '100%', minHeight: '60vh' }}
        title={`${submission.model_variant_name} — ${submission.channel_name}`}
      />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="container section"><div className="skeleton" style={{ height: 400 }} /></div>}>
      <CompareContent />
    </Suspense>
  );
}
