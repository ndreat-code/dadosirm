/**
 * REPORT ENGINE — DADO CREATIVE STUDIO CRM
 *
 * Risponde a richieste del tipo "fammi un report delle ultime 5 collaborazioni del mese scorso"
 * usando SOLO i dati realmente presenti nel CRM. Il filtro per periodo, il conteggio e i
 * controlli incrociati sono calcolati qui (codice deterministico), non da un modello linguistico:
 * in questo modo le risposte sono sempre verificabili e non possono contenere numeri inventati.
 *
 * Definizione di "collaborazione": un lavoro con contratto firmato e/o fattura emessa.
 * Data di riferimento (in ordine di affidabilità):
 *   1. date di shooting riportate in fattura
 *   2. data lavori registrata nella scheda cliente (workSchedule.recentDate)
 *   3. data di firma del contratto
 * La fonte della data è sempre dichiarata nel report.
 */

const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
const MONTHS_CAP = MONTHS.map(m => m.charAt(0).toUpperCase() + m.slice(1))

const NUM_WORDS = {
  un: 1, uno: 1, una: 1, primo: 1, prima: 1, ultimo: 1, ultima: 1,
  due: 2, tre: 3, quattro: 4, cinque: 5,
  sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10, undici: 11, dodici: 12,
  quindici: 15, venti: 20
}

const TOPIC_RE = /(collaborazion|lavori|lavoro|commess[ae]|progett[io]|shooting|produzion[ei]|contratt[io]|accord[io])/i
const CROSSCHECK_RE = /(attrezzatur|conflitt|sovrapposiz|scostament|incroc|audit|discrepanz)/i
const REPORT_WORD_RE = /(report|elenc|riepilog|resoconto|quant[ie]|lista|dimmi|mostra|fammi|raccont|sintesi|presenta|trova|quali sono)/i
const IS_ANALYTICAL_RE = /\b(?:chi|chi\s+[eè]|come|perch[eé]|cosa|quanto|quanti|qual\s+[eè]|quale|quali\s+sono\s+i\s+pi[uù]|pi[uù]\s+redditiz|miglior|peggior|problem|criticit[aà]|consigl|spieg|differenz|confront|margine|referente|contatt|consigliami|suggerisci)\b/i
const EXPLICIT_REPORT_RE = /\b(?:report|resoconto|riepilogo|consuntivo|elenco|lista|schede|presentami|elencami|mostrami\s+(?:i|le|tutti|tutte))\b/i

// ───────────────────────── Utilità date ─────────────────────────

