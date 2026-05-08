'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { FileText, Plus, X, ChevronRight, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function DocumentsPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');

  const fetch = async () => {
    try { const r = await api.get('/documents'); setPages(r.data.data || []); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const create = async () => {
    if (!title.trim()) return;
    try { await api.post('/documents', { title }); setTitle(''); setShowCreate(false); fetch(); } catch {}
  };

  const del = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this document?')) return;
    try { await api.delete(`/documents/${id}`); fetch(); } catch {}
  };

  return (
    <DashboardLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div className="page-header">
          <div><h1 className="page-title">Documents</h1><p className="page-subtitle">{pages.length} pages</p></div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> New Page</button>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : pages.length === 0 ? (
          <div className="empty-state"><FileText size={48} /><h3 style={{ marginTop: 12, fontWeight: 600 }}>No documents yet</h3></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {pages.map(p => (
              <div key={p.id} className="card card-interactive" style={{ padding: 20, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{p.icon || '📄'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        {p.createdBy?.firstName} {p.createdBy?.lastName} · {dayjs(p.updatedAt).format('MMM D')}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }} onClick={(e) => del(p.id, e)}><Trash2 size={14} /></button>
                </div>
                {p.project && <div style={{ fontSize: 12, color: 'var(--color-primary)', marginTop: 8 }}>{p.project.name}</div>}
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
                  {p._count?.blocks || 0} blocks · {p._count?.children || 0} sub-pages
                </div>
              </div>
            ))}
          </div>
        )}
        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>New Document</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)}><X size={18} /></button>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Title</label>
                <input className="input" placeholder="Document title..." value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={create}>Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
