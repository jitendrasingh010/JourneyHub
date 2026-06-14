import React, { useState, useEffect } from 'react'
import { PlusCircle, Bus, MapPin, DollarSign, Users, ShieldCheck, FileText, Upload, Save, Eye, Edit3, Trash2, X } from 'lucide-react'
import LazyImage from '../components/LazyImage'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'

const AddOperatorBuses = ({ isApproved, operatorId, editBusData, onCancel }) => {
  const [formData, setFormData] = useState({
    busName: '',
    busNumber: '',
    busType: 'AC Sleeper',
    fromCityID: '',
    toCityID: '',
    duration: '',
    totalSeats: '',
    fare: '',
    amenities: '',
    boardingPoints: '',
    droppingPoints: ''
  })
  
  const [image, setImage] = useState(null)
  const [locations, setLocations] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [buses, setBuses] = useState([])

  const { token } = useAuth()

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axiosInstance.get('/location/get')
        setLocations(res.data.locations || [])
      } catch (err) {
        console.error(err)
      }
    }
    // Fetch buses for operator dashboard
    const fetchMyBuses = async () => {
      try {
        const res = await axiosInstance.get('/bus/get')
        let allBuses = res.data.buses || []
        if (operatorId) {
          allBuses = allBuses.filter(b => b.operatorName === operatorId || (b.operatorName && b.operatorName._id === operatorId))
        }
        setBuses(allBuses)
      } catch (err) {
        console.error(err)
      }
    }
    
    fetchLocations()
    fetchMyBuses()

    if (editBusData) {
      setFormData({
        busName: editBusData.busName || '',
        busNumber: editBusData.busNumber || '',
        busType: editBusData.busType || 'AC Sleeper',
        fromCityID: editBusData.fromCityID?._id || editBusData.fromCityID || '',
        toCityID: editBusData.toCityID?._id || editBusData.toCityID || '',
        duration: editBusData.duration || '',
        totalSeats: editBusData.totalSeats || '',
        fare: editBusData.fare || '',
        amenities: editBusData.amenities ? editBusData.amenities.join(', ') : '',
        boardingPoints: editBusData.boardingPoints ? editBusData.boardingPoints.map(p => p.name).join(', ') : '',
        droppingPoints: editBusData.droppingPoints ? editBusData.droppingPoints.map(p => p.name).join(', ') : ''
      })
    } else {
      setFormData({
        busName: '', busNumber: '', busType: 'AC Sleeper', fromCityID: '', toCityID: '', duration: '', totalSeats: '', fare: '', amenities: '', boardingPoints: '', droppingPoints: ''
      })
    }
  }, [editBusData, operatorId])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
  }
