export default function RegisterUserIcon({
  size = 18,
  strokeWidth = 2,
  color = 'currentColor',
  className = '',
  ...props
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* ── Testa dell'utente ── */}
      <circle cx="9" cy="7" r="4" />

      {/* ── Corpo / Spalla destra (spalla sinistra rimossa per armonizzarsi con l'angolo arrotondato inferiore sinistro della dashboard) ── */}
      <path d="M16 21v-2a4 4 0 0 0-4-4H8" />

      {/* ── Segno Più (+) per nuovo utente / registrazione ── */}
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
}
