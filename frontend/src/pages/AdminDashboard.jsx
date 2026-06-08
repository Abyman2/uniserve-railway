import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { Users, Bell, ClipboardCheck, Megaphone, Check, X, FileText } from 'lucide-react';
import { apiFetch } from '../api';

export default function AdminDashboard() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('applications');
  
  // Provider Applications state
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);

  // News publishing state
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState('General');
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsSuccess, setNewsSuccess] = useState('');
  const [newsError, setNewsError] = useState('');

  // Fetch applications
  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const res = await apiFetch('/api/provider-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
    }
  }, [activeTab, token]);

  // Approve application
  const handleApproveApplication = async (id) => {
    try {
      const res = await apiFetch(`/api/provider-applications/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reject application
  const handleRejectApplication = async (id) => {
    try {
      const res = await apiFetch(`/api/provider-applications/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Publish News
  const handlePublishNews = async (e) => {
    e.preventDefault();
    setNewsLoading(true);
    setNewsSuccess('');
    setNewsError('');

    try {
      const res = await apiFetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newsTitle,
          content: newsContent,
          category: newsCategory
        })
      });

      if (res.ok) {
        setNewsSuccess('News announcement published successfully on the landing page!');
        setNewsTitle('');
        setNewsContent('');
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to publish news');
      }
    } catch (err) {
      setNewsError(err.message || 'Error publishing announcement.');
    } finally {
      setNewsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      
      <main className="main-content">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {t('admin_db_title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          System console: verify student provider credentials and publish official news updates.
        </p>

        <div className="dashboard-layout">
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <div 
              className={`sidebar-tab ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <ClipboardCheck size={18} />
              <span>Provider Apps ({applications.filter(a => a.status === 'PENDING').length})</span>
            </div>

            <div 
              className={`sidebar-tab ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              <Megaphone size={18} />
              <span>Publish News</span>
            </div>
          </aside>

          {/* Main Content */}
          <section className="dashboard-main">
            {activeTab === 'applications' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                  {t('pending_applications')}
                </h2>

                {appsLoading ? (
                  <div style={{ color: 'var(--text-muted)' }}>Loading applications...</div>
                ) : applications.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
                    {t('no_applications')}
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>{t('applicant')}</th>
                          <th>{t('skills')}</th>
                          <th>{t('portfolio')}</th>
                          <th>{t('booking_status')}</th>
                          <th>{t('booking_actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((app) => (
                          <tr key={app.id}>
                            <td style={{ fontWeight: 600 }}>{app.userName}</td>
                            <td>{app.skills}</td>
                            <td>{app.portfolioLinks || 'None'}</td>
                            <td>
                              <span className={`status-badge status-${app.status.toLowerCase()}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              {app.status === 'PENDING' && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleApproveApplication(app.id)}
                                    title={t('action_approve')}
                                    style={{ padding: '0.4rem' }}
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleRejectApplication(app.id)}
                                    title={t('action_deny')}
                                    style={{ padding: '0.4rem', color: 'var(--color-danger)' }}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'news' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                  {t('news_creator')}
                </h2>

                {newsSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                    {newsSuccess}
                  </div>
                )}

                {newsError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                    {newsError}
                  </div>
                )}

                <form onSubmit={handlePublishNews}>
                  <div className="form-group">
                    <label className="form-label">{t('news_title_field')}*</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. Maintenance Scheduled for Technology Campus Library"
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('news_category_field')}*</label>
                    <select 
                      className="form-input"
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value)}
                    >
                      <option value="General">{t('news_general')}</option>
                      <option value="Academic">{t('news_academic')}</option>
                      <option value="Events">{t('news_events')}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('news_content_field')}*</label>
                    <textarea 
                      className="form-input" 
                      rows="6"
                      placeholder="Write announcement details here..."
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={newsLoading}
                  >
                    {newsLoading ? 'Publishing...' : t('publish_news')}
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
