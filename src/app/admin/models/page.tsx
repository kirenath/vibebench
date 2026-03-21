"use client";

import { useState, useEffect } from "react";
import AdminNav from "@/components/AdminNav";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Vendor { id: string; name: string; description: string | null; sort_order: number; }
interface Family { id: string; vendor_id: string; name: string; description: string | null; sort_order: number; vendor_name?: string; }
interface Variant { id: string; family_id: string; name: string; description: string | null; sort_order: number; family_name?: string; vendor_name?: string; }
interface Channel { id: string; name: string; description: string | null; sort_order: number; }

export default function AdminModelsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [tab, setTab] = useState<"vendors" | "families" | "variants" | "channels">("vendors");

  const [vendorForm, setVendorForm] = useState({ id: "", name: "", description: "", sort_order: 0 });
  const [familyForm, setFamilyForm] = useState({ id: "", vendor_id: "", name: "", description: "", sort_order: 0 });
  const [variantForm, setVariantForm] = useState({ id: "", family_id: "", name: "", description: "", sort_order: 0 });
  const [channelForm, setChannelForm] = useState({ id: "", name: "", description: "", sort_order: 0 });
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    fetch("/api/vendors").then(r => r.json()).then(d => setVendors(d.data || [])).catch(() => {});
    fetch("/api/model-families").then(r => r.json()).then(d => setFamilies(d.data || [])).catch(() => {});
    fetch("/api/model-variants").then(r => r.json()).then(d => setVariants(d.data || [])).catch(() => {});
    fetch("/api/channels").then(r => r.json()).then(d => setChannels(d.data || [])).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const saveVendor = async () => {
    await fetch("/api/vendors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vendorForm) });
    setVendorForm({ id: "", name: "", description: "", sort_order: 0 }); setShowForm(false); load();
  };
  const saveFamily = async () => {
    await fetch("/api/model-families", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(familyForm) });
    setFamilyForm({ id: "", vendor_id: "", name: "", description: "", sort_order: 0 }); setShowForm(false); load();
  };
  const saveVariant = async () => {
    await fetch("/api/model-variants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(variantForm) });
    setVariantForm({ id: "", family_id: "", name: "", description: "", sort_order: 0 }); setShowForm(false); load();
  };
  const saveChannel = async () => {
    await fetch("/api/channels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(channelForm) });
    setChannelForm({ id: "", name: "", description: "", sort_order: 0 }); setShowForm(false); load();
  };

  const deleteItem = async (type: string, id: string) => {
    if (!confirm("确认删除？")) return;
    await fetch(`/api/${type}/${id}`, { method: "DELETE" });
    load();
  };

  const tabs = [
    { key: "vendors" as const, label: "厂商" },
    { key: "families" as const, label: "产品线" },
    { key: "variants" as const, label: "模型版本" },
    { key: "channels" as const, label: "渠道" },
  ];

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-bold">模型管理</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm">
            <Plus className="h-4 w-4 mr-1" />新建
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setShowForm(false); }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {showForm && tab === "vendors" && (
          <div className="card p-6 mb-6">
            <h2 className="font-heading font-bold mb-4">新建厂商</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="label mb-1 block">ID</label><input className="input" value={vendorForm.id} onChange={e => setVendorForm({...vendorForm, id: e.target.value})} placeholder="openai" /></div>
              <div><label className="label mb-1 block">名称</label><input className="input" value={vendorForm.name} onChange={e => setVendorForm({...vendorForm, name: e.target.value})} placeholder="OpenAI" /></div>
              <div><label className="label mb-1 block">描述</label><input className="input" value={vendorForm.description} onChange={e => setVendorForm({...vendorForm, description: e.target.value})} /></div>
              <div><label className="label mb-1 block">排序</label><input className="input" type="number" value={vendorForm.sort_order} onChange={e => setVendorForm({...vendorForm, sort_order: parseInt(e.target.value)||0})} /></div>
            </div>
            <div className="flex gap-2 mt-4"><button onClick={saveVendor} className="btn-primary btn-sm">保存</button><button onClick={() => setShowForm(false)} className="btn-ghost btn-sm">取消</button></div>
          </div>
        )}

        {showForm && tab === "families" && (
          <div className="card p-6 mb-6">
            <h2 className="font-heading font-bold mb-4">新建产品线</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="label mb-1 block">ID</label><input className="input" value={familyForm.id} onChange={e => setFamilyForm({...familyForm, id: e.target.value})} placeholder="chatgpt" /></div>
              <div><label className="label mb-1 block">所属厂商</label>
                <select className="select" value={familyForm.vendor_id} onChange={e => setFamilyForm({...familyForm, vendor_id: e.target.value})}>
                  <option value="">选择厂商...</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div><label className="label mb-1 block">名称</label><input className="input" value={familyForm.name} onChange={e => setFamilyForm({...familyForm, name: e.target.value})} placeholder="ChatGPT" /></div>
              <div><label className="label mb-1 block">排序</label><input className="input" type="number" value={familyForm.sort_order} onChange={e => setFamilyForm({...familyForm, sort_order: parseInt(e.target.value)||0})} /></div>
            </div>
            <div className="flex gap-2 mt-4"><button onClick={saveFamily} className="btn-primary btn-sm">保存</button><button onClick={() => setShowForm(false)} className="btn-ghost btn-sm">取消</button></div>
          </div>
        )}

        {showForm && tab === "variants" && (
          <div className="card p-6 mb-6">
            <h2 className="font-heading font-bold mb-4">新建模型版本</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="label mb-1 block">ID</label><input className="input" value={variantForm.id} onChange={e => setVariantForm({...variantForm, id: e.target.value})} placeholder="gpt-5.4-pro" /></div>
              <div><label className="label mb-1 block">所属产品线</label>
                <select className="select" value={variantForm.family_id} onChange={e => setVariantForm({...variantForm, family_id: e.target.value})}>
                  <option value="">选择产品线...</option>
                  {families.map(f => <option key={f.id} value={f.id}>{f.vendor_name} / {f.name}</option>)}
                </select>
              </div>
              <div><label className="label mb-1 block">名称</label><input className="input" value={variantForm.name} onChange={e => setVariantForm({...variantForm, name: e.target.value})} placeholder="GPT-5.4 Pro" /></div>
              <div><label className="label mb-1 block">排序</label><input className="input" type="number" value={variantForm.sort_order} onChange={e => setVariantForm({...variantForm, sort_order: parseInt(e.target.value)||0})} /></div>
            </div>
            <div className="flex gap-2 mt-4"><button onClick={saveVariant} className="btn-primary btn-sm">保存</button><button onClick={() => setShowForm(false)} className="btn-ghost btn-sm">取消</button></div>
          </div>
        )}

        {showForm && tab === "channels" && (
          <div className="card p-6 mb-6">
            <h2 className="font-heading font-bold mb-4">新建渠道</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="label mb-1 block">ID</label><input className="input" value={channelForm.id} onChange={e => setChannelForm({...channelForm, id: e.target.value})} placeholder="web" /></div>
              <div><label className="label mb-1 block">名称</label><input className="input" value={channelForm.name} onChange={e => setChannelForm({...channelForm, name: e.target.value})} placeholder="Web" /></div>
              <div><label className="label mb-1 block">描述</label><input className="input" value={channelForm.description} onChange={e => setChannelForm({...channelForm, description: e.target.value})} /></div>
              <div><label className="label mb-1 block">排序</label><input className="input" type="number" value={channelForm.sort_order} onChange={e => setChannelForm({...channelForm, sort_order: parseInt(e.target.value)||0})} /></div>
            </div>
            <div className="flex gap-2 mt-4"><button onClick={saveChannel} className="btn-primary btn-sm">保存</button><button onClick={() => setShowForm(false)} className="btn-ghost btn-sm">取消</button></div>
          </div>
        )}

        {tab === "vendors" && (
          <div className="space-y-3">
            {vendors.map(v => (
              <div key={v.id} className="card p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold">{v.name}</h3>
                  <p className="text-xs text-muted-foreground">{v.id}{v.description ? ` · ${v.description}` : ""}</p>
                </div>
                <button onClick={() => deleteItem("vendors", v.id)} className="btn-ghost btn-sm !h-8 !px-3 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {vendors.length === 0 && <div className="card p-8 text-center text-muted-foreground">暂无厂商</div>}
          </div>
        )}

        {tab === "families" && (
          <div className="space-y-3">
            {families.map(f => (
              <div key={f.id} className="card p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold">{f.name}</h3>
                  <p className="text-xs text-muted-foreground">{f.id} · {f.vendor_name || f.vendor_id}</p>
                </div>
                <button onClick={() => deleteItem("model-families", f.id)} className="btn-ghost btn-sm !h-8 !px-3 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {families.length === 0 && <div className="card p-8 text-center text-muted-foreground">暂无产品线</div>}
          </div>
        )}

        {tab === "variants" && (
          <div className="space-y-3">
            {variants.map(v => (
              <div key={v.id} className="card p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold">{v.name}</h3>
                  <p className="text-xs text-muted-foreground">{v.id} · {v.vendor_name} / {v.family_name}</p>
                </div>
                <button onClick={() => deleteItem("model-variants", v.id)} className="btn-ghost btn-sm !h-8 !px-3 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {variants.length === 0 && <div className="card p-8 text-center text-muted-foreground">暂无模型版本</div>}
          </div>
        )}

        {tab === "channels" && (
          <div className="space-y-3">
            {channels.map(c => (
              <div key={c.id} className="card p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.id}{c.description ? ` · ${c.description}` : ""}</p>
                </div>
                <button onClick={() => deleteItem("channels", c.id)} className="btn-ghost btn-sm !h-8 !px-3 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {channels.length === 0 && <div className="card p-8 text-center text-muted-foreground">暂无渠道</div>}
          </div>
        )}
      </div>
    </div>
  );
}
