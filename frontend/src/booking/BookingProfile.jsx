import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import ConfirmAlert from '../components/ConfirmAlert'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'

const API_URL = '/booking'

const BookingProfile = ({
  refreshKey = 0,
  type = '',
  adminMode = false,
  title = 'My Bookings',
}) => {
  const { token } = useAuth()
  const savedToken = token
  const [bookings, setBookings] = useState([])
  const [message, setMessage] = useState(savedToken ? '' : 'Please login first')
  const [loading, setLoading] = useState(Boolean(savedToken))

  // Search & Filter
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Confirm alert
  const [confirmAlert, setConfirmAlert] = useState(null)

  const getBookings = async () => {
    if (!token) {
      setMessage('Please login first')
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const url = type ? `${API_URL}/getbooking?type=${type}` : `${API_URL}/getbooking`
      const res = await axiosInstance.get(url)
      setBookings(res.data.bookings || [])
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    if (!token) return undefined

    const url = type ? `${API_URL}/getbooking?type=${type}` : `${API_URL}/getbooking`
    axiosInstance.get(url)
      .then((res) => {
        if (!ignore) {
          setBookings(res.data.bookings || [])
          setLoading(false)
        }
      })
      .catch((error) => {
        if (!ignore) {
          setMessage(error.response?.data?.message || 'Could not load bookings')
          setLoading(false)
        }
      })

    return () => { ignore = true }
  }, [refreshKey, type])

  const updateBooking = async (booking, bookingStatus, paymentStatus) => {
    try {
      const endpoint = bookingStatus === 'Cancelled' ? 'cancelbooking' : 'confirmbooking'
      const res = await axiosInstance.put(
        `${API_URL}/${endpoint}/${booking._id}`,
        { cancellationReason: bookingStatus === 'Cancelled' ? 'Cancelled by user' : '' },
      )
      setBookings(bookings.map((item) =>
        item._id === booking._id ? res.data.booking : item
      ))
      setMessage(res.data.message)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update booking')
    }
  }

  const askCancelConfirm = (booking) => {
    setConfirmAlert({
      message: `Cancel your booking for "${getName(booking)}"? This cannot be undone.`,
      onConfirm: () => {
        setConfirmAlert(null)
        updateBooking(booking, 'Cancelled', booking.paymentStatus)
      }
    })
  }

  const askAdminConfirm = (booking, status) => {
    const isCancel = status === 'Cancelled'
    setConfirmAlert({
      message: isCancel
        ? `Cancel booking for "${getName(booking)}"?`
        : `Confirm and mark payment as Paid for "${getName(booking)}"?`,
      danger: isCancel,
      onConfirm: () => {
        setConfirmAlert(null)
        updateBooking(booking, status, status === 'Confirmed' ? 'Paid' : booking.paymentStatus)
      }
    })
  }

  const getName = (booking) => {
    if (booking.bookingType === 'hotel') return booking.hotel?.hotelName || 'Hotel'
    return booking.bus?.busName || 'Bus'
  }

  // Filter & Sort
  const filteredBookings = bookings
    .filter(b => {
      const q = search.toLowerCase()
      const name = getName(b).toLowerCase()
      const customerName = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.toLowerCase()
      const matchSearch = !q || name.includes(q) || customerName.includes(q)
      const matchStatus = statusFilter === 'all' || b.bookingStatus === statusFilter
      const matchType = typeFilter === 'all' || b.bookingType === typeFilter
      return matchSearch && matchStatus && matchType
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'amount-high') return (b.amount || 0) - (a.amount || 0)
      if (sortBy === 'amount-low') return (a.amount || 0) - (b.amount || 0)
      return 0
    })

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
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-eyebrow">Bookings</span>
          <h2 className="panel-title">{title}</h2>
          <p className="panel-desc">Total: {bookings.length} | Showing: {filteredBookings.length}</p>
        </div>
        <button className="d-btn ghost" type="button" onClick={getBookings}>Refresh</button>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px', marginBottom: '4px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="d-input"
            placeholder={adminMode ? 'Search by hotel/bus or customer...' : 'Search bookings...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <select className="d-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ minWidth: '140px' }}>
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>
        {!type && (
          <select className="d-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ minWidth: '120px' }}>
            <option value="all">All Types</option>
            <option value="hotel">Hotel</option>
            <option value="bus">Bus</option>
          </select>
        )}
        <select className="d-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ minWidth: '150px' }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount-high">Amount: High to Low</option>
          <option value="amount-low">Amount: Low to High</option>
        </select>
      </div>

      {message && <div className="d-message info" style={{ marginTop: '12px' }}>{message}</div>}

      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '60px 20px',
          color: 'var(--text-muted)'
        }}>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .booking-profile-spinner {
              border: 3px solid rgba(59, 130, 246, 0.1);
              border-top: 3px solid #3b82f6;
              border-radius: 50%;
              width: 36px;
              height: 36px;
              animation: spin 0.85s linear infinite;
              box-shadow: 0 0 12px rgba(59, 130, 246, 0.15);
            }
          `}</style>
          <div className="booking-profile-spinner"></div>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Loading your bookings...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No bookings found</p>
          <p className="empty-state-desc">{search || statusFilter !== 'all' ? 'Try changing filters.' : 'New bookings will appear here.'}</p>
        </div>
      ) : (
        <div className="booking-list" initial="hidden" animate="show">
          {filteredBookings.map((booking) => (
            <div className="booking-card card-animated" key={booking._id}>
              <div >
                <span className="booking-type">{booking.bookingType}</span>
                <h3>{getName(booking)}</h3>
                {adminMode && (
                  <p>
                    Customer: {booking.user?.firstName} {booking.user?.lastName}
                    {' '}({booking.user?.email})
                  </p>
                )}
                <p><strong>Journey Date:</strong> {new Date(booking.journeyDate).toLocaleDateString()}</p>
                <p><strong>Booked On:</strong> {new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}</p>
                <p><strong>{booking.bookingType === 'hotel' ? 'Rooms' : 'Seats'}:</strong> {booking.totalSeats}{booking.bookingType === 'bus' && booking.seatNumbers && booking.seatNumbers.length > 0 && ` (${booking.seatNumbers.join(', ')})`}</p>
                <p><strong>Amount:</strong> Rs. {booking.amount}</p>
                {booking.specialRequest && (
                  <p style={{ fontStyle: 'italic', fontSize: '13px', marginTop: '6px', color: 'var(--text-muted)' }}>
                    <strong>Special Request:</strong> "{booking.specialRequest}"
                  </p>
                )}
                {booking.cancellationReason && (
                  <p style={{ color: 'var(--error-text)', fontSize: '13px', marginTop: '6px' }}>
                    <strong>Reason for Cancellation:</strong> {booking.cancellationReason}
                  </p>
                )}
                {booking.transactionId && (
                  <p style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <strong>Transaction ID:</strong> {booking.transactionId}
                  </p>
                )}
              </div>

              <div className="booking-card-side">
                <span className={`status-badge ${booking.bookingStatus.toLowerCase()}`}>
                  {booking.bookingStatus}
                </span>
                <span className="booking-payment">Payment: {booking.paymentStatus}</span>

                {adminMode && booking.bookingStatus === 'Pending' ? (
                  <div className="booking-actions">
                    <button className="d-btn brand sm"
                      type="button"
                      onClick={() => askAdminConfirm(booking, 'Confirmed')}
                    >
                      Confirm
                    </button>
                    <button className="d-btn danger sm"
                      type="button"
                      onClick={() => askAdminConfirm(booking, 'Cancelled')}
                    >
                      Cancel
                    </button>
                  </div>
                ) : !adminMode && booking.bookingStatus === 'Pending' ? (
                  <button className="d-btn danger sm" type="button" onClick={() => askCancelConfirm(booking)}>
                    Cancel Booking
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Alert */}
      {confirmAlert && (
        <ConfirmAlert
          message={confirmAlert.message}
          danger={confirmAlert.danger !== false}
          onConfirm={confirmAlert.onConfirm}
          onCancel={() => setConfirmAlert(null)}
        />
      )}
    </div>
  )
}

export default BookingProfile
