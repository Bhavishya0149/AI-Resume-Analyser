import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../../api/axios'
import ErrorAlert from '../../components/ErrorAlert'

export default function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail]       = useState(location.state?.email || '')
  const [otp, setOtp]           = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown(c => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !otp) return setError('Email and OTP are required.')
    setLoading(true)
    try {
      await api.post('/api/auth/verify-email', { email, otp })
      setSuccess('Email verified! Redirecting to login…')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    if (!email) return setError('Please enter your email first.')
    try {
      await api.post(`/api/auth/resend-otp?email=${encodeURIComponent(email)}`)
      setSuccess('OTP resent! Check your inbox.')
      setCooldown(60)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || ''
      // Parse "Resend OTP available in X seconds"
      const match = msg.match(/(\d+)\s*seconds/)
      if (match) setCooldown(parseInt(match[1]))
      setError(msg || 'Failed to resend OTP.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>📧</div>
        </div>

        <h1 className="auth-title">Verify your email</h1>
        <p className="auth-subtitle">Enter the OTP sent to your email address</p>

        <ErrorAlert message={error} onClose={() => setError('')} />
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleVerify} noValidate>
          <div className="form-group">
            <label htmlFor="v-email">Email</label>
            <input
              id="v-email" type="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com" required
            />
          </div>

          <div className="form-group">
            <label htmlFor="otp">OTP Code</label>
            <input
              id="otp" type="text"
              value={otp} onChange={e => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={10}
              style={{ letterSpacing: '0.25em', fontSize: '1.2rem', textAlign: 'center' }}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            type="button"
            className="btn btn-ghost btn-full"
            onClick={handleResend}
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
          </button>
        </div>

        <div className="auth-footer">
          <Link to="/login">← Back to login</Link>
        </div>
      </div>
    </div>
  )
}