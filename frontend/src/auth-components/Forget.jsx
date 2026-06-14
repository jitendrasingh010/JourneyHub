import { Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'

const API_URL = '/user'

const Forget = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  const sendOtp = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const res = await axiosInstance.post(`${API_URL}/forgetpassword`, { email })
      setIsError(false)
      setMessage(res.data.message || 'OTP sent to your email.')
      setStep(2)
    } catch (error) {
      setIsError(true)
      setMessage(error.response?.data?.message || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const res = await axiosInstance.post(`${API_URL}/verify-otp`, { email, otp })
      setIsError(false)
      setMessage(res.data.message || 'OTP verified.')
      setStep(3)
    } catch (error) {
      setIsError(true)
      setMessage(error.response?.data?.message || 'OTP verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const res = await axiosInstance.post(`${API_URL}/resetpassword`, { email, otp, newPassword })
      setIsError(false)
      setMessage(res.data.message || 'Password reset! Redirecting…')
      setTimeout(() => navigate('/login'), 1200)
    } catch (error) {
      setIsError(true)
      setMessage(error.response?.data?.message || 'Password reset failed.')
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = ['Enter Email', 'Verify OTP', 'New Password']

  return (
    <div className="auth-page">
      {/* Brand panel */}
      <div className="brand-panel">
        <div className="brand-badge">
          <span className="brand-badge-dot" />
          Account Recovery
        </div>
        <div className="brand-logo">JourneyHub</div>
        <p className="brand-tagline">
          Securely recover access to your account in three simple steps. Your data is always protected.
        </p>
        <div className="brand-stats">
          <div className="stat-card">
            <div className="stat-icon indigo">📧</div>
            <div className="stat-info">
              <span className="stat-value">Step 1</span>
              <span className="stat-label">Verify your email</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">🔑</div>
            <div className="stat-info">
              <span className="stat-value">Step 2</span>
              <span className="stat-label">Enter OTP code</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon emerald">✅</div>
            <div className="stat-info">
              <span className="stat-value">Step 3</span>
              <span className="stat-label">Set new password</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth card */}
      <div className="auth-right">
        <div className="auth-card"
        >
          <div className="auth-card-header">
            <div className="auth-card-icon">
              <KeyRound />
            </div>
            <h1 className="auth-card-title">Forgot password?</h1>
            <p className="auth-card-subtitle">
              {step === 1 && "We'll send a one-time password to your email."}
              {step === 2 && `OTP sent to ${email}. Check your inbox.`}
              {step === 3 && 'Almost done! Set your new password.'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="step-indicator">
            {[1, 2, 3].map((s) => (
              <div key={s}
                className={`step-dot ${s === step ? 'active' : s < step ? 'done' : ''}`}
                title={stepLabels[s - 1]}
              />
            ))}
          </div>

          {/* Step 1 — Email */}
          {step === 1 && (
            <form className="auth-form" onSubmit={sendOtp}>
              <div className="input-group">
                <label className="input-label" htmlFor="forget-email">Email address</label>
                <div className="input-wrapper">
                  <span className="input-icon"><Mail /></span>
                  <input
                    id="forget-email"
                    className="input-field"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button id="forget-send-otp" className="btn-primary" type="submit" disabled={loading}>
                {loading ? <><span className="spinner" /> Sending OTP…</> : 'Send OTP'}
              </button>

              {message && (
                <div className={`auth-message ${isError ? 'error' : 'success'}`}>
                  {isError ? '⚠' : '✓'} {message}
                </div>
              )}
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <form className="auth-form" onSubmit={verifyOtp}>
              <div className="input-group">
                <label className="input-label" htmlFor="forget-otp">One-Time Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"><KeyRound /></span>
                  <input
                    id="forget-otp"
                    className="input-field"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    inputMode="numeric"
                    style={{ letterSpacing: '0.18em', fontWeight: '600' }}
                  />
                </div>
              </div>

              <button id="forget-verify-otp" className="btn-primary" type="submit" disabled={loading}>
                {loading ? <><span className="spinner" /> Verifying…</> : 'Verify OTP'}
              </button>

              {message && (
                <div className={`auth-message ${isError ? 'error' : 'success'}`}>
                  {isError ? '⚠' : '✓'} {message}
                </div>
              )}

              <button type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontFamily: 'var(--font-primary)',
                  marginTop: '-4px',
                }}
                onClick={() => { setStep(1); setMessage(''); }}
              >
                ← Change email
              </button>
            </form>
          )}

          {/* Step 3 — New Password */}
          {step === 3 && (
            <form className="auth-form" onSubmit={resetPassword}>
              <div className="input-group">
                <label className="input-label" htmlFor="forget-newpass">New password</label>
                <div className="input-wrapper">
                  <span className="input-icon"><Lock /></span>
                  <input
                    id="forget-newpass"
                    className="input-field has-toggle"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
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

              <button id="forget-reset" className="btn-primary" type="submit" disabled={loading}>
                {loading ? <><span className="spinner" /> Resetting…</> : 'Reset Password'}
              </button>

              {message && (
                <div className={`auth-message ${isError ? 'error' : 'success'}`}>
                  {isError ? '⚠' : '✓'} {message}
                </div>
              )}
            </form>
          )}

          <div className="auth-footer" style={{ marginTop: '28px' }}>
            <p>
              Remembered it?{' '}
              <Link to="/login" id="link-login-from-forget">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Forget
