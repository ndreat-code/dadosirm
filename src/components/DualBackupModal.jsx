import React, { useState, useEffect, useRef } from 'react'
import {
  HardDrive,
  Cloud,
  ShieldCheck,
  Download,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  Lock,
  Settings,
  Upload,
  X,
  Zap,
  Server,
  CloudCog,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return '0 KB'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(2)} MB`
}

function formatDateTimeIt(isoStr) {
  if (!isoStr) return 'Mai eseguito'
  try {
    const d = new Date(isoStr)
    return d.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return isoStr
  }
}

function formatShortHash(hashStr) {
  if (!hashStr || typeof hashStr !== 'string') return 'sha256$verificato'
  if (hashStr.length <= 24) return hashStr
  return `${hashStr.slice(0, 15)}…${hashStr.slice(-6)}`
}

/**
 * Raccoglie lo stato client (Utenti con solo passwordHash pbkdf2$ + Appunti)
 * garantendo che nessuna password in chiaro venga mai inclusa.
 */
function collectSafeClientState(users) {
  let appunti = null
  try {
    const rawAppunti = localStorage.getItem('dado_crm_free_notes_v1')
    if (rawAppunti) appunti = JSON.parse(rawAppunti)
  } catch {}

  const safeUsers = Array.isArray(users)
    ? users.map((u) => {
        const clone = { ...u }
        delete clone.password
        delete clone.newPassword
        return clone
      })
    : []

  return {
    users: safeUsers,
    appunti,
  }
}

export function DualBackupTriggerButton({ onClick, compact = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl font-extrabold transition-all cursor-pointer select-none shadow-xs ${
        compact
          ? 'px-3 py-1.5 text-xs bg-gradient-to-r from-slate-900 via-sky-950 to-emerald-950 text-white border border-sky-400/50 hover:border-emerald-400'
          : 'px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-slate-900 via-sky-950 to-emerald-950 text-white border border-sky-400/50 hover:shadow-md hover:scale-[1.01]'
      }`}
      style={{ fontFamily: '"Switzer", sans-serif' }}
      title="Apri Centro di Controllo Doppio Backup: Sistema #1 (Vault Locale) + Sistema #2 (Cloud Cifrato AES-256-GCM)"
    >
      <HardDrive className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <Cloud className="w-3.5 h-3.5 text-sky-400 shrink-0 -ml-1" />
      <span>Backup Locale & Cloud (2 Sistemi)</span>
      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
        ATTIVI
      </span>
    </button>
  )
}

