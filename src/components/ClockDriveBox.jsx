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

  const renderDigit = (d, width = '14px') => {
    const isOne = d === '1'
    return (
      <span
        className="inline-block text-center"
        style={{
          width,
          fontWeight: isOne ? 900 : 700,
          fontFamily: isOne
            ? '"Arial", -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", "Segoe UI", Roboto, sans-serif'
            : '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {d}
      </span>
    )
  }

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
        {/* Sfondo: Logo Google Drive con trasparenza intermedia tra prima e ora */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src="/google-drive-logo.jpg"
            alt="Google Drive Logo"
            className="w-[36px] h-[36px] object-contain opacity-50 group-hover:opacity-65 transition-opacity"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>

        {/* Cifre sobrie dell'orologio (21px, allontanate alle estremità) */}
        <div
          className="relative z-10 leading-none flex items-center justify-between w-full px-2 select-none text-slate-800"
          style={{
            fontSize: '21px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: '#1e293b',
            WebkitFontSmoothing: 'antialiased'
          }}
        >
          <div className="flex items-center">
            {renderDigit(d1, '12px')}
            {renderDigit(d2, '12px')}
          </div>
          <span className="font-medium text-slate-400 animate-pulse text-[16px]">:</span>
          <div className="flex items-center">
            {renderDigit(d3, '12px')}
            {renderDigit(d4, '12px')}
          </div>
        </div>
      </div>
    )
  }

  // Versione allargata / accorciata a metà (barra estesa in Dashboard)
  return (
    <div
      className={`rounded-2xl py-1.5 px-3 text-center cursor-pointer transition-all relative overflow-hidden group select-none flex flex-col items-center justify-center shrink-0 bg-white hover:shadow-md hover:scale-[1.02] ${className}`}
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
      {/* Sfondo: Logo Google Drive centrato in trasparenza intermedia tra prima e ora */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img
          src="/google-drive-logo.jpg"
          alt="Google Drive Logo"
          className="w-[46px] h-[46px] object-contain opacity-50 group-hover:opacity-65 transition-opacity"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Cifre sobrie ad alto contrasto (23px, allontanate alle estremità) */}
      <div className="relative z-10 leading-none flex items-center justify-between w-full px-3.5">
        <div
          className="flex items-center leading-none tracking-wider text-slate-800"
          style={{
            fontSize: '23px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: '#1e293b',
            WebkitFontSmoothing: 'antialiased'
          }}
        >
          {renderDigit(d1, '14px')}
          {renderDigit(d2, '14px')}
        </div>

        <span className="font-medium text-slate-400 animate-pulse text-[18px]">:</span>

        <div
          className="flex items-center leading-none tracking-wider text-slate-800"
          style={{
            fontSize: '23px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: '#1e293b',
            WebkitFontSmoothing: 'antialiased'
          }}
        >
          {renderDigit(d3, '14px')}
          {renderDigit(d4, '14px')}
        </div>
      </div>
    </div>
  )
}
