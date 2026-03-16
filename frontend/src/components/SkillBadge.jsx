export default function SkillBadge({ skill, type = 'matched' }) {
  return <span className={`skill-badge ${type}`}>{skill}</span>
}