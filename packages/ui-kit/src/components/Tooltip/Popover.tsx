import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../utils/cn';
import type { Placement } from './Tooltip';

export interface PopoverProps {
  /** Content to display in the popover */
  content: React.ReactNode;
  /** Placement position of the popover */
  placement?: Placement;
  /** Trigger mode: 'click' or 'hover' */
  trigger?: 'click' | 'hover';
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** The trigger element */
  children: React.ReactElement;
  /** Additional class name for the popover content */
  className?: string;
}

/**
 * Popover component for displaying rich content in a floating panel.
 * Built on Radix UI Popover for accessibility and positioning.
 *
 * @example
 * <Popover content={<div>Popover content</div>}>
 *   <button>Click me</button>
 * </Popover>
 */
export function Popover({
  content,
  placement = 'bottom',
  trigger = 'click',
  open,
  onOpenChange,
  children,
  className,
}: PopoverProps): JSX.Element {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  // Handle hover trigger mode
  const handleMouseEnter = React.useCallback(() => {
    if (trigger === 'hover') {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        handleOpenChange(true);
      }, 200);
    }
  }, [trigger, handleOpenChange]);

  const handleMouseLeave = React.useCallback(() => {
    if (trigger === 'hover') {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        handleOpenChange(false);
      }, 100);
    }
  }, [trigger, handleOpenChange]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        {trigger === 'hover' ? (
          <span
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ display: 'inline-block' }}
          >
            {children}
          </span>
        ) : (
          children
        )}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={placement}
          sideOffset={4}
          collisionPadding={8}
          onMouseEnter={trigger === 'hover' ? handleMouseEnter : undefined}
          onMouseLeave={trigger === 'hover' ? handleMouseLeave : undefined}
          onEscapeKeyDown={() => handleOpenChange(false)}
          className={cn(
            // Base styles
            'z-50 w-72 rounded-md border border-border-default',
            'bg-canvas-default p-4 shadow-md outline-none',
            // Animation
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            // Side-specific animations
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2',
            'data-[side=top]:slide-in-from-bottom-2',
            className
          )}
        >
          {content}
          <PopoverPrimitive.Arrow className="fill-canvas-default" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

Popover.displayName = 'Popover';
