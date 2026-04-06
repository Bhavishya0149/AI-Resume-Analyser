import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import ErrorAlert from '../components/ErrorAlert'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ProfilePage() {
  const { user: authUser, logout } = useAuth()

  const [profile, setProfile]         = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const [name, setName]               = useState('')
  const [newEmail, setNewEmail]       = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [requestedRole, setRequestedRole] = useState('USER')
  const [saving, setSaving]           = useState(false)
  const [removingPic, setRemovingPic] = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [previewUrl, setPreviewUrl]   = useState(null)
  const [picFile, setPicFile]         = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    api.get('/api/users/me')
      .then(res => {
        setProfile(res.data)
        setName(res.data.name || '')
        setPreviewUrl(res.data.profilePictureUrl || null)
        setRequestedRole(res.data.roles?.includes('RECRUITER') ? 'RECRUITER' : 'USER')
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setProfileLoading(false))
  }, [])

  const isGoogle    = profile?.authProvider === 'GOOGLE'
  const isRecruiter = profile?.roles?.includes('RECRUITER')
  const currentRole = isRecruiter ? 'RECRUITER' : 'USER'

  const handlePicChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPicFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemovePicture = async () => {
    if (!window.confirm('Remove your profile picture?')) return
    setError(''); setSuccess('')
    setRemovingPic(true)
    try {
      await api.delete('/api/users/me/profile-picture')
      setPreviewUrl(null)
      setPicFile(null)
      setProfile(prev => ({ ...prev, profilePictureUrl: null }))
      setSuccess('Profile picture removed.')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to remove picture.')
    } finally {
      setRemovingPic(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')

    const requestData = {}
    if (name.trim() && name !== profile?.name)    requestData.name = name.trim()
    if (!isGoogle && newEmail.trim())             requestData.newEmail = newEmail.trim()
    if (!isGoogle && newPassword)                 requestData.newPassword = newPassword
    if (!isGoogle && currentPassword)             requestData.currentPassword = currentPassword
    if (requestedRole !== currentRole)            requestData.requestedRole = requestedRole

    if (!picFile && Object.keys(requestData).length === 0) {
      return setError('No changes to save.')
    }

    setSaving(true)
    try {
      const fd = new FormData()
      if (Object.keys(requestData).length > 0) {
        fd.append('data', new Blob([JSON.stringify(requestData)], { type: 'application/json' }))
      }
      if (picFile) fd.append('profilePicture', picFile)

      await api.put('/api/users/me', fd)

      // Re-fetch to reflect server-side changes
      const { data } = await api.get('/api/users/me')
      setProfile(data)
      setName(data.name || '')
      setPreviewUrl(data.profilePictureUrl || null)
      setRequestedRole(data.roles?.includes('RECRUITER') ? 'RECRUITER' : 'USER')

      setSuccess('Profile updated successfully.')
      setNewPassword(''); setCurrentPassword(''); setNewEmail('')
      setPicFile(null)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (profileLoading) return <LoadingSpinner />

  const initial = profile?.name?.[0]?.toUpperCase() || '?'

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">👤 My <span>Profile</span></h1>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <ErrorAlert message={error} onClose={() => setError('')} />
        {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>✅ {success}</div>}

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 700, color: 'white',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {previewUrl
              ? <img src={previewUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initial
            }
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{profile?.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{profile?.email}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm"
                onClick={() => fileRef.current?.click()}
                disabled={saving || removingPic}>
                {picFile ? '✅ New pic selected' : '📷 Change Photo'}
              </button>
              {previewUrl && !picFile && (
                <button className="btn btn-danger btn-sm"
                  onClick={handleRemovePicture}
                  disabled={saving || removingPic}>
                  {removingPic ? '⏳ Removing…' : '🗑 Remove Photo'}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }} onChange={handlePicChange} />
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} noValidate>

          {/* Display name — always editable */}
          <div className="form-group">
            <label>Display Name</label>
            <input type="text" value={name}
              onChange={e => setName(e.target.value)} disabled={saving} />
          </div>

          {/* Role switch — always available */}
          <div className="form-group">
            <label>Account Role</label>
            <div className="role-toggle">
              <button type="button"
                className={`role-option ${requestedRole === 'USER' ? 'active' : ''}`}
                onClick={() => setRequestedRole('USER')}>
                🎯 Job Seeker
              </button>
              <button type="button"
                className={`role-option ${requestedRole === 'RECRUITER' ? 'active' : ''}`}
                onClick={() => setRequestedRole('RECRUITER')}>
                💼 Recruiter
              </button>
            </div>
            {requestedRole === 'RECRUITER' && !isRecruiter && (
              <div className="alert alert-warn" style={{ marginTop: 0 }}>
                ⚠️ Switching to Recruiter requires admin verification before you can post public jobs.
              </div>
            )}
            {requestedRole === 'RECRUITER' && isRecruiter && !profile?.recruiterVerified && (
              <div className="alert alert-info" style={{ marginTop: 0 }}>
                ℹ️ Your recruiter account is pending admin verification.
              </div>
            )}
          </div>

          {/* Email + password — hidden entirely for Google users */}
          {isGoogle ? (
            <div className="alert alert-info" style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              🔵 You signed in with Google. Email and password are managed through your Google account.
            </div>
          ) : (
            <>
              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '1.25rem', marginTop: '0.25rem', marginBottom: '1.25rem'
              }}>
                <div style={{
                  fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem'
                }}>
                  Email & Password
                </div>

                <div className="form-group">
                  <label>
                    New Email
                    <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '0.35rem' }}>
                      (leave blank to keep current)
                    </span>
                  </label>
                  <input type="email" value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="new@email.com" disabled={saving} />
                </div>

                <div className="form-group">
                  <label>
                    New Password
                    <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '0.35rem' }}>
                      (leave blank to keep current)
                    </span>
                  </label>
                  <input type="password" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters" disabled={saving} />
                </div>

                {(newEmail || newPassword) && (
                  <div className="form-group">
                    <label>
                      Current Password
                      <span style={{ color: 'var(--danger)', marginLeft: '0.2rem' }}>*</span>
                    </label>
                    <input type="password" value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Required to confirm changes"
                      disabled={saving} />
                  </div>
                )}
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving || removingPic}>
              {saving ? '⏳ Saving…' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Account info */}
      <div className="card">
        <div style={{
          fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)',
          textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem'
        }}>
          Account Info
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <InfoRow label="Roles" value={profile?.roles?.join(', ') || 'USER'} />
          <InfoRow
            label="Recruiter Status"
            value={isRecruiter
              ? (profile?.recruiterVerified ? '✅ Verified' : '⏳ Pending verification')
              : '—'}
            valueColor={isRecruiter
              ? (profile?.recruiterVerified ? 'var(--success)' : 'var(--warn)')
              : 'var(--muted)'}
          />
          <InfoRow label="Auth Provider" value={isGoogle ? '🔵 Google' : '🔑 Email & Password'} />
        </div>
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-danger btn-sm" onClick={logout}>
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: valueColor || 'var(--text)' }}>{value}</span>
    </div>
  )
}