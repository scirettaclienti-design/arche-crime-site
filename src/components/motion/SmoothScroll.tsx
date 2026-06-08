import { useEffect } from 'react';

/**
 * SmoothScroll — il cuore del movimento archè.
 *
 * Istanzia Lenis (smooth-scroll cinematico) + GSAP/ScrollTrigger e applica
 * le animazioni guidate da data-attributes:
 *   [data-curtain]        sipario clip-path che si apre all'arrivo
 *   [data-reveal]         reveal salendo (variant: 'fade' | 'clip')
 *   [data-meander] path   stroke-dashoffset scrub allo scroll
 *   [data-parallax-y]     parallax verticale misurato (solo decorativo)
 *
 * Pattern preso da gabriella-marano-site/src/scripts/home-motion.ts e
 * adattato al lessico archè. Differenze:
 * - Astro 5 di archè non usa View Transitions API, ma supportiamo
 *   astro:page-load/astro:before-swap in modo difensivo.
 * - Aggiunto support a [data-meander] (la firma di archè) e [data-curtain].
 * - Lenis preset più solenne: lerp 0.085, duration 1.4 (rispetto a 0.08 / 1.3
 *   del sito sibling), perché archè è la metà teatrale.
 *
 * Reduced-motion: il <script is:inline> in MotionHead già NON setta
 * .js-motion-pending. Questo componente, se chiamato, fa solo settle
 * (porta tutti i target al final state senza tween) e ritorna.
 *
 * client:load — perché Lenis hijacka lo scroll e deve attivarsi prima che
 * l'utente provi a scrollare. È l'unica island necessariamente eager.
 */

declare global {
  interface Window {
    __archeMotionSafety?: number;
  }
}

interface MotionState {
  lenis: { destroy: () => void; on: (ev: string, cb: () => void) => void; raf: (t: number) => void } | null;
  triggers: Array<{ kill: () => void }>;
  tickerHandler: ((time: number) => void) | null;
  resizeHandler: (() => void) | null;
  resizeTimer: ReturnType<typeof setTimeout> | null;
}

const FINAL_TRACK = '-0.01em';

type StyleWithWebkit = CSSStyleDeclaration & { webkitClipPath?: string };
function setWebkitClipPath(el: HTMLElement, value: string): void {
  (el.style as StyleWithWebkit).webkitClipPath = value;
}

function isReduced(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clearPendingClass(): void {
  document.documentElement.classList.remove('js-motion-pending');
}

function clearSafety(): void {
  if (window.__archeMotionSafety) {
    clearTimeout(window.__archeMotionSafety);
    window.__archeMotionSafety = undefined;
  }
}

/* Final-state settle: posiziona tutto come se l'animazione fosse finita.
   Usato a reduced-motion e come fallback se l'init fallisce. */
function settleAll(): void {
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.clipPath = 'none';
    setWebkitClipPath(el, 'none');
    el.style.filter = 'none';
    el.style.letterSpacing = '';
  });
  document.querySelectorAll<HTMLElement>('[data-curtain]').forEach((el) => {
    el.style.clipPath = 'none';
    setWebkitClipPath(el, 'none');
  });
  document.querySelectorAll<SVGSVGElement>('[data-meander] svg.meander-sweep').forEach((svg) => {
    svg.style.clipPath = 'none';
    (svg.style as CSSStyleDeclaration & { webkitClipPath?: string }).webkitClipPath = 'none';
  });
  document.querySelectorAll<HTMLElement>('[data-meander] .meander-knot').forEach((el) => {
    el.style.opacity = '1';
  });
  // Gesti per pagina — final state a reduced-motion: tutto al posto giusto.
  document.querySelectorAll<HTMLElement>(
    '[data-incise] p, [data-incise] h2, [data-incise] h3, [data-vitrine] li, [data-vitrine] [data-vitrine-item], [data-stage] li, [data-stage] [data-stage-item], [data-page-turn] li, [data-page-turn] [data-page-turn-item], [data-portrait]',
  ).forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.clipPath = 'none';
    setWebkitClipPath(el, 'none');
    el.style.filter = 'none';
  });
  clearPendingClass();
}

