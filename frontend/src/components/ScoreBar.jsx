export default function ScoreBar({ label, value }) {
  const pct = Math.round((value || 0) * 100)
  return (
    <div className="score-bar-wrapper">
      <div className="score-bar-label">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}