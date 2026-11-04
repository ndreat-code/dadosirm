import { createContext, useContext, useState, useEffect } from 'react'
import {
  hashPasswordSync,
  verifyPasswordSync,
  sanitizeUserPassword,
} from '../utils/passwordCrypto'

export const DEFAULT_USERS = [
  sanitizeUserPassword(
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
    'Admin2026!',
    '8f9a3c71b402e5d1'
  ),
  sanitizeUserPassword(
    {
      id: 'usr-dipendente',
      name: 'Davide (Director)',
      email: 'davide@dadocreativestudio.com',
      role: 'Director',
      badgeRole: 'Director',
      status: 'active',
      accessType: 'restricted',
      permissions: {
        dashboard: true,   // DASHBOARD: ABILITATO PER DIRECTOR
        companies: true,   // AZIENDE & CONTRATTI: SEMPRE ABILITATO
        activities: true,  // ATTIVITÀ: ABILITATO
        calendar: true,    // CALENDARIO: ABILITATO
        inventory: false,  // Non accede all'inventario
        leads: true,       // LEADS & OPPORTUNITÀ: ABILITATO PER DIRECTOR
        ai: false,         // Non accede ad AI
        devNotes: true,    // ABILITATO: Invio note sviluppatore
        askOpenAi: true,   // ABILITATO: Director può usare Ask OpenAI
        users: true,       // ABILITATO: Può visualizzare Utenti & Permessi e switchare profilo
      },
      lastLogin: 'Attivo ora',
    },
    'Director2026!',
    '4c7e91a2d83f05b6'
  ),
  sanitizeUserPassword(
    {
      id: 'usr-editor',
      name: 'Marco B. (Video Editor)',
      email: 'marco@dadocreativestudio.com',
      role: 'Post-Produzione & Colorist',
      badgeRole: 'Collaboratore',
      status: 'active',
      accessType: 'custom',
      permissions: {
        dashboard: true,
        companies: true,
        activities: true,
        calendar: true,
        inventory: true,
        leads: false,
        ai: false,
        devNotes: true,
        askOpenAi: true,
        users: false,
      },
      lastLogin: 'Ieri, 18:30',
    },
    'Editor2026!',
    '7a1b5d93e204f8c1'
  ),
  sanitizeUserPassword(
    {
      id: 'usr-producer',
      name: 'Laura R. (Production Manager)',
      email: 'laura@dadocreativestudio.com',
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
        devNotes: true,
        askOpenAi: true,
        users: false,
      },
      lastLogin: '3 ore fa',
    },
    'Prod2026!',
    '2e8d4f10a93c7b52'
  ),
]

const AuthContext = createContext(null)

