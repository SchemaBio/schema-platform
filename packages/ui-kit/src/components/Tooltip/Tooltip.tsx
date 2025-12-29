import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../utils/cn';

export type Placement = 'top' | 'right' | 'bottom' | 'left';
export type TooltipVariant = 'default' | 'nav';

export interface TooltipProps {
  /** Content to display in the tooltip */
  content: React.ReactNode;
  /** Placement position of the tooltip */
  placement?: Placement;
  /** Delay in milliseconds before showing the tooltip */
  delay?: number;
  /** The trigger element */
  children: React.ReactElement;
  /** Additional class name for the tooltip content */
  className?: string;
  /** Visual variant of the tooltip */
  variant?: TooltipVariant;
}

/**
 * Tooltip component for displaying contextual information on hover.
 * Built on Radix UI Tooltip for accessibility and automatic repositioning.
 *
 * @example
 * <Tooltip content="This is a tooltip">
 *   <button>Hover me</button>
 * </Tooltip>
 */
export function Tooltip({
  content,
  placement = 'top',
  delay = 200,
  children,
  className,
  variant = 'default',
}: TooltipProps): JSX.Element {
  const variantStyles = {
    default: 'bg-fg-default text-canvas-default',
    nav: 'bg-white dark:bg-[#161b22] text-fg-default border border-border shadow-lg',
  };

  const arrowStyles = {
    default: 'fill-fg-default',
    nav: 'fill-white dark:fill-[#161b22]',
  };

  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={placement}
            sideOffset={8}
            collisionPadding={8}
            className={cn(
              // Base styles
              'z-50 overflow-hidden rounded-lg px-3 py-2',
              'text-sm font-medium',
              // Variant styles
              variantStyles[variant],
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
            <TooltipPrimitive.Arrow className={arrowStyles[variant]} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

Tooltip.displayName = 'Tooltip';
