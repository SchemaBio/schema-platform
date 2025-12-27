import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../utils/cn';

export interface ModalHeaderProps {
  /** Header content (typically the title) */
  children: React.ReactNode;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Additional class name */
  className?: string;
}

/** Close icon component */
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * Modal header component with optional close button.
 * Should be used as a direct child of Modal.
 *
 * @example
 * <ModalHeader showCloseButton>
 *   Modal Title
 * </ModalHeader>
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  showCloseButton = true,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'px-6 py-4',
        'border-b border-border-default',
        className
      )}
    >
      <DialogPrimitive.Title className="text-base font-semibold text-fg-default">
        {children}
      </DialogPrimitive.Title>
      {showCloseButton && (
        <DialogPrimitive.Close
          className={cn(
            'rounded-medium p-1',
            'text-fg-muted hover:text-fg-default',
            'hover:bg-canvas-subtle',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-emphasis',
            'transition-colors duration-fast'
          )}
          aria-label="Close"
        >
          <CloseIcon />
        </DialogPrimitive.Close>
      )}
    </div>
  );
};

ModalHeader.displayName = 'ModalHeader';
