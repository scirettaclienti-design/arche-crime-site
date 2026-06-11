# RESUME — archecrime.com

**File di handoff sessione**. Letto in cima alla nuova sessione Claude, contiene tutto quello che serve per riprendere senza ripercorrere la chat.

> **Per Claude (nuova sessione)**: questo file è la verità di base. Letto, sai:
> stato del progetto, decisioni tecniche prese, preferenze del committente,
> cosa è committato vs cosa è pendente. **Non rifare** quello che è già stato
> fatto. **Non proporre** cose vietate dalla regia (vedi § Vincoli).

---

## 0 · Quick start

```bash
cd ~/Projects/arche-studio/arche-crime-site
git status        # main, working tree clean
git log --oneline -5    # ultimi 5 commit
npm run dev       # http://localhost:4322
npm run build     # production verify
```

- **Repo locale**: `~/Projects/arche-studio/arche-crime-site/`
- **Branch**: `main`, tracking `origin/main`
- **Remote**: `https://github.com/scirettaclienti-design/arche-crime-site.git`
- **Live**: deployato su Vercel (committente ha confermato "fatto il sito online")
- **Dominio**: `archecrime.com` (acquistato, già su Vercel)
- **Ultimo commit a memoria**: `9fd3747 feat: matrix — refined engraved glyphs + immersive self-drawing construction`

---

## 1 · Identità del progetto

**archè** è un brand-media editoriale fondato da **Gabriella Marano** (criminologa + archeologa). Concetto: **"dal mito alla mente"** — lettura criminologica dei fenomeni umani che parte dal teatro greco. **NON** è cronaca nera, **NON** è sito-persona.

