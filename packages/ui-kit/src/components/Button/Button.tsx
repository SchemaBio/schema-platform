import * as React from 'react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Icon-only mode with square padding */
  iconOnly?: boolean;
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-accent-emphasis text-fg-on-emphasis',
    'hover:bg-[color:color-mix(in_srgb,var(--color-accent-emphasis)_90%,black)]',
    'active:bg-[color:color-mix(in_srgb,var(--color-accent-emphasis)_85%,black)]',
    'border-transparent',
  ].join(' '),
  secondary: [
    'bg-canvas-subtle text-fg-default',
    'hover:bg-canvas-inset',
    'active:bg-[color:color-mix(in_srgb,var(--color-canvas-inset)_95%,black)]',
    'border-border-default',
  ].join(' '),
  danger: [
    'bg-danger-emphasis text-fg-on-emphasis',
    'hover:bg-[color:color-mix(in_srgb,var(--color-danger-emphasis)_90%,black)]',
    'active:bg-[color:color-mix(in_srgb,var(--color-danger-emphasis)_85%,black)]',
    'border-transparent',
  ].join(' '),
  ghost: [
    'bg-transparent text-fg-default',
    'hover:bg-canvas-subtle',
    'active:bg-canvas-inset',
    'border-transparent',
  ].join(' '),
  link: [
    'bg-transparent text-accent-fg',
    'hover:underline',
    'active:text-[color:color-mix(in_srgb,var(--color-accent-fg)_85%,black)]',
    'border-transparent',
    'p-0 h-auto',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  small: 'h-7 px-3 text-sm gap-1',
  medium: 'h-8 px-4 text-sm gap-1.5',
  large: 'h-10 px-5 text-base gap-2',
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  small: 'h-7 w-7 p-0',
  medium: 'h-8 w-8 p-0',
  large: 'h-10 w-10 p-0',
};

/** Loading spinner component */
const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Button component with multiple variants, sizes, and states.
 * Supports icons, loading state, and full keyboard accessibility.
 *
 * @example
 * <Button variant="primary" size="medium">Click me</Button>
 * <Button variant="danger" loading>Deleting...</Button>
 * <Button variant="ghost" leftIcon={<Icon />}>With Icon</Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      loading = false,
      iconOnly = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      onClick,
      onKeyDown,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Ensure Enter and Space trigger the button (native behavior, but explicit for accessibility)
      if ((event.key === 'Enter' || event.key === ' ') && !isDisabled) {
        // Space key needs preventDefault to avoid scrolling
        if (event.key === ' ') {
          event.preventDefault();
        }
        // Let the native click handler fire for Enter
        // For Space, we need to trigger click manually since we prevented default
        if (event.key === ' ' && onClick) {
          onClick(event as unknown as React.MouseEvent<HTMLButtonElement>);
        }
      }
      onKeyDown?.(event);
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium',
          'rounded-medium',
          'border',
          'transition-colors duration-fast',
          // Focus ring for accessibility
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-emphasis focus-visible:ring-offset-2',
          // Disabled styles
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Variant styles (skip for link variant which has its own sizing)
          variantStyles[variant],
          // Size styles
          variant !== 'link' && (iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size]),
          className
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && <Spinner className="shrink-0" />}
        {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {!iconOnly && children && <span>{children}</span>}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
