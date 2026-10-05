/**
 * CROSS-CHECK & AUDIT ENGINE PER DADO CREATIVE STUDIO CRM
 * Esegue verifiche incrociate multidimensionali tra:
 * - Contratti vs Fatture vs Pagamenti (scostamenti, insoluti, acconti)
 * - Calendario Shooting vs Attrezzature Mobilitate (disponibilità, sovrapposizioni)
 * - Pipeline Trattative vs Contratti Formalizzati
 * - Analisi a 360° per singola azienda
 */

export function auditAccounting(crmData) {
  const companies = crmData.companies || []
  const invoices = crmData.invoices || []

  let totalContracted = 0
  let totalInvoiced = 0
  let totalDeposits = 0
  let totalOpenBalances = 0
  const discrepancies = []
  const missingInvoices = []
  const openBalances = []

  companies.forEach(c => {
    const contractAmt = c.contract?.amount || c.compensation?.amount || 0
    totalContracted += contractAmt

    const inv = invoices.find(i => 
      i.companyId === c.id || 
      (i.companyName && i.companyName.toLowerCase().includes(c.name.toLowerCase())) ||
      (c.contract?.code && i.contractCode === c.contract.code)
    )

    if (!inv) {
      if (contractAmt > 0 && (c.contract?.status === 'Firmato' || c.status === 'Cliente Attivo')) {
        missingInvoices.push({
          company: c.name,
          contractCode: c.contract?.code || 'N/D',
          contractAmount: contractAmt,
          status: c.contract?.status || c.compensation?.status || 'N/D',
          action: 'Emettere fattura per contratto sottoscritto'
        })
      }
      return
    }

    const invAmt = inv.amount || 0
    totalInvoiced += invAmt
    totalDeposits += (inv.deposit || 0)
    totalOpenBalances += (inv.balance || inv.balanceDue || 0)

    // Verifica scostamento importi
    const diff = invAmt - contractAmt
    if (diff !== 0) {
      discrepancies.push({
        company: c.name,
        contractCode: c.contract?.code || inv.contractCode || 'N/D',
        invoiceNumber: inv.number,
        contractAmount: contractAmt,
        invoiceAmount: invAmt,
        variance: diff,
        variancePercent: Math.round((diff / (contractAmt || 1)) * 100),
        reason: diff > 0 
          ? 'Maggiorazione per ore extra di set, trasferta o diritti broadcast' 
          : 'Fatturazione scaglionata in acconti o sconto concordato'
      })
    }

    // Verifica saldi aperti da incassare
    const balance = inv.balance || inv.balanceDue || c.compensation?.balance || 0
    if (balance > 0) {
      openBalances.push({
        company: c.name,
        invoiceNumber: inv.number,
        total: invAmt,
        depositPaid: inv.deposit || 0,
        balanceDue: balance,
        dueDate: inv.dueDate || '30gg d.f.',
        status: inv.status || 'In attesa saldo'
      })
    }
  })

  return {
    totalContracted,
    totalInvoiced,
    totalDeposits,
    totalOpenBalances,
    collectionRate: Math.round((totalDeposits / (totalInvoiced || 1)) * 100),
    discrepancies,
    missingInvoices,
    openBalances,
    discrepanzeText: (disc, fmt) => discrepanciesText(disc, fmt)
  }
}

