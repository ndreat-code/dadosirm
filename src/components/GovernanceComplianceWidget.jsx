import React, { useState, useEffect } from 'react'
import { ShieldCheck, Lock, FileCheck2, Activity, ChevronLeft, ChevronRight, Printer, ExternalLink, X, CheckCircle2, AlertTriangle, Eye, Cloud, HardDrive } from 'lucide-react'
import { DualBackupModal } from './DualBackupModal'

const GOVERNANCE_PAGES = [
  {
    page: 1,
    kicker: 'Sezione 1 di 4 • Access Control & RBAC',
    title: 'Architettura di Governance, Ruoli & Permessi',
    subtitle: 'Segregazione rigorosa tra funzioni operative quotidiane e funzioni di governo, configurazione e supervisione economica.',
    badge: 'PAGINA 1 / 4',
    cards: [
      {
        tone: 'sky',
        tag: 'Presidio 01 • Gerarchia Ruoli (RBAC)',
        title: 'Controllo Accessi Differenziato per Ruolo',
        desc: 'Il CRM separa i privilegi operativi in base al profilo autenticato, impedendo modifiche non autorizzate a configurazioni o dati sensibili:',
        bullets: [
          'Director (Direzione): visibilità totale su KPI, marginalità, audit incrociato, gestione permessi utenti, automazioni e canale riservato con lo sviluppatore.',
          'Super Admin / Sviluppatore: presidio tecnico, diagnostica pipeline AI, configurazione policy e manutenzione evolutiva.',
          'Team Operativo (Producer / Account): accesso circoscritto alle sole viste operative abilitate (Calendario, Tasks, Schede Clienti, Inventario).',
        ],
      },
      {
        tone: 'emerald',
        tag: 'Presidio 02 • Guardie & Zero Password in Chiaro',
        title: 'Protezione Sezioni Critiche & Hash Crittografico',
        desc: 'Ogni rotta è protetta da verifiche di permesso e nessuna password viene mai salvata in chiaro:',
        bullets: [
          'Zero Password in Chiaro (PBKDF2-SHA256): appena una password viene registrata o cambiata, il testo viene trasformato in un codice crittografico irreversibile (es. pbkdf2$8f9a...) e la password originale non viene mai salvata da nessuna parte.',
          'Gestione Utenti & Permessi: abilitazione o revoca granulare dei permessi per singolo collaboratore.',
          'Canale Riservato Direzione–Sviluppatore: le note inviate dalla barra inferiore sono visibili solo a Director e Super Admin.',
        ],
      },
    ],
    tableTitle: 'Matrice Operativa dei Permessi e Sicurezza Credenziali',
    tableHeaders: ['Modulo / Strumento di Governance', 'Director', 'Super Admin', 'Team Operativo', 'Obiettivo di Compliance'],
    tableRows: [
      ['Archiviazione Password Utenti (PBKDF2)', { pill: 'Solo Hash (pbkdf2$)', color: 'green' }, { pill: 'Solo Hash (pbkdf2$)', color: 'green' }, { pill: 'Illeggibile', color: 'green' }, 'Zero password in chiaro: nessuno può leggere le password'],
      ['Dashboard KPI, Funnel & Fatturato', { pill: 'Controllo Totale', color: 'green' }, { pill: 'Controllo Totale', color: 'green' }, { pill: 'Vista Operativa', color: 'blue' }, 'Monitoraggio in tempo reale delle performance commerciali'],
      ['Gestione Utenti & Matrice Permessi', { pill: 'Abilitato', color: 'green' }, { pill: 'Abilitato', color: 'green' }, { pill: 'Bloccato', color: 'red' }, 'Prevenzione accessi non autorizzati a configurazioni e ruoli'],
      ['Sezione "Note allo Sviluppatore Inviate"', { pill: 'Esclusivo', color: 'green' }, { pill: 'Esclusivo', color: 'green' }, { pill: 'Nascosto', color: 'red' }, 'Riservatezza nelle direttive di sviluppo tra Direzione e IT'],
    ],
    calloutTitle: 'Verifica immediata per il Direttore',
    calloutText: 'Nella sezione Utenti & Permessi ogni profilo mostra il proprio badge crittografico irreversibile (pbkdf2$8f9a...) a conferma che nessuna password in chiaro è salvata nel CRM.',
  },
  {
    page: 2,
    kicker: 'Sezione 2 di 4 • Data Minimization & GDPR',
    title: 'Policy sui Dati Estrapolati dalle Email',
    subtitle: 'Regole deterministiche di minimizzazione del dato, divieto di copia integrale dei testi e mappatura controllata nei campi del CRM.',
    badge: 'PAGINA 2 / 4',
    cards: [
      {
        tone: 'emerald',
        tag: 'Regola Aurea • Data Minimization',
        title: 'Divieto di Allegare il Corpo Integrale delle Email',
        desc: 'In conformità ai principi di minimizzazione dei dati (GDPR), la pipeline non copia né allega mai il testo integrale delle email nelle Tasks o in Companies:',
        bullets: [
          'Impedisce l’esposizione accidentale di thread riservati, firme legali o dati personali superflui nelle schermate condivise.',
          'Mantiene le schede aziendali e le task ordinate, sintetiche e immediatamente azionabili.',
        ],
      },
      {
        tone: 'sky',
        tag: 'Schema Rigido • Campi Validati',
        title: 'Unici Campi Strutturati Ammessi nel CRM',
        desc: 'Il motore di acquisizione può aggiornare esclusivamente un set chiuso e validato di attributi commerciali:',
        bullets: [
          'Anagrafica di Contatto: indirizzo email diretto, recapito telefonico, nome e ruolo del referente aziendale.',
          'Dettagli Contrattuali: stato del contratto, condizioni di pagamento e importo numerico del budget/preventivo.',
          'Richieste Sintetiche da Oggetto: max 6 voci operative (3–75 caratteri) ricavate dall’oggetto della richiesta.',
        ],
      },
    ],
    tableTitle: 'Tabella delle Policy di Scrittura Dati (Email → CRM)',
    tableHeaders: ['Dato / Contenuto nell’Email', 'Azione della Pipeline CRM', 'Destinazione nel CRM', 'Stato Policy'],
    tableRows: [
      ['Corpo testuale lungo / Thread storico email', 'Escluso dal salvataggio nelle card; analizzato solo in memoria', 'Nessuna (non salvato in Tasks né Companies)', { pill: 'Blocco Tassativo', color: 'red' }],
      ['Indirizzo Email, Telefono e Nome/Ruolo Referente', 'Normalizzazione formato e aggiornamento referente', 'Scheda Companies → Contatti & Referente', { pill: 'Ammesso & Validato', color: 'green' }],
      ['Importo Preventivo / Budget e Clausole Contratto', 'Estrazione valore in Euro e stato contrattuale', 'Scheda Companies + Pipeline Opportunities', { pill: 'Ammesso & Validato', color: 'green' }],
      ['Richiesta Operativa dall’Oggetto Email', 'Sintesi fino a max 8 parole per Task + fascia priorità', 'Sezione Tasks / Activities con urgenza', { pill: 'Sintesi Controllata', color: 'blue' }],
    ],
    calloutTitle: 'Addestramento Supervisionato dalla Direzione (Active Learning)',
    calloutText: 'Tramite il registro regole validate dall’operatore, la Direzione può fissare istruzioni vincolanti e parole chiave per cliente che guidano la classificazione delle priorità (Urgente 3 giorni, 1 settimana, 2/3 settimane, 1 mese).',
  },
  {
    page: 3,
    kicker: 'Sezione 3 di 4 • Cybersecurity AI & Tutela Contrattuale',
    title: 'Scudo Sicurezza AI & "Human-in-the-Loop"',
    subtitle: 'Protezione contro manipolazioni via email (Prompt Injection / Testo Nascosto) e blocco automatico sugli impegni commerciali ed economici.',
    badge: 'PAGINA 3 / 4',
    cards: [
      {
        tone: 'rose',
        tag: 'Cybersecurity AI • Email Safety',
        title: 'Filtro Anti-Prompt Injection & Testo Nascosto',
        desc: 'Prima che un’email venga analizzata dal modello AI, il modulo di sicurezza (emailSafety.js) ispeziona HTML e testo in chiaro:',
        bullets: [
          'Rimozione testo invisibile: intercetta e isola scritte con font-size: 0, testo bianco su bianco, display: none o caratteri Unicode invisibili.',
          'Verifica coerenza HTML vs Plain-Text: rileva discrepanze tra il testo visibile all’utente e il testo grezzo sottostante.',
          'Quarantena automatica: se un’email risulta sospetta, blocca qualsiasi modifica automatica alle schede azienda.',
        ],
      },
      {
        tone: 'amber',
        tag: 'Tutela Contrattuale • Human-in-the-Loop',
        title: 'Nessun Impegno Economico Inviato in Automatico',
        desc: 'Separazione netta tra risposte informative e comunicazioni che impegnano contrattualmente o economicamente lo Studio:',
        bullets: [
          'Sempre in Bozza (Mai inviate da sole): conferme di preventivo/accordo, negoziazioni di budget, clausole contrattuali o email sospette restano in Bozza con revisione obbligatoria.',
          'Risposte rapide controllate: solo richieste generiche di portfolio/showreel o verifica slot calendario liberi possono generare riscontro immediato.',
        ],
      },
    ],
    tableTitle: 'Matrice Decisionale sulle Risposte Email Generate dal CRM',
    tableHeaders: ['Tipologia di Email Ricevuta', 'Comportamento del Sistema', 'Approvazione Umana', 'Motivazione di Governance'],
    tableRows: [
      ['Conferma Preventivo / Approvazione Budget / Contratto', 'Prepara la risposta ma la salva esclusivamente in Bozze', { pill: 'Obbligatoria', color: 'amber' }, 'Impedisce che l’AI assuma impegni contrattuali senza firma della Direzione'],
      ['Negoziazione Prezzi, Sconti o Clausole Speciali', 'Genera proposta preliminare in Bozza CRM', { pill: 'Obbligatoria', color: 'amber' }, 'Tutela la marginalità delle commesse e le condizioni di pagamento'],
      ['Email con Testo Nascosto / Anomalie di Sicurezza', 'Blocca scrittura su Companies + Bozza con avviso ⚠️ Revisione', { pill: 'Blocco & Audit', color: 'red' }, 'Neutralizza tentativi esterni di manipolare i dati del CRM'],
      ['Richiesta Showreel / Info Servizi / Verifica Slot Call', 'Verifica conflitti sul Calendario Studio e propone slot reali', { pill: 'Supervisionata', color: 'green' }, 'Abbatte i tempi di risposta sui lead inbound senza rischio economico'],
    ],
    calloutTitle: 'Sincronizzazione Silenziosa o Manuale a Scelta della Direzione',
    calloutText: 'Il motore AI non interrompe mai l’operatività a schermo: la Direzione può tenerlo in modalità "Solo a richiesta" (manuale) oppure con controllo periodico silenzioso.',
  },
  {
    page: 4,
    kicker: 'Sezione 4 di 4 • Cross-Check Audit & Controllo di Gestione',
    title: 'Cross-Check Audit, Fatturazione & Checklist',
    subtitle: 'Controllo incrociato automatico tra Commesse, Fatture, Calendario e Inventario per azzerare dimenticanze amministrative e rischi operativi.',
    badge: 'PAGINA 4 / 4',
    cards: [
      {
        tone: 'sky',
        tag: 'Audit Continuo • Cross-Check Engine',
        title: 'Verifica Incrociata tra i 5 Pilastri del CRM',
        desc: 'Il motore di audit interno (crossCheckEngine.js) confronta costantemente Companies, Pipeline, Invoices, Calendar e Inventory:',
        bullets: [
          'Allerta Fatturazione Mancante: segnala commesse confermate per cui non risulta ancora emessa fattura o acconto.',
          'Presidio Scadenze Preventivi: evidenzia in Dashboard e nella vista CRM i preventivi in scadenza entro 48 ore.',
          'Coerenza Set & Attrezzature: incrocia le date di shooting a calendario con la disponibilità reale del parco macchine.',
        ],
      },
      {
        tone: 'emerald',
        tag: 'Disaster Recovery • 2 Sistemi di Backup Attivi',
        title: 'Sistema #1 Vault Locale + Sistema #2 Cloud AES-256',
        desc: 'Il CRM protegge l’intero patrimonio informativo con due sistemi di backup indipendenti e verificati con firma SHA-256:',
        bullets: [
          'Sistema #1 (Vault Fisico Locale): salvataggio automatico su disco server (fino a 30 versioni) con download JSON e ripristino 1-Click.',
          'Sistema #2 (Cloud Backup Cifrato): cifratura end-to-end AES-256-GCM (PBKDF2 10.000 cicli) e replica su Cloud Vault / Google Cloud / Webhook HTTPS.',
          'Safety Point Automatico: prima di qualsiasi ripristino viene generato uno snapshot di sicurezza dello stato corrente.',
        ],
      },
    ],
    tableTitle: 'Checklist Rapida di Collaudo per il Direttore (5 Minuti)',
    tableHeaders: ['Passo di Verifica', 'Dove Testarlo nel CRM', 'Risultato di Governance Atteso'],
    tableRows: [
      ['1. Verifica KPI, Funnel & Fatture', 'Dashboard Principale → Card Funnel & KPI e Card Invoices', 'Lettura immediata delle percentuali e apertura a tutto schermo del registro fatture'],
      ['2. Verifica Doppio Backup (Locale + Cloud)', 'Pulsante "☁️ 2 Backup" nello specchietto o in Utenti & Permessi', 'Esecuzione istantanea del backup locale + replica Cloud cifrata AES-256-GCM'],
      ['3. Verifica Pulizia Dati Estratti da Email', 'Menu laterale → Companies e Tasks', 'Solo campi strutturati (email, referente, budget, oggetto) senza mai allegare il corpo della mail'],
      ['4. Verifica Zero Password in Chiaro (pbkdf2$)', 'Menu laterale → Utenti & Permessi', 'Ogni utente mostra solo il codice crittografico irreversibile pbkdf2$8f9a...'],
    ],
    calloutTitle: 'Parametrizzazione su Indicazione della Direzione',
    calloutText: 'Tutte le soglie di governance, la frequenza del doppio backup automatico (Locale + Cloud) e le regole di approvazione preventivi sono configurabili in tempo reale.',
  },
]

