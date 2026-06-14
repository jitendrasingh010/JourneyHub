import axios from 'axios'
import { Edit3, KeyRound, Mail, Phone, RotateCcw, Save, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import LazyImage from '../components/LazyImage'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'

const API_URL = '/user'

const UserProfile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    profileImage: '',
  })
  const [savedProfile, setSavedProfile] = useState(null)
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
  })
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const { token, updateUser } = useAuth()
  const userName = `${formData.firstName || 'Traveler'} ${formData.lastName || ''}`
  const avatarText = `${formData.firstName?.[0] || 'T'}${formData.lastName?.[0] || 'U'}`
  const displayImage = profileImagePreview || formData.profileImage

  const getProfile = async () => {
    try {
      const res = await axiosInstance.get(`${API_URL}/profile`)
      const profile = {
        firstName: res.data.user.firstName || '',
        lastName: res.data.user.lastName || '',
        email: res.data.user.email || '',
        phone: res.data.user.phone || '',
        gender: res.data.user.gender || '',
        profileImage: res.data.user.profileImage || '',
      }
      setFormData(profile)
      setSavedProfile(profile)
      setProfileImageFile(null)
      setProfileImagePreview('')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Profile load failed')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setProfileImageFile(file)
    setProfileImagePreview(URL.createObjectURL(file))
  }

  const resetProfileForm = () => {
    if (savedProfile) setFormData(savedProfile)
    setProfileImageFile(null)
    setProfileImagePreview('')
    setMessage('')
  }

  const cancelEdit = () => {
    resetProfileForm()
    setIsEditing(false)
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const profileData = new FormData()
      Object.keys(formData).forEach((key) => {
        if (key !== 'profileImage') profileData.append(key, formData[key])
      })
      if (profileImageFile) profileData.append('profileImage', profileImageFile)

      const res = await axiosInstance.put(`${API_URL}/updateprofile`, profileData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      updateUser(res.data.user)
      const updated = {
        firstName: res.data.user.firstName || '',
        lastName: res.data.user.lastName || '',
        email: res.data.user.email || '',
        phone: res.data.user.phone || '',
        gender: res.data.user.gender || '',
        profileImage: res.data.user.profileImage || '',
      }
      setFormData(updated)
      setSavedProfile(updated)
      setProfileImageFile(null)
      setProfileImagePreview('')
      setIsEditing(false)
      setMessage(res.data.message)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Profile update failed')
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

  useEffect(() => {
    getProfile()
  }, [])

  return (
    <div className="profile-layout">
      {/* ── Sidebar ── */}
      <div className="profile-sidebar">
        <div className="profile-avatar-wrap">
          {displayImage ? (
            <LazyImage className="profile-avatar" src={displayImage} alt={userName} />
          ) : (
            <div className="profile-avatar-initials">{avatarText}</div>
          )}
        </div>

        <h2 className="profile-name">{userName}</h2>
        <span className="profile-role">
          <UserRound size={14} />
          Traveler
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
            <span>{formData.email || 'No email'}</span>
          </div>
          <div className="profile-meta-item">
            <Phone size={15} />
            <span>{formData.phone || 'No phone'}</span>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <form className="panel" onSubmit={updateProfile}>
          <div className="panel-header">
            <div className="panel-title-group">
              <span className="panel-eyebrow">Account</span>
              <h2 className="panel-title">{isEditing ? 'Edit Profile' : 'Profile Details'}</h2>
            </div>
            {isEditing && (
              <div className="panel-actions">
                <button className="d-btn ghost" type="button" onClick={resetProfileForm}>
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

          <div className="d-form cols-2">
            <div className="d-field">
              <label className="d-label">First Name</label>
              <div className="d-input-wrapper">
                <span className="d-input-icon"><UserRound size={16} /></span>
                <input
                  className="d-input with-icon"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="d-field">
              <label className="d-label">Last Name</label>
              <input className="d-input" name="lastName" value={formData.lastName} onChange={handleChange} disabled={!isEditing} required />
            </div>

            <div className="d-field">
              <label className="d-label">Email</label>
              <input className="d-input" name="email" type="email" value={formData.email} onChange={handleChange} disabled={!isEditing} required />
            </div>

            <div className="d-field">
              <label className="d-label">Phone</label>
              <input className="d-input" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} />
            </div>

            <div className="d-field">
              <label className="d-label">Gender</label>
              <select className="d-select" name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {isEditing && (
              <div className="d-field">
                <label className="d-label">Upload Profile Image</label>
                <input className="d-file" type="file" accept="image/*" onChange={handleProfileImageChange} />
              </div>
            )}
          </div>

          {isEditing && (
            <button className="d-btn brand" style={{ marginTop: '20px' }} disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving…' : 'Save Profile'}
            </button>
          )}

          {message && <div className="d-message info" style={{ marginTop: '16px' }}>{message}</div>}
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

export default UserProfile
