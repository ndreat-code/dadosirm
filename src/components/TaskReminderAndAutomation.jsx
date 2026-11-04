import { useState, useEffect } from 'react'
import {
  Bell,
  BellOff,
  Zap,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Mail,
  RefreshCw,
  TrendingUp,
  UserX,
  Globe,
  Link2,
  Share2,
  ShoppingCart,
  Send,
  CalendarCheck,
  Check,
  Play,
} from 'lucide-react'

// ── DEFINIZIONE CAUSE (TRIGGER) RICHIESTE DALL'UTENTE ──
export const AUTOMATION_CAUSES = [
  {
    id: 'email',
    label: 'Email (Ricezione / Risposta)',
    shortLabel: 'Email',
    icon: Mail,
    color: '#0284c7',
    bg: '#e0f2fe',
    description: 'Ricezione di una nuova email o risposta dal cliente',
  },
  {
    id: 'cambio_pipeline',
    label: 'Cambio pipeline',
    shortLabel: 'Cambio pipeline',
    icon: RefreshCw,
    color: '#8b5cf6',
    bg: '#f3e8ff',
    description: 'Avanzamento o modifica dello stato della trattativa',
  },
  {
    id: 'modifica_valore_offerta',
    label: 'Modifica valore offerta',
    shortLabel: 'Modifica valore',
    icon: TrendingUp,
    color: '#f59e0b',
    bg: '#fef3c7',
    description: 'Aggiornamento del budget, delibera o valore preventivo',
  },
  {
    id: 'annulla_iscrizione_lista',
    label: 'Annulla iscrizione da lista',
    shortLabel: 'Disiscrizione',
    icon: UserX,
    color: '#ef4444',
    bg: '#fee2e2',
    description: 'Il contatto richiede opt-out o disiscrizione dalla mailing list',
  },
  {
    id: 'pagina_web_visitata',
    label: 'Pagina web visitata',
    shortLabel: 'Visita web',
    icon: Globe,
    color: '#06b6d4',
    bg: '#cffafe',
    description: 'Tracciamento visita su landing page o portfolio video DADO',
  },
  {
    id: 'link_interno_email',
    label: 'Link interno di una email',
    shortLabel: 'Click link email',
    icon: Link2,
    color: '#10b981',
    bg: '#d1fae5',
    description: 'Click effettuato su link tracciato o allegato all\'interno dell\'email',
  },
  {
    id: 'condividi_inoltra_email',
    label: 'Condividi-inoltra email',
    shortLabel: 'Inoltro email',
    icon: Share2,
    color: '#6366f1',
    bg: '#e0e7ff',
    description: 'Inoltro o condivisione dell\'email a colleghi o direzione',
  },
  {
    id: 'effettua_acquisto',
    label: 'Effettua acquisto',
    shortLabel: 'Acquisto / Firma',
    icon: ShoppingCart,
    color: '#16a34a',
    bg: '#dcfce7',
    description: 'Firma digitale del contratto o approvazione ordine di produzione',
  },
]

// ── DEFINIZIONE EFFETTI (AZIONI) RICHIESTI DALL'UTENTE ──
export const AUTOMATION_EFFECTS = [
  {
    id: 'invia_calendario',
    label: 'Invia calendario per presa appuntamento',
    shortLabel: 'Invia calendario appuntamento',
    icon: CalendarCheck,
    color: '#0284c7',
    bg: '#e0f2fe',
    description: 'Invia automaticamente il link calendario DADO per fissare data e ora della call',
  },
  {
    id: 'invia_followup_call',
    label: 'Invia email di follow up post call',
    shortLabel: 'Email follow up post call',
    icon: Send,
    color: '#8b5cf6',
    bg: '#f3e8ff',
    description: 'Genera ed invia il recap personalizzato degli accordi presi post-chiamata',
  },
  {
    id: 'both',
    label: 'Entrambi (Calendario + Follow up post call)',
    shortLabel: 'Calendario + Follow up',
    icon: Sparkles,
    color: '#059669',
    bg: '#d1fae5',
    description: 'Esegue entrambe le azioni in sequenza automatizzata',
  },
]

