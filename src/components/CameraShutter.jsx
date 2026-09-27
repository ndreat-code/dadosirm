import { useEffect, useState } from 'react'

/**
 * CameraShutter — Animazione ottica a diaframma ad iride (Camera Lens Aperture)
 * Simula la chiusura e riapertura meccanica di un obiettivo fotografico/cinema
 * (stile Sony GM / Leica Cine) durante il riposizionamento delle cards e il focus dell'IA.
 */
export default function CameraShutter({ trigger, onMidpoint, duration = 650 }) {
  const [animating, setAnimating] = useState(false)
  const [phase, setPhase] = useState('idle') // 'closing' | 'closed' | 'opening' | 'idle'

  useEffect(() => {
    if (!trigger) return

    setAnimating(true)
    setPhase('closing')

    // A metà animazione (quando il diaframma è chiuso al massimo) scatta il cambio di layout
    const midTimer = setTimeout(() => {
      setPhase('closed')
      if (onMidpoint) onMidpoint()
      
      // Subito dopo inizia la riapertura verso la nuova visuale allargata
      setTimeout(() => {
        setPhase('opening')
      }, 70)
    }, duration * 0.42)

    // Fine animazione completa
    const endTimer = setTimeout(() => {
      setPhase('idle')
      setAnimating(false)
    }, duration)

    return () => {
      clearTimeout(midTimer)
      clearTimeout(endTimer)
    }
  }, [trigger, duration, onMidpoint])

  if (!animating && phase === 'idle') return null

  // Calcolo trasformazione lamelle diaframma in base alla fase
  const isClosing = phase === 'closing'
  const isClosed = phase === 'closed'
  const isOpening = phase === 'opening'

  // Scala apertura centro: da 1 (aperto) a 0.08 (chiuso a f/22)
  let irisScale = 1
  let irisRotation = 0
  let opacity = 1

  if (isClosing) {
    irisScale = 0.06
    irisRotation = 55
    opacity = 1
  } else if (isClosed) {
    irisScale = 0.04
    irisRotation = 65
    opacity = 1
  } else if (isOpening) {
    irisScale = 1.3
    irisRotation = 110
    opacity = 0
  }

  // 8 lamelle ottiche geometriche posizionate a 45 gradi
  const bladeCount = 8
  const blades = Array.from({ length: bladeCount }, (_, i) => {
    const angle = (i * 360) / bladeCount
    return { id: i, angle }
  })

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden"
      style={{
        perspective: '1200px',
        backgroundColor: isClosed ? 'rgba(0,0,0,0.55)' : 'transparent',
        transition: 'background-color 0.15s ease',
      }}
    >
      {/* Corpo Obiettivo Circolare (Barrel esterno) */}
      <div
        className="relative flex items-center justify-center select-none"
        style={{
          width: 'min(90vw, 560px)',
          height: 'min(90vw, 560px)',
          transform: isOpening ? 'scale(1.18)' : isClosing ? 'scale(1)' : 'scale(1.03)',
          opacity: opacity,
          transition: `all ${duration * 0.45}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        }}
      >
        {/* Ghiera esterna zigrinata & Marcature focali Cine */}
        <div
          className="absolute inset-0 rounded-full border-4 border-[#222222] shadow-[0_0_80px_rgba(0,0,0,0.9),inset_0_0_40px_rgba(0,0,0,0.8)]"
          style={{
            background: 'radial-gradient(circle, rgba(10,10,10,0.92) 0%, rgba(20,20,20,0.98) 70%, rgba(5,5,5,1) 100%)',
          }}
        >
          {/* Anello rosso Cine T* / Master Lens */}
          <div className="absolute inset-2 rounded-full border border-[#ff3333]/70 opacity-80" />
          
          {/* Anello millimetrato scala diaframmi f/1.4 - f/16 */}
          <div className="absolute inset-6 rounded-full border border-white/10 flex items-center justify-center">
            <div className="absolute top-2 text-[10px] font-mono tracking-widest text-[#00ffaa] font-bold">
              f/1.4 ── 2.8 ── 5.6 ── 11 ── 16
            </div>
            <div className="absolute bottom-2 text-[9px] font-mono tracking-wider text-white/50">
              DADO CINE 50mm T1.2 • SONY E-MOUNT
            </div>
          </div>
        </div>

        {/* Diaframma ad Iride (Iris Blades SVG) */}
        <svg
          viewBox="-200 -200 400 400"
          className="w-[78%] h-[78%] relative z-10 transition-transform"
          style={{
            transform: `rotate(${irisRotation}deg)`,
            transition: `transform ${duration * 0.42}ms cubic-bezier(0.25, 1, 0.5, 1)`,
          }}
        >
          <defs>
            <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="50%" stopColor="#2c2c2c" />
              <stop offset="100%" stopColor="#0d0d0d" />
            </linearGradient>
            <linearGradient id="bladeEdge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ffaa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Cerchio di contenimento scuro */}
          <circle cx="0" cy="0" r="185" fill="#0a0a0a" stroke="#333" strokeWidth="2" />

          {/* Lamelle sovrapposte che si chiudono a spirale */}
          <g
            style={{
              transform: `scale(${irisScale})`,
              transformOrigin: '0 0',
              transition: `transform ${duration * 0.42}ms cubic-bezier(0.2, 0.9, 0.3, 1)`,
            }}
          >
            {blades.map((b) => (
              <g key={b.id} transform={`rotate(${b.angle})`}>
                {/* Singola lamella d'iride a falce curvilinea */}
                <path
                  d="M 0,-180 C 70,-170 160,-90 170,0 C 130,50 60,70 0,60 C -40,30 -60,-80 0,-180 Z"
                  fill="url(#bladeGrad)"
                  stroke="#3a3a3a"
                  strokeWidth="1.5"
                />
                {/* Bordo riflettente titanio */}
                <path
                  d="M 0,-180 C 70,-170 160,-90 170,0"
                  fill="none"
                  stroke="url(#bladeEdge)"
                  strokeWidth="2"
                />
              </g>
            ))}
          </g>

          {/* Flash ottico centrale al momento dello scatto */}
          {isClosed && (
            <circle
              cx="0"
              cy="0"
              r="22"
              fill="#00ffaa"
              className="animate-ping"
              style={{ opacity: 0.85 }}
            />
          )}
        </svg>

        {/* Effetto bagliore riflesso lente anamorfica (Lens Flare streak ciano) */}
        <div
          className="absolute inset-x-[-20%] h-[3px] pointer-events-none transition-opacity"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(0, 229, 255, 0) 20%, rgba(0, 255, 170, 0.9) 50%, rgba(0, 229, 255, 0) 80%, transparent 100%)',
            opacity: isClosed ? 0.95 : 0,
            transform: isClosed ? 'scaleY(2.5)' : 'scaleY(0)',
            transition: 'all 0.15s ease',
            boxShadow: '0 0 20px #00e5ff',
          }}
        />
      </div>
    </div>
  )
}
