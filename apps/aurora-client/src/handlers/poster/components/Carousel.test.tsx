import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { PosterType } from '@gewis/aurora-api-client';
import makePoster from '../../../test/makePoster';
import PosterCarousel from './Carousel';

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

const poster = (id: number) => screen.queryByText(`/poster-${id}.jpg`);
const slot = (id: number) => poster(id)?.parentElement;

describe('PosterCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the previous, current and next poster, keeping distant posters unmounted', () => {
    const { rerender } = render(
      <PosterCarousel posters={posters} currentPoster={0} setTitle={vi.fn()} />,
    );
    rerender(<PosterCarousel posters={posters} currentPoster={1} setTitle={vi.fn()} />);

    expect(slot(1)).toHaveAttribute('aria-hidden', 'true');
    expect(slot(2)).toHaveAttribute('aria-hidden', 'false');
    expect(slot(3)).toHaveAttribute('aria-hidden', 'true');
    expect(poster(4)).not.toBeInTheDocument();
  });

  it.each([2, 3])('remounts the poster that left the screen with %i posters', (count) => {
    const few = posters.slice(0, count);
    const { rerender } = render(
      <PosterCarousel posters={few} currentPoster={0} setTitle={vi.fn()} />,
    );
    rerender(<PosterCarousel posters={few} currentPoster={1} setTitle={vi.fn()} />);
    const left = poster(1);
    const shown = poster(2);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(poster(1)).toBeInTheDocument();
    expect(poster(1)).not.toBe(left);
    expect(poster(2)).toBe(shown);
  });

  it('does not remount the previous poster with 4 posters', () => {
    const { rerender } = render(
      <PosterCarousel posters={posters} currentPoster={0} setTitle={vi.fn()} />,
    );
    rerender(<PosterCarousel posters={posters} currentPoster={1} setTitle={vi.fn()} />);
    const left = poster(1);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(poster(1)).toBe(left);
  });

  it('does not mount a newly added poster as the previous poster', () => {
    const three = posters.slice(0, 3);
    const { rerender } = render(
      <PosterCarousel posters={three} currentPoster={2} setTitle={vi.fn()} />,
    );
    rerender(<PosterCarousel posters={three} currentPoster={0} setTitle={vi.fn()} />);
    rerender(<PosterCarousel posters={posters} currentPoster={0} setTitle={vi.fn()} />);

    expect(poster(3)).toBeInTheDocument();
    expect(poster(4)).not.toBeInTheDocument();
  });

  it('keeps a poster mounted when posters before it are removed', () => {
    const { rerender } = render(
      <PosterCarousel posters={posters} currentPoster={1} setTitle={vi.fn()} />,
    );
    const shown = poster(2);

    rerender(<PosterCarousel posters={posters.slice(1)} currentPoster={0} setTitle={vi.fn()} />);

    expect(poster(2)).toBe(shown);
  });
});
