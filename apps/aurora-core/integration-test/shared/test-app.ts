import { Express } from 'express';
import supertest, { type Agent as TestAgent } from 'supertest';
import dataSource from '@aurora/database';
import { createServer } from 'http';
import { Server as SocketIoServer } from 'socket.io';
import ServerSettingsStore from '@aurora/modules/server-settings/server-settings-store';
import { EmitterStore } from '@aurora/modules/events';
import { BeatManager } from '@aurora/modules/beats';
import HandlerManager from '@aurora/modules/root/handler-manager';
import httpModule from '@aurora/http';

export interface TestApp {
  app: Express;
  authorizedAgent: TestAgent;
  unauthorizedAgent: TestAgent;
}

export class TestEnvironment {
  private static instance: TestEnvironment | null = null;
  private app: Express | null = null;
  private initPromise: Promise<Express> | null = null;

  private constructor() {}

  public static getInstance(): TestEnvironment {
    if (!TestEnvironment.instance) {
      TestEnvironment.instance = new TestEnvironment();
    }
    return TestEnvironment.instance;
  }

  public async getTestApp(): Promise<TestApp> {
    const appInstance = await this.initTestApp();

    const unauthorizedAgent = supertest.agent(appInstance);
    const authorizedAgent = supertest.agent(appInstance);

    await authorizedAgent
      .post('/api/auth/mock')
      .send({ id: 'john-doe', name: 'John Doe', roles: ['admin'] });

    return {
      app: appInstance,
      authorizedAgent,
      unauthorizedAgent,
    };
  }

  public async initTestApp(): Promise<Express> {
    if (this.app) return this.app;

    // Memoize the initialization promise to resolve concurrent race conditions
    if (!this.initPromise) {
      this.initPromise = (async () => {
        if (!dataSource.isInitialized) {
          await dataSource.initialize();
        }

        await ServerSettingsStore.getInstance().initialize();
        const emitterStore = EmitterStore.getInstance();
        BeatManager.getInstance().init(emitterStore.beatEmitter);

        const app = await httpModule();
        this.app = app;

        const httpServer = createServer(app);
        const io = new SocketIoServer(httpServer);
        HandlerManager.getInstance(io, emitterStore);
        await HandlerManager.getInstance().init();

        return app;
      })();
    }

    return this.initPromise;
  }

  public async destroyTestApp(): Promise<void> {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    this.app = null;
    this.initPromise = null;
    TestEnvironment.instance = null;
  }
}
