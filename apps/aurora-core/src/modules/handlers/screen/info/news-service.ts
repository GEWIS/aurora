import axios from 'axios';
import NewsSource from './entities/news-source';

export interface NewsHeadline {
  title: string;
  source: string;
  /** Source registry id (for per-widget source selection); absent for satire. */
  sourceId?: number;
}

export interface NewsSourceParams {
  name: string;
  url: string;
  enabled: boolean;
}

export interface NewsSourceResponse {
  id: number;
  name: string;
  url: string;
  enabled: boolean;
}

/**
 * Feeds seeded on first use. They are stored as ordinary {@link NewsSource} rows,
 * so they can be edited, disabled, or removed like any custom source.
 */
export const DEFAULT_NEWS_SOURCES = [
  { name: 'BBC', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'NL Times', url: 'https://nltimes.nl/rssfeed2' },
];

/**
 * Satirical "fake news" headlines that the legacy info screen sprinkled into
 * the real feed. Ported verbatim as an easter egg.
 */
export const FAKE_HEADLINES: NewsHeadline[] = [
  {
    title:
      'Obesity rate increases amongst Mathematics and Computer Science students — the ' +
      "'B'tween chocolate bar' snack appears to be the root cause",
    source: 'GEWIS',
  },
  {
    title:
      'Alarming amount of headaches on Friday morning, according to research from the ' +
      'Belgian Academy of Consumption',
    source: 'GEWIS',
  },
  {
    title:
      'Researchers question the effectiveness of this news ticker — students found staring ' +
      'blankly at scrolling headlines',
    source: 'GEWIS',
  },
  {
    title: 'GELD LENEN KOST GELD — SudoSOS opwaarderen was nog nooit zo makkelijk',
    source: 'SudoSOS',
  },
];

/**
 * Aggregates headlines from the backoffice-managed news sources and mixes in the
 * satirical fake headlines at random positions (easter egg).
 */
export default class NewsService {
  public static toSourceResponse(source: NewsSource): NewsSourceResponse {
    return { id: source.id, name: source.name, url: source.url, enabled: source.enabled };
  }

  /**
   * All configured sources, seeding the BBC/NL Times defaults the first time the
   * (empty) registry is read so a fresh install still shows news.
   */
  public async getSources(): Promise<NewsSource[]> {
    const existing = await NewsSource.find({ order: { name: 'ASC' } });
    if (existing.length > 0) return existing;
    await Promise.all(
      DEFAULT_NEWS_SOURCES.map((s) => NewsSource.create({ ...s, enabled: true }).save()),
    );
    return NewsSource.find({ order: { name: 'ASC' } });
  }

  public async create(params: NewsSourceParams): Promise<NewsSource> {
    return NewsSource.create({
      name: params.name,
      url: params.url,
      enabled: params.enabled,
    }).save();
  }

  public async update(id: number, params: NewsSourceParams): Promise<NewsSource | null> {
    const source = await NewsSource.findOne({ where: { id } });
    if (!source) return null;
    source.name = params.name;
    source.url = params.url;
    source.enabled = params.enabled;
    return source.save();
  }

  public async delete(id: number): Promise<boolean> {
    const source = await NewsSource.findOne({ where: { id } });
    if (!source) return false;
    await source.remove();
    return true;
  }

  public async getHeadlines(): Promise<NewsHeadline[]> {
    const sources = (await this.getSources()).filter((s) => s.enabled);

    const results = await Promise.all(
      sources.map(async (source) => {
        try {
          const { data } = await axios.get<string>(source.url, { responseType: 'text' });
          return NewsService.parseRss(data, source.name).map((h) => ({
            ...h,
            sourceId: source.id,
          }));
        } catch {
          return [] as NewsHeadline[];
        }
      }),
    );

    return NewsService.injectFakeHeadlines(results.flat(), FAKE_HEADLINES);
  }

  /**
   * Minimal RSS parser: extracts the <title> of every <item>. Sufficient for a
   * headline ticker and avoids pulling in a full XML dependency.
   */
  public static parseRss(xml: string, source: string): NewsHeadline[] {
    const headlines: NewsHeadline[] = [];
    const itemRegex = /<item[\s\S]*?<\/item>/gi;
    const titleRegex = /<title>([\s\S]*?)<\/title>/i;

    const items = xml.match(itemRegex) ?? [];
    items.forEach((item) => {
      const match = item.match(titleRegex);
      if (!match) return;
      const title = NewsService.decode(match[1].trim());
      if (title) headlines.push({ title, source });
    });
    return headlines;
  }

