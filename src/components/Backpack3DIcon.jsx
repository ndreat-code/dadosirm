export default function Backpack3DIcon({
  size = 24,
  strokeWidth = 1.35,
  color = 'currentColor',
  className = '',
  ...props
}) {
  // Tratti fini come eccezione rispetto alle altre icone:
  // anche se il contenitore passa 2.1 (come la Sidebar), scaliamo a un tratto fine e nitido (~1.30 per i contorni e ~1.12 per i dettagli interni)
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
      {/* Gruppo Contorni e Volumi Principali (Tratto fine principale ~1.30px) */}
      <g strokeWidth={baseStroke}>
        {/* 1. Manico all'estremità superiore dello zaino */}
        <path d="M8.5 3C8.5 1.7 12.5 1.7 12.5 3" />

        {/* 2. Cappuccio superiore bombato (Top Hood con flap) */}
        <path d="M4.5 6C4.5 3.8 7.2 3.1 10.5 3.1c3 0 5.2.6 5.5 2.9" />
        <path d="M4 6.8c3.5 1.2 8 1.2 12 0" />

        {/* 3. Contorno silhouette principale: corpo pieno e fondo sagomato */}
        <path d="M4 6.8v12.2c0 1.5 2.5 2.5 6.5 2.5 2.3 0 4.3-.5 5.5-1.5" />
        <path d="M16 6.8V19" />

        {/* 4. Linea in prospettiva 3/4 tra frontale e fianco */}
        <path d="M12 7.5v6.5" />

        {/* 5. Bretella imbottita ad arco a destra (spallaccio in prospettiva 3/4) */}
        <path d="M15.5 6.2c3.5 1 5.7 3.5 5.4 7.5-.2 2.2-1.3 3.8-2.7 5.3" />
        <path d="M16 8.5c2 1 3 2.8 2.7 5.2" />
        <path d="M19 15.5v3" />

        {/* 6. Cinturone lombare imbottito in basso a destra */}
        <path d="M16 18.5h3.5c.8 0 1.5.5 1.5 1.2s-.7 1.3-1.5 1.3H16" />

        {/* 7. Tasca laterale sul fianco */}
        <path d="M12.5 14h3.5v4.5h-3.5z" />

        {/* 8. Tasca frontale bombata inferiore */}
        <path d="M4.2 14c0-.8.8-1.3 1.8-1.3h4c1 0 1.8.5 1.8 1.3v4.2c0 .8-.8 1.3-1.8 1.3H6c-1 0-1.8-.5-1.8-1.3z" />
      </g>

      {/* Gruppo Dettagli Fini e Minuterie (Tratto ultrafine ad alta definizione ~1.12px) */}
      <g strokeWidth={detailStroke}>
        {/* Zip orizzontale cappuccio superiore */}
        <path d="M7 4.8h5" />

        {/* Fibbia del cinturone lombare */}
        <path d="M18.5 18.5v2.5" />

        {/* Flap della tasca laterale */}
        <path d="M12.5 15.2h3.5" />

        {/* Cinghie di compressione laterali sul fianco */}
        <path d="M12 10h4" />
        <path d="M13.8 9.2h1.4v1.6h-1.4z" />
        <path d="M12 12.2h4" />

        {/* Zip della tasca frontale */}
        <path d="M5.8 15.8h4.5" />

        {/* Cinghie verticali del cappuccio e maniglia centrale frontale */}
        <path d="M6.2 7.6v3.2" />
        <path d="M9.8 7.6v3.2" />
        <path d="M8 8.8v2.6" />
      </g>
    </svg>
  )
}
