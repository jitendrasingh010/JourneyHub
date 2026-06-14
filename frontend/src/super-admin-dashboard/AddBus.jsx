import { Bus, Edit3, IndianRupee, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import ConfirmAlert from '../components/ConfirmAlert'
import LazyImage from '../components/LazyImage'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'

const API_URL = '/bus'

const blankForm = {
  busName: '',
  busNumber: '',
  operatorName: '',
  busType: 'AC Sleeper',
  fromCityID: '',
  toCityID: '',
  duration: '',
  totalSeats: '',
  availableSeats: '',
  fare: '',
}

const AddBus = () => {
  const [formData, setFormData] = useState(blankForm)
  const [amenities, setAmenities] = useState('')
  const [boardingPoints, setBoardingPoints] = useState('')
  const [droppingPoints, setDroppingPoints] = useState('')
  const [images, setImages] = useState(null)
  const [locations, setLocations] = useState([])
  const [buses, setBuses] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editId, setEditId] = useState('')

  // Search & Sort
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  // Confirm Alert
  const [confirmAlert, setConfirmAlert] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const { token } = useAuth()

  const getToken = () => {
    return token
  }

  const getLocations = async () => {
    try {
      const res = await axiosInstance.get('/location/get')
      setLocations(res.data.locations || [])
    } catch (error) {
      setMessage(error.response?.data?.message || 'Location load failed')
    }
  }

  const getBuses = async () => {
    try {
      const res = await axiosInstance.get(`${API_URL}/get`)
      setBuses(res.data.buses || [])
    } catch (error) {
      setMessage(error.response?.data?.message || 'Bus load failed')
    }
  }

  const resetForm = () => {
    setFormData(blankForm)
    setAmenities('')
    setBoardingPoints('')
    setDroppingPoints('')
    setImages(null)
    setEditId('')
  }

  const openAddForm = () => {
    resetForm()
    setMessage('')
    setIsFormOpen(true)
  }

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return ''
    }

    const date = new Date(dateValue)
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - offset).toISOString().slice(0, 16)
  }

  const openEditForm = (bus) => {
    setFormData({
      busName: bus.busName || '',
      busNumber: bus.busNumber || '',
      operatorName: bus.operatorName || '',
      busType: bus.busType || 'AC Sleeper',
      fromCityID: bus.fromCityID?._id || bus.fromCityID || '',
      toCityID: bus.toCityID?._id || bus.toCityID || '',
      duration: bus.duration || '',
      totalSeats: bus.totalSeats || '',
      availableSeats: bus.availableSeats || '',
      fare: bus.fare || '',
    })

    setAmenities((bus.amenities || []).join(', '))
    setBoardingPoints((bus.boardingPoints || []).map((point) => point.name).join(', '))
    setDroppingPoints((bus.droppingPoints || []).map((point) => point.name).join(', '))
    setImages(null)
    setEditId(bus._id)
    setMessage('')
    setIsFormOpen(true)
  }

  const makeNameList = (text) => {
    return text
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => ({ name }))
  }

  const showPlace = (place) => {
    if (!place) {
      return ''
    }

    if (typeof place === 'string') {
      return place
    }

    return `${place.city}, ${place.state}`
  }

  const saveBus = async (e) => {
    e.preventDefault()

    const token = getToken()
    if (!token) {
      setMessage('Please login first')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const busData = new FormData()

      Object.keys(formData).forEach((key) => {
        busData.append(key, formData[key])
      })

      busData.append('amenities', amenities)
      busData.append('boardingPoints', JSON.stringify(makeNameList(boardingPoints)))
      busData.append('droppingPoints', JSON.stringify(makeNameList(droppingPoints)))

      if (images) {
        for (let i = 0; i < images.length; i += 1) {
          busData.append('images', images[i])
        }
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }

      let res

      if (editId) {
        res = await axiosInstance.put(`${API_URL}/update/${editId}`, busData, config)
        setBuses(buses.map((bus) => (bus._id === editId ? res.data.bus : bus)))
      } else {
        res = await axiosInstance.post(`${API_URL}/add`, busData, config)
        setBuses([res.data.bus, ...buses])
      }

      setMessage(res.data.message)
      resetForm()
      setIsFormOpen(false)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Bus save failed')
    } finally {
      setLoading(false)
    }
  }

  const askDeleteConfirm = (bus) => {
    setConfirmAlert({
      message: `Delete bus "${bus.busName}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmAlert(null)
        const token = getToken()
        if (!token) {
          setMessage('Please login first')
          return
        }
        try {
          const res = await axiosInstance.delete(`${API_URL}/delete/${bus._id}`)
          setMessage(res.data.message)
          setBuses(buses.filter((b) => b._id !== bus._id))
        } catch (error) {
          setMessage(error.response?.data?.message || 'Bus delete failed')
        }
      }
    })
  }

  useEffect(() => {
    getLocations()
    getBuses()
  }, [])

  const filteredBuses = buses
    .filter(bus => {
      const q = search.toLowerCase()
      if (!q) return true
      return (bus.busName || '').toLowerCase().includes(q) || 
             (bus.operatorName || '').toLowerCase().includes(q) ||
             (bus.busNumber || '').toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now())
      if (sortBy === 'oldest') return new Date(a.createdAt || Date.now()) - new Date(b.createdAt || Date.now())
      if (sortBy === 'price-low') return (Number(a.fare) || 0) - (Number(b.fare) || 0)
      if (sortBy === 'price-high') return (Number(b.fare) || 0) - (Number(a.fare) || 0)
      return 0
    })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <span className="panel-eyebrow">Buses</span>
            <h2 className="panel-title">Bus List</h2>
            <p className="panel-desc">Total: {buses.length} | Showing: {filteredBuses.length}</p>
          </div>

          <div className="panel-actions">
            <button className="d-btn brand" type="button" onClick={openAddForm}>
              <Plus size={16} />
              Add Bus
            </button>
            <button className="d-btn ghost" type="button" onClick={getBuses}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search & Sort */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="d-input"
              placeholder="Search by name, operator or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
          <select className="d-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ minWidth: '160px' }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {message && <div className="d-message info" style={{ marginTop: '16px' }}>{message}</div>}
      </div>

      {filteredBuses.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <Bus size={34} />
            <p className="empty-state-title">No buses found</p>
            <p className="empty-state-desc">{search ? 'Try changing your search.' : 'Click Add Bus to create your first bus.'}</p>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {filteredBuses.map((bus) => (
            <div className="item-card card-animated animate-fadeInUp" key={bus._id}>
              {bus.images?.[0] ? (
                <LazyImage className="item-card-img" src={bus.images[0]} alt={bus.busName} />
              ) : (
                <div className="item-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)' }}>
                  <Bus size={42} />
                </div>
              )}

              <div className="item-card-body">
                <h3 className="item-card-title">{bus.busName}</h3>
                <p className="item-card-sub">{bus.busNumber} | {bus.busType}</p>
                <p className="item-card-desc">{showPlace(bus.fromCityID)} to {showPlace(bus.toCityID)}</p>

                <div className="item-card-meta">
                  <IndianRupee size={15} />
                  {bus.fare}
                </div>

                <div className="item-card-meta">
                  Seats Left: {bus.availableSeats}
                </div>

                <div className="item-card-meta">
                  Booked Seats: {bus.totalSeats - bus.availableSeats}
                </div>

                <div className="item-card-actions">
                  <button className="d-btn ghost sm" type="button" onClick={() => openEditForm(bus)}>
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button className="d-btn danger sm" type="button" onClick={() => askDeleteConfirm(bus)}>
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      
        {isFormOpen && (
          <div className="modal-overlay"
          >
            <form className="modal-box wide" 
              onSubmit={saveBus}
            >
              <div className="modal-header">
                <div >
                  <p className="modal-eyebrow">Bus Form</p>
                  <h2 className="modal-title">{editId ? 'Update Bus' : 'Add Bus'}</h2>
                </div>
                <button className="modal-close"
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false)
                    resetForm()
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="d-form cols-2">
                <div className="span-2" style={{ fontWeight: 700, color: 'var(--text-heading)', marginTop: '4px' }}>
                  Bus Details
                </div>

                <div className="d-field">
                  <label className="d-label">Bus Name</label>
                  <input className="d-input" name="busName" value={formData.busName} onChange={handleChange} required />
                </div>

                <div className="d-field">
                  <label className="d-label">Bus Number</label>
                  <input className="d-input" name="busNumber" value={formData.busNumber} onChange={handleChange} required />
                </div>

                <div className="d-field">
                  <label className="d-label">Operator Name</label>
                  <input className="d-input" name="operatorName" value={formData.operatorName} onChange={handleChange} required />
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

                <div className="span-2" style={{ fontWeight: 700, color: 'var(--text-heading)', marginTop: '8px' }}>
                  Route Details
                </div>

                <div className="d-field">
                  <label className="d-label">From City</label>
                  <select className="d-select" name="fromCityID" value={formData.fromCityID} onChange={handleChange} required>
                    <option value="">Select From City</option>
                    {locations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.city}, {location.state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-field">
                  <label className="d-label">To City</label>
                  <select className="d-select" name="toCityID" value={formData.toCityID} onChange={handleChange} required>
                    <option value="">Select To City</option>
                    {locations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.city}, {location.state}
                      </option>
                    ))}
                  </select>
                </div>



                <div className="d-field">
                  <label className="d-label">Duration</label>
                  <input className="d-input" name="duration" value={formData.duration} onChange={handleChange} placeholder="6 hours" />
                </div>

                <div className="span-2" style={{ fontWeight: 700, color: 'var(--text-heading)', marginTop: '8px' }}>
                  Seats And Price
                </div>

                <div className="d-field">
                  <label className="d-label">Total Seats</label>
                  <input className="d-input" type="number" name="totalSeats" value={formData.totalSeats} onChange={handleChange} required />
                </div>

                <div className="d-field">
                  <label className="d-label">Available Seats</label>
                  <input className="d-input" type="number" name="availableSeats" value={formData.availableSeats} onChange={handleChange} required />
                </div>

                <div className="d-field">
                  <label className="d-label">Fare</label>
                  <input className="d-input" type="number" name="fare" value={formData.fare} onChange={handleChange} required />
                </div>

                <div className="d-field">
                  <label className="d-label">Images</label>
                  <input className="d-file" type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} />
                </div>

                <div className="span-2" style={{ fontWeight: 700, color: 'var(--text-heading)', marginTop: '8px' }}>
                  Extra Details
                </div>

                <div className="d-field span-2">
                  <label className="d-label">Amenities</label>
                  <input className="d-input" value={amenities} onChange={(e) => setAmenities(e.target.value)} placeholder="Wifi, Water, Charging" />
                </div>

                <div className="d-field span-2">
                  <label className="d-label">Boarding Points</label>
                  <input className="d-input" value={boardingPoints} onChange={(e) => setBoardingPoints(e.target.value)} placeholder="Main Bus Stand, Railway Station" />
                </div>

                <div className="d-field span-2">
                  <label className="d-label">Dropping Points</label>
                  <input className="d-input" value={droppingPoints} onChange={(e) => setDroppingPoints(e.target.value)} placeholder="City Center, Airport Road" />
                </div>
              </div>

              <div className="modal-footer">
                <button className="d-btn ghost"
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false)
                    resetForm()
                  }}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button className="d-btn brand" disabled={loading}>
                  <Plus size={16} />
                  {loading ? 'Saving...' : editId ? 'Update Bus' : 'Add Bus'}
                </button>
              </div>
            </form>
          </div>
        )}
      

      {/* Confirm Alert */}
      {confirmAlert && (
        <ConfirmAlert
          message={confirmAlert.message}
          onConfirm={confirmAlert.onConfirm}
          onCancel={() => setConfirmAlert(null)}
        />
      )}
    </div>
  )
}

export default AddBus
