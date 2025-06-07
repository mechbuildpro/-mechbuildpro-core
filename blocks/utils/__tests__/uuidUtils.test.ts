import { generateUUID } from '../uuidUtils';

describe('uuidUtils', () => {
  describe('generateUUID', () => {
    it('should generate a string in UUID format', () => {
      const uuid = generateUUID();
      // Simplified regex to check basic UUID format (e.g., xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate different UUIDs on successive calls', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });
}); 