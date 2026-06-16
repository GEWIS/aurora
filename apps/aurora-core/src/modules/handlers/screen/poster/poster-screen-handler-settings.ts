import { IFile } from '../../../files/entities';
import { HexColor } from '../../../lights/color-definitions';

export interface PosterScreenHandlerSettings {
  /**
   * Whether the screen poster handler should be enabled.
   */
  Poster: boolean;

  /**
   * Whether the bottom progress bar should be minimal by default.
   */
  'Poster.DefaultMinimal': boolean;

  /**
   * The default color of the progress bar.
   */
  'Poster.DefaultProgressBarColor': HexColor;

  /**
   * Whether the progress bar color can be overriden by individual posters.
   */
  'Poster.ProgressBarPosterColors': boolean;

  /**
   * The logo that should be shown in the bottom left corner of the progress bar.
   * Can be kept clear to imply no logo should be used.
   */
  'Poster.ProgressBarLogo': IFile | '';

  /**
   * Whether "borrel mode" is present, namely a toggle adding an extra set of
   * posters to the rotation.
   */
  'Poster.BorrelModePresent': boolean;

  /**
   * Custom stylesheet defining the layout of the poster screen progress bar.
   */
  'Poster.CustomStylesheet': IFile | '';

  /**
   * Whether the double-dots (:) in the middle of the clock should flicker
   */
  'Poster.ClockShouldTick': boolean;

  /**
   * Whether the Trello poster sync is enabled.
   */
  'Poster.Trello': boolean;
}

export const PosterScreenHandlerSettingsDefaults: PosterScreenHandlerSettings = {
  Poster: true,
  'Poster.DefaultMinimal': false,
  'Poster.DefaultProgressBarColor': '#c40000',
  'Poster.ProgressBarPosterColors': false,
  'Poster.ProgressBarLogo': '',
  'Poster.BorrelModePresent': true,
  'Poster.CustomStylesheet': '',
  'Poster.ClockShouldTick': true,
  'Poster.Trello': true,
};
