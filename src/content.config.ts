import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			id: z.number(),
			title: z.string(),
			date: z.coerce.date(),
			time: z.string(),
			image: z.string(),
			excerpt: z.string(),
			keywords: z.string(),
			language: z.enum(['es', 'en']),
			localImage: z.optional(image()),
		}),
});

export const collections = { blog };
