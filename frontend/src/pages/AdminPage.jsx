import { useEffect, useState } from 'react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'

export default function AdminPage() {
  const [users, setUsers]   = useState([])
  const [jobs, setJobs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, jobsRes] = await Promise.allSettled([
          api.get('/api/users'),        // If admin user-list endpoint exists
          api.get('/api/jobs/public'),
        ])
        if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data)
        if (jobsRes.status === 'fulfilled')  setJobs(jobsRes.value.data)
      } catch {
        setError('Failed to load admin data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const act = async (label, fn) => {
    setError('')
    setSuccess('')
    try {
      await fn()
      setSuccess(`${label} — done!`)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || `${label} failed.`)
    }
  }

  const verifyRecruiter  = (id) => act('Verify recruiter',  () => api.patch(`/api/admin/users/${id}/verify-recruiter`))
  const revokeRecruiter  = (id) => act('Revoke recruiter',  () => api.patch(`/api/admin/users/${id}/revoke-recruiter`))
  const deactivateJob    = (id) => act('Deactivate job',    () => api.patch(`/api/admin/jobs/${id}/deactivate`))

  if (loading) return <LoadingSpinner text="Loading admin panel…" />

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🛡 <span>Admin</span> Panel</h1>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>✅ {success}</div>
      )}

      {/* ── User Management ─────────────────────────── */}
      <div className="admin-section">
        <div className="admin-section-title">👥 User Management</div>

        {users.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              No user list endpoint available, or no users found.
              Use the quick-action form below to target a user by ID.
            </p>
          </div>
        ) : (
          <div className="table-wrapper card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td style={{ fontSize: '0.82rem' }}>{u.email}</td>
                    <td>
                      {u.roles?.join(', ')}
                    </td>
                    <td>
                      {u.recruiterVerified
                        ? <span style={{ color: 'var(--success)' }}>✔ Yes</span>
                        : <span style={{ color: 'var(--muted)' }}>No</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => verifyRecruiter(u.id)}
                        >
                          Verify
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => revokeRecruiter(u.id)}
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick Action by User ID ──────────────────── */}
      <QuickUserAction
        onVerify={verifyRecruiter}
        onRevoke={revokeRecruiter}
      />

      {/* ── Job Management ───────────────────────────── */}
      <div className="admin-section" style={{ marginTop: '2rem' }}>
        <div className="admin-section-title">💼 Job Management</div>

        {jobs.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No active jobs found.</p>
          </div>
        ) : (
          <div className="table-wrapper card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Job ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j.id}>
                    <td>{j.title}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {j.id}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deactivateJob(j.id)}
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Inline sub-component for quick ID-based actions ── */
function QuickUserAction({ onVerify, onRevoke }) {
  const [userId, setUserId] = useState('')

  return (
    <div className="card" style={{ marginTop: '1rem', maxWidth: 480 }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
        Quick Action by User ID
      </h3>
      <div className="form-group">
        <label htmlFor="quick-uid">User ID</label>
        <input
          id="quick-uid"
          type="text"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="Paste user ID here"
        />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => userId && onVerify(userId)}
          disabled={!userId}
        >
          ✔ Verify Recruiter
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => userId && onRevoke(userId)}
          disabled={!userId}
        >
          ✖ Revoke Recruiter
        </button>
      </div>
    </div>
  )
}