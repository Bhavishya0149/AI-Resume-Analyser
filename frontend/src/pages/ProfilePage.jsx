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
  })

  useEffect(() => {
    api.get('/api/users/me')
      .then(res => {
        setProfile(res.data)
        setForm(f => ({ ...f, name: res.data.name || '' }))
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  const isGoogle = profile?.roles && !profile?.authProvider
    ? false
    : authUser?.authProvider === 'GOOGLE'

  // Detect Google user from absence of password fields being usable
  // We rely on backend to reject; UI disables based on profile hint
  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

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
      const formData = new FormData()

      const requestData = {}
      if (form.name && form.name !== profile?.name) requestData.name = form.name
      if (form.newEmail)     requestData.newEmail = form.newEmail
      if (form.newPassword)  requestData.newPassword = form.newPassword
      if (form.currentPassword) requestData.currentPassword = form.currentPassword

      formData.append('data', new Blob([JSON.stringify(requestData)], { type: 'application/json' }))
      if (picFile) formData.append('profilePicture', picFile)

      await api.put('/api/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setSuccess('Profile updated successfully!')
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', newEmail: '' }))
      setPicFile(null)

      // Refresh profile
      const res = await api.get('/api/users/me')
      setProfile(res.data)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Update failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading profile…" />

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : '?'

  const avatarSrc = previewUrl || profile?.profilePictureUrl

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👤 My <span>Profile</span></h1>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />
        {success && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            ✅ {success}
          </div>
        )}

        {/* Avatar section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {avatarSrc
              ? <img src={avatarSrc} alt="Profile" />
              : initials
            }
          </div>
          <div>
            <p style={{ fontWeight: 600 }}>{profile?.name}</p>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              {profile?.email}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {profile?.roles?.map(r => (
                <span key={r} style={{
                  background: 'rgba(124,106,247,0.15)',
                  color: 'var(--accent)',
                  borderRadius: 20,
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid rgba(124,106,247,0.3)',
                }}>
                  {r}
                </span>
              ))}
              {profile?.recruiterVerified && (
                <span style={{
                  background: 'rgba(62,207,142,0.15)',
                  color: 'var(--success)',
                  borderRadius: 20,
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid rgba(62,207,142,0.3)',
                }}>
                  ✔ Verified Recruiter
                </span>
              )}
            </div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handlePicChange}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
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
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {isGoogle
              ? '🔒 Google-authenticated accounts cannot change email or password.'
              : 'To change email or password, you must enter your current password.'}
          </p>

          {/* Change Email */}
          <div className="form-group">
            <label htmlFor="p-new-email">New Email</label>
            <input
              id="p-new-email" name="newEmail" type="email"
              value={form.newEmail}
              onChange={handleChange}
              placeholder="Leave blank to keep current email"
              disabled={isGoogle}
            />
          </div>

          {/* New Password */}
          <div className="form-group">
            <label htmlFor="p-new-pass">New Password</label>
            <input
              id="p-new-pass" name="newPassword" type="password"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              disabled={isGoogle}
            />
          </div>

          {/* Current Password (required when changing email or password) */}
          {!isGoogle && (form.newEmail || form.newPassword) && (
            <div className="form-group">
              <label htmlFor="p-curr-pass">
                Current Password <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="p-curr-pass" name="currentPassword" type="password"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ marginTop: '0.5rem' }}
          >
            {saving ? 'Saving…' : '💾 Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}