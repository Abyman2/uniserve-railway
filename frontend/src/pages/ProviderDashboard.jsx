import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { Wrench, Calendar, Star, MapPin, Trash2, Plus, AlertCircle, MessageSquare } from 'lucide-react';
import ChatModal from '../components/ChatModal';
import WorkEscrowPanel from '../components/WorkEscrowPanel';
import { useNotification } from '../context/NotificationContext';
import { apiFetch } from '../api';

export default function ProviderDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const { notify } = useNotification();

  const [activeTab, setActiveTab] = useState('bookings');

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');
  const [chatBooking, setChatBooking] = useState(null);

  // Listings state
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState('');

  // Create Listing Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tutoring');
  const [price, setPrice] = useState('');
  const [campus, setCampus] = useState('Main Campus');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Chat state

  // Fetch Provider Bookings
  const fetchProviderBookings = async () => {
    setBookingsLoading(true);
    setBookingsError('');
    try {
      const res = await apiFetch('/api/bookings/provider', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        setBookingsError(`Failed to load bookings (${res.status})`);
      }
    } catch (err) {
      setBookingsError('Network error loading bookings.');
    } finally {
      setBookingsLoading(false);
    }
  };

  // Fetch Provider Listings — always fetch fresh, handle all response shapes
  const fetchProviderListings = async () => {
    setListingsLoading(true);
    setListingsError('');
    try {
      const res = await apiFetch('/api/listings/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Backend returns Spring Page object: { content: [...], ... }
        // But guard against plain array too
        if (Array.isArray(data)) {
          setListings(data);
        } else if (data.content) {
          setListings(data.content);
        } else {
          setListings([]);
        }
      } else {
        const errText = await res.text().catch(() => '');
        setListingsError(`Failed to load listings (${res.status}). ${errText}`);
      }
    } catch (err) {
      setListingsError('Network error loading your listings.');
    } finally {
      setListingsLoading(false);
    }
  };

  // Fetch Provider Reviews
  const fetchProviderReviews = async () => {
    if (!user) return;
    setReviewsLoading(true);
    try {
      const res = await apiFetch(`/api/reviews/provider/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Fetch everything on mount so switching tabs is instant
  useEffect(() => {
    if (token) {
      fetchProviderBookings();
      fetchProviderListings();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'reviews' && user) fetchProviderReviews();
  }, [activeTab, user]);

  // Accept Booking
  const handleAcceptBooking = async (id) => {
    try {
      const res = await apiFetch(`/api/bookings/${id}/accept`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        notify('Booking accepted', 'The customer has been notified', 'booking');
        fetchProviderBookings();
      }
    } catch (err) { console.error(err); }
  };

  // Reject Booking
  const handleRejectBooking = async (id) => {
    try {
      const res = await apiFetch(`/api/bookings/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchProviderBookings();
    } catch (err) { console.error(err); }
  };

  // Complete Booking
  const handleCompleteBooking = async (id) => {
    try {
      const res = await apiFetch(`/api/bookings/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchProviderBookings();
    } catch (err) { console.error(err); }
  };

  // Deactivate listing
  const handleDeleteListing = async (id) => {
    if (!window.confirm('Deactivate this listing?')) return;
    try {
      const res = await apiFetch(`/api/listings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchProviderListings();
    } catch (err) { console.error(err); }
  };

  // Create listing
  const handleCreateListing = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      const res = await apiFetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category,
          price: parseFloat(price),
          campus
        })
      });
      if (res.ok) {
        setCreateSuccess('Service published successfully!');
        setTitle(''); setDescription(''); setPrice('');
        // Refresh listings immediately
        fetchProviderListings();
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateSuccess('');
        }, 1200);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed (${res.status})`);
      }
    } catch (err) {
      setCreateError(err.message || 'Error creating listing.');
    } finally {
      setCreateLoading(false);
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 'N/A';
    return (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {t('provider_db_title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Manage your bookings, service listings, and student reviews.
        </p>

        <div className="dashboard-layout">
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <div
              className={`sidebar-tab ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={18} />
              <span>Booking Requests ({bookings.length})</span>
            </div>
            <div
              className={`sidebar-tab ${activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => setActiveTab('listings')}
            >
              <Wrench size={18} />
              <span>My Listings ({listings.length})</span>
            </div>
            <div
              className={`sidebar-tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={18} />
              <span>My Reviews ({reviews.length})</span>
            </div>
          </aside>

          {/* Main Panel */}
          <section className="dashboard-main">

            {/* ── BOOKINGS TAB ── */}
            {activeTab === 'bookings' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Booking Requests</h2>
                {bookingsLoading ? (
                  <div style={{ color: 'var(--text-muted)' }}>Loading requests...</div>
                ) : bookingsError ? (
                  <div style={{ color: 'var(--color-danger)', background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <AlertCircle size={16} /> {bookingsError}
                  </div>
                ) : bookings.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
                    No booking requests for your services yet.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Student</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td style={{ fontWeight: 600 }}>{booking.listingTitle}</td>
                            <td>{booking.buyerName}</td>
                            <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                {t(`status_${booking.status.toLowerCase()}`)}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                {/* Chat button — always visible */}
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setChatBooking(booking)}
                                  title="Chat with customer"
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  <MessageSquare size={13} />
                                  <span>Chat</span>
                                </button>
                                {booking.status === 'PENDING' && (
                                  <>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleAcceptBooking(booking.id)}>
                                      {t('action_accept')}
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleRejectBooking(booking.id)}>
                                      {t('action_reject')}
                                    </button>
                                  </>
                                )}
                                {booking.status === 'ACCEPTED' && (
                                  <button className="btn btn-accent btn-sm" onClick={() => handleCompleteBooking(booking.id)}>
                                    {t('action_complete')}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bookings.filter((b) => b.status === 'ACCEPTED').map((b) => (
                      <WorkEscrowPanel key={`escrow-${b.id}`} booking={b} role="provider" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── LISTINGS TAB ── */}
            {activeTab === 'listings' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    My Services {!listingsLoading && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>({listings.length} total)</span>}
                  </h2>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} />
                    <span>Create New Service</span>
                  </button>
                </div>

                {listingsLoading ? (
                  <div style={{ color: 'var(--text-muted)' }}>Loading your listings...</div>
                ) : listingsError ? (
                  <div style={{ color: 'var(--color-danger)', background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong>Could not load listings.</strong>
                      <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{listingsError}</div>
                      <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }} onClick={fetchProviderListings}>
                        Retry
                      </button>
                    </div>
                  </div>
                ) : listings.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                    <Wrench size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                    <p>You haven't published any service listings yet.</p>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => setShowCreateModal(true)}>
                      <Plus size={14} /> Create Your First Service
                    </button>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Campus</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map((item) => (
                          <tr key={item.id}>
                            <td style={{ fontWeight: 600 }}>{item.title}</td>
                            <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                              {item.category}
                            </td>
                            <td>{item.price} ETB</td>
                            <td style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                              {item.campus}
                            </td>
                            <td>
                              <span className={`status-badge ${item.status === 'ACTIVE' ? 'status-completed' : 'status-cancelled'}`}>
                                {item.status}
                              </span>
                            </td>
                            <td>
                              {item.status === 'ACTIVE' && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleDeleteListing(item.id)}
                                  title="Deactivate Listing"
                                  style={{ color: 'var(--color-danger)' }}
                                >
                                  <Trash2 size={14} />
                                </button>
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

            {/* ── REVIEWS TAB ── */}
            {activeTab === 'reviews' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>My Customer Reviews</h2>
                  {reviews.length > 0 && (
                    <div className="listing-rating" style={{ fontSize: '1.1rem' }}>
                      <Star size={18} fill="currentColor" />
                      <span>Average: {getAverageRating()} ({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>

                {reviewsLoading ? (
                  <div style={{ color: 'var(--text-muted)' }}>Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
                    You haven't received any customer reviews yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviews.map((rev) => (
                      <div key={rev.id} style={{ border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 700 }}>{rev.reviewerName || 'Anonymous Student'}</span>
                          <div style={{ display: 'flex', color: 'var(--color-accent)' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill={i < rev.rating ? 'currentColor' : 'none'} color="currentColor" />
                            ))}
                          </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{rev.comment}</p>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.5rem' }}>
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

        {/* Create Listing Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Service Listing</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>✕</button>
              </div>

              {createSuccess && (
                <div style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  ✓ {createSuccess}
                </div>
              )}
              {createError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateListing}>
                <div className="form-group">
                  <label className="form-label">{t('listing_title_field')} *</label>
                  <input type="text" className="form-input" placeholder="e.g. Calculus & Linear Algebra Tutoring"
                    value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('listing_desc_field')} *</label>
                  <textarea className="form-input" rows="3" placeholder="Describe your service, experience, availability..."
                    value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('listing_category_field')} *</label>
                    <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Tutoring">Tutoring & Tech</option>
                      <option value="Laundry">Laundry & Cleaning</option>
                      <option value="Delivery">Delivery & Errands</option>
                      <option value="Creative">Creative & Design</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('listing_price_field')} *</label>
                    <input type="number" className="form-input" placeholder="e.g. 150"
                      value={price} onChange={(e) => setPrice(e.target.value)} min="1" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('listing_campus_field')} *</label>
                  <select className="form-input" value={campus} onChange={(e) => setCampus(e.target.value)}>
                    <option value="Main Campus">Main Campus</option>
                    <option value="Technology Campus">Technology Campus</option>
                    <option value="Science Campus">Science Campus</option>
                    <option value="Business School">Business School</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={createLoading}>
                  {createLoading ? 'Publishing...' : t('submit_listing')}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
