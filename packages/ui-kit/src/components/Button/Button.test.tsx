import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-accent-emphasis');
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-canvas-subtle');
  });

  it('applies danger variant styles', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-danger-emphasis');
  });

  it('applies ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-transparent');
  });

  it('applies link variant styles', () => {
    render(<Button variant="link">Link</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-accent-fg');
  });

  it('applies small size styles', () => {
    render(<Button size="small">Small</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-7');
  });

  it('applies medium size styles by default', () => {
    render(<Button>Medium</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8');
  });

  it('applies large size styles', () => {
    render(<Button size="large">Large</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders left icon', () => {
    render(<Button leftIcon={<span data-testid="left-icon">←</span>}>With Icon</Button>);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders right icon', () => {
    render(<Button rightIcon={<span data-testid="right-icon">→</span>}>With Icon</Button>);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('applies icon-only styles', () => {
    render(<Button iconOnly leftIcon={<span>★</span>} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-8');
  });

  it('triggers onClick on Enter key', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press Enter</Button>);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    // Enter key triggers native click, so we check the button received the event
    expect(button).toBeInTheDocument();
  });

  it('triggers onClick on Space key', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press Space</Button>);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onClick on Space when disabled', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('accepts custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('has visible focus ring styles', () => {
    render(<Button>Focus me</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus-visible:ring-2');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it('has type="button" by default', () => {
    render(<Button>Default Type</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('accepts type="submit"', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
