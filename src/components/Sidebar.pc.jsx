import { useState, useEffect, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Settings as SettingsIcon,
} from 'lucide-react'
import Backpack3DIcon from './Backpack3DIcon'
import Company3DIcon from './Company3DIcon'
import TasksChecklistIcon from './TasksChecklistIcon'
import IdeeAppuntiIcon from './IdeeAppuntiIcon'
import UsersRevolvingIcon from './UsersRevolvingIcon'
import CalendarPageFlipIcon from './CalendarPageFlipIcon'
import AutomationsIcon from './AutomationsIcon'
import CrmInboundModal from './CrmInboundModal'
import CrmFuturisticLogo from './CrmFuturisticLogo'
import { useAuth } from '../context/AuthContext'

// Icona Dashboard a 4 elementi: ciascun elemento ha un solo angolo ricurvo (quello all'estremità esterna dell'icona) e 3 angoli retti.
// Al click per entrare o tornare nella schermata, i 4 elementi si allontanano diagonalmente verso l'esterno e si riuniscono fluidamente.
function DashboardIcon({ size = 26, strokeWidth = 2.2, isClicked = false, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ overflow: 'visible' }}
      className={`transition-all duration-300 ${className}`}
    >
      {/* 1. In alto a sinistra (estremità sup-sx curva, altri 3 angoli retti) */}
      <path
        d="M 6 3 H 10 V 12 H 3 V 6 A 3 3 0 0 1 6 3 Z"
        className={
          isClicked
            ? 'animate-tile-burst-1'
            : 'transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5'
        }
        style={{ transformOrigin: 'center' }}
      />
      {/* 2. In alto a destra (estremità sup-dx curva, altri 3 angoli retti) */}
      <path
        d="M 14 3 H 18 A 3 3 0 0 1 21 6 V 8 H 14 Z"
        className={
          isClicked
            ? 'animate-tile-burst-2'
            : 'transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
        }
        style={{ transformOrigin: 'center' }}
      />
      {/* 3. In basso a destra (estremità inf-dx curva, altri 3 angoli retti) */}
      <path
        d="M 14 12 H 21 V 18 A 3 3 0 0 1 18 21 H 14 Z"
        className={
          isClicked
            ? 'animate-tile-burst-3'
            : 'transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5'
        }
        style={{ transformOrigin: 'center' }}
      />
      {/* 4. In basso a sinistra (estremità inf-sx curva, altri 3 angoli retti) */}
      <path
        d="M 3 16 H 10 V 21 H 6 A 3 3 0 0 1 3 18 Z"
        className={
          isClicked
            ? 'animate-tile-burst-4'
            : 'transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:translate-y-0.5'
        }
        style={{ transformOrigin: 'center' }}
      />
    </svg>
  )
}

const getNavItems = (isPort3005) => [
  { to: '/companies',  permission: 'companies',  label: 'Companies',   title: 'Companies (Aziende & Contratti)', icon: Company3DIcon,  sizeOffset: 2.5 },
  {
    to: isPort3005 ? '/activities' : '/tasks',
    permission: 'activities',
    label: isPort3005 ? 'Activities' : 'Tasks',
    title: isPort3005 ? 'Activities (Attività & Task)' : 'Tasks (Attività & Task)',
    icon: TasksChecklistIcon
  },
  { to: '/calendar',   permission: 'calendar',   label: 'Calendar',    title: 'Calendar (Calendario Set)',      icon: CalendarPageFlipIcon },
  { to: '/inventory',  permission: 'inventory',  label: 'Inventario',  title: 'Inventario (Attrezzature)',       icon: Backpack3DIcon, sizeOffset: 2.5 },
  { to: '/automations', permission: 'dashboard',  label: 'Automazioni', title: 'Automazioni (Trigger & Workflow)', icon: AutomationsIcon, sizeOffset: 1.5 },
  { to: '/appunti',    permission: 'dashboard',  label: 'Idee',        title: 'Idee & Appunti (Testo appuntato)', icon: IdeeAppuntiIcon, sizeOffset: 2.0 },
  { to: '/users',      permission: 'users',      label: 'Utenti',      title: 'Utenti & Permessi di Accesso',    icon: UsersRevolvingIcon, sizeOffset: 1.0 },
]

