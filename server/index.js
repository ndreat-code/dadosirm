import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'
import { 
  startBackgroundPipeline, 
  executePipelineSweep, 
  getPipelineStatus,
  getDrafts,
  sendDraft,
  updateDraft,
  deleteDraft,
  checkCalendarSlotAvailability
} from './pipeline/gmailLlmPipeline.js'
import { 
  runCrmCrossCheck, 
  auditAccounting, 
  auditOperations, 
  auditCompany 
} from './services/crossCheckEngine.js'

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
    return { companies: [], opportunities: [], nextActions: [], inventory: [], quotes: [], emails: [], invoices: [] }
  }
}

function saveCrmData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Errore salvataggio crmData.json:', err)
  }
}

// Inizializza OpenAI (supporta anche modelli locali compatibili come Ollama e LM Studio)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'local-key',
  baseURL: process.env.OPENAI_BASE_URL || undefined,
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
    invoices: data.invoices || [],
    invoiceKpis: {
      totalInvoiced: (data.invoices || []).reduce((sum, inv) => sum + (inv.amount || 0), 0),
      totalCollected: (data.invoices || []).reduce((sum, inv) => sum + (inv.deposit || 0), 0),
      totalPending: (data.invoices || []).reduce((sum, inv) => sum + (inv.balance || 0), 0),
      count: (data.invoices || []).length,
    },
    googleConnected: fs.existsSync(TOKEN_FILE),
  })
})

// ─────────────────────────────────────────────────────────────
// ENDPOINT AUDIT & CONTROLLI INCROCIATI (CONTRATTI vs FATTURE vs SET)
// ─────────────────────────────────────────────────────────────

