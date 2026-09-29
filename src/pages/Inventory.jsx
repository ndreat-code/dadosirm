import { useState, useEffect, useMemo } from 'react'
import {
  Camera,
  Layers,
  Aperture,
  Zap,
  HardDrive,
  Sun,
  BatteryCharging,
  Battery,
  Lightbulb,
  Disc,
  Package,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  Building2,
  User,
  Phone,
  Mail,
  FileText,
  X,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react'

// Categorie ufficiali dell'inventario richieste dallo studio
export const INVENTORY_CATEGORIES = [
  { id: 'all', label: 'Tutti gli Articoli', icon: Package, emoji: '📦' },
  { id: 'macchina', label: 'Macchine', icon: Camera, emoji: '📷' },
  { id: 'accessori_macchina', label: 'Accessori Macchina', icon: Layers, emoji: '⚙️' },
  { id: 'obbiettivi', label: 'Obiettivi', icon: Aperture, emoji: '🔍' },
  { id: 'flash', label: 'Flash & Trigger', icon: Zap, emoji: '⚡' },
  { id: 'memorie', label: 'SD & Memorie', icon: HardDrive, emoji: '💾' },
  { id: 'bilanciamento_bianco', label: 'Bilanciamento Bianco', icon: Disc, emoji: '🎯' },
  { id: 'powerbank', label: 'Powerbank', icon: BatteryCharging, emoji: '🔌' },
  { id: 'batterie', label: 'Batterie Ulteriori (Stilo & Camera)', icon: Battery, emoji: '🔋' },
  { id: 'luci', label: 'Luci & Illuminatori', icon: Lightbulb, emoji: '💡' },
  { id: 'riflettori', label: 'Riflettori & Diffusori', icon: Sun, emoji: '☀️' },
  { id: 'extra', label: 'Extra & Grip', icon: Package, emoji: '🧰' },
]

export function getCategoryBadge(catId) {
  const cat = INVENTORY_CATEGORIES.find(c => c.id === catId)
  if (!cat) return { label: catId, emoji: '📦' }
  return { label: cat.label, emoji: cat.emoji }
}

// Calcola lo stato del noleggio e i giorni rimanenti
export function getRentalDeadlineStatus(endDateStr) {
  if (!endDateStr) return { status: 'unknown', label: 'Data non specificata', color: '#888888' }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(endDateStr)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    const abs = Math.abs(diffDays)
    return {
      status: 'expired',
      days: diffDays,
      label: `Scaduto da ${abs} ${abs === 1 ? 'giorno' : 'giorni'}`,
      color: '#ff4444',
      bg: 'rgba(255, 68, 68, 0.15)',
      border: 'rgba(255, 68, 68, 0.45)'
    }
  }
  if (diffDays === 0) {
    return {
      status: 'today',
      days: 0,
      label: 'Scade oggi',
      color: '#ff9800',
      bg: 'rgba(255, 152, 0, 0.18)',
      border: 'rgba(255, 152, 0, 0.5)'
    }
  }
  if (diffDays === 1) {
    return {
      status: 'tomorrow',
      days: 1,
      label: 'Scade domani',
      color: '#00e5ff',
      bg: 'rgba(0, 229, 255, 0.15)',
      border: 'rgba(0, 229, 255, 0.4)'
    }
  }
  return {
    status: 'upcoming',
    days: diffDays,
    label: `Scade tra ${diffDays} giorni`,
    color: '#00e575',
    bg: 'rgba(0, 229, 117, 0.12)',
    border: 'rgba(0, 229, 117, 0.35)'
  }
}

