'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { Zap, Plus, X, ToggleLeft, ToggleRight, Trash2, Play } from 'lucide-react';
import dayjs from 'dayjs';

const triggers = ['TASK_STATUS_CHANGE','TASK_ASSIGNED','TASK_COMPLETED','TASK_OVERDUE','PROJECT_COMPLETED','SPRINT_COMPLETED','DUE_DATE_APPROACHING','TIME_LOGGED'];
const actions = ['SEND_NOTIFICATION','CHANGE_STATUS','ASSIGN_USER','SEND_EMAIL','CREATE_TASK','UPDATE_PRIORITY','REQUEST_APPROVAL','SEND_REMINDER'];

export default function AutomationPage() {
  const { hasRole } = useAuthStore();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', trigger: 'TASK_STATUS_CHANGE', actions: 'SEND_NOTIFICATION' });

  const fetch = async () => {
    try { const r = await api.get('/automation'); setRules(r.data.data || []); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const create = async () => {
    if (!form.name) return;
    try {
      await api.post('/automation', {
        name: form.name, description: form.description, trigger: form.trigger,
        actions: [{ type: form.actions, config: {} }],
      });
      setShowCreate(false); setForm({ name: '', description: '', trigger: 'TASK_STATUS_CHANGE', actions: 'SEND_NOTIFICATION' }); fetch();
    } catch {}
  };

  const toggle = async (id: string, isActive: boolean) => {
    try { await api.patch(`/automation/${id}`, { isActive: !isActive }); fetch(); } catch {}
  };

  const del = async (id: string) => {
    if (!confirm('Delete this automation?')) return;
    try { await api.delete(`/automation/${id}`); fetch(); } catch {}
  };

  return (
    <DashboardLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div className="page-header">
          <div><h1 className="page-title">Automation</h1><p className="page-subtitle">{rules.length} rules</p></div>
          {hasRole('FOUNDER', 'ADMIN') && <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> New Rule</button>}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : rules.length === 0 ? (
          <div className="empty-state"><Zap size={48} /><h3 style={{ marginTop: 12, fontWeight: 600 }}>No automation rules</h3><p style={{ marginTop: 4 }}>Create rules to automate your workflow</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rules.map(r => (
              <div key={r.id} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: r.isActive ? '#6C5CE718' : '#F1F3F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={18} style={{ color: r.isActive ? '#6C5CE7' : '#636E72' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    When <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{r.trigger?.replace(/_/g, ' ').toLowerCase()}</span>
                    {r.project && <span> in {r.project.name}</span>}
                    {' · '}{r._count?.executions || 0} executions
                    {r.lastExecutedAt && <span> · Last: {dayjs(r.lastExecutedAt).format('MMM D')}</span>}
                  </div>
                </div>
                <button onClick={() => toggle(r.id, r.isActive)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: r.isActive ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                  {r.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
                <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }} onClick={() => del(r.id)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}

        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>New Automation Rule</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label className="input-label">Name *</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Notify on task complete" /></div>
                <div><label className="input-label">Description</label><input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div><label className="input-label">When (Trigger)</label>
                  <select className="select" value={form.trigger} onChange={e => setForm({ ...form, trigger: e.target.value })}>
                    {triggers.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div><label className="input-label">Then (Action)</label>
                  <select className="select" value={form.actions} onChange={e => setForm({ ...form, actions: e.target.value })}>
                    {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={create}>Create Rule</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
