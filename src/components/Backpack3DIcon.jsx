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
      {/* Cappuccio superiore bombato (Top Hood con flap) */}
      <path d="M4.5 6.5C4.5 3.5 7.5 2.5 10.5 2.5c3 0 5.5 1 6 3.5" />
      <path d="M4 6.5C7 8 13 8 16.5 6.5" />

      {/* Sagoma corpo principale (fronte sinistro e fondo sagomato) */}
      <path d="M4 7.5v11.5c0 1.5 2.5 2.5 6.5 2.5 2.5 0 4.5-.5 6-1.5" />
      {/* Schienale / linea posteriore destra */}
      <path d="M16.5 6.5V19" />

      {/* Spigolo in prospettiva 3/4 tra frontale e fianco destro */}
      <path d="M12.5 7.8V14" />

      {/* Bretella imbottita ad arco a destra (esatta come nell'immagine) */}
      <path d="M16 6.5C19.5 7.5 21.5 10 21 14c-.2 2.2-1.2 3.8-2.5 5" />
      <path d="M16.5 9C18.5 10 19.5 11.5 19 14" />
      {/* Fettuccia bretella inferiore */}
      <path d="M19 15.5v3" />

      {/* Cinturone lombare imbottito in basso a destra */}
      <path d="M16.5 18.5h3.5a1 1 0 0 1 1 1v.5a1 1 0 0 1-1 1h-3.5" />

      {/* Cinghie di compressione laterali sul fianco */}
      <path d="M12.5 10.5h4" />
      <path d="M12.5 12.8h4" />

      {/* Tasca laterale sul fianco */}
      <path d="M13 14.5h3.5v4H13z" />
      <path d="M13 16h3.5" />

      {/* Tasca frontale bombata inferiore con cerniera */}
      <path d="M4.5 14c0-1 1-1.5 2-1.5h4c1 0 2 .5 2 1.5v4.5c0 1-1 1.5-2 1.5h-4c-1 0-2-.5-2-1.5z" />
      <path d="M6.2 16h4" />

      {/* Cinghie verticali del cappuccio frontale */}
      <path d="M6.8 8v3" />
      <path d="M9.8 8v3" />
    </svg>
  )
}
