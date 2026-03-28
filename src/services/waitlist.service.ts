import { prisma } from '../lib/prisma';
import type { WaitlistCreateInput } from '../models/waitlist';

const selectSafe = {
  id: true,
  email: true,
  creationDate: true,
} as const;

export function getClientIp(request: Request): string | null {
  const xfwd = request.headers.get('x-forwarded-for');
  if (!xfwd) return null;
  return xfwd.split(',')[0]?.trim() ?? null;
}

export type WaitlistRegisterResult =
  | { outcome: 'created'; item: { id: number; email: string; creationDate: Date } }
  | { outcome: 'duplicate' }
  | { outcome: 'persist_failed'; message: string };

const toCreateData = (input: WaitlistCreateInput, request: Request) => ({
  email: input.email,
  firstName: input.firstName,
  phone: input.phone,
  instagram: input.instagram,
  linkedin: input.linkedin,
  preferredContact: input.preferredContact,
  communityInterest: input.communityInterest,
  ipAddress: getClientIp(request),
  userAgent: request.headers.get('user-agent'),
});

/** Solo email + metadatos de request: último recurso si el create completo falla (p. ej. columna desalineada en BD). */
const toMinimalCreateData = (input: WaitlistCreateInput, request: Request) => ({
  email: input.email,
  firstName: null,
  phone: null,
  instagram: null,
  linkedin: null,
  preferredContact: null,
  communityInterest: null,
  ipAddress: getClientIp(request),
  userAgent: request.headers.get('user-agent'),
});

const tryPersist = async (
  data: ReturnType<typeof toCreateData>,
): Promise<{ id: number; email: string; creationDate: Date } | null> => {
  try {
    return await prisma.waitlist.create({ data, select: selectSafe });
  } catch {
    return null;
  }
};

export async function registerWaitlistEntry(
  input: WaitlistCreateInput,
  request: Request,
): Promise<WaitlistRegisterResult> {
  const existing = await prisma.waitlist.findFirst({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    return { outcome: 'duplicate' };
  }

  const fullData = toCreateData(input, request);
  const fromFull = await tryPersist(fullData);
  if (fromFull) {
    return { outcome: 'created', item: fromFull };
  }

  const fromMinimal = await tryPersist(toMinimalCreateData(input, request));
  if (fromMinimal) {
    return { outcome: 'created', item: fromMinimal };
  }

  return {
    outcome: 'persist_failed',
    message: 'No se pudo guardar el registro. Inténtalo de nuevo más tarde.',
  };
}
