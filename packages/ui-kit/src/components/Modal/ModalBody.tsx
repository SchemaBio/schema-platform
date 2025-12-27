import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../utils/cn';

export interface ModalBodyProps {
  /** Body content */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Modal body component for the main content area.
 * Should be used as a direct child of Modal.
 *
 * @example
 * <ModalBody>
 *   <p>Modal content goes here...</p>
 * </ModalBody>
 */
export const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => {
  return (
    <DialogPrimitive.Description asChild>
      <div
        className={cn(
          'px-6 py-4',
          'text-fg-default text-sm',
          'overflow-y-auto',
          'max-h-[60vh]',
          className
        )}
      >
        {children}
      </div>
    </DialogPrimitive.Description>
  );
};

ModalBody.displayName = 'ModalBody';
