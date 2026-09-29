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

  // Colori ordinati:
  // 1ª cifra: 🟡 Giallo canarino luminoso ad alta brillantezza (#ffd600)
  // 2ª cifra: 🟣 Viola profondo (#7e22ce)
  // Separatore : in antracite pulito (#334155)
  // 3ª cifra: 🔵 Blu tenue / Azzurro (#0ea5e9)
  // 4ª cifra: 🍑 Rosa pesca caldo (#f67280)
  const colorCanaryYellow = '#ffd600' // Giallo canarino brillante e luminoso
  const colorPurple       = '#7e22ce'
  const colorAnthracite   = '#334155'
  const colorSoftBlue     = '#0ea5e9'
  const colorPeachPink    = '#f67280' // Rosa pesca caldo e tenue

  if (compact) {
    return (
      <div
        className={`rounded-2xl text-center cursor-pointer transition-all relative overflow-hidden group select-none flex flex-col items-center justify-center shrink-0 mx-auto bg-white hover:shadow-md hover:scale-[1.02] ${className}`}
        style={{
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
          width: width || '56px',
          height: height || '48px',
          ...style
        }}
        onClick={() => window.open('https://drive.google.com', '_blank')}
        title={`Google Drive • Ore: ${hhmm}`}
      >
        {/* Sfondo: Logo Google Drive nitido in watermark con blend multiply su fondo bianco */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src="/google-drive-logo.jpg"
            alt="Google Drive Logo"
            className="w-[36px] h-[36px] object-contain opacity-25 group-hover:opacity-40 transition-opacity"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>

        {/* Cifre Ingrandite e Nitide ad alto contrasto: Giallo canarino luminoso, Viola, Blu (tenue), Rosa pesca */}
        <div
          className="relative z-10 leading-none flex items-center justify-center select-none"
          style={{
            fontFamily: '"Switzer", sans-serif',
            fontSize: '18px',
            fontWeight: 900,
            letterSpacing: '0.03em',
            WebkitFontSmoothing: 'antialiased'
          }}
        >
          {/* Cifra 1: Giallo canarino luminoso */}
          <span style={{ color: colorCanaryYellow, textShadow: '0 0.5px 1px rgba(161, 98, 7, 0.4), 0 0 8px rgba(255, 214, 0, 0.45)' }}>
            {d1}
          </span>
          {/* Cifra 2: Viola */}
          <span style={{ color: colorPurple }}>
            {d2}
          </span>
          {/* Separatore : in antracite pulito */}
          <span style={{ color: colorAnthracite }} className="mx-[1.5px] font-bold animate-pulse text-[15px]">
            :
          </span>
          {/* Cifra 3: Blu (tenue) */}
          <span style={{ color: colorSoftBlue }}>
            {d3}
          </span>
          {/* Cifra 4: Rosa pesca */}
          <span style={{ color: colorPeachPink }}>
            {d4}
          </span>
        </div>
      </div>
    )
  }

  // Versione allargata (barra estesa in Dashboard o altri contesti)
  return (
    <div
      className={`rounded-2xl py-2 px-3 text-center cursor-pointer transition-all relative overflow-hidden group select-none flex flex-col items-center justify-center shrink-0 bg-white hover:shadow-md hover:scale-[1.02] ${className}`}
      style={{
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
        width,
        height,
        ...style
      }}
      onClick={() => window.open('https://drive.google.com', '_blank')}
      title="Google Drive"
    >
      {/* Sfondo: Logo Google Drive centrato in trasparenza nitida */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img
          src="/google-drive-logo.jpg"
          alt="Google Drive Logo"
          className="w-[60px] h-[60px] object-contain opacity-25 group-hover:opacity-40 transition-opacity"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Cifre Ingrandite e Nitide ad alto contrasto: Giallo canarino luminoso, Viola, Blu (tenue), Rosa pesca */}
      <div className="relative z-10 leading-none flex items-center justify-center">
        <div
          className="leading-none flex items-center justify-center tracking-wider"
          style={{
            fontSize: '21px',
            fontFamily: '"Switzer", sans-serif',
            fontWeight: 900,
            letterSpacing: '0.05em',
            WebkitFontSmoothing: 'antialiased'
          }}
        >
          {/* Cifra 1: Giallo canarino luminoso */}
          <span style={{ color: colorCanaryYellow, textShadow: '0 0.5px 1px rgba(161, 98, 7, 0.4), 0 0 8px rgba(255, 214, 0, 0.45)' }}>
            {d1}
          </span>
          {/* Cifra 2: Viola */}
          <span style={{ color: colorPurple }}>
            {d2}
          </span>
          {/* Separatore : in antracite pulito */}
          <span style={{ color: colorAnthracite }} className="mx-[2px] font-bold animate-pulse text-[18px]">
            :
          </span>
          {/* Cifra 3: Blu (tenue) */}
          <span style={{ color: colorSoftBlue }}>
            {d3}
          </span>
          {/* Cifra 4: Rosa pesca */}
          <span style={{ color: colorPeachPink }}>
            {d4}
          </span>
        </div>
      </div>
    </div>
  )
}
