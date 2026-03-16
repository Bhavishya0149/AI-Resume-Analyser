import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'

export default function MyJobsPage() {
  const [jobs, setJobs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchJobs = () =>
    api.get('/api/jobs/my')
      .then(res => setJobs(res.data))
      .catch(() => setError('Failed to load jobs.'))
      .finally(() => setLoading(false))

  useEffect(() => { fetchJobs() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this job and all its applications?')) return
    try {
      await api.delete(`/api/jobs/${id}`)
      setJobs(j => j.filter(x => x.id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.')
    }
  }

  if (loading) return <LoadingSpinner text="Loading your jobs…" />

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 My <span>Jobs</span></h1>
        <Link to="/jobs/create" className="btn btn-primary">+ Create Job</Link>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No jobs posted yet</h3>
          <p><Link to="/jobs/create">Create your first job posting.</Link></p>
        </div>
      ) : (
        <div className="card-grid">
          {jobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-title">{job.title}</div>
              <div className="job-actions" style={{ marginTop: '1rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/jobs/${job.id}/leaderboard`)}
                >
                  🏆 Leaderboard
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(job.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}