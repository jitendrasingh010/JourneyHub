import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, User, Phone, Mail, FileText, MapPin } from 'lucide-react'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'

const RegisterOperator = () => {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    agencyName: '',
    contactPerson: '',
    businessPhone: '',
    businessEmail: '',
    gstNumber: '',
    city: '',
    state: ''
  })
  const [image, setImage] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key])
      })
      if (image) {
        data.append('image', image)
      }

      const res = await axiosInstance.post('/operator/add', data, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setMessage(res.data.message)
      
      if (user) {
        const updatedUser = { ...user, role: 'bus_admin' }
        updateUser(updatedUser)
      }

      setTimeout(() => {
        navigate('/operator-dashboard')
      }, 2000)

    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-body)' }}>
      <div className="panel card-animated" style={{ maxWidth: '600px', width: '100%', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Bus size={30} style={{ color: '#6366f1' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-heading)', marginBottom: '8px' }}>Register Bus Agency</h2>
          <p style={{ color: 'var(--text-muted)' }}>Partner with JourneyHub to manage and sell bus tickets</p>
        </div>

        {message && (
          <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', background: message.includes('success') ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: message.includes('success') ? '#34d399' : '#f87171', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="input-wrapper">
            <Bus className="input-icon" />
            <input type="text" className="input-field" placeholder="Travels/Agency Name *" name="agencyName" value={formData.agencyName} onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="input-wrapper" style={{ flex: 1 }}>
              <User className="input-icon" />
              <input type="text" className="input-field" placeholder="Contact Person *" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required />
            </div>
            <div className="input-wrapper" style={{ flex: 1 }}>
              <Phone className="input-icon" />
              <input type="text" className="input-field" placeholder="Business Phone *" name="businessPhone" value={formData.businessPhone} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-wrapper">
            <Mail className="input-icon" />
            <input type="email" className="input-field" placeholder="Business Email *" name="businessEmail" value={formData.businessEmail} onChange={handleChange} required />
          </div>

          <div className="input-wrapper">
            <FileText className="input-icon" />
            <input type="text" className="input-field" placeholder="GST Number (Optional)" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="input-wrapper" style={{ flex: 1 }}>
              <MapPin className="input-icon" />
              <input type="text" className="input-field" placeholder="Head Office City" name="city" value={formData.city} onChange={handleChange} />
            </div>
            <div className="input-wrapper" style={{ flex: 1 }}>
              <MapPin className="input-icon" />
              <input type="text" className="input-field" placeholder="Head Office State" name="state" value={formData.state} onChange={handleChange} />
            </div>
          </div>

          <div className="input-wrapper">
            <FileText className="input-icon" />
            <input type="file" className="input-field" accept="image/*" onChange={handleImageChange} style={{ paddingTop: '10px' }} />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
            {loading ? 'Submitting Application...' : 'Register Agency'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default RegisterOperator