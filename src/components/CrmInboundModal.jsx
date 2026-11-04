import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  Send,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  Plus,
  Globe,
  Tag,
  FileCheck
} from 'lucide-react'

// Template di Preventivo Standard professionale per DADO Creative Studio
const STANDARD_QUOTE_TEMPLATE = (companyName, contactName, need, budget) => `Gentile ${contactName || 'Referente'},

grazie per aver compilato il modulo di contatto sul sito ufficiale di DADO Creative Studio per ${companyName || 'la vostra azienda'}.

In merito alla vostra richiesta relativa a "${need || 'Produzione video corporate & shooting'}", abbiamo predisposto la seguente proposta di preventivo standard:

• Pacchetto Servizio: Produzione Video Corporate 4K HDR & Riprese Aeree con Drone
• Attrezzatura & Set: Sony FX3 Cinema Line, Set ottiche cinema prime, Drone DJI Mavic 3 Cine (piloti certificati ENAC), Microfoni wireless Sennheiser AVX
• Post-Produzione: Montaggio master broadcast, Color Grading DaVinci Resolve Studio, Sound Design e licenze musicali commerciali incluse
• Finestra di consegna: 10 giorni lavorativi dalla conclusione delle riprese
• Investimento complessivo: ${budget ? `€ ${budget}` : '€ 5.000'} + IVA (22%)
• Condizioni di pagamento: 50% alla conferma dell'ordine / stipula contratto, saldo alla consegna finale dei master 4K

Restiamo a vostra completa disposizione per un breve allineamento telefonico o una video-call su Google Meet per definire i dettagli operativi.

Un cordiale saluto,
Team Commerciale & Produzione
DADO Creative Studio — Milano
www.dadocreative.studio | info@dadocreative.studio`

