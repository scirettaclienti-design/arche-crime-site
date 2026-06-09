/**
 * I cinque glifi degli archetipi archè — incisi a mano.
 *
 * Ogni glifo è una piccola "medaglia museale": doppio strato (shadow oro
 * scuro spostato di 0.4×0.6 + main oro caldo) per dare profondità da
 * incisione, dettagli decorativi (terminazioni, micro-ornamenti) che lo
 * differenziano da una icona di sistema, e CLASSI dedicate per pilotare
 * la "scrittura sotto gli occhi" via stroke-dashoffset.
 *
 * Convenzione di classi per il self-drawing:
 *  - .glyph-stroke         → tratto principale, animato da JS
 *  - .glyph-shadow         → ombra sottostante, animata in parallelo
 *  - .glyph-detail         → punto/fill decorativo, appare in opacity al
 *                            termine dei tratti
 *
 * Vincolo: nessun simbolo arma realistico, nessun sangue, sempre
 * stilizzazione greca arcaica.
 */

import type { ReactElement } from 'react';

interface GlyphProps {
  size?: number;
  /** Colore principale (override). Default: var(--color-gold). */
  color?: string;
  /** Colore ombra di profondità. Default: var(--color-gold-deep). */
  shadowColor?: string;
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

const DEFAULT_COLOR = 'var(--color-gold)';
const DEFAULT_SHADOW = 'var(--color-gold-deep)';
const DEFAULT_HIGHLIGHT = 'var(--color-gold-bright)';

function svgBase({ size = 64, ariaLabel, className }: GlyphProps): {
  width: number;
  height: number;
  viewBox: string;
  fill: 'none';
  role: 'img' | 'presentation';
  'aria-label': string | undefined;
  className: string | undefined;
} {
  return {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none',
    role: ariaLabel ? 'img' : 'presentation',
    'aria-label': ariaLabel,
    className,
  };
}

// Shadow layer = stesso path principale con offset, gold-deep.
// Wrapper in <g transform="translate(0.4 0.6)"> così posso applicarlo
// senza duplicare ogni d= dei singoli path.

/* ─────────────────────────────────────────────────────────────────────────
 * MEDEA — sole di Helios, inciso.
 * Cerchio inscritto (corona del sole) + 8 raggi alternati con terminali
 * a piccola perla (decorativo) + punto-fiamma + alone interno sottile.
 * ───────────────────────────────────────────────────────────────────────── */
export function MedeaGlyph(props: GlyphProps): ReactElement {
  const {
    color = DEFAULT_COLOR,
    shadowColor = DEFAULT_SHADOW,
    strokeWidth = 1.4,
  } = props;
  // 8 raggi, lunghi/corti alternati. Inner = 12, outer = 26 (assi) / 22 (diagonali).
  const rays = [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    const inner = 12;
    const outer = deg % 90 === 0 ? 26 : 22;
    return {
      x1: 32 + Math.cos(rad) * inner,
      y1: 32 + Math.sin(rad) * inner,
      x2: 32 + Math.cos(rad) * outer,
      y2: 32 + Math.sin(rad) * outer,
      deg,
    };
  });
  // Estremi dei raggi assiali (4 punti) — per le piccole perle terminali
  const beadPositions = rays.filter((r) => r.deg % 90 === 0);

