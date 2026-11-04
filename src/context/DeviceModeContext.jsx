import { createContext, useContext, useState } from 'react'

const DeviceModeContext = createContext({
  deviceMode: 'pc', // 'pc' su porta 3000 | 'mobile-swipe' su porta 3006
  mobileShellStyle: 'phone',
  isMobileApp: false,
  isSwipeCopy: false,
  isDualMobile: false,
  sidebarOpenProgress: 1,
  isNarrowViewport: false,
  setDeviceMode: () => {},
  setMobileShellStyle: () => {},
  toggleDeviceMode: () => {},
})

function resolveInitialDeviceMode() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const view = params.get('view')
    if (view === 'swipe') return 'mobile-swipe'
    if (view === 'fixed') return 'mobile'
    if (view === 'dual') return 'mobile-dual'
    if (view === 'pc') return 'pc'

    // Su porta 3006 mostra la Mobile App (Copia con Barra a Scomparsa)
    if (window.location.port === '3006') {
      return 'mobile-swipe'
    }
  }
  // Su localhost:3000 mostra SEMPRE il CRM Web/PC originale prima della versione smartphone
  return 'pc'
}

export function DeviceModeProvider({ children }) {
  const [deviceMode, setDeviceMode] = useState(resolveInitialDeviceMode)
  const [mobileShellStyle, setMobileShellStyle] = useState('phone')

  const isMobileApp = deviceMode !== 'pc'
  const isSwipeCopy = deviceMode === 'mobile-swipe'
  const isDualMobile = deviceMode === 'mobile-dual'

  return (
    <DeviceModeContext.Provider
      value={{
        deviceMode,
        mobileShellStyle,
        isMobileApp,
        isSwipeCopy,
        isDualMobile,
        sidebarOpenProgress: isSwipeCopy ? 0 : 1,
        isNarrowViewport: false,
        setDeviceMode,
        setMobileShellStyle,
        toggleDeviceMode: () => {},
      }}
    >
      {children}
    </DeviceModeContext.Provider>
  )
}

export function MobileInstanceScope({ isSwipeCopy, sidebarOpenProgress = 1, children }) {
  const parent = useContext(DeviceModeContext)
  return (
    <DeviceModeContext.Provider
      value={{
        ...parent,
        isSwipeCopy: Boolean(isSwipeCopy),
        sidebarOpenProgress,
      }}
    >
      {children}
    </DeviceModeContext.Provider>
  )
}

export function useDeviceMode() {
  return useContext(DeviceModeContext)
}
