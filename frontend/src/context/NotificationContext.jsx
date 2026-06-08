import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../api';
import { Bell, X, Calendar, MessageSquare } from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, token, portal } = useAuth();
  const [toasts, setToasts] = useState([]);
  const seenBookings = useRef(new Set());
  const seenMessages = useRef(new Set());
  const initialized = useRef(false);

  const notify = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const pollActivity = useCallback(async () => {
    if (!token || !user) return;

    try {
      const bookingPath = portal === 'provider' ? '/api/bookings/provider' : '/api/bookings/customer';
      const res = await apiFetch(bookingPath, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const bookings = await res.json();
        bookings.forEach((b) => {
          const key = `b-${b.id}-${b.status}`;
          if (!seenBookings.current.has(key)) {
            if (initialized.current) {
              const label = portal === 'provider' ? 'New booking request' : 'Booking update';
              notify(label, `${b.listingTitle || 'Service'} — ${b.status}`, 'booking');
            }
            seenBookings.current.add(key);
          }
        });
      }

      const bookingsRes = await apiFetch(
        portal === 'provider' ? '/api/bookings/provider' : '/api/bookings/customer',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (bookingsRes.ok) {
        const bookings = await bookingsRes.json();
        for (const b of bookings.slice(0, 5)) {
          const msgRes = await apiFetch(`/api/messages/booking/${b.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (msgRes.ok) {
            const messages = await msgRes.json();
            const latest = messages[messages.length - 1];
            if (latest) {
              const key = `m-${latest.id}`;
              if (!seenMessages.current.has(key)) {
                if (initialized.current && latest.senderId !== user.id) {
                  notify('New message', latest.content.slice(0, 80), 'chat');
                }
                seenMessages.current.add(key);
              }
            }
          }
        }
      }
    } catch {
      // silent poll failure
    } finally {
      initialized.current = true;
    }
  }, [token, user, portal, notify]);

  useEffect(() => {
    if (!token) return;
    pollActivity();
    const interval = setInterval(pollActivity, 15000);
    return () => clearInterval(interval);
  }, [token, pollActivity]);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div className="toast-icon">
              {t.type === 'chat' ? <MessageSquare size={18} /> : <Calendar size={18} />}
            </div>
            <div className="toast-body">
              <strong>{t.title}</strong>
              <p>{t.message}</p>
            </div>
            <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      {user && (
        <div className="notif-badge" title="Live notifications active">
          <Bell size={14} />
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
