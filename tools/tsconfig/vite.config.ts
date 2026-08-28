import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {viteStaticCopy} from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
  plugins: [
    dts({
      entryRoot: 'src',
      outDirs: ['dist'],
      tsconfigPath: 'tsconfig.json',
      insertTypesEntry: true,
    }),
    viteStaticCopy({
      targets: [
        // Root-level JSON config files for simple extends: "@johnmgrant/configs/tsconfig/node"
        {
          src: 'src/configs/node.json',
          dest: '.',
          rename: {stripBase: true, name: 'node.json'},
        },
        {
          src: 'src/configs/base.json',
          dest: '.',
          rename: {stripBase: true, name: 'base.json'},
        },
        {
          src: 'src/configs/eslint.json',
          dest: '.',
          rename: {stripBase: true, name: 'eslint.json'},
        },
        {
          src: 'src/configs/test.json',
          dest: '.',
          rename: {stripBase: true, name: 'test.json'},
        },
        {
          src: 'src/configs/project.json',
          dest: '.',
          rename: {stripBase: true, name: 'project.json'},
        },
        {
          src: 'src/configs/strict-type-checking.json',
          dest: '.',
          rename: {stripBase: true, name: 'strict-type-checking.json'},
        },

        // Directory variants for extends: "@johnmgrant/configs/tsconfig/node/tsconfig.json"
        {
          src: 'src/configs/node.json',
          dest: 'node',
          rename: {stripBase: true, name: 'tsconfig.json'},
        },
        {
          src: 'src/configs/base.json',
          dest: 'base',
          rename: {stripBase: true, name: 'tsconfig.json'},
        },
        {
          src: 'src/configs/eslint.json',
          dest: 'eslint',
          rename: {stripBase: true, name: 'tsconfig.json'},
        },
        {
          src: 'src/configs/test.json',
          dest: 'test',
          rename: {stripBase: true, name: 'tsconfig.json'},
        },
        {
          src: 'src/configs/project.json',
          dest: 'project',
          rename: {stripBase: true, name: 'tsconfig.json'},
        },
        {
          src: 'src/configs/strict-type-checking.json',
          dest: 'strict-type-checking',
          rename: {stripBase: true, name: 'tsconfig.json'},
        },
      ],
    }),
  ],
});
