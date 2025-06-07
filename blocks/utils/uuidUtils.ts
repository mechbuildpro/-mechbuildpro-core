import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a simple UUID (Universally Unique Identifier).
 * Note: This is a basic implementation and not cryptographically secure.
 * @returns A unique identifier string.
 */
export function generateUUID(): string {
  return uuidv4();
}

// For cases where we need a shorter ID
export function generateShortId(): string {
  return uuidv4().split('-')[0];
} 