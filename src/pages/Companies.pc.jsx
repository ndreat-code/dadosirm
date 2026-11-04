import { useState, useEffect, useMemo, Fragment } from 'react'
import { useAuth } from '../context/AuthContext'
import { RotateCcw, X as CloseIcon, Archive, Paperclip } from 'lucide-react'
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
  Zap,
  RefreshCw,
  ShieldCheck,
  Users,
  History,
  Trash2,
  Table,
  LayoutList,
  ChevronRight,
} from 'lucide-react'
import B2BEnrichmentModal from '../components/B2BEnrichmentModal'
import HorizontalTableScroller from '../components/HorizontalTableScroller'

// Helper per determinare lo stato di relazione / pagamento dell'azienda
function getCompanyRelationshipStatus(comp) {
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
function getCompanyAcquisitionChannel(comp) {
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
function BantLogoMark({ size = 'sm', bant = null }) {
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
      <span className="text-slate-400 text-[15px] font-black">·</span>
      {/* A • Authority */}
      <span
        className={`font-black ${isSm ? 'text-[14px]' : 'text-[17px]'} ${hasA ? 'text-[#dc2626]' : 'text-slate-300'} leading-none`}
      >
        A
      </span>
      <span className="text-slate-400 text-[15px] font-black">·</span>
      {/* N • Need */}
      <span
        className={`font-black ${isSm ? 'text-[14px]' : 'text-[17px]'} ${hasN ? 'text-[#0284c7]' : 'text-slate-300'} leading-none`}
      >
        N
      </span>
      <span className="text-slate-400 text-[15px] font-black">·</span>
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
function getCompanyBant(comp) {
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
    if (Array.isArray(comp.subjectRequests) && comp.subjectRequests.length > 0) {
      need = comp.subjectRequests.join(' • ')
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
function formatContractDate(dateStr) {
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
const KNOWN_CONTRACTS_HISTORY = {
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
function getCompanyContractsHistory(comp) {
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

const MONDAY_GROUPS = [
  {
    id: 'lead_inbound',
    title: 'LEAD & INBOUND',
    emoji: '🎯',
    color: '#0073ea',
    bg: '#f0f7ff',
    border: '#cce3fd',
    tag: 'LEAD',
    subtitle: 'Primo contatto & proposta commerciale',
  },
  {
    id: 'in_attesa_risposta',
    title: 'IN ATTESA RISPOSTA',
    emoji: '🔄',
    color: '#a25ddc',
    bg: '#fbf7ff',
    border: '#eedafc',
    tag: 'IN ATTESA',
    subtitle: 'Preventivo inviato / delibera cliente',
  },
  {
    id: 'in_coda_pagamento',
    title: 'IN CODA PAGAMENTO',
    emoji: '⏳',
    color: '#fdab3d',
    bg: '#fffbf2',
    border: '#fee8c4',
    tag: 'ATTESA PAGAMENTO',
    subtitle: 'Lavoro confermato, acconto o saldo in attesa',
  },
  {
    id: 'lavoro_concluso',
    title: 'LAVORO CONCLUSO',
    emoji: '✅',
    color: '#00c875',
    bg: '#f2fcf7',
    border: '#c3f5df',
    tag: 'CONCLUSO',
    subtitle: 'Commesse completate e saldate',
  },
]

export default function Companies() {
  const { isDipendente } = useAuth()
  const [companies, setCompanies] = useState([])
  // Schede rimosse (recuperabili): salvate in locale perché il server non ha un DELETE aziende
  const [removedCompanies, setRemovedCompanies] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dado_crm_removed_companies') || '[]') } catch { return [] }
  })
  const [showRemovedModal, setShowRemovedModal] = useState(false)
  useEffect(() => {
    localStorage.setItem('dado_crm_removed_companies', JSON.stringify(removedCompanies))
  }, [removedCompanies])
  const restoreCompany = (comp) => {
    setRemovedCompanies(prev => prev.filter(c => c.id !== comp.id))
    setCompanies(prev => prev.some(c => c.id === comp.id) ? prev : [comp, ...prev])
  }
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRelationship, setFilterRelationship] = useState('all')
  const [filterBant, setFilterBant] = useState('all')
  const [sortBy, setSortBy] = useState('recent') // 'recent' (default), 'compensation_desc', 'rating_desc'
  const [expandedId, setExpandedId] = useState(null)
  const [viewMode, setViewMode] = useState('monday') // 'monday' (default) | 'cards'
  const [collapsedGroups, setCollapsedGroups] = useState({})
  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }))
  }
  const [showAddModal, setShowAddModal] = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const [showEnrichModal, setShowEnrichModal] = useState(false)
  const [enrichModalQuery, setEnrichModalQuery] = useState('')
  const [enrichLoading, setEnrichLoading] = useState(false)
  const [enrichFeedback, setEnrichFeedback] = useState(null)
  const [enrichVatInput, setEnrichVatInput] = useState('')


  const INITIAL_NEW_COMPANY_FORM = {
    name: '',
    piva: '',
    fiscalCode: '',
    industry: '',
    contactPerson: '',
    role: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    sdi: '',
    pec: '',
    amount: '8000',
    deposit: '2500',
    workDates: 'Da concordare',
    scheduleType: 'Un giorno intero',
    firstContactChannel: 'Inbound B2B Enrichment',
    firstContactNotes: '',
    materials: 'Shooting Video Corporate Stabilimento 4K, Spot ADV HDR Limbo Studio',
    contractTerms: '30% acconto alla conferma, 70% a 30gg d.f.'
  }

  const [newCompanyForm, setNewCompanyForm] = useState(INITIAL_NEW_COMPANY_FORM)

  async function handleAutoEnrichInForm(queryVal) {
    const q = (queryVal || enrichVatInput || newCompanyForm.piva || newCompanyForm.name || '').trim()
    if (!q) return
    setEnrichLoading(true)
    setEnrichFeedback(null)
    try {
      const res = await fetch('/api/crm/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      })
      const data = await res.json()
      if (res.ok && data.success && data.company) {
        const c = data.company
        setNewCompanyForm(prev => ({
          ...prev,
          name: c.legalName || c.brandName || prev.name,
          piva: c.vatNumber || prev.piva,
          fiscalCode: c.fiscalCode || prev.fiscalCode,
          industry: c.atecoDescription ? `${c.atecoCode} - ${c.atecoDescription.split(' e ')[0]}` : prev.industry,
          contactPerson: c.decisionMakers?.[0]?.name || prev.contactPerson,
          role: c.decisionMakers?.[0]?.role || prev.role,
          email: c.decisionMakers?.[0]?.email || prev.email,
          phone: c.phone || prev.phone,
          mobile: c.decisionMakers?.[0]?.mobile || prev.mobile,
          address: c.legalAddress ? `${c.legalAddress.street}, ${c.legalAddress.zip} ${c.legalAddress.city} (${c.legalAddress.province})` : prev.address,
          sdi: c.sdiCode || prev.sdi,
          pec: c.pec || prev.pec,
          amount: c.suggestedBudget ? String(c.suggestedBudget) : prev.amount,
          deposit: c.suggestedBudget ? String(Math.round(c.suggestedBudget * 0.3)) : prev.deposit,
          materials: (c.recommendedDadoServices || []).join(', '),
          contractTerms: c.recommendedPaymentTerms || prev.contractTerms,
          firstContactNotes: `Arricchito automaticamente tramite B2B Intelligence (${data.matchedSource}). Rating D&B: ${c.creditRating}. Paydex: ${c.paydexScore}. Fatturato: ${c.revenueRange}.`
        }))
        setEnrichFeedback(`✓ Scheda completata con successo! Fonte: ${data.matchedSource} (Rating D&B: ${c.creditRating})`)
      } else {
        setEnrichFeedback(`⚠️ ${data.error || 'Dati non trovati nei registri camerali'}`)
      }
    } catch (err) {
      setEnrichFeedback(`⚠️ Errore durante l'arricchimento B2B: ${err.message}`)
    } finally {
      setEnrichLoading(false)
    }
  }

  async function handleEnrichExistingCompany(comp) {
    try {
      const res = await fetch(`/api/crm/companies/${comp.id}/enrich`, {
        method: 'PUT'
      })
      const data = await res.json()
      if (res.ok && data.success && data.company) {
        setCompanies(prev => prev.map(c => c.id === comp.id ? data.company : c))
      } else {
        setEnrichModalQuery(comp.piva || comp.name)
        setShowEnrichModal(true)
      }
    } catch {
      setEnrichModalQuery(comp.piva || comp.name)
      setShowEnrichModal(true)
    }
  }

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
            let removedIds = []
            try { removedIds = JSON.parse(localStorage.getItem('dado_crm_removed_companies') || '[]').map(c => c.id) } catch { /* ignore */ }
            setCompanies(data.companies.filter(c => !removedIds.includes(c.id)))
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
    window.addEventListener('dado-companies-updated', loadCompanies)
    window.addEventListener('dado-activities-updated', loadCompanies)
    return () => {
      window.removeEventListener('dado-companies-updated', loadCompanies)
      window.removeEventListener('dado-activities-updated', loadCompanies)
    }
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

  // Statistiche relazionali e conteggi per filtri rapidi metallizzati
  const companyStats = useMemo(() => {
    let lead = 0
    let pending = 0
    let payment = 0
    let concluded = 0
    for (const c of companies) {
      const rel = getCompanyRelationshipStatus(c)
      if (rel.key === 'lead_inbound') lead++
      else if (rel.key === 'in_attesa_risposta') pending++
      else if (rel.key === 'in_coda_pagamento') payment++
      else if (rel.key === 'lavoro_concluso') concluded++
    }
    return {
      all: companies.length,
      lead_inbound: lead,
      in_attesa_risposta: pending,
      in_coda_pagamento: payment,
      lavoro_concluso: concluded,
    }
  }, [companies])

  const renderCompanyDetails = (comp, relStatus, bant, acq, contactEmail, contactPhone, contractsHistory, isDone) => (
    <div className="flex flex-col gap-4 relative z-10 text-slate-800" style={{ fontFamily: '"Switzer", sans-serif' }}>
      {/* ── I 3 RIQUADRI ORGANIZZATI ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
        {/* Riquadro 1: Referente, Recapiti Diretti & Canale */}
        <div className="flex flex-col justify-between min-w-0 bg-white/90 p-4 rounded-xl border border-sky-100 shadow-2xs">
          <div>
            <div className="text-[14px] font-black uppercase tracking-wider text-[#0284c7] flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>REFERENTE & INDIRIZZO EMAIL</span>
            </div>
            <div className="font-black text-slate-900 text-base md:text-[17px] truncate" title={comp.contactPerson?.name}>
              {comp.contactPerson?.name || 'Referente non indicato'}
            </div>
            <div className="text-[14px] text-slate-600 truncate font-semibold mt-0.5">
              {comp.contactPerson?.role || comp.contact?.role || 'Referente aziendale'}
            </div>
            {contactEmail && (
              <div className="text-[13px] text-[#0284c7] font-bold truncate mt-1" title={contactEmail}>
                ✉ {contactEmail}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-1.5 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              {contactEmail && (
                <button
                  type="button"
                  onClick={(e) => handleCopy(contactEmail, `${comp.id}-email`, e)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[13px] font-bold transition-all cursor-pointer border ${
                    copiedField === `${comp.id}-email`
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-sky-50 hover:bg-sky-100 text-slate-700 border-sky-200'
                  }`}
                  title={`Copia email: ${contactEmail}`}
                >
                  <Mail className="w-3 h-3 text-[#0284c7]" />
                  <span>{copiedField === `${comp.id}-email` ? 'COPIATA' : 'COPIA MAIL'}</span>
                </button>
              )}
              {contactPhone && (
                <button
                  type="button"
                  onClick={(e) => handleCopy(contactPhone, `${comp.id}-phone`, e)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[13px] font-bold transition-all cursor-pointer border ${
                    copiedField === `${comp.id}-phone`
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-sky-50 hover:bg-sky-100 text-slate-700 border-sky-200'
                  }`}
                  title={`Copia telefono: ${contactPhone}`}
                >
                  <Phone className="w-3 h-3 text-[#0284c7]" />
                  <span>{copiedField === `${comp.id}-phone` ? 'COPIATO' : 'TEL'}</span>
                </button>
              )}
            </div>

            <span className="text-[13px] text-slate-500 font-medium truncate">
              Canale: <strong className="text-slate-800 uppercase font-black">{acq?.shortChannel || 'INBOUND'}</strong>
            </span>
          </div>
        </div>

        {/* Riquadro 2: File allegati */}
        <div className="flex flex-col justify-between min-w-0 bg-white/90 p-4 rounded-xl border border-sky-100 shadow-2xs">
          <div>
            <div className="text-[14px] font-black uppercase tracking-wider text-[#0284c7] flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-[#0284c7]" />
                <span>ALLEGATI & CONTRATTI</span>
              </div>
              <span className="text-[12px] font-black px-2 py-0.5 rounded bg-sky-100 text-[#0369a1]">
                {contractsHistory.length > 0
                  ? `${contractsHistory.length} FILE`
                  : 'NESSUN FILE'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1 custom-popup-scrollbar">
              {contractsHistory.length === 0 && (
                <span className="text-[14px] text-slate-400 font-medium">Nessun file allegato</span>
              )}
              {contractsHistory.map((ctr, idx) => (
                <div key={ctr.code || idx} className="py-0.5 text-[14px] flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[13px] text-slate-700 font-semibold truncate" title={ctr.title}>{ctr.title}</span>
                  </span>
                  <span className="text-right shrink-0 flex items-center gap-2">
                    <strong className="font-black text-slate-900 text-[14px]">
                      {isDipendente ? '•••• €' : `€ ${(ctr.amount || 0).toLocaleString('it-IT')}`}
                    </strong>
                    <span
                      className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        ctr.status === 'Firmato' || ctr.status === 'Saldato'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ctr.status}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end mt-2 text-[13px]">
            <span className="text-slate-500 font-bold">
              Totale: <strong className="text-[#0284c7] font-black">{isDipendente ? '•••• €' : `€ ${contractsHistory.reduce((s, c) => s + (c.amount || 0), 0).toLocaleString('it-IT')}`}</strong>
            </span>
          </div>
        </div>

        {/* Riquadro 3: Contratto Attivo & Criticità */}
        <div className="flex flex-col justify-between min-w-0 bg-white/90 p-4 rounded-xl border border-sky-100 shadow-2xs">
          <div>
            <div className="text-[14px] font-black uppercase tracking-wider text-[#0284c7] flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>DETTAGLI CONTRATTO</span>
              </div>
              <span className="flex items-center gap-1 text-amber-600 font-black text-[14px]">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{comp.feedback?.rating ? comp.feedback.rating.toFixed(1) : '5.0'}</span>
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm truncate" title={comp.contract?.fileName}>
              {comp.contract?.fileName || comp.contract?.code || 'CTR-DADO-2026'}
            </div>
            <div className="text-[13px] text-slate-500 truncate mt-0.5 font-medium">
              Stato: <strong className="text-slate-800 font-bold">{comp.contract?.status?.toUpperCase() || 'IN VALUTAZIONE'}</strong> • Formato: <strong className="text-slate-700 font-bold">{comp.contract?.digitalFormat || 'PDF'}</strong>
            </div>
            {comp.contract?.terms && (
              <div className="text-[12px] text-slate-600 truncate mt-1 font-medium" title={comp.contract.terms}>
                Clausole: <strong className="text-slate-800">{comp.contract.terms}</strong>
              </div>
            )}
          </div>

          <div className="mt-3 text-[13px] truncate">
            {comp.issues?.isResolved === 'Risolto' ? (
              <span className="text-emerald-700 font-black flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>CRITICITÀ RISOLTA (100%)</span>
              </span>
            ) : (
              <span className="text-slate-400 font-medium">Nessuna criticità emersa</span>
            )}
          </div>
        </div>
      </div>

      {/* ── SEZIONE DETTAGLI APPROFONDITA (BANT, LOCATION, MATERIALI CANON C70, AGGIORNAMENTI EMAIL) ── */}
      <div className="p-4 bg-white/95 rounded-xl border border-sky-100 shadow-2xs flex flex-col gap-4">
        {/* Sezione B.A.N.T. Approfondita */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BantLogoMark size="md" bant={bant} />
              <strong className="text-sm font-black uppercase tracking-wider text-slate-900">
                QUALIFICAZIONE COMMERCIALE B.A.N.T.
              </strong>
            </div>
            {bant.isComplete ? (
              <span className="text-[13px] text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                🟢 4/4 PARAMETRI RILEVATI • LEAD QUALIFICATO
              </span>
            ) : (
              <span className="text-[13px] text-amber-800 font-extrabold bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
                ⚠️ {4 - bant.score} PARAMETRI MANCANTI: {bant.missingLabel.toUpperCase()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[14px]">
            {/* Budget */}
            <div className="min-w-0 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60">
              <div className="text-xs font-black uppercase text-[#16a34a] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded bg-[#16a34a]/10 flex items-center justify-center text-[#16a34a] font-black text-[12px]">B</span>
                  <span>BUDGET</span>
                </span>
                {!bant.hasB && <strong className="text-[11px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded">DA DEFINIRE</strong>}
              </div>
              <div className="text-[15px] font-black text-slate-900 mt-1">
                {isDipendente ? (
                  <span className="text-slate-400 font-bold text-xs tracking-wider" title="Budget riservato ad Amministratore">
                    🔒 Riservato
                  </span>
                ) : (
                  bant.budget
                )}
              </div>
              <div className="text-[12px] text-slate-500 mt-0.5">
                Capacità di spesa allocata per l'intervento
              </div>
            </div>

            {/* Authority */}
            <div className="min-w-0 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60">
              <div className="text-xs font-black uppercase text-[#dc2626] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded bg-[#dc2626]/10 flex items-center justify-center text-[#dc2626] font-black text-[12px]">A</span>
                  <span>AUTHORITY</span>
                </span>
                {!bant.hasA && <strong className="text-[11px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded">DA VERIFICARE</strong>}
              </div>
              <div className="text-[15px] font-black text-slate-900 mt-1 truncate" title={bant.authority}>
                {bant.authority}
              </div>
              <div className="text-[12px] text-slate-500 mt-0.5">
                Referente decisionale con potere di firma
              </div>
            </div>

            {/* Need */}
            <div className="min-w-0 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60">
              <div className="text-xs font-black uppercase text-[#0284c7] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded bg-[#0284c7]/10 flex items-center justify-center text-[#0284c7] font-black text-[12px]">N</span>
                  <span>NEED</span>
                </span>
                {!bant.hasN && <strong className="text-[11px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded">DA CHIARIRE</strong>}
              </div>
              <div className="text-[14px] font-bold text-slate-900 mt-1 line-clamp-2 leading-snug" title={bant.need}>
                {bant.need}
              </div>
              <div className="text-[12px] text-slate-500 mt-0.5">
                Esigenza operativa e output atteso
              </div>
            </div>

            {/* Timeline */}
            <div className="min-w-0 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60">
              <div className="text-xs font-black uppercase text-[#d97706] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded bg-[#d97706]/10 flex items-center justify-center text-[#d97706] font-black text-[12px]">T</span>
                  <span>TIMELINE</span>
                </span>
                {!bant.hasT && <strong className="text-[11px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded">DA FISSARE</strong>}
              </div>
              <div className="text-[15px] font-black text-slate-900 mt-1">
                {bant.timeline}
              </div>
              <div className="text-[12px] text-slate-500 mt-0.5">
                Finestra temporale di erogazione
              </div>
            </div>
          </div>
        </div>

        {/* Griglia 2 Colonne Aperta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          {/* Colonna 1: Storico, Orari e Aggiornamenti Strutturati da Email */}
          <div className="flex flex-col gap-3">
            <div className="min-w-0">
              <strong className="text-[13px] font-black uppercase text-[#0284c7] flex items-center gap-1.5 mb-1.5">
                <Clock className="w-4 h-4" />
                PROGRAMMAZIONE ORARI & LOCATION
              </strong>
              <div className="text-sm font-extrabold text-slate-900">
                {comp.workSchedule?.datesFormatted || 'Date da calendarizzare'}
              </div>
              <div className="text-[13px] text-slate-600 font-semibold mt-1">
                Tipologia: <strong>{comp.workSchedule?.scheduleType}</strong>
              </div>
              <div className="text-[13px] text-slate-600 mt-0.5">
                Orari: <strong>{comp.workSchedule?.hours || 'Standard'}</strong>
              </div>
              {comp.workSchedule?.location && (
                <div className="text-[13px] text-slate-600 mt-0.5">
                  Location: <strong>{comp.workSchedule?.location}</strong>
                </div>
              )}
            </div>

            <div className="min-w-0 bg-sky-50/60 p-3 rounded-xl border border-sky-200/70">
              <strong className="text-[13px] font-black uppercase text-[#0284c7] flex items-center gap-1.5 mb-2">
                <Mail className="w-4 h-4" />
                AGGIORNAMENTI ESTRATTI DA EMAIL (SENZA TESTO ALLEGATO)
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                <div>
                  <span className="text-slate-500 font-bold block text-[11px] uppercase">Indirizzo Email:</span>
                  <strong className="text-slate-900 font-black truncate block">{contactEmail || comp.contact?.email || 'Non rilevato'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[11px] uppercase">Referente:</span>
                  <strong className="text-slate-900 font-black truncate block">{comp.contactPerson?.name || 'Referente'} ({comp.contactPerson?.role || 'Aziendale'})</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-bold block text-[11px] uppercase">Dettagli Contratto:</span>
                  <strong className="text-slate-900 font-bold block">
                    {comp.contract?.status || 'In valutazione'} — {comp.contract?.terms || comp.compensation?.status || '50% acconto / 50% saldo'}
                  </strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-bold block text-[11px] uppercase mb-1">Richieste da Oggetto Mail:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(comp.subjectRequests) && comp.subjectRequests.length > 0
                      ? comp.subjectRequests
                      : comp.firstContact?.lastEmailSubject
                      ? [comp.firstContact.lastEmailSubject]
                      : (comp.requestedMaterials || []).slice(0, 2)
                    ).map((req, rIdx) => (
                      <span key={rIdx} className="px-2 py-0.5 bg-white border border-sky-200 text-[#0369a1] text-[12px] font-extrabold rounded-md">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonna 2: Materiali Canon C70, Contratto e Dettaglio Finanziario */}
          <div className="flex flex-col gap-3">
            <div className="min-w-0">
              <strong className="text-[13px] font-black uppercase text-[#0284c7] flex items-center gap-1.5 mb-1.5">
                <Camera className="w-4 h-4" />
                MATERIALI & OUTPUT RICHIESTI
              </strong>
              <div className="flex flex-wrap gap-1.5">
                {comp.requestedMaterials?.map((item, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-[13px] font-bold rounded-md"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <strong className="text-[13px] font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0284c7]" />
                  FILE ALLEGATI
                </strong>
                <span className="text-[12px] font-extrabold px-2 py-0.5 bg-sky-100 text-[#0369a1] rounded">
                  {contractsHistory.length} FILE
                </span>
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                {contractsHistory.map((ctr, idx) => (
                  <div key={ctr.code || idx} className="py-0.5 text-[13px]">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-[13px]">{ctr.title}</span>
                      </span>
                      <span className="text-[#0284c7] font-black">{isDipendente ? '•••• €' : `€ ${(ctr.amount || 0).toLocaleString('it-IT')}`}</span>
                    </div>
                    {ctr.terms && (
                      <div className="text-[12px] text-slate-500 mt-0.5">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-1">
              <strong className="text-[13px] font-black uppercase text-slate-800 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                FEEDBACK SULLA COLLABORAZIONE
              </strong>
              <strong className="text-[13px] font-black text-slate-800">
                ★ {comp.feedback?.rating} / 5.0
              </strong>
            </div>
            <p className="text-[13px] text-slate-800 italic leading-relaxed">
              "{comp.feedback?.notes}"
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex items-center justify-between mb-1">
              <strong className="text-[13px] font-black uppercase text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                GESTIONE CRITICITÀ
              </strong>
              <span className="text-[11px] font-extrabold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                ✓ {comp.issues?.isResolved?.toUpperCase()}
              </span>
            </div>
            <div className="text-[13px] text-slate-800 mb-0.5">
              <strong>Criticità:</strong> {comp.issues?.description}
            </div>
            <div className="text-[13px] text-emerald-900 font-medium">
              <strong>Soluzione adottata:</strong> {comp.issues?.resolution}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div
      className="h-full min-h-0 flex flex-col flex-1 relative overflow-hidden"
      style={{
        backgroundColor: 'transparent',
        fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* ── BANDA SUPERIORE: Titolo "Companies" immerso nella banda scura (#2d3139), senza icona, più spessa di 0,3 cm rispetto alla dashboard ── */}
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
              Companies
            </h1>
          </div>
        </div>
      </div>

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
        {/* ── AREA PRINCIPALE: TESTATA E FILTRI IN STILE NOTION (COME TASKS) ── */}
        <div className="flex-1 min-h-0 px-4 md:px-7 py-3 overflow-y-auto">

          {/* ── TOOLBAR NOTION STYLE (Sotto la banda superiore) ── */}
          <div className="mb-4 pb-3 border-b border-slate-200">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Sinistra: Pulsante aggiunta "+ New Company" */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewCompanyForm(INITIAL_NEW_COMPANY_FORM)
                    setEnrichVatInput('')
                    setEnrichFeedback(null)
                    setShowAddModal(true)
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[15px] rounded-lg transition-all shadow-2xs active:scale-95 cursor-pointer"
                  title="Crea una nuova scheda azienda"
                >
                  <span>+ New Company</span>
                </button>
              </div>

              {/* Destra: Rimosse, B2B Enrichment e Switcher Vista Monday Table vs Schede */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowRemovedModal(true)}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-[15px] font-semibold text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Recupera le schede azienda rimosse"
                >
                  <Archive className="w-3.5 h-3.5 text-slate-500" />
                  <span>Rimosse{removedCompanies.length > 0 ? ` (${removedCompanies.length})` : ''}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEnrichModalQuery('')
                    setShowEnrichModal(true)
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-[15px] font-semibold text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Interroga database B2B (Atoka, LinkedIn, CCIAA, Dun & Bradstreet) tramite Partita IVA o Nome"
                >
                  <Zap className="w-3.5 h-3.5 text-slate-500" />
                  <span>B2B Enrichment</span>
                </button>

                {/* Riquadro Switcher Vista Monday Table vs Schede */}
                <div className="inline-flex items-center p-0.5 bg-slate-200/80 rounded-lg border border-slate-300/80 ml-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('monday')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-bold rounded-md transition-all cursor-pointer ${
                      viewMode === 'monday'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Visualizza come tabella orizzontale scrollabile in stile Monday.com"
                  >
                    <Table className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tabella Monday</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-bold rounded-md transition-all cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Visualizza come schede classiche"
                  >
                    <LayoutList className="w-3.5 h-3.5 text-slate-600" />
                    <span>Schede</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── BARRA FILTRI NOTION STYLE: TAB DI STATO + FILTRI RAPIDI + RICERCA ── */}
          <div className="mb-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-200">
              {/* Tab di stato (stesso stile delle view tab di Tasks) */}
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { id: 'all', label: 'Tutte', dotColor: '#64748b', count: companyStats.all },
                  { id: 'lead_inbound', label: 'Lead & Inbound', dotColor: '#0284c7', count: companyStats.lead_inbound },
                  { id: 'in_attesa_risposta', label: 'In attesa', dotColor: '#8b5cf6', count: companyStats.in_attesa_risposta },
                  { id: 'in_coda_pagamento', label: 'Coda pagamento', dotColor: '#f59e0b', count: companyStats.in_coda_pagamento },
                  { id: 'lavoro_concluso', label: 'Concluso', dotColor: '#16a34a', count: companyStats.lavoro_concluso },
                ].map(f => {
                  const isActive = filterRelationship === f.id
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilterRelationship(prev => prev === f.id && f.id !== 'all' ? 'all' : f.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-[15px] font-semibold rounded-md transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-2xs border-slate-200/90'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border-transparent'
                      }`}
                      title={`Filtra ${f.label}`}
                    >
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: f.dotColor }} />
                      <span>{f.label}</span>
                      <span className="text-[13px] px-1 py-0.5 bg-slate-100 rounded text-slate-500 font-bold ml-0.5">
                        {f.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Filtri rapidi e ricerca */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Filtro B.A.N.T. */}
                <div className="relative">
                  <select
                    value={filterBant}
                    onChange={(e) => setFilterBant(e.target.value)}
                    className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-md pl-2 pr-6 py-1 text-[15px] text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                  >
                    <option value="all">🎯 Qualificazione: Tutte</option>
                    <option value="complete">🟢 B.A.N.T. Completi (4/4)</option>
                    <option value="incomplete">🟡 B.A.N.T. Incompleti</option>
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Ricerca */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cerca azienda, referente, contratto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white hover:bg-slate-50 border border-slate-200 rounded-md pl-7 pr-6 py-1 text-[15px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white w-44 sm:w-60 transition-all shadow-2xs"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="Cancella ricerca"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Reset filtri */}
                {(filterRelationship !== 'all' || filterBant !== 'all' || search) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterRelationship('all')
                      setFilterBant('all')
                      setSortBy('recent')
                      setSearch('')
                    }}
                    className="px-2 py-1 text-[15px] font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Reimposta tutti i filtri"
                  >
                    <X className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}

                {/* Contatore aziende visualizzate */}
                <span className="text-[15px] font-medium text-slate-500 pl-1">
                  <strong className="text-slate-800 font-bold">{filteredCompanies.length}</strong> / <strong className="text-slate-800 font-bold">{companies.length}</strong> aziende
                </span>
              </div>
            </div>
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
              <p className="text-slate-500 text-[15px]">
                Nessun risultato corrisponde alla ricerca corrente.
              </p>
            </div>
          ) : viewMode === 'monday' ? (
            <div className="flex flex-col gap-6 pb-8">
              {MONDAY_GROUPS.map((group) => {
                const groupCompanies = filteredCompanies.filter(c => getCompanyRelationshipStatus(c).key === group.id)
                if (filterRelationship !== 'all' && filterRelationship !== group.id) return null
                const isCollapsed = collapsedGroups[group.id]
                const totalAmount = groupCompanies.reduce((sum, c) => sum + (c.compensation?.amount || 0), 0)
                const completeBantCount = groupCompanies.filter(c => getCompanyBant(c).isComplete).length

                return (
                  <div key={group.id} className="flex flex-col">
                    {/* Header del Gruppo in puro stile Monday.com */}
                    <div className="flex items-center justify-between mb-2.5 px-1 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => toggleGroupCollapse(group.id)}
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
                          {groupCompanies.length} {groupCompanies.length === 1 ? 'azienda' : 'aziende'}
                        </span>

                        {group.subtitle && (
                          <span className="text-[13px] text-slate-500 font-semibold hidden md:inline-block">
                            — {group.subtitle}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[13px] text-slate-500 font-semibold">
                        {!isDipendente && (
                          <span>
                            Budget Totale: <strong className="text-slate-900 font-black">€ {totalAmount.toLocaleString('it-IT')}</strong>
                          </span>
                        )}
                        <span className="text-slate-300">•</span>
                        <span>
                          B.A.N.T.: <strong className="text-slate-900 font-black">{groupCompanies.length > 0 ? Math.round((completeBantCount / groupCompanies.length) * 100) : 0}% qualificato</strong>
                        </span>
                      </div>
                    </div>

                    {/* Tabella Orizzontale Scrollabile in puro stile Monday.com */}
                    {!isCollapsed && (
                      <HorizontalTableScroller
                        shortcuts={[
                          { label: 'Azienda', selector: '[data-col="azienda"]', left: 0 },
                          { label: 'Stato Relazione', selector: '[data-col="stato"]', left: 310 },
                          { label: 'Date Set & Lavoro', selector: '[data-col="date"]', left: 480 },
                          { label: 'Retribuzione & Saldo', selector: '[data-col="retribuzione"]', left: 740 },
                          { label: 'Referente', selector: '[data-col="referente"]', left: 920 },
                          { label: 'Canale Origine', selector: '[data-col="canale"]', left: 1140 },
                          { label: 'B.A.N.T.', selector: '[data-col="bant"]', left: 1330 },
                          { label: 'Contratto & Codice', selector: '[data-col="contratto"]', left: 1460 },
                          { label: 'Azioni', selector: '[data-col="azioni"]', left: 1770 },
                        ]}
                      >
                        <table
                          className="w-full text-left border-collapse text-sm select-none"
                          style={{ minWidth: '1930px', fontFamily: '"Switzer", sans-serif' }}
                        >
                          <thead>
                            <tr className="bg-slate-50/90 text-slate-600 border-b border-slate-200">
                              <th data-col="azienda" className="sticky left-0 bg-slate-100 z-30 w-[310px] min-w-[310px] px-4 py-3 text-[12px] font-black uppercase tracking-wider text-slate-700 border-r border-slate-200 shadow-[4px_0_12px_rgba(0,0,0,0.06)]">
                                Azienda / Commessa
                              </th>
                              <th data-col="stato" className="w-[170px] min-w-[170px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200 text-center">
                                Stato Relazione
                              </th>
                              <th data-col="date" className="w-[260px] min-w-[260px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200">
                                Prossimo Lavoro / Date Set
                              </th>
                              <th data-col="retribuzione" className="w-[180px] min-w-[180px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200">
                                Retribuzione & Saldo
                              </th>
                              <th data-col="referente" className="w-[220px] min-w-[220px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200">
                                Referente Principale
                              </th>
                              <th data-col="canale" className="w-[190px] min-w-[190px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200">
                                Canale & Origine
                              </th>
                              <th data-col="bant" className="w-[130px] min-w-[130px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200 text-center">
                                B.A.N.T.
                              </th>
                              <th data-col="contratto" className="w-[170px] min-w-[170px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200">
                                Contratto & Codice
                              </th>
                              <th data-col="rating" className="w-[140px] min-w-[140px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 border-r border-slate-200 text-center">
                                Rating & Feedback
                              </th>
                              <th data-col="azioni" className="w-[160px] min-w-[160px] px-3 py-3 text-[12px] font-black uppercase tracking-wider text-slate-600 text-center">
                                Azioni
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupCompanies.length === 0 ? (
                              <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-slate-400 font-semibold text-[14px]">
                                  Nessuna azienda in questo stato.
                                </td>
                              </tr>
                            ) : (
                              groupCompanies.map((comp) => {
                                const isExpanded = expandedId === comp.id
                                const relStatus = getCompanyRelationshipStatus(comp)
                                const bant = getCompanyBant(comp)
                                const acq = getCompanyAcquisitionChannel(comp)
                                const contactEmail = comp.contact?.directEmail || comp.contact?.email
                                const contactPhone = comp.contact?.mobile || comp.contact?.phone
                                const contractsHistory = getCompanyContractsHistory(comp)
                                const isDone = relStatus.key === 'lavoro_concluso' || comp.compensation?.status === 'Saldato'

                                return (
                                  <Fragment key={comp.id}>
                                    <tr className={`hover:bg-slate-50/80 transition-colors border-b border-slate-100 group ${isDone ? 'bg-slate-50/50' : 'bg-white'}`}>
                                      {/* 1. Colonna Bloccata a Sinistra: Nome, Settore, P.IVA */}
                                      <td className="sticky left-0 bg-white group-hover:bg-slate-50 z-20 w-[310px] min-w-[310px] pl-4 pr-3 py-3 border-r border-slate-200/90 shadow-[4px_0_12px_rgba(0,0,0,0.06)] relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: group.color }} />
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setExpandedId(isExpanded ? null : comp.id)}
                                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                                            title={isExpanded ? 'Chiudi dettagli' : 'Espandi scheda completa'}
                                          >
                                            {isExpanded ? <ChevronUp className="w-4 h-4 stroke-[2.5] text-[#0284c7]" /> : <ChevronDown className="w-4 h-4 stroke-[2.5]" />}
                                          </button>
                                          <div className="min-w-0 flex-1">
                                            <span className="font-extrabold text-[15px] text-slate-900 tracking-tight block truncate" title={comp.name}>
                                              {comp.name}
                                            </span>
                                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                              <span className="px-1.5 py-0.2 bg-sky-50 text-[#0369a1] text-[11px] font-black rounded uppercase tracking-wide border border-sky-200">
                                                {comp.industry}
                                              </span>
                                              {comp.piva ? (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEnrichModalQuery(comp.piva)
                                                    setShowEnrichModal(true)
                                                  }}
                                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold border border-purple-200 cursor-pointer"
                                                  title={`Partita IVA: ${comp.piva} - Apri Dossier Camerale B2B`}
                                                >
                                                  <Zap className="w-2.5 h-2.5 fill-purple-600 text-purple-600" />
                                                  <span>P.IVA</span>
                                                </button>
                                              ) : null}
                                              {comp.taskStatusUpdate && (
                                                <div className={`mt-1 px-1.5 py-0.5 rounded text-[11px] font-bold inline-flex items-center gap-1 border shadow-2xs ${
                                                  comp.taskStatusUpdate.status === 'fermo'
                                                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                                                    : comp.taskStatusUpdate.status === 'in_progress'
                                                    ? 'bg-sky-50 border-sky-200 text-sky-800'
                                                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                }`}>
                                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                                    comp.taskStatusUpdate.status === 'fermo' ? 'bg-rose-500 animate-pulse' :
                                                    comp.taskStatusUpdate.status === 'in_progress' ? 'bg-sky-500 animate-pulse' : 'bg-emerald-500'
                                                  }`} />
                                                  <span className="font-black uppercase tracking-wider">{comp.taskStatusUpdate.statusLabel}:</span>
                                                  <span className="truncate max-w-[140px]" title={comp.taskStatusUpdate.reason}>{comp.taskStatusUpdate.reason || comp.taskStatusUpdate.taskTitle}</span>
                                                  {comp.taskStatusUpdate.newDueDate && (
                                                    <span className="text-[10px] opacity-85 font-semibold">({comp.taskStatusUpdate.newDueDate})</span>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </td>

                                      {/* 2. Stato Relazione (Solid Pill Monday) */}
                                      <td className="w-[170px] min-w-[170px] px-3 py-3 border-r border-slate-100 text-center">
                                        <div
                                          className="w-full py-1.5 px-2 rounded-[4px] text-[12px] font-black uppercase text-center text-white shadow-2xs tracking-wider flex items-center justify-center gap-1.5 select-none"
                                          style={{ backgroundColor: group.color }}
                                        >
                                          <span>{relStatus.emoji}</span>
                                          <span>{relStatus.tag}</span>
                                        </div>
                                      </td>

                                      {/* 3. Prossimo Lavoro / Date Set */}
                                      <td className="w-[260px] min-w-[260px] px-3 py-3 border-r border-slate-100">
                                        <div className="font-bold text-slate-900 text-[13px] truncate" title={comp.upcomingJob?.title || comp.workSchedule?.scheduleType}>
                                          {comp.upcomingJob?.title || comp.workSchedule?.scheduleType || 'Shooting Video Corporate'}
                                        </div>
                                        <div className="text-[12px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5 truncate">
                                          <Calendar className="w-3 h-3 text-[#0284c7] shrink-0" />
                                          <span className="truncate">{comp.workSchedule?.datesFormatted || 'Da concordare'}</span>
                                        </div>
                                      </td>

                                      {/* 4. Retribuzione & Saldo */}
                                      <td className="w-[180px] min-w-[180px] px-3 py-3 border-r border-slate-100">
                                        <div className="text-[14px] font-black text-[#0284c7]">
                                          {isDipendente ? '•••• €' : `€ ${(comp.compensation?.amount || 0).toLocaleString('it-IT')}`}
                                        </div>
                                        <div className="text-[11px] font-bold text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                          <span
                                            className={`px-1.5 py-0.2 rounded font-black text-[10px] uppercase ${
                                              comp.compensation?.status === 'Saldato'
                                                ? 'bg-[#dcfce7] text-[#15803d]'
                                                : 'bg-slate-100 text-slate-700'
                                            }`}
                                          >
                                            {comp.compensation?.status === 'Saldato' ? 'SALDATO' : 'ACCONTO'}
                                          </span>
                                          <span>
                                            Saldo: <strong className="text-slate-700 font-bold">{isDipendente ? '•••• €' : `€ ${(comp.compensation?.balance || 0).toLocaleString('it-IT')}`}</strong>
                                          </span>
                                        </div>
                                      </td>

                                      {/* 5. Referente Principale */}
                                      <td className="w-[220px] min-w-[220px] px-3 py-3 border-r border-slate-100">
                                        <div className="flex items-center gap-2">
                                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-black text-[12px] flex items-center justify-center shrink-0">
                                            {(comp.contactPerson?.name || 'R').charAt(0)}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="font-bold text-slate-900 text-[13px] truncate" title={comp.contactPerson?.name}>
                                              {comp.contactPerson?.name || 'Referente non indicato'}
                                            </div>
                                            <div className="text-[11px] text-slate-500 font-semibold truncate">
                                              {comp.contactPerson?.role || comp.contact?.role || 'Referente'}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                          {contactEmail && (
                                            <button
                                              type="button"
                                              onClick={(e) => handleCopy(contactEmail, `${comp.id}-email`, e)}
                                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold border cursor-pointer ${
                                                copiedField === `${comp.id}-email`
                                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                  : 'bg-sky-50 hover:bg-sky-100 text-slate-700 border-sky-200'
                                              }`}
                                              title={`Copia: ${contactEmail}`}
                                            >
                                              <Mail className="w-2.5 h-2.5 text-[#0284c7]" />
                                              <span>{copiedField === `${comp.id}-email` ? 'COPIATA' : 'MAIL'}</span>
                                            </button>
                                          )}
                                          {contactPhone && (
                                            <button
                                              type="button"
                                              onClick={(e) => handleCopy(contactPhone, `${comp.id}-phone`, e)}
                                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold border cursor-pointer ${
                                                copiedField === `${comp.id}-phone`
                                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                  : 'bg-sky-50 hover:bg-sky-100 text-slate-700 border-sky-200'
                                              }`}
                                              title={`Copia: ${contactPhone}`}
                                            >
                                              <Phone className="w-2.5 h-2.5 text-[#0284c7]" />
                                              <span>{copiedField === `${comp.id}-phone` ? 'COPIATO' : 'TEL'}</span>
                                            </button>
                                          )}
                                        </div>
                                      </td>

                                      {/* 6. Canale Acquisizione */}
                                      <td className="w-[190px] min-w-[190px] px-3 py-3 border-r border-slate-100">
                                        <span
                                          className="inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-black uppercase text-white shadow-2xs tracking-wide"
                                          style={{ backgroundColor: acq.color }}
                                        >
                                          {acq.shortChannel}
                                        </span>
                                        <div className="text-[11px] text-slate-500 font-semibold mt-1 truncate" title={acq.reason}>
                                          {acq.type}
                                        </div>
                                      </td>

                                      {/* 7. B.A.N.T. */}
                                      <td className="w-[130px] min-w-[130px] px-3 py-3 border-r border-slate-100 text-center">
                                        <div className="flex flex-col items-center justify-center gap-0.5">
                                          <BantLogoMark size="sm" bant={bant} />
                                          <span className="text-[11px] font-extrabold text-slate-500">
                                            {bant.score}/4 Parametri
                                          </span>
                                        </div>
                                      </td>

                                      {/* 8. Contratto & Codice */}
                                      <td className="w-[170px] min-w-[170px] px-3 py-3 border-r border-slate-100">
                                        <div className="font-bold text-slate-800 text-[12px] truncate" title={comp.contract?.fileName}>
                                          {comp.contract?.code || comp.contract?.fileName || 'DADO-CTR-2026'}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase">
                                            {comp.contract?.status || 'FIRMATO'}
                                          </span>
                                          <span className="text-slate-400">•</span>
                                          <span>{contractsHistory.length} file</span>
                                        </div>
                                      </td>

                                      {/* 9. Rating & Feedback */}
                                      <td className="w-[140px] min-w-[140px] px-3 py-3 border-r border-slate-100 text-center">
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-black text-[12px]">
                                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                          <span>{(comp.feedback?.rating || 5.0).toFixed(1)}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 truncate mt-0.5 italic max-w-[120px] mx-auto" title={comp.feedback?.notes}>
                                          "{comp.feedback?.notes || 'Collaborazione attiva'}"
                                        </div>
                                      </td>

                                      {/* 10. Azioni */}
                                      <td className="w-[160px] min-w-[160px] px-3 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setCompanies(prev => prev.map(c => {
                                                if (c.id !== comp.id) return c
                                                const isCompleted = c.relationshipStatus === 'lavoro_concluso' || c.compensation?.status === 'Saldato'
                                                return {
                                                  ...c,
                                                  relationshipStatus: isCompleted ? 'lead_inbound' : 'lavoro_concluso',
                                                  status: isCompleted ? 'In trattativa' : 'Concluso',
                                                  compensation: {
                                                    ...c.compensation,
                                                    status: isCompleted ? 'Acconto versato' : 'Saldato',
                                                    balance: isCompleted ? (c.compensation?.balance || 1000) : 0,
                                                  }
                                                }
                                              }))
                                            }}
                                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                              relStatus.key === 'lavoro_concluso'
                                                ? 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
                                                : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                            }`}
                                            title={relStatus.key === 'lavoro_concluso' ? 'Riapri relazione' : 'Segna come conclusa'}
                                          >
                                            <CheckCircle2 className={`w-3.5 h-3.5 ${relStatus.key === 'lavoro_concluso' ? 'text-slate-400' : 'text-[#16a34a]'}`} />
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => setExpandedId(isExpanded ? null : comp.id)}
                                            className={`px-2 py-1 text-[12px] font-black uppercase rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                              isExpanded
                                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                                : 'bg-white hover:bg-sky-50 text-[#0284c7] border-sky-200'
                                            }`}
                                            title={isExpanded ? 'Chiudi dettagli' : 'Visualizza dettagli completi'}
                                          >
                                            <span>{isExpanded ? 'Chiudi' : 'Dettagli'}</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              if (window.confirm(`Vuoi rimuovere la scheda aziendale di "${comp.name}" dal CRM?`)) {
                                                setCompanies(prev => prev.filter(c => c.id !== comp.id))
                                                setRemovedCompanies(prev => [comp, ...prev.filter(c => c.id !== comp.id)])
                                              }
                                            }}
                                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                                            title="Rimuovi scheda dal CRM"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>

                                    {/* Dettagli Espansi Sub-Row (Puro Monday Expandable Item) */}
                                    {isExpanded && (
                                      <tr className="bg-sky-50/60 border-b-2 border-sky-300">
                                        <td colSpan={10} className="p-4 md:p-6 relative">
                                          {isDone && (
                                            <div
                                              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                                              aria-hidden="true"
                                            >
                                              <span
                                                className="font-black uppercase tracking-wider text-[#16a34a]/10 select-none leading-none text-center whitespace-nowrap"
                                                style={{
                                                  fontSize: '88px',
                                                  fontFamily: '"Switzer", sans-serif',
                                                  letterSpacing: '0.04em',
                                                }}
                                              >
                                                CONCLUSO
                                              </span>
                                            </div>
                                          )}
                                          {renderCompanyDetails(comp, relStatus, bant, acq, contactEmail, contactPhone, contractsHistory, isDone)}
                                        </td>
                                      </tr>
                                    )}
                                  </Fragment>
                                )
                              })
                            )}
                          </tbody>
                          <tfoot>
                            <tr className="bg-slate-100/90 font-bold text-slate-700 border-t-2 border-slate-200">
                              <td className="sticky left-0 bg-slate-100 z-20 px-4 py-2.5 text-[13px] font-black uppercase text-slate-800 border-r border-slate-200 shadow-[4px_0_12px_rgba(0,0,0,0.06)]">
                                Totale {group.title}: {groupCompanies.length} aziende
                              </td>
                              <td className="px-3 py-2.5 border-r border-slate-200 text-center text-[12px] font-black">
                                {groupCompanies.filter(c => getCompanyRelationshipStatus(c).key === 'lavoro_concluso').length} concluse
                              </td>
                              <td className="px-3 py-2.5 border-r border-slate-200 text-[12px]">
                                —
                              </td>
                              <td className="px-3 py-2.5 border-r border-slate-200 text-[13px] font-black text-[#0284c7]">
                                {!isDipendente ? `€ ${totalAmount.toLocaleString('it-IT')}` : '•••• €'}
                              </td>
                              <td className="px-3 py-2.5 border-r border-slate-200 text-[12px]">
                                {groupCompanies.filter(c => c.contactPerson?.name).length} referenti
                              </td>
                              <td className="px-3 py-2.5 border-r border-slate-200 text-[12px]">
                                —
                              </td>
                              <td className="px-3 py-2.5 border-r border-slate-200 text-center text-[12px] font-black text-slate-700">
                                {groupCompanies.length > 0 ? `${Math.round((completeBantCount / groupCompanies.length) * 100)}% completo` : '—'}
                              </td>
                              <td className="px-3 py-2.5 border-r border-slate-200 text-[12px]">
                                {groupCompanies.reduce((acc, c) => acc + (getCompanyContractsHistory(c).length), 0)} file
                              </td>
                              <td className="px-3 py-2.5 border-r border-slate-200 text-center text-[12px]">
                                ★ {(groupCompanies.reduce((acc, c) => acc + (c.feedback?.rating || 5.0), 0) / (groupCompanies.length || 1)).toFixed(1)}
                              </td>
                              <td className="px-3 py-2.5 text-center text-[12px] text-slate-400">
                                —
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

                const isDone = relStatus.key === 'lavoro_concluso' || comp.compensation?.status === 'Saldato'
                // Card in stile Notion/Tasks: bianca, bordo neutro, nessun colore di stato sul riquadro
                const cardStyleClass = isDone
                  ? 'bg-slate-50/70 border-slate-200/80 opacity-75 hover:opacity-100 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-xs'

                return (
                  <div
                    key={comp.id}
                    className={`p-4 md:p-5 transition-all text-slate-800 relative rounded-xl overflow-hidden border ${cardStyleClass}`}
                    style={{
                      fontFamily: '"Switzer", sans-serif',
                    }}
                  >
                    {/* Scritta a tutto riquadro CONCLUSO in trasparenza per le commesse concluse (raddoppiata a 88px) */}
                    {isDone && (
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                        aria-hidden="true"
                      >
                        <span
                          className="font-black uppercase tracking-wider text-[#16a34a]/12 select-none leading-none text-center whitespace-nowrap"
                          style={{
                            fontSize: '88px',
                            fontFamily: '"Switzer", sans-serif',
                            letterSpacing: '0.04em',
                          }}
                        >
                          CONCLUSO
                        </span>
                      </div>
                    )}

                    {/* ── 1. TESTATA SCHEDA: NOME AZIENDA, STATO, LAVORO IMMINENTE & RETRIBUZIONE ── */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
                      
                      {/* Sinistra: Nome Grande Switzer, Settore, Badge di Stato, BANT e P.IVA B2B */}
                      <div className="flex items-start sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2
                              className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight"
                              style={{ fontFamily: '"Switzer", sans-serif' }}
                            >
                              {comp.name}
                            </h2>

                            {/* Settore con testo bold */}
                            <span
                              className="px-2.5 py-1 bg-sky-50 text-[#0369a1] border border-sky-200 text-[15px] md:text-sm font-black rounded-lg uppercase tracking-wide"
                            >
                              {comp.industry}
                            </span>

                            {/* Badge Stato Relazione & Pagamento in colori DADO su fondo chiaro */}
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[15px] font-bold"
                              style={{
                                backgroundColor: relStatus.bg,
                                color: relStatus.color,
                                border: `1px solid ${relStatus.border}`,
                              }}
                            >
                              <span>{relStatus.emoji}</span>
                              <strong className="font-extrabold">{relStatus.tag}</strong>
                            </span>

                            {/* B.A.N.T. Mark */}
                            <BantLogoMark size="sm" bant={bant} />

                            {/* Badge P.IVA & B2B Camerale (SENZA FONT-MONO) */}
                            {comp.piva ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEnrichModalQuery(comp.piva)
                                  setShowEnrichModal(true)
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[15px] font-bold transition-all cursor-pointer"
                                title={`Partita IVA: ${comp.piva} - Clicca per visualizzare dossier camerale completo B2B (Atoka, LinkedIn, D&B)`}
                              >
                                <Zap className="w-3 h-3 text-purple-600 fill-purple-600" />
                                <span className="font-semibold">P.IVA {comp.piva}</span>
                                {comp.creditRating && (
                                  <span className="text-[13px] text-amber-700 bg-amber-100 px-1 rounded font-extrabold ml-0.5">
                                    D&B {comp.creditRating.split(' ')[0]}
                                  </span>
                                )}
                              </button>
                            ) : !isDipendente ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEnrichExistingCompany(comp)
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 hover:border-purple-300 text-[15px] font-bold transition-all cursor-pointer"
                                title="Interroga Atoka, CCIAA e LinkedIn per arricchire automaticamente la scheda di questa azienda"
                              >
                                <Sparkles className="w-3 h-3 text-purple-600" />
                                <span>Arricchisci B2B</span>
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Destra: Retribuzione e Pulsanti Conseguenti Uno Sopra l'Altro (uguale a Tasks) */}
                      <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
                        <div className="text-left lg:text-right">
                          <div className="text-[13px] uppercase text-slate-400 font-extrabold tracking-wider">
                            RETRIBUZIONE
                          </div>
                          <div
                            className="text-xl md:text-2xl font-black leading-none mt-0.5 text-[#0284c7]"
                          >
                            <strong>
                              {isDipendente ? (
                                <span className="text-slate-400 font-bold text-base tracking-widest" title="Valore riservato ad Amministratore">
                                  •••• €
                                </span>
                              ) : (
                                `€ ${(comp.compensation?.amount || 0).toLocaleString('it-IT')}`
                              )}
                            </strong>
                          </div>
                          <div className="mt-1">
                            <span
                              className={`text-[13px] font-extrabold px-2 py-0.5 uppercase tracking-wide rounded-md ${
                                comp.compensation?.status === 'Saldato'
                                  ? 'bg-[#dcfce7] text-[#15803d]'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <strong>{comp.compensation?.status === 'Saldato' ? 'SALDATO' : comp.compensation?.status?.toUpperCase()}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Pulsanti Conseguenti Uno Sopra l'Altro (Allena AI, Completa, Rimuovi) + Tasto Dettagli */}
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-stretch gap-1 shrink-0 min-w-[96px]">
                            {/* 2. Completa */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setCompanies(prev => prev.map(c => {
                                  if (c.id !== comp.id) return c
                                  const isCompleted = c.relationshipStatus === 'lavoro_concluso' || c.compensation?.status === 'Saldato'
                                  return {
                                    ...c,
                                    relationshipStatus: isCompleted ? 'lead_inbound' : 'lavoro_concluso',
                                    status: isCompleted ? 'In trattativa' : 'Concluso',
                                    compensation: {
                                      ...c.compensation,
                                      status: isCompleted ? 'Acconto versato' : 'Saldato',
                                      balance: isCompleted ? (c.compensation?.balance || 1000) : 0,
                                    }
                                  }
                                }))
                              }}
                              className={`w-full justify-center px-2 py-1 rounded-lg border text-[13px] font-black uppercase transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0 ${
                                relStatus.key === 'lavoro_concluso'
                                  ? 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
                                  : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                              }`}
                              title={relStatus.key === 'lavoro_concluso' ? 'Riapri relazione commerciale' : 'Segna collaborazione come conclusa'}
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 ${relStatus.key === 'lavoro_concluso' ? 'text-slate-400' : 'text-[#16a34a]'}`} />
                              <span>{relStatus.key === 'lavoro_concluso' ? 'Riapri' : 'Completa'}</span>
                            </button>

                            {/* 3. Rimuovi */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (window.confirm(`Vuoi rimuovere la scheda aziendale di "${comp.name}" dal CRM?`)) {
                                  setCompanies(prev => prev.filter(c => c.id !== comp.id))
                                  setRemovedCompanies(prev => [comp, ...prev.filter(c => c.id !== comp.id)])
                                }
                              }}
                              className="w-full justify-center px-2 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-[13px] font-black uppercase transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                              title="Rimuovi scheda azienda dal CRM"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Rimuovi</span>
                            </button>
                          </div>

                          {/* Tasto Dettagli / Chiudi */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : comp.id)}
                            className={`px-3.5 py-2.5 text-[15px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer rounded-xl border ${
                              isExpanded
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-xs'
                                : 'bg-white hover:bg-sky-50 text-[#0284c7] border-sky-200 shadow-2xs'
                            }`}
                            style={{ fontFamily: '"Switzer", sans-serif' }}
                          >
                            <span>{isExpanded ? 'CHIUDI' : 'DETTAGLI'}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 stroke-[2.5]" /> : <ChevronDown className="w-4 h-4 stroke-[2.5]" />}
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Banner Stato Task Collegato (Fermo / In Corso) */}
                    {comp.taskStatusUpdate && (
                      <div className={`mt-3 p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                        comp.taskStatusUpdate.status === 'fermo'
                          ? 'bg-rose-50/90 border-rose-200 text-rose-900 shadow-2xs'
                          : comp.taskStatusUpdate.status === 'in_progress'
                          ? 'bg-sky-50/90 border-sky-200 text-sky-900 shadow-2xs'
                          : 'bg-emerald-50/90 border-emerald-200 text-emerald-900 shadow-2xs'
                      }`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase text-white tracking-wider ${
                            comp.taskStatusUpdate.status === 'fermo' ? 'bg-rose-600' :
                            comp.taskStatusUpdate.status === 'in_progress' ? 'bg-[#0073ea]' : 'bg-emerald-600'
                          }`}>
                            TASK {comp.taskStatusUpdate.statusLabel}
                          </span>
                          <span className="font-extrabold text-slate-800">
                            "{comp.taskStatusUpdate.taskTitle}"
                          </span>
                          {comp.taskStatusUpdate.reason && (
                            <span className="text-slate-600 font-medium">
                              — Motivo: <strong className="text-slate-900">{comp.taskStatusUpdate.reason}</strong>
                            </span>
                          )}
                        </div>
                        {comp.taskStatusUpdate.newDueDate && (
                          <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-bold text-[11px]">
                            <Calendar className="w-3 h-3 text-[#0284c7]" />
                            <span>Nuova Scadenza: <strong className="text-[#0284c7]">{comp.taskStatusUpdate.newDueDate}</strong></span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── 2. I 3 RIQUADRI ORGANIZZATI CON MISURE CALIBRATE ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 relative z-10 text-sm">
                      
                      {/* Riquadro 1: Referente, Recapiti Diretti & Canale */}
                      <div className="flex flex-col justify-between min-w-0">
                        <div>
                          <div className="text-[15px] font-black uppercase tracking-wider text-[#0284c7] flex items-center gap-1.5 mb-1.5">
                            <User className="w-3.5 h-3.5 text-[#0284c7]" />
                            <span>REFERENTE & ACQUISIZIONE</span>
                          </div>
                          <div className="font-black text-slate-900 text-base md:text-[17px] truncate" title={comp.contactPerson?.name}>
                            {comp.contactPerson?.name || 'Referente non indicato'}
                          </div>
                          <div className="text-[15px] md:text-sm text-slate-600 truncate font-semibold mt-0.5">
                            {comp.contactPerson?.role || comp.contact?.role || 'Referente aziendale'}
                          </div>
                        </div>

                        {/* Recapiti veloci con etichette corte in bold + Canale */}
                        <div className="flex items-center justify-between gap-1.5 mt-3 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            {contactEmail && (
                              <button
                                type="button"
                                onClick={(e) => handleCopy(contactEmail, `${comp.id}-email`, e)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[15px] font-bold transition-all cursor-pointer border ${
                                  copiedField === `${comp.id}-email`
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-sky-50 hover:bg-sky-100 text-slate-700 border-sky-200'
                                }`}
                                title={`Copia email: ${contactEmail}`}
                              >
                                <Mail className="w-3 h-3 text-[#0284c7]" />
                                <span>{copiedField === `${comp.id}-email` ? 'COPIATA' : 'MAIL'}</span>
                              </button>
                            )}
                            {contactPhone && (
                              <button
                                type="button"
                                onClick={(e) => handleCopy(contactPhone, `${comp.id}-phone`, e)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[15px] font-bold transition-all cursor-pointer border ${
                                  copiedField === `${comp.id}-phone`
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-sky-50 hover:bg-sky-100 text-slate-700 border-sky-200'
                                }`}
                                title={`Copia telefono: ${contactPhone}`}
                              >
                                <Phone className="w-3 h-3 text-[#0284c7]" />
                                <span>{copiedField === `${comp.id}-phone` ? 'COPIATO' : 'TEL'}</span>
                              </button>
                            )}
                          </div>

                          <span className="text-[15px] text-slate-500 font-medium truncate">
                            Canale: <strong className="text-slate-800 uppercase font-black">{acq?.shortChannel || 'INBOUND'}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Riquadro 2: File allegati (nessun codice o data: conta che i file ci siano) */}
                      <div className="flex flex-col justify-between min-w-0">
                        <div>
                          <div className="text-[15px] font-black uppercase tracking-wider text-[#0284c7] flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Paperclip className="w-4 h-4 text-[#0284c7]" />
                              <span>ALLEGATI</span>
                            </div>
                            <span className="text-[13px] font-black px-2 py-0.5 rounded bg-sky-100 text-[#0369a1]">
                              {contractsHistory.length > 0
                                ? `${contractsHistory.length} ${contractsHistory.length === 1 ? 'FILE' : 'FILE'}`
                                : 'NESSUN FILE'}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1 custom-popup-scrollbar">
                            {contractsHistory.length === 0 && (
                              <span className="text-[15px] text-slate-400 font-medium">Nessun file allegato</span>
                            )}
                            {contractsHistory.map((ctr, idx) => (
                              <div key={ctr.code || idx} className="py-0.5 text-[15px] flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="text-[14px] text-slate-700 font-semibold truncate" title={ctr.title}>{ctr.title}</span>
                                </span>
                                <span className="text-right shrink-0 flex items-center gap-2">
                                  <strong className="font-black text-slate-900 text-[15px]">
                                    {isDipendente ? '•••• €' : `€ ${(ctr.amount || 0).toLocaleString('it-IT')}`}
                                  </strong>
                                  <span
                                    className={`text-[12px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                                      ctr.status === 'Firmato' || ctr.status === 'Saldato'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {ctr.status}
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-end mt-2 text-[14px]">
                          <span className="text-slate-500 font-bold">
                            Totale: <strong className="text-[#0284c7] font-black">{isDipendente ? '•••• €' : `€ ${contractsHistory.reduce((s, c) => s + (c.amount || 0), 0).toLocaleString('it-IT')}`}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Riquadro 3: Contratto Attivo, Stato & Criticità */}
                      <div className="flex flex-col justify-between min-w-0">
                        <div>
                          <div className="text-[15px] font-black uppercase tracking-wider text-[#0284c7] flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              <span>CONTRATTO ATTIVO</span>
                            </div>
                            <span className="flex items-center gap-1 text-amber-600 font-black text-[15px]">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{comp.feedback?.rating ? comp.feedback.rating.toFixed(1) : '5.0'}</span>
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 text-sm truncate" title={comp.contract?.fileName}>
                            {comp.contract?.fileName || comp.contract?.code || 'CTR-DADO-2026'}
                          </div>
                          <div className="text-[15px] text-slate-500 truncate mt-0.5 font-medium">
                            Formato: <strong className="text-slate-700 font-bold">{comp.contract?.digitalFormat || 'PDF'}</strong> • <strong className="text-slate-700 font-bold">{comp.contract?.status?.toUpperCase() || 'FIRMATO'}</strong>
                          </div>
                        </div>

                        <div className="mt-3 text-[15px] truncate">
                          {comp.issues?.isResolved === 'Risolto' ? (
                            <span className="text-emerald-700 font-black flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>CRITICITÀ RISOLTA (100%)</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">Nessuna criticità emersa</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* ── 3. DETTAGLI COMPLETI ESPANSI (IN SWITZER SU SFONDO CHIARO SENZA RIQUADRETTI DURI) ── */}
                    {isExpanded && (
                      <div className="mt-5 flex flex-col gap-4 animate-in fade-in duration-150 text-slate-800">
                        
                        {/* Sezione B.A.N.T. Approfondita */}
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <BantLogoMark size="md" bant={bant} />
                              <strong className="text-sm font-black uppercase tracking-wider text-slate-900">
                                QUALIFICAZIONE COMMERCIALE B.A.N.T.
                              </strong>
                            </div>
                            {bant.isComplete ? (
                              <span className="text-[15px] text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                                🟢 4/4 PARAMETRI RILEVATI • LEAD QUALIFICATO
                              </span>
                            ) : (
                              <span className="text-[15px] text-amber-800 font-extrabold bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
                                ⚠️ {4 - bant.score} PARAMETRI MANCANTI: {bant.missingLabel.toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[15px]">
                            {/* Budget */}
                            <div className="min-w-0">
                              <div className="text-sm font-black uppercase text-[#16a34a] flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-md bg-[#16a34a]/10 flex items-center justify-center text-[#16a34a] font-black text-[15px]">B</span>
                                  <span>BUDGET</span>
                                </span>
                                {!bant.hasB && <strong className="text-[13px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">DA DEFINIRE</strong>}
                              </div>
                              <div className="text-base font-black text-slate-900 mt-1.5">
                                {isDipendente ? (
                                  <span className="text-slate-400 font-bold text-sm tracking-wider" title="Budget riservato ad Amministratore">
                                    🔒 Riservato
                                  </span>
                                ) : (
                                  bant.budget
                                )}
                              </div>
                              <div className="text-[14px] text-slate-500 mt-1">
                                Capacità di spesa allocata per l'intervento
                              </div>
                            </div>

                            {/* Authority */}
                            <div className="min-w-0">
                              <div className="text-sm font-black uppercase text-[#dc2626] flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-md bg-[#dc2626]/10 flex items-center justify-center text-[#dc2626] font-black text-[15px]">A</span>
                                  <span>AUTHORITY</span>
                                </span>
                                {!bant.hasA && <strong className="text-[13px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">DA VERIFICARE</strong>}
                              </div>
                              <div className="text-sm md:text-base font-black text-slate-900 mt-1.5 truncate" title={bant.authority}>
                                {bant.authority}
                              </div>
                              <div className="text-[14px] text-slate-500 mt-1">
                                Referente decisionale con potere di firma
                              </div>
                            </div>

                            {/* Need */}
                            <div className="min-w-0">
                              <div className="text-sm font-black uppercase text-[#0284c7] flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-md bg-[#0284c7]/10 flex items-center justify-center text-[#0284c7] font-black text-[15px]">N</span>
                                  <span>NEED</span>
                                </span>
                                {!bant.hasN && <strong className="text-[13px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">DA CHIARIRE</strong>}
                              </div>
                              <div className="text-[15px] md:text-sm font-bold text-slate-900 mt-1.5 line-clamp-2 leading-relaxed" title={bant.need}>
                                {bant.need}
                              </div>
                              <div className="text-[14px] text-slate-500 mt-1">
                                Esigenza operativa e output atteso
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="min-w-0">
                              <div className="text-sm font-black uppercase text-[#d97706] flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-md bg-[#d97706]/10 flex items-center justify-center text-[#d97706] font-black text-[15px]">T</span>
                                  <span>TIMELINE</span>
                                </span>
                                {!bant.hasT && <strong className="text-[13px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">DA FISSARE</strong>}
                              </div>
                              <div className="text-sm md:text-base font-black text-slate-900 mt-1.5">
                                {bant.timeline}
                              </div>
                              <div className="text-[14px] text-slate-500 mt-1">
                                Finestra temporale di erogazione
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Griglia 2 Colonne Aperta */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          
                          {/* Colonna 1: Storico e Orari */}
                          <div className="flex flex-col gap-3">
                            <div className="min-w-0">
                              <strong className="text-[15px] font-black uppercase text-[#0284c7] flex items-center gap-1.5 mb-2">
                                <Clock className="w-4 h-4" />
                                PROGRAMMAZIONE ORARI & LOCATION
                              </strong>
                              <div className="text-sm font-extrabold text-slate-900">
                                {comp.workSchedule?.datesFormatted || 'Date da calendarizzare'}
                              </div>
                              <div className="text-[15px] text-slate-600 font-semibold mt-1">
                                Tipologia: <strong>{comp.workSchedule?.scheduleType}</strong>
                              </div>
                              <div className="text-[15px] text-slate-600 mt-1">
                                Orari: <strong>{comp.workSchedule?.hours || 'Standard'}</strong>
                              </div>
                              {comp.workSchedule?.location && (
                                <div className="text-[15px] text-slate-600 mt-1">
                                  Location: <strong>{comp.workSchedule?.location}</strong>
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 bg-sky-50/60 p-3 rounded-xl border border-sky-200/70">
                              <strong className="text-sm font-black uppercase text-[#0284c7] flex items-center gap-1.5 mb-2">
                                <Mail className="w-4 h-4" />
                                AGGIORNAMENTI ESTRATTI DA EMAIL (SENZA TESTO ALLEGATO)
                              </strong>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                                <div>
                                  <span className="text-slate-500 font-bold block text-[11px] uppercase">Indirizzo Email:</span>
                                  <strong className="text-slate-900 font-black truncate block">{contactEmail || comp.contact?.email || 'Non rilevato'}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block text-[11px] uppercase">Referente:</span>
                                  <strong className="text-slate-900 font-black truncate block">{comp.contactPerson?.name || 'Referente'} ({comp.contactPerson?.role || 'Aziendale'})</strong>
                                </div>
                                <div className="sm:col-span-2">
                                  <span className="text-slate-500 font-bold block text-[11px] uppercase">Dettagli Contratto:</span>
                                  <strong className="text-slate-900 font-bold block">
                                    {comp.contract?.status || 'In valutazione'} — {comp.contract?.terms || comp.compensation?.status || '50% acconto / 50% saldo'}
                                  </strong>
                                </div>
                                <div className="sm:col-span-2">
                                  <span className="text-slate-500 font-bold block text-[11px] uppercase mb-1">Richieste da Oggetto Mail:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(Array.isArray(comp.subjectRequests) && comp.subjectRequests.length > 0
                                      ? comp.subjectRequests
                                      : comp.firstContact?.lastEmailSubject
                                      ? [comp.firstContact.lastEmailSubject]
                                      : (comp.requestedMaterials || []).slice(0, 2)
                                    ).map((req, rIdx) => (
                                      <span key={rIdx} className="px-2 py-0.5 bg-white border border-sky-200 text-[#0369a1] text-[12px] font-extrabold rounded-md">
                                        {req}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Colonna 2: Materiali, Contratto e Dettaglio Finanziario */}
                          <div className="flex flex-col gap-3">
                            <div className="min-w-0">
                              <strong className="text-[15px] font-black uppercase text-[#0284c7] flex items-center gap-1.5 mb-2">
                                <Camera className="w-4 h-4" />
                                MATERIALI & OUTPUT RICHIESTI
                              </strong>
                              <div className="flex flex-wrap gap-1.5">
                                {comp.requestedMaterials?.map((item, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-[15px] font-bold rounded-md"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <strong className="text-[15px] font-black uppercase text-slate-900 flex items-center gap-1.5">
                                  <FileText className="w-4 h-4 text-[#0284c7]" />
                                  FILE ALLEGATI
                                </strong>
                                <span className="text-[14px] font-extrabold px-2 py-0.5 bg-sky-100 text-[#0369a1] rounded">
                                  {contractsHistory.length} FILE
                                </span>
                              </div>
                              <div className="flex flex-col gap-2 mt-1">
                                {contractsHistory.map((ctr, idx) => (
                                  <div key={ctr.code || idx} className="py-0.5 text-[15px]">
                                    <div className="flex items-center justify-between font-bold text-slate-900">
                                      <span className="flex items-center gap-1.5">
                                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="font-bold text-[15px]">{ctr.title}</span>
                                      </span>
                                      <span className="text-[#0284c7] font-black">{isDipendente ? '•••• €' : `€ ${(ctr.amount || 0).toLocaleString('it-IT')}`}</span>
                                    </div>
                                    {ctr.terms && (
                                      <div className="text-[14px] text-slate-500 mt-0.5">
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-1">
                          <div className="min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <strong className="text-[15px] font-black uppercase text-slate-800 flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                FEEDBACK SULLA COLLABORAZIONE
                              </strong>
                              <strong className="text-[15px] font-black text-slate-800">
                                ★ {comp.feedback?.rating} / 5.0
                              </strong>
                            </div>
                            <p className="text-[15px] text-slate-800 italic leading-relaxed">
                              "{comp.feedback?.notes}"
                            </p>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <strong className="text-[15px] font-black uppercase text-emerald-800 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                GESTIONE CRITICITÀ
                              </strong>
                              <span className="text-[13px] font-extrabold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                                ✓ {comp.issues?.isResolved?.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-[15px] text-slate-800 mb-1">
                              <strong>Criticità:</strong> {comp.issues?.description}
                            </div>
                            <div className="text-[15px] text-emerald-900 font-medium">
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

      {/* ── MODAL AGGIUNGI NUOVA SCHEDA AZIENDA CON B2B DATA ENRICHMENT AUTOMATICO ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-white border border-sky-200 p-6 max-w-3xl w-full my-8 text-left shadow-2xl rounded-2xl relative text-slate-800"
            style={{ fontFamily: '"Switzer", sans-serif' }}
          >
            <div className="flex items-center justify-between mb-3 border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0284c7] flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Nuova Scheda Azienda & Collaborazione
                  </h3>
                  <p className="text-[14px] text-slate-500 font-medium">
                    Compila manualmente o usa il motore di Data Enrichment B2B per l'autocompletamento camerale
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg p-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* ── BOX DATA ENRICHMENT B2B AUTOMATICO (ATOKA, LINKEDIN, CCIAA, D&B) ── */}
            <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-purple-900/5 via-sky-900/5 to-indigo-900/5 border border-purple-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-[15px] text-purple-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Zap className="w-4 h-4 text-purple-600 fill-purple-600" />
                  Data Enrichment B2B Automatico (AI & Registri Pubblici)
                </span>
                <span className="text-[13px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-bold border border-purple-200">
                  Atoka • LinkedIn • D&B • CCIAA
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={enrichVatInput}
                  onChange={(e) => {
                    const val = e.target.value
                    setEnrichVatInput(val)
                    // Se l'utente incolla o digita esattamente 11 cifre numeriche (Partita IVA), avvia arricchimento rapido
                    const clean = val.replace(/[^0-9]/g, '')
                    if (clean.length === 11) {
                      handleAutoEnrichInForm(clean)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAutoEnrichInForm(enrichVatInput)
                    }
                  }}
                  placeholder="Inserisci Partita IVA (11 cifre) o Ragione Sociale (es. 02194830159, Kroma, Ferrari, Prada)..."
                  className="flex-1 bg-white border border-purple-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-lg px-3 py-2 text-[15px] font-semibold text-slate-900 placeholder-slate-400"
                />
                <button
                  type="button"
                  disabled={enrichLoading}
                  onClick={() => handleAutoEnrichInForm(enrichVatInput)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[15px] font-extrabold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {enrichLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Interrogazione...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Arricchisci con AI</span>
                    </>
                  )}
                </button>
              </div>

              {enrichFeedback && (
                <div className={`mt-2 text-[14px] font-bold flex items-center gap-1.5 ${enrichFeedback.startsWith('✓') ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-amber-800 bg-amber-50 border border-amber-200'} p-2 rounded-lg`}>
                  {enrichFeedback.startsWith('✓') ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />}
                  <span>{enrichFeedback}</span>
                </div>
              )}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const newCompany = {
                  id: 'comp-' + Date.now(),
                  name: newCompanyForm.name || 'Nuova Azienda',
                  piva: newCompanyForm.piva || '',
                  fiscalCode: newCompanyForm.fiscalCode || newCompanyForm.piva || '',
                  industry: newCompanyForm.industry || 'Settore Creativo',
                  status: 'Attivo',
                  contactPerson: {
                    name: newCompanyForm.contactPerson || 'Referente',
                    role: newCompanyForm.role || 'Referente Direzione'
                  },
                  contact: {
                    email: newCompanyForm.email || '',
                    directEmail: newCompanyForm.email || '',
                    phone: newCompanyForm.phone || '',
                    mobile: newCompanyForm.mobile || ''
                  },
                  legalAddress: newCompanyForm.address ? { street: newCompanyForm.address } : null,
                  sdi: newCompanyForm.sdi || '0000000',
                  pec: newCompanyForm.pec || '',
                  firstContact: {
                    date: new Date().toISOString().split('T')[0],
                    channel: newCompanyForm.firstContactChannel || 'Inbound',
                    notes: newCompanyForm.firstContactNotes || 'Scheda registrata nel CRM DADO.'
                  },
                  requestedMaterials: (newCompanyForm.materials || '').split(',').map(s => s.trim()).filter(Boolean),
                  contract: {
                    code: 'DADO-CTR-' + Date.now().toString().slice(-4),
                    fileName: `Contratto_${(newCompanyForm.name || 'Azienda').replace(/\s+/g, '_')}_signed.pdf`,
                    digitalFormat: 'PDF firmato digitalmente',
                    status: 'Firmato',
                    signedDate: new Date().toISOString().split('T')[0],
                    terms: newCompanyForm.contractTerms || 'Termini standard DADO Studio'
                  },
                  contractsHistory: [
                    {
                      code: 'DADO-CTR-' + Date.now().toString().slice(-4),
                      date: new Date().toISOString().split('T')[0],
                      title: `Contratto Iniziale - ${newCompanyForm.name || 'Nuova Azienda'}`,
                      amount: parseFloat(newCompanyForm.amount) || 0,
                      status: 'Firmato',
                      digitalFormat: 'PDF firmato digitalmente',
                      terms: newCompanyForm.contractTerms || 'Termini standard DADO Studio'
                    }
                  ],
                  workSchedule: {
                    scheduleType: newCompanyForm.scheduleType || 'Un giorno intero',
                    datesFormatted: newCompanyForm.workDates || 'Da concordare',
                    hours: 'Standard',
                    recentDate: new Date().toISOString().split('T')[0]
                  },
                  feedback: {
                    rating: 5.0,
                    notes: 'Prima collaborazione registrata con successo.'
                  },
                  compensation: {
                    amount: parseFloat(newCompanyForm.amount) || 0,
                    deposit: parseFloat(newCompanyForm.deposit) || 0,
                    balance: (parseFloat(newCompanyForm.amount) || 0) - (parseFloat(newCompanyForm.deposit) || 0),
                    status: (parseFloat(newCompanyForm.amount) || 0) === (parseFloat(newCompanyForm.deposit) || 0) ? 'Saldato' : 'Acconto versato',
                    paymentMethod: 'Bonifico Bancario 30gg d.f.'
                  },
                  issues: {
                    hasIssue: false,
                    description: 'Nessuna criticità emersa.',
                    isResolved: 'Risolto',
                    resolution: 'Collaborazione fluida senza intoppi.'
                  },
                  lastContact: new Date().toISOString()
                }

                try {
                  const res = await fetch('/api/crm/companies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newCompany)
                  })
                  const saved = await res.json()
                  if (saved.success && saved.company) {
                    setCompanies([saved.company, ...companies])
                  } else {
                    setCompanies([newCompany, ...companies])
                  }
                } catch {
                  setCompanies([newCompany, ...companies])
                }

                setShowAddModal(false)
              }}
              className="flex flex-col gap-3 text-[15px] text-slate-800"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 mb-1 font-bold">Ragione Sociale / Nome Azienda *</label>
                  <input
                    value={newCompanyForm.name}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, name: e.target.value })}
                    required
                    placeholder="Es. Officine Meccaniche Riva S.p.A."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Partita IVA</label>
                  <input
                    value={newCompanyForm.piva}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, piva: e.target.value })}
                    placeholder="11 cifre (es. 02194830159)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 mb-1 font-bold">Settore di Attività & ATECO</label>
                  <input
                    value={newCompanyForm.industry}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, industry: e.target.value })}
                    placeholder="Es. 25.62.00 - Lavorazioni meccaniche di precisione"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Codice SDI (Fattura Elettr.)</label>
                  <input
                    value={newCompanyForm.sdi}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, sdi: e.target.value })}
                    placeholder="7 caratteri (es. M5UXCR1)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Referente Principale (da LinkedIn)</label>
                  <input
                    value={newCompanyForm.contactPerson}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, contactPerson: e.target.value })}
                    placeholder="Es. Ing. Marco Riva"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Ruolo Aziendale</label>
                  <input
                    value={newCompanyForm.role}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, role: e.target.value })}
                    placeholder="Es. Managing Director / Direttore Marketing"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Email Diretta</label>
                  <input
                    value={newCompanyForm.email}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, email: e.target.value })}
                    placeholder="marco.riva@officineriva.it"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Telefono Sede</label>
                  <input
                    value={newCompanyForm.phone}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, phone: e.target.value })}
                    placeholder="+39 02 249811"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">PEC Aziendale</label>
                  <input
                    value={newCompanyForm.pec}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, pec: e.target.value })}
                    placeholder="azienda@legalmail.it"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Budget Previsto (€)</label>
                  <input
                    type="number"
                    value={newCompanyForm.amount}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Acconto Versato (€)</label>
                  <input
                    type="number"
                    value={newCompanyForm.deposit}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, deposit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Date Shooting / Set</label>
                  <input
                    value={newCompanyForm.workDates}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, workDates: e.target.value })}
                    placeholder="Es. Entro 2 settimane"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Servizi DADO Raccomandati (Separati da virgola)</label>
                <input
                  value={newCompanyForm.materials}
                  onChange={(e) => setNewCompanyForm({ ...newCompanyForm, materials: e.target.value })}
                  placeholder="Shooting Video Corporate, Drone 4K indoor, Spot ADV Limbo Studio"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2.5 mt-2 pt-3 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={15} />
                  <span>Salva Scheda Azienda nel CRM</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODALE COMPLETO B2B DATA ENRICHMENT & DOSSIER CAMERALE ── */}
      {showRemovedModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setShowRemovedModal(false)}>
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-5" onClick={(e) => e.stopPropagation()} style={{ fontFamily: '"Switzer", sans-serif' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Schede rimosse</h2>
              <button type="button" onClick={() => setShowRemovedModal(false)} className="p-1 rounded-md hover:bg-slate-100 cursor-pointer">
                <CloseIcon className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            {removedCompanies.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">Nessuna scheda rimossa.</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto flex flex-col gap-2">
                {removedCompanies.map(c => (
                  <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-slate-200">
                    <span className="text-sm font-semibold text-slate-800 truncate">{c.name}</span>
                    <button type="button" onClick={() => restoreCompany(c)} className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[15px] font-semibold cursor-pointer shrink-0">
                      <RotateCcw className="w-3 h-3" /> Ripristina
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <B2BEnrichmentModal
        isOpen={showEnrichModal}
        onClose={() => setShowEnrichModal(false)}
        initialQuery={enrichModalQuery}
        onCompanyCreated={(newComp) => {
          setCompanies(prev => [newComp, ...prev])
        }}
        onSelectCompany={(enrichment) => {
          if (enrichment?.company) {
            const c = enrichment.company
            setNewCompanyForm(prev => ({
              ...prev,
              name: c.legalName || c.brandName || prev.name,
              piva: c.vatNumber || prev.piva,
              fiscalCode: c.fiscalCode || prev.fiscalCode,
              industry: c.atecoDescription ? `${c.atecoCode} - ${c.atecoDescription.split(' e ')[0]}` : prev.industry,
              contactPerson: c.decisionMakers?.[0]?.name || prev.contactPerson,
              role: c.decisionMakers?.[0]?.role || prev.role,
              email: c.decisionMakers?.[0]?.email || prev.email,
              phone: c.phone || prev.phone,
              mobile: c.decisionMakers?.[0]?.mobile || prev.mobile,
              address: c.legalAddress ? `${c.legalAddress.street}, ${c.legalAddress.zip} ${c.legalAddress.city} (${c.legalAddress.province})` : prev.address,
              sdi: c.sdiCode || prev.sdi,
              pec: c.pec || prev.pec,
              amount: c.suggestedBudget ? String(c.suggestedBudget) : prev.amount,
              deposit: c.suggestedBudget ? String(Math.round(c.suggestedBudget * 0.3)) : prev.deposit,
              materials: (c.recommendedDadoServices || []).join(', '),
              contractTerms: c.recommendedPaymentTerms || prev.contractTerms,
            }))
            setShowAddModal(true)
          }
        }}
      />

      {/* ── MODALE ISTRUZIONI ALLENA AI (LAMPADINA) ── */}

    </div>
  )
}
