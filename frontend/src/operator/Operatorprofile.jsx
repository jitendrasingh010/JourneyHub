import React, { useState, useEffect } from 'react'
import { Edit3, Mail, Phone, RotateCcw, ShieldCheck, X, Bus, Building, MapPin, KeyRound } from 'lucide-react'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'

const API_URL = '/user'

const Operatorprofile = ({ operatorData }) => {
  const [formData, setFormData] = useState({
    agencyName: '',
    contactPerson: '',
    businessPhone: '',
    businessEmail: '',
    gstNumber: '',
    city: '',
    state: ''
  })
  const [savedProfile, setSavedProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
  })
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  const { token } = useAuth()

  useEffect(() => {
    if (operatorData) {
      const profile = {
        agencyName: operatorData.agencyName || '',
        contactPerson: operatorData.contactPerson || '',
        businessPhone: operatorData.businessPhone || '',
        businessEmail: operatorData.businessEmail || '',
        gstNumber: operatorData.gstNumber || '',
        city: operatorData.headOfficeAddress?.city || '',
        state: operatorData.headOfficeAddress?.state || ''
      }
      setFormData(profile)
      setSavedProfile(profile)
    }
  }, [operatorData])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const cancelEdit = () => {
    setFormData(savedProfile)
    setIsEditing(false)
    setMessage('')
  }

  const resetForm = () => {
    setFormData(savedProfile)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const payload = {
        ...formData,
        headOfficeAddress: {
          city: formData.city,
          state: formData.state
        }
      }

      const res = await axiosInstance.put(`/operator/update/${operatorData._id}`, payload)
      
      setMessage(res.data.message)
      setSavedProfile(formData)
      setIsEditing(false)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPasswordMessage('')

    try {
      const res = await axiosInstance.put(`${API_URL}/changepassword`, passwordData)
      setPasswordMessage(res.data.message)
      setPasswordData({ oldPassword: '', newPassword: '' })
      setIsPasswordModalOpen(false)
    } catch (error) {
      setPasswordMessage(error.response?.data?.message || 'Password change failed')
    }
  }

  if (!operatorData) {
    return <div style={{ padding: '24px', color: 'var(--text-muted)' }}>Loading profile...</div>
  }

  const avatarText = formData.agencyName ? formData.agencyName.substring(0, 2).toUpperCase() : 'OP'

  return (
    <div className="profile-layout">
      {/* ── Sidebar ── */}
      <div className="profile-sidebar">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-initials">{avatarText}</div>
        </div>

        <h2 className="profile-name">{formData.agencyName}</h2>
        <span className="profile-role">
          <ShieldCheck size={14} />
          Bus Operator
        </span>

        <div className="profile-sidebar-actions">
          <button className="d-btn brand" type="button" onClick={() => setIsEditing(true)}>
            <Edit3 size={15} />
            Edit Profile
          </button>
          <button className="d-btn ghost" type="button" onClick={() => { setPasswordMessage(''); setIsPasswordModalOpen(true) }}>
            <KeyRound size={15} />
            Reset Password
          </button>
        </div>

        <div className="profile-meta-list">
          <div className="profile-meta-item">
            <Mail size={15} />
            <span>{formData.businessEmail || 'No email'}</span>
          </div>
          <div className="profile-meta-item">
            <Phone size={15} />
            <span>{formData.businessPhone || 'No phone'}</span>
          </div>
          <div className="profile-meta-item">
            <MapPin size={15} />
            <span>{formData.city ? `${formData.city}, ${formData.state}` : 'Location missing'}</span>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <div className="panel-title-group">
              <span className="panel-eyebrow">Agency Details</span>
              <h2 className="panel-title">{isEditing ? 'Edit Profile' : 'Profile Overview'}</h2>
            </div>
            {isEditing && (
              <div className="panel-actions">
                <button className="d-btn ghost" type="button" onClick={resetForm}>
                  <RotateCcw size={15} />
                  Reset
                </button>
                <button className="d-btn ghost" type="button" onClick={cancelEdit}>
                  <X size={15} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {message && (
            <div style={{ padding: '12px', margin: '0 24px', borderRadius: '8px', background: message.includes('success') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: message.includes('success') ? '#10b981' : '#ef4444' }}>
              {message}
            </div>
          )}

          <div className="d-form cols-2">
            <div className="d-field">
              <label className="d-label">Agency Name</label>
              <div className="d-input-wrapper">
                <span className="d-input-icon"><Bus size={16} /></span>
                <input
                  className="d-input with-icon"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="d-field">
              <label className="d-label">Contact Person</label>
              <div className="d-input-wrapper">
                <span className="d-input-icon"><Building size={16} /></span>
                <input
                  className="d-input with-icon"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="d-field">
              <label className="d-label">Business Phone</label>
              <input className="d-input" name="businessPhone" value={formData.businessPhone} onChange={handleChange} disabled={!isEditing} required />
            </div>

            <div className="d-field">
              <label className="d-label">Business Email</label>
              <input className="d-input" type="email" name="businessEmail" value={formData.businessEmail} onChange={handleChange} disabled={!isEditing} required />
            </div>

            <div className="d-field">
              <label className="d-label">GST Number</label>
              <input className="d-input" name="gstNumber" value={formData.gstNumber} onChange={handleChange} disabled={!isEditing} />
            </div>

            <div className="d-field"></div>

            <div className="d-field">
              <label className="d-label">City</label>
              <input className="d-input" name="city" value={formData.city} onChange={handleChange} disabled={!isEditing} />
            </div>

            <div className="d-field">
              <label className="d-label">State</label>
              <input className="d-input" name="state" value={formData.state} onChange={handleChange} disabled={!isEditing} />
            </div>
          </div>

          {isEditing && (
            <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)', marginTop: '20px' }}>
              <button className="d-btn brand" type="submit" disabled={loading}>
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          )}
        </form>

        {passwordMessage && <div className="d-message info">{passwordMessage}</div>}
      </div>

      {/* ── Change password modal ── */}
      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <form className="modal-box" onSubmit={changePassword}>
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">Security</p>
                <h2 className="modal-title">Reset Password</h2>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => { setIsPasswordModalOpen(false); setPasswordData({ oldPassword: '', newPassword: '' }) }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="d-form">
              <div className="d-field">
                <label className="d-label">Old Password</label>
                <input
                  className="d-input"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  required
                />
              </div>
              <div className="d-field">
                <label className="d-label">New Password</label>
                <input
                  className="d-input"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="d-btn ghost"
                type="button"
                onClick={() => { setIsPasswordModalOpen(false); setPasswordData({ oldPassword: '', newPassword: '' }) }}
              >
                <X size={16} />
                Cancel
              </button>
              <button className="d-btn brand" type="submit">
                <KeyRound size={16} />
                Update Password
              </button>
            </div>

            {passwordMessage && <div className="d-message info" style={{ marginTop: '16px' }}>{passwordMessage}</div>}
          </form>
        </div>
      )}
    </div>
  )
}

export default Operatorprofile