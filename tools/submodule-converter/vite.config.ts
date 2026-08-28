import {defineConfig} from 'vite';
import {resolve} from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        cli: resolve(__dirname, 'src/cli.ts'),
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        '@octokit/rest',
        'chalk',
        'commander',
        'ora',
        'prompts',
        'simple-git',
        /^node:.*/,
      ],
    },
    target: 'node18',
    outDir: 'dist',
    emptyOutDir: true,
  },
});
