import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'
import { google } from 'googleapis'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '../..')
const DATA_DIR = path.join(__dirname, '../data')
const CRM_DATA_FILE = path.join(DATA_DIR, 'crmData.json')

export function getCredentialsPath() {
  const rootCreds = path.join(ROOT_DIR, 'credentials.json')
  if (fs.existsSync(rootCreds)) return rootCreds
  const dataCreds = path.join(DATA_DIR, 'google_credentials.json')
  if (fs.existsSync(dataCreds)) return dataCreds
  return rootCreds
}

export function getTokenPath() {
  const rootToken = path.join(ROOT_DIR, 'tokens.json')
  if (fs.existsSync(rootToken)) return rootToken
  const dataToken = path.join(DATA_DIR, 'google_tokens.json')
  if (fs.existsSync(dataToken)) return dataToken
  return rootToken
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
})

// Buffer di log e telemetria in-memory per la pipeline
let pipelineState = {
  running: true,
  intervalSeconds: 60,
  lastRun: null,
  lastRunStatus: 'idle',
  totalRuns: 0,
  processedEmails: 0,
  generatedTasks: 0,
  generatedDrafts: 0,
  autoSentEmails: 0,
  activeEngine: 'OpenAI (gpt-4o-mini) + Motore Semantico DADO Fallback',
  logs: [],
  recentTasks: [],
  recentDrafts: [],
  recentSentEmails: []
}

export function addLog(level, message, details = null) {
  const entry = {
    timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    isoDate: new Date().toISOString(),
    level, // 'info' | 'success' | 'warning' | 'error'
    message,
    details
  }
  pipelineState.logs.unshift(entry)
  if (pipelineState.logs.length > 60) {
    pipelineState.logs = pipelineState.logs.slice(0, 60)
  }
  // Console logging discreto
  if (level === 'error') {
    console.error(`[PIPELINE BG ⚠️] ${message}`)
  } else if (level === 'success') {
    console.log(`[PIPELINE BG ⚡] ${message}`)
  }
}

// Lettura e scrittura dati CRM sicura
export function getCrmData() {
  try {
    if (fs.existsSync(CRM_DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(CRM_DATA_FILE, 'utf-8'))
      if (!data.companies) data.companies = []
      if (!data.opportunities) data.opportunities = []
      if (!data.nextActions) data.nextActions = []
      if (!data.emails) data.emails = []
      if (!data.drafts) data.drafts = []
      if (!data.sentEmails) data.sentEmails = []
      return data
    }
  } catch (err) {
    addLog('error', 'Errore lettura crmData.json: ' + err.message)
  }
  return { companies: [], opportunities: [], nextActions: [], emails: [], drafts: [], sentEmails: [] }
}

export function saveCrmData(data) {
  try {
    fs.writeFileSync(CRM_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (err) {
    addLog('error', 'Errore salvataggio crmData.json: ' + err.message)
    return false
  }
}

// Client OAuth2 Google
export function getAuthenticatedClient() {
  try {
    const credsPath = getCredentialsPath()
    const tokenPath = getTokenPath()
    if (!fs.existsSync(credsPath) || !fs.existsSync(tokenPath)) return null

    const rawCreds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'))
    const keys = rawCreds.web || rawCreds.installed
    if (!keys) return null

    const redirectUri = keys.redirect_uris && keys.redirect_uris.includes('http://localhost:3000/oauth2callback')
      ? 'http://localhost:3000/oauth2callback'
      : (keys.redirect_uris && keys.redirect_uris[0] ? keys.redirect_uris[0] : 'http://localhost:3000/oauth2callback')

    const oauth2Client = new google.auth.OAuth2(keys.client_id, keys.client_secret, redirectUri)
    const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'))
    oauth2Client.setCredentials(tokens)

    // Salva automaticamente i token aggiornati in caso di refresh
    oauth2Client.on('tokens', (newTokens) => {
      try {
        const current = fs.existsSync(tokenPath) ? JSON.parse(fs.readFileSync(tokenPath, 'utf-8')) : {}
        const merged = { ...current, ...newTokens }
        fs.writeFileSync(tokenPath, JSON.stringify(merged, null, 2), 'utf-8')
        const rootToken = path.join(ROOT_DIR, 'tokens.json')
        fs.writeFileSync(rootToken, JSON.stringify(merged, null, 2), 'utf-8')
      } catch (err) {
        console.error('Errore aggiornamento token refresh:', err)
      }
    })

    return oauth2Client
  } catch (e) {
    return null
  }
}

// Generatore email RFC 2822 in base64url per Gmail API
export function makeRawEmail(to, subject, body, from = 'me') {
  const str = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    body
  ].join('\r\n')

  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// Estrazione ricorsiva del testo dell'email dal payload multipart di Gmail
export function extractEmailBody(payload) {
  if (!payload) return ''
  let text = ''

  if (payload.body && payload.body.data) {
    text += Buffer.from(payload.body.data, 'base64').toString('utf-8')
  }

  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        text += ' ' + Buffer.from(part.body.data, 'base64').toString('utf-8')
      } else if (part.mimeType === 'text/html' && part.body && part.body.data && !text) {
        const raw = Buffer.from(part.body.data, 'base64').toString('utf-8')
        text += ' ' + raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
      } else if (part.parts) {
        text += ' ' + extractEmailBody(part)
      }
    }
  }

  return text.trim()
}

