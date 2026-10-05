import { createContext, useContext, useState, useEffect } from 'react'

export const DEFAULT_USERS = [
  {
    id: 'usr-admin',
    name: 'Andrea T. (Amministratore)',
    email: 'admin@dadocreativestudio.com',
    password: 'Admin2026!',
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
    password: 'Director2026!',
    role: 'Director',
    badgeRole: 'Director',
    status: 'active',
    accessType: 'restricted',
    permissions: {
      dashboard: true,   // DASHBOARD: ABILITATO PER DIRECTOR
      companies: false,  // Non accede ad Aziende
      activities: true,  // ATTIVITÀ: ABILITATO
      calendar: true,    // CALENDARIO: ABILITATO
      inventory: false,  // Non accede all'inventario
      leads: true,       // LEADS & OPPORTUNITÀ: ABILITATO PER DIRECTOR
      ai: false,         // Non accede ad AI
      devNotes: false,   // BLOCCATO: Non può inviare note sviluppatore
      askOpenAi: true,   // ABILITATO: Director può usare Ask OpenAI
      users: true,       // ABILITATO: Può visualizzare Utenti & Permessi e switchare profilo
    },
    lastLogin: 'Attivo ora',
  },
  {
    id: 'usr-editor',
    name: 'Marco B. (Video Editor)',
    email: 'marco@dadocreativestudio.com',
    password: 'Editor2026!',
    role: 'Post-Produzione & Colorist',
    badgeRole: 'Collaboratore',
    status: 'active',
    accessType: 'custom',
    permissions: {
      dashboard: false,
      companies: false,
      activities: true,
      calendar: true,
      inventory: true,
      leads: false,
      ai: false,
      devNotes: false,
      askOpenAi: false,
      users: false,
    },
    lastLogin: 'Ieri, 18:30',
  },
  {
    id: 'usr-producer',
    name: 'Giulia M. (Production Manager)',
    email: 'giulia@dadocreativestudio.com',
    password: 'Prod2026!',
    role: 'Production Manager & Set Coordinator',
    badgeRole: 'Collaboratore',
    status: 'active',
    accessType: 'custom',
    permissions: {
      dashboard: true,
      companies: true,
      activities: true,
      calendar: true,
      inventory: true,
      leads: true,
      ai: false,
      devNotes: false,
      askOpenAi: false,
      users: false,
    },
    lastLogin: '3 ore fa',
  }
]

const AuthContext = createContext(null)

