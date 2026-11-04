import { useState } from 'react'
import {
  Globe,
  Bot,
  Building2,
  Sparkles,
  Mail,
  Repeat,
  Calendar,
  Clock,
  Video,
  ShieldCheck,
  FileText,
  X,
  CheckCircle2,
  ChevronRight,
  ArrowDown,
  Layers,
  Zap,
  Copy,
  Check,
  ExternalLink,
  SlidersHorizontal,
  Flame,
  Snowflake,
  ShieldAlert,
} from 'lucide-react'

const ICON_MAP = {
  Globe,
  Bot,
  Building2,
  Sparkles,
  Mail,
  Repeat,
  Calendar,
  Clock,
  Video,
  ShieldCheck,
  FileText,
}

const WORKFLOW_STEPS = [
  {
    id: 'step-1',
    phase: 'Fase 1 • Acquisizione',
    category: 'inbound',
    title: 'Multi-Canale Inbound & Outbound',
    subtitle: 'Web Form, Instagram/TikTok DM, Referral, Cold Email, Eventi',
    badge: 'Ingresso Dati',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    iconName: 'Globe',
    type: 'trigger',
    summary: 'Centralizzazione omnicanale di tutte le richieste in ingresso.',
    details: 'Tutti i messaggi, form del sito, DM Instagram e referral vengono catturati in tempo reale e convogliati nel database del CRM con timestamp e sorgente tracciata.',
    aiRole: 'Ascolto continuo webhook, API e caselle mail studio.',
    output: 'Lead grezzo salvato con canale di provenienza.',
  },
  {
    id: 'step-2',
    phase: 'Fase 2 • Normalizzazione',
    category: 'ai_process',
    title: 'Ingestione Automatica Lead (Parser AI)',
    subtitle: 'Estrazione referenti, contatti, azienda e brief preliminare',
    badge: 'AI Gemini / Parser',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconName: 'Bot',
    type: 'ai_action',
    summary: 'Lettura semantica del testo non strutturato con modello LLM.',
    details: 'L\'AI analizza il corpo del messaggio libero, identificando nome e cognome del contatto, ruolo aziendale, email, telefono e bisogni audiovisivi (spot, video corporate, reels, foto).',
    aiRole: 'Estrazione structured JSON conforme ai campi della scheda cliente.',
    output: 'Record compilato con contatti verificati e tag di settore.',
  },
  {
    id: 'step-3',
    phase: 'Fase 3 • Data Intelligence',
    category: 'enrichment',
    title: 'Arricchimento Dati B2B (Nuovo)',
    subtitle: 'Verifica P.IVA, fatturato, settore ATECO e numero dipendenti',
    badge: 'Data Enrichment B2B',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    iconName: 'Building2',
    type: 'enrichment',
    summary: 'Incrocio automatico registro imprese e dati camerali.',
    details: 'Prima di calcolare il BANT, il CRM interroga le banche dati aziendali ricavando fatturato stimato, capitale sociale, rating creditizio e dipendenti della società cliente.',
    aiRole: 'Previsione di capienza di spesa per produzioni audiovisive.',
    output: 'Profilo aziendale arricchito con metriche di solidità finanziaria.',
  },
  {
    id: 'step-4',
    phase: 'Fase 4 • Decisione Condizionale',
    category: 'qualification',
    title: 'Qualificazione B.A.N.T. 2.0 (Score 0-4)',
    subtitle: 'Budget, Authority, Need, Timeline ponderati con i dati B2B',
    badge: 'Bivio Condizionale',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    iconName: 'Sparkles',
    type: 'decision',
    summary: 'Algoritmo a punteggio che separa i lead freddi dai lead caldi.',
    details: 'Valuta se il budget è compatibile con i costi di troupe/attrezzatura Canon DADO, se il referente ha potere di firma e se la data di ripresa è definita.',
    aiRole: 'Assegnazione punteggio ponderato (0-4) e instradamento su percorso Freddo o Caldo.',
    output: 'Punteggio Score BANT e selezione automatica della corsia operativa.',
  },
  {
    id: 'step-5a',
    phase: 'Ramo Freddo • Nurturing',
    category: 'cold',
    title: 'Email Automatica Showreel & Portfolio DADO',
    subtitle: 'Invio video reel settoriale, listino indicativo e iscrizione drip',
    badge: 'Lead Nurturing Freddo',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    iconName: 'Mail',
    type: 'cold_path',
    summary: 'Educazione del cliente senza impegnare tempo umano prezioso.',
    details: 'Se il cliente non ha budget o cerca solo informazioni vaghe, riceve una mail con il portfolio video DADO calibrato sul suo settore e viene iscritto a una sequenza automatica di riscaldamento.',
    aiRole: 'Scelta dello showreel più affine (Moda, Food, Corporate, Eventi).',
    output: 'Sequenza mail periodica con tracciamento aperture e click.',
  },
  {
    id: 'step-5b',
    phase: 'Ramo Caldo • Verifica Risorse',
    category: 'hot',
    title: 'Check Anti-Conflitto Calendario & Risorse Set',
    subtitle: 'Verifica Google Calendar, Limbo Studio Milano & Kit Canon C70',
    badge: 'Verifica Risorse Studio',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconName: 'Calendar',
    type: 'hot_path',
    summary: 'Controllo incrociato tra disponibilità commerciale e sale di posa.',
    details: 'Interroga in tempo reale Google Calendar per evitare sovrapposizioni e verifica preventivamente che il Limbo Studio e il Kit Canon Cinema C70 siano liberi nelle finestre richieste.',
    aiRole: 'Eliminazione doppi booking e blocco precauzionale dello slot.',
    output: 'Finestre orarie 100% disponibili senza conflitti di set.',
  },
  {
    id: 'step-6',
    phase: 'Fase 6 • Proposta Smart',
    category: 'hot',
    title: 'Email Proposta Call (2 Slot Intelligenti + Booking)',
    subtitle: 'Offre 2 opzioni orarie immediate E link calendario dinamico',
    badge: 'Scheduling Smart',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconName: 'Clock',
    type: 'hot_path',
    summary: 'Massima flessibilità per chiudere la data al primo contatto.',
    details: 'Invia una mail personalizzata proponendo due date ideali ma include anche il link diretto per permettere al cliente di scegliere un altro orario con 1 click.',
    aiRole: 'Generazione testo cordiale, sintetico e orientato alla call.',
    output: 'Invito formale inviato al referente aziendale.',
  },
  {
    id: 'step-7',
    phase: 'Fase 7 • Protezione No-Response',
    category: 'anti_ghost',
    title: 'Loop di Controllo Anti-Ghosting (Nuovo)',
    subtitle: 'Sollecito a 48h se non risponde • Promemoria finale a 5gg',
    badge: 'Protezione Anti-Ghosting',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    iconName: 'Repeat',
    type: 'loop',
    summary: 'Recupero proattivo delle trattative ferme per mancata risposta.',
    details: 'Se il cliente non seleziona lo slot entro 48 ore, parte un messaggio gentile di follow-up ("Volevo assicurarmi ti fosse arrivata la mia mail..."). Se dopo 5 giorni tace, viene ricollocato in nurturing.',
    aiRole: 'Timer automatico e stesura del messaggio di re-engagement.',
    output: 'Tasso di recupero lead aumentato del +35% senza intervento manuale.',
  },
  {
    id: 'step-8',
    phase: 'Fase 8 • Conferma & Accessi',
    category: 'hot',
    title: 'Conferma Appuntamento (Google Meet + Location Limbo)',
    subtitle: 'Invio link videoconferenza, recapiti studio e brief d\'incontro',
    badge: 'Conferma Esecutiva',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconName: 'Video',
    type: 'hot_path',
    summary: 'Blocco a calendario e invio istruzioni complete per la riunione.',
    details: 'Genera l\'evento di calendario, invia l\'invito con link Google Meet e mappa della sede per gli incontri in presenza.',
    aiRole: 'Creazione sincronizzata evento su Google Calendar + notifica Slack/Toast.',
    output: 'Invito a calendario accettato con promemoria allegati.',
  },
  {
    id: 'step-9',
    phase: 'Fase 9 • No-Show Prevention',
    category: 'hot',
    title: 'Promemoria Automatici (24h & 1h Prima)',
    subtitle: 'Notifica con scaletta della call per azzerare i mancati incontri',
    badge: 'Zero No-Show',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconName: 'ShieldCheck',
    type: 'hot_path',
    summary: 'Eliminazione dimenticanze e conferma presenza del cliente.',
    details: 'Messaggi automatici di promemoria che ricordano l\'orario esatto, i partecipanti di DADO Studio e gli argomenti della call.',
    aiRole: 'Alert temporale automatico 24 ore e 60 minuti prima del collegamento.',
    output: 'Presenza garantita e cliente preparato con brief in mano.',
  },
  {
    id: 'step-10',
    phase: 'Fase 10 • Conversione Commerciale',
    category: 'closing',
    title: 'Bozza Preventivo Automatica & Contratto (Post-Call)',
    subtitle: 'Configurazione Kit Canon C70, giornate set e clausola 50% acconto',
    badge: 'Contratto & Produzione',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    iconName: 'FileText',
    type: 'closing',
    summary: 'Generazione istantanea dell\'offerta economica e del contratto.',
    details: 'Al termine della call, l\'AI sintetizza le note e prepara nel CRM la bozza di preventivo formale con dotazione Canon C70, droni e giornate Limbo. Alla firma e pagamento dell\'acconto, l\'attrezzatura viene bloccata per il set.',
    aiRole: 'Compilazione quote con prezzi, tempistiche e materiali pronti per la firma.',
    output: 'Trattativa Vinta, Contratto firmato digitalmente e acconto registrato.',
  },
]

