import { Building2, IndianRupee, MapPin, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'

const API_URL = '/hotel'
const LOCATION_API_URL = '/location'

const RegisterHotel = () => {
  const [formData, setFormData] = useState({
    hotelName: '',
    hotelType: 'hotel',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    contactNumber: '',
    email: '',
    pricePerNight: '',
    totalRooms: '',
    availableRooms: '',
    amenities: '',
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
  })
  const [images, setImages] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLocationChange = (e) => {
    const locationId = e.target.value
    const location = locations.find((item) => item._id === locationId)
    setSelectedLocation(locationId)
    if (location) {
      setFormData({
        ...formData,
        city: location.city,
        state: location.state,
        country: location.country,
      })
    }
  }

  const addHotel = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const hotelData = new FormData()
      Object.keys(formData).forEach((key) => hotelData.append(key, formData[key]))
      images.forEach((image) => hotelData.append('images', image))

      const res = await axiosInstance.post(`${API_URL}/addhotel`, hotelData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setMessage(res.data.message)
      setFormData({
        hotelName: '',
        hotelType: 'hotel',
        description: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        contactNumber: '',
        email: '',
        pricePerNight: '',
        totalRooms: '',
        availableRooms: '',
        amenities: '',
        checkInTime: '12:00 PM',
        checkOutTime: '11:00 AM',
      })
      setImages([])
      setSelectedLocation('')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Hotel add failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    axiosInstance.get(`${LOCATION_API_URL}/get`)
      .then((res) => {
        if (!ignore) {
          setLocations(res.data.locations || [])
        }
      })
      .catch((error) => {
        if (!ignore) {
          setMessage(error.response?.data?.message || 'Location load failed')
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="admin-page">
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px 64px' }}
      >

        {/* Page header */}
        <div className="panel" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div >
              <p className="panel-eyebrow">Hotel Partner</p>
              <h1 className="panel-title" style={{ fontSize: '28px' }}>Register Your Hotel</h1>
              <p className="panel-desc">No login needed. After approval you will get login password on email.</p>
            </div>
            <Link className="d-btn ghost" to="/login">
              ← Back to Login
            </Link>
          </div>
        </div>

        {/* Form */}
        <form className="panel" onSubmit={addHotel}>
          <div className="d-form cols-2">

            {/* Hotel Name */}
            <div className="d-field span-2">
              <label className="d-label">Hotel Name</label>
              <div className="d-input-wrapper">
                <span className="d-input-icon"><Building2 size={16} /></span>
                <input
                  className="d-input with-icon"
                  name="hotelName"
                  value={formData.hotelName}
                  onChange={handleChange}
                  placeholder="Taj Lake View"
                  required
                />
              </div>
            </div>

            {/* Hotel Type */}
            <div className="d-field">
              <label className="d-label">Hotel Type</label>
              <select className="d-select" name="hotelType" value={formData.hotelType} onChange={handleChange}>
                <option value="hotel">Hotel</option>
                <option value="resort">Resort</option>
                <option value="villa">Villa</option>
              </select>
            </div>

            {/* Contact */}
            <div className="d-field">
              <label className="d-label">Contact Number</label>
              <div className="d-input-wrapper">
                <span className="d-input-icon"><Phone size={16} /></span>
                <input
                  className="d-input with-icon"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="9876543210"
                />
              </div>
            </div>

            {/* Email */}
            <div className="d-field">
              <label className="d-label">Email</label>
              <input
                className="d-input"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hotel@gmail.com"
              />
            </div>

            {/* Price */}
            <div className="d-field">
              <label className="d-label">Price Per Night</label>
              <div className="d-input-wrapper">
                <span className="d-input-icon"><IndianRupee size={16} /></span>
                <input
                  className="d-input with-icon"
                  type="number"
                  name="pricePerNight"
                  value={formData.pricePerNight}
                  onChange={handleChange}
                  placeholder="2500"
                />
              </div>
            </div>

            {/* Total Rooms */}
            <div className="d-field">
              <label className="d-label">Total Rooms</label>
              <input
                className="d-input"
                type="number"
                name="totalRooms"
                value={formData.totalRooms}
                onChange={handleChange}
                placeholder="40"
              />
            </div>

            {/* Available Rooms */}
            <div className="d-field">
              <label className="d-label">Available Rooms</label>
              <input
                className="d-input"
                type="number"
                name="availableRooms"
                value={formData.availableRooms}
                onChange={handleChange}
                placeholder="25"
              />
            </div>

            {/* Address */}
            <div className="d-field span-2">
              <label className="d-label">Address</label>
              <div className="d-input-wrapper">
                <span className="d-input-icon"><MapPin size={16} /></span>
                <input
                  className="d-input with-icon"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Near city palace"
                />
              </div>
            </div>

            {/* Location select */}
            <div className="d-field span-2">
              <label className="d-label">Location</label>
              <select className="d-select" value={selectedLocation} onChange={handleLocationChange}>
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option value={location._id} key={location._id}>
                    {location.city}, {location.state}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-filled city/state/country/pincode */}
            <div className="d-field">
              <label className="d-label">City</label>
              <input className="d-input" name="city" value={formData.city} onChange={handleChange} placeholder="City" readOnly />
            </div>
            <div className="d-field">
              <label className="d-label">State</label>
              <input className="d-input" name="state" value={formData.state} onChange={handleChange} placeholder="State" readOnly />
            </div>
            <div className="d-field">
              <label className="d-label">Country</label>
              <input className="d-input" name="country" value={formData.country} onChange={handleChange} placeholder="Country" readOnly />
            </div>
            <div className="d-field">
              <label className="d-label">Pincode</label>
              <input className="d-input" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" />
            </div>

            {/* Check in/out */}
            <div className="d-field">
              <label className="d-label">Check In Time</label>
              <input className="d-input" name="checkInTime" value={formData.checkInTime} onChange={handleChange} />
            </div>
            <div className="d-field">
              <label className="d-label">Check Out Time</label>
              <input className="d-input" name="checkOutTime" value={formData.checkOutTime} onChange={handleChange} />
            </div>

            {/* Amenities */}
            <div className="d-field span-2">
              <label className="d-label">Amenities</label>
              <input
                className="d-input"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                placeholder="wifi, pool, parking"
              />
            </div>

            {/* Images */}
            <div className="d-field span-2">
              <label className="d-label">Upload Images</label>
              <input
                className="d-file"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImages(Array.from(e.target.files))}
              />
            </div>

            {/* Description */}
            <div className="d-field span-2">
              <label className="d-label">Description</label>
              <textarea
                className="d-textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write short hotel description"
              />
            </div>

            {/* Submit */}
            <div className="span-2">
              <button className="d-btn brand" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
                {loading ? 'Saving…' : 'Add Hotel'}
              </button>
            </div>

            {message && (
              <div className="d-message info span-2">{message}</div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterHotel
