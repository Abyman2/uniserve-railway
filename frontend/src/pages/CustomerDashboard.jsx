import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import ChatModal from '../components/ChatModal';
import WorkEscrowPanel from '../components/WorkEscrowPanel';
import { Calendar, Star, ArrowRight, MessageSquare, Clipboard, CheckCircle } from 'lucide-react';
import { apiFetch } from '../api';

export default function CustomerDashboard() {
  const { user, token, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState('');

  // Chat state
  const [chatBooking, setChatBooking] = useState(null);

  // Provider Application form state
  const [skills, setSkills] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  // Review Modal state
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchCustomerBookings = async () => {
    if (!token) return;
    setLoadingBookings(true);
    setBookingsError('');
    try {
      const res = await apiFetch('/api/bookings/customer', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setBookingsError('Error loading bookings from server.');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchCustomerBookings();
  }, [token]);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const res = await apiFetch(`/api/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchCustomerBookings();
      else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || 'Failed to cancel booking');
      }
    } catch { alert('Error cancelling booking.'); }
  };

  const handleApplyProvider = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError('');
    setApplySuccess('');
    try {
      const res = await apiFetch('/api/provider-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ skills, portfolioLinks })
      });
      if (res.ok) {
        setApplySuccess(t('application_submitted'));
        setSkills('');
        setPortfolioLinks('');
        refreshUser();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Application submission failed.');
      }
    } catch (err) {
      setApplyError(err.message || 'Failed to submit application.');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      const res = await apiFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bookingId: selectedBookingForReview.id, rating, comment })
      });
      if (res.ok) {
        setReviewSuccess('Review submitted! Thank you.');
        setTimeout(() => {
          setSelectedBookingForReview(null);
          setComment('');
          setRating(5);
          setReviewSuccess('');
          fetchCustomerBookings();
        }, 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewError(err.message || 'Error submitting review.');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {t('customer_db_title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Track your bookings, chat with providers, leave reviews, or apply to offer services.
        </p>

        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <div
              className={`sidebar-tab ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={18} />
              <span>{t('my_bookings')} ({bookings.length})</span>
            </div>
            {user?.role === 'CUSTOMER' && (
              <div
                className={`sidebar-tab ${activeTab === 'apply' ? 'active' : ''}`}
                onClick={() => setActiveTab('apply')}
              >
                <Clipboard size={18} />
                <span>{t('nav_provider_app')}</span>
              </div>
            )}
          </aside>

          <section className="dashboard-main">
            {activeTab === 'bookings' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>{t('my_bookings')}</h2>

                {loadingBookings ? (
                  <div style={{ color: 'var(--text-muted)' }}>Loading bookings...</div>
                ) : bookingsError ? (
                  <div style={{ color: 'var(--color-danger)' }}>{bookingsError}</div>
                ) : bookings.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p style={{ marginBottom: '1rem' }}>{t('no_bookings')}</p>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/#listings')}>
                      Browse Services <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Provider</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td style={{ fontWeight: 600 }}>{booking.listingTitle}</td>
                            <td>{booking.providerName}</td>
                            <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                {t(`status_${booking.status.toLowerCase()}`)}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                {/* Chat button — always available */}
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setChatBooking(booking)}
                                  title="Chat with provider"
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  <MessageSquare size={13} />
                                  <span>Chat</span>
                                </button>

                                {(booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    {t('action_cancel')}
                                  </button>
                                )}

                                {booking.status === 'COMPLETED' && (
                                  <button
                                    className="btn btn-accent btn-sm"
                                    onClick={() => setSelectedBookingForReview(booking)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                  >
                                    <Star size={12} />
                                    <span>{t('leave_review')}</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bookings.filter((b) => b.status === 'ACCEPTED').map((b) => (
                      <WorkEscrowPanel key={`escrow-${b.id}`} booking={b} role="customer" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'apply' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>{t('apply_title')}</h2>

                {applySuccess && (
                  <div style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} /><span>{applySuccess}</span>
                  </div>
                )}
                {applyError && (
                  <div style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                    {applyError}
                  </div>
                )}

                <form onSubmit={handleApplyProvider}>
                  <div className="form-group">
                    <label className="form-label">{t('apply_skills')} *</label>
                    <textarea className="form-input" rows="3"
                      placeholder="e.g. Calculus tutoring, Laundry, Delivery errands..."
                      value={skills} onChange={(e) => setSkills(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('apply_portfolio')}</label>
                    <input type="text" className="form-input"
                      placeholder="e.g. Telegram @handle, GitHub, phone..."
                      value={portfolioLinks} onChange={(e) => setPortfolioLinks(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={applyLoading}>
                    {applyLoading ? 'Submitting...' : t('submit_application')}
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>

        {/* Chat Modal */}
        {chatBooking && (
          <ChatModal
            booking={chatBooking}
            onClose={() => setChatBooking(null)}
          />
        )}

        {/* Review Modal */}
        {selectedBookingForReview && (
          <div className="modal-overlay" onClick={() => setSelectedBookingForReview(null)}>
            <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{t('leave_review')}</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedBookingForReview(null)}>✕</button>
              </div>

              {reviewSuccess && (
                <div style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  {reviewSuccess}
                </div>
              )}
              {reviewError && (
                <div style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Service: </span>
                  <span style={{ fontWeight: 600 }}>{selectedBookingForReview.listingTitle}</span>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('rating')}</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button"
                        className={`star-btn ${star <= rating ? 'active' : ''}`}
                        onClick={() => setRating(star)}>★</button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('comment')}</label>
                  <textarea className="form-input" rows="3"
                    placeholder="Describe the quality and experience..."
                    value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={reviewLoading}>
                  {reviewLoading ? 'Submitting...' : t('submit_review')}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
