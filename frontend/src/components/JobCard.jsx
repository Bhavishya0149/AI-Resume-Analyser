import { useNavigate } from 'react-router-dom'

export default function JobCard({ job, actions }) {
  const navigate = useNavigate()
  const preview = job.descriptionText
    ? job.descriptionText.substring(0, 120) + (job.descriptionText.length > 120 ? '…' : '')
    : 'No description provided.'

  return (
    <div className="job-card">
      <div className="job-title">{job.title}</div>
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