import { useEffect, useState } from 'react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'

export default function AdminPage() {
  const [panel, setPanel]       = useState(null)   // { jobs: [], recruiters: [] }
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [quickId, setQuickId]   = useState('')

  const fetchPanel = async () => {
    try {
      const { data } = await api.get('/api/admin/panel')
      setPanel(data)
    } catch {
      setError('Failed to load admin panel data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPanel() }, [])

  const act = async (label, fn) => {
    setError('')
    setSuccess('')
    try {
      await fn()
      setSuccess(`${label} — done!`)
      await fetchPanel()   // refresh panel after every action
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || `${label} failed.`)
    }
  }

  const verifyRecruiter = (id) =>
    act('Verify recruiter', () => api.patch(`/api/admin/users/${id}/verify-recruiter`))

  const revokeRecruiter = (id) =>
    act('Revoke recruiter', () => api.patch(`/api/admin/users/${id}/revoke-recruiter`))

  const deactivateJob = (id) =>
    act('Deactivate job', () => api.patch(`/api/admin/jobs/${id}/deactivate`))

  if (loading) return <LoadingSpinner text="Loading admin panel…" />

  const jobs       = panel?.jobs       || []
  const recruiters = panel?.recruiters || []

  const activeJobs    = jobs.filter(j => j.isActive)
  const inactiveJobs  = jobs.filter(j => !j.isActive)
  const verifiedRec   = recruiters.filter(r => r.recruiterVerified)
  const unverifiedRec = recruiters.filter(r => !r.recruiterVerified)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🛡 <span>Admin</span> Panel</h1>
        <button className="btn btn-secondary btn-sm" onClick={fetchPanel}>
          🔄 Refresh
        </button>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          ✅ {success}
        </div>
      )}

      {/* Stats summary */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value">{jobs.length}</div>
          <div className="stat-label">Total Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{activeJobs.length}</div>
          <div className="stat-label">Active Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{recruiters.length}</div>
          <div className="stat-label">Recruiters</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: unverifiedRec.length > 0 ? 'var(--warn)' : 'var(--success)' }}>
            {unverifiedRec.length}
          </div>
          <div className="stat-label">Pending Verification</div>
        </div>
      </div>

      {/* ── Recruiter Management ──────────────────────── */}
      <div className="admin-section">
        <div className="admin-section-title">👥 Recruiter Management</div>

        {/* Pending verification first */}
        {unverifiedRec.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              fontSize: '0.78rem', fontWeight: 700, color: 'var(--warn)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '0.5rem',
            }}>
              ⏳ Pending Verification ({unverifiedRec.length})
            </div>
            {unverifiedRec.map(r => (
              <RecruiterRow
                key={r.id}
                recruiter={r}
                onVerify={verifyRecruiter}
                onRevoke={revokeRecruiter}
                highlight
              />
            ))}
          </div>
        )}

        {verifiedRec.length > 0 && (
          <div>
            <div style={{
              fontSize: '0.78rem', fontWeight: 700, color: 'var(--success)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '0.5rem',
            }}>
              ✔ Verified ({verifiedRec.length})
            </div>
            {verifiedRec.map(r => (
              <RecruiterRow
                key={r.id}
                recruiter={r}
                onVerify={verifyRecruiter}
                onRevoke={revokeRecruiter}
              />
            ))}
          </div>
        )}

        {recruiters.length === 0 && (
          <div className="card">
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No recruiter accounts found.</p>
          </div>
        )}
      </div>

      {/* ── Quick Action by ID ────────────────────────── */}
      <div className="card" style={{ marginBottom: '2rem', maxWidth: 500 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
          ⚡ Quick Action by User ID
        </h3>
        <div className="form-group">
          <label htmlFor="quick-uid">User ID</label>
          <input
            id="quick-uid"
            type="text"
            value={quickId}
            onChange={e => setQuickId(e.target.value)}
            placeholder="Paste user ID here"
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => quickId && verifyRecruiter(quickId)}
            disabled={!quickId}
          >
            ✔ Verify Recruiter
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => quickId && revokeRecruiter(quickId)}
            disabled={!quickId}
          >
            ✖ Revoke Recruiter
          </button>
        </div>
      </div>

      {/* ── Job Management ───────────────────────────── */}
      <div className="admin-section">
        <div className="admin-section-title">💼 Job Management</div>

        {jobs.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No jobs found.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Visibility</th>
                    <th>Status</th>
                    <th>Applications</th>
                    <th>Posted By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j.id}>
                      <td style={{ fontWeight: 600 }}>{j.title}</td>
                      <td>
                        <StatusPill label={j.isPublic ? 'Public' : 'Private'} color={j.isPublic ? 'var(--accent)' : 'var(--muted)'} />
                      </td>
                      <td>
                        <StatusPill
                          label={j.isActive ? 'Active' : 'Inactive'}
                          color={j.isActive ? 'var(--success)' : 'var(--danger)'}
                        />
                      </td>
                      <td>
                        <StatusPill
                          label={j.allowApplications ? 'Open' : 'Closed'}
                          color={j.allowApplications ? 'var(--success)' : 'var(--muted)'}
                        />
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {j.createdBy?.substring(0, 10)}…
                      </td>
                      <td>
                        {j.isActive && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deactivateJob(j.id)}
                          >
                            Deactivate
                          </button>
                        )}
                        {!j.isActive && (
                          <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Helper sub-components ────────────────────────────── */

function StatusPill({ label, color }) {
  return (
    <span style={{
      padding: '0.2rem 0.55rem',
      borderRadius: 20,
      fontSize: '0.72rem',
      fontWeight: 700,
      color,
      background: `${color}18`,
      border: `1px solid ${color}44`,
    }}>
      {label}
    </span>
  )
}

function RecruiterRow({ recruiter: r, onVerify, onRevoke, highlight }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.85rem 1.1rem',
      background: highlight ? 'rgba(245,158,11,0.06)' : 'var(--surface)',
      border: `1px solid ${highlight ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
      borderRadius: 10,
      marginBottom: '0.5rem',
      flexWrap: 'wrap',
    }}>
      <div style={{
        width: 36, height: 36,
        borderRadius: '50%',
        background: r.recruiterVerified ? 'rgba(62,207,142,0.15)' : 'rgba(245,158,11,0.15)',
        border: `2px solid ${r.recruiterVerified ? 'var(--success)' : 'var(--warn)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '0.85rem',
        color: r.recruiterVerified ? 'var(--success)' : 'var(--warn)',
        flexShrink: 0,
      }}>
        {r.name?.substring(0, 1).toUpperCase() || '?'}
      </div>
      <div style={{ flex: 1, minWidth: 150 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.name}</div>
        <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{r.email}</div>
      </div>
      <StatusPill
        label={r.recruiterVerified ? '✔ Verified' : '⏳ Unverified'}
        color={r.recruiterVerified ? 'var(--success)' : 'var(--warn)'}
      />
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {!r.recruiterVerified && (
          <button className="btn btn-primary btn-sm" onClick={() => onVerify(r.id)}>
            Verify
          </button>
        )}
        {r.recruiterVerified && (
          <button className="btn btn-danger btn-sm" onClick={() => onRevoke(r.id)}>
            Revoke
          </button>
        )}
      </div>
    </div>
  )
}