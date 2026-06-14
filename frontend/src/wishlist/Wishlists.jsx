import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { Heart, Trash2, MapPin, Bus, Hotel, ArrowLeft, Compass } from 'lucide-react';
import { useAuth } from '../customhooks/AuthContext';

const Wishlists = () => {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  // Fetch wishlists on load//
  
  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    try {
      if (!token) {
        setError('Please login to view your wishlists.');
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get('/wishlist/get');

      if (response.data.success) {
        setWishlists(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load wishlists.');
      }
    } catch (err) {
      console.error('Error fetching wishlists:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete entire wishlist //
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this wishlist?')) return;

    try {
      const response = await axiosInstance.delete(`/wishlist/delete/${id}`);

      if (response.data.success) {
        // Remove from UI
        setWishlists(wishlists.filter(list => list._id !== id));
      } else {
        alert('Failed to delete: ' + response.data.message);
      }
    } catch (err) {
      console.error('Error deleting wishlist:', err);
      alert('Something went wrong while deleting.');
    }
  };

  // Remove individual item from wishlist //
  const handleRemoveItem = async (listId, type, itemId) => {
    try {
      const response = await axiosInstance.put('/wishlist/remove-item', 
        { listId, type, itemId }
      );

      if (response.data.success) {
        fetchWishlists();
      } else {
        alert('Failed to remove item: ' + response.data.message);
      }
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Something went wrong while removing item.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', color: 'var(--text-body)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <Link to="/" style={{ color: 'var(--text-body)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass size={24} color="var(--brand-from)" />
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>My Wishlists</h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <Heart size={24} color="#ef4444" fill="#ef4444" />
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>Saved Trips</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading your wishlists...</div>
        ) : error ? (
          <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        ) : wishlists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
            <Heart size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', color: 'var(--text-heading)', marginBottom: '8px' }}>Your wishlist is empty</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Save your favorite hotels and buses while exploring to find them easily later.</p>
            <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: '8px', display: 'inline-block' }}>
              Explore India
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {wishlists.map((list) => (
              <div key={list._id} style={{
                background: 'var(--bg-surface)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                padding: '24px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>
                    {list.listName}
                  </h3>
                  <button 
                    onClick={() => handleDelete(list._id)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '8px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Delete wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Destinations */}
                {list.destinations && list.destinations.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '16px', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <Compass size={16} color="var(--brand-from)" /> Saved Destinations
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                      {list.destinations.map(loc => (
                        <div key={loc._id} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                          <button onClick={() => handleRemoveItem(list._id, 'destination', loc._id)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }} title="Remove destination"><Trash2 size={14} /></button>
                          {loc.image ? (
                            <img src={loc.image} alt={loc.locationName || loc.city} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '140px', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{loc.city}</div>
                          )}
                          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-heading)' }}>{loc.locationName || loc.city}</h5>
                            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                              <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }}/> 
                              {loc.state}, India
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                              <span style={{ fontWeight: '600', color: 'var(--brand-from)' }}>Rs. {loc.startingPrice}</span>
                              <Link to={`/destination/${loc._id}`} style={{ fontSize: '12px', color: 'var(--brand-from)', textDecoration: 'none' }}>Explore</Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hotels */}
                {list.hotels && list.hotels.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '16px', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <Hotel size={16} color="var(--brand-from)" /> Saved Hotels
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                      {list.hotels.map(hotel => (
                        <div key={hotel._id} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                          <button onClick={() => handleRemoveItem(list._id, 'hotel', hotel._id)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }} title="Remove hotel"><Trash2 size={14} /></button>
                          {hotel.images && hotel.images[0] ? (
                            <img src={hotel.images[0]} alt={hotel.hotelName} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '140px', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{hotel.hotelName}</div>
                          )}
                          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-heading)' }} title={hotel.hotelName}>
                              {hotel.hotelName.length > 19 ? hotel.hotelName.slice(0, 19) + '...' : hotel.hotelName}
                            </h5>
                            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                              <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }}/> 
                              {hotel.location?.city || 'Unknown Location'}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                              <span style={{ fontWeight: '600', color: 'var(--brand-from)' }}>Rs. {hotel.pricePerNight}</span>
                              <Link to={`/hotel/${hotel._id}`} style={{ fontSize: '12px', color: 'var(--brand-from)', textDecoration: 'none' }}>View details</Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buses */}
                {list.buses && list.buses.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '16px', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <Bus size={16} color="var(--brand-from)" /> Saved Buses
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                      {list.buses.map(bus => (
                        <div key={bus._id} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                          <button onClick={() => handleRemoveItem(list._id, 'bus', bus._id)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }} title="Remove bus"><Trash2 size={14} /></button>
                          {bus.images && bus.images[0] ? (
                            <img src={bus.images[0]} alt={bus.busName} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '140px', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{bus.busName}</div>
                          )}
                          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-heading)' }}>{bus.busName}</h5>
                            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)' }}>{bus.busType}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                              <span style={{ fontWeight: '600', color: 'var(--brand-from)' }}>Rs. {bus.fare}</span>
                              <Link to={`/bus/${bus._id}`} style={{ fontSize: '12px', color: 'var(--brand-from)', textDecoration: 'none' }}>Book Seat</Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!list.hotels || list.hotels.length === 0) && (!list.buses || list.buses.length === 0) && (!list.destinations || list.destinations.length === 0) && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>This wishlist has no items yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlists;