import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import LoadingSpinner from './components/LoadingSpinner'
import LoginPage from './pages/auth/LoginPage'

const DashboardPage      = lazy(() => import('./pages/DashboardPage'))
const ResumesPage        = lazy(() => import('./pages/ResumesPage'))
const JobListingsPage    = lazy(() => import('./pages/jobs/JobListingsPage'))
const JobDetailsPage     = lazy(() => import('./pages/jobs/JobDetailsPage'))
const JobLeaderboard     = lazy(() => import('./pages/jobs/JobLeaderboardPage'))
const CreateJobPage      = lazy(() => import('./pages/jobs/CreateJobPage'))
const MyJobsPage         = lazy(() => import('./pages/jobs/MyJobsPage'))
const AnalyzePage        = lazy(() => import('./pages/AnalyzePage'))
const HistoryPage        = lazy(() => import('./pages/HistoryPage'))
const AnalysisDetailPage = lazy(() => import('./pages/AnalysisDetailPage'))
const ProfilePage        = lazy(() => import('./pages/ProfilePage'))
const AdminPage          = lazy(() => import('./pages/AdminPage'))
const EditJobPage        = lazy(() => import('./pages/jobs/EditJobPage'))

const Fallback = () => (
  <div className="loading-page"><LoadingSpinner /></div>
)

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard"            element={<DashboardPage />} />
          <Route path="/resumes"              element={<ResumesPage />} />
          <Route path="/jobs"                 element={<JobListingsPage />} />
          <Route path="/jobs/create"          element={
            <RoleRoute allowedRoles={['RECRUITER','ADMIN']}>
              <CreateJobPage />
            </RoleRoute>
          }/>
          <Route path="/jobs/my"              element={<MyJobsPage />} />
          <Route path="/jobs/:id"             element={<JobDetailsPage />} />
          <Route path="/jobs/:id/leaderboard" element={<JobLeaderboard />} />
          <Route path="/analyze"              element={<AnalyzePage />} />
          <Route path="/history"              element={<HistoryPage />} />
          <Route path="/history/:id"          element={<AnalysisDetailPage />} />
          <Route path="/profile"              element={<ProfilePage />} />
          <Route path="/admin"                element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminPage />
            </RoleRoute>
          }/>
          <Route path="/jobs/:id/edit"        element={
            <RoleRoute allowedRoles={['RECRUITER','ADMIN']}>
              <EditJobPage />
            </RoleRoute>
          }/>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}