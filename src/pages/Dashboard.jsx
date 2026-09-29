import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Database, Sparkles, X, ArrowRight, Calendar as CalendarIcon, Clock, FileText, Paperclip } from 'lucide-react'
import CameraShutter from '../components/CameraShutter'
import { getCurrentWeekDays, getCurrentMonthName, getTodayIso, getTomorrowIso, getCurrentWeekSundayIso, formatDayLong } from '../utils/dateUtils'
import { getCalendarDayData } from '../utils/calendarData'
import { useAuth } from '../context/AuthContext'

function KpiCard({
  label,
  value,
  bg,
  labelColor,
  valueColor,
  sub,
  subColor,
  flex = '1',
  width,
  height,
  labelSize = '13px',
  valueSize = '36px',
  subSize = '13px',
  minHeight = '90px',
  padding = 'p-3',
  fontFamily = '"Red Rose", serif',
  labelFontFamily,
  valueFontFamily,
  subFontFamily,
  labelStroke,
  labelShadow,
  valueStroke,
  valueShadow,
  letterSpacing = '0.04em',
  valueWeight = 900,
}) {
  const effectiveLabelFont = labelFontFamily || fontFamily
  const effectiveValueFont = valueFontFamily || fontFamily
  const effectiveSubFont = subFontFamily || fontFamily

  return (
    <div
      className={`${padding} flex flex-col justify-between min-w-0 shadow-sm`}
      style={{
        backgroundColor: bg,
        borderRadius: '6px',
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
      className={`border border-black/10 hover:border-slate-400 rounded-[6px] py-1.5 px-3 text-center cursor-pointer transition-all relative overflow-hidden group select-none shadow-sm hover:shadow-md hover:scale-[1.01] flex flex-col justify-between shrink-0 bg-white ${className}`}
      style={{
        backgroundColor: '#ffffff',
        width,
        height,
        minHeight: minHeight || height,
        borderRadius: '6px',
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

      {/* Cifre NERE non trasparenti dell'orario centrate: font "Red Rose" dalla card ACTIVE CLIENTS e più grandi */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <div
          className="flex items-center justify-center leading-none tracking-wider select-none text-[#000000]"
          style={{
            fontFamily: '"Red Rose", serif',
            fontSize: '35px',
            fontWeight: 700,
            letterSpacing: '0.04em',
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
function AskOpenAiBox({ onAskComplete, onLoadingChange, onStartAsk }) {
  const { canAskOpenAI, currentUser } = useAuth()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState(null)
  const [error, setError] = useState(null)

  // Ascolta l'evento globale di reset (premendo ESC o chiudendo l'output)
  useEffect(() => {
    const handleReset = () => {
      setQuery('')
      setAnswer(null)
      setError(null)
      setLoading(false)
    }
    window.addEventListener('dado-ai-reset', handleReset)
    return () => window.removeEventListener('dado-ai-reset', handleReset)
  }, [])

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
    <div className="bg-white rounded-none -mt-3 pt-3 px-4 pb-2.5 flex flex-col justify-between shadow-sm min-h-0 relative z-20">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <h3
              className="uppercase tracking-normal leading-tight select-none"
              style={{
                fontWeight: 900,
                fontSize: '1.15rem',
                background: 'linear-gradient(90deg, #ff1744 0%, #ff9100 20%, #ffd600 40%, #00e676 60%, #00b0ff 80%, #d500f9 100%)',
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
        className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5"
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
          placeholder={canAskOpenAI ? "Digita domanda..." : "🔒 Funzione disabilitata per il profilo Dipendente"}
          disabled={loading || !canAskOpenAI}
          className={`flex-1 border px-2 py-1 text-xs placeholder:text-gray-400 focus:outline-none ${
            canAskOpenAI
              ? 'bg-gray-50 border-gray-200 text-[#111111] focus:border-black'
              : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        />
        <button
          type="submit"
          disabled={loading || !query.trim() || !canAskOpenAI}
          title={!canAskOpenAI ? 'Disabilitato per Dipendente' : 'Invia domanda'}
          className="bg-black text-white hover:bg-gray-800 disabled:opacity-30 px-2 py-1 text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
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
        className="w-full bg-white shadow-md hover:shadow-lg transition-all"
        style={{
          borderRadius: '6px 0 6px 6px',
          padding: '10px 14px 12px 14px',
          clipPath: 'polygon(0% 0%, calc(100% - 22px) 0%, 100% 22px, 100% 100%, 0% 100%)',
          minHeight: '74px',
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
            placeholder={saved ? "✓ Nota registrata!" : "Scrivi una nota..."}
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

// ── Dati Impegni e Calendario Settimanale DADO Creative Studio (Sincronizzati con /calendar) ──
function getDaySchedule(dateIso) {
  return getCalendarDayData(dateIso)
}

// ── Dashboard Principale ──────────────────────────────────
export default function Dashboard() {
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
  const [nextActionsWidth, setNextActionsWidth] = useState(223)
  const [preventiviMarginTop, setPreventiviMarginTop] = useState(null)
  const [clockDriveHeight, setClockDriveHeight] = useState(null)

  useEffect(() => {
    function updateMeasurements() {
      // 1. Allinea larghezza Next actions fino alla fine del riquadro Lunedì
      if (mondayButtonRef.current && nextActionsRef.current) {
        const mondayRect = mondayButtonRef.current.getBoundingClientRect()
        const parentRect = nextActionsRef.current.parentElement.getBoundingClientRect()
        const measuredWidth = Math.round(mondayRect.right - parentRect.left)
        if (measuredWidth > 170) {
          setNextActionsWidth(measuredWidth)
        }
      }

      // 2. Calcola altezza Google Drive portando la parte inferiore esattamente a filo delle cards superiori
      if (calendarContainerRef.current && clockDriveRef.current) {
        const cardRect = calendarContainerRef.current.getBoundingClientRect()
        const driveRect = clockDriveRef.current.getBoundingClientRect()
        const targetH = Math.round(cardRect.bottom - driveRect.top)
        if (targetH > 50 && targetH < 150) {
          setClockDriveHeight(targetH)
        }
      }

      // 3. Allinea inizio Box Preventivi alla medesima altezza verticale di Next actions (posizionato sotto a Google Drive e Note)
      if (nextActionsRef.current && noteBoxRef.current) {
        const nextRect = nextActionsRef.current.getBoundingClientRect()
        const noteRect = noteBoxRef.current.getBoundingClientRect()
        const offset = Math.round(nextRect.top - noteRect.bottom)
        setPreventiviMarginTop(Math.max(0, offset))
      } else if (nextActionsRef.current && clockDriveRef.current) {
        const nextRect = nextActionsRef.current.getBoundingClientRect()
        const driveRect = clockDriveRef.current.getBoundingClientRect()
        const offset = Math.round(nextRect.top - driveRect.bottom)
        setPreventiviMarginTop(Math.max(12, offset))
      } else if (nextActionsRef.current && askOpenAiRef.current) {
        const nextRect = nextActionsRef.current.getBoundingClientRect()
        const askRect = askOpenAiRef.current.getBoundingClientRect()
        const offset = Math.round(nextRect.top - askRect.bottom)
        setPreventiviMarginTop(Math.max(12, offset))
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
        e.preventDefault()
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

  const currentDaySchedule = useMemo(() => {
    if (!selectedCalendarDay?.date) return null
    return getDaySchedule(selectedCalendarDay.date)
  }, [selectedCalendarDay])

  return (
    <div className="h-full min-h-screen md:min-h-0 bg-transparent flex flex-col flex-1 relative overflow-hidden">
      {/* Automazione otturatore macchina fotografica Cine/Foto */}
      <CameraShutter
        trigger={shutterTrigger}
        onMidpoint={handleShutterMidpoint}
        duration={650}
      />

      {/* Canvas Principale con sfondo Parquet Rovere di lusso e angoli sinistri esterni arrotondati adagiati sulla barra metallica e angolo destro a taglio netto a 90° dritto col confine dello display */}
      <div
        className="h-full flex-1 rounded-tl-[48px] rounded-bl-[48px] rounded-tr-none rounded-br-none flex flex-col justify-between relative min-w-0 overflow-hidden"
        style={{
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
          borderTopRightRadius: '0px',
          borderBottomRightRadius: '0px',
          backgroundColor: '#ede3d4',
          backgroundImage: `
            radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 55%, rgba(120, 100, 80, 0.08) 100%),
            url('/dashboard-parquet.jpg?v=beige1')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >

        {/* ── Banda Superiore: stessa tonalità di grigio della barra laterale (#2d3139), sfuma in bianco prima di giungere ad ASK OPENAI ── */}
        <div className="w-full flex justify-end flex-shrink-0">
          <div
            className="rounded-bl-2xl rounded-tl-none rounded-tr-none rounded-br-none w-[calc(100%-2.5rem)]"
            style={{
              height: 'calc(3rem - 0.5cm)',
              background: 'linear-gradient(90deg, #2d3139 0%, #2d3139 calc(100% - 480px), #64748b calc(100% - 400px), #cbd5e1 calc(100% - 340px), #ffffff calc(100% - 295px), #ffffff 100%)',
              borderTopRightRadius: '0px',
              borderBottomRightRadius: '0px',
            }}
          />
        </div>

        {/* ── Contenuto Principale della Dashboard (allineato orizzontalmente e verticalmente sotto la banda bianca) ── */}
        <div className="flex-1 min-h-0 pl-10 pr-8 pt-2 pb-0 flex gap-6 min-w-0 items-stretch overflow-y-auto">

        {/* ══ COLONNA SINISTRA & CENTRALE (allineata sotto la banda bianca) ══ */}
        <div className="flex-1 flex flex-col gap-2.5 min-w-0 relative">

          {/* Intestazione Dashboard & Card Riposizionate in alto se in Focus Mode */}
          <div className="flex items-start justify-between gap-4 flex-wrap" style={{ marginTop: 'calc(-6px + 0.7cm)' }}>
            <div className="flex items-start">
              <div>
                {/* Sottotitolo "Go get it today" (nascosto in Focus Mode per compattezza) */}
                {!isAiFocusMode && (
                  <p style={{ marginTop: '4px', marginBottom: '6px', fontSize: '18px', fontFamily: '"Switzer", sans-serif', fontWeight: 700, letterSpacing: '-0.02em', textShadow: '0 1px 2px rgba(0, 0, 0, 0.45)' }}>
                    <span style={{ color: '#00e5ff' }}>Go get it </span>
                    <span style={{ color: '#00e575' }}>today</span>
                  </p>
                )}
              </div>
            </div>

            {/* SE IN FOCUS MODE: Card riposizionate e ridimensionate in alto accanto a Note Sviluppatore */}
            {isAiFocusMode && (
              <div className="flex items-center gap-2 flex-wrap animate-fadeIn select-none mr-2">
                <div className="px-3 py-1.5 rounded-md bg-[#111111] flex items-center gap-2 shadow-sm border border-[#ff6f43]/40">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#ff6f43]">TO DO:</span>
                  <span className="text-base font-black text-[#ff6f43] leading-none">4</span>
                  <span className="text-[9.5px] font-bold text-gray-400">(2 oggi)</span>
                </div>
                <div className="px-3 py-1.5 rounded-md bg-[#9c27b0] flex items-center gap-2 shadow-sm border border-purple-400/30">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00ff66]">OPEN OPP:</span>
                  <span className="text-base font-black text-[#00ff66] leading-none">10</span>
                  <span className="text-[9.5px] font-bold text-[#00e5ff]">(€ 52.7k)</span>
                </div>
                <Link to="/companies" className="px-3 py-1.5 rounded-md bg-[#00ffaa] flex items-center gap-2 shadow-sm hover:opacity-90">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#111111]">CLIENTS:</span>
                  <span className="text-base font-black text-[#111111] leading-none">11</span>
                </Link>
                <div className="px-2 py-1.5 rounded-md bg-white flex items-center gap-1 border border-black/10 shadow-sm">
                  <span className="text-[9px] font-mono font-bold text-slate-500 mr-1">WEEK:</span>
                  {currentWeekDays.map((d) => (
                    <span
                      key={d.date}
                      className={`w-4 h-4 flex items-center justify-center rounded text-[10px] font-black font-mono leading-none ${
                        d.isToday ? 'bg-[#00c853] text-white shadow-sm ring-1 ring-[#00c853]/40' : 'text-slate-700'
                      }`}
                      title={d.name}
                    >
                      {d.letter}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* ── IN FOCUS MODE: SEZIONE OUTPUT ALLARGATA A TUTTO SCHERMO ── */}
          {isAiFocusMode && (
            <div
              onWheel={handleOutputCardWheel}
              className="w-full flex-1 flex flex-col justify-between p-5 rounded-2xl shadow-2xl relative animate-fadeIn"
              style={{
                backgroundColor: '#0b1626',
                backdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(0, 255, 170, 0.55)',
                boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.85), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
                minHeight: '440px',
                height: 'calc(100vh - 195px)',
                fontFamily: '"Jost", "Inter", sans-serif',
              }}
            >
              {/* Header Console AI Espansa */}
              <div className="flex items-center justify-between pb-3 border-b border-white/15 gap-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#00ffaa] animate-ping" />
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={19} className="text-[#d8ff00]" />
                      <h2 className="text-white font-black text-lg tracking-wide uppercase">
                        CONSOLE RISPOSTA INTELLIGENZA ARTIFICIALE
                      </h2>
                    </div>
                    <p className="text-white/60 text-xs font-mono">
                      DADO Creative Studio CRM • Modalità Focus Attiva
                    </p>
                  </div>
                </div>

                {/* Pulsante ESC per chiudere e Info rotellina */}
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-mono select-none">
                    <span>🖱️ Rotellina mouse attiva ovunque</span>
                  </div>
                  <button
                    type="button"
                    onClick={triggerExitFocus}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff4500] hover:bg-[#ff5722] text-white text-xs font-bold font-mono tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Ripristina la schermata originale (o premi tasto ESC)"
                  >
                    <span>✕ CHIUDI SCHERMATA</span>
                    <kbd className="px-2 py-0.5 rounded bg-black/50 text-[10px] text-white font-mono border border-white/20">ESC</kbd>
                  </button>
                </div>
              </div>

              {/* Area di Testo Scorrevole con Rotellina attiva OVUNQUE */}
              <div
                ref={outputScrollRef}
                className="flex-1 overflow-y-auto overscroll-contain pr-4 mt-3 space-y-3 select-text"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#00ffaa rgba(0,0,0,0.3)',
                }}
              >
                {aiLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/80 gap-4 py-16">
                    <div className="w-10 h-10 border-4 border-[#00ffaa] border-t-transparent rounded-full animate-spin" />
                    <span className="text-lg font-mono font-bold animate-pulse text-[#00ffaa]">
                      Otturatore scattato • Elaborazione analisi con DADO CRM...
                    </span>
                  </div>
                ) : (
                  <>
                    {aiResult?.question && (
                      <div className="p-3.5 bg-black/55 rounded-xl border border-white/15 text-sm font-mono text-emerald-300 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white/50 text-xs uppercase tracking-wider">Richiesta:</span>
                          <span className="text-white font-bold text-[15px]">"{aiResult.question}"</span>
                        </div>
                        {aiResult?.timestamp && (
                          <span className="text-white/40 text-xs font-mono">{aiResult.timestamp}</span>
                        )}
                      </div>
                    )}

                    <div
                      className="p-6 rounded-xl bg-black/40 border border-white/10 text-[15.5px] leading-relaxed whitespace-pre-line text-[#f5f5f0] shadow-inner font-sans tracking-wide"
                      style={{
                        lineHeight: '1.75',
                      }}
                    >
                      {aiResult?.content}
                    </div>
                  </>
                )}
              </div>

              {/* Footer Console AI */}
              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50 flex-shrink-0">
                <span>💡 Suggerimento: Premi il tasto ESC sulla tastiera per ripristinare la visuale iniziale e riaprire la barra laterale</span>
                <span className="text-emerald-400 font-bold">DADO • STUDIO</span>
              </div>
            </div>
          )}

          {/* ── IN VISUALE STANDARD: Riga 1 (TO DO + Week + Active Clients) + Riga 2 (Next actions + Pop-up estesa al centro) ── */}
          {!isAiFocusMode && (
            <div className="flex flex-col mb-1 flex-1 min-w-0">

              {/* Riga Superiore: Card TO DO, Calendario Week e Card ACTIVE CLIENTS */}
              <div className="flex gap-2.5 items-stretch flex-shrink-0">
                {/* Card: TO DO — Sfondo Blu Notte con testo e numero 4 in Red Rose */}
                <KpiCard
                  label="TO DO"
                  value="4"
                  bg="#0b1626"
                  labelColor="#ff0000"
                  valueColor="#ff0000"
                  labelStroke="1.2px #ff6600"
                  labelShadow="0 0 2px #ff4500"
                  valueStroke="1px #ff6600"
                  valueShadow="0 0 2px #ff4500"
                  fontFamily='"Red Rose", serif'
                  valueFontFamily='"Red Rose", serif'
                  valueWeight={700}
                  letterSpacing="0.04em"
                  sub="2 in scadenza oggi"
                  subColor="#94a3b8"
                  width="160px"
                  minHeight="104px"
                  height="104px"
                  labelSize="15px"
                  valueSize="38px"
                  subSize="14px"
                />

                {/* Calendario accanto alla card TO DO */}
                <div
                  ref={calendarContainerRef}
                  onMouseEnter={handleCalendarMouseEnter}
                  onMouseLeave={handleCalendarMouseLeave}
                  className="p-2.5 bg-white shadow-sm flex flex-col justify-between min-h-[104px] h-[104px] border border-black/10 select-none shrink-0"
                  style={{
                    backgroundColor: '#ffffff',
                    width: 'calc(240px + 3cm)',
                    borderRadius: '6px',
                  }}
                >
                    {/* Header Sezione: Nome del mese corrente ingrandito (senza "calendar week" e senza anno) */}
                    <div className="flex items-center px-0.5">
                      <span
                        className="font-black uppercase tracking-[0.12em] block leading-tight text-[14px]"
                        style={{
                          fontFamily: '"Space Mono", monospace',
                          color: '#111111',
                        }}
                      >
                        {currentMonthName}
                      </span>
                    </div>

                    {/* 7 Caselle Giorni estese per maggiore facilità di click: prima lettera (L M M G V S D) con segna giorno dinamico */}
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
                            className={`flex flex-col items-center justify-center rounded-md transition-all group py-1 border cursor-pointer ${
                              isSelected
                                ? 'ring-2 ring-[#00ffaa] bg-emerald-50 shadow-md border-[#00c853]'
                                : d.isToday
                                ? 'border-[#00c853] bg-emerald-50/90 hover:bg-emerald-100 ring-2 ring-[#00c853]/40 shadow-sm'
                                : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            title={`Posiziona il cursore o clicca per visualizzare gli impegni di ${d.name}`}
                          >
                            <span
                              className="text-[17px] font-black leading-none block"
                              style={{
                                fontFamily: '"Goldman", sans-serif',
                                color: isSelected ? '#007a50' : d.isToday ? '#007a50' : '#334155',
                              }}
                            >
                              {d.letter}
                            </span>
                            {d.isToday && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00c853] mt-1 shadow-sm" title="Oggi" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Card ACTIVE CLIENTS posizionata accanto a Calendar Week in proporzione alla card TO DO */}
                  <Link
                    to="/companies"
                    className="block hover:opacity-90 transition-opacity flex flex-col group cursor-pointer shrink-0"
                    title="Apri il Database Aziende & Contratti"
                  >
                    <KpiCard
                      label="ACTIVE CLIENTS"
                      value="11"
                      bg="#00ffaa"
                      labelColor="#111111"
                      valueColor="#111111"
                      fontFamily='"Red Rose", serif'
                      letterSpacing="0.04em"
                      sub="11 clienti attivi"
                      subColor="rgba(0, 0, 0, 0.7)"
                      width="160px"
                      minHeight="104px"
                      height="104px"
                      labelSize="13px"
                      valueSize="36px"
                      subSize="12.5px"
                      padding="p-3"
                    />
                  </Link>
                </div>

                {/* Riga Inferiore: Next actions (sinistra) + Finestra Pop-up estesa al centro della dashboard */}
                <div className="flex items-start gap-4 flex-1 min-h-0" style={{ marginTop: '0.4cm', marginBottom: '0.3cm' }}>
                  {/* Box 1: Next actions — Ristretto fino alla fine del riquadro Lunedì del Calendar Week e sfalsato più in basso di 1cm */}
                  <div
                    ref={nextActionsRef}
                    className="bg-[#0b1626] px-3.5 py-3 flex flex-col justify-between flex-shrink-0 shadow-sm"
                    style={{
                      width: nextActionsWidth ? `${nextActionsWidth}px` : '223px',
                      height: '296px',
                      borderRadius: '8px',
                      marginTop: '1cm',
                    }}
                  >
                    <div>
                      {/* Intestazione Next actions (senza collegamento e senza punto) */}
                      <h2
                        className="text-white font-bold leading-tight"
                        style={{ fontSize: '20px' }}
                      >
                        Next actions
                      </h2>
                      {/* Testo "no races.." protetto su una sola riga senza andare a capo */}
                      <p
                        className="mt-0.5 font-medium leading-tight whitespace-nowrap"
                        style={{ color: '#ffffff', fontSize: '12.5px', letterSpacing: '-0.02em' }}
                      >
                        No races. Keep your pace.
                      </p>
                    </div>

                    {/* Contenitore azioni con collegamenti cliccabili a Calendar */}
                    <div className="flex flex-col gap-3.5 flex-1" style={{ marginTop: '12px' }}>
                      {/* 1. Today — Cliccabile collegato a Calendar */}
                      <div className="w-full flex justify-center">
                        <Link
                          to={`/calendar?date=${todayIso}&day=today`}
                          className="border-2 border-[#ff4500] px-3.5 py-1 w-fit shadow-sm block hover:scale-105 transition-transform"
                          style={{
                            backgroundColor: 'transparent',
                            transform: 'skewX(-20deg)',
                            borderRadius: '8px',
                          }}
                          title={`Apri Today (${todayIso}) nel Calendario`}
                        >
                          <span
                            style={{
                              fontFamily: '"Red Rose", serif',
                              color: '#ff0000',
                              WebkitTextStroke: '1.2px #ff6600',
                              textShadow: '0 0 2px #ff4500',
                              fontWeight: 800,
                              fontSize: '1.38rem',
                              display: 'inline-block',
                              letterSpacing: '0.04em',
                              lineHeight: 1.15,
                            }}
                          >
                            Today
                          </span>
                        </Link>
                      </div>

                      {/* 2. Riquadro Bianco Note */}
                      <div className="w-full flex justify-center">
                        <Link
                          to="/activities?tab=notes"
                          className="bg-white rounded-full px-4 py-1 w-full flex items-center justify-center shadow-sm hover:scale-[1.02] transition-transform block"
                          title="Apri le Note e Annotazioni"
                        >
                          <span
                            style={{
                              fontFamily: '"Goldman", sans-serif',
                              color: '#111111',
                              fontWeight: 700,
                              fontSize: '1.20rem',
                              letterSpacing: '0.04em',
                              lineHeight: 1,
                              display: 'inline-block',
                            }}
                          >
                            Note
                          </span>
                        </Link>
                      </div>

                      {/* 3. Call Reports — Forma capsula metallica */}
                      <div className="w-full flex justify-center">
                        <Link
                          to="/activities?type=call"
                          className="px-4 rounded-full flex items-center justify-center w-full shadow-sm hover:scale-105 transition-transform block overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, #dce1e5 0%, #b8bfc6 35%, #9aa1a9 70%, #b4bac1 100%)',
                            boxShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.8), 0 2px 5px rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.5)',
                            height: '32px',
                          }}
                          title="Visualizza Call Reports"
                        >
                          <span
                            className="text-center"
                            style={{
                              fontFamily: '"Goldman", sans-serif',
                              color: '#2ec1db',
                              fontSize: '1.08rem',
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              lineHeight: 1,
                              display: 'inline-block',
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            call reports
                          </span>
                        </Link>
                      </div>

                      {/* 4. New Opportunities — Senza riquadro, testo lilla tendente al viola */}
                      <div className="w-full flex justify-center pt-0.5">
                        <Link
                          to="/opportunities"
                          className="flex items-center justify-center hover:opacity-90 hover:scale-105 transition-all block text-center"
                          title="Apri la sezione Nuove Opportunità"
                        >
                          <span
                            style={{
                              fontFamily: '"Goldman", sans-serif',
                              fontSize: '1.05rem',
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              lineHeight: 1,
                              display: 'inline-block',
                              color: '#b388ff',
                              textShadow: '0 0 10px rgba(179, 136, 255, 0.4)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            New Opportunities
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Sezione Output / Pop-up Allargata nello spazio guadagnato al centro della dashboard */}
                  {(aiResult || aiLoading || (selectedCalendarDay && currentDaySchedule?.events?.length > 0)) && (
                    <div
                      ref={popupContainerRef}
                      onMouseEnter={handlePopupMouseEnter}
                      onMouseLeave={handlePopupMouseLeave}
                      onWheel={(e) => {
                        e.stopPropagation()
                        if (popupScrollRef.current) popupScrollRef.current.scrollTop += e.deltaY
                      }}
                      className="flex-1 min-w-[320px] max-w-[580px] flex flex-col p-4 rounded-2xl transition-all animate-fadeIn shadow-2xl relative self-stretch overflow-hidden"
                      style={{
                        backgroundColor: '#0b1626',
                        backdropFilter: 'blur(20px)',
                        border: 'none',
                        boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
                        height: 'calc(100vh - 280px)',
                        minHeight: '380px',
                        maxHeight: 'calc(100vh - 280px)',
                        fontFamily: '"Switzer", sans-serif',
                        overscrollBehavior: 'contain',
                      }}
                    >
                      {/* Header Sezione Output: font Switzer, senza perimetrature verdi e senza icone */}
                      <div className="flex items-center justify-between pb-2 mb-2 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        {selectedCalendarDay && activeOutputTab !== 'ai' ? (
                          <span
                            className="text-white font-bold tracking-wide uppercase text-[15px]"
                            style={{ fontFamily: '"Switzer", sans-serif' }}
                          >
                            Attività Programmate
                          </span>
                        ) : aiResult && selectedCalendarDay ? (
                          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg">
                            <button
                              onClick={() => setActiveOutputTab('day')}
                              className={`px-3 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                                activeOutputTab === 'day'
                                  ? 'bg-white/20 text-white shadow-sm'
                                  : 'text-white/60 hover:text-white'
                              }`}
                              style={{ fontFamily: '"Switzer", sans-serif' }}
                            >
                              Attività Programmate
                            </button>
                            <button
                              onClick={() => setActiveOutputTab('ai')}
                              className={`px-3 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                                activeOutputTab === 'ai'
                                  ? 'bg-white/20 text-white shadow-sm'
                                  : 'text-white/60 hover:text-white'
                              }`}
                              style={{ fontFamily: '"Switzer", sans-serif' }}
                            >
                              Risposta OpenAI
                            </button>
                          </div>
                        ) : (
                          <span
                            className="text-white/90 font-semibold tracking-wide text-[15px] truncate"
                            style={{ fontFamily: '"Switzer", sans-serif' }}
                          >
                            {aiLoading ? 'Analisi in corso...' : 'Indagine CRM & Punti in Comune (OpenAI)'}
                          </span>
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
                          {/* Elenco Attività Programmate: disposto senza riquadri perimetrali e senza icone */}
                          <div className="flex flex-col w-full">
                            {currentDaySchedule.events.map((ev, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col gap-1.5 py-2.5 text-left w-full"
                                style={{
                                  borderBottom: idx < currentDaySchedule.events.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                                  fontFamily: '"Switzer", sans-serif',
                                }}
                              >
                                {/* 1. Riga Superiore: Orario & Cliente senza riquadri verdi */}
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[13px] font-semibold text-white/90 whitespace-nowrap">
                                    {ev.time}
                                  </span>
                                  <span className="text-white font-bold text-[14px] truncate flex-1 text-right">
                                    {ev.company}
                                  </span>
                                  {ev.category && (
                                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-white/70 whitespace-nowrap">
                                      {ev.category}
                                    </span>
                                  )}
                                </div>

                                {/* 2. Dettagli Chiave: Luogo & Materiali senza icone e senza perimetraggi */}
                                <div className="space-y-1 text-[12.5px] leading-snug">
                                  {ev.location && (
                                    <div className="flex items-start gap-1.5 text-slate-200">
                                      <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wide flex-shrink-0">
                                        Luogo:
                                      </span>
                                      <span className="font-normal text-slate-100 break-words flex-1">
                                        {ev.location}
                                      </span>
                                    </div>
                                  )}
                                  {ev.materials && (
                                    <div className="flex items-start gap-1.5 text-slate-200">
                                      <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wide flex-shrink-0">
                                        Materiali:
                                      </span>
                                      <span className="font-normal text-slate-100 break-words flex-1">
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

                          {/* Note & Allegati senza riquadri perimetrali e senza icone */}
                          {(currentDaySchedule.notes || (currentDaySchedule.files && currentDaySchedule.files.length > 0)) && (
                            <div className="flex flex-col gap-2.5 pt-2.5 w-full" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                              {currentDaySchedule.notes && (
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-semibold text-slate-400 uppercase text-[10.5px] tracking-wide block">
                                    Note:
                                  </span>
                                  <div className="text-[12.5px] text-white/90 leading-relaxed break-words">
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
                                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
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

        {/* ══ COLONNA DESTRA (w-64: ClockDriveBox e Box Preventivi a tutta larghezza 256px) ══ */}
        <div ref={colonnaDestraRef} className="self-stretch flex-shrink-0 flex flex-col gap-3 min-w-0 items-end w-64 relative">

          {/* 1. Box ASK OPEN AI (Sfondo bianco, collegato alla sezione output) */}
          <div ref={askOpenAiRef} className="w-full">
            <AskOpenAiBox
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

          {/* 2. Box Collegamento Google Drive con Orologio (Centrato sotto Ask OpenAI, parte inferiore a filo delle cards) */}
          <div ref={clockDriveRef} className="w-full flex justify-center">
            <ClockDriveBox height={clockDriveHeight ? `${clockDriveHeight}px` : '78px'} />
          </div>

          {/* Box Note sotto Google Drive: tipo pagina girata di un libro completamente bianca con piega a destra in rilievo */}
          <div ref={noteBoxRef} className="w-full">
            <TurnedPageNoteBox />
          </div>

          {/* 3. Box Preventivi (Abbassato alla medesima altezza della sezione Next actions, colori tenui dal brand logo DADO, tutti cliccabili) */}
          <div
            className="w-full flex flex-col shadow-sm overflow-hidden"
            style={{
              backgroundColor: '#6cc280',
              borderRadius: '6px',
              marginTop: preventiviMarginTop !== null ? `${preventiviMarginTop}px` : '12px',
            }}
          >
            {/* 1. preventivi in scadenza: Cliccabile — tonalità tenue corallo/rosso dalla lettera A del brand logo DADO (#ee3922) */}
            <Link
              to="/opportunities?status=scadenza"
              className="px-3.5 py-3 min-h-[50px] flex items-center gap-2.5 hover:opacity-90 transition-opacity block group"
              style={{ backgroundColor: '#ee523f' }}
              title="Visualizza preventivi in scadenza"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#111111] flex-shrink-0 group-hover:scale-125 transition-transform" />
                <span
                  className="text-[#111111] font-bold tracking-tight leading-snug"
                  style={{ fontSize: '16.5px' }}
                >
                  preventivi in scadenza
                </span>
              </div>
            </Link>

            {/* Linea orizzontale continua nera */}
            <div className="border-b border-[#111111]" />

            {/* 2. preventivi inviati: Cliccabile — tonalità tenue turchese/ciano dalla 2^ D del brand logo DADO (#2ec1db) */}
            <Link
              to="/opportunities?status=inviati"
              className="px-3.5 py-3 min-h-[50px] flex items-center gap-2.5 hover:opacity-90 transition-opacity block group"
              style={{ backgroundColor: '#2ec1db' }}
              title="Visualizza preventivi inviati"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#111111] flex-shrink-0 group-hover:scale-125 transition-transform" />
                <span
                  className="text-[#111111] font-bold tracking-tight leading-snug"
                  style={{ fontSize: '16.5px' }}
                >
                  preventivi inviati
                </span>
              </div>
            </Link>

            {/* Linea orizzontale continua nera */}
            <div className="border-b border-[#111111]" />

            {/* 3. ultimo preventivo: Cliccabile — tonalità tenue verde salvia dalla 1^ D del brand logo DADO (#6cc280) */}
            <Link
              to="/opportunities?sort=latest"
              className="px-3.5 py-3 min-h-[50px] flex items-center gap-2.5 hover:opacity-90 transition-opacity block group"
              style={{ backgroundColor: '#6cc280' }}
              title="Visualizza ultimo preventivo"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#111111] flex-shrink-0 group-hover:scale-125 transition-transform" />
                <span
                  className="text-[#111111] font-bold tracking-tight leading-snug"
                  style={{ fontSize: '16.5px' }}
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
      <div className="w-full flex justify-end flex-shrink-0 mt-auto">
        <div
          className="rounded-tl-2xl rounded-tr-none rounded-br-none rounded-bl-none w-[calc(100%-2.5rem)] flex items-center justify-end px-6 overflow-hidden py-1"
          style={{
            height: '42px',
            backgroundColor: '#2d3139',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '0px',
            borderBottomRightRadius: '0px',
            borderBottomLeftRadius: '0px',
          }}
        >
          <DeveloperNotesSearchBar />
        </div>
      </div>

      </div>
    </div>
  )
}


