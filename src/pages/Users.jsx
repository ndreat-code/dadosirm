import { useState } from 'react'
import {
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
  ListTodo,
  TrendingUp,
  Cpu,
  Lock,
  Mail,
  Dice5,
  KeyRound,
  LogOut,
} from 'lucide-react'
import Backpack3DIcon from '../components/Backpack3DIcon'
import { useAuth } from '../context/AuthContext'
import { generateRandomPassword } from '../utils/credentialGenerator'
import { formatPasswordHashPreview, hashPasswordSync } from '../utils/passwordCrypto'
import { DualBackupTriggerButton, DualBackupModal } from '../components/DualBackupModal'

// Moduli e permessi configurabili nel CRM
const PERMISSION_MODULES = [
  { id: 'dashboard',   label: 'Dashboard & Finanza',     desc: 'Fatturato, margini, cassa e KPI strategici',        icon: TrendingUp },
  { id: 'companies',   label: 'Aziende & Contratti',     desc: 'Schede clienti, contratti, acconti e saldi',         icon: Building2 },
  { id: 'activities',  label: 'Attività & Task',         desc: 'To-do, priorità e scadenze commerciali',             icon: ListTodo },
  { id: 'calendar',    label: 'Calendario Produzioni',   desc: 'Pianificazione set, shooting, date e orari',        icon: CalendarDays },
  { id: 'inventory',   label: 'Inventario & Noleggi',    desc: 'Disponibilità camere, lenti, luci e droni',          icon: Backpack3DIcon },
  { id: 'leads',       label: 'Pipeline & Opportunità',  desc: 'Trattative in corso, preventivi e BANT',            icon: Shield },
  { id: 'ai',          label: 'AI Intelligence Assistant', desc: 'Assistente intelligente e automazioni',            icon: Cpu },
  { id: 'devNotes',    label: 'Note Sviluppatore',       desc: 'Invio note allo sviluppatore',                       icon: Mail },
  { id: 'askOpenAi',   label: 'Ask OpenAI CRM',          desc: 'Interrogazione diretta database con OpenAI',         icon: Cpu },
]

