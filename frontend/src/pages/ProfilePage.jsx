import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import ErrorAlert from '../components/ErrorAlert'
import LoadingSpinner from '../components/LoadingSpinner'

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.65rem 0',
      borderBottom: '1px solid var(--border)',
      gap: '1rem',
      flexWrap: 'wrap',
    }}>
      <span style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.875rem', textAlign: 'right' }}>{value || '—'}</span>
    </div>
  )
}

export default function ProfilePage() {
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  // Editable fields
  const [name, setName]                 = useState('')
  const [requestedRole, setRequestedRole] = useState('USER')

  // Profile picture
  const [picFile, setPicFile]       = useState(null)
  const [picPreview, setPicPreview] = useState(null)
  const [removingPic, setRemovingPic] = useState(false)
  const fileInputRef = useRef()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/users/me')
      setProfile(data)
      setName(data.name || '')
      // Determine current role
      if (data.roles?.includes('RECRUITER')) {
        setRequestedRole('RECRUITER')
      } else {
        setRequestedRole('USER')
      }
    } catch {
      setError('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  const handlePicChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPicFile(file)
    setPicPreview(URL.createObjectURL(file))
  }

  const handleRemovePic = async () => {
    setError('')
    setSuccess('')
    setRemovingPic(true)
    try {
      await api.delete('/api/users/me/profile-picture')
      setProfile(prev => ({ ...prev, profilePictureUrl: null }))
      setPicFile(null)
      setPicPreview(null)
      setSuccess('Profile picture removed.')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove profile picture.')
    } finally {
      setRemovingPic(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const hasNameChange = name.trim() && name.trim() !== profile?.name
    const currentRole   = profile?.roles?.includes('RECRUITER') ? 'RECRUITER' : 'USER'
    const hasRoleChange = requestedRole !== currentRole
    const hasPicChange  = !!picFile

    if (!hasNameChange && !hasRoleChange && !hasPicChange) {
      setError('No changes to save.')
      return
    }

    setSaving(true)
    try {
      const payload = {}
      if (hasNameChange)  payload.name = name.trim()
      if (hasRoleChange)  payload.requestedRole = requestedRole

      const formData = new FormData()
      if (Object.keys(payload).length > 0) {
        formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
      }
      if (hasPicChange) {
        formData.append('profilePicture', picFile)
      }

      await api.put('/api/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setSuccess('Profile updated successfully.')
      setPicFile(null)
      setPicPreview(null)
      await fetchProfile()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading profile…" />

  const avatarSrc = picPreview || profile?.profilePictureUrl
  const initials  = profile?.name?.charAt(0)?.toUpperCase() || '?'
  const isGoogle  = profile?.authProvider === 'GOOGLE'

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">My <span>Profile</span></h1>
      </div>

      <ErrorAlert
        message={error}
        onClose={() => setError('')}
      />

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          ✅ {success}
        </div>
      )}

      {/* Avatar Section */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="profile-avatar-section">
          {/* Avatar */}
          <div
            className="profile-avatar"
            onClick={() => fileInputRef.current?.click()}
            title="Click to change profile picture"
            style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}
          >
            {avatarSrc
              ? <img src={avatarSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials
            }
            {/* Camera overlay */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s',
              fontSize: '1.3rem',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              📷
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handlePicChange}
          />

          {/* Name + Role badges */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.25rem' }}>
              {profile?.name}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '0.6rem' }}>
              {profile?.email}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {profile?.roles?.map(role => (
                <span key={role} style={{
                  padding: '0.2rem 0.65rem', borderRadius: 20, fontSize: '0.75rem',
                  fontWeight: 700,
                  background: role === 'ADMIN'
                    ? 'rgba(224,85,85,0.15)' : role === 'RECRUITER'
                      ? 'rgba(124,106,247,0.15)' : 'rgba(62,207,142,0.12)',
                  color: role === 'ADMIN'
                    ? 'var(--danger)' : role === 'RECRUITER'
                      ? 'var(--accent)' : 'var(--success)',
                  border: `1px solid ${role === 'ADMIN'
                    ? 'rgba(224,85,85,0.3)' : role === 'RECRUITER'
                      ? 'rgba(124,106,247,0.3)' : 'rgba(62,207,142,0.3)'}`,
                }}>
                  {role === 'ADMIN' ? '👑' : role === 'RECRUITER' ? '🏢' : '👤'} {role}
                </span>
              ))}
              {profile?.recruiterVerified && (
                <span style={{
                  padding: '0.2rem 0.65rem', borderRadius: 20, fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(62,207,142,0.12)', color: 'var(--success)',
                  border: '1px solid rgba(62,207,142,0.3)',
                }}>
                  ✅ Verified Recruiter
                </span>
              )}
            </div>
          </div>

          {/* Remove picture button */}
          {(avatarSrc && !picPreview) && (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleRemovePic}
              disabled={removingPic}
              style={{ alignSelf: 'flex-start' }}
            >
              {removingPic ? '⏳' : '🗑️'} Remove Photo
            </button>
          )}
          {picPreview && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setPicFile(null); setPicPreview(null) }}
              style={{ alignSelf: 'flex-start' }}
            >
              ✕ Cancel
            </button>
          )}
        </div>
      </div>

      {/* Account Info (read-only) */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Account Info</h2>
        <InfoRow label="Email" value={profile?.email} />
        <InfoRow
          label="Auth Provider"
          value={
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {isGoogle
                ? <><span style={{ fontSize: '1rem' }}>🔵</span> Google</>
                : <><span style={{ fontSize: '1rem' }}>📧</span> Email OTP</>
              }
            </span>
          }
        />
        <InfoRow
          label="Account Status"
          value={
            <span style={{
              color: profile?.isActive !== false ? 'var(--success)' : 'var(--danger)',
              fontWeight: 600,
            }}>
              {profile?.isActive !== false ? '✅ Active' : '🚫 Inactive'}
            </span>
          }
        />
      </div>

      {/* Edit Form */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Edit Profile</h2>
        <form onSubmit={handleSubmit} noValidate>

          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              disabled={saving}
              maxLength={100}
            />
          </div>

          {/* Profile Picture upload hint */}
          <div className="form-group">
            <label>Profile Picture</label>
            <div
              className="upload-zone"
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '1.25rem', cursor: 'pointer' }}
            >
              <div className="upload-zone-icon">🖼️</div>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                {picFile
                  ? `Selected: ${picFile.name}`
                  : 'Click to upload a new photo (JPEG, PNG or WebP)'
                }
              </p>
            </div>
          </div>

          {/* Role toggle — not shown to ADMINs */}
          {!profile?.roles?.includes('ADMIN') && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block', fontSize: '0.85rem',
                fontWeight: 600, color: 'var(--muted)', marginBottom: '0.35rem',
              }}>
                I am a...
              </label>
              <div className="role-toggle">
                <button
                  type="button"
                  className={`role-option ${requestedRole === 'USER' ? 'active' : ''}`}
                  onClick={() => setRequestedRole('USER')}
                  disabled={saving}
                >
                  👤 Job Seeker
                </button>
                <button
                  type="button"
                  className={`role-option ${requestedRole === 'RECRUITER' ? 'active' : ''}`}
                  onClick={() => setRequestedRole('RECRUITER')}
                  disabled={saving}
                >
                  🏢 Recruiter
                </button>
              </div>
              {requestedRole === 'RECRUITER' && !profile?.recruiterVerified && (
                <p style={{ fontSize: '0.8rem', color: 'var(--warn)', marginTop: '0.4rem' }}>
                  ⚠️ Recruiter access requires admin verification before job posting is enabled.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={saving}
          >
            {saving ? '⏳ Saving…' : '💾 Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}