import { useEffect, useRef, useState, type ReactElement } from 'react';
import { MYTH_GLYPHS, type MythSlug } from './glyphs';

/**
 * ArchetypeConstellation — il "gioiello" archè, ora con costruzione
 * animata immersiva.
 *
 * All'ingresso nel viewport il rito si compone sotto gli occhi:
 *   1. Medea già al suo posto (origine del filo): glifo si incide,
 *      testo emerge.
 *   2. Il meandro si traccia da Medea verso Elettra (stroke-dashoffset).
 *   3. Raggiunto Elettra, il suo glifo si incide e il testo emerge.
 *   4. Stessa procedura fino a Le Troiane.
 *   5. A costruzione completa, breve pulse oro dei glifi (settle).
 * Tempo totale ~3 secondi.
 *
 * Contratti:
 *  - reduced-motion → niente self-drawing, niente cascade. Glifi e testo
 *    sono completi al primo paint.
 *  - SSR-safe: il primo render Astro mostra la matrice intera; al mount
 *    React, se motion è attivo, lo stato pre-disegno viene applicato
 *    e parte la timeline.
 *  - Linking smart: invariato. Episodio pubblicato → <a>, altrimenti
 *    <div role=group> con badge "In arrivo".
 */

export interface ArchetypeNode {
  slug: MythSlug;
  nome: string;
  fonte: string;
  chiave: string;
  nota: string;
  episodeSlug?: string;
}

interface Props {
  archetypes: ArchetypeNode[];
  title?: string;
  eyebrow?: string;
}

// ── Posizioni desktop (viewBox 1200×420), due fasce rigorose.
const HIGH_Y = 130;
const LOW_Y = 260;
const NODE_POSITIONS: Record<MythSlug, { x: number; y: number }> = {
  medea: { x: 130, y: LOW_Y },
  elettra: { x: 370, y: HIGH_Y },
  aiace: { x: 600, y: LOW_Y },
  eracle: { x: 830, y: HIGH_Y },
  troiane: { x: 1070, y: LOW_Y },
};

const ORDER: MythSlug[] = ['medea', 'elettra', 'aiace', 'eracle', 'troiane'];

