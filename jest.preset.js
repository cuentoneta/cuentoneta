import nxPreset from '@nx/jest/preset.js';

export default {
  ...nxPreset,
  // Explicitly setting JSDOM as the test environment.
  // This ensures consistency when testing DOM-heavy components or libraries like @a11y-ngx/tooltip,
  // even if 'jsdom' is often the default for Angular presets, aligning with potential JSDOM configuration needs.
  testEnvironment: 'jsdom',
};