async function initMotion(state: MotionState): Promise<void> {
  clearSafety();

  if (isReduced()) {
    settleAll();
    return;
  }

  // Import dinamico: gsap + lenis sono ~70KB gzip insieme; carichiamoli
  // SOLO se reduced-motion non li esclude. Riduce TTI sulla home.
  const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('lenis'),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  // — Lenis cinematic preset (più lento del sibling: archè è teatrale)
  const lenis = new Lenis({
    lerp: 0.085,
    duration: 1.4,
    smoothWheel: true,
    touchMultiplier: 1.4,
  });
  lenis.on('scroll', ScrollTrigger.update);

  const tickerHandler = (time: number): void => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tickerHandler);
  gsap.ticker.lagSmoothing(0);

  state.lenis = lenis as unknown as MotionState['lenis'];
  state.tickerHandler = tickerHandler;

  // ── CURTAIN: sipario d'apertura. Una volta sola.
  document.querySelectorAll<HTMLElement>('[data-curtain]').forEach((el) => {
    const delay = parseFloat(el.dataset.curtainDelay ?? '0.35');
    const duration = parseFloat(el.dataset.curtainDuration ?? '1.4');
    gsap.set(el, {
      clipPath: 'inset(50% 0 50% 0)',
      webkitClipPath: 'inset(50% 0 50% 0)',
    });
    gsap.to(el, {
      clipPath: 'inset(0% 0 0% 0)',
      webkitClipPath: 'inset(0% 0 0% 0)',
      duration,
      delay,
      ease: 'power3.inOut',
      onComplete: () => {
        el.style.clipPath = 'none';
        setWebkitClipPath(el, 'none');
      },
    });
  });

  // ── REVEAL: blocchi che entrano salendo o emergono dalla maschera.
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const variant = el.dataset.revealVariant ?? 'fade';
    const delay = parseFloat(el.dataset.revealDelay ?? '0');
    const start = el.dataset.revealStart ?? 'top 85%';

    if (variant === 'clip') {
      gsap.set(el, {
        clipPath: 'inset(0 0 100% 0)',
        webkitClipPath: 'inset(0 0 100% 0)',
        filter: 'blur(6px)',
        letterSpacing: '0.03em',
        opacity: 1,
      });
      gsap.to(el, {
        clipPath: 'inset(0 0 0% 0)',
        webkitClipPath: 'inset(0 0 0% 0)',
        filter: 'blur(0px)',
        letterSpacing: FINAL_TRACK,
        duration: 1.1,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
      });
    } else {
      // fade variant (default)
      gsap.set(el, { opacity: 0, y: '1.5rem' });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
      });
    }
  });

  // ── MEANDER: due modalità.
  //   1. 'scroll' (default): clip-path sweep allo scroll della sezione
  //      → il meandro si rivela L→R mentre l'utente scende. Usato per i separatori.
  //   2. 'arrival': sweep UNA volta al page-load come gesto di apertura
  //      ("il filo che conduce al titolo"). Usato nell'hero.
  //
  // Implementazione cambiata da stroke-dashoffset → clip-path inset:
  // il path è sempre disegnato per intero, ma il wrapper SVG ha una
  // maschera che si apre. Su un pattern a 90° come la greca, dashoffset
  // mid-way mostrava frammenti staccati; clip-path invece rivela un
  // "fronte d'onda" continuo. Visivamente leggibile a tutti i fotogrammi.
  document.querySelectorAll<HTMLElement>('[data-meander]').forEach((wrapper) => {
    const svg = wrapper.querySelector<SVGSVGElement>('svg.meander-sweep');
    const knot = wrapper.querySelector<SVGGElement>('.meander-knot');
    if (!svg) return;
    const orientation = wrapper.dataset.orientation ?? 'horizontal';
    const entrance = wrapper.dataset.meanderEntrance ?? 'scroll';

    // Stato chiuso: clip-path tutto chiuso dal lato giusto.
    // horizontal: inset(0 100% 0 0) — chiuso da destra
    // vertical:   inset(100% 0 0 0) — chiuso dall'alto verso il basso
    const closed = orientation === 'vertical'
      ? 'inset(100% 0 0 0)'
      : 'inset(0 100% 0 0)';
    const open = 'inset(0 0 0 0)';

    gsap.set(svg, { clipPath: closed, webkitClipPath: closed });
    if (knot) gsap.set(knot, { opacity: 0, scale: 0.6, transformOrigin: 'center center' });

    if (entrance === 'arrival') {
      const arrivalDelay = parseFloat(wrapper.dataset.arrivalDelay ?? '0.5');
      const arrivalDuration = parseFloat(wrapper.dataset.arrivalDuration ?? '1.2');
      gsap.to(svg, {
        clipPath: open,
        webkitClipPath: open,
        duration: arrivalDuration,
        delay: arrivalDelay,
        ease: 'power2.inOut',
      });
      if (knot) {
        gsap.to(knot, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          delay: arrivalDelay + arrivalDuration * 0.6,
          ease: 'power2.out',
        });
      }
    } else {
      const scrub = parseFloat(wrapper.dataset.scrub ?? '0.6');
      gsap.to(svg, {
        clipPath: open,
        webkitClipPath: open,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 92%',
          end: 'bottom 35%',
          scrub,
        },
      });
      if (knot) {
        gsap.to(knot, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: wrapper,
            start: 'top 70%',
            once: true,
          },
        });
      }
    }
  });

  // ── INCISIONE (/metodo): paragrafi appaiono come scolpiti riga per riga.
  // Clip-path inset L→R + leggero blur che si dissolve. Stagger 0.08s.
  document.querySelectorAll<HTMLElement>('[data-incise]').forEach((group) => {
    const lines = group.querySelectorAll<HTMLElement>('p, h2, h3');
    if (!lines.length) return;
    gsap.set(lines, {
      clipPath: 'inset(0 100% 0 0)',
      webkitClipPath: 'inset(0 100% 0 0)',
      filter: 'blur(3px)',
    });
    gsap.to(lines, {
      clipPath: 'inset(0 0% 0 0)',
      webkitClipPath: 'inset(0 0% 0 0)',
      filter: 'blur(0px)',
      duration: 1.1,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: group, start: 'top 80%', once: true },
    });
  });

  // ── VETRINA (/episodi): le 5 card della MythMatrix si "accendono" in sequenza,
  // come pezzi di museo dietro vetro illuminati uno alla volta.
  document.querySelectorAll<HTMLElement>('[data-vitrine]').forEach((wrapper) => {
    const items = wrapper.querySelectorAll<HTMLElement>('[data-vitrine-item], li');
    if (!items.length) return;
    gsap.set(items, { opacity: 0.18, filter: 'brightness(0.55)' });
    gsap.to(items, {
      opacity: 1,
      filter: 'brightness(1)',
      duration: 0.7,
      stagger: 0.25,
      ease: 'power2.out',
      scrollTrigger: { trigger: wrapper, start: 'top 75%', once: true },
    });
  });

  // ── PALCO (/dal-vivo): i blocchi delle 3 colonne entrano da quinte laterali alternate.
  // Card pari da sinistra, dispari da destra. Lento, teatrale.
  document.querySelectorAll<HTMLElement>('[data-stage]').forEach((wrapper) => {
    const items = wrapper.querySelectorAll<HTMLElement>('li, [data-stage-item]');
    items.forEach((item, i) => {
      const fromLeft = i % 2 === 0;
      gsap.fromTo(
        item,
        { opacity: 0, x: fromLeft ? -48 : 48 },
        {
          opacity: 1,
          x: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        },
      );
    });
  });

  // ── PAGINA (/formazione): le card si "girano" come pagine di libro (rotateY).
  // Origin sinistro, perspective sul parent.
  document.querySelectorAll<HTMLElement>('[data-page-turn]').forEach((wrapper) => {
    wrapper.style.perspective = '1400px';
    const items = wrapper.querySelectorAll<HTMLElement>('li, [data-page-turn-item]');
    gsap.set(items, {
      opacity: 0,
      rotateY: -22,
      transformOrigin: 'left center',
    });
    gsap.to(items, {
      opacity: 1,
      rotateY: 0,
      duration: 1.2,
      stagger: 0.22,
      ease: 'power3.out',
      scrollTrigger: { trigger: wrapper, start: 'top 80%', once: true },
    });
  });

  // ── RITRATTO (/chi-e): gesto minimale, fade lentissimo. Per rispetto della
  // persona, niente entrate plateali su una pagina che racconta chi è qualcuno.
  document.querySelectorAll<HTMLElement>('[data-portrait]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.8,
        ease: 'power1.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    );
  });

  // ── VARIABLE BODONI AXIS: i titoli display con [data-vary] passano da
  // wght:400 a wght:700 mentre attraversano il viewport. Sembra che il
  // titolo "metta a fuoco" leggendolo. Pattern preso dal sito sibling.
  document.querySelectorAll<HTMLElement>('[data-vary]').forEach((el) => {
    gsap.fromTo(
      el,
      { fontVariationSettings: '"wght" 400' },
      {
        fontVariationSettings: '"wght" 700',
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          end: 'top 25%',
          scrub: 0.6,
        },
      },
    );
  });

  // ── PARALLAX-Y: solo decorativo (hero-glow, accenti oro). Mai sul testo.
  // Mobile: parallax dimezzato per non sembrare scattoso.
  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  document.querySelectorAll<HTMLElement>('[data-parallax-y]').forEach((el) => {
    const baseAmount = parseFloat(el.dataset.parallaxY ?? '60');
    const amount = isMobile ? baseAmount * 0.4 : baseAmount;
    gsap.to(el, {
      yPercent: -amount,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement ?? el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
  });

  // ── Raccogli i trigger per il cleanup
  state.triggers = ScrollTrigger.getAll() as unknown as MotionState['triggers'];

  // ── Resize: ScrollTrigger.refresh debounced
  const resizeHandler = (): void => {
    if (state.resizeTimer) clearTimeout(state.resizeTimer);
    state.resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  };
  window.addEventListener('resize', resizeHandler);
  state.resizeHandler = resizeHandler;

  // ── Tutto a regime: spegni il pre-hide. Le animazioni che non hanno
  // ancora scrolltriggerato resteranno nello stato che gsap.set ha già fissato.
  clearPendingClass();
}

function cleanup(state: MotionState): void {
  state.triggers.forEach((t) => t.kill());
  state.triggers = [];
  if (state.tickerHandler) {
    void import('gsap').then(({ default: gsap }) => {
      gsap.ticker.remove(state.tickerHandler!);
    });
    state.tickerHandler = null;
  }
  if (state.resizeHandler) {
    window.removeEventListener('resize', state.resizeHandler);
    state.resizeHandler = null;
  }
  if (state.resizeTimer) {
    clearTimeout(state.resizeTimer);
    state.resizeTimer = null;
  }
  if (state.lenis) {
    state.lenis.destroy();
    state.lenis = null;
  }
}

export default function SmoothScroll(): null {
  useEffect(() => {
    const state: MotionState = {
      lenis: null,
      triggers: [],
      tickerHandler: null,
      resizeHandler: null,
      resizeTimer: null,
    };

    // Defer init al frame successivo: il DOM è pronto, ma diamo a Astro
    // il tempo di idratare eventuali altre islands sullo stesso paint.
    const raf = requestAnimationFrame(() => {
      void initMotion(state).catch(() => {
        // se il dynamic import fallisce, rivela tutto e log silenzioso
        settleAll();
      });
    });

    // Astro 5 (output:'server') può navigare via View Transitions in futuro.
    // Già oggi rilanciamo motion su page-load se l'evento c'è.
    const onPageLoad = (): void => {
      cleanup(state);
      requestAnimationFrame(() => void initMotion(state));
    };
    const onBeforeSwap = (): void => cleanup(state);
    document.addEventListener('astro:page-load', onPageLoad);
    document.addEventListener('astro:before-swap', onBeforeSwap);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('astro:page-load', onPageLoad);
      document.removeEventListener('astro:before-swap', onBeforeSwap);
      cleanup(state);
    };
  }, []);

  return null;
}
