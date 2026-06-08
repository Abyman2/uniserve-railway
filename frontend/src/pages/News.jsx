import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { Megaphone, Calendar, User } from 'lucide-react';
import { apiFetch } from '../api';

export default function News() {
  const { t } = useLanguage();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/news?size=50&sort=createdAt,desc');
      if (!res.ok) throw new Error('Failed to load news');
      const data = await res.json();
      setNewsList(data.content || []);
    } catch (err) {
      console.error(err);
      setError('Could not load announcements. Please make sure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="app-container">
      <SiteHeader />
      
      <main className="main-content" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Megaphone style={{ color: 'var(--color-primary)' }} />
          {t('latest_news')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          Official alerts, academic schedules, and social updates posted by campus administrators.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading announcements...
          </div>
        ) : error ? (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            {error}
          </div>
        ) : newsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {t('no_news')}
          </div>
        ) : (
          <div className="news-grid">
            {newsList.map((item) => (
              <article key={item.id} className="news-card animate-fade-in" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <span className="news-badge status-accepted" style={{ textTransform: 'uppercase' }}>
                  {t(`news_${item.category.toLowerCase()}`)}
                </span>
                
                <h2 className="news-title">{item.title}</h2>
                
                <div className="news-meta">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginRight: '1rem' }}>
                    <Calendar size={12} />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <User size={12} />
                    {item.adminName || 'Campus Admin'}
                  </span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {item.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
