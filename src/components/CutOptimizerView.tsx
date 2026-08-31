import React, { useState } from 'react';
import { Plus, Trash2, Scissors, RefreshCw, FileText, CheckCircle2, AlertTriangle, Layers, Sparkles } from 'lucide-react';
import { solveGuillotinePacking, PieceRequest, PackingResult } from '../utils/guillotinePacker';
import CutVisualizer from './CutVisualizer';
import CutSheetPdfModal from './CutSheetPdfModal';

// Medidas predefinidas de planchas de vidrio en centímetros (cm)
const GLASS_SHEET_PRESETS = [
  { name: '180 × 250 cm', width: 250, height: 180 },
  { name: '360 × 250 cm', width: 360, height: 250 },
  { name: '160 × 250 cm', width: 250, height: 160 },
];

export const CutOptimizerView: React.FC = () => {
  // Estado de las dimensiones de la plancha madre (siempre en cm)
  const [sheetWidth, setSheetWidth] = useState<number>(250);
  const [sheetHeight, setSheetHeight] = useState<number>(180);
  const [kerfMm, setKerfMm] = useState<number>(0); // Kerf en mm

  // Estado para la tabla dinámica de piezas a cortar (Inicia VACÍO)
  const [items, setItems] = useState<PieceRequest[]>([]);

  // Estado de campos de entrada para nueva pieza
  const [newLabel, setNewLabel] = useState<string>('');
  const [newWidth, setNewWidth] = useState<string>('');
  const [newHeight, setNewHeight] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<string>('1');
  const [newAllowRotation, setNewAllowRotation] = useState<boolean>(true);

  // Resultado de la optimización
  const [packingResult, setPackingResult] = useState<PackingResult | null>(null);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Seleccionar preset de plancha
  const handleSelectPreset = (w: number, h: number) => {
    setSheetWidth(w);
    setSheetHeight(h);
  };

  // Agregar nueva pieza a la lista
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    const w = parseFloat(newWidth);
    const h = parseFloat(newHeight);
    const q = parseInt(newQuantity, 10);

    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      alert('Por favor ingrese dimensiones válidas en cm (mayores a 0).');
      return;
    }

    if (isNaN(q) || q <= 0) {
      alert('La cantidad debe ser al menos 1.');
      return;
    }

    const newItem: PieceRequest = {
      id: Date.now().toString(),
      label: newLabel.trim() || `Pieza ${w}×${h} cm`,
      width: w,
      height: h,
      quantity: q,
      allowRotation: newAllowRotation,
    };

    setItems((prev) => [...prev, newItem]);

    // Limpiar campos de entrada manteniendo valores estándar
    setNewLabel('');
    setNewWidth('');
    setNewHeight('');
    setNewQuantity('1');
  };

  // Eliminar pieza de la lista
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Cargar lista de ejemplo rápida
  const handleLoadDemo = () => {
    setSheetWidth(250);
    setSheetHeight(180);
    setKerfMm(2);
    setItems([
      { id: '1', label: 'Paño Fijo Principal', width: 140, height: 90, quantity: 2, allowRotation: true },
      { id: '2', label: 'Ventana Corrediza', width: 85, height: 70, quantity: 4, allowRotation: true },
      { id: '3', label: 'Banderola Baño', width: 60, height: 40, quantity: 3, allowRotation: true },
      { id: '4', label: 'Mampara Divisoria', width: 100, height: 50, quantity: 2, allowRotation: true },
    ]);
  };

  // Vaciar lista
  const handleClearItems = () => {
    if (confirm('¿Desea eliminar todas las piezas de la lista?')) {
      setItems([]);
      setPackingResult(null);
    }
  };

  // Ejecutar algoritmo de optimización
  const handleCalculate = () => {
    if (items.length === 0) {
      alert('Agregue al menos una pieza a la lista para calcular.');
      return;
    }

    if (sheetWidth <= 0 || sheetHeight <= 0) {
      alert('Las dimensiones de la plancha madre deben ser mayores a 0 cm.');
      return;
    }

    const result = solveGuillotinePacking(sheetWidth, sheetHeight, items, kerfMm);
    setPackingResult(result);
    setActiveSheetIndex(0);
  };

  const currentSheet = packingResult?.sheets[activeSheetIndex];

  return (
    <div className="space-y-6">
      {/* Encabezado Principal de la Vista */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-sky-900/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-sky-500/20 text-sky-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-sky-400/30 uppercase tracking-wider">
                Restricción Guillotina 2D
              </span>
              <span className="text-slate-400 text-xs">• Vidriería</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Scissors className="w-7 h-7 text-sky-400 shrink-0" />
              Optimizador de Cortes de Vidrio
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Calcula la distribución óptima de corte en planchas madre con cortes guillotina de lado a lado. Minimiza el desperdicio y preserva el retazo sobrante reutilizable.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadDemo}
            className="px-3.5 py-2 bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-sky-300" />
            <span>Cargar Ejemplo Demo</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Formulario de Entrada + Tabla de Piezas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Panel Izquierdo: Configuración de la Plancha Madre (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-stone-200 space-y-5">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Layers className="w-5 h-5 text-sky-600" />
            <h2 className="font-extrabold text-stone-900 text-base">Plancha Madre de Vidrio</h2>
          </div>

          {/* Presets Rápides de Planchas Predefinidas en cm */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Presets de Vidrio Predefinidos (cm)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {GLASS_SHEET_PRESETS.map((preset) => {
                const isSelected = sheetWidth === preset.width && sheetHeight === preset.height;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset.width, preset.height)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex justify-between items-center ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-sm'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>Hoja Estándar: <strong>{preset.name}</strong></span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimensiones Personalizadas en cm */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Ancho (cm)
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={sheetWidth}
                onChange={(e) => setSheetWidth(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-extrabold text-stone-900 focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                placeholder="250"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Alto (cm)
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={sheetHeight}
                onChange={(e) => setSheetHeight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-extrabold text-stone-900 focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                placeholder="180"
              />
            </div>
          </div>

          {/* Configuración de Kerf / Sangría de corte */}
          <div className="pt-2 border-t border-stone-100">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Sangría / Espesor de Corte (Kerf)
              </label>
              <span className="text-xs text-sky-700 font-extrabold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                {kerfMm} mm ({kerfMm / 10} cm)
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={kerfMm}
              onChange={(e) => setKerfMm(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:ring-2 focus:ring-sky-500 transition-all"
              placeholder="0 (ej: 2mm para disco/vidrio)"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Holgura en milímetros consumida por el corte de disco o ruleta.
            </p>
          </div>

          {/* Resumen de Área Plancha */}
          <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span>Superficie por Plancha:</span>
              <strong className="text-white font-extrabold">
                {(sheetWidth * sheetHeight).toLocaleString('es-ES')} cm² (
                {((sheetWidth * sheetHeight) / 10000).toFixed(2)} m²)
              </strong>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Formulario y Tabla de Piezas a Cortar (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 shadow-sm border border-stone-200 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-stone-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-sky-600" />
                <h2 className="font-extrabold text-stone-900 text-base">
                  Piezas a Cortar ({items.reduce((acc, item) => acc + (item.quantity || 1), 0)} unidades)
                </h2>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearItems}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold transition-colors"
                >
                  Vaciar lista
                </button>
              )}
            </div>

            {/* Formulario de Entrada Rápida de Nueva Pieza */}
            <form onSubmit={handleAddItem} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Etiqueta Descriptiva
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Ej: Paño fijo"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Ancho (cm) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    required
                    value={newWidth}
                    onChange={(e) => setNewWidth(e.target.value)}
                    placeholder="120"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Alto (cm) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    required
                    value={newHeight}
                    onChange={(e) => setNewHeight(e.target.value)}
                    placeholder="80"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Cant. *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rotationCheck"
                  checked={newAllowRotation}
                  onChange={(e) => setNewAllowRotation(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-stone-300 focus:ring-sky-500"
                />
                <label htmlFor="rotationCheck" className="text-xs font-semibold text-stone-700 select-none cursor-pointer">
                  Permitir rotación de pieza a 90° para mejorar aprovechamiento
                </label>
              </div>
            </form>

            {/* Tabla Dinámica de Piezas (Sin columnas de Superficie ni Rotación) */}
            <div className="overflow-x-auto border border-stone-200 rounded-xl max-h-60 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-stone-100 text-stone-700 font-extrabold sticky top-0 border-b border-stone-200">
                  <tr>
                    <th className="py-2 px-3">Etiqueta</th>
                    <th className="py-2 px-3">Medidas (Ancho × Alto)</th>
                    <th className="py-2 px-3 text-center">Cantidad</th>
                    <th className="py-2 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-medium">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-stone-400 italic">
                        No hay piezas agregadas aún. Ingrese piezas arriba o pulse "Cargar Ejemplo Demo".
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-sky-50/50 transition-colors">
                        <td className="py-2 px-3 font-bold text-stone-900">{item.label}</td>
                        <td className="py-2 px-3 font-extrabold text-sky-900">
                          {item.width} × {item.height} cm
                        </td>
                        <td className="py-2 px-3 text-center font-bold">{item.quantity}</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-stone-400 hover:text-rose-600 p-1 transition-colors rounded-lg hover:bg-rose-50"
                            title="Eliminar pieza"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botón Principal "Calcular Optimización" */}
          <div className="pt-3">
            <button
              type="button"
              onClick={handleCalculate}
              className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-black text-sm rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Calcular Optimización de Cortes 2D</span>
            </button>
          </div>
        </div>
      </div>

      {/* PANEL DE RESULTADOS Y VISUALIZACIÓN */}
      {packingResult && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-stone-200 space-y-6">
          {/* Encabezado del Panel de Resultados */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-200 pb-4">
            <div>
              <h2 className="font-black text-stone-900 text-xl flex items-center gap-2">
                <span>Resultados de Optimización</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {packingResult.overallEfficiencyPct}% Eficiencia Total
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Planchas de vidrio requeridas: <strong>{packingResult.sheets.length}</strong> | Piezas colocadas: <strong>{packingResult.totalPiecesPlaced} / {packingResult.totalPiecesRequested}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Generar Ficha Técnica (PDF / Taller)</span>
            </button>
          </div>

          {/* Tarjetas de Métricas Principales */}
          {currentSheet && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-950">
                <span className="text-[11px] font-bold uppercase text-emerald-700 block mb-1">
                  % Aprovechamiento
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-800">
                  {currentSheet.usedPercentage}%
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  {(currentSheet.usedArea / 10000).toFixed(2)} m² de material útil
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-950">
                <span className="text-[11px] font-bold uppercase text-amber-700 block mb-1">
                  % Desperdicio
                </span>
                <div className="text-2xl sm:text-3xl font-black text-amber-800">
                  {currentSheet.wastePercentage}%
                </div>
                <p className="text-[11px] text-amber-700 mt-1">
                  {(currentSheet.wasteArea / 10000).toFixed(2)} m² recortes
                </p>
              </div>

              <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-sky-950 col-span-2 sm:col-span-2">
                <span className="text-[11px] font-bold uppercase text-sky-700 block mb-1 flex items-center gap-1">
                  <span>♻ Retazo Reutilizable Principal</span>
                </span>
                {currentSheet.mainOffcut ? (
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-sky-900">
                      {currentSheet.mainOffcut.width} × {currentSheet.mainOffcut.height} cm
                    </div>
                    <p className="text-[11px] text-sky-800 font-semibold mt-1">
                      Pieza limpia continua disponible: {(currentSheet.mainOffcut.area / 10000).toFixed(2)} m² ({currentSheet.mainOffcut.area.toLocaleString('es-ES')} cm²)
                    </p>
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-sky-800 italic mt-2">
                    Sin retazo rectangular grande libre
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selector de Planchas (Si hay más de 1 plancha necesaria) */}
          {packingResult.sheets.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-extrabold text-stone-700 shrink-0">Seleccionar Plancha:</span>
              {packingResult.sheets.map((sheet, index) => (
                <button
                  key={sheet.sheetIndex}
                  type="button"
                  onClick={() => setActiveSheetIndex(index)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border shrink-0 ${
                    activeSheetIndex === index
                      ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                      : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                  }`}
                >
                  Plancha #{sheet.sheetIndex} ({sheet.usedPercentage}% uso)
                </button>
              ))}
            </div>
          )}

          {/* Piezas no colocadas (Aviso en caso de que alguna pieza no haya entrado) */}
          {packingResult.unplacedPieces.length > 0 && (
            <div className="bg-rose-50 border border-rose-300 text-rose-900 p-3.5 rounded-xl flex items-start gap-3 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">
                  Atención: {packingResult.unplacedPieces.length} piezas no pudieron colocarse en el límite de planchas.
                </strong>
                <p className="mt-0.5 text-rose-800">
                  Considere agregar una plancha madre adicional o aumentar las dimensiones del material.
                </p>
              </div>
            </div>
          )}

          {/* Componente de Visualizador Gráfico SVG */}
          {currentSheet && (
            <div>
              <CutVisualizer sheet={currentSheet} showDimensions={true} />
            </div>
          )}
        </div>
      )}

      {/* Modal Ficha Técnica PDF */}
      {packingResult && (
        <CutSheetPdfModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          result={packingResult}
          sheetWidth={sheetWidth}
          sheetHeight={sheetHeight}
          kerfMm={kerfMm}
        />
      )}
    </div>
  );
};

export default CutOptimizerView;
