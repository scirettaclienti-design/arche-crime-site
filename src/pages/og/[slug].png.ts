import type { APIRoute } from 'astro';
import { generateOgPng } from '../../lib/og';
import { PAGE_TITLES, PAGE_SUBTITLES, pathToOgSlug } from '../../lib/seo';

/**
 * Endpoint OG image — restituisce un PNG 1200×630 generato a build-time per
 * ogni pagina conosciuta. prerender=true significa che Astro materializza
 * /og/{slug}.png come asset statico al build, servito dalla CDN di Vercel.
 *
 * I path generati corrispondono ai slug calcolati da pathToOgSlug:
 *   '/'           → 'home'
 *   '/metodo'     → 'metodo'
 *   '/episodi'    → 'episodi'
 *   '/dal-vivo'   → 'dal-vivo'
 *   '/formazione' → 'formazione'
 *   '/chi-e'      → 'chi-e'
 *
 * Quando arriveranno gli episodi (/episodi/{slug}), bisognerà aggiungere
 * a getStaticPaths gli slug delle entry pubblicate, così ogni episodio avrà
 * la sua OG con titolo + numero. Quel lavoro sta nel blocco episodi.
 */
export const prerender = true;

export function getStaticPaths() {
  return Object.entries(PAGE_TITLES).map(([path, title]) => ({
    params: { slug: pathToOgSlug(path) },
    props: { title, subtitle: PAGE_SUBTITLES[path] },
  }));
}

interface OgProps {
  title: string;
  subtitle?: string;
}

export const GET: APIRoute = ({ props }) => {
  const { title, subtitle } = props as unknown as OgProps;
  const png = generateOgPng(title, subtitle);
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      // Cache aggressiva: l'immagine è statica e cambia solo con un nuovo build.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
