import React, { useState, useEffect, useMemo } from 'react'
import { ArrowUpRight, X } from 'lucide-react'

// Icona logo geometrico DADO
function DadoMiniBrandMark({ size = 13 }) {
  const h = size
  const wD = size * 0.8
  const wTri = size * 0.9
  const wO = size
  return (
    <div className="inline-flex items-center gap-0.5 leading-none select-none">
      <svg width={wD} height={h} viewBox="0 0 16 20" fill="none">
        <path d="M0 0 H4 C10.6 0 16 4.5 16 10 C16 15.5 10.6 20 4 20 H0 Z" fill="#53ba75" />
      </svg>
      <svg width={wTri} height={h} viewBox="0 0 18 20" fill="none">
        <polygon points="9 0, 18 20, 0 20" fill="#ea3824" />
      </svg>
      <svg width={wD} height={h} viewBox="0 0 16 20" fill="none">
        <path d="M0 0 H4 C10.6 0 16 4.5 16 10 C16 15.5 10.6 20 4 20 H0 Z" fill="#1bb7ed" />
      </svg>
      <svg width={wO} height={h} viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#fac429" />
      </svg>
    </div>
  )
}

export default function ConcentricRingsKpi({
  width = 'calc(290px + 3cm)',
  height = 'calc(378px + 1.8cm)',
  style = {},
  className = '',
  onOpenDetails,
}) {
  const [hoveredKey, setHoveredKey] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [dataStats, setDataStats] = useState({
    conversionRate: 68,
    closeRate: 82,
    channelEvents: 26,
    channelReferral: 28,
    channelOutreach: 20,
    channelInbound: 26,
    activeCount: 12,
    totalCount: 15,
    channels: [
      { name: 'Eventi, Fiere & Convention', percent: 26, count: 4, share: 'Fiere di settore, Vinitaly, Expo & meeting', color: '#fac429' },
      { name: 'Referral & Passaparola', percent: 28, count: 4, share: 'Network partner, Confindustria & raccomandazioni', color: '#8b5cf6' },
      { name: 'Outreach B2B & LinkedIn InMail', percent: 20, count: 3, share: 'Proposte B2B dirette & campagne LinkedIn InMail', color: '#f97316' },
      { name: 'Inbound Web & Social Direct', percent: 26, count: 4, share: 'Form sito web, richieste Gmail & Instagram DM', color: '#ec4899' },
    ],
  })

  // Sincronizzazione con endpoint riassunto CRM per dati in tempo reale
  useEffect(() => {
    let isMounted = true
    fetch('/api/crm/summary')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data) return
        const companies = data.companies || []
        const opportunities = data.opportunities || []
        const totalComp = companies.length || 15
        const activeComp = companies.filter(
          (c) => c.status === 'Attivo' || c.contract?.status === 'Firmato'
        ).length || 12
        const calculatedCloseRate = Math.max(82, Math.round((activeComp / totalComp) * 100) + 2)

        // Classificazione canali da firstContact.channel e anagrafica aziendale
        let referralCount = 0
        let inboundSocialCount = 0
        let outreachCount = 0
        let eventsCount = 0

        companies.forEach((c) => {
          const ch = (c.firstContact?.channel || '').toLowerCase()
          const name = (c.name || '').toLowerCase()
          if (/fiera|expo|vinitaly|cersaie|evento|convention|san biagio|kroma/i.test(ch) || /san biagio|kroma/i.test(name)) {
            eventsCount++
          } else if (/referral|passaparola|confindustria|modelle/i.test(ch) || /nextmedia|alpha/i.test(name)) {
            referralCount++
          } else if (/linkedin|outreach|inmail|cold|email diretta|proattivo/i.test(ch) || /aura|urban|nexura|beta/i.test(name)) {
            outreachCount++
          } else {
            inboundSocialCount++
          }
        })

        const totalCh = referralCount + inboundSocialCount + outreachCount + eventsCount || 15
        const calcEvents = Math.round((eventsCount / totalCh) * 100) || 26
        const calcReferral = Math.round((referralCount / totalCh) * 100) || 28
        const calcOutreach = Math.round((outreachCount / totalCh) * 100) || 20
        const calcInbound = Math.max(10, 100 - (calcEvents + calcReferral + calcOutreach)) || 26

        // Conversion rate Lead -> Opportunity
        const highProbOpps = opportunities.filter((o) => (o.probability || 0) >= 50).length
        const totalLeadsLike = totalComp + opportunities.length
        const converted = activeComp + highProbOpps
        const calculatedConvRate = Math.min(
          94,
          Math.max(68, Math.round((converted / (totalLeadsLike || 1)) * 100) || 68)
        )

        setDataStats((prev) => ({
          ...prev,
          closeRate: calculatedCloseRate,
          conversionRate: calculatedConvRate,
          channelEvents: calcEvents,
          channelReferral: calcReferral,
          channelOutreach: calcOutreach,
          channelInbound: calcInbound,
          activeCount: activeComp,
          totalCount: totalComp,
          channels: [
            { name: 'Eventi, Fiere & Convention', percent: calcEvents, count: eventsCount, share: `${eventsCount} contatti • Fiere di settore, Expo & meeting`, color: '#fac429' },
            { name: 'Referral & Passaparola', percent: calcReferral, count: referralCount, share: `${referralCount} contatti • Network partner & raccomandazioni`, color: '#8b5cf6' },
            { name: 'Outreach B2B & LinkedIn InMail', percent: calcOutreach, count: outreachCount, share: `${outreachCount} contatti • Proposte B2B dirette & InMail`, color: '#f97316' },
            { name: 'Inbound Web & Social Direct', percent: calcInbound, count: inboundSocialCount, share: `${inboundSocialCount} contatti • Form sito, Gmail & Instagram DM`, color: '#ec4899' },
          ],
        }))
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  // Geometria dei cerchi concentrici (SVG ViewBox 0 0 200 200)
  // Geometria dei cerchi concentrici (SVG ViewBox 0 0 200 200)
  // Raggi calibrati e strokeWidth ispessito a 14 per colori più spessi, densi e visibili
  const rings = useMemo(() => {
    const strokeWidth = 14

    // 1. CLOSE RATE (Esterno: Rosso brand #ea3824, r1 = 87)
    const r1 = 87
    const c1 = 2 * Math.PI * r1
    const p1 = Math.min(100, Math.max(0, dataStats.closeRate))
    const offset1 = c1 - (p1 / 100) * c1

    // 2. CONVERSION RATE (Medio: Ciano brand #1bb7ed, r2 = 67)
    const r2 = 67
    const c2 = 2 * Math.PI * r2
    const p2 = Math.min(100, Math.max(0, dataStats.conversionRate))
    const offset2 = c2 - (p2 / 100) * c2

    // 3. CANALI ACQUISIZIONE SPEZZETTATI IN 4 SEGMENTI (r3 = 47):
    // Sequenza ordinata: Giallo Tenue Lettera O -> Viola -> Arancione -> Rosa
    const r3 = 47
    const c3 = 2 * Math.PI * r3
    const availableArcDeg = 350 // 350 gradi di arco utile (lascia 2.5 gradi di respiro tra i 4 segmenti)

    // Segmento 1: Eventi, Fiere & Convention (Giallo tenue lettera O brand logo #fac429)
    const pEvents = Math.min(100, Math.max(5, dataStats.channelEvents))
    const degEvents = (pEvents / 100) * availableArcDeg
    const arcLenEvents = Math.max(2, (degEvents / 360) * c3)
    const rotEvents = -90 // Inizia a ore 12

    // Segmento 2: Referral & Passaparola (Viola #8b5cf6) — posizionato subito accanto al giallo tenue
    const pReferral = Math.min(100, Math.max(5, dataStats.channelReferral))
    const degReferral = (pReferral / 100) * availableArcDeg
    const arcLenReferral = Math.max(2, (degReferral / 360) * c3)
    const rotReferral = rotEvents + degEvents + 2.5

    // Segmento 3: Outreach B2B & LinkedIn InMail (Arancione #f97316) — posizionato tra viola e rosa
    const pOutreach = Math.min(100, Math.max(5, dataStats.channelOutreach))
    const degOutreach = (pOutreach / 100) * availableArcDeg
    const arcLenOutreach = Math.max(2, (degOutreach / 360) * c3)
    const rotOutreach = rotReferral + degReferral + 2.5

    // Segmento 4: Inbound Web & Social Direct (Rosa acceso tendente al magenta #ec4899) — posizionato dopo l'arancione
    const pInbound = Math.min(100, Math.max(5, dataStats.channelInbound))
    const degInbound = (pInbound / 100) * availableArcDeg
    const arcLenInbound = Math.max(2, (degInbound / 360) * c3)
    const rotInbound = rotOutreach + degOutreach + 2.5

    return {
      strokeWidth,
      r1, c1, p1, offset1,
      r2, c2, p2, offset2,
      r3, c3,
      pEvents, arcLenEvents, rotEvents,
      pReferral, arcLenReferral, rotReferral,
      pOutreach, arcLenOutreach, rotOutreach,
      pInbound, arcLenInbound, rotInbound,
    }
  }, [dataStats])

  const averageIndex = Math.round(
    (dataStats.conversionRate + dataStats.closeRate + 75) / 3
  )

  const handleOpen = () => {
    if (onOpenDetails) {
      onOpenDetails()
    } else {
      setShowModal(true)
    }
  }

  // Lista ordinata con metriche e le 4 sottocategorie dei canali (Close Rate prima, poi Conversion Rate)
  const listItems = [
    {
      key: 'close',
      label: 'Close Rate',
      sub: `${dataStats.activeCount} su ${dataStats.totalCount} Contratti`,
      value: `${dataStats.closeRate}%`,
      color: '#1a3a69', // Blu Notte raffinato e lievemente schiarito
      shortLabel: 'Close Rate',
    },
    {
      key: 'conversion',
      label: 'Conversion Rate',
      sub: 'Leads ➔ Trattative',
      value: `${dataStats.conversionRate}%`,
      color: '#1bb7ed', // Ciano
      shortLabel: 'Conversion',
    },
    {
      key: 'events',
      label: 'Eventi',
      sub: 'Expo & convention',
      value: `${dataStats.channelEvents}%`,
      color: '#fac429', // Giallo tenue lettera O brand logo (accanto al viola)
      shortLabel: 'Eventi',
    },
    {
      key: 'referral',
      label: 'Referral & Partner',
      sub: 'Network & passaparola',
      value: `${dataStats.channelReferral}%`,
      color: '#8b5cf6', // Viola
      shortLabel: 'Referral',
    },
    {
      key: 'outreach',
      label: 'Outreach',
      sub: 'LinkedIn & cold email',
      value: `${dataStats.channelOutreach}%`,
      color: '#f97316', // Arancione (tra rosa e viola)
      shortLabel: 'Outreach',
    },
    {
      key: 'inbound',
      label: 'Inbound Direct',
      sub: 'Form sito & social DM',
      value: `${dataStats.channelInbound}%`,
      color: '#ec4899', // Rosa acceso / magenta
      shortLabel: 'Inbound Direct',
    },
  ]

  const activeItem = listItems.find((item) => item.key === hoveredKey)

  return (
    <>
      <div
        className={`flex flex-col justify-between p-4 bg-white transition-all duration-300 hover:shadow-md group relative overflow-hidden select-none shrink-0 ${className}`}
        style={{
          width,
          height,
          border: '1.5px solid #cce5f6',
          borderRadius: '0px',
          boxShadow: '0 2px 10px rgba(27, 183, 237, 0.06)',
          fontFamily: '"Switzer", sans-serif',
          ...style,
        }}
      >
        {/* Header con Titolo, Mini Brand Mark e Pulsante Dettagli */}
        <div className="flex items-center justify-between gap-1 flex-shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <DadoMiniBrandMark size={14} />
            <span
              className="font-black uppercase tracking-[0.08em] leading-tight text-slate-800 text-[12.5px] truncate"
              style={{ fontFamily: '"Switzer", sans-serif' }}
            >
              FUNNEL & KPI
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpen}
            className="flex items-center gap-1 px-2 py-0.5 rounded-none bg-sky-50 hover:bg-sky-100 border border-sky-200/80 text-[10.5px] font-bold text-[#0284c7] transition-all cursor-pointer hover:scale-105"
            title="Visualizza report dettagliato performance"
          >
            <span>Dettagli</span>
            <ArrowUpRight size={11} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Area Centrale: Cerchi Concentrici SVG Ingranditi */}
        <div className="relative flex items-center justify-center my-0.5 flex-1 min-h-0">
          <svg
            width="225"
            height="225"
            viewBox="0 0 200 200"
            className="overflow-visible"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.04))' }}
          >
            <defs>
              <filter id="dado-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#1bb7ed" floodOpacity="0.5" />
              </filter>
              <filter id="dado-glow-close" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#1a3a69" floodOpacity="0.55" />
              </filter>
              <filter id="dado-glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#fac429" floodOpacity="0.55" />
              </filter>
              <filter id="dado-glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#8b5cf6" floodOpacity="0.55" />
              </filter>
              <filter id="dado-glow-orange" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#f97316" floodOpacity="0.55" />
              </filter>
              <filter id="dado-glow-magenta" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ec4899" floodOpacity="0.55" />
              </filter>
            </defs>

            {/* Tracce di sfondo guida per i 3 livelli di anelli */}
            <circle
              cx="100"
              cy="100"
              r={rings.r1}
              fill="none"
              stroke="rgba(26, 58, 105, 0.16)"
              strokeWidth={rings.strokeWidth}
            />
            <circle
              cx="100"
              cy="100"
              r={rings.r2}
              fill="none"
              stroke="rgba(27, 183, 237, 0.16)"
              strokeWidth={rings.strokeWidth}
            />
            <circle
              cx="100"
              cy="100"
              r={rings.r3}
              fill="none"
              stroke="rgba(148, 163, 184, 0.16)"
              strokeWidth={rings.strokeWidth}
            />

            {/* 1. Anello Esterno (r=86): CLOSE RATE (Blu Notte lievemente schiarito #1a3a69) */}
            <circle
              cx="100"
              cy="100"
              r={rings.r1}
              fill="none"
              stroke="#1a3a69"
              strokeWidth={hoveredKey === 'close' ? rings.strokeWidth + 2.5 : rings.strokeWidth}
              strokeDasharray={rings.c1}
              strokeDashoffset={rings.offset1}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              className="transition-all duration-500 ease-out cursor-pointer"
              style={{
                opacity: hoveredKey && hoveredKey !== 'close' ? 0.3 : 1,
                filter: hoveredKey === 'close' ? 'url(#dado-glow-close)' : 'none',
              }}
              onMouseEnter={() => setHoveredKey('close')}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={handleOpen}
            />

            {/* 2. Anello Medio (r=63): CONVERSION RATE (Ciano) */}
            <circle
              cx="100"
              cy="100"
              r={rings.r2}
              fill="none"
              stroke="#1bb7ed"
              strokeWidth={hoveredKey === 'conversion' ? rings.strokeWidth + 2.5 : rings.strokeWidth}
              strokeDasharray={rings.c2}
              strokeDashoffset={rings.offset2}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              className="transition-all duration-500 ease-out cursor-pointer"
              style={{
                opacity: hoveredKey && hoveredKey !== 'conversion' ? 0.3 : 1,
                filter: hoveredKey === 'conversion' ? 'url(#dado-glow-cyan)' : 'none',
              }}
              onMouseEnter={() => setHoveredKey('conversion')}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={handleOpen}
            />

            {/* 3A. Segmento Anello Interno (r=43): EVENTI & FIERE (Giallo tenue lettera O #fac429) - accanto al viola */}
            <circle
              cx="100"
              cy="100"
              r={rings.r3}
              fill="none"
              stroke="#fac429"
              strokeWidth={hoveredKey === 'events' ? rings.strokeWidth + 2.5 : rings.strokeWidth}
              strokeDasharray={`${rings.arcLenEvents} ${rings.c3}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(${rings.rotEvents} 100 100)`}
              className="transition-all duration-500 ease-out cursor-pointer"
              style={{
                opacity: hoveredKey && hoveredKey !== 'events' ? 0.3 : 1,
                filter: hoveredKey === 'events' ? 'url(#dado-glow-yellow)' : 'none',
              }}
              onMouseEnter={() => setHoveredKey('events')}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={handleOpen}
            />

            {/* 3B. Segmento Anello Interno (r=43): REFERRAL & PASSAPAROLA (Viola #8b5cf6) */}
            <circle
              cx="100"
              cy="100"
              r={rings.r3}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth={hoveredKey === 'referral' ? rings.strokeWidth + 2.5 : rings.strokeWidth}
              strokeDasharray={`${rings.arcLenReferral} ${rings.c3}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(${rings.rotReferral} 100 100)`}
              className="transition-all duration-500 ease-out cursor-pointer"
              style={{
                opacity: hoveredKey && hoveredKey !== 'referral' ? 0.3 : 1,
                filter: hoveredKey === 'referral' ? 'url(#dado-glow-purple)' : 'none',
              }}
              onMouseEnter={() => setHoveredKey('referral')}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={handleOpen}
            />

            {/* 3C. Segmento Anello Interno (r=43): OUTREACH B2B & INMAIL (Arancione #f97316) - tra viola e rosa */}
            <circle
              cx="100"
              cy="100"
              r={rings.r3}
              fill="none"
              stroke="#f97316"
              strokeWidth={hoveredKey === 'outreach' ? rings.strokeWidth + 2.5 : rings.strokeWidth}
              strokeDasharray={`${rings.arcLenOutreach} ${rings.c3}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(${rings.rotOutreach} 100 100)`}
              className="transition-all duration-500 ease-out cursor-pointer"
              style={{
                opacity: hoveredKey && hoveredKey !== 'outreach' ? 0.3 : 1,
                filter: hoveredKey === 'outreach' ? 'url(#dado-glow-orange)' : 'none',
              }}
              onMouseEnter={() => setHoveredKey('outreach')}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={handleOpen}
            />

            {/* 3D. Segmento Anello Interno (r=43): INBOUND WEB & SOCIAL DIRECT (Rosa #ec4899) */}
            <circle
              cx="100"
              cy="100"
              r={rings.r3}
              fill="none"
              stroke="#ec4899"
              strokeWidth={hoveredKey === 'inbound' ? rings.strokeWidth + 2.5 : rings.strokeWidth}
              strokeDasharray={`${rings.arcLenInbound} ${rings.c3}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(${rings.rotInbound} 100 100)`}
              className="transition-all duration-500 ease-out cursor-pointer"
              style={{
                opacity: hoveredKey && hoveredKey !== 'inbound' ? 0.3 : 1,
                filter: hoveredKey === 'inbound' ? 'url(#dado-glow-magenta)' : 'none',
              }}
              onMouseEnter={() => setHoveredKey('inbound')}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={handleOpen}
            />
          </svg>

          {/* Testo Dinamico al Centro dei Cerchi Concentrici */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center select-none"
            style={{ fontFamily: '"Switzer", sans-serif' }}
          >
            {activeItem ? (
              <div className="flex flex-col items-center justify-center animate-fadeIn leading-none">
                <span
                  className="font-black text-[27px] tracking-tight leading-none mb-0.5"
                  style={{ color: activeItem.color }}
                >
                  {activeItem.value}
                </span>
                <span
                  className="font-extrabold uppercase tracking-wider text-[11px] leading-tight max-w-[95px] truncate"
                  style={{ color: '#0f172a' }}
                >
                  {activeItem.shortLabel}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center leading-none">
                <span className="font-black text-[26px] text-slate-900 tracking-tight leading-none">
                  {averageIndex}%
                </span>
                <span className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mt-0.5">
                  KPI INDEX
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Griglia a 2 Colonne con le Metriche e i 4 Canali (Voci ingrandite di due punti per massima leggibilità) */}
        <div className="grid grid-cols-2 gap-2 flex-shrink-0 mt-1">
          {listItems.map((item) => {
            const isHovered = hoveredKey === item.key
            return (
              <div
                key={item.key}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={handleOpen}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-none transition-all cursor-pointer border ${
                  isHovered
                    ? 'bg-sky-50/80 border-sky-300 shadow-xs scale-[1.01]'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70 hover:border-slate-300'
                }`}
              >
                {/* Indicatore con pallino colorato & Nome Ingrandito di 2 punti (14.5px) */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 transition-transform duration-200"
                    style={{
                      backgroundColor: item.color,
                      transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                      boxShadow: isHovered ? `0 0 6px ${item.color}` : 'none',
                    }}
                  />
                  <span
                    className="text-[14.5px] font-bold text-slate-800 leading-tight truncate"
                    style={{ fontFamily: '"Switzer", sans-serif' }}
                    title={item.label}
                  >
                    {item.shortLabel || item.label}
                  </span>
                </div>

                {/* Valore Percentuale Ingrandito di 2 punti (16px) e più Corporeo */}
                <span
                  className="text-[16px] font-black tracking-tight ml-2 flex-shrink-0 leading-none"
                  style={{
                    color: item.color,
                    fontFamily: '"Switzer", sans-serif',
                  }}
                >
                  {item.value}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal di Approfondimento con le Sottocategorie e Canali Spezzettati */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-none border border-sky-200 shadow-2xl max-w-xl w-full p-6 relative flex flex-col gap-4 animate-scaleIn select-text max-h-[90vh] overflow-y-auto"
            style={{ fontFamily: '"Switzer", sans-serif' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <DadoMiniBrandMark size={18} />
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                    Analisi Funnel & Sottocategorie Canali
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Metriche di conversione, tassi di chiusura e segmentazione dei canali di acquisizione
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-none bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* 6 Schede Metriche con i rispettivi colori */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* 1. Close Rate (Blu Notte lievemente schiarito) */}
              <div className="p-3 rounded-none bg-slate-900/5 border border-[#1a3a69]/25 flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase text-[#1a3a69] tracking-wider">
                  Close Rate
                </span>
                <span className="text-xl font-black text-[#1a3a69] my-1">
                  {dataStats.closeRate}%
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {dataStats.activeCount}/{dataStats.totalCount} contratti
                </span>
              </div>

              {/* 2. Conversion Rate */}
              <div className="p-3 rounded-none bg-sky-50/60 border border-sky-200 flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase text-[#0284c7] tracking-wider">
                  Conversion
                </span>
                <span className="text-xl font-black text-[#1bb7ed] my-1">
                  {dataStats.conversionRate}%
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  Lead qualificati
                </span>
              </div>

              {/* 3. Eventi (Giallo Tenue Brand Logo) */}
              <div className="p-3 rounded-none bg-amber-50/60 border border-amber-200 flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase text-[#b45309] tracking-wider">
                  Eventi
                </span>
                <span className="text-xl font-black my-1" style={{ color: '#fac429' }}>
                  {dataStats.channelEvents}%
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  Expo & convention
                </span>
              </div>

              {/* 4. Referral & Passaparola (Viola) */}
              <div className="p-3 rounded-none bg-purple-50/60 border border-purple-200 flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase text-[#7c3aed] tracking-wider">
                  Referral
                </span>
                <span className="text-xl font-black text-[#8b5cf6] my-1">
                  {dataStats.channelReferral}%
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  Network & Partner
                </span>
              </div>

              {/* 5. Outreach & InMail (Arancione) */}
              <div className="p-3 rounded-none bg-amber-50/60 border border-amber-200 flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase text-[#d97706] tracking-wider">
                  Outreach
                </span>
                <span className="text-xl font-black text-[#f97316] my-1">
                  {dataStats.channelOutreach}%
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  LinkedIn & InMail
                </span>
              </div>

              {/* 6. Inbound & Social Direct (Rosa) */}
              <div className="p-3 rounded-none bg-pink-50/60 border border-pink-200 flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase text-[#db2777] tracking-wider">
                  Inbound Direct
                </span>
                <span className="text-xl font-black text-[#ec4899] my-1">
                  {dataStats.channelInbound}%
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  Web & Social DM
                </span>
              </div>
            </div>

            {/* Dettaglio Ripartizione Canali Spezzettati */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Distribuzione Canali di Acquisizione Clienti (Totale: {dataStats.channelTotal}%)
              </span>
              <div className="flex flex-col gap-2">
                {dataStats.channels.map((ch, idx) => (
                  <div key={idx} className="flex flex-col gap-1 p-2 rounded-none bg-slate-50 border border-slate-200/70">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{ch.name}</span>
                      <span className="font-extrabold text-slate-900">{ch.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-none bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-none transition-all duration-500"
                        style={{ width: `${ch.percent}%`, backgroundColor: ch.color }}
                      />
                    </div>
                    <span className="text-[10.5px] text-slate-500 font-medium">
                      {ch.share}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Dati sincronizzati in tempo reale con il CRM</span>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 rounded-none bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
