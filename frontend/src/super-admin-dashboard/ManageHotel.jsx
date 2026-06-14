import { CheckCircle, Eye, IndianRupee, Mail, MapPin, RefreshCw, Search, Trash2, X, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import ConfirmAlert from '../components/ConfirmAlert'
import LazyImage from '../components/LazyImage'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'

const API_URL = '/hotel'

const ManageHotel = () => {
  const [hotels, setHotels] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState(null)

  // Search & Sort
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Confirm alert
  const [confirmAlert, setConfirmAlert] = useState(null)
  // { message, onConfirm }

  const { token } = useAuth()

  const getHotels = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get(`${API_URL}/gethotel`)
      setHotels(res.data.hotels)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Hotel load failed')
    } finally {
      setLoading(false)
    }
  }

  const approveHotel = async (id) => {
    try {
      const res = await axiosInstance.put(`${API_URL}/approvehotel/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage(res.data.message)
      getHotels()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Approve failed')
    }
  }

  const rejectHotel = async (id) => {
    try {
      const res = await axiosInstance.put(
        `${API_URL}/reject/${id}`,
        { message: 'Rejected by admin' },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setMessage(res.data.message)
      getHotels()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Reject failed')
    }
  }

  const deleteHotel = async (id) => {
    try {
      const res = await axiosInstance.delete(`${API_URL}/deletehotel/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage(res.data.message)
      getHotels()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Delete failed')
    }
  }

  const askDeleteConfirm = (hotel) => {
    setConfirmAlert({
      message: `Are you sure you want to delete "${hotel.hotelName}"? This action cannot be undone.`,
      onConfirm: () => {
        setConfirmAlert(null)
        deleteHotel(hotel._id)
      }
    })
  }

  const askRejectConfirm = (hotel) => {
    setConfirmAlert({
      message: `Reject "${hotel.hotelName}"? The hotel owner will be notified.`,
      onConfirm: () => {
        setConfirmAlert(null)
        rejectHotel(hotel._id)
      }
    })
  }

  useEffect(() => {
    getHotels()
  }, [])

  // Filter & Sort
  const filteredHotels = hotels
    .filter(hotel => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        (hotel.hotelName || '').toLowerCase().includes(q) ||
        (hotel.location?.city || '').toLowerCase().includes(q) ||
        (hotel.location?.state || '').toLowerCase().includes(q)

      const isApproved = hotel.approvalStatus?.status === true
      const isRejected = hotel.approvalStatus?.message === 'Rejected by admin' || hotel.approvalStatus?.message === 'Rejected'
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'approved' && isApproved) ||
        (statusFilter === 'pending' && !isApproved && !isRejected) ||
        (statusFilter === 'rejected' && isRejected)

      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'name') return a.hotelName.localeCompare(b.hotelName)
      if (sortBy === 'price-low') return a.pricePerNight - b.pricePerNight
      if (sortBy === 'price-high') return b.pricePerNight - a.pricePerNight
      return 0
    })

  const showValue = (value) => {
    if (value === true) return 'Yes'
    if (value === false) return 'No'
    return value || 'Not added'
  }

  const DetailRow = ({ label, value }) => (
    <div className="detail-row">
      <p className="detail-row-label">{label}</p>
      <p className="detail-row-value">{showValue(value)}</p>
    </div>
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Panel header */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <span className="panel-eyebrow">Super Admin</span>
            <h2 className="panel-title">Manage Hotels</h2>
            <p className="panel-desc">Approve and remove hotel records. Total: {hotels.length} | Showing: {filteredHotels.length}</p>
          </div>
          <div className="panel-actions">
            <button className="d-btn ghost" onClick={getHotels}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="d-input"
              placeholder="Search by name, city, state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
          <select className="d-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ minWidth: '140px' }}>
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="d-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ minWidth: '160px' }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {message && <div className="d-message info" style={{ marginTop: '12px' }}>{message}</div>}
      </div>

      {/* Hotel cards */}
      {loading ? (
        <div className="card-grid">
          <div>Loading...</div>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="empty-state-icon">🏨</div>
            <p className="empty-state-title">No hotels found</p>
            <p className="empty-state-desc">Try changing your search or filter.</p>
          </div>
        </div>
      ) : (
        <div className="card-grid" initial="hidden" animate="show">
          {filteredHotels.map((hotel) => {
            const isApproved = hotel.approvalStatus?.status === true
            const isRejected =
              hotel.approvalStatus?.message === 'Rejected by admin' ||
              hotel.approvalStatus?.message === 'Rejected'

            return (
              <div className="item-card card-animated" key={hotel._id}>
                <LazyImage
                  className="item-card-img"
                  src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80'}
                  alt={hotel.hotelName}
                />

                <div className="item-card-body">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <h3 className="item-card-title" style={{ margin: 0 }}>{hotel.hotelName}</h3>
                    <span className={`status-badge ${isApproved ? 'approved' : isRejected ? 'rejected' : 'pending'}`}>
                      {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending'}
                    </span>
                  </div>
                  <p className="item-card-sub" style={{ textTransform: 'capitalize' }}>{hotel.hotelType}</p>

                  <p className="item-card-desc">{hotel.description}</p>

                  <div className="item-card-meta" style={{ marginBottom: '6px' }}>
                    <MapPin size={14} />
                    {hotel.location?.city || 'City'}, {hotel.location?.state || 'State'}
                  </div>
                  <div className="item-card-meta" style={{ marginBottom: '6px' }}>
                    <Mail size={14} />
                    <span style={{ wordBreak: 'break-all', fontSize: '13px' }}>{hotel.email || 'No email'}</span>
                  </div>
                  <div className="item-card-meta">
                    <IndianRupee size={14} />
                    {hotel.pricePerNight} / night
                  </div>

                  {hotel.amenities?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '10px 0' }}>
                      {hotel.amenities.slice(0, 4).map((item) => (
                        <span className="amenity-pill" key={item}>{item}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                    <button className="d-btn ghost sm" onClick={() => setSelectedHotel(hotel)}>
                      <Eye size={14} />
                      View
                    </button>
                    {!isApproved && (
                      <button className="d-btn success sm" onClick={() => approveHotel(hotel._id)}>
                        <CheckCircle size={14} />
                        Approve
                      </button>
                    )}
                    {!isRejected && (
                      <button className="d-btn warning sm" onClick={() => askRejectConfirm(hotel)}>
                        <XCircle size={14} />
                        Reject
                      </button>
                    )}
                    <button className="d-btn danger sm" onClick={() => askDeleteConfirm(hotel)}>
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Hotel detail modal */}
      
        {selectedHotel && (
          <div 
            className="modal-overlay"
          >
            <div 
              className="modal-box wide"
            >
              <div className="modal-header">
              <div>
                <p className="modal-eyebrow">Hotel Details</p>
                <h2 className="modal-title">{selectedHotel.hotelName}</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{selectedHotel.hotelType}</p>
              </div>
              <button className="modal-close" type="button" onClick={() => setSelectedHotel(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Images */}
            <div className="img-gallery">
              {selectedHotel.images?.length > 0 ? (
                selectedHotel.images.map((image, index) => (
                  <LazyImage key={image} src={image} alt={`${selectedHotel.hotelName} ${index + 1}`} />
                ))
              ) : (
                <LazyImage
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80"
                  alt={selectedHotel.hotelName}
                />
              )}
            </div>

            <div className="detail-grid">
              <DetailRow label="Hotel Name" value={selectedHotel.hotelName} />
              <DetailRow label="Hotel Type" value={selectedHotel.hotelType} />
              <DetailRow label="Email" value={selectedHotel.email} />
              <DetailRow label="Contact Number" value={selectedHotel.contactNumber} />
              <DetailRow label="Price Per Night" value={`Rs. ${selectedHotel.pricePerNight || 0}`} />
              <DetailRow label="Total Rooms" value={selectedHotel.totalRooms} />
              <DetailRow label="Available Rooms" value={selectedHotel.availableRooms} />
              <DetailRow label="Check In Time" value={selectedHotel.checkInTime} />
              <DetailRow label="Check Out Time" value={selectedHotel.checkOutTime} />
              <DetailRow label="Address" value={selectedHotel.location?.address} />
              <DetailRow label="City" value={selectedHotel.location?.city} />
              <DetailRow label="State" value={selectedHotel.location?.state} />
              <DetailRow label="Country" value={selectedHotel.location?.country} />
              <DetailRow label="Pincode" value={selectedHotel.location?.pincode} />
              <DetailRow label="Rating" value={selectedHotel.rating} />
              <DetailRow label="Reviews Count" value={selectedHotel.reviewsCount} />
              <DetailRow label="Featured" value={selectedHotel.isFeatured} />
              <DetailRow label="Active" value={selectedHotel.isActive} />
              <DetailRow label="Approval Status" value={selectedHotel.approvalStatus?.status ? 'Approved' : selectedHotel.approvalStatus?.message || 'Pending'} />
              <DetailRow label="Created At" value={selectedHotel.createdAt ? new Date(selectedHotel.createdAt).toLocaleString() : ''} />
            </div>

            <div className="detail-row" style={{ marginTop: '12px' }}>
              <p className="detail-row-label">Amenities</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {selectedHotel.amenities?.length > 0 ? (
                  selectedHotel.amenities.map((item) => (
                    <span className="amenity-pill" key={item}>{item}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Not added</span>
                )}
              </div>
            </div>

            <div className="detail-row" style={{ marginTop: '12px' }}>
              <p className="detail-row-label">Description</p>
              <p className="detail-row-value" style={{ whiteSpace: 'pre-wrap', marginTop: '4px' }}>{showValue(selectedHotel.description)}</p>
            </div>

            <div className="modal-footer">
              <button className="d-btn ghost" type="button" onClick={() => setSelectedHotel(null)}>
                Close
              </button>
            </div>
            </div>
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

export default ManageHotel