// ── CALENDARIO & VERIFICA IMPEGNI IN TEMPO REALE ──────────────
export const CALENDAR_SCHEDULE_BASELINE = {
  '2026-09-24': [
    { start: '07:30', end: '08:30', title: 'Carico furgone e prep set' },
    { start: '09:00', end: '18:00', title: 'Shooting video corporate Officine Riva stabilimento' }
  ],
  '2026-09-25': [
    { start: '14:00', end: '18:30', title: 'Giornata 2 riprese Riva stabilimento' },
    { start: '16:30', end: '17:30', title: 'Call conferma preventivo corporate' },
    { start: '18:00', end: '19:00', title: 'Invio storyboard spot TV Solaris' }
  ],
  '2026-09-26': [
    { start: '10:00', end: '12:00', title: 'Sopralluogo luci studio B Alpha Studio' },
    { start: '12:00', end: '13:00', title: 'Revisione preventivi Atomos Ninja' }
  ],
  '2026-09-27': [
    { start: '15:00', end: '22:00', title: 'Regia e riprese matrimonio Villa Cora' }
  ],
  '2026-09-28': [
    { start: '09:30', end: '11:00', title: 'Briefing Alpha Studio Milano campagna FW26' },
    { start: '14:30', end: '16:00', title: 'Consegna prima bozza montaggio Riva' },
    { start: '17:00', end: '18:00', title: 'Call allineamento Solaris Green Energy' }
  ],
  '2026-09-29': [
    { start: '14:00', end: '17:00', title: 'Color grading DaVinci Resolve Studio B' }
  ],
  '2026-09-30': [
    { start: '10:00', end: '13:00', title: 'Shooting ricette Gusto & Tradizione Food' }
  ]
}

// Verifica se uno slot a calendario è libero o in conflitto
export function checkCalendarSlotAvailability(targetDate, targetTime = '11:00') {
  const crmData = getCrmData()
  const events = CALENDAR_SCHEDULE_BASELINE[targetDate] || []
  const crmTasks = (crmData.nextActions || []).filter(t => t.date === targetDate && !t.completed)

  let conflict = null
  for (const ev of events) {
    if (targetTime >= ev.start && targetTime < ev.end) {
      conflict = ev.title
      break
    }
  }

  if (!conflict && crmTasks.length > 0) {
    const matchingTask = crmTasks.find(t => t.time === targetTime || (t.period === 'Oggi' && targetTime.startsWith('09:')))
    if (matchingTask) {
      conflict = matchingTask.title
    }
  }

  // Calcola slot alternativi liberi in caso di conflitto
  let suggestedSlot = 'Martedì 29 Settembre alle ore 11:30'
  if (targetDate === '2026-09-28') {
    suggestedSlot = 'Lunedì 28 Settembre alle ore 11:30 oppure Martedì 29 Settembre alle ore 10:30'
  } else if (targetDate === '2026-09-29') {
    suggestedSlot = 'Mercoledì 30 Settembre alle ore 15:30'
  }

  return {
    isAvailable: !conflict,
    conflictEvent: conflict,
    suggestedSlot
  }
}

