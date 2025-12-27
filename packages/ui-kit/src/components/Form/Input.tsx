import * as React from 'react';
import { cn } from '../../utils/cn';
import { generateId } from '../../utils/accessibility';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Whether the input has an error state */
  error?: boolean;
  /** Element to display on the left side of the input */
  leftElement?: React.ReactNode;
  /** Element to display on the right side of the input */
  rightElement?: React.ReactNode;
  /** Error message to display (also used for aria-describedby) */
  errorMessage?: string;
  /** Hint text to display below the input */
  hint?: string;
}

/**
 * Input component with support for error states and left/right elements.
 * Default height is 32px with 1px border, focus state shows 2px accent border.
 * Supports WCAG 2.1 AA accessibility requirements.
 *
 * @example
 * <Input placeholder="Enter text" />
 * <Input error errorMessage="This field is required" />
 * <Input leftElement={<SearchIcon />} />
 * <Input rightElement={<Button variant="ghost" iconOnly><ClearIcon /></Button>} />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error = false,
      leftElement,
      rightElement,
      errorMessage,
      hint,
      className,
      disabled,
      id: providedId,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useMemo(() => generateId('input'), []);
    const inputId = providedId || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    // Build aria-describedby from error, hint, and provided value
    const describedByIds = [
      ariaDescribedBy,
      error && errorMessage ? errorId : null,
      hint ? hintId : null,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full">
        <div
          className={cn(
            'relative flex items-center',
            'h-8', // 32px height
            'rounded-medium',
            'border',
            'bg-canvas-default',
            'transition-colors duration-fast',
            // Border states
            error
              ? 'border-danger-emphasis'
              : 'border-border-default hover:border-border-muted',
            // Focus-within for the wrapper
            !error && 'focus-within:border-accent-emphasis focus-within:ring-1 focus-within:ring-accent-emphasis',
            error && 'focus-within:ring-1 focus-within:ring-danger-emphasis',
            // Disabled state
            disabled && 'opacity-50 cursor-not-allowed bg-canvas-subtle',
            className
          )}
        >
          {leftElement && (
            <span className="flex items-center justify-center pl-3 text-fg-muted" aria-hidden="true">
              {leftElement}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'flex-1 h-full',
              'bg-transparent',
              'text-sm text-fg-default',
              'placeholder:text-fg-subtle',
              'outline-none',
              'disabled:cursor-not-allowed',
              leftElement ? 'pl-2' : 'pl-3',
              rightElement ? 'pr-2' : 'pr-3'
            )}
            aria-invalid={error}
            aria-describedby={describedByIds}
            {...props}
          />
          {rightElement && (
            <span className="flex items-center justify-center pr-3 text-fg-muted">
              {rightElement}
            </span>
          )}
        </div>
        {/* Error message */}
        {error && errorMessage && (
          <p id={errorId} className="mt-1 text-sm text-danger-fg" role="alert">
            {errorMessage}
          </p>
        )}
        {/* Hint text */}
        {hint && !error && (
          <p id={hintId} className="mt-1 text-sm text-fg-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