function DadoBrandMark({ size = 20 }) {
  const h = size
  const wD = +(size * 0.8).toFixed(1)
  const wTri = +(size * 0.9).toFixed(1)
  const wO = size
  return (
    <div className="inline-flex items-center gap-[1.5px] leading-none select-none">
      {/* D: verde pieno */}
      <svg width={wD} height={h} viewBox="0 0 16 20" fill="none">
        <path d="M0 0 H4 C10.6 0 16 4.5 16 10 C16 15.5 10.6 20 4 20 H0 Z" fill="#53ba75" />
      </svg>
      {/* △: triangolo rosso pieno */}
      <svg width={wTri} height={h} viewBox="0 0 18 20" fill="none">
        <polygon points="9 0, 18 20, 0 20" fill="#ea3824" />
      </svg>
      {/* D: ciano pieno */}
      <svg width={wD} height={h} viewBox="0 0 16 20" fill="none">
        <path d="M0 0 H4 C10.6 0 16 4.5 16 10 C16 15.5 10.6 20 4 20 H0 Z" fill="#1bb7ed" />
      </svg>
      {/* O: cerchio giallo pieno */}
      <svg width={wO} height={h} viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#fac429" />
      </svg>
    </div>
  )
}

function DadoLogo() {
  return (
    <div
      className="mb-2.5 flex items-center justify-center select-none relative z-10 w-full"
      style={{ height: '26px' }}
    >
      <div className="flex items-center justify-center flex-shrink-0">
        <DadoBrandMark size={17.5} />
      </div>
    </div>
  )
}



