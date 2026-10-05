import { useState, useEffect, useRef } from 'react'

export default function CalendarPageFlipIcon({
  size = 22,
  strokeWidth = 2.0,
  color = 'currentColor',
  className = '',
  isClicked = false,
  onClick,
  ...props
}) {
  const baseStroke = strokeWidth ? Math.min(Number(strokeWidth), 1.95) : 1.85
  const detailStroke = +(baseStroke * 0.9).toFixed(2)

  const [internalClicked, setInternalClicked] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isClicked) {
      setInternalClicked(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setInternalClicked(false)
      }, 620)
    }
  }, [isClicked])

  function handleClick(e) {
    setInternalClicked(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setInternalClicked(false)
    }, 620)
    if (onClick) onClick(e)
  }

  const isFlipping = isClicked || internalClicked

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{
        width: size,
        height: size,
        perspective: '260px',
      }}
      onClick={handleClick}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full overflow-visible"
      >
        {/* ── 1. SCHIENALE / BLOCCO FOGLI POSTERIORE (DÀ PROFONDITÀ AL CALENDARIO STILIZZATO) ── */}
        <g strokeWidth={detailStroke} opacity={0.35}>
          {/* Spessore del blocco posteriore: fogli già sfogliati sul retro */}
          <path d="M5 2.5 H19 A2 2 0 0 1 21 4.5 V18" />
        </g>

        {/* ── 2. NUOVA PAGINA RIVELATA SUL FRONTE (SOTTOSTANTE) ── */}
        <g
          strokeWidth={baseStroke}
          className={isFlipping ? 'animate-calendar-revealed' : ''}
        >
          {/* Corpo della pagina del calendario */}
          <rect x="3" y="4" width="18" height="17" rx="2" fill="none" />
          {/* Barra orizzontale intestazione mese */}
          <line x1="3" y1="9.5" x2="21" y2="9.5" strokeWidth={baseStroke} />

          {/* Griglia puntini dei giorni (la nuova pagina attiva) */}
          <g strokeWidth={detailStroke} opacity={0.9}>
            <circle cx="8" cy="13.5" r="0.65" fill={color} />
            <circle cx="12" cy="13.5" r="0.65" fill={color} />
            <circle cx="16" cy="13.5" r="0.65" fill={color} />
            <circle cx="8" cy="17.5" r="0.65" fill={color} />
            <circle cx="12" cy="17.5" r="0.65" fill={color} />
            <circle cx="16" cy="17.5" r="0.65" fill={color} />
          </g>
        </g>

        {/* ── 3. LA PAGINA CHE VIENE SFOGLIATA E PORTATA ALL'INDIETRO ── */}
        {isFlipping && (
          <g
            className="animate-calendar-page-fold-back"
            style={{
              transformOrigin: '12px 4.5px',
              transformBox: 'fill-box',
            }}
          >
            {/* Foglio anteriore che ruota e va all'indietro */}
            <rect
              x="3"
              y="4"
              width="18"
              height="17"
              rx="2"
              fill="rgba(35, 40, 50, 0.4)"
              stroke={color}
              strokeWidth={baseStroke}
            />
            <line x1="3" y1="9.5" x2="21" y2="9.5" strokeWidth={baseStroke} />
            {/* Punti giorno sul foglio in rotazione */}
            <circle cx="8" cy="13.5" r="0.65" fill={color} />
            <circle cx="12" cy="13.5" r="0.65" fill={color} />
            <circle cx="16" cy="13.5" r="0.65" fill={color} />
            <circle cx="8" cy="17.5" r="0.65" fill={color} />
            <circle cx="12" cy="17.5" r="0.65" fill={color} />
            <circle cx="16" cy="17.5" r="0.65" fill={color} />
          </g>
        )}

        {/* ── 4. ANELLI / GANCI SUPERIORI (IN PRIMO PIANO: LA PAGINA RUOTA INTORNO AD ESSI E VA DIETRO) ── */}
        <g strokeWidth={baseStroke} opacity={0.95}>
          <line x1="8" y1="1.8" x2="8" y2="5.5" />
          <line x1="16" y1="1.8" x2="16" y2="5.5" />
        </g>
      </svg>
    </div>
  )
}
