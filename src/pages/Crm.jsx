import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Globe,
  Mail,
  Phone,
  Video,
  MessageCircle,
  Send,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowUpRight,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Plus,
  X,
  FileCheck,
  User,
  MapPin,
  ShieldCheck,
  Zap,
  PhoneCall,
  TrendingUp,
  Layers,
  Activity,
  ChevronDown,
  BarChart3,
  Bot,
  PieChart,
  Sliders,
  CheckSquare,
  History,
  Target
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDeviceMode } from '../context/DeviceModeContext'
import TopBarUserProfile from '../components/TopBarUserProfile'
import CrmFuturisticLogo from '../components/CrmFuturisticLogo'
import PageTopBand from '../components/PageTopBand'

// Template di Preventivo Standard ufficiale DADO Creative Studio
const STANDARD_QUOTE_TEMPLATE = (companyName, contactName, need, budget) => `Gentile ${contactName || 'Referente'},

grazie per aver compilato il modulo di contatto sul sito ufficiale di DADO Creative Studio per ${companyName || 'la vostra azienda'}.

In merito alla vostra richiesta relativa a "${need || 'Produzione video corporate & shooting'}", abbiamo predisposto la seguente proposta di preventivo standard:

• Pacchetto Servizio: Produzione Video Corporate 4K HDR & Riprese Aeree con Drone
• Attrezzatura & Set: Canon Cinema EOS C70, Set ottiche Canon RF L-series prime & zoom, Drone DJI Mavic 3 Cine (piloti certificati ENAC), Microfoni wireless Sennheiser AVX
• Post-Produzione: Montaggio master broadcast, Color Grading DaVinci Resolve Studio, Sound Design e licenze musicali commerciali incluse
• Finestra di consegna stimata: 10 giorni lavorativi dalla conclusione delle riprese
• Investimento complessivo: ${budget ? `€ ${budget}` : '€ 5.000'} + IVA (22%)
• Condizioni di pagamento: 50% alla conferma dell'ordine / stipula contratto, saldo alla consegna finale dei master 4K

Restiamo a vostra completa disposizione per un breve allineamento telefonico o una video-call su Google Meet per definire i dettagli operativi.

Un cordiale saluto,
Team Commerciale & Produzione
DADO Creative Studio — Milano
www.dadocreative.studio | info@dadocreative.studio`

// Fasi della Pipeline Commerciale Trattative (DADO Studio Video & Photo Production)
const PIPELINE_STAGES = [
  {
    id: 'stage-lead',
    step: '01',
    label: 'Lead Iniziale',
    sub: 'Richiesta form sito',
    probability: 20,
    color: '#0284c7',
    accentBorder: '#38bdf8',
    bg: '#f0f9ff',
    dealsCount: 5,
    totalEur: '40.900',
    statuses: ['In attesa preventivo', 'Nuovo', 'Inbound Form']
  },
  {
    id: 'stage-contact',
    step: '02',
    label: 'Qualifica BANT',
    sub: 'Primo contatto & call',
    probability: 40,
    color: '#6366f1',
    accentBorder: '#818cf8',
    bg: '#eef2ff',
    dealsCount: 4,
    totalEur: '32.500',
    statuses: ['In elaborazione', 'Call conoscitiva']
  },
  {
    id: 'stage-brief',
    step: '03',
    label: 'Brief & Sopralluogo',
    sub: 'Verifica set & location',
    probability: 60,
    color: '#d97706',
    accentBorder: '#f59e0b',
    bg: '#fffbeb',
    dealsCount: 3,
    totalEur: '28.000',
    statuses: ['Sopralluogo pianificato', 'Brief set']
  },
  {
    id: 'stage-quote',
    step: '04',
    label: 'Preventivo Inviato',
    sub: 'Proposta in valutazione',
    probability: 75,
    color: '#0891b2',
    accentBorder: '#06b6d4',
    bg: '#ecfeff',
    dealsCount: 4,
    totalEur: '35.800',
    statuses: ['Preventivo inviato', 'Bozza preventivo pronta']
  },
  {
    id: 'stage-negotiation',
    step: '05',
    label: 'Negoziazione',
    sub: 'Revisione quote / accordi',
    probability: 90,
    color: '#9333ea',
    accentBorder: '#a855f7',
    bg: '#faf5ff',
    dealsCount: 2,
    totalEur: '18.400',
    statuses: ['Preventivo in scadenza', 'Revisione contratto']
  },
  {
    id: 'stage-won',
    step: '06',
    label: 'Chiuso / Confermato',
    sub: 'Contratto firmato',
    probability: 100,
    color: '#16a34a',
    accentBorder: '#22c55e',
    bg: '#f0fdf4',
    dealsCount: 6,
    totalEur: '48.500',
    statuses: ['Confermato', 'Contratto firmato', 'won']
  }
]

