import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import ErrorAlert from '../../components/ErrorAlert'

export default function ResetPasswordPage() {
  const [searchParams]          = useSearchParams()
  const token                   = searchParams.get('token') || ''
  const [newPassword, setPass]  = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!token) return setError('Invalid or missing reset token.')
    if (!newPassword) return setError('Please enter a new password.')
    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', { token, newPassword })
      navigate('/login', { state: { message: 'Password reset! Please log in.' } })
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🔒</div>
        </div>

        <h1 className="auth-title">New password</h1>
        <p className="auth-subtitle">Choose a strong password</p>

        <ErrorAlert message={error} onClose={() => setError('')} />

        {!token && (
          <div className="alert alert-error">No reset token found. Please request a new reset link.</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="new-pass">New Password</label>
            <input
              id="new-pass" type="password"
              value={newPassword} onChange={e => setPass(e.target.value)}
              placeholder="Enter new password" disabled={!token}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading || !token}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">← Back to login</Link>
        </div>
      </div>
    </div>
  )
}