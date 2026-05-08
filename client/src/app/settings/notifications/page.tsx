'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Save } from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskAssigned: boolean;
  taskUpdated: boolean;
  taskCompleted: boolean;
  commentAdded: boolean;
  mentionNotification: boolean;
  sprintUpdates: boolean;
  projectUpdates: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/notification-settings');
      setSettings(res.data.data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await api.patch('/notification-settings', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card skeleton" style={{ height: 400 }}></div>;
  }

  if (!settings) return null;

  const sections = [
    {
      title: 'Global Preferences',
      items: [
        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive real-time push notifications in the app' },
      ],
    },
    {
      title: 'Task & Project Updates',
      items: [
        { key: 'taskAssigned', label: 'Task Assigned', desc: 'When you are assigned to a new task' },
        { key: 'taskUpdated', label: 'Task Updated', desc: 'When a task you follow is modified' },
        { key: 'taskCompleted', label: 'Task Completed', desc: 'When a task you follow is marked as done' },
        { key: 'projectUpdates', label: 'Project Updates', desc: 'Status changes and milestones for your projects' },
        { key: 'sprintUpdates', label: 'Sprint Updates', desc: 'Sprint starts, ends, and major scope changes' },
      ],
    },
    {
      title: 'Communication',
      items: [
        { key: 'commentAdded', label: 'Comments', desc: 'When someone comments on your task' },
        { key: 'mentionNotification', label: 'Mentions', desc: 'When you are @mentioned in a comment or chat' },
      ],
    },
    {
      title: 'Reports',
      items: [
        { key: 'dailyDigest', label: 'Daily Digest', desc: 'A morning summary of what needs your attention' },
        { key: 'weeklyReport', label: 'Weekly Report', desc: 'A summary of productivity and achievements' },
      ],
    },
  ];

  return (
    <div className="card" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Notification Preferences</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Choose how and when you want to be notified.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleSave} 
          disabled={saving}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {sections.map((section, idx) => (
          <div key={idx}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--color-border-light)' }}>
              {section.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {section.items.map((item) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{item.label}</div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{item.desc}</div>
                  </div>
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: 44,
                    height: 24,
                  }}>
                    <input 
                      type="checkbox" 
                      style={{ opacity: 0, width: 0, height: 0 }} 
                      checked={settings[item.key as keyof NotificationSettings] as boolean}
                      onChange={() => handleToggle(item.key as keyof NotificationSettings)}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: settings[item.key as keyof NotificationSettings] ? 'var(--color-primary)' : 'var(--color-border)',
                      transition: '.4s',
                      borderRadius: 24,
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: 18,
                        width: 18,
                        left: 3,
                        bottom: 3,
                        backgroundColor: 'white',
                        transition: '.4s',
                        borderRadius: '50%',
                        transform: settings[item.key as keyof NotificationSettings] ? 'translateX(20px)' : 'translateX(0)',
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
