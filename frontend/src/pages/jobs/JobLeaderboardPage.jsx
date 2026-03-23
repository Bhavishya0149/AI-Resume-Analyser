import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import { useAuth } from '../../context/AuthContext'

export default function JobLeaderboardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const [entries, setEntries]   = useState([])
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [removing, setRemoving] = useState(null)

  const fetchData = async () => {
    try {
      const [lbRes, jobsRes] = await Promise.allSettled([
        api.get(`/api/jobs/${id}/leaderboard`),
        api.get('/api/jobs/public'),
      ])
      if (lbRes.status   === 'fulfilled') setEntries(lbRes.value.data)
      if (jobsRes.status === 'fulfilled') {
        const found = jobsRes.value.data.find(j => j.id === id)
        if (found) setJobTitle(found.title)
      }
    } catch {
      setError('Failed to load leaderboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const handleRemove = async (applicationId, e) => {
    e.stopPropagation()
    if (!confirm('Remove this entry from the leaderboard?')) return
    setRemoving(applicationId)
    try {
      await api.delete(`/api/jobs/${id}/leaderboard/${applicationId}`)
      setEntries(prev => prev.filter(x => x.id !== applicationId))
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to remove entry.')
    } finally {
      setRemoving(null)
    }
  }

  if (loading) return <LoadingSpinner text="Loading leaderboard…" />

  const medalColors = ['#fbbf24', '#9ca3af', '#b45309']

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/jobs/${id}`)}>
          ← Back to Job
        </button>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">🏆 <span>Leaderboard</span></h1>
          {jobTitle && (
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              {jobTitle}
            </p>
          )}
        </div>
        <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          {entries.length} {entries.length === 1 ? 'applicant' : 'applicants'}
        </span>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <h3>No applicants yet</h3>
          <p>Be the first to apply!</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Applicant</th>
                  <th>Resume</th>
                  <th>Score</th>
                  <th>Skill Match</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const pct      = ((entry.qualificationScore || 0) * 100).toFixed(1)
                  const skillPct = ((entry.skillMatchPercentage || 0)).toFixed(1)
                  const isOwn    = entry.userId === user?.id
                  const canRemove = isAdmin() || isOwn

                  return (
                    <tr key={entry.id || i} style={isOwn ? { background: 'rgba(124,106,247,0.06)' } : {}}>
                      <td>
                        {i < 3 ? (
                          <span style={{ fontSize: '1.2rem' }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <span style={{ fontWeight: 700, color: 'var(--muted)' }}>#{i + 1}</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: 28, height: 28,
                            borderRadius: '50%',
                            background: i < 3 ? `${medalColors[i]}22` : 'var(--surface2)',
                            border: `2px solid ${i < 3 ? medalColors[i] : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 700,
                            color: i < 3 ? medalColors[i] : 'var(--muted)',
                            flexShrink: 0,
                          }}>
                            {entry.userId?.substring(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--muted)' }}>
                            {entry.userId?.substring(0, 12)}…
                            {isOwn && (
                              <span style={{
                                marginLeft: '0.4rem',
                                background: 'rgba(124,106,247,0.15)',
                                color: 'var(--accent)',
                                borderRadius: 20,
                                padding: '0.1rem 0.4rem',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                              }}>
                                you
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {entry.resumeId?.substring(0, 10)}…
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          color: parseFloat(pct) >= 70
                            ? 'var(--success)'
                            : parseFloat(pct) >= 50
                              ? 'var(--accent)'
                              : 'var(--danger)',
                        }}>
                          {pct}%
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{
                            width: 60, height: 6,
                            background: 'var(--surface2)',
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(parseFloat(skillPct), 100)}%`,
                              background: 'linear-gradient(90deg, var(--accent), #a78bfa)',
                              borderRadius: 3,
                            }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            {skillPct}%
                          </span>
                        </div>
                      </td>
                      <td>
                        {canRemove && (
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={removing === entry.id}
                            onClick={(e) => handleRemove(entry.id, e)}
                            title="Remove from leaderboard"
                          >
                            {removing === entry.id ? '…' : '🗑'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}