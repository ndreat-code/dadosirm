export default function Backpack3DIcon({
  size = 24,
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
      {/* 1. Manico all'estremità superiore dello zaino */}
      <path d="M8.5 3C8.5 1.7 12.5 1.7 12.5 3" />

      {/* 2. Cappuccio superiore bombato (Top Hood con flap e zip) */}
      <path d="M4.5 6C4.5 3.8 7.2 3.1 10.5 3.1c3 0 5.2.6 5.5 2.9" />
      <path d="M4 6.8c3.5 1.2 8 1.2 12 0" />
      <path d="M7 4.8h5" />

      {/* 3. Contorno silhouette principale: corpo pieno e fondo sagomato */}
      <path d="M4 6.8v12.2c0 1.5 2.5 2.5 6.5 2.5 2.3 0 4.3-.5 5.5-1.5" />
      <path d="M16 6.8V19" />

      {/* 4. Linea in prospettiva 3/4 tra frontale e fianco */}
      <path d="M12 7.5v6.5" />

      {/* 5. Bretella imbottita ad arco a destra (spallaccio in prospettiva 3/4) */}
      <path d="M15.5 6.2c3.5 1 5.7 3.5 5.4 7.5-.2 2.2-1.3 3.8-2.7 5.3" />
      <path d="M16 8.5c2 1 3 2.8 2.7 5.2" />
      <path d="M19 15.5v3" />

      {/* 6. Cinturone lombare imbottito in basso a destra con fibbia */}
      <path d="M16 18.5h3.5c.8 0 1.5.5 1.5 1.2s-.7 1.3-1.5 1.3H16" />
      <path d="M18.5 18.5v2.5" />

      {/* 7. Tasca laterale sul fianco con flap */}
      <path d="M12.5 14h3.5v4.5h-3.5z" />
      <path d="M12.5 15.2h3.5" />

      {/* 8. Cinghie di compressione laterali sul fianco con fibbia */}
      <path d="M12 10h4" />
      <path d="M13.8 9.2h1.4v1.6h-1.4z" />
      <path d="M12 12.2h4" />

      {/* 9. Tasca frontale bombata inferiore con zip */}
      <path d="M4.2 14c0-.8.8-1.3 1.8-1.3h4c1 0 1.8.5 1.8 1.3v4.2c0 .8-.8 1.3-1.8 1.3H6c-1 0-1.8-.5-1.8-1.3z" />
      <path d="M5.8 15.8h4.5" />

      {/* 10. Cinghie verticali del cappuccio e maniglia centrale frontale */}
      <path d="M6.2 7.6v3.2" />
      <path d="M9.8 7.6v3.2" />
      <path d="M8 8.8v2.6" />
    </svg>
  )
}
