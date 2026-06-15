import crypto from 'crypto';
import dataSource from '@aurora/database';
import integrationUser from '@aurora/modules/auth/integration/entities/integration-user';
import apiKey from '@aurora/modules/auth/entities/api-key';

export async function createApiKey(): Promise<string> {
  const { default: apiKey } = await import('@aurora/modules/auth/entities/api-key');
  const key = 'test-' + crypto.randomBytes(8).toString('hex');
  await dataSource.getRepository(apiKey).save({ key });
  return key;
}

export async function createIntegrationKey(endpoints: string[]): Promise<string> {
  const user = await dataSource.getRepository(integrationUser).save({
    name: 'Test Integration',
    endpoints,
  });

  const key = 'test-int-' + crypto.randomBytes(8).toString('hex');
  await dataSource.getRepository(apiKey).save({
    key,
    integrationUser: user,
  });
  return key;
}
