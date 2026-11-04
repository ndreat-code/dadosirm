import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  X,
  Search,
  UserPlus,
  Building2,
  Mail,
  Phone,
  Smartphone,
  MessageCircle,
  Edit2,
  Trash2,
  Download,
  Copy,
  Check,
  Plus,
  ExternalLink,
  Save,
  AlertTriangle,
  Briefcase,
  Clock,
  Sparkles,
  Filter,
  FileSpreadsheet,
} from 'lucide-react'

// Generatore di colore per avatar in base al nome
function getAvatarGradient(name = '') {
  const gradients = [
    'from-purple-600 to-indigo-600',
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-violet-600 to-fuchsia-600',
  ]
  let sum = 0
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i)
  }
  return gradients[sum % gradients.length]
}

// Iniziali del nome
function getInitials(name = '') {
  if (!name) return 'CO'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Determina la categoria normalizzata del motivo ultimo contatto (Call Conoscitiva, Chiamata, Appuntamento, Briefing)
function getContactCategory(c = {}) {
  if (c.lastContactCategory) return c.lastContactCategory
  const combined = `${c.lastContactHow || ''} ${c.lastContactWhy || ''}`.toLowerCase()
  if (combined.includes('conoscitiv')) return 'Call Conoscitiva'
  if (combined.includes('appuntament') || combined.includes('incontro') || combined.includes('sopralluogo') || combined.includes('atelier')) return 'Appuntamento'
  if (combined.includes('briefing') || combined.includes('storyboard') || combined.includes('regia')) return 'Briefing'
  return 'Chiamata'
}

export default function CollaboratorsModal({ isOpen, onClose, onCountChange }) {
  const [collaborators, setCollaborators] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [contactCategoryFilter, setContactCategoryFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('name-asc')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Stati per Modifica / Creazione / Cancellazione
  const [editingCollab, setEditingCollab] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [collabToDelete, setCollabToDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [feedbackToast, setFeedbackToast] = useState(null)
  const [copiedKey, setCopiedKey] = useState(null)
  // Su telefono la modale è una colonna unica scorrevole: questi riferimenti riportano la vista dove serve
  const bodyScrollRef = useRef(null)
  const detailPanelRef = useRef(null)

  // Form state per nuovo/modifica
  const [formState, setFormState] = useState({
    name: '',
    role: '',
    companyId: '',
    companyName: '',
    email: '',
    phone: '',
    mobile: '',
    notes: '',
    relationshipStatus: 'Attivo',
    lastContactCategory: 'Call Conoscitiva',
    lastContactDayDate: '',
    lastContactHow: '',
    lastContactWhy: '',
  })

  const showToast = useCallback((msg, type = 'success') => {
    setFeedbackToast({ msg, type })
    setTimeout(() => setFeedbackToast(null), 3500)
  }, [])

  // Caricamento collaboratori ed aziende da API
  const loadCollaborators = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/crm/collaborators')
      if (res.ok) {
        const data = await res.json()
        if (data.collaborators) {
          setCollaborators(data.collaborators)
          if (data.companies) setCompanies(data.companies)
          if (onCountChange) onCountChange(data.collaborators.length)
        }
      }
    } catch (err) {
      console.error('Errore caricamento collaboratori:', err)
      showToast('Errore di connessione al database collaboratori', 'error')
    } finally {
      setLoading(false)
    }
  }, [onCountChange, showToast])

  useEffect(() => {
    if (isOpen) {
      loadCollaborators()
    }
  }, [isOpen, loadCollaborators])

  // Ascolto ESC da tastiera
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (collabToDelete) {
          setCollabToDelete(null)
        } else if (editingCollab || isCreating) {
          setEditingCollab(null)
          setIsCreating(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, collabToDelete, editingCollab, isCreating])

  // Copia negli appunti con feedback visivo
  const handleCopy = (text, key, e) => {
    if (e) e.stopPropagation()
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    showToast(`Copiato: ${text}`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Filtraggio e Ordinamento collaboratori
  const filteredCollaborators = useMemo(() => {
    let list = [...collaborators]

    // 1. Ricerca testuale
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((c) => {
        return (
          c.name?.toLowerCase().includes(q) ||
          c.role?.toLowerCase().includes(q) ||
          c.companyName?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.mobile?.includes(q) ||
          c.notes?.toLowerCase().includes(q) ||
          c.lastContactWhy?.toLowerCase().includes(q) ||
          c.lastContactHow?.toLowerCase().includes(q) ||
          getContactCategory(c).toLowerCase().includes(q)
        )
      })
    }

    // 2. Filtro Ruolo / Categoria
    if (roleFilter !== 'ALL') {
      list = list.filter((c) => {
        const role = (c.role || '').toLowerCase()
        if (roleFilter === 'DIRECTION') {
          return (
            role.includes('director') ||
            role.includes('ceo') ||
            role.includes('titolare') ||
            role.includes('founder') ||
            role.includes('managing') ||
            role.includes('patron')
          )
        }
        if (roleFilter === 'MARKETING') {
          return (
            role.includes('marketing') ||
            role.includes('brand') ||
            role.includes('communication') ||
            role.includes('social')
          )
        }
        if (roleFilter === 'TECHNICAL') {
          return (
            role.includes('tech') ||
            role.includes('cto') ||
            role.includes('ing') ||
            role.includes('arch') ||
            role.includes('design') ||
            role.includes('art')
          )
        }
        return true
      })
    }

    // 2b. Filtro Motivo Ultimo Contatto (Call Conoscitiva, Chiamata, Appuntamento, Briefing)
    if (contactCategoryFilter !== 'ALL') {
      list = list.filter((c) => getContactCategory(c) === contactCategoryFilter)
    }

    // 3. Ordinamento
    list.sort((a, b) => {
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '')
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '')
      if (sortBy === 'company-asc') return (a.companyName || '').localeCompare(b.companyName || '')
      if (sortBy === 'recent') return (b.updatedAt || '').localeCompare(a.updatedAt || '')
      return 0
    })

    return list
  }, [collaborators, searchQuery, roleFilter, contactCategoryFilter, sortBy])

  // Collaboratore attualmente selezionato nel pannello di destra
  const safeIndex = selectedIndex >= filteredCollaborators.length ? 0 : selectedIndex
  const activeCollab = filteredCollaborators[safeIndex] || filteredCollaborators[0] || null

  // Apertura modale Modifica
  const startEditing = (collab) => {
    setIsCreating(false)
    setEditingCollab(collab)
    setFormState({
      name: collab.name || '',
      role: collab.role || '',
      companyId: collab.companyId || '',
      companyName: collab.companyName || '',
      email: collab.email || '',
      phone: collab.phone || '',
      mobile: collab.mobile || '',
      notes: collab.notes || '',
      relationshipStatus: collab.relationshipStatus || 'Attivo',
      lastContactCategory: getContactCategory(collab),
      lastContactDayDate: collab.lastContactDayDate || 'Lunedì 12 Ottobre',
      lastContactHow: collab.lastContactHow || 'Call WhatsApp & Google Meet',
      lastContactWhy: collab.lastContactWhy || '',
    })
  }

  // Su telefono, aprendo il form (nuovo/modifica) si torna in cima al corpo scorrevole
  useEffect(() => {
    if ((isCreating || editingCollab) && bodyScrollRef.current) {
      bodyScrollRef.current.scrollTo({ top: 0 })
    }
  }, [isCreating, editingCollab])

  // Apertura modale Nuovo Collaboratore
  const startCreating = () => {
    setEditingCollab(null)
    setIsCreating(true)
    setFormState({
      name: '',
      role: '',
      companyId: companies[0]?.id || '',
      companyName: companies[0]?.name || '',
      email: '',
      phone: '',
      mobile: '',
      notes: '',
      relationshipStatus: 'Attivo',
      lastContactCategory: 'Call Conoscitiva',
      lastContactDayDate: 'Lunedì 12 Ottobre',
      lastContactHow: 'Call Conoscitiva — WhatsApp & Google Meet',
      lastContactWhy: '',
    })
  }

  // Salvataggio (Creazione o Modifica)
  const handleSaveForm = async (e) => {
    if (e) e.preventDefault()
    if (!formState.name.trim()) {
      showToast('Inserisci il nome e cognome del collaboratore', 'error')
      return
    }

    setSaving(true)
    try {
      if (isCreating) {
        const res = await fetch('/api/crm/collaborators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Errore durante la creazione')
        showToast('Nuovo collaboratore aggiunto con successo!')
        setIsCreating(false)
        await loadCollaborators()
        setSelectedIndex(0)
      } else if (editingCollab) {
        const res = await fetch(`/api/crm/collaborators/${editingCollab.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Errore durante il salvataggio')
        showToast('Dati collaboratore aggiornati con successo!')
        setEditingCollab(null)
        await loadCollaborators()
      }
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Eliminazione
  const confirmDelete = async () => {
    if (!collabToDelete) return
    setSaving(true)
    try {
      const res = await fetch(`/api/crm/collaborators/${collabToDelete.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Errore eliminazione')
      }
      showToast(`Collaboratore ${collabToDelete.name} rimosso`)
      setCollabToDelete(null)
      await loadCollaborators()
      setSelectedIndex(0)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Esportazione CSV ──
  const exportToCsv = () => {
    if (!collaborators.length) return
    const headers = ['ID', 'Nome', 'Ruolo', 'Azienda', 'Settore', 'Cellulare', 'Telefono Fisso', 'Email', 'Motivo Ultimo Contatto', 'Data Contatto', 'Note']
    const rows = collaborators.map((c) => [
      `"${c.id || ''}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.role || '').replace(/"/g, '""')}"`,
      `"${(c.companyName || '').replace(/"/g, '""')}"`,
      `"${(c.companyIndustry || '').replace(/"/g, '""')}"`,
      `"${(c.mobile || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(getContactCategory(c) + ' - ' + (c.lastContactWhy || '')).replace(/"/g, '""')}"`,
      `"${(c.lastContactDayDate || c.lastContact || '').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `DADO_CRM_Collaboratori_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Esportazione rubrica CSV completata!')
  }

  // ── Esportazione vCard singola o totale (.vcf) ──
  const exportToVCard = (collab) => {
    const list = collab ? [collab] : collaborators
    if (!list.length) return

    let vcf = ''
    list.forEach((c) => {
      vcf += 'BEGIN:VCARD\r\n'
      vcf += 'VERSION:3.0\r\n'
      vcf += `FN:${c.name || ''}\r\n`
      if (c.companyName) vcf += `ORG:${c.companyName}\r\n`
      if (c.role) vcf += `TITLE:${c.role}\r\n`
      if (c.mobile) vcf += `TEL;TYPE=CELL:${c.mobile}\r\n`
      if (c.phone) vcf += `TEL;TYPE=WORK:${c.phone}\r\n`
      if (c.email) vcf += `EMAIL;TYPE=INTERNET,WORK:${c.email}\r\n`
      if (c.notes) vcf += `NOTE:${c.notes}\r\n`
      vcf += 'END:VCARD\r\n'
    })

    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const filename = collab
      ? `Contatto_${(collab.name || 'Collaboratore').replace(/\s+/g, '_')}.vcf`
      : `DADO_Rubrica_Completa_${new Date().toISOString().split('T')[0]}.vcf`
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Scheda contatto vCard scaricata!')
  }

  // Link WhatsApp pulito da caratteri speciali
  const getWhatsAppLink = (number, name = '') => {
    if (!number) return null
    let clean = number.replace(/[^\d+]/g, '')
    if (!clean.startsWith('+')) {
      if (clean.startsWith('39')) clean = '+' + clean
      else clean = '+39' + clean
    }
    const cleanDigits = clean.replace('+', '')
    const msg = encodeURIComponent(`Ciao ${name}, ti contatto da DADO Creative Studio in merito ai nostri progetti in corso.`)
    return `https://wa.me/${cleanDigits}?text=${msg}`
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-2.5 bg-black/80 backdrop-blur-md animate-fadeIn h-dvh"
      onClick={onClose}
    >
      <div
        className="w-[98.5vw] max-w-[98.5vw] h-[95dvh] max-h-[95dvh] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-[#0f172a] text-slate-100 flex flex-col relative"
        style={{
          fontFamily: '"Switzer", sans-serif',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(124, 58, 237, 0.20)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Notifiche Fluttuante */}
        {feedbackToast && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs font-bold shadow-lg border flex items-center gap-2 animate-bounce ${
              feedbackToast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-600'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-500'
            }`}
          >
            <span>{feedbackToast.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{feedbackToast.msg}</span>
          </div>
        )}

        {/* ══ HEADER FINESTRA ESTESO ORIZZONTALMENTE ══ */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b border-slate-700/80 bg-[#162035] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shadow-xs">
              <UserPlus size={22} className="text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-[15px] sm:text-[20px] font-black tracking-wide text-white uppercase leading-tight">
                  RUBRICA COLLABORATORI & CONTATTI AZIENDALI
                </h3>
                <span className="text-[13.5px] font-bold px-2.5 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-600/50">
                  {collaborators.length} Referenti & Post-it Contatto
                </span>
              </div>
              <p className="hidden sm:block text-[13.5px] text-slate-300 font-normal mt-0.5">
                DADO Creative Studio • Numeri diretti sopra email, WhatsApp & Post-it motivo ultimo contatto (Call conoscitiva, Chiamata, Appuntamento, Briefing)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Esporta CSV */}
            <button
              type="button"
              onClick={exportToCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[14px] font-semibold flex items-center gap-1.5 border border-slate-600 transition-all cursor-pointer shadow-xs"
              title="Esporta tutta la rubrica in formato CSV (Excel)"
            >
              <FileSpreadsheet size={16} className="text-emerald-400" />
              <span className="hidden sm:inline">Esporta CSV</span>
            </button>

            {/* Nuovo Collaboratore */}
            <button
              type="button"
              onClick={startCreating}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[14px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Aggiungi un nuovo contatto / collaboratore"
            >
              <Plus size={16} />
              <span>Nuovo Collaboratore</span>
            </button>

            {/* Pulsante Chiusura */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer ml-1"
              title="Chiudi finestra (ESC)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ══ BARRA RICERCA E FILTRI ESTESA ══ */}
        <div className="px-3 sm:px-6 py-2 sm:py-2.5 bg-[#0d1627] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 sm:gap-3 flex-shrink-0">
          {/* Input Ricerca */}
          <div className="relative flex-1 min-w-0 sm:min-w-[260px] max-w-lg w-full">
            <input
              type="text"
              placeholder="Cerca collaboratore, azienda, numero, email, call conoscitiva, briefing..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedIndex(0)
              }}
              className="w-full px-3.5 py-1.5 pl-9 rounded-xl bg-[#080e1a] border border-slate-700 text-[14px] text-white placeholder-slate-400 focus:outline-hidden focus:border-purple-500 shadow-inner"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1.5 text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro Motivo Ultimo Contatto (Call Conoscitiva, Chiamata, Appuntamento, Briefing) */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[13px] font-bold py-0.5">
            <span className="text-amber-300 uppercase tracking-wider text-[11.5px] mr-1 hidden xl:inline">Motivo Contatto:</span>
            {[
              { id: 'ALL', label: `Tutti i Post-it (${collaborators.length})` },
              { id: 'Call Conoscitiva', label: 'Call Conoscitiva' },
              { id: 'Chiamata', label: 'Chiamata' },
              { id: 'Appuntamento', label: 'Appuntamento' },
              { id: 'Briefing', label: 'Briefing' },
            ].map((cf) => (
              <button
                key={cf.id}
                type="button"
                onClick={() => {
                  setContactCategoryFilter(cf.id)
                  setSelectedIndex(0)
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap border ${
                  contactCategoryFilter === cf.id
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs font-black'
                    : 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 border-amber-700/40'
                }`}
              >
                {cf.label}
              </button>
            ))}
          </div>

          {/* Filtri Categoria Ruolo + Ordinamento */}
          <div className="flex items-center gap-2 overflow-x-auto text-[13px] font-semibold py-0.5">
            {[
              { id: 'ALL', label: 'Tutti i Ruoli' },
              { id: 'DIRECTION', label: 'Direzione' },
              { id: 'MARKETING', label: 'Marketing' },
              { id: 'TECHNICAL', label: 'Art & Tech' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setRoleFilter(f.id)
                  setSelectedIndex(0)
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === f.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-[13px] text-slate-200 focus:outline-hidden focus:border-purple-500 ml-1"
            >
              <option value="name-asc">Nome (A - Z)</option>
              <option value="name-desc">Nome (Z - A)</option>
              <option value="company-asc">Azienda (A - Z)</option>
              <option value="recent">Più recenti</option>
            </select>
          </div>
        </div>

        {/* ══ CORPO MASTER-DETAIL ESTESO IN ORIZZONTALE ══ */}
        <div ref={bodyScrollRef} className="flex-1 min-h-0 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* COLONNA SINISTRA: Lista Collaboratori (Allargata, con Numeri estesi sopra Email e Post-it Ultimo Contatto) */}
          <div
            className={`w-full md:w-[440px] lg:w-[480px] border-r border-slate-800 bg-[#080f1e] flex-col flex-shrink-0 md:overflow-y-auto ${isCreating || editingCollab ? 'hidden md:flex' : 'flex'}`}
            style={{ scrollbarWidth: 'thin' }}
          >
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-[15px] flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span>Caricamento rubrica collaboratori...</span>
              </div>
            ) : filteredCollaborators.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-[15px]">
                <p className="font-semibold text-slate-300">Nessun collaboratore trovato</p>
                <p className="text-[14px] text-slate-500 mt-1">Prova a modificare i filtri o il termine di ricerca</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/70">
                {filteredCollaborators.map((c, idx) => {
                  const isSelected = idx === safeIndex
                  const category = getContactCategory(c)
                  return (
                    <div
                      key={c.id || idx}
                      onClick={() => {
                        setSelectedIndex(idx)
                        setIsCreating(false)
                        setEditingCollab(null)
                        // Su telefono il dettaglio è sotto l'elenco: scorre fin lì
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                          setTimeout(() => detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
                        }
                      }}
                      className={`px-4 py-3.5 cursor-pointer transition-all flex items-start gap-3.5 relative group ${
                        isSelected
                          ? 'bg-purple-950/45 border-l-4 border-purple-500'
                          : 'hover:bg-slate-800/40 border-l-4 border-transparent'
                      }`}
                    >
                      {/* Avatar Circolare */}
                      <div
                        className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[15px] text-white bg-gradient-to-br shadow-xs mt-0.5 ${getAvatarGradient(
                          c.name
                        )}`}
                      >
                        {getInitials(c.name)}
                      </div>

                      {/* Info collaboratore: Nome, Ruolo, Azienda, Numeri estesi SOPRA Email, e Post-it Motivo Ultimo Contatto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-[16.5px] font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                            {c.name}
                          </h4>
                          <span className="text-[12.5px] text-purple-300 font-semibold truncate">
                            {c.role || 'Referente'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[13.5px] text-slate-300 truncate mt-0.5">
                          <Building2 size={13} className="text-purple-400 flex-shrink-0" />
                          <span className="font-semibold truncate">{c.companyName}</span>
                        </div>

                        {/* NUMERI DEL COLLABORATORE ESTESI IN ORIZZONTALE SUBITO SOPRA L'INDIRIZZO EMAIL */}
                        <div className="flex flex-col gap-1 mt-2 w-full">
                          <div className="w-full flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 px-2.5 py-1 rounded-lg bg-emerald-950/65 border border-emerald-700/45 text-emerald-300 text-[13px] font-bold">
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                              <Smartphone size={13} className="text-emerald-400 shrink-0" />
                              <span>Cell: {c.mobile || c.phone || 'Non inserito'}</span>
                            </span>
                            {c.phone && c.mobile && c.phone !== c.mobile && (
                              <span className="flex items-center gap-1 text-[12.5px] text-emerald-200 whitespace-nowrap">
                                <Phone size={12} className="text-emerald-400 shrink-0" />
                                <span>Uff: {c.phone}</span>
                              </span>
                            )}
                          </div>

                          {/* INDIRIZZO EMAIL ESTESO SUBITO SOTTO I NUMERI */}
                          <div className="w-full flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg bg-slate-800/85 border border-slate-700/70 text-slate-200 text-[13px] font-medium">
                            <span className="flex items-start gap-1.5 min-w-0">
                              <Mail size={13} className="text-sky-400 shrink-0 mt-0.5" />
                              <span className="leading-snug" style={{ overflowWrap: 'anywhere' }}>{c.email || 'Email non inserita'}</span>
                            </span>
                          </div>
                        </div>

                        {/* POST-IT MOTIVO ULTIMO CONTATTO (Call Conoscitiva / Chiamata / Appuntamento / Briefing) */}
                        <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-amber-100/95 border border-amber-300 text-amber-950 shadow-2xs">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="px-2 py-0.2 rounded bg-amber-300/90 text-amber-950 font-black uppercase text-[10.5px] tracking-wider">
                              📌 {category}
                            </span>
                            <span className="text-[11px] font-bold text-amber-900">
                              {c.lastContactDayDate || c.lastContact || 'Recente'}
                            </span>
                          </div>
                          <p className="text-[12px] font-semibold text-amber-950 leading-snug mt-1 line-clamp-2">
                            {c.lastContactWhy || c.notes || 'Allineamento operativo sulle produzioni DADO.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* COLONNA DESTRA: Dettaglio Esteso Orizzontalmente / Bacheca Completa Post-it / Form di Modifica */}
          <div ref={detailPanelRef} className="flex-none md:flex-1 min-w-0 md:min-h-0 bg-[#0d1627] p-3 sm:p-6 md:overflow-y-auto w-full pb-6" style={{ scrollbarWidth: 'thin' }}>
            {isCreating || editingCollab ? (
              /* FORM CREAZIONE / MODIFICA ESTESO IN ORIZZONTALE */
              <form onSubmit={handleSaveForm} className="w-full space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      {isCreating ? <Plus size={16} /> : <Edit2 size={16} />}
                    </div>
                    <div>
                      <h4 className="text-[19px] font-bold text-white">
                        {isCreating ? 'Aggiungi Nuovo Collaboratore' : `Modifica: ${editingCollab.name}`}
                      </h4>
                      <p className="text-[14.5px] text-slate-300 mt-0.5">
                        Compila i recapiti aziendali e il Post-it motivo ultimo contatto per sincronizzare la rubrica del CRM
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false)
                      setEditingCollab(null)
                    }}
                    className="text-[15px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Annulla
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                  {/* Nome e Cognome */}
                  <div className="space-y-1">
                    <label className="text-[13px] font-bold uppercase tracking-wider text-slate-300">
                      Nome & Cognome *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="es. Matteo Colombo"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#080f1e] border border-slate-700 text-[14.5px] text-white focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  {/* Ruolo / Mansione */}
                  <div className="space-y-1">
                    <label className="text-[13px] font-bold uppercase tracking-wider text-slate-300">
                      Ruolo / Incarico in Azienda
                    </label>
                    <input
                      type="text"
                      placeholder="es. Marketing & Brand Manager"
                      value={formState.role}
                      onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#080f1e] border border-slate-700 text-[14.5px] text-white focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  {/* Azienda Collegata (dropdown o testo) */}
                  <div className="space-y-1">
                    <label className="text-[13px] font-bold uppercase tracking-wider text-slate-300">
                      Azienda di Appartenenza
                    </label>
                    <select
                      value={formState.companyId}
                      onChange={(e) => {
                        const compId = e.target.value
                        const comp = companies.find((c) => c.id === compId)
                        setFormState({
                          ...formState,
                          companyId: compId,
                          companyName: comp ? comp.name : formState.companyName,
                        })
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#080f1e] border border-slate-700 text-[14.5px] text-white focus:outline-hidden focus:border-purple-500"
                    >
                      <option value="">-- Seleziona Azienda Esistente --</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nome Azienda Manuale se non in lista */}
                  <div className="space-y-1">
                    <label className="text-[13px] font-bold uppercase tracking-wider text-slate-300">
                      Oppure Nome Azienda Personalizzato
                    </label>
                    <input
                      type="text"
                      placeholder="es. Studio Creativo Associato"
                      value={formState.companyName}
                      onChange={(e) => setFormState({ ...formState, companyName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#080f1e] border border-slate-700 text-[14.5px] text-white focus:outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Numeri di Telefono Estesi Subito Sopra l'Indirizzo Email anche nel Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[13px] font-bold uppercase tracking-wider text-emerald-300">
                      Cellulare Diretto (con prefisso int.)
                    </label>
                    <input
                      type="text"
                      placeholder="es. +39 340 1234567"
                      value={formState.mobile}
                      onChange={(e) => setFormState({ ...formState, mobile: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#080f1e] border border-emerald-700/60 text-[14.5px] text-white focus:outline-hidden focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[13px] font-bold uppercase tracking-wider text-emerald-300">
                      Telefono Ufficio / Centralino
                    </label>
                    <input
                      type="text"
                      placeholder="es. +39 02 892341"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#080f1e] border border-emerald-700/60 text-[14.5px] text-white focus:outline-hidden focus:border-emerald-400"
                    />
                  </div>
                </div>

                {/* Indirizzo Email Esteso Subito Sotto i Numeri */}
                <div className="space-y-1">
                  <label className="text-[13px] font-bold uppercase tracking-wider text-sky-300">
                    Indirizzo Email Diretto
                  </label>
                  <input
                    type="email"
                    placeholder="es. referente@azienda.it"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080f1e] border border-sky-700/60 text-[14.5px] text-white focus:outline-hidden focus:border-sky-400"
                  />
                </div>

                {/* Sezione Post-it Ultimo Contatto */}
                <div className="p-4 rounded-xl bg-amber-950/25 border border-amber-500/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📌</span>
                    <div>
                      <h5 className="text-[15px] font-bold text-amber-300">
                        Post-it Ultimo Contatto: Motivo (Call Conoscitiva, Chiamata, Appuntamento, Briefing)
                      </h5>
                      <p className="text-[12.5px] text-amber-200/70">
                        Visualizzato nel Post-It giallo della scheda contatto e nella bacheca contatti
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[12.5px] font-bold uppercase tracking-wider text-amber-200">
                        Tipologia Contatto *
                      </label>
                      <select
                        value={formState.lastContactCategory}
                        onChange={(e) => setFormState({ ...formState, lastContactCategory: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#080f1e] border border-amber-600/50 text-[14px] text-white focus:outline-hidden focus:border-amber-400"
                      >
                        <option value="Call Conoscitiva">Call Conoscitiva</option>
                        <option value="Chiamata">Chiamata</option>
                        <option value="Appuntamento">Appuntamento</option>
                        <option value="Briefing">Briefing</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[12.5px] font-bold uppercase tracking-wider text-amber-200">
                        Data e Giorno Ultimo Contatto
                      </label>
                      <input
                        type="text"
                        placeholder="es. Lunedì 12 Ottobre"
                        value={formState.lastContactDayDate}
                        onChange={(e) => setFormState({ ...formState, lastContactDayDate: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#080f1e] border border-amber-600/50 text-[14px] text-white focus:outline-hidden focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[12.5px] font-bold uppercase tracking-wider text-amber-200">
                        Come si sono sentiti (Canale)
                      </label>
                      <input
                        type="text"
                        placeholder="es. Call WhatsApp & Google Meet"
                        value={formState.lastContactHow}
                        onChange={(e) => setFormState({ ...formState, lastContactHow: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#080f1e] border border-amber-600/50 text-[14px] text-white focus:outline-hidden focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12.5px] font-bold uppercase tracking-wider text-amber-200">
                      Perché si sono sentiti (Motivo Ultimo Contatto)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="es. Briefing preventivo video reels 9:16 e calendario date shooting studio..."
                      value={formState.lastContactWhy}
                      onChange={(e) => setFormState({ ...formState, lastContactWhy: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#080f1e] border border-amber-600/50 text-[14px] text-white focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Note Operative */}
                <div className="space-y-1 pt-1">
                  <label className="text-[13px] font-bold uppercase tracking-wider text-slate-300">
                    Note Operative, Abitudini & Storico Collaborazione
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Dettagli su mansioni, preferenze orarie, briefing o persone di riferimento..."
                    value={formState.notes}
                    onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080f1e] border border-slate-700 text-[14.5px] text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                {/* Pulsanti Azione Form */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false)
                      setEditingCollab(null)
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[15px] font-semibold cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-[15px] font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Save size={16} />
                    <span>{saving ? 'Salvataggio...' : 'Salva Scheda Collaboratore'}</span>
                  </button>
                </div>
              </form>
            ) : !activeCollab ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                <UserPlus size={40} className="mb-2 text-slate-600" />
                <span>Seleziona un collaboratore dall'elenco a sinistra</span>
              </div>
            ) : (
              /* SCHEDA DETTAGLIO COLLABORATORE ATTIVO — ESTESA IN ORIZZONTALE */
              <div className="space-y-4 w-full">
                {/* 1. Header Profilo con Avatar Grande (Senza riquadrino "Attivo") */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#131d32] border border-slate-700/80 shadow-md flex flex-wrap items-center justify-between gap-4 w-full">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-[21px] text-white bg-gradient-to-br shadow-lg ${getAvatarGradient(
                        activeCollab.name
                      )}`}
                    >
                      {getInitials(activeCollab.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-[22px] font-black text-white tracking-wide">
                          {activeCollab.name}
                        </h2>
                        <span className="text-[13.5px] font-bold px-3 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/40">
                          {activeCollab.role || 'Referente'}
                        </span>
                        <span className="text-[12.5px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-300">
                          📌 {getContactCategory(activeCollab)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[16px] text-slate-300 font-medium mt-1 flex-wrap">
                        <Building2 size={16} className="text-purple-400 flex-shrink-0" />
                        <span className="font-bold text-white">{activeCollab.companyName}</span>
                        {activeCollab.companyIndustry && (
                          <span className="text-[14px] text-slate-400">• {activeCollab.companyIndustry}</span>
                        )}
                        <span className="text-[13px] text-slate-400">
                          • Primo contatto:{' '}
                          {typeof activeCollab.createdAt === 'object'
                            ? activeCollab.createdAt.date
                            : activeCollab.createdAt || 'N/D'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pulsanti Azione Modifica / Elimina / Scarica vCard */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => exportToVCard(activeCollab)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                      title="Scarica vCard (.vcf) per rubrica smartphone/Mac"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditing(activeCollab)}
                      className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-[14.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Modifica recapiti collaboratore"
                    >
                      <Edit2 size={15} />
                      <span>Modifica</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCollabToDelete(activeCollab)}
                      className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition-all cursor-pointer"
                      title="Rimuovi collaboratore dalla rubrica"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* 2. RECAPITI: cellulare (con Chiama e WhatsApp), telefono ufficio, email — riquadri ordinati e a prova di testo lungo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  {/* Cellulare diretto + Chiama + WhatsApp */}
                  <div className="min-w-0 p-3.5 rounded-2xl bg-[#101e33] border border-emerald-700/60 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <Smartphone size={19} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[11.5px] font-black text-emerald-400 uppercase tracking-wider block leading-tight">
                          Cellulare diretto
                        </span>
                        {activeCollab.mobile ? (
                          <a
                            href={`tel:${activeCollab.mobile}`}
                            className="text-[17px] sm:text-[18px] font-black text-white hover:text-emerald-300 transition-colors whitespace-nowrap block"
                          >
                            {activeCollab.mobile}
                          </a>
                        ) : (
                          <span className="text-[15px] text-slate-400">Non inserito</span>
                        )}
                      </div>
                      {activeCollab.mobile && (
                        <button
                          type="button"
                          onClick={(e) => handleCopy(activeCollab.mobile, 'mobile', e)}
                          className="w-9 h-9 shrink-0 flex items-center justify-center text-slate-300 hover:text-white rounded-lg bg-slate-800/70 hover:bg-slate-700 border border-slate-600/70 cursor-pointer"
                          title="Copia numero cellulare"
                        >
                          {copiedKey === 'mobile' ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                        </button>
                      )}
                    </div>
                    {activeCollab.mobile && (
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`tel:${activeCollab.mobile}`}
                          className="min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[14px] flex items-center justify-center gap-2 border border-slate-600 transition-all"
                          title="Chiama il cellulare"
                        >
                          <Phone size={16} />
                          <span>Chiama</span>
                        </a>
                        <a
                          href={getWhatsAppLink(activeCollab.mobile, activeCollab.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all"
                          title="Avvia chat WhatsApp diretta"
                        >
                          <MessageCircle size={16} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Telefono ufficio / sede */}
                  <div className="min-w-0 p-3.5 rounded-2xl bg-[#0f2230] border border-teal-700/60 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
                        <Phone size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[11.5px] font-black text-teal-300 uppercase tracking-wider block leading-tight">
                          Telefono ufficio / sede
                        </span>
                        {activeCollab.phone ? (
                          <a
                            href={`tel:${activeCollab.phone}`}
                            className="text-[17px] font-bold text-slate-100 hover:text-teal-200 transition-colors whitespace-nowrap block"
                          >
                            {activeCollab.phone}
                          </a>
                        ) : (
                          <span className="text-[15px] text-slate-400">Non inserito</span>
                        )}
                      </div>
                      {activeCollab.phone && (
                        <button
                          type="button"
                          onClick={(e) => handleCopy(activeCollab.phone, 'phone', e)}
                          className="w-9 h-9 shrink-0 flex items-center justify-center text-slate-300 hover:text-white rounded-lg bg-slate-800/70 hover:bg-slate-700 border border-slate-600/70 cursor-pointer"
                          title="Copia telefono ufficio"
                        >
                          {copiedKey === 'phone' ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                        </button>
                      )}
                    </div>
                    {activeCollab.phone && (
                      <a
                        href={`tel:${activeCollab.phone}`}
                        className="min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[14px] flex items-center justify-center gap-2 border border-slate-600 transition-all"
                        title="Chiama il telefono ufficio"
                      >
                        <Phone size={16} />
                        <span>Chiama ufficio</span>
                      </a>
                    )}
                  </div>

                  {/* Email: indirizzo su riga propria, a capo senza uscire dal riquadro */}
                  <div className="min-w-0 md:col-span-2 p-3.5 rounded-2xl bg-[#101b2f] border border-sky-700/60 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                        <Mail size={19} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[11.5px] font-black text-sky-400 uppercase tracking-wider block leading-tight">
                          Email diretta aziendale
                        </span>
                        {activeCollab.email ? (
                          <a
                            href={`mailto:${activeCollab.email}`}
                            className="text-[15px] sm:text-[17px] font-bold text-white hover:text-sky-300 transition-colors block leading-snug"
                            style={{ overflowWrap: 'anywhere' }}
                          >
                            {activeCollab.email}
                          </a>
                        ) : (
                          <span className="text-[15px] text-slate-400">Email non inserita</span>
                        )}
                      </div>
                    </div>
                    {activeCollab.email && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleCopy(activeCollab.email, 'email', e)}
                          className="min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-[14px] font-semibold flex items-center justify-center gap-2 border border-slate-600 cursor-pointer"
                          title="Copia indirizzo email"
                        >
                          {copiedKey === 'email' ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                          <span>{copiedKey === 'email' ? 'Copiato' : 'Copia email'}</span>
                        </button>
                        <a
                          href={`mailto:${activeCollab.email}`}
                          className="min-h-[44px] px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <Mail size={15} />
                          <span>Scrivi email</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. POST-IT ULTIMO CONTATTO DEL COLLABORATORE SELEZIONATO */}
                <div
                  className="p-5 rounded-2xl relative shadow-xl transition-all w-full"
                  style={{
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%)',
                    border: '2px solid #facc15',
                    boxShadow: '0 8px 24px rgba(234, 179, 8, 0.22), 0 2px 6px rgba(0, 0, 0, 0.12)',
                    fontFamily: '"Switzer", sans-serif',
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300/80 pb-2.5 mb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[16.5px] font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                        📌 POST-IT ULTIMO CONTATTO — {activeCollab.name.toUpperCase()}
                      </span>
                      <span className="px-3 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black uppercase text-[12.5px] border border-amber-500 shadow-2xs">
                        {getContactCategory(activeCollab)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-200/90 text-amber-950 px-3 py-1 rounded-lg border border-amber-300 font-bold text-[14px] shadow-xs">
                      <span>🗓️</span>
                      <span>
                        {activeCollab.lastContactDayDate ||
                          (activeCollab.lastContact ? `Data: ${activeCollab.lastContact}` : 'Recente')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-slate-900">
                    {/* Canale / Come */}
                    <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 shadow-2xs">
                      <span className="text-[12px] font-black uppercase tracking-wider text-amber-900 block mb-1">
                        📞 Modalità & Canale ({getContactCategory(activeCollab)}):
                      </span>
                      <p className="text-[15px] font-bold text-amber-950 leading-snug">
                        {activeCollab.lastContactHow ||
                          (activeCollab.mobile ? 'Call WhatsApp & Telefono Diretto' : 'Email diretta & Centralino')}
                      </p>
                    </div>

                    {/* Motivo / Perché */}
                    <div className="md:col-span-2 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 shadow-2xs">
                      <span className="text-[12px] font-black uppercase tracking-wider text-amber-900 block mb-1">
                        💡 Motivo Ultimo Contatto (Call Conoscitiva / Chiamata / Appuntamento / Briefing):
                      </span>
                      <p className="text-[15px] font-bold text-amber-950 leading-snug">
                        {activeCollab.lastContactWhy ||
                          activeCollab.notes ||
                          'Allineamento operativo sulle produzioni, set fotografico e preventivi DADO.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-amber-300/60 flex items-center justify-between text-[13px] text-amber-900 font-semibold">
                    <span>
                      Referente:{' '}
                      <strong className="text-amber-950 font-bold">{activeCollab.name}</strong> •{' '}
                      {activeCollab.companyName}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditing(activeCollab)}
                      className="text-amber-950 hover:text-black font-bold underline cursor-pointer"
                    >
                      Modifica Post-it ✎
                    </button>
                  </div>
                </div>

                {/* 4. BACHECA RIEPILOGATIVA DI TUTTI I POST-IT ULTIMO CONTATTO (Tutti i 15 Contatti) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#111c30] border border-slate-800 space-y-3 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📋</span>
                      <h4 className="text-[15px] font-black uppercase tracking-wider text-amber-300">
                        Bacheca Completa Post-it Ultimo Contatto ({collaborators.length} Contatti Registrati)
                      </h4>
                    </div>
                    <span className="text-[12.5px] text-slate-400">
                      Clicca su un post-it per aprire la scheda del collaboratore
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {collaborators.map((item) => {
                      const cat = getContactCategory(item)
                      const isCurrent = activeCollab && item.id === activeCollab.id
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            const idxInFiltered = filteredCollaborators.findIndex((fc) => fc.id === item.id)
                            if (idxInFiltered !== -1) {
                              setSelectedIndex(idxInFiltered)
                            } else {
                              setContactCategoryFilter('ALL')
                              setRoleFilter('ALL')
                              setSearchQuery('')
                              const idxAll = collaborators.findIndex((fc) => fc.id === item.id)
                              if (idxAll !== -1) setSelectedIndex(idxAll)
                            }
                          }}
                          className={`p-3 rounded-xl cursor-pointer transition-all border ${
                            isCurrent
                              ? 'bg-amber-200 border-amber-500 ring-2 ring-amber-400 shadow-md'
                              : 'bg-amber-50/95 hover:bg-amber-100 border-amber-300/90'
                          } text-amber-950 flex flex-col justify-between gap-1.5`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-black text-[13.5px] text-amber-950 truncate">
                                {item.name}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-amber-300/90 text-amber-950 font-black uppercase text-[10px] tracking-wider shrink-0">
                                {cat}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11.5px] text-amber-900 font-bold mt-0.5">
                              <span className="truncate">{item.companyName}</span>
                              <span className="shrink-0">{item.lastContactDayDate || item.lastContact}</span>
                            </div>
                            <p className="text-[12px] font-semibold text-amber-950 mt-1.5 leading-snug">
                              {item.lastContactWhy || item.notes}
                            </p>
                          </div>
                          <div className="pt-1.5 border-t border-amber-300/60 text-[11px] text-amber-900 font-bold flex items-center justify-between">
                            <span>📞 {item.mobile || item.phone || 'N/D'}</span>
                            <span className="truncate max-w-[160px]">✉️ {item.email}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 5. Note Operative & Storico Collaborazione */}
                <div className="p-4 rounded-xl bg-[#111c30] border border-slate-800 space-y-2.5 w-full">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[15px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <Clock size={15} />
                      <span>Note Operative & Contesto Aziendale ({activeCollab.companyName})</span>
                    </h4>
                    <span className="text-[13.5px] text-slate-400 font-medium">
                      Ultima modifica: {activeCollab.updatedAt || 'N/D'}
                    </span>
                  </div>

                  <p className="text-[15px] text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/80">
                    {activeCollab.notes || 'Nessuna nota operativa inserita per questo contatto.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ MODALE CONFERMA ELIMINAZIONE ══ */}
        {collabToDelete && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
            onClick={() => setCollabToDelete(null)}
          >
            <div
              className="w-full max-w-md p-6 rounded-2xl bg-[#162035] border border-rose-600/50 shadow-2xl text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
                <AlertTriangle size={24} />
              </div>

              <div>
                <h4 className="text-[19px] font-black text-white">Rimuovere {collabToDelete.name}?</h4>
                <p className="text-[15px] text-slate-300 mt-1.5">
                  Sei sicuro di voler eliminare questo collaboratore da {collabToDelete.companyName}?
                  L'azione è irreversibile nella rubrica.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCollabToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[15px] font-semibold cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={confirmDelete}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[15px] font-bold cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {saving ? 'Eliminazione...' : 'Conferma Rimozione'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
