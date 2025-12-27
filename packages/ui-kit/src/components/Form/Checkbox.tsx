import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '../../utils/cn';

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'type'> {
  /** Show indeterminate state (partial selection) */
  indeterminate?: boolean;
  /** Label text to display next to checkbox */
  label?: string;
}

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10 3L4.5 8.5L2 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MinusIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M2.5 6H9.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Checkbox component with support for indeterminate state.
 * Built on Radix UI Checkbox for accessibility.
 *
 * @example
 * <Checkbox label="Accept terms" checked={checked} onCheckedChange={setChecked} />
 * <Checkbox indeterminate label="Select all" />
 */
export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ indeterminate = false, label, className, disabled, ...props }, ref) => {
  // Handle indeterminate state
  const checkedState = indeterminate ? 'indeterminate' : props.checked;

  return (
    <label
      className={cn(
        'inline-flex items-center gap-2',
        'cursor-pointer',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <CheckboxPrimitive.Root
        ref={ref}
        disabled={disabled}
        checked={checkedState}
        className={cn(
          'flex items-center justify-center',
          'w-4 h-4',
          'rounded-small',
          'border',
          'bg-canvas-default',
          'transition-colors duration-fast',
          'border-border-default',
          'hover:border-border-muted',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-emphasis focus-visible:ring-offset-2',
          'data-[state=checked]:bg-accent-emphasis data-[state=checked]:border-accent-emphasis',
          'data-[state=indeterminate]:bg-accent-emphasis data-[state=indeterminate]:border-accent-emphasis',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="text-fg-on-emphasis">
          {indeterminate ? <MinusIcon /> : <CheckIcon />}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <span className="text-sm text-fg-default select-none">{label}</span>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';
