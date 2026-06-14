import { Edit3, IndianRupee, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import ConfirmAlert from '../components/ConfirmAlert'
import LazyImage from '../components/LazyImage'
import axiosInstance from '../utils/axiosInstance'

const API_URL = '/location'

const Addlocation = () => {
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    country: 'India',
    shortDescription: '',
    startingPrice: '',
  })
  const [image, setImage] = useState(null)
  const [locations, setLocations] = useState([])
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

  const getLocations = async () => {
    try {
      const res = await axiosInstance.get(`${API_URL}/get`)
      setLocations(res.data.locations)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Location load failed')
    }
  }

  const resetForm = () => {
    setFormData({
      city: '',
      state: '',
      country: 'India',
      shortDescription: '',
      startingPrice: '',
    })
    setImage(null)
    setEditId('')
  }

  const openAddForm = () => {
    resetForm()
    setMessage('')
    setIsFormOpen(true)
  }

  const openEditForm = (location) => {
    setFormData({
      city: location.city || '',
      state: location.state || '',
      country: location.country || 'India',
      shortDescription: location.shortDescription || '',
      startingPrice: location.startingPrice || '',
    })
    setImage(null)
    setEditId(location._id)
    setMessage('')
    setIsFormOpen(true)
  }

  const saveLocation = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const locationData = new FormData()

      Object.keys(formData).forEach((key) => {
        locationData.append(key, formData[key])
      })

      if (image) {
        locationData.append('image', image)
      }

      if (editId) {
        const res = await axiosInstance.put(`${API_URL}/update/${editId}`, locationData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setMessage(res.data.message)
        setLocations((oldLocations) =>
          oldLocations.map((location) => (location._id === editId ? res.data.location : location))
        )
      } else {
        const res = await axiosInstance.post(`${API_URL}/add`, locationData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setMessage(res.data.message)
        setLocations((oldLocations) => [res.data.location, ...oldLocations])
      }

      resetForm()
      setIsFormOpen(false)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Location save failed')
    } finally {
      setLoading(false)
    }
  }

  const askDeleteConfirm = (location) => {
    setConfirmAlert({
      message: `Delete location "${location.city}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmAlert(null)
        try {
          const res = await axiosInstance.delete(`${API_URL}/delete/${location._id}`)
          setMessage(res.data.message)
          setLocations((old) => old.filter((l) => l._id !== location._id))
        } catch (error) {
          setMessage(error.response?.data?.message || 'Location delete failed')
        }
      }
    })
  }

  useEffect(() => {
    getLocations()
  }, [])

  const filteredLocations = locations
    .filter(loc => {
      const q = search.toLowerCase()
      if (!q) return true
      return (loc.city || '').toLowerCase().includes(q) || 
             (loc.state || '').toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'price-low') return (Number(a.startingPrice) || 0) - (Number(b.startingPrice) || 0)
      if (sortBy === 'price-high') return (Number(b.startingPrice) || 0) - (Number(a.startingPrice) || 0)
      return 0
    })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Panel header */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <span className="panel-eyebrow">Locations</span>
            <h2 className="panel-title">Location List</h2>
            <p className="panel-desc">Total: {locations.length} | Showing: {filteredLocations.length}</p>
          </div>
          <div className="panel-actions">
            <button className="d-btn brand" type="button" onClick={openAddForm}>
              <Plus size={16} />
              Add Location
            </button>
            <button className="d-btn ghost" type="button" onClick={getLocations}>
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
              placeholder="Search by city or state..."
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

      {/* Location cards */}
      {filteredLocations.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="empty-state-icon">📍</div>
            <p className="empty-state-title">No locations yet</p>
            <p className="empty-state-desc">{search ? 'Try changing your search.' : 'Add your first travel location to get started.'}</p>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {filteredLocations.map((location) => (
            <div className="item-card card-animated animate-fadeInUp" key={location._id}>
              <LazyImage 
                className="item-card-img" 
                src={location.image} 
                alt={location.city} 
              />
              <div className="item-card-body">
                <h3 className="item-card-title">{location.city}, {location.state}</h3>
                <p className="item-card-sub">{location.country}</p>
                <p className="item-card-desc">{location.shortDescription}</p>
                <div className="item-card-meta">
                  <IndianRupee size={15} />
                  {location.startingPrice} starting
                </div>
                <div className="item-card-actions">
                  <button className="d-btn ghost sm" type="button" onClick={() => openEditForm(location)}>
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button className="d-btn danger sm" type="button" onClick={() => askDeleteConfirm(location)}>
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      
        {isFormOpen && (
          <div className="modal-overlay"
          >
            <form className="modal-box" 
              onSubmit={saveLocation}
            >
              <div className="modal-header">
                <div >
                  <p className="modal-eyebrow">Locations</p>
                  <h2 className="modal-title">{editId ? 'Update Location' : 'Add Location'}</h2>
                </div>
                <button className="modal-close"
                  type="button"
                  onClick={() => { setIsFormOpen(false); resetForm() }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="d-form cols-2">
                <div className="d-field">
                  <label className="d-label">City</label>
                  <input className="d-input" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                </div>
                <div className="d-field">
                  <label className="d-label">State</label>
                  <input className="d-input" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                </div>
                <div className="d-field">
                  <label className="d-label">Country</label>
                  <input className="d-input" name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
                </div>
                <div className="d-field">
                  <label className="d-label">Starting Price</label>
                  <div className="d-input-wrapper">
                    <span className="d-input-icon"><IndianRupee size={16} /></span>
                    <input
                      className="d-input with-icon"
                      type="number"
                      name="startingPrice"
                      value={formData.startingPrice}
                      onChange={handleChange}
                      placeholder="Starting price"
                    />
                  </div>
                </div>
                <div className="d-field">
                  <label className="d-label">Upload Image</label>
                  <input className="d-file" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                </div>
                <div className="d-field span-2">
                  <label className="d-label">Short Description</label>
                  <textarea
                    className="d-textarea"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="Small detail about this place"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="d-btn ghost"
                  type="button"
                  onClick={() => { setIsFormOpen(false); resetForm() }}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button className="d-btn brand" disabled={loading}>
                  <Plus size={16} />
                  {loading ? 'Saving…' : editId ? 'Update Location' : 'Add Location'}
                </button>
              </div>

              {message && <div className="d-message info" style={{ marginTop: '16px' }}>{message}</div>}
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

export default Addlocation
