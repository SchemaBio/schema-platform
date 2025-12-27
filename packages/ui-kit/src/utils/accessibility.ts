/**
 * Accessibility utility functions for UI components
 * Supports WCAG 2.1 AA compliance - Requirements 11.1, 11.2, 11.3, 11.6, 11.7
 */

/**
 * Generates a unique ID for accessibility attributes.
 * Useful for linking labels to inputs, descriptions to elements, etc.
 *
 * @param prefix - Optional prefix for the ID
 * @returns A unique string ID
 */
export function generateId(prefix = 'ui'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Checks if the user prefers reduced motion.
 * Useful for disabling animations for users who have this preference set.
 * Supports Requirements 11.7
 *
 * @returns true if the user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Hook to subscribe to reduced motion preference changes.
 * Returns current preference and updates when system setting changes.
 *
 * @returns Current reduced motion preference
 */
export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Checks if the user prefers high contrast mode.
 *
 * @returns true if the user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * Creates an object with common ARIA attributes for interactive elements.
 * Supports Requirements 11.3
 *
 * @param options - Configuration options
 * @returns Object with ARIA attributes
 */
export function getAriaProps(options: {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  live?: 'polite' | 'assertive' | 'off';
  role?: string;
  pressed?: boolean;
  checked?: boolean | 'mixed';
  controls?: string;
  owns?: string;
  haspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
}): Record<string, string | boolean | undefined> {
  const props: Record<string, string | boolean | undefined> = {};

  if (options.label) props['aria-label'] = options.label;
  if (options.labelledBy) props['aria-labelledby'] = options.labelledBy;
  if (options.describedBy) props['aria-describedby'] = options.describedBy;
  if (options.expanded !== undefined) props['aria-expanded'] = options.expanded;
  if (options.selected !== undefined) props['aria-selected'] = options.selected;
  if (options.disabled !== undefined) props['aria-disabled'] = options.disabled;
  if (options.hidden !== undefined) props['aria-hidden'] = options.hidden;
  if (options.live) props['aria-live'] = options.live;
  if (options.role) props['role'] = options.role;
  if (options.pressed !== undefined) props['aria-pressed'] = options.pressed;
  if (options.checked !== undefined) props['aria-checked'] = String(options.checked);
  if (options.controls) props['aria-controls'] = options.controls;
  if (options.owns) props['aria-owns'] = options.owns;
  if (options.haspopup !== undefined) props['aria-haspopup'] = String(options.haspopup);
  if (options.current !== undefined) props['aria-current'] = options.current === true ? 'true' : options.current;

  return props;
}

/**
 * Handles keyboard navigation for lists and menus.
 * Returns the next index based on the key pressed.
 * Supports Requirements 11.2
 *
 * @param event - Keyboard event
 * @param currentIndex - Current focused index
 * @param itemCount - Total number of items
 * @param options - Navigation options
 * @returns New index or null if no navigation occurred
 */
export function handleListKeyboardNavigation(
  event: KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  options: {
    orientation?: 'horizontal' | 'vertical';
    loop?: boolean;
  } = {}
): number | null {
  const { orientation = 'vertical', loop = true } = options;

  const isVertical = orientation === 'vertical';
  const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
  const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';

  let newIndex: number | null = null;

  switch (event.key) {
    case prevKey:
      event.preventDefault();
      if (currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (loop) {
        newIndex = itemCount - 1;
      }
      break;

    case nextKey:
      event.preventDefault();
      if (currentIndex < itemCount - 1) {
        newIndex = currentIndex + 1;
      } else if (loop) {
        newIndex = 0;
      }
      break;

    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;

    case 'End':
      event.preventDefault();
      newIndex = itemCount - 1;
      break;
  }

  return newIndex;
}

/**
 * Handles keyboard navigation for grid-based layouts.
 * Supports Requirements 11.2
 *
 * @param event - Keyboard event
 * @param currentIndex - Current focused index
 * @param columnCount - Number of columns in the grid
 * @param itemCount - Total number of items
 * @param options - Navigation options
 * @returns New index or null if no navigation occurred
 */
export function handleGridKeyboardNavigation(
  event: KeyboardEvent,
  currentIndex: number,
  columnCount: number,
  itemCount: number,
  options: { loop?: boolean } = {}
): number | null {
  const { loop = false } = options;
  let newIndex: number | null = null;

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      if (currentIndex >= columnCount) {
        newIndex = currentIndex - columnCount;
      } else if (loop) {
        const lastRowStart = Math.floor((itemCount - 1) / columnCount) * columnCount;
        newIndex = Math.min(lastRowStart + (currentIndex % columnCount), itemCount - 1);
      }
      break;

    case 'ArrowDown':
      event.preventDefault();
      if (currentIndex + columnCount < itemCount) {
        newIndex = currentIndex + columnCount;
      } else if (loop) {
        newIndex = currentIndex % columnCount;
      }
      break;

    case 'ArrowLeft':
      event.preventDefault();
      if (currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (loop) {
        newIndex = itemCount - 1;
      }
      break;

    case 'ArrowRight':
      event.preventDefault();
      if (currentIndex < itemCount - 1) {
        newIndex = currentIndex + 1;
      } else if (loop) {
        newIndex = 0;
      }
      break;

    case 'Home':
      event.preventDefault();
      if (event.ctrlKey) {
        newIndex = 0;
      } else {
        // Go to start of current row
        newIndex = Math.floor(currentIndex / columnCount) * columnCount;
      }
      break;

    case 'End':
      event.preventDefault();
      if (event.ctrlKey) {
        newIndex = itemCount - 1;
      } else {
        // Go to end of current row
        const rowStart = Math.floor(currentIndex / columnCount) * columnCount;
        newIndex = Math.min(rowStart + columnCount - 1, itemCount - 1);
      }
      break;
  }

  return newIndex;
}

/**
 * Announces a message to screen readers using a live region.
 * Supports Requirements 11.5
 *
 * @param message - Message to announce
 * @param priority - Priority level ('polite' or 'assertive')
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof document === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;

  document.body.appendChild(announcement);

  // Delay to ensure the live region is registered
  setTimeout(() => {
    announcement.textContent = message;
  }, 100);

  // Clean up after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Creates a visually hidden element for screen readers.
 * Useful for providing additional context that shouldn't be visible.
 *
 * @returns CSS styles for visually hidden content
 */
export function getVisuallyHiddenStyles(): React.CSSProperties {
  return {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  };
}

/**
 * Traps focus within a container element.
 * Returns a cleanup function to restore normal focus behavior.
 *
 * @param container - Container element to trap focus within
 * @returns Cleanup function
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}


/**
 * Checks if an element is focusable.
 * Supports Requirements 11.2
 *
 * @param element - Element to check
 * @returns true if the element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.hasAttribute('disabled')) return false;
  if (element.getAttribute('tabindex') === '-1') return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;

  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  if (focusableTags.includes(element.tagName)) {
    if (element.tagName === 'A' && !element.hasAttribute('href')) {
      return element.hasAttribute('tabindex');
    }
    return true;
  }

  return element.hasAttribute('tabindex') && element.getAttribute('tabindex') !== '-1';
}

/**
 * Gets all focusable elements within a container.
 * Supports Requirements 11.2
 *
 * @param container - Container element to search within
 * @returns Array of focusable elements
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));
  return elements.filter((el) => {
    // Filter out hidden elements
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

/**
 * Manages roving tabindex for a group of elements.
 * Only one element in the group should be tabbable at a time.
 * Supports Requirements 11.2
 *
 * @param elements - Array of elements in the group
 * @param activeIndex - Index of the currently active element
 */
export function setRovingTabindex(elements: HTMLElement[], activeIndex: number): void {
  elements.forEach((element, index) => {
    element.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
  });
}

/**
 * Creates a skip link for keyboard navigation.
 * Allows users to skip repetitive content.
 * Supports Requirements 11.2
 *
 * @param targetId - ID of the element to skip to
 * @param label - Label for the skip link
 * @returns Skip link element
 */
export function createSkipLink(targetId: string, label = 'Skip to main content'): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.textContent = label;
  link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-canvas-default focus:text-fg-default focus:rounded-md focus:shadow-lg';
  return link;
}

/**
 * Validates color contrast ratio meets WCAG requirements.
 * Supports Requirements 11.4
 *
 * @param foreground - Foreground color in hex format
 * @param background - Background color in hex format
 * @param level - WCAG level ('AA' or 'AAA')
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns true if contrast ratio meets requirements
 */
export function meetsContrastRequirements(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  // AA level
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Calculates the contrast ratio between two colors.
 * Supports Requirements 11.4
 *
 * @param color1 - First color in hex format
 * @param color2 - Second color in hex format
 * @returns Contrast ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculates the relative luminance of a color.
 *
 * @param hex - Color in hex format
 * @returns Relative luminance value
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Converts hex color to RGB array.
 *
 * @param hex - Color in hex format
 * @returns RGB array or null if invalid
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}
