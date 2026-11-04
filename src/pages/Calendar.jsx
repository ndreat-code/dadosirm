import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDeviceMode } from '../context/DeviceModeContext'
import PageTopBand from '../components/PageTopBand'
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
  ArrowLeft,
  MapPin,
  Users,
  Briefcase,
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
  const { isMobileApp } = useDeviceMode()
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
  const [, setCalendarVersion] = useState(0)
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
  // Vista a tutto schermo per la commessa / il task quando si clicca un giorno col pallino rosso (da vista 1 Mese o 2 Mesi)
  const [fullScreenDayTask, setFullScreenDayTask] = useState(null)

  // Livelli di Zoom automatici (con 2 dita / pinch):
  // 'day'        = Zoom In massimo (Singolo Giorno)
  // 'week'       = Settimana (giorni uno sotto l'altro, 3 di base visibili e ingranditi)
  // 'month'      = 1 Mese intero
  // 'two-months' = Zoom Out massimo (2 Mesi nella stessa schermata)
  const ZOOM_ORDER = ['day', 'week', 'month', 'two-months']
  const [viewMode, setViewMode] = useState('week')
  const [monthOffset] = useState(0)

  const weekListScrollRef = useRef(null)
  const calendarBodyRef = useRef(null)

  const handleZoomIn = useCallback(() => {
    setFullScreenDayTask(null)
    setViewMode((prev) => {
      const idx = ZOOM_ORDER.indexOf(prev)
      if (idx > 0) return ZOOM_ORDER[idx - 1]
      return prev
    })
  }, [])

  const handleZoomOut = useCallback(() => {
    setFullScreenDayTask(null)
    setViewMode((prev) => {
      const idx = ZOOM_ORDER.indexOf(prev)
      if (idx !== -1 && idx < ZOOM_ORDER.length - 1) return ZOOM_ORDER[idx + 1]
      return prev
    })
  }, [])

  // Mese principale e secondo mese calcolati
  const displayedMonthDate = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1)
  }, [currentDate, monthOffset])

  const secondDisplayedMonthDate = useMemo(() => {
    return new Date(displayedMonthDate.getFullYear(), displayedMonthDate.getMonth() + 1, 1)
  }, [displayedMonthDate])

  // Funzione pura per costruire la griglia mensile (Lunedì-Domenica) di qualunque mese
  const buildMonthGrid = useCallback((targetMonthDate) => {
    const year = targetMonthDate.getFullYear()
    const month = targetMonthDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    const days = []
    const todayIso = getTodayIso(realTimeNow)

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
  }, [realTimeNow])

  const monthGridDays = useMemo(() => buildMonthGrid(displayedMonthDate), [buildMonthGrid, displayedMonthDate])
  const secondMonthGridDays = useMemo(() => buildMonthGrid(secondDisplayedMonthDate), [buildMonthGrid, secondDisplayedMonthDate])

  // Gestione automatica Zoom con 2 dita (Touch Pinch-to-Zoom su smartphone/tablet + Trackpad Pinch)
  const lastZoomGestureTime = useRef(0)
  const zoomAccumulator = useRef(0)
  const pinchStateRef = useRef({ active: false, startDist: 0 })

  useEffect(() => {
    function handleWheel(e) {
      if (e.ctrlKey) {
        e.preventDefault()
        zoomAccumulator.current += e.deltaY

        const now = Date.now()
        if (now - lastZoomGestureTime.current < 280) return

        if (Math.abs(zoomAccumulator.current) > 20) {
          if (zoomAccumulator.current < 0) {
            handleZoomIn()
            lastZoomGestureTime.current = now
            zoomAccumulator.current = 0
          } else if (zoomAccumulator.current > 0) {
            handleZoomOut()
            lastZoomGestureTime.current = now
            zoomAccumulator.current = 0
          }
        }
      }
    }

    function handleGestureChange(e) {
      e.preventDefault()
      const now = Date.now()
      if (now - lastZoomGestureTime.current < 300) return

      if (e.scale > 1.05) {
        handleZoomIn()
        lastZoomGestureTime.current = now
      } else if (e.scale < 0.95) {
        handleZoomOut()
        lastZoomGestureTime.current = now
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('gesturechange', handleGestureChange, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('gesturechange', handleGestureChange)
    }
  }, [handleZoomIn, handleZoomOut])

  // Touch pinch con due dita direttamente sul corpo del calendario
  useEffect(() => {
    const el = calendarBodyRef.current
    if (!el) return

    function getTouchDist(touches) {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.hypot(dx, dy)
    }

    function onTouchStart(e) {
      if (e.touches.length === 2) {
        pinchStateRef.current = {
          active: true,
          startDist: getTouchDist(e.touches),
        }
      }
    }

    function onTouchMove(e) {
      if (e.touches.length === 2 && pinchStateRef.current.active) {
        if (e.cancelable) e.preventDefault()
        const curDist = getTouchDist(e.touches)
        const delta = curDist - pinchStateRef.current.startDist
        const now = Date.now()
        if (now - lastZoomGestureTime.current < 260) return

        if (delta > 36) {
          // Allargando due dita -> Zoom In (2 Mesi -> 1 Mese -> Settimana -> 1 Giorno)
          handleZoomIn()
          lastZoomGestureTime.current = now
          pinchStateRef.current.startDist = curDist
        } else if (delta < -36) {
          // Avvicinando due dita -> Zoom Out (1 Giorno -> Settimana -> 1 Mese -> 2 Mesi)
          handleZoomOut()
          lastZoomGestureTime.current = now
          pinchStateRef.current.startDist = curDist
        }
      }
    }

    function onTouchEnd(e) {
      if (e.touches.length < 2) {
        pinchStateRef.current.active = false
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true, capture: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true, capture: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart, { capture: true })
      el.removeEventListener('touchmove', onTouchMove, { capture: true })
      el.removeEventListener('touchend', onTouchEnd, { capture: true })
      el.removeEventListener('touchcancel', onTouchEnd, { capture: true })
    }
  }, [handleZoomIn, handleZoomOut])

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

  // Giorno attivo di riferimento (Oggi se presente nella settimana, altrimenti currentDate)
  const activeReferenceDay = useMemo(() => {
    const todayInWeek = currentWeekDays.find((d) => d.isToday)
    if (todayInWeek && viewMode === 'week') return todayInWeek
    const curIso = getTodayIso(currentDate)
    const matchInWeek = currentWeekDays.find((d) => d.iso === curIso)
    if (matchInWeek) return matchInWeek
    return currentWeekDays[0]
  }, [currentWeekDays, currentDate, viewMode])

  // Centra automaticamente il giorno attuale al centro dei 3 giorni visibili nella vista Settimana
  useEffect(() => {
    if (viewMode !== 'week') return
    const container = weekListScrollRef.current
    if (!container || !activeReferenceDay?.iso) return
    const timer = setTimeout(() => {
      const targetEl = container.querySelector(`[data-day-iso="${activeReferenceDay.iso}"]`)
      if (targetEl) {
        const targetTop =
          targetEl.offsetTop - container.clientHeight / 2 + targetEl.clientHeight / 2
        container.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth',
        })
      }
    }, 40)
    return () => clearTimeout(timer)
  }, [viewMode, activeReferenceDay?.iso, currentDate])

  // Navigazione Giorno / Settimana / Mese
  function handlePrevDay() {
    setCurrentDate((prev) => {
      const n = new Date(prev)
      n.setDate(n.getDate() - 1)
      return n
    })
  }

  function handleNextDay() {
    setCurrentDate((prev) => {
      const n = new Date(prev)
      n.setDate(n.getDate() + 1)
      return n
    })
  }

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

  function handlePrevMonth() {
    setCurrentDate((prev) => {
      const n = new Date(prev)
      n.setMonth(n.getMonth() - 1)
      return n
    })
  }

  function handleNextMonth() {
    setCurrentDate((prev) => {
      const n = new Date(prev)
      n.setMonth(n.getMonth() + 1)
      return n
    })
  }

  function handlePrimaryPrev() {
    // Vista 3 giorni e vista giorno singolo (con gli altri 7 accanto): si scorre di settimana in settimana
    if (viewMode === 'day' || viewMode === 'week') handlePrevWeek()
    else handlePrevMonth()
  }

  function handlePrimaryNext() {
    if (viewMode === 'day' || viewMode === 'week') handleNextWeek()
    else handleNextMonth()
  }

  // Navigazione da tastiera: freccia sinistra (←) e freccia destra (→)
  useEffect(() => {
    function handleKeyDown(e) {
      const targetTag = e.target?.tagName?.toLowerCase()
      if (targetTag === 'input' || targetTag === 'textarea' || e.target?.isContentEditable) {
        return
      }

      if (fullScreenDayTask) {
        if (e.key === 'Escape') {
          setFullScreenDayTask(null)
        }
        return
      }

      if (selectedDayModal) {
        if (e.key === 'Escape') {
          setSelectedDayModal(null)
        }
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrimaryPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handlePrimaryNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDayModal, fullScreenDayTask, viewMode])

  // Apertura editor giorno (usato in vista Giorno / Settimana)
  function openDayEditor(dayInfo) {
    const existing = getCalendarDayData(dayInfo.iso, crmActivities)
    setEditingNote(existing?.notes || '')
    setSelectedDayModal({ ...dayInfo, data: existing })
  }

  // Apertura a tutto schermo della commessa / task (usata in vista 1 Mese / 2 Mesi cliccando il giorno col pallino rosso)
  function openFullScreenTaskForDay(dayInfo) {
    const existing = getCalendarDayData(dayInfo.iso, crmActivities)
    setFullScreenDayTask({ ...dayInfo, data: existing })
  }

  // Toggle stato attività
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
        if (fullScreenDayTask?.iso) {
          const updatedDay = getCalendarDayData(fullScreenDayTask.iso, next)
          setFullScreenDayTask(cur => ({ ...cur, data: updatedDay }))
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

  // Render Singolo Giorno (Zoom In massimo: fino al singolo giorno)
  function renderSingleDayView() {
    const curIso = getTodayIso(currentDate)
    const dayObj = currentWeekDays.find((d) => d.iso === curIso) || currentWeekDays[0]
    if (!dayObj) return null
    const dayIdx = currentWeekDays.findIndex((d) => d.iso === dayObj.iso)
    const isSunday = dayIdx === 6
    const dayData = getCalendarDayData(dayObj.iso, crmActivities)
    const events = dayData?.events || []
    const hasEvents = events.length > 0
    const hasNotes = Boolean(dayData?.notes && dayData.notes.trim())

    return (
      <div
        className="w-full h-full flex flex-col min-h-0 flex-1 px-1.5 sm:px-3 py-1 gap-2 overflow-y-auto no-scrollbar [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Selettore rapido dei 7 giorni della settimana */}
        <div className="grid grid-cols-7 gap-1 flex-shrink-0">
          {currentWeekDays.map((d, idx) => {
            const isSelected = d.iso === dayObj.iso
            const isSun = idx === 6
            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => setCurrentDate(new Date(d.dateObj))}
                className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-[1.02]'
                    : isSun
                    ? 'bg-[#fbfaf5] text-slate-800 border-[#dfd9c8]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                }`}
              >
                <span className="text-[9.5px] font-black uppercase tracking-wider opacity-80">{d.shortName}</span>
                <span className="text-[13px] font-black leading-tight">{d.dayNum}</span>
              </button>
            )
          })}
        </div>

        {/* Riquadro grande del Singolo Giorno (senza barra colorata laterale) */}
        <div
          onClick={() => openDayEditor(dayObj)}
          className={`flex-1 min-h-0 flex items-stretch cursor-pointer transition-all relative ${
            isSunday ? 'p-4 sm:p-5 rounded-[28px]' : 'p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs'
          }`}
          style={
            isSunday
              ? {
                  border: '2px solid #e2ddd0',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fbfaf5 54%, #f2eee3 100%)',
                  boxShadow:
                    '0 10px 24px -4px rgba(15, 23, 42, 0.14), 0 3px 8px -2px rgba(15, 23, 42, 0.08), inset 0 2px 2px #ffffff, inset 0 -2px 4px rgba(214, 208, 194, 0.55)',
                }
              : {
                  backgroundColor: dayObj.isToday ? '#f8fdfb' : '#ffffff',
                }
          }
        >
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                  {dayObj.longName} {dayObj.dayNum} {MONTH_NAMES_SHORT[dayObj.monthNum]}
                </span>
                {dayObj.isToday && (
                  <span className="bg-[#007a50] text-white text-[11px] px-2.5 py-0.5 font-black rounded-full uppercase tracking-wider">
                    Oggi
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold text-[#0284c7] bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                Tocca per note/allegati
              </span>
            </div>

            <div
              className="flex-1 min-h-0 overflow-y-auto pt-3 flex flex-col gap-2.5 no-scrollbar [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {hasEvents ? (
                events.map((ev, evIdx) => (
                  <div
                    key={ev.id || evIdx}
                    className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-sm sm:text-base text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {ev.time}
                      </span>
                      <span className="font-black text-sm sm:text-base text-[#0284c7] truncate">
                        {ev.company}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-sm sm:text-base">
                      {ev.title || ev.category || 'Attività programmata'}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span className="font-semibold">{ev.people || ev.attendees || 'Team DADO'}</span>
                      {ev.location && <span>📍 {ev.location}</span>}
                    </div>
                  </div>
                ))
              ) : hasNotes ? (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-sm text-slate-700 italic">
                  "{dayData.notes}"
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-slate-400 font-semibold">
                  Nessun impegno registrato per {dayObj.longName} {dayObj.dayNum}. Tocca per aggiungere note o allegati.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render dei 7 giorni della settimana UNO SOTTO L'ALTRO:
  // - Riquadri ingranditi lasciandone di base 3 visibili nello schermo
  // - Rimosse le barre colorate al lato di ogni singolo giorno (eccetto Domenica col suo riquadro in rilievo)
  // - Rimossa la barra verticale di scroll a destra
  function renderWeekRow(weekDays) {
    return (
      <div
        ref={weekListScrollRef}
        className={`flex flex-col ${
          isMobileApp ? 'gap-2 px-1.5 py-1' : 'gap-2.5 px-3 py-2'
        } w-full h-full min-h-0 flex-1 overflow-y-auto scroll-smooth no-scrollbar [&::-webkit-scrollbar]:hidden`}
        style={{
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {weekDays.map((day, idx) => {
          const dayData = getCalendarDayData(day.iso, crmActivities)
          const events = dayData?.events || []
          const hasEvents = events.length > 0
          const hasNotes = Boolean(dayData?.notes && dayData.notes.trim())
          const isToday = day.isToday
          const isCenterActive = activeReferenceDay?.iso === day.iso
          const isHighlighted = highlightedDayIso === day.iso
          const isSunday = idx === 6

          // Colore del brand logo DADO per le barre separatrici orizzontali tra i giorni
          const dayBrandColor = BRAND_COLORS[idx % BRAND_COLORS.length]

          return (
            <div
              key={day.iso}
              data-day-iso={day.iso}
              className="flex flex-col shrink-0"
              style={{
                height: 'calc((100% - 16px) / 3)',
                minHeight: isMobileApp ? '174px' : '202px',
              }}
            >
              {/* Barra separatrice orizzontale nei soliti colori DADO tra un giorno e l'altro */}
              {idx > 0 && (
                <div className="flex items-center justify-center pb-1.5 flex-shrink-0">
                  <div
                    className="w-full h-[3.5px] rounded-full opacity-90"
                    style={{
                      backgroundColor: isSunday ? '#dfd9c8' : dayBrandColor,
                    }}
                  />
                </div>
              )}

              <div
                onClick={() => {
                  setHighlightedDayIso(day.iso)
                  setCurrentDate(new Date(day.dateObj))
                  openDayEditor(day)
                }}
                className={`${
                  isSunday
                    ? isMobileApp
                      ? 'px-3.5 py-3 rounded-[26px]'
                      : 'px-5 py-4 rounded-[30px]'
                    : isMobileApp
                    ? 'px-3.5 py-3 rounded-2xl'
                    : 'px-5 py-4 rounded-2xl'
                } flex-1 min-h-0 flex items-stretch cursor-pointer transition-all relative select-none min-w-0 ${
                  isHighlighted
                    ? 'ring-2 ring-[#0284c7] bg-sky-50/40'
                    : isToday || isCenterActive
                    ? 'ring-2 ring-[#007a50]/70 shadow-md'
                    : isSunday
                    ? 'hover:brightness-[0.99]'
                    : 'hover:bg-slate-50/80 border border-slate-200/90 shadow-xs'
                }`}
                style={
                  isSunday
                    ? {
                        border: '2px solid #e2ddd0',
                        background: 'linear-gradient(180deg, #ffffff 0%, #fbfaf5 54%, #f2eee3 100%)',
                        boxShadow:
                          '0 8px 20px -4px rgba(15, 23, 42, 0.14), 0 3px 7px -2px rgba(15, 23, 42, 0.08), inset 0 2px 2px #ffffff, inset 0 -2px 4px rgba(214, 208, 194, 0.55)',
                      }
                    : {
                        backgroundColor: isToday ? '#f4fbf8' : '#ffffff',
                      }
                }
                title={`Tocca per dettagli (${day.longName} ${day.dayNum})`}
              >
                {/* Contenuto principale del giorno (senza barra colorata verticale al lato) */}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  {/* 1. Intestazione Giorno ingrandita */}
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100 flex-shrink-0">
                    <div
                      className={
                        isSunday
                          ? `inline-flex items-center justify-center ${
                              isMobileApp ? 'gap-2 px-3.5 py-1' : 'gap-2.5 px-4 py-1'
                            } rounded-full`
                          : 'inline-flex items-center gap-2'
                      }
                      style={
                        isSunday
                          ? {
                              background: 'linear-gradient(180deg, #ffffff 0%, #f7f4ea 100%)',
                              border: '1.5px solid #dfd9c8',
                              boxShadow:
                                '0 2px 6px rgba(15, 23, 42, 0.08), inset 0 1.5px 1px #ffffff',
                            }
                          : undefined
                      }
                    >
                      <span className={`${isMobileApp ? 'text-[14px]' : 'text-[17px]'} font-black tracking-wider uppercase text-slate-700 font-switzer`}>
                        {day.longName}
                      </span>
                      <span className={`${isMobileApp ? 'text-[19px]' : 'text-[23px]'} font-black leading-none ${
                        day.isToday ? 'text-[#007a50]' : 'text-slate-900'
                      }`}>
                        {day.dayNum}
                      </span>
                      {day.isToday && (
                        <span className="bg-[#007a50] text-white text-[10px] sm:text-[11px] px-2.5 py-0.5 font-black rounded-full uppercase tracking-wider">
                          Oggi
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-slate-400">
                      {hasEvents ? `${events.length} ${events.length === 1 ? 'impegno' : 'impegni'}` : 'Libero'}
                    </span>
                  </div>

                  {/* 2. Contenuto impegni del giorno */}
                  <div className="flex-1 min-h-0 pt-1.5 flex flex-col justify-center text-left overflow-hidden">
                    {hasEvents ? (
                      <div className="flex flex-col gap-2">
                        {events.slice(0, 2).map((ev, evIdx) => (
                          <div
                            key={ev.id || evIdx}
                            className={`text-left flex flex-col justify-between ${
                              evIdx > 0 ? 'pt-1.5 border-t border-slate-100' : ''
                            }`}
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`font-black ${isMobileApp ? 'text-[12.5px]' : 'text-[15px]'} text-slate-900 tracking-tight whitespace-nowrap`}>
                                  {ev.time}
                                </span>
                                <span className={`font-bold ${isMobileApp ? 'text-[13.5px]' : 'text-[15.5px]'} text-slate-800 truncate`}>
                                  {ev.title || ev.category || 'Attività programmata'}
                                </span>
                              </div>
                              <span className={`font-black text-[#0284c7] ${isMobileApp ? 'text-[12.5px]' : 'text-[15px]'} truncate shrink-0 max-w-[44%] text-right`} title={ev.company}>
                                {ev.company}
                              </span>
                            </div>

                            <div className={`flex items-center justify-between gap-2 ${isMobileApp ? 'text-[11.5px]' : 'text-[13px]'} text-slate-500 mt-0.5`}>
                              <span className="truncate font-semibold">
                                {ev.people || ev.attendees || 'Team DADO'}
                              </span>
                              {ev.location && (
                                <span className="truncate text-right text-slate-500 font-medium">
                                  📍 {ev.location}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : hasNotes ? (
                      <div className={`p-1 ${isMobileApp ? 'text-[12.5px]' : 'text-[14.5px]'} text-slate-600 font-medium leading-snug italic`}>
                        "{dayData.notes}"
                      </div>
                    ) : (
                      <div className="text-[12px] text-slate-400 italic">
                        Nessun impegno programmato — tocca per aggiungere note
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Render di una singola griglia mensile (usata solo quando si visualizza 1 Mese o 2 Mesi insieme):
  // - Quadratino singolo ridotto alle dimensioni precise che contengono sia il numero del mese che il pallino rosso
  // - Cliccando la giornata in cui è contenuto il pallino rosso si apre a tutto schermo la commessa / il task di quella giornata
  function renderSingleMonthGrid(monthDateObj, gridDays, compact = false) {
    const monthName = MONTH_NAMES[monthDateObj.getMonth()]
    const year = monthDateObj.getFullYear()

    return (
      <div className="w-full flex flex-col items-center justify-center select-none px-2 py-1">
        <div className={`w-full max-w-[380px] flex items-center justify-between px-1 ${compact ? 'py-1' : 'py-1.5'} border-b border-slate-200 mb-1.5 flex-shrink-0`}>
          <h2 className={`${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} font-black tabular-nums tracking-tight text-slate-900 uppercase`}>
            {monthName} {year}
          </h2>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-[#ea3824] inline-block" />
            <span>Tocca il pallino per aprire</span>
          </div>
        </div>

        {/* Intestazione Colonne Giorni (LUN → DOM) */}
        <div className="w-full max-w-[380px] grid grid-cols-7 gap-1.5 py-1 text-center font-bold text-[10px] sm:text-xs text-slate-500 uppercase flex-shrink-0">
          {DAY_NAMES_SHORT.map((name, i) => (
            <div
              key={i}
              className={`py-0.5 ${i === 6 ? 'rounded-full bg-[#f7f4ea] border border-[#dfd9c8] text-slate-800 font-black' : ''}`}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Griglia mensile con quadratini ridotti alle dimensioni precise per numero + pallino rosso */}
        <div className={`w-full max-w-[380px] grid grid-cols-7 ${compact ? 'gap-1.5 py-0.5' : 'gap-2 py-1.5'} place-items-center`}>
          {gridDays.map((day, idx) => {
            const dayData = getCalendarDayData(day.iso, crmActivities)
            const events = dayData?.events || []
            const hasEvents = events.length > 0
            const isToday = day.isToday
            const isHighlighted = highlightedDayIso === day.iso
            const isSunday = idx % 7 === 6

            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => {
                  setHighlightedDayIso(day.iso)
                  setCurrentDate(new Date(day.dateObj))
                  if (hasEvents) {
                    openFullScreenTaskForDay(day)
                  } else {
                    openDayEditor(day)
                  }
                }}
                className={`${
                  compact
                    ? 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl'
                    : 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl'
                } border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 ${
                  !day.isCurrentMonth
                    ? 'bg-slate-50/40 text-slate-300 border-slate-100'
                    : hasEvents
                    ? 'bg-white border-red-200 shadow-xs hover:border-[#ea3824]'
                    : isToday
                    ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500 text-slate-900'
                    : isHighlighted
                    ? 'bg-sky-50/60 border-sky-400 ring-1 ring-sky-400 text-slate-900'
                    : isSunday
                    ? 'bg-[#fbfaf5] border-[#dfd9c8] text-slate-900 shadow-2xs'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 text-slate-800'
                }`}
                title={
                  hasEvents
                    ? `${day.longName} ${day.dayNum}: tocca per aprire commessa / task a tutto schermo`
                    : `${day.longName} ${day.dayNum} ${MONTH_NAMES[day.monthNum]}`
                }
              >
                <span
                  className={`${compact ? 'text-[11.5px]' : 'text-[13px]'} font-black leading-none ${
                    day.isCurrentMonth
                      ? isToday
                        ? 'text-emerald-700'
                        : 'text-slate-900'
                      : 'text-slate-300'
                  }`}
                >
                  {day.dayNum}
                </span>

                {/* Pallino rosso solo quando quella giornata ha una commessa / task */}
                {hasEvents ? (
                  <span
                    className={`${compact ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full bg-[#ea3824] shrink-0 shadow-[0_0_0_2px_rgba(234,56,36,0.2)]`}
                  />
                ) : (
                  <span className={`${compact ? 'w-2 h-1' : 'w-2.5 h-1.5'} shrink-0 opacity-0`} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Vista 2 Mesi nella stessa schermata (Zoom Out massimo)
  function renderTwoMonthsView() {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-around gap-1 min-h-0 flex-1 overflow-y-auto px-0.5 no-scrollbar [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {renderSingleMonthGrid(displayedMonthDate, monthGridDays, true)}
        <div className="w-full max-w-[380px] h-[1.5px] bg-slate-200/80 shrink-0 rounded-full" />
        {renderSingleMonthGrid(secondDisplayedMonthDate, secondMonthGridDays, true)}
      </div>
    )
  }

  // Testo compatto "dal ... al ... + prime 3 lettere del mese"
  const startMonth3 = MONTH_NAMES_SHORT[startDay.monthNum] || ''
  const endMonth3 = MONTH_NAMES_SHORT[endDay.monthNum] || ''
  const weekRangeLabel =
    startDay.monthNum === endDay.monthNum
      ? `dal ${startDay.dayNum} al ${endDay.dayNum} ${endMonth3}`
      : `dal ${startDay.dayNum} ${startMonth3} al ${endDay.dayNum} ${endMonth3}`

  return (
    <div className="h-full min-h-dvh md:min-h-0 bg-transparent flex flex-col flex-1 relative overflow-hidden font-sans">
      {/* ── BANDA SUPERIORE CON SFUMATURA ARMONIZZATA ALLO SFONDO BIANCO DI CALENDAR ── */}
      <PageTopBand title="Calendar" theme="calendar" thickDesktop={false} />

      {/* ── CANVAS BIANCO ── */}
      <div
        className={`h-full flex-1 bg-white rounded-tl-none ${isMobileApp ? 'rounded-bl-[32px]' : 'rounded-bl-[48px]'} flex flex-col justify-between relative min-w-0 overflow-hidden text-slate-800 px-1 sm:px-2 pt-1 pb-2`}
        style={{
          borderLeft: '1.5px solid #e2e8f0',
          boxShadow: '-10px 14px 24px -6px rgba(0, 0, 0, 0.38)',
          borderTopLeftRadius: '0px',
        }}
      >

        {/* ── CORPO PRINCIPALE CON ZOOM AUTOMATICO A 2 DITA (1 GIORNO ↔ SETTIMANA 3 GG ↔ 1 MESE ↔ 2 MESI) ── */}
        <div
          ref={calendarBodyRef}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="flex-1 min-h-0 w-full select-none flex flex-col overflow-hidden items-center justify-center"
        >
          {viewMode === 'day'
            ? renderSingleDayView()
            : viewMode === 'week'
            ? renderWeekRow(currentWeekDays)
            : viewMode === 'month'
            ? renderSingleMonthGrid(displayedMonthDate, monthGridDays, false)
            : renderTwoMonthsView()}
        </div>

        {/* ── BARRA INFERIORE CON TASTI ANCORA PIÙ GRANDI E TESTO "DAL AL + MESE (PRIME 3 LETTERE)" ── */}
        <div className="w-full pt-2 pb-1 px-1.5 sm:px-4 border-t border-slate-200/90 bg-white/95 select-none flex-shrink-0">
          <div className="w-full flex items-center justify-between gap-2.5 sm:gap-4">
            {/* Tasto Sinistro INGRANDITO per muoversi tra le settimane col dito */}
            <button
              type="button"
              onClick={handlePrimaryPrev}
              className={`${
                isMobileApp
                  ? 'min-w-[96px] h-14 px-4 rounded-2xl'
                  : 'min-w-[152px] h-16 px-6 rounded-2xl'
              } bg-[#e2e6ec] hover:bg-[#d5dbe3] active:bg-[#c5ccd6] text-slate-900 flex items-center justify-center cursor-pointer transition-all active:scale-95 border border-slate-300 shadow-sm flex-shrink-0`}
              title="Settimana precedente"
            >
              <ChevronLeft size={isMobileApp ? 30 : 34} strokeWidth={3.2} className="text-slate-900 shrink-0" />
            </button>

            {/* Centro: "dal ... al ... + prime tre lettere del mese" (toccandolo riporta a Oggi) */}
            <button
              type="button"
              onClick={() => setCurrentDate(new Date())}
              className="text-center px-1 py-2 flex flex-col items-center justify-center min-w-0 flex-1 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
              title="Tocca per tornare alla settimana attuale (Oggi)"
            >
              <span className={`${isMobileApp ? 'text-[15.5px] sm:text-[17px]' : 'text-[21px] sm:text-[24px]'} font-black text-slate-900 tracking-tight leading-tight truncate max-w-full`}>
                {weekRangeLabel}
              </span>
            </button>

            {/* Tasto Destro INGRANDITO per muoversi tra le settimane col dito */}
            <button
              type="button"
              onClick={handlePrimaryNext}
              className={`${
                isMobileApp
                  ? 'min-w-[96px] h-14 px-4 rounded-2xl'
                  : 'min-w-[152px] h-16 px-6 rounded-2xl'
              } bg-[#e2e6ec] hover:bg-[#d5dbe3] active:bg-[#c5ccd6] text-slate-900 flex items-center justify-center cursor-pointer transition-all active:scale-95 border border-slate-300 shadow-sm flex-shrink-0`}
              title="Settimana successiva"
            >
              <ChevronRight size={isMobileApp ? 30 : 34} strokeWidth={3.2} className="text-slate-900 shrink-0" />
            </button>
          </div>
        </div>

      </div>

      {/* ── SCHERMATA A TUTTO SCHERMO PER COMMESSA / TASK DELLA GIORNATA COL PALLINO ROSSO (DA 1 MESE / 2 MESI) ── */}
      {fullScreenDayTask && (
        <div
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden animate-in fade-in duration-150 font-sans"
        >
          {/* Barra in alto con pulsante contenente SOLO l'icona della freccia per tornare alla schermata precedente */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-200 bg-white flex-shrink-0">
            <button
              type="button"
              onClick={() => setFullScreenDayTask(null)}
              aria-label="Torna alla schermata precedente"
              title="Torna alla schermata precedente"
              className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 flex items-center justify-center cursor-pointer transition-all active:scale-95 border border-slate-200/90 shadow-xs"
            >
              <ArrowLeft className="w-6 h-6 text-slate-900" strokeWidth={2.8} />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ea3824]" />
              <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-900">
                {fullScreenDayTask.longName} {fullScreenDayTask.dayNum} {MONTH_NAMES_SHORT[fullScreenDayTask.monthNum]} {fullScreenDayTask.year}
              </h2>
            </div>

            <div className="w-12" />
          </div>

          {/* Contenuto a tutto schermo della commessa / task della giornata */}
          <div
            className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 bg-slate-50/60 no-scrollbar [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {(fullScreenDayTask.data?.events || []).map((ev, i) => (
              <div
                key={ev.id || i}
                className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm sm:text-base text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                      {ev.time}
                    </span>
                    <span className="text-xs font-black uppercase px-3 py-1 rounded-xl bg-red-50 text-[#ea3824] border border-red-200">
                      {ev.category || 'Commessa / Task'}
                    </span>
                  </div>

                  {ev.isCrmActivity && ev.activityId && (
                    <button
                      type="button"
                      onClick={() => toggleActivityStatusInModal(ev.activityId, ev.status)}
                      className={`text-xs font-black px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        ev.completed
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      {ev.completed ? <Check className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4 text-amber-600" />}
                      <span>{ev.completed ? 'Completata' : 'Segna Completata'}</span>
                    </button>
                  )}
                </div>

                {/* Commessa / Azienda */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284c7] shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Commessa / Cliente
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-[#0284c7] leading-tight">
                      {ev.company || 'DADO Media Production'}
                    </span>
                  </div>
                </div>

                {/* Task / Attività */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Task / Dettaglio Operativo
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                    {ev.title || ev.category || 'Attività programmata'}
                  </div>
                </div>

                {/* Team & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-2.5 bg-slate-50/80 border border-slate-200/70 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-slate-700">
                    <Users className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">{ev.people || ev.attendees || 'Team DADO'}</span>
                  </div>
                  {ev.location && (
                    <div className="flex items-center gap-2.5 bg-slate-50/80 border border-slate-200/70 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-slate-700">
                      <MapPin className="w-4 h-4 text-[#ea3824] shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {fullScreenDayTask.data?.notes && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-sm font-semibold text-slate-800">
                <div className="text-[11px] font-black uppercase tracking-wider text-amber-800 mb-1">
                  Note della Giornata
                </div>
                <div>{fullScreenDayTask.data.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}

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
                  <div className="text-[11px] text-[#00ffaa] uppercase tracking-wider font-bold">
                    Dettagli & Attività del Giorno
                  </div>
                  <h3 className="text-xl font-black text-white tabular-nums flex items-center gap-2">
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
                  <label className="text-xs text-white/70 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-[#38bdf8]" />
                    Impegni & Attività CRM ({(selectedDayModal.data?.events || []).length}):
                  </label>
                  {selectedDayModal.data?.tag && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white/10 text-white/80">
                      {selectedDayModal.data.tag}
                    </span>
                  )}
                </div>

                {(selectedDayModal.data?.events || []).length === 0 ? (
                  <div className="p-3 bg-white/5 border border-dashed border-white/10 rounded-xl text-center text-xs text-white/40">
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
                            <span className=" font-bold text-white text-[12px] bg-white/10 px-1.5 py-0.5 rounded">
                              {ev.time}
                            </span>
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-700/50">
                              {ev.category}
                            </span>
                            {ev.isCrmActivity && (
                              <span className={`text-[9.5px] uppercase px-1.5 py-0.5 rounded font-bold ${
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
                              className={`text-[10.5px] px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
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
                <label className="block text-xs text-white/70 uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
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
                    className="px-3 py-1.5 bg-[#00ffaa] hover:bg-[#00e575] text-[#111111] text-xs font-bold rounded-lg flex items-center gap-1 transition-transform active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Salva Nota
                  </button>
                </div>
              </div>

              {/* 3. File Allegati */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/70 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-[#38bdf8]" />
                    Documenti & File Allegati ({(selectedDayModal.data?.files || []).length}):
                  </label>

                  <label className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded cursor-pointer flex items-center gap-1 transition-colors">
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
                  <div className="p-3 bg-white/5 border border-dashed border-white/10 rounded-xl text-center text-xs text-white/40">
                    Nessun file allegato. Clicca su "+ Allega File" per caricare contratti, PDF o liberatorie.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                    {selectedDayModal.data.files.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs"
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
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors"
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
