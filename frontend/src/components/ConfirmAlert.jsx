import { AlertTriangle } from 'lucide-react'

// A simple confirm dialog using framer-motion
// Usage: <ConfirmAlert message="..." onConfirm={fn} onCancel={fn} />
const ConfirmAlert = ({ message, onConfirm, onCancel, confirmText = 'Yes, Proceed', cancelText = 'Cancel', danger = true }) => {
  return (
    
      <div className="modal-overlay" 
        onClick={onCancel}
        style={{ zIndex: 9999 }}
      >
        <div className="modal-box"
          style={{ maxWidth: '420px', padding: '32px', textAlign: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <AlertTriangle size={28} color={danger ? '#f87171' : '#fbbf24'} />
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '10px' }}>
            Are you sure?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
            {message}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="d-btn ghost" 
              onClick={onCancel} 
              style={{ minWidth: '100px' }}
            >
              {cancelText}
            </button>
            <button className={danger ? 'd-btn danger' : 'd-btn brand'}
              onClick={onConfirm}
              style={{ minWidth: '120px' }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    
  )
}

export default ConfirmAlert
