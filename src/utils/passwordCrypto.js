/**
 * Modulo Crittografico Zero-Plaintext Password (PBKDF2-HMAC-SHA256)
 *
 * Trasforma immediatamente qualsiasi password inserita o modificata in un
 * codice crittografico irreversibile con salt univoco nel formato:
 *   pbkdf2$<salt_hex>$<hash_hex>
 *
 * La password originale in chiaro non viene MAI salvata nello stato né in localStorage.
 */

const K_SHA256 = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
])

function rotr(n, x) {
  return (x >>> n) | (x << (32 - n))
}

function utf8ToBytes(str) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(String(str))
  }
  const out = []
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i)
    if (c < 0x80) {
      out.push(c)
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f))
    } else {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f))
    }
  }
  return new Uint8Array(out)
}

function sha256Bytes(msgBytes) {
  const l = msgBytes.length
  const bitLenHi = Math.floor((l * 8) / 0x100000000)
  const bitLenLo = (l * 8) >>> 0

  const padLen = ((l + 9 + 63) & ~63)
  const padded = new Uint8Array(padLen)
  padded.set(msgBytes, 0)
  padded[l] = 0x80

  const view = new DataView(padded.buffer)
  view.setUint32(padLen - 8, bitLenHi, false)
  view.setUint32(padLen - 4, bitLenLo, false)

  let h0 = 0x6a09e667
  let h1 = 0xbb67ae85
  let h2 = 0x3c6ef372
  let h3 = 0xa54ff53a
  let h4 = 0x510e527f
  let h5 = 0x9b05688c
  let h6 = 0x1f83d9ab
  let h7 = 0x5be0cd19

  const w = new Uint32Array(64)

  for (let offset = 0; offset < padLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false)
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3)
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10)
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0
    }

    let a = h0
    let b = h1
    let c = h2
    let d = h3
    let e = h4
    let f = h5
    let g = h6
    let h = h7

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e)
      const ch = (e & f) ^ (~e & g)
      const temp1 = (h + S1 + ch + K_SHA256[i] + w[i]) >>> 0
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (S0 + maj) >>> 0

      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0
    h5 = (h5 + f) >>> 0
    h6 = (h6 + g) >>> 0
    h7 = (h7 + h) >>> 0
  }

  const out = new Uint8Array(32)
  const outView = new DataView(out.buffer)
  outView.setUint32(0, h0, false)
  outView.setUint32(4, h1, false)
  outView.setUint32(8, h2, false)
  outView.setUint32(12, h3, false)
  outView.setUint32(16, h4, false)
  outView.setUint32(20, h5, false)
  outView.setUint32(24, h6, false)
  outView.setUint32(28, h7, false)
  return out
}

function hmacSha256(keyBytes, dataBytes) {
  const blockSize = 64
  let key = keyBytes
  if (key.length > blockSize) {
    key = sha256Bytes(key)
  }
  const paddedKey = new Uint8Array(blockSize)
  paddedKey.set(key, 0)

  const oKeyPad = new Uint8Array(blockSize)
  const iKeyPad = new Uint8Array(blockSize)
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = paddedKey[i] ^ 0x5c
    iKeyPad[i] = paddedKey[i] ^ 0x36
  }

  const innerInput = new Uint8Array(blockSize + dataBytes.length)
  innerInput.set(iKeyPad, 0)
  innerInput.set(dataBytes, blockSize)
  const innerHash = sha256Bytes(innerInput)

  const outerInput = new Uint8Array(blockSize + innerHash.length)
  outerInput.set(oKeyPad, 0)
  outerInput.set(innerHash, blockSize)
  return sha256Bytes(outerInput)
}

function bytesToHex(bytes) {
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

function generateSaltHex(byteLength = 8) {
  const buf = new Uint8Array(byteLength)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(buf)
  } else {
    for (let i = 0; i < byteLength; i++) {
      buf[i] = Math.floor(Math.random() * 256)
    }
  }
  return bytesToHex(buf)
}

const PBKDF2_ITERATIONS = 600

/**
 * Deriva una chiave PBKDF2-HMAC-SHA256 a 256 bit (1 blocco da 32 byte)
 */
