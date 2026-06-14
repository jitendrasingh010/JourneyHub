import { Eye, EyeOff, Hotel, Lock, LogIn, Mail, Bus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'

const API_URL = '/user'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const loginData = {
        email: email.trim().toLowerCase(),
        password,
      }

      const res = await axiosInstance.post(`${API_URL}/login`, loginData)
      login(res.data.token, res.data.user)
      
      setIsError(false)
      setMessage(res.data.message || 'Login successful! Redirecting...')
      if (res.data.user.role === 'super_admin') {
        nav('/admin/dashboard')
      } else if (res.data.user.role === 'hotel_admin') {
        nav('/hotel/dashboard')
      } else if (res.data.user.role === 'bus_admin') {
        nav('/operator-dashboard')
      } else {
        nav('/bookings')
      }
    } catch (error) {
      setIsError(true)
      setMessage(error.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* ── Left brand panel ── */}
      <div className="brand-panel">
        <div className="brand-badge">
          <span className="brand-badge-dot" />
          Trusted Travel Platform
        </div>

        <div className="brand-logo">JourneyHub</div>

        <p className="brand-tagline">
          Seamless travel, luxury stays, and express transit — all in one place.
        </p>

        <div className="brand-stats">
          <div className="stat-card">
            <div className="stat-icon indigo">✈️</div>
            <div className="stat-info">
              <span className="stat-value">2.4M+</span>
              <span className="stat-label">Flights booked</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">🏨</div>
            <div className="stat-info">
              <span className="stat-value">18,000+</span>
              <span className="stat-label">Partner hotels</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon emerald">🚆</div>
            <div className="stat-info">
              <span className="stat-value">500+</span>
              <span className="stat-label">Train routes</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right auth card ── */}
      <div className="auth-right">
        <div className="auth-card"
        >
          {/* Card header */}
          <div className="auth-card-header">
            <div className="auth-card-icon">
              <LogIn />
            </div>
            <h1 className="auth-card-title">Welcome back</h1>
            <p className="auth-card-subtitle">Sign in to your JourneyHub account</p>
          </div>

          {/* Login form */}
          <form className="auth-form" onSubmit={handleLogin}>
            {/* Email */}
            <div className="input-group">
              <label className="input-label" htmlFor="login-email">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail /></span>
                <input
                  id="login-email"
                  className="input-field"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <label className="input-label" htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock /></span>
                <input
                  id="login-password"
                  className="input-field has-toggle"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button"
                  className="eye-toggle"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Forgot link */}
            <div className="forgot-row">
              <Link to="/forget" className="forgot-link">Forgot password?</Link>
            </div>

            {/* Submit */}
            <button id="login-submit" className="btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Message */}
            {message && (
              <div className={`auth-message ${isError ? 'error' : 'success'}`}>
                {isError ? '⚠' : '✓'} {message}
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="auth-divider" style={{ marginTop: '24px' }}>Partner portals</div>

          {/* Partner portals */}
          <div className="partner-portals" style={{ marginTop: '12px' }}>
            <Link to="/registerhotel" className="partner-btn" id="link-register-hotel">
              <span className="partner-btn-icon hotel"><Hotel size={18} color="#fb923c" /></span>
              <span className="partner-btn-text">
                <span className="partner-btn-title">Hotel</span>
                <span className="partner-btn-label">Register property</span>
              </span>
            </Link>
            <Link to="/register-operator" className="partner-btn" id="link-register-operator">
              <span className="partner-btn-icon train"><Bus size={18} color="#6366f1" /></span>
              <span className="partner-btn-text">
                <span className="partner-btn-title">Bus Operator</span>
                <span className="partner-btn-label">Register agency</span>
              </span>
            </Link>
          </div>

          <div className="auth-footer" style={{ marginTop: '24px' }}>
            <p>
              New to JourneyHub?{' '}
              <Link to="/signup" id="link-signup-from-login">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
