import { defineSetupVue3 } from '@histoire/plugin-vue';
import './scss/fonts.scss';
import '../dist/css/tokens.css';
import './scss/wireframe.scss';
import { vRough } from './directives/rough';

export const setupVue3 = defineSetupVue3(({ app }) => {
  app.directive('rough', vRough);
});
