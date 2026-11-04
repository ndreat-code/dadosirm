// Gestore centralizzato e sincronizzato degli impegni e produzioni del Calendario DADO CRM
// Assicura congruenza totale al 100% tra Dashboard (Calendar Week) e sezione Calendario (/calendar)

export const DEFAULT_CALENDAR_SCHEDULE = {
  // Settimana precedente / fine Settembre
  '2026-09-24': {
    tag: 'Shooting & Set',
    events: [
      {
        time: '07:30 - 18:00',
        company: 'Officine Meccaniche Riva',
        location: 'Brescia - Stabilimento Riva (Via Industriale 14)',
        materials: 'Sony FX3, Drone DJI Mavic 3 Cine, Gimbal RS3 Pro, Luci Nanlite 500W, Mic Sennheiser',
        people: 'Marco Riva (Resp. Produzione), Team Video DADO',
        category: 'Shooting Corporate',
        title: 'Shooting video corporate linee robotizzate e precision tooling con interviste e b-roll tecnici.'
      }
    ],
    notes: 'Shooting video corporate Officine Riva. Ritrovo alle 07:30 in studio per carico furgone. Drone + FX3.',
    files: [
      { name: 'Ordine_Produzione_Riva.pdf', size: '1.2 MB', date: '24 Set 2026' }
    ]
  },
  '2026-09-25': {
    tag: 'Shooting Day 2',
    events: [
      {
        time: '14:00 - 19:30',
        company: 'Officine Meccaniche Riva',
        location: 'Brescia - Stabilimento Riva & Area Testing',
        materials: 'Sony FX3, Gimbal DJI RS3 Pro, Schede CFexpress Type A, Doppio SSD T7',
        people: 'Ing. Elena Bossi, Team Post-Prod DADO',
        category: 'Shooting Day 2 & Backup',
        title: 'Giornata 2 riprese Riva, transcodifica master ProRes 422 e backup ridondato doppio SSD.'
      }
    ],
    notes: 'Giornata 2 riprese Riva (pomeriggio dalle 14:00). A seguire transcodifica ProRes 422 e backup su doppio SSD T7.',
    files: [
      { name: 'Piano_Riprese_Day2.pdf', size: '850 KB', date: '25 Set 2026' },
      { name: 'Liberatorie_Operai_signed.pdf', size: '2.4 MB', date: '25 Set 2026' }
    ]
  },
  '2026-09-26': {
    tag: 'Sopralluogo & Set',
    events: [
      {
        time: '10:00 - 16:30',
        company: 'Alpha Studio Milano',
        location: 'Milano - Studio B (Via Tortona 15)',
        materials: 'Luxmetro Sekonic, Sony A7 IV, Fondali e stativi Avenger, Monitor Atomos Ninja',
        people: 'Chiara Rossi (Art Director), Team Luci DADO',
        category: 'Sopralluogo & Set',
        title: 'Sopralluogo set luci studio B, test fondale per riprese moda autunno e calibrazione monitor.'
      }
    ],
    notes: 'Revisione preventivi in scadenza e controllo calibrazione monitor Atomos Ninja.',
    files: []
  },
  '2026-09-27': {
    tag: 'Live Event & Regia',
    events: [
      {
        time: '15:00 - 23:00',
        company: 'Vogue Events & Wedding',
        location: 'Firenze - Villa Cora (Viale Machiavelli 18)',
        materials: 'Sony FX3 + 2x Sony A7 IV, Gimbal RS3 Pro, Drone DJI Mavic 3 Cine, Audio Sennheiser',
        people: 'Valentina Neri (Event Manager), Regia DADO',
        category: 'Regia Live & Evento',
        title: 'Setup riprese e regia matrimonio esclusivo Villa Cora con copertura aerea e riversamento master.'
      }
    ],
    notes: 'Setup riprese matrimonio Villa Cora ore 15:00. Attrezzatura completa con drone autorizzato.',
    files: []
  },

  // Settimana corrente: 28 Settembre - 4 Ottobre 2026
  '2026-09-28': {
    tag: 'Riprese & Pre-Prod',
    events: [
      {
        time: '09:30 - 16:00',
        company: 'Alpha Studio Milano',
        location: 'Milano - Studio B (Via Tortona 15)',
        materials: 'Sony FX3, Kit Luci Nanlite Forza 500W, Softbox Octa 120, Stativi C-Stand',
        people: 'Chiara Rossi (Direzione Creativa), Team Produzione DADO',
        category: 'Campagna ADV Moda',
        title: 'Shooting campagna ADV moda autunno, test moodboard FW26 e revisione prima bozza video.'
      }
    ],
    notes: 'Briefing con Alpha Studio Milano per nuova campagna autunno moda e verifica consegna bozza Riva.',
    files: [
      { name: 'Moodboard_Alpha_FW26.pdf', size: '4.8 MB', date: '28 Set 2026' }
    ]
  },
  '2026-09-29': {
    tag: 'Shooting Aereo & Drone',
    events: [
      {
        time: '09:00 - 15:30',
        company: 'Solaris Green Energy',
        location: 'Bergamo - Parco Fotovoltaico Solaris (Loc. Seriate)',
        materials: 'DJI Mavic 3 Cine, Sony FX3, Filtri ND PolarPro, Monitor Alta Luminosità',
        people: 'Ing. Luca Fontana (Solaris), Pilota Drone DADO',
        category: 'Shooting Aereo & Drone',
        title: 'Riprese aeree 4K HDR e b-roll tecnici per spot TV ed eco-sostenibilità.'
      }
    ],
    notes: 'Shooting parco fotovoltaico Solaris. Verificare NOTAM e autorizzazioni volo ENAC.',
    files: [
      { name: 'Piano_Volo_ENAC_Solaris.pdf', size: '1.4 MB', date: '29 Set 2026' }
    ]
  },
  '2026-09-30': {
    tag: 'Food Shooting & Audio',
    events: [
      {
        time: '10:00 - 14:00',
        company: 'Gusto & Tradizione Food',
        location: 'Milano - Cucina Lab & Studio (Corso Sempione 32)',
        materials: 'Sony FX3 + Sony A7 IV, Ottica Macro 90mm f/2.8, Ring Light LED, Sliders',
        people: 'Chef Marco Bianchi, Operatore DADO',
        category: 'Shooting Food',
        title: 'Shooting food styling e riprese 10 video ricette con chef stellato.'
      },
      {
        time: '16:00 - 19:00',
        company: 'Officine Meccaniche Riva',
        location: 'Milano - DADO Studio (Cabina Regia Audio)',
        materials: 'Microfono Shure SM7B, Scheda Audio Apollo Twin X, Cuffie Beyerdynamic',
        people: 'Voice Talent, Fonico DADO',
        category: 'Audio & Mix',
        title: 'Registrazione speakeraggio voce narrante e sound design spot corporate.'
      }
    ],
    notes: 'Shooting ricette chef e finalizzazione audio Riva.',
    files: []
  },
  '2026-10-01': {
    tag: 'Shooting Industriale',
    events: [
      {
        time: '08:30 - 16:30',
        company: 'Officine Meccaniche Riva',
        location: 'Brescia - Stabilimento Riva (Reparto Robotica)',
        materials: 'Sony FX3, Gimbal DJI RS3 Pro, Ottiche Cine Prime, Microfoni Wireless AVX',
        people: 'Direttore Stabilimento, Team Video DADO',
        category: 'Shooting Industriale',
        title: 'Shooting linee robotizzate ad alta precisione e interviste dirigenti aziendali.'
      }
    ],
    notes: 'Shooting reparti robotici Riva e coordinamento con direzione Alpha Studio.',
    files: []
  },
  '2026-10-02': {
    tag: 'Corporate Video',
    events: [
      {
        time: '09:30 - 16:00',
        company: 'Solaris Green Energy',
        location: 'Milano - Sede Centrale Solaris (Piazza Affari 4)',
        materials: 'Sony FX3, Gimbal DJI RS3 Pro, Luci Nanlite Pavotube, Mic Sennheiser AVX',
        people: 'CEO Solaris, Team DADO Studio',
        category: 'Corporate Video',
        title: 'Intervista CEO e riprese executive board per bilancio di sostenibilità aziendale.'
      }
    ],
    notes: 'Sopralluogo lago di Como e intervista CEO Solaris.',
    files: [
      { name: 'Liberatoria_Location_Villa_Balbianello.pdf', size: '2.1 MB', date: '2 Ott 2026' }
    ]
  },
  '2026-10-03': {
    tag: 'Nessun impegno',
    events: [],
    notes: '',
    files: []
  },
  '2026-10-04': {
    tag: 'Nessun impegno',
    events: [],
    notes: '',
    files: []
  }
}

