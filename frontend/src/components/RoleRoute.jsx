import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  const allowed = allowedRoles.some(r => user?.roles?.includes(r))
  if (!allowed) return <Navigate to="/dashboard" replace />
  return children
}