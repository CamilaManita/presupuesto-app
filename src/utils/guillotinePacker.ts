/**
 * Algoritmo Heurístico 2D Guillotine Packing para optimización de corte de vidrio.
 * Garantiza únicamente cortes guillotina (rectos de borde a borde).
 * Todas las dimensiones se manejan en centímetros (cm). El Kerf se ingresa en mm y se convierte a cm.
 */

export interface PieceRequest {
  id: string;
  label: string;
  width: number; // en cm
  height: number; // en cm
  quantity: number;
  allowRotation?: boolean;
  color?: string;
}

export interface IndividualPiece {
  id: string;
  originalId: string;
  label: string;
  width: number; // en cm
  height: number; // en cm
  allowRotation: boolean;
  color: string;
  pieceIndex: number;
}

export interface PlacedPiece {
  id: string;
  originalId: string;
  label: string;
  x: number; // en cm
  y: number; // en cm
  width: number; // ancho colocado en cm
  height: number; // alto colocado en cm
  rotated: boolean;
  color: string;
  pieceIndex: number;
}

export interface FreeRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UsefulOffcut {
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
}

export interface SheetResult {
  sheetIndex: number;
  sheetWidth: number; // cm
  sheetHeight: number; // cm
  placedPieces: PlacedPiece[];
  freeRectangles: FreeRectangle[];
  mainOffcut: UsefulOffcut | null;
  totalArea: number; // cm²
  usedArea: number; // cm²
  wasteArea: number; // cm²
  usedPercentage: number; // %
  wastePercentage: number; // %
}

export interface PackingResult {
  sheets: SheetResult[];
  unplacedPieces: IndividualPiece[];
  totalPiecesRequested: number;
  totalPiecesPlaced: number;
  kerfMm: number;
  kerfCm: number;
  overallEfficiencyPct: number;
}

// Paleta de colores predefinida con buen contraste
const COLOR_PALETTE = [
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#65a30d', // Lime
  '#ea580c', // Orange
  '#4f46e5', // Indigo
  '#0d9488', // Teal
  '#c026d3', // Fuchsia
  '#475569', // Slate
];

/**
 * Función principal que ejecuta la optimización de cortes 2D Guillotina.
 */
