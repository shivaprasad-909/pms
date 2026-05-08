'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Bell, Webhook, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hasRole } = useAuthStore();

  const tabs = [
    { name: 'Profile', href: '/settings/profile', icon: User },
    { name: 'Notifications', href: '/settings/notifications', icon: Bell },
    { name: 'Security', href: '/settings/security', icon: Shield },
  ];

  if (hasRole('FOUNDER', 'ADMIN')) {
    tabs.push({ name: 'Webhooks', href: '/settings/webhooks', icon: Webhook });
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="page-header" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage your personal preferences and account integrations</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 32, flex: 1 }}>
          {/* Settings Sidebar */}
          <div style={{ width: 240, flexShrink: 0 }}>
            <div className="card" style={{ padding: '8px' }}>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {tabs.map((tab) => {
                  const isActive = pathname.startsWith(tab.href);
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        background: isActive ? 'var(--color-primary-bg)' : 'transparent',
                        fontWeight: isActive ? 600 : 500,
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Icon size={18} />
                      {tab.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {children}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
