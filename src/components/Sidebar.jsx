import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings as SettingsIcon } from 'lucide-react'
import ClockDriveBox from './ClockDriveBox'

const navLinks = [
  { to: '/companies',  label: 'Companies' },
  { to: '/activities', label: 'Activities' },
  { to: '/calendar',   label: 'Calendar' },
  { to: '/inventory',  label: 'Inventario' },
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
      {/* Parola CRM allineata otticamente e ridimensionata di 2 punti */}
      <span
        className="inline-flex items-center justify-center"
        style={{
          fontFamily: 'Sixtyfour, monospace',
          color: '#777777',
          fontSize: '1.30rem',
          lineHeight: 1,
          height: '20px',
          letterSpacing: '0.02em',
          flexShrink: 0,
          transform: 'translateY(1px)',
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
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-all duration-300 group-hover:scale-105"
      style={{ overflow: 'visible' }}
    >
      {/* Riquadro 1 (in alto a sinistra) — Si allontana verso l'alto a sx e ingrandisce */}
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
      {/* Riquadro 2 (in alto a destra) — Si allontana verso l'alto a dx e ingrandisce */}
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
      {/* Riquadro 3 (in basso a destra) — Si allontana verso il basso a dx e ingrandisce */}
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
      {/* Riquadro 4 (in basso a sinistra) — Si allontana verso il basso a sx e ingrandisce */}
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
  const isDifferentSection = !isDashboard
  const isSubSection = ['/activities', '/companies', '/calendar', '/inventory', '/inventario'].some(path => location.pathname.startsWith(path))

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
      className="min-h-screen bg-[#111111] flex flex-col border-r border-white/5 flex-shrink-0 transition-all duration-500 ease-in-out"
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
      }}
    >
      
      {/* Logo in alto */}
      <DadoLogo />

      {/* Pulsante Dashboard — Riquadri che si allontanano max 0.6cm con movimento rallentato a metà velocità e tornano al posto al click */}
      <NavLink
        to="/"
        end
        onClick={handleDashboardClick}
        className={`${isSubSection ? 'w-[88px] h-[50px] mb-4' : 'w-[100px] h-[58px] mb-6'} self-start flex items-center justify-center rounded-2xl transition-all shadow-sm group hover:scale-[1.04] cursor-pointer`}
        style={{
          backgroundColor: '#d8ff00',
          color: '#111111',
          marginTop: isSubSection ? 'calc(0.5rem + 0.3cm)' : 'calc(1rem + 1cm - 21px)',
          marginLeft: '8px',
        }}
        title="Dashboard"
      >
        <AnimatedDashboardIcon isClicked={isDashboardClicked} />
      </NavLink>

      {/* Menu di navigazione — Voci ben spaziate e compatte nelle sottosezioni */}
      <nav className={`flex flex-col ${isSubSection ? 'gap-3' : 'gap-5'}`}>
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${isSubSection ? 'text-[15px]' : 'text-[17px]'} font-medium tracking-wide transition-colors ${
                isActive
                  ? 'text-white font-semibold border border-[#00a8ff] px-2.5 py-0.5 w-fit rounded-none'
                  : 'text-[#888888] hover:text-white px-2.5 py-0.5'
              }`
            }
          >
            {label}
          </NavLink>
        ))}

        {/* Pulsante Settings — Rotella meccanica con rotazione veloce quando schiacciata */}
        <NavLink
          to="/settings"
          onClick={handleSettingsClick}
          className={({ isActive }) =>
            `${isSubSection ? 'w-[88px] h-[46px]' : 'w-[100px] h-[58px]'} self-start flex items-center justify-center rounded-2xl transition-all shadow-sm group hover:scale-[1.04] cursor-pointer ${
              isActive ? 'ring-2 ring-[#00a8ff]' : ''
            }`
          }
          style={{
            backgroundColor: '#d8ff00',
            color: '#111111',
            marginLeft: '8px',
          }}
          title="Settings (Clicca per far girare la rotella veloce)"
        >
          <SettingsIcon
            size={isSubSection ? 24 : 28}
            strokeWidth={2.3}
            className={`transition-transform duration-300 ${
              isSettingsSpinning ? 'animate-spin-fast' : 'group-hover:rotate-90'
            }`}
          />
        </NavLink>
      </nav>

      {/* Collegamento a Google Drive con orario sotto Settings — Rimpicciolito nelle sezioni affinché non scompaia mai */}
      {!isDashboard && (
        <div className={isSubSection ? 'mt-3 w-full' : 'mt-6 w-full'}>
          <ClockDriveBox compact={isSubSection} width="100%" height={isSubSection ? '48px' : 'calc(58px + 1.5cm)'} />
        </div>
      )}

      {/* Pulsante Opportunities — Rimpicciolito nelle sezioni affinché né Drive né Opportunities scompaiano mai */}
      <NavLink
        to="/opportunities"
        className={`text-center ${isSubSection ? 'py-1.5 px-2 rounded-xl' : 'py-2 px-2 rounded-2xl'} transition-all block hover:opacity-95 shadow-sm`}
        style={{
          backgroundColor: '#007a50',
          color: '#ffffff',
          width: '100%',
          marginTop: isDashboard ? 'calc(2rem + 3cm)' : isSubSection ? '10px' : 'calc(1.5rem + 1cm)',
        }}
      >
        <span
          className="inline-block whitespace-nowrap"
          style={{
            fontFamily: '"Goldman", sans-serif',
            fontWeight: 400,
            fontSize: isSubSection ? '0.64rem' : '0.76rem',
            letterSpacing: isSubSection ? '0.08cm' : '0.14cm',
            lineHeight: 1,
            textTransform: 'lowercase',
          }}
        >
          opportunities
        </span>
      </NavLink>

    </aside>
  )
}
