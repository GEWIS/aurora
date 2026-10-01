import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render } from '@testing-library/react';
import ExternalPoster from './ExternalPoster';

const POSTER_URL = 'https://example.com/poster';

describe('ExternalPoster', () => {
  // React sets the iframe src through the attribute, so this only catches manual reloads
  let setSrc: MockInstance<(value: string) => void>;

  beforeEach(() => {
    setSrc = vi.spyOn(HTMLIFrameElement.prototype, 'src', 'set').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not reload the iframe on mount', () => {
    render(<ExternalPoster url={POSTER_URL} visible={false} />);
    expect(setSrc).not.toHaveBeenCalled();
  });

  it('does not reload the iframe when it becomes visible', () => {
    const { rerender } = render(<ExternalPoster url={POSTER_URL} visible={false} />);
    rerender(<ExternalPoster url={POSTER_URL} visible />);
    expect(setSrc).not.toHaveBeenCalled();
  });

  it('reloads the iframe when it goes off screen', () => {
    const { rerender } = render(<ExternalPoster url={POSTER_URL} visible />);
    rerender(<ExternalPoster url={POSTER_URL} visible={false} />);
    expect(setSrc).toHaveBeenLastCalledWith(POSTER_URL);
  });
});