  return (
    <svg {...svgBase(props)}>
      {/* SHADOW */}
      <g
        className="glyph-shadow-wrap"
        stroke={shadowColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        transform="translate(0.4 0.6)"
        opacity="0.7"
      >
        <circle className="glyph-shadow" cx="32" cy="32" r="8" />
        {rays.map((r) => (
          <line
            key={`s${r.deg}`}
            className="glyph-shadow"
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
          />
        ))}
      </g>

      {/* MAIN */}
      <g
        className="glyph-main"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      >
        <circle className="glyph-stroke" cx="32" cy="32" r="8" />
        {/* alone interno sottile (dettaglio inciso, leggermente più stretto) */}
        <circle
          className="glyph-stroke"
          cx="32"
          cy="32"
          r="5"
          stroke={shadowColor}
          strokeWidth={0.9}
          opacity="0.7"
        />
        {rays.map((r) => (
          <line
            key={`m${r.deg}`}
            className="glyph-stroke"
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
          />
        ))}
      </g>

      {/* DETAIL: perle terminali (4 punti agli estremi dei raggi assiali) +
          fiamma centrale (gold-bright). */}
      <g className="glyph-detail" fill={color} stroke="none">
        {beadPositions.map((r) => (
          <circle key={`b${r.deg}`} cx={r.x2} cy={r.y2} r="0.9" />
        ))}
        <circle cx="32" cy="32" r="1.8" fill={DEFAULT_HIGHLIGHT} />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * ELETTRA — frontone con crepa, inciso.
 * Timpano triangolare con piccolo akrotério centrale (decorativo greco) +
 * crepa zigzag + architrave doppia + colonne con capitelli (cross small) +
 * basi.
 * ───────────────────────────────────────────────────────────────────────── */
export function ElettraGlyph(props: GlyphProps): ReactElement {
  const {
    color = DEFAULT_COLOR,
    shadowColor = DEFAULT_SHADOW,
    strokeWidth = 1.4,
  } = props;
  return (
    <svg {...svgBase(props)}>
      {/* SHADOW */}
      <g
        className="glyph-shadow-wrap"
        stroke={shadowColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="miter"
        strokeLinecap="round"
        transform="translate(0.4 0.6)"
        opacity="0.7"
      >
        <path className="glyph-shadow" d="M 32 14 L 52 38 L 12 38 Z" />
        <line className="glyph-shadow" x1="14" y1="42" x2="50" y2="42" />
        <line className="glyph-shadow" x1="20" y1="42" x2="20" y2="52" />
        <line className="glyph-shadow" x1="44" y1="42" x2="44" y2="52" />
        <line className="glyph-shadow" x1="14" y1="52" x2="50" y2="52" />
      </g>

      {/* MAIN */}
      <g
        className="glyph-main"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="miter"
        strokeLinecap="round"
        fill="none"
      >
        {/* Timpano triangolare */}
        <path className="glyph-stroke" d="M 32 14 L 52 38 L 12 38 Z" />
        {/* Crepa zigzag (più articolata di prima) */}
        <path
          className="glyph-stroke"
          d="M 32 16 L 30 22 L 34 28 L 30 34 L 33 38"
          strokeWidth={1.2}
        />
        {/* Architrave doppia (linea spessa + linea fine sopra) */}
        <line className="glyph-stroke" x1="14" y1="42" x2="50" y2="42" />
        <line
          className="glyph-stroke"
          x1="14"
          y1="39.5"
          x2="50"
          y2="39.5"
          strokeWidth={0.7}
          opacity="0.65"
        />
        {/* Colonne con leggera rastrematura — disegnate come line ma le
            estremità leggermente "rastremate" via 2 segmenti */}
        <line className="glyph-stroke" x1="20" y1="44" x2="20" y2="51" />
        <line className="glyph-stroke" x1="44" y1="44" x2="44" y2="51" />
        {/* Capitelli (piccolo trattino orizzontale sopra le colonne) */}
        <line className="glyph-stroke" x1="18" y1="43.5" x2="22" y2="43.5" strokeWidth={1.1} />
        <line className="glyph-stroke" x1="42" y1="43.5" x2="46" y2="43.5" strokeWidth={1.1} />
        {/* Stilobate */}
        <line className="glyph-stroke" x1="13" y1="52" x2="51" y2="52" strokeWidth={1.2} />
      </g>

      {/* DETAIL: akrotério (piccolo punto sull'apice del timpano) */}
      <g className="glyph-detail" fill={color} stroke="none">
        <circle cx="32" cy="13" r="1" fill={DEFAULT_HIGHLIGHT} />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * AIACE — scudo beotico inciso.
 * Profilo a 8 (incavi laterali) + episema centrale + crepa obliqua + due
 * trattini interni di trama (richiamo del cuoio).
 * ───────────────────────────────────────────────────────────────────────── */
const AIACE_SHIELD_PATH =
  'M 32 10 C 44 10 48 16 48 22 C 48 26 42 28 38 30 L 48 30 C 48 34 48 38 48 42 C 48 48 44 54 32 54 C 20 54 16 48 16 42 C 16 38 16 34 16 30 L 26 30 C 22 28 16 26 16 22 C 16 16 20 10 32 10 Z';

export function AiaceGlyph(props: GlyphProps): ReactElement {
  const {
    color = DEFAULT_COLOR,
    shadowColor = DEFAULT_SHADOW,
    strokeWidth = 1.4,
  } = props;
  return (
    <svg {...svgBase(props)}>
      {/* SHADOW */}
      <g
        className="glyph-shadow-wrap"
        stroke={shadowColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        transform="translate(0.4 0.6)"
        opacity="0.7"
      >
        <path className="glyph-shadow" d={AIACE_SHIELD_PATH} />
      </g>

      {/* MAIN */}
      <g
        className="glyph-main"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      >
        <path className="glyph-stroke" d={AIACE_SHIELD_PATH} />
        {/* Trama interna: 2 archi sottili che richiamano il cuoio dello scudo */}
        <path
          className="glyph-stroke"
          d="M 22 18 Q 32 22 42 18"
          strokeWidth={0.7}
          opacity="0.6"
          stroke={shadowColor}
        />
        <path
          className="glyph-stroke"
          d="M 22 46 Q 32 50 42 46"
          strokeWidth={0.7}
          opacity="0.6"
          stroke={shadowColor}
        />
        {/* Crepa obliqua dall'orlo superiore, più articolata */}
        <path
          className="glyph-stroke"
          d="M 27 13 L 30 21 L 27 27"
          strokeWidth={1.2}
        />
      </g>

      {/* DETAIL: episema centrale e piccolo rivetto */}
      <g className="glyph-detail" fill={color} stroke="none">
        <circle cx="32" cy="32" r="1.9" fill={DEFAULT_HIGHLIGHT} />
        <circle cx="32" cy="32" r="3.2" fill="none" stroke={color} strokeWidth="0.6" opacity="0.55" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * ERACLE — nodo quadrato, inciso.
 * 4 ellissi ai vertici + X centrale con piccoli serif agli incroci +
 * perno centrale + filo decorativo che attraversa.
 * ───────────────────────────────────────────────────────────────────────── */
export function EracleGlyph(props: GlyphProps): ReactElement {
  const {
    color = DEFAULT_COLOR,
    shadowColor = DEFAULT_SHADOW,
    strokeWidth = 1.4,
  } = props;
  return (
    <svg {...svgBase(props)}>
      {/* SHADOW */}
      <g
        className="glyph-shadow-wrap"
        stroke={shadowColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        transform="translate(0.4 0.6)"
        opacity="0.7"
      >
        <ellipse className="glyph-shadow" cx="18" cy="18" rx="7" ry="6" />
        <ellipse className="glyph-shadow" cx="46" cy="18" rx="7" ry="6" />
        <ellipse className="glyph-shadow" cx="18" cy="46" rx="7" ry="6" />
        <ellipse className="glyph-shadow" cx="46" cy="46" rx="7" ry="6" />
        <line className="glyph-shadow" x1="22" y1="22" x2="42" y2="42" />
        <line className="glyph-shadow" x1="42" y1="22" x2="22" y2="42" />
      </g>

      {/* MAIN */}
      <g
        className="glyph-main"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      >
        {/* 4 anelli */}
        <ellipse className="glyph-stroke" cx="18" cy="18" rx="7" ry="6" />
        <ellipse className="glyph-stroke" cx="46" cy="18" rx="7" ry="6" />
        <ellipse className="glyph-stroke" cx="18" cy="46" rx="7" ry="6" />
        <ellipse className="glyph-stroke" cx="46" cy="46" rx="7" ry="6" />
        {/* X centrale: le due funi */}
        <line className="glyph-stroke" x1="22" y1="22" x2="42" y2="42" />
        <line className="glyph-stroke" x1="42" y1="22" x2="22" y2="42" />
        {/* Filo decorativo orizzontale (sottile) che lega visivamente i due lati */}
        <line
          className="glyph-stroke"
          x1="25"
          y1="32"
          x2="39"
          y2="32"
          strokeWidth={0.7}
          opacity="0.55"
          stroke={shadowColor}
        />
      </g>

      {/* DETAIL: perno centrale + piccoli punti agli incroci dell'X */}
      <g className="glyph-detail" fill={color} stroke="none">
        <circle cx="32" cy="32" r="1.7" fill={DEFAULT_HIGHLIGHT} />
        <circle cx="22" cy="22" r="0.7" />
        <circle cx="42" cy="22" r="0.7" />
        <circle cx="22" cy="42" r="0.7" />
        <circle cx="42" cy="42" r="0.7" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * LE TROIANE — lira con corda spezzata, incisa.
 * Giogo + bracci curvi + cassa armonica (chelys) con ponte + 4 corde di
 * cui una spezzata + ancoraggi piccoli alle estremità delle corde.
 * ───────────────────────────────────────────────────────────────────────── */
export function TroianeGlyph(props: GlyphProps): ReactElement {
  const {
    color = DEFAULT_COLOR,
    shadowColor = DEFAULT_SHADOW,
    strokeWidth = 1.4,
  } = props;
  return (
    <svg {...svgBase(props)}>
      {/* SHADOW */}
      <g
        className="glyph-shadow-wrap"
        stroke={shadowColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        transform="translate(0.4 0.6)"
        opacity="0.7"
      >
        <line className="glyph-shadow" x1="18" y1="14" x2="46" y2="14" />
        <path className="glyph-shadow" d="M 18 14 C 10 24 10 36 18 46" />
        <path className="glyph-shadow" d="M 46 14 C 54 24 54 36 46 46" />
        <path className="glyph-shadow" d="M 18 46 C 24 52 40 52 46 46" />
      </g>

      {/* MAIN */}
      <g
        className="glyph-main"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      >
        {/* Giogo */}
        <line className="glyph-stroke" x1="18" y1="14" x2="46" y2="14" />
        {/* Piccoli capitelli ai vertici del giogo (decoro) */}
        <line className="glyph-stroke" x1="15" y1="14" x2="18" y2="11" strokeWidth={1.1} />
        <line className="glyph-stroke" x1="49" y1="14" x2="46" y2="11" strokeWidth={1.1} />
        {/* Bracci */}
        <path className="glyph-stroke" d="M 18 14 C 10 24 10 36 18 46" />
        <path className="glyph-stroke" d="M 46 14 C 54 24 54 36 46 46" />
        {/* Cassa armonica (chelys) */}
        <path className="glyph-stroke" d="M 18 46 C 24 52 40 52 46 46" />
        {/* Ponte (linea sotto cui passano le corde) */}
        <line
          className="glyph-stroke"
          x1="22"
          y1="46"
          x2="42"
          y2="46"
          strokeWidth={0.8}
          opacity="0.7"
          stroke={shadowColor}
        />
        {/* 3 corde intere */}
        <line className="glyph-stroke" x1="25" y1="16" x2="25" y2="46" strokeWidth={0.9} />
        <line className="glyph-stroke" x1="29.5" y1="16" x2="29.5" y2="46" strokeWidth={0.9} />
        <line className="glyph-stroke" x1="34" y1="16" x2="34" y2="46" strokeWidth={0.9} />
        {/* Quarta corda spezzata — stub alto */}
        <line
          className="glyph-stroke"
          x1="38.5"
          y1="16"
          x2="38.5"
          y2="25"
          strokeWidth={0.9}
        />
        {/* Parte bassa della corda spezzata, pendente */}
        <path
          className="glyph-stroke"
          d="M 38.5 29 Q 42 35 39 42"
          strokeWidth={0.9}
        />
      </g>

      {/* DETAIL: ancoraggi delle corde (piccoli punti al giogo e al ponte)
          + decoro centrale della cassa */}
      <g className="glyph-detail" fill={color} stroke="none">
        <circle cx="25" cy="14" r="0.55" />
        <circle cx="29.5" cy="14" r="0.55" />
        <circle cx="34" cy="14" r="0.55" />
        <circle cx="38.5" cy="14" r="0.55" />
        <circle cx="25" cy="46" r="0.55" />
        <circle cx="29.5" cy="46" r="0.55" />
        <circle cx="34" cy="46" r="0.55" />
        {/* L'ancoraggio della corda spezzata: il bottone alto resta, il basso "manca" */}
        <circle cx="32" cy="50" r="1" fill={DEFAULT_HIGHLIGHT} />
      </g>
    </svg>
  );
}

/* Mappa slug → componente glifo per accesso dinamico. */
export const MYTH_GLYPHS = {
  medea: MedeaGlyph,
  elettra: ElettraGlyph,
  aiace: AiaceGlyph,
  eracle: EracleGlyph,
  troiane: TroianeGlyph,
} as const;

export type MythSlug = keyof typeof MYTH_GLYPHS;
