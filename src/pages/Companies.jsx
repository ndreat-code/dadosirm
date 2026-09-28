import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
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
  ArrowUpDown,
  Plus,
  ChevronDown,
  ChevronUp,
  Download,
  Camera,
  Check,
  Sparkles,
  Zap,
  Lock,
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

  if (ch.includes('referral') || name.includes('nextmedia') || name.includes('alpha')) {
    return {
      channel: 'Referral & Passaparola',
      shortChannel: 'REFERRAL',
      type: 'Caldissimo / Fiducia',
      reason: 'Collaborazione continuativa da agenzie di comunicazione o partner (es. NextMedia).',
      assetRequired: 'Portfolio lavori simili, condizioni quadro B2B.',
      score: '5/5',
      color: '#d97706'
    }
  }
  if (ch.includes('instagram') || ch.includes('tiktok') || ch.includes('adv') || name.includes('gusto') || name.includes('poggio')) {
    return {
      channel: 'Instagram / TikTok ADV & DM',
      shortChannel: 'ADV & DM',
      type: 'Moderato / Visual',
      reason: 'Richiesta noleggio Limbo Studio Milano, video clip o reel social di tendenza.',
      assetRequired: 'Scheda tecnica Limbo A, prezzi mezze giornate.',
      score: '4/5',
      color: '#db2777'
    }
  }
  if (ch.includes('outreach') || ch.includes('cold') || name.includes('urban') || name.includes('nexura')) {
    return {
      channel: 'Outreach B2B / Cold Email',
      shortChannel: 'B2B OUTREACH',
      type: 'Proattivo / Freddo',
      reason: 'Proposta servizi video corporate e riprese con drone per aziende manifatturiere.',
      assetRequired: 'Case study di settore (es. Officine Riva).',
      score: '3/5',
      color: '#0284c7'
    }
  }
  if (ch.includes('fiera') || ch.includes('event') || name.includes('vogue') || name.includes('riva')) {
    return {
      channel: 'Eventi / Fiere di Settore',
      shortChannel: 'FIERE & EVENTI',
      type: 'Relazionale',
      reason: 'Contatto diretto con direttori marketing / responsabili comunicazione.',
      assetRequired: 'Presentazione aziendale PDF, contatto referente.',
      score: '4/5',
      color: '#ca8a04'
    }
  }
  return {
    channel: 'Sito Web (Form Inbound)',
    shortChannel: 'INBOUND WEB',
    type: 'Caldo / Inbound Diretto',
    reason: 'Richiesta preventivo spot corporate, video industriale o shooting moda.',
    assetRequired: 'Showreel, listino indicativo, disponibilità date.',
    score: '5/5',
    color: '#059669'
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
      className="inline-flex items-center gap-1 select-none px-2 py-0.5 rounded-md bg-white border border-sky-200/80 shadow-xs shrink-0"
      style={{ fontFamily: '"Switzer", sans-serif' }}
      title={`Framework B.A.N.T. ${bant ? `(${bant.score}/4 completati${bant.missingList?.length ? ' - Manca: ' + bant.missingLabel : ''})` : ''}`}
    >
      {/* B • Budget */}
      <span
        className={`font-black ${isSm ? 'text-[11px]' : 'text-[13px]'} ${hasB ? 'text-[#16a34a]' : 'text-slate-300'}`}
      >
        B
      </span>
      <span className="text-slate-300 text-[10px] font-bold">·</span>
      {/* A • Authority */}
      <span
        className={`font-black ${isSm ? 'text-[11px]' : 'text-[13px]'} ${hasA ? 'text-[#dc2626]' : 'text-slate-300'}`}
      >
        A
      </span>
      <span className="text-slate-300 text-[10px] font-bold">·</span>
      {/* N • Need */}
      <span
        className={`font-black ${isSm ? 'text-[11px]' : 'text-[13px]'} ${hasN ? 'text-[#0284c7]' : 'text-slate-300'}`}
      >
        N
      </span>
      <span className="text-slate-300 text-[10px] font-bold">·</span>
      {/* T • Timeline */}
      <span
        className={`font-black ${isSm ? 'text-[11px]' : 'text-[13px]'} ${hasT ? 'text-[#d97706]' : 'text-slate-300'}`}
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

// ── Funzione di ordinamento lavori imminenti (in primo piano) ──
function getImminenceScore(comp) {
  const scheduleText = `${comp.workSchedule?.datesFormatted || ''} ${comp.workSchedule?.scheduleType || ''}`.toLowerCase()
  let urgencyBonus = 0
  if (scheduleText.includes('entro 1 settimana') || scheduleText.includes('imminente') || scheduleText.includes('oggi') || scheduleText.includes('urgente')) {
    urgencyBonus += 40000
  }
  if (comp.relationshipStatus === 'in_attesa_risposta' || comp.status === 'In trattativa') {
    urgencyBonus += 20000
  }

  const rawDate = comp.workSchedule?.recentDate || comp.lastContact?.split('T')[0] || comp.firstContact?.date
  if (!rawDate) return urgencyBonus

  const d = new Date(rawDate)
  if (isNaN(d.getTime())) return urgencyBonus

  // Data di riferimento attuale (fine settembre 2026 nel dataset)
  const now = new Date('2026-09-28T00:00:00Z').getTime()
  const diffDays = Math.round((d.getTime() - now) / (1000 * 60 * 60 * 24))

  // Se la data è oggi o futura (diffDays >= 0), prioritizza i più vicini
  if (diffDays >= 0) {
    return 100000 - (diffDays * 50) + urgencyBonus
  }
  // Se la data è passata recente (es. -1, -3 giorni), precede i lavori di mesi fa
  return 10000 + diffDays + urgencyBonus
}

export default function Companies() {
  const { isDipendente } = useAuth()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRelationship, setFilterRelationship] = useState('all')
  const [filterBant, setFilterBant] = useState('all')
  const [sortBy, setSortBy] = useState('imminent') // 'imminent' (default), 'recent', 'compensation_desc', 'rating_desc'
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

    // Ordinamento: per impostazione predefinita i lavori imminenti appaiono per primi
    list.sort((a, b) => {
      if (sortBy === 'imminent') {
        return getImminenceScore(b) - getImminenceScore(a)
      }
      if (sortBy === 'recent') {
        const dateA = new Date(a.workSchedule?.recentDate || a.lastContact || 0)
        const dateB = new Date(b.workSchedule?.recentDate || b.lastContact || 0)
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
        backgroundColor: '#eaf4fb',
        fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* ── CANVAS AZZURRO TENUE COME LA "O" DI DADO (SENZA NERO E SENZA VERDE BILIARDO) ── */}
      <div
        className="h-full flex-1 rounded-tl-[36px] rounded-bl-[36px] flex flex-col justify-between relative min-w-0 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #f0f8fd 0%, #e5f3fa 100%)',
          borderLeft: '1.5px solid #d4ebf9',
        }}
      >
        {/* ── AREA PRINCIPALE: CONTENUTO IMMEDIATO SENZA TITOLONE IN ALTO PER MASSIMA VISIBILITÀ ── */}
        <div className="flex-1 min-h-0 px-4 md:px-7 py-3 overflow-y-auto">

          {/* ── TOOLBAR COMPATTA SALVA-SPAZIO (AZIENDE VISIBILI SUBITO IN ALTO) ── */}
          <div className="flex flex-col gap-2.5 mb-3.5 pt-1">
            
            {/* Riga 1: Barra di ricerca estesa + Tasto Nuova Azienda + Selettore Ordinamento */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              
              {/* Barra di ricerca morbida in azzurro tenue / bianco */}
              <div
                className="relative flex items-center flex-1 min-w-[240px] px-4 py-2 transition-all duration-200 bg-white shadow-xs"
                style={{
                  borderRadius: '9999px',
                  border: '1.5px solid #bfe0f5',
                }}
              >
                <Search className="w-4 h-4 flex-shrink-0 text-[#0284c7] mr-2.5 stroke-[2.5]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca azienda, referente, telefono, materiale, data, contratto..."
                  className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 text-sm font-semibold focus:outline-none"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors text-xs font-bold mr-1"
                    title="Cancella testo"
                  >
                    ✕
                  </button>
                )}
                <span
                  className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-[#0369a1] bg-[#e0f2fe] shrink-0"
                >
                  {filteredCompanies.length} <span className="ml-1 font-bold">AZIENDE</span>
                </span>
              </div>

              {/* Badge Ordinamento Imminente / Switcher */}
              <div className="flex items-center gap-1.5 shrink-0">
                {!isDipendente && (
                  <button
                    onClick={() => setSortBy(sortBy === 'imminent' ? 'compensation_desc' : 'imminent')}
                    className={`px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border ${
                      sortBy === 'imminent'
                        ? 'bg-[#0284c7] text-white border-[#0284c7]'
                        : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
                    }`}
                    title="Ordina per lavori imminenti o per importo"
                  >
                    <Zap className={`w-3.5 h-3.5 ${sortBy === 'imminent' ? 'text-amber-300 fill-amber-300' : 'text-[#0284c7]'}`} />
                    <span>
                      {sortBy === 'imminent' ? <strong>Lavori imminenti (1°)</strong> : 'Ordina: Importo'}
                    </span>
                  </button>
                )}

                {/* Pulsante + Nuova Azienda (Riservato ad Admin) */}
                {!isDipendente && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                    style={{ fontFamily: '"Switzer", sans-serif', fontWeight: 800 }}
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ Nuova Azienda</span>
                  </button>
                )}
              </div>

            </div>

            {/* Riga 2: Filtri rapidi a pillole senza riquadri duri */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
              <span className="text-slate-500 font-bold text-xs uppercase mr-1 shrink-0">
                STATO:
              </span>
              {[
                { id: 'all', label: 'Tutti', emoji: '🏢' },
                { id: 'lead_inbound', label: 'Lead & Inbound', emoji: '🎯' },
                { id: 'in_attesa_risposta', label: 'In attesa', emoji: '🔄' },
                { id: 'in_coda_pagamento', label: 'Coda pagamento', emoji: '⏳' },
                { id: 'lavoro_concluso', label: 'Concluso', emoji: '✅' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterRelationship(f.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap border ${
                    filterRelationship === f.id
                      ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-xs'
                      : 'bg-white/80 text-slate-700 border-sky-200/90 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <span>{f.emoji}</span>
                  <span>{f.label}</span>
                </button>
              ))}

              <div className="h-4 w-[1px] bg-sky-200 mx-1 shrink-0" />

              <span className="text-slate-500 font-bold text-xs uppercase mr-1 shrink-0">
                B.A.N.T.:
              </span>
              {[
                { id: 'all', label: 'Tutti' },
                { id: 'complete', label: '🟢 4/4 Completo' },
                { id: 'incomplete', label: '⚠️ Mancanti' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterBant(f.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    filterBant === f.id
                      ? 'bg-[#d97706] text-white border-[#d97706] shadow-xs'
                      : 'bg-white/80 text-slate-700 border-sky-200/90 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

          </div>

          {/* ── LISTA SCHEDE AZIENDE: CARDS CHIARE SU SFONDO AZZURRO TENUE (NO RIQUADRINI) ── */}
          {loading ? (
            <div className="py-16 text-center text-slate-500 font-semibold text-sm">
              Caricamento database aziende in corso...
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="py-16 text-center bg-white p-8 rounded-2xl border border-sky-200 shadow-sm max-w-lg mx-auto">
              <Building2 className="w-10 h-10 text-sky-400 mx-auto mb-2" />
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

                // Formattazione data imminente
                const upcomingWork = comp.workSchedule?.datesFormatted || comp.workSchedule?.recentDate || 'Pianificazione in corso'
                const isUrgent = upcomingWork.toLowerCase().includes('settimana') || upcomingWork.toLowerCase().includes('oggi') || relStatus.key === 'in_attesa_risposta'

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
                      
                      {/* Sinistra: Icona, Nome Grande Switzer, Settore, Badge di Stato e BANT */}
                      <div className="flex items-start sm:items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] border border-sky-200 flex items-center justify-center shrink-0 text-[#0284c7] shadow-xs"
                          title={`Scheda Azienda: ${comp.name}`}
                        >
                          <Building2 className="w-5 h-5 text-[#0284c7] stroke-[2.2]" />
                        </div>

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
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-md uppercase"
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
                          <div className="text-xs font-black uppercase tracking-wider text-[#0284c7] flex items-center gap-1.5 mb-1">
                            <User className="w-3.5 h-3.5" />
                            <strong>REFERENTE & ACQUISIZIONE</strong>
                          </div>
                          <div className="font-bold text-slate-900 text-sm truncate" title={comp.contactPerson?.name}>
                            {comp.contactPerson?.name || 'Referente non indicato'}
                          </div>
                          <div className="text-xs text-slate-500 truncate font-medium">
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

                      {/* Sezione 2: Lavoro Imminente & Calendario */}
                      <div className="flex flex-col justify-between pl-0 md:pl-4 md:border-l md:border-sky-100">
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-[#d97706] flex items-center gap-1.5 mb-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <strong>LAVORO IMMINENTE</strong>
                          </div>
                          <div className="font-extrabold text-slate-900 text-sm truncate flex items-center gap-1.5" title={upcomingWork}>
                            {isUrgent && <span className="text-amber-500 font-black">⚡</span>}
                            <span>{upcomingWork}</span>
                          </div>
                          <div className="text-xs text-slate-600 font-semibold mt-0.5 truncate">
                            <strong>SET:</strong> {comp.workSchedule?.scheduleType || 'Sessione da definire'}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-sky-100/80 text-xs">
                          <span className="text-slate-400 font-medium">Feedback:</span>
                          <span className="flex items-center gap-1 text-amber-600 font-black">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <strong>{comp.feedback?.rating ? comp.feedback.rating.toFixed(1) : '5.0'}</strong> / 5.0
                          </span>
                        </div>
                      </div>

                      {/* Sezione 3: Contratto, Firma & Criticità */}
                      <div className="flex flex-col justify-between pl-0 md:pl-4 md:border-l md:border-sky-100">
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-[#ea580c] flex items-center gap-1.5 mb-1">
                            <FileText className="w-3.5 h-3.5" />
                            <strong>CONTRATTO & STATO</strong>
                          </div>
                          <div className="font-bold text-slate-900 text-sm truncate" title={comp.contract?.fileName}>
                            {comp.contract?.fileName || comp.contract?.code || 'CTR-DADO-2026'}
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">
                            Formato: <strong className="text-slate-700">PDF</strong> • <strong className="text-slate-700">{comp.contract?.status?.toUpperCase() || 'FIRMATO'}</strong>
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
                            <div className="p-3 bg-white rounded-lg border border-sky-100 shadow-xs">
                              <div className="text-xs font-black uppercase text-[#16a34a] flex items-center justify-between">
                                <strong>B • BUDGET</strong>
                                {!bant.hasB && <strong className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">DA DEFINIRE</strong>}
                              </div>
                              <div className="text-base font-black text-slate-900 mt-1">
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
                            <div className="p-3 bg-white rounded-lg border border-sky-100 shadow-xs">
                              <div className="text-xs font-black uppercase text-[#dc2626] flex items-center justify-between">
                                <strong>A • AUTHORITY</strong>
                                {!bant.hasA && <strong className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">DA VERIFICARE</strong>}
                              </div>
                              <div className="text-sm font-bold text-slate-900 mt-1 truncate" title={bant.authority}>
                                {bant.authority}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                Referente decisionale con potere di firma
                              </div>
                            </div>

                            {/* Need */}
                            <div className="p-3 bg-white rounded-lg border border-sky-100 shadow-xs">
                              <div className="text-xs font-black uppercase text-[#0284c7] flex items-center justify-between">
                                <strong>N • NEED</strong>
                                {!bant.hasN && <strong className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">DA CHIARIRE</strong>}
                              </div>
                              <div className="text-xs font-bold text-slate-900 mt-1 line-clamp-2 leading-relaxed" title={bant.need}>
                                {bant.need}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                Esigenza operativa e output atteso
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="p-3 bg-white rounded-lg border border-sky-100 shadow-xs">
                              <div className="text-xs font-black uppercase text-[#d97706] flex items-center justify-between">
                                <strong>T • TIMELINE</strong>
                                {!bant.hasT && <strong className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">DA FISSARE</strong>}
                              </div>
                              <div className="text-xs font-black text-slate-900 mt-1">
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

                            <div className="p-3.5 bg-white rounded-xl border border-sky-100 shadow-xs">
                              <strong className="text-xs font-black uppercase text-[#d97706] flex items-center gap-1.5 mb-1.5">
                                <Calendar className="w-4 h-4" />
                                1° CONTATTO & ACQUISIZIONE
                              </strong>
                              <div className="text-xs text-slate-500 mb-1">
                                Data: <strong className="text-slate-800">{comp.firstContact?.date}</strong> • Canale: <strong className="text-[#0284c7]">{comp.firstContact?.channel}</strong>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed">
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
                                  CONTRATTO FORMATO DIGITALE
                                </strong>
                                <span className="text-[11px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                                  {comp.contract?.status?.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-slate-900 mb-1">
                                <strong>CTR:</strong> {comp.contract?.fileName} ({comp.contract?.code})
                              </div>
                              <div className="text-xs text-slate-600 leading-relaxed">
                                <strong>Termini:</strong> {comp.contract?.terms}
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
