import { useId } from 'react'

/**
 * CrmFuturisticLogo - Renderizza il testo vettoriale "CRM" ispirato esattamente
 * al font futuristico/geometrico (con tagli stencil, ali ricurve superiori e tagli a 45°).
 *
 * Colori: Acqua verde di Sardegna, Bianco perla e Blu notte chiaro, con contorno
 * netto (outline stroke) e ombreggiatura profonda multi-livello (drop-shadow) attiva
 * sia dentro che fuori dalla schermata CRM.
 */
export default function CrmFuturisticLogo({
  isActive = false,
  isFullDashboard = false,
  width,
  height,
  className = '',
  style = {},
  color = null,
  outlineColor = null,
  outlineWidth = 3.6,
  withOutline = true,
  withShadow = true,
}) {
  const uniqueId = useId().replace(/:/g, '')
  const fillGradientId = `crm-fill-${uniqueId}`
  const strokeGradientId = `crm-stroke-${uniqueId}`

  // Dimensioni proporzionate al layout della barra laterale (aspect ratio ~ 3.7 : 1)
  // Ingrandite di 3 punti (altezza da 16 -> 19 in full dashboard, da 12 -> 15 in modalità compatta/altre viste)
  const defaultWidth = isFullDashboard ? 71 : 56
  const defaultHeight = isFullDashboard ? 19 : 15

  const finalWidth = width ?? defaultWidth
  const finalHeight = height ?? defaultHeight

  // Ombreggiatura multi-livello con profondità 3D e alone luminoso:
  // 1. Riflesso speculare perla sui bordi
  // 2. Alone sfumato Acqua Verde di Sardegna
  // 3. Alone di profondità Blu Notte Chiaro elettrico
  // 4. Ombra d'appoggio scura (3D drop shadow) per staccare il testo dal background scuro
  const filterStyle = !withShadow
    ? 'none'
    : isActive
    ? 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 8px rgba(45, 212, 191, 0.85)) drop-shadow(0 0 16px rgba(56, 189, 248, 0.65)) drop-shadow(0 3px 6px rgba(0, 0, 0, 0.95))'
    : 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 7px rgba(45, 212, 191, 0.7)) drop-shadow(0 0 14px rgba(56, 189, 248, 0.5)) drop-shadow(0 2px 5px rgba(0, 0, 0, 0.95))'

  const finalFill = color ?? `url(#${fillGradientId})`
  const finalStroke = withOutline
    ? (outlineColor ?? `url(#${strokeGradientId})`)
    : 'none'

  return (
    <div
      className={`inline-flex items-center justify-center select-none transition-all duration-300 ${className}`}
      style={{
        width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
        height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
        filter: filterStyle,
        ...style
      }}
      title="DADO CRM • Portale Inbound Form Sito Web, Preventivi & Contatti Diretti"
    >
      <svg
        viewBox="0 0 216 58"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Gradiente Riempimento: Verde Acqua di Sardegna -> Bianco Perla -> Blu Notte Chiaro */}
          <linearGradient
            id={fillGradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            {isActive ? (
              <>
                <stop offset="0%" stopColor="#2dd4bf" />     {/* Verde Acqua Sardegna vivido */}
                <stop offset="25%" stopColor="#6ee7b7" />    {/* Riflesso smeraldo tenue */}
                <stop offset="50%" stopColor="#ffffff" />    {/* Bianco Perla abbagliante */}
                <stop offset="75%" stopColor="#7dd3fc" />    {/* Celeste acqua limpido */}
                <stop offset="100%" stopColor="#38bdf8" />   {/* Blu notte chiaro elettrico */}
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#14b8a6" />     {/* Verde Acqua Sardegna solido */}
                <stop offset="28%" stopColor="#2dd4bf" />    {/* Riflesso acqua limpido */}
                <stop offset="52%" stopColor="#ffffff" />    {/* Bianco Perla brillante */}
                <stop offset="76%" stopColor="#7dd3fc" />    {/* Celeste acqua */}
                <stop offset="100%" stopColor="#0284c7" />   {/* Blu notte chiaro profondo */}
              </>
            )}
          </linearGradient>

          {/* Gradiente Contorno (Outline): Traccia nitida che incornicia i tagli stencil del font */}
          <linearGradient
            id={strokeGradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            {isActive ? (
              <>
                <stop offset="0%" stopColor="#14b8a6" />     {/* Bordo Verde Acqua vivo */}
                <stop offset="35%" stopColor="#ffffff" />    {/* Bordo Perla puro */}
                <stop offset="70%" stopColor="#38bdf8" />    {/* Bordo Celeste chiaro */}
                <stop offset="100%" stopColor="#0284c7" />   {/* Bordo Blu notte elettrico */}
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#2dd4bf" />     {/* Bordo Verde Acqua evidente */}
                <stop offset="35%" stopColor="#ffffff" />    {/* Bordo Perla brillante */}
                <stop offset="70%" stopColor="#38bdf8" />    {/* Bordo Blu notte chiaro */}
                <stop offset="100%" stopColor="#0284c7" />   {/* Bordo profondo */}
              </>
            )}
          </linearGradient>
        </defs>

        {/* Master Group con Contorno Vettoriale e Riempimento (paintOrder assicura che il tratto si sviluppi all'esterno) */}
        <g
          fill={finalFill}
          stroke={finalStroke}
          strokeWidth={withOutline ? outlineWidth : 0}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ paintOrder: 'stroke fill' }}
        >
          {/* ── LETTERA C (w=58, h=56) ── */}
          <g className="crm-letter-c">
            {/* Ala superiore ricurva con taglio a 45° a destra */}
            <path d="M 11 0 L 58 0 L 49 7 L 1 7 C 4 3.5 7 1 11 0 Z" />
            {/* Asta inferiore ricurva con angolo arrotondato in basso a sinistra */}
            <path d="M 1 24 L 9 24 L 9 44 C 9 47 11 48 14 48 L 57 48 L 57 55 L 56 56 L 11 56 C 5 54.5 1 49 1 43 Z" />
          </g>

          {/* ── LETTERA R (w=62, h=58) ── */}
          <g className="crm-letter-r" transform="translate(68, 0)">
            {/* Occhiello superiore con ala, barra centrale, gamba obliqua e fusto verticale */}
            <path
              fillRule="evenodd"
              d="M 0 0 L 52 0 C 58 1 62 6 62 13 C 62 20 58 26 52 28 L 38 28 L 58 56 L 47 56 L 29 28 L 12 28 L 12 56 L 4 56 L 4 23 L 44 23 C 49 23 53 19 53 14 C 53 9 49 7 44 7 L 10 7 C 6 4.5 3 2 0 0 Z"
            />
          </g>

          {/* ── LETTERA M (w=72, h=56) ── */}
          <g className="crm-letter-m" transform="translate(142, 0)">
            {/* Fusto sinistro con ala e diagonale discendente a taglio obliquo */}
            <path d="M 0 0 L 15 0 L 43 45 L 37 51 L 16 16 L 16 56 L 8 56 L 8 7 C 5 4.5 2 2 0 0 Z" />
            {/* Fusto destro con diagonale di raccordo a freccia */}
            <path d="M 61 0 L 72 0 L 72 56 L 64 56 L 64 16 L 54 28 L 48 22 L 61 0 Z" />
          </g>
        </g>
      </svg>
    </div>
  )
}

