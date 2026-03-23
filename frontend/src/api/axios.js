import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const token = localStorage.getItem('token')
      const AUTH_PATHS = ['/login', '/signup', '/verify-email', '/reset-password']
      const onAuthPage = AUTH_PATHS.some(p => window.location.pathname.startsWith(p))

      if (token && !onAuthPage) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.replace('/login')
      }
    }
    return Promise.reject(err)
  }
)

export default api