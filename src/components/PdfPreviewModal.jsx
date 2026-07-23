import React, { useState } from 'react';
import { Download, X, Eye, CheckCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import PdfTemplate from './PdfTemplate';
import { formatCurrency, formatDocNumber } from '../utils/formatters';

export const PdfPreviewModal = ({
  isOpen,
  onClose,
  formData,
  onIncrementDocNumber
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const pdfRef = React.useRef(null);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);

    try {
      const docNumStr = formatDocNumber(formData.docNumber, formData.docSeriesLetter);
      const cleanClientName = (formData.clientName || 'Cliente').trim().replace(/[/\\?%*:|"<>]/g, '');
      const filename = `${docNumStr} - ${cleanClientName}.pdf`;

      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: filename,
        image: { type: 'jpeg', quality: 0.85 },
        html2canvas: { scale: 1.5, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      // 1. Descargar el PDF localmente en el celular/computadora
      await html2pdf().set(opt).from(pdfRef.current).save();
      setDownloaded(true);

      // 2. Calcular Totales
      const itemsSubtotal = (formData.items || []).reduce((acc, item) => {
        const q = parseFloat(item.quantity) || 0;
        const p = parseFloat(item.unitPrice) || 0;
        return acc + (q * p);
      }, 0);
      const colocacionVal = formData.hasColocacion ? (parseFloat(formData.colocacionAmount) || 0) : 0;
      const envioVal = formData.hasEnvio ? (parseFloat(formData.envioAmount) || 0) : 0;
      const totalFormatted = formatCurrency(itemsSubtotal + colocacionVal + envioVal);

      // 3. Preparar payload de datos para el correo escrito
      const emailPayload = {
        docNumber: docNumStr,
        issueDate: formData.issueDate,
        validUntil: formData.validUntil,
        clientName: formData.clientName,
        clientAddress: formData.clientAddress,
        clientDepartment: formData.clientDepartment,
        items: formData.items,
        hasColocacion: formData.hasColocacion,
        colocacionAmount: formData.colocacionAmount,
        hasEnvio: formData.hasEnvio,
        envioAmount: formData.envioAmount,
        totalFormatted: totalFormatted
      };

      // Función de envío directo a Resend API desde el cliente
      const sendDirectlyToResend = () => {
        const apiKey = atob('cmVfQ20yOVdhYW5fZUVHRnIyWTFQeVdhQ1JtTGlhOVZRNjFX');
        const itemsRowsHtml = (formData.items || []).map((item, idx) => {
          const q = parseFloat(item.quantity) || 0;
          const p = parseFloat(item.unitPrice) || 0;
          return `
            <tr style="border-bottom: 1px solid #e4e4e7;">
              <td style="padding: 10px; text-align: center; color: #71717a;">${idx + 1}</td>
              <td style="padding: 10px;">
                <div style="font-weight: bold; color: #18181b;">${item.name || 'Sin Nombre'}</div>
                ${item.description ? `<div style="font-size: 12px; color: #71717a; margin-top: 2px;">${item.description}</div>` : ''}
              </td>
              <td style="padding: 10px; text-align: center;">${q}</td>
              <td style="padding: 10px; text-align: right;">${formatCurrency(p)}</td>
              <td style="padding: 10px; text-align: right; font-weight: bold;">${formatCurrency(q * p)}</td>
            </tr>
          `;
        }).join('');

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px; color: #18181b;">
            <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 25px; border: 1px solid #e4e4e7;">
              <div style="border-bottom: 2px solid #18181b; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between;">
                <div>
                  <h2 style="margin: 0; font-size: 22px; font-weight: 300; letter-spacing: 3px; color: #18181b;">VIDRIERIA</h2>
                  <div style="font-size: 14px; font-weight: 600; color: #3f3f46;">Vallcanera</div>
                </div>
                <div style="text-align: right; font-size: 13px; color: #52525b;">
                  <div><strong>Nº Documento:</strong> <strong>${docNumStr}</strong></div>
                  <div><strong>Emisión:</strong> ${formData.issueDate}</div>
                  <div><strong>Válido Hasta:</strong> ${formData.validUntil}</div>
                </div>
              </div>
              <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 15px 0; color: #18181b;">Presupuesto</h1>
              <div style="margin-bottom: 20px; background-color: #fafafa; padding: 12px; border-radius: 8px; border: 1px solid #f4f4f5;">
                <strong style="color: #18181b;">Facturar A:</strong>
                <div style="font-size: 15px; font-weight: bold; color: #18181b;">${formData.clientName || 'Sin especificar'}</div>
                ${formData.clientAddress ? `<div style="color: #52525b;">${formData.clientAddress}</div>` : ''}
                ${formData.clientDepartment ? `<div style="color: #52525b;">${formData.clientDepartment}</div>` : ''}
              </div>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
                <thead>
                  <tr style="background-color: #27272a; color: #ffffff;">
                    <th style="padding: 10px; text-align: center; width: 30px;">#</th>
                    <th style="padding: 10px; text-align: left;">Ítem</th>
                    <th style="padding: 10px; text-align: center; width: 60px;">Cant.</th>
                    <th style="padding: 10px; text-align: right; width: 110px;">P. Unitario</th>
                    <th style="padding: 10px; text-align: right; width: 110px;">Importe</th>
                  </tr>
                </thead>
                <tbody>${itemsRowsHtml}</tbody>
              </table>
              <div style="text-align: right; margin-top: 15px; font-size: 14px;">
                <div style="padding: 4px 0; border-top: 1px solid #e4e4e7; color: #52525b;">
                  Subtotal: <strong style="color: #18181b;">${formatCurrency(itemsSubtotal)}</strong>
                </div>
                ${formData.hasColocacion ? `
                  <div style="padding: 4px 0; color: #52525b;">
                    Colocación: <strong style="color: #18181b;">${formatCurrency(parseFloat(formData.colocacionAmount) || 0)}</strong>
                  </div>
                ` : ''}
                ${formData.hasEnvio ? `
                  <div style="padding: 4px 0; color: #52525b;">
                    Envío: <strong style="color: #18181b;">${formatCurrency(parseFloat(formData.envioAmount) || 0)}</strong>
                  </div>
                ` : ''}
                <div style="margin-top: 10px; padding: 10px; background-color: #18181b; color: #ffffff; border-radius: 8px; font-size: 16px; font-weight: 800; display: inline-block;">
                  TOTAL: <span style="color: #34d399;">${totalFormatted}</span>
                </div>
              </div>
              <div style="margin-top: 25px; pt: 15px; border-top: 1px solid #e4e4e7; text-align: center; font-size: 11px; color: #a1a1aa;">
                Generado por Vidriería Vallcanera — Presupuestos Digitales
              </div>
            </div>
          </div>
        `;

        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: ['presupuestovidrieriavallcanera@gmail.com'],
            subject: `${docNumStr} - ${formData.clientName || 'Cliente'} (Presupuesto)`,
            html: emailHtml
          })
        })
          .then(r => r.json())
          .then(d => console.log('Envío directo a Resend completado exitosamente:', d))
          .catch(e => console.error('Error enviando directo a Resend:', e));
      };

      // 4. Intentar envío via API /api/send-pdf con fallback a envío directo en cliente
      fetch('/api/send-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok || !data.success) {
            console.warn('/api/send-pdf falló, ejecutando envío directo a Resend...');
            sendDirectlyToResend();
          } else {
            console.log('Copia escrita enviada por correo con éxito. ID:', data.id);
          }
        })
        .catch(err => {
          console.warn('Servidor /api/send-pdf inalcanzable, ejecutando envío directo a Resend:', err);
          sendDirectlyToResend();
        });

      // Incrementar automáticamente el número de documento para el próximo presupuesto
      onIncrementDocNumber();
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Ocurrió un error al generar el PDF. Por favor intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-100 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-stone-300">
        
        {/* Modal Header */}
        <div className="bg-white px-4 sm:px-6 py-4 border-b border-stone-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-stone-900 text-lg">Vista Previa del Presupuesto</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body - Contenedor con Scroll para Previsualizar */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-200/60 flex justify-center">
          <div className="shadow-2xl rounded-xl overflow-hidden bg-white max-w-full">
            <PdfTemplate ref={pdfRef} formData={formData} />
          </div>
        </div>

        {/* Modal Footer - Botón de Descargar PDF */}
        <div className="bg-white px-4 sm:px-6 py-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="text-xs text-stone-500 text-center sm:text-left">
            Presupuesto Nº <strong className="text-stone-800">{formatDocNumber(formData.docNumber, formData.docSeriesLetter)}</strong> listo para descargar.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 border border-stone-300 rounded-xl text-stone-700 font-bold text-sm hover:bg-stone-50 transition-all"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <span>Generando PDF...</span>
              ) : downloaded ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>¡Descargado! (Descargar de nuevo)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PdfPreviewModal;
