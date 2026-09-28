// Gestore centralizzato e sincronizzato degli impegni e produzioni del Calendario DADO CRM
// Assicura congruenza totale al 100% tra Dashboard (Calendar Week) e sezione Calendario (/calendar)

export const DEFAULT_CALENDAR_SCHEDULE = {
  // Settimana precedente / fine Settembre
  '2026-09-24': {
    tag: 'Shooting & Set',
    events: [
      {
        time: '07:30 - 13:00',
        company: 'Officine Meccaniche Riva',
        location: 'Brescia - Stabilimento Riva (Via Industriale 14)',
        materials: 'Sony FX3, Drone DJI Mavic 3 Cine, Gimbal RS3 Pro, Ottiche Cine Prime 24/50mm',
        category: 'Shooting Day 1',
        title: 'Shooting video corporate linee robotizzate e precision tooling.'
      },
      {
        time: '14:30 - 18:00',
        company: 'Officine Meccaniche Riva',
        location: 'Brescia - Reparto Collaudo & Metrologia',
        materials: 'Sony FX3 + Sony A7 IV, Luci Nanlite 500W, Mic Sennheiser AVX',
        category: 'Interviste',
        title: 'Interviste responsabili produzione e b-roll tecnici.'
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
        time: '14:00 - 18:30',
        company: 'Officine Meccaniche Riva',
        location: 'Brescia - Stabilimento Riva & Area Testing',
        materials: 'Sony FX3, Gimbal DJI RS3 Pro, Schede CFexpress Type A, Stativi',
        category: 'Shooting Day 2',
        title: 'Giornata 2 riprese Riva, transcodifica ProRes 422 e backup doppio SSD T7.'
      },
      {
        time: '18:45 - 19:30',
        company: 'Solaris Green Energy',
        location: 'Milano - DADO Studio (Call Remota)',
        materials: 'Workstation Mac Studio M3 Max, Storyboard TV',
        category: 'Commerciale',
        title: 'Call allineamento revisione storyboard spot TV locale + Digital ADS.'
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
        time: '10:00 - 13:00',
        company: 'Alpha Studio Milano',
        location: 'Milano - Studio B (Via Tortona 15)',
        materials: 'Luxmetro Sekonic, Sony A7 IV, Fondali e stativi Avenger',
        category: 'Sopralluogo',
        title: 'Sopralluogo set luci studio B e test fondale per riprese moda autunno.'
      },
      {
        time: '14:30 - 17:00',
        company: 'Manutenzione Tecnica DADO',
        location: 'Milano - Laboratorio DADO Studio',
        materials: 'Sonda X-Rite i1Display, Monitor Atomos Ninja V, Ottiche Cine Prime',
        category: 'Manutenzione',
        title: 'Controllo calibrazione monitor e pulizia sensori e lenti.'
      }
    ],
    notes: 'Revisione preventivi in scadenza e controllo calibrazione monitor Atomos Ninja.',
    files: []
  },
  '2026-09-27': {
    tag: 'Live Event & Regia',
    events: [
      {
        time: '15:00 - 21:30',
        company: 'Vogue Events & Wedding',
        location: 'Firenze - Villa Cora (Viale Machiavelli 18)',
        materials: 'Sony FX3 + 2x Sony A7 IV, Gimbal RS3 Pro, Drone DJI Mavic 3 Cine, Audio Sennheiser',
        category: 'Regia Live',
        title: 'Setup riprese e regia matrimonio esclusivo Villa Cora con copertura aerea.'
      },
      {
        time: '22:00 - 23:30',
        company: 'Ingest & Backup Immediato',
        location: 'Postazione Mobile DADO',
        materials: 'MacBook Pro, 2x SSD SanDisk Extreme Pro 4TB',
        category: 'Archiviazione',
        title: 'Riversamento immediato schede di memoria e creazione copia master sicura.'
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
        time: '09:30 - 13:00',
        company: 'Alpha Studio Milano',
        location: 'Milano - Studio B (Via Tortona 15)',
        materials: 'Sony FX3, Kit Luci Nanlite Forza 500W, Softbox Octa 120, Stativi C-Stand',
        category: 'Pre-Prod & Shooting',
        title: 'Briefing nuova campagna ADV moda e shooting test moodboard FW26.'
      },
      {
        time: '14:30 - 17:30',
        company: 'Officine Meccaniche Riva',
        location: 'Milano - DADO Studio (Sala Post-Produzione)',
        materials: 'Workstation DaVinci Resolve Studio, Monitor Eizo ColorEdge, Speed Editor',
        category: 'Post-Prod',
        title: 'Consegna prima bozza montaggio spot video corporate e revisione cliente.'
      },
      {
        time: '18:00 - 19:15',
        company: 'Solaris Green Energy',
        location: 'Milano - Headquarter Solaris (Piazza Affari 4)',
        materials: 'MacBook Pro, Presentazione PDF, Campioni girato 4K HDR',
        category: 'Commerciale',
        title: 'Call allineamento preventivo corporate e approvazione piano riprese.'
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
        time: '09:00 - 13:30',
        company: 'Solaris Green Energy',
        location: 'Bergamo - Parco Fotovoltaico Solaris (Loc. Seriate)',
        materials: 'DJI Mavic 3 Cine, Sony FX3, Filtri ND PolarPro, Monitor Alta Luminosità',
        category: 'Shooting Esterno',
        title: 'Riprese aeree 4K HDR e b-roll tecnici per spot TV ed eco-sostenibilità.'
      },
      {
        time: '15:00 - 18:30',
        company: 'NextMedia Agency',
        location: 'Milano - DADO Creative Studio (Sala Montaggio)',
        materials: 'Postazione DaVinci Studio, Monitor Reference, Mixer Audio',
        category: 'Post-Produzione',
        title: 'Color grading e montaggio teaser spot social per campagne Instagram e TikTok.'
      }
    ],
    notes: 'Shooting parco fotovoltaico Solaris. Verificare NOTAM e autorizzazioni volo ENAC.',
    files: [
      { name: 'Piano_Volo_ENAC_Solaris.pdf', size: '1.4 MB', date: '29 Set 2026' }
    ]
  },
  '2026-09-30': {
    tag: 'Food Shooting & Sound Design',
    events: [
      {
        time: '10:00 - 14:00',
        company: 'Gusto & Tradizione Food',
        location: 'Milano - Cucina Lab & Studio (Corso Sempione 32)',
        materials: 'Sony FX3 + Sony A7 IV, Ottica Macro 90mm f/2.8, Ring Light LED, Sliders',
        category: 'Shooting Food',
        title: 'Shooting food styling e riprese 10 video ricette con chef stellato.'
      },
      {
        time: '16:00 - 19:00',
        company: 'Officine Meccaniche Riva',
        location: 'Milano - DADO Creative Studio (Cabina Regia Audio)',
        materials: 'Microfono Shure SM7B, Scheda Audio Apollo Twin X, Cuffie Beyerdynamic',
        category: 'Audio & Mix',
        title: 'Registrazione speakeraggio voce narrante istituzionale e sound design per spot.'
      }
    ],
    notes: 'Shooting ricette chef e finalizzazione audio Riva.',
    files: []
  },
  '2026-10-01': {
    tag: 'Shooting Day 2 & Backup',
    events: [
      {
        time: '08:30 - 14:00',
        company: 'Officine Meccaniche Riva',
        location: 'Brescia - Stabilimento Riva (Reparto Robotica)',
        materials: 'Sony FX3, Gimbal DJI RS3 Pro, Ottiche Cine Prime, Microfoni Wireless AVX',
        category: 'Shooting Industriale',
        title: 'Shooting linee robotizzate ad alta precisione e interviste dirigenti aziendali.'
      },
      {
        time: '15:30 - 18:30',
        company: 'Alpha Studio Milano',
        location: 'Milano - Hub Moda (Via Savona 55)',
        materials: 'MacBook Pro M3 Max, Disco LaCie Rugged 4TB, Cavi Tethering Pro',
        category: 'Verifica & Ingest',
        title: 'Verifica e selezione scatti digitali e backup ridondato su doppio SSD.'
      }
    ],
    notes: 'Shooting reparti robotici Riva e coordinamento con direzione Alpha Studio.',
    files: []
  },
  '2026-10-02': {
    tag: 'Shooting Executive & Sopralluogo',
    events: [
      {
        time: '09:30 - 13:00',
        company: 'Solaris Green Energy',
        location: 'Milano - Sede Centrale Solaris (Piazza Affari 4)',
        materials: 'Sony FX3, Gimbal DJI RS3 Pro, Luci Nanlite Pavotube, Mic Sennheiser AVX',
        category: 'Corporate Video',
        title: 'Intervista CEO e riprese executive board per bilancio di sostenibilità.'
      },
      {
        time: '14:30 - 18:30',
        company: 'Vogue Events & Wedding',
        location: 'Como - Villa del Balbianello (Tremezzina)',
        materials: 'Sony FX3, 2x Sony A7 IV, DJI RS3 Pro, Drone Mavic 3 Cine, Stativi C-Stand',
        category: 'Sopralluogo & Test',
        title: 'Sopralluogo tecnico location, test luce dorata lago e verifica piano di volo drone.'
      }
    ],
    notes: 'Sopralluogo lago di Como e intervista CEO Solaris.',
    files: [
      { name: 'Liberatoria_Location_Villa_Balbianello.pdf', size: '2.1 MB', date: '2 Ott 2026' }
    ]
  },
  '2026-10-03': {
    tag: 'Live Gala Shooting',
    events: [
      {
        time: '10:00 - 17:00',
        company: 'Vogue Events & Wedding',
        location: 'Como - Villa del Balbianello (Tremezzina)',
        materials: 'Kit Completo Cinema: FX3 + 2x A7 IV, RS3 Pro, Drone Mavic 3, Audio Rode Wireless Pro',
        category: 'Produzione Evento',
        title: 'Riprese video cinema 4K e scatti editoriali per gala wedding esclusivo internazionale.'
      }
    ],
    notes: 'Gala wedding Como: copertura continua da mattino a pomeriggio.',
    files: []
  },
  '2026-10-04': {
    tag: 'Archiviazione & Lab',
    events: [
      {
        time: '11:00 - 16:30',
        company: 'DADO Creative Studio',
        location: 'Milano - Studio DADO (Laboratorio Tecnico)',
        materials: 'Ingest Station, Doppio NAS Synology 10GbE, Caricabatterie Multipli, Kit Pulizia',
        category: 'Archivio & Service',
        title: 'Ingest totale schede di memoria, backup doppio ridondato e pulizia sensori e attrezzatura.'
      }
    ],
    notes: 'Riversamento master su server NAS e controllo integrità file video.',
    files: []
  }
}

