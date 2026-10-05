import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import VideoPoster from './VideoPoster';

describe('VideoPoster', () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the picked video when re-rendered with an equal source array', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValue(0.99);

    const { container, rerender } = render(
      <VideoPoster source={['/vid-a.mp4', '/vid-b.mp4']} visible />,
    );
    const video = container.querySelector('video');
    expect(container.querySelector('source')).toHaveAttribute('src', '/vid-a.mp4');

    rerender(<VideoPoster source={['/vid-a.mp4', '/vid-b.mp4']} visible />);
    expect(container.querySelector('source')).toHaveAttribute('src', '/vid-a.mp4');
    expect(container.querySelector('video')).toBe(video);
  });

  it('replaces the video element when the source changes, so the new file is loaded', () => {
    const { container, rerender } = render(<VideoPoster source="/vid-a.mp4" visible />);
    const video = container.querySelector('video');

    rerender(<VideoPoster source="/vid-b.mp4" visible />);
    expect(container.querySelector('video')).not.toBe(video);
    expect(container.querySelector('source')).toHaveAttribute('src', '/vid-b.mp4');
  });
});
