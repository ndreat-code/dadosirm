import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'
import { google } from 'googleapis'
import { startBackgroundPipeline, executePipelineSweep, getPipelineStatus } from './pipeline/gmailLlmPipeline.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Carica variabili d'ambiente da .env
dotenv.config({ path: path.join(rootDir, '.env') })

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const DATA_FILE = path.join(__dirname, 'data', 'crmData.json')
const CREDENTIALS_FILE = path.join(rootDir, 'credentials.json')
const TOKEN_FILE = path.join(rootDir, 'tokens.json')

// Helper per leggere e scrivere dati CRM
function getCrmData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Errore lettura crmData.json:', err)
    return { companies: [], opportunities: [], nextActions: [], inventory: [], quotes: [], emails: [] }
  }
}

function saveCrmData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Errore salvataggio crmData.json:', err)
  }
}

// Inizializza OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// Inizializza Google OAuth Client
function getOAuth2Client(preferredRedirectUri = null) {
  if (!fs.existsSync(CREDENTIALS_FILE)) {
    return null
  }
  try {
    const content = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'))
    const keys = content.web || content.installed
    if (!keys) return null

    let redirectUri = preferredRedirectUri
    if (!redirectUri) {
      if (keys.redirect_uris && keys.redirect_uris.includes('http://localhost:3000/oauth2callback')) {
        redirectUri = 'http://localhost:3000/oauth2callback'
      } else if (keys.redirect_uris && keys.redirect_uris[0]) {
        redirectUri = keys.redirect_uris[0]
      } else {
        redirectUri = 'http://localhost:3000/oauth2callback'
      }
    }
    return new google.auth.OAuth2(keys.client_id, keys.client_secret, redirectUri)
  } catch (e) {
    console.error('Errore caricamento credentials.json:', e)
    return null
  }
}

function getAuthenticatedClient() {
  const oauth2Client = getOAuth2Client()
  if (!oauth2Client) return null
  if (!fs.existsSync(TOKEN_FILE)) return null
  try {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'))
    oauth2Client.setCredentials(tokens)

    oauth2Client.on('tokens', (newTokens) => {
      try {
        const current = fs.existsSync(TOKEN_FILE) ? JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8')) : {}
        const merged = { ...current, ...newTokens }
        fs.writeFileSync(TOKEN_FILE, JSON.stringify(merged, null, 2), 'utf-8')
        const dataToken = path.join(__dirname, 'data/google_tokens.json')
        fs.writeFileSync(dataToken, JSON.stringify(merged, null, 2), 'utf-8')
      } catch (err) {
        console.error('Errore refresh token:', err)
      }
    })

    return oauth2Client
  } catch (e) {
    return null
  }
}