const USERS_STORAGE_KEY = 'dado_crm_users_v5'
const ACTIVE_USER_ID_KEY = 'dado_crm_active_user_id_v5'
const AUTH_STATUS_KEY = 'dado_crm_auth_status_v5'

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try {
      const saved =
        localStorage.getItem(USERS_STORAGE_KEY) ||
        localStorage.getItem('dado_crm_users_v4') ||
        localStorage.getItem('dado_crm_users_v3') ||
        localStorage.getItem('dado_crm_users_v2') ||
        localStorage.getItem('dado_crm_users')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Unisci con DEFAULT_USERS per garantire che admin e director e il team base esistano sempre
          const map = new Map()
          DEFAULT_USERS.forEach((u) => map.set(u.id, u))
          parsed.forEach((u) => map.set(u.id, { ...map.get(u.id), ...u }))
          const merged = Array.from(map.values())

          return merged.map((u) => {
            // Assicura che ogni utente abbia una password valida con simbolo
            let pwd = u.password
            if (!pwd) {
              if (u.id === 'usr-admin') pwd = 'Admin2026!'
              else if (u.id === 'usr-dipendente') pwd = 'Director2026!'
              else pwd = 'DadoStudio2026!'
            }

            if (u.id === 'usr-dipendente') {
              return {
                ...u,
                password: pwd,
                name: u.name === 'Collaboratore (Dipendente)' ? 'Davide (Director)' : u.name.replace('Collaboratore', 'Davide').replace('(Dipendente)', '(Director)'),
                role: (u.role === 'Dipendente Operativo' || u.role === 'Collaboratore') ? 'Director' : u.role,
                badgeRole: (u.badgeRole === 'Dipendente' || u.badgeRole === 'Collaboratore') ? 'Director' : u.badgeRole,
                email: u.email === 'dipendente@dadocreativestudio.com' ? 'davide@dadocreativestudio.com' : u.email,
                permissions: {
                  ...u.permissions,
                  dashboard: true,
                  leads: true,
                  askOpenAi: true,
                  users: true,
                },
              }
            }
            if (u.id === 'usr-admin') {
              return {
                ...u,
                password: pwd,
                permissions: {
                  ...u.permissions,
                  dashboard: true,
                  companies: true,
                  activities: true,
                  calendar: true,
                  inventory: true,
                  leads: true,
                  ai: true,
                  devNotes: true,
                  askOpenAi: true,
                  users: true,
                },
              }
            }
            return { ...u, password: pwd }
          })
        }
      }
    } catch (e) {
      console.warn('Errore lettura utenti da localStorage:', e)
    }
    return DEFAULT_USERS
  })

  const [activeUserId, setActiveUserId] = useState(() => {
    try {
      const savedId =
        localStorage.getItem(ACTIVE_USER_ID_KEY) ||
        localStorage.getItem('dado_crm_active_user_id_v4')
      if (savedId) return savedId
    } catch (e) {
      console.warn('Errore lettura activeUserId:', e)
    }
    return 'usr-admin'
  })

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const auth = localStorage.getItem(AUTH_STATUS_KEY)
      if (auth !== null) return auth === 'true'
    } catch (e) {}
    return true // Default autenticato per preservare sessione attiva
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

  // Sincronizza isAuthenticated su localStorage
  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STATUS_KEY, String(isAuthenticated))
    } catch (e) {}
  }, [isAuthenticated])

  const currentUser = users.find((u) => u.id === activeUserId) || users[0] || DEFAULT_USERS[0]

  const isAdmin = currentUser.accessType === 'admin' || currentUser.badgeRole === 'Amministratore'
  const isDirector = currentUser.badgeRole === 'Director' || currentUser.role === 'Director' || currentUser.id === 'usr-dipendente'
  const isDipendente = currentUser.badgeRole === 'Dipendente' || isDirector || currentUser.accessType === 'restricted' || currentUser.id === 'usr-dipendente'

  const canSendDevNotes = Boolean(currentUser.permissions?.devNotes)
  const canAskOpenAI = Boolean(currentUser.permissions?.askOpenAi) || isDirector || isAdmin

  function canAccess(moduleName) {
    if (!currentUser) return false
    if (isAdmin) return true
    if (moduleName === 'users') return true // La sezione Utenti & Permessi di Accesso è sempre consultabile
    return Boolean(currentUser.permissions?.[moduleName])
  }

  function login(email, password) {
    if (!email || !password) {
      return { success: false, error: 'Compila sia email che password.' }
    }
    const cleanEmail = email.trim().toLowerCase()
    const found = users.find((u) => (u.email || '').toLowerCase() === cleanEmail)

    if (!found) {
      return { success: false, error: 'Nessun utente trovato con questa email nel CRM.' }
    }

    if (found.password && found.password !== password) {
      return { success: false, error: 'Password errata. Riprova con le credenziali corrette.' }
    }

    setActiveUserId(found.id)
    setIsAuthenticated(true)
    return { success: true, user: found }
  }

  function logout() {
    setIsAuthenticated(false)
  }

  function registerUser(userData) {
    const cleanEmail = (userData.email || '').trim().toLowerCase()
    if (!cleanEmail) {
      return { success: false, error: 'L’email è obbligatoria per la registrazione.' }
    }

    if (users.some((u) => (u.email || '').toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Un account con questa email risulta già registrato nel sistema.' }
    }

    const roleName = userData.role || 'Director'
    const isDirectorRole = roleName.toLowerCase().includes('director')
    const isAdminRole = roleName.toLowerCase().includes('admin') || roleName.toLowerCase().includes('amministratore')

    const defaultPermissions = isAdminRole
      ? {
          dashboard: true,
          companies: true,
          activities: true,
          calendar: true,
          inventory: true,
          leads: true,
          ai: true,
          devNotes: true,
          askOpenAi: true,
          users: true,
        }
      : isDirectorRole
      ? {
          dashboard: true,
          companies: false,
          activities: true,
          calendar: true,
          inventory: false,
          leads: true,
          ai: false,
          devNotes: false,
          askOpenAi: true,
          users: false,
        }
      : {
          dashboard: true,
          companies: false,
          activities: true,
          calendar: true,
          inventory: false,
          leads: false,
          ai: false,
          devNotes: false,
          askOpenAi: false,
          users: false,
        }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: userData.name?.trim() || 'Nuovo Utente Studio',
      email: userData.email.trim(),
      password: userData.password || 'DadoStudio2026!',
      role: roleName,
      badgeRole: roleName,
      status: 'active',
      accessType: isAdminRole ? 'admin' : 'restricted',
      permissions: userData.permissions || defaultPermissions,
      lastLogin: 'Registrato ora',
    }

    setUsers((prev) => [newUser, ...prev])
    setActiveUserId(newUser.id)
    setIsAuthenticated(true)

    return { success: true, user: newUser }
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

  function resetDefaultUsers() {
    setUsers(DEFAULT_USERS)
    setActiveUserId('usr-admin')
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
      localStorage.setItem(ACTIVE_USER_ID_KEY, 'usr-admin')
    } catch (e) {}
  }

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        activeUserId,
        isAuthenticated,
        isAdmin,
        isDirector,
        isDipendente,
        canSendDevNotes,
        canAskOpenAI,
        canAccess,
        login,
        logout,
        registerUser,
        switchUser,
        updateUser,
        addUser,
        deleteUser,
        resetDefaultUsers,
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
