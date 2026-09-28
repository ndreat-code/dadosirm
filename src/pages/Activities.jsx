import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Building2,
  Plus,
  Search,
  Filter,
  Trash2,
  Phone,
  Video,
  Camera,
  FileText,
  LayoutList,
  Columns,
  Sparkles,
  ArrowRight,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  Send,
  RefreshCw,
  AlertCircle,
  FileEdit,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Bot,
  ShieldCheck
} from 'lucide-react'

// Categorie in perfetta armonia con la palette DADO (senza arancione stonato)
const CATEGORIES = {
  commercial: {
    label: 'Commerciale & Call',
    icon: Phone,
    color: '#00e5ff', // Ciano vivo
    bg: 'rgba(0, 229, 255, 0.12)',
    border: 'rgba(0, 229, 255, 0.35)',
  },
  shooting: {
    label: 'Shooting & Set',
    icon: Camera,
    color: '#d946ef', // Magenta / Viola studio
    bg: 'rgba(217, 70, 239, 0.12)',
    border: 'rgba(217, 70, 239, 0.35)',
  },
  postprod: {
    label: 'Post-Produzione & Consegne',
    icon: Video,
    color: '#00ffaa', // Verde menta neon
    bg: 'rgba(0, 255, 170, 0.12)',
    border: 'rgba(0, 255, 170, 0.35)',
  },
  admin: {
    label: 'Amministrazione & Contratti',
    icon: FileText,
    color: '#ffffff',
    bg: 'rgba(255, 255, 255, 0.10)',
    border: 'rgba(255, 255, 255, 0.25)',
  },
}

// ── Acronimo B.A.N.T. stile Brand Logo DADO ──
// Sequenza colori identica al logo: B: Verde (#53ba75), A: Rosso (#ea3824), N: Ciano (#1bb7ed), T: Giallo (#fac429)
function BantLogoMark({ size = 'sm' }) {
  const isSm = size === 'sm'
  return (
    <div
      className="inline-flex items-center gap-1 select-none px-1.5 py-0.5 rounded bg-black/80 border border-white/20 shadow-inner shrink-0"
      title="Framework B.A.N.T. (Budget • Authority • Need • Timeline)"
    >
      <div className="flex items-center gap-0.5">
        <span
          style={{
            fontFamily: '"Goldman", sans-serif',
            color: '#53ba75',
            fontWeight: 900,
            fontSize: isSm ? '10.5px' : '12.5px',
            lineHeight: 1,
          }}
        >
          B
        </span>
        <span className="w-0.5 h-0.5 rounded-full bg-[#53ba75]" />
      </div>
      <div className="flex items-center gap-0.5">
        <span
          style={{
            fontFamily: '"Goldman", sans-serif',
            color: '#ea3824',
            fontWeight: 900,
            fontSize: isSm ? '10.5px' : '12.5px',
            lineHeight: 1,
          }}
        >
          A
        </span>
        <span className="w-0.5 h-0.5 rounded-full bg-[#ea3824]" />
      </div>
      <div className="flex items-center gap-0.5">
        <span
          style={{
            fontFamily: '"Goldman", sans-serif',
            color: '#1bb7ed',
            fontWeight: 900,
            fontSize: isSm ? '10.5px' : '12.5px',
            lineHeight: 1,
          }}
        >
          N
        </span>
        <span className="w-0.5 h-0.5 rounded-full bg-[#1bb7ed]" />
      </div>
      <div className="flex items-center gap-0.5">
        <span
          style={{
            fontFamily: '"Goldman", sans-serif',
            color: '#fac429',
            fontWeight: 900,
            fontSize: isSm ? '10.5px' : '12.5px',
            lineHeight: 1,
          }}
        >
          T
        </span>
      </div>
    </div>
  )
}

// 4 Opzioni Priorità Task:
// 1. Urgente entro 3 giorni
// 2. Entro una settimana
// 3. Non urgente 2/3 settimane
// 4. Quando trovi un po' di tempo nell'arco di un mese
const TASK_PRIORITIES = [
  {
    id: 'urgent_3d',
    code: '3 gg',
    label: 'Urgente entro 3 giorni',
    color: '#ea3824', // Rosso
    bg: 'rgba(234, 56, 36, 0.35)',
    border: '#ea3824',
  },
  {
    id: 'week_1',
    code: '1 sett',
    label: 'Entro una settimana',
    color: '#fac429', // Giallo
    bg: 'rgba(250, 196, 41, 0.35)',
    border: '#fac429',
  },
  {
    id: 'weeks_2_3',
    code: '2-3 sett',
    label: 'Non urgente 2/3 settimane',
    color: '#1bb7ed', // Ciano
    bg: 'rgba(27, 183, 237, 0.35)',
    border: '#1bb7ed',
  },
  {
    id: 'month_1',
    code: '1 mese',
    label: 'Quando trovi un po\' di tempo nell\'arco di un mese',
    color: '#53ba75', // Verde
    bg: 'rgba(83, 186, 117, 0.35)',
    border: '#53ba75',
  },
]

