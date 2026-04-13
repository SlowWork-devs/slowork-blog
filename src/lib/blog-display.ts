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

/** Estima el tiempo de lectura en minutos (200 palabras/min, mínimo 1). */
export function estimateReadingTime(html: string): number {
  const plainText = htmlToPlainText(html);
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 200));
}

/**
 * Envuelve el primer bloque H2 + su contenido (hasta el siguiente H2)
 * en un div de "sección de apertura" con fondo sutil de marca.
 * Solo se aplica cuando hay al menos un <h2>; si no, devuelve el HTML intacto.
 */
export function wrapFirstH2Section(html: string): string {
  const firstH2Idx = html.search(/<h2\b/i);
  if (firstH2Idx === -1) return html;

  const firstH2CloseTagIdx = html.indexOf('</h2>', firstH2Idx);
  if (firstH2CloseTagIdx === -1) return html;
  const afterFirstH2 = firstH2CloseTagIdx + 5;

  const secondH2Idx = html.indexOf('<h2', afterFirstH2);
  const sectionEnd = secondH2Idx !== -1 ? secondH2Idx : html.length;

  const before = html.slice(0, firstH2Idx);
  const section = html.slice(firstH2Idx, sectionEnd);
  const after = html.slice(sectionEnd);

  const lightbulbIcon = `<svg class="inline-block mr-2 mb-0.5 shrink-0 opacity-70" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`;

  // Inyecta el icono dentro del primer <h2> (justo tras el >)
  const sectionWithIcon = section.replace(/<h2(\b[^>]*)>/i, `<h2$1>${lightbulbIcon}`);

  return `${before}<div class="quick-answer-section not-prose-block rounded-2xl bg-secondary/[0.07] border border-secondary/20 px-6 py-5 sm:px-8 sm:py-7 mt-10 mb-8 [&>h2]:mt-0! [&>h2]:mb-4 [&>h2]:font-heading [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:leading-tight [&>h2]:text-primary [&>h2]:border-l-4 [&>h2]:border-secondary [&>h2]:pl-4 [&>p]:text-primary/80 [&>p]:leading-relaxed [&>p]:text-base [&>p]:mt-3 [&>ul]:mt-3 [&>ol]:mt-3">${sectionWithIcon}</div>${after}`;
}
