'use client';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useSocketStore } from '@/stores/socketStore';
import { Avatar, showToast } from '@/components/ui';
import { joinChannel, emitTypingStart, emitTypingStop } from '@/lib/socket';
import api from '@/lib/api';
import { MessageSquare, Plus, Send, Hash, X } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { isUserOnline, getTypingUsers } = useSocketStore();
  const [channels, setChannels] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>(null);

  const fetchChannels = async () => {
    try { const r = await api.get('/chat/channels'); setChannels(r.data.data || []); } catch {} finally { setLoading(false); }
  };

  const fetchMessages = async (chId: string) => {
    try {
      const r = await api.get(`/chat/channels/${chId}/messages`);
      setMessages(r.data.data || []);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {}
  };

  useEffect(() => {
    fetchChannels();
    api.get('/users').then(r => setTeamUsers(r.data.data || [])).catch(() => {});
  }, []);

  // Listen for real-time messages
  useEffect(() => {
    const handler = () => { if (active) fetchMessages(active.id); };
    window.addEventListener('pms:message', handler);
    return () => window.removeEventListener('pms:message', handler);
  }, [active]);

  const selectChannel = (ch: any) => {
    setActive(ch);
    fetchMessages(ch.id);
    joinChannel(ch.id);
  };

  const send = async () => {
    if (!input.trim() || !active) return;
    // Extract mentions
    const mentionMatches = input.match(/@(\w+)/g);
    const mentionIds = mentionMatches?.map(m => {
      const name = m.slice(1).toLowerCase();
      const u = teamUsers.find(u => u.firstName?.toLowerCase() === name || `${u.firstName}${u.lastName}`.toLowerCase().includes(name));
      return u?.id;
    }).filter(Boolean) || [];
    try {
      await api.post(`/chat/channels/${active.id}/messages`, { content: input, mentions: mentionIds });
      setInput('');
      fetchMessages(active.id);
      if (user) emitTypingStop(active.id, user.id);
    } catch {}
  };

  const handleTyping = (val: string) => {
    setInput(val);
    if (!active || !user) return;
    emitTypingStart(active.id, user.id, `${user.firstName} ${user.lastName}`);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTypingStop(active.id, user.id), 2000);
    // Check for @mention trigger
    const lastAt = val.lastIndexOf('@');
    if (lastAt >= 0 && lastAt === val.length - 1 || (lastAt >= 0 && !val.slice(lastAt).includes(' '))) {
      setMentionQuery(val.slice(lastAt + 1).toLowerCase());
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (u: any) => {
    const lastAt = input.lastIndexOf('@');
    const before = input.slice(0, lastAt);
    setInput(`${before}@${u.firstName} `);
    setShowMentions(false);
  };

  const renderContent = (content: string) => {
    return content.split(/(@\w+)/g).map((part, i) =>
      part.startsWith('@') ? <span key={i} style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'var(--color-primary-bg)', padding: '0 3px', borderRadius: 3 }}>{part}</span> : part
    );
  };

  const createChannel = async () => {
    if (!createName.trim()) return;
    try {
      await api.post('/chat/channels', { name: createName, type: 'TEAM' });
      setCreateName(''); setShowCreate(false); fetchChannels();
      showToast('Channel created', 'success');
    } catch {}
  };

  const typing = active ? getTypingUsers(active.id).filter(t => t.userId !== user?.id) : [];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', height: 'calc(100vh - 140px)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border-light)', animation: 'fadeIn 0.4s ease' }}>
        {/* Channel List */}
        <div style={{ width: 280, background: 'var(--color-surface)', borderRight: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Channels</h3>
            <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(!showCreate)} style={{ width: 28, height: 28 }}><Plus size={16} /></button>
          </div>
          {showCreate && (
            <div style={{ padding: '12px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', gap: 6 }}>
              <input className="input" placeholder="Name" value={createName} onChange={e => setCreateName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createChannel()} style={{ fontSize: 12 }} />
              <button className="btn btn-primary btn-sm" onClick={createChannel}>Add</button>
            </div>
          )}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {channels.map(ch => (
              <button key={ch.id} onClick={() => selectChannel(ch)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px',
                background: active?.id === ch.id ? 'var(--color-primary-bg)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13,
                color: active?.id === ch.id ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: active?.id === ch.id ? 600 : 400,
                borderBottom: '1px solid var(--color-border-light)', transition: 'background 0.15s',
              }}>
                <Hash size={16} style={{ flexShrink: 0, color: active?.id === ch.id ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{ch._count?.members || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
          {active ? (
            <>
              <div style={{ padding: '14px 20px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Hash size={18} style={{ color: 'var(--color-primary)' }} />
                <div><div style={{ fontWeight: 600, fontSize: 15 }}>{active.name}</div></div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                {messages.map((msg, i) => {
                  const showAvatar = i === 0 || messages[i - 1]?.userId !== msg.userId;
                  const online = isUserOnline(msg.userId);
                  return (
                    <div key={msg.id} style={{ display: 'flex', gap: 10, marginBottom: showAvatar ? 16 : 4, paddingLeft: showAvatar ? 0 : 42 }}>
                      {showAvatar && <Avatar firstName={msg.user?.firstName} lastName={msg.user?.lastName} size={32} isOnline={online} />}
                      <div style={{ flex: 1 }}>
                        {showAvatar && (
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{msg.user?.firstName} {msg.user?.lastName}</span>
                            <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{dayjs(msg.createdAt).format('h:mm A')}</span>
                          </div>
                        )}
                        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{renderContent(msg.content)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>
                    <MessageSquare size={36} style={{ marginBottom: 8, opacity: 0.4 }} />
                    <div style={{ fontSize: 14 }}>No messages yet</div>
                  </div>
                )}
              </div>

              {/* Typing indicator */}
              {typing.length > 0 && (
                <div style={{ padding: '4px 20px', fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  {typing.map(t => t.userName).join(', ')} {typing.length === 1 ? 'is' : 'are'} typing...
                </div>
              )}

              <div style={{ padding: '12px 20px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border-light)', position: 'relative' }}>
                {/* Mention Autocomplete */}
                {showMentions && (
                  <div style={{ position: 'absolute', bottom: '100%', left: 20, right: 20, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', maxHeight: 180, overflowY: 'auto', zIndex: 10 }}>
                    {teamUsers.filter(u => !mentionQuery || u.firstName?.toLowerCase().includes(mentionQuery) || u.lastName?.toLowerCase().includes(mentionQuery)).slice(0, 8).map(u => (
                      <button key={u.id} onClick={() => insertMention(u)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <Avatar firstName={u.firstName} lastName={u.lastName} size={24} />
                        <span>{u.firstName} {u.lastName}</span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{u.role}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" placeholder={`Message #${active.name}... (use @ to mention)`} value={input}
                    onChange={e => handleTyping(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} style={{ fontSize: 13 }} />
                  <button className="btn btn-primary" onClick={send} disabled={!input.trim()}><Send size={16} /></button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--color-text-muted)' }}>
              <MessageSquare size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>Select a channel</div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
