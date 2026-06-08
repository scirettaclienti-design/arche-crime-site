# archè — archecrime.com

Piattaforma editoriale del brand **archè** — _dal mito alla mente_.
Brand-media, non sito-persona: criminologia letta attraverso il mito greco,
nella voce di Gabriella Marano. Estetica archè · inchiostro
(nero caldo, oro antico, osso) — registro museo / teatro, mai cronaca nera.

## Stack

- **Astro 5** + **TypeScript strict** + **MDX** + **React islands**
- **Tailwind 3** via preset esportato dal design system
- **@scirettaclienti-design/arche-design-system** — tokens, font self-hosted,
  preset Tailwind (consumati come pacchetto npm via GitHub Packages)
- **@astrojs/vercel** — `output: 'server'`, prerender selettivo

## Architettura ibrida

`output: 'server'` attiva il runtime serverless di Vercel. Il rendering è
deciso **per pagina**:

- **Editoriale** (`/`, `/episodi/...`, `/metodo`, ...) → `export const prerender = true`
  Pagine statiche al build, ottime per SEO e CDN.
- **App** (auth, area riservata, checkout — _future_) → on-demand serverless.

Un singolo deploy serve entrambi; nessun secondo progetto.

## Avvio in locale

```bash
# il pacchetto del design system vive su GitHub Packages
# (registry privata): serve un GITHUB_TOKEN con scope read:packages.
# In CI: export GITHUB_TOKEN=...
# In locale: tipicamente già configurato in ~/.npmrc.

npm install
npm run dev          # http://localhost:4321
npm run build
npm run preview
npm run check        # astro check + tsc
```

## Struttura

```
src/
  layouts/      BaseLayout (SEO, nav, footer, global.css)
  components/   componenti UI (vuota in 0.1.0)
  pages/        route Astro
  content/      content collections (schemi in config.ts)
    episodi/    .md/.mdx degli episodi (vuota in 0.1.0)
    miti/       .md/.mdx delle schede mito (vuota in 0.1.0)
  lib/          utility TS (vuota in 0.1.0)
  styles/       global.css
public/
  fonts/        eventuali font extra fuori dal design system
```

## Tokens e Tailwind

Tutti i tokens (colori, tipografia, spazi, motion) e i `@font-face`
arrivano da:

```css
@import "@scirettaclienti-design/arche-design-system/tokens";
```

Il preset Tailwind del design system mappa quei CSS vars in classi:
`bg-ink`, `bg-ink-2`, `text-bone`, `text-bone-dim`, `text-gold-bright`,
`font-display`, `font-serif`, `max-w-text`, eccetera. **Non duplicare i
tokens qui** — modificare il design system e ribumpare la versione.

## Content collections

Due collections con schema in `src/content/config.ts`:

- **`episodi`** — `numero`, `titolo`, `mito` (enum), `fenomeno`, `fonte`,
  `muxPlaybackId?`, `capitoli?`, `pubblicato`, ...
- **`miti`** — `slug` (enum), `nome`, `fonte`, `chiaveLettura`,
  `descrizione`, `ordine`.

Cartelle ancora vuote: il primo episodio (Medea) arriva nel blocco 3.

## Roadmap (non ancora implementata)

Supabase (auth + DB), Stripe (checkout), Resend (email), Mux (video).
Saranno aggiunti come blocchi separati: questo è solo lo scaffold.
