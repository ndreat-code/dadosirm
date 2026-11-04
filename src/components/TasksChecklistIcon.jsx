import { useState, useEffect, useRef } from 'react'

export default function TasksChecklistIcon({
  size = 22,
  strokeWidth = 2.0,
  color = 'currentColor',
  className = '',
  isClicked = false,
  onClick,
  ...props
}) {
  const [animKey, setAnimKey] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isClicked) {
      setAnimKey((k) => k + 1)
      setIsDrawing(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setIsDrawing(false)
      }, 650)
    }
  }, [isClicked])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleClick(e) {
    setAnimKey((k) => k + 1)
    setIsDrawing(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsDrawing(false)
    }, 650)
    if (onClick) onClick(e)
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ overflow: 'visible' }}
      onClick={handleClick}
      {...props}
    >
      <style>{`
        @keyframes dadoPencilStroke1 {
          0% {
            stroke-dashoffset: 15;
            opacity: 0.35;
          }
          10% {
            opacity: 1;
          }
          46% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        @keyframes dadoPencilStroke2 {
          0%, 42% {
            stroke-dashoffset: 15;
            opacity: 0;
          }
          48% {
            opacity: 1;
          }
          92% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
      `}</style>

      {/* Quadratino superiore (leggermente più sottile per far risaltare gli assi della crocetta che sporgono fuori) */}
      <rect
        x="3.2"
        y="3.6"
        width="6.2"
        height="6.2"
        rx="1.1"
        strokeWidth={Math.max(1.35, strokeWidth * 0.78)}
        opacity="0.82"
      />

      {/* Crocetta (X) con assi allungati anche al di fuori del quadratino superiore (da 1.35 a 11.25) */}
      <g key={animKey}>
        {/* Tratto diagonale 1 (\) che sborda oltre gli angoli del quadratino */}
        <path
          d="M 1.35 1.85 L 11.25 11.55"
          strokeWidth={strokeWidth * 1.08}
          strokeDasharray="15"
          strokeDashoffset="0"
          style={
            isDrawing
              ? {
                  animation: 'dadoPencilStroke1 580ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
                }
              : undefined
          }
        />
        {/* Tratto diagonale 2 (/) che sborda oltre gli angoli del quadratino */}
        <path
          d="M 11.25 1.85 L 1.35 11.55"
          strokeWidth={strokeWidth * 1.08}
          strokeDasharray="15"
          strokeDashoffset="0"
          style={
            isDrawing
              ? {
                  animation: 'dadoPencilStroke2 580ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
                }
              : undefined
          }
        />
      </g>

      {/* Quadratino inferiore VUOTO (senza tick sottostante) */}
      <rect
        x="3.2"
        y="14.2"
        width="6.2"
        height="6.2"
        rx="1.1"
        strokeWidth={Math.max(1.45, strokeWidth * 0.85)}
      />

      {/* Righe orizzontali della lista Tasks a destra */}
      <path d="M 14 6.75 H 21.5" />
      <path d="M 14 12 H 21.5" />
      <path d="M 14 17.25 H 21.5" />
    </svg>
  )
}
