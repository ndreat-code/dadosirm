import { useState, useEffect } from 'react'
import {
  Users as UsersIcon,
  UserPlus,
  ShieldCheck,
  Shield,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Check,
  Building2,
  CalendarDays,
  Boxes,
  ListTodo,
  TrendingUp,
  Cpu,
  Lock,
  Mail,
  User
} from 'lucide-react'

// Moduli e permessi configurabili nel CRM
const PERMISSION_MODULES = [
  { id: 'dashboard',   label: 'Dashboard & Finanza',     desc: 'Fatturato, margini, cassa e KPI strategici',      icon: TrendingUp },
  { id: 'companies',   label: 'Aziende & Contratti',     desc: 'Schede clienti, contratti, acconti e saldi',       icon: Building2 },
  { id: 'activities',  label: 'Attività & Task',         desc: 'To-do, priorità e scadenze commerciali',           icon: ListTodo },
  { id: 'calendar',    label: 'Calendario Produzioni',   desc: 'Pianificazione set, shooting, date e orari',      icon: CalendarDays },
  { id: 'inventory',   label: 'Inventario & Noleggi',    desc: 'Disponibilità camere, lenti, luci e droni',        icon: Boxes },
  { id: 'leads',       label: 'Pipeline & Opportunità',  desc: 'Trattative in corso, preventivi e BANT',          icon: Shield },
  { id: 'ai',          label: 'AI Intelligence Assistant', desc: 'Interrogazione dati incrociati e Ask AI',        icon: Cpu },
]

// Utenti predefiniti
const DEFAULT_USERS = [
  {
    id: 'usr-1',
    name: 'Andrea T.',
    email: 'andrea@dadocreativestudio.com',
    role: 'Executive Producer / Admin',
    badgeRole: 'Super Admin',
    status: 'active',
    accessType: 'admin',
    permissions: {
      dashboard: true,
      companies: true,
      activities: true,
      calendar: true,
      inventory: true,
      leads: true,
      ai: true,
    },
    lastLogin: 'Oggi alle 19:45',
  },
  {
    id: 'usr-2',
    name: 'Matteo V.',
    email: 'm.valenti@dadocreativestudio.com',
    role: 'Senior Producer & Regia',
    badgeRole: 'Producer',
    status: 'active',
    accessType: 'custom',
    permissions: {
      dashboard: false,
      companies: true,
      activities: true,
      calendar: true,
      inventory: true,
      leads: false,
      ai: true,
    },
    lastLogin: 'Oggi alle 16:30',
  },
  {
    id: 'usr-3',
    name: 'Sofia R.',
    email: 's.rossi@dadocreativestudio.com',
    role: 'Account & Business Developer',
    badgeRole: 'Commerciale',
    status: 'active',
    accessType: 'custom',
    permissions: {
      dashboard: true,
      companies: true,
      activities: true,
      calendar: true,
      inventory: false,
      leads: true,
      ai: true,
    },
    lastLogin: 'Ieri alle 18:10',
  },
  {
    id: 'usr-4',
    name: 'Elena B.',
    email: 'e.bossi@dadocreativestudio.com',
    role: 'Amministrazione & Controllo di Gestione',
    badgeRole: 'Finance',
    status: 'active',
    accessType: 'custom',
    permissions: {
      dashboard: true,
      companies: true,
      activities: false,
      calendar: false,
      inventory: false,
      leads: false,
      ai: false,
    },
    lastLogin: '25 Set 2026',
  },
  {
    id: 'usr-5',
    name: 'Luca M.',
    email: 'l.marchetti@collaboratori-dado.it',
    role: 'Operatore Set & Drone Pilot (Esterno)',
    badgeRole: 'Operatore Tecnico',
    status: 'active',
    accessType: 'restricted',
    permissions: {
      dashboard: false,
      companies: false,
      activities: true,
      calendar: true,
      inventory: true,
      leads: false,
      ai: false,
    },
    lastLogin: '27 Set 2026',
  }
]

