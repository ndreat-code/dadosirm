import { useState } from 'react'
import {
  Users as UsersIcon,
  UserPlus,
  ShieldCheck,
  Shield,
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
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Moduli e permessi configurabili nel CRM
const PERMISSION_MODULES = [
  { id: 'dashboard',   label: 'Dashboard & Finanza',     desc: 'Fatturato, margini, cassa e KPI strategici',        icon: TrendingUp },
  { id: 'companies',   label: 'Aziende & Contratti',     desc: 'Schede clienti, contratti, acconti e saldi',         icon: Building2 },
  { id: 'activities',  label: 'Attività & Task',         desc: 'To-do, priorità e scadenze commerciali',             icon: ListTodo },
  { id: 'calendar',    label: 'Calendario Produzioni',   desc: 'Pianificazione set, shooting, date e orari',        icon: CalendarDays },
  { id: 'inventory',   label: 'Inventario & Noleggi',    desc: 'Disponibilità camere, lenti, luci e droni',          icon: Boxes },
  { id: 'leads',       label: 'Pipeline & Opportunità',  desc: 'Trattative in corso, preventivi e BANT',            icon: Shield },
  { id: 'ai',          label: 'AI Intelligence Assistant', desc: 'Assistente intelligente e automazioni',            icon: Cpu },
  { id: 'devNotes',    label: 'Note Sviluppatore',       desc: 'Invio note allo sviluppatore (n.drea.t@gmail.com)',  icon: Mail },
  { id: 'askOpenAi',   label: 'Ask OpenAI CRM',          desc: 'Interrogazione diretta database con OpenAI',         icon: Cpu },
]

export default function Users() {
  const {
    users,
    currentUser,
    activeUserId,
    isAdmin,
    switchUser,
    addUser,
    updateUser,
    deleteUser,
  } = useAuth()

  const [modalUser, setModalUser] = useState(null)
  const [isNewUser, setIsNewUser] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

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
        companies: false,
        activities: true,
        calendar: true,
        inventory: false,
        leads: false,
        ai: false,
        devNotes: false,
        askOpenAi: false,
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
      addUser(modalUser)
    } else {
      updateUser(modalUser)
    }
    setModalUser(null)
  }

  function handleDeleteUser(id) {
    if (confirm('Sei sicuro di voler rimuovere questo utente? Non potrà più accedere al CRM.')) {
      deleteUser(id)
    }
  }

  function handleToggleStatus(u) {
    const nextStatus = u.status === 'active' ? 'suspended' : 'active'
    updateUser({ ...u, status: nextStatus })
  }

  function togglePermission(moduleId) {
    setModalUser((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: !prev.permissions?.[moduleId],
      },
    }))
  }

  function toggleAllPermissions(enableAll) {
    const updated = {}
    PERMISSION_MODULES.forEach((m) => {
      updated[m.id] = enableAll
    })
    setModalUser((prev) => ({
      ...prev,
      permissions: updated,
    }))
  }

  const filteredUsers = users.filter((u) => {
    if (activeFilter === 'active') return u.status === 'active'
    if (activeFilter === 'admin') return u.accessType === 'admin' || u.badgeRole === 'Amministratore'
    if (activeFilter === 'restricted') return u.accessType !== 'admin' && u.badgeRole !== 'Amministratore'
    return true
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── BANNER PROFILO ATTIVO IN USO ── */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all ${
            isAdmin
              ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700'
              : 'bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-white border-amber-600/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                isAdmin ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              {isAdmin ? '👑' : '👤'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                  Profilo Attivo nel CRM:
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isAdmin ? 'bg-cyan-400 text-black' : 'bg-amber-400 text-black'
                  }`}
                >
                  {currentUser.badgeRole || currentUser.role}
                </span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-0.5">
                {currentUser.name} <span className="text-xs text-gray-400 font-sans font-normal">({currentUser.email})</span>
              </div>
              {!isAdmin && (
                <p className="text-xs text-amber-300/90 font-sans mt-0.5">
                  ⚠️ Modalità Dipendente: Accesso consentito solo ad <strong>Attività</strong> e <strong>Calendario</strong>. Note Sviluppatore e Ask OpenAI sono disabilitate.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {currentUser.id !== 'usr-admin' && (
              <button
                type="button"
                onClick={() => switchUser('usr-admin')}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>👑 Torna ad Admin</span>
              </button>
            )}
            {currentUser.id !== 'usr-dipendente' && (
              <button
                type="button"
                onClick={() => switchUser('usr-dipendente')}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>👤 Simula Dipendente</span>
              </button>
            )}
          </div>
        </div>

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
              Configura i profili del team, scegli selettivamente a quali moduli dare accesso e controlla le abilitazioni per Note Sviluppatore e Ask OpenAI.
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Totale Utenti
            </span>
            <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
              {users.length}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 block">
              Attivi
            </span>
            <span className="text-2xl font-black font-mono text-emerald-600 mt-1 block">
              {users.filter((u) => u.status === 'active').length}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-600 block">
              Amministratori
            </span>
            <span className="text-2xl font-black font-mono text-sky-600 mt-1 block">
              {users.filter((u) => u.accessType === 'admin' || u.badgeRole === 'Amministratore').length}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 block">
              Accesso Ristretto
            </span>
            <span className="text-2xl font-black font-mono text-amber-600 mt-1 block">
              {users.filter((u) => u.accessType !== 'admin' && u.badgeRole !== 'Amministratore').length}
            </span>
          </div>
        </div>

        {/* ── FILTRI ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tutti ({users.length})
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Attivi ({users.filter((u) => u.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveFilter('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeFilter === 'admin'
                ? 'bg-sky-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Amministratori ({users.filter((u) => u.accessType === 'admin' || u.badgeRole === 'Amministratore').length})
          </button>
          <button
            onClick={() => setActiveFilter('restricted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeFilter === 'restricted'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Dipendenti & Ristretti ({users.filter((u) => u.accessType !== 'admin' && u.badgeRole !== 'Amministratore').length})
          </button>
        </div>

        {/* ── TABELLA UTENTI & PERMESSI ── */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/90 text-slate-600 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Utente</th>
                  <th className="py-3 px-4">Ruolo</th>
                  <th className="py-3 px-4">Sezioni & Funzioni</th>
                  <th className="py-3 px-4 text-center">Stato</th>
                  <th className="py-3 px-4 text-center">Profilo in Uso</th>
                  <th className="py-3 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredUsers.map((u) => {
                  const isSuperAdmin = u.accessType === 'admin' || u.badgeRole === 'Amministratore'
                  const isCurrentActive = u.id === activeUserId

                  return (
                    <tr
                      key={u.id}
                      className={`transition-colors ${
                        isCurrentActive ? 'bg-cyan-50/40 hover:bg-cyan-50/60' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Colonna 1: Avatar e Nome */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                              isSuperAdmin ? 'bg-slate-900 border border-cyan-400' : 'bg-slate-700'
                            }`}
                          >
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrentActive && (
                                <span className="text-[10px] font-mono text-cyan-700 bg-cyan-100 px-1.5 py-0.2 rounded font-bold">
                                  IN USO
                                </span>
                              )}
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
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            isSuperAdmin
                              ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {u.badgeRole || u.role}
                        </span>
                      </td>

                      {/* Colonna 3: Sezioni con Badge */}
                      <td className="py-3 px-4">
                        {isSuperAdmin ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 w-fit">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Accesso Totale (Tutti i Moduli)</span>
                            </span>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-800">
                              <span>✓ Note Sviluppatore</span>
                              <span>✓ Ask OpenAI</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1.5 max-w-md">
                              {PERMISSION_MODULES.filter(m => m.id !== 'devNotes' && m.id !== 'askOpenAi').map((m) => {
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
                            </div>
                            {/* Stato Funzioni Speciali */}
                            <div className="flex items-center gap-2 text-[10.5px] font-mono">
                              <span
                                className={`px-1.5 py-0.5 rounded ${
                                  u.permissions?.devNotes
                                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {u.permissions?.devNotes ? '✓ Note Sviluppatore' : '✕ Note Sviluppatore (Bloccato)'}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded ${
                                  u.permissions?.askOpenAi
                                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {u.permissions?.askOpenAi ? '✓ Ask OpenAI' : '✕ Ask OpenAI (Bloccato)'}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Colonna 4: Stato */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
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

                      {/* Colonna 5: Profilo in Uso / Switch */}
                      <td className="py-3 px-4 text-center">
                        {isCurrentActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-500 text-slate-950 shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>In Uso</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => switchUser(u.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer"
                            title="Attiva questo account per navigare nel CRM"
                          >
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span>Attiva</span>
                          </button>
                        )}
                      </td>

                      {/* Colonna 6: Azioni */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditUser(u)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Modifica Utente & Permessi"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {!isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
                  placeholder="Es. Operatore Set / Regia"
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
                  <option value="restricted">Dipendente con Funzioni Limitate</option>
                </select>
              </div>
            </div>

            {/* Selezione Permessi Granulari */}
            <div className="mb-6 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#007a50]" />
                  <span>Sezioni & Funzionalità Abilitate:</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAllPermissions(true)}
                    className="text-[11px] font-mono font-bold text-[#007a50] hover:underline cursor-pointer"
                  >
                    Seleziona tutti
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => toggleAllPermissions(false)}
                    className="text-[11px] font-mono font-bold text-slate-400 hover:underline cursor-pointer"
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
                  const isRestrictedFeature = m.id === 'devNotes' || m.id === 'askOpenAi'

                  return (
                    <div
                      key={m.id}
                      onClick={() => togglePermission(m.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? isRestrictedFeature
                            ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                            : 'border-[#007a50] bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isChecked
                              ? isRestrictedFeature
                                ? 'bg-cyan-600 text-white'
                                : 'bg-[#007a50] text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                            <span>{m.label}</span>
                            {isRestrictedFeature && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                Speciale
                              </span>
                            )}
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
                            ? isRestrictedFeature
                              ? 'bg-cyan-600 border-cyan-600 text-white'
                              : 'bg-[#007a50] border-[#007a50] text-white'
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
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-mono font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 bg-[#007a50] hover:bg-[#008f5d] text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
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
