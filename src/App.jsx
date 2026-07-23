import React, { useState, useEffect } from 'react';
import Logo from './components/Logo';
import PresupuestoForm from './components/PresupuestoForm';
import PdfPreviewModal from './components/PdfPreviewModal';
import { getTodayDate, getDefaultValidUntil, formatDocNumber } from './utils/formatters';

export function App() {
  // Número incremental persistente en localStorage (inicio en 3600)
  const [docNumber, setDocNumber] = useState(() => {
    const saved = localStorage.getItem('vv_presupuesto_doc_number');
    return saved ? parseInt(saved, 10) : 3600;
  });

  // Letra de serie persistente en localStorage (defecto 'A')
  const [docSeriesLetter, setDocSeriesLetter] = useState(() => {
    const saved = localStorage.getItem('vv_presupuesto_series_letter');
    return saved ? saved.toUpperCase().charAt(0) : 'A';
  });

  // Estado global del formulario
  const [formData, setFormData] = useState({
    docNumber: 3600,
    docSeriesLetter: 'A',
    issueDate: getTodayDate(),
    validUntil: getDefaultValidUntil(7),
    clientName: '',
    clientAddress: '',
    clientDepartment: '',
    items: [
      {
        name: 'Vidrio laminado 3+3',
        description: 'Medida 1035mm x 1150mm Norte colocado',
        quantity: 1,
        unitPrice: 156900
      }
    ],
    hasColocacion: false,
    colocacionAmount: 0,
    hasEnvio: false,
    envioAmount: 0
  });

  // Mantener el docNumber y docSeriesLetter sincronizados en el formData y localStorage
  useEffect(() => {
    localStorage.setItem('vv_presupuesto_doc_number', docNumber.toString());
    const validLetter = docSeriesLetter ? docSeriesLetter.toUpperCase().charAt(0) : 'A';
    localStorage.setItem('vv_presupuesto_series_letter', validLetter);
    setFormData(prev => ({ ...prev, docNumber, docSeriesLetter: validLetter }));
  }, [docNumber, docSeriesLetter]);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleGeneratePdf = () => {
    if (!formData.clientName.trim()) {
      alert('Por favor ingrese el nombre del cliente a quien se le factura.');
      return;
    }
    if (formData.items.length === 0) {
      alert('Debe adicionar al menos un ítem al presupuesto.');
      return;
    }
    setIsPreviewOpen(true);
  };

  const incrementDocNumber = () => {
    setDocNumber(prev => prev + 1);
  };

  const handleResetDocNumber = () => {
    const userInput = prompt('Ingrese el nuevo número de documento inicial:', docNumber);
    if (userInput !== null) {
      const parsed = parseInt(userInput, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setDocNumber(parsed);
      } else {
        alert('Por favor ingrese un número válido.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans pb-16">
      {/* Navbar Superior Mobile-First */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-center sm:justify-start">
          <Logo className="w-36 h-auto" />
        </div>
      </header>

      {/* Contenido Principal Container */}
      <main className="max-w-xl mx-auto px-4 pt-6">
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Generador de Presupuestos
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Complete el formulario para emitir y descargar el presupuesto oficial en PDF.
          </p>
        </div>

        <PresupuestoForm
          formData={formData}
          setFormData={setFormData}
          docSeriesLetter={docSeriesLetter}
          setDocSeriesLetter={setDocSeriesLetter}
          onGeneratePdf={handleGeneratePdf}
          onResetDocNumber={handleResetDocNumber}
        />
      </main>

      {/* Modal de Previsualización y Descarga */}
      <PdfPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        formData={formData}
        onIncrementDocNumber={incrementDocNumber}
      />
    </div>
  );
}

export default App;