const USERS_STORAGE_KEY = 'dado_crm_users_v7'
const ACTIVE_USER_ID_KEY = 'dado_crm_active_user_id_v6'
const AUTH_STATUS_KEY = 'dado_crm_auth_status_v6'

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try {
      const saved =
        localStorage.getItem(USERS_STORAGE_KEY) ||
        localStorage.getItem('dado_crm_users_v6') ||
        localStorage.getItem('dado_crm_users_v5') ||
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
            const fallbackPlain =
              u.id === 'usr-admin'
                ? 'Admin2026!'
                : u.id === 'usr-dipendente'
                ? 'Director2026!'
                : u.id === 'usr-editor'
                ? 'Editor2026!'
                : u.id === 'usr-producer'
                ? 'Prod2026!'
                : 'DadoStudio2026!'

            const fallbackSalt =
              u.id === 'usr-admin'
                ? '8f9a3c71b402e5d1'
                : u.id === 'usr-dipendente'
                ? '4c7e91a2d83f05b6'
                : u.id === 'usr-editor'
                ? '7a1b5d93e204f8c1'
                : u.id === 'usr-producer'
                ? '2e8d4f10a93c7b52'
                : null

            // Assicura che le voci Dashboard, Companies e Note Sviluppatore siano SEMPRE garantite e attive per tutti gli utenti
            const basePermissions = {
              ...u.permissions,
              dashboard: true,
              companies: true,
              devNotes: true,
            }

            let normalizedUser = { ...u, permissions: basePermissions }

            if (u.id === 'usr-producer') {
              normalizedUser = {
                ...normalizedUser,
                name: 'Laura R. (Production Manager)',
                email: 'laura@dadocreativestudio.com',
                role: 'Production Manager & Set Coordinator',
                permissions: basePermissions,
              }
            } else if (u.id === 'usr-dipendente') {
              normalizedUser = {
                ...normalizedUser,
                name: u.name === 'Collaboratore (Dipendente)' ? 'Davide (Director)' : u.name.replace('Collaboratore', 'Davide').replace('(Dipendente)', '(Director)'),
                role: (u.role === 'Dipendente Operativo' || u.role === 'Collaboratore') ? 'Director' : u.role,
                badgeRole: (u.badgeRole === 'Dipendente' || u.badgeRole === 'Collaboratore') ? 'Director' : u.badgeRole,
                email: u.email === 'dipendente@dadocreativestudio.com' ? 'davide@dadocreativestudio.com' : u.email,
                permissions: {
                  ...basePermissions,
                  dashboard: true,
                  companies: true,
                  leads: true,
                  askOpenAi: true,
                  users: true,
                },
              }
            } else if (u.id === 'usr-admin') {
              normalizedUser = {
                ...normalizedUser,
                permissions: {
                  ...basePermissions,
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

            // ZERO PASSWORD IN CHIARO: converte eventuale password in passwordHash (pbkdf2$...) e rimuove il testo in chiaro
            return sanitizeUserPassword(normalizedUser, fallbackPlain, fallbackSalt)
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

  // Sincronizza modifiche utenti su localStorage (garantendo rimozione di qualsiasi campo password in chiaro)
  useEffect(() => {
    try {
      const safeUsers = users.map((u) => sanitizeUserPassword(u))
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(safeUsers))
      // Rimuove vecchie chiavi legacy che potevano contenere password in chiaro
      localStorage.removeItem('dado_crm_users_v6')
      localStorage.removeItem('dado_crm_users_v5')
      localStorage.removeItem('dado_crm_users_v4')
      localStorage.removeItem('dado_crm_users_v3')
      localStorage.removeItem('dado_crm_users_v2')
      localStorage.removeItem('dado_crm_users')
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

  const canSendDevNotes = true
  const canAskOpenAI = true

  function canAccess(moduleName) {
    if (!currentUser) return false
    if (isAdmin) return true
    if (moduleName === 'dashboard') return true // La voce Dashboard è SEMPRE accessibile a tutti gli utenti
    if (moduleName === 'companies') return true // La voce Companies (Aziende & Contratti) è SEMPRE accessibile a tutti gli utenti
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

    const storedHash = found.passwordHash || found.password
    if (storedHash && !verifyPasswordSync(password, storedHash)) {
      return { success: false, error: 'Password errata. Riprova con le credenziali corrette.' }
    }

    setActiveUserId(found.id)
    setIsAuthenticated(true)
    try {
      sessionStorage.removeItem('dado_smart_toast_dismissed')
    } catch {}
    if (typeof window !== 'undefined') {
      window.__dadoSmartToastVisible = true
      window.dispatchEvent(new CustomEvent('dado-smart-notification-login', { detail: { show: true } }))
    }
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
          companies: true,
          activities: true,
          calendar: true,
          inventory: false,
          leads: true,
          ai: false,
          devNotes: true,
          askOpenAi: true,
          users: false,
        }
      : {
          dashboard: true,
          companies: true,
          activities: true,
          calendar: true,
          inventory: false,
          leads: false,
          ai: false,
          devNotes: true,
          askOpenAi: true,
          users: false,
        }

    // Trasforma subito la password in codice crittografico irreversibile pbkdf2$... e non salva mai la password originale
    const newUser = sanitizeUserPassword({
      id: 'usr-' + Date.now(),
      name: userData.name?.trim() || 'Nuovo Utente Studio',
      email: userData.email.trim(),
      passwordHash: hashPasswordSync(userData.password || 'DadoStudio2026!'),
      role: roleName,
      badgeRole: roleName,
      status: 'active',
      accessType: isAdminRole ? 'admin' : 'restricted',
      permissions: userData.permissions || defaultPermissions,
      lastLogin: 'Registrato ora',
    })

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
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== updatedUser.id) return u
        // Se l'amministratore ha impostato una nuova password (newPassword o password), la cifra subito in pbkdf2$...
        // Altrimenti mantiene il passwordHash esistente senza mai salvare testo in chiaro
        const merged = {
          ...u,
          ...updatedUser,
          passwordHash: updatedUser.passwordHash || u.passwordHash,
        }
        return sanitizeUserPassword(merged)
      })
    )
  }

  function addUser(newUser) {
    const safeNewUser = sanitizeUserPassword(newUser)
    setUsers((prev) => [safeNewUser, ...prev])
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
