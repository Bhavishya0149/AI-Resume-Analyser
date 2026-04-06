import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'

export default function JobListingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')

  const canPost = user?.roles?.includes('RECRUITER') || user?.roles?.includes('ADMIN')

  useEffect(() => {
    api.get('/api/jobs/public')
      .then(res => setJobs(res.data))
      .catch(() => setError('Failed to load job listings.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return jobs
    const q = search.toLowerCase()
    return jobs.filter(j =>
      j.title?.toLowerCase().includes(q) ||
      j.organisationName?.toLowerCase().includes(q) ||
      j.shortDescription?.toLowerCase().includes(q)
    )
  }, [jobs, search])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">💼 Job <span>Listings</span></h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            {jobs.length} active position{jobs.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {canPost && <Link to="/jobs/create" className="btn btn-primary">➕ Post a Job</Link>}
          <Link to="/jobs/my" className="btn btn-secondary">🗂 My Applications</Link>
        </div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: '1.75rem' }}>
        <span style={{
          position: 'absolute', left: '1rem', top: '50%',
          transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none'
        }}>🔍</span>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, company, or keywords…"
          style={{
            width: '100%', padding: '0.8rem 1rem 0.8rem 2.75rem',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, color: 'var(--text)', fontSize: '0.95rem', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            position: 'absolute', right: '0.85rem', top: '50%',
            transform: 'translateY(-50%)', background: 'none', border: 'none',
            color: 'var(--muted)', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem',
          }}>✕</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{search ? '🔍' : '💼'}</div>
          <h3>{search ? 'No matching jobs' : 'No jobs available'}</h3>
          <p style={{ marginTop: '0.4rem', fontSize: '0.875rem' }}>
            {search ? 'Try a different keyword.' : 'Check back later for new openings.'}
          </p>
          {search && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '1rem' }}
              onClick={() => setSearch('')}>Clear search</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(job => (
            <JobListingCard key={job.id} job={job} onView={() => navigate(`/jobs/${job.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function JobListingCard({ job, onView }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '1.5rem',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      cursor: 'pointer', width: '100%',
    }}
      onClick={onView}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,106,247,0.12)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>

        {/* Icon badge */}
        <div style={{
          width: 52, height: 52, flexShrink: 0, borderRadius: 12,
          background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
        }}>💼</div>

        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                {job.title}
              </h3>
              {job.organisationName && (
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>
                  🏢 {job.organisationName}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <Pill
                label={job.allowApplications ? '✅ Open' : '🔒 Closed'}
                color={job.allowApplications ? 'var(--success)' : 'var(--muted)'}
              />
            </div>
          </div>

          {/* Short description */}
          {job.shortDescription && (
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '0.75rem', maxWidth: '80ch' }}>
              {job.shortDescription}
            </p>
          )}

          {/* Footer row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {job.contactEmail && (
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                ✉️ {job.contactEmail}
              </span>
            )}
            {job.contactPhone && (
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                📞 {job.contactPhone}
              </span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600 }}>
              View Details →
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Pill({ label, color }) {
  return (
    <span style={{
      fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem',
      borderRadius: 20, border: `1px solid ${color}`,
      color, background: `${color}18`, whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}