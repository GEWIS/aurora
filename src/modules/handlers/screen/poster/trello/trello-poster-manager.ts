import { Board, Card, Checklist, TrelloClient, TrelloList } from './client';
import PosterService from '../local/poster-service';
import axios from 'axios';
import Poster, { FooterSize, PosterType } from '../local/poster';

const DEFAULT_POSTER_TIMEOUT = 15;
const DEFAULT_POSTER_REFRESH = 1000 * 60 * 15;

export class TrelloPosterManager {
  private client: TrelloClient;

  private refreshTimeout: NodeJS.Timeout | undefined = undefined;

  constructor() {
    this.client = new TrelloClient();
  }

  /**
   * Parse a Trello list recursively to a list of posters
   * @param list
   * @param board
   * @param listType
   * @param visitedLists
   * @private
   */
  private async parseLists(
    list: TrelloList,
    board: Board,
    listType?: PosterType,
    visitedLists: Set<string> = new Set(),
  ): Promise<Poster[]> {
    if (!list.id || visitedLists.has(list.id)) return [];
    visitedLists.add(list.id);

    const { cards: allCards, lists: allLists, checklists: allChecklists } = board;
    const cards = allCards?.filter((card) => card.idList === list.id) || [];

    const now = new Date();

    const posters = await Promise.all(
      cards.map(async (card) => {
        const labels = card.labels?.map((l) => l.name ?? '') ?? [];
        const checklists =
          allChecklists?.filter((checklist) => card.idChecklists?.includes(checklist.id)) ?? [];

        // A card can be two things: a poster, or a reference to a new list of cards.
        // If it has the correct label ("Posterlist"), it means the card is a reference to a list
        if (labels.includes('Posterlist')) {
          const newList = allLists?.find((l) => l.name === card.name);
          if (newList) {
            return this.parseLists(newList, board, card.desc as PosterType, visitedLists);
          }
          throw new Error(`Unknown list: ${card.name}`);
        }

        const borrelMode = labels.includes('BorrelMode');

        // If the card has a due date and this due date is in the past, skip this card
        if (card.due && new Date(card.due) < now) return undefined;

        switch (listType) {
          case 'img':
            return this.parseMediaPoster(card, checklists, PosterType.IMAGE);
          case 'video':
            return this.parseMediaPoster(card, checklists, PosterType.VIDEO);
          case 'extern':
            return this.parseExternalPoster(card, checklists);
          case 'photo':
            return this.parsePhotoPoster(card, checklists);
          default:
            break;
        }

        return undefined;
      }),
    );

    return posters.filter((p) => p !== undefined).flat() as Poster[];
  }

  /**
   * Parse all generic poster information
   * @param card
   * @param checklists
   * @param borrelMode
   * @private
   */
  private parseBasePoster(card: Card, checklists: Checklist[], borrelMode: boolean) {
    // Find the index of the "timeout" checklist if it exists
    // @ts-ignore
    const indexTimeout = checklists.findIndex(
      (checklist) => checklist.name.toLowerCase() === 'timeout',
    );
    // If it does exist, take the value of the first checkbox and make it the timeout value
    let timeout: number = DEFAULT_POSTER_TIMEOUT;
    if (indexTimeout !== undefined && indexTimeout > -1) {
      // @ts-ignore
      timeout = parseInt(checklists![indexTimeout].checkItems[0]?.name, 10);
    }

    const labels = card.labels?.map((l) => l.name ?? '') ?? [];
    const hideBorder = labels.includes('HIDE_BORDER');
    const footers = labels.filter(
      (l) => !['HIDE_BORDER', 'BorrelMode'].includes(l) && !l.startsWith('#'),
    );

    let color = labels.find((l) => l.startsWith('#'));

    return {
      name: card.name || 'Poster',
      timeout,
      // If there is a due date present, set the due date
      due: card.due ? new Date(card.due) : undefined,
      // If there are labels, set the label of this poster to be the first label of the card
      label: footers.length > 0 ? footers[0] : '',
      // If the card has a HIDE_LABEL label, set the footer size to minimal
      footer: hideBorder ? FooterSize.MINIMAL : FooterSize.FULL,
      borrelMode,
      color,
    };
  }

