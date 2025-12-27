// Design Token Types

export type ColorToken =
  | 'canvas-default'
  | 'canvas-subtle'
  | 'canvas-inset'
  | 'fg-default'
  | 'fg-muted'
  | 'fg-subtle'
  | 'fg-on-emphasis'
  | 'border-default'
  | 'border-muted'
  | 'border-subtle'
  | 'accent-fg'
  | 'accent-emphasis'
  | 'accent-muted'
  | 'accent-subtle'
  | 'success-fg'
  | 'success-emphasis'
  | 'success-subtle'
  | 'warning-fg'
  | 'warning-emphasis'
  | 'warning-subtle'
  | 'danger-fg'
  | 'danger-emphasis'
  | 'danger-subtle';

export type ACMGClassification =
  | 'pathogenic'
  | 'likely-pathogenic'
  | 'vus'
  | 'likely-benign'
  | 'benign';

export type AMPTier = 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4';

export type VariantType = 'snv' | 'indel' | 'cnv-gain' | 'cnv-loss' | 'fusion';

export type SpacingToken = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type BorderRadiusToken = 'small' | 'medium' | 'large' | 'full';

export type ShadowToken = 'small' | 'medium' | 'large' | 'extra-large';

export type DurationToken = 'fast' | 'normal' | 'slow';
