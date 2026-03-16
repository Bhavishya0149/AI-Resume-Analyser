import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import ErrorAlert from '../../components/ErrorAlert'

export default function LoginPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)

    try {

      const { data } = await api.post('/api/auth/login', {
        email,
        password
      })

      login(data)

      navigate('/dashboard')

    } catch (err) {

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Login failed.'
      )

    } finally {
      setLoading(false)
    }
  }


  const handleGoogleSuccess = async (credentialResponse) => {

    setError('')
    setLoading(true)

    try {

      const idToken = credentialResponse.credential

      if (!idToken) {
        throw new Error('Google authentication failed')
      }

      const { data } = await api.post('/api/auth/login', {
        googleIdToken: idToken
      })

      login(data)

      navigate('/dashboard')

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Google login failed.'
      )

    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="auth-page">

      <button
        className="theme-toggle"
        onClick={toggleTheme}
        style={{ position: 'fixed', top: '1rem', right: '1rem' }}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="auth-card">

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🧠</div>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent)' }}>
            ResumeAI
          </div>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} noValidate>

          <div className="form-group">

            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

          </div>

          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <Link to="/reset-password-request" style={{ fontSize: '0.85rem' }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

        </form>

        <div className="divider">or</div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed')}
            theme="outline"
            size="large"
          />

        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>

      </div>

    </div>
  )
}