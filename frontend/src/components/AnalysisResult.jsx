import ScoreBar from './ScoreBar'
import SkillBadge from './SkillBadge'

export default function AnalysisResult({ result }) {
  if (!result) return null
  return (
    <div className="result-card">
      <div className="result-title">📊 Analysis Result</div>

      <div className="result-section">
        <h4>Scores</h4>
        <ScoreBar label="Qualification Score"  value={result.qualificationScore} />
        <ScoreBar label="TF-IDF Similarity"    value={result.tfidfSimilarity} />
        <ScoreBar label="Embedding Similarity" value={result.embeddingSimilarity} />
        <ScoreBar label="Skill Match"          value={result.skillMatchPercentage / 100} />
      </div>

      {result.matchedSkills?.length > 0 && (
        <div className="result-section">
          <h4>✅ Matched Skills</h4>
          <div className="skill-badges">
            {result.matchedSkills.map(s => <SkillBadge key={s} skill={s} type="matched" />)}
          </div>
        </div>
      )}

      {result.missingSkills?.length > 0 && (
        <div className="result-section">
          <h4>❌ Missing Skills</h4>
          <div className="skill-badges">
            {result.missingSkills.map(s => <SkillBadge key={s} skill={s} type="missing" />)}
          </div>
        </div>
      )}
    </div>
  )
}