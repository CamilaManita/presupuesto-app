export default async function handler(req, res) {
  // Permitir solicitudes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pdfBase64, filename, clientName, docNumber, total } = req.body || {};

    if (!pdfBase64) {
      return res.status(400).json({ error: 'pdfBase64 es requerido' });
    }

    // Limpiar prefijo data URI si está presente
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('RESEND_API_KEY no está configurada en las variables de entorno de Vercel.');
      return res.status(500).json({ error: 'Falta la variable de entorno RESEND_API_KEY en Vercel.' });
    }

    const targetEmail = 'presupuestovidrieriavallcanera@gmail.com';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Vidrieria Vallcanera <onboarding@resend.dev>',
        to: [targetEmail],
        subject: `Nuevo Presupuesto N° ${docNumber || 'S/N'} - ${clientName || 'Cliente'}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #2d2d2d; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
            <h2 style="color: #1c1917; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-top: 0;">
              Copia de Presupuesto Emitido
            </h2>
            <p style="font-size: 14px; color: #4b5563;">
              Se ha generado y descargado un nuevo presupuesto desde la aplicación web.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
              <tr style="background-color: #f9fafb;">
                <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Nº de Documento:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${docNumber || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Cliente / Facturar A:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${clientName || 'Sin nombre'}</td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Monto Total:</td>
                <td style="padding: 10px; font-weight: bold; color: #047857; border-bottom: 1px solid #e5e7eb;">${total || '-'}</td>
              </tr>
            </table>
            <p style="font-size: 13px; color: #6b7280;">
              El presupuesto completo se encuentra adjunto a este correo en formato PDF.
            </p>
            <div style="margin-top: 25px; pt-15px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af;">
              Vidriería Vallcanera — Sistema de Presupuestos Digitales
            </div>
          </div>
        `,
        attachments: [
          {
            filename: filename || `Presupuesto_${docNumber || '03600'}.pdf`,
            content: cleanBase64
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de API Resend:', data);
      return res.status(response.status).json({ error: data.message || 'Error al enviar email via Resend' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Error en el servidor al enviar email:', error);
    return res.status(500).json({ error: error.message });
  }
}
