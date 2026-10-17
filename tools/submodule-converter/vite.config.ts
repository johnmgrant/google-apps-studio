import {defineConfig} from 'vite';
import {resolve} from 'path';
import {builtinModules} from 'node:module';

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
        ...builtinModules,
        /^node:.*/,
      ],
    },
    target: 'node18',
    outDir: 'dist',
    emptyOutDir: true,
  },
});
