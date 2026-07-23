import React from 'react';
import Logo from './Logo';
import { formatCurrency, formatDocNumber } from '../utils/formatters';

export const PdfTemplate = React.forwardRef(({ formData }, ref) => {
  const {
    docNumber,
    docSeriesLetter,
    issueDate,
    validUntil,
    clientName,
    clientAddress,
    clientDepartment,
    items = [],
    hasColocacion,
    colocacionAmount,
    hasEnvio,
    envioAmount
  } = formData;

  // Calculos de Subtotal y Total
  const itemsSubtotal = items.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return acc + (qty * price);
  }, 0);

  const valColocacion = hasColocacion ? (parseFloat(colocacionAmount) || 0) : 0;
  const valEnvio = hasEnvio ? (parseFloat(envioAmount) || 0) : 0;
  const total = itemsSubtotal + valColocacion + valEnvio;

  return (
    <div
      ref={ref}
      id="pdf-content"
      className="bg-white text-stone-900 font-sans p-8 md:p-12 w-full max-w-[800px] mx-auto min-h-[1050px] flex flex-col justify-between box-border leading-relaxed"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div>
        {/* Header Superior: Logo a la izquierda, Metadata a la derecha */}
        <div className="flex justify-between items-start mb-6">
          <div className="pt-1">
            <Logo className="w-36 h-auto" />
          </div>

          <div className="text-right text-stone-700 text-sm space-y-1 font-medium">
            <div className="flex justify-between gap-6">
              <span className="text-stone-500">Nº de Documento:</span>
              <span className="font-bold text-stone-900">{formatDocNumber(docNumber, docSeriesLetter)}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-stone-500">Fecha de Emisión:</span>
              <span className="text-stone-800">{issueDate}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-stone-500">Válido Hasta:</span>
              <span className="text-stone-800">{validUntil}</span>
            </div>
          </div>
        </div>

        {/* Título Principal */}
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-6">
          Presupuesto
        </h1>

        {/* Bloques de Datos: Recibido De & Facturar A */}
        <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
          {/* Recibido De (Datos Fijos) */}
          <div className="space-y-1">
            <h3 className="font-bold text-stone-900 text-base mb-2">Recibido De:</h3>
            <p className="font-medium text-stone-800">Luis Antonio Di Salvo</p>
            <p className="text-stone-600">Juan D Vallcanera 412</p>
            <p className="text-stone-600">Luján de Cuyo</p>
            <p className="text-stone-600">2616252747</p>
          </div>

          {/* Facturar A (Datos Dinámicos del Cliente) */}
          <div className="space-y-1">
            <h3 className="font-bold text-stone-900 text-base mb-2">Facturar A:</h3>
            <p className="font-bold text-stone-900 text-base">
              {clientName || <span className="text-stone-400 italic">[Nombre del Cliente]</span>}
            </p>
            <p className="text-stone-600">
              {clientAddress || <span className="text-stone-400 italic">[Dirección]</span>}
            </p>
            <p className="text-stone-600">
              {clientDepartment || <span className="text-stone-400 italic">[Departamento]</span>}
            </p>
          </div>
        </div>

        {/* Tabla de Ítems */}
        <div className="mb-8 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2d2d2d] text-white text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4">Ítem</th>
                <th className="py-3 px-3 text-center w-24">Cantidad</th>
                <th className="py-3 px-4 text-right w-36">Precio Unitario</th>
                <th className="py-3 px-4 text-right w-36">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-sm">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-stone-400 italic">
                    Sin ítems agregados
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const qty = parseFloat(item.quantity) || 0;
                  const price = parseFloat(item.unitPrice) || 0;
                  const importe = qty * price;

                  return (
                    <tr key={index} className="align-top">
                      <td className="py-3 px-3 text-center text-stone-500 font-medium">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{item.name || 'Sin Nombre'}</div>
                        {item.description && (
                          <div className="text-xs text-stone-500 mt-0.5 whitespace-pre-line">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-stone-800">{qty}</td>
                      <td className="py-3 px-4 text-right font-medium text-stone-800">
                        {formatCurrency(price)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-stone-900">
                        {formatCurrency(importe)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen de Totales */}
        <div className="flex justify-end mt-4">
          <div className="w-full max-w-sm space-y-2.5 text-sm">
            <div className="flex justify-between py-1.5 border-t border-stone-300 font-semibold text-stone-700">
              <span>Subtotal</span>
              <span className="text-stone-900">{formatCurrency(itemsSubtotal)}</span>
            </div>

            {hasColocacion && (
              <div className="flex justify-between py-1.5 border-t border-stone-200 text-stone-700">
                <span>Servicio de Colocación</span>
                <span className="font-semibold text-stone-900">{formatCurrency(valColocacion)}</span>
              </div>
            )}

            {hasEnvio && (
              <div className="flex justify-between py-1.5 border-t border-stone-200 text-stone-700">
                <span>Costo de Envío</span>
                <span className="font-semibold text-stone-900">{formatCurrency(valEnvio)}</span>
              </div>
            )}

            <div className="flex justify-between py-3 border-t-2 border-stone-900 text-base font-extrabold text-stone-900 bg-stone-50 px-3 rounded-md">
              <span>TOTAL</span>
              <span className="text-lg text-emerald-700">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-12 pt-4 border-t border-stone-200 flex justify-between items-center text-xs text-stone-400">
        <div>
          Generado por <span className="font-semibold text-stone-600">Vidriería Vallcanera</span>
        </div>
        <div>
          Sistema de Presupuestos Digitales
        </div>
      </div>
    </div>
  );
});

export default PdfTemplate;