const pad = n => String(n).padStart(2, '0')
const toIso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const isoFromParts = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`
const lastDayOfMonth = (y, m) => new Date(y, m + 1, 0).getDate()
const fmtDate = iso => (iso ? iso.split('-').reverse().join('/') : '')
const eur = n => String(Math.round(Number(n || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const plural = (n, one, many) => (n === 1 ? one : many)

function addDays(date, days) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() + days)
  return d
}

/** Estrae le date da stringhe tipo "24 e 25 Settembre 2026" o "08 Settembre 2026" → ['2026-09-24','2026-09-25'] */
export function parseItalianDates(text) {
  if (!text || typeof text !== 'string') return []
  const out = []
  const re = /(\d{1,2}(?:\s*(?:e|,|-|–|\/)\s*\d{1,2})*)\s+([A-Za-zà]+)\s+(\d{4})/g
  let m
  while ((m = re.exec(text)) !== null) {
    const monthIdx = MONTHS.indexOf(m[2].toLowerCase())
    if (monthIdx < 0) continue
    const days = m[1].match(/\d{1,2}/g) || []
    days.forEach(d => out.push(isoFromParts(Number(m[3]), monthIdx, Number(d))))
  }
  return out.sort()
}

// ───────────────────────── Interpretazione della richiesta ─────────────────────────

/**
 * Individua il periodo richiesto. Restituisce { start, end, label, kind } (date ISO incluse) oppure null.
 * - "mese scorso" / "mese precedente"  → mese di calendario precedente
 * - "ultimo mese" / "ultimi 30 giorni" → ultimi 30 giorni fino a oggi
 * - "settembre" / "settembre 2025"     → quel mese
 */
export function resolvePeriod(prompt, now = new Date()) {
  const p = String(prompt || '').toLowerCase()
  const y = now.getFullYear()
  const m = now.getMonth()

  if (/(mese scorso|scorso mese|mese precedente)/.test(p)) {
    const pm = m === 0 ? 11 : m - 1
    const py = m === 0 ? y - 1 : y
    return { start: isoFromParts(py, pm, 1), end: isoFromParts(py, pm, lastDayOfMonth(py, pm)), label: `${MONTHS[pm]} ${py}`, kind: 'mese scorso (mese di calendario precedente)' }
  }
  if (/(questo mese|mese corrente|mese in corso)/.test(p)) {
    return { start: isoFromParts(y, m, 1), end: toIso(now), label: `${MONTHS[m]} ${y} (fino a oggi)`, kind: 'mese in corso' }
  }
  if (/(settimana scorsa|scorsa settimana)/.test(p)) {
    const dow = (now.getDay() + 6) % 7 // lunedì = 0
    const thisMonday = addDays(now, -dow)
    const start = addDays(thisMonday, -7)
    const end = addDays(thisMonday, -1)
    return { start: toIso(start), end: toIso(end), label: `settimana dal ${fmtDate(toIso(start))} al ${fmtDate(toIso(end))}`, kind: 'settimana scorsa (lun–dom)' }
  }
  if (/(questa settimana|settimana corrente|settimana in corso)/.test(p)) {
    const dow = (now.getDay() + 6) % 7
    const start = addDays(now, -dow)
    return { start: toIso(start), end: toIso(now), label: `settimana in corso dal ${fmtDate(toIso(start))}`, kind: 'settimana in corso' }
  }
  const rolling = p.match(/ultim[ei]\s+(\d+|[a-zà]+)\s+(giorni|settimane|mesi)/)
  if (rolling) {
    const n = /^\d+$/.test(rolling[1]) ? Number(rolling[1]) : NUM_WORDS[rolling[1]]
    if (n) {
      const unit = rolling[2]
      const days = unit === 'giorni' ? n : unit === 'settimane' ? n * 7 : null
      const start = unit === 'mesi' ? new Date(y, m - n, now.getDate()) : addDays(now, -days)
      return { start: toIso(start), end: toIso(now), label: `ultimi ${n} ${unit} (dal ${fmtDate(toIso(start))} a oggi)`, kind: `ultimi ${n} ${unit}` }
    }
  }
  if (/(ultimo mese)/.test(p)) {
    const start = addDays(now, -30)
    return { start: toIso(start), end: toIso(now), label: `ultimi 30 giorni (dal ${fmtDate(toIso(start))} a oggi)`, kind: 'ultimo mese = ultimi 30 giorni' }
  }
  if (/(trimestre scorso|ultimo trimestre|scorso trimestre)/.test(p)) {
    const q = Math.floor(m / 3)
    const pq = q === 0 ? 3 : q - 1
    const py = q === 0 ? y - 1 : y
    const sm = pq * 3
    return { start: isoFromParts(py, sm, 1), end: isoFromParts(py, sm + 2, lastDayOfMonth(py, sm + 2)), label: `${pq + 1}° trimestre ${py}`, kind: 'trimestre scorso' }
  }
  if (/(questo trimestre|trimestre corrente|trimestre in corso)/.test(p)) {
    const sm = Math.floor(m / 3) * 3
    return { start: isoFromParts(y, sm, 1), end: toIso(now), label: `${Math.floor(m / 3) + 1}° trimestre ${y} (fino a oggi)`, kind: 'trimestre in corso' }
  }
  if (/(anno scorso|scorso anno)/.test(p)) {
    return { start: `${y - 1}-01-01`, end: `${y - 1}-12-31`, label: `${y - 1}`, kind: 'anno scorso' }
  }
  if (/(quest'anno|questo anno|anno corrente|anno in corso|da inizio anno)/.test(p)) {
    return { start: `${y}-01-01`, end: toIso(now), label: `${y} (fino a oggi)`, kind: 'anno in corso' }
  }
  const named = p.match(new RegExp(`\\b(${MONTHS.join('|')})\\b(?:\\s+(\\d{4}))?`))
  if (named) {
    const mi = MONTHS.indexOf(named[1])
    const yr = named[2] ? Number(named[2]) : (mi <= m ? y : y - 1)
    return { start: isoFromParts(yr, mi, 1), end: isoFromParts(yr, mi, lastDayOfMonth(yr, mi)), label: `${MONTHS[mi]} ${yr}`, kind: 'mese indicato' }
  }
  return null
}

/** Determina se l'ordine richiesto è ascendente ('asc', es. "primi 3", "dall'inizio") o discendente ('desc', es. "ultimi 5"). */
export function resolveOrder(prompt) {
  const p = String(prompt || '').toLowerCase()
  if (/\b(?:prim[eio]|inizial[ei]|cronologic[ao]|dall['’]inizio)\b/.test(p)) {
    return 'asc'
  }
  return 'desc'
}

/** Individua il numero di elementi richiesti ("ultime 5 collaborazioni", "primi 3 contratti", "prime tre commesse"). */
export function resolveCount(prompt) {
  const p = String(prompt || '').toLowerCase()

  // 1) "primi 3", "prime 3", "ultimi 5", "ultime 5", "primi tre", ecc.
  const mOrderNum = p.match(/(?:prim[eio]|ultim[eio])\s+(\d+|[a-zà]+)/)
  if (mOrderNum) {
    const val = mOrderNum[1]
    const n = /^\d+$/.test(val) ? Number(val) : NUM_WORDS[val]
    if (n && n > 0 && n <= 200) return n
  }

  // 2) "il primo", "la prima", "l'ultimo", "l'ultima" senza numero esplicito -> 1
  if (/\b(?:il|la|l['’])\s*(?:prim[oa]|ultim[oa])\b/.test(p) || /\b(?:prim[oa]|ultim[oa])\s+(?:contratto|lavoro|collaborazione|commessa|progetto|shooting|cliente)\b/.test(p)) {
    return 1
  }

  // 3) "3 contratti", "5 collaborazioni", "dieci lavori", "3 primi lavori"
  const re = /(?:(?:prim[eio]|ultim[eio])\s+)?(\d+|[a-zà]+)\s+(?:(?:prim[eio]|ultim[eio])\s+)?(?:collaborazion|lavori|lavor[oi]|commess|progett|shooting|produzion|contratt|accord|client)/
  const m = p.match(re)
  if (m) {
    const n = /^\d+$/.test(m[1]) ? Number(m[1]) : NUM_WORDS[m[1]]
    if (n && n > 0 && n <= 200) return n
  }

  return null
}

/** True se la domanda è una richiesta di report/elenco strutturato di collaborazioni (eventualmente con periodo e numero). */
export function detectCollaborationIntent(prompt, now = new Date()) {
  const p = String(prompt || '').toLowerCase()
  if (!TOPIC_RE.test(p) || CROSSCHECK_RE.test(p)) return null

  // Se è una domanda analitica, di spiegazione, su un referente, problemi o opinione, non intercettare: va all'AI
  if (IS_ANALYTICAL_RE.test(p)) return null

  const period = resolvePeriod(p, now)
  const count = resolveCount(p)

  // 1) Se c'è un conteggio specifico (es. "primi 3 contratti", "ultime 5 collaborazioni") -> INTERCETTA
  if (count) {
    const order = resolveOrder(p)
    const focusContracts = /contratt/i.test(p)
    return { period, count, order, focusContracts }
  }

  // 2) Se c'è un periodo specifico (es. "settembre", "mese scorso") E una parola di elenco/report -> INTERCETTA
  if (period && (EXPLICIT_REPORT_RE.test(p) || REPORT_WORD_RE.test(p))) {
    const order = resolveOrder(p)
    const focusContracts = /contratt/i.test(p)
    return { period, count: null, order, focusContracts }
  }

  // 3) Se non c'è periodo né conteggio, intercetta SOLO se è esplicitamente richiesto un "report / consuntivo / riepilogo" completo
  if (/\b(?:report|consuntivo|resoconto|riepilogo\s+completo)\b/i.test(p)) {
    const order = resolveOrder(p)
    const focusContracts = /contratt/i.test(p)
    return { period: null, count: null, order, focusContracts }
  }

  return null
}

// ───────────────────────── Costruzione delle collaborazioni ─────────────────────────

const normName = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

function findCompany(companies, { id, name }) {
  return companies.find(c => id && c.id === id) ||
    companies.find(c => name && normName(c.name) === normName(name)) ||
    companies.find(c => name && normName(c.name).includes(normName(name)))
}

/**
 * Costruisce l'elenco unificato delle collaborazioni a partire da fatture e contratti firmati,
 * calcolando per ognuna data di riferimento, importi e anomalie da verificare.
 */
export function buildCollaborations(crmData, now = new Date()) {
  const companies = crmData.companies || []
  const invoices = crmData.invoices || []
  const today = toIso(now)

  // Mappa codice contratto → aziende diverse che lo usano (per individuare duplicati)
  const codeOwners = new Map()
  const registerCode = (code, companyName) => {
    if (!code) return
    if (!codeOwners.has(code)) codeOwners.set(code, new Set())
    codeOwners.get(code).add(normName(companyName))
  }
  companies.forEach(c => (c.contractsHistory || []).forEach(h => registerCode(h.code, c.name)))
  invoices.forEach(i => registerCode(i.contractCode, i.companyName))

  const items = []
  const usedKeys = new Set()

  const lastSignedCode = company => {
    const signed = (company?.contractsHistory || []).filter(h => /firmat/i.test(h.status || ''))
    return signed.length ? signed[signed.length - 1].code : null
  }

  const makeItem = ({ company, companyName, invoice, contract }) => {
    const code = invoice?.contractCode || contract?.code
    let dates = invoice ? parseItalianDates(invoice.shootingDates) : []
    let dateSource = 'date di shooting in fattura'
    if (!dates.length) {
      const recent = company?.workSchedule?.recentDate
      if (recent && contract && lastSignedCode(company) === contract.code && recent >= (contract.date || '')) {
        dates = [recent]
        dateSource = 'data lavori nella scheda cliente'
      } else if (invoice?.date) {
        dates = [invoice.date]
        dateSource = 'data fattura (shooting non registrato)'
      } else if (contract?.date) {
        dates = [contract.date]
        dateSource = 'data firma contratto (shooting non registrato)'
      }
    }
    if (!dates.length) return null
    const eventStart = dates[0]
    const eventEnd = dates[dates.length - 1]

    const contractAmount = contract?.amount ?? null
    const invoiceAmount = invoice?.amount ?? null
    const amount = invoiceAmount ?? contractAmount ?? 0

    // ── Controlli incrociati sulla singola collaborazione ──
    const anomalies = []
    const owners = codeOwners.get(code)
    if (code && owners && owners.size > 1) {
      anomalies.push(`Il codice contratto ${code} risulta assegnato a più clienti nel CRM: serve verificare quale sia corretto.`)
    }
    if (contractAmount != null && invoiceAmount != null && contractAmount !== invoiceAmount) {
      anomalies.push(`Importo contratto (€ ${eur(contractAmount)}) diverso dall'importo fatturato (€ ${eur(invoiceAmount)}).`)
    }
    if (invoice?.date && contract?.date && invoice.date < contract.date) {
      anomalies.push(`La fattura ${invoice.number} (${fmtDate(invoice.date)}) risulta emessa prima della firma del contratto (${fmtDate(contract.date)}).`)
    }
    const compAmt = company?.compensation?.amount
    if (contract && compAmt != null && lastSignedCode(company) === contract.code && contractAmount != null && compAmt !== contractAmount) {
      anomalies.push(`La scheda cliente riporta un compenso di € ${eur(compAmt)}, diverso dall'importo del contratto (€ ${eur(contractAmount)}).`)
    }
    if (invoice && Number(invoice.balance) > 0) {
      const overdue = invoice.dueDate && invoice.dueDate < today
      anomalies.push(`Saldo aperto di € ${eur(invoice.balance)} (scadenza ${fmtDate(invoice.dueDate) || 'non indicata'})${overdue ? ' — SCADUTO' : ''}.`)
    }
    if (!invoice) {
      anomalies.push('Contratto firmato ma nessuna fattura collegata nel CRM.')
    }
    if (invoice && !contract) {
      anomalies.push(`Fattura ${invoice.number} senza contratto corrispondente nello storico del cliente (codice ${code || 'assente'}).`)
    }

    return {
      company: company?.name || companyName,
      sector: company?.industry || '',
      contactPerson: company?.contactPerson?.name ? `${company.contactPerson.name}${company.contactPerson.role ? ` (${company.contactPerson.role})` : ''}` : '',
      contractCode: code || null,
      contractTitle: contract?.title || invoice?.description || '',
      contractSigned: contract?.date || null,
      contractStatus: contract?.status || null,
      amount,
      invoiceNumber: invoice?.number || null,
      invoiceDate: invoice?.date || null,
      deposit: invoice ? Number(invoice.deposit || 0) : null,
      balance: invoice ? Number(invoice.balance || 0) : null,
      dueDate: invoice?.dueDate || null,
      paymentStatus: invoice?.status || null,
      location: invoice?.location || company?.workSchedule?.location || '',
      materials: Array.isArray(invoice?.materials) ? invoice.materials : [],
      shootingText: invoice?.shootingDates || company?.workSchedule?.datesFormatted || '',
      eventStart,
      eventEnd,
      dateSource,
      isDone: eventEnd <= today,
      anomalies
    }
  }

  // 1) Una collaborazione per ogni fattura
  invoices.forEach(inv => {
    const company = findCompany(companies, { id: inv.companyId, name: inv.companyName })
    const contract = (company?.contractsHistory || []).find(h => h.code === inv.contractCode)
    const item = makeItem({ company, companyName: inv.companyName, invoice: inv, contract })
    if (item) {
      items.push(item)
      usedKeys.add(`${normName(item.company)}|${inv.contractCode}`)
    }
  })

  // 2) Contratti firmati senza fattura
  companies.forEach(company => {
    ;(company.contractsHistory || []).forEach(contract => {
      if (!/firmat/i.test(contract.status || '')) return
      if (usedKeys.has(`${normName(company.name)}|${contract.code}`)) return
      const item = makeItem({ company, companyName: company.name, invoice: null, contract })
      if (item) items.push(item)
    })
  })

  return items.sort((a, b) => (b.eventEnd || '').localeCompare(a.eventEnd || ''))
}

