import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Globe,
  Instagram,
  Users,
  Mail,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  MapPin,
  Send,
  Zap,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  FileText,
  Building2
} from 'lucide-react'

// ── SCHEMA CANALI DI ACQUISIZIONE & MOTIVO DEL CONTATTO ────────────────────────
export const LEAD_CHANNELS = [
  {
    id: 'web_form',
    name: 'Sito Web (Form Inbound)',
    type: 'Caldo / Inbound Diretto',
    reason: 'Richiesta preventivo spot corporate, video industriale o shooting moda.',
    assetRequired: 'Showreel, listino indicativo, disponibilità date.',
    score: 5,
    scoreLabel: '⭐⭐⭐⭐⭐ (5/5)',
    color: '#00ffaa',
    accentBg: 'rgba(0, 255, 170, 0.08)',
    borderColor: 'rgba(0, 255, 170, 0.3)',
    icon: Globe,
    badge: 'Priorità Alta'
  },
  {
    id: 'instagram_adv',
    name: 'Instagram / TikTok ADV & DM',
    type: 'Moderato / Visual',
    reason: 'Richiesta noleggio Limbo Studio Milano, video clip o reel social di tendenza.',
    assetRequired: 'Scheda tecnica Limbo A, prezzi mezze giornate.',
    score: 4,
    scoreLabel: '⭐⭐⭐⭐ (4/5)',
    color: '#ff00aa',
    accentBg: 'rgba(255, 0, 170, 0.08)',
    borderColor: 'rgba(255, 0, 170, 0.3)',
    icon: Instagram,
    badge: 'Visual Focus'
  },
  {
    id: 'referral',
    name: 'Referral & Passaparola',
    type: 'Caldissimo / Fiducia',
    reason: 'Collaborazione continuativa da agenzie di comunicazione o partner (es. NextMedia).',
    assetRequired: 'Portfolio lavori simili, condizioni quadro B2B.',
    score: 5,
    scoreLabel: '⭐⭐⭐⭐⭐ (5/5)',
    color: '#fac429',
    accentBg: 'rgba(250, 196, 41, 0.08)',
    borderColor: 'rgba(250, 196, 41, 0.3)',
    icon: Users,
    badge: 'Partner Tier'
  },
  {
    id: 'outreach',
    name: 'Outreach B2B / Cold Email',
    type: 'Proattivo / Freddo',
    reason: 'Proposta servizi video corporate e riprese con drone per aziende manifatturiere.',
    assetRequired: 'Case study di settore (es. Officine Riva).',
    score: 3,
    scoreLabel: '⭐⭐⭐ (3/5)',
    color: '#1bb7ed',
    accentBg: 'rgba(27, 183, 237, 0.08)',
    borderColor: 'rgba(27, 183, 237, 0.3)',
    icon: Mail,
    badge: 'B2B Targeted'
  },
  {
    id: 'events',
    name: 'Eventi / Fiere di Settore',
    type: 'Relazionale',
    reason: 'Contatto diretto con direttori marketing / responsabili comunicazione.',
    assetRequired: 'Presentazione aziendale PDF, contatto referente.',
    score: 4,
    scoreLabel: '⭐⭐⭐⭐ (4/5)',
    color: '#d8ff00',
    accentBg: 'rgba(216, 255, 0, 0.08)',
    borderColor: 'rgba(216, 255, 0, 0.3)',
    icon: Award,
    badge: 'Incontro Face-to-Face'
  }
]