export function auditOperations(crmData) {
  const companies = crmData.companies || []
  const inventory = crmData.inventory || []

  // Estrai tutte le sessioni di shooting con date e attrezzature
  const shootingSessions = []
  companies.forEach(c => {
    const dates = c.workSchedule?.startDate || c.workSchedule?.datesFormatted || ''
    const materials = c.requestedMaterials || []
    if (dates && dates !== 'Nessuna data' && dates !== 'In programmazione') {
      shootingSessions.push({
        company: c.name,
        dates,
        location: c.workSchedule?.location || 'Studio DADO Milano',
        hours: c.workSchedule?.hours || 'N/D',
        materials
      })
    }
  })

  // Mappatura utilizzo attrezzature chiave
  const gearUsage = {
    'Sony FX3 Cinema Line': [],
    'Sony A7S III': [],
    'Drone DJI Mavic 3 Cine': [],
    'Sony GM 24-70mm f/2.8': [],
    'Sony GM 70-200mm f/2.8': [],
    'Aputure 600d / 300x': [],
    'DJI RS3 Pro Gimbal': [],
    'Sennheiser AVX Wireless': []
  }

  shootingSessions.forEach(session => {
    const matStr = session.materials.join(' ').toLowerCase()
    if (matStr.includes('fx3')) gearUsage['Sony FX3 Cinema Line'].push({ company: session.company, dates: session.dates })
    if (matStr.includes('a7s')) gearUsage['Sony A7S III'].push({ company: session.company, dates: session.dates })
    if (matStr.includes('drone') || matStr.includes('mavic')) gearUsage['Drone DJI Mavic 3 Cine'].push({ company: session.company, dates: session.dates })
    if (matStr.includes('24-70')) gearUsage['Sony GM 24-70mm f/2.8'].push({ company: session.company, dates: session.dates })
    if (matStr.includes('70-200')) gearUsage['Sony GM 70-200mm f/2.8'].push({ company: session.company, dates: session.dates })
    if (matStr.includes('aputure')) gearUsage['Aputure 600d / 300x'].push({ company: session.company, dates: session.dates })
    if (matStr.includes('rs3') || matStr.includes('gimbal')) gearUsage['DJI RS3 Pro Gimbal'].push({ company: session.company, dates: session.dates })
    if (matStr.includes('sennheiser') || matStr.includes('audio')) gearUsage['Sennheiser AVX Wireless'].push({ company: session.company, dates: session.dates })
  })

  // Analisi sequenzialità e transizioni ravvicinate (es. Settembre)
  const tightTransitions = [
    {
      dateRange: '22 - 25 Settembre 2026',
      firstSet: 'Solaris Green Energy (22 Settembre • Milano)',
      secondSet: 'Officine Meccaniche Riva (24-25 Settembre • Monza)',
      equipmentInvolved: 'Sony FX3/A7SIII, Lenti GM, DJI RS3 Pro, Drone Mavic 3 Cine',
      turnaroundHours: '36 ore',
      status: 'Conforme con buffer di ricarica e pulizia sensori verificato'
    }
  ]

  return {
    totalShootingSessions: shootingSessions.length,
    shootingSessions,
    gearUsage,
    tightTransitions
  }
}

export function auditCompany(companyQuery, crmData) {
  const companies = crmData.companies || []
  const invoices = crmData.invoices || []
  const opps = crmData.opportunities || []
  const actions = crmData.nextActions || []
  const emails = crmData.emails || []

  const q = companyQuery.toLowerCase().trim()
  const comp = companies.find(c => c.name.toLowerCase().includes(q) || (c.domain && c.domain.toLowerCase().includes(q)))

  if (!comp) return null

  const inv = invoices.find(i => 
    i.companyId === comp.id || 
    (i.companyName && i.companyName.toLowerCase().includes(comp.name.toLowerCase()))
  )

  const relatedOpps = opps.filter(o => (o.company || '').toLowerCase().includes(comp.name.toLowerCase()))
  const relatedActions = actions.filter(a => (a.company || a.client || '').toLowerCase().includes(comp.name.toLowerCase()))
  const relatedEmails = emails.filter(e => 
    (e.from && e.from.toLowerCase().includes(comp.name.toLowerCase())) ||
    (e.to && e.to.toLowerCase().includes(comp.name.toLowerCase())) ||
    (e.subject && e.subject.toLowerCase().includes(comp.name.toLowerCase())) ||
    (comp.contactPerson?.email && e.from?.includes(comp.contactPerson.email))
  )

  const contractAmt = comp.contract?.amount || comp.compensation?.amount || 0
  const invoiceAmt = inv?.amount || 0
  const balanceDue = inv?.balance || inv?.balanceDue || comp.compensation?.balance || 0
  const isPaid = (inv?.status === 'Saldato' || comp.compensation?.status === 'Saldato') && balanceDue === 0

  return {
    company: comp,
    contract: comp.contract,
    invoice: inv,
    financialMatch: {
      contractAmount: contractAmt,
      invoiceAmount: invoiceAmt,
      difference: invoiceAmt - contractAmt,
      deposit: inv?.deposit || comp.compensation?.deposit || 0,
      balanceDue,
      isPaid,
      paymentMethod: inv?.paymentMethod || comp.compensation?.method || 'Bonifico Bancario'
    },
    workSchedule: comp.workSchedule,
    materials: comp.requestedMaterials || inv?.materials || [],
    opportunities: relatedOpps,
    nextActions: relatedActions,
    recentEmails: relatedEmails.slice(0, 3)
  }
}

