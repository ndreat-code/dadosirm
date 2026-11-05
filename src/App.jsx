import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Smartphone, Monitor, Maximize2, Minimize2, Wifi, BatteryCharging, ArrowLeft, Columns2 } from 'lucide-react'
import Sidebar from './components/Sidebar'
import SidebarPc from './components/Sidebar.pc'
import SmartNotificationToast from './components/SmartNotificationToast'
import Dashboard from './pages/Dashboard'
import DashboardPc from './pages/Dashboard.pc'
import DashboardB from './pages/DashboardB'
import Companies from './pages/Companies'
import CompaniesPc from './pages/Companies.pc'
import Activities from './pages/Activities'
import ActivitiesPc from './pages/Activities.pc'
import Calendar from './pages/Calendar'
import CalendarPc from './pages/Calendar.pc'
import Opportunities from './pages/Opportunities'
import OpportunitiesPc from './pages/Opportunities.pc'
import CallReports from './pages/CallReports'
import Settings from './pages/Settings'
import Inventory from './pages/Inventory'
import InventoryPc from './pages/Inventory.pc'
import Leads from './pages/Leads'
import Users from './pages/Users'
import Appunti from './pages/Appunti'
import AppuntiPc from './pages/Appunti.pc'
import Crm from './pages/Crm'
import CrmPc from './pages/Crm.pc'
import Automations from './pages/Automations'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DeviceModeProvider, MobileInstanceScope, useDeviceMode } from './context/DeviceModeContext'
import { useSwipeNavigation } from './hooks/useSwipeNavigation'

function ProtectedRoute({ permission, children, fallback = '/calendar' }) {
  const { canAccess } = useAuth()
  if (!canAccess(permission)) {
    return <Navigate to={fallback} replace />
  }
  return children
}

// Avviso per le 3 sezioni riservate esclusivamente alla versione da PC
function PcOnlyRoute({ sectionTitle, children }) {
  const { isMobileApp, setDeviceMode } = useDeviceMode()
  const navigate = useNavigate()

  if (!isMobileApp) {
    return children
  }

  return (
    <div
      className="flex-1 h-full flex flex-col items-center justify-center p-6 text-center select-none"
      style={{
        background: 'linear-gradient(180deg, #f0f8fd 0%, #e6f3fa 100%)',
        fontFamily: '"Switzer", sans-serif',
      }}
    >
      <div className="bg-white border border-[#cce5f6] rounded-3xl p-6 max-w-xs w-full shadow-lg flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-[#00d2ff] flex items-center justify-center shadow-md">
          <Monitor size={24} />
        </div>
        <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
          {sectionTitle}
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Questa sezione avanzata è disponibile esclusivamente nella <strong>Versione da PC</strong> del DADO CRM.
        </p>
        <div className="flex flex-col gap-2 w-full mt-2">
          <button
            type="button"
            onClick={() => setDeviceMode('pc')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Monitor size={14} />
            <span>Apri Versione PC</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={13} />
            <span>Torna alla Dashboard Mobile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function MobileStatusBar({ badgeLabel = 'DADO APP' }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(t)
  }, [])
  const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className="w-full h-[26px] px-5 flex items-center justify-between flex-shrink-0 select-none z-30"
      style={{
        backgroundColor: '#1f232a',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        fontFamily: '"Switzer", sans-serif',
      }}
    >
      <span className="text-[11px] font-extrabold text-white tracking-wide">
        {timeStr}
      </span>
      <div className="h-[13px] px-3 rounded-full bg-black/80 border border-white/10 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-300">
          {badgeLabel}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-white/90">
        <span className="text-[9.5px] font-black tracking-tight text-sky-400">5G</span>
        <Wifi size={11} />
        <BatteryCharging size={13} className="text-emerald-400" />
      </div>
    </div>
  )
}

