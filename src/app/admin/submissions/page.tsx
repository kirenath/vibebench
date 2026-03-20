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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-600">
          {showForm ? "Cancel" : "New Submission"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Challenge</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.challenge_id}
                onChange={e => setForm({ ...form, challenge_id: e.target.value, challenge_phase_id: "" })}>
                <option value="">Select...</option>
                {challenges.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phase</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.challenge_phase_id}
                onChange={e => setForm({ ...form, challenge_phase_id: e.target.value })}>
                <option value="">Select...</option>
                {phases.map((p: any) => <option key={p.id} value={p.id}>{p.phase_label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Model Variant</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.model_variant_id}
                onChange={e => setForm({ ...form, model_variant_id: e.target.value })}>
                <option value="">Select...</option>
                {variants.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Channel</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.channel_id}
                onChange={e => setForm({ ...form, channel_id: e.target.value })}>
                <option value="">Select...</option>
                {channels.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Iterations</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.iteration_count}
                onChange={e => setForm({ ...form, iteration_count: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Duration (ms)</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.duration_ms}
                onChange={e => setForm({ ...form, duration_ms: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Timing Method</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.timing_method}
                onChange={e => setForm({ ...form, timing_method: e.target.value })}>
                <option value="">None</option>
                <option value="manual">Manual</option>
                <option value="measured">Measured</option>
                <option value="estimated">Estimated</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.manual_touched}
                onChange={e => setForm({ ...form, manual_touched: e.target.checked })} />
              Manual Touched
            </label>
            {form.manual_touched && (
              <input placeholder="Manual notes..." className="flex-1 border rounded-lg px-3 py-2 text-sm"
                value={form.manual_notes} onChange={e => setForm({ ...form, manual_notes: e.target.value })} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">HTML File</label>
              <input type="file" ref={fileHtmlRef} accept=".html,.htm" className="text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">PRD File</label>
              <input type="file" ref={filePrdRef} accept=".md,.txt" className="text-sm" />
            </div>
          </div>
          <button onClick={handleCreate}
            className="bg-brand-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-brand-600">Create</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500">Challenge</th>
              <th className="px-4 py-3 font-medium text-gray-500">Phase</th>
              <th className="px-4 py-3 font-medium text-gray-500">Model</th>
              <th className="px-4 py-3 font-medium text-gray-500">Channel</th>
              <th className="px-4 py-3 font-medium text-gray-500">Artifacts</th>
              <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {submissions.map((s: any) => (
              <tr key={s.submission_id}>
                <td className="px-4 py-3">{s.challenge_title}</td>
                <td className="px-4 py-3">{s.phase_label}</td>
                <td className="px-4 py-3">{s.model_variant_name}</td>
                <td className="px-4 py-3">{s.channel_name}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {s.has_html && <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-600">HTML</span>}
                    {s.has_prd && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">PRD</span>}
                    {s.has_screenshot && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">IMG</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => togglePublish(s)}
                    className={`text-xs px-2 py-1 rounded ${s.submission_is_published ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                    {s.submission_is_published ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(s.submission_id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
