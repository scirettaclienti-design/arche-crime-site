/**
 * I cinque glifi degli archetipi archè — disegnati a mano nel linguaggio
 * visivo del meandro greco (firma del sito): tratto sottile in oro, fill
 * none, geometria pulita. NON sono clipart, NON sono emoji. Ognuno evoca
 * il proprio mito in modo simbolico, MAI letteralmente violento.
 *
 * Tutti sono pensati per essere leggibili a ~48-64px.
 * stroke-width nominale 1.5 (in coordinate viewBox 64×64).
 * Si aspettano color e strokeWidth come props per consentire variazioni
 * (es. hover gold→gold-bright, oppure ember sulla pagina-episodio).
 */

import type { ReactElement } from 'react';

interface GlyphProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

function baseProps({ size = 64, ariaLabel, className }: GlyphProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none' as const,
    'aria-label': ariaLabel,
    role: ariaLabel ? ('img' as const) : ('presentation' as const),
    className,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * MEDEA — sole/fuoco di Helios.
 * Medea è nipote di Helios, viene dalla Colchide, terra del sole nascente.
 * Il glifo: cerchio centrale (fuoco/anima), 8 raggi geometrici di lunghezza
 * variabile (sole inciso), punto-fiamma al centro.
 * ───────────────────────────────────────────────────────────────────────── */
export function MedeaGlyph(props: GlyphProps): ReactElement {
  const { color = 'currentColor', strokeWidth = 1.5 } = props;
  // 8 raggi a 45° con lunghezze alternate (4 lunghi, 4 corti) — più "inciso" che decorativo.
  const rays = [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    const inner = 12;
    const outer = deg % 90 === 0 ? 26 : 22;
    return {
      x1: 32 + Math.cos(rad) * inner,
      y1: 32 + Math.sin(rad) * inner,
      x2: 32 + Math.cos(rad) * outer,
      y2: 32 + Math.sin(rad) * outer,
      key: deg,
    };
  });
  return (
    <svg {...baseProps(props)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
      <circle cx="32" cy="32" r="8" />
      {rays.map((r) => (
        <line key={r.key} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
      ))}
      <circle cx="32" cy="32" r="2" fill={color} stroke="none" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * ELETTRA — frontone di tempio spezzato.
 * La casa di Atride come scena del crimine ereditata. Il timpano (frontone)
 * con una crepa che lo divide dall'apice. Sotto, due colonne brevi suggeriscono
 * il tempio/dimora.
 * ───────────────────────────────────────────────────────────────────────── */
export function ElettraGlyph(props: GlyphProps): ReactElement {
  const { color = 'currentColor', strokeWidth = 1.5 } = props;
  return (
    <svg {...baseProps(props)} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" strokeLinecap="round">
      {/* Timpano triangolare */}
      <path d="M 32 14 L 52 38 L 12 38 Z" />
      {/* Crepa: zigzag dall'apice fin sotto la base del timpano */}
      <path d="M 32 16 L 30 24 L 34 30 L 31 38" />
      {/* Architrave */}
      <line x1="14" y1="42" x2="50" y2="42" />
      {/* Due colonne minime */}
      <line x1="20" y1="42" x2="20" y2="52" />
      <line x1="44" y1="42" x2="44" y2="52" />
      {/* Stilobate */}
      <line x1="14" y1="52" x2="50" y2="52" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * AIACE — scudo beotico spezzato.
 * Lo scudo beotico (forma classica a "8" / clessidra con incavi laterali
 * al centro), distintivo della tradizione greca arcaica. Episema (boss)
 * centrale a punto, una crepa che parte dall'orlo superiore e scende
 * obliquamente nella lobata superiore. NIENTE cerchi concentrici: la
 * silhouette è inequivocabilmente uno scudo, non un mirino.
 * ───────────────────────────────────────────────────────────────────────── */
export function AiaceGlyph(props: GlyphProps): ReactElement {
  const { color = 'currentColor', strokeWidth = 1.5 } = props;
  return (
    <svg {...baseProps(props)} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round">
      {/* Profilo dello scudo beotico (figura-8 con incavi laterali al centro).
          Disegnato come un singolo path chiuso. */}
      <path d="
        M 32 10
        C 44 10 48 16 48 22
        C 48 26 42 28 38 30
        L 48 30
        C 48 34 48 38 48 42
        C 48 48 44 54 32 54
        C 20 54 16 48 16 42
        C 16 38 16 34 16 30
        L 26 30
        C 22 28 16 26 16 22
        C 16 16 20 10 32 10 Z" />
      {/* Episema (umbone) al centro */}
      <circle cx="32" cy="32" r="1.8" fill={color} stroke="none" />
      {/* Crepa: parte dall'orlo superiore, scende obliqua nella lobata alta */}
      <path d="M 28 14 L 31 22 L 27 28" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * ERACLE — nodo di Eracle, riprogettato come nodo QUADRATO.
 * Quattro anelli ai vertici di un quadrato, attraversati da una X centrale
 * che è il "nodo" vero (le due funi che si incrociano). La silhouette è
 * angolare/quadrata — totalmente distinguibile dallo scudo tondeggiante
 * di Aiace. La forza che dovrebbe legare e proteggere, qui annodata.
 * ───────────────────────────────────────────────────────────────────────── */
export function EracleGlyph(props: GlyphProps): ReactElement {
  const { color = 'currentColor', strokeWidth = 1.5 } = props;
  return (
    <svg {...baseProps(props)} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round">
      {/* 4 anelli ai vertici di un quadrato 36×36 (centrato in 32,32) */}
      <ellipse cx="18" cy="18" rx="7" ry="6" />
      <ellipse cx="46" cy="18" rx="7" ry="6" />
      <ellipse cx="18" cy="46" rx="7" ry="6" />
      <ellipse cx="46" cy="46" rx="7" ry="6" />
      {/* X centrale: le due funi che si annodano */}
      <line x1="22" y1="22" x2="42" y2="42" />
      <line x1="42" y1="22" x2="22" y2="42" />
      {/* Punto-perno al centro dell'intreccio */}
      <circle cx="32" cy="32" r="1.6" fill={color} stroke="none" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * LE TROIANE — lira greca con una corda spezzata.
 * Il canto del coro interrotto. Cassa armonica curva alla base, due bracci
 * curvi che salgono ai lati, traversa orizzontale in cima. Quattro corde
 * verticali: tre intere e una SPEZZATA al terzo superiore, con la parte
 * inferiore che pende mollemente. Voce silenziata, non grafico statistico.
 * ───────────────────────────────────────────────────────────────────────── */
export function TroianeGlyph(props: GlyphProps): ReactElement {
  const { color = 'currentColor', strokeWidth = 1.5 } = props;
  return (
    <svg {...baseProps(props)} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round">
      {/* Traversa superiore (giogo) */}
      <line x1="18" y1="14" x2="46" y2="14" />
      {/* Braccio sinistro: dal giogo curva verso l'esterno e rientra alla cassa */}
      <path d="M 18 14 C 10 24 10 36 18 46" />
      {/* Braccio destro: speculare */}
      <path d="M 46 14 C 54 24 54 36 46 46" />
      {/* Cassa armonica (chelys) — semplice arco alla base */}
      <path d="M 18 46 C 24 52 40 52 46 46" />
      {/* Linea che chiude la cassa in alto (ponte) */}
      <line x1="22" y1="46" x2="42" y2="46" opacity="0.65" />
      {/* Corde: 3 intere */}
      <line x1="25" y1="16" x2="25" y2="46" />
      <line x1="29.5" y1="16" x2="29.5" y2="46" />
      <line x1="34" y1="16" x2="34" y2="46" />
      {/* Quarta corda — SPEZZATA: stub dal giogo */}
      <line x1="38.5" y1="16" x2="38.5" y2="26" />
      {/* Parte inferiore della corda spezzata, che pende molle */}
      <path d="M 38.5 30 Q 42 35 39.5 42" />
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
