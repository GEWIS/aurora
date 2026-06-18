import './env';
import { DataSource } from 'typeorm';
import fs from 'fs';
import ServerSetting from './modules/server-settings/server-setting';
import { Entities as BaseEntities } from './modules/root/entities';
import { Entities as AuthEntities } from './modules/auth/entities';
import { Entities as IntegrationEntities } from './modules/auth/integration/entities';
import { Entities as FileEntities } from './modules/files/entities';
import { Entities as AuditEntities } from './modules/audit/entities';
import { Entities as SpotifyEntities } from './modules/spotify/entities';
import { Entities as LightsEntities } from './modules/lights/entities';
import { Entities as TimedEventsEntities } from './modules/timed-events/entities';
import { Entities as PosterEntities } from './modules/handlers/screen/poster/entities';
import { Migrations } from './migrations';

const dataSource = new DataSource({
  host: process.env.TYPEORM_HOST,
  port: parseInt(process.env.TYPEORM_PORT || '3001', 10),
  database: process.env.TYPEORM_DATABASE,
  type: process.env.TYPEORM_CONNECTION as any,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  ...(process.env.TYPEORM_SSL_ENABLED === 'true' && process.env.TYPEORM_SSL_CACERTS
    ? {
        ssl: {
          ca: fs.readFileSync(process.env.TYPEORM_SSL_CACERTS),
        },
      }
    : {}),
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  logging: process.env.TYPEORM_LOGGING === 'true',
  migrations: Migrations,
  extra: {
    authPlugins: {
      mysql_clear_password: () => () => Buffer.from(`${process.env.TYPEORM_PASSWORD}\0`),
    },
  },
  entities: [
    ServerSetting,
    ...TimedEventsEntities,
    ...BaseEntities,
    ...AuthEntities,
    ...IntegrationEntities,
    ...FileEntities,
    ...AuditEntities,
    ...SpotifyEntities,
    ...LightsEntities,
    ...PosterEntities,
  ],
});

export default dataSource;
