import fs from 'fs';
import path from 'path';
import {Plugin, ResolvedConfig} from 'vite';

export default (): Plugin => {
  let config: ResolvedConfig;

  return {
    name: 'copy-appsscript-json-to-build',
    apply: 'build' as const,
    enforce: 'pre' as const,
    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig;
    },
    async writeBundle() {
      const configDir = config.root;
      const tsconfigPath = path.join(configDir, 'tsconfig.json');
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      const outDir = tsconfig.compilerOptions.outDir;
      const file = 'appsscript.json';
      const dest = path.join(outDir, file);
      fs.mkdirSync(path.dirname(dest), {recursive: true});
      fs.copyFileSync(file, dest);
    },
  };
};
