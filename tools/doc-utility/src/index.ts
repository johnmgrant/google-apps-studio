#!/usr/bin/env node
import {Command} from 'commander';
import {createDoc} from './commands/create.js';
import {updateDocs} from './commands/update.js';
import {validateDocs} from './commands/validate.js';

const program = new Command();

program
  .name('doc-utility')
  .description('CLI tool for managing project documentation')
  .version('0.1.0');

program
  .command('create')
  .description('Create a new documentation file from a template')
  .argument('<type>', 'Document type (guide, adr, api)')
  .argument('<name>', 'Document name (will be slugified)')
  .option('-d, --dir <directory>', 'Target directory', 'docs')
  .action(createDoc);

program
  .command('update')
  .description('Update modified dates in documentation frontmatter')
  .argument('[paths...]', 'Specific files or directories to update', ['docs'])
  .action(updateDocs);

program
  .command('validate')
  .description('Validate all documentation files have required metadata')
  .argument('[paths...]', 'Specific files or directories to validate', ['docs'])
  .option('--fix', 'Attempt to fix issues automatically')
  .action(validateDocs);

program.parse();
