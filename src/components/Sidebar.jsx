import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Building2,
  ListTodo,
  CalendarDays,
  Boxes,
  Settings as SettingsIcon,
} from 'lucide-react'
import ClockDriveBox from './ClockDriveBox'

const navItems = [
  { to: '/companies',  label: 'Companies',   title: 'Companies (Aziende & Contratti)', icon: Building2 },
  { to: '/activities', label: 'Activities',  title: 'Activities (Attività & Task)',   icon: ListTodo },
  { to: '/calendar',   label: 'Calendar',    title: 'Calendar (Calendario Set)',      icon: CalendarDays },
  { to: '/inventory',  label: 'Inventario',  title: 'Inventario (Attrezzature)',       icon: Boxes },
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

function DadoLogo() {
  return (
    <div className="mb-4 flex items-center justify-start gap-3 w-full pl-0.5">
      {/* Brand Logo geometrico D △ D O (size 20) */}
      <div className="flex items-center justify-center flex-shrink-0">
        <DadoBrandMark size={20} />
      </div>
      {/* Parola CRM in finitura grigio metallizzato platino */}
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

function AnimatedDashboardIcon({ isClicked }) {
  return (
    <svg
      width="27"
      height="27"
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
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard-a' || location.pathname === '/dashboard-b'
  const isSubSection = ['/activities', '/companies', '/leads', '/calendar', '/inventory', '/inventario'].some(path => location.pathname.startsWith(path))

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

  return (
    <aside
      className="min-h-screen flex flex-col flex-shrink-0 transition-all duration-500 ease-in-out relative select-none"
      style={{
        width: isAiFocus ? '0px' : 'calc(280px - 2cm)',
        paddingLeft: isAiFocus ? '0px' : '1rem',
        paddingRight: isAiFocus ? '0px' : '1rem',
        paddingTop: isAiFocus ? '0px' : isSubSection ? '1rem' : '1.5rem',
        paddingBottom: isAiFocus ? '0px' : isSubSection ? '1rem' : '1.5rem',
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
      
      {/* Logo in alto (D △ D O geometrico a colori + CRM platino metallizzato) */}
      <DadoLogo />

      {/* Pulsante Dashboard — Icona animata in pulsante metallico */}
      <NavLink
        to="/"
        end
        onClick={handleDashboardClick}
        className={({ isActive }) =>
          `w-[96px] h-[52px] mb-4 self-start flex items-center justify-center rounded-2xl transition-all cursor-pointer group hover:scale-[1.04] ${
            isActive
              ? 'border border-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.25)] text-white'
              : 'border border-[#3d4350] hover:border-[#5b6475] text-[#9fb0c3] hover:text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
          }`
        }
        style={({ isActive }) => ({
          marginTop: 'calc(1rem + 1cm - 21px)',
          marginLeft: '8px',
          background: isActive
            ? 'linear-gradient(145deg, #3a424e 0%, #252a33 100%)'
            : 'linear-gradient(145deg, #323741 0%, #21252c 100%)',
          boxShadow: isActive
            ? '0 0 12px rgba(0,210,255,0.25), inset 0 1px 0 rgba(255,255,255,0.18)'
            : '0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.09)',
        })}
        title="Dashboard"
      >
        <AnimatedDashboardIcon isClicked={isDashboardClicked} />
      </NavLink>

      {/* Dock Navigazione Icone Metallizzate — Sostituzione voci con icone */}
      <nav className="flex flex-col gap-3">
        {navItems.map(({ to, title, icon: IconComponent }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `w-[96px] h-[52px] self-start flex items-center justify-center rounded-2xl transition-all cursor-pointer group hover:scale-[1.04] ${
                isActive
                  ? 'border border-[#00d2ff] text-white shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                  : 'border border-[#3d4350] hover:border-[#5b6475] text-[#9fb0c3] hover:text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
              }`
            }
            style={({ isActive }) => ({
              marginLeft: '8px',
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
              size={24}
              strokeWidth={2.1}
              className="transition-transform duration-200 group-hover:scale-110"
            />
          </NavLink>
        ))}

        {/* Pulsante Settings — Rotella meccanica armonizzata nel design metallico */}
        <NavLink
          to="/settings"
          onClick={handleSettingsClick}
          className={({ isActive }) =>
            `w-[96px] h-[52px] self-start flex items-center justify-center rounded-2xl transition-all cursor-pointer group hover:scale-[1.04] ${
              isActive
                ? 'border border-[#00d2ff] text-white shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                : 'border border-[#3d4350] hover:border-[#5b6475] text-[#9fb0c3] hover:text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
            }`
          }
          style={({ isActive }) => ({
            marginLeft: '8px',
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
            size={24}
            strokeWidth={2.1}
            className={`transition-transform duration-300 ${
              isSettingsSpinning ? 'animate-spin-fast' : 'group-hover:rotate-90'
            }`}
          />
        </NavLink>
      </nav>

      {/* Collegamento a Google Drive con orario sotto Settings — visibile nelle sottosezioni */}
      {!isDashboard && (
        <div className="mt-5 w-full">
          <ClockDriveBox width="100%" height="calc(39px + 1cm)" onlyTime={true} />
        </div>
      )}

    </aside>
  )
}
