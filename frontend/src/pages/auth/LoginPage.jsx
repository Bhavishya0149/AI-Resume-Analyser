import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import api from '../../api/axios'
import ErrorAlert from '../../components/ErrorAlert'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'
  const successMsg = location.state?.message || ''

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim())  return setError('Email is required.')
    if (!password)      return setError('Password is required.')
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      login(data)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Login failed.'
      if (err.response?.status === 403 && msg.toLowerCase().includes('verif')) {
        navigate('/verify-email', { state: { email } })
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', { googleIdToken: credentialResponse.credential })
      login(data)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Google sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <button className="theme-toggle" onClick={toggleTheme}
        style={{ position: 'fixed', top: '1rem', right: '1rem' }} aria-label="Toggle theme">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🧠</div>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent)' }}>ResumeAI</div>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>✅ {successMsg}</div>}
        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <div className="form-group">
            <label htmlFor="email">Work email</label>
            <input id="email" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@company.com"
              autoComplete="email" required disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password" required disabled={loading} />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
            <Link to="/reset-password-request" style={{ fontSize: '0.85rem' }}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? '⏳ Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div className="divider">or continue with</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed')} theme="outline" size="large" />
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  )
}