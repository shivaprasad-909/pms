'use client';

// ============================================
// Login Page — Premium Auth UI
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, setup, isAuthenticated, isLoading } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'setup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '', password: '',
    firstName: '', lastName: '', organizationName: '',
  });

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await setup({
          organizationName: form.organizationName,
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
        });
      }
      router.push('/dashboard');
    } catch (err: any) {
      if (err.message === 'Network Error') {
        setError('Cannot connect to server. Ensure the backend is running.');
      } else if (err.message.includes('500') || err.message === 'Login failed') {
        setError('Server error occurred. Please ensure your database is synced (npx prisma db push).');
      } else {
        setError(err.message || 'Something went wrong');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #1E1E2E 0%, #2D1B69 50%, #1E1E2E 100%)',
    }}>
      {/* Left — Branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Animated background shapes */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(108,92,231,0.08)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(0,184,148,0.06)', filter: 'blur(40px)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 900, color: 'white',
            }}>P</div>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>PMS</span>
          </div>

          <h1 style={{ fontSize: 42, fontWeight: 800, color: 'white', lineHeight: 1.2, maxWidth: 500 }}>
            Enterprise Project
            <br />
            <span style={{ background: 'linear-gradient(135deg, #A29BFE, #55EFC4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Management System
            </span>
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 20, maxWidth: 420, lineHeight: 1.7 }}>
            Streamline workflows, track progress, and collaborate with your team in real-time.
            Built for teams that move fast.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 40 }}>
            {[
              { text: 'Role-based dashboards & analytics', color: '#6C5CE7' },
              { text: 'Kanban boards with drag-and-drop', color: '#00B894' },
              { text: 'Sprint planning & velocity tracking', color: '#F39C12' },
              { text: 'Real-time chat & notifications', color: '#74B9FF' },
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: feature.color }} />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Auth Form */}
      <div style={{
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'white', borderRadius: '24px 0 0 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 360, padding: '40px 0' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text)' }}>
              {mode === 'login' ? 'Welcome back' : 'Get started'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 6 }}>
              {mode === 'login' ? 'Sign in to your account' : 'Create your organization'}
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', background: '#FFE8E5', color: 'var(--color-error)',
              borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 20, fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'setup' && (
              <>
                <div>
                  <label className="input-label">Organization Name</label>
                  <input className="input" placeholder="Acme Corp" value={form.organizationName} onChange={e => setForm({ ...form, organizationName: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="input-label">First Name</label>
                    <input className="input" placeholder="John" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Last Name</label>
                    <input className="input" placeholder="Doe" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)',
                }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading} style={{
              width: '100%', marginTop: 8, fontSize: 15, fontWeight: 600,
              background: 'linear-gradient(135deg, #6C5CE7, #5A4BD1)',
            }}>
              {isLoading ? (
                <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Organization'} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={() => { setMode(mode === 'login' ? 'setup' : 'login'); setError(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>
              {mode === 'login' ? "Don't have an account? Set up organization" : 'Already have an account? Sign in'}
            </button>
          </div>

          {mode === 'login' && (
            <div style={{ marginTop: 28, padding: '16px', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                For a new setup, please click "Set up organization" below to create your admin account.
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
