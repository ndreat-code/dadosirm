// Utility per la gestione dinamica del calendario e della settimana corrente DADO CRM

const MONTH_NAMES_UPPER = [
  'GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO',
  'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'
]

const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
]

const DAY_NAMES_SHORT = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']
const DAY_NAMES_LONG = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
const DAY_LETTERS = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

// Restituisce la data odierna in formato YYYY-MM-DD
export function getTodayIso(refDate = new Date()) {
  const d = new Date(refDate)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Restituisce la data di domani in formato YYYY-MM-DD
export function getTomorrowIso(refDate = new Date()) {
  const d = new Date(refDate)
  d.setDate(d.getDate() + 1)
  return getTodayIso(d)
}

// Restituisce la domenica della settimana corrente in formato YYYY-MM-DD
export function getCurrentWeekSundayIso(refDate = new Date()) {
  const days = getCurrentWeekDays(refDate)
  return days[6]?.date || getTodayIso(refDate)
}

// Restituisce il nome del mese corrente in lettere maiuscole (es. "SETTEMBRE")
export function getCurrentMonthName(refDate = new Date()) {
  const d = new Date(refDate)
  return MONTH_NAMES_UPPER[d.getMonth()]
}

// Restituisce i 7 giorni della settimana corrente (da Lunedì a Domenica) con indicazione dinamica di isToday
export function getCurrentWeekDays(refDate = new Date()) {
  const d = new Date(refDate)
  const dayOfWeek = d.getDay()
  // In JS: 0 = Domenica, 1 = Lunedì, ..., 6 = Sabato
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const monday = new Date(d)
  monday.setDate(d.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const todayIso = getTodayIso(new Date())

  const days = []
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday)
    dayDate.setDate(monday.getDate() + i)
    const iso = getTodayIso(dayDate)
    const isToday = iso === todayIso
    const isSunday = i === 6

    days.push({
      letter: DAY_LETTERS[i],
      name: `${DAY_NAMES_LONG[i]} ${dayDate.getDate()}${isToday ? ' (Oggi)' : ''}`,
      date: iso,
      day: isToday ? 'today' : isSunday ? 'sunday' : DAY_NAMES_SHORT[i],
      shortDay: DAY_NAMES_SHORT[i],
      dayNum: dayDate.getDate(),
      monthNum: dayDate.getMonth(),
      monthName: MONTH_NAMES[dayDate.getMonth()],
      year: dayDate.getFullYear(),
      isToday,
      isSunday,
    })
  }
  return days
}

// Formatta una data ISO in testo italiano esteso (es. "Lunedì 28 Settembre 2026")
export function formatDayLong(dateIso) {
  if (!dateIso) return ''
  const parts = dateIso.split('-')
  if (parts.length !== 3) return dateIso
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
  if (isNaN(d.getTime())) return dateIso

  const dayOfWeek = d.getDay()
  const dayNameIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const dayName = DAY_NAMES_LONG[dayNameIndex] || ''
  const monthName = MONTH_NAMES[d.getMonth()] || ''
  const todayIso = getTodayIso(new Date())
  const isToday = dateIso === todayIso

  return `${dayName} ${d.getDate()} ${monthName} ${d.getFullYear()}${isToday ? ' (Oggi)' : ''}`
}
