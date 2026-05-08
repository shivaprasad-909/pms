'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, Badge, ProgressBar, Tabs, showToast, KPICard } from '@/components/ui';
import api from '@/lib/api';
import { FolderKanban, CheckSquare, Users, Calendar, Target, Network, GanttChart, Flame, Check, X } from 'lucide-react';
import dayjs from 'dayjs';

const statusColors: Record<string, string> = { PLANNING: '#6C5CE7', ACTIVE: '#00B894', ON_HOLD: '#F39C12', COMPLETED: '#27AE60', PENDING_APPROVAL: '#E17055', ARCHIVED: '#636E72' };
const priColors: Record<string, string> = { LOW: '#636E72', MEDIUM: '#F39C12', HIGH: '#E17055', URGENT: '#D63031' };

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, hasRole } = useAuthStore();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [pRes, tRes, sRes] = await Promise.all([
        api.get(`/projects/${id}`), api.get('/tasks', { params: { projectId: id, limit: 200 } }),
        api.get('/sprints', { params: { projectId: id } }),
      ]);
      setProject(pRes.data.data); setTasks(tRes.data.data || []); setSprints(sRes.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <DashboardLayout><div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} /></DashboardLayout>;
  if (!project) return <DashboardLayout><div className="empty-state"><FolderKanban size={48} /><h3>Project not found</h3></div></DashboardLayout>;

  const taskStats = { total: tasks.length, done: tasks.filter(t => t.status === 'DONE').length, inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length, blocked: tasks.filter(t => t.status === 'BLOCKED').length, overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length };
  const progress = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;

  const submitForApproval = async () => {
    try {
      await api.post(`/approvals/submit/${id}`);
      showToast('Submitted for approval!', 'success'); fetchData();
    } catch { showToast('Failed', 'error'); }
  };
  const approveProject = async () => {
    try {
      await api.post(`/approvals/approve/${id}`);
      showToast('Project approved!', 'success'); fetchData();
    } catch { showToast('Failed', 'error'); }
  };
  const rejectProject = async () => {
    try {
      await api.post(`/approvals/reject/${id}`);
      showToast('Project returned to active', 'info'); fetchData();
    } catch { showToast('Failed', 'error'); }
  };

  return (
    <DashboardLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: (statusColors[project.status] || '#636E72') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderKanban size={22} style={{ color: statusColors[project.status] }} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>{project.name}</h1>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Badge variant={project.status?.toLowerCase()?.replace('_','-')}>{project.status?.replace('_',' ')}</Badge>
                <Badge variant={project.priority?.toLowerCase()}>{project.priority}</Badge>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {project.status === 'ACTIVE' && hasRole('MANAGER', 'ADMIN', 'FOUNDER') && progress >= 80 && (
                <button className="btn btn-primary" onClick={submitForApproval}><Check size={14} /> Submit for Approval</button>
              )}
              {project.status === 'PENDING_APPROVAL' && hasRole('FOUNDER') && (
                <>
                  <button className="btn btn-primary" onClick={approveProject}><Check size={14} /> Approve</button>
                  <button className="btn btn-danger" onClick={rejectProject}><X size={14} /> Reject</button>
                </>
              )}
            </div>
          </div>
          {project.description && <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 8, maxWidth: 600 }}>{project.description}</p>}
        </div>

        <Tabs tabs={[
          { key: 'overview', label: 'Overview' }, { key: 'tasks', label: `Tasks (${tasks.length})` },
          { key: 'gantt', label: 'Timeline' }, { key: 'dependencies', label: 'Dependencies' },
          { key: 'workload', label: 'Workload' }, { key: 'members', label: `Members (${project.members?.length || 0})` },
        ]} active={tab} onChange={setTab} />

        {/* Overview */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                <KPICard title="Total" value={taskStats.total} color="#6C5CE7" />
                <KPICard title="Done" value={taskStats.done} color="#27AE60" />
                <KPICard title="In Progress" value={taskStats.inProgress} color="#0984E3" />
                <KPICard title="Overdue" value={taskStats.overdue} color="#E17055" />
              </div>
              <div className="card" style={{ padding: 20 }}>
                <ProgressBar value={progress} color={statusColors[project.status] || '#6C5CE7'} showPct label="Overall Progress" height={8} />
              </div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                {project.startDate && <div><span style={{ color: 'var(--color-text-secondary)' }}>Start:</span> {dayjs(project.startDate).format('MMM D, YYYY')}</div>}
                {project.endDate && <div><span style={{ color: 'var(--color-text-secondary)' }}>End:</span> {dayjs(project.endDate).format('MMM D, YYYY')}</div>}
                {project.budget && <div><span style={{ color: 'var(--color-text-secondary)' }}>Budget:</span> ${project.budget.toLocaleString()}</div>}
                <div><span style={{ color: 'var(--color-text-secondary)' }}>Created by:</span> {project.createdBy?.firstName} {project.createdBy?.lastName}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        {tab === 'tasks' && (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Assignees</th><th>Due</th><th>SP</th></tr></thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{t.title}</td>
                    <td><Badge variant={t.status?.toLowerCase()?.replace('_','-')}>{t.status?.replace('_',' ')}</Badge></td>
                    <td><Badge variant={t.priority?.toLowerCase()}>{t.priority}</Badge></td>
                    <td><div style={{ display: 'flex' }}>{t.assignments?.slice(0, 3).map((a: any, i: number) => <Avatar key={i} firstName={a.user?.firstName} lastName={a.user?.lastName} size={24} style={{ marginLeft: i > 0 ? -6 : 0 }} />)}</div></td>
                    <td style={{ fontSize: 12, color: t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE' ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>{t.dueDate ? dayjs(t.dueDate).format('MMM D') : '—'}</td>
                    <td style={{ fontSize: 12 }}>{t.storyPoints || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Gantt/Timeline */}
        {tab === 'gantt' && <GanttView tasks={tasks} project={project} />}

        {/* Dependencies */}
        {tab === 'dependencies' && <DependencyGraph tasks={tasks} />}

        {/* Workload Heatmap */}
        {tab === 'workload' && <WorkloadHeatmap tasks={tasks} project={project} />}

        {/* Members */}
        {tab === 'members' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
            {project.members?.map((m: any) => (
              <div key={m.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar firstName={m.user?.firstName} lastName={m.user?.lastName} size={40} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.user?.firstName} {m.user?.lastName}</div>
                  <Badge variant={m.role?.toLowerCase()}>{m.role}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── GANTT VIEW ─────────────────
function GanttView({ tasks, project }: { tasks: any[]; project: any }) {
  const pStart = dayjs(project.startDate || project.createdAt);
  const pEnd = dayjs(project.endDate || dayjs().add(30, 'day'));
  const totalDays = Math.max(pEnd.diff(pStart, 'day'), 30);
  const dayWidth = 24;
  const totalWidth = totalDays * dayWidth;

  const months: { label: string; left: number; width: number }[] = [];
  let cur = pStart.startOf('month');
  while (cur.isBefore(pEnd)) {
    const mEnd = cur.endOf('month');
    const left = Math.max(cur.diff(pStart, 'day'), 0) * dayWidth;
    const width = Math.min(mEnd.diff(pStart, 'day'), totalDays) * dayWidth - left;
    months.push({ label: cur.format('MMM YYYY'), left, width });
    cur = cur.add(1, 'month');
  }

  const tasksWithDates = tasks.filter(t => t.startDate || t.dueDate);

  return (
    <div className="card" style={{ padding: 0, overflow: 'auto' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-light)' }}>
        <h3 style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><GanttChart size={16} /> Timeline / Gantt View</h3>
      </div>
      <div style={{ display: 'flex' }}>
        {/* Task names */}
        <div style={{ minWidth: 220, borderRight: '1px solid var(--color-border-light)', flexShrink: 0 }}>
          <div style={{ height: 36, borderBottom: '1px solid var(--color-border-light)', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)' }}>TASK</div>
          {tasksWithDates.map(t => (
            <div key={t.id} style={{ height: 36, borderBottom: '1px solid var(--color-border-light)', padding: '8px 12px', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: priColors[t.priority] || '#636E72', display: 'inline-block', marginRight: 6 }} />
              {t.title}
            </div>
          ))}
        </div>
        {/* Gantt area */}
        <div style={{ overflow: 'auto', flex: 1 }}>
          <div style={{ width: totalWidth, minWidth: '100%' }}>
            {/* Month header */}
            <div style={{ height: 36, borderBottom: '1px solid var(--color-border-light)', position: 'relative' }}>
              {months.map((m, i) => (
                <div key={i} style={{ position: 'absolute', left: m.left, width: m.width, height: '100%', borderRight: '1px solid var(--color-border-light)', padding: '8px 6px', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)' }}>{m.label}</div>
              ))}
            </div>
            {/* Task bars */}
            {tasksWithDates.map(t => {
              const tStart = dayjs(t.startDate || t.createdAt);
              const tEnd = dayjs(t.dueDate || tStart.add(3, 'day'));
              const left = Math.max(tStart.diff(pStart, 'day'), 0) * dayWidth;
              const width = Math.max(tEnd.diff(tStart, 'day'), 1) * dayWidth;
              const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE';
              const barColor = t.status === 'DONE' ? '#27AE60' : isOverdue ? '#E17055' : '#6C5CE7';
              return (
                <div key={t.id} style={{ height: 36, borderBottom: '1px solid var(--color-border-light)', position: 'relative' }}>
                  <div title={`${t.title} (${tStart.format('MMM D')} - ${tEnd.format('MMM D')})`} style={{
                    position: 'absolute', left, width: Math.max(width, 20), top: 8, height: 20,
                    background: barColor + '30', border: `1px solid ${barColor}`, borderRadius: 4,
                    display: 'flex', alignItems: 'center', paddingLeft: 6, fontSize: 10, fontWeight: 500,
                    color: barColor, overflow: 'hidden', whiteSpace: 'nowrap', cursor: 'default',
                  }}>
                    {width > 60 ? t.title.slice(0, 20) : ''}
                  </div>
                  {/* Today marker */}
                  {(() => {
                    const todayLeft = dayjs().diff(pStart, 'day') * dayWidth;
                    return todayLeft > 0 && todayLeft < totalWidth ? (
                      <div style={{ position: 'absolute', left: todayLeft, top: 0, width: 1, height: '100%', background: '#E17055', opacity: 0.3 }} />
                    ) : null;
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {tasksWithDates.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Add start/due dates to tasks to see the timeline</div>}
    </div>
  );
}

// ─── DEPENDENCY GRAPH ─────────────────
function DependencyGraph({ tasks }: { tasks: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    // Layout: position tasks in a grid, with deps shown as arrows
    const pos = new Map<string, { x: number; y: number }>();
    const cols: Record<string, any[]> = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [], BLOCKED: [] };
    tasks.forEach(t => { (cols[t.status] || cols.TODO).push(t); });
    const colOrder = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'];
    colOrder.forEach((col, ci) => {
      (cols[col] || []).forEach((t, ri) => {
        pos.set(t.id, { x: 100 + ci * 200, y: 60 + ri * 70 });
      });
    });
    setPositions(pos);
  }, [tasks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || positions.size === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dependency arrows
    tasks.forEach(task => {
      task.dependencies?.forEach((dep: any) => {
        const from = positions.get(dep.dependencyTaskId || dep.dependencyTask?.id);
        const to = positions.get(task.id);
        if (from && to) {
          ctx.beginPath();
          ctx.strokeStyle = '#E17055';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.moveTo(from.x + 70, from.y + 20);
          ctx.lineTo(to.x, to.y + 20);
          ctx.stroke();
          // Arrowhead
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.fillStyle = '#E17055';
          ctx.moveTo(to.x, to.y + 20);
          ctx.lineTo(to.x - 8, to.y + 15);
          ctx.lineTo(to.x - 8, to.y + 25);
          ctx.fill();
        }
      });
    });

    // Draw task nodes
    tasks.forEach(task => {
      const p = positions.get(task.id);
      if (!p) return;
      const hasDeps = task.dependencies?.length > 0;
      ctx.fillStyle = task.status === 'DONE' ? '#E8FFF5' : hasDeps ? '#FFE8E5' : '#F0EEFF';
      ctx.strokeStyle = task.status === 'DONE' ? '#27AE60' : hasDeps ? '#E17055' : '#6C5CE7';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      const w = 140, h = 40, r = 6;
      ctx.beginPath();
      ctx.moveTo(p.x + r, p.y); ctx.lineTo(p.x + w - r, p.y); ctx.quadraticCurveTo(p.x + w, p.y, p.x + w, p.y + r);
      ctx.lineTo(p.x + w, p.y + h - r); ctx.quadraticCurveTo(p.x + w, p.y + h, p.x + w - r, p.y + h);
      ctx.lineTo(p.x + r, p.y + h); ctx.quadraticCurveTo(p.x, p.y + h, p.x, p.y + h - r);
      ctx.lineTo(p.x, p.y + r); ctx.quadraticCurveTo(p.x, p.y, p.x + r, p.y);
      ctx.fill(); ctx.stroke();
      // Task text
      ctx.fillStyle = '#333';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(task.title.slice(0, 18), p.x + 6, p.y + 16);
      ctx.fillStyle = '#999';
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText(task.status.replace('_', ' '), p.x + 6, p.y + 30);
    });
  }, [positions, tasks]);

  const maxX = Math.max(...Array.from(positions.values()).map(p => p.x), 800) + 200;
  const maxY = Math.max(...Array.from(positions.values()).map(p => p.y), 300) + 100;

  return (
    <div className="card" style={{ padding: 0, overflow: 'auto' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-light)' }}>
        <h3 style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Network size={16} /> Dependency Graph
        </h3>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: 'var(--color-text-muted)' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#F0EEFF', border: '1px solid #6C5CE7', marginRight: 4 }} /> Normal</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#FFE8E5', border: '1px solid #E17055', marginRight: 4 }} /> Has Dependencies</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#E8FFF5', border: '1px solid #27AE60', marginRight: 4 }} /> Done</span>
        </div>
      </div>
      <canvas ref={canvasRef} width={maxX} height={maxY} style={{ display: 'block' }} />
      {tasks.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>No tasks to visualize</div>}
    </div>
  );
}

// ─── WORKLOAD HEATMAP ─────────────────
function WorkloadHeatmap({ tasks, project }: { tasks: any[]; project: any }) {
  // Get unique assignees
  const memberMap = new Map<string, { name: string; id: string }>();
  tasks.forEach(t => t.assignments?.forEach((a: any) => {
    if (a.user) memberMap.set(a.user.id, { name: `${a.user.firstName} ${a.user.lastName}`, id: a.user.id });
  }));
  const members = Array.from(memberMap.values());

  // Build week columns
  const start = dayjs(project.startDate || project.createdAt);
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const w = start.add(i, 'week');
    return { label: w.format('MMM D'), start: w, end: w.add(6, 'day') };
  });

  // Count tasks per member per week
  const getCellValue = (memberId: string, weekStart: any, weekEnd: any) => {
    return tasks.filter(t => {
      const assigned = t.assignments?.some((a: any) => a.user?.id === memberId);
      if (!assigned) return false;
      const due = t.dueDate ? dayjs(t.dueDate) : null;
      return due && due.isAfter(weekStart) && due.isBefore(weekEnd.add(1, 'day'));
    }).length;
  };

  const getColor = (val: number) => {
    if (val === 0) return 'var(--color-bg)';
    if (val <= 2) return '#E8FFF5';
    if (val <= 4) return '#B2F5EA';
    if (val <= 6) return '#F6E05E';
    return '#FC8181';
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'auto' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-light)' }}>
        <h3 style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><Flame size={16} /> Workload Heatmap</h3>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--color-text-muted)' }}>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: '#E8FFF5', marginRight: 4 }} /> Light</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: '#B2F5EA', marginRight: 4 }} /> Normal</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: '#F6E05E', marginRight: 4 }} /> Heavy</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: '#FC8181', marginRight: 4 }} /> Overloaded</span>
        </div>
      </div>
      <table className="table" style={{ margin: 0 }}>
        <thead>
          <tr>
            <th style={{ minWidth: 140 }}>Member</th>
            {weeks.map((w, i) => <th key={i} style={{ textAlign: 'center', fontSize: 11 }}>{w.label}</th>)}
            <th style={{ textAlign: 'center' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {members.map(m => {
            const total = tasks.filter(t => t.assignments?.some((a: any) => a.user?.id === m.id)).length;
            return (
              <tr key={m.id}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar firstName={m.name.split(' ')[0]} lastName={m.name.split(' ')[1]} size={24} /><span style={{ fontSize: 13 }}>{m.name}</span></div></td>
                {weeks.map((w, i) => {
                  const val = getCellValue(m.id, w.start, w.end);
                  return <td key={i} style={{ textAlign: 'center', background: getColor(val), fontWeight: val > 0 ? 600 : 400, fontSize: 13 }}>{val || ''}</td>;
                })}
                <td style={{ textAlign: 'center', fontWeight: 700 }}>{total}</td>
              </tr>
            );
          })}
          {members.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No team members assigned</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
