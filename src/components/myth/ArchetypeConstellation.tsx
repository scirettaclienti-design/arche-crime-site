import { useEffect, useRef, useState, type ReactElement } from 'react';
import { MYTH_GLYPHS, type MythSlug } from './glyphs';

/**
 * ArchetypeConstellation — il "gioiello" archè.
 *
 * Trasforma la matrice statica dei 5 archetipi in una composizione
 * interattiva. Desktop: 5 nodi su un asse a S (∾), il meandro greco li
 * connette come un filo dal mito alla mente. Mobile: stack verticale
 * leggibile, il meandro diventa una colonna sottile che scende fra i nodi.
 *
 * Contratti non negoziabili:
 *  1. Leggibilità SOPRA tutto. Il contenuto è sempre raggiungibile senza
 *     hover (mobile, tastiera, lettori di schermo).
 *  2. Reduced-motion: niente stagger, niente tracciamento, niente
 *     transform. Si vede la matrice completa, ferma, e regge da sola.
 *  3. SSR-friendly: il primo render server-side mostra TUTTO al posto
 *     giusto. L'interattività è progressive enhancement.
 *  4. Linking smart: se per quell'archetipo esiste un episodio pubblicato,
 *     il nodo è un <a> verso /episodi/{episodeSlug}. Altrimenti è un nodo
 *     informativo con badge "in arrivo" elegante.
 */

export interface ArchetypeNode {
  /** Slug del mito (chiave nella mappa dei glifi). */
  slug: MythSlug;
  /** Nome del mito, es. "Medea". */
  nome: string;
  /** Fonte classica, es. "Euripide". */
  fonte: string;
  /** Chiave criminologica, es. "Il figlicidio". */
  chiave: string;
  /** Una riga di lettura. */
  nota: string;
  /** Slug dell'episodio pubblicato per questo mito, se esiste. */
  episodeSlug?: string;
}

interface Props {
  archetypes: ArchetypeNode[];
  /** Override del titolo della sezione. */
  title?: string;
  /** Override dell'eyebrow. */
  eyebrow?: string;
}

// ── Coordinate desktop. ViewBox 1200×420.
// Pattern a "S" — Medea bassa, Elettra alta, Aiace al centro, Eracle alta,
// Troiane bassa. Crea un'onda visiva mito→mente.
const NODE_POSITIONS: Record<MythSlug, { x: number; y: number }> = {
  medea: { x: 130, y: 260 },
  elettra: { x: 370, y: 130 },
  aiace: { x: 600, y: 280 },
  eracle: { x: 830, y: 130 },
  troiane: { x: 1070, y: 260 },
};

// L'ordine canonico (sinistra→destra in desktop, alto→basso in mobile).
const ORDER: MythSlug[] = ['medea', 'elettra', 'aiace', 'eracle', 'troiane'];

