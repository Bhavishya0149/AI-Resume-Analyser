import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'



export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()



  const [step, setStep]           = useState('email')
  const [email, setEmail]         = useState('')
  const [otp, setOtp]             = useState('')



  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [info, setInfo]           = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)



  // ── Step 1: Send OTP ──────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) return setError('Please enter your email.')



    setLoading(true)
    try {
      await api.post('/api/auth/send-otp', { email: email.trim() })
      setInfo(`OTP sent to ${email}. Check your inbox.`)
      setStep('otp')
      startCooldown(60)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }



  // ── Step 2: Verify OTP ────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!otp.trim()) return setError('Please enter the OTP.')



    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/verify-otp', {
        email: email.trim(),
        otp: otp.trim(),
      })
      login(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP.')
    } finally {
      setLoading(false)
    }
  }



  // ── Resend OTP ────────────────────────────────────────
  const handleResend = async () => {
    setError('')
    setLoading(true)
    try {
      await api.post(`/api/auth/resend-otp?email=${encodeURIComponent(email)}`)
      setInfo('OTP resent successfully.')
      startCooldown(60)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend OTP.')
    } finally {
      setLoading(false)
    }
  }



  const startCooldown = (seconds) => {
    setResendCooldown(seconds)
    const iv = setInterval(() => {
      setResendCooldown(s => {
        if (s <= 1) { clearInterval(iv); return 0 }
        return s - 1
      })
    }, 1000)
  }



  // ── Google Login ──────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', {
        googleIdToken: credentialResponse.credential,
      })
      login(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Google login failed.')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="auth-page">
      <div className="auth-card">



        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠</div>
          <h1 className="auth-title">
            {step === 'email' ? 'Welcome to ResumeAI' : 'Check your inbox'}
          </h1>
          <p className="auth-subtitle">
            {step === 'email'
              ? 'Enter your email to sign in or create an account.'
              : `We sent a one-time code to ${email}`}
          </p>
        </div>



        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}
        {info && !error && (
          <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
            ℹ️ {info}
          </div>
        )}



        {/* ── Step 1: Email ── */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                autoFocus
              />
            </div>



            <button
              className="btn btn-primary btn-full"
              type="submit"
              disabled={loading}
            >
              {loading ? '⏳ Sending…' : '✉️ Send OTP'}
            </button>



            <div className="divider">or</div>


            <div style={{ position: 'relative', width: '100%', marginTop: '0.75rem' }}>
              {/* Visible styled button — purely decorative */}
              <button
                type="button"
                className="btn btn-google btn-full"
                disabled={loading}
                style={{ pointerEvents: 'none' }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>


              {/* GoogleLogin sits on top, fully transparent — intercepts the click */}
              <div style={{
                position: 'absolute', inset: 0,
                opacity: 0,
                overflow: 'hidden',
                cursor: 'pointer',
              }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in was cancelled or failed.')}
                  width="500"
                  size="large"
                />
              </div>
            </div>



            <p className="auth-footer">
              New here? Just enter your email — we'll create your account automatically.
            </p>
          </form>
        )}



        {/* ── Step 2: OTP ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} noValidate>
            <div className="form-group">
              <label htmlFor="otp-0">One-time code</label>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
                marginTop: '0.25rem',
              }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i] || ''}
                    disabled={loading}
                    autoFocus={i === 0}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '')
                      if (!val) return
                      const next = otp.split('')
                      next[i] = val[val.length - 1]
                      setOtp(next.join(''))
                      if (i < 5) {
                        document.getElementById(`otp-${i + 1}`)?.focus()
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace') {
                        if (otp[i]) {
                          const next = otp.split('')
                          next[i] = ''
                          setOtp(next.join(''))
                        } else if (i > 0) {
                          document.getElementById(`otp-${i - 1}`)?.focus()
                          const next = otp.split('')
                          next[i - 1] = ''
                          setOtp(next.join(''))
                        }
                      } else if (e.key === 'ArrowLeft' && i > 0) {
                        document.getElementById(`otp-${i - 1}`)?.focus()
                      } else if (e.key === 'ArrowRight' && i < 5) {
                        document.getElementById(`otp-${i + 1}`)?.focus()
                      }
                    }}
                    onPaste={e => {
                      e.preventDefault()
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                      const filled = pasted.padEnd(6, ' ').slice(0, 6).split('').map((c, idx) =>
                        idx < pasted.length ? c : ''
                      ).join('')
                      setOtp(filled)
                      const focusIdx = Math.min(pasted.length, 5)
                      document.getElementById(`otp-${focusIdx}`)?.focus()
                    }}
                    style={{
                      width: '2.75rem',
                      height: '3.25rem',
                      textAlign: 'center',
                      fontSize: '1.4rem',
                      fontWeight: '600',
                      letterSpacing: 0,
                      borderRadius: '0.5rem',
                      border: '1.5px solid var(--color-border, #d4d1ca)',
                      background: 'var(--color-surface, #fff)',
                      color: 'var(--color-text, #28251d)',
                      outline: 'none',
                      transition: 'border-color 180ms, box-shadow 180ms',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--color-primary, #01696f)'
                      e.target.style.boxShadow = '0 0 0 3px var(--color-primary-highlight, #cedcd8)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'var(--color-border, #d4d1ca)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              type="submit"
              disabled={loading || otp.replace(/\s/g, '').length < 6}
              style={{ marginTop: '1.25rem' }}
            >
              {loading ? '⏳ Verifying…' : '🔓 Verify & Sign In'}
            </button>



            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
            }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => { setStep('email'); setOtp(''); setError(''); setInfo('') }}
                disabled={loading}
              >
                ← Change email
              </button>



              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResend}
                disabled={loading || resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : '🔁 Resend OTP'}
              </button>
            </div>
          </form>
        )}



      </div>
    </div>
  )
}