import { useEffect, useState, useRef } from 'react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'

export default function ResumesPage() {
  const [resumes, setResumes]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [deleting, setDeleting] = useState(null)
  const fileRef = useRef()

  const fetchResumes = () => {
    setLoading(true)
    api.get('/api/resumes')
      .then(res => setResumes(res.data))
      .catch(() => setError('Failed to load resumes.'))
      .finally(() => setLoading(false))
  }

  useEffect(fetchResumes, [])

  const handleUpload = async (file) => {
    if (!file) return
    setError(''); setSuccess('')
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { data } = await api.post('/api/resumes', fd)
      setResumes(prev => [data, ...prev])
      setSuccess('Resume uploaded successfully.')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return
    setDeleting(id)
    try {
      await api.delete(`/api/resumes/${id}`)
      setResumes(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete resume.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📄 My <span>Resumes</span></h1>
        <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? '⏳ Uploading…' : '⬆️ Upload Resume'}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }}
          onChange={e => handleUpload(e.target.files?.[0])} />
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />
      {success && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>✅ {success}</div>}

      {/* Upload drop zone */}
      <div
        className="upload-zone"
        style={{ marginBottom: '1.5rem' }}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files?.[0]) }}
      >
        <div className="upload-zone-icon">📎</div>
        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
          {uploading ? 'Uploading…' : 'Click or drag & drop to upload'}
        </p>
        <p style={{ fontSize: '0.8rem' }}>PDF, DOCX, or TXT · Max 10MB</p>
      </div>

      {resumes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <h3>No resumes uploaded</h3>
          <p style={{ marginTop: '0.4rem' }}>Upload your first resume to start applying to jobs.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {resumes.map(resume => {
            const ext = resume.fileName?.split('.').pop()?.toUpperCase() || 'FILE'
            const date = resume.createdAt
              ? new Date(resume.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : '—'

            return (
              <div key={resume.id} className="resume-card">
                <div className="resume-icon">
                  {ext === 'PDF' ? '📕' : ext === 'DOCX' ? '📘' : '📄'}
                </div>
                <div className="resume-info">
                  <div className="resume-name">{resume.fileName}</div>
                  <div className="resume-date">{ext} · Uploaded {date}</div>
                </div>
                <div className="resume-actions">
                  {resume.cloudinaryUrl && (
                    <a href={resume.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm">
                      👁 View
                    </a>
                  )}
                  <button className="btn btn-danger btn-sm"
                    disabled={deleting === resume.id}
                    onClick={() => handleDelete(resume.id)}>
                    {deleting === resume.id ? '…' : '🗑 Delete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}