export default function Crm() {
  const navigate = useNavigate()
  const { isDipendente } = useAuth()
  const { isMobileApp } = useDeviceMode()

  // Lista aziende registrate tramite modulo del sito web con dettagli completi del form
  const [inboundLeads, setInboundLeads] = useState([
    {
      id: 'inb-1',
      name: 'Solaris Green Energy',
      contactPerson: { name: 'Dott.ssa Chiara Valenti', role: 'Head of Brand Communication & ESG' },
      email: 'chiara.valenti@solarisenergy.it',
      phone: '+39 049 332211',
      mobile: '+39 347 9081234',
      date: '2026-10-06',
      time: '11:20',
      industry: 'Energie Rinnovabili & Agrivoltaico',
      location: 'Parco Agrivoltaico del Brenta, Padova (PD)',
      vatNumber: 'IT04988770281',
      website: 'www.solarisenergy.it',
      selectedServices: ['Spot TV Broadcast 30s', 'Riprese Aeree Drone FPV', '4 Cut Verticali Social Ads', 'Voiceover Professionale'],
      timeline: 'Entro 3 settimane (Inaugurazione parco)',
      budget: '14.500',
      status: 'In attesa preventivo',
      pipelineStageId: 'stage-lead',
      bantScore: 4,
      formMessage: 'Buongiorno team DADO, vi contattiamo tramite il form per la realizzazione dello spot TV e contenuti digital per l\'inaugurazione del nuovo impianto agrivoltaico. Abbiamo bisogno di riprese aeree con drone certificato e consegna master broadcast in 4K HDR con diritti TV regionali.',
    },
    {
      id: 'inb-2',
      name: 'NextMedia Agency',
      contactPerson: { name: 'Sara Moretti', role: 'Creative Partner & Direzione Clienti' },
      email: 's.moretti@nextmedia.agency',
      phone: '+39 02 8765432',
      mobile: '+39 338 7654321',
      date: '2026-10-05',
      time: '15:45',
      industry: 'Agenzia di Comunicazione & Fashion',
      location: 'Stabilimento Monza & Studio DADO Milano',
      vatNumber: 'IT08922330961',
      website: 'www.nextmedia.agency',
      selectedServices: ['Video Corporate Industriale', 'Drone 4K Indoor', 'Interviste Executive Direzione'],
      timeline: 'Urgente entro 10 giorni',
      budget: '5.000',
      status: 'In elaborazione',
      pipelineStageId: 'stage-contact',
      bantScore: 3,
      formMessage: 'Salve DADO Studio, stiamo curando il rebranding di un brand fashion e vorremmo pianificare una sessione di riprese corporate con drone indoor. Chiediamo informazioni sulle disponibilità del vostro studio per concordare un preventivo pilota continuativo.',
    },
    {
      id: 'inb-3',
      name: 'Fashion Brand Milano',
      contactPerson: { name: 'Matteo Colombo', role: 'Marketing & Brand Manager' },
      email: 'm.colombo@fashionbrand.it',
      phone: '+39 02 4455667',
      mobile: '+39 340 1122334',
      date: '2026-10-04',
      time: '17:10',
      industry: 'Moda & Lifestyle B2B',
      location: 'Showroom Via Tortona, Milano',
      vatNumber: 'IT03344550158',
      website: 'www.fashionbrand.it',
      selectedServices: ['Lookbook Video Autunno/Inverno', 'Reel & TikTok Kit', 'Color Grading HDR'],
      timeline: 'Entro 2 settimane',
      budget: '6.800',
      status: 'In attesa preventivo',
      pipelineStageId: 'stage-lead',
      bantScore: 3,
      formMessage: 'Vorremmo capire i costi e i tempi di consegna per un set lookbook video completo per la nuova capsule collection. Ci servirebbe una call conoscitiva all\'inizio della prossima settimana.',
    },
    {
      id: 'inb-4',
      name: 'Kroma Ceramiche',
      contactPerson: { name: 'Ing. Roberto Ferri', role: 'Responsabile Marketing Prodotto' },
      email: 'r.ferri@kromaceramiche.it',
      phone: '+39 0536 908123',
      mobile: '+39 333 9988776',
      date: '2026-10-02',
      time: '09:30',
      industry: 'Design & Ceramica Industriale',
      location: 'Sassuolo (MO)',
      vatNumber: 'IT01928370364',
      website: 'www.kromaceramiche.it',
      selectedServices: ['Rendering 3D Architettura', 'Foto Still Life Ambientate', 'Virtual Tour 360°'],
      timeline: 'Entro 1 mese',
      budget: '5.400',
      status: 'Preventivo inviato',
      pipelineStageId: 'stage-quote',
      bantScore: 4,
      formMessage: 'Richiediamo preventivo dettagliato per 14 ambientazioni fotorealistiche e still life ad alta risoluzione dei nuovi formati ceramici per il catalogo 2027.',
    },
    {
      id: 'inb-5',
      name: 'Officine Meccaniche Riva',
      contactPerson: { name: 'Ing. Marco Riva', role: 'Managing Director & Titolare' },
      email: 'marco.riva@officineriva.it',
      phone: '+39 039 778899',
      mobile: '+39 335 1298450',
      date: '2026-09-28',
      time: '09:15',
      industry: 'Manifattura & B2B Industry',
      location: 'Stabilimento Lecco & Linee Robotizzate',
      vatNumber: 'IT02837460135',
      website: 'www.officineriva.it',
      selectedServices: ['Shooting Industriale 4K', 'Drone Indoor Stabilimento', 'Intervista Titolare'],
      timeline: 'Urgente entro 3 giorni',
      budget: '9.200',
      status: 'Preventivo in scadenza',
      pipelineStageId: 'stage-negotiation',
      bantScore: 4,
      formMessage: 'Abbiamo deliberato il budget di € 9.200 per le riprese video dello stabilimento con drone indoor. Vi contattiamo per avviare la produzione e definire il piano riprese operativo.',
    }
  ])

  const [search, setSearch] = useState('')
  const [selectedPipelineStage, setSelectedPipelineStage] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [selectedForQuote, setSelectedForQuote] = useState(null)
  const [quoteSubject, setQuoteSubject] = useState('')
  const [quoteBody, setQuoteBody] = useState('')
  const [quoteAmount, setQuoteAmount] = useState('5.000')
  const [quoteFeedback, setQuoteFeedback] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [copiedText, setCopiedText] = useState(null)


  // Sincronizzazione con il server API crmData.json
  useEffect(() => {
    fetch('/api/crm/summary')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.companies)) {
          const fromDb = data.companies.filter(c => {
            const ch = (c.firstContact?.channel || '').toLowerCase()
            return ch.includes('sito') || ch.includes('form') || ch.includes('inbound')
          }).map(c => {
            const st = c.status || 'In attesa preventivo'
            let pStage = 'stage-lead'
            if (st.includes('scadenza')) pStage = 'stage-negotiation'
            else if (st.includes('inviato')) pStage = 'stage-quote'
            else if (st.includes('elaborazione') || st.includes('call')) pStage = 'stage-contact'
            else if (st.includes('firmato') || st.includes('confermato')) pStage = 'stage-won'

            return {
              id: c.id,
              name: c.name,
              contactPerson: {
                name: c.contactPerson?.name || (typeof c.contactPerson === 'string' ? c.contactPerson : 'Referente'),
                role: c.contactPerson?.role || 'Referente Aziendale'
              },
              email: c.contact?.directEmail || c.contact?.email || 'contatto@azienda.it',
              phone: c.contact?.phone || '+39 02 8900123',
              mobile: c.contact?.mobile || '+39 347 1122334',
              date: c.firstContact?.date || '2026-10-01',
              time: '10:00',
              industry: c.industry || 'Settore B2B',
              location: c.workSchedule?.location || 'Sede cliente / Studio Milano',
              vatNumber: c.piva || 'IT00000000000',
              website: c.domain ? `www.${c.domain}` : 'www.azienda.it',
              selectedServices: c.requestedMaterials || ['Produzione Video Corporate', 'Drone 4K'],
              timeline: c.workSchedule?.datesFormatted || 'Entro 2 settimane',
              budget: c.compensation?.amount ? String(c.compensation.amount) : '5.000',
              status: st,
              pipelineStageId: pStage,
              bantScore: 4,
              formMessage: c.firstContact?.notes || 'Richiesta informazioni e preventivo inviata dal modulo web.',
            }
          })

          if (fromDb.length > 0) {
            setInboundLeads(prev => {
              const ids = new Set(fromDb.map(x => x.id))
              return [...fromDb, ...prev.filter(x => !ids.has(x.id))]
            })
          }
        }
      })
      .catch(() => {})
  }, [])

  // Filtra lead per ricerca e per fase pipeline selezionata
  const filteredLeads = useMemo(() => {
    let result = inboundLeads

    // Filtro per fase pipeline selezionata
    if (selectedPipelineStage) {
      result = result.filter(l => l.pipelineStageId === selectedPipelineStage)
    }

    // Filtro per testo di ricerca
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.contactPerson?.name.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q) ||
        l.formMessage.toLowerCase().includes(q) ||
        (l.email && l.email.toLowerCase().includes(q))
      )
    }

    return result
  }, [inboundLeads, search, selectedPipelineStage])

  // Gestione Apertura Editor Preventivo Standard
  function handleOpenQuote(lead) {
    setSelectedForQuote(lead)
    const cleanAmt = lead.budget ? lead.budget.replace(/[^0-9\.]/g, '') : '5.000'
    setQuoteAmount(cleanAmt || '5.000')
    setQuoteSubject(`Proposta di Preventivo: ${lead.selectedServices?.[0] || 'Produzione Video'} — DADO Creative Studio`)
    setQuoteBody(STANDARD_QUOTE_TEMPLATE(lead.name, lead.contactPerson?.name, lead.selectedServices?.[0] || lead.formMessage, cleanAmt || '5.000'))
    setQuoteFeedback(null)
  }

  // Invio preventivo
  function handleSendQuote(asDraft = false) {
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      setInboundLeads(prev =>
        prev.map(l =>
          l.id === selectedForQuote.id
            ? {
                ...l,
                status: asDraft ? 'Bozza preventivo pronta' : 'Preventivo inviato',
                pipelineStageId: asDraft ? 'stage-contact' : 'stage-quote'
              }
            : l
        )
      )
      setQuoteFeedback({
        type: asDraft ? 'draft' : 'sent',
        message: asDraft
          ? `Bozza salvata nelle bozze CRM per ${selectedForQuote.name}!`
          : `Preventivo standard (€ ${quoteAmount}) inviato con successo a ${selectedForQuote.email}!`,
      })

      // Emette notifica intelligente
      window.dispatchEvent(new CustomEvent('dado-smart-notification', {
        detail: {
          category: 'quote_sent',
          badge: asDraft ? '📝 BOZZA SALVATA' : '✉️ PREVENTIVO INVIATO',
          title: `${asDraft ? 'Bozza Preventivo' : 'Preventivo inviato'}: €${quoteAmount} per ${selectedForQuote.name}`,
          subtitle: `Inviato a ${selectedForQuote.email} • Aggiornato funnel CRM DADO Studio`,
          contactPerson: selectedForQuote.contactPerson?.name || selectedForQuote.name,
          phone: selectedForQuote.phone || selectedForQuote.mobile,
          link: '/crm',
          actionLabel: 'Verifica Dettagli',
        }
      }))

      setTimeout(() => {
        setSelectedForQuote(null)
        setQuoteFeedback(null)
      }, 2000)
    }, 600)
  }

  // Genera link WhatsApp con testo pre-compilato
  function getWhatsAppUrl(lead) {
    const raw = lead.mobile || lead.phone || ''
    const clean = raw.replace(/[^0-9]/g, '')
    const intl = clean.startsWith('39') ? clean : `39${clean}`
    const msg = encodeURIComponent(
      `Buongiorno ${lead.contactPerson?.name || ''}, vi contatto da DADO Creative Studio (Milano) in merito alla richiesta inviata tramite il modulo del nostro sito web per ${lead.name}. Volevamo proporvi una breve call conoscitiva per approfondire i dettagli. Quando vi è più comodo?`
    )
    return `https://wa.me/${intl}?text=${msg}`
  }

  // Copia testo negli appunti
  function handleCopy(text, key) {
    navigator.clipboard.writeText(text)
    setCopiedText(key)
    setTimeout(() => setCopiedText(null), 1800)
  }

  // Helper per consentire lo scroll e il trascinamento orizzontale verso destra/sinistra su tutti i riquadri (anche se contengono pulsanti o link)
  const horizontalDragProps = {
    onDragStart: (e) => {
      e.preventDefault()
    },
    onMouseDown: (e) => {
      if (e.target.closest('input, select, textarea')) return
      const el = e.currentTarget
      el._dragStartX = e.clientX
      el._dragScrollLeft = el.scrollLeft
      el._isDraggingRow = true
      el._hasDragged = false
    },
    onMouseMove: (e) => {
      const el = e.currentTarget
      if (!el._isDraggingRow) return
      const dx = e.clientX - el._dragStartX
      if (Math.abs(dx) > 4) {
        el._hasDragged = true
      }
      el.scrollLeft = el._dragScrollLeft - dx
    },
    onMouseUp: (e) => {
      e.currentTarget._isDraggingRow = false
    },
    onMouseLeave: (e) => {
      e.currentTarget._isDraggingRow = false
    },
    onClickCapture: (e) => {
      const el = e.currentTarget
      if (el._hasDragged) {
        e.preventDefault()
        e.stopPropagation()
        el._hasDragged = false
      }
    },
  }

  return (
    <div
      className="h-full min-h-0 flex flex-col flex-1 relative overflow-hidden text-slate-800"
      style={{
        backgroundColor: 'transparent',
        fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '16px',
        letterSpacing: '-0.01em'
      }}
    >
      {/* ── BANDA SUPERIORE: Testo CRM come nella barra laterale (ma senza contorno) ── */}
      <PageTopBand
        theme="companies"
        thickDesktop={true}
        titleNode={
          <CrmFuturisticLogo
            isActive={true}
            withOutline={false}
            width={isMobileApp ? 72 : 96}
            height={isMobileApp ? 19 : 25}
            className="shrink-0"
          />
        }
      />

      {/* ── CANVAS PRINCIPALE: STESSA GRANDEZZA E DESIGN DELLA DASHBOARD ── */}
      <div
        className={`h-full flex-1 rounded-tl-none ${isMobileApp ? 'rounded-bl-[32px]' : 'rounded-bl-[48px]'} flex flex-col justify-between relative min-w-0 overflow-hidden`}
        style={{
          background: 'linear-gradient(180deg, #f0f8fd 0%, #e5f3fa 100%)',
          borderLeft: '1.5px solid #d4ebf9',
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
          borderTopLeftRadius: '0px',
          borderBottomLeftRadius: isMobileApp ? '32px' : '48px',
        }}
      >
        <div className={`flex-1 min-h-0 ${isMobileApp ? 'px-2.5 py-2.5 gap-3' : 'px-4 md:px-7 py-4 gap-4'} overflow-y-auto custom-popup-scrollbar flex flex-col`}>

          {/* ── TESTATA PORTALE CRM: Subito sotto la scritta CRM la Barra di Ricerca + Card Selezione Rapida affiancate e scrollabili ── */}
          <div className={`flex flex-col ${isMobileApp ? 'gap-2 pb-2.5' : 'gap-3 pb-3.5'} border-b border-sky-300/80 shrink-0`}>
            {/* 1. Subito sotto la scritta CRM: Barra di Ricerca Aziende, Referenti e Servizi */}
            <div className="relative w-full">
              <Search className={`absolute ${isMobileApp ? 'left-3.5 w-4 h-4' : 'left-4 w-5 h-5'} top-1/2 -translate-y-1/2 text-[#0284c7] stroke-[2.5] pointer-events-none`} />
              <input
                type="text"
                placeholder="Cerca azienda, referente o servizio..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full bg-white border-2 border-[#0284c7] focus:border-[#0369a1] rounded-full ${isMobileApp ? 'pl-9 pr-8 py-1.5 text-[12px]' : 'pl-11 pr-10 py-2 text-[14.5px]'} text-slate-900 placeholder-slate-400 font-bold focus:outline-none shadow-sm transition-all whitespace-nowrap`}
                style={{ fontFamily: '"Switzer", sans-serif' }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* 2. Card / Riquadri Selezione Rapida messi uno accanto all'altro, scrollabili verso destra, con testo su un'unica riga */}
            <div
              {...horizontalDragProps}
              className={`flex items-center ${isMobileApp ? 'gap-1.5' : 'gap-2.5'} w-full overflow-x-auto pb-0.5 cursor-grab active:cursor-grabbing no-scrollbar select-none`}
              style={{
                touchAction: 'pan-x pan-y',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedPipelineStage(null)
                  document.getElementById('crm-leads-list')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`flex-1 ${isMobileApp ? 'px-2.5 py-1.5 text-[10.5px] gap-1.5' : 'px-3.5 py-2 text-[13px] gap-2'} rounded-xl font-black flex items-center justify-between border transition-all cursor-pointer bg-white hover:bg-sky-50 text-slate-800 border-sky-300 shadow-xs hover:border-[#0284c7] whitespace-nowrap shrink-0`}
                style={{ fontFamily: '"Switzer", sans-serif' }}
              >
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Mail size={isMobileApp ? 11 : 14} className="text-[#0284c7] shrink-0" />
                  <span className="whitespace-nowrap">Richieste Form Sito</span>
                </span>
                <span className={`bg-sky-100 text-[#0284c7] ${isMobileApp ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-[11.5px]'} rounded-md font-extrabold whitespace-nowrap shrink-0`}>
                  {inboundLeads.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById('crm-pipeline-section')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`flex-1 ${isMobileApp ? 'px-2.5 py-1.5 text-[10.5px] gap-1.5' : 'px-3.5 py-2 text-[13px] gap-2'} rounded-xl font-black flex items-center justify-between border transition-all cursor-pointer bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-900 border-emerald-400 hover:bg-emerald-500/25 shadow-xs whitespace-nowrap shrink-0`}
                style={{ fontFamily: '"Switzer", sans-serif' }}
              >
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <TrendingUp size={isMobileApp ? 11 : 14} className="text-emerald-600 stroke-[2.5] shrink-0" />
                  <span className="whitespace-nowrap">Voce Pipeline</span>
                </span>
                <span className={`bg-emerald-600 text-white ${isMobileApp ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-[11.5px]'} rounded-md font-bold whitespace-nowrap shrink-0`}>
                  6 Fasi
                </span>
              </button>

              <Link
                to="/opportunities"
                draggable={false}
                className={`flex-1 ${isMobileApp ? 'px-2.5 py-1.5 text-[10.5px] gap-1.5' : 'px-3.5 py-2 text-[13px] gap-2'} rounded-xl font-black flex items-center justify-between border transition-all cursor-pointer bg-white text-purple-800 border-purple-300 hover:border-purple-500 hover:bg-purple-50 shadow-xs whitespace-nowrap shrink-0`}
                style={{ fontFamily: '"Switzer", sans-serif' }}
                title="Apri Tabellone Kanban Completo con istogramma mensile"
              >
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Layers size={isMobileApp ? 11 : 14} className="text-purple-600 shrink-0" />
                  <span className="whitespace-nowrap">Kanban Pipeline</span>
                </span>
                <ArrowUpRight size={isMobileApp ? 11 : 14} className="text-purple-600 shrink-0" />
              </Link>
            </div>
          </div>

          {/* ── RIQUADRO PIPELINE COMMERCIALE TRATTATIVE (CARD AFFIANCATE E SCROLLABILI VERSO DESTRA) ── */}
          <div
            id="crm-pipeline-section"
            className={`${isMobileApp ? 'p-3' : 'p-4 md:p-5'} rounded-3xl bg-white border-2 border-sky-300 shadow-[0_4px_20px_rgba(2,132,199,0.12)] shrink-0 transition-all relative overflow-hidden`}
          >
            {/* Header del Riquadro Pipeline (scrollabile verso destra per visualizzare tutto il riquadro) */}
            <div className={`flex flex-col ${isMobileApp ? 'gap-2 pb-2.5 mb-2.5' : 'lg:flex-row lg:items-center justify-between gap-3 pb-3 mb-3.5'} border-b border-sky-100`}>
              <div
                {...horizontalDragProps}
                className="flex items-center gap-2 min-w-0 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
                style={{
                  touchAction: 'pan-x pan-y',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <div className={`${isMobileApp ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 rounded-xl'} bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white flex items-center justify-center shadow-sm shrink-0`}>
                  <TrendingUp size={isMobileApp ? 15 : 20} className="stroke-[2.5]" />
                </div>
                <div className="shrink-0">
                  <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
                    <h3
                      className={`${isMobileApp ? 'text-[13px]' : 'text-lg'} font-black text-slate-900 uppercase tracking-wider whitespace-nowrap shrink-0`}
                      style={{ fontFamily: '"Switzer", sans-serif' }}
                    >
                      Pipeline Trattative Commerciali
                    </h3>
                    <span
                      className={`${isMobileApp ? 'px-2 py-0.5 text-[9.5px]' : 'px-2.5 py-0.5 text-[11.5px]'} rounded-md font-black bg-sky-100 text-[#0284c7] border border-sky-200 uppercase whitespace-nowrap shrink-0`}
                      style={{ fontFamily: '"Switzer", sans-serif' }}
                    >
                      Funnel Produzioni Video & Foto
                    </span>
                  </div>
                  <p className={`${isMobileApp ? 'text-[10.5px]' : 'text-[13px]'} text-slate-500 font-medium whitespace-nowrap mt-0.5`} style={{ fontFamily: '"Switzer", sans-serif' }}>
                    Clicca su una fase della pipeline per filtrare i lead o apri il tabellone completo.
                  </p>
                </div>
              </div>

              {/* Riquadri KPI Ponderato & Tabellone Kanban messi uno accanto all'altro e scrollabili verso destra */}
              <div
                {...horizontalDragProps}
                className={`flex items-center ${isMobileApp ? 'gap-1.5 w-full' : 'gap-2.5'} overflow-x-auto pb-0.5 cursor-grab active:cursor-grabbing no-scrollbar select-none`}
                style={{
                  touchAction: 'pan-x pan-y',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <div
                  className={`flex-1 ${isMobileApp ? 'px-2.5 py-1.5 text-[10.5px]' : 'px-3.5 py-1.5 text-[13.5px]'} rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold flex items-center justify-between gap-1.5 whitespace-nowrap shrink-0`}
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  <span className="text-slate-500 whitespace-nowrap">Valore Ponderato:</span>
                  <span className={`text-[#0284c7] font-black ${isMobileApp ? 'text-[11.5px]' : 'text-[15px]'} whitespace-nowrap shrink-0`}>€ 126.1k</span>
                </div>

                <Link
                  to="/opportunities"
                  draggable={false}
                  className={`flex-1 ${isMobileApp ? 'px-2.5 py-1.5 text-[10.5px]' : 'px-3.5 py-1.5 text-[13.5px]'} rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-black flex items-center justify-between gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0`}
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                  title="Apri gestione completa della Pipeline Opportunità"
                >
                  <span className="whitespace-nowrap">Tabellone Kanban Completo</span>
                  <ArrowUpRight size={isMobileApp ? 12 : 15} className="shrink-0" />
                </Link>

                {selectedPipelineStage && (
                  <button
                    type="button"
                    onClick={() => setSelectedPipelineStage(null)}
                    className={`${isMobileApp ? 'px-2.5 py-1.5 text-[10.5px]' : 'px-3 py-1.5 text-[12.5px]'} rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap shrink-0`}
                  >
                    <X size={13} className="shrink-0" />
                    <span className="whitespace-nowrap">Azzera Filtro</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tracciamento Visuale a 6 Fasi della Pipeline: Card affiancate una accanto all'altra e scrollabili verso destra */}
            <div
              {...horizontalDragProps}
              className={`flex items-stretch ${isMobileApp ? 'gap-2' : 'gap-2.5'} overflow-x-auto pb-1 cursor-grab active:cursor-grabbing no-scrollbar select-none`}
              style={{
                touchAction: 'pan-x pan-y',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {PIPELINE_STAGES.map((stg) => {
                const isSelected = selectedPipelineStage === stg.id
                return (
                  <div
                    key={stg.id}
                    onClick={() => setSelectedPipelineStage(isSelected ? null : stg.id)}
                    className={`flex-1 ${isMobileApp ? 'min-w-[168px] p-2.5' : 'min-w-[180px] p-3'} w-auto shrink-0 rounded-2xl border-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected
                        ? 'ring-2 ring-offset-1 shadow-md'
                        : 'hover:shadow-sm'
                    }`}
                    style={{
                      backgroundColor: stg.bg,
                      borderColor: isSelected ? stg.color : stg.accentBorder,
                      ringColor: stg.color,
                    }}
                    title={`Fase: ${stg.label} (${stg.sub}) • Clicca per filtrare`}
                  >
                    <div>
                      {/* Riga Superiore: Step e Probabilità su un'unica riga */}
                      <div className="flex items-center justify-between gap-2 mb-1 whitespace-nowrap">
                        <span
                          className={`${isMobileApp ? 'text-[11px] px-1.5 py-0.5' : 'text-[12px] px-1.5 py-0.5'} font-black uppercase tracking-wider rounded-md text-white shadow-2xs whitespace-nowrap`}
                          style={{
                            backgroundColor: stg.color,
                            fontFamily: '"Switzer", sans-serif'
                          }}
                        >
                          {stg.step}
                        </span>
                        <span
                          className={`${isMobileApp ? 'text-[11.5px]' : 'text-[12.5px]'} font-bold whitespace-nowrap`}
                          style={{
                            color: stg.color,
                            fontFamily: '"Switzer", sans-serif'
                          }}
                        >
                          {stg.probability}%
                        </span>
                      </div>

                      {/* Nome Fase tutto su un'unica riga dentro il riquadro */}
                      <div
                        className={`${isMobileApp ? 'text-[13px]' : 'text-[14.5px]'} font-black text-slate-900 leading-tight mt-1 whitespace-nowrap`}
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        {stg.label}
                      </div>
                      <div
                        className={`${isMobileApp ? 'text-[11px]' : 'text-[12px]'} text-slate-500 font-medium leading-snug whitespace-nowrap mt-0.5`}
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        {stg.sub}
                      </div>
                    </div>

                    {/* Dati Economici e Numero Trattative su un'unica riga */}
                    <div className="mt-2 pt-1.5 border-t border-slate-200/70 flex items-center justify-between gap-2 whitespace-nowrap">
                      <span className={`${isMobileApp ? 'text-[11.5px]' : 'text-[12.5px]'} font-bold text-slate-700 whitespace-nowrap`}>
                        {stg.dealsCount} deal
                      </span>
                      <span
                        className={`font-black ${isMobileApp ? 'text-[12.5px]' : 'text-[13.5px]'} whitespace-nowrap`}
                        style={{
                          color: stg.color,
                          fontFamily: '"Switzer", sans-serif'
                        }}
                      >
                        € {stg.totalEur}
                      </span>
                    </div>

                    {/* Barra di Avanzamento Probabilità */}
                    <div className="w-full h-1.5 bg-black/10 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stg.probability}%`,
                          backgroundColor: stg.color
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── LISTA AZIENDE CON RIQUADRI AFFIANCATI E SCROLLABILI VERSO DESTRA ── */}
          <div id="crm-leads-list" className={`${isMobileApp ? 'space-y-3.5' : 'space-y-5'} shrink-0`}>
            {filteredLeads.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border-2 border-dashed border-sky-300 text-center">
                <p className="text-[15px] text-slate-500 font-bold whitespace-nowrap">
                  Nessun lead trovato con i filtri selezionati.
                </p>
                {selectedPipelineStage && (
                  <button
                    onClick={() => setSelectedPipelineStage(null)}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#0284c7] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#0369a1] whitespace-nowrap"
                  >
                    Mostra tutte le fasi della Pipeline
                  </button>
                )}
              </div>
            ) : (
              filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  className={`bg-white rounded-3xl border-2 border-sky-200 hover:border-sky-400 ${isMobileApp ? 'p-3.5 gap-3' : 'p-5 gap-4'} shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden`}
                >
                  {/* 1. Riga Superiore: Intestazione Azienda, Canale Inbound, Budget e Stato (scrollabile verso destra) */}
                  <div
                    {...horizontalDragProps}
                    className={`flex ${isMobileApp ? 'flex-col gap-2 pb-2.5' : 'flex-row items-center justify-between gap-3 pb-3.5'} border-b border-slate-200 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none`}
                    style={{
                      touchAction: 'pan-x pan-y',
                      WebkitOverflowScrolling: 'touch',
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                      <div className={`${isMobileApp ? 'w-9 h-9 rounded-xl text-xs' : 'w-11 h-11 rounded-2xl text-sm'} bg-gradient-to-br from-sky-500 to-blue-600 text-white font-black flex items-center justify-center shadow-sm shrink-0`}>
                        <span style={{ fontFamily: '"Switzer", sans-serif' }}>
                          {lead.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="shrink-0">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <h2
                            className={`${isMobileApp ? 'text-[15px]' : 'text-lg md:text-[21px]'} font-black text-slate-900 leading-tight whitespace-nowrap`}
                            style={{ fontFamily: '"Switzer", sans-serif' }}
                          >
                            {lead.name}
                          </h2>
                          <span
                            className={`${isMobileApp ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[12px]'} rounded-lg font-bold bg-sky-100 text-[#0284c7] border border-sky-300 flex items-center gap-1 whitespace-nowrap shrink-0`}
                            style={{ fontFamily: '"Switzer", sans-serif' }}
                          >
                            <Globe size={11} className="shrink-0" />
                            <span>Inbound Form Sito</span>
                          </span>
                          <span
                            className={`${isMobileApp ? 'text-[10.5px]' : 'text-[13px]'} text-slate-400 font-bold whitespace-nowrap shrink-0`}
                            style={{ fontFamily: '"Switzer", sans-serif' }}
                          >
                            {lead.date} • {lead.time || '10:00'}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2.5 ${isMobileApp ? 'text-[11px]' : 'text-[13.5px]'} text-slate-600 mt-0.5 font-medium whitespace-nowrap`}>
                          <span className="whitespace-nowrap">Settore: <strong className="text-slate-800">{lead.industry}</strong></span>
                          {lead.location && (
                            <span className="flex items-center gap-1 text-slate-500 whitespace-nowrap">
                              <MapPin size={12} className="text-slate-600 shrink-0" />
                              <span>{lead.location}</span>
                            </span>
                          )}
                          {lead.vatNumber && (
                            <span className="font-bold text-slate-600 whitespace-nowrap">
                              P.IVA: {lead.vatNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Budget & Badge Stato messi uno accanto all'altro su un'unica riga */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-xl whitespace-nowrap">
                        <span
                          className={`${isMobileApp ? 'text-[10px]' : 'text-[11.5px]'} font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap`}
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          Budget:
                        </span>
                        <span
                          className={`${isMobileApp ? 'text-[13.5px]' : 'text-[17px]'} font-black text-[#0284c7] whitespace-nowrap`}
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          € {Number(lead.budget.replace(/[^0-9\.]/g, '')).toLocaleString('it-IT')}
                        </span>
                      </div>
                      <span
                        className={`${isMobileApp ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-[13px]'} rounded-xl font-black whitespace-nowrap ${
                          lead.status === 'Preventivo inviato'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : lead.status === 'Preventivo in scadenza'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        {lead.status}
                      </span>
                    </div>
                  </div>

                  {/* 2. Riquadri Dettagli Modulo: messi uno accanto all'altro e scrollabili verso destra per visualizzare tutto il riquadro */}
                  <div
                    {...horizontalDragProps}
                    className={`flex items-stretch ${isMobileApp ? 'gap-2.5' : 'gap-3.5'} overflow-x-auto pb-1 cursor-grab active:cursor-grabbing no-scrollbar select-none`}
                    style={{
                      touchAction: 'pan-x pan-y',
                      WebkitOverflowScrolling: 'touch',
                    }}
                  >
                    {/* Card 1: Referente e Recapiti */}
                    <div className={`flex-1 ${isMobileApp ? 'min-w-fit p-3' : 'min-w-fit p-4'} shrink-0 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between whitespace-nowrap`}>
                      <div>
                        <span
                          className={`${isMobileApp ? 'text-[10.5px]' : 'text-[12px]'} font-black uppercase tracking-wider text-slate-500 block mb-0.5 whitespace-nowrap`}
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          Referente & Decision Maker
                        </span>
                        <div
                          className={`font-black text-slate-900 ${isMobileApp ? 'text-[13.5px]' : 'text-[15.5px]'} whitespace-nowrap`}
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          {lead.contactPerson?.name}
                        </div>
                        <div className={`text-slate-600 font-semibold ${isMobileApp ? 'text-[11.5px]' : 'text-[13px]'} whitespace-nowrap`} style={{ fontFamily: '"Switzer", sans-serif' }}>
                          {lead.contactPerson?.role}
                        </div>
                      </div>
                      <div
                        className={`mt-2 pt-2 border-t border-slate-200 space-y-1 ${isMobileApp ? 'text-[11.5px]' : 'text-[13px]'} whitespace-nowrap`}
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        <div className="text-sky-700 font-bold whitespace-nowrap">
                          ✉️ {lead.email}
                        </div>
                        <div className="text-slate-700 font-semibold whitespace-nowrap">
                          📞 Ufficio: {lead.phone}
                        </div>
                        {lead.mobile && (
                          <div className="text-emerald-700 font-bold whitespace-nowrap">
                            📱 Mobile: {lead.mobile}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card 2: Servizi Selezionati & Tempistica */}
                    <div className={`flex-1 ${isMobileApp ? 'min-w-fit p-3' : 'min-w-fit p-4'} shrink-0 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between whitespace-nowrap`}>
                      <div>
                        <span
                          className={`${isMobileApp ? 'text-[10.5px]' : 'text-[12px]'} font-black uppercase tracking-wider text-slate-500 block mb-1 whitespace-nowrap`}
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          Servizi Selezionati nel Modulo
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 whitespace-nowrap">
                          {(lead.selectedServices || []).map((srv, idx) => (
                            <span
                              key={idx}
                              className={`px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 ${isMobileApp ? 'text-[11px]' : 'text-[12.5px]'} font-bold shadow-2xs whitespace-nowrap`}
                              style={{ fontFamily: '"Switzer", sans-serif' }}
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={`mt-2 pt-2 border-t border-slate-200 flex items-center justify-between gap-3 ${isMobileApp ? 'text-[11px]' : 'text-[12.5px]'} whitespace-nowrap`}>
                        <span className="text-slate-600 font-medium whitespace-nowrap">Tempistica desiderata:</span>
                        <span
                          className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-300 whitespace-nowrap"
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          ⏱️ {lead.timeline || 'Entro 2 settimane'}
                        </span>
                      </div>
                    </div>

                    {/* Card 3: Messaggio Richiesta del Cliente */}
                    <div className={`flex-1 ${isMobileApp ? 'min-w-fit p-3' : 'min-w-fit p-4'} shrink-0 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col justify-between whitespace-nowrap`}>
                      <div>
                        <span
                          className={`${isMobileApp ? 'text-[10.5px]' : 'text-[12px]'} font-black uppercase tracking-wider text-[#0284c7] block mb-1 whitespace-nowrap`}
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          Messaggio Inviato dal Modulo Sito
                        </span>
                        <p
                          className={`text-slate-800 italic ${isMobileApp ? 'text-[12px]' : 'text-[13.5px]'} whitespace-nowrap py-0.5`}
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          "{lead.formMessage}"
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-sky-200/70 flex items-center justify-between gap-3 whitespace-nowrap">
                        <span
                          className={`${isMobileApp ? 'text-[10.5px]' : 'text-[12px]'} text-[#0284c7] font-bold whitespace-nowrap`}
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          Canale Web Ufficiale
                        </span>
                        <span
                          className={`${isMobileApp ? 'text-[10.5px]' : 'text-[12px]'} text-slate-400 font-bold whitespace-nowrap`}
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          IP Verificato • Form dadocreative.studio
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Barra delle Azioni Dirette: Riquadri/Pulsanti affiancati e scrollabili verso destra */}
                  <div
                    {...horizontalDragProps}
                    className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-200 overflow-x-auto cursor-grab active:cursor-grabbing no-scrollbar select-none"
                    style={{
                      touchAction: 'pan-x pan-y',
                      WebkitOverflowScrolling: 'touch',
                    }}
                  >
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* 1. CHIAMATA TELEFONICA */}
                      <a
                        href={`tel:${(lead.mobile || lead.phone || '').replace(/\s+/g, '')}`}
                        draggable={false}
                        className={`${isMobileApp ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-[13.5px]'} rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer whitespace-nowrap shrink-0`}
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                        title={`Avvia chiamata telefonica a ${lead.contactPerson?.name} (${lead.mobile || lead.phone})`}
                      >
                        <PhoneCall size={isMobileApp ? 13 : 15} className="text-[#0284c7] shrink-0" />
                        <span className="whitespace-nowrap">Chiama ({lead.mobile || lead.phone})</span>
                      </a>

                      {/* 2. CALL SU GOOGLE MEET */}
                      <a
                        href="https://meet.google.com/dado-creative-studio"
                        target="_blank"
                        rel="noopener noreferrer"
                        draggable={false}
                        className={`${isMobileApp ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-[13.5px]'} rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer whitespace-nowrap shrink-0`}
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                        title="Avvia o condividi la stanza Google Meet dedicata DADO Creative Studio"
                      >
                        <Video size={isMobileApp ? 13 : 15} className="text-blue-600 shrink-0" />
                        <span className="whitespace-nowrap">Call su Meet</span>
                      </a>

                      {/* 3. WHATSAPP DIRETTO CON MESSAGGIO PRE-COMPILATO */}
                      <a
                        href={getWhatsAppUrl(lead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        draggable={false}
                        className={`${isMobileApp ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-[13.5px]'} rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer whitespace-nowrap shrink-0`}
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                        title="Apri chat WhatsApp con messaggio di presentazione pre-compilato"
                      >
                        <MessageCircle size={isMobileApp ? 13 : 15} className="text-[#25D366] fill-[#25D366] shrink-0" />
                        <span className="whitespace-nowrap">WhatsApp Diretto</span>
                      </a>
                    </div>

                    {/* Pulsante Azione Principale: Invia Preventivo Standard */}
                    <button
                      type="button"
                      onClick={() => handleOpenQuote(lead)}
                      className={`${isMobileApp ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-[13.5px]'} rounded-xl bg-gradient-to-r from-sky-600 to-[#0284c7] hover:from-sky-500 hover:to-[#0369a1] text-white font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0`}
                      style={{ fontFamily: '"Switzer", sans-serif' }}
                      title="Predisponi e invia preventivo con testo standard DADO"
                    >
                      <Send size={isMobileApp ? 12 : 14} className="stroke-[2.5] shrink-0" />
                      <span className="whitespace-nowrap">Invia Preventivo Standard</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── IN FONDO ALLA PAGINA: COLLEGAMENTO AI RIQUADRI PREVENTIVI DELLA DASHBOARD (CARD AFFIANCATE E SCROLLABILI VERSO DESTRA) ── */}
          <div className={`${isMobileApp ? 'p-3 mb-6' : 'p-4 mb-10'} rounded-3xl bg-white/95 border border-[#cce5f6] shadow-xs shrink-0`}>
            <div
              {...horizontalDragProps}
              className="flex items-center justify-between gap-2 mb-2 min-w-0 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
              style={{
                touchAction: 'pan-x pan-y',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <span
                className={`${isMobileApp ? 'text-[11px]' : 'text-[13.5px]'} font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5 whitespace-nowrap shrink-0`}
                style={{ fontFamily: '"Switzer", sans-serif' }}
              >
                <Sparkles size={isMobileApp ? 13 : 15} className="text-[#0284c7] shrink-0" />
                <span className="whitespace-nowrap">Collegamenti Diretti ai Riquadri Preventivi della Dashboard</span>
              </span>
              {!isMobileApp && (
                <span className="text-[12.5px] text-slate-500 font-medium whitespace-nowrap shrink-0" style={{ fontFamily: '"Switzer", sans-serif' }}>
                  Clicca su un riquadro per aprire le relative opportunità
                </span>
              )}
            </div>

            <div
              {...horizontalDragProps}
              className={`flex items-stretch ${isMobileApp ? 'gap-2' : 'gap-3.5'} overflow-x-auto pb-1 cursor-grab active:cursor-grabbing no-scrollbar select-none`}
              style={{
                touchAction: 'pan-x pan-y',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* 1. preventivi in scadenza */}
              <Link
                to="/opportunities"
                draggable={false}
                className={`flex-1 ${isMobileApp ? 'min-w-fit px-3 py-2.5' : 'min-w-fit px-4 py-3'} shrink-0 rounded-2xl border-2 transition-all hover:shadow-md block group cursor-pointer`}
                style={{
                  backgroundColor: '#fff5f5',
                  borderColor: '#fecaca',
                }}
                title="Apri i preventivi in scadenza nel CRM"
              >
                <div className="flex items-center justify-between gap-3 whitespace-nowrap">
                  <div className="flex items-center gap-2.5 whitespace-nowrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] flex-shrink-0" />
                    <div className="whitespace-nowrap">
                      <div
                        className={`${isMobileApp ? 'text-[13px]' : 'text-[15.5px]'} font-black text-slate-900 leading-tight whitespace-nowrap`}
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        preventivi in scadenza
                      </div>
                      <div
                        className={`${isMobileApp ? 'text-[11.5px]' : 'text-[13.5px]'} text-rose-700 font-bold whitespace-nowrap mt-0.5`}
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        Officine Riva • € 9.200 (Scade tra 2gg)
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-rose-500 flex-shrink-0" />
                </div>
              </Link>

              {/* 2. preventivi inviati */}
              <Link
                to="/opportunities"
                draggable={false}
                className={`flex-1 ${isMobileApp ? 'min-w-fit px-3 py-2.5' : 'min-w-fit px-4 py-3'} shrink-0 rounded-2xl border-2 transition-all hover:shadow-md block group cursor-pointer`}
                style={{
                  backgroundColor: '#f0f9ff',
                  borderColor: '#bae6fd',
                }}
                title="Apri i preventivi inviati nel CRM"
              >
                <div className="flex items-center justify-between gap-3 whitespace-nowrap">
                  <div className="flex items-center gap-2.5 whitespace-nowrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0084c8] flex-shrink-0" />
                    <div className="whitespace-nowrap">
                      <div
                        className={`${isMobileApp ? 'text-[13px]' : 'text-[15.5px]'} font-black text-slate-900 leading-tight whitespace-nowrap`}
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        preventivi inviati
                      </div>
                      <div
                        className={`${isMobileApp ? 'text-[11.5px]' : 'text-[13.5px]'} text-sky-700 font-bold whitespace-nowrap mt-0.5`}
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        Alpha Studio Milano • € 7.500 (Attivo)
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-sky-500 flex-shrink-0" />
                </div>
              </Link>

              {/* 3. ultimo preventivo */}
              <Link
                to="/opportunities"
                draggable={false}
                className={`flex-1 ${isMobileApp ? 'min-w-fit px-3 py-2.5' : 'min-w-fit px-4 py-3'} shrink-0 rounded-2xl border-2 transition-all hover:shadow-md block group cursor-pointer`}
                style={{
                  backgroundColor: '#effdf4',
                  borderColor: '#bbf7d0',
                }}
                title="Apri l'ultimo preventivo nel CRM"
              >
                <div className="flex items-center justify-between gap-3 whitespace-nowrap">
                  <div className="flex items-center gap-2.5 whitespace-nowrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#12b981] flex-shrink-0" />
                    <div className="whitespace-nowrap">
                      <div
                        className={`${isMobileApp ? 'text-[13px]' : 'text-[15.5px]'} font-black text-slate-900 leading-tight whitespace-nowrap`}
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        ultimo preventivo
                      </div>
                      <div
                        className={`${isMobileApp ? 'text-[11.5px]' : 'text-[13.5px]'} text-emerald-700 font-bold whitespace-nowrap mt-0.5`}
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        Tenuta Poggio Antico • € 3.200 (Nuovo)
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-emerald-500 flex-shrink-0" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALE / PANNELLO EDITOR PREVENTIVO STANDARD (FUTURISTICO CON TYPOGRAPHY MAGGIORATA) ── */}
      {selectedForQuote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedForQuote(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl border-2 border-sky-400 shadow-2xl p-6 flex flex-col max-h-[92vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{
              fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '16px'
            }}
          >
            {/* Header Modale Preventivo */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0284c7] flex items-center justify-center shadow-xs">
                  <FileText size={24} />
                </div>
                <div>
                  <h3
                    className="text-xl md:text-[22px] font-black text-slate-900 leading-tight"
                    style={{ fontFamily: '"Switzer", sans-serif' }}
                  >
                    Invia Preventivo con Testo Standard
                  </h3>
                  <p className="text-[15px] text-slate-500 font-medium" style={{ fontFamily: '"Switzer", sans-serif' }}>
                    Azienda: <strong>{selectedForQuote.name}</strong> • Referente: {selectedForQuote.contactPerson?.name} ({selectedForQuote.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForQuote(null)}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {quoteFeedback ? (
              <div className="py-12 flex flex-col items-center justify-center text-center animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3.5 shadow-sm">
                  <CheckCircle2 size={36} />
                </div>
                <h4
                  className="text-2xl font-black text-slate-900"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  Operazione Eseguita con Successo!
                </h4>
                <p className="text-[16px] text-slate-600 max-w-md mt-2 font-medium" style={{ fontFamily: '"Switzer", sans-serif' }}>
                  {quoteFeedback.message}
                </p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-4 custom-popup-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      className="text-[13.5px] font-black uppercase tracking-wider text-slate-500 block mb-1"
                      style={{ fontFamily: '"Switzer", sans-serif' }}
                    >
                      Destinatario Email
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={selectedForQuote.email}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-[15px] text-slate-700 font-bold"
                      style={{ fontFamily: '"Switzer", sans-serif' }}
                    />
                  </div>
                  <div>
                    <label
                      className="text-[13.5px] font-black uppercase tracking-wider text-slate-500 block mb-1"
                      style={{ fontFamily: '"Switzer", sans-serif' }}
                    >
                      Importo Preventivo Imponibile (€)
                    </label>
                    <input
                      type="text"
                      value={quoteAmount}
                      onChange={e => setQuoteAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#0284c7] text-[16px] text-[#0284c7] font-black focus:outline-none shadow-xs"
                      style={{ fontFamily: '"Switzer", sans-serif' }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="text-[13.5px] font-black uppercase tracking-wider text-slate-500 block mb-1"
                    style={{ fontFamily: '"Switzer", sans-serif' }}
                  >
                    Oggetto Email
                  </label>
                  <input
                    type="text"
                    value={quoteSubject}
                    onChange={e => setQuoteSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-[15.5px] text-slate-900 font-bold focus:outline-none focus:border-[#0284c7]"
                    style={{ fontFamily: '"Switzer", sans-serif' }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      className="text-[13.5px] font-black uppercase tracking-wider text-slate-500"
                      style={{ fontFamily: '"Switzer", sans-serif' }}
                    >
                      Corpo del Preventivo (Testo Standard DADO Creative Studio)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleCopy(quoteBody, 'quoteBody')}
                      className="text-[13.5px] font-bold text-[#0284c7] hover:underline flex items-center gap-1 cursor-pointer"
                      style={{ fontFamily: '"Switzer", sans-serif' }}
                    >
                      {copiedText === 'quoteBody' ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedText === 'quoteBody' ? 'Copiato!' : 'Copia Testo'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={12}
                    value={quoteBody}
                    onChange={e => setQuoteBody(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-300 text-[14.5px] text-slate-800 leading-relaxed focus:outline-none focus:border-[#0284c7] custom-popup-scrollbar"
                    style={{ fontFamily: '"Switzer", -apple-system, sans-serif' }}
                  />
                </div>

                <div className="pt-3.5 flex items-center justify-between gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={isSending}
                    onClick={() => handleSendQuote(true)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 text-[14.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    style={{ fontFamily: '"Switzer", sans-serif' }}
                  >
                    <FileCheck size={16} />
                    <span>Salva nelle Bozze CRM</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSending}
                    onClick={() => handleSendQuote(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-[15px] uppercase tracking-wider flex items-center gap-2.5 shadow-md transition-all transform active:scale-95 cursor-pointer"
                    style={{ fontFamily: '"Switzer", sans-serif' }}
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Invio in corso...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} className="stroke-[2.5]" />
                        <span>Invia Preventivo via Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
