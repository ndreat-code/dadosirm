import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Database, Sparkles, X, ArrowRight, Calendar as CalendarIcon, Clock, FileText, Paperclip } from 'lucide-react'
import CameraShutter from '../components/CameraShutter'
import { getCurrentWeekDays, getCurrentMonthName, getTodayIso, getTomorrowIso, getCurrentWeekSundayIso, formatDayLong } from '../utils/dateUtils'
import { getCalendarDayData } from '../utils/calendarData'

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
}) {
  return (
    <div
      className="p-3 flex flex-col justify-between min-w-0 shadow-sm"
      style={{
        backgroundColor: bg,
        borderRadius: '6px',
        minHeight,
        height: height || undefined,
        flex: width ? 'none' : flex,
        width: width || undefined,
        fontFamily: '"Switzer", sans-serif',
      }}
    >
      {/* Titolo card */}
      <span
        className="font-black uppercase tracking-[0.08em] block leading-tight whitespace-nowrap"
        style={{ color: labelColor, fontSize: labelSize, fontFamily: '"Switzer", sans-serif', letterSpacing: '-0.01em' }}
      >
        {label}
      </span>
      <div className="mt-1">
        <span
          className="font-black leading-none block"
          style={{ color: valueColor, fontSize: valueSize, fontFamily: '"Switzer", sans-serif', letterSpacing: '-0.03em' }}
        >
          {value}
        </span>
        {/* Scritta sotto il numero */}
        {sub && (
          <span
            className="font-bold block mt-1.5 leading-tight whitespace-nowrap"
            style={{ color: subColor || 'rgba(255,255,255,0.7)', fontSize: subSize, fontFamily: '"Switzer", sans-serif', letterSpacing: '-0.01em' }}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Box Orologio con Bordo Ciano e Logo Google Drive come sfondo ─────
function ClockDriveBox() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hhmm = time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className="border border-[#00c8c8] rounded-[6px] py-2 px-3 text-center cursor-pointer hover:border-cyan-400 transition-all relative overflow-hidden group select-none shadow-sm flex flex-col items-center justify-center min-h-[64px]"
      style={{ backgroundColor: '#ffffff' }}
      onClick={() => window.open('https://drive.google.com', '_blank')}
      title="Clicca per aprire Google Drive"
    >
      {/* Sfondo: Logo Google Drive attuale (2026) ingrandito e centrato, contenuto solo nel riquadro */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img
          src="/google-drive-logo.jpg"
          alt="Google Drive Logo"
          className="w-[130px] h-[130px] object-contain opacity-40 group-hover:opacity-60 transition-opacity transform scale-135"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Contenuto testuale ingrandito: ORE (18px) è 2 punti più grande di Google Drive (16px) */}
      <div className="relative z-10">
        <div
          className="font-black tracking-wider text-[#111111] leading-tight"
          style={{ fontSize: '18px' }}
        >
          ORE: {hhmm}
        </div>
        <div
          className="font-bold text-[#111111] mt-1 tracking-wide leading-tight"
          style={{ fontFamily: 'Goldman, sans-serif', fontSize: '16px' }}
        >
          Google Drive
        </div>
      </div>
    </div>
  )
}

// ── Box ASK OPEN AI (Attaccato alla banda bianca, con contenuto scalato al di sotto della banda) ──
function AskOpenAiBox({ onAskComplete, onLoadingChange, onStartAsk }) {
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
        headers: { 'Content-Type': 'application/json' },
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
          placeholder="Digita domanda..."
          disabled={loading}
          className="flex-1 bg-gray-50 border border-gray-200 px-2 py-1 text-xs text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-black"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-black text-white hover:bg-gray-800 disabled:opacity-30 px-2 py-1 text-xs font-bold cursor-pointer"
        >
          {loading ? '...' : '→'}
        </button>
      </form>
    </div>
  )
}

// ── Box NOTE PER SVILUPPATORE (Grigio metallizzato, testo nero bold, tasto INVIA nero in rilievo) ──
function DeveloperNotesBox() {
  const [note, setNote] = useState('')
  const [status, setStatus] = useState(null) // 'sending', 'sent'

  async function handleSendNote(e) {
    if (e) e.preventDefault()
    const textToSend = note.trim()
    if (!textToSend || status === 'sending') return

    setStatus('sending')
    // Il testo NON rimane lì: si svuota subito lasciando la sezione pronta
    setNote('')

    try {
      fetch('/api/developer-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: textToSend }),
      }).catch(err => console.warn('Salvataggio server:', err))

      setStatus('sent')
      setTimeout(() => setStatus(null), 3500)
    } catch (err) {
      setStatus(null)
    }
  }

  return (
    <div
      className="w-full px-3 py-2 flex flex-col justify-between shadow-sm transition-all select-none"
      style={{
        background: 'linear-gradient(135deg, #e4e7eb 0%, #cbd2d8 50%, #b2b9c0 100%)', // Grigio metallizzato
        border: '1px solid rgba(255, 255, 255, 0.7)',
        borderRadius: '6px',
        height: '120px', // Altezza proporzionata tra preventivi e logo
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
      }}
    >
      <div>
        {/* Titolo orizzontale */}
        <div className="text-center pt-0.5 whitespace-nowrap px-0.5">
          <span
            style={{
              fontFamily: '"Space Mono", monospace',
              color: '#000000',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              display: 'inline-block',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            NOTE SVILUPPATORE
          </span>
        </div>

        {/* Separatore */}
        <div
          className="mx-auto"
          style={{
            width: '2.5cm',
            height: '1px',
            backgroundColor: '#000000',
            marginTop: '4px',
            marginBottom: '4px',
          }}
        />
      </div>

      {/* Area testo o stato inviato */}
      <div className="flex-1 flex flex-col my-1 relative min-h-0">
        {status === 'sent' ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-1 bg-black/85 rounded border border-white/20">
            <span className="text-[10px] font-bold text-[#00ffaa] leading-tight">
              ✓ Inviata a<br />n.drea.t@gmail.com
            </span>
          </div>
        ) : (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendNote(e)
              }
            }}
            placeholder="Scrivi una nota..."
            className="w-full h-full p-1.5 text-[11px] font-bold text-black placeholder:text-black placeholder:font-bold rounded-none focus:outline-none resize-none leading-tight"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.82)',
              border: '1px solid rgba(0, 0, 0, 0.25)',
              color: '#000000',
              fontFamily: '"Space Mono", monospace',
              fontWeight: 700,
            }}
          />
        )}
      </div>

      {/* Tasto Invia nero scuro puro (#000000) in rilievo con testo grigio metallizzato NON bold */}
      <button
        type="button"
        onClick={handleSendNote}
        className="w-full py-1.5 hover:brightness-125 active:translate-y-0.5 tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer select-none"
        style={{
          backgroundColor: '#000000',
          background: '#000000',
          fontFamily: '"Space Mono", monospace',
          borderRadius: '3px',
          border: '1px solid #000000',
          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 0 -2px 0 rgba(0, 0, 0, 1)',
          color: '#cbd2d8',
          fontWeight: 400,
          fontSize: '10px',
          opacity: 1,
        }}
      >
        <span style={{ color: '#cbd2d8', fontWeight: 400 }}>{status === 'sending' ? 'Invio...' : 'INVIA'}</span>
        <span className="text-[9px]" style={{ color: '#cbd2d8' }}>✉</span>
      </button>
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
    <div className="h-full min-h-screen md:min-h-0 bg-[#111111] flex flex-col flex-1 relative overflow-hidden">
      {/* Automazione otturatore macchina fotografica Cine/Foto */}
      <CameraShutter
        trigger={shutterTrigger}
        onMidpoint={handleShutterMidpoint}
        duration={650}
      />

      {/* Canvas Verde principale che occupa tutta l'area con angoli sinistri esterni arrotondati */}
      <div className="h-full flex-1 bg-[#007a50] rounded-tl-[48px] rounded-bl-[48px] flex flex-col justify-between relative min-w-0 overflow-hidden">

        {/* ── Banda Bianca Superiore: spessore diminuito di 0,5cm ── */}
        <div className="w-full flex justify-end flex-shrink-0">
          <div className="bg-white rounded-bl-2xl w-[calc(100%-2.5rem)]" style={{ height: 'calc(3rem - 0.5cm)' }} />
        </div>

        {/* ── Contenuto Principale della Dashboard (allineato orizzontalmente e verticalmente sotto la banda bianca) ── */}
        <div className="flex-1 min-h-0 pl-10 pr-8 py-2 flex gap-6 min-w-0 items-stretch overflow-y-auto">

        {/* ══ COLONNA SINISTRA & CENTRALE (allineata sotto la banda bianca) ══ */}
        <div className="flex-1 flex flex-col gap-2.5 min-w-0 relative">

          {/* Intestazione Dashboard & Card Riposizionate in alto se in Focus Mode */}
          <div className="flex items-start justify-between gap-4 flex-wrap" style={{ marginTop: 'calc(-6px + 0.7cm)' }}>
            <div className="flex items-start">
              <div>
                <h1 className="leading-none flex items-baseline gap-0.5">
                  <span className="inline-flex items-center">
                    <svg width="25" height="32" viewBox="0 0 16 20" fill="none">
                      <path d="M0 0 H5 C11 0 16 4.5 16 10 C16 15.5 11 20 5 20 H0 V0 Z" fill="#111111" />
                    </svg>
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inspiration, cursive',
                      fontSize: isAiFocusMode ? '2.4rem' : '3.1rem',
                      color: '#111111',
                      lineHeight: 1,
                    }}
                  >
                    ashboard
                  </span>
                </h1>

                {/* Sottotitolo "Go get it today" (nascosto in Focus Mode per compattezza) */}
                {!isAiFocusMode && (
                  <p style={{ marginTop: 'calc(22px + 1.3cm)', marginBottom: '6px', fontSize: '18px', fontFamily: '"Switzer", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>
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
                backgroundColor: 'rgba(0, 32, 20, 0.97)',
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

          {/* ── IN VISUALE STANDARD: Riga 1 + Riga 2 a sinistra, Pop-up ad altezza Calendar Week a destra ── */}
          {!isAiFocusMode && (
            <div className="flex items-start gap-4 mb-1 flex-1 min-w-0">

              {/* Colonna Sinistra Fissa: Riga Superiore (TO DO + Calendario Week) + Riga Inferiore (Next actions + Opportunities/Clients) */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {/* Riga Superiore: Card TO DO e Calendario Week */}
                <div className="flex gap-2.5 items-stretch">
                  {/* Card: TO DO — Colore arancione #ff6f43 */}
                  <KpiCard
                    label="TO DO"
                    value="4"
                    bg="#111111"
                    labelColor="#ff6f43"
                    valueColor="#ff6f43"
                    sub="2 in scadenza oggi"
                    subColor="#888888"
                    width="160px"
                    labelSize="15px"
                    valueSize="36px"
                    subSize="14px"
                  />

                  {/* Calendario accanto alla card TO DO (spigoloso con angoli retti dal lato interno verso il centro dashboard e allargato all'estremità delle card sottostanti) */}
                  <div
                    ref={calendarContainerRef}
                    onMouseEnter={handleCalendarMouseEnter}
                    onMouseLeave={handleCalendarMouseLeave}
                    className="p-2.5 bg-white shadow-sm flex flex-col justify-between min-h-[104px] h-[104px] border border-black/10 select-none shrink-0"
                    style={{
                      backgroundColor: '#ffffff',
                      width: 'calc(260px - 1.3cm + 16px + 185px - 160px - 10px)',
                      borderRadius: '6px 0px 0px 6px',
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

                    {/* 7 Caselle Giorni: solo prima lettera (L M M G V S D) con segna giorno dinamico */}
                    <div className="grid grid-cols-7 gap-1 mt-1 flex-1 items-stretch">
                      {currentWeekDays.map((d) => {
                        const isSelected = selectedCalendarDay?.date === d.date
                        const isPinned = pinnedCalendarDay?.date === d.date
                        return (
                          <button
                            key={d.date}
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
                            className={`flex flex-col items-center justify-center rounded transition-all group py-1 border cursor-pointer ${
                              isSelected
                                ? 'ring-2 ring-[#00ffaa] bg-emerald-50 shadow-md border-[#00c853]'
                                : d.isToday
                                ? 'border-[#00c853] bg-emerald-50/90 hover:bg-emerald-100 ring-2 ring-[#00c853]/40 shadow-sm'
                                : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            title={`Posiziona il cursore o clicca per visualizzare gli impegni di ${d.name}`}
                          >
                            <span
                              className="text-base font-black leading-none block"
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
                </div>

                {/* Riga Inferiore: Next actions (sinistra) + Box 2: Opportunità e Clienti Attivi (destra) */}
                <div className="flex items-start gap-4">
                  {/* Box 1: Next actions — Accorciato di 0,3cm (calc(260px - 1.3cm)), riga 'No races..' preservata su una riga */}
                  <div
                    className="bg-[#111111] px-3 py-3 flex flex-col justify-between flex-shrink-0 shadow-sm"
                    style={{
                      width: 'calc(260px - 1.3cm)',
                      height: '240px',
                      borderRadius: '6px',
                    }}
                  >
                    <div>
                      {/* Intestazione Next actions (senza collegamento e senza punto) */}
                      <h2
                        className="text-white font-bold leading-tight"
                        style={{ fontSize: '17px' }}
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
                    <div className="flex flex-col gap-3 flex-1" style={{ marginTop: '10px' }}>
                      {/* 1. Today — Cliccabile collegato a Calendar */}
                      <div className="w-full flex justify-center">
                        <Link
                          to={`/calendar?date=${todayIso}&day=today`}
                          className="border-2 border-[#ff4500] px-3.5 py-0.5 w-fit shadow-sm block hover:scale-105 transition-transform"
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
                              fontSize: '1.18rem',
                              display: 'inline-block',
                              letterSpacing: '0.04em',
                              lineHeight: 1.15,
                            }}
                          >
                            Today
                          </span>
                        </Link>
                      </div>

                      {/* 2. Domani — Cliccabile collegato a Calendar */}
                      <div className="w-full flex justify-end">
                        <Link
                          to={`/calendar?date=${tomorrowIso}&day=tomorrow`}
                          className="bg-white rounded-full px-4 py-0.5 w-full flex items-center justify-end shadow-sm hover:scale-[1.02] transition-transform block"
                          title={`Apri Domani (${tomorrowIso}) nel Calendario`}
                        >
                          <span
                            style={{
                              fontFamily: '"Goldman", sans-serif',
                              color: '#00c853',
                              fontWeight: 400,
                              fontSize: '1.3rem',
                              letterSpacing: '0.04em',
                              lineHeight: 1,
                              display: 'inline-block',
                            }}
                          >
                            Domani
                          </span>
                        </Link>
                      </div>

                      {/* 3. Sunday: Cliccabile collegato a Calendar, con punta arrow calibrata, 'y' a 0,2 cm dall'inclinazione con gambo inclinato e visibile al 100% */}
                      <div className="w-full flex justify-end">
                        <Link
                          to={`/calendar?date=${sundayIso}&day=sunday`}
                          className="w-full h-[33px] relative flex items-center justify-end shadow-sm overflow-visible block hover:opacity-90 transition-opacity"
                          title={`Apri Sunday (${sundayIso}) nel Calendario`}
                        >
                          {/* Sfondo Freccia Viola sfumata con clip-path a punta */}
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: 'linear-gradient(90deg, rgba(17,17,17,0) 0%, rgba(17,17,17,0) 8%, #2d0442 16%, #4e0682 32%, #680bae 55%, #560088 100%)',
                              clipPath: 'polygon(0% 0%, calc(100% - 28px) 0%, 100% 50%, calc(100% - 28px) 100%, 0% 100%)',
                            }}
                          />

                          {/* Testo Sunday: parola completa con la Y visibile al 100%, trascinata di 0,3 cm verso destra all'interno del box */}
                          <span
                            className="relative z-10 flex items-baseline select-none"
                            style={{
                              marginRight: 'calc(24px - 0.1cm)',
                              fontFamily: '"Revalia", cursive, sans-serif',
                              fontSize: '1.22rem',
                              letterSpacing: '0.07em',
                              background: 'linear-gradient(90deg, #2b2310 0%, #3e3114 10%, #685014 24%, #a07d16 42%, #d4a916 64%, #ffd700 82%, #ffff00 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              fontWeight: 400,
                              lineHeight: 1.25,
                            }}
                          >
                            Sunday
                          </span>
                        </Link>
                      </div>

                      {/* 4. monday — Cliccabile collegato a Calendar */}
                      <Link
                        to={`/calendar?date=${currentWeekDays[0]?.date || todayIso}&day=monday`}
                        className="px-2.5 rounded-none flex items-center justify-start w-[112px] shadow-sm hover:scale-105 transition-transform block overflow-hidden"
                        style={{
                          backgroundColor: '#d8a882',
                          height: '28px',
                          marginTop: '4px',
                        }}
                        title={`Apri monday (${currentWeekDays[0]?.date || 'Lunedì'}) nel Calendario`}
                      >
                        <span
                          style={{
                            fontFamily: '"Goldman", sans-serif',
                            color: '#1e78d6',
                            fontSize: '1.18rem',
                            fontWeight: 400,
                            letterSpacing: '0.04em',
                            lineHeight: 1,
                            display: 'inline-block',
                            transform: 'translateY(2px)',
                          }}
                        >
                          monday
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Box 2: Card Nuove Opportunità e Clienti Attivi una sopra l'altra a lato di Next actions */}
                  <div
                    className="flex flex-col gap-2.5 flex-shrink-0"
                    style={{
                      width: '185px',
                      height: '240px',
                    }}
                  >
                    {/* Card Superiore: OPEN OPPORTUNITIES (Nuove Opportunità) */}
                    <div className="flex-1 min-h-0">
                      <KpiCard
                        label="OPEN OPPORTUNITIES"
                        value="10"
                        bg="#9c27b0"
                        labelColor="#00ff66"
                        valueColor="#00ff66"
                        sub="€ 52.7k potential"
                        subColor="#00e5ff"
                        width="100%"
                        height="100%"
                        minHeight="0"
                        labelSize="11px"
                        valueSize="28px"
                        subSize="11px"
                      />
                    </div>

                    {/* Card Inferiore: ACTIVE CLIENTS (Clienti Attivi) */}
                    <div className="flex-1 min-h-0">
                      <Link
                        to="/companies"
                        className="block hover:opacity-90 transition-opacity h-full flex flex-col"
                        title="Apri il Database Aziende"
                      >
                        <KpiCard
                          label="ACTIVE CLIENTS"
                          value="11"
                          bg="#00ffaa"
                          labelColor="#111111"
                          valueColor="#111111"
                          sub="11 clienti attivi"
                          subColor="rgba(0, 0, 0, 0.65)"
                          width="100%"
                          height="100%"
                          minHeight="0"
                          labelSize="11.5px"
                          valueSize="28px"
                          subSize="11px"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sezione Output Allargata (Risposta OpenAI & Impegni Calendar Week) — Spostata in alto raggiungendo l'altezza del Calendar Week! */}
              {(aiResult || aiLoading || (selectedCalendarDay && currentDaySchedule?.events?.length > 0)) && (
                <div
                  ref={popupContainerRef}
                  onMouseEnter={handlePopupMouseEnter}
                  onMouseLeave={handlePopupMouseLeave}
                  className="flex-1 min-w-0 flex flex-col p-4 rounded-2xl transition-all animate-fadeIn shadow-2xl relative self-start overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(0, 42, 26, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1.5px solid rgba(0, 255, 170, 0.45)',
                    boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                    height: '352px',
                    maxHeight: '352px',
                    fontFamily: '"Jost", "Inter", sans-serif',
                    overscrollBehavior: 'contain',
                  }}
                >
                  {/* Header Sezione Output: solo testo "Attività Programmate", senza cerchi, senza icone e senza "✕ chiudi" per massima ottimizzazione */}
                  <div className="flex items-center pb-2 mb-1.5 border-b border-white/15 flex-shrink-0">
                    {selectedCalendarDay && activeOutputTab !== 'ai' ? (
                      <span
                        className="text-white font-black tracking-wider uppercase text-[15px] sm:text-[16px]"
                        style={{ fontFamily: '"Goldman", sans-serif', letterSpacing: '0.08em' }}
                      >
                        Attività Programmate
                      </span>
                    ) : aiResult && selectedCalendarDay ? (
                      <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-lg border border-white/10">
                        <button
                          onClick={() => setActiveOutputTab('day')}
                          className={`px-3 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                            activeOutputTab === 'day'
                              ? 'bg-[#00ffaa] text-[#111111] shadow'
                              : 'text-white/70 hover:text-white'
                          }`}
                        >
                          Attività Programmate
                        </button>
                        <button
                          onClick={() => setActiveOutputTab('ai')}
                          className={`px-3 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                            activeOutputTab === 'ai'
                              ? 'bg-[#00ffaa] text-[#111111] shadow'
                              : 'text-white/70 hover:text-white'
                          }`}
                        >
                          Risposta OpenAI
                        </button>
                      </div>
                    ) : (
                      <span className="text-white/95 font-bold tracking-wide text-[15px] truncate">
                        {aiLoading ? 'Analisi in corso...' : 'Indagine CRM & Punti in Comune (OpenAI)'}
                      </span>
                    )}
                  </div>

                {/* Corpo del Contenuto Sviluppato in Verticale (senza overflow all'esterno) con supporto scroll rotella fluido e barra visibile */}
                <div
                  ref={popupScrollRef}
                  className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-2 mt-1 space-y-2.5 leading-relaxed custom-popup-scrollbar overscroll-contain select-text"
                  style={{
                    overscrollBehavior: 'contain',
                  }}
                >
                  {selectedCalendarDay && activeOutputTab !== 'ai' && currentDaySchedule ? (
                    <div className="flex flex-col gap-2.5 w-full">
                      {/* Elenco Attività Programmate: disposto in verticale, a piena larghezza */}
                      <div className="flex flex-col gap-2.5 w-full">
                        {currentDaySchedule.events.map((ev, idx) => (
                          <div
                            key={idx}
                            className="bg-black/55 border border-white/15 rounded-xl p-3 flex flex-col gap-2 hover:border-[#00ffaa]/50 transition-colors shadow-sm text-left overflow-hidden w-full"
                          >
                            {/* 1. Riga Superiore: Orario & Cliente */}
                            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10">
                              <span className="text-[11.5px] font-mono font-black px-2 py-0.5 rounded bg-[#00ffaa]/20 text-[#00ffaa] border border-[#00ffaa]/40 whitespace-nowrap shadow-sm">
                                ⏰ {ev.time}
                              </span>
                              <span className="text-white font-bold text-[14px] truncate flex-1 text-right tracking-tight">
                                {ev.company}
                              </span>
                              {ev.category && (
                                <span className="text-[9.5px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-white/80 border border-white/15 whitespace-nowrap">
                                  {ev.category}
                                </span>
                              )}
                            </div>

                            {/* 2. Dettagli Chiave: Luogo & Materiali distribuiti verticalmente */}
                            <div className="space-y-1.5 text-[12px] leading-snug">
                              {ev.location && (
                                <div className="flex items-start gap-1.5 text-slate-100">
                                  <span className="text-sky-300 font-bold font-mono text-[10.5px] uppercase tracking-wide flex-shrink-0">
                                    📍 Luogo:
                                  </span>
                                  <span className="font-medium text-slate-100 break-words flex-1">
                                    {ev.location}
                                  </span>
                                </div>
                              )}
                              {ev.materials && (
                                <div className="flex items-start gap-1.5 text-slate-100">
                                  <span className="text-amber-300 font-bold font-mono text-[10.5px] uppercase tracking-wide flex-shrink-0">
                                    🎒 Materiali:
                                  </span>
                                  <span className="font-medium text-amber-100 break-words flex-1">
                                    {ev.materials}
                                  </span>
                                </div>
                              )}
                              {ev.title && (
                                <p className="text-slate-300 text-[11.5px] italic border-t border-white/10 pt-1 mt-0.5 break-words">
                                  {ev.title}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Note & Allegati disposti in verticale / orizzontale compatto */}
                      {(currentDaySchedule.notes || (currentDaySchedule.files && currentDaySchedule.files.length > 0)) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-white/10 w-full">
                          {currentDaySchedule.notes && (
                            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-2.5 flex items-start gap-2 overflow-hidden">
                              <span className="text-emerald-400 text-xs flex-shrink-0">📝</span>
                              <div className="flex-1 text-[12px] text-white/95 leading-tight break-words">
                                <span className="font-bold text-[#00ffaa] uppercase text-[10px] font-mono block mb-0.5">Note:</span>
                                {currentDaySchedule.notes}
                              </div>
                            </div>
                          )}
                          {currentDaySchedule.files && currentDaySchedule.files.length > 0 && (
                            <div className="bg-black/30 border border-white/10 rounded-lg p-2.5 flex flex-col justify-center overflow-hidden">
                              <span className="font-bold text-[#00ffaa] uppercase text-[10px] font-mono block mb-1">File ({currentDaySchedule.files.length}):</span>
                              <div className="flex flex-wrap gap-1.5">
                                {currentDaySchedule.files.map((file, fIdx) => (
                                  <div
                                    key={fIdx}
                                    className="bg-black/40 border border-white/15 px-2 py-0.5 rounded flex items-center gap-1.5 text-[11px] text-white/90 max-w-full"
                                  >
                                    <Paperclip size={11} className="text-[#00ffaa] flex-shrink-0" />
                                    <span className="font-mono font-medium truncate max-w-[140px]">{file.name}</span>
                                    <span className="text-white/40 text-[9px] flex-shrink-0">({file.size})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Contenuto AI OpenAI distribuito in orizzontale */
                    <div
                      style={{
                        fontSize: '13.5px',
                        color: '#f4f2ea',
                        fontWeight: 400,
                      }}
                    >
                      {aiLoading ? (
                        <div className="h-36 flex flex-col items-center justify-center text-white/75 gap-2">
                          <div className="w-6 h-6 border-2 border-[#00ffaa] border-t-transparent rounded-full animate-spin" />
                          <span className="text-[13px] font-mono animate-pulse">
                            Interrogazione database in tempo reale con OpenAI...
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {aiResult?.question && (
                            <div className="p-2 bg-black/45 rounded-lg border border-white/12 text-xs font-mono text-emerald-300 flex items-center gap-2">
                              <span className="text-white/50 text-[10px] uppercase tracking-wider">Domanda:</span>
                              <span className="text-white font-bold">"{aiResult.question}"</span>
                            </div>
                          )}
                          <div className="leading-relaxed whitespace-pre-line text-[13px] text-[#f4f2ea] bg-black/25 p-3 rounded-lg border border-white/5 max-h-[140px] overflow-y-auto">
                            {aiResult?.content}
                          </div>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => triggerEnterFocus()}
                              className="text-[11px] font-mono text-[#00ffaa] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>⛶ Espandi Schermata Intera [ESC]</span>
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
          )}

        </div>

        {/* ══ COLONNA DESTRA (w-64: ClockDriveBox e Box Preventivi a tutta larghezza 256px) ══ */}
        <div className="self-stretch flex-shrink-0 flex flex-col gap-3 min-w-0 items-end w-64 relative">

          {/* 1. Box ASK OPEN AI (Sfondo bianco, collegato alla sezione output) */}
          <div className="w-full">
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

          {/* 2. Box Preventivi (Esteso verso l'alto con minimo distacco da ASK OpenAI, base Verde Menta #00ffaa, tutti cliccabili) */}
          <div
            className="w-full flex flex-col shadow-sm overflow-hidden"
            style={{
              backgroundColor: '#00ffaa',
              borderRadius: '6px',
            }}
          >
            {/* 1. preventivi in scadenza: Cliccabile */}
            <Link
              to="/opportunities?status=scadenza"
              className="px-3.5 py-3 min-h-[50px] flex items-center gap-2.5 hover:opacity-90 transition-opacity block group"
              style={{ backgroundColor: '#ff6f43' }}
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

            {/* 2. preventivi inviati: Cliccabile — riempimento azzurro #00e5ff come nel testo today */}
            <Link
              to="/opportunities?status=inviati"
              className="px-3.5 py-3 min-h-[50px] flex items-center gap-2.5 hover:opacity-90 transition-opacity block group"
              style={{ backgroundColor: '#00e5ff' }}
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

            {/* 3. ultimo preventivo: Cliccabile */}
            <Link
              to="/opportunities?sort=latest"
              className="px-3.5 py-3 min-h-[50px] flex items-center gap-2.5 hover:opacity-90 transition-opacity block group"
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

          {/* 4. Box NOTE SVILUPPATORE */}
          <div className="w-full">
            <DeveloperNotesBox />
          </div>

          {/* 5. Box Orologio + Google Drive (spostato sotto Note Sviluppatore) */}
          <div className="w-full">
            <ClockDriveBox />
          </div>

          {/* 6. Logo DADO Creative Studio collegato a dadocreative.studio con dicitura ® 2026 a filo destro */}
          <a
            href="https://dadocreative.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto w-[130px] flex flex-col items-end gap-1 group block cursor-pointer transition-all hover:opacity-95"
            style={{
              marginBottom: '0.6cm', // almeno 0,5cm sopra la banda bianca
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
              className="w-full text-right text-[11px] font-mono text-white/90 group-hover:text-white font-bold select-none pr-0"
              style={{ letterSpacing: '0.1em' }}
            >
              ® 2026
            </span>
          </a>

        </div>

      </div>

      {/* ── Banda Bianca Inferiore: spessore diminuito di 0,5cm, speculare a quella superiore ── */}
      <div className="w-full flex justify-end flex-shrink-0 mt-auto">
        <div className="bg-white rounded-tl-2xl w-[calc(100%-2.5rem)]" style={{ height: 'calc(3rem - 0.5cm)' }} />
      </div>

      </div>
    </div>
  )
}


