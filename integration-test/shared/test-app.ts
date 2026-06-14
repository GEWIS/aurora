import { Express } from 'express';
import { DataSource } from 'typeorm';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

export interface TestApp {
  app: Express;
  authorizedAgent: TestAgent;
  unauthorizedAgent: TestAgent;
}

export class TestEnvironment {
  private static instance: TestEnvironment | null = null;
  private app: Express | null = null;
  private dataSource: DataSource | null = null;
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
        const dbModule = await import('../../src/database');
        this.dataSource = dbModule.default;
        if (!this.dataSource.isInitialized) {
          await this.dataSource.initialize();
        }

        const { default: ServerSettingsStore } =
          await import('../../src/modules/server-settings/server-settings-store');
        await ServerSettingsStore.getInstance().initialize();

        const { default: EmitterStore } = await import('../../src/modules/events/emitter-store');
        const { default: BeatManager } = await import('../../src/modules/beats/beat-manager');
        const emitterStore = EmitterStore.getInstance();
        BeatManager.getInstance().init(emitterStore.beatEmitter);

        const { createServer } = await import('http');
        const { Server: SocketIoServer } = await import('socket.io');
        const { default: HandlerManager } = await import('../../src/modules/root/handler-manager');

        // Temporarily initialize an empty Express instance if httpServer requires it prior to loading httpModule
        const httpModule = await import('../../src/http');
        this.app = await httpModule.default();

        const httpServer = createServer(this.app);
        const io = new SocketIoServer(httpServer);
        HandlerManager.getInstance(io, emitterStore);
        await HandlerManager.getInstance().init();

        return this.app;
      })();
    }

    return this.initPromise;
  }

  public async destroyTestApp(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
    }
    this.dataSource = null;
    this.app = null;
    this.initPromise = null;
    TestEnvironment.instance = null;
  }
}
