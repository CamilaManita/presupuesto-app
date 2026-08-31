import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PresupuestoForm from './components/PresupuestoForm';
import PdfPreviewModal from './components/PdfPreviewModal';
import CutOptimizerView from './components/CutOptimizerView';
import { getTodayDate, getDefaultValidUntil } from './utils/formatters';

export function App() {
  // Estado para la pestaña activa ('presupuestos' | 'optimizador')
  const [activeTab, setActiveTab] = useState('presupuestos');

  // --- ESTADO MÓDULO PRESUPUESTOS ---
  const [docNumber, setDocNumber] = useState(() => {
    const saved = localStorage.getItem('vv_presupuesto_doc_number');
    return saved ? parseInt(saved, 10) : 3600;
  });

  const [docSeriesLetter, setDocSeriesLetter] = useState(() => {
    const saved = localStorage.getItem('vv_presupuesto_series_letter');
    return saved ? saved.toUpperCase().charAt(0) : 'A';
  });

  const [formData, setFormData] = useState({
    docNumber: 3600,
    docSeriesLetter: 'A',
    issueDate: getTodayDate(),
    validUntil: getDefaultValidUntil(7),
    clientName: '',
    clientAddress: '',
    clientDepartment: '',
    clientPhone: '',
    items: [
      {
        name: '',
        description: '',
        quantity: 1,
        unitPrice: ''
      }
    ],
    hasColocacion: false,
    colocacionAmount: 0,
    hasEnvio: false,
    envioAmount: 0
  });

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
    const userInput = prompt('Ingrese el nuevo número de documento inicial:', docNumber.toString());
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
      {/* Menú Principal de Navegación */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Contenido Principal */}
      <main className="px-4 pt-6">
        {activeTab === 'presupuestos' && (
          <div className="max-w-xl mx-auto">
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

            <PdfPreviewModal
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
              formData={formData}
              onIncrementDocNumber={incrementDocNumber}
            />
          </div>
        )}

        {activeTab === 'optimizador' && (
          <div className="max-w-6xl mx-auto">
            <CutOptimizerView />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