// ── Attività e Task Iniziali del CRM DADO (Sincronizzate automaticamente sul Calendario) ──
export const INITIAL_CRM_ACTIVITIES = [
  {
    id: 'act-1790554500409-835',
    company: 'Alpha Studio Milano',
    title: 'Verifica disponibilità e conferma call per Alpha Studio Milano',
    type: 'commercial',
    date: '2026-09-28',
    time: '11:00',
    period: 'Oggi',
    due: 'today',
    priority: 'weeks_2_3',
    completed: false,
    status: 'completed',
    assignedTo: 'Chiara Rossi / Team DADO',
    notes: 'Richiesta rilevata da Alpha Studio Milano per Pianificazione call tecnica e coordinamento studio.'
  },
  {
    id: 'act-1790554320431-474',
    company: 'Fashion Brand Milano',
    title: 'Archiviazione trattativa e riscontro cordiale a Fashion Brand Milano',
    type: 'postprod',
    date: '2026-09-28',
    time: '11:00',
    period: 'In settimana',
    due: 'upcoming',
    priority: 'month_1',
    completed: false,
    status: 'completed',
    assignedTo: 'Matteo Colombo / Team Post-Prod',
    notes: 'Richiesta rilevata da Fashion Brand Milano per Produzione contenuti audiovisivi.'
  },
  {
    id: 'act-1790554260723-928',
    company: 'Officine Meccaniche Riva',
    title: 'Avvio produzione e piano riprese con Officine Meccaniche Riva',
    type: 'postprod',
    date: '2026-09-28',
    time: '11:00',
    period: 'In settimana',
    due: 'upcoming',
    priority: 'week_1',
    completed: false,
    status: 'completed',
    assignedTo: 'Ing. Marco Riva / Team Video DADO',
    notes: 'Richiesta rilevata da Officine Meccaniche Riva per Shooting video corporate stabilimento con drone 4K. Budget: € 9.200.'
  },
  {
    id: 'act-1790554140763-489',
    company: 'NextMedia Agency',
    title: 'Invio portfolio e presentazione commerciale a NextMedia Agency',
    type: 'postprod',
    date: '2026-09-28',
    time: '11:00',
    period: 'In settimana',
    due: 'upcoming',
    priority: 'week_1',
    completed: false,
    status: 'completed',
    assignedTo: 'Sara Moretti / Commerciale',
    notes: 'Richiesta rilevata da NextMedia Agency per Shooting video corporate stabilimento con drone 4K.'
  },
  {
    id: 'act-1790554083520-169',
    company: 'Solaris Green Energy',
    title: 'Predisporre bozza preventivo dettagliato per Solaris Green Energy',
    type: 'postprod',
    date: '2026-09-28',
    time: '11:00',
    period: 'In settimana',
    due: 'upcoming',
    priority: 'urgent_3d',
    completed: false,
    status: 'pending',
    assignedTo: 'Elena Fontana / Team DADO',
    notes: 'Revisione economica e contrattuale spot TV HDR. Budget: € 14.500.'
  },
  {
    id: 'act-1790544428466-999',
    company: 'Alpha Studio Milano',
    title: 'Sopralluogo studio per calibrazione monitor e luci',
    type: 'postprod',
    date: '2026-09-27',
    time: '16:30',
    period: 'In settimana',
    due: 'upcoming',
    priority: 'urgent_3d',
    completed: false,
    status: 'pending',
    assignedTo: 'Chiara Rossi (Studio Lead)',
    notes: 'Test set luci e calibrazione monitor Atomos Ninja. Budget € 6.000 - 15.000.'
  },
  {
    id: 'act-1790544188584-101',
    company: 'Vogue Events & Wedding',
    title: 'Setup riprese e regia matrimonio Villa Cora',
    type: 'postprod',
    date: '2026-09-27',
    time: '16:30',
    period: 'In settimana',
    due: 'upcoming',
    priority: 'weeks_2_3',
    completed: false,
    status: 'pending',
    assignedTo: 'Giorgio Villa (Event Director)',
    notes: 'Riprese multicam gala & audio wireless Sennheiser. Budget € 6.000.'
  },
  {
    id: 'act-1790544128367-789',
    company: 'Officine Meccaniche Riva',
    title: 'Call conferma preventivo corporate (€ 9.200) in scadenza',
    type: 'commercial',
    date: '2026-09-27',
    time: '16:30',
    period: 'Oggi',
    due: 'today',
    priority: 'urgent_3d',
    completed: false,
    status: 'pending',
    assignedTo: 'Marco B. (Video Editor)',
    notes: 'Shooting video corporate stabilimento con drone 4K HDR. Budget: € 9.200.'
  },
  {
    id: 'act-1790543951529-802',
    company: 'Solaris Green Energy',
    title: 'Inviare revisione storyboard spot TV locale + Digital ADS',
    type: 'postprod',
    date: '2026-09-27',
    time: '16:30',
    period: 'In settimana',
    due: 'upcoming',
    priority: 'week_1',
    completed: false,
    status: 'pending',
    assignedTo: 'Elena Fontana (Direzione Marketing)',
    notes: 'Revisione storyboard e montaggio spot TV. Budget: € 14.500.'
  },
  {
    id: 'act-1',
    period: 'Oggi',
    company: 'Officine Meccaniche Riva',
    title: 'Call conferma preventivo corporate',
    type: 'commercial',
    date: '2026-09-25',
    time: '16:30',
    due: 'today',
    priority: 'high',
    status: 'pending',
    assignedTo: 'DaT. (Amministratore)',
    notes: "Verificare se l'ing. Riva ha approvato l'integrazione per le riprese drone all'interno dello stabilimento (valore € 9.200)."
  },
  {
    id: 'act-2',
    period: 'Oggi',
    company: 'Solaris Green Energy',
    title: 'Inviare revisione storyboard spot',
    type: 'postprod',
    date: '2026-09-25',
    time: '18:00',
    due: 'today',
    priority: 'high',
    status: 'pending',
    assignedTo: 'Laura R. (Production Manager)',
    notes: 'Esportare animazione bozza in 16:9 e 9:16 su Frame.io/Drive con timecode per note del cliente.'
  },
  {
    id: 'act-3',
    period: 'Domani',
    company: 'Alpha Studio Milano',
    title: 'Sopralluogo set luci studio B',
    type: 'shooting',
    date: '2026-09-26',
    time: '10:00',
    due: 'tomorrow',
    priority: 'medium',
    status: 'completed',
    assignedTo: 'Team Luci DADO',
    notes: 'Testare diffusione softbox Octa 120cm con Aputure 600d su limbo per lookbook moda autunno.'
  },
  {
    id: 'act-4',
    period: 'Domenica',
    company: 'Vogue Events & Wedding',
    title: 'Setup riprese matrimonio Villa Cora',
    type: 'shooting',
    date: '2026-09-28',
    time: '15:00',
    due: 'upcoming',
    priority: 'high',
    status: 'pending',
    assignedTo: 'Regia DADO',
    notes: 'Allestimento cabina regia mobile, verifica segnale wireless video e sincronizzazione audio con cerimonia.'
  },
  {
    id: 'act-6',
    period: 'Martedì',
    company: 'Gusto & Tradizione Food',
    title: 'Sollecito saldo acconto 30%',
    type: 'admin',
    date: '2026-09-30',
    time: '14:00',
    due: 'upcoming',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'Amministrazione DADO',
    notes: 'Contratto DADO-CTR-2026-081 siglato. In attesa della contabile di bonifico per confermare la data di shooting culinario.'
  },
  {
    id: 'act-7',
    period: 'Completata',
    company: 'Nexura Tech Solutions',
    title: 'Demo Reel AI e Motion Graphics',
    type: 'commercial',
    date: '2026-09-24',
    time: '17:00',
    due: 'past',
    priority: 'medium',
    status: 'completed',
    assignedTo: 'Commerciale DADO',
    notes: 'Presentazione video riuscita con ottimo riscontro da parte del CEO per la fiera di novembre.'
  }
]

