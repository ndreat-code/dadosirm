import { useState, useEffect } from 'react'

export default function ClockDriveBox({
  width = '100%',
  height = 'calc(39px + 1cm)',
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

  if (compact) {
    return (
      <div
        className={`border border-[#00c8c8] rounded-xl text-center cursor-pointer hover:border-cyan-400 transition-all relative overflow-hidden group select-none shadow-sm flex flex-col items-center justify-center flex-shrink-0 mx-auto ${className}`}
        style={{
          backgroundColor: '#ffffff',
          width: width || '52px',
          height: height || '48px',
          ...style
        }}
        onClick={() => window.open('https://drive.google.com', '_blank')}
        title={`Google Drive - Ore: ${hhmm}`}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src="/google-drive-logo.jpg"
            alt="Google Drive Logo"
            className="w-[45px] h-[45px] object-contain opacity-25 group-hover:opacity-45 transition-opacity"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>
        <div className="relative z-10 leading-none flex flex-col items-center justify-center font-mono">
          <span className="text-[11px] font-black text-slate-900 leading-none">
            {hhmm}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`border border-[#00c8c8] rounded-none py-2 px-3 text-center cursor-pointer hover:border-cyan-400 transition-all relative overflow-hidden group select-none shadow-sm flex flex-col items-center justify-center flex-shrink-0 ${className}`}
      style={{ backgroundColor: '#ffffff', width, height, ...style }}
      onClick={() => window.open('https://drive.google.com', '_blank')}
      title="Clicca per aprire Google Drive"
    >
      {/* Sfondo: Logo Google Drive centrato e proporzionato */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img
          src="/google-drive-logo.jpg"
          alt="Google Drive Logo"
          className="w-[95px] h-[95px] object-contain opacity-35 group-hover:opacity-55 transition-opacity transform scale-115"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Contenuto testuale: solo l'orario (senza scritta google drive) */}
      <div className="relative z-10 leading-tight flex flex-col items-center justify-center">
        <div
          className="font-black tracking-wider text-[#111111] leading-none"
          style={{ fontSize: onlyTime ? '21px' : '18px', fontFamily: '"Switzer", sans-serif' }}
        >
          ORE: {hhmm}
        </div>
        {!onlyTime && (
          <div
            className="font-bold text-[#111111] tracking-wide leading-tight"
            style={{ fontFamily: 'Goldman, sans-serif', fontSize: '13px', marginTop: '2px' }}
          >
            Google Drive
          </div>
        )}
      </div>
    </div>
  )
}
