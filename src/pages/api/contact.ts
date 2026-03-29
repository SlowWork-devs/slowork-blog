import type { APIRoute } from 'astro';

import { jsonResponse } from '@/lib/http';
import { getContactFormBodySchema } from '@/models/contact';
import { sendContactNotification } from '@/services/contact-email.service';

export const prerender = false;

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** POST /api/contact/ — formulario de contacto (honeypot + email a administración). */
export const POST: APIRoute = async ({ request }) => {
  try {
    const rawUnknown: unknown = await request.json().catch(() => ({}));

    if (!isRecord(rawUnknown)) {
      return jsonResponse({ success: false, message: 'JSON inválido' }, { status: 400 });
    }

    const honeypot = String(rawUnknown.website ?? '').trim();
    if (honeypot !== '') {
      return jsonResponse({ success: true }, { status: 200 });
    }

    const lang = rawUnknown.lang === 'en' ? 'en' : 'es';
    const schema = getContactFormBodySchema(lang);

    const { website: _ignored, ...fields } = rawUnknown;
    void _ignored;
    const parsed = schema.safeParse(fields);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return jsonResponse({ success: false, message }, { status: 400 });
    }

    const sent = await sendContactNotification(parsed.data);

    if (!sent.ok) {
      const status = sent.reason === 'missing_smtp' ? 503 : 500;
      return jsonResponse({ success: false, message: sent.message }, { status });
    }

    return jsonResponse({ success: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return jsonResponse({ success: false, message }, { status: 500 });
  }
};