// ───────────────────────── Report ─────────────────────────

function renderItem(it, idx) {
  const lines = []
  lines.push(`**${idx}. ${it.company}**${it.contractTitle ? ` — ${it.contractTitle}` : ''}`)
  lines.push(`• 📅 Shooting: **${it.shootingText || fmtDate(it.eventEnd)}** _(fonte: ${it.dateSource})_${it.location ? ` • 📍 ${it.location}` : ''}`)
  lines.push(`• 📄 Contratto: ${it.contractCode ? `**${it.contractCode}**` : 'non indicato'}${it.contractSigned ? ` firmato il ${fmtDate(it.contractSigned)}` : ''} • Imponibile: **€ ${eur(it.amount)}**`)
  if (it.invoiceNumber) {
    lines.push(`• 🧾 Fattura ${it.invoiceNumber} del ${fmtDate(it.invoiceDate)} • Incassato: **€ ${eur(it.deposit)}** • Saldo aperto: **€ ${eur(it.balance)}** (${it.paymentStatus || 'stato non indicato'})`)
  } else {
    lines.push('• 🧾 Fattura: nessuna fattura collegata nel CRM')
  }
  if (it.contactPerson) lines.push(`• 👤 Referente: ${it.contactPerson}`)
  if (it.materials.length) lines.push(`• 🎥 Attrezzatura: ${it.materials.join(', ')}`)
  return lines.join('\n')
}

