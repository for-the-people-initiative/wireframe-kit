import type { StorybookConfig } from '@storybook/vue3-vite';
import vue from '@vitejs/plugin-vue';

const config: StorybookConfig = {
  stories: [
    '../src/stories/**/*.mdx',
    '../src/stories/**/*.stories.ts',
  ],
  addons: [
    '@storybook/addon-essentials',
    'storybook-design-token',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Ensure Vue plugin is present
    const hasVuePlugin = config.plugins?.some((p: any) => p && (p.name === 'vite:vue' || (Array.isArray(p) && p[0]?.name === 'vite:vue')));
    if (!hasVuePlugin) {
      config.plugins = config.plugins || [];
      config.plugins.push(vue());
    }
    return config;
  },
};

export default config;
