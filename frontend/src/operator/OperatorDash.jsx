import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, UserCircle, LogOut, LayoutDashboard, PlusCircle, Sun, Moon, Map, CheckSquare, Clock, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'
import Operatorprofile from './Operatorprofile'
import AddOperatorBuses from './AddOperatorBuses'
import GetOperatorBuses from './GetOperatorBuses'
import { useTheme } from '../customhooks/ThemeContext'
import BookingProfile from '../booking/BookingProfile'
import ConfirmAlert from '../components/ConfirmAlert'

const OperatorDash = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [operatorData, setOperatorData] = useState(null)
  const [editBusData, setEditBusData] = useState(null)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({ totalBuses: 0, activeBuses: 0, totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, cancelledBookings: 0, totalRevenue: 0 })
  
  const { user: savedUser, token, logout: authLogout } = useAuth()

  const fetchDashboardStats = async (operatorId) => {
    try {
      // Fetch Buses
      const busRes = await axiosInstance.get('/bus/get')
      const allBuses = busRes.data.buses || []
      const myBuses = allBuses.filter(b => b.operatorName === operatorId || (b.operatorName && b.operatorName._id === operatorId))
      const activeBuses = myBuses.filter(b => b.isActive).length

      // Fetch Bookings
      const bookingRes = await axiosInstance.get('/booking/getbooking?type=bus')
      const myBookings = bookingRes.data.bookings || []
      
      let pending = 0, confirmed = 0, cancelled = 0, revenue = 0;
      myBookings.forEach(b => {
        if (b.bookingStatus === 'Pending') pending++
        if (b.bookingStatus === 'Confirmed') {
          confirmed++
          revenue += (b.amount || 0)
        }
        if (b.bookingStatus === 'Cancelled') cancelled++
      })

      setDashboardStats({
        totalBuses: myBuses.length,
        activeBuses,
        totalBookings: myBookings.length,
        pendingBookings: pending,
        confirmedBookings: confirmed,
        cancelledBookings: cancelled,
        totalRevenue: revenue
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    const fetchOperator = async () => {
      try {
        const res = await axiosInstance.get('/operator/get')
        setOperatorData(res.data.operator)
        if (res.data.operator) {
          fetchDashboardStats(res.data.operator._id)
        }
      } catch (err) {
        console.error(err)
      }
    }
    
    if (!operatorData) {
      fetchOperator()
    } else if (activeTab === 'dashboard') {
      fetchDashboardStats(operatorData._id)
    }
  }, [token, navigate, activeTab, operatorData])

  const logout = () => {
    authLogout()
    navigate('/')
  }

  const graphData = [
    { name: 'Pending', count: dashboardStats.pendingBookings, fill: '#f59e0b' },
    { name: 'Confirmed', count: dashboardStats.confirmedBookings, fill: '#10b981' },
    { name: 'Cancelled', count: dashboardStats.cancelledBookings, fill: '#ef4444' }
  ]

  return (
    <div className="admin-page">
      <nav className="admin-navbar">
        <div className="admin-navbar-inner">
          <div className="admin-brand">
            <span className="admin-brand-icon"><Bus size={20} /></span>
            <span>
              <span className="admin-brand-name">JourneyHub Bus</span>
              <span className="admin-brand-sub">Operator Dashboard</span>
            </span>
          </div>
          
          <div className="admin-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="admin-nav-btn ghost" onClick={() => setActiveTab('profile')}>
              <UserCircle size={17} /> {savedUser.firstName || 'Profile'}
            </button>
            <button className="admin-nav-btn danger" onClick={() => setLogoutConfirm(true)}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="admin-main">
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            <Bus size={16} /> Ticket Bookings
          </button>
          <button className={`admin-tab ${activeTab === 'buses' ? 'active' : ''}`} onClick={() => setActiveTab('buses')}>
            <Bus size={16} /> My Buses
          </button>
          <button className={`admin-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <UserCircle size={16} /> My Agency Profile
          </button>
        </div>
          {(!operatorData?.isApproved && savedUser.role === 'bus_admin') && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>⏳</span>
              <div>
                <h4 style={{ color: '#f59e0b', margin: '0 0 4px', fontWeight: 'bold' }}>Account Pending Approval</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Your operator account is currently under review by the Super Admin. You cannot add buses until approved.</p>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="admin-dashboard-content">
              <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-heading)', marginBottom: '8px' }}>Welcome, {operatorData?.agencyName || 'Operator'}!</h2>
                <p style={{ color: 'var(--text-body)', margin: 0 }}>Manage your buses, routes, and tickets from this dashboard.</p>
              </div>

              <h3 style={{ marginBottom: '16px', color: 'var(--text-heading)', fontSize: '18px', fontWeight: '700' }}>Fleet Overview</h3>
              <div className="dash-stats-grid" style={{ marginBottom: '32px' }}>
                <div className="dash-stat card-animated" onClick={() => setActiveTab('buses')}>
                  <div className="dash-stat-header">
                    <span className="dash-stat-label">Total Buses</span>
                    <span className="dash-stat-icon indigo"><Bus size={18} /></span>
                  </div>
                  <div className="dash-stat-value">{dashboardStats.totalBuses}</div>
                  <button className="dash-stat-action">Manage Fleet →</button>
                </div>

                <div className="dash-stat card-animated" onClick={() => setActiveTab('buses')}>
                  <div className="dash-stat-header">
                    <span className="dash-stat-label">Active Routes</span>
                    <span className="dash-stat-icon emerald"><Map size={18} /></span>
                  </div>
                  <div className="dash-stat-value">{dashboardStats.activeBuses}</div>
                  <button className="dash-stat-action">Currently running</button>
                </div>
              </div>

              <h3 style={{ marginBottom: '16px', color: 'var(--text-heading)', fontSize: '18px', fontWeight: '700' }}>Booking Statistics</h3>
              <div className="dash-stats-grid">
                <div className="dash-stat card-animated" onClick={() => setActiveTab('bookings')}>
                  <div className="dash-stat-header">
                    <span className="dash-stat-label">Total Bookings</span>
                    <span className="dash-stat-icon indigo"><CheckSquare size={18} /></span>
                  </div>
                  <div className="dash-stat-value">{dashboardStats.totalBookings}</div>
                  <button className="dash-stat-action">View all →</button>
                </div>

                <div className="dash-stat card-animated" onClick={() => setActiveTab('bookings')}>
                  <div className="dash-stat-header">
                    <span className="dash-stat-label">Pending Approval</span>
                    <span className="dash-stat-icon amber"><Clock size={18} /></span>
                  </div>
                  <div className="dash-stat-value">{dashboardStats.pendingBookings}</div>
                  <button className="dash-stat-action">Requires action</button>
                </div>

                <div className="dash-stat card-animated">
                  <div className="dash-stat-header">
                    <span className="dash-stat-label">Total Revenue</span>
                    <span className="dash-stat-icon emerald"><TrendingUp size={18} /></span>
                  </div>
                  <div className="dash-stat-value">₹{dashboardStats.totalRevenue.toLocaleString()}</div>
                  <button className="dash-stat-action" style={{ cursor: 'default' }}>From confirmed bookings</button>
                </div>
              </div>

              <div style={{ marginTop: '32px', background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
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

          {activeTab === 'profile' && <Operatorprofile operatorData={operatorData} />}
          {activeTab === 'buses' && <GetOperatorBuses operatorData={operatorData} onAddBus={() => { setEditBusData(null); setActiveTab('add-bus'); }} onEditBus={(bus) => { setEditBusData(bus); setActiveTab('add-bus'); }} />}
          {activeTab === 'add-bus' && <AddOperatorBuses isApproved={operatorData?.isApproved} operatorId={operatorData?._id} editBusData={editBusData} onCancel={() => setActiveTab('buses')} />}
          {activeTab === 'bookings' && <BookingProfile type="bus" adminMode={true} title="Manage Bus Bookings" />}
        </main>

        {logoutConfirm && (
          <ConfirmAlert
            message="Are you sure you want to log out of your Operator Dashboard?"
            onConfirm={logout}
            onCancel={() => setLogoutConfirm(false)}
          />
        )}
    </div>
  )
}

export default OperatorDash
