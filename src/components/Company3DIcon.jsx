export default function Company3DIcon({
  size = 26,
  strokeWidth = 1.35,
  color = 'currentColor',
  className = '',
  simplified,
  ...props
}) {
  // Tratti fini e nitidi in stile 3D architettonico
  // Raffigura SEMPRE e ovunque il grattacielo 3D ("quello singolo") affiancato da altri due palazzi
  const baseStroke = strokeWidth ? Math.min(Number(strokeWidth) * 0.62, 1.35) : 1.35
  const detailStroke = +(baseStroke * 0.86).toFixed(2)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* ── Volumi Strutturali Principali ── */}
      <g strokeWidth={baseStroke}>
        {/* 1. Linea base di fondazione */}
        <path d="M1.5 21h21" />

        {/* 2. Palazzo a sinistra (oltre a quello singolo) */}
        <path d="M2.2 21V12.2h5.3" />

        {/* 3. La Torre HQ Centrale 3D ("quello singolo" originale, maestoso al centro) */}
        <path d="M7.5 21V6.2l4.5-3.2 4.5 3.2V21" />
        {/* Spigolo centrale verticale della facciata */}
        <path d="M12 3.0V21" />
        {/* Pensilina d'ingresso vetrata al piano terra */}
        <path d="M9.8 17.6h4.4" />

        {/* 4. Palazzo a destra (oltre a quello singolo) */}
        <path d="M16.5 10.5l5.3 2.0V21" />
      </g>

      {/* ── Dettagli Fini e Vetrate ── */}
      <g strokeWidth={detailStroke}>
        {/* Vetrate palazzo a sinistra */}
        <path d="M3.2 14.5h3.2" />
        <path d="M3.2 17.5h3.2" />

        {/* Vetrate facciata sinistra Torre centrale */}
        <path d="M8.5 8.2l2.6-1.3" />
        <path d="M8.5 11.2l2.6-1.3" />
        <path d="M8.5 14.2l2.6-1.3" />
        <path d="M9.8 7.5v6.8" />

        {/* Vetrate facciata destra Torre centrale */}
        <path d="M12.9 6.9l2.6 1.3" />
        <path d="M12.9 9.9l2.6 1.3" />
        <path d="M12.9 12.9l2.6 1.3" />
        <path d="M14.2 7.5v6.8" />

        {/* Portale d'ingresso a vetri al piano terra */}
        <path d="M11 17.6v3.4" />
        <path d="M13 17.6v3.4" />

        {/* Vetrate palazzo a destra */}
        <path d="M17.6 14.0l3.0 1.1" />
        <path d="M17.6 17.0l3.0 1.1" />
        <path d="M19.1 14.5v5.5" />
      </g>
    </svg>
  )
}
