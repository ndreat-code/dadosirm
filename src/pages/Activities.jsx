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
  ShieldCheck,
  Zap
} from 'lucide-react'

// Categorie in perfetta armonia con la palette DADO
const CATEGORIES = {
  commercial: {
    label: 'Commerciale & Call',
    icon: Phone,
    color: '#0284c7', // Ciano / Azzurro
    bg: '#e0f2fe',
    border: '#bae6fd',
  },
  shooting: {
    label: 'Shooting & Set',
    icon: Camera,
    color: '#a855f7', // Magenta / Viola studio
    bg: '#f3e8ff',
    border: '#e9d5ff',
  },
  postprod: {
    label: 'Post-Produzione & Consegne',
    icon: Video,
    color: '#059669', // Verde smeraldo
    bg: '#d1fae5',
    border: '#a7f3d0',
  },
  admin: {
    label: 'Amministrazione & Contratti',
    icon: FileText,
    color: '#475569',
    bg: '#f1f5f9',
    border: '#cbd5e1',
  },
}

// ── Acronimo B.A.N.T. stile Brand Logo DADO ──
function BantLogoMark({ size = 'sm' }) {
  const isSm = size === 'sm'
  return (
    <div
      className="inline-flex items-center gap-1 select-none px-1.5 py-0.5 rounded-md bg-white border border-sky-200 shadow-xs shrink-0"
      title="Framework B.A.N.T. (Budget • Authority • Need • Timeline)"
      style={{ fontFamily: '"Switzer", sans-serif' }}
    >
      <div className="flex items-center gap-0.5">
        <span className={`font-black ${isSm ? 'text-[10px]' : 'text-[12px]'} text-[#16a34a]`}>
          B
        </span>
        <span className="w-0.5 h-0.5 rounded-full bg-[#16a34a]" />
      </div>
      <div className="flex items-center gap-0.5">
        <span className={`font-black ${isSm ? 'text-[10px]' : 'text-[12px]'} text-[#dc2626]`}>
          A
        </span>
        <span className="w-0.5 h-0.5 rounded-full bg-[#dc2626]" />
      </div>
      <div className="flex items-center gap-0.5">
        <span className={`font-black ${isSm ? 'text-[10px]' : 'text-[12px]'} text-[#0284c7]`}>
          N
        </span>
        <span className="w-0.5 h-0.5 rounded-full bg-[#0284c7]" />
      </div>
      <div className="flex items-center gap-0.5">
        <span className={`font-black ${isSm ? 'text-[10px]' : 'text-[12px]'} text-[#d97706]`}>
          T
        </span>
      </div>
    </div>
  )
}

