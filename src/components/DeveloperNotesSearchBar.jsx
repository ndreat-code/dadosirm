import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useDeviceMode } from '../context/DeviceModeContext'

export default function DeveloperNotesSearchBar() {
  const { currentUser } = useAuth()
  const { isMobileApp } = useDeviceMode()
  const [note, setNote] = useState('')
  const [sentStatus, setSentStatus] = useState(false)

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    const textToSend = note.trim()
    if (!textToSend) return

    setNote('')
    setSentStatus(true)
    setTimeout(() => setSentStatus(false), 3000)

    try {
      const res = await fetch('/api/developer-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.badgeRole || currentUser?.role || '',
        },
        body: JSON.stringify({
          note: textToSend,
          autoSend: true,
          isDeveloperNote: true,
          author: currentUser?.name || 'Utente CRM',
        }),
      })
      const data = await res.json().catch(() => null)
      window.dispatchEvent(new CustomEvent('dado-note-added'))
      window.dispatchEvent(new CustomEvent('dado-note-saved', { detail: data?.entry }))
    } catch (err) {
      console.warn('Salvataggio nota:', err)
    }
  }

  return (
    <div className="flex items-center select-none" style={{ fontFamily: '"Switzer", sans-serif' }}>
      {/* Barra Invia una nota allo sviluppatore: margine sinistro arrotondato, angolo in alto a destra a 90° e angolo in basso a destra arrotondato come la banda scura */}
      <form onSubmit={handleSend} className="relative flex items-center">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={sentStatus ? "✓ Nota inviata!" : isMobileApp ? "Nota allo sviluppatore..." : "Invia una nota allo sviluppatore"}
          title="Scrivi la tua nota e premi Invio per inviarla"
          className={`${isMobileApp ? 'w-[165px]' : 'w-[calc(240px+4cm)] sm:w-[calc(280px+4cm)]'} h-[20px] px-3 text-[10.5px] bg-white/95 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00ffaa] shadow-xs transition-all leading-none`}
          style={{
            fontFamily: '"Switzer", sans-serif',
            borderTopLeftRadius: '10px',
            borderBottomLeftRadius: '10px',
            borderTopRightRadius: '0px',
            borderBottomRightRadius: '14px',
          }}
        />
      </form>
    </div>
  )
}
