import { useState, useEffect } from 'react'

export default function ClockDriveBox({ width = '100%', height = 'calc(58px + 1.5cm)', compact = false, className = '', style = {} }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hhmm = time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  // Dimensionamento calibrato esattamente alla metà rispetto alla grandezza di partenza (58px vs 115px)
  const actualHeight = compact ? 'calc(29px + 0.75cm)' : height

  return (
    <div
      className={`border border-[#00c8c8] rounded-none ${compact ? 'py-1.5 px-3' : 'py-2 px-3'} text-center cursor-pointer hover:border-cyan-400 transition-all relative overflow-hidden group select-none shadow-sm flex flex-col items-center justify-center flex-shrink-0 ${className}`}
      style={{ backgroundColor: '#ffffff', width, height: actualHeight, ...style }}
      onClick={() => window.open('https://drive.google.com', '_blank')}
      title="Clicca per aprire Google Drive"
    >
      {/* Sfondo: Logo Google Drive centrato e proporzionato */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img
          src="/google-drive-logo.jpg"
          alt="Google Drive Logo"
          className={`${compact ? 'w-[88px] h-[88px] opacity-35 scale-115' : 'w-[110px] h-[110px] opacity-40 scale-125'} object-contain group-hover:opacity-60 transition-opacity transform`}
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Contenuto testuale: ORE e Google Drive ben leggibili e proporzionati alla metà */}
      <div className="relative z-10 leading-tight">
        <div
          className="font-black tracking-wider text-[#111111] leading-tight"
          style={{ fontSize: compact ? '15.5px' : '18px' }}
        >
          ORE: {hhmm}
        </div>
        <div
          className="font-bold text-[#111111] tracking-wide leading-tight"
          style={{ fontFamily: 'Goldman, sans-serif', fontSize: compact ? '13px' : '15px', marginTop: '2px' }}
        >
          Google Drive
        </div>
      </div>
    </div>
  )
}
