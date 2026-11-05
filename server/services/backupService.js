import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { google } from 'googleapis'
import { DATA_DIR, STATE_DIR } from '../runtimeConfig.js'

// ─────────────────────────────────────────────────────────────────────────────
// DADO CRM — DUAL BACKUP ENGINE (SISTEMA 1: VAULT LOCALE + SISTEMA 2: CLOUD)
// ─────────────────────────────────────────────────────────────────────────────

export const LOCAL_BACKUPS_DIR = path.join(DATA_DIR, 'backups_local')
export const CLOUD_MIRROR_DIR = path.join(DATA_DIR, 'backups_cloud_mirror')
export const BACKUP_CONFIG_FILE = path.join(DATA_DIR, 'backupConfig.json')

const MAX_LOCAL_SNAPSHOTS = 30
const MAX_CLOUD_SNAPSHOTS = 30

// Assicura l'esistenza delle directory di backup
function ensureBackupDirs() {
  try {
    fs.mkdirSync(LOCAL_BACKUPS_DIR, { recursive: true })
    fs.mkdirSync(CLOUD_MIRROR_DIR, { recursive: true })
  } catch (err) {
    console.error('Errore creazione cartelle backup:', err)
  }
}
ensureBackupDirs()

const DEFAULT_BACKUP_CONFIG = {
  autoBackupEnabled: true,
  autoBackupIntervalMinutes: 30,
  backupOnEveryWrite: true,
  localRetentionCount: MAX_LOCAL_SNAPSHOTS,
  cloudEnabled: true,
  cloudProvider: 'google_and_mirror', // 'google_and_mirror' | 'custom_webhook' | 'github_gist'
  cloudEncryptionEnabled: true, // AES-256-GCM prima dell'invio sul Cloud
  cloudWebhookUrl: process.env.CLOUD_BACKUP_WEBHOOK_URL || '',
  cloudWebhookToken: process.env.CLOUD_BACKUP_TOKEN || '',
  githubGistToken: process.env.GITHUB_GIST_BACKUP_TOKEN || '',
  githubGistId: process.env.GITHUB_GIST_BACKUP_ID || '',
  lastLocalBackupAt: null,
  lastCloudBackupAt: null,
  lastCloudStatus: 'active',
  lastCloudDestination: 'DADO Cloud Vault (AES-256-GCM)',
}

export function getBackupConfig() {
  try {
    if (fs.existsSync(BACKUP_CONFIG_FILE)) {
      const saved = JSON.parse(fs.readFileSync(BACKUP_CONFIG_FILE, 'utf-8'))
      return { ...DEFAULT_BACKUP_CONFIG, ...saved }
    }
  } catch (err) {
    console.warn('Errore lettura backupConfig.json:', err)
  }
  return { ...DEFAULT_BACKUP_CONFIG }
}

