import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import ErrorAlert from '../../components/ErrorAlert'

export default function CreateJobPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', descriptionText: '', shortDescription: '',
    organisationName: '', isPublic: false, allowApplications: true,
    contactEmail: '', contactPhone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim())          return setError('Job title is required.')
    if (!form.descriptionText.trim()) return setError('Job description (for AI matching) is required.')
    setLoading(true)
    try {
      const payload = {
        title: form.title.trim(),
        descriptionText: form.descriptionText.trim(),
        shortDescription: form.shortDescription.trim() || null,
        organisationName: form.organisationName.trim() || null,
        isPublic: form.isPublic,
        allowApplications: form.allowApplications,
        contactEmail: form.contactEmail.trim() || null,
        contactPhone: form.contactPhone.trim() || null,
      }
      const { data } = await api.post('/api/jobs', payload)
      navigate(`/jobs/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create job.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">➕ Create <span>Job Posting</span></h1>
      </div>

      <div className="card">
        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} noValidate>

          <FormSection title="Basic Info">
            <div className="form-group">
              <label>Job Title *</label>
              <input type="text" value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                disabled={loading} />
            </div>
            <div className="form-group">
              <label>Organisation Name</label>
              <input type="text" value={form.organisationName}
                onChange={e => set('organisationName', e.target.value)}
                placeholder="e.g. Acme Corp"
                disabled={loading} />
            </div>
            <div className="form-group">
              <label>Short Description
                <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '0.35rem' }}>
                  (shown on listings page, max 600 chars)
                </span>
              </label>
              <textarea value={form.shortDescription}
                onChange={e => set('shortDescription', e.target.value)}
                placeholder="A brief summary of the role for the listings page…"
                style={{ minHeight: 80 }} maxLength={600}
                disabled={loading} />
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'right', marginTop: '0.25rem' }}>
                {form.shortDescription.length}/600
              </div>
            </div>
          </FormSection>

          <FormSection title="AI Matching Description">
            <div className="alert alert-info" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
              ℹ️ This description is used to rank applicants via AI. Be detailed — include required skills, experience, and responsibilities.
            </div>
            <div className="form-group">
              <label>Full Job Description (for AI matching) *</label>
              <textarea value={form.descriptionText}
                onChange={e => set('descriptionText', e.target.value)}
                placeholder="Paste the full JD here. Include required skills, qualifications, and responsibilities…"
                style={{ minHeight: 200 }}
                disabled={loading} />
            </div>
          </FormSection>

          <FormSection title="Contact Info (Optional)">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Contact Email</label>
                <input type="email" value={form.contactEmail}
                  onChange={e => set('contactEmail', e.target.value)}
                  placeholder="hr@company.com"
                  disabled={loading} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Contact Phone</label>
                <input type="tel" value={form.contactPhone}
                  onChange={e => set('contactPhone', e.target.value)}
                  placeholder="+91 98765 43210"
                  disabled={loading} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Visibility Settings">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <ToggleCard
                active={form.isPublic}
                onClick={() => set('isPublic', !form.isPublic)}
                icon="🌐" title="Public Listing"
                desc="Visible to all users on the jobs page"
              />
              <ToggleCard
                active={form.allowApplications}
                onClick={() => set('allowApplications', !form.allowApplications)}
                icon="📬" title="Accept Applications"
                desc="Allow users to apply to this posting"
              />
            </div>
          </FormSection>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary"
              onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Creating…' : '✅ Create Job Posting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormSection({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: '1rem', paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--border)',
      }}>{title}</div>
      {children}
    </div>
  )
}

function ToggleCard({ active, onClick, icon, title, desc }) {
  return (
    <div onClick={onClick} style={{
      flex: 1, minWidth: 200, padding: '1rem',
      borderRadius: 10, cursor: 'pointer', userSelect: 'none',
      border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      background: active ? 'rgba(124,106,247,0.07)' : 'var(--surface2)',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
        <span>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: active ? 'var(--accent)' : 'var(--text)' }}>{title}</span>
        <span style={{
          marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.55rem',
          borderRadius: 20, background: active ? 'var(--accent)' : 'var(--surface)',
          color: active ? 'white' : 'var(--muted)', border: '1px solid var(--border)',
        }}>{active ? 'ON' : 'OFF'}</span>
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{desc}</div>
    </div>
  )
}