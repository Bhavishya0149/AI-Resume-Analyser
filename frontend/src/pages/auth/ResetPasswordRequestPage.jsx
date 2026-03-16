import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import ErrorAlert from '../../components/ErrorAlert'

export default function ResetPasswordRequestPage() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email) return setError('Please enter your email.')
    setLoading(true)
    try {
      await api.post(`/api/auth/request-password-reset?email=${encodeURIComponent(email)}`)
      setSent(true)
    } catch {
      // Show generic success regardless (per spec)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🔑</div>
        </div>

        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">We'll send a reset link to your email</p>

        <ErrorAlert message={error} onClose={() => setError('')} />

        {sent ? (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            ✅ If that email exists, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="rp-email">Email Address</label>
              <input
                id="rp-email" type="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">← Back to login</Link>
        </div>
      </div>
    </div>
  )
}