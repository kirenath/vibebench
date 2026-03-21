'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Building2, Layers, Cpu, Radio } from 'lucide-react';
import type { Vendor, ModelFamily, ModelVariant, Channel } from '@/types/database';

type TabType = 'vendors' | 'families' | 'variants' | 'channels';

export default function AdminModelsPage() {
  const [tab, setTab] = useState<TabType>('vendors');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [families, setFamilies] = useState<ModelFamily[]>([]);
  const [variants, setVariants] = useState<ModelVariant[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadAll = useCallback(async () => {
    const [v, f, mv, c] = await Promise.all([
      fetch('/api/vendors').then(r => r.json()),
      fetch('/api/model-families').then(r => r.json()),
      fetch('/api/model-variants').then(r => r.json()),
      fetch('/api/channels').then(r => r.json()),
    ]);
    setVendors(v); setFamilies(f); setVariants(mv); setChannels(c);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  const config: Record<TabType, { label: string; icon: typeof Building2; apiPath: string; fields: { key: string; label: string; type?: string; options?: { value: string; label: string }[] }[]; items: Record<string, unknown>[] }> = {
    vendors: {
      label: '厂商', icon: Building2, apiPath: '/api/vendors',
      fields: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: '名称' },
        { key: 'description', label: '描述', type: 'textarea' },
        { key: 'sort_order', label: '排序', type: 'number' },
      ],
      items: vendors as unknown as Record<string, unknown>[],
    },
    families: {
      label: '产品线', icon: Layers, apiPath: '/api/model-families',
      fields: [
        { key: 'id', label: 'ID' },
        { key: 'vendor_id', label: '所属厂商', type: 'select', options: vendors.map(v => ({ value: v.id, label: v.name })) },
        { key: 'name', label: '名称' },
        { key: 'description', label: '描述', type: 'textarea' },
        { key: 'sort_order', label: '排序', type: 'number' },
      ],
      items: families as unknown as Record<string, unknown>[],
    },
    variants: {
      label: '模型版本', icon: Cpu, apiPath: '/api/model-variants',
      fields: [
        { key: 'id', label: 'ID' },
        { key: 'family_id', label: '所属产品线', type: 'select', options: families.map(f => ({ value: f.id, label: `${vendors.find(v => v.id === f.vendor_id)?.name || ''} / ${f.name}` })) },
        { key: 'name', label: '名称' },
        { key: 'description', label: '描述', type: 'textarea' },
        { key: 'sort_order', label: '排序', type: 'number' },
      ],
      items: variants as unknown as Record<string, unknown>[],
    },
    channels: {
      label: '渠道', icon: Radio, apiPath: '/api/channels',
      fields: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: '名称' },
        { key: 'description', label: '描述', type: 'textarea' },
        { key: 'sort_order', label: '排序', type: 'number' },
      ],
      items: channels as unknown as Record<string, unknown>[],
    },
  };

  const curr = config[tab];

  async function save() {
    if (!editing) return;
    const isNew = !curr.items.find(i => (i as Record<string, unknown>).id === editing.id);
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? curr.apiPath : `${curr.apiPath}/${editing.id}`;
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
    if (res.ok) { showToast('success', '保存成功'); setEditing(null); loadAll(); }
    else { const err = await res.json(); showToast('error', err.error); }
  }

  async function deleteItem(id: string) {
    if (!confirm('确定删除？')) return;
    const res = await fetch(`${curr.apiPath}/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('success', '已删除'); loadAll(); }
    else { const err = await res.json(); showToast('error', err.error); }
  }

  function getDisplayValue(item: Record<string, unknown>, key: string): string {
    const field = curr.fields.find(f => f.key === key);
    if (field?.type === 'select') {
      const opt = field.options?.find(o => o.value === item[key]);
      return opt?.label || String(item[key] || '-');
    }
    return String(item[key] ?? '-');
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1>模型管理</h1>
        <button className="btn btn-primary" onClick={() => { const defaults: Record<string, unknown> = { sort_order: 0 }; setEditing(defaults); }}>
          <Plus size={16} /> 创建{curr.label}
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {(Object.keys(config) as TabType[]).map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {config[t].label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {curr.fields.filter(f => f.type !== 'textarea').map(f => <th key={f.key}>{f.label}</th>)}
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {curr.items.map(item => {
              const typedItem = item as Record<string, unknown>;
              return (
                <tr key={typedItem.id as string}>
                  {curr.fields.filter(f => f.type !== 'textarea').map(f => (
                    <td key={f.key}>{getDisplayValue(typedItem, f.key)}</td>
                  ))}
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...typedItem })}><Pencil size={14} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteItem(typedItem.id as string)} style={{ color: 'var(--color-destructive)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <h3 style={{ marginBottom: 'var(--space-6)' }}>
              {curr.items.find(i => (i as Record<string, unknown>).id === editing.id) ? '编辑' : '创建'}{curr.label}
            </h3>
            {curr.fields.map(f => (
              <div key={f.key} className="field">
                <label>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea className="input input-area" value={String(editing[f.key] || '')} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} />
                ) : f.type === 'select' ? (
                  <select className="input" value={String(editing[f.key] || '')} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} style={{ borderRadius: 'var(--radius-md)' }}>
                    <option value="">选择...</option>
                    {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input className="input" type={f.type || 'text'} value={String(editing[f.key] ?? '')} onChange={e => setEditing({ ...editing, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })}
                    disabled={f.key === 'id' && !!curr.items.find(i => (i as Record<string, unknown>).id === editing.id)} />
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>取消</button>
              <button className="btn btn-primary" onClick={save}>保存</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
