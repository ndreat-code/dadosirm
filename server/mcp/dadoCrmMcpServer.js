#!/usr/bin/env node
/**
 * DADO CRM — ANTIGRAVITY 2.0 MODEL CONTEXT PROTOCOL (MCP) SERVER
 * 
 * Fornisce ricerca istantanea e "zero-click" nel CRM di DADO Creative Studio:
 * - crm_instant_search: Ricerca cross-entity istantanea su tutto il database (clienti, fatture, shooting, contatti, attrezzature)
 * - crm_get_company: Dossier anagrafico e contrattuale completo per singola azienda
 * - crm_get_collaborators: Rubrica referenti aziendali (ruoli, email dirette, telefoni, WhatsApp)
 * - crm_get_invoices: Riepilogo contabile fatture emesse, incassati, insoluti, scadenze e SDI
 * - crm_get_calendar_activities: Prossime azioni, shooting in programma e disponibilità set
 * - crm_enrich_b2b: Data Enrichment camerale e B2B via Atoka, LinkedIn, CCIAA, D&B
 * - crm_cross_check_audit: Audit incrociato di coerenza contabile e operativa
 */

import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'
import { enrichCompanyData } from '../services/enrichmentService.js'
import { auditAccounting, auditOperations, auditCompany } from '../services/crossCheckEngine.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CRM_DATA_PATH = process.env.CRM_DATA_PATH || path.resolve(__dirname, '../data/crmData.json')

function loadCrmData() {
  try {
    if (fs.existsSync(CRM_DATA_PATH)) {
      const content = fs.readFileSync(CRM_DATA_PATH, 'utf-8')
      return JSON.parse(content)
    }
  } catch (err) {
    console.error('[MCP ERROR] Errore lettura crmData.json:', err.message)
  }
  return { companies: [], opportunities: [], nextActions: [], inventory: [], invoices: [], collaborators: [] }
}

// ─────────────────────────────────────────────────────────────
// DEFINIZIONE TOOLS MCP
// ─────────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'crm_instant_search',
    description: 'Ricerca istantanea "zero-click" nel CRM DADO Creative Studio. Cerca contemporaneamente e senza filtri manuali tra aziende partner, referenti/collaboratori, contratti, fatture, scadenze, shooting e attrezzature.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Termine di ricerca (es. "Riva", "02194830159", "Kroma", "Drone", "insoluti", "Matteo", "ottobre", "FX3")'
        },
        entityType: {
          type: 'string',
          enum: ['all', 'companies', 'collaborators', 'invoices', 'activities', 'inventory'],
          description: 'Tipo di entità su cui concentrare la ricerca (default: all)',
          default: 'all'
        },
        limit: {
          type: 'integer',
          description: 'Numero massimo di risultati per categoria (default: 10)',
          default: 10
        }
      },
      required: ['query']
    }
  },
  {
    name: 'crm_get_company',
    description: 'Recupera la scheda anagrafica e contrattuale completa di un\'azienda partner nel CRM DADO (dati camerali P.IVA, SDI, PEC, contatti referenti, contratti sottoscritti, compensi deliberati e stato pagamenti).',
    inputSchema: {
      type: 'object',
      properties: {
        companyIdOrName: {
          type: 'string',
          description: 'Nome dell\'azienda o ID univoco (es. "Officine Meccaniche Riva", "Kroma Ceramiche", "comp-1790554320431")'
        }
      },
      required: ['companyIdOrName']
    }
  },
  {
    name: 'crm_get_collaborators',
    description: 'Consulta la Rubrica dei Collaboratori & Referenti aziendali estrapolati dai contatti storici del CRM DADO (ruolo aziendale, email diretta, cellulare, telefono ufficio e link rapido WhatsApp).',
    inputSchema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Filtro testuale su nome, cognome, azienda o ruolo'
        },
        roleFilter: {
          type: 'string',
          enum: ['ALL', 'DIRECTION', 'MARKETING', 'TECH', 'PRODUCTION'],
          description: 'Filtro per categoria di ruolo'
        }
      }
    }
  },
  {
    name: 'crm_get_invoices',
    description: 'Recupera la situazione contabile dello studio: elenco fatture emesse, totale imponibile, IVA 22%, acconti incassati, saldi ancora aperti (insoluti), scadenze e codici SDI.',
    inputSchema: {
      type: 'object',
      properties: {
        statusFilter: {
          type: 'string',
          enum: ['all', 'pending', 'paid'],
          description: 'Filtro stato fattura: "pending" per mostrare solo i saldi aperti da riscuotere, "paid" per saldate, "all" per tutte',
          default: 'all'
        },
        companyName: {
          type: 'string',
          description: 'Filtro opzionale per singola azienda'
        }
      }
    }
  },
  {
    name: 'crm_get_calendar_activities',
    description: 'Recupera il calendario operativo di Studio DADO: prossime azioni commerciali, date di shooting sul set o in trasferta, follow-up clienti e scadenze.',
    inputSchema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['all', 'today', 'tomorrow', 'this_week', 'this_month'],
          description: 'Periodo temporale di interesse',
          default: 'all'
        }
      }
    }
  },
  {
    name: 'crm_enrich_b2b',
    description: 'Esegue il Data Enrichment B2B istantaneo interrogando i database camerali e aziendali pubblici (Atoka, Registro Imprese CCIAA, LinkedIn Talent Insights, Dun & Bradstreet, ZoomInfo) partendo da Partita IVA o Ragione Sociale.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Partita IVA (11 cifre) o Ragione Sociale (es. "02194830159", "Ferrari S.p.A.", "Kroma Ceramiche")'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'crm_cross_check_audit',
    description: 'Esegue un controllo incrociato e audit di coerenza multidimensionale nel CRM tra contratti firmati, fatture emesse, acconti ricevuti, saldi aperti e impegni del calendario/attrezzature.',
    inputSchema: {
      type: 'object',
      properties: {
        auditType: {
          type: 'string',
          enum: ['full', 'accounting', 'operations', 'company'],
          description: 'Tipo di audit (accounting = contabile, operations = logistica set/attrezzature, company = singola azienda, full = completo)',
          default: 'full'
        },
        companyName: {
          type: 'string',
          description: 'Nome dell\'azienda nel caso di audit mirato singolo'
        }
      }
    }
  }
]