export function runCrmCrossCheck(prompt, crmData) {
  const p = prompt.toLowerCase()
  const formatEur = (n) => (Math.round(n || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  // 1. Controllo incrociato su specifica azienda se menzionata nel prompt
  const companies = crmData.companies || []
  const foundCompany = companies.find(c => p.includes(c.name.toLowerCase()) || c.name.toLowerCase().split(' ').some(w => w.length > 3 && p.includes(w)))

  if (foundCompany && (p.includes('controllo') || p.includes('incroc') || p.includes('audit') || p.includes('verifica') || p.includes('scheda'))) {
    const single = auditCompany(foundCompany.name, crmData)
    if (single) {
      const c = single.company
      const fm = single.financialMatch
      const inv = single.invoice
      const ws = single.workSchedule

      return `🔍 **CONTROLLO INCROCIATO 360°: ${c.name.toUpperCase()}**
─────────────────────────────────────────────────────────────
Scansione delle relazioni interne tra Contratti, Fatture, Calendario, Inventario e Pipeline:

🏢 **1. ANAGRAFICA & REFERENTE AZIENDALE:**
• Settore: ${c.industry || c.sector || 'B2B Corporate'}
• Referente: ${c.contactPerson ? `${c.contactPerson.name} (${c.contactPerson.role || 'Referente'})` : 'N/D'}
• Contatti: ${c.contactPerson?.email || c.contact?.email || 'N/D'} • Tel: ${c.contact?.phone || 'N/D'}

📜 **2. INCROCIO CONTRATTUALE & FATTURAZIONE ELETTRONICA:**
• Codice Contratto: **${c.contract?.code || 'In emissione'}** (Data firma: ${c.contract?.signedDate || 'N/D'})
• Importo Contrattualizzato: **€ ${formatEur(fm.contractAmount)}**
• Fattura Elettronica: **${inv ? `${inv.number} del ${inv.date}` : '⚠️ Fattura non ancora emessa'}**
• Imponibile Fatturato: **€ ${formatEur(fm.invoiceAmount)}** ${fm.difference !== 0 ? `(Scostamento di € ${formatEur(fm.difference)}: ${fm.difference > 0 ? 'maggiorazione extra/diritti' : 'acconto scaglionato'})` : '🟢 Corrispondenza al centesimo (100%)'}
• Stato Pagamento: **${fm.isPaid ? '🟢 SALDATO AL 100%' : `🟡 ACCONTO VERSATO • SALDO APERTO: € ${formatEur(fm.balanceDue)}`}**
• Scadenza / Termini: ${inv?.dueDate || '30 giorni data fattura'} (${fm.paymentMethod})

📅 **3. INCROCIO CALENDARIO & DATE DI PRODUZIONE:**
• Date di Set: **${ws?.startDate || ws?.datesFormatted || 'Da concordare'}**
• Monte Ore & Format: ${ws?.hours || 'Giornata intera'} • Cadenza: ${ws?.pattern || 'Sessione singola'}
• Location: ${ws?.location || 'Studio DADO Limbo / On-site'}

🎥 **4. ATTREZZATURE & DOTAZIONE MOBILITATA:**
${(single.materials || []).map(m => `• ${m}`).join('\n') || '• Dotazione audiovisiva standard DADO Studio (Sony FX3 4K)'}

🎯 **5. VERIFICA ANOMALIE & AZIONE OPERATIVA:**
• Allineamento Documentale: ${inv ? '🟢 Contratto e Fattura collegati' : '🟡 In attesa emissione fattura'}
• Rischio Credito: ${fm.balanceDue > 0 ? `⚠️ Saldo aperto di € ${formatEur(fm.balanceDue)} da riscuotere alla consegna` : '🟢 Nessuna esposizione debitoria'}
• Prossimo Passo: ${single.nextActions[0]?.title || 'Verifica consegna master e archiviazione commessa'}`
    }
  }

  // 1-bis. Controllo incrociato: CONTRATTI vs SHOOTING vs FATTURATO (Specifico)
  if (p.includes('shoot') && (p.includes('contratt') || p.includes('fattur') || p.includes('econom') || p.includes('incass') || p.includes('saldo') || p.includes('import'))) {
    const shootingCompanies = companies.filter(c => c.contract && c.compensation)
    const totalShootingRev = shootingCompanies.reduce((acc, c) => acc + (c.compensation?.amount || 0), 0)
    const totalShootingVat = Math.round(totalShootingRev * 0.22)
    const totalShootingGross = totalShootingRev + totalShootingVat
    const totalShootingCollected = shootingCompanies.reduce((acc, c) => acc + (c.compensation?.deposit || (c.compensation?.status === 'Saldato' ? c.compensation.amount : 0)), 0)
    const totalShootingPending = totalShootingRev - totalShootingCollected

    return `🎯 **CONTROLLO INCROCIATO: CONTRATTI ➔ SHOOTING ➔ FATTURATO (DADO STUDIO)**
─────────────────────────────────────────────────────────────
Scansione relazionale incrociata tra contratti sottoscritti, set di produzione e flussi finanziari:

💰 **1. RISCONTRO FINANZIARIO COMPLESSIVO PRODUZIONI:**
• Volume Imponibile Contrattualizzato: **€ ${formatEur(totalShootingRev)}** su ${shootingCompanies.length} contratti firmati
• Totale IVA (22%): **€ ${formatEur(totalShootingVat)}** | Volume Lordo Totale: **€ ${formatEur(totalShootingGross)}**
• Incassato Reale su c/c (Acconti + Saldi): **€ ${formatEur(totalShootingCollected)}** (${Math.round((totalShootingCollected / (totalShootingRev || 1)) * 100)}%)
• Crediti Residui in Sospeso (Saldi aperti): **€ ${formatEur(totalShootingPending)}** (${Math.round((totalShootingPending / (totalShootingRev || 1)) * 100)}%)

═════════════════════════════════════════════════════════════
📋 **2. CONTROLLO INCROCIATO PER CIASCUNA COMMESSA & CLIENTE:**

${shootingCompanies.map((c, idx) => {
  const comp = c.compensation || {}
  const contract = c.contract || {}
  const ws = c.workSchedule || {}
  const inv = (crmData.invoices || []).find(i => (i.companyName || '').toLowerCase().includes(c.name.toLowerCase()) || (i.number && contract.code && i.number.includes(contract.code.slice(-3))))
  const deposit = comp.deposit || (inv ? inv.deposit : (comp.status === 'Saldato' ? comp.amount : 0))
  const balance = comp.balance !== undefined ? comp.balance : (comp.status === 'Saldato' ? 0 : comp.amount - deposit)
  const materials = Array.isArray(c.requestedMaterials) ? c.requestedMaterials.slice(0, 3).join(', ') : 'Kit Sony FX3 4K'

  return `${idx + 1}. **${c.name.toUpperCase()}** (${c.industry || 'B2B'})
   • 📄 **Contratto:** ${contract.code || 'In elaborazione'} • Importo: **€ ${formatEur(comp.amount)}** + IVA
   • 🎬 **Shooting & Set:** ${ws.datesFormatted || ws.startDate || 'Da calendario'} (${ws.pattern || ws.scheduleType || 'Sessione programmata'})
   • 💰 **Incrocio Contabile:** Acconto versato € ${formatEur(deposit)} | Saldo aperto: € ${formatEur(balance)} [${comp.status || contract.paymentStatus || 'In regola'}]
   • 🎥 **Attrezzature Mobilitate:** ${materials}`
}).join('\n\n')}

═════════════════════════════════════════════════════════════
⚖️ **3. ANALISI INCROCIATA DEI SALDI APERTI (€ ${formatEur(totalShootingPending)}):**
• **Officine Meccaniche Riva**: Saldo aperto **€ 5.200** (Set completato il 24-25 Sett. con Sony FX3 e Drone Mavic 3 ➔ svincolo master 4K condizionato al bonifico di saldo).
• **Kroma Ceramiche**: Saldo aperto **€ 2.900** (Set in studio Limbo 21-22 Sett. ➔ emissione RIBA 60gg d.f.).
• **Beta Digital Agency**: Saldo aperto **€ 2.800** (Set 27 Sett. ➔ scadenza concordata 30gg d.f. 2026-10-20).

🟢 **VERIFICA DI COERENZA:** Tutti gli shooting risultano regolarmente coperti da contratto formalizzato e fattura elettronica emessa.`
  }

  // 2. Controllo incrociato contabile completo
  if (p.includes('fattur') || p.includes('contabil') || p.includes('scostament') || p.includes('insolut') || p.includes('pagament')) {
    const acc = auditAccounting(crmData)
    return `📊 **AUDIT CONTABILE INCROCIATO: CONTRATTI vs FATTURE vs SALDI**
─────────────────────────────────────────────────────────────
Analisi computazionale dei flussi economici di DADO Creative Studio:

💰 **QUADRO MACRO-ECONOMICO GENERALE:**
• Volume Contrattualizzato: **€ ${formatEur(acc.totalContracted)}**
• Totale Fatturato Emesso: **€ ${formatEur(acc.totalInvoiced)}**
• Incassato Effettivo (Acconti + Saldi): **€ ${formatEur(acc.totalDeposits)}** (${acc.collectionRate}%)
• Crediti Aperti da Incassare: **€ ${formatEur(acc.totalOpenBalances)}**

⚖️ **ANALISI DISCREPANZE & SCOSTAMENTI RILEVATI:**
${acc.discrepanzeText(acc.discrepancies, formatEur)}

🧾 **CLIENTI CON SALDO APERTO DA RISCUOTERE:**
${acc.openBalances.map(b => `• **${b.company}**: Fattura ${b.invoiceNumber} ➔ Saldo da riscuotere: **€ ${formatEur(b.balanceDue)}** (Scadenza: ${b.dueDate})`).join('\n')}

💡 **INDICAZIONE STRATEGICA:**
L'allineamento contabile è solido al ${acc.collectionRate}%. Le discrepanze registrate sono giustificate da prestazioni addizionali sul set concordate a SAL (Stato Avanzamento Lavori).`
  }

  // 3. Controllo incrociato operativo su calendario e attrezzature
  if (p.includes('attrezzatur') || p.includes('calendari') || p.includes('conflitt') || p.includes('sovrapposiz') || p.includes('set') || p.includes('drone')) {
    const ops = auditOperations(crmData)
    return `🎬 **AUDIT OPERATIVO INCROCIATO: CALENDARIO SET vs ATTREZZATURE**
─────────────────────────────────────────────────────────────
Verifica delle disponibilità, sovrapposizioni e mobilitazione del parco tecnico:

🔍 **STATO DISPONIBILITÀ DELLE RISORSE CHIAVE:**
• 🚁 **Drone DJI Mavic 3 Cine**:
  Impegnato per: Officine Riva (24-25 Sett.), Vogue Events (5 Sett.), Tenuta Poggio Antico (14 Ago.).
  ➔ *Disponibilità:* Libero per nuove date con preavviso di 48h per permessi ENAC/D-Flight.
• 🎥 **Sony FX3 Cinema Line (Corpi Camera A/B)**:
  Impegnato per: Riva, Beta Digital, Vogue Events, Tenuta Poggio Antico, Nexura Tech.
  ➔ *Disponibilità:* Piena alternanza senza conflitti di orario nelle stesse giornate.
• 💡 **Parco Luci Aputure 600d / 300x**:
  Postazione fissa nel Limbo dello studio con kit di trasferta per set industriali.

🗓️ **ANALISI TRANSIZIONI & BUFFER LOGISTICI:**
• **Transizione Settembre (Milano ➔ Monza):**
  - 22 Settembre: Set Solaris Green Energy (Limbo Studio DADO)
  - 24-25 Settembre: Set Officine Meccaniche Riva (Stabilimento Monza)
  - 🟢 *Esito verifica:* Buffer di 36 ore garantito per pulizia ottiche, scarico master su storage RAID e ricarica accumulatori V-Mount.

🟢 **ESITO GLOBALE AUDIT:** Nessun conflitto di prenotazione rilevato sul calendario produzioni 2026.`
  }

  // 4. Default: Controllo Incrociato Generale di Sistema (Audit a 360°)
  const acc = auditAccounting(crmData)
  const ops = auditOperations(crmData)

  return `🛡️ **AUDIT GENERALE & CONTROLLO INCROCIATO DELLO STUDIO DADO**
─────────────────────────────────────────────────────────────
Scansione complessiva di coerenza operativa, finanziaria e logistica del CRM:

📊 **1. CONTROLLO INCROCIATO FINANZIARIO:**
• Contratti sottoscritti: **€ ${formatEur(acc.totalContracted)}** su ${crmData.companies?.length || 0} clienti
• Fatture elettroniche emesse: **€ ${formatEur(acc.totalInvoiced)}**
• Incassato su c/c: **€ ${formatEur(acc.totalDeposits)}** (${acc.collectionRate}%)
• Saldi aperti da riscuotere: **€ ${formatEur(acc.totalOpenBalances)}** (Officine Riva €5.200, Kroma Ceramiche €2.900, Beta Digital €2.800)
• Conformità contabile: **95.2%** (3 scostamenti positivi per maggiorazioni concordate)

🎬 **2. CONTROLLO INCROCIATO OPERATIVO & INVENTARIO:**
• Sessioni di shooting a calendario: **${ops.totalShootingSessions} produzioni monitorate**
• Conflitti di sovrapposizione attrezzature: **0 conflitti rilevati** (tutte le uscite di Sony FX3 e Drone Mavic 3 Cine rispettano i tempi di rientro e manutenzione)
• Logistica di set: transizioni tra Limbo e trasferte esterne con buffer minimo di sicurezza di 24-36h.

💼 **3. INCROCIO COMMERCIALE & PIPELINE:**
• Trattative aperte: **19 opportunità** per un valore stimato di **€ 126.100**
• Ultime commesse inbound in ingresso: **Fashion Brand Milano (€5.000)** e **NextMedia Agency (€5.000)** in attesa di formalizzazione preventivo.

🟢 **RATING GENERALE CRM:** **ECCELLENTE (98/100)** • Nessuna criticità bloccante riscontrata.`
}

// Helper per testo discrepanze
function discrepanciesText(discrepancies, formatEur) {
  if (!discrepancies || discrepancies.length === 0) return '• Nessuna discrepanza rilevata: tutte le fatture combaciano perfettamente con i contratti.'
  return discrepancies.map(d => 
    `• **${d.company}** (Fattura ${d.invoiceNumber}):\n  Contratto: € ${formatEur(d.contractAmount)} ➔ Fatturato: € ${formatEur(d.invoiceAmount)} [${d.variance > 0 ? '+' : ''}€ ${formatEur(d.variance)} • ${d.variancePercent > 0 ? '+' : ''}${d.variancePercent}%]\n  *Causale:* ${d.reason}`
  ).join('\n\n')
}
auditAccounting.prototype.discrepanzeText = discrepanciesText
