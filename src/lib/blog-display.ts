/** Idioma de página para fechas largas (tarjetas y detalle API). */
export type BlogDateLang = 'es' | 'en';

/**
 * Ej. `4 de abril de 2026` (es-ES) o `April 4, 2026` (en-US).
 */
export function formatBlogCreationDate(isoDate: string, lang: BlogDateLang): string {
  return new Date(isoDate).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Meta description u OG: texto sin etiquetas a partir de HTML. */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Evita un segundo `<h1>` en tarjetas cuando el excerpt HTML de la API trae encabezados. */
export function stripH1TagsFromHtml(html: string): string {
  return html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, '');
}