const MERMAID_IMPROVED_CODE = `flowchart TD
  %% ── INGESTIONE & INTELLIGENCE ──
  A["Multi-Canale Inbound/Outbound\\n(Web, IG/TikTok DM, Referral, Cold Email, Eventi)"] --> B["Ingestione Automatica Lead\\n(Parser AI Gemini)"]
  B --> B2["Enrichment B2B Automatico\\n(Verifica P.IVA, Fatturato, Dipendenti, ATECO)"]
  B2 --> C{"Qualificazione B.A.N.T. 2.0\\n(Score Ponderato 0-4)"}

  %% ── RAMO FREDDO ──
  C -->|"Score 0-2 (Lead Freddo)"| D["Email Automatica Showreel & Portfolio\\n(Nurturing settoriale mirato)"]
  D --> D2["Loop di Rivalutazione a 30gg\\n(Monitoraggio aperture & riattivazione)"]

  %% ── RAMO CALDO & RISORSE ──
  C -->|"Score 3-4 (Lead Caldo)"| E["Check Anti-Conflitto Google Calendar\\n+ Verifica Limbo DADO & Kit Canon C70"]
  E --> F["Email Proposta Call Smart\\n(2 Slot Intelligenti + Link Booking Diretto)"]

  %% ── LOOP ANTI-GHOSTING ──
  F --> G{"Il Lead risponde entro 48h?"}
  G -->|"Nessuna risposta (48h)"| G_FOLLOW["Follow-up Automatico Cortese\\n(Loop Anti-Ghosting 48h & 5gg)"]
  G_FOLLOW --> F
  G -->|"Slot Selezionato o Risposta"| H["Email Conferma Appuntamento\\n(Link Google Meet + Location Limbo DADO)"]

  %% ── CHIUSURA & PREVENTIVO ──
  H --> I["Promemoria Automatici No-Show\\n(Notifiche 24h & 1h prima della call)"]
  I --> J["Call Conclusa ➔ Generazione Automatica Bozza Preventivo\\n(Kit Canon C70, Giornate Set, Condizioni 50% Acconto)"]
  J --> K["Firma Contratto Digitale & Acconto Registrato ➔ Avvio Set"]`

