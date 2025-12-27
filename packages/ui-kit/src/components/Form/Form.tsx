import * as React from 'react';
import { cn } from '../../utils/cn';

export type LabelPosition = 'top' | 'left';

export interface FormContextValue {
  labelPosition: LabelPosition;
  labelWidth: number;
}

const FormContext = React.createContext<FormContextValue>({
  labelPosition: 'top',
  labelWidth: 120,
});

export const useFormContext = () => React.useContext(FormContext);

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Label position for all form items */
  labelPosition?: LabelPosition;
  /** Label width when labelPosition is 'left' (in pixels) */
  labelWidth?: number;
  /** Callback when form is submitted with validation */
  onValidSubmit?: (data: FormData) => void;
}

/**
 * Form component that provides context for form items and handles validation.
 * Supports top-aligned and left-aligned label positioning.
 *
 * @example
 * <Form labelPosition="top" onSubmit={handleSubmit}>
 *   <FormItem label="Name" required>
 *     <Input />
 *   </FormItem>
 * </Form>
 */
export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  (
    {
      labelPosition = 'top',
      labelWidth = 120,
      onValidSubmit,
      onSubmit,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      if (onSubmit) {
        onSubmit(event);
      }
      
      if (onValidSubmit && !event.defaultPrevented) {
        const form = event.currentTarget;
        if (form.checkValidity()) {
          onValidSubmit(new FormData(form));
        } else {
          event.preventDefault();
          // Focus first invalid field
          const firstInvalid = form.querySelector(':invalid') as HTMLElement;
          firstInvalid?.focus();
        }
      }
    };

    return (
      <FormContext.Provider value={{ labelPosition, labelWidth }}>
        <form
          ref={ref}
          className={cn('flex flex-col gap-4', className)}
          onSubmit={handleSubmit}
          {...props}
        >
          {children}
        </form>
      </FormContext.Provider>
    );
  }
);

Form.displayName = 'Form';