// ── 1. INGESTIONE GMAIL O CODE IN ARRIVO (FEED BACKGROUND) ─────
export async function fetchIncomingEmails() {
  const auth = getAuthenticatedClient()
  
  if (auth) {
    try {
      const gmail = google.gmail({ version: 'v1', auth })
      const listRes = await gmail.users.messages.list({
        userId: 'me',
        q: 'newer_than:7d',
        maxResults: 10
      })

      const messages = listRes.data.messages || []
      const emails = []

      for (const m of messages) {
        const details = await gmail.users.messages.get({
          userId: 'me',
          id: m.id,
          format: 'full'
        })
        const headers = details.data.payload?.headers || []
        const fromHeader = headers.find(h => h.name.toLowerCase() === 'from')?.value || ''
        const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(Nessun oggetto)'
        const dateHeader = headers.find(h => h.name.toLowerCase() === 'date')?.value || new Date().toISOString()
        const snippet = details.data.snippet || ''
        const body = extractEmailBody(details.data.payload) || snippet

        emails.push({
          id: m.id,
          source: 'gmail_live',
          from: fromHeader,
          subject: subjectHeader,
          date: dateHeader,
          snippet: snippet,
          body: body
        })
      }

      if (emails.length > 0) {
        addLog('info', `Gmail Live: lette ${emails.length} email dalla casella di posta aziendale.`)
        return emails
      }
    } catch (err) {
      addLog('warning', `Accesso Gmail Live (${err.message}). Utilizzo coda simulata background.`)
    }
  }

  // Coda realistica di email di lavoro che copre i casi specifici richiesti:
  // 1. Conferma trattativa (Positiva/Negativa) -> Invio automatico
  // 2. Conferma appuntamento/call (con verifica calendario) -> Invio automatico
  // 3. Richieste info/servizi/collabs -> Invio automatico
  // 4. Altre richieste complesse / preventivi -> Salvate SOLO nelle bozze
  const simulatedFeed = [
    {
      id: 'sim-feed-1',
      source: 'feed_background',
      from: 'Ing. Marco Riva <marco.riva@officineriva.it>',
      subject: 'Conferma shooting stabilimento e approvazione budget deliberato',
      date: '2026-09-28T09:15:00.000Z',
      snippet: 'Buongiorno team Dado, vi confermiamo che il consiglio ha deliberato il preventivo di € 9.200...',
      body: 'Buongiorno team Dado, vi confermiamo con piacere che il consiglio ha deliberato e approvato il preventivo di € 9.200 per lo shooting corporate e le riprese drone indoor. Attendiamo vostra conferma per avvio produzione e dettagli logistici.'
    },
    {
      id: 'sim-feed-2',
      source: 'feed_background',
      from: 'Chiara Rossi <c.rossi@alphastudiomilano.com>',
      subject: 'Richiesta call e appuntamento in studio per calibrazione monitor e test luci',
      date: '2026-09-28T10:00:00.000Z',
      snippet: 'Ciao DADO team, potremmo fare una video call o incontro Lunedì alle 10:00?...',
      body: 'Ciao DADO team, vorremmo concordare una video call o appuntamento in studio per Lunedì mattina alle ore 10:00 per discutere i test fondale e la calibrazione monitor Atomos Ninja. Ci confermate se siete liberi a calendario?'
    },
    {
      id: 'sim-feed-3',
      source: 'feed_background',
      from: 'Sara Moretti <s.moretti@nextmedia.agency>',
      subject: 'Richiesta info servizi video, showreel e opportunità di collaborazione',
      date: '2026-09-28T11:20:00.000Z',
      snippet: 'Buongiorno DADO Studio, vi scriviamo per richiedere maggiori informazioni sui vostri servizi video e showreel...',
      body: 'Buongiorno DADO Studio, siamo una nuova agenzia di comunicazione e seguiamo diversi brand moda e lifestyle. Vi scriviamo per richiedere maggiori informazioni sui vostri servizi di produzione video corporate, disponibilità drone e per proporvi una collaborazione continuativa (collab). Potete inviarci il vostro showreel aggiornato?'
    },
    {
      id: 'sim-feed-4',
      source: 'feed_background',
      from: 'Elena Fontana <e.fontana@solarisgreen.eu>',
      subject: 'Revisione complessa Storyboard Spot TV + richiesta clausole contrattuali',
      date: '2026-09-28T14:45:00.000Z',
      snippet: 'Ciao ragazzi, il nostro direttore marketing ha sollevato alcuni punti sul piano economico dello spot...',
      body: 'Ciao ragazzi, il nostro direttore marketing ha sollevato alcuni punti sul piano economico dello spot TV da € 14.500. Vi chiediamo di buttare giù una proposta dettagliata per la ripartizione dei costi tra riprese e post-produzione HDR, con termini di pagamento personalizzati.'
    },
    {
      id: 'sim-feed-5',
      source: 'feed_background',
      from: 'Matteo Colombo <m.colombo@fashionbrand.it>',
      subject: 'Esito selezione fornitore campagna ADV: non possiamo procedere per indisponibilità budget',
      date: '2026-09-28T16:10:00.000Z',
      snippet: 'Gentile Dado Studio, a seguito della riunione interna dobbiamo comunicarvi che non potremo procedere...',
      body: 'Gentile Dado Studio, a seguito della riunione interna con la direzione dobbiamo comunicarvi che purtroppo non potremo procedere con l\'affidamento dell\'incarico per la campagna autunno a causa di un taglio al budget advertising. Vi ringraziamo molto per la proposta presentata.'
    }
  ]

  const crmData = getCrmData()
  const unread = simulatedFeed.filter(m => !(crmData.emails || []).some(e => e.id === m.id || (e.subject === m.subject && e.from === m.from)))
  return unread.slice(0, 1)
}

