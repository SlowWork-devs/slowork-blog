import { z } from 'zod';

/** Cookie de preferencia de idioma para redirección desde `/`. */
export const LANGUAGE_COOKIE_NAME = 'slowork-language' as const;

export const supportedLocaleSchema = z.enum(['es', 'en']);

export type SupportedLocale = z.infer<typeof supportedLocaleSchema>;

/** Extrae el valor de `slowork-language` del header `Cookie`, si es válido. */
export function parseLanguageCookie(cookieHeader: string | null): SupportedLocale | null {
  if (!cookieHeader?.trim()) return null;
  const prefix = `${LANGUAGE_COOKIE_NAME}=`;
  const raw = cookieHeader
    .split(';')
    .map((s) => s.trim())
    .find((pair) => pair.startsWith(prefix))
    ?.slice(prefix.length)
    .trim();
  if (!raw) return null;
  const decoded = decodeURIComponent(raw);
  const parsed = supportedLocaleSchema.safeParse(decoded);
  return parsed.success ? parsed.data : null;
}

type LangPref = { primary: string; q: number };

const parseQ = (param: string): number => {
  if (!param.startsWith('q=')) return 1;
  const n = Number.parseFloat(param.slice(2));
  return Number.isFinite(n) ? n : 0;
};

/** Prioriza `en` sobre `es` según RFC 7231 (calidad `q` + orden). */
export function localeFromAcceptLanguage(header: string | null): SupportedLocale {
  if (!header?.trim()) return 'es';
  const ranked: LangPref[] = header
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => {
      const [langRange, ...rest] = part.split(';').map((s) => s.trim());
      const q = rest.map(parseQ).reduce((acc, v) => Math.max(acc, v), 0);
      const primary = (langRange ?? '').toLowerCase().split('-')[0] ?? '';
      return { primary, q };
    })
    .filter((x) => x.primary.length > 0)
    .toSorted((a, b) => b.q - a.q);

  const preferred = ranked.find((x) => x.primary === 'en' || x.primary === 'es');
  if (preferred?.primary === 'en') return 'en';
  return 'es';
}

/** Cookie válida gana; si no, cabecera `Accept-Language`. */
export function resolveLocaleForRoot(
  cookieHeader: string | null,
  acceptLanguage: string | null,
): SupportedLocale {
  const fromCookie = parseLanguageCookie(cookieHeader);
  if (fromCookie) return fromCookie;
  return localeFromAcceptLanguage(acceptLanguage);
}

/** `Set-Cookie` para persistir idioma (un año). */
export function buildLanguageSetCookieHeader(
  locale: SupportedLocale,
  maxAgeSeconds = 60 * 60 * 24 * 365,
): string {
  const secure = import.meta.env.PROD ? '; Secure' : '';
  return `${LANGUAGE_COOKIE_NAME}=${locale}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}