  /**
   * The named entities worth knowing by heart. Anything numeric is resolved
   * arithmetically, so this only needs the names feeds actually use: typographic
   * punctuation and the accented letters that show up in Dutch and English
   * headlines.
   */
  private static readonly ENTITIES: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    ndash: '\u2013',
    mdash: '\u2014',
    lsquo: '\u2018',
    rsquo: '\u2019',
    ldquo: '\u201c',
    rdquo: '\u201d',
    sbquo: '\u201a',
    bdquo: '\u201e',
    hellip: '\u2026',
    bull: '\u2022',
    middot: '\u00b7',
    laquo: '\u00ab',
    raquo: '\u00bb',
    deg: '\u00b0',
    euro: '\u20ac',
    pound: '\u00a3',
    copy: '\u00a9',
    reg: '\u00ae',
    trade: '\u2122',
    times: '\u00d7',
    eacute: '\u00e9',
    egrave: '\u00e8',
    ecirc: '\u00ea',
    agrave: '\u00e0',
    auml: '\u00e4',
    ouml: '\u00f6',
    uuml: '\u00fc',
    iuml: '\u00ef',
    ccedil: '\u00e7',
    ntilde: '\u00f1',
    szlig: '\u00df',
  };

  /**
   * Numeric references in the 128-159 range are not the code points they name:
   * feeds that mean Windows-1252 emit `&#146;` for a right quote, where Unicode
   * has an unprintable control character. Map that block the way every browser
   * does rather than rendering a blank box.
   */
  private static readonly CP1252: Record<number, number> = {
    0x82: 0x201a, 0x83: 0x0192, 0x84: 0x201e, 0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021,
    0x88: 0x02c6, 0x89: 0x2030, 0x8a: 0x0160, 0x8b: 0x2039, 0x8c: 0x0152, 0x8e: 0x017d,
    0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201c, 0x94: 0x201d, 0x95: 0x2022, 0x96: 0x2013,
    0x97: 0x2014, 0x98: 0x02dc, 0x99: 0x2122, 0x9a: 0x0161, 0x9b: 0x203a, 0x9c: 0x0153,
    0x9e: 0x017e, 0x9f: 0x0178,
  }; // prettier-ignore

  /**
   * Resolve the HTML entities an RSS title arrives escaped with.
   *
   * Every reference is resolved in one pass. Decoding in stages would be wrong:
   * a title containing a literal `&amp;#8217;` — an ampersand the publisher
   * escaped on purpose — would have its `&amp;` turned into `&` by one pass and
   * the resulting `&#8217;` mistaken for an entity by the next, silently
   * rewriting the text. An unrecognised reference is left exactly as it came, on
   * the grounds that showing `&foo;` is more honest than dropping it.
   */
  private static decode(raw: string): string {
    return raw
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/&(#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);/gi, (match, ref: string) => {
        if (ref.startsWith('#')) {
          const code =
            ref[1].toLowerCase() === 'x' ? parseInt(ref.slice(2), 16) : Number(ref.slice(1));
          return NewsService.fromCodePoint(code) ?? match;
        }
        return NewsService.ENTITIES[ref.toLowerCase()] ?? match;
      })
      .trim();
  }

  /** A code point as a string, or null when it cannot be one. */
  private static fromCodePoint(code: number): string | null {
    if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return null;
    // Surrogate halves are not characters on their own.
    if (code >= 0xd800 && code <= 0xdfff) return null;
    return String.fromCodePoint(NewsService.CP1252[code] ?? code);
  }

  /**
   * Insert each fake headline at a random position within the real headlines.
   */
  public static injectFakeHeadlines(
    real: NewsHeadline[],
    fakes: NewsHeadline[],
    random: () => number = Math.random,
  ): NewsHeadline[] {
    const result = [...real];
    fakes.forEach((fake) => {
      const index = Math.floor(random() * (result.length + 1));
      result.splice(index, 0, fake);
    });
    return result;
  }
}
