'use client';

// ============================================
// Dashboard Layout — Wraps authenticated pages
// ============================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSocketStore } from '@/stores/socketStore';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, user, fetchMe } = useAuthStore();
  const { connect, disconnect } = useSocketStore();
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = useState(260);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchMe();
  }, [isAuthenticated]);

  // Connect Socket.IO when user is available
  useEffect(() => {
    if (user?.id) {
      connect(user.id);
      return () => disconnect();
    }
  }, [user?.id]);

  // Listen for sidebar width changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        setSidebarWidth(sidebar.getBoundingClientRect().width);
      }
    });

    const sidebar = document.querySelector('aside');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['style'] });
      setSidebarWidth(sidebar.getBoundingClientRect().width);
    }

    return () => observer.disconnect();
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: sidebarWidth,
        transition: 'margin-left var(--transition-normal)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        {/* Top Navigation */}
        <TopNav />

        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: '24px 28px',
          maxWidth: '1400px',
          width: '100%',
          animation: 'fadeIn 0.3s ease',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
