module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  testMatch: ['**/*.(test|spec).(ts|tsx)'],
  coveragePathIgnorePatterns: ['dist/'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  }
}
