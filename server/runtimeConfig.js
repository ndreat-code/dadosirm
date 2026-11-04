import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

// ─────────────────────────────────────────────────────────────
// CONFIGURAZIONE RUNTIME (locale + hosting cloud)
// In locale i default riproducono il comportamento storico:
//   dati in server/data, credenziali/token nella root, URL http://localhost:3000.
// In cloud si impostano DATA_DIR (disco persistente) e PUBLIC_URL.
// ─────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const ROOT_DIR = path.resolve(__dirname, '..')
export const BUNDLED_DATA_DIR = path.join(__dirname, 'data')

// .env locale (in cloud non esiste: si usano le variabili d'ambiente del servizio)
dotenv.config({ path: path.join(ROOT_DIR, '.env') })

const customDataDir = (process.env.DATA_DIR || '').trim()

// Cartella dei dati scrivibili (crmData.json, automazioni, note, token Google)
export const DATA_DIR = customDataDir ? path.resolve(customDataDir) : BUNDLED_DATA_DIR

// Cartella di credentials.json e tokens.json
export const STATE_DIR = customDataDir ? DATA_DIR : ROOT_DIR

// Porta del server (le piattaforme cloud impongono PORT)
export const PORT = Number(process.env.PORT) || 3001

// URL pubblico dell'app, usato per OAuth Google e redirect
export const PUBLIC_URL = (process.env.PUBLIC_URL || 'http://localhost:3000').trim().replace(/\/+$/, '')
export const IS_PUBLIC_DEPLOY = !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(PUBLIC_URL)

// Sincronizzazione automatica Gmail + analisi AI ogni 60 secondi: DISATTIVATA di default.
// Gmail e Gemini vengono consultati solo quando si preme "Aggiorna" (consumo a richiesta).
// Per riattivarla: ENABLE_AUTO_SYNC=true nel .env
export const ENABLE_AUTO_SYNC = /^(1|true|yes)$/i.test(process.env.ENABLE_AUTO_SYNC || '')

// ── Primo avvio su disco persistente ────────────────────────────
// Copia i dati iniziali solo se mancano: i dati già presenti sul disco non vengono mai sovrascritti.
if (customDataDir) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    const seedFiles = ['crmData.json', 'automations.json', 'developerNotes.json', 'emailTrainingExamples.json']
    for (const name of seedFiles) {
      const src = path.join(BUNDLED_DATA_DIR, name)
      const dst = path.join(DATA_DIR, name)
      if (!fs.existsSync(dst) && fs.existsSync(src)) {
        fs.copyFileSync(src, dst)
        console.log(`📦 [BOOTSTRAP] Dato iniziale copiato: ${name}`)
      }
    }

    // Credenziali e token Google passati come variabili d'ambiente (JSON), scritti solo se mancano
    const seedFromEnv = (envName, fileName) => {
      const raw = (process.env[envName] || '').trim()
      const dst = path.join(STATE_DIR, fileName)
      if (!raw || fs.existsSync(dst)) return
      try {
        JSON.parse(raw)
        fs.writeFileSync(dst, raw, { encoding: 'utf-8', mode: 0o600 })
        console.log(`🔐 [BOOTSTRAP] ${fileName} creato da ${envName}`)
      } catch {
        console.error(`❌ [BOOTSTRAP] ${envName} non è un JSON valido`)
      }
    }
    seedFromEnv('GOOGLE_CREDENTIALS_JSON', 'credentials.json')
    seedFromEnv('GOOGLE_TOKENS_JSON', 'tokens.json')
  } catch (err) {
    console.error('❌ [BOOTSTRAP] Errore preparazione DATA_DIR:', err)
  }
}
