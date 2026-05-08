'use client';
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SearchInput, Badge, Avatar, EmptyState, Skeleton, Modal, showToast } from '@/components/ui';
import { CheckSquare, Plus, Grid3X3, List, X, MessageSquare, Paperclip, AlertTriangle, Calendar, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const columns = [
  { key: 'TODO', label: 'To Do', color: '#636E72', bg: '#F1F3F5' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#6C5CE7', bg: '#F0EEFF' },
  { key: 'IN_REVIEW', label: 'In Review', color: '#F39C12', bg: '#FFF8E8' },
  { key: 'DONE', label: 'Done', color: '#00B894', bg: '#E8FFF5' },
  { key: 'BLOCKED', label: 'Blocked', color: '#E17055', bg: '#FFE8E5' },
];

// ── Sortable Task Card ──
function SortableCard({ task, onClick }: { task: any; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, cursor: 'grab' };
  const pri: Record<string, string> = { LOW: '#636E72', MEDIUM: '#F39C12', HIGH: '#E17055', URGENT: '#D63031' };
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="kanban-card" onClick={onClick}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: (pri[task.priority] || '#636E72') + '18', color: pri[task.priority] }}>{task.priority}</span>
      </div>
      <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.4, marginBottom: 8 }}>{task.title}</div>
      {task.subtasks?.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ flex: 1, height: 3, background: 'var(--color-border)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ width: `${(task.subtasks.filter((s: any) => s.isCompleted).length / task.subtasks.length) * 100}%`, height: '100%', background: 'var(--color-secondary)', borderRadius: 100 }} />
          </div>
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{task.subtasks.filter((s: any) => s.isCompleted).length}/{task.subtasks.length}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--color-text-muted)' }}>
          {task._count?.comments > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MessageSquare size={11} />{task._count.comments}</span>}
          {task.storyPoints && <span style={{ background: 'var(--color-bg)', padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>{task.storyPoints} SP</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isOverdue && <AlertTriangle size={12} style={{ color: 'var(--color-error)' }} />}
          {task.dueDate && <span style={{ fontSize: 10, color: isOverdue ? 'var(--color-error)' : 'var(--color-text-muted)' }}>{dayjs(task.dueDate).format('MMM D')}</span>}
          {task.assignments?.slice(0, 2).map((a: any, i: number) => (
            <Avatar key={i} firstName={a.user?.firstName} lastName={a.user?.lastName} size={20} style={{ marginLeft: i > 0 ? -6 : 2 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { hasRole } = useAuthStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ search: '', projectId: '', priority: '' });
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchTasks = useCallback(async () => {
    try {
      const params: any = { limit: 200 };
      if (filters.search) params.search = filters.search;
      if (filters.projectId) params.projectId = filters.projectId;
      if (filters.priority) params.priority = filters.priority;
      const res = await api.get('/tasks', { params });
      setTasks(res.data.data || []);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchTasks(); api.get('/projects').then(r => setProjects(r.data.data || [])).catch(() => {}); }, [fetchTasks]);

  // Listen for real-time updates
  useEffect(() => {
    const handler = () => fetchTasks();
    window.addEventListener('pms:task-updated', handler);
    return () => window.removeEventListener('pms:task-updated', handler);
  }, [fetchTasks]);

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const taskId = active.id as string;
    const targetStatus = over.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === targetStatus) return;
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));
    try {
      await api.patch(`/tasks/${taskId}`, { status: targetStatus });
      showToast(`Task moved to ${targetStatus.replace('_', ' ')}`, 'success');
    } catch {
      fetchTasks();
      showToast('Failed to move task', 'error');
    }
  };

  const openDetail = async (taskId: string) => {
    try { const r = await api.get(`/tasks/${taskId}`); setSelectedTask(r.data.data); } catch {}
  };

  const tasksByStatus = columns.map(col => ({ ...col, tasks: tasks.filter(t => t.status === col.key) }));

  return (
    <DashboardLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div className="page-header">
          <div><h1 className="page-title">Tasks</h1><p className="page-subtitle">{tasks.length} tasks</p></div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <SearchInput value={filters.search} onChange={v => setFilters({ ...filters, search: v })} placeholder="Search tasks..." />
            <select className="select" value={filters.projectId} onChange={e => setFilters({ ...filters, projectId: e.target.value })} style={{ width: 160, fontSize: 13 }}>
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select className="select" value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })} style={{ width: 130, fontSize: 13 }}>
              <option value="">All Priority</option>
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option><option value="URGENT">Urgent</option>
            </select>
            <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button onClick={() => setViewMode('kanban')} style={{ padding: '6px 10px', background: viewMode === 'kanban' ? 'var(--color-primary-bg)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'kanban' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}><Grid3X3 size={16} /></button>
              <button onClick={() => setViewMode('list')} style={{ padding: '6px 10px', background: viewMode === 'list' ? 'var(--color-primary-bg)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}><List size={16} /></button>
            </div>
            {hasRole('FOUNDER', 'ADMIN', 'MANAGER') && <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> New Task</button>}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', gap: 16 }}>{[1,2,3,4].map(i => <Skeleton key={i} height={400} style={{ flex: 1, borderRadius: 'var(--radius-lg)' }} />)}</div>
        ) : viewMode === 'kanban' ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="kanban-board">
              {tasksByStatus.map(col => (
                <SortableContext key={col.key} id={col.key} items={col.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="kanban-column" id={col.key}>
                    <div className="kanban-column-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: col.color }} />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{col.label}</span>
                        <span style={{ background: col.bg, color: col.color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{col.tasks.length}</span>
                      </div>
                    </div>
                    <div style={{ minHeight: 80 }}>
                      {col.tasks.map(task => <SortableCard key={task.id} task={task} onClick={() => openDetail(task.id)} />)}
                    </div>
                  </div>
                </SortableContext>
              ))}
            </div>
          </DndContext>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Project</th><th>Assignees</th><th>Due</th><th>SP</th></tr></thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} onClick={() => openDetail(task.id)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{task.title}</td>
                    <td><Badge variant={task.status?.toLowerCase()?.replace('_', '-')}>{task.status?.replace('_', ' ')}</Badge></td>
                    <td><Badge variant={task.priority?.toLowerCase()}>{task.priority}</Badge></td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{task.project?.name}</td>
                    <td>
                      <div style={{ display: 'flex' }}>
                        {task.assignments?.slice(0, 3).map((a: any, i: number) => <Avatar key={i} firstName={a.user?.firstName} lastName={a.user?.lastName} size={24} style={{ marginLeft: i > 0 ? -6 : 0 }} />)}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
                      {task.dueDate ? dayjs(task.dueDate).format('MMM D') : '—'}
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 600 }}>{task.storyPoints || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Task Detail Modal */}
        {selectedTask && (
          <Modal isOpen={true} onClose={() => setSelectedTask(null)} title={selectedTask.title} maxWidth={640}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {columns.map(col => (
                <button key={col.key} onClick={async () => { await api.patch(`/tasks/${selectedTask.id}`, { status: col.key }); openDetail(selectedTask.id); fetchTasks(); }}
                  style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    border: selectedTask.status === col.key ? `2px solid ${col.color}` : '2px solid transparent',
                    background: selectedTask.status === col.key ? col.bg : 'var(--color-bg)', color: selectedTask.status === col.key ? col.color : 'var(--color-text-secondary)' }}>
                  {col.label}
                </button>
              ))}
            </div>
            {selectedTask.description && <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{selectedTask.description}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              {selectedTask.dueDate && <div><Calendar size={14} style={{ verticalAlign: -2 }} /> Due: {dayjs(selectedTask.dueDate).format('MMM D, YYYY')}</div>}
              {selectedTask.estimatedHours && <div><Clock size={14} style={{ verticalAlign: -2 }} /> Est: {selectedTask.estimatedHours}h</div>}
              {selectedTask.storyPoints && <div><CheckSquare size={14} style={{ verticalAlign: -2 }} /> {selectedTask.storyPoints} story points</div>}
            </div>
            {selectedTask.assignments?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>ASSIGNEES</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedTask.assignments.map((a: any) => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--color-bg)', borderRadius: 'var(--radius-full)', fontSize: 13 }}>
                      <Avatar firstName={a.user?.firstName} lastName={a.user?.lastName} size={24} /> {a.user?.firstName} {a.user?.lastName}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedTask.subtasks?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>SUBTASKS ({selectedTask.subtasks.filter((s: any) => s.isCompleted).length}/{selectedTask.subtasks.length})</div>
                {selectedTask.subtasks.map((st: any) => (
                  <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                    <input type="checkbox" checked={st.isCompleted} readOnly style={{ accentColor: 'var(--color-primary)' }} />
                    <span style={{ fontSize: 13, textDecoration: st.isCompleted ? 'line-through' : 'none', color: st.isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)' }}>{st.title}</span>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        )}

        {/* Create Task Modal */}
        {showCreate && projects.length > 0 && (
          <Modal isOpen={true} onClose={() => setShowCreate(false)} title="Create Task">
            <CreateTaskForm projects={projects} onCreated={() => { setShowCreate(false); fetchTasks(); }} />
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}

function CreateTaskForm({ projects, onCreated }: { projects: any[]; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', projectId: projects[0]?.id || '', dueDate: '', estimatedHours: '', storyPoints: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.projectId) { setError('Title and project required'); return; }
    setLoading(true);
    try {
      await api.post('/tasks', { ...form, estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : undefined, storyPoints: form.storyPoints ? parseInt(form.storyPoints) : undefined });
      showToast('Task created', 'success'); onCreated();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); } finally { setLoading(false); }
  };
  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {error && <div style={{ padding: '10px 14px', background: '#FFE8E5', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: 13 }}>{error}</div>}
      <div><label className="input-label">Project *</label><select className="select" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
      <div><label className="input-label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
      <div><label className="input-label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div><label className="input-label">Priority</label><select className="select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></div>
        <div><label className="input-label">Est. Hours</label><input className="input" type="number" value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: e.target.value })} /></div>
        <div><label className="input-label">Story Pts</label><input className="input" type="number" value={form.storyPoints} onChange={e => setForm({ ...form, storyPoints: e.target.value })} /></div>
      </div>
      <div><label className="input-label">Due Date</label><input className="input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Task'}</button>
      </div>
    </form>
  );
}
