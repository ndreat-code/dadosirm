import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  ListTodo,
  Settings as SettingsIcon,
} from 'lucide-react'
import Backpack3DIcon from './Backpack3DIcon'
import Company3DIcon from './Company3DIcon'
import IdeeAppuntiIcon from './IdeeAppuntiIcon'
import UsersRevolvingIcon from './UsersRevolvingIcon'
import CalendarPageFlipIcon from './CalendarPageFlipIcon'
import { useAuth } from '../context/AuthContext'

// Icona Dashboard a 4 elementi: ciascun elemento ha un solo angolo ricurvo (quello all'estremità esterna dell'icona) e 3 angoli retti
function DashboardIcon({ size = 26, strokeWidth = 2.2, className = '' }) {
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
      className={className}
    >
      {/* 1. In alto a sinistra (estremità sup-sx curva, altri 3 angoli retti) */}
      <path d="M 6 3 H 10 V 12 H 3 V 6 A 3 3 0 0 1 6 3 Z" />
      {/* 2. In alto a destra (estremità sup-dx curva, altri 3 angoli retti) */}
      <path d="M 14 3 H 18 A 3 3 0 0 1 21 6 V 8 H 14 Z" />
      {/* 3. In basso a destra (estremità inf-dx curva, altri 3 angoli retti) */}
      <path d="M 14 12 H 21 V 18 A 3 3 0 0 1 18 21 H 14 Z" />
      {/* 4. In basso a sinistra (estremità inf-sx curva, altri 3 angoli retti) */}
      <path d="M 3 16 H 10 V 21 H 6 A 3 3 0 0 1 3 18 Z" />
    </svg>
  )
}

