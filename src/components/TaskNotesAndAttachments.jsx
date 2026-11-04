import { useState, useRef } from 'react'
import {
  FileText,
  Paperclip,
  Plus,
  Trash2,
  Download,
  Image as ImageIcon,
  Video,
  Music,
  Check,
  X,
  Edit2,
  UploadCloud,
  ExternalLink
} from 'lucide-react'

// Helper per formattare la dimensione dei file in KB / MB
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Helper per selezionare l'icona e colore appropriato per tipo di file
export function getFileIcon(fileName = '', mimeType = '') {
  const ext = fileName.split('.').pop().toLowerCase()
  if (['pdf'].includes(ext) || mimeType.includes('pdf')) {
    return { icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' }
  }
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) || mimeType.includes('image')) {
    return { icon: ImageIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  }
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext) || mimeType.includes('video')) {
    return { icon: Video, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
  }
  if (['mp3', 'wav', 'aac', 'm4a'].includes(ext) || mimeType.includes('audio')) {
    return { icon: Music, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
  }
  return { icon: Paperclip, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' }
}

export default function TaskNotesAndAttachments({
  activity,
  onUpdateNotes,
  onAddAttachment,
  onDeleteAttachment,
  compact = false
}) {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [noteText, setNoteText] = useState(activity.notes || '')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const attachments = Array.isArray(activity.attachments) ? activity.attachments : []

  // Salvataggio nota inline
  async function handleSaveNote() {
    if (onUpdateNotes) {
      await onUpdateNotes(activity.id, noteText.trim())
    }
    setIsEditingNotes(false)
  }

  function handleCancelNote() {
    setNoteText(activity.notes || '')
    setIsEditingNotes(false)
  }

  // Gestione caricamento file
  async function handleFileSelect(files) {
    if (!files || files.length === 0) return
    setIsUploading(true)

    try {
      const fileList = Array.from(files)
      for (const file of fileList) {
        // Leggi il file come Data URL (base64)
        const reader = new FileReader()
        await new Promise((resolve, reject) => {
          reader.onload = () => {
            const newAttachment = {
              id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
              name: file.name,
              size: file.size,
              type: file.type || 'application/octet-stream',
              dataUrl: reader.result,
              uploadedAt: new Date().toLocaleDateString('it-IT') + ' ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
            }
            if (onAddAttachment) {
              onAddAttachment(activity.id, newAttachment)
            }
            resolve()
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }
    } catch (err) {
      console.error('Errore lettura file allegato:', err)
      alert('Si è verificato un errore durante il caricamento del file.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Download / Apertura file
  function handleDownload(att) {
    if (!att.dataUrl) {
      alert(`File allegato: ${att.name}`)
      return
    }
    const link = document.createElement('a')
    link.href = att.dataUrl
    link.download = att.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className="mt-3 pt-2.5 border-t border-slate-200/90 space-y-2.5 select-text"
      style={{ fontFamily: '"Switzer", sans-serif' }}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer?.files) {
          handleFileSelect(e.dataTransfer.files)
        }
      }}
    >
      {/* ── 0. AGGIORNAMENTI STRUTTURATI DA EMAIL (SENZA TESTO ALLEGATO) ── */}
      {(activity.senderEmail || activity.contactPerson?.name || activity.contractDetails || (Array.isArray(activity.subjectRequests) && activity.subjectRequests.length > 0)) && (
        <div className="bg-sky-50/70 p-2.5 rounded-xl border border-sky-200/80 text-[13px] space-y-1.5">
          <div className="text-[12px] font-black uppercase tracking-wider text-[#0284c7] flex items-center gap-1.5">
            <span>✉ Aggiornamenti Estratti da Email (Oggetto & Contratto)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {activity.senderEmail && (
              <div className="truncate">
                <span className="text-slate-500 font-bold text-[11px] uppercase block">Indirizzo Email:</span>
                <strong className="text-slate-900 font-extrabold">{activity.senderEmail}</strong>
              </div>
            )}
            {activity.contactPerson?.name && (
              <div className="truncate">
                <span className="text-slate-500 font-bold text-[11px] uppercase block">Referente:</span>
                <strong className="text-slate-900 font-extrabold">
                  {activity.contactPerson.name} {activity.contactPerson.role ? `(${activity.contactPerson.role})` : ''}
                </strong>
              </div>
            )}
            {activity.contractDetails && (
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-bold text-[11px] uppercase block">Dettagli Contratto:</span>
                <strong className="text-slate-800 font-bold">
                  {activity.contractDetails.status || 'In valutazione'} • {activity.contractDetails.amount || 'Da definire'} — {activity.contractDetails.terms || '50% acconto / 50% saldo'}
                </strong>
              </div>
            )}
            {Array.isArray(activity.subjectRequests) && activity.subjectRequests.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-bold text-[11px] uppercase block mb-0.5">Richieste in base all'Oggetto Mail:</span>
                <div className="flex flex-wrap gap-1">
                  {activity.subjectRequests.map((req, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white border border-sky-200 text-[#0369a1] text-[12px] font-bold rounded-md"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 1. SEZIONE NOTE OPERATIVE DEL TASK (SOLO APPUNTI MANUALI, MAI TESTO EMAIL) ── */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[13.5px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Edit2 size={11} className="text-[#0284c7]" />
            <span>Note Operative Manuali</span>
          </span>

          {!isEditingNotes && (
            <button
              type="button"
              onClick={() => {
                setNoteText(activity.notes || '')
                setIsEditingNotes(true)
              }}
              className="text-[13px] font-bold text-[#0284c7] hover:text-[#0369a1] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>{activity.notes ? 'Modifica nota' : '+ Aggiungi nota'}</span>
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="space-y-1.5 animate-fadeIn">
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Scrivi qui un appunto manuale per il team (il testo delle email non viene mai allegato)..."
              className="w-full p-2.5 text-[15px] text-slate-800 bg-white border-2 border-sky-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans shadow-inner leading-relaxed"
              autoFocus
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={handleCancelNote}
                className="px-2.5 py-1 text-[14px] font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-3 py-1 text-[14px] font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] rounded-lg transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Check size={12} />
                <span>Salva Nota</span>
              </button>
            </div>
          </div>
        ) : activity.notes ? (
          <p className="text-[14px] leading-relaxed text-slate-700 font-medium whitespace-pre-line bg-white/60 p-2 rounded-xl border border-slate-200/60">
            {activity.notes}
          </p>
        ) : (
          <div
            onClick={() => {
              setNoteText('')
              setIsEditingNotes(true)
            }}
            className="text-[11.5px] text-slate-400 italic cursor-pointer hover:text-slate-600 py-1 px-2 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 transition-colors"
          >
            Nessun testo email allegato. Clicca qui per aggiungere una nota manuale...
          </div>
        )}
      </div>

      {/* ── 2. SEZIONE ALLEGATI (FILE) DEL TASK ── */}
      <div className={`pt-2 border-t border-slate-200/70 ${isDragging ? 'bg-sky-50/50 p-2 rounded-xl border-dashed border-sky-400' : ''}`}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[13.5px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Paperclip size={11} className="text-[#0284c7]" />
              <span>Allegati File</span>
            </span>
            <span className="text-[13px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {attachments.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-2.5 py-1 text-[13.5px] font-bold text-[#0284c7] bg-sky-50 hover:bg-sky-100 border border-sky-200 hover:border-sky-300 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
            title="Allega file (PDF, immagini, contratti, liberatorie, ecc.) a questa attività"
          >
            <Plus size={11} className="stroke-[2.5]" />
            <span>{isUploading ? 'Caricamento...' : 'Allega file'}</span>
          </button>

          {/* Input file nascosto */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        {/* Lista degli Allegati del Task */}
        {attachments.length > 0 ? (
          <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-1.5`}>
            {attachments.map((att) => {
              const fileStyle = getFileIcon(att.name, att.type)
              const IconComp = fileStyle.icon
              return (
                <div
                  key={att.id}
                  className={`flex items-center justify-between gap-2 p-1.5 rounded-xl border bg-white shadow-2xs hover:shadow-xs transition-all group/att ${fileStyle.border}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${fileStyle.bg} ${fileStyle.color}`}>
                      <IconComp size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-[15px] font-bold text-slate-800 truncate"
                        title={att.name}
                      >
                        {att.name}
                      </div>
                      <div className="text-[13px] font-semibold text-slate-400 flex items-center gap-1.5">
                        <span>{formatFileSize(att.size)}</span>
                        {att.uploadedAt && <span>• {att.uploadedAt}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Pulsanti Scarica ed Elimina */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownload(att)}
                      className="p-1 text-slate-500 hover:text-[#0284c7] hover:bg-sky-50 rounded-md transition-colors cursor-pointer"
                      title={`Scarica / visualizza ${att.name}`}
                    >
                      <Download size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Rimuovere l'allegato "${att.name}" da questa attività?`)) {
                          if (onDeleteAttachment) onDeleteAttachment(activity.id, att.id)
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      title="Elimina allegato"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="text-[14px] text-slate-400 italic py-1 px-2 rounded-lg bg-slate-50/40 border border-dashed border-slate-200/80 cursor-pointer hover:border-sky-300 hover:text-sky-700 transition-colors flex items-center justify-between"
          >
            <span>Nessun file allegato. Trascina o clicca "Allega file" (PDF, immagini, contratti)...</span>
            <UploadCloud size={13} className="text-slate-400" />
          </div>
        )}
      </div>
    </div>
  )
}
