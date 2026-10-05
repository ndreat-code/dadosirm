import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Database, Sparkles, X, ArrowRight, ArrowUpRight, Calendar as CalendarIcon, Clock, FileText, Paperclip, LogOut, UserPlus, Receipt, CheckCircle2, Building2, Mail, ExternalLink, ShieldCheck, ChevronRight, Maximize2, Minimize2, Copy, Check, Key, Settings, Send, Eye, EyeOff } from 'lucide-react'
import CameraShutter from '../components/CameraShutter'
import RegisterUserIcon from '../components/RegisterUserIcon'
import ConcentricRingsKpi from '../components/ConcentricRingsKpi'
import { getCurrentWeekDays, getCurrentMonthName, getTodayIso, getTomorrowIso, getCurrentWeekSundayIso, formatDayLong } from '../utils/dateUtils'
import { getCalendarDayData } from '../utils/calendarData'
import { useAuth } from '../context/AuthContext'

function KpiCard({
  label,
  value,
  bg = '#ffffff',
  labelColor = '#0284c7',
  valueColor = '#0f172a',
  sub,
  subColor = '#64748b',
  flex = '1',
  width,
  height,
  labelSize = '13.5px',
  valueSize = '36px',
  subSize = '12.5px',
  minHeight = '90px',
  padding = 'p-3.5',
  fontFamily = '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  border = '1.5px solid #cce5f6',
  borderRadius = '16px',
  boxShadow = '0 2px 10px rgba(27, 183, 237, 0.06)',
  labelFontFamily,
  valueFontFamily,
  subFontFamily,
  labelStroke,
  labelShadow,
  valueStroke,
  valueShadow,
  letterSpacing = '0.02em',
  valueWeight = 900,
}) {
  const effectiveLabelFont = labelFontFamily || fontFamily
  const effectiveValueFont = valueFontFamily || fontFamily
  const effectiveSubFont = subFontFamily || fontFamily

  return (
    <div
      className={`${padding} flex flex-col justify-between min-w-0 transition-all hover:shadow-md`}
      style={{
        backgroundColor: bg,
        borderRadius,
        border,
        boxShadow,
        minHeight,
        height: height || undefined,
        flex: width ? 'none' : flex,
        width: width || undefined,
        fontFamily,
      }}
    >
      {/* Titolo card */}
      <span
        className="font-black uppercase tracking-[0.08em] block leading-tight whitespace-nowrap"
        style={{
          color: labelColor,
          fontSize: labelSize,
          fontFamily: effectiveLabelFont,
          letterSpacing,
          WebkitTextStroke: labelStroke || undefined,
          textShadow: labelShadow || undefined,
        }}
      >
        {label}
      </span>
      <div className="mt-0.5">
        <span
          className="font-black leading-none block"
          style={{
            color: valueColor,
            fontSize: valueSize,
            fontFamily: effectiveValueFont,
            fontWeight: valueWeight || 900,
            letterSpacing,
            WebkitTextStroke: valueStroke || undefined,
            textShadow: valueShadow || undefined,
            paintOrder: 'stroke fill',
          }}
        >
          {value}
        </span>
        {/* Scritta sotto il numero */}
        {sub && (
          <span
            className="font-bold block mt-1 leading-tight whitespace-nowrap"
            style={{
              color: subColor || 'rgba(255,255,255,0.7)',
              fontSize: subSize,
              fontFamily: effectiveSubFont,
              letterSpacing: '-0.01em',
            }}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Box Collegamento Google Drive con Orologio (A filo inferiore con le cards superiori) ─────
function ClockDriveBox({
  width = '160px',
  height = '78px',
  minHeight,
  className = '',
} = {}) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hhmm = time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  const digits = hhmm.replace(/[^0-9]/g, '')
  const d1 = digits[0] || '0'
  const d2 = digits[1] || '0'
  const d3 = digits[2] || '0'
  const d4 = digits[3] || '0'

  return (
    <div
      className={`border border-[#cce5f6] hover:border-[#0284c7] rounded-2xl py-1.5 px-3 text-center cursor-pointer transition-all relative overflow-hidden group select-none shadow-xs hover:shadow-md hover:scale-[1.01] flex flex-col justify-between shrink-0 bg-white ${className}`}
      style={{
        backgroundColor: '#ffffff',
        width,
        height,
        minHeight: minHeight || height,
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(27, 183, 237, 0.06)',
      }}
      onClick={() => window.open('https://drive.google.com', '_blank')}
      title="Clicca per aprire Google Drive"
    >
      {/* Sfondo: Logo Google Drive dai colori vivi e meno trasparenti con blend multiply su fondo bianco */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img
          src="/google-drive-logo.jpg"
          alt="Google Drive Logo"
          className="w-[66px] h-[66px] object-contain opacity-75 group-hover:opacity-90 transition-opacity"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Cifre NERE non trasparenti dell'orario centrate: font Switzer 900 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <div
          className="flex items-center justify-center leading-none tracking-wider select-none text-[#000000]"
          style={{
            fontFamily: '"Switzer", sans-serif',
            fontSize: '35px',
            fontWeight: 900,
            letterSpacing: '0.02em',
            color: '#000000',
            textShadow: '0 0 5px #ffffff, 0 0 10px #ffffff',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          <span style={{ color: '#000000' }}>{d1}</span>
          <span style={{ color: '#000000' }}>{d2}</span>
          <span style={{ color: '#000000' }} className="mx-[1.5px] font-semibold animate-pulse text-[28px] leading-none">:</span>
          <span style={{ color: '#000000' }}>{d3}</span>
          <span style={{ color: '#000000' }}>{d4}</span>
        </div>
      </div>
    </div>
  )
}

// ── Box ASK OPEN AI (Attaccato alla banda bianca, con contenuto scalato al di sotto della banda) ──
function AskOpenAiBox({ onAskComplete, onLoadingChange, onStartAsk, onOpenConsole, onOpenAiConfig, aiConfig }) {
  const { canAskOpenAI, currentUser } = useAuth()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState(null)
  const [error, setError] = useState(null)

  // Ascolta l'evento globale di reset (premendo ESC) ed evento di query esterna (dado-ask-ai)
  useEffect(() => {
    const handleReset = () => {
      setQuery('')
      setAnswer(null)
      setError(null)
      setLoading(false)
    }
    const handleTriggerPrompt = (e) => {
      if (e.detail && e.detail.prompt) {
        setQuery(e.detail.prompt)
        handleAsk(e.detail.prompt)
      }
    }
    window.addEventListener('dado-ai-reset', handleReset)
    window.addEventListener('dado-ask-ai', handleTriggerPrompt)
    return () => {
      window.removeEventListener('dado-ai-reset', handleReset)
      window.removeEventListener('dado-ask-ai', handleTriggerPrompt)
    }
  }, [canAskOpenAI, loading])

  async function handleAsk(promptText) {
    if (!canAskOpenAI) {
      setError('Accesso OpenAI disabilitato per questo profilo (Riservato all’Amministratore)')
      return
    }
    const textToAsk = promptText || query
    if (!textToAsk.trim() || loading) return

    if (onStartAsk) onStartAsk(textToAsk)
    setLoading(true)
    if (onLoadingChange) onLoadingChange(true)
    setError(null)
    setAnswer(null)

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.badgeRole || currentUser?.role || '',
        },
        body: JSON.stringify({ prompt: textToAsk }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Errore nella richiesta ad OpenAI')
      }
      const ansObj = {
        question: textToAsk,
        content: data.answer,
        timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      }
      setAnswer(ansObj)
      if (onAskComplete) onAskComplete(ansObj)
      setQuery('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      if (onLoadingChange) onLoadingChange(false)
    }
  }

  return (
    <div
      className="bg-white rounded-none pt-2.5 px-4 pb-3 flex flex-col justify-between shadow-xs border-x border-b border-sky-100 min-h-0 relative z-20"
      style={{
        fontFamily: '"Switzer", sans-serif',
        height: '98px',
        minHeight: '98px',
        borderRadius: '0px',
        borderBottomLeftRadius: '0px',
        borderBottomRightRadius: '0px',
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <h3
              className="uppercase tracking-normal leading-tight select-none"
              style={{
                fontWeight: 900,
                fontSize: '1.15rem',
                fontFamily: '"Switzer", sans-serif',
                background: 'linear-gradient(90deg, #0284c7 0%, #0ea5e9 25%, #10b981 55%, #f59e0b 80%, #ef4444 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              ASK OPEN AI:
            </h3>
            {!canAskOpenAI && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                🔒 Riservato Admin
              </span>
            )}
            {canAskOpenAI && (
              <div className="flex items-center gap-1">
                {aiConfig?.hasKey && (
                  <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-none bg-emerald-50 text-emerald-700 border border-emerald-300">
                    {aiConfig.model || 'GPT-4o'}
                  </span>
                )}
                {onOpenAiConfig && (
                  <button
                    type="button"
                    onClick={onOpenAiConfig}
                    className="text-slate-400 hover:text-[#0284c7] font-bold p-0.5 cursor-pointer transition-colors"
                    title="Configura Chiave API OpenAI / Modello"
                  >
                    <Key size={13} />
                  </button>
                )}
                {onOpenConsole && (
                  <button
                    type="button"
                    onClick={onOpenConsole}
                    className="text-slate-400 hover:text-black font-bold p-0.5 cursor-pointer transition-colors"
                    title="Espandi al massimo spazio libero della dashboard"
                  >
                    <Maximize2 size={13} />
                  </button>
                )}
              </div>
            )}
          </div>
          {(answer || query) && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setAnswer(null)
                setError(null)
                if (onAskComplete) onAskComplete(null)
                window.dispatchEvent(new CustomEvent('dado-ai-reset'))
              }}
              className="text-[10px] text-gray-400 hover:text-black font-bold uppercase underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {!canAskOpenAI && (
          <div className="text-[10px] text-amber-700 bg-amber-50/80 border border-amber-200/80 p-1.5 my-1 rounded">
            Interrogazione OpenAI disabilitata per il profilo Dipendente.
          </div>
        )}

        {loading && (
          <div className="py-2 flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-[11px] font-bold text-gray-600 animate-pulse truncate">
              Analisi dati CRM in corso...
            </span>
          </div>
        )}

        {error && (
          <div className="text-[10px] text-red-600 bg-red-50 p-1.5 mt-1">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Input di testo integrato per digitare */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleAsk()
        }}
        className="mt-2 pt-2 border-t border-sky-100 flex items-center gap-1.5"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              e.stopPropagation()
              setQuery('')
              setAnswer(null)
              setError(null)
              window.dispatchEvent(new CustomEvent('dado-ai-reset'))
              window.dispatchEvent(new CustomEvent('dado-ai-focus', { detail: { active: false } }))
            }
          }}
          placeholder={canAskOpenAI ? "Controlli incrociati, contratti, shooting, fatturato..." : "🔒 Funzione riservata ad Admin"}
          disabled={loading || !canAskOpenAI}
          className={`flex-1 border px-2.5 py-1.5 text-xs rounded-lg placeholder:text-slate-400 focus:outline-none transition-all ${
            canAskOpenAI
              ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0284c7] focus:bg-white'
              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          style={{ fontFamily: '"Switzer", sans-serif' }}
        />
        <button
          type="submit"
          disabled={loading || !query.trim() || !canAskOpenAI}
          title={!canAskOpenAI ? 'Disabilitato per Dipendente' : 'Invia domanda'}
          className="bg-[#0284c7] hover:bg-[#0369a1] text-white disabled:opacity-40 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer disabled:cursor-not-allowed transition-all shadow-xs"
        >
          {loading ? '...' : '→'}
        </button>
      </form>
    </div>
  )
}

// ── Campo Barra di Ricerca per Note Sviluppatore (visibile solo per Director e Amministratore) ──
function DeveloperNotesSearchBar() {
  const { currentUser, isAdmin } = useAuth()
  const [note, setNote] = useState('')
  const [sentStatus, setSentStatus] = useState(false)

  const isDirectorOrAdmin =
    isAdmin ||
    currentUser?.badgeRole === 'Director' ||
    currentUser?.role === 'Director' ||
    currentUser?.badgeRole === 'Amministratore' ||
    currentUser?.id === 'usr-admin' ||
    currentUser?.id === 'usr-dipendente'

  if (!isDirectorOrAdmin) return null

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    const textToSend = note.trim()
    if (!textToSend) return

    setNote('')
    setSentStatus(true)
    setTimeout(() => setSentStatus(false), 3000)

    try {
      await fetch('/api/developer-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.badgeRole || currentUser?.role || '',
        },
        body: JSON.stringify({ note: textToSend }),
      })
    } catch (err) {
      console.warn('Salvataggio nota:', err)
    }
  }

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Campo Invia una nota */}
      <form onSubmit={handleSend} className="relative flex items-center">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={sentStatus ? "✓ Nota inviata allo sviluppatore!" : "Invia una nota"}
          title="Scrivi la tua nota e premi Invio per inviarla allo sviluppatore"
          className="w-[240px] sm:w-[280px] h-[28px] px-3.5 text-[11.5px] rounded-full bg-white/95 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00ffaa] shadow-sm transition-all"
          style={{ fontFamily: '"Switzer", sans-serif' }}
        />
      </form>

      {/* Dicitura a destra: Note per sviluppatore */}
      <span
        className="text-[12px] font-semibold text-white/90 whitespace-nowrap tracking-wide"
        style={{ fontFamily: '"Switzer", sans-serif' }}
      >
        Note per sviluppatore
      </span>
    </div>
  )
}

// ── Box NOTE sotto Google Drive: tipo pagina girata di un libro completamente bianca con piega a destra in rilievo ──
function TurnedPageNoteBox() {
  const [noteText, setNoteText] = useState('')
  const [saved, setSaved] = useState(false)
  const { currentUser } = useAuth()

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    const text = noteText.trim()
    if (!text) return
    setSaved(true)
    setNoteText('')
    setTimeout(() => setSaved(false), 2500)

    try {
      await fetch('/api/developer-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.badgeRole || currentUser?.role || '',
        },
        body: JSON.stringify({ note: text }),
      })
    } catch (err) {
      console.warn('Salvataggio nota:', err)
    }
  }

  return (
    <div className="w-full relative select-none">
      {/* Foglio bianco con angolo tagliato a 45° in alto a destra */}
      <div
        className="w-full bg-white shadow-xs hover:shadow-md transition-all border border-[#cce5f6]"
        style={{
          borderRadius: '16px 0 16px 16px',
          padding: '10px 14px 12px 14px',
          clipPath: 'polygon(0% 0%, calc(100% - 22px) 0%, 100% 22px, 100% 100%, 0% 100%)',
          minHeight: '74px',
          fontFamily: '"Switzer", sans-serif',
        }}
      >
        {/* Intestazione Note */}
        <div className="flex items-center justify-between">
          <span
            className="text-[#0f172a] font-bold text-[14.5px] tracking-wide"
            style={{ fontFamily: '"Switzer", sans-serif' }}
          >
            Note
          </span>
          <span className="text-[10px] font-mono text-slate-400 mr-4 font-semibold tracking-wider uppercase">
            {saved ? '✓ Salvata' : 'Studio'}
          </span>
        </div>

        {/* Campo inserimento nota / promemoria */}
        <form onSubmit={handleSave} className="mt-1.5 border-b border-slate-200 pb-1">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={saved ? "✓ Nota registrata!" : ""}
            className="w-full bg-transparent border-none outline-none text-[11.5px] text-slate-800 placeholder:text-slate-400 font-sans"
            style={{ fontFamily: '"Switzer", sans-serif' }}
          />
        </form>
      </div>

      {/* Pagina girata sulla destra con lieve rilievo 3D */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: '22px',
          height: '22px',
          background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 45%, #cbd5e1 100%)',
          clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%)',
          filter: 'drop-shadow(-2px 3px 2.5px rgba(0, 0, 0, 0.24))',
        }}
      />
    </div>
  )
}

function DadoBrandMark({ size = 18, color = '#111111' }) {
  const w = size * 0.78
  const h = size
  return (
    <div className="inline-flex items-center gap-1.5 leading-none" style={{ color }}>
      {/* D: semicircolare piena a sinistra */}
      <svg width={w} height={h} viewBox="0 0 16 20" fill="none">
        <path d="M0 0 H5 C11 0 16 4.5 16 10 C16 15.5 11 20 5 20 H0 V0 Z" fill="currentColor" />
      </svg>
      {/* △: triangolo equilatero con contorno netto e centro vuoto */}
      <svg width={w + 2} height={h} viewBox="0 0 18 20" fill="none">
        <polygon points="9 1, 17 19, 1 19" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      </svg>
      {/* D: semicircolare piena a sinistra */}
      <svg width={w} height={h} viewBox="0 0 16 20" fill="none">
        <path d="M0 0 H5 C11 0 16 4.5 16 10 C16 15.5 11 20 5 20 H0 V0 Z" fill="currentColor" />
      </svg>
      {/* O: rettangolo stondato totalmente riempito di nero */}
      <svg width={w} height={h} viewBox="0 0 16 20" fill="none">
        <rect x="0" y="0" width="16" height="20" rx="4.5" fill="currentColor" />
      </svg>
    </div>
  )
}

// ── Scacchiera Logo Studio (Come Screenshot 1) ────────────
function CheckerBg({ children }) {
  return (
    <div
      className="overflow-hidden border border-white/60 shadow-sm w-fit inline-block"
      style={{
        backgroundImage: `
          linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
          linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
          linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)
        `,
        backgroundSize: '10px 10px',
        backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Box con spazio disteso sia sopra che sotto */}
      <div className="px-2.5 py-1.5 text-left relative z-10 w-fit">
        {children}
      </div>
    </div>
  )
}

// ── Database CRM locale per ricerche istantanee nel database ───────────────
const crmDatabase = {
  companies: [
    { id: "comp-1", name: "Alpha Studio Milano", domain: "alphastudio.it", email: "info@alphastudio.it", phone: "+39 02 892341", industry: "Moda & Fotografia", status: "Attivo", services: ["Shooting fotografico", "Luci continue", "Noleggio studio"] },
    { id: "comp-2", name: "Beta Digital Agency", domain: "betadigital.com", email: "contatti@betadigital.com", phone: "+39 06 432190", industry: "Marketing & Social", status: "Attivo", services: ["Video Reels", "Post-produzione", "Color grading"] },
    { id: "comp-3", name: "Officine Meccaniche Riva", domain: "officineriva.it", email: "amministrazione@officineriva.it", phone: "+39 039 778899", industry: "Manifattura & B2B", status: "Attivo", services: ["Video corporate", "Interviste operai", "Dronata capannone"] },
    { id: "comp-4", name: "Vogue Events & Wedding", domain: "vogueevents.eu", email: "events@vogueevents.eu", phone: "+39 055 214567", industry: "Eventi Luxury", status: "Attivo", services: ["Copertura foto/video", "Luci architetturali", "Live streaming"] },
    { id: "comp-5", name: "Kroma Ceramiche", domain: "kromaceramiche.com", email: "commerciale@kromaceramiche.com", phone: "+39 0536 889900", industry: "Design & Arredo", status: "Attivo", services: ["Catalogo 3D", "Rendering set", "Foto still life"] },
    { id: "comp-6", name: "Solaris Green Energy", domain: "solarisenergy.it", email: "marketing@solarisenergy.it", phone: "+39 049 332211", industry: "Energie Rinnovabili", status: "Attivo", services: ["Spot promozionale", "Motion design", "Voiceover"] },
    { id: "comp-7", name: "Gusto & Tradizione Food", domain: "gustoetradizione.it", email: "ordini@gustoetradizione.it", phone: "+39 081 556677", industry: "Food & Beverage", status: "Attivo", services: ["Video ricette", "Food photography", "Packaging concept"] },
    { id: "comp-8", name: "Nexura Tech Solutions", domain: "nexuratech.io", email: "hello@nexuratech.io", phone: "+39 02 998877", industry: "Software & AI", status: "Attivo", services: ["Brand identity", "UI/UX mockup", "Video spiegazione software"] },
    { id: "comp-9", name: "Atelier Sposa Bellissima", domain: "sposabellissima.it", email: "info@sposabellissima.it", phone: "+39 011 445566", industry: "Moda Wedding", status: "Attivo", services: ["Shooting abiti", "Catalogo cartaceo", "Campagna Instagram"] },
    { id: "comp-10", name: "Tenuta Poggio Antico", domain: "poggioantico.wine", email: "cantina@poggioantico.wine", phone: "+39 0577 848484", industry: "Vitivinicolo Luxury", status: "Attivo", services: ["Docufilm vendemmia", "Etichette vini", "Shooting bottiglie"] },
    { id: "comp-11", name: "Urban Mobility Bike", domain: "urbanmobility.eu", email: "press@urbanmobility.eu", phone: "+39 02 771122", industry: "Mobilità & Sport", status: "Attivo", services: ["Spot outdoor", "Action cam video", "Foto lifestyle"] }
  ],
  opportunities: [
    { id: "opp-1", company: "Alpha Studio Milano", title: "Campagna Autunno 2026", value: 7500, stage: "Preventivo inviato" },
    { id: "opp-2", company: "Beta Digital Agency", title: "Pacchetto 12 Video TikTok/Reels", value: 4800, stage: "Preventivo inviato" },
    { id: "opp-3", company: "Officine Meccaniche Riva", title: "Video Corporate Stabilimento", value: 9200, stage: "Preventivo in scadenza" },
    { id: "opp-4", company: "Vogue Events & Wedding", title: "Allestimento & Regia Evento Villa", value: 6500, stage: "Bozza contratto" },
    { id: "opp-5", company: "Kroma Ceramiche", title: "Rendering Catalogo Bagno 2027", value: 5400, stage: "Preventivo inviato" },
    { id: "opp-6", company: "Solaris Green Energy", title: "Spot TV Locale + Digital ADS", value: 8100, stage: "Preventivo inviato" },
    { id: "opp-7", company: "Gusto & Tradizione Food", title: "10 Video Ricette Chef Stellato", value: 3600, stage: "Preventivo inviato" },
    { id: "opp-8", company: "Nexura Tech Solutions", title: "Teaser Lancio Nuova App AI", value: 2900, stage: "Bozza preventivo" },
    { id: "opp-9", company: "Tenuta Poggio Antico", title: "Shooting Nuova Annata Brunello", value: 3200, stage: "Ultimo preventivo" },
    { id: "opp-10", company: "Urban Mobility Bike", title: "Campagna Bici Elettrica 2026", value: 1500, stage: "Preventivo inviato" }
  ],
  nextActions: [
    { id: "act-1", period: "Today", company: "Officine Meccaniche Riva", title: "Call conferma preventivo corporate", time: "16:30" },
    { id: "act-2", period: "Today", company: "Solaris Green Energy", title: "Inviare revisione storyboard spot", time: "18:00" },
    { id: "act-3", period: "Domani", company: "Alpha Studio Milano", title: "Sopralluogo set luci studio B", time: "10:00" },
    { id: "act-4", period: "Sunday", company: "Vogue Events & Wedding", title: "Setup riprese matrimonio Villa Cora", time: "15:00" },
    { id: "act-5", period: "Monday", company: "Tenuta Poggio Antico", title: "Consegna bozze grafiche etichetta", time: "11:30" }
  ],
  inventory: [
    { id: "inv-1", name: "Memory", items: ["CFexpress Type B 512GB (x4)", "SD V90 256GB (x6)", "SSD T7 Shield 2TB"] },
    { id: "inv-2", name: "Obbiettivi", items: ["Sony 24-70mm f/2.8 GM II", "Sony 70-200mm f/2.8 GM II", "Sigma 35mm f/1.4 Art", "Sony 85mm f/1.4 GM"] },
    { id: "inv-3", name: "Luci", items: ["Aputure 600d Pro", "Aputure 300x Bi-Color", "Nanlite Pavotube II 30X (x4)", "Softbox Octa 120cm"] },
    { id: "inv-4", name: "EXTRA", items: ["Gimbal DJI RS3 Pro", "Monitor Atomos Ninja V+", "Microfoni Sennheiser AVX", "Drone DJI Mavic 3 Cine"] }
  ]
}

// ── Database Invoices / Fatturazione Elettronica DADO Studio ─────────────
const INITIAL_INVOICES = [
  {
    id: "inv-2026-088",
    number: "FAT-2026-088",
    companyId: "comp-3",
    companyName: "Officine Meccaniche Riva",
    contractCode: "DADO-CTR-2026-088",
    date: "18/09/2026",
    dueDate: "25/10/2026",
    amount: 9200,
    vat: 2024,
    totalWithVat: 11224,
    deposit: 4000,
    balance: 5200,
    status: "In attesa saldo",
    paymentMethod: "Bonifico Bancario 30gg d.f.",
    sdi: "M5UXCR1",
    pec: "officineriva@pec.it",
    description: "Video Corporate Industriale 4K HDR ProRes + Cut 60s LinkedIn per Fiera MecSpe",
    shootingDates: "24 e 25 Settembre 2026",
    location: "Stabilimento produttivo Monza e Brianza",
    materials: ["Sony FX3", "Sony 24-70mm f/2.8 GM II", "Drone DJI Mavic 3 Cine", "Sennheiser AVX"]
  },
  {
    id: "inv-2026-087",
    number: "FAT-2026-087",
    companyId: "comp-6",
    companyName: "Solaris Green Energy",
    contractCode: "DADO-CTR-2026-085",
    date: "05/09/2026",
    dueDate: "05/10/2026",
    amount: 8400,
    vat: 1848,
    totalWithVat: 10248,
    deposit: 8400,
    balance: 0,
    status: "Saldato",
    paymentMethod: "Bonifico Anticipato 100%",
    sdi: "KRR76B9",
    pec: "solarisenergy@pec.it",
    description: "Spot TV Broadcast Nazionale 30s + Campagna Digital ADS Green Transition",
    shootingDates: "12 e 13 Settembre 2026",
    location: "Limbo DADO Studio Milano",
    materials: ["Sony FX3", "Aputure 600d Pro", "Aputure 300x", "Gimbal DJI RS3 Pro"]
  },
  {
    id: "inv-2026-086",
    number: "FAT-2026-086",
    companyId: "comp-1",
    companyName: "Alpha Studio Milano",
    contractCode: "DADO-CTR-2026-082",
    date: "28/08/2026",
    dueDate: "28/09/2026",
    amount: 7500,
    vat: 1650,
    totalWithVat: 9150,
    deposit: 7500,
    balance: 0,
    status: "Saldato",
    paymentMethod: "Bonifico Vista Fattura",
    sdi: "SUBM70N",
    pec: "alphastudio@pec.it",
    description: "Campagna Moda Autunno/Inverno 2026 Still Life & Lookbook E-commerce",
    shootingDates: "08 Settembre 2026",
    location: "Studio A Milano",
    materials: ["Sony 70-200mm f/2.8 GM II", "Sony 85mm f/1.4 GM", "Nanlite Pavotube"]
  },
  {
    id: "inv-2026-085",
    number: "FAT-2026-085",
    companyId: "comp-5",
    companyName: "Kroma Ceramiche",
    contractCode: "DADO-CTR-2026-084",
    date: "15/09/2026",
    dueDate: "15/11/2026",
    amount: 6100,
    vat: 1342,
    totalWithVat: 7442,
    deposit: 3200,
    balance: 2900,
    status: "In attesa saldo",
    paymentMethod: "RIBA 60gg d.f.",
    sdi: "W7M2U86",
    pec: "kromaceramiche@pec.it",
    description: "Catalogo Arredo Bagno 2027: Rendering 3D, Set Virtuali & Still Life Ceramiche",
    shootingDates: "21 e 22 Settembre 2026",
    location: "Showroom Sassuolo (MO)",
    materials: ["Sony FX3", "Sigma 35mm f/1.4 Art", "Softbox Octa 120cm"]
  },
  {
    id: "inv-2026-084",
    number: "FAT-2026-084",
    companyId: "comp-4",
    companyName: "Vogue Events & Wedding",
    contractCode: "DADO-CTR-2026-079",
    date: "10/08/2026",
    dueDate: "10/09/2026",
    amount: 5800,
    vat: 1276,
    totalWithVat: 7076,
    deposit: 5800,
    balance: 0,
    status: "Saldato",
    paymentMethod: "Bonifico 50% acconto / 50% alla consegna",
    sdi: "0000000",
    pec: "vogueevents@pec.it",
    description: "Docufilm Wedding Luxury Internazionale & Regia Multicam Villa Cora Firenze",
    shootingDates: "19 Settembre 2026",
    location: "Villa Cora Firenze (15 ore fino alle 02:30)",
    materials: ["Sony FX3", "Sony 24-70mm GM II", "Sennheiser AVX", "Gimbal RS3 Pro"]
  },
  {
    id: "inv-2026-083",
    number: "FAT-2026-083",
    companyId: "comp-2",
    companyName: "Beta Digital Agency",
    contractCode: "DADO-CTR-2026-087",
    date: "20/09/2026",
    dueDate: "20/10/2026",
    amount: 4800,
    vat: 1056,
    totalWithVat: 5856,
    deposit: 2000,
    balance: 2800,
    status: "In attesa saldo",
    paymentMethod: "Bonifico Bancario 30gg d.f.",
    sdi: "P62R9S1",
    pec: "betadigital@pec.it",
    description: "Pacchetto 12 Video TikTok/Reels Verticali 9:16 + Color Grading DaVinci",
    shootingDates: "27 Settembre 2026",
    location: "Studio DADO Milano",
    materials: ["Sony FX3", "Nanlite Pavotube II 30X", "Atomos Ninja V+"]
  },
  {
    id: "inv-2026-082",
    number: "FAT-2026-082",
    companyId: "comp-10",
    companyName: "Tenuta Poggio Antico",
    contractCode: "DADO-CTR-2026-074",
    date: "12/07/2026",
    dueDate: "12/08/2026",
    amount: 4200,
    vat: 924,
    totalWithVat: 5124,
    deposit: 4200,
    balance: 0,
    status: "Saldato",
    paymentMethod: "Bonifico Bancario",
    sdi: "USAL8PV",
    pec: "poggioantico@pec.it",
    description: "Docufilm Vendemmia 2026 Brunello di Montalcino & Shooting Bottiglie Luxury",
    shootingDates: "02 Settembre 2026",
    location: "Montalcino (SI) - Vigna e Cantina",
    materials: ["Drone DJI Mavic 3 Cine", "Sony 70-200mm GM II"]
  },
  {
    id: "inv-2026-081",
    number: "FAT-2026-081",
    companyId: "comp-7",
    companyName: "Gusto & Tradizione Food",
    contractCode: "DADO-CTR-2026-068",
    date: "25/06/2026",
    dueDate: "25/07/2026",
    amount: 3900,
    vat: 858,
    totalWithVat: 4758,
    deposit: 3900,
    balance: 0,
    status: "Saldato",
    paymentMethod: "Bonifico Vista Fattura",
    sdi: "A4707H7",
    pec: "gustoetradizione@pec.it",
    description: "Serie 10 Video Ricette Chef Stellato con Dettagli Macro Food & Packaging",
    shootingDates: "15 Luglio 2026",
    location: "Cucina Master Napoli",
    materials: ["Sony FX3", "Sony 24-70mm GM II", "Aputure 300x"]
  },
  {
    id: "inv-2026-080",
    number: "FAT-2026-080",
    companyId: "comp-8",
    companyName: "Nexura Tech Solutions",
    contractCode: "DADO-CTR-2026-059",
    date: "18/05/2026",
    dueDate: "18/06/2026",
    amount: 3200,
    vat: 704,
    totalWithVat: 3904,
    deposit: 3200,
    balance: 0,
    status: "Saldato",
    paymentMethod: "Bonifico Bancario 30gg d.f.",
    sdi: "24M0X8B",
    pec: "nexuratech@pec.it",
    description: "Teaser Lancio Nuova Piattaforma SaaS AI & Brand Video Identity",
    shootingDates: "28 Maggio 2026",
    location: "Sede Nexura Milano",
    materials: ["Atomos Ninja V+", "Sony 85mm GM"]
  },
  {
    id: "inv-2026-079",
    number: "FAT-2026-079",
    companyId: "comp-9",
    companyName: "Atelier Sposa Bellissima",
    contractCode: "DADO-CTR-2026-053",
    date: "02/05/2026",
    dueDate: "02/06/2026",
    amount: 2300,
    vat: 506,
    totalWithVat: 2806,
    deposit: 2300,
    balance: 0,
    status: "Saldato",
    paymentMethod: "Bonifico Anticipato",
    sdi: "BA6ET11",
    pec: "sposabellissima@pec.it",
    description: "Shooting Collezione Alta Moda Sposa 2026 per Catalogo Cartaceo & Instagram",
    shootingDates: "10 Maggio 2026",
    location: "Atelier Torino",
    materials: ["Sony 70-200mm GM II", "Softbox Octa 120cm"]
  },
  {
    id: "inv-2026-078",
    number: "FAT-2026-078",
    companyId: "comp-11",
    companyName: "Urban Mobility Bike",
    contractCode: "DADO-CTR-2026-047",
    date: "14/04/2026",
    dueDate: "14/05/2026",
    amount: 1500,
    vat: 330,
    totalWithVat: 1830,
    deposit: 1500,
    balance: 0,
    status: "Saldato",
    paymentMethod: "Bonifico Vista Fattura",
    sdi: "K0ROAC2",
    pec: "urbanmobility@pec.it",
    description: "Video Clip Dinamica Outdoor Bici Elettrica Urbana & Reels Instagram",
    shootingDates: "22 Aprile 2026",
    location: "Parco Sempione Milano",
    materials: ["Drone DJI Mavic 3 Cine", "Action Cam"]
  }
]

// ── Dossier Clienti Attivi DADO Creative Studio (11 Aziende) ──
const ACTIVE_CLIENTS_DOSSIER = [
  {
    id: "comp-3",
    name: "Officine Meccaniche Riva",
    industry: "Manifattura Meccanica di Precisione",
    status: "Attivo",
    contactPerson: {
      name: "Ing. Marco Riva",
      role: "Managing Director & Titolare"
    },
    email: "amministrazione@officineriva.it",
    phone: "+39 039 992211",
    firstContact: {
      date: "15/01/2026",
      channel: "Inbound Sito Web (Form Contatti)",
      notes: "Cercavano un team specializzato in video corporate industriale 4K HDR per la fiera MecSpe 2026."
    },
    lastEmail: {
      referent: "Ing. Marco Riva (Managing Director)",
      email: "marco.riva@officineriva.it",
      subject: "Conferma shooting stabilimento e approvazione budget deliberato",
      date: "03/10/2026 18:14",
      snippet: "Buongiorno team Dado, vi confermiamo con piacere che il consiglio ha deliberato e approvato il preventivo di € 9.200 per lo shooting corporate e le riprese drone indoor. Attendiamo vostra conferma per avvio produzione e dettagli logistici."
    },
    contract: {
      code: "DADO-CTR-2026-088",
      fileName: "Contratto_OfficineRiva_signed.pdf",
      digitalFormat: "PDF con firma digitale InfoCert",
      status: "Firmato & Attivo",
      signedDate: "10/08/2026",
      terms: "Cessione totale diritti digital e paid ads; clausola di consegna prime bozze entro 48h.",
      amount: 5200,
      invoiceNumber: "FAT-2026-088"
    },
    history: [
      { step: "1. Primo Contatto & Briefing", date: "15/01/2026", desc: "Richiesta video corporate 4K HDR per fiera MecSpe 2026." },
      { step: "2. Sopralluogo Tecnico", date: "28/01/2026", desc: "Sopralluogo stabilimento Monza con fonico e pilota drone certificato ENAC." },
      { step: "3. Firma Contratto", date: "10/08/2026", desc: "Accordo DADO-CTR-2026-088 siglato digitalmente per € 5.200." },
      { step: "4. Set & Riprese", date: "15-16/09/2026", desc: "2 giorni di riprese con Sony FX3 e illuminazione cinema Aputure." },
      { step: "5. Risoluzione Imprevisto", date: "16/09/2026", desc: "Risolto sfarfallio LED 100Hz sincronizzando l'otturatore a 1/100s." },
      { step: "6. Consegna & Fatturazione", date: "25/09/2026", desc: "Master 4K consegnato; emessa fattura FAT-2026-088 con scadenza 25/10/2026." }
    ]
  },
  {
    id: "comp-6",
    name: "Solaris Green Energy",
    industry: "Energie Rinnovabili & Fotovoltaico",
    status: "Attivo",
    contactPerson: {
      name: "Dott.ssa Chiara Valenti",
      role: "Head of Brand Communication & ESG"
    },
    email: "marketing@solarisenergy.it",
    phone: "+39 045 882233",
    firstContact: {
      date: "05/03/2026",
      channel: "Referral Partner Fotovoltaico Veneto",
      notes: "Richiesta per spot TV locale e digital ads per inaugurazione nuovo parco agrivoltaico in Veneto."
    },
    lastEmail: {
      referent: "Elena Fontana (Marketing Assistant)",
      email: "e.fontana@solarisgreen.eu",
      subject: "Revisione Storyboard Spot TV + approvazione piano di volo drone",
      date: "03/10/2026 18:03",
      snippet: "Ciao ragazzi, il nostro direttore marketing ha approvato lo storyboard dello spot TV. Confermiamo le autorizzazioni di sorvolo del parco agrivoltaico e attendiamo la scaletta oraria del set."
    },
    contract: {
      code: "DADO-CTR-2026-085",
      fileName: "Accordo_Produzione_Solaris_TV.pdf",
      digitalFormat: "PDF con firma elettronica qualificata",
      status: "Firmato & Attivo",
      signedDate: "12/08/2026",
      terms: "Diritti TV regionali 12 mesi; riprese aeree autorizzate ENAC/D-Flight.",
      amount: 4800,
      invoiceNumber: "FAT-2026-084"
    },
    history: [
      { step: "1. Primo Contatto", date: "05/03/2026", desc: "Richiesta spot TV e campagna digital agrivoltaico." },
      { step: "2. Brief Creativo", date: "20/03/2026", desc: "Definizione storyboard con Dott.ssa Chiara Valenti." },
      { step: "3. Firma Contratto", date: "12/08/2026", desc: "Siglato DADO-CTR-2026-085 (€ 4.800)." },
      { step: "4. Shooting & Drone", date: "04-05/09/2026", desc: "Riprese parco solare con DJI Mavic 3 Cine e Sony FX3." },
      { step: "5. Risoluzione Imprevisto", date: "04/09/2026", desc: "Vento a 38 km/h gestito atterrando temporaneamente e riprendendo a terra con cavalletto zavorrato." },
      { step: "6. Conclusione & Saldo", date: "15/09/2026", desc: "Campagna consegnata e fattura FAT-2026-084 interamente saldata." }
    ]
  },
  {
    id: "comp-1",
    name: "Alpha Studio Milano",
    industry: "Design & Architettura d'Interni",
    status: "Attivo",
    contactPerson: {
      name: "Matteo Ferri",
      role: "Senior Art Director"
    },
    email: "info@alphastudio.it",
    phone: "+39 02 884422",
    firstContact: {
      date: "10/01/2026",
      channel: "Instagram / Mostra Design Week",
      notes: "Contattati direttamente dopo aver visto i nostri lavori di luce volumetrica. Collaborazione attiva da oltre 8 mesi."
    },
    lastEmail: {
      referent: "Chiara Rossi (Studio Production Coordinator)",
      email: "c.rossi@alphastudiomilano.com",
      subject: "Richiesta appuntamento in studio per calibrazione monitor e test luci",
      date: "03/10/2026 18:11",
      snippet: "Ciao DADO team, potremmo fare una call o incontro Lunedì alle 10:00 per concordare il setting luci del prossimo showroom?"
    },
    contract: {
      code: "DADO-CTR-2026-079",
      fileName: "Contratto_AlphaStudio_2026_signed.pdf",
      digitalFormat: "PDF con firma SPID",
      status: "Firmato & Attivo",
      signedDate: "15/07/2026",
      terms: "Collaborazione continuativa annuale per shooting showroom e cataloghi luxury.",
      amount: 4500,
      invoiceNumber: "FAT-2026-080"
    },
    history: [
      { step: "1. Primo Contatto", date: "10/01/2026", desc: "Incontro post Fuorisalone per consulenza visuale." },
      { step: "2. Firma Accordo Quadro", date: "15/07/2026", desc: "Accordo DADO-CTR-2026-079 (€ 4.500)." },
      { step: "3. Shooting Showroom", date: "18/07/2026", desc: "Shooting con ottica tilt-shift e luci calde volumetrico." },
      { step: "4. Saldo & Rinnovo", date: "20/08/2026", desc: "Fattura FAT-2026-080 saldata regolarmente." }
    ]
  },
  {
    id: "comp-2",
    name: "Beta Digital Agency",
    industry: "Marketing Digitale & Social Media",
    status: "Attivo",
    contactPerson: {
      name: "Alessandro Neri",
      role: "Head of Social Production"
    },
    email: "contatti@betadigital.com",
    phone: "+39 02 334455",
    firstContact: {
      date: "24/02/2026",
      channel: "LinkedIn InMail a Davide",
      notes: "Richiesta per fornitura continuativa pacchetti vertical video per un'applicazione bancaria under-35."
    },
    lastEmail: {
      referent: "Alessandro Neri (Head of Social)",
      email: "a.neri@betadigital.com",
      subject: "Consegna tagli verticali TikTok e approvazione stato avanzamento",
      date: "02/10/2026 11:20",
      snippet: "Ottimo lavoro sui 12 reel verticali, il cliente finale ha approvato senza modifiche. La contabilità sta predisponendo il saldo della fattura FAT-2026-083 entro la scadenza del 20/10."
    },
    contract: {
      code: "DADO-CTR-2026-073",
      fileName: "Contratto_BetaDigital_VerticalContent.pdf",
      digitalFormat: "PDF con firma digitale",
      status: "Firmato & Attivo",
      signedDate: "28/07/2026",
      terms: "Fornitura 12 short video verticali TikTok/Reels mensili con turnaround 48h.",
      amount: 2800,
      invoiceNumber: "FAT-2026-083"
    },
    history: [
      { step: "1. Primo Contatto", date: "24/02/2026", desc: "Contatto LinkedIn per pacchetto vertical video app fintech." },
      { step: "2. Accordo", date: "28/07/2026", desc: "Sigla DADO-CTR-2026-073 per fornitura continuativa (€ 2.800)." },
      { step: "3. Riprese in Studio", date: "15/09/2026", desc: "Sessione con attori under-35 e luci colorate Aputure RGB." },
      { step: "4. Risoluzione Imprevisto", date: "16/09/2026", desc: "Modifica testi After Effects risolta con template in 2 ore (+350€)." },
      { step: "5. Fatturazione", date: "20/09/2026", desc: "Fattura FAT-2026-083 emessa (€ 2.800 in scadenza 20/10/2026)." }
    ]
  },
  {
    id: "comp-5",
    name: "Kroma Ceramiche",
    industry: "Ceramica Industriale & Grandi Lastre",
    status: "Attivo",
    contactPerson: {
      name: "Geom. Paolo Baraldi",
      role: "Responsabile Marketing di Prodotto"
    },
    email: "commerciale@kromaceramiche.com",
    phone: "+39 0536 881122",
    firstContact: {
      date: "10/02/2026",
      channel: "Fiera Cersaie Bologna",
      notes: "Contatto diretto presso stand espositivo. Volevano rinnovare completamente l'immagine del catalogo grandi lastre 2027."
    },
    lastEmail: {
      referent: "Geom. Paolo Baraldi",
      email: "commerciale@kromaceramiche.com",
      subject: "Richiesta disponibilità luci e set per ottobre",
      date: "23/09/2026 17:15",
      snippet: "Ciao ragazzi, per i nuovi rendering e il catalogo grandi lastre avremmo bisogno di noleggiare anche le luci con voi per completare gli scatti rimanenti a metà mese."
    },
    contract: {
      code: "DADO-CTR-2026-068",
      fileName: "Contratto_Fornitura_Kroma2026.pdf",
      digitalFormat: "PDF con firma digitale",
      status: "Firmato & Attivo",
      signedDate: "10/08/2026",
      terms: "Accordo biennale per aggiornamento campionario; pagamento con RIBA 60gg.",
      amount: 5800,
      invoiceNumber: "FAT-2026-085"
    },
    history: [
      { step: "1. Primo Contatto", date: "10/02/2026", desc: "Incontro a Cersaie Bologna per catalogo grandi lastre." },
      { step: "2. Campionatura", date: "15/03/2026", desc: "Test di scatto su superficie marmorizzata lucida." },
      { step: "3. Firma Contratto", date: "10/08/2026", desc: "Sigla DADO-CTR-2026-068 biennale (€ 5.800)." },
      { step: "4. Shooting Lastre", date: "24-25/08/2026", desc: "Tunnel di diffusione e polarizzatore incrociato su flash e obiettivo." },
      { step: "5. Fattura & Saldo", date: "15/09/2026", desc: "FAT-2026-085 emessa (€ 2.900 acconto saldato, € 2.900 saldo al 15/11/2026)." }
    ]
  },
  {
    id: "comp-4",
    name: "Vogue Events & Wedding",
    industry: "Organizzazione Eventi Luxury & Wedding",
    status: "Attivo",
    contactPerson: {
      name: "Ginevra Moretti",
      role: "Exclusive Wedding Director"
    },
    email: "events@vogueevents.eu",
    phone: "+39 055 776655",
    firstContact: {
      date: "18/11/2025",
      channel: "Passaparola Catering Luxury Firenze",
      notes: "Consigliati per eventi internazionali in ville toscane grazie al nostro stile filmico e discreto."
    },
    lastEmail: {
      referent: "Giorgio Villa (Production Lead)",
      email: "giorgio.villa@vogueevents.it",
      subject: "Preventivo riprese e streaming evento Villa Cora",
      date: "28/09/2026 00:04",
      snippet: "Buonasera DADO Studio, vi confermo che gli sposi hanno approvato il montaggio highlight in 4K. Riceverete la conferma delle date per la stagione 2027 a breve."
    },
    contract: {
      code: "DADO-CTR-2026-064",
      fileName: "Contratto_Regia_VillaCora_signed.pdf",
      digitalFormat: "PDF con firma elettronica qualificata",
      status: "Firmato & Attivo",
      signedDate: "15/07/2026",
      terms: "Liberatorie privacy per tutti gli ospiti internazionali; saldo anticipato 100% prima della data evento.",
      amount: 6200,
      invoiceNumber: "FAT-2026-082"
    },
    history: [
      { step: "1. Primo Contatto", date: "18/11/2025", desc: "Raccomandazione per matrimoni esclusivi a Firenze." },
      { step: "2. Firma Contratto", date: "15/07/2026", desc: "DADO-CTR-2026-064 siglato (€ 6.200 interamente pagato)." },
      { step: "3. Riprese Villa Cora", date: "05/09/2026", desc: "Riprese 4K con stabilizzatore gimbal e drone su parco secolare." },
      { step: "4. Risoluzione Imprevisto", date: "05/09/2026", desc: "Piano pioggia attivato in 3 minuti spostando il set nel loggiato interno." },
      { step: "5. Consegna", date: "20/09/2026", desc: "Master cinematografico consegnato con pieno gradimento del cliente." }
    ]
  },
  {
    id: "comp-7",
    name: "Gusto & Tradizione Food",
    industry: "Ristorazione Gourmet & Food Experience",
    status: "Attivo",
    contactPerson: {
      name: "Chef Salvatore Esposito",
      role: "Executive Chef & Patron"
    },
    email: "ordini@gustoetradizione.it",
    phone: "+39 081 223344",
    firstContact: {
      date: "04/04/2026",
      channel: "Instagram / Video Reel virale",
      notes: "Ci hanno scritto dopo aver visto il montaggio slow-motion della lavorazione della pizza napoletana."
    },
    lastEmail: {
      referent: "Chef Salvatore Esposito",
      email: "salvatore@gustoetradizione.it",
      subject: "Complimenti per il montaggio video ricette e nuovo menu autunno",
      date: "25/09/2026 15:40",
      snippet: "Ragazzi, il video della pizza contemporanea ha superato 180.000 visualizzazioni in 4 giorni! Vogliamo programmare subito la sessione per i piatti autunnali a metà ottobre."
    },
    contract: {
      code: "DADO-CTR-2026-057",
      fileName: "Contratto_GustoTradizione_Ricette.pdf",
      digitalFormat: "PDF firmato con SPID",
      status: "Firmato & Attivo",
      signedDate: "20/07/2026",
      terms: "Diritti di riproduzione canali digitali e schermi in sala ristorante per 3 anni.",
      amount: 3600,
      invoiceNumber: "FAT-2026-081"
    },
    history: [
      { step: "1. Primo Contatto", date: "04/04/2026", desc: "Contatto Instagram dopo aver visto video food slow-motion." },
      { step: "2. Firma Contratto", date: "20/07/2026", desc: "Accordo DADO-CTR-2026-057 (€ 3.600)." },
      { step: "3. Shooting in Cucina", date: "28/08/2026", desc: "Riprese macro con tele 85mm GM per evitare vapori e schizzi." },
      { step: "4. Saldo & Consegna", date: "10/09/2026", desc: "Fattura FAT-2026-081 saldata via bonifico istantaneo." }
    ]
  },
  {
    id: "comp-10",
    name: "Tenuta Poggio Antico",
    industry: "Vitivinicolo Luxury & Wine Export",
    status: "Attivo",
    contactPerson: {
      name: "Dott. Andrea Pieri",
      role: "Titolare & Mastro Cantiniere"
    },
    email: "cantina@poggioantico.wine",
    phone: "+39 0577 848484",
    firstContact: {
      date: "12/01/2026",
      channel: "Incontro diretto Wine Expo Montalcino",
      notes: "Cliente fidelizzato per la documentazione visiva della vendemmia e la valorizzazione delle bottiglie d'annata."
    },
    lastEmail: {
      referent: "Dott. Andrea Pieri",
      email: "andrea.pieri@poggioantico.wine",
      subject: "Selezione scatti etichette Brunello Riserva e ringraziamenti",
      date: "20/09/2026 09:15",
      snippet: "Caro Davide, le foto delle bottiglie con luce radente calda sono spettacolari. I nostri importatori di New York sono rimasti entusiasti della resa visiva."
    },
    contract: {
      code: "DADO-CTR-2026-051",
      fileName: "Contratto_PoggioAntico_Vendemmia_signed.pdf",
      digitalFormat: "PDF con firma digitale",
      status: "Firmato & Attivo",
      signedDate: "05/07/2026",
      terms: "Cessione copyright per packaging globale ed export USA/Giappone; fornitura omaggio cassa Brunello Riserva.",
      amount: 3200,
      invoiceNumber: "FAT-2026-086"
    },
    history: [
      { step: "1. Primo Contatto", date: "12/01/2026", desc: "Incontro a Wine Expo Montalcino." },
      { step: "2. Firma Contratto", date: "05/07/2026", desc: "Sigla DADO-CTR-2026-051 (€ 3.200)." },
      { step: "3. Shooting Vigneti", date: "14/08/2026", desc: "Luce dorata simulata con Aputure 2800K post-tramonto." },
      { step: "4. Saldo", date: "01/09/2026", desc: "Fattura FAT-2026-086 regolarmente saldata." }
    ]
  },
  {
    id: "comp-8",
    name: "Nexura Tech Solutions",
    industry: "Software & Intelligenza Artificiale",
    status: "Attivo",
    contactPerson: {
      name: "Ing. Luca Castelli",
      role: "CTO & Co-Founder"
    },
    email: "hello@nexuratech.io",
    phone: "+39 02 998877",
    firstContact: {
      date: "15/06/2026",
      channel: "Incubatore Startup PoliHub Milano",
      notes: "Startup AI che necessitava di un teaser video di forte impatto per la presentazione agli investitori Venture Capital a Londra."
    },
    lastEmail: {
      referent: "Ing. Luca Castelli (CTO)",
      email: "l.castelli@nexuratech.io",
      subject: "Feedback positivo pitch investors a Londra con video teaser",
      date: "18/09/2026 14:22",
      snippet: "Ragazzi, il pitch è andato alla grande, il teaser video ha aperto la presentazione catturando l'attenzione dei VC. Round chiuso con successo!"
    },
    contract: {
      code: "DADO-CTR-2026-045",
      fileName: "Contratto_Nexura_TeaserApp_NDA.pdf",
      digitalFormat: "PDF firmato con clausola NDA riservatezza brevetto",
      status: "Firmato & Attivo",
      signedDate: "02/07/2026",
      terms: "Vincolo di non divulgazione assoluto prima del closing del round di investimento.",
      amount: 2900,
      invoiceNumber: "FAT-2026-087"
    },
    history: [
      { step: "1. Primo Contatto", date: "15/06/2026", desc: "Richiesta video teaser per investitori VC Londra a PoliHub." },
      { step: "2. Firma con NDA", date: "02/07/2026", desc: "DADO-CTR-2026-045 siglato con clausola riservatezza (€ 2.900)." },
      { step: "3. Produzione & Motion", date: "22/07/2026", desc: "Compositing After Effects modulare e riprese studio." },
      { step: "4. Saldo", date: "15/08/2026", desc: "Fattura FAT-2026-087 saldata." }
    ]
  },
  {
    id: "comp-9",
    name: "Atelier Sposa Bellissima",
    industry: "Alta Moda Sposa & Cerimonia",
    status: "Attivo",
    contactPerson: {
      name: "Stefania Conti",
      role: "Head Designer & Titolare Atelier"
    },
    email: "info@sposabellissima.it",
    phone: "+39 011 445566",
    firstContact: {
      date: "02/02/2026",
      channel: "Passaparola agenzia modelle Torino",
      notes: "Shooting completo della nuova collezione di abiti haute couture ricamati a mano."
    },
    lastEmail: {
      referent: "Stefania Conti",
      email: "stefania@sposabellissima.it",
      subject: "Stampa catalogo 2026 e approvazione definitiva bozze",
      date: "14/09/2026 16:05",
      snippet: "Gentile team DADO, le foto per la tipografia sono pronte e la resa cromatica dei ricami in seta è eccellente. Grazie per la vostra professionalità in studio."
    },
    contract: {
      code: "DADO-CTR-2026-038",
      fileName: "Accordo_Shooting_SposaBellissima.pdf",
      digitalFormat: "PDF con firma elettronica avanzata",
      status: "Firmato & Attivo",
      signedDate: "18/05/2026",
      terms: "Diritti stampa catalogo e distribuzione presso 45 boutique multimarca in Italia ed estero.",
      amount: 2300,
      invoiceNumber: "FAT-2026-079"
    },
    history: [
      { step: "1. Primo Contatto", date: "02/02/2026", desc: "Richiesta shooting collezione sposa 2026." },
      { step: "2. Firma Accordo", date: "18/05/2026", desc: "Accordo DADO-CTR-2026-038 (€ 2.300)." },
      { step: "3. Shooting Atelier", date: "30/06/2026", desc: "Shooting con teleobiettivo e ventilatori di precisione." },
      { step: "4. Saldo", date: "10/07/2026", desc: "Fattura FAT-2026-079 interamente saldata." }
    ]
  },
  {
    id: "comp-11",
    name: "Urban Mobility Bike",
    industry: "Mobilità Elettrica & Sport",
    status: "Attivo",
    contactPerson: {
      name: "Jacopo Bonomi",
      role: "Brand & Communication Manager"
    },
    email: "press@urbanmobility.eu",
    phone: "+39 02 771122",
    firstContact: {
      date: "18/12/2025",
      channel: "Email diretta dopo visionatura reel Instagram",
      notes: "Produzione spot di lancio per nuovo modello e-bike gravel in ambiente cittadino e metropolitano."
    },
    lastEmail: {
      referent: "Jacopo Bonomi",
      email: "j.bonomi@urbanmobility.eu",
      subject: "Report metriche campagna social e clip video gravel bike",
      date: "10/09/2026 12:40",
      snippet: "Ciao Davide, la clip dinamica dell'e-bike all'alba a CityLife sta performando benissimo sulle ads Meta. Ottima illuminazione naturale e stabilità della camera."
    },
    contract: {
      code: "DADO-CTR-2026-024",
      fileName: "Contratto_UrbanMobility_Launch_signed.pdf",
      digitalFormat: "PDF firmato digitalmente",
      status: "Firmato & Attivo",
      signedDate: "10/04/2026",
      terms: "Diritti di affissione outdoor e sponsorizzate social a livello paneuropeo.",
      amount: 1500,
      invoiceNumber: "FAT-2026-078"
    },
    history: [
      { step: "1. Primo Contatto", date: "18/12/2025", desc: "Contatto diretto via email per spot e-bike gravel." },
      { step: "2. Firma Contratto", date: "10/04/2026", desc: "DADO-CTR-2026-024 (€ 1.500)." },
      { step: "3. Riprese all'Alba", date: "12/05/2026", desc: "Permesso occupazione suolo pubblico Gae Aulenti & drone." },
      { step: "4. Saldo", date: "20/05/2026", desc: "Fattura FAT-2026-078 interamente saldata." }
    ]
  }
]

// ── Dati Impegni e Calendario Settimanale DADO Creative Studio (Sincronizzati con /calendar) ──
function getDaySchedule(dateIso) {
  return getCalendarDayData(dateIso)
}

// ── Dashboard Principale ──────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem('dado_invoices')
      return saved ? JSON.parse(saved) : INITIAL_INVOICES
    } catch {
      return INITIAL_INVOICES
    }
  })
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false)
  const [showActiveClientsModal, setShowActiveClientsModal] = useState(false)
  const [selectedClientIndex, setSelectedClientIndex] = useState(0)
  const [clientSearchQuery, setClientSearchQuery] = useState('')
  const [showInvoiceMenuModal, setShowInvoiceMenuModal] = useState(false)
  const [invoiceTab, setInvoiceTab] = useState('recent')
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('')
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    companyName: '',
    amount: '',
    deposit: '',
    dueDate: '',
    paymentMethod: 'Bonifico Bancario 30gg d.f.',
    description: '',
    sdi: '0000000',
    pec: '',
  })

  const [calendarVersion, setCalendarVersion] = useState(0)

  // Sincronizzazione con endpoint server (fatture e calendario/attività CRM)
  useEffect(() => {
    fetch('/api/crm/invoices')
      .then(res => res.json())
      .then(data => {
        if (data && data.invoices && data.invoices.length > 0) {
          setInvoices(data.invoices)
        }
      })
      .catch(() => {})

    fetch('/api/crm/summary')
      .then(res => res.json())
      .then(data => {
        if (data && data.nextActions) {
          try {
            localStorage.setItem('dado_crm_activities_cache', JSON.stringify(data.nextActions))
          } catch {}
          setCalendarVersion(v => v + 1)
        }
      })
      .catch(() => {})

    const onCalUpdate = () => setCalendarVersion(v => v + 1)
    window.addEventListener('dado-calendar-update', onCalUpdate)
    window.addEventListener('dado-activities-updated', onCalUpdate)
    return () => {
      window.removeEventListener('dado-calendar-update', onCalUpdate)
      window.removeEventListener('dado-activities-updated', onCalUpdate)
    }
  }, [])

  const handleMarkInvoicePaid = async (invId) => {
    const updated = invoices.map(inv => {
      if (inv.id === invId || inv.number === invId) {
        return { ...inv, deposit: inv.amount, balance: 0, status: 'Saldato', paidAt: new Date().toLocaleDateString('it-IT') }
      }
      return inv
    })
    setInvoices(updated)
    try {
      localStorage.setItem('dado_invoices', JSON.stringify(updated))
    } catch {}
    if (selectedInvoice && (selectedInvoice.id === invId || selectedInvoice.number === invId)) {
      setSelectedInvoice(prev => prev ? { ...prev, deposit: prev.amount, balance: 0, status: 'Saldato' } : null)
    }
    try {
      await fetch(`/api/crm/invoices/${invId}/pay`, { method: 'PATCH' })
    } catch {}
  }

  const handleCreateInvoice = async (e) => {
    e.preventDefault()
    if (!newInvoiceForm.companyName.trim() || !newInvoiceForm.amount) return
    const amt = parseFloat(newInvoiceForm.amount) || 0
    const vat = Math.round(amt * 0.22)
    const dep = parseFloat(newInvoiceForm.deposit) || 0
    const bal = Math.max(0, amt - dep)
    const newInv = {
      id: `inv-${Date.now()}`,
      number: `FAT-2026-${Math.floor(100 + Math.random() * 900)}`,
      companyName: newInvoiceForm.companyName.trim(),
      amount: amt,
      vat,
      totalWithVat: amt + vat,
      deposit: dep,
      balance: bal,
      status: bal === 0 ? 'Saldato' : 'In attesa saldo',
      date: new Date().toLocaleDateString('it-IT'),
      dueDate: newInvoiceForm.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT'),
      paymentMethod: newInvoiceForm.paymentMethod || 'Bonifico Bancario 30gg d.f.',
      sdi: newInvoiceForm.sdi || '0000000',
      pec: newInvoiceForm.pec || '',
      description: newInvoiceForm.description.trim() || 'Servizi di produzione video / foto DADO Studio',
    }
    const updated = [newInv, ...invoices]
    setInvoices(updated)
    try {
      localStorage.setItem('dado_invoices', JSON.stringify(updated))
    } catch {}
    setShowNewInvoiceModal(false)
    setNewInvoiceForm({
      companyName: '',
      amount: '',
      deposit: '',
      dueDate: '',
      paymentMethod: 'Bonifico Bancario 30gg d.f.',
      description: '',
      sdi: '0000000',
      pec: '',
    })
    try {
      await fetch('/api/crm/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInv),
      })
    } catch {}
  }

  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [pinnedCalendarDay, setPinnedCalendarDay] = useState(null)
  const [hoveredCalendarDay, setHoveredCalendarDay] = useState(null)
  const selectedCalendarDay = pinnedCalendarDay || hoveredCalendarDay
  const [activeOutputTab, setActiveOutputTab] = useState('auto') // 'day' | 'ai' | 'auto'

  const popupLeaveTimerRef = useRef(null)
  const dayHoverTimerRef = useRef(null)
  const isOverPopupRef = useRef(false)
  const isOverCalendarRef = useRef(false)
  const calendarContainerRef = useRef(null)
  const popupContainerRef = useRef(null)
  const popupScrollRef = useRef(null)
  const mondayButtonRef = useRef(null)
  const nextActionsRef = useRef(null)
  const askOpenAiRef = useRef(null)
  const colonnaDestraRef = useRef(null)
  const clockDriveRef = useRef(null)
  const noteBoxRef = useRef(null)
  const [nextActionsWidth, setNextActionsWidth] = useState(205)
  const [preventiviMarginTop, setPreventiviMarginTop] = useState(10)
  const [clockDriveHeight, setClockDriveHeight] = useState(null)

  useEffect(() => {
    function updateMeasurements() {
      // 1. Larghezza calibrata Next actions
      setNextActionsWidth(205)

      // 2. Calcola altezza Google Drive
      setClockDriveHeight(78)

      // 3. Allinea inizio Box Preventivi sotto Note garantendo piena visibilità
      if (nextActionsRef.current && noteBoxRef.current) {
        const nextRect = nextActionsRef.current.getBoundingClientRect()
        const noteRect = noteBoxRef.current.getBoundingClientRect()
        const offset = Math.round(nextRect.top - noteRect.bottom)
        setPreventiviMarginTop(Math.max(6, Math.min(offset, 20)))
      } else if (nextActionsRef.current && clockDriveRef.current) {
        const nextRect = nextActionsRef.current.getBoundingClientRect()
        const driveRect = clockDriveRef.current.getBoundingClientRect()
        const offset = Math.round(nextRect.top - driveRect.bottom)
        setPreventiviMarginTop(Math.max(8, Math.min(offset, 20)))
      } else if (nextActionsRef.current && askOpenAiRef.current) {
        const nextRect = nextActionsRef.current.getBoundingClientRect()
        const askRect = askOpenAiRef.current.getBoundingClientRect()
        const offset = Math.round(nextRect.top - askRect.bottom)
        setPreventiviMarginTop(Math.max(8, Math.min(offset, 20)))
      }
    }

    updateMeasurements()
    window.addEventListener('resize', updateMeasurements)
    const t1 = setTimeout(updateMeasurements, 60)
    const t2 = setTimeout(updateMeasurements, 250)
    return () => {
      window.removeEventListener('resize', updateMeasurements)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [selectedCalendarDay])

  const handleDayMouseEnter = useCallback((d) => {
    // Se un giorno è fissato/bloccato dal click, non cambiare al passaggio del mouse
    if (pinnedCalendarDay) return

    if (dayHoverTimerRef.current) {
      clearTimeout(dayHoverTimerRef.current)
      dayHoverTimerRef.current = null
    }
    if (popupLeaveTimerRef.current) {
      clearTimeout(popupLeaveTimerRef.current)
      popupLeaveTimerRef.current = null
    }

    if (hoveredCalendarDay?.date === d.date) return

    const sched = getDaySchedule(d.date)

    // Se nessun giorno è aperto, aprilo subito senza ritardo
    if (!hoveredCalendarDay) {
      if (!sched || !sched.events || sched.events.length === 0) {
        setHoveredCalendarDay(null)
        return
      }
      setHoveredCalendarDay(d)
      return
    }

    // Se un giorno è già visualizzato e il cursore sta solo "attraversando" gli altri giorni
    // per raggiungere il pop-up a destra, aspetta 160ms: in questo modo il passaggio rapido
    // sopra martedì, mercoledì, giovedì o sabato non cambia né chiude la finestra!
    dayHoverTimerRef.current = setTimeout(() => {
      if (!sched || !sched.events || sched.events.length === 0) {
        setHoveredCalendarDay(null)
        return
      }
      setHoveredCalendarDay(d)
    }, 160)
  }, [pinnedCalendarDay, hoveredCalendarDay])

  const handleCalendarMouseEnter = useCallback(() => {
    isOverCalendarRef.current = true
    if (popupLeaveTimerRef.current) {
      clearTimeout(popupLeaveTimerRef.current)
      popupLeaveTimerRef.current = null
    }
  }, [])

  const handleCalendarMouseLeave = useCallback(() => {
    isOverCalendarRef.current = false
    if (dayHoverTimerRef.current) {
      clearTimeout(dayHoverTimerRef.current)
      dayHoverTimerRef.current = null
    }
    popupLeaveTimerRef.current = setTimeout(() => {
      if (!isOverPopupRef.current && !isOverCalendarRef.current) {
        setHoveredCalendarDay(null)
        setPinnedCalendarDay(null)
      }
    }, 350)
  }, [])

  const handlePopupMouseEnter = useCallback(() => {
    isOverPopupRef.current = true
    if (dayHoverTimerRef.current) {
      clearTimeout(dayHoverTimerRef.current)
      dayHoverTimerRef.current = null
    }
    if (popupLeaveTimerRef.current) {
      clearTimeout(popupLeaveTimerRef.current)
      popupLeaveTimerRef.current = null
    }
  }, [])

  const handlePopupMouseLeave = useCallback(() => {
    isOverPopupRef.current = false
    popupLeaveTimerRef.current = setTimeout(() => {
      if (!isOverPopupRef.current && !isOverCalendarRef.current) {
        setHoveredCalendarDay(null)
        setPinnedCalendarDay(null)
      }
    }, 350)
  }, [])

  // 1. Gestione rotellina sul Pop-up: blocca al 100% lo scroll pagina e muove il testo
  useEffect(() => {
    const el = popupContainerRef.current
    if (!el) return
    const onWheel = (e) => {
      e.stopPropagation()
      if (popupScrollRef.current) {
        popupScrollRef.current.scrollTop += e.deltaY
        e.preventDefault()
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [selectedCalendarDay, aiResult, aiLoading])

  // 2. Gestione rotellina ANCHE DIRETTAMENTE sul Calendar Week:
  // Permette di scorrere i dettagli rimanendo con il puntatore sul giorno nel calendario!
  useEffect(() => {
    const calendarEl = calendarContainerRef.current
    if (!calendarEl) return
    const onCalendarWheel = (e) => {
      if (selectedCalendarDay && popupScrollRef.current) {
        e.stopPropagation()
        e.preventDefault()
        popupScrollRef.current.scrollTop += e.deltaY
      }
    }
    calendarEl.addEventListener('wheel', onCalendarWheel, { passive: false })
    return () => calendarEl.removeEventListener('wheel', onCalendarWheel)
  }, [selectedCalendarDay])

  // Stato data in tempo reale per mantenere la dashboard sempre aggiornata automaticamente
  const [realTimeDate, setRealTimeDate] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setRealTimeDate(new Date())
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Calcolo dinamico settimana e mese corrente
  const currentWeekDays = useMemo(() => getCurrentWeekDays(realTimeDate), [realTimeDate])
  const currentMonthName = useMemo(() => getCurrentMonthName(realTimeDate), [realTimeDate])
  const todayIso = useMemo(() => getTodayIso(realTimeDate), [realTimeDate])
  const tomorrowIso = useMemo(() => getTomorrowIso(realTimeDate), [realTimeDate])
  const sundayIso = useMemo(() => getCurrentWeekSundayIso(realTimeDate), [realTimeDate])

  // Modalità Focus Allargata per Ask OpenAI & Automazione Obiettivo
  const [isAiFocusMode, setIsAiFocusMode] = useState(false)
  const [shutterTrigger, setShutterTrigger] = useState(null)
  const [pendingTransition, setPendingTransition] = useState(null) // 'enter' | 'exit'
  const outputScrollRef = useRef(null)

  // Stato esteso per Console AI e Configurazione API Key
  const [aiConsoleInput, setAiConsoleInput] = useState('')
  const [showAiConfigModal, setShowAiConfigModal] = useState(false)
  const [aiConfig, setAiConfig] = useState({ hasKey: false, maskedKey: '', model: 'gpt-4o', disableOllama: true, currentEngine: '' })
  const [inputApiKey, setInputApiKey] = useState('')
  const [inputModel, setInputModel] = useState('gpt-4o')
  const [inputDisableOllama, setInputDisableOllama] = useState(true)
  const [configSaving, setConfigSaving] = useState(false)
  const [configSuccess, setConfigSuccess] = useState('')
  const [showApiKeyText, setShowApiKeyText] = useState(false)
  const [copiedAnswer, setCopiedAnswer] = useState(false)

  // Caricamento configurazione AI da backend
  useEffect(() => {
    fetch('/api/ai/config')
      .then(r => r.json())
      .then(cfg => {
        setAiConfig(cfg)
        if (cfg.model) setInputModel(cfg.model)
        if (cfg.disableOllama !== undefined) setInputDisableOllama(cfg.disableOllama)
      })
      .catch(() => {})
  }, [])

  const handleSaveAiConfig = async (e) => {
    if (e) e.preventDefault()
    setConfigSaving(true)
    setConfigSuccess('')
    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: inputApiKey.trim() || undefined,
          model: inputModel,
          disableOllama: inputDisableOllama,
        })
      })
      const data = await res.json()
      if (res.ok) {
        setAiConfig(prev => ({
          ...prev,
          hasKey: data.hasKey,
          maskedKey: data.hasKey ? (inputApiKey ? `${inputApiKey.slice(0, 7)}...${inputApiKey.slice(-4)}` : prev.maskedKey) : '',
          model: data.model,
          disableOllama: data.disableOllama,
          currentEngine: data.hasKey ? `OpenAI Cloud (${data.model})` : (data.disableOllama ? 'Motore CRM Interno' : 'Ollama Locale')
        }))
        setConfigSuccess('Configurazione salvata con successo!')
        setTimeout(() => {
          setShowAiConfigModal(false)
          setConfigSuccess('')
        }, 1200)
      } else {
        alert(data.error || 'Errore salvataggio configurazione')
      }
    } catch (err) {
      alert('Errore di connessione: ' + err.message)
    } finally {
      setConfigSaving(false)
    }
  }

  const handleAskFromConsole = async (promptOverride) => {
    const textToAsk = (typeof promptOverride === 'string' ? promptOverride : aiConsoleInput).trim()
    if (!textToAsk || aiLoading) return

    if (typeof promptOverride === 'string') {
      setAiConsoleInput(promptOverride)
    }
    setAiLoading(true)
    setAiResult(null)

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.badgeRole || currentUser?.role || 'admin',
        },
        body: JSON.stringify({
          prompt: textToAsk,
          model: aiConfig.model || 'gpt-4o',
          disableOllama: aiConfig.disableOllama ?? true,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Errore nella richiesta ad OpenAI')
      }
      const ansObj = {
        question: textToAsk,
        content: data.answer,
        activeEngine: data.activeEngine,
        timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      }
      setAiResult(ansObj)
      setAiConsoleInput('')
    } catch (err) {
      setAiResult({
        question: textToAsk,
        content: `⚠️ Errore durante l'elaborazione dell'analisi: ${err.message}`,
        activeEngine: 'Errore',
        timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      })
    } finally {
      setAiLoading(false)
    }
  }

  const triggerEnterFocus = useCallback((immediate = false) => {
    if (isAiFocusMode) return
    if (immediate) {
      setIsAiFocusMode(true)
      window.dispatchEvent(new CustomEvent('dado-ai-focus', { detail: { active: true } }))
    } else {
      setPendingTransition('enter')
      setShutterTrigger(Date.now())
    }
  }, [isAiFocusMode])

  const triggerExitFocus = useCallback(() => {
    if (!isAiFocusMode) {
      setAiResult(null)
      setAiLoading(false)
      window.dispatchEvent(new CustomEvent('dado-ai-reset'))
      return
    }
    setPendingTransition('exit')
    setShutterTrigger(Date.now())
  }, [isAiFocusMode])

  const handleShutterMidpoint = useCallback(() => {
    if (pendingTransition === 'enter') {
      setIsAiFocusMode(true)
      window.dispatchEvent(new CustomEvent('dado-ai-focus', { detail: { active: true } }))
    } else if (pendingTransition === 'exit') {
      setIsAiFocusMode(false)
      setAiResult(null)
      setAiLoading(false)
      window.dispatchEvent(new CustomEvent('dado-ai-focus', { detail: { active: false } }))
      window.dispatchEvent(new CustomEvent('dado-ai-reset'))
    }
    setPendingTransition(null)
  }, [pendingTransition])

  // Ascolto tasto ESC da tastiera per chiudere del tutto e resettare in automatico la ricerca
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowInvoiceMenuModal(false)
        setShowActiveClientsModal(false)
        setSelectedInvoice(null)
        setShowNewInvoiceModal(false)
        if (isAiFocusMode) {
          triggerExitFocus()
        } else if (aiResult || aiLoading) {
          setAiResult(null)
          setAiLoading(false)
          window.dispatchEvent(new CustomEvent('dado-ai-reset'))
        } else {
          window.dispatchEvent(new CustomEvent('dado-ai-reset'))
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAiFocusMode, aiResult, aiLoading, triggerExitFocus])

  // Pulizia all'unmount per ripristinare la sidebar
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('dado-ai-focus', { detail: { active: false } }))
    }
  }, [])

  // Gestore rotellina mouse: ovunque ci si trovi sul card dell'output, la rotella scorre il testo
  const handleOutputCardWheel = (e) => {
    if (outputScrollRef.current) {
      outputScrollRef.current.scrollTop += e.deltaY
    }
  }

  const activeExpandedDayRef = useRef(null)
  const [activeExpandedDay, setActiveExpandedDay] = useState(null)
  const [isClosingExpanded, setIsClosingExpanded] = useState(false)
  const closeTimerRef = useRef(null)

  const activeDayForSchedule = selectedCalendarDay || activeExpandedDay
  const currentDaySchedule = useMemo(() => {
    if (!activeDayForSchedule?.date) return null
    return getDaySchedule(activeDayForSchedule.date)
  }, [activeDayForSchedule, calendarVersion])

  // Mansioni in scadenza oggi (impegni odierni dal Calendario condiviso)
  const todayDeadlines = useMemo(() => getDaySchedule(todayIso)?.events || [], [todayIso, calendarVersion])

  // ── Espansione pop-up impegni al passaggio del cursore sui giorni del Calendar Week ──
  // Le sezioni laterali sotto il calendario scorrono fluidamente verso l'esterno, la barra laterale
  // si ritrae alle sole icone e la finestra pop-up si allarga rimanendo rigorosamente entro i margini della dashboard.
  const isDaySelectedWithEvents = !isAiFocusMode && Boolean(selectedCalendarDay && currentDaySchedule?.events?.length > 0)

  useEffect(() => {
    if (isDaySelectedWithEvents) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      activeExpandedDayRef.current = selectedCalendarDay
      setActiveExpandedDay(selectedCalendarDay)
      setIsClosingExpanded(false)
    } else if (activeExpandedDayRef.current && !isClosingExpanded) {
      setIsClosingExpanded(true)
      closeTimerRef.current = setTimeout(() => {
        activeExpandedDayRef.current = null
        setActiveExpandedDay(null)
        setIsClosingExpanded(false)
      }, 320)
    }
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [isDaySelectedWithEvents, selectedCalendarDay])

  const isDayExpanded = isDaySelectedWithEvents || (Boolean(activeExpandedDay) && !isClosingExpanded)

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('dado-sidebar-compact', { detail: { active: isDayExpanded } }))
  }, [isDayExpanded])

  useEffect(() => () => {
    window.dispatchEvent(new CustomEvent('dado-sidebar-compact', { detail: { active: false } }))
  }, [])

  // Curva di accelerazione Apple/iOS ultra-fluida per le transizioni verso l'esterno
  const slideEase = 'cubic-bezier(0.16, 1, 0.3, 1)'

  const colonna1SlideStyle = isDayExpanded
    ? {
        transform: 'translateX(-130%)',
        opacity: 0,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
        transition: `transform 420ms ${slideEase} 60ms, opacity 320ms ${slideEase} 60ms`,
      }
    : {
        transform: 'translateX(0)',
        opacity: 1,
        willChange: 'transform, opacity',
        transition: `transform 420ms ${slideEase}, opacity 350ms ${slideEase}`,
      }

  const colonna2SlideStyle = isDayExpanded
    ? {
        transform: 'translateX(-130%)',
        opacity: 0,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
        transition: `transform 420ms ${slideEase} 30ms, opacity 320ms ${slideEase} 30ms`,
      }
    : {
        transform: 'translateX(0)',
        opacity: 1,
        willChange: 'transform, opacity',
        transition: `transform 420ms ${slideEase} 30ms, opacity 350ms ${slideEase} 30ms`,
      }

  const colonna3SlideStyle = isDayExpanded
    ? {
        transform: 'translateX(-130%)',
        opacity: 0,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
        transition: `transform 420ms ${slideEase}, opacity 320ms ${slideEase}`,
      }
    : {
        transform: 'translateX(0)',
        opacity: 1,
        willChange: 'transform, opacity',
        transition: `transform 420ms ${slideEase} 60ms, opacity 350ms ${slideEase} 60ms`,
      }

  const nextActionsSlideStyle = {
    // Si muove solidalmente con Colonna 3 senza collassare la larghezza per massima fluidità
  }

  const slideRightStyle = (delay = 0) => ({
    transform: isDayExpanded ? 'translateX(130%)' : 'translateX(0)',
    opacity: isDayExpanded ? 0 : 1,
    pointerEvents: isDayExpanded ? 'none' : 'auto',
    willChange: 'transform, opacity',
    transition: isDayExpanded
      ? `transform 420ms ${slideEase} ${delay}ms, opacity 320ms ${slideEase} ${delay}ms`
      : `transform 420ms ${slideEase} ${90 - delay}ms, opacity 350ms ${slideEase} ${90 - delay}ms`,
  })

  // Finestra Pop-Up posizionata rigorosamente entro i margini della Dashboard (da sotto Calendar Week alla banda inferiore)
  const popupExpandStyle = (isDayExpanded || activeExpandedDay)
    ? {
        position: 'absolute',
        left: 'calc(6px + 0.2cm)',
        right: 'calc(8px + 0.3cm)',
        top: 'calc(98px + 0.35cm)',
        bottom: '0.2cm',
        width: 'auto',
        maxWidth: 'none',
        height: 'auto',
        maxHeight: 'none',
        zIndex: 35,
        margin: 0,
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        border: '1.5px solid #cce5f6',
        boxShadow: '0 16px 48px rgba(27, 183, 237, 0.18), 0 4px 16px rgba(0, 0, 0, 0.08)',
        opacity: isClosingExpanded ? 0 : 1,
        transform: isClosingExpanded ? 'translateY(12px) scale(0.98)' : 'translateY(0) scale(1)',
        pointerEvents: isClosingExpanded ? 'none' : 'auto',
        willChange: 'transform, opacity',
        transition: `opacity 300ms ${slideEase}, transform 380ms ${slideEase}`,
      }
    : {
        transition: `all 380ms ${slideEase}`,
      }

  return (
    <div className="h-full min-h-screen md:min-h-0 bg-transparent flex flex-col flex-1 relative overflow-hidden">
      {/* Automazione otturatore macchina fotografica Cine/Foto */}
      <CameraShutter
        trigger={shutterTrigger}
        onMidpoint={handleShutterMidpoint}
        duration={650}
      />

      {/* ── Banda Superiore: unita alla barra laterale sinistra (#2d3139) a tutta larghezza senza interruzioni ── */}
      <div className="w-full flex-shrink-0 relative z-20">
        <div
          className="w-full rounded-none"
          style={{
            height: 'calc(3rem - 0.5cm)',
            background: 'linear-gradient(90deg, #2d3139 0%, #2d3139 calc(100% - 480px), #64748b calc(100% - 400px), #cbd5e1 calc(100% - 340px), #ffffff calc(100% - 295px), #ffffff 100%)',
            borderTopLeftRadius: '0px',
            borderBottomLeftRadius: '0px',
            borderTopRightRadius: '0px',
            borderBottomRightRadius: '0px',
          }}
        />
      </div>

      {/* Canvas Principale armonizzato (sotto la banda superiore, unificato alla barra laterale sinistra, arrotondato in basso a sinistra) */}
      <div
        className="h-full flex-1 rounded-tl-none rounded-bl-[48px] rounded-tr-none rounded-br-none flex flex-col justify-between relative min-w-0 overflow-hidden"
        style={{
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
          borderLeft: '1.5px solid #d4ebf9',
          background: `
            radial-gradient(ellipse 480px 360px at 8% 18%, rgba(83, 186, 117, 0.16) 0%, rgba(83, 186, 117, 0.04) 55%, transparent 75%),
            radial-gradient(ellipse 520px 420px at 92% 14%, rgba(27, 183, 237, 0.18) 0%, rgba(27, 183, 237, 0.05) 55%, transparent 75%),
            radial-gradient(ellipse 460px 380px at 45% 82%, rgba(234, 56, 36, 0.13) 0%, rgba(234, 56, 36, 0.03) 55%, transparent 75%),
            radial-gradient(ellipse 440px 340px at 85% 78%, rgba(250, 196, 41, 0.16) 0%, rgba(250, 196, 41, 0.04) 55%, transparent 75%),
            radial-gradient(ellipse 380px 300px at 28% 48%, rgba(27, 183, 237, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 400px 320px at 68% 35%, rgba(83, 186, 117, 0.11) 0%, transparent 70%),
            linear-gradient(180deg, #f0f8fd 0%, #e6f3fa 100%)
          `,
          borderTopLeftRadius: '0px',
          borderTopRightRadius: '0px',
          borderBottomRightRadius: '0px',
          fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Elementi organici d'atmosfera con sfocatura alta (blur-3xl) che diffondono i colori del brand logo sullo sfondo senza toccare i riquadri */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
          {/* Macchia Verde brand (#53ba75) - zona sinistra/centrale */}
          <div
            className="absolute rounded-full"
            style={{
              top: '5%',
              left: '6%',
              width: '420px',
              height: '340px',
              background: 'radial-gradient(circle, rgba(83, 186, 117, 0.22) 0%, rgba(83, 186, 117, 0.08) 50%, transparent 75%)',
              filter: 'blur(54px)',
              transform: 'rotate(-12deg)',
            }}
          />
          {/* Macchia Ciano brand (#1bb7ed) - zona destra superiore */}
          <div
            className="absolute rounded-full"
            style={{
              top: '8%',
              right: '4%',
              width: '460px',
              height: '360px',
              background: 'radial-gradient(circle, rgba(27, 183, 237, 0.25) 0%, rgba(27, 183, 237, 0.08) 50%, transparent 75%)',
              filter: 'blur(58px)',
              transform: 'rotate(18deg)',
            }}
          />
          {/* Macchia Rosso Corallo brand (#ea3824) - zona inferiore centrale/sinistra */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: '4%',
              left: '32%',
              width: '440px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(234, 56, 36, 0.16) 0%, rgba(234, 56, 36, 0.05) 50%, transparent 75%)',
              filter: 'blur(60px)',
              transform: 'rotate(25deg)',
            }}
          />
          {/* Macchia Giallo Caldo brand (#fac429) - zona destra inferiore */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: '10%',
              right: '8%',
              width: '400px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(250, 196, 41, 0.22) 0%, rgba(250, 196, 41, 0.06) 50%, transparent 75%)',
              filter: 'blur(52px)',
              transform: 'rotate(-15deg)',
            }}
          />
          {/* Sfumatura di raccordo tra Ciano e Verde nel quadrante centrale */}
          <div
            className="absolute rounded-full"
            style={{
              top: '38%',
              left: '20%',
              width: '350px',
              height: '280px',
              background: 'radial-gradient(circle, rgba(27, 183, 237, 0.14) 0%, rgba(83, 186, 117, 0.10) 45%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
        </div>

        {/* ── Contenuto Principale della Dashboard (allineato orizzontalmente e verticalmente sotto la banda bianca, z-10 sopra lo sfondo) ── */}
        <div className="flex-1 min-h-0 pl-2 pr-8 pt-0 pb-0 flex gap-6 min-w-0 items-stretch overflow-y-auto overflow-x-hidden relative z-10">

        {/* ══ COLONNA SINISTRA & CENTRALE (allineata sotto la banda bianca) ══ */}
        <div className="flex-1 flex flex-col gap-2.5 min-w-0">

          {/* Intestazione Dashboard (visibile solo se non in Focus Mode) */}
          {!isAiFocusMode && (
            <div className="flex items-start justify-between gap-4 flex-wrap" style={{ marginTop: 'calc(-6px + 0.7cm)' }}>
              <div className="flex items-start">
                <div>
                  {/* Sottotitolo "Go get it today" */}
                  <p style={{ marginTop: '4px', marginBottom: '6px', fontSize: '18px', fontFamily: '"Switzer", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    <span style={{ color: '#0ca0e4' }}>Go get it</span>
                    <span style={{ display: 'inline-block', width: '10px' }}>&nbsp;</span>
                    <span style={{ color: '#22e05a', fontSize: 'calc(18px + 3pt)' }}>today</span>
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* ── IN FOCUS MODE: SEZIONE OUTPUT ALLARGATA A TUTTO LO SPAZIO DISPONIBILE DELLA DASHBOARD ── */}
          {isAiFocusMode && (
            <div
              onWheel={handleOutputCardWheel}
              className="w-full flex-1 flex flex-col justify-between p-5 shadow-2xl relative animate-fadeIn"
              style={{
                backgroundColor: '#0a0f1d',
                border: '1.5px solid #1e293b',
                boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.85), inset 0 1px 2px rgba(255, 255, 255, 0.08)',
                minHeight: '520px',
                height: 'calc(100vh - 170px)',
                fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                borderRadius: '0px',
              }}
            >
              {/* 1. Header Superiore della Console AI */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 gap-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none bg-sky-500/20 text-[#38bdf8] border border-sky-400/30 flex items-center justify-center font-black text-sm">
                    AI
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-white font-black text-base tracking-wide uppercase select-none">
                        ASK OPENAI • INTELLIGENZA AZIENDALE DADO
                      </h2>
                      <span
                        className={`text-[10.5px] px-2.5 py-0.5 font-bold uppercase tracking-wider border rounded-none ${
                          aiConfig.hasKey
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
                            : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                        }`}
                      >
                        {aiConfig.hasKey ? `🟢 ${aiConfig.currentEngine || 'OpenAI Cloud'}` : '⚙️ API Key da Configurare'}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-400 font-medium">
                      Audit incrociato in tempo reale: contratti, shooting, fatturato, saldi scoperti e inventario
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAiConfigModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                    title="Configura Chiave API OpenAI / Modello"
                  >
                    <Key size={13} className="text-[#38bdf8]" />
                    <span>Configura API Key</span>
                  </button>

                  {aiResult?.content && (
                    <button
                      type="button"
                      onClick={() => {
                        if (aiResult?.content) {
                          navigator.clipboard.writeText(aiResult.content)
                          setCopiedAnswer(true)
                          setTimeout(() => setCopiedAnswer(false), 2000)
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                      title="Copia l'analisi negli appunti"
                    >
                      {copiedAnswer ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copiedAnswer ? 'Copiato!' : 'Copia Analisi'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setAiResult(null)
                      setAiConsoleInput('')
                    }}
                    className="px-2.5 py-1.5 rounded-none bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                    title="Azzera la sessione di ricerca"
                  >
                    Nuova Ricerca
                  </button>

                  <button
                    type="button"
                    onClick={triggerExitFocus}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    title="Chiudi la console ed esci dalla visuale a schermo intero (ESC)"
                  >
                    <span>✕ Chiudi</span>
                    <kbd className="px-1 py-0.2 rounded bg-black/40 text-[9px] text-white font-mono border border-white/20">
                      ESC
                    </kbd>
                  </button>
                </div>
              </div>

              {/* 2. Barra Controlli Rapidi Incrociati */}
              <div className="pt-2.5 pb-2 flex items-center gap-1.5 overflow-x-auto flex-shrink-0 text-xs">
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
                  <Sparkles size={12} className="text-[#38bdf8]" />
                  Controlli Rapidi:
                </span>
                {[
                  { label: '⚡ Contratti vs Fatturato e Saldi Aperti', query: 'Incrocia i contratti firmati con il fatturato emesso e gli incassi reali: quali aziende hanno ancora un saldo aperto da pagare e quali importi mancano?' },
                  { label: '🎥 Attrezzature vs Date di Shooting', query: 'Verifica il calendario delle date di shooting a settembre e incrocialo con le attrezzature assegnate (Sony FX3, Mavic 3 Cine, Aputure 600d): ci sono conflitti di disponibilità o sovrapposizioni?' },
                  { label: '⚠️ Verifica Acconti Non Versati', query: 'Controlla lo stato dei contratti e delle fatture nel CRM: ci sono aziende che non hanno ancora versato l\'acconto previsto o che risultano scoperte sul primo pagamento?' },
                  { label: '📊 Redditività e Sinergie Commesse', query: 'Analizza la redditività giornaliera delle produzioni in corso e identifica sinergie o cluster di clienti per attrezzatura e format video.' },
                ].map((btn, bIdx) => (
                  <button
                    key={bIdx}
                    type="button"
                    disabled={aiLoading}
                    onClick={() => handleAskFromConsole(btn.query)}
                    className="px-2.5 py-1 rounded-none bg-slate-900/90 hover:bg-sky-950 text-slate-300 hover:text-sky-200 border border-slate-700/80 hover:border-sky-500/50 text-[11.5px] font-medium whitespace-nowrap transition-all cursor-pointer"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* 3. Corpo Centrale Scorrevole con Output */}
              <div
                ref={outputScrollRef}
                className="flex-1 overflow-y-auto overscroll-contain pr-2 my-2 space-y-3 select-text"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#38bdf8 #0f172a',
                }}
              >
                {aiLoading ? (
                  <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-slate-300 gap-3 py-12">
                    <div className="w-9 h-9 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-bold text-white tracking-wide animate-pulse">
                        Interrogazione database CRM in corso con {aiConfig.hasKey ? (aiConfig.model || 'OpenAI GPT-4o') : 'motore di audit'}...
                      </span>
                      <span className="text-xs text-slate-400">
                        Incrocio e verifica relazionale dei contratti, date di set, inventario e saldi contabili
                      </span>
                    </div>
                  </div>
                ) : aiResult ? (
                  <div className="space-y-3">
                    {aiResult.question && (
                      <div className="p-3 bg-slate-900/90 rounded-none border border-slate-700/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sky-400 text-xs uppercase font-bold tracking-wider">Richiesta:</span>
                          <span className="text-white font-bold text-sm">"{aiResult.question}"</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {aiResult.activeEngine && (
                            <span className="text-[10px] px-2 py-0.5 font-mono text-slate-400 bg-slate-800 border border-slate-700">
                              {aiResult.activeEngine}
                            </span>
                          )}
                          {aiResult.timestamp && (
                            <span className="text-slate-400 text-xs font-mono">{aiResult.timestamp}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div
                      className="p-5 rounded-none bg-slate-900/60 border border-slate-800 text-[14.5px] leading-relaxed whitespace-pre-line text-slate-100 shadow-inner font-sans tracking-wide"
                      style={{
                        lineHeight: '1.75',
                        fontFamily: '"Switzer", sans-serif',
                      }}
                    >
                      {aiResult.content}
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-none bg-slate-950/40">
                    <Sparkles size={36} className="text-[#38bdf8] mb-3 opacity-80" />
                    <h3 className="text-base font-bold text-white mb-1.5 uppercase tracking-wide">
                      Centro Controlli Incrociati & Audit CRM
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed mb-4">
                      Poni qualsiasi controllo incrociato sui dati reali dello studio. Il modello incrocerà contratti firmati,
                      calendario delle date di shooting, disponibilità e conflitti dell'attrezzatura, fatturato, acconti e saldi aperti.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {!aiConfig.hasKey && (
                        <button
                          type="button"
                          onClick={() => setShowAiConfigModal(true)}
                          className="px-3.5 py-1.5 rounded-none bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Key size={13} />
                          <span>Inserisci Chiave API OpenAI per GPT-4o</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Barra di Input Multi-Riga per Scrivere Nuove Richieste / Ricerche */}
              <div className="pt-3 border-t border-slate-800 flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleAskFromConsole()
                  }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-end gap-2.5">
                    <div className="flex-1 relative">
                      <textarea
                        value={aiConsoleInput}
                        onChange={(e) => setAiConsoleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleAskFromConsole()
                          } else if (e.key === 'Escape') {
                            e.preventDefault()
                            triggerExitFocus()
                          }
                        }}
                        rows={2}
                        placeholder="Scrivi qui la tua richiesta o controllo incrociato (es. 'Incrocia i contratti con le date di shooting e dimmi quali attrezzature mancano')... [Invio per cercare]"
                        disabled={aiLoading}
                        className="w-full px-3.5 py-2.5 text-[13.5px] rounded-none bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-[#38bdf8] focus:bg-slate-950 transition-all resize-none font-sans"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={aiLoading || !aiConsoleInput.trim()}
                      className={`px-5 py-3 rounded-none font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer ${
                        aiLoading || !aiConsoleInput.trim()
                          ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                          : 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md'
                      }`}
                      style={{ minHeight: '62px' }}
                    >
                      {aiLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Analisi...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Invia Controllo</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>💡 <b>Invio</b> per inviare • <b>Shift + Invio</b> per andare a capo • <b>ESC</b> per chiudere il riquadro</span>
                    <span className="font-mono text-slate-400">DADO STUDIO • CRM INTELLIGENCE</span>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── IN VISUALE STANDARD: Riga 1 (TO DO + Week + Active Clients) + Riga 2 (Next actions + Pop-up estesa al centro) ── */}
          {!isAiFocusMode && (
            <div className="flex flex-col mb-1 flex-1 min-w-0">

              {/* Layout a Tre Colonne: Colonna 1 (Contatti -> Active Clients -> In scadenza) + Colonna 2 (Funnel & KPI) + Colonna 3 (Invoice -> Next actions) */}
              <div className="dado-dashboard-row flex items-stretch gap-4 flex-1 min-h-0" style={{ marginTop: '2.4cm', marginBottom: '0.2cm' }}>

                {/* COLONNA 1 (Sinistra): Card CONTATTI + Card ACTIVE CLIENTS (in alto) -> Card INVOICE resa uniforme (in basso) */}
                <div
                  className="flex flex-col justify-between flex-shrink-0"
                  style={{
                    width: '160px',
                    minHeight: 'calc(378px + 0.8cm)',
                    ...colonna1SlideStyle,
                  }}
                >
                  {/* Gruppo Card Superiori (Contatti & Active Clients) */}
                  <div className="flex flex-col gap-2.5 flex-shrink-0">
                    {/* 1. Card CONTATTI / COLLABORAZIONI */}
                    <Link
                      to="/leads"
                      className="flex flex-col justify-between shrink-0 p-3.5 bg-white transition-all hover:shadow-md hover:scale-[1.02] group"
                      style={{
                        width: '160px',
                        height: '104px',
                        border: '1.5px solid #cce5f6',
                        borderRadius: '16px',
                        boxShadow: '0 2px 10px rgba(27, 183, 237, 0.06)',
                        fontFamily: '"Switzer", sans-serif',
                      }}
                      title="Apri Contatti & Collaborazioni"
                    >
                      <span className="font-black uppercase tracking-[0.08em] leading-tight whitespace-nowrap" style={{ fontSize: '13px', color: '#7c3aed' }}>
                        CONTATTI
                      </span>
                      <UserPlus size={30} className="text-slate-800 group-hover:text-[#7c3aed] transition-colors" />
                      <span className="text-slate-500 leading-tight" style={{ fontSize: '12.5px' }}>
                        collaborazioni
                      </span>
                    </Link>

                    {/* 2. Card ACTIVE CLIENTS */}
                    <div
                      onClick={() => setShowActiveClientsModal(true)}
                      className="block hover:opacity-95 hover:scale-[1.02] transition-all flex flex-col group cursor-pointer shrink-0"
                      title="Clicca per aprire la finestra Clienti Attivi (Storico, Primo Contatto, Ultima Email, Ultimo Contratto)"
                    >
                      <KpiCard
                        label="ACTIVE CLIENTS"
                        value="11"
                        bg="#ffffff"
                        border="1.5px solid #cce5f6"
                        boxShadow="0 2px 10px rgba(27, 183, 237, 0.06)"
                        labelColor="#15803d"
                        valueColor="#0f172a"
                        fontFamily='"Switzer", sans-serif'
                        letterSpacing="0.02em"
                        sub="11 attivi • Clicca ↗"
                        subColor="#15803d"
                        width="160px"
                        minHeight="104px"
                        height="104px"
                        labelSize="13px"
                        valueSize="24px"
                        subSize="11.5px"
                      />
                    </div>
                  </div>

                  {/* 3. Card INVOICE — Posizionata qui a sinistra dopo lo scambio con In Scadenza Oggi (Formattazione originale Blu Notte & Oro) */}
                  <div
                    onClick={() => setShowInvoiceMenuModal(true)}
                    className="block hover:opacity-95 hover:scale-[1.02] transition-all flex flex-col group cursor-pointer shrink-0 mt-auto"
                    title="Clicca per aprire il pop-up menù Invoice (Ultime invoice, da inviare & riassunto incassi)"
                  >
                    <KpiCard
                      label="INVOICE"
                      value="€ 56.9k"
                      bg="#071325"
                      border="1.5px solid #d4af37"
                      boxShadow="0 4px 15px rgba(212, 175, 55, 0.2)"
                      labelColor="#d4af37"
                      valueColor="#fbbf24"
                      fontFamily='"Switzer", sans-serif'
                      letterSpacing="0.02em"
                      sub="11 fat. • Saldo € 10.9k"
                      subColor="#fde68a"
                      width="160px"
                      minHeight="104px"
                      height="104px"
                      labelSize="13px"
                      valueSize="28px"
                      subSize="11.5px"
                    />
                  </div>
                </div>

                {/* COLONNA 2: Sezione FUNNEL & KPI — Scambiata con Next actions, estesa 1cm verso l'alto e ingrandita di 3 cm */}
                <div
                  className="flex flex-col justify-between flex-shrink-0"
                  style={{
                    width: 'calc(290px + 3cm)',
                    minHeight: 'calc(378px + 1.8cm)',
                    marginTop: '-1cm',
                    ...colonna2SlideStyle,
                  }}
                >
                  <ConcentricRingsKpi width="100%" height="100%" />
                </div>

                {/* COLONNA 3: Sezione IN SCADENZA OGGI (in alto) + Sezione NEXT ACTIONS (in basso, accorciata di 1,5cm) */}
                <div
                  className="flex flex-col justify-between flex-shrink-0"
                  style={{
                    width: 'calc(185px + 1.5cm)',
                    minHeight: 'calc(378px + 0.8cm)',
                    ...colonna3SlideStyle,
                  }}
                >
                  {/* 1. Sezione IN SCADENZA OGGI — Scambiata con Invoice (Cliccabile verso /calendar) */}
                  <Link
                    to={`/calendar?date=${todayIso}&day=today`}
                    className="flex flex-col flex-shrink-0 overflow-hidden border border-rose-200 shadow-xs hover:shadow-md hover:border-rose-300 hover:scale-[1.01] transition-all group cursor-pointer"
                    style={{
                      width: '100%',
                      height: '180px',
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      fontFamily: '"Switzer", sans-serif',
                    }}
                    title="Apri e visualizza il dettaglio delle scadenze di oggi nel Calendario"
                  >
                    <div
                      className="px-2.5 py-2 flex items-center justify-between border-b border-rose-100 flex-shrink-0"
                      style={{ backgroundColor: '#fff5f5' }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-[#ef4444] flex-shrink-0 group-hover:scale-125 transition-transform" />
                        <span className="text-slate-900 font-bold tracking-tight leading-snug whitespace-nowrap group-hover:text-[#ef4444] transition-colors" style={{ fontSize: '12px' }}>
                          in scadenza oggi
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[12px] font-black text-[#ef4444]">{todayDeadlines.length}</span>
                        <ArrowUpRight size={13} className="text-[#ef4444] opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-1.5 flex flex-col gap-1.5 bg-white">
                      {todayDeadlines.length === 0 ? (
                        <span className="text-[11.5px] text-slate-500">Nessuna scadenza</span>
                      ) : (
                        todayDeadlines.map((ev, i) => (
                          <div key={i} className="flex flex-col gap-0.5 pb-1.5 border-b border-slate-100 last:border-b-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[11px] font-bold text-[#ef4444] whitespace-nowrap">
                                {(ev.time || '').split(' - ')[0]}
                              </span>
                              {ev.company && (
                                <span className="text-[11.5px] font-bold text-slate-900 truncate">{ev.company}</span>
                              )}
                            </div>
                            <span
                              className="text-[11px] text-slate-600 leading-tight"
                              style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}
                            >
                              {ev.title}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </Link>

                  {/* 2. Sezione NEXT ACTIONS posizionata in basso — Cliccabile verso /activities (Accorciata di 1,5cm in larghezza e altezza ridotta rispetto ai riquadri, 0,1 cm dal perimetro al riquadro New Opportunities) */}
                  <div
                    ref={nextActionsRef}
                    onClick={(e) => {
                      if (!e.target.closest('a') && !e.target.closest('button')) {
                        navigate('/activities')
                      }
                    }}
                    className="bg-white px-3.5 pt-3 flex flex-col flex-shrink-0 rounded-2xl overflow-hidden mt-auto cursor-pointer hover:border-sky-300 transition-colors group/card"
                    style={{
                      width: '100%',
                      paddingBottom: '0.1cm',
                      borderRadius: '16px',
                      border: '1.5px solid #cce5f6',
                      boxShadow: 'none',
                      fontFamily: '"Switzer", sans-serif',
                      ...nextActionsSlideStyle,
                    }}
                    title="Clicca per aprire le attività e prossime azioni dettagliate"
                  >
                    <Link
                      to="/activities"
                      className="group/title flex items-center justify-between cursor-pointer hover:opacity-85 transition-opacity"
                      title="Visualizza tutte le attività e prossime azioni"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2
                            className="text-slate-900 group-hover/title:text-sky-600 font-bold leading-tight transition-colors"
                            style={{ fontSize: '16px', fontFamily: '"Switzer", sans-serif' }}
                          >
                            Next actions
                          </h2>
                          <ArrowUpRight size={14} className="text-slate-400 group-hover/title:text-sky-600 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 transition-all" />
                        </div>
                        <p
                          className="mt-0.5 font-medium leading-tight whitespace-nowrap text-slate-500"
                          style={{ fontSize: '11.5px', fontFamily: '"Switzer", sans-serif' }}
                        >
                          No races. Keep your pace.
                        </p>
                      </div>
                    </Link>

                    {/* Contenitore azioni con riquadri senza ombreggiature */}
                    <div className="flex flex-col gap-1.5 mt-2" style={{ paddingBottom: '0.1cm' }}>
                      {/* 1. Leads — Color Senape / Sabbia */}
                      <div className="w-full">
                        <Link
                          to="/leads"
                          className="px-3 py-1.5 w-full text-center rounded-xl hover:scale-[1.03] transition-all block cursor-pointer"
                          style={{
                            background: 'linear-gradient(135deg, #dfb15b 0%, #c4922e 100%)',
                            border: '1.5px solid #ebd08c',
                            boxShadow: 'none',
                          }}
                          title="Apri la sezione Leads"
                        >
                          <span
                            style={{
                              fontFamily: '"Switzer", sans-serif',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '0.95rem',
                              letterSpacing: '0.03em',
                              lineHeight: 1.15,
                            }}
                          >
                            Leads
                          </span>
                        </Link>
                      </div>

                      {/* 2. Call Reports — Arancione Fiammeggiante Sgargiante */}
                      <div className="w-full">
                        <Link
                          to="/activities?type=call"
                          className="px-3 py-1.5 w-full text-center rounded-xl hover:scale-[1.03] transition-all block cursor-pointer"
                          style={{
                            background: 'linear-gradient(135deg, #ff6b35 0%, #f97316 100%)',
                            border: '1.5px solid #fb923c',
                            boxShadow: 'none',
                          }}
                          title="Visualizza Call Reports"
                        >
                          <span
                            style={{
                              fontFamily: '"Switzer", sans-serif',
                              color: '#ffffff',
                              fontSize: '0.92rem',
                              fontWeight: 900,
                              letterSpacing: '0.03em',
                              lineHeight: 1.15,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            call reports
                          </span>
                        </Link>
                      </div>

                      {/* 3. New Opportunities — Viola / Magenta Elettrico Sgargiante (mantiene esattamente 0,1 cm di margine) */}
                      <div className="w-full">
                        <Link
                          to="/opportunities"
                          className="px-2 py-1.5 w-full text-center rounded-xl hover:scale-[1.03] transition-all block cursor-pointer"
                          style={{
                            background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                            border: '1.5px solid #c084fc',
                            boxShadow: 'none',
                          }}
                          title="Apri la sezione Nuove Opportunità"
                        >
                          <span
                            style={{
                              fontFamily: '"Switzer", sans-serif',
                              fontSize: '0.86rem',
                              fontWeight: 900,
                              letterSpacing: '0.02em',
                              lineHeight: 1.15,
                              color: '#ffffff',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            New Opportunities
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                  {/* Sezione Output / Pop-up Allargata nello spazio guadagnato al centro della dashboard */}
                  {(aiResult || aiLoading || activeExpandedDay || (selectedCalendarDay && currentDaySchedule?.events?.length > 0)) && (
                    <div
                      ref={popupContainerRef}
                      onMouseEnter={handlePopupMouseEnter}
                      onMouseLeave={handlePopupMouseLeave}
                      onWheel={(e) => {
                        e.stopPropagation()
                        if (popupScrollRef.current) popupScrollRef.current.scrollTop += e.deltaY
                      }}
                      className="flex-1 min-w-[320px] max-w-[580px] flex flex-col p-4 rounded-2xl transition-all shadow-lg relative self-stretch overflow-hidden bg-white"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #cce5f6',
                        boxShadow: (isDayExpanded || activeExpandedDay)
                          ? '0 16px 48px rgba(27, 183, 237, 0.18), 0 4px 16px rgba(0, 0, 0, 0.08)'
                          : '0 10px 30px rgba(27, 183, 237, 0.10)',
                        height: (isDayExpanded || activeExpandedDay) ? 'auto' : 'calc(100vh - 280px)',
                        minHeight: (isDayExpanded || activeExpandedDay) ? 'auto' : '380px',
                        maxHeight: (isDayExpanded || activeExpandedDay) ? 'none' : 'calc(100vh - 280px)',
                        fontFamily: '"Switzer", sans-serif',
                        overscrollBehavior: 'contain',
                        borderRadius: '16px',
                        ...popupExpandStyle,
                      }}
                    >
                      {/* Header Sezione Output: font Switzer */}
                      <div className="flex items-center justify-between pb-2 mb-2 flex-shrink-0 border-b border-sky-100">
                        {activeDayForSchedule && activeOutputTab !== 'ai' ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="text-slate-900 font-bold tracking-wide uppercase text-[15px]"
                              style={{ fontFamily: '"Switzer", sans-serif' }}
                            >
                              Attività Programmate
                            </span>
                            {activeDayForSchedule?.name && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200">
                                {activeDayForSchedule.name} {activeDayForSchedule.num}
                              </span>
                            )}
                          </div>
                        ) : aiResult && activeDayForSchedule ? (
                          <div className="flex items-center gap-1.5 bg-sky-50 p-1 rounded-lg border border-sky-100">
                            <button
                              onClick={() => setActiveOutputTab('day')}
                              className={`px-3 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                                activeOutputTab === 'day'
                                  ? 'bg-white text-[#0284c7] shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                              style={{ fontFamily: '"Switzer", sans-serif' }}
                            >
                              Attività Programmate
                            </button>
                            <button
                              onClick={() => setActiveOutputTab('ai')}
                              className={`px-3 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                                activeOutputTab === 'ai'
                                  ? 'bg-white text-[#0284c7] shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                              style={{ fontFamily: '"Switzer", sans-serif' }}
                            >
                              Risposta OpenAI
                            </button>
                          </div>
                        ) : (
                          <span
                            className="text-slate-800 font-semibold tracking-wide text-[15px] truncate"
                            style={{ fontFamily: '"Switzer", sans-serif' }}
                          >
                            {aiLoading ? 'Analisi in corso...' : 'Indagine CRM & Punti in Comune (OpenAI)'}
                          </span>
                        )}

                        {(isDayExpanded || activeExpandedDay) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPinnedCalendarDay(null)
                              setHoveredCalendarDay(null)
                            }}
                            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                            title="Chiudi pop-up"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>

                    {/* Corpo del Contenuto Sviluppato in Verticale con scroll rotella ovunque e font Switzer */}
                    <div
                      ref={popupScrollRef}
                      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-2 mt-1 space-y-2 leading-relaxed custom-popup-scrollbar overscroll-contain select-text"
                      style={{
                        overscrollBehavior: 'contain',
                        fontFamily: '"Switzer", sans-serif',
                      }}
                    >
                      {selectedCalendarDay && activeOutputTab !== 'ai' && currentDaySchedule ? (
                        <div className="flex flex-col gap-2 w-full">
                          {/* Elenco Attività Programmate: griglia reattiva se esteso */}
                          <div className={`w-full ${isDayExpanded ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3' : 'flex flex-col'}`}>
                            {currentDaySchedule.events.map((ev, idx) => (
                              <div
                                key={idx}
                                className={`flex flex-col gap-1.5 py-2.5 text-left w-full ${isDayExpanded ? 'p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-xs' : ''}`}
                                style={{
                                  borderBottom: (!isDayExpanded && idx < currentDaySchedule.events.length - 1) ? '1px solid #f1f5f9' : undefined,
                                  fontFamily: '"Switzer", sans-serif',
                                }}
                              >
                                {/* 1. Riga Superiore: Orario & Cliente senza riquadri verdi */}
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[13px] font-semibold text-slate-900 whitespace-nowrap">
                                    {ev.time}
                                  </span>
                                  <span className="text-slate-900 font-bold text-[14px] truncate flex-1 text-right">
                                    {ev.company}
                                  </span>
                                  {ev.category && (
                                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-sky-100 text-[#0369a1] font-bold whitespace-nowrap">
                                      {ev.category}
                                    </span>
                                  )}
                                </div>

                                {/* 2. Dettagli Chiave: Luogo & Materiali senza icone e senza perimetraggi */}
                                <div className="space-y-1 text-[12.5px] leading-snug">
                                  {ev.location && (
                                    <div className="flex items-start gap-1.5 text-slate-600">
                                      <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wide flex-shrink-0">
                                        Luogo:
                                      </span>
                                      <span className="font-normal text-slate-700 break-words flex-1">
                                        {ev.location}
                                      </span>
                                    </div>
                                  )}
                                  {ev.materials && (
                                    <div className="flex items-start gap-1.5 text-slate-600">
                                      <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wide flex-shrink-0">
                                        Materiali:
                                      </span>
                                      <span className="font-normal text-slate-700 break-words flex-1">
                                        {ev.materials}
                                      </span>
                                    </div>
                                  )}
                                  {ev.title && (
                                    <p className="text-slate-400 text-[11.5px] italic pt-0.5 break-words">
                                      {ev.title}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Note & Allegati */}
                          {(currentDaySchedule.notes || (currentDaySchedule.files && currentDaySchedule.files.length > 0)) && (
                            <div className="flex flex-col gap-2.5 pt-2.5 w-full" style={{ borderTop: '1px solid #e2e8f0' }}>
                              {currentDaySchedule.notes && (
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-semibold text-slate-400 uppercase text-[10.5px] tracking-wide block">
                                    Note:
                                  </span>
                                  <div className="text-[12.5px] text-slate-700 leading-relaxed break-words">
                                    {currentDaySchedule.notes}
                                  </div>
                                </div>
                              )}
                              {currentDaySchedule.files && currentDaySchedule.files.length > 0 && (
                                <div
                                  className="rounded-lg p-2.5 flex flex-col gap-1.5 overflow-hidden"
                                  style={{
                                    border: '1.2px solid #e2e8f0',
                                    boxShadow: '0 0 10px rgba(226, 232, 240, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
                                    backgroundColor: '#f8fafc',
                                  }}
                                >
                                  <span
                                    className="font-semibold uppercase text-[10.5px] tracking-wide block"
                                    style={{
                                      color: '#e2e8f0',
                                      textShadow: '0 0 6px rgba(255, 255, 255, 0.3)',
                                      fontFamily: '"Switzer", sans-serif',
                                    }}
                                  >
                                    File ({currentDaySchedule.files.length}):
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {currentDaySchedule.files.map((file, fIdx) => (
                                      <div
                                        key={fIdx}
                                        className="px-2.5 py-1 rounded flex items-center gap-1.5 text-[11px] text-white/90 max-w-full"
                                        style={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                          border: '1px solid rgba(226, 232, 240, 0.35)',
                                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                                        }}
                                      >
                                        <span className="font-medium truncate max-w-[150px]">{file.name}</span>
                                        <span className="text-white/50 text-[9px] flex-shrink-0">({file.size})</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Contenuto AI OpenAI distribuito senza verde e con font Switzer */
                        <div
                          style={{
                            fontSize: '13.5px',
                            color: '#f4f2ea',
                            fontWeight: 400,
                            fontFamily: '"Switzer", sans-serif',
                          }}
                        >
                          {aiLoading ? (
                            <div className="h-36 flex flex-col items-center justify-center text-white/75 gap-2">
                              <div className="w-6 h-6 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                              <span className="text-[13px] animate-pulse">
                                Interrogazione database in tempo reale con OpenAI...
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {aiResult?.question && (
                                <div className="p-2 bg-white/5 rounded-lg text-xs text-slate-200 flex items-center gap-2">
                                  <span className="text-white/50 text-[10px] uppercase tracking-wider">Domanda:</span>
                                  <span className="text-white font-semibold">"{aiResult.question}"</span>
                                </div>
                              )}
                              <div className="leading-relaxed whitespace-pre-line text-[13px] text-white/90 bg-white/5 p-3 rounded-lg max-h-[180px] overflow-y-auto">
                                {aiResult?.content}
                              </div>
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => triggerEnterFocus()}
                                  className="text-[11.5px] text-slate-300 hover:text-white hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                  style={{ fontFamily: '"Switzer", sans-serif' }}
                                >
                                  <span>Espandi a schermo intero [ESC]</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* ══ COLONNA DESTRA ══ */}
        <div ref={colonnaDestraRef} className="self-stretch flex-shrink-0 flex flex-col gap-3 min-w-0 items-end relative">

          {/* Riga Superiore: Calendar Week e ASK Open AI affiancati a 0,3cm di distanza */}
          <div className="flex items-start justify-end flex-shrink-0" style={{ gap: '0.3cm' }}>
            {/* Sezione CALENDAR WEEK: ingrandita, 0,3cm da Ask Open AI e 0,3cm dalla banda superiore, a filo inferiore con Ask OpenAI, angoli retti */}
            <div
              ref={calendarContainerRef}
              onMouseEnter={handleCalendarMouseEnter}
              onMouseLeave={handleCalendarMouseLeave}
              className="px-3 py-1.5 bg-white shadow-xs flex flex-col justify-between border border-[#cce5f6] select-none shrink-0"
              style={{
                backgroundColor: '#ffffff',
                width: 'calc(250px + 3cm)',
                height: 'calc(98px - 0.3cm)',
                minHeight: 'calc(98px - 0.3cm)',
                borderRadius: '0px',
                boxShadow: '0 2px 8px rgba(27, 183, 237, 0.06)',
                fontFamily: '"Switzer", sans-serif',
                marginTop: '0.3cm',
              }}
            >
              {/* Header: Nome del mese corrente */}
              <div className="flex items-center px-0.5">
                <span
                  className="font-extrabold uppercase tracking-[0.08em] block leading-tight text-[12px]"
                  style={{ fontFamily: '"Switzer", sans-serif', color: '#0f172a' }}
                >
                  {currentMonthName}
                </span>
              </div>

              {/* 7 Caselle Giorni: prima lettera (L M M G V S D) */}
              <div className="grid grid-cols-7 gap-1.5 mt-1 flex-1 items-stretch">
                {currentWeekDays.map((d, index) => {
                  const isSelected = selectedCalendarDay?.date === d.date
                  const isPinned = pinnedCalendarDay?.date === d.date
                  return (
                    <button
                      key={d.date}
                      ref={index === 0 ? mondayButtonRef : null}
                      type="button"
                      onMouseEnter={() => handleDayMouseEnter(d)}
                      onClick={() => {
                        const sched = getDaySchedule(d.date)
                        if (!sched || !sched.events || sched.events.length === 0) {
                          setPinnedCalendarDay(null)
                          setHoveredCalendarDay(null)
                          return
                        }
                        if (isPinned) {
                          setPinnedCalendarDay(null)
                        } else {
                          setPinnedCalendarDay(d)
                          setActiveOutputTab('day')
                        }
                      }}
                      className={`flex flex-col items-center justify-center transition-all group py-1 border cursor-pointer ${
                        isSelected
                          ? 'ring-1 ring-[#0284c7] bg-sky-50 shadow-xs border-[#0284c7]'
                          : d.isToday
                          ? 'border-[#0284c7] bg-sky-50/70 hover:bg-sky-100 shadow-xs'
                          : 'bg-white border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/40'
                      }`}
                      title={`Visualizza impegni di ${d.name}`}
                    >
                      <span
                        className="text-[15px] font-black leading-none block"
                        style={{
                          fontFamily: '"Switzer", sans-serif',
                          color: isSelected
                            ? '#0284c7'
                            : d.isToday
                            ? '#0284c7'
                            : d.isSunday
                            ? '#ef4444'
                            : '#64748b',
                        }}
                      >
                        {d.letter}
                      </span>
                      {d.isToday && (
                        <span className="w-1 h-1 rounded-full bg-[#0284c7] mt-1 shadow-xs" title="Oggi" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 1. Box ASK OPEN AI (Sfondo bianco, collegato alla sezione output) */}
            <div ref={askOpenAiRef} className="w-64 flex-shrink-0">
              <AskOpenAiBox
                onOpenConsole={() => {
                  triggerEnterFocus(true)
                }}
                onOpenAiConfig={() => {
                  setShowAiConfigModal(true)
                }}
                aiConfig={aiConfig}
                onStartAsk={(text) => {
                  triggerEnterFocus()
                }}
                onAskComplete={(res) => {
                  setAiResult(res)
                  if (res) {
                    setActiveOutputTab('ai')
                    if (!isAiFocusMode) triggerEnterFocus()
                  }
                }}
                onLoadingChange={(loading) => {
                  setAiLoading(loading)
                  if (loading) {
                    setActiveOutputTab('ai')
                    if (!isAiFocusMode) triggerEnterFocus()
                  }
                }}
              />
            </div>
          </div>

          {/* 2. Box Collegamento Google Drive con Orologio (Centrato sotto Ask OpenAI, parte inferiore a filo delle cards) */}
          <div ref={clockDriveRef} className="w-64 flex justify-center" style={slideRightStyle(0)}>
            <ClockDriveBox height={clockDriveHeight ? `${clockDriveHeight}px` : '78px'} />
          </div>

          {/* Box Note sotto Google Drive: tipo pagina girata di un libro completamente bianca con piega a destra in rilievo */}
          <div ref={noteBoxRef} className="w-64" style={slideRightStyle(60)}>
            <TurnedPageNoteBox />
          </div>

          {/* 3. Box Preventivi — Stile coordinato alle altre sezioni */}
          <div
            className="w-64 flex flex-col shadow-xs overflow-hidden bg-white border border-[#cce5f6] rounded-2xl"
            style={{
              borderRadius: '16px',
              marginTop: preventiviMarginTop !== null ? `${preventiviMarginTop}px` : '12px',
              fontFamily: '"Switzer", sans-serif',
              ...slideRightStyle(120),
            }}
          >
            {/* 1. preventivi in scadenza */}
            <Link
              to="/opportunities?status=scadenza"
              className="px-3.5 py-3 min-h-[50px] flex items-center gap-2.5 hover:bg-rose-50/60 transition-colors block group border-b border-rose-100"
              style={{ backgroundColor: '#fff5f5' }}
              title="Visualizza preventivi in scadenza"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] flex-shrink-0 group-hover:scale-125 transition-transform" />
                <span
                  className="text-slate-900 font-bold tracking-tight leading-snug"
                  style={{ fontSize: '15px', fontFamily: '"Switzer", sans-serif' }}
                >
                  preventivi in scadenza
                </span>
              </div>
            </Link>

            {/* 2. preventivi inviati */}
            <Link
              to="/opportunities?status=inviati"
              className="px-3.5 py-3 min-h-[50px] flex items-center gap-2.5 hover:bg-sky-50/60 transition-colors block group border-b border-sky-100"
              style={{ backgroundColor: '#f0f9ff' }}
              title="Visualizza preventivi inviati"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] flex-shrink-0 group-hover:scale-125 transition-transform" />
                <span
                  className="text-slate-900 font-bold tracking-tight leading-snug"
                  style={{ fontSize: '15px', fontFamily: '"Switzer", sans-serif' }}
                >
                  preventivi inviati
                </span>
              </div>
            </Link>

            {/* 3. ultimo preventivo */}
            <Link
              to="/opportunities?sort=latest"
              className="px-3.5 py-3 min-h-[50px] flex items-center gap-2.5 hover:bg-emerald-50/60 transition-colors block group"
              style={{ backgroundColor: '#f0fdf4' }}
              title="Visualizza ultimo preventivo"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] flex-shrink-0 group-hover:scale-125 transition-transform" />
                <span
                  className="text-slate-900 font-bold tracking-tight leading-snug"
                  style={{ fontSize: '15px', fontFamily: '"Switzer", sans-serif' }}
                >
                  ultimo preventivo
                </span>
              </div>
            </Link>
          </div>

          {/* 3. Logo DADO Creative Studio collegato a dadocreative.studio con dicitura ® 2026 a filo destro */}
          <a
            href="https://dadocreative.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto w-[130px] flex flex-col items-end gap-0.5 group block cursor-pointer transition-all hover:opacity-95"
            style={{
              marginBottom: '0.2cm', // a 0,2 cm dalla banda sottostante
              ...slideRightStyle(180),
            }}
            title="Visita il sito ufficiale dadocreative.studio"
          >
            <div
              className="w-[130px] overflow-hidden shadow-sm border border-white/40 block group-hover:scale-105 transition-transform"
              style={{ borderRadius: '4px' }}
            >
              <img
                src="/dado-creative-studio.png"
                alt="DADO creative · studio"
                className="w-full h-auto object-contain block"
              />
            </div>
            <span
              className="w-full text-right text-[11px] font-mono text-slate-700 group-hover:text-slate-900 font-bold select-none pr-0 leading-none mt-0.5"
              style={{ letterSpacing: '0.1em' }}
            >
              ® 2026
            </span>
          </a>

        </div>

      </div>

      {/* ── Banda Inferiore: stessa tonalità di grigio della barra laterale (#2d3139), campo ricerca note sviluppatore a destra e taglio netto a 90° col display ── */}
      <div className="w-full flex items-center justify-between flex-shrink-0 mt-auto pl-0">
        <Link
          to="/register"
          title="Registra nuovo utente (con credenziali casuali)"
          className="p-1 rounded-xl text-[#f59e0b] hover:text-[#00d2ff] hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center shrink-0"
          style={{ marginLeft: 'calc(6px + 0.5cm)', marginRight: '2px' }}
        >
          <RegisterUserIcon size={18} />
        </Link>
        <div
          className="rounded-tl-2xl rounded-tr-none rounded-br-none rounded-bl-none flex-1 flex items-center justify-end pl-2 pr-6 overflow-hidden py-1"
          style={{
            height: '42px',
            backgroundColor: '#2d3139',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '0px',
            borderBottomRightRadius: '0px',
            borderBottomLeftRadius: '0px',
          }}
        >
          <div className="flex items-center gap-4 shrink-0">
            <DeveloperNotesSearchBar />
          </div>
        </div>
      </div>

      {/* ── Modale Dettaglio Fattura Studio (Blu Notte & Oro) ── */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border transition-all"
            style={{
              backgroundColor: '#071325',
              borderColor: '#d4af37',
              fontFamily: '"Switzer", sans-serif',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modale */}
            <div
              className="px-6 py-4 flex items-center justify-between border-b"
              style={{
                backgroundColor: '#0b1c36',
                borderColor: 'rgba(212, 175, 55, 0.35)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center">
                  <Receipt size={22} className="text-[#fbbf24]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">
                      {selectedInvoice.number}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        selectedInvoice.status === 'Saldato' || (selectedInvoice.balance || 0) === 0
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-600/50'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                      }`}
                    >
                      {selectedInvoice.status === 'Saldato' || (selectedInvoice.balance || 0) === 0 ? 'Saldato' : 'In attesa saldo'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/70 font-mono">
                    Contratto {selectedInvoice.contractCode || 'DADO Studio'} • Data emissione: {selectedInvoice.date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Corpo Modale */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-slate-200">
              {/* Cliente & Progetto */}
              <div className="bg-[#0b1c36] p-4 rounded-xl border border-[#d4af37]/20">
                <span className="text-[11px] font-mono uppercase text-[#d4af37] block font-bold tracking-wider">
                  Cliente & Oggetto
                </span>
                <div className="text-base font-bold text-white mt-0.5">
                  {selectedInvoice.companyName}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedInvoice.description}
                </p>
              </div>

              {/* Riquadro Dati Finanziari */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 block font-mono">Imponibile Netto</span>
                  <span className="text-sm font-bold text-white">
                    € {(selectedInvoice.amount || 0).toLocaleString('it-IT')}
                  </span>
                </div>
                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 block font-mono">IVA 22%</span>
                  <span className="text-sm font-bold text-slate-300">
                    € {(selectedInvoice.vat || Math.round((selectedInvoice.amount || 0) * 0.22)).toLocaleString('it-IT')}
                  </span>
                </div>
                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 block font-mono">Totale Lordo</span>
                  <span className="text-sm font-black text-[#fbbf24]">
                    € {(selectedInvoice.totalWithVat || Math.round((selectedInvoice.amount || 0) * 1.22)).toLocaleString('it-IT')}
                  </span>
                </div>
                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 block font-mono">Saldo Dovuto</span>
                  <span className={`text-sm font-black ${
                    (selectedInvoice.balance || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    € {(selectedInvoice.balance || 0).toLocaleString('it-IT')}
                  </span>
                </div>
              </div>

              {/* Dettagli Pagamento & Fiscali */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#091830] p-3 rounded-xl border border-white/10 space-y-1">
                  <span className="text-[10.5px] font-mono uppercase text-slate-400 block">Condizioni Pagamento</span>
                  <div><strong>Scadenza:</strong> <span className="text-amber-200">{selectedInvoice.dueDate}</span></div>
                  <div><strong>Metodo:</strong> {selectedInvoice.paymentMethod}</div>
                  <div><strong>Acconto già versato:</strong> € {(selectedInvoice.deposit || 0).toLocaleString('it-IT')}</div>
                </div>
                <div className="bg-[#091830] p-3 rounded-xl border border-white/10 space-y-1">
                  <span className="text-[10.5px] font-mono uppercase text-slate-400 block">Dati Fatturazione Elettronica</span>
                  <div><strong>Codice SDI:</strong> <span className="font-mono text-cyan-300">{selectedInvoice.sdi}</span></div>
                  <div><strong>PEC:</strong> <span className="font-mono text-cyan-300">{selectedInvoice.pec}</span></div>
                  <div><strong>Stato fiscale:</strong> Emessa & Trasmessa SDI</div>
                </div>
              </div>

              {/* Set & Attrezzatura collegata */}
              {(selectedInvoice.shootingDates || selectedInvoice.materials) && (
                <div className="bg-[#091830] p-3 rounded-xl border border-white/10 text-xs space-y-1">
                  <span className="text-[10.5px] font-mono uppercase text-[#d4af37] block font-bold">
                    Produzione Studio & Set Collegato
                  </span>
                  {selectedInvoice.shootingDates && (
                    <div><strong>Date Riprese & Set:</strong> {selectedInvoice.shootingDates} ({selectedInvoice.location})</div>
                  )}
                  {selectedInvoice.materials && (
                    <div><strong>Attrezzatura impiegata:</strong> {Array.isArray(selectedInvoice.materials) ? selectedInvoice.materials.join(', ') : selectedInvoice.materials}</div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Modale con Azioni */}
            <div
              className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t"
              style={{
                backgroundColor: '#0b1c36',
                borderColor: 'rgba(212, 175, 55, 0.35)',
              }}
            >
              <div className="flex items-center gap-2">
                {(selectedInvoice.balance || 0) > 0 && selectedInvoice.status !== 'Saldato' && (
                  <button
                    type="button"
                    onClick={() => handleMarkInvoicePaid(selectedInvoice.id)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <CheckCircle2 size={15} />
                    <span>Segna come Saldato</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const prompt = `Analizza la commessa e fattura ${selectedInvoice.number} per ${selectedInvoice.companyName}. Mostrami contratto, stato saldo, attrezzatura impiegata e prossime azioni.`
                    setSelectedInvoice(null)
                    window.dispatchEvent(new CustomEvent('dado-ask-ai', { detail: { prompt } }))
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#fbbf24] text-[#071325] text-xs font-black transition-all shadow-md cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>Interroga ASK OpenAI</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale Creazione Nuova Fattura (Blu Notte & Oro) ── */}
      {showNewInvoiceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowNewInvoiceModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border transition-all"
            style={{
              backgroundColor: '#071325',
              borderColor: '#d4af37',
              fontFamily: '"Switzer", sans-serif',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-6 py-4 flex items-center justify-between border-b"
              style={{
                backgroundColor: '#0b1c36',
                borderColor: 'rgba(212, 175, 55, 0.35)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <Receipt size={20} className="text-[#fbbf24]" />
                <h3 className="text-base font-black text-white">
                  Nuova Fattura Studio DADO
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewInvoiceModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-3.5 text-xs text-slate-200">
              <div>
                <label className="block text-[11px] font-mono text-[#d4af37] font-bold uppercase mb-1">
                  Cliente / Azienda *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Alfa Motors Srl"
                  value={newInvoiceForm.companyName}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1c36] border border-[#d4af37]/30 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#d4af37] font-bold uppercase mb-1">
                    Imponibile Netto (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Es. 3500"
                    value={newInvoiceForm.amount}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1c36] border border-[#d4af37]/30 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                    Acconto Versato (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Es. 1000"
                    value={newInvoiceForm.deposit}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, deposit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1c36] border border-white/20 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                    Scadenza Pagamento
                  </label>
                  <input
                    type="text"
                    placeholder="Es. 30/11/2026"
                    value={newInvoiceForm.dueDate}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1c36] border border-white/20 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                    Metodo di Pagamento
                  </label>
                  <input
                    type="text"
                    placeholder="Bonifico 30gg d.f."
                    value={newInvoiceForm.paymentMethod}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1c36] border border-white/20 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                    Codice SDI
                  </label>
                  <input
                    type="text"
                    placeholder="0000000"
                    value={newInvoiceForm.sdi}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, sdi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1c36] border border-white/20 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                    PEC
                  </label>
                  <input
                    type="text"
                    placeholder="azienda@pec.it"
                    value={newInvoiceForm.pec}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, pec: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1c36] border border-white/20 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Descrizione / Commessa
                </label>
                <textarea
                  rows={2}
                  placeholder="Descrizione del servizio di produzione foto/video..."
                  value={newInvoiceForm.description}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1c36] border border-white/20 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#fbbf24] text-[#071325] text-xs font-black transition-all shadow-md cursor-pointer hover:scale-105"
                >
                  Emetti Fattura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modale Configurazione AI & Chiave API OpenAI ── */}
      {showAiConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-lg bg-[#0f172a] border border-slate-700 text-white p-6 shadow-2xl relative"
            style={{
              borderRadius: '0px',
              fontFamily: '"Switzer", sans-serif',
            }}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Key size={18} className="text-[#38bdf8]" />
                <h3 className="font-black text-base uppercase tracking-wide">
                  Configurazione Motore AI & Chiave API
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiConfigModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAiConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                  OpenAI API Key (sk-...)
                </label>
                <div className="relative">
                  <input
                    type={showApiKeyText ? 'text' : 'password'}
                    value={inputApiKey}
                    onChange={(e) => setInputApiKey(e.target.value)}
                    placeholder={aiConfig.hasKey ? `Attiva: ${aiConfig.maskedKey} (incolla una nuova per sostituire)` : 'Incolla la tua chiave sk-proj-...'}
                    className="w-full px-3 py-2 pr-10 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 rounded-none focus:outline-none focus:border-[#38bdf8] font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKeyText(!showApiKeyText)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showApiKeyText ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="mt-1 text-[10.5px] text-slate-400 leading-normal">
                  La chiave viene memorizzata nel file <code>.env</code> locale. Con una chiave OpenAI attiva, le richieste vengono elaborate direttamente da OpenAI senza passare da modelli locali.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                  Modello da Utilizzare
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInputModel('gpt-4o')}
                    className={`p-2.5 border text-left rounded-none transition-all cursor-pointer ${
                      inputModel === 'gpt-4o'
                        ? 'bg-sky-950/70 border-sky-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">GPT-4o (Consigliato)</div>
                    <div className="text-[10px] text-slate-300 mt-0.5">Massima intelligenza, italiano perfetto e audit complessi</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputModel('gpt-4o-mini')}
                    className={`p-2.5 border text-left rounded-none transition-all cursor-pointer ${
                      inputModel === 'gpt-4o-mini'
                        ? 'bg-sky-950/70 border-sky-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">GPT-4o-mini</div>
                    <div className="text-[10px] text-slate-300 mt-0.5">Ultra-veloce, economico ed eccellente nella grammatica</div>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-none">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputDisableOllama}
                    onChange={(e) => setInputDisableOllama(e.target.checked)}
                    className="w-4 h-4 rounded-none accent-[#0284c7]"
                  />
                  <div>
                    <span className="font-bold text-white text-[11.5px] block">
                      Disabilita completamente Ollama locale
                    </span>
                    <span className="text-[10.5px] text-slate-400 block">
                      Evita risposte da modelli piccoli a 3 miliardi di parametri, usando solo OpenAI Cloud o fallback interno.
                    </span>
                  </div>
                </label>
              </div>

              {configSuccess && (
                <div className="p-2.5 bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check size={14} />
                  <span>{configSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAiConfigModal(false)}
                  className="px-3.5 py-1.5 rounded-none bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={configSaving}
                  className="px-4 py-1.5 rounded-none bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold cursor-pointer transition-all shadow-sm"
                >
                  {configSaving ? 'Salvataggio...' : 'Salva e Attiva Motore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modale Finestra Dossier Clienti Attivi (Storico, Primo Contatto, Ultima Email & Referente, Ultimo Contratto) ── */}
      {showActiveClientsModal && (() => {
        const filteredClients = ACTIVE_CLIENTS_DOSSIER.filter((c) => {
          if (!clientSearchQuery.trim()) return true
          const q = clientSearchQuery.toLowerCase()
          return (
            c.name.toLowerCase().includes(q) ||
            c.industry.toLowerCase().includes(q) ||
            c.contactPerson.name.toLowerCase().includes(q) ||
            c.contactPerson.role.toLowerCase().includes(q) ||
            c.contract.code.toLowerCase().includes(q)
          )
        })
        const safeIndex = selectedClientIndex >= filteredClients.length ? 0 : selectedClientIndex
        const currentClient = filteredClients[safeIndex] || ACTIVE_CLIENTS_DOSSIER[0]

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn"
            onClick={() => setShowActiveClientsModal(false)}
          >
            <div
              className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-[#0f172a] text-slate-100 flex flex-col max-h-[90vh]"
              style={{
                fontFamily: '"Switzer", sans-serif',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(16, 185, 129, 0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Finestra */}
              <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 bg-[#162238] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <Building2 size={22} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black tracking-wide text-white uppercase">
                        DOSSIER CLIENTI ATTIVI ({ACTIVE_CLIENTS_DOSSIER.length})
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-600/50">
                        11 In Portafoglio
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      DADO Creative Studio • Storico relazioni, primo contatto, ultima email & contratti vigenti
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Ricerca Veloce */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cerca cliente, referente..."
                      value={clientSearchQuery}
                      onChange={(e) => {
                        setClientSearchQuery(e.target.value)
                        setSelectedClientIndex(0)
                      }}
                      className="px-3 py-1.5 pl-8 rounded-xl bg-[#0b1424] border border-slate-600 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 w-48 sm:w-60"
                    />
                    <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
                  </div>

                  {/* Pulsante Chiusura */}
                  <button
                    type="button"
                    onClick={() => setShowActiveClientsModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
                    title="Chiudi finestra (ESC)"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Corpo Finestra Diviso a 2 Colonne */}
              <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
                {/* Colonna Sinistra: Lista 11 Clienti */}
                <div
                  className="w-full md:w-[280px] border-r border-slate-700/80 bg-[#0b1424] flex flex-col flex-shrink-0"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  <div className="px-3.5 py-2.5 bg-[#0e192c] border-b border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono uppercase font-bold text-[11px] text-emerald-400">
                      Elenco Clienti ({filteredClients.length})
                    </span>
                    <span className="text-[10.5px]">Seleziona per dettagli</span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredClients.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        Nessun cliente corrisponde alla ricerca
                      </div>
                    ) : (
                      filteredClients.map((client, idx) => {
                        const isSelected = idx === safeIndex
                        return (
                          <div
                            key={client.id}
                            onClick={() => setSelectedClientIndex(idx)}
                            className={`p-2.5 rounded-xl transition-all cursor-pointer border flex flex-col gap-0.5 text-left ${
                              isSelected
                                ? 'bg-[#152843] border-emerald-500 shadow-md text-white'
                                : 'bg-[#0f1d33]/50 border-slate-800 hover:border-slate-600 hover:bg-[#13223b] text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-[13px] truncate text-white">
                                {client.name}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                                Attivo
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 truncate">
                              {client.industry}
                            </span>
                            <div className="flex items-center justify-between text-[10.5px] pt-1 text-slate-400 border-t border-white/5 mt-0.5">
                              <span className="text-emerald-400 truncate font-medium">
                                {client.contactPerson.name}
                              </span>
                              <span className="font-mono text-slate-500">
                                {client.contract.code}
                              </span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Colonna Destra: Dossier Approfondito del Cliente Selezionato */}
                {currentClient && (
                  <div
                    className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-[#0d1829] select-text"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#22c55e #0d1829' }}
                  >
                    {/* Header Scheda Cliente */}
                    <div className="p-4 rounded-xl bg-[#112036] border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-xl font-black text-white">
                            {currentClient.name}
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-600/50">
                            CLIENTE ATTIVO
                          </span>
                        </div>
                        <p className="text-sm md:text-base text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                          <span>Settore:</span>
                          <strong className="text-white font-black bg-sky-950/90 text-sky-300 px-2.5 py-0.5 rounded-md border border-sky-600/40 text-sm">
                            {currentClient.industry}
                          </strong>
                          <span className="text-slate-500">•</span>
                          <span className="text-xs text-slate-400 font-mono">ID CRM: {currentClient.id}</span>
                        </p>
                      </div>

                      <Link
                        to="/companies"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                        title="Apri nel database completo Aziende & Contratti"
                      >
                        <ExternalLink size={14} />
                        <span>Apri in /companies</span>
                      </Link>
                    </div>

                    {/* Riquadro 1: Motivo del Primo Contatto */}
                    <div className="p-4 rounded-xl bg-[#10223b] border border-sky-500/30 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-sky-500/20 pb-2.5 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎯</span>
                          <span className="text-sm font-black uppercase tracking-wider text-sky-400 font-mono">
                            1. STORICO RICHIESTA & MOTIVO DEL PRIMO CONTATTO
                          </span>
                        </div>
                        <span className="text-xs md:text-sm font-mono text-slate-300 bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-600/30">
                          Data primo contatto: <strong className="text-sky-300 font-black text-sm">{currentClient.firstContact.date}</strong>
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="bg-[#0b1626] p-3.5 rounded-xl border border-white/10">
                          <span className="text-xs font-mono uppercase text-slate-400 block font-bold">Canale di Acquisizione</span>
                          <span className="font-black text-base text-sky-300 mt-1 block">{currentClient.firstContact.channel}</span>
                        </div>
                        <div className="sm:col-span-2 bg-[#0b1626] p-3.5 rounded-xl border border-white/10">
                          <span className="text-xs font-mono uppercase text-slate-400 block font-bold">Motivo & Richiesta Iniziale del Cliente</span>
                          <p className="text-slate-100 mt-1 text-sm md:text-base leading-relaxed font-semibold">
                            {currentClient.firstContact.notes}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Riquadro 2: L'Ultima Email (Anche Referente) */}
                    <div className="p-4 rounded-xl bg-[#0f2438] border border-emerald-500/30 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Mail size={18} className="text-emerald-400" />
                          <span className="text-sm font-black uppercase tracking-wider text-emerald-400 font-mono">
                            2. L'ULTIMA EMAIL & REFERENTE AZIENDALE
                          </span>
                        </div>
                        <span className="text-xs md:text-sm font-mono text-slate-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-600/30">
                          Ricevuta il: <strong className="text-emerald-300 font-black text-sm">{currentClient.lastEmail.date}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="bg-[#091724] p-3.5 rounded-xl border border-white/10 space-y-1.5">
                          <span className="text-xs font-mono uppercase text-slate-400 block font-bold">Referente Aziendale Principale</span>
                          <div className="text-base md:text-lg font-black text-white">
                            {currentClient.contactPerson.name}
                          </div>
                          <div className="text-slate-200 text-xs md:text-sm">
                            Ruolo: <strong className="text-emerald-300 font-bold">{currentClient.contactPerson.role}</strong>
                          </div>
                          <div className="text-slate-300 text-xs font-mono pt-1">
                            Email: <span className="text-cyan-300 font-bold">{currentClient.email}</span>
                          </div>
                          {currentClient.phone && (
                            <div className="text-slate-300 text-xs font-mono">
                              Tel: <span className="text-slate-100 font-bold">{currentClient.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="bg-[#091724] p-3.5 rounded-xl border border-white/10 space-y-2 flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-mono uppercase text-slate-400 block font-bold">Oggetto Ultima Email</span>
                            <div className="font-bold text-slate-100 text-sm mt-0.5">
                              "{currentClient.lastEmail.subject}"
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              Da: {currentClient.lastEmail.referent} ({currentClient.lastEmail.email})
                            </div>
                          </div>
                          <div className="p-2.5 rounded bg-black/40 border border-white/5 text-xs md:text-sm text-slate-200 italic leading-snug">
                            "{currentClient.lastEmail.snippet}"
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Riquadro 3: L'Ultimo Contratto */}
                    <div className="p-4 rounded-xl bg-[#1a2136] border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-[#fbbf24]" />
                          <span className="text-xs font-black uppercase tracking-wider text-[#fbbf24] font-mono">
                            3. L'ULTIMO CONTRATTO VIGENTE
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-300 font-bold">
                          {currentClient.contract.code}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                        <div className="bg-[#0f1728] p-2.5 rounded-lg border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">Stato Contratto</span>
                          <span className="font-bold text-emerald-400 mt-0.5 block">{currentClient.contract.status}</span>
                        </div>
                        <div className="bg-[#0f1728] p-2.5 rounded-lg border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">Data Sottoscrizione</span>
                          <span className="font-bold text-slate-200 mt-0.5 block">{currentClient.contract.signedDate}</span>
                        </div>
                        <div className="bg-[#0f1728] p-2.5 rounded-lg border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">Valore Economico</span>
                          <span className="font-black text-[#fbbf24] mt-0.5 block">€ {currentClient.contract.amount.toLocaleString('it-IT')}</span>
                        </div>
                        <div className="bg-[#0f1728] p-2.5 rounded-lg border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">Fattura Collegata</span>
                          <span className="font-mono font-bold text-cyan-300 mt-0.5 block">{currentClient.contract.invoiceNumber}</span>
                        </div>
                      </div>

                      <div className="bg-[#0f1728] p-3 rounded-lg border border-white/5 text-xs space-y-1">
                        <div>
                          <strong>File documentale:</strong> <span className="font-mono text-slate-300">{currentClient.contract.fileName}</span> ({currentClient.contract.digitalFormat})
                        </div>
                        <div>
                          <strong>Termini & Clausole chiave:</strong> <span className="text-slate-300">{currentClient.contract.terms}</span>
                        </div>
                      </div>
                    </div>

                    {/* Riquadro 4: Storico Completo della Collaborazione */}
                    <div className="p-4 rounded-xl bg-[#161a2e] border border-purple-500/30 space-y-3">
                      <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-purple-400" />
                          <span className="text-xs font-black uppercase tracking-wider text-purple-300 font-mono">
                            4. STORICO DELLA COLLABORAZIONE (TIMELINE PROGRESSIONE)
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-purple-300">
                          {currentClient.history.length} Tappe documentate
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {currentClient.history.map((h, i) => (
                          <div key={i} className="flex items-start gap-3 text-xs bg-[#0f1324] p-2.5 rounded-lg border border-white/5">
                            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-white text-[12px]">{h.step}</span>
                                <span className="text-[10.5px] font-mono text-slate-400">{h.date}</span>
                              </div>
                              <p className="text-slate-300 text-[11.5px] mt-0.5 leading-snug">{h.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Finestra con Azioni Rapide */}
              <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/80 bg-[#162238] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentClient) return
                      const prompt = `Analizza la commessa di ${currentClient.name}: motivo primo contatto (${currentClient.firstContact.channel}), ultima email di ${currentClient.contactPerson.name} e condizioni contratto ${currentClient.contract.code}. Mostrami i collegamenti con fattura ${currentClient.contract.invoiceNumber} e set riprese.`
                      setShowActiveClientsModal(false)
                      window.dispatchEvent(new CustomEvent('dado-ask-ai', { detail: { prompt } }))
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00ffaa] hover:bg-[#34d399] text-[#071325] text-xs font-black transition-all shadow-md cursor-pointer hover:scale-105"
                  >
                    <Sparkles size={15} />
                    <span>Interroga ASK OpenAI su questo cliente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!currentClient) return
                      const matchingInv = invoices.find(
                        (inv) => inv.companyName === currentClient.name || inv.number === currentClient.contract.invoiceNumber
                      )
                      setShowActiveClientsModal(false)
                      if (matchingInv) {
                        setSelectedInvoice(matchingInv)
                      }
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#fbbf24] text-[#071325] text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <Receipt size={15} />
                    <span>Vedi Fattura ({currentClient.contract.invoiceNumber})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowActiveClientsModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Modale Pop-up Menù Invoice Studio (Ultime Invoice, Da Inviare & Riassunto Incassi) ── */}
      {showInvoiceMenuModal && (() => {
        // Calcoli riassunto finanziario
        const totalNet = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0)
        const totalGross = invoices.reduce((acc, inv) => acc + (inv.totalWithVat || ((inv.amount || 0) + Math.round((inv.amount || 0) * 0.22))), 0)
        const totalCollected = invoices.reduce((acc, inv) => acc + (inv.deposit || 0), 0)
        const totalPending = invoices.reduce((acc, inv) => acc + (inv.balance || 0), 0)
        const pendingCount = invoices.filter((inv) => (inv.balance || 0) > 0).length

        // Filtraggio per tab e ricerca
        let displayedInvoices = [...invoices]

        // Ordinamento per Ultime Invoice
        if (invoiceTab === 'recent') {
          displayedInvoices.sort((a, b) => {
            const numA = parseInt((a.number || '').replace(/\D/g, '')) || 0
            const numB = parseInt((b.number || '').replace(/\D/g, '')) || 0
            return numB - numA
          })
        } else if (invoiceTab === 'pending') {
          displayedInvoices = displayedInvoices.filter((inv) => (inv.balance || 0) > 0 || inv.status !== 'Saldato')
        }

        if (invoiceSearchQuery.trim()) {
          const q = invoiceSearchQuery.toLowerCase()
          displayedInvoices = displayedInvoices.filter(
            (inv) =>
              (inv.number || '').toLowerCase().includes(q) ||
              (inv.companyName || '').toLowerCase().includes(q) ||
              (inv.contractCode || '').toLowerCase().includes(q) ||
              (inv.description || '').toLowerCase().includes(q)
          )
        }

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn"
            onClick={() => setShowInvoiceMenuModal(false)}
          >
            <div
              className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-[#d4af37]/60 bg-[#071325] text-slate-100 flex flex-col max-h-[88vh]"
              style={{
                fontFamily: '"Switzer", sans-serif',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.25)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Pop-up Menù Blu Notte & Oro */}
              <div
                className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b flex-shrink-0"
                style={{
                  backgroundColor: '#0b1c36',
                  borderColor: 'rgba(212, 175, 55, 0.35)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center">
                    <Receipt size={22} className="text-[#fbbf24]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black tracking-wide text-white uppercase">
                        INVOICE & FATTURAZIONE STUDIO DADO
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fbbf24] border border-[#d4af37]/40">
                        {invoices.length} Fatture
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/70 font-mono">
                      Pop-up Menù • Ultime invoice, da inviare & riassunto incassi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInvoiceMenuModal(false)
                      setShowNewInvoiceModal(true)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#d4af37] hover:bg-[#fbbf24] text-[#071325] text-xs font-black transition-all hover:scale-105 shadow-md cursor-pointer"
                  >
                    <span>+ Nuova Fattura</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInvoiceMenuModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
                    title="Chiudi pop-up (ESC)"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Riassunto Finanziario (Financial summary strip) */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 border-b flex-shrink-0"
                style={{
                  backgroundColor: '#091830',
                  borderColor: 'rgba(212, 175, 55, 0.25)',
                }}
              >
                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 font-mono block">Totale Fatturato Netto</span>
                  <span className="text-base font-black text-[#fbbf24] block mt-0.5">
                    € {totalNet.toLocaleString('it-IT')}
                  </span>
                  <span className="text-[10px] text-slate-400">Lordo IVA 22%: € {totalGross.toLocaleString('it-IT')}</span>
                </div>

                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 font-mono block">Totale Incassato</span>
                  <span className="text-base font-black text-emerald-400 block mt-0.5">
                    € {totalCollected.toLocaleString('it-IT')}
                  </span>
                  <span className="text-[10px] text-emerald-300/80 font-mono">81% del fatturato totale</span>
                </div>

                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 font-mono block">Da Saldare / In Sospeso</span>
                  <span className="text-base font-black text-amber-400 block mt-0.5">
                    € {totalPending.toLocaleString('it-IT')}
                  </span>
                  <span className="text-[10px] text-amber-300/80 font-mono">{pendingCount} commesse aperte</span>
                </div>

                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 font-mono block">Stato Fiscale SDI</span>
                  <span className="text-base font-black text-cyan-300 block mt-0.5">
                    11 Validate
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">0 scarti • 100% compliant</span>
                </div>
              </div>

              {/* Barra Menù Navigazione & Filtro */}
              <div
                className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b flex-shrink-0"
                style={{
                  backgroundColor: '#071325',
                  borderColor: 'rgba(212, 175, 55, 0.2)',
                }}
              >
                {/* Tabs Pop-up Menù */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0b1c36] border border-white/10">
                  <button
                    type="button"
                    onClick={() => setInvoiceTab('recent')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      invoiceTab === 'recent'
                        ? 'bg-[#d4af37] text-[#071325] shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Ultime Invoice
                  </button>

                  <button
                    type="button"
                    onClick={() => setInvoiceTab('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      invoiceTab === 'pending'
                        ? 'bg-[#d4af37] text-[#071325] shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>Da Inviare / Da Saldare</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      invoiceTab === 'pending' ? 'bg-[#071325] text-[#fbbf24]' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {pendingCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInvoiceTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      invoiceTab === 'all'
                        ? 'bg-[#d4af37] text-[#071325] shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Tutte ({invoices.length})
                  </button>
                </div>

                {/* Filtro Ricerca */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cerca per numero, cliente o contratto..."
                    value={invoiceSearchQuery}
                    onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                    className="px-3 py-1.5 pl-8 rounded-xl bg-[#0b1c36] border border-[#d4af37]/30 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#fbbf24] w-56 sm:w-64"
                  />
                  <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
                </div>
              </div>

              {/* Elenco Fatture Scorrevole */}
              <div
                className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-2.5 bg-[#071325] select-text"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d4af37 #071325',
                }}
              >
                {displayedInvoices.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Nessuna fattura trovata per questa selezione.
                  </div>
                ) : (
                  displayedInvoices.map((inv) => {
                    const isPaid = inv.status === 'Saldato' || (inv.balance || 0) === 0
                    return (
                      <div
                        key={inv.id || inv.number}
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2"
                        style={{
                          backgroundColor: '#0b1c36',
                          borderColor: isPaid ? 'rgba(212, 175, 55, 0.25)' : 'rgba(245, 158, 11, 0.6)',
                        }}
                      >
                        {/* Riga Superiore: Numero, Importi, Data */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-bold text-[#fbbf24] group-hover:underline">
                              {inv.number}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              Emessa: {inv.date}
                            </span>
                            {inv.contractCode && (
                              <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                                {inv.contractCode}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-sm font-black text-[#fbbf24]">
                                € {(inv.amount || 0).toLocaleString('it-IT')}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Lordo: € {(inv.totalWithVat || Math.round((inv.amount || 0) * 1.22)).toLocaleString('it-IT')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Riga Centrale: Cliente & Descrizione */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                              {inv.companyName}
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                              {inv.description}
                            </p>
                          </div>
                        </div>

                        {/* Riga Inferiore: Stato, Saldo, Scadenza & Azioni */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${
                                isPaid
                                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-600/50'
                                  : 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                              }`}
                            >
                              {isPaid ? 'Saldato al 100%' : `Da Saldare: € ${(inv.balance || 0).toLocaleString('it-IT')}`}
                            </span>
                            <span className={`text-[11px] font-mono ${isPaid ? 'text-slate-400' : 'text-amber-300 font-bold'}`}>
                              Scadenza: {inv.dueDate}
                            </span>
                            <span className="text-[10.5px] text-slate-400">
                              • {inv.paymentMethod}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isPaid && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkInvoicePaid(inv.id || inv.number)
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                                title="Segna questa fattura come saldata"
                              >
                                ✓ Segna Saldato
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedInvoice(inv)
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-semibold transition-all cursor-pointer"
                            >
                              Dettaglio Studio ↗
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer Pop-up Menù */}
              <div
                className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-t flex-shrink-0"
                style={{
                  backgroundColor: '#0b1c36',
                  borderColor: 'rgba(212, 175, 55, 0.35)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const prompt = `Analizza la situazione contabile dello Studio DADO: presentami il riassunto delle ultime invoice emesse, i saldi ancora aperti (da saldare) per Officine Riva, Kroma Ceramiche e Beta Digital, e le relative scadenze con stato SDI.`
                      setShowInvoiceMenuModal(false)
                      window.dispatchEvent(new CustomEvent('dado-ask-ai', { detail: { prompt } }))
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00ffaa] hover:bg-[#34d399] text-[#071325] text-xs font-black transition-all shadow-md cursor-pointer hover:scale-105"
                  >
                    <Sparkles size={15} />
                    <span>Interroga ASK OpenAI su Incassi & Insoluti</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowInvoiceMenuModal(false)
                      setShowNewInvoiceModal(true)
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#fbbf24] text-[#071325] text-xs font-black transition-all shadow-md cursor-pointer hover:scale-105"
                  >
                    <span>+ Emetti Nuova Fattura</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInvoiceMenuModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      </div>
    </div>
  )
}


