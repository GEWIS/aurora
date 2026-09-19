import { LightsScene } from '../../lights/entities/scenes';
import EffectsHandler from './effects-handler';
import { LIGHTS_EFFECTS_COLOR } from '../../lights/effects/color';
import { databaseEffectToObject } from './database-effects-helper';
import { LIGHTS_EFFECTS_MOVEMENT } from '../../lights/effects/movement';
import { LightsGroup } from '../../lights/entities';

export class ScenesHandler extends EffectsHandler {
  /**
   * Scene that is currently active, if any. Lights groups that are registered
   * to this handler while a scene is active immediately get the scene's effects
   */
  private activeScene: LightsScene | null = null;

  tick(): LightsGroup[] {
    return super.tick();
  }

  getActiveSceneId(): number | null {
    return this.activeScene?.id ?? null;
  }

  // Also give newly registered groups their effects from the active scene
  public registerEntity(entity: LightsGroup) {
    super.registerEntity(entity);
    if (!this.activeScene) return;

    const group = this.entities.find((e) => e.id === entity.id);
    if (group) this.applySceneToGroup(this.activeScene, group);
  }

  applyScene(scene: LightsScene): void {
    this.clearScene();
    this.activeScene = scene;

    this.entities.forEach((group) => this.applySceneToGroup(scene, group));
  }

  clearScene() {
    this.activeScene = null;
    this.entities.forEach((e) => {
      this.clearEffect(e);
    });
  }

  /**
   * Create and assign the effects the given scene defines for the given group
   * @param scene
   * @param group Group object registered to this handler. Duplicate group copies
   * behave as different objects in the effect maps.
   */
  private applySceneToGroup(scene: LightsScene, group: LightsGroup): void {
    const effects = scene.effects.filter((e) => e.group.id === group.id);
    if (effects.length === 0) return;

    const lightsEffectsColorNames = LIGHTS_EFFECTS_COLOR.map((e) => e.name);
    const lightsEffectsMovementNames = LIGHTS_EFFECTS_MOVEMENT.map((e) => e.name);

    this.groupColorEffects.set(
      group,
      effects
        .filter(({ effectName }) => lightsEffectsColorNames.includes(effectName as any))
        .map(({ effectName, effectProps }) =>
          databaseEffectToObject(group, effectName, effectProps),
        ),
    );
    this.groupMovementEffects.set(
      group,
      effects
        .filter(({ effectName }) => lightsEffectsMovementNames.includes(effectName as any))
        .map(({ effectName, effectProps }) =>
          databaseEffectToObject(group, effectName, effectProps),
        ),
    );
  }
}
