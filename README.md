# 🌿 SloWork Blog

> **Otro estilo de vida es posible.**

SloWork es una plataforma editorial dedicada a validar y explorar nuevas formas de vida y trabajo. Este blog es el corazón de la marca, ofreciendo recursos prácticos, guías de destinos y reflexiones para la comunidad nómada digital y remota.

---

## 🚀 Stack Tecnológico

Este proyecto está construido con las tecnologías más modernas para garantizar velocidad, SEO y una experiencia de lectura premium:

- **Framework:** [Astro v5](https://astro.build/) (Content Layer API)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) (Vite Plugin)
- **Contenido:** MDX & Markdown
- **Tipografía:** Poppins (Google Fonts)
- **Despliegue:** Optimizado para Vercel / Netlify

---

## 🌍 Arquitectura Internacional (i18n)

El blog está estructurado para una audiencia global con soporte nativo para:
- 🇪🇸 **Español:** `/es/blog/`
- 🇬🇧 **Inglés:** `/en/blog/`

Los contenidos se sincronizan mediante el campo `id` y `translationSlug` en el frontmatter de los archivos Markdown ubicados en `src/content/blog/`.

---

## 🛠️ Instalación y Desarrollo

1. **Instalar dependencias:**
   ```bash
   npm install