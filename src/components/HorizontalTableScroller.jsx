import { useRef, useState, useEffect } from 'react'
import { MoveHorizontal } from 'lucide-react'

export default function HorizontalTableScroller({
  children,
  shortcuts = [],
  className = '',
}) {
  const containerRef = useRef(null)
  const [wheelMode, setWheelMode] = useState(false) // Se attivo, la rotellina standard del mouse scorre orizzontalmente
  const [isDragging, setIsDragging] = useState(false)

  // Riferimenti per drag-to-scroll (pan con mouse)
  const dragInfo = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
  })

  // Listener per mouse wheel: se wheelMode è ON o se l'utente tiene premuto Shift
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e) => {
      if (wheelMode || e.shiftKey) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault()
          el.scrollLeft += e.deltaY * 1.2
        }
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [wheelMode])

  const scrollToShortcut = (sc) => {
    const el = containerRef.current
    if (!el) return

    // Misura la larghezza della colonna sticky bloccata a sinistra (Task / Azienda)
    const stickyHeader = el.querySelector('th.sticky, td.sticky')
    const stickyWidth = stickyHeader ? stickyHeader.getBoundingClientRect().width : (sc.stickyWidth || 360)

    let targetLeft = 0

    // Se è specificato un selettore DOM (es. [data-col="scadenza"])
    if (sc.selector) {
      const colEl = el.querySelector(sc.selector)
      if (colEl) {
        // offsetLeft è la posizione X assoluta della colonna nel contenitore
        // Sottraendo stickyWidth, la colonna si allinea ESATTAMENTE a destra della colonna sticky!
        targetLeft = Math.max(0, colEl.offsetLeft - stickyWidth)
      } else if (typeof sc.left === 'number') {
        targetLeft = sc.left <= 0 ? 0 : Math.max(0, sc.left - stickyWidth)
      }
    } else if (typeof sc.left === 'number') {
      targetLeft = sc.left <= 0 ? 0 : Math.max(0, sc.left - stickyWidth)
    }

    el.scrollTo({ left: targetLeft, behavior: 'smooth' })
  }

  // Gestione Drag-to-Scroll con mouse (click & drag)
  const handleMouseDown = (e) => {
    // Non avviare il trascinamento se si clicca su elementi interattivi
    const tag = e.target.tagName.toLowerCase()
    if (
      tag === 'input' ||
      tag === 'select' ||
      tag === 'button' ||
      tag === 'textarea' ||
      tag === 'a' ||
      e.target.closest('button') ||
      e.target.closest('select') ||
      e.target.closest('input')
    ) {
      return
    }

    const el = containerRef.current
    if (!el) return
    dragInfo.current.isDown = true
    dragInfo.current.hasMoved = false
    dragInfo.current.startX = e.pageX - el.offsetLeft
    dragInfo.current.scrollLeft = el.scrollLeft
    setIsDragging(true)
  }

  const handleMouseMove = (e) => {
    if (!dragInfo.current.isDown) return
    const el = containerRef.current
    if (!el) return
    const x = e.pageX - el.offsetLeft
    const walk = (x - dragInfo.current.startX) * 1.3
    if (Math.abs(walk) > 4) {
      dragInfo.current.hasMoved = true
      e.preventDefault()
      el.scrollLeft = dragInfo.current.scrollLeft - walk
    }
  }

  const handleMouseUp = () => {
    dragInfo.current.isDown = false
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    if (dragInfo.current.isDown) {
      dragInfo.current.isDown = false
      setIsDragging(false)
    }
  }

  return (
    <div className={`flex flex-col space-y-2 ${className}`} style={{ fontFamily: '"Switzer", sans-serif' }}>
      {/* ── BARRA DI NAVIGAZIONE ORIZZONTALE & QUICK JUMP ── */}
      <div className="flex items-center justify-between gap-2.5 px-3 py-1.5 bg-slate-100/90 rounded-xl border border-slate-200/90 shadow-2xs text-[12px] flex-wrap">
        {/* Sinistra: Scorciatoie Colonne (Quick Jump) */}
        {shortcuts.length > 0 ? (
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 min-w-0 flex-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
              Salta a:
            </span>
            {shortcuts.map((sc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToShortcut(sc)}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white hover:bg-sky-50 text-slate-700 hover:text-[#0284c7] border border-slate-200/90 hover:border-sky-300 transition-all shadow-2xs cursor-pointer truncate shrink-0"
                title={`Salta alla colonna "${sc.label}"`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        ) : (
          <div />
        )}

        {/* Destra: Switch Rotellina Mouse Orizzontale */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setWheelMode(!wheelMode)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all border shadow-2xs cursor-pointer ${
              wheelMode
                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sky-200'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300/80 hover:text-slate-900'
            }`}
            title="Se attivo, la rotellina del mouse scorre la tabella in orizzontale invece che in verticale"
          >
            <MoveHorizontal className={`w-3.5 h-3.5 ${wheelMode ? 'text-white' : 'text-[#0284c7]'}`} />
            <span>Rotellina Orizzontale: {wheelMode ? 'ATTIVA' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* ── CONTENITORE TABELLA SCROLLABILE CON DRAG & ROTATION WHEEL ── */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={`crm-horizontal-scrollbar border border-slate-200/90 rounded-xl bg-white shadow-2xs select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          scrollBehavior: 'smooth',
          userSelect: isDragging ? 'none' : 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}
