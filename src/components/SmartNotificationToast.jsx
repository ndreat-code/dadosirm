import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Sparkles,
  Clock,
  Send,
  Video,
  X,
  Bot,
  ExternalLink
} from 'lucide-react'

// Notifiche Intelligenti predefinite
export const INITIAL_SMART_NOTIFICATIONS = [
  {
    id: 'notif-1',
    category: 'inbound_lead',
    badge: '🌐 NUOVO CONTATTO INBOUND • SITO WEB',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400',
    title: 'Nuova Richiesta Preventivo: Ceramiche Sarde Srl',
    subtitle: 'Compilato modulo sito web • Spot TV & Drone 4K • Budget €8.500',
    time: '2 min fa',
    contactPerson: 'Ing. Roberto Ferri',
    phone: '+39 0536 908123',
    link: '/crm',
    actionLabel: 'Apri nel CRM & Invia',
    urgent: true,
  },
  {
    id: 'notif-5',
    category: 'ai_agent',
    badge: '✉ EMAIL AZIENDALE • «OGGI»',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-400',
    title: 'Elena Conti (Bottega Verde Srl): "mi serve la bozza oggi"',
    subtitle: 'Nel corpo della mail compare «oggi» • consegna bozza spot entro stasera',
    time: 'Adesso',
    contactPerson: 'Elena Conti',
    phone: '+39 051 4455667',
    link: '/crm',
    actionLabel: 'Apri Email',
    urgent: true,
  },
  {
    id: 'notif-6',
    category: 'ai_agent',
    badge: '✉ EMAIL AZIENDALE • «PIÙ TARDI»',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400',
    title: 'Luca Bernardi (Cantine Alto Adige): "ti richiamo più tardi"',
    subtitle: 'Nel corpo della mail compare «più tardi» • promemoria richiamata nel pomeriggio',
    time: 'Adesso',
    contactPerson: 'Luca Bernardi',
    phone: '+39 0471 223344',
    link: '/crm',
    actionLabel: 'Apri Email',
    urgent: false,
  },
  {
    id: 'notif-2',
    category: 'quote_expiring',
    badge: '⏱ IN SCADENZA (48h)',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400',
    title: 'Preventivo #2026-088 in scadenza: Officine Riva SpA',
    subtitle: 'Valore €5.000 • Inviato 5 gg fa • Necessario sollecito o rinnovo',
    time: '18 min fa',
    contactPerson: 'Dott. Marco Riva',
    phone: '+39 02 9988771',
    link: '/crm',
    actionLabel: 'Verifica Preventivo',
    urgent: true,
  },
  {
    id: 'notif-3',
    category: 'ai_agent',
    badge: '🤖 EMAIL CRM AGENT',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400',
    title: 'Email CRM Agent: 2 nuovi contatti estrapolati',
    subtitle: 'Posta sincronizzata: Sara Moretti (NextMedia Agency) pronta per CRM',
    time: '1 ora fa',
    contactPerson: 'Sara Moretti',
    phone: '+39 02 8765432',
    link: '/crm',
    actionLabel: 'Esamina Dati Email',
    urgent: false,
  },
  {
    id: 'notif-4',
    category: 'scheduled_call',
    badge: '🎥 CALL MEET IN PROGRAMMA',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400',
    title: 'Videocall conoscitiva con Fashion Brand Milano',
    subtitle: 'Oggi alle ore 16:30 • Approfondimento capsule collection video',
    time: 'Oggi 16:30',
    contactPerson: 'Matteo Colombo',
    phone: '+39 340 1122334',
    link: '/calendar',
    actionLabel: 'Apri Calendario',
    urgent: false,
  },
]

