import { prisma } from '../../lib/prisma';

export const prerender = false;

type WaitlistPayload = {
  firstName?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  linkedin?: string;
  preferredContact?: string;
  communityInterest?: string;
  referral_code?: string;
  referralCode?: string;
};

function getClientIp(request: Request): string | null {
  const xfwd = request.headers.get('x-forwarded-for');
  if (xfwd) return xfwd.split(',')[0]?.trim() ?? null;
  return null;
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = (await request.json().catch(() => ({}))) as WaitlistPayload;

    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : null;
    const phone = typeof body.phone === 'string' ? body.phone.trim() : null;
    const instagram = typeof body.instagram === 'string' ? body.instagram.trim() : null;
    const linkedin = typeof body.linkedin === 'string' ? body.linkedin.trim() : null;
    const preferredContact =
      typeof body.preferredContact === 'string' ? body.preferredContact.trim() : null;
    const communityInterest =
      typeof body.communityInterest === 'string' ? body.communityInterest.trim() : null;

    const referralCode =
      typeof body.referral_code === 'string'
        ? body.referral_code.trim()
        : typeof body.referralCode === 'string'
          ? body.referralCode.trim()
          : null;

    if (!email) {
      return new Response(JSON.stringify({ success: false, message: 'Email requerido' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const existing = await prisma.waitlist.findFirst({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return new Response(JSON.stringify({ success: false, message: 'Email ya registrado' }), {
        status: 409,
        headers: { 'content-type': 'application/json' },
      });
    }

    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent');

    const baseData = {
      email,
      firstName,
      phone,
      instagram,
      linkedin,
      preferredContact,
      communityInterest,
      ipAddress,
      userAgent,
    };

    const selectSafe = {
      id: true,
      email: true,
      creationDate: true,
    } as const;

    try {
      // Intentamos incluir referralCode (si la columna no existe en RDS, fallará).
      const created = await prisma.waitlist.create({
        data: referralCode ? { ...baseData, referralCode } : baseData,
        select: selectSafe,
      });

      return new Response(JSON.stringify({ success: true, item: created }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    } catch (err) {
      // Si referral_code no existe todavía en la tabla, reintentamos sin ese campo.
      const created = await prisma.waitlist.create({
        data: baseData,
        select: selectSafe,
      });

      return new Response(
        JSON.stringify({
          success: true,
          item: created,
          warning: 'referral_code no persistido (columna aún no existe en DB)',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return new Response(JSON.stringify({ success: false, message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

