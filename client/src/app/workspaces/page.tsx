'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { Plus, FolderKanban, MoreVertical, Search, Settings } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  isArchived: boolean;
  _count: { projects: number };
}

export default function WorkspacesPage() {
  const { user, hasRole } = useAuthStore();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '', color: '#6C5CE7' });

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data.data);
    } catch (err) {
      console.error('Error fetching workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/workspaces', newWorkspace);
      setWorkspaces([...workspaces, { ...res.data.data, _count: { projects: 0 } }]);
      setShowCreateModal(false);
      setNewWorkspace({ name: '', description: '', color: '#6C5CE7' });
    } catch (err) {
      console.error('Error creating workspace:', err);
      alert('Failed to create workspace. You might not have permission.');
    }
  };

  const filteredWorkspaces = workspaces.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    (w.description && w.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workspaces</h1>
          <p className="page-subtitle">Manage top-level organizational containers</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search workspaces..." 
              className="input" 
              style={{ paddingLeft: 36, width: 250 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {hasRole('FOUNDER', 'ADMIN', 'MANAGER') && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> New Workspace
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card skeleton" style={{ height: 180 }}></div>
          ))}
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <div className="empty-state card">
          <FolderKanban size={48} />
          <h3 style={{ margin: '16px 0 8px', fontSize: 18, color: 'var(--color-text)' }}>No workspaces found</h3>
          <p style={{ marginBottom: 24 }}>Get started by creating your first organizational workspace.</p>
          {hasRole('FOUNDER', 'ADMIN', 'MANAGER') && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> Create Workspace
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredWorkspaces.map(workspace => (
            <div key={workspace.id} className="card card-interactive" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 6, background: workspace.color }}></div>
              <div style={{ padding: 20, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: 8, 
                      background: `${workspace.color}15`, color: workspace.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <FolderKanban size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>{workspace.name}</h3>
                      <span className="badge badge-active" style={{ fontSize: 10, padding: '2px 6px', marginTop: 4 }}>Active</span>
                    </div>
                  </div>
                  <button className="btn-ghost" style={{ padding: 4, borderRadius: 4, cursor: 'pointer', border: 'none' }}>
                    <MoreVertical size={16} />
                  </button>
                </div>
                
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 42 }}>
                  {workspace.description || 'No description provided.'}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--color-border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 500 }}>
                    <FolderKanban size={14} />
                    <span>{workspace._count.projects} Project{workspace._count.projects !== 1 ? 's' : ''}</span>
                  </div>
                  <Link href={`/projects?workspaceId=${workspace.id}`} className="btn btn-outline btn-sm">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Create Workspace</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>✕</button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Workspace Name *</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. Marketing, Engineering, Client A" 
                  required
                  value={newWorkspace.name}
                  onChange={e => setNewWorkspace({...newWorkspace, name: e.target.value})}
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Description</label>
                <textarea 
                  className="input" 
                  placeholder="What is this workspace for?" 
                  rows={3}
                  value={newWorkspace.description}
                  onChange={e => setNewWorkspace({...newWorkspace, description: e.target.value})}
                />
              </div>
              
              <div style={{ marginBottom: 24 }}>
                <label className="input-label">Theme Color</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['#6C5CE7', '#00B894', '#0984E3', '#F39C12', '#E17055', '#D63031', '#636E72'].map(color => (
                    <div 
                      key={color}
                      onClick={() => setNewWorkspace({...newWorkspace, color})}
                      style={{ 
                        width: 30, height: 30, borderRadius: '50%', background: color, cursor: 'pointer',
                        boxShadow: newWorkspace.color === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : 'none',
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: '1px solid var(--color-border-light)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Workspace</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
