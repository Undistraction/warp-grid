import { resolve } from 'path'
// eslint-disable-next-line
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    logLevel: `info`,
    build: {
      minify: false,
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, `src/index.ts`),
        name: `Warp Grid`,
        formats: [`es`, `cjs`],
        // Choose names for build artifacts
        fileName: (format) => {
          if (format === `es`) {
            return `index.js`
          }
          if (format === `cjs`) {
            return `index.cjs`
          }
        },
      },
      rollupOptions: {
        external: [`fast-memoize`, `coons-patch`],
      },
    },
    plugins: [
      // Generate a single types file for all our types
      dts({
        // rollupTypes: true,
      }),
    ],
  }
})
