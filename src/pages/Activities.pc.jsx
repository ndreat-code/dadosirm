import { useState, useEffect, useMemo, Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
  User,
  Brain,
  UploadCloud,
  Paperclip,
  Lightbulb,
  Maximize2,
  Minimize2,
  Table,
} from 'lucide-react'
import { useAuth, DEFAULT_USERS } from '../context/AuthContext'
import TaskNotesAndAttachments from '../components/TaskNotesAndAttachments'
import HorizontalTableScroller from '../components/HorizontalTableScroller'
import TaskReminderAndAutomation, {
  AUTOMATION_CAUSES,
  AUTOMATION_EFFECTS,
  ADVANCE_NOTICE_OPTIONS,
} from '../components/TaskReminderAndAutomation'

// Configurazione dei 4 stati operativi dei task (In attesa, In corso, Fermo, Completato)
export const TASK_STATUS_CONFIG = {
  pending: {
    key: 'pending',
    label: 'In attesa',
    tag: 'IN ATTESA',
    color: '#fdab3d',
    bg: '#fffbf2',
    border: '#fee8c4',
    textColor: '#b45309',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    dot: 'bg-amber-500',
  },
  in_progress: {
    key: 'in_progress',
    label: 'In corso',
    tag: 'IN CORSO',
    color: '#0073ea',
    bg: '#f0f7ff',
    border: '#cce3fd',
    textColor: '#0369a1',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-900',
    dot: 'bg-sky-500',
  },
  fermo: {
    key: 'fermo',
    label: 'Fermo',
    tag: 'FERMO',
    color: '#e2445c',
    bg: '#fef2f2',
    border: '#fecaca',
    textColor: '#991b1b',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
    dot: 'bg-rose-500',
  },
  completed: {
    key: 'completed',
    label: 'Completato',
    tag: 'COMPLETATO',
    color: '#00c875',
    bg: '#f2fcf7',
    border: '#c3f5df',
    textColor: '#15803d',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    dot: 'bg-emerald-500',
  },
}

export function getTaskStatusInfo(status) {
  if (status === 'completed' || status === 'done') return TASK_STATUS_CONFIG.completed
  if (status === 'in_progress' || status === 'in_corso') return TASK_STATUS_CONFIG.in_progress
  if (status === 'fermo' || status === 'paused' || status === 'bloccato') return TASK_STATUS_CONFIG.fermo
  return TASK_STATUS_CONFIG.pending
}

// Gruppi di visualizzazione per la tabella in stile Monday.com
const MONDAY_TASK_GROUPS = [
  {
    id: 'today',
    title: 'TO DO / OGGI & URGENTI',
    emoji: '⚡',
    color: '#0073ea',
    bg: '#f0f7ff',
    border: '#cce3fd',
    subtitle: 'Task da completare entro oggi o prioritari',
  },
  {
    id: 'upcoming',
    title: 'IN PROGRAMMA',
    emoji: '📅',
    color: '#a25ddc',
    bg: '#fbf7ff',
    border: '#eedafc',
    subtitle: 'Attività future, shooting e scadenze in calendario',
  },
  {
    id: 'completed',
    title: 'COMPLETATE',
    emoji: '✅',
    color: '#00c875',
    bg: '#f2fcf7',
    border: '#c3f5df',
    subtitle: 'Task archiviati ed evasi con successo',
  },
]

// Categorie in perfetta armonia con la palette DADO
const CATEGORIES = {
  commercial: {
    label: 'Commerciale & Call',
    icon: Phone,
    color: '#334155',
    bg: '#f1f5f9',
    border: '#e2e8f0',
  },
  shooting: {
    label: 'Shooting & Set',
    icon: Camera,
    color: '#334155',
    bg: '#f1f5f9',
    border: '#e2e8f0',
  },
  postprod: {
    label: 'Post-Produzione & Consegne',
    icon: Video,
    color: '#334155',
    bg: '#f1f5f9',
    border: '#e2e8f0',
  },
  admin: {
    label: 'Amministrazione & Contratti',
    icon: FileText,
    color: '#334155',
    bg: '#f1f5f9',
    border: '#e2e8f0',
  },
}

