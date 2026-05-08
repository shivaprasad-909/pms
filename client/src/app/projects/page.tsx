'use client';

// ============================================
// Projects Page — Full CRUD + Filters
// ============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import {
  FolderKanban, Plus, Search, Filter, Grid3X3, List, MoreHorizontal,
  Calendar, Users, CheckSquare, ChevronRight, AlertTriangle, Clock, X
} from 'lucide-react';
import dayjs from 'dayjs';

const statusColors: Record<string, string> = {
  PLANNING: '#6C5CE7', ACTIVE: '#00B894', ON_HOLD: '#F39C12',
  COMPLETED: '#27AE60', ARCHIVED: '#636E72', PENDING_APPROVAL: '#E17055',
};

const priorityColors: Record<string, string> = {
  LOW: '#636E72', MEDIUM: '#F39C12', HIGH: '#E17055', URGENT: '#D63031',
};

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ width: '100%', height: 5, background: 'var(--color-bg)', borderRadius: 100, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.6s ease' }} />
    </div>
  );
}

// ── Create Project Modal ─────────────────

function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', description: '', priority: 'MEDIUM', startDate: '', endDate: '', budget: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { setError('Project name is required'); return; }
    setLoading(true);
    try {
      await api.post('/projects', {
        ...form,
        budget: form.budget ? parseFloat(form.budget) : undefined,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Create New Project</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        {error && <div style={{ padding: '10px 14px', background: '#FFE8E5', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="input-label">Project Name *</label>
            <input className="input" placeholder="e.g. Platform Redesign" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea className="input" rows={3} placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="input-label">Priority</label>
              <select className="select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="input-label">Budget ($)</label>
              <input className="input" type="number" placeholder="0" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="input-label">Start Date</label>
              <input className="input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="input-label">End Date</label>
              <input className="input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────

export default function ProjectsPage() {
  const { hasRole } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreate, setShowCreate] = useState(false);

  const fetchProjects = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/projects', { params });
      setProjects(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, [search, statusFilter]);

  return (
    <DashboardLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input className="input" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 34, width: 220, fontSize: 13 }} />
            </div>
            {/* Status Filter */}
            <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 150, fontSize: 13 }}>
              <option value="">All Status</option>
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
            {/* View Toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button onClick={() => setViewMode('grid')} style={{ padding: '6px 10px', background: viewMode === 'grid' ? 'var(--color-primary-bg)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                <Grid3X3 size={16} />
              </button>
              <button onClick={() => setViewMode('list')} style={{ padding: '6px 10px', background: viewMode === 'list' ? 'var(--color-primary-bg)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                <List size={16} />
              </button>
            </div>
            {/* Create Button */}
            {hasRole('FOUNDER', 'ADMIN', 'MANAGER') && (
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                <Plus size={16} /> New Project
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <FolderKanban size={48} />
            <h3 style={{ marginTop: 12, fontWeight: 600 }}>No projects found</h3>
            <p style={{ marginTop: 4 }}>Create your first project to get started</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Grid View ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {projects.map(project => {
              const taskCount = project._count?.tasks || 0;
              const memberCount = project._count?.members || project.members?.length || 0;
              return (
                <Link key={project.id} href={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card card-interactive" style={{ padding: 20, height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 'var(--radius-md)',
                          background: `linear-gradient(135deg, ${statusColors[project.status] || '#636E72'}20, ${statusColors[project.status] || '#636E72'}40)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <FolderKanban size={18} style={{ color: statusColors[project.status] || '#636E72' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{project.name}</div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <span className={`badge badge-${project.status?.toLowerCase()?.replace('_', '-')}`}>{project.status?.replace('_', ' ')}</span>
                            <span className={`badge badge-${project.priority?.toLowerCase()}`}>{project.priority}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                    </div>

                    {project.description && (
                      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckSquare size={13} /> {taskCount} tasks
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={13} /> {memberCount} members
                      </span>
                      {project.endDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: new Date(project.endDate) < new Date() ? 'var(--color-error)' : undefined }}>
                          <Calendar size={13} /> {dayjs(project.endDate).format('MMM D')}
                        </span>
                      )}
                    </div>

                    {/* Member Avatars */}
                    {project.members?.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        {project.members.slice(0, 5).map((m: any, i: number) => (
                          <div key={i} style={{
                            width: 28, height: 28, borderRadius: '50%', border: '2px solid white',
                            background: `hsl(${(m.user?.firstName?.charCodeAt(0) * 47) % 360}, 55%, 55%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: 'white', marginLeft: i > 0 ? -8 : 0,
                          }} title={`${m.user?.firstName} ${m.user?.lastName}`}>
                            {m.user?.firstName?.[0]}{m.user?.lastName?.[0]}
                          </div>
                        ))}
                        {project.members.length > 5 && (
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 6 }}>+{project.members.length - 5}</div>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* ── List View ── */
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Tasks</th>
                  <th>Members</th>
                  <th>Due Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <tr key={project.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/projects/${project.id}`}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{project.name}</div>
                      {project.description && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{project.description.slice(0, 60)}...</div>}
                    </td>
                    <td><span className={`badge badge-${project.status?.toLowerCase()?.replace('_', '-')}`}>{project.status?.replace('_', ' ')}</span></td>
                    <td><span className={`badge badge-${project.priority?.toLowerCase()}`}>{project.priority}</span></td>
                    <td>{project._count?.tasks || 0}</td>
                    <td>{project._count?.members || project.members?.length || 0}</td>
                    <td style={{ color: project.endDate && new Date(project.endDate) < new Date() ? 'var(--color-error)' : undefined }}>
                      {project.endDate ? dayjs(project.endDate).format('MMM D, YYYY') : '—'}
                    </td>
                    <td><ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Modal */}
        {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={fetchProjects} />}
      </div>
    </DashboardLayout>
  );
}
