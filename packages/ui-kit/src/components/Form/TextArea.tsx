import * as React from 'react';
import { cn } from '../../utils/cn';

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Enable auto-resize based on content */
  autoResize?: boolean;
  /** Show error state */
  error?: boolean;
  /** Minimum number of rows */
  minRows?: number;
  /** Maximum number of rows (for auto-resize) */
  maxRows?: number;
}

/**
 * TextArea component with optional auto-resize functionality.
 * Automatically adjusts height based on content when autoResize is enabled.
 *
 * @example
 * <TextArea placeholder="Enter description" />
 * <TextArea autoResize minRows={3} maxRows={10} />
 */
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      autoResize = false,
      error = false,
      minRows = 3,
      maxRows = 10,
      className,
      disabled,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [internalValue, setInternalValue] = React.useState(value || '');

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // Calculate line height for auto-resize
    const lineHeight = 20; // Approximate line height in pixels
    const paddingY = 16; // Vertical padding (8px top + 8px bottom)
    const minHeight = minRows * lineHeight + paddingY;
    const maxHeight = maxRows * lineHeight + paddingY;

    // Auto-resize logic
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoResize) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate new height
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, minHeight),
        maxHeight
      );
      
      textarea.style.height = `${newHeight}px`;
      
      // Show scrollbar if content exceeds maxHeight
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [autoResize, minHeight, maxHeight]);

    // Adjust height on value change
    React.useEffect(() => {
      adjustHeight();
    }, [internalValue, adjustHeight]);

    // Adjust height on mount
    React.useEffect(() => {
      adjustHeight();
    }, [adjustHeight]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(event.target.value);
      onChange?.(event);
    };

    // Sync internal value with controlled value
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    return (
      <textarea
        ref={textareaRef}
        disabled={disabled}
        value={value !== undefined ? value : internalValue}
        onChange={handleChange}
        rows={autoResize ? minRows : props.rows}
        className={cn(
          'w-full',
          'px-3 py-2',
          'rounded-medium',
          'border',
          'bg-canvas-default',
          'text-sm text-fg-default',
          'placeholder:text-fg-subtle',
          'transition-colors duration-fast',
          'resize-none',
          // Border states
          error
            ? 'border-danger-emphasis'
            : 'border-border-default hover:border-border-muted',
          // Focus state
          !error && 'focus:border-accent-emphasis focus:ring-1 focus:ring-accent-emphasis',
          error && 'focus:ring-1 focus:ring-danger-emphasis',
          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed bg-canvas-subtle',
          'outline-none',
          className
        )}
        style={{
          minHeight: autoResize ? minHeight : undefined,
          maxHeight: autoResize ? maxHeight : undefined,
        }}
        aria-invalid={error}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';
