import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import DashboardB from './pages/DashboardB'
import Companies from './pages/Companies'
import Activities from './pages/Activities'
import Calendar from './pages/Calendar'
import Opportunities from './pages/Opportunities'
import Settings from './pages/Settings'

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
          <Route path="/companies" element={<Companies />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
