import React from 'react';
import { Plus, Trash2, Calendar, User, MapPin, Building, DollarSign, Wrench, Truck, Hash } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const PresupuestoForm = ({
  formData,
  setFormData,
  docSeriesLetter,
  setDocSeriesLetter,
  onGeneratePdf,
  onResetDocNumber
}) => {

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
      return {
        ...prev,
        items: newItems
      };
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { name: '', description: '', quantity: 1, unitPrice: 0 }
      ]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Calculos para resumen rápido en el formulario
  const subtotal = formData.items.reduce((acc, item) => {
    const q = parseFloat(item.quantity) || 0;
    const p = parseFloat(item.unitPrice) || 0;
    return acc + (q * p);
  }, 0);

  const colocacionVal = formData.hasColocacion ? (parseFloat(formData.colocacionAmount) || 0) : 0;
  const envioVal = formData.hasEnvio ? (parseFloat(formData.envioAmount) || 0) : 0;
  const total = subtotal + colocacionVal + envioVal;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {/* Tarjeta 1: Información de Documento y Fechas */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-6 space-y-4">
        <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2 pb-2 border-b border-stone-100">
          <Hash className="w-5 h-5 text-indigo-600" />
          Datos del Documento
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Input 1: Número de Documento (Auto / No Editable) */}
          <div className="sm:col-span-1">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Nº Documento (Auto)
              </label>
              <button
                type="button"
                onClick={onResetDocNumber}
                title="Ajustar número correlativo base"
                className="text-[10px] text-stone-400 underline hover:text-stone-700"
              >
                Ajustar
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={String(formData.docNumber).padStart(5, '0')}
              className="w-full bg-stone-100 border border-stone-300 text-stone-700 font-extrabold px-3 py-2.5 rounded-xl text-center cursor-not-allowed select-none text-sm"
            />
          </div>

          {/* Input 2: Letra de Serie (Editable) */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
              Letra de Serie (Editable) *
            </label>
            <input
              type="text"
              maxLength={1}
              value={docSeriesLetter || ''}
              onChange={(e) => {
                const char = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                setDocSeriesLetter(char);
              }}
              onBlur={() => {
                if (!docSeriesLetter) setDocSeriesLetter('A');
              }}
              placeholder="A"
              title="Ingrese una sola letra para la serie"
              className="w-full bg-white border-2 border-indigo-500 text-indigo-900 font-extrabold px-3 py-2.5 rounded-xl text-center uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base shadow-sm"
            />
          </div>

          {/* Fecha de Emisión */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
              Fecha de Emisión
            </label>
            <input
              type="date"
              readOnly
              value={formData.issueDate}
              className="w-full bg-stone-100 border border-stone-300 text-stone-700 px-3 py-2.5 rounded-xl font-medium focus:outline-none text-sm cursor-not-allowed"
            />
          </div>

          {/* Válido Hasta */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Válido Hasta *
            </label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => handleInputChange('validUntil', e.target.value)}
              className="w-full bg-white border border-stone-300 text-stone-900 px-3 py-2.5 rounded-xl font-medium text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Indicador del Formato Final resultante */}
        <div className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 flex items-center justify-between text-stone-600">
          <span>Identificador de Documento Resultante:</span>
          <strong className="text-indigo-700 font-extrabold text-sm bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            {String(formData.docNumber).padStart(5, '0')}-{(docSeriesLetter || 'A').toUpperCase()}
          </strong>
        </div>
      </div>

      {/* Tarjeta 2: Datos del Cliente (Facturar A) */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-6 space-y-4">
        <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2 pb-2 border-b border-stone-100">
          <User className="w-5 h-5 text-indigo-600" />
          Datos del Cliente (Facturar A)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
              Persona / Razón Social *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Ej. Bodega El Abuelo"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-medium placeholder-stone-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Dirección
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Ej. Pueyrredón 123"
                  value={formData.clientAddress}
                  onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-medium placeholder-stone-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Departamento / Localidad
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Ej. Chacras de Coria"
                  value={formData.clientDepartment}
                  onChange={(e) => handleInputChange('clientDepartment', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-medium placeholder-stone-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta 3: Ítems del Presupuesto */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-6 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-stone-100">
          <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            Ítems del Presupuesto
          </h3>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
            {formData.items.length} {formData.items.length === 1 ? 'ítem' : 'ítems'}
          </span>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.unitPrice) || 0;
            const importe = qty * price;

            return (
              <div
                key={index}
                className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 sm:p-4 space-y-3 relative group transition-all hover:border-indigo-200"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold bg-stone-200 text-stone-700 px-2 py-0.5 rounded-md">
                    # {index + 1}
                  </span>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-stone-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="Eliminar Ítem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Nombre del Ítem *</label>
                    <input
                      type="text"
                      placeholder="Ej. Bar / Ventana laminada"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Descripción</label>
                    <input
                      type="text"
                      placeholder="Ej. Vidrio laminado 3+3 1035mm x 1150mm"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-center font-bold bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Precio Unitario ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-right font-medium bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Importe</label>
                    <div className="px-3 py-2 bg-stone-200/70 border border-stone-300 rounded-lg text-sm text-right font-extrabold text-stone-900">
                      {formatCurrency(importe)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addItem}
            className="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Otro Ítem
          </button>
        </div>
      </div>

      {/* Tarjeta 4: Servicios Adicionales (Colocación y Envío) */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-6 space-y-4">
        <h3 className="text-lg font-bold text-stone-800 pb-2 border-b border-stone-100">
          Servicios Adicionales
        </h3>

        <div className="space-y-4">
          {/* Opción Colocación */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="font-bold text-stone-800 text-sm block">¿Cobra Precio de Colocación?</span>
                  <span className="text-xs text-stone-500">Incluye montaje e instalación</span>
                </div>
              </div>
              <div className="flex items-center bg-stone-200 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleInputChange('hasColocacion', false)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!formData.hasColocacion ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'}`}
                >
                  NO
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('hasColocacion', true)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.hasColocacion ? 'bg-indigo-600 text-white shadow-sm' : 'text-stone-600'}`}
                >
                  SI
                </button>
              </div>
            </div>

            {formData.hasColocacion && (
              <div className="pt-2 border-t border-stone-200">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Valor de Colocación ($)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ingrese el monto de colocación"
                  value={formData.colocacionAmount}
                  onChange={(e) => handleInputChange('colocacionAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Opción Envío */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-bold text-stone-800 text-sm block">¿Cobra Costo de Envío?</span>
                  <span className="text-xs text-stone-500">Flete o traslado hasta domicilio</span>
                </div>
              </div>
              <div className="flex items-center bg-stone-200 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleInputChange('hasEnvio', false)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!formData.hasEnvio ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'}`}
                >
                  NO
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('hasEnvio', true)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.hasEnvio ? 'bg-indigo-600 text-white shadow-sm' : 'text-stone-600'}`}
                >
                  SI
                </button>
              </div>
            </div>

            {formData.hasEnvio && (
              <div className="pt-2 border-t border-stone-200">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Valor de Envío ($)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ingrese el monto de envío"
                  value={formData.envioAmount}
                  onChange={(e) => handleInputChange('envioAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumen Final de Costos & Botón de Acción */}
      <div className="bg-stone-900 text-white rounded-2xl shadow-xl p-5 space-y-4">
        <div className="space-y-2 text-sm border-b border-stone-800 pb-3">
          <div className="flex justify-between text-stone-400">
            <span>Subtotal Ítems</span>
            <span className="font-semibold text-stone-200">{formatCurrency(subtotal)}</span>
          </div>
          {formData.hasColocacion && (
            <div className="flex justify-between text-stone-400">
              <span>Colocación</span>
              <span className="font-semibold text-stone-200">{formatCurrency(colocacionVal)}</span>
            </div>
          )}
          {formData.hasEnvio && (
            <div className="flex justify-between text-stone-400">
              <span>Envío</span>
              <span className="font-semibold text-stone-200">{formatCurrency(envioVal)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-lg font-extrabold">
          <span>TOTAL FINAL</span>
          <span className="text-2xl text-emerald-400">{formatCurrency(total)}</span>
        </div>

        <button
          type="button"
          onClick={onGeneratePdf}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold rounded-xl text-base shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
        >
          Generar y Descargar PDF
        </button>
      </div>
    </form>
  );
};

export default PresupuestoForm;
