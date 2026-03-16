import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  const login = (authResponse) => {
    const { accessToken, user: userInfo } = authResponse
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(userInfo))
    setToken(accessToken)
    setUser(userInfo)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const hasRole = (role) => user?.roles?.includes(role)
  const isAdmin = () => hasRole('ADMIN')
  const isRecruiter = () => hasRole('RECRUITER') || isAdmin()

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, isAdmin, isRecruiter }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)