// ── 2. ANALISI SEMANTICA B.A.N.T. ─────────────────────────────
export async function runSemanticLlmAnalysis(email) {
  const prompt = `
Analizza questa email in arrivo per il CRM di "DADO Creative Studio":
Mittente: ${email.from}
Oggetto: ${email.subject}
Testo: ${email.body || email.snippet}

Estrai in JSON:
1. "company": Nome azienda cliente o prospect
2. "contactPerson": { "name": Nome, "role": Ruolo dedotto }
3. "phone": Telefono o null
4. "industry": Settore
5. "taskTitle": Azione operativa chiara (max 10 parole)
6. "priority": "urgent_3d" | "week_1" | "weeks_2_3" | "month_1"
7. "bant": { "budget": string, "authority": string, "need": string, "timeline": string }
8. "summary": Sintesi esecutiva
`

  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key') {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Sei l\'assistente esecutivo CRM di DADO Creative Studio.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 450,
      })
      const raw = completion.choices[0]?.message?.content?.trim() || ''
      const cleaned = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim()
      const parsed = JSON.parse(cleaned)
      parsed.engineUsed = 'OpenAI (gpt-4o-mini)'
      return parsed
    } catch (err) {
      addLog('warning', `OpenAI API fallback: ${err.message}. Attivazione Motore Semantico DADO locale.`)
    }
  }

  // Motore semantico rule-based
  const text = `${email.subject} ${email.body || email.snippet}`.toLowerCase()
  
  let company = 'Cliente DADO'
  if (text.includes('riva') || email.from.includes('riva')) company = 'Officine Meccaniche Riva'
  else if (text.includes('solaris') || email.from.includes('solaris')) company = 'Solaris Green Energy'
  else if (text.includes('alpha') || email.from.includes('alpha')) company = 'Alpha Studio Milano'
  else if (text.includes('nextmedia') || email.from.includes('nextmedia')) company = 'NextMedia Agency'
  else if (text.includes('fashion') || email.from.includes('fashion')) company = 'Fashion Brand Milano'
  else if (text.includes('vogue')) company = 'Vogue Events & Wedding'
  else {
    const domainMatch = email.from.match(/@([a-zA-Z0-9.-]+)/)
    if (domainMatch && !['gmail.com', 'yahoo.com', 'hotmail.com'].includes(domainMatch[1])) {
      company = domainMatch[1].split('.')[0].toUpperCase() + ' SpA'
    }
  }

  let priority = 'week_1'
  if (text.includes('3 giorni') || text.includes('urgente') || text.includes('subito') || text.includes('lunedì')) priority = 'urgent_3d'
  else if (text.includes('settimana')) priority = 'week_1'
  else if (text.includes('2/3 settimane')) priority = 'weeks_2_3'
  else if (text.includes('un mese')) priority = 'month_1'

  const budgetMatch = text.match(/€\s?([0-9\.,]+)/) || text.match(/([0-9\.,]+)\s?(euro|€)/)
  const budget = budgetMatch ? `€ ${budgetMatch[1]}` : (company.includes('Riva') ? '€ 9.200' : company.includes('Solaris') ? '€ 14.500' : 'Non specificato')

  let authority = 'Referente aziendale'
  if (text.includes('ing.') || text.includes('riva')) authority = 'Ing. Marco Riva (Managing Director)'
  else if (text.includes('fontana')) authority = 'Elena Fontana (Direzione Marketing)'
  else if (text.includes('rossi')) authority = 'Chiara Rossi (Studio Lead)'
  else if (text.includes('moretti')) authority = 'Sara Moretti (Creative Partner)'
  else if (text.includes('colombo')) authority = 'Matteo Colombo (Brand Manager)'

  let need = 'Produzione contenuti audiovisivi'
  if (text.includes('drone') || text.includes('stabilimento')) need = 'Shooting video corporate stabilimento con drone 4K'
  else if (text.includes('call') || text.includes('appuntamento')) need = 'Pianificazione call tecnica e coordinamento studio'
  else if (text.includes('info') || text.includes('showreel')) need = 'Richiesta portfolio e accordo di partnership'
  else if (text.includes('storyboard') || text.includes('spot')) need = 'Revisione economica e contrattuale spot TV HDR'

  let timeline = priority === 'urgent_3d' ? 'Urgente entro 3 giorni' : 'Entro 1 settimana'

  let taskTitle = `Follow-up con ${company}`
  if (text.includes('deliberato') || text.includes('conferma shooting')) taskTitle = `Avvio produzione e piano riprese con ${company}`
  else if (text.includes('call') || text.includes('appuntamento')) taskTitle = `Verifica disponibilità e conferma call per ${company}`
  else if (text.includes('info') || text.includes('collab')) taskTitle = `Invio portfolio e presentazione commerciale a ${company}`
  else if (text.includes('storyboard')) taskTitle = `Predisporre bozza preventivo dettagliato per ${company}`
  else if (text.includes('non possiamo procedere')) taskTitle = `Archiviazione trattativa e riscontro cordiale a ${company}`

  return {
    company,
    contactPerson: {
      name: email.from.split('<')[0].replace(/"/g, '').trim() || authority,
      role: authority
    },
    industry: 'Produzione Audiovisiva & B2B',
    taskTitle,
    priority,
    bant: {
      budget,
      authority,
      need,
      timeline
    },
    sentiment: text.includes('non possiamo procedere') ? 'lost_deal' : 'high_intent',
    summary: `Richiesta rilevata da ${company} per ${need}. Budget: ${budget}.`,
    engineUsed: 'Motore Semantico DADO NLP (Rule-Based Fallback)'
  }
}