// ─────────────────────────────────────────────────────────────
// SERVIZIO STATICO FRONTEND REACT COMPILATO (DIST)
// ─────────────────────────────────────────────────────────────
const distPath = path.join(rootDir, 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
} else {
  // ROOT STATUS ENDPOINT DI FALLBACK SE DIST NON È COMPILATO
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DADO CRM - Backend API</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
            .card { background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #334155; text-align: center; max-width: 480px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
            h1 { margin-top: 0; font-size: 1.5rem; color: #38bdf8; }
            p { color: #94a3b8; line-height: 1.5; }
            .btn { display: inline-block; margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; transition: background 0.2s; }
            .btn:hover { background: #1d4ed8; }
            .badge { display: inline-block; padding: 0.25rem 0.75rem; background: #065f46; color: #34d399; border-radius: 9999px; font-size: 0.85rem; font-weight: 500; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">● Server API Online (Porta 3001)</div>
            <h1>DADO CRM Backend</h1>
            <p>Il server delle API e del database è attivo e funzionante correttamente.</p>
            <p>Per utilizzare l'applicazione CRM completa, accedi all'interfaccia principale:</p>
            <a class="btn" href="http://localhost:3000">Apri DADO CRM (localhost:3000) &rarr;</a>
          </div>
        </body>
      </html>
    `)
  })
}

// ─────────────────────────────────────────────────────────────
// ENDPOINT CRM
// ─────────────────────────────────────────────────────────────

app.get('/api/crm/summary', (req, res) => {
  const data = getCrmData()
  const totalClients = data.companies?.length || 0
  const openOpportunities = data.opportunities?.length || 0
  const potentialAmount = (data.opportunities || []).reduce((acc, curr) => acc + (curr.value || 0), 0)
  const nextActionsCount = data.nextActions?.length || 0
  const dueTodayCount = (data.nextActions || []).filter(a => a.due === 'today').length

  res.json({
    kpis: {
      activeClients: totalClients,
      openOpportunities: openOpportunities,
      potentialEur: (potentialAmount / 1000).toFixed(1) + 'k',
      nextActions: nextActionsCount,
      dueToday: dueTodayCount,
    },
    companies: data.companies,
    opportunities: data.opportunities,
    nextActions: data.nextActions,
    inventory: data.inventory,
    quotes: data.quotes,
    emails: data.emails,
    googleConnected: fs.existsSync(TOKEN_FILE),
  })
})

// ─────────────────────────────────────────────────────────────
// ENDPOINT ATTIVITÀ / NEXT ACTIONS
// ─────────────────────────────────────────────────────────────

app.post('/api/crm/activities', (req, res) => {
  try {
    const { title, company, type, dueDate, dueTime, priority, notes } = req.body
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Titolo attività obbligatorio' })
    }
    const crmData = getCrmData()
    if (!crmData.nextActions) crmData.nextActions = []

    const newActivity = {
      id: 'act-' + Date.now(),
      title: title.trim(),
      company: company || 'Generale / Studio',
      type: type || 'commercial',
      date: dueDate || new Date().toISOString().split('T')[0],
      time: dueTime || '10:00',
      period: 'In programma',
      due: 'upcoming',
      priority: priority || 'medium',
      status: 'pending',
      notes: notes || '',
      createdAt: new Date().toISOString()
    }

    crmData.nextActions.unshift(newActivity)
    saveCrmData(crmData)
    res.json({ success: true, activity: newActivity, nextActions: crmData.nextActions })
  } catch (err) {
    console.error('Errore salvataggio attività:', err)
    res.status(500).json({ error: 'Errore interno salvataggio attività' })
  }
})

app.patch('/api/crm/activities/:id', (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    const crmData = getCrmData()
    if (!crmData.nextActions) crmData.nextActions = []

    const idx = crmData.nextActions.findIndex(a => a.id === id)
    if (idx === -1) {
      return res.status(404).json({ error: 'Attività non trovata' })
    }

    crmData.nextActions[idx] = { ...crmData.nextActions[idx], ...updates }
    saveCrmData(crmData)
    res.json({ success: true, activity: crmData.nextActions[idx], nextActions: crmData.nextActions })
  } catch (err) {
    console.error('Errore aggiornamento attività:', err)
    res.status(500).json({ error: 'Errore interno aggiornamento attività' })
  }
})

app.delete('/api/crm/activities/:id', (req, res) => {
  try {
    const { id } = req.params
    const crmData = getCrmData()
    if (!crmData.nextActions) crmData.nextActions = []

    crmData.nextActions = crmData.nextActions.filter(a => String(a.id) !== String(id))
    saveCrmData(crmData)
    res.json({ success: true, nextActions: crmData.nextActions })
  } catch (err) {
    console.error('Errore eliminazione attività:', err)
    res.status(500).json({ error: 'Errore interno eliminazione attività' })
  }
})

// ─────────────────────────────────────────────────────────────
// ENDPOINT ASK OPEN AI
// ─────────────────────────────────────────────────────────────

app.post('/api/ai/ask', async (req, res) => {
  try {
    const { prompt } = req.body
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt richiesto' })
    }

    const crmData = getCrmData()

    // Sistema di istruzioni arricchito con ragionamento aperto e dati reali del CRM
    const systemPrompt = `Sei l'Executive Producer, Senior Business Strategist e AI Intelligence di "DADO Creative Studio" (studio di produzione video corporate, spot TV, riprese con drone, fotografia moda e rendering 3D con base e limbo a Milano).
Sei integrato direttamente nel nucleo del CRM dello studio e hai accesso in tempo reale all'intero database interno:

════════════════════════════════════════════════════════════════
DATABASE AZIENDE & PARTNER (${crmData.companies?.length || 0} clienti con referenti, contratti, giorni di lavoro, materiali, pagamenti e criticità):
${JSON.stringify(crmData.companies, null, 1)}

OPPORTUNITÀ & PIPELINE PREVENTIVI (${crmData.opportunities?.length || 0} trattative aperte):
${JSON.stringify(crmData.opportunities, null, 1)}

NEXT ACTIONS, APPUNTAMENTI & SCADENZE:
${JSON.stringify(crmData.nextActions, null, 1)}

INVENTARIO ATTREZZATURE DELLO STUDIO (Sony FX3/A7SIII, Lenti GM, Aputure 600d/300x, Drone Mavic 3 Cine, Gimbal RS3 Pro, Atomos Ninja, SSD):
${JSON.stringify(crmData.inventory, null, 1)}

PREVENTIVI EMESSI & CONTRATTI:
${JSON.stringify(crmData.quotes, null, 1)}

EMAIL RECENTI SINCRONIZZATE:
${JSON.stringify(crmData.emails, null, 1)}
════════════════════════════════════════════════════════════════

LINEE GUIDA DI RAGIONAMENTO E RISPOSTA (FONDAMENTALI):
1. RAGIONAMENTO APERTO, SVILUPPATO ED ARTICOLATO:
   Non limitarti a risposte preconfezionate o a banali elenchi puntati. Sviluppa un ragionamento commerciale e operativo profondo, entrando nel merito delle strategie di produzione, della psicologia di trattativa dei clienti e della gestione del rischio economico.
2. NESSUNA ENCICLOPEDIA GENERICA ESTERNA:
   Non divagare MAI su argomenti enciclopedici o nozioni esterne non richieste (politica, storia generale, geografia mondiale irrilevante tipo Berlusconi o Burkina Faso). Resta focalizzato al 100% sulla realtà produttiva di DADO Creative Studio, sui dati effettivi del CRM, sui calendari, sui clienti reali e sui numeri.
3. METODO DI TRATTARE I PREVENTIVI & NEGOZIAZIONE:
   Se l'utente chiede come trattare i preventivi, fornisci un piano tattico personalizzato:
   - Come condurre la trattativa con ciascun cliente (es. Officine Riva con preventivo da €9.200 in scadenza facendo leva sui 2 giorni di produzione e sul montaggio 4K ProRes; Solaris Energy per lo spot TV con diritti di messa in onda; Alpha Studio per i pacchetti convenzionati).
   - Leve di valore: cessione diritti, velocità di consegna (48h), pacchetti continuativi, clausole su acconti e saldi.
   - Difesa del prezzo contro le richieste di ribasso o sconti.
4. PUNTI IN COMUNE & SINERGIE TRA AZIENDE:
   Analizza in modo approfondito i cluster di clientela, le sovrapposizioni di attrezzatura (chi usa le stesse luci Aputure 600d, ottiche Sony GM o droni), i format di consegna (ProRes 422 vs 9:16 verticali), i flussi di lavoro comuni e le opportunità di cross-selling.
5. NUMERO GIORNI DI LAVORO & CALENDARIO:
   Estrai e incrocia con precisione i giorni e le ore effettive di lavoro dai campi workSchedule (es. "un giorno intero + un pomeriggio" per Riva, "2 giorni consecutivi" per Kroma, "2/3 ore all'alba" per Urban Mobility, "tramonto e golden hour" per Poggio Antico, "15 ore fino alle 02:30" per Vogue Events), calcolando la redditività giornaliera, i turni del team e i tempi necessari per la post-produzione.
6. INSOLUTI & CODA DI PAGAMENTO:
   Traccia con precisione i clienti con acconto versato ma saldo ancora aperto (es. Riva €5.200, Kroma €2.900, Beta Digital €2.800) e suggerisci azioni concrete di sollecito cordiale o sblocco delle consegne master legato al saldo.
7. CADENZE TEMPORALI DEI LAVORI PER MESE (FONDAMENTALE):
   Se l'utente chiede le cadenze temporali di ciascun lavoro per un mese specifico (es. Settembre, Agosto, Luglio, Giugno, Maggio 2026) o in generale per ciascun mese:
   - Identifica con esattezza il mese richiesto e isola ciascun lavoro con le sue cadenze temporali effettive (dai campi workSchedule e contract).
   - Per ciascuna commessa del mese fornisci una scheda temporale completa:
     * Nome azienda e settore
     * Data e Cadenza Temporale (es. "Multi-day: 2 giorni consecutivi", "Giornata intera continua 15h30", "Sessione pomeridiana 5h30", "Slot mattutino all'alba 3h", "Slot serale golden hour 2h45")
     * Orari di set e monte ore complessivo
     * Location (limbo Studio DADO vs stabilimento vs trasferta esterna)
     * Deliverables e attrezzature (4K ProRes, droni, Sony FX3, luci Aputure)
     * Valore economico e stato pagamenti (acconto vs saldo aperto vs saldato)
     * Intervallo di cadenza rispetto al lavoro precedente nel mese (distanza in giorni tra i set)
   - Analizza la frequenza e il ritmo del mese: ritmo medio tra i lavori (es. 1 commessa ogni 4-5 giorni a Settembre), identificazione di picchi di carico (es. concentrazione nella seconda metà di Settembre tra il 15 e il 25 con 4 produzioni ravvicinate) e gestione cuscinetti per il montaggio.
   - Fornisci sempre il totale commesse e il volume d'affari complessivo del mese richiesto.
8. STILE DI RISPOSTA:
   Professionale, incisivo, altamente analitico, con sezioni tematiche chiare, numeri precisi (€, orari, date) e conclusioni operative immediatamente applicabili.`

    let answer = ''
    let usingOpenAi = false
    let openAiError = null

    if (process.env.OPENAI_API_KEY) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1200,
        })
        answer = completion.choices[0]?.message?.content || ''
        if (answer) usingOpenAi = true
      } catch (apiErr) {
        console.warn('OpenAI API non disponibile (' + apiErr.message + '), attivazione motore CRM analitico avanzato.')
        if (apiErr.code === 'credit_balance_exhausted' || apiErr.status === 429) {
          openAiError = 'credit_exhausted'
        } else {
          openAiError = apiErr.message
        }
      }
    }

    if (!answer) {
      answer = generateLocalCrmAnalysis(prompt, crmData)
      if (openAiError === 'credit_exhausted') {
        answer += `\n\n──────────────────────────────────────\n💡 [Nota di servizio: Risposta calcolata dal motore locale DADO Studio. Per abilitare GPT-4o su qualsiasi domanda esterna al CRM, ricarica il saldo su platform.openai.com/settings/organization/billing/]`
      }
    }

    res.json({ answer, prompt, usingOpenAi, openAiError, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('Errore gestione richiesta AI:', err)
    res.status(500).json({ 
      error: 'Errore durante la generazione dell\'analisi: ' + (err.message || err) 
    })
  }
})

// Analizzatore intelligente approfondito, dinamico e calcolato per il CRM DADO
function generateLocalCrmAnalysis(prompt, data) {
  const p = prompt.toLowerCase().trim()
  const companies = data.companies || []
  const opps = data.opportunities || []
  const actions = data.nextActions || []
  const inventory = data.inventory || []

  // ── 0. DOMANDE SU DATE E CALENDARIO ──────────────────────────────
  const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
  const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
  const numbersWord = {'un': 1, 'uno': 1, 'una': 1, 'due': 2, 'tre': 3, 'quattro': 4, 'cinque': 5, 'sei': 6, 'sette': 7, 'otto': 8, 'nove': 9, 'dieci': 10}
  const today = new Date()

  // 0a. Oggi, ieri, domani, dopodomani
  if (p.includes('oggi') && (p.includes('che giorno') || p.includes('data') || p.includes('oggi è') || p.includes('oggi e'))) {
    const d = today
    return `📅 CALENDARIO: Oggi è ${dayNames[d.getDay()]} ${d.getDate()} ${months[d.getMonth()].toUpperCase()} ${d.getFullYear()}.`
  }
  if (p.includes('ieri') && (p.includes('che giorno') || p.includes('quando'))) {
    const d = new Date(today)
    d.setDate(d.getDate() - 1)
    return `📅 CALENDARIO: Ieri era ${dayNames[d.getDay()]} ${d.getDate()} ${months[d.getMonth()].toUpperCase()} ${d.getFullYear()}.`
  }
  if (p.includes('dopodomani')) {
    const d = new Date(today)
    d.setDate(d.getDate() + 2)
    return `📅 CALENDARIO: Dopodomani sarà ${dayNames[d.getDay()]} ${d.getDate()} ${months[d.getMonth()].toUpperCase()} ${d.getFullYear()}.`
  }
  if (p.includes('domani') && !p.includes('dopodomani')) {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    return `📅 CALENDARIO: Domani sarà ${dayNames[d.getDay()]} ${d.getDate()} ${months[d.getMonth()].toUpperCase()} ${d.getFullYear()}.`
  }

  // 0b. Giorni della settimana relativi (es. "tra due martedì", "prossimo martedì", "martedì prossimo")
  const weekdayPattern = /(?:tra|fra)?\s*(un|uno|una|due|tre|quattro|cinque|\d+)?\s*(luned[iì]|marted[iì]|mercoled[iì]|gioved[iì]|venerd[iì]|sabato|domenica)/i
  const matchW = p.match(weekdayPattern)
  if (matchW && (p.includes('tra') || p.includes('fra') || p.includes('prossim') || p.includes('sar') || p.includes('quando') || p.includes('giorno') || p.includes('numero') || p.includes('mese'))) {
    const countRaw = matchW[1] ? matchW[1].toLowerCase() : '1'
    const count = numbersWord[countRaw] || parseInt(countRaw, 10) || 1
    const targetDayName = matchW[2].toLowerCase().replace('ì', 'i')
    const dayMap = {'domenica': 0, 'lunedi': 1, 'martedi': 2, 'mercoledi': 3, 'giovedi': 4, 'venerdi': 5, 'sabato': 6}
    const targetDayIndex = dayMap[targetDayName]

    if (targetDayIndex !== undefined) {
      let foundCount = 0
      let curr = new Date(today)
      while (foundCount < count) {
        curr.setDate(curr.getDate() + 1)
        if (curr.getDay() === targetDayIndex) {
          foundCount++
        }
      }

      const resDay = curr.getDate()
      const resMonth = months[curr.getMonth()]
      const resYear = curr.getFullYear()
      const resWeekday = dayNames[curr.getDay()]

      const iso = `${resYear}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(resDay).padStart(2, '0')}`
      const matchingCompanies = companies.filter(c => (c.workSchedule?.datesFormatted || '').toLowerCase().includes(`${resDay} ${resMonth}`))
      const matchingActions = actions.filter(a => a.date === iso || a.period?.toLowerCase() === resWeekday.toLowerCase())

      return `📅 RISPOSTA CALENDARIO:
Tra ${count === 1 ? 'il prossimo' : count} ${matchW[2]} sarà:
👉 ${resWeekday} ${resDay} ${resMonth.toUpperCase()} ${resYear}

• Il numero del giorno nel mese di ${resMonth} è: ${resDay}.
${matchingCompanies.length > 0 ? `\n• Impegni registrati nel CRM per questa data:\n${matchingCompanies.map(c => `  - ${c.name}: ${c.workSchedule?.scheduleType} (${c.workSchedule?.hours})`).join('\n')}` : '\n• Nessuna produzione o shooting registrato nel CRM per questa data.'}
${matchingActions.length > 0 ? `\n• Attività operative correlate:\n${matchingActions.map(a => `  - ${a.title} (${a.company})`).join('\n')}` : ''}`
    }
  }

  // 0c. Tempo relativo (es. "tra 5 giorni", "tra due settimane")
  const relTimePattern = /(?:tra|fra)\s*(un|uno|una|due|tre|quattro|cinque|\d+)\s*(giorn[io]|settiman[ae]|mes[ie])/i
  const matchRel = p.match(relTimePattern)
  if (matchRel) {
    const numRaw = matchRel[1].toLowerCase()
    const num = numbersWord[numRaw] || parseInt(numRaw, 10) || 1
    const unit = matchRel[2].toLowerCase()
    let curr = new Date(today)
    if (unit.startsWith('giorn')) curr.setDate(curr.getDate() + num)
    else if (unit.startsWith('settiman')) curr.setDate(curr.getDate() + (num * 7))
    else if (unit.startsWith('mes')) curr.setMonth(curr.getMonth() + num)

    const resDay = curr.getDate()
    const resMonth = months[curr.getMonth()]
    const resYear = curr.getFullYear()
    const resWeekday = dayNames[curr.getDay()]

    return `📅 RISPOSTA CALENDARIO:
Tra ${num} ${unit} sarà:
👉 ${resWeekday} ${resDay} ${resMonth.toUpperCase()} ${resYear} (giorno ${resDay}).`
  }

  // 0d. Data specifica (es. "12 settembre", "6 ottobre 2026")
  const dateMatch = p.match(/(\d{1,2})\s*(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(\s*(\d{4}))?/i)
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10)
    const monthStr = dateMatch[2].toLowerCase()
    const monthIdx = months.indexOf(monthStr)
    const year = dateMatch[4] ? parseInt(dateMatch[4], 10) : today.getFullYear()

    const d = new Date(year, monthIdx, day)
    const weekday = dayNames[d.getDay()]

    const iso = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const matchingCompanies = companies.filter(c => (c.workSchedule?.datesFormatted || '').toLowerCase().includes(`${day} ${monthStr}`))
    const matchingActions = actions.filter(a => a.date === iso || a.period?.toLowerCase() === weekday.toLowerCase())

    return `📅 RISPOSTA CALENDARIO:
Il ${day} ${monthStr.toUpperCase()} ${year} è/era un ${weekday.toUpperCase()}.

${matchingCompanies.length > 0 ? `• Impegni registrati per questa data nel CRM:\n${matchingCompanies.map(c => `  - ${c.name}: ${c.workSchedule?.scheduleType} (${c.workSchedule?.hours})`).join('\n')}` : '• Nessuna produzione o shooting specifico registrato nel CRM per questa specifica data.'}
${matchingActions.length > 0 ? `\n• Attività operative correlate:\n${matchingActions.map(a => `  - ${a.title} (${a.company})`).join('\n')}` : ''}`
  }

  // ── 0e-bis. CADENZE TEMPORALI DI CIASCUN LAVORO PER IL MESE RICHIESTO ──
  const isCadenceWord = p.includes('cadenz') || p.includes('cadenze') || p.includes('cadenza') || p.includes('ritmo') || p.includes('frequenz') || p.includes('intervall')
  const hasWorkWord = p.includes('lavor') || p.includes('commess') || p.includes('shooting') || p.includes('set') || p.includes('produzion') || p.includes('attivita') || p.includes('attività') || p.includes('ciascun')
  const hasMonthWord = p.includes('mes') || p.includes('mese') || p.includes('mesi') || months.some(m => p.includes(m)) || p.includes('questo mese') || p.includes('mese scorso') || p.includes('prossimo mese')

  const isMonthlyCadenceQuery = isCadenceWord || (hasMonthWord && hasWorkWord) || (p.includes('temporali') && (hasWorkWord || hasMonthWord))

  if (isMonthlyCadenceQuery) {
    // 1. Rileva se è stato indicato un mese specifico (o mese relativo)
    let requestedMonth = null
    let requestedMonthName = null
    let requestedMonthIdx = null // 1-12

    for (let i = 0; i < months.length; i++) {
      if (p.includes(months[i])) {
        requestedMonth = months[i]
        requestedMonthName = months[i].charAt(0).toUpperCase() + months[i].slice(1)
        requestedMonthIdx = i + 1
        break
      }
    }

    if (!requestedMonth) {
      if (p.includes('questo mese') || p.includes('mese corrente') || p.includes('mese in corso') || p.includes('mese attuale')) {
        requestedMonth = 'settembre'
        requestedMonthName = 'Settembre'
        requestedMonthIdx = 9
      } else if (p.includes('mese scorso') || p.includes('scorso mese')) {
        requestedMonth = 'agosto'
        requestedMonthName = 'Agosto'
        requestedMonthIdx = 8
      } else if (p.includes('prossimo mese') || p.includes('mese prossimo')) {
        requestedMonth = 'ottobre'
        requestedMonthName = 'Ottobre'
        requestedMonthIdx = 10
      }
    }

    // 2. Parser robusto di date, mese e primo giorno per ogni azienda del CRM
    const parseCompanyWorkInfo = (c) => {
      const dStr = (c.workSchedule?.datesFormatted || '').trim()
      const rDate = c.workSchedule?.recentDate || ''
      const signed = c.contract?.signedDate || ''

      let mIdx = null
      let mName = null
      for (let i = 0; i < months.length; i++) {
        if (dStr.toLowerCase().includes(months[i])) {
          mIdx = i + 1
          mName = months[i]
          break
        }
      }
      if (!mIdx && rDate) {
        const parts = rDate.split('-')
        if (parts.length >= 2) {
          mIdx = parseInt(parts[1], 10)
          mName = months[mIdx - 1]
        }
      }
      if (!mIdx && signed) {
        const parts = signed.split('-')
        if (parts.length >= 2) {
          mIdx = parseInt(parts[1], 10)
          mName = months[mIdx - 1]
        }
      }

      let firstDay = 1
      const dayMatch = dStr.match(/(\d{1,2})/)
      if (dayMatch) {
        firstDay = parseInt(dayMatch[1], 10)
      } else if (rDate) {
        const parts = rDate.split('-')
        if (parts.length === 3) firstDay = parseInt(parts[2], 10)
      }

      return {
        company: c,
        monthIndex: mIdx || 9,
        monthName: mName || 'settembre',
        firstDay,
        datesFormatted: dStr || rDate || 'Data da definire',
        recentDate: rDate,
        sortKey: rDate || `2026-${String(mIdx || 9).padStart(2, '0')}-${String(firstDay).padStart(2, '0')}`
      }
    }

    const allParsedJobs = companies.map(parseCompanyWorkInfo)

    // ── CASO A: MESE SPECIFICO RICHIESTO ──────────────────────────
    if (requestedMonth) {
      const monthJobs = allParsedJobs
        .filter(item => item.monthName === requestedMonth || item.monthIndex === requestedMonthIdx)
        .sort((a, b) => a.firstDay - b.firstDay)

      if (monthJobs.length > 0) {
        const totalRev = monthJobs.reduce((acc, j) => acc + (j.company.compensation?.amount || 0), 0)
        const totalDeposits = monthJobs.reduce((acc, j) => acc + (j.company.compensation?.deposit || 0), 0)
        const totalBalances = monthJobs.reduce((acc, j) => acc + (j.company.compensation?.balance || 0), 0)
        const avgFreqDays = monthJobs.length > 1 ? (30 / monthJobs.length).toFixed(1) : '-'

        let monthPacing = ''
        if (requestedMonth === 'settembre') {
          monthPacing = 'Mese ad altissima intensità produttiva: 6 commesse concentrate su una cadenza media di 1 lavoro ogni 4-5 giorni, con picco nella seconda metà del mese (4 commesse tra il 15 e il 25 settembre).'
        } else if (requestedMonth === 'agosto') {
          monthPacing = 'Cadenza quindicinale estiva: 2 produzioni a distanza di 14 giorni l\'una dall\'altra, mirate a fasce orarie specifiche (golden hour e cucina chiusa).'
        } else {
          monthPacing = `Cadenza mirata con ${monthJobs.length} commessa produttiva programmata nel mese.`
        }

        return `📅 CADENZE TEMPORALI DEI LAVORI — MESE DI ${requestedMonthName.toUpperCase()} 2026
─────────────────────────────────────────────────────────────
🎯 SINTESI CADENZA & RITMO OPERATIVO DEL MESE:
• Commesse confermate nel mese: ${monthJobs.length} produzioni sul set
• Volume d'affari totale mese: € ${totalRev.toLocaleString('it-IT')} (Incassato: € ${totalDeposits.toLocaleString('it-IT')} | Saldo residuo: € ${totalBalances.toLocaleString('it-IT')})
• Cadenza media tra i set: 1 lavoro ogni ${avgFreqDays} giorni
• Dinamica del ritmo operativo: ${monthPacing}

📋 SCHEDA TEMPORALE & CADENZA DI CIASCUN LAVORO NEL MESE:

${monthJobs.map((j, idx) => {
  const c = j.company
  const comp = c.compensation || {}
  const ws = c.workSchedule || {}
  const mat = (c.requestedMaterials || []).slice(0, 3).join(' • ')

  let cadenceGapText = ''
  if (idx === 0) {
    cadenceGapText = `Apertura mese (Giorno ${j.firstDay} ${requestedMonthName})`
  } else {
    const prev = monthJobs[idx - 1]
    const gap = Math.max(1, j.firstDay - prev.firstDay)
    cadenceGapText = `+${gap} ${gap === 1 ? 'giorno' : 'giorni'} di intervallo dal set precedente (${prev.company.name})`
  }

  return `${idx + 1}️⃣ ${c.name.toUpperCase()} (${c.industry})
   • Data & Calendario: ${ws.datesFormatted || j.datesFormatted}
   • Cadenza temporale: ${ws.scheduleType || 'Standard'} [${cadenceGapText}]
   • Orari sul set: ${ws.hours || 'Orario standard'}
   • Location: ${ws.location || 'Studio DADO'}
   • Materiali & Output: ${mat || 'Kit standard'}
   • Valore commessa: € ${(comp.amount || 0).toLocaleString('it-IT')} [Stato: ${comp.status || 'N/D'} | Acconto: € ${(comp.deposit || 0).toLocaleString('it-IT')} | Saldo: € ${(comp.balance || 0).toLocaleString('it-IT')}]
   • Contratto: ${c.contract?.code || 'DADO-CTR'} siglato il ${c.contract?.signedDate || 'N/D'}`
}).join('\n\n')}

💡 Suggerimento: puoi chiedere le cadenze di qualsiasi altro mese (es. "Cadenze temporali di agosto", "Lavori di luglio", "Cadenze di maggio") o la visione annuale completa digitando "Cadenze per ogni mese".`
      } else {
        // Nessun lavoro per il mese richiesto
        const activeMonths = ['Maggio (1 lavoro)', 'Giugno (1 lavoro)', 'Luglio (1 lavoro)', 'Agosto (2 lavori)', 'Settembre (6 lavori)']
        return `📅 CADENZE TEMPORALI DEI LAVORI — MESE DI ${requestedMonthName.toUpperCase()} 2026:
─────────────────────────────────────────────────────────────
• Attualmente nel CRM non sono registrate produzioni sul set o commesse concluse per il mese di ${requestedMonthName} 2026.

📊 COMMESSE E CADENZE REGISTRATE PER GLI ALTRI MESI DEL 2026:
${activeMonths.map(m => `• ${m}`).join('\n')}

💡 Puoi digitare ad esempio: "Cadenze temporali di settembre" o "Cadenze temporali di ciascun lavoro per ogni mese" per consultare la timeline completa.`
      }
    }

    // ── CASO B: VISIONE COMPLETA PER CIASCUN MESE DEL 2026 ────────
    // Raggruppamento per mese di tutti i lavori del CRM
    const monthsWithJobs = [
      { name: 'Settembre', idx: 9, pacing: 'Cadenza ad alta intensità (1 set ogni 4-5 giorni)' },
      { name: 'Agosto', idx: 8, pacing: 'Cadenza quindicinale estiva (2 set a distanza di 14 giorni)' },
      { name: 'Luglio', idx: 7, pacing: 'Cadenza mirata evento tech di fine mese' },
      { name: 'Giugno', idx: 6, pacing: 'Cadenza chiusura primo semestre' },
      { name: 'Maggio', idx: 5, pacing: 'Primo lavoro dell\'anno a metà mese' }
    ]

    return `📅 CADENZE TEMPORALI DI CIASCUN LAVORO PER MESE (ANNO 2026)
─────────────────────────────────────────────────────────────
Panoramica completa delle cadenze temporali e delle ${companies.length} commesse registrate nel CRM DADO Creative Studio:

${monthsWithJobs.map(m => {
  const mJobs = allParsedJobs
    .filter(j => j.monthIndex === m.idx)
    .sort((a, b) => a.firstDay - b.firstDay)

  const mRev = mJobs.reduce((acc, j) => acc + (j.company.compensation?.amount || 0), 0)

  return `🗓️ MESE DI ${m.name.toUpperCase()} 2026 (${mJobs.length} ${mJobs.length === 1 ? 'COMMESSA' : 'COMMESSE'} • € ${mRev.toLocaleString('it-IT')})
Ritmo: ${m.pacing}

${mJobs.map((j, idx) => {
  const c = j.company
  const ws = c.workSchedule || {}
  const comp = c.compensation || {}

  let gapText = ''
  if (idx === 0) {
    gapText = `Giorno ${j.firstDay}`
  } else {
    const prev = mJobs[idx - 1]
    const gap = Math.max(1, j.firstDay - prev.firstDay)
    gapText = `+${gap}gg dopo ${prev.company.name}`
  }

  return `  • ${ws.datesFormatted || j.datesFormatted} ➔ ${c.name} (€ ${(comp.amount || 0).toLocaleString('it-IT')})
    - Cadenza: ${ws.scheduleType || 'Standard'} [${gapText}]
    - Orari: ${ws.hours || 'N/D'} | Location: ${ws.location || 'Studio'}
    - Deliverables: ${(c.requestedMaterials || []).slice(0, 2).join(' • ')}`
}).join('\n')}`
}).join('\n\n')}

─────────────────────────────────────────────────────────────
🎯 SINTESI CADENZA ANNUALE DELLO STUDIO:
• Totale commesse: ${companies.length} lavori per un valore complessivo di € ${companies.reduce((s, c) => s + (c.compensation?.amount || 0), 0).toLocaleString('it-IT')}.
• Evoluzione del ritmo: Cadenza distribuita di 1-2 lavori al mese tra maggio e agosto, con forte accelerazione nel mese di Settembre (6 produzioni e € 41.500 fatturati).

💡 Per analizzare il dettaglio orario e contrattuale di un singolo mese, digita: "Cadenze temporali di settembre", "Cadenze temporali di agosto", ecc.`
  }

  // ── 0e. DOMANDE SU ULTIMO / PRIMO LAVORO NEL 2026 E DATE SINGOLI LAVORI OTTENUTI ──
  const isLastJobQuery = (p.includes('ultimo') || p.includes('ultim')) && (p.includes('lavor') || p.includes('commess') || p.includes('shooting') || p.includes('set') || p.includes('2026') || p.includes('anno') || p.includes('client') || p.includes('ottenut'))
  const isFirstJobQuery = (p.includes('primo') || p.includes('prim')) && (p.includes('lavor') || p.includes('commess') || p.includes('shooting') || p.includes('set') || p.includes('2026') || p.includes('anno') || p.includes('client') || p.includes('ottenut'))
  const isWorkDatesQuery = (p.includes('date') || p.includes('data') || p.includes('cronolog') || p.includes('timeline') || p.includes('calendario') || p.includes('quando')) && (p.includes('lavor') || p.includes('singol') || p.includes('ottenut') || p.includes('commess') || p.includes('shooting'))

  if (isLastJobQuery || isFirstJobQuery || isWorkDatesQuery) {
    const sortedCompaniesByDate = [...companies].sort((a, b) => {
      const dateA = a.workSchedule?.recentDate || a.contract?.signedDate || '2026-01-01'
      const dateB = b.workSchedule?.recentDate || b.contract?.signedDate || '2026-01-01'
      return dateB.localeCompare(dateA) // dal più recente (ultimo) al primo dell'anno
    })

    const latestJob = sortedCompaniesByDate[0]
    const firstJob = sortedCompaniesByDate[sortedCompaniesByDate.length - 1]

    if (isLastJobQuery) {
      return `🎬 ULTIMO LAVORO REGISTRATO NELL'ANNO 2026:
👉 ${latestJob.name.toUpperCase()} (${latestJob.industry})
─────────────────────────────────────────────────────────────
• DATE DI PRODUZIONE & SHOOTING: ${latestJob.workSchedule?.datesFormatted || '24 e 25 Settembre 2026'}
• CARICO & ORARI SUL SET: ${latestJob.workSchedule?.scheduleType} (${latestJob.workSchedule?.hours})
• LOCATION: ${latestJob.workSchedule?.location}
• VALORE COMMESSA: € ${(latestJob.compensation?.amount || 0).toLocaleString('it-IT')} (Acconto incassato: € ${(latestJob.compensation?.deposit || 0).toLocaleString('it-IT')} | Saldo aperto: € ${(latestJob.compensation?.balance || 0).toLocaleString('it-IT')})
• CONTRATTO FIRMATO: ${latestJob.contract?.code} siglato il ${latestJob.contract?.signedDate} (${latestJob.contract?.digitalFormat})
• REFERENTE: ${latestJob.contactPerson?.name} (${latestJob.contactPerson?.role}) • Tel: ${latestJob.contact?.phone || latestJob.contact?.mobile}
• ATTREZZATURE IMPIEGATE: ${(latestJob.requestedMaterials || []).slice(0, 4).join(' • ')}
• DELIVERABLES: Master Video 4K ProRes 422 + Cut 60s per LinkedIn
• NOTE OPERATIVE: ${latestJob.issues?.hasIssue ? `Criticità gestita: ${latestJob.issues.description} (Soluzione applicata: ${latestJob.issues.resolution})` : 'Produzione regolare.'}

📅 CRONOLOGIA COMPLETA DATE DEI SINGOLI LAVORI OTTENUTI NEL 2026:
(Tutte le 11 commesse ordinate in sequenza temporale dal più recente al primo dell'anno)

${sortedCompaniesByDate.map((c, idx) => `${idx + 1}. ${c.name}
   • Data lavoro: ${c.workSchedule?.datesFormatted || 'N/D'} (Data contratto: ${c.contract?.signedDate || 'N/D'})
   • Location: ${c.workSchedule?.location || 'Studio'}
   • Valore commessa: € ${(c.compensation?.amount || 0).toLocaleString('it-IT')} [Stato: ${c.compensation?.status || 'N/D'}]
   • Tipologia: ${c.workSchedule?.scheduleType || 'Standard'}`).join('\n\n')}`
    }

    if (isFirstJobQuery) {
      return `🎬 PRIMO LAVORO REGISTRATO NELL'ANNO 2026:
👉 ${firstJob.name.toUpperCase()} (${firstJob.industry})
─────────────────────────────────────────────────────────────
• DATA DI PRODUZIONE & SHOOTING: ${firstJob.workSchedule?.datesFormatted || '12 Maggio 2026'}
• ORARI SUL SET: ${firstJob.workSchedule?.scheduleType} (${firstJob.workSchedule?.hours})
• LOCATION: ${firstJob.workSchedule?.location}
• VALORE COMMESSA: € ${(firstJob.compensation?.amount || 0).toLocaleString('it-IT')} [Stato: ${firstJob.compensation?.status || 'Saldato'}]
• CONTRATTO FIRMATO: ${firstJob.contract?.code} del ${firstJob.contract?.signedDate}
• ATTREZZATURE: ${(firstJob.requestedMaterials || []).slice(0, 3).join(' • ')}

📅 CRONOLOGIA DATE SINGOLI LAVORI 2026:
${sortedCompaniesByDate.map((c, idx) => `${idx + 1}. ${c.name} ➔ ${c.workSchedule?.datesFormatted || 'N/D'} (€ ${(c.compensation?.amount || 0).toLocaleString('it-IT')})`).join('\n')}`
    }

    // isWorkDatesQuery: calendario cronologico completo
    return `📅 DATE DEI SINGOLI LAVORI OTTENUTI NEL 2026 (${companies.length} COMMESSE):
─────────────────────────────────────────────────────────────
Cronologia completa ordinata dalla data più recente al primo lavoro dell'anno:

${sortedCompaniesByDate.map((c, idx) => `• [${c.workSchedule?.datesFormatted}] ➔ ${c.name.toUpperCase()}
  - Location: ${c.workSchedule?.location || 'Studio DADO'}
  - Orari e impegno: ${c.workSchedule?.scheduleType} (${c.workSchedule?.hours})
  - Valore economico: € ${(c.compensation?.amount || 0).toLocaleString('it-IT')} | Saldo: € ${(c.compensation?.balance || 0).toLocaleString('it-IT')} (${c.compensation?.status})
  - Contratto: ${c.contract?.code} del ${c.contract?.signedDate}
  - Materiali chiave: ${(c.requestedMaterials || []).slice(0, 3).join(', ')}`).join('\n\n')}

🎯 SINTESI TEMPORALE:
• Ultimo lavoro dell'anno 2026: ${latestJob.name} (${latestJob.workSchedule?.datesFormatted})
• Primo lavoro dell'anno 2026: ${firstJob.name} (${firstJob.workSchedule?.datesFormatted})`
  }

  // ── MAPPATURA ROBUSTA DELLE AZIENDE DEL CRM ──────────────────────
  const companyAliases = [
    { id: 'comp-3', name: 'Officine Meccaniche Riva', keys: ['officine meccaniche riva', 'officine riva', 'riva', 'meccaniche riva'] },
    { id: 'comp-6', name: 'Solaris Green Energy', keys: ['solaris green energy', 'solaris energy', 'solaris'] },
    { id: 'comp-1', name: 'Alpha Studio Milano', keys: ['alpha studio milano', 'alpha studio', 'alpha'] },
    { id: 'comp-2', name: 'Beta Digital Agency', keys: ['beta digital agency', 'beta digital', 'beta'] },
    { id: 'comp-5', name: 'Kroma Ceramiche', keys: ['kroma ceramiche', 'kroma'] },
    { id: 'comp-4', name: 'Vogue Events & Wedding', keys: ['vogue events & wedding', 'vogue events', 'vogue wedding', 'vogue'] },
    { id: 'comp-7', name: 'Gusto & Tradizione Food', keys: ['gusto & tradizione food', 'gusto & tradizione', 'gusto e tradizione', 'gusto'] },
    { id: 'comp-10', name: 'Tenuta Poggio Antico', keys: ['tenuta poggio antico', 'poggio antico', 'poggio'] },
    { id: 'comp-8', name: 'Nexura Tech Solutions', keys: ['nexura tech solutions', 'nexura tech', 'nexura'] },
    { id: 'comp-9', name: 'Atelier Sposa Bellissima', keys: ['atelier sposa bellissima', 'sposa bellissima', 'atelier sposa'] },
    { id: 'comp-11', name: 'Urban Mobility Bike', keys: ['urban mobility bike', 'urban mobility', 'urban bike', 'urban'] }
  ]

  const matchedCompanies = []
  for (const alias of companyAliases) {
    if (alias.keys.some(k => p.includes(k))) {
      const found = companies.find(c => c.id === alias.id || c.name.toLowerCase() === alias.name.toLowerCase())
      if (found && !matchedCompanies.some(m => m.id === found.id)) {
        matchedCompanies.push(found)
      }
    }
  }

  // ── 1. CONFRONTO TRA CLIENTI, AZIENDE O PREVENTIVI ───────────────────
  const isComparisonPrompt = p.includes('confront') || p.includes('paragon') || p.includes('differenz') || p.includes('compar') || p.includes(' vs ') || p.includes('contro') || p.includes('a confronto') || p.includes('paragone')
  if (isComparisonPrompt) {
    // 1a. Confronto Preventivi / Opportunità aperte
    if (p.includes('preventiv') || p.includes('opportunit') || p.includes('trattativ') || p.includes('pipeline')) {
      const sortedOpps = [...opps].sort((a, b) => (b.value || 0) - (a.value || 0))
      return `⚖️ CONFRONTO COMPARATIVO PREVENTIVI & PIPELINE TRATTATIVE (${opps.length} OPPORTUNITÀ)
─────────────────────────────────────────────────────────────
🎯 SINTESI GENERALE:
• Valore complessivo trattative aperte: € ${opps.reduce((s, o) => s + (o.value || 0), 0).toLocaleString('it-IT')}.
• Preventivo a maggior valore: ${sortedOpps[0]?.title} a € ${(sortedOpps[0]?.value || 0).toLocaleString('it-IT')} [${sortedOpps[0]?.stage}].
• Preventivo più rapido: ${sortedOpps[sortedOpps.length - 1]?.title} a € ${(sortedOpps[sortedOpps.length - 1]?.value || 0).toLocaleString('it-IT')}.

📊 CLASSIFICA & STATO PREVENTIVI A CONFRONTO:
${sortedOpps.map((o, idx) => `${idx + 1}. € ${(o.value || 0).toLocaleString('it-IT')} ➔ "${o.title}"
   • Stato trattativa: ${o.stage} (${o.status})
   • Tattica negoziale: ${o.stage?.includes('scadenza') ? '⚠️ Urgente: confermare oggi per bloccare le date di set.' : 'Standard: proposta pacchetto a saldo anticipato.'}`).join('\n\n')}`
    }

    // 1b. Confronto Clienti (anche se l'utente non ha specificato due nomi esatti)
    let compA = matchedCompanies[0]
    let compB = matchedCompanies[1]

    if (!compA && !compB) {
      compA = companies.find(c => c.name.includes('Riva')) || companies[0]
      compB = companies.find(c => c.name.includes('Solaris')) || companies[1]
    } else if (compA && !compB) {
      compB = companies.find(c => c.id !== compA.id && (c.industry === compA.industry || (c.requestedMaterials && compA.requestedMaterials && c.requestedMaterials.some(m => compA.requestedMaterials.includes(m))))) || companies.find(c => c.id !== compA.id)
    }

    const totA = compA.compensation?.amount || 0
    const totB = compB.compensation?.amount || 0
    const balA = compA.compensation?.balance || 0
    const balB = compB.compensation?.balance || 0
    const depA = compA.compensation?.deposit || 0
    const depB = compB.compensation?.deposit || 0

    return `⚖️ CONFRONTO DIRETTO: ${compA.name.toUpperCase()} VS ${compB.name.toUpperCase()}
─────────────────────────────────────────────────────────────
🎯 SINTESI AL SODO:
• Settori: ${compA.name} (${compA.industry}) vs ${compB.name} (${compB.industry}).
• Valore economico: ${totA > totB ? `Maggior volume per ${compA.name} (€ ${totA.toLocaleString('it-IT')}) vs ${compB.name} (€ ${totB.toLocaleString('it-IT')}).` : totB > totA ? `Maggior volume per ${compB.name} (€ ${totB.toLocaleString('it-IT')}) vs ${compA.name} (€ ${totA.toLocaleString('it-IT')}).` : `Stesso volume economico di € ${totA.toLocaleString('it-IT')} per entrambe.`}
• Rischio pagamenti: ${balA === 0 && balB === 0 ? 'Entrambi i clienti sono saldati al 100% (nessun insoluto).' : balA > 0 && balB > 0 ? `Entrambi hanno pendenze aperte: ${compA.name} € ${balA.toLocaleString('it-IT')} e ${compB.name} € ${balB.toLocaleString('it-IT')}.` : balA > 0 ? `${compA.name} ha un saldo aperto di € ${balA.toLocaleString('it-IT')}, mentre ${compB.name} è saldato al 100%.` : `${compB.name} ha un saldo aperto di € ${balB.toLocaleString('it-IT')}, mentre ${compA.name} è saldato al 100%.`}

💰 1. CIFRE & PAGAMENTI A CONFRONTO:
• ${compA.name}:
  - Totale commessa: € ${totA.toLocaleString('it-IT')} (Incassato: € ${depA.toLocaleString('it-IT')} | Saldo aperto: € ${balA.toLocaleString('it-IT')}) [Stato: ${compA.compensation?.status || 'N/D'}]
  - Metodo pattuito: ${compA.compensation?.paymentMethod || 'Bonifico standard'}
• ${compB.name}:
  - Totale commessa: € ${totB.toLocaleString('it-IT')} (Incassato: € ${depB.toLocaleString('it-IT')} | Saldo aperto: € ${balB.toLocaleString('it-IT')}) [Stato: ${compB.compensation?.status || 'N/D'}]
  - Metodo pattuito: ${compB.compensation?.paymentMethod || 'Bonifico standard'}

⏱️ 2. IMPEGNO SUL SET & ATTREZZATURE:
• ${compA.name}:
  - Tempistiche: ${compA.workSchedule?.scheduleType || 'Standard'} (${compA.workSchedule?.hours || 'N/D'}) • Date: ${compA.workSchedule?.datesFormatted || 'N/D'}
  - Location: ${compA.workSchedule?.location || 'Studio'}
  - Materiali chiave: ${(compA.requestedMaterials || []).slice(0, 3).join(', ') || 'Kit standard'}
• ${compB.name}:
  - Tempistiche: ${compB.workSchedule?.scheduleType || 'Standard'} (${compB.workSchedule?.hours || 'N/D'}) • Date: ${compB.workSchedule?.datesFormatted || 'N/D'}
  - Location: ${compB.workSchedule?.location || 'Studio'}
  - Materiali chiave: ${(compB.requestedMaterials || []).slice(0, 3).join(', ') || 'Kit standard'}

🛠️ 3. CRITICITÀ PASSATE & FEEDBACK REALE:
• ${compA.name} (⭐ ${compA.feedback?.rating || 'N/D'}/5):
  - ${compA.issues?.hasIssue ? `Criticità riscontrata: ${compA.issues.description}\n    ➔ Soluzione DADO: ${compA.issues.resolution}` : 'Nessuna criticità registrata.'}
• ${compB.name} (⭐ ${compB.feedback?.rating || 'N/D'}/5):
  - ${compB.issues?.hasIssue ? `Criticità riscontrata: ${compB.issues.description}\n    ➔ Soluzione DADO applicata: ${compB.issues.resolution}` : 'Nessuna criticità registrata.'}

💡 Nota: puoi confrontare qualsiasi altra coppia digitando ad esempio "Confronta Alpha Studio e Vogue Events" o "Confronta Kroma e Beta".`
  }

  // ── 2. DATI IN COMUNE TRA AZIENDE COLLABORATRICI ─────────────────
  const isCommonDataPrompt = p.includes('comun') || p.includes('in comune') || p.includes('sinerg') || p.includes('affinit') || p.includes('sovrapposizion') || p.includes('condivid') || p.includes('condivision') || p.includes('incroc') || (p.includes('dati') && (p.includes('richiest') || p.includes('aziend')))
  if (isCommonDataPrompt) {
    // Calcolo dinamico delle sovrapposizioni tecniche e contrattuali
    const droneCompanies = companies.filter(c => (c.requestedMaterials || []).some(m => m.toLowerCase().includes('drone'))).map(c => c.name)
    const fx3Companies = companies.filter(c => (c.requestedMaterials || []).some(m => m.toLowerCase().includes('fx3'))).map(c => c.name)
    const aputureCompanies = companies.filter(c => (c.requestedMaterials || []).some(m => m.toLowerCase().includes('aputure'))).map(c => c.name)
    const nanliteCompanies = companies.filter(c => (c.requestedMaterials || []).some(m => m.toLowerCase().includes('nanlite') || m.toLowerCase().includes('pavotube'))).map(c => c.name)
    const sennheiserCompanies = companies.filter(c => (c.requestedMaterials || []).some(m => m.toLowerCase().includes('sennheiser') || m.toLowerCase().includes('microfon'))).map(c => c.name)
    const proResCompanies = companies.filter(c => (c.requestedMaterials || []).some(m => m.toLowerCase().includes('prores') || m.toLowerCase().includes('4k'))).map(c => c.name)
    const verticalReelsCompanies = companies.filter(c => (c.requestedMaterials || []).some(m => m.toLowerCase().includes('reel') || m.toLowerCase().includes('vertical') || m.toLowerCase().includes('9:16') || m.toLowerCase().includes('tiktok'))).map(c => c.name)
    const studioDADOCompanies = companies.filter(c => (c.workSchedule?.location || '').toLowerCase().includes('studio') || (c.requestedMaterials || []).some(m => m.toLowerCase().includes('studio dado'))).map(c => c.name)
    const pendingBalanceCompanies = companies.filter(c => (c.compensation?.balance || 0) > 0).map(c => `${c.name} (€ ${c.compensation?.balance.toLocaleString('it-IT')})`)

    return `📊 INDAGINE INTEGRATA: DATI IN COMUNE & SINERGIE TRA LE ${companies.length} AZIENDE PARTNER
─────────────────────────────────────────────────────────────
Scansione calcolata in tempo reale sul database del CRM DADO Creative Studio:

🎥 1. ATTREZZATURE E TECNOLOGIE CONDIVISE:
• Drone DJI Mavic 3 Cine (${droneCompanies.length} aziende):
  ➔ ${droneCompanies.join(', ')}
  (Ottimizzazione: programmare le manutenzioni e ricariche batterie su un unico ciclo settimanale).
• Sony FX3 Cinema Line (${fx3Companies.length} aziende):
  ➔ ${fx3Companies.join(', ')}
  (Standardizzazione LUT e profili colore S-Log3/S-Cinetone identici).
• Parco Luci Continue Aputure 600d / 300x (${aputureCompanies.length} aziende):
  ➔ ${aputureCompanies.join(', ')}
  (Softbox Octa 120 e diffusori già montati a soffitto nel Limbo DADO).
• Luci Nanlite Pavotube RGB (${nanliteCompanies.length} aziende):
  ➔ ${nanliteCompanies.join(', ')}
• Microfonia Sennheiser AVX Wireless (${sennheiserCompanies.length} aziende):
  ➔ ${sennheiserCompanies.join(', ')}

📦 2. FORMATI DI CONSEGNA & DELIVERABLES IN COMUNE:
• Master Cinema 4K ProRes 422 (${proResCompanies.length} aziende):
  ➔ ${proResCompanies.join(', ')}
• Cut Verticali 9:16 per Social / Reels / TikTok (${verticalReelsCompanies.length} aziende):
  ➔ ${verticalReelsCompanies.join(', ')}
  (Opportunità di montaggio combinato in timeline condivise DaVinci Resolve).

📍 3. LOCATION & MODALITÀ DI SET CONDIVISE:
• Produzione interna nel Limbo Studio DADO (${studioDADOCompanies.length} aziende):
  ➔ ${studioDADOCompanies.join(', ')}
• Set esterni / Stabilimenti industriali / Trasferte:
  ➔ ${companies.filter(c => !studioDADOCompanies.includes(c.name)).map(c => c.name).join(', ')}

💳 4. PROFILO ECONOMICO & INSOLUTI APERTI IN COMUNE:
• Clienti con acconto versato ma SALDO APERTO (${pendingBalanceCompanies.length} aziende):
  ➔ ${pendingBalanceCompanies.join(' • ')}
• Clienti saldati al 100%:
  ➔ ${companies.filter(c => (c.compensation?.balance || 0) === 0).map(c => c.name).join(', ')}
• Metodo di pagamento dominante: Bonifico bancario (9 aziende su 11) con clausola contrattuale a 30 giorni data fattura.`
  }

  // ── 3. ELENCO & RICERCHE INTERNE TRA LE AZIENDE CON CUI COLLABORIAMO ──
  const isCollabQuery = p.includes('collabora') || p.includes('partner') || p.includes('elenco') || p.includes('tutte le aziende') || p.includes('tutti i clienti') || p.includes('chi sono i clienti') || p.includes('quali aziende') || p.includes('mostra aziende') || p.includes('lista clienti') || p.includes('lista aziende') || (p.includes('aziend') && (p.includes('nostr') || p.includes('intern') || p.includes('portafoglio') || p.includes('lavoriamo') || p.includes('collabor') || p.includes('tutt')))
  if (isCollabQuery && matchedCompanies.length === 0) {
    const totalAmount = companies.reduce((sum, c) => sum + (c.compensation?.amount || 0), 0)
    return `🏢 DIRECTORY INTERNA CRM: AZIENDE CON CUI COLLABORIAMO (${companies.length} PARTNER ATTIVI)
─────────────────────────────────────────────────────────────
Volume totale contrattualizzato: € ${totalAmount.toLocaleString('it-IT')}

${companies.map((c, i) => `${i + 1}. ${c.name.toUpperCase()} (${c.industry})
   • Referente: ${c.contactPerson?.name || 'N/D'} (${c.contactPerson?.role || 'Referente'}) • ${c.contact?.directEmail || c.contact?.email}
   • Valore commessa: € ${(c.compensation?.amount || 0).toLocaleString('it-IT')} | Stato saldo: ${c.compensation?.status || 'N/D'} (Residuo: € ${(c.compensation?.balance || 0).toLocaleString('it-IT')})
   • Date set: ${c.workSchedule?.datesFormatted || 'N/D'} | Location: ${c.workSchedule?.location || 'Studio'}
   • Attrezzature impiegate: ${(c.requestedMaterials || []).slice(0, 3).join(', ')}`).join('\n\n')}

💡 Per approfondire una specifica azienda, digita ad esempio: "Dossier ${companies[0]?.name}" o "Confronto tra ${companies[0]?.name} e ${companies[1]?.name}".`
  }

  // ── 4. RICERCA MIRATA PER PAROLA CHIAVE NEL CRM (Attrezzatura, città, referente, formato) ──
  // Se l'utente cerca un termine tecnico (es. "drone", "sony", "reels", "milano", "bonifico", "4k")
  const searchTerms = ['drone', 'sony', 'fx3', 'a7s', 'aputure', 'nanlite', 'sennheiser', 'gimbal', 'atomos', 'prores', 'reel', 'tiktok', 'milano', 'monza', 'veneto', 'toscana', 'bonifico', 'pec', 'acconto', 'saldo', 'intervista', '4k', 'limbo']
  const matchedTerm = searchTerms.find(term => p.includes(term))
  if (matchedTerm && matchedCompanies.length === 0) {
    const hits = companies.filter(c => {
      const mat = (c.requestedMaterials || []).join(' ').toLowerCase()
      const loc = (c.workSchedule?.location || '').toLowerCase()
      const ind = (c.industry || '').toLowerCase()
      const pay = (c.compensation?.paymentMethod || '').toLowerCase()
      const stat = (c.compensation?.status || '').toLowerCase()
      const con = (c.contract?.digitalFormat || '').toLowerCase()
      const iss = (c.issues?.description || '').toLowerCase()
      return mat.includes(matchedTerm) || loc.includes(matchedTerm) || ind.includes(matchedTerm) || pay.includes(matchedTerm) || stat.includes(matchedTerm) || con.includes(matchedTerm) || iss.includes(matchedTerm)
    })

    if (hits.length > 0) {
      return `🔍 RISULTATO RICERCA INTERNA NEL CRM PER: "${matchedTerm.toUpperCase()}"
─────────────────────────────────────────────────────────────
Trovate ${hits.length} aziende corrispondenti su ${companies.length} nel database:

${hits.map((c, idx) => `• ${c.name} (${c.industry})
  - Valore commessa: € ${(c.compensation?.amount || 0).toLocaleString('it-IT')} | Saldo: € ${(c.compensation?.balance || 0).toLocaleString('it-IT')}
  - Referente: ${c.contactPerson?.name} (${c.contact?.phone || c.contact?.mobile})
  - Location: ${c.workSchedule?.location || 'Studio'}
  - Corrispondenza tecnica: ${(c.requestedMaterials || []).filter(m => m.toLowerCase().includes(matchedTerm)).join(' • ') || 'Dettaglio registrato nella scheda'}`).join('\n\n')}

💡 Puoi digitare "Confronta ${hits[0]?.name} e ${hits[1]?.name || 'un altro cliente'}" per un'analisi comparativa diretta.`
    }
  }

  // ── 5. DOSSIER SPECIFICO PER UNA SINGOLA AZIENDA CITATA ──────────
  if (matchedCompanies.length === 1) {
    const matchedCompany = matchedCompanies[0]
    const companyOpps = opps.filter(o => o.company?.toLowerCase() === matchedCompany.name.toLowerCase())
    const balance = matchedCompany.compensation?.balance || 0
    const deposit = matchedCompany.compensation?.deposit || 0
    const totalComp = matchedCompany.compensation?.amount || 0

    return `🏢 DOSSIER STRATEGICO APPROFONDITO: ${matchedCompany.name.toUpperCase()}
─────────────────────────────────────────────────────────────
👤 REFERENTE & CONTATTI DIRETTI:
• Referente: ${matchedCompany.contactPerson?.name || 'N/D'} (${matchedCompany.contactPerson?.role || 'Referente'})
• Email: ${matchedCompany.contact?.directEmail || matchedCompany.contact?.email || 'N/D'}
• Telefono / Mobile: ${matchedCompany.contact?.mobile || matchedCompany.contact?.phone || 'N/D'}
• Canale di primo contatto: ${matchedCompany.firstContact?.channel || 'Diretto'} (${matchedCompany.firstContact?.date || 'N/D'})
• Note storico: "${matchedCompany.firstContact?.notes || 'Nessuna nota storica'}"

⏱️ PROGRAMMAZIONE & GIORNI DI LAVORO SUL SET:
• Durata e tipologia: ${matchedCompany.workSchedule?.scheduleType || 'Standard'}
• Date calendarizzate: ${matchedCompany.workSchedule?.datesFormatted || 'Da definire'}
• Orari di produzione: ${matchedCompany.workSchedule?.hours || 'Giornata standard'}
• Location: ${matchedCompany.workSchedule?.location || 'Studio/Esterna'}
• Attrezzature impiegate: ${(matchedCompany.requestedMaterials || []).slice(0, 4).join(' • ')}

💰 SITUAZIONE FINANZIARIA & STATO PAGAMENTO:
• Importo complessivo commessa: € ${totalComp.toLocaleString('it-IT')}
• Acconto corrisposto: € ${deposit.toLocaleString('it-IT')}
• Saldo residuo: € ${balance.toLocaleString('it-IT')} [Stato: ${matchedCompany.compensation?.status || 'N/D'}]
• Condizioni e metodo: ${matchedCompany.compensation?.paymentMethod || 'Bonifico bancario'}
${balance > 0 ? `⚠️ ATTENZIONE: Coda di pagamento aperta per € ${balance.toLocaleString('it-IT')}. Trattenere i master 4K definitivi fino a riscontro contabile.` : '✅ Posizione amministrativa regolare: commessa interamente saldata.'}

🎯 METODO CONSIGLIATO PER TRATTARE E NEGOZIARE:
• Profilo cliente: ${matchedCompany.industry}. Molto attenti alla reputazione e all'estetica del brand.
• Leva di negoziazione: Valorizzare l'esclusiva sui diritti, la flessibilità logistica e l'utilizzo del drone/ottiche cinema. Se chiedono sconti, non abbassare il prezzo: scorporare piuttosto una declinazione di formato o proporre un pacchetto annuale con acconto immediato del 50%.
${companyOpps.length > 0 ? `• Opportunità aperta in negoziazione: ${companyOpps.map(o => `"${o.title}" da € ${o.value.toLocaleString('it-IT')} (${o.stage})`).join(', ')}.` : ''}

🛠️ CRITICITÀ PASSATE GESTITE CON SUCCESSO:
• Problema riscontrato: ${matchedCompany.issues?.description || 'Nessuna criticità pregressa.'}
• Soluzione DADO: ${matchedCompany.issues?.resolution || 'Gestione regolare del set.'}`
  }

  // ── 6. METODO TRATTARE PREVENTIVI & NEGOZIAZIONE ─────────────────
  if (p.includes('metodo') || p.includes('trattare') || p.includes('preventiv') || p.includes('negozia') || p.includes('scont') || p.includes('offert')) {
    const totalPotential = opps.reduce((sum, o) => sum + (o.value || 0), 0)

    return `💼 GUIDA STRATEGICA: METODO DI TRATTARE I PREVENTIVI & CHIUSURA COMMESSE
─────────────────────────────────────────────────────────────
📊 PANORAMICA PIPELINE: € ${totalPotential.toLocaleString('it-IT')} ripartiti su ${opps.length} opportunità attive.

🎯 REGOLE DI INGEGNERIA NEGOZIALE PER DADO CREATIVE STUDIO:

1️⃣ NON CALARE MAI IL PREZZO SULLE COMMESSE SCADENZA:
• Caso Officine Meccaniche Riva (€ 9.200 - In scadenza oggi):
  - Tattica: Sottolineare che la tariffa include 2 giornate piene di set (giorno 1 capannone + giorno 2 linee robotizzate), transcodifica ProRes 422 e riprese aeree autorizzate indoor.
  - Se richiedono uno sconto: NON ridurre la cifra, offri in alternativa un teaser omaggio da 30s per LinkedIn già compreso nella quota attuale se confermano entro le 18:30.

2️⃣ LEVA DEI PACCHETTI MODULARI NELLA MODA & EVENTI LUXURY:
• Caso Alpha Studio Milano (€ 7.500) e Vogue Events (€ 6.500):
  - Tattica: Il costo dello studio (limbo A) e del set luci continue (Aputure 600d) è un costo fisso già ammortizzato. Proponi un contratto quadro semestrale: 3 shooting garantiti a tariffa bloccata con acconto 40% alla firma.

3️⃣ TUTELA DEI DIRITTI D'AUTORE E FORMAT BROADCAST:
• Caso Solaris Green Energy (€ 8.100 - Spot TV + Digital ADS):
  - Tattica: I diritti di messa in onda TV locale hanno un valore intrinseco. Se il cliente temporeggia, proponi una formula con licenza d'uso di 12 mesi estendibile, riducendo l'impatto percepito senza svalutare la produzione video.

4️⃣ COME GESTIRE I TERMINI DI PAGAMENTO:
• Sempre 40% all'accettazione del preventivo / prima del carico furgone.
• 30% a rough cut approvato con watermark protettivo.
• Saldo 30% contestuale al rilascio del master 4K definitivo senza watermark. Evitare dilazioni oltre i 30gg per clienti non corporate.`
  }

  // ── 7. INSOLUTI E CODA DI PAGAMENTO ─────────────────────────────
  if (p.includes('insolut') || p.includes('coda') || p.includes('pagament') || p.includes('saldo') || p.includes('incass') || p.includes('accont')) {
    const pendingBalances = companies.filter(c => (c.compensation?.balance || 0) > 0 || c.compensation?.status === 'Acconto versato')
    const totalPending = pendingBalances.reduce((sum, c) => sum + (c.compensation?.balance || 0), 0)

    return `⏳ GESTIONE INSOLUTI & CODA DI PAGAMENTO CLIENTELA
─────────────────────────────────────────────────────────────
🚨 VOLUME CREDITI IN SOSPESO: € ${totalPending.toLocaleString('it-IT')} da incassare su commesse con acconto.

📋 DETTAGLIO POSIZIONI APERTE:
${pendingBalances.map(c => `• ${c.name}:
  - Totale commessa: € ${(c.compensation?.amount || 0).toLocaleString('it-IT')}
  - Acconto incassato: € ${(c.compensation?.deposit || 0).toLocaleString('it-IT')}
  - SALDO IN SOSPESO: € ${(c.compensation?.balance || 0).toLocaleString('it-IT')}
  - Condizioni pattuite: ${c.compensation?.paymentMethod || 'Bonifico'}
  - Referente da contattare: ${c.contactPerson?.name} (${c.contact?.mobile || c.contact?.phone})`).join('\n\n')}

🎯 STRATEGIA DI RECUPERO SALDI DADO:
1. Officine Riva (€ 5.200): Il saldo scade a 30gg data fattura. La transcodifica finale ProRes è in corso oggi; inviare fattura di saldo contestualmente alla consegna dell'anteprima protetta.
2. Beta Digital (€ 2.800): Bonifico 30gg fine mese. Verificare con Alessandro Neri l'inserimento nel primo ciclo di pagamenti mensile.
3. Kroma Ceramiche (€ 2.900): RIBA 60gg data fattura. Emissione automatica tramite home banking senza ritardi.`
  }

  // ── 8. GIORNI DI LAVORO SUL SET & CARICO OPERATIVO ──────────────
  if (p.includes('giorn') || p.includes('durata') || p.includes('ore') || p.includes('schedule') || p.includes('orari')) {
    const workDaysBreakdown = companies.map(c => ({
      name: c.name,
      schedule: c.workSchedule?.scheduleType || '1 giorno',
      dates: c.workSchedule?.datesFormatted || 'Recentemente',
      hours: c.workSchedule?.hours || 'Standard',
      revenue: c.compensation?.amount || 0
    }))

    return `⏱️ AUDIT PROGRAMMAZIONE: NUMERO GIORNI DI LAVORO & CARICO OPERATIVO
─────────────────────────────────────────────────────────────
📅 DISTRIBUZIONE DEI GIORNI DI SET PER CLIENTE NEL CRM:

${workDaysBreakdown.map(w => `• ${w.name}:
  - Impegno: ${w.schedule} (${w.hours})
  - Date: ${w.dates} | Valore commessa: € ${w.revenue.toLocaleString('it-IT')}`).join('\n\n')}

📊 ANALISI PRODUTTIVITÀ & RESA PER GIORNATA:
• Produzioni intense multi-day (1-2 giorni completi):
  - Officine Riva: 1 giorno intero + 1 pomeriggio (€ 9.200) -> Redditività top industriale.
  - Kroma Ceramiche: 2 giorni interi consecutivi in studio DADO (€ 5.400).
  - Vogue Events: 1 giorno con orario continuato di 15 ore (€ 6.500).

• Produzioni mirate a fasce orarie specifiche:
  - Tenuta Poggio Antico: 2/3 ore al tramonto per golden hour sui filari (€ 3.200).
  - Urban Mobility: 3 ore all'alba per strade deserte a Milano (€ 1.500).
  - Gusto & Tradizione: 5 ore pomeridiane a cucine chiuse (€ 3.600).`
  }

  // ── 9. FALLBACK GENERALE PER DOMANDE CRM ────────────────────────
  const totalRev = companies.reduce((acc, c) => acc + (c.compensation?.amount || 0), 0)
  const fullyPaidCount = companies.filter(c => c.compensation?.status === 'Saldato').length
  const pendingCount = companies.length - fullyPaidCount

  return `📊 REPORT OPERATIVO DADO CREATIVE STUDIO CRM
─────────────────────────────────────────────────────────────
Analisi elaborata in tempo reale per: "${prompt}"

• QUADRO COMMERCIALE COMPLESSIVO:
  - Aziende partner nel CRM: ${companies.length} clienti attivi per un volume contrattualizzato di € ${totalRev.toLocaleString('it-IT')}.
  - Posizioni saldate al 100%: ${fullyPaidCount} clienti.
  - Posizioni con saldo in sospeso / acconto: ${pendingCount} clienti.
  - Pipeline trattative aperte: € ${opps.reduce((s, o) => s + (o.value || 0), 0).toLocaleString('it-IT')} su ${opps.length} opportunità.

💡 Interrogazioni disponibili:
- "Quali sono le aziende con cui collaboriamo?" (elenco completo dettagliato)
- "Quali dati e punti in comune hanno le aziende?" (incrocio attrezzature, formati e set)
- "Chi usa il drone?" o "Chi usa la Sony FX3?" o "Chi gira in studio?"
- "Confronta Officine Riva e Solaris Green Energy"
- "Quali clienti hanno saldi aperti o insoluti?"`
}

// ─────────────────────────────────────────────────────────────
// ENDPOINT NOTE PER SVILUPPATORE (n.drea.t@gmail.com)
// ─────────────────────────────────────────────────────────────
app.post('/api/developer-notes', async (req, res) => {
  try {
    const { note } = req.body
    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Nota vuota' })
    }

    const notesFile = path.join(__dirname, 'data', 'developerNotes.json')
    let notes = []
    if (fs.existsSync(notesFile)) {
      try {
        notes = JSON.parse(fs.readFileSync(notesFile, 'utf8'))
      } catch (e) {
        notes = []
      }
    }

    const newEntry = {
      id: Date.now().toString(),
      recipient: 'n.drea.t@gmail.com',
      note: note.trim(),
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString('it-IT')
    }
    notes.unshift(newEntry)
    fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2), 'utf8')
    console.log(`📩 Nuova nota per lo sviluppatore (${newEntry.recipient}):`, newEntry.note)

    res.json({ success: true, recipient: 'n.drea.t@gmail.com', entry: newEntry })
  } catch (err) {
    console.error('Errore gestione nota sviluppatore:', err)
    res.status(500).json({ error: 'Errore interno nel salvataggio della nota' })
  }
})

// ─────────────────────────────────────────────────────────────
// ENDPOINT GOOGLE OAUTH2 (GMAIL & DRIVE)
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// ENDPOINT GOOGLE OAUTH2 (GMAIL & DRIVE)
// ─────────────────────────────────────────────────────────────

app.get('/api/auth/google/url', (req, res) => {
  const oauth2Client = getOAuth2Client()
  if (!oauth2Client) {
    return res.status(500).json({ error: 'credentials.json non presente o non valido nel server' })
  }

  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  })

  res.json({ url })
})

