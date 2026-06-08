import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Globe, LogOut, ChevronDown, Home, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, portal, logout, changePortal } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  const handleBrandClick = () => {
    if (user) {
      if (portal === 'admin') navigate('/admin');
      else if (portal === 'provider') navigate('/provider');
      else navigate('/listings');
    } else {
      navigate('/');
    }
  };

  // Go back to portal chooser (clears portal so user picks fresh)
  const handleGoHome = () => {
    navigate('/');
  };

  // Quick portal switch for SERVICE_PROVIDER users
  const handlePortalSwitch = (newPortal) => {
    changePortal(newPortal);
    setPortalMenuOpen(false);
    if (newPortal === 'provider') navigate('/provider');
    else navigate('/customer');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Left: Home icon + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Always-visible home button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleGoHome}
            title="Back to Portal Chooser"
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <Home size={16} />
          </button>

          <div className="logo" onClick={handleBrandClick}>
            <span>UniServe</span>
          </div>
        </div>

        {/* Center: Nav links */}
        <ul className="nav-links">
          {portal !== 'admin' && (
            <>
              <li
                className={`nav-link ${location.pathname === '/listings' ? 'active' : ''}`}
                onClick={() => navigate('/listings')}
              >
                {t('nav_services')}
              </li>
              <li
                className={`nav-link ${location.pathname === '/news' ? 'active' : ''}`}
                onClick={() => navigate('/news')}
              >
                {t('nav_news')}
              </li>
              <li
                className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                onClick={() => navigate('/about')}
              >
                {t('nav_about')}
              </li>
            </>
          )}

          {user && (
            <>
              {portal === 'customer' && (
                <li
                  className={`nav-link ${location.pathname === '/customer' ? 'active' : ''}`}
                  onClick={() => navigate('/customer')}
                >
                  {t('nav_dashboard')}
                </li>
              )}
              {portal === 'provider' && (
                <li
                  className={`nav-link ${location.pathname === '/provider' ? 'active' : ''}`}
                  onClick={() => navigate('/provider')}
                >
                  {t('nav_dashboard')}
                </li>
              )}
              {portal === 'admin' && (
                <>
                  <li
                    className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                    onClick={() => navigate('/admin')}
                  >
                    {t('nav_dashboard')}
                  </li>
                  <li
                    className={`nav-link ${location.pathname === '/news' ? 'active' : ''}`}
                    onClick={() => navigate('/news')}
                  >
                    {t('nav_news')}
                  </li>
                </>
              )}
            </>
          )}
        </ul>

        {/* Right: Controls */}
        <div className="nav-actions">
          {/* Language toggle */}
          <button className="btn btn-secondary btn-sm" onClick={handleLanguageToggle} title="Switch Language">
            <Globe size={16} />
            <span>{language === 'en' ? 'አማ' : 'EN'}</span>
          </button>

          {/* Theme toggle */}
          <button className="btn btn-secondary btn-sm" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Portal switcher dropdown for SERVICE_PROVIDER */}
              {user.role === 'SERVICE_PROVIDER' && (
                <div style={{ position: 'relative' }}>
                  <button
                    className="btn btn-accent btn-sm"
                    onClick={() => setPortalMenuOpen(!portalMenuOpen)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <LayoutDashboard size={14} />
                    <span>{portal === 'provider' ? 'Provider View' : 'Customer View'}</span>
                    <ChevronDown size={14} />
                  </button>

                  {portalMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-md)',
                      minWidth: '160px',
                      zIndex: 200,
                      overflow: 'hidden'
                    }}>
                      <div
                        onClick={() => handlePortalSwitch('customer')}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: portal === 'customer' ? 700 : 500,
                          color: portal === 'customer' ? 'var(--color-primary)' : 'var(--text-primary)',
                          background: portal === 'customer' ? 'rgba(99,102,241,0.08)' : 'transparent',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                        onMouseLeave={e => e.currentTarget.style.background = portal === 'customer' ? 'rgba(99,102,241,0.08)' : 'transparent'}
                      >
                        🛒 Customer View
                      </div>
                      <div
                        onClick={() => handlePortalSwitch('provider')}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: portal === 'provider' ? 700 : 500,
                          color: portal === 'provider' ? 'var(--color-primary)' : 'var(--text-primary)',
                          background: portal === 'provider' ? 'rgba(99,102,241,0.08)' : 'transparent',
                          borderTop: '1px solid var(--border-color)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                        onMouseLeave={e => e.currentTarget.style.background = portal === 'provider' ? 'rgba(99,102,241,0.08)' : 'transparent'}
                      >
                        🛠 Provider View
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User info */}
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.fullName}
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {portal}
                </span>
              </span>

              {/* Logout */}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => { logout(); navigate('/'); }}
                title={t('nav_logout')}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
                {t('nav_login')}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
                {t('nav_register')}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
