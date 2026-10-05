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
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValue(0.99);

    const { container, rerender } = render(<ImagePoster source={['/img-a.png', '/img-b.png']} />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/img-a.png');

    rerender(<ImagePoster source={['/img-a.png', '/img-b.png']} />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/img-a.png');
  });

  it('keeps the picked image when a file is added', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const { container, rerender } = render(<ImagePoster source={['/img-a.png', '/img-b.png']} />);
    rerender(<ImagePoster source={['/img-a.png', '/img-b.png', '/img-c.png']} />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/img-b.png');
  });

  it('falls back to the first image when the picked file is removed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const { container, rerender } = render(<ImagePoster source={['/img-a.png', '/img-b.png']} />);
    rerender(<ImagePoster source={['/img-c.png', '/img-a.png']} />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/img-c.png');
  });
});