  /**
   * Given an image or video card, parse it and store its attachments for fetching later
   * @param card
   * @param checklists
   * @param type
   * @param borrelMode
   * @private
   */
  private async parseMediaPoster(
    card: Card,
    checklists: Checklist[],
    type: PosterType.IMAGE | PosterType.VIDEO,
    borrelMode = false,
  ): Promise<Poster | undefined> {
    const poster = this.parseBasePoster(card, checklists, borrelMode);

    if (!card.id) {
      return undefined;
    }

    const service = new PosterService();
    let localPoster = await service.createMediaPoster({
      name: poster.name,
      type: type,
      label: poster.label,
      startDate: card.badges?.start ? new Date(card.badges.start) : undefined,
      expirationDate: poster.due,
      defaultTimeout: poster.timeout,
      footerSize: poster.footer,
      borrelMode: poster.borrelMode,
      accentColor: poster.color,
      trello: true,
    });

    const attachments = await this.client.default.getCardAttachments(card.id);
    const mediaAttachments = attachments.filter((a) =>
      a.mimeType.startsWith(type === PosterType.IMAGE ? 'image/' : 'video/'),
    );
    if (mediaAttachments.length === 0) return undefined;

    const headers = {
      Authorization: `OAuth oauth_consumer_key="${process.env.TRELLO_KEY}", oauth_token="${process.env.TRELLO_TOKEN}"`,
    };

    // Attach every matching attachment sequentially so each appends to the poster's files.
    for (const attachment of mediaAttachments) {
      const resp = await axios.get<ArrayBuffer>(attachment.url, {
        responseType: 'arraybuffer',
        headers,
      });
      localPoster = await service.attachMedia(
        localPoster.id,
        attachment.fileName,
        Buffer.from(resp.data),
      );
    }

    return localPoster;
  }

  /**
   * Given a photo card, parse it and its albums
   * @param card
   * @param checklists
   * @param borrelMode
   * @private
   */
  private async parsePhotoPoster(
    card: Card,
    checklists: Checklist[],
    borrelMode = false,
  ): Promise<Poster | undefined> {
    const index = checklists.findIndex((checklist) => checklist.name.toLowerCase() === 'photos');
    // If such list cannot be found, it does not exist. Throw an error because we cannot continue
    if (index === undefined || index < 0) {
      return undefined;
    }

    const checkList = checklists![index];
    const albums = checkList.checkItems.map((item: any) => item.name.split(' ')[0]);

    const poster = this.parseBasePoster(card, checklists, borrelMode);
    const service = new PosterService();
    return service.createPhotoPoster({
      name: poster.name,
      type: PosterType.PHOTO,
      label: poster.label,
      startDate: card.badges?.start ? new Date(card.badges.start) : undefined,
      expirationDate: poster.due,
      defaultTimeout: poster.timeout,
      footerSize: poster.footer,
      borrelMode: poster.borrelMode,
      accentColor: poster.color,
      albums,
      trello: true,
    });
  }

  /**
   * Parse the given poster to an EXTERNAL type poster
   * If the card description is an invalid URL, return an ERROR poster
   * @param card
   * @param checklists
   * @param borrelMode
   * @private
   */
  private async parseExternalPoster(
    card: Card,
    checklists: Checklist[],
    borrelMode = false,
  ): Promise<Poster | undefined> {
    const isUrl = (url: string): boolean => {
      try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
      } catch (_) {
        return false;
      }
    };

    const regexMarkdown = /(?=\[(!\[.+?]\(.+?\)|.+?)]\((https:\/\/[^)]+)\))/gi;
    const match = [...(card.desc ?? '').matchAll(regexMarkdown)].map((m) => m[1])[0]?.trim();

    const url = isUrl(match) ? match : (card.desc ?? '');

    if (!card.desc || !isUrl(url)) {
      return undefined;
    }

    const poster = this.parseBasePoster(card, checklists, borrelMode);
    const service = new PosterService();

    return service.createExternalPoster({
      name: poster.name,
      type: PosterType.EXTERNAL,
      label: poster.label,
      startDate: card.badges?.start ? new Date(card.badges.start) : undefined,
      expirationDate: poster.due,
      defaultTimeout: poster.timeout,
      footerSize: poster.footer,
      borrelMode: poster.borrelMode,
      accentColor: poster.color,
      uri: url,
      trello: true,
    });
  }

  async reloadPosters(): Promise<Poster[]> {
    let board = await this.client.default.getBoard(process.env.TRELLO_BOARD_ID || '');
    if (!Object.prototype.hasOwnProperty.call(board, 'id')) throw new Error(JSON.stringify(board));
    board = board as Board;
    const { cards, lists } = board;
    if (!cards || !lists) throw new Error('Could not find cards and/or lists on the given board');

    const basePosterListName = process.env.TRELLO_BASE_POSTER_LIST_NAME ?? 'BasePosters';

    const list = lists.find((l) => l.name === basePosterListName);
    if (!list) throw new Error(`Could not find the list called "${basePosterListName}"`);

    const service = new PosterService();

    await service.deleteTrelloPosters();

    await this.parseLists(list, board);

    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    this.refreshTimeout = setTimeout(this.reloadPosters.bind(this), DEFAULT_POSTER_REFRESH);

    return await service.getAllPosters();
  }
}
