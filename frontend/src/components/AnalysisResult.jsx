import { useEffect, useState } from 'react'
import SkillBadge from './SkillBadge'

function getGrade(score) {
  const p = (score || 0) // ✅ already in 0–100
  if (p >= 85) return { label: 'A+', color: '#3ecf8e' }
  if (p >= 75) return { label: 'A',  color: '#3ecf8e' }
  if (p >= 65) return { label: 'B',  color: '#7c6af7' }
  if (p >= 50) return { label: 'C',  color: '#f59e0b' }
  return        { label: 'D',  color: '#e05555' }
}

function getVerdict(score) {
  const p = (score || 0) // ✅ no multiplication
  if (p >= 85) return 'Excellent fit! You match this role very well.'
  if (p >= 65) return 'Good match. Consider addressing the missing skills.'
  if (p >= 50) return 'Moderate match. Several skills need improvement.'
  return 'Low match. Significant gaps between resume and requirements.'
}

function CircularScore({ value }) {
  const [animated, setAnimated] = useState(0)
  const pct  = Math.round(value || 0) // ✅ already percentage
  const r    = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (animated / 100) * circ
  const grade = getGrade(value)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(pct), 120)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div className="circular-score-wrap">
      <svg width="140" height="140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--surface2)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke={grade.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)', transformOrigin: 'center', transform: 'rotate(-90deg)' }}
        />
      </svg>
      <div className="circular-score-center">
        <span className="circular-pct" style={{ color: grade.color }}>{pct}%</span>
        <span className="circular-grade" style={{ color: grade.color }}>{grade.label}</span>
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon }) {
  const pct = Math.round(value || 0) // ✅ no multiplication
  const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--accent)' : 'var(--danger)'
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-value" style={{ color }}>{pct}%</div>
      <div className="metric-label">{label}</div>
    </div>
  )
}

export default function AnalysisResult({ result }) {
  if (!result) return null
  const grade = getGrade(result.qualificationScore)
  const matchedCount = result.matchedSkills?.length || 0
  const missingCount = result.missingSkills?.length  || 0

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Hero banner */}
      <div className="analysis-hero">
        <CircularScore value={result.qualificationScore} />
        <div className="analysis-verdict">
          <div className="analysis-grade-label">Overall Match Score</div>
          <div className="analysis-grade-value" style={{ color: grade.color }}>
            {grade.label} Grade
          </div>
          <div className="analysis-verdict-text">{getVerdict(result.qualificationScore)}</div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="metric-cards-grid">
        <MetricCard label="TF-IDF Similarity"    value={result.tfidfSimilarity}        icon="📊" />
        <MetricCard label="Embedding Similarity" value={result.embeddingSimilarity}     icon="🧬" />
        <MetricCard label="Skill Match"          value={result.skillMatchPercentage}    icon="🎯" />
      </div>

      {/* Skills */}
      <div className="skills-grid">
        <div className="skills-panel">
          <div className="skills-panel-header">
            <span>✅</span>
            <span className="skills-panel-title">Matched Skills</span>
            <span
              className="skills-count"
              style={{ background: 'rgba(62,207,142,0.15)', color: 'var(--success)', border: '1px solid rgba(62,207,142,0.3)' }}
            >
              {matchedCount}
            </span>
          </div>
          {matchedCount > 0
            ? <div className="skill-badges">{result.matchedSkills.map(s => <SkillBadge key={s} skill={s} type="matched" />)}</div>
            : <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No matched skills detected.</p>
          }
        </div>

        <div className="skills-panel">
          <div className="skills-panel-header">
            <span>🚧</span>
            <span className="skills-panel-title">Missing Skills</span>
            <span
              className="skills-count"
              style={{ background: 'rgba(224,85,85,0.12)', color: 'var(--danger)', border: '1px solid rgba(224,85,85,0.3)' }}
            >
              {missingCount}
            </span>
          </div>
          {missingCount > 0
            ? <div className="skill-badges">{result.missingSkills.map(s => <SkillBadge key={s} skill={s} type="missing" />)}</div>
            : <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No missing skills! You're a perfect fit. 🎉</p>
          }
        </div>
      </div>
    </div>
  )
}