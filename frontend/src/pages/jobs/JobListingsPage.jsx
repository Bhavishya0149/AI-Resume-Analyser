import { useEffect, useState } from 'react'
import api from '../../api/axios'
import JobCard from '../../components/JobCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'

export default function JobListingsPage() {
  const [jobs, setJobs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/jobs/public')
      .then(res => setJobs(res.data))
      .catch(() => setError('Failed to load jobs.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Loading jobs…" />

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💼 <span>Job</span> Listings</h1>
        <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{jobs.length} jobs available</span>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No jobs available</h3>
          <p>Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="card-grid">
          {jobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  )
}