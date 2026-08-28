import type {UserConfig} from 'vite';

export default {
  build: {
    outDir: 'build',
    minify: false,
    rollupOptions: {
      input: {},
      output: {
        entryFileNames: '[name].js',
        format: 'es',
        // Disable code splitting to keep each entry independent
        inlineDynamicImports: false,
        manualChunks: undefined,
      },
      treeshake: false,
      // Prevent Rollup from watching dependencies between entries
      preserveEntrySignatures: 'strict',
    },
  },
} as UserConfig;
