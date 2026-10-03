import { describe, it, expect } from 'vitest';
import { toSafeFileName } from './poster-request-file';

describe('toSafeFileName', () => {
  it.each([
    [
      'keeps a normal name with the detected extension',
      'open-podium.png',
      'png',
      'open-podium.png',
    ],
    ['replaces the extension given by the requester', 'poster.html', 'png', 'poster.png'],
    ['replaces a double extension', 'poster.png.html', 'jpg', 'poster.png.jpg'],
    ['drops unix directories', '../../etc/passwd', 'png', 'passwd.png'],
    ['drops windows directories', 'C:\\Users\\me\\poster.jpg', 'jpg', 'poster.jpg'],
    ['replaces unusual characters', '<b onload=alert(1)>.png', 'png', '_b onload_alert_1__.png'],
    ['does not start with a dot', '.htaccess', 'png', 'poster.png'],
    ['falls back for an empty name', '', 'mp4', 'poster.mp4'],
  ])('%s', (_, originalName, extension, expected) => {
    expect(toSafeFileName(originalName, extension)).toBe(expected);
  });

  it('limits the length of the name', () => {
    // ACT
    const name = toSafeFileName(`${'a'.repeat(300)}.png`, 'png');

    // ASSERT
    expect(name).toBe(`${'a'.repeat(100)}.png`);
  });
});
