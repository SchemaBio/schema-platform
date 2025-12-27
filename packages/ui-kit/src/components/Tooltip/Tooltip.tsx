import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../utils/cn';

export type Placement = 'top' | 'right' | 'bottom' | 'left';

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
}: TooltipProps): JSX.Element {
  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={placement}
            sideOffset={4}
            collisionPadding={8}
            className={cn(
              // Base styles
              'z-50 overflow-hidden rounded-md px-3 py-1.5',
              'bg-fg-default text-canvas-default text-sm',
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
            <TooltipPrimitive.Arrow className="fill-fg-default" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

Tooltip.displayName = 'Tooltip';