export default function Inventory() {
  const [inventory, setInventory] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('all') // 'all', 'rentals', 'available'
  const [sortBy, setSortBy] = useState('category') // 'category', 'value_desc', 'name', 'rental_deadline'

  // Modali
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRentModal, setShowRentModal] = useState(false)
  const [selectedItemForRent, setSelectedItemForRent] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(null)

  // Form Nuovo Articolo
  const [newArticle, setNewArticle] = useState({
    name: '',
    category: 'macchina',
    brand: '',
    serialNumber: '',
    quantity: 1,
    estimatedValue: '',
    location: 'Studio / Armadio A1',
    notes: ''
  })

  // Form Assegna Noleggio
  const [rentForm, setRentForm] = useState({
    itemId: '',
    clientName: '',
    company: '',
    contactPhone: '',
    contactEmail: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    agreedPrice: '',
    pricingType: 'Totale forfait',
    contractCode: `DADO-RENT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    deposit: '',
    notes: ''
  })

  // Caricamento dati da backend
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [resInv, resSum] = await Promise.all([
          fetch('/api/crm/inventory'),
          fetch('/api/crm/summary')
        ])

        if (resInv.ok) {
          const dataInv = await resInv.json()
          if (dataInv.inventory) {
            setInventory(dataInv.inventory)
          }
        }
        if (resSum.ok) {
          const dataSum = await resSum.json()
          if (dataSum.companies) {
            setCompanies(dataSum.companies)
          }
        }
      } catch (err) {
        console.error('Errore caricamento dati inventario:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // KPI Statistiche Calcolate
  const stats = useMemo(() => {
    const totalItems = inventory.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
    const totalValue = inventory.reduce((sum, item) => sum + (Number(item.estimatedValue) || 0), 0)
    
    const rentedItems = inventory.filter(i => i.status === 'noleggiato')
    const inStudioItems = inventory.filter(i => i.status === 'in_studio')
    
    const activeRentalsCount = rentedItems.length
    const totalRentalRevenue = rentedItems.reduce((sum, item) => sum + (Number(item.rental?.agreedPrice) || 0), 0)

    // Noleggi in scadenza o scaduti
    const dueSoonCount = rentedItems.filter(item => {
      const d = getRentalDeadlineStatus(item.rental?.endDate)
      return d.status === 'expired' || d.status === 'today' || d.status === 'tomorrow'
    }).length

    return {
      totalItems,
      totalValue,
      rentedItemsCount: activeRentalsCount,
      inStudioCount: inStudioItems.length,
      totalRentalRevenue,
      dueSoonCount
    }
  }, [inventory])

  // Filtraggio & Ordinamento
  const filteredInventory = useMemo(() => {
    let list = [...inventory]

    // Filtro per Tab principale
    if (activeTab === 'rentals') {
      list = list.filter(item => item.status === 'noleggiato')
    } else if (activeTab === 'available') {
      list = list.filter(item => item.status === 'in_studio')
    }

    // Filtro per Categoria
    if (selectedCategory !== 'all') {
      list = list.filter(item => item.category === selectedCategory)
    }

    // Filtro per Ricerca testuale
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(item => {
        return (
          item.name?.toLowerCase().includes(q) ||
          item.brand?.toLowerCase().includes(q) ||
          item.serialNumber?.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q) ||
          item.rental?.company?.toLowerCase().includes(q) ||
          item.rental?.clientName?.toLowerCase().includes(q) ||
          item.rental?.contractCode?.toLowerCase().includes(q)
        )
      })
    }

    // Ordinamento
    list.sort((a, b) => {
      if (sortBy === 'value_desc') {
        return (b.estimatedValue || 0) - (a.estimatedValue || 0)
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '')
      }
      if (sortBy === 'rental_deadline') {
        const dateA = a.rental?.endDate ? new Date(a.rental.endDate).getTime() : Infinity
        const dateB = b.rental?.endDate ? new Date(b.rental.endDate).getTime() : Infinity
        return dateA - dateB
      }
      // default: category
      return (a.category || '').localeCompare(b.category || '')
    })

    return list
  }, [inventory, activeTab, selectedCategory, search, sortBy])

  // Azione: Crea Articolo
  async function handleCreateArticle(e) {
    e.preventDefault()
    if (!newArticle.name.trim()) return

    try {
      const res = await fetch('/api/crm/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticle)
      })

      if (res.ok) {
        const data = await res.json()
        if (data.inventory) {
          setInventory(data.inventory)
        }
        setShowAddModal(false)
        setNewArticle({
          name: '',
          category: 'macchina',
          brand: '',
          serialNumber: '',
          quantity: 1,
          estimatedValue: '',
          location: 'Studio / Armadio A1',
          notes: ''
        })
      }
    } catch (err) {
      console.error('Errore creazione articolo:', err)
    }
  }

  // Azione: Assegna Noleggio
  async function handleAssignRental(e) {
    e.preventDefault()
    const targetItemId = rentForm.itemId || selectedItemForRent?.id
    if (!targetItemId) return

    try {
      const res = await fetch(`/api/crm/inventory/${targetItemId}/rent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rentForm)
      })

      if (res.ok) {
        const data = await res.json()
        if (data.inventory) {
          setInventory(data.inventory)
        }
        setShowRentModal(false)
        setSelectedItemForRent(null)
      }
    } catch (err) {
      console.error('Errore assegnazione noleggio:', err)
    }
  }

  // Azione: Segna come Rientrato
  async function handleReturnItem(itemId) {
    if (!confirm('Confermi il rientro dell\'attrezzatura in studio?')) return

    try {
      const res = await fetch(`/api/crm/inventory/${itemId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnLocation: 'Studio / Armadio A1',
          returnNotes: 'Rientrato integro e verificato dal team di produzione'
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.inventory) {
          setInventory(data.inventory)
        }
      }
    } catch (err) {
      console.error('Errore rientro articolo:', err)
    }
  }

  // Azione: Elimina Articolo
  async function handleDeleteItem(itemId) {
    if (!confirm('Sei sicuro di voler rimuovere questo articolo dall\'inventario?')) return

    try {
      const res = await fetch(`/api/crm/inventory/${itemId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        const data = await res.json()
        if (data.inventory) {
          setInventory(data.inventory)
        }
      }
    } catch (err) {
      console.error('Errore eliminazione articolo:', err)
    }
  }

  return (
    <div className="h-full min-h-screen md:min-h-0 bg-[#111111] flex flex-col flex-1 relative overflow-hidden">
      
      {/* ── CANVAS VERDE TAVOLO DA BILIARDO (#007a50) IDENTICO AL CRM ── */}
      <div className="h-full flex-1 bg-[#007a50] rounded-tl-[48px] rounded-bl-[48px] flex flex-col justify-between relative min-w-0 overflow-hidden">

        {/* ── Banda Bianca Superiore Decorativa ── */}
        <div className="w-full flex justify-end flex-shrink-0">
          <div className="bg-white rounded-bl-2xl w-[calc(100%-2.5rem)]" style={{ height: 'calc(3rem - 0.5cm)' }} />
        </div>

        {/* ── Contenuto Principale con scroll fluido ── */}
        <div className="flex-1 min-h-0 pl-10 pr-8 py-3 overflow-y-auto no-scrollbar">

          {/* ── TITOLO IN ALTO (INSPIRATION + SOTTOTITOLO SWITZER CIANO/ARANCIO) ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-black/20 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-black text-[#00ffaa] rounded-none">
                  Studio & Noleggi
                </span>
              </div>
              <p style={{ marginTop: '2px', fontSize: '18px', fontFamily: '"Switzer", sans-serif', fontWeight: 600 }}>
                <span style={{ color: '#00e5ff' }}>Attrezzatura di produzione & </span>
                <span style={{ color: '#ff6f43' }}>noleggi attivi</span>
                <span style={{ color: '#ffffff', fontSize: '13.5px', fontFamily: '"Space Mono", monospace', marginLeft: '14px', fontWeight: 400 }}>
                  ({inventory.length} articoli registrati)
                </span>
              </p>
            </div>

            {/* Pulsanti Azione in Alto */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Bottone Assegna Noleggio Rapido */}
              <button
                type="button"
                onClick={() => {
                  setSelectedItemForRent(null)
                  setRentForm(prev => ({
                    ...prev,
                    itemId: inventory.find(i => i.status === 'in_studio')?.id || '',
                    contractCode: `DADO-RENT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
                  }))
                  setShowRentModal(true)
                }}
                className="px-4 py-2 bg-[#d8ff00] hover:bg-[#cbf000] text-[#111111] text-xs font-bold uppercase tracking-wider rounded-none flex items-center gap-2 transition-transform active:scale-95 shadow-sm"
                style={{ fontFamily: '"Switzer", sans-serif', fontWeight: 800 }}
              >
                <Clock className="w-4 h-4 stroke-[2.5]" />
                <span>+ Nuovo Noleggio</span>
              </button>

              {/* Bottone Aggiungi Articolo */}
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#ff6f43] hover:bg-[#ff5722] text-[#111111] text-xs font-bold uppercase tracking-wider rounded-none flex items-center gap-2 transition-transform active:scale-95 shadow-sm"
                style={{ fontFamily: '"Switzer", sans-serif', fontWeight: 800 }}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Aggiungi Articolo</span>
              </button>
            </div>
          </div>

          {/* ── KPI METRICS CARDS (NERO, BIANCO, MENTA, ARANCIO) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            
            {/* Card 1: Totale Attrezzatura a Catalogo */}
            <div
              className="p-3.5 flex flex-col justify-between shadow-sm"
              style={{ backgroundColor: '#111111', borderRadius: '4px' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: '#ff6f43', fontFamily: '"Switzer", sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
                  EQUIPAGGIAMENTO TOTALE
                </span>
                <Camera className="w-4 h-4 text-[#ff6f43]" />
              </div>
              <div className="mt-2 text-3xl font-black font-mono text-white leading-none">
                {stats.totalItems} <span className="text-sm font-sans font-normal text-white/60">pezzi</span>
              </div>
              <div className="mt-1 text-xs text-[#00e5ff]" style={{ fontFamily: '"Switzer", sans-serif', fontWeight: 500 }}>
                Valore stimato: € {stats.totalValue.toLocaleString('it-IT')}
              </div>
            </div>

            {/* Card 2: Attrezzatura in Studio Disponibile */}
            <div
              className="p-3.5 flex flex-col justify-between shadow-sm"
              style={{ backgroundColor: '#00ffaa', borderRadius: '4px' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: '#111111', fontFamily: '"Switzer", sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
                  DISPONIBILE IN STUDIO
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#111111]" />
              </div>
              <div className="mt-2 text-3xl font-black font-mono text-[#111111] leading-none">
                {stats.inStudioCount} <span className="text-sm font-sans font-bold text-[#111111]/70">articoli</span>
              </div>
              <div className="mt-1 text-xs text-[#111111]/90 font-bold" style={{ fontFamily: '"Switzer", sans-serif' }}>
                Pronti subito per shooting & set
              </div>
            </div>

            {/* Card 3: Oggetti Dati a Noleggio */}
            <div
              className="p-3.5 flex flex-col justify-between shadow-sm"
              style={{ backgroundColor: '#111111', borderRadius: '4px' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: '#00e5ff', fontFamily: '"Switzer", sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
                  OGGETTI A NOLEGGIO
                </span>
                <Clock className="w-4 h-4 text-[#00e5ff]" />
              </div>
              <div className="mt-2 text-3xl font-black font-mono text-white leading-none">
                {stats.rentedItemsCount} <span className="text-sm font-sans font-normal text-white/60">in comodato</span>
              </div>
              <div className="mt-1 text-xs text-[#ff9800]" style={{ fontFamily: '"Switzer", sans-serif', fontWeight: 500 }}>
                {stats.dueSoonCount > 0 ? `${stats.dueSoonCount} rientro/i in scadenza` : 'Nessuna criticità di rientro'}
              </div>
            </div>

            {/* Card 4: Entrate Noleggi Pattuite */}
            <div
              className="p-3.5 flex flex-col justify-between shadow-sm"
              style={{ backgroundColor: '#ffffff', borderRadius: '4px' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: '#111111', fontFamily: '"Switzer", sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
                  RICAVI NOLEGGI ATTIVI
                </span>
                <DollarSign className="w-4 h-4 text-[#007a50]" />
              </div>
              <div className="mt-2 text-3xl font-black font-mono text-[#007a50] leading-none">
                € {stats.totalRentalRevenue.toLocaleString('it-IT')}
              </div>
              <div className="mt-1 text-xs text-black/70 font-semibold" style={{ fontFamily: '"Switzer", sans-serif' }}>
                Tariffe contratti in corso
              </div>
            </div>

          </div>

          {/* ── BARRA SWITCHER TAB PRINCIPALI ── */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                  activeTab === 'all'
                    ? 'bg-[#111111] text-[#00ffaa] border-black shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/10'
                }`}
              >
                Tutto l'Equipaggiamento ({inventory.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rentals')}
                className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border flex items-center gap-2 ${
                  activeTab === 'rentals'
                    ? 'bg-[#ff6f43] text-[#111111] border-black shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/10'
                }`}
              >
                <span>Oggetti a Noleggio</span>
                <span className="px-1.5 py-0.2 bg-black text-white text-[10px] rounded">
                  {stats.rentedItemsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('available')}
                className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                  activeTab === 'available'
                    ? 'bg-[#00ffaa] text-[#111111] border-black shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/10'
                }`}
              >
                Disponibili in Studio ({stats.inStudioCount})
              </button>
            </div>

            {/* Ordinamento */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#111111] px-3 py-1.5 border border-black text-white text-xs font-mono">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#00e5ff]" />
                <span className="text-white/60">Ordina:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[#00ffaa] font-bold outline-none cursor-pointer"
                >
                  <option value="category" className="bg-[#111111] text-white">Categoria</option>
                  <option value="value_desc" className="bg-[#111111] text-white">Valore decrescente</option>
                  <option value="name" className="bg-[#111111] text-white">Nome A-Z</option>
                  <option value="rental_deadline" className="bg-[#111111] text-white">Scadenza Noleggio</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── FILTRI CATEGORIE A PILLOLE RAPIDE ── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
            {INVENTORY_CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id
              const count = cat.id === 'all'
                ? inventory.length
                : inventory.filter(i => i.category === cat.id).length

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-black text-[#00e5ff] font-bold shadow-sm ring-1 ring-[#00e5ff]'
                      : 'bg-black/30 hover:bg-black/50 text-white/90'
                  }`}
                  style={{ fontFamily: '"Switzer", sans-serif' }}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${isSelected ? 'bg-[#00e5ff] text-black font-bold' : 'bg-white/10 text-white/70'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* ── BARRA DI RICERCA ── */}
          <div className="mb-5 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca fotocamera, obiettivo, matricola, seriale, cliente noleggio..."
                className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-black text-white text-sm placeholder-white/40 rounded-none focus:outline-none focus:ring-1 focus:ring-[#00e5ff]"
                style={{ fontFamily: '"Switzer", sans-serif' }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <span className="text-xs font-mono text-white/80 whitespace-nowrap">
              {filteredInventory.length} di {inventory.length} articoli visualizzati
            </span>
          </div>

          {/* ── LISTA / CARD DEGLI ARTICOLI ── */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-white gap-3">
              <div className="w-8 h-8 border-2 border-[#00e5ff] border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-xs text-white/70">Caricamento inventario DADO Studio...</span>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-12 text-center bg-black/20 border border-black/30 rounded-none text-white my-4">
              <Package className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <h3 className="text-lg font-bold" style={{ fontFamily: '"Switzer", sans-serif' }}>
                Nessun articolo trovato
              </h3>
              <p className="text-sm text-white/60 mt-1 max-w-md mx-auto">
                Nessun elemento corrisponde ai filtri selezionati. Prova a reimpostare la ricerca o aggiungi un nuovo pezzo.
              </p>
              <button
                type="button"
                onClick={() => { setSearch(''); setSelectedCategory('all'); setActiveTab('all'); }}
                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-mono text-[#00ffaa]"
              >
                Reimposta tutti i filtri
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 mb-10">
              {filteredInventory.map(item => {
                const isRented = item.status === 'noleggiato'
                const deadline = isRented ? getRentalDeadlineStatus(item.rental?.endDate) : null
                const catBadge = getCategoryBadge(item.category)

                return (
                  <div
                    key={item.id}
                    className={`p-4 border transition-all flex flex-col justify-between relative shadow-sm ${
                      isRented
                        ? 'bg-[#181818] border-[#ff6f43]/50 hover:border-[#ff6f43]'
                        : 'bg-[#111111] border-black/40 hover:border-black'
                    }`}
                    style={{ borderRadius: '2px' }}
                  >
                    {/* Header Card Articolo */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        {/* Categoria Badge */}
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/60 border border-white/10 text-[11px] font-mono text-white/80">
                          <span>{catBadge.emoji}</span>
                          <span>{catBadge.label}</span>
                        </div>

                        {/* Status Badge */}
                        {isRented ? (
                          <div
                            className="px-2 py-0.5 text-[11px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 border"
                            style={{
                              color: deadline?.color || '#ff9800',
                              backgroundColor: deadline?.bg || 'rgba(255, 152, 0, 0.15)',
                              borderColor: deadline?.border || 'rgba(255, 152, 0, 0.4)'
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: deadline?.color || '#ff9800' }} />
                            <span>A NOLEGGIO</span>
                          </div>
                        ) : (
                          <div className="px-2 py-0.5 text-[11px] font-bold font-mono uppercase tracking-wider text-[#00ffaa] bg-[#00ffaa]/10 border border-[#00ffaa]/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00ffaa]" />
                            <span>IN STUDIO</span>
                          </div>
                        )}
                      </div>

                      {/* Nome Articolo */}
                      <h3
                        className="text-[17px] font-bold text-white tracking-tight leading-snug hover:text-[#00e5ff] cursor-pointer"
                        style={{ fontFamily: '"Switzer", sans-serif' }}
                        onClick={() => setShowDetailModal(item)}
                      >
                        {item.name}
                      </h3>

                      {/* Brand & Seriale */}
                      <div className="mt-1 flex items-center gap-3 text-xs text-white/60 font-mono">
                        {item.brand && <span className="text-white/80 font-bold">{item.brand}</span>}
                        {item.serialNumber && (
                          <span className="text-white/40">S/N: {item.serialNumber}</span>
                        )}
                        {item.quantity > 1 && (
                          <span className="px-1.5 py-0.2 bg-white/10 text-white font-bold rounded">
                            Q.tà: {item.quantity}
                          </span>
                        )}
                      </div>

                      {/* Ubicazione e Note */}
                      <div className="mt-2.5 text-xs text-white/70" style={{ fontFamily: '"Switzer", sans-serif' }}>
                        <span className="text-white/40 font-mono">Ubicazione: </span>
                        <span className="text-white/90 font-medium">{item.location}</span>
                        {item.notes && (
                          <p className="mt-1 text-white/50 text-[11.5px] italic line-clamp-2">
                            "{item.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* BOX PARTICOLARE: SE L'OGGETTO È DATO A NOLEGGIO */}
                    {isRented && item.rental && (
                      <div className="mt-3.5 p-3 bg-black/80 border border-[#ff6f43]/40 rounded-none text-xs">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                          <span className="text-[11px] font-mono text-[#ff6f43] font-bold uppercase flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Contratto: {item.rental.contractCode}
                          </span>
                          <span
                            className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded"
                            style={{ color: deadline.color, backgroundColor: deadline.bg }}
                          >
                            {deadline.label}
                          </span>
                        </div>

                        {/* Dettagli Persona / Azienda */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-white font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-[#00e5ff] shrink-0" />
                            <span className="truncate">{item.rental.company || 'Cliente'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-white/80">
                            <User className="w-3.5 h-3.5 text-white/40 shrink-0" />
                            <span className="truncate">{item.rental.clientName}</span>
                          </div>
                          {(item.rental.contactPhone || item.rental.contactEmail) && (
                            <div className="flex items-center gap-3 text-white/50 text-[11px] font-mono pt-0.5">
                              {item.rental.contactPhone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {item.rental.contactPhone}
                                </span>
                              )}
                              {item.rental.contactEmail && (
                                <span className="flex items-center gap-1 truncate">
                                  <Mail className="w-3 h-3" /> {item.rental.contactEmail}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Date e Prezzo Pattuito */}
                          <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                            <div className="text-white/60">
                              Rientro: <strong className="text-white">{item.rental.endDate || 'N/D'}</strong>
                            </div>
                            <div className="text-[#00ffaa] font-bold text-xs">
                              Pattuito: € {Number(item.rental.agreedPrice || 0).toLocaleString('it-IT')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer Card: Valore Stimato & Azioni */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="text-xs font-mono text-white/50">
                        Stima: <strong className="text-white">€ {(item.estimatedValue || 0).toLocaleString('it-IT')}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {isRented ? (
                          <button
                            type="button"
                            onClick={() => handleReturnItem(item.id)}
                            className="px-2.5 py-1 bg-[#00ffaa] hover:bg-[#00e599] text-[#111111] text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-transform active:scale-95"
                            title="Segna come Rientrato in Studio"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Rientrato</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedItemForRent(item)
                              setRentForm(prev => ({
                                ...prev,
                                itemId: item.id,
                                contractCode: `DADO-RENT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
                              }))
                              setShowRentModal(true)
                            }}
                            className="px-2.5 py-1 bg-[#d8ff00] hover:bg-[#cbf000] text-[#111111] text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-transform active:scale-95"
                            title="Assegna questo pezzo a noleggio"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Noleggia</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setShowDetailModal(item)}
                          className="p-1 text-white/50 hover:text-white"
                          title="Vedi dettagli"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>

      {/* ── MODALE: AGGIUNGI NUOVO ARTICOLO ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/20 w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: '"Switzer", sans-serif' }}>
                <Plus className="w-5 h-5 text-[#ff6f43]" />
                <span>Nuovo Articolo in Inventario</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-mono text-white/70 mb-1">Nome Equipaggiamento *</label>
                <input
                  type="text"
                  required
                  placeholder="es. Sony FX3 Cinema Line o Godox V1 Pro"
                  value={newArticle.name}
                  onChange={(e) => setNewArticle({ ...newArticle, name: e.target.value })}
                  className="w-full p-2.5 bg-black border border-white/20 text-white rounded-none focus:outline-none focus:border-[#00e5ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-white/70 mb-1">Categoria *</label>
                  <select
                    value={newArticle.category}
                    onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/20 text-[#00ffaa] font-bold rounded-none focus:outline-none focus:border-[#00e5ff]"
                  >
                    {INVENTORY_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-white/70 mb-1">Brand / Marca</label>
                  <input
                    type="text"
                    placeholder="es. Sony, Godox, Aputure..."
                    value={newArticle.brand}
                    onChange={(e) => setNewArticle({ ...newArticle, brand: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/20 text-white rounded-none focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-white/70 mb-1">Numero Seriale (S/N)</label>
                  <input
                    type="text"
                    placeholder="es. SN-49210"
                    value={newArticle.serialNumber}
                    onChange={(e) => setNewArticle({ ...newArticle, serialNumber: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/20 text-white rounded-none focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-white/70 mb-1">Quantità</label>
                  <input
                    type="number"
                    min="1"
                    value={newArticle.quantity}
                    onChange={(e) => setNewArticle({ ...newArticle, quantity: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/20 text-white rounded-none focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-white/70 mb-1">Valore Stimato (€)</label>
                  <input
                    type="number"
                    placeholder="es. 1200"
                    value={newArticle.estimatedValue}
                    onChange={(e) => setNewArticle({ ...newArticle, estimatedValue: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/20 text-[#00ffaa] font-mono font-bold rounded-none focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-white/70 mb-1">Ubicazione in Studio</label>
                <input
                  type="text"
                  placeholder="es. Studio / Armadio A1 o Borsa Rig 1"
                  value={newArticle.location}
                  onChange={(e) => setNewArticle({ ...newArticle, location: e.target.value })}
                  className="w-full p-2.5 bg-black border border-white/20 text-white rounded-none focus:outline-none focus:border-[#00e5ff]"
                />
              </div>

              <div>
                <label className="block font-mono text-white/70 mb-1">Note & Accessori Inclusi</label>
                <textarea
                  rows="2"
                  placeholder="Note sulle condizioni, compatibilità, accessori a corredo..."
                  value={newArticle.notes}
                  onChange={(e) => setNewArticle({ ...newArticle, notes: e.target.value })}
                  className="w-full p-2 bg-black border border-white/20 text-white rounded-none focus:outline-none focus:border-[#00e5ff]"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-mono"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ff6f43] hover:bg-[#ff5722] text-[#111111] font-bold uppercase tracking-wider font-mono shadow-md"
                >
                  Salva Articolo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODALE: ASSEGNA A NOLEGGIO ── */}
      {showRentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#ff6f43]/40 w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: '"Switzer", sans-serif' }}>
                <Clock className="w-5 h-5 text-[#d8ff00]" />
                <span>Assegna Articolo a Noleggio / Comodato</span>
              </h2>
              <button
                type="button"
                onClick={() => { setShowRentModal(false); setSelectedItemForRent(null); }}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignRental} className="space-y-3.5 text-xs">
              {/* Selezione Articolo */}
              <div>
                <label className="block font-mono text-white/70 mb-1">Articolo da Noleggiare *</label>
                <select
                  required
                  value={rentForm.itemId || selectedItemForRent?.id || ''}
                  onChange={(e) => setRentForm({ ...rentForm, itemId: e.target.value })}
                  className="w-full p-2.5 bg-black border border-white/20 text-[#00e5ff] font-bold rounded-none focus:outline-none focus:border-[#00e5ff]"
                >
                  <option value="" disabled>Seleziona un pezzo disponibile...</option>
                  {inventory
                    .filter(item => item.status === 'in_studio' || item.id === selectedItemForRent?.id)
                    .map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.brand || 'DADO Studio'})
                      </option>
                    ))}
                </select>
              </div>

              {/* Dettagli Persona / Azienda */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-white/70 mb-1">Azienda / Studio Cliente *</label>
                  <input
                    type="text"
                    required
                    list="companies-list"
                    placeholder="es. Fashion Brand Milano"
                    value={rentForm.company}
                    onChange={(e) => setRentForm({ ...rentForm, company: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/20 text-white rounded-none focus:outline-none focus:border-[#00e5ff]"
                  />
                  <datalist id="companies-list">
                    {companies.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block font-mono text-white/70 mb-1">Persona Referente *</label>
                  <input
                    type="text"
                    required
                    placeholder="es. Matteo Colombo"
                    value={rentForm.clientName}
                    onChange={(e) => setRentForm({ ...rentForm, clientName: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/20 text-white rounded-none focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
              </div>

              {/* Contatti */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-white/70 mb-1">Telefono Referente</label>
                  <input
                    type="tel"
                    placeholder="+39 348 1234567"
                    value={rentForm.contactPhone}
                    onChange={(e) => setRentForm({ ...rentForm, contactPhone: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/20 text-white rounded-none focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-white/70 mb-1">Email Referente</label>
                  <input
                    type="email"
                    placeholder="m.colombo@azienda.it"
                    value={rentForm.contactEmail}
                    onChange={(e) => setRentForm({ ...rentForm, contactEmail: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/20 text-white rounded-none focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
              </div>

              {/* Date Noleggio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-white/70 mb-1">Data Inizio Noleggio</label>
                  <input
                    type="date"
                    required
                    value={rentForm.startDate}
                    onChange={(e) => setRentForm({ ...rentForm, startDate: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/20 text-white rounded-none focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-white/70 mb-1">Scadenza Noleggio Contratto *</label>
                  <input
                    type="date"
                    required
                    value={rentForm.endDate}
                    onChange={(e) => setRentForm({ ...rentForm, endDate: e.target.value })}
                    className="w-full p-2.5 bg-black border border-[#ff6f43] text-[#ff6f43] font-bold rounded-none focus:outline-none"
                  />
                </div>
              </div>

              {/* Prezzo Pattuito e Codice Contratto */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-white/70 mb-1">Prezzo Pattuito (€) *</label>
                  <input
                    type="number"
                    required
                    placeholder="es. 250"
                    value={rentForm.agreedPrice}
                    onChange={(e) => setRentForm({ ...rentForm, agreedPrice: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/20 text-[#00ffaa] font-mono font-bold rounded-none focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-white/70 mb-1">Tipo Tariffa</label>
                  <select
                    value={rentForm.pricingType}
                    onChange={(e) => setRentForm({ ...rentForm, pricingType: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/20 text-white rounded-none focus:outline-none"
                  >
                    <option value="Totale forfait">Totale forfait</option>
                    <option value="€ / Giorno">€ / Giorno</option>
                    <option value="Tariffa Weekend">Tariffa Weekend</option>
                    <option value="Tariffa Settimanale">Tariffa Settimanale</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-white/70 mb-1">Codice Contratto</label>
                  <input
                    type="text"
                    value={rentForm.contractCode}
                    onChange={(e) => setRentForm({ ...rentForm, contractCode: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/20 text-white font-mono rounded-none focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-white/70 mb-1">Note Contratto / Condizioni consegna</label>
                <textarea
                  rows="2"
                  placeholder="Accessori inclusi nel noleggio, cavi, cauzione concordata..."
                  value={rentForm.notes}
                  onChange={(e) => setRentForm({ ...rentForm, notes: e.target.value })}
                  className="w-full p-2 bg-black border border-white/20 text-white rounded-none focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowRentModal(false); setSelectedItemForRent(null); }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-mono"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d8ff00] hover:bg-[#cbf000] text-[#111111] font-bold uppercase tracking-wider font-mono shadow-md"
                >
                  Conferma Noleggio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODALE: DETTAGLIO ARTICOLO & STORICO NOLEGGI ── */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/20 w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono px-2 py-0.5 bg-black border border-white/10 text-[#00e5ff]">
                    {getCategoryBadge(showDetailModal.category).label}
                  </span>
                  <span className={`text-xs font-mono font-bold uppercase px-2 py-0.5 ${
                    showDetailModal.status === 'noleggiato'
                      ? 'bg-[#ff9800]/20 text-[#ff9800] border border-[#ff9800]/40'
                      : 'bg-[#00ffaa]/20 text-[#00ffaa] border border-[#00ffaa]/40'
                  }`}>
                    {showDetailModal.status === 'noleggiato' ? 'A Noleggio' : 'In Studio (Disponibile)'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: '"Switzer", sans-serif' }}>
                  {showDetailModal.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(null)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-black/60 p-3 border border-white/10 font-mono">
                <div>
                  <span className="text-white/40 block text-[10px]">BRAND</span>
                  <span className="text-white font-bold">{showDetailModal.brand || 'N/D'}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">SERIAL NUMBER</span>
                  <span className="text-white">{showDetailModal.serialNumber || 'N/D'}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">VALORE STIMATO</span>
                  <span className="text-[#00ffaa] font-bold">€ {(showDetailModal.estimatedValue || 0).toLocaleString('it-IT')}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">UBICAZIONE</span>
                  <span className="text-white">{showDetailModal.location || 'Studio'}</span>
                </div>
              </div>

              {/* Se a Noleggio, Scheda Completa Contratto */}
              {showDetailModal.status === 'noleggiato' && showDetailModal.rental && (
                <div className="p-4 bg-black border border-[#ff6f43]/40 rounded-none">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                    <span className="text-sm font-bold text-[#ff6f43] font-mono flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      CONTRATTO DI NOLEGGIO IN CORSO
                    </span>
                    <span className="text-xs font-mono text-white/60">
                      Codice: <strong>{showDetailModal.rental.contractCode}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <span className="text-white/40 font-mono block">Azienda / Studio</span>
                      <span className="text-white font-bold text-sm">{showDetailModal.rental.company}</span>
                    </div>
                    <div>
                      <span className="text-white/40 font-mono block">Referente</span>
                      <span className="text-white text-sm">{showDetailModal.rental.clientName}</span>
                    </div>
                    <div>
                      <span className="text-white/40 font-mono block">Periodo Noleggio</span>
                      <span className="text-white">
                        {showDetailModal.rental.startDate} &rarr; <strong className="text-[#00e5ff]">{showDetailModal.rental.endDate}</strong>
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40 font-mono block">Prezzo Pattuito</span>
                      <span className="text-[#00ffaa] font-bold text-sm">
                        € {Number(showDetailModal.rental.agreedPrice || 0).toLocaleString('it-IT')} ({showDetailModal.rental.pricingType})
                      </span>
                    </div>
                  </div>

                  {showDetailModal.rental.notes && (
                    <div className="text-white/70 italic bg-white/5 p-2 rounded text-[11.5px]">
                      "{showDetailModal.rental.notes}"
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        handleReturnItem(showDetailModal.id)
                        setShowDetailModal(null)
                      }}
                      className="px-4 py-2 bg-[#00ffaa] hover:bg-[#00e599] text-[#111111] font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Registra Rientro in Studio</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Storico Noleggi Passati */}
              <div>
                <h4 className="font-mono text-white/60 mb-2 uppercase tracking-wider text-[11px]">
                  Storico Noleggi Precedenti ({showDetailModal.rentalHistory?.length || 0})
                </h4>
                {showDetailModal.rentalHistory && showDetailModal.rentalHistory.length > 0 ? (
                  <div className="space-y-2">
                    {showDetailModal.rentalHistory.map((h, i) => (
                      <div key={i} className="p-2.5 bg-black/40 border border-white/5 flex items-center justify-between text-[11px] font-mono">
                        <div>
                          <strong className="text-white">{h.company}</strong> ({h.clientName})
                          <div className="text-white/40 text-[10px]">
                            Rientrato il: {new Date(h.returnedAt).toLocaleDateString('it-IT')}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[#00ffaa] font-bold">€ {h.agreedPrice}</span>
                          <span className="text-white/40 block text-[10px]">{h.contractCode}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/30 italic text-[11px]">Nessun noleggio precedente archiviato per questo pezzo.</p>
                )}
              </div>

              {/* Pulsante Eliminazione */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteItem(showDetailModal.id)
                    setShowDetailModal(null)
                  }}
                  className="text-red-400 hover:text-red-300 font-mono text-[11px]"
                >
                  Elimina questo articolo dall'inventario
                </button>

                <button
                  type="button"
                  onClick={() => setShowDetailModal(null)}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white font-mono"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
