jest.setTimeout(30000);

beforeEach(async () => {
  await page.waitForTimeout(500);
});

expect.extend({
  toBeTypeOrNull(received, classTypeOrNull) {
    try {
      expect(received).toEqual(expect.any(classTypeOrNull));
      return {
        message: () => `Ok`,
        pass: true,
      };
    } catch (error) {
      return received === null
        ? {
            message: () => `Ok`,
            pass: true,
          }
        : {
            message: () => `expected ${received} to be ${classTypeOrNull} type or null`,
            pass: false,
          };
    }
  },
});

// danger this should be last in this code
import 'expect-puppeteer';
import 'jest-extended';
