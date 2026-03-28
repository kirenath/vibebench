import { query } from "@/lib/db";
import type { Challenge, SubmissionOverview } from "@/types";

export const dynamic = "force-dynamic";

async function getChallenges(): Promise<Pick<Challenge, "id" | "title">[]> {
  try {
    const result = await query<Pick<Challenge, "id" | "title">>(
      "SELECT id, title FROM public.challenges WHERE is_published = true ORDER BY sort_order, created_at DESC"
    );
    return result.rows;
  } catch {
    return [];
  }
}

export default async function ComparePage() {
  const challenges = await getChallenges();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1
        className="mb-12 text-4xl font-bold text-deep-loam md:text-5xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        横评对比
      </h1>

      {challenges.length === 0 ? (
        <div className="grain-overlay rounded-[2rem] border border-timber/50 bg-card p-16 text-center shadow-soft">
          <p className="text-dried-grass">暂无可对比的赛题</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── Challenge Selection ── */}
          <div>
            <label className="mb-2 block text-sm font-medium text-bark">
              选择赛题
            </label>
            <select
              id="challenge-select"
              className="h-12 w-full max-w-md rounded-full border border-timber bg-white/50 px-5 text-sm text-foreground transition-all focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                请选择赛题...
              </option>
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* ── Phase Selection ── */}
          <div>
            <label className="mb-2 block text-sm font-medium text-bark">
              选择阶段
            </label>
            <select
              id="phase-select"
              className="h-12 w-full max-w-md rounded-full border border-timber bg-white/50 px-5 text-sm text-foreground transition-all focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                请先选择赛题...
              </option>
            </select>
          </div>

          {/* ── Entry Selection ── */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-bark">
                参赛项 A
              </label>
              <select
                id="entry-a"
                className="h-12 w-full rounded-full border border-timber bg-white/50 px-5 text-sm text-foreground transition-all focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  请先选择阶段...
                </option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-bark">
                参赛项 B
              </label>
              <select
                id="entry-b"
                className="h-12 w-full rounded-full border border-timber bg-white/50 px-5 text-sm text-foreground transition-all focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  请先选择阶段...
                </option>
              </select>
            </div>
          </div>

          {/* ── Compare Button ── */}
          <button
            id="compare-btn"
            className="rounded-full bg-moss px-10 py-3 text-sm font-semibold text-pale-mist shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.25)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled
          >
            开始对比
          </button>

          {/* ── Comparison Iframe Area ── */}
          <div id="compare-area" className="hidden">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="overflow-hidden rounded-[2rem] border border-timber/50 bg-card shadow-soft">
                <div id="entry-a-header" className="border-b border-timber/30 px-5 py-3 text-sm font-semibold text-deep-loam" style={{ fontFamily: "var(--font-heading)" }} />
                <iframe
                  id="iframe-a"
                  sandbox="allow-scripts"
                  className="h-[600px] w-full"
                  title="Entry A"
                />
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-timber/50 bg-card shadow-soft">
                <div id="entry-b-header" className="border-b border-timber/30 px-5 py-3 text-sm font-semibold text-deep-loam" style={{ fontFamily: "var(--font-heading)" }} />
                <iframe
                  id="iframe-b"
                  sandbox="allow-scripts"
                  className="h-[600px] w-full"
                  title="Entry B"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client-side comparison logic */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  const challengeSelect = document.getElementById('challenge-select');
  const phaseSelect = document.getElementById('phase-select');
  const entryA = document.getElementById('entry-a');
  const entryB = document.getElementById('entry-b');
  const compareBtn = document.getElementById('compare-btn');
  const compareArea = document.getElementById('compare-area');

  let submissions = [];

  challengeSelect?.addEventListener('change', async function() {
    const cid = this.value;
    phaseSelect.innerHTML = '<option value="" disabled selected>加载中...</option>';
    try {
      const res = await fetch('/api/challenges/' + cid + '/phases');
      const data = await res.json();
      if (data.success && data.data) {
        phaseSelect.innerHTML = data.data.map(p =>
          '<option value="' + p.id + '">' + p.phase_label + '</option>'
        ).join('');
        if (data.data.length > 0) phaseSelect.selectedIndex = 0;
      }
    } catch(e) {
      phaseSelect.innerHTML = '<option value="" disabled selected>加载失败</option>';
    }
  });

  phaseSelect?.addEventListener('change', async function() {
    const pid = this.value;
    try {
      const res = await fetch('/api/submissions?phase_id=' + pid);
      const data = await res.json();
      if (data.success && data.data) {
        submissions = data.data.filter(s => s.has_html);
        const opts = submissions.map(s =>
          '<option value="' + s.submission_id + '">' +
          s.model_variant_name + ' (' + s.channel_name + ')' +
          (s.manual_touched ? ' [人工修订]' : '') +
          '</option>'
        ).join('');
        entryA.innerHTML = opts || '<option value="" disabled>无可用作品</option>';
        entryB.innerHTML = opts || '<option value="" disabled>无可用作品</option>';
        if (submissions.length >= 2) {
          entryA.selectedIndex = 0;
          entryB.selectedIndex = 1;
        }
        updateCompareBtn();
      }
    } catch(e) {}
  });

  function updateCompareBtn() {
    compareBtn.disabled = !(entryA.value && entryB.value && entryA.value !== entryB.value);
  }
  entryA?.addEventListener('change', updateCompareBtn);
  entryB?.addEventListener('change', updateCompareBtn);

  compareBtn?.addEventListener('click', function() {
    const a = entryA.value;
    const b = entryB.value;
    if (!a || !b || a === b) return;

    const sandboxBase = document.querySelector('meta[name="sandbox-base"]')?.content || '/s';

    document.getElementById('entry-a-header').textContent = entryA.options[entryA.selectedIndex].text;
    document.getElementById('entry-b-header').textContent = entryB.options[entryB.selectedIndex].text;
    document.getElementById('iframe-a').src = sandboxBase + '/' + a + '/html/index.html';
    document.getElementById('iframe-b').src = sandboxBase + '/' + b + '/html/index.html';
    compareArea.classList.remove('hidden');
  });
})();
          `,
        }}
      />
    </div>
  );
}
