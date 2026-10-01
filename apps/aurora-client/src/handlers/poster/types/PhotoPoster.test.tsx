import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { act, render } from '@testing-library/react';
import * as auroraApiClient from '@gewis/aurora-api-client';
import makePoster from '../../../test/makePoster';
import PhotoPoster from './PhotoPoster';

const poster = makePoster({ type: auroraApiClient.PosterType.PHOTO, albums: [10, 20] });

describe('PhotoPoster', () => {
  let getPhoto: MockInstance<typeof auroraApiClient.getPhoto>;

  beforeEach(() => {
    getPhoto = vi.spyOn(auroraApiClient, 'getPhoto').mockResolvedValue({
      data: { url: '/photo-1.jpg', label: 'Album Photo' },
      request: new Request('http://localhost'),
      response: new Response(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not fetch a new photo when re-rendered with equal albums', async () => {
    const setTitle = vi.fn();
    const { rerender } = render(<PhotoPoster poster={poster} visible setTitle={setTitle} />);
    await act(async () => {});
    expect(getPhoto).toHaveBeenCalledTimes(1);

    // Poster refreshes return new objects, so the albums array is a new reference with the
    // same contents. Fetching again would swap the photo while it is on screen.
    rerender(<PhotoPoster poster={{ ...poster, albums: [10, 20] }} visible setTitle={setTitle} />);
    await act(async () => {});
    expect(getPhoto).toHaveBeenCalledTimes(1);
  });

  it('fetches a new photo when the albums change', async () => {
    const setTitle = vi.fn();
    const { rerender } = render(<PhotoPoster poster={poster} visible setTitle={setTitle} />);
    await act(async () => {});

    rerender(<PhotoPoster poster={{ ...poster, albums: [30] }} visible setTitle={setTitle} />);
    await act(async () => {});
    expect(getPhoto).toHaveBeenCalledTimes(2);
  });
});
