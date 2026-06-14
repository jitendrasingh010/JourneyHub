import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hotel, UserCircle, LogOut, LayoutDashboard, BedDouble, KeyRound, CheckSquare, Sun, Moon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import BookingProfile from '../booking/BookingProfile'
import Hotelprofile from './Hotelprofile'
import ConfirmAlert from '../components/ConfirmAlert'
import { useTheme } from '../customhooks/ThemeContext'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'

const HotelDahboard = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0 })
  const [roomStats, setRoomStats] = useState({ totalRooms: 0, availableRooms: 0, bookedRooms: 0 })

  const { user: savedUser, token, logout: authLogout } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!token) {
          navigate('/login')
          return
        }
        const res = await axiosInstance.get('/booking/getbooking?type=hotel')
        const bookings = res.data.bookings || []
        
        let pending = 0, confirmed = 0, cancelled = 0;
        bookings.forEach(b => {
          if (b.bookingStatus === 'Pending') pending++
          if (b.bookingStatus === 'Confirmed') confirmed++
          if (b.bookingStatus === 'Cancelled') cancelled++
        })
        
        setStats({ total: bookings.length, pending, confirmed, cancelled })

        // Fetch hotel stats for room availability
        const hotelRes = await axiosInstance.get('/hotel/gethotel')
        const hotels = hotelRes.data.hotels || []
        const myHotel = hotels.find(h => h.email === savedUser.email)
        if (myHotel) {
          setRoomStats({
            totalRooms: myHotel.totalRooms || 0,
            availableRooms: myHotel.availableRooms || 0,
            bookedRooms: (myHotel.totalRooms || 0) - (myHotel.availableRooms || 0)
          })
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchStats()
  }, [token, navigate, savedUser?.email])

  const logout = () => {
    authLogout()
    navigate('/')
  }

  const graphData = [
    { name: 'Total Bookings', count: stats.total, fill: '#6366f1' },
    { name: 'Pending', count: stats.pending, fill: '#f59e0b' },
    { name: 'Confirmed', count: stats.confirmed, fill: '#10b981' },
    { name: 'Cancelled', count: stats.cancelled, fill: '#ef4444' },
  ]

  return (
    <div className="admin-page">
      <nav className="admin-navbar">
        <div className="admin-navbar-inner">
          <div className="admin-brand">
            <span className="admin-brand-icon"><Hotel size={20} /></span>
            <span>
              <span className="admin-brand-name">JourneyHub Hotel</span>
              <span className="admin-brand-sub">Partner Dashboard</span>
            </span>
          </div>
          
          <div className="admin-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="admin-nav-btn ghost" onClick={() => setActiveTab('profile')}>
              <UserCircle size={17} />
              {savedUser.firstName || 'Profile'}
            </button>
            <button className="admin-nav-btn danger" onClick={() => setLogoutConfirm(true)}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="admin-main">
        {/* Tab bar */}
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            <Hotel size={16} /> Bookings
          </button>
          <button className={`admin-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <UserCircle size={16} /> Profile
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-heading)', fontSize: '18px', fontWeight: '700' }}>Room Capacity Overview</h3>
            <div className="dash-stats-grid" style={{ marginBottom: '32px' }}>
              <div className="dash-stat card-animated">
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Total Rooms</span>
                  <span className="dash-stat-icon indigo"><BedDouble size={18} /></span>
                </div>
                <div className="dash-stat-value">{roomStats.totalRooms}</div>
                <button className="dash-stat-action" style={{ cursor: 'default' }}>Overall Capacity</button>
              </div>

              <div className="dash-stat card-animated">
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Booked Rooms</span>
                  <span className="dash-stat-icon emerald"><CheckSquare size={18} /></span>
                </div>
                <div className="dash-stat-value">{roomStats.bookedRooms}</div>
                <button className="dash-stat-action" style={{ cursor: 'default' }}>Currently Occupied</button>
              </div>

              <div className="dash-stat card-animated">
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Available Rooms</span>
                  <span className="dash-stat-icon amber"><KeyRound size={18} /></span>
                </div>
                <div className="dash-stat-value">{roomStats.availableRooms}</div>
                <button className="dash-stat-action" style={{ cursor: 'default' }}>Ready for Booking</button>
              </div>
            </div>

            <h3 style={{ marginBottom: '16px', color: 'var(--text-heading)', fontSize: '18px', fontWeight: '700' }}>Recent Booking Statistics</h3>
            <div className="dash-stats-grid">
              <div className="dash-stat card-animated" onClick={() => setActiveTab('bookings')}>
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Total Bookings</span>
                  <span className="dash-stat-icon indigo"><Hotel size={18} /></span>
                </div>
                <div className="dash-stat-value">{stats.total}</div>
                <button className="dash-stat-action">View bookings →</button>
              </div>

              <div className="dash-stat card-animated" onClick={() => setActiveTab('bookings')}>
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Pending Bookings</span>
                  <span className="dash-stat-icon amber"><LayoutDashboard size={18} /></span>
                </div>
                <div className="dash-stat-value">{stats.pending}</div>
                <button className="dash-stat-action">Action required →</button>
              </div>

              <div className="dash-stat card-animated" onClick={() => setActiveTab('bookings')}>
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Confirmed Bookings</span>
                  <span className="dash-stat-icon emerald"><Hotel size={18} /></span>
                </div>
                <div className="dash-stat-value">{stats.confirmed}</div>
                <button className="dash-stat-action">View details →</button>
              </div>
            </div>

            <div style={{ marginTop: '40px', background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '24px' }}>Booking Trends</h3>
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
          </div>
        )}

        {activeTab === 'bookings' && <div style={{ marginTop: '24px' }}><BookingProfile type="hotel" adminMode title="Hotel Bookings" /></div>}
        {activeTab === 'profile' && <div style={{ marginTop: '24px' }}><Hotelprofile /></div>}
      </main>

      {logoutConfirm && (
        <ConfirmAlert
          title="Confirm Logout"
          message="Are you sure you want to log out?"
          onConfirm={logout}
          onCancel={() => setLogoutConfirm(false)}
        />
      )}
    </div>
  )
}

export default HotelDahboard