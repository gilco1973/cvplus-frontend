/**
 * CVPlus Core - Classnames Utility
 * 
 * Utility function for combining CSS class names conditionally.
 * Commonly used for Tailwind CSS class management.
 * 
 * @author Gil Klainert
 * @version 1.0.0
  */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names conditionally and merges Tailwind classes
 * @param inputs - Array of class name inputs (strings, conditionals, objects)
 * @returns Combined and merged class names
  */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}