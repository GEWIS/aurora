import { defineStore } from 'pinia';
import {
  applyLightsEffectColor,
  applyLightsEffectMovement,
  createPredefinedLightsEffect,
  deletePredefinedLightsEffect,
  disableStrobeOnLightsGroup,
  enableStrobeOnLightsGroup,
  getAllLightsSwitches,
  getAllPredefinedLightsEffects,
  type LightsButtonSwitch,
  type LightsEffectsColorCreateParams,
  type LightsEffectsMovementCreateParams,
  type LightsGroupResponse,
  type LightsPredefinedEffectCreateParams,
  type LightsPredefinedEffectResponse,
  type LightsPredefinedEffectUpdateParams,
  type LightsSwitchResponse,
  RgbColor,
  turnOffLightsSwitch,
  turnOnLightsSwitch,
  updateLightsEffectColorColors,
  updatePredefinedLightsEffect,
} from '@/api';
import { useHandlersStore } from '@/stores/handlers.store';

interface PushedEffect {
  timestamp: Date;
  lightGroupIds: number[];
  colorEffect?: LightsEffectsColorCreateParams;
  movementEffect?: LightsEffectsMovementCreateParams;
}

interface LightsSwitch extends LightsSwitchResponse {
  enabled: boolean;
}

interface EffectsControllerStore {
  // Simple effects controller
  lightsSwitches: LightsSwitch[];
  buttonEffects: LightsPredefinedEffectResponse[];
  currentColors: RgbColor[];
  loading: boolean;

  // Advanced effects controller
  selectedLightsGroupIds: number[];
  pastPushedEffects: PushedEffect[];
}

