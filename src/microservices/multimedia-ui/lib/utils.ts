// @ts-ignore
/**
 * Temporary utility functions for components
 * This will be replaced with proper utils from core module
  */

export function cn(...inputs: (string | undefined)[]): string {
  return inputs.filter(Boolean).join(' ');
}