export default function Users() {
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('dado_crm_users_v1')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Errore lettura users da storage:', e)
    }
    return DEFAULT_USERS
  })

  const [modalUser, setModalUser] = useState(null)
  const [isNewUser, setIsNewUser] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  // Salva ogni modifica in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dado_crm_users_v1', JSON.stringify(users))
    } catch (e) {
      console.warn('Errore salvataggio users:', e)
    }
  }, [users])

  function handleOpenNewUser() {
    setIsNewUser(true)
    setModalUser({
      id: 'usr-' + Date.now(),
      name: '',
      email: '',
      role: 'Collaboratore',
      badgeRole: 'Collaboratore',
      status: 'active',
      accessType: 'custom',
      permissions: {
        dashboard: false,
        companies: true,
        activities: true,
        calendar: true,
        inventory: false,
        leads: false,
        ai: false,
      },
      lastLogin: 'Mai effettuato',
    })
  }

  function handleEditUser(u) {
    setIsNewUser(false)
    setModalUser({ ...u, permissions: { ...u.permissions } })
  }

  function handleSaveModal() {
    if (!modalUser.name.trim() || !modalUser.email.trim()) {
      alert('Inserisci almeno Nome e Email dell’utente.')
      return
    }

    if (isNewUser) {
      setUsers((prev) => [modalUser, ...prev])
    } else {
      setUsers((prev) => prev.map((u) => (u.id === modalUser.id ? modalUser : u)))
    }
    setModalUser(null)
  }

  function handleDeleteUser(id) {
    if (confirm('Sei sicuro di voler rimuovere questo utente? Non potrà più accedere al CRM.')) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
    }
  }

  function handleToggleStatus(id) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active'
          return { ...u, status: nextStatus }
        }
        return u
      })
    )
  }

  function togglePermission(moduleId) {
    setModalUser((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: !prev.permissions[moduleId],
      },
    }))
  }

  function toggleAllPermissions(value) {
    const nextPerms = {}
    PERMISSION_MODULES.forEach((m) => {
      nextPerms[m.id] = value
    })
    setModalUser((prev) => ({ ...prev, permissions: nextPerms }))
  }

  const filteredUsers = users.filter((u) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'active') return u.status === 'active'
    if (activeFilter === 'admin') return u.accessType === 'admin'
    return true
  })

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col flex-1 relative font-sans text-slate-800">
      
      {/* ── CANVAS BIANCO ("FOGLIO") DI CONTENUTO ── */}
      <div className="h-full flex-1 bg-white rounded-tl-[48px] rounded-bl-[48px] flex flex-col justify-start relative min-w-0 overflow-y-auto p-8 sm:p-10">

        {/* ── HEADER SEZIONE UTENTI ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                <UsersIcon className="w-5 h-5 text-[#007a50]" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
                Gestione Utenti & Permessi
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-sans">
              Configura gli account del team e seleziona in modo granulare a quali sezioni del CRM dare accesso.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenNewUser}
              className="px-4 py-2.5 rounded-xl font-mono text-xs font-black bg-[#007a50] hover:bg-[#008f5d] text-white flex items-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Nuovo Utente</span>
            </button>
          </div>
        </div>

        {/* ── STATISTICHE RAPIDE ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Totale Utenti
            </span>
            <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
              {users.length}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 block">
              Attivi Oggi
            </span>
            <span className="text-2xl font-black font-mono text-emerald-600 mt-1 block">
              {users.filter((u) => u.status === 'active').length}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-600 block">
              Amministratori
            </span>
            <span className="text-2xl font-black font-mono text-sky-600 mt-1 block">
              {users.filter((u) => u.accessType === 'admin').length}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 block">
              Accesso Ristretto
            </span>
            <span className="text-2xl font-black font-mono text-amber-600 mt-1 block">
              {users.filter((u) => u.accessType !== 'admin').length}
            </span>
          </div>
        </div>

        {/* ── TABELLA UTENTI & PERMESSI ── */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/90 text-slate-600 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Utente</th>
                  <th className="py-3 px-4">Ruolo</th>
                  <th className="py-3 px-4">Sezioni Accessibili</th>
                  <th className="py-3 px-4 text-center">Stato</th>
                  <th className="py-3 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredUsers.map((u) => {
                  const allowedCount = Object.values(u.permissions || {}).filter(Boolean).length
                  const isSuperAdmin = u.accessType === 'admin'

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Colonna 1: Avatar e Nome */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">
                              {u.name}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Colonna 2: Ruolo */}
                      <td className="py-3 px-4">
                        <div className="text-xs font-semibold text-slate-800">
                          {u.role}
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {u.badgeRole}
                        </span>
                      </td>

                      {/* Colonna 3: Sezioni con Badge */}
                      <td className="py-3 px-4">
                        {isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Accesso Totale (Tutti i Moduli)</span>
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {PERMISSION_MODULES.map((m) => {
                              const hasAccess = u.permissions?.[m.id]
                              if (!hasAccess) return null
                              const IconComponent = m.icon
                              return (
                                <span
                                  key={m.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200"
                                  title={m.desc}
                                >
                                  <IconComponent className="w-3 h-3 text-[#007a50]" />
                                  <span>{m.label.split(' ')[0]}</span>
                                </span>
                              )
                            })}
                            {allowedCount === 0 && (
                              <span className="text-xs text-slate-400 italic">
                                Nessun modulo assegnato
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Colonna 4: Stato */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold cursor-pointer transition-all ${
                            u.status === 'active'
                              ? 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                          title="Clicca per cambiare stato"
                        >
                          {u.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Attivo</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Sospeso</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Colonna 5: Azioni */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditUser(u)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                            title="Modifica Utente & Permessi"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {u.accessType !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                              title="Elimina Utente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── MODALE MODIFICA / CREAZIONE UTENTE & SCELTA PERMESSI ── */}
      {modalUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-7 max-w-xl w-full text-left shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            
            {/* Header Modale */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <span className="text-[11px] font-mono text-[#007a50] uppercase tracking-wider font-bold">
                  {isNewUser ? 'Aggiunta Collaboratore' : 'Configurazione Accessi'}
                </span>
                <h3 className="text-xl font-black text-slate-900 font-mono mt-0.5">
                  {isNewUser ? 'Nuovo Utente CRM' : `Permessi per ${modalUser.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Campi Anagrafici */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome & Cognome:
                </label>
                <input
                  type="text"
                  value={modalUser.name}
                  onChange={(e) => setModalUser({ ...modalUser, name: e.target.value })}
                  placeholder="Es. Marco Bianchi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:border-[#007a50]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Aziendale:
                </label>
                <input
                  type="email"
                  value={modalUser.email}
                  onChange={(e) => setModalUser({ ...modalUser, email: e.target.value })}
                  placeholder="nome@azienda.it"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:border-[#007a50]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ruolo / Mansione:
                </label>
                <input
                  type="text"
                  value={modalUser.role}
                  onChange={(e) => setModalUser({ ...modalUser, role: e.target.value })}
                  placeholder="Es. Responsabile Set / Fonico"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:border-[#007a50]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tipo Account:
                </label>
                <select
                  value={modalUser.accessType}
                  onChange={(e) => {
                    const nextType = e.target.value
                    if (nextType === 'admin') {
                      toggleAllPermissions(true)
                    }
                    setModalUser({ ...modalUser, accessType: nextType })
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-sans bg-white focus:outline-none focus:border-[#007a50]"
                >
                  <option value="custom">Personalizzato (Scelta moduli)</option>
                  <option value="admin">Amministratore (Tutto abilitato)</option>
                  <option value="restricted">Collaboratore Ristretto</option>
                </select>
              </div>
            </div>

            {/* Selezione Permessi Granulari */}
            <div className="mb-6 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#007a50]" />
                  <span>Sezioni Accessibili nel CRM:</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAllPermissions(true)}
                    className="text-[11px] font-mono font-bold text-[#007a50] hover:underline"
                  >
                    Seleziona tutti
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => toggleAllPermissions(false)}
                    className="text-[11px] font-mono font-bold text-slate-400 hover:underline"
                  >
                    Deseleziona tutti
                  </button>
                </div>
              </div>

              {/* Checkbox Card per ogni modulo */}
              <div className="space-y-2">
                {PERMISSION_MODULES.map((m) => {
                  const isChecked = Boolean(modalUser.permissions?.[m.id])
                  const IconComp = m.icon
                  return (
                    <div
                      key={m.id}
                      onClick={() => togglePermission(m.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#007a50] bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isChecked
                              ? 'bg-[#007a50] text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {m.label}
                          </div>
                          <div className="text-[11px] text-slate-500 leading-snug">
                            {m.desc}
                          </div>
                        </div>
                      </div>

                      {/* Checkbox Indicator */}
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-[#007a50] border-[#007a50] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer Modale */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalUser(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-mono font-bold text-slate-700 transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 bg-[#007a50] hover:bg-[#008f5d] text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
              >
                Salva e Applica Accessi
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