export default function CrmInboundModal({ isOpen, onClose }) {
  const navigate = useNavigate()

  // Lista aziende registrate tramite modulo sito web
  const [companies, setCompanies] = useState([
    {
      id: 'inb-1',
      name: 'Solaris Green Energy',
      contactPerson: { name: 'Dott.ssa Chiara Valenti', role: 'Head of Brand Communication & ESG' },
      email: 'chiara.valenti@solarisenergy.it',
      phone: '+39 049 332211',
      channel: 'Inbound Form sito web',
      date: '2026-10-06',
      industry: 'Energie Rinnovabili & Agrivoltaico',
      need: 'Spot TV broadcast 30s + 4 Cut verticali per campagne digitali nuovo parco agrivoltaico',
      budget: '14.500',
      status: 'In attesa preventivo',
    },
    {
      id: 'inb-2',
      name: 'NextMedia Agency',
      contactPerson: { name: 'Sara Moretti', role: 'Creative Partner & Direzione Clienti' },
      email: 's.moretti@nextmedia.agency',
      phone: '+39 02 8765432',
      channel: 'Inbound Form sito web',
      date: '2026-10-05',
      industry: 'Agenzia di Comunicazione & Fashion',
      need: 'Riprese video corporate stabilimento con drone 4K indoor per brand moda',
      budget: '5.000',
      status: 'In elaborazione',
    },
    {
      id: 'inb-3',
      name: 'Fashion Brand Milano',
      contactPerson: { name: 'Matteo Colombo', role: 'Marketing & Brand Manager' },
      email: 'm.colombo@fashionbrand.it',
      phone: '+39 02 4455667',
      channel: 'Inbound Form sito web',
      date: '2026-10-04',
      industry: 'Moda & Lifestyle B2B',
      need: 'Produzione video lookbook collezione invernale e reel Instagram',
      budget: '6.800',
      status: 'In attesa preventivo',
    },
    {
      id: 'inb-4',
      name: 'Kroma Ceramiche',
      contactPerson: { name: 'Ing. Roberto Ferri', role: 'Responsabile Marketing Prodotto' },
      email: 'r.ferri@kromaceramiche.it',
      phone: '+39 0536 908123',
      channel: 'Inbound Form sito web',
      date: '2026-10-02',
      industry: 'Design & Ceramica Industriale',
      need: 'Rendering 3D catalogo e video still life ambientazioni fotorealistiche',
      budget: '5.400',
      status: 'Preventivo inviato',
    },
  ])

  // Stato per la composizione/invio preventivo
  const [selectedCompanyForQuote, setSelectedCompanyForQuote] = useState(null)
  const [quoteSubject, setQuoteSubject] = useState('')
  const [quoteBody, setQuoteBody] = useState('')
  const [quoteAmount, setQuoteAmount] = useState('5.000')
  const [sentFeedback, setSentFeedback] = useState(null)
  const [isSending, setIsSending] = useState(false)

  // Modale per nuova registrazione dal modulo sito
  const [showSimulateForm, setShowSimulateForm] = useState(false)
  const [simFormData, setSimFormData] = useState({
    name: '',
    contactName: '',
    role: '',
    email: '',
    phone: '',
    industry: '',
    need: '',
    budget: '',
  })

  // Sincronizza con i dati reali del CRM se disponibili
  useEffect(() => {
    if (!isOpen) return
    fetch('/api/crm/summary')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.companies)) {
          // Filtra aziende che contengono "sito" o "inbound" nel canale
          const inboundFromCrm = data.companies.filter(c => {
            const ch = (c.firstContact?.channel || '').toLowerCase()
            return ch.includes('sito') || ch.includes('form') || ch.includes('inbound')
          }).map(c => ({
            id: c.id,
            name: c.name,
            contactPerson: {
              name: c.contactPerson?.name || (typeof c.contactPerson === 'string' ? c.contactPerson : 'Referente'),
              role: c.contactPerson?.role || 'Referente Aziendale'
            },
            email: c.contact?.directEmail || c.contact?.email || '',
            phone: c.contact?.phone || c.contact?.mobile || '',
            channel: c.firstContact?.channel || 'Inbound Form sito web',
            date: c.firstContact?.date || '2026-10-01',
            industry: c.industry || 'Settore B2B',
            need: c.firstContact?.notes || c.requestedMaterials?.[0] || 'Richiesta servizi video e preventivo',
            budget: c.compensation?.amount ? String(c.compensation.amount) : (c.bant?.budget ? c.bant.budget.replace(/[^0-9\.]/g, '') : '5.000'),
            status: c.status || 'In attesa preventivo',
          }))

          if (inboundFromCrm.length > 0) {
            setCompanies(prev => {
              const ids = new Set(inboundFromCrm.map(x => x.id))
              const combined = [...inboundFromCrm, ...prev.filter(x => !ids.has(x.id))]
              return combined
            })
          }
        }
      })
      .catch(() => {})
  }, [isOpen])

  // ESC listener per chiudere la modale
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Apertura editor preventivo standard per un'azienda
  function handleOpenQuoteEditor(comp) {
    setSelectedCompanyForQuote(comp)
    const amountClean = comp.budget ? comp.budget.replace(/[^0-9\.]/g, '') : '5.000'
    setQuoteAmount(amountClean || '5.000')
    setQuoteSubject(`Proposta Preventivo per ${comp.name} — DADO Creative Studio`)
    setQuoteBody(STANDARD_QUOTE_TEMPLATE(comp.name, comp.contactPerson?.name, comp.need, amountClean || '5.000'))
    setSentFeedback(null)
  }

  // Invio preventivo
  function handleSendQuote(asDraft = false) {
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      // Aggiorna lo stato dell'azienda
      setCompanies(prev =>
        prev.map(c =>
          c.id === selectedCompanyForQuote.id
            ? { ...c, status: asDraft ? 'Bozza preventivo pronta' : 'Preventivo inviato' }
            : c
        )
      )
      setSentFeedback({
        type: asDraft ? 'draft' : 'sent',
        message: asDraft
          ? `Bozza del preventivo per ${selectedCompanyForQuote.name} salvata con successo nel CRM!`
          : `Preventivo standard (€ ${quoteAmount}) inviato con successo a ${selectedCompanyForQuote.email}!`,
      })
      setTimeout(() => {
        setSelectedCompanyForQuote(null)
        setSentFeedback(null)
      }, 2200)
    }, 700)
  }

  // Aggiungi nuova simulazione registrazione dal sito
  function handleAddSimulatedCompany(e) {
    e.preventDefault()
    if (!simFormData.name.trim()) return

    const newComp = {
      id: `inb-${Date.now()}`,
      name: simFormData.name.trim(),
      contactPerson: {
        name: simFormData.contactName.trim() || 'Referente Direzione',
        role: simFormData.role.trim() || 'Marketing Manager'
      },
      email: simFormData.email.trim() || 'info@azienda.it',
      phone: simFormData.phone.trim() || '+39 02 1234567',
      channel: 'Inbound Form sito web',
      date: new Date().toISOString().split('T')[0],
      industry: simFormData.industry.trim() || 'B2B & Commercial',
      need: simFormData.need.trim() || 'Richiesta informazioni e preventivo spot video',
      budget: simFormData.budget.trim() || '5.000',
      status: 'In attesa preventivo',
    }

    setCompanies([newComp, ...companies])
    setShowSimulateForm(false)
    setSimFormData({ name: '', contactName: '', role: '', email: '', phone: '', industry: '', need: '', budget: '' })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden border shadow-2xl transition-all"
        style={{
          backgroundColor: '#0c121e',
          borderColor: 'rgba(0, 210, 255, 0.45)',
          boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 210, 255, 0.22)',
          fontFamily: '"Switzer", sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER MODALE ── */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b flex-shrink-0"
          style={{
            backgroundColor: '#111a2c',
            borderColor: 'rgba(0, 210, 255, 0.25)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shadow-lg">
              <span
                style={{
                  fontFamily: '"Switzer", sans-serif',
                  color: '#00d2ff',
                  fontSize: '13px',
                  fontWeight: 900,
                  letterSpacing: '0.05em',
                  textShadow: '0 0 10px rgba(0, 210, 255, 0.8)',
                }}
              >
                CRM
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  DADO CRM • Portale Inbound & Preventivi
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  Modulo Sito Web
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Aziende registrate tramite il form di dadocreative.studio • Invio preventivi standard e collegamenti rapidi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSimulateForm(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 hover:text-white border border-cyan-500/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Registra una richiesta inbound da form web"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>+ Simula Form Sito</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
              title="Chiudi finestra (ESC)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── COLLEGAMENTO AI RIQUADRI DELLA DASHBOARD (Sezione Fissa in Alto) ── */}
        <div
          className="px-6 py-3.5 border-b flex-shrink-0"
          style={{
            backgroundColor: '#0e1626',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles size={12} className="text-cyan-400" />
              Collegamenti Diretti ai Riquadri della Dashboard
            </span>
            <button
              type="button"
              onClick={() => {
                onClose()
                navigate('/')
              }}
              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Vai alla Dashboard Principale</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Preventivi in scadenza (Rosso tenue coordinato) */}
            <div
              onClick={() => {
                onClose()
                navigate('/opportunities')
              }}
              className="p-3 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] flex items-center justify-between"
              style={{
                backgroundColor: '#1a1016',
                borderColor: 'rgba(239, 68, 68, 0.45)',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.12)',
              }}
              title="Apri i preventivi in scadenza nel CRM"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] flex-shrink-0 group-hover:scale-125 transition-transform" />
                <div className="truncate">
                  <div className="text-[13px] font-black text-rose-200 group-hover:text-white leading-tight">
                    preventivi in scadenza
                  </div>
                  <div className="text-[11px] font-semibold text-rose-300/80 truncate">
                    Officine Riva • € 9.200 (2gg)
                  </div>
                </div>
              </div>
              <ArrowUpRight size={14} className="text-rose-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </div>

            {/* 2. Preventivi inviati (Celeste tenue coordinato) */}
            <div
              onClick={() => {
                onClose()
                navigate('/opportunities')
              }}
              className="p-3 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] flex items-center justify-between"
              style={{
                backgroundColor: '#0c1b2c',
                borderColor: 'rgba(0, 132, 200, 0.45)',
                boxShadow: '0 4px 14px rgba(0, 132, 200, 0.12)',
              }}
              title="Apri i preventivi inviati nel CRM"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0084c8] flex-shrink-0 group-hover:scale-125 transition-transform" />
                <div className="truncate">
                  <div className="text-[13px] font-black text-sky-200 group-hover:text-white leading-tight">
                    preventivi inviati
                  </div>
                  <div className="text-[11px] font-semibold text-sky-300/80 truncate">
                    Alpha Studio • € 7.500 (Attivo)
                  </div>
                </div>
              </div>
              <ArrowUpRight size={14} className="text-sky-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </div>

            {/* 3. Ultimo preventivo (Verde tenue coordinato) */}
            <div
              onClick={() => {
                onClose()
                navigate('/opportunities')
              }}
              className="p-3 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] flex items-center justify-between"
              style={{
                backgroundColor: '#0c221a',
                borderColor: 'rgba(18, 185, 129, 0.45)',
                boxShadow: '0 4px 14px rgba(18, 185, 129, 0.12)',
              }}
              title="Apri l'ultimo preventivo nel CRM"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#12b981] flex-shrink-0 group-hover:scale-125 transition-transform" />
                <div className="truncate">
                  <div className="text-[13px] font-black text-emerald-200 group-hover:text-white leading-tight">
                    ultimo preventivo
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-300/80 truncate">
                    Tenuta Poggio Antico • € 3.200
                  </div>
                </div>
              </div>
              <ArrowUpRight size={14} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* ── CONTENUTO SCROLLABILE: LISTA AZIENDE MODULO SITO ── */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 custom-popup-scrollbar">
          {companies.map(comp => (
            <div
              key={comp.id}
              className="p-4 sm:p-5 rounded-2xl border transition-all hover:border-cyan-400/60"
              style={{
                backgroundColor: '#101a2e',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Info Azienda & Referente */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-black text-white tracking-tight">
                      {comp.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center gap-1">
                      <Globe size={11} />
                      {comp.channel}
                    </span>
                    <span className="text-xs text-slate-400">
                      Reg: {comp.date}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      comp.status === 'Preventivo inviato'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {comp.status}
                    </span>
                  </div>

                  {/* Referente & Contatti */}
                  <div className="mt-2 flex items-center gap-4 flex-wrap text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <span>👤 {comp.contactPerson?.name}</span>
                      <span className="text-slate-400 font-normal">({comp.contactPerson?.role})</span>
                    </div>
                    {comp.email && (
                      <div className="flex items-center gap-1 text-cyan-300">
                        <Mail size={12} />
                        <a href={`mailto:${comp.email}`} className="hover:underline">{comp.email}</a>
                      </div>
                    )}
                    {comp.phone && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Phone size={12} />
                        <span>{comp.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Esigenza & Richiesta */}
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Richiesta estratta dal modulo sito:
                    </div>
                    <div className="font-medium text-slate-200">
                      "{comp.need}"
                    </div>
                  </div>
                </div>

                {/* Importo & Azione Invio Preventivo Standard */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Budget Previsto
                    </span>
                    <span className="text-xl font-black text-cyan-400 tabular-nums">
                      € {comp.budget ? Number(comp.budget).toLocaleString('it-IT') : '5.000'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenQuoteEditor(comp)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-cyan-500/25 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <Send size={14} className="stroke-[2.5]" />
                    <span>Invia Preventivo Standard</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MODALE / CASSETTO COMPOSIZIONE PREVENTIVO STANDARD ── */}
        {selectedCompanyForQuote && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
            onClick={() => setSelectedCompanyForQuote(null)}
          >
            <div
              className="w-full max-w-2xl bg-[#0f172a] rounded-2xl border border-cyan-400/60 shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      Predisposizione Preventivo Standard
                    </h3>
                    <p className="text-xs text-slate-400">
                      Destinatario: {selectedCompanyForQuote.name} ({selectedCompanyForQuote.contactPerson?.name})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCompanyForQuote(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {sentFeedback ? (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-lg font-black text-white">Operazione Completata!</h4>
                  <p className="text-sm text-slate-300 max-w-md mt-1">
                    {sentFeedback.message}
                  </p>
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-3.5 custom-popup-scrollbar">
                  {/* Campi Rapidi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Destinatario Email
                      </label>
                      <input
                        type="text"
                        value={selectedCompanyForQuote.email}
                        readOnly
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Importo Imponibile (€)
                      </label>
                      <input
                        type="text"
                        value={quoteAmount}
                        onChange={e => setQuoteAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-cyan-500/60 text-xs text-cyan-300 font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Oggetto Email
                    </label>
                    <input
                      type="text"
                      value={quoteSubject}
                      onChange={e => setQuoteSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center justify-between">
                      <span>Corpo del Preventivo (Testo Standard DADO)</span>
                      <span className="text-cyan-400 text-[10px]">Formato standard pronto all'invio</span>
                    </label>
                    <textarea
                      rows={11}
                      value={quoteBody}
                      onChange={e => setQuoteBody(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-400 custom-popup-scrollbar"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() => handleSendQuote(true)}
                      className="px-4 py-2.5 rounded-xl border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FileCheck size={14} />
                      <span>Salva nelle Bozze CRM</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() => handleSendQuote(false)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer transition-all transform active:scale-95"
                    >
                      {isSending ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Invio in corso...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} className="stroke-[2.5]" />
                          <span>Invia Preventivo Adesso</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODALE SIMULAZIONE REGISTRAZIONE DAL MODULO DEL SITO ── */}
        {showSimulateForm && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
            onClick={() => setShowSimulateForm(false)}
          >
            <form
              onSubmit={handleAddSimulatedCompany}
              className="w-full max-w-lg bg-[#0f172a] rounded-2xl border border-cyan-500/50 p-6 space-y-3.5 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Globe size={18} className="text-cyan-400" />
                  <span>Nuova Registrazione da Modulo Sito Web</span>
                </div>
                <button type="button" onClick={() => setShowSimulateForm(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Nome Azienda</label>
                <input
                  required
                  type="text"
                  placeholder="es. Officine Meccaniche Ferrari SpA"
                  value={simFormData.name}
                  onChange={e => setSimFormData({ ...simFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Nome Referente</label>
                  <input
                    type="text"
                    placeholder="es. Marco Riva"
                    value={simFormData.contactName}
                    onChange={e => setSimFormData({ ...simFormData, contactName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Ruolo Referente</label>
                  <input
                    type="text"
                    placeholder="es. Managing Director"
                    value={simFormData.role}
                    onChange={e => setSimFormData({ ...simFormData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="m.riva@azienda.it"
                    value={simFormData.email}
                    onChange={e => setSimFormData({ ...simFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Telefono</label>
                  <input
                    type="text"
                    placeholder="+39 02 1234567"
                    value={simFormData.phone}
                    onChange={e => setSimFormData({ ...simFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Settore</label>
                  <input
                    type="text"
                    placeholder="es. Manifattura & B2B"
                    value={simFormData.industry}
                    onChange={e => setSimFormData({ ...simFormData, industry: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Budget Indicativo (€)</label>
                  <input
                    type="text"
                    placeholder="es. 8.500"
                    value={simFormData.budget}
                    onChange={e => setSimFormData({ ...simFormData, budget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Messaggio / Esigenza dal modulo</label>
                <textarea
                  rows={3}
                  placeholder="Descrizione delle riprese richieste, location o format..."
                  value={simFormData.need}
                  onChange={e => setSimFormData({ ...simFormData, need: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateForm(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Aggiungi ai Lead Sito
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