// Generatore deterministico per date arbitrarie (così nessuna data è mai vuota o disallineata)
const GENERIC_COMPANIES = [
  { name: 'Officine Meccaniche Riva', loc: 'Brescia - Stabilimento Riva (Via Industriale 14)', mat: 'Sony FX3, Gimbal DJI RS3 Pro, Ottiche Cine Prime, Mic Sennheiser AVX' },
  { name: 'Alpha Studio Milano', loc: 'Milano - Studio B (Via Tortona 15)', mat: 'Sony FX3, Kit Luci Nanlite Forza 500W, Softbox Octa 120, Stativi' },
  { name: 'Solaris Green Energy', loc: 'Milano - Headquarter Solaris (Piazza Affari 4)', mat: 'DJI Mavic 3 Cine, Sony FX3, Filtri ND, Monitor Alta Luminosità' },
  { name: 'Gusto & Tradizione Food', loc: 'Milano - Cucina Lab (Corso Sempione 32)', mat: 'Sony FX3 + Sony A7 IV, Ottica Macro 90mm f/2.8, Ring Light LED' },
  { name: 'NextMedia Agency', loc: 'Milano - DADO Creative Studio (Sala Montaggio)', mat: 'Workstation DaVinci Resolve Studio, Monitor Eizo ColorEdge' },
  { name: 'Vogue Events & Wedding', loc: 'Como - Villa del Balbianello (Tremezzina)', mat: 'Kit Cinema: FX3 + A7 IV, RS3 Pro, Drone Mavic 3 Cine, Audio Wireless' }
]

