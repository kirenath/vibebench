"use client";

import { useEffect, useState, useRef } from "react";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const fileHtmlRef = useRef<HTMLInputElement>(null);
  const filePrdRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    challenge_id: "", challenge_phase_id: "", model_variant_id: "",
    channel_id: "", manual_touched: false, manual_notes: "",
    iteration_count: "", duration_ms: "", timing_method: "", notes: "",
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [s, c, v, ch] = await Promise.all([
      fetch("/api/submissions").then(r => r.json()),
      fetch("/api/challenges?all=true").then(r => r.json()),
      fetch("/api/model-variants").then(r => r.json()),
      fetch("/api/channels").then(r => r.json()),
    ]);
    setSubmissions(s.data || []);
    setChallenges(c.data || []);
    setVariants(v.data || []);
    setChannels(ch.data || []);
  }

  useEffect(() => {
    if (!form.challenge_id) { setPhases([]); return; }
    fetch(`/api/challenges/${form.challenge_id}/phases`).then(r => r.json()).then(d => setPhases(d.data || []));
  }, [form.challenge_id]);

  async function handleCreate() {
    const fd = new FormData();
    fd.append("challenge_phase_id", form.challenge_phase_id);
    fd.append("model_variant_id", form.model_variant_id);
    fd.append("channel_id", form.channel_id);
    fd.append("manual_touched", String(form.manual_touched));
    if (form.manual_notes) fd.append("manual_notes", form.manual_notes);
    if (form.iteration_count) fd.append("iteration_count", form.iteration_count);
    if (form.duration_ms) fd.append("duration_ms", form.duration_ms);
    if (form.timing_method) fd.append("timing_method", form.timing_method);
    if (form.notes) fd.append("notes", form.notes);

    const htmlFile = fileHtmlRef.current?.files?.[0];
    if (htmlFile) fd.append("file_html", htmlFile);
    const prdFile = filePrdRef.current?.files?.[0];
    if (prdFile) fd.append("file_prd", prdFile);

    await fetch("/api/submissions", { method: "POST", body: fd });
    setShowForm(false);
    loadData();
  }

  async function togglePublish(sub: any) {
    await fetch(`/api/submissions/${sub.submission_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !sub.submission_is_published }),
    });
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this submission?")) return;
    await fetch(`/api/submissions/${id}`, { method: "DELETE" });
    loadData();
  }

  const selectClass = "w-full border border-organic-border rounded-full h-10 px-4 text-sm bg-white/50 focus-visible:ring-2 focus-visible:ring-organic-primary/30 ring-offset-1 outline-none transition-all duration-300";
  const inputClass = "w-full border border-organic-border rounded-full h-10 px-4 text-sm bg-white/50 focus-visible:ring-2 focus-visible:ring-organic-primary/30 ring-offset-1 outline-none transition-all duration-300";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold text-organic-fg">Submissions</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-organic-primary text-organic-primary-fg px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.25)] active:scale-95 transition-all duration-300 shadow-soft">
          {showForm ? "Cancel" : "New Submission"}
        </button>
      </div>

      {showForm && (
        <div className="bg-organic-card border border-organic-border/50 rounded-organic p-6 mb-8 space-y-4 shadow-soft">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-organic-muted-fg mb-1.5 font-semibold">Challenge</label>
              <select className={selectClass} value={form.challenge_id}
                onChange={e => setForm({ ...form, challenge_id: e.target.value, challenge_phase_id: "" })}>
                <option value="">Select...</option>
                {challenges.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-organic-muted-fg mb-1.5 font-semibold">Phase</label>
              <select className={selectClass} value={form.challenge_phase_id}
                onChange={e => setForm({ ...form, challenge_phase_id: e.target.value })}>
                <option value="">Select...</option>
                {phases.map((p: any) => <option key={p.id} value={p.id}>{p.phase_label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-organic-muted-fg mb-1.5 font-semibold">Model Variant</label>
              <select className={selectClass} value={form.model_variant_id}
                onChange={e => setForm({ ...form, model_variant_id: e.target.value })}>
                <option value="">Select...</option>
                {variants.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-organic-muted-fg mb-1.5 font-semibold">Channel</label>
              <select className={selectClass} value={form.channel_id}
                onChange={e => setForm({ ...form, channel_id: e.target.value })}>
                <option value="">Select...</option>
                {channels.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-organic-muted-fg mb-1.5 font-semibold">Iterations</label>
              <input type="number" className={inputClass} value={form.iteration_count}
                onChange={e => setForm({ ...form, iteration_count: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-organic-muted-fg mb-1.5 font-semibold">Duration (ms)</label>
              <input type="number" className={inputClass} value={form.duration_ms}
                onChange={e => setForm({ ...form, duration_ms: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-organic-muted-fg mb-1.5 font-semibold">Timing Method</label>
              <select className={selectClass} value={form.timing_method}
                onChange={e => setForm({ ...form, timing_method: e.target.value })}>
                <option value="">None</option>
                <option value="manual">Manual</option>
                <option value="measured">Measured</option>
                <option value="estimated">Estimated</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-organic-fg">
              <input type="checkbox" checked={form.manual_touched}
                onChange={e => setForm({ ...form, manual_touched: e.target.checked })} className="accent-organic-primary" />
              Manual Touched
            </label>
            {form.manual_touched && (
              <input placeholder="Manual notes..." className="flex-1 border border-organic-border rounded-full h-10 px-4 text-sm bg-white/50 focus-visible:ring-2 focus-visible:ring-organic-primary/30 ring-offset-1 outline-none transition-all duration-300"
                value={form.manual_notes} onChange={e => setForm({ ...form, manual_notes: e.target.value })} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-organic-muted-fg mb-1.5 font-semibold">HTML File</label>
              <input type="file" ref={fileHtmlRef} accept=".html,.htm" className="text-sm text-organic-muted-fg" />
            </div>
            <div>
              <label className="block text-xs text-organic-muted-fg mb-1.5 font-semibold">PRD File</label>
              <input type="file" ref={filePrdRef} accept=".md,.txt" className="text-sm text-organic-muted-fg" />
            </div>
          </div>
          <button onClick={handleCreate}
            className="bg-organic-primary text-organic-primary-fg px-8 py-2.5 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-soft">Create</button>
        </div>
      )}

      <div className="bg-organic-card rounded-organic border border-organic-border/50 overflow-hidden shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-organic-muted/50 text-left">
            <tr>
              <th className="px-5 py-3.5 font-semibold text-organic-muted-fg">Challenge</th>
              <th className="px-5 py-3.5 font-semibold text-organic-muted-fg">Phase</th>
              <th className="px-5 py-3.5 font-semibold text-organic-muted-fg">Model</th>
              <th className="px-5 py-3.5 font-semibold text-organic-muted-fg">Channel</th>
              <th className="px-5 py-3.5 font-semibold text-organic-muted-fg">Artifacts</th>
              <th className="px-5 py-3.5 font-semibold text-organic-muted-fg">Status</th>
              <th className="px-5 py-3.5 font-semibold text-organic-muted-fg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-organic-border/30">
            {submissions.map((s: any) => (
              <tr key={s.submission_id} className="hover:bg-organic-muted/20 transition-colors duration-200">
                <td className="px-5 py-3.5 text-organic-fg">{s.challenge_title}</td>
                <td className="px-5 py-3.5 text-organic-fg">{s.phase_label}</td>
                <td className="px-5 py-3.5 text-organic-fg font-medium">{s.model_variant_name}</td>
                <td className="px-5 py-3.5 text-organic-fg">{s.channel_name}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1.5">
                    {s.has_html && <span className="text-xs px-2.5 py-1 rounded-full bg-organic-primary/10 text-organic-primary font-medium">HTML</span>}
                    {s.has_prd && <span className="text-xs px-2.5 py-1 rounded-full bg-organic-secondary/10 text-organic-secondary font-medium">PRD</span>}
                    {s.has_screenshot && <span className="text-xs px-2.5 py-1 rounded-full bg-organic-accent text-organic-accent-fg font-medium">IMG</span>}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <button onClick={() => togglePublish(s)}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all duration-300 ${s.submission_is_published ? "bg-organic-primary/10 text-organic-primary" : "bg-organic-muted text-organic-muted-fg"}`}>
                    {s.submission_is_published ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <button onClick={() => handleDelete(s.submission_id)} className="text-xs text-organic-destructive font-bold hover:text-organic-destructive/80 transition-colors duration-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
