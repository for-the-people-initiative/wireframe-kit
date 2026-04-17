import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import '../dist/css/tokens.css';
import '../src/scss/fonts.scss';
import '../src/scss/wireframe.scss';
import { vRough } from '../src/directives/rough';

setup((app) => {
  app.directive('rough', vRough);
});

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'paper',
      values: [
        { name: 'paper', value: '#ffffff' },
        { name: 'dark', value: '#0a0e1f' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
