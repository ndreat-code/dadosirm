import { useState, useEffect, useMemo, useRef } from 'react'
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
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    const handleUpdate = () => setCalendarVersion(v => v + 1)
    window.addEventListener('dado-calendar-update', handleUpdate)
    return () => window.removeEventListener('dado-calendar-update', handleUpdate)
  }, [])

  // Supporto allo scorrimento orizzontale (destra/sinistra) tramite rotellina del mouse
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        el.scrollLeft += e.deltaY * 1.3
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const [selectedDayModal, setSelectedDayModal] = useState(null)
  const [editingNote, setEditingNote] = useState('')

  // Calcola i 14 giorni (2 settimane consecutive: Lunedì W1 → Domenica W2)
  const twoWeeksDays = useMemo(() => {
    const d = new Date(currentDate)
    const dayOfWeek = d.getDay()
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

    const monday = new Date(d)
    monday.setDate(d.getDate() + diffToMonday)
    monday.setHours(0, 0, 0, 0)

    const todayIso = getTodayIso(realTimeNow)

    const days = []
    for (let i = 0; i < 14; i++) {
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
        weekNumber: i < 7 ? 1 : 2,
      })
    }
    return days
  }, [currentDate, realTimeNow])

  // Calcolo linea fine colorata per giorni con impegni:
  // Se 2 o più giorni di fila, alterna in successione i colori del brand logo DADO (Verde, Rosso, Ciano, Giallo)
  const commitmentCadenceMap = useMemo(() => {
    const map = {}
    let streakIndex = -1

    for (let i = 0; i < twoWeeksDays.length; i++) {
      const day = twoWeeksDays[i]
      const dayData = getCalendarDayData(day.iso)
      const hasEvents = (dayData?.events || []).length > 0

      if (hasEvents) {
        if (streakIndex === -1) {
          // Controlla se il giorno immediatamente precedente aveva impegni
          const prevDate = new Date(day.dateObj)
          prevDate.setDate(prevDate.getDate() - 1)
          const prevIso = getTodayIso(prevDate)
          const prevData = getCalendarDayData(prevIso)
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
  }, [twoWeeksDays, calendarVersion])

  const week1Days = useMemo(() => twoWeeksDays.slice(0, 7), [twoWeeksDays])
  const week2Days = useMemo(() => twoWeeksDays.slice(7, 14), [twoWeeksDays])

  // Spostamento di 2 settimane in 2 settimane
  function handlePrevTwoWeeks() {
    setCurrentDate((prev) => {
      const n = new Date(prev)
      n.setDate(n.getDate() - 14)
      return n
    })
  }

  function handleNextTwoWeeks() {
    setCurrentDate((prev) => {
      const n = new Date(prev)
      n.setDate(n.getDate() + 14)
      return n
    })
  }

  // Apertura editor giorno
  function openDayEditor(dayInfo) {
    const existing = getCalendarDayData(dayInfo.iso)
    setEditingNote(existing?.notes || '')
    setSelectedDayModal({ ...dayInfo, data: existing })
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

  const startDay = twoWeeksDays[0]
  const endDay = twoWeeksDays[13]
  const currentMonthName = MONTH_NAMES[realTimeNow.getMonth()]?.toUpperCase()

  // Render di una settimana nel reticolo (7 colonne continue con linee divisorie laterali)
  function renderWeekRow(weekDays) {
    return (
      <div className="flex items-stretch w-full min-w-max">
        {weekDays.map((day, idx) => {
          const dayData = getCalendarDayData(day.iso)
          const events = dayData?.events || []
          const hasEvents = events.length > 0
          const hasNotes = Boolean(dayData?.notes && dayData.notes.trim())
          const isToday = day.isToday
          const isHighlighted = highlightedDayIso === day.iso
          const dayLineColor = commitmentCadenceMap[day.iso]

          // Linea divisoria laterale tra un giorno e l'altro:
          // Se il giorno ha impegni, linea fine (2.5px) colorata con la successione del brand DADO (Verde, Rosso, Ciano, Giallo)
          // Se non ha impegni, linea divisoria fine neutra
          const lateralBorder = dayLineColor
            ? `2.5px solid ${dayLineColor}`
            : '1px solid #e2e8f0'

          return (
            <div
              key={day.iso}
              onClick={() => {
                setHighlightedDayIso(day.iso)
                openDayEditor(day)
              }}
              className={`p-3 flex flex-col justify-between cursor-pointer transition-colors relative select-none flex-1 ${
                isHighlighted
                  ? 'bg-sky-50/60'
                  : isToday
                  ? 'bg-[#f8fafc] hover:bg-slate-100/60'
                  : 'bg-white hover:bg-slate-50'
              }`}
              style={{
                minWidth: '7.5cm',
                minHeight: '5.2cm',
                height: '5.2cm',
                // Niente riquadro per ciascun giorno! Solo linea divisoria laterale
                borderLeft: idx > 0 ? lateralBorder : (dayLineColor ? `2.5px solid ${dayLineColor}` : 'none'),
              }}
              title={`Clicca per gestire dettagli (${day.shortName} ${day.dayNum})`}
            >
              {/* 1. Intestazione Giorno: Nome e Data centrati e vicini (non spostato a destra) */}
              <div className="flex items-center justify-center gap-2 pb-1.5 border-b border-slate-100 flex-shrink-0">
                <span className="text-[13px] font-bold tracking-wider uppercase text-slate-500 font-switzer">
                  {day.shortName}
                </span>
                <span className={`text-[17px] font-black leading-none ${
                  day.isToday ? 'text-[#007a50]' : 'text-slate-900'
                }`}>
                  {day.dayNum}
                </span>
                {day.isToday && (
                  <span className="bg-[#007a50] text-white text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ml-0.5">
                    Oggi
                  </span>
                )}
              </div>

              {/* 2. Contenuto impegni: massimo spazio a disposizione, +2pt font, NO icone, NO riquadri colorati */}
              <div className="flex-1 overflow-y-auto pt-1.5 flex flex-col justify-between text-left pr-0.5">
                {hasEvents ? (
                  events.map((ev, evIdx) => (
                    <div
                      key={evIdx}
                      className={`text-left select-text flex flex-col justify-between h-full ${
                        evIdx > 0 ? 'pt-2 mt-2 border-t border-slate-100' : ''
                      }`}
                    >
                      <div>
                        {/* Orario e Nome Azienda (+2pt font, testo diretto) */}
                        <div className="flex items-baseline justify-between gap-1 mb-0.5">
                          <span className="font-mono font-bold text-[12px] text-slate-900 tracking-tight whitespace-nowrap">
                            {ev.time}
                          </span>
                          <span className="font-black text-slate-900 text-[13px] truncate flex-1 text-right" title={ev.company}>
                            {ev.company}
                          </span>
                        </div>

                        {/* Titolo / Attività da svolgere */}
                        <div className="text-[12px] font-medium text-slate-800 leading-snug line-clamp-2 my-0.5">
                          {ev.title || ev.category || 'Attività programmata'}
                        </div>
                      </div>

                      {/* Dettagli partecipanti, location e note (senza icone) */}
                      <div className="pt-1.5 border-t border-slate-100 flex flex-col gap-0.5 text-[10.5px] text-slate-600">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate max-w-[50%] font-medium">
                            {ev.people || ev.attendees || 'Team DADO'}
                          </span>
                          {ev.location && (
                            <span className="truncate max-w-[50%] text-right text-slate-500">
                              {ev.location}
                            </span>
                          )}
                        </div>

                        {(ev.notes || ev.materials) && (
                          <div className="text-[10px] text-slate-500 italic truncate">
                            {ev.notes || ev.materials}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : hasNotes ? (
                  <div className="h-full flex items-center justify-center p-2 text-[11.5px] text-slate-600 leading-relaxed italic text-center">
                    "{dayData.notes}"
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-[11px] text-slate-300">
                    {/* Spazio pulito nel reticolo */}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-full min-h-screen md:min-h-0 bg-transparent flex flex-col flex-1 relative overflow-hidden font-sans">
      
      {/* ── CANVAS BIANCO ("FOGLIO") DALL'ESTREMITÀ PER GUADAGNARE TUTTO LO SPAZIO ── */}
      <div
        className="h-full flex-1 bg-white rounded-tl-[48px] rounded-bl-[48px] flex flex-col justify-between relative min-w-0 overflow-hidden text-slate-800 p-2 sm:p-2.5"
        style={{
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
        }}
      >

        {/* ── RETICOLO BISETTIMANALE CONTINUO: DIVISORI LATERALI COLORATI E SCORREVOLE A ROTELLINA ── */}
        <div
          ref={scrollContainerRef}
          className="flex-1 w-full overflow-x-auto overflow-y-hidden select-none pb-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="w-full min-w-max border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-xs flex flex-col">
            {/* Settimana 1 (7 colonne continue) */}
            {renderWeekRow(week1Days)}

            {/* Linea orizzontale fine tra settimana 1 e 2 */}
            <div className="w-full border-t border-slate-200 flex-shrink-0" />

            {/* Settimana 2 (7 colonne continue) */}
            {renderWeekRow(week2Days)}
          </div>
        </div>

        {/* ── BARRA DI NAVIGAZIONE IN FONDO INGRANDITA: MESI A 3 LETTERE E FRECCE PROPORZIONALMENTE PIÙ GRANDI ── */}
        <div className="flex items-center justify-center pt-2 pb-3 select-none">
          <div className="bg-[#e5e7eb] border-2 border-slate-300 rounded-2xl flex items-stretch shadow-md overflow-hidden h-[66px]">
            
            {/* Freccia Sinistra (Riquadro Grigio, Freccia Nera Molto Più Grande) */}
            <button
              onClick={handlePrevTwoWeeks}
              className="w-20 sm:w-24 bg-[#d1d5db] hover:bg-[#c4c8cf] active:bg-[#b0b5be] text-black flex items-center justify-center cursor-pointer transition-all active:scale-95 group border-r-2 border-slate-300"
              title="Due settimane precedenti"
            >
              <ChevronLeft size={42} strokeWidth={3.2} className="text-black group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Display Centrale: Mesi a 3 lettere con testo grande e ben proporzionato */}
            <div className="bg-[#f3f4f6] px-8 sm:px-12 flex items-center justify-center text-center">
              <span className="text-lg sm:text-[21px] font-black font-mono text-slate-900 tracking-wider uppercase whitespace-nowrap">
                DAL {startDay.dayNum} {MONTH_NAMES_SHORT[startDay.monthNum]} AL {endDay.dayNum} {MONTH_NAMES_SHORT[endDay.monthNum]}
              </span>
            </div>

            {/* Freccia Destra (Riquadro Grigio, Freccia Nera Molto Più Grande) */}
            <button
              onClick={handleNextTwoWeeks}
              className="w-20 sm:w-24 bg-[#d1d5db] hover:bg-[#c4c8cf] active:bg-[#b0b5be] text-black flex items-center justify-center cursor-pointer transition-all active:scale-95 group border-l-2 border-slate-300"
              title="Due settimane successive"
            >
              <ChevronRight size={42} strokeWidth={3.2} className="text-black group-hover:translate-x-1 transition-transform" />
            </button>

          </div>
        </div>

      </div>

      {/* ── MODALE GESTIONE NOTE & ALLEGATI DEL GIORNO ── */}
      {selectedDayModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
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
                    Dettagli & Note del Giorno
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

            {/* Note della Giornata */}
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

            {/* File Allegati */}
            <div className="mb-4">
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
                <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-xl text-center text-xs text-white/40 font-mono">
                  Nessun file allegato. Clicca su "+ Allega File" per caricare contratti, PDF o liberatorie.
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
