import React, { useRef, useState } from 'react';
import { X, Download, Printer, CheckCircle, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { PackingResult } from '../utils/guillotinePacker';
import Logo from './Logo';

interface CutSheetPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PackingResult;
  sheetWidth: number;
  sheetHeight: number;
  kerfMm: number;
}

export const CutSheetPdfModal: React.FC<CutSheetPdfModalProps> = ({
  isOpen,
  onClose,
  result,
  sheetWidth,
  sheetHeight,
  kerfMm,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !result || result.sheets.length === 0) return null;

  const handleDownloadPdf = async () => {
    if (!printContentRef.current) return;
    setIsGenerating(true);

    try {
      const today = new Date().toISOString().slice(0, 10);
      const filename = `Ficha_de_Corte_${sheetWidth}x${sheetHeight}_${today}.pdf`;

      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 1.8, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(printContentRef.current).save();
      setDownloaded(true);
    } catch (err) {
      console.error('Error generando PDF de cortes:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-stone-300 print:max-h-none print:shadow-none print:border-none">
        
        {/* Encabezado del Modal (Oculto al imprimir) */}
        <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                Ficha Técnica de Corte para Taller
              </h3>
              <p className="text-xs text-slate-400">
                Plano limpio y lista de piezas para operarios de corte
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cuerpo Imprimible */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 print:bg-white print:p-0">
          <div
            ref={printContentRef}
            className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 text-slate-800 text-xs print:shadow-none print:border-none print:p-2"
          >
            {/* Header Ficha Técnica */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
              <div>
                <Logo className="w-36 h-auto mb-2" />
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                  Ficha Técnica de Corte de Vidrio
                </h1>
                <p className="text-slate-600 text-xs font-semibold">
                  Instrucciones y lista de piezas para taller
                </p>
              </div>
              <div className="text-right text-xs text-slate-600 space-y-1">
                <div>Fecha: <strong className="text-slate-900">{todayStr}</strong></div>
                <div>Kerf / Sangría: <strong className="text-slate-900">{kerfMm} mm</strong> ({kerfMm / 10} cm)</div>
                <div>Planchas necesarias: <strong className="text-slate-900">{result.sheets.length}</strong></div>
                <div>Eficiencia global: <strong className="text-emerald-700 font-bold">{result.overallEfficiencyPct}%</strong></div>
              </div>
            </div>

            {/* Especificaciones de Plancha */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Plancha Madre</span>
                <strong className="text-sm font-extrabold text-slate-900">{sheetWidth} × {sheetHeight} cm</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Piezas Solicitadas</span>
                <strong className="text-sm font-extrabold text-slate-900">{result.totalPiecesRequested} u.</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Piezas Colocadas</span>
                <strong className="text-sm font-extrabold text-emerald-600">{result.totalPiecesPlaced} u.</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Restricción</span>
                <strong className="text-sm font-extrabold text-sky-700">GUILLOTINA 2D</strong>
              </div>
            </div>

            {/* Hojas de Plancha / Planos */}
            {result.sheets.map((sheet) => (
              <div key={sheet.sheetIndex} className="mb-8 border border-slate-300 rounded-xl p-4 bg-white page-break-inside-avoid">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                  <h3 className="font-bold text-sm text-slate-900">
                    PLANCHA #{sheet.sheetIndex} DE {result.sheets.length} ({sheet.sheetWidth} × {sheet.sheetHeight} cm)
                  </h3>
                  <div className="text-xs text-slate-600 space-x-3">
                    <span>Aprovechamiento: <strong className="text-emerald-700">{sheet.usedPercentage}%</strong></span>
                    <span>Desperdicio: <strong className="text-amber-700">{sheet.wastePercentage}%</strong></span>
                  </div>
                </div>

                {/* Plano SVG Limpio y Minimalista para impresión */}
                <div className="w-full bg-slate-900 rounded-lg p-2 mb-4">
                  <svg
                    viewBox={`-15 -15 ${sheet.sheetWidth + 30} ${sheet.sheetHeight + 30}`}
                    className="w-full h-auto max-h-[350px]"
                  >
                    <defs>
                      {sheet.placedPieces.map((piece, idx) => (
                        <clipPath key={`clip-pdf-${idx}`} id={`clip-piece-pdf-${sheet.sheetIndex}-${idx}`}>
                          <rect
                            x={piece.x + 1}
                            y={piece.y + 1}
                            width={Math.max(0, piece.width - 2)}
                            height={Math.max(0, piece.height - 2)}
                          />
                        </clipPath>
                      ))}
                    </defs>

                    {/* Hoja Madre */}
                    <rect
                      x="0"
                      y="0"
                      width={sheet.sheetWidth}
                      height={sheet.sheetHeight}
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />

                    {/* Retazo Sobrante Reutilizable "A" (Línea punteada sutil) */}
                    {sheet.mainOffcut && (
                      <g>
                        <rect
                          x={sheet.mainOffcut.x}
                          y={sheet.mainOffcut.y}
                          width={sheet.mainOffcut.width}
                          height={sheet.mainOffcut.height}
                          fill="rgba(16, 185, 129, 0.08)"
                          stroke="#10b981"
                          strokeWidth="1.2"
                          strokeDasharray="4,4"
                        />
                        {/* Marca "A" limpia y minimalista en el centro */}
                        <g transform={`translate(${sheet.mainOffcut.x + sheet.mainOffcut.width / 2}, ${sheet.mainOffcut.y + sheet.mainOffcut.height / 2})`}>
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
                      </g>
                    )}

                    {/* Piezas colocadas en PDF: ÚNICAMENTE #Número Centrado */}
                    {sheet.placedPieces.map((piece, idx) => {
                      const fontSizeNum = Math.max(7, Math.min(15, Math.min(piece.width, piece.height) / 2.2));

                      return (
                        <g key={piece.id}>
                          <rect
                            x={piece.x}
                            y={piece.y}
                            width={piece.width}
                            height={piece.height}
                            fill={piece.color}
                            fillOpacity="0.85"
                            stroke="#ffffff"
                            strokeWidth="0.8"
                          />

                          <g clipPath={`url(#clip-piece-pdf-${sheet.sheetIndex}-${idx})`}>
                            <g transform={`translate(${piece.x + piece.width / 2}, ${piece.y + piece.height / 2})`}>
                              <text
                                x="0"
                                y={fontSizeNum / 3}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={fontSizeNum}
                                fontWeight="900"
                              >
                                #{idx + 1}
                              </text>
                            </g>
                          </g>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Tabla de Piezas de la Plancha */}
                <h4 className="font-bold text-slate-800 text-xs mb-2">Detalle de Cortes de Plancha #{sheet.sheetIndex}</h4>
                <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                      <th className="p-1.5 border-r border-slate-300 text-center w-10">#</th>
                      <th className="p-1.5 border-r border-slate-300">Etiqueta / Descripción</th>
                      <th className="p-1.5 border-r border-slate-300">Medida (Ancho × Alto)</th>
                      <th className="p-1.5 border-r border-slate-300">Superficie</th>
                      <th className="p-1.5 border-r border-slate-300">Posición (X, Y)</th>
                      <th className="p-1.5">Rotación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.placedPieces.map((piece, i) => (
                      <tr key={piece.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-1.5 border-r border-slate-200 font-bold text-center">#{i + 1}</td>
                        <td className="p-1.5 border-r border-slate-200 font-semibold">{piece.label}</td>
                        <td className="p-1.5 border-r border-slate-200 font-bold text-slate-900">
                          {piece.width} × {piece.height} cm
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-slate-600">
                          {(piece.width * piece.height).toLocaleString('es-ES')} cm²
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-slate-600">
                          ({piece.x}, {piece.y}) cm
                        </td>
                        <td className="p-1.5 font-medium">
                          {piece.rotated ? (
                            <span className="text-amber-700 font-bold">Sí (90°)</span>
                          ) : (
                            <span className="text-slate-500">No</span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Referencia limpia a 'A' para el Retazo Sobrante */}
                    {sheet.mainOffcut && (
                      <tr className="bg-emerald-50/70 text-emerald-950 font-bold border-t border-emerald-300">
                        <td className="p-1.5 border-r border-emerald-200 text-center">
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] inline-flex items-center justify-center">
                            A
                          </span>
                        </td>
                        <td className="p-1.5 border-r border-emerald-200 font-extrabold text-emerald-900">
                          Retazo Sobrante Reutilizable (Stock)
                        </td>
                        <td className="p-1.5 border-r border-emerald-200 font-black text-emerald-900">
                          {sheet.mainOffcut.width} × {sheet.mainOffcut.height} cm
                        </td>
                        <td className="p-1.5 border-r border-emerald-200 text-emerald-800">
                          {sheet.mainOffcut.area.toLocaleString('es-ES')} cm² ({(sheet.mainOffcut.area / 10000).toFixed(2)} m²)
                        </td>
                        <td className="p-1.5 border-r border-emerald-200 text-emerald-800">
                          ({sheet.mainOffcut.x}, {sheet.mainOffcut.y}) cm
                        </td>
                        <td className="p-1.5 text-emerald-900 font-semibold">
                          Remanente Útil
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Pie de Ficha */}
            <div className="mt-6 pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
              <div>Vidriería Vallcanera — Sistema de Optimización de Cortes de Vidrio 2D</div>
              <div>Hoja de Taller generada el {todayStr}</div>
            </div>
          </div>
        </div>

        {/* Modal Footer con Botones (Oculto al imprimir) */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center gap-3 shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            Ficha limpia lista para ser impresa o enviada al taller de corte.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Plano</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <span>Generando PDF...</span>
              ) : downloaded ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>¡PDF Descargado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar Ficha PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CutSheetPdfModal;
