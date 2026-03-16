import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api/axios'
import AnalysisResult from '../components/AnalysisResult'
import ErrorAlert from '../components/ErrorAlert'

export default function AnalyzePage() {
  const location = useLocation()
  const [resumes, setResumes]       = useState([])
  const [mode, setMode]             = useState('select') // 'select' | 'paste'
  const [selectedResume, setSelected] = useState(location.state?.resumeId || '')
  const [resumeText, setResumeText] = useState('')
  const [jdText, setJdText]         = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [result, setResult]         = useState(null)

  useEffect(() => {
    api.get('/api/resumes').then(res => setResumes(res.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!jdText.trim()) return setError('Please enter a job description.')
    if (mode === 'select' && !selectedResume) return setError('Please select a resume.')
    if (mode === 'paste'  && !resumeText.trim()) return setError('Please paste resume text.')
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (mode === 'select') params.append('resumeId', selectedResume)
      else params.append('resumeText', resumeText)
      params.append('jdText', jdText)
      const { data } = await api.post(`/api/analysis/compare?${params.toString()}`)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔍 Resume <span>Analyzer</span></h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left: Resume Input */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Resume</h2>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'select' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('select')}
            >
              Select Uploaded
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'paste' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('paste')}
            >
              Paste Text
            </button>
          </div>

          {mode === 'select' ? (
            <div className="form-group">
              <label htmlFor="resume-analyze">Select Resume</label>
              <select
                id="resume-analyze"
                value={selectedResume}
                onChange={e => setSelected(e.target.value)}
              >
                <option value="">— Select a resume —</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.fileName}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="resume-text">Paste Resume Text</label>
              <textarea
                id="resume-text"
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your resume content here…"
                style={{ minHeight: 250 }}
              />
            </div>
          )}
        </div>

        {/* Right: Job Description */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Job Description</h2>
          <div className="form-group">
            <label htmlFor="jd-text">Paste Job Description</label>
            <textarea
              id="jd-text"
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste the full job description here…"
              style={{ minHeight: 250 }}
            />
          </div>
        </div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      <div style={{ marginTop: '1.25rem' }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ minWidth: 160 }}
        >
          {loading ? '⏳ Analyzing…' : '🔍 Run Analysis'}
        </button>
      </div>

      {result && <AnalysisResult result={result} />}
    </div>
  )
}