// Add new bus or update existing bus //
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isApproved) {
      setMessage('You cannot add buses until your account is approved.')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key])
      })
      
      data.append('availableSeats', formData.totalSeats)
      if (operatorId) {
        data.append('operatorName', operatorId)
      }

      if (image) {
        data.append('image', image)
      }

      let res;
      if (editBusData) {
        res = await axiosInstance.put(`/bus/update/${editBusData._id}`, data, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        })
        setMessage('Bus updated successfully!')
        if (onCancel) {
          setTimeout(onCancel, 1500)
        }
      } else {
        res = await axiosInstance.post('/bus/add', data, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        })
        setMessage('Bus added successfully!')
        setFormData({
          busName: '', busNumber: '', busType: 'AC Sleeper', fromCityID: '', toCityID: '', duration: '', totalSeats: '', fare: '', amenities: '', boardingPoints: '', droppingPoints: ''
        })
        setImage(null)
      }
      
      const busesRes = await axiosInstance.get('/bus/get')
      let allBuses = busesRes.data.buses || []
      if (operatorId) {
        allBuses = allBuses.filter(b => b.operatorName === operatorId || (b.operatorName && b.operatorName._id === operatorId))
      }
      setBuses(allBuses)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add bus')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{editBusData ? 'Edit Bus Details' : 'Add New Bus'}</h2>
          {editBusData && onCancel && (
            <button type="button" onClick={onCancel} className="d-btn ghost" style={{ padding: '8px 16px' }}>Cancel Edit</button>
          )}
        </div>
        
        {message && (
          <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', background: message.includes('success') ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: message.includes('success') ? '#34d399' : '#f87171' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          <div className="d-field">
            <label className="d-label">Bus Name</label>
            <input type="text" className="d-input" name="busName" value={formData.busName} onChange={handleChange} required />
          </div>

          <div className="d-field">
            <label className="d-label">Bus Number</label>
            <input type="text" className="d-input" name="busNumber" value={formData.busNumber} onChange={handleChange} required />
          </div>

          <div className="d-field">
            <label className="d-label">Bus Type</label>
            <select className="d-select" name="busType" value={formData.busType} onChange={handleChange}>
              <option value="AC Sleeper">AC Sleeper</option>
              <option value="Non AC Sleeper">Non AC Sleeper</option>
              <option value="AC Seater">AC Seater</option>
              <option value="Non AC Seater">Non AC Seater</option>
              <option value="Volvo">Volvo</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>

          <div className="d-field">
            <label className="d-label">Total Seats</label>
            <input type="number" className="d-input" name="totalSeats" value={formData.totalSeats} onChange={handleChange} required />
          </div>

          <div className="d-field">
            <label className="d-label">Fare (Rs)</label>
            <input type="number" className="d-input" name="fare" value={formData.fare} onChange={handleChange} required />
          </div>

          <div className="d-field">
            <label className="d-label">Duration (e.g. 12 hours)</label>
            <input type="text" className="d-input" name="duration" value={formData.duration} onChange={handleChange} />
          </div>

          <div className="d-field">
            <label className="d-label">From City</label>
            <select className="d-select" name="fromCityID" value={formData.fromCityID} onChange={handleChange} required>
              <option value="">Select Origin City</option>
              {locations.map(loc => (
                <option key={loc._id} value={loc._id}>{loc.city}</option>
              ))}
            </select>
          </div>

          <div className="d-field">
            <label className="d-label">To City</label>
            <select className="d-select" name="toCityID" value={formData.toCityID} onChange={handleChange} required>
              <option value="">Select Destination City</option>
              {locations.map(loc => (
                <option key={loc._id} value={loc._id}>{loc.city}</option>
              ))}
            </select>
          </div>

          <div className="d-field" style={{ gridColumn: '1 / -1' }}>
            <label className="d-label">Amenities (Comma separated)</label>
            <input type="text" className="d-input" name="amenities" value={formData.amenities} onChange={handleChange} placeholder="WiFi, AC, Water Bottle" />
          </div>

          <div className="d-field">
            <label className="d-label">Boarding Points (Comma separated)</label>
            <input type="text" className="d-input" name="boardingPoints" value={formData.boardingPoints} onChange={handleChange} placeholder="Sindhi Camp, Narayan Singh Circle" />
          </div>

          <div className="d-field">
            <label className="d-label">Dropping Points (Comma separated)</label>
            <input type="text" className="d-input" name="droppingPoints" value={formData.droppingPoints} onChange={handleChange} placeholder="ISBT, Kashmere Gate" />
          </div>

          <div className="d-field" style={{ gridColumn: '1 / -1' }}>
            <label className="d-label">Bus Image</label>
            <input type="file" className="d-input" accept="image/*" onChange={handleImageChange} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-primary" disabled={loading || !isApproved}>
              {loading ? (editBusData ? 'Updating Bus...' : 'Adding Bus...') : (editBusData ? 'Update Bus' : 'Add Bus')}
            </button>
            {!isApproved && <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '8px' }}>Approval required to add buses</p>}
          </div>

        </form>
      </div>
      
      <div className="panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Recently Added Buses</h2>
        {buses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {buses.slice(0, 4).map(bus => (
              <div key={bus._id} style={{ border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>{bus.busName} ({bus.busNumber})</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>{bus.fromCityID?.city} to {bus.toCityID?.city}</p>
                <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 'bold' }}>Rs. {bus.fare}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No buses found.</p>
        )}
      </div>
    </div>
  )
}

export default AddOperatorBuses