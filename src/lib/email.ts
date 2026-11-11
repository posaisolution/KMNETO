import { Resend } from 'resend';

import { env } from './env';

function buildResetEmailHtml(resetUrl: string): string {
  return `
    <div style="font-family: system-ui, -apple-system, Segoe UI, sans-serif; color: #0f172a; line-height: 1.6;">
      <h2 style="margin: 0 0 12px;">Restablece tu contraseña</h2>
      <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta de KmNeto.</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; background: #0e7c4a; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Crear contraseña nueva
        </a>
      </p>
      <p style="color: #475569; font-size: 14px;">El enlace vence en 1 hora. Si no fuiste tú, ignora este correo.</p>
    </div>
  `;
}

/**
 * Sends the password reset email. Never throws: a failing email must not
 * break the reset flow (the user can request another link).
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[email] RESEND_API_KEY is not set. Reset link for ${to}: ${resetUrl}`);
    }
    return;
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: 'Restablece tu contraseña de KmNeto',
      html: buildResetEmailHtml(resetUrl),
    });
  } catch (error) {
    console.error('sendPasswordResetEmail failed:', error);
  }
}
