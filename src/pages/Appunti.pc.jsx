import { useState, useEffect, useRef } from 'react'
import {
  Trash2,
  Copy,
  Check,
  Plus,
  Search,
  Sparkles,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import IdeeAppuntiIcon from '../components/IdeeAppuntiIcon'
import { useAuth } from '../context/AuthContext'

export default function Appunti() {
  const { currentUser, isAdmin, isDirector } = useAuth()
  const [notes, setNotes] = useState([])
  const [newNoteText, setNewNoteText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [devSearchTerm, setDevSearchTerm] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [justSaved, setJustSaved] = useState(false)
  const [deleteStatusMsg, setDeleteStatusMsg] = useState(null)
  const isDeletingRef = useRef(false)

  // Visibilità sezione Note Sviluppatore riservata esclusivamente a Director e Super Admin (Sviluppatore)
  const canViewDeveloperNotesSection = Boolean(
    isAdmin ||
      isDirector ||
      currentUser?.accessType === 'admin' ||
      currentUser?.badgeRole === 'Amministratore' ||
      currentUser?.badgeRole === 'Director' ||
      currentUser?.role === 'Director'
  )

  const isDevNoteItem = (n) =>
    Boolean(
      n &&
        (n.isDeveloperNote === true ||
          (n.isDeveloperNote === undefined &&
            (n.subject === 'aggiornamento' || n.autoSend === true || n.emailSent === true)))
    )

  // Caricamento appunti da API del server locale (Single Source of Truth) o fallback su localStorage
  const loadNotes = async () => {
    try {
      const res = await fetch('/api/developer-notes')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setNotes(data)
          localStorage.setItem('dado_notes', JSON.stringify(data))
          return
        }
      }
    } catch (e) {
      console.warn('Fallback su localStorage per note:', e)
    }

    try {
      const local = JSON.parse(localStorage.getItem('dado_notes') || '[]')
      setNotes(Array.isArray(local) ? local : [])
    } catch {
      setNotes([])
    }
  }

  useEffect(() => {
    loadNotes()

    // Ascolta salvataggi di nuove note (es. dalla Dashboard o dalla barra sviluppatore)
    const handleSaved = (e) => {
      if (isDeletingRef.current) return

      if (e.detail && e.detail.id) {
        setNotes((prev) => {
          if (prev.some((n) => String(n.id) === String(e.detail.id))) return prev
          return [e.detail, ...prev]
        })
      } else {
        loadNotes()
      }
    }

    const handleAdded = () => {
      if (!isDeletingRef.current) loadNotes()
    }

    window.addEventListener('dado-note-saved', handleSaved)
    window.addEventListener('dado-note-added', handleAdded)
    return () => {
      window.removeEventListener('dado-note-saved', handleSaved)
      window.removeEventListener('dado-note-added', handleAdded)
    }
  }, [])

  // Aggiunta nuova nota direttamente dalla pagina Idee / Appunti (appunto ordinario, NON nota sviluppatore)
  const handleAddNote = async (e) => {
    if (e) e.preventDefault()
    const text = newNoteText.trim()
    if (!text) return

    const newEntry = {
      id: Date.now().toString(),
      note: text,
      isDeveloperNote: false,
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString('it-IT'),
      author: currentUser?.name || 'Utente CRM',
    }

    const updated = [newEntry, ...notes]
    setNotes(updated)
    localStorage.setItem('dado_notes', JSON.stringify(updated))
    setNewNoteText('')
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2200)

    window.dispatchEvent(new CustomEvent('dado-note-saved', { detail: newEntry }))

    try {
      await fetch('/api/developer-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.badgeRole || currentUser?.role || '',
        },
        body: JSON.stringify({
          note: text,
          isDeveloperNote: false,
          author: currentUser?.name || 'Utente CRM',
        }),
      })
    } catch (err) {
      console.warn('Errore salvataggio remoto nota:', err)
    }
  }

  // Eliminazione affidabile di una singola nota (Sincronizzata su stato, localStorage e backend)
  const handleDeleteNote = async (itemOrId) => {
    isDeletingRef.current = true

    let targetId = null
    let targetText = null

    if (typeof itemOrId === 'object' && itemOrId !== null) {
      targetId = itemOrId.id ? String(itemOrId.id) : null
      targetText = itemOrId.note
    } else {
      targetId = String(itemOrId)
    }

    let updatedNotes = []
    setNotes((prevNotes) => {
      updatedNotes = prevNotes.filter((n) => {
        if (targetId && n.id) {
          return String(n.id) !== targetId
        }
        if (targetText && n.note) {
          return n.note !== targetText
        }
        return true
      })
      localStorage.setItem('dado_notes', JSON.stringify(updatedNotes))
      return updatedNotes
    })

    setDeleteStatusMsg('✓ Nota rimossa con successo')
    setTimeout(() => setDeleteStatusMsg(null), 2500)

    window.dispatchEvent(
      new CustomEvent('dado-note-deleted', {
        detail: { deletedId: targetId, remaining: updatedNotes.length },
      })
    )

    if (targetId) {
      try {
        const response = await fetch(`/api/developer-notes/${encodeURIComponent(targetId)}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          console.error(`Errore risposta DELETE server: ${response.status}`)
        }
      } catch (err) {
        console.error('Errore rete cancellazione remota:', err)
      }
    }

    setTimeout(() => {
      isDeletingRef.current = false
    }, 400)
  }

  // Eliminazione di tutti gli appunti ordinari
  const handleClearAllNotes = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare tutti gli appunti presenti nell’archivio?')) return

    isDeletingRef.current = true
    setNotes((prev) => {
      const remaining = prev.filter((n) => isDevNoteItem(n))
      localStorage.setItem('dado_notes', JSON.stringify(remaining))
      return remaining
    })
    setDeleteStatusMsg('✓ Tutti gli appunti sono stati rimossi')
    setTimeout(() => setDeleteStatusMsg(null), 2500)

    window.dispatchEvent(
      new CustomEvent('dado-note-deleted', {
        detail: { deletedId: 'all-regular', remaining: 0 },
      })
    )

    try {
      await fetch('/api/developer-notes?type=regular', { method: 'DELETE' })
    } catch (e) {
      console.warn('Errore svuotamento remoto note:', e)
    }

    setTimeout(() => {
      isDeletingRef.current = false
    }, 400)
  }

  // Eliminazione di tutte le note sviluppatore
  const handleClearAllDeveloperNotes = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare tutte le note inviate allo sviluppatore?')) return

    isDeletingRef.current = true
    setNotes((prev) => {
      const remaining = prev.filter((n) => !isDevNoteItem(n))
      localStorage.setItem('dado_notes', JSON.stringify(remaining))
      return remaining
    })
    setDeleteStatusMsg('✓ Tutte le note sviluppatore sono state rimosse')
    setTimeout(() => setDeleteStatusMsg(null), 2500)

    try {
      await fetch('/api/developer-notes?type=developer', { method: 'DELETE' })
    } catch (e) {
      console.warn('Errore svuotamento remoto note sviluppatore:', e)
    }

    setTimeout(() => {
      isDeletingRef.current = false
    }, 400)
  }

  // Copia negli appunti
  const handleCopy = (text, id) => {
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  // Separazione netta: appunti/idee ordinari vs note inviate allo sviluppatore
  const regularNotes = notes.filter((n) => !isDevNoteItem(n))
  const developerNotes = notes.filter((n) => isDevNoteItem(n))

  // Filtro ricerca appunti ordinari
  const filteredNotes = regularNotes.filter((n) =>
    n.note ? n.note.toLowerCase().includes(searchTerm.toLowerCase()) : false
  )

  // Filtro ricerca note sviluppatore
  const filteredDeveloperNotes = developerNotes.filter((n) =>
    n.note ? n.note.toLowerCase().includes(devSearchTerm.toLowerCase()) : false
  )

  return (
    <div
      className="h-full min-h-0 flex flex-col flex-1 relative overflow-hidden"
      style={{
        backgroundColor: 'transparent',
        fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* ── BANDA SUPERIORE: Titolo "Idee & Appunti" immerso nella banda scura (#2d3139), senza icona, più spessa di 0,3 cm rispetto alla dashboard ── */}
      <div className="w-full flex-shrink-0 relative z-20">
        <div
          className="w-full rounded-none flex items-center justify-between px-5 md:px-7 select-none"
          style={{
            height: 'calc(3rem - 0.5cm + 0.3cm)',
            backgroundColor: '#2d3139',
            borderTopLeftRadius: '0px',
            borderBottomLeftRadius: '0px',
            borderTopRightRadius: '0px',
            borderBottomRightRadius: '0px',
          }}
        >
          <div className="flex items-center">
            <h1
              className="text-lg sm:text-xl font-black text-white tracking-tight leading-none select-none"
              style={{ fontFamily: '"Switzer", sans-serif' }}
            >
              Idee & Appunti
            </h1>
          </div>
        </div>
      </div>

      {/* ── CANVAS CON ANGOLI IN BASSO A SINISTRA STONDATI ADAGIATI SULLA BARRA LATERALE ── */}
      <div
        className="flex-1 min-h-0 bg-[#f8fafc] rounded-tl-none rounded-bl-[48px] rounded-tr-none rounded-br-none flex flex-col justify-between relative min-w-0 overflow-hidden text-slate-800"
        style={{
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
          borderLeft: '1.5px solid rgba(255, 255, 255, 0.9)',
          borderBottom: '1.5px solid rgba(255, 255, 255, 0.75)',
          borderTopLeftRadius: '0px',
          borderBottomLeftRadius: '48px',
          borderTopRightRadius: '0px',
          borderBottomRightRadius: '0px',
        }}
      >
        <div className="flex-1 min-h-0 px-4 md:px-7 py-4 overflow-y-auto">
          <div className="w-full space-y-6">

        {/* Notifica di stato azione */}
        {deleteStatusMsg && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-emerald-400 text-xs font-bold shadow-xl border border-emerald-500/40 animate-fadeIn flex items-center gap-2">
            <span>{deleteStatusMsg}</span>
          </div>
        )}

        {/* ── MODULO INSERIMENTO NUOVA IDEA / APPUNTO ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Scrivi qui una nuova idea o appunto da salvare..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!newNoteText.trim()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{justSaved ? '✓ Salvato!' : 'Salva Appunto'}</span>
            </button>
          </form>
        </div>

        {/* ── SEZIONE PRIMO PIANO: IL FOGLIO CON LE 3 RIGHE SOTTOLINEATE E LA LAMPADA ── */}
        <div className="relative bg-white border border-slate-300/80 rounded-2xl p-6 shadow-sm overflow-visible">
          {/* Badge icona con lampada stilizzata leggermente sopra a sinistra — Viola magico con sfumatura magenta e verde aurora boreale */}
          <div
            className="absolute -top-[17px] left-5 flex items-center gap-2.5 px-5 py-2 rounded-full text-white font-bold shadow-[0_4px_16px_rgba(109,40,217,0.35)] border-0 select-none z-10"
            style={{
              background: 'linear-gradient(115deg, #3b0764 0%, #6d28d9 26%, #b5179e 50%, #c026d3 66%, #059669 86%, #10b981 100%)',
            }}
          >
            <IdeeAppuntiIcon size={19} strokeWidth={2.0} color="#f0f4f8" />
            <span className="tracking-wider uppercase text-[12px] font-black drop-shadow-xs">
              Idee in Primo Piano (3 Righe)
            </span>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-500 font-sans">
                I tre appunti prioritari più recenti ricevuti dalla Dashboard o appuntati dal team:
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Focus Attivo
              </span>
            </div>

            {/* Le 3 righe sottolineate (solo idee e appunti ordinari, escluse le note sviluppatore) */}
            <div className="flex flex-col gap-3 py-1">
              {[0, 1, 2].map((idx) => {
                const noteItem = regularNotes[idx]
                return (
                  <div
                    key={noteItem?.id || `row-${idx}`}
                    className="flex items-end border-b-2 border-slate-200 pb-2 min-h-[40px] group transition-colors hover:border-slate-400"
                  >
                    <span className="text-[12px] font-black text-slate-400 group-hover:text-slate-700 mr-3.5 select-none w-7 flex-shrink-0">
                      0{idx + 1}.
                    </span>
                    {noteItem ? (
                      <div className="flex-1 flex items-baseline justify-between gap-3 min-w-0">
                        <span className="text-[14.5px] font-sans font-medium text-slate-900 break-words leading-tight">
                          {noteItem.note}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {noteItem.formattedDate && (
                            <span className="text-[10px] font-semibold text-slate-400 select-none">
                              {noteItem.formattedDate.split(',')[0]}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopy(noteItem.note, noteItem.id || idx)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                            title="Copia appunto"
                          >
                            {copiedId === (noteItem.id || idx) ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(noteItem)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer flex items-center gap-1 group/btn"
                            title="Elimina definitivamente questo appunto"
                          >
                            <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[13px] font-sans italic text-slate-300 select-none">
                        (riga {idx + 1} libera per nuovi appunti o idee...)
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── CRONOLOGIA COMPLETA APPUNTI ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Archivio Cronologico Appunti
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Tutte le annotazioni salvate dalla Dashboard o inserite direttamente
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Barra ricerca note */}
              {regularNotes.length > 0 && (
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cerca negli appunti..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
                  />
                </div>
              )}

              {/* Pulsante Svuota tutto se presenti più note */}
              {regularNotes.length > 1 && (
                <button
                  type="button"
                  onClick={handleClearAllNotes}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer flex-shrink-0"
                  title="Elimina tutti gli appunti archiviati"
                >
                  Svuota archivio
                </button>
              )}
            </div>
          </div>

          {/* Lista di tutte le note ordinarie */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <IdeeAppuntiIcon size={24} color="#94a3b8" />
              </div>
              <p className="text-sm font-bold text-slate-700">Nessun appunto presente</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? 'Nessun risultato corrispondente ai criteri di ricerca inseriti.'
                  : 'Puoi scrivere appunti direttamente nel riquadro Note della Dashboard oppure aggiungerne uno dal modulo in alto.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredNotes.map((item, idx) => (
                <div
                  key={item.id || `note-${idx}`}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between group"
                >
                  <p className="text-[14px] font-sans font-medium text-slate-900 leading-snug break-words">
                    {item.note}
                  </p>
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200/60 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[10.5px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.formattedDate || (item.timestamp ? new Date(item.timestamp).toLocaleString('it-IT') : '')}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.note, item.id || idx)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                        title="Copia appunto"
                      >
                        {copiedId === (item.id || idx) ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(item)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer flex items-center gap-1 group/btn"
                        title="Elimina definitivamente questo appunto"
                      >
                        <Trash2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[11px] font-semibold hidden sm:inline">Elimina</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SEZIONE NOTE INVIATE ALLO SVILUPPATORE (Visibile SOLO a Director e Super Admin / Sviluppatore) ── */}
        {canViewDeveloperNotesSection && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-black tracking-tight text-slate-900">
                    Note allo Sviluppatore Inviate
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-[#00ffaa] border border-slate-700 select-none">
                    Director & Super Admin
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Comunicazioni e segnalazioni inviate dalla barra inferiore del CRM allo sviluppatore
                </p>
              </div>

              <div className="flex items-center gap-3">
                {developerNotes.length > 0 && (
                  <div className="relative w-full sm:w-60">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={devSearchTerm}
                      onChange={(e) => setDevSearchTerm(e.target.value)}
                      placeholder="Cerca nelle note sviluppatore..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                )}

                {developerNotes.length > 1 && (
                  <button
                    type="button"
                    onClick={handleClearAllDeveloperNotes}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer flex-shrink-0"
                    title="Elimina tutte le note inviate allo sviluppatore"
                  >
                    Svuota sezione
                  </button>
                )}
              </div>
            </div>

            {filteredDeveloperNotes.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-sm font-bold text-slate-700">Nessuna nota allo sviluppatore presente</p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {devSearchTerm
                    ? 'Nessuna nota sviluppatore corrisponde ai criteri di ricerca.'
                    : 'Le note inviate tramite la barra "Invia una nota allo sviluppatore" nella banda inferiore compariranno qui.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredDeveloperNotes.map((item, idx) => (
                  <div
                    key={item.id || `dev-note-${idx}`}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between group"
                  >
                    <p className="text-[14px] font-sans font-medium text-slate-900 leading-snug break-words">
                      {item.note}
                    </p>
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200/60 text-xs text-slate-400">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1 text-[10.5px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.formattedDate || (item.timestamp ? new Date(item.timestamp).toLocaleString('it-IT') : '')}
                        </span>
                        {item.author && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
                            {item.author}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.note, `dev-${item.id || idx}`)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                          title="Copia nota sviluppatore"
                        >
                          {copiedId === `dev-${item.id || idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(item)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer flex items-center gap-1 group/btn"
                          title="Elimina questa nota sviluppatore"
                        >
                          <Trash2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                          <span className="text-[11px] font-semibold hidden sm:inline">Elimina</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  </div>
</div>
  )
}