export default function ArchetypeConstellation({
  archetypes,
  title = 'La matrice dei cinque archetipi',
  eyebrow = 'archè · la matrice',
}: Props): ReactElement {
  const [focused, setFocused] = useState<MythSlug | null>(null);
  const [reduced, setReduced] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const meanderId = 'arch-constellation';

  const byslug = new Map(archetypes.map((a) => [a.slug, a]));

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (): void => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    if (!container) return;

    let cleanup: (() => void) | undefined;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      // ── Pre-hide: tutti gli stroke dei glifi nascosti via dashoffset =
      // length, tutti i dettagli fill a opacity 0, tutti i testi a opacity 0
      // con piccolo y, tutti i 4 segmenti del meandro nascosti via dashoffset.
      const glyphs = ORDER.map((slug) => ({
        slug,
        node: container.querySelector<HTMLElement>(
          `[data-arch-node][data-arch-slug="${slug}"]`,
        ),
      })).filter((g) => g.node !== null);

      glyphs.forEach(({ node }) => {
        if (!node) return;
        const strokes = node.querySelectorAll<SVGGeometryElement>(
          '.glyph-stroke, .glyph-shadow',
        );
        strokes.forEach((el) => {
          try {
            const len = el.getTotalLength();
            el.style.strokeDasharray = `${len}`;
            el.style.strokeDashoffset = `${len}`;
          } catch {
            // Element non drawable: skip.
          }
        });
        const detailFills = node.querySelectorAll<HTMLElement>('.glyph-detail');
        detailFills.forEach((el) => {
          el.style.opacity = '0';
        });
        // Testi del nodo (eyebrow + nome + fonte + nota + badge) pre-hidden
        const texts = node.querySelectorAll<HTMLElement>('.arch-node-text');
        texts.forEach((el) => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(8px)';
        });
      });

      // ── Pre-hide dei 4 segmenti del meandro
      const meanderSegments =
        container.querySelectorAll<SVGPathElement>('.arch-meander-segment');
      meanderSegments.forEach((path) => {
        try {
          const len = path.getTotalLength();
          path.style.strokeDasharray = `${len}`;
          path.style.strokeDashoffset = `${len}`;
        } catch {
          /* noop */
        }
      });

      // ── Timeline orchestrata
      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();

          // Per ogni nodo nell'ordine canonico:
          //   1. (per nodi > 0) traccia il segmento di meandro che porta a quel nodo
          //   2. self-draw del glifo (strokes)
          //   3. fade-in dei dettagli (fill)
          //   4. fade-up del testo del nodo
          ORDER.forEach((slug, i) => {
            const nodeEl = container.querySelector<HTMLElement>(
              `[data-arch-node][data-arch-slug="${slug}"]`,
            );
            if (!nodeEl) return;
            const strokes = nodeEl.querySelectorAll<SVGGeometryElement>(
              '.glyph-stroke, .glyph-shadow',
            );
            const details = nodeEl.querySelectorAll<HTMLElement>('.glyph-detail');
            const texts = nodeEl.querySelectorAll<HTMLElement>('.arch-node-text');

            // Segmento di meandro che porta a questo nodo (per i > 0)
            if (i > 0) {
              const segment = container.querySelector<SVGPathElement>(
                `.arch-meander-segment[data-segment="${i - 1}"]`,
              );
              if (segment) {
                tl.to(
                  segment,
                  { strokeDashoffset: 0, duration: 0.32, ease: 'power1.inOut' },
                  '>-0.05',
                );
              }
            }

            // Self-draw del glifo
            if (strokes.length) {
              tl.to(
                strokes,
                {
                  strokeDashoffset: 0,
                  duration: 0.45,
                  stagger: 0.02,
                  ease: 'power2.out',
                },
                '>-0.1',
              );
            }

            // Dettagli (boss/perle/akrotério) emergono
            if (details.length) {
              tl.to(
                details,
                { opacity: 1, duration: 0.25, ease: 'power2.out' },
                '>-0.15',
              );
            }

            // Testo del nodo emerge
            if (texts.length) {
              tl.to(
                texts,
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.35,
                  stagger: 0.05,
                  ease: 'power2.out',
                },
                '>-0.20',
              );
            }
          });

          // ── Settle finale: tutti i glifi pulsano una volta in gold-bright
          // (filter brightness su tutti i .glyph-main contemporaneamente).
          const allMain = container.querySelectorAll<HTMLElement>('.glyph-main');
          tl.to(
            allMain,
            {
              filter: 'brightness(1.6) drop-shadow(0 0 6px var(--color-gold-bright))',
              duration: 0.35,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: 1,
            },
            '>+0.05',
          );
        },
      });

      cleanup = () => trigger.kill();
    })();

    return () => {
      cleanup?.();
    };
  }, [reduced]);

  // Path dei 4 segmenti del meandro (Medea→Elettra, Elettra→Aiace,
  // Aiace→Eracle, Eracle→Troiane). Ognuno autonomo per controllo individuale.
  const segments: string[] = [];
  for (let i = 0; i < ORDER.length - 1; i += 1) {
    const a = NODE_POSITIONS[ORDER[i]!];
    const b = NODE_POSITIONS[ORDER[i + 1]!];
    segments.push(buildMeanderSegment(a, b));
  }

  return (
    <section
      ref={containerRef}
      data-arch-constellation
      className="mx-auto max-w-wide px-6 py-20 sm:py-24"
      aria-labelledby={`arch-title-${meanderId}`}
    >
      <header className="mx-auto max-w-text text-center">
        <p className="mb-6 text-xs uppercase tracking-eyebrow text-gold-bright">
          {eyebrow}
        </p>
        <h2
          id={`arch-title-${meanderId}`}
          className="font-display text-3xl leading-tight text-bone sm:text-4xl"
        >
          {title}
        </h2>
      </header>

      {/* DESKTOP — Costellazione con cascade */}
      <div className="relative mt-16 hidden md:block">
        <svg
          viewBox="0 0 1200 420"
          xmlns="http://www.w3.org/2000/svg"
          className="arch-meander absolute inset-0 h-full w-full"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="1"
            strokeLinecap="square"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
            opacity="0.7"
          >
            {segments.map((d, i) => (
              <path
                key={`segment-${i}`}
                d={d}
                className="arch-meander-segment"
                data-segment={i}
              />
            ))}
          </g>
        </svg>

        <ul
          className="relative w-full"
          style={{
            aspectRatio: '1200 / 420',
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {ORDER.map((slug) => {
            const a = byslug.get(slug);
            if (!a) return null;
            const pos = NODE_POSITIONS[slug];
            const xPct = (pos.x / 1200) * 100;
            const yPct = (pos.y / 420) * 100;
            return (
              <li
                key={slug}
                style={{
                  position: 'absolute',
                  left: `${xPct}%`,
                  top: `${yPct}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '18%',
                }}
              >
                <ArchetypeCard
                  data={a}
                  focused={focused === slug}
                  dimmed={focused !== null && focused !== slug}
                  onFocus={() => setFocused(slug)}
                  onBlur={() => setFocused(null)}
                />
              </li>
            );
          })}
        </ul>
      </div>

      {/* MOBILE — Stack verticale */}
      <ul className="mt-12 flex flex-col items-stretch gap-px overflow-hidden border border-[var(--line-soft)] bg-[var(--line-soft)] md:hidden">
        {ORDER.map((slug) => {
          const a = byslug.get(slug);
          if (!a) return null;
          return (
            <li key={slug} className="bg-ink-2">
              <ArchetypeCard
                data={a}
                focused={false}
                dimmed={false}
                onFocus={() => undefined}
                onBlur={() => undefined}
                mobile
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface CardProps {
  data: ArchetypeNode;
  focused: boolean;
  dimmed: boolean;
  onFocus: () => void;
  onBlur: () => void;
  mobile?: boolean;
}

function ArchetypeCard({
  data,
  focused,
  dimmed,
  onFocus,
  onBlur,
  mobile = false,
}: CardProps): ReactElement {
  const Glyph = MYTH_GLYPHS[data.slug];
  const hasEpisode = !!data.episodeSlug;
  const href = hasEpisode ? `/episodi/${data.episodeSlug}` : undefined;
  const ariaLabel = `${data.nome} · ${data.chiave}${hasEpisode ? ` · vai all'episodio` : ' · in arrivo'}`;

  const commonClass = [
    'group/node arch-node-card relative flex h-full w-full flex-col p-4 transition-all duration-medium ease-out-quart',
    mobile ? 'p-6 text-left' : 'min-h-[220px] text-center',
    dimmed ? 'opacity-50' : 'opacity-100',
    focused ? 'is-focused scale-[1.03]' : 'scale-100',
    hasEpisode ? 'cursor-pointer' : 'cursor-default',
  ].join(' ');

  const inner = (
    <>
      {/* Hover glow oro morbido dietro il glifo (solo desktop, focused) */}
      {!mobile && (
        <div
          aria-hidden="true"
          className="arch-glow pointer-events-none absolute left-1/2 top-6 -z-10 h-20 w-20 -translate-x-1/2 rounded-full opacity-0 transition-opacity duration-medium"
          style={{
            background:
              'radial-gradient(circle, var(--color-gold-deep) 0%, transparent 65%)',
            filter: 'blur(14px)',
          }}
        />
      )}

      <div
        className={`arch-node-glyph ${mobile ? 'mb-3 inline-flex' : 'mb-4 flex h-14 items-center justify-center'}`}
        style={{
          color: focused ? 'var(--color-gold-bright)' : 'var(--color-gold)',
          transition: 'color 280ms var(--ease-out-quart, ease-out)',
        }}
      >
        <Glyph size={mobile ? 40 : 56} ariaLabel={`Glifo: ${data.nome}`} />
      </div>

      <p
        className={`arch-node-text text-xs uppercase tracking-eyebrow text-gold-bright ${mobile ? '' : 'flex min-h-[2.5em] items-end justify-center'}`}
      >
        {data.chiave}
      </p>
      <h3
        className={`arch-node-text mt-2 font-display leading-tight text-bone ${mobile ? 'text-2xl' : 'text-xl flex min-h-[2.8em] items-center justify-center'}`}
      >
        {data.nome}
      </h3>
      <p className="arch-node-text mt-1 font-display text-xs italic text-bone-faint">
        {data.fonte}
      </p>
      <p
        className={`arch-node-text mt-3 leading-loose text-bone-dim ${mobile ? 'text-sm' : 'text-xs min-h-[4.5em]'}`}
      >
        {data.nota}
      </p>

      {hasEpisode ? (
        <p
          className={`arch-node-text mt-auto pt-4 text-xs uppercase tracking-eyebrow ${focused ? 'text-bone' : 'text-gold-bright'} transition-colors`}
        >
          {mobile ? "Vai all'episodio →" : "L'episodio →"}
        </p>
      ) : (
        <p className="arch-node-text mt-auto pt-4 text-xs uppercase tracking-eyebrow text-bone-faint">
          In arrivo
        </p>
      )}
    </>
  );

  const dataAttrs = {
    'data-arch-node': true,
    'data-arch-slug': data.slug,
    'aria-label': ariaLabel,
  } as const;

  if (href) {
    return (
      <a
        {...dataAttrs}
        href={href}
        className={`${commonClass} hover:bg-ink-3`}
        onMouseEnter={onFocus}
        onMouseLeave={onBlur}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {inner}
      </a>
    );
  }
  return (
    <div
      {...dataAttrs}
      role="group"
      tabIndex={0}
      className={commonClass}
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {inner}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Path di UN segmento del meandro (un Greek-key fra due nodi).
 * 9 line segments (puramente orizzontali/verticali) — il pattern signature.
 * ───────────────────────────────────────────────────────────────────────── */
function buildMeanderSegment(p0: { x: number; y: number }, p1: { x: number; y: number }): string {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const midX = p0.x + dx / 2;
  const midY = p0.y + dy / 2;
  const stepW = Math.abs(dx) * 0.18;
  const stepH = 14;
  const upOrDown = p1.y < p0.y ? -1 : 1;
  const segs: string[] = [];
  segs.push(`M ${p0.x} ${p0.y}`);
  segs.push(`L ${p0.x + stepW} ${p0.y}`);
  segs.push(`L ${p0.x + stepW} ${p0.y + upOrDown * stepH}`);
  segs.push(`L ${midX - stepW} ${p0.y + upOrDown * stepH}`);
  segs.push(`L ${midX - stepW} ${midY}`);
  segs.push(`L ${midX + stepW} ${midY}`);
  segs.push(`L ${midX + stepW} ${p1.y - upOrDown * stepH}`);
  segs.push(`L ${p1.x - stepW} ${p1.y - upOrDown * stepH}`);
  segs.push(`L ${p1.x - stepW} ${p1.y}`);
  segs.push(`L ${p1.x} ${p1.y}`);
  return segs.join(' ');
}
