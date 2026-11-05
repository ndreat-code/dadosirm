/**
 * Utility per la generazione casuale di credenziali di accesso (Email e Password).
 * La password generata rispetta tassativamente il requisito:
 * include lettere maiuscole, minuscole, numeri e almeno uno dei simboli presenti sulla tastiera (!@#$%^&*-_+=?).
 */

const KEYBOARD_SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'
const UPPERCASE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWERCASE_LETTERS = 'abcdefghijkmnpqrstuvwxyz'
const DIGIT_NUMBERS = '23456789'

export function generateRandomPassword(length = 12) {
  const minLength = Math.max(8, length)

  // Seleziona obbligatoriamente almeno un carattere per categoria
  const u = UPPERCASE_LETTERS[Math.floor(Math.random() * UPPERCASE_LETTERS.length)]
  const l = LOWERCASE_LETTERS[Math.floor(Math.random() * LOWERCASE_LETTERS.length)]
  const n = DIGIT_NUMBERS[Math.floor(Math.random() * DIGIT_NUMBERS.length)]
  const s = KEYBOARD_SYMBOLS[Math.floor(Math.random() * KEYBOARD_SYMBOLS.length)]

  // Caratteri restanti selezionati dall'intero pool combinato
  const allPool = UPPERCASE_LETTERS + LOWERCASE_LETTERS + DIGIT_NUMBERS + KEYBOARD_SYMBOLS
  const remaining = []
  for (let i = 0; i < minLength - 4; i++) {
    remaining.push(allPool[Math.floor(Math.random() * allPool.length)])
  }

  // Mescola i caratteri in ordine casuale con Fisher-Yates
  const chars = [u, l, n, s, ...remaining]
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return {
    password: chars.join(''),
    symbolUsed: s,
  }
}

export function generateRandomEmail(name = '', domain = 'esempio.it') {
  if (name && name.trim()) {
    const clean = name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\.|\.$/g, '')

    const randomSuffix = Math.floor(10 + Math.random() * 90)
    return `${clean}${randomSuffix}@${domain}`
  }

  const roles = ['director', 'creative', 'editor', 'producer', 'videomaker', 'photographer', 'operator', 'manager']
  const adjectives = ['lead', 'studio', 'pro', 'art', 'set', 'dado', 'crew']
  const role = roles[Math.floor(Math.random() * roles.length)]
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const num = Math.floor(100 + Math.random() * 900)

  return `${adj}.${role}${num}@${domain}`
}

export function generateRandomCredentials(name = '', role = 'Director') {
  const email = generateRandomEmail(name)
  const { password, symbolUsed } = generateRandomPassword(12)

  return {
    name: name.trim() || 'Nuovo Membro Studio',
    email,
    password,
    symbolUsed,
    role,
    generatedAt: new Date().toISOString(),
  }
}
