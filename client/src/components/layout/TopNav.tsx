'use client';

// ============================================
// Top Navbar Component
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import api from '@/lib/api';

export default function TopNav() {
  const { user, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications?limit=5');
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : '??';

  return (
    <header style={{
      height: 64,
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Search Bar */}
      <div style={{
        position: 'relative',
        maxWidth: 420,
        flex: 1,
      }}>
        <Search size={16} style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-muted)',
        }} />
        <input
          type="text"
          placeholder="Search projects, tasks, users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 14px 9px 38px',
            fontSize: 13,
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            outline: 'none',
            transition: 'all var(--transition-fast)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(108, 92, 231, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--color-border)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-ghost btn-icon"
            style={{ position: 'relative' }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 16, height: 16,
                background: 'var(--color-error)',
                borderRadius: 'var(--radius-full)',
                color: 'white',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 8,
              width: 360,
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border-light)',
              overflow: 'hidden',
              animation: 'scaleIn 0.2s ease',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border-light)', fontWeight: 600, fontSize: 14 }}>
                Notifications
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--color-border-light)',
                    background: n.isRead ? 'transparent' : 'var(--color-primary-bg)',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{n.message}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div style={{
              width: 30, height: 30,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white',
            }}>
              {initials}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>
              {user?.firstName}
            </span>
            <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
          </button>

          {showProfileMenu && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 8,
              width: 220, background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border-light)',
              overflow: 'hidden', animation: 'scaleIn 0.2s ease',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border-light)' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{user?.email}</div>
                <span className={`badge badge-${user?.role?.toLowerCase()}`} style={{ marginTop: 6, display: 'inline-block' }}>
                  {user?.role}
                </span>
              </div>
              <div style={{ padding: '6px' }}>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: 13, padding: '8px 12px' }}>
                  <User size={16} /> Profile
                </button>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: 13, padding: '8px 12px' }}>
                  <Settings size={16} /> Settings
                </button>
                <button onClick={() => logout()} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: 13, padding: '8px 12px', color: 'var(--color-error)' }}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
