// blocks/utils/__tests__/dateUtils.test.ts

import { formatDateToYYYYMMDD, formatTimeToHHMM } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDateToYYYYMMDD', () => {
    it('should format a date correctly', () => {
      const date = new Date('2023-10-27T10:30:00.000Z');
      expect(formatDateToYYYYMMDD(date)).toBe('2023-10-27');
    });

    it('should handle single digit month and day', () => {
        const date = new Date('2023-05-01T10:30:00.000Z');
        expect(formatDateToYYYYMMDD(date)).toBe('2023-05-01');
    });
  });

  describe('formatTimeToHHMM', () => {
    it('should format time correctly', () => {
      const date = new Date('2023-10-27T10:30:00.000Z');
      expect(formatTimeToHHMM(date)).toBe('10:30');
    });

    it('should handle single digit hours and minutes', () => {
        const date = new Date('2023-10-27T05:05:00.000Z');
        expect(formatTimeToHHMM(date)).toBe('05:05');
    });
  });
}); 