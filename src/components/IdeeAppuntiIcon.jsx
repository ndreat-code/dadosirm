import { useState, useEffect, useRef } from 'react'

export default function IdeeAppuntiIcon({
  size = 22,
  strokeWidth = 2.0,
  color = 'currentColor',
  className = '',
  isClicked = false,
  onClick,
  ...props
}) {
  // Tratti fini e nitidi in stile Lucide / Design System DADO:
  // - Lampadina stilizzata posizionata alla sinistra del foglio (simbolo di idee, illuminazione e intuizione)
  // - Foglio di appunti posizionato a destra con angolo piegato e 3 righe di testo
  const baseStroke = strokeWidth ? Math.min(Number(strokeWidth), 1.9) : 1.8
  const detailStroke = +(baseStroke * 0.82).toFixed(2)

  const [internalClicked, setInternalClicked] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isClicked) {
      setInternalClicked(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setInternalClicked(false)
      }, 540)
    }
  }, [isClicked])

  function handleClick(e) {
    setInternalClicked(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setInternalClicked(false)
    }, 540)
    if (onClick) onClick(e)
  }

  const isPopping = isClicked || internalClicked

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ overflow: 'visible' }}
      onClick={handleClick}
      {...props}
    >
      {/* ── 1. FOGLIO APPUNTI (POSIZIONATO A DESTRA) ── */}
      <g strokeWidth={baseStroke}>
        {/* Silhouette del foglio con angolo piegato in alto a destra */}
        <path d="M10.5 4.5 H16 L21 9.5 V19.5 A1.5 1.5 0 0 1 19.5 21 H10.5 A1.5 1.5 0 0 1 9 19.5 V15" />
        {/* Piega dell'angolo in alto a destra */}
        <path d="M16 4.5 V9.5 H21" />
      </g>

      <g strokeWidth={detailStroke}>
        {/* Le 3 righe di appunti sottolineate sul foglio */}
        <line x1="12.5" y1="13.5" x2="18.5" y2="13.5" />
        <line x1="12.5" y1="16.5" x2="18.5" y2="16.5" />
        <line x1="12.5" y1="19.0" x2="16.0" y2="19.0" />
      </g>

      {/* ── 2. LAMPADINA DELL'IDEA (POSIZIONATA ALLA SINISTRA DEL FOGLIO) ── */}
      {/* Mini-animazione: al click risalta istantaneamente (scale up + glow) e ritorna alla grandezza normale durante la transizione */}
      <g
        className={isPopping ? 'animate-bulb-pop' : ''}
        style={{ transformOrigin: '6.2px 11.5px' }}
      >
        <g strokeWidth={baseStroke}>
          {/* Bulbo della lampadina: arco superiore e rastremazione verso la base filettata */}
          <path d="M4.5 13.5 C3.3 12.2 2.2 10.4 2.2 8.5 A4.0 4.0 0 0 1 10.2 8.5 C10.2 10.4 9.1 12.2 7.9 13.5" />
          {/* Collare superiore della base */}
          <line x1="4.5" y1="13.5" x2="7.9" y2="13.5" />
        </g>

        <g strokeWidth={detailStroke}>
          {/* Filettatura della ghiera a vite */}
          <line x1="4.8" y1="15.5" x2="7.6" y2="15.5" />
          {/* Contatto inferiore stondato */}
          <path d="M5.2 17.2 C5.2 18.2 7.2 18.2 7.2 17.2" />
          {/* Filamento interno luminoso a V */}
          <path d="M5.0 9.0 L6.2 6.6 L7.4 9.0" />
        </g>
      </g>
    </svg>
  )
}
