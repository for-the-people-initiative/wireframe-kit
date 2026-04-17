import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

const wireframeTheme = create({
  base: 'light',
  brandTitle: 'Wireframe Design System',

  // Colors (wireframe aesthetic: monochrome ink)
  colorPrimary: '#171717',
  colorSecondary: '#525252',

  // UI
  appBg: '#fafafa',
  appContentBg: '#ffffff',
  appBorderColor: '#e5e5e5',
  appBorderRadius: 8,

  // Text
  textColor: '#171717',
  textInverseColor: '#ffffff',
  textMutedColor: '#737373',

  // Toolbar
  barTextColor: '#737373',
  barSelectedColor: '#171717',
  barBg: '#ffffff',
  barHoverColor: '#171717',

  // Form
  inputBg: '#ffffff',
  inputBorder: '#d4d4d4',
  inputTextColor: '#171717',
  inputBorderRadius: 5,

  // Font (Storybook chrome uses neutral sans; handwriting is only for component previews)
  fontBase: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, monospace',
});

addons.setConfig({
  theme: wireframeTheme,
});
