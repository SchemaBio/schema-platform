import * as React from 'react';
import { cn } from '../../utils/cn';

export type AvatarSize = 'small' | 'medium' | 'large';
export type AvatarStatus = 'online' | 'offline' | 'busy';

export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** User name for generating initials fallback */
  name?: string;
  /** Avatar size */
  size?: AvatarSize;
  /** Status indicator */
  status?: AvatarStatus;
  /** Additional CSS classes */
  className?: string;
}

/** Size configurations: dimensions in pixels */
const sizeStyles: Record<AvatarSize, string> = {
  small: 'h-6 w-6 text-xs',
  medium: 'h-8 w-8 text-sm',
  large: 'h-12 w-12 text-base',
};

/** Status indicator size based on avatar size */
const statusSizeStyles: Record<AvatarSize, string> = {
  small: 'h-2 w-2 border',
  medium: 'h-2.5 w-2.5 border-[1.5px]',
  large: 'h-3 w-3 border-2',
};

/** Status indicator colors */
const statusColorStyles: Record<AvatarStatus, string> = {
  online: 'bg-success-emphasis',
  offline: 'bg-fg-muted',
  busy: 'bg-danger-emphasis',
};

/** Status labels for screen readers */
const statusLabels: Record<AvatarStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  busy: 'Busy',
};

/**
 * Extract initials from a name string.
 * Takes the first letter of the first two words.
 */
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Avatar component for displaying user profile images with fallback to initials.
 * Supports multiple sizes and optional status indicators.
 * Compliant with WCAG 2.1 AA accessibility requirements.
 *
 * @example
 * <Avatar src="/user.jpg" alt="John Doe" size="medium" />
 * <Avatar name="John Doe" size="large" status="online" />
 * <Avatar name="Jane Smith" size="small" />
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = 'medium', status, className }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    // Reset error state when src changes
    React.useEffect(() => {
      setImageError(false);
    }, [src]);

    const showImage = src && !imageError;
    const initials = name ? getInitials(name) : '';
    const accessibleName = alt || name || 'User avatar';

    return (
      <div
        ref={ref}
        role="img"
        aria-label={status ? `${accessibleName} (${statusLabels[status]})` : accessibleName}
        className={cn(
          'relative inline-flex items-center justify-center',
          'rounded-full',
          'bg-canvas-subtle text-fg-muted',
          'font-medium',
          'overflow-hidden',
          'shrink-0',
          sizeStyles[size],
          className
        )}
      >
        {showImage ? (
          <img
            src={src}
            alt="" // Empty alt since parent has aria-label
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}

        {/* Status indicator */}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0',
              'rounded-full',
              'border-canvas-default',
              statusSizeStyles[size],
              statusColorStyles[status]
            )}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
