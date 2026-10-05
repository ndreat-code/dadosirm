import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LogIn,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Shield,
  ArrowRight,
  UserCheck,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function DadoBrandMark({ size = 22 }) {
  const h = size
  const wD = size * 0.8
  const wTri = size * 0.9
  const wO = size
  return (
    <div className="inline-flex items-center gap-1.5 leading-none select-none">
      <svg width={wD} height={h} viewBox="0 0 16 20" fill="none">
        <path d="M0 0 H4 C10.6 0 16 4.5 16 10 C16 15.5 10.6 20 4 20 H0 Z" fill="#53ba75" />
      </svg>
      <svg width={wTri} height={h} viewBox="0 0 18 20" fill="none">
        <polygon points="9 0, 18 20, 0 20" fill="#ea3824" />
      </svg>
      <svg width={wD} height={h} viewBox="0 0 16 20" fill="none">
        <path d="M0 0 H4 C10.6 0 16 4.5 16 10 C16 15.5 10.6 20 4 20 H0 Z" fill="#1bb7ed" />
      </svg>
      <svg width={wO} height={h} viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#fac429" />
      </svg>
    </div>
  )
}

export default function Login() {
  const { login, users } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    setTimeout(() => {
      const res = login(email, password)
      setLoading(false)

      if (res.success) {
        navigate('/')
      } else {
        setErrorMsg(res.error)
      }
    }, 200)
  }

  // Accesso rapido istantaneo con 1-click (senza bisogno di registrarsi)
  const handleDirectLogin = (targetEmail, targetPassword) => {
    setEmail(targetEmail)
    setPassword(targetPassword)
    setErrorMsg(null)
    setLoading(true)

    setTimeout(() => {
      const res = login(targetEmail, targetPassword)
      setLoading(false)
      if (res.success) {
        navigate('/')
      } else {
        setErrorMsg(res.error)
      }
    }, 150)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        background: 'linear-gradient(135deg, #1e2229 0%, #15181e 50%, #0d0f13 100%)',
        fontFamily: '"Switzer", sans-serif',
      }}
    >
      <div className="w-full max-w-md my-auto">

        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-6 text-center select-none">
          <div className="flex items-center gap-3 mb-2">
            <DadoBrandMark size={26} />
            <span
              className="text-white text-3xl font-bold tracking-wider"
              style={{ fontFamily: 'Sixtyfour, monospace' }}
            >
              CRM
            </span>
          </div>
          <p className="text-slate-400 text-xs font-mono tracking-wide uppercase">
            DADO Creative Studio • Accesso Riservato
          </p>
        </div>

        {/* Card Contenuto */}
        <div
          className="bg-[#242933]/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          style={{
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-emerald-400" />
              <h1 className="text-lg font-bold text-white font-mono tracking-tight">
                Accedi al CRM
              </h1>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Autenticazione</span>
          </div>

          {/* Messaggio Errore */}
          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs font-mono animate-fadeIn flex items-center gap-2">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email:</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="es. admin@dadocreativestudio.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Password:</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci la password..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Nascondi' : 'Mostra'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Pulsante Accedi */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-mono text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-[#00d2ff] hover:opacity-95 text-slate-950 shadow-lg cursor-pointer transition-all transform active:scale-98 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Accedi al CRM</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Accesso Rapido Diretto (1 Click) per rientrare subito senza doversi registrare */}
          <div className="mt-5 pt-4 border-t border-slate-700/60">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-2 text-center font-bold">
              ⚡ Rientra subito nel CRM (senza registrarti):
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDirectLogin('admin@dadocreativestudio.com', 'Admin2026!')}
                className="p-3 rounded-xl bg-slate-800/90 hover:bg-cyan-950/50 border border-slate-700 hover:border-cyan-400 text-left transition-all cursor-pointer group shadow-sm hover:shadow-[0_0_14px_rgba(0,210,255,0.2)]"
              >
                <div className="text-[12px] font-mono font-bold text-cyan-300 flex items-center justify-between">
                  <span>👑 Admin</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-cyan-400" />
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate mt-1">
                  1-Click immediato
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDirectLogin('davide@dadocreativestudio.com', 'Director2026!')}
                className="p-3 rounded-xl bg-slate-800/90 hover:bg-amber-950/50 border border-slate-700 hover:border-amber-400 text-left transition-all cursor-pointer group shadow-sm hover:shadow-[0_0_14px_rgba(245,158,11,0.2)]"
              >
                <div className="text-[12px] font-mono font-bold text-amber-300 flex items-center justify-between">
                  <span>🎬 Director</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-amber-400" />
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate mt-1">
                  1-Click immediato
                </div>
              </button>
            </div>
          </div>

          {/* Link opzionale alla Registrazione */}
          <div className="text-center pt-4 mt-4 border-t border-slate-700/60">
            <p className="text-xs text-slate-300 font-sans">
              Vuoi creare un nuovo account aggiuntivo?{' '}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold font-mono hover:underline block sm:inline mt-1 sm:mt-0">
                Registra nuovo profilo con credenziali casuali →
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] font-mono text-slate-500 mt-4 select-none">
          DADO Creative Studio • CRM Riservato
        </p>

      </div>
    </div>
  )
}
