import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getTodayIso, getTomorrowIso, getCurrentWeekSundayIso } from '../utils/dateUtils'
import {
  Calendar as CalendarIcon,
  Paperclip,
  FileText,
  Trash2,
  Clock,
  Check,
  Download,
  StickyNote,
  X,
  UploadCloud,
  Folder,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// Nomi dei mesi e dei giorni in italiano
const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
]
const DAY_NAMES_SHORT = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM']
const DAY_NAMES_LONG = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

// Dati iniziali realistici DADO Creative Studio
const INITIAL_CALENDAR_DATA = {
  '2026-09-24': {
    notes: 'Shooting video corporate Officine Riva. Ritrovo alle 07:30 in studio per carico furgone. Drone + FX3.',
    files: [
      { name: 'Ordine_Produzione_Riva.pdf', size: '1.2 MB', date: '24 Set 2026' }
    ]
  },
  '2026-09-25': {
    notes: 'Giornata 2 riprese Riva (pomeriggio dalle 14:00). A seguire transcodifica ProRes 422 e backup su doppio SSD T7.',
    files: [
      { name: 'Piano_Riprese_Day2.pdf', size: '850 KB', date: '25 Set 2026' },
      { name: 'Liberatorie_Operai_signed.pdf', size: '2.4 MB', date: '25 Set 2026' }
    ]
  },
  '2026-09-26': {
    notes: 'Revisione preventivi in scadenza e controllo calibrazione monitor Atomos Ninja.',
    files: []
  },
  '2026-09-28': {
    notes: 'Briefing con Alpha Studio Milano per nuova campagna autunno moda.',
    files: [
      { name: 'Moodboard_Alpha_FW26.pdf', size: '4.8 MB', date: '28 Set 2026' }
    ]
  }
}

