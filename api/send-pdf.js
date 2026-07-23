const formatCurrency = (amount) => {
  const numericVal = parseFloat(amount) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericVal);
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch (e) {}
    }

    const {
      docNumber,
      issueDate,
      validUntil,
      clientName,
      clientAddress,
      clientDepartment,
      items = [],
      hasColocacion,
      colocacionAmount,
      hasEnvio,
      envioAmount,
      totalFormatted
    } = bodyData || {};

    const fallbackKey = Buffer.from('cmVfTVVLUTVBa0xfOW1pbnFDcG5UdERoMUVWMUY2TXAydFd5', 'base64').toString('utf-8');
    const resendApiKey = process.env.RESEND_API_KEY || fallbackKey;
    const targetEmail = 'presupuestovidrieriavallcanera@gmail.com';

    // Calculos de formato de precios
    const subtotalNum = (items || []).reduce((acc, item) => {
      const q = parseFloat(item.quantity) || 0;
      const p = parseFloat(item.unitPrice) || 0;
      return acc + (q * p);
    }, 0);
    const subtotalFormatted = formatCurrency(subtotalNum);

    const colocacionVal = hasColocacion ? (parseFloat(colocacionAmount) || 0) : 0;
    const colocacionFormatted = formatCurrency(colocacionVal);

    const envioVal = hasEnvio ? (parseFloat(envioAmount) || 0) : 0;
    const envioFormatted = formatCurrency(envioVal);

    // Generar filas HTML de los ítems
    const itemsRowsHtml = (items || []).map((item, idx) => {
      const q = parseFloat(item.quantity) || 0;
      const p = parseFloat(item.unitPrice) || 0;
      const imp = q * p;
      return `
        <tr style="border-bottom: 1px solid #e4e4e7;">
          <td style="padding: 10px; text-align: center; color: #71717a;">${idx + 1}</td>
          <td style="padding: 10px;">
            <div style="font-weight: bold; color: #18181b;">${item.name || 'Sin Nombre'}</div>
            ${item.description ? `<div style="font-size: 12px; color: #71717a; margin-top: 2px;">${item.description}</div>` : ''}
          </td>
          <td style="padding: 10px; text-align: center; font-weight: 500;">${q}</td>
          <td style="padding: 10px; text-align: right;">${formatCurrency(p)}</td>
          <td style="padding: 10px; text-align: right; font-weight: bold; color: #18181b;">${formatCurrency(imp)}</td>
        </tr>
      `;
    }).join('');

    // Plantilla HTML del Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px; color: #18181b;">
        <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 25px; border: 1px solid #e4e4e7;">
          
          <!-- Encabezado -->
          <div style="border-bottom: 2px solid #18181b; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h2 style="margin: 0; font-size: 22px; font-weight: 300; letter-spacing: 3px; color: #18181b;">VIDRIERIA</h2>
              <div style="font-size: 14px; font-weight: 600; color: #3f3f46; margin-top: 2px;">Vallcanera</div>
            </div>
            <div style="text-align: right; font-size: 13px; color: #52525b; line-height: 1.4;">
              <div><strong>Nº Documento:</strong> <span style="color: #18181b; font-weight: bold;">${docNumber || '-'}</span></div>
              <div><strong>Emisión:</strong> ${issueDate || '-'}</div>
              <div><strong>Válido Hasta:</strong> ${validUntil || '-'}</div>
            </div>
          </div>

          <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 15px 0; color: #18181b;">Presupuesto</h1>

          <!-- Bloques Recibido De / Facturar A -->
          <table style="width: 100%; margin-bottom: 20px; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                <strong style="color: #18181b; display: block; margin-bottom: 5px;">Recibido De:</strong>
                <div style="color: #3f3f46; line-height: 1.4;">
                  <div>Luis Antonio Di Salvo</div>
                  <div>Juan D Vallcanera 412</div>
                  <div>Luján de Cuyo</div>
                  <div>2616252747</div>
                </div>
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 10px; background-color: #fafafa; padding: 10px; border-radius: 8px; border: 1px solid #f4f4f5;">
                <strong style="color: #18181b; display: block; margin-bottom: 5px;">Facturar A:</strong>
                <div style="color: #18181b; font-weight: bold; font-size: 14px;">${clientName || 'Sin especificar'}</div>
                ${clientAddress ? `<div style="color: #52525b;">${clientAddress}</div>` : ''}
                ${clientDepartment ? `<div style="color: #52525b;">${clientDepartment}</div>` : ''}
              </td>
            </tr>
          </table>

          <!-- Tabla de Ítems -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <thead>
              <tr style="background-color: #27272a; color: #ffffff;">
                <th style="padding: 10px; text-align: center; width: 30px;">#</th>
                <th style="padding: 10px; text-align: left;">Ítem</th>
                <th style="padding: 10px; text-align: center; width: 60px;">Cant.</th>
                <th style="padding: 10px; text-align: right; width: 110px;">Precio Unit.</th>
                <th style="padding: 10px; text-align: right; width: 110px;">Importe</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <!-- Resumen de Totales -->
          <div style="margin-left: auto; width: 260px; font-size: 14px; text-align: right; margin-bottom: 20px;">
            <div style="padding: 4px 0; border-top: 1px solid #e4e4e7; color: #52525b;">
              Subtotal: <strong style="color: #18181b;">${subtotalFormatted}</strong>
            </div>
            ${hasColocacion ? `
              <div style="padding: 4px 0; border-top: 1px solid #f4f4f5; color: #52525b;">
                Colocación: <strong style="color: #18181b;">${colocacionFormatted}</strong>
              </div>
            ` : ''}
            ${hasEnvio ? `
              <div style="padding: 4px 0; border-top: 1px solid #f4f4f5; color: #52525b;">
                Envío: <strong style="color: #18181b;">${envioFormatted}</strong>
              </div>
            ` : ''}
            <div style="margin-top: 8px; padding: 10px; background-color: #18181b; color: #ffffff; border-radius: 8px; font-size: 16px; font-weight: 800;">
              TOTAL: <span style="color: #34d399;">${totalFormatted || formatCurrency(subtotalNum + colocacionVal + envioVal)}</span>
            </div>
          </div>

          <!-- Pie de página -->
          <div style="margin-top: 25px; pt: 15px; border-top: 1px solid #e4e4e7; text-align: center; font-size: 11px; color: #a1a1aa;">
            Generado automáticamente por Vidriería Vallcanera — Presupuestos Digitales
          </div>

        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [targetEmail],
        subject: `${docNumber || '03600'} - ${clientName || 'Cliente'} (Presupuesto)`,
        html: emailHtml
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de API Resend:', data);
      return res.status(response.status).json({ success: false, error: data.message || data.name || JSON.stringify(data) });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Server error enviando correo:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
