import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.date(),
    excerpt: z.string(),
    image: z.string(), // Para ImageKit
    localImage: image().optional(), // Para las imágenes en blog_assets
    language: z.enum(['es', 'en']),
    keywords: z.string(),
  }),
});

export const collections = {
  'blog': blogCollection,
};