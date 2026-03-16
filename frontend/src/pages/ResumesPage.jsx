import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import ResumeCard from '../components/ResumeCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'

export default function ResumesPage() {
  const [resumes, setResumes]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [error, setError]         = useState('')
  const fileRef = useRef()
  const navigate = useNavigate()

  const fetchResumes = async () => {
    try {
      const { data } = await api.get('/api/resumes')
      setResumes(data)
    } catch {
      setError('Failed to load resumes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResumes() }, [])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowed = ['application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain']
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      return setError('Only PDF, DOCX, and TXT files are allowed.')
    }
    setError('')
    setUploading(true)
    setProgress(0)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post('/api/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
      })
      setProgress(100)
      await fetchResumes()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Upload failed.')
    } finally {
      setUploading(false)
      setProgress(0)
      fileRef.current.value = ''
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return
    try {
      await api.delete(`/api/resumes/${id}`)
      setResumes(r => r.filter(x => x.id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.')
    }
  }

  if (loading) return <LoadingSpinner text="Loading resumes…" />

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📄 My <span>Resumes</span></h1>
        <button className="btn btn-primary" onClick={() => fileRef.current.click()} disabled={uploading}>
          {uploading ? `Uploading ${progress}%` : '+ Upload Resume'}
        </button>
      </div>

      <input
        ref={fileRef} type="file" accept=".pdf,.docx,.txt"
        style={{ display: 'none' }} onChange={handleFileChange}
      />

      <ErrorAlert message={error} onClose={() => setError('')} />

      {uploading && (
        <div className="upload-progress card" style={{ marginBottom: '1rem' }}>
          <div style={{ marginBottom: '0.4rem', fontSize: '0.85rem' }}>Uploading… {progress}%</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No resumes yet</h3>
          <p>Upload your first resume to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {resumes.map(resume => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onDelete={handleDelete}
              onAnalyze={() => navigate('/analyze', { state: { resumeId: resume.id } })}
              onApply={() => navigate('/jobs',     { state: { resumeId: resume.id } })}
            />
          ))}
        </div>
      )}
    </div>
  )
}