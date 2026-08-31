import React from 'react';
import { SheetResult } from '../utils/guillotinePacker';

interface CutVisualizerProps {
  sheet: SheetResult;
  showDimensions?: boolean;
}

export const CutVisualizer: React.FC<CutVisualizerProps> = ({
  sheet,
  showDimensions = true,
}) => {
  const { sheetWidth, sheetHeight, placedPieces, mainOffcut } = sheet;

  // Márgenes SVG en unidades del plano (cm) para acomodar las cotas exteriores
  const marginX = 22; // cm
  const marginY = 22; // cm

  const svgWidth = sheetWidth + marginX * 2;
  const svgHeight = sheetHeight + marginY * 2;

  // Transformación para ubicar el origen (0,0) de la plancha dentro del SVG con márgenes
  const originX = marginX;
  const originY = marginY;

  return (
    <div className="w-full bg-slate-900 rounded-xl p-3 sm:p-4 shadow-inner overflow-hidden flex flex-col items-center">
      {/* Encabezado del plano */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-slate-300 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="font-bold text-sky-400">Plancha #{sheet.sheetIndex}</span>
          <span>•</span>
          <span>{sheetWidth} × {sheetHeight} cm</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block border border-sky-300"></span>
            Piezas colocadas ({placedPieces.length})
          </span>
          {mainOffcut && (
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center inline-flex">
                A
              </span>
              <span>Retazo sobrante ({mainOffcut.width} × {mainOffcut.height} cm)</span>
            </span>
          )}
        </div>
      </div>

      {/* Renderizado SVG escalable */}
      <div className="w-full flex justify-center items-center overflow-auto max-h-[70vh]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-w-full font-sans select-none"
          style={{ minWidth: '280px' }}
        >
          <defs>
            {/* Patrón de grilla de fondo sutil para vidrio */}
            <pattern id="glass-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
            {/* Sombreado libre sutil */}
            <pattern id="waste-hatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="rgba(239, 68, 68, 0.1)" strokeWidth="1.5" />
            </pattern>

            {/* ClipPaths para evitar estricta y matemáticamente cualquier desborde */}
            {placedPieces.map((piece, idx) => {
              const px = originX + piece.x;
              const py = originY + piece.y;
              return (
                <clipPath key={`clip-${idx}`} id={`clip-piece-vis-${idx}`}>
                  <rect
                    x={px + 1}
                    y={py + 1}
                    width={Math.max(0, piece.width - 2)}
                    height={Math.max(0, piece.height - 2)}
                  />
                </clipPath>
              );
            })}
          </defs>

          {/* Sombra ligera de la hoja madre */}
          <rect
            x={originX + 2}
            y={originY + 2}
            width={sheetWidth}
            height={sheetHeight}
            fill="rgba(0,0,0,0.4)"
            rx="1"
          />

          {/* Fondo de la Plancha Madre (Vidrio) */}
          <rect
            x={originX}
            y={originY}
            width={sheetWidth}
            height={sheetHeight}
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth="1.5"
            rx="1"
          />
          <rect
            x={originX}
            y={originY}
            width={sheetWidth}
            height={sheetHeight}
            fill="url(#glass-grid)"
          />

          {/* Fondo de áreas libres */}
          <rect
            x={originX}
            y={originY}
            width={sheetWidth}
            height={sheetHeight}
            fill="url(#waste-hatch)"
          />

          {/* Renderizado Minimalista del Retazo Sobrante Reutilizable ("A") */}
          {mainOffcut && (
            <g>
              <rect
                x={originX + mainOffcut.x}
                y={originY + mainOffcut.y}
                width={mainOffcut.width}
                height={mainOffcut.height}
                fill="rgba(16, 185, 129, 0.08)"
                stroke="#10b981"
                strokeWidth="1.2"
                strokeDasharray="4,4"
                rx="0.5"
              />
              {/* Distintivo 'A' minimalista centrado */}
              {mainOffcut.width >= 10 && mainOffcut.height >= 10 && (
                <g transform={`translate(${originX + mainOffcut.x + mainOffcut.width / 2}, ${originY + mainOffcut.y + mainOffcut.height / 2})`}>
                  <circle r="7.5" fill="#059669" stroke="#10b981" strokeWidth="0.8" />
                  <text
                    x="0"
                    y="2.5"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="7.5"
                    fontWeight="800"
                  >
                    A
                  </text>
                </g>
              )}
            </g>
          )}

          {/* Renderizado Ultra-Limpio de Piezas Colocadas (ÚNICAMENTE #Número Centrado) */}
          {placedPieces.map((piece, idx) => {
            const px = originX + piece.x;
            const py = originY + piece.y;
            const pw = piece.width;
            const ph = piece.height;

            const fontSizeNum = Math.max(7, Math.min(16, Math.min(pw, ph) / 2.2));

            return (
              <g key={piece.id || idx}>
                {/* Rectángulo de la Pieza */}
                <rect
                  x={px}
                  y={py}
                  width={pw}
                  height={ph}
                  fill={piece.color}
                  fillOpacity="0.85"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  rx="0.5"
                />

                {/* ÚNICAMENTE #Número Centrado dentro de la figura */}
                <g clipPath={`url(#clip-piece-vis-${idx})`}>
                  <g transform={`translate(${px + pw / 2}, ${py + ph / 2})`}>
                    <text
                      x="0"
                      y={fontSizeNum / 3}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={fontSizeNum}
                      fontWeight="900"
                      style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.9)' }}
                    >
                      #{idx + 1}
                    </text>
                  </g>
                </g>

                {/* Cotas internas muy discretas en bordes si el espacio lo permite */}
                {showDimensions && pw > 40 && ph > 30 && (
                  <g className="opacity-75">
                    <text
                      x={px + pw / 2}
                      y={py + 6}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.85)"
                      fontSize="5"
                      fontWeight="bold"
                    >
                      {pw} cm
                    </text>
                    <text
                      x={px + 4}
                      y={py + ph / 2}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.85)"
                      fontSize="5"
                      fontWeight="bold"
                      transform={`rotate(-90 ${px + 4} ${py + ph / 2})`}
                    >
                      {ph} cm
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* COTAS EXTERIORES DE LA PLANCHA MADERA EN CM */}
          {showDimensions && (
            <g className="text-slate-400 font-medium">
              {/* Cota Superior (Ancho Total) */}
              <line
                x1={originX}
                y1={originY - 8}
                x2={originX + sheetWidth}
                y2={originY - 8}
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
              <line
                x1={originX}
                y1={originY - 11}
                x2={originX}
                y2={originY - 5}
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
              <line
                x1={originX + sheetWidth}
                y1={originY - 11}
                x2={originX + sheetWidth}
                y2={originY - 5}
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
              <text
                x={originX + sheetWidth / 2}
                y={originY - 11}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="7.5"
                fontWeight="bold"
              >
                {sheetWidth} cm
              </text>

              {/* Cota Izquierda (Alto Total) */}
              <line
                x1={originX - 8}
                y1={originY}
                x2={originX - 8}
                y2={originY + sheetHeight}
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
              <line
                x1={originX - 11}
                y1={originY}
                x2={originX - 5}
                y2={originY}
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
              <line
                x1={originX - 11}
                y1={originY + sheetHeight}
                x2={originX - 5}
                y2={originY + sheetHeight}
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
              <text
                x={originX - 12}
                y={originY + sheetHeight / 2}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="7.5"
                fontWeight="bold"
                transform={`rotate(-90 ${originX - 12} ${originY + sheetHeight / 2})`}
              >
                {sheetHeight} cm
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Tabla Leyenda Impecable de la Plancha */}
      <div className="w-full mt-3 pt-3 border-t border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-[11px] text-slate-400">
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
            Detalle de Piezas en Plano (Plancha #{sheet.sheetIndex})
          </span>
          <div className="flex items-center gap-3">
            <span>Uso: <strong className="text-emerald-400">{sheet.usedPercentage}%</strong></span>
            <span>Desperdicio: <strong className="text-amber-400">{sheet.wastePercentage}%</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
          {placedPieces.map((piece, idx) => (
            <div
              key={piece.id || idx}
              className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex items-center gap-2 text-slate-200"
            >
              <span
                className="w-6 h-6 rounded-md font-black text-xs text-white flex items-center justify-center shrink-0"
                style={{ backgroundColor: piece.color }}
              >
                #{idx + 1}
              </span>
              <div className="overflow-hidden text-[11px] leading-tight">
                <strong className="block truncate text-white">{piece.label}</strong>
                <span className="text-slate-400 font-bold">{piece.width} × {piece.height} cm</span>
                {piece.rotated && <span className="ml-1 text-[10px] text-amber-400 font-bold">🔄</span>}
              </div>
            </div>
          ))}

          {mainOffcut && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-lg p-2 flex items-center gap-2 text-emerald-200">
              <span className="w-6 h-6 rounded-full bg-emerald-600 font-black text-xs text-white flex items-center justify-center shrink-0">
                A
              </span>
              <div className="text-[11px] leading-tight">
                <strong className="block text-emerald-300 truncate">Retazo Reutilizable</strong>
                <span className="text-emerald-400 font-bold">{mainOffcut.width} × {mainOffcut.height} cm</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CutVisualizer;
