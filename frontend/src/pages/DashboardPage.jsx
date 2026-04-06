import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DashboardPage() {
  const { user, isRecruiter, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [resumes, setResumes]   = useState([])
  const [jobs, setJobs]         = useState([])
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/api/resumes'),
      api.get('/api/jobs/public'),
      api.get('/api/analysis/history'),
    ]).then(([r, j, h]) => {
      if (r.status === 'fulfilled') setResumes(r.value.data)
      if (j.status === 'fulfilled') setJobs(j.value.data)
      if (h.status === 'fulfilled') setHistory(h.value.data)
    }).finally(() => setLoading(false))
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const avgScore = history.length
    ? (history.reduce((a, h) => a + (h.qualificationScore || 0), 0) / history.length).toFixed(1)
    : null

  if (loading) return <LoadingSpinner text="Loading dashboard…" />

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--surface), var(--surface2))',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '2rem 2.5rem',
        marginBottom: '2rem',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '0.2rem' }}>
            {greeting} 👋
          </p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Welcome back, <span style={{ color: 'var(--accent)' }}>{firstName}</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {history.length > 0
              ? `You've run ${history.length} analysis session${history.length !== 1 ? 's' : ''}.`
              : 'Upload a resume and run your first analysis to get started.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/analyze" className="btn btn-primary">🔍 Analyze Resume</Link>
          {resumes.length === 0 && (
            <Link to="/resumes" className="btn btn-secondary">📄 Upload Resume</Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon="📄" value={resumes.length} label="Resumes"        accent="var(--accent)"  onClick={() => navigate('/resumes')} />
        <StatCard icon="🔍" value={history.length} label="Analyses Run"   accent="var(--success)" onClick={() => navigate('/history')} />
        <StatCard icon="💼" value={jobs.length}    label="Active Jobs"    accent="#f59e0b"         onClick={() => navigate('/jobs')} />
        {avgScore && <StatCard icon="🎯" value={`${avgScore}%`} label="Avg. Match" accent="var(--accent)" onClick={() => navigate('/history')} />}
      </div>

      {/* Two-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Quick Actions */}
        <div className="card">
          <SectionTitle>Quick Actions</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <QuickAction icon="📄" label="Manage Resumes"   sub="Upload & organise your CVs"         to="/resumes" />
            <QuickAction icon="🔍" label="Analyze Resume"   sub="Match against a job description"    to="/analyze" />
            <QuickAction icon="💼" label="Browse Jobs"      sub="Explore open positions"             to="/jobs" />
            <QuickAction icon="📋" label="Analysis History" sub="Review your past results"           to="/history" />
            {isRecruiter() && <QuickAction icon="➕" label="Post a Job"    sub="Create a new listing"          to="/jobs/create" />}
            {isRecruiter() && <QuickAction icon="🗂" label="My Postings"   sub="Manage your job listings"      to="/jobs/my" />}
            {isAdmin()     && <QuickAction icon="🛡" label="Admin Panel"   sub="Manage users & jobs"           to="/admin" />}
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="card">
          <SectionTitle>Recent Analyses</SectionTitle>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>No analysis history yet.</p>
              <Link to="/analyze" className="btn btn-ghost btn-sm">Run your first analysis →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {history.slice(0, 5).map((entry, i) => {
                const score = entry.qualificationScore || 0
                const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--accent)' : 'var(--danger)'
                const date  = new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                return (
                  <Link key={entry.id || i} to={`/history/${entry.id}`} state={{ entry }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.7rem 0.85rem',
                      background: 'var(--surface2)',
                      borderRadius: 10, border: '1px solid var(--border)',
                      textDecoration: 'none', transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: `${color}18`, border: `2px solid ${color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.75rem', color, flexShrink: 0,
                    }}>
                      {score.toFixed(0)}%
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.jdText ? entry.jdText.substring(0, 45) + '…' : 'Resume Analysis'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{date}</div>
                    </div>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>›</span>
                  </Link>
                )
              })}
              {history.length > 5 && (
                <Link to="/history" className="btn btn-ghost btn-sm" style={{ alignSelf: 'center', marginTop: '0.25rem' }}>
                  View all {history.length} →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Empty resume prompt */}
      {resumes.length === 0 && (
        <div style={{
          marginTop: '1.5rem', padding: '1.5rem',
          background: 'rgba(124,106,247,0.06)',
          border: '1px dashed rgba(124,106,247,0.4)',
          borderRadius: 12, textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📄</div>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No resume uploaded yet</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Upload your resume to start matching against job descriptions.
          </p>
          <Link to="/resumes" className="btn btn-primary btn-sm">Upload Resume →</Link>
        </div>
      )}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)',
      textTransform: 'uppercase', letterSpacing: '0.07em',
      marginBottom: '1rem', paddingBottom: '0.5rem',
      borderBottom: '1px solid var(--border)',
    }}>
      {children}
    </div>
  )
}

function StatCard({ icon, value, label, accent, onClick }) {
  return (
    <div className="card" onClick={onClick}
      style={{ cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.2s, transform 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}>
      <div style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{icon}</div>
      <div style={{ fontSize: '1.7rem', fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>{label}</div>
    </div>
  )
}

function QuickAction({ icon, label, sub, to }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: '0.85rem',
      padding: '0.7rem 0.9rem',
      background: 'var(--surface2)', borderRadius: 10,
      border: '1px solid var(--border)', textDecoration: 'none',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{label}</div>
        <div style={{ fontSize: '0.73rem', color: 'var(--muted)' }}>{sub}</div>
      </div>
      <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: '0.875rem' }}>›</span>
    </Link>
  )
}