const navItems = [
  { to: '/companies',  permission: 'companies',  label: 'Companies',   title: 'Companies (Aziende & Contratti)', icon: Company3DIcon,  sizeOffset: 2.5 },
  { to: '/activities', permission: 'activities', label: 'Activities',  title: 'Activities (Attività & Task)',   icon: ListTodo },
  { to: '/calendar',   permission: 'calendar',   label: 'Calendar',    title: 'Calendar (Calendario Set)',      icon: CalendarPageFlipIcon },
  { to: '/inventory',  permission: 'inventory',  label: 'Inventario',  title: 'Inventario (Attrezzature)',       icon: Backpack3DIcon, sizeOffset: 2.5 },
  { to: '/users',      permission: 'users',      label: 'Utenti',      title: 'Utenti & Permessi di Accesso',    icon: UsersRevolvingIcon, sizeOffset: 1.0 },
  { to: '/appunti',    permission: 'dashboard',  label: 'Idee',        title: 'Idee & Appunti (Testo appuntato)', icon: IdeeAppuntiIcon, sizeOffset: 2.0 },
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
  const isSubSection = ['/activities', '/companies', '/leads', '/calendar', '/inventory', '/inventario', '/users', '/utenti', '/settings', '/appunti', '/idee'].some(path => location.pathname.startsWith(path))

  const [isAiFocus, setIsAiFocus] = useState(false)
  const [isCalendarCompact, setIsCalendarCompact] = useState(false)
  const [isSettingsSpinning, setIsSettingsSpinning] = useState(false)
  const [isDashboardClicked, setIsDashboardClicked] = useState(false)
  const [usersSwapped, setUsersSwapped] = useState(false)
  const [isUsersRevolving, setIsUsersRevolving] = useState(false)
  const [isAppuntiClicked, setIsAppuntiClicked] = useState(false)
  const [isCalendarClicked, setIsCalendarClicked] = useState(false)

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
  const visibleNavItems = navItems.filter((item) => {
    return canAccess(item.permission)
  })

  const hasDashboardAccess = canAccess('dashboard')

  // Barra laterale:
  // - In Dashboard standard: ampliata (calc(98px + 1.2cm) ~143px)
  // - In modalità compatta (es. pop-up calendario espanso) o altre pagine: ristretta (calc(62px + 0.3cm) ~73px) con icone singole
  const isFullDashboard = isDashboard && !isCalendarCompact

  const sidebarWidth = isAiFocus
    ? '0px'
    : isFullDashboard
    ? 'calc(98px + 1.2cm)'
    : 'calc(62px + 0.3cm)'

  const buttonWidthClass = isFullDashboard ? 'w-[74px] h-[52px]' : 'w-[48px] h-[46px]'
  const buttonAlignClass = 'self-center mx-auto'
  const iconSize = isFullDashboard ? 28 : 22

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
          height: isFullDashboard ? 'calc(3rem - 0.3cm)' : 'calc(3rem - 0.5cm)',
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

      {/* Pulsante Dashboard — Visibile solo per chi ha accesso alla Dashboard (ripristinato come ieri sera) */}
      {hasDashboardAccess && (
        <NavLink
          to="/"
          end
          onClick={handleDashboardClick}
          className={({ isActive }) =>
            `${buttonWidthClass} ${buttonAlignClass} mb-3.5 flex items-center justify-center rounded-2xl transition-all cursor-pointer group hover:scale-[1.04] ${
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
            size={isFullDashboard ? 26 : 22}
            strokeWidth={2.2}
            className={`transition-transform duration-200 group-hover:scale-110 ${
              isDashboardClicked ? 'scale-90 rotate-3' : ''
            }`}
          />
        </NavLink>
      )}

      {/* Dock Navigazione Icone con Trasparenza (Filtrate per permessi) */}
      <nav
        className={`flex flex-col items-center w-full relative z-10 flex-1 min-h-0 overflow-y-auto no-scrollbar py-1 ${!hasDashboardAccess ? 'mt-2' : ''}`}
        style={{
          gap: isFullDashboard ? '0.5rem' : 'calc(0.5rem + 0.2cm)',
        }}
      >
        {visibleNavItems.map(({ to, title, icon: IconComponent, sizeOffset = 0 }) => (
          <NavLink
            key={to}
            to={to}
            onClick={
              to === '/users'
                ? handleUsersClick
                : to === '/appunti'
                ? handleAppuntiClick
                : to === '/calendar'
                ? handleCalendarClick
                : undefined
            }
            className={({ isActive }) =>
              `${buttonWidthClass} ${buttonAlignClass} relative flex-shrink-0 flex items-center justify-center rounded-2xl transition-all cursor-pointer group hover:scale-[1.04] ${
                isActive
                  ? 'border border-[#00d2ff] text-white shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                  : 'border border-[#3d4350]/80 hover:border-[#5b6475] text-[#9fb0c3] hover:text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
              } ${to === '/appunti' && noteJustReceived ? 'ring-2 ring-[#00d2ff] shadow-[0_0_16px_rgba(0,210,255,0.6)]' : ''}`
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
            title={to === '/appunti' && notesCount > 0 ? `${title} (${notesCount} appunti)` : title}
          >
            <IconComponent
              size={isDashboard ? (iconSize + sizeOffset) : iconSize}
              strokeWidth={2.0}
              isSwapped={to === '/users' ? usersSwapped : false}
              isRevolving={to === '/users' ? isUsersRevolving : false}
              isClicked={
                to === '/calendar'
                  ? isCalendarClicked
                  : to === '/appunti'
                  ? isAppuntiClicked
                  : undefined
              }
              className={`transition-transform duration-200 group-hover:scale-110 ${
                to === '/appunti' && noteJustReceived ? 'animate-bounce' : ''
              }`}
            />
            {to === '/appunti' && notesCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#00d2ff] text-slate-950 font-mono text-[9px] font-black flex items-center justify-center shadow-md border border-slate-900 leading-none select-none transition-transform duration-200 group-hover:scale-110"
                title={`${notesCount} appunti registrati`}
              >
                {notesCount}
              </span>
            )}
          </NavLink>
        ))}

        {/* Pulsante Settings — Rotella meccanica */}
        <NavLink
          to="/settings"
          onClick={handleSettingsClick}
          className={({ isActive }) =>
            `${buttonWidthClass} ${buttonAlignClass} flex-shrink-0 flex items-center justify-center rounded-2xl transition-all cursor-pointer group hover:scale-[1.04] ${
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
            size={iconSize}
            strokeWidth={2.0}
            className={`transition-transform duration-300 ${
              isSettingsSpinning ? 'animate-spin-fast' : 'group-hover:rotate-90'
            }`}
          />
        </NavLink>

        {/* Switcher rapido Amministratore / Director */}
        <button
          type="button"
          onClick={() => switchUser(currentUser.id === 'usr-admin' ? 'usr-dipendente' : 'usr-admin')}
          title={`Profilo attivo: ${currentUser.name} (${currentUser.badgeRole || currentUser.role}). Clicca per cambiare profilo tra Amministratore e Director.`}
          className={`${buttonWidthClass} ${buttonAlignClass} relative flex-shrink-0 flex items-center justify-center rounded-2xl transition-all cursor-pointer group hover:scale-[1.04]`}
          style={{
            background: isAdmin
              ? 'linear-gradient(145deg, rgba(8, 47, 73, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)'
              : 'linear-gradient(145deg, rgba(69, 26, 3, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
            borderColor: isAdmin ? 'rgba(6, 182, 212, 0.4)' : 'rgba(245, 158, 11, 0.4)',
            borderWidth: '1px',
            borderStyle: 'solid',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            boxShadow: isAdmin
              ? '0 0 12px rgba(0,210,255,0.2), inset 0 1px 0 rgba(255,255,255,0.15)'
              : '0 0 12px rgba(245,158,11,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <div className="flex flex-col items-center justify-center leading-none">
            <span
              className={`${isDashboard ? 'text-[12px]' : 'text-[10px]'} font-mono font-bold tracking-tight ${
                isAdmin ? 'text-cyan-300' : 'text-amber-300'
              }`}
            >
              {isAdmin ? '👑 ADM' : '🎬 DIR'}
            </span>
          </div>
        </button>
      </nav>

      {/* Scritta CRM orizzontale visibile in basso nella barra laterale quando ci si trova nella Dashboard standard */}
      {isFullDashboard && (
        <div className="flex-shrink-0 mt-auto pt-1.5 pb-2.5 flex items-center justify-center w-full select-none relative z-20 px-0.5 animate-fadeIn">
          <span
            className="inline-flex items-center justify-center text-center whitespace-nowrap"
            style={{
              fontFamily: 'Sixtyfour, monospace',
              color: '#e2e8f0', // grigio metallizzato leggermente più chiaro
              fontSize: 'calc(1.15rem + 5pt)',
              lineHeight: 1,
              letterSpacing: '0.02em',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.2), 0 2px 5px rgba(0, 0, 0, 0.6)',
            }}
          >
            CRM
          </span>
        </div>
      )}

    </aside>
  )
}