export function getCalendarDayData(dateIso) {
  if (!dateIso) return null

  // 1. Controlla prima nel localStorage (modifiche apportate dall'utente in tempo reale)
  try {
    const saved = localStorage.getItem('dado_crm_calendar_store')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed[dateIso]) {
        // Se ha eventi salvati, usali; altrimenti unisci con default
        const entry = parsed[dateIso]
        const defaultEntry = DEFAULT_CALENDAR_SCHEDULE[dateIso]
        return {
          events: entry.events || defaultEntry?.events || generateFallbackEvents(dateIso),
          notes: entry.notes !== undefined ? entry.notes : (defaultEntry?.notes || ''),
          files: entry.files || defaultEntry?.files || [],
          tag: entry.tag || defaultEntry?.tag || 'Attività Programmate'
        }
      }
    }
  } catch (e) {
    console.warn('Errore lettura calendar store:', e)
  }

  // 2. Se è presente nei default curati
  if (DEFAULT_CALENDAR_SCHEDULE[dateIso]) {
    return DEFAULT_CALENDAR_SCHEDULE[dateIso]
  }

  // 3. Fallback realistico generato deterministicamente
  return {
    tag: 'Attività Programmate',
    events: generateFallbackEvents(dateIso),
    notes: 'Giornata di produzione e coordinamento commesse.',
    files: []
  }
}

function generateFallbackEvents(dateIso) {
  const [y, m, d] = dateIso.split('-').map(Number)
  const seed = (y * 372 + m * 31 + d) % GENERIC_COMPANIES.length
  const c1 = GENERIC_COMPANIES[seed]
  const c2 = GENERIC_COMPANIES[(seed + 2) % GENERIC_COMPANIES.length]

  return [
    {
      time: '09:30 - 13:00',
      company: c1.name,
      location: c1.loc,
      materials: c1.mat,
      category: 'Produzione',
      title: 'Shooting e riprese tecniche per produzione contenuti corporate.'
    },
    {
      time: '15:00 - 18:00',
      company: c2.name,
      location: c2.loc,
      materials: c2.mat,
      category: 'Post-Prod',
      title: 'Montaggio, color grading e revisione avanzamento commessa.'
    }
  ]
}

export function saveCalendarDayData(dateIso, updatedData) {
  try {
    let currentStore = {}
    const saved = localStorage.getItem('dado_crm_calendar_store')
    if (saved) {
      currentStore = JSON.parse(saved)
    }
    const currentDay = currentStore[dateIso] || DEFAULT_CALENDAR_SCHEDULE[dateIso] || {}
    currentStore[dateIso] = {
      ...currentDay,
      ...updatedData
    }
    localStorage.setItem('dado_crm_calendar_store', JSON.stringify(currentStore))
    window.dispatchEvent(new CustomEvent('dado-calendar-update', { detail: { dateIso } }))
    return true
  } catch (e) {
    console.warn('Errore salvataggio calendar store:', e)
    return false
  }
}