export const useEffectsControllerStore = defineStore('effectsController', {
  state: (): EffectsControllerStore => ({
    lightsSwitches: [],
    buttonEffects: [],
    currentColors: [],
    loading: true,

    selectedLightsGroupIds: [],
    pastPushedEffects: [],
  }),
  getters: {},
  actions: {
    async init() {
      await Promise.all([this.getLightsSwitches(), this.getButtonEffects()]);
      this.loading = true;
    },
    toggleLightsGroup(id: number) {
      const index = this.selectedLightsGroupIds.findIndex((g) => g === id);
      if (index < 0) {
        this.selectedLightsGroupIds.push(id);
      } else {
        this.selectedLightsGroupIds.splice(index, 1);
      }
    },
    selectAllLightsGroups(groups: LightsGroupResponse[]) {
      this.selectedLightsGroupIds = groups.map((g) => g.id);
    },
    resetLightsGroupSelection() {
      this.selectedLightsGroupIds = [];
    },
    lightsGroupHasSetEffectsHandler(id: number) {
      const store = useHandlersStore();
      const registeredLights = store.getRegisteredLights('SetEffectsHandler');
      const ids = registeredLights.map((l) => l.id);
      return ids.includes(id);
    },
    async setColorEffect(effect: LightsEffectsColorCreateParams, lightGroupIds?: number[]) {
      let ids = lightGroupIds ?? this.selectedLightsGroupIds;
      // Only send request for lights groups that have the correct handler (prevents 4xx errors)
      ids = ids.filter(this.lightsGroupHasSetEffectsHandler.bind(this));
      await Promise.all([
        ids.map(async (id) => {
          await applyLightsEffectColor({
            body: [effect],
            path: { id },
          });
        }),
      ]);
      const pastEffect: PushedEffect = {
        colorEffect: { ...effect },
        lightGroupIds: [...ids],
        timestamp: new Date(),
      };
      this.pastPushedEffects = [pastEffect, ...this.pastPushedEffects.slice(0, 9)];
    },
    async setMovementEffect(effect: LightsEffectsMovementCreateParams, lightGroupIds?: number[]) {
      let ids = lightGroupIds ?? this.selectedLightsGroupIds;
      // Only send request for lights groups that have the correct handler (prevents 4xx errors)
      ids = ids.filter(this.lightsGroupHasSetEffectsHandler.bind(this));
      await Promise.all([
        ids.map(async (id) => {
          await applyLightsEffectMovement({
            body: [effect],
            path: { id },
          });
        }),
      ]);
      const pastEffect: PushedEffect = {
        movementEffect: { ...effect },
        lightGroupIds: [...ids],
        timestamp: new Date(),
      };
      this.pastPushedEffects = [pastEffect, ...this.pastPushedEffects.slice(0, 9)];
    },
    async enableStrobe(lightGroupIds?: number[]) {
      let ids = lightGroupIds ?? this.selectedLightsGroupIds;
      // Only send request for lights groups that have the correct handler (prevents 4xx errors)
      ids = ids.filter(this.lightsGroupHasSetEffectsHandler.bind(this));
      await Promise.all(
        ids.map((id) => {
          return enableStrobeOnLightsGroup({
            path: { id },
          });
        }),
      );
    },
    async disableStrobe(lightGroupIds?: number[]) {
      let ids = lightGroupIds ?? this.selectedLightsGroupIds;
      // Only send request for lights groups that have the correct handler (prevents 4xx errors)
      ids = ids.filter(this.lightsGroupHasSetEffectsHandler.bind(this));
      await Promise.all(
        ids.map((id) => {
          return disableStrobeOnLightsGroup({
            path: { id },
          });
        }),
      );
    },
    /**
     * Remove all color effects from the given fixtures.
     * Uses "selectedLightsGroupIds if none given"
     */
    async disableLightsColors(lightGroupIds?: number[]) {
      let ids = lightGroupIds ?? this.selectedLightsGroupIds;
      // Only send request for lights groups that have the correct handler (prevents 4xx errors)
      ids = ids.filter(this.lightsGroupHasSetEffectsHandler.bind(this));
      await Promise.all(
        ids.map((id) => {
          return applyLightsEffectColor({
            body: [],
            path: { id },
          });
        }),
      );
    },
    /**
     * Remove all movement effects from the given fixtures.
     * Uses "selectedLightsGroupIds if none given"
     */
    async disableLightsMovement(lightGroupIds?: number[]) {
      let ids = lightGroupIds ?? this.selectedLightsGroupIds;
      // Only send request for lights groups that have the correct handler (prevents 4xx errors)
      ids = ids.filter(this.lightsGroupHasSetEffectsHandler.bind(this));
      await Promise.all(
        ids.map((id) => {
          return applyLightsEffectMovement({
            body: [],
            path: { id },
          });
        }),
      );
    },
    async turnOnLightsSwitch(id: number) {
      await turnOnLightsSwitch({ path: { id } });
      const index = this.lightsSwitches.findIndex((s) => s.id === id);
      if (index >= 0) {
        this.lightsSwitches[index].enabled = true;
      }
    },
    async turnOnLightsSwitches(ids: number[]) {
      await Promise.all(ids.map((id) => turnOnLightsSwitch({ path: { id } })));
    },
    async turnOffLightsSwitch(id: number) {
      await turnOffLightsSwitch({ path: { id } });
      const index = this.lightsSwitches.findIndex((s) => s.id === id);
      if (index >= 0) {
        this.lightsSwitches[index].enabled = false;
      }
    },
    async turnOffLightsSwitches(ids: number[]) {
      await Promise.all(ids.map((id) => turnOffLightsSwitch({ path: { id } })));
    },
    async getLightsSwitches() {
      const response = await getAllLightsSwitches();
      if (!response.response.ok || !response.data) {
        return;
      }

      this.lightsSwitches = response.data.map((r) => ({ ...r, enabled: false }));
      const response2 = await getAllLightsSwitches({ query: { enabled: true } });
      if (!response2.response.ok || !response2.data) {
        return;
      }
      response2.data?.forEach((s) => {
        const index = this.lightsSwitches.findIndex((s2) => s.id === s2.id);
        if (index >= 0) this.lightsSwitches[index].enabled = true;
      });
    },
    createNullButtonEffect(buttonId: number): LightsPredefinedEffectResponse {
      return {
        id: -1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        buttonId,
        properties: {
          type: 'LightsButtonNull',
        },
      };
    },
    async getButtonEffects() {
      const response = await getAllPredefinedLightsEffects();
      if (response.response.ok && response.data) {
        this.buttonEffects = response.data;
      }
      this.buttonEffects.sort((a, b) => a.buttonId - b.buttonId);
      for (let i = 0; i < 64; i++) {
        if (this.buttonEffects[i]?.buttonId !== i + 1) {
          this.buttonEffects.splice(i, 0, this.createNullButtonEffect(i + 1));
        }
      }
    },
    async createButtonEffect(params: LightsPredefinedEffectCreateParams) {
      const response = await createPredefinedLightsEffect({ body: params });
      if (response.response.ok && response.data) {
        const index = this.buttonEffects.findIndex((e) => e.buttonId === response.data.buttonId);
        if (index >= 0) {
          this.buttonEffects.splice(index, 1, response.data);
        } else {
          this.buttonEffects.push(response.data);
          this.buttonEffects.sort((a, b) => a.buttonId - b.buttonId);
        }
      }
    },
    async updateButtonEffect(id: number, body: LightsPredefinedEffectUpdateParams) {
      const response = await updatePredefinedLightsEffect({ path: { id }, body });
      if (response.response.ok && response.data) {
        const index = this.buttonEffects.findIndex((g) => g.id === id);
        this.buttonEffects.splice(index, 1, response.data);
      }
    },
    async deleteButtonEffect(id: number) {
      const response = await deletePredefinedLightsEffect({ path: { id } });
      if (response.response.ok) {
        const index = this.buttonEffects.findIndex((g) => g.id === id);
        const oldEffect = this.buttonEffects[index];
        this.buttonEffects.splice(index, 1, this.createNullButtonEffect(oldEffect.buttonId));
      }
    },
    async onEffectButtonPress(button: LightsPredefinedEffectResponse) {
      switch (button.properties.type) {
        case 'LightsButtonStrobe': {
          await this.enableStrobe(button.properties.lightsGroupIds);
          return;
        }
      }
    },
    async onEffectButtonRelease(button: LightsPredefinedEffectResponse) {
      switch (button.properties.type) {
        case 'LightsButtonColors': {
          const properties = button.properties;
          this.currentColors = properties.colors;

          let ids = button.properties.lightsGroupIds || [];
          // Only send request for lights groups that have the correct handler (prevents 4xx errors)
          ids = ids.filter(this.lightsGroupHasSetEffectsHandler.bind(this));
          await Promise.all(
            ids.map(async (id) => {
              await updateLightsEffectColorColors({ path: { id }, body: { colors: properties.colors } });
            }),
          );

          return;
        }
        case 'LightsButtonEffectColor': {
          const body: LightsEffectsColorCreateParams = button.properties.effectProps;
          if ('colors' in body.props) {
            body.props.colors = this.currentColors;
          }
          await this.setColorEffect(body, button.properties.lightsGroupIds);
          return;
        }
        case 'LightsButtonEffectMovement': {
          await this.setMovementEffect(button.properties.effectProps, button.properties.lightsGroupIds);
          return;
        }
        case 'LightsButtonReset': {
          await Promise.all([
            this.disableLightsColors(button.properties.lightsGroupIds),
            this.disableLightsMovement(button.properties.lightsGroupIds),
          ]);
          return;
        }
        case 'LightsButtonStrobe': {
          await this.disableStrobe(button.properties.lightsGroupIds);
          return;
        }
        case 'LightsButtonSwitch': {
          const lightsSwitches = this.lightsSwitches.filter((s) =>
            (button.properties as LightsButtonSwitch).switchIds.includes(s.id),
          );
          await Promise.all(
            lightsSwitches.map(async (lightsSwitch) => {
              if (lightsSwitch.enabled) {
                await this.turnOffLightsSwitch(lightsSwitch.id);
              } else {
                await this.turnOnLightsSwitch(lightsSwitch.id);
              }
            }),
          );
        }
      }
    },
    async onEffectButtonCancel(button: LightsPredefinedEffectResponse) {
      switch (button.properties.type) {
        case 'LightsButtonStrobe': {
          await this.disableStrobe(button.properties.lightsGroupIds);
          return;
        }
      }
    },
    areSelectedColors(colors: RgbColor[]): boolean {
      if (this.currentColors.length !== colors.length) {
        return false;
      }

      for (let i = 0; i < colors.length; i++) {
        // Colors should be in the same order
        if (this.currentColors[i] !== colors[i]) return false;
      }

      return true;
    },
  },
});

export { type PushedEffect };
