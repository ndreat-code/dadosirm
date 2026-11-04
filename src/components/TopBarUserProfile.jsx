import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, ChevronDown, UserPlus, Shield, Sparkles, Bell } from 'lucide-react'
import UsersRevolvingIcon from './UsersRevolvingIcon'
import { useAuth } from '../context/AuthContext'

export default function TopBarUserProfile({ className = '' }) {
  const navigate = useNavigate()
  const { currentUser, isAdmin, isDipendente, switchUser, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Invia evento per mostrare/nascondere le Notifiche Intelligenti dall'alto
  function handleToggleSmartNotifications() {
    window.dispatchEvent(new CustomEvent('dado-toggle-notifications'))
  }

  return (
    <div ref={menuRef} className={`relative inline-flex items-center select-none ${className}`}>
      {/* ── TAVOLA COMPATTA & MODULARE ("A TAVOLE"): UTENTI & PERMESSI | PROFILO ATTIVO | NOTIFICHE SMART ── */}
      <div
        className="flex items-center gap-1 bg-slate-950/90 hover:bg-slate-950 text-white p-1 rounded-2xl border border-slate-700/80 shadow-[0_6px_24px_rgba(0,0,0,0.45),0_0_15px_rgba(0,210,255,0.08)] backdrop-blur-xl transition-all"
        style={{
          fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        
        {/* ── TAVOLA 1: Voce & Link Rapido a Gestione Utenti & Permessi ── */}
        <Link
          to="/users"
          className="group flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/60 hover:bg-slate-850 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/50 transition-all cursor-pointer"
          title="Apri Gestione Utenti & Permessi di Accesso"
        >
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-cyan-400 group-hover:scale-110 transition-transform">
            <UsersRevolvingIcon size={15} strokeWidth={2.2} />
          </div>
          <span className="text-[11.5px] font-bold tracking-tight whitespace-nowrap text-slate-200 group-hover:text-cyan-300">
            Utenti & Permessi
          </span>
        </Link>

        {/* ── TAVOLA 2: Badge Profilo Attivo Inglobato (Switcher rapido con 1 click o apertura menù) ── */}
        <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
          <button
            type="button"
            onClick={() => switchUser(currentUser.id === 'usr-admin' ? 'usr-dipendente' : 'usr-admin')}
            title={`Profilo attivo: ${currentUser.name} (${currentUser.badgeRole || currentUser.role}). Clicca per switchare tra Amministratore e Director.`}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
            style={{
              background: isAdmin
                ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(14, 116, 144, 0.45) 100%)'
                : 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(180, 83, 9, 0.45) 100%)',
              borderColor: isAdmin ? 'rgba(6, 182, 212, 0.7)' : 'rgba(245, 158, 11, 0.7)',
              borderWidth: '1px',
              borderStyle: 'solid',
              boxShadow: isAdmin
                ? '0 0 10px rgba(0, 210, 255, 0.3)'
                : '0 0 10px rgba(245, 158, 11, 0.3)',
            }}
          >
            <span
              className={` text-[11px] font-black tracking-tight leading-none ${
                isAdmin ? 'text-cyan-300' : 'text-amber-300'
              }`}
            >
              {isAdmin ? '👑 ADM' : '🎬 DIR'}
            </span>
            <span className="text-[11px] font-bold text-slate-200 tracking-tight font-sans truncate max-w-[85px]">
              {currentUser.name?.split(' ')[0] || 'User'}
            </span>
          </button>

          {/* Freccetta Menu Opzioni Profilo */}
          <button
            type="button"
            onClick={() => setDropdownOpen(prev => !prev)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Opzioni profilo e accessi"
          >
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-cyan-400' : ''}`}
            />
          </button>
        </div>

        {/* ── TAVOLA 3: Notifiche Intelligenti (Segnalatore che apre la tendina dall'alto) ── */}
        <button
          type="button"
          onClick={handleToggleSmartNotifications}
          className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-700/60 hover:border-teal-400/60 text-slate-200 hover:text-teal-300 transition-all cursor-pointer"
          title="Mostra notifiche intelligenti (nuovi lead sito web, preventivi in scadenza)"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold tracking-tight">
            Notifiche Smart
          </span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            4
          </span>
        </button>

      </div>

      {/* ── Dropdown Menu Popover (aperto centrato sotto la tavola) ── */}
      {dropdownOpen && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 rounded-2xl bg-[#0f172a] border border-slate-700/90 shadow-2xl p-2 z-50 animate-fadeIn"
          style={{
            fontFamily: '"Switzer", sans-serif',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 210, 255, 0.15)',
          }}
        >
          {/* Header Utente Corrente */}
          <div className="px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 mb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Profilo Attivo
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isAdmin ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isAdmin ? 'Super Admin' : 'Director'}
              </span>
            </div>
            <div className="text-sm font-bold text-white mt-1 truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {currentUser.email}
            </div>
          </div>

          {/* Azione Switch Veloce */}
          <button
            type="button"
            onClick={() => {
              switchUser(currentUser.id === 'usr-admin' ? 'usr-dipendente' : 'usr-admin')
              setDropdownOpen(false)
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-white flex items-center justify-between transition-colors cursor-pointer group mb-1"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className={isAdmin ? 'text-amber-400' : 'text-cyan-400'} />
              <span>Passa a {isAdmin ? 'Director (🎬 DIR)' : 'Admin (👑 ADM)'}</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 group-hover:text-slate-300">
              Switch rapido
            </span>
          </button>

          {/* Link Pagina Utenti & Permessi */}
          <button
            type="button"
            onClick={() => {
              navigate('/users')
              setDropdownOpen(false)
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-cyan-300 flex items-center gap-2 transition-colors cursor-pointer mb-1"
          >
            <Shield size={14} className="text-cyan-400" />
            <span>Gestione Utenti & Permessi</span>
          </button>

          {/* Link Registra Utente */}
          <button
            type="button"
            onClick={() => {
              navigate('/register')
              setDropdownOpen(false)
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-emerald-300 flex items-center gap-2 transition-colors cursor-pointer mb-1"
          >
            <UserPlus size={14} className="text-emerald-400" />
            <span>Registra Nuovo Utente</span>
          </button>

          {/* Separatore */}
          <div className="my-1 border-t border-slate-800" />

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              setDropdownOpen(false)
              logout()
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Esci (Logout)</span>
          </button>
        </div>
      )}
    </div>
  )
}
