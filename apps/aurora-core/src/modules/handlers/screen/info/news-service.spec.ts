import { describe, it, expect } from 'vitest';
import NewsService, { NewsHeadline, FAKE_HEADLINES } from './news-service';

describe('NewsService.parseRss', () => {
  it('extracts item titles and decodes entities/CDATA', () => {
    const xml = `<rss><channel>
      <item><title><![CDATA[Breaking & bold]]></title></item>
      <item><title>Ben &amp; Jerry</title></item>
    </channel></rss>`;

    const headlines = NewsService.parseRss(xml, 'BBC');

    expect(headlines).toEqual([
      { title: 'Breaking & bold', source: 'BBC' },
      { title: 'Ben & Jerry', source: 'BBC' },
    ]);
  });

  it('returns an empty array when there are no items', () => {
    expect(NewsService.parseRss('<rss></rss>', 'BBC')).toEqual([]);
  });
});

describe('NewsService.injectFakeHeadlines', () => {
  it('inserts every fake headline into the real list', () => {
    const real: NewsHeadline[] = [
      { title: 'a', source: 'BBC' },
      { title: 'b', source: 'BBC' },
    ];

    const result = NewsService.injectFakeHeadlines(real, FAKE_HEADLINES, () => 0);

    expect(result).toHaveLength(real.length + FAKE_HEADLINES.length);
    FAKE_HEADLINES.forEach((fake) => expect(result).toContainEqual(fake));
    // With random() === 0 the fakes are prepended, real order preserved at the end.
    expect(result.slice(-2)).toEqual(real);
  });
});
