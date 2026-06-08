import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, BookOpen, User, Briefcase, Globe, Sun, Moon } from 'lucide-react';

export default function PortalChooser() {
  const { changePortal } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Selection step: 1 = choose language/main portal, 2 = student sub-role portal
  const [step, setStep] = useState(1);

  const selectMainPortal = (type) => {
    if (type === 'admin') {
      changePortal('admin');
      navigate('/login');
    } else {
      setStep(2);
    }
  };

  const selectStudentPortal = (subRole) => {
    changePortal(subRole);
    if (subRole === 'customer') {
      navigate('/listings');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="portal-chooser-bg">
      <div className="portal-chooser-card">
        {/* Top Control Bar inside card */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}>
            <Globe size={16} />
            <span>{language === 'en' ? 'አማ' : 'EN'}</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>

        <h1 className="logo" style={{ fontSize: '3rem', justifyContent: 'center', marginBottom: '0.5rem' }}>UniServe</h1>
        
        {step === 1 ? (
          <>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
              {t('welcome_subtitle')}
            </p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('choose_role_title')}
            </h2>

            <div className="portal-grid">
              <div className="portal-option" onClick={() => selectMainPortal('student')}>
                <div className="portal-option-icon">
                  <BookOpen size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('student_portal')}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {t('student_desc')}
                </p>
              </div>

              <div className="portal-option" onClick={() => selectMainPortal('admin')}>
                <div className="portal-option-icon">
                  <Shield size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('admin_portal')}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {t('admin_desc')}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
              {t('student_portal')}
            </p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              {t('student_role_title')}
            </h2>

            <div className="portal-grid">
              <div className="portal-option" onClick={() => selectStudentPortal('customer')}>
                <div className="portal-option-icon">
                  <User size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('customer_role')}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {t('customer_desc')}
                </p>
              </div>

              <div className="portal-option" onClick={() => selectStudentPortal('provider')}>
                <div className="portal-option-icon">
                  <Briefcase size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('provider_role')}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {t('provider_desc')}
                </p>
              </div>
            </div>

            <button 
              className="btn btn-secondary" 
              style={{ marginTop: '2.5rem' }} 
              onClick={() => setStep(1)}
            >
              {t('back_button')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
