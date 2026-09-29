export default function Backpack3DIcon({
  size = 24,
  strokeWidth = 1.35,
  color = 'currentColor',
  className = '',
  ...props
}) {
  // Tratti fini come eccezione rispetto alle altre icone:
  // Se la sidebar passa 2.1, scaliamo proporzionalmente a un tratto fine (~1.30px per i contorni e ~1.12px per le minuterie)
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
      {/* ── Gruppo Contorni Strutturali (Tratto fine principale ~1.30px) ── */}
      <g strokeWidth={baseStroke}>
        {/* 1. Manico all'estremità superiore */}
        <path d="M8.5 2.5C8.5 1.4 12.5 1.4 12.5 2.5" />

        {/* 2. Perimetro superiore ad arco con zip (chiusura ad arco che racchiude il perimetro) */}
        <path d="M4 8C4 3.8 7 2.6 10.5 2.6c3.2 0 5.8 1.2 6 5.4" />
        <path d="M4.5 7.8C4.5 4.5 7.2 3.6 10.5 3.6c2.8 0 5.2.8 5.5 4.2" />

        {/* 3. Contorno silhouette 3/4 (corpo pieno senza chiusure frontali) */}
        <path d="M4 7.8v12c0 1.5 2.5 2.4 6.5 2.4 2.2 0 4.2-.4 5.5-1.4" />
        <path d="M16 8v11" />
        <path d="M12 7.5v14" />

        {/* 4. Fianco: Tasca laterale e cinghia */}
        <path d="M12 14.5h4v4.5h-4z" />

        {/* 5. Bretelle posteriori reali e lunghe (come se fosse appoggiato ad una parete) */}
        {/* Bretella principale destra: scende lunga e fluida lungo lo schienale */}
        <path d="M15.5 5.2c3 .6 5.5 2.5 5.8 6.5.3 3.5-.8 6.8-2.3 9.8" />
        <path d="M16 7.2c2.2.8 3.8 2.2 4 5 .2 2.5-.6 4.8-1.8 7" />

        {/* Seconda bretella sinistra: visibile dietro, distesa verso il basso lungo la parete */}
        <path d="M5.5 4.2c-1.8 1.2-2.7 3.5-2.7 6.5 0 3.5 1.2 7 2.2 9.5" />
      </g>

      {/* ── Gruppo Dettagli Fini (Tratto ultrafine ~1.12px) ── */}
      <g strokeWidth={detailStroke}>
        {/* Cursore della zip ad arco superiore */}
        <path d="M12.8 3.2l.6 1.4" />

        {/* Unica tasca orizzontale nella parte superiore (sotto la zip perimetrale) */}
        <path d="M6 7.2h6.5" />

        {/* Linea cucitura / flap tasca laterale e cinghia di compressione */}
        <path d="M12 16h4" />
        <path d="M12 11h4" />

        {/* Terminali fettucce delle bretelle lunghe verso terra */}
        <path d="M19 19.5v2" />
        <path d="M5 20.2l-.5 1.5" />
      </g>
    </svg>
  )
}
