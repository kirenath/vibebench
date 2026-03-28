"use client";

import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Vendor {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

interface ModelFamily {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

interface ModelVariant {
  id: string;
  family_id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

interface Channel {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

type Tab = "vendors" | "families" | "variants" | "channels";

// ── Shared small components ────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12 text-dried-grass">
      <svg
        className="h-6 w-6 animate-spin text-moss"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span className="ml-2 text-sm">Loading...</span>
    </div>
  );
}

// ── Helper: generic API caller ─────────────────────────────────────────────

async function api<T>(
  url: string,
  method: string = "GET",
  body?: Record<string, unknown>,
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const opts: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const json = await res.json();
    if (json.success) return { ok: true, data: json.data };
    return { ok: false, error: json.error || "Request failed" };
  } catch {
    return { ok: false, error: "Network error" };
  }
}

// ── Vendors Section ────────────────────────────────────────────────────────

function VendorSection({
  vendors,
  onRefresh,
}: {
  vendors: Vendor[];
  onRefresh: () => void;
}) {
  const blank = { id: "", name: "", description: "", sort_order: 0 };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setForm(blank);
    setEditing(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = editing ? `/api/vendors/${editing}` : "/api/vendors";
    const method = editing ? "PUT" : "POST";
    const payload = editing
      ? { name: form.name, description: form.description || null, sort_order: form.sort_order }
      : { id: form.id, name: form.name, description: form.description || null, sort_order: form.sort_order };

    const result = await api<Vendor>(url, method, payload);
    setSaving(false);

    if (!result.ok) {
      setError(result.error || "Failed");
      return;
    }
    reset();
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete vendor "${id}"?`)) return;
    const result = await api(`/api/vendors/${id}`, "DELETE");
    if (!result.ok) {
      alert(result.error || "Delete failed");
      return;
    }
    onRefresh();
  }

  function startEdit(v: Vendor) {
    setEditing(v.id);
    setForm({ id: v.id, name: v.name, description: v.description || "", sort_order: v.sort_order });
    setError("");
  }

  const inputCls =
    "h-12 w-full rounded-2xl border border-timber bg-white/50 px-4 text-sm text-foreground placeholder-dried-grass/50 focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none";

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="rounded-[2rem] border border-timber/50 bg-card p-5 shadow-soft">
        <h3 className="mb-3 text-sm font-semibold text-bark">
          {editing ? `Edit Vendor: ${editing}` : "Create Vendor"}
        </h3>
        {error && <p className="mb-2 text-sm text-burnt-sienna">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            className={inputCls}
            placeholder="ID"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            disabled={!!editing}
            required
          />
          <input
            className={inputCls}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className={inputCls}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className={inputCls}
            type="number"
            placeholder="Sort Order"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-moss px-6 py-2.5 text-sm font-semibold text-pale-mist transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? "..." : editing ? "Update" : "Create"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-timber px-4 py-2.5 text-sm font-medium text-dried-grass transition-all hover:border-moss hover:text-moss"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[2rem] border border-timber/50 shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-timber/30 bg-stone/30 text-dried-grass">
            <tr>
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Sort</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-timber/20">
            {vendors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-dried-grass">
                  No vendors found.
                </td>
              </tr>
            )}
            {vendors.map((v) => (
              <tr key={v.id} className="transition-colors hover:bg-moss/5">
                <td className="px-5 py-3 font-mono text-xs text-dried-grass">{v.id}</td>
                <td className="px-5 py-3 font-semibold text-deep-loam">{v.name}</td>
                <td className="max-w-xs truncate px-5 py-3 text-dried-grass">{v.description}</td>
                <td className="px-5 py-3 text-dried-grass">{v.sort_order}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(v)}
                      className="text-sm font-medium text-moss transition-colors hover:text-deep-loam"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-sm font-medium text-burnt-sienna transition-colors hover:text-burnt-sienna/80"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Model Families Section ─────────────────────────────────────────────────

function FamilySection({
  families,
  vendors,
  onRefresh,
}: {
  families: ModelFamily[];
  vendors: Vendor[];
  onRefresh: () => void;
}) {
  const blank = { id: "", vendor_id: "", name: "", description: "", sort_order: 0 };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setForm(blank);
    setEditing(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = editing ? `/api/model-families/${editing}` : "/api/model-families";
    const method = editing ? "PUT" : "POST";
    const payload = editing
      ? { vendor_id: form.vendor_id, name: form.name, description: form.description || null, sort_order: form.sort_order }
      : { id: form.id, vendor_id: form.vendor_id, name: form.name, description: form.description || null, sort_order: form.sort_order };

    const result = await api<ModelFamily>(url, method, payload);
    setSaving(false);

    if (!result.ok) {
      setError(result.error || "Failed");
      return;
    }
    reset();
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete model family "${id}"?`)) return;
    const result = await api(`/api/model-families/${id}`, "DELETE");
    if (!result.ok) {
      alert(result.error || "Delete failed");
      return;
    }
    onRefresh();
  }

  function startEdit(f: ModelFamily) {
    setEditing(f.id);
    setForm({ id: f.id, vendor_id: f.vendor_id, name: f.name, description: f.description || "", sort_order: f.sort_order });
    setError("");
  }

  const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));

  const inputCls =
    "h-12 w-full rounded-2xl border border-timber bg-white/50 px-4 text-sm text-foreground placeholder-dried-grass/50 focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none";
  const selectCls =
    "h-12 w-full rounded-2xl border border-timber bg-white/50 px-4 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none";

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-timber/50 bg-card p-5 shadow-soft">
        <h3 className="mb-3 text-sm font-semibold text-bark">
          {editing ? `Edit Model Family: ${editing}` : "Create Model Family"}
        </h3>
        {error && <p className="mb-2 text-sm text-burnt-sienna">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input
            className={inputCls}
            placeholder="ID"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            disabled={!!editing}
            required
          />
          <select
            className={selectCls}
            value={form.vendor_id}
            onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
            required
          >
            <option value="">-- Vendor --</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <input
            className={inputCls}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className={inputCls}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className={inputCls}
            type="number"
            placeholder="Sort Order"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-moss px-6 py-2.5 text-sm font-semibold text-pale-mist transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? "..." : editing ? "Update" : "Create"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-timber px-4 py-2.5 text-sm font-medium text-dried-grass transition-all hover:border-moss hover:text-moss"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-timber/50 shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-timber/30 bg-stone/30 text-dried-grass">
            <tr>
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Vendor</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Sort</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-timber/20">
            {families.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-dried-grass">
                  No model families found.
                </td>
              </tr>
            )}
            {families.map((f) => (
              <tr key={f.id} className="transition-colors hover:bg-moss/5">
                <td className="px-5 py-3 font-mono text-xs text-dried-grass">{f.id}</td>
                <td className="px-5 py-3 text-dried-grass">{vendorMap.get(f.vendor_id) || f.vendor_id}</td>
                <td className="px-5 py-3 font-semibold text-deep-loam">{f.name}</td>
                <td className="max-w-xs truncate px-5 py-3 text-dried-grass">{f.description}</td>
                <td className="px-5 py-3 text-dried-grass">{f.sort_order}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(f)} className="text-sm font-medium text-moss transition-colors hover:text-deep-loam">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(f.id)} className="text-sm font-medium text-burnt-sienna transition-colors hover:text-burnt-sienna/80">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Model Variants Section ─────────────────────────────────────────────────

function VariantSection({
  variants,
  families,
  onRefresh,
}: {
  variants: ModelVariant[];
  families: ModelFamily[];
  onRefresh: () => void;
}) {
  const blank = { id: "", family_id: "", name: "", description: "", sort_order: 0 };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setForm(blank);
    setEditing(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = editing ? `/api/model-variants/${editing}` : "/api/model-variants";
    const method = editing ? "PUT" : "POST";
    const payload = editing
      ? { family_id: form.family_id, name: form.name, description: form.description || null, sort_order: form.sort_order }
      : { id: form.id, family_id: form.family_id, name: form.name, description: form.description || null, sort_order: form.sort_order };

    const result = await api<ModelVariant>(url, method, payload);
    setSaving(false);

    if (!result.ok) {
      setError(result.error || "Failed");
      return;
    }
    reset();
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete model variant "${id}"?`)) return;
    const result = await api(`/api/model-variants/${id}`, "DELETE");
    if (!result.ok) {
      alert(result.error || "Delete failed");
      return;
    }
    onRefresh();
  }

  function startEdit(v: ModelVariant) {
    setEditing(v.id);
    setForm({ id: v.id, family_id: v.family_id, name: v.name, description: v.description || "", sort_order: v.sort_order });
    setError("");
  }

  const familyMap = new Map(families.map((f) => [f.id, f.name]));

  const inputCls =
    "h-12 w-full rounded-2xl border border-timber bg-white/50 px-4 text-sm text-foreground placeholder-dried-grass/50 focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none";
  const selectCls =
    "h-12 w-full rounded-2xl border border-timber bg-white/50 px-4 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none";

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-timber/50 bg-card p-5 shadow-soft">
        <h3 className="mb-3 text-sm font-semibold text-bark">
          {editing ? `Edit Model Variant: ${editing}` : "Create Model Variant"}
        </h3>
        {error && <p className="mb-2 text-sm text-burnt-sienna">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input
            className={inputCls}
            placeholder="ID"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            disabled={!!editing}
            required
          />
          <select
            className={selectCls}
            value={form.family_id}
            onChange={(e) => setForm({ ...form, family_id: e.target.value })}
            required
          >
            <option value="">-- Family --</option>
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <input
            className={inputCls}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className={inputCls}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className={inputCls}
            type="number"
            placeholder="Sort Order"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-moss px-6 py-2.5 text-sm font-semibold text-pale-mist transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? "..." : editing ? "Update" : "Create"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-timber px-4 py-2.5 text-sm font-medium text-dried-grass transition-all hover:border-moss hover:text-moss"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-timber/50 shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-timber/30 bg-stone/30 text-dried-grass">
            <tr>
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Family</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Sort</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-timber/20">
            {variants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-dried-grass">
                  No model variants found.
                </td>
              </tr>
            )}
            {variants.map((v) => (
              <tr key={v.id} className="transition-colors hover:bg-moss/5">
                <td className="px-5 py-3 font-mono text-xs text-dried-grass">{v.id}</td>
                <td className="px-5 py-3 text-dried-grass">{familyMap.get(v.family_id) || v.family_id}</td>
                <td className="px-5 py-3 font-semibold text-deep-loam">{v.name}</td>
                <td className="max-w-xs truncate px-5 py-3 text-dried-grass">{v.description}</td>
                <td className="px-5 py-3 text-dried-grass">{v.sort_order}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(v)} className="text-sm font-medium text-moss transition-colors hover:text-deep-loam">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="text-sm font-medium text-burnt-sienna transition-colors hover:text-burnt-sienna/80">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Channels Section ───────────────────────────────────────────────────────

function ChannelSection({
  channels,
  onRefresh,
}: {
  channels: Channel[];
  onRefresh: () => void;
}) {
  const blank = { id: "", name: "", description: "", sort_order: 0 };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setForm(blank);
    setEditing(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = editing ? `/api/channels/${editing}` : "/api/channels";
    const method = editing ? "PUT" : "POST";
    const payload = editing
      ? { name: form.name, description: form.description || null, sort_order: form.sort_order }
      : { id: form.id, name: form.name, description: form.description || null, sort_order: form.sort_order };

    const result = await api<Channel>(url, method, payload);
    setSaving(false);

    if (!result.ok) {
      setError(result.error || "Failed");
      return;
    }
    reset();
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete channel "${id}"?`)) return;
    const result = await api(`/api/channels/${id}`, "DELETE");
    if (!result.ok) {
      alert(result.error || "Delete failed");
      return;
    }
    onRefresh();
  }

  function startEdit(c: Channel) {
    setEditing(c.id);
    setForm({ id: c.id, name: c.name, description: c.description || "", sort_order: c.sort_order });
    setError("");
  }

  const inputCls =
    "h-12 w-full rounded-2xl border border-timber bg-white/50 px-4 text-sm text-foreground placeholder-dried-grass/50 focus-visible:ring-2 focus-visible:ring-moss/30 focus-visible:ring-offset-2 focus-visible:outline-none";

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-timber/50 bg-card p-5 shadow-soft">
        <h3 className="mb-3 text-sm font-semibold text-bark">
          {editing ? `Edit Channel: ${editing}` : "Create Channel"}
        </h3>
        {error && <p className="mb-2 text-sm text-burnt-sienna">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            className={inputCls}
            placeholder="ID"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            disabled={!!editing}
            required
          />
          <input
            className={inputCls}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className={inputCls}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className={inputCls}
            type="number"
            placeholder="Sort Order"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-moss px-6 py-2.5 text-sm font-semibold text-pale-mist transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? "..." : editing ? "Update" : "Create"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-timber px-4 py-2.5 text-sm font-medium text-dried-grass transition-all hover:border-moss hover:text-moss"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-timber/50 shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-timber/30 bg-stone/30 text-dried-grass">
            <tr>
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Sort</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-timber/20">
            {channels.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-dried-grass">
                  No channels found.
                </td>
              </tr>
            )}
            {channels.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-moss/5">
                <td className="px-5 py-3 font-mono text-xs text-dried-grass">{c.id}</td>
                <td className="px-5 py-3 font-semibold text-deep-loam">{c.name}</td>
                <td className="max-w-xs truncate px-5 py-3 text-dried-grass">{c.description}</td>
                <td className="px-5 py-3 text-dried-grass">{c.sort_order}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(c)} className="text-sm font-medium text-moss transition-colors hover:text-deep-loam">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-sm font-medium text-burnt-sienna transition-colors hover:text-burnt-sienna/80">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: "vendors", label: "Vendors" },
  { key: "families", label: "Model Families" },
  { key: "variants", label: "Model Variants" },
  { key: "channels", label: "Channels" },
];