// Mappatura leggibile delle categorie di attività
export function formatActivityCategory(type) {
  switch (type) {
    case 'shooting':
      return 'Shooting & Set'
    case 'commercial':
      return 'Commerciale & Call'
    case 'postprod':
      return 'Post-Produzione & Consegne'
    case 'admin':
      return 'Amministrazione & Contratti'
    default:
      return type ? (type.charAt(0).toUpperCase() + type.slice(1)) : 'Attività CRM'
  }
}

// Verifica se una data ISO (YYYY-MM-DD) corrisponde all'attività
export function doesActivityMatchDate(act, dateIso) {
  if (!act || !dateIso) return false
  const targetDate = act.date || act.dueDate
  if (targetDate === dateIso) return true
  if (act.createdAt && typeof act.createdAt === 'string' && act.createdAt.slice(0, 10) === dateIso) {
    if (!act.date && !act.dueDate) return true
  }
  return false
}

// Converte un'attività CRM in un evento compatibile con il Calendario
export function convertActivityToCalendarEvent(act) {
  const isCompleted = act.status === 'completed' || act.completed === true
  const timeStr = act.time || act.dueTime || '10:00'
  const categoryLabel = formatActivityCategory(act.type)

  return {
    id: act.id,
    activityId: act.id,
    isCrmActivity: true,
    time: timeStr,
    company: act.company || 'Generale / Studio',
    title: act.title || 'Attività CRM programmata',
    category: categoryLabel,
    type: act.type || 'commercial',
    people: act.assignedTo || 'Team DADO',
    attendees: act.assignedTo || 'Team DADO',
    location: act.location || (act.type === 'shooting' ? 'Set DADO Studio / Esterno' : 'Studio DADO / Remote'),
    materials: act.materials || '',
    notes: act.notes || (Array.isArray(act.checklist) && act.checklist.length > 0 ? act.checklist.join(' • ') : ''),
    status: isCompleted ? 'Completata' : 'In programma',
    completed: isCompleted,
    priority: act.priority || 'medium',
    rawActivity: act
  }
}

