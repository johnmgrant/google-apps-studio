import type {Plugin} from 'vite';
import * as prettier from 'prettier';

export default function unwrapIIFE(): Plugin {
  return {
    name: 'unwrap-iife',
    enforce: 'post',
    async generateBundle(_, bundle) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        // Handle both .js and .gs files (in case rename happens first)
        if (
          chunk.type === 'chunk' &&
          (fileName.endsWith('.js') || fileName.endsWith('.gs'))
        ) {
          let code = chunk.code;

          // Remove IIFE wrapper - handle with or without newlines
          code = code.replace(
            /^\s*\(function\s*\(\)\s*\{\s*["']use strict["'];?\s*/,
            ''
          );
          code = code.replace(/\s*\}\)\(\);?\s*$/, '');

          // Remove globalThis assignments (they expose functions globally in Apps Script)
          code = code.replace(/\s*globalThis\.\w+\s*=\s*\w+;\s*/g, '');

          // Format with prettier
          const formatted = await prettier.format(code, {
            parser: 'babel',
            singleQuote: false,
            trailingComma: 'es5',
          });

          chunk.code = formatted;
        }
      }
    },
  };
}
