import { useState, useEffect } from 'react'

export default function ClockDriveBox({
  width = '100%',
  height = '48px',
  onlyTime = true,
  compact = false,
  className = '',
  style = {}
}) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hhmm = time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  const digits = hhmm.replace(/[^0-9]/g, '')
  const d1 = digits[0] || '0'
  const d2 = digits[1] || '0'
  const d3 = digits[2] || '0'
  const d4 = digits[3] || '0'

  // Colori richiesti: Giallo, Viola, Blu, Arancione (inscuriti / saturi su fondo scuro)
  const colorYellow = '#facc15' // Giallo vivo
  const colorPurple = '#c084fc' // Viola vivo
  const colorBlue   = '#38bdf8' // Blu / Ciano vivo
  const colorOrange = '#ff6f43' // Arancione vivido DADO

  if (compact) {
    return (
      <div
        className={`rounded-2xl text-center cursor-pointer transition-all relative overflow-hidden group select-none flex flex-col items-center justify-center shrink-0 mx-auto ${className}`}
        style={{
          background: 'linear-gradient(145deg, #232833 0%, #11141a 100%)',
          border: '1px solid #3d4656',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 3px 8px rgba(0, 0, 0, 0.45)',
          width: width || '56px',
          height: height || '48px',
          ...style
        }}
        onClick={() => window.open('https://drive.google.com', '_blank')}
        title={`Google Drive • Ore: ${hhmm}`}
      >
        {/* Sfondo: Logo Google Drive sfumato scuro */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src="/google-drive-logo.jpg"
            alt="Google Drive Logo"
            className="w-[42px] h-[42px] object-contain opacity-15 group-hover:opacity-30 transition-opacity"
            style={{ mixBlendMode: 'screen' }}
          />
        </div>

        {/* Cifre Ingrandite e Inscurite: Giallo, Viola, Blu, Arancione */}
        <div
          className="relative z-10 leading-none flex items-center justify-center select-none"
          style={{
            fontFamily: '"Switzer", sans-serif',
            fontSize: '18px',
            fontWeight: 900,
            letterSpacing: '0.03em'
          }}
        >
          {/* Cifra 1: Giallo */}
          <span style={{ color: colorYellow, textShadow: '0 0 6px rgba(250, 204, 21, 0.35)' }}>
            {d1}
          </span>
          {/* Cifra 2: Viola */}
          <span style={{ color: colorPurple, textShadow: '0 0 6px rgba(192, 132, 252, 0.35)' }}>
            {d2}
          </span>
          {/* Separatore : */}
          <span className="text-white/60 mx-[1.5px] font-bold animate-pulse text-[15px]">
            :
          </span>
          {/* Cifra 3: Blu */}
          <span style={{ color: colorBlue, textShadow: '0 0 6px rgba(56, 189, 248, 0.35)' }}>
            {d3}
          </span>
          {/* Cifra 4: Arancione */}
          <span style={{ color: colorOrange, textShadow: '0 0 6px rgba(255, 111, 67, 0.35)' }}>
            {d4}
          </span>
        </div>
      </div>
    )
  }

  // Versione allargata (barra estesa in Dashboard o altri contesti)
  return (
    <div
      className={`rounded-2xl py-2 px-3 text-center cursor-pointer transition-all relative overflow-hidden group select-none flex flex-col items-center justify-center shrink-0 ${className}`}
      style={{
        background: 'linear-gradient(145deg, #232833 0%, #11141a 100%)',
        border: '1px solid #3d4656',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 3px 8px rgba(0, 0, 0, 0.45)',
        width,
        height,
        ...style
      }}
      onClick={() => window.open('https://drive.google.com', '_blank')}
      title="Google Drive"
    >
      {/* Sfondo: Logo Google Drive centrato in trasparenza scura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img
          src="/google-drive-logo.jpg"
          alt="Google Drive Logo"
          className="w-[70px] h-[70px] object-contain opacity-15 group-hover:opacity-30 transition-opacity"
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      {/* Cifre Ingrandite e Inscurite: Giallo, Viola, Blu, Arancione */}
      <div className="relative z-10 leading-none flex items-center justify-center">
        <div
          className="leading-none flex items-center justify-center tracking-wider"
          style={{
            fontSize: '21px',
            fontFamily: '"Switzer", sans-serif',
            fontWeight: 900,
            letterSpacing: '0.05em'
          }}
        >
          {/* Cifra 1: Giallo */}
          <span style={{ color: colorYellow, textShadow: '0 0 8px rgba(250, 204, 21, 0.35)' }}>
            {d1}
          </span>
          {/* Cifra 2: Viola */}
          <span style={{ color: colorPurple, textShadow: '0 0 8px rgba(192, 132, 252, 0.35)' }}>
            {d2}
          </span>
          {/* Separatore : */}
          <span className="text-white/60 mx-[2px] font-bold animate-pulse text-[18px]">
            :
          </span>
          {/* Cifra 3: Blu */}
          <span style={{ color: colorBlue, textShadow: '0 0 8px rgba(56, 189, 248, 0.35)' }}>
            {d3}
          </span>
          {/* Cifra 4: Arancione */}
          <span style={{ color: colorOrange, textShadow: '0 0 8px rgba(255, 111, 67, 0.35)' }}>
            {d4}
          </span>
        </div>
      </div>
    </div>
  )
}