export default function AdminModelsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("vendors");
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [families, setFamilies] = useState<ModelFamily[]>([]);
  const [variants, setVariants] = useState<ModelVariant[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  async function fetchAll() {
    setLoading(true);
    const [vRes, fRes, mvRes, cRes] = await Promise.all([
      api<Vendor[]>("/api/vendors"),
      api<ModelFamily[]>("/api/model-families"),
      api<ModelVariant[]>("/api/model-variants?all=true"),
      api<Channel[]>("/api/channels"),
    ]);
    if (vRes.ok && vRes.data) setVendors(vRes.data);
    if (fRes.ok && fRes.data) setFamilies(fRes.data);
    if (mvRes.ok && mvRes.data) setVariants(mvRes.data);
    if (cRes.ok && cRes.data) setChannels(cRes.data);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div>
      <h2
        className="mb-8 text-2xl font-semibold text-deep-loam"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Model Management
      </h2>

      {/* Tab bar */}
      <div className="mb-8 flex gap-1 overflow-x-auto rounded-full border border-timber/30 bg-white/50 p-1.5 backdrop-blur-sm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
              activeTab === tab.key
                ? "bg-moss text-pale-mist shadow-soft"
                : "text-dried-grass hover:bg-stone/50 hover:text-deep-loam"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <Spinner />
      ) : (
        <>
          {activeTab === "vendors" && (
            <VendorSection vendors={vendors} onRefresh={fetchAll} />
          )}
          {activeTab === "families" && (
            <FamilySection families={families} vendors={vendors} onRefresh={fetchAll} />
          )}
          {activeTab === "variants" && (
            <VariantSection variants={variants} families={families} onRefresh={fetchAll} />
          )}
          {activeTab === "channels" && (
            <ChannelSection channels={channels} onRefresh={fetchAll} />
          )}
        </>
      )}
    </div>
  );
}
