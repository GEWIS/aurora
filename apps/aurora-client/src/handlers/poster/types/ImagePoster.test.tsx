import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import ImagePoster from './ImagePoster';

describe('ImagePoster', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('falls back to the default image when the source is empty', () => {
    const { container } = render(<ImagePoster source={[]} />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/base/avico-stuk.png');
  });

  it('keeps the picked image when re-rendered with an equal source array', () => {
    // A second pick would land on the other image, so a re-pick is visible in the src
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValue(0.99);

    const { container, rerender } = render(<ImagePoster source={['/img-a.png', '/img-b.png']} />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/img-a.png');

    // Poster refreshes rebuild the array, so it is a new reference with the same contents
    rerender(<ImagePoster source={['/img-a.png', '/img-b.png']} />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/img-a.png');
  });

  it('picks again when the images change', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const { container, rerender } = render(<ImagePoster source={['/img-a.png', '/img-b.png']} />);
    rerender(<ImagePoster source={['/img-c.png', '/img-d.png']} />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/img-c.png');
  });
});