export default function Users() {
  const {
    users,
    currentUser,
    activeUserId,
    isAdmin,
    addUser,
    updateUser,
    deleteUser,
    logout,
  } = useAuth()

  const [modalUser, setModalUser] = useState(null)
  const [isNewUser, setIsNewUser] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [isPasswordRevealed, setIsPasswordRevealed] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)

  function handleOpenNewUser() {
    setIsNewUser(true)
    setIsPasswordRevealed(true)
    const { password: rndPwd } = generateRandomPassword(12)
    setModalUser({
      id: 'usr-' + Date.now(),
      name: '',
      email: '',
      newPassword: rndPwd,
      role: 'Director',
      badgeRole: 'Director',
      status: 'active',
      accessType: 'custom',
      permissions: {
        dashboard: true,
        companies: true,
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
    setIsPasswordRevealed(false)
    // Zero password in chiaro: la password attuale non è mai leggibile, newPassword serve solo per eventuale cambio/reset
    const { password: _discarded, ...safeUser } = u
    setModalUser({ ...safeUser, newPassword: '', permissions: { ...u.permissions } })
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
    <div
      className="h-full min-h-dvh md:min-h-0 flex flex-col flex-1 relative overflow-hidden"
      style={{
        backgroundColor: 'transparent',
        fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* ── BANDA SUPERIORE: Titolo "Gestione Utenti & Permessi" immerso nella banda scura (#2d3139), senza icona, più spessa di 0,3 cm rispetto alla dashboard ── */}
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
              Gestione Utenti & Permessi
            </h1>
          </div>
        </div>
      </div>

      {/* ── CANVAS CON ANGOLO IN ALTO A SINISTRA RETTO A FILO CON LA BANDA SUPERIORE ── */}
      <div
        className="h-full flex-1 bg-[#f8fafc] rounded-tl-none rounded-bl-[48px] rounded-tr-none rounded-br-none flex flex-col justify-between relative min-w-0 overflow-hidden text-slate-800"
        style={{
          boxShadow: '-6px 0 24px rgba(0, 0, 0, 0.4)',
          borderLeft: '1.5px solid rgba(255, 255, 255, 0.9)',
          borderTop: 'none',
          borderBottom: '1.5px solid rgba(255, 255, 255, 0.75)',
          borderTopLeftRadius: '0px',
          borderBottomLeftRadius: '48px',
          borderTopRightRadius: '0px',
          borderBottomRightRadius: '0px',
        }}
      >
        <div className="flex-1 min-h-0 px-5 md:px-7 py-3 flex flex-col justify-between gap-2.5 overflow-hidden">
          <div className="w-full flex-1 min-h-0 flex flex-col justify-between gap-2.5">

            {/* ── STATISTICHE RAPIDE ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-xs flex items-center justify-between">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600">
                  Totale Utenti
                </span>
                <span className="text-2xl sm:text-3xl font-black tabular-nums text-slate-900">
                  {users.length}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-xs flex items-center justify-between">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-600">
                  Attivi
                </span>
                <span className="text-2xl sm:text-3xl font-black tabular-nums text-emerald-600">
                  {users.filter((u) => u.status === 'active').length}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-xs flex items-center justify-between">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-600">
                  Amministratori
                </span>
                <span className="text-2xl sm:text-3xl font-black tabular-nums text-sky-600">
                  {users.filter((u) => u.accessType === 'admin' || u.badgeRole === 'Amministratore').length}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-xs flex items-center justify-between">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-600">
                  Accesso Ristretto
                </span>
                <span className="text-2xl sm:text-3xl font-black tabular-nums text-amber-600">
                  {users.filter((u) => u.accessType !== 'admin' && u.badgeRole !== 'Amministratore').length}
                </span>
              </div>
            </div>

            {/* ── FILTRI & PULSANTE NUOVO UTENTE ── */}
            <div className="flex items-center justify-between gap-2.5 flex-wrap flex-shrink-0">
              <div className="flex items-center gap-2.5 overflow-x-auto">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Tutti ({users.length})
                </button>
                <button
                  onClick={() => setActiveFilter('active')}
                  className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    activeFilter === 'active'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Attivi ({users.filter((u) => u.status === 'active').length})
                </button>
                <button
                  onClick={() => setActiveFilter('admin')}
                  className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    activeFilter === 'admin'
                      ? 'bg-sky-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Amministratori ({users.filter((u) => u.accessType === 'admin' || u.badgeRole === 'Amministratore').length})
                </button>
                <button
                  onClick={() => setActiveFilter('restricted')}
                  className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    activeFilter === 'restricted'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Dipendenti & Ristretti ({users.filter((u) => u.accessType !== 'admin' && u.badgeRole !== 'Amministratore').length})
                </button>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <DualBackupTriggerButton
                  compact={true}
                  onClick={() => setShowBackupModal(true)}
                />
                <button
                  onClick={handleOpenNewUser}
                  className="px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-[#007a50] hover:bg-[#008f5d] text-white flex items-center gap-1.5 shadow-xs transition-all transform active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Nuovo Utente</span>
                </button>
              </div>
            </div>

            {/* ── TABELLA UTENTI & PERMESSI ── */}
            <div className="flex-1 min-h-0 border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white flex flex-col">
              <div className="overflow-x-auto flex-1 min-h-0">
                <table className="w-full text-left">
                  <thead className="bg-slate-100/90 text-slate-700 text-xs sm:text-sm font-extrabold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Utente</th>
                      <th className="py-2.5 px-4">Ruolo</th>
                      <th className="py-2.5 px-4">Sezioni & Funzioni</th>
                      <th className="py-2.5 px-4 text-center">Stato</th>
                      <th className="py-2.5 px-4 text-right">Azioni</th>
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
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-11 h-11 rounded-full text-white font-black text-sm flex items-center justify-center flex-shrink-0 ${
                                  isSuperAdmin ? 'bg-slate-900 border-2 border-cyan-400' : 'bg-slate-700'
                                }`}
                              >
                                {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <div className="text-base sm:text-lg font-black text-slate-900 leading-tight flex items-center gap-2">
                                  <span>{u.name}</span>
                                  {isCurrentActive && (
                                    <span className="text-xs text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-md font-extrabold">
                                      IN USO
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5 flex items-center gap-2 flex-wrap">
                                  <span>{u.email}</span>
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-sans"
                                    title="Zero Password in Chiaro: la password originale non è mai salvata, solo questo codice crittografico irreversibile."
                                  >
                                    <Lock className="w-2.5 h-2.5 text-emerald-700" />
                                    <span>{formatPasswordHashPreview(u.passwordHash)}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Colonna 2: Ruolo */}
                          <td className="py-2.5 px-4">
                            <div className="text-sm sm:text-base font-extrabold text-slate-900">
                              {u.role}
                            </div>
                            <span
                              className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                                isSuperAdmin
                                  ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {u.badgeRole || u.role}
                            </span>
                          </td>

                          {/* Colonna 3: Sezioni con Badge */}
                          <td className="py-2.5 px-4">
                            {isSuperAdmin ? (
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 w-fit">
                                  <ShieldCheck className="w-4 h-4" />
                                  <span>Accesso Totale (Tutti i Moduli)</span>
                                </span>
                                <div className="flex items-center gap-3 text-xs sm:text-[13px] font-bold text-emerald-800">
                                  <span>✓ Note Sviluppatore</span>
                                  <span>✓ Ask OpenAI</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap gap-1.5 max-w-xl">
                                  {PERMISSION_MODULES.filter(m => m.id !== 'devNotes' && m.id !== 'askOpenAi').map((m) => {
                                    const hasAccess = u.permissions?.[m.id]
                                    if (!hasAccess) return null
                                    const IconComponent = m.icon
                                    return (
                                      <span
                                        key={m.id}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs sm:text-[13px] font-bold bg-slate-100 text-slate-800 border border-slate-200"
                                        title={m.desc}
                                      >
                                        <IconComponent className="w-3.5 h-3.5 text-[#007a50]" />
                                        <span>{m.label.split(' ')[0]}</span>
                                      </span>
                                    )
                                  })}
                                </div>
                                {/* Stato Funzioni Speciali */}
                                <div className="flex items-center gap-2 text-xs sm:text-[13px]">
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-bold ${
                                      u.permissions?.devNotes
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}
                                  >
                                    {u.permissions?.devNotes ? '✓ Note Sviluppatore' : '✕ Note Sviluppatore (Bloccato)'}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-bold ${
                                      u.permissions?.askOpenAi
                                        ? 'bg-emerald-100 text-emerald-800'
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
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold cursor-pointer transition-all ${
                                u.status === 'active'
                                  ? 'bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                              title="Clicca per cambiare stato"
                            >
                              {u.status === 'active' ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Attivo</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-rose-600" />
                                  <span>Sospeso</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Colonna 5: Azioni */}
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditUser(u)}
                                className="p-2 hover:bg-slate-100 rounded-xl text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
                                title="Modifica Utente & Permessi"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                              {!isSuperAdmin && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-2 hover:bg-rose-50 rounded-xl text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Elimina Utente"
                                >
                                  <Trash2 className="w-5 h-5" />
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

            {/* ── RIQUADRO OPERATORE ATTUALMENTE AL LAVORO CON IL CRM & PERMESSI DI ACCESSO (SOTTO L'ELENCO DEI PROFILI) ── */}
            <div
              className={`px-4 py-3 rounded-2xl border flex flex-col justify-between gap-2 shadow-md transition-all flex-shrink-0 ${
                isAdmin
                  ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-teal-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                  : 'bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white border-amber-600/50 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    isAdmin ? 'bg-teal-500/20 text-teal-300 border border-teal-400/50 shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  }`}
                >
                  {isAdmin ? '👑' : '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-teal-400">
                      Operatore Attualmente al Lavoro con il CRM:
                    </span>
                    <span
                      className={`text-xs font-black px-3 py-0.5 rounded-full ${
                        isAdmin ? 'bg-teal-400 text-slate-950 font-bold' : 'bg-amber-400 text-slate-950 font-bold'
                      }`}
                    >
                      {isAdmin ? '👑 SUPER ADMIN (ADM)' : '🎬 DIRECTOR (DIR)'}
                    </span>
                    <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                      In Sessione Attiva
                    </span>
                  </div>

                  <div className="text-lg sm:text-xl font-black text-white mt-0.5 leading-tight">
                    {currentUser.name} <span className="text-xs sm:text-sm text-slate-300 font-sans font-medium">({currentUser.email})</span>
                  </div>

                  {/* Elenco permessi operatore */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs sm:text-sm text-slate-200 font-sans leading-snug">
                      {isAdmin
                        ? 'Accesso completo: Dashboard strategica, Finanza, Schede Clienti, Modulo CRM Inbound, Note Sviluppatore e Gestione Totale Permessi.'
                        : 'Accesso Director: Dashboard operativa, Leads, Attività, Calendario Set e Ask OpenAI. Moduli riservati protetti.'}
                    </span>
                  </div>

                  {/* Pulsante Esci: SPOSTATO SUBITO SOTTO L'ELENCO PERMESSI */}
                  <div className="mt-2 flex items-center">
                    <button
                      type="button"
                      onClick={logout}
                      title="Disconnetti ed esci dal CRM (Log out)"
                      className="px-4 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white border border-red-500/40 hover:border-red-500/60 text-xs sm:text-sm font-extrabold transition-all shadow-sm cursor-pointer inline-flex items-center gap-2 group select-none"
                    >
                      <LogOut size={15} className="text-red-400 group-hover:-translate-x-0.5 transition-transform" />
                      <span>Esci</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── MODALE MODIFICA / CREAZIONE UTENTE & SCELTA PERMESSI ── */}
      {modalUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="bg-white border border-slate-300 rounded-2xl p-5 sm:p-6 max-w-4xl w-full text-left shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 flex flex-col justify-between overflow-hidden">
            
            {/* Header Modale */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-3 mb-3.5">
              <div>
                <span className="text-xs text-[#007a50] uppercase tracking-wider font-extrabold">
                  {isNewUser ? 'Aggiunta Collaboratore' : 'Configurazione Accessi'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums mt-0.5 leading-tight">
                  {isNewUser ? 'Nuovo Utente CRM' : `Permessi per ${modalUser.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalUser(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Campi Anagrafici */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3.5 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-[13px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                  Nome & Cognome:
                </label>
                <input
                  type="text"
                  value={modalUser.name}
                  onChange={(e) => setModalUser({ ...modalUser, name: e.target.value })}
                  placeholder="Es. Marco Bianchi"
                  style={{ color: '#000000' }}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm sm:text-[15px] font-bold text-black bg-white placeholder:text-slate-400 font-sans focus:outline-none focus:border-[#007a50]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-[13px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                  Email Aziendale:
                </label>
                <input
                  type="email"
                  value={modalUser.email}
                  onChange={(e) => setModalUser({ ...modalUser, email: e.target.value })}
                  placeholder="nome@azienda.it"
                  style={{ color: '#000000' }}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm sm:text-[15px] font-bold text-black bg-white placeholder:text-slate-400 font-sans focus:outline-none focus:border-[#007a50]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-[13px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                  Ruolo / Mansione:
                </label>
                <input
                  type="text"
                  value={modalUser.role}
                  onChange={(e) => setModalUser({ ...modalUser, role: e.target.value })}
                  placeholder="Es. Operatore Set / Regia"
                  style={{ color: '#000000' }}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm sm:text-[15px] font-bold text-black bg-white placeholder:text-slate-400 font-sans focus:outline-none focus:border-[#007a50]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-[13px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
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
                  style={{ color: '#000000' }}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm sm:text-[15px] font-bold text-black bg-white font-sans focus:outline-none focus:border-[#007a50]"
                >
                  <option value="custom" style={{ color: '#000000' }}>Personalizzato (Scelta moduli)</option>
                  <option value="admin" style={{ color: '#000000' }}>Amministratore (Tutto abilitato)</option>
                  <option value="restricted" style={{ color: '#000000' }}>Director con Funzioni Limitate</option>
                </select>
              </div>

              {/* Password di Accesso — Zero Password in Chiaro (PBKDF2 Irreversibile) */}
              <div className="sm:col-span-4">
                <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                  <label className="text-xs sm:text-[13px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                    <KeyRound className="w-4 h-4 text-[#007a50]" />
                    <span>{isNewUser ? 'Password Iniziale (Cifrata al Salvataggio):' : 'Sostituisci / Reset Password:'}</span>
                    <span className="text-[11px] font-bold normal-case text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      🔒 Zero Password in Chiaro
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const { password: rndPwd } = generateRandomPassword(12)
                      setIsPasswordRevealed(true)
                      setModalUser({ ...modalUser, newPassword: rndPwd })
                    }}
                    className="text-xs text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer font-extrabold"
                  >
                    <Dice5 className="w-3.5 h-3.5" />
                    <span>{isNewUser ? 'Genera Altra Password Casuale' : 'Genera Nuova Password Casuale'}</span>
                  </button>
                </div>
                <input
                  type={isPasswordRevealed ? 'text' : 'password'}
                  value={modalUser.newPassword || ''}
                  onDoubleClick={() => setIsPasswordRevealed((prev) => !prev)}
                  onChange={(e) => setModalUser({ ...modalUser, newPassword: e.target.value })}
                  placeholder={
                    isNewUser
                      ? 'Inserisci o genera la password iniziale (verrà convertita in pbkdf2$...)'
                      : 'Protetta da codice irreversibile (nessuno può leggerla). Scrivi qui solo per cambiarla...'
                  }
                  title="Doppio click per mostrare/nascondere la nuova password prima che venga trasformata in codice crittografico irreversibile"
                  style={{ color: isPasswordRevealed ? '#000000' : '#475569' }}
                  className={`w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm sm:text-[15px] font-bold bg-slate-50 placeholder:text-slate-400 font-sans focus:outline-none focus:border-[#007a50] ${
                    isPasswordRevealed ? 'text-black bg-white' : 'text-slate-600'
                  }`}
                />
                <div className="mt-1.5 flex items-center justify-between gap-2 flex-wrap text-[11px] text-slate-600 font-sans">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>
                      {modalUser.newPassword && modalUser.newPassword.trim()
                        ? `Nuovo codice crittografico pronto: ${formatPasswordHashPreview(hashPasswordSync(modalUser.newPassword.trim(), '8f9a3c71b402e5d1'))}`
                        : `Codice crittografico salvato: ${formatPasswordHashPreview(modalUser.passwordHash)}`}
                    </span>
                  </span>
                  <span className="text-[10.5px] text-slate-500">
                    La password originale non viene mai salvata da nessuna parte.
                  </span>
                </div>
              </div>
            </div>

            {/* Selezione Permessi Granulari */}
            <div className="mb-4 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#007a50]" />
                  <span>Sezioni & Funzionalità Abilitate:</span>
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleAllPermissions(true)}
                    className="text-xs sm:text-sm font-extrabold text-[#007a50] hover:underline cursor-pointer"
                  >
                    Seleziona tutti
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => toggleAllPermissions(false)}
                    className="text-xs sm:text-sm font-extrabold text-slate-500 hover:underline cursor-pointer"
                  >
                    Deseleziona tutti
                  </button>
                </div>
              </div>

              {/* Griglia 3x3 compatta per visualizzare tutti i moduli senza scroll */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {PERMISSION_MODULES.map((m) => {
                  const isChecked = Boolean(modalUser.permissions?.[m.id])
                  const IconComp = m.icon
                  const isRestrictedFeature = m.id === 'devNotes' || m.id === 'askOpenAi'

                  return (
                    <div
                      key={m.id}
                      onClick={() => togglePermission(m.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        isChecked
                          ? isRestrictedFeature
                            ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                            : 'border-[#007a50] bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isChecked
                              ? isRestrictedFeature
                                ? 'bg-cyan-600 text-white'
                                : 'bg-[#007a50] text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{m.label}</span>
                            {isRestrictedFeature && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                Speciale
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 leading-snug mt-0.5 line-clamp-1">
                            {m.desc}
                          </div>
                        </div>
                      </div>

                      {/* Checkbox Indicator */}
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
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
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalUser(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-sm font-extrabold text-slate-700 transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 bg-[#007a50] hover:bg-[#008f5d] text-white rounded-xl text-sm font-extrabold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Salva e Applica Accessi
              </button>
            </div>

          </div>
        </div>
      )}

      <DualBackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />

    </div>
  )
}
