import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import api from '../../api/axios'
import ErrorAlert from '../../components/ErrorAlert'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function SignupPage() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [requestedRole, setRole]      = useState('USER')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim())                       return setError('Full name is required.')
    if (!email.trim())                      return setError('Email is required.')
    if (!password || password.length < 6)   return setError('Password must be at least 6 characters.')
    setLoading(true)
    try {
      await api.post('/api/auth/signup', { name, email, password, requestedRole })
      // Only navigate AFTER server confirms signup
      navigate('/verify-email', { state: { email } })
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Signup failed.')
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
      navigate('/dashboard', { replace: true })
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start analyzing resumes in minutes</p>

        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" type="text" value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              autoComplete="name" required disabled={loading} />
          </div>

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
              placeholder="Min. 6 characters"
              autoComplete="new-password" required disabled={loading} />
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem' }}>
              I want to…
            </label>
            <div className="role-toggle">
              <button type="button"
                className={`role-option ${requestedRole === 'USER' ? 'active' : ''}`}
                onClick={() => setRole('USER')}>
                🎯 Find Jobs
              </button>
              <button type="button"
                className={`role-option ${requestedRole === 'RECRUITER' ? 'active' : ''}`}
                onClick={() => setRole('RECRUITER')}>
                💼 Post Jobs
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? '⏳ Creating account…' : 'Create Account →'}
          </button>
        </form>

        <div className="divider">or continue with</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed')} theme="outline" size="large" />
        </div>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}