/**
 * Genera il report. `intent` = { period, count } da detectCollaborationIntent.
 * Il testo dichiara sempre criterio, periodo, quanti risultati sono stati trovati e quanti ne erano stati chiesti.
 */
export function buildCollaborationReport(crmData, intent, now = new Date()) {
  const { period, count, order = 'desc', focusContracts = false } = intent
  const all = buildCollaborations(crmData, now)
  const today = toIso(now)

  let inPeriod = period ? all.filter(i => i.eventEnd >= period.start && i.eventEnd <= period.end) : all

  if (focusContracts) {
    const withContract = inPeriod.filter(i => i.contractCode && (/firmat/i.test(i.contractStatus || '') || i.contractSigned))
    if (withContract.length > 0) {
      inPeriod = withContract
    }
  }

  // Ordinamento: cronologico crescente (dai primi) o decrescente (dai più recenti/ultimi)
  if (order === 'asc') {
    inPeriod.sort((a, b) => (a.eventEnd || '').localeCompare(b.eventEnd || ''))
  } else {
    inPeriod.sort((a, b) => (b.eventEnd || '').localeCompare(a.eventEnd || ''))
  }

  const done = inPeriod.filter(i => i.isDone)
  const scheduled = inPeriod.filter(i => !i.isDone)

  const shown = count ? done.slice(0, count) : done
  const omitted = count ? done.slice(count) : []
  const found = done.length

  const out = []
  const periodTxt = period ? `**${period.label}**` : 'tutto lo storico presente nel CRM'
  const titleTopic = focusContracts ? 'CONTRATTI & COLLABORAZIONI' : 'COLLABORAZIONI'
  out.push(`📋 **REPORT ${titleTopic} — ${period ? period.label.toUpperCase() : 'STORICO COMPLETO'}**`)
  out.push('─────────────────────────────────────────────────────────────')

  // ── Messaggio principale: conteggio onesto trovate/richieste ──
  const nounSingular = focusContracts ? 'contratto firmato' : 'collaborazione'
  const nounPlural = focusContracts ? 'contratti firmati' : 'collaborazioni'

  if (found === 0) {
    out.push(`Nel periodo ${periodTxt} non risulta **nessuna collaborazione** registrata nel CRM${count ? ` (ne avevi chieste ${count})` : ''}.`)
    const before = period ? all.find(i => i.isDone && i.eventEnd < period.start) : null
    const after = period ? [...all].reverse().find(i => i.isDone && i.eventEnd > period.end) : null
    if (before) out.push(`• Ultima collaborazione precedente al periodo: **${before.company}** (${before.shootingText || fmtDate(before.eventEnd)}, contratto ${before.contractCode || 'n/d'}).`)
    if (after) out.push(`• Prima collaborazione successiva al periodo: **${after.company}** (${after.shootingText || fmtDate(after.eventEnd)}, contratto ${after.contractCode || 'n/d'}).`)
  } else if (count && found < count) {
    out.push(`Nel periodo ${periodTxt} risultano **${found} ${plural(found, nounSingular, nounPlural)}**, non ${count}. Ti riporto comunque ${found === 1 ? 'quello disponibile' : `tutti e ${found}`}.`)
  } else if (count && found === count) {
    out.push(`Nel periodo ${periodTxt} risultano esattamente **${found} ${plural(found, nounSingular, nounPlural)}**, come richiesto.`)
  } else if (count && found > count) {
    const whichOne = order === 'asc'
      ? (focusContracts ? `i primi **${count}** in ordine cronologico` : `le prime **${count}** in ordine cronologico`)
      : (focusContracts ? `i **${count}** più recenti` : `le **${count}** più recenti`)
    out.push(`Nel periodo ${periodTxt} risultano **${found} ${nounPlural}**: ti riporto ${whichOne}, come richiesto.`)
  } else {
    out.push(`Nel periodo ${periodTxt} risultano **${found} ${plural(found, nounSingular, nounPlural)}**.`)
  }

  const orderExplanation = order === 'asc'
    ? 'ordine cronologico (dalla prima all’ultima del periodo)'
    : 'ordine dalla più recente'
  out.push(`_Criterio: ${focusContracts ? 'contratto firmato' : 'collaborazione = lavoro con contratto firmato e/o fattura'}, collocato in base alla data di shooting; ${orderExplanation}.${period ? ` Periodo interpretato come ${period.kind}: dal ${fmtDate(period.start)} al ${fmtDate(period.end)}.` : ' Nessun periodo indicato: considero tutto lo storico.'}_`)
  out.push('')

  // ── Elenco ──
  shown.forEach((it, i) => {
    out.push(renderItem(it, i + 1))
    out.push('')
  })

  if (omitted.length) {
    out.push(`ℹ️ Non incluse perché oltre le ${count} richieste: ${omitted.map(o => `${o.company} (${fmtDate(o.eventEnd)})`).join(', ')}.`)
    out.push('')
  }
  if (scheduled.length) {
    out.push(`🗓️ Nello stesso periodo ${scheduled.length === 1 ? 'è programmata' : 'sono programmate'} anche ${scheduled.length} ${plural(scheduled.length, 'collaborazione non ancora svolta', 'collaborazioni non ancora svolte')} (non conteggiate): ${scheduled.map(s => `${s.company} (${s.shootingText || fmtDate(s.eventEnd)})`).join(', ')}.`)
    out.push('')
  }

  // ── Totali ──
  if (shown.length) {
    const invoiced = shown.filter(i => i.invoiceNumber)
    const totalAmount = shown.reduce((s, i) => s + (i.amount || 0), 0)
    const totalDeposit = invoiced.reduce((s, i) => s + (i.deposit || 0), 0)
    const totalOpen = invoiced.reduce((s, i) => s + (i.balance || 0), 0)
    out.push('💶 **TOTALI (imponibile, IVA esclusa)**')
    out.push(`• Valore complessivo delle collaborazioni elencate (${shown.length}): **€ ${eur(totalAmount)}**`)
    if (invoiced.length === 0) {
      out.push('• Incassi e saldi: non rilevabili, nessuna delle collaborazioni elencate ha una fattura collegata nel CRM.')
    } else {
      out.push(`• Incassato: **€ ${eur(totalDeposit)}** • Ancora da incassare: **€ ${eur(totalOpen)}**${shown.length !== invoiced.length ? ` _(calcolato solo sulle ${invoiced.length} con fattura collegata)_` : ''}`)
    }
    out.push('')

    // ── Osservazioni ragionate ──
    const flagged = shown.filter(i => i.anomalies.length)
    out.push('🔎 **OSSERVAZIONI & CONTROLLI INCROCIATI**')
    if (flagged.length === 0) {
      out.push('• Contratti, fatture e pagamenti risultano coerenti tra loro per tutte le collaborazioni elencate.')
    } else {
      flagged.forEach(f => {
        out.push(`• **${f.company}**${f.contractCode ? ` (${f.contractCode})` : ''}:`)
        f.anomalies.forEach(a => out.push(`  - ${a}`))
      })
      out.push('_Sono segnalazioni calcolate dal confronto dei dati del CRM: indicano dove i dati non combaciano, non quale dei due valori sia quello corretto._')
    }
  }

  return {
    answer: out.join('\n').trim(),
    meta: { requested: count || null, found, shown: shown.length, period: period || null, order, focusContracts }
  }
}

