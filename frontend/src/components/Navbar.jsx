import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout, isAdmin, isRecruiter } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : '?'

  return (
    <nav className="navbar">
      {/* Logo */}
      <NavLink to="/dashboard" className="navbar-logo" style={{ textDecoration: 'none' }}>
        <span>🧠</span> ResumeAI
      </NavLink>

      {/* Nav links */}
      <ul className="navbar-nav">
        <li><NavLink to="/dashboard">Dashboard</NavLink></li>
        <li><NavLink to="/resumes">Resumes</NavLink></li>
        <li><NavLink to="/jobs">Jobs</NavLink></li>
        <li><NavLink to="/analyze">Analyze</NavLink></li>
        <li><NavLink to="/history">History</NavLink></li>
        {isRecruiter() && <li><NavLink to="/jobs/my">My Jobs</NavLink></li>}
        {isAdmin()     && <li><NavLink to="/admin">Admin</NavLink></li>}
      </ul>

      {/* Right section */}
      <div className="navbar-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Avatar dropdown */}
        <div className="avatar-wrapper" ref={dropdownRef}>
          <button
            className="avatar-btn"
            onClick={() => setDropdownOpen(o => !o)}
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            {user?.profilePictureUrl
              ? <img src={user.profilePictureUrl} alt="avatar" />
              : initials
            }
          </button>

          {dropdownOpen && (
            <div className="avatar-dropdown">
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{user?.email}</div>
              </div>
              <NavLink to="/profile" onClick={() => setDropdownOpen(false)}>
                👤 Profile
              </NavLink>
              <button className="logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}