export default function Sidebar() {
  const location = useLocation()
  const { currentUser, canAccess, isAdmin, isDipendente, switchUser } = useAuth()

  const isDashboard = location.pathname === '/' || location.pathname === '' || location.pathname.startsWith('/dashboard')
  const isSubSection = ['/activities', '/tasks', '/companies', '/leads', '/opportunities', '/new-opportunities', '/call-reports', '/calendar', '/inventory', '/inventario', '/automations', '/automazioni', '/users', '/utenti', '/settings', '/appunti', '/idee', '/crm'].some(path => location.pathname.startsWith(path))

  const [isAiFocus, setIsAiFocus] = useState(false)
  const [isCalendarCompact, setIsCalendarCompact] = useState(false)
  const [isSettingsSpinning, setIsSettingsSpinning] = useState(false)
  const [isDashboardClicked, setIsDashboardClicked] = useState(false)
  const [usersSwapped, setUsersSwapped] = useState(false)
  const [isUsersRevolving, setIsUsersRevolving] = useState(false)
  const [isAppuntiClicked, setIsAppuntiClicked] = useState(false)
  const [isCalendarClicked, setIsCalendarClicked] = useState(false)
  const [isAutomationsClicked, setIsAutomationsClicked] = useState(false)
  const [isTasksClicked, setIsTasksClicked] = useState(false)
  const [companiesClickStep, setCompaniesClickStep] = useState(0)
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false)

  useEffect(() => {
    const handleOpenCrm = () => setIsCrmModalOpen(true)
    window.addEventListener('dado-open-crm-modal', handleOpenCrm)
    return () => window.removeEventListener('dado-open-crm-modal', handleOpenCrm)
  }, [])

  // Ricezione note appuntate dalla Dashboard
  const [notesCount, setNotesCount] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem('dado_notes') || '[]')
      return Array.isArray(list) ? list.length : 0
    } catch {
      return 0
    }
  })
  const [noteJustReceived, setNoteJustReceived] = useState(false)

  function handleSettingsClick() {
    setIsSettingsSpinning(true)
    setTimeout(() => {
      setIsSettingsSpinning(false)
    }, 700)
  }

  function handleDashboardClick() {
    setIsDashboardClicked(false)
    requestAnimationFrame(() => {
      setIsDashboardClicked(true)
      setTimeout(() => {
        setIsDashboardClicked(false)
      }, 760)
    })
  }

  function handleCompaniesClick() {
    setCompaniesClickStep((prev) => prev + 1)
  }

  function handleTasksClick() {
    setIsTasksClicked(false)
    requestAnimationFrame(() => {
      setIsTasksClicked(true)
      setTimeout(() => {
        setIsTasksClicked(false)
      }, 620)
    })
  }

  function handleUsersClick() {
    setIsUsersRevolving(false)
    requestAnimationFrame(() => {
      setIsUsersRevolving(true)
      setUsersSwapped(prev => !prev)
      setTimeout(() => {
        setIsUsersRevolving(false)
      }, 500)
    })
  }

  function handleAppuntiClick() {
    setIsAppuntiClicked(false)
    requestAnimationFrame(() => {
      setIsAppuntiClicked(true)
      setTimeout(() => {
        setIsAppuntiClicked(false)
      }, 540)
    })
  }

  function handleCalendarClick() {
    setIsCalendarClicked(false)
    requestAnimationFrame(() => {
      setIsCalendarClicked(true)
      setTimeout(() => {
        setIsCalendarClicked(false)
      }, 550)
    })
    window.dispatchEvent(new CustomEvent('dado-calendar-flip'))
  }

  function handleAutomationsClick() {
    setIsAutomationsClicked(false)
    requestAnimationFrame(() => {
      setIsAutomationsClicked(true)
      setTimeout(() => {
        setIsAutomationsClicked(false)
      }, 400)
    })
    // Esegue trigger automazione anche sul backend e notifica componenti in ascolto
    fetch('/api/crm/automations/aut-sidebar-trigger/trigger', { method: 'POST' }).catch(() => {})
    window.dispatchEvent(new CustomEvent('dado-automation-triggered', { detail: { id: 'aut-sidebar-trigger' } }))
  }

  useEffect(() => {
    // Sincronizza il contatore dal server Express all'avvio
    const syncCountFromServer = async () => {
      try {
        const res = await fetch('/api/developer-notes')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            setNotesCount(data.length)
            localStorage.setItem('dado_notes', JSON.stringify(data))
          }
        }
      } catch (e) {
        // Fallback su localStorage
      }
    }
    syncCountFromServer()

    // Nuova nota salvata: aggiorna il conteggio e anima l'icona
    const handleSaved = () => {
      try {
        const list = JSON.parse(localStorage.getItem('dado_notes') || '[]')
        setNotesCount(Array.isArray(list) ? list.length : 0)
        setNoteJustReceived(true)
        setTimeout(() => setNoteJustReceived(false), 2600)
      } catch (e) {
        console.warn('Errore lettura note in sidebar:', e)
      }
    }

    // Nota eliminata: aggiorna solo il conteggio senza animazione
    const handleDeleted = (e) => {
      if (typeof e.detail?.remaining === 'number') {
        setNotesCount(e.detail.remaining)
      } else {
        try {
          const list = JSON.parse(localStorage.getItem('dado_notes') || '[]')
          setNotesCount(Array.isArray(list) ? list.length : 0)
        } catch {}
      }
    }

    window.addEventListener('dado-note-saved', handleSaved)
    window.addEventListener('dado-note-deleted', handleDeleted)
    return () => {
      window.removeEventListener('dado-note-saved', handleSaved)
      window.removeEventListener('dado-note-deleted', handleDeleted)
    }
  }, [])

  useEffect(() => {
    const handler = (e) => {
      setIsAiFocus(Boolean(e.detail?.active))
    }
    window.addEventListener('dado-ai-focus', handler)
    return () => window.removeEventListener('dado-ai-focus', handler)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      setIsCalendarCompact(Boolean(e.detail?.active))
    }
    window.addEventListener('dado-sidebar-compact', handler)
    return () => window.removeEventListener('dado-sidebar-compact', handler)
  }, [])

  // Voci di navigazione filtrate in base ai permessi dell'utente corrente
  const [isPort3005, setIsPort3005] = useState(() => {
    if (typeof window === 'undefined') return false
    const search = new URLSearchParams(window.location.search)
    if (search.get('layout') === 'new') return true
    if (search.get('layout') === 'classic') return false
    return window.location.port === '3005'
  })

  useEffect(() => {
    const checkPort = () => {
      const search = new URLSearchParams(window.location.search)
      if (search.get('layout') === 'new') setIsPort3005(true)
      else if (search.get('layout') === 'classic') setIsPort3005(false)
      else setIsPort3005(window.location.port === '3005')
    }
    checkPort()
    window.addEventListener('popstate', checkPort)
    return () => window.removeEventListener('popstate', checkPort)
  }, [])

  // Voci di navigazione filtrate in base ai permessi dell'utente corrente (Companies sempre visibile)
  const navItems = useMemo(() => getNavItems(isPort3005), [isPort3005])
  const visibleNavItems = navItems.filter((item) => {
    if (item.to === '/companies' || item.permission === 'companies') return true
    return canAccess(item.permission)
  })

  const hasDashboardAccess = canAccess('dashboard')

  // Barra laterale:
  // - In Dashboard standard: (calc(98px + 0.2cm) ~106px, ridotta di 1cm su richiesta)
  // - In modalità compatta (es. pop-up calendario espanso o focus OpenAI) o altre pagine: ristretta (calc(62px + 0.3cm) ~73px) con icone singole
  const isCompact = isCalendarCompact || isAiFocus
  const isFullDashboard = isDashboard && !isCompact

  const sidebarWidth = isFullDashboard
    ? 'calc(98px + 0.2cm)'
    : 'calc(62px + 0.3cm)'

  const buttonWidthClass = isFullDashboard ? 'w-[74px] h-[52px]' : 'w-[48px] h-[46px]'
  const buttonAlignClass = 'self-center mx-auto'
  const iconSize = isFullDashboard ? 28 : 22

  // Mostra le micro-label testuali sotto le icone esclusivamente su localhost:3005
  const showMicroLabels = isPort3005

  // Pagine con la banda superiore più spessa di 0,3cm rispetto alla dashboard (Companies, Tasks, Idee & Appunti, Automazioni)
  const isThickBandPage =
    location.pathname.startsWith('/companies') ||
    location.pathname.startsWith('/tasks') ||
    location.pathname.startsWith('/activities') ||
    location.pathname.startsWith('/appunti') ||
    location.pathname.startsWith('/idee') ||
    location.pathname.startsWith('/automations') ||
    location.pathname.startsWith('/automazioni') ||
    location.pathname.startsWith('/inventory') ||
    location.pathname.startsWith('/inventario') ||
    location.pathname.startsWith('/users') ||
    location.pathname.startsWith('/utenti')

  const sidebarBandHeight = isThickBandPage
    ? 'calc(3rem - 0.5cm + 0.3cm)'
    : isFullDashboard
    ? 'calc(3rem - 0.3cm)'
    : 'calc(3rem - 0.5cm)'

  return (
    <aside
      className="h-full min-h-screen flex flex-col items-center flex-shrink-0 transition-all duration-300 ease-in-out relative select-none"
      style={{
        width: sidebarWidth,
        paddingLeft: '0px',
        paddingRight: '0px',
        paddingTop: '0px',
        paddingBottom: isAiFocus ? '0px' : '0.35rem',
        opacity: isAiFocus ? 0 : 1,
        transform: isAiFocus ? 'translateX(-100%)' : 'translateX(0)',
        overflow: 'hidden',
        pointerEvents: isAiFocus ? 'none' : 'auto',
        background: 'transparent',
        borderRight: 'none',
        boxShadow: 'none',
      }}
    >
      
      {/* ── BANDA SUPERIORE DELLA SIDEBAR: Logo DADO centrato (#2d3139), presente in tutte le pagine ── */}
      <div
        className="w-full flex items-center justify-center flex-shrink-0 select-none relative z-10 transition-all duration-300"
        style={{
          height: sidebarBandHeight,
          backgroundColor: '#2d3139',
        }}
      >
        <NavLink
          to="/"
          className="flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          title="DADO CRM • Torna alla Dashboard"
        >
          <DadoBrandMark size={isFullDashboard ? 19 : 16} />
        </NavLink>
      </div>

      {/* Pulsante Dashboard */}
      {hasDashboardAccess && (
        <NavLink
          to="/"
          end
          onClick={handleDashboardClick}
          className={({ isActive }) =>
            `${buttonWidthClass} ${buttonAlignClass} mb-3.5 flex ${showMicroLabels ? 'flex-col' : ''} items-center justify-center rounded-2xl transition-all cursor-pointer group hover:scale-[1.04] ${
              isActive
                ? 'border border-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.25)] text-white'
                : 'border border-[#3d4350]/80 hover:border-[#5b6475] text-[#9fb0c3] hover:text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
            }`
          }
          style={({ isActive }) => ({
            marginTop: isFullDashboard ? '0.75rem' : '0.25rem',
            background: isActive
              ? 'linear-gradient(145deg, rgba(58, 66, 78, 0.6) 0%, rgba(35, 40, 50, 0.75) 100%)'
              : 'linear-gradient(145deg, rgba(50, 56, 68, 0.45) 0%, rgba(30, 34, 42, 0.55) 100%)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            boxShadow: isActive
              ? '0 0 12px rgba(0,210,255,0.25), inset 0 1px 0 rgba(255,255,255,0.18)'
              : '0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.09)',
          })}
          title="Dashboard"
        >
          <DashboardIcon
            size={isFullDashboard ? (showMicroLabels ? 21 : 26) : 22}
            strokeWidth={2.2}
            isClicked={isDashboardClicked}
            className="transition-transform duration-200 group-hover:scale-105"
          />
          {showMicroLabels && isFullDashboard && (
            <span className="text-[9px] font-black uppercase tracking-wider mt-1 text-center leading-none text-slate-200">
              Dashboard
            </span>
          )}
        </NavLink>
      )}

      {/* Dock Navigazione Icone con Trasparenza (Filtrate per permessi) */}
      <nav
        className={`flex flex-col items-center w-full relative z-10 flex-1 min-h-0 overflow-y-auto no-scrollbar py-1 ${!hasDashboardAccess ? 'mt-2' : ''}`}
        style={{
          gap: isFullDashboard ? '0.5rem' : 'calc(0.5rem + 0.2cm)',
        }}
      >
        {visibleNavItems.map(({ to, label, title, icon: IconComponent, sizeOffset = 0 }) => (
          <NavLink
            key={to}
            to={to}
            onClick={
              to === '/companies'
                ? handleCompaniesClick
                : to === '/users'
                ? handleUsersClick
                : to === '/appunti'
                ? handleAppuntiClick
                : to === '/calendar'
                ? handleCalendarClick
                : to === '/automations'
                ? handleAutomationsClick
                : to === '/tasks' || to === '/activities'
                ? handleTasksClick
                : undefined
            }
            className={({ isActive }) => {
              const active = isActive ||
                (to === '/tasks' && (location.pathname.startsWith('/tasks') || location.pathname.startsWith('/activities'))) ||
                (to === '/activities' && (location.pathname.startsWith('/activities') || location.pathname.startsWith('/tasks')))
              return `${buttonWidthClass} ${buttonAlignClass} relative flex-shrink-0 flex ${showMicroLabels ? 'flex-col' : ''} items-center justify-center rounded-2xl transition-all cursor-pointer group hover:scale-[1.04] ${
                active
                  ? 'border border-[#00d2ff] text-white shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                  : 'border border-[#3d4350]/80 hover:border-[#5b6475] text-[#9fb0c3] hover:text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
              } ${to === '/appunti' && noteJustReceived ? 'ring-2 ring-[#00d2ff] shadow-[0_0_16px_rgba(0,210,255,0.6)]' : ''}`
            }}
            style={({ isActive }) => {
              const active = isActive ||
                (to === '/tasks' && (location.pathname.startsWith('/tasks') || location.pathname.startsWith('/activities'))) ||
                (to === '/activities' && (location.pathname.startsWith('/activities') || location.pathname.startsWith('/tasks')))
              return {
                background: active
                  ? 'linear-gradient(145deg, rgba(58, 66, 78, 0.6) 0%, rgba(35, 40, 50, 0.7) 100%)'
                  : 'linear-gradient(145deg, rgba(50, 56, 68, 0.45) 0%, rgba(30, 34, 42, 0.55) 100%)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                boxShadow: active
                  ? '0 0 12px rgba(0,210,255,0.25), inset 0 1px 0 rgba(255,255,255,0.18)'
                  : '0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
              }
            }}
            title={to === '/appunti' && notesCount > 0 ? `${title} (${notesCount} appunti)` : title}
          >
            <IconComponent
              size={showMicroLabels ? (isFullDashboard ? 21 : (iconSize + sizeOffset)) : (isDashboard ? (iconSize + sizeOffset) : iconSize)}
              strokeWidth={2.0}
              isSwapped={to === '/users' ? usersSwapped : false}
              isRevolving={to === '/users' ? isUsersRevolving : false}
              clickStep={to === '/companies' ? companiesClickStep : undefined}
              isClicked={
                to === '/calendar'
                  ? isCalendarClicked
                  : to === '/appunti'
                  ? isAppuntiClicked
                  : to === '/automations'
                  ? isAutomationsClicked
                  : to === '/tasks' || to === '/activities'
                  ? isTasksClicked
                  : undefined
              }
              className={`transition-transform duration-200 group-hover:scale-110 ${
                to === '/appunti' && noteJustReceived ? 'animate-bounce' : ''
              }`}
            />
            {showMicroLabels && isFullDashboard && (
              <span className="text-[9px] font-black uppercase tracking-wider mt-1 text-center leading-none text-slate-200">
                {label}
              </span>
            )}
            {to === '/appunti' && notesCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#00d2ff] text-slate-950 text-[10px] font-black flex items-center justify-center shadow-md border border-slate-900 leading-none select-none transition-transform duration-200 group-hover:scale-110"
                title={`${notesCount} appunti registrati`}
              >
                {notesCount}
              </span>
            )}
          </NavLink>
        ))}

        {/* Pulsante Settings — Rotella meccanica (solo Amministratore: le sezioni sono riservate) */}
        {!isDipendente && (
        <NavLink
          to="/settings"
          onClick={handleSettingsClick}
          className={({ isActive }) =>
            `${buttonWidthClass} ${buttonAlignClass} flex-shrink-0 flex ${showMicroLabels ? 'flex-col' : ''} items-center justify-center rounded-2xl transition-all cursor-pointer group hover:scale-[1.04] ${
              isActive
                ? 'border border-[#00d2ff] text-white shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                : 'border border-[#3d4350]/80 hover:border-[#5b6475] text-[#9fb0c3] hover:text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
            }`
          }
          style={({ isActive }) => ({
            background: isActive
              ? 'linear-gradient(145deg, rgba(58, 66, 78, 0.6) 0%, rgba(35, 40, 50, 0.7) 100%)'
              : 'linear-gradient(145deg, rgba(50, 56, 68, 0.45) 0%, rgba(30, 34, 42, 0.55) 100%)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            boxShadow: isActive
              ? '0 0 12px rgba(0,210,255,0.25), inset 0 1px 0 rgba(255,255,255,0.18)'
              : '0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
          })}
          title={isDipendente ? "Impostazioni (Profilo Director: sezioni segrete protette)" : "Impostazioni Studio & Sistema (Admin)"}
        >
          <SettingsIcon
            size={showMicroLabels && isFullDashboard ? 21 : iconSize}
            strokeWidth={2.0}
            className={`transition-transform duration-300 ${
              isSettingsSpinning ? 'animate-spin-fast' : 'group-hover:rotate-90'
            }`}
          />
          {showMicroLabels && isFullDashboard && (
            <span className="text-[9px] font-black uppercase tracking-wider mt-1 text-center leading-none text-slate-200">
              Setup
            </span>
          )}
        </NavLink>
        )}
      </nav>

      {/* Icona/Pulsante CRM: con contorno e ombreggiatura sempre attivi sia dentro che fuori dalla schermata CRM */}
      <div className="flex-shrink-0 mt-auto pt-1 pb-2 flex items-center justify-center w-full select-none relative z-20 px-1 animate-fadeIn">
        <NavLink
          to="/crm"
          className={({ isActive }) =>
            `group relative flex ${showMicroLabels ? 'flex-col' : ''} items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${
              isFullDashboard ? 'px-3 py-1.5' : 'px-1.5 py-1.5'
            } rounded-xl ${
              isActive
                ? 'bg-slate-950/90 border-2 border-[#2dd4bf] shadow-[0_0_18px_rgba(45,212,191,0.5),0_0_24px_rgba(56,189,248,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]'
                : 'bg-gradient-to-b from-slate-900/70 to-slate-950/90 hover:from-slate-800/80 hover:to-slate-900 border border-[#2dd4bf]/40 hover:border-[#2dd4bf]/80 shadow-[0_2px_8px_rgba(0,0,0,0.6),0_0_10px_rgba(45,212,191,0.25)] hover:shadow-[0_0_16px_rgba(45,212,191,0.45),0_0_22px_rgba(56,189,248,0.3)]'
            }`
          }
          title="DADO CRM • Portale Inbound Form Sito Web, Preventivi & Contatti Diretti"
        >
          {({ isActive }) => (
            <>
              <CrmFuturisticLogo
                isActive={isActive}
                isFullDashboard={isFullDashboard}
                className="group-hover:scale-110 transition-transform duration-200"
              />
              {showMicroLabels && isFullDashboard && (
                <span className="text-[9px] font-black uppercase tracking-wider mt-1 text-center leading-none text-slate-200">
                  CRM
                </span>
              )}
            </>
          )}
        </NavLink>
      </div>

      {/* Modale Inbound Form Sito & Preventivi Rapidi (disponibile anche come overlay rapido) */}
      <CrmInboundModal isOpen={isCrmModalOpen} onClose={() => setIsCrmModalOpen(false)} />
    </aside>
  )
}