// Helper per formattare la data di un'attività in modo leggibile (DD/MM/YYYY o Oggi/Domani)
function formatActivityDate(act) {
  if (!act) return 'Da definire'
  if (act.due === 'today') return 'Oggi'
  if (act.due === 'tomorrow') return 'Domani'
  const raw = act.dueDate || act.date
  if (!raw) return act.period || 'Da definire'
  if (typeof raw === 'string') {
    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) {
      const [, y, m, d] = isoMatch
      return `${d}/${m}/${y}`
    }
  }
  return String(raw)
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
          className={`font-black ${isSm ? 'text-[15px]' : 'text-[15px]'} ${hasB ? 'text-[#16a34a]' : 'text-slate-300'} leading-none`}
        >
          B
        </span>
        <span className={`w-0.5 h-0.5 rounded-full ${hasB ? 'bg-[#16a34a]' : 'bg-slate-300'}`} />
      </div>
      {/* A • Authority */}
      <div className="flex items-center gap-0.5">
        <span
          className={`font-black ${isSm ? 'text-[15px]' : 'text-[15px]'} ${hasA ? 'text-[#dc2626]' : 'text-slate-300'} leading-none`}
        >
          A
        </span>
        <span className={`w-0.5 h-0.5 rounded-full ${hasA ? 'bg-[#dc2626]' : 'bg-slate-300'}`} />
      </div>
      {/* N • Need */}
      <div className="flex items-center gap-0.5">
        <span
          className={`font-black ${isSm ? 'text-[15px]' : 'text-[15px]'} ${hasN ? 'text-[#0284c7]' : 'text-slate-300'} leading-none`}
        >
          N
        </span>
        <span className={`w-0.5 h-0.5 rounded-full ${hasN ? 'bg-[#0284c7]' : 'bg-slate-300'}`} />
      </div>
      {/* T • Timeline */}
      <div className="flex items-center gap-0.5">
        <span
          className={`font-black ${isSm ? 'text-[15px]' : 'text-[15px]'} ${hasT ? 'text-[#d97706]' : 'text-slate-300'} leading-none`}
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
    color: '#0f172a',
    bg: '#e2e8f0',
    border: '#94a3b8',
  },
  {
    id: 'week_1',
    code: '1 sett',
    label: 'Entro una settimana',
    color: '#334155',
    bg: '#f1f5f9',
    border: '#cbd5e1',
  },
  {
    id: 'weeks_2_3',
    code: '2-3 sett',
    label: 'Non urgente 2/3 settimane',
    color: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
  },
  {
    id: 'month_1',
    code: '1 mese',
    label: 'Quando trovi un po\' di tempo nell\'arco di un mese',
    color: '#94a3b8',
    bg: '#ffffff',
    border: '#e2e8f0',
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

  const location = useLocation()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'today', 'pending', 'completed'
  const [viewMode, setViewMode] = useState('monday') // 'monday', 'list' o 'kanban'
  const [collapsedTaskGroups, setCollapsedTaskGroups] = useState({})
  const [expandedTaskId, setExpandedTaskId] = useState(null)
  const toggleTaskGroupCollapse = (groupId) => {
    setCollapsedTaskGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }))
  }
  const toggleTaskExpanded = (taskId) => {
    setExpandedTaskId(prev => (prev === taskId ? null : taskId))
  }
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0)
  const [isPriorityExpanded, setIsPriorityExpanded] = useState(false)

  // Rilevamento porta 3005 per mantenere Activities classica o Notion-style Tasks su porta 3000
  const [isPort3005, setIsPort3005] = useState(() => {
    if (typeof window === 'undefined') return false
    const search = new URLSearchParams(window.location.search)
    if (search.get('layout') === 'new') return true
    if (search.get('layout') === 'classic') return false
    return window.location.port === '3005'
  })

  useEffect(() => {
    const checkPort = () => {
      const search = new URLSearchParams(window.location.search)
      if (search.get('layout') === 'new') setIsPort3005(true)
      else if (search.get('layout') === 'classic') setIsPort3005(false)
      else setIsPort3005(window.location.port === '3005')
    }
    checkPort()
    window.addEventListener('popstate', checkPort)
    return () => window.removeEventListener('popstate', checkPort)
  }, [])

  const isNotion = !isPort3005

  // Sincronizza categoria da URL (es. /activities?category=commercial o /tasks?category=commercial)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const cat = params.get('category')
    if (cat) {
      setCategoryFilter(cat)
    }
  }, [location.search])

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
    notes: '',
    attachments: [],
    reminderEnabled: true,
    reminderAdvance: '15_min',
    reminderChannel: 'dashboard_toast',
    automationEnabled: true,
    automationCause: 'email',
    automationEffect: 'invia_calendario',
    status: 'pending',
    checklist: [],
  })
  const [newModalChecklistText, setNewModalChecklistText] = useState('')
  const [saving, setSaving] = useState(false)
  const [addingChecklistTaskId, setAddingChecklistTaskId] = useState(null)
  const [newChecklistText, setNewChecklistText] = useState('')

  // Modal cambio stato attività (richiede motivo ed eventuale nuova scadenza per 'fermo' o 'in_progress')
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    task: null,
    targetStatus: 'fermo',
    reason: '',
    newDueDate: '',
    submitting: false,
  })

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
        method: 'PUT',
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

  // Gestione selezione stato: per 'fermo' o 'in_progress' richiede motivo ed eventuale nuova scadenza
  function handleSelectStatus(task, newStatus) {
    if (!task) return
    if (newStatus === 'fermo' || newStatus === 'in_progress') {
      setStatusModal({
        isOpen: true,
        task,
        targetStatus: newStatus,
        reason: '',
        newDueDate: task.date || task.dueDate || '',
        submitting: false,
      })
      return
    }

    // Per 'completed' o 'pending', aggiorna direttamente
    handleDirectStatusChange(task, newStatus)
  }

  async function handleDirectStatusChange(task, newStatus) {
    try {
      const res = await fetch(`/api/crm/activities/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setActivities(prev =>
          prev.map(a => (a.id === task.id ? { ...a, status: newStatus } : a))
        )
        window.dispatchEvent(new CustomEvent('dado-activities-updated', { detail: { taskId: task.id, status: newStatus } }))
        window.dispatchEvent(new CustomEvent('dado-companies-updated'))
      }
    } catch (err) {
      console.error('Errore update status:', err)
    }
  }

  // Toggle rapido stato attività (completato / in attesa)
  async function toggleStatus(activity) {
    const nextStatus = activity.status === 'completed' ? 'pending' : 'completed'
    handleSelectStatus(activity, nextStatus)
  }

  // Conferma del cambio stato con motivo e nuova scadenza (riporta in note & allegati e su companies)
  async function handleConfirmStatusModal() {
    const { task, targetStatus, reason, newDueDate } = statusModal
    if (!task) return

    setStatusModal(prev => ({ ...prev, submitting: true }))

    const statusInfo = getTaskStatusInfo(targetStatus)
    const todayStr = new Date().toLocaleDateString('it-IT')

    // Dicitura automatica per casella "Note & Allegati"
    const formattedReason = reason.trim() || (targetStatus === 'fermo' ? 'Attività temporaneamente sospesa' : 'Attività avviata in lavorazione')
    const updateLog = `[Stato: ${statusInfo.tag} • ${todayStr}] Motivo: ${formattedReason}${newDueDate ? ` | Nuova scadenza: ${newDueDate}` : ''}`
    const currentNotes = (task.notes || '').trim()
    const updatedNotes = currentNotes ? `${currentNotes}\n\n${updateLog}` : updateLog

    const payload = {
      status: targetStatus,
      notes: updatedNotes,
      statusReason: formattedReason,
      newDueDate: newDueDate || task.date || task.dueDate || ''
    }

    try {
      const res = await fetch(`/api/crm/activities/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setActivities(prev =>
          prev.map(a => (a.id === task.id ? {
            ...a,
            status: targetStatus,
            notes: updatedNotes,
            date: newDueDate || a.date,
            dueDate: newDueDate || a.dueDate
          } : a))
        )
        window.dispatchEvent(new CustomEvent('dado-activities-updated', { detail: { taskId: task.id, status: targetStatus, reason: formattedReason, newDueDate } }))
        window.dispatchEvent(new CustomEvent('dado-companies-updated'))
      }
    } catch (err) {
      console.error('Errore conferma cambio stato:', err)
    } finally {
      setStatusModal({ isOpen: false, task: null, targetStatus: 'fermo', reason: '', newDueDate: '', submitting: false })
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

  // Aggiungi una nuova voce alla checklist
  async function handleAddChecklistItem(activity, newItemText) {
    if (!newItemText || !newItemText.trim()) return
    const existing = Array.isArray(activity.checklist) ? activity.checklist : []
    const updated = [...existing, newItemText.trim()]

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
      console.error('Errore aggiunta voce checklist:', err)
    }
  }

  // Elimina una voce dalla checklist
  async function handleDeleteChecklistItem(activity, itemIdx) {
    if (!activity.checklist) return
    const updated = activity.checklist.filter((_, idx) => idx !== itemIdx)

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
      console.error('Errore eliminazione voce checklist:', err)
    }
  }

  // Aggiorna le note di un'attività
  async function handleUpdateNotes(activityId, newNotes) {
    try {
      const res = await fetch(`/api/crm/activities/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: newNotes })
      })
      if (res.ok) {
        setActivities(prev =>
          prev.map(a => (a.id === activityId ? { ...a, notes: newNotes } : a))
        )
      }
    } catch (err) {
      console.error('Errore salvataggio note:', err)
    }
  }

  // Aggiunge un allegato a un'attività
  async function handleAddAttachment(activityId, attachment) {
    const act = activities.find(a => a.id === activityId)
    const existing = act?.attachments || []
    const updated = [...existing, attachment]

    try {
      const res = await fetch(`/api/crm/activities/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachments: updated })
      })
      if (res.ok) {
        setActivities(prev =>
          prev.map(a => (a.id === activityId ? { ...a, attachments: updated } : a))
        )
      }
    } catch (err) {
      console.error('Errore aggiunta allegato:', err)
    }
  }

  // Elimina un allegato da un'attività
  async function handleDeleteAttachment(activityId, attachmentId) {
    const act = activities.find(a => a.id === activityId)
    if (!act) return
    const updated = (act.attachments || []).filter(att => att.id !== attachmentId)

    try {
      const res = await fetch(`/api/crm/activities/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachments: updated })
      })
      if (res.ok) {
        setActivities(prev =>
          prev.map(a => (a.id === activityId ? { ...a, attachments: updated } : a))
        )
      }
    } catch (err) {
      console.error('Errore eliminazione allegato:', err)
    }
  }

  // Aggiorna Promemoria ed Automazione (Causa ➔ Effetto) di un'attività
  async function handleUpdateReminderAndAutomation(activityId, updates) {
    try {
      const res = await fetch(`/api/crm/activities/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        setActivities(prev =>
          prev.map(a => (a.id === activityId ? { ...a, ...updates } : a))
        )
      }
    } catch (err) {
      console.error('Errore aggiornamento promemoria/automazione:', err)
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
      const rem = {
        enabled: formData.reminderEnabled !== false,
        date: formData.dueDate || new Date().toISOString().split('T')[0],
        time: formData.dueTime || '10:00',
        advanceNotice: formData.reminderAdvance || '15_min',
        channel: formData.reminderChannel || 'dashboard_toast',
        notified: false,
      }
      const foundCause = AUTOMATION_CAUSES.find(c => c.id === formData.automationCause)
      const foundEffect = AUTOMATION_EFFECTS.find(e => e.id === formData.automationEffect)
      const auto = {
        enabled: formData.automationEnabled !== false,
        cause: formData.automationCause || 'email',
        causeLabel: foundCause ? foundCause.label : 'Email (Ricezione / Risposta)',
        effect: formData.automationEffect || 'invia_calendario',
        effectLabel: foundEffect ? foundEffect.label : 'Invia calendario per presa appuntamento',
        status: 'active',
        lastTriggered: null,
      }

      const payload = {
        ...formData,
        reminder: rem,
        automation: auto,
      }

      const res = await fetch('/api/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
          notes: '',
          attachments: [],
          reminderEnabled: true,
          reminderAdvance: '15_min',
          reminderChannel: 'dashboard_toast',
          automationEnabled: true,
          automationCause: 'email',
          automationEffect: 'invia_calendario',
          checklist: [],
        })
        setNewModalChecklistText('')
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
      if (statusFilter === 'in_progress') return a.status === 'in_progress'
      if (statusFilter === 'fermo') return a.status === 'fermo'
      if (statusFilter === 'pending') return a.status === 'pending' || a.status === 'in_attesa' || (!a.status)
      if (statusFilter === 'completed') return a.status === 'completed'

      return true
    })
  }, [activities, search, categoryFilter, priorityFilter, statusFilter])

  // Suddivisione per data
  const todayTasks = filteredActivities.filter(a => a.status !== 'completed' && (a.due === 'today' || a.period?.toLowerCase() === 'oggi'))
  const upcomingTasks = filteredActivities.filter(a => a.status !== 'completed' && a.due !== 'today' && a.period?.toLowerCase() !== 'oggi')
  const completedTasks = filteredActivities.filter(a => a.status === 'completed')

  return (
    <div
      className="h-full min-h-0 flex flex-col flex-1 relative overflow-hidden"
      style={{
        backgroundColor: 'transparent',
        fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* ── BANDA SUPERIORE: Titolo "Tasks" (o "Activities") immerso nella banda scura (#2d3139), senza icona, più spessa di 0,3 cm rispetto alla dashboard ── */}
      <div className="w-full flex-shrink-0 relative z-20">
        <div
          className="w-full rounded-none flex items-center justify-between px-5 md:px-7 select-none"
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
              {isNotion ? 'Tasks' : 'Activities'}
            </h1>
          </div>
        </div>
      </div>

      {/* ── CANVAS AZZURRO TENUE (IDENTICO AL COLORE DI COMPANIES) ── */}
      <div
        className="h-full flex-1 rounded-tl-none rounded-bl-[48px] flex flex-col justify-between relative min-w-0 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #f0f8fd 0%, #e5f3fa 100%)',
          borderLeft: '1.5px solid #d4ebf9',
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
          borderTopLeftRadius: '0px',
        }}
      >
        {/* ── Contenuto Principale con scroll fluido con rotellina del mouse ── */}
        <div className="flex-1 min-h-0 px-4 md:px-7 py-3 overflow-y-auto custom-popup-scrollbar overscroll-y-contain">

          {/* ── TESTATA: NOTION STYLE SU PORT 3000, SWITZER CLASSICA SU PORT 3005 ── */}
          {isNotion ? (
            <div className="mb-4 pb-3 border-b border-slate-200">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Pulsanti Sinistra: + New Task ed Aggiorna */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[15px] rounded-lg transition-all shadow-2xs active:scale-95 cursor-pointer"
                    title="Crea un nuovo task"
                  >
                    <span>+ New Task</span>
                  </button>

                  <button
                    type="button"
                    onClick={triggerPipelineSync}
                    disabled={syncingPipeline}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 font-semibold text-[15px] rounded-lg transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                    title="Esegui scansione immediata email, generazione tasks e bozze"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${syncingPipeline ? 'animate-spin' : ''}`} />
                    <span>Aggiorna</span>
                  </button>
                </div>

                {mainTab === 'drafts' && (
                  <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setMainTab('tasks')}
                      className="px-3 py-1.5 text-[15px] font-semibold rounded-lg transition-all border bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer shadow-2xs"
                    >
                      ← All Tasks
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-sky-200/80">
              {/* Pulsanti Sinistra: + New Task ed Aggiorna */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-[15px] rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Crea una nuova attività"
                >
                  <span>+ New Task</span>
                </button>

                <button
                  type="button"
                  onClick={triggerPipelineSync}
                  disabled={syncingPipeline}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-sky-200 font-extrabold text-[15px] rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  title="Esegui scansione immediata email, generazione tasks e bozze"
                >
                  <RefreshCw className={`w-4 h-4 text-[#0284c7] ${syncingPipeline ? 'animate-spin' : ''}`} />
                  <span>Aggiorna</span>
                </button>
              </div>

              {mainTab === 'drafts' && (
                <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={() => setMainTab('tasks')}
                    className="px-3.5 py-2 text-[15px] font-black uppercase tracking-wider rounded-xl transition-all border bg-white/80 hover:bg-white text-slate-700 border-sky-200 cursor-pointer shadow-xs"
                  >
                    ← Tutte le Attività
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Banner notifica feedback scansione pipeline */}
          {pipelineSyncMsg && (
            <div className="mb-4 p-3 rounded-xl bg-white border border-sky-300 text-[#0284c7] text-[15px] font-bold flex items-center justify-between shadow-xs animate-in fade-in">
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
          {mainTab === 'tasks' && (
            <div>
              {/* ── BARRA DI CONTROLLO & FILTRI: NOTION STYLE SU 3000, CLASSICA SU 3005 ── */}
              {isNotion ? (
                <div className="mb-4 space-y-2.5">
                  {/* Riga Superiore: Notion View Tabs (Board / List) + Ricerca Notion + Filtri rapidi */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-200">
                    {/* Notion Database Views Tab Switcher */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewMode('monday')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-[15px] font-bold rounded-md transition-all cursor-pointer ${
                          viewMode === 'monday'
                            ? 'bg-[#0073ea] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>Tabella Monday</span>
                        <span className={`text-[12px] px-1 py-0.2 rounded font-bold ml-0.5 ${viewMode === 'monday' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {activities.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewMode('kanban')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-[15px] font-semibold rounded-md transition-all cursor-pointer ${
                          viewMode === 'kanban'
                            ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/90'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                        }`}
                      >
                        <Columns className="w-3.5 h-3.5 text-slate-500" />
                        <span>Board</span>
                        <span className="text-[13px] px-1 py-0.2 bg-slate-100 rounded text-slate-500 font-bold ml-0.5">
                          {activities.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-[15px] font-semibold rounded-md transition-all cursor-pointer ${
                          viewMode === 'list'
                            ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/90'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                        }`}
                      >
                        <LayoutList className="w-3.5 h-3.5 text-slate-500" />
                        <span>List</span>
                      </button>
                    </div>

                    {/* Notion Filter Dropdowns & Minimalist Search Bar */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Notion Category Filter */}
                      <div className="relative">
                        <select
                          value={categoryFilter}
                          onChange={e => setCategoryFilter(e.target.value)}
                          className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-md pl-2 pr-6 py-1 text-[15px] text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                        >
                          <option value="all">Category: All</option>
                          <option value="commercial">📞 Commerciale & Call</option>
                          <option value="shooting">🎬 Shooting & Set</option>
                          <option value="postprod">💻 Post-Produzione</option>
                          <option value="admin">📄 Amministrazione</option>
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>

                      {/* Notion Priority Filter */}
                      <div className="relative">
                        <select
                          value={priorityFilter}
                          onChange={e => setPriorityFilter(e.target.value)}
                          className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-md pl-2 pr-6 py-1 text-[15px] text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                        >
                          <option value="all">Priority: All</option>
                          <option value="high">🔴 Alta priorità</option>
                          <option value="medium">🔵 Media</option>
                          <option value="low">⚪ Bassa</option>
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>

                      {/* Notion Status Filter */}
                      <div className="relative">
                        <select
                          value={statusFilter}
                          onChange={e => setStatusFilter(e.target.value)}
                          className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-md pl-2 pr-6 py-1 text-[15px] text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                        >
                          <option value="all">Status: All</option>
                          <option value="today">⚡ To Do (Oggi)</option>
                          <option value="in_progress">🔵 In corso</option>
                          <option value="fermo">🔴 Fermo</option>
                          <option value="pending">In attesa</option>
                          <option value="completed">Completate</option>
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>

                      {/* Notion Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Filter tasks..."
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-md pl-7 pr-6 py-1 text-[15px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white w-36 sm:w-44 transition-all shadow-2xs"
                        />
                        {search && (
                          <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Reset filter badge */}
                      {(categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all' || search) && (
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryFilter('all')
                            setPriorityFilter('all')
                            setStatusFilter('all')
                            setSearch('')
                          }}
                          className="px-2 py-1 text-[15px] font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                        className="w-full bg-white border-2 border-[#0284c7] hover:border-[#0369a1] focus:border-[#0369a1] focus:ring-2 focus:ring-[#0284c7]/20 rounded-full pl-10 pr-9 py-2.5 text-[15px] md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-bold shadow-xs transition-all leading-normal"
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
                        className="appearance-none bg-white border border-slate-300 hover:border-slate-400 rounded-lg pl-3 pr-8 py-1.5 text-[15px] text-slate-800 focus:outline-none focus:border-[#0284c7] font-bold shadow-xs transition-all cursor-pointer"
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
                        className="appearance-none bg-white border border-slate-300 hover:border-slate-400 rounded-lg pl-3 pr-8 py-1.5 text-[15px] text-slate-800 focus:outline-none focus:border-[#0284c7] font-bold shadow-xs transition-all cursor-pointer"
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
                        className="appearance-none bg-white border border-slate-300 hover:border-slate-400 rounded-lg pl-3 pr-8 py-1.5 text-[15px] text-slate-800 focus:outline-none focus:border-[#0284c7] font-bold shadow-xs transition-all cursor-pointer"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        <option value="all">Tutti gli stati</option>
                        <option value="today">⚡ Solo To Do (Oggi)</option>
                        <option value="in_progress">🔵 In corso</option>
                        <option value="fermo">🔴 Fermo</option>
                        <option value="pending">In attesa</option>
                        <option value="completed">Completate</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Riquadro Switcher Vista Monday / Timeline / Kanban */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setViewMode('monday')}
                        className={`flex items-center gap-1.5 px-3 py-1 text-[15px] font-black rounded-md transition-all cursor-pointer ${
                          viewMode === 'monday'
                            ? 'bg-[#0073ea] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>Monday</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1.5 px-3 py-1 text-[15px] font-black rounded-md transition-all cursor-pointer ${
                          viewMode === 'list'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <LayoutList className="w-3.5 h-3.5" />
                        <span>Timeline</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('kanban')}
                        className={`flex items-center gap-1.5 px-3 py-1 text-[15px] font-black rounded-md transition-all cursor-pointer ${
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
                        className="px-2.5 py-1.5 text-[14px] font-bold text-slate-600 hover:text-slate-900 rounded-lg bg-slate-200/80 hover:bg-slate-300/80 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Reimposta filtri e ricerca"
                      >
                        <X className="w-3 h-3" />
                        <span>Azzera filtri</span>
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ── CONSOLE ATTIVITÀ & HELPERS: RIQUADRO PRIORITÀ COMPATTO / ESTESO ── */}
              {(() => {
                const renderWalkmanBox = () => (
                  <div className="flex items-center gap-1 bg-[#e0f2fe] px-2.5 py-1 rounded-lg border border-[#bae6fd] text-sky-900 shadow-2xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentTaskIdx(i => (i - 1 + activities.length) % activities.length)
                      }}
                      className="px-2 py-0.5 hover:bg-white text-sky-800 rounded text-[15px] font-semibold flex items-center gap-0.5 cursor-pointer transition-colors"
                      title="Torna all'attività precedente"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>PREV</span>
                    </button>
                    <span className="text-sky-300 font-bold">|</span>
                    <span className="px-1.5 py-0.5 text-[15px] font-bold text-sky-900 select-none">
                      {Math.min(currentTaskIdx + 1, activities.length)}/{activities.length}
                    </span>
                    <span className="text-sky-300 font-bold">|</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentTaskIdx(i => (i + 1) % activities.length)
                      }}
                      className="px-2 py-0.5 hover:bg-white text-sky-800 rounded text-[15px] font-semibold flex items-center gap-0.5 cursor-pointer transition-colors"
                      title="Skip: passa all'attività successiva"
                    >
                      <span>SKIP</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )

                const renderPriorityPills = () => (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[14px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                      PRIORITY:
                    </span>
                    {TASK_PRIORITIES.map((p) => {
                      const isSelected = activeTask.priority === p.id ||
                        (activeTask.priority === 'high' && p.id === 'urgent_3d') ||
                        (activeTask.priority === 'medium' && p.id === 'week_1') ||
                        (activeTask.priority === 'low' && p.id === 'month_1')
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpdatePriority(activeTask.id, p.id)
                          }}
                          className={`px-2 py-0.5 text-[14px] font-medium rounded-md transition-all cursor-pointer border ${
                            isSelected
                              ? 'ring-1 ring-slate-500 font-bold shadow-2xs'
                              : 'opacity-55 hover:opacity-100'
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
                )

                const renderCompactPriorityCard = () => {
                  if (!activeTask) return null
                  const isActiveDone = activeTask.status === 'completed'

                  if (isNotion) {
                    return (
                      <div
                        onClick={() => setIsPriorityExpanded(true)}
                        className="bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl p-3.5 relative overflow-hidden transition-all hover:border-slate-300 hover:shadow-xs cursor-pointer group"
                        title="Clicca per estendere a tutta larghezza e visualizzare note e allegati completi"
                      >
                        {/* Riga Superiore: Priority a sinistra, icona Espandi a destra */}
                        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                          {renderPriorityPills()}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsPriorityExpanded(true)
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                            title="Espandi a tutta larghezza"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Centro: Walkman PREV / SKIP centrato in blu tenue */}
                        <div className="flex justify-center items-center my-2.5">
                          {renderWalkmanBox()}
                        </div>

                        {/* Titolo e Metadati del Task */}
                        <div className="mb-2.5">
                          <h3
                            className={`text-[15px] font-bold tracking-tight line-clamp-2 mb-1 ${
                              isActiveDone ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {activeTask.title}
                          </h3>

                          <div className="flex items-center gap-2 text-[15px] text-slate-500 flex-wrap">
                            <span className="text-slate-800 font-semibold">{activeTask.company || 'DADO Studio'}</span>
                            <BantLogoMark size="sm" bant={getActivityBant(activeTask, companies)} />
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-400 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              {activeTask.date || 'Oggi'} {activeTask.time || ''}
                            </span>
                            {activeTask.assignedTo && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[14px] font-medium">
                                  <UserCheck className="w-3 h-3 text-slate-500" />
                                  {activeTask.assignedTo}
                                </span>
                              </>
                            )}
                            {activeTask.reminder?.enabled && (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded text-[13px] font-semibold">
                                🔔 {activeTask.reminder.time || '10:00'}
                              </span>
                            )}
                            {activeTask.automation?.enabled && (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded text-[13px] font-semibold">
                                ⚡ {activeTask.automation.causeLabel || 'Automazione'}
                              </span>
                            )}
                          </div>

                          {activeTask.notes && (
                            <p className="mt-2 text-[15px] text-slate-500 line-clamp-1 italic bg-slate-50 px-2 py-1 rounded border border-slate-100">
                              "{activeTask.notes}"
                            </p>
                          )}
                        </div>

                        {/* Azioni Conseguenti in basso */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">


                          <div className="flex items-center gap-1.5 ml-auto">
                            <select
                              value={activeTask.status || 'pending'}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleSelectStatus(activeTask, e.target.value)
                              }}
                              className="py-1 px-2 rounded-lg text-[13px] font-bold text-white uppercase tracking-wider cursor-pointer shadow-2xs appearance-none text-center focus:outline-none transition-transform active:scale-95"
                              style={{
                                backgroundColor: getTaskStatusInfo(activeTask.status).color,
                              }}
                              title="Modifica stato del task"
                            >
                              <option value="pending" className="text-slate-900 bg-white font-bold">🟡 In attesa</option>
                              <option value="in_progress" className="text-slate-900 bg-white font-bold">🔵 In corso</option>
                              <option value="fermo" className="text-slate-900 bg-white font-bold">🔴 Fermo</option>
                              <option value="completed" className="text-slate-900 bg-white font-bold">🟢 Completato</option>
                            </select>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleStatus(activeTask)
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[13px] font-bold uppercase transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95 ${
                                isActiveDone
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600'
                              }`}
                              title={isActiveDone ? 'Riapri attività' : 'Segna come completata'}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>{isActiveDone ? 'Riapri' : 'Completa'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(activeTask.id)
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-500 text-[15px] transition-all shadow-2xs cursor-pointer active:scale-95"
                              title="Rimuovi attività"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      onClick={() => setIsPriorityExpanded(true)}
                      className="bg-[#faf8f5] border-2 border-[#8b5cf6]/60 rounded-2xl p-3.5 relative overflow-hidden transition-all shadow-xs hover:border-[#8b5cf6] cursor-pointer group"
                      style={{ fontFamily: '"Switzer", sans-serif' }}
                      title="Clicca per estendere a tutta larghezza"
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-purple-100">
                        {renderPriorityPills()}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsPriorityExpanded(true)
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                          title="Espandi a tutta larghezza"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-center items-center my-2.5">
                        {renderWalkmanBox()}
                      </div>

                      <div className="mb-2.5">
                        <h3
                          className={`text-[15px] font-black tracking-tight line-clamp-2 mb-1 ${
                            isActiveDone ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {activeTask.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[15px] text-slate-600 flex-wrap">
                          <span className="text-[#0284c7] font-black">{activeTask.company || 'DADO Studio'}</span>
                          <BantLogoMark size="sm" bant={getActivityBant(activeTask, companies)} />
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-500 font-bold">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {activeTask.date || 'Oggi'} {activeTask.time || ''}
                          </span>
                          {activeTask.assignedTo && (
                            <span className="text-[13px] font-black uppercase px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800">
                              {activeTask.assignedTo}
                            </span>
                          )}
                          {activeTask.reminder?.enabled && (
                            <span className="text-[13px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                              🔔 {activeTask.reminder.time || '10:00'}
                            </span>
                          )}
                          {activeTask.automation?.enabled && (
                            <span className="text-[13px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                              ⚡ {activeTask.automation.causeLabel || 'Automazione'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-purple-100 flex-wrap">


                        <div className="flex items-center gap-1.5 ml-auto">
                          <select
                            value={activeTask.status || 'pending'}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleSelectStatus(activeTask, e.target.value)
                            }}
                            className="py-1 px-2.5 rounded-xl text-[13px] font-black text-white uppercase tracking-wider cursor-pointer shadow-xs appearance-none text-center focus:outline-none transition-transform active:scale-95"
                            style={{
                              backgroundColor: getTaskStatusInfo(activeTask.status).color,
                            }}
                            title="Modifica stato del task"
                          >
                            <option value="pending" className="text-slate-900 bg-white font-bold">🟡 In attesa</option>
                            <option value="in_progress" className="text-slate-900 bg-white font-bold">🔵 In corso</option>
                            <option value="fermo" className="text-slate-900 bg-white font-bold">🔴 Fermo</option>
                            <option value="completed" className="text-slate-900 bg-white font-bold">🟢 Completato</option>
                          </select>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleStatus(activeTask)
                            }}
                            className={`px-3 py-1 rounded-xl text-[13px] font-black uppercase transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 ${
                              isActiveDone
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                : 'bg-[#16a34a] hover:bg-[#15803d] text-white border border-[#16a34a]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{isActiveDone ? 'Riapri' : 'Completa'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(activeTask.id)
                            }}
                            className="p-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[15px] font-black uppercase transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Rimuovi attività"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }

                const renderFullConsole = () => {
                  if (!activeTask) return null
                  const isActiveDone = activeTask.status === 'completed'
                  const isActiveTodo = !isActiveDone && (activeTask.due === 'today' || activeTask.period?.toLowerCase() === 'oggi')

                  if (isNotion) {
                    return (
                      <div className="bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-xl px-4 py-3 mb-4 relative overflow-hidden transition-all">
                        {/* Riga Superiore: Priority a sinistra, Walkman PREV / SKIP al centro, Riduci a destra */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
                          {renderPriorityPills()}

                          {/* Centro: Walkman PREV / SKIP in blu tenue */}
                          <div className="flex items-center justify-center">
                            {renderWalkmanBox()}
                          </div>

                          {/* Destra: Pulsante Riduci / Comprimi a metà schermata */}
                          <button
                            type="button"
                            onClick={() => setIsPriorityExpanded(false)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[15px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Riduci riquadro a metà schermata"
                          >
                            <Minimize2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Riduci</span>
                          </button>
                        </div>

                        {/* Corpo Task: Titolo, Company BANT, Assegnato a, Note e Allegati */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                              <span
                                className={`text-[16px] md:text-[18px] font-bold tracking-tight ${
                                  isActiveDone ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {activeTask.title}
                              </span>

                              {/* Riquadro Assegnazione Task a... */}
                              <div className="ml-auto flex items-center shrink-0">
                                <div
                                  className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[15px] transition-all ${
                                    activeTask.assignedTo
                                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                                      : 'bg-white border-dashed border-slate-300 text-slate-500 hover:border-slate-400'
                                  }`}
                                  title="Assegnazione del task a un collaboratore"
                                >
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {activeTask.assignedTo ? (
                                      <UserCheck className="w-3.5 h-3.5 text-slate-700" />
                                    ) : (
                                      <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                    <span className="text-[14px] font-medium text-slate-500 uppercase tracking-wider">
                                      {activeTask.assignedTo ? 'Assegnato a:' : 'Assegna a:'}
                                    </span>
                                  </div>

                                  <div className="relative inline-flex items-center">
                                    <select
                                      value={activeTask.assignedTo || ''}
                                      onChange={(e) => handleAssignTask(activeTask.id, e.target.value)}
                                      className="text-[15px] font-semibold text-slate-800 bg-transparent pl-1 pr-5 py-0.5 rounded cursor-pointer appearance-none focus:outline-none"
                                    >
                                      <option value="">-- Non assegnato --</option>
                                      {userOptions.map(u => (
                                        <option key={u.id || u.name} value={u.name}>
                                          {u.name}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-0 pointer-events-none" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Company + BANT + Orario */}
                            <div className="flex items-center gap-3 text-[15px] text-slate-500 flex-wrap mt-0.5">
                              <span className="text-slate-800 font-semibold">{activeTask.company || 'DADO Studio'}</span>
                              <BantLogoMark size="sm" bant={getActivityBant(activeTask, companies)} />
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-400 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                {activeTask.date || 'Oggi'} {activeTask.time || ''}
                              </span>
                            </div>

                            {/* Sezione Note & Allegati */}
                            <TaskNotesAndAttachments
                              activity={activeTask}
                              onUpdateNotes={handleUpdateNotes}
                              onAddAttachment={handleAddAttachment}
                              onDeleteAttachment={handleDeleteAttachment}
                            />

                            {/* Promemoria & Automazione (Causa ➔ Effetto) */}
                            <TaskReminderAndAutomation
                              activity={activeTask}
                              onUpdateActivity={handleUpdateReminderAndAutomation}
                              isNotion={isNotion}
                            />
                          </div>

                          {/* Azioni Conseguenti: 1. Stato (4 opzioni), 2. Completa/Riapri, 3. Rimuovi */}
                          <div className="flex flex-col items-stretch gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 md:border-l md:pl-4 border-slate-100 min-w-[125px]">
                            <select
                              value={activeTask.status || 'pending'}
                              onChange={(e) => handleSelectStatus(activeTask, e.target.value)}
                              className="w-full py-1 px-2 rounded-lg text-[13px] font-bold text-white uppercase tracking-wider cursor-pointer shadow-2xs appearance-none text-center focus:outline-none transition-transform active:scale-95"
                              style={{
                                backgroundColor: getTaskStatusInfo(activeTask.status).color,
                              }}
                              title="Modifica stato del task"
                            >
                              <option value="pending" className="text-slate-900 bg-white font-bold">🟡 In attesa</option>
                              <option value="in_progress" className="text-slate-900 bg-white font-bold">🔵 In corso</option>
                              <option value="fermo" className="text-slate-900 bg-white font-bold">🔴 Fermo</option>
                              <option value="completed" className="text-slate-900 bg-white font-bold">🟢 Completato</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => toggleStatus(activeTask)}
                              className={`w-full justify-center px-3 py-1.5 rounded-lg text-[13px] font-bold uppercase transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                isActiveDone
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600'
                              }`}
                              title={isActiveDone ? 'Riapri attività' : 'Segna come completata'}
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                              <span>{isActiveDone ? 'Riapri' : 'Completa'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(activeTask.id)}
                              className="w-full justify-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-600 text-[13px] font-semibold uppercase transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                              title="Elimina definitivamente questa attività dal CRM"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Rimuovi</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // Classic Switzer Console on 3005
                  const activeBoxClass = isActiveDone
                    ? 'bg-emerald-100/80 border-2 border-emerald-400 text-slate-900 shadow-[0_4px_24px_rgba(16,185,129,0.18)]'
                    : isActiveTodo
                    ? 'bg-[#faf8f5] border-2 border-[#8b5cf6] text-slate-900 shadow-[0_4px_24px_rgba(139,92,246,0.15)]'
                    : 'bg-[#e6f8f6] border-2 border-[#0284c7] text-slate-900 shadow-[0_4px_24px_rgba(2,132,199,0.15)]'

                  const activeBg = isActiveDone ? '#d1fae5' : isActiveTodo ? '#faf8f5' : '#e6f8f6'
                  const dividerClass = isActiveDone ? 'border-emerald-200/80' : isActiveTodo ? 'border-purple-200/80' : 'border-sky-200/80'

                  return (
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl mb-3 shadow-xs relative overflow-hidden transition-all ${activeBoxClass}`}
                      style={{ backgroundColor: activeBg, fontFamily: '"Switzer", sans-serif' }}
                    >
                      {isActiveDone && (
                        <div
                          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                          aria-hidden="true"
                        >
                          <span
                            className="font-black uppercase tracking-wider text-[#16a34a]/25 select-none leading-none text-center whitespace-nowrap"
                            style={{
                              fontSize: '70px',
                              fontFamily: '"Switzer", sans-serif',
                              letterSpacing: '0.04em',
                            }}
                          >
                            COMPLETATO
                          </span>
                        </div>
                      )}

                      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b relative z-10 ${dividerClass}`}>
                        <div className="flex items-center gap-1.5 flex-shrink-0" title="Modifica priorità del task">
                          <span className="text-[15px] md:text-sm text-slate-900 font-black mr-1 hidden sm:inline tracking-wider uppercase leading-none">PRIORITÀ:</span>
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
                                className={`px-2.5 py-1 text-[15px] md:text-sm font-black uppercase rounded-lg transition-all cursor-pointer border ${
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

                        <div className="flex-1 flex justify-center items-center">
                          {renderWalkmanBox()}
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsPriorityExpanded(false)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[15px] font-black uppercase text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white rounded-xl transition-colors cursor-pointer shrink-0 border border-slate-200"
                          title="Riduci riquadro a metà schermata"
                        >
                          <Minimize2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Riduci</span>
                        </button>
                      </div>

                      <div className="pt-2 pb-0.5 flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`text-[16px] md:text-[18px] font-black tracking-tight ${
                                  isActiveDone ? 'line-through text-slate-500' : 'text-slate-900'
                                }`}
                              >
                                {activeTask.title}
                              </span>
                            </div>

                            <div className="ml-auto flex items-center shrink-0">
                              <div
                                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border text-[15px] transition-all ${
                                  activeTask.assignedTo
                                    ? 'bg-sky-50 border-sky-200 text-sky-900 shadow-2xs'
                                    : 'bg-slate-50 border-dashed border-slate-300 text-slate-600 hover:border-sky-300'
                                }`}
                                title="Assegnazione del task a un collaboratore"
                              >
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {activeTask.assignedTo ? (
                                    <UserCheck className="w-3.5 h-3.5 text-[#0284c7]" />
                                  ) : (
                                    <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                  <span className="text-[14px] font-black text-slate-600 uppercase tracking-wider">
                                    {activeTask.assignedTo ? 'Assegnato a:' : 'Assegna a:'}
                                  </span>
                                </div>

                                <div className="relative inline-flex items-center">
                                  <select
                                    value={activeTask.assignedTo || ''}
                                    onChange={(e) => handleAssignTask(activeTask.id, e.target.value)}
                                    className="text-[15px] font-black text-slate-800 bg-white pl-2 pr-6 py-0.5 rounded-lg border border-slate-200 hover:border-sky-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7] cursor-pointer appearance-none transition-colors"
                                  >
                                    <option value="">-- Non assegnato --</option>
                                    {userOptions.map(u => (
                                      <option key={u.id || u.name} value={u.name}>
                                        {u.name}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 pointer-events-none" />
                                </div>

                                {activeTask.assignedTo && (
                                  <span className="text-[13px] font-black uppercase px-1.5 py-0.5 rounded-md bg-sky-200/70 text-sky-800">
                                    Assegnato
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-[15px] text-slate-600 flex-wrap mt-0.5">
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

                          <TaskNotesAndAttachments
                            activity={activeTask}
                            onUpdateNotes={handleUpdateNotes}
                            onAddAttachment={handleAddAttachment}
                            onDeleteAttachment={handleDeleteAttachment}
                          />

                          {/* Promemoria & Automazione (Causa ➔ Effetto) */}
                          <TaskReminderAndAutomation
                            activity={activeTask}
                            onUpdateActivity={handleUpdateReminderAndAutomation}
                            isNotion={isNotion}
                          />
                        </div>

                        <div className={`flex flex-col items-stretch gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 min-w-[120px] ${dividerClass}`}>
                          <select
                            value={activeTask.status || 'pending'}
                            onChange={(e) => handleSelectStatus(activeTask, e.target.value)}
                            className="w-full py-1.5 px-2 rounded-xl font-black text-[13px] text-white uppercase tracking-wider cursor-pointer shadow-xs appearance-none text-center focus:outline-none transition-transform active:scale-95"
                            style={{
                              backgroundColor: getTaskStatusInfo(activeTask.status).color,
                            }}
                            title="Modifica stato del task"
                          >
                            <option value="pending" className="text-slate-900 bg-white font-bold">🟡 In attesa</option>
                            <option value="in_progress" className="text-slate-900 bg-white font-bold">🔵 In corso</option>
                            <option value="fermo" className="text-slate-900 bg-white font-bold">🔴 Fermo</option>
                            <option value="completed" className="text-slate-900 bg-white font-bold">🟢 Completato</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => toggleStatus(activeTask)}
                            className={`w-full justify-center px-3.5 py-1.5 rounded-xl text-[13px] font-black uppercase transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                              isActiveDone
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                : 'bg-[#16a34a] hover:bg-[#15803d] text-white border border-[#16a34a]'
                            }`}
                            title={isActiveDone ? 'Riapri attività' : 'Segna come completata'}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{isActiveDone ? 'Riapri' : 'Completa'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(activeTask.id)}
                            className="w-full justify-center px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[13px] font-black uppercase transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                            title="Elimina definitivamente questa attività dal CRM"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Rimuovi</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <>
                    {/* ── RENDERING PRINCIPALE: MONDAY TABLE, LISTA O KANBAN IN STILE AZZURRO TENUE ── */}
                    {loading ? (
                      <div className="p-12 text-center text-slate-500 font-bold text-sm">Caricamento attività DADO Studio...</div>
                    ) : viewMode === 'monday' ? (
                      /* VISTA TABELLA MONDAY.COM A GRUPPI E SCROLL ORIZZONTALE */
                      <div className="flex flex-col gap-6 pb-12" style={{ fontFamily: '"Switzer", sans-serif' }}>
                        {/* 1. Console Priorità se espansa */}
                        {isPriorityExpanded && activeTask && (
                          <div className="mb-2">
                            {renderFullConsole()}
                          </div>
                        )}

                        {MONDAY_TASK_GROUPS.map((group) => {
                          let groupTasks = []
                          if (group.id === 'today') groupTasks = todayTasks
                          else if (group.id === 'upcoming') groupTasks = upcomingTasks
                          else if (group.id === 'completed') groupTasks = completedTasks

                          if (statusFilter === 'today' && group.id !== 'today') return null
                          if (statusFilter === 'pending' && group.id !== 'upcoming') return null
                          if (statusFilter === 'completed' && group.id !== 'completed') return null

                          const isCollapsed = collapsedTaskGroups[group.id]
                          const totalCount = groupTasks.length
                          const completedInGroup = groupTasks.filter(t => t.status === 'completed').length
                          const urgentInGroup = groupTasks.filter(t => t.priority === 'urgent_3d' || t.priority === 'high').length

                          return (
                            <div key={group.id} className="flex flex-col">
                              {/* Header Gruppo in puro stile Monday.com */}
                              <div className="flex items-center justify-between mb-2.5 px-1 flex-wrap gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => toggleTaskGroupCollapse(group.id)}
                                    className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
                                    title={isCollapsed ? 'Espandi gruppo' : 'Comprimi gruppo'}
                                  >
                                    {isCollapsed ? (
                                      <ChevronRight className="w-4 h-4 stroke-[3]" style={{ color: group.color }} />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 stroke-[3]" style={{ color: group.color }} />
                                    )}
                                    <span className="text-[17px] font-black uppercase tracking-tight" style={{ color: group.color }}>
                                      {group.title}
                                    </span>
                                  </button>

                                  <span
                                    className="text-[13px] font-extrabold px-2.5 py-0.5 rounded-full"
                                    style={{ backgroundColor: group.bg, color: group.color, border: `1px solid ${group.border}` }}
                                  >
                                    {totalCount} {totalCount === 1 ? 'task' : 'tasks'}
                                  </span>

                                  {group.subtitle && (
                                    <span className="text-[13px] text-slate-500 font-semibold hidden md:inline-block">
                                      — {group.subtitle}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 text-[13px] text-slate-500 font-semibold">
                                  {urgentInGroup > 0 && (
                                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
                                      {urgentInGroup} urgenti
                                    </span>
                                  )}
                                  {totalCount > 0 && (
                                    <span>
                                      Progresso: <strong className="text-slate-900 font-black">{Math.round((completedInGroup / totalCount) * 100)}%</strong>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Tabella Orizzontale Scrollabile stile Monday.com */}
                              {!isCollapsed && (
                                <HorizontalTableScroller
                                  shortcuts={[
                                    { label: 'Task & Azienda', selector: '[data-col="task"]', left: 0 },
                                    { label: 'Stato & Priorità', selector: '[data-col="stato"]', left: 360 },
                                    { label: 'Assegnato', selector: '[data-col="assegnato"]', left: 700 },
                                    { label: 'Scadenza & Orario', selector: '[data-col="scadenza"]', left: 900 },
                                    { label: 'Azienda Collegata', selector: '[data-col="azienda"]', left: 1080 },
                                    { label: 'Categoria', selector: '[data-col="categoria"]', left: 1300 },
                                    { label: 'Checklist & Note', selector: '[data-col="checklist"]', left: 1470 },
                                    { label: 'Azioni', selector: '[data-col="azioni"]', left: 2010 },
                                  ]}
                                >
                                  <table
                                    className="w-full text-left border-collapse text-sm select-none"
                                    style={{ minWidth: '2140px', fontFamily: '"Switzer", sans-serif' }}
                                  >
                                    <thead>
                                      <tr className="bg-slate-50/90 text-slate-600 border-b border-slate-200">
                                        <th data-col="task" className="sticky left-0 bg-slate-100 z-30 w-[360px] min-w-[360px] px-4 py-3 text-[12px] font-black uppercase tracking-wider text-slate-700 border-r border-slate-200 shadow-[4px_0_12px_rgba(0,0,0,0.06)]">
                                          Task / Attività & Azienda
                                        </th>
                                        <th data-col="stato" className="w-[160px] min-w-[160px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200 text-center">
                                          Stato
                                        </th>
                                        <th data-col="priorita" className="w-[180px] min-w-[180px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200 text-center">
                                          Priorità
                                        </th>
                                        <th data-col="assegnato" className="w-[200px] min-w-[200px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200">
                                          Assegnato a
                                        </th>
                                        <th data-col="scadenza" className="w-[180px] min-w-[180px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200">
                                          Scadenza & Orario
                                        </th>
                                        <th data-col="azienda" className="w-[220px] min-w-[220px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200">
                                          Azienda Collegata
                                        </th>
                                        <th data-col="categoria" className="w-[170px] min-w-[170px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200">
                                          Categoria
                                        </th>
                                        <th data-col="checklist" className="w-[190px] min-w-[190px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200">
                                          Checklist & Avanzamento
                                        </th>
                                        <th data-col="note" className="w-[150px] min-w-[150px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200 text-center">
                                          Note & Allegati
                                        </th>
                                        <th data-col="automazioni" className="w-[190px] min-w-[190px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200 text-center">
                                          Automazioni & AI
                                        </th>
                                        <th data-col="azioni" className="w-[130px] min-w-[130px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 text-center">
                                          Azioni
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {groupTasks.length === 0 ? (
                                        <tr>
                                          <td colSpan={11} className="px-4 py-8 text-center text-slate-400 font-semibold text-[14px]">
                                            Nessun task in questa sezione.
                                          </td>
                                        </tr>
                                      ) : (
                                        groupTasks.map((act) => {
                                          const isExpanded = expandedTaskId === act.id
                                          const isDone = act.status === 'completed'
                                          const isTodo = !isDone && (act.due === 'today' || act.period?.toLowerCase() === 'oggi')
                                          const isPriority = !isDone && (act.priority === 'high' || act.priority === 'urgent_3d' || isTodo)
                                          const cat = CATEGORIES[act.type] || CATEGORIES.commercial
                                          const IconComponent = cat.icon
                                          const isAutoGenerated = act.source === 'pipeline_llm_automation' || Boolean(act.checklist?.length) || Boolean(act.emailStatus)

                                          const checklistItems = Array.isArray(act.checklist) ? act.checklist : []
                                          const checklistTotal = checklistItems.length
                                          const checklistDone = checklistItems.filter(i => i.startsWith('✓ ')).length

                                          return (
                                            <Fragment key={act.id}>
                                              <tr className={`group border-b border-slate-200/80 transition-colors ${isExpanded ? 'bg-sky-50/40' : 'hover:bg-slate-50/80'}`}>
                                                {/* 1. Sticky Task Column con Nome Azienda */}
                                                <td className={`sticky left-0 ${isExpanded ? 'bg-[#f0f9ff]' : 'bg-white group-hover:bg-slate-50'} z-20 w-[360px] min-w-[360px] px-3 py-3 border-r border-slate-200 shadow-[4px_0_12px_rgba(0,0,0,0.06)]`}>
                                                  <div className="flex items-center gap-2.5">
                                                    <span className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
                                                    <button
                                                      type="button"
                                                      onClick={() => toggleStatus(act)}
                                                      className="shrink-0 p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                                      title={isDone ? 'Riapri attività' : 'Segna come completata'}
                                                    >
                                                      {isDone ? (
                                                        <CheckCircle2 className="w-5 h-5 text-[#00c875]" />
                                                      ) : (
                                                        <div className="w-5 h-5 rounded-md border-2 border-slate-300 hover:border-[#0073ea] flex items-center justify-center transition-colors" />
                                                      )}
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                      <div className="flex items-center gap-1.5">
                                                        <span
                                                          onClick={() => toggleTaskExpanded(act.id)}
                                                          className={`font-bold text-[14px] truncate cursor-pointer hover:text-[#0073ea] transition-colors ${
                                                            isDone ? 'line-through text-slate-400 font-normal' : 'text-slate-900'
                                                          }`}
                                                          title={act.title}
                                                        >
                                                          {act.title}
                                                        </span>
                                                        <button
                                                          type="button"
                                                          onClick={() => toggleTaskExpanded(act.id)}
                                                          className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer shrink-0"
                                                          title={isExpanded ? 'Chiudi dettagli' : 'Apri dettagli & note'}
                                                        >
                                                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                        </button>
                                                      </div>
                                                      {/* Nome Azienda collegata visibile nel riquadro sticky */}
                                                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mt-0.5 truncate">
                                                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="truncate">{act.company || 'DADO Studio'}</span>
                                                      </div>
                                                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                        {isAutoGenerated && (
                                                          <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1 uppercase tracking-wider">
                                                            <Bot className="w-2.5 h-2.5" />
                                                            Auto CRM
                                                          </span>
                                                        )}
                                                        {act.emailStatus === 'auto_sent' && (
                                                          <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1 uppercase tracking-wider">
                                                            <Send className="w-2.5 h-2.5" />
                                                            Conferma Inviata
                                                          </span>
                                                        )}
                                                        {act.emailStatus === 'draft_saved' && (
                                                          <button
                                                            type="button"
                                                            onClick={() => setMainTab('drafts')}
                                                            className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1 uppercase tracking-wider hover:bg-amber-100 cursor-pointer"
                                                            title="Apri bozza in attesa"
                                                          >
                                                            <Mail className="w-2.5 h-2.5" />
                                                            Bozza pronta
                                                          </button>
                                                        )}
                                                        {isPriority && (
                                                          <span className="text-[11px] font-extrabold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                                                            Prioritaria
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </td>

                                                {/* 2. Stato (In attesa, In corso, Fermo, Completato) */}
                                                <td className="px-3 py-3 border-r border-slate-200 text-center">
                                                  <div className="relative inline-block w-full">
                                                    <select
                                                      value={act.status || 'pending'}
                                                      onChange={(e) => handleSelectStatus(act, e.target.value)}
                                                      className="w-full py-1.5 px-2 text-center rounded-md font-black text-[12px] text-white uppercase tracking-wider cursor-pointer shadow-xs appearance-none focus:outline-none transition-transform active:scale-95"
                                                      style={{
                                                        backgroundColor: getTaskStatusInfo(act.status).color,
                                                      }}
                                                      title="Modifica stato del task"
                                                    >
                                                      <option value="pending" className="text-slate-900 bg-white font-bold">🟡 IN ATTESA</option>
                                                      <option value="in_progress" className="text-slate-900 bg-white font-bold">🔵 IN CORSO</option>
                                                      <option value="fermo" className="text-slate-900 bg-white font-bold">🔴 FERMO</option>
                                                      <option value="completed" className="text-slate-900 bg-white font-bold">🟢 COMPLETATO</option>
                                                    </select>
                                                  </div>
                                                </td>

                                                {/* 3. Priorità */}
                                                <td className="px-3 py-3 border-r border-slate-200 text-center">
                                                  <div className="relative inline-block w-full">
                                                    <select
                                                      value={act.priority || 'medium'}
                                                      onChange={(e) => handleUpdatePriority(act.id, e.target.value)}
                                                      className="w-full py-1.5 px-2 text-center rounded-md font-black text-[12px] text-white uppercase tracking-wider cursor-pointer shadow-xs appearance-none focus:outline-none"
                                                      style={{
                                                        backgroundColor:
                                                          act.priority === 'urgent_3d' || act.priority === 'high'
                                                            ? '#e2445c'
                                                            : act.priority === 'week_1' || act.priority === 'medium'
                                                            ? '#fdab3d'
                                                            : act.priority === 'weeks_2_3'
                                                            ? '#579bfc'
                                                            : '#94a3b8',
                                                      }}
                                                    >
                                                      <option value="urgent_3d" className="text-slate-900 bg-white font-bold">🔴 URGENTE (3 gg)</option>
                                                      <option value="week_1" className="text-slate-900 bg-white font-bold">🟠 1 SETTIMANA</option>
                                                      <option value="weeks_2_3" className="text-slate-900 bg-white font-bold">🔵 2-3 SETTIMANE</option>
                                                      <option value="month_1" className="text-slate-900 bg-white font-bold">⚪ 1 MESE</option>
                                                    </select>
                                                  </div>
                                                </td>

                                                {/* 4. Assegnato a */}
                                                <td className="px-3 py-3 border-r border-slate-200">
                                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50/80 border border-slate-200 hover:border-slate-300">
                                                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-black shrink-0">
                                                      {act.assignedTo ? act.assignedTo.slice(0, 2).toUpperCase() : <User className="w-3 h-3 text-slate-400" />}
                                                    </div>
                                                    <select
                                                      value={act.assignedTo || ''}
                                                      onChange={(e) => handleAssignTask(act.id, e.target.value)}
                                                      className="text-[13px] font-semibold text-slate-800 bg-transparent py-0.5 rounded cursor-pointer appearance-none focus:outline-none w-full truncate"
                                                    >
                                                      <option value="">Non assegnato</option>
                                                      {userOptions.map(u => (
                                                        <option key={u.id || u.name} value={u.name}>{u.name}</option>
                                                      ))}
                                                    </select>
                                                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 pointer-events-none" />
                                                  </div>
                                                </td>

                                                {/* 5. Scadenza & Orario */}
                                                <td className="px-3 py-3 border-r border-slate-200">
                                                  <div className="flex items-center gap-1.5 text-[13px] text-slate-700 font-semibold">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{formatActivityDate(act)}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                                    <span className="text-slate-500 font-medium">{act.time || '10:00'}</span>
                                                  </div>
                                                </td>

                                                {/* 6. Azienda Collegata */}
                                                <td className="px-3 py-3 border-r border-slate-200">
                                                  <div className="flex items-center justify-between gap-1.5">
                                                    <div className="flex items-center gap-1.5 truncate">
                                                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                      <Link
                                                        to={`/companies?highlight=${encodeURIComponent(act.company || '')}`}
                                                        className="text-[13px] font-bold text-slate-800 hover:text-[#0073ea] truncate transition-colors"
                                                        title={act.company}
                                                      >
                                                        {act.company || 'DADO Studio'}
                                                      </Link>
                                                    </div>
                                                    <BantLogoMark size="sm" bant={getActivityBant(act, companies)} />
                                                  </div>
                                                </td>

                                                {/* 7. Categoria */}
                                                <td className="px-3 py-3 border-r border-slate-200">
                                                  <span
                                                    className="px-2 py-0.5 rounded-md text-[12px] font-bold flex items-center gap-1.5 uppercase tracking-wider w-fit"
                                                    style={{
                                                      backgroundColor: cat.bg,
                                                      color: cat.color,
                                                      border: `1px solid ${cat.border}`,
                                                    }}
                                                  >
                                                    <IconComponent className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{cat.label}</span>
                                                  </span>
                                                </td>

                                                {/* 8. Checklist & Avanzamento */}
                                                <td className="px-3 py-3 border-r border-slate-200">
                                                  {checklistTotal > 0 ? (
                                                    <div className="flex items-center justify-between gap-1.5">
                                                      <div
                                                        onClick={() => toggleTaskExpanded(act.id)}
                                                        className="flex-1 cursor-pointer group/chk"
                                                        title="Clicca per visualizzare ed editare la checklist"
                                                      >
                                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                                                          <span className="flex items-center gap-1">
                                                            <CheckSquare className="w-3 h-3 text-emerald-600" />
                                                            {checklistDone}/{checklistTotal}
                                                          </span>
                                                          <span className="text-slate-400">{Math.round((checklistDone / checklistTotal) * 100)}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                                          <div
                                                            className="h-full bg-[#00c875] rounded-full transition-all"
                                                            style={{ width: `${(checklistDone / checklistTotal) * 100}%` }}
                                                          />
                                                        </div>
                                                      </div>
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          if (expandedTaskId !== act.id) setExpandedTaskId(act.id)
                                                          setAddingChecklistTaskId(act.id)
                                                          setNewChecklistText('')
                                                        }}
                                                        className="w-4 h-4 rounded border border-slate-400 hover:border-[#0284c7] bg-white hover:bg-sky-50 flex items-center justify-center font-bold text-[11px] leading-none text-slate-600 hover:text-[#0284c7] cursor-pointer shrink-0 transition-colors shadow-2xs"
                                                        title="Aggiungi voce alla checklist"
                                                      >
                                                        +
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        if (expandedTaskId !== act.id) setExpandedTaskId(act.id)
                                                        setAddingChecklistTaskId(act.id)
                                                        setNewChecklistText('')
                                                      }}
                                                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-slate-300 hover:border-[#0284c7] hover:bg-sky-50 text-slate-700 hover:text-[#0284c7] text-[12px] font-semibold transition-all cursor-pointer group shadow-2xs"
                                                      title="Inserisci una checklist per questa attività"
                                                    >
                                                      <span className="w-3.5 h-3.5 rounded border border-slate-400 group-hover:border-[#0284c7] flex items-center justify-center font-bold text-[11px] leading-none text-slate-600 group-hover:text-[#0284c7] bg-white group-hover:bg-sky-100/50">
                                                        +
                                                      </span>
                                                      <span>Checklist</span>
                                                    </button>
                                                  )}
                                                </td>

                                                {/* 9. Note & Allegati */}
                                                <td className="px-3 py-3 border-r border-slate-200 text-center">
                                                  <button
                                                    type="button"
                                                    onClick={() => toggleTaskExpanded(act.id)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-bold transition-all cursor-pointer ${
                                                      act.notes || (act.attachments && act.attachments.length > 0)
                                                        ? 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
                                                        : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                                                    }`}
                                                    title="Clicca per aprire note e allegati"
                                                  >
                                                    <Paperclip className="w-3 h-3" />
                                                    <span>{act.attachments?.length || 0}</span>
                                                    {act.notes && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
                                                  </button>
                                                </td>

                                                {/* 10. Automazioni & AI */}
                                                <td className="px-3 py-3 border-r border-slate-200 text-center">
                                                  <button
                                                    type="button"
                                                    onClick={() => toggleTaskExpanded(act.id)}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
                                                    title="Clicca per configurare automazioni e promemoria"
                                                  >
                                                    <Zap className="w-3 h-3 text-purple-600 shrink-0" />
                                                    <span className="truncate max-w-[130px]">
                                                      {act.automation?.causeLabel ? act.automation.causeLabel : 'Trigger AI'}
                                                    </span>
                                                  </button>
                                                </td>

                                                {/* 11. Azioni */}
                                                <td className="px-3 py-3 text-center">
                                                  <div className="flex items-center justify-center gap-1">
                                                    <button
                                                      type="button"
                                                      onClick={() => toggleTaskExpanded(act.id)}
                                                      className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                                      title={isExpanded ? 'Chiudi dettagli' : 'Apri dettagli'}
                                                    >
                                                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => handleDelete(act.id)}
                                                      className="p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                                      title="Elimina attività"
                                                    >
                                                      <Trash2 className="w-4 h-4" />
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>

                                              {/* Riga Dettagli Espansi Monday */}
                                              {isExpanded && (
                                                <tr className="bg-slate-50/70 border-b-2 border-slate-200">
                                                  <td colSpan={11} className="p-4">
                                                    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-4">
                                                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                                        <div className="flex items-center gap-2">
                                                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                                                          <h4 className="text-[15px] font-bold text-slate-900">
                                                            Dettagli completi attività: <span className="text-[#0073ea]">{act.title}</span>
                                                          </h4>
                                                        </div>
                                                        <button
                                                          type="button"
                                                          onClick={() => toggleTaskExpanded(act.id)}
                                                          className="text-slate-400 hover:text-slate-600 text-[13px] font-semibold flex items-center gap-1 cursor-pointer"
                                                        >
                                                          <ChevronUp className="w-3.5 h-3.5" />
                                                          <span>Chiudi dettagli</span>
                                                        </button>
                                                      </div>

                                                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                        {/* Sezione 1: Checklist Operativa */}
                                                        <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200">
                                                          <div className="text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                                                            <div className="flex items-center gap-1.5">
                                                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                                                              <span>Checklist Operativa ({checklistDone}/{checklistTotal})</span>
                                                            </div>
                                                          </div>
                                                          {checklistTotal > 0 ? (
                                                            <div className="space-y-1.5 mb-2.5">
                                                              {checklistItems.map((item, idx) => {
                                                                const checked = item.startsWith('✓ ')
                                                                const text = checked ? item.replace('✓ ', '') : item
                                                                return (
                                                                  <div
                                                                    key={idx}
                                                                    className="group/citem flex items-center justify-between gap-2 p-1 rounded hover:bg-slate-100/70 transition-colors"
                                                                  >
                                                                    <div
                                                                      onClick={() => toggleChecklistItem(act, idx)}
                                                                      className="flex items-start gap-2 text-[14px] text-slate-700 cursor-pointer hover:text-black transition-colors flex-1"
                                                                    >
                                                                      {checked ? (
                                                                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                                      ) : (
                                                                        <Square className="w-4 h-4 text-slate-400 hover:text-slate-600 shrink-0 mt-0.5" />
                                                                      )}
                                                                      <span className={checked ? 'line-through text-slate-400 font-normal' : 'font-medium'}>
                                                                        {text}
                                                                      </span>
                                                                    </div>
                                                                    <button
                                                                      type="button"
                                                                      onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleDeleteChecklistItem(act, idx)
                                                                      }}
                                                                      className="opacity-0 group-hover/citem:opacity-100 text-slate-400 hover:text-red-500 p-0.5 transition-opacity cursor-pointer"
                                                                      title="Elimina voce checklist"
                                                                    >
                                                                      <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                  </div>
                                                                )
                                                              })}
                                                            </div>
                                                          ) : (
                                                            <p className="text-[13px] text-slate-400 italic mb-2.5">Nessun punto di checklist presente.</p>
                                                          )}

                                                          {/* Form inserimento nuova voce checklist o bottone [+] */}
                                                          {addingChecklistTaskId === act.id ? (
                                                            <form
                                                              onSubmit={(e) => {
                                                                e.preventDefault()
                                                                if (newChecklistText.trim()) {
                                                                  handleAddChecklistItem(act, newChecklistText.trim())
                                                                  setNewChecklistText('')
                                                                }
                                                              }}
                                                              className="flex items-center gap-1.5 mt-2"
                                                            >
                                                              <input
                                                                type="text"
                                                                value={newChecklistText}
                                                                onChange={(e) => setNewChecklistText(e.target.value)}
                                                                placeholder="Scrivi nuovo punto checklist..."
                                                                className="flex-1 px-3 py-1.5 text-[13px] rounded-lg border border-[#0284c7] bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0284c7] font-medium"
                                                                autoFocus
                                                              />
                                                              <button
                                                                type="submit"
                                                                disabled={!newChecklistText.trim()}
                                                                className="px-3 py-1.5 bg-[#0284c7] hover:bg-sky-700 disabled:opacity-50 text-white text-[12px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                                                              >
                                                                Aggiungi
                                                              </button>
                                                              <button
                                                                type="button"
                                                                onClick={() => {
                                                                  setAddingChecklistTaskId(null)
                                                                  setNewChecklistText('')
                                                                }}
                                                                className="px-2 py-1.5 text-slate-400 hover:text-slate-600 text-[12px] font-medium cursor-pointer"
                                                              >
                                                                Annulla
                                                              </button>
                                                            </form>
                                                          ) : (
                                                            <button
                                                              type="button"
                                                              onClick={() => {
                                                                setAddingChecklistTaskId(act.id)
                                                                setNewChecklistText('')
                                                              }}
                                                              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:border-[#0284c7] bg-white hover:bg-sky-50 text-slate-700 hover:text-[#0284c7] text-[13px] font-semibold transition-all cursor-pointer group shadow-2xs"
                                                              title="Aggiungi una voce alla checklist"
                                                            >
                                                              <span className="w-4 h-4 rounded border border-slate-400 group-hover:border-[#0284c7] flex items-center justify-center font-bold text-[12px] leading-none text-slate-600 group-hover:text-[#0284c7] bg-slate-50 group-hover:bg-sky-100/50">
                                                                +
                                                              </span>
                                                              <span>Aggiungi checklist</span>
                                                            </button>
                                                          )}
                                                        </div>

                                                        {/* Sezione 2: Note & Allegati */}
                                                        <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200">
                                                          <TaskNotesAndAttachments
                                                            activity={act}
                                                            onUpdateNotes={handleUpdateNotes}
                                                            onAddAttachment={handleAddAttachment}
                                                            onDeleteAttachment={handleDeleteAttachment}
                                                          />
                                                        </div>

                                                        {/* Sezione 3: Promemoria & Automazioni AI (Causa ➔ Effetto) */}
                                                        <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200">
                                                          <TaskReminderAndAutomation
                                                            activity={act}
                                                            onUpdateActivity={handleUpdateReminderAndAutomation}
                                                            isNotion={false}
                                                          />
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </td>
                                                </tr>
                                              )}
                                            </Fragment>
                                          )
                                        })
                                      )}
                                    </tbody>
                                    {/* Aggregazione Footer Gruppo Monday */}
                                    <tfoot>
                                      <tr className="bg-slate-50/90 text-slate-600 border-t border-slate-200 font-bold text-[13px]">
                                        <td className="sticky left-0 bg-slate-100 z-20 px-4 py-2.5 border-r border-slate-200 shadow-[4px_0_12px_rgba(0,0,0,0.06)]">
                                          Totale: {totalCount} {totalCount === 1 ? 'attività' : 'attività'}
                                        </td>
                                        <td className="px-3 py-2.5 border-r border-slate-200 text-center">
                                          <span className="text-[12px] font-extrabold text-[#00c875]">
                                            {completedInGroup}/{totalCount} completate
                                          </span>
                                        </td>
                                        <td className="px-3 py-2.5 border-r border-slate-200 text-center">
                                          {urgentInGroup > 0 ? (
                                            <span className="text-[12px] font-extrabold text-[#e2445c]">
                                              {urgentInGroup} ad alta priorità
                                            </span>
                                          ) : (
                                            <span className="text-[12px] text-slate-400 font-medium">Nessuna urgenza</span>
                                          )}
                                        </td>
                                        <td colSpan={8} className="px-4 py-2.5 text-right text-slate-400 font-medium text-[12px]">
                                          DADO Studio • Monday Workflow
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </HorizontalTableScroller>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : viewMode === 'list' ? (
                      /* VISTA TIMELINE LISTA */
                      <div className="space-y-6 pb-12" style={isNotion ? undefined : { fontFamily: '"Switzer", sans-serif' }}>
                        
                        {/* 1. SE ESPANSA: MOSTRA IL RIQUADRO PRIORITÀ A TUTTA LARGHEZZA */}
                        {isPriorityExpanded && activeTask && (
                          <div className="mb-4">
                            {renderFullConsole()}
                          </div>
                        )}

                        {/* 2. SE COMPRESSA: SPLIT 2 COLONNE IN ALTO (A SINISTRA 1° TASK TO DO DI OGGI, A DESTRA RIQUADRO PRIORITÀ CONCENTRATO) */}
                        {!isPriorityExpanded && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-start">
                            {/* Metà Sinistra: Primo task TO DO di oggi */}
                            <div>
                              {todayTasks.length > 0 ? (
                                <div>
                                  <div className="flex items-center gap-2 mb-2.5">
                                    {isNotion ? (
                                      <div className="flex items-center gap-2 text-[15px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                                        <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                                        <span>TO DO / OGGI</span>
                                        <span className="text-slate-600 font-bold">({todayTasks.length})</span>
                                      </div>
                                    ) : (
                                      <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-xs">
                                        <span>TO DO / OGGI</span>
                                        <span className="text-slate-600 font-black">({todayTasks.length})</span>
                                      </h2>
                                    )}
                                  </div>
                                  <ActivityCard
                                    activity={todayTasks[0]}
                                    onToggle={toggleStatus}
                                    onSelectStatus={handleSelectStatus}
                                    onDelete={handleDelete}
                                    onUpdatePriority={handleUpdatePriority}
                                    onToggleChecklist={toggleChecklistItem}
                                    onAddChecklist={handleAddChecklistItem}
                                    onDeleteChecklist={handleDeleteChecklistItem}
                                    onOpenDrafts={() => setMainTab('drafts')}
                                    onAssign={handleAssignTask}
                                    onUpdateNotes={handleUpdateNotes}
                                    onAddAttachment={handleAddAttachment}
                                    onDeleteAttachment={handleDeleteAttachment}
                                    onUpdateActivity={handleUpdateReminderAndAutomation}
                                    userList={userOptions}
                                    companies={companies}
                                    isToday
                                    isNotion={isNotion}
                                  />
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center gap-2 mb-2.5">
                                    <div className="text-[15px] font-bold uppercase tracking-wider text-slate-400">
                                      TO DO / OGGI (0)
                                    </div>
                                  </div>
                                  <div className={`rounded-xl border p-6 text-center ${isNotion ? 'bg-white border-slate-200/80 shadow-2xs' : 'bg-[#faf8f5] border-purple-200 shadow-xs'}`}>
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                                    <div className="text-[15px] font-bold text-slate-700 uppercase tracking-wider">Nessun task per oggi</div>
                                    <p className="text-[15px] text-slate-400 mt-0.5">Tutte le attività odierne sono state completate!</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Metà Destra: Riquadro Priorità concentrato */}
                            {activeTask && (
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-2.5">
                                  {isNotion ? (
                                    <div className="flex items-center gap-2 text-[15px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                                      <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                                      <span>PRIORITÀ ATTIVA</span>
                                    </div>
                                  ) : (
                                    <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-sky-200 flex items-center gap-2 shadow-xs">
                                      <span>PRIORITÀ ATTIVA</span>
                                    </h2>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setIsPriorityExpanded(true)}
                                    className="inline-flex items-center gap-1 text-[14px] font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                    title="Espandi a tutta larghezza"
                                  >
                                    <span>Espandi</span>
                                    <Maximize2 className="w-3 h-3" />
                                  </button>
                                </div>
                                {renderCompactPriorityCard()}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3. SE ESPANSA: RENDERIZZA TUTTI I TASK TO DO (A PARTIRE DAL PRIMO) */}
                        {isPriorityExpanded && todayTasks.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2.5">
                              {isNotion ? (
                                <div className="flex items-center gap-2 text-[15px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                                  <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                                  <span>TO DO / OGGI</span>
                                  <span className="text-slate-600 font-bold">({todayTasks.length})</span>
                                </div>
                              ) : (
                                <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-xs">
                                  <span>TO DO / OGGI</span>
                                  <span className="text-slate-600 font-black">({todayTasks.length})</span>
                                </h2>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {todayTasks.map(act => (
                                <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onSelectStatus={handleSelectStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onAddChecklist={handleAddChecklistItem} onDeleteChecklist={handleDeleteChecklistItem} onOpenDrafts={() => setMainTab('drafts')} onAssign={handleAssignTask} onUpdateNotes={handleUpdateNotes} onAddAttachment={handleAddAttachment} onDeleteAttachment={handleDeleteAttachment} onUpdateActivity={handleUpdateReminderAndAutomation} userList={userOptions} companies={companies} isToday isNotion={isNotion} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. SE COMPRESSA: RENDERIZZA TUTTI I RIMANENTI TASK TO DO (DAL SECONDO IN POI) */}
                        {!isPriorityExpanded && todayTasks.length > 1 && (
                          <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {todayTasks.slice(1).map(act => (
                                <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onSelectStatus={handleSelectStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onAddChecklist={handleAddChecklistItem} onDeleteChecklist={handleDeleteChecklistItem} onOpenDrafts={() => setMainTab('drafts')} onAssign={handleAssignTask} onUpdateNotes={handleUpdateNotes} onAddAttachment={handleAddAttachment} onDeleteAttachment={handleDeleteAttachment} onUpdateActivity={handleUpdateReminderAndAutomation} userList={userOptions} companies={companies} isToday isNotion={isNotion} />
                              ))}
                            </div>
                          </div>
                        )}

                  {/* Sezione: IN PROGRAMMA (In coda / Prossimi Giorni) */}
                  {upcomingTasks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        {isNotion ? (
                          <div className="flex items-center gap-2 text-[15px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                            <span>IN PROGRAMMA</span>
                            <span className="text-slate-600 font-bold">({upcomingTasks.length})</span>
                          </div>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4 text-[#0284c7]" />
                            <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-sky-200 flex items-center gap-2 shadow-xs">
                              <span>IN PROGRAMMA</span>
                              <span className="text-[#0284c7] font-black">({upcomingTasks.length})</span>
                            </h2>
                          </>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {upcomingTasks.map(act => (
                          <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onSelectStatus={handleSelectStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onAddChecklist={handleAddChecklistItem} onDeleteChecklist={handleDeleteChecklistItem} onOpenDrafts={() => setMainTab('drafts')} onAssign={handleAssignTask} onUpdateNotes={handleUpdateNotes} onAddAttachment={handleAddAttachment} onDeleteAttachment={handleDeleteAttachment} onUpdateActivity={handleUpdateReminderAndAutomation} userList={userOptions} companies={companies} isNotion={isNotion} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sezione: COMPLETATE */}
                  {completedTasks.length > 0 && statusFilter !== 'today' && statusFilter !== 'pending' && (
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        {isNotion ? (
                          <div className="flex items-center gap-2 text-[15px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                            <span>COMPLETATE</span>
                            <span className="text-slate-600 font-bold">({completedTasks.length})</span>
                          </div>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                            <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-600 bg-white/80 px-3.5 py-2 rounded-xl border border-sky-200 flex items-center gap-2 shadow-xs">
                              <span>COMPLETATE</span>
                              <span className="text-[#16a34a] font-black">({completedTasks.length})</span>
                            </h2>
                          </>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-75 hover:opacity-100 transition-opacity">
                        {completedTasks.map(act => (
                          <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onSelectStatus={handleSelectStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onAddChecklist={handleAddChecklistItem} onDeleteChecklist={handleDeleteChecklistItem} onOpenDrafts={() => setMainTab('drafts')} onAssign={handleAssignTask} onUpdateNotes={handleUpdateNotes} onAddAttachment={handleAddAttachment} onDeleteAttachment={handleDeleteAttachment} onUpdateActivity={handleUpdateReminderAndAutomation} userList={userOptions} companies={companies} isNotion={isNotion} />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredActivities.length === 0 && (
                    <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500 font-bold text-sm shadow-xs">
                      Nessuna attività trovata con i filtri selezionati.
                    </div>
                  )}

                </div>
              ) : (
                /* VISTA KANBAN A COLONNE */
                <div className="space-y-4 pb-12">
                  {activeTask && (
                    <div>
                      {renderFullConsole()}
                    </div>
                  )}
                  <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto crm-horizontal-scrollbar pb-3" style={isNotion ? undefined : { fontFamily: '"Switzer", sans-serif' }}>
                    
                    {/* Colonna 1: In Programma */}
                    <div className={`min-w-[300px] flex-1 shrink-0 ${isNotion ? "bg-[#f1f1ef]/70 p-3 rounded-xl border border-slate-200/80 flex flex-col shadow-2xs" : "bg-white p-4 rounded-2xl border border-sky-200 flex flex-col shadow-xs"}`}>
                      <div className={isNotion ? "flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200" : "flex items-center justify-between pb-2.5 mb-2.5 border-b border-sky-100"}>
                        <div className={isNotion ? "flex items-center gap-1.5 text-[15px] font-bold uppercase tracking-wider text-sky-900" : "flex items-center gap-2 text-[15px] font-black uppercase tracking-wider text-[#0284c7]"}>
                          {isNotion && <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />}
                          <span>In Programma</span>
                        </div>
                        <span className={isNotion ? "text-[15px] bg-white px-2 py-0.5 rounded-md text-slate-600 font-semibold border border-slate-200/80 shadow-2xs" : "text-[15px] bg-sky-100 px-2 py-0.5 rounded-full text-[#0284c7] font-black"}>
                          {upcomingTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2.5 flex-1 overflow-y-auto custom-popup-scrollbar max-h-[600px] pr-1">
                        {upcomingTasks.map(act => (
                          <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onSelectStatus={handleSelectStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onAddChecklist={handleAddChecklistItem} onDeleteChecklist={handleDeleteChecklistItem} onOpenDrafts={() => setMainTab('drafts')} onAssign={handleAssignTask} onUpdateNotes={handleUpdateNotes} onAddAttachment={handleAddAttachment} onDeleteAttachment={handleDeleteAttachment} onUpdateActivity={handleUpdateReminderAndAutomation} userList={userOptions} companies={companies} isKanban isNotion={isNotion} />
                        ))}
                        {upcomingTasks.length === 0 && (
                          <div className="text-center py-8 text-[15px] text-slate-400 font-medium">Nessuna attività in coda</div>
                        )}
                      </div>
                    </div>

                    {/* Colonna 2: To Do (Oggi) */}
                    <div className={`min-w-[300px] flex-1 shrink-0 ${isNotion ? "bg-[#f1f1ef]/70 p-3 rounded-xl border border-slate-200/80 flex flex-col shadow-2xs" : "bg-white p-4 rounded-2xl border-2 border-[#8b5cf6]/50 flex flex-col shadow-xs"}`}>
                      <div className={isNotion ? "flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200" : "flex items-center justify-between pb-2.5 mb-2.5 border-b border-purple-100"}>
                        <div className={isNotion ? "flex items-center gap-1.5 text-[15px] font-bold uppercase tracking-wider text-slate-800" : "flex items-center gap-2 text-[15px] font-black uppercase tracking-wider text-[#8b5cf6]"}>
                          {isNotion && <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />}
                          <span>To Do / Oggi</span>
                        </div>
                        <span className={isNotion ? "text-[15px] bg-white text-slate-600 px-2 py-0.5 rounded-md font-semibold border border-slate-200/80 shadow-2xs" : "text-[15px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full font-black"}>
                          {todayTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2.5 flex-1 overflow-y-auto custom-popup-scrollbar max-h-[600px] pr-1">
                        {todayTasks.map(act => (
                          <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onSelectStatus={handleSelectStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onAddChecklist={handleAddChecklistItem} onDeleteChecklist={handleDeleteChecklistItem} onOpenDrafts={() => setMainTab('drafts')} onAssign={handleAssignTask} onUpdateNotes={handleUpdateNotes} onAddAttachment={handleAddAttachment} onDeleteAttachment={handleDeleteAttachment} onUpdateActivity={handleUpdateReminderAndAutomation} userList={userOptions} companies={companies} isToday isKanban isNotion={isNotion} />
                        ))}
                        {todayTasks.length === 0 && (
                          <div className="text-center py-8 text-[15px] text-slate-400 font-medium">Nessun task urgente per oggi</div>
                        )}
                      </div>
                    </div>

                    {/* Colonna 3: Completate */}
                    <div className={`min-w-[300px] flex-1 shrink-0 ${isNotion ? "bg-[#f1f1ef]/70 p-3 rounded-xl border border-slate-200/80 flex flex-col shadow-2xs" : "bg-white p-4 rounded-2xl border border-sky-200 flex flex-col shadow-xs"}`}>
                      <div className={isNotion ? "flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200" : "flex items-center justify-between pb-2.5 mb-2.5 border-b border-sky-100"}>
                        <div className={isNotion ? "flex items-center gap-1.5 text-[15px] font-bold uppercase tracking-wider text-emerald-900" : "flex items-center gap-2 text-[15px] font-black uppercase tracking-wider text-[#16a34a]"}>
                          {isNotion && <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />}
                          <span>Completate</span>
                        </div>
                        <span className={isNotion ? "text-[15px] bg-white text-slate-600 px-2 py-0.5 rounded-md font-semibold border border-slate-200/80 shadow-2xs" : "text-[15px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black"}>
                          {completedTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2.5 flex-1 overflow-y-auto custom-popup-scrollbar max-h-[600px] pr-1 opacity-80 hover:opacity-100 transition-opacity">
                        {completedTasks.map(act => (
                          <ActivityCard key={act.id} activity={act} onToggle={toggleStatus} onSelectStatus={handleSelectStatus} onDelete={handleDelete} onUpdatePriority={handleUpdatePriority} onToggleChecklist={toggleChecklistItem} onAddChecklist={handleAddChecklistItem} onDeleteChecklist={handleDeleteChecklistItem} onOpenDrafts={() => setMainTab('drafts')} onAssign={handleAssignTask} onUpdateNotes={handleUpdateNotes} onAddAttachment={handleAddAttachment} onDeleteAttachment={handleDeleteAttachment} onUpdateActivity={handleUpdateReminderAndAutomation} userList={userOptions} companies={companies} isKanban isNotion={isNotion} />
                        ))}
                        {completedTasks.length === 0 && (
                          <div className="text-center py-8 text-[15px] text-slate-400 font-medium">Nessuna attività completata</div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </>
          )
        })()}
      </div>
    )}

          {mainTab === 'drafts' && (
            /* ── VISTA BOZZE EMAIL & INVII AUTOMATICI PIPELINE AI ── */
            <div className="space-y-6 pb-12 animate-in fade-in" style={{ fontFamily: '"Switzer", sans-serif' }}>
              
              {/* Box Regole di Invio Automatico & Sicurezza CRM */}
              <div className="bg-white p-4 rounded-2xl border border-sky-200 shadow-xs">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-sky-100">
                  <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                  <h3 className="text-[15px] font-black uppercase tracking-wider text-slate-900">
                    Protocollo di Sicurezza Invio Email & Regole di Automazione
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[15px]">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#16a34a] font-black mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                        1. Conferma Trattative
                      </div>
                      <p className="text-slate-600 text-[15px] leading-relaxed">
                        Invio automatico immediato solo per accordi positivi firmati o declini cortesi.
                      </p>
                    </div>
                    <span className="mt-2 text-[13px] text-[#16a34a] font-extrabold">● INVIO AUTOMATICO ATTIVO</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#0284c7] font-black mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                        2. Conferma Appuntamenti & Call
                      </div>
                      <p className="text-slate-600 text-[15px] leading-relaxed">
                        Verifica in tempo reale dello slot a calendario: se libero invia la conferma, se occupato salva in bozza.
                      </p>
                    </div>
                    <span className="mt-2 text-[13px] text-[#0284c7] font-extrabold">● VERIFICA CALENDARIO ATTIVA</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#a855f7] font-black mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
                        3. Info Servizi & Collabs
                      </div>
                      <p className="text-slate-600 text-[15px] leading-relaxed">
                        Invio automatico di brochure, scheda servizi e listino su richieste di primo contatto o partnership.
                      </p>
                    </div>
                    <span className="mt-2 text-[13px] text-[#a855f7] font-extrabold">● INVIO AUTOMATICO ATTIVO</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-sky-100 flex items-center gap-2 text-[15px] text-amber-800 font-bold">
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
                    <h2 className="text-[15px] font-black uppercase tracking-wider text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-sky-200 flex items-center gap-2 shadow-xs">
                      <span>Bozze Email Pronte per Invio / Revisione</span>
                      <span className="text-[#a855f7] font-black">({draftsData.drafts?.length || 0})</span>
                    </h2>
                  </div>
                </div>

                {(!draftsData.drafts || draftsData.drafts.length === 0) ? (
                  <div className="bg-white p-8 rounded-2xl border border-sky-200 text-center text-slate-500 font-bold text-[15px] shadow-xs">
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
                                <span className="text-[15px] text-slate-500">
                                  &lt;{draft.recipient}&gt;
                                </span>
                              </div>
                              <div className="text-[15px] text-slate-400 mt-0.5">
                                Generata: {new Date(draft.createdAt).toLocaleString('it-IT')}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSendDraft(draft.id)}
                                disabled={isSending}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-[15px] rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
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
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[15px] rounded-xl transition-all cursor-pointer"
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
                                <label className="block text-[15px] font-bold uppercase text-slate-600 mb-1">Oggetto Email</label>
                                <input
                                  type="text"
                                  value={editDraftForm.subject}
                                  onChange={e => setEditDraftForm({ ...editDraftForm, subject: e.target.value })}
                                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-[15px] text-slate-800 rounded-lg font-medium"
                                />
                              </div>
                              <div>
                                <label className="block text-[15px] font-bold uppercase text-slate-600 mb-1">Testo Email</label>
                                <textarea
                                  rows={6}
                                  value={editDraftForm.body}
                                  onChange={e => setEditDraftForm({ ...editDraftForm, body: e.target.value })}
                                  className="w-full bg-white border border-slate-300 p-3 text-[15px] text-slate-800 rounded-lg font-medium"
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditDraft(draft.id)}
                                  className="px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-[15px] rounded-lg cursor-pointer"
                                >
                                  Salva Modifiche
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[14px]">
                              <div>
                                <span className="text-[11px] font-bold uppercase text-slate-500 block">Indirizzo Email:</span>
                                <strong className="text-slate-900 font-extrabold">{draft.recipient}</strong>
                              </div>
                              <div>
                                <span className="text-[11px] font-bold uppercase text-slate-500 block">Referente / Azienda:</span>
                                <strong className="text-slate-900 font-extrabold">{draft.recipientName || draft.company || 'Referente Aziendale'} ({draft.company})</strong>
                              </div>
                              <div className="sm:col-span-2">
                                <span className="text-[11px] font-bold uppercase text-slate-500 block">Richiesta da Oggetto Mail:</span>
                                <strong className="text-[#0284c7] font-extrabold">{draft.subject}</strong>
                              </div>
                              <div className="sm:col-span-2">
                                <span className="text-[11px] font-bold uppercase text-slate-500 block">Dettagli Contratto / Stato Azione:</span>
                                <span className="text-slate-700 font-semibold">{draft.reason || 'In revisione contrattuale'}</span>
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
                    <h2 className="text-[15px] font-black uppercase tracking-wider text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-sky-200 flex items-center gap-2 shadow-xs">
                      <span>Storico Email Inviate</span>
                      <span className="text-[#16a34a] font-black">({draftsData.sentEmails.length})</span>
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {draftsData.sentEmails.map((sent, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-xl border border-sky-200 text-slate-800 text-[15px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                          <span className="font-black text-[#16a34a]">A: {sent.recipient}</span>
                          <span className="text-slate-600 truncate max-w-md">— {sent.subject}</span>
                        </div>
                        <div className="text-[15px] text-slate-400 shrink-0 font-medium">
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
            className="bg-white border border-sky-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800"
            style={{ fontFamily: '"Switzer", sans-serif' }}
          >
            <div className="p-5 border-b border-sky-100 flex items-center justify-between bg-sky-50/50">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                  + Nuova Attività CRM
                </h3>
                <p className="text-[15px] text-slate-500 font-medium">Programma un task, call, shooting o consegna DADO Studio</p>
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
                <label className="block text-[15px] font-black uppercase text-slate-700 mb-1">
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
                  <label className="block text-[15px] font-black uppercase text-slate-700 mb-1">
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
                  <label className="block text-[15px] font-black uppercase text-slate-700 mb-1">
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
                  <label className="block text-[15px] font-black uppercase text-slate-700 mb-1">
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
                  <label className="block text-[15px] font-black uppercase text-slate-700 mb-1">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[15px] font-black uppercase text-slate-700 mb-1 flex items-center gap-1.5">
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
                  <label className="block text-[15px] font-black uppercase text-slate-700 mb-1">
                    Stato Iniziale
                  </label>
                  <select
                    value={formData.status || 'pending'}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#0284c7]"
                  >
                    <option value="pending">🟡 In attesa</option>
                    <option value="in_progress">🔵 In corso</option>
                    <option value="fermo">🔴 Fermo</option>
                    <option value="completed">🟢 Completato</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-black uppercase text-slate-700 mb-1">
                  Note Operative & Attrezzature Coinvolte
                </label>
                <textarea
                  rows={3}
                  placeholder="Es: Verificare carica batterie Sony, ottiche GM e invio liberatorie..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-[15px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] font-medium"
                />
              </div>

              {/* Sezione Allegati al Nuovo Task */}
              <div>
                <label className="block text-[15px] font-black uppercase text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Paperclip size={13} className="text-[#0284c7]" />
                    <span>Allegati File (PDF, Immagini, Documenti)</span>
                  </span>
                  <span className="text-[13px] text-slate-500 font-semibold">
                    {formData.attachments?.length || 0} file selezionati
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    id="modal-add-attachments"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      for (const file of files) {
                        const reader = new FileReader()
                        reader.onload = () => {
                          setFormData(prev => ({
                            ...prev,
                            attachments: [
                              ...(prev.attachments || []),
                              {
                                id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
                                name: file.name,
                                size: file.size,
                                type: file.type || 'application/octet-stream',
                                dataUrl: reader.result,
                                uploadedAt: new Date().toLocaleDateString('it-IT')
                              }
                            ]
                          }))
                        }
                        reader.readAsDataURL(file)
                      }
                      e.target.value = ''
                    }}
                  />
                  <label
                    htmlFor="modal-add-attachments"
                    className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-200 text-[15px] font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <UploadCloud size={14} />
                    <span>Seleziona file da allegare</span>
                  </label>
                </div>
                {formData.attachments?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {formData.attachments.map((att, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-[15px] text-sky-900"
                      >
                        <Paperclip size={12} className="text-[#0284c7]" />
                        <span className="font-bold truncate max-w-[160px]">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            attachments: prev.attachments.filter((_, i) => i !== idx)
                          }))}
                          className="text-slate-400 hover:text-red-500 ml-1 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sezione Checklist del Nuovo Task */}
              <div className="pt-3 border-t border-sky-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[15px] font-black uppercase text-slate-700 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Checklist Operativa</span>
                    {formData.checklist?.length > 0 && (
                      <span className="text-[12px] text-slate-500 font-bold ml-1">
                        ({formData.checklist.length} {formData.checklist.length === 1 ? 'punto' : 'punti'})
                      </span>
                    )}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Es: Verificare documenti, liberatorie..."
                    value={newModalChecklistText}
                    onChange={(e) => setNewModalChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (newModalChecklistText.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            checklist: [...(prev.checklist || []), newModalChecklistText.trim()]
                          }))
                          setNewModalChecklistText('')
                        }
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#0284c7]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newModalChecklistText.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          checklist: [...(prev.checklist || []), newModalChecklistText.trim()]
                        }))
                        setNewModalChecklistText('')
                      }
                    }}
                    disabled={!newModalChecklistText.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:border-slate-500 bg-white hover:bg-slate-50 text-slate-700 text-[13px] font-bold transition-all shadow-2xs group cursor-pointer disabled:opacity-40"
                  >
                    <span className="w-4 h-4 rounded border border-slate-400 group-hover:border-slate-600 flex items-center justify-center font-bold text-[12px] leading-none">+</span>
                    <span>Aggiungi checklist</span>
                  </button>
                </div>

                {formData.checklist?.length > 0 && (
                  <div className="mt-2 space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    {formData.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm text-slate-800 px-2 py-1 bg-white rounded-lg border border-slate-100 shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold truncate">{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            checklist: prev.checklist.filter((_, i) => i !== idx)
                          }))}
                          className="text-slate-400 hover:text-red-500 ml-2 p-0.5 transition-colors cursor-pointer shrink-0"
                          title="Rimuovi voce"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sezione Promemoria ed Automazione Flusso */}
              <div className="pt-3 border-t border-sky-100 space-y-3">
                {/* 1. Box Promemoria */}
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[15px] font-black uppercase text-amber-900 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.reminderEnabled !== false}
                        onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                        className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                      />
                      <span>🔔 Promemoria Scadenza</span>
                    </label>
                    <span className="text-[13px] font-bold text-amber-700 uppercase bg-amber-100/70 px-2 py-0.5 rounded">
                      {formData.reminderEnabled !== false ? 'Attivo' : 'Disattivato'}
                    </span>
                  </div>

                  {formData.reminderEnabled !== false && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[14px] font-bold text-slate-700 mb-1">Preavviso</label>
                        <select
                          value={formData.reminderAdvance}
                          onChange={(e) => setFormData({ ...formData, reminderAdvance: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[15px] text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                        >
                          {ADVANCE_NOTICE_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[14px] font-bold text-slate-700 mb-1">Canale</label>
                        <select
                          value={formData.reminderChannel}
                          onChange={(e) => setFormData({ ...formData, reminderChannel: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[15px] text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                        >
                          <option value="dashboard_toast">Notifica DADO CRM</option>
                          <option value="email">Email automatica</option>
                          <option value="whatsapp">WhatsApp</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Box Automazione Causa ➔ Effetto */}
                <div className="p-3 bg-sky-50/60 border border-sky-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[15px] font-black uppercase text-sky-950 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.automationEnabled !== false}
                        onChange={(e) => setFormData({ ...formData, automationEnabled: e.target.checked })}
                        className="rounded text-[#0284c7] focus:ring-sky-500 w-3.5 h-3.5"
                      />
                      <span>⚡ Automazione (Causa ➔ Effetto)</span>
                    </label>
                    <span className="text-[13px] font-bold text-sky-700 uppercase bg-sky-100/70 px-2 py-0.5 rounded">
                      {formData.automationEnabled !== false ? 'Attiva' : 'Disattivata'}
                    </span>
                  </div>

                  {formData.automationEnabled !== false && (
                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="block text-[14px] font-bold text-slate-700 mb-1">
                          Causa (Trigger di attivazione)
                        </label>
                        <select
                          value={formData.automationCause}
                          onChange={(e) => setFormData({ ...formData, automationCause: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[15px] text-slate-900 font-semibold focus:outline-none focus:border-[#0284c7]"
                        >
                          {AUTOMATION_CAUSES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[14px] font-bold text-slate-700 mb-1">
                          Effetto (Azione conseguente automatica)
                        </label>
                        <select
                          value={formData.automationEffect}
                          onChange={(e) => setFormData({ ...formData, automationEffect: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[15px] text-slate-900 font-semibold focus:outline-none focus:border-[#0284c7]"
                        >
                          {AUTOMATION_EFFECTS.map((eff) => (
                            <option key={eff.id} value={eff.id}>
                              {eff.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[15px] font-extrabold text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-[15px] rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Salvataggio...' : 'Conferma e Salva'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ── POPUP CAMBIO STATO (FERMO / IN CORSO): MOTIVO E NUOVA SCADENZA ── */}
      {statusModal.isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
          onClick={() => !statusModal.submitting && setStatusModal(prev => ({ ...prev, isOpen: false }))}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
            style={{ fontFamily: '"Switzer", sans-serif' }}
          >
            {/* Header */}
            <div
              className={`p-4 border-b flex items-center justify-between ${
                statusModal.targetStatus === 'fermo'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                  : 'bg-sky-50/80 border-sky-200 text-sky-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[15px] font-black shadow-xs shrink-0"
                  style={{ backgroundColor: getTaskStatusInfo(statusModal.targetStatus).color }}
                >
                  {statusModal.targetStatus === 'fermo' ? '🛑' : '🔵'}
                </span>
                <div>
                  <h3 className="font-extrabold text-[16px] leading-tight">
                    {statusModal.targetStatus === 'fermo' ? 'Imposta Stato: FERMO' : 'Imposta Stato: IN CORSO'}
                  </h3>
                  <p className="text-[13px] text-slate-500 font-medium">
                    {statusModal.targetStatus === 'fermo'
                      ? 'Inserisci il motivo del fermo e aggiorna la scadenza'
                      : 'Note operative di avvio e nuova data di scadenza'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Info Task & Azienda */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-[14px]">
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Attività</span>
                  <span className="font-bold text-slate-900 truncate block">{statusModal.task?.title}</span>
                </div>
                {statusModal.task?.company && (
                  <div className="text-right shrink-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Azienda CRM</span>
                    <span className="font-bold text-[#0284c7]">{statusModal.task?.company}</span>
                  </div>
                )}
              </div>

              {/* Suggerimenti rapidi */}
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Suggerimenti rapidi:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(statusModal.targetStatus === 'fermo'
                    ? [
                        'In attesa feedback cliente',
                        'Materiale / asset mancanti',
                        'Preventivo non deliberato',
                        'Ripianificato su richiesta cliente',
                        'Problemi tecnici / attrezzature',
                      ]
                    : [
                        'Lavorazione avviata oggi',
                        'Briefing completato, in produzione',
                        'In fase di shooting / montaggio',
                        'Bozza pronta per prima revisione',
                      ]
                  ).map((sugg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStatusModal(prev => ({ ...prev, reason: sugg }))}
                      className="px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Casella Motivo */}
              <div>
                <label className="block text-[14px] font-bold text-slate-700 mb-1">
                  Motivo o Note operative *
                </label>
                <textarea
                  rows={3}
                  value={statusModal.reason}
                  onChange={(e) => setStatusModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder={
                    statusModal.targetStatus === 'fermo'
                      ? 'Es: Il cliente ha chiesto di posticipare a data da destinarsi per via di approvazione interna...'
                      : 'Es: Iniziata la lavorazione di montaggio dopo ricezione del footage...'
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] font-medium"
                />
                <span className="text-[11px] text-slate-400 font-medium block mt-1">
                  Questo motivo verrà annotato automaticamente nella casella "Note & Allegati" del task e sincronizzato nel riquadro dell'azienda.
                </span>
              </div>

              {/* Nuova data di scadenza */}
              <div>
                <label className="block text-[14px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Eventuale nuova data di scadenza</span>
                  <span className="text-[12px] text-slate-400 font-normal">Opzionale</span>
                </label>
                <input
                  type="date"
                  value={statusModal.newDueDate}
                  onChange={(e) => setStatusModal(prev => ({ ...prev, newDueDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              {/* Anteprima log automatico */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-[12px] text-slate-600">
                <span className="font-bold text-slate-700 block mb-0.5">📋 Registrazione automatica:</span>
                <span>
                  [Stato: {getTaskStatusInfo(statusModal.targetStatus).tag} • {new Date().toLocaleDateString('it-IT')}] Motivo: {statusModal.reason.trim() || '(da compilare)'}{statusModal.newDueDate ? ` | Nuova scadenza: ${statusModal.newDueDate}` : ''}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                disabled={statusModal.submitting}
                className="px-4 py-2 rounded-xl text-[14px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusModal}
                disabled={statusModal.submitting}
                className="px-5 py-2 rounded-xl text-[14px] font-extrabold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: getTaskStatusInfo(statusModal.targetStatus).color }}
              >
                {statusModal.submitting ? 'Salvataggio...' : 'Conferma e Salva'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ── COMPONENTE CARD ATTIVITÀ SINGOLA IN SWITZER E STILE CHIARO DADO ──
function ActivityCard({
  activity,
  onToggle,
  onSelectStatus,
  onDelete,
  onUpdatePriority,
  onToggleChecklist,
  onAddChecklist,
  onDeleteChecklist,
  onOpenDrafts,
  onAssign,
  onUpdateNotes,
  onAddAttachment,
  onDeleteAttachment,
  onUpdateActivity,
  userList = [],
  isToday,
  isKanban,
  companies = [],
  isNotion = false,
}) {
  const [isAddingCardChecklist, setIsAddingCardChecklist] = useState(false)
  const [cardChecklistText, setCardChecklistText] = useState('')

  const isDone = activity.status === 'completed'
  const isTodo = !isDone && (isToday || activity.due === 'today' || activity.period?.toLowerCase() === 'oggi')
  const isPriority = !isDone && (activity.priority === 'high' || activity.priority === 'urgent_3d' || isTodo)
  const cat = CATEGORIES[activity.type] || CATEGORIES.commercial
  const IconComponent = cat.icon

  const isAutoGenerated = activity.source === 'pipeline_llm_automation' || Boolean(activity.checklist?.length) || Boolean(activity.emailStatus)

  // Se siamo in modalità Notion (Port 3000): card bianca pulita senza sfondi gialli/colorati
  if (isNotion) {
    return (
      <div
        className={`rounded-xl transition-all p-3.5 relative group overflow-hidden border ${
          isDone
            ? 'bg-slate-50/70 border-slate-200/80 opacity-75 hover:opacity-100 shadow-2xs'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-xs'
        }`}
      >
        <div className="flex items-start gap-3 relative z-10">
          {/* Checkbox completata Notion */}
          {isDone && (
            <button
              onClick={() => onToggle(activity)}
              className="mt-0.5 shrink-0 text-emerald-600 hover:opacity-75 transition-opacity cursor-pointer"
              title="Segna come da fare (riapri)"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </button>
          )}

          {/* Corpo della Card */}
          <div className="flex-1 min-w-0">
            {/* Riga Proprietà Notion: Categoria, Stato, Auto CRM, Email status, Prioritaria */}
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Categoria Pill Notion */}
                <span
                  className="px-2 py-0.5 rounded-md text-[13px] font-semibold flex items-center gap-1 uppercase tracking-wider"
                  style={{
                    backgroundColor: cat.bg,
                    color: cat.color,
                    border: `1px solid ${cat.border}`,
                  }}
                >
                  <IconComponent className="w-2.5 h-2.5" />
                  <span>{cat.label}</span>
                </span>

                {/* Stato Badge Pill Notion */}
                <span
                  className="px-2 py-0.5 rounded-md text-[12px] font-bold flex items-center gap-1 uppercase tracking-wider text-white shadow-2xs"
                  style={{
                    backgroundColor: getTaskStatusInfo(activity.status).color,
                  }}
                  title={`Stato: ${getTaskStatusInfo(activity.status).label}`}
                >
                  {getTaskStatusInfo(activity.status).tag}
                </span>

                {isAutoGenerated && (
                  <span className="px-1.5 py-0.5 rounded text-[13px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1 uppercase tracking-wider">
                    <Bot className="w-2.5 h-2.5" />
                    Auto CRM
                  </span>
                )}

                {activity.emailStatus === 'auto_sent' && (
                  <span className="px-1.5 py-0.5 rounded text-[13px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1 uppercase tracking-wider">
                    <Send className="w-2.5 h-2.5" />
                    Conferma Inviata
                  </span>
                )}

                {activity.emailStatus === 'draft_saved' && (
                  <button
                    type="button"
                    onClick={() => onOpenDrafts && onOpenDrafts()}
                    className="px-1.5 py-0.5 rounded text-[13px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1 uppercase tracking-wider hover:bg-amber-100 transition-colors cursor-pointer"
                    title="Clicca per aprire la bozza email pronta per l'invio"
                  >
                    <Mail className="w-2.5 h-2.5" />
                    Bozza in attesa
                  </button>
                )}

                {isPriority && (
                  <span className="px-1.5 py-0.5 rounded text-[13px] font-bold bg-slate-900 text-white inline-flex items-center justify-center text-center uppercase tracking-wider">
                    Prioritaria
                  </span>
                )}
              </div>

              {/* Orario / Giorno e 4 Riquadri Priorità in Alto a Destra */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[15px] text-slate-500 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{activity.time || '10:00'}</span>
                  {activity.period && (
                    <span className="px-1 py-0.2 rounded text-[13px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/80">
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
                        className={`px-1 py-0.2 text-[12px] font-bold uppercase rounded transition-all cursor-pointer border ${
                          isSelected
                            ? 'ring-1 ring-slate-600 font-extrabold shadow-2xs'
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
              className={`text-sm font-semibold leading-snug ${
                isDone ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {activity.title}
            </div>

            {/* Azienda / Cliente con Acronimo B.A.N.T. */}
            <div className="flex items-center justify-between gap-1.5 text-[15px] mt-1.5 text-slate-500">
              <div className="truncate text-slate-700 font-semibold">
                {activity.company || 'DADO Studio'}
              </div>
              <BantLogoMark size="sm" bant={getActivityBant(activity, companies)} />
            </div>

            {/* Riquadro Assegnazione task a... Notion property style */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[15px] transition-all w-full sm:w-auto ${
                  activity.assignedTo
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-white border-dashed border-slate-300 text-slate-500 hover:border-slate-400'
                }`}
                title="Assegnazione task a un collaboratore dello studio"
              >
                <div className="flex items-center gap-1 shrink-0">
                  {activity.assignedTo ? (
                    <UserCheck className="w-3 h-3 text-slate-700" />
                  ) : (
                    <UserPlus className="w-3 h-3 text-slate-400" />
                  )}
                  <span className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">
                    {activity.assignedTo ? 'Assegnato:' : 'Assegna:'}
                  </span>
                </div>

                <div className="relative inline-flex items-center flex-1 sm:flex-initial">
                  <select
                    value={activity.assignedTo || ''}
                    onChange={(e) => onAssign && onAssign(activity.id, e.target.value)}
                    className="text-[15px] font-semibold text-slate-800 bg-transparent pl-1 pr-5 py-0.5 rounded cursor-pointer appearance-none focus:outline-none w-full"
                  >
                    <option value="">-- Seleziona --</option>
                    {userList.map(u => (
                      <option key={u.id || u.name} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-0 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Checklist interattiva */}
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[13px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-emerald-600" />
                  <span>Checklist:</span>
                  {Array.isArray(activity.checklist) && activity.checklist.length > 0 && (
                    <span className="text-[11px] text-slate-500 font-bold ml-1">
                      ({activity.checklist.filter(c => c.startsWith('✓ ')).length}/{activity.checklist.length})
                    </span>
                  )}
                </div>
                {!isAddingCardChecklist && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCardChecklist(true)}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-300 hover:border-slate-500 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-all shadow-2xs group cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded border border-slate-400 group-hover:border-slate-600 flex items-center justify-center font-bold text-[11px] leading-none">+</span>
                    <span>Aggiungi checklist</span>
                  </button>
                )}
              </div>

              {Array.isArray(activity.checklist) && activity.checklist.length > 0 && (
                <div className="space-y-1 bg-slate-50/80 p-2 rounded-lg border border-slate-200/80">
                  {activity.checklist.map((item, idx) => {
                    const checked = item.startsWith('✓ ')
                    const text = checked ? item.replace('✓ ', '') : item
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-1.5 text-[14px] text-slate-700 group/chk py-0.5"
                      >
                        <div
                          onClick={() => onToggleChecklist && onToggleChecklist(activity, idx)}
                          className="flex items-start gap-1.5 cursor-pointer hover:text-black transition-colors flex-1 min-w-0"
                        >
                          {checked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 shrink-0 mt-0.5" />
                          )}
                          <span className={`truncate ${checked ? 'line-through text-slate-400 font-normal' : 'font-medium'}`}>
                            {text}
                          </span>
                        </div>
                        {onDeleteChecklist && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteChecklist(activity, idx)
                            }}
                            className="opacity-0 group-hover/chk:opacity-100 text-slate-400 hover:text-red-500 p-0.5 transition-opacity cursor-pointer shrink-0"
                            title="Elimina voce"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {isAddingCardChecklist && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (cardChecklistText.trim()) {
                      onAddChecklist && onAddChecklist(activity, cardChecklistText.trim())
                      setCardChecklistText('')
                      setIsAddingCardChecklist(false)
                    }
                  }}
                  className="flex items-center gap-1.5 mt-2"
                >
                  <input
                    type="text"
                    autoFocus
                    placeholder="Nuova voce checklist..."
                    value={cardChecklistText}
                    onChange={(e) => setCardChecklistText(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-[13px] text-slate-800 focus:outline-none focus:border-[#0284c7] font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!cardChecklistText.trim()}
                    className="px-2.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white text-[12px] font-bold rounded-lg disabled:opacity-40 cursor-pointer"
                  >
                    Aggiungi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCardChecklist(false)
                      setCardChecklistText('')
                    }}
                    className="px-2 py-1 text-slate-400 hover:text-slate-600 text-[12px] font-bold cursor-pointer"
                  >
                    Annulla
                  </button>
                </form>
              )}
            </div>

            {/* ── SEZIONE NOTE & ALLEGATI FILE (POSSIBILITÀ DI ALLEGARE FILE E EDITARE NOTE) ── */}
            <TaskNotesAndAttachments
              activity={activity}
              onUpdateNotes={onUpdateNotes}
              onAddAttachment={onAddAttachment}
              onDeleteAttachment={onDeleteAttachment}
              compact={isKanban}
            />

            {/* ── PROMEMORIA & AUTOMAZIONE (CAUSA ➔ EFFETTO) ── */}
            <TaskReminderAndAutomation
              activity={activity}
              onUpdateActivity={onUpdateActivity}
              compact={isKanban}
              isNotion={isNotion}
            />

          </div>

          {/* Pulsanti Azione Conseguenti Uno Sopra l'Altro: Selettore Stato, Completa, Rimuovi */}
          <div className="flex flex-col items-stretch gap-1.5 self-center shrink-0 min-w-[108px]">
            {/* 1. Selettore rapido 4 stati */}
            <div className="relative w-full">
              <select
                value={activity.status || 'pending'}
                onChange={(e) => onSelectStatus && onSelectStatus(activity, e.target.value)}
                className="w-full py-1 px-1.5 rounded-md font-bold text-[11px] text-white uppercase tracking-wider cursor-pointer shadow-2xs appearance-none text-center focus:outline-none transition-transform active:scale-95"
                style={{
                  backgroundColor: getTaskStatusInfo(activity.status).color,
                }}
                title="Cambia stato del task (In attesa / In corso / Fermo / Completato)"
              >
                <option value="pending" className="text-slate-900 bg-white font-bold">🟡 In attesa</option>
                <option value="in_progress" className="text-slate-900 bg-white font-bold">🔵 In corso</option>
                <option value="fermo" className="text-slate-900 bg-white font-bold">🔴 Fermo</option>
                <option value="completed" className="text-slate-900 bg-white font-bold">🟢 Completato</option>
              </select>
            </div>

            {/* 2. Completa */}
            {!isDone ? (
              <button
                onClick={() => onToggle(activity)}
                className="w-full justify-center px-2.5 py-1 rounded-md border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold uppercase transition-all shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                title="Segna come completata"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Completa</span>
              </button>
            ) : (
              <button
                onClick={() => onToggle(activity)}
                className="w-full justify-center px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[12px] font-bold uppercase transition-all shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                title="Riapri attività"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Riapri</span>
              </button>
            )}

            {/* 3. Rimuovi */}
            <button
              onClick={() => onDelete(activity.id)}
              className="w-full justify-center px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-500 text-[12px] font-semibold uppercase transition-all shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
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

  // Stili grafici dinamici a seconda dello stato:
  // - "completate": riempimento verde + cornice verde smeraldo + scritta trasparente "COMPLETATO"
  // - "fermo": riempimento rosa/rosso chiaro + cornice rosa intensa + scritta trasparente "FERMO"
  // - "in corso": riempimento azzurro chiaro + cornice azzurra + scritta trasparente "IN CORSO"
  // - "to do": cornice viola (#8b5cf6) + riempimento color perla (#faf8f5)
  // - "in programma": cornice azzurra (#0284c7) + riempimento color verde acqua (#e6f8f6)
  const isFermo = activity.status === 'fermo'
  const isInProgress = activity.status === 'in_progress'

  const cardStyle = isDone
    ? {
        borderClass: 'border-2 border-emerald-400 shadow-[0_2px_12px_rgba(16,185,129,0.15)] opacity-90 hover:opacity-100',
        bg: '#d1fae5',
        bgClass: 'bg-emerald-100/75',
      }
    : isFermo
    ? {
        borderClass: 'border-2 border-rose-400 shadow-[0_2px_12px_rgba(244,63,94,0.15)] hover:shadow-[0_4px_18px_rgba(244,63,94,0.25)]',
        bg: '#ffe4e6',
        bgClass: 'bg-rose-100/80',
      }
    : isInProgress
    ? {
        borderClass: 'border-2 border-[#0284c7] shadow-[0_2px_12px_rgba(2,132,199,0.16)] hover:shadow-[0_4px_18px_rgba(2,132,199,0.26)]',
        bg: '#e0f2fe',
        bgClass: 'bg-sky-100/80',
      }
    : isTodo
    ? {
        borderClass: 'border-2 border-[#8b5cf6] shadow-[0_2px_12px_rgba(139,92,246,0.14)] hover:shadow-[0_4px_18px_rgba(139,92,246,0.24)]',
        bg: '#faf8f5',
        bgClass: 'bg-[#faf8f5]',
      }
    : {
        borderClass: 'border-2 border-[#0284c7] shadow-[0_2px_12px_rgba(2,132,199,0.14)] hover:shadow-[0_4px_18px_rgba(2,132,199,0.24)]',
        bg: '#e6f8f6',
        bgClass: 'bg-[#e6f8f6]',
      }

  return (
    <div
      className={`rounded-2xl transition-all p-3.5 relative group overflow-hidden ${cardStyle.borderClass} ${cardStyle.bgClass}`}
      style={{
        backgroundColor: cardStyle.bg,
        fontFamily: '"Switzer", sans-serif',
      }}
    >
      {/* Scritta a tutto riquadro in trasparenza per i task */}
      {isDone && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          <span
            className="font-black uppercase tracking-wider text-[#16a34a]/20 select-none leading-none text-center whitespace-nowrap"
            style={{
              fontSize: '44px',
              fontFamily: '"Switzer", sans-serif',
              letterSpacing: '0.04em',
            }}
          >
            COMPLETATO
          </span>
        </div>
      )}
      {isFermo && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          <span
            className="font-black uppercase tracking-wider text-rose-500/15 select-none leading-none text-center whitespace-nowrap"
            style={{
              fontSize: '48px',
              fontFamily: '"Switzer", sans-serif',
              letterSpacing: '0.04em',
            }}
          >
            FERMO
          </span>
        </div>
      )}
      {isInProgress && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          <span
            className="font-black uppercase tracking-wider text-sky-600/15 select-none leading-none text-center whitespace-nowrap"
            style={{
              fontSize: '44px',
              fontFamily: '"Switzer", sans-serif',
              letterSpacing: '0.04em',
            }}
          >
            IN CORSO
          </span>
        </div>
      )}

      <div className="flex items-start gap-3 relative z-10">
        
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
                className="px-2 py-0.5 rounded-md text-[14px] font-black flex items-center gap-1.5 uppercase tracking-wider"
                style={{
                  backgroundColor: cat.bg,
                  color: cat.color,
                  border: `1px solid ${cat.border}`,
                }}
              >
                <IconComponent className="w-3 h-3" />
                <span>{cat.label}</span>
              </span>

              {/* Stato Badge Pill Classic */}
              <span
                className="px-2 py-0.5 rounded-md text-[13px] font-black flex items-center gap-1 uppercase tracking-wider text-white shadow-2xs"
                style={{
                  backgroundColor: getTaskStatusInfo(activity.status).color,
                }}
                title={`Stato: ${getTaskStatusInfo(activity.status).label}`}
              >
                {getTaskStatusInfo(activity.status).tag}
              </span>

              {isAutoGenerated && (
                <span className="px-2 py-0.5 rounded-md text-[13px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1 uppercase tracking-wider">
                  <Bot className="w-3 h-3" />
                  Auto CRM
                </span>
              )}

              {activity.emailStatus === 'auto_sent' && (
                <span className="px-2 py-0.5 rounded-md text-[13px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1 uppercase tracking-wider">
                  <Send className="w-2.5 h-2.5" />
                  Conferma Inviata
                </span>
              )}

              {activity.emailStatus === 'draft_saved' && (
                <button
                  type="button"
                  onClick={() => onOpenDrafts && onOpenDrafts()}
                  className="px-2 py-0.5 rounded-md text-[13px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1 uppercase tracking-wider hover:bg-amber-100 transition-colors cursor-pointer"
                  title="Clicca per aprire la bozza email pronta per l'invio"
                >
                  <Mail className="w-2.5 h-2.5" />
                  Bozza in attesa
                </button>
              )}

              {isPriority && (
                <span className="px-2 py-0.5 rounded-md text-[13px] font-extrabold bg-amber-500 text-white inline-flex items-center justify-center text-center uppercase tracking-wider">
                  Prioritaria
                </span>
              )}
            </div>

            {/* Orario / Giorno e 4 Riquadri Priorità in Alto a Destra */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[15px] text-slate-500 font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{activity.time || '10:00'}</span>
                {activity.period && (
                  <span className="px-1.5 py-0.5 rounded text-[13px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
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
                      className={`px-1 py-0.5 text-[12px] font-black uppercase rounded-md transition-all cursor-pointer border ${
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
          <div className="flex items-center justify-between gap-1.5 text-[15px] mt-1.5 text-slate-500">
            <div className="truncate text-slate-800 font-extrabold">
              {activity.company || 'DADO Studio'}
            </div>
            <BantLogoMark size="sm" bant={getActivityBant(activity, companies)} />
          </div>

          {/* Riquadro Assegnazione task a... */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <div
              className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-[15px] transition-all w-full sm:w-auto ${
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
                <span className="text-[13px] font-black text-slate-600 uppercase tracking-wider">
                  {activity.assignedTo ? 'Assegnazione task a:' : 'Assegnazione task a...'}
                </span>
              </div>

              <div className="relative inline-flex items-center flex-1 sm:flex-initial">
                <select
                  value={activity.assignedTo || ''}
                  onChange={(e) => onAssign && onAssign(activity.id, e.target.value)}
                  className="text-[15px] font-black text-slate-800 bg-white/95 hover:bg-white pl-2 pr-6 py-1 rounded-lg border border-slate-200 hover:border-sky-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7] cursor-pointer appearance-none transition-colors w-full"
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
                <span className="text-[12px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-200/70 text-sky-800 shrink-0">
                  Assegnato
                </span>
              )}
            </div>
          </div>

          {/* Checklist interattiva */}
          <div className="mt-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[13px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-[#16a34a]" />
                <span>Checklist operativa:</span>
                {Array.isArray(activity.checklist) && activity.checklist.length > 0 && (
                  <span className="text-[11px] text-slate-500 font-bold ml-1">
                    ({activity.checklist.filter(c => c.startsWith('✓ ')).length}/{activity.checklist.length})
                  </span>
                )}
              </div>
              {!isAddingCardChecklist && (
                <button
                  type="button"
                  onClick={() => setIsAddingCardChecklist(true)}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-300 hover:border-slate-500 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-all shadow-2xs group cursor-pointer"
                >
                  <span className="w-3.5 h-3.5 rounded border border-slate-400 group-hover:border-slate-600 flex items-center justify-center font-bold text-[11px] leading-none">+</span>
                  <span>Aggiungi checklist</span>
                </button>
              )}
            </div>

            {Array.isArray(activity.checklist) && activity.checklist.length > 0 && (
              <div className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                {activity.checklist.map((item, idx) => {
                  const checked = item.startsWith('✓ ')
                  const text = checked ? item.replace('✓ ', '') : item
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-1.5 text-[14px] text-slate-700 group/chk py-0.5"
                    >
                      <div
                        onClick={() => onToggleChecklist && onToggleChecklist(activity, idx)}
                        className="flex items-start gap-1.5 cursor-pointer hover:text-black transition-colors flex-1 min-w-0"
                      >
                        {checked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#16a34a] shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <span className={`truncate ${checked ? 'line-through text-slate-400 font-normal' : 'font-semibold'}`}>
                          {text}
                        </span>
                      </div>
                      {onDeleteChecklist && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteChecklist(activity, idx)
                          }}
                          className="opacity-0 group-hover/chk:opacity-100 text-slate-400 hover:text-red-500 p-0.5 transition-opacity cursor-pointer shrink-0"
                          title="Elimina voce"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {isAddingCardChecklist && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (cardChecklistText.trim()) {
                    onAddChecklist && onAddChecklist(activity, cardChecklistText.trim())
                    setCardChecklistText('')
                    setIsAddingCardChecklist(false)
                  }
                }}
                className="flex items-center gap-1.5 mt-2"
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Nuova voce checklist..."
                  value={cardChecklistText}
                  onChange={(e) => setCardChecklistText(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-[13px] text-slate-800 focus:outline-none focus:border-[#0284c7] font-medium"
                />
                <button
                  type="submit"
                  disabled={!cardChecklistText.trim()}
                  className="px-2.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white text-[12px] font-bold rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  Aggiungi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCardChecklist(false)
                    setCardChecklistText('')
                  }}
                  className="px-2 py-1 text-slate-400 hover:text-slate-600 text-[12px] font-bold cursor-pointer"
                >
                  Annulla
                </button>
              </form>
            )}
          </div>

          {/* ── SEZIONE NOTE & ALLEGATI FILE (POSSIBILITÀ DI ALLEGARE FILE E EDITARE NOTE) ── */}
          <TaskNotesAndAttachments
            activity={activity}
            onUpdateNotes={onUpdateNotes}
            onAddAttachment={onAddAttachment}
            onDeleteAttachment={onDeleteAttachment}
            compact={isKanban}
          />

          {/* ── PROMEMORIA & AUTOMAZIONE (CAUSA ➔ EFFETTO) ── */}
          <TaskReminderAndAutomation
            activity={activity}
            onUpdateActivity={onUpdateActivity}
            compact={isKanban}
            isNotion={isNotion}
          />

        </div>

        {/* Pulsanti Azione Conseguenti Uno Sopra l'Altro: Selettore Stato, Completa, Rimuovi */}
        <div className="flex flex-col items-stretch gap-1.5 self-center shrink-0 min-w-[108px]">
          {/* 1. Selettore rapido 4 stati */}
          <div className="relative w-full">
            <select
              value={activity.status || 'pending'}
              onChange={(e) => onSelectStatus && onSelectStatus(activity, e.target.value)}
              className="w-full py-1 px-1.5 rounded-lg font-black text-[11px] text-white uppercase tracking-wider cursor-pointer shadow-xs appearance-none text-center focus:outline-none transition-transform active:scale-95"
              style={{
                backgroundColor: getTaskStatusInfo(activity.status).color,
              }}
              title="Cambia stato del task (In attesa / In corso / Fermo / Completato)"
            >
              <option value="pending" className="text-slate-900 bg-white font-bold">🟡 In attesa</option>
              <option value="in_progress" className="text-slate-900 bg-white font-bold">🔵 In corso</option>
              <option value="fermo" className="text-slate-900 bg-white font-bold">🔴 Fermo</option>
              <option value="completed" className="text-slate-900 bg-white font-bold">🟢 Completato</option>
            </select>
          </div>

          {/* 2. Completa */}
          {!isDone ? (
            <button
              onClick={() => onToggle(activity)}
              className="w-full justify-center px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[12px] font-black uppercase transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
              title="Segna come completata"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>Completa</span>
            </button>
          ) : (
            <button
              onClick={() => onToggle(activity)}
              className="w-full justify-center px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[12px] font-black uppercase transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
              title="Riapri attività"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Riapri</span>
            </button>
          )}

          {/* 3. Rimuovi */}
          <button
            onClick={() => onDelete(activity.id)}
            className="w-full justify-center px-2 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-[12px] font-black uppercase transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
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
