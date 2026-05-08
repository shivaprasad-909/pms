'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { KPICard, ProgressBar, Tabs, showToast } from '@/components/ui';
import { BarChart3, TrendingUp, Users, Clock, FolderKanban, CheckSquare, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

const COLORS = ['#636E72', '#6C5CE7', '#F39C12', '#00B894', '#E17055'];

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    (async () => {
      try {
        const [d, p] = await Promise.all([api.get('/analytics/dashboard'), api.get('/projects')]);
        setData({ dash: d.data.data, projects: p.data.data || [] });
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const exportCSV = async (type: string) => {
    try {
      const r = await api.get(`/export/${type}-csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href = url; a.download = `${type}.csv`; a.click();
      showToast('CSV exported!', 'success');
    } catch { showToast('Export failed', 'error'); }
  };

  if (loading) return <DashboardLayout><div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} /></DashboardLayout>;

  const s = data?.dash?.stats || {};
  const projects = data?.projects || [];
  const tbs = data?.dash?.tasksByStatus || {};

  const pieData = [
    { name: 'To Do', value: tbs.TODO || 0 },
    { name: 'In Progress', value: tbs.IN_PROGRESS || 0 },
    { name: 'In Review', value: tbs.IN_REVIEW || 0 },
    { name: 'Done', value: tbs.DONE || 0 },
    { name: 'Blocked', value: tbs.BLOCKED || 0 },
  ].filter(d => d.value > 0);

  const projectBars = projects.slice(0, 8).map((p: any) => ({ name: p.name?.slice(0, 15), progress: p.progress || 0, tasks: p._count?.tasks || 0 }));

  return (
    <DashboardLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div className="page-header">
          <div><h1 className="page-title">Reports & Analytics</h1><p className="page-subtitle">Organization insights</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={() => exportCSV('activity')}><Download size={14} /> Activity CSV</button>
            <button className="btn btn-outline btn-sm" onClick={() => exportCSV('tasks')}><Download size={14} /> Tasks CSV</button>
            <button className="btn btn-outline btn-sm" onClick={() => exportCSV('time-logs')}><Download size={14} /> Time CSV</button>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
          <KPICard title="Projects" value={s.projects || projects.length} icon={<FolderKanban size={18} style={{ color: '#6C5CE7' }} />} color="#6C5CE7" />
          <KPICard title="Tasks" value={s.tasks || 0} icon={<CheckSquare size={18} style={{ color: '#00B894' }} />} color="#00B894" />
          <KPICard title="Members" value={s.users || 0} icon={<Users size={18} style={{ color: '#0984E3' }} />} color="#0984E3" />
          <KPICard title="Hours Logged" value={Math.round(s.totalHoursLogged || 0)} icon={<Clock size={18} style={{ color: '#F39C12' }} />} color="#F39C12" />
          <KPICard title="Completion" value={`${s.completionRate || 0}%`} icon={<TrendingUp size={18} style={{ color: '#27AE60' }} />} color="#27AE60" />
        </div>

        <Tabs tabs={[{ key: 'overview', label: 'Overview' }, { key: 'projects', label: 'Projects' }, { key: 'workload', label: 'Workload' }]} active={tab} onChange={setTab} />

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Task Distribution Pie */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}><BarChart3 size={16} style={{ verticalAlign: -2, marginRight: 6 }} />Task Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Project Progress Bars */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}><FolderKanban size={16} style={{ verticalAlign: -2, marginRight: 6 }} />Project Progress</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={projectBars} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#6C5CE7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === 'projects' && (
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>All Projects</h3>
            {projects.map((p: any) => (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <ProgressBar label={p.name} value={p.progress || 0} color={p.status === 'COMPLETED' ? '#27AE60' : '#6C5CE7'} showPct />
              </div>
            ))}
          </div>
        )}

        {tab === 'workload' && data?.dash?.workload && (
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Team Workload</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.dash.workload}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis dataKey="firstName" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalTasks" name="Tasks" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hoursLogged" name="Hours" fill="#00B894" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
