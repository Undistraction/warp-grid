import { resolve } from 'path'
// eslint-disable-next-line
import { defineConfig } from 'vite'

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    build: {
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, 'src/index.js'),
        name: 'coons-patch',
        // the phtmlroper extensions will be added
        fileName: 'coons-patch',
        formats: ['es', 'cjs', 'umd'],
      },
    },
  }
})
