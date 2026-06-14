import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { ArrowLeft, Star, MapPin, CheckCircle, Bus as BusIcon, Clock, ArrowUpDown } from 'lucide-react';
import AddBooking from '../booking/Addbboking';
import { useAuth } from '../customhooks/AuthContext';

const BusDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isLoggedIn = Boolean(token);

  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking modal
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const response = await axiosInstance.get(`/bus/get/${id}`);
        if (response.data.bus) {
          setBus(response.data.bus);
        } else {
          setError(response.data.message || 'Bus not found');
        }
      } catch (err) {
        console.error('Error fetching bus:', err);
        setError('Failed to load bus details');
      } finally {
        setLoading(false);
      }
    };
    fetchBus();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)', color: 'var(--text-body)' }}>
        <p>Loading bus details...</p>
      </div>
    );
  }

  if (error || !bus) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)', color: 'var(--text-body)', gap: '16px' }}>
        <p>{error || 'Bus not found'}</p>
        <button className="d-btn brand" onClick={() => navigate('/')}>Go Back Home</button>
      </div>
    );
  }

  const handleBookSeat = () => {
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
            {bus.images && bus.images[0] ? (
              <img src={bus.images[0]} alt={bus.busName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                {bus.busName}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '16px' }}>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {bus.images && bus.images[1] ? (
                <img src={bus.images[1]} alt={bus.busName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No extra images
                </div>
              )}
            </div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {bus.images && bus.images[2] ? (
                <img src={bus.images[2]} alt={bus.busName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No extra images
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bus Info & Booking Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
          
          {/* Left Column - Info */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ display: 'inline-block', backgroundColor: 'rgba(52,211,153,0.12)', color: '#34d399', padding: '4px 12px', fontSize: '12px', fontWeight: '600', borderRadius: '4px', textTransform: 'capitalize', marginBottom: '12px' }}>
                  {bus.busType || 'Bus'}
                </span>
                <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-heading)', margin: '0 0 8px 0' }}>{bus.busName}</h1>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BusIcon size={14} /> Number: {bus.busNumber} | Operator: {bus.operatorName}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '20px', fontWeight: '700' }}>
                  <Star size={20} fill="#fbbf24" />
                  {bus.rating ? `${bus.rating} / 5` : '4.5 / 5'}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{bus.reviewsCount || 12} reviews</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '32px 0' }} />

            {/* Route Info */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '16px' }}>Route Details</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>From</span>
                  <strong style={{ fontSize: '20px', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} color="#818cf8" /> {bus.fromCityID?.city || 'Origin'}
                  </strong>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <ArrowUpDown size={24} style={{ color: 'var(--brand-from)', transform: 'rotate(90deg)', marginBottom: '8px' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {bus.duration || 'N/A'} hours
                  </span>
                </div>

                <div style={{ flex: 1, textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>To</span>
                  <strong style={{ fontSize: '20px', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    {bus.toCityID?.city || 'Destination'} <MapPin size={18} color="#f87171" />
                  </strong>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '32px 0' }} />

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginBottom: '32px' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '16px' }}>Boarding Points</h2>
                {bus.boardingPoints && bus.boardingPoints.length > 0 ? (
                  <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-body)', lineHeight: '1.8' }}>
                    {bus.boardingPoints.map((point, index) => (
                      <li key={index}>
                        {typeof point === 'object' ? `${point.name || ''} ${point.time ? `(${point.time})` : ''}` : point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>Not specified.</p>
                )}
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '16px' }}>Dropping Points</h2>
                {bus.droppingPoints && bus.droppingPoints.length > 0 ? (
                  <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-body)', lineHeight: '1.8' }}>
                    {bus.droppingPoints.map((point, index) => (
                      <li key={index}>
                        {typeof point === 'object' ? `${point.name || ''} ${point.time ? `(${point.time})` : ''}` : point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>Not specified.</p>
                )}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '32px 0' }} />

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '16px' }}>Amenities</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {bus.amenities && bus.amenities.length > 0 ? (
                  bus.amenities.map((amenity, index) => (
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
            
          </div>

          {/* Right Column - Booking Card */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div className="panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-heading)' }}>Rs. {bus.fare}</span>
                <span style={{ color: 'var(--text-muted)' }}>/ seat</span>
              </div>
              
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Seats:</span>
                  <strong style={{ color: 'var(--text-heading)' }}>{bus.totalSeats}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Available Seats:</span>
                  <strong style={{ color: 'var(--brand-from)' }}>{bus.availableSeats}</strong>
                </div>
              </div>

              <button 
                onClick={handleBookSeat}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: 'var(--brand-from)', color: 'white', fontWeight: '700', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'transform 0.2s', boxShadow: '0 8px 24px rgba(99,102,241,0.25)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                Book Seat
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
              initialType="bus"
              initialId={bus._id}
              initialCity={bus.toCityID?.city || ''}
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

export default BusDetails;
