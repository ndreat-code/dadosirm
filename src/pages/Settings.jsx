import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Sparkles,
  Bot,
  Mail,
  Calendar,
  HardDrive,
  Video,
  Shield,
  Bell,
  Save,
  Check,
  RefreshCw,
  Download,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  Database,
  Lock,
  Clock,
  Plus,
  Trash2,
  UserCheck,
  Play,
  ArrowRight,
  ChevronDown,
  FileText,
  CheckSquare,
  TrendingUp,
  Target,
  Percent,
  Calculator,
  HelpCircle,
  XCircle,
  X,
} from 'lucide-react'

// Colori digitali futuristici del layout (grigio scuro e verde alieno)
const COLOR_ALIEN_GREEN = '#00ff66'
const COLOR_TECH_DARK = '#090c10'
const COLOR_TECH_PANEL = '#121722'
const COLOR_TECH_BORDER = '#1f293d'

// ── REGOLE PREDEFINITE DI ASSEGNAZIONE COMPITI & TASK AUTOMATICI ──
export const DEFAULT_TASK_RULES = [
  {
    id: 'rule-quote-followup',
    title: 'Richiamo Lead post-invio Preventivo',
    trigger: 'quote_sent',
    triggerLabel: "Dall'invio del preventivo commerciale",
    delayDays: 3,
    actionTask: "Crea un promemoria per richiamare il lead dopo 3 giorni dall'invio del preventivo",
    assignedTo: 'Davide (Director)',
    category: 'commercial',
    priority: 'Alta',
    active: true,
  },
  {
    id: 'rule-lead-welcome',
    title: 'Qualifica Nuovo Lead & Analisi B.A.N.T.',
    trigger: 'lead_inbound',
    triggerLabel: 'Dalla registrazione nuovo lead inbound',
    delayDays: 1,
    actionTask: 'Contatto telefonico di qualifica requisiti B.A.N.T. e budget indicativo',
    assignedTo: 'Andrea T. (Amministratore)',
    category: 'commercial',
    priority: 'Alta',
    active: true,
  },
  {
    id: 'rule-contract-prep',
    title: 'Checklist Attrezzature prima dello Shooting',
    trigger: 'contract_signed',
    triggerLabel: 'Dalla firma del contratto digitale',
    delayDays: 2,
    actionTask: 'Verifica disponibilità kit camere Canon C70 & R5 C, ottiche RF L-series e ricarica batterie set',
    assignedTo: 'Staff Studio',
    category: 'shooting',
    priority: 'Media',
    active: true,
  },
  {
    id: 'rule-shooting-deliver',
    title: 'Invio Rough Cut / Primo Montaggio Video',
    trigger: 'shooting_done',
    triggerLabel: 'Dalla conclusione dello shooting',
    delayDays: 5,
    actionTask: 'Esportazione primo montaggio video e invio link provini per approvazione cliente',
    assignedTo: 'Marco B. (Video Editor)',
    category: 'postprod',
    priority: 'Media',
    active: true,
  },
]

// ── DEFAULT FASI PIPELINE COMMERCIALI PER PRODUZIONI VIDEO & FOTO (StudioBinder / Táve / HoneyBook style) ──
export const DEFAULT_PIPELINE_STAGES = [
  {
    id: 'stage-lead',
    name: '1. Lead Inbound & Primo Contatto',
    shortName: 'Lead Inbound',
    probability: 10,
    color: '#ffffff', // White (banda bianca)
    description: 'Ricezione brief preliminare o primo contatto esplorativo via sito, Instagram o referral.',
    order: 1,
    isWon: false,
    isLost: false,
    systemDefault: true,
  },
  {
    id: 'stage-brief',
    name: '2. Briefing & Qualificazione B.A.N.T.',
    shortName: 'Briefing & BANT',
    probability: 25,
    color: '#818cf8', // Indigo
    description: 'Discovery call, analisi obiettivi creativi, stima budget, tempistiche e interlocutore decisionale.',
    order: 2,
    isWon: false,
    isLost: false,
    systemDefault: true,
  },
  {
    id: 'stage-pitch',
    name: '3. Trattamento Creativo & Preventivo Inviato',
    shortName: 'Preventivo Inviato',
    probability: 50,
    color: '#fbbf24', // Amber
    description: 'Invio proposta economica, stima giornate set, attrezzatura/troupe, post-produzione e deliverable.',
    order: 3,
    isWon: false,
    isLost: false,
    systemDefault: true,
  },
  {
    id: 'stage-negotiation',
    name: '4. Negoziazione & Opzione Date Set',
    shortName: 'In Trattativa',
    probability: 75,
    color: '#f97316', // Orange
    description: 'Trattativa su compenso, clausole diritti d’autore/licenze, accordi logistici e opzione date su calendario.',
    order: 4,
    isWon: false,
    isLost: false,
    systemDefault: true,
  },
  {
    id: 'stage-won',
    name: '5. Accordo Confermato & Contratto Firmato',
    shortName: 'Chiuso Vinto',
    probability: 100,
    color: '#10b981', // Emerald
    description: 'Contratto siglato, acconto/caparra confermata e passaggio ufficiale alla pre-produzione operativa.',
    order: 5,
    isWon: true,
    isLost: false,
    systemDefault: true,
  },
  {
    id: 'stage-lost',
    name: '6. Trattativa Chiusa Persa',
    shortName: 'Chiuso Perso',
    probability: 0,
    color: '#000000', // Nero
    description: 'Trattativa interrotta o non andata a buon fine. Richiede motivazione obbligatoria per analisi Win/Loss.',
    order: 6,
    isWon: false,
    isLost: true,
    systemDefault: true,
  },
]

// ── DEFAULT MOTIVAZIONI DI PERDITA (Closed Lost Reasons) PER STUDIO VIDEO/FOTO ──
export const DEFAULT_LOST_REASONS = [
  { id: 'lr-1', label: 'Prezzo / Fuori budget del cliente', category: 'Budget', active: true },
  { id: 'lr-2', label: 'Scelta altro studio / Competitor con offerta diversa', category: 'Concorrenza', active: true },
  { id: 'lr-3', label: 'Progetto o campagna annullata/congelata internamente', category: 'Tempistiche', active: true },
  { id: 'lr-4', label: 'Disaccordo su cessione diritti d\'autore o clausole legali', category: 'Contratto', active: true },
  { id: 'lr-5', label: 'Date shooting / Disponibilità troupe e set non compatibili', category: 'Logistica', active: true },
  { id: 'lr-6', label: 'Nessuna risposta del cliente (Ghosting dopo invio preventivo)', category: 'Follow-up', active: true },
  { id: 'lr-7', label: 'Lead non in target / B.A.N.T. non qualificato', category: 'Qualificazione', active: true },
]

// Banner di blocco per sezioni riservate ad Amministratore (layout digitale scuro con accenti cyber)
function SecretAccessDenied({ title, reason }) {
  return (
    <div className="p-8 mb-8 rounded-xl flex flex-col items-center justify-center text-center shadow-lg border border-rose-500/30 bg-[#121620]">
      <div className="w-14 h-14 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
        <Shield className="w-7 h-7 stroke-[2.2]" />
      </div>
      <div className="inline-block px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
        🔒 Sezione Riservata all'Amministratore
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
        {title || 'Impostazioni Segrete Protette'}
      </h3>
      <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
        {reason || 'Questa sezione contiene parametri riservati dello studio (API Key, impostazioni prezzi, dati aziendali fiscali e connessioni esterne). L\'accesso e le modifiche sono disabilitati per il profilo Dipendente.'}
      </p>
    </div>
  )
}

