import type { APIRoute } from 'astro';

import { jsonResponse } from '@/lib/http';
import { getContactFormBodySchema } from '@/models/contact';
import { sendContactNotification } from '@/services/contact-email.service';

export const prerender = false;

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function normalizeApiRoot(raw: string): string {
  return raw.trim().replace(/\/+$/, '').replace(/\/graphql$/i, '');
}

/** POST /api/contact/ — honeypot + validación; reenvía a sloWorkApi si hay `SLOWORK_API_URL`, si no envía correo desde el servidor Astro. */
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
    const parsed = schema.safeParse({ ...fields, lang });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return jsonResponse({ success: false, message }, { status: 400 });
    }

    const baseUrl = import.meta.env.SLOWORK_API_URL || process.env.SLOWORK_API_URL;
    const apiRoot = baseUrl ? normalizeApiRoot(baseUrl) : '';

    if (apiRoot.length > 0) {
      const targetUrl = `${apiRoot}/api/contact`;
      const upstreamRes = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          subject: parsed.data.subject,
          message: parsed.data.message,
          lang: parsed.data.lang,
        }),
      }).catch(() => null);

      if (upstreamRes === null) {
        return jsonResponse(
          { success: false, message: 'No se pudo conectar con la API' },
          { status: 502 },
        );
      }

      if (!upstreamRes.ok) {
        const fallbackMessage = lang === 'es' ? 'Error al enviar el mensaje' : 'Failed to send message';
        const contentType = upstreamRes.headers.get('content-type') ?? '';
        const errorDetail = await upstreamRes.text().catch(() => '');

        const message = (() => {
          if (!contentType.includes('application/json')) return fallbackMessage;
          try {
            const d: unknown = JSON.parse(errorDetail);
            return d !== null &&
              typeof d === 'object' &&
              'message' in d &&
              typeof (d as { message?: unknown }).message === 'string'
              ? (d as { message: string }).message
              : fallbackMessage;
          } catch {
            return fallbackMessage;
          }
        })();

        return jsonResponse({ success: false, message }, { status: upstreamRes.status });
      }

      return jsonResponse({ success: true }, { status: 200 });
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
