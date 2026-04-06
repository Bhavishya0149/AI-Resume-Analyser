import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'

export default function MyJobsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const canPost = user?.roles?.includes('RECRUITER') || user?.roles?.includes('ADMIN')

  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [deleting, setDeleting] = useState(null)

  const fetchJobs = () => {
    setLoading(true)
    api.get('/api/jobs/my')
      .then(res => setJobs(res.data))
      .catch(() => setError('Failed to load your jobs.'))
      .finally(() => setLoading(false))
  }

  useEffect(fetchJobs, [])

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job posting and all its applications?')) return
    setDeleting(jobId)
    try {
      await api.delete(`/api/jobs/${jobId}`)
      setJobs(prev => prev.filter(j => j.id !== jobId))
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete job.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🗂 My <span>Job Postings</span></h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            {jobs.length} posting{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canPost && <Link to="/jobs/create" className="btn btn-primary">➕ Post a Job</Link>}
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗂</div>
          <h3>No job postings yet</h3>
          {canPost
            ? <><p style={{ marginTop: '0.4rem' }}>Create your first job listing to get started.</p>
                <Link to="/jobs/create" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                  ➕ Post a Job
                </Link></>
            : <p style={{ marginTop: '0.4rem' }}>You need recruiter access to post jobs.</p>
          }
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map(job => (
            <div key={job.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '1.25rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{job.title}</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {job.organisationName && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>🏢 {job.organisationName}</span>
                  )}
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    {job.isPublic ? '🌐 Public' : '🔒 Private'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: job.allowApplications ? 'var(--success)' : 'var(--muted)' }}>
                    {job.allowApplications ? '✅ Accepting' : '🔒 Closed'}
                  </span>
                  {!job.isActive && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>⭕ Inactive</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flexShrink: 0 }}>
                <Link to={`/jobs/${job.id}`}       className="btn btn-secondary btn-sm">👁 View</Link>
                <Link to={`/jobs/${job.id}/edit`}   className="btn btn-ghost btn-sm">✏️ Edit</Link>
                <Link to={`/jobs/${job.id}/leaderboard`} className="btn btn-ghost btn-sm">🏆 Board</Link>
                <button className="btn btn-danger btn-sm"
                  disabled={deleting === job.id}
                  onClick={() => handleDelete(job.id)}>
                  {deleting === job.id ? '…' : '🗑'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}