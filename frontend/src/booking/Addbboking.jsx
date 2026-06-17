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

  // Seat selection states
  const [selectedSeats, setSelectedSeats] = useState([])
  const [bookedSeats, setBookedSeats] = useState([])
  const [seatLoading, setSeatLoading] = useState(false)

  useEffect(() => {
    if (initialType) setBookingType(initialType)
    if (initialId !== undefined) setSelectedId(initialId)
    if (initialCity) setSelectedToCity(initialCity)
  }, [initialType, initialId, initialCity])

  useEffect(() => {
    if (bookingType === 'bus' && selectedId && journeyDate) {
      setSeatLoading(true)
      axiosInstance.get(`/booking/booked-seats?busId=${selectedId}&date=${journeyDate}`)
        .then(res => {
          setBookedSeats(res.data.bookedSeats || [])
          setSelectedSeats([]) // Reset on changes
        })
        .catch(err => {
          console.error("Failed to load booked seats", err)
        })
        .finally(() => {
          setSeatLoading(false)
        })
    } else {
      setBookedSeats([])
      setSelectedSeats([])
    }
  }, [bookingType, selectedId, journeyDate])

  useEffect(() => {
    let ignore = false

    Promise.all([
      axiosInstance.get('/hotel/gethotel'),
      axiosInstance.get('/bus/get'),
    ])
      .then(([hotelRes, busRes]) => {
        if (ignore) return

        const approvedHotels = (hotelRes.data.hotels || []).filter(
          (hotel) => (hotel.approvalStatus?.status && hotel.availableRooms > 0) || hotel._id === initialId,
        )

        setHotels(approvedHotels)
        setBuses((busRes.data.buses || []).filter((bus) => bus.availableSeats > 0 || bus._id === initialId))
      })
      .catch((error) => {
        if (!ignore) {
          setMessage(error.response?.data?.message || 'Could not load hotels and buses')
        }
      })

    return () => {
      ignore = true
    }
  }, [initialId])

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
  const selectedItem = bookingType === 'hotel'
    ? hotels.find((item) => item._id === selectedId)
    : buses.find((item) => item._id === selectedId)
  const price = bookingType === 'hotel' ? selectedItem?.pricePerNight : selectedItem?.fare

  const getSeatPrice = (seatName) => {
    if (!selectedItem) return 0
    const isSleeper = seatName.startsWith('L') || seatName.startsWith('UL') || seatName.startsWith('UR')
    return isSleeper ? Math.round(selectedItem.fare * 1.8) : selectedItem.fare
  }

  const totalAmount = bookingType === 'hotel'
    ? Number(price || 0) * Number(totalSeats || 0)
    : selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0)

  const handleSeatClick = (seatId) => {
    setSelectedSeats(prev => {
      const isAlreadySelected = prev.includes(seatId)
      let next
      if (isAlreadySelected) {
        next = prev.filter(s => s !== seatId)
      } else {
        next = [...prev, seatId]
      }
      setTotalSeats(next.length || 1)
      return next
    })
  }

  const SteeringWheelIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v8M12 14v8M2 12h8M14 12h8" />
    </svg>
  )

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

    if (bookingType === 'bus' && selectedSeats.length === 0) {
      setMessage('Please select at least one seat')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const bookingData = {
        bookingType,
        journeyDate,
        totalSeats: bookingType === 'bus' ? selectedSeats.length : Number(totalSeats),
        specialRequest: specialRequest.trim(),
      }

      if (bookingType === 'hotel') {
        bookingData.hotel = selectedId
      } else {
        bookingData.bus = selectedId
        bookingData.seatNumbers = selectedSeats
      }

      const res = await axiosInstance.post(`${BOOKING_API}/addbooking`, bookingData)

      setMessage(res.data.message)
      setSelectedId('')
      setJourneyDate('')
      setTotalSeats(1)
      setSelectedSeats([])
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
          {bookingType === 'bus' ? (
            <input
              className="d-input"
              value={selectedSeats.length}
              disabled
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
          ) : (
            <input
              className="d-input"
              name="totalSeats"
              type="number"
              min="1"
              max={selectedItem?.availableRooms}
              value={totalSeats}
              onChange={(e) => setTotalSeats(e.target.value)}
              required
            />
          )}
        </div>

        {bookingType === 'bus' && (!selectedId || !journeyDate) && (
          <div className="span-2" style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4, color: 'var(--brand-from)' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Please select both a <strong>Bus</strong> and a <strong>Journey Date</strong> to view available seats</span>
            </div>
          </div>
        )}

        {bookingType === 'bus' && selectedId && journeyDate && (
          <div className="span-2" style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <label className="d-label" style={{ marginBottom: '16px', display: 'block', fontSize: '15px', fontWeight: '600' }}>
              Select Seats (Sleeper: ₹{Math.round((selectedItem?.fare || 0) * 1.8)}, Seater: ₹{selectedItem?.fare || 0})
            </label>
            
            {seatLoading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '50px 20px',
                color: 'var(--text-muted)'
              }}>
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                  @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                  }
                  .custom-spinner {
                    border: 3px solid rgba(59, 130, 246, 0.1);
                    border-top: 3px solid #3b82f6;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    animation: spin 0.85s linear infinite;
                    box-shadow: 0 0 12px rgba(59, 130, 246, 0.15);
                  }
                  .pulse-loading-text {
                    font-size: 13.5px;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                    animation: pulse 1.5s ease-in-out infinite;
                  }
                `}</style>
                <div className="custom-spinner"></div>
                <span className="pulse-loading-text">Fetching live seat availability...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Legend */}
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid var(--border-subtle)', borderRadius: '4px', background: 'transparent' }}></div>
                    <span>Available Seater</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '24px', border: '1px solid var(--border-subtle)', borderRadius: '4px', background: 'transparent' }}></div>
                    <span>Available Sleeper</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px', background: '#3b82f6', borderRadius: '4px' }}></div>
                    <span>Selected</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px', background: '#374151', borderRadius: '4px', opacity: 0.5 }}></div>
                    <span>Booked</span>
                  </div>
                </div>

                {/* Main Berths Wrapper */}
                <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  
                  {/* LOWER BERTH */}
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '20px',
                    width: '240px',
                    position: 'relative'
                  }}>
                    <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '13px', color: 'var(--text-heading)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
                      Lower Berth (28 Seats)
                    </div>
                    
                    {/* Driver/Steering Row */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px', paddingRight: '8px' }}>
                      <SteeringWheelIcon />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                      {/* Left Column: 6 Sleepers */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Array.from({ length: 6 }).map((_, i) => {
                          const seatId = `L${i + 1}`;
                          const isBooked = bookedSeats.includes(seatId);
                          const isSelected = selectedSeats.includes(seatId);
                          return (
                            <button
                              type="button"
                              key={seatId}
                              disabled={isBooked}
                              onClick={() => handleSeatClick(seatId)}
                              style={{
                                width: '40px',
                                height: '64px',
                                borderRadius: '6px',
                                border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                                background: isBooked ? 'rgba(55,65,81,0.4)' : isSelected ? 'rgba(59,130,246,0.15)' : 'transparent',
                                cursor: isBooked ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '4px 2px',
                                transition: 'all 0.15s',
                                color: isBooked ? 'var(--text-muted)' : 'var(--text-heading)'
                              }}
                            >
                              <span style={{ fontSize: '9px', opacity: 0.6 }}>{seatId}</span>
                              {isBooked ? (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4 }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                              ) : (
                                <span style={{ fontSize: '8px', fontWeight: '600' }}>₹{getSeatPrice(seatId)}</span>
                              )}
                              <div style={{ width: '12px', height: '3px', borderRadius: '1px', background: isSelected ? '#3b82f6' : 'var(--border-subtle)' }} />
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Columns: 11 rows of 2 seaters */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 38px)', gap: '6px', alignContent: 'start' }}>
                        {Array.from({ length: 11 }).map((_, rowIndex) => {
                          return Array.from({ length: 2 }).map((_, colIndex) => {
                            const seatNumberIndex = rowIndex * 2 + colIndex + 1;
                            const seatId = `S${seatNumberIndex}`;
                            const isBooked = bookedSeats.includes(seatId);
                            const isSelected = selectedSeats.includes(seatId);
                            return (
                              <button
                                type="button"
                                key={seatId}
                                disabled={isBooked}
                                onClick={() => handleSeatClick(seatId)}
                                style={{
                                  width: '38px',
                                  height: '34px',
                                  borderRadius: '4px',
                                  border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                                  background: isBooked ? 'rgba(55,65,81,0.4)' : isSelected ? 'rgba(59,130,246,0.15)' : 'transparent',
                                  cursor: isBooked ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '1px',
                                  transition: 'all 0.15s',
                                  color: isBooked ? 'var(--text-muted)' : 'var(--text-heading)'
                                }}
                              >
                                <span style={{ fontSize: '9px', opacity: 0.6 }}>{seatId}</span>
                                {isBooked ? (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4 }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                ) : (
                                  <span style={{ fontSize: '8px', fontWeight: '600' }}>₹{getSeatPrice(seatId)}</span>
                                )}
                              </button>
                            );
                          });
                        })}
                      </div>
                    </div>
                  </div>

                  {/* UPPER BERTH */}
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '20px',
                    width: '180px'
                  }}>
                    <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '13px', color: 'var(--text-heading)', marginBottom: '44px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
                      Upper Berth (18 Seats)
                    </div>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                      {/* Left Column: 6 Sleepers */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Array.from({ length: 6 }).map((_, i) => {
                          const seatId = `UL${i + 1}`;
                          const isBooked = bookedSeats.includes(seatId);
                          const isSelected = selectedSeats.includes(seatId);
                          return (
                            <button
                              type="button"
                              key={seatId}
                              disabled={isBooked}
                              onClick={() => handleSeatClick(seatId)}
                              style={{
                                width: '40px',
                                height: '64px',
                                borderRadius: '6px',
                                border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                                background: isBooked ? 'rgba(55,65,81,0.4)' : isSelected ? 'rgba(59,130,246,0.15)' : 'transparent',
                                cursor: isBooked ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '4px 2px',
                                transition: 'all 0.15s',
                                color: isBooked ? 'var(--text-muted)' : 'var(--text-heading)'
                              }}
                            >
                              <span style={{ fontSize: '9px', opacity: 0.6 }}>{seatId}</span>
                              {isBooked ? (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4 }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                              ) : (
                                <span style={{ fontSize: '8px', fontWeight: '600' }}>₹{getSeatPrice(seatId)}</span>
                              )}
                              <div style={{ width: '12px', height: '3px', borderRadius: '1px', background: isSelected ? '#3b82f6' : 'var(--border-subtle)' }} />
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Columns: 6 rows of 2 sleepers */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 40px)', gap: '8px', alignContent: 'start' }}>
                        {Array.from({ length: 6 }).map((_, rowIndex) => {
                          return Array.from({ length: 2 }).map((_, colIndex) => {
                            const seatNumberIndex = rowIndex * 2 + colIndex + 1;
                            const seatId = `UR${seatNumberIndex}`;
                            const isBooked = bookedSeats.includes(seatId);
                            const isSelected = selectedSeats.includes(seatId);
                            return (
                              <button
                                type="button"
                                key={seatId}
                                disabled={isBooked}
                                onClick={() => handleSeatClick(seatId)}
                                style={{
                                  width: '40px',
                                  height: '64px',
                                  borderRadius: '6px',
                                  border: isSelected ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                                  background: isBooked ? 'rgba(55,65,81,0.4)' : isSelected ? 'rgba(59,130,246,0.15)' : 'transparent',
                                  cursor: isBooked ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '4px 2px',
                                  transition: 'all 0.15s',
                                  color: isBooked ? 'var(--text-muted)' : 'var(--text-heading)'
                                }}
                              >
                                <span style={{ fontSize: '9px', opacity: 0.6 }}>{seatId}</span>
                                {isBooked ? (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4 }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                ) : (
                                  <span style={{ fontSize: '8px', fontWeight: '600' }}>₹{getSeatPrice(seatId)}</span>
                                )}
                                <div style={{ width: '12px', height: '3px', borderRadius: '1px', background: isSelected ? '#3b82f6' : 'var(--border-subtle)' }} />
                              </button>
                            );
                          });
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Selection Details */}
                {selectedSeats.length > 0 && (
                  <div style={{
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: 'var(--text-heading)'
                  }}>
                    <strong>Selected Seats:</strong> {selectedSeats.join(', ')} ({selectedSeats.length} seats)
                  </div>
                )}

              </div>
            )}
          </div>
        )}

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
