/// <reference types="astro/client" />

/** `fetchpriority` en `<video>` (poster/LCP); los tipos JSX de Astro aún no lo incluyen. */
declare namespace astroHTML.JSX {
  interface VideoHTMLAttributes {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}
