/* eslint-disable no-undef */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};