export function solveGuillotinePacking(
  sheetWidth: number,
  sheetHeight: number,
  items: PieceRequest[],
  kerfMm: number = 0,
  maxSheets: number = 20
): PackingResult {
  const kerfCm = Math.max(0, kerfMm) / 10;

  // 1. Desenrollar piezas según cantidad
  const allPieces: IndividualPiece[] = [];
  let itemColorIndex = 0;

  items.forEach((item) => {
    const color = item.color || COLOR_PALETTE[itemColorIndex % COLOR_PALETTE.length];
    itemColorIndex++;

    const qty = Math.max(1, Math.floor(item.quantity || 1));
    for (let i = 0; i < qty; i++) {
      allPieces.push({
        id: `${item.id}-${i + 1}`,
        originalId: item.id,
        label: item.label || `Pieza ${item.width}x${item.height}`,
        width: item.width,
        height: item.height,
        allowRotation: item.allowRotation !== false,
        color,
        pieceIndex: i + 1
      });
    }
  });

  const totalPiecesRequested = allPieces.length;

  // 2. Ordenar piezas de mayor a menor superficie y lado mayor para maximizar empaquetado
  const remainingPieces = [...allPieces].sort((a, b) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    if (areaB !== areaA) return areaB - areaA;
    return Math.max(b.width, b.height) - Math.max(a.width, a.height);
  });

  const sheets: SheetResult[] = [];
  let sheetCount = 0;

  // 3. Iterar creando planchas hasta colocar todas las piezas o alcanzar el máximo de planchas
  while (remainingPieces.length > 0 && sheetCount < maxSheets) {
    sheetCount++;
    const freeRectangles: FreeRectangle[] = [
      { x: 0, y: 0, width: sheetWidth, height: sheetHeight }
    ];
    const placedPieces: PlacedPiece[] = [];

    let placedInThisSheet = true;

    while (placedInThisSheet && remainingPieces.length > 0) {
      placedInThisSheet = false;

      let bestPieceIndex = -1;
      let bestRectIndex = -1;
      let bestRotated = false;
      let bestScore = Infinity; // BSSF (Best Short Side Fit)
      let bestPlacedWidth = 0;
      let bestPlacedHeight = 0;

      // Buscar la mejor combinación de pieza y rectángulo libre
      for (let pIdx = 0; pIdx < remainingPieces.length; pIdx++) {
        const piece = remainingPieces[pIdx];

        const orientations = [{ w: piece.width, h: piece.height, rotated: false }];
        if (piece.allowRotation && piece.width !== piece.height) {
          orientations.push({ w: piece.height, h: piece.width, rotated: true });
        }

        for (let rIdx = 0; rIdx < freeRectangles.length; rIdx++) {
          const rect = freeRectangles[rIdx];

          for (const ori of orientations) {
            // Verificar si cabe considerando kerf para cortes internos
            if (ori.w <= rect.width + 0.001 && ori.h <= rect.height + 0.001) {
              const leftoverW = rect.width - ori.w;
              const leftoverH = rect.height - ori.h;
              const shortSide = Math.min(leftoverW, leftoverH);

              // Criterio BSSF: minimizar el sobrante del lado más corto
              if (shortSide < bestScore) {
                bestScore = shortSide;
                bestPieceIndex = pIdx;
                bestRectIndex = rIdx;
                bestRotated = ori.rotated;
                bestPlacedWidth = ori.w;
                bestPlacedHeight = ori.h;
              }
            }
          }
        }
      }

      // Si encontramos una pieza que cabe
      if (bestPieceIndex !== -1 && bestRectIndex !== -1) {
        const piece = remainingPieces.splice(bestPieceIndex, 1)[0];
        const targetRect = freeRectangles.splice(bestRectIndex, 1)[0];

        // Colocar pieza en targetRect.x, targetRect.y
        placedPieces.push({
          id: piece.id,
          originalId: piece.originalId,
          label: piece.label,
          x: targetRect.x,
          y: targetRect.y,
          width: bestPlacedWidth,
          height: bestPlacedHeight,
          rotated: bestRotated,
          color: piece.color,
          pieceIndex: piece.pieceIndex
        });

        placedInThisSheet = true;

        // Partición Guillotina con Kerf
        const wKerf = bestPlacedWidth + kerfCm;
        const hKerf = bestPlacedHeight + kerfCm;

        // Opción 1: Corte Horizontal
        const areaH_right = Math.max(0, targetRect.width - wKerf) * bestPlacedHeight;
        const areaH_top = targetRect.width * Math.max(0, targetRect.height - hKerf);
        const maxAreaH = Math.max(areaH_right, areaH_top);

        // Opción 2: Corte Vertical
        const areaV_right = Math.max(0, targetRect.width - wKerf) * targetRect.height;
        const areaV_top = bestPlacedWidth * Math.max(0, targetRect.height - hKerf);
        const maxAreaV = Math.max(areaV_right, areaV_top);

        // Maximizar el área libre continua (Max Area Split)
        if (maxAreaV >= maxAreaH) {
          // División Vertical
          if (targetRect.width - wKerf > 0.01) {
            freeRectangles.push({
              x: targetRect.x + wKerf,
              y: targetRect.y,
              width: targetRect.width - wKerf,
              height: targetRect.height
            });
          }
          if (targetRect.height - hKerf > 0.01) {
            freeRectangles.push({
              x: targetRect.x,
              y: targetRect.y + hKerf,
              width: bestPlacedWidth,
              height: targetRect.height - hKerf
            });
          }
        } else {
          // División Horizontal
          if (targetRect.width - wKerf > 0.01) {
            freeRectangles.push({
              x: targetRect.x + wKerf,
              y: targetRect.y,
              width: targetRect.width - wKerf,
              height: bestPlacedHeight
            });
          }
          if (targetRect.height - hKerf > 0.01) {
            freeRectangles.push({
              x: targetRect.x,
              y: targetRect.y + hKerf,
              width: targetRect.width,
              height: targetRect.height - hKerf
            });
          }
        }
      }
    }

    // Calcular estadísticas de la plancha actual
    const totalArea = sheetWidth * sheetHeight;
    const usedArea = placedPieces.reduce((acc, p) => acc + p.width * p.height, 0);
    const wasteArea = Math.max(0, totalArea - usedArea);
    const usedPercentage = Number(((usedArea / totalArea) * 100).toFixed(1));
    const wastePercentage = Number(((wasteArea / totalArea) * 100).toFixed(1));

    // Identificar el Retazo Sobrante Principal (Mayor superficie libre continua)
    let mainOffcut: UsefulOffcut | null = null;
    let maxOffcutArea = 0;

    freeRectangles.forEach((rect) => {
      const area = rect.width * rect.height;
      if (area > maxOffcutArea && rect.width >= 10 && rect.height >= 10) {
        maxOffcutArea = area;
        mainOffcut = {
          x: Math.round(rect.x * 10) / 10,
          y: Math.round(rect.y * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
          area: Math.round(area * 10) / 10
        };
      }
    });

    if (!mainOffcut && freeRectangles.length > 0) {
      freeRectangles.sort((a, b) => b.width * b.height - a.width * a.height);
      const topRect = freeRectangles[0];
      const area = topRect.width * topRect.height;
      if (area > 0) {
        mainOffcut = {
          x: Math.round(topRect.x * 10) / 10,
          y: Math.round(topRect.y * 10) / 10,
          width: Math.round(topRect.width * 10) / 10,
          height: Math.round(topRect.height * 10) / 10,
          area: Math.round(area * 10) / 10
        };
      }
    }

    sheets.push({
      sheetIndex: sheetCount,
      sheetWidth,
      sheetHeight,
      placedPieces,
      freeRectangles,
      mainOffcut,
      totalArea,
      usedArea,
      wasteArea,
      usedPercentage,
      wastePercentage
    });
  }

  // Calcular eficiencia general
  const totalSheetsArea = sheets.length * (sheetWidth * sheetHeight);
  const totalUsedPiecesArea = sheets.reduce((acc, s) => acc + s.usedArea, 0);
  const overallEfficiencyPct = totalSheetsArea > 0 
    ? Number(((totalUsedPiecesArea / totalSheetsArea) * 100).toFixed(1)) 
    : 0;

  return {
    sheets,
    unplacedPieces: remainingPieces,
    totalPiecesRequested,
    totalPiecesPlaced: totalPiecesRequested - remainingPieces.length,
    kerfMm,
    kerfCm,
    overallEfficiencyPct
  };
}
