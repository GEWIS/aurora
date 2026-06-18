import { createClient } from '@hey-api/openapi-ts';
import { exec } from 'child_process';
import { promisify } from 'util';
import { rm, mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import configurationPromise from '../openapi-ts.config.ts';

const executeCommand = promisify(exec);

async function validateClient(originalOutput: string, outputDirectory: string) {
  try {
    await executeCommand(`diff -rq ${originalOutput} ${outputDirectory}`);
  } catch {
    throw new Error('Generated client does not match the current client.');
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
}

async function generateClient() {
  const configuration = await configurationPromise;
  const requiresValidation = process.argv.includes('--check');

  const originalOutput =
    typeof configuration.output === 'string' ? configuration.output : configuration.output?.path;

  const outputDirectory = requiresValidation
    ? await mkdtemp(join(tmpdir(), 'openapi-client-check-'))
    : originalOutput;

  await createClient({
    ...configuration,
    output:
      typeof configuration.output === 'string'
        ? outputDirectory
        : { ...configuration.output, path: outputDirectory },
  });

  if (requiresValidation) {
    await validateClient(originalOutput, outputDirectory);
  }
}

async function sync() {
  await generateClient();
}

sync()
  .then(() => {
    console.log('Sync completed successfully.');
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
