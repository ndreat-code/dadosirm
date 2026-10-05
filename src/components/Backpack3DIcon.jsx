export default function Backpack3DIcon({
  size = 24,
  strokeWidth = 2.0,
  color = 'currentColor',
  className = '',
  simplified,
  ...props
}) {
  // Tratti fini e nitidi in stile kit tecnico 3D / Lucide professionale
  // Borsa leggermente più larga e capiente, proporzionata e nitida
  const baseStroke = strokeWidth ? Math.min(Number(strokeWidth) * 0.65, 1.35) : 1.35
  const detailStroke = +(baseStroke * 0.85).toFixed(2)

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
      style={{ overflow: 'visible' }}
      {...props}
    >
      <g strokeWidth={baseStroke}>
        {/* Manico superiore sagomato */}
        <path d="M8.8 4.2C8.8 2.2 15.2 2.2 15.2 4.2" />
        {/* Patella superiore con volume ergonomico più largo */}
        <path d="M5.0 5.5h14.0v3.4c0 1.2-2.0 1.8-7.0 1.8s-7.0-.6-7.0-1.8V5.5z" />
        {/* Silhouette corpo principale dello zaino allargato */}
        <path d="M5.0 8.7v10.5a2.2 2.2 0 0 0 2.2 2.2h9.6a2.2 2.2 0 0 0 2.2-2.2V8.7" />
        {/* Tasca frontale porta-accessori allargata */}
        <path d="M6.5 13.5h11.0v5.8a1.4 1.4 0 0 1-1.4 1.4H7.9a1.4 1.4 0 0 1-1.4-1.4v-5.8z" />
      </g>
      <g strokeWidth={detailStroke}>
        {/* Cinghie verticali della patella superiore */}
        <path d="M8.4 5.5v5.0" />
        <path d="M15.6 5.5v5.0" />
        {/* Linea zip della tasca frontale */}
        <path d="M6.5 15h11.0" />
        {/* Cursore zip centrale */}
        <path d="M12 15v2" />
        {/* Cinghie laterali per aggancio accessori */}
        <path d="M3.6 12.5h1.4" />
        <path d="M3.6 16.5h1.4" />
        <path d="M19.0 12.5h1.4" />
        <path d="M19.0 16.5h1.4" />
      </g>
    </svg>
  )
}
