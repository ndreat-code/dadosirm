import { useState, useEffect } from 'react'

export default function ClockDriveBox({ width = '100%', height = 'calc(58px + 1.5cm)', className = '', style = {} }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hhmm = time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className={`border border-[#00c8c8] rounded-none py-2 px-3 text-center cursor-pointer hover:border-cyan-400 transition-all relative overflow-hidden group select-none shadow-sm flex flex-col items-center justify-center flex-shrink-0 ${className}`}
      style={{ backgroundColor: '#ffffff', width, height, ...style }}
      onClick={() => window.open('https://drive.google.com', '_blank')}
      title="Clicca per aprire Google Drive"
    >
      {/* Sfondo: Logo Google Drive ingrandito e centrato */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img
          src="/google-drive-logo.jpg"
          alt="Google Drive Logo"
          className="w-[110px] h-[110px] object-contain opacity-40 group-hover:opacity-60 transition-opacity transform scale-125"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Contenuto testuale: ORE (18px) è 2 punti più grande di Google Drive (16px) */}
      <div className="relative z-10 leading-tight">
        <div
          className="font-black tracking-wider text-[#111111] leading-tight"
          style={{ fontSize: '18px' }}
        >
          ORE: {hhmm}
        </div>
        <div
          className="font-bold text-[#111111] mt-0.5 tracking-wide leading-tight"
          style={{ fontFamily: 'Goldman, sans-serif', fontSize: '15px' }}
        >
          Google Drive
        </div>
      </div>
    </div>
  )
}
