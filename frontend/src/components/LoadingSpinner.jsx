export default function LoadingSpinner({ text = '' }) {
  return (
    <div className="loading-page" style={{ flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner" />
      {text && <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{text}</p>}
    </div>
  )
}