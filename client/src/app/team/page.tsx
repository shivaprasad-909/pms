'use client';

// ============================================
// Team Page — User Management
// ============================================

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { Users, Plus, Search, Mail, Phone, Briefcase, Clock, X, Shield } from 'lucide-react';
import dayjs from 'dayjs';

const roleGradients: Record<string, string> = {
  FOUNDER: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
  ADMIN: 'linear-gradient(135deg, #0984E3, #74B9FF)',
  MANAGER: 'linear-gradient(135deg, #00B894, #55EFC4)',
  DEVELOPER: 'linear-gradient(135deg, #F39C12, #F8C471)',
};

// ── Invite Modal ─────────────────

function InviteModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'DEVELOPER', designation: '', uiPermissions: [] as string[] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.firstName || !form.lastName) { setError('All required fields must be filled'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      onCreated();
      onClose();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors && data.errors.length > 0) {
        setError(data.errors[0].message);
      } else {
        setError(data?.message || 'Failed');
      }
    } finally { setLoading(false); }
  };

  const availablePermissions = [
    { id: 'analytics.view', label: 'View Analytics' },
    { id: 'reports.view', label: 'View Reports' },
    { id: 'teams.manage', label: 'Manage Teams' },
    { id: 'automation.manage', label: 'Manage Automations' },
    { id: 'projects.create', label: 'Create Projects' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Add Team Member</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        {error && <div style={{ padding: '10px 14px', background: '#FFE8E5', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label className="input-label">First Name *</label><input className="input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
            <div><label className="input-label">Last Name *</label><input className="input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
          </div>
          <div><label className="input-label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="input-label">Password *</label><input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="input-label">Role</label>
              <select className="select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="DEVELOPER">Developer</option>
                <option value="MANAGER">Manager</option>
                <option value="STAKEHOLDER">Stakeholder</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div><label className="input-label">Designation</label><input className="input" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Senior Developer" /></div>
          </div>
          
          <div style={{ marginTop: 8 }}>
            <label className="input-label">Extra UI Permissions (Overrides)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4, background: 'var(--color-bg-secondary)', padding: 12, borderRadius: 'var(--radius-md)' }}>
              {availablePermissions.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.uiPermissions.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) setForm({ ...form, uiPermissions: [...form.uiPermissions, p.id] });
                      else setForm({ ...form, uiPermissions: form.uiPermissions.filter(id => id !== p.id) });
                    }}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────

export default function TeamPage() {
  const { hasRole } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users', { params: search ? { search } : {} });
      setUsers(res.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const roleStats = {
    FOUNDER: users.filter(u => u.role === 'FOUNDER').length,
    ADMIN: users.filter(u => u.role === 'ADMIN').length,
    MANAGER: users.filter(u => u.role === 'MANAGER').length,
    DEVELOPER: users.filter(u => u.role === 'DEVELOPER').length,
  };

  return (
    <DashboardLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Team</h1>
            <p className="page-subtitle">{users.length} member{users.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input className="input" placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, width: 220, fontSize: 13 }} />
            </div>
            {hasRole('FOUNDER', 'ADMIN') && (
              <button className="btn btn-primary" onClick={() => setShowInvite(true)}><Plus size={16} /> Add Member</button>
            )}
          </div>
        </div>

        {/* Role Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {Object.entries(roleStats).map(([role, count]) => (
            <div key={role} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: roleGradients[role], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={16} style={{ color: 'white' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{role.toLowerCase()}s</div>
              </div>
            </div>
          ))}
        </div>

        {/* Team Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {users.map(user => (
              <div key={user.id} className="card card-interactive" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
                  background: roleGradients[user.role], display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 700, color: 'white',
                }}>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{user.firstName} {user.lastName}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{user.designation || user.department || '—'}</div>
                <span className={`badge badge-${user.role?.toLowerCase()}`} style={{ marginTop: 8, display: 'inline-block' }}>{user.role}</span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} />{user.email}</span>
                </div>
                <div style={{
                  marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border-light)',
                  display: 'flex', justifyContent: 'center', gap: 4,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: user.isActive ? 'var(--color-success)' : 'var(--color-text-muted)',
                  }} />
                  <span style={{ fontSize: 11, color: user.isActive ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showInvite && <InviteModal onClose={() => setShowInvite(false)} onCreated={fetchUsers} />}
      </div>
    </DashboardLayout>
  );
}