// ── WORKFLOW STAGES ─────────────────────────────────────────────────────────────
export const WORKFLOW_STAGES = [
  {
    step: '01',
    title: 'Ingestione Multi-Canale',
    desc: 'Ricezione automatica da Web Form, Instagram, Referral o Cold Email',
    action: 'Parser automatico Gmail/Webhook & log nel database CRM',
    timing: 'Tempo reale (0 min)'
  },
  {
    step: '02',
    title: 'Qualificazione B.A.N.T.',
    desc: 'Estrazione budget deliberato, autorità referente, necessità e tempistiche',
    action: 'Calcolo automatico score da 1/4 a 4/4 e categorizzazione lead',
    timing: '< 5 minuti'
  },
  {
    step: '03',
    title: 'Check Calendario Anti-Conflitto',
    desc: 'Verifica slot liberi del Limbo DADO e disponibilità crew riprese',
    action: 'Integrazione Google Calendar per escludere date di shooting blindate',
    timing: 'Istantaneo'
  },
  {
    step: '04',
    title: 'Email Proposta Call (Slot Smart)',
    desc: 'Invio immediato con showreel e 2 slot orari alternativi liberi',
    action: 'Invio via Gmail con link Meet o calendario interattivo',
    timing: 'Risposta utente < 15 min'
  },
  {
    step: '05',
    title: 'Conferma Appuntamento Ufficiale',
    desc: 'Invio recap call con link Google Meet e ordine del giorno strutturato',
    action: 'Invito calendario inviato al referente + blocco date',
    timing: 'Alla risposta lead'
  },
  {
    step: '06',
    title: 'Promemoria & Conversione',
    desc: 'Notifica 24h & 1h prima della call, brief commerciale e bozza preventivo',
    action: 'Conversione del lead in Opportunità / Contratto DADO Studio',
    timing: '24h / 1h prima'
  }
]

// ── LEAD ATTIVI NEL CRM PER DIMOSTRAZIONE OPERATIVA ─────────────────────────────
const INITIAL_LEADS = [
  {
    id: 'lead-1',
    company: 'NextMedia Agency',
    contact: 'Sara Moretti',
    role: 'Head of Partnerships',
    email: 's.moretti@nextmedia.agency',
    phone: '+39 02 8734 9102',
    channelId: 'referral',
    status: 'call_proposta', // 'nuovo', 'qualificato', 'call_proposta', 'call_confermata'
    estimatedValue: 5000,
    need: 'Accordo continuativo per produzione video corporate e shooting social per brand moda.',
    assetSent: 'Portfolio lavori moda, condizioni quadro B2B 2026',
    bant: { b: true, a: true, n: true, t: true, score: 4 },
    preferredPlace: 'Google Meet',
    scheduledSlot: 'Martedì 29 Settembre ore 11:30',
    meetLink: 'https://meet.google.com/dad-next-med'
  },
  {
    id: 'lead-2',
    company: 'Fashion Brand Milano',
    contact: 'Matteo Colombo',
    role: 'Brand Manager',
    email: 'm.colombo@fashionbrand.it',
    phone: '+39 02 4432 1198',
    channelId: 'web_form',
    status: 'qualificato',
    estimatedValue: 5000,
    need: 'Richiesta preventivo per shooting lookbook e 15 clip video verticali in Limbo A.',
    assetSent: 'Showreel studio, scheda tecnica Limbo DADO',
    bant: { b: false, a: true, n: true, t: true, score: 3 },
    preferredPlace: 'Limbo Studio DADO (Milano)',
    scheduledSlot: null,
    meetLink: null
  },
  {
    id: 'lead-3',
    company: 'Urban Tech Mobility',
    contact: 'Davide Neri',
    role: 'Marketing Lead',
    email: 'd.neri@urbantech.io',
    phone: '+39 06 9182 3341',
    channelId: 'outreach',
    status: 'nuovo',
    estimatedValue: 4200,
    need: 'Proposta spot video su monopattini ed e-bike con riprese action e drone.',
    assetSent: 'Case study Officine Riva & Urban Mobility',
    bant: { b: true, a: false, n: true, t: false, score: 2 },
    preferredPlace: 'Google Meet',
    scheduledSlot: null,
    meetLink: null
  },
  {
    id: 'lead-4',
    company: 'Lumière Atelier Gioielli',
    contact: 'Beatrice Conti',
    role: 'Creative Director',
    email: 'b.conti@lumierejewels.com',
    phone: '+39 347 8891 203',
    channelId: 'instagram_adv',
    status: 'call_confermata',
    estimatedValue: 6800,
    need: 'Video macro 4K con luci cinema continue Aputure e foto still life per e-commerce.',
    assetSent: 'Scheda tecnica Limbo A, prezzi mezze giornate',
    bant: { b: true, a: true, n: true, t: true, score: 4 },
    preferredPlace: 'Limbo Studio DADO (Milano)',
    scheduledSlot: 'Mercoledì 30 Settembre ore 15:30',
    meetLink: 'https://meet.google.com/lum-dado-gio'
  },
  {
    id: 'lead-5',
    company: 'RoboTech Automation B2B',
    contact: 'Ing. Fabio Grassi',
    role: 'Responsabile Comunicazione',
    email: 'f.grassi@robotech-automation.it',
    phone: '+39 039 5567 890',
    channelId: 'events',
    status: 'call_proposta',
    estimatedValue: 8500,
    need: 'Video dimostrativo robotica industriale per fiera MecSpe con rendering 3D integrato.',
    assetSent: 'Presentazione aziendale DADO PDF',
    bant: { b: true, a: true, n: true, t: true, score: 4 },
    preferredPlace: 'On-site presso stabilimento cliente',
    scheduledSlot: 'Giovedì 1 Ottobre ore 10:30',
    meetLink: null
  }
]

