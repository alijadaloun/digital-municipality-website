import '@testing-library/jest-dom/vitest';

// JSDOM doesn't implement scrollIntoView (used in some pages)
Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  value: () => {},
  writable: true,
});

