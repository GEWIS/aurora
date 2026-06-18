import { Namespace } from 'socket.io';
import { LightsController } from './entities';
import BaseLightsHandler from '../handlers/base-lights-handler';
import { MusicEmitter } from '../events';
import {
  LightsGroupPars,
  LightsGroupMovingHeadRgbs,
  LightsGroupMovingHeadWheels,
  LightsGroup,
  LightsSwitch,
} from '../lights/entities';
import HandlerManager from './handler-manager';
import { SocketioNamespaces } from '../../socketio-namespaces';
import LightsSwitchManager from './lights-switch-manager';

const DMX_VALUES_LENGTH = 512;

export default class LightsControllerManager {
  /**
   * Mapping of lights controller IDs to their corresponding objects.
   * Used to always use the same (in-memory) lights controller object instance when working with it,
   * as light groups also contain an instance (and a different one in memory for each group)
   * @private
   */
  private lightsControllers: Map<number, LightsController> = new Map();

  /**
   * Mapping from the lights controller ID to its previously sent DMX values
   * @private
   */
  private lightsControllersValues: Map<number, number[]> = new Map();

  /**
   * Timestamp of the previous tick.
   * used to verify whether a light has changed its state and thus a new DMX packet should be created
   * @private
   */
  private previousTick = new Date();

  private constructNewValuesArray(): number[] {
    return new Array(DMX_VALUES_LENGTH).fill(0);
  }

  constructor(
    protected websocket: Namespace,
    protected handlerManager: HandlerManager,
    protected lightsSwitchManager: LightsSwitchManager,
    musicEmitter: MusicEmitter,
    lightControllers: LightsController[] = [],
  ) {
    lightControllers.forEach((c) => {
      this.lightsControllersValues.set(c.id, this.constructNewValuesArray());
    });

    // Tick rate (currently 35Hz)
    setInterval(this.tick.bind(this), Number(process.env.LIGHTS_TICK_INTERVAL) ?? 29);
  }

  /**
   * Get the previous send DMX packet
   * @param controllerId
   * @private
   */
  private getOldValues(controllerId: number): number[] {
    let result = this.lightsControllersValues.get(controllerId);
    if (result === undefined) {
      result = this.constructNewValuesArray();
      this.lightsControllersValues.set(controllerId, result);
    }
    return result;
  }

  /**
   * Returns whether the given packet has not been sent to the DMX controller before
   * @param controllerId ID of the controller to send the packet to
   * @param packet The new packet
   * @private
   */
  private isNewPacket(controllerId: number, packet: number[]): boolean {
    const oldPacket = this.getOldValues(controllerId);
    if (packet.length !== oldPacket.length) return true;

    for (let i = 0; i < packet.length; i += 1) {
      if (packet[i] !== oldPacket[i]) {
        return true;
      }
    }
    return false;
  }

  private get lightsHandlers() {
    return this.handlerManager.getHandlers(LightsGroup) as BaseLightsHandler[];
  }

  private get lightsSwitches(): LightsSwitch[] {
    return this.lightsSwitchManager.getEnabledSwitches();
  }

  /**
   * Given a fixture, the old DMX packet and the new DMX packet,
   * copy the old values to the new packet
   * @param p
   * @param oldValues
   * @param newValues
   * @private
   */
  private reuseOldDmxValues(
    p: LightsGroupPars | LightsGroupMovingHeadRgbs | LightsGroupMovingHeadWheels,
    oldValues: number[],
    newValues: number[],
  ): number[] {
    const oldRelativePacket = oldValues.slice(p.firstChannel - 1, p.firstChannel + 15);
    newValues.splice(p.firstChannel - 1, 16, ...oldRelativePacket);
    return newValues;
  }

  /**
   * Given a fixture, put the new DMX values in the correct spot in the packet
   * @param p
   * @param packet Array of at least 512 integers in the range [0, 255]
   * @private
   */
  private calculateNewDmxValues(
    p: LightsGroupPars | LightsGroupMovingHeadRgbs | LightsGroupMovingHeadWheels,
    packet: number[],
  ) {
    const dmxValues = p.toDmx();

    for (let i = 0; i < dmxValues.length; i++) {
      packet[p.firstChannel - 1 + i] = dmxValues[i];
    }

    return packet;
  }

