/**
 * SEO — schema.org JSON-LD helpers.
 *
 * Vincolo: i dati JSON-LD devono riflettere SOLO il contenuto reale visibile
 * in pagina. Niente premi, affiliazioni, biografie inventate. È penalizzante
 * (Google flagga structured data che mente) ed è scorretto.
 *
 * Riusato come fonte di verità per:
 *  - JsonLd.astro (lo script tag)
 *  - OG endpoint (titoli + descrizione)
 *  - Eventuali futuri export (RSS, Atom)
 */

export const SITE_URL = 'https://archecrime.com';
export const SITE_NAME = 'archè';
export const SITE_TAGLINE = 'dal mito alla mente';
export const SITE_DESCRIPTION =
  'archè — dal mito alla mente. Piattaforma editoriale di Gabriella Marano: criminologia letta attraverso il mito greco, senza cronaca nera.';

/** Mappa pathname → titolo umano per breadcrumb e OG. Aggiornare quando
 *  si aggiungono pagine. NIENTE inventare slug non esistenti. */
export const PAGE_TITLES: Record<string, string> = {
  '/': 'archè',
  '/metodo': 'Il metodo',
  '/episodi': "L'archivio",
  '/dal-vivo': 'Dal vivo',
  '/formazione': 'Formazione',
  '/chi-e': 'Chi è',
};

/** Sottotitoli per OG image. Aggiungono carattere sotto al titolo. */
export const PAGE_SUBTITLES: Record<string, string> = {
  '/': 'dal mito alla mente',
  '/metodo': 'archè · dal mito alla mente',
  '/episodi': 'archè · l\'archivio a doppia chiave',
  '/dal-vivo': 'archè · teatro e aula',
  '/formazione': 'archè · l\'approfondimento',
  '/chi-e': 'Gabriella Marano · criminologa e archeologa',
};

export interface JsonLdSchema {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: unknown;
}

/** Organization: archè come ente editoriale. */
export function orgSchema(): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: 'archè crime',
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    // sameAs array predisposto vuoto. Aggiungere i profili social quando esisteranno.
    // ESEMPIO futuro: ['https://www.instagram.com/archecrime', 'https://www.youtube.com/@archecrime']
    sameAs: [],
    founder: {
      '@type': 'Person',
      name: 'Gabriella Marano',
    },
    inLanguage: 'it-IT',
  };
}

/** WebSite: dati identificativi del sito. */
export function websiteSchema(): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: 'archè · dal mito alla mente',
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'it-IT',
  };
}

/** Person: Gabriella Marano. Solo dati certi e verificabili dal sito attuale.
 *  NON aggiungere awards, alumniOf, knowsAbout senza fonte. */
export function personSchema(): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Gabriella Marano',
    jobTitle: 'Criminologa e archeologa',
    description:
      'Criminologa e archeologa. Fondatrice e voce della piattaforma editoriale archè — una lettura criminologica dei fenomeni umani che parte dal teatro greco.',
    sameAs: ['https://gabriellamarano.it'],
    url: `${SITE_URL}/chi-e`,
  };
}

/** BreadcrumbList per la pagina corrente. */
export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Costruisce il breadcrumb dalla pathname. */
export function buildBreadcrumb(pathname: string): Array<{ name: string; url: string }> {
  const path = pathname.replace(/\/$/, '') || '/';
  const items: Array<{ name: string; url: string }> = [
    { name: 'archè', url: `${SITE_URL}/` },
  ];
  if (path === '/') return items;

  // Spezza la path in segmenti per gestire eventuali sotto-rotte (es. /episodi/medea)
  const segments = path.split('/').filter(Boolean);
  let acc = '';
  segments.forEach((seg) => {
    acc += `/${seg}`;
    const title = PAGE_TITLES[acc] ?? humanizeSlug(seg);
    items.push({ name: title, url: `${SITE_URL}${acc}` });
  });
  return items;
}

function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** FAQPage: usato SOLO su /metodo, con i cinque "mai" che sono già in pagina.
 *  Le risposte sono il testo reale della pagina (vedi /metodo cinqueMai array). */
export function faqPageSchema(
  faqs: Array<{ question: string; answer: string }>,
): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/** Slug per OG image dato il pathname. */
export function pathToOgSlug(pathname: string): string {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/') return 'home';
  return path.slice(1).replace(/\//g, '-');
}

/** URL assoluto dell'OG image della pagina. */
export function ogImageUrl(pathname: string): string {
  return `${SITE_URL}/og/${pathToOgSlug(pathname)}.png`;
}
