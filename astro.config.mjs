import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// archè — architettura ibrida:
// output:'server' attiva il runtime serverless su Vercel.
// Le pagine editoriali useranno `export const prerender = true` (SSG, SEO-stabile),
// mentre auth / area riservata / checkout resteranno on-demand.
export default defineConfig({
  site: 'https://archecrime.com',
  output: 'server',
  adapter: vercel(),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    react(),
  ],
});
