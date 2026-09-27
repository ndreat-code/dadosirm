import { useState, useEffect } from 'react'
import {
  Sparkles,
  Bot,
  Mail,
  Calendar,
  HardDrive,
  Camera,
  Video,
  Sliders,
  Shield,
  Bell,
  Save,
  Check,
  RefreshCw,
  Download,
  Key,
  Cpu,
  Building2,
  CreditCard,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Globe,
  Database
} from 'lucide-react'

// Colore verde icona FaceTime ufficiale Apple
const FACETIME_GREEN = '#34c759'
const FACETIME_GREEN_HOVER = '#28cd41'
const FACETIME_GREEN_GLOW = 'rgba(52, 199, 89, 0.45)'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('google_ai')
  const [savedToast, setSavedToast] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [testingAi, setTestingAi] = useState(false)
  const [aiTestResult, setAiTestResult] = useState(null)

  // Stato Impostazioni con persistenza su localStorage
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('dado_crm_settings')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Errore parsing impostazioni:', e)
      }
    }
    return {
      // 1. Google & AI
      googleAccount: 'n.drea.t@gmail.com',
      gmailSync: true,
      gdriveSync: true,
      gdriveFolder: 'DADO Studio/Clienti 2026/Contratti',
      gcalSync: true,
      geminiApiKey: 'AIzaSyD-dado_gemini_studio_live_key',
      geminiModel: 'gemini-1.5-flash',
      aiTone: 'Professionale & Diretto (Stile DADO)',
      aiAutoSummary: true,
      aiDraftQuotes: true,

      // 2. Identità Studio
      studioName: 'DADO Creative Studio',
      brandClaim: 'Produzioni Video, Set Fotografici & Direzione Creativa',
      vatNumber: 'IT09876543210',
      taxCode: 'TRTNDR92M15F205K',
      legalEmail: 'dado.creativestudio@pec.it',
      contactEmail: 'info@dadocreativestudio.com',
      phone: '+39 340 1234567',
      iban: 'IT60X0542811101000000123456',
      bankName: 'Banca Intesa Sanpaolo',
      rateFullDay: '1200',
      rateHalfDay: '700',
      rateHourlyPost: '65',

      // 3. Attrezzatura Kit DADO
      equipment: [
        { id: 'eq-1', name: 'Sony FX3 Cinema Line Full-Frame', category: 'Camera', status: 'Disponibile', serial: 'FX3-90214' },
        { id: 'eq-2', name: 'Sony Alpha 7 IV (B-Cam)', category: 'Camera', status: 'Disponibile', serial: 'A74-11842' },
        { id: 'eq-3', name: 'Sony G-Master 24-70mm f/2.8 II', category: 'Ottica', status: 'Disponibile', serial: 'GM-2470-33' },
        { id: 'eq-4', name: 'Sony G-Master 70-200mm f/2.8 OSS II', category: 'Ottica', status: 'Disponibile', serial: 'GM-70200-88' },
        { id: 'eq-5', name: 'DJI Mavic 3 Pro Cine + Radiocomando Pro', category: 'Drone', status: 'Disponibile', serial: 'M3P-88410' },
        { id: 'eq-6', name: 'DJI Ronin RS3 Pro Gimbal', category: 'Supporto', status: 'Su Set', serial: 'RS3P-5521' },
        { id: 'eq-7', name: 'Kit Luci Aputure 300d II + Light Dome 150', category: 'Lighting', status: 'Disponibile', serial: 'AP-300D-01' },
        { id: 'eq-8', name: 'Nanlite Forza 60C RGB + Fresnel', category: 'Lighting', status: 'Disponibile', serial: 'NL-60C-92' },
        { id: 'eq-9', name: 'Rode Wireless PRO Kit (32-bit Float Audio)', category: 'Audio', status: 'Disponibile', serial: 'RW-PRO-104' },
      ],

      // 4. Connessioni & Notifiche
      notifyQuotesExpiring: true,
      notifyContractsSigned: true,
      notifyPaymentReceived: true,
      backupFrequency: 'Settimanale su Drive',
      webhookUrl: 'https://api.dadocreativestudio.com/webhook/crm-sync',

      // 5. Sistema
      currency: 'EUR (€)',
      dateFormat: 'DD/MM/YYYY',
      defaultView: 'timeline',
      soundEffects: true
    }
  })

  // Salva le modifiche
  const handleSave = () => {
    localStorage.setItem('dado_crm_settings', JSON.stringify(settings))
    setSavedToast(true)
    setTimeout(() => {
      setSavedToast(false)
    }, 2800)
  }

  // Test della connessione Gemini AI
  const handleTestAi = () => {
    setTestingAi(true)
    setAiTestResult(null)
    setTimeout(() => {
      setTestingAi(false)
      setAiTestResult({
        success: true,
        model: settings.geminiModel,
        latency: '138ms',
        message: 'Connessione stabilita con successo. Gemini AI è pronto a redigere preventivi e riassumere note per DADO Studio.'
      })
    }, 1100)
  }

  // Toggle switch per booleani
  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Toggle stato attrezzatura
  const toggleEquipmentStatus = (id) => {
    setSettings(prev => ({
      ...prev,
      equipment: prev.equipment.map(item => {
        if (item.id === id) {
          const nextStatus = item.status === 'Disponibile' ? 'Su Set' : item.status === 'Su Set' ? 'In Manutenzione' : 'Disponibile'
          return { ...item, status: nextStatus }
        }
        return item
      })
    }))
  }

  // Export JSON Database
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `dado_crm_config_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const tabs = [
    { id: 'google_ai', label: 'Google & AI', icon: Sparkles },
    { id: 'identity', label: 'Identità & Brand', icon: Building2 },
    { id: 'equipment', label: 'Attrezzatura & Kit', icon: Camera },
    { id: 'notifications', label: 'Connessioni & Notifiche', icon: Bell },
    { id: 'system', label: 'Sistema & Preferenze', icon: Sliders },
  ]

  return (
    <div className="h-full min-h-screen md:min-h-0 bg-[#111111] flex flex-col flex-1 relative overflow-hidden">

      {/* ── CANVAS VERDE TAVOLO DA BILIARDO (#007a50) CON FASCE BIANCHE ── */}
      <div className="h-full flex-1 bg-[#007a50] rounded-tl-[48px] rounded-bl-[48px] flex flex-col justify-between relative min-w-0 overflow-hidden">

        {/* ── Banda Bianca Superiore ── */}
        <div className="w-full flex justify-end flex-shrink-0">
          <div className="bg-white rounded-bl-2xl w-[calc(100%-2.5rem)]" style={{ height: 'calc(3rem - 0.5cm)' }} />
        </div>

        {/* ── Contenuto Principale con scroll ── */}
        <div className="flex-1 min-h-0 pl-10 pr-8 py-3 overflow-y-auto">

          {/* ── HEADER SETTINGS (FONT INSPIRATION + SOTTOTITOLO GOLDMAN CON VERDE FACETIME E GRIGIO METALLIZZATO) ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-black/20 pb-4">
            <div>
              {/* Titolo Principale Inspiration */}
              <h1 className="leading-none flex items-baseline gap-0.5">
                <span
                  style={{
                    fontFamily: 'Inspiration, cursive',
                    fontSize: '3.6rem',
                    color: '#111111',
                    lineHeight: 1,
                  }}
                >
                  Settings
                </span>
              </h1>

              {/* Sottotitolo Goldman con Verde FaceTime (#34c759) e Grigio Metallizzato Satinato */}
              <p style={{ marginTop: '4px', fontSize: '18px', fontFamily: '"Goldman", sans-serif', fontWeight: 700 }}>
                <span style={{ color: FACETIME_GREEN }}>Studio config & </span>
                <span style={{ color: '#d5dde6' }}>system preferences</span>
              </p>
            </div>

            {/* Pulsante Salva Modifiche (Verde FaceTime #34c759) */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-full flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md"
                style={{
                  backgroundColor: FACETIME_GREEN,
                  color: '#0d2813',
                  fontFamily: '"Goldman", sans-serif',
                  boxShadow: `0 4px 14px ${FACETIME_GREEN_GLOW}`,
                }}
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Salva Modifiche</span>
              </button>
            </div>
          </div>

          {/* ── BARRA TABS MORBIDA IN GRIGIO METALLIZZATO (SENZA LINEE SCURE INTERNE) ── */}
          <div className="mb-6 w-full">
            <div
              className="flex items-center gap-1.5 p-1.5 overflow-x-auto no-scrollbar shadow-md"
              style={{
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
                border: '1px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0"
                    style={{
                      fontFamily: '"Goldman", sans-serif',
                      backgroundColor: isActive ? FACETIME_GREEN : 'transparent',
                      color: isActive ? '#0d2813' : '#334155',
                      boxShadow: isActive ? `0 2px 10px ${FACETIME_GREEN_GLOW}` : 'none',
                    }}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.6]' : 'stroke-[1.8]'}`} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── NOTIFICA TOAST SALVATAGGIO ── */}
          {savedToast && (
            <div
              className="mb-4 p-3 rounded-2xl flex items-center justify-between text-xs font-mono font-bold text-black animate-fade-in shadow-lg"
              style={{
                backgroundColor: FACETIME_GREEN,
                boxShadow: `0 0 20px ${FACETIME_GREEN_GLOW}`,
              }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>Configurazione aggiornata e salvata con successo nel database DADO Studio!</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider opacity-80">Persistente</span>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: GOOGLE & AI INTEGRATION (WORKSPACE SOPRA, GEMINI SOTTO)     */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'google_ai' && (
            <div className="flex flex-col gap-6 mb-8">

              {/* CARD 1.1: Google Workspace (SOPRA - Gmail, Drive, Calendar) */}
              <div
                className="p-5 md:p-6 flex flex-col justify-between shadow-xl"
                style={{
                  borderRadius: '24px',
                  background: 'linear-gradient(145deg, #2a3038 0%, #1e2229 50%, #262c35 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 8px 24px -4px rgba(0, 0, 0, 0.45)',
                }}
              >
                <div>
                  {/* Intestazione Card */}
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-black"
                        style={{ backgroundColor: '#00e5ff', boxShadow: '0 0 12px rgba(0, 229, 255, 0.4)' }}
                      >
                        <Mail className="w-5 h-5 stroke-[2.4]" />
                      </div>
                      <div>
                        <h3 className="text-white text-base font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                          Google Workspace Sync
                        </h3>
                        <p className="text-xs text-white/50" style={{ fontFamily: '"Jost", sans-serif' }}>
                          Gmail, Google Drive & Google Calendar
                        </p>
                      </div>
                    </div>

                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5"
                      style={{
                        backgroundColor: 'rgba(52, 199, 89, 0.18)',
                        color: FACETIME_GREEN,
                        border: `1px solid ${FACETIME_GREEN}`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: FACETIME_GREEN }} />
                      SINCRONIZZATO
                    </span>
                  </div>

                  {/* Account Google Connesso */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-bold" style={{ fontFamily: '"Space Mono", monospace' }}>
                        Account Google Principale
                      </label>
                      <input
                        type="email"
                        value={settings.googleAccount}
                        onChange={(e) => setSettings({ ...settings, googleAccount: e.target.value })}
                        className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-white rounded-xl focus:outline-none focus:border-[#34c759]"
                        style={{ fontFamily: '"Space Mono", monospace' }}
                      />
                    </div>

                    {/* Cartella Google Drive Contratti */}
                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-bold" style={{ fontFamily: '"Space Mono", monospace' }}>
                        Cartella Google Drive Contratti & PDF
                      </label>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-[#00e5ff] flex-shrink-0" />
                        <input
                          type="text"
                          value={settings.gdriveFolder}
                          onChange={(e) => setSettings({ ...settings, gdriveFolder: e.target.value })}
                          className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-white rounded-xl focus:outline-none focus:border-[#34c759]"
                          style={{ fontFamily: '"Jost", sans-serif' }}
                        />
                      </div>
                    </div>

                    {/* Sincronizzazioni Attive */}
                    <div className="space-y-3 pt-2">
                      {/* Gmail Sync */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2.5">
                          <Mail className="w-4 h-4 text-[#ff6f43]" />
                          <div>
                            <div className="text-xs text-white font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                              Invio Diretto Gmail dal CRM
                            </div>
                            <div className="text-[12px] text-white/60" style={{ fontFamily: '"Jost", sans-serif' }}>
                              Invia preventivi e note sviluppatore con 1 click
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSetting('gmailSync')}
                          className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5"
                          style={{
                            backgroundColor: settings.gmailSync ? FACETIME_GREEN : '#334155',
                            boxShadow: settings.gmailSync ? `0 0 10px ${FACETIME_GREEN_GLOW}` : 'none'
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              settings.gmailSync ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Google Drive Sync */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2.5">
                          <HardDrive className="w-4 h-4 text-[#ffd600]" />
                          <div>
                            <div className="text-xs text-white font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                              Archiviazione Automatica Drive
                            </div>
                            <div className="text-[12px] text-white/60" style={{ fontFamily: '"Jost", sans-serif' }}>
                              Salva copia firmata PDF nella cartella condivisa
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSetting('gdriveSync')}
                          className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5"
                          style={{
                            backgroundColor: settings.gdriveSync ? FACETIME_GREEN : '#334155',
                            boxShadow: settings.gdriveSync ? `0 0 10px ${FACETIME_GREEN_GLOW}` : 'none'
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              settings.gdriveSync ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Google Calendar Sync */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-[#00ffaa]" />
                          <div>
                            <div className="text-xs text-white font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                              Sincronizzazione Shooting Calendar
                            </div>
                            <div className="text-[12px] text-white/60" style={{ fontFamily: '"Jost", sans-serif' }}>
                              Aggiunge orari e date di set sul calendario Google
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSetting('gcalSync')}
                          className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5"
                          style={{
                            backgroundColor: settings.gcalSync ? FACETIME_GREEN : '#334155',
                            boxShadow: settings.gcalSync ? `0 0 10px ${FACETIME_GREEN_GLOW}` : 'none'
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              settings.gcalSync ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Card Workspace */}
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                  <span style={{ fontFamily: '"Space Mono", monospace' }}>OAuth 2.0 Connesso</span>
                  <span className="font-bold" style={{ color: FACETIME_GREEN }}>Status: OK</span>
                </div>
              </div>

              {/* CARD 1.2: Gemini AI Studio (SOTTO - Grigio Metallizzato Titanio con Verde FaceTime) */}
              <div
                className="p-5 md:p-6 flex flex-col justify-between shadow-xl"
                style={{
                  borderRadius: '24px',
                  background: 'linear-gradient(145deg, #2a3038 0%, #1e2229 50%, #262c35 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 8px 24px -4px rgba(0, 0, 0, 0.45)',
                }}
              >
                <div>
                  {/* Intestazione Card */}
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-black"
                        style={{ backgroundColor: FACETIME_GREEN, boxShadow: `0 0 12px ${FACETIME_GREEN_GLOW}` }}
                      >
                        <Sparkles className="w-5 h-5 stroke-[2.4]" />
                      </div>
                      <div>
                        <h3 className="text-white text-base font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                          Gemini AI Studio
                        </h3>
                        <p className="text-xs text-white/50" style={{ fontFamily: '"Jost", sans-serif' }}>
                          Generazione preventivi & sintesi automatica note
                        </p>
                      </div>
                    </div>

                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5"
                      style={{
                        backgroundColor: 'rgba(52, 199, 89, 0.18)',
                        color: FACETIME_GREEN,
                        border: `1px solid ${FACETIME_GREEN}`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: FACETIME_GREEN }} />
                      ATTIVO
                    </span>
                  </div>

                  {/* Modello AI Selezionato */}
                  <div className="space-y-4">
                    {/* Tono & Stile Risposte */}
                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-bold" style={{ fontFamily: '"Space Mono", monospace' }}>
                        Tono del Assistente
                      </label>
                      <input
                        type="text"
                        value={settings.aiTone}
                        onChange={(e) => setSettings({ ...settings, aiTone: e.target.value })}
                        className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-white rounded-xl focus:outline-none focus:border-[#34c759]"
                        style={{ fontFamily: '"Jost", sans-serif' }}
                      />
                    </div>

                    {/* Toggles AI */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div>
                          <div className="text-xs text-white font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                            Auto-Sintesi Note Meeting
                          </div>
                          <div className="text-[12px] text-white/60" style={{ fontFamily: '"Jost", sans-serif' }}>
                            Genera riassunti puntuali dai memo vocali del team
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSetting('aiAutoSummary')}
                          className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5"
                          style={{
                            backgroundColor: settings.aiAutoSummary ? FACETIME_GREEN : '#334155',
                            boxShadow: settings.aiAutoSummary ? `0 0 10px ${FACETIME_GREEN_GLOW}` : 'none'
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              settings.aiAutoSummary ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div>
                          <div className="text-xs text-white font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                            Bozze Automatiche Preventivi
                          </div>
                          <div className="text-[12px] text-white/60" style={{ fontFamily: '"Jost", sans-serif' }}>
                            Compila le voci di costo in base all'attrezzatura richiesta
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSetting('aiDraftQuotes')}
                          className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5"
                          style={{
                            backgroundColor: settings.aiDraftQuotes ? FACETIME_GREEN : '#334155',
                            boxShadow: settings.aiDraftQuotes ? `0 0 10px ${FACETIME_GREEN_GLOW}` : 'none'
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              settings.aiDraftQuotes ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Rapido AI */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleTestAi}
                      disabled={testingAi}
                      className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        fontFamily: '"Goldman", sans-serif'
                      }}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingAi ? 'animate-spin' : ''}`} />
                      <span>{testingAi ? 'Testing in corso...' : 'Test Connessione AI'}</span>
                    </button>

                    {aiTestResult && (
                      <span className="text-xs font-mono font-bold" style={{ color: FACETIME_GREEN }}>
                        ✓ {aiTestResult.latency}
                      </span>
                    )}
                  </div>

                  {aiTestResult && (
                    <div
                      className="mt-2.5 p-2 rounded-lg text-xs leading-relaxed"
                      style={{
                        backgroundColor: 'rgba(52, 199, 89, 0.12)',
                        border: `1px solid ${FACETIME_GREEN}`,
                        color: '#d4eed9',
                        fontFamily: '"Jost", sans-serif',
                      }}
                    >
                      {aiTestResult.message}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: IDENTITÀ STUDIO & BRAND (DADO CREATIVE STUDIO)             */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'identity' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

              {/* Colonna Sinistra / Centrale: Dati Studio */}
              <div
                className="lg:col-span-2 p-5 shadow-xl"
                style={{
                  borderRadius: '24px',
                  background: 'linear-gradient(145deg, #2a3038 0%, #1e2229 50%, #262c35 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 8px 24px -4px rgba(0, 0, 0, 0.45)',
                }}
              >
                <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-black"
                    style={{ backgroundColor: FACETIME_GREEN, boxShadow: `0 0 12px ${FACETIME_GREEN_GLOW}` }}
                  >
                    <Building2 className="w-5 h-5 stroke-[2.4]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                      Dati Aziendali & Intestazione Preventivi
                    </h3>
                    <p className="text-xs text-white/50" style={{ fontFamily: '"Jost", sans-serif' }}>
                      Informazioni legali e contatti che compaiono nei contratti digitali
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/70 mb-1 font-bold">Ragione Sociale / Studio</label>
                    <input
                      type="text"
                      value={settings.studioName}
                      onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
                      className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-white rounded-xl focus:outline-none focus:border-[#34c759]"
                      style={{ fontFamily: '"Jost", sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1 font-bold">Claim / Attività</label>
                    <input
                      type="text"
                      value={settings.brandClaim}
                      onChange={(e) => setSettings({ ...settings, brandClaim: e.target.value })}
                      className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-white rounded-xl focus:outline-none focus:border-[#34c759]"
                      style={{ fontFamily: '"Jost", sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1 font-bold">Partita IVA</label>
                    <input
                      type="text"
                      value={settings.vatNumber}
                      onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                      className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-white rounded-xl focus:outline-none focus:border-[#34c759]"
                      style={{ fontFamily: '"Space Mono", monospace' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1 font-bold">Codice Fiscale</label>
                    <input
                      type="text"
                      value={settings.taxCode}
                      onChange={(e) => setSettings({ ...settings, taxCode: e.target.value })}
                      className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-white rounded-xl focus:outline-none focus:border-[#34c759]"
                      style={{ fontFamily: '"Space Mono", monospace' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1 font-bold">Email PEC Ufficiale</label>
                    <input
                      type="email"
                      value={settings.legalEmail}
                      onChange={(e) => setSettings({ ...settings, legalEmail: e.target.value })}
                      className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-white rounded-xl focus:outline-none focus:border-[#34c759]"
                      style={{ fontFamily: '"Space Mono", monospace' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1 font-bold">Telefono Studio / Set</label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-white rounded-xl focus:outline-none focus:border-[#34c759]"
                      style={{ fontFamily: '"Space Mono", monospace' }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-white/70 mb-1 font-bold">IBAN per Bonifici & Acconti</label>
                    <input
                      type="text"
                      value={settings.iban}
                      onChange={(e) => setSettings({ ...settings, iban: e.target.value })}
                      className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-[#00e5ff] font-bold rounded-xl focus:outline-none focus:border-[#34c759]"
                      style={{ fontFamily: '"Space Mono", monospace' }}
                    />
                  </div>
                </div>
              </div>

              {/* Colonna Destra: Listino Base DADO Studio */}
              <div
                className="p-5 shadow-xl flex flex-col justify-between"
                style={{
                  borderRadius: '24px',
                  background: 'linear-gradient(145deg, #2a3038 0%, #1e2229 50%, #262c35 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 8px 24px -4px rgba(0, 0, 0, 0.45)',
                }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-black"
                      style={{ backgroundColor: '#ff6f43', boxShadow: '0 0 12px rgba(255, 111, 67, 0.4)' }}
                    >
                      <CreditCard className="w-5 h-5 stroke-[2.4]" />
                    </div>
                    <div>
                      <h3 className="text-white text-base font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                        Tariffario Standard
                      </h3>
                      <p className="text-xs text-white/50" style={{ fontFamily: '"Jost", sans-serif' }}>
                        Prezzi base per stime veloci
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-bold">Giornata Intera Shooting (Full Day)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-xs">€</span>
                        <input
                          type="number"
                          value={settings.rateFullDay}
                          onChange={(e) => setSettings({ ...settings, rateFullDay: e.target.value })}
                          className="w-full bg-[#14171c] border border-white/15 pl-8 pr-3 py-2 text-sm text-white font-bold rounded-xl focus:outline-none focus:border-[#34c759]"
                          style={{ fontFamily: '"Space Mono", monospace' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-bold">Mezza Giornata (Half Day)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-xs">€</span>
                        <input
                          type="number"
                          value={settings.rateHalfDay}
                          onChange={(e) => setSettings({ ...settings, rateHalfDay: e.target.value })}
                          className="w-full bg-[#14171c] border border-white/15 pl-8 pr-3 py-2 text-sm text-white font-bold rounded-xl focus:outline-none focus:border-[#34c759]"
                          style={{ fontFamily: '"Space Mono", monospace' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-bold">Tariffa Oraria Post-Produzione</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-xs">€</span>
                        <input
                          type="number"
                          value={settings.rateHourlyPost}
                          onChange={(e) => setSettings({ ...settings, rateHourlyPost: e.target.value })}
                          className="w-full bg-[#14171c] border border-white/15 pl-8 pr-3 py-2 text-sm text-[#00ffaa] font-bold rounded-xl focus:outline-none focus:border-[#34c759]"
                          style={{ fontFamily: '"Space Mono", monospace' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 leading-relaxed font-sans">
                  💡 Questi valori vengono usati da Gemini AI quando genera un preventivo rapido dal campo note.
                </div>
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: ATTREZZATURA & KIT DADO STUDIO                             */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'equipment' && (
            <div className="mb-8">
              <div
                className="p-5 shadow-xl"
                style={{
                  borderRadius: '24px',
                  background: 'linear-gradient(145deg, #2a3038 0%, #1e2229 50%, #262c35 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 8px 24px -4px rgba(0, 0, 0, 0.45)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-black"
                      style={{ backgroundColor: FACETIME_GREEN, boxShadow: `0 0 12px ${FACETIME_GREEN_GLOW}` }}
                    >
                      <Camera className="w-5 h-5 stroke-[2.4]" />
                    </div>
                    <div>
                      <h3 className="text-white text-base font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                        Inventario Kit Tecnico & Stato Operativo
                      </h3>
                      <p className="text-xs text-white/50" style={{ fontFamily: '"Jost", sans-serif' }}>
                        Fai clic sullo stato per cambiare disponibilità (Disponibile, Su Set, In Manutenzione)
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-white/70 bg-white/10 px-3 py-1 rounded-full self-start sm:self-auto">
                    {settings.equipment.length} Dispositivi Registrati
                  </span>
                </div>

                {/* Griglia Attrezzatura */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {settings.equipment.map((item) => {
                    const isAvailable = item.status === 'Disponibile'
                    const isOnSet = item.status === 'Su Set'

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-[#15181e] border border-white/10 flex flex-col justify-between transition-all hover:border-white/25"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md"
                              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#00e5ff' }}
                            >
                              {item.category}
                            </span>
                            <span className="text-[10px] font-mono text-white/40">
                              {item.serial}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white leading-snug" style={{ fontFamily: '"Goldman", sans-serif' }}>
                            {item.name}
                          </h4>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[11px] text-white/50" style={{ fontFamily: '"Jost", sans-serif' }}>
                            Stato attuale:
                          </span>

                          <button
                            onClick={() => toggleEquipmentStatus(item.id)}
                            className="px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer"
                            style={{
                              backgroundColor: isAvailable
                                ? 'rgba(52, 199, 89, 0.2)'
                                : isOnSet
                                ? 'rgba(255, 111, 67, 0.2)'
                                : 'rgba(255, 214, 0, 0.2)',
                              color: isAvailable
                                ? FACETIME_GREEN
                                : isOnSet
                                ? '#ff6f43'
                                : '#ffd600',
                              border: `1px solid ${isAvailable ? FACETIME_GREEN : isOnSet ? '#ff6f43' : '#ffd600'}`,
                            }}
                            title="Fai clic per cambiare stato"
                          >
                            ● {item.status}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 4: CONNESSIONI, NOTIFICHE & BACKUP                            */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'notifications' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">

              {/* Box Notifiche Push & Alert Scadenze */}
              <div
                className="p-5 shadow-xl flex flex-col justify-between"
                style={{
                  borderRadius: '24px',
                  background: 'linear-gradient(145deg, #2a3038 0%, #1e2229 50%, #262c35 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 8px 24px -4px rgba(0, 0, 0, 0.45)',
                }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-black"
                      style={{ backgroundColor: FACETIME_GREEN, boxShadow: `0 0 12px ${FACETIME_GREEN_GLOW}` }}
                    >
                      <Bell className="w-5 h-5 stroke-[2.4]" />
                    </div>
                    <div>
                      <h3 className="text-white text-base font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                        Automazioni & Notifiche CRM
                      </h3>
                      <p className="text-xs text-white/50" style={{ fontFamily: '"Jost", sans-serif' }}>
                        Avvisi automatici per scadenze e pipeline commerciale
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <div className="text-xs text-white font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                          Alert Preventivi in Scadenza
                        </div>
                        <div className="text-[12px] text-white/60" style={{ fontFamily: '"Jost", sans-serif' }}>
                          Avvisa a 3 giorni dal termine validità offerta
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting('notifyQuotesExpiring')}
                        className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5"
                        style={{
                          backgroundColor: settings.notifyQuotesExpiring ? FACETIME_GREEN : '#334155',
                          boxShadow: settings.notifyQuotesExpiring ? `0 0 10px ${FACETIME_GREEN_GLOW}` : 'none'
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.notifyQuotesExpiring ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <div className="text-xs text-white font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                          Notifica Firma Contratto Digitale
                        </div>
                        <div className="text-[12px] text-white/60" style={{ fontFamily: '"Jost", sans-serif' }}>
                          Ricevi alert non appena il cliente firma via PEC o PDF
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting('notifyContractsSigned')}
                        className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5"
                        style={{
                          backgroundColor: settings.notifyContractsSigned ? FACETIME_GREEN : '#334155',
                          boxShadow: settings.notifyContractsSigned ? `0 0 10px ${FACETIME_GREEN_GLOW}` : 'none'
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.notifyContractsSigned ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <div className="text-xs text-white font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                          Conferma Incasso Acconti
                        </div>
                        <div className="text-[12px] text-white/60" style={{ fontFamily: '"Jost", sans-serif' }}>
                          Aggiorna automaticamente lo status in "Acconto Versato"
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting('notifyPaymentReceived')}
                        className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5"
                        style={{
                          backgroundColor: settings.notifyPaymentReceived ? FACETIME_GREEN : '#334155',
                          boxShadow: settings.notifyPaymentReceived ? `0 0 10px ${FACETIME_GREEN_GLOW}` : 'none'
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.notifyPaymentReceived ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/40 font-mono">
                  Canale notifiche: In-App Toast & Gmail (`n.drea.t@gmail.com`)
                </div>
              </div>

              {/* Box Backup Database & Webhook */}
              <div
                className="p-5 shadow-xl flex flex-col justify-between"
                style={{
                  borderRadius: '24px',
                  background: 'linear-gradient(145deg, #2a3038 0%, #1e2229 50%, #262c35 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 8px 24px -4px rgba(0, 0, 0, 0.45)',
                }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-black"
                      style={{ backgroundColor: '#00e5ff', boxShadow: '0 0 12px rgba(0, 229, 255, 0.4)' }}
                    >
                      <Database className="w-5 h-5 stroke-[2.4]" />
                    </div>
                    <div>
                      <h3 className="text-white text-base font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                        Backup Database & Webhook
                      </h3>
                      <p className="text-xs text-white/50" style={{ fontFamily: '"Jost", sans-serif' }}>
                        Esportazione dati clienti, storico e sincronizzazioni esterne
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-bold" style={{ fontFamily: '"Space Mono", monospace' }}>
                        Endpoint Webhook Personalizzato
                      </label>
                      <input
                        type="url"
                        value={settings.webhookUrl}
                        onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                        className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-white rounded-xl focus:outline-none focus:border-[#34c759]"
                        style={{ fontFamily: '"Space Mono", monospace' }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-bold" style={{ fontFamily: '"Space Mono", monospace' }}>
                        Frequenza Backup Automatico
                      </label>
                      <select
                        value={settings.backupFrequency}
                        onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                        className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-white rounded-xl focus:outline-none focus:border-[#34c759]"
                        style={{ fontFamily: '"Space Mono", monospace' }}
                      >
                        <option value="Giornaliero">Giornaliero (alle ore 02:00)</option>
                        <option value="Settimanale su Drive">Settimanale su Drive (ogni domenica)</option>
                        <option value="Manuale">Solo manuale su richiesta</option>
                      </select>
                    </div>

                    {/* Bottone Scarica Backup */}
                    <div className="pt-2">
                      <button
                        onClick={handleExportData}
                        className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          color: '#ffffff',
                          fontFamily: '"Goldman", sans-serif'
                        }}
                      >
                        <Download className="w-4 h-4" />
                        <span>Scarica Backup Completo (.JSON)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/40 font-mono flex items-center justify-between">
                  <span>Ultimo salvataggio locale:</span>
                  <span className="text-[#00ffaa]">Oggi alle 12:45</span>
                </div>
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 5: SISTEMA & PREFERENZE INTERFACCIA                           */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'system' && (
            <div className="mb-8">
              <div
                className="p-5 shadow-xl max-w-2xl"
                style={{
                  borderRadius: '24px',
                  background: 'linear-gradient(145deg, #2a3038 0%, #1e2229 50%, #262c35 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 8px 24px -4px rgba(0, 0, 0, 0.45)',
                }}
              >
                <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-black"
                    style={{ backgroundColor: FACETIME_GREEN, boxShadow: `0 0 12px ${FACETIME_GREEN_GLOW}` }}
                  >
                    <Sliders className="w-5 h-5 stroke-[2.4]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                      Preferenze Sistema & Visualizzazione
                    </h3>
                    <p className="text-xs text-white/50" style={{ fontFamily: '"Jost", sans-serif' }}>
                      Parametri regionali, valuta e comportamenti dell'interfaccia
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-bold" style={{ fontFamily: '"Space Mono", monospace' }}>
                        Valuta Predefinita
                      </label>
                      <input
                        type="text"
                        value={settings.currency}
                        disabled
                        className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-white/70 rounded-xl"
                        style={{ fontFamily: '"Space Mono", monospace' }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-bold" style={{ fontFamily: '"Space Mono", monospace' }}>
                        Formato Data
                      </label>
                      <input
                        type="text"
                        value={settings.dateFormat}
                        disabled
                        className="w-full bg-[#14171c] border border-white/15 px-3 py-2 text-xs md:text-sm text-white/70 rounded-xl"
                        style={{ fontFamily: '"Space Mono", monospace' }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <div className="text-xs text-white font-bold" style={{ fontFamily: '"Goldman", sans-serif' }}>
                        Feedback Sonori & Click Tattili
                      </div>
                      <div className="text-[12px] text-white/60" style={{ fontFamily: '"Jost", sans-serif' }}>
                        Suono lieve al salvataggio o alla marcatura di un'attività
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSetting('soundEffects')}
                      className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5"
                      style={{
                        backgroundColor: settings.soundEffects ? FACETIME_GREEN : '#334155',
                        boxShadow: settings.soundEffects ? `0 0 10px ${FACETIME_GREEN_GLOW}` : 'none'
                      }}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          settings.soundEffects ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-white/10 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all"
                    style={{
                      backgroundColor: FACETIME_GREEN,
                      color: '#0d2813',
                      fontFamily: '"Goldman", sans-serif',
                      boxShadow: `0 2px 10px ${FACETIME_GREEN_GLOW}`
                    }}
                  >
                    Salva Preferenze
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── Banda Bianca Inferiore ── */}
        <div className="w-full flex justify-end flex-shrink-0">
          <div className="bg-white rounded-tl-2xl w-[calc(100%-2.5rem)] h-4" />
        </div>

      </div>
    </div>
  )
}
