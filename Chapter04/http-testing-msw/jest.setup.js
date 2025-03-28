import '@testing-library/jest-dom';
import { server } from './src/mocks/node';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
      
setupZoneTestEnv();

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})