// Rileva nel corpo di una email le parole «oggi» / «più tardi» e costruisce la notifica
// (evento: window.dispatchEvent(new CustomEvent('dado-email-update', { detail: { from, company, subject, body, phone, link } })))
export function buildEmailTimingNotification({ from, company, subject, body, phone, link } = {}) {
  const text = String(body || '')
  const hasToday = /\boggi\b/i.test(text)
  const hasLater = /\bpi[uù] tardi\b/i.test(text)
  if (!hasToday && !hasLater) return null
  const keyword = hasToday ? 'OGGI' : 'PIÙ TARDI'
  return {
    id: `mail-${Date.now()}`,
    category: 'ai_agent',
    badge: `✉ EMAIL AZIENDALE • «${keyword}»`,
    badgeColor: hasToday
      ? 'bg-orange-500/20 text-orange-300 border-orange-400'
      : 'bg-sky-500/20 text-sky-300 border-sky-400',
    title: `${from || 'Referente'}${company ? ` (${company})` : ''}: ${subject || 'nuova email'}`,
    subtitle: `Nel corpo della mail compare «${keyword.toLowerCase()}»`,
    time: 'Adesso',
    contactPerson: from || 'Referente',
    phone: phone || '',
    link: link || '/crm',
    actionLabel: 'Apri Email',
    urgent: hasToday,
  }
}

// Notifica per nuovo contatto inbound dal sito web
// (evento: window.dispatchEvent(new CustomEvent('dado-inbound-contact', { detail: { name, company, message, phone, link } })))
export function buildInboundNotification({ name, company, message, phone, link } = {}) {
  return {
    id: `inb-${Date.now()}`,
    category: 'inbound_lead',
    badge: '🌐 NUOVO CONTATTO INBOUND • SITO WEB',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400',
    title: `Nuovo contatto dal sito: ${name || 'Sconosciuto'}${company ? ` (${company})` : ''}`,
    subtitle: message || 'Compilato il modulo contatti del sito web',
    time: 'Adesso',
    contactPerson: name || 'Referente',
    phone: phone || '',
    link: link || '/crm',
    actionLabel: 'Apri nel CRM',
    urgent: true,
  }
}

const DADO_TOAST_SCHEDULE_KEY = 'dado_crm_smart_toast_schedule_v1'

function isDashboardRoute(pathname = '') {
  return (
    pathname === '/' ||
    pathname === '' ||
    pathname === '/dashboard-a' ||
    pathname === '/dashboard-b'
  )
}

function isCrmRoute(pathname = '') {
  return pathname === '/crm' || pathname.startsWith('/crm/')
}

function getLocalTodayKey(now = new Date()) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isAfter14(now = new Date()) {
  return now.getHours() >= 14
}

function loadScheduleState(initialPathname = '/') {
  const now = new Date()
  const today = getLocalTodayKey(now)
  const onDash = isDashboardRoute(initialPathname)
  const onCrm = isCrmRoute(initialPathname)
  const after14 = isAfter14(now)

  try {
    const raw = localStorage.getItem(DADO_TOAST_SCHEDULE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.date === today) {
        const firstDashboardCompleted = Boolean(parsed.firstDashboardCompleted)
        const crmTriggeredDashboard = Boolean(parsed.crmTriggeredDashboard) || (onCrm && after14)
        return {
          date: today,
          firstDashboardShown: Boolean(parsed.firstDashboardShown) || (onDash && !firstDashboardCompleted),
          firstDashboardCompleted,
          crmTriggeredDashboard,
          crmPopupActive: onCrm && after14 ? true : Boolean(parsed.crmPopupActive),
          crmReappearedOnDashboard:
            Boolean(parsed.crmReappearedOnDashboard) || (onDash && crmTriggeredDashboard),
        }
      }
    }
  } catch {}

  // Nuovo giorno (dopo le 00:00) o primo ingresso assoluto della giornata
  return {
    date: today,
    firstDashboardShown: onDash,
    firstDashboardCompleted: false,
    crmTriggeredDashboard: onCrm && after14,
    crmPopupActive: onCrm && after14,
    crmReappearedOnDashboard: false,
  }
}

function saveScheduleState(state) {
  try {
    localStorage.setItem(DADO_TOAST_SCHEDULE_KEY, JSON.stringify(state))
  } catch {}
}

