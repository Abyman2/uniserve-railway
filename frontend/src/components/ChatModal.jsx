import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Send, X, MessageSquare, Loader } from 'lucide-react';
import { apiFetch } from '../api';

export default function ChatModal({ booking, onClose }) {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await apiFetch(`/api/messages/booking/${booking.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      // silent on poll failures
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch on open + poll every 3 seconds (simple real-time without WebSocket)
  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [booking.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking.id,
          content: newMessage.trim()
        })
      });
      if (res.ok) {
        const sent = await res.json();
        setMessages(prev => [...prev, sent]);
        setNewMessage('');
      } else {
        setError('Failed to send message.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dt) => {
    const d = new Date(dt);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          width: '100%',
          maxWidth: '520px',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.25s ease-out',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          background: 'var(--bg-tertiary)',
          flexShrink: 0
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <MessageSquare size={16} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Booking Chat</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{booking.listingTitle}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              {booking.buyerName} ↔ {booking.providerName}
              <span style={{ marginLeft: '0.5rem' }}>
                · <span className={`status-badge status-${booking.status?.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                  {booking.status}
                </span>
              </span>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ padding: '0.35rem 0.5rem', flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
              <Loader size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%', color: 'var(--text-muted)', textAlign: 'center', gap: '0.75rem'
            }}>
              <MessageSquare size={36} style={{ opacity: 0.25 }} />
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No messages yet</p>
                <p style={{ fontSize: '0.85rem' }}>Start the conversation — discuss the task details, schedule, and any questions.</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.id?.toString() ||
                           msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  {/* Sender name */}
                  <span style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.2rem',
                    fontWeight: 600
                  }}>
                    {isMe ? 'You' : msg.senderName}
                  </span>

                  {/* Bubble */}
                  <div style={{
                    maxWidth: '78%',
                    padding: '0.6rem 0.9rem',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMe
                      ? 'var(--color-primary)'
                      : 'var(--bg-tertiary)',
                    color: isMe ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                    border: isMe ? 'none' : '1px solid var(--border-color)'
                  }}>
                    {msg.content}
                  </div>

                  {/* Timestamp */}
                  <span style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.2rem'
                  }}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '0.4rem 1.25rem',
            background: 'rgba(239,68,68,0.1)',
            color: 'var(--color-danger)',
            fontSize: '0.82rem',
            flexShrink: 0
          }}>
            {error}
          </div>
        )}

        {/* Input area */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.5rem',
            background: 'var(--bg-tertiary)',
            flexShrink: 0
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Type your message…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ flex: 1, padding: '0.6rem 0.9rem', fontSize: '0.9rem' }}
            autoFocus
            maxLength={1000}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={sending || !newMessage.trim()}
            style={{ padding: '0.6rem 1rem', flexShrink: 0 }}
          >
            {sending
              ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={16} />
            }
          </button>
        </form>
      </div>
    </div>
  );
}