app.get('/api/crm/cross-check', (req, res) => {
  try {
    const crmData = getCrmData()
    const { type, company } = req.query
    if (company) {
      const companyAudit = auditCompany(company, crmData)
      return res.json({ success: true, type: 'company', data: companyAudit })
    }
    if (type === 'accounting') {
      const accAudit = auditAccounting(crmData)
      return res.json({ success: true, type: 'accounting', data: accAudit })
    }
    if (type === 'operations') {
      const opsAudit = auditOperations(crmData)
      return res.json({ success: true, type: 'operations', data: opsAudit })
    }
    const acc = auditAccounting(crmData)
    const ops = auditOperations(crmData)
    res.json({
      success: true,
      type: 'full',
      data: {
        accounting: acc,
        operations: ops,
        companiesCount: crmData.companies?.length || 0,
        invoicesCount: crmData.invoices?.length || 0,
        opportunitiesCount: crmData.opportunities?.length || 0,
        inventoryCount: crmData.inventory?.length || 0
      }
    })
  } catch (err) {
    console.error('Errore audit cross-check:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────
// ENDPOINT INVOICE / FATTURAZIONE ELETTRONICA (BLU NOTTE & ORO)
// ─────────────────────────────────────────────────────────────

app.get('/api/crm/invoices', (req, res) => {
  const data = getCrmData()
  const invoices = data.invoices || []
  res.json({
    invoices,
    totalInvoiced: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
    totalCollected: invoices.reduce((sum, inv) => sum + (inv.deposit || 0), 0),
    totalPending: invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0),
    count: invoices.length,
  })
})

app.post('/api/crm/invoices', (req, res) => {
  try {
    const { number, companyName, amount, deposit, balance, status, dueDate, paymentMethod, description, sdi, pec } = req.body
    if (!companyName || !amount) {
      return res.status(400).json({ error: 'Nome azienda e importo imponibile obbligatori' })
    }
    const crmData = getCrmData()
    if (!crmData.invoices) crmData.invoices = []

    const numVal = parseFloat(amount) || 0
    const vatVal = Math.round(numVal * 0.22)
    const depVal = parseFloat(deposit) || (status === 'Saldato' ? numVal : 0)
    const balVal = balance !== undefined ? parseFloat(balance) : Math.max(0, numVal - depVal)

    const newInvoice = {
      id: 'inv-' + Date.now(),
      number: number || `FAT-2026-${Math.floor(100 + Math.random() * 900)}`,
      companyName: companyName.trim(),
      amount: numVal,
      vat: vatVal,
      totalWithVat: numVal + vatVal,
      deposit: depVal,
      balance: Math.max(0, balVal),
      status: balVal === 0 ? 'Saldato' : (status || 'In attesa saldo'),
      date: new Date().toLocaleDateString('it-IT'),
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT'),
      paymentMethod: paymentMethod || 'Bonifico Bancario 30gg d.f.',
      sdi: sdi || '0000000',
      pec: pec || '',
      description: description || 'Servizi di produzione video / foto DADO Creative Studio'
    }

    crmData.invoices.unshift(newInvoice)
    saveCrmData(crmData)
    res.json({ success: true, invoice: newInvoice, invoices: crmData.invoices })
  } catch (err) {
    console.error('Errore creazione fattura:', err)
    res.status(500).json({ error: 'Errore interno salvataggio fattura' })
  }
})

app.patch('/api/crm/invoices/:id/pay', (req, res) => {
  try {
    const { id } = req.params
    const crmData = getCrmData()
    if (!crmData.invoices) crmData.invoices = []

    const inv = crmData.invoices.find(i => String(i.id) === String(id) || i.number === id)
    if (!inv) {
      return res.status(404).json({ error: 'Fattura non trovata' })
    }

    inv.deposit = inv.amount
    inv.balance = 0
    inv.status = 'Saldato'
    inv.paidAt = new Date().toISOString()

    saveCrmData(crmData)
    res.json({ success: true, invoice: inv, invoices: crmData.invoices })
  } catch (err) {
    console.error('Errore aggiornamento pagamento fattura:', err)
    res.status(500).json({ error: 'Errore interno aggiornamento fattura' })
  }
})

// ─────────────────────────────────────────────────────────────
// ENDPOINT ATTIVITÀ / NEXT ACTIONS
// ─────────────────────────────────────────────────────────────

app.post('/api/crm/activities', (req, res) => {
  try {
    const { title, company, type, dueDate, dueTime, priority, notes, assignedTo } = req.body
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
      assignedTo: assignedTo || '',
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
// ENDPOINT INVENTARIO & GESTIONE NOLEGGI ATTREZZATURA
// ─────────────────────────────────────────────────────────────

app.get('/api/crm/inventory', (req, res) => {
  try {
    const crmData = getCrmData()
    const inventory = crmData.inventory || []
    res.json({ success: true, inventory })
  } catch (err) {
    console.error('Errore lettura inventario:', err)
    res.status(500).json({ error: 'Errore interno lettura inventario' })
  }
})

app.post('/api/crm/inventory', (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      serialNumber,
      status,
      quantity,
      estimatedValue,
      location,
      notes,
      rental
    } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome articolo obbligatorio' })
    }

    const crmData = getCrmData()
    if (!crmData.inventory) crmData.inventory = []

    const newItem = {
      id: 'inv-' + Date.now(),
      name: name.trim(),
      category: category || 'extra',
      brand: brand || '',
      serialNumber: serialNumber || '',
      status: status || 'in_studio',
      quantity: Number(quantity) || 1,
      estimatedValue: Number(estimatedValue) || 0,
      location: location || 'Studio',
      notes: notes || '',
      rental: rental || null,
      rentalHistory: [],
      createdAt: new Date().toISOString()
    }

    crmData.inventory.unshift(newItem)
    saveCrmData(crmData)
    res.json({ success: true, item: newItem, inventory: crmData.inventory })
  } catch (err) {
    console.error('Errore creazione articolo inventario:', err)
    res.status(500).json({ error: 'Errore interno creazione articolo' })
  }
})

app.patch('/api/crm/inventory/:id', (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    const crmData = getCrmData()
    if (!crmData.inventory) crmData.inventory = []

    const idx = crmData.inventory.findIndex(item => String(item.id) === String(id))
    if (idx === -1) {
      return res.status(404).json({ error: 'Articolo non trovato' })
    }

    crmData.inventory[idx] = {
      ...crmData.inventory[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    saveCrmData(crmData)
    res.json({ success: true, item: crmData.inventory[idx], inventory: crmData.inventory })
  } catch (err) {
    console.error('Errore aggiornamento articolo inventario:', err)
    res.status(500).json({ error: 'Errore interno aggiornamento articolo' })
  }
})

app.delete('/api/crm/inventory/:id', (req, res) => {
  try {
    const { id } = req.params
    const crmData = getCrmData()
    if (!crmData.inventory) crmData.inventory = []

    crmData.inventory = crmData.inventory.filter(item => String(item.id) !== String(id))
    saveCrmData(crmData)
    res.json({ success: true, inventory: crmData.inventory })
  } catch (err) {
    console.error('Errore eliminazione articolo inventario:', err)
    res.status(500).json({ error: 'Errore interno eliminazione articolo' })
  }
})

// Assegna noleggio ad un articolo
app.post('/api/crm/inventory/:id/rent', (req, res) => {
  try {
    const { id } = req.params
    const {
      clientName,
      company,
      contactPhone,
      contactEmail,
      startDate,
      endDate,
      agreedPrice,
      pricingType,
      contractCode,
      deposit,
      notes
    } = req.body

    const crmData = getCrmData()
    if (!crmData.inventory) crmData.inventory = []

    const idx = crmData.inventory.findIndex(item => String(item.id) === String(id))
    if (idx === -1) {
      return res.status(404).json({ error: 'Articolo non trovato' })
    }

    const rentalData = {
      id: 'rent-' + Date.now(),
      clientName: clientName || 'Referente non specificato',
      company: company || 'Cliente Diretto',
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || '',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      agreedPrice: Number(agreedPrice) || 0,
      pricingType: pricingType || 'Totale forfait',
      contractCode: contractCode || 'DADO-RENT-' + Date.now().toString().slice(-4),
      deposit: Number(deposit) || 0,
      notes: notes || '',
      rentedAt: new Date().toISOString()
    }

    crmData.inventory[idx].status = 'noleggiato'
    crmData.inventory[idx].location = 'Fuori Studio'
    crmData.inventory[idx].rental = rentalData

    saveCrmData(crmData)
    res.json({ success: true, item: crmData.inventory[idx], inventory: crmData.inventory })
  } catch (err) {
    console.error('Errore assegnazione noleggio:', err)
    res.status(500).json({ error: 'Errore interno assegnazione noleggio' })
  }
})

// Rientro noleggio in studio
app.post('/api/crm/inventory/:id/return', (req, res) => {
  try {
    const { id } = req.params
    const { returnLocation, returnNotes } = req.body
    const crmData = getCrmData()
    if (!crmData.inventory) crmData.inventory = []

    const idx = crmData.inventory.findIndex(item => String(item.id) === String(id))
    if (idx === -1) {
      return res.status(404).json({ error: 'Articolo non trovato' })
    }

    const currentRental = crmData.inventory[idx].rental
    if (currentRental) {
      if (!crmData.inventory[idx].rentalHistory) {
        crmData.inventory[idx].rentalHistory = []
      }
      crmData.inventory[idx].rentalHistory.unshift({
        ...currentRental,
        returnedAt: new Date().toISOString(),
        returnNotes: returnNotes || ''
      })
    }

    crmData.inventory[idx].status = 'in_studio'
    crmData.inventory[idx].location = returnLocation || 'Studio'
    crmData.inventory[idx].rental = null

    saveCrmData(crmData)
    res.json({ success: true, item: crmData.inventory[idx], inventory: crmData.inventory })
  } catch (err) {
    console.error('Errore rientro noleggio:', err)
    res.status(500).json({ error: 'Errore interno rientro noleggio' })
  }
})

// ─────────────────────────────────────────────────────────────
// ENDPOINT ASK OPEN AI
// ─────────────────────────────────────────────────────────────

// Generatore meteorologico real-time basato su Open-Meteo per Studio DADO (Milano)
async function getLiveWeatherReport() {
  try {
    const wmoWeather = {
      0: 'Cielo sereno e limpido ☀️',
      1: 'Prevalentemente sereno 🌤️',
      2: 'Parzialmente nuvoloso ⛅',
      3: 'Coperto / Nuvoloso ☁️',
      45: 'Presenza di nebbia 🌫️',
      48: 'Nebbia densa 🌫️',
      51: 'Pioggerella leggera 🌦️',
      53: 'Pioggerella moderata 🌧️',
      55: 'Pioggerella fitta 🌧️',
      61: 'Pioggia debole 🌧️',
      63: 'Pioggia moderata 🌧️',
      65: 'Pioggia forte 🌧️',
      71: 'Nevicata debole 🌨️',
      73: 'Nevicata moderata 🌨️',
      75: 'Nevicata intensa ❄️',
      80: 'Rovesci di pioggia isolati 🌦️',
      81: 'Rovesci di pioggia moderati 🌧️',
      82: 'Rovesci di pioggia violenti ⛈️',
      95: 'Temporale ⛈️',
      96: 'Temporale con grandine ⛈️',
      99: 'Temporale violento con grandine ⛈️'
    }

    const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=45.4642&longitude=9.1900&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FRome', { signal: AbortSignal.timeout(3000) })
    if (weatherRes.ok) {
      const wData = await weatherRes.json()
      const cur = wData.current_weather || {}
      const daily = wData.daily || {}
      const temp = cur.temperature !== undefined ? `${cur.temperature}°C` : '18.5°C'
      const wind = cur.windspeed !== undefined ? `${cur.windspeed} km/h` : '3 km/h'
      const condition = wmoWeather[cur.weathercode] || 'Sereno o poco nuvoloso 🌤️'
      const maxT = daily.temperature_2m_max?.[0] !== undefined ? `${daily.temperature_2m_max[0]}°C` : '24°C'
      const minT = daily.temperature_2m_min?.[0] !== undefined ? `${daily.temperature_2m_min[0]}°C` : '13°C'
      const rainProb = daily.precipitation_probability_max?.[0] !== undefined ? `${daily.precipitation_probability_max[0]}%` : '0%'

      let shootingAdvice = ''
      const windNum = parseFloat(cur.windspeed || 0)
      const rainNum = parseFloat(daily.precipitation_probability_max?.[0] || 0)

      if (windNum < 25 && rainNum < 20) {
        shootingAdvice = '• 🚁 **Drone DJI Mavic 3 Cine & Esterne:** Condizioni ottimali per voli stabili, riprese aeree e shooting outdoor con luce naturale favorevole.'
      } else if (windNum >= 25) {
        shootingAdvice = '• ⚠️ **Attenzione raffiche di vento:** Vento sostenuto, raccomandata prudenza per il drone DJI Mavic 3 Cine in quota.'
      } else {
        shootingAdvice = '• 🌧️ **Rischio pioggia:** Consigliato pianificare le sessioni nel limbo indoor di Studio DADO con illuminazione controllata Aputure.'
      }

      return `🌤️ **PREVISIONI METEO & CONDIZIONI OPERATIVE PER SHOOTING (MILANO / STUDIO DADO)**
─────────────────────────────────────────────────────────────
Rilevamento meteorologico in tempo reale per oggi a Milano:

• ☀️ **Situazione attuale:** ${condition}
• 🌡️ **Temperatura:** ${temp} (Minima: ${minT} • Massima: ${maxT})
• 💨 **Velocità del vento:** ${wind}
• 🌧️ **Probabilità di pioggia:** ${rainProb}

🎬 **Valutazione tecnica per le produzioni di DADO Studio:**
${shootingAdvice}`
    }
  } catch (err) {
    // Fallback statico
  }
  return `🌤️ **METEO E CONDIZIONI PER LE RIPRESE (MILANO / STUDIO DADO):**
A Milano oggi il tempo è prevalentemente sereno con temperature miti (intorno ai 18°C - 23°C) e venti deboli. Condizioni ottimali per riprese in esterna e voli del drone DJI Mavic 3 Cine.`
}

app.get('/api/ai/config', (req, res) => {
  const currentKey = (process.env.OPENAI_API_KEY || '').trim()
  const isRealKey = Boolean(currentKey && currentKey.startsWith('sk-'))
  const maskedKey = isRealKey ? `${currentKey.slice(0, 7)}...${currentKey.slice(-4)}` : ''
  const model = process.env.OPENAI_MODEL || (isRealKey ? 'gpt-4o' : 'llama3.2')
  const disableOllama = process.env.DISABLE_OLLAMA === 'true'
  res.json({
    hasKey: isRealKey,
    maskedKey,
    model,
    disableOllama,
    currentEngine: isRealKey ? `OpenAI Cloud (${model})` : (disableOllama ? 'Motore CRM Interno' : 'Ollama Locale (llama3.2)')
  })
})

app.post('/api/ai/config', async (req, res) => {
  try {
    const { apiKey, model, disableOllama } = req.body
    const envPath = path.join(rootDir, '.env')
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : ''

    const envVars = {}
    envContent.split('\n').forEach(line => {
      const parts = line.split('=')
      if (parts[0] && parts[0].trim() && !parts[0].startsWith('#')) {
        envVars[parts[0].trim()] = parts.slice(1).join('=').trim()
      }
    })

    if (apiKey !== undefined && apiKey.trim() !== '') {
      const cleanKey = apiKey.trim()
      process.env.OPENAI_API_KEY = cleanKey
      envVars['OPENAI_API_KEY'] = cleanKey
      if (cleanKey.startsWith('sk-')) {
        delete process.env.OPENAI_BASE_URL
        delete envVars['OPENAI_BASE_URL']
      }
    }
    if (model) {
      process.env.OPENAI_MODEL = model
      envVars['OPENAI_MODEL'] = model
    }
    if (disableOllama !== undefined) {
      process.env.DISABLE_OLLAMA = String(disableOllama)
      envVars['DISABLE_OLLAMA'] = String(disableOllama)
    }

    const newEnvStr = Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join('\n') + '\n'
    fs.writeFileSync(envPath, newEnvStr, 'utf-8')

    res.json({
      success: true,
      hasKey: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')),
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      disableOllama: process.env.DISABLE_OLLAMA === 'true'
    })
  } catch (err) {
    res.status(500).json({ error: 'Errore salvataggio configurazione AI: ' + err.message })
  }
})

app.post('/api/ai/ask', async (req, res) => {
  try {
    const userRole = (req.headers['x-user-role'] || '').toLowerCase()
    const isDirectorOrAdmin = userRole.includes('director') || userRole.includes('admin') || userRole.includes('amministratore')
    if (!isDirectorOrAdmin && (userRole === 'dipendente' || userRole === 'restricted')) {
      return res.status(403).json({ error: 'Accesso negato: interrogazione OpenAI non consentita per questo profilo' })
    }

    const { prompt } = req.body
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt richiesto' })
    }

    const pLower = prompt.toLowerCase().trim()

    const crmData = getCrmData()

    // Controllo pattern cross-check per eventuale fallback
    const isCrossCheckQuery = 
      /(?:controll[oi]\s+incrociat[oi]|audit|verific[ah]\s+incrociat[ah]|conflitt[oi]\s+attrezzatur|scostament[oi]\s+fattur|discrepanz|incroc(?:i|ia|iare|io|iamenti))/i.test(pLower) ||
      ((pLower.includes('controll') || pLower.includes('verific') || pLower.includes('incroc') || pLower.includes('analizz') || pLower.includes('audit') || pLower.includes('scheda')) && 
       (pLower.includes('contratt') || pLower.includes('fattur') || pLower.includes('shooting') || pLower.includes('attrezzatur') || pLower.includes('saldi') || pLower.includes('pagament') || pLower.includes('client'))) ||
      (pLower.includes('contratt') && (pLower.includes('shoot') || pLower.includes('set')) && (pLower.includes('fattur') || pLower.includes('incass') || pLower.includes('saldi') || pLower.includes('econom') || pLower.includes('import'))) ||
      (pLower.includes('contratt') && pLower.includes('fattur')) ||
      (pLower.includes('shooting') && pLower.includes('attrezzatur'))

    // ── GESTIONE DIRETTA: ORARIO ATTUALE ──
    const isTimeQuery = pLower.includes('ora è') || pLower.includes('ore sono') || pLower.includes('orario attuale') || pLower.includes('che ora') || pLower.includes('dimmi l\'ora')
    if (isTimeQuery) {
      const now = new Date()
      const timeStr = now.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' })
      const dateStr = now.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      return res.json({
        answer: `⏰ **ORARIO ATTUALE DELLO STUDIO (FUSO ORARIO ITALIA / ROMA):**\nSono le ore **${timeStr}** di ${dateStr}.`,
        prompt,
        usingOpenAi: false,
        usingOllama: false,
        activeEngine: 'Orologio di Sistema Studio DADO',
        openAiError: null,
        timestamp: new Date().toISOString()
      })
    }

    // Sintesi compatta ad alta densità per modelli LLM (evita saturazione token e velocizza Ollama da 30s a 1-2s)
    const compactCompanies = (crmData.companies || []).map(c => ({
      nome: c.name,
      settore: c.sector,
      referente: c.contactPerson ? `${c.contactPerson.name} (${c.contactPerson.role || ''}, ${c.contactPerson.email || ''})` : '',
      contratto: c.contract ? `${c.contract.code} - €${c.contract.amount} (${c.contract.paymentStatus})` : '',
      dateLavoro: c.workSchedule ? `${c.workSchedule.startDate} [${c.workSchedule.pattern || ''}] - ore: ${c.workSchedule.hours || ''}` : '',
      attrezzatura: Array.isArray(c.equipmentAssigned) ? c.equipmentAssigned.map(e => e.name || e).join(', ') : '',
      criticita: c.criticalIssues || ''
    }))

    const compactOpportunities = (crmData.opportunities || []).map(o => ({
      nome: o.title || o.name,
      azienda: o.company,
      valore: `€${o.value || 0}`,
      fase: o.stage,
      probabilita: `${o.probability || 0}%`,
      chiusuraPrevista: o.expectedCloseDate || ''
    }))

    const compactInvoices = (crmData.invoices || []).map(i => ({
      num: i.number,
      cliente: i.client,
      data: i.date,
      totale: `€${i.amount || 0}`,
      acconto: `€${i.deposit || 0}`,
      saldo: `€${i.balanceDue || 0}`,
      stato: i.status,
      scadenza: i.dueDate
    }))

    const compactInventorySummary = `Parco Tecnico DADO Studio (43 voci operative):
• Camere Cinema: Sony FX3 Cinema Line, Sony A7S III (4K ProRes, S-Cinetone)
• Ottiche Sony GM: 24-70mm f/2.8 GM II, 70-200mm f/2.8 GM OSS II, 16-35mm f/2.8 GM, 50mm f/1.2 GM, 85mm f/1.4 GM, 35mm f/1.4 GM
• Droni & Aereo: DJI Mavic 3 Cine (Apple ProRes 422 HQ, doppio radiocomando RC Pro, filtri ND)
• Illuminazione & Limbo: Aputure 600d Pro, Aputure 300x Bi-Color, Amaran T4c, Softbox Light Dome 150, stativi C-Stand
• Audio Professionale: Sennheiser MKH416 Shotgun, Radiomicrofoni Sennheiser AVX e DJI Mic 2
• Stabilizzatori & Grip: DJI RS3 Pro Combo, Monitor/Registratore Atomos Ninja V+, schede CFexpress Type A, SSD Samsung T7 Shield`

    // Sistema di istruzioni arricchito con ragionamento aperto e dati reali del CRM
    const systemPrompt = `Sei l'Executive Producer, Senior Business Strategist e AI Intelligence di "DADO Creative Studio" (studio di produzione video corporate, spot TV, riprese con drone, fotografia moda e rendering 3D con base e limbo a Milano).
Sei integrato direttamente nel nucleo del CRM dello studio e hai accesso in tempo reale ai dati dello studio:

DATA E ORA ATTUALE DI SISTEMA:
${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}

════════════════════════════════════════════════════════════════
DATABASE AZIENDE & COMMESSE (${compactCompanies.length} clienti con referenti, contratti, giorni di lavoro, materiali, pagamenti e criticità):
${JSON.stringify(compactCompanies)}

PIPELINE OPPORTUNITÀ (${compactOpportunities.length} trattative aperte):
${JSON.stringify(compactOpportunities)}

PROSSIMI APPUNTAMENTI & SCADENZE:
${JSON.stringify((crmData.nextActions || []).slice(0, 8))}

INVENTARIO ATTREZZATURE STUDIO:
${compactInventorySummary}

FATTURE E PAGAMENTI (${compactInvoices.length} fatture elettroniche con acconti e saldi):
${JSON.stringify(compactInvoices)}

EMAIL RECENTI SINCRONIZZATE:
${JSON.stringify((crmData.emails || []).slice(0, 5).map(e => ({ from: e.from, subject: e.subject, date: e.date, snippet: (e.snippet || e.body || '').slice(0, 120) })))}
════════════════════════════════════════════════════════════════

LINEE GUIDA DI RAGIONAMENTO E RISPOSTA (FONDAMENTALI):
1. RAGIONAMENTO APERTO, SVILUPPATO ED ARTICOLATO:
   Non limitarti a risposte preconfezionate o a banali elenchi puntati. Sviluppa un ragionamento commerciale e operativo profondo, entrando nel merito delle strategie di produzione, della psicologia di trattativa dei clienti e della gestione del rischio economico.
2. CONTROLLI INCROCIATI TRA DATI DEL CRM (MISSIONE CARDINE ASSISTENTE):
   L'utente usa questo assistente principalmente per effettuare CONTROLLI INCROCIATI tra le varie dimensioni dello studio DADO:
   - Contratti firmati vs Fatturato emesso vs Incassi reali vs Saldi aperti (chi deve ancora pagare, discrepanze importi).
   - Calendario delle date di shooting vs Attrezzature mobilitate (Sony FX3, Drone DJI Mavic 3 Cine, luci Aputure) vs Conflitti di disponibilità o buffer di ricarica.
   - Clienti vs Commesse vs Pipeline trattative.
   NON parlare MAI di meteo o clima (all'utente non interessa e non vuole previsioni meteo). Focalizzati al 100% sull'incrocio rigoroso dei dati aziendali, operativi e finanziari del CRM fornito sopra con cifre in euro, date e codici contratto precisi.
3. ECCELLENZA LINGUISTICA, CONCORDANZA GRAMMATICALE E ACCORDO MORFOLOGICO IN ITALIANO (IMPERATIVO):
   - Esprimiti in un italiano nativo, elegante, fluido, altamente professionale e privo di qualsiasi sgrammaticatura.
   - ACCORDO MORFOLOGICO PERFETTO: Fai corrispondere SEMPRE con precisione millimetrica il genere (maschile/femminile) e il numero (singolare/plurale) di articoli, aggettivi e participi passati ai relativi sostantivi (es: "i contratti stipulati", "le fatture saldate", "l'attrezzatura impiegata", "i saldi ancora scoperti", "le commesse andate a set", "l'acconto versato").
   - Nessuna ripetizione goffa, nessun termine generico o allucinazione: usa i nomi precisi delle aziende, i codici contratto reali e le cifre esatte in euro (€).
   - Struttura le risposte con paragrafi chiari, tabelle comparative o elenchi puntati formattati in modo leggibile ed esecutivo.
4. METODO DI TRATTARE I PREVENTIVI & NEGOZIAZIONE:
   Se l'utente chiede come trattare i preventivi, fornisci un piano tattico personalizzato:
   - Come condurre la trattativa con ciascun cliente (es. Officine Riva con preventivo da €9.200 in scadenza facendo leva sui 2 giorni di produzione e sul montaggio 4K ProRes; Solaris Energy per lo spot TV con diritti di messa in onda; Alpha Studio per i pacchetti convenzionati).
   - Leve di valore: cessione diritti, velocità di consegna (48h), pacchetti continuativi, clausole su acconti e saldi.
   - Difesa del prezzo contro le richieste di ribasso o sconti.
5. PUNTI IN COMUNE & SINERGIE TRA AZIENDE:
   Analizza in modo approfondito i cluster di clientela, le sovrapposizioni di attrezzatura (chi usa le stesse luci Aputure 600d, ottiche Sony GM o droni), i format di consegna (ProRes 422 vs 9:16 verticali), i flussi di lavoro comuni e le opportunità di cross-selling.
6. NUMERO GIORNI DI LAVORO & CALENDARIO:
   Estrai e incrocia con precisione i giorni e le ore effettive di lavoro dai campi workSchedule (es. "un giorno intero + un pomeriggio" per Riva, "2 giorni consecutivi" per Kroma, "2/3 ore all'alba" per Urban Mobility, "tramonto e golden hour" per Poggio Antico, "15 ore fino alle 02:30" per Vogue Events), calcolando la redditività giornaliera, i turni del team e i tempi necessari per la post-produzione.
7. INSOLUTI & CODA DI PAGAMENTO:
   Traccia con precisione i clienti con acconto versato ma saldo ancora aperto (es. Riva €5.200, Kroma €2.900, Beta Digital €2.800) e suggerisci azioni concrete di sollecito cordiale o sblocco delle consegne master legato al saldo.
8. CADENZE TEMPORALI DEI LAVORI PER MESE (FONDAMENTALE):
   Se l'utente chiede le cadenze temporali di ciascun lavoro per un mese specifico o in generale:
   - Identifica con esattezza il mese richiesto e isola ciascun lavoro con le sue cadenze temporali effettive.
   - Per ciascuna commessa del mese fornisci una scheda temporale completa: Nome azienda e settore, Data e Cadenza Temporale, Orari di set, Location, Deliverables e attrezzature, Valore economico e stato pagamenti, Intervallo di cadenza.
   - Fornisci sempre il totale commesse e il volume d'affari complessivo del mese richiesto.
9. CONFRONTO E RICERCA DEI CONTRATTI NEL CORSO DELL'ANNO:
   Se l'utente chiede un confronto, ricerca o andamento dei contratti stipulati nel corso dell'anno 2026:
   - Analizza l'evoluzione cronologica dei contratti stipulati: numero contratti (11 contratti firmati), valore totale (€ 56.900) e crescita del ticket medio.
   - Fornisci il confronto dettagliato: Mese, Cliente, Codice Contratto, Importo (€), Stato del pagamento, Modalità di pagamento e Deliverables.
   - Evidenzia la gestione del credito: € 46.000 incassati vs € 10.900 in attesa di saldo (Riva, Kroma, Beta Digital).
10. INTERCONNESSIONE TOTALE & PRESENTAZIONE RELAZIONALE DEL CRM:
    NON presentare mai dati isolati. Sei un sistema di Business Intelligence relazionale: devi SEMPRE presentare le informazioni collegandole organicamente tra loro in una visione integrata e completa:
    - CLIENTE ➔ Referente, settore, canale di acquisizione
    - CONTRATTO ➔ Codice contratto, data firma, termini
    - INVOICE / FATTURA ➔ Numero fattura, imponibile, IVA 22%, acconto versato, saldo aperto da incassare, data scadenza, SDI/PEC
    - CALENDARIO & SHOOTING ➔ Date di produzione, orari di set, location effettiva
    - ATTREZZATURE MOBILITATE ➔ Telecamere (Sony FX3), ottiche GM, droni DJI, luci Aputure, stabilizzatori e audio
    - CRITICITÀ & FEEDBACK ➔ Problemi riscontrati sul set e soluzione applicata da DADO Studio
    - PROSSIMA AZIONE OPERATIVA ➔ Azione commerciale o di sollecito/consegna consigliata.
11. STILE DI RISPOSTA:
    Professionale, incisivo, altamente analitico, con sezioni tematiche chiare, numeri precisi (€, orari, date) e conclusioni operative immediatamente applicabili.
12. GESTIONE DI RICHIESTE SU CLIENTI NON PRESENTI NEL CRM:
    Se l'utente cerca esplicitamente un'azienda o persona che NON è registrata nel database interno del CRM:
    - Spiega con naturalezza e brevità (1-2 frasi) che l'azienda non è attualmente presente nel CRM dello studio.
13. CONTRATTI PER SHOOTING & FATTURATO (RICHIESTA SPECIFICA):
    Se l'utente chiede informazioni su contratti per shooting e fatturato:
    - Usa ESCLUSIVAMENTE i dati reali del CRM riportati sopra (11 contratti attivi, fatturato totale € 56.900, incassati € 46.000, saldi aperti € 10.900).
    - NON USARE MAI segnaposto generici come "[Nome del cliente]" o "[Data di firma]".`

    let answer = ''
    let usingOpenAi = false
    let usingOllama = false
    let openAiError = null
    let activeEngine = 'NLP Interno'

    // Verifica chiave OpenAI (da richiesta o da variabile d'ambiente .env)
    const reqApiKey = (req.body.apiKey || '').trim()
    const envApiKey = (process.env.OPENAI_API_KEY || '').trim()
    const activeApiKey = reqApiKey.startsWith('sk-') ? reqApiKey : (envApiKey.startsWith('sk-') ? envApiKey : null)
    const isRealOpenAiKey = Boolean(activeApiKey)
    const modelToUse = req.body.model || process.env.OPENAI_MODEL || (isRealOpenAiKey ? 'gpt-4o' : 'gpt-4o-mini')

    // ── PRIORITÀ 1: OPENAI CLOUD (Se presente chiave API reale fornita dall'utente) ──
    if (isRealOpenAiKey) {
      try {
        console.log(`🌐 Interrogazione OpenAI Cloud con modello: ${modelToUse}...`)
        const client = new OpenAI({ apiKey: activeApiKey })
        const completion = await client.chat.completions.create({
          model: modelToUse,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5,
          max_tokens: 1800,
        })
        answer = completion.choices[0]?.message?.content || ''
        if (answer) {
          usingOpenAi = true
          activeEngine = `OpenAI Cloud (${modelToUse})`
        }
      } catch (apiErr) {
        console.warn('OpenAI Cloud ha restituito un errore (' + apiErr.message + ')')
        if (apiErr.code === 'credit_balance_exhausted' || apiErr.status === 429) {
          openAiError = 'credit_exhausted'
        } else {
          openAiError = apiErr.message
        }
      }
    }

    // ── PRIORITÀ 2: OLLAMA LOCALE (Solo se OpenAI non è attivo e Ollama non è stato disabilitato) ──
    const isOllamaDisabled = process.env.DISABLE_OLLAMA === 'true' || req.body.disableOllama === true
    if (!answer && !isOllamaDisabled && !isRealOpenAiKey) {
      try {
        const ollamaCheck = await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(1000) })
        if (ollamaCheck.ok) {
          const tagsData = await ollamaCheck.json()
          const availableModels = tagsData.models || []
          if (availableModels.length > 0) {
            const selectedModel = availableModels.find(m => m.name.includes('llama') || m.name.includes('mistral') || m.name.includes('qwen'))?.name || availableModels[0].name
            console.log(`🦙 Interrogazione Ollama locale con modello: ${selectedModel}...`)

            const ollamaRes = await fetch('http://127.0.0.1:11434/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(60000),
              body: JSON.stringify({
                model: selectedModel,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: prompt }
                ],
                stream: false,
                options: { temperature: 0.7, num_ctx: 4096 }
              })
            })

            if (ollamaRes.ok) {
              const ollamaJson = await ollamaRes.json()
              if (ollamaJson.message?.content) {
                answer = ollamaJson.message.content
                usingOllama = true
                activeEngine = `Ollama Locale (${selectedModel})`
              }
            }
          }
        }
      } catch (ollamaErr) {
        console.warn('Ollama locale non attivo o non disponibile.')
      }
    }

    // ── PRIORITÀ 3: MOTORE AUDIT & CONTROLLI INCROCIATI INTERNO DADO ──
    if (!answer) {
      if (isCrossCheckQuery) {
        answer = runCrmCrossCheck(pLower, crmData)
        activeEngine = 'Motore Audit & Controlli Incrociati Studio DADO (Fallback)'
      } else {
        answer = await generateLocalCrmAnalysis(prompt, crmData)
        activeEngine = 'Motore NLP Studio DADO (Fallback)'
      }
    }

    res.json({ 
      answer, 
      prompt, 
      usingOpenAi, 
      usingOllama, 
      activeEngine, 
      openAiError, 
      timestamp: new Date().toISOString() 
    })
  } catch (err) {
    console.error('Errore gestione richiesta AI:', err)
    res.status(500).json({ 
      error: 'Errore durante la generazione dell\'analisi: ' + (err.message || err) 
    })
  }
})

