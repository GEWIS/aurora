import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import ValidationService from './validation-service';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: () => false,
  },
}));

const mockGet = axios.get as unknown as ReturnType<typeof vi.fn>;
const service = new ValidationService();

describe('ValidationService', () => {
  beforeEach(() => mockGet.mockReset());

  it('rejects an empty value without hitting the network', async () => {
    const res = await service.validate({ kind: 'rss', value: '  ' });
    expect(res.valid).toBe(false);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('validates an RSS feed with headlines', async () => {
    mockGet.mockResolvedValue({
      data: '<rss><channel><item><title>Hello</title></item></channel></rss>',
    });
    const res = await service.validate({ kind: 'rss', value: 'https://x/rss.xml' });
    expect(res.valid).toBe(true);
    expect(res.message).toContain('1');
  });

  it('rejects an RSS feed with no headlines', async () => {
    mockGet.mockResolvedValue({ data: '<rss></rss>' });
    const res = await service.validate({ kind: 'rss', value: 'https://x/empty.xml' });
    expect(res.valid).toBe(false);
  });

  it('accepts an image URL with an image content-type', async () => {
    mockGet.mockResolvedValue({ headers: { 'content-type': 'image/png' }, data: Buffer.from('') });
    const res = await service.validate({ kind: 'image', value: 'https://x/a.png' });
    expect(res.valid).toBe(true);
  });

  it('rejects a non-image URL for the image check', async () => {
    mockGet.mockResolvedValue({ headers: { 'content-type': 'text/html' }, data: Buffer.from('') });
    const res = await service.validate({ kind: 'image', value: 'https://x/page' });
    expect(res.valid).toBe(false);
  });

  it('accepts a reachable station lookup', async () => {
    mockGet.mockResolvedValue({ data: { payload: { departures: [] } } });
    const res = await service.validate({ kind: 'station', value: 'EHV' });
    expect(res.valid).toBe(true);
  });

  it('reports a failure when the source is unreachable', async () => {
    mockGet.mockImplementationOnce(() => {
      throw new Error('ENOTFOUND');
    });
    const res = await service.validate({ kind: 'url', value: 'https://nope.invalid' });
    expect(res.valid).toBe(false);
    expect(res.message).toContain('ENOTFOUND');
  });
});