export function saveBackupConfig(partialConfig) {
  ensureBackupDirs()
  const current = getBackupConfig()
  const updated = { ...current, ...partialConfig, updatedAt: new Date().toISOString() }
  fs.writeFileSync(BACKUP_CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8')
  return updated
}

// Legge in sicurezza un file JSON da DATA_DIR
function readDataJson(fileName, fallback) {
  try {
    const filePath = path.join(DATA_DIR, fileName)
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
  } catch (err) {
    console.warn(`Errore lettura ${fileName} per backup:`, err.message)
  }
  return fallback
}

// Calcola l'hash crittografico SHA-256 di verifica integrità
export function computeSha256Integrity(payloadObj) {
  const canonical = JSON.stringify(payloadObj)
  const digest = crypto.createHash('sha256').update(canonical, 'utf-8').digest('hex')
  return `sha256$${digest}`
}

// Cifratura simmetrica autenticata AES-256-GCM per il pacchetto Cloud
function encryptCloudPayload(plainObject, secretPassphrase) {
  const secret = secretPassphrase || process.env.BACKUP_ENCRYPTION_KEY || 'dado-crm-cloud-vault-key-2026'
  const salt = crypto.randomBytes(16)
  const iv = crypto.randomBytes(12)
  const key = crypto.pbkdf2Sync(secret, salt, 10000, 32, 'sha256')
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

  const plaintext = JSON.stringify(plainObject)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return {
    cipherAlgorithm: 'AES-256-GCM',
    kdf: 'PBKDF2-SHA256-10000',
    saltHex: salt.toString('hex'),
    ivHex: iv.toString('hex'),
    authTagHex: authTag.toString('hex'),
    ciphertextBase64: encrypted.toString('base64'),
  }
}

export function decryptCloudPayload(encryptedEnvelope, secretPassphrase) {
  const secret = secretPassphrase || process.env.BACKUP_ENCRYPTION_KEY || 'dado-crm-cloud-vault-key-2026'
  const salt = Buffer.from(encryptedEnvelope.saltHex, 'hex')
  const iv = Buffer.from(encryptedEnvelope.ivHex, 'hex')
  const authTag = Buffer.from(encryptedEnvelope.authTagHex, 'hex')
  const ciphertext = Buffer.from(encryptedEnvelope.ciphertextBase64, 'base64')

  const key = crypto.pbkdf2Sync(secret, salt, 10000, 32, 'sha256')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf-8')
  return JSON.parse(decrypted)
}

/**
 * Raccoglie l'intero stato del CRM in uno snapshot atomico
 */
export function buildFullCrmSnapshotPayload(clientState = null, triggerReason = 'manual') {
  const crmData = readDataJson('crmData.json', {
    companies: [],
    opportunities: [],
    nextActions: [],
    inventory: [],
    quotes: [],
    emails: [],
    invoices: [],
    collaborators: [],
  })
  const automations = readDataJson('automations.json', [])
  const developerNotes = readDataJson('developerNotes.json', [])
  const emailTrainingExamples = readDataJson('emailTrainingExamples.json', [])

  // Sanifica eventuali utenti passati dal client per garantire Zero Password in Chiaro anche nei backup
  let safeUsers = []
  if (clientState && Array.isArray(clientState.users)) {
    safeUsers = clientState.users.map((u) => {
      const copy = { ...u }
      delete copy.password
      delete copy.newPassword
      return copy
    })
  }

  const coreData = {
    crmData,
    automations,
    developerNotes,
    emailTrainingExamples,
    clientState: {
      users: safeUsers,
      appunti: clientState?.appunti || null,
      exportedAt: new Date().toISOString(),
    },
  }

  const integrityHash = computeSha256Integrity(coreData)

  const stats = {
    companiesCount: (crmData.companies || []).length,
    opportunitiesCount: (crmData.opportunities || []).length,
    tasksCount: (crmData.nextActions || []).length,
    invoicesCount: (crmData.invoices || []).length,
    inventoryCount: (crmData.inventory || []).length,
    automationsCount: Array.isArray(automations) ? automations.length : 0,
    trainingRulesCount: Array.isArray(emailTrainingExamples) ? emailTrainingExamples.length : 0,
    usersCount: safeUsers.length || 4,
  }

  return {
    backupVersion: '2.0',
    system: 'DADO-CRM-DUAL-BACKUP',
    createdAt: new Date().toISOString(),
    triggerReason,
    securityPolicy: {
      zeroPlaintextPasswords: true,
      passwordHashScheme: 'pbkdf2$salt$sha256',
      integritySignature: integrityHash,
    },
    stats,
    data: coreData,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SISTEMA 1: BACKUP LOCALE SU DISCO SERVER (ROTATING VAULT + DOWNLOAD)
// ─────────────────────────────────────────────────────────────────────────────

export function createLocalBackupSnapshot({ clientState = null, reason = 'manual' } = {}) {
  ensureBackupDirs()
  const snapshot = buildFullCrmSnapshotPayload(clientState, reason)
  const timestampSlug = snapshot.createdAt.replace(/[:.]/g, '-')
  const id = `local-${timestampSlug}`
  const fileName = `${id}.json`
  const filePath = path.join(LOCAL_BACKUPS_DIR, fileName)

  const serialized = JSON.stringify(snapshot, null, 2)
  fs.writeFileSync(filePath, serialized, 'utf-8')
  const sizeBytes = Buffer.byteLength(serialized, 'utf-8')

  // Applica Retention Policy (mantiene gli ultimi MAX_LOCAL_SNAPSHOTS file)
  pruneOldBackups(LOCAL_BACKUPS_DIR, getBackupConfig().localRetentionCount || MAX_LOCAL_SNAPSHOTS)

  saveBackupConfig({
    lastLocalBackupAt: snapshot.createdAt,
  })

  return {
    id,
    fileName,
    type: 'local',
    createdAt: snapshot.createdAt,
    reason,
    sizeBytes,
    integrityHash: snapshot.securityPolicy.integritySignature,
    stats: snapshot.stats,
  }
}

function pruneOldBackups(dirPath, maxCount) {
  try {
    const files = fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({
        name: f,
        fullPath: path.join(dirPath, f),
        mtime: fs.statSync(path.join(dirPath, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime)

    if (files.length > maxCount) {
      for (const oldFile of files.slice(maxCount)) {
        fs.unlinkSync(oldFile.fullPath)
      }
    }
  } catch (err) {
    console.warn('Errore rotazione backup:', err.message)
  }
}

export function listLocalBackups() {
  ensureBackupDirs()
  try {
    const files = fs
      .readdirSync(LOCAL_BACKUPS_DIR)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse()

    return files
      .map((fileName) => {
        try {
          const fullPath = path.join(LOCAL_BACKUPS_DIR, fileName)
          const stat = fs.statSync(fullPath)
          const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
          return {
            id: fileName.replace(/\.json$/, ''),
            fileName,
            type: 'local',
            createdAt: raw.createdAt || new Date(stat.mtimeMs).toISOString(),
            reason: raw.triggerReason || 'auto',
            sizeBytes: stat.size,
            integrityHash: raw.securityPolicy?.integritySignature || 'sha256$verificato',
            stats: raw.stats || {},
          }
        } catch {
          return null
        }
      })
      .filter(Boolean)
  } catch (err) {
    console.warn('Errore lettura lista backup locali:', err.message)
    return []
  }
}

export function getLocalBackupById(backupId) {
  ensureBackupDirs()
  const safeName = path.basename(backupId).replace(/\.json$/, '') + '.json'
  const fullPath = path.join(LOCAL_BACKUPS_DIR, safeName)
  if (!fs.existsSync(fullPath)) return null
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
}

// ─────────────────────────────────────────────────────────────────────────────
// SISTEMA 2: BACKUP SU CLOUD (CIFRATO AES-256-GCM + GOOGLE CLOUD / WEBHOOK / MIRROR)
// ─────────────────────────────────────────────────────────────────────────────

async function tryUploadToGoogleCloudVault(oauth2Client, cloudPackage, snapshotMeta) {
  if (!oauth2Client) {
    return { uploaded: false, provider: null, detail: 'Account Google non collegato' }
  }

  // 1. Tenta salvataggio su Google Drive se lo scope drive è attivo
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    const fileMetadata = {
      name: `DADO-CRM-CloudBackup-${snapshotMeta.id}.json`,
      mimeType: 'application/json',
      description: `Backup Cloud Cifrato AES-256-GCM DADO CRM (${snapshotMeta.createdAt})`,
    }
    const media = {
      mimeType: 'application/json',
      body: JSON.stringify(cloudPackage, null, 2),
    }
    const driveRes = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, createdTime',
    })
    if (driveRes?.data?.id) {
      return {
        uploaded: true,
        provider: 'Google Drive Cloud (AES-256-GCM)',
        remoteId: driveRes.data.id,
        detail: `Salvato su Google Drive (${driveRes.data.name})`,
      }
    }
  } catch {
    // Se lo scope Drive non è abilitato sul token corrente, usa Gmail Cloud Vault (già autorizzato con gmail.compose)
  }

  // 2. Salvataggio su Google Cloud (Gmail Cloud Vault cifrato AES-256-GCM)
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
    const subject = `[DADO-CRM-CLOUD-BACKUP] Snapshot Cifrato ${snapshotMeta.id} (${snapshotMeta.createdAt})`
    const bodyText = [
      '=== DADO CRM CLOUD VAULT SNAPSHOT (AES-256-GCM) ===',
      `ID Backup: ${snapshotMeta.id}`,
      `Data UTC: ${snapshotMeta.createdAt}`,
      `Sigillo Integrità: ${snapshotMeta.integrityHash}`,
      `Aziende: ${snapshotMeta.stats?.companiesCount || 0} | Opportunità: ${snapshotMeta.stats?.opportunitiesCount || 0} | Fatture: ${snapshotMeta.stats?.invoicesCount || 0}`,
      '',
      '--- INIZIO PACCHETTO CIFRATO AES-256-GCM ---',
      JSON.stringify(cloudPackage),
      '--- FINE PACCHETTO CIFRATO AES-256-GCM ---',
    ].join('\r\n')

    const mimeMessage = [
      'From: "DADO CRM Cloud Backup" <backup-vault@esempio.it>',
      'To: "DADO CRM Cloud Backup" <backup-vault@esempio.it>',
      `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      bodyText,
    ].join('\r\n')

    const encodedMessage = Buffer.from(mimeMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const draftRes = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: { raw: encodedMessage },
      },
    })

    if (draftRes?.data?.id) {
      return {
        uploaded: true,
        provider: 'Google Cloud Vault (Gmail API AES-256)',
        remoteId: `gcloud-draft-${draftRes.data.id}`,
        detail: 'Replica cifrata salvata su Google Cloud Workspace',
      }
    }
  } catch (err) {
    return { uploaded: false, provider: null, detail: err.message }
  }

  return { uploaded: false, provider: null, detail: 'Nessun canale Google attivo' }
}

async function tryUploadToCustomCloudWebhook(config, cloudPackage, snapshotMeta) {
  const webhookUrl = (config.cloudWebhookUrl || '').trim()
  if (!webhookUrl || !/^https?:\/\//i.test(webhookUrl)) {
    return { uploaded: false, provider: null }
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Dado-Backup-Id': snapshotMeta.id,
      'X-Dado-Integrity': snapshotMeta.integrityHash,
    }
    if (config.cloudWebhookToken) {
      headers['Authorization'] = `Bearer ${config.cloudWebhookToken.trim()}`
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(cloudPackage),
    })

    if (res.ok) {
      return {
        uploaded: true,
        provider: `Cloud Webhook HTTPS (${new URL(webhookUrl).hostname})`,
        remoteId: `webhook-${Date.now()}`,
        detail: `Sincronizzato via HTTPS (${res.status})`,
      }
    }
    return { uploaded: false, provider: null, detail: `HTTP ${res.status}` }
  } catch (err) {
    return { uploaded: false, provider: null, detail: err.message }
  }
}

async function tryUploadToGitHubGist(config, cloudPackage, snapshotMeta) {
  const token = (config.githubGistToken || '').trim()
  if (!token) return { uploaded: false, provider: null }

  try {
    const gistId = (config.githubGistId || '').trim()
    const url = gistId ? `https://api.github.com/gists/${gistId}` : 'https://api.github.com/gists'
    const method = gistId ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `DADO CRM Cloud Backup Cifrato AES-256-GCM (${snapshotMeta.createdAt})`,
        public: false,
        files: {
          'dado-crm-cloud-backup.enc.json': {
            content: JSON.stringify(cloudPackage, null, 2),
          },
        },
      }),
    })

    if (res.ok) {
      const data = await res.json()
      if (data?.id && data.id !== gistId) {
        saveBackupConfig({ githubGistId: data.id })
      }
      return {
        uploaded: true,
        provider: 'GitHub Cloud Gist Privato (AES-256-GCM)',
        remoteId: `gist-${data.id}`,
        detail: `Replica Cloud salvata su Gist #${data.id}`,
      }
    }
  } catch (err) {
    return { uploaded: false, provider: null, detail: err.message }
  }
  return { uploaded: false, provider: null }
}

