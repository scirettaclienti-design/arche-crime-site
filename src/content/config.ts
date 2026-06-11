import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Enum dei miti — slug stabile, condiviso tra entrambe le collections.
// Episodi → mito: deve corrispondere a uno slug definito in miti.
const mitoSlug = z.enum(['medea', 'elettra', 'aiace', 'eracle', 'troiane']);

const capitolo = z.object({
  titolo: z.string(),
  timestamp: z.string(),
});

const episodi = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/episodi' }),
  schema: z.object({
    slug: z.string(),
    numero: z.number().int().nonnegative(),
    titolo: z.string(),
    mito: mitoSlug,
    fenomeno: z.string(),
    fonte: z.string(),
    durata: z.string().optional(),
    // YouTube: il video dell'episodio è ospitato sul canale del brand,
    // gratuito. Basta l'ID (11 char, es. "dQw4w9WgXcQ"). Niente Mux,
    // niente file ospitati, niente gating.
    youtubeId: z.string(),
    // Spotify (opzionale): URL embed o URL pagina episodio.
    // Tipici: https://open.spotify.com/episode/{id}
    // o      https://open.spotify.com/embed/episode/{id}?utm_source=generator
    // Il componente normalizza entrambi.
    spotifyEpisodeUrl: z.string().url().optional(),
    // Compat retroattiva: muxPlaybackId è stato deprecato, l'episodio non
    // lo richiede né lo usa più. Lasciato opzionale per non rompere file
    // legacy eventuali. Da rimuovere quando confermato non usato.
    muxPlaybackId: z.string().optional(),
    pubblicato: z.boolean().default(false),
    dataPubblicazione: z.coerce.date().optional(),
    estratto: z.string(),
    capitoli: z.array(capitolo).optional(),
  }),
});

const miti = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/miti' }),
  schema: z.object({
    slug: mitoSlug,
    nome: z.string(),
    fonte: z.string(),
    chiaveLettura: z.string(),
    descrizione: z.string(),
    ordine: z.number().int().nonnegative(),
  }),
});

export const collections = { episodi, miti };
