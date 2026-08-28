/**
 * Custom processor to detect ts-node shebang scripts
 */
const tsNodeShebangProcessor = {
  meta: {
    name: 'ts-node-shebang-processor',
    version: '1.0.0',
  },
  supportsAutofix: true,
  preprocess(text: string, filename: string) {
    // Check if file has ts-node shebang
    if (text.startsWith('#!/usr/bin/env ts-node')) {
      // Mark this file for special handling by adding a custom comment
      return [{text, filename}];
    }
    return [text];
  },
  postprocess(messages: string[][]) {
    return messages[0] || [];
  },
};

export {tsNodeShebangProcessor};
