import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export default function Register() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(fullName, email, password);
      setSuccess('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
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
            {t('register_title')}
          </h2>

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

          {success && (
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: 'var(--color-success)', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.9rem', 
              marginBottom: '1.5rem',
              fontWeight: 500
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('field_fullname')}</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Abebe Bikila"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('field_email')}</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="student@university.edu"
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
              {loading ? 'Registering...' : t('register_btn')}
            </button>
          </form>

          <p 
            onClick={() => navigate('/login')} 
            style={{ 
              marginTop: '1.5rem', 
              fontSize: '0.85rem', 
              color: 'var(--color-primary)', 
              textAlign: 'center', 
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            {t('register_switch')}
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