const MERMAID_ORIGINAL_CODE = `flowchart TD
  A["Multi-Canale Inbound/Outbound (Web, IG/TikTok, Referral, Cold Email, Eventi)"] --> B["Ingestione Automatica Lead (Parser AI)"]
  B --> C{"Qualificazione B.A.N.T. (Score 0-4)"}
  
  C -->|"Lead Freddo / Info Generiche"| D["Email Automatica Showreel & Portfolio DADO"]
  C -->|"Lead Caldo / Richiesta Call"| E["Check Anti-Conflitto Calendario Google"]
  
  E --> F["Email Automatica Proposta Call (2 Slot Intelligenti)"]
  F --> G{"Il Lead risponde o seleziona slot"}
  
  G --> H["Email Automatica Conferma Appuntamento (Link Meet + Limbo DADO)"]
  H --> I["Promemoria Automatico 24h & 1h prima della Call"]
  I --> J["Conversione in Preventivo / Contratto DADO Studio"]`

export default function LeadWorkflowInteractiveDiagram({ onClose }) {
  const [activeTab, setActiveTab] = useState('diagram') // 'diagram' | 'specs' | 'mermaid'
  const [selectedStepId, setSelectedStepId] = useState('step-4')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'hot' | 'cold' | 'ai'
  const [copied, setCopied] = useState(false)
  const [mermaidMode, setMermaidMode] = useState('improved') // 'improved' | 'original'

  const selectedStep = WORKFLOW_STEPS.find((s) => s.id === selectedStepId) || WORKFLOW_STEPS[0]

  const filteredSteps = WORKFLOW_STEPS.filter((step) => {
    if (activeFilter === 'hot') return ['step-4', 'step-5b', 'step-6', 'step-7', 'step-8', 'step-9', 'step-10'].includes(step.id)
    if (activeFilter === 'cold') return ['step-1', 'step-2', 'step-4', 'step-5a'].includes(step.id)
    if (activeFilter === 'ai') return ['step-2', 'step-3', 'step-4', 'step-7', 'step-10'].includes(step.id)
    return true
  })

  const handleCopyMermaid = () => {
    const code = mermaidMode === 'improved' ? MERMAID_IMPROVED_CODE : MERMAID_ORIGINAL_CODE
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      style={{ fontFamily: '"Switzer", sans-serif' }}
      onClick={onClose}
    >
      <div
        className="bg-[#0b0f17] border border-slate-700/80 max-w-5xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(2, 132, 199, 0.15)',
        }}
      >
        {/* ── HEADER MODALE ── */}
        <div className="px-5 py-4 bg-[#0f172a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-xs">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Architettura AI 2.0
                </span>
                <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                  DADO Creative Studio
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Workflow Completo di Gestione Lead & Automazione
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs Modalità */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('diagram')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'diagram'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📊 Diagramma Interattivo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'specs'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Tabella Regole AI
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mermaid')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'mermaid'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📝 Codice Mermaid
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
              title="Chiudi schema"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── CONTENUTO PRINCIPALE ── */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-[#070b12]">
          {/* TAB 1: DIAGRAMMA INTERATTIVO RENDERIZZATO */}
          {activeTab === 'diagram' && (
            <div className="space-y-5">
              {/* Barra Filtro & Legenda Corsie */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400 font-bold mr-1">Visualizza:</span>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                      activeFilter === 'all'
                        ? 'bg-white/20 text-white border border-white/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tutto il Flusso ({WORKFLOW_STEPS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('hot')}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      activeFilter === 'hot'
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                        : 'text-slate-400 hover:text-emerald-300'
                    }`}
                  >
                    <Flame size={13} className="text-emerald-400" />
                    <span>Corsia Lead Caldo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('cold')}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      activeFilter === 'cold'
                        ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                        : 'text-slate-400 hover:text-indigo-300'
                    }`}
                  >
                    <Snowflake size={13} className="text-indigo-400" />
                    <span>Corsia Lead Freddo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('ai')}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      activeFilter === 'ai'
                        ? 'bg-sky-500/30 text-sky-300 border border-sky-500/50'
                        : 'text-slate-400 hover:text-sky-300'
                    }`}
                  >
                    <Zap size={13} className="text-sky-400" />
                    <span>Solo Step AI Powered</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Clicca su qualsiasi step per visualizzare le regole e i dati estratti</span>
                </div>
              </div>

              {/* Layout a 2 Colonne: Flusso a sinistra, Ispettore Dettagli a destra */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* ── COLONNA FLUSSO A CARDS INTERATTIVE (8 col) ── */}
                <div className="lg:col-span-7 space-y-3.5">
                  {filteredSteps.map((step, idx) => {
                    const isSelected = selectedStepId === step.id
                    const StepIcon = ICON_MAP[step.iconName] || Sparkles

                    let borderColor = 'border-slate-800 hover:border-slate-700'
                    let glowColor = ''
                    if (isSelected) {
                      borderColor = 'border-sky-500 ring-2 ring-sky-500/30'
                      glowColor = 'shadow-[0_0_20px_rgba(2,132,199,0.25)]'
                    }

                    return (
                      <div key={step.id} className="relative">
                        {/* Connettore verticale tra card */}
                        {idx > 0 && (
                          <div className="w-full flex items-center justify-center -my-2.5 relative z-0">
                            <div className="h-5 w-0.5 bg-gradient-to-b from-sky-500/50 to-slate-700"></div>
                            <ArrowDown size={14} className="text-sky-400 -ml-1.5" />
                          </div>
                        )}

                        <div
                          onClick={() => setSelectedStepId(step.id)}
                          className={`p-4 rounded-xl bg-slate-900/90 border ${borderColor} ${glowColor} transition-all cursor-pointer group hover:scale-[1.01] relative z-10 flex items-start gap-3.5`}
                        >
                          {/* Icona circolare */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                              isSelected
                                ? 'bg-sky-500 text-white border-sky-400 shadow-md scale-105'
                                : 'bg-slate-800 text-slate-300 border-slate-700 group-hover:text-white group-hover:border-slate-600'
                            }`}
                          >
                            <StepIcon size={20} />
                          </div>

                          {/* Contenuto card */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                {step.phase}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${step.badgeColor}`}
                              >
                                {step.badge}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors tracking-tight">
                              {step.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                              {step.subtitle}
                            </p>
                          </div>

                          {/* Freccia selezione */}
                          <ChevronRight
                            size={18}
                            className={`shrink-0 transition-transform ${
                              isSelected
                                ? 'text-sky-400 translate-x-1'
                                : 'text-slate-600 group-hover:text-slate-400'
                            }`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* ── COLONNA PANNELLO ISPETTORE STEP (5 col) ── */}
                <div className="lg:col-span-5 sticky top-0 space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0c1322] border border-slate-700/80 shadow-xl">
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping"></span>
                        <span className="text-xs font-black uppercase text-sky-400 tracking-wider">
                          Dettaglio Operativo Step
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">
                        {selectedStep.phase}
                      </span>
                    </div>

                    <div className="mt-3.5">
                      <h4 className="text-base font-black text-white">
                        {selectedStep.title}
                      </h4>
                      <p className="text-xs text-sky-300/80 font-semibold mt-1">
                        {selectedStep.subtitle}
                      </p>
                    </div>

                    <div className="space-y-3 mt-4 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Logica & Funzionamento
                        </span>
                        <p className="text-slate-200 leading-relaxed">
                          {selectedStep.details}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/40">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <Bot size={13} />
                          <span>Ruolo dell'Intelligenza Artificiale</span>
                        </span>
                        <p className="text-sky-200/90 leading-relaxed font-medium">
                          {selectedStep.aiRole}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          <span>Output / Risultato Esecutivo</span>
                        </span>
                        <p className="text-emerald-200/90 leading-relaxed font-semibold">
                          {selectedStep.output}
                        </p>
                      </div>
                    </div>

                    {/* Badge Vantaggi Strategici */}
                    <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Stato nel CRM:</span>
                      <span className="font-bold text-white px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                        Attivo & Integrato
                      </span>
                    </div>
                  </div>

                  {/* Box Miglioramenti Applicati */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-sky-950/30 border border-emerald-800/30 text-xs">
                    <span className="font-black text-emerald-400 uppercase tracking-wide block mb-1">
                      ✨ I 5 Nuovi Upgrade Integrati
                    </span>
                    <ul className="space-y-1.5 text-slate-300 text-[11.5px] mt-2">
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Enrichment B2B:</strong> verifica P.IVA e fatturato prima del BANT.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Check Risorse Set:</strong> disponibilità Limbo DADO e Kit Canon C70.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Loop Anti-Ghosting:</strong> follow-up automatico a 48h e 5 giorni.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Zero No-Show:</strong> promemoria a 24h e 1h prima della call.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Preventivo 1-Click:</strong> bozza automatica post-call pronta per la firma.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPECIFICHE TECNICHE & REGOLE AI */}
          {activeTab === 'specs' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-2">
                  Matrice delle Regole di Automazione & Criteri B.A.N.T.
                </h3>
                <p className="text-slate-400 text-xs mb-4">
                  Tabella comparativa dei parametri che l'AI utilizza per instradare ciascun contatto in arrivo.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11.5px]">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Fase</th>
                        <th className="py-2.5 px-3">Condizione / Input</th>
                        <th className="py-2.5 px-3">Azione Automatica</th>
                        <th className="py-2.5 px-3">Strumento Impiegato</th>
                        <th className="py-2.5 px-3">Tempo Esecuzione</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-sky-400">1. Ingestione</td>
                        <td className="py-2.5 px-3">Nuova mail / form web / DM social</td>
                        <td className="py-2.5 px-3">Parsing entità, estrazione referenti e brief</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-300">Parser LLM (Gemini 2.5 Flash)</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">&lt; 3 secondi</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-purple-400">2. B2B Enrichment</td>
                        <td className="py-2.5 px-3">Dominio email / Nome azienda</td>
                        <td className="py-2.5 px-3">Estrazione P.IVA, ATECO, fatturato stimato</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-300">API B2B Chamber Registry</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">&lt; 2 secondi</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-amber-400">3. BANT Scoring</td>
                        <td className="py-2.5 px-3">Score &lt; 2 (Budget basso o info generiche)</td>
                        <td className="py-2.5 px-3">Invio showreel e sequenza nurturing video</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-300">Motore Email DADO Studio</td>
                        <td className="py-2.5 px-3 text-slate-400">Immediato (1 min)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">4. Fast Track Caldo</td>
                        <td className="py-2.5 px-3">Score ≥ 3 (Budget target + richiesta call)</td>
                        <td className="py-2.5 px-3">Check calendario, verifica Kit Canon & invio 2 slot</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-300">Google Calendar Sync</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">Istantaneo</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-rose-400">5. Anti-Ghosting</td>
                        <td className="py-2.5 px-3">Nessuna risposta dopo 48 ore dall'invito</td>
                        <td className="py-2.5 px-3">Email sollecito cortese con link booking diretto</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-300">Automazione Cron / Scheduler</td>
                        <td className="py-2.5 px-3 text-amber-400 font-bold">Dopo 48h</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-cyan-400">6. No-Show Alert</td>
                        <td className="py-2.5 px-3">Meeting confermato a calendario</td>
                        <td className="py-2.5 px-3">Promemoria automatici a 24h e 1h dalla call</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-300">Google Meet + Alert Toast</td>
                        <td className="py-2.5 px-3 text-slate-400">-24h / -1h</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-amber-300">7. Chiusura & Saldo</td>
                        <td className="py-2.5 px-3">Call conclusa con riscontro positivo</td>
                        <td className="py-2.5 px-3">Bozza preventivo con Kit Canon C70 + 50% acconto</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-300">Modulo Invoices & Quotes CRM</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">1 Click</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CODICE MERMAID ORIGINALE & MIGLIORATO */}
          {activeTab === 'mermaid' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Versione Codice:</span>
                  <button
                    type="button"
                    onClick={() => setMermaidMode('improved')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      mermaidMode === 'improved'
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ✨ Versione Migliorata (2.0 con Loop & B2B)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMermaidMode('original')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      mermaidMode === 'original'
                        ? 'bg-white/20 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📄 Versione Originale (1.0 Lineare)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyMermaid}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Copiato!' : 'Copia Codice Mermaid'}</span>
                </button>
              </div>

              <div className="bg-black/95 p-4 border border-slate-800 rounded-xl text-xs text-slate-300 overflow-x-auto leading-relaxed">
                <pre style={{ fontFamily: '"Switzer", sans-serif' }}>
                  {mermaidMode === 'improved' ? MERMAID_IMPROVED_CODE : MERMAID_ORIGINAL_CODE}
                </pre>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Puoi copiare e incollare questo codice in qualsiasi visualizzatore Mermaid, Notion o documentazione interna. Se desideri ripristinare la vista originale, basta selezionare "Versione Originale".
              </p>
            </div>
          )}
        </div>

        {/* ── FOOTER MODALE ── */}
        <div className="px-5 py-3.5 bg-[#0f172a] border-t border-slate-800 flex items-center justify-between flex-shrink-0 text-xs">
          <div className="text-slate-400 font-medium">
            Studio DADO Milano • Pipeline Lead & Booking Cinema Canon
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 cursor-pointer shadow-xs transition-all active:scale-95"
          >
            Chiudi Schema
          </button>
        </div>
      </div>
    </div>
  )
}
