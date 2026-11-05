import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PhoneCall,
  Video,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowUpRight,
  Plus,
  Search,
  Sparkles,
  User,
  Building2,
  FileText,
  TrendingUp,
  Filter,
  X,
  Check,
  PhoneIncoming,
  PhoneOutgoing,
} from 'lucide-react'

// Punti fondamentali: quelli inseriti a mano, altrimenti ricavati dai dati del verbale
function getKeyPoints(rep) {
  if (Array.isArray(rep.keyPoints) && rep.keyPoints.length) return rep.keyPoints
  const pts = String(rep.summary || '')
    .split(/(?<=[.!?])\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
  if (rep.estimatedBudget) pts.push(`Budget stimato: € ${Number(rep.estimatedBudget).toLocaleString('it-IT')}`)
  if (rep.equipmentDiscussed) pts.push(`Attrezzatura discussa: ${rep.equipmentDiscussed}`)
  if (rep.nextStep) pts.push(`Prossimo passo: ${rep.nextStep}${rep.nextActionDate ? ` (entro il ${rep.nextActionDate})` : ''}`)
  return pts
}

const INITIAL_CALL_REPORTS = [
  {
    id: 'cr-101',
    companyName: 'Fashion Brand Milano',
    sector: 'Moda & Luxury',
    referent: 'Matteo Colombo',
    role: 'Marketing & Creative Director',
    phone: '+39 02 8942 3310',
    date: '20/10/2026',
    time: '11:30',
    duration: '28 min',
    direction: 'inbound',
    channel: 'Google Meet',
    outcome: 'set_confirmed',
    outcomeLabel: 'Set Confermato',
    sentiment: 'Molto Positivo',
    estimatedBudget: 6800,
    summary:
      'Allineamento definitivo per lo shooting Lookbook Video Autunno/Inverno 4K HDR e pacchetto 12 Reel/TikTok verticali per la nuova Capsule Collection. Approvata la moodboard illuminotecnica.',
    equipmentDiscussed: 'RED V-Raptor 8K VV, Set Lenti Cooke Panchro, Kit Astera Titan Tube, Limbo Studio A',
    nextStep: 'Blocco date Sala Pose Limbo A (23–25 Ottobre) e invio conferma ordine firmata.',
    nextActionDate: '22/10/2026',
    owner: 'AleAmministratore',
  },
  {
    id: 'cr-102',
    companyName: 'Officine Meccaniche Riva',
    sector: 'Automotive / Meccanica',
    referent: 'Ing. Marco Riva',
    role: 'Amministratore Delegato',
    phone: '+39 030 375 9120',
    date: '19/10/2026',
    time: '16:15',
    duration: '35 min',
    direction: 'outbound',
    channel: 'Telefono Diretto',
    outcome: 'quote_requested',
    outcomeLabel: 'Preventivo Richiesto',
    sentiment: 'Positivo',
    estimatedBudget: 9200,
    summary:
      'Call tecnica post-sopralluogo nello stabilimento di Brescia. Il cliente richiede l’integrazione di riprese aeree indoor con drone FPV cinewhoop tra le linee robotizzate CNC e un cut da 60 secondi per lo stand Fiera MecSpe.',
    equipmentDiscussed: 'Sony FX6, Drone FPV Cinewhoop 4K, Drone DJI Inspire 3, Slider Motorizzato Edelkrone',
    nextStep: 'Inviare revisione preventivo comprensivo di piano di volo ENAC e assicurazione set industriale.',
    nextActionDate: '21/10/2026',
    owner: 'AleAmministratore',
  },
  {
    id: 'cr-103',
    companyName: 'NextMedia Agency',
    sector: 'Digital & Media Agency',
    referent: 'Sara Moretti',
    role: 'Head of Production',
    phone: '+39 348 772 1904',
    date: '18/10/2026',
    time: '10:00',
    duration: '22 min',
    direction: 'inbound',
    channel: 'WhatsApp Call',
    outcome: 'set_confirmed',
    outcomeLabel: 'Set Confermato',
    sentiment: 'Molto Positivo',
    estimatedBudget: 5000,
    summary:
      'Richiesta disponibilità troupe completa in white-label per due giornate di riprese corporate più interviste executive con gobbo elettronico (teleprompter) presso l’headquarter di Milano Porta Nuova.',
    equipmentDiscussed: '2x Sony FX3, Teleprompter iPad Pro, Kit Audio Sennheiser MKH-416 + Lav DJI Mic 2, Aputure 600d Pro',
    nextStep: 'Confermare call sheet oraria e lista accrediti targa furgone produzione.',
    nextActionDate: '24/10/2026',
    owner: 'Laura R.',
  },
  {
    id: 'cr-104',
    companyName: 'Kroma Ceramiche',
    sector: 'Arredo & Design Superfici',
    referent: 'Arch. Paolo Ferri',
    role: 'Art Director',
    phone: '+39 0536 884 210',
    date: '16/10/2026',
    time: '14:45',
    duration: '40 min',
    direction: 'outbound',
    channel: 'Google Meet',
    outcome: 'followup_scheduled',
    outcomeLabel: 'Follow-up Programmato',
    sentiment: 'Positivo',
    estimatedBudget: 6100,
    summary:
      'Presentazione pipeline mista CGI + riprese reali per il Catalogo Arredo Bagno 2027. L’Arch. Ferri ha apprezzato i test di resa materica sulle lastre in gres porcellanato.',
    equipmentDiscussed: 'Hasselblad X2D 100C, Broncolor Siros 800S, Stazione Workstation Rendering 3D',
    nextStep: 'Call di chiusura budget con l’ufficio acquisti fissata per mercoledì prossimo.',
    nextActionDate: '25/10/2026',
    owner: 'AleAmministratore',
  },
  {
    id: 'cr-105',
    companyName: 'Cantine San Biagio Wine & Resort',
    sector: 'Wine & Luxury Resort',
    referent: 'Dott. Tommaso Marchetti',
    role: 'Direttore Ospitalità & Brand',
    phone: '+39 045 683 1190',
    date: '15/10/2026',
    time: '17:30',
    duration: '19 min',
    direction: 'inbound',
    channel: 'Telefono Diretto',
    outcome: 'quote_requested',
    outcomeLabel: 'Preventivo Richiesto',
    sentiment: 'Molto Positivo',
    estimatedBudget: 6200,
    summary:
      'Il cliente desidera realizzare un docufilm emozionale dedicato all’esperienza degustazione e suite resort in Valpolicella, con riprese al tramonto sui vigneti e focus in cantina.',
    equipmentDiscussed: 'Sony Burano / FX6, DJI Mavic 3 Pro Cine, Gimbal DJI RS4 Pro, Kit Luci Calde Nanlite',
    nextStep: 'Preparare proposta creativa con 2 opzioni di budget (1 giornata vs 2 giornate con modelli).',
    nextActionDate: '22/10/2026',
    owner: 'AleAmministratore',
  },
  {
    id: 'cr-106',
    companyName: 'Aura Design & Architettura',
    sector: 'Architettura & Interior',
    referent: 'Arch. Federico Longo',
    role: 'Founder & Senior Architect',
    phone: '+39 02 657 8841',
    date: '14/10/2026',
    time: '12:00',
    duration: '25 min',
    direction: 'outbound',
    channel: 'Google Meet',
    outcome: 'waiting_feedback',
    outcomeLabel: 'In Attesa Feedback',
    sentiment: 'Neutro / Valutazione',
    estimatedBudget: 4800,
    summary:
      'Revisionato il preventivo per lo shooting fotografico architettonico e video tour di 3 attici ristrutturati in zona Brera. In attesa dei permessi dei proprietari per fissare i giorni di ripresa.',
    equipmentDiscussed: 'Sony A7R V + Lenti Tilt-Shift 17mm e 24mm, Gimbal RS4, Luci Astera FP1',
    nextStep: 'Ricontattare l’Arch. Longo appena riceve il via libera dai committenti.',
    nextActionDate: '27/10/2026',
    owner: 'Laura R.',
  },
]

const OUTCOME_BADGES = {
  set_confirmed: {
    label: 'Set Confermato',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.14)',
    border: 'rgba(16, 185, 129, 0.4)',
  },
  quote_requested: {
    label: 'Preventivo Richiesto',
    color: '#fac429',
    bg: 'rgba(250, 196, 41, 0.14)',
    border: 'rgba(250, 196, 41, 0.4)',
  },
  followup_scheduled: {
    label: 'Follow-up Programmato',
    color: '#fc6e28',
    bg: 'rgba(252, 110, 40, 0.15)',
    border: 'rgba(252, 110, 40, 0.45)',
  },
  waiting_feedback: {
    label: 'In Attesa Feedback',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.14)',
    border: 'rgba(56, 189, 248, 0.4)',
  },
}

