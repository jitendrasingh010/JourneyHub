import React, { useState, useEffect } from 'react'
import { PlusCircle, Edit3, Trash2, Eye, X } from 'lucide-react'
import LazyImage from '../components/LazyImage'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'

const GetOperatorBuses = ({ operatorData, onAddBus, onEditBus }) => {
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBus, setSelectedBus] = useState(null)

  const { token } = useAuth()

  const fetchBuses = async () => {
    try {
      const res = await axiosInstance.get('/bus/get')
      
      let allBuses = res.data.buses || []
      
      if (operatorData?._id) {
        allBuses = allBuses.filter(b => b.operatorName === operatorData._id || (b.operatorName && b.operatorName._id === operatorData._id))
      }
      
      setBuses(allBuses)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBuses()
  }, [operatorData])

  const handleDelete = async (busId) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await axiosInstance.delete(`/bus/delete/${busId}`)
        fetchBuses()
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete bus')
      }
    }
  }

  if (loading) return <div style={{ padding: '24px' }}>Loading buses...</div>

  return (
    <div className="panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-heading)' }}>My Fleet</h2>
        
        <button 
          onClick={onAddBus}
          className="d-btn brand"
          style={{ width: 'max-content' }}
        >
          <PlusCircle size={18} /> Add New Bus
        </button>
      </div>

      {buses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {buses.map(bus => (
            <div key={bus._id} style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-base)' }}>
              <div style={{ height: '160px', width: '100%' }}>
                {bus.images && bus.images.length > 0 ? (
                  <LazyImage src={bus.images[0]} alt={bus.busName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    {bus.busName}
                  </div>
                )}
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 'bold' }}>{bus.busName}</h3>
                <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--text-muted)' }}>{bus.busNumber} • {bus.busType}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span>{bus.fromCityID?.city || 'Unknown'} → {bus.toCityID?.city || 'Unknown'}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--brand-from)' }}>₹{bus.fare}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setSelectedBus(bus)} style={{ background: 'none', border: 'none', color: 'var(--brand-from)', cursor: 'pointer', padding: '4px' }} title="View Bus Details">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => onEditBus(bus)} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', padding: '4px' }} title="Edit Bus">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(bus._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete Bus">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-base)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No buses added yet.</p>
        </div>
      )}

      {selectedBus && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-box" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">{selectedBus.busType}</p>
                <h2 className="modal-title">{selectedBus.busName} ({selectedBus.busNumber})</h2>
              </div>
              <button className="modal-close" onClick={() => setSelectedBus(null)}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ height: '200px', width: '100%', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
                {selectedBus.images && selectedBus.images.length > 0 ? (
                  <LazyImage src={selectedBus.images[0]} alt={selectedBus.busName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    No Image Available
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px' }}>Route</p>
                  <p style={{ fontWeight: '500', margin: 0 }}>{selectedBus.fromCityID?.city} → {selectedBus.toCityID?.city}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px' }}>Fare</p>
                  <p style={{ fontWeight: 'bold', margin: 0, color: 'var(--brand-from)' }}>₹{selectedBus.fare}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px' }}>Total Seats / Available</p>
                  <p style={{ fontWeight: '500', margin: 0 }}>{selectedBus.totalSeats} / {selectedBus.availableSeats}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px' }}>Duration</p>
                  <p style={{ fontWeight: '500', margin: 0 }}>{selectedBus.duration || 'Not specified'}</p>
                </div>
              </div>

              {selectedBus.amenities && selectedBus.amenities.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Amenities</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedBus.amenities.map((amenity, idx) => (
                      <span key={idx} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: '100px', fontSize: '12px' }}>
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Boarding Points</h4>
                  {selectedBus.boardingPoints && selectedBus.boardingPoints.length > 0 ? (
                    <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px' }}>
                      {selectedBus.boardingPoints.map((point, idx) => (
                        <li key={idx}>{point.name}</li>
                      ))}
                    </ul>
                  ) : <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>None specified</p>}
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Dropping Points</h4>
                  {selectedBus.droppingPoints && selectedBus.droppingPoints.length > 0 ? (
                    <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px' }}>
                      {selectedBus.droppingPoints.map((point, idx) => (
                        <li key={idx}>{point.name}</li>
                      ))}
                    </ul>
                  ) : <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>None specified</p>}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="d-btn brand" onClick={() => setSelectedBus(null)} style={{ width: '100%', justifyContent: 'center' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GetOperatorBuses