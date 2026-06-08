import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { Award, Compass, MessageSquare, Info } from 'lucide-react';

export default function AboutUs() {
  const { t } = useLanguage();

  return (
    <div className="app-container">
      <Navbar />
      
      <main className="main-content" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info style={{ color: 'var(--color-primary)' }} />
          {t('about_title')}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p>{t('about_desc1')}</p>
          <p>{t('about_desc2')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
          <div style={{ border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Compass size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {t('about_feature_trust')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('about_feature_trust_desc')}
            </p>
          </div>

          <div style={{ border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {t('about_feature_earn')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('about_feature_earn_desc')}
            </p>
          </div>

          <div style={{ border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <MessageSquare size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {t('about_feature_news')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('about_feature_news_desc')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
