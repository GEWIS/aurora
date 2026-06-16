import { Namespace } from 'socket.io';
import { MusicEmitter } from '../events';
import { BackofficeSyncEmitter } from '../events/backoffice-sync-emitter';
import EmitterStore from '../events/emitter-store';

export function initBackofficeSynchronizer(socket: Namespace, emitterStore: EmitterStore) {
  emitterStore.musicEmitter.on('beat', (event) => {
    socket.emit('beat', event);
  });
  emitterStore.musicEmitter.on('change_track', (event) => {
    socket.emit('change_track', event);
  });
  emitterStore.backofficeSyncEmitter.on('*', (eventName: string, ...args: any[]) => {
    socket.emit(eventName, ...args);
  });
  emitterStore.orderEmitter.on('orders', (event) => {
    socket.emit('orders', event);
  });
}

export function initBackofficeBeatSynchronizer(socket: Namespace, emitterStore: EmitterStore) {
  emitterStore.beatEmitter.on('beat', (event) => {
    socket.emit('beat', event);
  });
  emitterStore.beatEmitter.on('generator_add', (event) => {
    socket.emit('generator_add', event);
  });
  emitterStore.beatEmitter.on('generator_remove', (event) => {
    socket.emit('generator_remove', event);
  });
}
