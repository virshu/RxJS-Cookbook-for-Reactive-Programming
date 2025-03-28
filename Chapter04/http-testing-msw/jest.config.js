module.exports = {
    preset: 'jest-preset-angular',
    testEnvironment: 'jest-fixed-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironmentOptions: {
      customExportConditions: [''],
    },
    globals: {
      Request,
      Response,
      TextEncoder,
      TextDecoder,
    },
}