import React from 'react'
import { useDeviceMode } from '../context/DeviceModeContext'

const THEME_CONFIG = {
  dashboard: {
    canvasColor: '#f0f8fd',
    mobile:
      'linear-gradient(90deg, #2d3139 0%, #2d3139 28%, #3f5568 44%, #72abd4 60%, #bfe3f8 74%, #e6f4fc 84%, #f0f8fd 92%, #f0f8fd 100%)',
    desktop:
      'linear-gradient(90deg, #2d3139 0%, #2d3139 calc(100% - 580px), #3f5568 calc(100% - 460px), #72abd4 calc(100% - 340px), #bfe3f8 calc(100% - 230px), #e6f4fc calc(100% - 140px), #f0f8fd calc(100% - 60px), #f0f8fd 100%)',
  },
  inventory: {
    canvasColor: '#ecf8f5',
    mobile:
      'linear-gradient(90deg, #2d3139 0%, #2d3139 30%, #365c57 46%, #5da996 62%, #a8dfd0 75%, #daf2eb 85%, #ecf8f5 93%, #ecf8f5 100%)',
    desktop:
      'linear-gradient(90deg, #2d3139 0%, #2d3139 calc(100% - 580px), #365c57 calc(100% - 460px), #5da996 calc(100% - 340px), #a8dfd0 calc(100% - 230px), #daf2eb calc(100% - 140px), #ecf8f5 calc(100% - 60px), #ecf8f5 100%)',
  },
  companies: {
    canvasColor: '#f0f8fd',
    mobile:
      'linear-gradient(90deg, #2d3139 0%, #2d3139 32%, #42596e 48%, #76aed6 63%, #c1e4f9 76%, #e6f4fc 86%, #f0f8fd 93%, #f0f8fd 100%)',
    desktop:
      'linear-gradient(90deg, #2d3139 0%, #2d3139 calc(100% - 580px), #42596e calc(100% - 460px), #76aed6 calc(100% - 340px), #c1e4f9 calc(100% - 230px), #e6f4fc calc(100% - 140px), #f0f8fd calc(100% - 60px), #f0f8fd 100%)',
  },
  tasks: {
    canvasColor: '#f0f8fd',
    mobile:
      'linear-gradient(90deg, #2d3139 0%, #2d3139 30%, #42596e 46%, #76aed6 62%, #c1e4f9 75%, #e6f4fc 85%, #f0f8fd 93%, #f0f8fd 100%)',
    desktop:
      'linear-gradient(90deg, #2d3139 0%, #2d3139 calc(100% - 580px), #42596e calc(100% - 460px), #76aed6 calc(100% - 340px), #c1e4f9 calc(100% - 230px), #e6f4fc calc(100% - 140px), #f0f8fd calc(100% - 60px), #f0f8fd 100%)',
  },
  calendar: {
    canvasColor: '#ffffff',
    mobile:
      'linear-gradient(90deg, #2d3139 0%, #2d3139 32%, #525b69 48%, #9aa7b8 63%, #d8dfe8 76%, #f3f6f9 86%, #ffffff 93%, #ffffff 100%)',
    desktop:
      'linear-gradient(90deg, #2d3139 0%, #2d3139 calc(100% - 580px), #525b69 calc(100% - 460px), #9aa7b8 calc(100% - 340px), #d8dfe8 calc(100% - 230px), #f3f6f9 calc(100% - 140px), #ffffff calc(100% - 60px), #ffffff 100%)',
  },
  appunti: {
    canvasColor: '#f8fafc',
    mobile:
      'linear-gradient(90deg, #2d3139 0%, #2d3139 36%, #505a6b 52%, #94a1b4 67%, #d3dce6 79%, #eef3f7 88%, #f8fafc 94%, #f8fafc 100%)',
    desktop:
      'linear-gradient(90deg, #2d3139 0%, #2d3139 calc(100% - 580px), #505a6b calc(100% - 460px), #94a1b4 calc(100% - 340px), #d3dce6 calc(100% - 230px), #eef3f7 calc(100% - 140px), #f8fafc calc(100% - 60px), #f8fafc 100%)',
  },
}

