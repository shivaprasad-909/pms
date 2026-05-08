'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { Tabs, showToast, Badge } from '@/components/ui';
import api from '@/lib/api';
import { Settings, Shield, Users, Bell, Palette, Database, Download, FileText } from 'lucide-react';

export default function SetupPage() {
  const { user, hasRole } = useAuthStore();
  const [tab, setTab] = useState('general');
  const [permissions, setPermissions] = useState<any[]>([]);
  const [rolePerms, setRolePerms] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (hasRole('FOUNDER', 'ADMIN')) {
      api.get('/permissions').then(r => setPermissions(r.data.data || [])).catch(() => {});
      api.get('/permissions/matrix').then(r => setRolePerms(r.data.data || {})).catch(() => {});
      api.get('/users').then(r => setUsers(r.data.data || [])).catch(() => {});
    }
  }, []);

  const togglePermission = async (role: string, permId: string, has: boolean) => {
    try {
      if (has) {
        await api.delete(`/permissions/role/${role}/${permId}`);
      } else {
        await api.post('/permissions/role', { role, permissionId: permId });
      }
      const r = await api.get('/permissions/matrix');
      setRolePerms(r.data.data || {});
      showToast('Permission updated', 'success');
    } catch { showToast('Failed', 'error'); }
  };

  const exportPDF = async () => {
    try {
      const r = await api.get('/export/report-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'report.pdf'; a.click();
      showToast('PDF exported!', 'success');
    } catch { showToast('Export failed', 'error'); }
  };

  const roles = ['FOUNDER', 'ADMIN', 'MANAGER', 'DEVELOPER'];
  const roleColors: Record<string, string> = { FOUNDER: '#6C5CE7', ADMIN: '#0984E3', MANAGER: '#00B894', DEVELOPER: '#F39C12' };

  return (
    <DashboardLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div className="page-header">
          <div><h1 className="page-title">Settings</h1><p className="page-subtitle">System configuration & permissions</p></div>
        </div>

        <Tabs tabs={[
          { key: 'general', label: 'General' },
          ...(hasRole('FOUNDER', 'ADMIN') ? [
            { key: 'permissions', label: 'Permission Matrix' },
            { key: 'export', label: 'Export & Data' },
          ] : []),
          { key: 'appearance', label: 'Appearance' },
          { key: 'notifications', label: 'Notifications' },
        ]} active={tab} onChange={setTab} />

        {/* General Settings */}
        {tab === 'general' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={16} /> Organization</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label className="input-label">Organization Name</label><input className="input" defaultValue={user?.organization?.name || 'My Organization'} /></div>
                <div><label className="input-label">Your Email</label><input className="input" value={user?.email || ''} readOnly style={{ opacity: 0.6 }} /></div>
                <div><label className="input-label">Your Role</label><Badge variant={user?.role?.toLowerCase()}>{user?.role}</Badge></div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Save Changes</button>
              </div>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Database size={16} /> System Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Users</span><span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{users.length}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Permissions</span><span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{permissions.length}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Version</span><span style={{ fontWeight: 600, color: 'var(--color-text)' }}>1.0.0</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Environment</span><span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Production</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Permission Matrix */}
        {tab === 'permissions' && (
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-light)' }}>
              <h3 style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={16} /> Permission Matrix</h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Toggle permissions for each role</p>
            </div>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: 250, position: 'sticky', left: 0, background: 'var(--color-surface)', zIndex: 1 }}>Permission</th>
                  {roles.map(r => (
                    <th key={r} style={{ textAlign: 'center', minWidth: 100 }}>
                      <Badge style={{ background: roleColors[r] + '15', color: roleColors[r] }}>{r}</Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map(perm => (
                  <tr key={perm.id}>
                    <td style={{ position: 'sticky', left: 0, background: 'var(--color-surface)', zIndex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{perm.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{perm.description}</div>
                    </td>
                    {roles.map(role => {
                      const has = rolePerms[role]?.some((rp: any) => rp.permissionId === perm.id || rp.id === perm.id);
                      return (
                        <td key={role} style={{ textAlign: 'center' }}>
                          <label style={{ cursor: 'pointer' }}>
                            <input type="checkbox" checked={has || false} onChange={() => togglePermission(role, perm.id, has)}
                              style={{ width: 18, height: 18, accentColor: roleColors[role], cursor: 'pointer' }} />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {permissions.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                    No permissions configured. Create permissions via API first.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Export */}
        {tab === 'export' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <Download size={32} style={{ color: '#6C5CE7', marginBottom: 12 }} />
              <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Activity Log CSV</h4>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>Export all activity logs</p>
              <button className="btn btn-outline" onClick={() => api.get('/export/activity-csv', { responseType: 'blob' }).then(r => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([r.data])); a.download = 'activity.csv'; a.click(); })}>Download CSV</button>
            </div>
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <Download size={32} style={{ color: '#00B894', marginBottom: 12 }} />
              <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Tasks CSV</h4>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>Export all tasks with details</p>
              <button className="btn btn-outline" onClick={() => api.get('/export/tasks-csv', { responseType: 'blob' }).then(r => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([r.data])); a.download = 'tasks.csv'; a.click(); })}>Download CSV</button>
            </div>
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <FileText size={32} style={{ color: '#E17055', marginBottom: 12 }} />
              <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Project Report PDF</h4>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>Full PDF report</p>
              <button className="btn btn-primary" onClick={exportPDF}>Download PDF</button>
            </div>
          </div>
        )}

        {/* Appearance */}
        {tab === 'appearance' && (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Palette size={16} /> Appearance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="input-label">Theme</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-primary btn-sm">Light</button>
                  <button className="btn btn-ghost btn-sm" disabled>Dark (coming soon)</button>
                </div>
              </div>
              <div><label className="input-label">Accent Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#6C5CE7', '#00B894', '#0984E3', '#E17055', '#F39C12'].map(c => (
                    <div key={c} style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: c, cursor: 'pointer', border: '2px solid transparent' }} />
                  ))}
                </div>
              </div>
              <div><label className="input-label">Sidebar</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-primary btn-sm">Expanded</button>
                  <button className="btn btn-ghost btn-sm">Collapsed</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {tab === 'notifications' && (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={16} /> Notification Preferences</h3>
            {[
              { label: 'Task assignments', desc: 'When you are assigned to a task' },
              { label: 'Task status changes', desc: 'When a task you follow changes status' },
              { label: 'Comments & mentions', desc: 'When someone mentions you or comments' },
              { label: 'Sprint updates', desc: 'Sprint started, ended, or modified' },
              { label: 'Project approvals', desc: 'Approval requests and decisions' },
            ].map((n, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{n.label}</div><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{n.desc}</div></div>
                <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', inset: 0, background: '#00B894', borderRadius: 12, transition: '0.2s' }}>
                    <span style={{ position: 'absolute', left: 22, top: 3, width: 18, height: 18, background: 'white', borderRadius: '50%', transition: '0.2s' }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
