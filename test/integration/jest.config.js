const tsPreset = require('ts-jest/jest-preset');
const puppeteerPreset = require('jest-puppeteer/jest-preset');

module.exports = {
  rootDir: '.',
  testMatch: [
    `<rootDir>/tests/**/*.ts`,
  ],
  ...tsPreset,
  ...puppeteerPreset,
  setupFilesAfterEnv: ['./setup.ts'],
};
