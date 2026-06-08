import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { Star, MapPin, Search, Calendar, Award, MessageSquare } from 'lucide-react';
import { apiFetch } from '../api';

export default function Listings() {
  const { user, token, portal } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [campus, setCampus] = useState('');

  // Selected Listing Modal State
  const [selectedListing, setSelectedListing] = useState(null);
  const [providerReviews, setProviderReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch listings from backend
  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      // Spring Boot endpoint: GET /api/listings?category=...&campus=...
      const url = `/api/listings?category=${encodeURIComponent(category)}&campus=${encodeURIComponent(campus)}&size=100`;
      const res = await apiFetch(url);
      if (!res.ok) throw new Error('Failed to load listings');
      const data = await res.json();
      // Spring Data Page format contains content array
      setListings(data.content || []);
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, campus]);

  // Handle manual search trigger
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  // Filter listings client-side based on search string
  const filteredListings = listings.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    item.description.toLowerCase().includes(search.toLowerCase()) ||
    item.providerName.toLowerCase().includes(search.toLowerCase())
  );

  // Load reviews when modal opens
  const openListingDetail = async (listing) => {
    setSelectedListing(listing);
    setProviderReviews([]);
    setReviewsLoading(true);
    setBookingSuccess('');
    setBookingError('');
    try {
      // GET /api/reviews/provider/{providerId}
      const res = await apiFetch(`/api/reviews/provider/${listing.providerId}`);
      if (res.ok) {
        const reviewsData = await res.json();
        setProviderReviews(reviewsData);
      }
    } catch (err) {
      console.error("Error fetching provider reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Submit booking
  const handleBookService = async () => {
    if (!user || portal !== 'customer') {
      setBookingError('You must be logged in as a Student Customer to book services.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      const res = await apiFetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ listingId: selectedListing.id })
      });

      if (res.ok) {
        setBookingSuccess('Service booked successfully! You can track it in your Dashboard.');
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to request booking');
      }
    } catch (err) {
      setBookingError(err.message || 'Booking request failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Calculate average rating helper
  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="app-container">
      <Navbar />
      
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('hero_title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            {t('hero_subtitle')}
          </p>

          <form onSubmit={handleSearchSubmit} className="hero-search-container">
            <Search size={20} style={{ color: 'var(--text-muted)', alignSelf: 'center', marginLeft: '0.5rem' }} />
            <input 
              type="text" 
              className="hero-search-input"
              placeholder={t('search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              {t('search_button')}
            </button>
          </form>

          {/* Filters Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', alignItems: 'center', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>{t('campus')}:</label>
              <select 
                className="form-input" 
                style={{ width: '180px', padding: '0.4rem 0.8rem' }}
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
              >
                <option value="">{t('filter_all')}</option>
                <option value="Main Campus">Main Campus</option>
                <option value="Technology Campus">Technology Campus</option>
                <option value="Science Campus">Science Campus</option>
                <option value="Business School">Business School</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="category-tags">
            <button 
              className={`category-tag ${category === '' ? 'active' : ''}`}
              onClick={() => setCategory('')}
            >
              {t('filter_all')}
            </button>
            <button 
              className={`category-tag ${category === 'Tutoring' ? 'active' : ''}`}
              onClick={() => setCategory('Tutoring')}
            >
              {t('category_tutoring')}
            </button>
            <button 
              className={`category-tag ${category === 'Laundry' ? 'active' : ''}`}
              onClick={() => setCategory('Laundry')}
            >
              {t('category_laundry')}
            </button>
            <button 
              className={`category-tag ${category === 'Delivery' ? 'active' : ''}`}
              onClick={() => setCategory('Delivery')}
            >
              {t('category_delivery')}
            </button>
            <button 
              className={`category-tag ${category === 'Creative' ? 'active' : ''}`}
              onClick={() => setCategory('Creative')}
            >
              {t('category_creative')}
            </button>
          </div>
        </section>

        {/* Listings Section */}
        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            {t('listings_title')}
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading listings...
            </div>
          ) : error ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              {error}
            </div>
          ) : filteredListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
              {t('no_listings')}
            </div>
          ) : (
            <div className="grid-listings">
              {filteredListings.map((item) => (
                <div 
                  key={item.id} 
                  className="listing-card animate-fade-in"
                  onClick={() => openListingDetail(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="listing-image-placeholder">
                    <Award size={48} />
                  </div>
                  <div className="listing-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        {item.category}
                      </span>
                      <div className="listing-rating">
                        <Star size={14} fill="currentColor" />
                        <span>5.0 (New)</span>
                      </div>
                    </div>
                    <h3 className="listing-title">{item.title}</h3>
                    <p className="listing-description">{item.description}</p>
                    
                    <div className="listing-meta">
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('provider')}</div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.providerName}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="listing-price">{item.price} ETB</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', marginTop: '0.15rem' }}>
                          <MapPin size={10} />
                          {item.campus}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Listing Detail Modal */}
        {selectedListing && (
          <div className="modal-overlay" onClick={() => setSelectedListing(null)}>
            <div className="modal-content animate-fade-in" style={{ maxWidth: '650px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedListing.title}</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedListing(null)}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                
                {/* Meta details */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('price')}</div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>{selectedListing.price} ETB</span>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('campus')}</div>
                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                      <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                      {selectedListing.campus}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('provider')}</div>
                    <span style={{ fontWeight: 600, marginTop: '0.2rem', display: 'block' }}>{selectedListing.providerName}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' }}>Description</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{selectedListing.description}</p>
                </div>

                {/* Booking status alerts */}
                {bookingSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                    {bookingSuccess}
                  </div>
                )}
                {bookingError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                    {bookingError}
                  </div>
                )}

                {/* Booking Call to Action */}
                {(!user || (user && portal === 'customer')) && !bookingSuccess && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button 
                      className="btn btn-primary btn-lg" 
                      style={{ flex: 1 }}
                      onClick={handleBookService}
                      disabled={bookingLoading}
                    >
                      <Calendar size={18} />
                      <span>{bookingLoading ? 'Requesting...' : t('book_now')}</span>
                    </button>
                  </div>
                )}

                {/* Provider Reviews Section (GET /api/reviews/provider/{id}) */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MessageSquare size={16} />
                      {t('reviews_title')}
                    </h3>
                    {providerReviews.length > 0 && (
                      <div className="listing-rating" style={{ fontSize: '1rem' }}>
                        <Star size={16} fill="currentColor" />
                        <span>{getAverageRating(providerReviews)} ({providerReviews.length} {providerReviews.length === 1 ? 'review' : 'reviews'})</span>
                      </div>
                    )}
                  </div>

                  {reviewsLoading ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Loading reviews...
                    </div>
                  ) : providerReviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                      {t('no_reviews')}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {providerReviews.map((rev) => (
                        <div key={rev.id} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rev.reviewerName || 'Anonymous Student'}</span>
                            <div style={{ display: 'flex', gap: '0.2rem', color: 'var(--color-accent)' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={12} 
                                  fill={i < rev.rating ? 'currentColor' : 'none'} 
                                  color="currentColor" 
                                />
                              ))}
                            </div>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{rev.comment}</p>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.25rem' }}>
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
