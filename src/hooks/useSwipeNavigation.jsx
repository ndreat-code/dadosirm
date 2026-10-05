import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Sequenza ordinata delle schermate in base alla barra laterale (dall'alto verso il basso)
export const CRM_SCREENS = [
  { path: '/',           permission: 'dashboard',  label: 'Dashboard',               shortLabel: 'Dashboard' },
  { path: '/companies',  permission: 'companies',  label: 'Companies (Aziende)',     shortLabel: 'Aziende' },
  { path: '/activities', permission: 'activities', label: 'Activities (Attività)',   shortLabel: 'Attività' },
  { path: '/calendar',   permission: 'calendar',   label: 'Calendar (Calendario)',   shortLabel: 'Calendario' },
  { path: '/inventory',  permission: 'inventory',  label: 'Inventario (Attrezzature)', shortLabel: 'Inventario' },
  { path: '/users',      permission: 'users',      label: 'Utenti & Permessi',       shortLabel: 'Utenti' },
  { path: '/appunti',    permission: 'dashboard',  label: 'Idee & Appunti',          shortLabel: 'Appunti' },
  { path: '/settings',   permission: null,         label: 'Impostazioni Studio',     shortLabel: 'Impostazioni' },
]

function normalizePath(pathname) {
  if (pathname === '/dashboard-a' || pathname === '/dashboard-b') return '/'
  if (pathname === '/inventario') return '/inventory'
  if (pathname === '/utenti') return '/users'
  if (pathname === '/idee') return '/appunti'
  if (pathname === '/opportunities') return '/leads'
  return pathname
}

// Verifica se l'evento è originato all'interno di un elemento che ha ancora spazio di scorrimento orizzontale
function isInsideHorizontalScrollable(target, deltaX) {
  let el = target
  while (el && el !== document.body && el !== document.documentElement) {
    if (el instanceof Element) {
      // Ignora se l'utente sta scrivendo o selezionando testo in un campo form
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
        return true
      }

      const style = window.getComputedStyle(el)
      const overflowX = style.overflowX
      if (overflowX === 'auto' || overflowX === 'scroll') {
        const maxScrollLeft = el.scrollWidth - el.clientWidth
        if (maxScrollLeft > 3) {
          // deltaX > 0: gesto da dx verso sx (scorrimento contenuto verso destra)
          if (deltaX > 0 && el.scrollLeft < maxScrollLeft - 3) {
            return true
          }
          // deltaX < 0: gesto da sx verso dx (scorrimento contenuto verso sinistra)
          if (deltaX < 0 && el.scrollLeft > 3) {
            return true
          }
        }
      }
    }
    el = el.parentElement
  }
  return false
}

