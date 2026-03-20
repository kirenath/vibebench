"use client";

import { useEffect, useState } from "react";

export default function AdminModelsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [tab, setTab] = useState<"vendors" | "families" | "variants" | "channels">("vendors");

  const [vendorForm, setVendorForm] = useState({ id: "", name: "", description: "" });
  const [familyForm, setFamilyForm] = useState({ id: "", vendor_id: "", name: "", description: "" });
  const [variantForm, setVariantForm] = useState({ id: "", family_id: "", name: "", description: "" });
  const [channelForm, setChannelForm] = useState({ id: "", name: "", description: "" });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [v, f, mv, c] = await Promise.all([
      fetch("/api/vendors").then(r => r.json()),
      fetch("/api/model-families").then(r => r.json()),
      fetch("/api/model-variants").then(r => r.json()),
      fetch("/api/channels").then(r => r.json()),
    ]);
    setVendors(v.data || []);
    setFamilies(f.data || []);
    setVariants(mv.data || []);
    setChannels(c.data || []);
  }

  async function createItem(endpoint: string, body: any) {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    loadAll();
  }

  async function deleteItem(endpoint: string) {
    if (!confirm("Delete?")) return;
    await fetch(endpoint, { method: "DELETE" });
    loadAll();
  }

  const tabs = [
    { key: "vendors" as const, label: "Vendors" },
    { key: "families" as const, label: "Families" },
    { key: "variants" as const, label: "Variants" },
    { key: "channels" as const, label: "Channels" },
  ];

  const inputClass = "border border-organic-border rounded-full h-9 px-3 text-sm bg-white/50 focus-visible:ring-2 focus-visible:ring-organic-primary/30 ring-offset-1 outline-none transition-all duration-300";
  const selectClass = "border border-organic-border rounded-full h-9 px-3 text-sm bg-white/50 focus-visible:ring-2 focus-visible:ring-organic-primary/30 ring-offset-1 outline-none transition-all duration-300";
  const addBtnClass = "bg-organic-primary text-organic-primary-fg px-5 py-2 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-soft";

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-organic-fg mb-6">Models</h1>

      <div className="flex gap-2 mb-8">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${tab === t.key ? "bg-organic-primary text-organic-primary-fg shadow-soft" : "bg-organic-muted text-organic-muted-fg hover:bg-organic-primary/10 hover:text-organic-primary"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "vendors" && (
        <div>
          <div className="bg-organic-card border border-organic-border/50 rounded-organic p-5 mb-5 flex gap-3 items-end shadow-soft">
            <div><label className="block text-xs text-organic-muted-fg mb-1 font-semibold">ID</label>
              <input className={inputClass} value={vendorForm.id} onChange={e => setVendorForm({ ...vendorForm, id: e.target.value })} /></div>
            <div><label className="block text-xs text-organic-muted-fg mb-1 font-semibold">Name</label>
              <input className={inputClass} value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} /></div>
            <button onClick={() => { createItem("/api/vendors", vendorForm); setVendorForm({ id: "", name: "", description: "" }); }}
              className={addBtnClass}>Add</button>
          </div>
          <div className="bg-organic-card rounded-organic border border-organic-border/50 overflow-hidden shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-organic-muted/50"><tr><th className="px-5 py-3 text-left text-organic-muted-fg font-semibold">ID</th><th className="px-5 py-3 text-left text-organic-muted-fg font-semibold">Name</th><th className="px-5 py-3 font-semibold text-organic-muted-fg">Actions</th></tr></thead>
              <tbody className="divide-y divide-organic-border/30">{vendors.map(v => (
                <tr key={v.id} className="hover:bg-organic-muted/20 transition-colors duration-200"><td className="px-5 py-3 font-mono text-organic-muted-fg">{v.id}</td><td className="px-5 py-3 text-organic-fg font-medium">{v.name}</td>
                  <td className="px-5 py-3 text-center"><button onClick={() => deleteItem(`/api/vendors/${v.id}`)} className="text-xs text-organic-destructive font-bold hover:text-organic-destructive/80 transition-colors duration-300">Delete</button></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "families" && (
        <div>
          <div className="bg-organic-card border border-organic-border/50 rounded-organic p-5 mb-5 flex gap-3 items-end flex-wrap shadow-soft">
            <div><label className="block text-xs text-organic-muted-fg mb-1 font-semibold">ID</label>
              <input className={inputClass} value={familyForm.id} onChange={e => setFamilyForm({ ...familyForm, id: e.target.value })} /></div>
            <div><label className="block text-xs text-organic-muted-fg mb-1 font-semibold">Vendor</label>
              <select className={selectClass} value={familyForm.vendor_id} onChange={e => setFamilyForm({ ...familyForm, vendor_id: e.target.value })}>
                <option value="">Select...</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
            <div><label className="block text-xs text-organic-muted-fg mb-1 font-semibold">Name</label>
              <input className={inputClass} value={familyForm.name} onChange={e => setFamilyForm({ ...familyForm, name: e.target.value })} /></div>
            <button onClick={() => { createItem("/api/model-families", familyForm); setFamilyForm({ id: "", vendor_id: "", name: "", description: "" }); }}
              className={addBtnClass}>Add</button>
          </div>
          <div className="bg-organic-card rounded-organic border border-organic-border/50 overflow-hidden shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-organic-muted/50"><tr><th className="px-5 py-3 text-left text-organic-muted-fg font-semibold">ID</th><th className="px-5 py-3 text-left text-organic-muted-fg font-semibold">Vendor</th><th className="px-5 py-3 text-left text-organic-muted-fg font-semibold">Name</th><th className="px-5 py-3 font-semibold text-organic-muted-fg">Actions</th></tr></thead>
              <tbody className="divide-y divide-organic-border/30">{families.map(f => (
                <tr key={f.id} className="hover:bg-organic-muted/20 transition-colors duration-200"><td className="px-5 py-3 font-mono text-organic-muted-fg">{f.id}</td><td className="px-5 py-3 text-organic-fg">{f.vendor_name}</td><td className="px-5 py-3 text-organic-fg font-medium">{f.name}</td>
                  <td className="px-5 py-3 text-center"><button onClick={() => deleteItem(`/api/model-families/${f.id}`)} className="text-xs text-organic-destructive font-bold hover:text-organic-destructive/80 transition-colors duration-300">Delete</button></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "variants" && (
        <div>
          <div className="bg-organic-card border border-organic-border/50 rounded-organic p-5 mb-5 flex gap-3 items-end flex-wrap shadow-soft">
            <div><label className="block text-xs text-organic-muted-fg mb-1 font-semibold">ID</label>
              <input className={inputClass} value={variantForm.id} onChange={e => setVariantForm({ ...variantForm, id: e.target.value })} /></div>
            <div><label className="block text-xs text-organic-muted-fg mb-1 font-semibold">Family</label>
              <select className={selectClass} value={variantForm.family_id} onChange={e => setVariantForm({ ...variantForm, family_id: e.target.value })}>
                <option value="">Select...</option>{families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
            <div><label className="block text-xs text-organic-muted-fg mb-1 font-semibold">Name</label>
              <input className={inputClass} value={variantForm.name} onChange={e => setVariantForm({ ...variantForm, name: e.target.value })} /></div>
            <button onClick={() => { createItem("/api/model-variants", variantForm); setVariantForm({ id: "", family_id: "", name: "", description: "" }); }}
              className={addBtnClass}>Add</button>
          </div>
          <div className="bg-organic-card rounded-organic border border-organic-border/50 overflow-hidden shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-organic-muted/50"><tr><th className="px-5 py-3 text-left text-organic-muted-fg font-semibold">ID</th><th className="px-5 py-3 text-left text-organic-muted-fg font-semibold">Family</th><th className="px-5 py-3 text-left text-organic-muted-fg font-semibold">Name</th><th className="px-5 py-3 font-semibold text-organic-muted-fg">Actions</th></tr></thead>
              <tbody className="divide-y divide-organic-border/30">{variants.map(v => (
                <tr key={v.id} className="hover:bg-organic-muted/20 transition-colors duration-200"><td className="px-5 py-3 font-mono text-organic-muted-fg">{v.id}</td><td className="px-5 py-3 text-organic-fg">{v.family_name}</td><td className="px-5 py-3 text-organic-fg font-medium">{v.name}</td>
                  <td className="px-5 py-3 text-center"><button onClick={() => deleteItem(`/api/model-variants/${v.id}`)} className="text-xs text-organic-destructive font-bold hover:text-organic-destructive/80 transition-colors duration-300">Delete</button></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "channels" && (
        <div>
          <div className="bg-organic-card border border-organic-border/50 rounded-organic p-5 mb-5 flex gap-3 items-end shadow-soft">
            <div><label className="block text-xs text-organic-muted-fg mb-1 font-semibold">ID</label>
              <input className={inputClass} value={channelForm.id} onChange={e => setChannelForm({ ...channelForm, id: e.target.value })} /></div>
            <div><label className="block text-xs text-organic-muted-fg mb-1 font-semibold">Name</label>
              <input className={inputClass} value={channelForm.name} onChange={e => setChannelForm({ ...channelForm, name: e.target.value })} /></div>
            <button onClick={() => { createItem("/api/channels", channelForm); setChannelForm({ id: "", name: "", description: "" }); }}
              className={addBtnClass}>Add</button>
          </div>
          <div className="bg-organic-card rounded-organic border border-organic-border/50 overflow-hidden shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-organic-muted/50"><tr><th className="px-5 py-3 text-left text-organic-muted-fg font-semibold">ID</th><th className="px-5 py-3 text-left text-organic-muted-fg font-semibold">Name</th><th className="px-5 py-3 font-semibold text-organic-muted-fg">Actions</th></tr></thead>
              <tbody className="divide-y divide-organic-border/30">{channels.map(c => (
                <tr key={c.id} className="hover:bg-organic-muted/20 transition-colors duration-200"><td className="px-5 py-3 font-mono text-organic-muted-fg">{c.id}</td><td className="px-5 py-3 text-organic-fg font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-center"><button onClick={() => deleteItem(`/api/channels/${c.id}`)} className="text-xs text-organic-destructive font-bold hover:text-organic-destructive/80 transition-colors duration-300">Delete</button></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
