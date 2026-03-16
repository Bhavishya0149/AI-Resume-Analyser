import { useEffect, useState } from 'react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import AnalysisResult from '../components/AnalysisResult'
import ScoreBar from '../components/ScoreBar'

export default function HistoryPage() {
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/api/analysis/history')
      .then(res => setHistory(res.data))
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Loading history…" />

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Analysis <span>History</span></h1>
        <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{history.length} entries</span>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No analysis history yet</h3>
          <p>Run an analysis to see results here.</p>
        </div>
      ) : (
        history.map((item, i) => (
          <div
            key={i}
            className="history-item"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div className="history-item-header">
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>
                  Analysis #{history.length - i}
                </div>
                <div className="history-item-date">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="history-item-score">
                  {((item.qualificationScore || 0) * 100).toFixed(1)}%
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                  {expanded === i ? '▲ Collapse' : '▼ Details'}
                </div>
              </div>
            </div>

            {expanded === i && (
              <div className="history-detail">
                <ScoreBar label="Qualification Score"  value={item.qualificationScore} />
                <ScoreBar label="TF-IDF Similarity"    value={item.tfidfSimilarity} />
                <ScoreBar label="Embedding Similarity" value={item.embeddingSimilarity} />
                <ScoreBar label="Skill Match"          value={(item.skillMatchPercentage || 0) / 100} />
                <AnalysisResult result={item} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}