export default function LeaderboardTable({ entries }) {
  if (!entries?.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏆</div>
        <h3>No applicants yet</h3>
        <p>Be the first to apply!</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Applicant ID</th>
            <th>Resume ID</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={entry.id || i}>
              <td>
                <span style={{ fontWeight: 700, color: i < 3 ? 'var(--accent)' : 'var(--text)' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
              </td>
              <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {entry.userId?.substring(0, 12)}…
              </td>
              <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {entry.resumeId?.substring(0, 12)}…
              </td>
              <td>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                  {((entry.qualificationScore || 0) * 100).toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}