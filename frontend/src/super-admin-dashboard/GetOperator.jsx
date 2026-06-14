import React, { useState, useEffect } from 'react'
import { Bus, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../customhooks/AuthContext'
import axiosInstance from '../utils/axiosInstance'

const GetOperator = () => {
  const [operators, setOperators] = useState([])
  const [message, setMessage] = useState('')
  const { token } = useAuth()

  const fetchOperators = async () => {
    try {
      const res = await axiosInstance.get('/operator/get')
      setOperators(res.data.operators || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchOperators()
  }, [])

  const handleApprove = async (id, isApproved) => {
    try {
      const endpoint = isApproved ? 'approveOperator' : 'rejectOperator'
      await axiosInstance.put(`/operator/${endpoint}/${id}`, {})
      setMessage(`Operator ${isApproved ? 'approved' : 'unapproved'} successfully`)
      fetchOperators()
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update approval status')
    }
  }

  return (
    <div className="panel" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Bus size={24} /> Bus Operators Management
      </h2>

      {message && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
          {message}
        </div>
      )}

      {operators.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {operators.map(op => (
            <div key={op._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-subtle)', borderRadius: '12px', background: 'var(--bg-panel)' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 'bold' }}>{op.agencyName}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Contact: {op.contactPerson} ({op.businessPhone})</p>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Email: {op.businessEmail}</p>
                <span style={{ display: 'inline-block', marginTop: '8px', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: op.isApproved ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: op.isApproved ? '#10b981' : '#f59e0b' }}>
                  {op.isApproved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
              <div>
                {op.isApproved ? (
                  <button onClick={() => handleApprove(op._id, false)} className="btn-primary" style={{ background: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}>
                    <XCircle size={16} /> Revoke Access
                  </button>
                ) : (
                  <button onClick={() => handleApprove(op._id, true)} className="btn-primary" style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}>
                    <CheckCircle size={16} /> Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>No operators registered yet.</p>
      )}
    </div>
  )
}

export default GetOperator