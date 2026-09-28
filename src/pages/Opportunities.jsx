import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  BarChart3,
  Layers,
  X,
  Sparkles,
  Info,
  Radio,
  Zap,
  Activity,
  RefreshCw,
  Mail,
  ShieldCheck,
  Cpu
} from 'lucide-react'

// ── TRE COLORI DISTINTI (ESCLUSI DALLA SEZIONE SETTINGS) ──────
// Aperte: Blu Zaffiro Elettrico (#3b82f6)
// Vinte: Smeraldo Intenso (#10b981)
// Perse: Lampone / Rubino (#f43f5e)
const STATUS_CONFIG = {
  open: {
    label: 'Trattative Aperte',
    shortLabel: 'Aperte',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.14)',
    border: 'rgba(59, 130, 246, 0.45)',
    glow: 'rgba(59, 130, 246, 0.25)',
    icon: Clock,
  },
  won: {
    label: 'Trattative Vinte',
    shortLabel: 'Vinte',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.14)',
    border: 'rgba(16, 185, 129, 0.45)',
    glow: 'rgba(16, 185, 129, 0.25)',
    icon: CheckCircle2,
  },
  lost: {
    label: 'Trattative Perse',
    shortLabel: 'Perse',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.14)',
    border: 'rgba(244, 63, 94, 0.45)',
    glow: 'rgba(244, 63, 94, 0.25)',
    icon: XCircle,
  },
}