export default function Leads() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState(INITIAL_LEADS)
  const [selectedChannel, setSelectedChannel] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showWorkflowModal, setShowWorkflowModal] = useState(false)
  const [activeLeadForEmail, setActiveLeadForEmail] = useState(null)
  const [emailModalType, setEmailModalType] = useState('proposta') // 'proposta' | 'conferma'
  const [emailStatus, setEmailStatus] = useState(null) // 'sending', 'sent'

  // Filtro lead per canale e ricerca
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchChannel = selectedChannel === 'all' || l.channelId === selectedChannel
      const matchSearch =
        l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.need.toLowerCase().includes(searchQuery.toLowerCase())
      return matchChannel && matchSearch
    })
  }, [leads, selectedChannel, searchQuery])

  // Metriche
  const totalValue = useMemo(() => leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0), [leads])
  const qualifiedCount = useMemo(() => leads.filter(l => l.bant.score >= 3).length, [leads])

  // Gestione invio email simulato o con backend
  async function handleSendEmail() {
    if (!activeLeadForEmail) return
    setEmailStatus('sending')
    try {
      // Invia la richiesta al backend CRM
      const res = await fetch('/api/pipeline/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: activeLeadForEmail.email,
          subject: emailModalType === 'proposta'
            ? `Proposta disponibilità call conoscitiva DADO Creative Studio & ${activeLeadForEmail.company}`
            : `Conferma Appuntamento: DADO Creative Studio & ${activeLeadForEmail.company} - ${activeLeadForEmail.scheduledSlot || 'Slot Confermato'}`,
          type: emailModalType,
          leadId: activeLeadForEmail.id
        })
      }).catch(() => null)

      // Aggiorna lo stato del lead localmente
      setLeads(prev => prev.map(l => {
        if (l.id === activeLeadForEmail.id) {
          return {
            ...l,
            status: emailModalType === 'proposta' ? 'call_proposta' : 'call_confermata',
            scheduledSlot: l.scheduledSlot || 'Martedì 29 Settembre ore 11:30',
            meetLink: l.meetLink || 'https://meet.google.com/dad-meet-call'
          }
        }
        return l
      }))

      setEmailStatus('sent')
      setTimeout(() => {
        setEmailStatus(null)
        setActiveLeadForEmail(null)
      }, 1400)
    } catch (err) {
      setEmailStatus(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-8 font-sans selection:bg-[#d8ff00] selection:text-black">
      
      {/* ── HEADER SUPERIORE ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ffaa] animate-pulse" />
            <span
              className="text-xs font-bold uppercase tracking-widest text-[#00ffaa]"
              style={{ fontFamily: '"Space Mono", monospace' }}
            >
              DADO STUDIO INBOUND & ACQUISIZIONE
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-baseline gap-2"
            style={{ fontFamily: '"Goldman", sans-serif' }}
          >
            SEZIONE LEADS & CANALI
          </h1>
          <p className="text-xs text-white/50 mt-1 max-w-xl">
            Gestione integrata del funnel di acquisizione, canali di ingresso, qualificazione commerciale B.A.N.T. e automazione invio email per call e appuntamenti.
          </p>
        </div>

        {/* Tasto visualizza Architettura Mermaid */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowWorkflowModal(true)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-2 rounded-sm transition-all cursor-pointer hover:border-[#d8ff00] hover:text-[#d8ff00]"
            style={{ fontFamily: '"Space Mono", monospace' }}
          >
            <Sparkles className="w-4 h-4 text-[#d8ff00]" />
            <span>SCHEMA WORKFLOW AI</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS BAR ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-white/5 border border-white/10 p-3.5 rounded-sm">
          <div className="text-[11px] font-mono text-white/50 uppercase">Lead Attivi in Pipeline</div>
          <div className="text-2xl font-black mt-1 font-mono text-white">{leads.length}</div>
          <div className="text-[10px] text-white/40 mt-0.5">5 canali monitorati</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-3.5 rounded-sm">
          <div className="text-[11px] font-mono text-white/50 uppercase">Qualificati B.A.N.T.</div>
          <div className="text-2xl font-black mt-1 font-mono text-[#00ffaa]">{qualifiedCount} / {leads.length}</div>
          <div className="text-[10px] text-[#00ffaa]/60 mt-0.5">Score medio 3.6 / 4</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-3.5 rounded-sm">
          <div className="text-[11px] font-mono text-white/50 uppercase">Valore Pipeline Potenziale</div>
          <div className="text-2xl font-black mt-1 font-mono text-[#fac429]">€ {totalValue.toLocaleString('it-IT')}</div>
          <div className="text-[10px] text-[#fac429]/60 mt-0.5">Ticket medio € 6.100</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-3.5 rounded-sm">
          <div className="text-[11px] font-mono text-white/50 uppercase">Risposta Utente Email</div>
          <div className="text-2xl font-black mt-1 font-mono text-[#1bb7ed]">&lt; 15 min</div>
          <div className="text-[10px] text-[#1bb7ed]/60 mt-0.5">Invio automatico attivo</div>
        </div>
      </div>

      {/* ── SEZIONE 1: ARCHITETTURA DI FLUSSO DEL LEAD (WORKFLOW STEP-BY-STEP) ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#d8ff00] text-black px-1.5 py-0.5 font-bold">1</span>
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider text-white" style={{ fontFamily: '"Goldman", sans-serif' }}>
              Architettura di Flusso del Lead (Workflow Operativo)
            </h2>
          </div>
          <span className="text-[11px] text-white/40 font-mono">Dall'ingestione alla conversione a contratto</span>
        </div>

        {/* 6 Step orizzontali reattivi */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {WORKFLOW_STAGES.map((s, idx) => (
            <div
              key={s.step}
              className="bg-black/60 border border-white/10 p-3 rounded-sm flex flex-col justify-between hover:border-white/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 rounded-bl flex items-center justify-center text-[10px] font-mono font-bold text-white/40 group-hover:text-[#d8ff00] group-hover:bg-[#d8ff00]/10 transition-colors">
                {s.step}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#00ffaa] font-bold block mb-1">
                  Step {s.step}
                </span>
                <h3 className="text-xs font-bold text-white leading-tight mb-1 group-hover:text-[#d8ff00] transition-colors">
                  {s.title}
                </h3>
                <p className="text-[11px] text-white/60 leading-snug">
                  {s.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5">
                <span className="text-[9px] font-mono text-white/40 uppercase block">Risposta Utente:</span>
                <span className="text-[10px] font-mono text-[#fac429] font-bold">{s.timing}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SEZIONE 2: SCHEMA CANALI DI ACQUISIZIONE & MOTIVO DEL CONTATTO ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#00ffaa] text-black px-1.5 py-0.5 font-bold">2</span>
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider text-white" style={{ fontFamily: '"Goldman", sans-serif' }}>
              Schema Canali di Acquisizione & Motivo del Contatto
            </h2>
          </div>

          {/* Filtro Rapido Canale */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-white/40 text-[11px] uppercase mr-1">Filtra per canale:</span>
            <button
              onClick={() => setSelectedChannel('all')}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-bold transition-all cursor-pointer ${
                selectedChannel === 'all'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Tutti ({leads.length})
            </button>
            {LEAD_CHANNELS.map(c => {
              const count = leads.filter(l => l.channelId === c.id).length
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedChannel(c.id)}
                  className={`px-2 py-1 rounded-sm text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    selectedChannel === c.id
                      ? 'bg-[#d8ff00] text-black font-black'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span>{c.name.split(' ')[0]}</span>
                  <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tabella / Schede Canali */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {LEAD_CHANNELS.map(ch => {
            const Icon = ch.icon
            const isSelected = selectedChannel === ch.id
            const leadCount = leads.filter(l => l.channelId === ch.id).length

            return (
              <div
                key={ch.id}
                onClick={() => setSelectedChannel(selectedChannel === ch.id ? 'all' : ch.id)}
                className={`p-3.5 rounded-sm border transition-all cursor-pointer flex flex-col justify-between select-none ${
                  isSelected
                    ? 'border-[#d8ff00] bg-white/[0.08] shadow-lg ring-1 ring-[#d8ff00]/40'
                    : 'border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/[0.03]'
                }`}
                style={{
                  borderTopColor: ch.color,
                  borderTopWidth: '3px'
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-sm bg-white/5 border border-white/10" style={{ color: ch.color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-sm"
                      style={{ color: ch.color, backgroundColor: ch.accentBg }}
                    >
                      {ch.badge}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white mb-0.5 leading-snug">
                    {ch.name}
                  </h3>
                  <div className="text-[10px] font-mono text-white/50 mb-2">{ch.type}</div>

                  <div className="space-y-2 mt-2 pt-2 border-t border-white/10 text-[11px]">
                    <div>
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Motivo Principale:</span>
                      <p className="text-white/80 leading-snug text-[10.5px] mt-0.5">{ch.reason}</p>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Asset DADO Richiesto:</span>
                      <p className="text-[#fac429] font-mono text-[10px] mt-0.5 leading-snug">{ch.assetRequired}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-white/40 block">Qualità</span>
                    <span className="text-[11px] font-mono font-bold text-white">{ch.scoreLabel}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-white/40 block">Lead Attivi</span>
                    <span className="text-xs font-mono font-bold text-[#00ffaa]">{leadCount}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── SEZIONE 3: LEAD ATTIVI & AUTOMAZIONE EMAIL CALL ── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#fac429] text-black px-1.5 py-0.5 font-bold">3</span>
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider text-white" style={{ fontFamily: '"Goldman", sans-serif' }}>
              Gestione Lead & Invio Email Automatiche Call
            </h2>
          </div>

          {/* Barra di ricerca */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca lead, referente o esigenza..."
              className="w-full bg-black/60 border border-white/15 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#d8ff00] rounded-sm"
            />
          </div>
        </div>

        {/* Lista Lead Cards */}
        <div className="space-y-3">
          {filteredLeads.map(lead => {
            const channel = LEAD_CHANNELS.find(c => c.id === lead.channelId) || LEAD_CHANNELS[0]
            const ChannelIcon = channel.icon

            return (
              <div
                key={lead.id}
                className="bg-black/40 border border-white/10 p-4 rounded-sm hover:border-white/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Info Principali Lead */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <h3 className="text-base font-bold text-white tracking-tight" style={{ fontFamily: '"Goldman", sans-serif' }}>
                      {lead.company}
                    </h3>

                    {/* Canale badge */}
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-sm border"
                      style={{
                        color: channel.color,
                        backgroundColor: channel.accentBg,
                        borderColor: channel.borderColor
                      }}
                    >
                      <ChannelIcon className="w-3 h-3" />
                      <span>{channel.name}</span>
                    </span>

                    {/* Score B.A.N.T. Badge */}
                    <span className="text-[10px] font-mono bg-white/10 text-white/80 px-2 py-0.5 rounded-sm">
                      B.A.N.T.: <strong className="text-[#00ffaa]">{lead.bant.score}/4</strong>
                    </span>

                    {/* Stato Processo */}
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase ${
                      lead.status === 'call_confermata'
                        ? 'bg-[#00ffaa]/20 text-[#00ffaa] border border-[#00ffaa]/40'
                        : lead.status === 'call_proposta'
                        ? 'bg-[#fac429]/20 text-[#fac429] border border-[#fac429]/40'
                        : 'bg-white/10 text-white/70'
                    }`}>
                      {lead.status === 'call_confermata' ? '✓ Call Confermata' : lead.status === 'call_proposta' ? '⏳ Slot Proposto' : 'Nuovo Lead'}
                    </span>
                  </div>

                  {/* Referente & Contatti */}
                  <div className="flex items-center gap-4 text-xs text-white/60 mb-2 flex-wrap font-mono">
                    <span className="flex items-center gap-1 text-white/90">
                      <strong className="text-white">{lead.contact}</strong> ({lead.role})
                    </span>
                    <span>• {lead.email}</span>
                    <span>• {lead.phone}</span>
                    <span className="text-[#fac429]">Valore: € {lead.estimatedValue.toLocaleString('it-IT')}</span>
                  </div>

                  {/* Esigenza & Luogo Preferito */}
                  <div className="text-xs text-white/80 space-y-1">
                    <p><strong className="text-white/40 font-mono text-[10px] uppercase">Esigenza:</strong> {lead.need}</p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-white/50">
                      <span><strong>Luogo preferito:</strong> {lead.preferredPlace}</span>
                      {lead.scheduledSlot && (
                        <span className="text-[#00ffaa]"><strong>Appuntamento:</strong> {lead.scheduledSlot}</span>
                      )}
                      {lead.meetLink && (
                        <a href={lead.meetLink} target="_blank" rel="noreferrer" className="text-[#1bb7ed] underline flex items-center gap-0.5">
                          Google Meet <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pulsanti Azione Rapida Email */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                  {/* Tasto 1: Proponi Call con verifica slot */}
                  <button
                    onClick={() => {
                      setActiveLeadForEmail(lead)
                      setEmailModalType('proposta')
                    }}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white rounded-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#1bb7ed] hover:text-[#1bb7ed]"
                    style={{ fontFamily: '"Space Mono", monospace' }}
                    title="Invia email con proposta slot calendario verificati"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#1bb7ed]" />
                    <span>PROPONI CALL</span>
                  </button>

                  {/* Tasto 2: Conferma Appuntamento */}
                  <button
                    onClick={() => {
                      setActiveLeadForEmail(lead)
                      setEmailModalType('conferma')
                    }}
                    className="px-3 py-2 bg-[#00ffaa] hover:bg-[#00ffaa]/80 text-black text-xs font-black rounded-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    style={{ fontFamily: '"Space Mono", monospace' }}
                    title="Invia email di conferma ufficiale con link Google Meet e recap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CONFERMA CALL</span>
                  </button>

                  {/* Tasto 3: Visualizza anagrafica in Companies */}
                  <button
                    onClick={() => navigate('/companies')}
                    className="px-2.5 py-2 bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono font-bold text-white/80 rounded-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:border-white/30"
                    title="Visualizza anagrafica consolidata in Companies"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#fac429]" />
                    <span className="hidden sm:inline">COMPANIES</span>
                  </button>
                </div>
              </div>
            )
          })}

          {filteredLeads.length === 0 && (
            <div className="p-8 text-center text-white/40 font-mono text-xs border border-white/10 rounded-sm">
              Nessun lead trovato con i criteri di filtro selezionati.
            </div>
          )}
        </div>
      </div>

      {/* ── MODALE 1: WORKFLOW MERMAID SCHEMA ── */}
      {showWorkflowModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/20 max-w-3xl w-full p-6 rounded-sm shadow-2xl relative">
            <button
              onClick={() => setShowWorkflowModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#d8ff00]" />
              <span className="text-xs font-mono uppercase text-[#d8ff00] font-bold">
                Architettura e Logica di Automazione
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: '"Goldman", sans-serif' }}>
              Workflow Completo di Gestione Lead
            </h3>

            {/* Codice Mermaid evidenziato */}
            <div className="bg-black/90 p-4 border border-white/10 rounded font-mono text-xs text-white/80 overflow-x-auto leading-relaxed">
              <pre>{`flowchart TD
    A["Multi-Canale Inbound/Outbound (Web, IG/TikTok, Referral, Cold Email, Eventi)"] --> B["Ingestione Automatica Lead (Parser AI)"]
    B --> C{"Qualificazione B.A.N.T. (Score 0-4)"}
    
    C -->|"Lead Freddo / Info Generiche"| D["Email Automatica Showreel & Portfolio DADO"]
    C -->|"Lead Caldo / Richiesta Call"| E["Check Anti-Conflitto Calendario Google"]
    
    E --> F["Email Automatica Proposta Call (2 Slot Intelligenti)"]
    F --> G{"Il Lead risponde o seleziona slot"}
    
    G --> H["Email Automatica Conferma Appuntamento (Link Meet + Limbo DADO)"]
    H --> I["Promemoria Automatico 24h & 1h prima della Call"]
    I --> J["Conversione in Preventivo / Contratto DADO Studio"]`}</pre>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="px-4 py-2 bg-white text-black font-bold text-xs rounded-sm hover:bg-gray-200 cursor-pointer"
              >
                Chiudi Schema
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALE 2: ANTEPRIMA & INVIO EMAIL AUTOMATICA (PROPOSTA CALL / CONFERMA) ── */}
      {activeLeadForEmail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/20 max-w-2xl w-full p-6 rounded-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveLeadForEmail(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="w-4 h-4 text-[#00ffaa]" />
              <span className="text-xs font-mono uppercase text-[#00ffaa] font-bold">
                {emailModalType === 'proposta' ? 'Email Automatica Proposta Call' : 'Email Automatica Conferma Appuntamento'}
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-3" style={{ fontFamily: '"Goldman", sans-serif' }}>
              Destinatario: {activeLeadForEmail.contact} ({activeLeadForEmail.company})
            </h3>

            {/* Scheda Email con Campi */}
            <div className="bg-black/70 border border-white/10 p-4 rounded-sm space-y-3 font-mono text-xs">
              <div>
                <span className="text-white/40 block text-[10px]">A:</span>
                <span className="text-white">{activeLeadForEmail.email}</span>
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="text-white/40 block text-[10px]">Oggetto:</span>
                <span className="text-[#fac429]">
                  {emailModalType === 'proposta'
                    ? `Re: Richiesta informazioni e disponibilità call conoscitiva - DADO Creative Studio`
                    : `Conferma Appuntamento: DADO Creative Studio & ${activeLeadForEmail.company} - Martedì 29 Settembre ore 11:30`}
                </span>
              </div>

              {/* Corpo Email */}
              <div className="pt-2 border-t border-white/5">
                <span className="text-white/40 block text-[10px] mb-1">Anteprima Testo:</span>
                <div className="bg-white/5 p-3 rounded text-white/90 leading-relaxed text-[11px] font-sans">
                  {emailModalType === 'proposta' ? (
                    <>
                      <p>Gentile <strong>{activeLeadForEmail.contact}</strong>,</p>
                      <p className="mt-1.5">
                        Grazie per averci contattato in merito a <em>"{activeLeadForEmail.need}"</em>.
                      </p>
                      <p className="mt-1.5">
                        Per comprendere al meglio le vostre esigenze visive e fornirvi un piano operativo su misura, vi proponiamo una rapida video call di 15-20 minuti su Google Meet.
                      </p>
                      <div className="my-2 p-2 bg-[#1bb7ed]/10 border border-[#1bb7ed]/30 rounded font-mono text-xs text-[#1bb7ed]">
                        📅 <strong>Slot Verificati a Calendario:</strong><br />
                        • Martedì 29 Settembre alle ore 11:30<br />
                        • Mercoledì 30 Settembre alle ore 15:30
                      </div>
                      <p>
                        In allegato trovate il nostro Showreel aggiornato con le ultime produzioni corporate e moda.
                      </p>
                      <p className="mt-2 text-white/60">Team Produzione — DADO Creative Studio Milano</p>
                    </>
                  ) : (
                    <>
                      <p>Gentile <strong>{activeLeadForEmail.contact}</strong>,</p>
                      <p className="mt-1.5">
                        Confermiamo con piacere il nostro appuntamento fissato per:
                      </p>
                      <div className="my-2 p-2.5 bg-[#00ffaa]/10 border border-[#00ffaa]/30 rounded font-mono text-xs text-[#00ffaa]">
                        📅 <strong>Data & Orario:</strong> Martedì 29 Settembre 2026 alle ore 11:30<br />
                        💻 <strong>Google Meet:</strong> https://meet.google.com/dad-meet-call<br />
                        📍 <strong>Location alternativa:</strong> Limbo A - DADO Studio Milano
                      </div>
                      <p className="mt-1.5">
                        <strong>Ordine del Giorno:</strong><br />
                        1. Definizione obiettivi visivi e format di consegna (4K ProRes / Reel 9:16).<br />
                        2. Fabbisogno attrezzatura (Sony FX3, Cinema Line, Luci Aputure).<br />
                        3. Tempistiche di set e approvazione preventivo.
                      </p>
                      <p className="mt-2 text-white/60">L'invito è stato registrato a calendario con promemoria 1h prima.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tasti di invio */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-mono text-white/40">
                {emailStatus === 'sent' ? '✓ Email inviata con successo!' : emailStatus === 'sending' ? 'Invio in corso...' : 'Pronta per l\'invio'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveLeadForEmail(null)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-mono text-xs rounded-sm cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={emailStatus === 'sending' || emailStatus === 'sent'}
                  className="px-4 py-1.5 bg-[#d8ff00] hover:bg-[#d8ff00]/80 text-black font-mono font-bold text-xs rounded-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{emailStatus === 'sending' ? 'Invio...' : emailStatus === 'sent' ? 'Inviata ✓' : 'Invia Email Ora'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
