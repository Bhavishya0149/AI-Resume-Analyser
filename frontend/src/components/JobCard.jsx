import { useNavigate } from 'react-router-dom'

export default function JobCard({ job, actions }) {
  const navigate = useNavigate()
  const preview = job.shortDescription
    || (job.descriptionText ? job.descriptionText.substring(0, 120) + (job.descriptionText.length > 120 ? '…' : '') : 'No description provided.')

  return (
    <div className="job-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div className="job-title">{job.title}</div>
        {job.allowApplications !== undefined && (
          <span style={{
            flexShrink: 0, fontSize: '0.72rem', fontWeight: 700,
            padding: '0.2rem 0.6rem', borderRadius: 20,
            color: job.allowApplications ? 'var(--success)' : 'var(--muted)',
            background: job.allowApplications ? 'rgba(62,207,142,0.1)' : 'var(--surface2)',
            border: `1px solid ${job.allowApplications ? 'rgba(62,207,142,0.3)' : 'var(--border)'}`,
          }}>
            {job.allowApplications ? '✅ Open' : '🔒 Closed'}
          </span>
        )}
      </div>
      {job.organisationName && (
        <div style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '0.5rem' }}>
          🏢 {job.organisationName}
        </div>
      )}
      <div className="job-description-preview">{preview}</div>
      <div className="job-actions">
        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/jobs/${job.id}`)}>
          View Details
        </button>
        {actions}
      </div>
    </div>
  )
}