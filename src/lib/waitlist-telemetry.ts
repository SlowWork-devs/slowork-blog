const isVercelRuntime = (): boolean => process.env.VERCEL === '1';

export const shouldLogWaitlistVerbose = (): boolean => import.meta.env.DEV === true;

/** Timings y smoke en preview/producción Vercel + detalle en local. */
export const shouldLogWaitlistOps = (): boolean =>
  import.meta.env.DEV === true || isVercelRuntime();

export function logWaitlistVerbose(message: string, data?: Record<string, unknown>): void {
  if (!shouldLogWaitlistVerbose()) return;
  console.info(`[api/waitlist] ${message}`, data ?? {});
}

export function logWaitlistOps(message: string, data?: Record<string, unknown>): void {
  if (!shouldLogWaitlistOps()) return;
  console.info(`[api/waitlist] ${message}`, data ?? {});
}

export function logWaitlistError(message: string, data?: Record<string, unknown>): void {
  console.error(`[api/waitlist] ${message}`, data ?? {});
}

export type WaitlistDbPhase = 'find_duplicate' | 'create_full' | 'create_minimal';

export function logWaitlistDbPhase(
  phase: WaitlistDbPhase,
  ms: number,
  ok: boolean,
  meta?: Record<string, unknown>,
): void {
  const payload = { phase, ms, ok, ...meta };
  if (!ok) {
    console.error('[api/waitlist] db', payload);
    return;
  }
  if (!shouldLogWaitlistOps()) return;
  console.info('[api/waitlist] db', payload);
}