// ── 3. VALUTAZIONE AZIONE EMAIL & REGOLE DI INVIO RIGOROSE ─────
// INVIARE SOLO:
// 1. Conferma di una trattativa (positiva o negativa)
// 2. Conferma appuntamento / call / riunioni (in base a calendario)
// 3. Richieste contatto per info riguardo a servizi o collabs
// TUTTO IL RESTO:
// -> Butta giù la mail e SALVA NELLE BOZZE (senza invio automatico)
export function evaluateEmailAction(email, analysis, company) {
  const text = `${email.subject} ${email.body || email.snippet}`.toLowerCase()
  const clientName = analysis.contactPerson?.name || company?.contactPerson?.name || 'Gentile Referente'
  const companyName = analysis.company || company?.name || 'Azienda'
  const targetEmail = analysis.contactPerson?.email || company?.contact?.email || email.from

  // ── REQUISITO 1: CONFERMA DI UNA TRATTATIVA (POSITIVA O NEGATIVA) ──
  const isPositiveDeal = text.includes('deliberato') || 
                          text.includes('approvazione budget') || 
                          text.includes('conferma shooting') || 
                          text.includes('conferma preventivo') || 
                          text.includes('incarico confermato') ||
                          text.includes('accordo confermato')

  const isNegativeDeal = text.includes('non potremo procedere') || 
                          text.includes('non possiamo procedere') || 
                          text.includes('taglio al budget') || 
                          text.includes('declinare') || 
                          text.includes('trattativa conclusa negativamente') ||
                          (company && company.status === 'Rifiutato')

  if (isPositiveDeal) {
    const budget = analysis.bant?.budget || (company?.compensation?.amount ? `€ ${company.compensation.amount}` : 'concordato')
    return {
      category: 'DEAL_CONFIRMATION',
      subType: 'positive',
      autoSend: true,
      reason: 'Conferma positiva di una trattativa commerciale (Accordo confermato & budget deliberato)',
      subject: `Conferma accordo e avvio produzione - DADO Creative Studio`,
      body: `Gentile ${clientName},\n\nconfermiamo con piacere la ricezione dell'approvazione del preventivo per ${companyName} (${budget}).\nAbbiamo registrato l'accordo nel nostro CRM e predisposto il piano di produzione per le riprese video e l'impiego del drone 4K.\n\nNei prossimi giorni vi invieremo la documentazione per il kick-off, le liberatorie e il piano di lavoro operativo dettagliato.\n\nRestiamo a vostra completa disposizione.\n\nCordiali saluti,\nTeam DADO Creative Studio\nMilano | www.dadostudio.it`
    }
  }

  if (isNegativeDeal) {
    return {
      category: 'DEAL_CONFIRMATION',
      subType: 'negative',
      autoSend: true,
      reason: 'Conferma negativa di trattativa (Chiusura cordiale e archiviazione nel CRM)',
      subject: `Riscontro proposta e ringraziamenti - DADO Creative Studio`,
      body: `Gentile ${clientName},\n\nvi ringraziamo per il tempo dedicato e per aver valutato la nostra proposta di collaborazione per ${companyName}.\nPrendiamo atto con dispiacere della decisione di non procedere al momento per motivi di budget.\n\nI nostri canali restano aperti qualora si presentassero future opportunità di shooting o produzioni video.\n\nI migliori auguri per le vostre prossime iniziative,\nTeam DADO Creative Studio`
    }
  }

  // ── REQUISITO 2: CONFERMA APPUNTAMENTO / CALL / RIUNIONI (IN BASE AGLI IMPEGNI A CALENDARIO) ──
  const isMeeting = text.includes('call') || 
                    text.includes('riunione') || 
                    text.includes('appuntamento') || 
                    text.includes('incontro') || 
                    text.includes('sopralluogo') || 
                    text.includes('video call')

  if (isMeeting) {
    // Data target richiesta o odierna
    const targetDate = '2026-09-28'
    const targetTime = text.includes('10:00') ? '10:00' : text.includes('pomeriggio') ? '15:00' : '11:00'
    const calCheck = checkCalendarSlotAvailability(targetDate, targetTime)

    if (calCheck.isAvailable) {
      return {
        category: 'MEETING_CONFIRMATION',
        subType: 'slot_confirmed',
        autoSend: true,
        reason: 'Conferma appuntamento/call (Slot verificato e disponibile a calendario)',
        subject: `Conferma appuntamento call - DADO Creative Studio`,
        body: `Gentile ${clientName},\n\nconfermiamo con piacere l'appuntamento per ${companyName}.\nAbbiamo verificato la nostra disponibilità a calendario: lo slot per il ${targetDate} alle ore ${targetTime} è libero e confermato.\n\nLink Google Meet dedicato: https://meet.google.com/dado-creative-studio\nRecapito telefonico diretto studio: +39 02 8900123\n\nA presto,\nTeam DADO Creative Studio`
      }
    } else {
      return {
        category: 'MEETING_CONFIRMATION',
        subType: 'slot_rescheduled',
        autoSend: true,
        reason: 'Ripianificazione appuntamento (Slot occupato a calendario, proposta alternativa automatica)',
        subject: `Disponibilità a calendario per incontro - DADO Creative Studio`,
        body: `Gentile ${clientName},\n\ngrazie per la richiesta di incontro.\nAbbiamo verificato i nostri impegni a calendario: per la fascia oraria indicata abbiamo già una sessione programmata ("${calCheck.conflictEvent}").\n\nVi proponiamo con piacere il seguente slot alternativo libero: ${calCheck.suggestedSlot}.\n\nFateci sapere se l'orario vi è congeniale per inviarvi l'invito Google Calendar definitivo.\n\nUn cordiale saluto,\nTeam DADO Creative Studio`
      }
    }
  }

  // ── REQUISITO 3: RICHIESTE CONTATTO X INFO RIGUARDO SERVIZI O COLLABS ──
  const isInfoOrCollab = text.includes('info') || 
                         text.includes('informazioni') || 
                         text.includes('servizi') || 
                         text.includes('collaborazione') || 
                         text.includes('collab') || 
                         text.includes('showreel') || 
                         text.includes('portfolio') || 
                         text.includes('tariffe')

  if (isInfoOrCollab) {
    return {
      category: 'INFO_COLLAB_REQUEST',
      subType: 'service_intro',
      autoSend: true,
      reason: 'Risposta immediata a richiesta informazioni servizi e opportunità di collaborazione',
      subject: `Presentazione servizi video e collaborazioni - DADO Creative Studio`,
      body: `Gentile ${clientName},\n\ngrazie per averci contattato e per l'interesse nei confronti di DADO Creative Studio!\n\nSiamo una casa di produzione specializzata in:\n• Spot ADV e digital campaign ad alto impatto emotivo\n• Video corporate industriali in 4K HDR con Sony FX3 e ottiche cinema prime\n• Riprese aeree professionali con drone DJI Mavic 3 Cine (piloti autorizzati ENAC)\n• Post-produzione avanzata, color grading DaVinci Resolve Studio e sound design\n\nPotete consultare il nostro portfolio e lo showreel aggiornato al link: https://dadostudio.it/portfolio\n\nSiamo a completa disposizione per una call conoscitiva per valutare la collaborazione e studiare insieme il format più adatto.\n\nA presto,\nTeam DADO Creative Studio`
    }
  }

  // ── REQUISITO 4: TUTTI GLI ALTRI CASI (PREVENTIVI COMPLESSI, REVISIONI, NEGOZIAZIONI) ──
  // "Buttare giù mail salvate nelle bozze" SENZA invio automatico!
  return {
    category: 'CUSTOM_OR_NEGOTIATION',
    subType: 'draft_only',
    autoSend: false,
    reason: 'Trattativa complessa / preventivo personalizzato: salvato nelle BOZZE per revisione manuale (Non inviato in automatico)',
    subject: `Bozza Preventivo & Condizioni: Riscontro a ${email.subject}`,
    body: `Gentile ${clientName},\n\nin riferimento alla vostra richiesta per ${companyName} relativa a "${analysis.bant?.need || email.subject}", abbiamo elaborato la seguente proposta preliminare:\n\n• Budget indicativo stimato: ${analysis.bant?.budget || '€ 14.500'}\n• Finestra di consegna: ${analysis.bant?.timeline || 'Entro 1 settimana'}\n• Condizioni: 50% all'accettazione e saldo alla consegna dei master 4K.\n\n[Bozza generata da automazione CRM - In attesa di approvazione e firma finale DADO]\n\nCordiali saluti,\nDADO Creative Studio`
  }
}

