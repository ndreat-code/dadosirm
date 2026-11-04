import { useState, useEffect, useRef } from 'react'

export default function AutomationsIcon({
  size = 22,
  strokeWidth = 2.0,
  color = 'currentColor',
  className = '',
  isClicked = false,
  onClick,
  ...props
}) {
  const baseStroke = strokeWidth ? Math.min(Number(strokeWidth), 1.95) : 1.85

  const [internalClicked, setInternalClicked] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isClicked) {
      setInternalClicked(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setInternalClicked(false)
      }, 400)
    }
  }, [isClicked])

  function handleClick(e) {
    setInternalClicked(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setInternalClicked(false)
    }, 400)
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
      strokeWidth={baseStroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 select-none group-hover:scale-110 ${className}`}
      style={{ overflow: 'visible' }}
      onClick={handleClick}
      {...props}
    >
      <defs>
        {/* Gradiente bianco lucente metallico e brillante per il fulmine */}
        <linearGradient id="automationsWhiteShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
      </defs>

      {/* ── FULMINE TRIGGER A SINISTRA: SOLAMENTE lui diventa bianco lucente e risaltato con bagliore fluido ── */}
      <path
        d="M13 2 L4.5 12.5 L11 12.5 L10 22 L19.5 10.5 L13.5 10.5 Z"
        fill={isPopping ? 'url(#automationsWhiteShine)' : 'none'}
        stroke={isPopping ? '#ffffff' : color}
        strokeWidth={isPopping ? baseStroke * 1.15 : baseStroke}
        style={{
          transformOrigin: '11px 12px',
          transform: isPopping ? 'scale(1.15)' : 'scale(1)',
          filter: isPopping
            ? 'drop-shadow(0 0 3px #ffffff) drop-shadow(0 0 8px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.85))'
            : 'none',
          transition: 'fill 180ms cubic-bezier(0.16, 1, 0.3, 1), stroke 180ms cubic-bezier(0.16, 1, 0.3, 1), filter 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* ── NODO AUTOMAZIONE / FEEDBACK A DESTRA: Resta neutro e immutato ── */}
      <circle
        cx="18"
        cy="5"
        r="2"
        strokeWidth={baseStroke * 0.9}
      />
      <path
        d="M16 5 H14"
        strokeWidth={baseStroke * 0.8}
      />
    </svg>
  )
}
