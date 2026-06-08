import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { Star, MapPin, Search, Calendar, Award, MessageSquare, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import { apiFetch } from '../api';

/* Animate on scroll */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

export default function Home() {
  const { user, token, portal } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [providerReviews, setProviderReviews] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  const [listingsRef, listingsVisible] = useReveal();

  useEffect(() => {
    if (window.location.hash === '#listings') {
      setTimeout(() => document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const url = `/api/listings?category=${encodeURIComponent(category)}&size=100`;
        const res = await apiFetch(url);
        if (res.ok) {
          const data = await res.json();
          setListings(data.content || []);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    load();
  }, [category]);

  const filtered = listings.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  const openDetail = async (listing) => {
    setSelectedListing(listing);
    setBookingSuccess(''); setBookingError('');
    try {
      const res = await apiFetch(`/api/reviews/provider/${listing.providerId}`);
      if (res.ok) setProviderReviews(await res.json());
      else setProviderReviews([]);
    } catch { setProviderReviews([]); }
  };

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (portal !== 'customer') { setBookingError('Switch to Customer view to book services.'); return; }
    setBookingLoading(true);
    try {
      const res = await apiFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingId: selectedListing.id }),
      });
      if (res.ok) {
        setBookingSuccess('Booked! Check your dashboard.');
        notify('Booking sent', `Request for "${selectedListing.title}"`, 'booking');
      } else {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Booking failed');
      }
    } catch (err) { setBookingError(err.message); }
    finally { setBookingLoading(false); }
  };

  const scrollToListings = () => document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });

  const categories = ['', 'Tutoring', 'Laundry', 'Delivery', 'Creative'];
  const categoryLabels = { '': 'All', 'Tutoring': '📚 Tutoring', 'Laundry': '🧺 Laundry', 'Delivery': '📦 Delivery', 'Creative': '🎨 Creative' };

  return (
    <div className="home-page">
      <SiteHeader />

      {/* ── HERO ── */}
      <section className="landing-hero">
        {/* Animated background */}
        <div className="hero-blobs">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-blob hero-blob-3" />
        </div>
        <div className="hero-grain" />

        <div className="hero-content" style={{ animation: 'fadeUp 0.8s ease-out' }}>
          <div className="hero-badge">
            <Sparkles size={13} /> Campus marketplace
          </div>

          <h1 className="hero-title">UniServe</h1>

          <p className="hero-slogan">"From students, to students."</p>

          <p className="hero-desc">
            A platform designed by university students, for university students.
            Find trusted peers for tutoring, laundry, delivery, creative work, and more —
            book in seconds, chat in real time, pay safely through the platform.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary btn-lg magnetic-btn" onClick={scrollToListings}>
              Browse Services <ChevronDown size={18} />
            </button>
            {!user ? (
              <button className="btn btn-secondary btn-lg magnetic-btn" onClick={() => navigate('/login')}>
                Login <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn btn-secondary btn-lg magnetic-btn" onClick={() => navigate(portal === 'admin' ? '/admin' : portal === 'provider' ? '/provider' : '/customer')}>
                My Dashboard <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="scroll-indicator" onClick={scrollToListings} style={{ cursor: 'pointer' }}>
          <span>Scroll</span>
          <div className="scroll-indicator-line" />
        </div>
      </section>
      {/* About uniserve */}
      <section className="about-section">
        <h2>About UniServe</h2>
        <p>
          UniServe is a platform designed by students for students.
          We connect talented university students with those who need
          tutoring, creative work, delivery services, academic support,
          and more.
        </p>
      </section>

      {/* Why uniserve */}
      <section className="features-section">
        <div>💬 Real-time Chat</div>
        <div>🔒 Secure Escrow</div>
        <div>⭐ Reviews & Ratings</div>
        <div>🎓 Student Community</div>
      </section>

      {/* ── LISTINGS ── */}
      <section id="listings" className="home-listings">
        <div className="home-listings-inner" ref={listingsRef}>
          <h2 style={{ opacity: listingsVisible ? 1 : 0, transform: listingsVisible ? 'none' : 'translateY(20px)', transition: 'all 0.6s ease-out' }}>
            Campus Services
          </h2>
          <p style={{ opacity: listingsVisible ? 1 : 0, transition: 'all 0.6s ease-out 0.1s' }}>
            Discover services offered by fellow students
          </p>

          <div style={{ opacity: listingsVisible ? 1 : 0, transition: 'all 0.6s ease-out 0.2s' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
              <form className="hero-search-container" onSubmit={(e) => e.preventDefault()} style={{ margin: 0, flex: '1 1 260px', maxWidth: 420 }}>
                <Search size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                <input
                  className="hero-search-input"
                  placeholder="Search services, skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>
            </div>

            <div className="category-tags" style={{ marginBottom: '2rem' }}>
              {categories.map((c) => (
                <button
                  key={c || 'all'}
                  className={`category-tag ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {categoryLabels[c]}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="listings-status" style={{ opacity: 0.6 }}>Loading services...</div>
          ) : filtered.length === 0 ? (
            <div className="listings-status">
              {listings.length === 0
                ? 'No services yet — be the first provider!'
                : 'No services match your search.'}
            </div>
          ) : (
            <div className="grid-listings">
              {filtered.map((item, i) => (
                <div
                  key={item.id}
                  className="listing-card"
                  onClick={() => openDetail(item)}
                  style={{
                    opacity: listingsVisible ? 1 : 0,
                    transform: listingsVisible ? 'none' : 'translateY(30px)',
                    transition: `opacity 0.5s ease-out ${i * 0.07}s, transform 0.5s ease-out ${i * 0.07}s`,
                  }}
                >
                  <div className="listing-image-placeholder">
                    <Award size={42} />
                  </div>
                  <div className="listing-body">
                    <span className="listing-cat">{item.category}</span>
                    <h3 className="listing-title">{item.title}</h3>
                    <p className="listing-description">{item.description}</p>
                    <div className="listing-meta">
                      <span style={{ color: 'var(--ink-2)', fontSize: '0.8rem' }}>{item.providerName}</span>
                      <span className="listing-price">{item.price} ETB</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--ink-3)' }}>
                      <MapPin size={10} /> {item.campus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── LISTING DETAIL MODAL ── */}
      {selectedListing && (
        <div className="modal-overlay" onClick={() => setSelectedListing(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--violet)' }}>
                  {selectedListing.category}
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', marginTop: '0.2rem' }}>
                  {selectedListing.title}
                </h2>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedListing(null)}>✕</button>
            </div>

            <p style={{ color: 'var(--ink-2)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              {selectedListing.description}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', fontSize: '0.87rem', color: 'var(--ink-2)' }}>
              <span style={{ color: 'var(--teal)', fontWeight: 700, fontSize: '1.1rem' }}>
                {selectedListing.price} ETB
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={13} /> {selectedListing.campus}
              </span>
              <span>By <strong style={{ color: 'var(--ink-0)' }}>{selectedListing.providerName}</strong></span>
            </div>

            {bookingSuccess && <div className="alert-success">{bookingSuccess}</div>}
            {bookingError && <div className="alert-error">{bookingError}</div>}

            {!bookingSuccess && (
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.75rem' }}
                onClick={handleBook}
                disabled={bookingLoading}
              >
                <Calendar size={18} />
                {bookingLoading ? 'Booking...' : user ? 'Book Now' : 'Login to Book'}
              </button>
            )}

            {providerReviews.length > 0 && (
              <div style={{ marginTop: '1.75rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  <MessageSquare size={15} />
                  Reviews ({providerReviews.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {providerReviews.slice(0, 4).map((r) => (
                    <div key={r.id} style={{ padding: '0.85rem', background: 'var(--bg-3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < r.rating ? 'var(--amber)' : 'none'} color="var(--amber)" />
                        ))}
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-3)', marginLeft: 'auto' }}>
                          {r.reviewerName}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.83rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}