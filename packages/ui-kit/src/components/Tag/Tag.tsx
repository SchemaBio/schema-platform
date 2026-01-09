import * as React from 'react';
import { cn } from '../../utils/cn';

/** ACMG classification variants */
export type ACMGVariant =
  | 'pathogenic'
  | 'likely-pathogenic'
  | 'vus'
  | 'likely-benign'
  | 'benign';

/** AMP Tier variants */
export type AMPTierVariant = 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4';

/** Status variants */
export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** All tag variants */
export type TagVariant = ACMGVariant | AMPTierVariant | StatusVariant;

export interface TagProps {
  /** Tag visual variant */
  variant: TagVariant;
  /** Tag content */
  children: React.ReactNode;
  /** Optional icon to display before content */
  icon?: React.ReactNode;
  /** Whether the tag can be closed/removed */
  closable?: boolean;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Native HTML title attribute for tooltip */
  title?: string;
}

/** Close icon component */
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="12"
    height="12"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
  </svg>
);

/** ACMG variant styles */
const acmgStyles: Record<ACMGVariant, string> = {
  pathogenic: 'bg-[var(--color-acmg-pathogenic-subtle)] text-[var(--color-acmg-pathogenic)] border-[var(--color-acmg-pathogenic)]',
  'likely-pathogenic': 'bg-[var(--color-acmg-likely-pathogenic-subtle)] text-[var(--color-acmg-likely-pathogenic)] border-[var(--color-acmg-likely-pathogenic)]',
  vus: 'bg-[var(--color-acmg-vus-subtle)] text-[var(--color-acmg-vus)] border-[var(--color-acmg-vus)]',
  'likely-benign': 'bg-[var(--color-acmg-likely-benign-subtle)] text-[var(--color-acmg-likely-benign)] border-[var(--color-acmg-likely-benign)]',
  benign: 'bg-[var(--color-acmg-benign-subtle)] text-[var(--color-acmg-benign)] border-[var(--color-acmg-benign)]',
};

/** AMP Tier variant styles */
const ampTierStyles: Record<AMPTierVariant, string> = {
  'tier-1': 'bg-[var(--color-amp-tier-1-subtle)] text-[var(--color-amp-tier-1)] border-[var(--color-amp-tier-1)]',
  'tier-2': 'bg-[var(--color-amp-tier-2-subtle)] text-[var(--color-amp-tier-2)] border-[var(--color-amp-tier-2)]',
  'tier-3': 'bg-[var(--color-amp-tier-3-subtle)] text-[var(--color-amp-tier-3)] border-[var(--color-amp-tier-3)]',
  'tier-4': 'bg-[var(--color-amp-tier-4-subtle)] text-[var(--color-amp-tier-4)] border-[var(--color-amp-tier-4)]',
};

/** Status variant styles */
const statusStyles: Record<StatusVariant, string> = {
  success: 'bg-success-subtle text-success-fg border-success-fg',
  warning: 'bg-warning-subtle text-warning-fg border-warning-fg',
  danger: 'bg-danger-subtle text-danger-fg border-danger-fg',
  info: 'bg-accent-subtle text-accent-fg border-accent-fg',
  neutral: 'bg-canvas-subtle text-fg-muted border-border-default',
};

/** Check if variant is ACMG */
const isACMGVariant = (variant: TagVariant): variant is ACMGVariant =>
  ['pathogenic', 'likely-pathogenic', 'vus', 'likely-benign', 'benign'].includes(variant);

/** Check if variant is AMP Tier */
const isAMPTierVariant = (variant: TagVariant): variant is AMPTierVariant =>
  ['tier-1', 'tier-2', 'tier-3', 'tier-4'].includes(variant);

/** Get variant styles */
const getVariantStyles = (variant: TagVariant): string => {
  if (isACMGVariant(variant)) {
    return acmgStyles[variant];
  }
  if (isAMPTierVariant(variant)) {
    return ampTierStyles[variant];
  }
  return statusStyles[variant];
};

/**
 * Tag component for displaying classifications, statuses, and labels.
 * Supports ACMG classifications, AMP Tiers, and general status variants.
 *
 * @example
 * <Tag variant="pathogenic">Pathogenic</Tag>
 * <Tag variant="tier-1">Tier I</Tag>
 * <Tag variant="success" icon={<CheckIcon />}>Approved</Tag>
 * <Tag variant="info" closable onClose={() => {}}>Removable</Tag>
 */
export const Tag: React.FC<TagProps> = ({
  variant,
  children,
  icon,
  closable = false,
  onClose,
  className,
  title,
}) => {
  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClose?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onClose?.();
    }
  };

  return (
    <span
      className={cn(
        // Base styles - 20px height with 8px horizontal padding
        'inline-flex items-center gap-1',
        'h-5 px-2',
        'text-xs font-medium',
        'rounded-small',
        'border',
        // Variant styles
        getVariantStyles(variant),
        className
      )}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span className="truncate">{children}</span>
      {closable && (
        <button
          type="button"
          onClick={handleClose}
          onKeyDown={handleKeyDown}
          className={cn(
            'shrink-0 flex items-center justify-center',
            'ml-0.5 -mr-0.5',
            'rounded-sm',
            'hover:bg-black/10 dark:hover:bg-white/10',
            'focus:outline-none focus-visible:ring-1 focus-visible:ring-current',
            'transition-colors duration-fast'
          )}
          aria-label="Remove tag"
        >
          <CloseIcon />
        </button>
      )}
    </span>
  );
};

Tag.displayName = 'Tag';
