import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Edit3,
  Search,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  SlidersHorizontal,
  X,
  Radio,
  Workflow,
  RotateCcw,
} from 'lucide-react'

const TRIGGER_OPTIONS = [
  { id: 'deal_won', label: 'Trattativa Vinta / Preventivo Firmato', category: 'commercial', desc: 'Quando un preventivo o trattativa commerciale passa allo stato Vinto' },
  { id: 'shooting_scheduled', label: 'Data di Ripresa Fissata a Calendario', category: 'production', desc: 'Quando viene aggiunto o confermato uno shooting nel calendario' },
  { id: 'payment_registered', label: 'Acconto o Saldo Registrato', category: 'finance', desc: 'Quando un cliente versa un acconto o saldo commessa' },
  { id: 'shooting_wrap', label: 'Wrap di Fine Set / Riprese Concluse', category: 'production', desc: 'Quando la troupe conclude le riprese e l\'attrezzatura lascia la location' },
  { id: 'first_cut_delivered', label: 'Prima Bozza Video Consegnata', category: 'postprod', desc: 'Quando viene caricata la preview o link Frame.io per revisione cliente' },
  { id: 'postprod_approved', label: 'Approvazione Finale Master Video', category: 'postprod', desc: 'Quando il cliente approva la versione finale del montaggio' },
  { id: 'contract_signed', label: 'Contratto / Accordo Firmato Digitalmente', category: 'commercial', desc: 'Quando il cliente firma digitalmente il contratto di commessa o liberatorie' },
  { id: 'invoice_overdue', label: 'Fattura Saldo Scaduta (>30 giorni)', category: 'finance', desc: 'Quando decorrono i 30gg dalla scadenza fattura senza riscontro di saldo' },
  { id: 'pre_shooting_48h', label: 'Countdown 48h prima dello Shooting', category: 'production', desc: 'Allarme temporale due giorni prima della data set programmata' },
  { id: 'task_completed', label: 'Attività o To-Do Completato', category: 'production', desc: 'Quando un task (es. montaggio, call, grading) viene segnato completato' },
  { id: 'equipment_on_set', label: 'Attrezzatura Uscita "Su Set"', category: 'production', desc: 'Quando il kit Canon, luci o drone escono sul set per le riprese' },
  { id: 'company_created', label: 'Nuova Scheda Azienda Inserita', category: 'commercial', desc: 'Quando viene registrata una nuova azienda cliente nel CRM' },
  { id: 'inbound_email', label: 'Nuova Email Inbound con Richiesta Preventivo', category: 'commercial', desc: 'Quando arriva una richiesta commerciale via email aziendale' },
  { id: 'sidebar_automations_click', label: 'Click Pulsante Barra Laterale (Automazioni & Trigger)', category: 'commercial', desc: 'Ogni qualvolta l\'operatore clicca sul pulsante della barra laterale per entrare o attivare le automazioni' },
]

const ACTION_OPTIONS = [
  { id: 'flash_white_lightning', label: 'Flash visuale fulmine bianco lucente risaltato e log esecuzione rapido', desc: 'Risalta in modo fluido e veloce il fulmine bianco lucente in tempo reale e registra l\'esecuzione' },
  { id: 'create_task', label: 'Crea automaticamente un task operativo prioritario', desc: 'Genera un nuovo to-do con priorità e assegnatario nella sezione Tasks' },
  { id: 'reserve_equipment', label: 'Riserva Kit Canon C70 & Lenti RF in Inventario', desc: 'Imposta lo stato del kit Canon Cinema e accessori su Riservato per Set' },
  { id: 'dashboard_alert', label: 'Invia notifica prioritaria su Dashboard & Toast', desc: 'Mostra un alert visivo immediato a tutto il team e al Director' },
  { id: 'create_followup_reminder', label: 'Crea promemoria follow-up feedback a 3 giorni', desc: 'Pianifica un avviso automatico per verificare il riscontro del cliente' },
  { id: 'send_email_notification', label: 'Genera bozza email di benvenuto / kick-off', desc: 'Prepara il messaggio con piano di produzione da inviare al referente' },
  { id: 'create_calendar_slot', label: 'Crea slot di verifica o backup nel Calendario', desc: 'Blocca una sessione visiva nella vista calendario di studio' },
  { id: 'task_offload_backup', label: 'Crea task "Offload Card SD/CFexpress & Backup su NAS"', desc: 'Attiva la procedura obbligatoria di duplicazione e verifica checksum file RAW' },
  { id: 'send_payment_reminder', label: 'Genera bozza email sollecito cortese con IBAN', desc: 'Prepara il testo di sollecito con fattura allegata e coordinate bonifico' },
  { id: 'generate_call_sheet', label: 'Genera Ordine del Giorno (Call Sheet) per la Troupe', desc: 'Predispone la convocazione con orari, location, troupe e materiali' },
]

