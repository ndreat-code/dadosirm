import { useState, useEffect, useRef } from 'react'

/**
 * UsersRevolvingIcon — Icona dinamica per "Utenti & Permessi di Accesso"
 * Movimento ad arco orbitale tipo "girotondo" (0.50s), continuo, fluido ed elegante.
 * Sagome sempre intere al 100% (zero maschere di ritaglio per evitare tagli a metà all'avvio).
 */
export default function UsersRevolvingIcon({
  size = 22,
  strokeWidth = 2.0,
  color = 'currentColor',
  className = '',
  isSwapped = false,
  isRevolving = false,
  onClick,
  ...props
}) {
  const [internalSwapped, setInternalSwapped] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const timerRef = useRef(null)

  // Calcola se le sagome sono attualmente scambiate
  const isCurrentSwapped = typeof isSwapped === 'boolean' ? isSwapped : internalSwapped

  useEffect(() => {
    if (isRevolving) {
      triggerGirotondo()
    }
  }, [isRevolving])

  function triggerGirotondo() {
    setIsRotating(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsRotating(false)
    }, 500)
  }

  function handleClick(e) {
    if (onClick) onClick(e)
    // Se non controllato dall'esterno tramite prop isRevolving, gestisce internamente
    if (typeof isSwapped !== 'boolean' && !isRevolving) {
      const nextSwapped = !internalSwapped
      setInternalSwapped(nextSwapped)
      triggerGirotondo()
    }
  }

  let animClassA = ''
  let animClassB = ''

  if (isRotating) {
    if (isCurrentSwapped) {
      // Girotondo: A (davanti) compie l'arco verso dietro; B (dietro) compie l'arco verso davanti
      animClassA = 'animate-girotondo-a-to-back'
      animClassB = 'animate-girotondo-b-to-front'
    } else {
      // Girotondo di ritorno: A torna davanti via arco posteriore; B torna dietro via arco anteriore
      animClassA = 'animate-girotondo-a-to-front'
      animClassB = 'animate-girotondo-b-to-back'
    }
  }

  // Sagoma A (In primo piano originariamente a sinistra, X=8.5, Y=11.5)
  // Sagoma sempre intera al 100%, mai tagliata da maschere
  const renderSilA = () => (
    <g
      key="sil-A"
      className={`origin-[8.5px_12px] ${animClassA}`}
      style={{
        transform: !isRotating
          ? isCurrentSwapped
            ? 'translate(7.0px, -1.8px) scale(0.85)'
            : 'translate(0px, 0px) scale(1)'
          : undefined,
        opacity: !isRotating ? (isCurrentSwapped ? 0.72 : 1) : undefined,
      }}
    >
      {/* Profilo busto e spalle aperto in basso: NESSUNA linea orizzontale */}
      <path
        d="M 2.5 21.5 v -2.9 c 0 -2.4 1.8 -4.2 4.2 -4.2 h 3.6 c 2.4 0 4.2 1.8 4.2 4.2 v 2.9"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Testa circolare */}
      <circle
        cx="8.5"
        cy="7.2"
        r="3.6"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )

  // Sagoma B (Originariamente sullo sfondo a destra, X=15.5, Y=9.5)
  // Sagoma sempre intera al 100%, mai tagliata da maschere
  const renderSilB = () => (
    <g
      key="sil-B"
      className={`origin-[15.5px_11px] ${animClassB}`}
      style={{
        transform: !isRotating
          ? isCurrentSwapped
            ? 'translate(-7.0px, 1.8px) scale(1.18)'
            : 'translate(0px, 0px) scale(1)'
          : undefined,
        opacity: !isRotating ? (isCurrentSwapped ? 1 : 0.72) : undefined,
      }}
    >
      {/* Profilo busto e spalle aperto in basso: NESSUNA linea orizzontale */}
      <path
        d="M 10.3 20.2 v -2.5 c 0 -1.9 1.5 -3.3 3.3 -3.3 h 3.8 c 1.8 0 3.3 1.4 3.3 3.3 v 2.5"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth * 0.95}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Testa circolare */}
      <circle
        cx="15.5"
        cy="6.2"
        r="3.1"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth * 0.95}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cursor-pointer overflow-visible select-none ${className}`}
      onClick={handleClick}
      {...props}
    >
      {/* Rendering pulito senza maschere: chi è in primo piano viene renderizzato per secondo */}
      {isCurrentSwapped ? (
        <>
          {renderSilA()}
          {renderSilB()}
        </>
      ) : (
        <>
          {renderSilB()}
          {renderSilA()}
        </>
      )}
    </svg>
  )
}
