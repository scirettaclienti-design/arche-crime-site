import type { Config } from 'tailwindcss';

/**
 * Mirror del preset esportato dal design system.
 * Source of truth: @scirettaclienti-design/arche-design-system/src/tailwind/preset.ts
 *
 * Perché mirrorato e non importato?
 * Il package esporta `./tailwind` solo con la condizione `import` (ESM).
 * PostCSS / tailwindcss caricano il config in contesto CJS via jiti, dove
 * `require('.../tailwind')` non risolve. Riallineare a un import diretto
 * quando il design system pubblicherà una condizione `require`/`default`.
 *
 * Importante: i valori dei tokens (--color-*, --font-*, --fs-*, ...)
 * non sono qui — vivono nei file CSS del design system e arrivano via
 * `@import "@scirettaclienti-design/arche-design-system/tokens"` in
 * src/styles/global.css. Qui ci sono solo le mappature classe → CSS var.
 */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'var(--color-ink)',
          2: 'var(--color-ink-2)',
          3: 'var(--color-ink-3)',
        },
        oxblood: 'var(--color-oxblood)',
        bone: {
          DEFAULT: 'var(--color-bone)',
          dim: 'var(--color-bone-dim)',
          faint: 'var(--color-bone-faint)',
        },
        gold: {
          DEFAULT: 'var(--color-gold)',
          bright: 'var(--color-gold-bright)',
          deep: 'var(--color-gold-deep)',
        },
        // Accento secondario "patina" — verdi di bronzo ossidato (la pelle
        // dei reperti). Freddo, archè-friendly. Usato per hover di link,
        // knot decorativi alternativi, separatori sottili. Vedi global.css.
        patina: {
          DEFAULT: 'var(--color-patina)',
          bright: 'var(--color-patina-bright)',
          deep: 'var(--color-patina-deep)',
        },
        // Accento secondario "brace" — solo per momenti viscerali della
        // pagina-episodio. Non usare altrove, vedi nota in global.css.
        ember: {
          DEFAULT: 'var(--color-ember)',
          glow: 'var(--color-ember-glow)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        serif: ['var(--font-serif)'],
        secret: ['var(--font-secret)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        xs: 'var(--fs-xs)',
        sm: 'var(--fs-sm)',
        base: 'var(--fs-base)',
        lg: 'var(--fs-lg)',
        xl: 'var(--fs-xl)',
        '2xl': 'var(--fs-2xl)',
        '3xl': 'var(--fs-3xl)',
        '4xl': 'var(--fs-4xl)',
      },
      lineHeight: {
        tight: 'var(--leading-tight)',
        snug: 'var(--leading-snug)',
        normal: 'var(--leading-normal)',
        loose: 'var(--leading-loose)',
      },
      letterSpacing: {
        tight: 'var(--tracking-tight)',
        base: 'var(--tracking-base)',
        eyebrow: 'var(--tracking-eyebrow)',
      },
      maxWidth: {
        text: 'var(--col-text)',
        wide: 'var(--col-wide)',
        narrow: 'var(--col-narrow)',
      },
      transitionTimingFunction: {
        greek: 'var(--ease-greek)',
        'out-quart': 'var(--ease-out-quart)',
      },
      transitionDuration: {
        quick: 'var(--dur-quick)',
        medium: 'var(--dur-medium)',
        slow: 'var(--dur-slow)',
        curtain: 'var(--dur-curtain)',
      },
    },
  },
  plugins: [],
} satisfies Config;