// ── DATASET STORICO TRATTATIVE CON DATE VERIFICATE NEL CORSO DEI MESI ──
const INITIAL_OPPORTUNITIES = [
  // ── SETTEMBRE 2026 ──────────────────────────────────────────
  {
    id: 'opp-sep-02',
    month: '2026-09',
    date: '2026-09-02',
    company: 'Nexura Tech Solutions',
    title: 'Teaser Lancio Nuova App AI',
    value: 2900,
    status: 'open',
    stage: 'Bozza preventivo',
    notes: 'Primo contatto per video promozionale e spiegazione interfaccia.',
    materials: 'Microfoni Sennheiser AVX, Sony FX3',
    owner: 'Matteo'
  },
  {
    id: 'opp-sep-05',
    month: '2026-09',
    date: '2026-09-05',
    company: 'Vogue Events & Wedding',
    title: 'Allestimento & Regia Video Villa Cora',
    value: 6500,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Matrimonio luxury con copertura foto/video continua, drone e luci architetturali.',
    materials: 'Sony FX3 + A7SIII, Drone Mavic 3 Cine',
    owner: 'Andrea'
  },
  {
    id: 'opp-sep-06',
    month: '2026-09',
    date: '2026-09-06',
    company: 'Studio Legale Associato Milano',
    title: 'Corporate Profile Video 4K',
    value: 3800,
    status: 'lost',
    stage: 'Budget congelato',
    notes: 'Decisione del consiglio rimandata al 2027 per revisione bilancio.',
    materials: 'Kit interviste 4K ProRes',
    owner: 'Matteo'
  },
  {
    id: 'opp-sep-08',
    month: '2026-09',
    date: '2026-09-08',
    company: 'Kroma Ceramiche',
    title: 'Rendering 3D Catalogo Bagno 2027',
    value: 5400,
    status: 'open',
    stage: 'Preventivo inviato',
    notes: 'Invio bozze e preventivo dettagliato per 14 ambientazioni fotorealistiche.',
    materials: 'Rendering 3D set, Foto still life',
    owner: 'Andrea'
  },
  {
    id: 'opp-sep-10',
    month: '2026-09',
    date: '2026-09-10',
    company: 'Kroma Ceramiche',
    title: 'Shooting Set Limbo A - Campionature',
    value: 5400,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Accordo firmato per 2 giorni di riprese consecutive in studio DADO.',
    materials: 'Sony 70-200mm GM, Aputure 300x, Diffusori seta',
    owner: 'Andrea'
  },
  {
    id: 'opp-sep-12',
    month: '2026-09',
    date: '2026-09-12',
    company: 'Solaris Green Energy',
    title: 'Spot TV Parco Brenta + Digital Ads',
    value: 8100,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Accordo chiuso con cessione diritti TV locali per 12 mesi.',
    materials: 'Sony A7SIII, Gimbal RS3 Pro, Drone Mavic 3',
    owner: 'Andrea'
  },
  {
    id: 'opp-sep-14',
    month: '2026-09',
    date: '2026-09-14',
    company: 'E-Commerce Fashion Hub',
    title: 'Pacchetto 30 Reels TikTok & Stories',
    value: 4000,
    status: 'lost',
    stage: 'Rifiutato per prezzo',
    notes: 'Cliente ha scelto gestione interna con smartphone e montaggio generico.',
    materials: 'Video verticali 9:16',
    owner: 'Matteo'
  },
  {
    id: 'opp-sep-15',
    month: '2026-09',
    date: '2026-09-15',
    company: 'Beta Digital Agency',
    title: 'Pacchetto 12 Video TikTok/Reels',
    value: 4800,
    status: 'open',
    stage: 'In attesa feedback',
    notes: 'Trattativa avanzata per fornitura continuativa mensile.',
    materials: 'Sony FX3, Nanlite Pavotube II neon',
    owner: 'Matteo'
  },
  {
    id: 'opp-sep-18',
    month: '2026-09',
    date: '2026-09-18',
    company: 'Alpha Studio Milano',
    title: 'Shooting Moda Fall/Winter 2026',
    value: 7500,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Limbo A confermato con kit luci Aputure 600d e ottiche 85mm GM.',
    materials: 'Aputure 600d Pro, Softbox Octa 120cm, Sony 85mm GM',
    owner: 'Andrea'
  },
  {
    id: 'opp-sep-18-2',
    month: '2026-09',
    date: '2026-09-18',
    company: 'Officine Meccaniche Riva',
    title: 'Video Corporate Industriale Stabilimento',
    value: 9200,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Firma digitale qualificata PEC. Produzione 4K ProRes e drone indoor.',
    materials: 'Sony FX3, 24-70mm GM II, Drone Mavic 3 Cine',
    owner: 'Andrea'
  },
  {
    id: 'opp-sep-20',
    month: '2026-09',
    date: '2026-09-20',
    company: 'Alpha Studio Milano',
    title: 'Campagna Accessori & Pelletteria',
    value: 7500,
    status: 'open',
    stage: 'In negoziazione',
    notes: 'Bozza secondo lotto in discussione dopo il successo della sessione principale.',
    materials: 'Foto still life, Luce continua',
    owner: 'Matteo'
  },
  {
    id: 'opp-sep-22',
    month: '2026-09',
    date: '2026-09-22',
    company: 'Solaris Green Energy',
    title: 'Video Interviste Board ESG',
    value: 4500,
    status: 'open',
    stage: 'In definizione',
    notes: 'Possibile estensione collegata all\'inaugurazione del nuovo impianto agrivoltaico.',
    materials: 'Kit audio wireless, 2 Cam FX3/A7SIII',
    owner: 'Andrea'
  },
  {
    id: 'opp-sep-23',
    month: '2026-09',
    date: '2026-09-23',
    company: 'Pharma Nord Italia',
    title: 'Docufilm Istituzionale Ricerca',
    value: 10000,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Accordo siglato per docufilm 4K e valorizzazione laboratori R&D.',
    materials: 'Docufilm 4K, Color grading DaVinci',
    owner: 'Matteo'
  },
  {
    id: 'opp-sep-24',
    month: '2026-09',
    date: '2026-09-24',
    company: 'Officine Meccaniche Riva',
    title: 'Teaser 60s Fiera MecSpe',
    value: 9200,
    status: 'open',
    stage: 'Preventivo in scadenza',
    notes: 'Preventivo speciale da confermare per bloccare le date di montaggio rapido.',
    materials: 'Cut 60s LinkedIn + Master ProRes',
    owner: 'Andrea'
  },
  {
    id: 'opp-sep-26',
    month: '2026-09',
    date: '2026-09-26',
    company: 'Gusto & Tradizione Food',
    title: '10 Video Ricette Chef Stellato',
    value: 3600,
    status: 'open',
    stage: 'Preventivo inviato',
    notes: 'In attesa di definizione calendario chiusura cucina pomeridiana.',
    materials: 'Food photography, Sony 85mm GM',
    owner: 'Andrea'
  },
  {
    id: 'opp-sep-28',
    month: '2026-09',
    date: '2026-09-28',
    company: 'Tenuta Poggio Antico',
    title: 'Docufilm Vendemmia & Nuovo Brunello',
    value: 3200,
    status: 'open',
    stage: 'Ultimo preventivo',
    notes: 'In approvazione finale da parte della proprietà per shooting bottiglie.',
    materials: 'Riprese tramonto filari, drone',
    owner: 'Andrea'
  },

  // ── AGOSTO 2026 ─────────────────────────────────────────────
  {
    id: 'opp-aug-04',
    month: '2026-08',
    date: '2026-08-04',
    company: 'Tenuta Poggio Antico',
    title: 'Shooting Filari Tramonto & Cantina',
    value: 3200,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Confermato slot serale di 3 ore in golden hour a Montalcino.',
    materials: 'Sony FX3, Mavic 3 Cine, Filtri ND',
    owner: 'Andrea'
  },
  {
    id: 'opp-aug-11',
    month: '2026-08',
    date: '2026-08-11',
    company: 'Consorzio Vini Chianti',
    title: 'Spot TV Promozione Estiva',
    value: 4100,
    status: 'lost',
    stage: 'Budget insufficiente',
    notes: 'Richiesta di ribasso del 40% non compatibile con standard qualitativi DADO.',
    materials: 'Spot TV broadcast',
    owner: 'Matteo'
  },
  {
    id: 'opp-aug-14',
    month: '2026-08',
    date: '2026-08-14',
    company: 'Tenuta Poggio Antico',
    title: 'Shooting Bottiglie & Nuova Annata',
    value: 3200,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Completata sessione etichette e bottiglie con luce naturale.',
    materials: 'Sony 85mm GM, Pannelli riflettenti',
    owner: 'Andrea'
  },
  {
    id: 'opp-aug-20',
    month: '2026-08',
    date: '2026-08-20',
    company: 'Ristorante Mare Chiaro',
    title: 'Video Menu Gourmet & Chef',
    value: 2400,
    status: 'lost',
    stage: 'Annullato dal cliente',
    notes: 'Ristrutturazione locale prolungata fino a ottobre.',
    materials: 'Video food',
    owner: 'Matteo'
  },
  {
    id: 'opp-aug-28',
    month: '2026-08',
    date: '2026-08-28',
    company: 'Gusto & Tradizione Food',
    title: 'Food Photography & Video Master',
    value: 3600,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Sessione pomeridiana 15:00 - 20:30 a cucina chiusa.',
    materials: 'Sony 85mm macro, Aputure 300x',
    owner: 'Andrea'
  },

  // ── LUGLIO 2026 ─────────────────────────────────────────────
  {
    id: 'opp-jul-02',
    month: '2026-07',
    date: '2026-07-02',
    company: 'Nexura Tech Solutions',
    title: 'Brand Identity Video & Teaser',
    value: 2900,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Shooting coworking Copernico Isola Milano.',
    materials: 'Sony FX3, Gimbal RS3 Pro',
    owner: 'Matteo'
  },
  {
    id: 'opp-jul-15',
    month: '2026-07',
    date: '2026-07-15',
    company: 'FinTech Startup Milano',
    title: 'Pitch Video Investitori Series A',
    value: 3500,
    status: 'lost',
    stage: 'Progetto rimandato',
    notes: 'Round di finanziamento posticipato a novembre 2026.',
    materials: 'Interviste founder',
    owner: 'Andrea'
  },
  {
    id: 'opp-jul-22',
    month: '2026-07',
    date: '2026-07-22',
    company: 'Nexura Tech Solutions',
    title: 'Teaser Lancio Piattaforma',
    value: 2900,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Consegna master 4K approvata.',
    materials: 'ProRes 422',
    owner: 'Matteo'
  },

  // ── GIUGNO 2026 ─────────────────────────────────────────────
  {
    id: 'opp-jun-12',
    month: '2026-06',
    date: '2026-06-12',
    company: 'Atelier Sposa Bellissima',
    title: 'Shooting Catalogo Cartaceo Alta Moda',
    value: 4200,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Giornata intera 09:00 - 18:00 all\'atelier di Torino.',
    materials: 'Sony 85mm GM, Luci continue con lanterna',
    owner: 'Andrea'
  },
  {
    id: 'opp-jun-18',
    month: '2026-06',
    date: '2026-06-18',
    company: 'Luxury Hotel Lake Como',
    title: 'Video Esperienziale Suite & SPA',
    value: 5500,
    status: 'lost',
    stage: 'Trattativa interrotta',
    notes: 'Richiesta di permessi riprese drone non ottenuta in tempo dalle autorità.',
    materials: 'Drone + Gimbal',
    owner: 'Andrea'
  },
  {
    id: 'opp-jun-30',
    month: '2026-06',
    date: '2026-06-30',
    company: 'Atelier Sposa Bellissima',
    title: 'Campagna Instagram & Lookbook',
    value: 4200,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Completamento prima tranche semestrale.',
    materials: 'High-res photography',
    owner: 'Andrea'
  },

  // ── MAGGIO 2026 ─────────────────────────────────────────────
  {
    id: 'opp-may-05',
    month: '2026-05',
    date: '2026-05-05',
    company: 'Green Mobility Roma',
    title: 'Video Testimonial Flotta Sharing',
    value: 2200,
    status: 'lost',
    stage: 'Non aggiudicato',
    notes: 'Logistica di trasferta a Roma non conveniente per il cliente.',
    materials: 'Action cam + Gimbal',
    owner: 'Matteo'
  },
  {
    id: 'opp-may-12',
    month: '2026-05',
    date: '2026-05-12',
    company: 'Urban Mobility Bike',
    title: 'Spot Bici Elettrica 2026',
    value: 1500,
    status: 'won',
    stage: 'Contratto firmato',
    notes: 'Sessione alba 06:30 - 09:30 strade vuote CityLife Milano.',
    materials: 'Sony FX3 su e-cargo, Action cam 4K',
    owner: 'Andrea'
  }
]

