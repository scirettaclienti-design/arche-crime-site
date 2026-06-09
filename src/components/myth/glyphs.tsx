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
 * AIACE — scudo incrinato.
 * L'identità eroica che non regge. Doppio cerchio concentrico (la scuto
 * arcaico greco con omphalos centrale) + crepa diagonale che attraversa
 * entrambi gli anelli. Niente arma, niente sangue: solo l'incrinatura.
 * ───────────────────────────────────────────────────────────────────────── */
export function AiaceGlyph(props: GlyphProps): ReactElement {
  const { color = 'currentColor', strokeWidth = 1.5 } = props;
  return (
    <svg {...baseProps(props)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
      {/* Cerchio esterno (orlo dello scudo) */}
      <circle cx="32" cy="32" r="22" />
      {/* Cerchio intermedio (corpo) */}
      <circle cx="32" cy="32" r="15" />
      {/* Umbone (omphalos) — punto al centro */}
      <circle cx="32" cy="32" r="3" fill={color} stroke="none" />
      {/* Crepa diagonale che spacca lo scudo */}
      <line x1="14" y1="18" x2="50" y2="48" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * ERACLE — nodo di Eracle (Heracles knot) — motivo greco classico.
 * Due cerchi intrecciati: la forza che dovrebbe legare e proteggere. Una
 * leggera interruzione su uno dei due anelli evoca la perdita di controllo
 * (la forza che si rivolta). Geometrico, mai un'arma.
 * ───────────────────────────────────────────────────────────────────────── */
export function EracleGlyph(props: GlyphProps): ReactElement {
  const { color = 'currentColor', strokeWidth = 1.5 } = props;
  return (
    <svg {...baseProps(props)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
      {/* Anello sinistro — completo */}
      <circle cx="24" cy="32" r="12" />
      {/* Anello destro — con piccola interruzione in alto (la "rottura") */}
      <path d="M 35 22 A 12 12 0 1 1 32 23.2" />
      {/* Trattino interno che enfatizza l'intreccio (il "nodo") */}
      <line x1="28" y1="26" x2="36" y2="38" opacity="0.7" />
      <line x1="36" y1="26" x2="28" y2="38" opacity="0.7" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * LE TROIANE — voci messe a tacere.
 * 5 strokes verticali in fila, ognuno più corto del precedente. Una linea
 * di voci/figure-coro che si abbassa, fino a un punto solitario alla fine.
 * Niente mura crollanti (rischio cliché): l'idea è il diminuendo, il
 * silenzio dopo la voce. Sotto, una sottile linea-terra le ancora.
 * ───────────────────────────────────────────────────────────────────────── */
export function TroianeGlyph(props: GlyphProps): ReactElement {
  const { color = 'currentColor', strokeWidth = 1.5 } = props;
  const baseY = 50;
  const xs = [14, 22, 30, 38, 46];
  const heights = [30, 25, 19, 13, 7];
  return (
    <svg {...baseProps(props)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
      {xs.map((x, i) => (
        <line key={x} x1={x} y1={baseY - heights[i]!} x2={x} y2={baseY} />
      ))}
      {/* Punto finale: l'ultima voce ridotta a sussurro */}
      <circle cx="54" cy={baseY - 1} r="1.2" fill={color} stroke="none" />
      {/* Linea-terra sotto, sottilissima */}
      <line x1="10" y1="54" x2="58" y2="54" opacity="0.55" />
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