export default function PageTopBand({
  title = '',
  titleNode = null,
  centerContent = null,
  theme = 'dashboard',
  thickDesktop = false,
  rightContent = null,
}) {
  const { isMobileApp, isSwipeCopy, sidebarOpenProgress = 0 } = useDeviceMode()
  const cfg = THEME_CONFIG[theme] || THEME_CONFIG.dashboard

  const desktopHeight = thickDesktop
    ? 'calc(3rem - 0.5cm + 0.3cm)'
    : 'calc(3rem - 0.5cm)'

  return (
    <div
      className="w-full flex-shrink-0 relative z-20"
      style={{ backgroundColor: cfg.canvasColor }}
    >
      <div
        className={`w-full rounded-none flex items-center justify-between select-none relative overflow-hidden ${
          isMobileApp ? 'px-2.5' : 'px-5 md:px-7'
        }`}
        style={{
          height: isMobileApp ? '36px' : desktopHeight,
          background: isMobileApp ? cfg.mobile : cfg.desktop,
          borderTopLeftRadius: '0px',
          borderBottomLeftRadius: '0px',
          borderTopRightRadius: '0px',
          borderBottomRightRadius: '0px',
        }}
      >
        {/* Velo di raccordo morbido sul margine inferiore destro/centrale per eliminare qualsiasi stacco con il canvas sottostante */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isMobileApp
              ? `linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 35%, ${cfg.canvasColor} 100%)`
              : `linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 40%, ${cfg.canvasColor} 100%)`,
            WebkitMaskImage: isMobileApp
              ? 'linear-gradient(90deg, transparent 0%, transparent 28%, rgba(0,0,0,0.45) 48%, rgba(0,0,0,0.9) 70%, black 85%)'
              : 'linear-gradient(90deg, transparent 0%, transparent calc(100% - 560px), rgba(0,0,0,0.45) calc(100% - 420px), rgba(0,0,0,0.9) calc(100% - 240px), black calc(100% - 90px))',
            maskImage: isMobileApp
              ? 'linear-gradient(90deg, transparent 0%, transparent 28%, rgba(0,0,0,0.45) 48%, rgba(0,0,0,0.9) 70%, black 85%)'
              : 'linear-gradient(90deg, transparent 0%, transparent calc(100% - 560px), rgba(0,0,0,0.45) calc(100% - 420px), rgba(0,0,0,0.9) calc(100% - 240px), black calc(100% - 90px))',
          }}
        />

        <div className="flex items-center gap-2 min-w-0 relative z-10">
          {/* Nella Copia Barra a Scomparsa mostra il logo DADO in alto a sinistra quando la barra è chiusa */}
          {isMobileApp && isSwipeCopy && (
            <div
              className="flex items-center justify-center select-none transition-all duration-200 flex-shrink-0"
              style={{
                opacity: Math.max(0, 1 - sidebarOpenProgress * 2.2),
                width: sidebarOpenProgress > 0.45 ? '0px' : 'auto',
                overflow: 'hidden',
                pointerEvents: sidebarOpenProgress > 0.3 ? 'none' : 'auto',
              }}
              title="DADO CRM"
            >
              <div className="inline-flex items-center gap-[1.5px] leading-none select-none pr-0.5">
                <svg width={11.2} height={14} viewBox="0 0 16 20" fill="none">
                  <path d="M0 0 H4 C10.6 0 16 4.5 16 10 C16 15.5 10.6 20 4 20 H0 Z" fill="#53ba75" />
                </svg>
                <svg width={12.6} height={14} viewBox="0 0 18 20" fill="none">
                  <polygon points="9 0, 18 20, 0 20" fill="#ea3824" />
                </svg>
                <svg width={11.2} height={14} viewBox="0 0 16 20" fill="none">
                  <path d="M0 0 H4 C10.6 0 16 4.5 16 10 C16 15.5 10.6 20 4 20 H0 Z" fill="#1bb7ed" />
                </svg>
                <svg width={14} height={14} viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#fac429" />
                </svg>
              </div>
            </div>
          )}

          {titleNode ? (
            titleNode
          ) : (
            title && (
              <h1
                className={`${
                  isMobileApp ? 'text-[14.5px]' : 'text-lg sm:text-xl'
                } font-black text-white tracking-tight leading-none select-none truncate`}
                style={{ fontFamily: '"Switzer", sans-serif' }}
              >
                {title}
              </h1>
            )
          )}
        </div>

        {centerContent && (
          <div
            className="absolute top-1/2 -translate-y-1/2 z-10 flex items-center"
            style={{ left: isMobileApp ? '46%' : '44%', transform: 'translate(-50%, -50%)' }}
          >
            {centerContent}
          </div>
        )}

        {rightContent && <div className="flex items-center flex-shrink-0 relative z-10">{rightContent}</div>}
      </div>
    </div>
  )
}
