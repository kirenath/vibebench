"use client";

import { useState, useEffect, useCallback } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Drawer from "@/components/Drawer";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { Pencil, Trash2, Package } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

interface Vendor { id: string; name: string; description: string | null; sort_order: number; }
interface Family { id: string; vendor_id: string; name: string; description: string | null; sort_order: number; vendor_name?: string; }
interface Variant { id: string; family_id: string; name: string; description: string | null; sort_order: number; family_name?: string; vendor_name?: string; }
interface Channel { id: string; name: string; description: string | null; sort_order: number; }

type TabKey = "vendors" | "families" | "variants" | "channels";

export default function AdminModelsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [tab, setTab] = useState<TabKey>("vendors");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<{ type: string; id: string } | null>(null);
  const { toast } = useToast();

  const [vendorForm, setVendorForm] = useState({ id: "", name: "", description: "", sort_order: 0 });
  const [familyForm, setFamilyForm] = useState({ id: "", vendor_id: "", name: "", description: "", sort_order: 0 });
  const [variantForm, setVariantForm] = useState({ id: "", family_id: "", name: "", description: "", sort_order: 0 });
  const [channelForm, setChannelForm] = useState({ id: "", name: "", description: "", sort_order: 0 });

  const load = useCallback(() => {
    fetch("/api/vendors").then(r => r.json()).then(d => setVendors(d.data || [])).catch(() => {});
    fetch("/api/model-families").then(r => r.json()).then(d => setFamilies(d.data || [])).catch(() => {});
    fetch("/api/model-variants").then(r => r.json()).then(d => setVariants(d.data || [])).catch(() => {});
    fetch("/api/channels").then(r => r.json()).then(d => setChannels(d.data || [])).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditMode(false);
    setVendorForm({ id: "", name: "", description: "", sort_order: 0 });
    setFamilyForm({ id: "", vendor_id: "", name: "", description: "", sort_order: 0 });
    setVariantForm({ id: "", family_id: "", name: "", description: "", sort_order: 0 });
    setChannelForm({ id: "", name: "", description: "", sort_order: 0 });
  };

  const openNew = () => {
    closeDrawer();
    setDrawerOpen(true);
  };

  // Save handlers
  const saveVendor = async () => {
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `/api/vendors/${vendorForm.id}` : "/api/vendors";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(vendorForm) });
    if (res.ok) toast(editMode ? "厂商已更新" : "厂商已创建", "success");
    else toast("操作失败", "error");
    closeDrawer(); load();
  };
  const saveFamily = async () => {
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `/api/model-families/${familyForm.id}` : "/api/model-families";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(familyForm) });
    if (res.ok) toast(editMode ? "产品线已更新" : "产品线已创建", "success");
    else toast("操作失败", "error");
    closeDrawer(); load();
  };
  const saveVariant = async () => {
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `/api/model-variants/${variantForm.id}` : "/api/model-variants";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(variantForm) });
    if (res.ok) toast(editMode ? "模型版本已更新" : "模型版本已创建", "success");
    else toast("操作失败", "error");
    closeDrawer(); load();
  };
  const saveChannel = async () => {
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `/api/channels/${channelForm.id}` : "/api/channels";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(channelForm) });
    if (res.ok) toast(editMode ? "渠道已更新" : "渠道已创建", "success");
    else toast("操作失败", "error");
    closeDrawer(); load();
  };

  // Edit handlers
  const editVendor = (v: Vendor) => {
    setVendorForm({ id: v.id, name: v.name, description: v.description || "", sort_order: v.sort_order });
    setEditMode(true); setDrawerOpen(true);
  };
  const editFamily = (f: Family) => {
    setFamilyForm({ id: f.id, vendor_id: f.vendor_id, name: f.name, description: f.description || "", sort_order: f.sort_order });
    setEditMode(true); setDrawerOpen(true);
  };
  const editVariant = (v: Variant) => {
    setVariantForm({ id: v.id, family_id: v.family_id, name: v.name, description: v.description || "", sort_order: v.sort_order });
    setEditMode(true); setDrawerOpen(true);
  };
  const editChannel = (c: Channel) => {
    setChannelForm({ id: c.id, name: c.name, description: c.description || "", sort_order: c.sort_order });
    setEditMode(true); setDrawerOpen(true);
  };

  const requestDelete = (type: string, id: string) => {
    setDeleteInfo({ type, id });
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteInfo) return;
    const res = await fetch(`/api/${deleteInfo.type}/${deleteInfo.id}`, { method: "DELETE" });
    if (res.ok) toast("已删除", "success");
    else toast("删除失败", "error");
    setConfirmOpen(false);
    setDeleteInfo(null);
    load();
  };

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "vendors", label: "厂商", count: vendors.length },
    { key: "families", label: "产品线", count: families.length },
    { key: "variants", label: "模型版本", count: variants.length },
    { key: "channels", label: "渠道", count: channels.length },
  ];

  const getDrawerTitle = () => {
    const action = editMode ? "编辑" : "新建";
    const labels: Record<TabKey, string> = { vendors: "厂商", families: "产品线", variants: "模型版本", channels: "渠道" };
    return `${action}${labels[tab]}`;
  };

  return (
    <>
      <AdminPageHeader title="模型管理" onAdd={openNew} addLabel="新建" />

      {/* Tabs with count badges */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); closeDrawer(); }}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
            }`}>
            {t.label}
            <span className={`inline-flex items-center justify-center h-5 min-w-[20px] rounded-full text-xs font-bold ${
              tab === t.key ? "bg-white/20 text-white" : "bg-border/50 text-muted-foreground"
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Vendor list */}
      {tab === "vendors" && (
        <div className="space-y-3">
          {vendors.map(v => (
            <div key={v.id} className="card p-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold">{v.name}</h3>
                <p className="text-xs text-muted-foreground">{v.id}{v.description ? ` · ${v.description}` : ""}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => editVendor(v)} className="btn-ghost btn-sm !h-8 !px-3"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => requestDelete("vendors", v.id)} className="btn-ghost btn-sm !h-8 !px-3 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {vendors.length === 0 && (
            <div className="card p-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">暂无厂商</p>
            </div>
          )}
        </div>
      )}

      {/* Family list */}
      {tab === "families" && (
        <div className="space-y-3">
          {families.map(f => (
            <div key={f.id} className="card p-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold">{f.name}</h3>
                <p className="text-xs text-muted-foreground">{f.id} · {f.vendor_name || f.vendor_id}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => editFamily(f)} className="btn-ghost btn-sm !h-8 !px-3"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => requestDelete("model-families", f.id)} className="btn-ghost btn-sm !h-8 !px-3 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {families.length === 0 && (
            <div className="card p-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">暂无产品线</p>
            </div>
          )}
        </div>
      )}

      {/* Variant list */}
      {tab === "variants" && (
        <div className="space-y-3">
          {variants.map(v => (
            <div key={v.id} className="card p-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold">{v.name}</h3>
                <p className="text-xs text-muted-foreground">{v.id} · {v.vendor_name} / {v.family_name}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => editVariant(v)} className="btn-ghost btn-sm !h-8 !px-3"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => requestDelete("model-variants", v.id)} className="btn-ghost btn-sm !h-8 !px-3 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {variants.length === 0 && (
            <div className="card p-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">暂无模型版本</p>
            </div>
          )}
        </div>
      )}

      {/* Channel list */}
      {tab === "channels" && (
        <div className="space-y-3">
          {channels.map(c => (
            <div key={c.id} className="card p-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.id}{c.description ? ` · ${c.description}` : ""}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => editChannel(c)} className="btn-ghost btn-sm !h-8 !px-3"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => requestDelete("channels", c.id)} className="btn-ghost btn-sm !h-8 !px-3 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {channels.length === 0 && (
            <div className="card p-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">暂无渠道</p>
            </div>
          )}
        </div>
      )}

      {/* Drawer for create/edit */}
      <Drawer open={drawerOpen} onClose={closeDrawer} title={getDrawerTitle()}>
        {tab === "vendors" && (
          <div className="space-y-4">
            <div><label className="label mb-1 block">ID</label><input className="input" value={vendorForm.id} disabled={editMode} onChange={e => setVendorForm({...vendorForm, id: e.target.value})} placeholder="openai" /></div>
            <div><label className="label mb-1 block">名称</label><input className="input" value={vendorForm.name} onChange={e => setVendorForm({...vendorForm, name: e.target.value})} placeholder="OpenAI" /></div>
            <div><label className="label mb-1 block">描述</label><input className="input" value={vendorForm.description} onChange={e => setVendorForm({...vendorForm, description: e.target.value})} /></div>
            <div><label className="label mb-1 block">排序</label><input className="input" type="number" value={vendorForm.sort_order} onChange={e => setVendorForm({...vendorForm, sort_order: parseInt(e.target.value)||0})} /></div>
            <div className="flex gap-2 pt-4 border-t border-border/50"><button onClick={saveVendor} className="btn-primary btn-sm">保存</button><button onClick={closeDrawer} className="btn-ghost btn-sm">取消</button></div>
          </div>
        )}
        {tab === "families" && (
          <div className="space-y-4">
            <div><label className="label mb-1 block">ID</label><input className="input" value={familyForm.id} disabled={editMode} onChange={e => setFamilyForm({...familyForm, id: e.target.value})} placeholder="chatgpt" /></div>
            <div><label className="label mb-1 block">所属厂商</label>
              <CustomSelect
                options={vendors.map(v => ({ value: v.id, label: v.name }))}
                value={familyForm.vendor_id}
                onChange={v => setFamilyForm({...familyForm, vendor_id: v})}
                placeholder="选择厂商..."
              />
            </div>
            <div><label className="label mb-1 block">名称</label><input className="input" value={familyForm.name} onChange={e => setFamilyForm({...familyForm, name: e.target.value})} placeholder="ChatGPT" /></div>
            <div><label className="label mb-1 block">排序</label><input className="input" type="number" value={familyForm.sort_order} onChange={e => setFamilyForm({...familyForm, sort_order: parseInt(e.target.value)||0})} /></div>
            <div className="flex gap-2 pt-4 border-t border-border/50"><button onClick={saveFamily} className="btn-primary btn-sm">保存</button><button onClick={closeDrawer} className="btn-ghost btn-sm">取消</button></div>
          </div>
        )}
        {tab === "variants" && (
          <div className="space-y-4">
            <div><label className="label mb-1 block">ID</label><input className="input" value={variantForm.id} disabled={editMode} onChange={e => setVariantForm({...variantForm, id: e.target.value})} placeholder="gpt-5.4-pro" /></div>
            <div><label className="label mb-1 block">所属产品线</label>
              <CustomSelect
                options={families.map(f => ({ value: f.id, label: `${f.vendor_name} / ${f.name}` }))}
                value={variantForm.family_id}
                onChange={v => setVariantForm({...variantForm, family_id: v})}
                placeholder="选择产品线..."
              />
            </div>
            <div><label className="label mb-1 block">名称</label><input className="input" value={variantForm.name} onChange={e => setVariantForm({...variantForm, name: e.target.value})} placeholder="GPT-5.4 Pro" /></div>
            <div><label className="label mb-1 block">排序</label><input className="input" type="number" value={variantForm.sort_order} onChange={e => setVariantForm({...variantForm, sort_order: parseInt(e.target.value)||0})} /></div>
            <div className="flex gap-2 pt-4 border-t border-border/50"><button onClick={saveVariant} className="btn-primary btn-sm">保存</button><button onClick={closeDrawer} className="btn-ghost btn-sm">取消</button></div>
          </div>
        )}
        {tab === "channels" && (
          <div className="space-y-4">
            <div><label className="label mb-1 block">ID</label><input className="input" value={channelForm.id} disabled={editMode} onChange={e => setChannelForm({...channelForm, id: e.target.value})} placeholder="web" /></div>
            <div><label className="label mb-1 block">名称</label><input className="input" value={channelForm.name} onChange={e => setChannelForm({...channelForm, name: e.target.value})} placeholder="Web" /></div>
            <div><label className="label mb-1 block">描述</label><input className="input" value={channelForm.description} onChange={e => setChannelForm({...channelForm, description: e.target.value})} /></div>
            <div><label className="label mb-1 block">排序</label><input className="input" type="number" value={channelForm.sort_order} onChange={e => setChannelForm({...channelForm, sort_order: parseInt(e.target.value)||0})} /></div>
            <div className="flex gap-2 pt-4 border-t border-border/50"><button onClick={saveChannel} className="btn-primary btn-sm">保存</button><button onClick={closeDrawer} className="btn-ghost btn-sm">取消</button></div>
          </div>
        )}
      </Drawer>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteInfo(null); }}
        title="确认删除"
        description="删除后无法恢复，确定要继续吗？"
        confirmLabel="删除"
        variant="danger"
      />
    </>
  );
}
