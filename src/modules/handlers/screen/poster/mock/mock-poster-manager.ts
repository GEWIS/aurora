import { PosterManager } from '../poster-manager';
import { FooterSize, Poster, PosterType } from '../poster';

/**
 * A mock poster manager that returns a fixed set of posters. This can be used for development and testing purposes.
 *
 * Sources are from Github, TU Ilmenau, and some random websites.
 */
export class MockPosterManager extends PosterManager {
  public get posters(): Poster[] | undefined {
    return [
      {
        id: '1',
        name: 'Test Poster 1',
        label: 'Mock external poster | Full footer',
        timeout: 10,
        footer: FooterSize.FULL,
        type: PosterType.EXTERNAL,
        source: ['https://kanikeenkortebroekaan.nl/'],
      },
      {
        id: '2',
        name: 'Test Poster 2',
        label: 'Mock image poster | Minimal footer',
        timeout: 10,
        footer: FooterSize.MINIMAL,
        type: PosterType.IMAGE,
        source: [
          'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/alfa.png',
        ],
      },
      {
        id: '7',
        name: 'Test Poster 7',
        label: 'Mock video poster | Full footer',
        timeout: 10,
        footer: FooterSize.FULL,
        type: PosterType.VIDEO,
        source: [
          'https://avtshare01.rz.tu-ilmenau.de/avt-vqdb-uhd-1/test_1/segments/cutting_orange_tuil_15000kbps_1080p_59.94fps_vp9.mkv',
        ],
      },
      {
        id: '3',
        name: 'Test Poster 3',
        label: 'Mock external poster | Minimal footer',
        timeout: 10,
        footer: FooterSize.MINIMAL,
        type: PosterType.EXTERNAL,
        source: ['http://www.bakkenvouwenals.nl/'],
      },
      {
        id: '4',
        name: 'Test Poster 4',
        label: 'Mock image poster | Full footer',
        timeout: 10,
        footer: FooterSize.FULL,
        type: PosterType.IMAGE,
        source: [
          'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/fox.png',
        ],
      },
      {
        id: '5',
        name: 'Test Poster 5',
        label: 'Mock image poster | Full footer',
        timeout: 10,
        footer: FooterSize.FULL,
        type: PosterType.IMAGE,
        source: [
          'https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/images/trigonometry.png',
        ],
      },
      {
        id: '6',
        name: 'Test Poster 6',
        label: 'Mock video poster | Minimal footer',
        timeout: 10,
        footer: FooterSize.MINIMAL,
        type: PosterType.VIDEO,
        source: [
          'https://avtshare01.rz.tu-ilmenau.de/avt-vqdb-uhd-1/test_1/segments/bigbuck_bunny_8bit_15000kbps_1080p_60.0fps_vp9.mkv',
        ],
      },
    ];
  }

  async fetchPosters(): Promise<Poster[]> {
    return this.posters ?? [];
  }
}