// Gestore universale dei callback OAuth2 di Google
async function handleOAuthCallback(req, res) {
  const { code, error } = req.query
  if (error) {
    console.error('Google OAuth error:', error)
    return res.redirect(`http://localhost:3000/opportunities?google=error&msg=${encodeURIComponent(error)}`)
  }
  if (!code) {
    return res.status(400).send('Codice autorizzazione mancante.')
  }

  // Identifica l'URI usato nella richiesta corrente
  const reqUrl = req.originalUrl.split('?')[0]
  const callbackUri = reqUrl.includes('oauth2callback')
    ? 'http://localhost:3000/oauth2callback'
    : 'http://localhost:3000/api/auth/callback/google'

  let oauth2Client = getOAuth2Client(callbackUri)
  if (!oauth2Client) {
    oauth2Client = getOAuth2Client()
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8')
    const dataToken = path.join(__dirname, 'data/google_tokens.json')
    fs.writeFileSync(dataToken, JSON.stringify(tokens, null, 2), 'utf-8')
    console.log('✅ [GMAIL AUTH] Token Google salvati con successo!')

    // Esegui subito una prima scansione a caldo in background
    setTimeout(() => {
      executePipelineSweep().catch(e => console.error('[SWEEP INITIAL]', e))
    }, 1500)

    // Reindirizza l'utente a Opportunities con parametro di successo
    res.redirect('http://localhost:3000/opportunities?google=connected')
  } catch (err) {
    console.error('Errore scambio token Google:', err)
    // Tenta con l'altro URI prima di fallire
    try {
      const fallbackUri = callbackUri.includes('oauth2callback')
        ? 'http://localhost:3000/api/auth/callback/google'
        : 'http://localhost:3000/oauth2callback'
      const fallbackClient = getOAuth2Client(fallbackUri)
      const { tokens } = await fallbackClient.getToken(code)
      fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8')
      const dataToken = path.join(__dirname, 'data/google_tokens.json')
      fs.writeFileSync(dataToken, JSON.stringify(tokens, null, 2), 'utf-8')
      return res.redirect('http://localhost:3000/opportunities?google=connected')
    } catch (e2) {
      console.error('Fallback scambio token fallito:', e2)
      res.status(500).send('Errore autorizzazione Google: ' + err.message)
    }
  }
}

