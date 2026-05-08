'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import dayjs from 'dayjs';

const priorityColors: Record<string, string> = { LOW: '#636E72', MEDIUM: '#F39C12', HIGH: '#E17055', URGENT: '#D63031' };

export default function CalendarPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [current, setCurrent] = useState(dayjs());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/tasks', { params: { limit: 200 } });
        setTasks((r.data.data || []).filter((t: any) => t.dueDate));
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const startOfMonth = current.startOf('month');
  const startDay = startOfMonth.day();
  const daysInMonth = current.daysInMonth();
  const today = dayjs().format('YYYY-MM-DD');

  const days: { date: string; day: number; isToday: boolean; tasks: any[] }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = current.date(d).format('YYYY-MM-DD');
    days.push({
      date, day: d, isToday: date === today,
      tasks: tasks.filter(t => dayjs(t.dueDate).format('YYYY-MM-DD') === date),
    });
  }

  return (
    <DashboardLayout>
      <div style={{ animation: 'fadeIn 0.4s ease' }}>
        <div className="page-header">
          <div><h1 className="page-title">Calendar</h1><p className="page-subtitle">Task deadlines</p></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrent(c => c.subtract(1, 'month'))}><ChevronLeft size={18} /></button>
            <span style={{ fontWeight: 600, fontSize: 16, minWidth: 150, textAlign: 'center' }}>{current.format('MMMM YYYY')}</span>
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrent(c => c.add(1, 'month'))}><ChevronRight size={18} /></button>
            <button className="btn btn-outline btn-sm" onClick={() => setCurrent(dayjs())}>Today</button>
          </div>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 500, borderRadius: 'var(--radius-lg)' }} />
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* Day Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--color-border-light)' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ padding: '10px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', background: 'var(--color-bg)' }}>{d}</div>
              ))}
            </div>
            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {/* Empty cells for offset */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`e${i}`} style={{ minHeight: 100, borderRight: '1px solid var(--color-border-light)', borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-bg)' }} />
              ))}
              {days.map(d => (
                <div key={d.date} style={{
                  minHeight: 100, padding: 6, borderRight: '1px solid var(--color-border-light)', borderBottom: '1px solid var(--color-border-light)',
                  background: d.isToday ? 'var(--color-primary-bg)' : 'var(--color-surface)',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: d.isToday ? 700 : 400, marginBottom: 4,
                    background: d.isToday ? 'var(--color-primary)' : 'transparent',
                    color: d.isToday ? 'white' : 'var(--color-text)',
                  }}>{d.day}</div>
                  {d.tasks.slice(0, 3).map(t => (
                    <div key={t.id} style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 3, marginBottom: 2,
                      background: (priorityColors[t.priority] || '#636E72') + '18',
                      color: priorityColors[t.priority] || '#636E72',
                      fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{t.title}</div>
                  ))}
                  {d.tasks.length > 3 && <div style={{ fontSize: 10, color: 'var(--color-text-muted)', paddingLeft: 6 }}>+{d.tasks.length - 3} more</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
