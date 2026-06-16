/**
 * This file performs validation on the compile-time configuration of Aurora.
 */
import * as process from 'node:process';
import tapes, { validateTape, MixTape } from './modules/modes/centurion/tapes';

let exitCode = 0;

/**
 * Validate that all Centurion tapes do not contain simple copy-paste errors
 * @param tapes
 */
function validateCenturionTapes(tapes: MixTape[]) {
  console.info('Validate Centurion tapes...');
  tapes.forEach((t) => {
    try {
      validateTape(t);
    } catch (e: any) {
      console.error(e);
      exitCode = 1;
    }
  });
}

// Perform validations
validateCenturionTapes(tapes);

if (exitCode === 0) {
  console.info('Validation successful.');
}

// Exit the program. Uses exit code 0 (OK) by default, but 1 if some validation failed.
process.exit(exitCode);
