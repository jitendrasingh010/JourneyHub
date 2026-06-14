import { Eye, EyeOff, Lock, Mail, Phone, User, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'

const API_URL = '/user'

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const signupData = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
      }

      const res = await axiosInstance.post(`${API_URL}/signup`, signupData)
      setIsError(false)
      setMessage(res.data.message || 'Account created! Redirecting...')
      setTimeout(() => navigate('/login'), 1200)
    } catch (error) {
      setIsError(true)
      setMessage(error.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Brand panel */}
      <div className="brand-panel">
        <div className="brand-badge">
          <span className="brand-badge-dot" />
          Join Millions of Travelers
        </div>
        <div className="brand-logo">JourneyHub</div>
        <p className="brand-tagline">
          Create your free account and start exploring flights, hotels, and trains — all in one seamless platform.
        </p>
        <div className="brand-stats">
          <div className="stat-card">
            <div className="stat-icon indigo">🎯</div>
            <div className="stat-info">
              <span className="stat-value">Free</span>
              <span className="stat-label">No hidden fees</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">🔒</div>
            <div className="stat-info">
              <span className="stat-value">Secure</span>
              <span className="stat-label">End-to-end encrypted</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon emerald">⚡</div>
            <div className="stat-info">
              <span className="stat-value">Instant</span>
              <span className="stat-label">Confirmed bookings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth card */}
      <div className="auth-right">
        <div className="auth-card" 
          style={{ maxWidth: '480px' }}
        >
          <div className="auth-card-header">
            <div className="auth-card-icon">
              <UserPlus />
            </div>
            <h1 className="auth-card-title">Create account</h1>
            <p className="auth-card-subtitle">Join JourneyHub in less than a minute</p>
          </div>

          <form className="auth-form" onSubmit={handleSignup}>
            {/* Name row */}
            <div className="form-row">
              <div className="input-group">
                <label className="input-label" htmlFor="signup-firstname">First name</label>
                <div className="input-wrapper">
                  <span className="input-icon"><User /></span>
                  <input
                    id="signup-firstname"
                    className="input-field"
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    autoComplete="given-name"
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="signup-lastname">Last name</label>
                <div className="input-wrapper">
                  <span className="input-icon"><User /></span>
                  <input
                    id="signup-lastname"
                    className="input-field"
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="input-group">
              <label className="input-label" htmlFor="signup-email">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail /></span>
                <input
                  id="signup-email"
                  className="input-field"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="input-group">
              <label className="input-label" htmlFor="signup-phone">Phone number</label>
              <div className="input-wrapper">
                <span className="input-icon"><Phone /></span>
                <input
                  id="signup-phone"
                  className="input-field"
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="input-group">
              <label className="input-label" htmlFor="signup-gender">Gender</label>
              <div className="input-wrapper">
                <select
                  id="signup-gender"
                  className="input-field select-field"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{ paddingLeft: '14px' }}
                >
                  <option value="">Select gender (optional)</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <label className="input-label" htmlFor="signup-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock /></span>
                <input
                  id="signup-password"
                  className="input-field has-toggle"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
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

            {/* Submit */}
            <button id="signup-submit" className="btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Message */}
            {message && (
              <div className={`auth-message ${isError ? 'error' : 'success'}`}>
                {isError ? '⚠' : '✓'} {message}
              </div>
            )}
          </form>

          <div className="auth-footer" style={{ marginTop: '24px' }}>
            <p>
              Already have an account?{' '}
              <Link to="/login" id="link-login-from-signup">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
