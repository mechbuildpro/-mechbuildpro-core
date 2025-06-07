import { capitalizeFirstLetter } from '../stringUtils';

describe('stringUtils', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
    });

    it('should return an empty string for null input', () => {
      expect(capitalizeFirstLetter(null)).toBe('');
    });

    it('should return an empty string for undefined input', () => {
      expect(capitalizeFirstLetter(undefined)).toBe('');
    });

    it('should return an empty string for empty input', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    it('should handle a string with only one character', () => {
        expect(capitalizeFirstLetter('a')).toBe('A');
    });

    it('should handle a string that is already capitalized', () => {
        expect(capitalizeFirstLetter('World')).toBe('World');
    });
  });
}); 