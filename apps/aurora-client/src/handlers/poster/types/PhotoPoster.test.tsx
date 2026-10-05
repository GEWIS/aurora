import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { act, render } from '@testing-library/react';
import * as auroraApiClient from '@gewis/aurora-api-client';
import makePoster from '../../../test/makePoster';
import PhotoPoster from './PhotoPoster';

type PhotoResult = Awaited<ReturnType<typeof auroraApiClient.getPhoto>>;

const poster = makePoster({ type: auroraApiClient.PosterType.PHOTO, albums: [10, 20] });

const photo = (url: string) =>
  ({
    data: { url, label: 'Album Photo' },
    request: new Request('http://localhost'),
    response: new Response(),
  }) as PhotoResult;

describe('PhotoPoster', () => {
  let getPhoto: MockInstance<typeof auroraApiClient.getPhoto>;

  beforeEach(() => {
    getPhoto = vi.spyOn(auroraApiClient, 'getPhoto').mockResolvedValue(photo('/photo-1.jpg'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not fetch a new photo when re-rendered with equal albums', async () => {
    const setTitle = vi.fn();
    const { rerender } = render(<PhotoPoster poster={poster} visible setTitle={setTitle} />);
    await act(async () => {});
    expect(getPhoto).toHaveBeenCalledTimes(1);

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
    expect(getPhoto).toHaveBeenLastCalledWith({ body: { albumIds: [30] } });
  });

  it('ignores a response for albums that have since changed', async () => {
    let resolveStale!: (result: PhotoResult) => void;
    getPhoto
      .mockReturnValueOnce(new Promise((resolve) => (resolveStale = resolve)) as never)
      .mockResolvedValueOnce(photo('/photo-2.jpg'));
    const setTitle = vi.fn();

    const { container, rerender } = render(
      <PhotoPoster poster={poster} visible setTitle={setTitle} />,
    );
    rerender(<PhotoPoster poster={{ ...poster, albums: [30] }} visible setTitle={setTitle} />);
    await act(async () => {});
    resolveStale(photo('/photo-1.jpg'));
    await act(async () => {});

    expect(container.querySelector('img')).toHaveAttribute('src', '/photo-2.jpg');
  });

  it('logs the error of a response without data', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    getPhoto.mockResolvedValue({
      data: undefined,
      error: 'Not found',
      request: new Request('http://localhost'),
      response: new Response(),
    });

    const { container } = render(<PhotoPoster poster={poster} visible setTitle={vi.fn()} />);
    await act(async () => {});

    expect(consoleError).toHaveBeenCalledExactlyOnceWith('Not found');
    expect(container.querySelector('img')).toHaveAttribute('src', '/base/avico-stuk.png');
  });
});
