import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'

const BOOKING_API = '/booking'

const AddBooking = ({ onCreated, initialType = 'hotel', initialId = '', initialCity = '', isModal = false, onClose }) => {
  const [bookingType, setBookingType] = useState(initialType)
  const [selectedId, setSelectedId] = useState(initialId)
  const [journeyDate, setJourneyDate] = useState('')
  const [totalSeats, setTotalSeats] = useState(1)
  const [specialRequest, setSpecialRequest] = useState('')
  const [hotels, setHotels] = useState([])
  const [buses, setBuses] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFromCity, setSelectedFromCity] = useState('')
  const [selectedToCity, setSelectedToCity] = useState(initialCity || '')
  const { token } = useAuth()

  useEffect(() => {
    if (initialType) setBookingType(initialType)
    if (initialId !== undefined) setSelectedId(initialId)
    if (initialCity) setSelectedToCity(initialCity)
  }, [initialType, initialId, initialCity])

  useEffect(() => {
    let ignore = false

    Promise.all([
      axiosInstance.get('/hotel/gethotel'),
      axiosInstance.get('/bus/get'),
    ])
      .then(([hotelRes, busRes]) => {
        if (ignore) return

        const approvedHotels = (hotelRes.data.hotels || []).filter(
          (hotel) => hotel.approvalStatus?.status && hotel.availableRooms > 0,
        )

        setHotels(approvedHotels)
        setBuses((busRes.data.buses || []).filter((bus) => bus.availableSeats > 0))
      })
      .catch((error) => {
        if (!ignore) {
          setMessage(error.response?.data?.message || 'Could not load hotels and buses')
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const filteredHotels = selectedToCity 
    ? hotels.filter(h => h.location?.city === selectedToCity) 
    : hotels

  const filteredBuses = buses.filter(b => {
    if (selectedFromCity && b.fromCityID?.city !== selectedFromCity) return false
    if (selectedToCity && b.toCityID?.city !== selectedToCity) return false
    return true
  })

  const uniqueFromCities = Array.from(new Set(buses.filter(b => !selectedToCity || b.toCityID?.city === selectedToCity).map(b => b.fromCityID?.city).filter(Boolean)))
  const uniqueToCities = Array.from(new Set([...buses.map(b => b.toCityID?.city), ...hotels.map(h => h.location?.city)].filter(Boolean)))

  const options = bookingType === 'hotel' ? filteredHotels : filteredBuses
  const selectedItem = options.find((item) => item._id === selectedId)
  const price = bookingType === 'hotel' ? selectedItem?.pricePerNight : selectedItem?.fare
  const totalAmount = Number(price || 0) * Number(totalSeats || 0)

  const changeType = (e) => {
    setBookingType(e.target.value)
    setSelectedId('')
    setTotalSeats(1)
    setMessage('')
    setSelectedFromCity('')
    if (!initialCity) setSelectedToCity('')
  }

  const createBooking = async (e) => {
    e.preventDefault()

    if (!token) {
      setMessage('Please login first')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const bookingData = {
        bookingType,
        journeyDate,
        totalSeats: Number(totalSeats),
        specialRequest: specialRequest.trim(),
      }

      if (bookingType === 'hotel') {
        bookingData.hotel = selectedId
      } else {
        bookingData.bus = selectedId
      }

      const res = await axiosInstance.post(`${BOOKING_API}/addbooking`, bookingData)

      setMessage(res.data.message)
      setSelectedId('')
      setJourneyDate('')
      setTotalSeats(1)
      setSpecialRequest('')

      if (onCreated) {
        setTimeout(() => {
          onCreated(res.data.booking)
        }, 1500)
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  const minimumDate = new Date().toISOString().split('T')[0]

  return (
    <form className={isModal ? "modal-box" : "panel"} onSubmit={createBooking} style={isModal ? { maxWidth: '600px', padding: '28px 32px' } : {}}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="panel-title-group">
          <span className="panel-eyebrow">New Booking</span>
          <h2 className="panel-title">Book Your Trip</h2>
          <p className="panel-desc">Choose a hotel or bus and confirm your booking.</p>
        </div>
        {isModal && onClose && (
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="d-form cols-2">
        <div className="d-field">
          <label className="d-label">Booking Type</label>
          {initialId ? (
            <input className="d-input" value={bookingType === 'hotel' ? 'Hotel' : 'Bus'} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
          ) : (
            <select className="d-select" name="bookingType" value={bookingType} onChange={changeType}>
              <option value="hotel">Hotel</option>
              <option value="bus">Bus</option>
            </select>
          )}
        </div>

        <div className="d-field">
          <label className="d-label">Destination (To City)</label>
          {initialCity ? (
            <input className="d-input" value={initialCity} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
          ) : (
            <select className="d-select" value={selectedToCity} onChange={(e) => { setSelectedToCity(e.target.value); setSelectedId(''); }}>
              <option value="">All Cities</option>
              {uniqueToCities.map(city => (
                <option value={city} key={city}>{city}</option>
              ))}
            </select>
          )}
        </div>

        {bookingType === 'bus' && (
          <div className="d-field">
            <label className="d-label">Origin (From City)</label>
            {initialId ? (
              <input className="d-input" value={selectedItem ? selectedItem.fromCityID?.city || 'Unknown' : 'Loading...'} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            ) : (
              <select className="d-select" value={selectedFromCity} onChange={(e) => { setSelectedFromCity(e.target.value); setSelectedId(''); }}>
                <option value="">Any</option>
                {uniqueFromCities.map(city => (
                  <option value={city} key={city}>{city}</option>
                ))}
              </select>
            )}
          </div>
        )}



        <div className="d-field">
          <label className="d-label">{bookingType === 'hotel' ? 'Select Hotel' : 'Select Bus'}</label>
          {initialId ? (
            <input className="d-input" value={selectedItem ? (bookingType === 'hotel' ? selectedItem.hotelName : `${selectedItem.busName} (${selectedItem.busNumber})`) : 'Selected'} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
          ) : (
            <select
              className="d-select"
              name={bookingType === 'hotel' ? 'hotel' : 'bus'}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
            >
              <option value="">Select one</option>
              {options.map((item) => (
                <option value={item._id} key={item._id}>
                  {bookingType === 'hotel'
                    ? `${item.hotelName} - Rs. ${item.pricePerNight} (${item.availableRooms} rooms left)`
                    : `${item.busName} (${item.busNumber}) - ${item.fromCityID?.city || 'Unknown'} to ${item.toCityID?.city || 'Unknown'} - Rs. ${item.fare} (${item.availableSeats} seats left)`}
                </option>
              ))}
            </select>
          )}
          {selectedItem && (
            <div style={{ fontSize: '12px', color: 'var(--success-text)', marginTop: '8px', fontWeight: '500' }}>
              ✓ {bookingType === 'hotel' ? `${selectedItem.availableRooms} Rooms` : `${selectedItem.availableSeats} Seats`} currently available
            </div>
          )}
        </div>

        <div className="d-field">
          <label className="d-label">{bookingType === 'hotel' ? 'Check-in Date' : 'Journey Date'}</label>
          <input
            className="d-input"
            name="journeyDate"
            type="date"
            min={minimumDate}
            value={journeyDate}
            onChange={(e) => setJourneyDate(e.target.value)}
            required
          />
        </div>

        <div className="d-field">
          <label className="d-label">{bookingType === 'hotel' ? 'Rooms' : 'Seats'}</label>
          <input
            className="d-input"
            name="totalSeats"
            type="number"
            min="1"
            max={bookingType === 'hotel' ? selectedItem?.availableRooms : selectedItem?.availableSeats}
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
            required
          />
        </div>

        <div className="d-field span-2">
          <label className="d-label">Special Request</label>
          <textarea
            className="d-textarea"
            name="specialRequest"
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
            placeholder="Optional request"
          />
        </div>

        <div className="booking-total span-2">
          <span>Total Amount</span>
          <strong>Rs. {totalAmount}</strong>
        </div>

        <button className="d-btn brand span-2 booking-submit" disabled={loading}>
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>

        {message && <div className="d-message info span-2">{message}</div>}
      </div>
    </form>
  )
}

export default AddBooking
