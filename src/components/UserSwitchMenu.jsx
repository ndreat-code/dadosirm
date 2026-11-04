import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ArrowRightLeft, Check, Sparkles, UserCheck } from 'lucide-react'
import RegisterUserIcon from './RegisterUserIcon'
import { useAuth } from '../context/AuthContext'

export default function UserSwitchMenu({ className = '' }) {
  const navigate = useNavigate()
  const { users, currentUser, switchUser, logout, isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleLogout = () => {
    setIsOpen(false)
    logout()
    navigate('/login')
  }

  const handleSwitch = (userId) => {
    switchUser(userId)
    setIsOpen(false)
  }

  return (
    <div ref={menuRef} className={`relative inline-flex items-center select-none ${className}`}>
      {/* Icona in basso a sinistra (senza il segno "+") */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Cambio Utente & Log Out"
        className={`p-1 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 ${
          isOpen
            ? 'text-[#00d2ff] bg-white/10 shadow-[0_0_12px_rgba(0,210,255,0.35)]'
            : 'text-[#f59e0b] hover:text-[#00d2ff] hover:bg-white/5 active:scale-95'
        }`}
        style={{ marginLeft: 'calc(6px + 0.5cm)', marginRight: '2px' }}
      >
        <RegisterUserIcon size={22} strokeWidth={2.2} />
      </button>

      {/* Popover verso l'alto esclusivo: Cambio Utente & Log Out */}
      {isOpen && (
        <div
          className="absolute bottom-full mb-2 left-0 w-72 rounded-2xl bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/90 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(0,210,255,0.15)] p-3 z-50 animate-fadeIn"
          style={{
            fontFamily: '"Switzer", sans-serif',
          }}
        >
          {/* Header Profilo Attivo */}
          <div className="px-3 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 mb-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Profilo Attivo
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isAdmin
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isAdmin ? '👑 Super Admin' : '🎬 Director'}
              </span>
            </div>
            <div className="text-sm font-bold text-white mt-1 truncate">
              {currentUser?.name || 'Utente'}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {currentUser?.email || ''}
            </div>
          </div>

          {/* Sezione Cambio Utente */}
          <div className="mb-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 mb-1.5 flex items-center gap-1.5">
              <ArrowRightLeft size={12} className="text-cyan-400" />
              <span>Cambio Utente</span>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
              {(users || []).map((u) => {
                const isActive = u.id === currentUser?.id
                const isUserAdmin = u.accessType === 'admin' || u.badgeRole === 'Amministratore'
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSwitch(u.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-200'
                        : 'text-slate-200 hover:bg-slate-800/80 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">
                        {isUserAdmin ? '👑' : '🎬'}
                      </span>
                      <div className="min-w-0 truncate">
                        <div className="font-bold text-white truncate text-[12px]">
                          {u.name}
                        </div>
                        <div className="text-[10.5px] text-slate-400 truncate">
                          {u.badgeRole || (isUserAdmin ? 'Amministratore' : 'Director')}
                        </div>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="text-[10px] font-bold text-cyan-300 flex items-center gap-0.5 shrink-0 ml-1">
                        <Check size={12} />
                        Attivo
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 hover:text-slate-300 shrink-0 ml-1">
                        Seleziona
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Separatore */}
          <div className="my-2 border-t border-slate-800" />

          {/* Pulsante Log Out */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-300 hover:text-white bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            style={{ fontFamily: '"Switzer", sans-serif' }}
          >
            <LogOut size={14} className="text-red-400" />
            <span>Esci dal CRM (Log Out)</span>
          </button>
        </div>
      )}
    </div>
  )
}