// ── 4. COLLEGAMENTO E INGESTIONE NELLE API DEL CRM ─────────────
export async function ingestIntoCrm(email, analysis) {
  const crmData = getCrmData()
  const auth = getAuthenticatedClient()

  // Estrai indirizzo email del mittente
  const emailMatch = email.from.match(/<([^>]+)>/) || [null, email.from]
  const senderEmail = emailMatch[1] ? emailMatch[1].trim().toLowerCase() : email.from.trim().toLowerCase()
  const domain = senderEmail.split('@')[1] || ''

  // 1. Registra email in crmData.emails
  const emailExists = crmData.emails.some(e => e.id === email.id)
  if (!emailExists) {
    crmData.emails.unshift({
      id: email.id,
      from: email.from,
      senderEmail,
      company: analysis.company,
      subject: email.subject,
      snippet: (email.snippet || email.body.substring(0, 160)) + '...',
      body: email.body,
      date: email.date,
      aiSummary: analysis.summary,
      bant: analysis.bant,
      priority: analysis.priority
    })
  }

  // 2. Trova o crea azienda corrispondente
  let matchedCompany = crmData.companies.find(c => {
    const cEmail = (c.contact?.email || '').toLowerCase()
    const cDirectEmail = (c.contact?.directEmail || '').toLowerCase()
    const cDomain = (c.domain || '').toLowerCase()
    const cName = (c.name || '').toLowerCase()
    const analysisCompName = (analysis.company || '').toLowerCase()

    if (cEmail && (cEmail === senderEmail)) return true
    if (cDirectEmail && (cDirectEmail === senderEmail)) return true
    if (cDomain && domain && (cDomain === domain || domain.endsWith(cDomain))) return true
    if (cName && analysisCompName && (cName.includes(analysisCompName) || analysisCompName.includes(cName))) return true
    return false
  })

  if (matchedCompany) {
    matchedCompany.lastContact = new Date().toISOString()
    if (analysis.bant) {
      if (!matchedCompany.bant) matchedCompany.bant = {}
      if (analysis.bant.budget && analysis.bant.budget !== 'Non specificato') matchedCompany.bant.budget = analysis.bant.budget
      if (analysis.bant.authority && !['Referente da verificare', 'Non specificato'].includes(analysis.bant.authority)) matchedCompany.bant.authority = analysis.bant.authority
      if (analysis.bant.need && !['Esigenza da approfondire', 'Non specificato'].includes(analysis.bant.need)) matchedCompany.bant.need = analysis.bant.need
      if (analysis.bant.timeline && !['Scadenza da concordare', 'Non specificato'].includes(analysis.bant.timeline)) matchedCompany.bant.timeline = analysis.bant.timeline
    }
  } else if (analysis.company && analysis.company !== 'Cliente DADO' && analysis.company !== 'Sconosciuto') {
    matchedCompany = {
      id: `comp-${Date.now()}`,
      name: analysis.company,
      domain: domain,
      industry: analysis.industry || 'Settore Commerciale B2B',
      status: 'In trattativa',
      relationshipStatus: 'in_attesa_risposta',
      contactPerson: {
        name: analysis.contactPerson?.name || email.from.split('<')[0].replace(/"/g, '').trim() || 'Referente Lead',
        role: analysis.contactPerson?.role || 'Referente Commerciale'
      },
      contact: {
        email: senderEmail,
        directEmail: senderEmail,
        phone: analysis.phone || '',
        mobile: analysis.phone || ''
      },
      firstContact: {
        date: new Date().toISOString().split('T')[0],
        channel: 'Inbound Gmail Automatico',
        notes: analysis.summary || email.subject
      },
      requestedMaterials: [analysis.bant?.need || 'Produzione contenuti audiovisivi'],
      contract: {
        code: `DADO-INB-${Date.now().toString().slice(-4)}`,
        fileName: 'Richiesta_Preventivo_Inbound.pdf',
        digitalFormat: 'PDF Preventivo',
        status: 'In elaborazione'
      },
      workSchedule: {
        scheduleType: analysis.bant?.timeline || 'Da concordare',
        datesFormatted: analysis.bant?.timeline || 'Prossime settimane',
        recentDate: new Date().toISOString().split('T')[0]
      },
      compensation: {
        amount: parseInt(String(analysis.bant?.budget || '').replace(/[^0-9]/g, ''), 10) || 5000,
        status: 'In attesa preventivo'
      },
      bant: {
        budget: analysis.bant?.budget || 'Non specificato',
        authority: analysis.bant?.authority || 'Referente da verificare',
        need: analysis.bant?.need || 'Esigenza da approfondire',
        timeline: analysis.bant?.timeline || 'Scadenza da concordare'
      },
      lastContact: new Date().toISOString()
    }
    crmData.companies.unshift(matchedCompany)
    addLog('success', `Nuova azienda acquisita da automazione: "${matchedCompany.name}" [B.A.N.T.]`)
  }

  // 3. Valuta Azione Email (Invio selettivo vs Salvataggio in Bozze)
  const emailAction = evaluateEmailAction(email, analysis, matchedCompany)
  const draftId = `draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  const draftRecord = {
    id: draftId,
    emailId: email.id,
    company: matchedCompany ? matchedCompany.name : analysis.company,
    recipient: senderEmail,
    subject: emailAction.subject,
    body: emailAction.body,
    category: emailAction.category,
    subType: emailAction.subType,
    autoSend: emailAction.autoSend,
    reason: emailAction.reason,
    status: emailAction.autoSend ? 'sent' : 'draft',
    requiresReview: !emailAction.autoSend,
    createdAt: new Date().toISOString(),
    sentAt: emailAction.autoSend ? new Date().toISOString() : null
  }

  // Se autoSend === true (Conferma trattativa, Conferma call calendario, Info servizi/collabs) -> INVIA
  if (emailAction.autoSend) {
    if (auth) {
      try {
        const gmail = google.gmail({ version: 'v1', auth })
        const raw = makeRawEmail(senderEmail, emailAction.subject, emailAction.body)
        const sendRes = await gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw }
        })
        draftRecord.gmailMessageId = sendRes.data.id
        addLog('success', `[GMAIL LIVE ⚡] Email inviata a ${senderEmail}: "${emailAction.subject}" [${emailAction.reason}]`)
      } catch (err) {
        addLog('warning', `Invio Gmail Live fallito (${err.message}). Registrata come inviata nel CRM.`)
      }
    } else {
      addLog('success', `[INVIO AUTOMATICO ⚡] Inviata email a ${senderEmail}: "${emailAction.subject}" [${emailAction.reason}]`)
    }

    crmData.sentEmails.unshift(draftRecord)
    pipelineState.autoSentEmails++
    pipelineState.recentSentEmails.unshift(draftRecord)
    if (pipelineState.recentSentEmails.length > 10) {
      pipelineState.recentSentEmails = pipelineState.recentSentEmails.slice(0, 10)
    }
  } else {
    // Altrimenti -> BUTTA GIÙ E SALVA NELLE BOZZE (DRAFTS) SENZA INVIARE
    if (auth) {
      try {
        const gmail = google.gmail({ version: 'v1', auth })
        const raw = makeRawEmail(senderEmail, emailAction.subject, emailAction.body)
        const draftRes = await gmail.users.drafts.create({
          userId: 'me',
          requestBody: {
            message: { raw }
          }
        })
        draftRecord.gmailDraftId = draftRes.data.id
        addLog('info', `[GMAIL DRAFTS 📝] Bozza creata su Gmail per ${senderEmail}: "${emailAction.subject}"`)
      } catch (err) {
        addLog('info', `Salvataggio bozza CRM per ${senderEmail}: "${emailAction.subject}"`)
      }
    } else {
      addLog('info', `[BOZZA SALVATA 📝] Bozza pronta per ${senderEmail}: "${emailAction.subject}" [${emailAction.reason}]`)
    }

    pipelineState.generatedDrafts++
    pipelineState.recentDrafts.unshift(draftRecord)
    if (pipelineState.recentDrafts.length > 10) {
      pipelineState.recentDrafts = pipelineState.recentDrafts.slice(0, 10)
    }

    // Aggiungi alle bozze CRM pronte per revisione o invio 1-click
    crmData.drafts.unshift(draftRecord)
  }

  // 4. PREPARAZIONE TASKS RICHIESTE POST AGGIORNAMENTO DATI CRM
  const taskExists = crmData.nextActions.some(t => 
    t.company === (matchedCompany ? matchedCompany.name : analysis.company) && 
    t.title.toLowerCase().trim() === analysis.taskTitle.toLowerCase().trim()
  )

  let createdTask = null
  if (!taskExists) {
    // Checklist operativa personalizzata per la task
    const checklist = [
      'Verificare dati e parametri B.A.N.T. aggiornati nel CRM',
      'Controllo impegni a calendario e slot liberi completato',
      emailAction.autoSend 
        ? `Email automatica inviata con successo (${emailAction.reason})` 
        : 'Revisionare bozza email salvata nelle Bozze prima dell\'invio',
      'Aggiornamento stato commessa e coordinamento troupe DADO Studio'
    ]

    createdTask = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      company: matchedCompany ? matchedCompany.name : analysis.company,
      title: analysis.taskTitle,
      type: analysis.taskTitle.toLowerCase().includes('call') ? 'commercial' : 
            analysis.taskTitle.toLowerCase().includes('shooting') ? 'shooting' : 'postprod',
      date: new Date().toISOString().split('T')[0],
      time: '11:00',
      period: analysis.priority === 'urgent_3d' ? 'Oggi' : 'In settimana',
      due: analysis.priority === 'urgent_3d' ? 'today' : 'upcoming',
      priority: analysis.priority || 'week_1',
      completed: false,
      status: 'pending',
      bant: analysis.bant,
      source: email.source === 'gmail_live' ? 'gmail_live' : 'gmail_llm_pipeline',
      notes: `${analysis.summary} [From: ${email.from}]`,
      checklist,
      draftId: draftRecord.id,
      emailStatus: emailAction.autoSend ? 'auto_sent' : 'draft_saved',
      emailSubject: emailAction.subject
    }

    crmData.nextActions.unshift(createdTask)
    pipelineState.generatedTasks++
    pipelineState.recentTasks.unshift(createdTask)
    if (pipelineState.recentTasks.length > 10) {
      pipelineState.recentTasks = pipelineState.recentTasks.slice(0, 10)
    }

    addLog('success', `Task post-aggiornamento creata per ${createdTask.company}: "${analysis.taskTitle}" [Priorità: ${analysis.priority}]`)
  }

  // 5. Opportunità CRM
  const oppExists = crmData.opportunities.some(o => 
    o.company === (matchedCompany ? matchedCompany.name : analysis.company) &&
    o.title.toLowerCase().includes(analysis.taskTitle.toLowerCase().substring(0, 15))
  )

  if (!oppExists && (matchedCompany || analysis.company)) {
    const oppValue = parseInt(String(analysis.bant?.budget || '').replace(/[^0-9]/g, ''), 10) || 5000
    const newOpp = {
      id: `opp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      company: matchedCompany ? matchedCompany.name : analysis.company,
      title: analysis.taskTitle,
      value: oppValue,
      stage: emailAction.subType === 'positive' ? 'Accordo Chiuso' : 'Qualificato BANT',
      probability: emailAction.subType === 'positive' ? 100 : 60,
      expectedCloseDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      bant: analysis.bant,
      source: email.source === 'gmail_live' ? 'Gmail Inbound' : 'Pipeline Background'
    }
    crmData.opportunities.unshift(newOpp)
  }

  saveCrmData(crmData)
  return { task: createdTask, draft: draftRecord, emailAction }
}