export function useSwipeNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { canAccess } = useAuth()

  const [indicator, setIndicator] = useState(null)
  const indicatorTimerRef = useRef(null)

  // Schermate accessibili in base ai permessi dell'utente corrente nell'ordine esatto della sidebar
  const accessibleScreens = useMemo(() => {
    return CRM_SCREENS.filter((s) => !s.permission || canAccess(s.permission))
  }, [canAccess])

  // Trova l'indice della schermata corrente
  const currentNormalized = normalizePath(location.pathname)
  const currentIndex = accessibleScreens.findIndex((s) => s.path === currentNormalized)

  const showIndicator = useCallback((screen, direction, index, total) => {
    clearTimeout(indicatorTimerRef.current)
    setIndicator({
      visible: true,
      label: screen.label,
      shortLabel: screen.shortLabel,
      direction,
      step: `${index + 1} / ${total}`,
    })
    indicatorTimerRef.current = setTimeout(() => {
      setIndicator((prev) => (prev ? { ...prev, visible: false } : null))
    }, 850)
  }, [])

  // Avanza alla schermata successiva (da dx verso sx)
  const goToNext = useCallback(() => {
    if (accessibleScreens.length === 0) return
    let nextIdx = 0
    if (currentIndex >= 0) {
      // Avanza ciclicamente lungo la sidebar: Dashboard -> Companies -> Activities -> ... -> Settings -> Dashboard
      nextIdx = (currentIndex + 1) % accessibleScreens.length
    } else if (currentNormalized === '/leads') {
      nextIdx = accessibleScreens.findIndex((s) => s.path === '/companies')
      if (nextIdx === -1) nextIdx = 0
    }

    const target = accessibleScreens[nextIdx]
    navigate(target.path)
    showIndicator(target, 'next', nextIdx, accessibleScreens.length)
  }, [currentIndex, currentNormalized, accessibleScreens, navigate, showIndicator])

  // Torna alla schermata precedente (da sx verso dx)
  const goToPrev = useCallback(() => {
    if (accessibleScreens.length === 0) return
    let prevIdx = accessibleScreens.length - 1
    if (currentIndex > 0) {
      prevIdx = currentIndex - 1
    } else if (currentIndex === 0) {
      prevIdx = accessibleScreens.length - 1
    } else if (currentNormalized === '/leads') {
      prevIdx = accessibleScreens.findIndex((s) => s.path === '/')
      if (prevIdx === -1) prevIdx = 0
    }

    const target = accessibleScreens[prevIdx]
    navigate(target.path)
    showIndicator(target, 'prev', prevIdx, accessibleScreens.length)
  }, [currentIndex, currentNormalized, accessibleScreens, navigate, showIndicator])

  // Gestione Swipe su Trackpad (eventi wheel orizzontali) e Touch (2, 3 o 4 dita)
  useEffect(() => {
    let accumulatedDeltaX = 0
    let lastWheelTime = 0
    let isThrottled = false
    let throttleTimeout = null

    const handleWheel = (e) => {
      // Non navigare se c'è un modale aperto
      if (document.querySelector('.fixed.inset-0.z-50') || document.querySelector('[role="dialog"]')) {
        return
      }

      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)

      // Se il movimento è prevalentemente verticale (scroll della pagina), non interferire
      if (absY > absX * 0.75) {
        accumulatedDeltaX = 0
        return
      }

      // Ignora micro-vibrazioni
      if (absX < 5) return

      // Se il cursore si trova su un elemento scrollabile orizzontalmente con margine residuo, lascia scorrere l'elemento
      if (isInsideHorizontalScrollable(e.target, e.deltaX)) {
        accumulatedDeltaX = 0
        return
      }

      const now = Date.now()

      if (isThrottled) {
        if (now - lastWheelTime > 300 && absX < 8) {
          isThrottled = false
          accumulatedDeltaX = 0
        } else {
          lastWheelTime = now
          return
        }
      }

      // Resetta l'accumulatore se c'è una pausa o cambio direzione
      if (now - lastWheelTime > 180 || (accumulatedDeltaX !== 0 && Math.sign(e.deltaX) !== Math.sign(accumulatedDeltaX))) {
        accumulatedDeltaX = 0
      }
      lastWheelTime = now
      accumulatedDeltaX += e.deltaX

      // Soglia in pixel per swipe orizzontale reattivo
      const SWIPE_THRESHOLD = 36

      if (Math.abs(accumulatedDeltaX) >= SWIPE_THRESHOLD) {
        if (accumulatedDeltaX > 0) {
          // Swipe da dx verso sx (dita si muovono verso sinistra) -> Prossima schermata in ordine di sidebar
          goToNext()
        } else {
          // Swipe da sx verso dx (dita si muovono verso destra) -> Schermata precedente
          goToPrev()
        }

        accumulatedDeltaX = 0
        isThrottled = true
        clearTimeout(throttleTimeout)
        throttleTimeout = setTimeout(() => {
          isThrottled = false
        }, 450)
      }
    }

    // Gestione Touch a 4 dita (e multi-touch 2-4 dita) su touch screen / trackpad touch
    let touchStartX = 0
    let touchStartY = 0
    let touchCurrentX = 0
    let touchCurrentY = 0
    let isMultiTouchActive = false

    const handleTouchStart = (e) => {
      // Supporta 4 dita (touch.length === 4), 3 dita e 2 dita
      if (e.touches.length >= 2) {
        isMultiTouchActive = true
        let sumX = 0
        let sumY = 0
        for (let i = 0; i < e.touches.length; i++) {
          sumX += e.touches[i].clientX
          sumY += e.touches[i].clientY
        }
        touchStartX = sumX / e.touches.length
        touchStartY = sumY / e.touches.length
        touchCurrentX = touchStartX
        touchCurrentY = touchStartY
      } else {
        isMultiTouchActive = false
      }
    }

    const handleTouchMove = (e) => {
      if (isMultiTouchActive && e.touches.length >= 2) {
        let sumX = 0
        let sumY = 0
        for (let i = 0; i < e.touches.length; i++) {
          sumX += e.touches[i].clientX
          sumY += e.touches[i].clientY
        }
        touchCurrentX = sumX / e.touches.length
        touchCurrentY = sumY / e.touches.length
      }
    }

    const handleTouchEnd = () => {
      if (!isMultiTouchActive) return
      isMultiTouchActive = false

      const diffX = touchCurrentX - touchStartX
      const diffY = touchCurrentY - touchStartY

      // Swipe orizzontale
      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.1) {
        if (diffX < 0) {
          // Da dx verso sx -> Prossima schermata in ordine di sidebar
          goToNext()
        } else {
          // Da sx verso dx -> Schermata precedente
          goToPrev()
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      clearTimeout(throttleTimeout)
      clearTimeout(indicatorTimerRef.current)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [goToNext, goToPrev])

  return {
    indicator,
    goToNext,
    goToPrev,
    accessibleScreens,
    currentIndex,
  }
}

// Componente indicatore rimosso (barra superflua)
export function SwipeNavigationIndicator() {
  return null
}
