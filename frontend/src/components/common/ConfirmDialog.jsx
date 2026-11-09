export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  busyLabel = 'Working...',
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="modal-backdrop" onClick={busy ? undefined : onCancel}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="muted">{message}</p>
        <div className="btn-row">
          <button className="btn btn-danger btn-sm" onClick={onConfirm} disabled={busy}>
            {busy ? busyLabel : confirmLabel}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
