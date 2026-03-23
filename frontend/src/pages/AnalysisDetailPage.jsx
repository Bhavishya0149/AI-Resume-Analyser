import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AnalysisResult from '../components/AnalysisResult'

function getGrade(score) {
  const p = (score || 0) * 100
  if (p >= 85) return { label: 'A+', color: '#3ecf8e' }
  if (p >= 75) return { label: 'A',  color: '#3ecf8e' }
  if (p >= 65) return { label: 'B',  color: '#7c6af7' }
  if (p >= 50) return { label: 'C',  color: '#f59e0b' }
  return        { label: 'D',  color: '#e05555' }
}

export default function AnalysisDetailPage() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const { id }     = useParams()
  const entry      = state?.entry

  if (!entry) {
    return (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>
            ← Back to History
          </button>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Entry not found</h3>
          <p>
            This analysis entry could not be loaded.{' '}
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>
              Go back to history.
            </button>
          </p>
        </div>
      </div>
    )
  }

  const grade = getGrade(entry.qualificationScore)
  const date  = new Date(entry.createdAt).toLocaleString()

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>
          ← Back to History
        </button>
      </div>

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Analysis <span>Result</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Performed on {date}
          </p>
        </div>
        <div style={{
          padding: '0.4rem 1rem',
          borderRadius: 20,
          border: `2px solid ${grade.color}`,
          color: grade.color,
          fontWeight: 700,
          fontSize: '0.9rem',
          background: `${grade.color}15`
        }}>
          Grade {grade.label}
        </div>
      </div>

      {/* Main result */}
      <AnalysisResult result={entry} />

      {/* JD Preview (if available) */}
      {entry.jdText && (
        <div className="card" style={{ marginTop: '1.25rem' }}>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--muted)', userSelect: 'none' }}>
              📋 View Job Description
            </summary>
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'var(--surface2)',
              borderRadius: 8,
              fontSize: '0.875rem',
              color: 'var(--muted)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              maxHeight: 300,
              overflowY: 'auto',
            }}>
              {entry.jdText}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}