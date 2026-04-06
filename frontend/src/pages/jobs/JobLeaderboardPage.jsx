import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'

export default function JobLeaderboardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [entries, setEntries]   = useState([])
  const [job, setJob]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [removing, setRemoving] = useState(null)

  const isAdminOrCreator = job && (
    user?.roles?.includes('ADMIN') || job.createdBy === user?.id
  )

  const fetchData = async () => {
    try {
      const [jobRes, boardRes] = await Promise.all([
        api.get('/api/jobs/public'),
        api.get(`/api/jobs/${id}/leaderboard`),
      ])
      const found = jobRes.data.find(j => j.id === id)
      setJob(found || null)
      setEntries(boardRes.data)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load leaderboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const handleRemove = async (applicationId) => {
    if (!window.confirm('Remove this entry from the leaderboard?')) return
    setRemoving(applicationId)
    try {
      await api.delete(`/api/jobs/${id}/leaderboard/${applicationId}`)
      setEntries(prev => prev.filter(e => e.applicationId !== applicationId))
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to remove entry.')
    } finally {
      setRemoving(null)
    }
  }

  if (loading) return <LoadingSpinner />

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(`/jobs/${id}`)} className="btn btn-ghost btn-sm">
          ← Back to Job
        </button>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">🏆 <span>Leaderboard</span></h1>
          {job && (
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              {job.title}{job.organisationName ? ` · ${job.organisationName}` : ''}
            </p>
          )}
        </div>
        {isAdminOrCreator && (
          <Link to={`/jobs/${id}/edit`} className="btn btn-secondary btn-sm">✏️ Edit Job</Link>
        )}
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <h3>No applicants yet</h3>
          <p style={{ marginTop: '0.4rem' }}>Be the first to apply!</p>
          <Link to={`/jobs/${id}`} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
            Apply Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {entries.map((entry, i) => {
            const score = entry.qualificationScore || 0
            const scoreColor = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--accent)' : 'var(--danger)'
            const isOwnEntry = entry.userProfile?.id === user?.id

            return (
              <div key={entry.applicationId}
                style={{
                  background: isOwnEntry ? 'rgba(124,106,247,0.06)' : 'var(--surface)',
                  border: `1px solid ${isOwnEntry ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 14, padding: '1.25rem 1.5rem',
                  display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
                }}
              >
                {/* Rank */}
                <div style={{
                  width: 44, flexShrink: 0, textAlign: 'center',
                  fontSize: i < 3 ? '1.5rem' : '1rem',
                  fontWeight: 700,
                  color: i < 3 ? 'var(--accent)' : 'var(--muted)',
                }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </div>

                {/* Avatar + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 160 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--accent)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '1rem', overflow: 'hidden',
                  }}>
                    {entry.userProfile?.profilePictureUrl
                      ? <img src={entry.userProfile.profilePictureUrl} alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (entry.userProfile?.name?.[0]?.toUpperCase() || '?')
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {entry.userProfile?.name || 'Unknown'}
                      {isOwnEntry && <span style={{ fontSize: '0.72rem', color: 'var(--accent)', marginLeft: '0.4rem' }}>You</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      Applied {entry.appliedAt ? new Date(entry.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                    <span>Match Score</span>
                    <span style={{ fontWeight: 700, color: scoreColor }}>{score.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 7, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${score}%`, background: `linear-gradient(90deg, var(--accent), #a78bfa)`, transition: 'width 0.8s ease' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem' }}>
                    <MiniScore label="Skills" value={entry.skillMatchPercentage} />
                    <MiniScore label="Embedding" value={entry.embeddingSimilarity} />
                    <MiniScore label="TF-IDF" value={entry.tfidfSimilarity} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
                  {/* Resume link — visible to own entry or admin/creator */}
                  {entry.resumeUrl && (
                    <a href={entry.resumeUrl} target="_blank" rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm" title="View Resume">
                      📄 Resume
                    </a>
                  )}
                  {(isAdminOrCreator || isOwnEntry) && (
                    <button className="btn btn-danger btn-sm"
                      disabled={removing === entry.applicationId}
                      onClick={() => handleRemove(entry.applicationId)}
                      title="Remove entry">
                      {removing === entry.applicationId ? '…' : '✕'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MiniScore({ label, value }) {
  return (
    <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
      {label}: <strong style={{ color: 'var(--text)' }}>{(value || 0).toFixed(0)}%</strong>
    </span>
  )
}