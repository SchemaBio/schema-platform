const uiKitPreset = require('@schema/ui-kit/tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [uiKitPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui-kit/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
