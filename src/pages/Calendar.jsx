import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getTodayIso, getTomorrowIso, getCurrentWeekSundayIso } from '../utils/dateUtils'
import { getCalendarDayData, saveCalendarDayData } from '../utils/calendarData'
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
  ChevronRight,
  Plus
} from 'lucide-react'

// Nomi dei mesi e dei giorni in italiano
const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
]
const DAY_NAMES_SHORT = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM']
const DAY_NAMES_LONG = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

// Colori del brand logo DADO: Verde (D), Rosso (△), Ciano (D), Giallo (O)
const BRAND_COLORS = [
  '#53ba75', // Verde D
  '#ea3824', // Rosso △
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

  useEffect(() => {
    const handleUpdate = () => setCalendarVersion(v => v + 1)
    window.addEventListener('dado-calendar-update', handleUpdate)
    return () => window.removeEventListener('dado-calendar-update', handleUpdate)
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

  // Calcolo cadenza colori brand per i giorni con impegni consecutivi
  const commitmentCadenceMap = useMemo(() => {
    let count = 0
    const map = {}
    twoWeeksDays.forEach((day) => {
      const data = getCalendarDayData(day.iso)
      if (data?.events && data.events.length > 0) {
        map[day.iso] = count % BRAND_COLORS.length
        count++
      }
    })
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

  // Render di una settimana (7 colonne con linee fini)
  function renderWeekRow(weekDays, weekLabel) {
    return (
      <div className="w-full mb-4">
        {/* Intestazione giorni settimana */}
        <div className="grid grid-cols-7 border-t border-x border-slate-300 divide-x divide-slate-200 bg-slate-100/90 text-slate-700 text-center select-none">
          {weekDays.map((day) => (
            <div
              key={day.iso}
              className={`py-2 px-1 flex flex-col items-center justify-center transition-colors ${
                day.isToday ? 'bg-[#007a50]/10 text-[#007a50]' : ''
              }`}
            >
              <span className="text-[11px] font-mono font-bold tracking-wider leading-none">
                {day.shortName}
              </span>
              <span className={`text-[15px] font-mono font-black leading-tight mt-0.5 ${
                day.isToday ? 'text-[#007a50] underline underline-offset-2' : 'text-slate-900'
              }`}>
                {day.dayNum}
              </span>
            </div>
          ))}
        </div>

        {/* Griglia delle celle dei 7 giorni */}
        <div className="grid grid-cols-7 border-b border-x border-slate-300 divide-x divide-slate-200 bg-white">
          {weekDays.map((day) => {
            const dayData = getCalendarDayData(day.iso)
            const events = dayData?.events || []
            const hasNotes = Boolean(dayData?.notes && dayData.notes.trim())
            const isToday = day.isToday
            const isHighlighted = highlightedDayIso === day.iso
            const baseCadence = commitmentCadenceMap[day.iso] ?? 0

            return (
              <div
                key={day.iso}
                onClick={() => {
                  setHighlightedDayIso(day.iso)
                  openDayEditor(day)
                }}
                className={`min-h-[175px] max-h-[260px] p-2 flex flex-col justify-start gap-2 overflow-y-auto cursor-pointer transition-all hover:bg-slate-50/80 relative group ${
                  isHighlighted
                    ? 'ring-2 ring-inset ring-[#00a8ff] bg-sky-50/20'
                    : isToday
                    ? 'bg-emerald-50/15'
                    : ''
                }`}
                title={`Clicca per gestire note o allegati (${day.shortName} ${day.dayNum})`}
              >
                {/* Elenco Riquadri Impegni perimetrati con i colori del brand */}
                {events.length > 0 ? (
                  events.map((ev, evIdx) => {
                    const borderColor = BRAND_COLORS[(baseCadence + evIdx) % BRAND_COLORS.length]
                    return (
                      <div
                        key={evIdx}
                        className="bg-white rounded-lg p-2 text-left transition-shadow hover:shadow-md select-text"
                        style={{
                          border: `2px solid ${borderColor}`,
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        {/* 1. Orario (dalle - alle) & Badge */}
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className="font-mono font-black text-[9px] px-1.5 py-0.5 rounded leading-none"
                            style={{
                              backgroundColor: `${borderColor}18`,
                              color: '#111111',
                              border: `1px solid ${borderColor}50`,
                            }}
                          >
                            ⏰ {ev.time}
                          </span>
                        </div>

                        {/* 2. Azienda */}
                        <div className="font-black text-slate-900 text-[10.5px] leading-tight mb-0.5 truncate">
                          {ev.company}
                        </div>

                        {/* 3. Azione da svolgere */}
                        <div className="text-[9.5px] font-semibold text-slate-700 leading-snug mb-1 line-clamp-2">
                          {ev.title || ev.category || 'Attività programmata'}
                        </div>

                        {/* 4. Persone interessate */}
                        <div className="text-[8.5px] text-slate-600 flex items-center gap-1 mb-0.5 truncate">
                          <span className="text-slate-400 font-bold">👥</span>
                          <span className="truncate">{ev.people || ev.attendees || ev.contact || 'Team DADO Studio'}</span>
                        </div>

                        {/* 5. Luogo */}
                        {ev.location && (
                          <div className="text-[8.5px] text-slate-600 flex items-center gap-1 mb-0.5 truncate">
                            <span className="text-slate-400 font-bold">📍</span>
                            <span className="truncate">{ev.location}</span>
                          </div>
                        )}

                        {/* 6. Note */}
                        {(ev.notes || ev.materials) && (
                          <div className="text-[8px] text-slate-500 italic flex items-center gap-1 mt-0.5 truncate">
                            <span className="text-slate-400">📝</span>
                            <span className="truncate">{ev.notes || ev.materials}</span>
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : hasNotes ? (
                  <div className="p-2 bg-slate-50 rounded border border-dashed border-slate-300 text-[10px] text-slate-700 leading-snug italic">
                    "{dayData.notes}"
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-40 transition-opacity">
                    <Plus className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-screen md:min-h-0 bg-[#111111] flex flex-col flex-1 relative overflow-hidden font-sans">
      
      {/* ── CANVAS BIANCO ("FOGLIO") SENZA SCRITTE IN ALTO, SUDDIVISO GIÀ A 2 CM DAL LIMITE ── */}
      <div
        className="h-full flex-1 bg-white rounded-tl-[48px] rounded-bl-[48px] flex flex-col justify-between relative min-w-0 overflow-y-auto text-slate-800"
        style={{
          paddingTop: '2cm', // Già 2 cm sotto il limite del foglio
          paddingLeft: '2rem',
          paddingRight: '2rem',
          paddingBottom: '1.5rem',
        }}
      >

        {/* ── GRIGLIA BISETTIMANALE SUDDIVISA CON LINEE FINI ── */}
        <div className="flex-1 w-full flex flex-col justify-start">
          
          {/* Settimana 1 (7 giorni) */}
          {renderWeekRow(week1Days, 'Settimana 1')}

          {/* Settimana 2 (7 giorni) */}
          {renderWeekRow(week2Days, 'Settimana 2')}

        </div>

        {/* ── BARRA DI NAVIGAZIONE IN FONDO: SPOSTAMENTO DI 2 SETTIMANE IN 2 SETTIMANE ── */}
        {/* Riquadri con le frecce SEMPRE GRIGI e frecce NERE, con dal-al e mese corrente */}
        <div className="flex items-center justify-center pt-3 pb-2 select-none">
          <div className="bg-[#e5e7eb] border border-slate-300 rounded-2xl flex items-stretch shadow-md overflow-hidden">
            
            {/* Freccia Sinistra (Riquadro Grigio, Freccia Nera) */}
            <button
              onClick={handlePrevTwoWeeks}
              className="w-20 sm:w-24 bg-[#d1d5db] hover:bg-[#c4c8cf] active:bg-[#b0b5be] text-black flex items-center justify-center cursor-pointer transition-all active:scale-95 group border-r border-slate-300"
              title="Due settimane precedenti"
            >
              <ChevronLeft className="w-7 h-7 text-black group-hover:-translate-x-1 transition-transform stroke-[2.8]" />
            </button>

            {/* Display Centrale: (dal al e mese corrente) */}
            <div className="bg-[#f3f4f6] px-6 sm:px-10 py-3 flex flex-col items-center justify-center text-center min-w-[300px]">
              <div className="text-xs sm:text-sm font-black font-mono text-slate-900 tracking-wide flex items-center gap-2">
                <span>DAL {startDay.dayNum} {MONTH_NAMES[startDay.monthNum]?.toUpperCase()}</span>
                <span className="text-slate-400 font-bold">—</span>
                <span>AL {endDay.dayNum} {MONTH_NAMES[endDay.monthNum]?.toUpperCase()} {endDay.year}</span>
              </div>
              <div className="text-[11px] font-mono font-bold text-slate-600 mt-1 uppercase tracking-wider">
                MESE CORRENTE: {currentMonthName}
              </div>
            </div>

            {/* Freccia Destra (Riquadro Grigio, Freccia Nera) */}
            <button
              onClick={handleNextTwoWeeks}
              className="w-20 sm:w-24 bg-[#d1d5db] hover:bg-[#c4c8cf] active:bg-[#b0b5be] text-black flex items-center justify-center cursor-pointer transition-all active:scale-95 group border-l border-slate-300"
              title="Due settimane successive"
            >
              <ChevronRight className="w-7 h-7 text-black group-hover:translate-x-1 transition-transform stroke-[2.8]" />
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
