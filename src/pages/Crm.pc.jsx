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
import TopBarUserProfile from '../components/TopBarUserProfile'
import CrmFuturisticLogo from '../components/CrmFuturisticLogo'

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
      {/* ── CANVAS PRINCIPALE: STESSA GRANDEZZA E DESIGN DELLA DASHBOARD ── */}
      <div
        className="h-full flex-1 rounded-tl-none rounded-bl-[48px] flex flex-col justify-between relative min-w-0 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #f0f8fd 0%, #e5f3fa 100%)',
          borderLeft: '1.5px solid #d4ebf9',
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
          borderTopLeftRadius: '0px',
        }}
      >
        <div className="flex-1 min-h-0 px-4 md:px-7 py-4 overflow-y-auto custom-popup-scrollbar flex flex-col gap-5">

          {/* ── TESTATA PORTALE CRM: Titolo in Switzer con Colore Sidebar per CRM e Barra di Ricerca ── */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-sky-300/80 shrink-0">
            <div>
              <div className="flex items-center gap-3.5 flex-wrap">
                <CrmFuturisticLogo
                  isActive={true}
                  width={104}
                  height={28}
                  className="shrink-0"
                />
                <span
                  className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  Richieste Modulo Sito & Lead Inbound
                </span>
                <span
                  className="px-3 py-1 rounded-full text-[13.5px] font-bold bg-[#0284c7] text-white shadow-sm flex items-center gap-1.5"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  <Activity size={14} className="animate-pulse" />
                  {filteredLeads.length} Lead Inbound
                </span>
              </div>
              <p
                className="text-[15.5px] text-slate-600 font-semibold mt-1.5 leading-relaxed"
                style={{ fontFamily: '"Switzer", sans-serif' }}
              >
                Gestione completa delle richieste inviate dal form dadocreative.studio • Contatto diretto (Telefono, Meet, WhatsApp) e preventivi standard
              </p>

              {/* Voci di selezione rapida nella schermata CRM */}
              <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPipelineStage(null)
                    document.getElementById('crm-leads-list')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-[13.5px] font-black flex items-center gap-2 border transition-all cursor-pointer bg-white hover:bg-sky-50 text-slate-800 border-sky-300 shadow-xs hover:border-[#0284c7]"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  <Mail size={14} className="text-[#0284c7]" />
                  <span>Richieste Form Sito</span>
                  <span className="bg-sky-100 text-[#0284c7] px-2 py-0.5 rounded-md text-[12px]">
                    {inboundLeads.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('crm-pipeline-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-[13.5px] font-black flex items-center gap-2 border transition-all cursor-pointer bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-900 border-emerald-400 hover:bg-emerald-500/25 shadow-xs"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  <TrendingUp size={14} className="text-emerald-600 stroke-[2.5]" />
                  <span>Voce Pipeline</span>
                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[12px] font-bold">
                    6 Fasi
                  </span>
                </button>

                <Link
                  to="/opportunities"
                  className="px-3.5 py-1.5 rounded-xl text-[13.5px] font-black flex items-center gap-1.5 border transition-all cursor-pointer bg-white text-purple-800 border-purple-300 hover:border-purple-500 hover:bg-purple-50 shadow-xs"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                  title="Apri Tabellone Kanban Completo con istogramma mensile"
                >
                  <Layers size={14} className="text-purple-600" />
                  <span>Kanban Pipeline</span>
                  <ArrowUpRight size={13} className="text-purple-600" />
                </Link>
              </div>
            </div>

            {/* Barra di Ricerca Ingrandita */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0284c7] stroke-[2.5]" />
                <input
                  type="text"
                  placeholder="Cerca azienda, referente o servizio..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white border-2 border-[#0284c7] focus:border-[#0369a1] rounded-full pl-11 pr-10 py-2.5 text-[15px] text-slate-900 placeholder-slate-400 font-bold focus:outline-none shadow-sm transition-all"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

              {/* ── RIQUADRO PIPELINE COMMERCIALE TRATTATIVE (FUTURISTICO, INTERATTIVO & CONVERSIONI) ── */}
              <div
                id="crm-pipeline-section"
                className="p-4 md:p-5 rounded-3xl bg-white border-2 border-sky-300 shadow-[0_4px_20px_rgba(2,132,199,0.12)] shrink-0 transition-all relative overflow-hidden"
              >
            {/* Header del Riquadro Pipeline */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-3.5 border-b border-sky-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white flex items-center justify-center shadow-sm">
                  <TrendingUp size={20} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-wider"
                      style={{ fontFamily: '"Switzer", sans-serif' }}
                    >
                      Pipeline Trattative Commerciali
                    </h3>
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[13px] font-black bg-sky-100 text-[#0284c7] border border-sky-200 uppercase"
                      style={{ fontFamily: '"Switzer", sans-serif' }}
                    >
                      Funnel Produzioni Video & Foto
                    </span>
                  </div>
                  <p className="text-[14.5px] text-slate-500 font-medium" style={{ fontFamily: '"Switzer", sans-serif' }}>
                    Clicca su una fase della pipeline per filtrare i lead corrispondenti o apri il tabellone completo.
                  </p>
                </div>
              </div>

              {/* Indicatori Sintetici Pipeline (KPI Ponderato & Link Completo) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div
                  className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[14px] font-bold flex items-center gap-2"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  <span className="text-slate-400">Valore Ponderato:</span>
                  <span className="text-[#0284c7] font-black text-[16px]">€ 126.1k</span>
                </div>

                <Link
                  to="/opportunities"
                  className="px-3.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-[14px] font-black flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                  title="Apri gestione completa della Pipeline Opportunità"
                >
                  <span>Tabellone Kanban Completo</span>
                  <ArrowUpRight size={16} />
                </Link>

                {selectedPipelineStage && (
                  <button
                    type="button"
                    onClick={() => setSelectedPipelineStage(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-[13.5px] font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <X size={14} />
                    <span>Azzera Filtro Fase</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tracciamento Visuale a 6 Fasi della Pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {PIPELINE_STAGES.map((stg) => {
                const isSelected = selectedPipelineStage === stg.id
                return (
                  <div
                    key={stg.id}
                    onClick={() => setSelectedPipelineStage(isSelected ? null : stg.id)}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected
                        ? 'ring-2 ring-offset-1 scale-[1.03] shadow-md'
                        : 'hover:scale-[1.02] hover:shadow-sm'
                    }`}
                    style={{
                      backgroundColor: stg.bg,
                      borderColor: isSelected ? stg.color : stg.accentBorder,
                      ringColor: stg.color,
                    }}
                    title={`Fase: ${stg.label} (${stg.sub}) • Clicca per filtrare`}
                  >
                    <div>
                      {/* Riga Superiore: Step e Probabilità */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className="text-[13px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md text-white shadow-2xs"
                          style={{
                            backgroundColor: stg.color,
                            fontFamily: '"Switzer", sans-serif'
                          }}
                        >
                          {stg.step}
                        </span>
                        <span
                          className="text-[13px] font-bold"
                          style={{
                            color: stg.color,
                            fontFamily: '"Switzer", sans-serif'
                          }}
                        >
                          {stg.probability}%
                        </span>
                      </div>

                      {/* Nome Fase */}
                      <div
                        className="text-[15.5px] font-black text-slate-900 leading-tight mt-1"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        {stg.label}
                      </div>
                      <div className="text-[13px] text-slate-500 font-medium leading-snug truncate" style={{ fontFamily: '"Switzer", sans-serif' }}>
                        {stg.sub}
                      </div>
                    </div>

                    {/* Dati Economici e Numero Trattative */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[13.5px]">
                      <span className="font-bold text-slate-700">
                        {stg.dealsCount} deal
                      </span>
                      <span
                        className="font-black text-[14.5px]"
                        style={{
                          color: stg.color,
                          fontFamily: '"Switzer", sans-serif'
                        }}
                      >
                        € {stg.totalEur}
                      </span>
                    </div>

                    {/* Barra di Avanzamento Probabilità Futuristica */}
                    <div className="w-full h-1.5 bg-black/10 rounded-full mt-2 overflow-hidden">
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

          {/* ── COLLEGAMENTO AI RIQUADRI DELLA DASHBOARD ── */}
          <div className="p-4 rounded-3xl bg-white/95 border border-[#cce5f6] shadow-xs shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <span
                className="text-[14.5px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-2"
                style={{ fontFamily: '"Switzer", sans-serif' }}
              >
                <Sparkles size={16} className="text-[#0284c7]" />
                Collegamenti Diretti ai Riquadri Preventivi della Dashboard
              </span>
              <span className="text-[14px] text-slate-500 font-medium hidden sm:inline" style={{ fontFamily: '"Switzer", sans-serif' }}>
                Clicca su un riquadro per aprire le relative opportunità nel CRM
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* 1. preventivi in scadenza */}
              <Link
                to="/opportunities"
                className="px-4 py-3.5 rounded-2xl border-2 transition-all hover:scale-[1.01] hover:shadow-md block group cursor-pointer"
                style={{
                  backgroundColor: '#fff5f5',
                  borderColor: '#fecaca',
                }}
                title="Apri i preventivi in scadenza nel CRM"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-3 h-3 rounded-full bg-[#ef4444] flex-shrink-0 group-hover:scale-125 transition-transform" />
                    <div className="truncate">
                      <div
                        className="text-[17px] font-black text-slate-900 leading-tight"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        preventivi in scadenza
                      </div>
                      <div
                        className="text-[14.5px] text-rose-700 font-bold truncate mt-0.5"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        Officine Riva • € 9.200 (Scade tra 2gg)
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight size={18} className="text-rose-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
                </div>
              </Link>

              {/* 2. preventivi inviati */}
              <Link
                to="/opportunities"
                className="px-4 py-3.5 rounded-2xl border-2 transition-all hover:scale-[1.01] hover:shadow-md block group cursor-pointer"
                style={{
                  backgroundColor: '#f0f9ff',
                  borderColor: '#bae6fd',
                }}
                title="Apri i preventivi inviati nel CRM"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-3 h-3 rounded-full bg-[#0084c8] flex-shrink-0 group-hover:scale-125 transition-transform" />
                    <div className="truncate">
                      <div
                        className="text-[17px] font-black text-slate-900 leading-tight"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        preventivi inviati
                      </div>
                      <div
                        className="text-[14.5px] text-sky-700 font-bold truncate mt-0.5"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        Alpha Studio Milano • € 7.500 (Attivo)
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight size={18} className="text-sky-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
                </div>
              </Link>

              {/* 3. ultimo preventivo */}
              <Link
                to="/opportunities"
                className="px-4 py-3.5 rounded-2xl border-2 transition-all hover:scale-[1.01] hover:shadow-md block group cursor-pointer"
                style={{
                  backgroundColor: '#effdf4',
                  borderColor: '#bbf7d0',
                }}
                title="Apri l'ultimo preventivo nel CRM"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-3 h-3 rounded-full bg-[#12b981] flex-shrink-0 group-hover:scale-125 transition-transform" />
                    <div className="truncate">
                      <div
                        className="text-[17px] font-black text-slate-900 leading-tight"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        ultimo preventivo
                      </div>
                      <div
                        className="text-[14.5px] text-emerald-700 font-bold truncate mt-0.5"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        Tenuta Poggio Antico • € 3.200 (Nuovo)
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight size={18} className="text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
                </div>
              </Link>
            </div>
          </div>

          {/* ── LISTA AZIENDE CON DETTAGLI COMPLETI DEL MODULO SITO (FONT FUTURISTICO & INGRANDITO) ── */}
          <div id="crm-leads-list" className="space-y-5 pb-10">
            {filteredLeads.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-sky-300 text-center">
                <p className="text-[17px] text-slate-500 font-bold">
                  Nessun lead trovato con i filtri selezionati.
                </p>
                {selectedPipelineStage && (
                  <button
                    onClick={() => setSelectedPipelineStage(null)}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#0284c7] text-white text-[15px] font-bold cursor-pointer hover:bg-[#0369a1]"
                  >
                    Mostra tutte le fasi della Pipeline
                  </button>
                )}
              </div>
            ) : (
              filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  className="bg-white rounded-3xl border-2 border-sky-200 hover:border-sky-400 p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4.5"
                >
                  {/* 1. Riga Superiore: Intestazione Azienda, Canale Inbound, Data e Stato */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200">
                    <div className="flex items-center gap-3.5 flex-wrap">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-black text-base flex items-center justify-center shadow-sm">
                        <span style={{ fontFamily: '"Switzer", sans-serif' }}>
                          {lead.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2
                            className="text-xl md:text-[23px] font-black text-slate-900 leading-tight"
                            style={{ fontFamily: '"Switzer", sans-serif' }}
                          >
                            {lead.name}
                          </h2>
                          <span
                            className="px-2.5 py-1 rounded-lg text-[13.5px] font-bold bg-sky-100 text-[#0284c7] border border-sky-300 flex items-center gap-1.5"
                            style={{ fontFamily: '"Switzer", sans-serif' }}
                          >
                            <Globe size={13} />
                            Inbound Form Sito Web
                          </span>
                          <span
                            className="text-[14.5px] text-slate-400 font-bold"
                            style={{ fontFamily: '"Switzer", sans-serif' }}
                          >
                            {lead.date} alle {lead.time || '10:00'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3.5 text-[15px] text-slate-600 mt-1 flex-wrap font-medium">
                          <span>Settore: <strong className="text-slate-800">{lead.industry}</strong></span>
                          {lead.location && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin size={14} className="text-slate-600" />
                              {lead.location}
                            </span>
                          )}
                          {lead.vatNumber && (
                            <span
                              className="font-bold text-slate-600"
                              style={{ fontFamily: '"Switzer", sans-serif' }}
                            >
                              P.IVA: {lead.vatNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Budget & Badge Stato */}
                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <span
                          className="text-[13.5px] font-bold uppercase tracking-wider text-slate-400 block"
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          Budget Selezionato
                        </span>
                        <span
                          className="text-xl md:text-[23px] font-black text-[#0284c7]"
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          € {Number(lead.budget.replace(/[^0-9\.]/g, '')).toLocaleString('it-IT')}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-xl text-[14.5px] font-black ${
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

                  {/* 2. Dettagli del Modulo Compilato per la Richiesta Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Colonna Referente e Recapiti */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] flex flex-col justify-between">
                      <div>
                        <span
                          className="text-[13.5px] font-black uppercase tracking-wider text-slate-500 block mb-1"
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          Referente & Decision Maker
                        </span>
                        <div
                          className="font-black text-slate-900 text-[17px]"
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          {lead.contactPerson?.name}
                        </div>
                        <div className="text-slate-600 font-semibold text-[14.5px]" style={{ fontFamily: '"Switzer", sans-serif' }}>
                          {lead.contactPerson?.role}
                        </div>
                      </div>
                      <div
                        className="mt-3 pt-2.5 border-t border-slate-200 space-y-1.5 text-[14.5px]"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        <div className="text-sky-700 truncate font-bold">
                          ✉️ {lead.email}
                        </div>
                        <div className="text-slate-700 font-semibold">
                          📞 Ufficio: {lead.phone}
                        </div>
                        {lead.mobile && (
                          <div className="text-emerald-700 font-bold">
                            📱 Mobile: {lead.mobile}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Colonna Servizi Selezionati & Tempistica */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] flex flex-col justify-between">
                      <div>
                        <span
                          className="text-[13.5px] font-black uppercase tracking-wider text-slate-500 block mb-1"
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          Servizi Selezionati nel Modulo
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {(lead.selectedServices || []).map((srv, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 text-[13.5px] font-bold shadow-2xs"
                              style={{ fontFamily: '"Switzer", sans-serif' }}
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[14.5px]">
                        <span className="text-slate-600 font-medium">Tempistica desiderata:</span>
                        <span
                          className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-300"
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          ⏱️ {lead.timeline || 'Entro 2 settimane'}
                        </span>
                      </div>
                    </div>

                    {/* Colonna Messaggio Richiesta del Cliente */}
                    <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-[15px] flex flex-col justify-between">
                      <div>
                        <span
                          className="text-[13.5px] font-black uppercase tracking-wider text-[#0284c7] block mb-1"
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          Messaggio Inviato dal Modulo Sito
                        </span>
                        <p className="text-slate-800 italic leading-relaxed text-[15px]" style={{ fontFamily: '"Switzer", sans-serif' }}>
                          "{lead.formMessage}"
                        </p>
                      </div>
                      <div className="mt-2.5 text-right">
                        <span
                          className="text-[13px] text-slate-400 font-bold"
                          style={{ fontFamily: '"Switzer", sans-serif' }}
                        >
                          IP Verificato • Form dadocreative.studio
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Barra delle Azioni Dirette: Chiamata, Call Meet, WhatsApp e Preventivo Standard */}
                  <div className="flex flex-wrap items-center justify-between gap-3.5 pt-3.5 border-t border-slate-200">
                    {/* Gruppo Canali di Contatto Immediato */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className="text-[14px] font-black uppercase tracking-wider text-slate-500 mr-1"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                      >
                        Contatta Subito:
                      </span>

                      {/* 1. CHIAMATA TELEFONICA */}
                      <a
                        href={`tel:${(lead.mobile || lead.phone || '').replace(/\s+/g, '')}`}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[15px] flex items-center gap-2 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                        title={`Avvia chiamata telefonica a ${lead.contactPerson?.name} (${lead.mobile || lead.phone})`}
                      >
                        <PhoneCall size={16} className="text-[#0284c7]" />
                        <span>Chiama ({lead.mobile || lead.phone})</span>
                      </a>

                      {/* 2. CALL SU GOOGLE MEET */}
                      <a
                        href="https://meet.google.com/dado-creative-studio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-[15px] flex items-center gap-2 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                        title="Avvia o condividi la stanza Google Meet dedicata DADO Creative Studio"
                      >
                        <Video size={16} className="text-blue-600" />
                        <span>Call su Meet</span>
                      </a>

                      {/* 3. WHATSAPP DIRETTO CON MESSAGGIO PRE-COMPILATO */}
                      <a
                        href={getWhatsAppUrl(lead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[15px] flex items-center gap-2 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                        title="Apri chat WhatsApp con messaggio di presentazione pre-compilato"
                      >
                        <MessageCircle size={16} className="text-[#25D366] fill-[#25D366]" />
                        <span>WhatsApp Diretto</span>
                      </a>
                    </div>

                    {/* Pulsante Azione Principale: Invia Preventivo Standard */}
                    <button
                      type="button"
                      onClick={() => handleOpenQuote(lead)}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-[#0284c7] hover:from-sky-500 hover:to-[#0369a1] text-white font-black text-[15px] uppercase tracking-wider flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
                      style={{ fontFamily: '"Switzer", sans-serif' }}
                      title="Predisponi e invia preventivo con testo standard DADO"
                    >
                      <Send size={16} className="stroke-[2.5]" />
                      <span>Invia Preventivo Standard</span>
                    </button>
                  </div>
                </div>
              ))
            )}
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
