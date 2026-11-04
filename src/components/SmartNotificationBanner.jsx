import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  Sparkles,
  Clock,
  Send,
  Phone,
  Video,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  ExternalLink,
  Bot,
  AlertTriangle
} from 'lucide-react'

// Elenco Notifiche Intelligenti predefinite basate su eventi CRM e form sito web
const DEFAULT_SMART_NOTIFICATIONS = [
  {
    id: 'notif-1',
    category: 'inbound_lead',
    badge: '✦ SMART LEAD INBOUND',
    badgeColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-400/50',
    title: 'Nuova Richiesta Preventivo: Ceramiche Sarde Srl',
    subtitle: 'Compilato modulo sito web • Spot TV & Drone 4K • Budget €8.500',
    time: '2 min fa',
    contactPerson: 'Ing. Roberto Ferri',
    phone: '+39 0536 908123',
    link: '/crm',
    actionLabel: 'Apri nel CRM & Invia',
    actionIcon: Send,
    urgent: true,
  },
  {
    id: 'notif-2',
    category: 'quote_expiring',
    badge: '⏱ IN SCADENZA (48h)',
    badgeColor: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-400/50',
    title: 'Preventivo #2026-088 in scadenza: Officine Riva SpA',
    subtitle: 'Valore €5.000 • Inviato 5 gg fa • Necessario sollecito o rinnovo',
    time: '18 min fa',
    contactPerson: 'Dott. Marco Riva',
    phone: '+39 02 9988771',
    link: '/crm',
    actionLabel: 'Verifica Preventivo',
    actionIcon: Clock,
    urgent: true,
  },
  {
    id: 'notif-3',
    category: 'ai_agent',
    badge: '🤖 EMAIL CRM AGENT',
    badgeColor: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-400/50',
    title: 'Email CRM Agent: 2 nuovi contatti estrapolati',
    subtitle: 'Posta in arrivo sincronizzata: Sara Moretti (NextMedia Agency) pronta per CRM',
    time: '1 ora fa',
    contactPerson: 'Sara Moretti',
    phone: '+39 02 8765432',
    link: '/crm',
    actionLabel: 'Esamina Dati Email',
    actionIcon: Bot,
    urgent: false,
  },
  {
    id: 'notif-4',
    category: 'scheduled_call',
    badge: '🎥 CALL MEET IN PROGRAMMA',
    badgeColor: 'from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-400/50',
    title: 'Videocall conoscitiva con Fashion Brand Milano',
    subtitle: 'Oggi alle ore 16:30 • Approfondimento capsule collection video',
    time: 'Oggi 16:30',
    contactPerson: 'Matteo Colombo',
    phone: '+39 340 1122334',
    link: '/calendar',
    actionLabel: 'Apri Calendario',
    actionIcon: Video,
    urgent: false,
  },
]

