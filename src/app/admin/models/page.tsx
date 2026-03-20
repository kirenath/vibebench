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

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Models</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.key ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "vendors" && (
        <div>
          <div className="bg-white border rounded-xl p-4 mb-4 flex gap-3 items-end">
            <div><label className="block text-xs text-gray-500 mb-1">ID</label>
              <input className="border rounded px-2 py-1 text-sm" value={vendorForm.id} onChange={e => setVendorForm({ ...vendorForm, id: e.target.value })} /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Name</label>
              <input className="border rounded px-2 py-1 text-sm" value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} /></div>
            <button onClick={() => { createItem("/api/vendors", vendorForm); setVendorForm({ id: "", name: "", description: "" }); }}
              className="bg-brand-500 text-white px-4 py-1.5 rounded text-sm">Add</button>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-gray-500">ID</th><th className="px-4 py-2 text-left text-gray-500">Name</th><th className="px-4 py-2">Actions</th></tr></thead>
              <tbody className="divide-y">{vendors.map(v => (
                <tr key={v.id}><td className="px-4 py-2 font-mono">{v.id}</td><td className="px-4 py-2">{v.name}</td>
                  <td className="px-4 py-2 text-center"><button onClick={() => deleteItem(`/api/vendors/${v.id}`)} className="text-xs text-red-500">Delete</button></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "families" && (
        <div>
          <div className="bg-white border rounded-xl p-4 mb-4 flex gap-3 items-end flex-wrap">
            <div><label className="block text-xs text-gray-500 mb-1">ID</label>
              <input className="border rounded px-2 py-1 text-sm" value={familyForm.id} onChange={e => setFamilyForm({ ...familyForm, id: e.target.value })} /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Vendor</label>
              <select className="border rounded px-2 py-1 text-sm" value={familyForm.vendor_id} onChange={e => setFamilyForm({ ...familyForm, vendor_id: e.target.value })}>
                <option value="">Select...</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
            <div><label className="block text-xs text-gray-500 mb-1">Name</label>
              <input className="border rounded px-2 py-1 text-sm" value={familyForm.name} onChange={e => setFamilyForm({ ...familyForm, name: e.target.value })} /></div>
            <button onClick={() => { createItem("/api/model-families", familyForm); setFamilyForm({ id: "", vendor_id: "", name: "", description: "" }); }}
              className="bg-brand-500 text-white px-4 py-1.5 rounded text-sm">Add</button>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-gray-500">ID</th><th className="px-4 py-2 text-left text-gray-500">Vendor</th><th className="px-4 py-2 text-left text-gray-500">Name</th><th className="px-4 py-2">Actions</th></tr></thead>
              <tbody className="divide-y">{families.map(f => (
                <tr key={f.id}><td className="px-4 py-2 font-mono">{f.id}</td><td className="px-4 py-2">{f.vendor_name}</td><td className="px-4 py-2">{f.name}</td>
                  <td className="px-4 py-2 text-center"><button onClick={() => deleteItem(`/api/model-families/${f.id}`)} className="text-xs text-red-500">Delete</button></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "variants" && (
        <div>
          <div className="bg-white border rounded-xl p-4 mb-4 flex gap-3 items-end flex-wrap">
            <div><label className="block text-xs text-gray-500 mb-1">ID</label>
              <input className="border rounded px-2 py-1 text-sm" value={variantForm.id} onChange={e => setVariantForm({ ...variantForm, id: e.target.value })} /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Family</label>
              <select className="border rounded px-2 py-1 text-sm" value={variantForm.family_id} onChange={e => setVariantForm({ ...variantForm, family_id: e.target.value })}>
                <option value="">Select...</option>{families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
            <div><label className="block text-xs text-gray-500 mb-1">Name</label>
              <input className="border rounded px-2 py-1 text-sm" value={variantForm.name} onChange={e => setVariantForm({ ...variantForm, name: e.target.value })} /></div>
            <button onClick={() => { createItem("/api/model-variants", variantForm); setVariantForm({ id: "", family_id: "", name: "", description: "" }); }}
              className="bg-brand-500 text-white px-4 py-1.5 rounded text-sm">Add</button>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-gray-500">ID</th><th className="px-4 py-2 text-left text-gray-500">Family</th><th className="px-4 py-2 text-left text-gray-500">Name</th><th className="px-4 py-2">Actions</th></tr></thead>
              <tbody className="divide-y">{variants.map(v => (
                <tr key={v.id}><td className="px-4 py-2 font-mono">{v.id}</td><td className="px-4 py-2">{v.family_name}</td><td className="px-4 py-2">{v.name}</td>
                  <td className="px-4 py-2 text-center"><button onClick={() => deleteItem(`/api/model-variants/${v.id}`)} className="text-xs text-red-500">Delete</button></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "channels" && (
        <div>
          <div className="bg-white border rounded-xl p-4 mb-4 flex gap-3 items-end">
            <div><label className="block text-xs text-gray-500 mb-1">ID</label>
              <input className="border rounded px-2 py-1 text-sm" value={channelForm.id} onChange={e => setChannelForm({ ...channelForm, id: e.target.value })} /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Name</label>
              <input className="border rounded px-2 py-1 text-sm" value={channelForm.name} onChange={e => setChannelForm({ ...channelForm, name: e.target.value })} /></div>
            <button onClick={() => { createItem("/api/channels", channelForm); setChannelForm({ id: "", name: "", description: "" }); }}
              className="bg-brand-500 text-white px-4 py-1.5 rounded text-sm">Add</button>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-gray-500">ID</th><th className="px-4 py-2 text-left text-gray-500">Name</th><th className="px-4 py-2">Actions</th></tr></thead>
              <tbody className="divide-y">{channels.map(c => (
                <tr key={c.id}><td className="px-4 py-2 font-mono">{c.id}</td><td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2 text-center"><button onClick={() => deleteItem(`/api/channels/${c.id}`)} className="text-xs text-red-500">Delete</button></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