  /**
   * Given a lights switch, enable that switch in the DMX packet
   * @param lightsSwitch
   * @param packet Array of at least 512 integers in the range [0, 255]
   * @private
   */
  private enableLightsSwitch(lightsSwitch: LightsSwitch, packet: number[]): number[] {
    const c = lightsSwitch.dmxChannel - 1;
    const existingValue = packet[c] || 0;

    // Bitwise OR, as there might be multiple switches on the same DMX channel
    packet[c] = existingValue | lightsSwitch.onValue;

    return packet;
  }

  /**
   *
   * @private
   */
  private sendDMXValuesToController(controllerValues: Map<number, number[]>) {
    controllerValues.forEach((packet, id) => {
      const controller = this.lightsControllers.get(id);
      // Sanity check
      if (!controller) return;

      // Optimization, as we do not need to send the same packets over the network
      if (!this.isNewPacket(id, packet)) return;

      const socketId = controller.getSocketId(this.websocket.name as SocketioNamespaces);
      this.websocket.sockets.get(socketId || '')?.emit('dmx_packet', packet);
    });
  }

  /**
   * Compare the given date with the time of the previous tick
   * @param valuesUpdatedAt
   * @private
   */
  private hasUpdated(valuesUpdatedAt?: Date): boolean {
    if (valuesUpdatedAt === undefined) return true;
    return valuesUpdatedAt > this.previousTick;
  }

  /**
   * Recalculate the DMX channel values of all lights and
   * send them to their respective DMX controllers
   * @private
   */
  private tick() {
    const lightGroups = this.lightsHandlers.map((h) => h.tick());
    const lightsSwitches = this.lightsSwitches;

    // Create a new mapping from DMX controller ID to DMX packet
    const newControllerValues = new Map<number, number[]>();

    lightGroups.flat().forEach((g) => {
      // Update the reference to the controller
      this.lightsControllers.set(g.controller.id, g.controller);

      // Get the old packet, so we can reuse its computed DMX values in case a fixture
      // has not updated itself
      const oldValues = this.getOldValues(g.controller.id);
      // Get the new values, either a packet we have already worked on, or a brand new one
      // consisting of only zeroes.
      let newValues = newControllerValues.get(g.controller.id) ?? this.constructNewValuesArray();

      g.pars.forEach((p) => {
        // Only update fixture in packet if it is in a new state (and thus needs to be updated)
        if (this.hasUpdated(p.fixture.lastUpdate())) {
          newValues = this.calculateNewDmxValues(p, newValues);
        } else {
          newValues = this.reuseOldDmxValues(p, oldValues, newValues);
        }
      });

      g.movingHeadRgbs.forEach((p) => {
        // Only update fixture in packet if it is in a new state (and thus needs to be updated)
        if (this.hasUpdated(p.fixture.lastUpdate())) {
          newValues = this.calculateNewDmxValues(p, newValues);
        } else {
          newValues = this.reuseOldDmxValues(p, oldValues, newValues);
        }
      });

      g.movingHeadWheels.forEach((p) => {
        // Only update fixture in packet if it is in a new state (and thus needs to be updated)
        if (this.hasUpdated(p.fixture.lastUpdate())) {
          newValues = this.calculateNewDmxValues(p, newValues);
        } else {
          newValues = this.reuseOldDmxValues(p, oldValues, newValues);
        }
      });

      // Save the packet in its current state. If other light groups use the same controller,
      // they will fetch this packet again and update it
      newControllerValues.set(g.controller.id, newValues);
    });

    // Turn on the lights switches
    lightsSwitches.forEach((s) => {
      const controllerId = s.controller.id;
      if (!this.lightsControllers.has(controllerId)) {
        // Update the reference to the controller
        this.lightsControllers.set(controllerId, s.controller);
      }

      let newValues = newControllerValues.get(controllerId);
      if (!newValues) {
        newValues = this.constructNewValuesArray();
      }
      newValues = this.enableLightsSwitch(s, newValues);
      newControllerValues.set(controllerId, newValues);
    });

    const controllersToRemove: number[] = [];
    Array.from(this.lightsControllers.keys()).forEach((controllerId) => {
      if (!newControllerValues.has(controllerId)) {
        // If a controller has no active light groups, send only zeroes as a final packet
        newControllerValues.set(controllerId, this.constructNewValuesArray());
        // But after sending the packet, we should remove this controller reference
        controllersToRemove.push(controllerId);
      }
    });

    this.sendDMXValuesToController(newControllerValues);
    // Update the internal state of the lights controller manager
    this.previousTick = new Date();
    this.lightsControllersValues = newControllerValues;

    // If a controller has no active light groups, remove it after sending the packet
    controllersToRemove.forEach((controllerId) => this.lightsControllers.delete(controllerId));
  }
}