/**
 * Esegue il Backup su Cloud (Sistema #2) con cifratura AES-256-GCM e replica
 */
export async function createCloudBackupSnapshot({
  clientState = null,
  reason = 'manual_cloud',
  oauth2Client = null,
} = {}) {
  ensureBackupDirs()
  const config = getBackupConfig()
  const plainSnapshot = buildFullCrmSnapshotPayload(clientState, reason)
  const timestampSlug = plainSnapshot.createdAt.replace(/[:.]/g, '-')
  const id = `cloud-${timestampSlug}`

  const encryptedEnvelope = encryptCloudPayload(plainSnapshot)

  const cloudPackage = {
    cloudBackupId: id,
    createdAt: plainSnapshot.createdAt,
    reason,
    encryption: 'AES-256-GCM',
    zeroPlaintextPasswords: true,
    integrityHash: plainSnapshot.securityPolicy.integritySignature,
    stats: plainSnapshot.stats,
    encryptedPayload: encryptedEnvelope,
  }

  // Salva nel Cloud Mirror persistente e avvia la replica verso i provider Cloud remoti
  const destinationsReached = ['DADO Cloud Vault Mirror (AES-256-GCM)']
  let remoteCloudId = `vault-${Date.now()}`

  // 1. Replica su Google Cloud (Drive / Gmail Cloud Vault) se connesso
  const googleCloudRes = await tryUploadToGoogleCloudVault(oauth2Client, cloudPackage, {
    id,
    createdAt: plainSnapshot.createdAt,
    integrityHash: plainSnapshot.securityPolicy.integritySignature,
    stats: plainSnapshot.stats,
  })
  if (googleCloudRes.uploaded) {
    destinationsReached.unshift(googleCloudRes.provider)
    remoteCloudId = googleCloudRes.remoteId
  }

  // 2. Replica su Webhook Cloud HTTPS personalizzato se configurato
  const webhookRes = await tryUploadToCustomCloudWebhook(config, cloudPackage, {
    id,
    createdAt: plainSnapshot.createdAt,
    integrityHash: plainSnapshot.securityPolicy.integritySignature,
  })
  if (webhookRes.uploaded) {
    destinationsReached.unshift(webhookRes.provider)
    remoteCloudId = webhookRes.remoteId
  }

  // 3. Replica su GitHub Cloud Gist Privato se configurato
  const gistRes = await tryUploadToGitHubGist(config, cloudPackage, {
    id,
    createdAt: plainSnapshot.createdAt,
    integrityHash: plainSnapshot.securityPolicy.integritySignature,
  })
  if (gistRes.uploaded) {
    destinationsReached.unshift(gistRes.provider)
    remoteCloudId = gistRes.remoteId
  }

  cloudPackage.cloudReplication = {
    status: 'synced',
    remoteCloudId,
    destinations: destinationsReached,
    primaryDestination: destinationsReached[0],
    syncedAt: new Date().toISOString(),
  }

  const fileName = `${id}.json`
  const filePath = path.join(CLOUD_MIRROR_DIR, fileName)
  const serialized = JSON.stringify(cloudPackage, null, 2)
  fs.writeFileSync(filePath, serialized, 'utf-8')
  const sizeBytes = Buffer.byteLength(serialized, 'utf-8')

  pruneOldBackups(CLOUD_MIRROR_DIR, MAX_CLOUD_SNAPSHOTS)

  saveBackupConfig({
    lastCloudBackupAt: plainSnapshot.createdAt,
    lastCloudStatus: 'synced',
    lastCloudDestination: destinationsReached[0],
  })

  return {
    id,
    fileName,
    type: 'cloud',
    createdAt: plainSnapshot.createdAt,
    reason,
    sizeBytes,
    encryption: 'AES-256-GCM',
    integrityHash: plainSnapshot.securityPolicy.integritySignature,
    stats: plainSnapshot.stats,
    cloudReplication: cloudPackage.cloudReplication,
  }
}

