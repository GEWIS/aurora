import { generateSpec } from 'tsoa';
import { readFile, rm, mkdtemp } from 'fs/promises';
import { resolve, join } from 'path';
import { tmpdir } from 'os';

async function validateSpecification(activeDirectory: string, outputDirectory: string) {
  try {
    const currentSpecification = await readFile(join(activeDirectory, 'openapi.json'), 'utf8');
    const generatedSpecification = await readFile(join(outputDirectory, 'openapi.json'), 'utf8');

    if (currentSpecification !== generatedSpecification) {
      throw new Error('Generated specification does not match the current specification.');
    }
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
}

async function generateSpecification() {
  const configurationContent = await readFile(resolve('tsoa.json'), 'utf8');
  const configuration = JSON.parse(configurationContent);

  const activeDirectory = resolve('../../libs/aurora-api-client');
  const requiresValidation = process.argv.includes('--check');

  const outputDirectory = requiresValidation
    ? await mkdtemp(join(tmpdir(), 'tsoa_spec_check_'))
    : activeDirectory;

  await generateSpec({ ...configuration, ...configuration.spec, outputDirectory });

  if (requiresValidation) {
    await validateSpecification(activeDirectory, outputDirectory);
  }
}

async function sync() {
  await generateSpecification();
}

sync()
  .then(() => {
    console.log('Sync completed successfully.');
  })
  .catch((error) => {
    console.error('Sync failed:', error.message);
    process.exit(1);
  });
