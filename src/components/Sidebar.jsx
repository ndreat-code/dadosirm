import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Building2,
  ListTodo,
  CalendarDays,
  Users as UsersIcon,
  Settings as SettingsIcon,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import ClockDriveBox from './ClockDriveBox'
import Backpack3DIcon from './Backpack3DIcon'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/companies',  permission: 'companies',  label: 'Companies',   title: 'Companies (Aziende & Contratti)', icon: Building2 },
  { to: '/activities', permission: 'activities', label: 'Activities',  title: 'Activities (Attività & Task)',   icon: ListTodo },
  { to: '/calendar',   permission: 'calendar',   label: 'Calendar',    title: 'Calendar (Calendario Set)',      icon: CalendarDays },
  { to: '/inventory',  permission: 'inventory',  label: 'Inventario',  title: 'Inventario (Attrezzature)',       icon: Backpack3DIcon },
  { to: '/users',      permission: 'users',      label: 'Utenti',      title: 'Utenti & Permessi di Accesso',    icon: UsersIcon },
]

function DadoBrandMark({ size = 18 }) {
  const h = size
  const wD = size * 0.8
  const wTri = size * 0.9
  const wO = size
  return (
    <div className="inline-flex items-center gap-1 leading-none select-none">
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

function DadoLogo({ isDashboard = true }) {
  if (!isDashboard) {
    // In modalità ristretta: brand logo geometrico spostato e scritta CRM visibile sopra le icone (grigio metallizzato leggermente più chiaro)
    return (
      <div className="mb-2.5 flex items-center justify-center w-full select-none">
        <span
          className="inline-flex items-center justify-center tracking-wider"
          style={{
            fontFamily: 'Sixtyfour, monospace',
            color: '#e2e8f0', // grigio metallizzato leggermente più chiaro
            fontSize: '1.15rem',
            lineHeight: 1,
            height: '20px',
            letterSpacing: '0.04em',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.2), 0 2px 5px rgba(0, 0, 0, 0.6)',
          }}
        >
          CRM
        </span>
      </div>
    )
  }

  // In Dashboard: Logo completo D △ D O a colori + CRM affiancato (grigio metallizzato leggermente più chiaro)
  return (
    <div className="mb-2.5 flex items-center justify-start gap-3 w-full pl-0.5">
      <div className="flex items-center justify-center flex-shrink-0">
        <DadoBrandMark size={20} />
      </div>
      <span
        className="inline-flex items-center justify-center tracking-wider select-none"
        style={{
          fontFamily: 'Sixtyfour, monospace',
          color: '#e2e8f0', // grigio metallizzato leggermente più chiaro
          fontSize: '1.30rem',
          lineHeight: 1,
          height: '20px',
          letterSpacing: '0.04em',
          flexShrink: 0,
          transform: 'translateY(1px)',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.2), 0 2px 5px rgba(0, 0, 0, 0.6)',
        }}
      >
        CRM
      </span>
    </div>
  )
}