export default function Calendar() {
  const [searchParams] = useSearchParams()
  // Data di riferimento dinamica (se query param date=YYYY-MM-DD usa quella, altrimenti usa oggi)
  const [currentDate, setCurrentDate] = useState(() => {
    const dParam = searchParams.get('date')
    if (dParam && /^\d{4}-\d{2}-\d{2}$/.test(dParam)) {
      const parsed = new Date(`${dParam}T10:00:00`)
      if (!isNaN(parsed.getTime())) return parsed
    }
    return new Date()
  })
  const [highlightedDayIso, setHighlightedDayIso] = useState(null)

  // Database locale persistente
  const [calendarStore, setCalendarStore] = useState(() => {
    try {
      const saved = localStorage.getItem('dado_crm_calendar_store')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Errore lettura localStorage calendario', e)
    }
    return INITIAL_CALENDAR_DATA
  })

  useEffect(() => {
    try {
      localStorage.setItem('dado_crm_calendar_store', JSON.stringify(calendarStore))
    } catch (e) {
      console.warn('Errore salvataggio localStorage calendario', e)
    }
  }, [calendarStore])

  const [selectedDayModal, setSelectedDayModal] = useState(null)
  const [editingNote, setEditingNote] = useState('')

  // Calcola i 7 giorni della settimana corrente (da Lunedì a Domenica) con isToday dinamico
  const currentWeekDays = useMemo(() => {
    const d = new Date(currentDate)
    const dayOfWeek = d.getDay()
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

    const monday = new Date(d)
    monday.setDate(d.getDate() + diffToMonday)
    monday.setHours(0, 0, 0, 0)

    const todayIso = getTodayIso()

    const days = []
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday)
      dayDate.setDate(monday.getDate() + i)
      const iso = dayDate.toISOString().split('T')[0]
      days.push({
        dateObj: dayDate,
        iso,
        dayNum: dayDate.getDate(),
        monthNum: dayDate.getMonth(),
        year: dayDate.getFullYear(),
        shortName: DAY_NAMES_SHORT[i],
        longName: DAY_NAMES_LONG[i],
        isToday: iso === todayIso,
      })
    }
    return days
  }, [currentDate])

  const activeMonthIndex = currentWeekDays[3]?.monthNum ?? currentDate.getMonth()
  const activeYear = currentWeekDays[3]?.year ?? currentDate.getFullYear()

  // Navigazione Settimana
  function handlePrevWeek() {
    setCurrentDate((prev) => {
      const n = new Date(prev)
      n.setDate(n.getDate() - 7)
      return n
    })
  }

  function handleNextWeek() {
    setCurrentDate((prev) => {
      const n = new Date(prev)
      n.setDate(n.getDate() + 7)
      return n
    })
  }

  function handleToday() {
    setCurrentDate(new Date())
    setHighlightedDayIso(getTodayIso())
  }

  // Cambio mese
  function handleSelectMonth(monthIndex) {
    setCurrentDate((prev) => {
      const n = new Date(prev)
      n.setMonth(monthIndex)
      return n
    })
  }

  // Apertura editor giorno
  function openDayEditor(dayInfo) {
    const existing = calendarStore[dayInfo.iso] || { notes: '', files: [] }
    setEditingNote(existing.notes || '')
    setSelectedDayModal({ ...dayInfo, data: existing })
  }

  // Gestione apertura automatica giorno da collegamenti (Dashboard Next Actions, ecc.)
  useEffect(() => {
    const dayParam = searchParams.get('day')?.toLowerCase()
    const dateParam = searchParams.get('date')

    let targetIso = null

    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      targetIso = dateParam
    } else if (dayParam) {
      if (dayParam === 'today' || dayParam === 'oggi') {
        targetIso = getTodayIso()
      } else if (dayParam === 'tomorrow' || dayParam === 'domani') {
        targetIso = getTomorrowIso()
      } else if (dayParam === 'sunday' || dayParam === 'domenica') {
        targetIso = getCurrentWeekSundayIso()
      }
    }

    if (targetIso) {
      const targetDateObj = new Date(`${targetIso}T10:00:00`)
      setCurrentDate(targetDateObj)

      const dayOfWeek = targetDateObj.getDay()
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1

      const dayInfo = {
        dateObj: targetDateObj,
        iso: targetIso,
        dayNum: targetDateObj.getDate(),
        monthNum: targetDateObj.getMonth(),
        year: targetDateObj.getFullYear(),
        shortName: DAY_NAMES_SHORT[dayIndex],
        longName: DAY_NAMES_LONG[dayIndex],
        isToday: targetIso === getTodayIso(),
      }

      setHighlightedDayIso(targetIso)
      openDayEditor(dayInfo)
    }
  }, [searchParams])

  // Salvataggio nota
  function saveNoteForDay() {
    if (!selectedDayModal) return
    const iso = selectedDayModal.iso
    const current = calendarStore[iso] || { notes: '', files: [] }
    const updated = {
      ...current,
      notes: editingNote.trim()
    }
    setCalendarStore((prev) => ({
      ...prev,
      [iso]: updated
    }))
    setSelectedDayModal((prev) => ({ ...prev, data: updated }))
  }

  // Aggiunta file
  function handleFileUpload(e) {
    if (!e.target.files || !e.target.files[0] || !selectedDayModal) return
    const file = e.target.files[0]
    const iso = selectedDayModal.iso
    const current = calendarStore[iso] || { notes: '', files: [] }

    const newFileEntry = {
      name: file.name,
      size: (file.size / 1024 > 1024)
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`,
      date: new Date().toLocaleDateString('it-IT')
    }

    const updated = {
      ...current,
      files: [...(current.files || []), newFileEntry]
    }

    setCalendarStore((prev) => ({
      ...prev,
      [iso]: updated
    }))
    setSelectedDayModal((prev) => ({ ...prev, data: updated }))
    e.target.value = ''
  }

  // Elimina file
  function handleDeleteFile(fileName) {
    if (!selectedDayModal) return
    const iso = selectedDayModal.iso
    const current = calendarStore[iso] || { notes: '', files: [] }
    const updated = {
      ...current,
      files: (current.files || []).filter(f => f.name !== fileName)
    }
    setCalendarStore((prev) => ({
      ...prev,
      [iso]: updated
    }))
    setSelectedDayModal((prev) => ({ ...prev, data: updated }))
  }

  // Navigazione giorno successivo (+1) o precedente (-1) con tastiera o pulsanti
  function navigateDay(direction) {
    const currentIso = selectedDayModal?.iso || highlightedDayIso || getTodayIso()
    const [year, month, day] = currentIso.split('-').map(Number)
    const targetDate = new Date(year, month - 1, day)
    targetDate.setDate(targetDate.getDate() + direction)

    const nextIso = [
      targetDate.getFullYear(),
      String(targetDate.getMonth() + 1).padStart(2, '0'),
      String(targetDate.getDate()).padStart(2, '0')
    ].join('-')

    const dayOfWeek = targetDate.getDay()
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1

    const newDayInfo = {
      dateObj: targetDate,
      iso: nextIso,
      dayNum: targetDate.getDate(),
      monthNum: targetDate.getMonth(),
      year: targetDate.getFullYear(),
      shortName: DAY_NAMES_SHORT[dayIndex],
      longName: DAY_NAMES_LONG[dayIndex],
      isToday: nextIso === getTodayIso(),
    }

    // Se il giorno è al di fuori della settimana corrente visualizzata, sposta la settimana
    setCurrentDate((prev) => {
      const prevMonday = new Date(prev)
      const dayOfWeekPrev = prevMonday.getDay()
      const diffToMonday = dayOfWeekPrev === 0 ? -6 : 1 - dayOfWeekPrev
      prevMonday.setDate(prevMonday.getDate() + diffToMonday)
      prevMonday.setHours(0, 0, 0, 0)

      const prevSunday = new Date(prevMonday)
      prevSunday.setDate(prevMonday.getDate() + 6)
      prevSunday.setHours(23, 59, 59, 999)

      if (targetDate < prevMonday || targetDate > prevSunday) {
        return new Date(targetDate)
      }
      return prev
    })

    setHighlightedDayIso(nextIso)

    // Se l'editor del giorno è aperto, aggiorna anche il modale salvando le note correnti
    if (selectedDayModal) {
      const prevIso = selectedDayModal.iso
      let currentStoreState = calendarStore
      if (editingNote !== undefined) {
        currentStoreState = {
          ...currentStoreState,
          [prevIso]: {
            ...(currentStoreState[prevIso] || { files: [] }),
            notes: editingNote.trim()
          }
        }
        setCalendarStore(currentStoreState)
      }

      const existingData = currentStoreState[nextIso] || { notes: '', files: [] }
      setEditingNote(existingData.notes || '')
      setSelectedDayModal({ ...newDayInfo, data: existingData })
    }
  }

  // Listener frecce direzionali tastiera (← / →) per muoversi tra i giorni
  useEffect(() => {
    function handleKeyDown(e) {
      const tag = document.activeElement?.tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA'

      // Se non stiamo digitando dentro un campo testo, navighiamo tra i giorni
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !isInput) {
        e.preventDefault()
        navigateDay(e.key === 'ArrowLeft' ? -1 : 1)
      } else if (e.key === 'Escape' && selectedDayModal) {
        setSelectedDayModal(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDayModal, highlightedDayIso, editingNote, calendarStore])

  return (
    <div className="h-full min-h-screen md:min-h-0 bg-[#111111] flex flex-col flex-1 relative overflow-hidden font-sans">
      
      {/* ── CANVAS BIANCO A COLORI INVERTITI CON BANDA VERDE DADO (#007a50) ── */}
      <div className="h-full flex-1 bg-white rounded-tl-[48px] rounded-bl-[48px] flex flex-col justify-between relative min-w-0 overflow-hidden text-slate-800">

        {/* ── Banda Verde Superiore (inversa rispetto alla Dashboard) ── */}
        <div className="w-full flex justify-end flex-shrink-0">
          <div className="bg-[#007a50] rounded-bl-2xl w-[calc(100%-2.5rem)]" style={{ height: 'calc(3rem - 0.5cm)' }} />
        </div>

        {/* ── Contenuto Principale con scroll ── */}
        <div className="flex-1 min-h-0 pl-10 pr-8 py-3 overflow-y-auto">

          {/* ── HEADER PAGINA ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 border-b border-slate-200 pb-3">
            <div>
              <h1 className="leading-none flex items-baseline gap-0.5">
                <span
                  style={{
                    fontFamily: 'Inspiration, cursive',
                    fontSize: '3.6rem',
                    color: '#007a50',
                    lineHeight: 1,
                  }}
                >
                  Calendar
                </span>
              </h1>
              <p style={{ marginTop: '2px', fontSize: '18px', fontFamily: '"Goldman", sans-serif', fontWeight: 700 }}>
                <span style={{ color: '#007a50' }}>Weekly timeline & </span>
                <span style={{ color: '#0284c7' }}>day cards</span>
                <span style={{ color: '#64748b', fontSize: '13px', fontFamily: '"Space Mono", monospace', marginLeft: '14px', fontWeight: 400 }}>
                  (7 caselle 4x6 cm • settimana in settimana)
                </span>
              </p>
            </div>

            {/* Riquadro che mostra che giorno è oggi — Ingrandito 3 volte con colore #0284c7 (identico al testo day cards) */}
            <div className="flex items-center">
              <button
                onClick={handleToday}
                className="px-5 py-3 rounded-2xl shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3.5 text-left group cursor-pointer border border-[#38bdf8]/40"
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  boxShadow: '0 4px 16px rgba(2, 132, 199, 0.35)',
                }}
                title="Clicca per andare alla settimana corrente e centrare la data di oggi"
              >
                {/* Box Giorno del Mese (Grande) */}
                <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-sky-100 leading-none">
                    SET
                  </span>
                  <span className="text-2xl font-black font-mono leading-none mt-0.5 text-white">
                    25
                  </span>
                </div>

                {/* Dicitura Giorno di Oggi */}
                <div>
                  <div className="flex items-center gap-1.5 text-sky-100 text-[11px] font-mono font-bold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-sky-200" />
                    <span>OGGI È</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black font-mono tracking-tight leading-tight text-white mt-0.5">
                    Venerdì, 25 Settembre
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ── RETTANGOLO SELEZIONE MESE INGRANDITO (Senza intervallo e senza testi superflui) ── */}
          <div
            className="w-full bg-[#111111] rounded-2xl p-4 sm:p-5 mb-5 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-5 select-none border border-black"
          >
            {/* Sinistra: Mese scelto INGRANDITO ed essenziale */}
            <div className="flex items-center gap-3.5 flex-shrink-0 self-start lg:self-center">
              <div className="w-12 h-12 rounded-xl bg-[#00ffaa]/15 border border-[#00ffaa]/30 flex items-center justify-center text-[#00ffaa]">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-mono tracking-tight leading-none flex items-baseline gap-2.5">
                  <span className="text-[#00ffaa] uppercase">{MONTH_NAMES[activeMonthIndex]}</span>
                  <span className="text-white/40 text-2xl sm:text-3xl font-bold">{activeYear}</span>
                </div>
              </div>
            </div>

            {/* Destra: 12 Caselle dei mesi quasi IL DOPPIO PIÙ GRANDI, senza distrazioni */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 bg-[#1c1c1c] p-2 rounded-xl border border-white/10">
                {MONTH_NAMES.map((mName, mIdx) => {
                  const isSelected = mIdx === activeMonthIndex
                  return (
                    <button
                      key={mName}
                      onClick={() => handleSelectMonth(mIdx)}
                      className={`py-2.5 sm:py-3 px-2 text-xs sm:text-sm font-mono rounded-lg font-black transition-all text-center flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#00ffaa] text-[#111111] shadow-md scale-105 ring-2 ring-[#00ffaa]/40'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                      title={`Passa a ${mName}`}
                    >
                      {mName.slice(0, 3).toUpperCase()}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Guida navigazione tastiera */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1.5 px-1">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Timeline Settimana (7 giorni)</span>
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-flex items-center gap-1.5">
              <span>Naviga tra i giorni con le frecce della tastiera:</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700 font-bold text-[10px]">←</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700 font-bold text-[10px]">→</kbd>
            </span>
          </div>

          {/* ── CONTENITORE 7 CASELLE DEI GIORNI (4x6 CM) CON SFONDO BIANCO & INSERIMENTO AZZURRO FINDER ── */}
          <div className="w-full overflow-x-auto pb-4 pt-1 select-none">
            <div className="flex items-stretch justify-start lg:justify-between gap-3 min-w-max mx-auto">
              {currentWeekDays.map((day) => {
                const dayData = calendarStore[day.iso] || { notes: '', files: [] }
                const hasNotes = Boolean(dayData.notes && dayData.notes.trim())
                const hasFiles = Boolean(dayData.files && dayData.files.length > 0)
                const isToday = day.isToday
                const isHighlighted = highlightedDayIso === day.iso

                return (
                  <div
                    key={day.iso}
                    onClick={() => {
                      setHighlightedDayIso(day.iso)
                      openDayEditor(day)
                    }}
                    className={`flex flex-col justify-between p-3 rounded-xl border-2 transition-all cursor-pointer group relative overflow-hidden shadow-md ${
                      isHighlighted
                        ? 'bg-white border-[#00ffaa] ring-4 ring-[#00ffaa]/50 shadow-2xl scale-[1.02]'
                        : isToday
                        ? 'bg-white border-[#007a50] shadow-lg shadow-[#007a50]/20 ring-2 ring-[#007a50]/20'
                        : 'bg-white border-slate-200 hover:border-[#0284c7] hover:shadow-lg'
                    }`}
                    style={{
                      width: '4cm',
                      height: '6cm',
                      minWidth: '4cm',
                      minHeight: '6cm',
                      maxWidth: '4cm',
                      maxHeight: '6cm',
                      backgroundColor: '#ffffff'
                    }}
                    title="Clicca per aprire note e allegati"
                  >
                    {/* 1. Header Casella Giorno: Nome + Numero + Inserimento Azzurro con Icona Finder */}
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`text-[12px] font-mono font-black tracking-wider block ${
                            isToday ? 'text-[#007a50]' : 'text-slate-600'
                          }`}>
                            {day.shortName}
                          </span>
                          <span className={`text-3xl font-black font-mono leading-none block mt-0.5 ${
                            isToday ? 'text-[#007a50]' : 'text-slate-900'
                          }`}>
                            {day.dayNum}
                          </span>
                        </div>

                        {/* Inserimento azzurro (tonalità Finder) a destra */}
                        <div
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all shadow-sm group-hover:scale-105"
                          style={{
                            backgroundColor: '#e0f2fe',
                            color: '#0284c7',
                            border: '1.5px solid #38bdf8',
                          }}
                          title={hasFiles ? `${dayData.files.length} file allegati` : 'Note & Documenti'}
                        >
                          <Folder className="w-3.5 h-3.5 text-[#0284c7]" />
                          <span>{hasFiles ? `${dayData.files.length}F` : 'DOC'}</span>
                        </div>
                      </div>

                      {/* Linea divisoria */}
                      <div className={`h-[2px] w-full my-2 ${isToday ? 'bg-[#007a50]/30' : 'bg-slate-100'}`} />
                    </div>

                    {/* 2. Corpo Casella: Contenuto Note su sfondo bianco */}
                    <div className="flex-1 overflow-hidden my-1 flex flex-col justify-start">
                      {hasNotes ? (
                        <p className="text-[11px] text-slate-800 line-clamp-4 leading-snug font-sans font-medium">
                          "{dayData.notes}"
                        </p>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-300 group-hover:text-slate-400 transition-colors">
                          <StickyNote className="w-5 h-5 mb-1 stroke-[1.5]" />
                          <span className="text-[10px] font-mono">+ Nota / File</span>
                        </div>
                      )}
                    </div>

                    {/* 3. Footer Casella: Badge Allegati & Badge Oggi */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                      {hasFiles ? (
                        <span className="flex items-center gap-1 text-[#0284c7] font-bold bg-[#e0f2fe] px-2 py-0.5 rounded border border-[#38bdf8]/40">
                          <Paperclip className="w-3 h-3" />
                          {dayData.files.length} file
                        </span>
                      ) : isToday ? (
                        <span className="bg-[#007a50] text-white px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider">
                          Oggi
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">0 allegati</span>
                      )}

                      <span className="text-[#007a50] font-black group-hover:translate-x-0.5 transition-transform text-xs">
                        →
                      </span>
                    </div>

                  </div>
                )
              })}
            </div>
          </div>

          {/* ── PULSANTI DELLE FRECCE GRANDI QUANTO IL RIQUADRO (VERDE E GRIGIO SCURO, CARATTERI GRANDI IL DOPPIO) ── */}
          <div className="flex flex-col items-center justify-center my-4 select-none pb-8">
            <div
              className="bg-[#181818] border-2 border-black rounded-2xl flex items-stretch shadow-2xl overflow-hidden"
              style={{
                height: '76px', // Grande quanto il riquadro
                boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
              }}
            >
              {/* Pulsante Sinistro (Punta Triangolare grande il doppio con riempimento verde e grigio scuro) */}
              <button
                onClick={handlePrevWeek}
                className="w-24 sm:w-28 bg-[#007a50] hover:bg-[#008f5d] active:bg-[#006341] text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 group shadow-inner border-r-2 border-black"
                title="Settimana Precedente"
              >
                {/* Punta freccia triangolare stile pulsante ascensore GRANDE IL DOPPIO (40px) */}
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  className="fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:-translate-x-1 transition-transform text-white"
                >
                  <polygon points="17,3 4,12 17,21" />
                </svg>
              </button>

              {/* Display Centrale Grigio Scuro Stile Ascensore */}
              <div className="bg-[#141414] px-6 sm:px-10 flex flex-col items-center justify-center text-center min-w-[240px]">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#00ffaa] font-black">
                  SETTIMANA CORRENTE
                </span>
                <div className="text-base sm:text-lg font-black font-mono text-white flex items-center gap-2 mt-0.5">
                  <span>{currentWeekDays[0].dayNum} {MONTH_NAMES[currentWeekDays[0].monthNum].slice(0, 3)}</span>
                  <span className="text-[#00ffaa] font-black">—</span>
                  <span className="text-white">{currentWeekDays[6].dayNum} {MONTH_NAMES[currentWeekDays[6].monthNum].slice(0, 3)}</span>
                  <span className="text-white/40 text-sm">{activeYear}</span>
                </div>
              </div>

              {/* Pulsante Destro (Punta Triangolare grande il doppio con riempimento verde e grigio scuro) */}
              <button
                onClick={handleNextWeek}
                className="w-24 sm:w-28 bg-[#007a50] hover:bg-[#008f5d] active:bg-[#006341] text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 group shadow-inner border-l-2 border-black"
                title="Settimana Successiva"
              >
                {/* Punta freccia triangolare stile pulsante ascensore GRANDE IL DOPPIO (40px) */}
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  className="fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:translate-x-1 transition-transform text-white"
                >
                  <polygon points="7,3 20,12 7,21" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── MODALE GESTIONE NOTE & ALLEGATI DEL GIORNO ── */}
      {selectedDayModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-[#181818] border border-white/20 rounded-2xl p-6 max-w-lg w-full text-left shadow-2xl relative animate-in fade-in zoom-in-95 duration-150"
            style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)' }}
          >
            {/* Header Modale */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0284c7]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-[#00ffaa] uppercase tracking-wider font-bold">
                    Casella del Giorno
                  </div>
                  <h3 className="text-2xl font-black text-white font-mono flex items-center gap-2">
                    <span>{selectedDayModal.longName}</span>
                    <span className="text-[#38bdf8]">{selectedDayModal.dayNum} {MONTH_NAMES[selectedDayModal.monthNum]} {selectedDayModal.year}</span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Navigazione giorno precedente / successivo sia su schermo che da tastiera */}
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => navigateDay(-1)}
                    className="p-1.5 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center"
                    title="Giorno precedente (o premi Freccia Sinistra ←)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono text-white/50 px-1 hidden sm:inline select-none" title="Usa le frecce della tastiera">
                    ← / →
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateDay(1)}
                    className="p-1.5 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center"
                    title="Giorno successivo (o premi Freccia Destra →)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDayModal(null)}
                  className="p-1.5 text-white/40 hover:text-white text-lg rounded-lg hover:bg-white/10 transition-colors ml-1"
                  title="Chiudi (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sezione 1: Note per questa giornata */}
            <div className="mb-5">
              <label className="block text-xs font-mono text-white/70 uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
                <StickyNote className="w-4 h-4 text-[#00ffaa]" />
                Note della Giornata:
              </label>
              <textarea
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                placeholder="Scrivi le note per questa giornata (orari, set, attrezzatura necessaria, briefing clienti...)"
                rows={4}
                className="w-full bg-[#111111] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#00ffaa] resize-none leading-relaxed font-sans"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={saveNoteForDay}
                  className="px-3 py-1.5 bg-[#00ffaa] hover:bg-[#00e575] text-[#111111] text-xs font-bold rounded-lg font-mono flex items-center gap-1 transition-transform active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Salva Nota
                </button>
              </div>
            </div>

            {/* Sezione 2: File Allegati */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-white/70 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-[#38bdf8]" />
                  Documenti & File Allegati ({(selectedDayModal.data?.files || []).length}):
                </label>

                {/* Upload Button */}
                <label className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-mono rounded cursor-pointer flex items-center gap-1 transition-colors">
                  <UploadCloud className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>+ Allega File</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Elenco File Allegati */}
              {(selectedDayModal.data?.files || []).length === 0 ? (
                <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-xl text-center text-xs text-white/40 font-mono">
                  Nessun file allegato per questo giorno. Clicca su "+ Allega File" per caricare contratti, PDF o foto.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {selectedDayModal.data.files.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-[#38bdf8] flex-shrink-0" />
                        <span className="text-white font-medium truncate">{file.name}</span>
                        <span className="text-white/40 text-[10px]">({file.size})</span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <button
                          onClick={() => alert(`Download di: ${file.name}`)}
                          className="p-1 hover:text-[#00ffaa] text-white/60 transition-colors"
                          title="Scarica file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.name)}
                          className="p-1 hover:text-red-400 text-white/60 transition-colors"
                          title="Elimina allegato"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Modale */}
            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedDayModal(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg font-mono transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