function renderPill(cell) {
  if (!cell || typeof cell !== 'object') return cell
  const colorMap = {
    green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-rose-100 text-rose-800 border-rose-200',
    blue: 'bg-sky-100 text-sky-800 border-sky-200',
  }
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${colorMap[cell.color] || colorMap.blue}`}>
      {cell.pill}
    </span>
  )
}

export function GovernanceSpecchiettoCard({ onClick }) {
  const [showBackupModal, setShowBackupModal] = useState(false)

  return (
    <>
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick?.()
          }
        }}
        className="group cursor-pointer select-none transition-all duration-200 hover:scale-[1.03] hover:shadow-lg relative overflow-hidden flex flex-col justify-between p-2.5"
        style={{
          width: '4cm',
          height: '3cm',
          minWidth: '4cm',
          minHeight: '3cm',
          maxWidth: '4cm',
          maxHeight: '3cm',
          borderRadius: '14px',
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 65%, #0c4a6e 100%)',
          border: '1.5px solid #38bdf8',
          boxShadow: '0 6px 18px rgba(2, 132, 199, 0.22)',
          fontFamily: '"Switzer", sans-serif',
        }}
        title="Clicca per sfogliare la Nota Esecutiva di Governance & Compliance (4 Pagine per il Direttore)"
      >
        {/* Bagliore decorativo */}
        <div
          className="absolute -right-4 -top-4 w-14 h-14 rounded-full pointer-events-none opacity-30 group-hover:opacity-55 transition-opacity"
          style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
        />

        {/* Riga superiore: Icona + Badge 4 Pag */}
        <div className="flex items-center justify-between gap-1 relative z-10">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-400/40 text-[#38bdf8] text-[8.5px] font-black uppercase tracking-wider leading-none">
            <ShieldCheck size={10} className="shrink-0 text-[#00ffaa]" />
            <span>GOVERNANCE</span>
          </span>
          <span className="text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-[#00ffaa] border border-emerald-400/30 leading-none">
            4 PAG.
          </span>
        </div>

        {/* Titolo centrale */}
        <div className="relative z-10 my-0.5">
          <div className="text-[11px] font-black text-white leading-tight tracking-tight group-hover:text-sky-200 transition-colors">
            Compliance & Policy AI
          </div>
          <div className="text-[8px] text-slate-300 font-medium leading-tight mt-0.5 line-clamp-2">
            Zero Pwd in Chiaro • Policy Email • 2 Backup
          </div>
        </div>

        {/* Footer specchietto con accesso rapido sia al Dossier sia ai 2 Backup */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10 relative z-10 gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowBackupModal(true)
            }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-400/40 text-[8px] font-black text-[#00ffaa] cursor-pointer transition-colors"
            title="Apri Centro Operativo dei 2 Sistemi di Backup (Locale + Cloud AES-256)"
          >
            <Cloud size={9} />
            <span>2 Backup</span>
          </button>
          <span className="inline-flex items-center gap-0.5 text-[8.5px] font-black text-sky-300 group-hover:translate-x-0.5 transition-transform">
            <span>Sfoglia</span>
            <ChevronRight size={10} />
          </span>
        </div>
      </div>

      <DualBackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />
    </>
  )
}

export function GovernanceComplianceModal({ isOpen, onClose }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [viewAllPages, setViewAllPages] = useState(false)
  const [showBackupCenter, setShowBackupCenter] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (!viewAllPages && e.key === 'ArrowRight') {
        setCurrentPage((p) => (p < 4 ? p + 1 : 1))
      }
      if (!viewAllPages && e.key === 'ArrowLeft') {
        setCurrentPage((p) => (p > 1 ? p - 1 : 4))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, viewAllPages, onClose])

  if (!isOpen) return null

  const pagesToRender = viewAllPages
    ? GOVERNANCE_PAGES
    : GOVERNANCE_PAGES.filter((p) => p.page === currentPage)

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      style={{ fontFamily: '"Switzer", sans-serif' }}
    >
      <div
        className="w-[96vw] max-w-[1040px] h-[92vh] max-h-[92vh] bg-slate-900 rounded-3xl border-2 border-sky-400/70 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra Superiore del Dossier Sfogliabile */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-[#00ffaa]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-sm tracking-tight uppercase">
                  Dossier Direzione • Governance & Compliance CRM
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-[#00ffaa] border border-emerald-400/30">
                  4 Pagine Sfogliabili
                </span>
              </div>
              <p className="text-[11.5px] text-slate-400">
                Usa i pulsanti qui a fianco o le frecce della tastiera (← / →) per sfogliare le 4 pagine
              </p>
            </div>
          </div>

          {/* Selettore Pagine 1-4 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {GOVERNANCE_PAGES.map((item) => {
              const active = !viewAllPages && currentPage === item.page
              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => {
                    setViewAllPages(false)
                    setCurrentPage(item.page)
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0284c7] text-white shadow-sm ring-1 ring-sky-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  Pag. {item.page}
                </button>
              )
            })}

            <button
              type="button"
              onClick={() => setViewAllPages((v) => !v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                viewAllPages
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                  : 'bg-slate-800/90 text-sky-300 border-sky-500/40 hover:bg-slate-800'
              }`}
            >
              {viewAllPages ? 'Vista 1 Pagina' : 'Tutte le 4 Pagine'}
            </button>

            <button
              type="button"
              onClick={() => setShowBackupCenter(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-500/20 hover:bg-emerald-500/35 text-[#00ffaa] border border-emerald-400/50 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Apri il Centro Operativo dei 2 Sistemi di Backup (Sistema #1 Vault Locale + Sistema #2 Cloud AES-256-GCM)"
            >
              <Cloud size={13} />
              <span>2 Backup (Locale + Cloud)</span>
            </button>

            <a
              href="/governance-compliance-direttore.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 transition-all"
              title="Apri versione stampabile A4 / PDF in una nuova scheda"
            >
              <Printer size={13} />
              <span>Stampa / PDF</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
              title="Chiudi (ESC)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Corpo Sfogliabile */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-900/95 custom-popup-scrollbar">
          {pagesToRender.map((p) => (
            <div
              key={p.page}
              className="bg-white rounded-2xl border border-sky-200 shadow-xl p-6 sm:p-8 text-slate-900 flex flex-col justify-between"
            >
              <div>
                {/* Header Pagina */}
                <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b-2 border-slate-200">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-md bg-sky-100 text-[#0284c7] text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                      {p.kicker}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {p.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                      {p.subtitle}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black shrink-0">
                    {p.badge}
                  </span>
                </div>

                {/* 2 Card affiancate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  {p.cards.map((c, idx) => {
                    const toneStyles = {
                      sky: 'bg-gradient-to-b from-sky-50 to-sky-100/70 border-sky-300',
                      emerald: 'bg-gradient-to-b from-emerald-50 to-emerald-100/70 border-emerald-300',
                      amber: 'bg-gradient-to-b from-amber-50 to-amber-100/70 border-amber-300',
                      rose: 'bg-gradient-to-b from-rose-50 to-rose-100/70 border-rose-300',
                    }
                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl border-2 p-4 ${toneStyles[c.tone] || toneStyles.sky}`}
                      >
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-900/10 text-slate-900 text-[10px] font-black uppercase tracking-wider mb-1.5">
                          {c.tag}
                        </span>
                        <h3 className="text-base font-black text-slate-900 mb-1.5">
                          {c.title}
                        </h3>
                        <p className="text-xs text-slate-700 leading-relaxed mb-2 font-medium">
                          {c.desc}
                        </p>
                        <ul className="space-y-1.5">
                          {c.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="text-xs text-slate-800 leading-snug flex items-start gap-1.5">
                              <span className="text-[#0284c7] font-black mt-0.5">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>

                {/* Tabella Sintetica */}
                <h4 className="text-sm font-black text-slate-900 mb-2">
                  {p.tableTitle}
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-300 mb-5">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[11px] font-extrabold uppercase tracking-wider">
                        {p.tableHeaders.map((th, i) => (
                          <th key={i} className="py-2.5 px-3.5">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {p.tableRows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`py-2.5 px-3.5 text-slate-700 ${cIdx === 0 ? 'font-bold text-slate-900' : 'font-medium'}`}
                            >
                              {renderPill(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Callout Esecutivo */}
                <div className="rounded-2xl bg-slate-900 text-white p-4 border-l-4 border-[#38bdf8]">
                  <div className="text-xs font-black uppercase tracking-wider text-[#38bdf8] mb-1">
                    {p.calloutTitle}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {p.calloutText}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Barra Inferiore di Navigazione Sfogliabile */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setViewAllPages(false)
              setCurrentPage((p) => (p > 1 ? p - 1 : 4))
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <ChevronLeft size={15} />
            <span>Pagina Precedente</span>
          </button>

          <span className="text-xs font-bold text-slate-400">
            {viewAllPages ? 'Visualizzazione continua (Pagine 1–4)' : `Pagina ${currentPage} di 4`}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setViewAllPages(false)
                setCurrentPage((p) => (p < 4 ? p + 1 : 1))
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            >
              <span>Pagina Successiva</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <DualBackupModal
        isOpen={showBackupCenter}
        onClose={() => setShowBackupCenter(false)}
      />
    </div>
  )
}