// Calcola i minuti dall'inizio della giornata per ordinare cronologicamente
function parseTimeForSort(timeStr) {
  if (!timeStr) return 999
  const match = timeStr.match(/(\d{1,2}):(\d{2})/)
  if (match) {
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10)
  }
  return 999
}

// Helpers sicuri per lettura e scrittura storage
function getFromStorage(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key)
    }
  } catch (e) {
    console.warn(`Errore lettura storage [${key}]:`, e)
  }
  return null
}

function setToStorage(key, value) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value)
      return true
    }
  } catch (e) {
    console.warn(`Errore scrittura storage [${key}]:`, e)
  }
  return false
}

// Sincronizza l'elenco delle attività salvandole nella cache locale ed emettendo evento
export function syncCrmActivitiesToCalendar(activities) {
  try {
    if (Array.isArray(activities)) {
      setToStorage('dado_crm_activities_cache', JSON.stringify(activities))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dado-calendar-update', { detail: { activitiesCount: activities.length } }))
      }
    }
  } catch (e) {
    console.warn('Errore syncCrmActivitiesToCalendar:', e)
  }
}

// ── Recupero unificato della giornata con fusione automatica di impegni ed attività CRM ──
export function getCalendarDayData(dateIso, customActivities = null) {
  if (!dateIso) return null

  let baseData = null

  // 1. Controlla prima nel localStorage (modifiche manuali al calendario)
  try {
    const saved = getFromStorage('dado_crm_calendar_store_v2')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed[dateIso]) {
        const entry = parsed[dateIso]
        const defaultEntry = DEFAULT_CALENDAR_SCHEDULE[dateIso]
        baseData = {
          events: entry.events !== undefined ? [...entry.events] : (defaultEntry?.events ? [...defaultEntry.events] : []),
          notes: entry.notes !== undefined ? entry.notes : (defaultEntry?.notes || ''),
          files: entry.files || defaultEntry?.files || [],
          tag: entry.tag || defaultEntry?.tag || ''
        }
      }
    }
  } catch (e) {
    console.warn('Errore lettura calendar store:', e)
  }

  // 2. Se è presente nei default curati
  if (!baseData) {
    if (DEFAULT_CALENDAR_SCHEDULE[dateIso]) {
      const def = DEFAULT_CALENDAR_SCHEDULE[dateIso]
      baseData = {
        events: def.events ? [...def.events] : [],
        notes: def.notes || '',
        files: def.files ? [...def.files] : [],
        tag: def.tag || ''
      }
    } else {
      baseData = {
        tag: '',
        events: [],
        notes: '',
        files: []
      }
    }
  }

  // 3. Recupera tutte le attività CRM (da parametro, da cache localStorage o fallback iniziale)
  let activitiesList = []
  if (Array.isArray(customActivities) && customActivities.length > 0) {
    activitiesList = customActivities
  } else {
    try {
      const cached = getFromStorage('dado_crm_activities_cache')
      if (cached) {
        activitiesList = JSON.parse(cached)
      } else {
        activitiesList = INITIAL_CRM_ACTIVITIES
      }
    } catch (e) {
      activitiesList = INITIAL_CRM_ACTIVITIES
    }
  }

  // 4. Seleziona le attività corrispondenti alla data richiesta
  const matchingActivities = (activitiesList || []).filter(act => doesActivityMatchDate(act, dateIso))

  // 5. Converti e fondi le attività con gli eventi della giornata (evitando duplicazioni per id o titolo)
  const existingTitles = new Set(baseData.events.map(e => (e.title || '').trim().toLowerCase()))
  const existingIds = new Set(baseData.events.map(e => e.id || e.activityId).filter(Boolean))

  const activityEvents = []
  for (const act of matchingActivities) {
    if (existingIds.has(act.id)) continue
    if (act.title && existingTitles.has(act.title.trim().toLowerCase())) continue

    const ev = convertActivityToCalendarEvent(act)
    activityEvents.push(ev)
  }

  const allEvents = [...baseData.events, ...activityEvents].sort((a, b) => {
    return parseTimeForSort(a.time) - parseTimeForSort(b.time)
  })

  // Se la giornata non aveva tag esplicito ma contiene attività o eventi, imposta un tag appropriato
  let resolvedTag = baseData.tag
  if (!resolvedTag && allEvents.length > 0) {
    resolvedTag = allEvents[0].category || 'Attività CRM'
  }

  return {
    ...baseData,
    events: allEvents,
    crmActivities: matchingActivities,
    tag: resolvedTag
  }
}

export function saveCalendarDayData(dateIso, updatedData) {
  try {
    let currentStore = {}
    const saved = getFromStorage('dado_crm_calendar_store_v2')
    if (saved) {
      currentStore = JSON.parse(saved)
    }
    const currentDay = currentStore[dateIso] || DEFAULT_CALENDAR_SCHEDULE[dateIso] || {}
    currentStore[dateIso] = {
      ...currentDay,
      ...updatedData
    }
    setToStorage('dado_crm_calendar_store_v2', JSON.stringify(currentStore))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dado-calendar-update', { detail: { dateIso } }))
    }
    return true
  } catch (e) {
    console.warn('Errore salvataggio calendar store:', e)
    return false
  }
}
