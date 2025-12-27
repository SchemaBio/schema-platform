import * as React from 'react';
import { cn } from '../../utils/cn';

export interface ModalFooterProps {
  /** Footer content (typically action buttons) */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Modal footer component for action buttons.
 * Should be used as a direct child of Modal.
 *
 * @example
 * <ModalFooter>
 *   <Button variant="secondary" onClick={onCancel}>Cancel</Button>
 *   <Button variant="primary" onClick={onConfirm}>Confirm</Button>
 * </ModalFooter>
 */
export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3',
        'px-6 py-4',
        'border-t border-border-default',
        className
      )}
    >
      {children}
    </div>
  );
};

ModalFooter.displayName = 'ModalFooter';
