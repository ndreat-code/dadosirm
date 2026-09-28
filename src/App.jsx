import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import DashboardB from './pages/DashboardB'
import Companies from './pages/Companies'
import Activities from './pages/Activities'
import Calendar from './pages/Calendar'
import Opportunities from './pages/Opportunities'
import Settings from './pages/Settings'
import Inventory from './pages/Inventory'
import Leads from './pages/Leads'
import Users from './pages/Users'
import { AuthProvider, useAuth } from './context/AuthContext'

function ProtectedRoute({ permission, children, fallback = '/calendar' }) {
  const { canAccess } = useAuth()
  if (!canAccess(permission)) {
    return <Navigate to={fallback} replace />
  }
  return children
}

function MainLayout() {
  const isPort3005 = typeof window !== 'undefined' && window.location.port === '3005'
  const ActiveDashboard = isPort3005 ? DashboardB : Dashboard

  return (
    <div className="flex h-screen overflow-hidden bg-[#111111]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute permission="dashboard">
                <ActiveDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-a"
            element={
              <ProtectedRoute permission="dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-b"
            element={
              <ProtectedRoute permission="dashboard">
                <DashboardB />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute permission="leads">
                <Leads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute permission="companies">
                <Companies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <ProtectedRoute permission="activities">
                <Activities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute permission="calendar">
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/opportunities"
            element={
              <ProtectedRoute permission="leads">
                <Opportunities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute permission="inventory">
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventario"
            element={
              <ProtectedRoute permission="inventory">
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute permission="users">
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/utenti"
            element={
              <ProtectedRoute permission="users">
                <Users />
              </ProtectedRoute>
            }
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/calendar" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  )
}
