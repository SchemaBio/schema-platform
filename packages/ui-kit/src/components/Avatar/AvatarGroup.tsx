import * as React from 'react';
import { cn } from '../../utils/cn';
import type { AvatarSize } from './Avatar';

export interface AvatarGroupProps {
  /** Avatar elements to display */
  children: React.ReactNode;
  /** Maximum number of avatars to display before showing overflow count */
  max?: number;
  /** Size for all avatars in the group */
  size?: AvatarSize;
  /** Additional CSS classes */
  className?: string;
}

/** Overlap offset based on avatar size */
const overlapStyles: Record<AvatarSize, string> = {
  small: '-space-x-2',
  medium: '-space-x-2.5',
  large: '-space-x-3',
};

/** Size styles for the overflow indicator */
const overflowSizeStyles: Record<AvatarSize, string> = {
  small: 'h-6 w-6 text-xs',
  medium: 'h-8 w-8 text-sm',
  large: 'h-12 w-12 text-base',
};

/**
 * AvatarGroup component for displaying multiple avatars with overlap.
 * Shows an overflow indicator when there are more avatars than the max limit.
 *
 * @example
 * <AvatarGroup max={3} size="medium">
 *   <Avatar name="John Doe" />
 *   <Avatar name="Jane Smith" />
 *   <Avatar name="Bob Wilson" />
 *   <Avatar name="Alice Brown" />
 * </AvatarGroup>
 */
export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max,
  size = 'medium',
  className,
}) => {
  const childArray = React.Children.toArray(children);
  const totalCount = childArray.length;
  
  // Determine how many to show and if we need overflow indicator
  const showMax = max !== undefined && max > 0 ? max : totalCount;
  const visibleChildren = childArray.slice(0, showMax);
  const overflowCount = totalCount - showMax;

  return (
    <div
      className={cn(
        'inline-flex items-center',
        overlapStyles[size],
        className
      )}
    >
      {visibleChildren.map((child, index) => {
        // Clone each avatar to ensure consistent sizing and add ring for overlap visibility
        if (React.isValidElement(child)) {
          return (
            <div
              key={index}
              className="relative ring-2 ring-canvas-default rounded-full"
              style={{ zIndex: visibleChildren.length - index }}
            >
              {React.cloneElement(child as React.ReactElement<{ size?: AvatarSize }>, {
                size,
              })}
            </div>
          );
        }
        return child;
      })}

      {/* Overflow indicator */}
      {overflowCount > 0 && (
        <div
          className={cn(
            'relative inline-flex items-center justify-center',
            'rounded-full',
            'bg-canvas-subtle text-fg-muted',
            'font-medium',
            'ring-2 ring-canvas-default',
            overflowSizeStyles[size]
          )}
          style={{ zIndex: 0 }}
          aria-label={`${overflowCount} more users`}
        >
          <span>+{overflowCount}</span>
        </div>
      )}
    </div>
  );
};

AvatarGroup.displayName = 'AvatarGroup';
