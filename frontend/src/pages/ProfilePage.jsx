import { useEffect, useState, useRef } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [picFile, setPicFile]       = useState(null)
  const fileRef = useRef()

  const [form, setForm] = useState({
    name: '',
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    requestedRole: '',
  })

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/api/users/me')
      setProfile(data)
      setForm(f => ({
        ...f,
        name: data.name || '',
        requestedRole: data.roles?.includes('RECRUITER') ? 'RECRUITER' : 'USER',
      }))
    } catch {
      setError('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [])

  const isGoogle = profile?.authProvider === 'GOOGLE' ||
    (authUser?.roles && !profile?.roles?.includes('LOCAL'))

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handlePicChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPicFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const requestData = {}
      if (form.name && form.name !== profile?.name)           requestData.name = form.name
      if (form.newEmail)                                       requestData.newEmail = form.newEmail
      if (form.newPassword)                                    requestData.newPassword = form.newPassword
      if (form.currentPassword)                                requestData.currentPassword = form.currentPassword

      // Only send requestedRole if it changed
      const currentRole = profile?.roles?.includes('RECRUITER') ? 'RECRUITER' : 'USER'
      if (form.requestedRole && form.requestedRole !== currentRole) {
        requestData.requestedRole = form.requestedRole
      }

      const formData = new FormData()
      formData.append('data', new Blob([JSON.stringify(requestData)], { type: 'application/json' }))
      if (picFile) formData.append('profilePicture', picFile)

      await api.put('/api/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setSuccess('Profile updated successfully!')
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', newEmail: '' }))
      setPicFile(null)
      await fetchProfile()
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.response?.data || 'Update failed.'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading profile…" />

  const initials   = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : '?'
  const avatarSrc  = previewUrl || profile?.profilePictureUrl
  const isRecruiter = profile?.roles?.includes('RECRUITER')

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👤 My <span>Profile</span></h1>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />
        {success && <div className="alert alert-success">✅ {success}</div>}

        {/* Avatar */}
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {avatarSrc ? <img src={avatarSrc} alt="Profile" /> : initials}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{profile?.name}</p>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              {profile?.email}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {profile?.roles?.map(r => (
                <span key={r} style={{
                  background: 'rgba(124,106,247,0.15)', color: 'var(--accent)',
                  borderRadius: 20, padding: '0.2rem 0.65rem',
                  fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(124,106,247,0.3)',
                }}>
                  {r}
                </span>
              ))}
              {profile?.recruiterVerified && (
                <span style={{
                  background: 'rgba(62,207,142,0.15)', color: 'var(--success)',
                  borderRadius: 20, padding: '0.2rem 0.65rem',
                  fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(62,207,142,0.3)',
                }}>
                  ✔ Verified Recruiter
                </span>
              )}
            </div>
          </div>
        </div>

        <input
          ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }} onChange={handlePicChange}
        />
        <button
          type="button" className="btn btn-secondary btn-sm"
          onClick={() => fileRef.current.click()}
          style={{ marginBottom: '1.5rem' }}
        >
          📷 Change Photo
        </button>
        {previewUrl && (
          <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
            Preview ready — save to apply the new photo.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="p-name">Display Name</label>
            <input
              id="p-name" name="name" type="text"
              value={form.name} onChange={handleChange}
              placeholder="Your full name"
            />
          </div>

          {/* Role switch */}
          <div className="form-group">
            <label>Account Role</label>
            <div className="role-toggle">
              <div
                className={`role-option ${form.requestedRole === 'USER' ? 'active' : ''}`}
                onClick={() => setForm(f => ({ ...f, requestedRole: 'USER' }))}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setForm(f => ({ ...f, requestedRole: 'USER' }))}
              >
                👤 Job Seeker
              </div>
              <div
                className={`role-option ${form.requestedRole === 'RECRUITER' ? 'active' : ''}`}
                onClick={() => setForm(f => ({ ...f, requestedRole: 'RECRUITER' }))}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setForm(f => ({ ...f, requestedRole: 'RECRUITER' }))}
              >
                🏢 Recruiter
              </div>
            </div>
            {form.requestedRole === 'RECRUITER' && !isRecruiter && (
              <div className="alert alert-warn" style={{ marginTop: 0 }}>
                ⚠️ Switching to Recruiter requires admin verification to post public jobs.
              </div>
            )}
            {form.requestedRole === 'RECRUITER' && isRecruiter && !profile?.recruiterVerified && (
              <div className="alert alert-info" style={{ marginTop: 0 }}>
                ⏳ Your recruiter account is pending admin verification.
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />

          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {isGoogle
              ? '🔒 Google-authenticated accounts cannot change email or password.'
              : 'To change email or password, enter your current password below.'}
          </p>

          <div className="form-group">
            <label htmlFor="p-new-email">New Email</label>
            <input
              id="p-new-email" name="newEmail" type="email"
              value={form.newEmail} onChange={handleChange}
              placeholder="Leave blank to keep current email"
              disabled={isGoogle}
            />
          </div>

          <div className="form-group">
            <label htmlFor="p-new-pass">New Password</label>
            <input
              id="p-new-pass" name="newPassword" type="password"
              value={form.newPassword} onChange={handleChange}
              placeholder="Leave blank to keep current password"
              disabled={isGoogle}
            />
          </div>

          {!isGoogle && (form.newEmail || form.newPassword) && (
            <div className="form-group">
              <label htmlFor="p-curr-pass">
                Current Password <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="p-curr-pass" name="currentPassword" type="password"
                value={form.currentPassword} onChange={handleChange}
                placeholder="Enter current password to confirm" required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '0.5rem' }}>
            {saving ? 'Saving…' : '💾 Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}