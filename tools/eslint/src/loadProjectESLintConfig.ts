import {glob} from 'glob';
import {existsSync} from 'node:fs';
import {ConfigArray} from 'typescript-eslint';

const tryGetFlatConfigPaths = async (
  projectPath: string,
  configTypes: ('mjs' | 'ts')[] = ['mjs', 'ts']
): Promise<string[]> => {
  const foundPaths: string[] = [];
  // Glob Search the config beneath the projectPath
  for (const configType of configTypes) {
    const pattern = `${projectPath}/**/eslint.config.${configType}`;
    const paths = await glob(pattern, {absolute: true});
    if (paths.length > 0) {
      foundPaths.push(paths[0]);
      break;
    }
  }

  return foundPaths;
};

/**
 * Use the Web-OneFrontend project's ESLint config for files inside its directory
 * This ensures local project rules take precedence for that submodule
 * @param {string} projectPath - The path to the project submodule.
 * @param {'mjs' | 'ts'} [configType='mjs'] - The config file type to look for.
 * @returns The scoped ESLint config entries
 */
const loadProjectESLintFlatConfig = async (
  projectPath: string,
  configType: 'mjs' | 'ts' = 'mjs'
) => {
  // Return early if submodule directory doesn't exist
  if (!existsSync(projectPath)) {
    return [];
  }

  try {
    const configPaths = await tryGetFlatConfigPaths(projectPath, [configType]);
    if (configPaths.length === 0) {
      return [];
    }

    const mod = await import(new URL(configPaths[0], import.meta.url).href);
    const importedConfigs = Array.isArray(mod.default)
      ? (mod.default as ConfigArray)
      : ([mod.default] as ConfigArray);
    // Scope all imported config entries to the submodule directory
    return importedConfigs.map((cfg) => {
      const files = Array.isArray(cfg.files) ? cfg.files : ['**/*'];
      const scopedFiles = files.map((pattern) =>
        Array.isArray(pattern)
          ? pattern.map((p) => `${projectPath}/${p}`)
          : `${projectPath}/${pattern}`
      );
      return {...cfg, files: scopedFiles};
    });
  } catch {
    // If the submodule config isn't available, do nothing (non-breaking)
    return [];
  }
};

export {loadProjectESLintFlatConfig};