// 4 Opzioni Priorità Task:
const TASK_PRIORITIES = [
  {
    id: 'urgent_3d',
    code: '3 gg',
    label: 'Urgente entro 3 giorni',
    color: '#dc2626',
    bg: '#fee2e2',
    border: '#fca5a5',
  },
  {
    id: 'week_1',
    code: '1 sett',
    label: 'Entro una settimana',
    color: '#d97706',
    bg: '#fef3c7',
    border: '#fde68a',
  },
  {
    id: 'weeks_2_3',
    code: '2-3 sett',
    label: 'Non urgente 2/3 settimane',
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#bae6fd',
  },
  {
    id: 'month_1',
    code: '1 mese',
    label: 'Quando trovi un po\' di tempo nell\'arco di un mese',
    color: '#16a34a',
    bg: '#dcfce7',
    border: '#bbf7d0',
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
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'today', 'pending', 'completed'
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
        const sweeps = result.sweepSummary || {}
        setPipelineSyncMsg(`Pipeline completata con successo! Trovate ${sweeps.processedEmails || 0} nuove email, generati ${sweeps.generatedTasks || 0} task e ${sweeps.generatedDrafts || 0} bozze.`)
        // Ricarica attività e bozze
        const crmRes = await fetch('/api/crm/summary')
        if (crmRes.ok) {
          const d = await crmRes.json()
          if (d.nextActions) setActivities(d.nextActions)
        }
        await loadDrafts()
      } else {
        setPipelineSyncMsg(`Esito: ${result.message || 'Scansione completata senza nuovi messaggi.'}`)
      }
    } catch (err) {
      setPipelineSyncMsg('Errore connessione con background pipeline.')
    } finally {
      setSyncingPipeline(false)
    }
  }

  // Invia bozza con 1-click
  async function handleSendDraft(draftId) {
    setSendingDraftId(draftId)
    try {
      const res = await fetch(`/api/pipeline/drafts/${draftId}/send`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        await loadDrafts()
      } else {
        alert(data.error || 'Errore durante l\'invio della bozza')
      }
    } catch (err) {
      alert('Impossibile contattare il server per l\'invio')
    } finally {
      setSendingDraftId(null)
    }
  }

  // Salva modifiche inline alla bozza
  async function handleSaveEditDraft(draftId) {
    try {
      const res = await fetch(`/api/pipeline/drafts/${draftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDraftForm)
      })
      if (res.ok) {
        setEditingDraftId(null)
        await loadDrafts()
      }
    } catch (e) {
      console.error('Errore aggiornamento bozza:', e)
    }
  }

  // Elimina bozza
  async function handleDeleteDraft(draftId) {
    if (!confirm('Vuoi eliminare questa bozza email?')) return
    try {
      const res = await fetch(`/api/pipeline/drafts/${draftId}`, { method: 'DELETE' })
      if (res.ok) {
        await loadDrafts()
      }
    } catch (e) {
      console.error('Errore eliminazione bozza:', e)
    }
  }

  // Toggle stato attività
  async function toggleStatus(activity) {
    const newStatus = activity.status === 'completed' ? 'pending' : 'completed'
    try {
      const res = await fetch(`/api/crm/activities/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setActivities(prev =>
          prev.map(a => (a.id === activity.id ? { ...a, status: newStatus } : a))
        )
      }
    } catch (err) {
      console.error('Errore update status:', err)
    }
  }

  // Modifica priorità
  async function handleUpdatePriority(activityId, newPriority) {
    try {
      const res = await fetch(`/api/crm/activities/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority })
      })
      if (res.ok) {
        setActivities(prev =>
          prev.map(a => (a.id === activityId ? { ...a, priority: newPriority } : a))
        )
      }
    } catch (err) {
      console.error('Errore update priorità:', err)
    }
  }

  // Toggle singola voce checklist operativa
  async function toggleChecklistItem(activity, itemIdx) {
    if (!activity.checklist) return
    const updated = [...activity.checklist]
    const cur = updated[itemIdx]
    if (cur.startsWith('✓ ')) {
      updated[itemIdx] = cur.replace('✓ ', '')
    } else {
      updated[itemIdx] = '✓ ' + cur
    }

    try {
      const res = await fetch(`/api/crm/activities/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: updated })
      })
      if (res.ok) {
        setActivities(prev =>
          prev.map(a => (a.id === activity.id ? { ...a, checklist: updated } : a))
        )
      }
    } catch (err) {
      console.error('Errore update checklist:', err)
    }
  }

  // Elimina attività
  async function handleDelete(id) {
    if (!confirm('Sei sicuro di voler eliminare questa attività?')) return
    try {
      const res = await fetch(`/api/crm/activities/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setActivities(prev => prev.filter(a => a.id !== id))
        if (currentTaskIdx > 0) setCurrentTaskIdx(i => i - 1)
      }
    } catch (err) {
      console.error('Errore cancellazione:', err)
    }
  }

  // Crea nuova attività
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

      if (statusFilter === 'today') {
        return a.status !== 'completed' && (a.due === 'today' || a.period?.toLowerCase() === 'oggi' || a.priority === 'urgent_3d' || a.priority === 'high')
      }
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
    <div
      className="h-full min-h-screen md:min-h-0 flex flex-col flex-1 relative overflow-hidden"
      style={{
        backgroundColor: 'transparent',
        fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* ── CANVAS AZZURRO TENUE COME LA "O" DI DADO (SENZA NERO E SENZA VERDE BILIARDO) ── */}
      <div
        className="h-full flex-1 rounded-tl-[36px] rounded-bl-[36px] flex flex-col justify-between relative min-w-0 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #f0f8fd 0%, #e5f3fa 100%)',
          borderLeft: '1.5px solid #d4ebf9',
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* ── Contenuto Principale con scroll ── */}
        <div className="flex-1 min-h-0 px-4 md:px-7 py-3 overflow-y-auto">

          {/* ── TESTATA IN SWITZER CON SWITCHER TABS ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-sky-200/80">
            <div>
              <h1
                className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2"
                style={{ fontFamily: '"Switzer", sans-serif' }}
              >
                <span>Activities</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0284c7] font-extrabold border border-sky-200">
                  PIPELINE
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Pianificazione operativa, calendario set e automazioni
              </p>
            </div>

            {/* Switcher Tab Superiore */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setMainTab('tasks')}
                className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all border cursor-pointer ${
                  mainTab === 'tasks'
                    ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-xs'
                    : 'bg-white/80 hover:bg-white text-slate-700 border-sky-200'
                }`}
              >
                Attività ({activities.length})
              </button>

              <button
                type="button"
                onClick={() => setMainTab('drafts')}
                className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all border flex items-center gap-1.5 cursor-pointer ${
                  mainTab === 'drafts'
                    ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-xs'
                    : 'bg-white/80 hover:bg-white text-slate-700 border-sky-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Bozze & Invii</span>
                {draftsData.drafts?.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#d946ef] text-white font-black animate-pulse">
                    {draftsData.drafts.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={triggerPipelineSync}
                disabled={syncingPipeline}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-sky-200 font-extrabold text-xs rounded-xl transition-all shadow-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                title="Esegui scansione immediata email, generazione tasks e bozze"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#0284c7] ${syncingPipeline ? 'animate-spin' : ''}`} />
                <span>{syncingPipeline ? 'Analisi...' : 'Automazione ⚡'}</span>
              </button>
            </div>
          </div>

          {/* Banner notifica feedback scansione pipeline */}
          {pipelineSyncMsg && (
            <div className="mb-4 p-3 rounded-xl bg-white border border-sky-300 text-[#0284c7] text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#0284c7]" />
                <span>{pipelineSyncMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setPipelineSyncMsg(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* ── SELEZIONE CONTENUTO: TASKS OPPURE BOZZE/INVII AUTOMATICI ── */}
          {mainTab === 'tasks' ? (
            <div>
              {/* ── PULSANTI COLOR GRIGIO METALLIZZATO: TO DO, IN PROGRAMMA, + NUOVA ATTIVITÀ ── */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                
                {/* 1. Pulsante Metallizzato: TO DO */}
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter(statusFilter === 'today' ? 'all' : 'today')
                    setCategoryFilter('all')
                  }}
                  className="px-4 py-2.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-sm active:scale-95 cursor-pointer border"
                  style={{
                    background: statusFilter === 'today'
                      ? 'linear-gradient(180deg, #94a3b8 0%, #64748b 50%, #475569 100%)'
                      : 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 45%, #cbd5e1 55%, #94a3b8 100%)',
                    borderColor: statusFilter === 'today' ? '#334155' : '#94a3b8',
                    boxShadow: statusFilter === 'today'
                      ? 'inset 0 2px 4px rgba(0,0,0,0.35)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 5px rgba(15,23,42,0.14)',
                    color: statusFilter === 'today' ? '#ffffff' : '#0f172a',
                    fontFamily: '"Switzer", sans-serif',
                  }}
                  title="Filtra attività To Do (in scadenza oggi / prioritarie)"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] shadow-xs" />
                  <span>TO DO</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-black ${
                    statusFilter === 'today' ? 'bg-white/20 text-white' : 'bg-slate-900/10 text-slate-900'
                  }`}>
                    {stats.dueToday}
                  </span>
                </button>

                {/* 2. Pulsante Metallizzato: IN PROGRAMMA */}
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')
                    setCategoryFilter('all')
                  }}
                  className="px-4 py-2.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-sm active:scale-95 cursor-pointer border"
                  style={{
                    background: statusFilter === 'pending'
                      ? 'linear-gradient(180deg, #94a3b8 0%, #64748b 50%, #475569 100%)'
                      : 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 45%, #cbd5e1 55%, #94a3b8 100%)',
                    borderColor: statusFilter === 'pending' ? '#334155' : '#94a3b8',
                    boxShadow: statusFilter === 'pending'
                      ? 'inset 0 2px 4px rgba(0,0,0,0.35)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 5px rgba(15,23,42,0.14)',
                    color: statusFilter === 'pending' ? '#ffffff' : '#0f172a',
                    fontFamily: '"Switzer", sans-serif',
                  }}
                  title="Filtra attività in programma (in coda / pipeline)"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] shadow-xs" />
                  <span>IN PROGRAMMA</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-black ${
                    statusFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-900/10 text-slate-900'
                  }`}>
                    {stats.pending}
                  </span>
                </button>

                {/* 3. Pulsante Metallizzato: + NUOVA ATTIVITÀ */}
                <button
                  type="button"
                  onClick={() => {
                    if (companies.length > 0 && !formData.company) {
                      setFormData(f => ({ ...f, company: companies[0].name }))
                    }
                    setShowAddModal(true)
                  }}
                  className="px-4 py-2.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer border"
                  style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 45%, #cbd5e1 55%, #94a3b8 100%)',
                    borderColor: '#94a3b8',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 5px rgba(15,23,42,0.14)',
                    color: '#0f172a',
                    fontFamily: '"Switzer", sans-serif',
                  }}
                  title="Crea una nuova attività CRM"
                >
                  <Plus className="w-4 h-4 stroke-[3] text-[#0284c7]" />
                  <span>+ NUOVA ATTIVITÀ</span>
                </button>

              </div>

              {/* ── CONSOLE ATTIVITÀ IN SWITZER E STILE CHIARO (WALKMAN SKIP, PRIORITÀ, CHIUDI) ── */}
              {activeTask && (
                <div
                  className="p-4 rounded-2xl border border-sky-200 mb-5 shadow-xs relative overflow-hidden bg-white text-slate-800"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  {/* Riga Superiore: Contatore, Walkman Skip Controls & 4 Riquadri Priorità in Alto a Destra */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-100">
                    {/* Sinistra: Contatore e Frecce Walkman Skip */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-sky-100 text-[#0284c7] uppercase">
                        ATTIVITÀ {Math.min(currentTaskIdx + 1, activities.length)} DI {activities.length}
                      </span>

                      {/* Controlli Walkman Skip */}
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200" title="Skip task (frecce stile walkman)">
                        <button
                          type="button"
                          onClick={() => setCurrentTaskIdx(i => (i - 1 + activities.length) % activities.length)}
                          className="px-2 py-1 hover:bg-white text-slate-700 rounded text-xs font-black flex items-center gap-0.5 cursor-pointer transition-colors"
                          title="Torna all'attività precedente"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>PREV</span>
                        </button>
                        <span className="text-slate-300 font-bold">|</span>
                        <button
                          type="button"
                          onClick={() => setCurrentTaskIdx(i => (i + 1) % activities.length)}
                          className="px-2 py-1 hover:bg-white text-[#0284c7] rounded text-xs font-black flex items-center gap-0.5 cursor-pointer transition-colors"
                          title="Skip: passa all'attività successiva"
                        >
                          <span>SKIP</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Destra: 4 Opzioni per modificare la priorità del task */}
                    <div className="flex items-center gap-1" title="Modifica priorità del task">
                      <span className="text-xs text-slate-400 font-black mr-1 hidden sm:inline">PRIORITÀ:</span>
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
                            className={`px-2 py-1 text-[11px] font-black uppercase rounded-md transition-all cursor-pointer border ${
                              isSelected
                                ? 'ring-2 ring-slate-800 scale-105 shadow-xs font-extrabold'
                                : 'opacity-60 hover:opacity-100'
                            }`}
                            style={{
                              color: p.color,
                              backgroundColor: p.bg,
                              borderColor: p.border,
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
                          className={`text-lg md:text-xl font-black tracking-tight ${
                            activeTask.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {activeTask.title}
                        </span>
                        {activeTask.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ COMPLETATO
                          </span>
                        )}
                      </div>

                      {/* Company con Logo B.A.N.T. e orario */}
                      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[#0284c7] font-black">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{activeTask.company || 'DADO Studio'}</span>
                        </div>
                        <BantLogoMark size="sm" />
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500 font-bold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {activeTask.date || 'Oggi'} {activeTask.time || ''}
                        </span>
                      </div>

                      {activeTask.notes && (
                        <p className="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 line-clamp-2">
                          {activeTask.notes}
                        </p>
                      )}
                    </div>

                    {/* Azioni: Tasto Task Concluso (Spunta) + Riquadro Rimuovi */}
                    <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-sky-100">
                      <button
                        type="button"
                        onClick={() => toggleStatus(activeTask)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                          activeTask.status === 'completed'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-[#16a34a] hover:bg-[#15803d] text-white border border-[#16a34a]'
                        }`}
                        title={activeTask.status === 'completed' ? 'Riapri attività' : 'Segna come conclusa'}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{activeTask.status === 'completed' ? 'Riapri' : 'Task Concluso'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(activeTask.id)}
                        className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black uppercase transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                        title="Elimina definitivamente questa attività dal CRM"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Rimuovi</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TOOLBAR: CERCA, FILTRI & SWITCHER VISTA IN STILE CHIARO ── */}
              <div
                className="bg-white p-3.5 rounded-2xl border border-sky-200 mb-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xs"
                style={{ fontFamily: '"Switzer", sans-serif' }}
              >
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  {/* Campo Cerca */}
                  <div className="relative min-w-[200px] flex-1 max-w-xs">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cerca attività, cliente o note..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] font-semibold"
                    />
                  </div>

                  {/* Filtro Categoria */}
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] font-bold"
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
                    className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] font-bold"
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
                    className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] font-bold"
                  >
                    <option value="all">Tutti gli stati</option>
                    <option value="today">⚡ Solo To Do (Oggi)</option>
                    <option value="pending">In programma (Sospeso)</option>
                    <option value="completed">Completate</option>
                  </select>
                </div>

                {/* Switcher Vista Timeline / Kanban */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-end lg:self-center">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    Timeline
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      viewMode === 'kanban'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    Kanban
                  </button>
                </div>
              </div>

              {/* ── RENDERING PRINCIPALE: LISTA O KANBAN IN STILE AZZURRO TENUE ── */}
              {loading ? (
                <div className="p-12 text-center text-slate-500 font-bold text-sm">Caricamento attività DADO Studio...</div>
              ) : viewMode === 'list' ? (
                /* VISTA TIMELINE LISTA */
                <div className="space-y-6 pb-12" style={{ fontFamily: '"Switzer", sans-serif' }}>
                  
                  {/* Sezione: TO DO (Oggi / Prioritarie) */}
                  {todayTasks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] animate-pulse" />
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-sky-200 flex items-center gap-2 shadow-xs">
                          <span>TO DO / OGGI</span>
                          <span className="text-[#ea580c] font-black">({todayTasks.length})</span>
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {todayTasks.map(act => (
                          <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} isToday />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sezione: IN PROGRAMMA (In coda / Prossimi Giorni) */}
                  {upcomingTasks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <Calendar className="w-4 h-4 text-[#0284c7]" />
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-sky-200 flex items-center gap-2 shadow-xs">
                          <span>IN PROGRAMMA</span>
                          <span className="text-[#0284c7] font-black">({upcomingTasks.length})</span>
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {upcomingTasks.map(act => (
                          <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sezione: COMPLETATE */}
                  {completedTasks.length > 0 && statusFilter !== 'today' && statusFilter !== 'pending' && (
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 bg-white/80 px-3 py-1.5 rounded-xl border border-sky-200 flex items-center gap-2 shadow-xs">
                          <span>COMPLETATE</span>
                          <span className="text-[#16a34a] font-black">({completedTasks.length})</span>
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-75 hover:opacity-100 transition-opacity">
                        {completedTasks.map(act => (
                          <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredActivities.length === 0 && (
                    <div className="bg-white p-10 rounded-2xl border border-sky-200 text-center text-slate-500 font-bold text-sm shadow-xs">
                      Nessuna attività trovata con i filtri selezionati.
                    </div>
                  )}

                </div>
              ) : (
                /* VISTA KANBAN A COLONNE */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12" style={{ fontFamily: '"Switzer", sans-serif' }}>
                  
                  {/* Colonna 1: In Programma */}
                  <div className="bg-white p-4 rounded-2xl border border-sky-200 flex flex-col shadow-xs">
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-sky-100">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                        <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                        <span>In Programma</span>
                      </div>
                      <span className="text-xs bg-sky-100 px-2 py-0.5 rounded-full text-[#0284c7] font-black">
                        {upcomingTasks.length}
                      </span>
                    </div>
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                      {upcomingTasks.map(act => (
                        <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} isKanban />
                      ))}
                      {upcomingTasks.length === 0 && (
                        <div className="text-center py-8 text-xs text-slate-400 font-medium">Nessuna attività in coda</div>
                      )}
                    </div>
                  </div>

                  {/* Colonna 2: To Do (Oggi) */}
                  <div className="bg-white p-4 rounded-2xl border-2 border-[#ea580c]/50 flex flex-col shadow-xs">
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-sky-100">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#ea580c]">
                        <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-ping" />
                        <span>To Do / Oggi</span>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-black">
                        {todayTasks.length}
                      </span>
                    </div>
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                      {todayTasks.map(act => (
                        <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} isToday isKanban />
                      ))}
                      {todayTasks.length === 0 && (
                        <div className="text-center py-8 text-xs text-slate-400 font-medium">Nessun task urgente per oggi</div>
                      )}
                    </div>
                  </div>

                  {/* Colonna 3: Completate */}
                  <div className="bg-white p-4 rounded-2xl border border-sky-200 flex flex-col shadow-xs">
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-sky-100">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#16a34a]">
                        <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                        <span>Completate</span>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">
                        {completedTasks.length}
                      </span>
                    </div>
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1 opacity-80 hover:opacity-100 transition-opacity">
                      {completedTasks.map(act => (
                        <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} isKanban />
                      ))}
                      {completedTasks.length === 0 && (
                        <div className="text-center py-8 text-xs text-slate-400 font-medium">Nessuna attività completata</div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          ) : (
            /* ── VISTA BOZZE EMAIL & INVII AUTOMATICI PIPELINE AI ── */
            <div className="space-y-6 pb-12 animate-in fade-in" style={{ fontFamily: '"Switzer", sans-serif' }}>
              
              {/* Box Regole di Invio Automatico & Sicurezza CRM */}
              <div className="bg-white p-4 rounded-2xl border border-sky-200 shadow-xs">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-sky-100">
                  <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Protocollo di Sicurezza Invio Email & Regole di Automazione
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#16a34a] font-black mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                        1. Conferma Trattative
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Invio automatico immediato solo per accordi positivi firmati o declini cortesi.
                      </p>
                    </div>
                    <span className="mt-2 text-[10px] text-[#16a34a] font-extrabold">● INVIO AUTOMATICO ATTIVO</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#0284c7] font-black mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                        2. Conferma Appuntamenti & Call
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Verifica in tempo reale dello slot a calendario: se libero invia la conferma, se occupato salva in bozza.
                      </p>
                    </div>
                    <span className="mt-2 text-[10px] text-[#0284c7] font-extrabold">● VERIFICA CALENDARIO ATTIVA</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#a855f7] font-black mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
                        3. Info Servizi & Collabs
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Invio automatico di brochure, scheda servizi e listino su richieste di primo contatto o partnership.
                      </p>
                    </div>
                    <span className="mt-2 text-[10px] text-[#a855f7] font-extrabold">● INVIO AUTOMATICO ATTIVO</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-sky-100 flex items-center gap-2 text-xs text-amber-800 font-bold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>
                    Tutte le altre comunicazioni (preventivi su misura, negoziazioni, revisioni contrattuali) vengono <strong>tassativamente salvate come bozze</strong> per revisione e invio manuale con 1-click.
                  </span>
                </div>
              </div>

              {/* Sezione Bozze Pronte */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0284c7]" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-sky-200 flex items-center gap-2 shadow-xs">
                      <span>Bozze Email Pronte per Invio / Revisione</span>
                      <span className="text-[#a855f7] font-black">({draftsData.drafts?.length || 0})</span>
                    </h2>
                  </div>
                </div>

                {(!draftsData.drafts || draftsData.drafts.length === 0) ? (
                  <div className="bg-white p-8 rounded-2xl border border-sky-200 text-center text-slate-500 font-bold text-xs shadow-xs">
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
                          className="bg-white p-4 rounded-2xl border border-sky-200 text-slate-800 shadow-xs relative"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-sky-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-[#0284c7]">
                                  {draft.recipientName || draft.recipient}
                                </span>
                                <span className="text-xs text-slate-500">
                                  &lt;{draft.recipient}&gt;
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                Generata: {new Date(draft.createdAt).toLocaleString('it-IT')}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSendDraft(draft.id)}
                                disabled={isSending}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-xs rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
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
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                              >
                                <FileEdit className="w-3 h-3" />
                                <span>{isEditing ? 'Annulla' : 'Modifica'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteDraft(draft.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-all cursor-pointer"
                                title="Elimina questa bozza"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Se in modalità modifica, mostra form inline */}
                          {isEditing ? (
                            <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                              <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Oggetto Email</label>
                                <input
                                  type="text"
                                  value={editDraftForm.subject}
                                  onChange={e => setEditDraftForm({ ...editDraftForm, subject: e.target.value })}
                                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 rounded-lg font-medium"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Testo Email</label>
                                <textarea
                                  rows={6}
                                  value={editDraftForm.body}
                                  onChange={e => setEditDraftForm({ ...editDraftForm, body: e.target.value })}
                                  className="w-full bg-white border border-slate-300 p-3 text-xs text-slate-800 rounded-lg font-medium"
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditDraft(draft.id)}
                                  className="px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs rounded-lg cursor-pointer"
                                >
                                  Salva Modifiche
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-xs font-black text-slate-900 mb-1.5">
                                Oggetto: <span className="font-semibold text-slate-700">{draft.subject}</span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-medium">
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
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-sky-200 flex items-center gap-2 shadow-xs">
                      <span>Storico Email Inviate</span>
                      <span className="text-[#16a34a] font-black">({draftsData.sentEmails.length})</span>
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {draftsData.sentEmails.map((sent, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-xl border border-sky-200 text-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                          <span className="font-black text-[#16a34a]">A: {sent.recipient}</span>
                          <span className="text-slate-600 truncate max-w-md">— {sent.subject}</span>
                        </div>
                        <div className="text-xs text-slate-400 shrink-0 font-medium">
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

      {/* ── MODAL NUOVA ATTIVITÀ IN STILE CHIARO E SWITZER ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="bg-white border border-sky-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-800"
            style={{ fontFamily: '"Switzer", sans-serif' }}
          >
            <div className="p-5 border-b border-sky-100 flex items-center justify-between bg-sky-50/50">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                  + Nuova Attività CRM
                </h3>
                <p className="text-xs text-slate-500 font-medium">Programma un task, call, shooting o consegna DADO Studio</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3.5">
              
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Titolo Attività *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es: Call conferma preventivo corporate"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Azienda / Cliente
                  </label>
                  <input
                    type="text"
                    placeholder="Es: Alfa Fashion Milano"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#0284c7]"
                  >
                    <option value="commercial">📞 Commerciale & Call</option>
                    <option value="shooting">🎬 Shooting & Set</option>
                    <option value="postprod">💻 Post-Produzione</option>
                    <option value="admin">📄 Amministrazione</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Data Scadenza
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Orario
                  </label>
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={e => setFormData({ ...formData, dueTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Note Operative & Attrezzature Coinvolte
                </label>
                <textarea
                  rows={3}
                  placeholder="Es: Verificare carica batterie Sony, ottiche GM e invio liberatorie..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-extrabold text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
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

// ── COMPONENTE CARD ATTIVITÀ SINGOLA IN SWITZER E STILE CHIARO DADO ──
function ActivityCard({ activity, onToggle, onDelete, onUpdatePriority, onToggleChecklist, onOpenDrafts, isToday, isKanban }) {
  const isDone = activity.status === 'completed'
  const isPriority = !isDone && (activity.priority === 'high' || activity.priority === 'urgent_3d' || isToday || activity.due === 'today' || activity.period?.toLowerCase() === 'oggi')
  const cat = CATEGORIES[activity.type] || CATEGORIES.commercial
  const IconComponent = cat.icon

  const dotColor = isDone
    ? '#94a3b8'
    : cat.color === '#ffffff'
    ? '#16a34a'
    : cat.color

  const isAutoGenerated = activity.source === 'pipeline_llm_automation' || Boolean(activity.checklist?.length) || Boolean(activity.emailStatus)

  return (
    <div
      className={`rounded-2xl border transition-all p-3.5 relative group shadow-xs bg-white ${
        isDone
          ? 'border-slate-200 opacity-65'
          : isPriority
          ? 'border-sky-300 shadow-md ring-1 ring-sky-200'
          : 'border-sky-200/80 hover:border-sky-300 hover:shadow-sm'
      }`}
      style={{
        backgroundColor: '#ffffff',
        fontFamily: '"Switzer", sans-serif',
      }}
    >
      <div className="flex items-start gap-3">
        
        {/* Checkbox rotonda */}
        <button
          onClick={() => onToggle(activity)}
          className={`mt-0.5 shrink-0 transition-colors cursor-pointer ${
            isDone ? 'text-[#16a34a]' : isPriority ? 'text-[#ea580c] hover:text-black' : 'text-slate-400 hover:text-[#16a34a]'
          }`}
          title={isDone ? 'Segna come da fare' : 'Segna come completata'}
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
          ) : (
            <Circle className={`w-5 h-5 hover:scale-110 transition-transform ${isPriority ? 'stroke-[2.5]' : ''}`} />
          )}
        </button>

        {/* Corpo della Card */}
        <div className="flex-1 min-w-0">
          
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Categoria con icona */}
              <span
                className="px-2 py-0.5 rounded-md text-[11px] font-black flex items-center gap-1.5 uppercase tracking-wider"
                style={{
                  backgroundColor: cat.bg,
                  color: cat.color,
                  border: `1px solid ${cat.border}`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block shrink-0"
                  style={{
                    backgroundColor: dotColor,
                  }}
                />
                <IconComponent className="w-3 h-3" />
                <span>{cat.label}</span>
              </span>

              {isAutoGenerated && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1 uppercase tracking-wider">
                  <Bot className="w-3 h-3" />
                  Auto CRM
                </span>
              )}

              {activity.emailStatus === 'auto_sent' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 uppercase tracking-wider">
                  <Send className="w-2.5 h-2.5" />
                  Conferma Inviata
                </span>
              )}

              {activity.emailStatus === 'draft_saved' && (
                <button
                  type="button"
                  onClick={() => onOpenDrafts && onOpenDrafts()}
                  className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1 uppercase tracking-wider hover:bg-amber-100 transition-colors cursor-pointer"
                  title="Clicca per aprire la bozza email pronta per l'invio"
                >
                  <Mail className="w-2.5 h-2.5" />
                  Bozza in attesa
                </button>
              )}

              {isPriority && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white inline-flex items-center justify-center text-center uppercase tracking-wider">
                  Prioritaria
                </span>
              )}

              {isDone && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-200 text-slate-700 border border-slate-300 inline-flex items-center justify-center text-center uppercase tracking-wider">
                  Completata
                </span>
              )}
            </div>

            {/* Orario / Giorno e 4 Riquadri Priorità in Alto a Destra */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{activity.time || '10:00'}</span>
                {activity.period && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
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
                      className={`px-1 py-0.5 text-[9px] font-black uppercase rounded-md transition-all cursor-pointer border ${
                        isSelected
                          ? 'ring-1 ring-slate-800 scale-105 font-extrabold shadow-xs'
                          : 'opacity-40 hover:opacity-100'
                      }`}
                      style={{
                        color: p.color,
                        backgroundColor: isSelected ? p.bg : 'rgba(0,0,0,0.02)',
                        borderColor: isSelected ? p.border : 'rgba(0,0,0,0.1)',
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
              isDone ? 'line-through text-slate-400 font-medium' : 'text-slate-900 font-black'
            }`}
          >
            {activity.title}
          </div>

          {/* Azienda / Cliente con Acronimo B.A.N.T. */}
          <div className="flex items-center justify-between gap-1.5 text-xs mt-1.5 text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate text-slate-800 font-extrabold">
                {activity.company || 'DADO Studio'}
              </span>
            </div>
            <BantLogoMark size="sm" />
          </div>

          {/* Checklist interattiva */}
          {Array.isArray(activity.checklist) && activity.checklist.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-[#16a34a]" />
                Checklist operativa post-aggiornamento:
              </div>
              <div className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                {activity.checklist.map((item, idx) => {
                  const checked = item.startsWith('✓ ')
                  const text = checked ? item.replace('✓ ', '') : item
                  return (
                    <div
                      key={idx}
                      onClick={() => onToggleChecklist && onToggleChecklist(activity, idx)}
                      className="flex items-start gap-1.5 text-xs text-slate-700 cursor-pointer hover:text-black transition-colors"
                    >
                      {checked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#16a34a] shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 shrink-0 mt-0.5" />
                      )}
                      <span className={checked ? 'line-through text-slate-400 font-normal' : 'font-semibold'}>
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
              <p className="text-xs leading-relaxed p-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 font-medium whitespace-pre-line">
                {activity.notes}
              </p>
            </div>
          )}

        </div>

        {/* Pulsante Rimuovi */}
        <button
          onClick={() => onDelete(activity.id)}
          className="self-center px-2 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
          title="Rimuovi attività"
        >
          <Trash2 className="w-3 h-3" />
          <span>Rimuovi</span>
        </button>

      </div>
    </div>
  )
}
