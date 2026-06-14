import axiosInstance from '../utils/axiosInstance'
import { Building2, Hotel, LayoutDashboard, LogOut, MapPinned, Moon, Sun, UserCircle, Bus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Addlocation from './Addlocation'
import ManageHotel from './ManageHotel'
import AddBus from './AddBus'
import GetHotelBooking from './GetHotelBooking'
import GetbusBooking from './GetbusBooking'
import SuperAProfile from './superAProfile'
import GetOperator from './GetOperator'
import ConfirmAlert from '../components/ConfirmAlert'
import { useEffect, useState } from 'react'
import { useAuth } from '../customhooks/AuthContext'
import { useTheme } from '../customhooks/ThemeContext'
import { Link, useNavigate } from 'react-router-dom'

const SuperA = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    hotels: 0,
    pendingHotels: 0,
    locations: 0,
    buses: 0,
  })
  const { user: savedUser, token, logout } = useAuth()
  const [logoutConfirm, setLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    let ignore = false

    Promise.all([
      axiosInstance.get('/hotel/gethotel'),
      axiosInstance.get('/location/get'),
      axiosInstance.get('/bus/get'),
    ])
      .then(([hotelRes, locationRes, busRes]) => {
        if (ignore) {
          return
        }

        const hotels = hotelRes.data.hotels || []
        const locations = locationRes.data.locations || []
        const buses = busRes.data.buses || []

        setStats({
          hotels: hotels.length,
          pendingHotels: hotels.filter((hotel) => hotel.approvalStatus?.status !== true).length,
          locations: locations.length,
          buses: buses.length,
        })
      })
      .catch((error) => console.log(error.message))

    return () => {
      ignore = true
    }
  }, [])

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'locations', label: 'Locations', icon: MapPinned },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'hotel-bookings', label: 'Hotel Bookings', icon: Hotel },
    { id: 'operators', label: 'Operators', icon: Bus },
    { id: 'buses', label: 'Buses', icon: Bus },
    { id: 'bus-bookings', label: 'Bus Bookings', icon: Bus },
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

  const graphData = [
    { name: 'Total Hotels', count: stats.hotels, fill: '#6366f1' },
    { name: 'Pending Hotels', count: stats.pendingHotels, fill: '#f59e0b' },
    { name: 'Locations', count: stats.locations, fill: '#10b981' },
    { name: 'Total Buses', count: stats.buses, fill: '#8b5cf6' },
  ];

  return (
    <div className="admin-page">
      {/* ── Navbar ── */}
      <nav className="admin-navbar">
        <div className="admin-navbar-inner">
          <Link className="admin-brand" to="/admin/dashboard">
            <span className="admin-brand-icon">
              <Building2 size={20} />
            </span>
            <span>
              <span className="admin-brand-name">JourneyHub Admin</span>
              <span className="admin-brand-sub">Super Admin Dashboard</span>
            </span>
          </Link>

          <div className="admin-nav-actions">
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
              {savedUser?.firstName || 'Profile'}
            </button>
            <button className="admin-nav-btn danger" onClick={() => setLogoutConfirm(true)}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="admin-main">
        {/* Tab bar */}
        <div className="admin-tabs">
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

        {/* Dashboard overview */}
        {activeTab === 'dashboard' && (
          <>
            <div className="dash-hero">
              <p className="dash-hero-eyebrow">Welcome Back</p>
              <h1 className="dash-hero-title">Super Admin Dashboard</h1>
              <p className="dash-hero-desc">
                Manage hotel approvals, add travel locations and keep your admin profile updated from one clean place.
              </p>
            </div>

            <div className="dash-stats-grid" initial="hidden" animate="show">
              <div className="dash-stat card-animated" onClick={() => setActiveTab('hotels')}>
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Total Hotels</span>
                  <span className="dash-stat-icon indigo"><Hotel size={18} /></span>
                </div>
                <div className="dash-stat-value">{stats.hotels}</div>
                <button className="dash-stat-action">Manage hotels →</button>
              </div>

              <div className="dash-stat card-animated" onClick={() => setActiveTab('hotels')}>
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Pending Hotels</span>
                  <span className="dash-stat-icon amber"><LayoutDashboard size={18} /></span>
                </div>
                <div className="dash-stat-value">{stats.pendingHotels}</div>
                <button className="dash-stat-action">Review requests →</button>
              </div>

              <div className="dash-stat card-animated" onClick={() => setActiveTab('locations')}>
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Locations</span>
                  <span className="dash-stat-icon emerald"><MapPinned size={18} /></span>
                </div>
                <div className="dash-stat-value">{stats.locations}</div>
                <button className="dash-stat-action">Add location →</button>
              </div>

              <div className="dash-stat card-animated" onClick={() => setActiveTab('buses')}>
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Total Buses</span>
                  <span className="dash-stat-icon indigo"><Bus size={18} /></span>
                </div>
                <div className="dash-stat-value">{stats.buses}</div>
                <button className="dash-stat-action">Manage buses →</button>
              </div>
            </div>

            <div style={{ marginTop: '40px', background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '24px' }}>Platform Overview</h3>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-body)' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {graphData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        <div className={activeTab === 'locations' ? 'block' : 'hidden'}>
          <Addlocation />
        </div>

        <div className={activeTab === 'hotels' ? 'block' : 'hidden'}>
          <ManageHotel />
        </div>

        <div className={activeTab === 'hotel-bookings' ? 'block' : 'hidden'}>
          <GetHotelBooking />
        </div>

        <div className={activeTab === 'operators' ? 'block' : 'hidden'}>
          <GetOperator />
        </div>

        <div className={activeTab === 'buses' ? 'block' : 'hidden'}>
          <AddBus />
        </div>

        <div className={activeTab === 'bus-bookings' ? 'block' : 'hidden'}>
          <GetbusBooking />
        </div>

        <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
          <SuperAProfile />
        </div>
      </main>

      {logoutConfirm && (
        <ConfirmAlert
          title="Confirm Logout"
          message="Are you sure you want to log out?"
          onConfirm={handleLogout}
          onCancel={() => setLogoutConfirm(false)}
        />
      )}
    </div>
  )
}

export default SuperA