const MONTHS_LIST = [
  { key: '2026-09', label: 'Settembre 2026', short: 'Settembre' },
  { key: '2026-08', label: 'Agosto 2026', short: 'Agosto' },
  { key: '2026-07', label: 'Luglio 2026', short: 'Luglio' },
  { key: '2026-06', label: 'Giugno 2026', short: 'Giugno' },
  { key: '2026-05', label: 'Maggio 2026', short: 'Maggio' },
]

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState(() => {
    try {
      const saved = localStorage.getItem('dado_opportunities_store_v3')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      // fallback
    }
    return INITIAL_OPPORTUNITIES
  })

  const [selectedMonth, setSelectedMonth] = useState('2026-09')
  const [metricMode, setMetricMode] = useState('value') // 'value' | 'count'
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'open' | 'won' | 'lost'
  const [selectedDateFilter, setSelectedDateFilter] = useState(null) // specific date string (e.g. '2026-09-18')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredDate, setHoveredDate] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Form stato per nuova trattativa
  const [newTitle, setNewTitle] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newStatus, setNewStatus] = useState('open')
  const [newDate, setNewDate] = useState('2026-09-25')
  const [newNotes, setNewNotes] = useState('')

  // Salva nello store locale
  useEffect(() => {
    try {
      localStorage.setItem('dado_opportunities_store_v3', JSON.stringify(opportunities))
    } catch (e) {
      // ignore
    }
  }, [opportunities])

  // Trattative filtrate per mese selezionato
  const monthOpportunities = useMemo(() => {
    return opportunities.filter(o => o.month === selectedMonth)
  }, [opportunities, selectedMonth])

  // Statistiche mese (Aperte, Vinte, Perse)
  const stats = useMemo(() => {
    const openOpps = monthOpportunities.filter(o => o.status === 'open')
    const wonOpps = monthOpportunities.filter(o => o.status === 'won')
    const lostOpps = monthOpportunities.filter(o => o.status === 'lost')

    const openVal = openOpps.reduce((sum, o) => sum + (o.value || 0), 0)
    const wonVal = wonOpps.reduce((sum, o) => sum + (o.value || 0), 0)
    const lostVal = lostOpps.reduce((sum, o) => sum + (o.value || 0), 0)
    const totalVal = openVal + wonVal + lostVal

    const closedCount = wonOpps.length + lostOpps.length
    const winRate = closedCount > 0 ? Math.round((wonOpps.length / closedCount) * 100) : 0

    return {
      open: { count: openOpps.length, value: openVal },
      won: { count: wonOpps.length, value: wonVal },
      lost: { count: lostOpps.length, value: lostVal },
      totalCount: monthOpportunities.length,
      totalVal,
      winRate
    }
  }, [monthOpportunities])

  // Date in cui si sono verificate trattative nel corso del mese (ordinate cronologicamente)
  const datesData = useMemo(() => {
    const datesMap = {}

    monthOpportunities.forEach(o => {
      const d = o.date
      if (!datesMap[d]) {
        datesMap[d] = {
          date: d,
          day: parseInt(d.split('-')[2], 10),
          openValue: 0,
          wonValue: 0,
          lostValue: 0,
          openCount: 0,
          wonCount: 0,
          lostCount: 0,
          items: []
        }
      }
      datesMap[d].items.push(o)
      if (o.status === 'open') {
        datesMap[d].openValue += (o.value || 0)
        datesMap[d].openCount += 1
      } else if (o.status === 'won') {
        datesMap[d].wonValue += (o.value || 0)
        datesMap[d].wonCount += 1
      } else if (o.status === 'lost') {
        datesMap[d].lostValue += (o.value || 0)
        datesMap[d].lostCount += 1
      }
    })

    return Object.values(datesMap).sort((a, b) => a.date.localeCompare(b.date))
  }, [monthOpportunities])

  // Valore massimo per scalare l'altezza dell'istogramma
  const maxHistogramValue = useMemo(() => {
    let max = 1
    datesData.forEach(d => {
      if (metricMode === 'value') {
        if (d.openValue > max) max = d.openValue
        if (d.wonValue > max) max = d.wonValue
        if (d.lostValue > max) max = d.lostValue
      } else {
        if (d.openCount > max) max = d.openCount
        if (d.wonCount > max) max = d.wonCount
        if (d.lostCount > max) max = d.lostCount
      }
    })
    return max
  }, [datesData, metricMode])

  // Lista trattative per la tabella/card filtrata per data selezionata, stato e query di ricerca
  const filteredList = useMemo(() => {
    return monthOpportunities.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (selectedDateFilter && o.date !== selectedDateFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = (o.title || '').toLowerCase().includes(q)
        const matchComp = (o.company || '').toLowerCase().includes(q)
        const matchStage = (o.stage || '').toLowerCase().includes(q)
        const matchNotes = (o.notes || '').toLowerCase().includes(q)
        if (!matchTitle && !matchComp && !matchStage && !matchNotes) return false
      }
      return true
    }).sort((a, b) => b.date.localeCompare(a.date))
  }, [monthOpportunities, statusFilter, selectedDateFilter, searchQuery])

  // Aggiungi nuova trattativa
  const handleAddOpportunity = (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newCompany.trim() || !newValue) return

    const valNum = parseFloat(newValue) || 0
    const [y, m] = newDate.split('-')
    const itemMonth = `${y}-${m}`

    const newOpp = {
      id: `opp-${Date.now()}`,
      month: itemMonth,
      date: newDate,
      company: newCompany.trim(),
      title: newTitle.trim(),
      value: valNum,
      status: newStatus,
      stage: newStatus === 'won' ? 'Contratto firmato' : newStatus === 'lost' ? 'Non conclusa' : 'Preventivo inviato',
      notes: newNotes.trim() || 'Trattativa inserita manualmente.',
      materials: 'Kit standard DADO Studio',
      owner: 'Andrea'
    }

    setOpportunities(prev => [newOpp, ...prev])
    setSelectedMonth(itemMonth)
    setIsAddModalOpen(false)

    // Reset form
    setNewTitle('')
    setNewCompany('')
    setNewValue('')
    setNewNotes('')
  }

  // ── TELEMETRIA PIPELINE BACKGROUND (A RIFLETTORI SPENTI) ──
  const [pipelineStatus, setPipelineStatus] = useState(null)
  const [pipelineLoading, setPipelineLoading] = useState(false)
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false)
  const [pipelineTriggerMsg, setPipelineTriggerMsg] = useState(null)

  // ── STATO AUTENTICAZIONE GOOGLE / GMAIL ──
  const [googleAuth, setGoogleAuth] = useState({ connected: false, email: null, name: null, loading: true })
  const [googleToast, setGoogleToast] = useState(null)

  useEffect(() => {
    // Controllo notifiche di ritorno da OAuth Google (?google=connected o ?google=error)
    const params = new URLSearchParams(window.location.search)
    if (params.get('google') === 'connected') {
      setGoogleToast({ type: 'success', message: '✅ Account Gmail collegato con successo! Sincronizzazione automatica e aggiornamento CRM attivi.' })
      window.history.replaceState({}, document.title, window.location.pathname)
      setTimeout(() => setGoogleToast(null), 6000)
    } else if (params.get('google') === 'error') {
      setGoogleToast({ type: 'error', message: `⚠️ Errore collegamento Google: ${params.get('msg') || 'Autorizzazione non riuscita'}` })
      window.history.replaceState({}, document.title, window.location.pathname)
      setTimeout(() => setGoogleToast(null), 6000)
    }

    let isMounted = true
    async function checkGoogleStatus() {
      try {
        const res = await fetch('/api/auth/google/status')
        if (res.ok && isMounted) {
          const data = await res.json()
          setGoogleAuth({
            connected: Boolean(data.connected),
            email: data.email || null,
            name: data.name || null,
            picture: data.picture || null,
            loading: false
          })
        }
      } catch (e) {
        if (isMounted) setGoogleAuth({ connected: false, email: null, loading: false })
      }
    }

    async function fetchPipelineStatus() {
      try {
        const res = await fetch('/api/pipeline/status')
        if (res.ok && isMounted) {
          const data = await res.json()
          setPipelineStatus(data)
        }
      } catch (err) {
        console.warn('Pipeline status polling error:', err)
      }
    }

    checkGoogleStatus()
    fetchPipelineStatus()
    const interval = setInterval(() => {
      fetchPipelineStatus()
      checkGoogleStatus()
    }, 8000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const handleConnectGmail = async () => {
    try {
      const res = await fetch('/api/auth/google/url')
      if (res.ok) {
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        }
      } else {
        alert('Errore generazione link autorizzazione Google.')
      }
    } catch (err) {
      console.error('Errore avvio OAuth Google:', err)
      alert('Impossibile contattare il server per l\'autorizzazione Google.')
    }
  }

  const handleDisconnectGmail = async () => {
    if (!window.confirm('Vuoi davvero scollegare l\'account Gmail dal CRM?')) return
    try {
      const res = await fetch('/api/auth/google/disconnect', { method: 'POST' })
      if (res.ok) {
        setGoogleAuth({ connected: false, email: null, name: null, loading: false })
        setGoogleToast({ type: 'info', message: 'Account Google disconnesso con successo.' })
        setTimeout(() => setGoogleToast(null), 4000)
      }
    } catch (err) {
      console.error('Errore disconnessione:', err)
    }
  }

  const handleTriggerPipeline = async () => {
    setPipelineLoading(true)
    setPipelineTriggerMsg(null)
    try {
      const res = await fetch('/api/sync/gmail', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setPipelineTriggerMsg(`Scansione completata: ${data.count || 0} email analizzate!`)
        // Ricarica stato
        const pRes = await fetch('/api/pipeline/status')
        if (pRes.ok) setPipelineStatus(await pRes.json())
        setTimeout(() => setPipelineTriggerMsg(null), 4000)
      } else {
        setPipelineTriggerMsg('Errore scansione.')
        setTimeout(() => setPipelineTriggerMsg(null), 4000)
      }
    } catch (err) {
      console.error('Trigger pipeline error:', err)
      setPipelineTriggerMsg('Errore scansione.')
      setTimeout(() => setPipelineTriggerMsg(null), 4000)
    } finally {
      setPipelineLoading(false)
    }
  }

  const currentMonthObj = MONTHS_LIST.find(m => m.key === selectedMonth) || MONTHS_LIST[0]

  return (
    <div className="min-h-screen bg-[#111111] text-white p-6 md:p-8 flex flex-col gap-6 selection:bg-[#3b82f6]/30">

      {/* ── BANNER / TOAST NOTIFICA OAUTH GOOGLE ── */}
      {googleToast && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-mono font-bold shadow-lg animate-in slide-in-from-top duration-200 border ${
          googleToast.type === 'success' 
            ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50'
            : googleToast.type === 'error'
            ? 'bg-red-500/20 text-red-300 border-red-500/50'
            : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
        }`}>
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4" />
            <span>{googleToast.message}</span>
          </div>
          <button onClick={() => setGoogleToast(null)} className="opacity-70 hover:opacity-100 cursor-pointer text-sm">
            ✕
          </button>
        </div>
      )}

      {/* ── HEADER SUPERIORE ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#3b82f6]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2" style={{ fontFamily: '"Switzer", sans-serif', letterSpacing: '-0.03em' }}>
                Pipeline Opportunità
              </h1>
              <p className="text-xs md:text-sm text-gray-400 font-mono mt-0.5">
                <span>Istogramma trattative aperte, vinte e perse nel corso del mese</span>
              </p>
            </div>
          </div>
        </div>

        {/* Controlli: Selezione Mese & Aggiungi Trattativa */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Selettore Mese */}
          <div className="flex items-center bg-[#18181b] border border-white/10 rounded-lg p-1 shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400 ml-2 mr-1" />
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value)
                setSelectedDateFilter(null)
              }}
              className="bg-transparent text-xs font-bold text-white pr-2 py-1 focus:outline-none cursor-pointer"
            >
              {MONTHS_LIST.map(m => (
                <option key={m.key} value={m.key} className="bg-[#18181b] text-white">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Valore / Conteggio */}
          <div className="flex items-center bg-[#18181b] border border-white/10 rounded-lg p-1 text-xs font-bold font-mono">
            <button
              onClick={() => setMetricMode('value')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                metricMode === 'value'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              € Valore
            </button>
            <button
              onClick={() => setMetricMode('count')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                metricMode === 'count'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              # Quantità
            </button>
          </div>

          {/* Tasto Nuova Trattativa */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuova Trattativa</span>
          </button>
        </div>
      </div>

      {/* ── SEZIONE PIPELINE BACKGROUND (A RIFLETTORI SPENTI) ── */}
      <div
        className="rounded-xl p-4 shadow-xl border relative overflow-hidden transition-all"
        style={{
          backgroundColor: '#161922',
          borderColor: 'rgba(59, 130, 246, 0.35)',
          boxShadow: '0 8px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Info Principale */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-black/60 border border-white/10 shrink-0">
              <span className={`w-2.5 h-2.5 rounded-full ${googleAuth.connected ? 'bg-[#10b981]' : 'bg-[#fac429]'} animate-ping absolute`} />
              <span className={`w-2 h-2 rounded-full ${googleAuth.connected ? 'bg-[#10b981]' : 'bg-[#fac429]'} relative z-10`} />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white tracking-tight" style={{ fontFamily: '"Switzer", sans-serif', letterSpacing: '-0.02em' }}>
                  Pipeline Background
                </span>

                {/* Badge Stato Gmail */}
                {googleAuth.connected ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 font-bold" style={{ fontFamily: '"Switzer", sans-serif' }}>
                    <Mail className="w-3 h-3" />
                    <span>Gmail: <strong>{googleAuth.email || 'Collegato'}</strong></span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold" style={{ fontFamily: '"Switzer", sans-serif' }}>
                    <span>⚠️ Feed Live Autonomo</span>
                  </span>
                )}

                {pipelineTriggerMsg && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 animate-pulse font-semibold" style={{ fontFamily: '"Switzer", sans-serif' }}>
                    {pipelineTriggerMsg}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap" style={{ fontFamily: '"Switzer", sans-serif' }}>
                <span>Inbound: {googleAuth.connected ? 'Gmail API Live' : 'Feed Background'}</span>
                <span className="text-white/20">•</span>
                <span>Analisi Semantica: {pipelineStatus?.activeEngine || 'OpenAI + NLP Fallback'}</span>
                <span className="text-white/20">•</span>
                <span className="text-gray-300">
                  Ultimo scan: <strong className="text-white font-semibold">{pipelineStatus?.lastRun ? new Date(pipelineStatus.lastRun).toLocaleTimeString('it-IT') : 'In corso...'}</strong>
                </span>
              </p>
            </div>
          </div>

          {/* Metric Badges & Pulsanti in Switzer */}
          <div className="flex items-center gap-2.5 flex-wrap self-end lg:self-auto" style={{ fontFamily: '"Switzer", sans-serif' }}>
            {/* Pulsante Collega Gmail o Disconnetti */}
            {!googleAuth.connected ? (
              <button
                type="button"
                onClick={handleConnectGmail}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer border border-red-400/40"
                style={{ fontFamily: '"Switzer", sans-serif' }}
                title="Collega la tua casella Gmail per estrarre in tempo reale i preventivi e aggiornare il CRM"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Collega Gmail</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDisconnectGmail}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-all cursor-pointer"
                style={{ fontFamily: '"Switzer", sans-serif' }}
                title="Scollega account Google"
              >
                <span>Scollega</span>
              </button>
            )}

            <div className="flex items-center gap-2 bg-black/50 px-2.5 py-1.5 rounded-lg border border-white/10 text-xs" style={{ fontFamily: '"Switzer", sans-serif' }}>
              <span className="text-gray-400">Cicli:</span>
              <span className="text-[#3b82f6] font-bold">{pipelineStatus?.totalRuns ?? 0}</span>
              <span className="text-white/20">|</span>
              <span className="text-gray-400">Email:</span>
              <span className="text-[#10b981] font-bold">{pipelineStatus?.processedEmails ?? 0}</span>
              <span className="text-white/20">|</span>
              <span className="text-gray-400">Task BANT:</span>
              <span className="text-[#fac429] font-bold">{pipelineStatus?.generatedTasks ?? 0}</span>
            </div>

            <button
              type="button"
              onClick={handleTriggerPipeline}
              disabled={pipelineLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 text-[#3b82f6] hover:text-white border border-[#3b82f6]/40 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              style={{ fontFamily: '"Switzer", sans-serif' }}
              title="Forza l'estrazione e scansione immediata da Gmail"
            >
              <Zap className={`w-3.5 h-3.5 ${pipelineLoading ? 'animate-spin' : ''}`} />
              <span>{pipelineLoading ? 'Sincronizzazione...' : 'Sincronizza Gmail'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPipelineModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 border border-white/15 text-xs font-semibold transition-all cursor-pointer active:scale-95"
              style={{ fontFamily: '"Switzer", sans-serif' }}
              title="Apri i log in tempo reale della telemetria"
            >
              <Radio className="w-3.5 h-3.5 text-[#00ffaa]" />
              <span>Telemetria & Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS DI RIEPILOGO DEL MESE CON FONT SWITZER ─────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5" style={{ fontFamily: '"Switzer", sans-serif' }}>
        {/* Card 1: Aperte */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'open' ? 'all' : 'open')}
          className={`p-4 rounded-xl border transition-all cursor-pointer select-none relative overflow-hidden group ${
            statusFilter === 'open' ? 'ring-2 ring-[#3b82f6]' : 'hover:border-white/20'
          }`}
          style={{
            backgroundColor: '#161922',
            borderColor: STATUS_CONFIG.open.border,
            fontFamily: '"Switzer", sans-serif',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#3b82f6]">
              Trattative Aperte
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-sm shadow-[#3b82f6]/50" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-white leading-none" style={{ letterSpacing: '-0.03em' }}>
              € {(stats.open.value / 1000).toFixed(1)}k
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#3b82f6]/15 text-[#3b82f6]">
              {stats.open.count} {stats.open.count === 1 ? 'deal' : 'deals'}
            </span>
          </div>
          <span className="text-[12px] text-gray-400 block mt-1.5 truncate">
            In negoziazione attiva nel mese
          </span>
        </div>

        {/* Card 2: Vinte */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'won' ? 'all' : 'won')}
          className={`p-4 rounded-xl border transition-all cursor-pointer select-none relative overflow-hidden group ${
            statusFilter === 'won' ? 'ring-2 ring-[#10b981]' : 'hover:border-white/20'
          }`}
          style={{
            backgroundColor: '#131e1a',
            borderColor: STATUS_CONFIG.won.border,
            fontFamily: '"Switzer", sans-serif',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#10b981]">
              Trattative Vinte
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-sm shadow-[#10b981]/50" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-white leading-none" style={{ letterSpacing: '-0.03em' }}>
              € {(stats.won.value / 1000).toFixed(1)}k
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981]">
              {stats.won.count} {stats.won.count === 1 ? 'deal' : 'deals'}
            </span>
          </div>
          <span className="text-[12px] text-gray-400 block mt-1.5 truncate">
            Contratti siglati e convertiti
          </span>
        </div>

        {/* Card 3: Perse */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'lost' ? 'all' : 'lost')}
          className={`p-4 rounded-xl border transition-all cursor-pointer select-none relative overflow-hidden group ${
            statusFilter === 'lost' ? 'ring-2 ring-[#f43f5e]' : 'hover:border-white/20'
          }`}
          style={{
            backgroundColor: '#20161a',
            borderColor: STATUS_CONFIG.lost.border,
            fontFamily: '"Switzer", sans-serif',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#f43f5e]">
              Trattative Perse
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] shadow-sm shadow-[#f43f5e]/50" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-white leading-none" style={{ letterSpacing: '-0.03em' }}>
              € {(stats.lost.value / 1000).toFixed(1)}k
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#f43f5e]/15 text-[#f43f5e]">
              {stats.lost.count} {stats.lost.count === 1 ? 'deal' : 'deals'}
            </span>
          </div>
          <span className="text-[12px] text-gray-400 block mt-1.5 truncate">
            Non concluse o posticipate
          </span>
        </div>

        {/* Card 4: Tasso di Conversione Win Rate */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 select-none" style={{ fontFamily: '"Switzer", sans-serif' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-purple-400">
              Win Rate Mese
            </span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-white leading-none" style={{ letterSpacing: '-0.03em' }}>
              {stats.winRate}%
            </span>
            <span className="text-xs font-mono font-bold text-gray-400">
              Tot: € {(stats.totalVal / 1000).toFixed(1)}k
            </span>
          </div>
          <span className="text-[12px] text-gray-400 block mt-1.5 truncate">
            Su {stats.open.count + stats.won.count + stats.lost.count} trattative registrate
          </span>
        </div>
      </div>

      {/* ── SEZIONE ISTOGRAMMA CON LE DATE DEL MESE ───────────────────── */}
      <div className="bg-[#18181b] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-4">

        {/* Intestazione Istogramma & Legenda Tre Colori */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-bold text-white tracking-tight">
                Istogramma Distribuzione Date — {currentMonthObj.label}
              </h2>
              {selectedDateFilter && (
                <button
                  onClick={() => setSelectedDateFilter(null)}
                  className="flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded-full transition-colors font-mono cursor-pointer"
                  title="Mostra tutte le date"
                >
                  <span>Filtro: {selectedDateFilter.split('-')[2]} {currentMonthObj.short}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Clicca su una colonna data per isolare le relative trattative
            </p>
          </div>

          {/* Legenda 3 Colori */}
          <div className="flex items-center gap-4 flex-wrap text-xs font-mono font-bold select-none">
            <div
              onClick={() => setStatusFilter(statusFilter === 'open' ? 'all' : 'open')}
              className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${
                statusFilter !== 'all' && statusFilter !== 'open' ? 'opacity-30' : 'opacity-100'
              }`}
            >
              <span className="w-3 h-3 rounded-sm bg-[#3b82f6] shadow-sm shadow-[#3b82f6]/40" />
              <span className="text-gray-200">Aperte</span>
            </div>

            <div
              onClick={() => setStatusFilter(statusFilter === 'won' ? 'all' : 'won')}
              className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${
                statusFilter !== 'all' && statusFilter !== 'won' ? 'opacity-30' : 'opacity-100'
              }`}
            >
              <span className="w-3 h-3 rounded-sm bg-[#10b981] shadow-sm shadow-[#10b981]/40" />
              <span className="text-gray-200">Vinte</span>
            </div>

            <div
              onClick={() => setStatusFilter(statusFilter === 'lost' ? 'all' : 'lost')}
              className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${
                statusFilter !== 'all' && statusFilter !== 'lost' ? 'opacity-30' : 'opacity-100'
              }`}
            >
              <span className="w-3 h-3 rounded-sm bg-[#f43f5e] shadow-sm shadow-[#f43f5e]/40" />
              <span className="text-gray-200">Perse</span>
            </div>
          </div>
        </div>

        {/* Area Grafico Istogramma con Asse X (Date del Mese) */}
        <div className="pt-4 pb-2">
          {datesData.length === 0 ? (
            <div className="py-16 text-center text-gray-500 font-mono text-xs">
              Nessuna trattativa registrata per il mese di {currentMonthObj.label}.
            </div>
          ) : (
            <div className="relative">

              {/* Linee di guida orizzontali */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10 opacity-15">
                <div className="border-b border-white w-full" />
                <div className="border-b border-white w-full" />
                <div className="border-b border-white w-full" />
                <div className="border-b border-white w-full" />
              </div>

              {/* Barre Istogramma a scorrimento orizzontale su schermi piccoli */}
              <div className="overflow-x-auto pb-2 scrollbar-thin">
                <div className="min-w-[620px] h-[240px] flex items-end justify-between gap-3 px-2 pt-6 pb-8 relative">

                  {datesData.map((d) => {
                    const isSelected = selectedDateFilter === d.date
                    const isHovered = hoveredDate === d.date

                    // Altezze calcolate in % rispetto al massimo del mese
                    const valOpen = metricMode === 'value' ? d.openValue : d.openCount
                    const valWon = metricMode === 'value' ? d.wonValue : d.wonCount
                    const valLost = metricMode === 'value' ? d.lostValue : d.lostCount

                    const heightOpen = Math.max(valOpen > 0 ? 8 : 0, Math.round((valOpen / maxHistogramValue) * 100))
                    const heightWon = Math.max(valWon > 0 ? 8 : 0, Math.round((valWon / maxHistogramValue) * 100))
                    const heightLost = Math.max(valLost > 0 ? 8 : 0, Math.round((valLost / maxHistogramValue) * 100))

                    const dayFormatted = `${String(d.day).padStart(2, '0')}`

                    return (
                      <div
                        key={d.date}
                        onMouseEnter={() => setHoveredDate(d.date)}
                        onMouseLeave={() => setHoveredDate(null)}
                        onClick={() => setSelectedDateFilter(isSelected ? null : d.date)}
                        className={`flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group transition-all ${
                          isSelected ? 'scale-[1.03]' : ''
                        }`}
                      >
                        {/* Tooltip fluttuante su hover */}
                        {isHovered && (
                          <div className="absolute -top-14 z-30 bg-[#1f242d] border border-white/20 rounded-lg py-1 px-2.5 shadow-2xl pointer-events-none whitespace-nowrap text-left animate-fadeIn">
                            <span className="text-[10px] font-mono text-gray-300 block font-bold">
                              Data: {dayFormatted} {currentMonthObj.short} 2026
                            </span>
                            <div className="flex items-center gap-2 text-[10px] font-mono font-bold mt-0.5">
                              {d.openCount > 0 && (
                                <span className="text-[#3b82f6]">
                                  {d.openCount} Aperte (€ {d.openValue.toLocaleString('it-IT')})
                                </span>
                              )}
                              {d.wonCount > 0 && (
                                <span className="text-[#10b981]">
                                  {d.wonCount} Vinte (€ {d.wonValue.toLocaleString('it-IT')})
                                </span>
                              )}
                              {d.lostCount > 0 && (
                                <span className="text-[#f43f5e]">
                                  {d.lostCount} Perse (€ {d.lostValue.toLocaleString('it-IT')})
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Gruppo di 3 Barre dell'Istogramma (Aperte, Vinte, Perse) */}
                        <div
                          className={`w-full max-w-[48px] flex items-end justify-center gap-1 p-1 rounded-t-lg transition-colors ${
                            isSelected ? 'bg-white/10 ring-1 ring-white/30' : 'group-hover:bg-white/5'
                          }`}
                          style={{ height: '100%' }}
                        >
                          {/* 1. Barra Aperte (Blu #3b82f6) */}
                          <div
                            className="flex-1 rounded-t transition-all relative overflow-hidden"
                            style={{
                              height: `${heightOpen}%`,
                              backgroundColor: valOpen > 0 ? '#3b82f6' : 'transparent',
                              boxShadow: valOpen > 0 ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none',
                              opacity: statusFilter === 'all' || statusFilter === 'open' ? 1 : 0.15,
                            }}
                            title={`Aperte: € ${d.openValue.toLocaleString('it-IT')} (${d.openCount})`}
                          />

                          {/* 2. Barra Vinte (Smeraldo #10b981) */}
                          <div
                            className="flex-1 rounded-t transition-all relative overflow-hidden"
                            style={{
                              height: `${heightWon}%`,
                              backgroundColor: valWon > 0 ? '#10b981' : 'transparent',
                              boxShadow: valWon > 0 ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none',
                              opacity: statusFilter === 'all' || statusFilter === 'won' ? 1 : 0.15,
                            }}
                            title={`Vinte: € ${d.wonValue.toLocaleString('it-IT')} (${d.wonCount})`}
                          />

                          {/* 3. Barra Perse (Lampone #f43f5e) */}
                          <div
                            className="flex-1 rounded-t transition-all relative overflow-hidden"
                            style={{
                              height: `${heightLost}%`,
                              backgroundColor: valLost > 0 ? '#f43f5e' : 'transparent',
                              boxShadow: valLost > 0 ? '0 0 10px rgba(244, 63, 94, 0.3)' : 'none',
                              opacity: statusFilter === 'all' || statusFilter === 'lost' ? 1 : 0.15,
                            }}
                            title={`Perse: € ${d.lostValue.toLocaleString('it-IT')} (${d.lostCount})`}
                          />
                        </div>

                        {/* Etichetta Data Asse X (Giorno del mese) */}
                        <div
                          className={`absolute -bottom-6 flex flex-col items-center select-none font-mono text-[11px] font-bold ${
                            isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                          }`}
                        >
                          <span>{dayFormatted}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Dicitura Asse X */}
              <div className="text-center pt-2">
                <span className="text-[11px] text-gray-500 font-mono uppercase tracking-widest">
                  ── Date verificate nel corso di {currentMonthObj.label} ──
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TABELLA / DETTAGLIO TRATTATIVE VERIFICATE ─────────────────── */}
      <div className="bg-[#18181b] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-4">

        {/* Filtri Elenco */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Dettaglio Trattative
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-bold">
              {filteredList.length} trovate
            </span>
            {selectedDateFilter && (
              <span className="text-xs font-mono text-[#3b82f6] font-bold">
                (Filtro data: {selectedDateFilter.split('-')[2]} {currentMonthObj.short})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Input Ricerca */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca cliente, titolo o note..."
                className="bg-[#111111] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#3b82f6] w-56 font-mono"
              />
            </div>

            {/* Filtri stato (Tutte / Aperte / Vinte / Perse) */}
            <div className="flex items-center bg-[#111111] border border-white/10 rounded-lg p-0.5 text-xs font-mono font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Tutte
              </button>
              <button
                onClick={() => setStatusFilter('open')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  statusFilter === 'open' ? 'bg-[#3b82f6]/20 text-[#3b82f6]' : 'text-gray-400 hover:text-[#3b82f6]'
                }`}
              >
                Aperte
              </button>
              <button
                onClick={() => setStatusFilter('won')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  statusFilter === 'won' ? 'bg-[#10b981]/20 text-[#10b981]' : 'text-gray-400 hover:text-[#10b981]'
                }`}
              >
                Vinte
              </button>
              <button
                onClick={() => setStatusFilter('lost')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  statusFilter === 'lost' ? 'bg-[#f43f5e]/20 text-[#f43f5e]' : 'text-gray-400 hover:text-[#f43f5e]'
                }`}
              >
                Perse
              </button>
            </div>
          </div>
        </div>

        {/* Lista Trattative */}
        {filteredList.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-mono text-xs">
            Nessuna trattativa trovata con i filtri correnti.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredList.map((opp) => {
              const conf = STATUS_CONFIG[opp.status] || STATUS_CONFIG.open
              const IconComp = conf.icon
              const dayStr = opp.date ? opp.date.split('-')[2] : 'N/D'

              return (
                <div
                  key={opp.id}
                  className="p-4 rounded-xl border transition-all hover:border-white/20 flex flex-col justify-between gap-3 group"
                  style={{
                    backgroundColor: '#141416',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {/* Data in cui si è verificata nel mese */}
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {dayStr} {currentMonthObj.short} 2026
                        </span>

                        {/* Badge Stato con colore dedicato */}
                        <span
                          className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded flex items-center gap-1"
                          style={{
                            backgroundColor: conf.bg,
                            color: conf.color,
                            border: `1px solid ${conf.border}`,
                          }}
                        >
                          <IconComp className="w-3 h-3" />
                          {conf.shortLabel}
                        </span>

                        <span className="text-[11px] font-mono text-gray-500">
                          {opp.stage}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate">
                        {opp.title}
                      </h4>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">
                        {opp.company}
                      </p>
                    </div>

                    {/* Valore in Euro */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-black font-mono text-white block">
                        € {(opp.value || 0).toLocaleString('it-IT')}
                      </span>
                    </div>
                  </div>

                  {/* Note e dettagli trattativa */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span className="truncate max-w-[80%]">
                      {opp.notes || 'Nessuna nota aggiuntiva'}
                    </span>
                    <span className="text-gray-500 font-bold">
                      {opp.owner || 'DADO Team'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── MODALE: AGGIUNGI NUOVA TRATTATIVA ────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#18181b] border border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Nuova Trattativa nel Mese
            </h3>
            <p className="text-xs text-gray-400 font-mono mb-4">
              Registra una trattativa per monitorarla nell'istogramma del mese
            </p>

            <form onSubmit={handleAddOpportunity} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1">
                  Titolo Trattativa / Commessa *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Es. Video Corporate 4K, Spot TV, Shooting..."
                  className="w-full bg-[#111111] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">
                    Azienda / Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Es. Officine Riva, Vogue Events..."
                    className="w-full bg-[#111111] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">
                    Valore Economico (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Es. 7500"
                    className="w-full bg-[#111111] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#3b82f6] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">
                    Stato Trattativa
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b82f6] font-mono cursor-pointer"
                  >
                    <option value="open">Aperta (In trattativa)</option>
                    <option value="won">Vinta (Contratto chiuso)</option>
                    <option value="lost">Persa (Rifiutata)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">
                    Data di Verifica nel Mese *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b82f6] font-mono cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1">
                  Note di Negoziazione / Esito
                </label>
                <textarea
                  rows="2"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Dettagli sulle motivazioni, richieste del cliente o materiali..."
                  className="w-full bg-[#111111] border border-white/15 rounded-lg p-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#3b82f6] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10 mt-1">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Salva Trattativa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODALE TELEMETRIA & LOG PIPELINE BACKGROUND ── */}
      {isPipelineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-3xl bg-[#111111] rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            style={{ fontFamily: '"Jost", sans-serif' }}
          >
            {/* Header Modale */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 border border-[#3b82f6]/40 flex items-center justify-center text-[#3b82f6]">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2" style={{ fontFamily: '"Switzer", sans-serif' }}>
                    Telemetria Pipeline Background
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-bold" style={{ fontFamily: '"Switzer", sans-serif' }}>
                      LIVE
                    </span>
                  </h3>
                  <p className="text-xs text-white/50" style={{ fontFamily: '"Switzer", sans-serif' }}>
                    Connessione Gmail • Motore Semantico LLM • CRM Ingestion
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPipelineModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corpo Modale in Switzer */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs" style={{ fontFamily: '"Switzer", sans-serif' }}>
              {/* Stato nodi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-[11px] font-medium" style={{ fontFamily: '"Switzer", sans-serif' }}>CONNETTORE GMAIL</span>
                    <span className={`w-2 h-2 rounded-full ${googleAuth.connected ? 'bg-[#10b981]' : 'bg-[#fac429]'}`} />
                  </div>
                  <div className="mt-2">
                    <div className="font-bold text-white text-xs truncate" style={{ fontFamily: '"Switzer", sans-serif' }}>
                      {googleAuth.connected ? (googleAuth.email || 'OAuth2 Connesso') : 'Feed Live Autonomo'}
                    </div>
                    <div className="text-[10px] text-white/50 mt-0.5" style={{ fontFamily: '"Switzer", sans-serif' }}>
                      {googleAuth.connected ? 'Scansione automatica casella attiva' : 'Nessun account collegato'}
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5">
                    {googleAuth.connected ? (
                      <button
                        type="button"
                        onClick={handleDisconnectGmail}
                        className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[10px] font-semibold transition-all cursor-pointer"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        Scollega
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnectGmail}
                        className="px-2.5 py-1 rounded bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-[10.5px] transition-all cursor-pointer shadow flex items-center gap-1"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        <Mail className="w-3 h-3" />
                        <span>Collega Gmail</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                  <span className="text-white/50 text-[11px] font-medium" style={{ fontFamily: '"Switzer", sans-serif' }}>MOTORE SEMANTICO</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span className="font-bold text-white truncate text-xs" style={{ fontFamily: '"Switzer", sans-serif' }} title={pipelineStatus?.activeEngine}>
                      {pipelineStatus?.activeEngine || 'OpenAI / DADO NLP'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                  <span className="text-white/50 text-[11px] font-medium" style={{ fontFamily: '"Switzer", sans-serif' }}>FREQUENZA BACKGROUND</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                    <span className="font-bold text-white text-xs" style={{ fontFamily: '"Switzer", sans-serif' }}>
                      Ogni {pipelineStatus?.intervalSeconds || 60}s (Silenzioso)
                    </span>
                  </div>
                </div>
              </div>

              {/* Registro Log Eventi in Switzer */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-[12px] tracking-wide" style={{ fontFamily: '"Switzer", sans-serif' }}>
                    LOG EVENTI IN TEMPO REALE
                  </span>
                  <span className="text-white/40 text-[11px]" style={{ fontFamily: '"Switzer", sans-serif' }}>Buffer circolare automatico</span>
                </div>
                <div
                  className="p-3.5 rounded-xl bg-black/85 border border-white/10 max-h-60 overflow-y-auto space-y-2 text-[12px]"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  {pipelineStatus?.logs && pipelineStatus.logs.length > 0 ? (
                    pipelineStatus.logs.map((lg, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-white/90 leading-relaxed text-[12px]"
                        style={{ fontFamily: '"Switzer", sans-serif', letterSpacing: '-0.01em' }}
                      >
                        <span className="text-white/45 shrink-0 font-medium" style={{ fontFamily: '"Switzer", sans-serif' }}>
                          [{lg.timestamp}]
                        </span>
                        <span
                          className={`font-bold shrink-0 text-[11px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            lg.level === 'success'
                              ? 'text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/30'
                              : lg.level === 'warning'
                              ? 'text-[#fac429] bg-[#fac429]/15 border border-[#fac429]/30'
                              : 'text-[#3b82f6] bg-[#3b82f6]/15 border border-[#3b82f6]/30'
                          }`}
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          {lg.level}:
                        </span>
                        <span className="text-white/90 font-normal break-words" style={{ fontFamily: '"Switzer", sans-serif' }}>
                          {lg.message}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/40 italic py-2 text-center" style={{ fontFamily: '"Switzer", sans-serif' }}>
                      Nessun log recente registrato.
                    </div>
                  )}
                </div>
              </div>

              {/* Ultime Opportunità Qualificate via B.A.N.T. */}
              {pipelineStatus?.recentTasks && pipelineStatus.recentTasks.length > 0 && (
                <div>
                  <span className="text-white font-bold text-[12px] block mb-2" style={{ fontFamily: '"Switzer", sans-serif' }}>
                    TASK E LEAD QUALIFICATI B.A.N.T. DALLA PIPELINE
                  </span>
                  <div className="space-y-2" style={{ fontFamily: '"Switzer", sans-serif' }}>
                    {pipelineStatus.recentTasks.map((t, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5" style={{ fontFamily: '"Switzer", sans-serif' }}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#00e5ff]">{t.company}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#fac429]/20 text-[#fac429] border border-[#fac429]/30 font-bold">
                            Priorità: {t.priority}
                          </span>
                        </div>
                        <div className="text-white font-medium text-xs">{t.title}</div>
                        {t.bant && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1 pt-1 border-t border-white/5 text-[10px]">
                            <div><strong className="text-[#53ba75]">B:</strong> {t.bant.budget || 'N/D'}</div>
                            <div><strong className="text-[#ea3824]">A:</strong> {t.bant.authority || 'N/D'}</div>
                            <div><strong className="text-[#1bb7ed]">N:</strong> {t.bant.need || 'N/D'}</div>
                            <div><strong className="text-[#fac429]">T:</strong> {t.bant.timeline || 'N/D'}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modale */}
            <div className="px-6 py-3.5 border-t border-white/10 bg-black/40 flex items-center justify-between" style={{ fontFamily: '"Switzer", sans-serif' }}>
              <span className="text-[11px] text-white/40 font-medium">
                Uptime pipeline: {pipelineStatus?.uptime ? Math.floor(pipelineStatus.uptime) : 0}s
              </span>
              <button
                type="button"
                onClick={() => setIsPipelineModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                style={{ fontFamily: '"Switzer", sans-serif' }}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
