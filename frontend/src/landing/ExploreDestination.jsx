import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import { MapPin, Star, ArrowLeft, Hotel, Bus, ArrowUpDown, Search } from 'lucide-react'
import AddBooking from '../booking/Addbboking'
import LazyImage from '../components/LazyImage'
import { useAuth } from '../customhooks/AuthContext'

const ExploreDestination = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const isLoggedIn = Boolean(token)

  const [location, setLocation] = useState(null)
  const [hotels, setHotels] = useState([])
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search and Sort
  const [hotelSearch, setHotelSearch] = useState('')
  const [hotelSort, setHotelSort] = useState('default')
  const [busSearch, setBusSearch] = useState('')
  const [busSort, setBusSort] = useState('default')

  // Booking modal
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingType, setBookingType] = useState('hotel')
  const [bookingId, setBookingId] = useState('')
  const [bookingCity, setBookingCity] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')

    Promise.all([
      axiosInstance.get(`/location/get/${id}`),
      axiosInstance.get('/hotel/gethotel'),
      axiosInstance.get('/bus/get')
    ])
      .then(([locRes, hotelRes, busRes]) => {
        const loc = locRes.data.location
        setLocation(loc)

        // Filter hotels for this city
        const cityHotels = (hotelRes.data.hotels || []).filter(
          h => h.approvalStatus?.status && h.location?.city === loc.city
        )
        setHotels(cityHotels)

        // Filter buses going TO this city
        const cityBuses = (busRes.data.buses || []).filter(
          b => b.isActive && b.toCityID?.city === loc.city
        )
        setBuses(cityBuses)
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Could not load destination details')
      })
      .finally(() => setLoading(false))
  }, [id])

  const openBooking = (type, itemId = '') => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    setBookingType(type)
    setBookingId(itemId)
    setBookingCity(location?.city || '')
    setIsBookingOpen(true)
  }

  const filteredHotels = hotels
    .filter(hotel => {
      const q = hotelSearch.toLowerCase()
      return !q || (hotel.hotelName || '').toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (hotelSort === 'price-low') return a.pricePerNight - b.pricePerNight
      if (hotelSort === 'price-high') return b.pricePerNight - a.pricePerNight
      if (hotelSort === 'rating') return (b.rating || 0) - (a.rating || 0)
      if (hotelSort === 'name') return a.hotelName.localeCompare(b.hotelName)
      return 0
    })

  const filteredBuses = buses
    .filter(bus => {
      const q = busSearch.toLowerCase()
      return !q || 
             (bus.busName || '').toLowerCase().includes(q) || 
             (bus.operatorName || '').toLowerCase().includes(q) ||
             (bus.fromCityID?.city || '').toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (busSort === 'fare-low') return a.fare - b.fare
      if (busSort === 'fare-high') return b.fare - a.fare
      if (busSort === 'name') return a.busName.localeCompare(b.busName)
      return 0
    })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)', color: 'var(--text-body)' }}>
        <p>Loading destination...</p>
      </div>
    )
  }

  if (error || !location) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)', color: 'var(--text-body)', gap: '16px' }}>
        <p>{error || 'Destination not found'}</p>
        <button className="d-btn brand" onClick={() => navigate('/')}>Go Back Home</button>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', color: 'var(--text-body)' }}>

      {/* ── HEADER ── */}
      <header style={{ borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(7, 8, 15, 0.8)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: '800', textDecoration: 'none' }}>
            <span style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              JourneyHub
            </span>
          </Link>
          <button className="d-btn ghost" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-heading)', background: 'rgba(255, 255, 255, 0.05)', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <section style={{ position: 'relative', height: '350px', overflow: 'hidden' }}>
        {location.image ? (
          <LazyImage
            src={location.image}
            alt={location.city}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '48px', fontWeight: '800', color: 'white' }}>{location.city}</span>
          </div>
        )}
        {/* Dark overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(7,8,15,0.95), transparent)' }} />

        {/* Text on image */}
        <div className="animate-fadeInUp" style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '1200px', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
            <MapPin size={14} />
            {location.state}, {location.country || 'India'}
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'white', margin: 0 }}>
            {location.locationName || location.city}
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginTop: '8px', maxWidth: '600px' }}>
            Starting from Rs. {location.startingPrice}
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

        {/* About Section */}
        <div className="panel" style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '12px' }}>
            About {location.locationName || location.city}
          </h2>
          <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--text-body)' }}>
            {location.shortDescription}
          </p>

          {/* Quick action buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
            <button className="d-btn brand" onClick={() => openBooking('hotel')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Hotel size={16} /> Book Hotel in {location.city}
            </button>
            <button className="d-btn ghost" onClick={() => openBooking('bus')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '1px solid var(--border-input)' }}>
              <Bus size={16} /> Book Bus to {location.city}
            </button>
          </div>
        </div>

        {/* ── HOTELS IN THIS CITY ── */}
        <div initial="hidden" whileInView="show" style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>
              Hotels in {location.city} ({filteredHotels.length})
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="d-input"
                  placeholder="Search hotel name..."
                  value={hotelSearch}
                  onChange={(e) => setHotelSearch(e.target.value)}
                  style={{ paddingLeft: '32px', minWidth: '200px' }}
                />
              </div>
              <select className="d-select" value={hotelSort} onChange={(e) => setHotelSort(e.target.value)} style={{ minWidth: '140px' }}>
                <option value="default">Sort: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating: High to Low</option>
              </select>
            </div>
          </div>

          {filteredHotels.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              {hotelSearch ? 'No hotels match your search.' : `No hotels available in ${location.city} right now.`}
            </div>
          ) : (
            <div initial="hidden" whileInView="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredHotels.map(hotel => (
                <div key={hotel._id} className="panel card-animated" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Hotel image */}
                  <div style={{ width: '100%', height: '160px', overflow: 'hidden' }}>
                    {hotel.images?.[0] ? (
                      <LazyImage src={hotel.images[0]} alt={hotel.hotelName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px' }}>
                        {hotel.hotelName}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', background: 'rgba(99,102,241,0.12)', color: '#818cf8', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', textTransform: 'capitalize' }}>
                        {hotel.hotelType || 'Hotel'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '12px', fontWeight: '600' }}>
                        <Star size={12} fill="#fbbf24" />
                        {hotel.rating || 'New'}
                      </div>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }} title={hotel.hotelName}>
                      {hotel.hotelName.length > 19 ? hotel.hotelName.slice(0, 19) + '...' : hotel.hotelName}
                    </h3>

                    <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.5', flex: 1, margin: 0 }}>
                      {hotel.description?.length > 80 ? hotel.description.slice(0, 80) + '...' : hotel.description}
                    </p>

                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {hotel.amenities.slice(0, 3).map((a, i) => (
                          <span key={i} style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-muted)' }}>{a}</span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '4px' }}>
                      <div >
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Rooms: {hotel.availableRooms}</span>
                        <strong style={{ fontSize: '16px', color: 'var(--text-heading)' }}>Rs. {hotel.pricePerNight} <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-muted)' }}>/night</span></strong>
                      </div>
                      <button className="d-btn brand sm" onClick={() => openBooking('hotel', hotel._id)} style={{ cursor: 'pointer' }}>
                        Book Stay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── BUSES TO THIS CITY ── */}
        <div initial="hidden" whileInView="show" style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>
              Buses to {location.city} ({filteredBuses.length})
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="d-input"
                  placeholder="Search bus/operator..."
                  value={busSearch}
                  onChange={(e) => setBusSearch(e.target.value)}
                  style={{ paddingLeft: '32px', minWidth: '200px' }}
                />
              </div>
              <select className="d-select" value={busSort} onChange={(e) => setBusSort(e.target.value)} style={{ minWidth: '140px' }}>
                <option value="default">Sort: Default</option>
                <option value="fare-low">Fare: Low to High</option>
                <option value="fare-high">Fare: High to Low</option>
              </select>
            </div>
          </div>

          {filteredBuses.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              {busSearch ? 'No buses match your search.' : `No buses available to ${location.city} right now.`}
            </div>
          ) : (
            <div initial="hidden" whileInView="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {filteredBuses.map(bus => (
                <div key={bus._id} className="panel card-animated" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {bus.images && bus.images[0] ? (
                    <div style={{ height: '160px', width: '100%', overflow: 'hidden' }}>
                      <LazyImage src={bus.images[0]} alt={bus.busName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ height: '160px', width: '100%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', padding: '0 16px' }}>{bus.busName}</h3>
                    </div>
                  )}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', background: 'rgba(52,211,153,0.12)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                        {bus.busType}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '12px', fontWeight: '600' }}>
                        <Star size={12} fill="#fbbf24" />
                        {bus.rating || '4.5'}
                      </div>
                    </div>

                    <div >
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>{bus.busName.slice(0,20)}</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No: {bus.busNumber} | {bus.operatorName}</span>
                    </div>

                    {/* Route */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>From</span>
                        <strong style={{ fontSize: '14px', color: 'var(--text-heading)' }}>{bus.fromCityID?.city || 'Origin'}</strong>
                      </div>
                      <ArrowUpDown size={14} style={{ color: 'var(--text-muted)', transform: 'rotate(90deg)' }} />
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>To</span>
                        <strong style={{ fontSize: '14px', color: 'var(--text-heading)' }}>{bus.toCityID?.city || 'Destination'}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: 'auto' }}>
                      <div >
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Seats: {bus.availableSeats}</span>
                        <strong style={{ fontSize: '16px', color: 'var(--text-heading)' }}>Rs. {bus.fare}</strong>
                      </div>
                      <button className="d-btn brand sm" onClick={() => openBooking('bus', bus._id)} style={{ cursor: 'pointer' }}>
                        Book Seat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── BOOKING MODAL ── */}
      
        {isBookingOpen && (
          <div className="modal-overlay" 
            onClick={() => setIsBookingOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()} 
              style={{ width: '100%', maxWidth: '600px' }}
            >
              <AddBooking
                initialType={bookingType}
                initialId={bookingId}
                initialCity={bookingCity}
                isModal={true}
                onClose={() => setIsBookingOpen(false)}
                onCreated={() => {
                  setIsBookingOpen(false)
                }}
              />
            </div>
          </div>
        )}
      

      {/* ── FOOTER ── */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div >
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-heading)' }}>JourneyHub</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>© 2026 JourneyHub Inc. All rights reserved.</p>
          </div>
          <Link to="/" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default ExploreDestination
