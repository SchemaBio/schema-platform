import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../../utils/cn';

export interface RadioOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T = string> {
  /** Available options */
  options: RadioOption<T>[];
  /** Current selected value */
  value?: T;
  /** Callback when value changes */
  onChange?: (value: T) => void;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Name attribute for form submission */
  name: string;
  /** Disable all radio buttons */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * RadioGroup component with horizontal and vertical layout support.
 * Built on Radix UI RadioGroup for accessibility.
 *
 * @example
 * <RadioGroup
 *   name="size"
 *   options={[
 *     { value: 'small', label: 'Small' },
 *     { value: 'medium', label: 'Medium' },
 *   ]}
 *   value={size}
 *   onChange={setSize}
 *   orientation="horizontal"
 * />
 */
export function RadioGroup<T extends string = string>({
  options,
  value,
  onChange,
  orientation = 'vertical',
  name,
  disabled = false,
  className,
}: RadioGroupProps<T>) {
  return (
    <RadioGroupPrimitive.Root
      name={name}
      value={value as string}
      onValueChange={(v) => onChange?.(v as T)}
      disabled={disabled}
      orientation={orientation}
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-2',
        className
      )}
    >
      {options.map((option) => (
        <label
          key={String(option.value)}
          className={cn(
            'inline-flex items-center gap-2',
            'cursor-pointer',
            (disabled || option.disabled) && 'cursor-not-allowed opacity-50'
          )}
        >
          <RadioGroupPrimitive.Item
            value={String(option.value)}
            disabled={option.disabled}
            className={cn(
              'flex items-center justify-center',
              'w-4 h-4',
              'rounded-full',
              'border',
              'bg-canvas-default',
              'transition-colors duration-fast',
              'border-border-default',
              'hover:border-border-muted',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-emphasis focus-visible:ring-offset-2',
              'data-[state=checked]:border-accent-emphasis',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <RadioGroupPrimitive.Indicator
              className={cn(
                'w-2 h-2',
                'rounded-full',
                'bg-accent-emphasis'
              )}
            />
          </RadioGroupPrimitive.Item>
          <span className="text-sm text-fg-default select-none">
            {option.label}
          </span>
        </label>
      ))}
    </RadioGroupPrimitive.Root>
  );
}

RadioGroup.displayName = 'RadioGroup';