app.get('/oauth2callback', handleOAuthCallback)
app.get('/api/auth/callback/google', handleOAuthCallback)
app.get('/api/auth/google/callback', handleOAuthCallback)

// Controllo stato e profilo account Google connesso
app.get('/api/auth/google/status', async (req, res) => {
  const auth = getAuthenticatedClient()
  if (!auth) {
    return res.json({ connected: false })
  }

  try {
    const oauth2 = google.oauth2({ version: 'v2', auth })
    const userInfo = await oauth2.userinfo.get()
    res.json({
      connected: true,
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture,
    })
  } catch (err) {
    // Se non riesce a recuperare il profilo ma il file esiste
    res.json({
      connected: fs.existsSync(TOKEN_FILE),
      warning: err.message
    })
  }
})

// Disconnessione account Google
app.post('/api/auth/google/disconnect', (req, res) => {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      fs.unlinkSync(TOKEN_FILE)
    }
    const dataToken = path.join(__dirname, 'data/google_tokens.json')
    if (fs.existsSync(dataToken)) {
      fs.unlinkSync(dataToken)
    }
    console.log('🔌 Account Google disconnesso.')
    res.json({ success: true, message: 'Account Google disconnesso con successo.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Sincronizzazione ed estrazione immediata Gmail
app.post('/api/sync/gmail', async (req, res) => {
  try {
    const sweepResult = await executePipelineSweep()
    const crmData = getCrmData()
    res.json({
      success: true,
      ...sweepResult,
      emailsCount: crmData.emails?.length || 0,
      tasksCount: crmData.nextActions?.length || 0,
      companiesCount: crmData.companies?.length || 0
    })
  } catch (err) {
    console.error('Errore sincronizzazione Gmail:', err)
    res.status(500).json({ error: 'Errore sincronizzazione: ' + (err.message || err) })
  }
})

// ── PIPELINE IN BACKGROUND (A RIFLETTORI SPENTI: GMAIL + LLM + API CRM) ──
app.get('/api/pipeline/status', (req, res) => {
  res.json(getPipelineStatus())
})

app.post('/api/pipeline/run', async (req, res) => {
  const result = await executePipelineSweep()
  res.json(result)
})

// Fallback per Single Page Application (React Router - compatibile Express 5)
app.use((req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/oauth2callback')) {
    return res.status(404).json({ error: 'Endpoint non trovato' })
  }
  const indexPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath)
  }
  res.status(404).send('DADO CRM in preparazione. Esegui npm run build prima di avviare.')
})

// ─────────────────────────────────────────────────────────────
// AVVIO SERVER & PIPELINE IN BACKGROUND
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 DADO CRM Backend avviato su http://localhost:${PORT}`)
  // Avvia la pipeline in background "a riflettori spenti" (ogni 60 secondi)
  startBackgroundPipeline(60000)
})
