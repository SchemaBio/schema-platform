import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tag } from './Tag';

describe('Tag', () => {
  // Helper to get the root tag element
  const getTagRoot = (container: HTMLElement) => container.firstChild as HTMLElement;

  // ACMG Classification variants
  describe('ACMG variants', () => {
    it('renders pathogenic variant with correct styles', () => {
      const { container } = render(<Tag variant="pathogenic">Pathogenic</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-[var(--color-acmg-pathogenic-subtle)]');
      expect(tag).toHaveClass('text-[var(--color-acmg-pathogenic)]');
    });

    it('renders likely-pathogenic variant with correct styles', () => {
      const { container } = render(<Tag variant="likely-pathogenic">Likely Pathogenic</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-[var(--color-acmg-likely-pathogenic-subtle)]');
      expect(tag).toHaveClass('text-[var(--color-acmg-likely-pathogenic)]');
    });

    it('renders vus variant with correct styles', () => {
      const { container } = render(<Tag variant="vus">VUS</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-[var(--color-acmg-vus-subtle)]');
      expect(tag).toHaveClass('text-[var(--color-acmg-vus)]');
    });

    it('renders likely-benign variant with correct styles', () => {
      const { container } = render(<Tag variant="likely-benign">Likely Benign</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-[var(--color-acmg-likely-benign-subtle)]');
      expect(tag).toHaveClass('text-[var(--color-acmg-likely-benign)]');
    });

    it('renders benign variant with correct styles', () => {
      const { container } = render(<Tag variant="benign">Benign</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-[var(--color-acmg-benign-subtle)]');
      expect(tag).toHaveClass('text-[var(--color-acmg-benign)]');
    });
  });

  // AMP Tier variants
  describe('AMP Tier variants', () => {
    it('renders tier-1 variant with correct styles', () => {
      const { container } = render(<Tag variant="tier-1">Tier I</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-[var(--color-amp-tier-1-subtle)]');
      expect(tag).toHaveClass('text-[var(--color-amp-tier-1)]');
    });

    it('renders tier-2 variant with correct styles', () => {
      const { container } = render(<Tag variant="tier-2">Tier II</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-[var(--color-amp-tier-2-subtle)]');
      expect(tag).toHaveClass('text-[var(--color-amp-tier-2)]');
    });

    it('renders tier-3 variant with correct styles', () => {
      const { container } = render(<Tag variant="tier-3">Tier III</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-[var(--color-amp-tier-3-subtle)]');
      expect(tag).toHaveClass('text-[var(--color-amp-tier-3)]');
    });

    it('renders tier-4 variant with correct styles', () => {
      const { container } = render(<Tag variant="tier-4">Tier IV</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-[var(--color-amp-tier-4-subtle)]');
      expect(tag).toHaveClass('text-[var(--color-amp-tier-4)]');
    });
  });

  // Status variants
  describe('Status variants', () => {
    it('renders success variant with correct styles', () => {
      const { container } = render(<Tag variant="success">Success</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-success-subtle');
      expect(tag).toHaveClass('text-success-fg');
    });

    it('renders warning variant with correct styles', () => {
      const { container } = render(<Tag variant="warning">Warning</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-warning-subtle');
      expect(tag).toHaveClass('text-warning-fg');
    });

    it('renders danger variant with correct styles', () => {
      const { container } = render(<Tag variant="danger">Danger</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-danger-subtle');
      expect(tag).toHaveClass('text-danger-fg');
    });

    it('renders info variant with correct styles', () => {
      const { container } = render(<Tag variant="info">Info</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-accent-subtle');
      expect(tag).toHaveClass('text-accent-fg');
    });

    it('renders neutral variant with correct styles', () => {
      const { container } = render(<Tag variant="neutral">Neutral</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('bg-canvas-subtle');
      expect(tag).toHaveClass('text-fg-muted');
    });
  });

  // Base styling
  describe('Base styling', () => {
    it('has correct default height (20px = h-5)', () => {
      const { container } = render(<Tag variant="neutral">Test</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('h-5');
    });

    it('has correct horizontal padding (8px = px-2)', () => {
      const { container } = render(<Tag variant="neutral">Test</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('px-2');
    });

    it('has border', () => {
      const { container } = render(<Tag variant="neutral">Test</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('border');
    });
  });

  // Icon slot
  describe('Icon slot', () => {
    it('renders icon when provided', () => {
      render(
        <Tag variant="success" icon={<span data-testid="icon">✓</span>}>
          With Icon
        </Tag>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('does not render icon slot when not provided', () => {
      const { container } = render(<Tag variant="neutral">No Icon</Tag>);
      const tag = getTagRoot(container);
      // Should only have the text span, not an icon span
      const spans = tag.querySelectorAll(':scope > span');
      expect(spans).toHaveLength(1); // Only the text span
    });
  });

  // Closable functionality
  describe('Closable functionality', () => {
    it('renders close button when closable is true', () => {
      render(<Tag variant="neutral" closable>Closable</Tag>);
      expect(screen.getByRole('button', { name: 'Remove tag' })).toBeInTheDocument();
    });

    it('does not render close button when closable is false', () => {
      render(<Tag variant="neutral">Not Closable</Tag>);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<Tag variant="neutral" closable onClose={onClose}>Closable</Tag>);
      fireEvent.click(screen.getByRole('button', { name: 'Remove tag' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose on Enter key press', () => {
      const onClose = vi.fn();
      render(<Tag variant="neutral" closable onClose={onClose}>Closable</Tag>);
      fireEvent.keyDown(screen.getByRole('button', { name: 'Remove tag' }), { key: 'Enter' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose on Space key press', () => {
      const onClose = vi.fn();
      render(<Tag variant="neutral" closable onClose={onClose}>Closable</Tag>);
      fireEvent.keyDown(screen.getByRole('button', { name: 'Remove tag' }), { key: ' ' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // Custom className
  describe('Custom className', () => {
    it('accepts and applies custom className', () => {
      const { container } = render(<Tag variant="neutral" className="custom-class">Custom</Tag>);
      const tag = getTagRoot(container);
      expect(tag).toHaveClass('custom-class');
    });
  });
});
