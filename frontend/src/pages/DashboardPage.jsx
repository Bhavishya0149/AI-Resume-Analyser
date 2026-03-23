import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DashboardPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [resumes, setResumes]   = useState([])
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)

  // location.key changes every time the user navigates to /dashboard — forces refetch
  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        const [res, hist] = await Promise.allSettled([
          api.get('/api/resumes'),
          api.get('/api/analysis/history'),
        ])
        if (res.status  === 'fulfilled') setResumes(res.value.data)
        if (hist.status === 'fulfilled') setHistory(hist.value.data)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [location.key])

  if (loading) return <LoadingSpinner text="Loading dashboard…" />

  const recentHistory = history.slice(0, 3)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Welcome back, <span>{user?.name?.split(' ')[0]}</span> 👋
        </h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{resumes.length}</div>
          <div className="stat-label">Resumes Uploaded</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{history.length}</div>
          <div className="stat-label">Analyses Performed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {history.length > 0
              ? ((history[0].qualificationScore || 0) * 100).toFixed(0) + '%'
              : '—'
            }
          </div>
          <div className="stat-label">Latest Score</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--muted)' }}>QUICK ACTIONS</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/resumes"  className="btn btn-primary">📄 Upload Resume</Link>
          <Link to="/analyze"  className="btn btn-secondary">🔍 Analyze Resume</Link>
          <Link to="/jobs"     className="btn btn-secondary">💼 Browse Jobs</Link>
          <Link to="/history"  className="btn btn-secondary">📊 View History</Link>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', color: 'var(--muted)' }}>RECENT ANALYSES</h2>
          <Link to="/history" style={{ fontSize: '0.85rem' }}>View all →</Link>
        </div>

        {recentHistory.length === 0 ? (
          <div className="empty-state" style={{ padding: '1.5rem' }}>
            <p>No analyses yet. <Link to="/analyze">Run your first analysis!</Link></p>
          </div>
        ) : (
          recentHistory.map((item, i) => (
            <Link
              to={`/history/${item.id}`}
              state={{ entry: item }}
              key={i}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 0', borderBottom: '1px solid var(--border)',
                textDecoration: 'none', color: 'inherit'
              }}
            >
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                {((item.qualificationScore || 0) * 100).toFixed(1)}% match →
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}