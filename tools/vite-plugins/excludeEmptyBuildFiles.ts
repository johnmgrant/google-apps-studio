import {Plugin} from 'vite';

export default (): Plugin => {
  return {
    name: 'exclude-empty-files',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk') {
          // Remove chunks that are empty or only contain whitespace/comments
          const code = chunk.code.trim();
          const codeWithoutComments = code
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/\/\/.*/g, '') // Remove line comments
            .trim();

          if (!codeWithoutComments || codeWithoutComments.length === 0) {
            delete bundle[fileName];
          }
        }
      }
    },
  };
};
