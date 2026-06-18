import { BaseHttpRequest } from '../core/BaseHttpRequest';
import { TrelloID } from '../models/TrelloID';
import { CancelablePromise } from '../core/CancelablePromise';
import { Board } from '../models/Board';
import { Attachment } from '../models/Attachment';

export class TrelloService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  public getBoard(id: TrelloID): CancelablePromise<Board> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}',
      path: {
        id,
      },
      query: {
        cards: 'visible',
        checklists: 'all',
        lists: 'open',
      },
    });
  }

  public getCardAttachments(cardId: TrelloID): CancelablePromise<Attachment[]> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/attachments',
      path: {
        id: cardId,
      },
    });
  }
}