function CrmRoutes({ ActiveDashboard, isMobileApp }) {
  const DashboardComponent = isMobileApp ? ActiveDashboard : DashboardPc
  const CrmComponent = isMobileApp ? Crm : CrmPc
  const CompaniesComponent = isMobileApp ? Companies : CompaniesPc
  const ActivitiesComponent = isMobileApp ? Activities : ActivitiesPc
  const CalendarComponent = isMobileApp ? Calendar : CalendarPc
  const OpportunitiesComponent = isMobileApp ? Opportunities : OpportunitiesPc
  const InventoryComponent = isMobileApp ? Inventory : InventoryPc
  const AppuntiComponent = isMobileApp ? Appunti : AppuntiPc

  return (
    <main className="flex-1 h-full min-h-0 overflow-hidden bg-transparent flex flex-col relative">
      {/* Notifica Smart con bordi quadrati per 5 secondi in alto a destra (solo PC) */}
      <SmartNotificationToast mobile={isMobileApp} />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute permission="dashboard">
              <DashboardComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm"
          element={
            <ProtectedRoute permission="dashboard">
              <CrmComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-a"
          element={
            <ProtectedRoute permission="dashboard">
              <DashboardComponent />
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
          path="/call-reports"
          element={
            <ProtectedRoute permission="dashboard">
              <CallReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute permission="dashboard">
              <Leads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <ProtectedRoute permission="companies">
              <CompaniesComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <ProtectedRoute permission="activities">
              <ActivitiesComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute permission="activities">
              <ActivitiesComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute permission="calendar">
              <CalendarComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/opportunities"
          element={
            <ProtectedRoute permission="dashboard">
              <OpportunitiesComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-opportunities"
          element={
            <ProtectedRoute permission="dashboard">
              <OpportunitiesComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute permission="inventory">
              <InventoryComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventario"
          element={
            <ProtectedRoute permission="inventory">
              <InventoryComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appunti"
          element={
            <ProtectedRoute permission="dashboard">
              <AppuntiComponent />
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
            <PcOnlyRoute sectionTitle="Gestione Utenti & Permessi">
              <ProtectedRoute permission="users">
                <Users />
              </ProtectedRoute>
            </PcOnlyRoute>
          }
        />
        <Route
          path="/utenti"
          element={
            <PcOnlyRoute sectionTitle="Gestione Utenti & Permessi">
              <ProtectedRoute permission="users">
                <Users />
              </ProtectedRoute>
            </PcOnlyRoute>
          }
        />
        <Route
          path="/automations"
          element={
            <PcOnlyRoute sectionTitle="Automazioni & Trigger">
              <ProtectedRoute permission="dashboard">
                <Automations />
              </ProtectedRoute>
            </PcOnlyRoute>
          }
        />
        <Route
          path="/automazioni"
          element={<Navigate to="/automations" replace />}
        />
        <Route
          path="/settings"
          element={
            <PcOnlyRoute sectionTitle="Opzioni & Impostazioni Studio">
              <Settings />
            </PcOnlyRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  )
}

/**
 * Contenitore Mobile App con supporto per la Barra Laterale a Scomparsa:
 * - Quando `retractableSidebar={true}`, la barra laterale parte nascosta (`openProgress = 0`)
 *   e riappare SOLO trascinando con il dito (touch o cursore/pointer) dal bordo esterno
 *   dello schermo verso il centro dello schermo, posizionandosi esattamente "così come si vede ora" (62px).
 * - Trascinando dal centro/barra verso il bordo esterno sinistro, la barra torna a scomparire.
 */
function MobileAppSurface({
  retractableSidebar = false,
  ActiveDashboard,
  isMobileApp,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(!retractableSidebar)
  const [dragProgress, setDragProgress] = useState(null) // null quando non in trascinamento, oppure 0..1
  const containerRef = useRef(null)
  const gestureRef = useRef({
    active: false,
    mode: null, // 'open-from-left' | 'open-from-right' | 'close-to-left'
    startX: 0,
    startY: 0,
    startProgress: 0,
    moved: false,
  })

  // Sincronizza se cambia la prop retractableSidebar
  useEffect(() => {
    setIsSidebarOpen(!retractableSidebar)
    setDragProgress(null)
  }, [retractableSidebar])

  const currentProgress = !retractableSidebar
    ? 1
    : dragProgress !== null
    ? dragProgress
    : isSidebarOpen
    ? 1
    : 0

  // Restituisce l'elemento con scroll orizzontale attivo se presente
  const getHorizontalScroller = (target) => {
    if (!target || typeof target.closest !== 'function') return null
    if (target.closest('input, textarea, select')) return 'input'
    let el = target instanceof HTMLElement ? target : target.parentElement
    while (el && el !== containerRef.current) {
      const style = window.getComputedStyle(el)
      const overflowX = style.overflowX
      if (
        (overflowX === 'auto' || overflowX === 'scroll') &&
        el.scrollWidth > el.clientWidth + 2
      ) {
        return el
      }
      el = el.parentElement
    }
    return null
  }

  const beginEdgeGesture = (clientX, clientY, forcedEdge = false, target = null) => {
    if (!retractableSidebar || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const relX = clientX - rect.left
    const width = rect.width || 490
    const scroller = getHorizontalScroller(target)
    if (scroller === 'input' && !forcedEdge) return

    if (!isSidebarOpen) {
      // Un contenitore scrollabile orizzontalmente usa il gesto da sinistra a destra (deltaX > 0)
      // SOLO se è già stato scrollato verso destra (scrollLeft > 4). Se è a inizio riga (scrollLeft <= 4),
      // lo swipe da sinistra verso il centro apre sempre la barra laterale.
      const scrollerBlocksRightSwipe =
        scroller && typeof scroller === 'object' && scroller.scrollLeft > 4
      const isLeftEdge = forcedEdge || relX <= (scrollerBlocksRightSwipe ? 24 : 58)
      const isLeftToCenterZone = !scrollerBlocksRightSwipe && relX <= width * 0.65

      if (isLeftEdge || isLeftToCenterZone) {
        gestureRef.current = {
          active: true,
          mode: 'open-from-left',
          isEdgeZone: isLeftEdge,
          startX: clientX,
          startY: clientY,
          startProgress: 0,
          moved: false,
        }
      } else if (relX >= width - 38) {
        gestureRef.current = {
          active: true,
          mode: 'open-from-right',
          isEdgeZone: true,
          startX: clientX,
          startY: clientY,
          startProgress: 0,
          moved: false,
        }
      }
    } else {
      // Quando la barra è visibile: consente di nasconderla trascinando verso sinistra
      // sia partendo dalla barra/bordo sinistro (<= 88px), sia da qualunque punto dello schermo fuori da uno scroller orizzontale
      const scrollerBlocksLeftSwipe =
        scroller &&
        typeof scroller === 'object' &&
        scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 4
      if (relX <= 88 || (!scrollerBlocksLeftSwipe && relX <= width * 0.85)) {
        gestureRef.current = {
          active: true,
          mode: 'close-to-left',
          isEdgeZone: relX <= 88,
          startX: clientX,
          startY: clientY,
          startProgress: 1,
          moved: false,
        }
      }
    }
  }

  const moveEdgeGesture = (clientX, clientY) => {
    const g = gestureRef.current
    if (!g.active || !retractableSidebar) return

    const deltaX = clientX - g.startX
    const deltaY = clientY - g.startY

    if (!g.moved) {
      // Se il movimento è verticale (scroll pagina o note), disattiva subito il gesto laterale
      if (Math.abs(deltaY) > Math.abs(deltaX) * 1.15 && Math.abs(deltaY) > 10) {
        g.active = false
        setDragProgress(null)
        return
      }
      const minDeltaX = g.isEdgeZone ? 4 : 10
      if (Math.abs(deltaX) < minDeltaX) return
      if (!g.isEdgeZone && Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return
      g.moved = true
    }

    if (g.mode === 'open-from-left') {
      if (deltaX <= 0) {
        setDragProgress(0)
        return
      }
      const next = Math.max(0, Math.min(1, deltaX / 58))
      setDragProgress(next)
      if (deltaX >= 44) {
        setIsSidebarOpen(true)
      }
    } else if (g.mode === 'open-from-right') {
      const inwardDelta = -deltaX // da destra verso il centro dello schermo
      if (inwardDelta <= 0) {
        setDragProgress(0)
        return
      }
      const next = Math.max(0, Math.min(1, inwardDelta / 58))
      setDragProgress(next)
      if (inwardDelta >= 44) {
        setIsSidebarOpen(true)
      }
    } else if (g.mode === 'close-to-left') {
      if (deltaX >= 0) {
        setDragProgress(1)
        return
      }
      const next = Math.max(0, Math.min(1, 1 + deltaX / 58))
      setDragProgress(next)
    }
  }

  const endEdgeGesture = (clientX) => {
    const g = gestureRef.current
    if (!g.active || !retractableSidebar) return
    const deltaX = typeof clientX === 'number' ? clientX - g.startX : 0

    if (g.moved) {
      if (g.mode === 'open-from-left') {
        setIsSidebarOpen(deltaX >= 15 || (dragProgress !== null && dragProgress >= 0.25))
      } else if (g.mode === 'open-from-right') {
        const inwardDelta = -deltaX
        setIsSidebarOpen(inwardDelta >= 15 || (dragProgress !== null && dragProgress >= 0.25))
      } else if (g.mode === 'close-to-left') {
        if (deltaX <= -15 || (dragProgress !== null && dragProgress <= 0.72)) {
          setIsSidebarOpen(false)
        } else {
          setIsSidebarOpen(true)
        }
      }
    }

    gestureRef.current.active = false
    setDragProgress(null)
  }

  // Listener globali durante il trascinamento col mouse/pointer così non si perde la presa
  useEffect(() => {
    if (!retractableSidebar) return

    const handleWindowPointerMove = (e) => {
      if (!gestureRef.current.active) return
      moveEdgeGesture(e.clientX, e.clientY)
    }

    const handleWindowPointerUp = (e) => {
      if (!gestureRef.current.active) return
      endEdgeGesture(e.clientX)
    }

    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', handleWindowPointerUp)
    window.addEventListener('pointercancel', handleWindowPointerUp)
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
      window.removeEventListener('pointercancel', handleWindowPointerUp)
    }
  })

  return (
    <div
      ref={containerRef}
      onTouchStartCapture={(e) => {
        if (e.touches.length === 1) {
          beginEdgeGesture(e.touches[0].clientX, e.touches[0].clientY, false, e.target)
        }
      }}
      onTouchMoveCapture={(e) => {
        if (e.touches.length === 1) {
          moveEdgeGesture(e.touches[0].clientX, e.touches[0].clientY)
        }
      }}
      onTouchEndCapture={(e) => {
        const lastX = e.changedTouches?.[0]?.clientX
        endEdgeGesture(lastX)
      }}
      onPointerDownCapture={(e) => {
        if (e.pointerType === 'touch') return
        beginEdgeGesture(e.clientX, e.clientY, false, e.target)
      }}
      className={`flex h-full w-full overflow-hidden relative ${isMobileApp ? 'dado-mobile-app' : ''}`}
      style={{
        background: 'linear-gradient(180deg, #2d3139 0%, #22262d 42%, #191b20 100%)',
        touchAction: 'pan-y',
      }}
    >
      {/* Sensore invisibile sul bordo esterno sinistro quando la barra è a scomparsa e chiusa */}
      {retractableSidebar && !isSidebarOpen && (
        <div
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              e.stopPropagation()
              beginEdgeGesture(e.touches[0].clientX, e.touches[0].clientY, true)
            }
          }}
          onPointerDown={(e) => {
            if (e.pointerType === 'touch') return
            e.stopPropagation()
            beginEdgeGesture(e.clientX, e.clientY, true)
          }}
          className="absolute left-0 top-0 bottom-0 w-[22px] z-50 select-none"
          style={{
            cursor: 'ew-resize',
            touchAction: 'none',
          }}
          title="Scorri con il dito dal bordo esterno verso il centro dello schermo per far riapparire la barra laterale"
        >
          {/* Sottile filo luminoso di presa sul bordo esterno sinistro */}
          <div
            className="absolute left-[2px] top-1/2 -translate-y-1/2 w-[3px] h-16 rounded-full pointer-events-none transition-opacity duration-300"
            style={{
              background: 'linear-gradient(180deg, rgba(0,210,255,0) 0%, rgba(0,210,255,0.65) 50%, rgba(0,210,255,0) 100%)',
              boxShadow: '0 0 8px rgba(0,210,255,0.45)',
            }}
          />
        </div>
      )}

      <MobileInstanceScope
        isSwipeCopy={retractableSidebar}
        sidebarOpenProgress={currentProgress}
      >
        {isMobileApp ? (
          <Sidebar
            retractable={retractableSidebar}
            openProgress={currentProgress}
            isDragging={dragProgress !== null}
          />
        ) : (
          <SidebarPc />
        )}

        <CrmRoutes ActiveDashboard={ActiveDashboard} isMobileApp={isMobileApp} />
      </MobileInstanceScope>
    </div>
  )
}

function PhoneFrame({
  retractableSidebar = false,
  badgeLabel = 'DADO APP',
  ActiveDashboard,
  isMobileApp,
  compactDual = false,
}) {
  return (
    <div
      className="relative flex flex-col overflow-hidden transition-all duration-300"
      style={{
        width: compactDual ? '465px' : '490px',
        maxWidth: compactDual ? '48vw' : '96vw',
        height: '95vh',
        maxHeight: '920px',
        borderRadius: '42px',
        border: '8px solid #2b313d',
        boxShadow:
          '0 30px 80px rgba(0, 0, 0, 0.75), 0 0 0 2px rgba(255, 255, 255, 0.12), 0 0 45px rgba(0, 210, 255, 0.14)',
        backgroundColor: '#191b20',
      }}
    >
      <MobileStatusBar badgeLabel={badgeLabel} />
      <div className="flex-1 min-h-0 w-full flex overflow-hidden relative">
        <MobileAppSurface
          retractableSidebar={retractableSidebar}
          ActiveDashboard={ActiveDashboard}
          isMobileApp={isMobileApp}
        />
      </div>
      {/* Home Indicator Bar stile iOS */}
      <div
        className="w-full h-[14px] flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#191b20' }}
      >
        <div className="w-28 h-1 rounded-full bg-white/30" />
      </div>
    </div>
  )
}

function MainLayout() {
  const isPort3005 = typeof window !== 'undefined' && window.location.port === '3005'
  const ActiveDashboard = isPort3005 ? DashboardB : Dashboard
  useSwipeNavigation()
  const {
    deviceMode,
    mobileShellStyle,
    isMobileApp,
    isSwipeCopy,
    isDualMobile,
    isNarrowViewport,
    setDeviceMode,
    setMobileShellStyle,
  } = useDeviceMode()

  if (!isMobileApp) {
    return (
      <div
        className="flex h-dvh w-screen overflow-hidden relative"
        style={{
          background: 'linear-gradient(180deg, #2d3139 0%, #22262d 42%, #191b20 100%)',
        }}
      >
        <SidebarPc />
        <CrmRoutes ActiveDashboard={ActiveDashboard} isMobileApp={false} />
      </div>
    )
  }

  // Su telefono/tablet reali (schermo touch) niente selettore modalità né cornice smartphone:
  // l'app occupa tutto lo schermo per la massima visibilità.
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  const showPhoneFrame = isMobileApp && !isNarrowViewport && !isTouchDevice && mobileShellStyle === 'phone'

  return (
    <div
      className="h-dvh w-screen overflow-hidden relative flex items-center justify-center"
      style={{
        background: showPhoneFrame
          ? 'radial-gradient(circle at 50% 25%, #1e293b 0%, #0f172a 55%, #070b12 100%)'
          : 'linear-gradient(180deg, #2d3139 0%, #22262d 42%, #191b20 100%)',
        fontFamily: '"Switzer", sans-serif',
      }}
    >
      {/* ── Switcher Flottante (visibile solo su porta 3006 / Mobile App) ── */}
      {!isNarrowViewport && !isTouchDevice && (
        <div
          className="fixed top-2 right-3 z-[90] flex items-center gap-1 bg-slate-900/92 backdrop-blur-md border border-slate-700/80 p-1 rounded-full shadow-lg select-none"
          style={{ fontFamily: '"Switzer", sans-serif' }}
        >
          <button
            type="button"
            onClick={() => setDeviceMode('mobile-swipe')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
              deviceMode === 'mobile-swipe'
                ? 'bg-[#00d2ff] text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Copia Mobile con Barra Laterale a Scomparsa (scorri con il dito dal bordo esterno verso il centro dello schermo per farla riapparire)"
          >
            <Smartphone size={11} />
            <span>Copia Barra a Scomparsa</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
              deviceMode === 'mobile'
                ? 'bg-sky-400 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Versione Mobile App con Barra Laterale Fissa"
          >
            <Smartphone size={11} />
            <span>Mobile Barra Fissa</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceMode('mobile-dual')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
              deviceMode === 'mobile-dual'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Mostra entrambe le copie Mobile affiancate (Barra Fissa + Copia Barra a Scomparsa)"
          >
            <Columns2 size={11} />
            <span>2 Copie Affiancate</span>
          </button>

          {isMobileApp && !isDualMobile && (
            <button
              type="button"
              onClick={() => setMobileShellStyle(mobileShellStyle === 'phone' ? 'full' : 'phone')}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[9.5px] font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-600/70 transition-all cursor-pointer"
              title={mobileShellStyle === 'phone' ? 'Espandi Mobile App a tutta finestra' : 'Mostra nella cornice Smartphone'}
            >
              {mobileShellStyle === 'phone' ? <Maximize2 size={10} /> : <Minimize2 size={10} />}
              <span>{mobileShellStyle === 'phone' ? 'Espandi' : 'Smartphone'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setDeviceMode('pc')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
              deviceMode === 'pc'
                ? 'bg-emerald-400 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Passa alla Versione PC completa (con Utenti & Permessi, Opzioni, Automazioni & Trigger, Calendar Week e Note)"
          >
            <Monitor size={11} />
            <span>Versione PC</span>
          </button>
        </div>
      )}

      {isDualMobile && !isNarrowViewport && !isTouchDevice ? (
        /* ── Vista Doppio Smartphone Affiancato: Originale (Barra Fissa) + Copia (Barra a Scomparsa con Swipe dal bordo) ── */
        <div className="flex items-center justify-center gap-5 w-full h-full px-3">
          <PhoneFrame
            retractableSidebar={false}
            badgeLabel="BARRA FISSA"
            ActiveDashboard={ActiveDashboard}
            isMobileApp={true}
            compactDual={true}
          />
          <PhoneFrame
            retractableSidebar={true}
            badgeLabel="COPIA SWIPE BORDO"
            ActiveDashboard={ActiveDashboard}
            isMobileApp={true}
            compactDual={true}
          />
        </div>
      ) : showPhoneFrame ? (
        /* ── Scocca Smartphone Titanium Interattiva per la Mobile App ── */
        <PhoneFrame
          retractableSidebar={isSwipeCopy}
          badgeLabel={isSwipeCopy ? 'DADO SWIPE APP' : 'DADO APP'}
          ActiveDashboard={ActiveDashboard}
          isMobileApp={isMobileApp}
          compactDual={false}
        />
      ) : (
        <MobileAppSurface
          retractableSidebar={isMobileApp && isSwipeCopy}
          ActiveDashboard={ActiveDashboard}
          isMobileApp={isMobileApp}
        />
      )}
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
      <DeviceModeProvider>
        <AppRoutes />
      </DeviceModeProvider>
    </AuthProvider>
  )
}
