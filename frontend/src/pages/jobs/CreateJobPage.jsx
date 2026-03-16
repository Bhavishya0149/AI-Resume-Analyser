import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import ErrorAlert from '../../components/ErrorAlert'

export default function CreateJobPage() {
  const [form, setForm] = useState({
    title: '',
    descriptionText: '',
    isPublic: true,
    allowApplications: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title || !form.descriptionText) return setError('Title and description are required.')
    setLoading(true)
    try {
      await api.post('/api/jobs', form)
      navigate('/jobs/my')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to create job.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">➕ Create <span>Job</span></h1>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="job-title">Job Title *</label>
            <input
              id="job-title" name="title" type="text"
              value={form.title} onChange={handleChange}
              placeholder="e.g. Senior Backend Engineer"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="job-desc">Job Description *</label>
            <textarea
              id="job-desc" name="descriptionText"
              value={form.descriptionText} onChange={handleChange}
              placeholder="Describe the role, responsibilities, and required skills…"
              style={{ minHeight: 200 }}
              required
            />
          </div>

          <div className="checkbox-group">
            <input
              id="isPublic" name="isPublic" type="checkbox"
              checked={form.isPublic} onChange={handleChange}
            />
            <label htmlFor="isPublic">Make this job public</label>
          </div>

          <div className="checkbox-group">
            <input
              id="allowApps" name="allowApplications" type="checkbox"
              checked={form.allowApplications} onChange={handleChange}
            />
            <label htmlFor="allowApps">Allow applications</label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : '✔ Create Job'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}