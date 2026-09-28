import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Building2,
  ListTodo,
  CalendarDays,
  Boxes,
  Users as UsersIcon,
  Settings as SettingsIcon,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import ClockDriveBox from './ClockDriveBox'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/companies',  permission: 'companies',  label: 'Companies',   title: 'Companies (Aziende & Contratti)', icon: Building2 },
  { to: '/activities', permission: 'activities', label: 'Activities',  title: 'Activities (Attività & Task)',   icon: ListTodo },
  { to: '/calendar',   permission: 'calendar',   label: 'Calendar',    title: 'Calendar (Calendario Set)',      icon: CalendarDays },
  { to: '/inventory',  permission: 'inventory',  label: 'Inventario',  title: 'Inventario (Attrezzature)',       icon: Boxes },
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
    // In modalità ristretta: brand logo geometrico spostato e scritta CRM visibile sopra le icone
    return (
      <div className="mb-4 flex items-center justify-center w-full select-none">
        <span
          className="inline-flex items-center justify-center tracking-wider"
          style={{
            fontFamily: 'Sixtyfour, monospace',
            color: '#cbd5e1',
            fontSize: '1.15rem',
            lineHeight: 1,
            height: '20px',
            letterSpacing: '0.04em',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
          }}
        >
          CRM
        </span>
      </div>
    )
  }

  // In Dashboard: Logo completo D △ D O a colori + CRM affiancato
  return (
    <div className="mb-4 flex items-center justify-start gap-3 w-full pl-0.5">
      <div className="flex items-center justify-center flex-shrink-0">
        <DadoBrandMark size={20} />
      </div>
      <span
        className="inline-flex items-center justify-center tracking-wider select-none"
        style={{
          fontFamily: 'Sixtyfour, monospace',
          color: '#cbd5e1',
          fontSize: '1.30rem',
          lineHeight: 1,
          height: '20px',
          letterSpacing: '0.04em',
          flexShrink: 0,
          transform: 'translateY(1px)',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
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

  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard-a' || location.pathname === '/dashboard-b'
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
        // Finitura grigio metallizzato satinato con riflessi armonizzati
        background: 'linear-gradient(180deg, #2d3139 0%, #22262d 42%, #191b20 100%)',
        borderRight: '1px solid #383e49',
        boxShadow: 'inset -1px 0 0 rgba(0, 0, 0, 0.4), inset 1px 0 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      
      {/* Intestazione Logo: completo in Dashboard, scritta CRM centrata sopra le icone nelle sottosezioni */}
      <DadoLogo isDashboard={isDashboard} />

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
            marginTop: isDashboard ? 'calc(1rem + 1cm - 21px)' : '0.5rem',
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
          title="Impostazioni (Clicca per far girare la rotella)"
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

      {/* Collegamento a Google Drive con orario sotto Settings */}
      <div className={`mt-3.5 w-full flex ${isDashboard ? 'justify-start pl-[8px]' : 'justify-center'}`}>
        <ClockDriveBox
          width={isDashboard ? '96px' : '52px'}
          height="48px"
          compact={!isDashboard}
          onlyTime={true}
        />
      </div>

      {/* Profilo Attivo & Switcher Veloce in Fondo alla Barra */}
      <div className="mt-auto pt-3 border-t border-[#383e49]/80 w-full flex flex-col items-center">
        <button
          type="button"
          onClick={() => switchUser(currentUser.id === 'usr-admin' ? 'usr-dipendente' : 'usr-admin')}
          title={`Profilo attivo: ${currentUser.name} (${currentUser.badgeRole || currentUser.role}). Clicca per cambiare profilo tra Amministratore e Dipendente.`}
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
                {isAdmin ? '👑 ADMIN' : '👤 DIPENDENTE'}
              </span>
              <span className="text-[8px] text-gray-400 opacity-80 mt-0.5">
                (Clicca switch)
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="text-[10px] font-mono font-bold tracking-tight">
                {isAdmin ? 'ADM' : 'DIP'}
              </span>
            </div>
          )}
        </button>
      </div>

    </aside>
  )
}