export default function Activities() {
  const [activities, setActivities] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  // Filtri e vista
  const [mainTab, setMainTab] = useState('tasks') // 'tasks' | 'drafts'
  const [draftsData, setDraftsData] = useState({ drafts: [], sentEmails: [] })
  const [syncingPipeline, setSyncingPipeline] = useState(false)
  const [pipelineSyncMsg, setPipelineSyncMsg] = useState(null)
  const [editingDraftId, setEditingDraftId] = useState(null)
  const [editDraftForm, setEditDraftForm] = useState({ subject: '', body: '' })
  const [sendingDraftId, setSendingDraftId] = useState(null)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' o 'kanban'
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0)

  // Modal Nuova Attività
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    type: 'commercial',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '15:00',
    priority: 'medium',
    notes: ''
  })
  const [saving, setSaving] = useState(false)

  // Carica bozze email
  async function loadDrafts() {
    try {
      const res = await fetch('/api/pipeline/drafts')
      if (res.ok) {
        const data = await res.json()
        setDraftsData(data || { drafts: [], sentEmails: [] })
      }
    } catch (e) {
      console.error('Errore caricamento bozze:', e)
    }
  }

  // Carica dati dal backend CRM
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/crm/summary')
        if (res.ok) {
          const data = await res.json()
          if (data.nextActions) setActivities(data.nextActions)
          if (data.companies) setCompanies(data.companies)
        }
      } catch (err) {
        console.error('Errore caricamento dati attività:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
    loadDrafts()
  }, [])

  // Sincronizzazione ed esecuzione manuale della Pipeline AI
  async function triggerPipelineSync() {
    setSyncingPipeline(true)
    setPipelineSyncMsg(null)
    try {
      const res = await fetch('/api/pipeline/run', { method: 'POST' })
      const result = await res.json()
      if (result.success) {
        setPipelineSyncMsg(`Scansione completata: ${result.count || 0} email elaborate.`)
        const resSum = await fetch('/api/crm/summary')
        if (resSum.ok) {
          const d = await resSum.json()
          if (d.nextActions) setActivities(d.nextActions)
        }
        await loadDrafts()
      } else {
        setPipelineSyncMsg(`Errore scansione: ${result.error || 'Nessun dato'}`)
      }
    } catch (err) {
      setPipelineSyncMsg('Errore connessione server pipeline')
    } finally {
      setSyncingPipeline(false)
      setTimeout(() => setPipelineSyncMsg(null), 6000)
    }
  }

  // Invio con 1-click di una bozza
  async function handleSendDraft(draftId) {
    setSendingDraftId(draftId)
    try {
      const res = await fetch(`/api/pipeline/drafts/${draftId}/send`, { method: 'POST' })
      if (res.ok) {
        await loadDrafts()
        const resSum = await fetch('/api/crm/summary')
        if (resSum.ok) {
          const d = await resSum.json()
          if (d.nextActions) setActivities(d.nextActions)
        }
      }
    } catch (err) {
      console.error('Errore invio bozza:', err)
    } finally {
      setSendingDraftId(null)
    }
  }

  // Modifica e salvataggio bozza
  async function handleSaveEditDraft(draftId) {
    try {
      const res = await fetch(`/api/pipeline/drafts/${draftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDraftForm)
      })
      if (res.ok) {
        setEditingDraftId(null)
        await loadDrafts()
      }
    } catch (err) {
      console.error('Errore modifica bozza:', err)
    }
  }

  // Eliminazione bozza
  async function handleDeleteDraft(draftId) {
    try {
      const res = await fetch(`/api/pipeline/drafts/${draftId}`, { method: 'DELETE' })
      if (res.ok) {
        await loadDrafts()
      }
    } catch (err) {
      console.error('Errore eliminazione bozza:', err)
    }
  }

  // Spunta interattiva elementi della checklist di un'attività generata dall'automazione
  async function toggleChecklistItem(activity, itemIdx) {
    const currentChecklist = Array.isArray(activity.checklist) ? [...activity.checklist] : []
    const currentItem = currentChecklist[itemIdx] || ''
    if (currentItem.startsWith('✓ ')) {
      currentChecklist[itemIdx] = currentItem.replace('✓ ', '')
    } else {
      currentChecklist[itemIdx] = '✓ ' + currentItem
    }

    const updated = { ...activity, checklist: currentChecklist }
    setActivities(prev => prev.map(a => a.id === activity.id ? updated : a))

    try {
      await fetch(`/api/crm/activities/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: currentChecklist })
      })
    } catch (err) {
      console.error('Errore aggiornamento checklist:', err)
    }
  }

  // Toggle completamento attività
  async function toggleStatus(activity) {
    const nextStatus = activity.status === 'completed' ? 'pending' : 'completed'
    const updated = { ...activity, status: nextStatus }

    setActivities(prev => prev.map(a => a.id === activity.id ? updated : a))

    try {
      await fetch(`/api/crm/activities/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })
    } catch (err) {
      console.error('Errore aggiornamento attività:', err)
    }
  }

  // Modifica rapida priorità attività
  async function handleUpdatePriority(id, priorityId) {
    setActivities(prev => prev.map(a => String(a.id) === String(id) ? { ...a, priority: priorityId } : a))
    try {
      await fetch(`/api/crm/activities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: priorityId })
      })
    } catch (err) {
      console.error('Errore aggiornamento priorità:', err)
    }
  }

  // Elimina attività istantaneamente senza dialog bloccante
  async function handleDelete(id) {
    setActivities(prev => prev.filter(a => String(a.id) !== String(id)))
    try {
      await fetch(`/api/crm/activities/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Errore cancellazione attività:', err)
    }
  }

  // Salva nuova attività
  async function handleCreate(e) {
    e.preventDefault()
    if (!formData.title.trim()) return

    setSaving(true)
    try {
      const res = await fetch('/api/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        const result = await res.json()
        if (result.activity) {
          setActivities(prev => [result.activity, ...prev])
        }
        setShowAddModal(false)
        setFormData({
          title: '',
          company: companies[0]?.name || '',
          type: 'commercial',
          dueDate: new Date().toISOString().split('T')[0],
          dueTime: '15:00',
          priority: 'medium',
          notes: ''
        })
      }
    } catch (err) {
      console.error('Errore creazione:', err)
    } finally {
      setSaving(false)
    }
  }

  // Statistiche KPI
  const stats = useMemo(() => {
    const total = activities.length
    const pending = activities.filter(a => a.status !== 'completed').length
    const completed = activities.filter(a => a.status === 'completed').length
    const dueToday = activities.filter(a => a.status !== 'completed' && (a.due === 'today' || a.period?.toLowerCase() === 'oggi')).length
    const shootings = activities.filter(a => a.type === 'shooting' && a.status !== 'completed').length
    return { total, pending, completed, dueToday, shootings }
  }, [activities])

  // Attività attiva selezionata per la console interattiva
  const activeTask = activities.length > 0
    ? activities[Math.min(currentTaskIdx, activities.length - 1)]
    : null

  // Filtraggio attività
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchTitle = a.title?.toLowerCase().includes(q)
        const matchComp = a.company?.toLowerCase().includes(q)
        const matchNotes = a.notes?.toLowerCase().includes(q)
        if (!matchTitle && !matchComp && !matchNotes) return false
      }
      if (categoryFilter !== 'all' && a.type !== categoryFilter) return false
      if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false
      if (statusFilter === 'pending' && a.status === 'completed') return false
      if (statusFilter === 'completed' && a.status !== 'completed') return false

      return true
    })
  }, [activities, search, categoryFilter, priorityFilter, statusFilter])

  // Suddivisione per data
  const todayTasks = filteredActivities.filter(a => a.status !== 'completed' && (a.due === 'today' || a.period?.toLowerCase() === 'oggi'))
  const upcomingTasks = filteredActivities.filter(a => a.status !== 'completed' && a.due !== 'today' && a.period?.toLowerCase() !== 'oggi')
  const completedTasks = filteredActivities.filter(a => a.status === 'completed')

  return (
    <div className="h-full min-h-screen md:min-h-0 bg-[#111111] flex flex-col flex-1 relative overflow-hidden">
      
      {/* ── CANVAS VERDE TAVOLO DA BILIARDO (#007a50) IDENTICO ALLA DASHBOARD ── */}
      <div className="h-full flex-1 bg-[#007a50] rounded-tl-[48px] rounded-bl-[48px] flex flex-col justify-between relative min-w-0 overflow-hidden">

        {/* ── Banda Bianca Superiore (spessore identico alla Dashboard) ── */}
        <div className="w-full flex justify-end flex-shrink-0">
          <div className="bg-white rounded-bl-2xl w-[calc(100%-2.5rem)]" style={{ height: 'calc(3rem - 0.5cm)' }} />
        </div>

        {/* ── Contenuto Principale con scroll ── */}
        <div className="flex-1 min-h-0 pl-10 pr-8 py-3 overflow-y-auto">

          {/* ── TITOLO IN STILE DASHBOARD (FONT INSPIRATION + SOTTOTITOLO GOLDMAN) ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-black/20 pb-4">
            <div>
              <h1 className="leading-none flex items-baseline gap-0.5">
                <span
                  style={{
                    fontFamily: 'Inspiration, cursive',
                    fontSize: '3.6rem',
                    color: '#111111',
                    lineHeight: 1,
                  }}
                >
                  Activities
                </span>
              </h1>

              <p style={{ marginTop: '4px', fontSize: '18px', fontFamily: '"Switzer", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' }}>
                <span style={{ color: '#00e5ff' }}>Production pipeline & </span>
                <span style={{ color: '#00e575' }}>next actions</span>
              </p>
            </div>

            {/* Bottoni e Switcher Tab Superiore */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Tab: Attività */}
              <button
                type="button"
                onClick={() => setMainTab('tasks')}
                className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                  mainTab === 'tasks'
                    ? 'bg-[#111111] text-[#00ffaa] border-black shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/10'
                }`}
              >
                Attività ({activities.length})
              </button>

              {/* Tab: Bozze & Invii Automazione */}
              <button
                type="button"
                onClick={() => setMainTab('drafts')}
                className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
                  mainTab === 'drafts'
                    ? 'bg-[#111111] text-[#00e5ff] border-black shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/10'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Bozze & Invii</span>
                {draftsData.drafts?.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#d946ef] text-white font-mono font-black animate-pulse">
                    {draftsData.drafts.length}
                  </span>
                )}
              </button>

              {/* Pulsante Avvio Scansione Automazione In Diretta */}
              <button
                type="button"
                onClick={triggerPipelineSync}
                disabled={syncingPipeline}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-black/40 hover:bg-black/60 text-white/90 hover:text-white border border-white/20 font-bold text-xs rounded-none transition-all shadow-sm font-mono uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                title="Esegui scansione immediata email, generazione tasks e bozze"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#00e5ff] ${syncingPipeline ? 'animate-spin' : ''}`} />
                <span>{syncingPipeline ? 'Analisi...' : 'Esegui Automazione ⚡'}</span>
              </button>

              {/* Pulsante Crea Attività */}
              <button
                onClick={() => {
                  if (companies.length > 0 && !formData.company) {
                    setFormData(f => ({ ...f, company: companies[0].name }))
                  }
                  setShowAddModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-black text-[#00ffaa] border border-black font-bold text-xs rounded-none transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] font-mono uppercase tracking-wider cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                + Nuova Attività
              </button>
            </div>
          </div>

          {/* Banner notifica feedback scansione pipeline */}
          {pipelineSyncMsg && (
            <div className="mb-4 p-3 rounded-[6px] bg-[#111111] border border-[#00ffaa]/50 text-[#00ffaa] text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#00e5ff]" />
                <span>{pipelineSyncMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setPipelineSyncMsg(null)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* ── SELEZIONE CONTENUTO: TASKS OPPURE BOZZE/INVII AUTOMATICI ── */}
          {mainTab === 'tasks' ? (
            <div>
              {/* ── RIGA 4 CARD METRICHE KPI (Stile KpiCard con font Switzer DADO Studio) ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6" style={{ fontFamily: '"Switzer", sans-serif' }}>
            
            {/* Card 1: TODAY'S FOCUS */}
            <div
              onClick={() => { setStatusFilter('pending'); setCategoryFilter('all'); }}
              className="p-3.5 bg-[#111111] rounded-[6px] shadow-sm flex flex-col justify-between cursor-pointer hover:opacity-95 transition-all min-h-[85px] border border-black"
              style={{ fontFamily: '"Switzer", sans-serif' }}
            >
              <span className="font-bold uppercase tracking-[0.05em] block leading-tight text-[#ff6f43] text-[13px]">
                TODAY'S FOCUS
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-extrabold leading-none text-[#ff6f43] text-[34px]" style={{ letterSpacing: '-0.03em' }}>
                  {stats.dueToday}
                </span>
                <span className="text-[12px] font-medium text-[#aaaaaa]">
                  in scadenza oggi
                </span>
              </div>
            </div>

            {/* Card 2: SHOOTING & SET */}
            <div
              onClick={() => { setStatusFilter('pending'); setCategoryFilter('shooting'); }}
              className="p-3.5 bg-[#9c27b0] rounded-[6px] shadow-sm flex flex-col justify-between cursor-pointer hover:opacity-95 transition-all min-h-[85px]"
              style={{ fontFamily: '"Switzer", sans-serif' }}
            >
              <span className="font-bold uppercase tracking-[0.05em] block leading-tight text-[#00ff66] text-[13px]">
                SHOOTING & SET
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-extrabold leading-none text-[#00ff66] text-[34px]" style={{ letterSpacing: '-0.03em' }}>
                  {stats.shootings}
                </span>
                <span className="text-[12px] font-medium text-[#00e5ff]">
                  sul campo
                </span>
              </div>
            </div>

            {/* Card 3: IN PROGRAMMA */}
            <div
              onClick={() => { setStatusFilter('pending'); setCategoryFilter('all'); }}
              className="p-3.5 bg-[#111111] rounded-[6px] shadow-sm flex flex-col justify-between cursor-pointer hover:opacity-95 transition-all min-h-[85px] border border-black"
              style={{ fontFamily: '"Switzer", sans-serif' }}
            >
              <span className="font-bold uppercase tracking-[0.05em] block leading-tight text-white/90 text-[13px]">
                IN PROGRAMMA
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-extrabold leading-none text-white text-[34px]" style={{ letterSpacing: '-0.03em' }}>
                  {stats.pending}
                </span>
                <span className="text-[12px] font-medium text-white/60">
                  in pipeline
                </span>
              </div>
            </div>

            {/* Card 4: COMPLETATE */}
            <div
              onClick={() => { setStatusFilter('completed'); }}
              className="p-3.5 bg-[#00ffaa] rounded-[6px] shadow-sm flex flex-col justify-between cursor-pointer hover:opacity-95 transition-all min-h-[85px]"
              style={{ fontFamily: '"Switzer", sans-serif' }}
            >
              <span className="font-bold uppercase tracking-[0.05em] block leading-tight text-[#111111] text-[13px]">
                CONCLUSE
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-extrabold leading-none text-[#111111] text-[34px]" style={{ letterSpacing: '-0.03em' }}>
                  {stats.completed}
                </span>
                <span className="text-[12px] font-medium text-[#111111]/80">
                  archivio
                </span>
              </div>
            </div>

          </div>

          {/* ── CONSOLE ATTIVITÀ: SKIP TASK (WALKMAN), MODIFICA PRIORITÀ, TASK CONCLUSO (SPUNTA) E RIMUOVI ── */}
          {activeTask && (
            <div
              className="p-4 rounded-[6px] border border-black mb-6 shadow-xl relative overflow-hidden"
              style={{
                backgroundColor: '#111111',
                color: '#ffffff',
                fontFamily: '"Jost", sans-serif',
              }}
            >
              {/* Riga Superiore: Contatore, Walkman Skip Controls & 4 Riquadri Priorità in Alto a Destra */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                {/* Sinistra: Contatore e Frecce Walkman Skip */}
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/80">
                    ATTIVITÀ {Math.min(currentTaskIdx + 1, activities.length)} DI {activities.length}
                  </span>

                  {/* Controlli Walkman Skip */}
                  <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded border border-white/20" title="Skip task (frecce stile walkman)">
                    <button
                      type="button"
                      onClick={() => setCurrentTaskIdx(i => (i - 1 + activities.length) % activities.length)}
                      className="px-2 py-1 hover:bg-white/20 text-[#00ffaa] rounded text-xs font-mono font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                      title="Torna all'attività precedente"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>PREV</span>
                    </button>
                    <span className="text-white/20">|</span>
                    <button
                      type="button"
                      onClick={() => setCurrentTaskIdx(i => (i + 1) % activities.length)}
                      className="px-2 py-1 hover:bg-white/20 text-[#00e5ff] rounded text-xs font-mono font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                      title="Skip: passa all'attività successiva"
                    >
                      <span>SKIP</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Destra: 4 Riquadri in Alto a Destra per modificare la priorità del task */}
                <div className="flex items-center gap-1" title="Modifica priorità del task">
                  <span className="text-[10px] text-white/50 font-mono mr-1 hidden sm:inline">MODIFICA PRIORITÀ:</span>
                  {TASK_PRIORITIES.map((p) => {
                    const isSelected = activeTask.priority === p.id ||
                      (activeTask.priority === 'high' && p.id === 'urgent_3d') ||
                      (activeTask.priority === 'medium' && p.id === 'week_1') ||
                      (activeTask.priority === 'low' && p.id === 'month_1')
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleUpdatePriority(activeTask.id, p.id)}
                        className={`px-2 py-1 text-[9.5px] font-mono font-bold uppercase rounded transition-all cursor-pointer border ${
                          isSelected
                            ? 'ring-1 ring-white/50 scale-105 shadow-md'
                            : 'opacity-40 hover:opacity-100'
                        }`}
                        style={{
                          color: p.color,
                          backgroundColor: isSelected ? p.bg : 'rgba(0,0,0,0.5)',
                          borderColor: isSelected ? p.border : 'rgba(255,255,255,0.15)',
                        }}
                        title={p.label}
                      >
                        {p.code}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Corpo Task: Titolo, Company con B.A.N.T., Orario e Note */}
              <div className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`text-base md:text-lg font-bold tracking-tight ${
                        activeTask.status === 'completed' ? 'line-through text-white/40' : 'text-white'
                      }`}
                      style={{ fontFamily: '"Goldman", sans-serif' }}
                    >
                      {activeTask.title}
                    </span>
                    {activeTask.status === 'completed' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00ffaa]/20 text-[#00ffaa] border border-[#00ffaa]/40 font-mono">
                        ✓ COMPLETATO
                      </span>
                    )}
                  </div>

                  {/* Company con Logo B.A.N.T. e orario */}
                  <div className="flex items-center gap-3 text-xs font-mono text-white/70 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[#00ffaa] font-bold">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{activeTask.company || 'DADO Studio'}</span>
                    </div>
                    <BantLogoMark size="sm" />
                    <span>•</span>
                    <span className="flex items-center gap-1 text-white/60">
                      <Clock className="w-3.5 h-3.5 text-white/40" />
                      {activeTask.date || 'Oggi'} {activeTask.time || ''}
                    </span>
                  </div>

                  {activeTask.notes && (
                    <p className="mt-2 text-xs text-white/60 font-sans bg-black/40 p-2 rounded border border-white/5 line-clamp-2">
                      {activeTask.notes}
                    </p>
                  )}
                </div>

                {/* Azioni: Tasto Task Concluso (Spunta) + Riquadro Rimuovi */}
                <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                  {/* Tasto col classico segno di spunta per indicare task concluso */}
                  <button
                    type="button"
                    onClick={() => toggleStatus(activeTask)}
                    className={`px-3 py-2 rounded font-mono text-xs font-bold uppercase transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                      activeTask.status === 'completed'
                        ? 'bg-white/10 hover:bg-white/20 text-white/70 border border-white/20'
                        : 'bg-[#00ffaa] hover:bg-[#00dd92] text-black border border-[#00ffaa]'
                    }`}
                    title={activeTask.status === 'completed' ? 'Riapri attività' : 'Segna come conclusa'}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{activeTask.status === 'completed' ? 'Riapri' : 'Task Concluso'}</span>
                  </button>

                  {/* Riquadro all'interno della finestra del task con la dicitura "Rimuovi" */}
                  <button
                    type="button"
                    onClick={() => handleDelete(activeTask.id)}
                    className="px-3 py-2 rounded border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white font-mono text-xs font-bold uppercase transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Elimina definitivamente questa attività dal CRM"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Rimuovi</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TOOLBAR: CERCA, FILTRI & SWITCHER VISTA ── */}
          <div className="bg-[#111111] p-3.5 rounded-[6px] border border-black mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-md">
            
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Campo Cerca */}
              <div className="relative min-w-[200px] flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Cerca attività, cliente o note..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-none pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#00ffaa] font-mono"
                />
              </div>

              {/* Filtro Categoria */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-[#1e1e1e] border border-white/10 rounded-none px-2.5 py-1.5 text-xs text-white/90 focus:outline-none focus:border-[#00ffaa] font-mono"
              >
                <option value="all">Tutte le categorie</option>
                <option value="commercial">📞 Commerciale & Call</option>
                <option value="shooting">🎬 Shooting & Set</option>
                <option value="postprod">💻 Post-Produzione</option>
                <option value="admin">📄 Amministrazione</option>
              </select>

              {/* Filtro Priorità */}
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="bg-[#1e1e1e] border border-white/10 rounded-none px-2.5 py-1.5 text-xs text-white/90 focus:outline-none focus:border-[#00ffaa] font-mono"
              >
                <option value="all">Tutte le priorità</option>
                <option value="high">🔴 Alta priorità</option>
                <option value="medium">🔵 Media</option>
                <option value="low">⚪ Bassa</option>
              </select>

              {/* Filtro Stato */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#1e1e1e] border border-white/10 rounded-none px-2.5 py-1.5 text-xs text-white/90 focus:outline-none focus:border-[#00ffaa] font-mono"
              >
                <option value="all">Tutti gli stati</option>
                <option value="pending">Solo in sospeso</option>
                <option value="completed">Solo completate</option>
              </select>
            </div>

            {/* Switcher Vista Lista / Kanban */}
            <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-none border border-white/10 self-end lg:self-center">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#00ffaa] text-black shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                Timeline
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-[#00ffaa] text-black shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                Kanban
              </button>
            </div>
          </div>

          {/* ── RENDERING PRINCIPALE: LISTA O KANBAN ── */}
          {loading ? (
            <div className="p-12 text-center text-white/60 font-mono">Caricamento attività DADO Studio...</div>
          ) : viewMode === 'list' ? (
            /* VISTA TIMELINE LISTA */
            <div className="space-y-6 pb-12">
              
              {/* Sezione: TODAY FOCUS */}
              {todayTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff6f43] animate-pulse" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#ff6f43] bg-[#111111] px-3 py-1.5 rounded-[4px] border border-black flex items-center gap-2 shadow-sm" style={{ fontFamily: '"Goldman", sans-serif' }}>
                      <span>Oggi / Prioritarie</span>
                      <span className="text-[#ff6f43] font-extrabold font-mono">({todayTasks.length})</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {todayTasks.map(act => (
                      <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} isToday />
                    ))}
                  </div>
                </div>
              )}

              {/* Sezione: IN CODA / PROSSIMI GIORNI */}
              {upcomingTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Calendar className="w-4 h-4 text-white" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-white bg-[#111111] px-3 py-1.5 rounded-[4px] border border-black flex items-center gap-2 shadow-sm" style={{ fontFamily: '"Goldman", sans-serif' }}>
                      <span>In coda / Prossimi Giorni</span>
                      <span className="text-[#00ffaa] font-mono">({upcomingTasks.length})</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {upcomingTasks.map(act => (
                      <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} />
                    ))}
                  </div>
                </div>
              )}

              {/* Sezione: COMPLETATE */}
              {completedTasks.length > 0 && statusFilter !== 'pending' && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00ffaa]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-white/90 bg-[#111111]/80 px-3 py-1.5 rounded-[4px] border border-black flex items-center gap-2 shadow-sm" style={{ fontFamily: '"Goldman", sans-serif' }}>
                      <span>Completate</span>
                      <span className="text-[#00ffaa] font-mono">({completedTasks.length})</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 opacity-70 hover:opacity-100 transition-opacity">
                    {completedTasks.map(act => (
                      <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} />
                    ))}
                  </div>
                </div>
              )}

              {filteredActivities.length === 0 && (
                <div className="bg-[#111111] p-10 rounded-[6px] border border-black text-center text-white/50 font-mono text-sm">
                  Nessuna attività trovata con i filtri selezionati.
                </div>
              )}

            </div>
          ) : (
            /* VISTA KANBAN A COLONNE */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
              
              {/* Colonna 1: Da Pianificare */}
              <div className="bg-[#111111] p-3.5 rounded-[6px] border border-black flex flex-col shadow-sm">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/90" style={{ fontFamily: '"Goldman", sans-serif' }}>
                    <span className="w-2 h-2 rounded-full bg-[#00ffaa]" />
                    <span>In coda</span>
                  </div>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/60 font-mono">
                    {upcomingTasks.length}
                  </span>
                </div>
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {upcomingTasks.map(act => (
                    <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} isKanban />
                  ))}
                  {upcomingTasks.length === 0 && (
                    <div className="text-center py-8 text-xs text-white/30 font-mono">Nessuna attività in coda</div>
                  )}
                </div>
              </div>

              {/* Colonna 2: Focus Oggi */}
              <div className="bg-[#111111] p-3.5 rounded-[6px] border-2 border-[#ff6f43] flex flex-col shadow-md">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ff6f43]" style={{ fontFamily: '"Goldman", sans-serif' }}>
                    <span className="w-2 h-2 rounded-full bg-[#ff6f43] animate-ping" />
                    <span>Oggi / Prioritarie</span>
                  </div>
                  <span className="text-xs bg-[#ff6f43] text-black px-2 py-0.5 rounded-full font-extrabold font-mono">
                    {todayTasks.length}
                  </span>
                </div>
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {todayTasks.map(act => (
                    <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} isToday isKanban />
                  ))}
                  {todayTasks.length === 0 && (
                    <div className="text-center py-8 text-xs text-white/30 font-mono">Nessun task urgente per oggi</div>
                  )}
                </div>
              </div>

              {/* Colonna 3: Completate */}
              <div className="bg-[#111111] p-3.5 rounded-[6px] border border-black flex flex-col shadow-sm">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00ffaa]" style={{ fontFamily: '"Goldman", sans-serif' }}>
                    <span className="w-2 h-2 rounded-full bg-[#00ffaa]" />
                    <span>Completate</span>
                  </div>
                  <span className="text-xs bg-[#00ffaa]/20 text-[#00ffaa] px-2 py-0.5 rounded-full font-bold font-mono">
                    {completedTasks.length}
                  </span>
                </div>
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1 opacity-75 hover:opacity-100 transition-opacity">
                  {completedTasks.map(act => (
                    <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} isKanban />
                  ))}
                  {completedTasks.length === 0 && (
                    <div className="text-center py-8 text-xs text-white/30 font-mono">Nessuna attività completata</div>
                  )}
                </div>
              </div>

            </div>
          )}
          </div>
          ) : (
            /* ── VISTA BOZZE EMAIL & INVII AUTOMATICI PIPELINE AI ── */
            <div className="space-y-6 pb-12 animate-in fade-in">
              
              {/* Box Regole di Invio Automatico & Sicurezza CRM */}
              <div className="bg-[#111111] p-4 rounded-[6px] border border-black shadow-lg">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                  <ShieldCheck className="w-4 h-4 text-[#00ffaa]" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Protocollo di Sicurezza Invio Email & Regole di Automazione
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-black/40 p-3 rounded border border-[#00ffaa]/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#00ffaa] font-mono font-bold mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#00ffaa]" />
                        1. Conferma Trattative
                      </div>
                      <p className="text-white/70 text-[11px] leading-relaxed">
                        Invio automatico immediato solo per accordi positivi firmati o declini cortesi.
                      </p>
                    </div>
                    <span className="mt-2 text-[9.5px] font-mono text-[#00ffaa] font-bold">● INVIO AUTOMATICO ATTIVO</span>
                  </div>

                  <div className="bg-black/40 p-3 rounded border border-[#00e5ff]/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#00e5ff] font-mono font-bold mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#00e5ff]" />
                        2. Conferma Appuntamenti & Call
                      </div>
                      <p className="text-white/70 text-[11px] leading-relaxed">
                        Verifica in tempo reale dello slot a calendario: se libero invia la conferma, se occupato salva in bozza.
                      </p>
                    </div>
                    <span className="mt-2 text-[9.5px] font-mono text-[#00e5ff] font-bold">● VERIFICA CALENDARIO ATTIVA</span>
                  </div>

                  <div className="bg-black/40 p-3 rounded border border-[#d946ef]/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#d946ef] font-mono font-bold mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#d946ef]" />
                        3. Info Servizi & Collabs
                      </div>
                      <p className="text-white/70 text-[11px] leading-relaxed">
                        Invio automatico di brochure, scheda servizi e listino su richieste di primo contatto o partnership.
                      </p>
                    </div>
                    <span className="mt-2 text-[9.5px] font-mono text-[#d946ef] font-bold">● INVIO AUTOMATICO ATTIVO</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-amber-300 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Tutte le altre comunicazioni (preventivi su misura, negoziazioni, revisioni contrattuali) vengono <strong>tassativamente salvate come bozze</strong> per revisione e invio manuale con 1-click.
                  </span>
                </div>
              </div>

              {/* Sezione Bozze Pronte */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-white" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-white bg-[#111111] px-3 py-1.5 rounded-[4px] border border-black flex items-center gap-2 shadow-sm font-mono">
                      <span>Bozze Email Pronte per Invio / Revisione</span>
                      <span className="text-[#d946ef] font-extrabold">({draftsData.drafts?.length || 0})</span>
                    </h2>
                  </div>
                </div>

                {(!draftsData.drafts || draftsData.drafts.length === 0) ? (
                  <div className="bg-[#111111] p-8 rounded-[6px] border border-black text-center text-white/50 font-mono text-xs">
                    Nessuna bozza in attesa. Tutte le email sono state evase o inviate.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {draftsData.drafts.map((draft) => {
                      const isEditing = editingDraftId === draft.id
                      const isSending = sendingDraftId === draft.id

                      return (
                        <div
                          key={draft.id}
                          className="bg-[#111111] p-4 rounded-[6px] border border-black text-white shadow-md transition-all hover:border-white/20"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d946ef]/20 text-[#d946ef] border border-[#d946ef]/40 font-bold uppercase">
                                  {draft.actionTitle || 'Bozza Email'}
                                </span>
                                {draft.requiresReview && (
                                  <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase">
                                    Richiede Revisione
                                  </span>
                                )}
                                <span className="text-xs font-mono text-white/50">
                                  {new Date(draft.createdAt).toLocaleDateString('it-IT')} {new Date(draft.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="mt-1.5 text-sm font-bold text-[#00e5ff] font-mono">
                                A: {draft.recipient} {draft.company ? `(${draft.company})` : ''}
                              </div>
                            </div>

                            {/* Azioni sulla Bozza */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSendDraft(draft.id)}
                                disabled={isSending}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ffaa] hover:bg-[#00dd92] text-black font-mono font-bold text-xs rounded transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                                title="Invia immediatamente l'email tramite Gmail API"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isSending ? 'Invio...' : 'Invia con 1-Click'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (isEditing) {
                                    setEditingDraftId(null)
                                  } else {
                                    setEditingDraftId(draft.id)
                                    setEditDraftForm({ subject: draft.subject, body: draft.body })
                                  }
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-mono text-xs rounded transition-all cursor-pointer"
                              >
                                <FileEdit className="w-3 h-3" />
                                <span>{isEditing ? 'Annulla' : 'Modifica'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteDraft(draft.id)}
                                className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-500/40 rounded transition-all cursor-pointer"
                                title="Elimina questa bozza"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Se in modalità modifica, mostra form inline */}
                          {isEditing ? (
                            <div className="space-y-2.5 bg-black/60 p-3 rounded border border-white/20">
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">Oggetto Email</label>
                                <input
                                  type="text"
                                  value={editDraftForm.subject}
                                  onChange={e => setEditDraftForm({ ...editDraftForm, subject: e.target.value })}
                                  className="w-full bg-[#181818] border border-white/20 px-3 py-1.5 text-xs text-white font-mono rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">Testo Email</label>
                                <textarea
                                  rows={6}
                                  value={editDraftForm.body}
                                  onChange={e => setEditDraftForm({ ...editDraftForm, body: e.target.value })}
                                  className="w-full bg-[#181818] border border-white/20 p-3 text-xs text-white font-mono rounded"
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditDraft(draft.id)}
                                  className="px-3 py-1 bg-[#00ffaa] text-black font-mono font-bold text-xs rounded"
                                >
                                  Salva Modifiche
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-xs font-mono font-bold text-white mb-1.5">
                                Oggetto: <span className="text-white/90 font-normal">{draft.subject}</span>
                              </div>
                              <div className="bg-black/50 p-3 rounded border border-white/10 text-xs font-mono text-white/80 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                {draft.body}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Sezione Storico Email Inviate Automaticamente */}
              {draftsData.sentEmails?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-[#00ffaa]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-white bg-[#111111] px-3 py-1.5 rounded-[4px] border border-black flex items-center gap-2 shadow-sm font-mono">
                      <span>Storico Email Inviate</span>
                      <span className="text-[#00ffaa] font-extrabold">({draftsData.sentEmails.length})</span>
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {draftsData.sentEmails.map((sent, idx) => (
                      <div
                        key={idx}
                        className="bg-[#111111]/80 p-3 rounded-[6px] border border-black text-white text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 opacity-85 hover:opacity-100 transition-opacity"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00ffaa]" />
                          <span className="font-bold text-[#00ffaa]">A: {sent.recipient}</span>
                          <span className="text-white/60 truncate max-w-md">— {sent.subject}</span>
                        </div>
                        <div className="text-[11px] text-white/40 shrink-0">
                          {sent.sentAt ? new Date(sent.sentAt).toLocaleString('it-IT') : 'Inviata'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* ── MODAL NUOVA ATTIVITÀ ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#181818] border border-white/20 rounded-[8px] w-full max-w-lg overflow-hidden shadow-2xl">
            
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#141414]">
              <div>
                <h3 className="text-base font-black text-white font-mono uppercase tracking-wider">
                  + Nuova Attività CRM
                </h3>
                <p className="text-xs text-white/50">Programma un task, call, shooting o consegna DADO Studio</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3.5">
              
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-white/70 mb-1">
                  Titolo Attività *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es: Call conferma preventivo corporate"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#111111] border border-white/15 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00ffaa]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-white/70 mb-1">
                  Cliente Associato
                </label>
                <select
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-[#111111] border border-white/15 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00ffaa]"
                >
                  <option value="Generale / DADO Studio">DADO Creative Studio (Interno)</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.industry || 'Cliente'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-white/70 mb-1">
                    Tipologia
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#111111] border border-white/15 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00ffaa]"
                  >
                    <option value="commercial">📞 Commerciale & Call</option>
                    <option value="shooting">🎬 Shooting & Set</option>
                    <option value="postprod">💻 Post-Produzione</option>
                    <option value="admin">📄 Amministrazione</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-white/70 mb-1">
                    Priorità
                  </label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-[#111111] border border-white/15 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00ffaa]"
                  >
                    <option value="high">🔴 Alta / Urgente</option>
                    <option value="medium">🔵 Media standard</option>
                    <option value="low">⚪ Bassa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-white/70 mb-1">
                    Data Scadenza
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-[#111111] border border-white/15 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00ffaa]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-white/70 mb-1">
                    Orario
                  </label>
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={e => setFormData({ ...formData, dueTime: e.target.value })}
                    className="w-full bg-[#111111] border border-white/15 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00ffaa]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-white/70 mb-1">
                  Note Operative & Attrezzature Coinvolte
                </label>
                <textarea
                  rows={3}
                  placeholder="Es: Verificare carica batterie Sony, ottiche GM e invio liberatorie..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#111111] border border-white/15 rounded-none p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#00ffaa]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-mono font-bold text-white/60 hover:text-white"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#00ffaa] hover:bg-[#00e599] text-black font-mono font-bold text-xs rounded-none shadow-md disabled:opacity-50"
                >
                  {saving ? 'Salvataggio...' : 'Conferma e Salva'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}

// ── COMPONENTE CARD ATTIVITÀ SINGOLA (Stile Nero #111111 e Arancione #ff6f43 per prioritarie) ──
function ActivityCard({ activity, onToggle, onDelete, onUpdatePriority, onToggleChecklist, onOpenDrafts, isToday, isKanban }) {
  const isDone = activity.status === 'completed'
  const isPriority = !isDone && (activity.priority === 'high' || activity.priority === 'urgent_3d' || isToday || activity.due === 'today' || activity.period?.toLowerCase() === 'oggi')
  const cat = CATEGORIES[activity.type] || CATEGORIES.commercial
  const IconComponent = cat.icon

  // Colore del pallino di stato
  const dotColor = isDone
    ? '#94a3b8'
    : cat.color === '#ffffff'
    ? '#00ffaa'
    : cat.color

  const isAutoGenerated = activity.source === 'pipeline_llm_automation' || Boolean(activity.checklist?.length) || Boolean(activity.emailStatus)

  return (
    <div
      className={`rounded-[6px] border transition-all p-3.5 relative group shadow-sm bg-white ${
        isDone
          ? 'border-slate-200 opacity-65'
          : isPriority
          ? 'border-black shadow-md ring-1 ring-black/10'
          : 'border-slate-200 hover:border-slate-300'
      }`}
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="flex items-start gap-3">
        
        {/* Checkbox rotonda */}
        <button
          onClick={() => onToggle(activity)}
          className={`mt-0.5 flex-shrink-0 transition-colors ${
            isDone ? 'text-[#007a50]' : isPriority ? 'text-slate-700 hover:text-black' : 'text-slate-400 hover:text-[#007a50]'
          }`}
          title={isDone ? 'Segna come da fare' : 'Segna come completata'}
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-[#007a50]" />
          ) : (
            <Circle className={`w-5 h-5 hover:scale-110 transition-transform ${isPriority ? 'stroke-[2.5]' : ''}`} />
          )}
        </button>

        {/* Corpo della Card */}
        <div className="flex-1 min-w-0">
          
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Dicitura in cima con pallino dello stato invariato */}
              <span
                className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider bg-[#111111] text-white border border-black"
                style={{ fontFamily: '"Goldman", sans-serif' }}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                  style={{
                    backgroundColor: dotColor,
                    boxShadow: isDone ? 'none' : `0 0 6px ${dotColor}`
                  }}
                />
                <IconComponent className="w-3 h-3 text-white/80" />
                {cat.label}
              </span>

              {isAutoGenerated && (
                <span className="px-2 py-0.5 rounded-[4px] text-[9.5px] font-extrabold bg-[#7c3aed]/15 text-[#6d28d9] border border-[#7c3aed]/30 inline-flex items-center gap-1 uppercase tracking-wider font-mono">
                  <Bot className="w-3 h-3" />
                  Auto CRM
                </span>
              )}

              {activity.emailStatus === 'auto_sent' && (
                <span className="px-2 py-0.5 rounded-[4px] text-[9.5px] font-bold bg-[#00ffaa]/15 text-[#008f58] border border-[#00ffaa]/40 inline-flex items-center gap-1 uppercase tracking-wider font-mono">
                  <Send className="w-2.5 h-2.5" />
                  Conferma Inviata
                </span>
              )}

              {activity.emailStatus === 'draft_saved' && (
                <button
                  type="button"
                  onClick={() => onOpenDrafts && onOpenDrafts()}
                  className="px-2 py-0.5 rounded-[4px] text-[9.5px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/40 inline-flex items-center gap-1 uppercase tracking-wider font-mono hover:bg-amber-500/25 transition-colors cursor-pointer"
                  title="Clicca per aprire la bozza email pronta per l'invio"
                >
                  <Mail className="w-2.5 h-2.5" />
                  Bozza in attesa
                </button>
              )}

              {isPriority && (
                <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-[#ff6f43] text-white border border-black inline-flex items-center justify-center text-center uppercase tracking-wider" style={{ fontFamily: '"Goldman", sans-serif' }}>
                  Prioritaria
                </span>
              )}

              {isDone && (
                <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300 inline-flex items-center justify-center text-center uppercase tracking-wider" style={{ fontFamily: '"Goldman", sans-serif' }}>
                  Completata
                </span>
              )}
            </div>

            {/* Orario / Giorno e 4 Riquadri Priorità in Alto a Destra */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span style={{ fontFamily: '"Space Mono", monospace' }}>{activity.time || '10:00'}</span>
                {activity.period && (
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200" style={{ fontFamily: '"Goldman", sans-serif' }}>
                    {activity.period}
                  </span>
                )}
              </div>

              {/* 4 Riquadri in alto a destra per modificare la priorità del task */}
              <div className="flex items-center gap-0.5" title="Modifica priorità del task">
                {TASK_PRIORITIES.map((p) => {
                  const isSelected = activity.priority === p.id || (activity.priority === 'high' && p.id === 'urgent_3d') || (activity.priority === 'medium' && p.id === 'week_1') || (activity.priority === 'low' && p.id === 'month_1')
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onUpdatePriority && onUpdatePriority(activity.id, p.id)}
                      className={`px-1 py-0.5 text-[8px] font-mono font-black uppercase rounded transition-all cursor-pointer border ${
                        isSelected
                          ? 'shadow-[0_0_6px_rgba(0,0,0,0.2)] scale-105'
                          : 'opacity-40 hover:opacity-100'
                      }`}
                      style={{
                        color: p.color,
                        backgroundColor: isSelected ? p.bg : 'rgba(0,0,0,0.05)',
                        borderColor: isSelected ? p.border : 'rgba(0,0,0,0.15)',
                      }}
                      title={p.label}
                    >
                      {p.code}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Titolo Attività */}
          <div
            className={`text-sm md:text-base leading-snug ${
              isDone ? 'line-through text-slate-400 font-medium' : 'text-slate-900 font-bold'
            }`}
            style={{ fontFamily: '"Goldman", sans-serif' }}
          >
            {activity.title}
          </div>

          {/* Azienda / Cliente con Acronimo B.A.N.T. */}
          <div className="flex items-center justify-between gap-1.5 text-xs mt-1.5 font-mono text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate text-slate-800 font-bold">
                {activity.company || 'DADO Studio'}
              </span>
            </div>
            <BantLogoMark size="sm" />
          </div>

          {/* Checklist interattiva generata dall'automazione */}
          {Array.isArray(activity.checklist) && activity.checklist.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-[#007a50]" />
                Checklist operativa post-aggiornamento:
              </div>
              <div className="space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                {activity.checklist.map((item, idx) => {
                  const checked = item.startsWith('✓ ')
                  const text = checked ? item.replace('✓ ', '') : item
                  return (
                    <div
                      key={idx}
                      onClick={() => onToggleChecklist && onToggleChecklist(activity, idx)}
                      className="flex items-start gap-1.5 text-[11px] font-sans text-slate-700 cursor-pointer hover:text-black transition-colors"
                    >
                      {checked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#007a50] shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 shrink-0 mt-0.5" />
                      )}
                      <span className={checked ? 'line-through text-slate-400' : ''}>
                        {text}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Note / Dettagli operativi */}
          {activity.notes && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <p className="text-[12px] leading-relaxed font-sans p-2 rounded border bg-slate-50 border-slate-200 text-slate-700 font-normal whitespace-pre-line">
                {activity.notes}
              </p>
            </div>
          )}

        </div>

        {/* Riquadro all'interno della finestra del task con la dicitura "Rimuovi" */}
        <button
          onClick={() => onDelete(activity.id)}
          className="self-center px-2 py-1 rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-mono text-[10px] font-bold uppercase transition-all shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
          title="Rimuovi attività"
        >
          <Trash2 className="w-3 h-3" />
          <span>Rimuovi</span>
        </button>

      </div>
    </div>
  )
}
