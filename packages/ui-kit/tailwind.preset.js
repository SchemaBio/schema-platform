/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Canvas colors (backgrounds)
        canvas: {
          DEFAULT: 'var(--color-canvas-default)',
          subtle: 'var(--color-canvas-subtle)',
          inset: 'var(--color-canvas-inset)',
        },
        // Foreground colors (text)
        fg: {
          DEFAULT: 'var(--color-fg-default)',
          muted: 'var(--color-fg-muted)',
          subtle: 'var(--color-fg-subtle)',
          'on-emphasis': 'var(--color-fg-on-emphasis)',
        },
        // Border colors
        border: {
          DEFAULT: 'var(--color-border-default)',
          muted: 'var(--color-border-muted)',
          subtle: 'var(--color-border-subtle)',
        },
        // Accent colors
        accent: {
          fg: 'var(--color-accent-fg)',
          emphasis: 'var(--color-accent-emphasis)',
          muted: 'var(--color-accent-muted)',
          subtle: 'var(--color-accent-subtle)',
        },
        // Success colors
        success: {
          fg: 'var(--color-success-fg)',
          emphasis: 'var(--color-success-emphasis)',
          subtle: 'var(--color-success-subtle)',
        },
        // Warning colors
        warning: {
          fg: 'var(--color-warning-fg)',
          emphasis: 'var(--color-warning-emphasis)',
          subtle: 'var(--color-warning-subtle)',
        },
        // Danger colors
        danger: {
          fg: 'var(--color-danger-fg)',
          emphasis: 'var(--color-danger-emphasis)',
          subtle: 'var(--color-danger-subtle)',
        },
        // ACMG Classification colors
        acmg: {
          pathogenic: 'var(--color-acmg-pathogenic)',
          'pathogenic-subtle': 'var(--color-acmg-pathogenic-subtle)',
          'likely-pathogenic': 'var(--color-acmg-likely-pathogenic)',
          'likely-pathogenic-subtle': 'var(--color-acmg-likely-pathogenic-subtle)',
          vus: 'var(--color-acmg-vus)',
          'vus-subtle': 'var(--color-acmg-vus-subtle)',
          'likely-benign': 'var(--color-acmg-likely-benign)',
          'likely-benign-subtle': 'var(--color-acmg-likely-benign-subtle)',
          benign: 'var(--color-acmg-benign)',
          'benign-subtle': 'var(--color-acmg-benign-subtle)',
        },
        // AMP Tier colors
        amp: {
          'tier-1': 'var(--color-amp-tier-1)',
          'tier-1-subtle': 'var(--color-amp-tier-1-subtle)',
          'tier-2': 'var(--color-amp-tier-2)',
          'tier-2-subtle': 'var(--color-amp-tier-2-subtle)',
          'tier-3': 'var(--color-amp-tier-3)',
          'tier-3-subtle': 'var(--color-amp-tier-3-subtle)',
          'tier-4': 'var(--color-amp-tier-4)',
          'tier-4-subtle': 'var(--color-amp-tier-4-subtle)',
        },
        // Variant type colors
        variant: {
          snv: 'var(--color-variant-snv)',
          'snv-subtle': 'var(--color-variant-snv-subtle)',
          indel: 'var(--color-variant-indel)',
          'indel-subtle': 'var(--color-variant-indel-subtle)',
          'cnv-gain': 'var(--color-variant-cnv-gain)',
          'cnv-gain-subtle': 'var(--color-variant-cnv-gain-subtle)',
          'cnv-loss': 'var(--color-variant-cnv-loss)',
          'cnv-loss-subtle': 'var(--color-variant-cnv-loss-subtle)',
          fusion: 'var(--color-variant-fusion)',
          'fusion-subtle': 'var(--color-variant-fusion-subtle)',
        },
      },
      // Spacing based on 4px grid
      spacing: {
        0: 'var(--space-0)',
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        7: 'var(--space-7)',
        8: 'var(--space-8)',
        9: 'var(--space-9)',
        10: 'var(--space-10)',
        11: 'var(--space-11)',
        12: 'var(--space-12)',
      },
      // Border radius
      borderRadius: {
        small: 'var(--radius-small)',
        medium: 'var(--radius-medium)',
        large: 'var(--radius-large)',
        full: 'var(--radius-full)',
      },
      // Box shadows
      boxShadow: {
        small: 'var(--shadow-small)',
        medium: 'var(--shadow-medium)',
        large: 'var(--shadow-large)',
        'extra-large': 'var(--shadow-extra-large)',
      },
      // Font families
      fontFamily: {
        sans: 'var(--font-family-sans)',
        mono: 'var(--font-family-mono)',
      },
      // Font sizes
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
      },
      // Animation durations
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
      // Animation easing
      transitionTimingFunction: {
        DEFAULT: 'var(--easing-default)',
        in: 'var(--easing-in)',
        out: 'var(--easing-out)',
        'in-out': 'var(--easing-in-out)',
      },
    },
  },
};
