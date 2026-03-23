import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'

function getGrade(score) {
  const p = (score || 0) * 100
  if (p >= 85) return { label: 'A+', color: '#3ecf8e' }
  if (p >= 75) return { label: 'A',  color: '#3ecf8e' }
  if (p >= 65) return { label: 'B',  color: '#7c6af7' }
  if (p >= 50) return { label: 'C',  color: '#f59e0b' }
  return        { label: 'D',  color: '#e05555' }
}

export default function HistoryPage() {
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/api/analysis/history')
      setHistory(data)
    } catch {
      setError('Failed to load history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHistory() }, [])

  const handleDeleteEntry = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this analysis entry?')) return
    setDeleting(id)
    try {
      await api.delete(`/api/analysis/history/${id}`)
      setHistory(h => h.filter(x => x.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed.')
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Delete ALL analysis history? This cannot be undone.')) return
    try {
      await api.delete('/api/analysis/history')
      setHistory([])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to clear history.')
    }
  }

  if (loading) return <LoadingSpinner text="Loading history…" />

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Analysis <span>History</span></h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {history.length} {history.length === 1 ? 'entry' : 'entries'}
          </span>
          {history.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={handleDeleteAll}>
              🗑 Clear All
            </button>
          )}
        </div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No analysis history yet</h3>
          <p>
            <Link to="/analyze">Run your first analysis</Link> to see results here.
          </p>
        </div>
      ) : (
        <div>
          {history.map((item) => {
            const grade = getGrade(item.qualificationScore)
            const pct   = Math.round((item.qualificationScore || 0) * 100)
            return (
              <div
                key={item.id}
                className="history-item"
                onClick={() => navigate(`/history/${item.id}`, { state: { entry: item } })}
              >
                {/* Score badge */}
                <div
                  className="history-item-score-badge"
                  style={{ color: grade.color, borderColor: grade.color, background: `${grade.color}18` }}
                >
                  <div style={{ textAlign: 'center', lineHeight: 1 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{pct}%</div>
                    <div style={{ fontSize: '0.7rem' }}>{grade.label}</div>
                  </div>
                </div>

                {/* Meta */}
                <div className="history-item-meta">
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    Analysis #{history.length - history.indexOf(item)}
                  </div>
                  <div className="history-item-date">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                  {(item.matchedSkills?.length > 0 || item.missingSkills?.length > 0) && (
                    <div className="history-item-desc" style={{ marginTop: '0.25rem' }}>
                      {item.matchedSkills?.length || 0} matched · {item.missingSkills?.length || 0} missing skills
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={deleting === item.id}
                    onClick={(e) => handleDeleteEntry(e, item.id)}
                  >
                    {deleting === item.id ? '…' : '🗑'}
                  </button>
                  <span className="history-item-arrow">→</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}