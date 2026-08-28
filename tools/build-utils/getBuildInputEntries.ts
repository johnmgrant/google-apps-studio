import {globSync} from 'glob';
import {relative, resolve} from 'node:path';
import type {BuildEnvironmentOptions} from 'vite';

type RollupOptions = Extract<
  Exclude<BuildEnvironmentOptions['rollupOptions'], undefined>['input'],
  string[] | Record<string, string>
>;

// Automatically collect all TypeScript files and map them to output paths
const getBuildInputEntries = (
  baseDir: string,
  globPattern: string = 'src/**/*.ts',
  relativeToDir: string = 'src'
) =>
  Object.fromEntries(
    globSync(globPattern, {cwd: baseDir})
      .filter((file) => !file.includes('/models/'))
      .map((file) => {
        // Remove 'src/' prefix and '.ts' extension to get the output path
        const outputPath = relative(relativeToDir, file).replace(/\.ts$/, '');
        return [outputPath, resolve(baseDir, file)];
      })
  ) as RollupOptions;

export default getBuildInputEntries;