const STORAGE_KEY = 'dado_call_reports_v1'

export default function CallReports() {
  const navigate = useNavigate()

  const [transcriptDraft, setTranscriptDraft] = useState('')
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return INITIAL_CALL_REPORTS
  })

  const [selectedOutcome, setSelectedOutcome] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  const [newForm, setNewForm] = useState({
    companyName: '',
    sector: '',
    referent: '',
    role: 'Referente Commerciale / Marketing',
    phone: '',
    duration: '20 min',
    channel: 'Telefono Diretto',
    direction: 'outbound',
    outcome: 'quote_requested',
    estimatedBudget: '',
    summary: '',
    equipmentDiscussed: '',
    nextStep: '',
    nextActionDate: '',
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
    } catch {}
  }, [reports])

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchOutcome = selectedOutcome === 'all' || r.outcome === selectedOutcome
      const q = searchQuery.trim().toLowerCase()
      const matchSearch =
        !q ||
        r.companyName.toLowerCase().includes(q) ||
        r.referent.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        (r.equipmentDiscussed || '').toLowerCase().includes(q)
      return matchOutcome && matchSearch
    })
  }, [reports, selectedOutcome, searchQuery])

  const kpis = useMemo(() => {
    const total = reports.length
    const confirmed = reports.filter((r) => r.outcome === 'set_confirmed').length
    const quotes = reports.filter((r) => r.outcome === 'quote_requested').length
    const totalBudget = reports.reduce((acc, r) => acc + (Number(r.estimatedBudget) || 0), 0)
    return { total, confirmed, quotes, totalBudget }
  }, [reports])

  const handleAddReport = (e) => {
    e.preventDefault()
    if (!newForm.companyName.trim() || !newForm.summary.trim()) return
    const badge = OUTCOME_BADGES[newForm.outcome] || OUTCOME_BADGES.quote_requested
    const now = new Date()
    const created = {
      id: `cr-${Date.now()}`,
      companyName: newForm.companyName.trim(),
      sector: newForm.sector.trim() || 'Cliente B2B',
      referent: newForm.referent.trim() || 'Referente Aziendale',
      role: newForm.role.trim() || 'Responsabile Progetto',
      phone: newForm.phone.trim() || '+39 02 000000',
      date: now.toLocaleDateString('it-IT'),
      time: now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      duration: newForm.duration || '20 min',
      direction: newForm.direction,
      channel: newForm.channel,
      outcome: newForm.outcome,
      outcomeLabel: badge.label,
      sentiment: 'Positivo',
      estimatedBudget: Number(newForm.estimatedBudget) || 3500,
      summary: newForm.summary.trim(),
      equipmentDiscussed: newForm.equipmentDiscussed.trim() || 'Kit Produzione Video 4K DADO Studio',
      nextStep: newForm.nextStep.trim() || 'Inviare recap e preventivo dedicato.',
      nextActionDate:
        newForm.nextActionDate.trim() ||
        new Date(Date.now() + 3 * 86400000).toLocaleDateString('it-IT'),
      owner: 'AleAmministratore',
      transcript: (newForm.transcript || '').trim(),
      keyPoints: (newForm.keyPointsText || '').split('\n').map((t) => t.trim()).filter(Boolean),
    }
    setReports((prev) => [created, ...prev])
    setShowNewModal(false)
    setNewForm({
      companyName: '',
      sector: '',
      referent: '',
      role: 'Referente Commerciale / Marketing',
      phone: '',
      duration: '20 min',
      channel: 'Telefono Diretto',
      direction: 'outbound',
      outcome: 'quote_requested',
      estimatedBudget: '',
      summary: '',
      equipmentDiscussed: '',
      nextStep: '',
      nextActionDate: '',
      transcript: '',
      keyPointsText: '',
    })
  }

  const saveTranscript = (id) => {
    const text = transcriptDraft.trim()
    if (!text) return
    setReports((prev) => prev.map((x) => (x.id === id ? { ...x, transcript: text } : x)))
    setSelectedReport((prev) => (prev && prev.id === id ? { ...prev, transcript: text } : prev))
    setTranscriptDraft('')
  }

  return (
    <div
      className="h-full flex-1 min-h-0 overflow-y-auto bg-[#111111] text-white p-4 md:p-8 selection:bg-[#fc6e28] selection:text-white custom-popup-scrollbar"
      style={{ fontFamily: '"Switzer", sans-serif' }}
    >
      {/* ── BARRA DI NAVIGAZIONE RAPIDA NEXT ACTIONS ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer"
        >
          <ArrowLeft size={15} className="text-[#fc6e28]" />
          <span>Torna alla Dashboard</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/call-reports"
            className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white shadow-md transition-all"
            style={{
              background: 'linear-gradient(180deg, #fd7430 0%, #f96720 100%)',
              boxShadow: '0 0 16px rgba(252, 110, 40, 0.4)',
            }}
          >
            1. Call Reports
          </Link>
          <Link
            to="/leads"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 transition-all"
          >
            2. Leads
          </Link>
          <Link
            to="/opportunities"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 transition-all"
          >
            3. New Opportunities
          </Link>
        </div>
      </div>

      {/* ── HEADER PRINCIPALE CALL REPORTS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-7 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#fc6e28] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#fc6e28]">
              DADO STUDIO COMMERCIAL & SET BRIEFING
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <PhoneCall className="w-7 h-7 text-[#fc6e28]" />
            <span>CALL REPORTS</span>
          </h1>
          <p className="text-xs md:text-sm text-white/60 mt-1 max-w-2xl">
            Registro strutturato delle call commerciali, briefing tecnici di pre-produzione, attrezzatura discussa col cliente e prossime azioni operative.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(180deg, #fd7430 0%, #f96720 100%)',
              boxShadow: '0 8px 24px -6px rgba(252, 110, 40, 0.5)',
            }}
          >
            <Plus size={16} />
            <span>Nuovo Call Report</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS BAR ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
        <div className="bg-white/[0.04] border border-white/10 p-4 rounded-xl">
          <div className="text-[11px] font-bold text-white/50 uppercase">Call Registrate</div>
          <div className="text-2xl font-black mt-1 text-white">{kpis.total}</div>
          <div className="text-[11px] text-[#fc6e28] mt-0.5 font-semibold">Briefing & Follow-up attivi</div>
        </div>
        <div className="bg-white/[0.04] border border-white/10 p-4 rounded-xl">
          <div className="text-[11px] font-bold text-white/50 uppercase">Set Confermati da Call</div>
          <div className="text-2xl font-black mt-1 text-[#10b981]">{kpis.confirmed}</div>
          <div className="text-[11px] text-[#10b981]/70 mt-0.5 font-semibold">Pronti per produzione</div>
        </div>
        <div className="bg-white/[0.04] border border-white/10 p-4 rounded-xl">
          <div className="text-[11px] font-bold text-white/50 uppercase">Preventivi Richiesti</div>
          <div className="text-2xl font-black mt-1 text-[#fac429]">{kpis.quotes}</div>
          <div className="text-[11px] text-[#fac429]/70 mt-0.5 font-semibold">In fase di quotazione</div>
        </div>
        <div className="bg-white/[0.04] border border-white/10 p-4 rounded-xl">
          <div className="text-[11px] font-bold text-white/50 uppercase">Volume Trattato in Call</div>
          <div className="text-2xl font-black mt-1 text-white">
            € {kpis.totalBudget.toLocaleString('it-IT')}
          </div>
          <div className="text-[11px] text-sky-400 mt-0.5 font-semibold">Valore commesse discusse</div>
        </div>
      </div>

      {/* ── BARRA FILTRI E RICERCA ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase text-white/40 mr-1 flex items-center gap-1">
            <Filter size={12} /> Esito Call:
          </span>
          <button
            type="button"
            onClick={() => setSelectedOutcome('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedOutcome === 'all'
                ? 'bg-[#fc6e28] text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Tutte ({reports.length})
          </button>
          {Object.entries(OUTCOME_BADGES).map(([key, cfg]) => {
            const count = reports.filter((r) => r.outcome === key).length
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedOutcome(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  selectedOutcome === key
                    ? 'text-white'
                    : 'bg-white/5 text-white/70 border-transparent hover:bg-white/10'
                }`}
                style={
                  selectedOutcome === key
                    ? { backgroundColor: cfg.bg, borderColor: cfg.color, color: cfg.color }
                    : undefined
                }
              >
                {cfg.label} ({count})
              </button>
            )
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca azienda, referente o attrezzatura..."
            className="w-full bg-black/60 border border-white/15 pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/35 focus:outline-hidden focus:border-[#fc6e28] rounded-xl"
          />
        </div>
      </div>

      {/* ── LISTA SCHEDE CALL REPORTS ── */}
      <div className="space-y-4 pb-10">
        {filteredReports.map((rep) => {
          const badge = OUTCOME_BADGES[rep.outcome] || OUTCOME_BADGES.quote_requested
          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReport(rep)}
              className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-[#fc6e28]/50 rounded-2xl p-5 transition-all cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                      style={{
                        color: badge.color,
                        backgroundColor: badge.bg,
                        borderColor: badge.border,
                      }}
                    >
                      <CheckCircle2 size={12} />
                      {badge.label}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-white/80">
                      {rep.direction === 'inbound' ? (
                        <PhoneIncoming size={11} className="text-emerald-400" />
                      ) : (
                        <PhoneOutgoing size={11} className="text-[#fc6e28]" />
                      )}
                      {rep.channel}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs text-white/50 font-medium">
                      <Calendar size={12} /> {rep.date} ore {rep.time}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs text-white/50 font-medium">
                      <Clock size={12} /> {rep.duration}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <h3 className="text-lg font-black text-white">{rep.companyName}</h3>
                    <span className="text-xs font-semibold text-[#fc6e28]">{rep.sector}</span>
                    <span className="text-xs text-white/50">
                      • Referente: <strong className="text-white/90">{rep.referent}</strong> ({rep.role}) — {rep.phone}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-white/80 mt-2.5 leading-relaxed">
                    {rep.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-white/10 text-xs">
                    <div className="bg-black/40 border border-white/5 rounded-xl px-3 py-2">
                      <span className="text-[10px] font-bold uppercase text-white/40 block">
                        Setup / Attrezzatura Discussa in Call
                      </span>
                      <span className="text-amber-300 font-semibold mt-0.5 block">
                        {rep.equipmentDiscussed}
                      </span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-xl px-3 py-2">
                      <span className="text-[10px] font-bold uppercase text-white/40 block">
                        Prossima Azione ({rep.nextActionDate})
                      </span>
                      <span className="text-emerald-300 font-semibold mt-0.5 block">
                        {rep.nextStep}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Colonna Destra: Budget & Azioni Rapide */}
                <div
                  className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 lg:pl-4 lg:border-l border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] font-bold uppercase text-white/40 block">
                      Budget Stimato
                    </span>
                    <span className="text-xl font-black text-[#fac429]">
                      € {Number(rep.estimatedBudget || 0).toLocaleString('it-IT')}
                    </span>
                    <span className="text-[11px] text-white/45 block">
                      Gestito da {rep.owner}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/opportunities')}
                      className="px-3 py-1.5 rounded-xl bg-[#9549f3]/20 hover:bg-[#9549f3]/35 border border-[#9549f3]/50 text-xs font-bold text-purple-200 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Apri in Opportunities</span>
                      <ArrowUpRight size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/companies')}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-xs font-bold text-white/80 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Building2 size={13} />
                      <span>Scheda Azienda</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── MODALE DETTAGLIO CALL REPORT ── */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-[#fc6e28]/60 bg-[#14161a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#fc6e28]">
                  Verbale Call Commerciale • {selectedReport.date} ({selectedReport.time})
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {selectedReport.companyName}
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Referente: <strong className="text-white">{selectedReport.referent}</strong> ({selectedReport.role}) • {selectedReport.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 my-5 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <div className="text-[10px] font-bold uppercase text-white/40 mb-1">
                  Sintesi Completa del Colloquio
                </div>
                <p className="text-sm text-white/90 leading-relaxed">{selectedReport.summary}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <div className="text-[10px] font-bold uppercase text-white/40 mb-2">
                  Punti fondamentali della call
                </div>
                <ul className="space-y-1.5 list-disc pl-4 text-xs text-white/90 leading-relaxed">
                  {getKeyPoints(selectedReport).map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <div className="text-[10px] font-bold uppercase text-white/40 mb-2">
                  Trascrizione della call
                </div>
                {selectedReport.transcript ? (
                  <p className="text-xs text-white/85 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto" style={{ overflowWrap: 'anywhere' }}>
                    {selectedReport.transcript}
                  </p>
                ) : (
                  <div>
                    <p className="text-[11px] text-white/50 mb-2">
                      Nessuna trascrizione salvata per questa call. Incolla qui il testo per archiviarlo.
                    </p>
                    <textarea
                      rows={4}
                      value={transcriptDraft}
                      onChange={(e) => setTranscriptDraft(e.target.value)}
                      placeholder="Incolla la trascrizione della call..."
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-hidden focus:border-[#fc6e28]"
                    />
                    <button
                      type="button"
                      onClick={() => saveTranscript(selectedReport.id)}
                      className="mt-2 px-3.5 py-1.5 rounded-xl bg-[#fc6e28] hover:bg-[#ff8142] text-white text-xs font-black cursor-pointer"
                    >
                      Salva trascrizione
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-white/40">Canale & Durata</div>
                  <div className="text-xs font-bold text-white mt-1">
                    {selectedReport.channel} • {selectedReport.duration}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase text-white/40">Budget Stimato</div>
                  <div className="text-sm font-black text-[#fac429] mt-1">
                    € {Number(selectedReport.estimatedBudget || 0).toLocaleString('it-IT')}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <div className="text-[10px] font-bold uppercase text-white/40 mb-1">
                  Attrezzatura & Set Richiesti
                </div>
                <p className="text-xs font-semibold text-amber-300">
                  {selectedReport.equipmentDiscussed}
                </p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5">
                <div className="text-[10px] font-bold uppercase text-emerald-300 mb-1">
                  Prossima Azione Operativa (Scadenza: {selectedReport.nextActionDate})
                </div>
                <p className="text-xs font-bold text-white">{selectedReport.nextStep}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setSelectedReport(null)
                  navigate('/opportunities')
                }}
                className="px-4 py-2 rounded-xl bg-[#9549f3] hover:bg-[#a855f7] text-white text-xs font-black transition-all cursor-pointer"
              >
                Converti / Apri in New Opportunities
              </button>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALE NUOVO CALL REPORT ── */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[#fc6e28] bg-[#14161a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-5 h-5 text-[#fc6e28]" />
                <h3 className="text-base font-black text-white">Registra Nuovo Call Report</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReport} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#fc6e28] uppercase mb-1">
                    Azienda / Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Fashion Brand Milano"
                    value={newForm.companyName}
                    onChange={(e) => setNewForm({ ...newForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-hidden focus:border-[#fc6e28]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase mb-1">
                    Referente Contattato *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Matteo Colombo"
                    value={newForm.referent}
                    onChange={(e) => setNewForm({ ...newForm, referent: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-hidden focus:border-[#fc6e28]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase mb-1">
                    Canale Call
                  </label>
                  <select
                    value={newForm.channel}
                    onChange={(e) => setNewForm({ ...newForm, channel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-hidden focus:border-[#fc6e28]"
                  >
                    <option value="Telefono Diretto">Telefono Diretto</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="WhatsApp Call">WhatsApp Call</option>
                    <option value="Zoom">Zoom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase mb-1">
                    Esito Call
                  </label>
                  <select
                    value={newForm.outcome}
                    onChange={(e) => setNewForm({ ...newForm, outcome: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-hidden focus:border-[#fc6e28]"
                  >
                    <option value="set_confirmed">Set Confermato</option>
                    <option value="quote_requested">Preventivo Richiesto</option>
                    <option value="followup_scheduled">Follow-up Programmato</option>
                    <option value="waiting_feedback">In Attesa Feedback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase mb-1">
                    Budget Stimato (€)
                  </label>
                  <input
                    type="number"
                    placeholder="Es. 5000"
                    value={newForm.estimatedBudget}
                    onChange={(e) => setNewForm({ ...newForm, estimatedBudget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-hidden focus:border-[#fc6e28]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#fc6e28] uppercase mb-1">
                  Sintesi del Colloquio / Report *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Riassumi i punti chiave emersi durante la call..."
                  value={newForm.summary}
                  onChange={(e) => setNewForm({ ...newForm, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-hidden focus:border-[#fc6e28]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase mb-1">
                  Punti fondamentali (uno per riga, facoltativo)
                </label>
                <textarea
                  rows={3}
                  value={newForm.keyPointsText || ''}
                  onChange={(e) => setNewForm({ ...newForm, keyPointsText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-hidden focus:border-[#fc6e28]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase mb-1">
                  Trascrizione della call (facoltativa)
                </label>
                <textarea
                  rows={4}
                  value={newForm.transcript || ''}
                  onChange={(e) => setNewForm({ ...newForm, transcript: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-hidden focus:border-[#fc6e28]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase mb-1">
                    Attrezzatura / Set Discusso
                  </label>
                  <input
                    type="text"
                    placeholder="Es. Sony FX6, Drone, Limbo A..."
                    value={newForm.equipmentDiscussed}
                    onChange={(e) => setNewForm({ ...newForm, equipmentDiscussed: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-hidden focus:border-[#fc6e28]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase mb-1">
                    Prossimo Step Operativo
                  </label>
                  <input
                    type="text"
                    placeholder="Es. Inviare preventivo entro venerdì"
                    value={newForm.nextStep}
                    onChange={(e) => setNewForm({ ...newForm, nextStep: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-hidden focus:border-[#fc6e28]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#fc6e28] hover:bg-[#fd7430] text-white font-black cursor-pointer"
                >
                  Salva Call Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
