import * as React from 'react';
import { Modal } from './Modal';
import { ModalHeader } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';
import { cn } from '../../utils/cn';
import { generateId } from '../../utils/accessibility';

export type DialogType = 'confirm' | 'alert' | 'prompt';

export interface DialogProps {
  /** Dialog type determines the UI pattern */
  type: DialogType;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: string;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Callback when user confirms (receives input value for prompt type) */
  onConfirm?: (value?: string) => void;
  /** Callback when user cancels */
  onCancel?: () => void;
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Placeholder text for prompt input */
  placeholder?: string;
  /** Default value for prompt input */
  defaultValue?: string;
  /** Additional class name */
  className?: string;
}

/** Button component for dialog actions */
const DialogButton: React.FC<{
  variant: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  children: React.ReactNode;
  autoFocus?: boolean;
}> = ({ variant, onClick, children, autoFocus }) => {
  const variantStyles = {
    primary: [
      'bg-accent-emphasis text-fg-on-emphasis',
      'hover:bg-[color:color-mix(in_srgb,var(--color-accent-emphasis)_90%,black)]',
    ].join(' '),
    secondary: [
      'bg-canvas-subtle text-fg-default',
      'border border-border-default',
      'hover:bg-canvas-inset',
    ].join(' '),
    danger: [
      'bg-danger-emphasis text-fg-on-emphasis',
      'hover:bg-[color:color-mix(in_srgb,var(--color-danger-emphasis)_90%,black)]',
    ].join(' '),
  };

  return (
    <button
      type="button"
      onClick={onClick}
      autoFocus={autoFocus}
      className={cn(
        'inline-flex items-center justify-center',
        'h-8 px-4',
        'text-sm font-medium',
        'rounded-medium',
        'transition-colors duration-fast',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-emphasis focus-visible:ring-offset-2',
        variantStyles[variant]
      )}
    >
      {children}
    </button>
  );
};

/**
 * Dialog component with pre-built patterns for common use cases.
 * Supports confirm, alert, and prompt dialog types.
 * Compliant with WCAG 2.1 AA accessibility requirements.
 *
 * @example
 * // Confirm dialog
 * <Dialog
 *   type="confirm"
 *   title="Delete Item"
 *   message="Are you sure you want to delete this item?"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onConfirm={() => handleDelete()}
 *   onCancel={() => setIsOpen(false)}
 * />
 *
 * // Alert dialog
 * <Dialog
 *   type="alert"
 *   title="Success"
 *   message="Your changes have been saved."
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onConfirm={() => setIsOpen(false)}
 * />
 *
 * // Prompt dialog
 * <Dialog
 *   type="prompt"
 *   title="Rename File"
 *   message="Enter a new name for the file:"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onConfirm={(value) => handleRename(value)}
 *   onCancel={() => setIsOpen(false)}
 * />
 */
export const Dialog: React.FC<DialogProps> = ({
  type,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  open,
  onOpenChange,
  placeholder = '',
  defaultValue = '',
  className,
}) => {
  const [inputValue, setInputValue] = React.useState(defaultValue);
  const inputId = React.useMemo(() => generateId('dialog-input'), []);
  const descriptionId = React.useMemo(() => generateId('dialog-desc'), []);

  // Reset input value when dialog opens
  React.useEffect(() => {
    if (open) {
      setInputValue(defaultValue);
    }
  }, [open, defaultValue]);

  const handleConfirm = () => {
    if (type === 'prompt') {
      onConfirm?.(inputValue);
    } else {
      onConfirm?.();
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && type === 'prompt') {
      event.preventDefault();
      handleConfirm();
    }
  };

  // Determine button text based on type
  const getConfirmText = () => {
    if (confirmText) return confirmText;
    switch (type) {
      case 'confirm':
        return 'Confirm';
      case 'alert':
        return 'OK';
      case 'prompt':
        return 'Submit';
      default:
        return 'OK';
    }
  };

  const getCancelText = () => {
    return cancelText || 'Cancel';
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="small"
      closeOnEscape={type !== 'alert'}
      closeOnOverlayClick={type !== 'alert'}
      className={className}
    >
      <ModalHeader showCloseButton={type !== 'alert'}>{title}</ModalHeader>
      <ModalBody>
        <p id={descriptionId} className="text-fg-muted">{message}</p>
        {type === 'prompt' && (
          <input
            id={inputId}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-describedby={descriptionId}
            className={cn(
              'mt-4 w-full',
              'h-8 px-3',
              'text-sm text-fg-default',
              'bg-canvas-default',
              'border border-border-default rounded-medium',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-emphasis focus:border-transparent',
              'placeholder:text-fg-subtle'
            )}
            autoFocus
          />
        )}
      </ModalBody>
      <ModalFooter>
        {type !== 'alert' && (
          <DialogButton variant="secondary" onClick={handleCancel}>
            {getCancelText()}
          </DialogButton>
        )}
        <DialogButton
          variant={type === 'confirm' ? 'danger' : 'primary'}
          onClick={handleConfirm}
          autoFocus={type === 'alert'}
        >
          {getConfirmText()}
        </DialogButton>
      </ModalFooter>
    </Modal>
  );
};

Dialog.displayName = 'Dialog';
