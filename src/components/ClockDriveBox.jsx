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

        {/* Cifre NERE dell'orologio ad alto contrasto */}
        <div
          className="relative z-10 leading-none flex items-center justify-center select-none text-[#000000]"
          style={{
            fontFamily: '"Switzer", sans-serif',
            fontSize: '18px',
            fontWeight: 900,
            letterSpacing: '0.03em',
            color: '#000000',
            textShadow: '0 0 4px #ffffff, 0 0 8px #ffffff',
            WebkitFontSmoothing: 'antialiased'
          }}
        >
          <span style={{ color: '#000000' }}>{d1}</span>
          <span style={{ color: '#000000' }}>{d2}</span>
          <span style={{ color: '#000000' }} className="mx-[1.5px] font-bold animate-pulse text-[15px]">:</span>
          <span style={{ color: '#000000' }}>{d3}</span>
          <span style={{ color: '#000000' }}>{d4}</span>
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
            color: '#000000',
            textShadow: '0 0 4px #ffffff, 0 0 8px #ffffff',
            WebkitFontSmoothing: 'antialiased'
          }}
        >
          <span style={{ color: '#000000' }}>{d1}</span>
          <span style={{ color: '#000000' }}>{d2}</span>
          <span style={{ color: '#000000' }} className="mx-[2px] font-bold animate-pulse text-[18px]">:</span>
          <span style={{ color: '#000000' }}>{d3}</span>
          <span style={{ color: '#000000' }}>{d4}</span>
        </div>
      </div>
    </div>
  )
}