export default function ArchetypeConstellation({
  archetypes,
  title = 'La matrice dei cinque archetipi',
  eyebrow = 'archè · la matrice',
}: Props): ReactElement {
  const [focused, setFocused] = useState<MythSlug | null>(null);
  const [reduced, setReduced] = useState(false);
  const meanderPathRef = useRef<SVGPathElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // ID stabile: lo stesso server e client, evita mismatch hydration con useId
  // che in alcune combinazioni di @astrojs/react genera "Invalid hook call".
  const meanderId = 'arch-constellation';

  // Indicizza gli archetipi per slug per accesso rapido.
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

      // Stato iniziale (pre-hide degli elementi)
      const nodes = container.querySelectorAll<HTMLElement>('[data-arch-node]');
      const meanderSvg = container.querySelector<SVGSVGElement>('svg.arch-meander');

      gsap.set(nodes, { opacity: 0, y: 16 });
      if (meanderSvg) {
        gsap.set(meanderSvg, {
          clipPath: 'inset(0 100% 0 0)',
          webkitClipPath: 'inset(0 100% 0 0)',
        });
      }

      // Timeline: meandro inizia, nodi entrano in stagger sopra.
      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          if (meanderSvg) {
            gsap.to(meanderSvg, {
              clipPath: 'inset(0 0 0 0)',
              webkitClipPath: 'inset(0 0 0 0)',
              duration: 1.6,
              ease: 'power2.inOut',
            });
          }
          gsap.to(nodes, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.15,
            delay: 0.3,
            ease: 'power3.out',
          });
        },
      });

      cleanup = () => trigger.kill();
    })();

    return () => {
      cleanup?.();
    };
  }, [reduced]);

  // Path del meandro: connette i 5 nodi con pattern Greek key fra ognuno.
  // Per semplicità il path è composto da archi gentili (curve di Bezier)
  // che passano per i 5 punti, decorati con piccoli "scalini" Greek-key fra ogni
  // coppia per restare nel linguaggio del meandro signature del sito.
  const meanderPath = buildConstellationMeander(ORDER.map((s) => NODE_POSITIONS[s]));

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

      {/* DESKTOP — Costellazione a S (≥ md, 768px+) */}
      <div className="relative mt-16 hidden md:block">
        <svg
          viewBox="0 0 1200 420"
          xmlns="http://www.w3.org/2000/svg"
          className="arch-meander absolute inset-0 h-full w-full"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            ref={meanderPathRef}
            d={meanderPath}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="1"
            strokeLinecap="square"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
            opacity="0.65"
          />
        </svg>

        <ul
          className="relative w-full"
          style={{
            // Aspect ratio del SVG di sfondo: 1200×420 = 2.857
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

      {/* MOBILE — Stack verticale (< md, 768px-) */}
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

/* ─────────────────────────────────────────────────────────────────────────
 * ArchetypeCard — il singolo nodo (riusato su desktop ed mobile).
 * Se episodeSlug è presente, è un <a> reale che porta a /episodi/{slug}.
 * Altrimenti è un <div> informativo col badge "in arrivo".
 * ───────────────────────────────────────────────────────────────────────── */
interface CardProps {
  data: ArchetypeNode;
  focused: boolean;
  dimmed: boolean;
  onFocus: () => void;
  onBlur: () => void;
  mobile?: boolean;
}

function ArchetypeCard({ data, focused, dimmed, onFocus, onBlur, mobile = false }: CardProps): ReactElement {
  const Glyph = MYTH_GLYPHS[data.slug];
  const hasEpisode = !!data.episodeSlug;
  const href = hasEpisode ? `/episodi/${data.episodeSlug}` : undefined;
  const ariaLabel = `${data.nome} · ${data.chiave}${hasEpisode ? ` · vai all'episodio` : ' · in arrivo'}`;

  const commonClass = [
    'group/node block w-full p-4 transition-all duration-medium ease-out-quart',
    mobile ? 'p-6 text-left' : 'text-center',
    dimmed ? 'opacity-50' : 'opacity-100',
    focused ? 'scale-[1.03]' : 'scale-100',
    hasEpisode ? 'cursor-pointer' : 'cursor-default',
  ].join(' ');

  const inner = (
    <>
      <div
        className={`mx-auto ${mobile ? 'mb-3 inline-flex' : 'mb-4 flex justify-center'}`}
        style={{ color: focused ? 'var(--color-gold-bright)' : 'var(--color-gold)' }}
      >
        <Glyph size={mobile ? 40 : 56} ariaLabel={`Glifo: ${data.nome}`} />
      </div>
      <p className="text-xs uppercase tracking-eyebrow text-gold-bright">
        {data.chiave}
      </p>
      <h3
        className={`mt-2 font-display leading-tight text-bone ${mobile ? 'text-2xl' : 'text-xl'}`}
      >
        {data.nome}
      </h3>
      <p className="mt-1 font-display text-xs italic text-bone-faint">
        {data.fonte}
      </p>
      <p
        className={`mt-3 leading-loose text-bone-dim ${mobile ? 'text-sm' : 'text-xs'}`}
      >
        {data.nota}
      </p>
      {hasEpisode ? (
        <p
          className={`mt-4 text-xs uppercase tracking-eyebrow ${focused ? 'text-bone' : 'text-gold-bright'} transition-colors`}
        >
          {mobile ? 'Vai all\'episodio →' : 'L\'episodio →'}
        </p>
      ) : (
        <p className="mt-4 text-xs uppercase tracking-eyebrow text-bone-faint">
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
 * Costruisce il path SVG del meandro che lega i 5 nodi. Tra ogni coppia
 * di nodi disegna un piccolo "Greek key" decorativo, simbolicamente coerente
 * col meandro signature del sito.
 *
 * I 5 punti sono passati in ordine canonico. Il path:
 *   - Parte dal centro del primo nodo
 *   - Tra ogni coppia consecutiva, disegna una sequenza che esce, va su (o giù
 *     a seconda dell'asse y), torna giù, e arriva al nodo successivo
 *   - I segmenti sono solo orizzontali e verticali (perfetti per il linguaggio
 *     della greca greca)
 * ───────────────────────────────────────────────────────────────────────── */
function buildConstellationMeander(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  const segs: string[] = [`M ${points[0]!.x} ${points[0]!.y}`];
  for (let i = 1; i < points.length; i += 1) {
    const p0 = points[i - 1]!;
    const p1 = points[i]!;
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const midX = p0.x + dx / 2;
    const midY = p0.y + dy / 2;
    const stepW = Math.abs(dx) * 0.18;
    const stepH = 14;
    const upOrDown = p1.y < p0.y ? -1 : 1;
    // Pattern: orizzontale → su(o giù) → orizzontale → giù(o su) → orizzontale → nodo
    segs.push(`L ${p0.x + stepW} ${p0.y}`);
    segs.push(`L ${p0.x + stepW} ${p0.y + upOrDown * stepH}`);
    segs.push(`L ${midX - stepW} ${p0.y + upOrDown * stepH}`);
    segs.push(`L ${midX - stepW} ${midY}`);
    segs.push(`L ${midX + stepW} ${midY}`);
    segs.push(`L ${midX + stepW} ${p1.y - upOrDown * stepH}`);
    segs.push(`L ${p1.x - stepW} ${p1.y - upOrDown * stepH}`);
    segs.push(`L ${p1.x - stepW} ${p1.y}`);
    segs.push(`L ${p1.x} ${p1.y}`);
  }
  return segs.join(' ');
}
