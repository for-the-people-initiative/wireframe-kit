import type { App } from 'vue';
import { vRough } from './directives/rough';

export const WireframePlugin = {
  install(app: App) {
    app.directive('rough', vRough);
  },
};

export { vRough };
export type { RoughValue } from './directives/rough';
