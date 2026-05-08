'use client';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { KPICard, Modal, showToast } from '@/components/ui';
import api from '@/lib/api';
import { Clock, Plus, X, Calendar, Play, Pause, Square, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';

export default function TimeTrackingPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [form, setForm] = useState({ taskId: '', hours: '', description: '', logDate: dayjs().format('YYYY-MM-DD') });
  const [tasks, setTasks] = useState<any[]>([]);

  // Active Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timerTask, setTimerTask] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = async () => {
    try { const r = await api.get('/time-logs'); setLogs(r.data.data || []); } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetchLogs();
    api.get('/tasks', { params: { limit: 100 } }).then(r => setTasks(r.data.data || [])).catch(() => {});
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerActive]);

  const startTimer = () => {
    if (!timerTask) { showToast('Select a task first', 'error'); return; }
    setTimerActive(true);
    setTimerStart(new Date());
    setTimerSeconds(0);
  };

  const stopTimer = async () => {
    setTimerActive(false);
    const hours = Math.round((timerSeconds / 3600) * 100) / 100;
    if (hours > 0 && timerTask) {
      try {
        await api.post('/time-logs', { taskId: timerTask, hours, description: 'Timer entry', logDate: new Date().toISOString() });
        showToast(`Logged ${hours}h`, 'success');
        fetchLogs();
      } catch { showToast('Failed to log', 'error'); }
    }
    setTimerSeconds(0);
    setTimerStart(null);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const totalHours = logs.reduce((s, l) => s + l.hours, 0);
  const todayHours = logs.filter(l => dayjs(l.logDate).isSame(dayjs(), 'day')).reduce((s, l) => s + l.hours, 0);
  const weekHours = logs.filter(l => dayjs(l.logDate).isAfter(dayjs().startOf('week'))).reduce((s, l) => s + l.hours, 0);

  // Weekly chart data
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = dayjs().startOf('week').add(i, 'day');
    const hrs = logs.filter(l => dayjs(l.logDate).isSame(d, 'day')).reduce((s, l) => s + l.hours, 0);
    return { day: d.format('ddd'), hours: Math.round(hrs * 10) / 10 };
  });

  const exportCSV = async () => {
    try {
      const r = await api.get('/export/time-logs-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'time_logs.csv'; a.click();
      showToast('Exported!', 'success');
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/time-logs', { ...form, hours: parseFloat(form.hours) });
      setShowLog(false); setForm({ taskId: '', hours: '', description: '', logDate: dayjs().format('YYYY-MM-DD') });
      fetchLogs(); showToast('Time logged', 'success');
    } catch { showToast('Failed', 'error'); }
  };

  return (
    <DashboardLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div className="page-header">
          <div><h1 className="page-title">Time Tracking</h1><p className="page-subtitle">{logs.length} entries</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={exportCSV}><Download size={14} /> Export</button>
            <button className="btn btn-primary" onClick={() => setShowLog(true)}><Plus size={16} /> Log Time</button>
          </div>
        </div>

        {/* Active Timer */}
        <div className="card" style={{ padding: 20, marginBottom: 20, background: timerActive ? 'linear-gradient(135deg, #6C5CE710, #A29BFE10)' : undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>Active Timer</div>
              <select className="select" value={timerTask} onChange={e => setTimerTask(e.target.value)} style={{ maxWidth: 300, fontSize: 13 }}>
                <option value="">Select task...</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'monospace', color: timerActive ? 'var(--color-primary)' : 'var(--color-text)', letterSpacing: 2, minWidth: 180, textAlign: 'center' }}>
              {formatTime(timerSeconds)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {!timerActive ? (
                <button className="btn btn-primary" onClick={startTimer} style={{ borderRadius: '50%', width: 44, height: 44, padding: 0 }}><Play size={18} /></button>
              ) : (
                <button className="btn btn-danger" onClick={stopTimer} style={{ borderRadius: '50%', width: 44, height: 44, padding: 0 }}><Square size={16} /></button>
              )}
            </div>
          </div>
        </div>

        {/* Stats + Weekly Chart */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: 14, marginBottom: 24 }}>
          <KPICard title="Today" value={Math.round(todayHours * 10) / 10} suffix="h" icon={<Clock size={18} style={{ color: '#6C5CE7' }} />} color="#6C5CE7" />
          <KPICard title="This Week" value={Math.round(weekHours * 10) / 10} suffix="h" icon={<Calendar size={18} style={{ color: '#00B894' }} />} color="#00B894" />
          <KPICard title="Total" value={Math.round(totalHours * 10) / 10} suffix="h" icon={<Clock size={18} style={{ color: '#F39C12' }} />} color="#F39C12" />
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>THIS WEEK</div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={weekDays}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="hours" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Logs Table */}
        {loading ? <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} /> : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Date</th><th>Task</th><th>Project</th><th>Hours</th><th>Description</th><th>User</th></tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 13 }}>{dayjs(log.logDate).format('MMM D, YYYY')}</td>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{log.task?.title || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{log.task?.project?.name || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{log.hours}h</td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{log.description || '—'}</td>
                    <td style={{ fontSize: 13 }}>{log.user?.firstName} {log.user?.lastName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal isOpen={showLog} onClose={() => setShowLog(false)} title="Log Time">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="input-label">Task</label><select className="select" value={form.taskId} onChange={e => setForm({ ...form, taskId: e.target.value })}><option value="">Select...</option>{tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label className="input-label">Hours *</label><input className="input" type="number" step="0.25" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} /></div>
              <div><label className="input-label">Date</label><input className="input" type="date" value={form.logDate} onChange={e => setForm({ ...form, logDate: e.target.value })} /></div>
            </div>
            <div><label className="input-label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button type="submit" className="btn btn-primary">Log Time</button></div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
