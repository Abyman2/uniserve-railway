import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Menu, X, User, LogOut, GraduationCap, Wrench, Shield, Bell, Check, CheckCheck } from 'lucide-react';

export default function SiteHeader() {
  const { user, logout, changePortal, portal } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close notif tray on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const goProfile = () => {
    closeMenu();
    if (!user) return navigate('/login');
    if (user.role === 'ADMIN') navigate('/admin');
    else if (portal === 'provider') navigate('/provider');
    else navigate('/customer');
  };

  const handleRegister = (type) => {
    closeMenu();
    if (type === 'admin') { changePortal('admin'); navigate('/login'); }
    else { changePortal(type); navigate('/register'); }
  };

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    setNotifOpen(false);
    goProfile();
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Burger — only shown when logged out */}
        {!user && (
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        <div className="site-logo" onClick={() => navigate('/')}>UniServe</div>

        {/* Center nav */}
        <nav className="site-nav">
          <button className={`site-nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>Home</button>
          <button className={`site-nav-link ${location.pathname === '/news' ? 'active' : ''}`} onClick={() => navigate('/news')}>News</button>
          {!user && (
            <button className="site-nav-link site-nav-cta" onClick={() => navigate('/login')}>Login</button>
          )}
        </nav>

        {/* Right side — logged in */}
        {user && (
          <div className="header-right">
            {/* Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications">
                <Bell size={17} />
                {unreadCount > 0 && <span className="notif-badge-dot" />}
              </button>

              {notifOpen && (
                <div className="notif-tray">
                  <div className="notif-tray-header">
                    <span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                    {unreadCount > 0 && (
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--violet)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                        onClick={markAllRead}
                      >
                        <CheckCheck size={13} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                        All read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="notif-tray-empty">No notifications yet</div>
                  ) : (
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifications.slice(0, 15).map((n) => (
                        <div
                          key={n.id}
                          className={`notif-tray-item ${!n.isRead ? 'unread' : ''}`}
                          onClick={() => handleNotifClick(n)}
                        >
                          <div className="notif-tray-item-title">{n.title}</div>
                          <div className="notif-tray-item-msg">{n.message}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--ink-3)', marginTop: '0.3rem' }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="notif-tray-footer">
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%', fontSize: '0.78rem' }} onClick={goProfile}>
                      View Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <button className="btn btn-secondary btn-sm" onClick={goProfile} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={14} />
              <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.fullName.split(' ')[0]}
              </span>
            </button>

            {/* Logout */}
            <button className="btn btn-danger btn-sm" onClick={() => { logout(); navigate('/'); }} title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Slide-in side menu (logged out) */}
      {menuOpen && !user && (
        <>
          <div className="menu-backdrop" onClick={closeMenu} />
          <aside className="side-menu animate-fade-in">
            <div className="site-logo" style={{ marginBottom: '0.5rem' }}>UniServe</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-3)', marginBottom: '1rem' }}>Get started</p>
            <div className="side-menu-items">
              <button onClick={() => handleRegister('customer')}>
                <GraduationCap size={18} /> Register as Student
              </button>
              <button onClick={() => handleRegister('provider')}>
                <Wrench size={18} /> Register as Service Provider
              </button>
              <button onClick={() => handleRegister('admin')}>
                <Shield size={18} /> Administrator Login
              </button>
              <hr />
              <button onClick={() => { closeMenu(); navigate('/login'); }}>
                Login to existing account
              </button>
            </div>
          </aside>
        </>
      )}
    </header>
  );
}