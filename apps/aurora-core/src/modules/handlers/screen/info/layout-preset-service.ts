import { DeepPartial } from 'typeorm';
import InfoLayoutPreset from './entities/info-layout-preset';
import LayoutService from './layout-service';
import { WidgetPlacement } from './widget-catalog';

export interface LayoutPresetResponse {
  id: number;
  name: string;
  placements: WidgetPlacement[];
  modals: string[];
  background: string;
  backgroundImage: string;
  backgroundColor: string;
  defaultPanelBackground: string;
}

export interface LayoutPresetParams {
  name: string;
  placements: WidgetPlacement[];
  modals: string[];
  background?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  defaultPanelBackground?: string;
}

/**
 * Named, reusable layout configurations. A preset is a full snapshot of a layout
 * (placements, modals, backgrounds) that is not tied to any screen; the backoffice
 * saves the current editor state as a preset and loads it back onto any screen.
 * Payloads are validated with the same sanitizers as per-screen layouts.
 */
export default class LayoutPresetService {
  public static toResponse(preset: InfoLayoutPreset): LayoutPresetResponse {
    return {
      id: preset.id,
      name: preset.name,
      placements: LayoutService.sanitizePlacements(preset.placements ?? []),
      modals: LayoutService.sanitizeModals(preset.modals ?? []),
      background: LayoutService.sanitizeBackground(preset.background),
      backgroundImage: preset.backgroundImage ?? '',
      backgroundColor: LayoutService.sanitizeColor(preset.backgroundColor),
      defaultPanelBackground: LayoutService.sanitizePanelBackground(preset.defaultPanelBackground),
    };
  }

  public async getAll(): Promise<InfoLayoutPreset[]> {
    return InfoLayoutPreset.find({ order: { name: 'ASC' } });
  }

  public async create(params: LayoutPresetParams): Promise<InfoLayoutPreset> {
    const preset = InfoLayoutPreset.create(LayoutPresetService.sanitizeParams(params));
    return preset.save();
  }

  public async update(id: number, params: LayoutPresetParams): Promise<InfoLayoutPreset | null> {
    const preset = await InfoLayoutPreset.findOne({ where: { id } });
    if (!preset) return null;
    Object.assign(preset, LayoutPresetService.sanitizeParams(params));
    return preset.save();
  }

  public async delete(id: number): Promise<boolean> {
    const preset = await InfoLayoutPreset.findOne({ where: { id } });
    if (!preset) return false;
    await preset.remove();
    return true;
  }

  private static sanitizeParams(params: LayoutPresetParams): DeepPartial<InfoLayoutPreset> {
    return {
      name: params.name,
      placements: LayoutService.sanitizePlacements(params.placements),
      modals: LayoutService.sanitizeModals(params.modals),
      background: LayoutService.sanitizeBackground(params.background),
      backgroundImage: typeof params.backgroundImage === 'string' ? params.backgroundImage : '',
      backgroundColor: LayoutService.sanitizeColor(params.backgroundColor),
      defaultPanelBackground: LayoutService.sanitizePanelBackground(params.defaultPanelBackground),
    };
  }
}
