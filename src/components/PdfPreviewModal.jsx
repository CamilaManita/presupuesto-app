import React, { useState } from 'react';
import { Download, X, Eye, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const pdfRef = React.useRef(null);

  if (!isOpen) return null;

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000);
  };

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

      await html2pdf().set(opt).from(pdfRef.current).save();
      setDownloaded(true);

      const itemsSubtotal = (formData.items || []).reduce((acc, item) => {
        const q = parseFloat(item.quantity) || 0;
        const p = parseFloat(item.unitPrice) || 0;
        return acc + (q * p);
      }, 0);
      const colocacionVal = formData.hasColocacion ? (parseFloat(formData.colocacionAmount) || 0) : 0;
      const envioVal = formData.hasEnvio ? (parseFloat(formData.envioAmount) || 0) : 0;
      const totalFormatted = formatCurrency(itemsSubtotal + colocacionVal + envioVal);

      fetch('/api/send-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      })
        .then(async res => {
          const data = await res.json();
          if (res.ok && data.success) {
            console.log('Correo enviado con éxito, ID de Resend:', data.id);
            triggerToast('¡PDF descargado y copia enviada a presupuestovidrieriavallcanera@gmail.com!', 'success');
          } else {
            console.warn('Respuesta del servidor:', data);
            triggerToast('PDF descargado. Nota: ' + (data.error || 'Aviso de correo.'), 'warning');
          }
        })
        .catch(err => {
          console.error('Error al conectar con la API:', err);
          triggerToast('PDF descargado localmente.', 'warning');
        });

      onIncrementDocNumber();
    } catch (err) {
      console.error('Error generando PDF:', err);
      triggerToast('Ocurrió un error al generar el PDF.', 'warning');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] px-4 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 bg-stone-900/95 border-emerald-500/30 text-white animate-in fade-in slide-in-from-top-4 transition-all">
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <p className="text-xs sm:text-sm font-semibold leading-tight text-stone-100 flex-1">{toast.message}</p>
          <button 
            type="button" 
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
            className="text-stone-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
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