const CATEGORY_TAGS = {
  commercial: { label: 'Commerciale', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  production: { label: 'Produzione & Set', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  finance: { label: 'Finanza & Pagamenti', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  postprod: { label: 'Post-Produzione', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
}

export default function Automations() {
  const [automations, setAutomations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'active' | 'paused'
  const [filterCategory, setFilterCategory] = useState('all')
  const [toastMessage, setToastMessage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [testingId, setTestingId] = useState(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    trigger: 'deal_won',
    action: 'create_task',
    category: 'commercial',
    active: true,
  })

  // Caricamento automazioni da API server (con fallback locale)
  const loadAutomations = async () => {
    try {
      const res = await fetch('/api/crm/automations')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setAutomations(data)
          localStorage.setItem('dado_crm_automations', JSON.stringify(data))
          setLoading(false)
          return
        }
      }
    } catch (e) {
      console.warn('Uso cache locale automazioni:', e)
    }

    try {
      const saved = JSON.parse(localStorage.getItem('dado_crm_automations') || '[]')
      setAutomations(Array.isArray(saved) ? saved : [])
    } catch {
      setAutomations([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAutomations()

    const handleTriggerEvent = (e) => {
      const id = e.detail?.id || 'aut-sidebar-trigger'
      setAutomations(prev => prev.map(a => {
        if (a.id === id) {
          return {
            ...a,
            executionCount: (a.executionCount || 0) + 1,
            lastExecuted: 'Oggi alle ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
          }
        }
        return a
      }))
    }

    window.addEventListener('dado-automation-triggered', handleTriggerEvent)
    return () => window.removeEventListener('dado-automation-triggered', handleTriggerEvent)
  }, [])

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Toggle attiva / sospesa
  const handleToggleActive = async (auto) => {
    const updated = { ...auto, active: !auto.active }
    setAutomations(prev => prev.map(a => a.id === auto.id ? updated : a))
    try {
      await fetch(`/api/crm/automations/${auto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
    } catch (e) {
      // ignore
    }
    showToast(`Automazione "${auto.name}" ${updated.active ? 'attivata' : 'messa in pausa'}`)
  }

  // Simula trigger immediato
  const handleTriggerTest = async (auto) => {
    setTestingId(auto.id)
    try {
      const res = await fetch(`/api/crm/automations/${auto.id}/trigger`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.automation) {
          setAutomations(prev => prev.map(a => a.id === auto.id ? data.automation : a))
        }
        showToast(data.message || `Trigger eseguito: ${auto.name}`)
      } else {
        showToast(`Test eseguito con successo per "${auto.name}"!`)
      }
    } catch (e) {
      // Fallback locale
      setAutomations(prev => prev.map(a => a.id === auto.id ? {
        ...a,
        executionCount: (a.executionCount || 0) + 1,
        lastExecuted: 'Oggi alle ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      } : a))
      showToast(`Trigger simulato con successo per "${auto.name}"!`)
    } finally {
      setTimeout(() => setTestingId(null), 400)
    }
  }

  // Elimina automazione
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Vuoi eliminare l'automazione "${name}"?`)) return
    setAutomations(prev => prev.filter(a => a.id !== id))
    try {
      await fetch(`/api/crm/automations/${id}`, { method: 'DELETE' })
    } catch (e) {
      // ignore
    }
    showToast(`Automazione "${name}" eliminata`)
  }

  // Apertura modale nuovo / modifica
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setForm({
        name: item.name,
        description: item.description || '',
        trigger: item.trigger,
        action: item.action,
        category: item.category || 'commercial',
        active: item.active !== false,
      })
    } else {
      setEditingItem(null)
      setForm({
        name: '',
        description: '',
        trigger: 'deal_won',
        action: 'create_task',
        category: 'commercial',
        active: true,
      })
    }
    setIsModalOpen(true)
  }

  // Salvataggio form modale
  const handleSaveForm = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return

    const trigObj = TRIGGER_OPTIONS.find(t => t.id === form.trigger)
    const actObj = ACTION_OPTIONS.find(a => a.id === form.action)

    const payload = {
      ...form,
      triggerLabel: trigObj ? trigObj.label : form.trigger,
      actionLabel: actObj ? actObj.label : form.action,
    }

    if (editingItem) {
      const updated = { ...editingItem, ...payload }
      setAutomations(prev => prev.map(a => a.id === editingItem.id ? updated : a))
      try {
        await fetch(`/api/crm/automations/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        })
      } catch (e) {}
      showToast(`Automazione "${form.name}" aggiornata`)
    } else {
      const newAuto = {
        id: `aut-${Date.now()}`,
        ...payload,
        executionCount: 0,
        lastExecuted: 'In attesa del primo trigger',
      }
      setAutomations(prev => [newAuto, ...prev])
      try {
        await fetch('/api/crm/automations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAuto),
        })
      } catch (e) {}
      showToast(`Nuova automazione "${form.name}" creata`)
    }

    setIsModalOpen(false)
  }

  // Filtro
  const filteredList = useMemo(() => {
    return automations.filter(a => {
      if (filterStatus === 'active' && !a.active) return false
      if (filterStatus === 'paused' && a.active) return false
      if (filterCategory !== 'all' && a.category !== filterCategory) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = (a.name || '').toLowerCase().includes(q)
        const matchDesc = (a.description || '').toLowerCase().includes(q)
        const matchTrig = (a.triggerLabel || a.trigger || '').toLowerCase().includes(q)
        const matchAct = (a.actionLabel || a.action || '').toLowerCase().includes(q)
        if (!matchName && !matchDesc && !matchTrig && !matchAct) return false
      }
      return true
    })
  }, [automations, filterStatus, filterCategory, searchQuery])

  const totalActive = automations.filter(a => a.active).length
  const totalExecs = automations.reduce((sum, a) => sum + (a.executionCount || 0), 0)

  return (
    <div
      className="flex-1 h-full min-h-0 flex flex-col overflow-hidden selection:bg-[#0284c7]/20"
      style={{
        backgroundColor: 'transparent',
        fontFamily: '"Switzer", sans-serif',
      }}
    >
      {/* ── BANDA SUPERIORE: Titolo "Automazioni & Trigger" immerso nella banda scura (#2d3139), senza icona, più spessa di 0,3 cm rispetto alla dashboard ── */}
      <div className="w-full flex-shrink-0 relative z-20">
        <div
          className="w-full rounded-none flex items-center justify-between px-5 md:px-8 select-none"
          style={{
            height: 'calc(3rem - 0.5cm + 0.3cm)',
            backgroundColor: '#2d3139',
            borderTopLeftRadius: '0px',
            borderBottomLeftRadius: '0px',
            borderTopRightRadius: '0px',
            borderBottomRightRadius: '0px',
          }}
        >
          <div className="flex items-center">
            <h1
              className="text-lg sm:text-xl font-black text-white tracking-tight leading-none select-none"
              style={{ fontFamily: '"Switzer", sans-serif' }}
            >
              Automazioni & Trigger
            </h1>
          </div>
        </div>
      </div>

      {/* ── CANVAS ARMONIZZATO: Stile pieno e arioso senza max-w-6xl per sfruttare tutto lo schermo in orizzontale ── */}
      <div
        className="flex-1 min-h-0 rounded-tl-none rounded-bl-[48px] rounded-tr-none rounded-br-none flex flex-col justify-between relative min-w-0 overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, #f0f8fd 0%, #e5f3fa 100%)',
          borderLeft: '1.5px solid #d4ebf9',
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
          borderTopLeftRadius: '0px',
          borderBottomLeftRadius: '48px',
        }}
      >
        <div className="flex-1 min-h-0 px-5 md:px-8 py-4 overflow-y-auto">
          <div className="w-full space-y-4">

            {/* Toast Notifica */}
            {toastMessage && (
              <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 animate-fadeIn flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{toastMessage.msg}</span>
              </div>
            )}

            {/* ── PULSANTE "+ New Automation" SOTTO LA BANDA SUPERIORE E IL TESTO "Automazioni & Trigger" ── */}
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[15px] rounded-lg transition-all shadow-2xs active:scale-95 cursor-pointer"
                  title="Crea una nuova automazione"
                >
                  <span>+ New Automation</span>
                </button>
              </div>
            </div>

            {/* ── STATISTICHE RAPIDE KPI (REGOLE TOTALI, ATTIVE IN BACKGROUND, IN PAUSA, ESECUZIONI TOTALI) ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 flex-shrink-0">
              <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex items-center justify-between">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600">
                  Regole Totali
                </span>
                <span className="text-2xl sm:text-3xl font-black tabular-nums text-slate-900">
                  {automations.length}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex items-center justify-between">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-600">
                  Attive in Background
                </span>
                <span className="text-2xl sm:text-3xl font-black tabular-nums text-emerald-600">
                  {totalActive}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex items-center justify-between">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-600">
                  In Pausa
                </span>
                <span className="text-2xl sm:text-3xl font-black tabular-nums text-amber-600">
                  {automations.length - totalActive}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex items-center justify-between">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-600">
                  Esecuzioni Totali
                </span>
                <span className="text-2xl sm:text-3xl font-black tabular-nums text-sky-600">
                  {totalExecs}
                </span>
              </div>
            </div>

            {/* ── SOTTOTITOLO POSIZIONATO SOTTO I RIQUADRI KPI ("REGOLE TOTALI", "ATTIVE IN BACKGROUND", ECC.) ── */}
            <p className="text-sm sm:text-base text-slate-600 font-semibold leading-snug px-1">
              Regole ad evento scatenante (Causa ➔ Effetto) per orchestrare clienti, set, task e pagamenti nel CRM.
            </p>

            {/* ── BARRA FILTRI & RICERCA INGRANDITA ── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tutte ({automations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('active')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    filterStatus === 'active'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Attive ({totalActive})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('paused')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    filterStatus === 'paused'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  In Pausa ({automations.length - totalActive})
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 bg-slate-50 hover:bg-white focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
                >
                  <option value="all">Tutte le Categorie</option>
                  <option value="commercial">Commerciale</option>
                  <option value="production">Produzione & Set</option>
                  <option value="finance">Finanza & Pagamenti</option>
                  <option value="postprod">Post-Produzione</option>
                </select>
              </div>

              <div className="relative min-w-[280px] sm:min-w-[340px]">
                <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca per nome, trigger o azione..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm sm:text-[15px] font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white transition-colors shadow-2xs"
                />
              </div>
            </div>

            {/* ── LISTA DELLE SCHEDE DI AUTOMAZIONE (AMPIA & ARIOSA) ── */}
            <div className="space-y-4">
              {filteredList.length === 0 ? (
                <div className="p-14 text-center bg-white border border-slate-200 rounded-3xl shadow-xs">
                  <Workflow className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-lg font-black text-slate-800">Nessuna automazione trovata</h4>
                  <p className="text-sm text-slate-500 font-medium mt-1">Crea la tua prima regola automatica con il pulsante in alto.</p>
                </div>
              ) : (
                filteredList.map((auto) => {
                  const tag = CATEGORY_TAGS[auto.category] || CATEGORY_TAGS.commercial
                  const isTesting = testingId === auto.id

                  return (
                    <div
                      key={auto.id}
                      className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 shadow-xs hover:shadow-md ${
                        auto.active ? 'border-slate-200/90' : 'border-slate-200 opacity-65'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        
                        {/* Sinistra: Dettagli & Diagramma Flusso Ingranditi */}
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${tag.bg} ${tag.text} ${tag.border}`}>
                              {tag.label}
                            </span>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                              {auto.name}
                            </h3>
                          </div>

                          {auto.description && (
                            <p className="text-sm sm:text-[15px] text-slate-700 font-medium leading-relaxed">
                              {auto.description}
                            </p>
                          )}

                          {/* Visual Flow Diagram: [TRIGGER] ──➔ [AZIONE] Ingrandito */}
                          <div className="flex items-center gap-2.5 flex-wrap pt-1">
                            {/* Box Trigger */}
                            <div className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-sky-50 border border-sky-200 text-[#0284c7] text-xs sm:text-sm font-bold shadow-2xs">
                              <Zap className="w-4 h-4 text-[#0284c7] shrink-0" />
                              <span className="text-xs uppercase tracking-wider text-sky-900 font-extrabold">Se:</span>
                              <span className="text-slate-900 font-bold">{auto.triggerLabel || auto.trigger}</span>
                            </div>

                            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />

                            {/* Box Azione */}
                            <div className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 text-xs sm:text-sm font-bold shadow-2xs">
                              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                              <span className="text-xs uppercase tracking-wider text-slate-600 font-extrabold">Allora:</span>
                              <span className="text-slate-900 font-bold">{auto.actionLabel || auto.action}</span>
                            </div>
                          </div>

                          {/* Metadati di esecuzione */}
                          <div className="flex items-center gap-3.5 text-xs sm:text-sm text-slate-500 font-semibold pt-1 flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span>Ultima esecuzione: <strong className="text-slate-800">{auto.lastExecuted || 'Mai'}</strong></span>
                            </span>
                            <span>•</span>
                            <span>Eseguita <strong className="text-[#0284c7]">{auto.executionCount || 0} volte</strong></span>
                          </div>
                        </div>

                        {/* Destra: Switch & Azioni */}
                        <div className="flex items-center gap-3 self-end lg:self-center shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex-wrap">
                          {/* Switch Attiva / Sospesa */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(auto)}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer border flex items-center gap-2 shadow-2xs ${
                              auto.active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Clicca per attivare o sospendere l'automazione"
                          >
                            <span className={`w-2.5 h-2.5 rounded-full ${auto.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            <span>{auto.active ? 'Attiva' : 'Sospesa'}</span>
                          </button>

                          {/* Tasto Simula Trigger */}
                          <button
                            type="button"
                            disabled={isTesting}
                            onClick={() => handleTriggerTest(auto)}
                            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-[#0284c7] hover:bg-[#0369a1] text-white transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                            title="Simula l'evento trigger ed esegui l'automazione adesso"
                          >
                            <Play className={`w-3.5 h-3.5 fill-white ${isTesting ? 'animate-spin' : ''}`} />
                            <span>{isTesting ? 'Esecuzione...' : 'Simula Trigger'}</span>
                          </button>

                          {/* Modifica */}
                          <button
                            type="button"
                            onClick={() => handleOpenModal(auto)}
                            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                            title="Modifica parametri dell'automazione"
                          >
                            <Edit3 className="w-4.5 h-4.5" />
                          </button>

                          {/* Elimina */}
                          <button
                            type="button"
                            onClick={() => handleDelete(auto.id, auto.name)}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                            title="Elimina automazione"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>

                      </div>
                    </div>
                  )
                })
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── MODALE CREA / MODIFICA AUTOMAZIONE (Ampia e Ingrandita) ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-900"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: '"Switzer", sans-serif' }}
          >
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-sky-50 text-[#0284c7] border border-sky-200">
                  <Zap className="w-5 h-5 text-[#0284c7]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {editingItem ? 'Modifica Automazione' : 'Nuova Automazione da Trigger'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 sm:space-y-5">
              {/* Nome */}
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-1.5">
                  Nome Regola *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Es. Conferma Preventivo ➔ Notifica Set"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm sm:text-[15px] font-semibold text-black focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              {/* Trigger (Causa) */}
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#0284c7]" />
                  <span>Quando accade questo evento (Trigger) *</span>
                </label>
                <select
                  value={form.trigger}
                  onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm sm:text-[15px] font-bold text-black focus:outline-none focus:border-sky-500 bg-white cursor-pointer"
                >
                  {TRIGGER_OPTIONS.map(trig => (
                    <option key={trig.id} value={trig.id}>
                      {trig.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1.5 italic font-medium">
                  {TRIGGER_OPTIONS.find(t => t.id === form.trigger)?.desc}
                </p>
              </div>

              {/* Azione (Effetto) */}
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Allora esegui automaticamente questa azione *</span>
                </label>
                <select
                  value={form.action}
                  onChange={(e) => setForm({ ...form, action: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm sm:text-[15px] font-bold text-black focus:outline-none focus:border-sky-500 bg-white cursor-pointer"
                >
                  {ACTION_OPTIONS.map(act => (
                    <option key={act.id} value={act.id}>
                      {act.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1.5 italic font-medium">
                  {ACTION_OPTIONS.find(a => a.id === form.action)?.desc}
                </p>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-1.5">
                  Ambito di Lavoro
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm sm:text-[15px] font-bold text-black focus:outline-none focus:border-sky-500 bg-white cursor-pointer"
                >
                  <option value="commercial">Commerciale & Clienti</option>
                  <option value="production">Produzione & Set</option>
                  <option value="finance">Finanza & Pagamenti</option>
                  <option value="postprod">Post-Produzione & Consegne</option>
                </select>
              </div>

              {/* Descrizione opzionale */}
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-1.5">
                  Descrizione o Note Operative
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Spiega al team cosa fa questa automazione..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm sm:text-[15px] font-medium text-black focus:outline-none focus:border-sky-500 bg-slate-50 focus:bg-white resize-none"
                />
              </div>

              {/* Tasto Salva */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm sm:text-[15px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm sm:text-[15px] font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  {editingItem ? 'Salva Modifiche' : 'Crea Automazione'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