// ─────────────────────────────────────────────────────────────
// ESECUZIONE TOOLS MCP
// ─────────────────────────────────────────────────────────────

async function executeTool(name, args = {}) {
  const data = loadCrmData()

  switch (name) {
    case 'crm_instant_search': {
      const q = (args.query || '').trim().toLowerCase()
      const limit = args.limit || 10
      const entityType = args.entityType || 'all'

      if (!q) {
        return { error: 'Specificare una parola chiave per la ricerca istantanea' }
      }

      const results = {
        query: args.query,
        matchedCompanies: [],
        matchedCollaborators: [],
        matchedInvoices: [],
        matchedActivities: [],
        matchedInventory: []
      }

      // Ricerca Aziende
      if (entityType === 'all' || entityType === 'companies') {
        results.matchedCompanies = (data.companies || []).filter(c => 
          c.name?.toLowerCase().includes(q) ||
          c.piva?.includes(q) ||
          c.industry?.toLowerCase().includes(q) ||
          c.contactPerson?.name?.toLowerCase().includes(q) ||
          c.contact?.email?.toLowerCase().includes(q) ||
          c.workSchedule?.datesFormatted?.toLowerCase().includes(q) ||
          (c.requestedMaterials || []).some(m => m.toLowerCase().includes(q))
        ).slice(0, limit).map(c => ({
          id: c.id,
          name: c.name,
          piva: c.piva || 'Non registrata',
          industry: c.industry,
          status: c.status,
          contactPerson: `${c.contactPerson?.name || ''} (${c.contactPerson?.role || ''})`,
          email: c.contact?.directEmail || c.contact?.email,
          phone: c.contact?.mobile || c.contact?.phone,
          contractAmount: c.compensation?.amount ? `€ ${c.compensation.amount.toLocaleString('it-IT')}` : 'Non indicato',
          balance: c.compensation?.balance ? `€ ${c.compensation.balance.toLocaleString('it-IT')}` : '€ 0',
          workDates: c.workSchedule?.datesFormatted || 'Da concordare'
        }))
      }

      // Ricerca Collaboratori
      if (entityType === 'all' || entityType === 'collaborators') {
        const collabs = data.collaborators || []
        results.matchedCollaborators = collabs.filter(c =>
          c.name?.toLowerCase().includes(q) ||
          c.companyName?.toLowerCase().includes(q) ||
          c.role?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.mobilePhone?.includes(q) ||
          c.officePhone?.includes(q)
        ).slice(0, limit).map(c => ({
          name: c.name,
          role: c.role,
          company: c.companyName,
          email: c.email,
          mobile: c.mobilePhone,
          phone: c.officePhone,
          whatsappUrl: c.mobilePhone ? `https://wa.me/${c.mobilePhone.replace(/[^0-9]/g, '')}` : null
        }))
      }

      // Ricerca Fatture
      if (entityType === 'all' || entityType === 'invoices') {
        results.matchedInvoices = (data.invoices || []).filter(i =>
          i.number?.toLowerCase().includes(q) ||
          i.companyName?.toLowerCase().includes(q) ||
          i.status?.toLowerCase().includes(q) ||
          i.sdi?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
        ).slice(0, limit).map(i => ({
          number: i.number,
          company: i.companyName,
          amountNet: `€ ${(i.amount || 0).toLocaleString('it-IT')}`,
          vat22: `€ ${(i.vat || 0).toLocaleString('it-IT')}`,
          total: `€ ${(i.totalWithVat || 0).toLocaleString('it-IT')}`,
          deposit: `€ ${(i.deposit || 0).toLocaleString('it-IT')}`,
          balanceOpen: `€ ${(i.balance || 0).toLocaleString('it-IT')}`,
          status: i.status,
          dueDate: i.dueDate,
          sdi: i.sdi
        }))
      }

      // Ricerca Attività / Calendario
      if (entityType === 'all' || entityType === 'activities') {
        results.matchedActivities = (data.nextActions || []).filter(a =>
          a.company?.toLowerCase().includes(q) ||
          a.task?.toLowerCase().includes(q) ||
          a.date?.toLowerCase().includes(q) ||
          a.contact?.toLowerCase().includes(q)
        ).slice(0, limit)
      }

      // Ricerca Attrezzature
      if (entityType === 'all' || entityType === 'inventory') {
        results.matchedInventory = (data.inventory || []).filter(item =>
          item.name?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.serial?.toLowerCase().includes(q)
        ).slice(0, limit)
      }

      const totalFound = results.matchedCompanies.length + results.matchedCollaborators.length + results.matchedInvoices.length + results.matchedActivities.length + results.matchedInventory.length

      return {
        summary: `Trovati ${totalFound} risultati nel database CRM per la query "${args.query}"`,
        totalMatches: totalFound,
        results
      }
    }

    case 'crm_get_company': {
      const q = (args.companyIdOrName || '').trim().toLowerCase()
      const comp = (data.companies || []).find(c => 
        c.id?.toLowerCase() === q ||
        c.name?.toLowerCase() === q ||
        c.name?.toLowerCase().includes(q) ||
        (c.piva && c.piva.includes(q))
      )

      if (!comp) {
        return { error: `Nessuna azienda trovata per "${args.companyIdOrName}"` }
      }

      // Trova anche le relative fatture
      const invoices = (data.invoices || []).filter(i => 
        i.companyId === comp.id || 
        (i.companyName && i.companyName.toLowerCase().includes(comp.name.toLowerCase()))
      )

      return {
        company: comp,
        invoicesSummary: {
          count: invoices.length,
          totalInvoiced: invoices.reduce((s, i) => s + (i.amount || 0), 0),
          totalCollected: invoices.reduce((s, i) => s + (i.deposit || 0), 0),
          totalPending: invoices.reduce((s, i) => s + (i.balance || 0), 0),
          invoices
        }
      }
    }

    case 'crm_get_collaborators': {
      let list = data.collaborators || []
      const search = (args.search || '').trim().toLowerCase()

      if (search) {
        list = list.filter(c => 
          c.name?.toLowerCase().includes(search) ||
          c.companyName?.toLowerCase().includes(search) ||
          c.role?.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search) ||
          c.mobilePhone?.includes(search)
        )
      }

      if (args.roleFilter && args.roleFilter !== 'ALL') {
        const rf = args.roleFilter
        list = list.filter(c => {
          const role = (c.role || '').toLowerCase()
          if (rf === 'DIRECTION') return role.includes('ceo') || role.includes('director') || role.includes('titolare') || role.includes('direzione') || role.includes('managing')
          if (rf === 'MARKETING') return role.includes('marketing') || role.includes('brand') || role.includes('buyer') || role.includes('comunicazione')
          if (rf === 'TECH') return role.includes('tech') || role.includes('art') || role.includes('designer') || role.includes('digital')
          if (rf === 'PRODUCTION') return role.includes('produzione') || role.includes('acquisti') || role.includes('operations')
          return true
        })
      }

      return {
        count: list.length,
        collaborators: list.map(c => ({
          ...c,
          whatsappUrl: c.mobilePhone ? `https://wa.me/${c.mobilePhone.replace(/[^0-9]/g, '')}` : null
        }))
      }
    }

    case 'crm_get_invoices': {
      let invoices = data.invoices || []
      if (args.companyName) {
        const cn = args.companyName.toLowerCase()
        invoices = invoices.filter(i => (i.companyName || '').toLowerCase().includes(cn))
      }

      if (args.statusFilter === 'pending') {
        invoices = invoices.filter(i => (i.balance || 0) > 0 || i.status !== 'Saldato')
      } else if (args.statusFilter === 'paid') {
        invoices = invoices.filter(i => (i.balance || 0) === 0 || i.status === 'Saldato')
      }

      const totalNet = invoices.reduce((s, i) => s + (i.amount || 0), 0)
      const totalVat = invoices.reduce((s, i) => s + (i.vat || 0), 0)
      const totalGross = invoices.reduce((s, i) => s + (i.totalWithVat || 0), 0)
      const totalCollected = invoices.reduce((s, i) => s + (i.deposit || 0), 0)
      const totalPending = invoices.reduce((s, i) => s + (i.balance || 0), 0)

      return {
        count: invoices.length,
        summary: {
          totalNet: `€ ${totalNet.toLocaleString('it-IT')}`,
          totalVat: `€ ${totalVat.toLocaleString('it-IT')}`,
          totalGross: `€ ${totalGross.toLocaleString('it-IT')}`,
          totalCollected: `€ ${totalCollected.toLocaleString('it-IT')}`,
          totalPending: `€ ${totalPending.toLocaleString('it-IT')}`
        },
        invoices
      }
    }

    case 'crm_get_calendar_activities': {
      const actions = data.nextActions || []
      const period = args.period || 'all'
      const todayIso = new Date().toISOString().split('T')[0]

      let filtered = actions
      if (period === 'today') {
        filtered = actions.filter(a => a.date === todayIso)
      } else if (period === 'this_week') {
        // Approssimazione 7 giorni
        filtered = actions.slice(0, 7)
      }

      return {
        period,
        count: filtered.length,
        activities: filtered
      }
    }

    case 'crm_enrich_b2b': {
      const q = (args.query || '').trim()
      if (!q) return { error: 'Specificare una Partita IVA o un Nome Aziendale' }
      const enriched = await enrichCompanyData({ query: q, activeApiKey: process.env.OPENAI_API_KEY || '' })
      return enriched
    }

    case 'crm_cross_check_audit': {
      const auditType = args.auditType || 'full'
      if (args.companyName) {
        return auditCompany(args.companyName, data)
      }
      if (auditType === 'accounting') {
        return auditAccounting(data)
      }
      if (auditType === 'operations') {
        return auditOperations(data)
      }
      return {
        accounting: auditAccounting(data),
        operations: auditOperations(data)
      }
    }

    default:
      return { error: `Tool sconosciuto: ${name}` }
  }
}

