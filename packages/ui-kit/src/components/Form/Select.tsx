import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '../../utils/cn';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  /** Available options */
  options: SelectOption<T>[];
  /** Current value (single or array for multi-select) */
  value?: T | T[];
  /** Callback when value changes */
  onChange?: (value: T | T[]) => void;
  /** Enable multi-select mode */
  multiple?: boolean;
  /** Enable search/filter functionality */
  searchable?: boolean;
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Disable the select */
  disabled?: boolean;
  /** Show error state */
  error?: boolean;
  /** Additional class names */
  className?: string;
  /** Name attribute for form submission */
  name?: string;
}

const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M13.5 4.5L6 12L2.5 8.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


/**
 * Select component supporting single and multi-select modes with optional search.
 * Built on Radix UI Select for accessibility.
 *
 * @example
 * <Select
 *   options={[{ value: 'a', label: 'Option A' }]}
 *   value={selected}
 *   onChange={setSelected}
 * />
 */
export function Select<T extends string = string>({
  options,
  value,
  onChange,
  multiple = false,
  searchable = false,
  placeholder = 'Select...',
  disabled = false,
  error = false,
  className,
  name,
}: SelectProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, searchable]);

  // Get display label for current value
  const getDisplayLabel = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      const labels = value
        .map((v) => options.find((opt) => opt.value === v)?.label)
        .filter(Boolean);
      return labels.length > 2
        ? `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`
        : labels.join(', ');
    }
    const selected = options.find((opt) => opt.value === value);
    return selected?.label || placeholder;
  };

  // Handle single select change
  const handleSingleChange = (newValue: string) => {
    onChange?.(newValue as T);
    setSearchQuery('');
  };

  // Handle multi-select toggle
  const handleMultiToggle = (optionValue: T) => {
    if (!multiple || !Array.isArray(value)) return;
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(newValue);
  };

  const isSelected = (optionValue: T) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  // For multi-select, we use a custom implementation
  if (multiple) {
    return (
      <div className={cn('relative', className)}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className={cn(
            'flex items-center justify-between w-full',
            'h-8 px-3',
            'rounded-medium border',
            'bg-canvas-default',
            'text-sm text-left',
            'transition-colors duration-fast',
            error
              ? 'border-danger-emphasis'
              : 'border-border-default hover:border-border-muted',
            open && !error && 'border-accent-emphasis ring-1 ring-accent-emphasis',
            disabled && 'opacity-50 cursor-not-allowed bg-canvas-subtle',
            !value || (Array.isArray(value) && value.length === 0)
              ? 'text-fg-subtle'
              : 'text-fg-default'
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="truncate">{getDisplayLabel()}</span>
          <ChevronDownIcon />
        </button>
        {open && (
          <div
            className={cn(
              'absolute z-50 w-full mt-1',
              'bg-canvas-default',
              'border border-border-default',
              'rounded-medium shadow-medium',
              'max-h-60 overflow-auto'
            )}
          >
            {searchable && (
              <div className="p-2 border-b border-border-subtle">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className={cn(
                    'w-full h-7 px-2',
                    'text-sm',
                    'bg-canvas-subtle',
                    'border border-border-default rounded-small',
                    'outline-none focus:border-accent-emphasis'
                  )}
                  autoFocus
                />
              </div>
            )}
            <div role="listbox" aria-multiselectable="true">
              {filteredOptions.map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected(option.value)}
                  disabled={option.disabled}
                  onClick={() => handleMultiToggle(option.value)}
                  className={cn(
                    'flex items-center gap-2 w-full',
                    'px-3 py-2',
                    'text-sm text-left',
                    'hover:bg-canvas-subtle',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    isSelected(option.value) && 'bg-accent-subtle'
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center',
                      'w-4 h-4',
                      'border rounded-small',
                      isSelected(option.value)
                        ? 'bg-accent-emphasis border-accent-emphasis text-fg-on-emphasis'
                        : 'border-border-default'
                    )}
                  >
                    {isSelected(option.value) && <CheckIcon />}
                  </span>
                  {option.label}
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-sm text-fg-muted">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
        {/* Hidden input for form submission */}
        {name && Array.isArray(value) && value.map((v) => (
          <input key={String(v)} type="hidden" name={name} value={String(v)} />
        ))}
      </div>
    );
  }

  // Single select using Radix UI
  return (
    <SelectPrimitive.Root
      value={value as string}
      onValueChange={handleSingleChange}
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
      name={name}
    >
      <SelectPrimitive.Trigger
        className={cn(
          'flex items-center justify-between w-full',
          'h-8 px-3',
          'rounded-medium border',
          'bg-canvas-default',
          'text-sm',
          'transition-colors duration-fast',
          'outline-none',
          error
            ? 'border-danger-emphasis'
            : 'border-border-default hover:border-border-muted',
          'focus:border-accent-emphasis focus:ring-1 focus:ring-accent-emphasis',
          'data-[placeholder]:text-fg-subtle',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-canvas-subtle',
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDownIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            'z-50',
            'bg-canvas',
            'border border-border',
            'rounded-medium shadow-medium',
            'max-h-60 overflow-auto',
            'animate-in fade-in-0 zoom-in-95'
          )}
          position="popper"
          sideOffset={4}
        >
          {searchable && (
            <div className="p-2 border-b border-border-subtle">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className={cn(
                  'w-full h-7 px-2',
                  'text-sm',
                  'bg-canvas-subtle',
                  'border border-border-default rounded-small',
                  'outline-none focus:border-accent-emphasis'
                )}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <SelectPrimitive.Viewport className="p-1">
            {filteredOptions.map((option) => (
              <SelectPrimitive.Item
                key={String(option.value)}
                value={String(option.value)}
                disabled={option.disabled}
                className={cn(
                  'relative flex items-center',
                  'px-8 py-2',
                  'text-sm',
                  'rounded-small',
                  'cursor-pointer',
                  'outline-none',
                  'hover:bg-canvas-subtle',
                  'focus:bg-canvas-subtle',
                  'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed'
                )}
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2">
                  <CheckIcon />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-fg-muted">
                No options found
              </div>
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

Select.displayName = 'Select';
