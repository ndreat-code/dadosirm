import { useState, useEffect, useMemo } from 'react'
import {
  Building2,
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
  Filter,
  ArrowUpDown,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  Camera,
  Check
} from 'lucide-react'

// Helper per determinare lo stato di relazione / pagamento dell'azienda
export function getCompanyRelationshipStatus(comp) {
  if (comp.relationshipStatus) {
    switch (comp.relationshipStatus) {
      case 'in_coda_pagamento':
        return { key: 'in_coda_pagamento', label: 'In coda pagamento', emoji: '⏳', color: '#ff9800', bg: 'rgba(255, 152, 0, 0.15)', border: 'rgba(255, 152, 0, 0.45)' }
      case 'in_attesa_risposta':
        return { key: 'in_attesa_risposta', label: 'In attesa risposta', emoji: '🔄', color: '#00e5ff', bg: 'rgba(0, 229, 255, 0.15)', border: 'rgba(0, 229, 255, 0.45)' }
      case 'lavoro_concluso':
        return { key: 'lavoro_concluso', label: 'Lavoro concluso', emoji: '✅', color: '#c084fc', bg: 'transparent', border: 'transparent' }
      case 'rifiutato':
        return { key: 'rifiutato', label: 'Rifiutato all\'ultimo', emoji: '❌', color: '#ff4444', bg: 'rgba(255, 68, 68, 0.15)', border: 'rgba(255, 68, 68, 0.45)' }
      case 'interrotto':
        return { key: 'interrotto', label: 'Rapporto interrotto', emoji: '⛔', color: '#e53935', bg: 'rgba(229, 57, 53, 0.2)', border: 'rgba(229, 57, 53, 0.5)' }
      default:
        break
    }
  }

  // Deduci dai dati del CRM
  if (comp.status === 'Rifiutato') {
    return { key: 'rifiutato', label: 'Rifiutato all\'ultimo', emoji: '❌', color: '#ff4444', bg: 'rgba(255, 68, 68, 0.15)', border: 'rgba(255, 68, 68, 0.45)' }
  }
  if (comp.status === 'Interrotto') {
    return { key: 'interrotto', label: 'Rapporto interrotto', emoji: '⛔', color: '#e53935', bg: 'rgba(229, 57, 53, 0.2)', border: 'rgba(229, 57, 53, 0.5)' }
  }

  const compStatus = comp.compensation?.status
  const balance = comp.compensation?.balance || 0
  if (compStatus === 'Acconto versato' || balance > 0) {
    return { key: 'in_coda_pagamento', label: 'In coda pagamento', emoji: '⏳', color: '#ff9800', bg: 'rgba(255, 152, 0, 0.15)', border: 'rgba(255, 152, 0, 0.45)' }
  }
  if (comp.id === 'comp-1' || comp.id === 'comp-4' || comp.id === 'comp-10') {
    return { key: 'in_attesa_risposta', label: 'In attesa risposta', emoji: '🔄', color: '#00e5ff', bg: 'rgba(0, 229, 255, 0.15)', border: 'rgba(0, 229, 255, 0.45)' }
  }

  return { key: 'lavoro_concluso', label: 'Lavoro concluso', emoji: '✅', color: '#c084fc', bg: 'transparent', border: 'transparent' }
}

// ── Acronimo B.A.N.T. stile Brand Logo DADO con rilevamento dinamico parametri mancanti ──
// Sequenza colori identica al logo DADO: B: Verde (#53ba75), A: Rosso (#ea3824), N: Ciano (#1bb7ed), T: Giallo (#fac429)
export function BantLogoMark({ size = 'sm', bant = null }) {
  const isSm = size === 'sm'
  const hasB = bant ? bant.hasB : true
  const hasA = bant ? bant.hasA : true
  const hasN = bant ? bant.hasN : true
  const hasT = bant ? bant.hasT : true

  return (
    <div
      className="inline-flex items-center gap-1 select-none px-2 py-0.5 rounded bg-black/80 border border-white/20 shadow-inner shrink-0"
      title={`Framework B.A.N.T. ${bant ? `(${bant.score}/4 completati${bant.missingList?.length ? ' - Manca: ' + bant.missingLabel : ''})` : ''}`}
    >
      {/* B • Budget */}
      <div className={`flex items-center gap-0.5 ${hasB ? '' : 'opacity-25'}`}>
        <span
          style={{
            fontFamily: '"Goldman", sans-serif',
            color: hasB ? '#53ba75' : '#888888',
            fontWeight: 900,
            fontSize: isSm ? '11px' : '13px',
            lineHeight: 1,
            textDecoration: hasB ? 'none' : 'line-through',
          }}
        >
          B
        </span>
        <span className={`w-0.5 h-0.5 rounded-full ${hasB ? 'bg-[#53ba75]' : 'bg-[#666666]'}`} />
      </div>

      {/* A • Authority */}
      <div className={`flex items-center gap-0.5 ${hasA ? '' : 'opacity-25'}`}>
        <span
          style={{
            fontFamily: '"Goldman", sans-serif',
            color: hasA ? '#ea3824' : '#888888',
            fontWeight: 900,
            fontSize: isSm ? '11px' : '13px',
            lineHeight: 1,
            textDecoration: hasA ? 'none' : 'line-through',
          }}
        >
          A
        </span>
        <span className={`w-0.5 h-0.5 rounded-full ${hasA ? 'bg-[#ea3824]' : 'bg-[#666666]'}`} />
      </div>

      {/* N • Need */}
      <div className={`flex items-center gap-0.5 ${hasN ? '' : 'opacity-25'}`}>
        <span
          style={{
            fontFamily: '"Goldman", sans-serif',
            color: hasN ? '#1bb7ed' : '#888888',
            fontWeight: 900,
            fontSize: isSm ? '11px' : '13px',
            lineHeight: 1,
            textDecoration: hasN ? 'none' : 'line-through',
          }}
        >
          N
        </span>
        <span className={`w-0.5 h-0.5 rounded-full ${hasN ? 'bg-[#1bb7ed]' : 'bg-[#666666]'}`} />
      </div>

      {/* T • Timeline */}
      <div className={`flex items-center gap-0.5 ${hasT ? '' : 'opacity-25'}`}>
        <span
          style={{
            fontFamily: '"Goldman", sans-serif',
            color: hasT ? '#fac429' : '#888888',
            fontWeight: 900,
            fontSize: isSm ? '11px' : '13px',
            lineHeight: 1,
            textDecoration: hasT ? 'none' : 'line-through',
          }}
        >
          T
        </span>
      </div>
    </div>
  )
}