- Pubblico: persone curiose, studenti, professionisti dell'aiuto, giornalisti culturali
- Distinguibile dal sibling `gabriellamarano.it` (sito istituzionale forense — su archè non si parla di casi reali in corso, su gabriellamarano.it non c'è teatro greco)
- Strumento di **vendita + posizionamento**: il sito è il funnel principale di archè (formazione, dal vivo, libro futuro)

**5 archetipi del format** (dati canonici, non cambiare):
| Mito | Fonte | Fenomeno | Lettura |
|---|---|---|---|
| Medea | Euripide | Il figlicidio | Quando l'amore tradito diventa annientamento |
| Elettra | Sofocle | Il trauma familiare | La casa come scena del crimine ereditata |
| Aiace | Sofocle | Il crollo | Quando l'identità eroica non regge la perdita |
| Eracle | Euripide | La perdita di controllo | La forza che si rivolta contro chi si dovrebbe proteggere |
| Le Troiane | Euripide | La vittimizzazione | Le voci che la storia mette in secondo piano |

---

## 2 · Stack tecnico

- **Astro 5.1** ibrido (`output: 'server'`, adapter `@astrojs/vercel@8`)
- Pagine pubbliche tutte `prerender=true` (SSG)
- **TypeScript strict**
- **Tailwind 3** + design system `@scirettaclienti-design/arche-design-system@0.1.0` da GitHub Packages
- **React 18.3** per le island interattive
- **MDX** (`@astrojs/mdx`) per i futuri episodi
- **Motion**: `gsap@^3.15` + `lenis@^1.3` + ScrollTrigger
- **OG image**: `@resvg/resvg-js` (SVG composto in `src/lib/og.ts` → PNG al build)
- **Sitemap**: `@astrojs/sitemap`
- **Analytics**: `@vercel/analytics` (script inline `/_vercel/insights/script.js`)
- **Video**: ffmpeg locale per encoding (H.264 + VP9, crop letterbox)

### Asset video presenti

In `public/video/` (committati, ~1.2 MB totali):
- `hero.webm` 231 KB, `hero.mp4` 327 KB, `hero-poster.jpg` 26 KB → fondale lucerna che si accende, **hero della home**
- `formazione.webm` 232 KB, `formazione.mp4` 341 KB, `formazione-poster.jpg` 38 KB → 5 teste arcaiche su marmo, **hero di /formazione**

Sorgenti raw `src/assets/video-{nome}-src.mp4` sono **gitignored** (mai committati).

---

## 3 · Sitemap del sito (6 route + 1 dinamica)

| Route | Cosa contiene | Stato |
|---|---|---|
| `/` (home) | Hero sticky-pin "soglia" con lucerna + manifesto + "Non cronaca nera. Un metodo." + EpisodeCard Medea + 3 porte + ornament | ✓ |
| `/metodo` | Layout asimmetrico (numerali romani I-IV a margine sx) — ἀρχή origine, il fossato, le due direzioni, i 5 "mai" | ✓ |
| `/episodi` | "L'archivio a doppia chiave" + **ArchetypeConstellation interattiva** + (preparato per liste per mito/per fenomeno quando ci saranno episodi) | ✓ |
| `/dal-vivo` | "La prova" — 3 formati (lezione-spettacolo / scuole / conferenza), modulo "richiesta tappa" disabled con CTA mailto reale a contatti@archecrime.com | ✓ |
| `/formazione` | "L'approfondimento" — hero pinned con teste + 3 percorsi + libro in preparazione (NO prezzi, NO checkout) | ✓ |
| `/chi-e` | "La persona" — narrativa doppia competenza + 4 tratti + link a gabriellamarano.it per la parte forense | ✓ |
| `/episodi/[slug]` | Dynamic, prerender=true, getStaticPaths dalla collection. Oggi collection VUOTA → 404 atteso | ✓ scheletro pronto |

Asset SEO:
- `/sitemap-index.xml`, `/sitemap-0.xml` (auto-generati)
- `/robots.txt`
- `/og/{slug}.png` (6 OG image generate al build via Resvg)

---

## 4 · Sistemi implementati

### 4.1 Design tokens

Dal design system + extension locale (`src/styles/global.css`, `tailwind.config.ts`):

```
ink         #14110C   sfondo principale
ink-2       #1B1711   pannelli card
ink-3       #221D15   hover sfondo
oxblood     #2A1412   non usato
bone        #ECE4D2   testo principale
bone-dim    #BDB39C   testo secondario
bone-faint  #8C8370   testo terziario / placeholder
gold        #C8A24E   accento principale
gold-bright #E0C685   highlight
gold-deep   #8C6E36   ombre/profondità
patina      #5E7868   accento secondario freddo (hover link inline, knot meandro)
patina-bright #8AA38F
patina-deep #3F574B
ember       #8A3A1E   accento viscerale RISERVATO alla pagina-episodio
ember-glow  #B85B3A
```

**MAI rosso cronaca**. L'ember è un rosso-bruciato lapideo per i momenti di "decodifica criminologica" dentro la pagina-episodio (futura).

Font:
- **Bodoni Moda** display (variable axis caricato ma `data-vary` rimosso su richiesta utente — non vuole l'effetto "allargamento")
- **Spectral** corpo
- **Cormorant Garamond** (`font-secret`) numerali di sezione
- **Greek polytonic fallback** via `@font-face` `local()` su Athelas/Didot/EB Garamond/DejaVu Serif (subrange U+0370-03FF, U+1F00-1FFF). Classe `.greek` disabilita `text-transform: uppercase` (storce i diacritici).

### 4.2 Motion stack (`src/components/motion/`)

- `MotionHead.astro` — pre-hide CSS via classe `js-motion-pending` su `<html>` + safety timer 1.6s
- `SmoothScroll.tsx` — React island `client:load`, gestisce:
  - **Lenis** smooth-scroll globale (lerp 0.085, duration 1.4, museale)
  - GSAP/ScrollTrigger bridge (`lenis.on('scroll', ScrollTrigger.update)` + ticker)
  - Gesti per pagina:
    - `[data-curtain]` — sipario clip-path 50%→0%
    - `[data-reveal]` — fade/clip
    - `[data-meander]` — clip-path sweep (lin → orizzontale o verticale)
    - `[data-parallax-y]` — parallax decorativo solo accenti oro
    - `[data-video-parallax]` — video sticky con parallax misurato
    - `[data-hero-pin]` — sticky pin con stage threshold (fade out a fine pin)
    - **Gesti diversificati per pagina**: `data-incise` (/metodo), `data-vitrine` (era usato in /episodi, ora rimpiazzato dalla costellazione), `data-stage` (/dal-vivo, palco), `data-page-turn` (/formazione, libro), `data-portrait` (/chi-e, fade lentissimo)
  - **Reduced-motion**: early return, settleAll, nessun import dinamico di GSAP/Lenis
- `GreekMeander.astro` — la firma del sito. Pattern Greek-key generato proceduralmente, stroke oro, clip-path sweep al posto del vecchio stroke-dashoffset (che frammentava il pattern a 90°)
- `RevealText.astro` — wrapper con `[data-reveal]`
- `CurtainOpening.astro` — sipario per l'h1 della home
- `EpigraphFilter.astro` — filtro SVG epigrafe applicato a `.is-epigraph` (sull'h1 della home, doppio text-shadow + filter url; auto-disabilita <640px e a reduced-motion)
- `VideoScene.astro` — embed video lazy (intersection observer)

### 4.3 VideoBackground (`src/components/VideoBackground.astro`)

Component riusabile per gli sfondi video. Pattern usage:
```astro
<VideoBackground
  name="hero"                       <!-- /video/hero.webm + .mp4 + -poster.jpg -->
  overlayOpacity={0.7}
  overlayDirection="radial"         <!-- to bottom | to top | radial -->
  objectPosition="center 22%"       <!-- crop tweak desktop -->
  objectPositionMobile="center 18%" <!-- crop tweak mobile -->
  parallax={true}
  parallaxAmount={40}
  ariaLabel="..."
/>
```

Lazy load via IntersectionObserver. Skip totale playback se:
- `prefers-reduced-motion: reduce`
- `navigator.connection.saveData === true`
- `effectiveType` in `2g/slow-2g/3g`
- `posterOnly: true` esplicito

### 4.4 Sticky-pin "Apple-style"

Home e /formazione hanno l'hero in sticky-pin pieno schermo (~130-150vh). Il video resta inchiodato, lo stage threshold (h1 + meandro + eyebrow) tiene per la durata del pin, poi rilascia e il flusso editoriale prosegue normale con momenti di **solo testo** (su richiesta del committente, che NON voleva crossfade di testi sopra al video).

### 4.5 Archetype Constellation — IL "gioiello" (`src/components/myth/`)

Sostituisce il vecchio `MythMatrix.astro`. Trasforma i 5 archetipi in una composizione interattiva e immersiva.

- **5 glifi SVG originali** in `glyphs.tsx`:
  - **Medea**: sole di Helios — cerchio + 8 raggi alternati + perle terminali + alone interno + fiamma centrale
  - **Elettra**: frontone di tempio spezzato con crepa zigzag + colonne con capitelli + akrotério gold-bright
  - **Aiace**: scudo beotico (figure-8) con incavi laterali + trama interna + episema centrale + crepa
  - **Eracle**: nodo quadrato — 4 anelli ai vertici + X centrale + perno + filo decorativo
  - **Le Troiane**: lira (chelys) con giogo + bracci curvi + cassa armonica + 4 corde di cui **una spezzata** che pende molle
  - Ogni glifo ha **DOPPIO LAYER** (shadow gold-deep offset 0.4×0.6 sotto, main gold sopra) + dettagli `.glyph-detail` (fill gold-bright) — chiaroscuro inciso
  - Tutte le primitive geometriche hanno la classe `.glyph-stroke` per self-drawing
- **Layout**:
  - Desktop: 2 fasce rigorose `HIGH_Y=130` (Elettra, Eracle) / `LOW_Y=260` (Medea, Aiace, Troiane), card centrate via `translate(-50%, -50%)`, `min-h-[220px]` + `flex-col` + `mt-auto` sul badge per allineamento perfetto
  - Mobile: stack verticale `gap-px` con bordi `[var(--line-soft)]`
- **Costruzione cascade** (~3.3s totali, `client:visible`):
  1. Medea: glifo si incide (stroke-dashoffset → 0, stagger 0.02s, 0.45s) → dettagli fade-in → testo emerge
  2. Segmento 1 del meandro (Medea→Elettra) si traccia (0.32s, power1.inOut)
  3. Elettra: glifo → dettagli → testo
  4. Segmento 2 (Elettra→Aiace) → Aiace → segmento 3 → Eracle → segmento 4 → Troiane
  5. Settle finale: tutti i `.glyph-main` pulsano una volta con `brightness(1.6) + drop-shadow gold-bright`
- **Hover** (desktop): glow oro radial-gradient dietro il glifo (`.arch-glow` opacity 0→0.55) + animazione `arch-glyph-breathe` 6s rotazione 0°→3°→0° + glifo gold→gold-bright + card scale 1.03 + altri 4 nodi opacity 0.5
- **Linking smart**: `ArchetypeConstellation.astro` fa `getCollection('episodi')` filtrato `pubblicato`, costruisce mappa `mito → episodeSlug`, passa al React island. Se l'episodio esiste → `<a href="/episodi/{slug}">`, altrimenti `<div role="group" tabIndex={0}>` con badge "In arrivo". Oggi tutti 5 sono "In arrivo".
- **Reduced-motion**: `useEffect` controlla matchMedia, se reduce ritorna prima dell'import GSAP → glifi statici al final state al primo paint, perfettamente leggibili
- **Note tecniche**:
  - `useId` rimosso (con `@astrojs/react 4.1.x` causa "Invalid hook call" durante SSR). ID statico `arch-constellation`. Unico problema se ci fossero più costellazioni nella stessa pagina (oggi una sola).
  - `client:visible` funziona, SSR mostra la matrice già al primo paint

### 4.6 SEO infrastructure (`src/lib/seo.ts`, `src/components/seo/JsonLd.astro`, `src/pages/og/[slug].png.ts`)

- **Sitemap** auto: 6 pagine + future `/episodi/{slug}`. Esclude `/og/*`. i18n `it-IT`
- **robots.txt**: allow all + sitemap pointer
- **JSON-LD** iniettato in ogni pagina via BaseLayout:
  - Organization: archè, sameAs vuoto (predisposto per social futuri)
  - WebSite: nome, url, inLanguage it-IT
  - Person: Gabriella Marano (criminologa+archeologa), sameAs `https://gabriellamarano.it`. **NIENTE dati inventati** (no awards, no alumniOf — penalizzato da Google e scorretto)
  - BreadcrumbList: solo se pathname ha più di 1 segmento
  - FAQPage **solo su /metodo**, costruita dai 5 "mai" già visibili in pagina (le answer sono il testo reale, non parafrasi)
- **OG image** 1200×630 generate al build:
  - Sfondo ink + glow radiale gold-deep, cornice gold-deep, ◆ gold-bright centrato, titolo Georgia 84-124px bone, sottotitolo italic gold-bright, meandro greco fascia bassa, tagline "ARCHÈ · DAL MITO ALLA MENTE"
  - Tecnica: SVG nativo composto + Resvg-js per PNG (NO Satori/JSX — più leggero, SSG-friendly)
  - Font: system fonts (DejaVu Serif su Vercel Linux), accettabile per OG previews
- **hreflang** `it-IT` + `x-default`
- **Internal linking**: 3 link discorsivi (`/metodo` → `/chi-e` e `/metodo` → `/episodi`, `/chi-e` → `/metodo`)
- **Vercel Analytics**: script inline `/_vercel/insights/script.js` (404 atteso in locale, servito in produzione)

---

## 5 · Timeline git (cronologica)

```
ae578c9 chore: scaffold archè platform — Astro 5 hybrid + design system + content schemas
5cd2c9a feat: editorial system — 6 pages + dynamic episode route + components
e6d5c2b feat(motion): movement foundations + greek meander signature + threshold home
5c03bbd feat(motion): epigraph on home h1 + meander-on-arrival in hero
2b05f21 fix(ux): pass 1 — bug-fix critici + identità tipografica + colore
        ↑ Greek glyphs fix, eyebrow uppercase fix, meander clip-sweep,
          nav mobile hamburger, variable Bodoni (poi rimosso), Cormorant
          numerali I-V, --color-ember, focus-visible, skip-to-content,
          favicon SVG
d37c52e feat(motion): pass 2 — gesti diversificati per pagina
        ↑ data-incise (metodo), data-vitrine, data-stage (dal-vivo palco),
          data-page-turn (formazione libro), data-portrait (chi-e)
280e1a9 feat(ux): pass 3 — VideoScene + layout asimmetrico metodo + form notice + footer
        ↑ /metodo grid asimmetrica con numerali romani in margine,
          /dal-vivo form notice mailto, hero glow doppio cerchio,
          footer 1 row + 3 col
708f86f feat: cinematic atmospheric video backgrounds (hero + formazione) with scroll parallax
        ↑ ffmpeg pipeline 6 file ottimizzati, VideoBackground component
3f54573 feat(ux): full-screen sticky-pin video + text-only chapters + patina accent
        ↑ Sticky-pin Apple-style, kill data-vary (effetto allargamento),
          --color-patina nei tokens, manifesto in sezione testuale separata
efa09cb fix(video): crop black letterbox bands from source videos
        ↑ ffmpeg cropdetect + re-encode (bande nere baked-in nei sorgenti)
557bb21 feat: SEO infrastructure — sitemap, robots, JSON-LD, dynamic OG images, analytics
2dea15b feat: interactive archetype matrix — original SVG glyphs + meander constellation
14dafb5 fix: matrix glyphs (Aiace, Troiane, Eracle) + node alignment grid
        ↑ Aiace da mirino a scudo beotico, Troiane da bar chart a lira,
          Eracle da cerchi a nodo quadrato; griglia 2 fasce rigorose
9fd3747 feat: matrix — refined engraved glyphs + immersive self-drawing construction
        ↑ shadow layer + dettagli decorativi + cascade GSAP 3s + hover
          glow/breathe ← ULTIMO COMMIT
```

---

## 6 · Vincoli — i "mai" (NON negoziabili, sono regia)

Dal documento di regia archè + feedback Ivano in chat:

- **MAI rosso cronaca**, mai estetica da cronaca nera
- **MAI fondo chiaro** sulle pagine (l'avorio caldo dei video originali è eccezione contestuale)
- **MAI nome di vittima recente come gancio**
- **MAI indagini ancora aperte**
- **MAI caso della settimana**
- **MAI diagnosi su persone reali**
- **MAI sensazionalismo**
- **MAI popup, exit-intent, modal di iscrizione, post-scroll capture** (deciso esplicitamente nel blocco SEO)
- **MAI waitlist, CTA di vendita, social proof / testimonial** nei blocchi SEO
- **MAI newsletter aggressiva** (la faremo dopo, sobria, con Resend, su richiesta)
- **MAI volti di vittime / armi realistiche / sangue** nei video o glifi
- **MAI hover obbligatorio** per leggere contenuto essenziale (mobile + a11y)
- **MAI text-transform: uppercase su Greek** (storce i diacritici → usa `.greek` class)
- **NIENTE inventare token GitHub/secrets** — sempre da env del committente

Registro: museo archeologico / teatro greco. Sobrio, autorevole, lento, museale.

---

## 7 · Preferenze del committente (Ivano Sciretta)

Cose dette esplicitamente in chat:

- Vuole **estetica unica**, **velocità**, **semplicità d'uso**, **intuitività** (4 pilastri dichiarati)
- Vuole **conversione + posizionamento** (il sito è strumento di vendita)
- Ha **CHIESTO ESPLICITAMENTE** che NON ci siano popup, modal, exit-intent
- L'effetto **"allargamento dei testi" allo scroll non gli piace** (Bodoni variable axis era stato implementato e poi rimosso su sua richiesta)
- Vuole che **tra i video** ci siano **momenti di solo testo** (no crossfade di paragrafi sopra al video) → ho ristrutturato la home/formazione di conseguenza
- Vuole un **secondo accento di colore** per rompere il monocromatismo, **dentro la stessa palette** → ho aggiunto `patina` (verdi di bronzo ossidato)
- Sui video apprezza il pattern sticky-pin Apple-style ma sobrio
- Vuole **glifi preziosi** non da wireframe tecnico (richiesta che ha portato all'incisione doppio-layer)
- Vuole **costruzione animata immersiva** della costellazione
- **Sito già LIVE**: lui ha detto "fatto il sito online" — Vercel deploy completato

---

## 8 · Stato deploy Vercel

- Progetto importato su Vercel dal committente
- `GITHUB_TOKEN` configurato nelle env Vercel con scope `read:packages` (necessario per `npm install` del design system da GitHub Packages)
- `archecrime.com` è il dominio finale
- Vercel Analytics attivo
- Build pipeline: 6 HTML pagine + 6 OG PNG + sitemap-index.xml + bundle serverless

Per ri-deployare basta `git push origin main`. Vercel auto-builda.

---

## 9 · Cosa è PENDENTE / blocchi futuri da considerare

### 9.1 Video da generare (committente li sta facendo)

Ne sono stati prodotti **2/7**: hero (lucerna) e formazione (teste). Ne mancano **5** — gli ho già fornito i prompt completi nell'ultimo blocco rilevante. Riepilogo qui per riferimento.

**Preamble shared** da incollare in testa a ogni prompt:

```
Aspect ratio: 16:9, 1280×720, 10 seconds, seamless loop.

Composition:
- Subject strictly CENTERED in the frame, both horizontally and vertically.
- Subject occupies only the central 40-50% of the frame width.
- No important detail in top 15% or bottom 20% (text overlay zones).
- Mobile-safe: must survive a 50% horizontal crop centered on the middle.
- AVOID baked-in black letterbox bars — scene background must extend edge-to-edge.

Palette (strict):
- Background: deep warm ink #14110C.
- Subject: aged gold #C8A24E to bone #ECE4D2 highlights.
- NO red (one exception specified per prompt), NO bright orange, NO neon, NO blue tint.

Light: single warm spotlight above-left ~30°, heavy chiaroscuro.
Motion: locked or extremely slow camera (max 5% pan/zoom in 10s). Single take.
Mood: museum at night, Greek theater silence, archaeological dig under candlelight.

Negative prompt: text, captions, subtitles, logos, watermarks, faces,
identifiable people, modern objects, plastic, neon, red blood, gore, fast cuts,
music notation, jumpy motion, color flares, lens flare bursts, CGI cartoon look,
glitch effects, RGB shifts, anime style, black bars, letterbox borders.
```

**I 5 prompt** (priorità: vetrina → sipario → incisione → due mani → nucleo):

1. `/episodi` "La vetrina" — 5 maschere tragiche terracotta in vetrina museo, spotlight si accende in sequenza ogni 2s, masks face slightly down (no direct gaze)
2. `/metodo` "L'incisione" — chisel incide alpha greca in pietra, gold dust nelle scanalature, hand only from right edge
3. `/dal-vivo` "Il sipario" — tende velluto scuro che si aprono lentamente al centro, palco con singolo spotlight, dust motes
4. `/chi-e` "Le due mani" — mano sx con coccio terracotta, mano dx con bustina evidenze, si toccano al centro al secondo 8
5. **BONUS** `/episodi/[slug]` "Il nucleo" — struttura organica 3D che ruota con bagliore ember (#8A3A1E) interno pulsante, **UNICA eccezione palette rosso** (ember lapideo, non cronaca)

Pipeline ffmpeg già pronta. Quando arrivano i raw, integrazione: ~5 min/video.

### 9.2 Blocchi candidati (in ordine di valore)

| Blocco | Cosa | Effort | ROI |
|---|---|---|---|
| **Primo episodio Medea** | Creare `src/content/episodi/medea.mdx` con tutti i campi dello schema (numero, titolo, mito, fenomeno, fonte, durata, muxPlaybackId, capitoli, estratto, dataPubblicazione, pubblicato: true) + scrivere il corpo MDX della prima puntata | dipende da contenuto | **MAX** — è il pezzo identitario che attiva la matrice, le card "In arrivo" → links reali, e la pagina-episodio `/episodi/medea` |
| **Newsletter sobria** | Endpoint `/api/subscribe` + Resend integration + footer signup minimale (NO popup) | ~60 min | Alto (raccolta lead) |
| **Form `/dal-vivo` attivo** | Endpoint `/api/richiesta-tappa` con Resend | ~45 min | Medio |
| **Stripe checkout formazione** | Quando ci sarà 1 prodotto reale (data + prezzo) | ~2h | Medio |
| **3 porte + MythMatrix con icone** | Le 3 porte home (Guarda/Ascolta/Partecipa) sono identiche — dare a ciascuna un pittogramma | ~60 min | Medio |
| **Performance audit** | Lighthouse, code-splitting Lenis/GSAP per pagine senza motion, font subsetting | ~60 min | Medio |
| **`/chi-e` con foto Gabriella** | Quando arriverà il ritratto | dipende da materiale | Medio |
| **Mux player integrazione** | Quando ci sarà il primo video episodio in produzione | ~90 min | Alto (dipende dal contenuto) |
| **FAQ + Schema FAQ aggiuntivo** | Su /dal-vivo (tipiche obiezioni B2B) | ~45 min | Basso-Medio |

### 9.3 Bug noti / debiti tecnici

- **Vercel `_vercel/insights/script.js` 404 in locale**: atteso, servito da Vercel in produzione
- **`useId` rimosso** da `ArchetypeConstellation` (Invalid hook call con @astrojs/react 4.1.x): ID statico — problema solo se ci sono più costellazioni in pagina
- **OG image font**: usa system serif fallback (DejaVu Serif su Vercel Linux). Upgrade futuro: bundle TTF Bodoni Moda dentro Resvg per coerenza assoluta
- **`MythMatrix.astro` legacy**: lasciato in repo (non più importato da nessuna pagina, era sostituito dalla costellazione interattiva). Cleanup futuro
- **Mobile screenshot Playwright**: il browser tende a tornare a `about:blank` durante long sleeps — workaround: pause video + screenshot rapido
- **Astro Dev Toolbar visibile in dev**: è il widget di Astro, non issue del sito

---

## 10 · Reference rapida

### Comandi

```bash
npm run dev          # localhost:4322 (porta auto-bumped se occupata)
npm run build        # genera dist/ + .vercel/output/
npm run preview      # serve dist locale
npm run check        # astro check (TS strict)
git push origin main # auto-deploy su Vercel
```

### Env per build locale

```bash
export GITHUB_TOKEN="$(awk -F'_authToken=' '/npm.pkg.github.com\/:_authToken=/{print $2}' ~/.npmrc)"
# poi npm install / npm run build
```

Il `~/.npmrc` globale già ha il token GitHub Packages. In CI Vercel: env var `GITHUB_TOKEN` con scope `read:packages` (già configurata).

### Struttura file chiave

```
src/
  layouts/BaseLayout.astro       hreflang, JSON-LD, head slot, MotionHead, Footer
  pages/
    index.astro                  home con sticky-pin lucerna
    metodo.astro                 4 sezioni asimmetriche I-IV
    episodi/
      index.astro                archivio doppia chiave + ArchetypeConstellation
      [slug].astro               dynamic episode page (404 finché collection vuota)
    dal-vivo.astro               hero pinned + 3 formati + form preview
    formazione.astro             hero pinned con teste + catalogo
    chi-e.astro                  narrativa + 4 tratti + link gabriellamarano.it
    og/[slug].png.ts             OG image endpoint SSG
  components/
    Nav.astro                    desktop voci + hamburger mobile
    Footer.astro                 1 row brand + 3 col tematiche
    EpisodeCard.astro            card episodio (feature / compact variant)
    Ornament.astro               rombo oro decorativo
    PageHeader.astro             eyebrow + h1 + ornament + intro
    EpigraphFilter.astro         filtro SVG epigrafe (.is-epigraph)
    VideoBackground.astro        wrapper video lazy + veil + parallax
    MythMatrix.astro             LEGACY, non importato da nessuno
    motion/
      MotionHead.astro           pre-hide + safety timer
      SmoothScroll.tsx           island Lenis + GSAP + gesti
      GreekMeander.astro         firma greca, clip-path sweep
      RevealText.astro           wrapper [data-reveal]
      CurtainOpening.astro       sipario clip-path inset
      VideoScene.astro           embed video singolo lazy
    myth/
      glyphs.tsx                 5 glifi React (Medea, Elettra, Aiace, Eracle, Troiane)
      ArchetypeConstellation.tsx React island + GSAP cascade timeline
      ArchetypeConstellation.astro server wrapper, getCollection('episodi')
    seo/
      JsonLd.astro               wrapper <script type=application/ld+json>
  lib/
    seo.ts                       PAGE_TITLES, schemas, buildBreadcrumb, ogImageUrl
    og.ts                        SVG composer + Resvg PNG
  content/
    config.ts                    zod schemas: episodi (con mito enum), miti
    episodi/                     VUOTA (.gitkeep)
    miti/                        VUOTA (.gitkeep)
  styles/
    global.css                   tokens locali, Greek fallback, focus-visible,
                                 skip-link, ember+patina, hero-pin reduced-motion,
                                 arch-glow + arch-glyph-breathe
  assets/
    video-hero-src.mp4           GITIGNORED
    video-formazione-src.mp4     GITIGNORED
public/
  robots.txt
  video/                         6 file ottimizzati committati
```

---

## 11 · Prompt copy-paste per nuova sessione Claude

Quando apri Claude e vuoi riprendere il progetto, copia-incolla **esattamente** questo:

```
Lavoriamo su archecrime.com. Il progetto è in ~/Projects/arche-studio/arche-crime-site/.

Prima cosa: cd in quella cartella, leggi RESUME.md tutto, controlla "git log --oneline -10" e "git status". Il RESUME contiene:
- Identità brand (archè, Gabriella Marano, brand-media editoriale, NON cronaca nera)
- Stack (Astro 5 ibrido su Vercel + GitHub Packages design system)
- Stato di tutte le 6 pagine + le sistemi (motion, video, sticky-pin, archetype constellation con cascade)
- Vincoli ("mai" non negoziabili: no rosso, no popup, no newsletter aggressiva, no waitlist, no testimonial)
- Le mie preferenze esplicite (estetica/velocità/semplicità/intuitività, niente allargamento Bodoni, momenti solo-testo tra video, accento patina)
- Cosa è committato vs pendente
- I 5 prompt video ancora da generare

Quando hai finito di leggere, dimmi in poche righe:
1. Ultimo commit + cosa fa
2. Stato deploy Vercel
3. Cosa è pendente in ordine di valore
4. Eventuali bug noti

Poi aspetta che ti dia il prossimo blocco da implementare. Non rifare niente di già fatto. Non proporre niente che violi i vincoli "mai" del RESUME.
```

---

*Ultimo aggiornamento: dopo commit `9fd3747` — matrice incisa con cascade immersiva*
