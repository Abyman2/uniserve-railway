import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export default function Login() {
  const { login, portal } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      // Success redirection
      if (userData.role === 'ADMIN') {
        navigate('/admin');
      } else if (portal === 'provider' && userData.role === 'SERVICE_PROVIDER') {
        navigate('/provider');
      } else if (portal === 'provider' && userData.role === 'CUSTOMER') {
        // Logged in as customer but wanted provider view: they need to apply first
        navigate('/customer');
      } else {
        navigate('/listings');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <SiteHeader />
      <main className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 150px)' }}>
        <div className="portal-chooser-card" style={{ maxWidth: '450px', padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>
            {t('login_title')}
          </h2>

          {portal && (
            <div style={{ 
              background: 'rgba(99, 102, 241, 0.1)', 
              color: 'var(--color-primary)', 
              padding: '0.5rem', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              textAlign: 'center',
              marginBottom: '1.5rem',
              textTransform: 'uppercase'
            }}>
              {portal} portal view
            </div>
          )}

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--color-danger)', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.9rem', 
              marginBottom: '1.5rem',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('field_email')}</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('field_password')}</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : t('login_btn')}
            </button>
          </form>

          {/* Regular students can register. Admins are preseeded, so don't show register link for admin view */}
          {portal !== 'admin' && (
            <p 
              onClick={() => navigate('/register')} 
              style={{ 
                marginTop: '1.5rem', 
                fontSize: '0.85rem', 
                color: 'var(--color-primary)', 
                textAlign: 'center', 
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {t('login_switch')}
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
