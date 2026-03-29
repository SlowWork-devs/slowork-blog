# SloWork — slowork-landing-v2

> **Otro estilo de vida es posible.**

Repositorio **`slowork-landing-v2`**: **sitio web oficial de SloWork** (landing y blog unificados en un solo proyecto Astro). Incluye la experiencia de marca, la waitlist, el contenido editorial y las páginas legales bajo rutas internacionales.

---

## Stack tecnológico

- **Framework:** [Astro 6](https://astro.build/) (SSR, Content Collections)
- **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/) (plugin Vite)
- **Contenido:** MDX y Markdown
- **Tipografía:** Poppins (Fontsource)
- **Datos:** Prisma (waitlist y formularios)
- **Despliegue:** optimizado para Vercel

---

## Arquitectura internacional (i18n)

- 🇪🇸 **Español:** `/es/` (home, blog, legales)
- 🇬🇧 **Inglés:** `/en/`

Los artículos del blog se enlazan entre idiomas con `id` y `translationSlug` en el frontmatter (`src/content/blog/`).

---

## Instalación y desarrollo

1. **Instalar dependencias:**

   ```bash
   npm install
   ```

2. **Variables de entorno:** copiar y ajustar según `.env.example` (base de datos, correo, analytics).

3. **Arrancar en local:**

   ```bash
   npm run dev
   ```

---

Nombre del paquete npm: **`slowork-landing-v2`**. El dominio público canónico del sitio es **`https://www.slowork.app`** (definido en `astro.config.mjs`).