// ───────────────────────── Supporto al prompt LLM (domande generiche) ─────────────────────────

/** Vista compatta del CRM con i campi corretti, ad alta densità informativa per modelli LLM. */
export function buildCompactCrm(crmData) {
  const invoices = crmData.invoices || []
  return (crmData.companies || []).map(c => {
    const contratti = (c.contractsHistory || []).map(h => 
      `${h.code} (€${eur(h.amount)}, ${h.status}, firmato ${fmtDate(h.date) || h.date})`
    ).join(' | ')
    const inv = invoices.filter(i => i.companyId === c.id || (i.companyName && normName(i.companyName) === normName(c.name)))
    const fatture = inv.map(i => 
      `${i.number}: €${eur(i.amount)} (acconto €${eur(i.deposit)}, saldo aperto €${eur(i.balance)}, stato ${i.status})`
    ).join(' | ')
    const crit = c.issues?.hasIssue 
      ? `${c.issues.description} (Risoluzione: ${c.issues.resolution || 'Risolto'})` 
      : 'Nessuna'
    return {
      azienda: c.name,
      settore: c.industry || 'B2B',
      referente: c.contactPerson?.name ? `${c.contactPerson.name} (${c.contactPerson.role || 'Referente'})` : 'N/D',
      contratti: contratti || 'N/D',
      fatture: fatture || 'N/D',
      shooting: c.workSchedule?.datesFormatted || 'N/D',
      location: c.workSchedule?.location || 'Studio DADO',
      attrezzature: (c.requestedMaterials || []).slice(0, 4).join(', ') || 'N/D',
      criticita: crit
    }
  })
}

/** Blocco di istruzioni anti-invenzione per qualunque LLM (OpenAI, Ollama, Gemini...). */
export const GROUNDING_RULES = `REGOLE VINCOLANTI DI AFFIDABILITÀ:
1. Usa ESCLUSIVAMENTE i dati forniti sopra. Non inventare mai clienti, importi, date, codici contratto o numeri.
2. Se un dato richiesto non è presente, scrivilo chiaramente ("non presente nel CRM") invece di stimarlo.
3. Se l'utente chiede N elementi ma ne esistono meno, dillo in apertura ("risultano solo X, non N") e riporta comunque quelli esistenti.
4. Indica sempre il codice contratto o il numero fattura a supporto di ogni affermazione economica.
5. Se due dati si contraddicono, segnalalo senza scegliere arbitrariamente quale sia giusto.
6. Se la domanda è ambigua (es. data di firma o data di shooting), dichiara il criterio che hai usato.
7. Non parlare di meteo. Rispondi in italiano corretto, con accordo di genere e numero.`
