// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
    loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
    schema: ({ image }) =>
        z.object({
            id: z.number(),
            title: z.string(),
            date: z.coerce.date(),
            time: z.string(),
            image: z.string(), // URL de ImageKit
            localImage: image().optional(), // Imagen optimizada por Astro (opcional)
            excerpt: z.string(),
            keywords: z.string(),
            language: z.enum(['es', 'en']),
            // CLAVE PARA EL LANGUAGE PICKER:
            translationSlug: z.string().optional(), 
        }),
});

export const collections = { blog };