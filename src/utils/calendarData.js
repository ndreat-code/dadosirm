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

export function getCalendarDayData(dateIso) {
  if (!dateIso) return null

  // 1. Controlla prima nel localStorage (modifiche utente)
  try {
    const saved = localStorage.getItem('dado_crm_calendar_store_v2')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed[dateIso]) {
        const entry = parsed[dateIso]
        const defaultEntry = DEFAULT_CALENDAR_SCHEDULE[dateIso]
        return {
          events: entry.events !== undefined ? entry.events : (defaultEntry?.events || []),
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
  if (DEFAULT_CALENDAR_SCHEDULE[dateIso]) {
    return DEFAULT_CALENDAR_SCHEDULE[dateIso]
  }

  // 3. Data non programmata (nessun impegno)
  return {
    tag: '',
    events: [],
    notes: '',
    files: []
  }
}

export function saveCalendarDayData(dateIso, updatedData) {
  try {
    let currentStore = {}
    const saved = localStorage.getItem('dado_crm_calendar_store_v2')
    if (saved) {
      currentStore = JSON.parse(saved)
    }
    const currentDay = currentStore[dateIso] || DEFAULT_CALENDAR_SCHEDULE[dateIso] || {}
    currentStore[dateIso] = {
      ...currentDay,
      ...updatedData
    }
    localStorage.setItem('dado_crm_calendar_store_v2', JSON.stringify(currentStore))
    window.dispatchEvent(new CustomEvent('dado-calendar-update', { detail: { dateIso } }))
    return true
  } catch (e) {
    console.warn('Errore salvataggio calendar store:', e)
    return false
  }
}
