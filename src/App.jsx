import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  const isPort3005 = typeof window !== 'undefined' && window.location.port === '3005'
  const ActiveDashboard = isPort3005 ? DashboardB : Dashboard

  return (
    <div className="flex h-screen overflow-hidden bg-[#111111]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ActiveDashboard />} />
          <Route path="/dashboard-a" element={<Dashboard />} />
          <Route path="/dashboard-b" element={<DashboardB />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventario" element={<Inventory />} />
          <Route path="/users" element={<Users />} />
          <Route path="/utenti" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
