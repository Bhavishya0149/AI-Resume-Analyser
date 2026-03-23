import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import ErrorAlert from '../../components/ErrorAlert'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', requestedRole: 'USER' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const setRole = (role) => setForm(f => ({ ...f, requestedRole: role }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { name, email, password } = form
    if (!name || !email || !password) {
      setError('All fields are required.')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/auth/signup', form)
      navigate('/verify-email', { state: { email } })
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.response?.data || 'Signup failed.'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🧠</div>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent)' }}>ResumeAI</div>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Get started for free</p>

        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name" name="name" type="text"
              value={form.name} onChange={handleChange}
              placeholder="John Doe" required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              value={form.email} onChange={handleChange}
              placeholder="you@example.com" required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              value={form.password} onChange={handleChange}
              placeholder="Create a strong password" required
            />
          </div>

          {/* Role selection */}
          <div className="form-group">
            <label>I am signing up as a…</label>
            <div className="role-toggle">
              <div
                className={`role-option ${form.requestedRole === 'USER' ? 'active' : ''}`}
                onClick={() => setRole('USER')}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setRole('USER')}
              >
                👤 Job Seeker
              </div>
              <div
                className={`role-option ${form.requestedRole === 'RECRUITER' ? 'active' : ''}`}
                onClick={() => setRole('RECRUITER')}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setRole('RECRUITER')}
              >
                🏢 Recruiter
              </div>
            </div>
            {form.requestedRole === 'RECRUITER' && (
              <div className="alert alert-warn" style={{ marginTop: 0 }}>
                ⚠️ Recruiter accounts require admin verification before you can post public jobs.
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}