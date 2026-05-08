'use client';

// ============================================
// Sidebar Component — Main Navigation
// ============================================

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users, BarChart3,
  Settings, LogOut, Bell, MessageSquare, Clock, Zap, FileText,
  ChevronLeft, ChevronRight, Activity, Calendar, Target
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuthStore();

  // Navigation items based on permission
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
    { href: '/workspaces', label: 'Workspaces', icon: LayoutDashboard, permission: 'dashboard.view' },
    { href: '/projects', label: 'Projects', icon: FolderKanban, permission: 'projects.view' },
    { href: '/tasks', label: 'My Tasks', icon: CheckSquare, permission: 'tasks.view' },
    { href: '/sprints', label: 'Sprints', icon: Target, permission: 'tasks.view' },
    { href: '/time-tracking', label: 'Time Tracking', icon: Clock, permission: 'tasks.view' },
    { href: '/team', label: 'Team', icon: Users, permission: 'teams.manage' },
    { href: '/messages', label: 'Messages', icon: MessageSquare, permission: 'chat.access' },
    { href: '/activity', label: 'Activity Log', icon: Activity, permission: 'dashboard.view' },
    { href: '/reports', label: 'Reports', icon: BarChart3, permission: 'reports.view' },
    { href: '/calendar', label: 'Calendar', icon: Calendar, permission: 'tasks.view' },
    { href: '/documents', label: 'Documents', icon: FileText, permission: 'dashboard.view' },
    { href: '/automation', label: 'Automation', icon: Zap, permission: 'automation.manage' },
    { href: '/settings', label: 'Settings', icon: Settings, permission: 'settings.manage' },
  ];

  const filteredNav = navItems.filter(item => hasPermission(item.permission));

  // Get user initials for avatar
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : '??';

  // Avatar gradient based on role
  const roleGradient: Record<string, string> = {
    FOUNDER: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
    ADMIN: 'linear-gradient(135deg, #0984E3, #74B9FF)',
    MANAGER: 'linear-gradient(135deg, #00B894, #55EFC4)',
    STAKEHOLDER: 'linear-gradient(135deg, #E84393, #FD79A8)',
    DEVELOPER: 'linear-gradient(135deg, #F39C12, #F8C471)',
  };

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        background: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-normal)',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Logo / Header */}
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        minHeight: '72px',
      }}>
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: 16,
          color: 'white',
          flexShrink: 0,
        }}>
          P
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'white', whiteSpace: 'nowrap' }}>PMS</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>Project Management</div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '10px 14px' : '10px 16px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'white' : 'var(--sidebar-text)',
                background: isActive ? 'var(--sidebar-active)' : 'transparent',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: 'all var(--transition-fast)',
                marginBottom: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--sidebar-hover)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--sidebar-text)';
                }
              }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
          margin: '0 8px 8px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255,255,255,0.05)',
          border: 'none',
          color: 'var(--sidebar-text)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* User Profile Section */}
      <div style={{
        padding: collapsed ? '16px 12px' : '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: 'var(--radius-full)',
          background: roleGradient[user?.role || 'DEVELOPER'],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
          color: 'white',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        {!collapsed && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
              {user?.role?.toLowerCase()}
            </div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => logout()}
            title="Logout"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 'var(--radius-sm)',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#E17055'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