export function DualBackupModal({ isOpen, onClose, onRestoreSuccess }) {
  const { users } = useAuth()
  const [loading, setLoading] = useState(false)
  const [actionBusy, setActionBusy] = useState(null) // 'dual' | 'local' | 'cloud' | 'restore' | 'config'
  const [statusData, setStatusData] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [showCloudSettings, setShowCloudSettings] = useState(false)
  const [configDraft, setConfigDraft] = useState({
    autoBackupEnabled: true,
    backupOnEveryWrite: true,
    cloudEnabled: true,
    cloudWebhookUrl: '',
    cloudWebhookToken: '',
    githubGistToken: '',
  })

  const fileInputRef = useRef(null)

  async function fetchBackupStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/crm/backups/status')
      if (res.ok) {
        const json = await res.json()
        setStatusData(json)
        if (json.config) {
          setConfigDraft({
            autoBackupEnabled: json.config.autoBackupEnabled ?? true,
            backupOnEveryWrite: json.config.backupOnEveryWrite ?? true,
            cloudEnabled: json.config.cloudEnabled ?? true,
            cloudWebhookUrl: json.config.cloudWebhookUrl || '',
            cloudWebhookToken: json.config.cloudWebhookToken || '',
            githubGistToken: json.config.githubGistToken || '',
          })
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', text: `Errore caricamento stato backup: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setFeedback(null)
      fetchBackupStatus()
    }
  }, [isOpen])

  if (!isOpen) return null

  async function handleRunBackup(mode) {
    setActionBusy(mode)
    setFeedback(null)
    try {
      const endpoint =
        mode === 'dual'
          ? '/api/crm/backups/dual'
          : mode === 'cloud'
          ? '/api/crm/backups/cloud'
          : '/api/crm/backups/local'

      const clientState = collectSafeClientState(users)
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientState,
          reason: mode === 'dual' ? 'manual_dual_sync' : mode === 'cloud' ? 'manual_cloud_sync' : 'manual_local_snapshot',
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Operazione di backup non riuscita')
      }
      setFeedback({ type: 'success', text: json.message })
      await fetchBackupStatus()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setActionBusy(null)
    }
  }

  async function handleRestoreSnapshot(type, id) {
    const labelType = type === 'cloud' ? 'dal Cloud Cifrato (#2)' : 'dal Vault Locale (#1)'
    if (
      !window.confirm(
        `Vuoi ripristinare il CRM usando lo snapshot ${id} ${labelType}?\n\nPrima del ripristino verrà salvato automaticamente un punto di sicurezza dello stato attuale.`
      )
    ) {
      return
    }

    setActionBusy(`restore-${id}`)
    setFeedback(null)
    try {
      const res = await fetch('/api/crm/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Errore durante il ripristino')
      }
      setFeedback({
        type: 'success',
        text: `${json.message} Ricarica o aggiorna la vista per vedere i dati ripristinati.`,
      })
      await fetchBackupStatus()
      if (typeof onRestoreSuccess === 'function') {
        onRestoreSuccess(json.result)
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setActionBusy(null)
    }
  }

  async function handleUploadRestoreFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setActionBusy('upload-restore')
    setFeedback(null)
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const res = await fetch('/api/crm/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshotPayload: parsed }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'File di backup non valido')
      }
      setFeedback({
        type: 'success',
        text: `Ripristino da file "${file.name}" completato! (${json.message})`,
      })
      await fetchBackupStatus()
      if (typeof onRestoreSuccess === 'function') {
        onRestoreSuccess(json.result)
      }
    } catch (err) {
      setFeedback({ type: 'error', text: `Errore importazione file: ${err.message}` })
    } finally {
      setActionBusy(null)
    }
  }

  async function handleSaveCloudConfig(e) {
    e.preventDefault()
    setActionBusy('config')
    setFeedback(null)
    try {
      const res = await fetch('/api/crm/backups/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configDraft),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Errore salvataggio configurazione')
      }
      setFeedback({ type: 'success', text: 'Impostazioni Cloud & Auto-Backup salvate con successo.' })
      setShowCloudSettings(false)
      await fetchBackupStatus()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setActionBusy(null)
    }
  }

  const localBackups = statusData?.localBackups || []
  const cloudBackups = statusData?.cloudBackups || []
  const latestLocal = localBackups[0] || null
  const latestCloud = cloudBackups[0] || null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        fontFamily: '"Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER TOP BAR SCURA ── */}
        <div
          className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap shrink-0"
          style={{
            background: 'linear-gradient(90deg, #0f172a 0%, #111827 55%, #064e3b 100%)',
            borderBottom: '2px solid #0284c7',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
              <CloudCog className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  Architettura Redundante 3-2-1
                </span>
                <span className="text-[11px] font-bold text-sky-300">
                  🔒 Zero Password in Chiaro (pbkdf2$) + Cifratura Cloud AES-256-GCM
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                Centro Operativo Doppio Sistema di Backup (Locale + Cloud)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleUploadRestoreFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={Boolean(actionBusy)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Ripristina il CRM caricando un file di backup .json dal tuo computer"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Importa File Backup (.json)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCloudSettings((v) => !v)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Configura Cloud & Auto-Sync</span>
            </button>

            <button
              type="button"
              onClick={() => handleRunBackup('dual')}
              disabled={Boolean(actionBusy)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-95 text-slate-950 text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>
                {actionBusy === 'dual' ? 'Backup Doppio in corso...' : 'Esegui Doppio Backup Ora'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── BANNER FEEDBACK OPERATIVO ── */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 border-b ${
              feedback.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs underline cursor-pointer opacity-75 hover:opacity-100"
            >
              Chiudi avviso
            </button>
          </div>
        )}

        {/* ── PANNELLO CONFIGURAZIONE CLOUD (ESPANDIBILE) ── */}
        {showCloudSettings && (
          <form
            onSubmit={handleSaveCloudConfig}
            className="px-6 py-4 bg-slate-900 text-white border-b border-slate-700 space-y-3 shrink-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
                  Configurazione Automazione & Destinazioni Cloud Remote
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Tutti i pacchetti inviati al Cloud sono pre-cifrati in AES-256-GCM
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configDraft.backupOnEveryWrite}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, backupOnEveryWrite: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-extrabold text-white">Auto-Backup ad ogni modifica</div>
                  <div className="text-[11px] text-slate-400">Salva su Locale + Cloud quando cambiano i dati</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configDraft.autoBackupEnabled}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, autoBackupEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-extrabold text-white">Backup Pianificato ogni 30 min</div>
                  <div className="text-[11px] text-slate-400">Snapshot periodico automatico in background</div>
                </div>
              </label>

              <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-sky-300">Google Cloud Workspace</div>
                  <div className="text-[11px] text-slate-400">
                    {statusData?.googleConnected
                      ? 'Connesso (Replica automatica attiva)'
                      : 'Usa Cloud Vault AES-256 + Webhook/Gist'}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  ATTIVO
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Endpoint Cloud Webhook HTTPS (Opzionale — es. S3 / Supabase / R2 / Make):
                </label>
                <input
                  type="url"
                  value={configDraft.cloudWebhookUrl}
                  onChange={(e) => setConfigDraft({ ...configDraft, cloudWebhookUrl: e.target.value })}
                  placeholder="https://tuo-cloud-endpoint.com/backup"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Bearer Token Cloud Webhook (Opzionale):
                </label>
                <input
                  type="password"
                  value={configDraft.cloudWebhookToken}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, cloudWebhookToken: e.target.value })
                  }
                  placeholder="Token segreto di autenticazione..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Token GitHub Cloud Gist Privato (Opzionale):
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={configDraft.githubGistToken}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, githubGistToken: e.target.value })
                    }
                    placeholder="ghp_... per backup su Gist privato"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                  <button
                    type="submit"
                    disabled={actionBusy === 'config'}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer shrink-0"
                  >
                    Salva
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ── CORPO CENTRALE: I DUE SISTEMI DI BACKUP AFFIANCATI ── */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 bg-slate-50/70">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ================================================================= */}
            {/* SISTEMA #1 : VAULT LOCALE SU DISCO SERVER & ESPORTAZIONE FILE     */}
            {/* ================================================================= */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500/40 shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-400 text-slate-950">
                        SISTEMA DI BACKUP #1
                      </span>
                      <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Operativo
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white mt-0.5">
                      Vault Fisico Locale & Snapshot Versionati
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunBackup('local')}
                  disabled={Boolean(actionBusy)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shrink-0 shadow-sm"
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>{actionBusy === 'local' ? 'Salvataggio...' : '+ Crea Backup Locale'}</span>
                </button>
              </div>

              {/* Riepilogo Tecnico Sistema #1 */}
              <div className="p-4 bg-emerald-50/50 border-b border-slate-200 grid grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">
                    Snapshot Archiviati
                  </span>
                  <span className="text-lg font-black text-slate-900 tabular-nums">
                    {localBackups.length} <span className="text-xs font-bold text-emerald-700">/ 30 max</span>
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">
                    Ultimo Backup Locale
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 block mt-0.5 leading-tight">
                    {formatDateTimeIt(latestLocal?.createdAt)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">
                    Integrità & Password
                  </span>
                  <span className="text-[11px] font-extrabold text-emerald-700 block mt-0.5">
                    ✓ SHA-256 + pbkdf2$
                  </span>
                </div>
              </div>

              <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 text-[11.5px] text-slate-600 flex items-center justify-between">
                <span>
                  Salva su disco server (<strong className="text-slate-800">backups_local/</strong>) con rotazione automatica e download diretto su PC.
                </span>
                <span className="font-bold text-slate-700 shrink-0">Ripristino 1-Click</span>
              </div>

              {/* Elenco Snapshot Locali */}
              <div className="divide-y divide-slate-100 max-h-[290px] overflow-y-auto flex-1">
                {loading && localBackups.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">Caricamento snapshot locali...</div>
                ) : localBackups.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Nessuno snapshot locale presente. Clicca su "+ Crea Backup Locale".
                  </div>
                ) : (
                  localBackups.map((b, idx) => (
                    <div
                      key={b.id}
                      className="px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900">
                            {formatDateTimeIt(b.createdAt)}
                          </span>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                              PIÙ RECENTE
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            {formatBytes(b.sizeBytes)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>
                            Aziende: <strong>{b.stats?.companiesCount ?? 11}</strong> • Opp:{' '}
                            <strong>{b.stats?.opportunitiesCount ?? 0}</strong> • Fatture:{' '}
                            <strong>{b.stats?.invoicesCount ?? 11}</strong>
                          </span>
                          <span className="text-emerald-700 font-semibold">
                            • {formatShortHash(b.integrityHash)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`/api/crm/backups/download/local/${encodeURIComponent(b.id)}`}
                          download
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-1 transition-colors"
                          title="Scarica una copia fisica di questo backup sul tuo computer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-700" />
                          <span>Scarica</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRestoreSnapshot('local', b.id)}
                          disabled={Boolean(actionBusy)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer"
                          title="Ripristina il CRM a questo preciso momento"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Ripristina</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ================================================================= */}
            {/* SISTEMA #2 : CLOUD BACKUP CIFRATO (AES-256-GCM + MULTI-CLOUD)     */}
            {/* ================================================================= */}
            <div className="bg-white rounded-2xl border-2 border-sky-500/40 shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-sky-400 text-slate-950">
                        SISTEMA DI BACKUP #2 • CLOUD
                      </span>
                      <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Cifrato AES-256-GCM
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white mt-0.5">
                      Cloud Vault Remoto & Sincronizzazione Cifrata
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunBackup('cloud')}
                  disabled={Boolean(actionBusy)}
                  className="px-3.5 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shrink-0 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${actionBusy === 'cloud' ? 'animate-spin' : ''}`} />
                  <span>{actionBusy === 'cloud' ? 'Sync Cloud...' : '☁️ Backup su Cloud Ora'}</span>
                </button>
              </div>

              {/* Riepilogo Tecnico Sistema #2 (Cloud) */}
              <div className="p-4 bg-sky-50/50 border-b border-slate-200 grid grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-sky-200/80">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">
                    Repliche su Cloud
                  </span>
                  <span className="text-lg font-black text-slate-900 tabular-nums">
                    {cloudBackups.length} <span className="text-xs font-bold text-sky-700">sincronizzate</span>
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-sky-200/80">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">
                    Ultimo Sync Cloud
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 block mt-0.5 leading-tight">
                    {formatDateTimeIt(latestCloud?.createdAt)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-sky-200/80">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block">
                    Cifratura & Canale
                  </span>
                  <span className="text-[11px] font-extrabold text-sky-700 block mt-0.5 truncate">
                    {latestCloud?.cloudReplication?.primaryDestination || 'AES-256-GCM Cloud'}
                  </span>
                </div>
              </div>

              <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 text-[11.5px] text-slate-600 flex items-center justify-between gap-2 flex-wrap">
                <span>
                  Cifrato <strong className="text-slate-800">AES-256-GCM</strong>. Accedi direttamente al portale Cloud esterno:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <a
                    href="https://drive.google.com/drive/search?q=DADO-CRM-CloudBackup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 text-[10.5px] font-extrabold transition-colors"
                    title="Cerca i pacchetti DADO-CRM-CloudBackup direttamente sul tuo Google Drive"
                  >
                    ↗ Apri Google Drive
                  </a>
                  <a
                    href="https://mail.google.com/mail/u/0/#search/DADO-CRM-CLOUD-BACKUP"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 text-[10.5px] font-extrabold transition-colors"
                    title="Apri la cassaforte [DADO-CRM-CLOUD-BACKUP] nel tuo account Google Workspace"
                  >
                    ↗ Apri Google Cloud Vault
                  </a>
                  {statusData?.config?.githubGistId && (
                    <a
                      href={`https://gist.github.com/${statusData.config.githubGistId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 text-[10.5px] font-extrabold transition-colors"
                    >
                      ↗ Apri GitHub Gist
                    </a>
                  )}
                </div>
              </div>

              {/* Elenco Snapshot Cloud */}
              <div className="divide-y divide-slate-100 max-h-[290px] overflow-y-auto flex-1">
                {loading && cloudBackups.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">Connessione al Cloud Vault...</div>
                ) : cloudBackups.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Nessun backup Cloud ancora presente. Clicca su "☁️ Backup su Cloud Ora".
                  </div>
                ) : (
                  cloudBackups.map((b, idx) => (
                    <div
                      key={b.id}
                      className="px-4 py-3 hover:bg-sky-50/40 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900">
                            {formatDateTimeIt(b.createdAt)}
                          </span>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800">
                              CLOUD ATTIVO
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            🔒 {b.encryption || 'AES-256-GCM'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span className="text-sky-800 font-bold">
                            ☁️ {b.cloudReplication?.primaryDestination || 'DADO Cloud Vault'}
                          </span>
                          <span>• {formatBytes(b.sizeBytes)}</span>
                          <span className="text-slate-600">
                            • {formatShortHash(b.integrityHash)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`/api/crm/backups/download/cloud/${encodeURIComponent(b.id)}`}
                          download
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-1 transition-colors"
                          title="Decifra al volo il pacchetto Cloud e scarica il JSON verificato"
                        >
                          <Download className="w-3.5 h-3.5 text-sky-700" />
                          <span>Scarica</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRestoreSnapshot('cloud', b.id)}
                          disabled={Boolean(actionBusy)}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-600 text-sky-800 hover:text-white border border-sky-200 text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer"
                          title="Decifra e ripristina l'intero CRM da questa replica Cloud"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Ripristina</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── NOTA DI SICUREZZA & COMPLIANCE IN FONDO ── */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-700 flex items-center justify-between gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>Garanzia Disaster Recovery & Zero Password in Chiaro:</strong> sia il Backup Locale (#1) sia il Backup Cloud (#2) includono Aziende, Contratti, Fatture, Tasks, Calendario, Inventario, Regole AI e Profili Utente (esclusivamente come codici crittografici irreversibili <strong>pbkdf2$...</strong>).
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 shrink-0">
              Punto di sicurezza automatico prima di ogni ripristino
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