export default function SmartNotificationToast() {
  const navigate = useNavigate()
  const location = useLocation()
  // Slot nella Dashboard (spazio libero accanto a "Go get it today"); se assente → fixed in alto a destra
  const [slotEl, setSlotEl] = useState(null)
  const [queue, setQueue] = useState(INITIAL_SMART_NOTIFICATIONS)
  const [index, setIndex] = useState(0)
  const currentNotif = queue[index] || queue[0]

  const [schedule, setSchedule] = useState(() => {
    const initial = loadScheduleState(
      typeof window !== 'undefined' ? window.location.pathname : location.pathname
    )
    saveScheduleState(initial)
    return initial
  })

  // Eventuale apertura manuale (es. click su pulsante "Notifiche Smart" in topbar o nuova notifica live)
  const [manualVisible, setManualVisible] = useState(false)

  const prevPathRef = useRef(location.pathname)

  const isDash = isDashboardRoute(location.pathname)
  const isCrm = isCrmRoute(location.pathname)

  // Determina se il pop-up deve essere visibile:
  // Appare ESCLUSIVAMENTE nella voce Dashboard:
  // 1) Al primo ingresso dopo le 00:00 (!firstDashboardCompleted)
  // 2) Nel corso della giornata, dopo le ore 14:00, se l'utente è passato nella voce CRM (crmTriggeredDashboard)
  // 3) Se aperto manualmente dall'utente mentre si trova nella Dashboard
  // Tutte le altre voci sono escluse.
  const isVisible = Boolean(
    isDash && (!schedule.firstDashboardCompleted || schedule.crmTriggeredDashboard || manualVisible)
  )

  // Aggiorna la variabile globale sincronamente per evitare layout shift in Dashboard
  if (typeof window !== 'undefined') {
    window.__dadoSmartToastVisible = isVisible
  }

  // Gestione transizioni di rotta (Dashboard <-> CRM <-> Altre voci escluse)
  useEffect(() => {
    const prevPath = prevPathRef.current
    const currPath = location.pathname
    if (prevPath === currPath) return
    prevPathRef.current = currPath

    const wasDash = isDashboardRoute(prevPath)
    const nowDash = isDashboardRoute(currPath)
    const wasCrm = isCrmRoute(prevPath)
    const nowCrm = isCrmRoute(currPath)
    const now = new Date()
    const today = getLocalTodayKey(now)
    const after14 = isAfter14(now)

    setManualVisible(false)

    setSchedule((prev) => {
      // Se nel frattempo è scattata la mezzanotte (00:00), resetta lo stato giornaliero
      const base =
        prev.date === today
          ? { ...prev }
          : {
              date: today,
              firstDashboardShown: false,
              firstDashboardCompleted: false,
              crmTriggeredDashboard: false,
              crmPopupActive: false,
              crmReappearedOnDashboard: false,
            }

      // Uscita dalla Dashboard: se il pop-up del primo ingresso o quello riapparso post-CRM era stato mostrato, segna come completato
      if (wasDash && !nowDash) {
        if (base.firstDashboardShown && !base.firstDashboardCompleted) {
          base.firstDashboardCompleted = true
        }
        if (base.crmTriggeredDashboard && base.crmReappearedOnDashboard) {
          base.crmTriggeredDashboard = false
          base.crmReappearedOnDashboard = false
        }
      }

      // Ingresso nella voce CRM dopo le ore 14:00: prenota la riapparizione del pop-up nella Dashboard
      if (!wasCrm && nowCrm && after14) {
        base.crmTriggeredDashboard = true
        base.crmReappearedOnDashboard = false
      }

      // Ingresso nella voce Dashboard
      if (!wasDash && nowDash) {
        if (!base.firstDashboardCompleted) {
          base.firstDashboardShown = true
        }
        if (base.crmTriggeredDashboard) {
          base.crmReappearedOnDashboard = true
        }
      }

      saveScheduleState(base)
      return base
    })
  }, [location.pathname])

  // Controllo periodico del cambio giorno (dopo le 00:00) a sessione aperta
  useEffect(() => {
    const checkClock = () => {
      const now = new Date()
      const today = getLocalTodayKey(now)
      setSchedule((prev) => {
        if (prev.date !== today) {
          const onDash = isDashboardRoute(window.location.pathname)
          const onCrm = isCrmRoute(window.location.pathname)
          const after14 = isAfter14(now)
          const resetState = {
            date: today,
            firstDashboardShown: onDash,
            firstDashboardCompleted: false,
            crmTriggeredDashboard: onCrm && after14,
            crmPopupActive: onCrm && after14,
            crmReappearedOnDashboard: false,
          }
          saveScheduleState(resetState)
          return resetState
        }
        return prev
      })
    }
    const timer = setInterval(checkClock, 15000)
    return () => clearInterval(timer)
  }, [])

  // Sincronizza lo stato globale con la Dashboard (per l'accorciamento di Calendar Week)
  useEffect(() => {
    const activeOnDashboard = Boolean(isDash && isVisible)
    if (typeof window !== 'undefined') {
      window.__dadoSmartToastVisible = activeOnDashboard
    }
    window.dispatchEvent(
      new CustomEvent('dado-smart-toast-state', { detail: { isVisible: activeOnDashboard } })
    )
  }, [isDash, isVisible, slotEl])

  // Risponde alle richieste di stato sincrono dalla Dashboard
  useEffect(() => {
    const handleRequest = () => {
      const activeOnDashboard = Boolean(isDash && isVisible)
      window.dispatchEvent(
        new CustomEvent('dado-smart-toast-state', { detail: { isVisible: activeOnDashboard } })
      )
    }
    window.addEventListener('dado-request-smart-toast-state', handleRequest)
    return () => window.removeEventListener('dado-request-smart-toast-state', handleRequest)
  }, [isDash, isVisible])

  // Gestione chiusura utente (X, ESC o click azione)
  const handleClose = () => {
    setManualVisible(false)
    setSchedule((prev) => {
      const next = { ...prev }
      if (isDashboardRoute(window.location.pathname)) {
        next.firstDashboardCompleted = true
        next.crmTriggeredDashboard = false
        next.crmReappearedOnDashboard = false
      } else if (isCrmRoute(window.location.pathname)) {
        // Chiude nella vista CRM ma preserva crmTriggeredDashboard così riappare comunque tornando in Dashboard
        next.crmPopupActive = false
      }
      saveScheduleState(next)
      return next
    })
    if (typeof window !== 'undefined') {
      window.__dadoSmartToastVisible = false
    }
    window.dispatchEvent(new CustomEvent('dado-smart-toast-state', { detail: { isVisible: false } }))
  }

  useEffect(() => {
    // Al login verifica se siamo in Dashboard al primo ingresso
    const handleLogin = () => {
      setSchedule((prev) => {
        const now = new Date()
        const today = getLocalTodayKey(now)
        if (prev.date !== today) {
          const fresh = loadScheduleState(window.location.pathname)
          saveScheduleState(fresh)
          return fresh
        }
        return prev
      })
    }

    // Nuova notifica in testa alla coda
    const pushNotif = (item) => {
      setQueue((prev) => [item, ...prev])
      setIndex(0)
      if (isDashboardRoute(window.location.pathname) || isCrmRoute(window.location.pathname)) {
        setManualVisible(true)
      }
    }

    // Email aziendali con «oggi» / «più tardi» nel corpo e nuovi contatti inbound dal sito
    const handleEmailUpdate = (e) => {
      const item = buildEmailTimingNotification(e?.detail)
      if (item) pushNotif(item)
    }
    const handleInbound = (e) => {
      if (e?.detail) pushNotif(buildInboundNotification(e.detail))
    }

    // Ascolta eventi per nuove notifiche dinamiche
    const handleNewNotif = (e) => {
      if (e?.detail) {
        const item = {
          id: `dyn-${Date.now()}`,
          category: e.detail.category || 'inbound_lead',
          badge: e.detail.badge || '✦ NOTIFICA INTELLIGENTE',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400',
          title: e.detail.title || 'Nuovo evento CRM registrato',
          subtitle: e.detail.subtitle || 'Dati sincronizzati in tempo reale',
          time: 'Adesso',
          contactPerson: e.detail.contactPerson || 'Referente',
          phone: e.detail.phone || '',
          link: e.detail.link || '/crm',
          actionLabel: e.detail.actionLabel || 'Apri Dettaglio',
          urgent: true,
        }
        pushNotif(item)
      }
    }

    const handleToggle = (e) => {
      if (!isDashboardRoute(window.location.pathname) && !isCrmRoute(window.location.pathname)) {
        return
      }
      if (e?.detail?.show !== undefined) {
        setManualVisible(Boolean(e.detail.show))
      } else {
        setManualVisible((prev) => !prev)
      }
    }

    window.addEventListener('dado-smart-notification-login', handleLogin)
    window.addEventListener('dado-smart-notification', handleNewNotif)
    window.addEventListener('dado-toggle-notifications', handleToggle)
    window.addEventListener('dado-email-update', handleEmailUpdate)
    window.addEventListener('dado-inbound-contact', handleInbound)

    return () => {
      window.removeEventListener('dado-smart-notification-login', handleLogin)
      window.removeEventListener('dado-smart-notification', handleNewNotif)
      window.removeEventListener('dado-toggle-notifications', handleToggle)
      window.removeEventListener('dado-email-update', handleEmailUpdate)
      window.removeEventListener('dado-inbound-contact', handleInbound)
    }
  }, [])

  // Trova lo slot della Dashboard (cambia con la rotta; il polling copre il montaggio ritardato)
  useEffect(() => {
    if (!isDash) {
      setSlotEl(null)
      return undefined
    }
    const find = () => setSlotEl(document.getElementById('dado-toast-slot'))
    find()
    const id = setInterval(find, 250)
    return () => clearInterval(id)
  }, [location.pathname, isDash])

  // ESC chiude la notifica; tasti direzionali (← → ↑ ↓) sfogliano le notifiche
  useEffect(() => {
    if (!isVisible) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setIndex((i) => (i + 1) % queue.length)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setIndex((i) => (i - 1 + queue.length) % queue.length)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isVisible, queue.length])

  if (!isVisible) {
    return null
  }

  const toast = (
    <div
      className={
        slotEl
          ? 'absolute top-0 left-0 z-[60] pointer-events-auto select-none animate-fadeIn'
          : 'fixed top-4 right-4 z-50 pointer-events-auto select-none animate-fadeIn'
      }
      style={{
        // Nello slot occupa lo spazio reso disponibile dall'accorciamento di Calendar Week; altrove larghezza fissa
        width: slotEl ? '440px' : '500px',
        height: slotEl ? 'calc(4cm - 12px)' : 'auto',
        maxWidth: 'calc(100vw - 2rem)',
        fontFamily: '"Switzer", sans-serif'
      }}
    >
      {/* ── RIQUADRO NOTIFICHE SMART CON BORDI RIGOROSAMENTE QUADRATI (rounded-none) ── */}
      {/* Riempito con lo stesso colore della cornice (Verde Acqua di Sardegna / Teal profondo) */}
      <div
        className="rounded-none text-white border-2 border-teal-400 relative overflow-hidden flex flex-col h-full shadow-2xl"
        style={{
          borderRadius: '0px',
          backgroundColor: '#092b27',
          borderColor: '#2dd4bf',
          borderRight: '4px solid #2dd4bf',
          boxShadow: '16px 0 32px -4px rgba(0, 0, 0, 0.9), 6px 0 16px rgba(45, 212, 191, 0.45), inset -2px 0 2px rgba(255, 255, 255, 0.35)',
        }}
      >
        {/* Barra decorativa superiore quadrata: Acqua Verde Sardegna, Perla e Blu Notte */}
        <div
          className="h-1 w-full rounded-none flex-shrink-0"
          style={{
            background: 'linear-gradient(90deg, #10b981 0%, #2dd4bf 28%, #ffffff 50%, #3b82f6 75%, #1e40af 100%)',
            borderRadius: '0px',
          }}
        />

        {/* ── LATO DESTRO DELIMITATO: Bordo verticale luminescente per staccare nettamente il pop-up ── */}
        <div
          className="absolute top-0 right-0 bottom-0 w-[4px] pointer-events-none z-30"
          style={{
            background: 'linear-gradient(180deg, #2dd4bf 0%, #ffffff 40%, #7dd3fc 75%, #38bdf8 100%)',
            boxShadow: '2px 0 10px rgba(45, 212, 191, 0.75)',
          }}
        />

        <div className="px-2.5 pt-1.5 pb-2 flex flex-col flex-1 min-h-0 justify-between">
          <div className="min-h-0">
            {/* Header con Badge Squadrato e Tasto Chiudi (senza countdown numerico) */}
            <div className="flex items-center justify-between gap-1.5">
              <span
                className={`text-[13px] font-black uppercase tracking-wide px-2 py-0.5 border rounded-none truncate min-w-0 ${currentNotif.badgeColor}`}
                style={{ borderRadius: '0px' }}
                title={`${currentNotif.badge} • ${currentNotif.time}`}
              >
                {currentNotif.badge}
              </span>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-slate-300 hover:text-white p-0.5 hover:bg-white/10 transition-colors cursor-pointer rounded-none"
                  style={{ borderRadius: '0px' }}
                  title="Chiudi adesso (ESC)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Titolo e Dettagli */}
            <h4 className="text-[16px] font-bold text-white tracking-tight leading-snug mt-1.5 line-clamp-1">
              {currentNotif.title}
            </h4>
            <p className="text-[13px] text-teal-100 mt-0.5 leading-snug line-clamp-1 font-medium">
              {currentNotif.subtitle}
            </p>
          </div>

          <div>
            {/* Azioni Rapide con Bordi Quadrati */}
            <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-teal-800/80">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleClose()
                    if (currentNotif.link) navigate(currentNotif.link)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold transition-all cursor-pointer hover:brightness-110 active:scale-95 shadow-sm rounded-none whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
                    color: '#ffffff',
                    borderRadius: '0px',
                    fontFamily: '"Switzer", sans-serif',
                  }}
                >
                  <Send size={13} />
                  <span>{currentNotif.actionLabel}</span>
                </button>
              </div>

              {/* ── COMUNICAZIONE TASTI DIREZIONALI: Riquadro chiaro "tasti <-- e --> per muoverti" con frecce a 16px ── */}
              <div
                className="ml-auto flex items-center gap-1.5 self-center select-none px-2.5 py-1 border border-teal-400 rounded-none shadow-xs shrink-0"
                style={{
                  backgroundColor: '#134e4a',
                  borderColor: '#2dd4bf',
                  borderRadius: '0px',
                }}
              >
                <span
                  className="text-[12.5px] font-bold text-slate-100 tracking-tight whitespace-nowrap"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  tasti
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIndex((i) => (i - 1 + queue.length) % queue.length)
                  }}
                  className="w-6 h-6 flex items-center justify-center bg-teal-800/90 hover:bg-teal-400 hover:text-slate-950 text-teal-200 border border-teal-400/80 font-black text-[16px] cursor-pointer transition-all active:scale-90 select-none"
                  style={{ borderRadius: '0px', fontFamily: '"Switzer", sans-serif' }}
                  title="Tasto freccia ← o ↑"
                >
                  ←
                </button>
                <span
                  className="text-[12.5px] font-bold text-slate-100 tracking-tight whitespace-nowrap"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  e
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIndex((i) => (i + 1) % queue.length)
                  }}
                  className="w-6 h-6 flex items-center justify-center bg-teal-800/90 hover:bg-teal-400 hover:text-slate-950 text-teal-200 border border-teal-400/80 font-black text-[16px] cursor-pointer transition-all active:scale-90 select-none"
                  style={{ borderRadius: '0px', fontFamily: '"Switzer", sans-serif' }}
                  title="Tasto freccia → o ↓"
                >
                  →
                </button>
                <span
                  className="text-[12.5px] font-bold text-slate-100 tracking-tight whitespace-nowrap"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  per muoverti
                </span>
                <span
                  className="ml-1 text-[11.5px] font-black text-teal-200 bg-teal-950 px-1.5 py-0.5 border border-teal-400/80 leading-none whitespace-nowrap"
                  style={{ borderRadius: '0px', fontFamily: '"Switzer", sans-serif' }}
                >
                  {index + 1}/{queue.length}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )

  // Nello spazio libero accanto a "Go get it today" (Dashboard); altrove in alto a destra
  return slotEl ? createPortal(toast, slotEl) : toast
}
