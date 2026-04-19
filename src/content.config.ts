import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const updatesCollection = defineCollection({
    loader: glob({
        pattern: '**/[^_]*.{md,mdx}',
        base: './src/content/updates',
    }),
    schema: z.object({
        title: z.string(),
        date: z.string(),
    }),
});

const blogCollection = defineCollection({
    loader: glob({
        pattern: '**/[^_]*.{md,mdx}',
        base: './src/content/blog',
    }),
    schema: ({ image }) =>
        z.object({
            id: z.string(),
            title: z.string(),
            date: z.string(),
            updated: z.string(),
            eyecatch: image().optional(),
            tags: z.array(z.string()),
        }),
});

export const collections = {
    updates: updatesCollection,
    blog: blogCollection,
};