function pbkdf2Sha256SingleBlock(passwordStr, saltStr, iterations = PBKDF2_ITERATIONS) {
  const pwdBytes = utf8ToBytes(passwordStr)
  const saltBytes = utf8ToBytes(`dado_crm_v1:${saltStr}`)

  // Salt || INT_32_BE(1)
  const saltBlock = new Uint8Array(saltBytes.length + 4)
  saltBlock.set(saltBytes, 0)
  saltBlock[saltBytes.length + 3] = 1

  let u = hmacSha256(pwdBytes, saltBlock)
  const T = new Uint8Array(u)

  for (let i = 1; i < iterations; i++) {
    u = hmacSha256(pwdBytes, u)
    for (let j = 0; j < 32; j++) {
      T[j] ^= u[j]
    }
  }

  return bytesToHex(T)
}

/**
 * Verifica se una stringa è già un hash crittografico pbkdf2$
 */
export function isPasswordHashed(value) {
  return typeof value === 'string' && /^pbkdf2\$[0-9a-f]{8,32}\$[0-9a-f]{64}$/i.test(value.trim())
}

/**
 * Trasforma una password in chiaro in un hash irreversibile `pbkdf2$<salt>$<hash>`.
 * Se riceve già un hash valido, lo restituisce invariato.
 */
export function hashPasswordSync(plainPassword, customSalt = null) {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password non valida per hashing crittografico.')
  }
  if (isPasswordHashed(plainPassword)) {
    return plainPassword.trim()
  }
  const salt = customSalt && /^[0-9a-f]{8,32}$/i.test(customSalt) ? customSalt.toLowerCase() : generateSaltHex(8)
  const derivedHex = pbkdf2Sha256SingleBlock(plainPassword, salt, PBKDF2_ITERATIONS)
  return `pbkdf2$${salt}$${derivedHex}`
}

/**
 * Confronto a tempo costante per prevenire timing attacks
 */
function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/**
 * Verifica se una password in chiaro corrisponde al codice crittografico `pbkdf2$<salt>$<hash>`.
 */
export function verifyPasswordSync(plainPassword, storedPasswordHash) {
  if (!plainPassword || !storedPasswordHash) return false
  if (!isPasswordHashed(storedPasswordHash)) {
    // Fallback di sicurezza solo in caso di record legacy non ancora migrato
    return timingSafeEqualStr(String(plainPassword), String(storedPasswordHash))
  }
  const parts = storedPasswordHash.trim().split('$')
  if (parts.length !== 3) return false
  const salt = parts[1]
  const recomputed = hashPasswordSync(String(plainPassword), salt)
  return timingSafeEqualStr(recomputed, storedPasswordHash.trim().toLowerCase())
}

/**
 * Rimuove qualsiasi campo `password` o `newPassword` in chiaro dall'oggetto utente
 * e garantisce che sia presente esclusivamente `passwordHash: "pbkdf2$..."`.
 */
export function sanitizeUserPassword(userObj, fallbackPlain = 'DadoStudio2026!', deterministicSalt = null) {
  if (!userObj || typeof userObj !== 'object') return userObj

  const clone = { ...userObj }
  const candidatePlain =
    typeof clone.newPassword === 'string' && clone.newPassword.trim() !== ''
      ? clone.newPassword.trim()
      : typeof clone.password === 'string' && clone.password.trim() !== ''
      ? clone.password.trim()
      : null

  if (candidatePlain) {
    clone.passwordHash = isPasswordHashed(candidatePlain)
      ? candidatePlain
      : hashPasswordSync(candidatePlain, deterministicSalt)
  } else if (!isPasswordHashed(clone.passwordHash)) {
    clone.passwordHash = hashPasswordSync(fallbackPlain, deterministicSalt)
  }

  // Elimina tassativamente qualsiasi password in chiaro
  delete clone.password
  delete clone.newPassword

  return clone
}

/**
 * Restituisce un'anteprima compatta del codice crittografico (es. pbkdf2$8f9a3c71$a49f...c81e)
 */
export function formatPasswordHashPreview(passwordHash) {
  if (!isPasswordHashed(passwordHash)) return 'pbkdf2$8f9a...protetto'
  const [, salt, digest] = passwordHash.split('$')
  return `pbkdf2$${salt}$${digest.slice(0, 8)}…${digest.slice(-6)}`
}
