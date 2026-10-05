import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
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
  Zap,
  UserCheck,
  UserPlus,
  User
} from 'lucide-react'
import { useAuth, DEFAULT_USERS } from '../context/AuthContext'

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

// Helper per valutare la qualificazione B.A.N.T. dell'attività
function getActivityBant(activity, companies = []) {
  const isInvalid = (val, keywords) => {
    if (!val) return true
    const s = String(val).toLowerCase().trim()
    return keywords.some(k => s.includes(k))
  }

  const badB = ['non specificato', 'da definire', 'mancante', 'null', 'non deliberato', 'n/d', 'nd']
  const badA = ['non specificato', 'da verificare', 'mancante', 'null', 'in attesa', 'n/d', 'nd']
  const badN = ['non specificato', 'da chiarire', 'mancante', 'null', 'n/d', 'nd']
  const badT = ['non specificato', 'da concordare', 'da definire', 'mancante', 'null', 'archiviato', 'esplorativa', 'n/d', 'nd']

  if (activity?.bant) {
    const b = activity.bant
    const hasB = !isInvalid(b.budget, badB)
    const hasA = !isInvalid(b.authority, badA)
    const hasN = !isInvalid(b.need, badN)
    const hasT = !isInvalid(b.timeline, badT)
    const score = (hasB ? 1 : 0) + (hasA ? 1 : 0) + (hasN ? 1 : 0) + (hasT ? 1 : 0)
    return { ...b, hasB, hasA, hasN, hasT, score }
  }

  // Fallback sull'azienda collegata nel CRM
  const comp = (companies || []).find(c => c.name === activity?.company)
  if (comp?.bant) {
    const b = comp.bant
    const hasB = !isInvalid(b.budget, badB)
    const hasA = !isInvalid(b.authority, badA)
    const hasN = !isInvalid(b.need, badN)
    const hasT = !isInvalid(b.timeline, badT)
    const score = (hasB ? 1 : 0) + (hasA ? 1 : 0) + (hasN ? 1 : 0) + (hasT ? 1 : 0)
    return { ...b, hasB, hasA, hasN, hasT, score }
  }

  return { hasB: false, hasA: false, hasN: true, hasT: false, score: 1 }
}