export default function SmartNotificationBanner() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(DEFAULT_SMART_NOTIFICATIONS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [autoShowToast, setAutoShowToast] = useState(true)
  const timerRef = useRef(null)

  // Ascolta eventi globali per triggerare o toggleare le notifiche
  useEffect(() => {
    function handleToggle(e) {
      if (e?.detail?.open !== undefined) {
        setIsOpen(e.detail.open)
      } else {
        setIsOpen(prev => !prev)
      }
    }

    function handleNewNotif(e) {
      if (e?.detail) {
        const item = {
          id: `dyn-${Date.now()}`,
          category: e.detail.category || 'inbound_lead',
          badge: e.detail.badge || '✦ NOTIFICA INTELLIGENTE',
          badgeColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-400/50',
          title: e.detail.title || 'Nuovo evento CRM registrato',
          subtitle: e.detail.subtitle || 'Dati sincronizzati in tempo reale',
          time: 'Adesso',
          contactPerson: e.detail.contactPerson || 'Referente',
          phone: e.detail.phone || '',
          link: e.detail.link || '/crm',
          actionLabel: e.detail.actionLabel || 'Apri Dettaglio',
          actionIcon: Send,
          urgent: true,
        }
        setNotifications(prev => [item, ...prev])
        setCurrentIndex(0)
        setIsOpen(true)
      }
    }

    window.addEventListener('dado-toggle-notifications', handleToggle)
    window.addEventListener('dado-smart-notification', handleNewNotif)
    return () => {
      window.removeEventListener('dado-toggle-notifications', handleToggle)
      window.removeEventListener('dado-smart-notification', handleNewNotif)
    }
  }, [])

  // Auto-rotazione ogni 8 secondi (se non in pausa hover ed aperta)
  useEffect(() => {
    if (!isOpen || isPaused || notifications.length <= 1) return

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % notifications.length)
    }, 8500)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isOpen, isPaused, notifications.length])

  const currentNotif = notifications[currentIndex] || notifications[0]

  function handleNext() {
    setCurrentIndex(prev => (prev + 1) % notifications.length)
  }

  function handlePrev() {
    setCurrentIndex(prev => (prev - 1 + notifications.length) % notifications.length)
  }

  function handleAction(notif) {
    if (notif.link) {
      navigate(notif.link)
    }
  }

  // Se è chiusa, mostra un piccolo badge pill centrale discreto che permette di riaprirla subito
  if (!isOpen) {
    return (
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-fadeIn">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-teal-500/40 hover:border-teal-400 text-white shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_12px_rgba(16,185,129,0.3)] backdrop-blur-md transition-all cursor-pointer select-none hover:scale-105 active:scale-95"
          title="Mostra notifiche intelligenti dall'alto"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold tracking-tight text-slate-200 group-hover:text-emerald-300">
            {notifications.length} Notifiche Intelligenti
          </span>
          <span className="text-[10px] font-semibold text-teal-400">↓</span>
        </button>
      </div>
    )
  }

  return (
    <div
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-auto transition-all duration-500 ease-out animate-slideDown"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* ── Banner Notifica Intelligente (affacciata dall'alto al basso) ── */}
      <div
        className="relative overflow-hidden rounded-2xl bg-slate-950/92 backdrop-blur-xl border border-teal-400/50 shadow-[0_12px_36px_rgba(0,0,0,0.65),0_0_20px_rgba(16,185,129,0.22),0_0_12px_rgba(30,64,175,0.25)] text-white transition-all select-none"
      >
        {/* Barra superiore decorativa a sfumatura: Acqua Verde di Sardegna (#10b981), Perla (#ffffff), Blu Notte Chiaro (#1e40af) */}
        <div
          className="h-1 w-full"
          style={{
            background: 'linear-gradient(90deg, #10b981 0%, #2dd4bf 25%, #ffffff 50%, #60a5fa 75%, #1e40af 100%)'
          }}
        />

        <div className="p-3 sm:p-3.5 flex items-start gap-3">
          {/* Icona Notifica Animata */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-blue-500/20 border border-teal-400/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Sparkles size={18} className="animate-pulse" />
            </div>
          </div>

          {/* Contenuto Notifica Intelligente */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-gradient-to-r ${currentNotif.badgeColor}`}
              >
                {currentNotif.badge}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Clock size={11} />
                {currentNotif.time}
              </span>
              {isPaused && (
                <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800">
                  in pausa
                </span>
              )}
            </div>

            <h4 className="text-xs sm:text-[13px] font-bold text-white tracking-tight leading-snug truncate">
              {currentNotif.title}
            </h4>

            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5 line-clamp-1">
              {currentNotif.subtitle}
            </p>

            {/* Pulsanti Azione e Contatto Rapido */}
            <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleAction(currentNotif)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
                }}
              >
                {currentNotif.actionIcon && <currentNotif.actionIcon size={12} />}
                <span>{currentNotif.actionLabel}</span>
              </button>

              {currentNotif.phone && (
                <a
                  href={`tel:${currentNotif.phone.replace(/[^0-9\+]/g, '')}`}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  title={`Chiama ${currentNotif.contactPerson}: ${currentNotif.phone}`}
                >
                  <Phone size={11} className="text-teal-400" />
                  <span className="hidden sm:inline">{currentNotif.phone}</span>
                  <span className="sm:hidden">Chiama</span>
                </a>
              )}

              <Link
                to="/crm"
                className="text-[10.5px] text-teal-400 hover:text-teal-300 font-bold ml-auto flex items-center gap-1 hover:underline"
              >
                <span>Tutti i lead</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Controlli Notifica (Prev / Next, Contatore, Chiudi) */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-1 border-l border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Nascondi notifica (si affaccia a comando)"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-1 mt-auto pt-1">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded text-slate-400 hover:text-teal-300 hover:bg-white/10 transition-colors cursor-pointer"
                title="Notifica precedente"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="text-[10px] font-bold text-slate-400 px-0.5">
                {currentIndex + 1}/{notifications.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded text-slate-400 hover:text-teal-300 hover:bg-white/10 transition-colors cursor-pointer"
                title="Notifica successiva"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
