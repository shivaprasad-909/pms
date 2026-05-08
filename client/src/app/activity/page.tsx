'use client';

// ============================================
// Activity Log Page
// ============================================

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { Activity, Zap, CheckSquare, Users, Clock, MessageSquare, Circle } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const actionMeta: Record<string, { icon: any; color: string; label: string }> = {
  CREATED: { icon: Zap, color: '#6C5CE7', label: 'Created' },
  UPDATED: { icon: Activity, color: '#0984E3', label: 'Updated' },
  STATUS_CHANGED: { icon: CheckSquare, color: '#00B894', label: 'Status Changed' },
  ASSIGNED: { icon: Users, color: '#F39C12', label: 'Assigned' },
  COMMENTED: { icon: MessageSquare, color: '#74B9FF', label: 'Commented' },
  LOGGED_TIME: { icon: Clock, color: '#E17055', label: 'Logged Time' },
  DELETED: { icon: Circle, color: '#D63031', label: 'Deleted' },
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params: any = { page, limit: 30 };
        if (actionFilter) params.action = actionFilter;
        const res = await api.get('/activity-logs', { params });
        setLogs(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [page, actionFilter]);

  return (
    <DashboardLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div className="page-header">
          <div><h1 className="page-title">Activity Log</h1><p className="page-subtitle">All team activity</p></div>
          <select className="select" value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} style={{ width: 180, fontSize: 13 }}>
            <option value="">All Actions</option>
            {Object.entries(actionMeta).map(([key, m]) => <option key={key} value={key}>{m.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-md)' }} />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state"><Activity size={48} /><h3 style={{ marginTop: 12, fontWeight: 600 }}>No activity</h3></div>
        ) : (
          <div className="card" style={{ padding: '4px 20px' }}>
            {logs.map((log, i) => {
              const meta = actionMeta[log.action] || { icon: Circle, color: '#636E72', label: log.action };
              const Icon = meta.icon;
              return (
                <div key={log.id} style={{
                  display: 'flex', gap: 14, padding: '14px 0',
                  borderBottom: i < logs.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: meta.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} style={{ color: meta.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 600 }}>{log.user?.firstName} {log.user?.lastName}</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}> {meta.label.toLowerCase()}</span>
                      <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}> {log.entityType?.toLowerCase()}</span>
                      {log.project && <span style={{ color: 'var(--color-text-secondary)' }}> in <span style={{ fontWeight: 500 }}>{log.project.name}</span></span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>{dayjs(log.createdAt).fromNow()}</div>
                  </div>
                  {log.user?.role && <span className={`badge badge-${log.user.role.toLowerCase()}`} style={{ alignSelf: 'center' }}>{log.user.role}</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <span style={{ padding: '6px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>Page {page} of {totalPages}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
