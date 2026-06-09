/**
 * OG image composer — costruisce l'SVG dell'immagine Open Graph 1200×630
 * e la rasterizza in PNG via @resvg/resvg-js.
 *
 * SCELTA TECNICA — Resvg-js + SVG nativo (non Satori/JSX).
 * Perché:
 *  - SSG-friendly: gira a build-time dentro l'endpoint Astro prerender=true.
 *  - Zero React, zero JSX: leggero, niente runtime extra.
 *  - Resvg supporta SVG completo, gradient, path complessi.
 *  - Resvg-js viaggia con binari prebuiltati per Linux x64 (Vercel) e macOS
 *    arm64 (dev locale).
 *  - Font: usiamo system fonts (Resvg `loadSystemFonts: true`). Su Linux di
 *    Vercel il fallback serif sarà DejaVu Serif — non Bodoni, ma per
 *    un'immagine di preview a 1200×630 va benissimo. Un upgrade futuro
 *    può bundlare un TTF Bodoni Moda per coerenza assoluta col sito.
 *
 * Layout dell'immagine:
 *  - Background ink #14110C
 *  - Rombo ◆ oro centrato in alto
 *  - Titolo (grande, serif) centrato a metà
 *  - Sottotitolo (italic, oro più scuro) sotto al titolo
 *  - Mini-meandro greco oro alla base, sottile
 *  - Tagline "archè · dal mito alla mente" sotto al meandro
 */

import { Resvg } from '@resvg/resvg-js';

const W = 1200;
const H = 630;

const INK = '#14110C';
const BONE = '#ECE4D2';
const GOLD = '#C8A24E';
const GOLD_BRIGHT = '#E0C685';
const GOLD_DEEP = '#8C6E36';
const BONE_FAINT = '#8C8370';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Pattern di greca greca — N moduli concatenati orizzontali. */
function meanderPath(modules: number, modW: number, modH: number): string {
  const segs: string[] = [`M 0 ${modH}`];
  for (let i = 0; i < modules; i += 1) {
    const x = i * modW;
    segs.push(`L ${x} 0`);
    segs.push(`L ${x + modW} 0`);
    segs.push(`L ${x + modW} ${modH * 0.65}`);
    segs.push(`L ${x + modW * 0.25} ${modH * 0.65}`);
    segs.push(`L ${x + modW * 0.25} ${modH * 0.3}`);
    segs.push(`L ${x + modW * 0.75} ${modH * 0.3}`);
    segs.push(`L ${x + modW * 0.75} ${modH}`);
    if (i < modules - 1) segs.push(`L ${x + modW} ${modH}`);
  }
  return segs.join(' ');
}

/** Costruisce l'SVG completo. */
function buildSvg(title: string, subtitle?: string): string {
  const t = escapeXml(title);
  const s = subtitle ? escapeXml(subtitle) : '';

  // Adatta il font-size al titolo per evitare overflow su titoli lunghi.
  const titleSize = title.length > 22 ? 84 : title.length > 14 ? 104 : 124;
  const subtitleSize = 32;

  // Meandro a piè di pagina, 10 moduli larghi 32 alti 16.
  const meanderModules = 10;
  const meanderModW = 32;
  const meanderModH = 16;
  const meanderTotalW = meanderModules * meanderModW;
  const meanderX = (W - meanderTotalW) / 2;
  const meanderY = 530;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="35%" r="55%">
      <stop offset="0%" stop-color="${GOLD_DEEP}" stop-opacity="0.45"/>
      <stop offset="60%" stop-color="${GOLD_DEEP}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${INK}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Cornice sottile oro -->
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}"
        fill="none" stroke="${GOLD_DEEP}" stroke-width="1" stroke-opacity="0.55"/>

  <!-- Rombo ◆ oro centrato in alto -->
  <g transform="translate(${W / 2} 160)">
    <path d="M 0 -22 L 22 0 L 0 22 L -22 0 Z"
          fill="${GOLD_BRIGHT}" stroke="${GOLD_DEEP}" stroke-width="1"/>
  </g>

  <!-- Titolo -->
  <text x="${W / 2}" y="${315 + (titleSize - 84) * 0.3}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', 'DejaVu Serif', serif"
        font-size="${titleSize}" font-weight="500"
        fill="${BONE}">${t}</text>

  ${s
      ? `<!-- Sottotitolo -->
  <text x="${W / 2}" y="395" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', 'DejaVu Serif', serif"
        font-size="${subtitleSize}" font-style="italic"
        fill="${GOLD_BRIGHT}">${s}</text>`
      : ''
    }

  <!-- Meandro fascia bassa -->
  <g transform="translate(${meanderX} ${meanderY})"
     fill="none" stroke="${GOLD}" stroke-width="1.5" stroke-linecap="square">
    <path d="${meanderPath(meanderModules, meanderModW, meanderModH)}"/>
  </g>

  <!-- Tagline firma -->
  <text x="${W / 2}" y="585" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', 'DejaVu Serif', serif"
        font-size="22" letter-spacing="8"
        fill="${BONE_FAINT}">ARCHÈ · DAL MITO ALLA MENTE</text>
</svg>`;
}

/** Genera il PNG buffer dato titolo e sottotitolo. */
export function generateOgPng(title: string, subtitle?: string): Buffer {
  const svg = buildSvg(title, subtitle);
  const resvg = new Resvg(svg, {
    background: INK,
    fitTo: { mode: 'width', value: W },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Georgia',
    },
  });
  const rendered = resvg.render();
  return rendered.asPng();
}
