import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import ErrorAlert from '../../components/ErrorAlert'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function EditJobPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState(null)
  const [originalDesc, setOriginalDesc] = useState('')
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [showWarn, setShowWarn]   = useState(false)

  useEffect(() => {
    api.get('/api/jobs/public')
      .then(res => {
        const job = res.data.find(j => j.id === id)
        if (!job) return navigate('/jobs')
        const isOwner = job.createdBy === user?.id || user?.roles?.includes('ADMIN')
        if (!isOwner) return navigate(`/jobs/${id}`)
        setForm({
          title: job.title || '',
          descriptionText: job.descriptionText || '',
          shortDescription: job.shortDescription || '',
          organisationName: job.organisationName || '',
          isPublic: job.isPublic ?? false,
          allowApplications: job.allowApplications ?? true,
          contactEmail: job.contactEmail || '',
          contactPhone: job.contactPhone || '',
        })
        setOriginalDesc(job.descriptionText || '')
      })
      .catch(() => setError('Failed to load job.'))
      .finally(() => setLoading(false))
  }, [id])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const descChanged = form?.descriptionText !== originalDesc

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (descChanged && !showWarn) {
      setShowWarn(true)
      return
    }
    await doSave()
  }

  const doSave = async () => {
    setError(''); setSaving(true)
    try {
      await api.put(`/api/jobs/${id}`, {
        title: form.title.trim() || undefined,
        descriptionText: form.descriptionText.trim() || undefined,
        shortDescription: form.shortDescription.trim() || null,
        organisationName: form.organisationName.trim() || null,
        isPublic: form.isPublic,
        allowApplications: form.allowApplications,
        contactEmail: form.contactEmail.trim() || null,
        contactPhone: form.contactPhone.trim() || null,
      })
      navigate(`/jobs/${id}`)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save changes.')
      setShowWarn(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!form)   return null

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">✏️ Edit <span>Job Posting</span></h1>
      </div>

      {/* Warning modal when AI description changes */}
      {showWarn && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">⚠️ This will clear all applications</span>
              <button className="modal-close" onClick={() => setShowWarn(false)}>✕</button>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>
              You've changed the AI matching description. Updating it will
              <strong style={{ color: 'var(--danger)' }}> permanently delete the entire leaderboard and all applicant data</strong> for this job, since old scores are no longer valid.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Are you sure you want to continue?</p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowWarn(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={doSave} disabled={saving}>
                {saving ? '⏳ Saving…' : '🗑 Yes, Clear & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} noValidate>
          <FormSection title="Basic Info">
            <div className="form-group">
              <label>Job Title</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)} disabled={saving} />
            </div>
            <div className="form-group">
              <label>Organisation Name</label>
              <input type="text" value={form.organisationName} onChange={e => set('organisationName', e.target.value)} disabled={saving} />
            </div>
            <div className="form-group">
              <label>Short Description
                <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '0.35rem' }}>(max 600 chars)</span>
              </label>
              <textarea value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)}
                style={{ minHeight: 80 }} maxLength={600} disabled={saving} />
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'right', marginTop: '0.2rem' }}>
                {form.shortDescription.length}/600
              </div>
            </div>
          </FormSection>

          <FormSection title="AI Matching Description">
            {descChanged && (
              <div className="alert alert-warn" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                ⚠️ Changing this will <strong>wipe the entire leaderboard</strong> and all applications for this job.
              </div>
            )}
            <div className="form-group">
              <label>Full Job Description (for AI matching)</label>
              <textarea value={form.descriptionText} onChange={e => set('descriptionText', e.target.value)}
                style={{ minHeight: 200 }} disabled={saving} />
            </div>
          </FormSection>

          <FormSection title="Contact Info">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Contact Email</label>
                <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} disabled={saving} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Contact Phone</label>
                <input type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} disabled={saving} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Visibility Settings">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <ToggleCard active={form.isPublic} onClick={() => set('isPublic', !form.isPublic)}
                icon="🌐" title="Public Listing" desc="Visible on the public jobs page" />
              <ToggleCard active={form.allowApplications} onClick={() => set('allowApplications', !form.allowApplications)}
                icon="📬" title="Accept Applications" desc="Allow users to apply" />
            </div>
          </FormSection>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary"
              onClick={() => navigate(`/jobs/${id}`)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Saving…' : '💾 Save Changes'}
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
      flex: 1, minWidth: 200, padding: '1rem', borderRadius: 10,
      cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s',
      border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      background: active ? 'rgba(124,106,247,0.07)' : 'var(--surface2)',
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