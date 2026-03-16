import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import Modal from '../../components/Modal'
import AnalysisResult from '../../components/AnalysisResult'

export default function JobDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob]           = useState(null)
  const [resumes, setResumes]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [applyModal, setApplyModal] = useState(false)
  const [selectedResume, setSelectedResume] = useState('')
  const [applying, setApplying] = useState(false)
  const [result, setResult]     = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [jobsRes, resumesRes] = await Promise.all([
          api.get('/api/jobs/public'),
          api.get('/api/resumes'),
        ])
        const found = jobsRes.data.find(j => j.id === id)
        if (!found) { setError('Job not found.'); return }
        setJob(found)
        setResumes(resumesRes.data)
      } catch {
        setError('Failed to load job details.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  const handleApply = async () => {
    if (!selectedResume) return setError('Please select a resume.')
    setApplying(true)
    setError('')
    try {
      const { data } = await api.post(`/api/jobs/${id}/apply?resumeId=${selectedResume}`)
      setResult(data)
      setApplyModal(false)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Application failed.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading job…" />
  if (error && !job) return (
    <div>
      <ErrorAlert message={error} />
      <Link to="/jobs">← Back to Jobs</Link>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/jobs')}>
          ← Back to Jobs
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>{job.title}</h1>
        <div style={{ color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
          {job.descriptionText || 'No description provided.'}
        </div>

        <ErrorAlert message={error} onClose={() => setError('')} />

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setApplyModal(true)}>
            🚀 Apply Now
          </button>
          <Link to={`/jobs/${id}/leaderboard`} className="btn btn-secondary">
            🏆 View Leaderboard
          </Link>
        </div>
      </div>

      {result && <AnalysisResult result={result} />}

      <Modal
        isOpen={applyModal}
        onClose={() => setApplyModal(false)}
        title="Apply to Job"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setApplyModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleApply} disabled={applying || !selectedResume}>
              {applying ? 'Applying…' : 'Submit Application'}
            </button>
          </>
        }
      >
        <p style={{ marginBottom: '1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Select one of your resumes to apply with:
        </p>
        {resumes.length === 0 ? (
          <div className="alert alert-info">
            No resumes found. <Link to="/resumes">Upload a resume first.</Link>
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="resume-select">Resume</label>
            <select
              id="resume-select"
              value={selectedResume}
              onChange={e => setSelectedResume(e.target.value)}
            >
              <option value="">— Select a resume —</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.fileName}</option>
              ))}
            </select>
          </div>
        )}
      </Modal>
    </div>
  )
}