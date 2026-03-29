import nodemailer from 'nodemailer';

import type { ContactFormPayload } from '@/models/contact';

const DEFAULT_TO = 'sloworking.adm@gmail.com';

function smtpConfig() {
  const host =
    process.env.EMAIL_SERVER_HOST?.trim() || 'smtp.office365.com';
  const port = Number(process.env.EMAIL_SERVER_PORT?.trim() || '587') || 587;
  const user =
    process.env.EMAIL_SERVER_USER?.trim() || process.env.GODADDY_EMAIL?.trim();
  const pass =
    process.env.EMAIL_SERVER_PASSWORD?.trim() ||
    process.env.GODADDY_PASS?.trim();

  return { host, port, user, pass };
}

function buildContactNotificationHtml(input: ContactFormPayload): string {
  const { name, email, subject, message, lang } = input;
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const n = esc(name);
  const e = esc(email);
  const subj = esc(subject);
  const msg = esc(message).replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>');

  if (lang === 'es') {
    return `
      <div style="max-width:640px;margin:auto;font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;padding:24px;border-radius:16px;">
        <h2 style="margin:0 0 16px;color:#013333;">Nuevo mensaje desde la web</h2>
        <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5;">
          <tr><td style="padding:8px 0;font-weight:bold;color:#013333;">Nombre</td></tr>
          <tr><td style="padding:0 0 12px;">${n}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#013333;">Email</td></tr>
          <tr><td style="padding:0 0 12px;"><a href="mailto:${e}">${e}</a></td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#013333;">Asunto</td></tr>
          <tr><td style="padding:0 0 12px;">${subj}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#013333;">Mensaje</td></tr>
          <tr><td style="padding:0;border-top:1px solid #e2e8e5;padding-top:12px;">${msg}</td></tr>
        </table>
        <p style="margin-top:24px;font-size:12px;color:#64748b;">Enviado desde el formulario de contacto de Slowork.</p>
      </div>
    `;
  }

  return `
    <div style="max-width:640px;margin:auto;font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;padding:24px;border-radius:16px;">
      <h2 style="margin:0 0 16px;color:#013333;">New message from the website</h2>
      <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5;">
        <tr><td style="padding:8px 0;font-weight:bold;color:#013333;">Name</td></tr>
        <tr><td style="padding:0 0 12px;">${n}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#013333;">Email</td></tr>
        <tr><td style="padding:0 0 12px;"><a href="mailto:${e}">${e}</a></td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#013333;">Subject</td></tr>
        <tr><td style="padding:0 0 12px;">${subj}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#013333;">Message</td></tr>
        <tr><td style="padding:0;border-top:1px solid #e2e8e5;padding-top:12px;">${msg}</td></tr>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#64748b;">Sent from the SloWork contact form.</p>
    </div>
  `;
}

export type ContactEmailSendResult =
  | { ok: true }
  | { ok: false; reason: 'missing_smtp' | 'send_failed'; message: string };

export async function sendContactNotification(
  input: ContactFormPayload,
): Promise<ContactEmailSendResult> {
  const { user, pass, host, port } = smtpConfig();

  if (!user || !pass) {
    return {
      ok: false,
      reason: 'missing_smtp',
      message: 'Servidor sin credenciales SMTP',
    };
  }

  const to =
    process.env.CONTACT_MAIL_TO?.trim() || DEFAULT_TO;
  const from =
    process.env.CONTACT_MAIL_FROM?.trim() || '"Slowork" <slowork@slowork.app>';

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });

    const subjectPrefix =
      input.lang === 'es' ? '[Slowork] Contacto:' : '[Slowork] Contact:';

    await transporter.sendMail({
      from,
      to,
      replyTo: input.email,
      subject: `${subjectPrefix} ${input.subject}`,
      html: buildContactNotificationHtml(input),
    });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return { ok: false, reason: 'send_failed', message };
  }
}
