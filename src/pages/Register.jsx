import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Dice5,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  KeyRound,
  Mail,
  User,
  Briefcase,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { generateRandomPassword, generateRandomEmail, generateRandomCredentials } from '../utils/credentialGenerator'
import { formatPasswordHashPreview } from '../utils/passwordCrypto'
import CrmFuturisticLogo from '../components/CrmFuturisticLogo'

function DadoBrandMark({ size = 20 }) {
  const h = size
  const wD = size * 0.8
  const wTri = size * 0.9
  const wO = size
  return (
    <div className="inline-flex items-center gap-1 leading-none select-none">
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

export default function Register() {
  const { registerUser } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Director')
  const [showPassword, setShowPassword] = useState(false)
  const [lastSymbolUsed, setLastSymbolUsed] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [copied, setCopied] = useState(false)
  const [registeredSuccessUser, setRegisteredSuccessUser] = useState(null)

  // Assegnazione casuale delle credenziali (Email suggerita + Password casuale con simbolo tastiera)
  const handleAssignRandomCredentials = () => {
    const creds = generateRandomCredentials(name, role)
    // Se l'utente non ha ancora specificato un'email, la genera casuale
    if (!email.trim()) {
      setEmail(creds.email)
    }
    setPassword(creds.password)
    setLastSymbolUsed(creds.symbolUsed)
    setErrorMsg(null)
  }

  // Genera solo nuova password casuale con simbolo da tastiera
  const handleRegeneratePasswordOnly = () => {
    const { password: newPwd, symbolUsed } = generateRandomPassword(12)
    setPassword(newPwd)
    setLastSymbolUsed(symbolUsed)
    setErrorMsg(null)
  }

  // Copia negli appunti email e password
  const handleCopyCredentials = () => {
    const textToCopy = `CREDENZIALI DADO CRM\nEmail: ${email}\nPassword: ${password}\nRuolo: ${role}`
    navigator.clipboard?.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Invio modulo registrazione
  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!name.trim()) {
      setErrorMsg('Inserisci il tuo nome e cognome.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Inserisci un indirizzo email valido.')
      return
    }
    if (!password.trim()) {
      setErrorMsg('Inserisci o genera una password casuale con un simbolo di tastiera.')
      return
    }

    const result = registerUser({
      name,
      email,
      password,
      role,
    })

    if (!result.success) {
      setErrorMsg(result.error)
      return
    }

    // Memorizza i dettagli per il riepilogo (la password è mostrata una sola volta all'utente; nel CRM è salvato solo result.user.passwordHash)
    setRegisteredSuccessUser({
      name,
      email,
      password,
      passwordHash: result.user?.passwordHash,
      role,
      symbolUsed: lastSymbolUsed || 'Simbolo incluso',
    })
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
          <div className="flex items-center gap-3.5 mb-2">
            <DadoBrandMark size={24} />
            <CrmFuturisticLogo
              isActive={true}
              height={24}
              width={90}
              className="shrink-0"
            />
          </div>
          <p className="text-slate-400 text-xs tracking-wide uppercase">
            DADO Creative Studio • Portale di Registrazione
          </p>
        </div>

        {/* Card Contenuto */}
        <div
          className="bg-[#242933]/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          style={{
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Se Registrazione Completata con Successo */}
          {registeredSuccessUser ? (
            <div className="flex flex-col items-center text-center space-y-5 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white tabular-nums">
                  Registrazione Completata!
                </h2>
                <p className="text-xs text-slate-300 font-sans mt-1">
                  Il tuo profilo è stato registrato ed è pronto per l'accesso a DADO CRM.
                </p>
              </div>

              {/* Box Riepilogo Credenziali Assegnate */}
              <div className="w-full p-4 rounded-2xl bg-black/40 border border-slate-700/80 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Credenziali di Accesso
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-300 text-xs cursor-pointer transition-all"
                    title="Copia email e password"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiato!' : 'Copia'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div>
                    <span className="text-slate-400 text-xs block">Nome:</span>
                    <span className="text-white font-medium">{registeredSuccessUser.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Email Registrata:</span>
                    <span className="text-cyan-300 text-xs select-all">{registeredSuccessUser.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Password (mostrata solo ora — copiala subito):</span>
                    <span className="text-emerald-400 text-sm font-bold bg-black/60 px-2 py-0.5 rounded select-all inline-block mt-0.5">
                      {registeredSuccessUser.password}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Codice Crittografico Salvato (Zero Password in Chiaro):</span>
                    <span className="text-teal-300 text-xs font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded inline-block mt-0.5">
                      {formatPasswordHashPreview(registeredSuccessUser.passwordHash)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Ruolo Studio:</span>
                    <span className="text-amber-300 text-xs font-bold uppercase">{registeredSuccessUser.role}</span>
                  </div>
                </div>
              </div>

              {/* Pulsanti Navigazione */}
              <div className="w-full space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-[#00d2ff] hover:opacity-95 text-slate-950 shadow-lg cursor-pointer transition-all transform active:scale-98 flex items-center justify-center gap-2"
                >
                  <span>Entra Subito nella Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to="/login"
                  className="block w-full py-2.5 px-4 text-center rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all"
                >
                  Vai alla schermata di Log In
                </Link>
              </div>
            </div>
          ) : (
            /* Modulo Form di Registrazione */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-cyan-400" />
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    Crea Nuovo Profilo
                  </h1>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">Step 1 di 1</span>
              </div>

              {/* Messaggio Errore */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs animate-fadeIn flex items-center gap-2">
                  <span>⚠️ {errorMsg}</span>
                </div>
              )}

              {/* Nome e Cognome */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nome e Cognome:</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Es. Davide Moretti"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm font-sans placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  required
                />
              </div>

              {/* Ruolo nello Studio */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ruolo nello Studio:</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all cursor-pointer"
                >
                  <option value="Director">Director (Regia, Produzione & Set)</option>
                  <option value="Collaboratore">Collaboratore Operativo</option>
                  <option value="Videomaker">Videomaker & Editor Video</option>
                  <option value="Fotografo">Fotografo di Scena</option>
                  <option value="Amministratore">Amministratore Studio</option>
                </select>
              </div>

              {/* Email Utilizzata */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email di Accesso:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setEmail(generateRandomEmail(name))}
                    className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                  >
                    + Suggerisci email aziendale
                  </button>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Es. davide@dadocreativestudio.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  required
                />
              </div>

              {/* ── SEZIONE PASSWORD & ASSEGNAZIONE RANDOM ── */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password di Accesso:</span>
                  </label>
                  {password && (
                    <button
                      type="button"
                      onClick={handleRegeneratePasswordOnly}
                      className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      title="Genera un'altra password casuale"
                    >
                      <Dice5 className="w-3 h-3" />
                      <span>Nuova password</span>
                    </button>
                  )}
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password casuale o personalizzata..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                    title={showPassword ? 'Nascondi password' : 'Mostra password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Box con pulsante primario per Assegnazione Random Credenziali */}
                <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-800/80 border border-cyan-500/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-cyan-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Assegnazione Random Credenziali</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAssignRandomCredentials}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer transform active:scale-95"
                      title="Genera ed assegna automaticamente email e password casuale con simbolo tastiera"
                    >
                      <Dice5 className="w-3.5 h-3.5" />
                      <span>Genera Casuali</span>
                    </button>
                  </div>

                  <p className="text-[10.5px] text-slate-400 font-sans leading-tight">
                    Genera istantaneamente una password sicura contenente lettere, numeri e <strong>almeno un simbolo della tastiera</strong> (<span className="text-cyan-300 font-bold font-sans">!@#$%^&*-_+=?</span>) e la salva solo come codice crittografico irreversibile (<span className="text-emerald-400 font-bold font-sans">pbkdf2$...</span>).
                  </p>

                  {/* Dettagli sulla password generata se presente */}
                  {password && (
                    <div className="pt-1 flex items-center justify-between text-[10.5px] border-t border-slate-700/60 mt-1">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Simbolo tastiera incluso</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCredentials}
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copiato!' : 'Copia'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Pulsante Submit Registrazione */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-emerald-400 hover:opacity-95 text-slate-950 shadow-lg cursor-pointer transition-all transform active:scale-98 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registra Utente ed Accedi</span>
                </button>
              </div>

              {/* Link al Login */}
              <div className="text-center pt-2 border-t border-slate-700/60">
                <p className="text-xs text-slate-400 font-sans">
                  Hai già un account registrato?{' '}
                  <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline">
                    Accedi qui →
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] font-semibold text-slate-500 mt-4 select-none">
          DADO Creative Studio • CRM Riservato
        </p>

      </div>
    </div>
  )
}
