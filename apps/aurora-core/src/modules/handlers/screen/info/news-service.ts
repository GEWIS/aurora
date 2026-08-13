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

  private static decode(raw: string): string {
    return raw
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
      .trim();
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
