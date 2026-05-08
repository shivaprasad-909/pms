'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Webhook, Plus, Search, Trash2, Power, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import dayjs from 'dayjs';

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  createdAt: string;
}

export default function WebhooksPage() {
  const { hasRole } = useAuthStore();
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: ['task.created'], secret: '' });

  const availableEvents = [
    { id: 'task.created', label: 'Task Created' },
    { id: 'task.updated', label: 'Task Updated' },
    { id: 'task.completed', label: 'Task Completed' },
    { id: 'project.created', label: 'Project Created' },
    { id: 'comment.added', label: 'Comment Added' },
  ];

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await api.get('/webhooks');
      setWebhooks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/webhooks', newWebhook);
      setShowAddModal(false);
      fetchWebhooks();
      setNewWebhook({ url: '', events: ['task.created'], secret: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add webhook');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/webhooks/${id}`, { isActive: !currentStatus });
      setWebhooks(webhooks.map(w => w.id === id ? { ...w, isActive: !currentStatus } : w));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await api.delete(`/webhooks/${id}`);
      setWebhooks(webhooks.filter(w => w.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!hasRole('FOUNDER', 'ADMIN')) {
    return <div className="card" style={{ padding: 32, textAlign: 'center' }}>You do not have permission to view webhooks.</div>;
  }

  return (
    <div className="card" style={{ padding: 32, minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Webhooks</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Send real-time data to external services when events happen.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Webhook
        </button>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-md)' }}></div>
      ) : webhooks.length === 0 ? (
        <div className="empty-state" style={{ border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <Webhook size={48} />
          <h3 style={{ margin: '16px 0 8px', fontSize: 18 }}>No webhooks configured</h3>
          <p style={{ marginBottom: 24, maxWidth: 400 }}>Automate your workflows by pushing real-time updates from PMS to Slack, Discord, or your own custom servers.</p>
          <button className="btn btn-outline" onClick={() => setShowAddModal(true)}>
            Add Webhook
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>URL Payload</th>
                <th>Events</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map(webhook => (
                <tr key={webhook.id}>
                  <td>
                    {webhook.isActive ? (
                      <span className="badge" style={{ background: '#D5F5E3', color: '#27AE60' }}><CheckCircle2 size={12}/> Active</span>
                    ) : (
                      <span className="badge" style={{ background: '#F1F3F5', color: '#636E72' }}><Power size={12}/> Inactive</span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--color-primary)' }}>
                    {webhook.url}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {webhook.events.slice(0, 2).map(e => (
                        <span key={e} style={{ background: 'var(--color-bg)', padding: '2px 8px', borderRadius: 4, fontSize: 11, border: '1px solid var(--color-border)' }}>
                          {e}
                        </span>
                      ))}
                      {webhook.events.length > 2 && (
                        <span style={{ background: 'var(--color-bg)', padding: '2px 8px', borderRadius: 4, fontSize: 11, border: '1px solid var(--color-border)' }}>
                          +{webhook.events.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    {dayjs(webhook.createdAt).format('MMM DD, YYYY')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button 
                        onClick={() => toggleStatus(webhook.id, webhook.isActive)}
                        className="btn-ghost" 
                        style={{ padding: 6, borderRadius: 4, cursor: 'pointer', border: 'none', color: webhook.isActive ? 'var(--color-warning)' : 'var(--color-success)' }}
                        title={webhook.isActive ? 'Disable' : 'Enable'}
                      >
                        <Power size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(webhook.id)}
                        className="btn-ghost" 
                        style={{ padding: 6, borderRadius: 4, cursor: 'pointer', border: 'none', color: 'var(--color-error)' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Add Webhook Endpoint</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Payload URL *</label>
                <input 
                  type="url" 
                  className="input" 
                  placeholder="https://example.com/webhook" 
                  required
                  value={newWebhook.url}
                  onChange={e => setNewWebhook({...newWebhook, url: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Secret Token</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Optional token to verify requests" 
                  value={newWebhook.secret}
                  onChange={e => setNewWebhook({...newWebhook, secret: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="input-label">Events to send</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'var(--color-bg)', padding: 12, borderRadius: 8 }}>
                  {availableEvents.map(evt => (
                    <label key={evt.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={newWebhook.events.includes(evt.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook({...newWebhook, events: [...newWebhook.events, evt.id]});
                          } else {
                            setNewWebhook({...newWebhook, events: newWebhook.events.filter(x => x !== evt.id)});
                          }
                        }}
                      />
                      {evt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Webhook</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
