export const prerender = false;

type VerifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
};

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body.token === 'string' ? body.token : '';

    if (!token) {
      return new Response(JSON.stringify({ success: false, message: 'Token requerido' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      return new Response(JSON.stringify({ success: false, message: 'Servidor sin RECAPTCHA_SECRET_KEY' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    const params = new URLSearchParams();
    params.set('secret', secret);
    params.set('response', token);

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const data = (await res.json()) as VerifyResponse;

    return new Response(JSON.stringify(data), {
      status: data.success ? 200 : 400,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return new Response(JSON.stringify({ success: false, message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