// ─────────────────────────────────────────────────────────────
// PROTOCOLLO JSON-RPC 2.0 OVER STDIO
// ─────────────────────────────────────────────────────────────

function sendResponse(id, result, error = null) {
  const response = {
    jsonrpc: '2.0',
    id
  }
  if (error) {
    response.error = {
      code: -32603,
      message: typeof error === 'string' ? error : (error.message || 'Errore interno')
    }
  } else {
    response.result = result
  }
  process.stdout.write(JSON.stringify(response) + '\n')
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

rl.on('line', async (line) => {
  if (!line || !line.trim()) return

  try {
    const message = JSON.parse(line)

    // Gestione messaggi senza id (notifiche)
    if (message.id === undefined || message.id === null) {
      if (message.method === 'notifications/initialized') {
        // Nessuna risposta richiesta per notifiche
      }
      return
    }

    const { id, method, params } = message

    // 1. Handshake Inizializzazione
    if (method === 'initialize') {
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'dado-crm-mcp',
          version: '1.0.0'
        }
      })
      return
    }

    // 2. Lista dei Tools Esportati
    if (method === 'tools/list') {
      sendResponse(id, {
        tools: TOOLS
      })
      return
    }

    // 3. Esecuzione Tool
    if (method === 'tools/call') {
      const toolName = params?.name
      const toolArgs = params?.arguments || {}

      try {
        const result = await executeTool(toolName, toolArgs)
        sendResponse(id, {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        })
      } catch (toolErr) {
        sendResponse(id, null, toolErr.message)
      }
      return
    }

    // Metodo non gestito
    sendResponse(id, null, { message: `Metodo non supportato: ${method}` })
  } catch (parseErr) {
    sendResponse(null, null, { message: 'Errore parsing JSON-RPC: ' + parseErr.message })
  }
})

// Log di avvio su stderr (stderr non interferisce con il protocollo JSON-RPC stdio)
console.error('[MCP SERVER] DADO CRM Server avviato e pronto su stdio!')
