import { LightsScene } from '../../lights/entities/scenes';
import EffectsHandler from './effects-handler';
import { LIGHTS_EFFECTS_COLOR } from '../../lights/effects/color';
import { databaseEffectToObject } from './database-effects-helper';
import { LIGHTS_EFFECTS_MOVEMENT } from '../../lights/effects/movement';
import { LightsGroup } from '../../lights/entities';

export class ScenesHandler extends EffectsHandler {
  /**
   * ID of the scene that is currently applied, if any
   */
  private activeSceneId: number | null = null;

  tick(): LightsGroup[] {
    return super.tick();
  }

  getActiveSceneId(): number | null {
    return this.activeSceneId;
  }

  // Without any lights groups, no scene can be active
  public removeEntity(entityCopy: LightsGroup) {
    super.removeEntity(entityCopy);
    if (this.entities.length === 0) this.activeSceneId = null;
  }

  applyScene(scene: LightsScene): void {
    this.clearScene();
    this.activeSceneId = scene.id;

    const groupMap = new Map<number, LightsGroup>();
    const groupEffectsMap = new Map<number, { effectName: string; effectProps: string }[]>();
    scene.effects.forEach(({ group: groupCopy, effectProps, effectName }) => {
      // Make sure we have exactly one copy of each group object.
      // Duplicate group copies behave as different objects.
      const group = this.entities.find((e) => e.id === groupCopy.id);
      if (!group) return;
      if (!groupMap.has(group.id)) groupMap.set(group.id, group);

      if (groupEffectsMap.has(group.id)) {
        groupEffectsMap.get(group.id)?.push({ effectName, effectProps });
      } else {
        groupEffectsMap.set(group.id, [{ effectName, effectProps }]);
      }
    });

    const lightsEffectsColorNames = LIGHTS_EFFECTS_COLOR.map((e) => e.name);
    const lightsEffectsMovementNames = LIGHTS_EFFECTS_MOVEMENT.map((e) => e.name);

    groupEffectsMap.forEach((effects, groupId) => {
      const group = groupMap.get(groupId)!;

      const effectObjs = effects
        .filter(({ effectName }) => lightsEffectsColorNames.includes(effectName as any))
        .map(({ effectName, effectProps }) =>
          databaseEffectToObject(group, effectName, effectProps),
        );

      this.groupColorEffects.set(group, effectObjs);
      this.groupMovementEffects.set(
        group,
        effects
          .filter(({ effectName }) => lightsEffectsMovementNames.includes(effectName as any))
          .map(({ effectName, effectProps }) =>
            databaseEffectToObject(group, effectName, effectProps),
          ),
      );
    });
  }

  clearScene() {
    this.activeSceneId = null;
    this.entities.forEach((e) => {
      this.clearEffect(e);
    });
  }
}
