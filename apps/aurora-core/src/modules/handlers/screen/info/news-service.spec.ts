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

describe('NewsService.parseRss entity decoding', () => {
  const feed = (title: string) =>
    `<rss><channel><item><title>${title}</title></item></channel></rss>`;
  const titleOf = (title: string) => NewsService.parseRss(feed(title), 'Test')[0]?.title;

  it('decodes a decimal reference', () => {
    expect(titleOf('Pippi&#8217;s kleindochter debuteert op de US Open')).toBe(
      'Pippi’s kleindochter debuteert op de US Open',
    );
  });

  it('decodes a hexadecimal reference', () => {
    expect(titleOf('Caf&#x00e9; sluit')).toBe('Café sluit');
  });

  it('decodes named entities beyond the basic five', () => {
    expect(titleOf('Beurs &ndash; kabinet &lsquo;bezorgd&rsquo;')).toBe(
      'Beurs – kabinet ‘bezorgd’',
    );
  });

  it('maps the Windows-1252 block feeds mislabel as Unicode', () => {
    expect(titleOf('Pippi&#146;s kleindochter')).toBe('Pippi’s kleindochter');
  });

  it('resolves in one pass, so an escaped ampersand stays literal', () => {
    expect(titleOf('Marks &amp;#8217; Spencer')).toBe('Marks &#8217; Spencer');
  });

  it('leaves an unknown reference alone rather than dropping it', () => {
    expect(titleOf('Tom &nosuchentity; Jerry')).toBe('Tom &nosuchentity; Jerry');
  });

  it('still unwraps CDATA', () => {
    expect(titleOf('<![CDATA[Ren&eacute; wint]]>')).toBe('René wint');
  });
});