// Helper per estrarre e verificare lo stato completo dei 4 parametri B.A.N.T.
export function getCompanyBant(comp) {
  let budget = comp.bant?.budget
  let authority = comp.bant?.authority
  let need = comp.bant?.need
  let timeline = comp.bant?.timeline

  // Se non esplicitamente in comp.bant, fallback sui dati del CRM
  if (budget === undefined) {
    if (comp.id === 'comp-9' || comp.name?.includes('Nexura')) {
      budget = null // Simula richiesta preventivo arrivata senza budget
    } else if (comp.compensation?.amount) {
      budget = `€ ${comp.compensation.amount.toLocaleString('it-IT')}`
    } else {
      budget = null
    }
  }

  if (authority === undefined) {
    if (comp.id === 'comp-11' || comp.name?.includes('Urban Mobility')) {
      authority = null // Referente decisionale non ancora identificato
    } else if (comp.contactPerson?.name) {
      authority = `${comp.contactPerson.name}${comp.contactPerson.role ? ' (' + comp.contactPerson.role + ')' : ''}`
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
      timeline = null // Scadenza non ancora concordata
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

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSchedule, setFilterSchedule] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [filterRelationship, setFilterRelationship] = useState('all')
  const [filterBant, setFilterBant] = useState('all') // 'all', 'complete', 'incomplete'
  const [sortBy, setSortBy] = useState('recent') // 'recent', 'oldest', 'compensation_desc', 'rating_desc'
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

  // Calcolo KPI riassuntivi
  const stats = useMemo(() => {
    const total = companies.length
    const totalRevenue = companies.reduce((acc, c) => acc + (c.compensation?.amount || 0), 0)
    const fullyPaid = companies.filter(c => c.compensation?.status === 'Saldato').length
    const withResolvedIssues = companies.filter(c => c.issues?.isResolved === 'Risolto').length
    return {
      total,
      totalRevenue: totalRevenue.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
      fullyPaid,
      withResolvedIssues,
    }
  }, [companies])

  // Filtro e ordinamento dal più recente al meno recente
  const filteredCompanies = useMemo(() => {
    let list = [...companies]

    // Ricerca testuale ad ampio spettro (Azienda, referente, contatti, attrezzatura, contratti, orari, note, pagamenti)
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
        c.workSchedule?.recentDate?.toLowerCase().includes(q) ||
        c.compensation?.status?.toLowerCase().includes(q) ||
        c.issues?.description?.toLowerCase().includes(q) ||
        c.issues?.resolution?.toLowerCase().includes(q) ||
        c.feedback?.notes?.toLowerCase().includes(q) ||
        (c.requestedMaterials && c.requestedMaterials.some(m => m.toLowerCase().includes(q)))
      )
    }

    // Filtro orario
    if (filterSchedule !== 'all') {
      list = list.filter(c => c.workSchedule?.scheduleType?.toLowerCase().includes(filterSchedule.toLowerCase()))
    }

    // Filtro pagamento
    if (filterPayment !== 'all') {
      list = list.filter(c => c.compensation?.status === filterPayment)
    }

    // Filtro stato relazione / pagamento (nuovo)
    if (filterRelationship !== 'all') {
      list = list.filter(c => getCompanyRelationshipStatus(c).key === filterRelationship)
    }

    // Filtro B.A.N.T. (Tutti, Completi 4/4, Incompleti con parametri mancanti)
    if (filterBant !== 'all') {
      list = list.filter(c => {
        const bant = getCompanyBant(c)
        return filterBant === 'complete' ? bant.isComplete : !bant.isComplete
      })
    }

    // Ordinamento (Default: dal più recente al meno recente)
    list.sort((a, b) => {
      const dateA = new Date(a.workSchedule?.recentDate || a.lastContact || 0)
      const dateB = new Date(b.workSchedule?.recentDate || b.lastContact || 0)

      if (sortBy === 'recent') return dateB - dateA
      if (sortBy === 'oldest') return dateA - dateB
      if (sortBy === 'compensation_desc') return (b.compensation?.amount || 0) - (a.compensation?.amount || 0)
      if (sortBy === 'rating_desc') return (b.feedback?.rating || 0) - (a.feedback?.rating || 0)
      return 0
    })

    return list
  }, [companies, search, filterSchedule, filterPayment, filterRelationship, filterBant, sortBy])

  return (
    <div className="h-full min-h-screen md:min-h-0 bg-[#111111] flex flex-col flex-1 relative overflow-hidden">
      
      {/* ── CANVAS VERDE TAVOLO DA BILIARDO (#007a50) COME LA DASHBOARD ── */}
      <div className="h-full flex-1 bg-[#007a50] rounded-tl-[48px] rounded-bl-[48px] flex flex-col justify-between relative min-w-0 overflow-hidden">

        {/* ── Banda Bianca Superiore ── */}
        <div className="w-full flex justify-end flex-shrink-0">
          <div className="bg-white rounded-bl-2xl w-[calc(100%-2.5rem)]" style={{ height: 'calc(3rem - 0.5cm)' }} />
        </div>

        {/* ── Contenuto Principale con scroll ── */}
        <div className="flex-1 min-h-0 pl-10 pr-8 py-3 overflow-y-auto">

          {/* ── TITOLO IN ALTO A SINISTRA (FONT INSPIRATION + SOTTOTITOLO GOLDMAN BLU/ARANCIO) ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-black/20 pb-4">
            <div>
              {/* Titolo Principale Inspiration identico a Dashboard */}
              <h1 className="leading-none flex items-baseline gap-0.5">
                <span
                  style={{
                    fontFamily: 'Inspiration, cursive',
                    fontSize: '3.6rem',
                    color: '#111111',
                    lineHeight: 1,
                  }}
                >
                  Companies
                </span>
              </h1>

              {/* Sottotitolo Switzer & Goldman */}
              <p style={{ marginTop: '4px', fontSize: '18px', fontFamily: '"Switzer", sans-serif', fontWeight: 600 }}>
                <span style={{ color: '#00e5ff' }}>Client database & </span>
                <span style={{ color: '#ff6f43' }}>contracts</span>
                <span style={{ color: '#ffffff', fontSize: '13.5px', fontFamily: '"Space Mono", monospace', marginLeft: '14px', fontWeight: 400 }}>
                  ({filteredCompanies.length} partner)
                </span>
                <span className="hidden md:inline-block ml-3 text-xs tracking-wider uppercase font-semibold text-white/40" style={{ fontFamily: '"Switzer", sans-serif' }}>
                  • Hello there, we are DADO C.S.
                </span>
              </p>
            </div>

            {/* Pulsanti Azione e Badge Ordinamento */}
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className="px-3 py-1.5 bg-[#111111] text-xs font-mono text-white rounded-none border border-black flex items-center gap-2 shadow-sm"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#00e5ff]" />
                <span>Ordinamento: <strong style={{ color: '#00ffaa' }}>Dal più recente</strong></span>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#ff6f43] hover:bg-[#ff5722] text-[#111111] text-xs font-bold uppercase tracking-wider rounded-none flex items-center gap-2 transition-transform active:scale-95 shadow-sm"
                style={{ fontFamily: '"Switzer", sans-serif', fontWeight: 800 }}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Nuova Azienda</span>
              </button>
            </div>
          </div>

          {/* ── KPI METRICS CARDS (COLORI IDENTICI A DASHBOARD: NERO, BIANCO, MENTA, ARANCIO IN SWITZER) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            
            {/* Card 1: Aziende Totali (Nero puro #111111 con Arancione #ff6f43) */}
            <div
              className="p-3.5 flex flex-col justify-between shadow-sm"
              style={{ backgroundColor: '#111111', borderRadius: '4px' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: '#ff6f43', fontFamily: '"Switzer", sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
                  AZIENDE A DATABASE
                </span>
                <Building2 className="w-4 h-4 text-[#ff6f43]" />
              </div>
              <div className="mt-2 text-3xl font-black font-mono text-white leading-none">
                {stats.total}
              </div>
              <div className="mt-1 text-xs text-[#00e5ff]" style={{ fontFamily: '"Switzer", sans-serif', fontWeight: 500 }}>
                11 schede verificate nel CRM
              </div>
            </div>

            {/* Card 2: Volume Contratti (Verde Menta #00ffaa con testo nero) */}
            <div
              className="p-3.5 flex flex-col justify-between shadow-sm"
              style={{ backgroundColor: '#00ffaa', borderRadius: '4px' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: '#111111', fontFamily: '"Switzer", sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
                  VOLUME CONTRATTI
                </span>
                <DollarSign className="w-4 h-4 text-[#111111]" />
              </div>
              <div className="mt-2 text-3xl font-black font-mono text-[#111111] leading-none">
                {stats.totalRevenue}
              </div>
              <div className="mt-1 text-xs text-[#111111]/80 font-bold" style={{ fontFamily: '"Switzer", sans-serif' }}>
                {stats.fullyPaid} contratti già saldati
              </div>
            </div>

            {/* Card 3: Risoluzione Criticità (Nero #111111 con Blu Mare #00e5ff) */}
            <div
              className="p-3.5 flex flex-col justify-between shadow-sm"
              style={{ backgroundColor: '#111111', borderRadius: '4px' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: '#00e5ff', fontFamily: '"Switzer", sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
                  PROBLEMI RISOLTI
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#00e5ff]" />
              </div>
              <div className="mt-2 text-3xl font-black font-mono text-white leading-none">
                100%
              </div>
              <div className="mt-1 text-xs text-[#00e575]" style={{ fontFamily: '"Switzer", sans-serif', fontWeight: 500 }}>
                {stats.withResolvedIssues} criticità gestite con successo
              </div>
            </div>

            {/* Card 4: Formato Contratti (Bianco puro #ffffff con Arancione #ff6f43) */}
            <div
              className="p-3.5 flex flex-col justify-between shadow-sm"
              style={{ backgroundColor: '#ffffff', borderRadius: '4px' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: '#111111', fontFamily: '"Switzer", sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
                  FORMATO CONTRATTI
                </span>
                <FileText className="w-4 h-4 text-[#ff6f43]" />
              </div>
              <div className="mt-2 text-3xl font-black font-mono text-[#111111] leading-none">
                PDF Digitali
              </div>
              <div className="mt-1 text-xs text-[#ff6f43] font-bold" style={{ fontFamily: '"Switzer", sans-serif' }}>
                Firma elettronica qualificata / PEC
              </div>
            </div>

          </div>

          {/* ── BARRA DI RICERCA METALLIZZATA & MORBIDA (FULL WIDTH - ESTESA FINO A DESTRA) ── */}
          <div className="mb-6 w-full">
            <div
              className="relative flex items-center w-full px-5 py-3 transition-all duration-300 shadow-lg group"
              style={{
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
                border: '1px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              }}
            >
              {/* Icona di Ricerca in grigio ardesia scuro metallizzato */}
              <Search className="w-5 h-5 flex-shrink-0 text-slate-700 mr-3 stroke-[2.2]" />

              {/* Input a tutta larghezza con font morbido e leggibile */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca per azienda, referente, telefono, materiale, contratto, orario, pagamento..."
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-500 text-sm md:text-[15px] font-medium focus:outline-none tracking-normal"
                style={{ fontFamily: '"Jost", sans-serif' }}
              />

              {/* Elementi a destra: Reset Rapido e Conteggio */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-400/40 hover:bg-slate-400/70 text-slate-800 transition-colors text-xs font-bold"
                    title="Cancella testo"
                  >
                    ✕
                  </button>
                )}

                <span
                  className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold tracking-tight text-slate-800"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                    fontFamily: '"Space Mono", monospace',
                  }}
                >
                  {filteredCompanies.length} {filteredCompanies.length === 1 ? 'azienda' : 'aziende'}
                </span>
              </div>
            </div>
          </div>

          {/* ── FILTRI RAPIDI PER STATO RELAZIONE / PAGAMENTO (SENZA LINEE COLORATE) ── */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 text-xs">
            <span className="text-white/60 font-mono text-[11px] uppercase mr-1">Filtra stato:</span>
            {[
              { id: 'all', label: 'Tutti', emoji: '🏢' },
              { id: 'in_coda_pagamento', label: 'In coda pagamento', emoji: '⏳' },
              { id: 'in_attesa_risposta', label: 'In attesa risposta', emoji: '🔄' },
              { id: 'lavoro_concluso', label: 'Lavoro concluso', emoji: '✅' },
              { id: 'rifiutato', label: 'Rifiutato all\'ultimo', emoji: '❌' },
              { id: 'interrotto', label: 'Rapporto interrotto', emoji: '⛔' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterRelationship(f.id)}
                className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
                  filterRelationship === f.id
                    ? 'bg-white text-black border-white shadow'
                    : 'bg-black/40 text-white/70 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                <span>{f.emoji}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* ── FILTRI QUALIFICAZIONE LEAD B.A.N.T. ── */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 text-xs">
            <span className="text-white/60 font-mono text-[11px] uppercase mr-1">Qualifica B.A.N.T.:</span>
            {[
              { id: 'all', label: 'Tutte le schede', badge: companies.length },
              { id: 'complete', label: '🟢 B.A.N.T. Completo (4/4)', badge: companies.filter(c => getCompanyBant(c).isComplete).length },
              { id: 'incomplete', label: '⚠️ Con parametri mancanti', badge: companies.filter(c => !getCompanyBant(c).isComplete).length },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterBant(f.id)}
                className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
                  filterBant === f.id
                    ? 'bg-[#fac429] text-black border-[#fac429] shadow font-black'
                    : 'bg-black/40 text-white/70 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                <span>{f.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterBant === f.id ? 'bg-black/20 text-black font-black' : 'bg-white/10 text-white/80'}`}>
                  {f.badge}
                </span>
              </button>
            ))}
          </div>

          {/* ── LISTA SCHEDE AZIENDE: CARDS NERE #111111 CON BORDO BILIARDO ED ACCENTI VIVIDI ── */}
          {loading ? (
            <div className="py-16 text-center text-white/60 font-mono text-sm">
              Caricamento database aziende in corso...
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="py-16 text-center bg-[#111111] p-8 border border-black">
              <Building2 className="w-10 h-10 text-white/30 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white mb-1" style={{ fontFamily: '"Goldman", sans-serif' }}>
                Nessuna azienda trovata
              </h3>
              <p className="text-white/50 text-xs" style={{ fontFamily: '"Jost", sans-serif' }}>
                Nessun risultato corrisponde ai filtri selezionati.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 pb-8">
              {filteredCompanies.map((comp, idx) => {
                const isExpanded = expandedId === comp.id
                const compDate = comp.workSchedule?.recentDate || comp.lastContact?.split('T')[0]
                const relStatus = getCompanyRelationshipStatus(comp)
                const bant = getCompanyBant(comp)
                const contactEmail = comp.contact?.directEmail || comp.contact?.email
                const contactPhone = comp.contact?.mobile || comp.contact?.phone

                return (
                  <div
                    key={comp.id}
                    className="p-4 md:p-5 shadow-sm transition-all text-white relative overflow-hidden"
                    style={{
                      backgroundColor: '#111111',
                      borderRadius: '4px',
                      border: isExpanded ? '1px solid #00e5ff' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {/* (Linea colorata superiore rimossa definitivamente su richiesta utente) */}

                    {/* ── RIGA TESTATA CARD AZIENDA ── */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mt-1">
                      
                      {/* Nome Azienda, Settore, Referente, Date e Valutazione */}
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 bg-white/10 flex items-center justify-center flex-shrink-0 text-base font-bold text-[#00ffaa]"
                          style={{ fontFamily: '"Space Mono", monospace' }}
                        >
                          {idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h2
                              className="text-lg md:text-xl font-bold text-white tracking-tight"
                              style={{ fontFamily: '"Goldman", sans-serif' }}
                            >
                              {comp.name}
                            </h2>
                            <BantLogoMark size="sm" bant={bant} />

                            {/* Badge Stato Qualificazione B.A.N.T. */}
                            {bant.isComplete ? (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-bold font-mono text-[#c084fc]"
                                title="Tutti i 4 parametri B.A.N.T. sono stati identificati con successo"
                              >
                                <span>🟢</span>
                                <span>4/4 Qualificato</span>
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/50"
                                title={`Attenzione: mancano ${bant.missingList.length} parametri B.A.N.T.: ${bant.missingLabel}`}
                              >
                                <span>⚠️</span>
                                <span>{bant.score}/4 • Manca {bant.missingLabel}</span>
                              </span>
                            )}
                            <span
                              className="px-2 py-0.5 bg-white/10 text-white/90 text-[11px] font-semibold"
                              style={{ fontFamily: '"Space Mono", monospace' }}
                            >
                              {comp.industry}
                            </span>

                            {/* Badge Stato Relazione & Pagamento (Emoticon + 2 parole chiare) */}
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${
                                relStatus.key === 'lavoro_concluso' ? 'px-0 py-0' : 'px-2.5 py-0.5 rounded'
                              }`}
                              style={{
                                backgroundColor: relStatus.bg,
                                color: relStatus.color,
                                border: relStatus.border === 'transparent' ? 'none' : `1px solid ${relStatus.border}`,
                                fontFamily: '"Space Mono", monospace',
                              }}
                              title={`Stato attuale: ${relStatus.label}`}
                            >
                              <span>{relStatus.emoji}</span>
                              <span>{relStatus.label}</span>
                            </span>
                          </div>

                          {/* Referente con recapiti Email e Telefono ed icona di Copia Automatica */}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs" style={{ fontFamily: '"Jost", sans-serif' }}>
                            <div className="flex items-center gap-1.5 text-white/90 font-medium bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              <User className="w-3.5 h-3.5 text-[#00e5ff] flex-shrink-0" />
                              <span className="font-bold text-white">{comp.contactPerson?.name || 'Referente non indicato'}</span>
                              {comp.contactPerson?.role && (
                                <span className="text-white/40 text-[11px] hidden sm:inline">• {comp.contactPerson.role}</span>
                              )}
                            </div>

                            {/* Email con Copia Automatica */}
                            {contactEmail && (
                              <button
                                type="button"
                                onClick={(e) => handleCopy(contactEmail, `${comp.id}-email`, e)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-all border cursor-pointer select-none ${
                                  copiedField === `${comp.id}-email`
                                    ? 'bg-[#00ffaa]/25 text-[#00ffaa] border-[#00ffaa]'
                                    : 'bg-white/10 text-white/80 hover:bg-[#00ffaa]/20 hover:text-[#00ffaa] border-white/15'
                                }`}
                                title={`Clicca per copiare l'email: ${contactEmail}`}
                              >
                                {copiedField === `${comp.id}-email` ? (
                                  <>
                                    <Check className="w-3 h-3 text-[#00ffaa]" />
                                    <span className="font-bold">Email Copiata!</span>
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-3.5 h-3.5 text-[#00ffaa]" />
                                    <span className="truncate max-w-[170px] hidden md:inline">{contactEmail}</span>
                                    <span className="text-[9px] opacity-60 ml-0.5">📋</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* Telefono con Copia Automatica */}
                            {contactPhone && (
                              <button
                                type="button"
                                onClick={(e) => handleCopy(contactPhone, `${comp.id}-phone`, e)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-all border cursor-pointer select-none ${
                                  copiedField === `${comp.id}-phone`
                                    ? 'bg-[#00e5ff]/25 text-[#00e5ff] border-[#00e5ff]'
                                    : 'bg-white/10 text-white/80 hover:bg-[#00e5ff]/20 hover:text-[#00e5ff] border-white/15'
                                }`}
                                title={`Clicca per copiare il telefono: ${contactPhone}`}
                              >
                                {copiedField === `${comp.id}-phone` ? (
                                  <>
                                    <Check className="w-3 h-3 text-[#00e5ff]" />
                                    <span className="font-bold">Tel Copiato!</span>
                                  </>
                                ) : (
                                  <>
                                    <Phone className="w-3.5 h-3.5 text-[#00e5ff]" />
                                    <span className="hidden md:inline">{contactPhone}</span>
                                    <span className="text-[9px] opacity-60 ml-0.5">📋</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Data lavoro, orario e stelle feedback */}
                          <div className="flex items-center gap-2.5 mt-1.5 text-xs text-white/70 flex-wrap" style={{ fontFamily: '"Jost", sans-serif' }}>
                            <span className="flex items-center gap-1.5 text-white/90 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-[#00e5ff]" />
                              {comp.workSchedule?.datesFormatted || compDate}
                            </span>
                            <span>•</span>
                            <span
                              className="text-[11px] font-bold text-[#c084fc]"
                              style={{ fontFamily: '"Space Mono", monospace' }}
                            >
                              ⏱️ {comp.workSchedule?.scheduleType}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-amber-300 font-bold" style={{ fontFamily: '"Space Mono", monospace' }}>
                              <Star className="w-3.5 h-3.5 fill-amber-300" />
                              {comp.feedback?.rating ? comp.feedback.rating.toFixed(1) : '5.0'} / 5.0
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Retribuzione e Pulsante Dettagli */}
                      <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-2 lg:pt-0 border-white/10">
                        <div className="text-left lg:text-right">
                          <div
                            className="text-[10px] uppercase text-white/50 tracking-wider"
                            style={{ fontFamily: '"Space Mono", monospace' }}
                          >
                            RETRIBUZIONE
                          </div>
                          <div
                            className="text-2xl font-black leading-none mt-0.5"
                            style={{ fontFamily: '"Space Mono", monospace', color: '#00ffaa' }}
                          >
                            € {(comp.compensation?.amount || 0).toLocaleString('it-IT')}
                          </div>
                          <div className="mt-1">
                            <span
                              className={`text-[9.5px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                                comp.compensation?.status === 'Saldato'
                                  ? 'bg-[#007a50] text-white'
                                  : 'bg-[#ff6f43] text-black font-extrabold'
                              }`}
                              style={{ fontFamily: '"Space Mono", monospace' }}
                            >
                              {comp.compensation?.status}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : comp.id)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          style={{ fontFamily: '"Goldman", sans-serif' }}
                        >
                          <span>{isExpanded ? 'CHIUDI' : 'DETTAGLI'}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                    </div>

                    {/* ── SINTESI COLLASSATA: B.A.N.T., CONTRATTO & CRITICITÀ ── */}
                    {!isExpanded && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
                        {/* 4 Parametri B.A.N.T. compatti */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {/* B */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded shadow-sm transition-all ${
                            bant.hasB
                              ? 'bg-black/60 border border-[#53ba75]/40'
                              : 'bg-amber-950/30 border-2 border-dashed border-amber-400/90 text-amber-200'
                          }`}>
                            <span className={`font-black font-mono text-[11px] ${bant.hasB ? 'text-[#53ba75]' : 'text-amber-400'}`}>B:</span>
                            <span className={`font-mono text-xs truncate ${bant.hasB ? 'text-white font-bold' : 'text-amber-300 font-bold'}`}>
                              {bant.hasB ? bant.budget : '⚠️ Manca Budget'}
                            </span>
                          </div>

                          {/* A */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded shadow-sm transition-all ${
                            bant.hasA
                              ? 'bg-black/60 border border-[#ea3824]/40'
                              : 'bg-amber-950/30 border-2 border-dashed border-amber-400/90 text-amber-200'
                          }`}>
                            <span className={`font-black font-mono text-[11px] ${bant.hasA ? 'text-[#ea3824]' : 'text-amber-400'}`}>A:</span>
                            <span className={`text-xs truncate ${bant.hasA ? 'text-white' : 'text-amber-300 font-bold'}`} title={bant.authority}>
                              {bant.hasA ? bant.authority : '⚠️ Referente ignoto'}
                            </span>
                          </div>

                          {/* N */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded shadow-sm transition-all ${
                            bant.hasN
                              ? 'bg-black/60 border border-[#1bb7ed]/40'
                              : 'bg-amber-950/30 border-2 border-dashed border-amber-400/90 text-amber-200'
                          }`}>
                            <span className={`font-black font-mono text-[11px] ${bant.hasN ? 'text-[#1bb7ed]' : 'text-amber-400'}`}>N:</span>
                            <span className={`text-xs truncate ${bant.hasN ? 'text-white' : 'text-amber-300 font-bold'}`} title={bant.need}>
                              {bant.hasN ? bant.need : '⚠️ Esigenza da definire'}
                            </span>
                          </div>

                          {/* T */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded shadow-sm transition-all ${
                            bant.hasT
                              ? 'bg-black/60 border border-[#fac429]/40'
                              : 'bg-amber-950/30 border-2 border-dashed border-amber-400/90 text-amber-200'
                          }`}>
                            <span className={`font-black font-mono text-[11px] ${bant.hasT ? 'text-[#fac429]' : 'text-amber-400'}`}>T:</span>
                            <span className={`font-mono text-xs truncate ${bant.hasT ? 'text-white font-bold' : 'text-amber-300 font-bold'}`}>
                              {bant.hasT ? bant.timeline : '⚠️ Scadenza da concordare'}
                            </span>
                          </div>
                        </div>

                        {/* Contratto & Criticità */}
                        <div
                          className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-white/80 pt-1"
                          style={{ fontFamily: '"Jost", sans-serif', fontSize: '14px' }}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-[#ff6f43] flex-shrink-0" />
                            <span className="truncate font-mono text-xs"><strong>Contratto:</strong> {comp.contract?.fileName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00ffaa] flex-shrink-0" />
                            <span className="truncate"><strong>Criticità gestita:</strong> {comp.issues?.isResolved === 'Risolto' ? comp.issues?.description : 'Nessuna criticità'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── DETTAGLI COMPLETI ESPANSI (FONT JOST & SPACE MONO) ── */}
                    {isExpanded && (
                      <div className="mt-5 pt-4 border-t border-white/15 flex flex-col gap-4 animate-in fade-in duration-150">
                        
                        {/* Riquadro Dettagli Qualificazione B.A.N.T. */}
                        <div className={`p-4 rounded-lg shadow-inner ${
                          bant.isComplete
                            ? 'bg-black/60 border border-white/10'
                            : 'bg-amber-950/15 border-2 border-dashed border-amber-500/50'
                        }`}>
                          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 flex-wrap gap-2">
                            <div className="flex items-center gap-2.5">
                              <BantLogoMark size="md" bant={bant} />
                              <span className="text-xs font-bold uppercase tracking-wider text-white" style={{ fontFamily: '"Goldman", sans-serif' }}>
                                Qualificazione Commerciale B.A.N.T.
                              </span>
                            </div>
                            {bant.isComplete ? (
                              <span className="text-[11px] font-mono text-[#c084fc] font-bold">
                                🟢 4/4 Parametri Rilevati • Lead Qualificato
                              </span>
                            ) : (
                              <span className="text-[11px] font-mono text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded border border-amber-500/50 font-bold animate-pulse">
                                ⚠️ {4 - bant.score} Parametri Mancanti • Richiede Follow-up Commerciale
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            {/* Budget */}
                            <div className={`p-3 rounded flex flex-col justify-between transition-all ${
                              bant.hasB
                                ? 'bg-[#161616] border-l-4 border-[#53ba75]'
                                : 'bg-amber-950/30 border-2 border-dashed border-amber-400/90'
                            }`}>
                              <div>
                                <div className={`text-[11px] font-bold uppercase font-mono tracking-wider flex items-center justify-between ${
                                  bant.hasB ? 'text-[#53ba75]' : 'text-amber-400'
                                }`}>
                                  <span>B • Budget</span>
                                  {!bant.hasB && <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded">DA CHIARIRE</span>}
                                </div>
                                <div className={`font-mono text-base mt-1.5 ${
                                  bant.hasB ? 'text-white font-black' : 'text-amber-300 font-bold'
                                }`}>
                                  {bant.hasB ? bant.budget : '⚠️ Non specificato'}
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-white/5 text-[10.5px]">
                                {bant.hasB ? (
                                  <span className="text-white/40">Capacità di spesa allocata</span>
                                ) : (
                                  <span className="text-amber-200/90 font-medium">
                                    💡 <em>Da chiedere in 1ª call:</em> "Avete già stanziato un budget indicativo per questo intervento?"
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Authority */}
                            <div className={`p-3 rounded flex flex-col justify-between transition-all ${
                              bant.hasA
                                ? 'bg-[#161616] border-l-4 border-[#ea3824]'
                                : 'bg-amber-950/30 border-2 border-dashed border-amber-400/90'
                            }`}>
                              <div>
                                <div className={`text-[11px] font-bold uppercase font-mono tracking-wider flex items-center justify-between ${
                                  bant.hasA ? 'text-[#ea3824]' : 'text-amber-400'
                                }`}>
                                  <span>A • Authority</span>
                                  {!bant.hasA && <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded">DA INDIVIDUARE</span>}
                                </div>
                                <div className={`text-sm mt-1.5 truncate ${
                                  bant.hasA ? 'text-white font-bold' : 'text-amber-300 font-bold'
                                }`} title={bant.authority}>
                                  {bant.hasA ? bant.authority : '⚠️ Referente decisionale assente'}
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-white/5 text-[10.5px]">
                                {bant.hasA ? (
                                  <span className="text-white/40">Referente con potere di firma</span>
                                ) : (
                                  <span className="text-amber-200/90 font-medium">
                                    💡 <em>Da verificare:</em> "Chi approva la spesa e siglerà il contratto oltre al contatto attuale?"
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Need */}
                            <div className={`p-3 rounded flex flex-col justify-between transition-all ${
                              bant.hasN
                                ? 'bg-[#161616] border-l-4 border-[#1bb7ed]'
                                : 'bg-amber-950/30 border-2 border-dashed border-amber-400/90'
                            }`}>
                              <div>
                                <div className={`text-[11px] font-bold uppercase font-mono tracking-wider flex items-center justify-between ${
                                  bant.hasN ? 'text-[#1bb7ed]' : 'text-amber-400'
                                }`}>
                                  <span>N • Need</span>
                                  {!bant.hasN && <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded">DA DEFINIRE</span>}
                                </div>
                                <div className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                                  bant.hasN ? 'text-white' : 'text-amber-300 font-bold'
                                }`} title={bant.need}>
                                  {bant.hasN ? bant.need : '⚠️ Esigenza o problema non delineato'}
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-white/5 text-[10.5px]">
                                {bant.hasN ? (
                                  <span className="text-white/40">Esigenza operativa e tecnica</span>
                                ) : (
                                  <span className="text-amber-200/90 font-medium">
                                    💡 <em>Da approfondire:</em> "Qual è la sfida principale o il risultato atteso da ottenere subito?"
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className={`p-3 rounded flex flex-col justify-between transition-all ${
                              bant.hasT
                                ? 'bg-[#161616] border-l-4 border-[#fac429]'
                                : 'bg-amber-950/30 border-2 border-dashed border-amber-400/90'
                            }`}>
                              <div>
                                <div className={`text-[11px] font-bold uppercase font-mono tracking-wider flex items-center justify-between ${
                                  bant.hasT ? 'text-[#fac429]' : 'text-amber-400'
                                }`}>
                                  <span>T • Timeline</span>
                                  {!bant.hasT && <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded">DA FISSARE</span>}
                                </div>
                                <div className={`text-xs mt-1.5 font-mono ${
                                  bant.hasT ? 'text-white font-bold' : 'text-amber-300 font-bold'
                                }`}>
                                  {bant.hasT ? bant.timeline : '⚠️ Nessuna tempistica o data concordata'}
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-white/5 text-[10.5px]">
                                {bant.hasT ? (
                                  <span className="text-white/40">Finestra temporale attesa</span>
                                ) : (
                                  <span className="text-amber-200/90 font-medium">
                                    💡 <em>Da concordare:</em> "Qual è la deadline ideale entro cui dovremmo consegnare o avviare?"
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2 Colonne */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                          {/* COLONNA 1: REFERENTE, STORICO E ORARI */}
                          <div className="flex flex-col gap-3">
                            
                            {/* Referente & Contatti */}
                            <div className="bg-[#1c1c1c] p-3.5 border border-white/10">
                              <div
                                className="flex items-center gap-2 text-xs font-bold uppercase text-[#00e5ff] mb-2"
                                style={{ fontFamily: '"Goldman", sans-serif' }}
                              >
                                <User className="w-4 h-4" />
                                <span>REFERENTE & RECAPITI</span>
                              </div>
                              <div className="text-base font-bold text-white" style={{ fontFamily: '"Jost", sans-serif' }}>
                                {comp.contactPerson?.name}
                              </div>
                              <div className="text-xs text-white/60 mb-2.5" style={{ fontFamily: '"Jost", sans-serif' }}>
                                {comp.contactPerson?.role}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" style={{ fontFamily: '"Space Mono", monospace' }}>
                                <a
                                  href={`mailto:${comp.contact?.directEmail || comp.contact?.email}`}
                                  className="px-2 py-1.5 bg-black/60 hover:bg-black text-white/90 flex items-center gap-1.5 transition-colors"
                                >
                                  <Mail className="w-3.5 h-3.5 text-[#00ffaa]" />
                                  <span className="truncate">{comp.contact?.directEmail || comp.contact?.email}</span>
                                </a>
                                <a
                                  href={`tel:${comp.contact?.mobile || comp.contact?.phone}`}
                                  className="px-2 py-1.5 bg-black/60 hover:bg-black text-white/90 flex items-center gap-1.5 transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5 text-[#00e5ff]" />
                                  <span>{comp.contact?.mobile || comp.contact?.phone}</span>
                                </a>
                              </div>
                            </div>

                            {/* Storico 1° Contatto */}
                            <div className="bg-[#1c1c1c] p-3.5 border border-white/10">
                              <div
                                className="flex items-center gap-2 text-xs font-bold uppercase text-amber-300 mb-1.5"
                                style={{ fontFamily: '"Goldman", sans-serif' }}
                              >
                                <Calendar className="w-4 h-4" />
                                <span>STORICO 1° CONTATTO</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs mb-1.5" style={{ fontFamily: '"Space Mono", monospace' }}>
                                <span className="px-1.5 py-0.5 bg-black text-white text-[11px] font-bold">
                                  {comp.firstContact?.date}
                                </span>
                                <span>via</span>
                                <span className="text-[#00e5ff] font-bold">{comp.firstContact?.channel}</span>
                              </div>
                              <p className="text-xs text-white/80 leading-relaxed" style={{ fontFamily: '"Jost", sans-serif', fontSize: '14.5px' }}>
                                {comp.firstContact?.notes}
                              </p>
                            </div>

                            {/* Programmazione Giorni di Lavoro */}
                            <div className="bg-[#1c1c1c] p-3.5 border border-white/10">
                              <div
                                className="flex items-center gap-2 text-xs font-bold uppercase text-[#00ffaa] mb-1.5"
                                style={{ fontFamily: '"Goldman", sans-serif' }}
                              >
                                <Clock className="w-4 h-4" />
                                <span>PROGRAMMAZIONE GIORNI DI LAVORO</span>
                              </div>
                              <div className="text-sm font-bold text-white mb-0.5" style={{ fontFamily: '"Jost", sans-serif' }}>
                                {comp.workSchedule?.datesFormatted}
                              </div>
                              <div className="text-xs text-[#00ffaa] mb-2 font-bold" style={{ fontFamily: '"Space Mono", monospace' }}>
                                Tipologia: {comp.workSchedule?.scheduleType}
                              </div>
                              <div className="text-xs text-white/80 bg-black/60 p-2 border border-white/5" style={{ fontFamily: '"Space Mono", monospace' }}>
                                ⏱️ Orari: {comp.workSchedule?.hours}
                                {comp.workSchedule?.location && (
                                  <div className="mt-1 text-white/60">📍 Location: {comp.workSchedule?.location}</div>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* COLONNA 2: MATERIALE, CONTRATTO, RETRIBUZIONE */}
                          <div className="flex flex-col gap-3">
                            
                            {/* Materiale & Deliverables Richiesti */}
                            <div className="bg-[#1c1c1c] p-3.5 border border-white/10">
                              <div
                                className="flex items-center gap-2 text-xs font-bold uppercase text-[#ff6f43] mb-2"
                                style={{ fontFamily: '"Goldman", sans-serif' }}
                              >
                                <Camera className="w-4 h-4" />
                                <span>MATERIALE & OUTPUT RICHIESTI</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {comp.requestedMaterials?.map((item, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 bg-black/70 border border-white/15 text-white/90 text-xs font-medium"
                                    style={{ fontFamily: '"Jost", sans-serif', fontSize: '13.5px' }}
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Contratto Formato Digitale */}
                            <div className="bg-[#1c1c1c] p-3.5 border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <div
                                  className="flex items-center gap-2 text-xs font-bold uppercase text-white"
                                  style={{ fontFamily: '"Goldman", sans-serif' }}
                                >
                                  <FileText className="w-4 h-4 text-[#00ffaa]" />
                                  <span>CONTRATTO FORMATO DIGITALE</span>
                                </div>
                                <span
                                  className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#007a50] text-white"
                                  style={{ fontFamily: '"Space Mono", monospace' }}
                                >
                                  {comp.contract?.status}
                                </span>
                              </div>

                              <div className="flex items-center justify-between bg-black/60 p-2 border border-white/10 mb-2">
                                <div className="flex items-center gap-2 text-xs text-white" style={{ fontFamily: '"Space Mono", monospace' }}>
                                  <Download className="w-3.5 h-3.5 text-[#00e5ff]" />
                                  <span className="font-bold">{comp.contract?.fileName}</span>
                                </div>
                                <span className="text-[10px] text-white/50" style={{ fontFamily: '"Space Mono", monospace' }}>{comp.contract?.code}</span>
                              </div>

                              <div className="text-xs text-white/70 leading-relaxed" style={{ fontFamily: '"Jost", sans-serif', fontSize: '14px' }}>
                                <strong className="text-white">Termini:</strong> {comp.contract?.terms}
                              </div>
                              <div className="text-[10px] text-white/50 mt-1" style={{ fontFamily: '"Space Mono", monospace' }}>
                                Formato: {comp.contract?.digitalFormat} (Firmato il {comp.contract?.signedDate})
                              </div>
                            </div>

                            {/* Retribuzione e Dettagli Finanziari */}
                            <div className="bg-[#1c1c1c] p-3.5 border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase text-[#00ffaa]" style={{ fontFamily: '"Goldman", sans-serif' }}>
                                  DETTAGLIO RETRIBUZIONE
                                </span>
                                <span className="text-xs text-white/60" style={{ fontFamily: '"Space Mono", monospace' }}>
                                  {comp.compensation?.paymentMethod}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center" style={{ fontFamily: '"Space Mono", monospace' }}>
                                <div className="bg-black/60 p-2 border border-white/5">
                                  <div className="text-[10px] text-white/50 uppercase">Totale</div>
                                  <div className="text-sm font-black text-white">€ {comp.compensation?.amount?.toLocaleString()}</div>
                                </div>
                                <div className="bg-black/60 p-2 border border-white/5">
                                  <div className="text-[10px] text-[#00ffaa] uppercase">Acconto</div>
                                  <div className="text-sm font-black text-[#00ffaa]">€ {comp.compensation?.deposit?.toLocaleString()}</div>
                                </div>
                                <div className="bg-black/60 p-2 border border-white/5">
                                  <div className="text-[10px] text-[#ff6f43] uppercase">Saldo</div>
                                  <div className="text-sm font-black text-[#ff6f43]">€ {comp.compensation?.balance?.toLocaleString()}</div>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* RIGA INFERIORE: FEEDBACK PERSONALE & CRITICITÀ RISOLTE */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-1">
                          
                          {/* Feedback Personale */}
                          <div className="bg-[#007a50]/20 border border-[#00ffaa]/40 p-3.5">
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="text-xs font-bold uppercase text-[#00ffaa] flex items-center gap-1.5"
                                style={{ fontFamily: '"Goldman", sans-serif' }}
                              >
                                <Star className="w-3.5 h-3.5 fill-[#00ffaa]" />
                                FEEDBACK PERSONALE SULLA COLLABORAZIONE
                              </span>
                              <span className="text-xs font-bold text-amber-300" style={{ fontFamily: '"Space Mono", monospace' }}>
                                ★ {comp.feedback?.rating} / 5.0
                              </span>
                            </div>
                            <p className="text-xs text-white/90 italic leading-relaxed" style={{ fontFamily: '"Jost", sans-serif', fontSize: '15px' }}>
                              "{comp.feedback?.notes}"
                            </p>
                          </div>

                          {/* Problemi Presentati & Risoluzione */}
                          <div className="bg-[#ff6f43]/15 border border-[#ff6f43]/40 p-3.5">
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="text-xs font-bold uppercase text-[#ff6f43] flex items-center gap-1.5"
                                style={{ fontFamily: '"Goldman", sans-serif' }}
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                PROBLEMA PRESENTATO & SOLUZIONE
                              </span>
                              <span
                                className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#007a50] text-white"
                                style={{ fontFamily: '"Space Mono", monospace' }}
                              >
                                ✓ {comp.issues?.isResolved}
                              </span>
                            </div>
                            <div className="text-xs text-white/90 mb-1.5" style={{ fontFamily: '"Jost", sans-serif', fontSize: '14.5px' }}>
                              <strong>Criticità emersa:</strong> {comp.issues?.description}
                            </div>
                            <div
                              className="text-xs text-emerald-200 bg-black/60 p-2.5 border border-emerald-500/30 leading-relaxed"
                              style={{ fontFamily: '"Jost", sans-serif', fontSize: '14.5px' }}
                            >
                              <strong>Come è stato risolto:</strong> {comp.issues?.resolution}
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

        {/* ── Banda Bianca Inferiore ── */}
        <div className="w-full flex justify-end flex-shrink-0 mt-auto">
          <div className="bg-white rounded-tl-2xl w-[calc(100%-2.5rem)]" style={{ height: 'calc(3rem - 0.5cm)' }} />
        </div>

      </div>

      {/* ── MODAL AGGIUNGI NUOVA SCHEDA AZIENDA ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-[#111111] border-2 border-black p-6 max-w-2xl w-full my-8 text-left shadow-2xl relative"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-3">
              <h3
                className="text-xl font-bold text-white flex items-center gap-2"
                style={{ fontFamily: '"Goldman", sans-serif' }}
              >
                <Plus className="w-5 h-5 text-[#00ffaa]" />
                Nuova Scheda Azienda & Collaborazione
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/50 hover:text-white text-lg p-1"
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
              className="flex flex-col gap-3.5 text-xs text-white"
              style={{ fontFamily: '"Jost", sans-serif' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Nome Azienda *</label>
                  <input name="name" required placeholder="Es. Omega Fashion Milano" className="w-full bg-[#1c1c1c] border border-white/20 p-2 text-white" />
                </div>
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Settore</label>
                  <input name="industry" placeholder="Es. Moda & ADV" className="w-full bg-[#1c1c1c] border border-white/20 p-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Referente e Ruolo</label>
                  <input name="contactPerson" placeholder="Es. Laura Neri (Art Buyer)" className="w-full bg-[#1c1c1c] border border-white/20 p-2 text-white" />
                </div>
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Email e Telefono</label>
                  <input name="email" placeholder="email@azienda.it | +39 333 1234567" className="w-full bg-[#1c1c1c] border border-white/20 p-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Tipologia Orario</label>
                  <select name="scheduleType" className="w-full bg-[#1c1c1c] border border-white/20 p-2 text-white">
                    <option value="Un giorno intero">Un giorno intero</option>
                    <option value="Un pomeriggio">Un pomeriggio</option>
                    <option value="2/3 ore la mattina">2/3 ore la mattina</option>
                    <option value="2/3 ore la sera">2/3 ore la sera</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Date Lavoro</label>
                  <input name="workDates" placeholder="Es. 28 Settembre 2026" className="w-full bg-[#1c1c1c] border border-white/20 p-2 text-white" />
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-bold">Materiale Richiesto</label>
                <input name="materials" placeholder="Es. Sony FX3, Aputure 600d, Drone Mavic 3, CFexpress" className="w-full bg-[#1c1c1c] border border-white/20 p-2 text-white" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Compenso Totale (€)</label>
                  <input name="amount" type="number" placeholder="5000" className="w-full bg-[#1c1c1c] border border-white/20 p-2 text-white" />
                </div>
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Acconto Versato (€)</label>
                  <input name="deposit" type="number" placeholder="2500" className="w-full bg-[#1c1c1c] border border-white/20 p-2 text-white" />
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-bold">Feedback Personale</label>
                <textarea name="feedbackNotes" rows="2" placeholder="Es. Ottima intesa sul set, consegna puntuale..." className="w-full bg-[#1c1c1c] border border-white/20 p-2 text-white resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Criticità Emersa</label>
                  <input name="issueDescription" placeholder="Es. Vento forte al mattino..." className="w-full bg-[#1c1c1c] border border-white/20 p-2 text-white" />
                </div>
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Come Risolto</label>
                  <input name="issueResolution" placeholder="Es. Spostate le riprese al pomeriggio..." className="w-full bg-[#1c1c1c] border border-white/20 p-2 text-white" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ff6f43] hover:bg-[#ff5722] text-black font-bold uppercase tracking-wider"
                  style={{ fontFamily: '"Goldman", sans-serif' }}
                >
                  Salva nel Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
