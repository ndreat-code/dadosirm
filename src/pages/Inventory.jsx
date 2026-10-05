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
  if (!endDateStr) return { status: 'unknown', label: 'Data non specificata', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' }
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
      color: '#b91c1c',
      bg: '#fee2e2',
      border: '#fca5a5'
    }
  }
  if (diffDays === 0) {
    return {
      status: 'today',
      days: 0,
      label: 'Scade oggi',
      color: '#b45309',
      bg: '#fef3c7',
      border: '#fde68a'
    }
  }
  if (diffDays === 1) {
    return {
      status: 'tomorrow',
      days: 1,
      label: 'Scade domani',
      color: '#0369a1',
      bg: '#e0f2fe',
      border: '#bae6fd'
    }
  }
  return {
    status: 'upcoming',
    days: diffDays,
    label: `Scade tra ${diffDays} giorni`,
    color: '#15803d',
    bg: '#dcfce7',
    border: '#bbf7d0'
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

  // Caricamento Dati Iniziali dal backend Express
  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/crm-data')
      if (res.ok) {
        const data = await res.json()
        setInventory(data.inventory || [])
        setCompanies(data.companies || [])
      }
    } catch (err) {
      console.error('Errore caricamento inventario:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventoryData()
  }, [])

  // Statistiche e KPI
  const stats = useMemo(() => {
    const totalItems = inventory.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0)
    const inStudioCount = inventory.filter(i => i.status === 'in_studio').length
    const rentedItemsCount = inventory.filter(i => i.status === 'noleggiato').length
    const totalValue = inventory.reduce((acc, curr) => acc + (Number(curr.estimatedValue) || 0), 0)
    const totalRentalRevenue = inventory
      .filter(i => i.status === 'noleggiato')
      .reduce((acc, curr) => acc + (Number(curr.rental?.agreedPrice) || 0), 0)

    // Noleggi che scadono entro 2 giorni o scaduti
    const dueSoonCount = inventory.filter(i => {
      if (i.status !== 'noleggiato' || !i.rental?.endDate) return false
      const st = getRentalDeadlineStatus(i.rental.endDate)
      return st.status === 'expired' || st.status === 'today' || st.status === 'tomorrow'
    }).length

    return {
      totalItems,
      inStudioCount,
      rentedItemsCount,
      totalValue,
      totalRentalRevenue,
      dueSoonCount
    }
  }, [inventory])

  // Filtraggio Articoli
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      // Filtro Tab (Tutti, Noleggiati, Disponibili in Studio)
      if (activeTab === 'rentals' && item.status !== 'noleggiato') return false
      if (activeTab === 'available' && item.status !== 'in_studio') return false

      // Filtro Categoria
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false

      // Ricerca Testuale
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchName = item.name?.toLowerCase().includes(q)
        const matchBrand = item.brand?.toLowerCase().includes(q)
        const matchSerial = item.serialNumber?.toLowerCase().includes(q)
        const matchLocation = item.location?.toLowerCase().includes(q)
        const matchClient = item.rental?.clientName?.toLowerCase().includes(q)
        const matchCompany = item.rental?.company?.toLowerCase().includes(q)
        const matchContract = item.rental?.contractCode?.toLowerCase().includes(q)

        if (!matchName && !matchBrand && !matchSerial && !matchLocation && !matchClient && !matchCompany && !matchContract) {
          return false
        }
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'value_desc') {
        return (Number(b.estimatedValue) || 0) - (Number(a.estimatedValue) || 0)
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'rental_deadline') {
        if (a.status === 'noleggiato' && b.status !== 'noleggiato') return -1
        if (b.status === 'noleggiato' && a.status !== 'noleggiato') return 1
        if (a.status === 'noleggiato' && b.status === 'noleggiato') {
          return new Date(a.rental?.endDate || 0) - new Date(b.rental?.endDate || 0)
        }
        return 0
      }
      return 0
    })
  }, [inventory, activeTab, selectedCategory, search, sortBy])

  // Gestione Creazione Articolo
  const handleCreateArticle = async (e) => {
    e.preventDefault()
    if (!newArticle.name.trim()) return

    const articleData = {
      ...newArticle,
      id: `inv-${Date.now()}`,
      status: 'in_studio',
      quantity: Number(newArticle.quantity) || 1,
      estimatedValue: Number(newArticle.estimatedValue) || 0,
      createdAt: new Date().toISOString()
    }

    try {
      const res = await fetch('/api/crm-data/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      })

      if (res.ok) {
        const data = await res.json()
        if (data.inventory) {
          setInventory(data.inventory)
        } else {
          setInventory(prev => [articleData, ...prev])
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
      console.error('Errore salvataggio articolo:', err)
    }
  }

  // Gestione Assegnazione Noleggio
  const handleAssignRental = async (e) => {
    e.preventDefault()
    const targetItemId = rentForm.itemId || selectedItemForRent?.id
    if (!targetItemId) return

    const rentalPayload = {
      clientName: rentForm.clientName,
      company: rentForm.company,
      contactPhone: rentForm.contactPhone,
      contactEmail: rentForm.contactEmail,
      startDate: rentForm.startDate,
      endDate: rentForm.endDate,
      agreedPrice: Number(rentForm.agreedPrice) || 0,
      pricingType: rentForm.pricingType,
      contractCode: rentForm.contractCode,
      deposit: rentForm.deposit,
      notes: rentForm.notes,
      assignedAt: new Date().toISOString()
    }

    try {
      const res = await fetch(`/api/crm-data/inventory/${targetItemId}/rent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rentalPayload)
      })

      if (res.ok) {
        const data = await res.json()
        if (data.inventory) {
          setInventory(data.inventory)
        }
        setShowRentModal(false)
        setSelectedItemForRent(null)
        setRentForm({
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
      }
    } catch (err) {
      console.error('Errore assegnazione noleggio:', err)
    }
  }

  // Registra Rientro in Studio
  const handleReturnItem = async (itemId) => {
    try {
      const res = await fetch(`/api/crm-data/inventory/${itemId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.ok) {
        const data = await res.json()
        if (data.inventory) {
          setInventory(data.inventory)
        }
      }
    } catch (err) {
      console.error('Errore registrazione rientro:', err)
    }
  }

  // Elimina Articolo
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo articolo dall\'inventario?')) return

    try {
      const res = await fetch(`/api/crm-data/inventory/${itemId}`, {
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
    <div
      className="h-full min-h-screen md:min-h-0 bg-transparent flex flex-col flex-1 relative overflow-hidden"
      style={{
        fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      
      {/* ── CANVAS ARMONIZZATO STILE DASHBOARD CON COLORI VIVI ── */}
      <div
        className="h-full flex-1 rounded-tl-none rounded-bl-none flex flex-col justify-between relative min-w-0 overflow-hidden"
        style={{
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
          borderLeft: '1.5px solid #d4ebf9',
          background: `
            radial-gradient(ellipse 520px 400px at 8% 16%, rgba(83, 186, 117, 0.32) 0%, rgba(83, 186, 117, 0.08) 55%, transparent 75%),
            radial-gradient(ellipse 560px 440px at 92% 12%, rgba(27, 183, 237, 0.35) 0%, rgba(27, 183, 237, 0.09) 55%, transparent 75%),
            radial-gradient(ellipse 500px 400px at 45% 82%, rgba(234, 56, 36, 0.25) 0%, rgba(234, 56, 36, 0.06) 55%, transparent 75%),
            radial-gradient(ellipse 480px 360px at 85% 78%, rgba(250, 196, 41, 0.32) 0%, rgba(250, 196, 41, 0.08) 55%, transparent 75%),
            radial-gradient(ellipse 420px 340px at 28% 48%, rgba(27, 183, 237, 0.24) 0%, transparent 70%),
            radial-gradient(ellipse 440px 360px at 68% 35%, rgba(83, 186, 117, 0.22) 0%, transparent 70%),
            linear-gradient(180deg, #f0f8fd 0%, #e6f3fa 100%)
          `,
        }}
      >
        {/* Sfere di luce d'atmosfera brand a colori vividi (stile Dashboard ma più accesi) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
          {/* Macchia Verde brand (#53ba75) - zona sinistra superiore */}
          <div
            className="absolute rounded-full"
            style={{
              top: '4%',
              left: '5%',
              width: '460px',
              height: '380px',
              background: 'radial-gradient(circle, rgba(83, 186, 117, 0.38) 0%, rgba(83, 186, 117, 0.12) 50%, transparent 75%)',
              filter: 'blur(54px)',
              transform: 'rotate(-12deg)',
            }}
          />
          {/* Macchia Ciano brand (#1bb7ed) - zona destra superiore */}
          <div
            className="absolute rounded-full"
            style={{
              top: '6%',
              right: '4%',
              width: '500px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(27, 183, 237, 0.40) 0%, rgba(27, 183, 237, 0.14) 50%, transparent 75%)',
              filter: 'blur(58px)',
              transform: 'rotate(18deg)',
            }}
          />
          {/* Macchia Rosso Corallo brand (#ea3824) - zona inferiore centrale/sinistra */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: '4%',
              left: '30%',
              width: '480px',
              height: '360px',
              background: 'radial-gradient(circle, rgba(234, 56, 36, 0.28) 0%, rgba(234, 56, 36, 0.08) 50%, transparent 75%)',
              filter: 'blur(60px)',
              transform: 'rotate(25deg)',
            }}
          />
          {/* Macchia Giallo Caldo brand (#fac429) - zona destra inferiore */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: '8%',
              right: '8%',
              width: '440px',
              height: '340px',
              background: 'radial-gradient(circle, rgba(250, 196, 41, 0.35) 0%, rgba(250, 196, 41, 0.10) 50%, transparent 75%)',
              filter: 'blur(52px)',
              transform: 'rotate(-15deg)',
            }}
          />
        </div>

        {/* ── Contenuto Principale con scroll fluido ── */}
        <div className="flex-1 min-h-0 pl-6 md:pl-8 pr-6 md:pr-8 py-4 overflow-y-auto no-scrollbar relative z-10">

          {/* ── TITOLO IN ALTO CON BADGE & AZIONI ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-sky-200/80 pb-3.5">
            <div className="flex items-center flex-wrap gap-y-2">
              <h1
                className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-none select-none"
                style={{ fontFamily: '"Switzer", sans-serif' }}
              >
                Inventario
              </h1>

              {/* A 5 cm di distanza dal titolo: Nuovo Noleggio e Aggiungi Articolo senza riquadri, con font moderno e +2pt */}
              <div
                className="flex items-center gap-7 ml-4 md:ml-[5cm]"
                style={{ marginLeft: '5cm' }}
              >
                {/* Nuovo Noleggio — Blu tenue come la lettera D del brand logo (#1bb7ed) */}
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
                  className="group flex items-center gap-2 text-[15px] font-bold transition-all hover:opacity-75 active:scale-95 cursor-pointer bg-transparent border-0 p-0 select-none"
                  style={{
                    fontFamily: '"Switzer", sans-serif',
                    color: '#1bb7ed',
                  }}
                  title="Registra un nuovo noleggio attrezzatura"
                >
                  <Clock className="w-4.5 h-4.5 stroke-[2.3] transition-transform group-hover:rotate-12" style={{ stroke: '#1bb7ed' }} />
                  <span className="tracking-wide">Nuovo Noleggio</span>
                </button>

                {/* Aggiungi Articolo — Icona + e testo senza segno + */}
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="group flex items-center gap-2 text-[15px] font-bold transition-all hover:opacity-75 active:scale-95 cursor-pointer bg-transparent border-0 p-0 select-none"
                  style={{
                    fontFamily: '"Switzer", sans-serif',
                    color: '#059669',
                  }}
                  title="Aggiungi nuovo articolo a catalogo"
                >
                  <Plus className="w-4.5 h-4.5 stroke-[2.6] transition-transform group-hover:scale-110" style={{ stroke: '#059669' }} />
                  <span className="tracking-wide">Aggiungi Articolo</span>
                </button>
              </div>
            </div>

            {/* Al centro destra: testo strumenti registrati in color perla */}
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-xs select-none">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span
                  className="text-[13px] font-mono font-bold tracking-wide"
                  style={{ color: '#f0f4f8' }}
                >
                  {inventory.length} strumenti registrati
                </span>
              </div>
            </div>
          </div>

          {/* ── KPI METRICS CARDS (ELEGANTI BIANCHE CON ACCENTI SMERALDO & AMBRA) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            
            {/* Card 1: Totale Attrezzatura a Catalogo */}
            <div className="p-4 flex flex-col justify-between bg-white border border-emerald-100 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-slate-500 uppercase tracking-wider">
                  Equipaggiamento Totale
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#166534] flex items-center justify-center border border-emerald-100">
                  <Camera className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-2 text-[27px] font-black text-slate-900 leading-none">
                {stats.totalItems} <span className="text-[15px] font-normal text-slate-500">pezzi</span>
              </div>
              <div className="mt-1.5 text-[15px] text-emerald-700 font-semibold">
                Valore stimato: € {stats.totalValue.toLocaleString('it-IT')}
              </div>
            </div>

            {/* Card 2: Attrezzatura in Studio Disponibile */}
            <div className="p-4 flex flex-col justify-between bg-white border border-emerald-100 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-slate-500 uppercase tracking-wider">
                  Disponibile in Studio
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-2 text-[27px] font-black text-emerald-700 leading-none">
                {stats.inStudioCount} <span className="text-[15px] font-bold text-slate-500">articoli</span>
              </div>
              <div className="mt-1.5 text-[15px] text-slate-600 font-medium">
                Pronti subito per shooting & set
              </div>
            </div>

            {/* Card 3: Oggetti Dati a Noleggio */}
            <div className="p-4 flex flex-col justify-between bg-white border border-emerald-100 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-slate-500 uppercase tracking-wider">
                  Oggetti a Noleggio
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Clock className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-2 text-[27px] font-black text-amber-700 leading-none">
                {stats.rentedItemsCount} <span className="text-[15px] font-normal text-slate-500">in comodato</span>
              </div>
              <div className="mt-1.5 text-[15px] text-amber-700 font-semibold">
                {stats.dueSoonCount > 0 ? `⚠️ ${stats.dueSoonCount} rientro/i in scadenza` : 'Nessuna criticità di rientro'}
              </div>
            </div>

            {/* Card 4: Entrate Noleggi Pattuite */}
            <div className="p-4 flex flex-col justify-between bg-white border border-emerald-100 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-slate-500 uppercase tracking-wider">
                  Ricavi Noleggi Attivi
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#166534] flex items-center justify-center border border-emerald-100">
                  <DollarSign className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-2 text-[27px] font-black text-[#166534] leading-none">
                € {stats.totalRentalRevenue.toLocaleString('it-IT')}
              </div>
              <div className="mt-1.5 text-[15px] text-slate-500 font-medium">
                Tariffe contratti in corso
              </div>
            </div>

          </div>

          {/* ── BARRA SWITCHER TAB PRINCIPALI (+3pt grandezza riquadri e caratteri) ── */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 p-1.5 bg-white/90 rounded-full shadow-2xs border-0">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-5 py-2.5 text-[15px] font-bold rounded-full transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#16a34a] text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Tutto l'equipaggiamento ({inventory.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rentals')}
                className={`px-5 py-2.5 text-[15px] font-bold rounded-full transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'rentals'
                    ? 'bg-[#d97706] text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>Oggetti a Noleggio</span>
                <span className={`px-2 py-0.5 rounded-full text-[13px] font-bold ${activeTab === 'rentals' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                  {stats.rentedItemsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('available')}
                className={`px-5 py-2.5 text-[15px] font-bold rounded-full transition-all cursor-pointer ${
                  activeTab === 'available'
                    ? 'bg-[#16a34a] text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Disponibili in Studio ({stats.inStudioCount})
              </button>
            </div>

            {/* Ordinamento (+3pt grandezza) */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white px-4.5 py-2.5 rounded-full border border-emerald-200 text-slate-700 text-[15px] shadow-2xs">
                <ArrowUpDown className="w-4 h-4 text-[#166534]" />
                <span className="text-slate-500 font-medium">Ordina:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-800 font-bold text-[15px] outline-none cursor-pointer"
                >
                  <option value="category">Categoria</option>
                  <option value="value_desc">Valore decrescente</option>
                  <option value="name">Nome A-Z</option>
                  <option value="rental_deadline">Scadenza Noleggio</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── FILTRI CATEGORIE: TUTTI GLI ARTICOLI RETTANGOLARE VERDE CHIARO FISSO + RIGA IN SCORRIMENTO AUTOMATICO ── */}
          <div className="flex items-center gap-2.5 mb-4 overflow-hidden relative">
            {/* 1. Riquadro FISSO: Tutti gli Articoli — 4 angoli retti a 90° (rounded-none), zero bordi bianchi, completamente riempito di verde chiaro (#16a34a) */}
            <div className="flex-shrink-0 z-20 flex items-center pr-2.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-5 py-2.5 text-[15px] font-bold whitespace-nowrap rounded-none flex items-center gap-2 transition-all cursor-pointer select-none border-0 ${
                  selectedCategory === 'all'
                    ? 'bg-[#16a34a] text-white shadow-md'
                    : 'bg-[#16a34a]/90 hover:bg-[#16a34a] text-white'
                }`}
                style={{ borderRadius: '0px' }}
              >
                <span className="text-base">📦</span>
                <span>Tutti gli Articoli</span>
                <span
                  className="text-[12.5px] px-2 py-0.5 font-bold bg-white/25 text-white"
                  style={{ borderRadius: '0px' }}
                >
                  {inventory.length}
                </span>
              </button>
            </div>

            {/* 2. Container in SCORRIMENTO AUTOMATICO per le altre categorie (pausa su hover) */}
            <div className="flex-1 overflow-hidden relative py-0.5" title="Passa il mouse per mettere in pausa lo scorrimento automatico">
              <div className="animate-inventory-marquee flex items-center gap-2">
                {/* Duplice rendering per loop continuo senza interruzioni */}
                {[...INVENTORY_CATEGORIES.filter(c => c.id !== 'all'), ...INVENTORY_CATEGORIES.filter(c => c.id !== 'all')].map((cat, idx) => {
                  const isSelected = selectedCategory === cat.id
                  const count = inventory.filter(i => i.category === cat.id).length

                  return (
                    <button
                      key={`${cat.id}-${idx}`}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4.5 py-2 text-[15px] font-bold whitespace-nowrap rounded-full flex items-center gap-2 transition-all border cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#16a34a] text-white border-[#16a34a] shadow-xs'
                          : 'bg-white/90 hover:bg-white text-slate-700 border-emerald-200/90'
                      }`}
                    >
                      <span className="text-base">{cat.emoji}</span>
                      <span>{cat.label}</span>
                      <span className={`text-[12.5px] px-2 py-0.5 rounded-full font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── BARRA DI RICERCA ── */}
          <div className="mb-4 flex items-center gap-3">
            <div
              className="relative flex items-center flex-1 px-4 py-2 transition-all duration-200 bg-white shadow-xs"
              style={{
                borderRadius: '9999px',
                border: '1.5px solid #cde9d6',
              }}
            >
              <Search className="w-4 h-4 flex-shrink-0 text-[#166534] mr-2.5 stroke-[2.5]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca fotocamera, obiettivo, matricola, seriale, cliente noleggio..."
                className="w-full bg-transparent text-slate-900 text-xs md:text-sm placeholder-slate-400 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <span className="hidden sm:inline-flex px-3 py-1 bg-white/70 border border-emerald-200 rounded-full text-xs font-bold text-[#166534] whitespace-nowrap">
              {filteredInventory.length} di {inventory.length} articoli
            </span>
          </div>

          {/* ── LISTA / CARD DEGLI ARTICOLI ── */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-600 gap-3">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Caricamento inventario DADO Studio...</span>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-12 text-center bg-white/80 border border-emerald-100 rounded-2xl text-slate-700 my-4 shadow-xs">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">
                Nessun articolo trovato
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Nessun elemento corrisponde ai filtri selezionati. Prova a reimpostare la ricerca o aggiungi un nuovo pezzo.
              </p>
              <button
                type="button"
                onClick={() => { setSearch(''); setSelectedCategory('all'); setActiveTab('all'); }}
                className="mt-4 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-xs font-bold text-[#166534] rounded-full cursor-pointer"
              >
                Reimposta tutti i filtri
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 mb-8">
              {filteredInventory.map(item => {
                const isRented = item.status === 'noleggiato'
                const deadline = isRented ? getRentalDeadlineStatus(item.rental?.endDate) : null
                const catBadge = getCategoryBadge(item.category)

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                      isRented
                        ? 'bg-amber-50/25 border-amber-200 hover:border-amber-300'
                        : 'bg-white border-emerald-100 hover:border-emerald-300'
                    }`}
                  >
                    {/* Header Card Articolo */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        {/* Categoria Badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 rounded-full">
                          <span>{catBadge.emoji}</span>
                          <span>{catBadge.label}</span>
                        </div>

                        {/* Status Badge */}
                        {isRented ? (
                          <div
                            className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-full border"
                            style={{
                              color: deadline?.color || '#b45309',
                              backgroundColor: deadline?.bg || '#fef3c7',
                              borderColor: deadline?.border || '#fcd34d'
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: deadline?.color || '#b45309' }} />
                            <span>A NOLEGGIO</span>
                          </div>
                        ) : (
                          <div className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#166534] bg-emerald-100 border border-emerald-200 rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#166534]" />
                            <span>IN STUDIO</span>
                          </div>
                        )}
                      </div>

                      {/* Nome Articolo */}
                      <h3
                        className="text-[16px] font-bold text-slate-900 tracking-tight leading-snug hover:text-emerald-700 cursor-pointer"
                        onClick={() => setShowDetailModal(item)}
                      >
                        {item.name}
                      </h3>

                      {/* Brand & Seriale */}
                      <div className="mt-1 flex items-center gap-2.5 text-xs text-slate-500">
                        {item.brand && <span className="text-slate-800 font-bold">{item.brand}</span>}
                        {item.serialNumber && (
                          <span className="text-slate-400">S/N: {item.serialNumber}</span>
                        )}
                        {item.quantity > 1 && (
                          <span className="px-2 py-0.2 bg-slate-100 text-slate-700 font-bold rounded-full">
                            Q.tà: {item.quantity}
                          </span>
                        )}
                      </div>

                      {/* Ubicazione e Note */}
                      <div className="mt-2 text-xs text-slate-600">
                        <span className="text-slate-400 font-semibold">Ubicazione: </span>
                        <span className="text-slate-700 font-medium">{item.location}</span>
                        {item.notes && (
                          <p className="mt-1 text-slate-500 text-[11.5px] italic line-clamp-2">
                            "{item.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* BOX PARTICOLARE: SE L'OGGETTO È DATO A NOLEGGIO */}
                    {isRented && item.rental && (
                      <div className="mt-3 p-3 bg-white border border-amber-200 rounded-xl text-xs space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-amber-100 pb-1.5 mb-1.5">
                          <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
                            <FileText className="w-3 h-3 text-amber-600" />
                            {item.rental.contractCode}
                          </span>
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ color: deadline.color, backgroundColor: deadline.bg }}
                          >
                            {deadline.label}
                          </span>
                        </div>

                        {/* Dettagli Persona / Azienda */}
                        <div className="space-y-1">
                          <div className="text-slate-800 font-semibold truncate">
                            {item.rental.company || 'Cliente'}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{item.rental.clientName}</span>
                          </div>
                          {(item.rental.contactPhone || item.rental.contactEmail) && (
                            <div className="flex items-center gap-3 text-slate-500 text-[11px] pt-0.5">
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
                          <div className="mt-2 pt-1.5 border-t border-amber-100 flex items-center justify-between text-[11px]">
                            <div className="text-slate-500">
                              Rientro: <strong className="text-slate-800">{item.rental.endDate || 'N/D'}</strong>
                            </div>
                            <div className="text-emerald-700 font-bold text-xs">
                              Pattuito: € {Number(item.rental.agreedPrice || 0).toLocaleString('it-IT')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer Card: Valore Stimato & Azioni */}
                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        Stima: <strong className="text-slate-800">€ {(item.estimatedValue || 0).toLocaleString('it-IT')}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {isRented ? (
                          <button
                            type="button"
                            onClick={() => handleReturnItem(item.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 rounded-full transition-transform active:scale-95 shadow-2xs cursor-pointer"
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
                            className="px-3 py-1 bg-[#d97706] hover:bg-[#b45309] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 rounded-full transition-transform active:scale-95 shadow-2xs cursor-pointer"
                            title="Assegna questo pezzo a noleggio"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Noleggia</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setShowDetailModal(item)}
                          className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-100 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#166534]" />
                <span>Nuovo Articolo in Inventario</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Equipaggiamento *</label>
                <input
                  type="text"
                  required
                  placeholder="es. Sony FX3 Cinema Line o Godox V1 Pro"
                  value={newArticle.name}
                  onChange={(e) => setNewArticle({ ...newArticle, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria *</label>
                  <select
                    value={newArticle.category}
                    onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer"
                  >
                    {INVENTORY_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand / Marca</label>
                  <input
                    type="text"
                    placeholder="es. Sony, Godox, Aputure..."
                    value={newArticle.brand}
                    onChange={(e) => setNewArticle({ ...newArticle, brand: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Numero Seriale (S/N)</label>
                  <input
                    type="text"
                    placeholder="es. SN-49210"
                    value={newArticle.serialNumber}
                    onChange={(e) => setNewArticle({ ...newArticle, serialNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantità</label>
                  <input
                    type="number"
                    min="1"
                    value={newArticle.quantity}
                    onChange={(e) => setNewArticle({ ...newArticle, quantity: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valore Stimato (€)</label>
                  <input
                    type="number"
                    placeholder="es. 1200"
                    value={newArticle.estimatedValue}
                    onChange={(e) => setNewArticle({ ...newArticle, estimatedValue: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-emerald-700 font-bold rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ubicazione in Studio</label>
                <input
                  type="text"
                  placeholder="es. Studio / Armadio A1 o Borsa Rig 1"
                  value={newArticle.location}
                  onChange={(e) => setNewArticle({ ...newArticle, location: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Note & Accessori Inclusi</label>
                <textarea
                  rows="2"
                  placeholder="Note sulle condizioni, compatibilità, accessori a corredo..."
                  value={newArticle.notes}
                  onChange={(e) => setNewArticle({ ...newArticle, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full cursor-pointer transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#166534] hover:bg-[#14532d] text-white font-bold uppercase tracking-wider rounded-full shadow-xs cursor-pointer transition-all active:scale-95"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-100 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#d97706]" />
                <span>Assegna Articolo a Noleggio / Comodato</span>
              </h2>
              <button
                type="button"
                onClick={() => { setShowRentModal(false); setSelectedItemForRent(null); }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignRental} className="space-y-3.5 text-xs">
              {/* Selezione Articolo */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Articolo da Noleggiare *</label>
                <select
                  required
                  value={rentForm.itemId || selectedItemForRent?.id || ''}
                  onChange={(e) => setRentForm({ ...rentForm, itemId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer"
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
                  <label className="block font-bold text-slate-700 mb-1">Azienda / Studio Cliente *</label>
                  <input
                    type="text"
                    required
                    list="companies-list"
                    placeholder="es. Fashion Brand Milano"
                    value={rentForm.company}
                    onChange={(e) => setRentForm({ ...rentForm, company: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                  <datalist id="companies-list">
                    {companies.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Persona Referente *</label>
                  <input
                    type="text"
                    required
                    placeholder="es. Matteo Colombo"
                    value={rentForm.clientName}
                    onChange={(e) => setRentForm({ ...rentForm, clientName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>

              {/* Contatti */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefono Referente</label>
                  <input
                    type="tel"
                    placeholder="+39 348 1234567"
                    value={rentForm.contactPhone}
                    onChange={(e) => setRentForm({ ...rentForm, contactPhone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Referente</label>
                  <input
                    type="email"
                    placeholder="m.colombo@azienda.it"
                    value={rentForm.contactEmail}
                    onChange={(e) => setRentForm({ ...rentForm, contactEmail: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>

              {/* Date Noleggio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data Inizio Noleggio</label>
                  <input
                    type="date"
                    required
                    value={rentForm.startDate}
                    onChange={(e) => setRentForm({ ...rentForm, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scadenza Noleggio Contratto *</label>
                  <input
                    type="date"
                    required
                    value={rentForm.endDate}
                    onChange={(e) => setRentForm({ ...rentForm, endDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-amber-300 text-amber-900 font-bold rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>

              {/* Prezzo Pattuito e Codice Contratto */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prezzo Pattuito (€) *</label>
                  <input
                    type="number"
                    required
                    placeholder="es. 250"
                    value={rentForm.agreedPrice}
                    onChange={(e) => setRentForm({ ...rentForm, agreedPrice: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-emerald-700 font-bold rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo Tariffa</label>
                  <select
                    value={rentForm.pricingType}
                    onChange={(e) => setRentForm({ ...rentForm, pricingType: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer"
                  >
                    <option value="Totale forfait">Totale forfait</option>
                    <option value="€ / Giorno">€ / Giorno</option>
                    <option value="Tariffa Weekend">Tariffa Weekend</option>
                    <option value="Tariffa Settimanale">Tariffa Settimanale</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Codice Contratto</label>
                  <input
                    type="text"
                    value={rentForm.contractCode}
                    onChange={(e) => setRentForm({ ...rentForm, contractCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Note Contratto / Condizioni consegna</label>
                <textarea
                  rows="2"
                  placeholder="Accessori inclusi nel noleggio, cavi, cauzione concordata..."
                  value={rentForm.notes}
                  onChange={(e) => setRentForm({ ...rentForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setShowRentModal(false); setSelectedItemForRent(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full cursor-pointer transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d97706] hover:bg-[#b45309] text-white font-bold uppercase tracking-wider rounded-full shadow-xs cursor-pointer transition-all active:scale-95"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-100 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar text-slate-800">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-full font-semibold">
                    {getCategoryBadge(showDetailModal.category).label}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    showDetailModal.status === 'noleggiato'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-[#166534] border border-emerald-200'
                  }`}>
                    {showDetailModal.status === 'noleggiato' ? 'A Noleggio' : 'In Studio (Disponibile)'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"Switzer", sans-serif' }}>
                  {showDetailModal.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">BRAND</span>
                  <span className="text-slate-800 font-bold text-sm">{showDetailModal.brand || 'N/D'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">SERIAL NUMBER</span>
                  <span className="text-slate-700 font-medium">{showDetailModal.serialNumber || 'N/D'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">VALORE STIMATO</span>
                  <span className="text-emerald-700 font-bold text-sm">€ {(showDetailModal.estimatedValue || 0).toLocaleString('it-IT')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">UBICAZIONE</span>
                  <span className="text-slate-700 font-medium">{showDetailModal.location || 'Studio'}</span>
                </div>
              </div>

              {/* Se a Noleggio, Scheda Completa Contratto */}
              {showDetailModal.status === 'noleggiato' && showDetailModal.rental && (
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 mb-3">
                    <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5 tracking-wider">
                      <FileText className="w-4 h-4 text-amber-600" />
                      CONTRATTO DI NOLEGGIO IN CORSO
                    </span>
                    <span className="text-xs text-slate-500">
                      Codice: <strong className="text-slate-800">{showDetailModal.rental.contractCode}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <span className="text-slate-500 block">Azienda / Studio</span>
                      <span className="text-slate-900 font-bold text-sm">{showDetailModal.rental.company}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Referente</span>
                      <span className="text-slate-800 text-sm font-medium">{showDetailModal.rental.clientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Periodo Noleggio</span>
                      <span className="text-slate-800">
                        {showDetailModal.rental.startDate} &rarr; <strong className="text-amber-800">{showDetailModal.rental.endDate}</strong>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Prezzo Pattuito</span>
                      <span className="text-emerald-700 font-bold text-sm">
                        € {Number(showDetailModal.rental.agreedPrice || 0).toLocaleString('it-IT')} ({showDetailModal.rental.pricingType})
                      </span>
                    </div>
                  </div>

                  {showDetailModal.rental.notes && (
                    <div className="text-slate-600 italic bg-white p-2.5 rounded-xl border border-amber-100 text-[11.5px]">
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
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider rounded-full flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Registra Rientro in Studio</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Storico Noleggi Passati */}
              <div>
                <h4 className="text-slate-500 font-bold mb-2 uppercase tracking-wider text-[11px]">
                  Storico Noleggi Precedenti ({showDetailModal.rentalHistory?.length || 0})
                </h4>
                {showDetailModal.rentalHistory && showDetailModal.rentalHistory.length > 0 ? (
                  <div className="space-y-2">
                    {showDetailModal.rentalHistory.map((h, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px]">
                        <div>
                          <strong className="text-slate-800">{h.company}</strong> ({h.clientName})
                          <div className="text-slate-400 text-[10px]">
                            Rientrato il: {new Date(h.returnedAt).toLocaleDateString('it-IT')}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-700 font-bold">€ {h.agreedPrice}</span>
                          <span className="text-slate-400 block text-[10px]">{h.contractCode}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">Nessun noleggio precedente archiviato per questo pezzo.</p>
                )}
              </div>

              {/* Pulsante Eliminazione */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteItem(showDetailModal.id)
                    setShowDetailModal(null)
                  }}
                  className="text-rose-600 hover:text-rose-700 font-semibold text-[11px] cursor-pointer"
                >
                  Elimina questo articolo dall'inventario
                </button>

                <button
                  type="button"
                  onClick={() => setShowDetailModal(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full cursor-pointer"
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
