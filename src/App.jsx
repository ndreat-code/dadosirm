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
import Appunti from './pages/Appunti'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useSwipeNavigation } from './hooks/useSwipeNavigation'

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
  useSwipeNavigation()

  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{
        background: 'linear-gradient(180deg, #2d3139 0%, #22262d 42%, #191b20 100%)',
      }}
    >
      <Sidebar />
      <main className="flex-1 h-screen min-h-0 overflow-hidden bg-transparent flex flex-col">
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
            path="/appunti"
            element={
              <ProtectedRoute permission="dashboard">
                <Appunti />
              </ProtectedRoute>
            }
          />
          <Route
            path="/idee"
            element={<Navigate to="/appunti" replace />}
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Pagine Pubbliche di Autenticazione */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/registrazione" element={<Register />} />

      {/* Tutte le altre sezioni interne del CRM */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <MainLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
