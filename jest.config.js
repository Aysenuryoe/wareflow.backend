/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testTimeout: 50000,
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,js,jsm,tsx,jsx,tsm}'],
  coverageReporters: ["text", "clover"], // "cobertura" for gitlab merge requests, "clover" for grading, "text" for console
  reporters: [
    "default",
    ["jest-junit", { suiteNameTemplate: "{filename}" }],
  ],
  setupFilesAfterEnv: ["jest-extended/all"],
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],
  coveragePathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/", "<rootDir>/tests/"],
  moduleNameMapper: {
    "^tests/(.*)$": "<rootDir>/tests/$1"
  }
};