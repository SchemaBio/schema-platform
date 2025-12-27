import * as React from 'react';
import { cn } from '../../utils/cn';
import { useFormContext } from './Form';

export interface FormItemProps {
  /** Label text for the form item */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Hint text to display below the input */
  hint?: string;
  /** HTML id for the input (used for label association) */
  htmlFor?: string;
  /** Additional class names */
  className?: string;
  /** Form control element */
  children: React.ReactNode;
}

/**
 * FormItem component that wraps form controls with label, error, and hint.
 * Automatically adapts to the Form's labelPosition setting.
 *
 * @example
 * <FormItem label="Email" required error="Invalid email">
 *   <Input type="email" />
 * </FormItem>
 */
export const FormItem: React.FC<FormItemProps> = ({
  label,
  required = false,
  error,
  hint,
  htmlFor,
  className,
  children,
}) => {
  const { labelPosition, labelWidth } = useFormContext();
  const isLeftAligned = labelPosition === 'left';

  return (
    <div
      className={cn(
        'flex',
        isLeftAligned ? 'flex-row items-start' : 'flex-col',
        isLeftAligned ? 'gap-3' : 'gap-2',
        className
      )}
    >
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn(
            'text-sm font-medium text-fg-default',
            isLeftAligned && 'shrink-0 pt-2',
            isLeftAligned && `w-[${labelWidth}px]`
          )}
          style={isLeftAligned ? { width: labelWidth } : undefined}
        >
          {label}
          {required && (
            <span className="text-danger-fg ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className={cn('flex flex-col gap-1', isLeftAligned && 'flex-1')}>
        {children}
        {error && (
          <p className="text-sm text-danger-fg" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-sm text-fg-muted">{hint}</p>
        )}
      </div>
    </div>
  );
};

FormItem.displayName = 'FormItem';
