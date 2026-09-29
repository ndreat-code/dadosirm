import { createContext, useContext, useState, useEffect } from 'react'

export const DEFAULT_USERS = [
  {
    id: 'usr-admin',
    name: 'Andrea T. (Amministratore)',
    email: 'admin@dadocreativestudio.com',
    role: 'Super Amministratore',
    badgeRole: 'Amministratore',
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
      devNotes: true,    // Abilitato a inviare note sviluppatore
      askOpenAi: true,   // Abilitato a interrogare OpenAI
      users: true,
    },
    lastLogin: 'Attivo ora',
  },
  {
    id: 'usr-dipendente',
    name: 'Davide (Director)',
    email: 'davide@dadocreativestudio.com',
    role: 'Director',
    badgeRole: 'Director',
    status: 'active',
    accessType: 'restricted',
    permissions: {
      dashboard: false,  // Non accede alla Dashboard
      companies: false,  // Non accede ad Aziende
      activities: true,  // ATTIVITÀ: ABILITATO
      calendar: true,    // CALENDARIO: ABILITATO
      inventory: false,  // Non accede all'inventario
      leads: false,      // Non accede ai Lead
      ai: false,         // Non accede ad AI
      devNotes: false,   // BLOCCATO: Non può inviare note sviluppatore
      askOpenAi: false,  // BLOCCATO: Non può usare Ask OpenAI
      users: false,
    },
    lastLogin: 'Attivo ora',
  }
]

const AuthContext = createContext(null)

const USERS_STORAGE_KEY = 'dado_crm_users_v3'
const ACTIVE_USER_ID_KEY = 'dado_crm_active_user_id_v3'

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY) || localStorage.getItem('dado_crm_users_v2')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Verifica che l'account admin e dipendente siano presenti e con i permessi corretti
          const hasAdmin = parsed.some(u => u.id === 'usr-admin')
          const hasDipendente = parsed.some(u => u.id === 'usr-dipendente')
          if (hasAdmin && hasDipendente) {
            return parsed.map(u => {
              if (u.id === 'usr-dipendente') {
                return {
                  ...u,
                  name: u.name === 'Collaboratore (Dipendente)' ? 'Davide (Director)' : u.name.replace('Collaboratore', 'Davide').replace('(Dipendente)', '(Director)'),
                  role: (u.role === 'Dipendente Operativo' || u.role === 'Collaboratore') ? 'Director' : u.role,
                  badgeRole: (u.badgeRole === 'Dipendente' || u.badgeRole === 'Collaboratore') ? 'Director' : u.badgeRole,
                  email: u.email === 'dipendente@dadocreativestudio.com' ? 'davide@dadocreativestudio.com' : u.email,
                }
              }
              return u
            })
          }
        }
      }
    } catch (e) {
      console.warn('Errore lettura utenti da localStorage:', e)
    }
    return DEFAULT_USERS
  })

  const [activeUserId, setActiveUserId] = useState(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_USER_ID_KEY) || localStorage.getItem('dado_crm_active_user_id_v2')
      if (savedId) return savedId
    } catch (e) {
      console.warn('Errore lettura activeUserId:', e)
    }
    return 'usr-admin'
  })

  // Sincronizza modifiche utenti su localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    } catch (e) {
      console.warn('Errore salvataggio utenti:', e)
    }
  }, [users])

  // Sincronizza activeUserId su localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_USER_ID_KEY, activeUserId)
    } catch (e) {
      console.warn('Errore salvataggio activeUserId:', e)
    }
  }, [activeUserId])

  const currentUser = users.find((u) => u.id === activeUserId) || users[0] || DEFAULT_USERS[0]

  const isAdmin = currentUser.accessType === 'admin' || currentUser.badgeRole === 'Amministratore'
  const isDipendente = currentUser.badgeRole === 'Dipendente' || currentUser.badgeRole === 'Director' || currentUser.accessType === 'restricted' || currentUser.id === 'usr-dipendente'

  const canSendDevNotes = Boolean(currentUser.permissions?.devNotes)
  const canAskOpenAI = Boolean(currentUser.permissions?.askOpenAi)

  function canAccess(moduleName) {
    if (!currentUser) return false
    if (isAdmin) return true
    return Boolean(currentUser.permissions?.[moduleName])
  }

  function switchUser(userId) {
    const target = users.find((u) => u.id === userId)
    if (target) {
      setActiveUserId(userId)
    }
  }

  function updateUser(updatedUser) {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
  }

  function addUser(newUser) {
    setUsers((prev) => [newUser, ...prev])
  }

  function deleteUser(userId) {
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    if (activeUserId === userId) {
      setActiveUserId('usr-admin')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        activeUserId,
        isAdmin,
        isDipendente,
        canSendDevNotes,
        canAskOpenAI,
        canAccess,
        switchUser,
        updateUser,
        addUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve essere utilizzato all’interno di un AuthProvider')
  }
  return ctx
}
