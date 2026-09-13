import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

expect.extend({
  toBeInferred(received: unknown) {
    const pass = received !== null && received !== undefined;
    return {
      pass,
      message: () =>
        pass
          ? 'expected element not to be inferred'
          : 'expected element to be inferred',
    };
  },
});

declare module 'vitest' {
  interface Assertion<R, T> extends TestingLibraryMatchers<any, T> {
    toBeInferred(): R;
  }
}
