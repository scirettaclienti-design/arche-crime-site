import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
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
    // Sitemap: include automaticamente tutte le route prerender=true (le 6
    // editoriali) e, in futuro, ogni /episodi/{slug} generato da
    // getStaticPaths quando la collection avrà contenuti.
    // Esclusioni: le OG image route — non sono pagine HTML, sono asset.
    sitemap({
      filter: (page) => !page.includes('/og/'),
      i18n: {
        defaultLocale: 'it',
        locales: { it: 'it-IT' },
      },
    }),
  ],
});
