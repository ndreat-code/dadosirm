import { useState, useEffect, useId, useRef } from 'react'

export default function Company3DIcon({
  size = 26,
  strokeWidth = 1.35,
  color = 'currentColor',
  className = '',
  simplified,
  isClicked = false,
  clickStep,
  isSwapped,
  isRevolving,
  onClick,
  ...props
}) {
  const clipId = useId()
  const [internalStep, setInternalStep] = useState(0)
  // 'base' = inquadratura iniziale (Torre Centrale al centro, stabile destro di scorcio a destra)
  // 'right-facade' = inquadratura sulla facciata frontale dello stabile attaccato a destra
  const [restingView, setRestingView] = useState('base')
  // 'idle' | 'to-right-facade' | 'around-back-to-base'
  const [animPhase, setAnimPhase] = useState('idle')
  const timerRef = useRef(null)
  const prevStepRef = useRef(clickStep ?? 0)

  const triggerStep = (stepNumber) => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (stepNumber % 2 === 1) {
      // 1° Click: ruota verso sinistra per inquadrare frontalmente la facciata dello stabile attaccato a destra
      setAnimPhase('to-right-facade')
      timerRef.current = setTimeout(() => {
        setRestingView('right-facade')
        setAnimPhase('idle')
      }, 580)
    } else {
      // 2° Click (ricliccando): prosegue nello stesso senso costeggiando il perimetro da dietro
      // facendo rientrare la facciata principale dalla parte opposta (da destra)
      setAnimPhase('around-back-to-base')
      timerRef.current = setTimeout(() => {
        setRestingView('base')
        setAnimPhase('idle')
      }, 580)
    }
  }

  useEffect(() => {
    if (typeof clickStep === 'number' && clickStep !== prevStepRef.current) {
      prevStepRef.current = clickStep
      if (clickStep > 0) {
        triggerStep(clickStep)
      }
    }
  }, [clickStep])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleClick = (e) => {
    if (onClick) onClick(e)
    // Se non è controllato da clickStep della Sidebar, gestisce il toggle internamente
    if (typeof clickStep !== 'number') {
      const next = internalStep + 1
      setInternalStep(next)
      triggerStep(next)
    }
  }

  // Tratti fini e nitidi in stile 3D architettonico
  const baseStroke = strokeWidth ? Math.min(Number(strokeWidth) * 0.62, 1.35) : 1.35
  const detailStroke = +(baseStroke * 0.86).toFixed(2)

  // Inquadratura Base (Offset 0 e +44 per chiudere il perimetro a 360° da dietro)
  const renderBaseSkyline = (offsetX = 0) => (
    <g transform={`translate(${offsetX}, 0)`}>
      <g strokeWidth={baseStroke}>
        {/* Palazzo a sinistra */}
        <path d="M2.2 21V12.2h5.3" />
        {/* Facciata di base (Torre Centrale in prospettiva frontale) */}
        <path d="M7.5 21V4.8h9V21" />
        {/* Porta d'ingresso con architrave */}
        <path d="M10.5 21v-3.4" />
        <path d="M13.5 21v-3.4" />
        <path d="M9.8 17.6h4.4" />
        {/* Stabile attaccato alla destra (visto di scorcio nell'inquadratura di base) */}
        <path d="M16.5 10.5l5.3 2.0V21" />
      </g>
      <g strokeWidth={detailStroke}>
        {/* Vetrate palazzo a sinistra */}
        <path d="M3.2 14.5h3.2" />
        <path d="M3.2 17.5h3.2" />
        {/* Vetrate Torre Centrale: 2 colonne orizzontali simmetriche */}
        <path d="M8.8 7.5h2.2" />
        <path d="M8.8 10.2h2.2" />
        <path d="M8.8 12.9h2.2" />
        <path d="M8.8 15.6h2.2" />
        <path d="M13.0 7.5h2.2" />
        <path d="M13.0 10.2h2.2" />
        <path d="M13.0 12.9h2.2" />
        <path d="M13.0 15.6h2.2" />
        {/* Vetrate stabile a destra */}
        <path d="M17.6 14.0l3.0 1.1" />
        <path d="M17.6 17.0l3.0 1.1" />
        <path d="M19.1 14.5v5.5" />
      </g>
    </g>
  )

  // Inquadratura sul Lato Destro (Offset +22):
  // - Al centro (29.5..38.5 -> 7.5..16.5 sullo schermo): la FACCIATA FRONTALE dello stabile attaccato a destra
  // - A sinistra (24.2..29.5 -> 2.2..7.5 sullo schermo): la Torre Centrale ora vista di scorcio a sinistra
  // - A destra (38.5..43.8 -> 16.5..21.8 sullo schermo): il lato posteriore del perimetro che riporta allo stabile di partenza
  const renderRightBuildingFacadeView = () => (
    <g>
      <g strokeWidth={baseStroke}>
        {/* Raccordo continuo durante la rotazione */}
        {animPhase !== 'idle' && <path d="M21.8 12.5L24.2 6.8" />}

        {/* 1. A sinistra: la Torre Centrale passata a sinistra in prospettiva laterale */}
        <path d="M24.2 21V6.8l5.3-2.0V21" />

        {/* 2. Al centro (29.5..38.5): FACCIATA FRONTALE dello stabile attaccato alla destra */}
        <path d="M29.5 21V10.5h9V21" />

        {/* 3. A destra (38.5..43.8): ala del perimetro posteriore attaccata a destra */}
        <path d="M38.5 12.2h5.3V21" />

        {/* Raccordo del perimetro posteriore verso la vista di partenza (+44) durante il 2° click */}
        {animPhase !== 'idle' && <path d="M43.8 12.2h2.4" />}
      </g>

      <g strokeWidth={detailStroke}>
        {/* Vetrate in scorcio della Torre Centrale a sinistra */}
        <path d="M25.3 9.2l3.0-1.1" />
        <path d="M25.3 12.0l3.0-1.1" />
        <path d="M25.3 14.8l3.0-1.1" />
        <path d="M25.3 17.6l3.0-1.1" />

        {/* Vetrate frontali dello stabile attaccato a destra (ora inquadrato frontalmente al centro) */}
        <path d="M30.8 14.0h6.4" />
        <path d="M30.8 17.0h6.4" />
        <path d="M34.0 12.5v8.5" />

        {/* Vetrate dell'ala sul perimetro posteriore */}
        <path d="M39.5 14.5h3.2" />
        <path d="M39.5 17.5h3.2" />
      </g>
    </g>
  )

  const stripAnimClass =
    animPhase === 'to-right-facade'
      ? 'animate-companies-to-right-facade'
      : animPhase === 'around-back-to-base'
      ? 'animate-companies-around-back'
      : ''

  const restingTransform =
    animPhase === 'idle'
      ? restingView === 'right-facade'
        ? 'translateX(-22px)'
        : 'translateX(0px)'
      : undefined

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      onClick={handleClick}
      className={`${className} ${animPhase !== 'idle' ? 'animate-companies-globe-lens' : ''}`}
      {...props}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="1.5" y="1.2" width="21" height="19.8" rx="2" />
        </clipPath>
      </defs>

      {/* Linea base di fondazione fissa nell'inquadratura */}
      <path d="M1.5 21h21" strokeWidth={baseStroke} />

      {/* Fascia continua del perimetro dello stabile (0 -> -22px al 1° click; -22px -> -44px al 2° click) */}
      <g clipPath={`url(#${clipId})`}>
        <g
          className={stripAnimClass}
          style={restingTransform ? { transform: restingTransform } : undefined}
        >
          {/* Posizione 0 (0..22): Facciata di base */}
          {renderBaseSkyline(0)}

          {/* Posizione 1 (22..44): Facciata dello stabile attaccato alla destra */}
          {(restingView === 'right-facade' || animPhase !== 'idle') && renderRightBuildingFacadeView()}

          {/* Posizione 2 (44..66): Ritorno alla facciata di base dalla parte opposta (costeggiando il perimetro da dietro) */}
          {animPhase === 'around-back-to-base' && renderBaseSkyline(44)}
        </g>
      </g>
    </svg>
  )
}
