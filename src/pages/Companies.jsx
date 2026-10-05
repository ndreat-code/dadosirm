import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import Company3DIcon from '../components/Company3DIcon'
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  Star,
  Phone,
  Mail,
  User,
  Search,
  ArrowUpDown,
  Plus,
  ChevronDown,
  ChevronUp,
  Download,
  Camera,
  Check,
  Sparkles,
  Lock,
  X,
} from 'lucide-react'

// Helper per determinare lo stato di relazione / pagamento dell'azienda
export function getCompanyRelationshipStatus(comp) {
  if (comp.relationshipStatus) {
    switch (comp.relationshipStatus) {
      case 'lead_inbound':
        return { key: 'lead_inbound', label: 'Lead & Inbound', tag: 'LEAD', emoji: '🎯', color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd' }
      case 'in_coda_pagamento':
        return { key: 'in_coda_pagamento', label: 'In coda pagamento', tag: 'ATTESA PAGAMENTO', emoji: '⏳', color: '#b45309', bg: '#fef3c7', border: '#fde68a' }
      case 'in_attesa_risposta':
        return { key: 'in_attesa_risposta', label: 'In attesa risposta', tag: 'IN ATTESA', emoji: '🔄', color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' }
      case 'lavoro_concluso':
        return { key: 'lavoro_concluso', label: 'Lavoro concluso', tag: 'CONCLUSO', emoji: '✅', color: '#15803d', bg: '#dcfce7', border: '#bbf7d0' }
      case 'rifiutato':
        return { key: 'rifiutato', label: 'Rifiutato all\'ultimo', tag: 'RIFIUTATO', emoji: '❌', color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' }
      case 'interrotto':
        return { key: 'interrotto', label: 'Rapporto interrotto', tag: 'INTERROTTO', emoji: '⛔', color: '#991b1b', bg: '#fee2e2', border: '#f87171' }
      default:
        break
    }
  }

  // Deduci dai dati del CRM
  if (comp.status === 'In trattativa' || comp.contract?.code?.includes('INB') || comp.contract?.status === 'In elaborazione') {
    return { key: 'lead_inbound', label: 'Lead & Inbound', tag: 'LEAD', emoji: '🎯', color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd' }
  }
  if (comp.status === 'Rifiutato') {
    return { key: 'rifiutato', label: 'Rifiutato all\'ultimo', tag: 'RIFIUTATO', emoji: '❌', color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' }
  }
  if (comp.status === 'Interrotto') {
    return { key: 'interrotto', label: 'Rapporto interrotto', tag: 'INTERROTTO', emoji: '⛔', color: '#991b1b', bg: '#fee2e2', border: '#f87171' }
  }

  const compStatus = comp.compensation?.status
  const balance = comp.compensation?.balance || 0
  if (compStatus === 'Acconto versato' || balance > 0) {
    return { key: 'in_coda_pagamento', label: 'In coda pagamento', tag: 'ATTESA PAGAMENTO', emoji: '⏳', color: '#b45309', bg: '#fef3c7', border: '#fde68a' }
  }
  if (comp.id === 'comp-1' || comp.id === 'comp-4' || comp.id === 'comp-10' || comp.id === 'comp-1790554320431' || comp.id === 'comp-1790554140763') {
    return { key: 'in_attesa_risposta', label: 'In attesa risposta', tag: 'IN ATTESA', emoji: '🔄', color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' }
  }

  return { key: 'lavoro_concluso', label: 'Lavoro concluso', tag: 'CONCLUSO', emoji: '✅', color: '#15803d', bg: '#dcfce7', border: '#bbf7d0' }
}

// Helper per determinare canale di ingresso, motivo del contatto e asset DADO
export function getCompanyAcquisitionChannel(comp) {
  if (comp.acquisitionChannel) return comp.acquisitionChannel
  const ch = (comp.firstContact?.channel || '').toLowerCase()
  const name = (comp.name || '').toLowerCase()

  // 1. Fiere & Eventi di Settore (Verde Pistacchio #98d85b)
  if (ch.includes('fiera') || ch.includes('event') || ch.includes('expo') || ch.includes('vinitaly') || ch.includes('cersaie') || name.includes('san biagio') || name.includes('kroma')) {
    return {
      channel: 'Eventi, Fiere & Convention',
      shortChannel: 'FIERE & EVENTI',
      type: 'Relazionale / Diretto',
      reason: 'Contatto diretto con direttori marketing / responsabili comunicazione durante meeting ed expo.',
      assetRequired: 'Presentazione aziendale PDF, scheda tecnica Limbo DADO, contatto referente.',
      score: '4/5',
      color: '#98d85b'
    }
  }

  // 2. Referral & Passaparola (Viola #8b5cf6)
  if (ch.includes('referral') || ch.includes('passaparola') || ch.includes('confindustria') || ch.includes('modelle') || name.includes('nextmedia') || name.includes('alpha')) {
    return {
      channel: 'Referral & Passaparola',
      shortChannel: 'REFERRAL',
      type: 'Caldissimo / Fiducia',
      reason: 'Collaborazione continuativa da agenzie di comunicazione o partner (es. NextMedia, Riva).',
      assetRequired: 'Portfolio lavori simili, condizioni quadro B2B.',
      score: '5/5',
      color: '#8b5cf6'
    }
  }

  // 3. Outreach B2B & LinkedIn InMail (Arancione #f97316)
  if (ch.includes('outreach') || ch.includes('cold') || ch.includes('linkedin') || ch.includes('inmail') || name.includes('aura') || name.includes('urban') || name.includes('nexura') || name.includes('beta')) {
    return {
      channel: 'Outreach B2B / LinkedIn InMail',
      shortChannel: 'B2B OUTREACH',
      type: 'Proattivo / Mirato',
      reason: 'Proposta proattiva per servizi video corporate, riprese con drone e render 3D per architettura e B2B.',
      assetRequired: 'Case study di settore (es. Officine Riva, Aura Design).',
      score: '4/5',
      color: '#f97316'
    }
  }

  // 4. Inbound Web & Social Direct (Rosa #ec4899)
  return {
    channel: 'Inbound Web & Social Direct',
    shortChannel: 'INBOUND & SOCIAL',
    type: 'Caldo / Inbound Diretto',
    reason: 'Richiesta preventivo da form sito, Gmail o messaggi diretti Instagram per spot e shooting.',
    assetRequired: 'Showreel studio, listino indicativo, disponibilità date.',
    score: '5/5',
    color: '#ec4899'
  }
}

// ── Acronimo B.A.N.T. con colori DADO in Switzer per sfondo chiaro ──
export function BantLogoMark({ size = 'sm', bant = null }) {
  const isSm = size === 'sm'
  const hasB = bant ? bant.hasB : true
  const hasA = bant ? bant.hasA : true
  const hasN = bant ? bant.hasN : true
  const hasT = bant ? bant.hasT : true

  return (
    <div
      className="inline-flex items-center gap-1.5 select-none px-2.5 py-0.5 rounded-lg bg-white border border-sky-300 shadow-xs shrink-0"
      style={{ fontFamily: '"Switzer", sans-serif' }}
      title={`Framework B.A.N.T. ${bant ? `(${bant.score}/4 completati${bant.missingList?.length ? ' - Manca: ' + bant.missingLabel : ''})` : ''}`}
    >
      {/* B • Budget */}
      <span
        className={`font-black ${isSm ? 'text-[14px]' : 'text-[17px]'} ${hasB ? 'text-[#16a34a]' : 'text-slate-300'} leading-none`}
      >
        B
      </span>
      <span className="text-slate-400 text-xs font-black">·</span>
      {/* A • Authority */}
      <span
        className={`font-black ${isSm ? 'text-[14px]' : 'text-[17px]'} ${hasA ? 'text-[#dc2626]' : 'text-slate-300'} leading-none`}
      >
        A
      </span>
      <span className="text-slate-400 text-xs font-black">·</span>
      {/* N • Need */}
      <span
        className={`font-black ${isSm ? 'text-[14px]' : 'text-[17px]'} ${hasN ? 'text-[#0284c7]' : 'text-slate-300'} leading-none`}
      >
        N
      </span>
      <span className="text-slate-400 text-xs font-black">·</span>
      {/* T • Timeline */}
      <span
        className={`font-black ${isSm ? 'text-[14px]' : 'text-[17px]'} ${hasT ? 'text-[#d97706]' : 'text-slate-300'} leading-none`}
      >
        T
      </span>
    </div>
  )
}

// Calcolo qualificazione B.A.N.T.
export function getCompanyBant(comp) {
  let budget = comp.bant?.budget
  let authority = comp.bant?.authority
  let need = comp.bant?.need
  let timeline = comp.bant?.timeline

  if (budget === undefined) {
    if (comp.compensation?.amount) {
      budget = `€ ${comp.compensation.amount.toLocaleString('it-IT')}`
    } else {
      budget = null
    }
  }

  if (authority === undefined) {
    if (comp.contactPerson?.name) {
      authority = comp.contactPerson.role
        ? `${comp.contactPerson.name} (${comp.contactPerson.role})`
        : comp.contactPerson.name
    } else {
      authority = null
    }
  }

  if (need === undefined) {
    if (comp.firstContact?.notes) {
      need = comp.firstContact.notes
    } else if (comp.requestedMaterials?.length) {
      need = comp.requestedMaterials[0]
    } else {
      need = null
    }
  }

  if (timeline === undefined) {
    if (comp.id === 'comp-8' || comp.name?.includes('Poggio Antico')) {
      timeline = null
    } else if (comp.workSchedule?.datesFormatted) {
      timeline = comp.workSchedule.datesFormatted
    } else if (comp.workSchedule?.scheduleType) {
      timeline = comp.workSchedule.scheduleType
    } else {
      timeline = null
    }
  }

  const hasB = Boolean(budget && !['non specificato', 'da definire', 'mancante', 'null'].includes(String(budget).toLowerCase()))
  const hasA = Boolean(authority && !['non specificato', 'da verificare', 'mancante', 'null'].includes(String(authority).toLowerCase()))
  const hasN = Boolean(need && !['non specificato', 'da chiarire', 'mancante', 'null'].includes(String(need).toLowerCase()))
  const hasT = Boolean(timeline && !['non specificato', 'da concordare', 'mancante', 'null'].includes(String(timeline).toLowerCase()))

  const score = (hasB ? 1 : 0) + (hasA ? 1 : 0) + (hasN ? 1 : 0) + (hasT ? 1 : 0)

  const missingList = []
  if (!hasB) missingList.push('Budget')
  if (!hasA) missingList.push('Authority')
  if (!hasN) missingList.push('Need')
  if (!hasT) missingList.push('Timeline')

  return {
    budget: hasB ? budget : 'Non specificato',
    authority: hasA ? authority : 'Referente da verificare',
    need: hasN ? need : 'Esigenza da approfondire',
    timeline: hasT ? timeline : 'Scadenza da concordare',
    hasB,
    hasA,
    hasN,
    hasT,
    score,
    isComplete: score === 4,
    missingList,
    missingLabel: missingList.join(', '),
  }
}

// ── Helper per formattare la data contratto in italiano (GG/MM/AAAA) ──
export function formatContractDate(dateStr) {
  if (!dateStr) return '-'
  try {
    const parts = dateStr.split('T')[0].split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('it-IT')
    }
  } catch (e) {}
  return dateStr
}

// ── Dizionario Storico Contratti per Azienda (ordinati cronologicamente dal primo al più recente) ──
export const KNOWN_CONTRACTS_HISTORY = {
  'comp-1': [
    {
      code: 'DADO-CTR-2026-079',
      date: '2026-07-15',
      title: 'Shooting Moda Summer & Noleggio Limbo Studio',
      amount: 4500,
      status: 'Firmato',
      digitalFormat: 'PDF con firma digitale DocuSign',
      terms: 'Convenzione quadro studio fotografico A; 3 mezze giornate Limbo.'
    },
    {
      code: 'DADO-CTR-2026-082',
      date: '2026-09-02',
      title: 'Campagna Moda Autunno/Inverno 2026 Lookbook E-commerce',
      amount: 7500,
      status: 'Firmato',
      digitalFormat: 'PDF con firma digitale qualificata',
      terms: 'Tariffa convenzionata shooting moda; embargo Fashion Week 1° Ottobre.'
    }
  ],
  'comp-2': [
    {
      code: 'DADO-CTR-2026-073',
      date: '2026-07-28',
      title: 'Subappalto BetaDigital Q3 - Spot Verticali',
      amount: 2800,
      status: 'Firmato',
      digitalFormat: 'PDF con firma elettronica',
      terms: 'Cessione totale diritti digital e paid ads; consegna bozze entro 48h.'
    },
    {
      code: 'DADO-CTR-2026-087',
      date: '2026-08-25',
      title: 'Pacchetto 12 Video TikTok/Reels Verticali 9:16',
      amount: 4800,
      status: 'Firmato',
      digitalFormat: 'PDF con firma elettronica qualificata',
      terms: 'Cessione diritti paid social e reels; consegna file ProRes master.'
    }
  ],
  'comp-3': [
    {
      code: 'DADO-CTR-2026-032',
      date: '2026-05-15',
      title: 'Shooting Pilota Linea Macchinari Industriali',
      amount: 3500,
      status: 'Firmato',
      digitalFormat: 'PDF con firma PEC',
      terms: 'Video test reparto presse; diritti web 12 mesi.'
    },
    {
      code: 'DADO-CTR-2026-088',
      date: '2026-09-18',
      title: 'Video Corporate Industriale 4K HDR ProRes + Cut 60s MecSpe',
      amount: 9200,
      status: 'Firmato',
      digitalFormat: 'PDF con firma digitale qualificata (PEC)',
      terms: 'Cessione diritti di trasmissione fiera e corporate 24 mesi; copertura RC terzi.'
    }
  ],
  'comp-4': [
    {
      code: 'DADO-CTR-2026-064',
      date: '2026-07-15',
      title: 'Contratto Regia Multicam Villa Cora Firenze',
      amount: 6500,
      status: 'Firmato',
      digitalFormat: 'PDF con firma elettronica avanzata',
      terms: 'Liberatorie privacy ospiti internazionali; saldo anticipato prima dell\'evento.'
    },
    {
      code: 'DADO-CTR-2026-079',
      date: '2026-08-10',
      title: 'Docufilm Wedding Luxury Internazionale & Regia Multicam',
      amount: 5800,
      status: 'Firmato',
      digitalFormat: 'PDF con firma digitale qualificata',
      terms: 'Regia 3 camere cinema; montaggio highlight 3 minuti in 48 ore.'
    }
  ],
  'comp-5': [
    {
      code: 'DADO-CTR-2026-068',
      date: '2026-08-10',
      title: 'Contratto Fornitura Campionario Ceramiche 2026',
      amount: 5400,
      status: 'Firmato',
      digitalFormat: 'PDF con firma digitale',
      terms: 'Accordo biennale per aggiornamento campionario; pagamento con RIBA 60gg.'
    },
    {
      code: 'DADO-CTR-2026-084',
      date: '2026-09-15',
      title: 'Catalogo Arredo Bagno 2027: Rendering 3D & Still Life',
      amount: 6100,
      status: 'Firmato',
      digitalFormat: 'PDF con firma digitale qualificata',
      terms: 'Rendering fotorealistici ad alta risoluzione per catalogo cartaceo e Cersaie.'
    }
  ],
  'comp-6': [
    {
      code: 'DADO-CTR-2026-041',
      date: '2026-06-10',
      title: 'Riprese Drone Parco Solare A1 & Teaser ESG',
      amount: 4200,
      status: 'Firmato',
      digitalFormat: 'PDF firmato digitalmente',
      terms: 'Autorizzazioni ENAC per volo drone su impianto; diritti digital.'
    },
    {
      code: 'DADO-CTR-2026-085',
      date: '2026-09-12',
      title: 'Spot TV Broadcast Nazionale 30s + Campagna Digital ADS Green',
      amount: 8400,
      status: 'Firmato',
      digitalFormat: 'PDF con firma elettronica avanzata',
      terms: 'Esclusiva di categoria energie rinnovabili 6 mesi; diritti messa in onda TV.'
    }
  ],
  'comp-7': [
    {
      code: 'DADO-CTR-2026-057',
      date: '2026-06-25',
      title: 'Serie 10 Video Ricette Chef Stellato Dettagli Macro',
      amount: 3600,
      status: 'Firmato',
      digitalFormat: 'PDF firmato con SPID',
      terms: 'Diritti di riproduzione canali digitali e schermi in sala ristorante per 3 anni.'
    },
    {
      code: 'DADO-CTR-2026-068',
      date: '2026-07-20',
      title: 'Shooting Food Packaging & Nuova Linea Gourmet',
      amount: 3900,
      status: 'Firmato',
      digitalFormat: 'PDF con firma digitale qualificata',
      terms: 'Diritti di stampa packaging e canali social per campagna retail.'
    }
  ],
  'comp-8': [
    {
      code: 'DADO-CTR-2026-045',
      date: '2026-05-18',
      title: 'Teaser Lancio Nuova Piattaforma SaaS AI & Brand Identity',
      amount: 2900,
      status: 'Firmato',
      digitalFormat: 'PDF firmato con clausola NDA riservatezza',
      terms: 'Vincolo di non divulgazione assoluto prima del closing del round di investimento.'
    },
    {
      code: 'DADO-CTR-2026-059',
      date: '2026-07-02',
      title: 'Brand Video Identity & Demo Prodotto UI/UX',
      amount: 3200,
      status: 'Firmato',
      digitalFormat: 'PDF con firma digitale',
      terms: 'Diritti mondiali per investor deck, sito web e annunci sponsorizzati.'
    }
  ],
  'comp-9': [
    {
      code: 'DADO-CTR-2026-038',
      date: '2026-05-02',
      title: 'Shooting Collezione Alta Moda Sposa per Catalogo Cartaceo',
      amount: 2300,
      status: 'Firmato',
      digitalFormat: 'PDF con firma elettronica avanzata',
      terms: 'Diritti stampa catalogo e distribuzione presso 45 boutique multimarca.'
    },
    {
      code: 'DADO-CTR-2026-053',
      date: '2026-05-18',
      title: 'Accordo Shooting SposaBellissima Campagna Social & Video Reel',
      amount: 3100,
      status: 'Firmato',
      digitalFormat: 'PDF con firma digitale qualificata',
      terms: 'Shooting abiti in location esterna storica a Torino; color grading luxury.'
    }
  ],
  'comp-10': [
    {
      code: 'DADO-CTR-2026-051',
      date: '2026-07-05',
      title: 'Contratto PoggioAntico Vendemmia Brunello Riserva',
      amount: 3200,
      status: 'Firmato',
      digitalFormat: 'PDF con firma digitale',
      terms: 'Cessione copyright per packaging globale ed export USA/Giappone.'
    },
    {
      code: 'DADO-CTR-2026-074',
      date: '2026-08-12',
      title: 'Docufilm Vendemmia 2026 Brunello di Montalcino & Shooting Bottiglie',
      amount: 4200,
      status: 'Firmato',
      digitalFormat: 'PDF con firma digitale qualificata',
      terms: 'Riprese con drone in vigna all\'alba e al tramonto; montaggio teaser 4K.'
    }
  ],
  'comp-11': [
    {
      code: 'DADO-CTR-2026-024',
      date: '2026-04-10',
      title: 'Contratto UrbanMobility Launch Campagna Outdoor',
      amount: 1500,
      status: 'Firmato',
      digitalFormat: 'PDF firmato digitalmente',
      terms: 'Diritti di affissione outdoor e sponsorizzate social a livello paneuropeo.'
    },
    {
      code: 'DADO-CTR-2026-047',
      date: '2026-07-15',
      title: 'Video Clip Dinamica Outdoor Bici Elettrica Urbana & Reels',
      amount: 2800,
      status: 'Firmato',
      digitalFormat: 'PDF con firma digitale qualificata',
      terms: 'Riprese dinamiche con gimbal e drone; cut verticali per TikTok e IG Reels.'
    }
  ],
  'comp-1790554320431': [
    {
      code: 'DADO-INB-0431',
      date: '2026-09-28',
      title: 'Produzione Contenuti Audiovisivi Inbound',
      amount: 5000,
      status: 'In elaborazione',
      digitalFormat: 'PDF Preventivo Inbound',
      terms: 'Richiesta rilevata da form inbound; preventivo in elaborazione.'
    }
  ],
  'comp-1790554140763': [
    {
      code: 'DADO-INB-0763',
      date: '2026-09-28',
      title: 'Shooting Video Corporate Stabilimento con Drone 4K',
      amount: 5000,
      status: 'In elaborazione',
      digitalFormat: 'PDF Preventivo Inbound',
      terms: 'Preventivo pilota per collaborazione continuativa agenzia.'
    }
  ]
}

// ── Helper per estrarre lo storico contratti in ordine temporale dal primo al più recente ──
export function getCompanyContractsHistory(comp) {
  let list = []
  if (comp.contractsHistory && Array.isArray(comp.contractsHistory) && comp.contractsHistory.length > 0) {
    list = [...comp.contractsHistory]
  } else if (KNOWN_CONTRACTS_HISTORY[comp.id]) {
    list = [...KNOWN_CONTRACTS_HISTORY[comp.id]]
  } else if (comp.contract?.code) {
    list = [{
      code: comp.contract.code,
      date: comp.contract.signedDate || comp.firstContact?.date || '2026-09-28',
      title: comp.contract.fileName?.replace(/_/g, ' ').replace('.pdf', '') || 'Contratto Servizi Audiovisivi',
      amount: comp.compensation?.amount || 0,
      status: comp.contract.status || 'Firmato',
      digitalFormat: comp.contract.digitalFormat || 'PDF',
      terms: comp.contract.terms || 'Termini contrattuali standard DADO Creative Studio'
    }]
  }

  // Ordine temporale rigoroso dal primo (più datato) al più recente
  list.sort((a, b) => {
    const timeA = new Date(a.date || '2026-01-01').getTime()
    const timeB = new Date(b.date || '2026-01-01').getTime()
    return timeA - timeB
  })

  return list
}

export default function Companies() {
  const { isDipendente } = useAuth()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRelationship, setFilterRelationship] = useState('all')
  const [filterBant, setFilterBant] = useState('all')
  const [sortBy, setSortBy] = useState('recent') // 'recent' (default), 'compensation_desc', 'rating_desc'
  const [expandedId, setExpandedId] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [copiedField, setCopiedField] = useState(null)

  function handleCopy(text, fieldKey, e) {
    if (e) e.stopPropagation()
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    setTimeout(() => {
      setCopiedField(null)
    }, 2000)
  }

  // Caricamento dati da /api/crm/summary o fallback
  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch('/api/crm/summary')
        if (res.ok) {
          const data = await res.json()
          if (data.companies && data.companies.length > 0) {
            setCompanies(data.companies)
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.warn('Caricamento API, uso fallback:', err)
      }
      setLoading(false)
    }
    loadCompanies()
  }, [])

  // Filtro e ordinamento con lavori imminenti in primo piano
  const filteredCompanies = useMemo(() => {
    let list = [...companies]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.contactPerson?.name?.toLowerCase().includes(q) ||
        c.contactPerson?.role?.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.contact?.email?.toLowerCase().includes(q) ||
        c.contact?.directEmail?.toLowerCase().includes(q) ||
        c.contact?.phone?.toLowerCase().includes(q) ||
        c.contact?.mobile?.toLowerCase().includes(q) ||
        c.contract?.fileName?.toLowerCase().includes(q) ||
        c.workSchedule?.scheduleType?.toLowerCase().includes(q) ||
        c.workSchedule?.datesFormatted?.toLowerCase().includes(q) ||
        c.compensation?.status?.toLowerCase().includes(q) ||
        c.issues?.description?.toLowerCase().includes(q) ||
        (c.requestedMaterials && c.requestedMaterials.some(m => m.toLowerCase().includes(q)))
      )
    }

    if (filterRelationship !== 'all') {
      list = list.filter(c => getCompanyRelationshipStatus(c).key === filterRelationship)
    }

    if (filterBant !== 'all') {
      list = list.filter(c => {
        const bant = getCompanyBant(c)
        return filterBant === 'complete' ? bant.isComplete : !bant.isComplete
      })
    }

    // Ordinamento commesse: recent (default), compensation_desc, rating_desc
    list.sort((a, b) => {
      if (sortBy === 'recent') {
        const dateA = new Date(a.workSchedule?.recentDate || a.contract?.signedDate || a.lastContact || 0)
        const dateB = new Date(b.workSchedule?.recentDate || b.contract?.signedDate || b.lastContact || 0)
        return dateB - dateA
      }
      if (sortBy === 'compensation_desc') {
        return (b.compensation?.amount || 0) - (a.compensation?.amount || 0)
      }
      if (sortBy === 'rating_desc') {
        return (b.feedback?.rating || 0) - (a.feedback?.rating || 0)
      }
      return 0
    })

    return list
  }, [companies, search, filterRelationship, filterBant, sortBy])

  return (
    <div
      className="h-full min-h-screen md:min-h-0 flex flex-col flex-1 relative overflow-hidden"
      style={{
        backgroundColor: 'transparent',
        fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* ── CANVAS AZZURRO TENUE (Angolo superiore sinistro retto a filo con la barra laterale) ── */}
      <div
        className="h-full flex-1 rounded-tl-none rounded-bl-[48px] flex flex-col justify-between relative min-w-0 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #f0f8fd 0%, #e5f3fa 100%)',
          borderLeft: '1.5px solid #d4ebf9',
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
          borderTopLeftRadius: '0px',
        }}
      >
        {/* ── AREA PRINCIPALE CON TESTATA AZ & CO ── */}
        <div className="flex-1 min-h-0 px-4 md:px-7 py-3 overflow-y-auto">

          {/* ── TESTATA IN SWITZER CON TITOLO AZ & CO E BADGE CONTRACTS ── */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-sky-200/80">
            {/* Sinistra: Titolo e Badge CONTRACTS */}
            <div className="flex-shrink-0">
              <h1
                className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5"
                style={{ fontFamily: '"Switzer", sans-serif' }}
              >
                <span>Az & Co</span>
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
                    contracts
                  </span>
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5 leading-normal">
                Anagrafica clienti, accordi contrattuali e compensi
              </p>
            </div>

            {/* Centro: BARRA DI RICERCA CENTRATA */}
            <div className="flex-1 flex justify-center px-2 min-w-0">
              <div className="relative w-full max-w-[380px] sm:max-w-[440px] md:max-w-[480px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0284c7] stroke-[2.5] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cerca azienda, referente, telefono, contratto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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

            {/* Destra: Pulsante Nuova Azienda */}
            {!isDipendente && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                  style={{ fontFamily: '"Switzer", sans-serif', fontWeight: 800 }}
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Nuova Azienda</span>
                </button>
              </div>
            )}
          </div>

          {/* Riga 2: Filtri rapidi traslati dall'altro lato della pagina (destra), forma rettangolare con angoli retti e finitura grigio metallizzato */}
          <div className="w-full flex items-center justify-end gap-2 overflow-x-auto pb-0.5 mb-3.5 no-scrollbar text-xs">
            {[
              { id: 'lead_inbound', label: 'Lead & Inbound', emoji: '🎯' },
              { id: 'in_attesa_risposta', label: 'In attesa', emoji: '🔄' },
              { id: 'in_coda_pagamento', label: 'Coda pagamento', emoji: '⏳' },
              { id: 'lavoro_concluso', label: 'Concluso', emoji: '✅' },
            ].map(f => {
              const isActive = filterRelationship === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setFilterRelationship(prev => prev === f.id ? 'all' : f.id)}
                  className={`px-3.5 py-1.5 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border select-none active:scale-95 ${
                    isActive
                      ? 'border-slate-800 text-white shadow-sm'
                      : 'border-slate-400/80 text-slate-800 hover:brightness-95 hover:border-slate-500 shadow-xs'
                  }`}
                  style={{
                    borderRadius: '0px',
                    background: isActive
                      ? 'linear-gradient(180deg, #64748b 0%, #475569 35%, #334155 75%, #1e293b 100%)'
                      : 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 30%, #cbd5e1 70%, #94a3b8 100%)',
                    boxShadow: isActive
                      ? 'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.2)'
                      : 'inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <span className="text-xs leading-none">{f.emoji}</span>
                  <span className="leading-none">{f.label}</span>
                </button>
              )
            })}
          </div>

          {/* ── LISTA SCHEDE AZIENDE: CARDS CHIARE SU SFONDO AZZURRO TENUE (NO RIQUADRINI) ── */}
          {loading ? (
            <div className="py-16 text-center text-slate-500 font-semibold text-sm">
              Caricamento database aziende in corso...
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="py-16 text-center bg-white p-8 rounded-2xl border border-sky-200 shadow-sm max-w-lg mx-auto">
              <Company3DIcon size={44} className="text-sky-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Nessuna azienda trovata
              </h3>
              <p className="text-slate-500 text-xs">
                Nessun risultato corrisponde alla ricerca corrente.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-8">
              {filteredCompanies.map((comp) => {
                const isExpanded = expandedId === comp.id
                const relStatus = getCompanyRelationshipStatus(comp)
                const bant = getCompanyBant(comp)
                const acq = getCompanyAcquisitionChannel(comp)
                const contactEmail = comp.contact?.directEmail || comp.contact?.email
                const contactPhone = comp.contact?.mobile || comp.contact?.phone
                const contractsHistory = getCompanyContractsHistory(comp)

                return (
                  <div
                    key={comp.id}
                    className="p-4 md:p-5 transition-all text-slate-800 relative bg-white rounded-2xl shadow-xs hover:shadow-md"
                    style={{
                      border: isExpanded ? '2px solid #0284c7' : '1px solid #cce5f6',
                      boxShadow: isExpanded ? '0 4px 20px rgba(2, 132, 199, 0.12)' : '0 2px 10px rgba(27, 183, 237, 0.06)',
                    }}
                  >
                    {/* ── 1. TESTATA SCHEDA: NOME AZIENDA, STATO, LAVORO IMMINENTE & RETRIBUZIONE ── */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-sky-100">
                      
                      {/* Sinistra: Nome Grande Switzer, Settore, Badge di Stato e BANT */}
                      <div className="flex items-start sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2
                              className="text-xl md:text-2xl font-black text-slate-900 tracking-tight"
                              style={{ fontFamily: '"Switzer", sans-serif' }}
                            >
                              {comp.name}
                            </h2>

                            {/* Settore con testo bold */}
                            <span
                              className="px-2.5 py-1 bg-sky-50 text-[#0369a1] border border-sky-200 text-xs md:text-sm font-black rounded-lg uppercase tracking-wide"
                            >
                              {comp.industry}
                            </span>

                            {/* Badge Stato Relazione & Pagamento in colori DADO su fondo chiaro */}
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold"
                              style={{
                                backgroundColor: relStatus.bg,
                                color: relStatus.color,
                                border: `1px solid ${relStatus.border}`,
                              }}
                            >
                              <span>{relStatus.emoji}</span>
                              <strong className="font-extrabold">{relStatus.tag}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Destra: Retribuzione e Tasto Dettagli */}
                      <div className="flex items-center justify-between lg:justify-end gap-5">
                        <div className="text-left lg:text-right">
                          <div className="text-[11px] uppercase text-slate-400 font-extrabold tracking-wider">
                            RETRIBUZIONE
                          </div>
                          <div
                            className="text-xl md:text-2xl font-black leading-none mt-0.5 text-[#0284c7]"
                          >
                            <strong>
                              {isDipendente ? (
                                <span className="text-slate-400 font-mono text-base tracking-widest" title="Valore riservato ad Amministratore">
                                  •••• €
                                </span>
                              ) : (
                                `€ ${(comp.compensation?.amount || 0).toLocaleString('it-IT')}`
                              )}
                            </strong>
                          </div>
                          <div className="mt-1">
                            <span
                              className={`text-[11px] font-extrabold px-2 py-0.5 uppercase tracking-wide rounded-md ${
                                comp.compensation?.status === 'Saldato'
                                  ? 'bg-[#dcfce7] text-[#15803d]'
                                  : 'bg-[#ffedd5] text-[#c2410c]'
                              }`}
                            >
                              <strong>{comp.compensation?.status === 'Saldato' ? 'SALDATO' : comp.compensation?.status?.toUpperCase()}</strong>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : comp.id)}
                          className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer rounded-xl border ${
                            isExpanded
                              ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-xs'
                              : 'bg-sky-50 hover:bg-sky-100 text-[#0284c7] border-sky-200'
                          }`}
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          <strong className="font-extrabold">{isExpanded ? 'CHIUDI' : 'DETTAGLI'}</strong>
                          {isExpanded ? <ChevronUp className="w-4 h-4 stroke-[2.5]" /> : <ChevronDown className="w-4 h-4 stroke-[2.5]" />}
                        </button>
                      </div>

                    </div>

                    {/* ── 2. LAYOUT APERTO E FLUIDO A 3 COLONNE (SENZA RIQUADRO BANT) ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3.5 text-sm">
                      
                      {/* Sezione 1: Referente, Recapiti Diretti & Canale */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-[#0284c7] flex items-center gap-1.5 mb-1.5">
                            <User className="w-4 h-4" />
                            <strong>REFERENTE & ACQUISIZIONE</strong>
                          </div>
                          <div className="font-black text-slate-900 text-base md:text-[17px] truncate" title={comp.contactPerson?.name}>
                            {comp.contactPerson?.name || 'Referente non indicato'}
                          </div>
                          <div className="text-xs md:text-sm text-slate-600 truncate font-semibold mt-0.5">
                            {comp.contactPerson?.role || comp.contact?.role || 'Referente aziendale'}
                          </div>
                        </div>

                        {/* Recapiti veloci con etichette corte in bold + Canale */}
                        <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-sky-100/80 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            {contactEmail && (
                              <button
                                type="button"
                                onClick={(e) => handleCopy(contactEmail, `${comp.id}-email`, e)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs transition-all cursor-pointer border ${
                                  copiedField === `${comp.id}-email`
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                                    : 'bg-sky-50 hover:bg-sky-100 text-slate-700 border-sky-200'
                                }`}
                                title={`Copia email: ${contactEmail}`}
                              >
                                <Mail className="w-3 h-3 text-[#0284c7]" />
                                <strong>{copiedField === `${comp.id}-email` ? 'COPIATA' : 'MAIL'}</strong>
                              </button>
                            )}
                            {contactPhone && (
                              <button
                                type="button"
                                onClick={(e) => handleCopy(contactPhone, `${comp.id}-phone`, e)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs transition-all cursor-pointer border ${
                                  copiedField === `${comp.id}-phone`
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                                    : 'bg-sky-50 hover:bg-sky-100 text-slate-700 border-sky-200'
                                }`}
                                title={`Copia telefono: ${contactPhone}`}
                              >
                                <Phone className="w-3 h-3 text-[#0284c7]" />
                                <strong>{copiedField === `${comp.id}-phone` ? 'COPIATO' : 'TEL'}</strong>
                              </button>
                            )}
                          </div>

                          <span className="text-xs text-slate-500 font-medium truncate">
                            Canale: <strong className="text-slate-800 uppercase">{acq?.shortChannel || 'INBOUND'}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Sezione 2: Riquadro Storico Contratti (in ordine temporale dal primo al più recente) */}
                      <div className="flex flex-col justify-between pl-0 md:pl-4 md:border-l md:border-sky-100">
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-[#0284c7] flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[#0284c7]" />
                              <strong>STORICO CONTRATTI</strong>
                            </div>
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-100 text-[#0369a1]">
                              {contractsHistory.length} {contractsHistory.length === 1 ? 'CONTRATTO' : 'CONTRATTI'}
                            </span>
                          </div>

                          {/* Lista contratti ordinati cronologicamente: dal primo al più recente */}
                          <div className="flex flex-col gap-1.5 max-h-[118px] overflow-y-auto pr-1">
                            {contractsHistory.map((ctr, idx) => (
                              <div
                                key={ctr.code || idx}
                                className="p-1.5 rounded-lg bg-sky-50/70 border border-sky-100/90 text-xs flex items-center justify-between gap-2 hover:bg-sky-50 transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-sky-200/80 text-[#0369a1]">
                                      {idx + 1}°
                                    </span>
                                    <strong className="font-extrabold text-slate-800 font-mono text-[11px] truncate">
                                      {ctr.code}
                                    </strong>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {formatContractDate(ctr.date)}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-600 font-semibold truncate mt-0.5" title={ctr.title}>
                                    {ctr.title}
                                  </div>
                                </div>

                                <div className="text-right shrink-0 flex flex-col items-end">
                                  <strong className="font-black text-slate-900 text-xs">
                                    {isDipendente ? '•••• €' : `€ ${(ctr.amount || 0).toLocaleString('it-IT')}`}
                                  </strong>
                                  <span
                                    className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase mt-0.5 ${
                                      ctr.status === 'Firmato' || ctr.status === 'Saldato'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {ctr.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer riquadro Storico Contratti */}
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-sky-100/80 text-[11px]">
                          <span className="text-slate-400 font-medium">
                            1° Accordo: <strong className="text-slate-700">{formatContractDate(contractsHistory[0]?.date)}</strong>
                          </span>
                          <span className="text-slate-500 font-bold">
                            Totale: <strong className="text-[#0284c7]">{isDipendente ? '•••• €' : `€ ${contractsHistory.reduce((s, c) => s + (c.amount || 0), 0).toLocaleString('it-IT')}`}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Sezione 3: Contratto Attivo, Stato & Criticità */}
                      <div className="flex flex-col justify-between pl-0 md:pl-4 md:border-l md:border-sky-100">
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-[#ea580c] flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              <strong>CONTRATTO ATTIVO</strong>
                            </div>
                            <span className="flex items-center gap-1 text-amber-600 font-black text-xs">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <strong>{comp.feedback?.rating ? comp.feedback.rating.toFixed(1) : '5.0'}</strong>
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 text-sm truncate" title={comp.contract?.fileName}>
                            {comp.contract?.fileName || comp.contract?.code || 'CTR-DADO-2026'}
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">
                            Formato: <strong className="text-slate-700">{comp.contract?.digitalFormat || 'PDF'}</strong> • <strong className="text-slate-700">{comp.contract?.status?.toUpperCase() || 'FIRMATO'}</strong>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-sky-100/80 text-xs truncate">
                          {comp.issues?.isResolved === 'Risolto' ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <strong>CRITICITÀ RISOLTA (100%)</strong>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">Nessuna criticità emersa</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* ── 3. DETTAGLI COMPLETI ESPANSI (IN SWITZER SU SFONDO CHIARO SENZA RIQUADRETTI DURI) ── */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-sky-100 flex flex-col gap-4 animate-in fade-in duration-150 text-slate-800">
                        
                        {/* Sezione B.A.N.T. Approfondita */}
                        <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200">
                          <div className="flex items-center justify-between pb-2 mb-3 border-b border-sky-200/80 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <BantLogoMark size="md" bant={bant} />
                              <strong className="text-sm font-black uppercase tracking-wider text-slate-900">
                                QUALIFICAZIONE COMMERCIALE B.A.N.T.
                              </strong>
                            </div>
                            {bant.isComplete ? (
                              <span className="text-xs text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                                🟢 4/4 PARAMETRI RILEVATI • LEAD QUALIFICATO
                              </span>
                            ) : (
                              <span className="text-xs text-amber-800 font-extrabold bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
                                ⚠️ {4 - bant.score} PARAMETRI MANCANTI: {bant.missingLabel.toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            {/* Budget */}
                            <div className="p-3.5 bg-white rounded-xl border border-sky-100 shadow-xs">
                              <div className="text-sm font-black uppercase text-[#16a34a] flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-md bg-[#16a34a]/10 flex items-center justify-center text-[#16a34a] font-black text-xs">B</span>
                                  <span>BUDGET</span>
                                </span>
                                {!bant.hasB && <strong className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">DA DEFINIRE</strong>}
                              </div>
                              <div className="text-base font-black text-slate-900 mt-1.5">
                                {isDipendente ? (
                                  <span className="text-slate-400 font-mono text-sm tracking-wider" title="Budget riservato ad Amministratore">
                                    🔒 Riservato
                                  </span>
                                ) : (
                                  bant.budget
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                Capacità di spesa allocata per l'intervento
                              </div>
                            </div>

                            {/* Authority */}
                            <div className="p-3.5 bg-white rounded-xl border border-sky-100 shadow-xs">
                              <div className="text-sm font-black uppercase text-[#dc2626] flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-md bg-[#dc2626]/10 flex items-center justify-center text-[#dc2626] font-black text-xs">A</span>
                                  <span>AUTHORITY</span>
                                </span>
                                {!bant.hasA && <strong className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">DA VERIFICARE</strong>}
                              </div>
                              <div className="text-sm md:text-base font-black text-slate-900 mt-1.5 truncate" title={bant.authority}>
                                {bant.authority}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                Referente decisionale con potere di firma
                              </div>
                            </div>

                            {/* Need */}
                            <div className="p-3.5 bg-white rounded-xl border border-sky-100 shadow-xs">
                              <div className="text-sm font-black uppercase text-[#0284c7] flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-md bg-[#0284c7]/10 flex items-center justify-center text-[#0284c7] font-black text-xs">N</span>
                                  <span>NEED</span>
                                </span>
                                {!bant.hasN && <strong className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">DA CHIARIRE</strong>}
                              </div>
                              <div className="text-xs md:text-sm font-bold text-slate-900 mt-1.5 line-clamp-2 leading-relaxed" title={bant.need}>
                                {bant.need}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                Esigenza operativa e output atteso
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="p-3.5 bg-white rounded-xl border border-sky-100 shadow-xs">
                              <div className="text-sm font-black uppercase text-[#d97706] flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-md bg-[#d97706]/10 flex items-center justify-center text-[#d97706] font-black text-xs">T</span>
                                  <span>TIMELINE</span>
                                </span>
                                {!bant.hasT && <strong className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">DA FISSARE</strong>}
                              </div>
                              <div className="text-sm md:text-base font-black text-slate-900 mt-1.5">
                                {bant.timeline}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                Finestra temporale di erogazione
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Griglia 2 Colonne Aperta */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          
                          {/* Colonna 1: Storico e Orari */}
                          <div className="flex flex-col gap-3">
                            <div className="p-3.5 bg-white rounded-xl border border-sky-100 shadow-xs">
                              <strong className="text-xs font-black uppercase text-[#0284c7] flex items-center gap-1.5 mb-2">
                                <Clock className="w-4 h-4" />
                                PROGRAMMAZIONE ORARI & LOCATION
                              </strong>
                              <div className="text-sm font-extrabold text-slate-900">
                                {comp.workSchedule?.datesFormatted || 'Date da calendarizzare'}
                              </div>
                              <div className="text-xs text-slate-600 font-semibold mt-1">
                                Tipologia: <strong>{comp.workSchedule?.scheduleType}</strong>
                              </div>
                              <div className="text-xs text-slate-600 mt-1">
                                Orari: <strong>{comp.workSchedule?.hours || 'Standard'}</strong>
                              </div>
                              {comp.workSchedule?.location && (
                                <div className="text-xs text-slate-600 mt-1">
                                  Location: <strong>{comp.workSchedule?.location}</strong>
                                </div>
                              )}
                            </div>

                            <div className="p-4 bg-white rounded-xl border border-sky-200 shadow-xs">
                              <strong className="text-sm font-black uppercase text-[#d97706] flex items-center gap-1.5 mb-2">
                                <Calendar className="w-4 h-4" />
                                1° CONTATTO & ACQUISIZIONE
                              </strong>
                              <div className="text-sm text-slate-600 mb-2">
                                Data: <strong className="text-slate-900 font-black text-sm">{comp.firstContact?.date}</strong> • Canale: <strong className="text-[#0284c7] font-black text-sm">{comp.firstContact?.channel}</strong>
                              </div>
                              <p className="text-sm text-slate-800 leading-relaxed font-semibold bg-slate-50 p-3 rounded-lg border border-slate-200">
                                {comp.firstContact?.notes || 'Nessuna nota iniziale.'}
                              </p>
                            </div>
                          </div>

                          {/* Colonna 2: Materiali, Contratto e Dettaglio Finanziario */}
                          <div className="flex flex-col gap-3">
                            <div className="p-3.5 bg-white rounded-xl border border-sky-100 shadow-xs">
                              <strong className="text-xs font-black uppercase text-[#ea580c] flex items-center gap-1.5 mb-2">
                                <Camera className="w-4 h-4" />
                                MATERIALI & OUTPUT RICHIESTI
                              </strong>
                              <div className="flex flex-wrap gap-1.5">
                                {comp.requestedMaterials?.map((item, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-md"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="p-3.5 bg-white rounded-xl border border-sky-100 shadow-xs">
                              <div className="flex items-center justify-between mb-2">
                                <strong className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                                  <FileText className="w-4 h-4 text-[#0284c7]" />
                                  STORICO DETTAGLIATO CONTRATTI
                                </strong>
                                <span className="text-[11px] font-extrabold px-2 py-0.5 bg-sky-100 text-[#0369a1] rounded">
                                  {contractsHistory.length} {contractsHistory.length === 1 ? 'CONTRATTO' : 'CONTRATTI'}
                                </span>
                              </div>
                              <div className="flex flex-col gap-2 mt-1">
                                {contractsHistory.map((ctr, idx) => (
                                  <div key={ctr.code || idx} className="p-2 rounded-lg bg-sky-50/60 border border-sky-100 text-xs">
                                    <div className="flex items-center justify-between font-bold text-slate-900">
                                      <span className="flex items-center gap-1.5">
                                        <span className="px-1.5 py-0.2 rounded bg-sky-200 text-[#0369a1] text-[10px] font-black">{idx + 1}°</span>
                                        <span className="font-mono text-[11px]">{ctr.code}</span>
                                        <span className="text-slate-400 font-normal">({formatContractDate(ctr.date)})</span>
                                      </span>
                                      <span className="text-[#0284c7] font-black">{isDipendente ? '•••• €' : `€ ${(ctr.amount || 0).toLocaleString('it-IT')}`}</span>
                                    </div>
                                    <div className="text-slate-800 font-semibold mt-1">{ctr.title}</div>
                                    {ctr.terms && (
                                      <div className="text-[11px] text-slate-500 mt-0.5">
                                        <strong>Termini:</strong> {ctr.terms}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Riga Inferiore: Feedback e Risoluzione Criticità */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-1">
                          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                            <div className="flex items-center justify-between mb-1.5">
                              <strong className="text-xs font-black uppercase text-amber-800 flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                FEEDBACK SULLA COLLABORAZIONE
                              </strong>
                              <strong className="text-xs font-black text-amber-800">
                                ★ {comp.feedback?.rating} / 5.0
                              </strong>
                            </div>
                            <p className="text-xs text-slate-800 italic leading-relaxed">
                              "{comp.feedback?.notes}"
                            </p>
                          </div>

                          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                            <div className="flex items-center justify-between mb-1.5">
                              <strong className="text-xs font-black uppercase text-emerald-800 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                GESTIONE CRITICITÀ
                              </strong>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                                ✓ {comp.issues?.isResolved?.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-xs text-slate-800 mb-1">
                              <strong>Criticità:</strong> {comp.issues?.description}
                            </div>
                            <div className="text-xs text-emerald-900 font-medium">
                              <strong>Soluzione adottata:</strong> {comp.issues?.resolution}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                )
              })}
            </div>
          )}

        </div>

      </div>

      {/* ── MODAL AGGIUNGI NUOVA SCHEDA AZIENDA IN SWITZER E TEMA AZZURRO CHIARO ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-white border border-sky-200 p-6 max-w-2xl w-full my-8 text-left shadow-2xl rounded-2xl relative text-slate-800"
            style={{ fontFamily: '"Switzer", sans-serif' }}
          >
            <div className="flex items-center justify-between mb-4 border-b border-sky-100 pb-3">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#0284c7] stroke-[3]" />
                Nuova Scheda Azienda & Collaborazione
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg p-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.target)
                const newCompany = {
                  id: 'comp-' + Date.now(),
                  name: fd.get('name') || 'Nuova Azienda',
                  industry: fd.get('industry') || 'Settore Creativo',
                  status: 'Attivo',
                  contactPerson: {
                    name: fd.get('contactPerson') || 'Referente',
                    role: fd.get('role') || 'Referente'
                  },
                  contact: {
                    email: fd.get('email') || '',
                    phone: fd.get('phone') || ''
                  },
                  firstContact: {
                    date: new Date().toISOString().split('T')[0],
                    channel: fd.get('firstContactChannel') || 'Inbound',
                    notes: fd.get('firstContactNotes') || ''
                  },
                  requestedMaterials: (fd.get('materials') || '').split(',').map(s => s.trim()).filter(Boolean),
                  contract: {
                    code: 'DADO-CTR-' + Date.now().toString().slice(-4),
                    fileName: `Contratto_${(fd.get('name') || 'Azienda').replace(/\s+/g, '_')}_signed.pdf`,
                    digitalFormat: 'PDF firmato digitalmente',
                    status: 'Firmato',
                    signedDate: new Date().toISOString().split('T')[0],
                    terms: fd.get('contractTerms') || 'Termini standard DADO Studio'
                  },
                  contractsHistory: [
                    {
                      code: 'DADO-CTR-' + Date.now().toString().slice(-4),
                      date: new Date().toISOString().split('T')[0],
                      title: `Contratto Iniziale - ${fd.get('name') || 'Nuova Azienda'}`,
                      amount: parseFloat(fd.get('amount')) || 0,
                      status: 'Firmato',
                      digitalFormat: 'PDF firmato digitalmente',
                      terms: fd.get('contractTerms') || 'Termini standard DADO Studio'
                    }
                  ],
                  workSchedule: {
                    scheduleType: fd.get('scheduleType') || 'Un giorno intero',
                    datesFormatted: fd.get('workDates') || 'Da concordare',
                    hours: fd.get('workHours') || 'Standard',
                    recentDate: new Date().toISOString().split('T')[0]
                  },
                  feedback: {
                    rating: parseFloat(fd.get('rating')) || 5.0,
                    notes: fd.get('feedbackNotes') || 'Prima collaborazione completata.'
                  },
                  compensation: {
                    amount: parseFloat(fd.get('amount')) || 0,
                    deposit: parseFloat(fd.get('deposit')) || 0,
                    balance: (parseFloat(fd.get('amount')) || 0) - (parseFloat(fd.get('deposit')) || 0),
                    status: (parseFloat(fd.get('amount')) || 0) === (parseFloat(fd.get('deposit')) || 0) ? 'Saldato' : 'Acconto versato',
                    paymentMethod: 'Bonifico Bancario'
                  },
                  issues: {
                    hasIssue: !!fd.get('issueDescription'),
                    description: fd.get('issueDescription') || 'Nessuna criticità emersa.',
                    isResolved: 'Risolto',
                    resolution: fd.get('issueResolution') || 'Collaborazione fluida senza intoppi.'
                  },
                  lastContact: new Date().toISOString()
                }

                setCompanies([newCompany, ...companies])
                setShowAddModal(false)
              }}
              className="flex flex-col gap-3.5 text-xs text-slate-800"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Nome Azienda *</label>
                  <input name="name" required placeholder="Es. Omega Fashion Milano" className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Settore</label>
                  <input name="industry" placeholder="Es. Moda & ADV" className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Referente e Ruolo</label>
                  <input name="contactPerson" placeholder="Es. Laura Neri (Art Buyer)" className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Email e Telefono</label>
                  <input name="email" placeholder="laura@omega.it, +39 02 123456" className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Importo Totale (€)</label>
                  <input name="amount" type="number" defaultValue="5000" className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Acconto Versato (€)</label>
                  <input name="deposit" type="number" defaultValue="2500" className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Date Lavori</label>
                  <input name="workDates" placeholder="Es. 15 e 16 Ottobre" className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold" />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-3 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold rounded-lg shadow-xs cursor-pointer"
                >
                  Salva Scheda Azienda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
