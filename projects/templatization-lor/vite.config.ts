import {mergeConfig} from 'vite';
import checker from 'vite-plugin-checker';
import getBuildInputEntries from '../../tools/build-utils/getBuildInputEntries';
import viteAppsScriptBaseConfig from '../../tools/build-utils/viteAppsScriptBaseConfig';
import copyAppsScriptToBuild from '../../tools/vite-plugins/copyAppsscriptToBuild';
import excludeEmptyBuildFiles from '../../tools/vite-plugins/excludeEmptyBuildFiles';
import renameJsToGs from '../../tools/vite-plugins/renameJsToGs';

// Automatically collect all TypeScript files and map them to output paths
viteAppsScriptBaseConfig.build!.rollupOptions!.input =
  getBuildInputEntries(__dirname);

export default mergeConfig(viteAppsScriptBaseConfig, {
  plugins: [
    checker({typescript: true}),
    renameJsToGs(),
    copyAppsScriptToBuild(),
    excludeEmptyBuildFiles(),
  ],
});
