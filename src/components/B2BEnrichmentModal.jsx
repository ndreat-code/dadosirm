import { useState, useEffect, useCallback } from 'react'
import {
  X,
  Search,
  Sparkles,
  Building2,
  ShieldCheck,
  Users,
  Award,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Phone,
  Mail,
  Smartphone,
  MapPin,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  Copy,
  Check,
  AlertCircle,
  Plus,
  RefreshCw,
  Zap,
} from 'lucide-react'

export default function B2BEnrichmentModal({
  isOpen,
  onClose,
  initialQuery = '',
  onSelectCompany,
  onCompanyCreated,
}) {
  const [query, setQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [enrichmentResult, setEnrichmentResult] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('camerale') // 'camerale' | 'people' | 'dnb' | 'dado_strategy'
  const [copiedKey, setCopiedKey] = useState(null)
  const [isSavingToCrm, setIsSavingToCrm] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Aggiorna query se initialQuery cambia all'apertura
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery)
      handleSearch(initialQuery)
    }
  }, [initialQuery, isOpen])

  const copyToClipboard = (text, key) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleSearch = async (overrideQuery) => {
    const q = (overrideQuery || query || '').trim()
    if (!q) {
      setError('Inserisci una Partita IVA (11 cifre) o un Nome Aziendale')
      return
    }

    setLoading(true)
    setError(null)
    setEnrichmentResult(null)
    setSaveSuccess(false)

    try {
      const res = await fetch('/api/crm/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Impossibile completare l\'arricchimento dati')
      }

      setEnrichmentResult(data)
    } catch (err) {
      setError(err.message || 'Errore durante la consultazione dei database B2B')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDirectToCrm = async () => {
    if (!enrichmentResult?.crmMapping) return
    setIsSavingToCrm(true)
    setError(null)

    try {
      const companyPayload = {
        ...enrichmentResult.crmMapping,
        enrichedData: {
          enrichedAt: enrichmentResult.enrichedAt,
          confidenceScore: enrichmentResult.confidenceScore,
          matchedSource: enrichmentResult.matchedSource,
          sourcesConsulted: enrichmentResult.sourcesConsulted,
          revenueRange: enrichmentResult.company?.revenueRange,
          employeesExact: enrichmentResult.company?.employeesExact,
          recommendedPaymentTerms: enrichmentResult.company?.recommendedPaymentTerms,
          recommendedDadoServices: enrichmentResult.company?.recommendedDadoServices,
        },
      }

      const res = await fetch('/api/crm/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyPayload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Errore nel salvataggio della nuova azienda')
      }

      setSaveSuccess(true)
      if (onCompanyCreated) {
        onCompanyCreated(data.company)
      }
      setTimeout(() => {
        if (onClose) onClose()
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSavingToCrm(false)
    }
  }

  const handleApplyToForm = () => {
    if (!enrichmentResult) return
    if (onSelectCompany) {
      onSelectCompany(enrichmentResult)
    }
    if (onClose) onClose()
  }

  if (!isOpen) return null

  const comp = enrichmentResult?.company

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(7, 19, 37, 0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-sky-400/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: '#0c1e38',
          fontFamily: '"Switzer", sans-serif',
          color: '#f8fafc',
        }}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-sky-500/20 bg-gradient-to-r from-[#0a182e] via-[#0e274a] to-[#0a182e] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-sky-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  B2B Data Enrichment & Intelligence Camerale
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  AI + Registri Ufficiali
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Collegamento API in tempo reale ad Atoka, Registro Imprese CCIAA, LinkedIn Talent Insights, Dun & Bradstreet e ZoomInfo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar & Provider Badges */}
        <div className="p-5 border-b border-sky-500/15 bg-[#081528] flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch()
            }}
            className="flex gap-2.5 items-center"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Inserisci Partita IVA (11 cifre) o Nome Azienda (es. 02194830159, Ferrari, Prada, Kroma Ceramiche)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-sky-400/30 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#7c3aed] hover:from-[#0369a1] hover:to-[#6d28d9] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Ricerca Database...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Arricchisci Scheda</span>
                </>
              )}
            </button>
          </form>

          {/* Badge Provider Collegati */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Fonti verificate:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-sky-950/80 text-sky-300 border border-sky-800/50">
              Atoka / Cerved (Camerali)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
              Registro Imprese CCIAA
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/50">
              LinkedIn Talent Insights
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/50">
              Dun & Bradstreet (D-U-N-S)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-teal-950/80 text-teal-300 border border-teal-800/50">
              ZoomInfo B2B
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-2.5 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Scheda azienda creata e registrata con successo nel CRM DADO!</span>
            </div>
          )}

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-sky-400/20 border-t-sky-400 animate-spin" />
              <p className="text-sm font-bold text-sky-200">
                Interrogazione database camerali e network B2B in corso...
              </p>
              <p className="text-xs text-slate-400">
                Verifica partita IVA, estrazione ATECO, organigramma LinkedIn e rating di solvibilità D&B
              </p>
            </div>
          )}

          {!loading && !enrichmentResult && !error && (
            <div className="py-10 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Building2 className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-200">
                Inserisci una Partita IVA o un Nome per completare la scheda in automatico
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                L'intelligenza artificiale interrogherà all'istante i registri camerali e professionali per estrarre ragione sociale, ATECO, sede legale, PEC, codice SDI, referenti LinkedIn e rating creditizio.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <span className="text-xs text-slate-400 mr-2 self-center">Esempi rapidi:</span>
                {['02194830159 (Riva)', '03847290361 (Kroma)', 'Ferrari', 'Prada', 'Moncler'].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => {
                      const val = ex.split(' ')[0]
                      setQuery(val)
                      handleSearch(val)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-sky-300 text-xs border border-sky-400/20 transition-all cursor-pointer"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dossier Risultati Enriched */}
          {!loading && comp && (
            <div className="space-y-4">
              {/* Card Sintesi Aziendale */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-purple-950/40 border border-sky-500/30 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                    {comp.brandName?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">{comp.legalName}</h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {comp.companyStatus}
                      </span>
                    </div>
                    <p className="text-xs text-sky-200/80 font-medium">
                      P.IVA: <span className=" text-white font-bold">{comp.vatNumber}</span> • REA: {comp.rea} • Sede: {comp.legalAddress?.city} ({comp.legalAddress?.province})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Rating D&B</span>
                    <span className="text-xs font-black text-amber-300">{comp.creditRating}</span>
                  </div>
                  <div className="w-px h-8 bg-sky-500/20" />
                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Score Match</span>
                    <span className="text-xs font-black text-emerald-400">{enrichmentResult.confidenceScore}%</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-sky-500/20 gap-2">
                {[
                  { id: 'camerale', label: '1. Dati Camerali & Fiscali', icon: Building2 },
                  { id: 'people', label: '2. Referenti & LinkedIn Insights', icon: Users },
                  { id: 'dnb', label: '3. Solvibilità & Dun & Bradstreet', icon: Award },
                  { id: 'dado_strategy', label: '4. Opportunità DADO Studio', icon: Sparkles },
                ].map((t) => {
                  const Icon = t.icon
                  const active = activeTab === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                        active
                          ? 'border-sky-400 text-sky-300 bg-sky-500/10'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* TAB 1: Dati Camerali & Fiscali (Atoka & Registro Imprese) */}
              {activeTab === 'camerale' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-sky-500/20 space-y-3">
                    <h4 className="font-bold text-sky-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Identificativi Fiscali & SDI
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-slate-400">Partita IVA:</span>
                        <div className="flex items-center gap-1.5">
                          <span className=" font-bold text-white">{comp.vatNumber}</span>
                          <button
                            onClick={() => copyToClipboard(comp.vatNumber, 'vat')}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {copiedKey === 'vat' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-slate-400">Codice Fiscale:</span>
                        <span className=" text-white">{comp.fiscalCode}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-slate-400">Codice SDI (Fattura Elettronica):</span>
                        <div className="flex items-center gap-1.5">
                          <span className=" font-black text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            {comp.sdiCode}
                          </span>
                          <button
                            onClick={() => copyToClipboard(comp.sdiCode, 'sdi')}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {copiedKey === 'sdi' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-slate-400">PEC Ufficiale:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sky-300 text-[11px] font-semibold">{comp.pec}</span>
                          <button
                            onClick={() => copyToClipboard(comp.pec, 'pec')}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {copiedKey === 'pec' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400">Numero REA:</span>
                        <span className=" text-white">{comp.rea}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-sky-500/20 space-y-3">
                    <h4 className="font-bold text-sky-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-sky-400" />
                      Sede Legale & Settore ATECO
                    </h4>
                    <div className="space-y-2">
                      <div className="py-1 border-b border-white/5">
                        <span className="text-slate-400 block text-[11px]">Sede Legale:</span>
                        <span className="text-white font-medium">
                          {comp.legalAddress?.street}, {comp.legalAddress?.zip} {comp.legalAddress?.city} ({comp.legalAddress?.province})
                        </span>
                      </div>
                      <div className="py-1 border-b border-white/5">
                        <span className="text-slate-400 block text-[11px]">Codice ATECO Primario:</span>
                        <span className=" font-bold text-purple-300">{comp.atecoCode}</span>
                        <p className="text-slate-300 text-[11px] mt-0.5">{comp.atecoDescription}</p>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-slate-400">Anno Costituzione:</span>
                        <span className="font-semibold text-white">{comp.foundedYear}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400">Capitale Sociale:</span>
                        <span className="font-semibold text-white">{comp.shareCapital}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Referenti & LinkedIn Talent Insights */}
              {activeTab === 'people' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-200">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>
                        Organigramma aziendale e decision maker estratti via <strong>LinkedIn Talent Insights</strong> & <strong>ZoomInfo</strong>
                      </span>
                    </div>
                    {comp.linkedinUrl && (
                      <a
                        href={comp.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-[11px] font-bold flex items-center gap-1"
                      >
                        <span>Pagina LinkedIn</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {comp.decisionMakers && comp.decisionMakers.map((dm, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-white/[0.03] border border-sky-500/20 space-y-2.5 hover:border-sky-400/40 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-black text-white text-xs">
                              {dm.name.charAt(0)}
                            </div>
                            <div>
                              <h5 className="font-bold text-white text-sm">{dm.name}</h5>
                              <p className="text-[11px] text-purple-300 font-semibold">{dm.role}</p>
                            </div>
                          </div>
                          {dm.isPrimary && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Referente Principale
                            </span>
                          )}
                        </div>

                        <div className="pt-2 border-t border-white/5 space-y-1.5 text-[11px]">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Mail size={13} className="text-sky-400" />
                            <a href={`mailto:${dm.email}`} className="hover:underline text-sky-200">
                              {dm.email}
                            </a>
                          </div>
                          {dm.mobile && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <Smartphone size={13} className="text-emerald-400" />
                              <a href={`tel:${dm.mobile}`} className="hover:underline text-emerald-200">
                                {dm.mobile}
                              </a>
                            </div>
                          )}
                          {dm.phone && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Phone size={13} className="text-slate-400" />
                              <span>{dm.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Dun & Bradstreet & Solvibilità */}
              {activeTab === 'dnb' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-amber-500/20 space-y-2">
                    <span className="text-slate-400 block text-[11px] uppercase font-bold">Numero D-U-N-S®</span>
                    <span className="text-xl font-black tabular-nums text-amber-300 tracking-wider">
                      {comp.dunsNumber}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Identificativo globale unico Dun & Bradstreet per transazioni commerciali internazionali.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-emerald-500/20 space-y-2">
                    <span className="text-slate-400 block text-[11px] uppercase font-bold">Paydex Score (1-100)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-400">{comp.paydexScore}</span>
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Puntualità nei pagamenti ai fornitori. Valore {comp.paydexScore} = Pagamenti regolari e puntuali.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-purple-500/20 space-y-2">
                    <span className="text-slate-400 block text-[11px] uppercase font-bold">Fatturato & Organico</span>
                    <span className="text-base font-black text-purple-300">{comp.revenueRange}</span>
                    <p className="text-[11px] text-slate-400">
                      Dipendenti stimati: <strong className="text-white">{comp.employeesRange}</strong>
                    </p>
                  </div>

                  <div className="md:col-span-3 p-4 rounded-xl bg-gradient-to-r from-amber-950/20 to-emerald-950/20 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-amber-200">Termini di Pagamento Raccomandati dall'AI:</h5>
                      <p className="text-xs text-slate-300 mt-0.5">{comp.recommendedPaymentTerms}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase">
                      Rischio Insoluto: {comp.delinquencyRisk}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: Opportunità DADO Studio & Servizi Raccomandati */}
              {activeTab === 'dado_strategy' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-purple-200 uppercase tracking-wider text-xs flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Servizi Audiovisivi Raccomandati per {comp.brandName}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                        Budget Stimato: € {comp.suggestedBudget?.toLocaleString('it-IT')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {comp.recommendedDadoServices && comp.recommendedDadoServices.map((srv, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-white/5 border border-purple-400/20 text-slate-200 font-medium flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#00ffaa] flex-shrink-0 mt-0.5" />
                          <span>{srv}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/20 space-y-2">
                    <h5 className="font-bold text-sky-200">Pitch Angle & Strategia di Ingresso Suggerita:</h5>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      Proporre una demo reel su misura incentrata su {comp.atecoDescription.toLowerCase()}, valorizzando il Limbo White dello Studio DADO per la resa visiva dei prodotti e l'impiego del Drone 4K per le riprese aziendali. Contattare primariamente <strong>{comp.decisionMakers?.[0]?.name}</strong> ({comp.decisionMakers?.[0]?.role}).
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-sky-500/20 bg-[#081528] flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-400">
            {enrichmentResult ? (
              <span>
                Fonte: <strong className="text-sky-300">{enrichmentResult.matchedSource}</strong> ({enrichmentResult.elapsedMs}ms)
              </span>
            ) : (
              <span>Integrazione attiva con protocollo OpenAPI B2B e VIES EU</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Chiudi
            </button>

            {enrichmentResult && onSelectCompany && (
              <button
                onClick={handleApplyToForm}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Applica Dati al Modulo</span>
              </button>
            )}

            {enrichmentResult && (
              <button
                onClick={handleSaveDirectToCrm}
                disabled={isSavingToCrm || saveSuccess}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSavingToCrm ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvataggio...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Azienda Registrata!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crea Scheda Azienda nel CRM</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
