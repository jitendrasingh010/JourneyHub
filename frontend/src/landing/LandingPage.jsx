import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Hotel, ShieldCheck, Star, MapPin,
  ArrowUpDown, Sun, Moon, Phone, Mail, Globe,
  TreePine, Mountain, Waves, Bus, Compass,
  Heart, ChevronUp, Share2, AtSign, Rss, Play, X
} from 'lucide-react'
import AddBooking from '../booking/Addbboking'
import LazyImage from '../components/LazyImage'
import { useTheme } from '../customhooks/ThemeContext'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'

// Removed scroll reveal hook for simplicity and to prevent hidden content bugs

const LandingPage = () => {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const isLoggedIn = Boolean(token)

  // Theme
  const { theme, toggleTheme } = useTheme()

  // Data states
  const [locations, setLocations] = useState([])
  const [hotels, setHotels] = useState([])
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal controls
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [preselectedType, setPreselectedType] = useState('hotel')
  const [preselectedId, setPreselectedId] = useState('')
  const [preselectedCity, setPreselectedCity] = useState('')

  // Wishlist Modal
  const [wishlistModal, setWishlistModal] = useState({ isOpen: false, type: '', id: '', listName: 'My Favorites', loading: false });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Search & Sort states
  const [placeSearch, setPlaceSearch] = useState('')
  const [placeSort, setPlaceSort] = useState('default')
  const [hotelSearch, setHotelSearch] = useState('')
  const [hotelSort, setHotelSort] = useState('default')
  const [busSearch, setBusSearch] = useState('')
  const [busSort, setBusSort] = useState('default')

  // Back to top
  const [showBackTop, setShowBackTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowBackTop(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Removed reveal refs for simplicity

  // Load data
  useEffect(() => {
    let ignore = false
    Promise.all([
      axiosInstance.get('/location/get'),
      axiosInstance.get('/hotel/gethotel'),
      axiosInstance.get('/bus/get')
    ])
      .then(([locRes, hotRes, busRes]) => {
        if (ignore) return
        setLocations(locRes.data.locations || [])
        setHotels((hotRes.data.hotels || []).filter(h => h.approvalStatus?.status))
        setBuses((busRes.data.buses || []).filter(b => b.isActive))
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching landing details:', err)
        setLoading(false)
      })
    return () => { ignore = true }
  }, [])

  const handleSelectToBook = (type, id, city = '') => {
    if (!isLoggedIn) { navigate('/login'); return }
    setPreselectedType(type)
    setPreselectedId(id)
    setPreselectedCity(city)
    setIsBookingModalOpen(true)
  }

  // Filter and Sort Lists
  const filteredPlaces = locations
    .filter(loc => {
      const q = placeSearch.toLowerCase()
      return (
        (loc.city || '').toLowerCase().includes(q) ||
        (loc.state || '').toLowerCase().includes(q) ||
        (loc.locationName || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (placeSort === 'price-low') return a.startingPrice - b.startingPrice
      if (placeSort === 'price-high') return b.startingPrice - a.startingPrice
      if (placeSort === 'name') return (a.locationName || a.city).localeCompare(b.locationName || b.city)
      return 0
    })

  const filteredHotels = hotels
    .filter(hotel => {
      const q = hotelSearch.toLowerCase()
      return (
        (hotel.hotelName || '').toLowerCase().includes(q) ||
        (hotel.location?.city || '').toLowerCase().includes(q) ||
        (hotel.location?.state || '').toLowerCase().includes(q)
      )
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
      return (
        (bus.busName || '').toLowerCase().includes(q) ||
        (bus.busNumber || '').toLowerCase().includes(q) ||
        (bus.operatorName || '').toLowerCase().includes(q) ||
        (bus.fromCityID?.city || '').toLowerCase().includes(q) ||
        (bus.toCityID?.city || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (busSort === 'fare-low') return a.fare - b.fare
      if (busSort === 'fare-high') return b.fare - a.fare
      if (busSort === 'rating') return (b.rating || 4.5) - (a.rating || 4.5)
      if (busSort === 'name') return a.busName.localeCompare(b.busName)
      if (busSort === 'name') return a.busName.localeCompare(b.busName)
      return 0
    })

  // Add to wishlist function
  const handleAddToWishlist = async (type, id) => {
    if (!isLoggedIn) {
      alert('Please login to add items to your wishlist.');
      navigate('/login');
      return;
    }
    setWishlistModal({ isOpen: true, type, id, listName: 'My Favorites', loading: false });
  };

  const submitWishlist = async () => {
    const { type, id, listName } = wishlistModal;
    if (!listName.trim()) {
      showToast('Please enter a wishlist name', 'error');
      return;
    }

    setWishlistModal(prev => ({ ...prev, loading: true }));
    try {
      const payload = {
        listName,
        hotels: type === 'hotel' ? [id] : [],
        buses: type === 'bus' ? [id] : [],
        destinations: type === 'destination' ? [id] : []
      };

      const response = await axiosInstance.post('/wishlist/add', payload)

      if (response.data.success) {
        showToast('Added to wishlist successfully! ❤️', 'success');
        setWishlistModal({ isOpen: false, type: '', id: '', listName: 'My Favorites', loading: false });
      } else {
        showToast('Failed to add: ' + response.data.message, 'error');
        setWishlistModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      showToast('Something went wrong. Please try again.', 'error');
      setWishlistModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Card image renderer with LazyImage blur effect
  const renderCardImage = (imageUrl, title) => {
    return (
      <div className="w-full h-[250px] relative overflow-hidden">
        {imageUrl ? (
          <LazyImage
            src={imageUrl}
            alt={title}
            className="w-full h-[250px] object-cover card-img-lazy"
            style={{
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)'
            }}
          />
        ) : (
          <div className="w-full h-[250px] flex items-center justify-center text-center p-4" style={{
            background: 'var(--brand-gradient)',
            color: 'white', fontWeight: 'bold', fontSize: '18px',
            borderTopLeftRadius: 'var(--radius-lg)',
            borderTopRightRadius: 'var(--radius-lg)'
          }}>
            {title}
          </div>
        )}
        {/* Gradient overlay on image bottom */}
        {imageUrl && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
            background: 'linear-gradient(to top, rgba(7,8,15,0.6), transparent)',
            pointerEvents: 'none'
          }} />
        )}
      </div>
    )
  }

  // Search bar style
  const searchStyle = {
    width: '100%', padding: '11px 16px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-input)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-heading)',
    outline: 'none', fontSize: '14px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const selectStyle = {
    padding: '11px 16px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-input)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-heading)',
    outline: 'none', cursor: 'pointer', fontSize: '14px',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)', color: 'var(--text-body)' }}>

      {/* ── HEADER NAVBAR ── */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: theme === 'dark' ? 'rgba(7, 8, 15, 0.85)' : 'rgba(255, 255, 255, 0.85)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo with theme icon */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'var(--brand-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px var(--glow-primary)'
            }}>
              <Compass size={20} color="white" />
            </div>
            <span style={{ fontSize: '22px', fontWeight: '800', background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              JourneyHub
            </span>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {[
              { href: '#destinations', label: 'Destinations', icon: <MapPin size={14} /> },
              { href: '#hotels', label: 'Hotels', icon: <Hotel size={14} /> },
              { href: '#buses', label: 'Buses', icon: <Bus size={14} /> },
            ].map(({ href, label, icon }) => (
              <a key={href} href={href} className="nav-link-animated" style={{
                color: 'var(--text-body)', fontWeight: '500',
                textDecoration: 'none', fontSize: '14px',
                display: 'flex', alignItems: 'center', gap: '5px',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-heading)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-body)'}
              >
                <span style={{ opacity: 0.7 }}>{icon}</span> {label}
              </a>
            ))}
            
            {/* Wishlist Link for Logged In Users */}
            {isLoggedIn && (
              <Link to="/wishlists" style={{
                color: 'var(--text-body)', fontWeight: '500',
                textDecoration: 'none', fontSize: '14px',
                display: 'flex', alignItems: 'center', gap: '5px',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-heading)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-body)'}
              >
                <span style={{ opacity: 0.7 }}><Heart size={14} /></span> Wishlist
              </Link>
            )}

            <Link to="/registerhotel" style={{
              color: 'var(--text-body)', fontWeight: '500',
              textDecoration: 'none', fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-heading)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-body)'}
            >
              <span style={{ opacity: 0.7 }}><Hotel size={14} /></span> Register Hotel
            </Link>

            <Link to="/register-operator" style={{
              color: 'var(--text-body)', fontWeight: '500',
              textDecoration: 'none', fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-heading)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-body)'}
            >
              <span style={{ opacity: 0.7 }}><Bus size={14} /></span> Register Bus
            </Link>
          </nav>

          {/* CTAs + Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme toggle button */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isLoggedIn ? (
              <Link to={user?.role === 'super_admin' ? '/admin/dashboard' : user?.role === 'hotel_admin' ? '/hotel/dashboard' : user?.role === 'bus_admin' ? '/operator-dashboard' : '/bookings'} className="d-btn brand" style={{ padding: '8px 18px', fontSize: '14px', textDecoration: 'none' }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="d-btn ghost" style={{ padding: '8px 16px', fontSize: '14px', textDecoration: 'none' }}>
                  Login
                </Link>
                <Link to="/signup" className="d-btn brand" style={{ padding: '8px 18px', fontSize: '14px', textDecoration: 'none' }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO SECTION — Nature Video ── */}
      <section style={{ position: 'relative', height: '580px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottom: '1px solid var(--border-subtle)' }}>
        {/* Nature Background Video — forest, mountains, rivers */}
        <video
          className="hero-bg-video"
          src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4"
          autoPlay loop muted playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
        {/* Dark gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,8,15,0.35) 0%, rgba(7,8,15,0.75) 70%, rgba(7,8,15,0.95) 100%)', zIndex: 1 }} />

        {/* Nature icons floating */}
        <div style={{ position: 'absolute', top: '80px', left: '6%', zIndex: 2, opacity: 0.25, animation: 'float 6s ease-in-out infinite' }}>
          <TreePine size={48} color="#6ee7b7" />
        </div>
        <div style={{ position: 'absolute', top: '100px', right: '8%', zIndex: 2, opacity: 0.2, animation: 'float 8s ease-in-out infinite 1s' }}>
          <Mountain size={52} color="#a5b4fc" />
        </div>
        <div style={{ position: 'absolute', bottom: '100px', left: '10%', zIndex: 2, opacity: 0.2, animation: 'float 7s ease-in-out infinite 2s' }}>
          <Waves size={40} color="#60a5fa" />
        </div>

        <div className="animate-fadeInUp" style={{ maxWidth: '820px', textAlign: 'center', zIndex: 2, padding: '0 24px' }}>
          <div className="brand-badge" style={{ margin: '0 auto 24px' }}>
            <span className="brand-badge-dot" />
            Easy Bookings, Seamless Journeys
          </div>

          <h1 style={{ fontSize: '56px', fontWeight: '800', lineHeight: '1.1', color: '#fff', letterSpacing: '-2px', marginBottom: '20px' }}>
            {isLoggedIn ? `Welcome back, ${user.firstName || 'Traveler'}!` : 'Explore India,'}
            <br />
            <span style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {isLoggedIn ? 'Book Your Next Adventure' : 'Book Your Journey'}
            </span>
          </h1>

          <p style={{ fontSize: '18px', lineHeight: '1.7', color: 'rgba(255,255,255,0.75)', maxWidth: '600px', margin: '0 auto 36px' }}>
            Discover amazing destinations across India — forests, mountains, rivers. Book premium hotels and comfortable buses from a single platform.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            <button
              onClick={() => handleSelectToBook('hotel', '')}
              className="btn-primary hero-btn-glow"
              style={{ width: 'auto', padding: '15px 32px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', borderRadius: 'var(--radius-md)' }}
            >
              Book Your Trip Now <ArrowRight size={18} />
            </button>
            <Link to="/registerhotel" className="d-btn ghost" style={{ padding: '15px 32px', fontSize: '16px', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              Register Your Hotel <Hotel size={18} />
            </Link>
          </div>

          {/* Nature highlights */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginTop: '40px', flexWrap: 'wrap' }}>
            {[
              { icon: <TreePine size={16} />, text: 'Forest Stays' },
              { icon: <Mountain size={16} />, text: 'Mountain Routes' },
              { icon: <Waves size={16} />, text: 'River Escapes' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '500' }}>
                <span style={{ color: '#a5b4fc' }}>{icon}</span> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section style={{
        padding: '48px 24px', borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {[
            { icon: <ShieldCheck size={22} color="#34d399" />, title: 'Verified Hotels', desc: 'All hotels are approved & verified', color: 'rgba(16,185,129,0.15)' },
            { icon: <Star size={22} color="#fbbf24" />, title: 'Top Rated', desc: 'Only highly rated properties listed', color: 'rgba(245,158,11,0.15)' },
            { icon: <Bus size={22} color="#818cf8" />, title: 'Safe Buses', desc: 'GPS-tracked intercity bus network', color: 'rgba(99,102,241,0.15)' },
            { icon: <Compass size={22} color="#60a5fa" />, title: '500+ Destinations', desc: 'Pan-India travel coverage', color: 'rgba(96,165,250,0.15)' },
          ].map(({ icon, title, desc, color }, i) => (
            <div key={title} className="feature-chip" style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '18px 20px', borderRadius: 'var(--radius-lg)',
              background: color, border: '1px solid var(--border-subtle)',
              transition: 'transform 0.25s, box-shadow 0.25s',
              animationDelay: `${i * 0.1}s`
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-heading)' }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLACES / DESTINATIONS SECTION ── */}
      <section
        id="destinations"
        style={{ padding: '80px 24px', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <TreePine size={18} color="var(--brand-from)" />
              <span style={{ color: 'var(--brand-from)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Explore India</span>
            </div>
            <h2 style={{ fontSize: '34px', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>Top Travel Destinations</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>Discover breathtaking forests, mountains, and rivers across India.</p>
          </div>

          {/* Search & Sort */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <input type="text" placeholder="Search destinations by city or state..." value={placeSearch} onChange={e => setPlaceSearch(e.target.value)} style={searchStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-input)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort by:</span>
              <select value={placeSort} onChange={e => setPlaceSort(e.target.value)} style={selectStyle}>
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="panel skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <MapPin size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>No destinations found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
              {filteredPlaces.map((loc, i) => (
                <div key={loc._id} className="panel landing-card card-animated flex flex-col h-full" style={{
                  padding: 0, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '20px', transition: '0.3s',
                  animationDelay: `${i * 0.07}s`
                }}>
                  {renderCardImage(loc.image, loc.city)}
                  <div className="flex flex-col flex-1" style={{ padding: '20px', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#818cf8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      <MapPin size={12} /> {loc.state}, India
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>
                      {loc.locationName || loc.city}
                    </h3>
                    <p className="line-clamp-3" style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-body)', marginBottom: '12px' }}>
                      {(loc.shortDescription || '').replace(/\*\*/g, '')}
                    </p>
                    <div className="mt-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Starting Price</span>
                        <strong style={{ fontSize: '16px', color: 'var(--text-heading)' }}>Rs. {loc.startingPrice}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleAddToWishlist('destination', loc._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '8px 10px', borderRadius: 'var(--radius-md)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} title="Add to Wishlist">
                          <Heart size={16} />
                        </button>
                        <button onClick={() => navigate(`/destination/${loc._id}`)} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                          Explore
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── APPROVED HOTELS SECTION ── */}
      <section
        id="hotels"
        style={{ padding: '80px 24px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Hotel size={18} color="var(--brand-from)" />
              <span style={{ color: 'var(--brand-from)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Luxury Stays</span>
            </div>
            <h2 style={{ fontSize: '34px', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>Recommended Hotels & Resorts</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>Approved properties with top amenities and ratings.</p>
          </div>

          {/* Search & Sort */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <input type="text" placeholder="Search hotels by name, city, or state..." value={hotelSearch} onChange={e => setHotelSearch(e.target.value)} style={searchStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-input)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort by:</span>
              <select value={hotelSort} onChange={e => setHotelSort(e.target.value)} style={selectStyle}>
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="panel skeleton" style={{ height: '340px', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : filteredHotels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <Hotel size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>No hotels found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
              {filteredHotels.map((hotel, i) => (
                <div key={hotel._id} className="panel landing-card card-animated flex flex-col h-full" style={{
                  padding: 0, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '20px', transition: '0.3s',
                  animationDelay: `${i * 0.07}s`
                }}>
                  {renderCardImage(hotel.images?.[0], hotel.hotelName)}
                  <div className="flex flex-col flex-1" style={{ padding: '20px', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#818cf8', padding: '3px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '4px', textTransform: 'capitalize' }}>
                        {hotel.hotelType || 'Hotel'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '13px', fontWeight: '600' }}>
                        <Star size={13} fill="#fbbf24" />
                        {hotel.rating ? `${hotel.rating} (${hotel.reviewsCount || 0})` : 'New'}
                      </div>
                    </div>
                    <h3 style={{ fontSize: '19px', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }} title={hotel.hotelName}>
                      {hotel.hotelName.length > 19 ? hotel.hotelName.slice(0, 19) + '...' : hotel.hotelName}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <MapPin size={12} /> {hotel.location?.city}, {hotel.location?.state}
                    </div>
                    <p className="line-clamp-3" style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-body)', marginBottom: '12px' }}>
                      {hotel.description}
                    </p>
                    {hotel.amenities?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
                        {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-body)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                            {amenity}
                          </span>
                        ))}
                        {hotel.amenities.length > 3 && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center' }}>+{hotel.amenities.length - 3} more</span>
                        )}
                      </div>
                    )}
                    <div className="mt-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Rooms Left: {hotel.availableRooms}</span>
                        <strong style={{ fontSize: '17px', color: 'var(--text-heading)' }}>Rs. {hotel.pricePerNight} <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)' }}>/night</span></strong>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => handleAddToWishlist('hotel', hotel._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', height: '42px', width: '42px', borderRadius: 'var(--radius-md)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} title="Add to Wishlist">
                          <Heart size={18} />
                        </button>
                        <button onClick={() => navigate(`/hotel/${hotel._id}`)} style={{ background: '#6366f1', color: '#fff', border: 'none', height: '42px', padding: '0 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          Book Stay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── COMFORTABLE BUSES SECTION ── */}
      <section
        id="buses"
        style={{ padding: '80px 24px', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Bus size={18} color="var(--brand-from)" />
              <span style={{ color: 'var(--brand-from)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Express Transit</span>
            </div>
            <h2 style={{ fontSize: '34px', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>Intercity Comfort Buses</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>Secure sleeper and seater buses for comfortable travel routes.</p>
          </div>

          {/* Search & Sort */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <input type="text" placeholder="Search buses by operator, number, from or to city..." value={busSearch} onChange={e => setBusSearch(e.target.value)} style={searchStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-input)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort by:</span>
              <select value={busSort} onChange={e => setBusSort(e.target.value)} style={selectStyle}>
                <option value="default">Default</option>
                <option value="fare-low">Fare: Low to High</option>
                <option value="fare-high">Fare: High to Low</option>
                <option value="rating">Rating: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="panel skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : filteredBuses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <Bus size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>No buses found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
              {filteredBuses.map((bus, i) => (
                <div key={bus._id} className="panel landing-card card-animated flex flex-col h-full" style={{
                  padding: 0, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '20px', transition: '0.3s',
                  animationDelay: `${i * 0.07}s`
                }}>
                  {renderCardImage(bus.images?.[0], bus.busName)}
                  <div className="flex flex-col flex-1" style={{ padding: '20px', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ backgroundColor: 'rgba(52,211,153,0.12)', color: '#34d399', padding: '3px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '4px' }}>
                        {bus.busType}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '13px', fontWeight: '600' }}>
                        <Star size={13} fill="#fbbf24" />
                        {bus.rating ? `${bus.rating}.0` : '4.5'}
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '19px', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>{bus.busName}</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No: {bus.busNumber} | Operator: {bus.operatorName}</span>
                    </div>

                    {/* Route Details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>From</span>
                        <strong style={{ fontSize: '14px', color: 'var(--text-heading)' }}>{bus.fromCityID?.city || 'Origin'}</strong>
                      </div>
                      <ArrowUpDown size={14} style={{ color: 'var(--text-muted)', transform: 'rotate(90deg)', flexShrink: 0 }} />
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>To</span>
                        <strong style={{ fontSize: '14px', color: 'var(--text-heading)' }}>{bus.toCityID?.city || 'Destination'}</strong>
                      </div>
                    </div>

                    <div className="mt-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Seats Available: {bus.availableSeats}</span>
                        <strong style={{ fontSize: '17px', color: 'var(--text-heading)' }}>Rs. {bus.fare}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => handleAddToWishlist('bus', bus._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', height: '42px', width: '42px', borderRadius: 'var(--radius-md)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} title="Add to Wishlist">
                          <Heart size={18} />
                        </button>
                        <button onClick={() => navigate(`/bus/${bus._id}`)} style={{ background: '#6366f1', color: '#fff', border: 'none', height: '42px', padding: '0 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          Book Seat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BOOKING MODAL OVERLAY ── */}
      {isBookingModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBookingModalOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px' }}>
            <AddBooking
              initialType={preselectedType}
              initialId={preselectedId}
              initialCity={preselectedCity}
              isModal={true}
              onClose={() => setIsBookingModalOpen(false)}
              onCreated={() => { setIsBookingModalOpen(false); }}
            />
          </div>
        </div>
      )}

      {/* ── FOOTER — Premium Design ── */}
      <footer style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        {/* Footer top — nature CTA banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '48px 24px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '8px' }}>
                Ready for your next <span style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>adventure?</span>
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                Forests, mountains, rivers — your journey starts here.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => handleSelectToBook('hotel', '')} className="btn-primary" style={{ padding: '12px 24px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', width: 'auto' }}>
                Book Now <ArrowRight size={16} />
              </button>
              <Link to="/signup" className="d-btn ghost" style={{ padding: '12px 24px', fontSize: '15px', textDecoration: 'none' }}>
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Footer main grid */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>

          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px var(--glow-primary)' }}>
                <Compass size={18} color="white" />
              </div>
              <span style={{ fontSize: '20px', fontWeight: '800', background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>JourneyHub</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.7', maxWidth: '220px' }}>
              India's trusted travel platform. Discover destinations, book hotels, and ride comfortable buses — all in one place.
            </p>
            {/* Social links */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              {[
                { icon: <AtSign size={16} />, label: 'Instagram' },
                { icon: <Share2 size={16} />, label: 'Twitter' },
                { icon: <Rss size={16} />, label: 'Facebook' },
                { icon: <Play size={16} />, label: 'YouTube' },
              ].map(({ icon, label }) => (
                <button key={label} title={label} style={{
                  width: '34px', height: '34px', borderRadius: '8px',
                  background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.2s, color 0.2s, transform 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-gradient)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.border = 'none' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.border = '1px solid var(--border-subtle)' }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Explore column */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Explore</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '#destinations', label: 'Destinations', icon: <MapPin size={13} /> },
                { href: '#hotels', label: 'Hotels', icon: <Hotel size={13} /> },
                { href: '#buses', label: 'Buses', icon: <Bus size={13} /> },
                { to: '/registerhotel', label: 'Register Hotel', icon: <Globe size={13} /> },
              ].map(({ href, to, label, icon }) => (
                <li key={label}>
                  {href ? (
                    <a href={href} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-from)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <span style={{ opacity: 0.6 }}>{icon}</span> {label}
                    </a>
                  ) : (
                    <Link to={to} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-from)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <span style={{ opacity: 0.6 }}>{icon}</span> {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Account column */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Account</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { to: '/login', label: 'Traveler Login' },
                { to: '/signup', label: 'Sign Up Free' },
                { to: '/bookings', label: 'My Bookings' },
                { to: '/registerhotel', label: 'Hotel Partner' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-from)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contact</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <Mail size={14} style={{ flexShrink: 0, color: '#818cf8' }} /> support@journeyhub.in
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <Phone size={14} style={{ flexShrink: 0, color: '#818cf8' }} /> +91 98765 43210
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <Globe size={14} style={{ flexShrink: 0, color: '#818cf8' }} /> www.journeyhub.in
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '20px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              © 2026 JourneyHub Inc. All rights reserved. Made with <Heart size={12} style={{ display: 'inline', color: '#f87171', verticalAlign: 'middle' }} /> in India.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(label => (
                <a key={label} href="#" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-body)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── BACK TO TOP ── */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed', bottom: '28px', right: '28px',
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'var(--brand-gradient)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 4px 20px var(--glow-primary)',
            zIndex: 100,
            animation: 'fadeInUp 0.3s ease both',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          title="Back to top"
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 28px var(--glow-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px var(--glow-primary)' }}
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* ── WISHLIST MODAL ── */}
      {wishlistModal.isOpen && (
        <div className="modal-overlay" onClick={() => setWishlistModal({ ...wishlistModal, isOpen: false })}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)', boxShadow: '0 20px 48px rgba(0,0,0,0.4)', animation: 'fadeInUp 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><Heart size={20} color="#ef4444" /> Save to Wishlist</h3>
              <button onClick={() => setWishlistModal({ ...wishlistModal, isOpen: false })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-body)', marginBottom: '16px' }}>Enter a name for your wishlist (e.g., Summer Trip, Goa Diaries):</p>
            <input
              type="text"
              value={wishlistModal.listName}
              onChange={e => setWishlistModal({ ...wishlistModal, listName: e.target.value })}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-input)', background: 'var(--bg-base)', color: 'var(--text-heading)', marginBottom: '20px', boxSizing: 'border-box' }}
              placeholder="My Favorites"
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setWishlistModal({ ...wishlistModal, isOpen: false })} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-body)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitWishlist} disabled={wishlistModal.loading} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--brand-from)', color: 'white', fontWeight: '600', cursor: wishlistModal.loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {wishlistModal.loading ? 'Saving...' : 'Save Items'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '12px 24px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000,
          fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'fadeInUp 0.3s ease'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default LandingPage