import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { ArrowLeft, Star, MapPin, CheckCircle, Wifi, Coffee, Car, Shield } from 'lucide-react';
import AddBooking from '../booking/Addbboking';
import { useAuth } from '../customhooks/AuthContext';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isLoggedIn = Boolean(token);

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking modal
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await axiosInstance.get(`/hotel/gethotel/${id}`);
        if (response.data.hotel) {
          setHotel(response.data.hotel);
        } else {
          setError(response.data.message || 'Hotel not found');
        }
      } catch (err) {
        console.error('Error fetching hotel:', err);
        setError('Failed to load hotel details');
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)', color: 'var(--text-body)' }}>
        <p>Loading hotel details...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)', color: 'var(--text-body)', gap: '16px' }}>
        <p>{error || 'Hotel not found'}</p>
        <button className="d-btn brand" onClick={() => navigate('/')}>Go Back Home</button>
      </div>
    );
  }

  const handleBookStay = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setIsBookingOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', color: 'var(--text-body)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(7, 8, 15, 0.8)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: '800', textDecoration: 'none' }}>
            <span style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              JourneyHub
            </span>
          </Link>
          <button className="d-btn ghost" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-heading)', background: 'rgba(255, 255, 255, 0.05)', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        
        {/* Images Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '32px', height: '400px' }}>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {hotel.images && hotel.images[0] ? (
              <img src={hotel.images[0]} alt={hotel.hotelName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                {hotel.hotelName}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '16px' }}>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {hotel.images && hotel.images[1] ? (
                <img src={hotel.images[1]} alt={hotel.hotelName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No extra images
                </div>
              )}
            </div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {hotel.images && hotel.images[2] ? (
                <img src={hotel.images[2]} alt={hotel.hotelName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No extra images
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hotel Info & Booking Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
          
          {/* Left Column - Info */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ display: 'inline-block', backgroundColor: 'rgba(99,102,241,0.12)', color: '#818cf8', padding: '4px 12px', fontSize: '12px', fontWeight: '600', borderRadius: '4px', textTransform: 'capitalize', marginBottom: '12px' }}>
                  {hotel.hotelType || 'Hotel'}
                </span>
                <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-heading)', margin: '0 0 12px 0' }}>{hotel.hotelName}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <MapPin size={16} />
                  <span>{hotel.location?.address}, {hotel.location?.city}, {hotel.location?.state} {hotel.location?.pincode}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '20px', fontWeight: '700' }}>
                  <Star size={20} fill="#fbbf24" />
                  {hotel.rating ? `${hotel.rating} / 5` : 'New'}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{hotel.reviewsCount || 0} reviews</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '32px 0' }} />

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '16px' }}>About this property</h2>
              <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--text-body)', whiteSpace: 'pre-line' }}>
                {hotel.description}
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '32px 0' }} />

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '16px' }}>Amenities</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {hotel.amenities && hotel.amenities.length > 0 ? (
                  hotel.amenities.map((amenity, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-body)' }}>
                      <CheckCircle size={16} color="var(--brand-from)" />
                      {amenity}
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No amenities listed.</p>
                )}
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '32px 0' }} />
            
            <div style={{ display: 'flex', gap: '40px', marginBottom: '32px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-heading)', marginBottom: '8px' }}>Check-in time</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>{hotel.checkInTime || '12:00 PM'}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-heading)', marginBottom: '8px' }}>Check-out time</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>{hotel.checkOutTime || '11:00 AM'}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div className="panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-heading)' }}>Rs. {hotel.pricePerNight}</span>
                <span style={{ color: 'var(--text-muted)' }}>/ night</span>
              </div>
              
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Rooms Available:</span>
                  <strong style={{ color: 'var(--text-heading)' }}>{hotel.availableRooms}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Contact:</span>
                  <strong style={{ color: 'var(--text-heading)' }}>{hotel.contactNumber}</strong>
                </div>
              </div>

              <button 
                onClick={handleBookStay}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: 'var(--brand-from)', color: 'white', fontWeight: '700', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'transform 0.2s', boxShadow: '0 8px 24px rgba(99,102,241,0.25)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                Book Your Stay
              </button>
            </div>
          </div>
          
        </div>
      </main>

      {/* ── BOOKING MODAL ── */}
      {isBookingOpen && (
        <div className="modal-overlay" onClick={() => setIsBookingOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px' }}>
            <AddBooking
              initialType="hotel"
              initialId={hotel._id}
              initialCity={hotel.location?.city || ''}
              isModal={true}
              onClose={() => setIsBookingOpen(false)}
              onCreated={() => {
                setIsBookingOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetails;