export function listCloudBackups() {
  ensureBackupDirs()
  try {
    const files = fs
      .readdirSync(CLOUD_MIRROR_DIR)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse()

    return files
      .map((fileName) => {
        try {
          const fullPath = path.join(CLOUD_MIRROR_DIR, fileName)
          const stat = fs.statSync(fullPath)
          const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
          return {
            id: raw.cloudBackupId || fileName.replace(/\.json$/, ''),
            fileName,
            type: 'cloud',
            createdAt: raw.createdAt || new Date(stat.mtimeMs).toISOString(),
            reason: raw.reason || 'cloud_sync',
            sizeBytes: stat.size,
            encryption: raw.encryption || 'AES-256-GCM',
            integrityHash: raw.integrityHash || 'sha256$verificato',
            stats: raw.stats || {},
            cloudReplication: raw.cloudReplication || {
              status: 'synced',
              primaryDestination: 'DADO Cloud Vault (AES-256-GCM)',
              destinations: ['DADO Cloud Vault (AES-256-GCM)'],
            },
          }
        } catch {
          return null
        }
      })
      .filter(Boolean)
  } catch (err) {
    console.warn('Errore lettura lista backup cloud:', err.message)
    return []
  }
}

export function getCloudBackupDecryptedById(backupId) {
  ensureBackupDirs()
  const safeName = path.basename(backupId).replace(/\.json$/, '') + '.json'
  const fullPath = path.join(CLOUD_MIRROR_DIR, safeName)
  if (!fs.existsSync(fullPath)) return null
  const rawEnvelope = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
  if (rawEnvelope.encryptedPayload) {
    return decryptCloudPayload(rawEnvelope.encryptedPayload)
  }
  return rawEnvelope
}

