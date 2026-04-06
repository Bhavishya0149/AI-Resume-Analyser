import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'

export default function JobDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [job, setJob]           = useState(null)
  const [resumes, setResumes]   = useState([])
  const [selectedResume, setSelectedResume] = useState('')
  const [loading, setLoading]   = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const isAdminOrCreator = job && (
    user?.roles?.includes('ADMIN') || job.createdBy === user?.id
  )

  useEffect(() => {
    Promise.all([
      api.get(`/api/jobs/public`),
      api.get('/api/resumes'),
    ]).then(([jobsRes, resumesRes]) => {
      const found = jobsRes.data.find(j => j.id === id)
      if (!found) navigate('/jobs')
      setJob(found)
      setResumes(resumesRes.data)
      if (resumesRes.data.length > 0) setSelectedResume(resumesRes.data[0].id)
    }).catch(() => setError('Failed to load job details.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    if (!selectedResume) return setError('Please select a resume to apply with.')
    setError(''); setSuccess('')
    setApplying(true)
    try {
      await api.post(`/api/jobs/${id}/apply?resumeId=${selectedResume}`)
      setSuccess('Application submitted! Check the leaderboard to see your ranking.')
    } catch (err) {
      setError('Failed to apply.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!job)    return null

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Back */}
      <button onClick={() => navigate('/jobs')}
        className="btn btn-ghost btn-sm" style={{ marginBottom: '1.25rem' }}>
        ← Back to Jobs
      </button>

      {/* Header card */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 60, height: 60, flexShrink: 0, borderRadius: 14,
            background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem',
          }}>💼</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{job.title}</h1>
            {job.organisationName && (
              <div style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '0.5rem' }}>
                🏢 {job.organisationName}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <StatusPill label={job.allowApplications ? '✅ Accepting Applications' : '🔒 Applications Closed'}
                color={job.allowApplications ? 'var(--success)' : 'var(--muted)'} />
              <StatusPill label={job.isActive ? '🟢 Active' : '⭕ Inactive'}
                color={job.isActive ? 'var(--success)' : 'var(--muted)'} />
            </div>
          </div>

          {isAdminOrCreator && (
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <Link to={`/jobs/${id}/edit`} className="btn btn-secondary btn-sm">✏️ Edit</Link>
              <Link to={`/jobs/${id}/leaderboard`} className="btn btn-ghost btn-sm">🏆 Leaderboard</Link>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {job.shortDescription && (
            <div className="card">
              <SectionLabel>About this Role</SectionLabel>
              <p style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: '0.95rem' }}>{job.shortDescription}</p>
            </div>
          )}

          <div className="card">
            <SectionLabel>Full Job Description</SectionLabel>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {job.descriptionText || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Contact info */}
          {(job.contactEmail || job.contactPhone) && (
            <div className="card">
              <SectionLabel>Contact</SectionLabel>
              {job.contactEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span>✉️</span>
                  <a href={`mailto:${job.contactEmail}`} style={{ color: 'var(--accent)' }}>{job.contactEmail}</a>
                </div>
              )}
              {job.contactPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <span>📞</span>
                  <a href={`tel:${job.contactPhone}`} style={{ color: 'var(--accent)' }}>{job.contactPhone}</a>
                </div>
              )}
            </div>
          )}

          {/* Apply card */}
          {job.allowApplications && (
            <div className="card">
              <SectionLabel>Apply for this Job</SectionLabel>

              <ErrorAlert message={error} onClose={() => setError('')} />
              {success && (
                <div className="alert alert-success" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                  ✅ {success}
                </div>
              )}

              {resumes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    You need to upload a resume first.
                  </p>
                  <Link to="/resumes" className="btn btn-primary btn-sm">Upload Resume</Link>
                </div>
              ) : (
                <>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>Select resume</label>
                    <select value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                      {resumes.map(r => (
                        <option key={r.id} value={r.id}>{r.fileName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Preview selected resume */}
                  {resumes.find(r => r.id === selectedResume)?.cloudinaryUrl && (
                    <a
                      href={resumes.find(r => r.id === selectedResume).cloudinaryUrl}
                      target="_blank" rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm btn-full"
                      style={{ marginBottom: '0.75rem', textDecoration: 'none', display: 'flex', justifyContent: 'center' }}
                    >
                      👁 Preview Resume
                    </a>
                  )}

                  <button className="btn btn-primary btn-full"
                    onClick={handleApply} disabled={applying}>
                    {applying ? '⏳ Submitting…' : '🚀 Submit Application'}
                  </button>
                </>
              )}

              <Link to={`/jobs/${id}/leaderboard`}
                style={{ display: 'block', textAlign: 'center', marginTop: '1rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
                🏆 View leaderboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: '0.75rem', paddingBottom: '0.5rem',
      borderBottom: '1px solid var(--border)',
    }}>{children}</div>
  )
}

function StatusPill({ label, color }) {
  return (
    <span style={{
      fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.7rem',
      borderRadius: 20, border: `1px solid ${color}`,
      color, background: `${color}18`,
    }}>{label}</span>
  )
}