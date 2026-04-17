import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { resolve } from 'path'
import { readdirSync, statSync, existsSync } from 'fs'

// Get all component directories that have a matching .vue file
const componentsDir = resolve(__dirname, 'src/components')
const componentDirs = readdirSync(componentsDir)
  .filter(dir => {
    const dirPath = resolve(componentsDir, dir)
    const vueFile = resolve(dirPath, `${dir}.vue`)
    return statSync(dirPath).isDirectory() && existsSync(vueFile)
  })

// Create entry points for each component
const entries: Record<string, string> = {}
componentDirs.forEach(dir => {
  const vueFile = resolve(componentsDir, dir, `${dir}.vue`)
  entries[`components/${dir}/index`] = vueFile
})

// Add types entry
entries['types/index'] = resolve(__dirname, 'src/types/index.ts')

// Add composables entry
entries['composables/index'] = resolve(__dirname, 'src/composables/index.ts')

// Add plugin entry (registers v-rough directive globally)
entries['plugin/index'] = resolve(__dirname, 'src/plugin.ts')

export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin({ relativeCSSInjection: true })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    lib: {
      entry: entries,
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      external: ['vue', 'chart.js', 'roughjs', 'roughjs/bin/rough'],
      output: {
        preserveModules: false,
        assetFileNames: (assetInfo) => {
          // Put CSS files next to their component
          if (assetInfo.name?.endsWith('.css')) {
            return 'components/[name]/style.css'
          }
          return 'assets/[name][extname]'
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: false,
    cssCodeSplit: true,
    minify: false
  }
})
