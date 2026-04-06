import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../../api/axios'
import ErrorAlert from '../../components/ErrorAlert'
import { useTheme } from '../../context/ThemeContext'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const emailFromState = location.state?.email || ''
  const [email, setEmail]     = useState(emailFromState)
  const [digits, setDigits]   = useState(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const inputRefs = useRef([])

  useEffect(() => { inputRefs.current[0]?.focus() }, [])

  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]; next[index] = ''; setDigits(next)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft'  && index > 0) inputRefs.current[index - 1]?.focus()
      else if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = Array(6).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const otp = digits.join('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim())    return setError('Please enter your email.')
    if (otp.length < 6)   return setError('Please enter the complete 6-digit code.')
    setLoading(true)
    try {
      await api.post('/api/auth/verify-email', { email, otp })
      navigate('/login', { state: { message: 'Email verified! You can now sign in.' } })
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError(''); setSuccess('')
    if (!email.trim()) return setError('Please enter your email first.')
    setResending(true)
    try {
      await api.post(`/api/auth/resend-otp?email=${encodeURIComponent(email)}`)
      setSuccess('A new code has been sent to your inbox.')
      setDigits(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="auth-page">
      <button className="theme-toggle" onClick={toggleTheme}
        style={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>✉️</div>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent)' }}>ResumeAI</div>
        </div>

        <h1 className="auth-title">Check your inbox</h1>
        <p className="auth-subtitle">
          Enter the 6-digit code sent to{' '}
          <strong style={{ color: 'var(--text)' }}>{email || 'your email'}</strong>
        </p>

        <ErrorAlert message={error} onClose={() => setError('')} />
        {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>✅ {success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {!emailFromState && (
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com" disabled={loading} />
            </div>
          )}

          {/* 6-box OTP */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', margin: '1.75rem 0' }}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                disabled={loading}
                style={{
                  width: '48px', height: '56px',
                  textAlign: 'center',
                  fontSize: '1.5rem', fontWeight: 700,
                  background: 'var(--surface2)',
                  border: `2px solid ${digit ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  color: 'var(--text)', outline: 'none',
                  transition: 'border-color 0.15s',
                  caretColor: 'transparent',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = digit ? 'var(--accent)' : 'var(--border)'}
              />
            ))}
          </div>

          <button type="submit" className="btn btn-primary btn-full"
            disabled={loading || otp.length < 6}>
            {loading ? '⏳ Verifying…' : 'Verify Email →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button onClick={handleResend} disabled={resending}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}>
            {resending ? 'Resending…' : "Didn't receive a code? Resend"}
          </button>
        </div>

        <div className="auth-footer">
          <Link to="/login">← Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}