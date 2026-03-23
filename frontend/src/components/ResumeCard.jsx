export default function ResumeCard({ resume, onDelete, onAnalyze, onApply }) {
  const date = new Date(resume.createdAt).toLocaleDateString()
  const ext  = resume.fileName?.split('.').pop()?.toUpperCase() || 'FILE'

  const handleView = () => {
    if (resume.cloudinaryUrl) {
      window.open(resume.cloudinaryUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="resume-card">
      <div className="resume-icon">
        {ext === 'PDF' ? '📄' : ext === 'DOCX' ? '📝' : '📃'}
      </div>
      <div className="resume-info">
        <div className="resume-name">{resume.fileName}</div>
        <div className="resume-date">Uploaded {date}</div>
      </div>
      <div className="resume-actions">
        {resume.cloudinaryUrl && (
          <button className="btn btn-ghost btn-sm" onClick={handleView} title="View file">
            👁 View
          </button>
        )}
        {onAnalyze && (
          <button className="btn btn-secondary btn-sm" onClick={() => onAnalyze(resume)}>
            🔍 Analyze
          </button>
        )}
        {onApply && (
          <button className="btn btn-secondary btn-sm" onClick={() => onApply(resume)}>
            📨 Apply
          </button>
        )}
        {onDelete && (
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(resume.id)}>
            🗑
          </button>
        )}
      </div>
    </div>
  )
}