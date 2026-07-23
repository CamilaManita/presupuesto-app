/**
 * Formatea un número como moneda en Pesos ($)
 */
export const formatCurrency = (amount) => {
  const numericVal = parseFloat(amount) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericVal);
};

/**
 * Formatea número de documento a 5 dígitos + letra de serie (ej: 3600, 'A' -> 03600-A)
 */
export const formatDocNumber = (num, letter = 'A') => {
  const numericVal = parseInt(num, 10) || 3600;
  const cleanLetter = (letter || 'A').toString().trim().toUpperCase().charAt(0) || 'A';
  return `${String(numericVal).padStart(5, '0')}-${cleanLetter}`;
};

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD para inputs de fecha
 */
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Agrega días a una fecha y la retorna en YYYY-MM-DD
 */
export const getDefaultValidUntil = (daysToAdd = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