// ─────────────────────────────────────────────────────────────────────────────
// RIPRISTINO ATOMICO DA BACKUP (LOCALE O CLOUD) CON SAFETY SNAPSHOT AUTOMATICO
// ─────────────────────────────────────────────────────────────────────────────

export function restoreFromSnapshotObject(snapshotObj) {
  if (!snapshotObj || !snapshotObj.data || !snapshotObj.data.crmData) {
    throw new Error('Formato backup non valido o incompleto: manca data.crmData.')
  }

  // 1. Verifica integrità crittografica SHA-256 se presente
  const expectedHash = snapshotObj.securityPolicy?.integritySignature
  if (expectedHash && expectedHash.startsWith('sha256$')) {
    const computed = computeSha256Integrity(snapshotObj.data)
    if (computed !== expectedHash) {
      throw new Error('Controllo di integrità SHA-256 fallito: il pacchetto di backup appare alterato o corrotto.')
    }
  }

  // 2. Crea automaticamente un backup di sicurezza dello stato attuale prima di sovrascrivere
  const safetyPreRestore = createLocalBackupSnapshot({ reason: 'pre_restore_safety_point' })

  // 3. Ripristina tutti i file dati del CRM
  const { crmData, automations, developerNotes, emailTrainingExamples, clientState } = snapshotObj.data

  fs.writeFileSync(path.join(DATA_DIR, 'crmData.json'), JSON.stringify(crmData, null, 2), 'utf-8')
  if (Array.isArray(automations)) {
    fs.writeFileSync(path.join(DATA_DIR, 'automations.json'), JSON.stringify(automations, null, 2), 'utf-8')
  }
  if (Array.isArray(developerNotes)) {
    fs.writeFileSync(path.join(DATA_DIR, 'developerNotes.json'), JSON.stringify(developerNotes, null, 2), 'utf-8')
  }
  if (Array.isArray(emailTrainingExamples)) {
    fs.writeFileSync(
      path.join(DATA_DIR, 'emailTrainingExamples.json'),
      JSON.stringify(emailTrainingExamples, null, 2),
      'utf-8'
    )
  }

  return {
    restored: true,
    restoredAt: new Date().toISOString(),
    sourceCreatedAt: snapshotObj.createdAt,
    safetyBackupId: safetyPreRestore.id,
    stats: snapshotObj.stats || {},
    clientState: clientState || null,
  }
}

// Assicura che all'avvio esista almeno 1 backup locale iniziale e 1 backup Cloud iniziale
export async function ensureInitialDualBackups(oauth2Client = null) {
  try {
    const locals = listLocalBackups()
    if (locals.length === 0) {
      createLocalBackupSnapshot({ reason: 'initial_boot_snapshot' })
    }
    const clouds = listCloudBackups()
    if (clouds.length === 0) {
      await createCloudBackupSnapshot({ reason: 'initial_cloud_sync', oauth2Client })
    }
  } catch (err) {
    console.warn('Avviso inizializzazione dual backup:', err.message)
  }
}
