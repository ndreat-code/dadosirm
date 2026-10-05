import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getTodayIso, getTomorrowIso, getCurrentWeekSundayIso } from '../utils/dateUtils'
import { getCalendarDayData, saveCalendarDayData } from '../utils/calendarData'
import {
  Calendar as CalendarIcon,
  Paperclip,
  FileText,
  Trash2,
  Check,
  Download,
  StickyNote,
  X,
  UploadCloud,
  Folder,
  ChevronLeft,
  ChevronRight,
  Circle,
} from 'lucide-react'

// Nomi dei mesi e dei giorni in italiano
const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
]
const MONTH_NAMES_SHORT = [
  'GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU',
  'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'
]
const DAY_NAMES_SHORT = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM']
const DAY_NAMES_LONG = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

// Colori del brand logo DADO in successione delle lettere: D (Verde), A (Rosso), D (Ciano), O (Giallo)
const BRAND_COLORS = [
  '#53ba75', // Verde D
  '#ea3824', // Rosso A (△)
  '#1bb7ed', // Ciano D
  '#fac429', // Giallo O
]

export default function Calendar() {
  const [searchParams] = useSearchParams()

  // Data e ora in tempo reale
  const [realTimeNow, setRealTimeNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setRealTimeNow(new Date())
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Data di riferimento dinamica
  const [currentDate, setCurrentDate] = useState(() => {
    const dParam = searchParams.get('date')
    if (dParam && /^\d{4}-\d{2}-\d{2}$/.test(dParam)) {
      const parsed = new Date(`${dParam}T10:00:00`)
      if (!isNaN(parsed.getTime())) return parsed
    }
    return new Date()
  })

  const [highlightedDayIso, setHighlightedDayIso] = useState(null)
  const [calendarVersion, setCalendarVersion] = useState(0)
  const [crmActivities, setCrmActivities] = useState(() => {
    try {
      const cached = localStorage.getItem('dado_crm_activities_cache')
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  // Recupera e sincronizza tutte le attività dal backend CRM
  useEffect(() => {
    async function loadCrmData() {
      try {
        const res = await fetch('/api/crm/summary')
        if (res.ok) {
          const data = await res.json()
          if (data && data.nextActions) {
            setCrmActivities(data.nextActions)
            try {
              localStorage.setItem('dado_crm_activities_cache', JSON.stringify(data.nextActions))
            } catch {}
            setCalendarVersion(v => v + 1)
          }
        }
      } catch (err) {
        console.warn('Errore sincronizzazione attività calendar:', err)
      }
    }
    loadCrmData()
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem('dado_crm_activities_cache')
        if (cached) {
          setCrmActivities(JSON.parse(cached))
        }
      } catch {}
      setCalendarVersion(v => v + 1)
    }
    window.addEventListener('dado-calendar-update', handleUpdate)
    window.addEventListener('dado-activities-updated', handleUpdate)
    return () => {
      window.removeEventListener('dado-calendar-update', handleUpdate)
      window.removeEventListener('dado-activities-updated', handleUpdate)
    }
  }, [])

  const [selectedDayModal, setSelectedDayModal] = useState(null)
  const [editingNote, setEditingNote] = useState('')

  // Modalità di visualizzazione: 'week' (settimanale standard) o 'month' (inquadratura mensile)
  const [viewMode, setViewMode] = useState('week')
  // Offset mese: 0 = mese corrente (es. Ottobre), 1 = mese successivo (es. Novembre)
  const [monthOffset, setMonthOffset] = useState(0)

  // Mese di riferimento calcolato
  const displayedMonthDate = useMemo(() => {
    return new Date(realTimeNow.getFullYear(), realTimeNow.getMonth() + monthOffset, 1)
  }, [realTimeNow, monthOffset])

  // Calcolo dei giorni della griglia mensile completa (multiplo di 7, lunedì-domenica)
  const monthGridDays = useMemo(() => {
    const year = displayedMonthDate.getFullYear()
    const month = displayedMonthDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    // 0 = domenica, 1 = lunedì ... 6 = sabato. Settimana da Lunedì (0=Lun ... 6=Dom)
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

    const days = []
    const todayIso = getTodayIso(realTimeNow)

    // Giorni del mese precedente per completare la prima riga
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i)
      const iso = getTodayIso(prevDate)
      const colIdx = days.length % 7
      days.push({
        dateObj: prevDate,
        iso,
        dayNum: prevDate.getDate(),
        monthNum: prevDate.getMonth(),
        year: prevDate.getFullYear(),
        shortName: DAY_NAMES_SHORT[colIdx],
        longName: DAY_NAMES_LONG[colIdx],
        isCurrentMonth: false,
        isToday: iso === todayIso,
      })
    }

    // Giorni del mese
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, month, d)
      const iso = getTodayIso(curDate)
      const colIdx = days.length % 7
      days.push({
        dateObj: curDate,
        iso,
        dayNum: d,
        monthNum: month,
        year,
        shortName: DAY_NAMES_SHORT[colIdx],
        longName: DAY_NAMES_LONG[colIdx],
        isCurrentMonth: true,
        isToday: iso === todayIso,
      })
    }

    // Giorni del mese successivo per completare la griglia (multiplo di 7)
    const remaining = (7 - (days.length % 7)) % 7
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d)
      const iso = getTodayIso(nextDate)
      const colIdx = days.length % 7
      days.push({
        dateObj: nextDate,
        iso,
        dayNum: d,
        monthNum: nextDate.getMonth(),
        year: nextDate.getFullYear(),
        shortName: DAY_NAMES_SHORT[colIdx],
        longName: DAY_NAMES_LONG[colIdx],
        isCurrentMonth: false,
        isToday: iso === todayIso,
      })
    }

    return days
  }, [displayedMonthDate, realTimeNow])

  // Gestione gesture zoom in / zoom out del touchpad (Pinch-to-zoom su Mac)
  const lastZoomGestureTime = useRef(0)
  const zoomAccumulator = useRef(0)

  useEffect(() => {
    function handleWheel(e) {
      // Su macOS, il pinch su touchpad emette un evento wheel con ctrlKey === true
      if (e.ctrlKey) {
        e.preventDefault()
        zoomAccumulator.current += e.deltaY

        const now = Date.now()
        if (now - lastZoomGestureTime.current < 280) return

        if (Math.abs(zoomAccumulator.current) > 20) {
          if (zoomAccumulator.current < 0) {
            // ZOOM IN (dita che si allontanano): inquadra tutto il mese corrente!
            if (viewMode === 'month' && monthOffset === 0) {
              setViewMode('week')
            } else {
              setViewMode('month')
              setMonthOffset(0)
            }
            lastZoomGestureTime.current = now
            zoomAccumulator.current = 0
          } else if (zoomAccumulator.current > 0) {
            // ZOOM OUT (dita che si avvicinano): inquadra il mese successivo!
            setViewMode('month')
            setMonthOffset(1)
            lastZoomGestureTime.current = now
            zoomAccumulator.current = 0
          }
        }
      }
    }

    // Supporto per Safari macOS GestureEvent
    function handleGestureChange(e) {
      e.preventDefault()
      const now = Date.now()
      if (now - lastZoomGestureTime.current < 300) return

      if (e.scale > 1.05) {
        // ZOOM IN: mese corrente
        if (viewMode === 'month' && monthOffset === 0) {
          setViewMode('week')
        } else {
          setViewMode('month')
          setMonthOffset(0)
        }
        lastZoomGestureTime.current = now
      } else if (e.scale < 0.95) {
        // ZOOM OUT: mese successivo
        setViewMode('month')
        setMonthOffset(1)
        lastZoomGestureTime.current = now
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('gesturechange', handleGestureChange, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('gesturechange', handleGestureChange)
    }
  }, [viewMode, monthOffset])

  // Calcola i 7 giorni della singola settimana (Lunedì → Domenica)
  const currentWeekDays = useMemo(() => {
    const d = new Date(currentDate)
    const dayOfWeek = d.getDay()
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

    const monday = new Date(d)
    monday.setDate(d.getDate() + diffToMonday)
    monday.setHours(0, 0, 0, 0)

    const todayIso = getTodayIso(realTimeNow)

    const days = []
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday)
      dayDate.setDate(monday.getDate() + i)
      const iso = getTodayIso(dayDate)
      const dayOfWeekIdx = dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1
      days.push({
        dateObj: dayDate,
        iso,
        dayNum: dayDate.getDate(),
        monthNum: dayDate.getMonth(),
        year: dayDate.getFullYear(),
        shortName: DAY_NAMES_SHORT[dayOfWeekIdx],
        longName: DAY_NAMES_LONG[dayOfWeekIdx],
        isToday: iso === todayIso,
        weekNumber: 1,
      })
    }
    return days
  }, [currentDate, realTimeNow])

  // Calcolo linea fine colorata per giorni con impegni:
  // Se 2 o più giorni di fila, alterna in successione i colori del brand logo DADO (Verde, Rosso, Ciano, Giallo)
  const commitmentCadenceMap = useMemo(() => {
    const map = {}
    let streakIndex = -1

    for (let i = 0; i < currentWeekDays.length; i++) {
      const day = currentWeekDays[i]
      const dayData = getCalendarDayData(day.iso, crmActivities)
      const hasEvents = (dayData?.events || []).length > 0

      if (hasEvents) {
        if (streakIndex === -1) {
          // Controlla se il giorno immediatamente precedente aveva impegni
          const prevDate = new Date(day.dateObj)
          prevDate.setDate(prevDate.getDate() - 1)
          const prevIso = getTodayIso(prevDate)
          const prevData = getCalendarDayData(prevIso, crmActivities)
          if ((prevData?.events || []).length > 0) {
            streakIndex = 1
          } else {
            streakIndex = 0
          }
        } else {
          streakIndex = (streakIndex + 1) % BRAND_COLORS.length
        }
        map[day.iso] = BRAND_COLORS[streakIndex]
      } else {
        streakIndex = -1
        map[day.iso] = null
      }
    }
    return map
  }, [currentWeekDays, calendarVersion, crmActivities])

  // Spostamento di settimana in settimana
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

  // Navigazione da tastiera: freccia sinistra (←) e freccia destra (→)
  useEffect(() => {
    function handleKeyDown(e) {
      // Non intercettare se l'utente sta digitando in un campo input o textarea
      const targetTag = e.target?.tagName?.toLowerCase()
      if (targetTag === 'input' || targetTag === 'textarea' || e.target?.isContentEditable) {
        return
      }

      // Se il modale di dettaglio del giorno è aperto, non cambiare settimana (Escape per chiudere)
      if (selectedDayModal) {
        if (e.key === 'Escape') {
          setSelectedDayModal(null)
        }
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevWeek()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNextWeek()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDayModal])

  // Apertura editor giorno
  function openDayEditor(dayInfo) {
    const existing = getCalendarDayData(dayInfo.iso, crmActivities)
    setEditingNote(existing?.notes || '')
    setSelectedDayModal({ ...dayInfo, data: existing })
  }

  // Toggle stato attività direttamente dal modale del giorno
  async function toggleActivityStatusInModal(activityId, currentStatus) {
    const isCompleted = currentStatus === 'completed' || currentStatus === 'Completata'
    const newStatus = isCompleted ? 'pending' : 'completed'
    try {
      const res = await fetch(`/api/crm/activities/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        const next = crmActivities.map(a =>
          a.id === activityId ? { ...a, status: newStatus, completed: newStatus === 'completed' } : a
        )
        setCrmActivities(next)
        try {
          localStorage.setItem('dado_crm_activities_cache', JSON.stringify(next))
        } catch {}
        if (selectedDayModal?.iso) {
          const updatedDay = getCalendarDayData(selectedDayModal.iso, next)
          setSelectedDayModal(cur => ({ ...cur, data: updatedDay }))
        }
        setCalendarVersion(v => v + 1)
        window.dispatchEvent(new CustomEvent('dado-calendar-update', { detail: { activityId, newStatus } }))
      }
    } catch (e) {
      console.error('Errore aggiornamento attività:', e)
    }
  }

  // Gestione automatica query param (day / date)
  useEffect(() => {
    const dayParam = searchParams.get('day')?.toLowerCase()
    const dateParam = searchParams.get('date')

    let targetIso = null
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      targetIso = dateParam
    } else if (dayParam) {
      if (dayParam === 'today' || dayParam === 'oggi') targetIso = getTodayIso()
      else if (dayParam === 'tomorrow' || dayParam === 'domani') targetIso = getTomorrowIso()
      else if (dayParam === 'sunday' || dayParam === 'domenica') targetIso = getCurrentWeekSundayIso()
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

  // Salvataggio note
  function saveNoteForDay() {
    if (!selectedDayModal) return
    const iso = selectedDayModal.iso
    const current = getCalendarDayData(iso)
    const updated = {
      ...current,
      notes: editingNote.trim()
    }
    saveCalendarDayData(iso, { notes: editingNote.trim() })
    setSelectedDayModal((prev) => ({ ...prev, data: updated }))
    setCalendarVersion(v => v + 1)
  }

  // Upload file
  function handleFileUpload(e) {
    if (!e.target.files || !e.target.files[0] || !selectedDayModal) return
    const file = e.target.files[0]
    const iso = selectedDayModal.iso
    const current = getCalendarDayData(iso)

    const newFileEntry = {
      name: file.name,
      size: (file.size / 1024 > 1024)
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`,
      date: new Date().toLocaleDateString('it-IT')
    }

    const updatedFiles = [...(current?.files || []), newFileEntry]
    saveCalendarDayData(iso, { files: updatedFiles })
    setSelectedDayModal((prev) => ({ ...prev, data: { ...current, files: updatedFiles } }))
    setCalendarVersion(v => v + 1)
    e.target.value = ''
  }

  // Elimina file
  function handleDeleteFile(fileName) {
    if (!selectedDayModal) return
    const iso = selectedDayModal.iso
    const current = getCalendarDayData(iso)
    const updatedFiles = (current?.files || []).filter(f => f.name !== fileName)
    saveCalendarDayData(iso, { files: updatedFiles })
    setSelectedDayModal((prev) => ({ ...prev, data: { ...current, files: updatedFiles } }))
    setCalendarVersion(v => v + 1)
  }

  const startDay = currentWeekDays[0] || {}
  const endDay = currentWeekDays[6] || {}
  const currentMonthName = MONTH_NAMES[realTimeNow.getMonth()]?.toUpperCase()

  // Render dei 7 riquadri orizzontali della settimana (3 sopra, 3 sotto, 1 sotto ancora)
  function renderWeekRow(weekDays) {
    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-2.5 w-full h-full min-h-0 flex-1 px-0.5 sm:px-1">
        {weekDays.map((day, idx) => {
          const dayData = getCalendarDayData(day.iso, crmActivities)
          const events = dayData?.events || []
          const hasEvents = events.length > 0
          const hasNotes = Boolean(dayData?.notes && dayData.notes.trim())
          const isToday = day.isToday
          const isHighlighted = highlightedDayIso === day.iso
          const isSunday = idx === 6

          // Colore del brand logo DADO per ciascun giorno (Verde D, Rosso A, Ciano D, Giallo O)
          const dayBrandColor = BRAND_COLORS[idx % BRAND_COLORS.length]

          return (
            <div
              key={day.iso}
              onClick={() => {
                setHighlightedDayIso(day.iso)
                openDayEditor(day)
              }}
              className={`px-2 sm:px-2.5 py-1.5 sm:py-2 flex items-stretch cursor-pointer transition-colors relative select-none min-w-0 h-full rounded-2xl ${
                isHighlighted
                  ? 'ring-2 ring-[#0284c7] bg-sky-50/40'
                  : 'hover:bg-slate-50/70'
              } ${isSunday ? 'col-start-2' : ''}`}
              style={{
                // Sostituzione: bordo grigio orizzontale superiore per la Domenica (7° giorno)
                borderTop: isSunday ? '2px solid #cbd5e1' : 'none',
                borderBottom: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                backgroundColor: isToday ? '#fcfdfd' : 'transparent',
              }}
              title={`Clicca per gestire dettagli (${day.shortName} ${day.dayNum})`}
            >
              {/* Barra di delimitazione verticale: presente nei primi 6 giorni (Lunedì-Sabato).
                  Sostituita dal bordo orizzontale grigio superiore nell'ultimo giorno (Domenica). */}
              {!isSunday && (
                <div
                  className="w-[5px] sm:w-[6px] rounded-full self-stretch my-0.5 mr-2 sm:mr-2.5 flex-shrink-0 transition-colors"
                  style={{ backgroundColor: dayBrandColor }}
                />
              )}

              {/* Contenuto principale del giorno */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                {/* 1. Intestazione Giorno: Nome e Data centrati (+2pt font) */}
                <div className="flex items-center justify-center gap-2 pb-1 flex-shrink-0">
                  <span className="text-[17px] sm:text-[18px] font-black tracking-wider uppercase text-slate-600 font-switzer">
                    {day.shortName}
                  </span>
                  <span className={`text-[23px] sm:text-[25px] font-black leading-none ${
                    day.isToday ? 'text-[#007a50]' : 'text-slate-900'
                  }`}>
                    {day.dayNum}
                  </span>
                  {day.isToday && (
                    <span className="bg-[#007a50] text-white text-[12px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">
                      Oggi
                    </span>
                  )}
                </div>

                {/* 2. Contenuto impegni (+2pt font) */}
                <div className="flex-1 min-h-0 overflow-y-auto pt-1 flex flex-col justify-between text-left pr-0.5">
                  {hasEvents ? (
                    events.map((ev, evIdx) => (
                      <div
                        key={ev.id || evIdx}
                        className={`text-left select-text flex flex-col justify-between ${
                          events.length === 1 ? 'h-full' : 'flex-1'
                        } ${
                          evIdx > 0 ? 'pt-2 mt-2 border-t border-slate-100' : ''
                        }`}
                      >
                        <div>
                          {/* Orario e Nome Azienda (+2pt font) */}
                          <div className="flex items-baseline justify-between gap-1.5 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-mono font-black text-[15.5px] sm:text-[16px] text-slate-900 tracking-tight whitespace-nowrap">
                                {ev.time}
                              </span>
                              {ev.isCrmActivity && (
                                <span
                                  className={`text-[12px] font-black uppercase px-1.5 py-0.5 rounded leading-none ${
                                    ev.completed
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                  title={ev.completed ? 'Attività CRM completata' : 'Attività CRM in programma'}
                                >
                                  {ev.completed ? '✓ Fatto' : 'Task'}
                                </span>
                              )}
                            </div>
                            <span className="font-black text-slate-900 text-[17px] sm:text-[18px] truncate flex-1 text-right" title={ev.company}>
                              {ev.company}
                            </span>
                          </div>

                          {/* Titolo / Attività da svolgere (+2pt font) */}
                          <div className="text-[15.5px] sm:text-[16px] font-bold text-slate-800 leading-snug line-clamp-2 my-1">
                            {ev.title || ev.category || 'Attività programmata'}
                          </div>
                        </div>

                        {/* Dettagli partecipanti, location e note (+2pt font) */}
                        <div className="pt-1.5 flex flex-col gap-0.5 text-[14px] sm:text-[14.5px] text-slate-600">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate max-w-[50%] font-semibold">
                              {ev.people || ev.attendees || 'Team DADO'}
                            </span>
                            {ev.location && (
                              <span className="truncate max-w-[50%] text-right text-slate-500 font-medium">
                                {ev.location}
                              </span>
                            )}
                          </div>

                          {(ev.notes || ev.materials) && (
                            <div className="text-[13.5px] sm:text-[14px] text-slate-500 italic truncate mt-0.5">
                              {ev.notes || ev.materials}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : hasNotes ? (
                    <div className="h-full flex items-center justify-center p-2 text-[15.5px] sm:text-[16.5px] text-slate-600 font-medium leading-relaxed italic text-center">
                      "{dayData.notes}"
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[14px] text-slate-300">
                      {/* Spazio pulito nel riquadro */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Render della vista mensile completa (inquadra tutto il mese corrente o successivo senza scroll)
  function renderMonthView() {
    const monthName = MONTH_NAMES[displayedMonthDate.getMonth()]
    const year = displayedMonthDate.getFullYear()
    const isCurrentMonth = monthOffset === 0

    return (
      <div className="w-full h-full flex flex-col min-h-0 flex-1 select-none animate-in fade-in duration-150 px-0.5 sm:px-1">
        
        {/* Header Mese: Nome Mese, Indicatore e Pulsanti di Switch */}
        <div className="flex items-center justify-between px-2 sm:px-3 py-1 flex-shrink-0 border-b border-slate-200 mb-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 uppercase">
              {monthName} {year}
            </h2>
            <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
              isCurrentMonth
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-sky-100 text-sky-800 border border-sky-300'
            }`}>
              {isCurrentMonth ? 'Mese Corrente' : 'Mese Successivo'}
            </span>
            <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
              (Zoom In touchpad: Mese Corrente | Zoom Out: Mese Successivo)
            </span>
          </div>

          {/* Switcher rapido Mese Corrente / Successivo / Torna alla Settimana */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setMonthOffset(0)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isCurrentMonth
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Inquadra tutto il mese corrente (oppure zoom in con touchpad)"
            >
              Mese Corrente
            </button>
            <button
              onClick={() => setMonthOffset(1)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isCurrentMonth
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Inquadra il mese successivo (oppure zoom out con touchpad)"
            >
              Mese Successivo
            </button>
            <button
              onClick={() => setViewMode('week')}
              className="ml-1 sm:ml-2 px-3 py-1 text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              title="Torna alla vista settimanale"
            >
              <span>← Vista Settimana</span>
            </button>
          </div>
        </div>

        {/* Intestazione Colonne Giorni (LUN → DOM) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 py-0.5 text-center font-mono font-bold text-xs sm:text-sm text-slate-500 uppercase flex-shrink-0">
          {DAY_NAMES_SHORT.map((name, i) => (
            <div key={i} className="py-0.5">
              {name}
            </div>
          ))}
        </div>

        {/* Griglia mensile: 7 colonne a tutta altezza senza barre di scroll */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 flex-1 min-h-0 w-full" style={{ gridAutoRows: '1fr' }}>
          {monthGridDays.map((day, idx) => {
            const dayData = getCalendarDayData(day.iso, crmActivities)
            const events = dayData?.events || []
            const hasEvents = events.length > 0
            const isToday = day.isToday
            const isHighlighted = highlightedDayIso === day.iso
            const brandColor = BRAND_COLORS[(day.dayNum * 7 + idx) % BRAND_COLORS.length]

            return (
              <div
                key={day.iso}
                onClick={() => {
                  setHighlightedDayIso(day.iso)
                  openDayEditor(day)
                }}
                className={`p-1 sm:p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all min-h-0 overflow-hidden ${
                  !day.isCurrentMonth
                    ? 'bg-slate-50/40 text-slate-300 border-slate-100'
                    : isToday
                    ? 'bg-emerald-50/40 border-emerald-400 ring-1 ring-emerald-400 text-slate-900'
                    : isHighlighted
                    ? 'bg-sky-50/60 border-sky-400 ring-1 ring-sky-400 text-slate-900'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 text-slate-800'
                }`}
                title={`Clicca per gestire dettagli (${day.longName} ${day.dayNum})`}
              >
                {/* Header giorno nella cella */}
                <div className="flex items-center justify-between flex-shrink-0">
                  <span className={`text-[12px] sm:text-[13px] font-black ${
                    day.isCurrentMonth ? (isToday ? 'text-emerald-700' : 'text-slate-900') : 'text-slate-400'
                  }`}>
                    {day.dayNum}
                  </span>
                  {isToday && (
                    <span className="bg-[#007a50] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      Oggi
                    </span>
                  )}
                  {hasEvents && !isToday && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: brandColor }}
                      title={`${events.length} impegni`}
                    />
                  )}
                </div>

                {/* Eventi o anteprima nella cella del mese */}
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-end gap-0.5 mt-0.5">
                  {hasEvents ? (
                    events.slice(0, 2).map((ev, evIdx) => (
                      <div
                        key={evIdx}
                        className="text-[10px] sm:text-[11px] font-bold text-slate-700 truncate bg-slate-100/90 px-1 py-0.2 rounded flex items-center gap-1"
                        title={`${ev.time} - ${ev.company}: ${ev.title}`}
                      >
                        <span className="font-mono text-slate-900 font-black text-[9.5px] sm:text-[10px] flex-shrink-0">{ev.time}</span>
                        <span className="truncate">{ev.company || ev.title}</span>
                      </div>
                    ))
                  ) : dayData?.notes ? (
                    <div className="text-[9.5px] text-slate-400 italic truncate">
                      "{dayData.notes}"
                    </div>
                  ) : null}
                  {events.length > 2 && (
                    <div className="text-[9px] font-bold text-slate-500 text-right pr-0.5">
                      +{events.length - 2} altri
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    )
  }

  return (
    <div className="h-full min-h-screen md:min-h-0 bg-transparent flex flex-col flex-1 relative overflow-hidden font-sans">
      
      {/* ── CANVAS BIANCO: Margini laterali ottimizzati per guadagnare il massimo spazio ── */}
      <div
        className="h-full flex-1 bg-white rounded-tl-none rounded-bl-[48px] flex flex-col justify-between relative min-w-0 overflow-hidden text-slate-800 px-0.5 sm:px-1 pt-1.5 pb-1"
        style={{
          borderLeft: '1.5px solid #e2e8f0',
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
          borderTopLeftRadius: '0px',
        }}
      >

        {/* ── CORPO PRINCIPALE: VISTA SETTIMANA O VISTA MESE COMPLETO ── */}
        <div className="flex-1 min-h-0 w-full select-none pb-1 flex flex-col">
          {viewMode === 'month' ? renderMonthView() : renderWeekRow(currentWeekDays)}
        </div>

        {/* ── BARRA DI NAVIGAZIONE SETTIMANE (VISIBILE IN VISTA SETTIMANA) ── */}
        {viewMode === 'week' && (
          <div
            className="w-full flex items-center justify-between pt-1 pb-1 select-none flex-shrink-0"
            style={{
              paddingLeft: 'calc(1.5rem + 4cm)',
              paddingRight: 'calc(1.5rem + 4cm)',
            }}
          >
            
            {/* Pulsante Sinistro (verso sinistra) */}
            <button
              onClick={handlePrevWeek}
              className="w-14 sm:w-16 h-10 sm:h-11 bg-[#d1d5db] hover:bg-[#c4c8cf] active:bg-[#b0b5be] text-black flex items-center justify-center cursor-pointer transition-all active:scale-95 group rounded-xl border border-slate-300 shadow-xs"
              title="Settimana precedente (oppure usa tasto freccia ←)"
            >
              <ChevronLeft size={36} strokeWidth={3} className="text-black group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Testo Centrale: Senza riquadro con link rapido alle viste mensili (+2pt di grandezza) */}
            <div className="text-center px-4 flex flex-col items-center">
              <span className="text-[21px] sm:text-[23px] font-black font-mono text-slate-800 tracking-wide">
                {startDay.monthNum === endDay.monthNum
                  ? `dal ${startDay.dayNum} al ${endDay.dayNum} ${MONTH_NAMES[endDay.monthNum]}`
                  : `dal ${startDay.dayNum} ${MONTH_NAMES[startDay.monthNum]} al ${endDay.dayNum} ${MONTH_NAMES[endDay.monthNum]}`}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  onClick={() => {
                    setViewMode('month')
                    setMonthOffset(0)
                  }}
                  className="text-[11.5px] font-bold text-slate-500 hover:text-[#0284c7] transition-colors cursor-pointer"
                  title="Inquadra tutto il mese corrente (oppure zoom in con il touchpad)"
                >
                  Mese Corrente (Zoom In)
                </button>
                <span className="text-slate-300 text-xs">•</span>
                <button
                  onClick={() => {
                    setViewMode('month')
                    setMonthOffset(1)
                  }}
                  className="text-[11.5px] font-bold text-slate-500 hover:text-[#0284c7] transition-colors cursor-pointer"
                  title="Inquadra il mese successivo (oppure zoom out con il touchpad)"
                >
                  Mese Successivo (Zoom Out)
                </button>
              </div>
            </div>

            {/* Pulsante Destro (verso destra) */}
            <button
              onClick={handleNextWeek}
              className="w-14 sm:w-16 h-10 sm:h-11 bg-[#d1d5db] hover:bg-[#c4c8cf] active:bg-[#b0b5be] text-black flex items-center justify-center cursor-pointer transition-all active:scale-95 group rounded-xl border border-slate-300 shadow-xs"
              title="Settimana successiva (oppure usa tasto freccia →)"
            >
              <ChevronRight size={36} strokeWidth={3} className="text-black group-hover:translate-x-1 transition-transform" />
            </button>

          </div>
        )}

      </div>

      {/* ── MODALE GESTIONE NOTE & ALLEGATI DEL GIORNO ── */}
      {selectedDayModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-[#181818] border border-white/20 rounded-2xl p-5 sm:p-6 max-w-lg w-full text-left shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
            style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)' }}
          >
            {/* Header Modale */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0284c7]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-[#00ffaa] uppercase tracking-wider font-bold">
                    Dettagli & Attività del Giorno
                  </div>
                  <h3 className="text-xl font-black text-white font-mono flex items-center gap-2">
                    <span>{selectedDayModal.longName}</span>
                    <span className="text-[#38bdf8]">{selectedDayModal.dayNum} {MONTH_NAMES[selectedDayModal.monthNum]} {selectedDayModal.year}</span>
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayModal(null)}
                className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Chiudi (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenuto scrollabile del modale */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-4">
              {/* 1. Impegni & Attività CRM Programmate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-white/70 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-[#38bdf8]" />
                    Impegni & Attività CRM ({(selectedDayModal.data?.events || []).length}):
                  </label>
                  {selectedDayModal.data?.tag && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-white/80">
                      {selectedDayModal.data.tag}
                    </span>
                  )}
                </div>

                {(selectedDayModal.data?.events || []).length === 0 ? (
                  <div className="p-3 bg-white/5 border border-dashed border-white/10 rounded-xl text-center text-xs text-white/40 font-mono">
                    Nessuna attività o impegno programmato per questa data.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                    {selectedDayModal.data.events.map((ev, i) => (
                      <div
                        key={ev.id || i}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-sans text-left flex flex-col gap-1.5 transition-colors hover:bg-white/[0.07]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-white text-[12px] bg-white/10 px-1.5 py-0.5 rounded">
                              {ev.time}
                            </span>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-700/50">
                              {ev.category}
                            </span>
                            {ev.isCrmActivity && (
                              <span className={`text-[9.5px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                ev.completed
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                                  : 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                              }`}>
                                {ev.completed ? '✓ Completata' : 'In Programma'}
                              </span>
                            )}
                          </div>

                          {/* Azione rapida completamento per attività CRM */}
                          {ev.isCrmActivity && ev.activityId && (
                            <button
                              type="button"
                              onClick={() => toggleActivityStatusInModal(ev.activityId, ev.status)}
                              className={`text-[10.5px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                                ev.completed
                                  ? 'border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20'
                                  : 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'
                              }`}
                              title="Cambia stato attività"
                            >
                              {ev.completed ? <Check className="w-3 h-3 text-emerald-400" /> : <Circle className="w-3 h-3 text-amber-400" />}
                              <span>{ev.completed ? 'Riapri' : 'Completa'}</span>
                            </button>
                          )}
                        </div>

                        <div className="text-white font-bold text-[13px] leading-snug">
                          <span className="text-[#38bdf8] mr-1.5">{ev.company}:</span>
                          <span>{ev.title}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-white/50 pt-1 border-t border-white/5">
                          <span>{ev.people || ev.attendees || 'Team DADO'}</span>
                          {ev.location && <span className="text-right truncate max-w-[50%]">{ev.location}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Note della Giornata */}
              <div>
                <label className="block text-xs font-mono text-white/70 uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
                  <StickyNote className="w-4 h-4 text-[#00ffaa]" />
                  Note della Giornata:
                </label>
                <textarea
                  value={editingNote}
                  onChange={(e) => setEditingNote(e.target.value)}
                  placeholder="Scrivi le note per questa giornata (orari, set, attrezzatura necessaria, briefing clienti...)"
                  rows={3}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#00ffaa] resize-none leading-relaxed font-sans"
                />
                <div className="flex justify-end mt-1.5">
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

              {/* 3. File Allegati */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-white/70 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-[#38bdf8]" />
                    Documenti & File Allegati ({(selectedDayModal.data?.files || []).length}):
                  </label>

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

                {(selectedDayModal.data?.files || []).length === 0 ? (
                  <div className="p-3 bg-white/5 border border-dashed border-white/10 rounded-xl text-center text-xs text-white/40 font-mono">
                    Nessun file allegato. Clicca su "+ Allega File" per caricare contratti, PDF o liberatorie.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
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
            </div>

            {/* Footer Modale */}
            <div className="flex justify-end pt-3 border-t border-white/10 mt-3 flex-shrink-0">
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
