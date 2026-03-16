export default function ErrorAlert({ message, onClose }) {
  if (!message) return null
  return (
    <div className="alert alert-error" role="alert">
      <span>⚠️</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1rem' }}>
          ✕
        </button>
      )}
    </div>
  )
}