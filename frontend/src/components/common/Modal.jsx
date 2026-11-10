import { useEffect } from 'react'

export default function Modal({ title, onClose, busy = false, children }) {
  // Escape closes the modal (unless a request is in progress).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, busy])

  return (
    <div className="modal-backdrop" onClick={busy ? undefined : onClose}>
      <div className="modal modal-form" role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  )
}
