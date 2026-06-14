import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, UserCircle, Sun, Moon, LogOut, Compass, CheckCircle2, Clock, XCircle, PlusCircle } from 'lucide-react'
import { useTheme } from '../customhooks/ThemeContext'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'
import BookingProfile from './BookingProfile'
import UserProfile from './UserProfile'
import ConfirmAlert from '../components/ConfirmAlert'

const BookingDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  })
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const { user, token, logout: authLogout } = useAuth()
  const [logoutConfirm, setLogoutConfirm] = useState(false)

  const logout = () => {
    authLogout()
    navigate('/')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    axiosInstance.get('/booking/getbooking')
      .then((res) => {
        const list = res.data.bookings || []
        setStats({
          total: list.length,
          confirmed: list.filter((b) => b.bookingStatus === 'Confirmed').length,
          pending: list.filter((b) => b.bookingStatus === 'Pending').length,
          cancelled: list.filter((b) => b.bookingStatus === 'Cancelled').length,
        })
      })
      .catch((err) => console.error(err))
  }, [refreshKey])

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <div className="admin-page">
      <nav className="booking-nav" style={{ width: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link className="admin-brand" to="/bookings">
          <span className="admin-brand-name">JourneyHub</span>
        </Link>
        <div className="admin-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme toggle */}
          <button className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="admin-nav-btn ghost" onClick={() => setActiveTab('profile')}>
            <UserCircle size={17} />
            {user.firstName || 'Profile'}
          </button>
          <button className="admin-nav-btn danger" type="button" onClick={() => setLogoutConfirm(true)}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <main className="booking-main">
        {/* Tab bar */}
        <div className="admin-tabs" style={{ marginBottom: '8px' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <div className="dash-hero">
              <p className="dash-hero-eyebrow">Travel Dashboard</p>
              <h1 className="dash-hero-title">Welcome back, {user.firstName || 'Traveler'}!</h1>
              <p className="dash-hero-desc">Monitor your active journeys, bookings review statuses, and profile information.</p>
            </div>

            <div className="dash-stats-grid" initial="hidden" animate="show">
              <div className="dash-stat card-animated" onClick={() => setActiveTab('bookings')}>
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Total Bookings</span>
                  <span className="dash-stat-icon indigo"><Compass size={18} /></span>
                </div>
                <div className="dash-stat-value">{}</div>
                <button className="dash-stat-action">View all →</button>
              </div>

              <div className="dash-stat card-animated" onClick={() => setActiveTab('bookings')}>
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Confirmed Trips</span>
                  <span className="dash-stat-icon emerald"><CheckCircle2 size={18} /></span>
                </div>
                <div className="dash-stat-value">{}</div>
                <button className="dash-stat-action">View confirmed →</button>
              </div>

              <div className="dash-stat card-animated" onClick={() => setActiveTab('bookings')}>
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Pending Review</span>
                  <span className="dash-stat-icon amber"><Clock size={18} /></span>
                </div>
                <div className="dash-stat-value">{}</div>
                <button className="dash-stat-action">View pending →</button>
              </div>

              <div className="dash-stat card-animated" onClick={() => setActiveTab('bookings')}>
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Cancelled Bookings</span>
                  <span className="dash-stat-icon rose"><XCircle size={18} /></span>
                </div>
                <div className="dash-stat-value">{}</div>
                <button className="dash-stat-action">View history →</button>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div className="panel-title-group">
                  <span className="panel-eyebrow">Navigation</span>
                  <h2 className="panel-title">Quick Actions</h2>
                  <p className="panel-desc">Easily jump to different sections of your dashboard.</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                <button className="partner-btn" onClick={() => navigate('/')} style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                  <span className="partner-btn-icon hotel"><PlusCircle size={20} style={{ color: '#fb923c' }} /></span>
                  <div className="partner-btn-text">
                    <span className="partner-btn-title">Book a New Trip</span>
                    <span className="partner-btn-label">Find hotels and buses</span>
                  </div>
                </button>
                <button className="partner-btn" onClick={() => setActiveTab('bookings')} style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                  <span className="partner-btn-icon train"><CalendarDays size={20} style={{ color: '#34d399' }} /></span>
                  <div className="partner-btn-text">
                    <span className="partner-btn-title">My Bookings</span>
                    <span className="partner-btn-label">Manage hotel and bus tickets</span>
                  </div>
                </button>
                <button className="partner-btn" onClick={() => setActiveTab('profile')} style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                  <span className="partner-btn-icon hotel" style={{ backgroundColor: 'rgba(99, 102, 241, 0.18)' }}><UserCircle size={20} style={{ color: '#818cf8' }} /></span>
                  <div className="partner-btn-text">
                    <span className="partner-btn-title">Update Profile</span>
                    <span className="partner-btn-label">Edit personal details</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <Link
                to="/"
                className="d-btn brand"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none' }}
              >
                <PlusCircle size={16} />
                + New Booking
              </Link>
            </div>
            <BookingProfile refreshKey={refreshKey} />
          </>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <UserProfile />
        )}
      </main>

      {logoutConfirm && (
        <ConfirmAlert
          message="Are you sure you want to logout?"
          confirmText="Yes, Logout"
          onConfirm={logout}
          onCancel={() => setLogoutConfirm(false)}
        />
      )}
    </div>
  )
}

export default BookingDashboard