// ── Acronimo B.A.N.T. stile Brand Logo DADO dinamico per singola attività ──
function BantLogoMark({ size = 'sm', bant = null }) {
  const isSm = size === 'sm'
  const hasB = bant ? Boolean(bant.hasB) : true
  const hasA = bant ? Boolean(bant.hasA) : true
  const hasN = bant ? Boolean(bant.hasN) : true
  const hasT = bant ? Boolean(bant.hasT) : true

  const score = bant?.score ?? ((hasB ? 1 : 0) + (hasA ? 1 : 0) + (hasN ? 1 : 0) + (hasT ? 1 : 0))
  const missing = []
  if (!hasB) missing.push('Budget')
  if (!hasA) missing.push('Authority')
  if (!hasN) missing.push('Need')
  if (!hasT) missing.push('Timeline')

  const title = `Framework B.A.N.T. (${score}/4 qualificati${missing.length ? ' - Mancano: ' + missing.join(', ') : ' - Completo!'})`

  return (
    <div
      className="inline-flex items-center gap-1 select-none px-2 py-0.5 rounded-lg bg-white border border-sky-200 hover:border-sky-400 transition-colors shadow-2xs shrink-0 cursor-help"
      title={title}
      style={{ fontFamily: '"Switzer", sans-serif' }}
    >
      {/* B • Budget */}
      <div className="flex items-center gap-0.5">
        <span
          className={`font-black ${isSm ? 'text-[12px]' : 'text-[15px]'} ${hasB ? 'text-[#16a34a]' : 'text-slate-300'} leading-none`}
        >
          B
        </span>
        <span className={`w-0.5 h-0.5 rounded-full ${hasB ? 'bg-[#16a34a]' : 'bg-slate-300'}`} />
      </div>
      {/* A • Authority */}
      <div className="flex items-center gap-0.5">
        <span
          className={`font-black ${isSm ? 'text-[12px]' : 'text-[15px]'} ${hasA ? 'text-[#dc2626]' : 'text-slate-300'} leading-none`}
        >
          A
        </span>
        <span className={`w-0.5 h-0.5 rounded-full ${hasA ? 'bg-[#dc2626]' : 'bg-slate-300'}`} />
      </div>
      {/* N • Need */}
      <div className="flex items-center gap-0.5">
        <span
          className={`font-black ${isSm ? 'text-[12px]' : 'text-[15px]'} ${hasN ? 'text-[#0284c7]' : 'text-slate-300'} leading-none`}
        >
          N
        </span>
        <span className={`w-0.5 h-0.5 rounded-full ${hasN ? 'bg-[#0284c7]' : 'bg-slate-300'}`} />
      </div>
      {/* T • Timeline */}
      <div className="flex items-center gap-0.5">
        <span
          className={`font-black ${isSm ? 'text-[12px]' : 'text-[15px]'} ${hasT ? 'text-[#d97706]' : 'text-slate-300'} leading-none`}
        >
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
  const { users } = useAuth()
  const userOptions = useMemo(() => {
    if (Array.isArray(users) && users.length > 0) return users
    return DEFAULT_USERS
  }, [users])

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
    assignedTo: '',
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

  // Sincronizza costantemente la cache delle attività per il Calendario in tempo reale
  useEffect(() => {
    if (Array.isArray(activities) && activities.length > 0) {
      try {
        localStorage.setItem('dado_crm_activities_cache', JSON.stringify(activities))
        window.dispatchEvent(new CustomEvent('dado-calendar-update', { detail: { count: activities.length } }))
      } catch (e) {
        console.warn('Errore salvataggio cache attività calendar:', e)
      }
    }
  }, [activities])

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

  // Assegnazione task a un membro del team
  async function handleAssignTask(activityId, assignee) {
    try {
      const res = await fetch(`/api/crm/activities/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: assignee })
      })
      if (res.ok) {
        setActivities(prev =>
          prev.map(a => (a.id === activityId ? { ...a, assignedTo: assignee } : a))
        )
      }
    } catch (err) {
      console.error('Errore assegnazione task:', err)
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
          assignedTo: '',
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
        const matchAssigned = a.assignedTo?.toLowerCase().includes(q)
        if (!matchTitle && !matchComp && !matchNotes && !matchAssigned) return false
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
      {/* ── CANVAS GIALLO TENUE (Omologo al blu di Az & Co) ── */}
      <div
        className="h-full flex-1 rounded-tl-none rounded-bl-[48px] flex flex-col justify-between relative min-w-0 overflow-hidden"
        style={{
          background: '#fefce8',
          borderLeft: '1.5px solid #fef08a',
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
          borderTopLeftRadius: '0px',
        }}
      >
        {/* ── Contenuto Principale con scroll ── */}
        <div className="flex-1 min-h-0 px-4 md:px-7 py-3 overflow-y-auto">

          {/* ── TESTATA IN SWITZER ── */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-red-200/70">
            {/* Sinistra: Titolo e Badge PIPELINE ingrandito */}
            <div className="flex-shrink-0">
              <h1
                className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5"
                style={{ fontFamily: '"Switzer", sans-serif' }}
              >
                <span>Activities</span>
                <span
                  className="px-3.5 py-1 rounded-[6px] shadow-xs inline-flex items-center leading-none"
                  style={{
                    backgroundColor: 'rgba(26, 43, 76, 0.93)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                  }}
                >
                  <span
                    className="text-[calc(1.5rem-5pt)] md:text-[calc(1.875rem-5pt)] font-black tracking-wider uppercase leading-none inline-flex items-center select-none"
                    style={{
                      background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 22%, #cbd5e1 48%, #94a3b8 72%, #cbd5e1 88%, #ffffff 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35)) drop-shadow(0 0 1px rgba(255, 255, 255, 0.5))',
                    }}
                  >
                    Pipeline
                  </span>
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5 leading-normal">
                Pianificazione operativa, calendario set e automazioni
              </p>
            </div>

            {/* Pulsanti Destra: Torna ad Attività (se in bozze) e Automazione ⚡ */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {mainTab === 'drafts' && (
                <button
                  type="button"
                  onClick={() => setMainTab('tasks')}
                  className="px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all border bg-white/80 hover:bg-white text-slate-700 border-sky-200 cursor-pointer shadow-xs"
                >
                  ← Tutte le Attività
                </button>
              )}

              <button
                type="button"
                onClick={triggerPipelineSync}
                disabled={syncingPipeline}
                className="flex items-center justify-center p-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-sky-200 font-extrabold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                title="Esegui scansione immediata email, generazione tasks e bozze"
              >
                <RefreshCw className={`w-4 h-4 text-[#0284c7] ${syncingPipeline ? 'animate-spin' : ''}`} />
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
              {/* ── BARRA DI RICERCA ATTIVITÀ CENTRATA (LUNGA ALMENO 7CM) ── */}
              <div className="flex items-center justify-center w-full mb-4">
                <div
                  className="relative"
                  style={{
                    minWidth: '7cm',
                    width: '8.5cm',
                    maxWidth: '100%',
                  }}
                >
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0284c7] stroke-[2.5] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cerca attività, cliente o note..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border-2 border-[#0284c7] hover:border-[#0369a1] focus:border-[#0369a1] focus:ring-2 focus:ring-[#0284c7]/20 rounded-full pl-10 pr-9 py-2.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-bold shadow-xs transition-all leading-normal"
                    style={{
                      fontFamily: '"Switzer", sans-serif',
                    }}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0284c7] font-bold p-1 cursor-pointer transition-colors"
                      title="Cancella ricerca"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── FILTRI: CATEGORIA, PRIORITÀ, STATI, TIMELINE / KANBAN ── */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {/* Riquadro Filtro Categoria */}
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-300 hover:border-slate-400 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] font-bold shadow-xs transition-all cursor-pointer"
                    style={{ fontFamily: '"Switzer", sans-serif' }}
                  >
                    <option value="all">Tutte le categorie</option>
                    <option value="commercial">📞 Commerciale & Call</option>
                    <option value="shooting">🎬 Shooting & Set</option>
                    <option value="postprod">💻 Post-Produzione</option>
                    <option value="admin">📄 Amministrazione</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Riquadro Filtro Priorità */}
                <div className="relative">
                  <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-300 hover:border-slate-400 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] font-bold shadow-xs transition-all cursor-pointer"
                    style={{ fontFamily: '"Switzer", sans-serif' }}
                  >
                    <option value="all">Tutte le priorità</option>
                    <option value="high">🔴 Alta priorità</option>
                    <option value="medium">🔵 Media</option>
                    <option value="low">⚪ Bassa</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Riquadro Filtro Stati */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-300 hover:border-slate-400 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] font-bold shadow-xs transition-all cursor-pointer"
                    style={{ fontFamily: '"Switzer", sans-serif' }}
                  >
                    <option value="all">Tutti gli stati</option>
                    <option value="today">⚡ Solo To Do (Oggi)</option>
                    <option value="pending">In programma (Sospeso)</option>
                    <option value="completed">Completate</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Riquadro Switcher Vista Timeline / Kanban (spostato accanto a Tutti gli stati) */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-xs">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-md transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    <span>Timeline</span>
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-md transition-all cursor-pointer ${
                      viewMode === 'kanban'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Kanban</span>
                  </button>
                </div>

                {/* Azzera filtri rapido */}
                {(categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all' || search) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('all')
                      setPriorityFilter('all')
                      setStatusFilter('all')
                      setSearch('')
                    }}
                    className="px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 rounded-lg bg-slate-200/80 hover:bg-slate-300/80 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Reimposta filtri e ricerca"
                  >
                    <X className="w-3 h-3" />
                    <span>Azzera filtri</span>
                  </button>
                )}
              </div>

              {/* ── CONSOLE ATTIVITÀ IN SWITZER AMALGAMATA ALLO SFONDO (SENZA PERIMETRO COLORATO, CON PREV/SKIP) ── */}
              {activeTask && (
                <div
                  className="p-4 rounded-2xl mb-5 shadow-xs relative overflow-hidden bg-white/70 backdrop-blur-xs border border-sky-200/80 text-slate-800 transition-all"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  {/* Riga Superiore: PRIORITÀ a sinistra e PREV / SKIP al centro dello schermo */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-100/90 relative">
                    {/* Sinistra: 4 Opzioni per modificare la priorità del task (spostata a sinistra al posto di prev/skip) */}
                    <div className="flex items-center gap-1.5 flex-shrink-0" title="Modifica priorità del task">
                      <span className="text-xs md:text-sm text-slate-900 font-black mr-1 hidden sm:inline tracking-wider uppercase leading-none">PRIORITÀ:</span>
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
                            className={`px-3 py-1.5 text-xs md:text-sm font-black uppercase rounded-lg transition-all cursor-pointer border ${
                              isSelected
                                ? 'ring-2 ring-slate-800 scale-105 shadow-xs font-extrabold'
                                : 'opacity-65 hover:opacity-100'
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

                    {/* Centro: Controlli Walkman PREV / SKIP centrati con contatore 1/15 */}
                    <div className="flex-1 flex justify-center items-center">
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-2xs" title="Skip task (frecce stile walkman)">
                        <button
                          type="button"
                          onClick={() => setCurrentTaskIdx(i => (i - 1 + activities.length) % activities.length)}
                          className="px-2.5 py-1 hover:bg-white text-slate-700 rounded text-xs font-black flex items-center gap-0.5 cursor-pointer transition-colors"
                          title="Torna all'attività precedente"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>PREV</span>
                        </button>
                        <span className="text-slate-300 font-bold">|</span>
                        <span className="px-2 py-0.5 text-xs font-black text-slate-700 select-none">
                          {Math.min(currentTaskIdx + 1, activities.length)}/{activities.length}
                        </span>
                        <span className="text-slate-300 font-bold">|</span>
                        <button
                          type="button"
                          onClick={() => setCurrentTaskIdx(i => (i + 1) % activities.length)}
                          className="px-2.5 py-1 hover:bg-white text-[#0284c7] rounded text-xs font-black flex items-center gap-0.5 cursor-pointer transition-colors"
                          title="Skip: passa all'attività successiva"
                        >
                          <span>SKIP</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Spazio bilanciato a destra per preservare la perfetta centratura */}
                    <div className="hidden sm:block flex-shrink-0 invisible" aria-hidden="true">
                      <span className="text-xs md:text-sm font-black mr-1 uppercase">PRIORITÀ:</span>
                      {TASK_PRIORITIES.map(p => (
                        <span key={p.id} className="px-3 py-1.5 text-xs md:text-sm font-black uppercase rounded-lg inline-block">{p.code}</span>
                      ))}
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
                        <div className="text-[#0284c7] font-black">
                          <span>{activeTask.company || 'DADO Studio'}</span>
                        </div>
                        <BantLogoMark size="sm" bant={getActivityBant(activeTask, companies)} />
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500 font-bold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {activeTask.date || 'Oggi'} {activeTask.time || ''}
                        </span>
                      </div>

                      {/* Riquadro Assegnazione Task a... */}
                      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                            activeTask.assignedTo
                              ? 'bg-sky-50 border-sky-200 text-sky-900 shadow-2xs'
                              : 'bg-slate-50 border-dashed border-slate-300 text-slate-600 hover:border-sky-300'
                          }`}
                          title="Assegnazione del task a un collaboratore"
                        >
                          <div className="flex items-center gap-1.5 shrink-0">
                            {activeTask.assignedTo ? (
                              <UserCheck className="w-4 h-4 text-[#0284c7]" />
                            ) : (
                              <UserPlus className="w-4 h-4 text-slate-400" />
                            )}
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                              {activeTask.assignedTo ? 'Assegnazione task a:' : 'Assegnazione task a...'}
                            </span>
                          </div>

                          <div className="relative inline-flex items-center">
                            <select
                              value={activeTask.assignedTo || ''}
                              onChange={(e) => handleAssignTask(activeTask.id, e.target.value)}
                              className="text-xs font-black text-slate-800 bg-white pl-2.5 pr-7 py-1 rounded-lg border border-slate-200 hover:border-sky-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7] cursor-pointer appearance-none transition-colors"
                            >
                              <option value="">-- Non assegnato --</option>
                              {userOptions.map(u => (
                                <option key={u.id || u.name} value={u.name}>
                                  {u.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                          </div>

                          {activeTask.assignedTo && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-sky-200/70 text-sky-800">
                              Assegnato
                            </span>
                          )}
                        </div>
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
                        <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-sky-200 flex items-center gap-2 shadow-xs">
                          <span>TO DO / OGGI</span>
                          <span className="text-[#ea580c] font-black">({todayTasks.length})</span>
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {todayTasks.map(act => (
                          <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} onAssign={handleAssignTask} userList={userOptions} companies={companies} isToday />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sezione: IN PROGRAMMA (In coda / Prossimi Giorni) */}
                  {upcomingTasks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <Calendar className="w-4 h-4 text-[#0284c7]" />
                        <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-sky-200 flex items-center gap-2 shadow-xs">
                          <span>IN PROGRAMMA</span>
                          <span className="text-[#0284c7] font-black">({upcomingTasks.length})</span>
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {upcomingTasks.map(act => (
                          <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} onAssign={handleAssignTask} userList={userOptions} companies={companies} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sezione: COMPLETATE */}
                  {completedTasks.length > 0 && statusFilter !== 'today' && statusFilter !== 'pending' && (
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                        <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-600 bg-white/80 px-3.5 py-2 rounded-xl border border-sky-200 flex items-center gap-2 shadow-xs">
                          <span>COMPLETATE</span>
                          <span className="text-[#16a34a] font-black">({completedTasks.length})</span>
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-75 hover:opacity-100 transition-opacity">
                        {completedTasks.map(act => (
                          <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} onAssign={handleAssignTask} userList={userOptions} companies={companies} />
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
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0284c7]">
                        <span>In Programma</span>
                      </div>
                      <span className="text-xs bg-sky-100 px-2 py-0.5 rounded-full text-[#0284c7] font-black">
                        {upcomingTasks.length}
                      </span>
                    </div>
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                      {upcomingTasks.map(act => (
                        <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} onAssign={handleAssignTask} userList={userOptions} companies={companies} isKanban />
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
                        <span>To Do / Oggi</span>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-black">
                        {todayTasks.length}
                      </span>
                    </div>
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                      {todayTasks.map(act => (
                        <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} onAssign={handleAssignTask} userList={userOptions} companies={companies} isToday isKanban />
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
                        <span>Completate</span>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">
                        {completedTasks.length}
                      </span>
                    </div>
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1 opacity-80 hover:opacity-100 transition-opacity">
                      {completedTasks.map(act => (
                        <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onOpenDrafts={() => setMainTab('drafts')} onAssign={handleAssignTask} userList={userOptions} companies={companies} isKanban />
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
                <label className="block text-xs font-black uppercase text-slate-700 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Assegnazione task a...</span>
                </label>
                <select
                  value={formData.assignedTo || ''}
                  onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#0284c7]"
                >
                  <option value="">-- Non assegnato / Team Studio --</option>
                  {userOptions.map(u => (
                    <option key={u.id || u.name} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
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
function ActivityCard({ activity, onToggle, onDelete, onUpdatePriority, onToggleChecklist, onOpenDrafts, onAssign, userList = [], isToday, isKanban, companies = [] }) {
  const isDone = activity.status === 'completed'
  const isTodo = !isDone && (isToday || activity.due === 'today' || activity.period?.toLowerCase() === 'oggi')
  const isPriority = !isDone && (activity.priority === 'high' || activity.priority === 'urgent_3d' || isTodo)
  const cat = CATEGORIES[activity.type] || CATEGORIES.commercial
  const IconComponent = cat.icon

  const isAutoGenerated = activity.source === 'pipeline_llm_automation' || Boolean(activity.checklist?.length) || Boolean(activity.emailStatus)

  // Contorno colorato dinamico a seconda dello stato:
  // - "completate": #16a34a (Verde smeraldo)
  // - "To do": #ea580c (Arancione energico)
  // - "in programma": #0284c7 (Azzurro / Blu sky)
  const borderClass = isDone
    ? 'border-2 border-[#16a34a] shadow-[0_2px_8px_rgba(22,163,74,0.12)] opacity-85 hover:opacity-100 hover:shadow-[0_4px_12px_rgba(22,163,74,0.2)]'
    : isTodo
    ? 'border-2 border-[#ea580c] shadow-[0_2px_10px_rgba(234,88,12,0.15)] hover:shadow-[0_4px_16px_rgba(234,88,12,0.25)]'
    : 'border-2 border-[#0284c7] shadow-[0_2px_10px_rgba(2,132,199,0.15)] hover:shadow-[0_4px_16px_rgba(2,132,199,0.25)]'

  return (
    <div
      className={`rounded-2xl transition-all p-3.5 relative group bg-white ${borderClass}`}
      style={{
        backgroundColor: '#ffffff',
        fontFamily: '"Switzer", sans-serif',
      }}
    >
      <div className="flex items-start gap-3">
        
        {/* Checkbox completata (visibile con spunta verde solo sulle attività completate) */}
        {isDone && (
          <button
            onClick={() => onToggle(activity)}
            className="mt-0.5 shrink-0 text-[#16a34a] hover:opacity-75 transition-opacity cursor-pointer"
            title="Segna come da fare (riapri)"
          >
            <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
          </button>
        )}

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
            <div className="truncate text-slate-800 font-extrabold">
              {activity.company || 'DADO Studio'}
            </div>
            <BantLogoMark size="sm" bant={getActivityBant(activity, companies)} />
          </div>

          {/* Riquadro Assegnazione task a... */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <div
              className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-all w-full sm:w-auto ${
                activity.assignedTo
                  ? 'bg-sky-50/80 border-sky-200 text-sky-900 shadow-2xs'
                  : 'bg-slate-50 border-dashed border-slate-300 text-slate-600 hover:border-sky-300 hover:bg-sky-50/30'
              }`}
              title="Assegnazione task a un collaboratore dello studio"
            >
              <div className="flex items-center gap-1.5 shrink-0">
                {activity.assignedTo ? (
                  <UserCheck className="w-3.5 h-3.5 text-[#0284c7]" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
                  {activity.assignedTo ? 'Assegnazione task a:' : 'Assegnazione task a...'}
                </span>
              </div>

              <div className="relative inline-flex items-center flex-1 sm:flex-initial">
                <select
                  value={activity.assignedTo || ''}
                  onChange={(e) => onAssign && onAssign(activity.id, e.target.value)}
                  className="text-xs font-black text-slate-800 bg-white/95 hover:bg-white pl-2 pr-6 py-1 rounded-lg border border-slate-200 hover:border-sky-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7] cursor-pointer appearance-none transition-colors w-full"
                >
                  <option value="">-- Seleziona collaboratore --</option>
                  {userList.map(u => (
                    <option key={u.id || u.name} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
              </div>

              {activity.assignedTo && (
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-200/70 text-sky-800 shrink-0">
                  Assegnato
                </span>
              )}
            </div>
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

        {/* Pulsanti Azione: Completa + Rimuovi */}
        <div className="flex items-center gap-1.5 self-center shrink-0">
          {!isDone && (
            <button
              onClick={() => onToggle(activity)}
              className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              title="Segna come completata"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>Completa</span>
            </button>
          )}

          <button
            onClick={() => onDelete(activity.id)}
            className="px-2 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
            title="Rimuovi attività"
          >
            <Trash2 className="w-3 h-3" />
            <span>Rimuovi</span>
          </button>
        </div>

      </div>
    </div>
  )
}
