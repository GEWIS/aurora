import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PosterType } from '@gewis/aurora-api-client';
import makePoster from '../../../test/makePoster';
import PosterCarousel from './Carousel';

// Render each poster as its file location, so posters can be told apart by text
vi.mock('../types/ImagePoster', () => ({
  default: ({ source }: { source: string[] }) => <span>{source[0]}</span>,
}));

const imagePoster = (id: number) =>
  makePoster({
    id,
    name: `poster-${id}`,
    type: PosterType.IMG,
    files: [{ id, name: `f${id}`, location: `/poster-${id}.jpg` }],
  });

const posters = [1, 2, 3, 4].map(imagePoster);

describe('PosterCarousel', () => {
  it('renders the previous, current and next poster, keeping distant posters unmounted', () => {
    render(<PosterCarousel posters={posters} currentPoster={1} setTitle={vi.fn()} />);

    const previous = screen.getByText('/poster-1.jpg').parentElement;
    expect(previous).toHaveClass('opacity-100', 'z-10');

    const current = screen.getByText('/poster-2.jpg').parentElement;
    expect(current).toHaveClass('opacity-100', 'z-20');

    // The next poster is mounted but hidden, so it has loaded by the time it is shown
    const next = screen.getByText('/poster-3.jpg').parentElement;
    expect(next).toHaveClass('opacity-0', 'z-0');

    expect(screen.queryByText('/poster-4.jpg')).not.toBeInTheDocument();
  });

  it('keeps a poster mounted when posters before it are removed', () => {
    const setTitle = vi.fn();
    const { rerender } = render(
      <PosterCarousel posters={posters} currentPoster={1} setTitle={setTitle} />,
    );
    const shown = screen.getByText('/poster-2.jpg');

    // A poster refresh that drops an earlier poster shifts every index. If slots were keyed
    // by index, the poster on screen would be remounted (and flicker) or swapped for another.
    rerender(<PosterCarousel posters={posters.slice(1)} currentPoster={0} setTitle={setTitle} />);

    expect(screen.getByText('/poster-2.jpg')).toBe(shown);
  });
});