// Opzioni di preavviso per il promemoria
export const ADVANCE_NOTICE_OPTIONS = [
  { id: 'al_momento', label: 'Al momento dell\'evento' },
  { id: '15_min', label: '15 minuti prima' },
  { id: '30_min', label: '30 minuti prima' },
  { id: '1_ora', label: '1 ora prima' },
  { id: '1_giorno', label: '1 giorno prima' },
]

// Canali di notifica
export const REMINDER_CHANNELS = [
  { id: 'dashboard_toast', label: 'Notifica DADO CRM' },
  { id: 'email', label: 'Email automatica' },
  { id: 'whatsapp', label: 'WhatsApp' },
]

export default function TaskReminderAndAutomation({
  activity,
  onUpdateActivity,
  compact = false,
  isNotion = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Inizializzazione stati locali con fallback su valori esistenti o predefiniti
  const initialReminder = activity.reminder || {
    enabled: true,
    date: activity.date || new Date().toISOString().split('T')[0],
    time: activity.time || '10:00',
    advanceNotice: '15_min',
    channel: 'dashboard_toast',
    notified: false,
  }

  const initialAutomation = activity.automation || {
    enabled: true,
    cause: 'email',
    causeLabel: 'Email (Ricezione / Risposta)',
    effect: 'invia_calendario',
    effectLabel: 'Invia calendario per presa appuntamento',
    status: 'active',
    lastTriggered: null,
  }

  const [reminder, setReminder] = useState(initialReminder)
  const [automation, setAutomation] = useState(initialAutomation)

  useEffect(() => {
    if (activity.reminder) {
      setReminder(activity.reminder)
    }
    if (activity.automation) {
      setAutomation(activity.automation)
    }
  }, [activity.id, activity.reminder, activity.automation])

  // Salva le modifiche sul server e aggiorna il task
  const saveChanges = async (newRem, newAuto) => {
    const remToSave = newRem !== undefined ? newRem : reminder
    const autoToSave = newAuto !== undefined ? newAuto : automation
    setReminder(remToSave)
    setAutomation(autoToSave)

    if (onUpdateActivity) {
      await onUpdateActivity(activity.id, {
        reminder: remToSave,
        automation: autoToSave,
      })
    }
  }

  // Toggle abilitazione Promemoria
  const toggleReminder = (e) => {
    e.stopPropagation()
    const updated = { ...reminder, enabled: !reminder.enabled }
    saveChanges(updated, automation)
    showToast(updated.enabled ? 'Promemoria attivato' : 'Promemoria disattivato')
  }

  // Toggle abilitazione Automazione
  const toggleAutomation = (e) => {
    e.stopPropagation()
    const updated = {
      ...automation,
      enabled: !automation.enabled,
      status: !automation.enabled ? 'active' : 'disabled',
    }
    saveChanges(reminder, updated)
    showToast(updated.enabled ? 'Automazione attivata' : 'Automazione sospesa')
  }

  // Aggiornamento causa automazione
  const handleCauseChange = (causeId) => {
    const found = AUTOMATION_CAUSES.find((c) => c.id === causeId)
    const updated = {
      ...automation,
      cause: causeId,
      causeLabel: found ? found.label : causeId,
    }
    saveChanges(reminder, updated)
  }

  // Aggiornamento effetto automazione
  const handleEffectChange = (effectId) => {
    const found = AUTOMATION_EFFECTS.find((e) => e.id === effectId)
    const updated = {
      ...automation,
      effect: effectId,
      effectLabel: found ? found.label : effectId,
    }
    saveChanges(reminder, updated)
  }

  // Simulazione / Test di esecuzione automazione
  const handleTestAutomation = async (e) => {
    e.stopPropagation()
    setIsTesting(true)

    // Simulazione esecuzione
    setTimeout(async () => {
      const nowStr = new Date().toLocaleDateString('it-IT') + ' ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      const updatedAuto = {
        ...automation,
        lastTriggered: nowStr,
      }
      setAutomation(updatedAuto)
      setIsTesting(false)

      const effectObj = AUTOMATION_EFFECTS.find((eff) => eff.id === automation.effect)
      showToast(`Automazione completata: ${effectObj ? effectObj.shortLabel : 'Azione eseguita'} per ${activity.company || 'il cliente'}!`)

      if (onUpdateActivity) {
        await onUpdateActivity(activity.id, {
          automation: updatedAuto,
        })
      }
    }, 600)
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Causa ed Effetto correnti per le icone e i colori
  const currentCause = AUTOMATION_CAUSES.find((c) => c.id === automation.cause) || AUTOMATION_CAUSES[0]
  const currentEffect = AUTOMATION_EFFECTS.find((e) => e.id === automation.effect) || AUTOMATION_EFFECTS[0]
  const CauseIcon = currentCause.icon
  const EffectIcon = currentEffect.icon

  return (
    <div
      className="mt-2.5 pt-2 border-t border-slate-100 select-none"
      style={{ fontFamily: '"Switzer", sans-serif' }}
    >
      {/* Toast Notifica Rapida interna al task */}
      {toastMessage && (
        <div className="mb-2 p-2 rounded-lg bg-slate-900 text-slate-200 text-[15px] font-bold border border-slate-500/50 flex items-center justify-between gap-2 animate-fadeIn shadow-md">
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ── BARRA COMPATTA: PROMEMORIA & AUTOMAZIONE VISIBILI AL VOLO SULLA CARD ── */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Pill Promemoria */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className={`px-2 py-1 rounded-lg text-[14px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              reminder.enabled
                ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                : 'bg-slate-100/80 text-slate-500 border-slate-200 hover:bg-slate-200/80'
            }`}
            title="Clicca per aprire la gestione del promemoria e dell'automazione"
          >
            {reminder.enabled ? (
              <Bell className="w-3 h-3 text-slate-600" />
            ) : (
              <BellOff className="w-3 h-3 text-slate-400" />
            )}
            <span>
              {reminder.enabled
                ? `Promemoria: ${reminder.date ? reminder.date.split('-').reverse().slice(0, 2).join('/') : ''} ${reminder.time || '10:00'}`
                : 'Nessun promemoria'}
            </span>
          </button>

          {/* Pill Automazione Causa → Effetto */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className={`px-2 py-1 rounded-lg text-[14px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              automation.enabled
                ? 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
            title={`Automazione: Causa [${currentCause.shortLabel}] → Effetto [${currentEffect.shortLabel}]`}
          >
            <Zap className={`w-3 h-3 ${automation.enabled ? 'text-slate-500' : 'text-slate-400'}`} />
            <span className="truncate max-w-[190px] sm:max-w-none">
              {automation.enabled
                ? `${currentCause.shortLabel} → ${currentEffect.shortLabel}`
                : 'Automazione disattiva'}
            </span>
          </button>
        </div>

        {/* Pulsante Espandi / Comprimi Dettagli */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors ml-auto flex items-center gap-0.5 text-[15px] font-semibold"
          title={isExpanded ? 'Riduci impostazioni promemoria ed automazione' : 'Espandi e configura promemoria ed automazione'}
        >
          <span className="text-[13px] uppercase font-bold text-slate-500 hidden sm:inline">
            {isExpanded ? 'Chiudi' : 'Configura'}
          </span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── PANNELLO ESPANSO: CONFIGURAZIONE PROMEMORIA ED AUTOMAZIONE ── */}
      {isExpanded && (
        <div
          className="mt-2.5 p-3 rounded-xl bg-slate-50/90 border border-slate-200 space-y-3.5 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ══ 1. SEZIONE PROMEMORIA ══ */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h5 className="text-[15px] font-black uppercase tracking-wider text-slate-900">
                    Promemoria Task
                  </h5>
                  <p className="text-[14px] text-slate-500 font-medium leading-none mt-0.5">
                    Avviso automatico prima della scadenza
                  </p>
                </div>
              </div>

              {/* Toggle switch Promemoria */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminder.enabled}
                  onChange={toggleReminder}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-slate-900"></div>
                <span className="ml-1.5 text-[14px] font-bold text-slate-700">
                  {reminder.enabled ? 'Attivo' : 'Spento'}
                </span>
              </label>
            </div>

            {reminder.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[15px]">
                {/* Data e Ora */}
                <div>
                  <label className="block text-[13.5px] font-bold text-slate-600 uppercase mb-1">
                    Data & Ora Avviso
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      value={reminder.date || ''}
                      onChange={(e) => {
                        const updated = { ...reminder, date: e.target.value }
                        saveChanges(updated, automation)
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[15px] text-slate-900 font-semibold focus:outline-none focus:border-slate-500"
                    />
                    <input
                      type="time"
                      value={reminder.time || '10:00'}
                      onChange={(e) => {
                        const updated = { ...reminder, time: e.target.value }
                        saveChanges(updated, automation)
                      }}
                      className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-1.5 py-1 text-[15px] text-slate-900 font-semibold focus:outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                {/* Preavviso */}
                <div>
                  <label className="block text-[13.5px] font-bold text-slate-600 uppercase mb-1">
                    Anticipo / Preavviso
                  </label>
                  <select
                    value={reminder.advanceNotice || '15_min'}
                    onChange={(e) => {
                      const updated = { ...reminder, advanceNotice: e.target.value }
                      saveChanges(updated, automation)
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[15px] text-slate-900 font-semibold focus:outline-none focus:border-slate-500"
                  >
                    {ADVANCE_NOTICE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Canale */}
                <div>
                  <label className="block text-[13.5px] font-bold text-slate-600 uppercase mb-1">
                    Canale Notifica
                  </label>
                  <select
                    value={reminder.channel || 'dashboard_toast'}
                    onChange={(e) => {
                      const updated = { ...reminder, channel: e.target.value }
                      saveChanges(updated, automation)
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[15px] text-slate-900 font-semibold focus:outline-none focus:border-slate-500"
                  >
                    {REMINDER_CHANNELS.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* ══ 2. SEZIONE AUTOMAZIONE: CAUSA → EFFETTO ══ */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h5 className="text-[15px] font-black uppercase tracking-wider text-slate-900">
                    Automazione workflow
                  </h5>
                  <p className="text-[14px] text-slate-500 font-medium leading-none mt-0.5">
                    Regola automatica di triggering CRM
                  </p>
                </div>
              </div>

              {/* Toggle switch Automazione */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={automation.enabled}
                  onChange={toggleAutomation}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-slate-900"></div>
                <span className="ml-1.5 text-[14px] font-bold text-slate-700">
                  {automation.enabled ? 'Attiva' : 'Sospesa'}
                </span>
              </label>
            </div>

            {automation.enabled && (
              <div className="space-y-3 pt-1">
                {/* Griglia Causa → Effetto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  
                  {/* CAUSA (TRIGGER) */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 mb-1.5 text-[15px] font-black uppercase tracking-wider text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center text-[13px]">1</span>
                      <span>Causa (Trigger):</span>
                    </div>

                    <select
                      value={automation.cause}
                      onChange={(e) => handleCauseChange(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[15px] text-slate-900 font-bold focus:outline-none focus:border-slate-500"
                    >
                      {AUTOMATION_CAUSES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>

                    <p className="mt-1 text-[14px] text-slate-500 italic leading-snug">
                      {currentCause.description}
                    </p>
                  </div>

                  {/* EFFETTO (AZIONE) */}
                  <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-200">
                    <div className="flex items-center gap-1.5 mb-1.5 text-[15px] font-black uppercase tracking-wider text-slate-900">
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center text-[13px]">2</span>
                      <span>Effetto (Azione):</span>
                    </div>

                    <select
                      value={automation.effect}
                      onChange={(e) => handleEffectChange(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[15px] text-slate-900 font-bold focus:outline-none focus:border-slate-600"
                    >
                      {AUTOMATION_EFFECTS.map((eff) => (
                        <option key={eff.id} value={eff.id}>
                          {eff.label}
                        </option>
                      ))}
                    </select>

                    <p className="mt-1 text-[14px] text-slate-800 italic leading-snug">
                      {currentEffect.description}
                    </p>
                  </div>

                </div>

                {/* Barra Esecuzione Test & Stato */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap text-[15px]">
                  <div className="text-[14px] text-slate-500">
                    {automation.lastTriggered ? (
                      <span className="text-slate-700 font-medium">
                        Ultima esecuzione automatica: <strong>{automation.lastTriggered}</strong>
                      </span>
                    ) : (
                      <span>In attesa che si verifichi la causa per {activity.company || 'questo task'}</span>
                    )}
                  </div>

                  {/* Pulsante Esegui Test Automazione */}
                  <button
                    type="button"
                    disabled={isTesting}
                    onClick={handleTestAutomation}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-[15px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    title="Esegui una simulazione dell'effetto su questo task"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Esecuzione in corso...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 " />
                        <span>Esegui test automazione</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
