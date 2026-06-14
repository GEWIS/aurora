import crypto from 'crypto';

export async function createApiKey(): Promise<string> {
  const db = await import('../../src/database');
  const ApiKey = (await import('../../src/modules/auth/entities/api-key')).default;
  const key = 'test-' + crypto.randomBytes(8).toString('hex');
  await db.default.getRepository(ApiKey).save({ key });
  return key;
}

export async function createIntegrationKey(endpoints: string[]): Promise<string> {
  const db = await import('../../src/database');
  const ds = db.default;

  const IntegrationUser = (
    await import('../../src/modules/auth/integration/entities/integration-user')
  ).default;
  const user = await ds.getRepository(IntegrationUser).save({
    name: 'Test Integration',
    endpoints,
  });

  const ApiKey = (await import('../../src/modules/auth/entities/api-key')).default;
  const key = 'test-int-' + crypto.randomBytes(8).toString('hex');
  await ds.getRepository(ApiKey).save({
    key,
    integrationUser: user,
  });
  return key;
}