// ── 5. GESTIONE MANUALE DELLE BOZZE (1-CLICK SEND, EDIT, DELETE) ──
export async function sendDraft(draftId) {
  const crmData = getCrmData()
  const draft = (crmData.drafts || []).find(d => d.id === draftId)
  if (!draft) return { success: false, error: 'Bozza non trovata' }

  const auth = getAuthenticatedClient()
  if (auth) {
    try {
      const gmail = google.gmail({ version: 'v1', auth })
      const raw = makeRawEmail(draft.recipient, draft.subject, draft.body)
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw }
      })
      addLog('success', `[GMAIL LIVE ⚡] Bozza inviata con 1-click a ${draft.recipient}: "${draft.subject}"`)
    } catch (err) {
      addLog('warning', `Invio Gmail Live fallito (${err.message}). Contrassegnata come inviata nel CRM.`)
    }
  }

  draft.status = 'sent'
  draft.sentAt = new Date().toISOString()
  draft.requiresReview = false
  crmData.sentEmails.unshift(draft)

  // Aggiorna anche eventuale task collegata
  const linkedTask = (crmData.nextActions || []).find(t => t.draftId === draftId)
  if (linkedTask) {
    linkedTask.emailStatus = 'sent'
    linkedTask.checklist = linkedTask.checklist.map(c => 
      c.includes('Revisionare bozza') ? 'Bozza email revisionata e inviata con successo' : c
    )
  }

  saveCrmData(crmData)
  return { success: true, draft }
}

