import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import LeaderboardTable from '../../components/LeaderboardTable'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'

export default function JobLeaderboardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get(`/api/jobs/${id}/leaderboard`)
      .then(res => setEntries(res.data))
      .catch(() => setError('Failed to load leaderboard.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner text="Loading leaderboard…" />

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/jobs/${id}`)}>
          ← Back to Job
        </button>
      </div>

      <div className="page-header">
        <h1 className="page-title">🏆 <span>Leaderboard</span></h1>
        <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{entries.length} applicants</span>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      <div className="card">
        <LeaderboardTable entries={entries} />
      </div>
    </div>
  )
}