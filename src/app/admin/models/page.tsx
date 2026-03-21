"use client";

import { useEffect, useState, useCallback } from "react";

interface Vendor { id: string; name: string; description: string | null; sort_order: number; }
interface Family { id: string; vendor_id: string; name: string; description: string | null; vendor_name: string; sort_order: number; }
interface Variant { id: string; family_id: string; name: string; description: string | null; family_name: string; vendor_name: string; sort_order: number; }
interface Channel { id: string; name: string; description: string | null; sort_order: number; }

type Tab = "vendors" | "families" | "variants" | "channels";

export default function AdminModelsPage() {
  const [tab, setTab] = useState<Tab>("vendors");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string | number>>({});

  const fetchData = useCallback(async () => {
    const [v, f, mv, ch] = await Promise.all([
      fetch("/api/vendors").then(r => r.json()),
      fetch("/api/model-families").then(r => r.json()),
      fetch("/api/model-variants").then(r => r.json()),
      fetch("/api/channels").then(r => r.json()),
    ]);
    setVendors(v); setFamilies(f); setVariants(mv); setChannels(ch);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls: Record<Tab, string> = { vendors: "/api/vendors", families: "/api/model-families", variants: "/api/model-variants", channels: "/api/channels" };
    await fetch(urls[tab], { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false); setForm({});
    fetchData();
  };

  const handleDelete = async (type: Tab, id: string) => {
    if (!confirm("确定删除？如果有下级关联数据，将无法删除。")) return;
    const urls: Record<Tab, string> = { vendors: `/api/vendors/${id}`, families: `/api/model-families/${id}`, variants: `/api/model-variants/${id}`, channels: `/api/channels/${id}` };
    const res = await fetch(urls[type], { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); alert(d.error || "删除失败"); return; }
    fetchData();
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "vendors", label: "厂商", icon: "🏢" },
    { key: "families", label: "产品线", icon: "📦" },
    { key: "variants", label: "模型版本", icon: "🤖" },
    { key: "channels", label: "渠道", icon: "📡" },
  ];

  const renderForm = () => {
    const fields: Record<Tab, Array<{ key: string; label: string; type?: string; options?: { value: string; label: string }[] }>> = {
      vendors: [{ key: "id", label: "ID (slug)" }, { key: "name", label: "名称" }, { key: "description", label: "描述" }, { key: "sort_order", label: "排序", type: "number" }],
      families: [{ key: "id", label: "ID (slug)" }, { key: "vendor_id", label: "厂商", options: vendors.map(v => ({ value: v.id, label: v.name })) }, { key: "name", label: "名称" }, { key: "description", label: "描述" }, { key: "sort_order", label: "排序", type: "number" }],
      variants: [{ key: "id", label: "ID (slug)" }, { key: "family_id", label: "产品线", options: families.map(f => ({ value: f.id, label: `${f.vendor_name} / ${f.name}` })) }, { key: "name", label: "名称" }, { key: "description", label: "描述" }, { key: "sort_order", label: "排序", type: "number" }],
      channels: [{ key: "id", label: "ID (slug)" }, { key: "name", label: "名称" }, { key: "description", label: "描述" }, { key: "sort_order", label: "排序", type: "number" }],
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark-dark/50 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
        <div className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-heading font-semibold text-bark-dark mb-4">新建{tabs.find(t => t.key === tab)?.label}</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            {fields[tab].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-bark mb-1">{f.label}</label>
                {f.options ? (
                  <select value={form[f.key] || ""} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} className="input-field" required>
                    <option value="">请选择</option>
                    {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input type={f.type || "text"} value={form[f.key] || ""} onChange={e => setForm(p => ({...p, [f.key]: f.type === "number" ? parseInt(e.target.value) || 0 : e.target.value}))} className="input-field" required={f.key === "id" || f.key === "name"} />
                )}
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
              <button type="submit" className="btn-primary">创建</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    switch (tab) {
      case "vendors":
        return (
          <table className="w-full text-sm">
            <thead className="bg-cream-dark"><tr><th className="text-left px-4 py-3 font-medium text-bark">ID</th><th className="text-left px-4 py-3 font-medium text-bark">名称</th><th className="text-left px-4 py-3 font-medium text-bark">描述</th><th className="text-right px-4 py-3 font-medium text-bark">操作</th></tr></thead>
            <tbody>{vendors.map(v => (
              <tr key={v.id} className="border-t border-sand-light hover:bg-parchment"><td className="px-4 py-3 font-mono text-xs text-muted">{v.id}</td><td className="px-4 py-3 font-medium text-bark-dark">{v.name}</td><td className="px-4 py-3 text-muted text-xs">{v.description || "—"}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete("vendors", v.id)} className="text-xs text-danger hover:underline">删除</button></td></tr>
            ))}</tbody>
          </table>
        );
      case "families":
        return (
          <table className="w-full text-sm">
            <thead className="bg-cream-dark"><tr><th className="text-left px-4 py-3 font-medium text-bark">ID</th><th className="text-left px-4 py-3 font-medium text-bark">厂商</th><th className="text-left px-4 py-3 font-medium text-bark">名称</th><th className="text-right px-4 py-3 font-medium text-bark">操作</th></tr></thead>
            <tbody>{families.map(f => (
              <tr key={f.id} className="border-t border-sand-light hover:bg-parchment"><td className="px-4 py-3 font-mono text-xs text-muted">{f.id}</td><td className="px-4 py-3 text-sm text-bark">{f.vendor_name}</td><td className="px-4 py-3 font-medium text-bark-dark">{f.name}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete("families", f.id)} className="text-xs text-danger hover:underline">删除</button></td></tr>
            ))}</tbody>
          </table>
        );
      case "variants":
        return (
          <table className="w-full text-sm">
            <thead className="bg-cream-dark"><tr><th className="text-left px-4 py-3 font-medium text-bark">ID</th><th className="text-left px-4 py-3 font-medium text-bark">厂商/产品线</th><th className="text-left px-4 py-3 font-medium text-bark">名称</th><th className="text-right px-4 py-3 font-medium text-bark">操作</th></tr></thead>
            <tbody>{variants.map(v => (
              <tr key={v.id} className="border-t border-sand-light hover:bg-parchment"><td className="px-4 py-3 font-mono text-xs text-muted">{v.id}</td><td className="px-4 py-3 text-xs text-bark">{v.vendor_name} / {v.family_name}</td><td className="px-4 py-3 font-medium text-bark-dark">{v.name}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete("variants", v.id)} className="text-xs text-danger hover:underline">删除</button></td></tr>
            ))}</tbody>
          </table>
        );
      case "channels":
        return (
          <table className="w-full text-sm">
            <thead className="bg-cream-dark"><tr><th className="text-left px-4 py-3 font-medium text-bark">ID</th><th className="text-left px-4 py-3 font-medium text-bark">名称</th><th className="text-left px-4 py-3 font-medium text-bark">描述</th><th className="text-right px-4 py-3 font-medium text-bark">操作</th></tr></thead>
            <tbody>{channels.map(c => (
              <tr key={c.id} className="border-t border-sand-light hover:bg-parchment"><td className="px-4 py-3 font-mono text-xs text-muted">{c.id}</td><td className="px-4 py-3 font-medium text-bark-dark">{c.name}</td><td className="px-4 py-3 text-muted text-xs">{c.description || "—"}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete("channels", c.id)} className="text-xs text-danger hover:underline">删除</button></td></tr>
            ))}</tbody>
          </table>
        );
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-bark-dark">模型管理</h1>
        <button onClick={() => { setShowForm(true); setForm({}); }} className="btn-primary">
          新建{tabs.find(t => t.key === tab)?.label}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === t.key ? "bg-leaf text-white" : "bg-cream-dark text-muted hover:bg-sand-light"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {showForm && renderForm()}

      <div className="card overflow-hidden">
        {renderTable()}
      </div>
    </div>
  );
}
