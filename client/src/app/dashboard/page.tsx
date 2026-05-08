'use client';

// ============================================
// Dashboard Page — Role-Based Analytics
// ============================================

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import {
  BarChart3, Users, FolderKanban, CheckSquare, Clock, TrendingUp,
  AlertTriangle, Zap, ArrowUpRight, ArrowDownRight, Target, Activity,
  Calendar, ChevronRight, MoreHorizontal, Circle
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

// ── Stat Card ─────────────────

function StatCard({ label, value, icon: Icon, color, trend, trendValue }: {
  label: string; value: string | number; icon: any; color: string;
  trend?: 'up' | 'down'; trendValue?: string;
}) {
  return (
    <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -12, right: -12, width: 80, height: 80, borderRadius: '50%', background: color, opacity: 0.07 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: trend === 'up' ? 'var(--color-success)' : 'var(--color-error)' }}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── Progress Bar ─────────────────

function ProgressBar({ value, color, height = 6 }: { value: number; color: string; height?: number }) {
  return (
    <div style={{ width: '100%', height, background: 'var(--color-bg)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
      <div style={{
        width: `${Math.min(value, 100)}%`, height: '100%', background: color,
        borderRadius: 'var(--radius-full)', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
    </div>
  );
}

// ── Mini Bar Chart (CSS-only) ─────────────────

function MiniBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%', minWidth: 8, height: `${(d.value / max) * 50}px`, minHeight: 2,
            background: color, borderRadius: '3px 3px 0 0', opacity: 0.7 + (0.3 * d.value / max),
            transition: 'height 0.5s ease',
          }} />
          <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Activity Item ─────────────────

function ActivityItem({ log }: { log: any }) {
  const actionIcons: Record<string, any> = {
    CREATED: { icon: Zap, color: '#6C5CE7' },
    UPDATED: { icon: Activity, color: '#0984E3' },
    STATUS_CHANGED: { icon: CheckSquare, color: '#00B894' },
    ASSIGNED: { icon: Users, color: '#F39C12' },
    COMMENTED: { icon: Activity, color: '#74B9FF' },
    LOGGED_TIME: { icon: Clock, color: '#E17055' },
  };
  const meta = actionIcons[log.action] || { icon: Circle, color: '#636E72' };
  const Icon = meta.icon;

  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', background: meta.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={14} style={{ color: meta.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600 }}>{log.user?.firstName} {log.user?.lastName}</span>
          <span style={{ color: 'var(--color-text-secondary)' }}> {log.action.toLowerCase().replace('_', ' ')}</span>
          {log.project && <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}> in {log.project.name}</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{dayjs(log.createdAt).fromNow()}</div>
      </div>
    </div>
  );
}

// ── Project Card ─────────────────

function ProjectCard({ project }: { project: any }) {
  const statusColors: Record<string, string> = {
    ACTIVE: '#00B894', PLANNING: '#6C5CE7', ON_HOLD: '#F39C12', COMPLETED: '#27AE60', ARCHIVED: '#636E72',
  };
  return (
    <div className="card" style={{ padding: 16, cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{project.name}</div>
          <span className={`badge badge-${project.status?.toLowerCase()?.replace('_', '-')}`}>{project.status?.replace('_', ' ')}</span>
        </div>
        <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, padding: 0 }}>
          <MoreHorizontal size={14} />
        </button>
      </div>
      <ProgressBar value={project.progress || 0} color={statusColors[project.status] || '#636E72'} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--color-text-secondary)' }}>
        <span>{project.progress || 0}% complete</span>
        <span>{project._count?.tasks || 0} tasks</span>
      </div>
      {project.members?.length > 0 && (
        <div style={{ display: 'flex', marginTop: 10, marginLeft: 4 }}>
          {project.members.slice(0, 5).map((m: any, i: number) => (
            <div key={i} style={{
              width: 26, height: 26, borderRadius: '50%', border: '2px solid white',
              background: `hsl(${(m.user?.firstName?.charCodeAt(0) * 37) % 360}, 60%, 60%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: 'white', marginLeft: i > 0 ? -8 : 0,
            }}>
              {m.user?.firstName?.[0]}{m.user?.lastName?.[0]}
            </div>
          ))}
          {project.members.length > 5 && (
            <div style={{ width: 26, height: 26, borderRadius: '50%', border: '2px solid white', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, marginLeft: -8, color: 'var(--color-text-secondary)' }}>
              +{project.members.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '20px 0' }}>
          <div className="skeleton" style={{ width: 300, height: 32, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 200, height: 18, marginBottom: 32 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = data?.stats || {};
  const isFounder = data?.type === 'founder';
  const isManager = data?.type === 'manager';
  const isDeveloper = data?.type === 'developer';

  // Status distribution for donut-like display
  const tasksByStatus = data?.tasksByStatus || {};
  const statusItems = [
    { label: 'To Do', key: 'TODO', color: '#636E72' },
    { label: 'In Progress', key: 'IN_PROGRESS', color: '#6C5CE7' },
    { label: 'In Review', key: 'IN_REVIEW', color: '#F39C12' },
    { label: 'Done', key: 'DONE', color: '#00B894' },
    { label: 'Blocked', key: 'BLOCKED', color: '#E17055' },
  ];

  return (
    <DashboardLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text)' }}>
            {greeting()}, {user?.firstName} 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            {isFounder && "Here's your organization overview"}
            {isManager && "Here's an overview of your projects"}
            {isDeveloper && "Here are your tasks and progress"}
          </p>
        </div>

        {/* ── FOUNDER / ADMIN DASHBOARD ────────────── */}
        {isFounder && (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              <StatCard label="Total Projects" value={stats.projects || 0} icon={FolderKanban} color="#6C5CE7" />
              <StatCard label="Total Tasks" value={stats.tasks || 0} icon={CheckSquare} color="#00B894" />
              <StatCard label="Team Members" value={stats.users || 0} icon={Users} color="#0984E3" />
              <StatCard label="Active Sprints" value={stats.activeSprints || 0} icon={Target} color="#F39C12" />
              <StatCard label="Overdue Tasks" value={stats.overdueTasks || 0} icon={AlertTriangle} color="#E17055"
                trend={stats.overdueTasks > 0 ? 'down' : undefined} trendValue={stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : undefined} />
              <StatCard label="Completion Rate" value={`${stats.completionRate || 0}%`} icon={TrendingUp} color="#27AE60"
                trend={stats.completionRate >= 50 ? 'up' : stats.completionRate > 0 ? 'down' : undefined}
                trendValue={stats.completionRate >= 50 ? 'On track' : stats.completionRate > 0 ? 'Needs attention' : undefined} />
              <StatCard label="Hours Logged" value={stats.totalHoursLogged || 0} icon={Clock} color="#9B59B6" />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              {/* Task Status Distribution */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BarChart3 size={18} style={{ color: 'var(--color-primary)' }} /> Task Distribution
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {statusItems.map(s => {
                    const count = tasksByStatus[s.key] || 0;
                    const total = Object.values(tasksByStatus).reduce((sum: number, v: any) => sum + (v || 0), 0) as number;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={s.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                            {s.label}
                          </span>
                          <span style={{ fontWeight: 600 }}>{count} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>({pct}%)</span></span>
                        </div>
                        <ProgressBar value={pct} color={s.color} height={4} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Projects by Status */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FolderKanban size={18} style={{ color: 'var(--color-primary)' }} /> Projects by Status
                </div>
                {data?.projectsByStatus && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {Object.entries(data.projectsByStatus).map(([status, count]: [string, any]) => (
                      <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className={`badge badge-${status.toLowerCase().replace('_', '-')}`}>{status.replace('_', ' ')}</span>
                        <div style={{ flex: 1 }}>
                          <ProgressBar value={(count / Math.max(stats.projects, 1)) * 100} color="var(--color-primary)" height={4} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14, minWidth: 24, textAlign: 'right' }}>{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pending Approvals + Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Pending Approvals */}
              {data?.pendingApprovals?.length > 0 && (
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-accent)' }}>
                    <AlertTriangle size={18} /> Pending Approvals ({data.pendingApprovals.length})
                  </div>
                  {data.pendingApprovals.map((p: any) => (
                    <div key={p.id} className="card" style={{ padding: 14, marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        Submitted by {p.createdBy?.firstName} {p.createdBy?.lastName} · {p._count?.tasks} tasks
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button className="btn btn-primary btn-sm">Approve</button>
                        <button className="btn btn-ghost btn-sm">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Activity */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={18} style={{ color: 'var(--color-primary)' }} /> Recent Activity
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {(data?.recentActivity || []).map((log: any) => (
                    <ActivityItem key={log.id} log={log} />
                  ))}
                  {(!data?.recentActivity || data.recentActivity.length === 0) && (
                    <div style={{ textAlign: 'center', padding: 30, color: 'var(--color-text-muted)', fontSize: 13 }}>No recent activity</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── MANAGER DASHBOARD ────────────── */}
        {isManager && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              <StatCard label="My Projects" value={stats.projects || 0} icon={FolderKanban} color="#6C5CE7" />
              <StatCard label="Total Tasks" value={stats.tasks || 0} icon={CheckSquare} color="#00B894" />
              <StatCard label="Overdue" value={stats.overdueTasks || 0} icon={AlertTriangle} color="#E17055" />
              <StatCard label="Active Sprints" value={stats.activeSprints || 0} icon={Target} color="#F39C12" />
              <StatCard label="Completion Rate" value={`${stats.completionRate || 0}%`} icon={TrendingUp} color="#27AE60" />
              <StatCard label="Pending Reviews" value={stats.pendingReviews || 0} icon={Clock} color="#9B59B6" />
            </div>

            {/* Projects Grid */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Your Projects</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {(data?.projects || []).map((p: any) => <ProjectCard key={p.id} project={p} />)}
              </div>
            </div>

            {/* Review Tasks + Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {data?.reviewTasks?.length > 0 && (
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>🔍 Tasks Awaiting Review</div>
                  {data.reviewTasks.map((t: any) => (
                    <div key={t.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border-light)', fontSize: 13 }}>
                      <div style={{ fontWeight: 500 }}>{t.title}</div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: 12, marginTop: 2 }}>
                        {t.project?.name} · {t.assignments?.map((a: any) => a.user?.firstName).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Recent Activity</div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {(data?.recentActivity || []).map((log: any) => <ActivityItem key={log.id} log={log} />)}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── DEVELOPER DASHBOARD ────────────── */}
        {isDeveloper && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              <StatCard label="My Tasks" value={stats.totalTasks || 0} icon={CheckSquare} color="#6C5CE7" />
              <StatCard label="To Do" value={stats.todo || 0} icon={Circle} color="#636E72" />
              <StatCard label="In Progress" value={stats.inProgress || 0} icon={Zap} color="#0984E3" />
              <StatCard label="In Review" value={stats.inReview || 0} icon={Clock} color="#F39C12" />
              <StatCard label="Completed" value={stats.done || 0} icon={CheckSquare} color="#00B894" />
              <StatCard label="Overdue" value={stats.overdueTasks || 0} icon={AlertTriangle} color="#E17055" />
              <StatCard label="Hours This Week" value={stats.hoursThisWeek || 0} icon={Clock} color="#9B59B6" />
            </div>

            {/* My Tasks List */}
            <div className="card" style={{ padding: 20, marginBottom: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>My Active Tasks</div>
              {(data?.tasks || []).filter((t: any) => t.status !== 'DONE').slice(0, 10).map((task: any) => (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                  borderBottom: '1px solid var(--color-border-light)',
                }}>
                  <span className={`badge badge-${task.priority?.toLowerCase()}`} style={{ minWidth: 60, justifyContent: 'center' }}>
                    {task.priority}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{task.project?.name}</div>
                  </div>
                  <span className={`badge badge-${task.status?.toLowerCase()?.replace('_', '-')}`}>{task.status?.replace('_', ' ')}</span>
                  {task.dueDate && (
                    <span style={{
                      fontSize: 12, color: new Date(task.dueDate) < new Date() ? 'var(--color-error)' : 'var(--color-text-secondary)',
                      fontWeight: new Date(task.dueDate) < new Date() ? 600 : 400,
                    }}>
                      {dayjs(task.dueDate).format('MMM D')}
                    </span>
                  )}
                </div>
              ))}
              {(!data?.tasks || data.tasks.filter((t: any) => t.status !== 'DONE').length === 0) && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>🎉 All caught up!</div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>My Activity</div>
              {(data?.recentActivity || []).map((log: any) => <ActivityItem key={log.id} log={log} />)}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
