import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Database, Sparkles, X, ArrowRight, ArrowUpRight, Calendar as CalendarIcon, Clock, FileText, FileEdit, Paperclip, LogOut, UserPlus, Receipt, CheckCircle2, RotateCcw, Building2, Mail, ExternalLink, ShieldCheck, ChevronRight, ChevronLeft, Maximize2, Minimize2, Copy, Check, Key, Settings, Send, Eye, EyeOff, Phone, MessageCircle } from 'lucide-react'
import UserSwitchMenu from '../components/UserSwitchMenu'
import DeveloperNotesSearchBar from '../components/DeveloperNotesSearchBar.pc'
import ConcentricRingsKpi from '../components/ConcentricRingsKpi.pc'
import CollaboratorsModal from '../components/CollaboratorsModal'
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

// ── Box Collegamento Google Drive con Orologio Stile Quarz (Cifre espanse negli spazi laterali non sovrapposte al logo) ─────
function ClockDriveBox({
  width = '100%',
  height = '72px',
  minHeight,
  isSquare = false,
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

  const renderDigit = (d) => {
    return (
      <span
        className="inline-flex items-center justify-center text-center w-[22px]"
        style={{
          fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {d}
      </span>
    )
  }

  if (isSquare) {
    return (
      <div
        className={`border border-[#cce5f6] hover:border-[#0284c7] rounded-2xl px-3 py-2 text-center cursor-pointer transition-all relative overflow-hidden group select-none shadow-xs hover:shadow-md hover:scale-[1.02] flex items-center justify-between bg-white ${className}`}
        style={{
          backgroundColor: '#ffffff',
          width: width || '5cm',
          height: height || '5cm',
          minWidth: width || '5cm',
          minHeight: height || '5cm',
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(27, 183, 237, 0.08)',
        }}
        onClick={() => window.open('https://drive.google.com', '_blank')}
        title={`Google Drive • Ore: ${hhmm}`}
      >
        {/* Cifre stile Quarz a sinistra del logo (ORE) */}
        <div
          className="relative z-10 flex items-center leading-none select-none text-slate-900"
          style={{
            fontSize: '30px',
            fontWeight: 800,
            letterSpacing: '0.03em',
            color: '#0f172a',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          {renderDigit(d1)}
          {renderDigit(d2)}
        </div>

        {/* Logo Google Drive al centro tra ore e minuti */}
        <div className="relative z-10 flex items-center justify-center flex-shrink-0 px-1 pointer-events-none">
          <img
            src="/google-drive-logo.jpg"
            alt="Google Drive Logo"
            className="w-[44px] h-[44px] object-contain opacity-75 group-hover:opacity-95 transition-opacity"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>

        {/* Cifre stile Quarz a destra del logo (MINUTI) */}
        <div
          className="relative z-10 flex items-center leading-none select-none text-slate-900"
          style={{
            fontSize: '30px',
            fontWeight: 800,
            letterSpacing: '0.03em',
            color: '#0f172a',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          {renderDigit(d3)}
          {renderDigit(d4)}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`border border-[#cce5f6] hover:border-[#0284c7] rounded-2xl py-1 px-4 text-center cursor-pointer transition-all relative overflow-hidden group select-none shadow-xs hover:shadow-md hover:scale-[1.01] flex items-center justify-between bg-white ${className}`}
      style={{
        backgroundColor: '#ffffff',
        width,
        height,
        minHeight: minHeight !== undefined ? minHeight : height,
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(27, 183, 237, 0.06)',
      }}
      onClick={() => window.open('https://drive.google.com', '_blank')}
      title="Clicca per aprire Google Drive"
    >
      {/* Sfondo al centro: Logo Google Drive, pulito e non coperto dalle cifre laterali */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <img
          src="/google-drive-logo.jpg"
          alt="Google Drive Logo"
          className="w-[46px] h-[46px] object-contain opacity-55 group-hover:opacity-75 transition-opacity"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Cifre stile Quarz ad alta leggibilità ed espanse negli spazi laterali (ORE a sinistra) */}
      <div
        className="relative z-10 flex items-center leading-none select-none text-slate-900"
        style={{
          fontSize: '36px',
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: '#0f172a',
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {renderDigit(d1)}
        {renderDigit(d2)}
      </div>

      {/* Cifre stile Quarz ad alta leggibilità ed espanse negli spazi laterali (MINUTI a destra) */}
      <div
        className="relative z-10 flex items-center leading-none select-none text-slate-900"
        style={{
          fontSize: '36px',
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: '#0f172a',
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {renderDigit(d3)}
        {renderDigit(d4)}
      </div>
    </div>
  )
}

// ── Box ASK OPEN AI (Attaccato alla banda bianca, con contenuto scalato al di sotto della banda) ──
function AskOpenAiBox({ onAskComplete, onLoadingChange, onStartAsk, onOpenAiConfig, aiConfig, isMaximized = false }) {
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
      className="bg-white rounded-none py-2 px-3 flex flex-col justify-between shadow-xs border border-[#cce5f6] border-t-0 min-h-0 relative z-20"
      style={{
        fontFamily: '"Switzer", sans-serif',
        height: isMaximized ? '205px' : 'calc(76px + 3cm)',
        minHeight: isMaximized ? '205px' : 'calc(76px + 3cm)',
        borderRadius: '0px',
        borderTop: 'none',
        boxShadow: '0 2px 8px rgba(27, 183, 237, 0.06)',
        transition: 'height 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <h3
              className="uppercase tracking-normal leading-tight select-none"
              style={{
                fontWeight: 900,
                fontSize: '0.98rem',
                fontFamily: '"Switzer", sans-serif',
                background: 'linear-gradient(90deg, #0284c7 0%, #0ea5e9 25%, #10b981 55%, #f59e0b 80%, #ef4444 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              ASK OPEN AI:
            </h3>
            {aiConfig?.hasKey && (
              <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-none bg-emerald-50 text-emerald-700 border border-emerald-300">
                {aiConfig.geminiModel || aiConfig.model || 'Gemini 2.5'}
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

        {loading && (
          <div className="py-1 flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-[11px] font-bold text-gray-600 animate-pulse truncate">
              Analisi dati CRM in corso...
            </span>
          </div>
        )}

        {error && (
          <div className="text-[10px] text-red-600 bg-red-50 p-1 mt-0.5">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Area di testo per digitare (estesa verso il basso senza scorciatoie) */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleAsk()
        }}
        className={`mt-1 pt-1.5 border-t border-sky-100 flex flex-1 min-h-0 ${isMaximized ? 'flex-col gap-2' : 'items-stretch gap-2'}`}
      >
        <div className="relative flex-1 min-h-0 flex flex-col">
          <textarea
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAsk()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                e.stopPropagation()
                setQuery('')
                setAnswer(null)
                setError(null)
                window.dispatchEvent(new CustomEvent('dado-ai-reset'))
                window.dispatchEvent(new CustomEvent('dado-ai-focus', { detail: { active: false } }))
              }
            }}
            placeholder={isMaximized ? "Scrivi una domanda o richiesta dettagliata (es. controlli incrociati, contratti, fatture o pipeline)... Premi Invio per inviare" : "Controlli incrociati, contratti..."}
            disabled={loading}
            className="w-full flex-1 border px-2.5 py-1.5 text-[11.5px] rounded-lg placeholder:text-slate-400 focus:outline-none transition-all resize-none leading-relaxed bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0284c7] focus:bg-white shadow-inner overflow-hidden"
            style={{
              fontFamily: '"Switzer", sans-serif',
              height: isMaximized ? '112px' : '100%',
              minHeight: isMaximized ? '112px' : '100%',
              overflow: 'hidden',
              overflowY: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          />
        </div>
        <div className={`flex items-center justify-end ${isMaximized ? 'w-full' : 'flex-shrink-0 self-end'}`}>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            title="Invia domanda"
            className={`${isMaximized ? 'px-4 py-1.5 text-[11.5px]' : 'px-2.5 py-1.5 text-xs'} bg-[#0284c7] hover:bg-[#0369a1] text-white disabled:opacity-40 font-bold rounded-lg cursor-pointer disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1.5 ml-auto`}
          >
            {loading ? '...' : (isMaximized ? <><span>Chiedi a AI</span> <ArrowRight size={12} /></> : '→')}
          </button>
        </div>
      </form>
    </div>
  )
}



// ── Hook per rilevare se la finestra del browser o lo schermo è ingrandito al massimo ──
function useIsWindowMaximized() {
  const checkMax = () => {
    if (typeof window === 'undefined') return false
    // 1. Fullscreen API nativo attivo (HTML5 Fullscreen)
    if (document.fullscreenElement) return true

    // 2. CSS display-mode: fullscreen
    if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) return true

    // 3. Modalità a tutto schermo su macOS / browser (quando la finestra occupa tutta l'altezza dello schermo del display)
    if (window.screen && window.screen.height) {
      const isFullScreenHeight = window.innerHeight >= (window.screen.height - 45)
      const isFullOuterHeight = window.outerHeight >= (window.screen.height - 15)
      return Boolean(isFullScreenHeight || isFullOuterHeight)
    }

    return false
  }

  const [isMaximized, setIsMaximized] = useState(checkMax)

  useEffect(() => {
    const handleResize = () => setIsMaximized(checkMax())
    window.addEventListener('resize', handleResize)
    document.addEventListener('fullscreenchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('fullscreenchange', handleResize)
    }
  }, [])

  return isMaximized
}

// ── Box NOTE: Taccuino con spirale metallica superiore (solo parte superiore a mo' di taccuino) ──
function TurnedPageNoteBox({ className = '', height = 'calc(98px - 0.3cm)', isMaximized = false }) {
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
        body: JSON.stringify({
          note: text,
          isDeveloperNote: false,
          author: currentUser?.name || 'Utente CRM',
        }),
      })
      window.dispatchEvent(new CustomEvent('dado-note-added'))
    } catch (err) {
      console.warn('Salvataggio nota:', err)
    }
  }

  return (
    <div className={`w-full relative select-none group ${className}`}>
      {/* ── CORPO PRINCIPALE DEL TACCUINO (solo bordo superiore a spirale, esteso in larghezza sopra Funnel & KPI) ── */}
      <div
        className="w-full bg-[#fdfdfc] shadow-xs hover:shadow-md transition-all border border-[#cbd5e1] rounded-b-xl rounded-t-lg relative overflow-hidden flex flex-col justify-between"
        style={{
          minHeight: height,
          height: height,
          fontFamily: '"Switzer", sans-serif',
          zIndex: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* ── BORDO SUPERIORE: FASCIA RILEGATA TACCUINO CON SPIRALE METALLICA ── */}
        <div
          className="w-full pt-2 pb-0.5 px-3 relative flex items-center justify-between"
          style={{
            background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
            borderBottom: '1.5px dashed #64748b',
          }}
        >
          {/* Anelli a spirale metallica lungo il bordo superiore del taccuino (7 anelli per larghezza calibrata) */}
          <div className="absolute -top-2 left-0 right-0 flex justify-evenly px-3 pointer-events-none">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                {/* Anello metallico 3D con sfumatura lucida */}
                <div
                  className="w-2 h-3.5 rounded-full border border-slate-500/80 shadow-xs"
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 30%, #94a3b8 65%, #334155 100%)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                />
                {/* Foro circolare nel taccuino */}
                <div className="-mt-1 w-1.5 h-1 rounded-full bg-slate-900 shadow-inner" />
              </div>
            ))}
          </div>

          {/* Intestazione Note sulla fascia superiore (SENZA scritta Taccuino) */}
          <div className="flex items-center justify-between w-full mt-0.5">
            <Link
              to="/appunti"
              className="text-white hover:text-sky-300 font-extrabold text-[12px] tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Apri e consulta le Note & Appunti salvati"
            >
              <FileEdit className="w-3.5 h-3.5 text-sky-400" />
              <span>Note</span>
            </Link>
            {saved ? (
              <span className="text-[9.5px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                ✓ Salvata
              </span>
            ) : (
              <span className="text-[9.5px] text-slate-400 italic">
                Appunto veloce
              </span>
            )}
          </div>
        </div>

        {/* ── FOGLIO A RIGHE DEL TACCUINO CON CAMPO SCRITTURA E PULSANTE IN RIGA ── */}
        <div
          className="flex-1 px-3 py-1.5 flex items-center justify-between relative overflow-hidden"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #e2e8f0 23px, #e2e8f0 24px)',
            backgroundPosition: '0 4px',
          }}
        >
          {/* Campo inserimento nota / promemoria su più righe a righe del taccuino */}
          <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between gap-1.5 h-full py-0.5">
            <textarea
              rows={isMaximized ? 6 : 3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSave(e)
                }
              }}
              placeholder={saved ? "✓ Registrata negli appunti!" : "Scrivi un appunto o promemoria rapido..."}
              className="w-full flex-1 bg-transparent border-none outline-none text-[12.5px] font-medium text-slate-800 placeholder:text-slate-400 leading-[24px] resize-none"
              style={{ fontFamily: '"Switzer", sans-serif', lineHeight: '24px' }}
            />
            <div className="flex justify-end items-center">
              <button
                type="submit"
                className="px-3 py-1 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[10.5px] uppercase tracking-wide cursor-pointer transition-all shadow-xs flex-shrink-0"
                title="Salva nota negli appunti (oppure premi Invio)"
              >
                Salva ↵
              </button>
            </div>
          </form>
        </div>
      </div>
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
    materials: ["Canon C70", "Canon RF 24-70mm f/2.8L", "Sennheiser AVX", "Gimbal RS3 Pro"]
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
    materials: ["Canon C70", "Nanlite Pavotube II 30X", "Atomos Ninja V+"]
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
    materials: ["Drone DJI Mavic 3 Cine", "Canon RF 70-200mm f/2.8L"]
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
    materials: ["Canon C70", "Canon RF 24-70mm f/2.8L", "Aputure 300x"]
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
    materials: ["Atomos Ninja V+", "Canon RF 85mm f/1.2L"]
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
    materials: ["Canon RF 70-200mm f/2.8L", "Softbox Octa 120cm"]
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
      { step: "4. Set & Riprese", date: "15-16/09/2026", desc: "2 giorni di riprese con Canon C70 e illuminazione cinema Aputure." },
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
      { step: "4. Shooting & Drone", date: "04-05/09/2026", desc: "Riprese parco solare con DJI Mavic 3 Cine e Canon C70." },
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
      channel: "LinkedIn InMail a AleAmministratore",
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
      snippet: "Caro AleAmministratore, le foto delle bottiglie con luce radente calda sono spettacolari. I nostri importatori di New York sono rimasti entusiasti della resa visiva."
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
      snippet: "Ciao AleAmministratore, la clip dinamica dell'e-bike all'alba a CityLife sta performando benissimo sulle ads Meta. Ottima illuminazione naturale e stabilità della camera."
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

// ── Post-it Contatti: Come e Perché si sono sentiti (Data, Giorno e Motivo Ultimo Contatto) ──
const RECENT_CONTACT_POSTITS = [
  {
    referent: 'Matteo Colombo',
    company: 'Fashion Brand Milano',
    category: 'Call Conoscitiva',
    dayDate: 'Lunedì 12 Ottobre',
    how: 'Call Conoscitiva — WhatsApp & Google Meet',
    why: 'Call conoscitiva e briefing per preventivo video vertical reels 9:16 e calendario date shooting lookbook.',
  },
  {
    referent: 'Sara Moretti',
    company: 'NextMedia Agency',
    category: 'Chiamata',
    dayDate: 'Venerdì 9 Ottobre',
    how: 'Chiamata — Telefono Ufficio + Email',
    why: 'Chiamata di conferma ricezione master video 4K e allineamento per nuova campagna ADV autunno.',
  },
  {
    referent: 'Ing. Marco Riva',
    company: 'Officine Meccaniche Riva',
    category: 'Appuntamento',
    dayDate: 'Giovedì 8 Ottobre',
    how: 'Appuntamento — Incontro in Sede & Telefono Diretto',
    why: 'Appuntamento in azienda: delibera budget approvata per shooting corporate industriale fiera MecSpe 2026.',
  },
  {
    referent: 'Dott.ssa Chiara Valenti',
    company: 'Solaris Green Energy',
    category: 'Briefing',
    dayDate: 'Mercoledì 7 Ottobre',
    how: 'Briefing — Videochiamata Google Meet',
    why: 'Briefing operativo: revisione storyboard spot TV e piano autorizzazioni sorvolo drone parco agrivoltaico.',
  },
  {
    referent: 'Matteo Ferri',
    company: 'Alpha Studio Milano',
    category: 'Briefing',
    dayDate: 'Martedì 6 Ottobre',
    how: 'Briefing — Call & Chat WhatsApp Diretta',
    why: 'Briefing tecnico per allestimento limbo studio DADO e test lenti anamorfiche per shooting moda luxury.',
  },
  {
    referent: 'Alessandro Neri',
    company: 'Beta Digital Agency',
    category: 'Chiamata',
    dayDate: 'Lunedì 5 Ottobre',
    how: 'Chiamata — Call telefonica di allineamento',
    why: 'Chiamata di allineamento: pianificazione spot social verticali e montaggio formato 9:16 per app fintech.',
  },
  {
    referent: 'Geom. Paolo Baraldi',
    company: 'Kroma Ceramiche',
    category: 'Appuntamento',
    dayDate: 'Venerdì 2 Ottobre',
    how: 'Appuntamento — Incontro di persona in azienda',
    why: 'Appuntamento e sopralluogo showroom con campionatura lastre per catalogo fotografico 2027.',
  },
  {
    referent: 'Ginevra Moretti',
    company: 'Vogue Events & Wedding',
    category: 'Briefing',
    dayDate: 'Giovedì 1 Ottobre',
    how: 'Briefing — Videochiamata Zoom',
    why: 'Briefing regia e trailer cinematografico per evento luxury wedding a Villa Cora (Firenze).',
  },
  {
    referent: 'Chef Salvatore Esposito',
    company: 'Gusto & Tradizione Food',
    category: 'Chiamata',
    dayDate: 'Mercoledì 30 Settembre',
    how: 'Chiamata — Call & Vocale WhatsApp',
    why: 'Chiamata per revisione teaser slow-motion pizza gourmet e programmazione reel Instagram.',
  },
  {
    referent: 'Dott. Andrea Pieri',
    company: 'Tenuta Poggio Antico',
    category: 'Appuntamento',
    dayDate: 'Martedì 29 Settembre',
    how: 'Appuntamento — Pianificazione Set in Tenuta',
    why: 'Appuntamento fissato per giornate riprese vendemmia e shooting bottiglie riserva con luce d\'ambiente.',
  },
  {
    referent: 'Ing. Luca Castelli',
    company: 'Nexura Tech Solutions',
    category: 'Call Conoscitiva',
    dayDate: 'Lunedì 28 Settembre',
    how: 'Call Conoscitiva — Google Meet',
    why: 'Call conoscitiva e allineamento per consegna pitch video animato 3D per investitori Venture Capital di Londra.',
  },
  {
    referent: 'Stefania Conti',
    company: 'Atelier Sposa Bellissima',
    category: 'Appuntamento',
    dayDate: 'Venerdì 25 Settembre',
    how: 'Appuntamento — Incontro in Atelier & Campionario',
    why: 'Appuntamento in atelier per selezione abiti haute couture lookbook primaverile e riprese video backstage.',
  },
  {
    referent: 'Jacopo Bonomi',
    company: 'Urban Mobility Bike',
    category: 'Briefing',
    dayDate: 'Mercoledì 23 Settembre',
    how: 'Briefing — Call telefonica + WhatsApp',
    why: 'Briefing logistico: pianificazione percorso ciclistico urbano e permessi comunali per spot e-bike gravel.',
  },
  {
    referent: 'Arch. Elena Baroni',
    company: 'Aura Design & Architettura',
    category: 'Call Conoscitiva',
    dayDate: 'Lunedì 21 Settembre',
    how: 'Call Conoscitiva — Telefono + Email PDF',
    why: 'Call conoscitiva e invio preventivo per servizio fotografico d\'architettura e video walkthrough appartamenti.',
  },
  {
    referent: 'Dott. Stefano Valenti',
    company: 'Cantine San Biagio Wine & Resort',
    category: 'Chiamata',
    dayDate: 'Sabato 19 Settembre',
    how: 'Chiamata — Telefono Ufficio Diretto',
    why: 'Chiamata di follow-up: feedback positivo su riprese evento di gala e richiesta archivio foto in alta risoluzione.',
  },
]

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
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false)
  const [collaboratorsCount, setCollaboratorsCount] = useState(15)
  const [contactPostItIdx, setContactPostItIdx] = useState(0)
  const [contactPostIts, setContactPostIts] = useState(RECENT_CONTACT_POSTITS)
  const currentContactPostIt = contactPostIts[contactPostItIdx] || contactPostIts[0]
  const [selectedClientIndex, setSelectedClientIndex] = useState(0)
  const [clientSearchQuery, setClientSearchQuery] = useState('')
  const [showInvoiceMenuModal, setShowInvoiceMenuModal] = useState(false)
  const [isFunnelDetailsOpen, setIsFunnelDetailsOpen] = useState(false)
  const [invoiceTab, setInvoiceTab] = useState('recent')
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('')
  const [crmCompanies, setCrmCompanies] = useState([])
  const [showInvoiceCompanyDropdown, setShowInvoiceCompanyDropdown] = useState(false)
  const [highlightedCompanyIdx, setHighlightedCompanyIdx] = useState(0)
  const [matchedInvoiceCompany, setMatchedInvoiceCompany] = useState(null)
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    companyId: '',
    companyName: '',
    amount: '',
    deposit: '',
    dueDate: '',
    paymentMethod: 'Bonifico Bancario 30gg d.f.',
    description: '',
    sdi: '0000000',
    pec: '',
    contractCode: '',
    shootingDates: '',
    location: '',
    materials: [],
  })

  // Directory completa aziende presenti nel database CRM con dati di fatturazione preconfigurati
  const invoiceCompanyDirectory = useMemo(() => {
    const presetDirectory = [
      {
        companyId: 'cmp-1',
        companyName: 'Officine Meccaniche Riva',
        sector: 'Automotive / Meccanica',
        city: 'Brescia (BS)',
        referent: 'Ing. Marco Riva',
        amount: 9200,
        deposit: 4000,
        dueDate: '25/10/2026',
        paymentMethod: 'Bonifico Bancario 30gg d.f.',
        sdi: 'M5UXCR1',
        pec: 'officineriva@pec.it',
        description: 'Video Corporate Industriale 4K HDR ProRes + Cut 60s LinkedIn per Fiera MecSpe',
        contractCode: 'DADO-CTR-2026-088',
        shootingDates: '10–12 Ottobre 2026 (3 giornate set + drone FPV)',
        location: 'Stabilimento Principale Riva — Brescia (BS)',
      },
      {
        companyId: 'cmp-2',
        companyName: 'Fashion Brand Milano',
        sector: 'Moda & Luxury',
        city: 'Milano (MI)',
        referent: 'Matteo Colombo',
        amount: 6800,
        deposit: 3400,
        dueDate: '20/11/2026',
        paymentMethod: 'Bonifico Bancario 30gg d.f.',
        sdi: 'FBM89K2',
        pec: 'fashionbrandmilano@pec.it',
        description: 'Produzione Lookbook Video Autunno/Inverno 4K HDR, Reel & TikTok Kit e Color Grading per Capsule Collection',
        contractCode: 'DADO-INB-0431',
        shootingDates: '23–25 Ottobre 2026 (Showroom + Studio Limbo)',
        location: 'Via Tortona 31 — Milano (MI)',
      },
      {
        companyId: 'cmp-3',
        companyName: 'NextMedia Agency',
        sector: 'Digital & Media Agency',
        city: 'Milano (MI)',
        referent: 'Sara Moretti',
        amount: 5000,
        deposit: 2500,
        dueDate: '25/11/2026',
        paymentMethod: 'Bonifico Bancario 30gg d.f.',
        sdi: 'NXM44P1',
        pec: 'nextmedia@pec.it',
        description: 'Shooting Video Corporate Stabilimento con Drone 4K Indoor e Interviste Executive',
        contractCode: 'DADO-INB-0763',
        shootingDates: '26–27 Ottobre 2026 (2 giornate set + drone)',
        location: 'Headquarter NextMedia — Milano Porta Nuova',
      },
      {
        companyId: 'cmp-4',
        companyName: 'Solaris Green Energy',
        sector: 'Energie Rinnovabili',
        city: 'Verona (VR)',
        referent: 'Ing. Davide Sartori',
        amount: 8400,
        deposit: 8400,
        dueDate: '05/10/2026',
        paymentMethod: 'Bonifico Anticipato 100%',
        sdi: 'KRR76B9',
        pec: 'solarisenergy@pec.it',
        description: 'Spot TV Broadcast Nazionale 30s + Campagna Digital ADS Green Transition',
        contractCode: 'DADO-CTR-2026-085',
        shootingDates: '18–20 Settembre 2026 (Parco Solare + Teatro Pose)',
        location: 'Parco Fotovoltaico Solaris — Verona (VR)',
      },
      {
        companyId: 'cmp-5',
        companyName: 'Alpha Studio Milano',
        sector: 'Moda & Design',
        city: 'Milano (MI)',
        referent: 'Dott.ssa Elena Conti',
        amount: 7500,
        deposit: 7500,
        dueDate: '28/09/2026',
        paymentMethod: 'Bonifico Vista Fattura',
        sdi: 'SUBM70N',
        pec: 'alphastudio@pec.it',
        description: 'Campagna Moda Autunno/Inverno 2026 Still Life & Lookbook E-commerce',
        contractCode: 'DADO-CTR-2026-082',
        shootingDates: '14–15 Settembre 2026 (2 giornate Studio Limbo)',
        location: 'DADO Studio — Sala Pose A (Milano)',
      },
      {
        companyId: 'cmp-6',
        companyName: 'Kroma Ceramiche',
        sector: 'Arredo & Design Superfici',
        city: 'Sassuolo (MO)',
        referent: 'Arch. Paolo Ferri',
        amount: 6100,
        deposit: 3200,
        dueDate: '15/11/2026',
        paymentMethod: 'RIBA 60gg d.f.',
        sdi: 'W7M2U86',
        pec: 'kromaceramiche@pec.it',
        description: 'Catalogo Arredo Bagno 2027: Rendering 3D, Set Virtuali & Still Life Ceramiche',
        contractCode: 'DADO-CTR-2026-084',
        shootingDates: '02–05 Ottobre 2026 (Showroom + CGI Studio)',
        location: 'Showroom Kroma — Sassuolo (MO)',
      },
      {
        companyId: 'cmp-7',
        companyName: 'Vogue Events & Wedding',
        sector: 'Luxury Events',
        city: 'Firenze (FI)',
        referent: 'Dott.ssa Chiara Rinaldi',
        amount: 5800,
        deposit: 5800,
        dueDate: '10/09/2026',
        paymentMethod: 'Bonifico 50% acconto / 50% alla consegna',
        sdi: 'VGE91L4',
        pec: 'vogueevents@pec.it',
        description: 'Docufilm Wedding Luxury Internazionale & Regia Multicam Villa Cora Firenze',
        contractCode: 'DADO-CTR-2026-079',
        shootingDates: '29–30 Agosto 2026 (Evento 2 giorni + Drone)',
        location: 'Villa Cora — Firenze (FI)',
      },
      {
        companyId: 'cmp-8',
        companyName: 'Beta Digital Agency',
        sector: 'Marketing & Social',
        city: 'Torino (TO)',
        referent: 'Luca Bernardi',
        amount: 4800,
        deposit: 2000,
        dueDate: '20/10/2026',
        paymentMethod: 'Bonifico Bancario 30gg d.f.',
        sdi: 'P62R9S1',
        pec: 'betadigital@pec.it',
        description: 'Pacchetto 12 Video TikTok/Reels Verticali 9:16 + Color Grading DaVinci',
        contractCode: 'DADO-CTR-2026-087',
        shootingDates: '08–09 Ottobre 2026 (2 giornate Studio Green Screen)',
        location: 'DADO Studio — Sala Pose B (Milano)',
      },
      {
        companyId: 'cmp-9',
        companyName: 'Tenuta Poggio Antico',
        sector: 'Wine & Hospitality',
        city: 'Montalcino (SI)',
        referent: 'Dott. Lorenzo Neri',
        amount: 4200,
        deposit: 4200,
        dueDate: '12/08/2026',
        paymentMethod: 'Bonifico Bancario',
        sdi: 'USAL8PV',
        pec: 'poggioantico@pec.it',
        description: 'Docufilm Vendemmia 2026 Brunello di Montalcino & Shooting Bottiglie Luxury',
        contractCode: 'DADO-CTR-2026-074',
        shootingDates: '01–02 Agosto 2026 (Esterni Vigneti + Cantina Storica)',
        location: 'Tenuta Poggio Antico — Montalcino (SI)',
      },
      {
        companyId: 'cmp-10',
        companyName: 'Gusto & Tradizione Food',
        sector: 'Food & Beverage',
        city: 'Parma (PR)',
        referent: 'Chef Andrea Galli',
        amount: 3900,
        deposit: 3900,
        dueDate: '25/07/2026',
        paymentMethod: 'Bonifico Vista Fattura',
        sdi: 'A4707H7',
        pec: 'gustoetradizione@pec.it',
        description: 'Serie 10 Video Ricette Chef Stellato con Dettagli Macro Food & Packaging',
        contractCode: 'DADO-CTR-2026-068',
        shootingDates: '10–11 Luglio 2026 (Set Cucina DADO)',
        location: 'Kitchen Set DADO — Parma (PR)',
      },
      {
        companyId: 'cmp-11',
        companyName: 'Nexura Tech Solutions',
        sector: 'SaaS & AI Tech',
        city: 'Milano (MI)',
        referent: 'Ing. Matteo Villa',
        amount: 3200,
        deposit: 3200,
        dueDate: '18/06/2026',
        paymentMethod: 'Bonifico Bancario 30gg d.f.',
        sdi: '24M0X8B',
        pec: 'nexuratech@pec.it',
        description: 'Teaser Lancio Nuova Piattaforma SaaS AI & Brand Video Identity',
        contractCode: 'DADO-CTR-2026-059',
        shootingDates: '04 Giugno 2026 (Uffici + Motion Graphics)',
        location: 'Nexura Hub — Milano Isola',
      },
      {
        companyId: 'cmp-12',
        companyName: 'Atelier Sposa Bellissima',
        sector: 'Bridal & Haute Couture',
        city: 'Como (CO)',
        referent: 'Valeria Fontana',
        amount: 2300,
        deposit: 2300,
        dueDate: '02/06/2026',
        paymentMethod: 'Bonifico Anticipato',
        sdi: 'BA6ET11',
        pec: 'sposabellissima@pec.it',
        description: 'Shooting Collezione Alta Moda Sposa 2026 per Catalogo Cartaceo & Instagram',
        contractCode: 'DADO-CTR-2026-053',
        shootingDates: '19 Maggio 2026 (Villa Olmo Como)',
        location: 'Villa Olmo — Como (CO)',
      },
      {
        companyId: 'cmp-13',
        companyName: 'Urban Mobility Bike',
        sector: 'E-Mobility & Sport',
        city: 'Bergamo (BG)',
        referent: 'Simone Cattaneo',
        amount: 1500,
        deposit: 1500,
        dueDate: '14/05/2026',
        paymentMethod: 'Bonifico Vista Fattura',
        sdi: 'K0ROAC2',
        pec: 'urbanmobility@pec.it',
        description: 'Video Clip Dinamica Outdoor Bici Elettrica Urbana & Reels Instagram',
        contractCode: 'DADO-CTR-2026-047',
        shootingDates: '02 Maggio 2026 (Esterni Città Alta + Gimbal Car)',
        location: 'Bergamo Città Alta (BG)',
      },
      {
        companyId: 'cmp-14',
        companyName: 'Aura Design & Architettura',
        sector: 'Architettura & Interior',
        city: 'Milano (MI)',
        referent: 'Arch. Federico Longo',
        amount: 4800,
        deposit: 2400,
        dueDate: '28/11/2026',
        paymentMethod: 'Bonifico Bancario 30gg d.f.',
        sdi: 'AUR55D8',
        pec: 'auradesign@pec.it',
        description: 'Servizio Fotografico Architettonico & Video Tour Progetti Interior Luxury',
        contractCode: 'DADO-OUT-0444',
        shootingDates: '04–05 Novembre 2026 (Attico Brera + Showroom)',
        location: 'Brera Design District — Milano (MI)',
      },
      {
        companyId: 'cmp-15',
        companyName: 'Cantine San Biagio Wine & Resort',
        sector: 'Wine & Luxury Resort',
        city: 'Verona (VR)',
        referent: 'Dott. Tommaso Marchetti',
        amount: 6200,
        deposit: 3100,
        dueDate: '30/11/2026',
        paymentMethod: 'Bonifico Bancario 30gg d.f.',
        sdi: 'J3PV6T1',
        pec: 'cantinesanbiagio@legalmail.it',
        description: 'Docufilm Ospitalità & Degustazione Vini + Riprese Aeree Drone Tenuta',
        contractCode: 'DADO-EVT-0455',
        shootingDates: '12–13 Novembre 2026 (Tenuta Valpolicella)',
        location: 'Cantine San Biagio — Valpolicella (VR)',
      },
      {
        companyId: 'cmp-16',
        companyName: 'Ceramiche Sarde Srl',
        sector: 'Manifattura & Design',
        city: 'Cagliari (CA)',
        referent: 'Dott. Gianluca Serra',
        amount: 4500,
        deposit: 2250,
        dueDate: '30/11/2026',
        paymentMethod: 'Bonifico Bancario 30gg d.f.',
        sdi: 'CRS90M2',
        pec: 'ceramichesarde@pec.it',
        description: 'Servizio Fotografico Catalogo Collezioni Artigianali & Video Spot Manifesto',
        contractCode: 'DADO-CTR-2026-091',
        shootingDates: '16–17 Novembre 2026 (Showroom & Laboratorio)',
        location: 'Cagliari (CA)',
      },
      {
        companyId: 'cmp-17',
        companyName: 'Bottega Verde Srl',
        sector: 'Cosmetica & Natural Care',
        city: 'Siena (SI)',
        referent: 'Dott.ssa Martina Bellini',
        amount: 5400,
        deposit: 2700,
        dueDate: '30/11/2026',
        paymentMethod: 'Bonifico Bancario 30gg d.f.',
        sdi: 'BTV12L9',
        pec: 'bottegaverde@pec.it',
        description: 'Campagna Video Digital Skincare & Still Life Prodotti Linea Bio',
        contractCode: 'DADO-CTR-2026-092',
        shootingDates: '19–20 Novembre 2026 (Tenuta & Studio Pose)',
        location: 'Palazzo Massaini — Pienza (SI)',
      },
      {
        companyId: 'cmp-18',
        companyName: 'Cantine Alto Adige',
        sector: 'Wine & Beverage',
        city: 'Bolzano (BZ)',
        referent: 'Dott. Lukas Hofer',
        amount: 4900,
        deposit: 2450,
        dueDate: '30/11/2026',
        paymentMethod: 'Bonifico Bancario 30gg d.f.',
        sdi: 'CAA77T4',
        pec: 'cantinealtoadige@pec.it',
        description: 'Produzione Video Vigneti Eroici & Still Life Bottiglie Riserva',
        contractCode: 'DADO-CTR-2026-093',
        shootingDates: '24–25 Novembre 2026 (Cantina & Vigneti)',
        location: 'Bolzano (BZ)',
      },
    ]

    const byName = new Map()
    presetDirectory.forEach(item => {
      byName.set(item.companyName.toLowerCase(), { ...item })
    })

    // Arricchisci con fatture esistenti
    invoices.forEach(inv => {
      if (!inv.companyName) return
      const key = inv.companyName.trim().toLowerCase()
      const existing = byName.get(key)
      if (existing) {
        byName.set(key, {
          ...existing,
          companyId: inv.companyId || existing.companyId,
          amount: inv.amount || existing.amount,
          deposit: typeof inv.deposit === 'number' ? inv.deposit : existing.deposit,
          dueDate: inv.dueDate || existing.dueDate,
          paymentMethod: inv.paymentMethod || existing.paymentMethod,
          sdi: inv.sdi && inv.sdi !== '0000000' ? inv.sdi : existing.sdi,
          pec: inv.pec || existing.pec,
          description: inv.description || existing.description,
          contractCode: inv.contractCode || existing.contractCode,
          shootingDates: inv.shootingDates || existing.shootingDates,
          location: inv.location || existing.location,
          materials: inv.materials || existing.materials,
        })
      } else {
        byName.set(key, {
          companyId: inv.companyId || `cmp-${Date.now()}`,
          companyName: inv.companyName.trim(),
          sector: 'Cliente DADO Studio',
          city: inv.location || 'Italia',
          referent: 'Amministrazione',
          amount: inv.amount || 3500,
          deposit: typeof inv.deposit === 'number' ? inv.deposit : Math.round((inv.amount || 3500) * 0.5),
          dueDate: inv.dueDate || '30/11/2026',
          paymentMethod: inv.paymentMethod || 'Bonifico Bancario 30gg d.f.',
          sdi: inv.sdi || '0000000',
          pec: inv.pec || `${inv.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}@pec.it`,
          description: inv.description || 'Servizi di produzione video / foto DADO Studio',
          contractCode: inv.contractCode || 'DADO-CTR-2026-090',
          shootingDates: inv.shootingDates || 'Da pianificare con il cliente',
          location: inv.location || 'Set DADO Studio / Sede Cliente',
          materials: inv.materials || [],
        })
      }
    })

    // Arricchisci con aziende caricate dal backend CRM (/api/crm/summary)
    crmCompanies.forEach(c => {
      if (!c.name) return
      const key = c.name.trim().toLowerCase()
      const existing = byName.get(key)
      const slug = c.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      const parsedVal = Number(c.contractValue || c.estimatedValue || 0)
      if (existing) {
        byName.set(key, {
          ...existing,
          companyId: c.id || existing.companyId,
          referent: c.referent || existing.referent,
          amount: parsedVal > 0 ? parsedVal : existing.amount,
          deposit: parsedVal > 0 && !existing.deposit ? Math.round(parsedVal * 0.5) : existing.deposit,
          description: existing.description || c.requestedMaterials || c.notes || 'Produzione Video & Foto DADO Studio',
          contractCode: c.contractCode || existing.contractCode,
        })
      } else {
        const amt = parsedVal > 0 ? parsedVal : 4000
        byName.set(key, {
          companyId: c.id || `cmp-${slug}`,
          companyName: c.name.trim(),
          sector: c.origin || 'Cliente CRM',
          city: 'Italia',
          referent: c.referent || 'Referente Aziendale',
          amount: amt,
          deposit: Math.round(amt * 0.5),
          dueDate: '30/11/2026',
          paymentMethod: 'Bonifico Bancario 30gg d.f.',
          sdi: slug.slice(0, 4).toUpperCase().padEnd(4, 'X') + '26A',
          pec: `${slug}@pec.it`,
          description: c.requestedMaterials || c.notes || `Produzione Video & Shooting Fotografico per ${c.name}`,
          contractCode: c.contractCode || 'DADO-CTR-2026-095',
          shootingDates: 'Da definire secondo calendario produzione',
          location: `Sede ${c.name} / DADO Studio`,
          materials: [],
        })
      }
    })

    return Array.from(byName.values())
  }, [invoices, crmCompanies])

  // Cerca le aziende nel database in base alle lettere digitate (prefisso, parole in qualsiasi ordine o sottostringa)
  const getMatchingInvoiceCompanies = (rawQuery) => {
    const q = (rawQuery || '').trim().toLowerCase()
    if (!q) return invoiceCompanyDirectory.slice(0, 6)

    const tokens = q.split(/\s+/).filter(Boolean)

    const scored = invoiceCompanyDirectory
      .map(comp => {
        const nameLower = comp.companyName.toLowerCase()
        const nameWords = nameLower.split(/[\s&/-]+/).filter(Boolean)
        const refLower = (comp.referent || '').toLowerCase()
        const sectorLower = (comp.sector || '').toLowerCase()

        // 1. Corrispondenza esatta
        if (nameLower === q) return { comp, score: 100 }
        // 2. Inizia esattamente con le lettere digitate
        if (nameLower.startsWith(q)) return { comp, score: 95 }
        // 3. Una parola del nome inizia con la stringa digitata (es. "milano" o "riva")
        if (tokens.length === 1 && nameWords.some(w => w.startsWith(q))) {
          return { comp, score: 88 }
        }
        // 4. Tutte le parole digitate (anche in ordine inverso, es. "milano fashion") iniziano o sono contenute nelle parole del nome azienda
        if (
          tokens.length > 0 &&
          tokens.every(t => nameWords.some(w => w.startsWith(t)) || nameLower.includes(t))
        ) {
          const allStartWith = tokens.every(t => nameWords.some(w => w.startsWith(t)))
          return { comp, score: allStartWith ? 85 : 75 }
        }
        // 5. Sottostringa nel nome o nel referente
        if (nameLower.includes(q)) return { comp, score: 70 }
        if (tokens.every(t => refLower.includes(t) || sectorLower.includes(t))) {
          return { comp, score: 55 }
        }
        return null
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)

    return scored.map(s => s.comp)
  }

  const matchingInvoiceCompanies = useMemo(
    () => getMatchingInvoiceCompanies(newInvoiceForm.companyName),
    [newInvoiceForm.companyName, invoiceCompanyDirectory]
  )

  // Popola tutti i campi della fattura con i dati dell'azienda selezionata dal database
  const applyCompanyToInvoiceForm = (comp, shouldSetFullCompanyName = true) => {
    if (!comp) return
    setMatchedInvoiceCompany(comp)
    setNewInvoiceForm(prev => ({
      ...prev,
      companyId: comp.companyId || prev.companyId || '',
      companyName: shouldSetFullCompanyName ? comp.companyName : prev.companyName,
      amount: String(comp.amount ?? ''),
      deposit: String(comp.deposit ?? 0),
      dueDate: comp.dueDate || '30/11/2026',
      paymentMethod: comp.paymentMethod || 'Bonifico Bancario 30gg d.f.',
      sdi: comp.sdi || '0000000',
      pec: comp.pec || '',
      description: comp.description || '',
      contractCode: comp.contractCode || '',
      shootingDates: comp.shootingDates || '',
      location: comp.location || '',
      materials: comp.materials || [],
    }))
  }

  // Se la modale è aperta e l'utente ha già digitato il nome di un'azienda (es. "milano fashion") ma i campi sono ancora vuoti, compila subito in automatico
  useEffect(() => {
    if (!showNewInvoiceModal) return
    const q = (newInvoiceForm.companyName || '').trim()
    if (q.length >= 2 && !newInvoiceForm.amount) {
      const matches = getMatchingInvoiceCompanies(q)
      if (matches.length > 0) {
        applyCompanyToInvoiceForm(matches[0], true)
      }
    }
  }, [showNewInvoiceModal, invoiceCompanyDirectory])

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
        if (data && typeof data.collaboratorsCount === 'number') {
          setCollaboratorsCount(data.collaboratorsCount)
        }
        if (data && Array.isArray(data.companies)) {
          setCrmCompanies(data.companies)
        }
        if (data && data.nextActions) {
          try {
            localStorage.setItem('dado_crm_activities_cache', JSON.stringify(data.nextActions))
          } catch {}
          setCalendarVersion(v => v + 1)
        }
      })
      .catch(() => {})

    fetch('/api/crm/collaborators')
      .then(res => res.json())
      .then(data => {
        if (data && data.collaborators && data.collaborators.length > 0) {
          const list = data.collaborators.map(c => ({
            referent: c.name || 'Referente',
            company: c.companyName || 'Azienda',
            dayDate: c.lastContactDayDate || (c.lastContact ? `Data: ${c.lastContact}` : 'Recente'),
            how: c.lastContactHow || (c.mobile ? 'Call WhatsApp & Telefono' : 'Email / Ufficio'),
            why: c.lastContactWhy || c.notes || 'Allineamento operativo sulle produzioni DADO.',
          }))
          setContactPostIts(list)
          setCollaboratorsCount(data.collaborators.length)
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
        return {
          ...inv,
          previousDeposit: inv.deposit,
          previousBalance: inv.balance,
          previousStatus: inv.status,
          deposit: inv.amount,
          balance: 0,
          status: 'Saldato',
          paidAt: new Date().toLocaleDateString('it-IT')
        }
      }
      return inv
    })
    setInvoices(updated)
    try {
      localStorage.setItem('dado_invoices', JSON.stringify(updated))
    } catch {}
    if (selectedInvoice && (selectedInvoice.id === invId || selectedInvoice.number === invId)) {
      setSelectedInvoice(prev => prev ? {
        ...prev,
        previousDeposit: prev.deposit,
        previousBalance: prev.balance,
        previousStatus: prev.status,
        deposit: prev.amount,
        balance: 0,
        status: 'Saldato',
        paidAt: new Date().toLocaleDateString('it-IT')
      } : null)
    }
    try {
      await fetch(`/api/crm/invoices/${invId}/pay`, { method: 'PATCH' })
    } catch {}
  }

  const handleUnmarkInvoicePaid = async (invId) => {
    const updated = invoices.map(inv => {
      if (inv.id === invId || inv.number === invId) {
        const prevBal = typeof inv.previousBalance === 'number' && inv.previousBalance > 0
          ? inv.previousBalance
          : Math.round(inv.amount * 0.5)
        const prevDep = typeof inv.previousDeposit === 'number'
          ? prev.previousDeposit
          : Math.max(0, inv.amount - prevBal)
        const prevStatus = inv.previousStatus && inv.previousStatus !== 'Saldato'
          ? inv.previousStatus
          : (prevBal > 0 ? 'In attesa saldo' : 'Emessa')
        const { previousBalance, previousDeposit, previousStatus: _ps, paidAt, ...rest } = inv
        return {
          ...rest,
          deposit: prevDep,
          balance: prevBal,
          status: prevStatus,
        }
      }
      return inv
    })
    setInvoices(updated)
    try {
      localStorage.setItem('dado_invoices', JSON.stringify(updated))
    } catch {}
    if (selectedInvoice && (selectedInvoice.id === invId || selectedInvoice.number === invId)) {
      setSelectedInvoice(prev => {
        if (!prev) return null
        const prevBal = typeof prev.previousBalance === 'number' && prev.previousBalance > 0
          ? prev.previousBalance
          : Math.round(prev.amount * 0.5)
        const prevDep = typeof prev.previousDeposit === 'number'
          ? prev.previousDeposit
          : Math.max(0, prev.amount - prevBal)
        const prevStatus = prev.previousStatus && prev.previousStatus !== 'Saldato'
          ? prev.previousStatus
          : (prevBal > 0 ? 'In attesa saldo' : 'Emessa')
        return {
          ...prev,
          deposit: prevDep,
          balance: prevBal,
          status: prevStatus,
          previousBalance: undefined,
          previousDeposit: undefined,
          previousStatus: undefined,
          paidAt: undefined,
        }
      })
    }
    try {
      await fetch(`/api/crm/invoices/${invId}/unpay`, { method: 'PATCH' })
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
      companyId: newInvoiceForm.companyId || `cmp-${Date.now()}`,
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
      contractCode: newInvoiceForm.contractCode || `DADO-CTR-2026-${Math.floor(100 + Math.random() * 899)}`,
      shootingDates: newInvoiceForm.shootingDates || 'Calendario produzione concordato',
      location: newInvoiceForm.location || 'DADO Studio / Sede Cliente',
      materials: newInvoiceForm.materials && newInvoiceForm.materials.length > 0
        ? newInvoiceForm.materials
        : [
            { item: newInvoiceForm.description.trim() || 'Produzione Video / Foto DADO Studio', qty: '1', price: amt },
          ],
    }
    const updated = [newInv, ...invoices]
    setInvoices(updated)
    try {
      localStorage.setItem('dado_invoices', JSON.stringify(updated))
    } catch {}
    setShowNewInvoiceModal(false)
    setShowInvoiceCompanyDropdown(false)
    setMatchedInvoiceCompany(null)
    setNewInvoiceForm({
      companyId: '',
      companyName: '',
      amount: '',
      deposit: '',
      dueDate: '',
      paymentMethod: 'Bonifico Bancario 30gg d.f.',
      description: '',
      sdi: '0000000',
      pec: '',
      contractCode: '',
      shootingDates: '',
      location: '',
      materials: [],
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
  const [aiCurrentPrompt, setAiCurrentPrompt] = useState('')
  const [isAiExpanded, setIsAiExpanded] = useState(false)
  const [isClosingAi, setIsClosingAi] = useState(false)
  const closeAiTimerRef = useRef(null)
  const [copiedAiAnswer, setCopiedAiAnswer] = useState(false)
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
  const isWindowMaximized = useIsWindowMaximized()
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

  const outputScrollRef = useRef(null)

  // Configurazione API Key e Modello AI (Google Gemini principale)
  const [showAiConfigModal, setShowAiConfigModal] = useState(false)
  const [aiConfig, setAiConfig] = useState({ hasKey: false, hasGeminiKey: false, geminiKey: '', geminiModel: 'gemini-2.5-flash', model: 'gemini-2.5-flash', currentEngine: 'Motore CRM Interno' })
  const [inputGeminiKey, setInputGeminiKey] = useState('')
  const [inputModel, setInputModel] = useState('gemini-2.5-flash')
  const [inputOpenaiKey, setInputOpenaiKey] = useState('')
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
        if (cfg.geminiModel) setInputModel(cfg.geminiModel)
        else if (cfg.model) setInputModel(cfg.model)
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
          geminiApiKey: inputGeminiKey.trim() || undefined,
          geminiModel: inputModel,
          openaiApiKey: inputOpenaiKey.trim() || undefined,
        })
      })
      const data = await res.json()
      if (res.ok) {
        setAiConfig(prev => ({
          ...prev,
          hasKey: data.hasGeminiKey || data.hasOpenaiKey,
          hasGeminiKey: data.hasGeminiKey,
          geminiModel: data.geminiModel,
          currentEngine: data.hasGeminiKey ? `Google Gemini (${data.geminiModel})` : (data.hasOpenaiKey ? `OpenAI Cloud (${data.openaiModel})` : 'Motore CRM Interno')
        }))
        setConfigSuccess('Configurazione Gemini salvata con successo!')
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

  const closeAiPopup = useCallback(() => {
    setIsClosingAi(true)
    if (closeAiTimerRef.current) clearTimeout(closeAiTimerRef.current)
    closeAiTimerRef.current = setTimeout(() => {
      setIsAiExpanded(false)
      setIsClosingAi(false)
      setAiResult(null)
      setAiLoading(false)
      setAiCurrentPrompt('')
      window.dispatchEvent(new CustomEvent('dado-ai-reset'))
      window.dispatchEvent(new CustomEvent('dado-ai-focus', { detail: { active: false } }))
    }, 320)
  }, [])

  const handleCopyAiAnswer = useCallback(() => {
    if (!aiResult?.content) return
    navigator.clipboard.writeText(aiResult.content)
    setCopiedAiAnswer(true)
    setTimeout(() => setCopiedAiAnswer(false), 2000)
  }, [aiResult])

  // Ascolto tasto ESC da tastiera per chiudere modali, pop-up espanso e resettare la ricerca AI
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAiConfigModal(false)
        setShowCollaboratorsModal(false)
        setShowInvoiceMenuModal(false)
        setShowActiveClientsModal(false)
        setSelectedInvoice(null)
        setShowNewInvoiceModal(false)
        if (isAiExpanded || aiResult || aiLoading) {
          closeAiPopup()
        }
        if (pinnedCalendarDay || hoveredCalendarDay) {
          setPinnedCalendarDay(null)
          setHoveredCalendarDay(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAiExpanded, aiResult, aiLoading, closeAiPopup, pinnedCalendarDay, hoveredCalendarDay])

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

  // ── Espansione pop-up al passaggio del cursore sui giorni del Calendar Week o richiesta ASK OpenAI ──
  // Le sezioni laterali scorrono fluidamente verso l'esterno, la barra laterale
  // si ritrae alle sole icone e la finestra pop-up si allarga a tutta larghezza rimanendo rigorosamente entro i margini della dashboard.
  const isDaySelectedWithEvents = Boolean(selectedCalendarDay && currentDaySchedule?.events?.length > 0)

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
  const isAiActive = (isAiExpanded || Boolean(aiLoading) || Boolean(aiResult)) && !isClosingAi
  const isDashboardExpanded = isDayExpanded || isAiActive
  const isAnyClosing = isClosingExpanded || isClosingAi

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('dado-sidebar-compact', { detail: { active: isDashboardExpanded } }))
    window.dispatchEvent(new CustomEvent('dado-ai-focus', { detail: { active: isAiActive } }))
  }, [isDashboardExpanded, isAiActive])

  useEffect(() => () => {
    window.dispatchEvent(new CustomEvent('dado-sidebar-compact', { detail: { active: false } }))
    window.dispatchEvent(new CustomEvent('dado-ai-focus', { detail: { active: false } }))
  }, [])

  // Stato visibilità pop-up ultimi aggiornamenti (Smart Notification Toast):
  // Calendar Week si accorcia SOLO ed esclusivamente quando questo pop-up è aperto e visibile
  const [isSmartToastOpen, setIsSmartToastOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.__dadoSmartToastVisible !== undefined) {
      return Boolean(window.__dadoSmartToastVisible)
    }
    return true
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__dadoSmartToastVisible !== undefined) {
      setIsSmartToastOpen(Boolean(window.__dadoSmartToastVisible))
    }
    const handleToastState = (e) => {
      setIsSmartToastOpen(Boolean(e?.detail?.isVisible))
    }
    window.addEventListener('dado-smart-toast-state', handleToastState)
    window.dispatchEvent(new CustomEvent('dado-request-smart-toast-state'))
    return () => window.removeEventListener('dado-smart-toast-state', handleToastState)
  }, [])

  // Curva di accelerazione Apple/iOS ultra-fluida per le transizioni verso l'esterno
  const slideEase = 'cubic-bezier(0.16, 1, 0.3, 1)'

  const colonna1SlideStyle = isDashboardExpanded
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

  const colonna2SlideStyle = isDashboardExpanded
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

  const colonna3SlideStyle = isDashboardExpanded
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

  const headerSlideStyle = isDashboardExpanded
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
        transition: `transform 420ms ${slideEase}, opacity 350ms ${slideEase}`,
      }

  const nextActionsSlideStyle = {
    // Si muove solidalmente con Colonna 3 senza collassare la larghezza per massima fluidità
  }

  const slideRightStyle = (delay = 0) => ({
    transform: isDashboardExpanded ? 'translateX(130%)' : 'translateX(0)',
    opacity: isDashboardExpanded ? 0 : 1,
    pointerEvents: isDashboardExpanded ? 'none' : 'auto',
    willChange: 'transform, opacity',
    transition: isDashboardExpanded
      ? `transform 420ms ${slideEase} ${delay}ms, opacity 320ms ${slideEase} ${delay}ms`
      : `transform 420ms ${slideEase} ${90 - delay}ms, opacity 350ms ${slideEase} ${90 - delay}ms`,
  })

  // Finestra Pop-Up posizionata rigorosamente entro i margini della Dashboard (da sotto Calendar Week alla banda inferiore)
  const popupExpandStyle = (isDashboardExpanded || activeExpandedDay || isAiActive)
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
        opacity: isAnyClosing ? 0 : 1,
        transform: isAnyClosing ? 'translateY(12px) scale(0.98)' : 'translateY(0) scale(1)',
        pointerEvents: isAnyClosing ? 'none' : 'auto',
        willChange: 'transform, opacity',
        transition: `opacity 300ms ${slideEase}, transform 380ms ${slideEase}`,
      }
    : {
        transition: `all 380ms ${slideEase}`,
      }

  return (
    <div className="h-full w-full bg-transparent flex flex-col flex-1 relative overflow-hidden min-h-0">
      {/* ── Banda Superiore: unita alla barra laterale sinistra (#2d3139) a tutta larghezza senza interruzioni ── */}
      <div className="w-full flex-shrink-0 relative z-20">
        <div
          className="w-full rounded-none flex items-center justify-between px-5"
          style={{
            height: 'calc(3rem - 0.5cm)',
            background: 'linear-gradient(90deg, #2d3139 0%, #2d3139 calc(100% - 500px), #64748b calc(100% - 420px), #cbd5e1 calc(100% - 360px), #ffffff calc(100% - 310px), #ffffff 100%)',
            borderTopLeftRadius: '0px',
            borderBottomLeftRadius: '0px',
            borderTopRightRadius: '0px',
            borderBottomRightRadius: '0px',
          }}
        >
          {/* Banda superiore elegante e pulita */}
        </div>
      </div>

      {/* Canvas Principale armonizzato (sotto la banda superiore, unificato alla barra laterale sinistra, arrotondato in basso a sinistra) */}
      <div
        className="flex-1 min-h-0 rounded-tl-none rounded-bl-[48px] rounded-tr-none rounded-br-none flex flex-col justify-between relative min-w-0 overflow-hidden"
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
        <div className="flex-1 min-h-0 pl-2 pr-0 pt-0 pb-0 flex min-w-0 items-stretch overflow-hidden no-scrollbar relative z-10" style={{ gap: '0.3cm', paddingRight: '0.2cm' }}>

        {/* ══ COLONNA 1 & 2 (Sinistra e Centrale) ══ */}
        <div
          className={`${isFunnelDetailsOpen ? 'flex-1' : 'flex-shrink-0'} flex items-stretch self-stretch gap-4 min-w-0 h-full`}
          style={{
            marginRight: isFunnelDetailsOpen ? '0.1cm' : '0px',
            transition: 'all 420ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >

          {/* COLONNA 1 (Sinistra): "Go get it today" + Card CONTATTI, ACTIVE CLIENTS, INVOICE */}
          <div
            className="flex flex-col justify-between flex-shrink-0 self-stretch h-full"
            style={{
              width: '185px',
              ...colonna1SlideStyle,
            }}
          >
            {/* Intestazione Dashboard */}
            <div className="flex items-start justify-between flex-wrap" style={{ marginTop: '0.4cm', ...headerSlideStyle }}>
              <div className="flex items-start">
                <div>
                  {/* Sottotitolo "Go get it today" — Allineato a sinistra con Colonna 1, font 20px, Go get it azzurro chiaro brillante */}
                  <p style={{ marginLeft: '0.2cm', marginTop: '2px', marginBottom: '4px', fontSize: '20px', fontFamily: '"Switzer", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    <span style={{ color: '#00c5ff' }}>Go get it</span>
                    <span style={{ display: 'inline-block', width: '10px' }}>&nbsp;</span>
                    <span style={{ color: '#22e05a', fontSize: 'calc(20px + 3pt)' }}>today</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Gruppo Card Sinistra: Contatti & Active Clients nella parte bassa di Funnel & KPI, discostate di 3cm da Invoice */}
            <div
              className="flex flex-col justify-end flex-1 min-h-0"
              style={{
                marginTop: 'auto',
                marginBottom: '0.5cm',
                transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Card Superiori: CONTATTI e ACTIVE CLIENTS con Specchietto 3cm x 4cm Governance & Compliance nello spazio di 3cm sopra Invoice */}
              <div
                className="flex flex-col gap-2.5 flex-shrink-0"
              >
                {/* 1. Card CONTATTI / COLLABORAZIONI (Calibrata) */}
                <div
                  onClick={() => setShowCollaboratorsModal(true)}
                  className="flex flex-col justify-between shrink-0 p-3 bg-white transition-all hover:shadow-md hover:scale-[1.02] group cursor-pointer relative"
                  style={{
                    width: '185px',
                    height: isWindowMaximized ? '106px' : '102px',
                    border: '1.5px solid #cce5f6',
                    borderRadius: '16px',
                    boxShadow: '0 2px 10px rgba(27, 183, 237, 0.06)',
                    fontFamily: '"Switzer", sans-serif',
                  }}
                  title="Apri Rubrica Collaboratori & Contatti Aziendali"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase tracking-[0.08em] leading-tight whitespace-nowrap" style={{ fontSize: '13.5px', color: '#7c3aed' }}>
                      CONTATTI
                    </span>
                    <span
                      className="text-[11px] font-black px-2 py-0.5 rounded-full bg-purple-50 text-[#7c3aed] border border-purple-200"
                      title={`${collaboratorsCount} contatti collaboratori registrati`}
                    >
                      {collaboratorsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <UserPlus size={30} className="text-slate-800 group-hover:text-[#7c3aed] transition-colors" />
                    <span className="text-[10.5px] text-purple-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Apri ↗
                    </span>
                  </div>
                  <span className="text-slate-500 leading-tight" style={{ fontSize: '12.5px' }}>
                    collaborazioni
                  </span>
                </div>

                {/* 2. Card ACTIVE CLIENTS (Calibrata) */}
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
                    width="185px"
                    minHeight={isWindowMaximized ? '106px' : '102px'}
                    height={isWindowMaximized ? '106px' : '102px'}
                    labelSize="13.5px"
                    valueSize="26px"
                    subSize="12px"
                  />
                </div>
              </div>

              {/* 3. Card INVOICE — Posizionata sul fondo di Colonna 1 */}
              <div
                onClick={() => setShowInvoiceMenuModal(true)}
                className="block hover:opacity-95 hover:scale-[1.02] transition-all flex flex-col group cursor-pointer shrink-0"
                style={{
                  marginTop: '0',
                  marginBottom: '0',
                }}
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
                  width="185px"
                  minHeight={isWindowMaximized ? '106px' : '102px'}
                  height={isWindowMaximized ? '106px' : '102px'}
                  labelSize="13.5px"
                  valueSize="26px"
                  subSize="12px"
                />
              </div>
            </div>
          </div>

          {/* COLONNA 2: Sezione FUNNEL & KPI — Quando si clicca "Dettagli" si estende al centro fino a Note e Next actions (più in orizzontale che in verticale) */}
          <div
            className={`relative flex flex-col self-stretch h-full justify-end ${isFunnelDetailsOpen ? 'flex-1 min-w-0' : 'flex-shrink-0'}`}
            style={{
              width: isFunnelDetailsOpen
                ? '100%'
                : isWindowMaximized
                ? '360px'
                : 'calc(260px + 2.5cm)',
              transition: 'all 420ms cubic-bezier(0.16, 1, 0.3, 1)',
              ...colonna2SlideStyle,
            }}
          >
            {/* Slot notifica smart: posizionato pulito sopra la colonna */}
            <div id="dado-toast-slot" className="absolute z-[60]" style={{ top: '0.3cm', left: '0px' }} />
            {/* Sezione FUNNEL & KPI — Estensione combinata (prevalente in orizzontale fino a Note/Next actions + incremento calibrato in verticale) */}
            <div
              className="w-full flex flex-col justify-end"
              style={{
                height: isFunnelDetailsOpen
                  ? isWindowMaximized
                    ? 'calc(420px + 4.8cm)'
                    : 'calc(100% - 42px)'
                  : isWindowMaximized
                  ? 'calc(420px + 3cm)'
                  : 'calc(100% - 98px - 0.8cm)',
                maxHeight: isFunnelDetailsOpen
                  ? isWindowMaximized
                    ? 'calc(100% - 0.7cm)'
                    : '505px'
                  : isWindowMaximized
                  ? 'calc(420px + 3cm)'
                  : '430px',
                marginTop: isFunnelDetailsOpen
                  ? isWindowMaximized
                    ? 'auto'
                    : '0.35cm'
                  : isWindowMaximized
                  ? 'auto'
                  : 'calc(98px + 0.3cm)',
                marginBottom: isFunnelDetailsOpen ? '0.25cm' : '0.5cm',
                transition: 'all 420ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <ConcentricRingsKpi
                width="100%"
                height="100%"
                isExpanded={isFunnelDetailsOpen}
                onToggleExpand={(nextVal) => {
                  const resolved = typeof nextVal === 'boolean' ? nextVal : !isFunnelDetailsOpen
                  setIsFunnelDetailsOpen(resolved)
                }}
              />
            </div>
          </div>



                  {/* Sezione Output / Pop-up Allargata nello spazio guadagnato al centro della dashboard */}
                  {!isFunnelDetailsOpen && (isAiExpanded || aiResult || aiLoading || activeExpandedDay || (selectedCalendarDay && currentDaySchedule?.events?.length > 0)) && (
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
                        boxShadow: (isDashboardExpanded || activeExpandedDay || isAiActive)
                          ? '0 16px 48px rgba(27, 183, 237, 0.18), 0 4px 16px rgba(0, 0, 0, 0.08)'
                          : '0 10px 30px rgba(27, 183, 237, 0.10)',
                        height: (isDashboardExpanded || activeExpandedDay || isAiActive) ? 'auto' : 'calc(100vh - 280px)',
                        minHeight: (isDashboardExpanded || activeExpandedDay || isAiActive) ? 'auto' : '380px',
                        maxHeight: (isDashboardExpanded || activeExpandedDay || isAiActive) ? 'none' : 'calc(100vh - 280px)',
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
                        ) : (aiResult || isAiActive) && activeDayForSchedule ? (
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
                          <div className="flex items-center gap-2.5">
                            <span
                              className="text-slate-900 font-bold tracking-wide text-[16px]"
                              style={{ fontFamily: '"Switzer", sans-serif' }}
                            >
                              {aiLoading ? 'Analisi Database in corso...' : 'Risultato Richiesta OpenAI'}
                            </span>
                            {aiConfig?.model && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300">
                                {aiConfig.model}
                              </span>
                            )}
                          </div>
                        )}

                        {(isDashboardExpanded || activeExpandedDay || isAiActive) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (isAiActive) {
                                closeAiPopup()
                              } else {
                                setPinnedCalendarDay(null)
                                setHoveredCalendarDay(null)
                              }
                            }}
                            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                            title="Chiudi pop-up (ESC)"
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
                        /* Contenuto AI OpenAI a tutta larghezza, altamente leggibile, font Switzer */
                        <div
                          className="w-full flex-1 flex flex-col min-h-0"
                          style={{
                            fontFamily: '"Switzer", sans-serif',
                          }}
                        >
                          {aiLoading ? (
                            <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center py-12 px-6 text-center">
                              {/* Box domanda in corso se presente */}
                              {aiCurrentPrompt && (
                                <div className="max-w-xl w-full mb-6 p-3.5 bg-sky-50/80 border border-sky-200 rounded-xl text-left shadow-xs">
                                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#0284c7] mb-1">
                                    Domanda inoltrata:
                                  </div>
                                  <div className="text-sm font-semibold text-slate-900 break-words">
                                    "{aiCurrentPrompt}"
                                  </div>
                                </div>
                              )}

                              {/* Spinner e animazione di analisi */}
                              <div className="relative flex items-center justify-center mb-4">
                                <div className="w-12 h-12 border-3 border-sky-100 border-t-[#0284c7] rounded-full animate-spin" />
                                <Sparkles size={20} className="text-[#0284c7] absolute animate-pulse" />
                              </div>

                              <h4 className="text-base font-bold text-slate-800 tracking-tight mb-1">
                                Interrogazione database in tempo reale con OpenAI...
                              </h4>
                              <p className="text-xs text-slate-500 max-w-md">
                                Analisi incrociata di lead, clienti, preventivi, fatture e attività in corso.
                              </p>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col min-h-0 gap-3">
                              {/* Domanda e metadati */}
                              {(aiResult?.question || aiCurrentPrompt) && (
                                <div className="p-3.5 bg-gradient-to-r from-sky-50/90 to-blue-50/50 border border-sky-200/90 rounded-xl flex items-start justify-between gap-3 shadow-xs shrink-0">
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <span className="px-2 py-0.5 rounded-md bg-[#0284c7] text-white text-[10px] font-black uppercase tracking-wider shrink-0 mt-0.5">
                                      Richiesta
                                    </span>
                                    <span className="text-slate-900 font-bold text-[14px] leading-snug break-words">
                                      "{aiResult?.question || aiCurrentPrompt}"
                                    </span>
                                  </div>
                                  {aiResult?.timestamp && (
                                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                                      {aiResult.timestamp}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Contenuto Risposta OpenAI: completamente espanso, testo scuro ad alto contrasto, scrollabile fluido */}
                              <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-popup-scrollbar bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs select-text">
                                <div className="text-[14.5px] leading-relaxed text-slate-800 whitespace-pre-line font-normal selection:bg-sky-100 selection:text-sky-900">
                                  {aiResult?.content || 'Nessuna risposta disponibile.'}
                                </div>
                              </div>

                              {/* Barra inferiore delle azioni: Copia testo, Info modello, Tasto Chiudi ESC */}
                              <div className="pt-2 flex items-center justify-between flex-shrink-0 border-t border-slate-100 text-xs">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={handleCopyAiAnswer}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition-all shadow-xs"
                                    title="Copia testo negli appunti"
                                  >
                                    {copiedAiAnswer ? (
                                      <>
                                        <Check size={14} className="text-emerald-600" />
                                        <span className="text-emerald-700">Copiato!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={14} className="text-slate-500" />
                                        <span>Copia Risposta</span>
                                      </>
                                    )}
                                  </button>
                                  <span className="text-[11px] text-slate-400">
                                    Premi <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px] font-semibold text-slate-600">ESC</kbd> per chiudere e ripristinare la dashboard
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={closeAiPopup}
                                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold cursor-pointer transition-all shadow-xs"
                                >
                                  Chiudi
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

        {/* ══ COLONNA DESTRA (Calendar Week + Drive Clock a sinistra, Ask OpenAI + Preventivi + Next actions a destra) ══ */}
        <div ref={colonnaDestraRef} className="self-stretch flex-shrink-0 flex items-stretch justify-start min-w-0 relative" style={{ gap: '0.8cm', marginLeft: 'auto', marginRight: '0px' }}>

          {/* Sotto-colonna Centrale: Calendar Week con sottostanti Sezione Note e Next actions */}
          <div className="flex flex-col flex-shrink-0 h-full" style={{ width: 'calc(255px + 0.4cm)' }}>
            {/* Sezione CALENDAR WEEK: accorciata solo quando c'è il pop-up notifica */}
            <div
              ref={calendarContainerRef}
              onMouseEnter={handleCalendarMouseEnter}
              onMouseLeave={handleCalendarMouseLeave}
              className="px-3 py-2 bg-white shadow-xs flex flex-col justify-between border border-[#cce5f6] select-none shrink-0"
              style={{
                backgroundColor: '#ffffff',
                width: (isSmartToastOpen || isFunnelDetailsOpen) ? '100%' : 'calc(100% + 2cm)', // accorciato esattamente fino alla sezione Note sottostante (width 100%, marginLeft 0.5cm)
                height: 'calc(98px - 0.3cm)',
                minHeight: 'calc(98px - 0.3cm)',
                borderRadius: '0px',
                boxShadow: '0 2px 8px rgba(27, 183, 237, 0.06)',
                fontFamily: '"Switzer", sans-serif',
                marginTop: '0.3cm',
                marginLeft: (isSmartToastOpen || isFunnelDetailsOpen) ? '0.5cm' : 'calc(0.5cm - 2cm)',
                transition: 'width 480ms cubic-bezier(0.16, 1, 0.3, 1), margin-left 480ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Header: Nome del mese corrente */}
              <div className="flex items-center px-0.5">
                <span
                  className="font-extrabold uppercase tracking-[0.08em] block leading-tight text-[12.5px]"
                  style={{ fontFamily: '"Switzer", sans-serif', color: '#0f172a' }}
                >
                  {currentMonthName}
                </span>
              </div>

              {/* 7 Caselle Giorni: prima lettera (L M M G V S D) */}
              <div className="grid grid-cols-7 gap-1 mt-1 flex-1 items-stretch">
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
                      className={`flex flex-col items-center justify-center transition-all group py-1.5 border cursor-pointer ${
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

            {/* Sezione NOTE (Taccuino) — Estesa verso il basso a schermo intero */}
            <div
              ref={noteBoxRef}
              className="flex-shrink-0"
              style={{
                width: '100%',
                marginLeft: '0.5cm',
                marginTop: '0.5rem',
                ...colonna3SlideStyle,
              }}
            >
              <TurnedPageNoteBox
                isMaximized={isWindowMaximized}
                height={isWindowMaximized ? 'calc(135px + 1cm)' : '135px'}
              />
            </div>

            {/* 3. Box Next actions — Mantenuta in basso (mt-auto) e calibrata per non debordare mai */}
            <div
              ref={nextActionsRef}
              onClick={(e) => {
                if (!e.target.closest('a') && !e.target.closest('button')) {
                  navigate('/tasks')
                }
              }}
              className="bg-white px-3 pt-2.5 pb-2 flex flex-col flex-none min-h-0 overflow-hidden cursor-pointer hover:border-sky-300 transition-colors group/card border border-[#cce5f6] mt-auto"
              style={{
                borderRadius: '16px',
                width: '100%',
                marginLeft: '0.5cm',
                marginTop: 'auto',
                marginBottom: '0.5cm', // distanza dalla banda inferiore
                height: isWindowMaximized ? 'calc(185px + 1cm)' : '185px',
                minHeight: isWindowMaximized ? 'calc(185px + 1cm)' : '185px',
                maxHeight: isWindowMaximized ? 'calc(185px + 1cm)' : '185px',
                fontFamily: '"Switzer", sans-serif',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                ...colonna3SlideStyle,
              }}
              title="Clicca per aprire le attività e prossime azioni"
            >
              <Link
                to="/tasks"
                className="group/title flex items-center justify-between cursor-pointer hover:opacity-85 transition-opacity"
                title="Visualizza tutte le attività e prossime azioni"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2
                      className="text-slate-900 group-hover/title:text-sky-600 font-bold leading-tight transition-colors"
                      style={{ fontSize: '13.5px', fontFamily: '"Switzer", sans-serif' }}
                    >
                      Next actions
                    </h2>
                    <ArrowUpRight size={13} className="text-slate-400 group-hover/title:text-sky-600 group-hover/title:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <p
                    className="mt-0.5 font-medium leading-tight whitespace-nowrap text-slate-500"
                    style={{ fontSize: '10px', fontFamily: '"Switzer", sans-serif' }}
                  >
                    No races. Keep your pace.
                  </p>
                </div>
              </Link>

              {/* Contenitore azioni con collegamenti ai singoli riquadri */}
              <div className="flex flex-col justify-evenly gap-1 mt-2 flex-1 min-h-0">
                {/* 1. call reports */}
                <div className="w-full flex-1 min-h-0" style={{ maxHeight: isWindowMaximized ? '90px' : '64px' }}>
                  <Link
                    to="/call-reports"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1.5 w-full text-center rounded-lg hover:scale-[1.02] transition-all flex items-center justify-center h-full cursor-pointer"
                    style={{
                      background: 'linear-gradient(180deg, #fd7430 0%, #f96720 100%)',
                      backgroundColor: '#fc6e28',
                      boxShadow: 'none',
                    }}
                    title="Apri la schermata Call Reports"
                  >
                    <span
                      style={{
                        fontFamily: '"Switzer", sans-serif',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        fontWeight: 900,
                        letterSpacing: '0.02em',
                        lineHeight: 1.15,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      call reports
                    </span>
                  </Link>
                </div>

                {/* 2. leads */}
                <div className="w-full flex-1 min-h-0" style={{ maxHeight: isWindowMaximized ? '90px' : '64px' }}>
                  <Link
                    to="/leads"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1.5 w-full text-center rounded-lg hover:scale-[1.02] transition-all flex items-center justify-center h-full cursor-pointer"
                    style={{
                      background: 'linear-gradient(180deg, #d8a74e 0%, #cf9f40 100%)',
                      backgroundColor: '#d2a346',
                      boxShadow: 'none',
                    }}
                    title="Apri la schermata Leads"
                  >
                    <span
                      style={{
                        fontFamily: '"Switzer", sans-serif',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        letterSpacing: '0.02em',
                        lineHeight: 1.15,
                      }}
                    >
                      leads
                    </span>
                  </Link>
                </div>

                {/* 3. new opportunities */}
                <div className="w-full flex-1 min-h-0" style={{ maxHeight: isWindowMaximized ? '90px' : '64px' }}>
                  <Link
                    to="/opportunities"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1.5 w-full text-center rounded-lg hover:scale-[1.02] transition-all flex items-center justify-center h-full cursor-pointer"
                    style={{
                      background: 'linear-gradient(180deg, #994cf4 0%, #9045f1 100%)',
                      backgroundColor: '#9549f3',
                      boxShadow: 'none',
                    }}
                    title="Apri la schermata New Opportunities"
                  >
                    <span
                      style={{
                        fontFamily: '"Switzer", sans-serif',
                        fontSize: '0.82rem',
                        fontWeight: 900,
                        letterSpacing: '0.02em',
                        lineHeight: 1.15,
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      new opportunities
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sotto-colonna Destra (ASK OPEN AI + Box Preventivi + Next actions + Logo in basso a destra) */}
          <div className="w-[275px] flex flex-col flex-shrink-0 items-stretch self-stretch">
            {/* 1. Box ASK OPEN AI (Sfondo bianco, saldato a filo con la banda superiore) */}
            <div
              ref={askOpenAiRef}
              className="w-full flex-shrink-0"
              style={{
                marginTop: '0px',
                fontFamily: '"Switzer", sans-serif',
                ...slideRightStyle(0),
              }}
            >
              <AskOpenAiBox
                isMaximized={isWindowMaximized}
                onOpenAiConfig={() => {
                  setShowAiConfigModal(true)
                }}
                aiConfig={aiConfig}
                onStartAsk={(text) => {
                  setAiCurrentPrompt(text)
                  setIsAiExpanded(true)
                  setIsClosingAi(false)
                  setActiveOutputTab('ai')
                  setPinnedCalendarDay(null)
                  setHoveredCalendarDay(null)
                }}
                onAskComplete={(res) => {
                  setAiResult(res)
                  if (res) {
                    setIsAiExpanded(true)
                    setIsClosingAi(false)
                    setActiveOutputTab('ai')
                  }
                }}
                onLoadingChange={(loading) => {
                  setAiLoading(loading)
                  if (loading) {
                    setIsAiExpanded(true)
                    setIsClosingAi(false)
                    setActiveOutputTab('ai')
                  }
                }}
              />
            </div>

            {/* 2. Box Preventivi — scalata verso il basso a 1.2cm dal box ASK OPEN AI quando ingrandito a tutto schermo */}
            <div
              className="w-full flex flex-col flex-shrink-0 overflow-hidden border border-[#cce5f6]"
              style={{
                borderRadius: '16px',
                marginTop: isWindowMaximized ? '1.2cm' : '0.4cm',
                fontFamily: '"Switzer", sans-serif',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                transition: 'margin-top 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                ...slideRightStyle(60),
              }}
            >
              {/* 1. preventivi in scadenza */}
              <Link
                to="/opportunities"
                className="px-4 py-2.5 min-h-[48px] flex items-center justify-between gap-2.5 hover:opacity-95 transition-all block group border-b border-red-100/70"
                style={{ backgroundColor: '#fff5f5' }}
                title="Visualizza preventivi in scadenza"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="text-slate-900 font-bold tracking-tight leading-snug"
                    style={{ fontSize: '14px', fontFamily: '"Switzer", sans-serif' }}
                  >
                    preventivi in scadenza
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11.5px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 shadow-2xs">
                    3 in scadenza
                  </span>
                  <ArrowUpRight size={14} className="text-red-400 group-hover:text-red-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </Link>

              {/* 2. preventivi inviati */}
              <Link
                to="/opportunities"
                className="px-4 py-2.5 min-h-[48px] flex items-center justify-between gap-2.5 hover:opacity-95 transition-all block group border-b border-sky-100/70"
                style={{ backgroundColor: '#f0f9ff' }}
                title="Visualizza preventivi inviati"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="text-slate-900 font-bold tracking-tight leading-snug"
                    style={{ fontSize: '14px', fontFamily: '"Switzer", sans-serif' }}
                  >
                    preventivi inviati
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpRight size={14} className="text-sky-400 group-hover:text-sky-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </Link>

              {/* 3. ultimo preventivo */}
              <Link
                to="/opportunities"
                className="px-4 py-2.5 min-h-[48px] flex items-center justify-between gap-2.5 hover:opacity-95 transition-all block group"
                style={{ backgroundColor: '#effdf4' }}
                title="Visualizza ultimo preventivo"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="text-slate-900 font-bold tracking-tight leading-snug"
                    style={{ fontSize: '14px', fontFamily: '"Switzer", sans-serif' }}
                  >
                    ultimo preventivo
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 tracking-tight shadow-2xs">
                    FAT-2026-079
                  </span>
                  <ArrowUpRight size={14} className="text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </Link>
            </div>

            {/* 3. Sezione GOOGLE DRIVE con OROLOGIO — Rettangolare non a tutto schermo, quadrato 5x5 a tutto schermo */}
            <div
              ref={clockDriveRef}
              className={`flex-shrink-0 flex flex-col mt-auto ${
                isWindowMaximized ? 'items-end' : 'items-stretch w-full'
              }`}
              style={{
                marginTop: 'auto',
                marginBottom: isWindowMaximized ? '1cm' : '0.3cm',
                paddingRight: isWindowMaximized ? '0.2cm' : '0px',
                fontFamily: '"Switzer", sans-serif',
                transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                ...slideRightStyle(120),
              }}
            >
              <ClockDriveBox
                isSquare={isWindowMaximized}
                width={isWindowMaximized ? '5cm' : '100%'}
                height={isWindowMaximized ? '5cm' : '68px'}
                minHeight={isWindowMaximized ? '5cm' : '68px'}
                className="transition-all duration-300"
              />
            </div>

            {/* 4. Logo DADO Creative Studio: alla base della colonna destra, posizionato sotto Google Drive senza mai sovrapporsi */}
            <div
              className="flex-shrink-0 flex flex-col items-end self-end pointer-events-auto"
              style={{
                marginBottom: '0.35cm',
                paddingRight: '0.2cm',
                ...slideRightStyle(180),
              }}
            >
              <a
                href="https://dadocreative.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-end justify-center gap-0.5 group cursor-pointer transition-all hover:opacity-95"
                style={{
                  width: '105px',
                }}
                title="Visita il sito ufficiale dadocreative.studio"
              >
                <div
                  className="w-[105px] overflow-hidden shadow-xs border border-white/40 block group-hover:scale-105 transition-transform"
                  style={{ borderRadius: '4px' }}
                >
                  <img
                    src="/dado-creative-studio.png"
                    alt="DADO creative · studio"
                    className="w-full h-auto object-contain block"
                  />
                </div>
                <span
                  className="text-[9px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors select-none whitespace-nowrap text-right pr-0.5"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  ® 2026
                </span>
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* ── Banda Inferiore: stessa tonalità di grigio della barra laterale (#2d3139), campo ricerca note sviluppatore a destra e taglio netto a 90° col display ── */}
      <div className="w-full flex items-center justify-between flex-shrink-0 mt-auto pl-0 relative z-20">
        <UserSwitchMenu />
        <div
          className="rounded-tl-2xl rounded-tr-none rounded-br-none rounded-bl-none flex-1 flex items-center justify-end pl-2 pr-2.5 overflow-hidden py-0"
          style={{
            height: '29px',
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

      {/* ── Modale Dettaglio Fattura Studio (Blu Notte & Oro) — Estesa come le altre card ── */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-2.5 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="w-[98.5vw] max-w-[98.5vw] h-[94vh] max-h-[94vh] rounded-2xl overflow-hidden shadow-2xl border transition-all flex flex-col"
            style={{
              backgroundColor: '#071325',
              borderColor: '#d4af37',
              fontFamily: '"Switzer", sans-serif',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modale */}
            <div
              className="px-6 py-4 flex items-center justify-between border-b flex-shrink-0"
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
                  <p className="text-xs text-amber-200/70">
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
            <div className="flex-1 min-h-0 p-6 sm:p-8 space-y-5 overflow-y-auto text-slate-200">
              {/* Cliente & Progetto */}
              <div className="bg-[#0b1c36] p-4 rounded-xl border border-[#d4af37]/20">
                <span className="text-[11px] uppercase text-[#d4af37] block font-bold tracking-wider">
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
                  <span className="text-[10.5px] text-slate-400 block">Imponibile Netto</span>
                  <span className="text-sm font-bold text-white">
                    € {(selectedInvoice.amount || 0).toLocaleString('it-IT')}
                  </span>
                </div>
                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 block">IVA 22%</span>
                  <span className="text-sm font-bold text-slate-300">
                    € {(selectedInvoice.vat || Math.round((selectedInvoice.amount || 0) * 0.22)).toLocaleString('it-IT')}
                  </span>
                </div>
                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 block">Totale Lordo</span>
                  <span className="text-sm font-black text-[#fbbf24]">
                    € {(selectedInvoice.totalWithVat || Math.round((selectedInvoice.amount || 0) * 1.22)).toLocaleString('it-IT')}
                  </span>
                </div>
                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 block">Saldo Dovuto</span>
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
                  <span className="text-[10.5px] uppercase text-slate-400 block">Condizioni Pagamento</span>
                  <div><strong>Scadenza:</strong> <span className="text-amber-200">{selectedInvoice.dueDate}</span></div>
                  <div><strong>Metodo:</strong> {selectedInvoice.paymentMethod}</div>
                  <div><strong>Acconto già versato:</strong> € {(selectedInvoice.deposit || 0).toLocaleString('it-IT')}</div>
                </div>
                <div className="bg-[#091830] p-3 rounded-xl border border-white/10 space-y-1">
                  <span className="text-[10.5px] uppercase text-slate-400 block">Dati Fatturazione Elettronica</span>
                  <div><strong>Codice SDI:</strong> <span className=" text-cyan-300">{selectedInvoice.sdi}</span></div>
                  <div><strong>PEC:</strong> <span className=" text-cyan-300">{selectedInvoice.pec}</span></div>
                  <div><strong>Stato fiscale:</strong> Emessa & Trasmessa SDI</div>
                </div>
              </div>

              {/* Set & Attrezzatura collegata */}
              {(selectedInvoice.shootingDates || selectedInvoice.materials) && (
                <div className="bg-[#091830] p-3 rounded-xl border border-white/10 text-xs space-y-1">
                  <span className="text-[10.5px] uppercase text-[#d4af37] block font-bold">
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
              className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t flex-shrink-0"
              style={{
                backgroundColor: '#0b1c36',
                borderColor: 'rgba(212, 175, 55, 0.35)',
              }}
            >
              <div className="flex items-center gap-2">
                {(selectedInvoice.balance || 0) > 0 && selectedInvoice.status !== 'Saldato' ? (
                  <button
                    type="button"
                    onClick={() => handleMarkInvoicePaid(selectedInvoice.id)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    title="Segna la fattura come saldata al 100%"
                  >
                    <CheckCircle2 size={15} />
                    <span>Segna come Saldato</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUnmarkInvoicePaid(selectedInvoice.id)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer border border-amber-400/40"
                    title="Annulla il saldo 100% e ripristina la fattura come da saldare"
                  >
                    <RotateCcw size={15} />
                    <span>Annulla Saldo 100%</span>
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

      {/* ── Modale Creazione Nuova Fattura (Blu Notte & Oro) — Estesa come le altre card ── */}
      {showNewInvoiceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-2.5 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => {
            setShowInvoiceCompanyDropdown(false)
            setShowNewInvoiceModal(false)
          }}
        >
          <div
            className="w-[98.5vw] max-w-[98.5vw] h-[94vh] max-h-[94vh] rounded-2xl overflow-hidden shadow-2xl border transition-all flex flex-col"
            style={{
              backgroundColor: '#071325',
              borderColor: '#d4af37',
              fontFamily: '"Switzer", sans-serif',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-6 py-4 flex items-center justify-between border-b rounded-t-2xl flex-shrink-0"
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
                  <h3 className="text-lg font-black tracking-wide text-white uppercase">
                    Nuova Fattura Studio DADO
                  </h3>
                  <p className="text-xs text-amber-200/70">
                    Emissione nuova fattura collegata alle aziende e commesse del database CRM
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowInvoiceCompanyDropdown(false)
                    setShowNewInvoiceModal(false)
                    setShowInvoiceMenuModal(true)
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  ← Torna a Elenco Fatture
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInvoiceCompanyDropdown(false)
                    setShowNewInvoiceModal(false)
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateInvoice} className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 flex flex-col justify-between gap-4 text-xs sm:text-sm text-slate-200">
              <div className="space-y-5 max-w-5xl w-full mx-auto">
                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs text-[#d4af37] font-bold uppercase tracking-wide">
                      Cliente / Azienda *
                    </label>
                    {matchedInvoiceCompany && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-xs font-bold text-emerald-300">
                        ✓ Dati database CRM inseriti ({matchedInvoiceCompany.companyName})
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Digita le prime lettere dell'azienda (es. Fashion, Officine, Solaris...)"
                    value={newInvoiceForm.companyName}
                    onFocus={() => {
                      setShowInvoiceCompanyDropdown(true)
                      setHighlightedCompanyIdx(0)
                    }}
                    onChange={(e) => {
                      const typed = e.target.value
                      setShowInvoiceCompanyDropdown(true)
                      setHighlightedCompanyIdx(0)
                      const trimmed = typed.trim()
                      if (!trimmed) {
                        setMatchedInvoiceCompany(null)
                        setNewInvoiceForm({
                          companyId: '',
                          companyName: '',
                          amount: '',
                          deposit: '',
                          dueDate: '',
                          paymentMethod: 'Bonifico Bancario 30gg d.f.',
                          description: '',
                          sdi: '0000000',
                          pec: '',
                          contractCode: '',
                          shootingDates: '',
                          location: '',
                          materials: [],
                        })
                        return
                      }
                      const matches = getMatchingInvoiceCompanies(trimmed)
                      if (trimmed.length >= 2 && matches.length > 0) {
                        const best = matches[0]
                        setMatchedInvoiceCompany(best)
                        setNewInvoiceForm({
                          companyId: best.companyId || '',
                          companyName: typed,
                          amount: String(best.amount ?? ''),
                          deposit: String(best.deposit ?? 0),
                          dueDate: best.dueDate || '30/11/2026',
                          paymentMethod: best.paymentMethod || 'Bonifico Bancario 30gg d.f.',
                          sdi: best.sdi || '0000000',
                          pec: best.pec || '',
                          description: best.description || '',
                          contractCode: best.contractCode || '',
                          shootingDates: best.shootingDates || '',
                          location: best.location || '',
                          materials: best.materials || [],
                        })
                      } else {
                        setMatchedInvoiceCompany(null)
                        setNewInvoiceForm({ ...newInvoiceForm, companyName: typed })
                      }
                    }}
                    onKeyDown={(e) => {
                      if (!showInvoiceCompanyDropdown || matchingInvoiceCompanies.length === 0) return
                      if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        setHighlightedCompanyIdx(prev => (prev + 1) % Math.min(matchingInvoiceCompanies.length, 6))
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        const maxLen = Math.min(matchingInvoiceCompanies.length, 6)
                        setHighlightedCompanyIdx(prev => (prev - 1 + maxLen) % maxLen)
                      } else if (e.key === 'Enter' && showInvoiceCompanyDropdown) {
                        const chosen = matchingInvoiceCompanies[highlightedCompanyIdx] || matchingInvoiceCompanies[0]
                        if (chosen) {
                          e.preventDefault()
                          applyCompanyToInvoiceForm(chosen, true)
                          setShowInvoiceCompanyDropdown(false)
                        }
                      } else if (e.key === 'Tab') {
                        const chosen = matchingInvoiceCompanies[highlightedCompanyIdx] || matchingInvoiceCompanies[0]
                        if (chosen && newInvoiceForm.companyName.trim().length >= 1) {
                          applyCompanyToInvoiceForm(chosen, true)
                        }
                        setShowInvoiceCompanyDropdown(false)
                      } else if (e.key === 'Escape') {
                        setShowInvoiceCompanyDropdown(false)
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setShowInvoiceCompanyDropdown(false)
                        const q = (newInvoiceForm.companyName || '').trim()
                        if (q.length >= 2) {
                          const matches = getMatchingInvoiceCompanies(q)
                          if (matches.length > 0) {
                            applyCompanyToInvoiceForm(matches[0], true)
                          }
                        }
                      }, 160)
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-[#0b1c36] border border-[#d4af37]/40 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24] text-sm"
                  />

                  {/* Menu a tendina suggerimenti aziende dal database CRM */}
                  {showInvoiceCompanyDropdown && matchingInvoiceCompanies.length > 0 && (
                    <div
                      className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border overflow-hidden shadow-2xl max-h-64 overflow-y-auto"
                      style={{
                        backgroundColor: '#09172e',
                        borderColor: '#d4af37',
                        boxShadow: '0 18px 40px rgba(0, 0, 0, 0.85), 0 0 20px rgba(212, 175, 55, 0.25)',
                      }}
                    >
                      <div className="px-3.5 py-2 bg-[#0b1c36] border-b border-[#d4af37]/25 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#fbbf24]">
                        <span>Aziende nel Database CRM ({matchingInvoiceCompanies.length})</span>
                        <span className="text-slate-400 font-normal normal-case">Clicca o premi Invio per autocompilare</span>
                      </div>
                      {matchingInvoiceCompanies.slice(0, 6).map((comp, idx) => {
                        const isHighlighted = idx === highlightedCompanyIdx
                        return (
                          <button
                            key={comp.companyId || comp.companyName}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              applyCompanyToInvoiceForm(comp, true)
                              setShowInvoiceCompanyDropdown(false)
                            }}
                            onMouseEnter={() => setHighlightedCompanyIdx(idx)}
                            className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 border-b border-white/5 last:border-b-0 transition-colors cursor-pointer ${
                              isHighlighted ? 'bg-[#d4af37]/20' : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm truncate">
                                  {comp.companyName}
                                </span>
                                {comp.sector && (
                                  <span className="px-2 py-0.5 rounded bg-white/10 text-[11px] text-slate-300 shrink-0">
                                    {comp.sector}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 truncate mt-0.5">
                                Ref: <span className="text-slate-200">{comp.referent}</span> · SDI: <span className="text-[#fbbf24]">{comp.sdi}</span> · PEC: <span className="text-slate-300">{comp.pec}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-sm font-black text-[#fbbf24]">
                                € {Number(comp.amount || 0).toLocaleString('it-IT')}
                              </div>
                              <div className="text-xs text-emerald-400 font-semibold">
                                Acc. € {Number(comp.deposit || 0).toLocaleString('it-IT')}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#d4af37] font-bold uppercase mb-1.5">
                      Imponibile Netto (€) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Es. 3500"
                      value={newInvoiceForm.amount}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0b1c36] border border-[#d4af37]/30 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                      Acconto Versato (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Es. 1000"
                      value={newInvoiceForm.deposit}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, deposit: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0b1c36] border border-white/20 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                      Scadenza Pagamento
                    </label>
                    <input
                      type="text"
                      placeholder="Es. 30/11/2026"
                      value={newInvoiceForm.dueDate}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0b1c36] border border-white/20 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                      Metodo di Pagamento
                    </label>
                    <input
                      type="text"
                      placeholder="Bonifico 30gg d.f."
                      value={newInvoiceForm.paymentMethod}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, paymentMethod: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0b1c36] border border-white/20 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                      Codice SDI
                    </label>
                    <input
                      type="text"
                      placeholder="0000000"
                      value={newInvoiceForm.sdi}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, sdi: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0b1c36] border border-white/20 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                      PEC
                    </label>
                    <input
                      type="text"
                      placeholder="azienda@pec.it"
                      value={newInvoiceForm.pec}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, pec: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0b1c36] border border-white/20 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    Descrizione / Commessa
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Descrizione del servizio di produzione foto/video..."
                    value={newInvoiceForm.description}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0b1c36] border border-white/20 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#fbbf24] text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#d4af37]/25 max-w-5xl w-full mx-auto flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowInvoiceCompanyDropdown(false)
                    setShowNewInvoiceModal(false)
                  }}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#fbbf24] text-[#071325] text-xs sm:text-sm font-black transition-all shadow-md cursor-pointer hover:scale-105"
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
        <div 
          onClick={() => setShowAiConfigModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0f172a] border border-slate-700 text-white p-6 shadow-2xl relative cursor-default"
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    Google Gemini API Key (AIzaSy...)
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-sky-400 hover:text-sky-300 underline"
                  >
                    Ottieni chiave gratuita su Google AI Studio ↗
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showApiKeyText ? 'text' : 'password'}
                    value={inputGeminiKey}
                    onChange={(e) => setInputGeminiKey(e.target.value)}
                    placeholder={aiConfig.hasGeminiKey ? `Chiave attiva: ${aiConfig.geminiKey || 'Configurata'} (incolla per sostituire)` : 'Incolla la tua chiave Google Gemini (AIzaSy...)'}
                    className="w-full px-3 py-2 pr-10 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 rounded-none focus:outline-none focus:border-[#38bdf8] text-xs"
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
                  La chiave si collega direttamente al database CRM di DADO Creative Studio con una finestra di contesto di 1 milione di token per analisi istantanee.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                  Modello Google Gemini da Utilizzare
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInputModel('gemini-2.5-flash')}
                    className={`p-2.5 border text-left rounded-none transition-all cursor-pointer ${
                      inputModel === 'gemini-2.5-flash'
                        ? 'bg-sky-950/70 border-sky-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">Gemini 2.5 Flash</div>
                    <div className="text-[10px] text-slate-300 mt-0.5">Consigliato: velocissimo (&lt;1s), 1M token, perfetto per dati CRM e traduzioni</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputModel('gemini-2.5-flash-lite')}
                    className={`p-2.5 border text-left rounded-none transition-all cursor-pointer ${
                      inputModel === 'gemini-2.5-flash-lite'
                        ? 'bg-sky-950/70 border-sky-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">Gemini 2.5 Flash Lite</div>
                    <div className="text-[10px] text-slate-300 mt-0.5">Ultra-leggero e minima latenza di risposta</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputModel('gemini-2.5-pro')}
                    className={`p-2.5 border text-left rounded-none transition-all cursor-pointer ${
                      inputModel === 'gemini-2.5-pro'
                        ? 'bg-sky-950/70 border-sky-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">Gemini 2.5 Pro</div>
                    <div className="text-[10px] text-slate-300 mt-0.5">Massimo ragionamento logico per audit complessi e strategie</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 text-[10.5px]">
                  Backup Alternativo: OpenAI API Key (Opzionale)
                </label>
                <input
                  type="password"
                  value={inputOpenaiKey}
                  onChange={(e) => setInputOpenaiKey(e.target.value)}
                  placeholder="Opzionale: sk-proj-... (usata solo se Gemini non è impostato)"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 rounded-none focus:outline-none focus:border-slate-600 text-xs"
                />
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
                  {configSaving ? 'Salvataggio...' : 'Salva e Collega a Gemini'}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-2.5 bg-black/80 backdrop-blur-md animate-fadeIn"
            onClick={() => setShowActiveClientsModal(false)}
          >
            <div
              className="w-[98.5vw] max-w-[98.5vw] h-[94vh] max-h-[94vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-[#0f172a] text-slate-100 flex flex-col"
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
                    <p className="text-xs text-slate-400">
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

              {/* Corpo Finestra Diviso a 2 Colonne Esteso Orizzontalmente */}
              <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden w-full">
                {/* Colonna Sinistra: Lista 11 Clienti (Senza riquadrini "Attivo") */}
                <div
                  className="w-full md:w-[340px] lg:w-[380px] border-r border-slate-700/80 bg-[#0b1424] flex flex-col flex-shrink-0"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  <div className="px-3.5 py-2.5 bg-[#0e192c] border-b border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                    <span className=" uppercase font-bold text-[11px] text-emerald-400">
                      Elenco Clienti ({filteredClients.length})
                    </span>
                    <span className="text-[10.5px]">Seleziona per dettagli</span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
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
                            className={`p-3 rounded-xl transition-all cursor-pointer border flex flex-col gap-1 text-left ${
                              isSelected
                                ? 'bg-[#152843] border-emerald-500 shadow-md text-white'
                                : 'bg-[#0f1d33]/50 border-slate-800 hover:border-slate-600 hover:bg-[#13223b] text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-[14px] truncate text-white">
                                {client.name}
                              </span>
                            </div>
                            <span className="text-[11.5px] text-slate-400 truncate">
                              {client.industry}
                            </span>
                            <div className="flex items-center justify-between text-[11.5px] pt-1 text-slate-400 border-t border-white/5 mt-0.5">
                              <span className="text-emerald-400 truncate font-semibold">
                                {client.contactPerson.name}
                              </span>
                              <span className="text-slate-400 font-medium">
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
                    className="flex-1 min-w-0 min-h-0 overflow-y-auto p-6 space-y-4 bg-[#0d1829] select-text w-full"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#22c55e #0d1829' }}
                  >
                    {/* Header Scheda Cliente (Senza riquadrino "CLIENTE ATTIVO") */}
                    <div className="p-4 rounded-xl bg-[#112036] border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-xl font-black text-white">
                            {currentClient.name}
                          </h2>
                        </div>
                        <p className="text-sm md:text-base text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                          <span>Settore:</span>
                          <strong className="text-white font-black bg-sky-950/90 text-sky-300 px-2.5 py-0.5 rounded-md border border-sky-600/40 text-sm">
                            {currentClient.industry}
                          </strong>
                          <span className="text-slate-500">•</span>
                          <span className="text-xs text-slate-400">ID CRM: {currentClient.id}</span>
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
                          <span className="text-sm font-black uppercase tracking-wider text-sky-400">
                            1. STORICO RICHIESTA & MOTIVO DEL PRIMO CONTATTO
                          </span>
                        </div>
                        <span className="text-xs md:text-sm text-slate-300 bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-600/30">
                          Data primo contatto: <strong className="text-sky-300 font-black text-sm">{currentClient.firstContact.date}</strong>
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="bg-[#0b1626] p-3.5 rounded-xl border border-white/10">
                          <span className="text-xs uppercase text-slate-400 block font-bold">Canale di Acquisizione</span>
                          <span className="font-black text-base text-sky-300 mt-1 block">{currentClient.firstContact.channel}</span>
                        </div>
                        <div className="sm:col-span-2 bg-[#0b1626] p-3.5 rounded-xl border border-white/10">
                          <span className="text-xs uppercase text-slate-400 block font-bold">Motivo & Richiesta Iniziale del Cliente</span>
                          <p className="text-slate-100 mt-1 text-sm md:text-base leading-relaxed font-semibold">
                            {currentClient.firstContact.notes}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Riquadro 2: L'Ultima Email (Anche Referente con Numero esteso subito sopra l'Email) */}
                    <div className="p-4 rounded-xl bg-[#0f2438] border border-emerald-500/30 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Mail size={18} className="text-emerald-400" />
                          <span className="text-sm font-black uppercase tracking-wider text-emerald-400">
                            2. L'ULTIMA EMAIL & REFERENTE AZIENDALE
                          </span>
                        </div>
                        <span className="text-xs md:text-sm text-slate-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-600/30">
                          Ricevuta il: <strong className="text-emerald-300 font-black text-sm">{currentClient.lastEmail.date}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="bg-[#091724] p-3.5 rounded-xl border border-white/10 space-y-2">
                          <span className="text-xs uppercase text-slate-400 block font-bold">Referente Aziendale Principale</span>
                          <div className="text-base md:text-lg font-black text-white">
                            {currentClient.contactPerson.name}
                          </div>
                          <div className="text-slate-200 text-xs md:text-sm">
                            Ruolo: <strong className="text-emerald-300 font-bold">{currentClient.contactPerson.role}</strong>
                          </div>
                          {/* Numero esteso subito sopra l'indirizzo email */}
                          {currentClient.phone && (
                            <div className="w-full px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 text-xs md:text-sm font-bold flex items-center gap-2">
                              <Phone size={14} className="text-emerald-400 shrink-0" />
                              <span>Tel: {currentClient.phone}</span>
                            </div>
                          )}
                          <div className="w-full px-3 py-1.5 rounded-lg bg-slate-900/90 border border-sky-700/40 text-cyan-300 text-xs md:text-sm font-bold flex items-center gap-2">
                            <Mail size={14} className="text-sky-400 shrink-0" />
                            <span className="truncate">Email: {currentClient.email}</span>
                          </div>
                        </div>

                        <div className="bg-[#091724] p-3.5 rounded-xl border border-white/10 space-y-2 flex flex-col justify-between">
                          <div>
                            <span className="text-xs uppercase text-slate-400 block font-bold">Oggetto Ultima Email</span>
                            <div className="font-bold text-slate-100 text-sm mt-0.5">
                              "{currentClient.lastEmail.subject}"
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
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
                          <span className="text-xs font-black uppercase tracking-wider text-[#fbbf24]">
                            3. L'ULTIMO CONTRATTO VIGENTE
                          </span>
                        </div>
                        <span className="text-[11px] text-amber-300 font-bold">
                          {currentClient.contract.code}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                        <div className="bg-[#0f1728] p-2.5 rounded-lg border border-white/5">
                          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Stato Contratto</span>
                          <span className="font-bold text-emerald-400 mt-0.5 block">{currentClient.contract.status}</span>
                        </div>
                        <div className="bg-[#0f1728] p-2.5 rounded-lg border border-white/5">
                          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Data Sottoscrizione</span>
                          <span className="font-bold text-slate-200 mt-0.5 block">{currentClient.contract.signedDate}</span>
                        </div>
                        <div className="bg-[#0f1728] p-2.5 rounded-lg border border-white/5">
                          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Valore Economico</span>
                          <span className="font-black text-[#fbbf24] mt-0.5 block">€ {currentClient.contract.amount.toLocaleString('it-IT')}</span>
                        </div>
                        <div className="bg-[#0f1728] p-2.5 rounded-lg border border-white/5">
                          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Fattura Collegata</span>
                          <span className=" font-bold text-cyan-300 mt-0.5 block">{currentClient.contract.invoiceNumber}</span>
                        </div>
                      </div>

                      <div className="bg-[#0f1728] p-3 rounded-lg border border-white/5 text-xs space-y-1">
                        <div>
                          <strong>File documentale:</strong> <span className=" text-slate-300">{currentClient.contract.fileName}</span> ({currentClient.contract.digitalFormat})
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
                          <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                            4. STORICO DELLA COLLABORAZIONE (TIMELINE PROGRESSIONE)
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-purple-300">
                          {currentClient.history.length} Tappe documentate
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {currentClient.history.map((h, i) => (
                          <div key={i} className="flex items-start gap-3 text-xs bg-[#0f1324] p-2.5 rounded-lg border border-white/5">
                            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-white text-[12px]">{h.step}</span>
                                <span className="text-[10.5px] text-slate-400">{h.date}</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-2.5 bg-black/80 backdrop-blur-md animate-fadeIn"
            onClick={() => setShowInvoiceMenuModal(false)}
          >
            <div
              className="w-[98.5vw] max-w-[98.5vw] h-[94vh] max-h-[94vh] rounded-2xl overflow-hidden shadow-2xl border border-[#d4af37]/60 bg-[#071325] text-slate-100 flex flex-col"
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
                    <p className="text-xs text-amber-200/70">
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
                  <span className="text-[10.5px] text-slate-400 block">Totale Fatturato Netto</span>
                  <span className="text-base font-black text-[#fbbf24] block mt-0.5">
                    € {totalNet.toLocaleString('it-IT')}
                  </span>
                  <span className="text-[10px] text-slate-400">Lordo IVA 22%: € {totalGross.toLocaleString('it-IT')}</span>
                </div>

                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 block">Totale Incassato</span>
                  <span className="text-base font-black text-emerald-400 block mt-0.5">
                    € {totalCollected.toLocaleString('it-IT')}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-300/80">81% del fatturato totale</span>
                </div>

                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 block">Da Saldare / In Sospeso</span>
                  <span className="text-base font-black text-amber-400 block mt-0.5">
                    € {totalPending.toLocaleString('it-IT')}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-300/80">{pendingCount} commesse aperte</span>
                </div>

                <div className="bg-[#0b1c36] p-3 rounded-xl border border-[#d4af37]/20">
                  <span className="text-[10.5px] text-slate-400 block">Stato Fiscale SDI</span>
                  <span className="text-base font-black text-cyan-300 block mt-0.5">
                    11 Validate
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">0 scarti • 100% compliant</span>
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
                            <span className="text-sm font-bold text-[#fbbf24] group-hover:underline">
                              {inv.number}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">
                              Emessa: {inv.date}
                            </span>
                            {inv.contractCode && (
                              <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                                {inv.contractCode}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-sm font-black text-[#fbbf24]">
                                € {(inv.amount || 0).toLocaleString('it-IT')}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 block">
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
                            <span className={`text-[11px] ${isPaid ? 'text-slate-400' : 'text-amber-300 font-bold'}`}>
                              Scadenza: {inv.dueDate}
                            </span>
                            <span className="text-[10.5px] text-slate-400">
                              • {inv.paymentMethod}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isPaid ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkInvoicePaid(inv.id || inv.number)
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                                title="Segna questa fattura come saldata al 100%"
                              >
                                ✓ Segna Saldato
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUnmarkInvoicePaid(inv.id || inv.number)
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer border border-amber-400/40"
                                title="Annulla il saldo 100% e ripristina la fattura come da saldare"
                              >
                                ↺ Annulla Saldo
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

      {/* Modale Rubrica Collaboratori Estrapolati dalle Aziende */}
      <CollaboratorsModal
        isOpen={showCollaboratorsModal}
        onClose={() => {
          setShowCollaboratorsModal(false)
          fetch('/api/crm/collaborators')
            .then(res => res.json())
            .then(data => {
              if (data && data.collaborators && data.collaborators.length > 0) {
                const list = data.collaborators.map(c => ({
                  referent: c.name || 'Referente',
                  company: c.companyName || 'Azienda',
                  dayDate: c.lastContactDayDate || (c.lastContact ? `Data: ${c.lastContact}` : 'Recente'),
                  how: c.lastContactHow || (c.mobile ? 'Call WhatsApp / Cellulare' : 'Email / Ufficio'),
                  why: c.lastContactWhy || c.notes || 'Allineamento operativo sulle produzioni DADO.',
                }))
                setContactPostIts(list)
                setCollaboratorsCount(data.collaborators.length)
              }
            })
            .catch(() => {})
        }}
        onCountChange={(cnt) => setCollaboratorsCount(cnt)}
      />

      </div>
    </div>
  )
}


