import { defineConfig } from 'histoire'
import { HstVue } from '@histoire/plugin-vue'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [HstVue()],
  setupFile: '/src/histoire-setup.ts',
  storyMatch: ['src/**/*.story.vue'],
  tree: {
    groups: [
      {
        id: 'foundations',
        title: 'Foundations',
      },
      {
        id: 'components',
        title: 'Components',
      },
    ],
  },
  theme: {
    title: 'Wireframe Kit',
    darkClass: 'dark',
    defaultColorScheme: 'light',
  },
  vite: {
    plugins: [vue()],
  },
})
