import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge class names with Tailwind CSS conflict resolution.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 *
 * @param inputs - Class values to merge (strings, arrays, objects)
 * @returns Merged class string with Tailwind conflicts resolved
 *
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500') // => 'text-blue-500' if condition is true
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