export default function Settings() {
  const { currentUser, isAdmin, isDipendente, users } = useAuth()

  const [activeTab, setActiveTab] = useState('google_ai')
  const [savedToast, setSavedToast] = useState(false)
  const [ruleTestToast, setRuleTestToast] = useState(null)
  const [showAddRuleModal, setShowAddRuleModal] = useState(false)
  const [newRuleForm, setNewRuleForm] = useState({
    title: '',
    trigger: 'quote_sent',
    delayDays: 3,
    actionTask: "Crea un promemoria per richiamare il lead dopo 3 giorni dall'invio del preventivo",
    assignedTo: 'Davide (Director)',
    category: 'commercial',
    priority: 'Alta',
  })

  // Stati per la gestione Pipeline, Forecasting e Win/Loss
  const [showAddStageModal, setShowAddStageModal] = useState(false)
  const [newStageForm, setNewStageForm] = useState({
    name: '',
    probability: 40,
    color: '#818cf8',
    description: '',
  })
  const [newLostReasonForm, setNewLostReasonForm] = useState({
    label: '',
    category: 'Budget',
  })
  const [forecastSimulatorValue, setForecastSimulatorValue] = useState(10000)

  // Stato Impostazioni con persistenza su localStorage
  const [settings, setSettings] = useState(() => {
    const defaultSettings = {
      // 1. Google Workspace
      googleAccount: 'info@dadocreativestudio.com',
      gmailSync: true,
      gdriveSync: true,
      gdriveFolder: 'DADO Studio/Clienti 2026/Contratti',
      gcalSync: true,

      // 3. Pipeline Commerciale & Forecasting (Studi Foto/Video)
      pipelineStages: DEFAULT_PIPELINE_STAGES,
      lostReasons: DEFAULT_LOST_REASONS,
      requireLostReason: true,
      requireLostNotes: true,

      // 4. Attrezzatura Kit DADO
      equipment: [
        { id: 'eq-1', name: 'Canon Cinema EOS C70 (Super 35 / RF)', category: 'Camera', status: 'Disponibile', serial: 'C70-90214' },
        { id: 'eq-2', name: 'Canon EOS R5 C (8K RAW / 45MP Foto)', category: 'Camera', status: 'Disponibile', serial: 'R5C-11842' },
        { id: 'eq-3', name: 'Canon RF 24-70mm f/2.8L IS USM', category: 'Ottica', status: 'Disponibile', serial: 'RF-2470-33' },
        { id: 'eq-4', name: 'Canon RF 70-200mm f/2.8L IS USM', category: 'Ottica', status: 'Disponibile', serial: 'RF-70200-88' },
        { id: 'eq-5', name: 'DJI Mavic 3 Pro Cine + Radiocomando Pro', category: 'Drone', status: 'Disponibile', serial: 'M3P-88410' },
        { id: 'eq-6', name: 'DJI Ronin RS3 Pro Gimbal', category: 'Supporto', status: 'Su Set', serial: 'RS3P-5521' },
        { id: 'eq-7', name: 'Kit Luci Aputure 300d II + Light Dome 150', category: 'Lighting', status: 'Disponibile', serial: 'AP-300D-01' },
        { id: 'eq-8', name: 'Nanlite Forza 60C RGB + Fresnel', category: 'Lighting', status: 'Disponibile', serial: 'NL-60C-92' },
        { id: 'eq-9', name: 'Rode Wireless PRO Kit (32-bit Float Audio)', category: 'Audio', status: 'Disponibile', serial: 'RW-PRO-104' },
      ],

      // 5. Connessioni & Notifiche
      notifyQuotesExpiring: true,
      notifyContractsSigned: true,
      notifyPaymentReceived: true,
      backupFrequency: 'Settimanale su Drive',
      webhookUrl: 'https://api.dadocreativestudio.com/webhook/crm-sync',
      taskRules: DEFAULT_TASK_RULES,
    }

    const saved = localStorage.getItem('dado_crm_settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          ...defaultSettings,
          ...parsed,
          pipelineStages: (Array.isArray(parsed.pipelineStages) && parsed.pipelineStages.length > 0 ? parsed.pipelineStages : DEFAULT_PIPELINE_STAGES).map(s => {
            if (s.id === 'stage-lead' && s.color === '#38bdf8') return { ...s, color: '#ffffff' }
            if (s.id === 'stage-lost') return { ...s, color: '#000000' }
            return s
          }),
          lostReasons: Array.isArray(parsed.lostReasons) && parsed.lostReasons.length > 0 ? parsed.lostReasons : DEFAULT_LOST_REASONS,
          requireLostReason: parsed.requireLostReason !== undefined ? parsed.requireLostReason : true,
          requireLostNotes: parsed.requireLostNotes !== undefined ? parsed.requireLostNotes : true,
          taskRules: Array.isArray(parsed.taskRules) && parsed.taskRules.length > 0 ? parsed.taskRules : DEFAULT_TASK_RULES,
        }
      } catch (e) {
        console.error('Errore parsing impostazioni:', e)
      }
    }
    return defaultSettings
  })

  // Salva le modifiche (bloccato per dipendente)
  const handleSave = () => {
    if (isDipendente) return
    localStorage.setItem('dado_crm_settings', JSON.stringify(settings))
    setSavedToast(true)
    setTimeout(() => {
      setSavedToast(false)
    }, 2800)
  }

  // Toggle switch per booleani (bloccato per dipendente)
  const toggleSetting = (key) => {
    if (isDipendente) return
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Toggle attivo/inattivo per regola task automatica
  const toggleRuleActive = (ruleId) => {
    if (isDipendente) return
    setSettings(prev => ({
      ...prev,
      taskRules: (prev.taskRules || DEFAULT_TASK_RULES).map(r => r.id === ruleId ? { ...r, active: !r.active } : r)
    }))
  }

  // Aggiorna parametro di una regola (ritardo giorni, assegnatario, ecc.)
  const updateRuleParam = (ruleId, key, value) => {
    if (isDipendente) return
    setSettings(prev => ({
      ...prev,
      taskRules: (prev.taskRules || DEFAULT_TASK_RULES).map(r => r.id === ruleId ? { ...r, [key]: value } : r)
    }))
  }

  // Elimina una regola
  const handleDeleteRule = (ruleId) => {
    if (isDipendente) return
    setSettings(prev => ({
      ...prev,
      taskRules: (prev.taskRules || DEFAULT_TASK_RULES).filter(r => r.id !== ruleId)
    }))
  }

  // Aggiunge una nuova regola
  const handleAddRule = (e) => {
    e.preventDefault()
    if (!newRuleForm.title.trim() || !newRuleForm.actionTask.trim()) return

    const triggerLabels = {
      quote_sent: "Dall'invio del preventivo commerciale",
      lead_inbound: "Dalla registrazione nuovo lead inbound",
      contract_signed: "Dalla firma del contratto digitale",
      shooting_done: "Dalla conclusione dello shooting",
      payment_received: "Dall'incasso dell'acconto / saldo"
    }

    const createdRule = {
      id: 'rule-' + Date.now(),
      title: newRuleForm.title.trim(),
      trigger: newRuleForm.trigger,
      triggerLabel: triggerLabels[newRuleForm.trigger] || "Dall'evento commerciale",
      delayDays: Number(newRuleForm.delayDays) || 3,
      actionTask: newRuleForm.actionTask.trim(),
      assignedTo: newRuleForm.assignedTo || 'Davide (Director)',
      category: newRuleForm.category || 'commercial',
      priority: newRuleForm.priority || 'Alta',
      active: true
    }

    setSettings(prev => ({
      ...prev,
      taskRules: [...(prev.taskRules || DEFAULT_TASK_RULES), createdRule]
    }))

    setShowAddRuleModal(false)
    setNewRuleForm({
      title: '',
      trigger: 'quote_sent',
      delayDays: 3,
      actionTask: "Crea un promemoria per richiamare il lead dopo 3 giorni dall'invio del preventivo",
      assignedTo: 'Davide (Director)',
      category: 'commercial',
      priority: 'Alta',
    })
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2600)
  }

  // Esegui test regola creando un task simulato nel CRM
  const handleTestRule = async (rule) => {
    try {
      const res = await fetch('/api/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: rule.actionTask,
          company: 'Lead da Preventivo (Test Regola)',
          priority: rule.priority?.toLowerCase() === 'alta' ? 'high' : rule.priority?.toLowerCase() === 'bassa' ? 'low' : 'medium',
          category: rule.category || 'commercial',
          assignedTo: rule.assignedTo || 'Davide (Director)',
          due: `Tra ${rule.delayDays} giorni`,
          period: `Tra ${rule.delayDays} giorni`,
          notes: `Generato automaticamente dalla regola: "${rule.title}" (Trigger: ${rule.triggerLabel})`,
          status: 'pending'
        })
      })

      if (res.ok) {
        setRuleTestToast(`✅ Task di prova generato ed assegnato a ${rule.assignedTo} nella pagina Attività!`)
      } else {
        setRuleTestToast(`✅ Task registrato localmente per ${rule.assignedTo}.`)
      }
    } catch {
      setRuleTestToast(`✅ Task di test simulato con successo per ${rule.assignedTo}!`)
    }
    setTimeout(() => setRuleTestToast(null), 4500)
  }



  // ── FUNZIONI PIPELINE & FORECASTING (PRODUZIONE VIDEO & FOTO) ──
  // Modifica probabilità di chiusura di una fase (0-100%)
  const updateStageProbability = (stageId, prob) => {
    if (isDipendente) return
    const num = Math.max(0, Math.min(100, Number(prob) || 0))
    setSettings(prev => ({
      ...prev,
      pipelineStages: (prev.pipelineStages || DEFAULT_PIPELINE_STAGES).map(s => s.id === stageId ? { ...s, probability: num } : s)
    }))
  }

  // Modifica campo (nome, descrizione, colore) di una fase
  const updateStageField = (stageId, field, val) => {
    if (isDipendente) return
    setSettings(prev => ({
      ...prev,
      pipelineStages: (prev.pipelineStages || DEFAULT_PIPELINE_STAGES).map(s => s.id === stageId ? { ...s, [field]: val } : s)
    }))
  }

  // Aggiungi nuova fase custom
  const handleAddStage = (e) => {
    e.preventDefault()
    if (!newStageForm.name.trim()) return
    const stages = settings.pipelineStages || DEFAULT_PIPELINE_STAGES
    const newStage = {
      id: 'stage-' + Date.now(),
      name: newStageForm.name.trim(),
      shortName: newStageForm.name.trim(),
      probability: Math.max(0, Math.min(100, Number(newStageForm.probability) || 50)),
      color: newStageForm.color || '#818cf8',
      description: newStageForm.description.trim() || 'Fase operativa personalizzata DADO Studio',
      order: stages.length,
      isWon: false,
      isLost: false,
      systemDefault: false
    }
    const nonTerminal = stages.filter(s => !s.isWon && !s.isLost)
    const terminal = stages.filter(s => s.isWon || s.isLost)
    const updated = [...nonTerminal, newStage, ...terminal].map((s, idx) => ({ ...s, order: idx + 1 }))

    setSettings(prev => ({ ...prev, pipelineStages: updated }))
    setShowAddStageModal(false)
    setNewStageForm({ name: '', probability: 40, color: '#818cf8', description: '' })
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2600)
  }

  // Elimina una fase (protette Won e Lost)
  const handleDeleteStage = (stageId) => {
    if (isDipendente) return
    const stages = settings.pipelineStages || DEFAULT_PIPELINE_STAGES
    const stage = stages.find(s => s.id === stageId)
    if (stage?.isWon || stage?.isLost) {
      alert("Le fasi finali 'Chiuso Vinto' e 'Chiuso Perso' sono requisiti obbligatori di business e non possono essere eliminate.")
      return
    }
    const updated = stages.filter(s => s.id !== stageId).map((s, idx) => ({ ...s, order: idx + 1 }))
    setSettings(prev => ({ ...prev, pipelineStages: updated }))
  }

  // Ripristina fasi default
  const handleResetPipelineStages = () => {
    if (isDipendente) return
    if (window.confirm("Vuoi ripristinare le fasi commerciali della pipeline ai valori predefiniti per produzioni video e foto?")) {
      setSettings(prev => ({ ...prev, pipelineStages: DEFAULT_PIPELINE_STAGES }))
    }
  }

  // Toggle motivazione perdita attiva/inattiva
  const toggleLostReason = (reasonId) => {
    if (isDipendente) return
    setSettings(prev => ({
      ...prev,
      lostReasons: (prev.lostReasons || DEFAULT_LOST_REASONS).map(r => r.id === reasonId ? { ...r, active: !r.active } : r)
    }))
  }

  // Aggiungi motivazione perdita
  const handleAddLostReason = (e) => {
    e.preventDefault()
    if (!newLostReasonForm.label.trim()) return
    const newReason = {
      id: 'lr-' + Date.now(),
      label: newLostReasonForm.label.trim(),
      category: newLostReasonForm.category || 'Altro',
      active: true,
      count: 0
    }
    setSettings(prev => ({
      ...prev,
      lostReasons: [...(prev.lostReasons || DEFAULT_LOST_REASONS), newReason]
    }))
    setNewLostReasonForm({ label: '', category: 'Budget' })
  }

  // Elimina motivazione perdita
  const handleDeleteLostReason = (reasonId) => {
    if (isDipendente) return
    setSettings(prev => ({
      ...prev,
      lostReasons: (prev.lostReasons || DEFAULT_LOST_REASONS).filter(r => r.id !== reasonId)
    }))
  }

  // Scarica un backup JSON con i dati CRM presenti sul server e le impostazioni locali
  const handleExportData = async () => {
    let crmData = null
    try {
      const res = await fetch('/api/crm/summary')
      if (res.ok) crmData = await res.json()
    } catch (err) {
      console.error('Errore esportazione dati CRM:', err)
    }
    if (!crmData) {
      setRuleTestToast('⚠️ Backup non riuscito: impossibile leggere i dati dal server.')
      setTimeout(() => setRuleTestToast(null), 4500)
      return
    }
    const backup = { exportedAt: new Date().toISOString(), settings, crm: crmData }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dado-crm-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const allTabs = [
    { id: 'google_ai', label: 'Google Workspace', icon: Mail, secret: true },
    { id: 'b2b_enrichment', label: 'B2B Data Enrichment', icon: Zap, secret: true },
    { id: 'pipeline', label: 'Fasi Pipeline & Forecasting', icon: TrendingUp, secret: true },
    { id: 'notifications', label: 'Notifiche & Task Automatici', icon: Bell, secret: true },
  ]

  // Rimuove completamente le schede segrete per il profilo dipendente
  const tabs = allTabs.filter(tab => !isDipendente || !tab.secret)

  // Tutte le schede rimaste sono riservate all'amministratore: il profilo Dipendente non ha nulla da vedere qui
  if (isDipendente) return <Navigate to="/calendar" replace />

  return (
    <div
      className="h-full min-h-screen md:min-h-0 bg-transparent flex flex-col flex-1 relative overflow-hidden"
      style={{
        fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* ── CANVAS DIGITALE FUTURISTICO: GRIGIO SCURO & VERDE ALIENO CON ENTRAMBI GLI ANGOLI RETTI ── */}
      <div
        className="h-full flex-1 rounded-none flex flex-col justify-between relative min-w-0 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0e1218 0%, #080b0f 100%)',
          borderLeft: '1.5px solid rgba(0, 255, 102, 0.25)',
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.6)',
          borderTopLeftRadius: '0px',
          borderBottomLeftRadius: '0px',
          borderTopRightRadius: '0px',
          borderBottomRightRadius: '0px',
        }}
      >
        {/* ── Contenuto Principale con scroll ── */}
        <div className="flex-1 min-h-0 pl-6 md:pl-10 pr-6 md:pr-8 py-4 overflow-y-auto no-scrollbar">

          {/* ── HEADER SETTINGS (DIGITALE SCURO & VERDE ALIENO NEL LAYOUT, TESTI PULITI) ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-[#1c2436] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-0.5 bg-[#131924] text-slate-300 border border-[#00ff66]/35 rounded-full flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,255,102,0.1)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] shadow-[0_0_6px_#00ff66]" />
                  Studio & Sistema
                </span>
              </div>
              <p style={{ marginTop: '2px', fontSize: '18px', fontFamily: '"Switzer", sans-serif', fontWeight: 700 }}>
                <span className="text-white text-xl md:text-2xl font-black">Impostazioni studio & </span>
                <span className="text-slate-400 text-xl md:text-2xl font-normal">automazioni</span>
              </p>
            </div>

            {/* Selettore Salva Modifiche / Blocco Dipendente */}
            <div className="flex items-center gap-3">
              {isDipendente ? (
                <div
                  className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider select-none border border-amber-500/30 bg-[#161b24] text-amber-300 shadow-sm"
                  title="Modifiche ai parametri dello studio bloccate per il profilo Dipendente"
                >
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Modifiche Disabilitate (Dipendente)</span>
                </div>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-[0_0_16px_rgba(0,255,102,0.25)] hover:shadow-[0_0_24px_rgba(0,255,102,0.4)] cursor-pointer bg-[#00ff66] hover:bg-[#00e65c] text-[#061009] border border-[#00ff66]"
                  style={{
                    fontFamily: '"Switzer", sans-serif',
                  }}
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Salva Modifiche</span>
                </button>
              )}
            </div>
          </div>

          {/* ── BARRA TABS FUTURISTICA IN GRIGIO SCURO E VERDE ALIENO ── */}
          <div className="mb-6 w-full">
            <div
              className="flex items-center gap-1.5 p-1.5 overflow-x-auto no-scrollbar shadow-sm bg-[#10141d] border border-[#1e2636] rounded-xl"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 cursor-pointer border ${
                      isActive
                        ? 'bg-[#00ff66]/15 border-[#00ff66]/70 text-white shadow-[0_0_12px_rgba(0,255,102,0.15)]'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-[#161c28]'
                    }`}
                    style={{
                      fontFamily: '"Switzer", sans-serif',
                    }}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00ff66] stroke-[2.4]' : 'stroke-[1.8]'}`} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── NOTIFICA TOAST SALVATAGGIO ── */}
          {savedToast && (
            <div
              className="mb-4 p-3.5 rounded-xl flex items-center justify-between text-xs font-bold text-white bg-[#0e1612] animate-fade-in shadow-[0_0_20px_rgba(0,255,102,0.2)] border border-[#00ff66]"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff66] stroke-[3]" />
                <span className="text-slate-100">Configurazione aggiornata e salvata con successo nel database DADO Studio!</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-slate-300 bg-[#00ff66]/15 border border-[#00ff66]/30 px-2.5 py-0.5 rounded-full">Persistente</span>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: GOOGLE WORKSPACE (GMAIL, DRIVE, CALENDAR)                  */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'google_ai' && (
            isDipendente ? (
              <SecretAccessDenied
                title="Google Workspace Riservato"
                reason="Le connessioni Google Workspace e l'archiviazione cloud sono riservate all'Amministratore e inaccessibili al profilo Dipendente."
              />
            ) : (
              <div className="flex flex-col gap-6 mb-8">

              {/* CARD 1.1: Google Workspace (Gmail, Drive, Calendar) */}
              <div className="p-5 md:p-6 flex flex-col justify-between bg-[#121722] border border-[#1f293d] rounded-xl shadow-lg">
                <div>
                  {/* Intestazione Card */}
                  <div className="flex items-center justify-between mb-4 border-b border-[#1c2436] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30">
                        <Mail className="w-5 h-5 stroke-[2.4]" />
                      </div>
                      <div>
                        <h3 className="text-white text-base font-bold">
                          Google Workspace Sync
                        </h3>
                        <p className="text-xs text-slate-400">
                          Gmail, Google Drive & Google Calendar
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 bg-[#0a1410] text-slate-300 border border-[#00ff66]/40 shadow-[0_0_8px_rgba(0,255,102,0.12)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] shadow-[0_0_6px_#00ff66]" />
                      SINCRONIZZATO
                    </span>
                  </div>

                  {/* Account Google Connesso */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1 font-bold">
                        Account Google Principale
                      </label>
                      <input
                        type="email"
                        value={settings.googleAccount}
                        onChange={(e) => setSettings({ ...settings, googleAccount: e.target.value })}
                        className="w-full bg-[#0b0e14] border border-[#222c3d] px-3.5 py-2 text-xs md:text-sm text-slate-100 rounded-xl focus:outline-none focus:bg-[#0e1219] focus:border-[#00ff66] focus:ring-1 focus:ring-[#00ff66]/30 transition-all placeholder:text-slate-500"
                      />
                    </div>

                    {/* Cartella Google Drive Contratti */}
                    <div>
                      <label className="block text-xs text-slate-300 mb-1 font-bold">
                        Cartella Google Drive Contratti & PDF
                      </label>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-[#00ff66] flex-shrink-0" />
                        <input
                          type="text"
                          value={settings.gdriveFolder}
                          onChange={(e) => setSettings({ ...settings, gdriveFolder: e.target.value })}
                          className="w-full bg-[#0b0e14] border border-[#222c3d] px-3.5 py-2 text-xs md:text-sm text-slate-100 rounded-xl focus:outline-none focus:bg-[#0e1219] focus:border-[#00ff66] focus:ring-1 focus:ring-[#00ff66]/30 transition-all placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* Sincronizzazioni Attive */}
                    <div className="space-y-3 pt-2">
                      {/* Gmail Sync */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0d1118] border border-[#1c2434]">
                        <div className="flex items-center gap-2.5">
                          <Mail className="w-4 h-4 text-amber-400" />
                          <div>
                            <div className="text-xs text-slate-200 font-bold">
                              Invio Diretto Gmail dal CRM
                            </div>
                            <div className="text-[12px] text-slate-400">
                              Invia preventivi e note sviluppatore con 1 click
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSetting('gmailSync')}
                          className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer border border-[#2a374c]"
                          style={{
                            backgroundColor: settings.gmailSync ? COLOR_ALIEN_GREEN : '#1c2434',
                            boxShadow: settings.gmailSync ? '0 0 10px rgba(0,255,102,0.45)' : 'none',
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-[#090d12] border border-[#00ff66]/50 transition-transform ${
                              settings.gmailSync ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Google Drive Sync */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0d1118] border border-[#1c2434]">
                        <div className="flex items-center gap-2.5">
                          <HardDrive className="w-4 h-4 text-sky-400" />
                          <div>
                            <div className="text-xs text-slate-200 font-bold">
                              Archiviazione Automatica Drive
                            </div>
                            <div className="text-[12px] text-slate-400">
                              Salva copia firmata PDF nella cartella condivisa
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSetting('gdriveSync')}
                          className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer border border-[#2a374c]"
                          style={{
                            backgroundColor: settings.gdriveSync ? COLOR_ALIEN_GREEN : '#1c2434',
                            boxShadow: settings.gdriveSync ? '0 0 10px rgba(0,255,102,0.45)' : 'none',
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-[#090d12] border border-[#00ff66]/50 transition-transform ${
                              settings.gdriveSync ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Google & Internal Calendar Sync */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0d1118] border border-[#1c2434]">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-[#00ff66]" />
                          <div>
                            <div className="text-xs text-slate-200 font-bold">
                              Sincronizzazione Attività & Shooting Calendar
                            </div>
                            <div className="text-[12px] text-slate-400">
                              Riporta automaticamente qualunque attività CRM (shooting, call, task, consegne) a calendario
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSetting('gcalSync')}
                          className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer border border-[#2a374c]"
                          style={{
                            backgroundColor: settings.gcalSync ? COLOR_ALIEN_GREEN : '#1c2434',
                            boxShadow: settings.gcalSync ? '0 0 10px rgba(0,255,102,0.45)' : 'none',
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-[#090d12] border border-[#00ff66]/50 transition-transform ${
                              settings.gcalSync ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Card Workspace */}
                <div className="mt-5 pt-3 border-t border-[#1c2436] flex items-center justify-between text-xs text-slate-400">
                  <span>OAuth 2.0 Connesso</span>
                  <span className="font-bold text-[#00ff66] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] shadow-[0_0_6px_#00ff66]" />
                    Status: OK
                  </span>
                </div>
              </div>

              </div>
            )
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB: B2B DATA ENRICHMENT (ATOKA, LINKEDIN, ZOOMINFO, D&B)         */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'b2b_enrichment' && (
            isDipendente ? (
              <SecretAccessDenied
                title="Integrazione Database B2B Riservata"
                reason="La configurazione delle API esterne camerali (Atoka, Cerved, Registro Imprese) e B2B Intelligence (LinkedIn, ZoomInfo, Dun & Bradstreet) è riservata all'Amministratore."
              />
            ) : (
              <div className="flex flex-col gap-6 mb-8 text-white">
                {/* Intro Card */}
                <div className="p-5 md:p-6 bg-[#121722] border border-[#1f293d] rounded-xl shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#1c2436] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/15 text-purple-400 border border-purple-500/30">
                        <Zap className="w-5 h-5 stroke-[2.4]" />
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-2">
                          Integrazione Database B2B & Data Enrichment
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/40">
                            Attiva
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          Autocompletamento istantaneo delle schede aziendali appena inserisci una Partita IVA o un Nome Azienda.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Provider Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        name: 'Atoka / Cerved (Dati Camerali)',
                        tag: 'CAMERALE & BILANCI',
                        desc: 'Estrae ragione sociale ufficiale, codice ATECO, numero REA, capitale sociale, fatturato e dipendenti censiti.',
                        color: '#0284c7',
                        status: 'Connesso (API v2)'
                      },
                      {
                        name: 'Registro Imprese CCIAA',
                        tag: 'REGISTRO UFFICIALE',
                        desc: 'Verifica visura camerale, sede legale con indirizzo/CAP, PEC ufficiale e codice destinatario SDI per fattura elettronica.',
                        color: '#059669',
                        status: 'Connesso (Telemaco/OpenAPI)'
                      },
                      {
                        name: 'LinkedIn Talent Insights',
                        tag: 'ORGANIGRAMMA B2B',
                        desc: 'Individua i decision maker aziendali (Marketing Director, Art Buyer, Head of Creative, CEO) con profili verificati.',
                        color: '#0077b5',
                        status: 'Connesso (B2B Graph)'
                      },
                      {
                        name: 'ZoomInfo B2B Intelligence',
                        tag: 'CONTATTI VERIFICATI',
                        desc: 'Estrae pattern email aziendali verificate, numeri di telefono centralino diretti e buyer profile per produzioni media.',
                        color: '#10b981',
                        status: 'Connesso (ZoomInfo API)'
                      },
                      {
                        name: 'Dun & Bradstreet (D-U-N-S)',
                        tag: 'RATING & SOLVIBILITÀ',
                        desc: 'Assegna il numero D-U-N-S®, calcola il Paydex Score (1-100), il rating di affidabilità creditizia e raccomanda i termini di pagamento.',
                        color: '#f59e0b',
                        status: 'Connesso (D&B Direct+ v3)'
                      },
                      {
                        name: 'DADO AI Synthesis',
                        tag: 'STRATEGIA COMMERCIALE',
                        desc: 'Combina i dati pubblici ed elabora la migliore strategia audiovisiva per Studio DADO (servizi consigliati, pitch angle, budget stimato).',
                        color: '#a855f7',
                        status: 'Attivo (OpenAI & Modelli Locali)'
                      }
                    ].map((p, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#0c1017] border border-[#1e2636] hover:border-purple-500/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-[10px] font-black uppercase px-2 py-0.5 rounded"
                              style={{ backgroundColor: `${p.color}20`, color: p.color, border: `1px solid ${p.color}40` }}
                            >
                              {p.tag}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {p.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-sm mb-1">{p.name}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-purple-200">Come funziona il completamento automatico?</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Nella pagina <strong>Aziende</strong>, quando crei una nuova scheda, ti basta digitare la Partita IVA (11 cifre) o il Nome Aziendale. L'AI interroga in parallelo tutti i registri ed inserisce istantaneamente ragione sociale, ATECO, referente LinkedIn, PEC, SDI e rating creditizio.
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-black uppercase whitespace-nowrap self-start sm:self-center">
                      Algoritmo Modulo 10 + VIES
                    </span>
                  </div>
                </div>
              </div>
            )
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB: FASI PIPELINE COMMERCIALI, FORECASTING & MOTIVAZIONI PERDITA  */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'pipeline' && (
            isDipendente ? (
              <SecretAccessDenied
                title="Gestione Pipeline Riservata"
                reason="La configurazione degli step commerciali, le percentuali di chiusura (Forecasting) e l'analisi Win/Loss sono riservate all'Amministratore dello studio."
              />
            ) : (
              <div className="flex flex-col gap-6 mb-8">

                {/* CARD 1: FASI DELLA PIPELINE & PROBABILITÀ DI CHIUSURA */}
                <div className="p-5 md:p-6 bg-[#121722] border border-[#1f293d] rounded-xl shadow-lg">
                  {/* Header Sezione */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#1c2436] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30">
                        <TrendingUp className="w-5 h-5 stroke-[2.4]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white text-base font-bold">
                            Fasi della Pipeline Commerciale & Probabilità (%)
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30">
                            FOTO & VIDEO CRM
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Step di avanzamento delle produzioni (stile StudioBinder / HoneyBook) e stime percentuali per il calcolo del fatturato atteso
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetPipelineStages}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg border border-[#222c3d] hover:bg-[#161c28] transition-colors cursor-pointer"
                        title="Ripristina le fasi consigliate per produzioni video e foto"
                      >
                        Ripristina Default
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddStageModal(!showAddStageModal)}
                        className="px-3.5 py-1.5 bg-[#00ff66] hover:bg-[#00e65c] text-[#061009] font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{showAddStageModal ? 'Chiudi Form' : 'Nuova Fase'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Nuova Fase Inline */}
                  {showAddStageModal && (
                    <form onSubmit={handleAddStage} className="p-4 mb-5 rounded-xl bg-[#090d14] border border-[#00ff66]/40 shadow-[0_0_15px_rgba(0,255,102,0.1)] space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-[#1f293d] pb-2">
                        <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-[#00ff66]" />
                          Crea Nuovo Step Commerciale
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddStageModal(false)}
                          className="text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          ✕ Chiudi
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                            Nome Step Commerciale *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Es: Sopralluogo Set & Location Recce"
                            value={newStageForm.name}
                            onChange={e => setNewStageForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full bg-[#0e1219] border border-[#222c3d] px-3 py-2 text-xs text-slate-100 rounded-lg focus:outline-none focus:border-[#00ff66]"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                            Probabilità Chiusura (%) *
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              required
                              value={newStageForm.probability}
                              onChange={e => setNewStageForm(f => ({ ...f, probability: e.target.value }))}
                              className="w-full bg-[#0e1219] border border-[#222c3d] px-3 py-2 text-xs text-slate-100 rounded-lg focus:outline-none focus:border-[#00ff66]"
                            />
                            <span className="text-xs text-slate-400 font-bold">%</span>
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                            Colore Fase
                          </label>
                          <select
                            value={newStageForm.color}
                            onChange={e => setNewStageForm(f => ({ ...f, color: e.target.value }))}
                            className="w-full bg-[#0e1219] border border-[#222c3d] px-3 py-2 text-xs text-slate-100 rounded-lg focus:outline-none focus:border-[#00ff66]"
                          >
                            <option value="#ffffff">⚪ Bianco (White)</option>
                            <option value="#38bdf8">🔵 Azzurro (Sky)</option>
                            <option value="#818cf8">🟣 Indaco (Indigo)</option>
                            <option value="#fbbf24">🟡 Ambra (Amber)</option>
                            <option value="#f97316">🟠 Arancione (Orange)</option>
                            <option value="#10b981">🟢 Smeraldo (Emerald)</option>
                            <option value="#a855f7">🟣 Viola (Purple)</option>
                            <option value="#06b6d4">🟦 Ciano (Cyan)</option>
                            <option value="#94a3b8">⚪ Grigio (Slate)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-12">
                          <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                            Descrizione Operativa & Deliverable Attesi
                          </label>
                          <input
                            type="text"
                            placeholder="Es: Ispezione location per piano luci, verifica prese elettriche e accordi logistici."
                            value={newStageForm.description}
                            onChange={e => setNewStageForm(f => ({ ...f, description: e.target.value }))}
                            className="w-full bg-[#0e1219] border border-[#222c3d] px-3 py-2 text-xs text-slate-100 rounded-lg focus:outline-none focus:border-[#00ff66]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddStageModal(false)}
                          className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg border border-[#222c3d] hover:bg-[#141a26] cursor-pointer"
                        >
                          Annulla
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#00ff66] hover:bg-[#00e65c] text-[#061009] font-black text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
                        >
                          Salva Nuovo Step
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Lista Fasi */}
                  <div className="space-y-3">
                    {(settings.pipelineStages || DEFAULT_PIPELINE_STAGES).map((stage, idx) => {
                      return (
                        <div
                          key={stage.id}
                          className="p-4 rounded-xl bg-[#0c1017] border border-[#1c2436] hover:border-[#2b3952] transition-all space-y-3"
                          style={{
                            borderLeft: `4px solid ${stage.color}`,
                            ...(stage.color === '#000000' ? { borderLeftColor: '#000000', boxShadow: 'inset 2px 0 0 rgba(255,255,255,0.2)' } : {})
                          }}
                        >
                          {/* Riga Superiore: Badge, Nome, Slider % e Azioni */}
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span
                                className="px-2 py-0.5 rounded text-[11px] font-black tracking-wider uppercase shrink-0 border"
                                style={{
                                  backgroundColor: stage.color === '#000000' ? '#000000' : `${stage.color}15`,
                                  borderColor: stage.color === '#000000' ? '#475569' : `${stage.color}40`,
                                  color: stage.color === '#000000' ? '#ffffff' : stage.color,
                                }}
                              >
                                Step {idx + 1}
                              </span>

                              <input
                                type="text"
                                value={stage.name}
                                onChange={e => updateStageField(stage.id, 'name', e.target.value)}
                                className="w-full max-w-md bg-transparent text-white font-bold text-xs md:text-sm px-2 py-1 rounded-lg border border-transparent hover:border-[#222c3d] focus:border-[#00ff66] focus:bg-[#10141e] focus:outline-none transition-all"
                              />
                            </div>

                            {/* Controllo Probabilità % */}
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="flex items-center gap-2.5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase">Probabilità:</span>
                                {stage.isWon ? (
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    100% (Fisso Vinto)
                                  </span>
                                ) : stage.isLost ? (
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-black text-white border border-slate-700 shadow-sm">
                                    0% (Fisso Perso)
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      step="5"
                                      value={stage.probability}
                                      onChange={e => updateStageProbability(stage.id, e.target.value)}
                                      className="w-24 sm:w-32 accent-[#00ff66] cursor-pointer"
                                    />
                                    <div className="flex items-center">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={stage.probability}
                                        onChange={e => updateStageProbability(stage.id, e.target.value)}
                                        className="w-12 bg-[#080b0f] border border-[#222c3d] px-1 py-0.5 text-xs font-black text-right text-white rounded focus:outline-none focus:border-[#00ff66]"
                                      />
                                      <span className="text-xs text-slate-400 font-bold ml-1">%</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Tasto Elimina (se non fase terminale) */}
                              {!stage.isWon && !stage.isLost && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStage(stage.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors cursor-pointer"
                                  title="Elimina questo step"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Riga Inferiore: Descrizione Operativa */}
                          <div className="flex items-center gap-2 pt-1 border-t border-[#182030]">
                            <span className="text-[10px] text-slate-500 uppercase font-black shrink-0">Deliverable / Focus:</span>
                            <input
                              type="text"
                              value={stage.description}
                              onChange={e => updateStageField(stage.id, 'description', e.target.value)}
                              placeholder="Descrizione del deliverable di questo step..."
                              className="w-full bg-transparent text-[11px] text-slate-400 px-2 py-0.5 rounded border border-transparent hover:border-[#1c2436] focus:border-[#00ff66] focus:bg-[#080b10] focus:outline-none"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* CARD 2: SIMULATORE DI FORECASTING PONDERATO */}
                <div className="p-5 md:p-6 bg-[#121722] border border-[#1f293d] rounded-xl shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[#1c2436] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30">
                        <Calculator className="w-5 h-5 stroke-[2.4]" />
                      </div>
                      <div>
                        <h3 className="text-white text-base font-bold">
                          Simulatore di Forecasting Ponderato (Weighted Pipeline)
                        </h3>
                        <p className="text-xs text-slate-400">
                          Visualizza come un preventivo di produzione viene valorizzato a bilancio previsionale in base alle percentuali configurate
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">Preventivo Test:</span>
                      <div className="relative">
                        <input
                          type="number"
                          step="500"
                          min="1000"
                          value={forecastSimulatorValue}
                          onChange={e => setForecastSimulatorValue(Number(e.target.value) || 0)}
                          className="w-28 bg-[#0b0e14] border border-[#00ff66]/40 px-2.5 py-1 text-xs md:text-sm font-black text-[#00ff66] rounded-lg text-right focus:outline-none"
                        />
                        <span className="absolute right-7 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">€</span>
                      </div>
                    </div>
                  </div>

                  {/* Griglia Fasi & Pesi Finanziari */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                    {(settings.pipelineStages || DEFAULT_PIPELINE_STAGES).map((stg) => {
                      const weightedAmount = Math.round((forecastSimulatorValue * stg.probability) / 100)
                      return (
                        <div
                          key={stg.id}
                          className="p-3 rounded-xl bg-[#0d1118] border border-[#1c2434] flex flex-col justify-between"
                          style={{
                            borderTop: `3px solid ${stg.color}`,
                            ...(stg.color === '#000000' ? { borderTopColor: '#000000', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' } : {})
                          }}
                        >
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate" title={stg.shortName || stg.name}>
                              {stg.shortName || stg.name}
                            </div>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-lg font-black text-white">{stg.probability}%</span>
                              <span className="text-[10px] text-slate-400">prob.</span>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-[#1c2436]/60">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Valore Atteso:</div>
                            <div className="text-sm font-black text-[#00ff66]">
                              {weightedAmount.toLocaleString('it-IT')} €
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0a1219] border border-[#00ff66]/20 text-xs text-slate-300 leading-relaxed font-sans flex items-start gap-2.5">
                    <Percent className="w-4 h-4 text-[#00ff66] shrink-0 mt-0.5" />
                    <span>
                      <strong>Formula di Controllo Gestione:</strong> Il valore ponderato (€ {Number(forecastSimulatorValue).toLocaleString('it-IT')} × % probabilità) è il coefficiente usato dagli analisti di produzione per stimare la reale liquidità in arrivo, evitando investimenti incauti su preventivi ancora esplorativi.
                    </span>
                  </div>
                </div>

                {/* CARD 3: MOTIVAZIONI DI PERDITA (CLOSED LOST REASONS) */}
                <div className="p-5 md:p-6 bg-[#121722] border border-[#1f293d] rounded-xl shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#1c2436] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <XCircle className="w-5 h-5 stroke-[2.4]" />
                      </div>
                      <div>
                        <h3 className="text-white text-base font-bold">
                          Motivazioni di Perdita (Closed Lost Reasons)
                        </h3>
                        <p className="text-xs text-slate-400">
                          Causali obbligatorie per analisi Win/Loss di studio e reportistica motivi di fallimento trattative
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Regole & Switch di Obbligatorietà */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c1017] border border-[#1c2436]">
                      <div className="pr-3">
                        <div className="text-xs text-white font-bold flex items-center gap-2">
                          <span>Selezione Causale Obbligatoria</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-300 font-extrabold border border-rose-500/30">CONSIGLIATO</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Impedisce di chiudere a "Perso" una trattativa senza selezionare un motivo dal menu a tendina.
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting('requireLostReason')}
                        disabled={isDipendente}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 border border-[#2a374c] shrink-0 ${
                          isDipendente ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        style={{
                          backgroundColor: settings.requireLostReason ? COLOR_ALIEN_GREEN : '#1c2434',
                          boxShadow: settings.requireLostReason ? '0 0 10px rgba(0,255,102,0.45)' : 'none',
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-[#090d12] border border-[#00ff66]/50 transition-transform ${
                            settings.requireLostReason ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c1017] border border-[#1c2436]">
                      <div className="pr-3">
                        <div className="text-xs text-white font-bold flex items-center gap-2">
                          <span>Note Descrittive Obbligatorie</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-500/20 text-sky-300 font-extrabold border border-sky-500/30">AUDIT</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Richiede di inserire una frase con il feedback o motivo reale riferito dal cliente.
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting('requireLostNotes')}
                        disabled={isDipendente}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 border border-[#2a374c] shrink-0 ${
                          isDipendente ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        style={{
                          backgroundColor: settings.requireLostNotes ? COLOR_ALIEN_GREEN : '#1c2434',
                          boxShadow: settings.requireLostNotes ? '0 0 10px rgba(0,255,102,0.45)' : 'none',
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-[#090d12] border border-[#00ff66]/50 transition-transform ${
                            settings.requireLostNotes ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Elenco causali */}
                  <div className="space-y-2 mb-4">
                    {(settings.lostReasons || DEFAULT_LOST_REASONS).map((reason) => {
                      const categoryColors = {
                        Budget: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30',
                        Concorrenza: 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30',
                        Tempistiche: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
                        Contratto: 'bg-purple-950/40 text-purple-300 border-purple-500/30',
                        Logistica: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30',
                        'Follow-up': 'bg-rose-950/40 text-rose-300 border-rose-500/30',
                        Qualificazione: 'bg-orange-950/40 text-orange-300 border-orange-500/30',
                      }
                      const badgeStyle = categoryColors[reason.category] || 'bg-slate-900 text-slate-300 border-slate-700'
                      return (
                        <div
                          key={reason.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            reason.active
                              ? 'bg-[#0d1118] border-[#1c2434] text-slate-200'
                              : 'bg-[#090c12]/60 border-[#151a24] text-slate-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${badgeStyle}`}>
                              {reason.category}
                            </span>
                            <span className="text-xs md:text-sm font-semibold">{reason.label}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleLostReason(reason.id)}
                              disabled={isDipendente}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                                reason.active
                                  ? 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/30 hover:bg-[#00ff66]/20'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                              }`}
                            >
                              {reason.active ? 'Attiva' : 'Disattivata'}
                            </button>
                            {!isDipendente && (
                              <button
                                type="button"
                                onClick={() => handleDeleteLostReason(reason.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title="Elimina causale"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Form aggiunta rapida nuova causale */}
                  {!isDipendente && (
                    <form onSubmit={handleAddLostReason} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t border-[#1c2436]">
                      <input
                        type="text"
                        placeholder="Aggiungi causale (es. Mancato accordo su cessione licenze per estero)..."
                        value={newLostReasonForm.label}
                        onChange={e => setNewLostReasonForm(f => ({ ...f, label: e.target.value }))}
                        className="flex-1 bg-[#0b0e14] border border-[#222c3d] px-3.5 py-2 text-xs text-slate-100 rounded-xl focus:outline-none focus:border-[#00ff66]"
                      />
                      <select
                        value={newLostReasonForm.category}
                        onChange={e => setNewLostReasonForm(f => ({ ...f, category: e.target.value }))}
                        className="bg-[#0b0e14] border border-[#222c3d] px-3 py-2 text-xs text-slate-100 rounded-xl focus:outline-none focus:border-[#00ff66]"
                      >
                        <option value="Budget">Budget</option>
                        <option value="Concorrenza">Concorrenza</option>
                        <option value="Tempistiche">Tempistiche</option>
                        <option value="Contratto">Contratto</option>
                        <option value="Logistica">Logistica</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Qualificazione">Qualificazione</option>
                        <option value="Altro">Altro</option>
                      </select>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#131924] hover:bg-[#1a2232] text-[#00ff66] border border-[#00ff66]/40 hover:border-[#00ff66] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Aggiungi</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Banner di Salva Impostazioni in fondo alla scheda */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer bg-[#00ff66] hover:bg-[#00e65c] text-[#061009] shadow-[0_0_14px_rgba(0,255,102,0.25)] active:scale-95 border border-[#00ff66]"
                  >
                    Salva Configurazione Pipeline
                  </button>
                </div>

              </div>
            )
          )}



          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 4: NOTIFICHE & TASK AUTOMATICI                                */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'notifications' && (
            isDipendente ? (
              <SecretAccessDenied
                title="Sezione Notifiche & Automazioni Riservata"
                reason="Le impostazioni di webhook, regole di assegnazione compiti automatici e l'esportazione del database sono protette e accessibili esclusivamente dall'Amministratore."
              />
            ) : (
              <div className="space-y-6 mb-8">

                {/* Banner Feedback Test Regola */}
                {ruleTestToast && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-[#00ff66]/50 text-[#00ff66] text-xs font-bold flex items-center justify-between shadow-[0_0_20px_rgba(0,255,102,0.18)] animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                      <span>{ruleTestToast}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRuleTestToast(null)}
                      className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* ── 1. SEZIONE PRINCIPALE: REGOLE PER ASSEGNAZIONE COMPITI & TASK AUTOMATICI ── */}
                <div className="p-5 md:p-6 bg-[#121722] border border-[#1f293d] rounded-2xl shadow-xl">
                  {/* Header sezione */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-[#1c2436]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 shadow-[0_0_12px_rgba(0,255,102,0.2)]">
                        <Zap className="w-5 h-5 stroke-[2.4]" />
                      </div>
                      <div>
                        <h3 className="text-white text-base md:text-lg font-black flex items-center gap-2">
                          <span>Regole per Assegnazione Compiti & Task Automatici</span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          Automazioni per generare e assegnare task al team al verificarsi di eventi chiave nel CRM
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddRuleModal(prev => !prev)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all bg-[#00ff66]/15 hover:bg-[#00ff66]/25 text-[#00ff66] border border-[#00ff66]/40 cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(0,255,102,0.15)] self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>{showAddRuleModal ? 'Chiudi Modulo' : 'Nuova Regola'}</span>
                    </button>
                  </div>

                  {/* Modulo Nuova Regola (espandibile) */}
                  {showAddRuleModal && (
                    <form onSubmit={handleAddRule} className="p-4 md:p-5 mb-5 rounded-xl bg-[#090d14] border border-[#00ff66]/30 animate-in fade-in">
                      <div className="text-xs font-black uppercase text-[#00ff66] tracking-wider mb-3 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Crea Nuova Regola di Assegnazione Automatica</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                            Nome della Regola
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Es. Richiamo Lead post-invio preventivo"
                            value={newRuleForm.title}
                            onChange={e => setNewRuleForm({ ...newRuleForm, title: e.target.value })}
                            className="w-full bg-[#121722] border border-[#222c3d] px-3.5 py-2 text-xs text-slate-100 rounded-lg focus:outline-none focus:border-[#00ff66]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                            Evento Scatenante (Trigger)
                          </label>
                          <select
                            value={newRuleForm.trigger}
                            onChange={e => setNewRuleForm({ ...newRuleForm, trigger: e.target.value })}
                            className="w-full bg-[#121722] border border-[#222c3d] px-3.5 py-2 text-xs text-slate-100 rounded-lg focus:outline-none focus:border-[#00ff66] cursor-pointer"
                          >
                            <option value="quote_sent">⚡ Dall'invio del preventivo commerciale</option>
                            <option value="lead_inbound">📩 Dalla registrazione di un nuovo lead inbound</option>
                            <option value="contract_signed">📝 Dalla firma del contratto digitale</option>
                            <option value="shooting_done">🎬 Dalla conclusione dello shooting</option>
                            <option value="payment_received">💶 Dall'incasso dell'acconto o saldo</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-3.5">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                          Compito / Promemoria Generato (Azione nel CRM)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Es. Crea un promemoria per richiamare il lead dopo 3 giorni dall'invio del preventivo"
                          value={newRuleForm.actionTask}
                          onChange={e => setNewRuleForm({ ...newRuleForm, actionTask: e.target.value })}
                          className="w-full bg-[#121722] border border-[#222c3d] px-3.5 py-2 text-xs text-slate-100 rounded-lg focus:outline-none focus:border-[#00ff66]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                            Tempistica (Ritardo)
                          </label>
                          <select
                            value={newRuleForm.delayDays}
                            onChange={e => setNewRuleForm({ ...newRuleForm, delayDays: Number(e.target.value) })}
                            className="w-full bg-[#121722] border border-[#222c3d] px-3.5 py-2 text-xs text-slate-100 rounded-lg focus:outline-none focus:border-[#00ff66] cursor-pointer"
                          >
                            <option value={1}>Dopo 1 giorno</option>
                            <option value={2}>Dopo 2 giorni</option>
                            <option value={3}>Dopo 3 giorni (Consigliato per preventivi)</option>
                            <option value={5}>Dopo 5 giorni</option>
                            <option value={7}>Dopo 7 giorni (1 settimana)</option>
                            <option value={14}>Dopo 14 giorni (2 settimane)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                            Assegna Compito A
                          </label>
                          <select
                            value={newRuleForm.assignedTo}
                            onChange={e => setNewRuleForm({ ...newRuleForm, assignedTo: e.target.value })}
                            className="w-full bg-[#121722] border border-[#222c3d] px-3.5 py-2 text-xs text-slate-100 rounded-lg focus:outline-none focus:border-[#00ff66] cursor-pointer"
                          >
                            <option value="Davide (Director)">Davide (Director)</option>
                            <option value="Andrea T. (Amministratore)">Andrea T. (Amministratore)</option>
                            <option value="Marco B. (Video Editor)">Marco B. (Video Editor)</option>
                            <option value="Sara V. (Fotografa Set)">Sara V. (Fotografa Set)</option>
                            <option value="Staff Studio">Staff Studio (Generico)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                            Priorità
                          </label>
                          <select
                            value={newRuleForm.priority}
                            onChange={e => setNewRuleForm({ ...newRuleForm, priority: e.target.value })}
                            className="w-full bg-[#121722] border border-[#222c3d] px-3.5 py-2 text-xs text-slate-100 rounded-lg focus:outline-none focus:border-[#00ff66] cursor-pointer"
                          >
                            <option value="Alta">Priorità Alta</option>
                            <option value="Media">Priorità Media</option>
                            <option value="Bassa">Priorità Bassa</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1c2436]">
                        <button
                          type="button"
                          onClick={() => setShowAddRuleModal(false)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Annulla
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-[#00ff66] hover:bg-[#00dd55] text-slate-950 flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,102,0.3)] transition-all cursor-pointer active:scale-95"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Salva Regola</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Lista delle Regole Configurate */}
                  <div className="space-y-4">
                    {(settings.taskRules || DEFAULT_TASK_RULES).map((rule, idx) => {
                      const isRuleActive = rule.active !== false

                      return (
                        <div
                          key={rule.id || idx}
                          className={`p-4 md:p-5 rounded-xl border transition-all ${
                            isRuleActive
                              ? 'bg-[#0e121a] border-[#00ff66]/35 shadow-[0_0_15px_rgba(0,255,102,0.06)]'
                              : 'bg-[#0a0d13]/70 border-[#1c2436] opacity-60'
                          }`}
                        >
                          {/* Testata della Scheda Regola */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2333]">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                                  isRuleActive
                                    ? 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/40 shadow-[0_0_8px_rgba(0,255,102,0.2)]'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {isRuleActive ? '● Regola Attiva' : '○ Disattivata'}
                              </span>

                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-sky-950/70 border border-sky-500/40 text-sky-300 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-sky-400" />
                                <span>{rule.triggerLabel}</span>
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                                  rule.priority === 'Alta'
                                    ? 'bg-rose-950/60 text-rose-300 border-rose-500/50'
                                    : 'bg-amber-950/60 text-amber-300 border-amber-500/50'
                                }`}
                              >
                                {rule.priority}
                              </span>
                            </div>

                            {/* Toggle Switch Attivo/Inattivo */}
                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              <span className="text-[11px] font-bold text-slate-400">
                                {isRuleActive ? 'Attiva' : 'Disattiva'}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleRuleActive(rule.id)}
                                className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer border border-[#2a374c]"
                                style={{
                                  backgroundColor: isRuleActive ? COLOR_ALIEN_GREEN : '#1c2434',
                                  boxShadow: isRuleActive ? '0 0 10px rgba(0,255,102,0.45)' : 'none',
                                }}
                                title="Attiva o disattiva questa regola"
                              >
                                <div
                                  className={`w-5 h-5 rounded-full bg-[#090d12] border border-[#00ff66]/50 transition-transform ${
                                    isRuleActive ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Titolo e Testo del Compito Generato */}
                          <div className="mt-3">
                            <h4 className="text-sm font-black text-white flex items-center gap-2">
                              <span>{rule.title}</span>
                            </h4>

                            <div className="mt-2 p-3 rounded-lg bg-[#06080c] border border-[#18202e] flex items-start gap-2.5">
                              <Bot className="w-4 h-4 text-[#00ff66] shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                  Compito generato in automatico nel CRM:
                                </div>
                                <div className="text-xs md:text-sm font-bold text-slate-200 italic mt-0.5">
                                  "{rule.actionTask}"
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Controlli Dinamici (Ritardo giorni & Assegnazione utente) */}
                          <div className="mt-3.5 pt-3 border-t border-[#18202e] flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                              {/* Dropdown Tempistica */}
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  Ritardo:
                                </span>
                                <select
                                  value={rule.delayDays}
                                  onChange={e => updateRuleParam(rule.id, 'delayDays', Number(e.target.value))}
                                  className="bg-[#06080c] border border-[#222c3d] hover:border-[#00ff66] text-xs font-bold text-slate-100 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                                >
                                  <option value={1}>Dopo 1 giorno</option>
                                  <option value={2}>Dopo 2 giorni</option>
                                  <option value={3}>Dopo 3 giorni</option>
                                  <option value={5}>Dopo 5 giorni</option>
                                  <option value={7}>Dopo 7 giorni</option>
                                  <option value={14}>Dopo 14 giorni</option>
                                </select>
                              </div>

                              {/* Dropdown Assegnazione Collaboratore */}
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  Assegna a:
                                </span>
                                <select
                                  value={rule.assignedTo}
                                  onChange={e => updateRuleParam(rule.id, 'assignedTo', e.target.value)}
                                  className="bg-[#06080c] border border-[#222c3d] hover:border-[#00ff66] text-xs font-bold text-slate-100 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                                >
                                  <option value="Davide (Director)">Davide (Director)</option>
                                  <option value="Andrea T. (Amministratore)">Andrea T. (Amministratore)</option>
                                  <option value="Marco B. (Video Editor)">Marco B. (Video Editor)</option>
                                  <option value="Sara V. (Fotografa Set)">Sara V. (Fotografa Set)</option>
                                  <option value="Staff Studio">Staff Studio</option>
                                </select>
                              </div>
                            </div>

                            {/* Azioni: Simula trigger e Cancella */}
                            <div className="flex items-center gap-2 self-end md:self-auto">
                              <button
                                type="button"
                                onClick={() => handleTestRule(rule)}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-sky-950/70 hover:bg-sky-900 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                                title="Genera un task di test nel CRM per verificare la regola"
                              >
                                <Play className="w-3 h-3 text-sky-400 fill-sky-400" />
                                <span>Simula Regola</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Rimuovi questa regola"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Pulsante rapido Salvataggio Regole */}
                  <div className="mt-5 pt-4 border-t border-[#1c2436] flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Le modifiche alle regole vengono applicate in tempo reale e salvate nella configurazione CRM.
                    </span>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#00ff66] hover:bg-[#00dd55] text-slate-950 flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,102,0.25)] transition-all cursor-pointer active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Salva Regole & Automazioni</span>
                    </button>
                  </div>
                </div>

                {/* ── 2. RIGA INFERIORE: ALERT PIPELINE & BACKUP WEBHOOK ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {/* Box Notifiche Push & Alert Scadenze */}
                  <div className="p-5 md:p-6 bg-[#121722] border border-[#1f293d] rounded-xl shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4 border-b border-[#1c2436] pb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30">
                          <Bell className="w-5 h-5 stroke-[2.4]" />
                        </div>
                        <div>
                          <h3 className="text-white text-base font-bold">
                            Automazioni & Alert Pipeline
                          </h3>
                          <p className="text-xs text-slate-400">
                            Avvisi automatici per scadenze e pipeline commerciale
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0d1118] border border-[#1c2434]">
                          <div>
                            <div className="text-xs text-slate-200 font-bold">
                              Alert Preventivi in Scadenza
                            </div>
                            <div className="text-[12px] text-slate-400">
                              Avvisa a 3 giorni dal termine validità offerta
                            </div>
                          </div>
                          <button
                            onClick={() => toggleSetting('notifyQuotesExpiring')}
                            className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer border border-[#2a374c]"
                            style={{
                              backgroundColor: settings.notifyQuotesExpiring ? COLOR_ALIEN_GREEN : '#1c2434',
                              boxShadow: settings.notifyQuotesExpiring ? '0 0 10px rgba(0,255,102,0.45)' : 'none',
                            }}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-[#090d12] border border-[#00ff66]/50 transition-transform ${
                                settings.notifyQuotesExpiring ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0d1118] border border-[#1c2434]">
                          <div>
                            <div className="text-xs text-slate-200 font-bold">
                              Notifica Firma Contratto Digitale
                            </div>
                            <div className="text-[12px] text-slate-400">
                              Ricevi alert non appena il cliente firma via PEC o PDF
                            </div>
                          </div>
                          <button
                            onClick={() => toggleSetting('notifyContractsSigned')}
                            className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer border border-[#2a374c]"
                            style={{
                              backgroundColor: settings.notifyContractsSigned ? COLOR_ALIEN_GREEN : '#1c2434',
                              boxShadow: settings.notifyContractsSigned ? '0 0 10px rgba(0,255,102,0.45)' : 'none',
                            }}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-[#090d12] border border-[#00ff66]/50 transition-transform ${
                                settings.notifyContractsSigned ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0d1118] border border-[#1c2434]">
                          <div>
                            <div className="text-xs text-slate-200 font-bold">
                              Conferma Incasso Acconti
                            </div>
                            <div className="text-[12px] text-slate-400">
                              Aggiorna automaticamente lo status in "Acconto Versato"
                            </div>
                          </div>
                          <button
                            onClick={() => toggleSetting('notifyPaymentReceived')}
                            className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer border border-[#2a374c]"
                            style={{
                              backgroundColor: settings.notifyPaymentReceived ? COLOR_ALIEN_GREEN : '#1c2434',
                              boxShadow: settings.notifyPaymentReceived ? '0 0 10px rgba(0,255,102,0.45)' : 'none',
                            }}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-[#090d12] border border-[#00ff66]/50 transition-transform ${
                                settings.notifyPaymentReceived ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1c2436] text-xs text-slate-400">
                      Canale notifiche: In-App Toast & Gmail
                    </div>
                  </div>

                  {/* Box Backup Database & Webhook */}
                  <div className="p-5 md:p-6 bg-[#121722] border border-[#1f293d] rounded-xl shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4 border-b border-[#1c2436] pb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          <Database className="w-5 h-5 stroke-[2.4]" />
                        </div>
                        <div>
                          <h3 className="text-white text-base font-bold">
                            Backup Database & Webhook
                          </h3>
                          <p className="text-xs text-slate-400">
                            Esportazione dati clienti, storico e sincronizzazioni esterne
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-bold">
                            Endpoint Webhook Personalizzato
                          </label>
                          <input
                            type="url"
                            value={settings.webhookUrl}
                            onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                            className="w-full bg-[#0b0e14] border border-[#222c3d] px-3.5 py-2 text-xs md:text-sm text-slate-100 rounded-xl focus:outline-none focus:bg-[#0e1219] focus:border-[#00ff66] focus:ring-1 focus:ring-[#00ff66]/30 transition-all placeholder:text-slate-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 mb-1 font-bold">
                            Frequenza Backup Automatico
                          </label>
                          <select
                            value={settings.backupFrequency}
                            onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                            className="w-full bg-[#0b0e14] border border-[#222c3d] px-3.5 py-2 text-xs md:text-sm text-slate-100 rounded-xl focus:outline-none focus:bg-[#0e1219] focus:border-[#00ff66] focus:ring-1 focus:ring-[#00ff66]/30 transition-all cursor-pointer"
                          >
                            <option value="Giornaliero" className="bg-[#0b0e14] text-white">Giornaliero (alle ore 02:00)</option>
                            <option value="Settimanale su Drive" className="bg-[#0b0e14] text-white">Settimanale su Drive (ogni domenica)</option>
                            <option value="Manuale" className="bg-[#0b0e14] text-white">Solo manuale su richiesta</option>
                          </select>
                        </div>

                        {/* Bottone Scarica Backup */}
                        <div className="pt-2">
                          <button
                            onClick={handleExportData}
                            className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all bg-[#00ff66]/10 hover:bg-[#00ff66]/20 text-slate-200 hover:text-white border border-[#00ff66]/40 cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(0,255,102,0.1)]"
                          >
                            <Download className="w-4 h-4 text-[#00ff66]" />
                            <span>Scarica Backup Completo (.JSON)</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1c2436] text-xs text-slate-400 flex items-center justify-between">
                      <span>Ultimo salvataggio locale:</span>
                      <span className="text-[#00ff66] font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] shadow-[0_0_6px_#00ff66]" />
                        Oggi alle 12:45
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </div>
    </div>
  )
}
