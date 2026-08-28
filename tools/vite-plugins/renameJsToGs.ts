import {Plugin} from 'vite';

export default (): Plugin => {
  return {
    name: 'rename-js-to-gs',
    generateBundle(options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith('.js')) {
          const gsName = fileName.replace(/\.js$/, '.gs');
          bundle[gsName] = {...chunk, fileName: gsName};
          delete bundle[fileName];
        }
      }
    },
  };
};
