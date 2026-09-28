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
    >
      <g
        className={isClicked ? 'animate-dashboard-lap' : ''}
        style={{ transformOrigin: '12px 12px' }}
      >
        {/* Riquadro 1 (in alto a sinistra) */}
        <rect
          width="7"
          height="9"
          x="3"
          y="3"
          rx="1.5"
          className="transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
          style={{ transformOrigin: 'center' }}
        />
        {/* Riquadro 2 (in alto a destra) */}
        <rect
          width="7"
          height="5"
          x="14"
          y="3"
          rx="1.5"
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{ transformOrigin: 'center' }}
        />
        {/* Riquadro 3 (in basso a destra) */}
        <rect
          width="7"
          height="9"
          x="14"
          y="12"
          rx="1.5"
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
          style={{ transformOrigin: 'center' }}
        />
        {/* Riquadro 4 (in basso a sinistra) */}
        <rect
          width="7"
          height="5"
          x="3"
          y="16"
          rx="1.5"
          className="transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:translate-y-0.5"
          style={{ transformOrigin: 'center' }}
        />
      </g>
    </svg>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard-a' || location.pathname === '/dashboard-b'
  const isDifferentSection = !isDashboard
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
      }, 380)
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
        paddingTop: isAiFocus ? '0px' : '1.5rem',
        paddingBottom: isAiFocus ? '0px' : '1.5rem',
        opacity: isAiFocus ? 0 : 1,
        transform: isAiFocus ? 'translateX(-100%)' : 'translateX(0)',
        overflow: 'hidden',
        pointerEvents: isAiFocus ? 'none' : 'auto',
      }}
    >
      
      {/* Logo in alto */}
      <DadoLogo />

      {/* Pulsante Dashboard — Riquadri che si interscambiano velocemente e tornano al loro posto solo al click */}
      <NavLink
        to="/"
        end
        onClick={handleDashboardClick}
        className="w-[100px] h-[58px] mb-8 self-start flex items-center justify-center rounded-2xl transition-all shadow-sm group hover:scale-[1.04] active:scale-95 cursor-pointer"
        style={{
          backgroundColor: '#d8ff00',
          color: '#111111',
          marginTop: 'calc(1rem + 1cm - 21px)',
          marginLeft: '8px',
        }}
        title="Dashboard"
      >
        <AnimatedDashboardIcon isClicked={isDashboardClicked} />
      </NavLink>

      {/* Menu di navigazione — Voci Companies, Activities, etc. ben spaziate */}
      <nav className="flex flex-col gap-6">
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `text-[17px] font-medium tracking-wide transition-colors ${
                isActive
                  ? 'text-white font-semibold border border-[#00a8ff] px-3 py-1 w-fit rounded-none'
                  : 'text-[#888888] hover:text-white px-3 py-1'
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
            `w-[100px] h-[58px] self-start flex items-center justify-center rounded-2xl transition-all shadow-sm group hover:scale-[1.04] active:scale-95 cursor-pointer ${
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
            size={28}
            strokeWidth={2.3}
            className={`transition-transform duration-300 ${
              isSettingsSpinning ? 'animate-spin-fast' : 'group-hover:rotate-90'
            }`}
          />
        </NavLink>
      </nav>

      {/* Collegamento a Google Drive con orario sotto Settings — Escluso quando si è nella Dashboard */}
      {!isDashboard && (
        <div className="mt-7 w-full">
          <ClockDriveBox width="100%" height="calc(58px + 1.5cm)" />
        </div>
      )}

      {/* Pulsante Opportunities — Lettere ulteriormente distanziate (letterSpacing 0.14cm) e ben contenute */}
      <NavLink
        to="/opportunities"
        className="text-center py-2 px-2 rounded-2xl transition-all block hover:opacity-95 shadow-sm"
        style={{
          backgroundColor: '#007a50',
          color: '#ffffff',
          width: '100%',
          marginTop: isDashboard ? 'calc(2rem + 3cm)' : 'calc(1.5rem + 1cm)',
        }}
      >
        <span
          className="inline-block whitespace-nowrap"
          style={{
            fontFamily: '"Goldman", sans-serif',
            fontWeight: 400,
            fontSize: '0.76rem',
            letterSpacing: '0.14cm',
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