// Analizzatore intelligente approfondito, dinamico e calcolato per il CRM DADO
async function generateLocalCrmAnalysis(prompt, data) {
  const p = prompt.toLowerCase().trim()
  const companies = data.companies || []
  const opps = data.opportunities || []
  const actions = data.nextActions || []
  const inventory = data.inventory || []
  const invoices = data.invoices || []
  const quotes = data.quotes || []

  // ── 00. SALUTI & CAPABILITIES ASSISTENTE (STILE OPENAI) ──────────
  const isGreeting = 
    /^(ciao|salve|buongiorno|buonasera|hey|ehi|hello|hi)\b/i.test(p) ||
    /(chi sei|cosa puoi fare|come puoi aiutarmi|cosa sai fare|presentati|come stai|a cosa servi)/i.test(p) ||
    p === 'aiuto' || p === 'help'
  if (isGreeting) {
    return `👋 Ciao! Sono l'assistente di intelligenza artificiale integrato nel CRM di **DADO Creative Studio**.

Posso supportarti nell'analisi strategica, commerciale e operativa dello studio interrogando in tempo reale il database interno:
• 🏢 **Clienti & Partner**: anagrafiche, referenti diretti, contratti firmati e storico commesse.
• 🧾 **Fatture & Flussi di Cassa**: imponibili, IVA 22%, acconti già versati e crediti con saldo aperto.
• 📅 **Calendario & Shooting**: date di set, orari di produzione, location (Limbo DADO o trasferte) e cadenze temporali.
• 🎥 **Inventario Attrezzature**: disponibilità di telecamere Sony FX3 Cinema Line, droni DJI, parco luci (Aputure/Nanlite) e ottiche GM.
• 💼 **Pipeline Trattative**: opportunità commerciali in corso e strategie di negoziazione.

Come posso esserti utile oggi?`
  }

  // ── 0-meteo. METEO E CONDIZIONI METEOROLOGICHE (PER SHOOTING & DRONE) ──
  const isWeatherQuery = 
    /(?:che\s+tempo\s+fa|meteo|previsioni|piove|pioggia|temperatura|gradi|sole|vento|temporale|tempo\s+oggi|tempo\s+oggie)/i.test(p) ||
    (p.includes('tempo') && (p.includes('oggi') || p.includes('oggie') || p.includes('domani') || p.includes('fa') || p.includes('milano') || p.includes('fuori') || p.includes('piove') || p.includes('bello') || p.includes('brutto')))

  if (isWeatherQuery) {
    try {
      const wmoWeather = {
        0: 'Cielo sereno e limpido ☀️',
        1: 'Prevalentemente sereno 🌤️',
        2: 'Parzialmente nuvoloso ⛅',
        3: 'Coperto / Nuvoloso ☁️',
        45: 'Presenza di nebbia 🌫️',
        48: 'Nebbia densa 🌫️',
        51: 'Pioggerella leggera 🌦️',
        53: 'Pioggerella moderata 🌧️',
        55: 'Pioggerella fitta 🌧️',
        61: 'Pioggia debole 🌧️',
        63: 'Pioggia moderata 🌧️',
        65: 'Pioggia forte 🌧️',
        71: 'Nevicata debole 🌨️',
        73: 'Nevicata moderata 🌨️',
        75: 'Nevicata intensa ❄️',
        80: 'Rovesci di pioggia isolati 🌦️',
        81: 'Rovesci di pioggia moderati 🌧️',
        82: 'Rovesci di pioggia violenti ⛈️',
        95: 'Temporale ⛈️',
        96: 'Temporale con grandine ⛈️',
        99: 'Temporale violento con grandine ⛈️'
      }

      const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=45.4642&longitude=9.1900&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FRome', { signal: AbortSignal.timeout(3000) })
      if (weatherRes.ok) {
        const wData = await weatherRes.json()
        const cur = wData.current_weather || {}
        const daily = wData.daily || {}
        const temp = cur.temperature !== undefined ? `${cur.temperature}°C` : '18.5°C'
        const wind = cur.windspeed !== undefined ? `${cur.windspeed} km/h` : '3 km/h'
        const condition = wmoWeather[cur.weathercode] || 'Sereno o poco nuvoloso 🌤️'
        const maxT = daily.temperature_2m_max?.[0] !== undefined ? `${daily.temperature_2m_max[0]}°C` : '24°C'
        const minT = daily.temperature_2m_min?.[0] !== undefined ? `${daily.temperature_2m_min[0]}°C` : '13°C'
        const rainProb = daily.precipitation_probability_max?.[0] !== undefined ? `${daily.precipitation_probability_max[0]}%` : '0%'

        let shootingAdvice = ''
        const windNum = parseFloat(cur.windspeed || 0)
        const rainNum = parseFloat(daily.precipitation_probability_max?.[0] || 0)

        if (windNum < 25 && rainNum < 20) {
          shootingAdvice = '• 🚁 **Drone DJI Mavic 3 Cine & Esterne:** Condizioni ideali per voli stabili, riprese aeree e shooting outdoor con luce naturale favorevole.'
        } else if (windNum >= 25) {
          shootingAdvice = '• ⚠️ **Attenzione raffiche di vento:** Vento sostenuto, raccomandata massima prudenza per il drone DJI Mavic 3 Cine in quota.'
        } else {
          shootingAdvice = '• 🌧️ **Rischio pioggia:** Consigliato pianificare le sessioni nel limbo indoor di Studio DADO con illuminazione controllata Aputure.'
        }

        return `🌤️ **PREVISIONI METEO & CONDIZIONI OPERATIVE PER SHOOTING (MILANO / STUDIO DADO)**
─────────────────────────────────────────────────────────────
Rilevamento meteorologico in tempo reale per oggi a Milano:

• ☀️ **Situazione attuale:** ${condition}
• 🌡️ **Temperatura:** ${temp} (Minima: ${minT} • Massima: ${maxT})
• 💨 **Velocità del vento:** ${wind}
• 🌧️ **Probabilità di pioggia:** ${rainProb}

🎬 **Valutazione tecnica per le produzioni di DADO Studio:**
${shootingAdvice}`
      }
    } catch (wErr) {
      return `🌤️ **METEO E CONDIZIONI PER LE RIPRESE (MILANO / STUDIO DADO):**
A Milano oggi il tempo è prevalentemente sereno con temperature miti (intorno ai 18°C - 23°C) e venti deboli. Condizioni ottimali per riprese in esterna e voli del drone DJI Mavic 3 Cine.`
    }
  }

  // ── 0-ora. DOMANDE SU ORARIO ATTUALE ──
  if (p.includes('ora è') || p.includes('ore sono') || p.includes('orario attuale') || p.includes('che ora') || p.includes('dimmi l\'ora')) {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' })
    const dateStr = now.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    return `⏰ **ORARIO ATTUALE DELLO STUDIO (FUSO ORARIO ITALIA / ROMA):**
Sono le ore **${timeStr}** di ${dateStr}.`
  }

  // ── 0-conversazione. CONVERSAZIONE, STATO & CORTESIA ──
  if (/^(come\s+stai|come\s+va|tutto\s+bene|come\s+butta)[\s!.,?]*$/i.test(p)) {
    return `😊 Tutto benissimo, grazie! Sono operativo al 100% e pronto a supportarti nella gestione strategica e operativa di **DADO Creative Studio**:
• 🏢 Monitoraggio contratti, clienti e preventivi
• 🧾 Analisi flussi di cassa, acconti e saldi aperti
• 📅 Calendario produzioni, orari di set e scadenze
• 🎥 Disponibilità attrezzature (Sony FX3, lenti GM, drone Mavic 3, luci Aputure)

Come posso esserti utile in questo momento?`
  }
  if (/^(grazie|grazie\s+mille|ti\s+ringrazio|perfetto|ottimo|gentilissimo)[\s!.,?]*$/i.test(p)) {
    return `Di nulla, è un piacere! Sono sempre qui a disposizione per qualunque analisi, controllo contabile o pianificazione operativa per DADO Studio. Buon lavoro sul set e in regia! 🎬`
  }

  // ── 0-servizi. SERVIZI E ATTIVITÀ DI DADO CREATIVE STUDIO ──
  if (p.includes('cosa fa dado') || p.includes('servizi offrite') || p.includes('servizi fa dado') || p.includes('chi siete') || p.includes('cosa produce dado')) {
    return `🎬 **DADO CREATIVE STUDIO - SERVIZI DI PRODUZIONE AUDIOVISIVA & CREATIVA:**
─────────────────────────────────────────────────────────────
DADO Creative Studio è uno studio di produzione audiovisiva specializzato con sede e limbo a Milano:
• 🎥 **Video Corporate & Industriali**: Riprese 4K HDR ProRes 422 con Sony FX3 Cinema Line e ottiche Sony G-Master.
• 🚁 **Riprese Aeree & Indoor**: Voli con drone DJI Mavic 3 Cine autorizzato per esterni e capannoni industriali.
• 👗 **Fotografia Moda & Campagne ADV**: Set fotografici e video nel limbo ciclorama dello studio o on-location.
• 📺 **Spot TV Broadcast & Digital**: Produzioni commerciali broadcast-grade con parco luci Aputure (600d/300x) e audio radio Sennheiser AVX.
• 🎙️ **Podcast & Video Digital**: Set multi-camera, interviste corporate e format video verticali 9:16 per social.`
  }

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

  // ── 0d-bis. REPORT E DOSSIER SULLE ULTIME COLLABORAZIONI / COMMESSE RECENTI ──
  const isCollabKeyword = /(?:col+aboraz|collab|commess|lavor|client|partner|accord|ingagg)/i.test(p)
  const isRecentKeyword = /(?:ultim|recent|nuov|chius|svolt)/i.test(p)
  const isSingleJob = (p.includes('ultimo lavoro') || p.includes('l\'ultimo lavoro') || p.includes('primo lavoro')) && 
                      !p.includes('ultimi') && !p.includes('collaboraz') && !p.includes('colaboraz') && 
                      !p.includes('tre') && !p.includes('due') && !p.includes('quattro') && !p.includes('cinque') && !/\b[2-9]\b/.test(p)

  const isRecentCollabQuery = !isSingleJob && (
    (isCollabKeyword && isRecentKeyword) ||
    (/(?:col+aboraz|collab)/i.test(p) && /(?:report|elenc|dossier|analis|tutt|storic|mostr|quali|chi)/i.test(p)) ||
    (p.includes('ultim') && (p.includes('tre') || p.includes('due') || p.includes('quattro') || p.includes('cinque') || /\b\d+\b/.test(p)) && isCollabKeyword)
  )

  if (isRecentCollabQuery) {
    let collabLimit = 3
    const numMatch = p.match(/\b(un|uno|una|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|\d+)\b/)
    if (numMatch) {
      const wordToNum = { 'un': 1, 'uno': 1, 'una': 1, 'due': 2, 'tre': 3, 'quattro': 4, 'cinque': 5, 'sei': 6, 'sette': 7, 'otto': 8, 'nove': 9, 'dieci': 10 }
      collabLimit = wordToNum[numMatch[1]] || parseInt(numMatch[1], 10) || 3
    }
    if (p.includes('tutt') || p.includes('tutti') || p.includes('tutte')) {
      collabLimit = companies.length
    }

    const formatItalianDate = (iso) => {
      if (!iso) return 'N/D'
      const parts = iso.split('-')
      if (parts.length < 3) return iso
      const mNames = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
      const mIdx = parseInt(parts[1], 10)
      return `${parseInt(parts[2], 10)} ${mNames[mIdx]} ${parts[0]}`
    }

    const formatEur = (n) => (Math.round(n || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    const getCompanySortDate = (c) => c.workSchedule?.recentDate || c.contract?.signedDate || c.firstContact?.date || '2026-01-01'
    const sortedCompanies = [...companies].sort((a, b) => getCompanySortDate(b).localeCompare(getCompanySortDate(a)))
    const targetCollabs = sortedCompanies.slice(0, collabLimit)

    const signedOnly = companies.filter(c => c.contract?.status === 'Firmato' || c.contract?.signedDate)
      .sort((a, b) => getCompanySortDate(b).localeCompare(getCompanySortDate(a)))
      .slice(0, collabLimit)

    const totalAmount = targetCollabs.reduce((s, c) => s + (c.compensation?.amount || 0), 0)
    const totalDeposit = targetCollabs.reduce((s, c) => s + (c.compensation?.deposit || (c.compensation?.status === 'Saldato' ? c.compensation?.amount : 0) || 0), 0)
    const totalBalance = targetCollabs.reduce((s, c) => s + (c.compensation?.balance || 0), 0)

    const cardsText = targetCollabs.map((c, idx) => {
      const inv = invoices.find(i => i.companyId === c.id || (i.companyName && i.companyName.toLowerCase() === c.name.toLowerCase()))
      const matchedAct = actions.find(a => a.company && a.company.toLowerCase() === c.name.toLowerCase())
      const isSigned = c.contract?.status === 'Firmato' || Boolean(c.contract?.signedDate)

      let statusBadge = isSigned 
        ? '✅ CONTRATTO FIRMATO & PRODUZIONE COMPLETATA' 
        : '⚡ COMMESSA RECENTE INBOUND / PREVENTIVO IN ELABORAZIONE'

      let billingDetail = ''
      if (c.compensation?.balance && c.compensation.balance > 0) {
        billingDetail = `⏳ Acconto versato: € ${formatEur(c.compensation?.deposit)} | Saldo residuo da incassare: € ${formatEur(c.compensation?.balance)} (${c.compensation?.status || 'In attesa saldo'})`
      } else if (c.compensation?.status === 'Saldato') {
        billingDetail = `✅ Saldato 100% (€ ${formatEur(c.compensation?.amount)})`
      } else {
        billingDetail = `📋 Stima/Valore: € ${formatEur(c.compensation?.amount || 5000)} (${c.compensation?.status || 'In attesa preventivo'})`
      }

      let issueText = '🟢 Lavorazione pianificata ed eseguita regolarmente senza anomalie logistiche.'
      if (c.issues?.hasIssue) {
        issueText = `⚠️ Criticità: ${c.issues.description}\n     🛠️ Risoluzione: ${c.issues.resolution} [Stato: ${c.issues.isResolved}]`
      } else if (c.feedback?.notes) {
        issueText = `⭐ Valutazione: ${c.feedback.rating || 5}/5.0 • "${c.feedback.notes}"`
      }

      let nextActionText = matchedAct 
        ? `${matchedAct.title} (Scadenza: ${matchedAct.period || 'In settimana'} • Canale: ${matchedAct.source || 'CRM'})`
        : isSigned && c.compensation?.balance > 0
          ? `Emissione nota di saldo ed incasso residuo di € ${formatEur(c.compensation?.balance)}.`
          : 'Follow-up e mantenimento relazione commerciale con il cliente.'

      const materials = (c.requestedMaterials && c.requestedMaterials.length > 0)
        ? c.requestedMaterials.slice(0, 4).join('\n     • ')
        : 'Setup Cinema 4K Sony FX3 • Lenti Sony GM • Audio Wireless Sennheiser'

      return `🏢 ${idx + 1}. ${c.name.toUpperCase()} (${c.industry})
   ${statusBadge}
   ────────────────────────────────────────────────────────
   • 👤 Referente: ${c.contactPerson?.name || 'N/D'} (${c.contactPerson?.role || 'Referente'})
   • ✉️ Email / Tel: ${c.contact?.directEmail || c.contact?.email || 'N/D'} ${c.contact?.mobile || c.contact?.phone ? `• ${c.contact?.mobile || c.contact?.phone}` : ''}
   • 📜 Contratto: ${c.contract?.code || 'In elaborazione'} [${c.contract?.status || 'In corso'}] ${c.contract?.signedDate ? `• Firmato il ${formatItalianDate(c.contract.signedDate)}` : `• Richiesta del ${formatItalianDate(c.workSchedule?.recentDate || '2026-09-28')}`}
   • 🧾 Quadro Economico: € ${formatEur(c.compensation?.amount)} + IVA (${c.compensation?.paymentMethod || 'Bonifico Bancario'})
     ${billingDetail}
     ${inv ? `• Fattura Elettronica: ${inv.number} (SDI: ${inv.sdi || 'M5UXCR1'} • PEC: ${inv.pec || 'N/D'})` : '• Fattura: In emissione al completamento degli output'}
   • 📅 Calendario & Set: ${c.workSchedule?.datesFormatted || 'Entro 1 settimana'}
     - Cadenza & Orari: ${c.workSchedule?.scheduleType || 'Standard'} ${c.workSchedule?.hours ? `(${c.workSchedule.hours})` : ''}
     - Location: ${c.workSchedule?.location || 'Studio DADO Milano / On-site'}
   • 🎥 Attrezzature Mobilitate:
     • ${materials}
   • 🛠️ Note Operative & Set:
     ${issueText}
   • 🎯 Prossima Azione: ${nextActionText}`
    }).join('\n\n')

    return `📊 DOSSIER OPERATIVO: REPORT SULLE ULTIME ${collabLimit} COLLABORAZIONI
─────────────────────────────────────────────────────────────
Analisi integrata e relazionale elaborata in tempo reale dal database di DADO Creative Studio per la richiesta: "${prompt}"

🎯 QUADRO SINOTTICO DELLE ULTIME ${collabLimit} COLLABORAZIONI (ORDINATE DALLA PIÙ RECENTE):
${targetCollabs.map((c, i) => `${i + 1}. ${c.name} [${c.workSchedule?.recentDate ? formatItalianDate(c.workSchedule.recentDate) : formatItalianDate(c.contract?.signedDate)}] ➔ € ${formatEur(c.compensation?.amount)} (${c.contract?.status || 'In corso'})`).join('\n')}

═════════════════════════════════════════════════════════════
📋 SCHEDE OPERATIVE E RELAZIONALI DI DETTAGLIO:

${cardsText}

═════════════════════════════════════════════════════════════
💡 FOCUS PRODUZIONI ESEGUITE SUL SET (CONTRATTI FIRMATI):
Qualora l'interesse sia specificamente rivolto alle ultime ${collabLimit} commesse con contratto regolarmente sottoscritto ed eseguito in produzione a Settembre 2026:
${signedOnly.map((c, i) => `  ${i + 1}. ${c.name} (€ ${formatEur(c.compensation?.amount)} - Set: ${c.workSchedule?.datesFormatted || 'Settembre 2026'}) • Contratto: ${c.contract?.code} [${c.compensation?.status === 'Saldato' ? 'Saldato 100%' : `Saldo residuo € ${formatEur(c.compensation?.balance)}`}]`).join('\n')}

═════════════════════════════════════════════════════════════
📈 SINTESI ECONOMICA & FLUSSI DELLE ULTIME ${collabLimit} COLLABORAZIONI:
• Valore complessivo generato: € ${formatEur(totalAmount)}
• Incassato / Acconti versati: € ${formatEur(totalDeposit)} (${Math.round((totalDeposit / (totalAmount || 1)) * 100)}%)
• Saldo residuo da incassare: € ${formatEur(totalBalance)} (${Math.round((totalBalance / (totalAmount || 1)) * 100)}%)
• Dotazione tecnica impiegata: Sony FX3 Cinema Line, Lenti GM f/2.8, Drone DJI Mavic 3 Cine, Parco Luci Aputure e Radio microfoni Sennheiser AVX.

💡 Puoi chiedermi approfondimenti specifici su qualsiasi cliente (es. "Dettaglio Officine Riva"), sul calendario ("Cadenze temporali di settembre") o sui pagamenti in sospeso ("Quali sono i saldi aperti?").`
  }

  // ── 0e. DOMANDE SU ULTIMO / PRIMO LAVORO NEL 2026 E CRONOLOGIA COMPLETA ──
  const isLastJobQuery = (p.includes('ultimo') || p.includes('ultim')) && (p.includes('lavor') || p.includes('commess') || p.includes('shooting') || p.includes('set') || p.includes('progett') || p.includes('produzion'))
  const isFirstJobQuery = (p.includes('primo') || p.includes('prim')) && (p.includes('lavor') || p.includes('commess') || p.includes('shooting') || p.includes('set') || p.includes('progett') || p.includes('produzion'))
  const isWorkDatesQuery = (p.includes('tutti i lavori') || p.includes('tutte le date') || p.includes('cronologia completa') || p.includes('cronologia date') || p.includes('timeline lavori')) && (p.includes('lavor') || p.includes('date') || p.includes('commess') || p.includes('shooting') || p.includes('2026'))

  if (isLastJobQuery || isFirstJobQuery || isWorkDatesQuery) {
    const sortedCompaniesByDate = [...companies].sort((a, b) => {
      const dateA = a.workSchedule?.recentDate || a.contract?.signedDate || '2026-01-01'
      const dateB = b.workSchedule?.recentDate || b.contract?.signedDate || '2026-01-01'
      return dateB.localeCompare(dateA) // dal più recente (ultimo) al primo dell'anno
    })

    const latestJob = sortedCompaniesByDate[0]
    const firstJob = sortedCompaniesByDate[sortedCompaniesByDate.length - 1]

    if (isLastJobQuery && latestJob) {
      return `🎬 **ULTIMO LAVORO REGISTRATO NELL'ANNO 2026:**
👉 **${latestJob.name.toUpperCase()}** (${latestJob.industry})
─────────────────────────────────────────────────────────────
• **Date di produzione & shooting:** ${latestJob.workSchedule?.datesFormatted || '24 e 25 Settembre 2026'}
• **Carico & orari sul set:** ${latestJob.workSchedule?.scheduleType} (${latestJob.workSchedule?.hours || 'Orario standard'})
• **Location:** ${latestJob.workSchedule?.location || 'Studio DADO'}
• **Valore commessa:** € ${(latestJob.compensation?.amount || 0).toLocaleString('it-IT')} (Acconto incassato: € ${(latestJob.compensation?.deposit || 0).toLocaleString('it-IT')} | Saldo aperto: € ${(latestJob.compensation?.balance || 0).toLocaleString('it-IT')})
• **Contratto firmato:** ${latestJob.contract?.code} del ${latestJob.contract?.signedDate || '2026'} (${latestJob.contract?.digitalFormat || 'Digitale'})
• **Referente:** ${latestJob.contactPerson?.name} (${latestJob.contactPerson?.role}) • Tel: ${latestJob.contact?.phone || latestJob.contact?.mobile || 'N/D'}
• **Attrezzature impiegate:** ${(latestJob.requestedMaterials || []).slice(0, 4).join(' • ')}
• **Note operative:** ${latestJob.issues?.hasIssue ? `Criticità gestita: ${latestJob.issues.description} (Soluzione: ${latestJob.issues.resolution})` : 'Produzione completata regolarmente.'}`
    }

    if (isFirstJobQuery && firstJob) {
      return `🎬 **PRIMO LAVORO REGISTRATO NELL'ANNO 2026:**
👉 **${firstJob.name.toUpperCase()}** (${firstJob.industry})
─────────────────────────────────────────────────────────────
• **Data di produzione & shooting:** ${firstJob.workSchedule?.datesFormatted || '12 Maggio 2026'}
• **Orari sul set:** ${firstJob.workSchedule?.scheduleType} (${firstJob.workSchedule?.hours || 'Standard'})
• **Location:** ${firstJob.workSchedule?.location || 'Studio DADO'}
• **Valore commessa:** € ${(firstJob.compensation?.amount || 0).toLocaleString('it-IT')} [Stato: ${firstJob.compensation?.status || 'Saldato'}]
• **Contratto firmato:** ${firstJob.contract?.code} del ${firstJob.contract?.signedDate || '2026'}
• **Referente:** ${firstJob.contactPerson?.name || 'N/D'} (${firstJob.contactPerson?.role || 'Referente'})
• **Attrezzature:** ${(firstJob.requestedMaterials || []).slice(0, 3).join(' • ')}`
    }

    // isWorkDatesQuery: calendario cronologico completo
    return `📅 **CRONOLOGIA COMPLETA DATE DEI SINGOLI LAVORI OTTENUTI NEL 2026 (${companies.length} COMMESSE):**
─────────────────────────────────────────────────────────────
Cronologia completa ordinata dalla data più recente al primo lavoro dell'anno:

${sortedCompaniesByDate.map((c, idx) => `${idx + 1}. [${c.workSchedule?.datesFormatted || 'Data N/D'}] ➔ **${c.name.toUpperCase()}**
   • Location: ${c.workSchedule?.location || 'Studio DADO'}
   • Orari e impegno: ${c.workSchedule?.scheduleType || 'Standard'} (${c.workSchedule?.hours || 'N/D'})
   • Valore economico: € ${(c.compensation?.amount || 0).toLocaleString('it-IT')} | Saldo: € ${(c.compensation?.balance || 0).toLocaleString('it-IT')} (${c.compensation?.status || 'N/D'})
   • Contratto: ${c.contract?.code || 'CTR-2026'} del ${c.contract?.signedDate || 'N/D'}
   • Materiali chiave: ${(c.requestedMaterials || []).slice(0, 3).join(', ')}`).join('\n\n')}

🎯 **Sintesi:**
• Ultimo lavoro: ${latestJob.name} (${latestJob.workSchedule?.datesFormatted})
• Primo lavoro: ${firstJob.name} (${firstJob.workSchedule?.datesFormatted})`
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
    { id: 'comp-11', name: 'Urban Mobility Bike', keys: ['urban mobility bike', 'urban mobility', 'urban bike', 'urban'] },
    { id: 'comp-1790554320431', name: 'Fashion Brand Milano', keys: ['fashion brand milano', 'fashion brand', 'fashionbrand'] },
    { id: 'comp-1790554320432', name: 'NextMedia Agency', keys: ['nextmedia agency', 'nextmedia'] }
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

  // Corrispondenza aggiuntiva tramite nome referente
  for (const c of companies) {
    if (c.contactPerson?.name && p.includes(c.contactPerson.name.toLowerCase())) {
      if (!matchedCompanies.some(m => m.id === c.id)) {
        matchedCompanies.push(c)
      }
    }
  }

  // ── 1-bis. CONFRONTO E RICERCA CONTRATTI NEL CORSO DELL'ANNO ─────────────────
  const isContractComparison = 
    (p.includes('contratt') && (p.includes('confront') || p.includes('corso') || p.includes('anno') || p.includes('andament') || p.includes('evoluzion') || p.includes('compar') || p.includes('tutt') || p.includes('2026') || p.includes('storico') || p.includes('elenc') || p.includes('classific') || p.includes('ricerc') || p.includes('analisi') || p.includes('differenz') || p.includes('vs'))) ||
    (p.includes('confront') && p.includes('contratt')) ||
    (p.includes('confront') && (p.includes('anno') || p.includes('annuale') || p.includes('2026'))) ||
    (p.includes('ricerca') && p.includes('contratt')) ||
    (p.includes('elenco') && p.includes('contratt')) ||
    (p.includes('tutti i contratti'))

  if (isContractComparison) {
    const signedContracts = companies
      .filter(c => c.contract && (c.contract.signedDate || (c.contract.code && c.contract.code.includes('CTR'))))
      .map(c => ({
        company: c.name,
        industry: c.industry,
        code: c.contract.code || 'CTR-2026',
        signedDate: c.contract.signedDate || '2026-09-01',
        amount: c.compensation?.amount || 0,
        deposit: c.compensation?.deposit || 0,
        balance: c.compensation?.balance || 0,
        status: c.compensation?.status || 'N/D',
        paymentMethod: c.compensation?.paymentMethod || 'Bonifico Bancario',
        workDate: c.workSchedule?.datesFormatted || 'N/D',
        location: c.workSchedule?.location || 'Studio DADO',
        scheduleType: c.workSchedule?.scheduleType || 'Standard',
        hours: c.workSchedule?.hours || '',
        materials: c.requestedMaterials || []
      }))
      .sort((a, b) => new Date(a.signedDate) - new Date(b.signedDate))

    const inboundContracts = companies
      .filter(c => !c.contract?.signedDate && c.contract?.code?.includes('INB'))
      .map(c => ({
        company: c.name,
        code: c.contract.code,
        status: c.contract.status || 'In elaborazione',
        amount: c.compensation?.amount || 5000
      }))

    const totalAmount = signedContracts.reduce((s, c) => s + c.amount, 0)
    const totalCollected = signedContracts.reduce((s, c) => s + (c.deposit || 0), 0)
    const totalPending = signedContracts.reduce((s, c) => s + (c.balance || 0), 0)
    const avgAmount = Math.round(totalAmount / (signedContracts.length || 1))

    // Raggruppamento trimestrale
    const q2 = signedContracts.filter(c => c.signedDate >= '2026-04-01' && c.signedDate <= '2026-06-30')
    const q3 = signedContracts.filter(c => c.signedDate >= '2026-07-01' && c.signedDate <= '2026-09-30')
    const totQ2 = q2.reduce((s, c) => s + c.amount, 0)
    const totQ3 = q3.reduce((s, c) => s + c.amount, 0)
    const avgQ2 = q2.length ? Math.round(totQ2 / q2.length) : 0
    const avgQ3 = q3.length ? Math.round(totQ3 / q3.length) : 0

    // Fasce di valore (Tier)
    const topTier = signedContracts.filter(c => c.amount >= 7000)
    const midTier = signedContracts.filter(c => c.amount >= 4000 && c.amount < 7000)
    const entryTier = signedContracts.filter(c => c.amount < 4000)

    // Formattatore date leggibili in italiano
    const formatSigned = (iso) => {
      if (!iso) return 'N/D'
      const parts = iso.split('-')
      if (parts.length < 3) return iso
      const mNames = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
      const mIdx = parseInt(parts[1], 10)
      return `${parseInt(parts[2], 10)} ${mNames[mIdx]} ${parts[0]}`
    }

    return `📑 CONFRONTO ED EVOLUZIONE DEI CONTRATTI NEL CORSO DELL'ANNO 2026
─────────────────────────────────────────────────────────────
Analisi strategico-commerciale di tutti i ${signedContracts.length} contratti firmati da DADO Creative Studio nel corso del 2026, ordinati cronologicamente per data di sottoscrizione:

🎯 1. SINTESI METRICHE E TREND ANNUALE:
• Volume complessivo contrattualizzato: € ${totalAmount.toLocaleString('it-IT')} su ${signedContracts.length} commesse deliberate.
• Ticket medio per contratto: € ${avgAmount.toLocaleString('it-IT')} (in fortissima crescita nel corso dell'anno).
• Tasso di incasso: € ${totalCollected.toLocaleString('it-IT')} già incassati (${Math.round((totalCollected / totalAmount) * 100)}%), con € ${totalPending.toLocaleString('it-IT')} di saldo residuo da incassare (${Math.round((totalPending / totalAmount) * 100)}%).
• Evoluzione temporale del valore: Dal primo contratto primaverile di € 1.500 (Urban Mobility) al record autunnale di € 9.200 (Officine Riva), con un incremento del +513% sul valore del singolo accordo.

═════════════════════════════════════════════════════════════
📅 2. CRONOLOGIA COMPARATIVA DEI CONTRATTI NEL CORSO DELL'ANNO:
${signedContracts.map((c, idx) => `${idx + 1}. [${formatSigned(c.signedDate)}] ➔ ${c.company.toUpperCase()} (${c.industry})
   • Contratto: ${c.code}
   • Valore commessa: € ${c.amount.toLocaleString('it-IT')} [${c.status === 'Saldato' ? '✅ Saldato 100%' : `⏳ Acconto € ${c.deposit.toLocaleString('it-IT')} • Saldo aperto € ${c.balance.toLocaleString('it-IT')}`}]
   • Condizioni pagamento: ${c.paymentMethod}
   • Set & Produzione: ${c.workDate} (${c.scheduleType}${c.hours ? ` - ${c.hours}` : ''})
   • Location: ${c.location}
   • Materiali & Output: ${(c.materials || []).slice(0, 3).join(' • ')}`).join('\n\n')}

═════════════════════════════════════════════════════════════
📊 3. CONFRONTO TRIMESTRALE (Q2 vs Q3 2026):
• TRIMESTRE Q2 (Aprile - Giugno 2026) - Fase di Avvio Stagionale:
  - Contratti firmati: ${q2.length} (${q2.map(c => c.company).join(', ')})
  - Volume economico: € ${totQ2.toLocaleString('it-IT')} | Ticket medio: € ${avgQ2.toLocaleString('it-IT')}
  - Caratteristiche: Spot agili, still life e produzioni leggere monoposto.

• TRIMESTRE Q3 (Luglio - Settembre 2026) - Fase di Espansione & Consolidamento:
  - Contratti firmati: ${q3.length} (${q3.map(c => c.company).join(', ')})
  - Volume economico: € ${totQ3.toLocaleString('it-IT')} | Ticket medio: € ${avgQ3.toLocaleString('it-IT')}
  - Delta performance: +${Math.round(((avgQ3 - avgQ2) / (avgQ2 || 1)) * 100)}% di crescita del ticket medio e quadruplicazione dei volumi mensili.
  - Caratteristiche: Produzioni industriali multi-day, spot TV broadcast (Solaris), contratti moda con limbo (Alpha Studio) e film per eventi di lusso (Vogue Events).

═════════════════════════════════════════════════════════════
🏆 4. CONFRONTO PER FASCE DI VALORE (TIER COMMERCIALE):
• 🥇 TOP TIER (> € 7.000) - ${topTier.length} Contratti (${Math.round((topTier.reduce((s,c)=>s+c.amount,0)/totalAmount)*100)}% del fatturato):
${topTier.map(c => `  - ${c.company}: € ${c.amount.toLocaleString('it-IT')} (${c.code}) - ${c.industry}`).join('\n')}

• 🥈 MID TIER (€ 4.000 - € 6.500) - ${midTier.length} Contratti (${Math.round((midTier.reduce((s,c)=>s+c.amount,0)/totalAmount)*100)}% del fatturato):
${midTier.map(c => `  - ${c.company}: € ${c.amount.toLocaleString('it-IT')} (${c.code}) - ${c.industry}`).join('\n')}

• 🥉 ENTRY TIER (< € 4.000) - ${entryTier.length} Contratti (${Math.round((entryTier.reduce((s,c)=>s+c.amount,0)/totalAmount)*100)}% del fatturato):
${entryTier.map(c => `  - ${c.company}: € ${c.amount.toLocaleString('it-IT')} (${c.code}) - ${c.industry}`).join('\n')}

═════════════════════════════════════════════════════════════
💳 5. GESTIONE DEI FLUSSI DI CASSA E INSOLUTI A CONFRONTO:
• Posizioni saldate al 100% (${signedContracts.filter(c => c.balance === 0).length} contratti):
  ➔ ${signedContracts.filter(c => c.balance === 0).map(c => c.company).join(', ')}.
• Posizioni con acconto versato e SALDO RESIDUO in attesa (€ ${totalPending.toLocaleString('it-IT')} da riscuotere):
${signedContracts.filter(c => c.balance > 0).map(c => `  - ${c.company}: Saldo aperto di € ${c.balance.toLocaleString('it-IT')} su € ${c.amount.toLocaleString('it-IT')} totali (${c.paymentMethod})`).join('\n')}

═════════════════════════════════════════════════════════════
⚡ 6. CONTRATTI INBOUND IN NEGOZIAZIONE (POTENZIALE +€ 10.000):
${inboundContracts.map(c => `• ${c.company} (${c.code}): Stima € ${c.amount.toLocaleString('it-IT')} [Stato: ${c.status}]`).join('\n')}

💡 Suggerimento operativo: Puoi anche confrontare direttamente due commesse digitando "Confronta Officine Riva e Solaris" oppure verificare il calendario con "Cadenze temporali settembre".`
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
  const isAllCollabDirectoryQuery = p.includes('collabora') || p.includes('colabora') || p.includes('partner') || p.includes('elenco') || p.includes('tutte le aziende') || p.includes('tutti i clienti') || p.includes('chi sono i clienti') || p.includes('quali aziende') || p.includes('mostra aziende') || p.includes('lista clienti') || p.includes('lista aziende') || (p.includes('aziend') && (p.includes('nostr') || p.includes('intern') || p.includes('portafoglio') || p.includes('lavoriamo') || p.includes('collabor') || p.includes('colabor') || p.includes('tutt')))
  if (isAllCollabDirectoryQuery && matchedCompanies.length === 0) {
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

  // ── 5. RISPOSTA MIRATA O DOSSIER SPECIFICO PER L'AZIENDA CITATA ──
  if (matchedCompanies.length === 1) {
    const matchedCompany = matchedCompanies[0]
    const companyOpps = opps.filter(o => o.company?.toLowerCase() === matchedCompany.name.toLowerCase())
    const balance = matchedCompany.compensation?.balance || 0
    const deposit = matchedCompany.compensation?.deposit || 0
    const totalComp = matchedCompany.compensation?.amount || 0
    const compInvoice = invoices.find(inv => inv.companyId === matchedCompany.id || inv.companyName?.toLowerCase() === matchedCompany.name?.toLowerCase())
    const ws = matchedCompany.workSchedule || {}
    const mat = (matchedCompany.requestedMaterials || []).join(' • ')

    // 5a. Domanda specifica su Referente / Contatti / Chi è
    if (p.includes('referent') || p.includes('contatt') || p.includes('chi è') || p.includes('chi parla') || p.includes('telefono') || p.includes('cellulare') || p.includes('email') || p.includes('mail') || p.includes('responsabil')) {
      return `👤 **REFERENTE & CONTATTI — ${matchedCompany.name.toUpperCase()}**
─────────────────────────────────────────────────────────────
• **Referente principale:** ${matchedCompany.contactPerson?.name || 'N/D'}
• **Ruolo:** ${matchedCompany.contactPerson?.role || 'Referente aziendale'}
• **Email:** ${matchedCompany.contact?.directEmail || matchedCompany.contact?.email || 'N/D'}
• **Telefono / Mobile:** ${matchedCompany.contact?.mobile || matchedCompany.contact?.phone || 'N/D'}
• **Canale di primo contatto:** ${matchedCompany.firstContact?.channel || 'Diretto'} (${matchedCompany.firstContact?.date || 'N/D'})
• **Stato commessa:** ${matchedCompany.compensation?.status || 'In corso'} (€ ${totalComp.toLocaleString('it-IT')})`
    }

    // 5b. Domanda specifica su Pagamenti / Compenso / Saldo / Quanto costa / Fattura
    if (p.includes('pagament') || p.includes('saldo') || p.includes('accont') || p.includes('quant') || p.includes('cost') || p.includes('prezz') || p.includes('compens') || p.includes('invoic') || p.includes('fattur')) {
      return `💰 **QUADRO ECONOMICO & FATTURAZIONE — ${matchedCompany.name.toUpperCase()}**
─────────────────────────────────────────────────────────────
• **Valore complessivo commessa:** € ${totalComp.toLocaleString('it-IT')} [Stato: ${matchedCompany.compensation?.status || (balance === 0 ? 'Saldato 100%' : 'In attesa saldo')}]
• **Acconto versato:** € ${deposit.toLocaleString('it-IT')}
• **Saldo residuo da incassare:** € ${balance.toLocaleString('it-IT')}
• **Modalità di pagamento:** ${matchedCompany.compensation?.paymentMethod || 'Bonifico Bancario 30gg d.f.'}
• **Dettaglio fattura:** ${compInvoice ? `${compInvoice.number} del ${compInvoice.date} (Imponibile € ${compInvoice.amount.toLocaleString('it-IT')} + IVA € ${compInvoice.vat.toLocaleString('it-IT')} = € ${compInvoice.total.toLocaleString('it-IT')})` : `In elaborazione su codice ${matchedCompany.contract?.code || 'CTR'}`}
• **Contratto:** ${matchedCompany.contract?.code || 'N/D'} (Sottoscritto il ${matchedCompany.contract?.signedDate || 'N/D'})`
    }

    // 5c. Domanda specifica su Calendario / Date / Shooting / Location
    if (p.includes('quand') || p.includes('date') || p.includes('data') || p.includes('calendari') || p.includes('shoot') || p.includes('set') || p.includes('orari') || p.includes('location') || p.includes('dove')) {
      return `📅 **CALENDARIO & PROGRAMMAZIONE SET — ${matchedCompany.name.toUpperCase()}**
─────────────────────────────────────────────────────────────
• **Date di produzione:** ${ws.datesFormatted || 'Da definire'}
• **Impegno & orari sul set:** ${ws.scheduleType || 'Standard'} (${ws.hours || 'Orario standard'})
• **Location:** ${ws.location || 'Studio DADO'}
• **Materiali & attrezzature:** ${mat || 'Kit standard'}
• **Deliverables:** ${matchedCompany.deliverables || (matchedCompany.requestedMaterials || []).slice(0, 3).join(', ')}`
    }

    // 5d. Domanda specifica su Attrezzature / Materiali
    if (p.includes('attrezzatur') || p.includes('material') || p.includes('drone') || p.includes('camera') || p.includes('luci') || p.includes('lenti') || p.includes('service')) {
      return `🎥 **ATTREZZATURE MOBILITATE — ${matchedCompany.name.toUpperCase()}**
─────────────────────────────────────────────────────────────
• **Materiali e tecnologie impiegate:**
${(matchedCompany.requestedMaterials || []).map(m => `  - ${m}`).join('\n') || '  - Kit standard'}
• **Location di set:** ${ws.location || 'Studio DADO'} (${ws.scheduleType || 'Standard'})`
    }

    // 5e. Domanda specifica su Criticità / Problemi / Feedback
    if (p.includes('criticit') || p.includes('problem') || p.includes('anomali') || p.includes('feedback') || p.includes('rating') || p.includes('recension')) {
      return `🛠️ **CRITICITÀ & FEEDBACK — ${matchedCompany.name.toUpperCase()}**
─────────────────────────────────────────────────────────────
• **Valutazione cliente:** ⭐ ${matchedCompany.feedback?.rating || '5'}/5 ("${matchedCompany.feedback?.comment || 'Set impeccabile, piena soddisfazione del brand'}")
• **Problema riscontrato:** ${matchedCompany.issues?.hasIssue ? matchedCompany.issues.description : 'Nessuna anomalia o criticità sul set.'}
• **Soluzione applicata da DADO:** ${matchedCompany.issues?.hasIssue ? matchedCompany.issues.resolution : 'Gestione operativa regolare e consegna nei tempi.'}`
    }

    // 5f. Dossier Completo Generale
    return `🏢 DOSSIER STRATEGICO INTERCONNESSO: ${matchedCompany.name.toUpperCase()}
─────────────────────────────────────────────────────────────
👤 REFERENTE & CONTATTI DIRETTI:
• Referente: ${matchedCompany.contactPerson?.name || 'N/D'} (${matchedCompany.contactPerson?.role || 'Referente'})
• Email: ${matchedCompany.contact?.directEmail || matchedCompany.contact?.email || 'N/D'}
• Telefono / Mobile: ${matchedCompany.contact?.mobile || matchedCompany.contact?.phone || 'N/D'}
• Canale di primo contatto: ${matchedCompany.firstContact?.channel || 'Diretto'} (${matchedCompany.firstContact?.date || 'N/D'})
• Note storico: "${matchedCompany.firstContact?.notes || 'Nessuna nota storica'}"

📜 CONTRATTO & ACCORDO COMMERCIALE:
• Codice Contratto: ${matchedCompany.contract?.code || 'N/D'} (Sottoscritto il ${matchedCompany.contract?.signedDate || 'N/D'})
• File / Formato: ${matchedCompany.contract?.fileName || 'PDF con firma digitale'} (${matchedCompany.contract?.digitalFormat || 'Digitale'})
• Clausole e Termini: ${matchedCompany.contract?.terms || 'Standard DADO Studio'}

🧾 FATTURA / INVOICE (MODULO FATTURAZIONE ELETTRONICA):
• Fattura N°: ${compInvoice?.number || `FAT-2026-${matchedCompany.contract?.code?.split('-').pop() || '001'}`} del ${compInvoice?.date || matchedCompany.contract?.signedDate || 'Recente'}
• Imponibile: € ${totalComp.toLocaleString('it-IT')} | IVA (22%): € ${Math.round(totalComp * 0.22).toLocaleString('it-IT')} | Totale Fattura: € ${(totalComp + Math.round(totalComp * 0.22)).toLocaleString('it-IT')}
• Acconto versato: € ${deposit.toLocaleString('it-IT')}
• SALDO APERTO: € ${balance.toLocaleString('it-IT')} [Stato: ${matchedCompany.compensation?.status || (balance === 0 ? 'Saldato 100%' : 'In attesa saldo')}]
• Scadenza Pagamento: ${compInvoice?.dueDate || '30 giorni data fattura'} • Metodo: ${matchedCompany.compensation?.paymentMethod || 'Bonifico bancario'}
• Dati Fiscali: SDI: ${compInvoice?.sdi || '0000000'} | PEC: ${compInvoice?.pec || matchedCompany.contact?.email || 'N/D'}

⏱️ PROGRAMMAZIONE & GIORNI DI LAVORO SUL SET:
• Durata e tipologia: ${matchedCompany.workSchedule?.scheduleType || 'Standard'}
• Date calendarizzate: ${matchedCompany.workSchedule?.datesFormatted || 'Da definire'}
• Orari di produzione: ${matchedCompany.workSchedule?.hours || 'Giornata standard'}
• Location: ${matchedCompany.workSchedule?.location || 'Studio/Esterna'}
• Attrezzature impiegate: ${(matchedCompany.requestedMaterials || []).join(' • ')}

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

  // ── 6-bis. CONTRATTI PER SHOOTING & FATTURATO COMMESSE ──────────
  const isShootingContractsRevenueQuery = 
    (p.includes('contratt') || p.includes('commess')) &&
    (p.includes('shoot') || p.includes('set') || p.includes('produzion') || p.includes('riprese')) &&
    (p.includes('fattur') || p.includes('incass') || p.includes('econom') || p.includes('import') || p.includes('valore') || p.includes('guadagn') || p.includes('totale'))

  if (isShootingContractsRevenueQuery) {
    const shootingCompanies = companies.filter(c => c.contract && c.compensation)
    const totalShootingRev = shootingCompanies.reduce((acc, c) => acc + (c.compensation?.amount || 0), 0)
    const totalShootingVat = Math.round(totalShootingRev * 0.22)
    const totalShootingGross = totalShootingRev + totalShootingVat
    const totalShootingCollected = shootingCompanies.reduce((acc, c) => acc + (c.compensation?.deposit || (c.compensation?.status === 'Saldato' ? c.compensation.amount : 0)), 0)
    const totalShootingPending = totalShootingRev - totalShootingCollected

    return `🎬 **REPORT CONTRATTI PER SHOOTING & FATTURATO — DADO CREATIVE STUDIO**
─────────────────────────────────────────────────────────────
🎯 **1. SINTESI ECONOMICA & FATTURATO PRODUZIONI:**
• **Volume Contrattualizzato:** € ${totalShootingRev.toLocaleString('it-IT')} su ${shootingCompanies.length} contratti di produzione/shooting
• **Totale IVA 22%:** € ${totalShootingVat.toLocaleString('it-IT')} | **Lordo Complessivo:** € ${totalShootingGross.toLocaleString('it-IT')}
• **Incassato Effettivo:** € ${totalShootingCollected.toLocaleString('it-IT')} (${Math.round((totalShootingCollected / (totalShootingRev || 1)) * 100)}%)
• **Crediti Residui (Saldi da incassare a consegna master):** € ${totalShootingPending.toLocaleString('it-IT')} (${Math.round((totalShootingPending / (totalShootingRev || 1)) * 100)}%)

═════════════════════════════════════════════════════════════
📋 **2. DETTAGLIO CONTRATTI, SHOOTING & FATTURATO PER CLIENTE:**

${shootingCompanies.map((c, idx) => {
  const comp = c.compensation || {}
  const contract = c.contract || {}
  const ws = c.workSchedule || {}
  const inv = invoices.find(i => (i.companyName || '').toLowerCase().includes(c.name.toLowerCase()) || (i.number && contract.code && i.number.includes(contract.code.slice(-3))))
  const deposit = comp.deposit || (inv ? inv.deposit : (comp.status === 'Saldato' ? comp.amount : 0))
  const balance = comp.balance !== undefined ? comp.balance : (comp.status === 'Saldato' ? 0 : comp.amount - deposit)
  const materials = Array.isArray(c.requestedMaterials) ? c.requestedMaterials.slice(0, 3).join(', ') : 'Produzione video 4K'

  return `${idx + 1}. **${c.name.toUpperCase()}** (${c.industry})
   • 📄 **Contratto:** ${contract.code || 'In elaborazione'} • Valore: **€ ${(comp.amount || 0).toLocaleString('it-IT')}** + IVA
   • 🎬 **Shooting & Set:** ${ws.datesFormatted || ws.startDate || 'Da calendario'} (${ws.pattern || ws.scheduleType || 'Sessione programmata'})
   • 💰 **Fatturato & Incassi:** Acconto € ${deposit.toLocaleString('it-IT')} | Saldo € ${balance.toLocaleString('it-IT')} (${comp.status || contract.paymentStatus || 'In regola'})
   • 🎥 **Dotazione & Deliverables:** ${materials}`
}).join('\n\n')}

═════════════════════════════════════════════════════════════
💡 **3. SUDDIVISIONE PER CLUSTER DI PRODUZIONE & REDDITIVITÀ:**
• 🏭 **Corporate Industriale & Spot TV:** Officine Riva (€ 9.200), Solaris Energy (€ 8.400), Nexura Tech (€ 3.200) ➔ **€ 20.800** (36,5% del fatturato)
• 👗 **Fashion, Luxury & Set Studio (Limbo):** Alpha Studio (€ 7.500), Vogue Events (€ 5.800), Atelier Sposa (€ 2.300) ➔ **€ 15.600** (27,4% del fatturato)
• 🍷 **Food, Hospitality & Riprese con Drone:** Kroma Ceramiche (€ 6.100), Tenuta Poggio Antico (€ 4.200), Gusto & Tradizione (€ 3.900), Urban Mobility (€ 1.500), Beta Digital (€ 4.800) ➔ **€ 20.500** (36,1% del fatturato)`
  }

  // ── 7. INVOICE, FATTURAZIONE ELETTRONICA & GESTIONE CREDITI/INSOLUTI ──
  const isPendingOnlyQuery = p.includes('insolut') || p.includes('chi deve pagare') || p.includes('saldi aperti') || p.includes('saldo aperto') || p.includes('crediti in sospeso')
  const isInvoiceQuery = isPendingOnlyQuery || p.includes('invoic') || p.includes('fattur') || p.includes('pagament') || p.includes('saldo') || p.includes('incass') || p.includes('crediti') || p.includes('iva') || p.includes('imponibil') || p.includes('accont')
  if (isInvoiceQuery) {
    const totalInvoicedNet = invoices.length > 0 ? invoices.reduce((s, i) => s + (i.amount || 0), 0) : companies.reduce((s, c) => s + (c.compensation?.amount || 0), 0)
    const totalVat = invoices.length > 0 ? invoices.reduce((s, i) => s + (i.vat || 0), 0) : Math.round(totalInvoicedNet * 0.22)
    const totalGross = totalInvoicedNet + totalVat
    const totalCollected = invoices.length > 0 ? invoices.reduce((s, i) => s + (i.deposit || 0), 0) : companies.reduce((s, c) => s + (c.compensation?.deposit || 0), 0)
    const totalPending = invoices.length > 0 ? invoices.reduce((s, i) => s + (i.balance || 0), 0) : companies.reduce((s, c) => s + (c.compensation?.balance || 0), 0)
    const pendingInvoices = invoices.filter(i => (i.balance || 0) > 0)

    if (isPendingOnlyQuery) {
      return `🚨 **POSIZIONI CON SALDO APERTO DA INCASSARE — DADO STUDIO**
─────────────────────────────────────────────────────────────
• **Totale crediti residui in sospeso:** € ${totalPending.toLocaleString('it-IT')} (su € ${totalInvoicedNet.toLocaleString('it-IT')} fatturati, € ${totalCollected.toLocaleString('it-IT')} già incassati)

📋 **DETTAGLIO CLIENTI CON SALDO APERTO (${pendingInvoices.length} commesse):**

${pendingInvoices.map((i, idx) => `${idx + 1}. **${i.companyName.toUpperCase()}** [${i.number}]
   • **Saldo dovuto:** € ${i.balance.toLocaleString('it-IT')} (su € ${i.amount.toLocaleString('it-IT')} imponibili)
   • **Termini pagamento:** ${i.paymentMethod} • Scadenza: ${i.dueDate}
   • **Azione raccomandata:** Inviare fattura elettronica di saldo congiuntamente al rilascio del master 4K definitivo.`).join('\n\n')}`
    }

    return `🧾 MODULO INVOICE & FATTURAZIONE ELETTRONICA DADO STUDIO (BLU NOTTE & ORO)
─────────────────────────────────────────────────────────────
🎯 1. QUADRO GENERALE FATTURATO & FLUSSI DI CASSA:
• Volume Imponibile Fatturato: € ${totalInvoicedNet.toLocaleString('it-IT')} su ${invoices.length || companies.length} commesse deliberate
• Totale IVA (22%): € ${totalVat.toLocaleString('it-IT')} | Volume Lordo Complessivo: € ${totalGross.toLocaleString('it-IT')}
• Incassato Effettivo: € ${totalCollected.toLocaleString('it-IT')} (${Math.round((totalCollected / totalInvoicedNet) * 100)}% del totale)
• Crediti Residui in Sospeso (Saldi): € ${totalPending.toLocaleString('it-IT')} (${Math.round((totalPending / totalInvoicedNet) * 100)}% del totale)

═════════════════════════════════════════════════════════════
📋 2. REGISTRO FATTURE INTERCONNESSO (COMMESSE, CONTRATTI & SET):
${(invoices.length > 0 ? invoices : companies.map((c, idx) => ({
  number: `FAT-2026-${String(88 - idx).padStart(3, '0')}`,
  companyName: c.name,
  contractCode: c.contract?.code || `DADO-CTR-2026-${88 - idx}`,
  amount: c.compensation?.amount || 0,
  vat: Math.round((c.compensation?.amount || 0) * 0.22),
  totalWithVat: (c.compensation?.amount || 0) + Math.round((c.compensation?.amount || 0) * 0.22),
  deposit: c.compensation?.deposit || 0,
  balance: c.compensation?.balance || 0,
  status: c.compensation?.status || (c.compensation?.balance === 0 ? 'Saldato' : 'In attesa saldo'),
  dueDate: c.workSchedule?.recentDate || '30gg d.f.',
  paymentMethod: c.compensation?.paymentMethod || 'Bonifico Bancario',
  shootingDates: c.workSchedule?.datesFormatted || 'N/D',
  materials: (c.requestedMaterials || []).slice(0, 3).join(', ')
}))).map((inv, idx) => `${idx + 1}. [${inv.number}] ➔ ${inv.companyName.toUpperCase()}
   • Imponibile: € ${inv.amount.toLocaleString('it-IT')} | IVA 22%: € ${inv.vat.toLocaleString('it-IT')} | Totale: € ${inv.totalWithVat.toLocaleString('it-IT')}
   • Stato Incasso: ${inv.balance === 0 ? '✅ Saldato 100%' : `⏳ Acconto € ${inv.deposit.toLocaleString('it-IT')} • Saldo aperto € ${inv.balance.toLocaleString('it-IT')}`}
   • Contratto: ${inv.contractCode || 'N/D'} | Condizioni: ${inv.paymentMethod} (Scad. ${inv.dueDate})
   • Produzione & Set: ${inv.shootingDates || 'N/D'}
   • Attrezzature impiegate: ${Array.isArray(inv.materials) ? inv.materials.join(', ') : inv.materials || 'Kit standard'}`).join('\n\n')}

═════════════════════════════════════════════════════════════
🚨 3. POSIZIONI CON SALDO APERTO DA INCASSARE (€ ${totalPending.toLocaleString('it-IT')}):
${pendingInvoices.length > 0 ? pendingInvoices.map(i => `• ${i.companyName} (${i.number}):
  - Saldo dovuto: € ${i.balance.toLocaleString('it-IT')} su € ${i.amount.toLocaleString('it-IT')} imponibili
  - Condizioni pattuite: ${i.paymentMethod} • Scadenza: ${i.dueDate}
  - Azione consigliata: Inviare fattura elettronica di saldo congiuntamente al rilascio del master 4K ProRes definitivo.`).join('\n\n') : 'Nessuna pendenza aperta: tutte le posizioni sono regolarmente saldate.'}

💡 Il modulo Invoice è accessibile anche visivamente dalla dashboard (box Blu Notte e Oro).`
  }

  // ── 7-bis. INTERCONNESSIONE TOTALE DEL CRM: COLLEGA TUTTI I DATI TRA LORO ──
  const isConnectAllQuery = p.includes('collega') || p.includes('interconnet') || p.includes('relazion') || p.includes('tutto sul crm') || p.includes('panoramica') || p.includes('quadro') || p.includes('insieme') || p.includes('mappa') || p.includes('incroc') || p.includes('connetti') || p.includes('presentami')
  if (isConnectAllQuery) {
    const totalAmount = companies.reduce((s, c) => s + (c.compensation?.amount || 0), 0)
    const totalCollected = companies.reduce((s, c) => s + (c.compensation?.deposit || 0), 0)
    const totalPending = companies.reduce((s, c) => s + (c.compensation?.balance || 0), 0)

    return `🌐 MATRICE RELAZIONALE COMPLETA: TUTTI I DATI DEL CRM DADO COLLEGATI TRA LORO
─────────────────────────────────────────────────────────────
Analisi olistica integrata che correla per ciascuna delle ${companies.length} aziende partner:
[Azienda] ➔ [Contratto] ➔ [Invoice/Fattura] ➔ [Set & Orari] ➔ [Attrezzature Mobilitate] ➔ [Criticità Gestite] ➔ [Next Action]

${companies.map((c, i) => {
  const inv = invoices.find(inv => inv.companyId === c.id || inv.companyName?.toLowerCase() === c.name.toLowerCase())
  const opp = opps.find(o => o.company?.toLowerCase() === c.name.toLowerCase())
  const act = actions.find(a => a.company?.toLowerCase() === c.name.toLowerCase())
  const compVal = c.compensation?.amount || 0
  const compBal = c.compensation?.balance || 0

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 ${i + 1}. ${c.name.toUpperCase()} (${c.industry})
• Referente: ${c.contactPerson?.name || 'N/D'} (${c.contactPerson?.role || 'Referente'}) • ${c.contact?.directEmail || c.contact?.email} • ${c.contact?.mobile || c.contact?.phone || 'N/D'}
• 📜 Contratto: ${c.contract?.code || 'N/D'} (Sottoscritto: ${c.contract?.signedDate || 'N/D'})
• 🧾 Invoice: ${inv ? inv.number : `FAT-2026-${String(88 - i).padStart(3, '0')}`} | Imponibile: € ${compVal.toLocaleString('it-IT')} | Saldo: € ${compBal.toLocaleString('it-IT')} [${compBal === 0 ? 'Saldato 100%' : 'In attesa saldo'}]
• ⏱️ Set & Calendario: ${c.workSchedule?.datesFormatted || 'N/D'} (${c.workSchedule?.scheduleType} - ${c.workSchedule?.hours}) @ ${c.workSchedule?.location || 'Studio'}
• 🎥 Attrezzature usate: ${(c.requestedMaterials || []).join(' • ')}
• 🛠️ Criticità gestita: ${c.issues?.hasIssue ? `${c.issues.description} (Risoluzione: ${c.issues.resolution})` : 'Set impeccabile, nessuna anomalia.'}
• ⚡ Opportunità/Next Action: ${opp ? `Trattativa "${opp.title}" da € ${opp.value.toLocaleString('it-IT')} [${opp.stage}]` : act ? `Attività: "${act.title}" (${act.time})` : 'Archivio commessa completata'}`
}).join('\n\n')}

═════════════════════════════════════════════════════════════
🎯 SINTESI GENERALE DELLO STUDIO:
• Volume Complessivo Contrattualizzato: € ${totalAmount.toLocaleString('it-IT')}
• Incassato Effettivo: € ${totalCollected.toLocaleString('it-IT')} | Crediti da Saldare: € ${totalPending.toLocaleString('it-IT')}
• Attrezzature Top Mobilitate: Sony FX3 (8 set), Drone Mavic 3 Cine (4 set), Aputure 600d/300x (6 set), Lenti GM (11 set).
• Stato Commerciale: Tutte le commesse sono perfettamente tracciate e sincronizzate tra fatturazione, calendario e inventario.`
  }

  // ── 8. GIORNI DI LAVORO SUL SET & CARICO OPERATIVO ──────────────
  if (p.includes('giorn') || p.includes('durata') || p.includes('ore') || p.includes('schedule') || p.includes('orari')) {
    const workDaysBreakdown = companies.map(c => ({
      name: c.name,
      schedule: c.workSchedule?.scheduleType || '1 giorno',
      dates: c.workSchedule?.datesFormatted || 'Recentemente',
      hours: c.workSchedule?.hours || 'Standard',
      revenue: c.compensation?.amount || 0,
      gear: (c.requestedMaterials || []).slice(0, 2).join(', ')
    }))

    return `⏱️ AUDIT PROGRAMMAZIONE: NUMERO GIORNI DI LAVORO & CARICO OPERATIVO
─────────────────────────────────────────────────────────────
📅 DISTRIBUZIONE DEI GIORNI DI SET PER CLIENTE NEL CRM:

${workDaysBreakdown.map(w => `• ${w.name}:
  - Impegno: ${w.schedule} (${w.hours})
  - Date: ${w.dates} | Valore commessa: € ${w.revenue.toLocaleString('it-IT')}
  - Attrezzatura mobilitata: ${w.gear}`).join('\n\n')}

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

  // ── 9. RICHIESTA ESPLICITA DI REPORT O PANORAMICA GENERALE DEL CRM ──
  const isGeneralReport = p.includes('riepilogo') || p.includes('panoramica') || p.includes('quadro generale') || p.includes('stato complessivo') || p.includes('report generale') || p.includes('stato crm')
  const totalRev = companies.reduce((acc, c) => acc + (c.compensation?.amount || 0), 0)
  const fullyPaidCount = companies.filter(c => c.compensation?.status === 'Saldato').length
  const pendingCount = companies.length - fullyPaidCount
  const totalPendingBal = companies.reduce((acc, c) => acc + (c.compensation?.balance || 0), 0)

  if (isGeneralReport) {
    return `📊 **REPORT OPERATIVO INTEGRATO DADO CREATIVE STUDIO CRM**
─────────────────────────────────────────────────────────────
• **Volume complessivo contrattualizzato:** € ${totalRev.toLocaleString('it-IT')} su ${companies.length} clienti attivi.
• **Flussi di cassa studio:** € ${(totalRev - totalPendingBal).toLocaleString('it-IT')} incassati (${Math.round(((totalRev - totalPendingBal) / (totalRev || 1)) * 100)}%) | € ${totalPendingBal.toLocaleString('it-IT')} da incassare.
• **Clienti saldati al 100%:** ${fullyPaidCount} posizioni.
• **Clienti con saldo aperto (${pendingCount} aziende):**
  - Officine Meccaniche Riva: € 5.200
  - Kroma Ceramiche: € 2.900
  - Beta Digital Agency: € 2.800
• **Pipeline trattative aperte:** € ${opps.reduce((s, o) => s + (o.value || 0), 0).toLocaleString('it-IT')} su ${opps.length} opportunità attive.
• **Inventario tecnico:** 43 voci operative censite.

💡 Puoi chiedermi approfondimenti su qualunque cliente, data di shooting, fattura o attrezzatura specifica.`
  }

  // ── 10. RISPOSTA NATURALE SENZA EVASIONE: DATI NON PRESENTI O DOMANDE NON CRM ──
  let cleanSubject = prompt.trim()
  cleanSubject = cleanSubject
    .replace(/^(chi\s+[eè]|cosa\s+(?:sai\s+(?:su\w*|di|del\w*)|sappiamo\s+(?:su\w*|di|del\w*)|ne\s+pensi(?:\s+(?:su\w*|di|del\w*))?)|parlami\s+(?:di|del\w*|su\w*)|dimmi\s+(?:di|del\w*|su\w*)|trova|cerca|mostrami|informazioni\s+(?:su\w*|di|del\w*)|dati\s+(?:su\w*|di|del\w*))\s+/i, '')
    .trim()
    .replace(/[?!.]+$/, '')
    .trim()
  if (!cleanSubject) cleanSubject = prompt.trim()

  const isCrmSearchQuery = 
    /(?:cliente|clienti|azienda|aziende|societ[aà]|ditta|ditte|fornitore|fornitori|referente|referenti|fattura|fatture|invoice|contratt[oi]|preventiv[oi]|commess[ae])/i.test(p)

  if (isCrmSearchQuery) {
    return `Nel database del CRM di **DADO Creative Studio** non risulta attualmente archiviata alcuna commessa o anagrafica associata a **"${cleanSubject}"**.

Attualmente nello studio sono registrati **${companies.length} clienti attivi** (tra cui ${companies.slice(0, 4).map(c => c.name).join(', ')}...).
Se si tratta di una nuova opportunità o di un prospect recente, puoi censirlo direttamente dalla sezione **Companies** o **Opportunities**!`
  }

  // Risposta naturale e collaborativa per richieste generali o curiosità
  return `Sono l'assistente operativo e strategico di **DADO Creative Studio**.
In merito a **"${cleanSubject}"**, non ho informazioni dirette archiviate nel database interno dello studio.

Posso supportarti con precisione su:
• 🏢 **Clienti, contratti e preventivi** dello studio
• 🧾 **Fatturazione, acconti e saldi aperti**
• 📅 **Calendario, date e orari di shooting sul set**
• 🎥 **Inventario tecnico** (telecamere Sony FX3, lenti GM, drone DJI Mavic 3 Cine, parco luci Aputure)
• 🌤️ **Meteo in tempo reale** e condizioni per le riprese

Fammi sapere se desideri approfondire uno di questi ambiti!`
}

// ─────────────────────────────────────────────────────────────
// ENDPOINT NOTE PER SVILUPPATORE (n.drea.t@gmail.com)
// ─────────────────────────────────────────────────────────────
app.get('/api/developer-notes', (req, res) => {
  try {
    const notesFile = path.join(__dirname, 'data', 'developerNotes.json')
    if (fs.existsSync(notesFile)) {
      const data = fs.readFileSync(notesFile, 'utf8')
      const notes = JSON.parse(data)
      return res.json(notes)
    }
    res.json([])
  } catch (err) {
    console.error('Errore lettura note sviluppatore:', err)
    res.status(500).json({ error: 'Errore interno lettura note' })
  }
})

app.post('/api/developer-notes', async (req, res) => {
  try {
    const userRole = (req.headers['x-user-role'] || '').toLowerCase()
    if (userRole === 'dipendente' || userRole === 'restricted') {
      return res.status(403).json({ error: 'Accesso negato: invio note sviluppatore disabilitato per il profilo Dipendente' })
    }

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

app.delete('/api/developer-notes/:id', (req, res) => {
  try {
    const { id } = req.params
    const notesFile = path.join(__dirname, 'data', 'developerNotes.json')
    if (fs.existsSync(notesFile)) {
      const data = fs.readFileSync(notesFile, 'utf8')
      let notes = JSON.parse(data)
      const prevCount = notes.length
      notes = notes.filter(n => String(n.id) !== String(id) && String(n.timestamp) !== String(id))
      fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2), 'utf8')
      console.log(`🗑️ [DEVELOPER NOTES] Eliminata nota con ID ${id}. Rimanenti: ${notes.length}`)
      return res.json({ success: true, deletedId: id, count: notes.length })
    }
    res.json({ success: true, deletedId: id, count: 0 })
  } catch (err) {
    console.error('Errore cancellazione nota sviluppatore:', err)
    res.status(500).json({ error: 'Errore cancellazione nota' })
  }
})

app.delete('/api/developer-notes', (req, res) => {
  try {
    const notesFile = path.join(__dirname, 'data', 'developerNotes.json')
    fs.writeFileSync(notesFile, JSON.stringify([], null, 2), 'utf8')
    console.log('🗑️ [DEVELOPER NOTES] Svuotate tutte le note.')
    res.json({ success: true, cleared: true, count: 0 })
  } catch (err) {
    console.error('Errore svuotamento note:', err)
    res.status(500).json({ error: 'Errore svuotamento note' })
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
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
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

// ── GESTIONE BOZZE EMAIL, INVIO AUTOMATICO & DISPONIBILITÀ CALENDARIO ──
app.get('/api/pipeline/drafts', (req, res) => {
  res.json(getDrafts())
})

app.post('/api/pipeline/drafts/:id/send', async (req, res) => {
  try {
    const result = await sendDraft(req.params.id)
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/pipeline/drafts/:id', (req, res) => {
  try {
    const result = updateDraft(req.params.id, req.body)
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/pipeline/drafts/:id', (req, res) => {
  try {
    const result = deleteDraft(req.params.id)
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/pipeline/calendar/check', (req, res) => {
  try {
    const { date, time } = req.query
    if (!date || !time) {
      return res.status(400).json({ error: 'Data e ora richieste (es. date=2026-09-29&time=11:00)' })
    }
    const availability = checkCalendarSlotAvailability(date, time)
    res.json(availability)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
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
