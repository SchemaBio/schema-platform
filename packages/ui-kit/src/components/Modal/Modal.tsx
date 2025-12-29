import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../utils/cn';

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';

export interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Modal size variant */
  size?: ModalSize;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Whether clicking the overlay closes the modal */
  closeOnOverlayClick?: boolean;
  /** Modal content */
  children: React.ReactNode;
  /** Additional class name for the modal content */
  className?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  small: 'max-w-[400px]',
  medium: 'max-w-[600px]',
  large: 'max-w-[800px]',
  fullscreen: 'max-w-none w-screen h-screen m-0 rounded-none',
};

/**
 * Modal component built on Radix UI Dialog.
 * Provides focus trapping, keyboard navigation, and accessible modal dialogs.
 *
 * @example
 * <Modal open={isOpen} onOpenChange={setIsOpen} size="medium">
 *   <ModalHeader>Title</ModalHeader>
 *   <ModalBody>Content</ModalBody>
 *   <ModalFooter>
 *     <Button onClick={() => setIsOpen(false)}>Close</Button>
 *   </ModalFooter>
 * </Modal>
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  size = 'medium',
  closeOnEscape = true,
  closeOnOverlayClick = true,
  children,
  className,
}) => {
  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    if (!closeOnEscape) {
      event.preventDefault();
    }
  };

  const handlePointerDownOutside = (event: CustomEvent) => {
    if (!closeOnOverlayClick) {
      event.preventDefault();
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50',
            'bg-black/50',
            // Animation
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'duration-300'
          )}
        />
        <DialogPrimitive.Content
          onEscapeKeyDown={handleEscapeKeyDown}
          onPointerDownOutside={handlePointerDownOutside}
          className={cn(
            'fixed left-1/2 top-1/2 z-50',
            '-translate-x-1/2 -translate-y-1/2',
            'w-full',
            'bg-canvas',
            'border border-border',
            'rounded-large',
            'shadow-extra-large',
            'focus:outline-none',
            // Animation
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'duration-300',
            // Size
            sizeStyles[size],
            // Fullscreen specific
            size === 'fullscreen' && 'top-0 left-0 translate-x-0 translate-y-0',
            className
          )}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

Modal.displayName = 'Modal';