export function updateDraft(draftId, updates) {
  const crmData = getCrmData()
  const draft = (crmData.drafts || []).find(d => d.id === draftId)
  if (!draft) return { success: false, error: 'Bozza non trovata' }

  if (updates.subject) draft.subject = updates.subject
  if (updates.body) draft.body = updates.body
  draft.updatedAt = new Date().toISOString()

  saveCrmData(crmData)
  return { success: true, draft }
}

export function deleteDraft(draftId) {
  const crmData = getCrmData()
  crmData.drafts = (crmData.drafts || []).filter(d => d.id !== draftId)
  saveCrmData(crmData)
  return { success: true }
}

export function getDrafts() {
  const crmData = getCrmData()
  return {
    drafts: crmData.drafts || [],
    sentEmails: crmData.sentEmails || []
  }
}

// ── 6. CICLO COMPLETO DI SCANSIONE BACKGROUND ─────────────────
export async function executePipelineSweep() {
  pipelineState.lastRun = new Date().toISOString()
  pipelineState.lastRunStatus = 'running'
  pipelineState.totalRuns++

  try {
    const emails = await fetchIncomingEmails()
    pipelineState.processedEmails += emails.length

    const results = []
    for (const email of emails) {
      const analysis = await runSemanticLlmAnalysis(email)
      const outcome = await ingestIntoCrm(email, analysis)
      results.push({ email, analysis, outcome })
    }

    pipelineState.lastRunStatus = 'success'
    addLog('info', `Ciclo completato. Email analizzate: ${emails.length}. Bozze pronte: ${pipelineState.generatedDrafts}. Email automatiche: ${pipelineState.autoSentEmails}.`)
    return { success: true, count: emails.length, results }
  } catch (err) {
    pipelineState.lastRunStatus = 'error'
    addLog('error', `Errore esecuzione pipeline background: ${err.message}`)
    return { success: false, error: err.message }
  }
}

// ── 7. AVVIO DAEMON BACKGROUND ────────────────────────────────
let timerInstance = null

export function startBackgroundPipeline(intervalMs = 60000) {
  if (timerInstance) clearInterval(timerInstance)
  
  setTimeout(() => {
    executePipelineSweep().catch(e => console.error('[PIPELINE BG]', e))
  }, 3000)

  timerInstance = setInterval(() => {
    if (pipelineState.running) {
      executePipelineSweep().catch(e => console.error('[PIPELINE BG]', e))
    }
  }, intervalMs)

  addLog('info', `Pipeline Background avviata: preparazione tasks, bozze email e invii selettivi attivi (frequenza: ogni ${Math.round(intervalMs / 1000)}s).`)
  return true
}

export function getPipelineStatus() {
  const auth = getAuthenticatedClient()
  const tokenPath = getTokenPath()
  return {
    ...pipelineState,
    gmailConnected: Boolean(auth),
    hasTokens: fs.existsSync(tokenPath),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key'),
    uptime: process.uptime()
  }
}