function AnimatedDashboardIcon({ isClicked, size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-all duration-300 group-hover:scale-105"
      style={{ overflow: 'visible' }}
    >
      {/* Riquadro 1 (in alto a sinistra) */}
      <rect
        width="7"
        height="9"
        x="3"
        y="3"
        rx="1.5"
        className={
          isClicked
            ? 'animate-tile-burst-1'
            : 'transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5'
        }
        style={{ transformOrigin: 'center' }}
      />
      {/* Riquadro 2 (in alto a destra) */}
      <rect
        width="7"
        height="5"
        x="14"
        y="3"
        rx="1.5"
        className={
          isClicked
            ? 'animate-tile-burst-2'
            : 'transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
        }
        style={{ transformOrigin: 'center' }}
      />
      {/* Riquadro 3 (in basso a destra) */}
      <rect
        width="7"
        height="9"
        x="14"
        y="12"
        rx="1.5"
        className={
          isClicked
            ? 'animate-tile-burst-3'
            : 'transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5'
        }
        style={{ transformOrigin: 'center' }}
      />
      {/* Riquadro 4 (in basso a sinistra) */}
      <rect
        width="7"
        height="5"
        x="3"
        y="16"
        rx="1.5"
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

export default function Sidebar() {
  const location = useLocation()
  const { currentUser, canAccess, isAdmin, isDipendente, switchUser } = useAuth()

  const isDashboard = location.pathname === '/' || location.pathname === '' || location.pathname.startsWith('/dashboard')
  const isSubSection = ['/activities', '/companies', '/leads', '/calendar', '/inventory', '/inventario', '/users', '/utenti', '/settings'].some(path => location.pathname.startsWith(path))

  const [isAiFocus, setIsAiFocus] = useState(false)
  const [isSettingsSpinning, setIsSettingsSpinning] = useState(false)
  const [isDashboardClicked, setIsDashboardClicked] = useState(false)

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
      }, 1080)
    })
  }

  useEffect(() => {
    const handler = (e) => {
      setIsAiFocus(Boolean(e.detail?.active))
    }
    window.addEventListener('dado-ai-focus', handler)
    return () => window.removeEventListener('dado-ai-focus', handler)
  }, [])

  // Voci di navigazione filtrate in base ai permessi dell'utente corrente
  const visibleNavItems = navItems.filter((item) => {
    if (item.permission === 'users') return isAdmin
    return canAccess(item.permission)
  })

  const hasDashboardAccess = canAccess('dashboard')

  // Dimensioni e padding condizionali: allargata in Dashboard, ristretta (74px) nelle altre sezioni
  const sidebarWidth = isAiFocus ? '0px' : isDashboard ? 'calc(280px - 2cm)' : '74px'
  const paddingX = isAiFocus ? '0px' : isDashboard ? '1rem' : '0.5rem'
  const buttonWidthClass = isDashboard ? 'w-[96px] h-[52px]' : 'w-[52px] h-[48px]'
  const buttonAlignClass = isDashboard ? 'self-start ml-[8px]' : 'self-center mx-auto'
  const iconSize = isDashboard ? 24 : 22

  return (
    <aside
      className="min-h-screen flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative select-none"
      style={{
        width: sidebarWidth,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: isAiFocus ? '0px' : isDashboard ? '1.5rem' : '1.25rem',
        paddingBottom: isAiFocus ? '0px' : '1.25rem',
        opacity: isAiFocus ? 0 : 1,
        transform: isAiFocus ? 'translateX(-100%)' : 'translateX(0)',
        overflow: 'hidden',
        pointerEvents: isAiFocus ? 'none' : 'auto',
        // Finitura grigio metallizzato satinato che fluisce continua negli spazi curvi
        background: 'transparent',
        borderRight: 'none',
        boxShadow: 'none',
      }}
    >
      
      {/* Intestazione Logo: completo in Dashboard, scritta CRM centrata sopra le icone nelle sottosezioni */}
      <DadoLogo isDashboard={isDashboard} />

      {/* Collegamento a Google Drive con orario sovrapposto sotto la scritta CRM (visibile solo nelle pagine interne, rimosso in Dashboard) */}
      {!isDashboard && (
        <div className="mb-3 w-full flex justify-center">
          <ClockDriveBox
            width="52px"
            height="48px"
            compact={true}
            onlyTime={true}
          />
        </div>
      )}

      {/* Pulsante Dashboard — Visibile solo per chi ha accesso alla Dashboard */}
      {hasDashboardAccess && (
        <NavLink
          to="/"
          end
          onClick={handleDashboardClick}
          className={({ isActive }) =>
            `${buttonWidthClass} ${buttonAlignClass} mb-3.5 flex items-center justify-center rounded-2xl transition-all cursor-pointer group hover:scale-[1.04] ${
              isActive
                ? 'border border-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.25)] text-white'
                : 'border border-[#3d4350] hover:border-[#5b6475] text-[#9fb0c3] hover:text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
            }`
          }
          style={({ isActive }) => ({
            marginTop: isDashboard ? '0.75rem' : '0.25rem',
            background: isActive
              ? 'linear-gradient(145deg, #3a424e 0%, #252a33 100%)'
              : 'linear-gradient(145deg, #323741 0%, #21252c 100%)',
            boxShadow: isActive
              ? '0 0 12px rgba(0,210,255,0.25), inset 0 1px 0 rgba(255,255,255,0.18)'
              : '0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.09)',
          })}
          title="Dashboard"
        >
          <AnimatedDashboardIcon isClicked={isDashboardClicked} size={isDashboard ? 26 : 22} />
        </NavLink>
      )}

      {/* Dock Navigazione Icone Metallizzate (Filtrate per permessi) */}
      <nav className={`flex flex-col gap-2.5 ${!hasDashboardAccess ? 'mt-3' : ''}`}>
        {visibleNavItems.map(({ to, title, icon: IconComponent }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${buttonWidthClass} ${buttonAlignClass} flex items-center justify-center rounded-2xl transition-all cursor-pointer group hover:scale-[1.04] ${
                isActive
                  ? 'border border-[#00d2ff] text-white shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                  : 'border border-[#3d4350] hover:border-[#5b6475] text-[#9fb0c3] hover:text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
              }`
            }
            style={({ isActive }) => ({
              background: isActive
                ? 'linear-gradient(145deg, #3a424e 0%, #252a33 100%)'
                : 'linear-gradient(145deg, #323741 0%, #21252c 100%)',
              boxShadow: isActive
                ? '0 0 12px rgba(0,210,255,0.25), inset 0 1px 0 rgba(255,255,255,0.18)'
                : '0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.09)',
            })}
            title={title}
          >
            <IconComponent
              size={iconSize}
              strokeWidth={2.1}
              className="transition-transform duration-200 group-hover:scale-110"
            />
          </NavLink>
        ))}

        {/* Pulsante Settings — Rotella meccanica */}
        <NavLink
          to="/settings"
          onClick={handleSettingsClick}
          className={({ isActive }) =>
            `${buttonWidthClass} ${buttonAlignClass} flex items-center justify-center rounded-2xl transition-all cursor-pointer group hover:scale-[1.04] ${
              isActive
                ? 'border border-[#00d2ff] text-white shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                : 'border border-[#3d4350] hover:border-[#5b6475] text-[#9fb0c3] hover:text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
            }`
          }
          style={({ isActive }) => ({
            background: isActive
              ? 'linear-gradient(145deg, #3a424e 0%, #252a33 100%)'
              : 'linear-gradient(145deg, #323741 0%, #21252c 100%)',
            boxShadow: isActive
              ? '0 0 12px rgba(0,210,255,0.25), inset 0 1px 0 rgba(255,255,255,0.18)'
              : '0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.09)',
          })}
          title={isDipendente ? "Impostazioni (Profilo Director: sezioni segrete protette)" : "Impostazioni Studio & Sistema (Admin)"}
        >
          <SettingsIcon
            size={iconSize}
            strokeWidth={2.1}
            className={`transition-transform duration-300 ${
              isSettingsSpinning ? 'animate-spin-fast' : 'group-hover:rotate-90'
            }`}
          />
        </NavLink>
      </nav>


      {/* Profilo Attivo & Switcher Veloce in Fondo alla Barra */}
      <div className="mt-auto pt-3 border-t border-[#383e49]/80 w-full flex flex-col items-center">
        <button
          type="button"
          onClick={() => switchUser(currentUser.id === 'usr-admin' ? 'usr-dipendente' : 'usr-admin')}
          title={`Profilo attivo: ${currentUser.name} (${currentUser.badgeRole || currentUser.role}). Clicca per cambiare profilo tra Amministratore e Director.`}
          className={`flex items-center justify-center rounded-xl transition-all cursor-pointer select-none group ${
            isDashboard ? 'w-[96px] py-1.5 px-1 self-start ml-[8px]' : 'w-[52px] h-[36px] self-center mx-auto'
          } ${
            isAdmin
              ? 'border border-[#00d2ff]/60 bg-gradient-to-r from-[#202733] to-[#171c24] text-cyan-300 shadow-[0_0_8px_rgba(0,210,255,0.2)] hover:border-[#00d2ff]'
              : 'border border-amber-500/60 bg-gradient-to-r from-[#2a221b] to-[#1c1815] text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)] hover:border-amber-400'
          }`}
        >
          {isDashboard ? (
            <div className="flex flex-col items-center justify-center w-full leading-tight text-center">
              <span className="text-[10px] font-bold truncate max-w-full">
                {isAdmin ? '👑 ADMIN' : '🎬 DIRECTOR'}
              </span>
              <span className="text-[8px] text-gray-400 opacity-80 mt-0.5">
                (Clicca switch)
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="text-[10px] font-mono font-bold tracking-tight">
                {isAdmin ? 'ADM' : 'DIR'}
              </span>
            </div>
          )}
        </button>
      </div>

    </aside>
  )
}
