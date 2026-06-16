// @ts-nocheck
/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Action } from '../models/Action';
import type { ActionFields } from '../models/ActionFields';
import type { Attachment } from '../models/Attachment';
import type { AttachmentFields } from '../models/AttachmentFields';
import type { BlockedKey } from '../models/BlockedKey';
import type { Board } from '../models/Board';
import type { BoardBackground } from '../models/BoardBackground';
import type { BoardFields } from '../models/BoardFields';
import type { BoardStars } from '../models/BoardStars';
import type { Card } from '../models/Card';
import type { CardFields } from '../models/CardFields';
import type { Channel } from '../models/Channel';
import type { CheckItem } from '../models/CheckItem';
import type { ClaimableOrganizations } from '../models/ClaimableOrganizations';
import type { Color } from '../models/Color';
import type { CustomEmoji } from '../models/CustomEmoji';
import type { CustomField } from '../models/CustomField';
import type { CustomFieldItems } from '../models/CustomFieldItems';
import type { CustomSticker } from '../models/CustomSticker';
import type { Emoji } from '../models/Emoji';
import type { Enterprise } from '../models/Enterprise';
import type { EnterpriseAdmin } from '../models/EnterpriseAdmin';
import type { EnterpriseAuditLog } from '../models/EnterpriseAuditLog';
import type { Error } from '../models/Error';
import type { Export } from '../models/Export';
import type { Label } from '../models/Label';
import type { ListFields } from '../models/ListFields';
import type { Member } from '../models/Member';
import type { MemberFields } from '../models/MemberFields';
import type { Membership } from '../models/Membership';
import type { Memberships } from '../models/Memberships';
import type { Notification } from '../models/Notification';
import type { NotificationChannelSettings } from '../models/NotificationChannelSettings';
import type { NotificationFields } from '../models/NotificationFields';
import type { Organization } from '../models/Organization';
import type { OrganizationFields } from '../models/OrganizationFields';
import type { PendingOrganizations } from '../models/PendingOrganizations';
import type { Plugin } from '../models/Plugin';
import type { PluginData } from '../models/PluginData';
import type { PluginListing } from '../models/PluginListing';
import type { posStringOrNumber } from '../models/posStringOrNumber';
import type { SavedSearch } from '../models/SavedSearch';
import type { Tag } from '../models/Tag';
import type { Token } from '../models/Token';
import type { TokenFields } from '../models/TokenFields';
import type { TransferrableOrganization } from '../models/TransferrableOrganization';
import type { TrelloID } from '../models/TrelloID';
import type { TrelloList } from '../models/TrelloList';
import type { ViewFilter } from '../models/ViewFilter';
import type { Webhook } from '../models/Webhook';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class DefaultService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Get an Action
   * Get an Action
   * @param id The ID of the Action
   * @param display
   * @param entities
   * @param fields `all` or a comma-separated list of action [fields](/cloud/trello/guides/rest-api/object-definitions/#action-object)
   * @param member
   * @param memberFields `all` or a comma-separated list of member [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param memberCreator Whether to include the member object for the creator of the action
   * @param memberCreatorFields `all` or a comma-separated list of member [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getActionsId(
    id: TrelloID,
    display: boolean = true,
    entities: boolean = false,
    fields: string = 'all',
    member: boolean = true,
    memberFields: string = 'avatarHash,fullName,initials,username',
    memberCreator: boolean = true,
    memberCreatorFields: string = 'avatarHash,fullName,initials,username',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/actions/{id}',
      path: {
        id: id,
      },
      query: {
        display: display,
        entities: entities,
        fields: fields,
        member: member,
        member_fields: memberFields,
        memberCreator: memberCreator,
        memberCreator_fields: memberCreatorFields,
      },
    });
  }

  /**
   * Update an Action
   * Update a specific Action. Only comment actions can be updated. Used to edit the content of a comment.
   * @param id The ID of the Action
   * @param text The new text for the comment
   * @returns any Success
   * @throws ApiError
   */
  public putActionsId(id: TrelloID, text: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/actions/{id}',
      path: {
        id: id,
      },
      query: {
        text: text,
      },
    });
  }

  /**
   * Delete an Action
   * Delete a specific action. Only comment actions can be deleted.
   * @param id The ID of the Action
   * @returns any Success
   * @throws ApiError
   */
  public deleteActionsId(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/actions/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get a specific field on an Action
   * Get a specific property of an action
   * @param id The ID of the Action
   * @param field An action field
   * @returns Action Success
   * @throws ApiError
   */
  public getActionsIdField(id: TrelloID, field: ActionFields): CancelablePromise<Action> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/actions/{id}/{field}',
      path: {
        id: id,
        field: field,
      },
    });
  }

  /**
   * Get the Board for an Action
   * Get the Board for an Action
   * @param id The ID of the action
   * @param fields `all` or a comma-separated list of board fields
   * @returns Board Success
   * @throws ApiError
   */
  public getActionsIdBoard(id: TrelloID, fields?: BoardFields): CancelablePromise<Board> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/actions/{id}/board',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get the Card for an Action
   * Get the card for an action
   * @param id The ID of the action
   * @param fields `all` or a comma-separated list of card fields
   * @returns Card Success
   * @throws ApiError
   */
  public getActionsIdCard(id: TrelloID, fields: CardFields = 'all'): CancelablePromise<Card> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/actions/{id}/card',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get the List for an Action
   * Get the List for an Action
   * @param id The ID of the action
   * @param fields `all` or a comma-separated list of list fields
   * @returns TrelloList Success
   * @throws ApiError
   */
  public getActionsIdList(id: TrelloID, fields: ListFields = 'all'): CancelablePromise<TrelloList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/actions/{id}/list',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get the Member of an Action
   * Gets the member of an action (not the creator)
   * @param id The ID of the Action
   * @param fields `all` or a comma-separated list of member fields
   * @returns Member Success
   * @throws ApiError
   */
  public getActionsIdMember(id: TrelloID, fields: MemberFields = 'all'): CancelablePromise<Member> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/actions/{id}/member',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get the Member Creator of an Action
   * Get the Member who created the Action
   * @param id The ID of the Action
   * @param fields `all` or a comma-separated list of member fields
   * @returns Member Success
   * @throws ApiError
   */
  public getActionsIdMembercreator(
    id: TrelloID,
    fields: MemberFields = 'all',
  ): CancelablePromise<Member> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/actions/{id}/memberCreator',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get the Organization of an Action
   * Get the Organization of an Action
   * @param id The ID of the action
   * @param fields `all` or a comma-separated list of organization fields
   * @returns Organization Success
   * @throws ApiError
   */
  public getActionsIdOrganization(
    id: TrelloID,
    fields: OrganizationFields = 'all',
  ): CancelablePromise<Organization> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/actions/{id}/organization',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Update a Comment Action
   * Update a comment action
   * @param id The ID of the action to update
   * @param value The new text for the comment
   * @returns any Success
   * @throws ApiError
   */
  public putActionsIdText(id: TrelloID, value: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/actions/{id}/text',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Get Action's Reactions
   * List reactions for an action
   * @param idAction The ID of the action
   * @param member Whether to load the member as a nested resource. See [Members Nested Resource](/cloud/trello/guides/rest-api/nested-resources/#members-nested-resource)
   * @param emoji Whether to load the emoji as a nested resource.
   * @returns any Success
   * @throws ApiError
   */
  public getActionsIdactionReactions(
    idAction: TrelloID,
    member: boolean = true,
    emoji: boolean = true,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/actions/{idAction}/reactions',
      path: {
        idAction: idAction,
      },
      query: {
        member: member,
        emoji: emoji,
      },
    });
  }

  /**
   * Create Reaction for Action
   * Adds a new reaction to an action
   * @param idAction The ID of the action
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
  public postActionsIdactionReactions(
    idAction: TrelloID,
    requestBody?: {
      /**
       * The primary `shortName` of the emoji to add. See [/emoji](#emoji)
       */
      shortName?: string;
      /**
       * The `skinVariation` of the emoji to add. See [/emoji](#emoji)
       */
      skinVariation?: string;
      /**
       * The emoji to add as a native unicode emoji. See [/emoji](#emoji)
       */
      native?: string;
      /**
       * The `unified` value of the emoji to add. See [/emoji](#emoji)
       */
      unified?: string;
    },
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/actions/{idAction}/reactions',
      path: {
        idAction: idAction,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Get Action's Reaction
   * Get information for a reaction
   * @param idAction The ID of the Action
   * @param id The ID of the reaction
   * @param member Whether to load the member as a nested resource. See [Members Nested Resource](/cloud/trello/guides/rest-api/nested-resources/#members-nested-resource)
   * @param emoji Whether to load the emoji as a nested resource.
   * @returns any Success
   * @throws ApiError
   */
  public getActionsIdactionReactionsId(
    idAction: TrelloID,
    id: TrelloID,
    member: boolean = true,
    emoji: boolean = true,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/actions/{idAction}/reactions/{id}',
      path: {
        idAction: idAction,
        id: id,
      },
      query: {
        member: member,
        emoji: emoji,
      },
    });
  }

  /**
   * Delete Action's Reaction
   * Deletes a reaction
   * @param idAction The ID of the Action
   * @param id The ID of the reaction
   * @returns any Success
   * @throws ApiError
   */
  public deleteActionsIdactionReactionsId(
    idAction: TrelloID,
    id: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/actions/{idAction}/reactions/{id}',
      path: {
        idAction: idAction,
        id: id,
      },
    });
  }

  /**
   * List Action's summary of Reactions
   * List a summary of all reactions for an action
   * @param idAction The ID of the action
   * @returns any Success
   * @throws ApiError
   */
  public getActionsIdactionReactionsummary(idAction: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/actions/{idAction}/reactionsSummary',
      path: {
        idAction: idAction,
      },
    });
  }

  /**
   * Get Application's compliance data
   * @param key
   * @returns any Success
   * @throws ApiError
   */
  public applicationsKeyCompliance(key: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/applications/{key}/compliance',
      path: {
        key: key,
      },
    });
  }

  /**
   * Batch Requests
   * Make up to 10 GET requests in a single, batched API call.
   * @param urls A list of API routes. Maximum of 10 routes allowed. The routes should begin with a forward slash and should not include the API version number - e.g. "urls=/members/trello,/cards/[cardId]"
   * @returns any Success
   * @throws ApiError
   */
  public getBatch(urls: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/batch',
      query: {
        urls: urls,
      },
    });
  }

  /**
   * Get Memberships of a Board
   * Get information about the memberships users have to the board.
   * @param id The ID of the board
   * @param filter One of `admins`, `all`, `none`, `normal`
   * @param activity Works for premium organizations only.
   * @param orgMemberType Shows the type of member to the org the user is. For instance, an org admin will have a `orgMemberType` of `admin`.
   * @param member Determines whether to include a [nested member object](/cloud/trello/guides/rest-api/nested-resources/).
   * @param memberFields Fields to show if `member=true`. Valid values: [nested member resource fields](/cloud/trello/guides/rest-api/nested-resources/).
   * @returns Memberships Success
   * @throws ApiError
   */
  public getBoardsIdMemberships(
    id: TrelloID,
    filter: 'admins' | 'all' | 'none' | 'normal' = 'all',
    activity: boolean = false,
    orgMemberType: boolean = false,
    member: boolean = false,
    memberFields: MemberFields = 'fullname,username',
  ): CancelablePromise<Memberships> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}/memberships',
      path: {
        id: id,
      },
      query: {
        filter: filter,
        activity: activity,
        orgMemberType: orgMemberType,
        member: member,
        member_fields: memberFields,
      },
    });
  }

  /**
   * Get a Board
   * Request a single board.
   * @param id
   * @param actions This is a nested resource. Read more about actions as nested resources [here](/cloud/trello/guides/rest-api/nested-resources/).
   * @param boardStars Valid values are one of: `mine` or `none`.
   * @param cards This is a nested resource. Read more about cards as nested resources [here](/cloud/trello/guides/rest-api/nested-resources/).
   * @param cardPluginData Use with the `cards` param to include card pluginData with the response
   * @param checklists This is a nested resource. Read more about checklists as nested resources [here](/cloud/trello/guides/rest-api/nested-resources/).
   * @param customFields This is a nested resource. Read more about custom fields as nested resources [here](#custom-fields-nested-resource).
   * @param fields The fields of the board to be included in the response. Valid values: all or a comma-separated list of: closed, dateLastActivity, dateLastView, desc, descData, idMemberCreator, idOrganization, invitations, invited, labelNames, memberships, name, pinned, powerUps, prefs, shortLink, shortUrl, starred, subscribed, url
   * @param labels This is a nested resource. Read more about labels as nested resources [here](/cloud/trello/guides/rest-api/nested-resources/).
   * @param lists This is a nested resource. Read more about lists as nested resources [here](/cloud/trello/guides/rest-api/nested-resources/).
   * @param members This is a nested resource. Read more about members as nested resources [here](/cloud/trello/guides/rest-api/nested-resources/).
   * @param memberships This is a nested resource. Read more about memberships as nested resources [here](/cloud/trello/guides/rest-api/nested-resources/).
   * @param pluginData Determines whether the pluginData for this board should be returned. Valid values: true or false.
   * @param organization This is a nested resource. Read more about organizations as nested resources [here](/cloud/trello/guides/rest-api/nested-resources/).
   * @param organizationPluginData Use with the `organization` param to include organization pluginData with the response
   * @param myPrefs
   * @param tags Also known as collections, tags, refer to the collection(s) that a Board belongs to.
   * @returns Board Success
   * @returns Error Unexpected error
   * @throws ApiError
   */
  public getBoardsId(
    id: TrelloID,
    actions: string = 'all',
    boardStars: string = 'none',
    cards: string = 'none',
    cardPluginData: boolean = false,
    checklists: string = 'none',
    customFields: boolean = false,
    fields: string = 'name,desc,descData,closed,idOrganization,pinned,url,shortUrl,prefs,labelNames',
    labels?: string,
    lists: string = 'open',
    members: string = 'none',
    memberships: string = 'none',
    pluginData: boolean = false,
    organization: boolean = false,
    organizationPluginData: boolean = false,
    myPrefs: boolean = false,
    tags: boolean = false,
  ): CancelablePromise<Board | Error> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}',
      path: {
        id: id,
      },
      query: {
        actions: actions,
        boardStars: boardStars,
        cards: cards,
        card_pluginData: cardPluginData,
        checklists: checklists,
        customFields: customFields,
        fields: fields,
        labels: labels,
        lists: lists,
        members: members,
        memberships: memberships,
        pluginData: pluginData,
        organization: organization,
        organization_pluginData: organizationPluginData,
        myPrefs: myPrefs,
        tags: tags,
      },
      errors: {
        401: `Unauthorized`,
        404: `The specified resource was not found`,
      },
    });
  }

  /**
   * Update a Board
   * Update an existing board by id
   * @param id
   * @param name The new name for the board. 1 to 16384 characters long.
   * @param desc A new description for the board, 0 to 16384 characters long
   * @param closed Whether the board is closed
   * @param subscribed Whether the acting user is subscribed to the board
   * @param idOrganization The id of the Workspace the board should be moved to
   * @param prefsPermissionLevel One of: org, private, public
   * @param prefsSelfJoin Whether Workspace members can join the board themselves
   * @param prefsCardCovers Whether card covers should be displayed on this board
   * @param prefsHideVotes Determines whether the Voting Power-Up should hide who voted on cards or not.
   * @param prefsInvitations Who can invite people to this board. One of: admins, members
   * @param prefsVoting Who can vote on this board. One of disabled, members, observers, org, public
   * @param prefsComments Who can comment on cards on this board. One of: disabled, members, observers, org, public
   * @param prefsBackground The id of a custom background or one of: blue, orange, green, red, purple, pink, lime, sky, grey
   * @param prefsCardAging One of: pirate, regular
   * @param prefsCalendarFeedEnabled Determines whether the calendar feed is enabled or not.
   * @param labelNamesGreen Name for the green label. 1 to 16384 characters long
   * @param labelNamesYellow Name for the yellow label. 1 to 16384 characters long
   * @param labelNamesOrange Name for the orange label. 1 to 16384 characters long
   * @param labelNamesRed Name for the red label. 1 to 16384 characters long
   * @param labelNamesPurple Name for the purple label. 1 to 16384 characters long
   * @param labelNamesBlue Name for the blue label. 1 to 16384 characters long
   * @returns any Success
   * @throws ApiError
   */
  public putBoardsId(
    id: TrelloID,
    name?: string,
    desc?: string,
    closed?: boolean,
    subscribed?: TrelloID,
    idOrganization?: string,
    prefsPermissionLevel?: string,
    prefsSelfJoin?: boolean,
    prefsCardCovers?: boolean,
    prefsHideVotes?: boolean,
    prefsInvitations?: string,
    prefsVoting?: string,
    prefsComments?: string,
    prefsBackground?: string,
    prefsCardAging?: string,
    prefsCalendarFeedEnabled?: boolean,
    labelNamesGreen?: string,
    labelNamesYellow?: string,
    labelNamesOrange?: string,
    labelNamesRed?: string,
    labelNamesPurple?: string,
    labelNamesBlue?: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/boards/{id}',
      path: {
        id: id,
      },
      query: {
        name: name,
        desc: desc,
        closed: closed,
        subscribed: subscribed,
        idOrganization: idOrganization,
        'prefs/permissionLevel': prefsPermissionLevel,
        'prefs/selfJoin': prefsSelfJoin,
        'prefs/cardCovers': prefsCardCovers,
        'prefs/hideVotes': prefsHideVotes,
        'prefs/invitations': prefsInvitations,
        'prefs/voting': prefsVoting,
        'prefs/comments': prefsComments,
        'prefs/background': prefsBackground,
        'prefs/cardAging': prefsCardAging,
        'prefs/calendarFeedEnabled': prefsCalendarFeedEnabled,
        'labelNames/green': labelNamesGreen,
        'labelNames/yellow': labelNamesYellow,
        'labelNames/orange': labelNamesOrange,
        'labelNames/red': labelNamesRed,
        'labelNames/purple': labelNamesPurple,
        'labelNames/blue': labelNamesBlue,
      },
    });
  }

  /**
   * Delete a Board
   * Delete a board.
   * @param id
   * @param id The id of the board to delete
   * @returns any Success
   * @throws ApiError
   */
  public deleteBoardsId(id: TrelloID, id: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/boards/{id}',
      path: {
        id: id,
        id: id,
      },
    });
  }

  /**
   * Get a field on a Board
   * Get a single, specific field on a board
   * @param id The ID of the board.
   * @param field The field you'd like to receive. Valid values: closed, dateLastActivity, dateLastView, desc, descData, idMemberCreator, idOrganization, invitations, invited, labelNames, memberships, name, pinned, powerUps, prefs, shortLink, shortUrl, starred, subscribed, url.
   * @returns any Success
   * @throws ApiError
   */
  public getBoardsIdField(id: string, field: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}/{field}',
      path: {
        id: id,
        field: field,
      },
    });
  }

  /**
   * Get Actions of a Board
   * @param boardId
   * @param fields The fields to be returned for the Actions. [See Action fields here](/cloud/trello/guides/rest-api/object-definitions/#action-object).
   * @param filter A comma-separated list of [action types](/cloud/trello/guides/rest-api/action-types/).
   * @param format The format of the returned Actions. Either list or count.
   * @param idModels A comma-separated list of idModels. Only actions related to these models will be returned.
   * @param limit The limit of the number of responses, between 0 and 1000.
   * @param member Whether to return the member object for each action.
   * @param memberFields The fields of the [member](/cloud/trello/guides/rest-api/object-definitions/#member-object) to return.
   * @param memberCreator Whether to return the memberCreator object for each action.
   * @param memberCreatorFields The fields of the [member](/cloud/trello/guides/rest-api/object-definitions/#member-object) creator to return
   * @param page The page of results for actions.
   * @param reactions Whether to show reactions on comments or not.
   * @param before An Action ID
   * @param since An Action ID
   * @returns any Success
   * @throws ApiError
   */
  public getBoardsIdActions(
    boardId: string,
    fields?: Action,
    filter?: string,
    format: string = 'list',
    idModels?: string,
    limit: number = 50,
    member: boolean = true,
    memberFields: string = 'activityBlocked,avatarHash,avatarUrl,fullName,idMemberReferrer,initials,nonPublic,nonPublicAvailable,username',
    memberCreator: boolean = true,
    memberCreatorFields: string = 'activityBlocked,avatarHash,avatarUrl,fullName,idMemberReferrer,initials,nonPublic,nonPublicAvailable,username',
    page?: number,
    reactions?: boolean,
    before?: string,
    since?: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{boardId}/actions',
      path: {
        boardId: boardId,
      },
      query: {
        fields: fields,
        filter: filter,
        format: format,
        idModels: idModels,
        limit: limit,
        member: member,
        member_fields: memberFields,
        memberCreator: memberCreator,
        memberCreator_fields: memberCreatorFields,
        page: page,
        reactions: reactions,
        before: before,
        since: since,
      },
    });
  }

  /**
   * Get a Card on a Board
   * Get a single Card on a Board.
   * @param id The ID of the board
   * @param idCard The id the card to retrieve.
   * @param fields The fields to be returned for the Actions. [See Action fields here](/cloud/trello/guides/rest-api/object-definitions/#action-object).
   * @param filter A comma-separated list of [action types](/cloud/trello/guides/rest-api/action-types/).
   * @param format The format of the returned Actions. Either list or count.
   * @param idModels A comma-separated list of idModels. Only actions related to these models will be returned.
   * @param limit The limit of the number of responses, between 0 and 1000.
   * @param member Whether to return the member object for each action.
   * @param memberFields The fields of the [member](/cloud/trello/guides/rest-api/object-definitions/#member-object) to return.
   * @param memberCreator Whether to return the memberCreator object for each action.
   * @param memberCreatorFields The fields of the [member](/cloud/trello/guides/rest-api/object-definitions/#member-object) creator to return
   * @param page The page of results for actions.
   * @param reactions Whether to show reactions on comments or not.
   * @param before An Action ID
   * @param since An Action ID
   * @returns any Success
   * @throws ApiError
   */
  public getBoardsIdCardsIdcard(
    id: string,
    idCard: string,
    fields?: Action,
    filter?: string,
    format: string = 'list',
    idModels?: string,
    limit: number = 50,
    member: boolean = true,
    memberFields: string = 'activityBlocked,avatarHash,avatarUrl,fullName,idMemberReferrer,initials,nonPublic,nonPublicAvailable,username',
    memberCreator: boolean = true,
    memberCreatorFields: string = 'activityBlocked,avatarHash,avatarUrl,fullName,idMemberReferrer,initials,nonPublic,nonPublicAvailable,username',
    page?: number,
    reactions?: boolean,
    before?: string,
    since?: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}/cards/{idCard}',
      path: {
        id: id,
        idCard: idCard,
      },
      query: {
        fields: fields,
        filter: filter,
        format: format,
        idModels: idModels,
        limit: limit,
        member: member,
        member_fields: memberFields,
        memberCreator: memberCreator,
        memberCreator_fields: memberCreatorFields,
        page: page,
        reactions: reactions,
        before: before,
        since: since,
      },
    });
  }

  /**
   * Get boardStars on a Board
   * @param boardId
   * @param filter Valid values: mine, none
   * @returns any Success
   * @throws ApiError
   */
  public getBoardsIdBoardstars(
    boardId: string,
    filter: string = 'mine',
  ): CancelablePromise<Array<BoardStars>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{boardId}/boardStars',
      path: {
        boardId: boardId,
      },
      query: {
        filter: filter,
      },
    });
  }

  /**
   * Get Checklists on a Board
   * Get all of the checklists on a Board.
   * @param id The ID of the board
   * @returns any Success
   * @throws ApiError
   */
  public boardsIdChecklists(id: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}/checklists',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get Cards on a Board
   * Get all of the open Cards on a Board.
   * @param id
   * @returns any Success
   * @throws ApiError
   */
  public getBoardsIdCards(id: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}/cards',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get filtered Cards on a Board
   * Get the Cards on a Board that match a given filter.
   * @param id ID of the Board
   * @param filter Valid Values: all, closed, none, open, visible.
   * @returns any Success
   * @throws ApiError
   */
  public getBoardsIdCardsFilter(
    id: string,
    filter: 'all' | 'closed' | 'none' | 'open' | 'visible',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}/cards/{filter}',
      path: {
        id: id,
        filter: filter,
      },
    });
  }

  /**
   * Get Custom Fields for Board
   * Get the Custom Field Definitions that exist on a board.
   * @param id The ID of the board
   * @returns CustomField Success
   * @throws ApiError
   */
  public getBoardsIdCustomfields(id: TrelloID): CancelablePromise<Array<CustomField>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}/customFields',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get Labels on a Board
   * Get all of the Labels on a Board.
   * @param id The ID of the Board.
   * @param fields The fields to be returned for the Labels.
   * @param limit The number of Labels to be returned.
   * @returns any Success
   * @throws ApiError
   */
  public getBoardsIdLabels(
    id: TrelloID,
    fields?: Label,
    limit: number = 50,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}/labels',
      path: {
        id: id,
      },
      query: {
        fields: fields,
        limit: limit,
      },
    });
  }

  /**
   * Create a Label on a Board
   * Create a new Label on a Board.
   * @param id The id of the board to update
   * @param name The name of the label to be created. 1 to 16384 characters long.
   * @param color Sets the color of the new label. Valid values are a label color or `null`.
   * @returns any Success
   * @throws ApiError
   */
  public postBoardsIdLabels(id: string, name: string, color: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/boards/{id}/labels',
      path: {
        id: id,
      },
      query: {
        name: name,
        color: color,
      },
    });
  }

  /**
   * Get Lists on a Board
   * Get the Lists on a Board
   * @param id The ID of the board
   * @param cards Filter to apply to Cards.
   * @param cardFields `all` or a comma-separated list of card [fields](/cloud/trello/guides/rest-api/object-definitions/#card-object)
   * @param filter Filter to apply to Lists
   * @param fields `all` or a comma-separated list of list [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns TrelloList Success
   * @throws ApiError
   */
  public getBoardsIdLists(
    id: TrelloID,
    cards?: ViewFilter,
    cardFields: string = 'all',
    filter?: ViewFilter,
    fields: string = 'all',
  ): CancelablePromise<Array<TrelloList>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}/lists',
      path: {
        id: id,
      },
      query: {
        cards: cards,
        card_fields: cardFields,
        filter: filter,
        fields: fields,
      },
    });
  }

  /**
   * Create a List on a Board
   * Create a new List on a Board.
   * @param id The ID of the board
   * @param name The name of the list to be created. 1 to 16384 characters long.
   * @param pos Determines the position of the list. Valid values: `top`, `bottom`, or a positive number.
   * @returns TrelloList Success
   * @throws ApiError
   */
  public postBoardsIdLists(
    id: TrelloID,
    name: string,
    pos: string = 'top',
  ): CancelablePromise<TrelloList> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/boards/{id}/lists',
      path: {
        id: id,
      },
      query: {
        name: name,
        pos: pos,
      },
    });
  }

  /**
   * Get filtered Lists on a Board
   * @param id The ID of the board
   * @param filter One of `all`, `closed`, `none`, `open`
   * @returns any Success
   * @throws ApiError
   */
  public getBoardsIdListsFilter(id: TrelloID, filter: ViewFilter): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}/lists/{filter}',
      path: {
        id: id,
        filter: filter,
      },
    });
  }

  /**
   * Get the Members of a Board
   * Get the Members for a board
   * @param id The ID of the board
   * @returns any Success
   * @throws ApiError
   */
  public getBoardsIdMembers(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}/members',
      path: {
        id: id,
      },
    });
  }

  /**
   * Invite Member to Board via email
   * Invite a Member to a Board via their email address.
   * @param id The ID of the board
   * @param email The email address of a user to add as a member of the board.
   * @param type Valid values: admin, normal, observer. Determines what type of member the user being added should be of the board.
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
  public putBoardsIdMembers(
    id: TrelloID,
    email: string,
    type: 'admin' | 'normal' | 'observer' = 'normal',
    requestBody?: {
      /**
       * The full name of the user to as a member of the board. Must have a length of at least 1 and cannot begin nor end with a space.
       */
      fullName?: string;
    },
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/boards/{id}/members',
      path: {
        id: id,
      },
      query: {
        email: email,
        type: type,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Add a Member to a Board
   * Add a member to the board.
   * @param id The id of the board to update
   * @param idMember The id of the member to add to the board.
   * @param type One of: admin, normal, observer. Determines the type of member this user will be on the board.
   * @param allowBillableGuest Optional param that allows organization admins to add multi-board guests onto a board.
   * @returns any Success
   * @throws ApiError
   */
  public putBoardsIdMembersIdmember(
    id: TrelloID,
    idMember: TrelloID,
    type: 'admin' | 'normal' | 'observer',
    allowBillableGuest: boolean = false,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/boards/{id}/members/{idMember}',
      path: {
        id: id,
        idMember: idMember,
      },
      query: {
        type: type,
        allowBillableGuest: allowBillableGuest,
      },
    });
  }

  /**
   * Remove Member from Board
   * @param id The id of the board to update
   * @param idMember The id of the member to add to the board.
   * @returns any Success
   * @throws ApiError
   */
  public boardsidmembersidmember(id: TrelloID, idMember: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/boards/{id}/members/{idMember}',
      path: {
        id: id,
        idMember: idMember,
      },
    });
  }

  /**
   * Update Membership of Member on a Board
   * Update an existing board by id
   * @param id The id of the board to update
   * @param idMembership The id of a membership that should be added to this board.
   * @param type One of: admin, normal, observer. Determines the type of member that this membership will be to this board.
   * @param memberFields Valid values: all, avatarHash, bio, bioData, confirmed, fullName, idPremOrgsAdmin, initials, memberType, products, status, url, username
   * @returns any Success
   * @throws ApiError
   */
  public putBoardsIdMembershipsIdmembership(
    id: TrelloID,
    idMembership: TrelloID,
    type: 'admin' | 'normal' | 'observer',
    memberFields:
      | 'all'
      | 'avatarHash'
      | 'bio'
      | 'bioData'
      | 'confirmed'
      | 'fullName'
      | 'idPremOrgsAdmin'
      | 'initials'
      | 'memberType'
      | 'products'
      | 'status'
      | 'url'
      | 'username' = 'fullName, username',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/boards/{id}/memberships/{idMembership}',
      path: {
        id: id,
        idMembership: idMembership,
      },
      query: {
        type: type,
        member_fields: memberFields,
      },
    });
  }

  /**
   * Update emailPosition Pref on a Board
   * Update emailPosition Pref on a Board
   * @param id The id of the board to update
   * @param value Valid values: bottom, top. Determines the position of the email address.
   * @returns any Success
   * @throws ApiError
   */
  public putBoardsIdMyprefsEmailposition(
    id: TrelloID,
    value: 'bottom' | 'top',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/boards/{id}/myPrefs/emailPosition',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Update idEmailList Pref on a Board
   * Change the default list that email-to-board cards are created in.
   * @param id The id of the board to update
   * @param value The id of an email list.
   * @returns any Success
   * @throws ApiError
   */
  public putBoardsIdMyprefsIdemaillist(id: TrelloID, value: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/boards/{id}/myPrefs/idEmailList',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Update showListGuide Pref on a Board
   * @param id The id of the board to update
   * @param value Determines whether to show the list guide.
   * @returns any Success
   * @throws ApiError
   */
  public putBoardsIdMyPrefsShowlistguide(id: TrelloID, value: boolean): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/boards/{id}/myPrefs/showListGuide',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Update showSidebar Pref on a Board
   * @param id The id of the board to update
   * @param value Determines whether to show the side bar.
   * @returns any Success
   * @throws ApiError
   */
  public putBoardsIdMyPrefsShowsidebar(id: TrelloID, value: boolean): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/boards/{id}/myPrefs/showSidebar',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Update showSidebarActivity Pref on a Board
   * @param id The id of the board to update
   * @param value Determines whether to show sidebar activity.
   * @returns any Success
   * @throws ApiError
   */
  public putBoardsIdMyPrefsShowsidebaractivity(
    id: TrelloID,
    value: boolean,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/boards/{id}/myPrefs/showSidebarActivity',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Update showSidebarBoardActions Pref on a Board
   * @param id The id of the board to update
   * @param value Determines whether to show the sidebar board actions.
   * @returns any Success
   * @throws ApiError
   */
  public putBoardsIdMyPrefsShowsidebarboardactions(
    id: TrelloID,
    value: boolean,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/boards/{id}/myPrefs/showSidebarBoardActions',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Update showSidebarMembers Pref on a Board
   * @param id The id of the board to update
   * @param value Determines whether to show members of the board in the sidebar.
   * @returns any Success
   * @throws ApiError
   */
  public putBoardsIdMyPrefsShowsidebarmembers(
    id: TrelloID,
    value: boolean,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/boards/{id}/myPrefs/showSidebarMembers',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Create a Board
   * Create a new board.
   * @param name The new name for the board. 1 to 16384 characters long.
   * @param defaultLabels Determines whether to use the default set of labels.
   * @param defaultLists Determines whether to add the default set of lists to a board (To Do, Doing, Done). It is ignored if `idBoardSource` is provided.
   * @param desc A new description for the board, 0 to 16384 characters long
   * @param idOrganization The id or name of the Workspace the board should belong to.
   * @param idBoardSource The id of a board to copy into the new board.
   * @param keepFromSource To keep cards from the original board pass in the value `cards`
   * @param powerUps The Power-Ups that should be enabled on the new board. One of: `all`, `calendar`, `cardAging`, `recap`, `voting`.
   * @param prefsPermissionLevel The permissions level of the board. One of: `org`, `private`, `public`.
   * @param prefsVoting Who can vote on this board. One of `disabled`, `members`, `observers`, `org`, `public`.
   * @param prefsComments Who can comment on cards on this board. One of: `disabled`, `members`, `observers`, `org`, `public`.
   * @param prefsInvitations Determines what types of members can invite users to join. One of: `admins`, `members`.
   * @param prefsSelfJoin Determines whether users can join the boards themselves or whether they have to be invited.
   * @param prefsCardCovers Determines whether card covers are enabled.
   * @param prefsBackground The id of a custom background or one of: `blue`, `orange`, `green`, `red`, `purple`, `pink`, `lime`, `sky`, `grey`.
   * @param prefsCardAging Determines the type of card aging that should take place on the board if card aging is enabled. One of: `pirate`, `regular`.
   * @returns any Success
   * @throws ApiError
   */
  public postBoards(
    name: string,
    defaultLabels: boolean = true,
    defaultLists: boolean = true,
    desc?: string,
    idOrganization?: TrelloID,
    idBoardSource?: TrelloID,
    keepFromSource: 'cards' | 'none' = 'none',
    powerUps?: 'all' | 'calendar' | 'cardAging' | 'recap' | 'voting',
    prefsPermissionLevel: 'org' | 'private' | 'public' = 'private',
    prefsVoting: 'disabled' | 'members' | 'observers' | 'org' | 'public' = 'disabled',
    prefsComments: 'disabled' | 'members' | 'observers' | 'org' | 'public' = 'members',
    prefsInvitations: 'members' | 'admins' = 'members',
    prefsSelfJoin: boolean = true,
    prefsCardCovers: boolean = true,
    prefsBackground:
      | 'blue'
      | 'orange'
      | 'green'
      | 'red'
      | 'purple'
      | 'pink'
      | 'lime'
      | 'sky'
      | 'grey' = 'blue',
    prefsCardAging: 'pirate' | 'regular' = 'regular',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/boards/',
      query: {
        name: name,
        defaultLabels: defaultLabels,
        defaultLists: defaultLists,
        desc: desc,
        idOrganization: idOrganization,
        idBoardSource: idBoardSource,
        keepFromSource: keepFromSource,
        powerUps: powerUps,
        prefs_permissionLevel: prefsPermissionLevel,
        prefs_voting: prefsVoting,
        prefs_comments: prefsComments,
        prefs_invitations: prefsInvitations,
        prefs_selfJoin: prefsSelfJoin,
        prefs_cardCovers: prefsCardCovers,
        prefs_background: prefsBackground,
        prefs_cardAging: prefsCardAging,
      },
    });
  }

  /**
   * Create a calendarKey for a Board
   * Create a new board.
   * @param id The id of the board to update
   * @returns any Success
   * @throws ApiError
   */
  public postBoardsIdCalendarkeyGenerate(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/boards/{id}/calendarKey/generate',
      path: {
        id: id,
      },
    });
  }

  /**
   * Create a emailKey for a Board
   * @param id The id of the board to update
   * @returns any Success
   * @throws ApiError
   */
  public postBoardsIdEmailkeyGenerate(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/boards/{id}/emailKey/generate',
      path: {
        id: id,
      },
    });
  }

  /**
   * Create a Tag for a Board
   * @param id The id of the board to update
   * @param value The id of a tag from the organization to which this board belongs.
   * @returns any Success
   * @throws ApiError
   */
  public postBoardsIdIdtags(id: TrelloID, value: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/boards/{id}/idTags',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Mark Board as viewed
   * @param id The id of the board to update
   * @returns any Success
   * @throws ApiError
   */
  public postBoardsIdMarkedasviewed(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/boards/{id}/markedAsViewed',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get Enabled Power-Ups on Board
   * Get the enabled Power-Ups on a board
   * @param id The ID of the Board
   * @returns Plugin Success
   * @throws ApiError
   */
  public getBoardsIdBoardplugins(id: TrelloID): CancelablePromise<Array<Plugin>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}/boardPlugins',
      path: {
        id: id,
      },
    });
  }

  /**
   * @deprecated
   * Enable a Power-Up on a Board
   * Enable a Power-Up on a Board
   * @param id The ID of the Board
   * @param idPlugin The ID of the Power-Up to enable
   * @returns any Success
   * @throws ApiError
   */
  public postBoardsIdBoardplugins(id: TrelloID, idPlugin?: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/boards/{id}/boardPlugins',
      path: {
        id: id,
      },
      query: {
        idPlugin: idPlugin,
      },
    });
  }

  /**
   * @deprecated
   * Disable a Power-Up on a Board
   * Disable a Power-Up on a board
   * @param id The ID of the board
   * @param idPlugin The ID of the Power-Up to disable
   * @returns any Success
   * @throws ApiError
   */
  public deleteBoardsIdBoardplugins(id: TrelloID, idPlugin: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/boards/{id}/boardPlugins/{idPlugin}',
      path: {
        id: id,
        idPlugin: idPlugin,
      },
    });
  }

  /**
   * Get Power-Ups on a Board
   * List the Power-Ups on a board
   * @param id The ID of the board
   * @param filter One of: `enabled` or `available`
   * @returns Plugin Success
   * @throws ApiError
   */
  public getBoardIdPlugins(
    id: TrelloID,
    filter: 'enabled' | 'available' = 'enabled',
  ): CancelablePromise<Plugin> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/boards/{id}/plugins',
      path: {
        id: id,
      },
      query: {
        filter: filter,
      },
    });
  }

  /**
   * Create a new Card
   * Create a new card. Query parameters may also be replaced with a JSON request body instead.
   * @param idList The ID of the list the card should be created in
   * @param name The name for the card
   * @param desc The description for the card
   * @param pos The position of the new card. `top`, `bottom`, or a positive float
   * @param due A due date for the card
   * @param start The start date of a card, or `null`
   * @param dueComplete
   * @param idMembers Comma-separated list of member IDs to add to the card
   * @param idLabels Comma-separated list of label IDs to add to the card
   * @param urlSource A URL starting with `http://` or `https://`
   * @param fileSource
   * @param mimeType The mimeType of the attachment. Max length 256
   * @param idCardSource The ID of a card to copy into the new card
   * @param keepFromSource If using `idCardSource` you can specify which properties to copy over. `all` or comma-separated list of: `attachments,checklists,customFields,comments,due,start,labels,members,start,stickers`
   * @param address For use with/by the Map View
   * @param locationName For use with/by the Map View
   * @param coordinates For use with/by the Map View. Should take the form latitude,longitude
   * @returns Card Success
   * @throws ApiError
   */
  public postCards(
    idList: TrelloID,
    name?: string,
    desc?: string,
    pos?: 'top' | 'bottom' | number,
    due?: string,
    start?: string | null,
    dueComplete?: boolean,
    idMembers?: Array<TrelloID>,
    idLabels?: Array<TrelloID>,
    urlSource?: string,
    fileSource?: Blob,
    mimeType?: string,
    idCardSource?: TrelloID,
    keepFromSource:
      | 'all'
      | 'attachments'
      | 'checklists'
      | 'comments'
      | 'customFields'
      | 'due'
      | 'start'
      | 'labels'
      | 'members'
      | 'stickers' = 'all',
    address?: string,
    locationName?: string,
    coordinates?: string,
  ): CancelablePromise<Card> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/cards',
      query: {
        name: name,
        desc: desc,
        pos: pos,
        due: due,
        start: start,
        dueComplete: dueComplete,
        idList: idList,
        idMembers: idMembers,
        idLabels: idLabels,
        urlSource: urlSource,
        fileSource: fileSource,
        mimeType: mimeType,
        idCardSource: idCardSource,
        keepFromSource: keepFromSource,
        address: address,
        locationName: locationName,
        coordinates: coordinates,
      },
    });
  }

  /**
   * Get a Card
   * Get a card by its ID
   * @param id The ID of the Card
   * @param fields `all` or a comma-separated list of [fields](/cloud/trello/guides/rest-api/object-definitions/). **Defaults**: `badges, checkItemStates, closed, dateLastActivity, desc, descData, due, start, email, idBoard, idChecklists, idLabels, idList, idMembers, idShort, idAttachmentCover, manualCoverAttachment, labels, name, pos, shortUrl, url`
   * @param actions See the [Actions Nested Resource](/cloud/trello/guides/rest-api/nested-resources/#actions-nested-resource)
   * @param attachments `true`, `false`, or `cover`
   * @param attachmentFields `all` or a comma-separated list of attachment [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param members Whether to return member objects for members on the card
   * @param memberFields `all` or a comma-separated list of member [fields](/cloud/trello/guides/rest-api/object-definitions/). **Defaults**: `avatarHash, fullName, initials, username`
   * @param membersVoted Whether to return member objects for members who voted on the card
   * @param memberVotedFields `all` or a comma-separated list of member [fields](/cloud/trello/guides/rest-api/object-definitions/). **Defaults**: `avatarHash, fullName, initials, username`
   * @param checkItemStates
   * @param checklists Whether to return the checklists on the card. `all` or `none`
   * @param checklistFields `all` or a comma-separated list of `idBoard,idCard,name,pos`
   * @param board Whether to return the board object the card is on
   * @param boardFields `all` or a comma-separated list of board [fields](/cloud/trello/guides/rest-api/object-definitions/#board-object). **Defaults**: `name, desc, descData, closed, idOrganization, pinned, url, prefs`
   * @param list See the [Lists Nested Resource](/cloud/trello/guides/rest-api/nested-resources/)
   * @param pluginData Whether to include pluginData on the card with the response
   * @param stickers Whether to include sticker models with the response
   * @param stickerFields `all` or a comma-separated list of sticker [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param customFieldItems Whether to include the customFieldItems
   * @returns Card Success
   * @throws ApiError
   */
  public getCardsId(
    id: TrelloID,
    fields?: string,
    actions?: string,
    attachments?: 'cover' | boolean,
    attachmentFields: string = 'all',
    members: boolean = false,
    memberFields?: string,
    membersVoted: boolean = false,
    memberVotedFields?: string,
    checkItemStates: boolean = false,
    checklists: string = 'none',
    checklistFields: string = 'all',
    board: boolean = false,
    boardFields?: string,
    list: boolean = false,
    pluginData: boolean = false,
    stickers: boolean = false,
    stickerFields: string = 'all',
    customFieldItems: boolean = false,
  ): CancelablePromise<Card> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}',
      path: {
        id: id,
      },
      query: {
        fields: fields,
        actions: actions,
        attachments: attachments,
        attachment_fields: attachmentFields,
        members: members,
        member_fields: memberFields,
        membersVoted: membersVoted,
        memberVoted_fields: memberVotedFields,
        checkItemStates: checkItemStates,
        checklists: checklists,
        checklist_fields: checklistFields,
        board: board,
        board_fields: boardFields,
        list: list,
        pluginData: pluginData,
        stickers: stickers,
        sticker_fields: stickerFields,
        customFieldItems: customFieldItems,
      },
    });
  }

  /**
   * Update a Card
   * Update a card. Query parameters may also be replaced with a JSON request body instead.
   * @param id The ID of the Card
   * @param name The new name for the card
   * @param desc The new description for the card
   * @param closed Whether the card should be archived (closed: true)
   * @param idMembers Comma-separated list of member IDs
   * @param idAttachmentCover The ID of the image attachment the card should use as its cover, or null for none
   * @param idList The ID of the list the card should be in
   * @param idLabels Comma-separated list of label IDs
   * @param idBoard The ID of the board the card should be on
   * @param pos The position of the card in its list. `top`, `bottom`, or a positive float
   * @param due When the card is due, or `null`
   * @param start The start date of a card, or `null`
   * @param dueComplete Whether the due date should be marked complete
   * @param subscribed Whether the member is should be subscribed to the card
   * @param address For use with/by the Map View
   * @param locationName For use with/by the Map View
   * @param coordinates For use with/by the Map View. Should be latitude,longitude
   * @param cover Updates the card's cover
   * | Option | Values | About |
   * |--------|--------|-------|
   * | color | `pink`, `yellow`, `lime`, `blue`, `black`, `orange`, `red`, `purple`, `sky`, `green` | Makes the cover a solid color . |
   * | brightness | `dark`, `light` | Determines whether the text on the cover should be dark or light.
   * | url | An unsplash URL: https://images.unsplash.com | Used if making an image the cover. Only Unsplash URLs work.
   * | idAttachment | ID of an attachment on the card | Used if setting an attached image as the cover. |
   * | size | `normal`, `full` | Determines whether to show the card name on the cover, or below it. |
   *
   * `brightness` can be sent alongside any of the other parameters, but all of the other parameters are mutually exclusive; you can not have the cover be a `color` and an `idAttachment` at the same time.
   *
   * On the brightness options, setting it to light will make the text on the card cover dark:
   * ![](/cloud/trello/images/rest/cards/cover-brightness-dark.png)
   *
   * And vice versa, setting it to dark will make the text on the card cover light:
   * ![](/cloud/trello/images/rest/cards/cover-brightness-light.png)
   * @returns Card Success
   * @throws ApiError
   */
  public putCardsId(
    id: TrelloID,
    name?: string,
    desc?: string,
    closed?: boolean,
    idMembers?: TrelloID,
    idAttachmentCover?: TrelloID,
    idList?: TrelloID,
    idLabels?: TrelloID,
    idBoard?: TrelloID,
    pos?: 'top' | 'bottom' | number,
    due?: string | null,
    start?: string | null,
    dueComplete?: boolean,
    subscribed?: boolean,
    address?: string,
    locationName?: string,
    coordinates?: string,
    cover?: {
      /**
       * An object containing information regarding the card's cover
       * `brightness` can be sent alongside any of the other parameters, but all of the other parameters are mutually exclusive; you can not have the cover be a color and an `idAttachment` at the same time.
       */
      value?: {
        /**
         * One of: `pink, yellow, lime, blue, black, orange, red, purple, sky, green`
         */
        color?:
          | 'pink'
          | 'yellow'
          | 'lime'
          | 'blue'
          | 'black'
          | 'orange'
          | 'red'
          | 'purple'
          | 'sky'
          | 'green';
        /**
         * Determines whether the text on the cover should be dark or light. Setting it to `light` will make the text on the card cover dark. And vice versa, setting it to dark will make the text on the card cover light
         */
        brightness?: 'dark' | 'light';
        /**
         * Used if making an image the cover. Only Unsplash URLs (https://images.unsplash.com/) work.
         */
        url?: string;
      };
    },
  ): CancelablePromise<Card> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/cards/{id}',
      path: {
        id: id,
      },
      query: {
        name: name,
        desc: desc,
        closed: closed,
        idMembers: idMembers,
        idAttachmentCover: idAttachmentCover,
        idList: idList,
        idLabels: idLabels,
        idBoard: idBoard,
        pos: pos,
        due: due,
        start: start,
        dueComplete: dueComplete,
        subscribed: subscribed,
        address: address,
        locationName: locationName,
        coordinates: coordinates,
        cover: cover,
      },
    });
  }

  /**
   * Delete a Card
   * Delete a Card
   * @param id The ID of the Card
   * @returns any Success
   * @throws ApiError
   */
  public deleteCardsId(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/cards/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get a field on a Card
   * Get a specific property of a card
   * @param id The ID of the Card
   * @param field The desired field.
   * @returns Card Success
   * @throws ApiError
   */
  public getCardsIdField(id: TrelloID, field: CardFields): CancelablePromise<Card> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/{field}',
      path: {
        id: id,
        field: field,
      },
    });
  }

  /**
   * Get Actions on a Card
   * List the Actions on a Card
   * @param id The ID of the Card
   * @param filter A comma-separated list of [action types](https://developer.atlassian.com/cloud/trello/guides/rest-api/action-types/).
   * @param page The page of results for actions. Each page of results has 50 actions.
   * @returns Action Success
   * @throws ApiError
   */
  public getCardsIdActions(
    id: TrelloID,
    filter: string = 'commentCard, updateCard:idList',
    page?: number,
  ): CancelablePromise<Array<Action>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/actions',
      path: {
        id: id,
      },
      query: {
        filter: filter,
        page: page,
      },
    });
  }

  /**
   * Get Attachments on a Card
   * List the attachments on a card
   * @param id The ID of the Card
   * @param fields `all` or a comma-separated list of attachment [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param filter Use `cover` to restrict to just the cover attachment
   * @returns any Success
   * @throws ApiError
   */
  public getCardsIdAttachments(
    id: TrelloID,
    fields: string = 'all',
    filter: string = 'false',
  ): CancelablePromise<Array<Attachment>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/attachments',
      path: {
        id: id,
      },
      query: {
        fields: fields,
        filter: filter,
      },
    });
  }

  /**
   * Create Attachment On Card
   * Create an Attachment to a Card
   * @param id The ID of the Card
   * @param name The name of the attachment. Max length 256.
   * @param file The file to attach, as multipart/form-data
   * @param mimeType The mimeType of the attachment. Max length 256
   * @param url A URL to attach. Must start with `http://` or `https://`
   * @param setCover Determines whether to use the new attachment as a cover for the Card.
   * @returns any Success
   * @throws ApiError
   */
  public postCardsIdAttachments(
    id: TrelloID,
    name?: string,
    file?: Blob,
    mimeType?: string,
    url?: string,
    setCover: boolean = false,
  ): CancelablePromise<Array<Attachment>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/cards/{id}/attachments',
      path: {
        id: id,
      },
      query: {
        name: name,
        file: file,
        mimeType: mimeType,
        url: url,
        setCover: setCover,
      },
    });
  }

  /**
   * Get an Attachment on a Card
   * Get a specific Attachment on a Card.
   * @param id The ID of the Card
   * @param idAttachment The ID of the Attachment
   * @param fields The Attachment fields to be included in the response.
   * @returns any Success
   * @throws ApiError
   */
  public getCardsIdAttachmentsIdattachment(
    id: TrelloID,
    idAttachment: TrelloID,
    fields?: Array<AttachmentFields>,
  ): CancelablePromise<Array<Attachment>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/attachments/{idAttachment}',
      path: {
        id: id,
        idAttachment: idAttachment,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Delete an Attachment on a Card
   * Delete an Attachment
   * @param id The ID of the Card
   * @param idAttachment The ID of the Attachment
   * @param id The ID of the Card
   * @param idAttachment The ID of the attachment to delete
   * @returns any Success
   * @throws ApiError
   */
  public deletedCardsIdAttachmentsIdattachment(
    id: TrelloID,
    idAttachment: TrelloID,
    id: TrelloID,
    idAttachment: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/cards/{id}/attachments/{idAttachment}',
      path: {
        id: id,
        idAttachment: idAttachment,
        id: id,
        idAttachment: idAttachment,
      },
    });
  }

  /**
   * Get the Board the Card is on
   * Get the board a card is on
   * @param id The ID of the Card
   * @param fields `all` or a comma-separated list of board [fields](/cloud/trello/guides/rest-api/object-definitions/#board-object)
   * @returns any Success
   * @throws ApiError
   */
  public getCardsIdBoard(id: TrelloID, fields: string = 'all'): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/board',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get checkItems on a Card
   * Get the completed checklist items on a card
   * @param id The ID of the Card
   * @param fields `all` or a comma-separated list of: `idCheckItem`, `state`
   * @returns any Success
   * @throws ApiError
   */
  public getCardsIdCheckitemstates(id: TrelloID, fields: string = 'all'): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/checkItemStates',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get Checklists on a Card
   * Get the checklists on a card
   * @param id The ID of the Card
   * @param checkItems `all` or `none`
   * @param checkItemFields `all` or a comma-separated list of: `name,nameData,pos,state,type,due,dueReminder,idMember`
   * @param filter `all` or `none`
   * @param fields `all` or a comma-separated list of: `idBoard,idCard,name,pos`
   * @returns any Success
   * @throws ApiError
   */
  public getCardsIdChecklists(
    id: TrelloID,
    checkItems: 'all' | 'none' = 'all',
    checkItemFields:
      | 'name'
      | 'nameData'
      | 'pos'
      | 'state'
      | 'type'
      | 'due'
      | 'dueReminder'
      | 'idMember' = 'name,nameData,pos,state,due,dueReminder,idMember',
    filter: 'all' | 'none' = 'all',
    fields: 'all' | 'name' | 'nameData' | 'pos' | 'state' | 'type' = 'all',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/checklists',
      path: {
        id: id,
      },
      query: {
        checkItems: checkItems,
        checkItem_fields: checkItemFields,
        filter: filter,
        fields: fields,
      },
    });
  }

  /**
   * Create Checklist on a Card
   * Create a new checklist on a card
   * @param id The ID of the Card
   * @param name The name of the checklist
   * @param idChecklistSource The ID of a source checklist to copy into the new one
   * @param pos The position of the checklist on the card. One of: `top`, `bottom`, or a positive number.
   * @returns any Success
   * @throws ApiError
   */
  public postCardsIdChecklists(
    id: TrelloID,
    name?: string,
    idChecklistSource?: TrelloID,
    pos?: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/cards/{id}/checklists',
      path: {
        id: id,
      },
      query: {
        name: name,
        idChecklistSource: idChecklistSource,
        pos: pos,
      },
    });
  }

  /**
   * Get checkItem on a Card
   * Get a specific checkItem on a card
   * @param id The ID of the Card
   * @param idCheckItem The ID of the checkitem
   * @param fields `all` or a comma-separated list of `name,nameData,pos,state,type,due,dueReminder,idMember`
   * @returns any Success
   * @throws ApiError
   */
  public getCardsIdCheckitemIdcheckitem(
    id: TrelloID,
    idCheckItem: TrelloID,
    fields: string = 'name,nameData,pos,state,due,dueReminder,idMember',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/checkItem/{idCheckItem}',
      path: {
        id: id,
        idCheckItem: idCheckItem,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Update a checkItem on a Card
   * Update an item in a checklist on a card.
   * @param id The ID of the Card
   * @param idCheckItem The ID of the checkitem
   * @param name The new name for the checklist item
   * @param state One of: `complete`, `incomplete`
   * @param idChecklist The ID of the checklist this item is in
   * @param pos `top`, `bottom`, or a positive float
   * @param due A due date for the checkitem
   * @param dueReminder A dueReminder for the due date on the checkitem
   * @param idMember The ID of the member to remove from the card
   * @returns any Success
   * @throws ApiError
   */
  public putCardsIdCheckitemIdcheckitem(
    id: TrelloID,
    idCheckItem: TrelloID,
    name?: string,
    state?: 'complete' | 'incomplete',
    idChecklist?: TrelloID,
    pos?: posStringOrNumber,
    due?: string,
    dueReminder?: number | null,
    idMember?: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/cards/{id}/checkItem/{idCheckItem}',
      path: {
        id: id,
        idCheckItem: idCheckItem,
      },
      query: {
        name: name,
        state: state,
        idChecklist: idChecklist,
        pos: pos,
        due: due,
        dueReminder: dueReminder,
        idMember: idMember,
      },
    });
  }

  /**
   * Delete checkItem on a Card
   * Delete a checklist item
   * @param id The ID of the Card
   * @param idCheckItem The ID of the checkitem
   * @returns any Success
   * @throws ApiError
   */
  public deleteCardsIdCheckitemIdcheckitem(
    id: TrelloID,
    idCheckItem: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/cards/{id}/checkItem/{idCheckItem}',
      path: {
        id: id,
        idCheckItem: idCheckItem,
      },
    });
  }

  /**
   * Get the List of a Card
   * Get the list a card is in
   * @param id The ID of the Card
   * @param fields `all` or a comma-separated list of list [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getCardsIdList(id: TrelloID, fields: string = 'all'): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/list',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get the Members of a Card
   * Get the members on a card
   * @param id The ID of the Card
   * @param fields `all` or a comma-separated list of member [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getCardsIdMembers(
    id: TrelloID,
    fields: string = 'avatarHash,fullName,initials,username',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/members',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get Members who have voted on a Card
   * Get the members who have voted on a card
   * @param id The ID of the Card
   * @param fields `all` or a comma-separated list of member [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getCardsIdMembersvoted(
    id: TrelloID,
    fields: string = 'avatarHash,fullName,initials,username',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/membersVoted',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Add Member vote to Card
   * Vote on the card for a given member.
   * @param id The ID of the Card
   * @param value The ID of the member to vote 'yes' on the card
   * @returns any Success
   * @throws ApiError
   */
  public cardsidmembersvoted1(id: TrelloID, value: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/cards/{id}/membersVoted',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Get pluginData on a Card
   * Get any shared pluginData on a card.
   * @param id The ID of the Card
   * @returns any Success
   * @throws ApiError
   */
  public getCardsIdPlugindata(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/pluginData',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get Stickers on a Card
   * Get the stickers on a card
   * @param id The ID of the Card
   * @param id The ID of the Card
   * @param fields `all` or a comma-separated list of sticker [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getCardsIdStickers(
    id: TrelloID,
    id: TrelloID,
    fields: string = 'all',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/stickers',
      path: {
        id: id,
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Add a Sticker to a Card
   * Add a sticker to a card
   * @param id The ID of the Card
   * @param image For custom stickers, the id of the sticker. For default stickers, the string identifier (like 'taco-cool', see below)
   * @param top The top position of the sticker, from -60 to 100
   * @param left The left position of the sticker, from -60 to 100
   * @param zIndex The z-index of the sticker
   * @param rotate The rotation of the sticker
   * @returns any Success
   * @throws ApiError
   */
  public postCardsIdStickers(
    id: TrelloID,
    image: string,
    top: number,
    left: number,
    zIndex: number,
    rotate?: number,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/cards/{id}/stickers',
      path: {
        id: id,
      },
      query: {
        image: image,
        top: top,
        left: left,
        zIndex: zIndex,
        rotate: rotate,
      },
    });
  }

  /**
   * Get a Sticker on a Card
   * Get a specific sticker on a card
   * @param id The ID of the Card
   * @param idSticker The ID of the sticker
   * @param fields `all` or a comma-separated list of sticker [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getCardsIdStickersIdsticker(
    id: TrelloID,
    idSticker: TrelloID,
    fields: string = 'all',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/stickers/{idSticker}',
      path: {
        id: id,
        idSticker: idSticker,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Delete a Sticker on a Card
   * Remove a sticker from the card
   * @param id The ID of the Card
   * @param idSticker The ID of the sticker
   * @returns any Success
   * @throws ApiError
   */
  public deleteCardsIdStickersIdsticker(id: TrelloID, idSticker: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/cards/{id}/stickers/{idSticker}',
      path: {
        id: id,
        idSticker: idSticker,
      },
    });
  }

  /**
   * Update a Sticker on a Card
   * Update a sticker on a card
   * @param id The ID of the Card
   * @param idSticker The ID of the sticker
   * @param top The top position of the sticker, from -60 to 100
   * @param left The left position of the sticker, from -60 to 100
   * @param zIndex The z-index of the sticker
   * @param rotate The rotation of the sticker
   * @returns any Success
   * @throws ApiError
   */
  public putCardsIdStickersIdsticker(
    id: TrelloID,
    idSticker: TrelloID,
    top: number,
    left: number,
    zIndex: number,
    rotate?: number,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/cards/{id}/stickers/{idSticker}',
      path: {
        id: id,
        idSticker: idSticker,
      },
      query: {
        top: top,
        left: left,
        zIndex: zIndex,
        rotate: rotate,
      },
    });
  }

  /**
   * Update Comment Action on a Card
   * Update an existing comment
   * @param id The ID of the Card
   * @param idAction The ID of the comment action to update
   * @param text The new text for the comment
   * @returns any Success
   * @throws ApiError
   */
  public putCardsIdActionsIdactionComments(
    id: TrelloID,
    idAction: TrelloID,
    text: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/cards/{id}/actions/{idAction}/comments',
      path: {
        id: id,
        idAction: idAction,
      },
      query: {
        text: text,
      },
    });
  }

  /**
   * Delete a comment on a Card
   * Delete a comment
   * @param id The ID of the Card
   * @param idAction The ID of the comment action to update
   * @returns any Success
   * @throws ApiError
   */
  public deleteCardsIdActionsIdComments(id: TrelloID, idAction: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/cards/{id}/actions/{idAction}/comments',
      path: {
        id: id,
        idAction: idAction,
      },
    });
  }

  /**
   * Update Custom Field item on Card
   * Setting, updating, and removing the value for a Custom Field on a card. For more details on updating custom fields check out the [Getting Started With Custom Fields](/cloud/trello/guides/rest-api/getting-started-with-custom-fields/)
   * @param idCard ID of the card that the Custom Field value should be set/updated for
   * @param idCustomField ID of the Custom Field on the card.
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
  public putCardsIdcardCustomfieldIdcustomfieldItem(
    idCard: TrelloID,
    idCustomField: TrelloID,
    requestBody?:
      | {
          /**
           * An object containing the key and value to set for the card's Custom Field value. The key used to set the value should match the type of Custom Field defined.
           */
          value?: {
            text?: string;
            checked?: boolean;
            date?: string;
            number?: number;
          };
        }
      | {
          /**
           * The ID of the option for the list type Custom Field
           */
          idValue?: TrelloID;
        },
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/cards/{idCard}/customField/{idCustomField}/item',
      path: {
        idCard: idCard,
        idCustomField: idCustomField,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Update Multiple Custom Field items on Card
   * Setting, updating, and removing the values for multiple Custom Fields on a card. For more details on updating custom fields check out the [Getting Started With Custom Fields](/cloud/trello/guides/rest-api/getting-started-with-custom-fields/)
   * @param requestBody
   * @returns any Success
   * @throws ApiError
   */
  public putCardsIdcardCustomfields(requestBody?: {
    /**
     * An array of objects containing the custom field ID, key and value, and ID of list type option.
     */
    customFieldItems?: Array<{
      /**
       * The ID of the Custom Field
       */
      idCustomField?: any;
      /**
       * An object containing the key and value to set for the card's Custom Field value. The key used to set the value should match the type of Custom Field defined. This is optional if Custom Field is list type.
       */
      value?: {
        text?: string;
        checked?: boolean;
        date?: string;
        number?: number;
      };
      /**
       * The ID of the option for the list type Custom Field. This is optional if Custom Field is not list type.
       */
      idValue?: any;
    }>;
  }): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/cards/{idCard}/customFields',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Get Custom Field Items for a Card
   * Get the custom field items for a card.
   * @param id The ID of the Card
   * @returns CustomFieldItems Success
   * @throws ApiError
   */
  public getCardsIdCustomfielditems(id: TrelloID): CancelablePromise<Array<CustomFieldItems>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/cards/{id}/customFieldItems',
      path: {
        id: id,
      },
    });
  }

  /**
   * Add a new comment to a Card
   * Add a new comment to a card
   * @param id The ID of the Card
   * @param text The comment
   * @returns Action Success
   * @throws ApiError
   */
  public postCardsIdActionsComments(id: TrelloID, text: string): CancelablePromise<Action> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/cards/{id}/actions/comments',
      path: {
        id: id,
      },
      query: {
        text: text,
      },
    });
  }

  /**
   * Add a Label to a Card
   * Add a label to a card
   * @param id The ID of the Card
   * @param value The ID of the label to add
   * @returns any Success
   * @throws ApiError
   */
  public postCardsIdIdlabels(id: TrelloID, value?: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/cards/{id}/idLabels',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Add a Member to a Card
   * Add a member to a card
   * @param id The ID of the Card
   * @param value The ID of the Member to add to the card
   * @returns any Success
   * @throws ApiError
   */
  public postCardsIdIdmembers(id: TrelloID, value?: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/cards/{id}/idMembers',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Create a new Label on a Card
   * Create a new label for the board and add it to the given card.
   * @param id The ID of the Card
   * @param color A valid label color or `null`. See [labels](/cloud/trello/guides/rest-api/object-definitions/)
   * @param name A name for the label
   * @returns any Success
   * @throws ApiError
   */
  public postCardsIdLabels(id: TrelloID, color: string, name?: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/cards/{id}/labels',
      path: {
        id: id,
      },
      query: {
        color: color,
        name: name,
      },
    });
  }

  /**
   * Mark a Card's Notifications as read
   * Mark notifications about this card as read
   * @param id The ID of the Card
   * @returns any Success
   * @throws ApiError
   */
  public postCardsIdMarkassociatednotificationsread(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/cards/{id}/markAssociatedNotificationsRead',
      path: {
        id: id,
      },
    });
  }

  /**
   * Remove a Label from a Card
   * Remove a label from a card
   * @param id The ID of the Card
   * @param idLabel The ID of the label to remove
   * @returns any Success
   * @throws ApiError
   */
  public deleteCardsIdIdlabelsIdlabel(id: TrelloID, idLabel: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/cards/{id}/idLabels/{idLabel}',
      path: {
        id: id,
        idLabel: idLabel,
      },
    });
  }

  /**
   * Remove a Member from a Card
   * Remove a member from a card
   * @param id The ID of the Card
   * @param idMember The ID of the member to remove from the card
   * @returns any Success
   * @throws ApiError
   */
  public deleteIdIdmembersIdmember(id: TrelloID, idMember: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/cards/{id}/idMembers/{idMember}',
      path: {
        id: id,
        idMember: idMember,
      },
    });
  }

  /**
   * Remove a Member's Vote on a Card
   * Remove a member's vote from a card
   * @param id The ID of the Card
   * @param idMember The ID of the member whose vote to remove
   * @returns any Success
   * @throws ApiError
   */
  public deleteCardsIdMembersvotedIdmember(
    id: TrelloID,
    idMember: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/cards/{id}/membersVoted/{idMember}',
      path: {
        id: id,
        idMember: idMember,
      },
    });
  }

  /**
   * Update Checkitem on Checklist on Card
   * Update an item in a checklist on a card.
   * @param idCard The ID of the Card
   * @param idCheckItem The ID of the checklist item to update
   * @param idChecklist The ID of the item to update.
   * @param pos `top`, `bottom`, or a positive float
   * @returns CheckItem Success
   * @throws ApiError
   */
  public putCardsIdcardChecklistIdchecklistCheckitemIdcheckitem(
    idCard: TrelloID,
    idCheckItem: TrelloID,
    idChecklist: TrelloID,
    pos?: posStringOrNumber,
  ): CancelablePromise<CheckItem> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/cards/{idCard}/checklist/{idChecklist}/checkItem/{idCheckItem}',
      path: {
        idCard: idCard,
        idCheckItem: idCheckItem,
        idChecklist: idChecklist,
      },
      query: {
        pos: pos,
      },
    });
  }

  /**
   * Delete a Checklist on a Card
   * Delete a checklist from a card
   * @param id The ID of the Card
   * @param idChecklist The ID of the checklist to delete
   * @returns any Success
   * @throws ApiError
   */
  public deleteCardsIdChecklistsIdchecklist(
    id: TrelloID,
    idChecklist: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/cards/{id}/checklists/{idChecklist}',
      path: {
        id: id,
        idChecklist: idChecklist,
      },
    });
  }

  /**
   * Create a Checklist
   * @param idCard The ID of the Card that the checklist should be added to.
   * @param name The name of the checklist. Should be a string of length 1 to 16384.
   * @param pos The position of the checklist on the card. One of: `top`, `bottom`, or a positive number.
   * @param idChecklistSource The ID of a checklist to copy into the new checklist.
   * @returns any Success
   * @throws ApiError
   */
  public postChecklists(
    idCard: TrelloID,
    name?: string,
    pos?: posStringOrNumber,
    idChecklistSource?: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/checklists',
      query: {
        idCard: idCard,
        name: name,
        pos: pos,
        idChecklistSource: idChecklistSource,
      },
    });
  }

  /**
   * Get a Checklist
   * @param id ID of a checklist.
   * @param cards Valid values: `all`, `closed`, `none`, `open`, `visible`. Cards is a nested resource. The additional query params available are documented at [Cards Nested Resource](/cloud/trello/guides/rest-api/nested-resources/#cards-nested-resource).
   * @param checkItems The check items on the list to return. One of: `all`, `none`.
   * @param checkItemFields The fields on the checkItem to return if checkItems are being returned. `all` or a comma-separated list of: `name`, `nameData`, `pos`, `state`, `type`, `due`, `dueReminder`, `idMember`
   * @param fields `all` or a comma-separated list of checklist [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getChecklistsId(
    id: TrelloID,
    cards: 'all' | 'closed' | 'none' | 'open' | 'visible' = 'none',
    checkItems: 'all' | 'none' = 'all',
    checkItemFields:
      | 'all'
      | 'name'
      | 'nameData'
      | 'pos'
      | 'state'
      | 'type'
      | 'due'
      | 'dueReminder'
      | 'idMember' = 'name, nameData, pos, state, due, dueReminder, idMember',
    fields: string = 'all',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/checklists/{id}',
      path: {
        id: id,
      },
      query: {
        cards: cards,
        checkItems: checkItems,
        checkItem_fields: checkItemFields,
        fields: fields,
      },
    });
  }

  /**
   * Update a Checklist
   * Update an existing checklist.
   * @param id ID of a checklist.
   * @param name Name of the new checklist being created. Should be length of 1 to 16384.
   * @param pos Determines the position of the checklist on the card. One of: `top`, `bottom`, or a positive number.
   * @returns any Success
   * @throws ApiError
   */
  public putCheclistsId(
    id: TrelloID,
    name?: string,
    pos?: posStringOrNumber,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/checklists/{id}',
      path: {
        id: id,
      },
      query: {
        name: name,
        pos: pos,
      },
    });
  }

  /**
   * Delete a Checklist
   * Delete a checklist
   * @param id ID of a checklist.
   * @returns any Success
   * @throws ApiError
   */
  public deleteChecklistsId(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/checklists/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get field on a Checklist
   * @param id ID of a checklist.
   * @param field Field to update.
   * @returns any Success
   * @throws ApiError
   */
  public getChecklistsIdField(id: TrelloID, field: 'name' | 'pos'): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/checklists/{id}/{field}',
      path: {
        id: id,
        field: field,
      },
    });
  }

  /**
   * Update field on a Checklist
   * @param id ID of a checklist.
   * @param field Field to update.
   * @param value The value to change the checklist name to. Should be a string of length 1 to 16384.
   * @returns any Success
   * @throws ApiError
   */
  public putChecklistsIdField(
    id: TrelloID,
    field: 'name' | 'pos',
    value: posStringOrNumber | TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/checklists/{id}/{field}',
      path: {
        id: id,
        field: field,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Get the Board the Checklist is on
   * @param id ID of a checklist.
   * @param fields `all` or a comma-separated list of board [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getChecklistsIdBoard(
    id: TrelloID,
    fields: 'all' | 'name' = 'all',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/checklists/{id}/board',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get the Card a Checklist is on
   * @param id ID of a checklist.
   * @returns any Success
   * @throws ApiError
   */
  public getChecklistsIdCards(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/checklists/{id}/cards',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get Checkitems on a Checklist
   * @param id ID of a checklist.
   * @param filter One of: `all`, `none`.
   * @param fields One of: `all`, `name`, `nameData`, `pos`, `state`,`type`, `due`, `dueReminder`, `idMember`.
   * @returns any Success
   * @throws ApiError
   */
  public getChecklistsIdCheckitems(
    id: TrelloID,
    filter: 'all' | 'none' = 'all',
    fields:
      | 'all'
      | 'name'
      | 'nameData'
      | 'pos'
      | 'state'
      | 'type'
      | 'due'
      | 'dueReminder'
      | 'idMember' = 'name, nameData, pos, state, due, dueReminder, idMember',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/checklists/{id}/checkItems',
      path: {
        id: id,
      },
      query: {
        filter: filter,
        fields: fields,
      },
    });
  }

  /**
   * Create Checkitem on Checklist
   * @param id ID of a checklist.
   * @param name The name of the new check item on the checklist. Should be a string of length 1 to 16384.
   * @param pos The position of the check item in the checklist. One of: `top`, `bottom`, or a positive number.
   * @param checked Determines whether the check item is already checked when created.
   * @param due A due date for the checkitem
   * @param dueReminder A dueReminder for the due date on the checkitem
   * @param idMember An ID of a member resource.
   * @returns any Success
   * @throws ApiError
   */
  public postChecklistsIdCheckitems(
    id: TrelloID,
    name: string,
    pos: posStringOrNumber = 'bottom',
    checked: boolean = false,
    due?: string,
    dueReminder?: number | null,
    idMember?: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/checklists/{id}/checkItems',
      path: {
        id: id,
      },
      query: {
        name: name,
        pos: pos,
        checked: checked,
        due: due,
        dueReminder: dueReminder,
        idMember: idMember,
      },
    });
  }

  /**
   * Get a Checkitem on a Checklist
   * @param id ID of a checklist.
   * @param idCheckItem ID of the check item to retrieve.
   * @param fields One of: `all`, `name`, `nameData`, `pos`, `state`, `type`, `due`, `dueReminder`, `idMember`,.
   * @returns any Success
   * @throws ApiError
   */
  public getChecklistsIdCheckitemsIdcheckitem(
    id: TrelloID,
    idCheckItem: TrelloID,
    fields:
      | 'all'
      | 'name'
      | 'nameData'
      | 'pos'
      | 'state'
      | 'type'
      | 'due'
      | 'dueReminder'
      | 'idMember' = 'name, nameData, pos, state, due, dueReminder, idMember',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/checklists/{id}/checkItems/{idCheckItem}',
      path: {
        id: id,
        idCheckItem: idCheckItem,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Delete Checkitem from Checklist
   * Remove an item from a checklist
   * @param id ID of a checklist.
   * @param idCheckItem ID of the check item to retrieve.
   * @returns any Success
   * @throws ApiError
   */
  public deleteChecklistsIdCheckitemsIdcheckitem(
    id: TrelloID,
    idCheckItem: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/checklists/{id}/checkItems/{idCheckItem}',
      path: {
        id: id,
        idCheckItem: idCheckItem,
      },
    });
  }

  /**
   * Create a new Custom Field on a Board
   * Create a new Custom Field on a board.
   * @param requestBody
   * @returns CustomField Success
   * @throws ApiError
   */
  public postCustomfields(requestBody?: {
    /**
     * The ID of the model for which the Custom Field is being defined. This should always be the ID of a board.
     */
    idModel: TrelloID;
    /**
     * The type of model that the Custom Field is being defined on. This should always be `board`.
     */
    modelType: 'board';
    /**
     * The name of the Custom Field
     */
    name: string;
    /**
     * The type of Custom Field to create.
     */
    type: 'checkbox' | 'list' | 'number' | 'text' | 'date';
    /**
     * If the type is `checkbox`
     */
    options?: string;
    pos: posStringOrNumber;
    /**
     * Whether this Custom Field should be shown on the front of Cards
     */
    display_cardFront?: boolean;
  }): CancelablePromise<CustomField> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/customFields',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Get a Custom Field
   * @param id ID of the Custom Field.
   * @returns CustomField Success
   * @throws ApiError
   */
  public getCustomfieldsId(id: TrelloID): CancelablePromise<CustomField> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/customFields/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Update a Custom Field definition
   * Update a Custom Field definition.
   * @param id ID of the Custom Field.
   * @param requestBody
   * @returns CustomField Success
   * @throws ApiError
   */
  public putCustomfieldsId(
    id: TrelloID,
    requestBody?: {
      /**
       * The name of the Custom Field
       */
      name?: string;
      pos?: posStringOrNumber;
      /**
       * Whether to display this custom field on the front of cards
       */
      'display/cardFront'?: boolean;
    },
  ): CancelablePromise<CustomField> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/customFields/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Delete a Custom Field definition
   * Delete a Custom Field from a board.
   * @param id ID of the Custom Field.
   * @returns any Success
   * @throws ApiError
   */
  public deleteCustomfieldsId(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/customFields/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Add Option to Custom Field dropdown
   * Add an option to a dropdown Custom Field
   * @param id ID of the customfield.
   * @returns any Success
   * @throws ApiError
   */
  public getCustomfieldsIdOptions(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/customFields/{id}/options',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get Options of Custom Field drop down
   * Get the options of a drop down Custom Field
   * @param id ID of the customfield.
   * @returns any Success
   * @throws ApiError
   */
  public postCustomfieldsIdOptions(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/customFields/{id}/options',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get Option of Custom Field dropdown
   * Retrieve a specific, existing Option on a given dropdown-type Custom Field
   * @param id ID of the customfielditem.
   * @param idCustomFieldOption ID of the customfieldoption to retrieve.
   * @returns any Success
   * @throws ApiError
   */
  public getCustomfieldsOptionsIdcustomfieldoption(
    id: TrelloID,
    idCustomFieldOption: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/customFields/{id}/options/{idCustomFieldOption}',
      path: {
        id: id,
        idCustomFieldOption: idCustomFieldOption,
      },
    });
  }

  /**
   * Delete Option of Custom Field dropdown
   * Delete an option from a Custom Field dropdown.
   * @param id ID of the customfielditem.
   * @param idCustomFieldOption ID of the customfieldoption to retrieve.
   * @returns any Success
   * @throws ApiError
   */
  public deleteCustomfieldsOptionsIdcustomfieldoption(
    id: TrelloID,
    idCustomFieldOption: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/customFields/{id}/options/{idCustomFieldOption}',
      path: {
        id: id,
        idCustomFieldOption: idCustomFieldOption,
      },
    });
  }

  /**
   * List available Emoji
   * List available Emoji
   * @param locale The locale to return emoji descriptions and names in. Defaults to the logged in member's locale.
   * @param spritesheets `true` to return spritesheet URLs in the response
   * @returns Emoji Success
   * @throws ApiError
   */
  public emoji(locale?: string, spritesheets: boolean = false): CancelablePromise<Emoji> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/emoji',
      query: {
        locale: locale,
        spritesheets: spritesheets,
      },
    });
  }

  /**
   * Get an Enterprise
   * Get an enterprise by its ID.
   * @param id ID of the enterprise to retrieve.
   * @param fields Comma-separated list of: `id`, `name`, `displayName`, `prefs`, `ssoActivationFailed`, `idAdmins`, `idMembers` (Note that the members array returned will be paginated if `members` is 'normal' or 'admins'. Pagination can be controlled with member_startIndex, etc, but the API response will not contain the total available result count or pagination status data. Read the SCIM documentation [here]() for more information on filtering), `idOrganizations`, `products`, `userTypes`, `idMembers`, `idOrganizations`
   * @param members One of: `none`, `normal`, `admins`, `owners`, `all`
   * @param memberFields One of: `avatarHash`, `fullName`, `initials`, `username`
   * @param memberFilter Pass a [SCIM-style query](/cloud/trello/scim/) to filter members. This takes precedence over the all/normal/admins value of members. If any of the member_* args are set, the member array will be paginated.
   * @param memberSort This parameter expects a [SCIM-style](/cloud/trello/scim/) sorting value prefixed by a `-` to sort descending. If no `-` is prefixed, it will be sorted ascending. Note that the members array returned will be paginated if `members` is 'normal' or 'admins'. Pagination can be controlled with member_startIndex, etc, but the API response will not contain the total available result count or pagination status data.
   * @param memberSortBy Deprecated: Please use member_sort. This parameter expects a [SCIM-style sorting value](/cloud/trello/scim/). Note that the members array returned will be paginated if `members` is `normal` or `admins`. Pagination can be controlled with `member_startIndex`, etc, and the API response's header will contain the total count and pagination state.
   * @param memberSortOrder Deprecated: Please use member_sort. One of: `ascending`, `descending`, `asc`, `desc`
   * @param memberStartIndex Any integer between 0 and 100.
   * @param memberCount 0 to 100
   * @param organizations One of: `none`, `members`, `public`, `all`
   * @param organizationFields Any valid value that the [nested organization field resource]() accepts.
   * @param organizationPaidAccounts Whether or not to include paid account information in the returned workspace objects
   * @param organizationMemberships Comma-seperated list of: `me`, `normal`, `admin`, `active`, `deactivated`
   * @returns Enterprise Success
   * @throws ApiError
   */
  public getEnterprisesId(
    id: TrelloID,
    fields: string = 'all',
    members: string = 'none',
    memberFields: string = 'avatarHash, fullName, initials, username',
    memberFilter: string = 'none',
    memberSort?: string,
    memberSortBy: string = 'none',
    memberSortOrder: string = 'id',
    memberStartIndex: number = 1,
    memberCount: number = 10,
    organizations: string = 'none',
    organizationFields: string = 'none',
    organizationPaidAccounts: boolean = false,
    organizationMemberships: string = 'none',
  ): CancelablePromise<Enterprise> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/enterprises/{id}',
      path: {
        id: id,
      },
      query: {
        fields: fields,
        members: members,
        member_fields: memberFields,
        member_filter: memberFilter,
        member_sort: memberSort,
        member_sortBy: memberSortBy,
        member_sortOrder: memberSortOrder,
        member_startIndex: memberStartIndex,
        member_count: memberCount,
        organizations: organizations,
        organization_fields: organizationFields,
        organization_paid_accounts: organizationPaidAccounts,
        organization_memberships: organizationMemberships,
      },
    });
  }

  /**
   * Get auditlog data for an Enterprise
   * Returns an array of Actions related to the Enterprise object. Used for populating data sent to Google Sheets from an Enterprise's audit log page: https://trello.com/e/{enterprise_name}/admin/auditlog. An Enterprise admin token is required for this route.
   *
   * NOTE: For enterprises that have opted in to user management via AdminHub, the auditlog will will contain actions taken in AdminHub, but may not contain the source for those actions.
   * @param id ID of the enterprise to retrieve.
   * @returns EnterpriseAuditLog Success
   * @throws ApiError
   */
  public getEnterprisesIdAuditlog(id: TrelloID): CancelablePromise<Array<EnterpriseAuditLog>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/enterprises/{id}/auditlog',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get Enterprise admin Members
   * Get an enterprise's admin members.
   * @param id ID of the enterprise to retrieve.
   * @param fields Any valid value that the [nested member field resource]() accepts.
   * @returns EnterpriseAdmin Success
   * @returns Error Unexpected error
   * @throws ApiError
   */
  public getEnterprisesIdAdmins(
    id: TrelloID,
    fields: string = 'fullName, userName',
  ): CancelablePromise<EnterpriseAdmin | Error> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/enterprises/{id}/admins',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
      errors: {
        401: `Unauthorized`,
        404: `The specified resource was not found`,
      },
    });
  }

  /**
   * Get signupUrl for Enterprise
   * Get the signup URL for an enterprise.
   * @param id ID of the enterprise to retrieve.
   * @param authenticate
   * @param confirmationAccepted
   * @param returnUrl Any valid URL.
   * @param tosAccepted Designates whether the user has seen/consented to the Trello ToS prior to being redirected to the enterprise signup page/their IdP.
   * @returns any Success
   * @throws ApiError
   */
  public getEnterprisesIdSignupurl(
    id: TrelloID,
    authenticate: boolean = false,
    confirmationAccepted: boolean = false,
    returnUrl: string | null = null,
    tosAccepted: boolean = false,
  ): CancelablePromise<{
    signupUrl?: string;
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/enterprises/{id}/signupUrl',
      path: {
        id: id,
      },
      query: {
        authenticate: authenticate,
        confirmationAccepted: confirmationAccepted,
        returnUrl: returnUrl,
        tosAccepted: tosAccepted,
      },
    });
  }

  /**
   * Get Users of an Enterprise
   * Get an enterprise's users. You can choose to retrieve licensed members, board guests, etc.
   * @param id ID of the enterprise to retrieve.
   * @param licensed When true, returns members who possess a license for the corresponding Trello Enterprise; when false, returns members who do not. If unspecified, both licensed and unlicensed members will be returned.
   * @param deactivated When true, returns members who have been deactivated for the corresponding Trello Enterprise; when false, returns members who have not. If unspecified, both active and deactivated members will be returned.
   * @param collaborator When true, returns members who are guests on one or more boards in the corresponding Trello Enterprise (but do not possess a license); when false, returns members who are not. If unspecified, both guests and non-guests will be returned.
   * @param managed When true, returns members who are managed by the corresponding Trello Enterprise; when false, returns members who are not. If unspecified, both managed and unmanaged members will be returned.
   * @param admin When true, returns members who are administrators of the corresponding Trello Enterprise; when false, returns members who are not. If unspecified, both admin and non-admin members will be returned.
   * @param activeSince Returns only Trello users active since this date (inclusive).
   * @param inactiveSince Returns only Trello users active since this date (inclusive).
   * @param search Returns members with email address or full name that start with the search value.
   * @param startIndex Cursor to return next set of results
   * @returns Membership Success
   * @throws ApiError
   */
  public getUsersId(
    id: TrelloID,
    licensed: boolean = false,
    deactivated: boolean = false,
    collaborator: boolean = false,
    managed: boolean = 'none',
    admin: boolean = false,
    activeSince: string = 'none',
    inactiveSince: string = 'none',
    search: string = 'none',
    startIndex: string = 'none',
  ): CancelablePromise<Array<Membership>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/enterprises/{id}/members/query',
      path: {
        id: id,
      },
      query: {
        licensed: licensed,
        deactivated: deactivated,
        collaborator: collaborator,
        managed: managed,
        admin: admin,
        activeSince: activeSince,
        inactiveSince: inactiveSince,
        search: search,
        startIndex: startIndex,
      },
    });
  }

  /**
   * Get Members of Enterprise
   * Get the members of an enterprise.
   * @param id ID of the Enterprise to retrieve.
   * @param fields A comma-seperated list of valid [member fields](/cloud/trello/guides/rest-api/object-definitions/#member-object).
   * @param filter Pass a [SCIM-style query](/cloud/trello/scim/) to filter members. This takes precedence over the all/normal/admins value of members. If any of the below member_* args are set, the member array will be paginated.
   * @param sort This parameter expects a [SCIM-style](/cloud/trello/scim/) sorting value prefixed by a `-` to sort descending. If no `-` is prefixed, it will be sorted ascending. Note that the members array returned will be paginated if `members` is 'normal' or 'admins'. Pagination can be controlled with member_startIndex, etc, but the API response will not contain the total available result count or pagination status data.
   * @param sortBy Deprecated: Please use `sort` instead. This parameter expects a [SCIM-style](/cloud/trello/scim/) sorting value. Note that the members array returned will be paginated if `members` is 'normal' or 'admins'. Pagination can be controlled with member_startIndex, etc, but the API response will not contain the total available result count or pagination status data.
   * @param sortOrder Deprecated: Please use `sort` instead. One of: `ascending`, `descending`, `asc`, `desc`.
   * @param startIndex Any integer between 0 and 9999.
   * @param count [SCIM-style filter](/cloud/trello/scim/).
   * @param organizationFields Any valid value that the [nested organization field resource](/cloud/trello/guides/rest-api/nested-resources/) accepts.
   * @param boardFields Any valid value that the [nested board resource](/cloud/trello/guides/rest-api/nested-resources/) accepts.
   * @returns Member Success
   * @throws ApiError
   */
  public getEnterprisesIdMembers(
    id: TrelloID,
    fields: string = 'avatarHash, fullName, initials, username',
    filter?: string | null,
    sort?: string,
    sortBy?: string,
    sortOrder: 'ascending' | 'descending' | 'asc' | 'desc' | null = null,
    startIndex?: number,
    count: string = 'none',
    organizationFields: string = 'displayName',
    boardFields: string = 'name',
  ): CancelablePromise<Array<Member>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/enterprises/{id}/members',
      path: {
        id: id,
      },
      query: {
        fields: fields,
        filter: filter,
        sort: sort,
        sortBy: sortBy,
        sortOrder: sortOrder,
        startIndex: startIndex,
        count: count,
        organization_fields: organizationFields,
        board_fields: boardFields,
      },
    });
  }

  /**
   * Get a Member of Enterprise
   * Get a specific member of an enterprise by ID.
   * @param id ID of the enterprise to retrieve.
   * @param idMember An ID of a member resource.
   * @param fields A comma separated list of any valid values that the [nested member field resource]() accepts.
   * @param organizationFields Any valid value that the [nested organization field resource](/cloud/trello/guides/rest-api/nested-resources/) accepts.
   * @param boardFields Any valid value that the [nested board resource](/cloud/trello/guides/rest-api/nested-resources/) accepts.
   * @returns Member Success
   * @returns Error Unexpected error
   * @throws ApiError
   */
  public getEnterprisesIdMembersIdmember(
    id: TrelloID,
    idMember: TrelloID,
    fields: string = 'avatarHash, fullName, initials, username',
    organizationFields: string = 'displayName',
    boardFields: string = 'name',
  ): CancelablePromise<Member | Error> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/enterprises/{id}/members/{idMember}',
      path: {
        id: id,
        idMember: idMember,
      },
      query: {
        fields: fields,
        organization_fields: organizationFields,
        board_fields: boardFields,
      },
      errors: {
        401: `Unauthorized`,
        404: `The specified resource was not found`,
      },
    });
  }

  /**
   * Get whether an organization can be transferred to an enterprise.
   * Get whether an organization can be transferred to an enterprise.
   * @param id ID of the Enterprise to retrieve.
   * @param idOrganization An ID of an Organization resource.
   * @returns TransferrableOrganization Success
   * @returns Error Unexpected error
   * @throws ApiError
   */
  public getEnterprisesIdTransferrableOrganizationIdOrganization(
    id: TrelloID,
    idOrganization: TrelloID,
  ): CancelablePromise<TransferrableOrganization | Error> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/enterprises/{id}/transferrable/organization/{idOrganization}',
      path: {
        id: id,
        idOrganization: idOrganization,
      },
      errors: {
        401: `Unauthorized`,
        404: `The specified resource was not found`,
      },
    });
  }

  /**
   * Get a bulk list of organizations that can be transferred to an enterprise.
   * Get a list of organizations that can be transferred to an enterprise when given a bulk list of organizations.
   * @param id ID of the Enterprise to retrieve.
   * @param idOrganizations An array of IDs of an Organization resource.
   * @returns any Success
   * @returns Error Unexpected error
   * @throws ApiError
   */
  public getEnterprisesIdTransferrableBulkIdOrganizations(
    id: TrelloID,
    idOrganizations: Array<Organization>,
  ): CancelablePromise<Array<TransferrableOrganization> | Error> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/enterprises/{id}/transferrable/bulk/{idOrganizations}',
      path: {
        id: id,
        idOrganizations: idOrganizations,
      },
      errors: {
        401: `Unauthorized`,
        404: `The specified resource was not found`,
      },
    });
  }

  /**
   * Decline enterpriseJoinRequests from one organization or a bulk list of organizations.
   * Decline enterpriseJoinRequests from one organization or bulk amount of organizations
   * @param id ID of the Enterprise to retrieve.
   * @param idOrganizations An array of IDs of an Organization resource.
   * @returns any Success
   * @returns Error Unexpected error
   * @throws ApiError
   */
  public putEnterprisesIdEnterpriseJoinRequestBulk(
    id: TrelloID,
    idOrganizations: Array<Organization>,
  ): CancelablePromise<any | Error> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/enterprises/${id}/enterpriseJoinRequest/bulk',
      path: {
        id: id,
      },
      query: {
        idOrganizations: idOrganizations,
      },
      errors: {
        401: `Unauthorized`,
        404: `The specified resource was not found`,
      },
    });
  }

  /**
   * Get ClaimableOrganizations of an Enterprise
   * Get the Workspaces that are claimable by the enterprise by ID. Can optionally query for workspaces based on activeness/ inactiveness.
   * @param id ID of the enterprise to retrieve
   * @param limit Limits the number of workspaces to be sorted
   * @param cursor Specifies the sort order to return matching documents
   * @param name Name of the enterprise to retrieve workspaces for
   * @param activeSince Date in YYYY-MM-DD format indicating the date to search up to for activeness of workspace
   * @param inactiveSince Date in YYYY-MM-DD format indicating the date to search up to for inactiveness of workspace
   * @returns ClaimableOrganizations Success
   * @returns Error Unexpected erorr
   * @throws ApiError
   */
  public getEnterprisesIdClaimableOrganizations(
    id: TrelloID,
    limit?: number,
    cursor?: string,
    name?: string,
    activeSince?: string,
    inactiveSince?: string,
  ): CancelablePromise<ClaimableOrganizations | Error> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/enterprises/{id}/claimableOrganizations',
      path: {
        id: id,
      },
      query: {
        limit: limit,
        cursor: cursor,
        name: name,
        activeSince: activeSince,
        inactiveSince: inactiveSince,
      },
      errors: {
        401: `Unauthorized`,
        404: `The specified resource was not found`,
      },
    });
  }

  /**
   * Get PendingOrganizations of an Enterprise
   * Get the Workspaces that are pending for the enterprise by ID.
   * @param id ID of the enterprise to retrieve
   * @param activeSince Date in YYYY-MM-DD format indicating the date to search up to for activeness of workspace
   * @param inactiveSince Date in YYYY-MM-DD format indicating the date to search up to for inactiveness of workspace
   * @returns PendingOrganizations Success
   * @returns Error Unexpected erorr
   * @throws ApiError
   */
  public getEnterprisesIdPendingOrganizations(
    id: TrelloID,
    activeSince?: string,
    inactiveSince?: string,
  ): CancelablePromise<Array<PendingOrganizations> | Error> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/enterprises/{id}/pendingOrganizations',
      path: {
        id: id,
      },
      query: {
        activeSince: activeSince,
        inactiveSince: inactiveSince,
      },
      errors: {
        401: `Unauthorized`,
        404: `The specified resource was not found`,
      },
    });
  }

  /**
   * Create an auth Token for an Enterprise.
   * Create an auth Token for an Enterprise.
   * @param id ID of the enterprise to retrieve.
   * @param expiration One of: `1hour`, `1day`, `30days`, `never`
   * @returns any Success
   * @throws ApiError
   */
  public postEnterprisesIdTokens(id: string, expiration: string = 'none'): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/enterprises/{id}/tokens',
      path: {
        id: id,
      },
      query: {
        expiration: expiration,
      },
    });
  }

  /**
   * Transfer an Organization to an Enterprise.
   * Transfer an organization to an enterprise.
   *
   * NOTE: For enterprises that have opted in to user management via AdminHub, this endpoint will result in the organization being added to the enterprise asynchronously. A 200 response only indicates receipt of the request, it does not indicate successful addition to the enterprise.
   * @param id ID of the Enterprise to retrieve.
   * @param idOrganization ID of Organization to be transferred to Enterprise.
   * @returns any Success
   * @returns Error Unexpected error
   * @throws ApiError
   */
  public putEnterprisesIdOrganizations(
    id: TrelloID,
    idOrganization: string,
  ): CancelablePromise<Array<Organization> | Error> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/enterprises/{id}/organizations',
      path: {
        id: id,
      },
      query: {
        idOrganization: idOrganization,
      },
      errors: {
        401: `Unauthorized`,
        404: `The specified resource was not found`,
      },
    });
  }

  /**
   * Update a Member's licensed status
   * This endpoint is used to update whether the provided Member should use one of the Enterprise's available licenses or not. Revoking a license will deactivate a Member of an Enterprise.
   *
   * NOTE: Revoking of licenses is not possible for enterprises that have opted in to user management via AdminHub.
   * @param id ID of the Enterprise.
   * @param idMember The ID of the Member
   * @param value Boolean value to determine whether the user should be given an Enterprise license (true) or not (false).
   * @returns Member Success
   * @returns Error Unexpected error
   * @throws ApiError
   */
  public putEnterprisesIdMembersIdmemberLicensed(
    id: TrelloID,
    idMember: TrelloID,
    value: boolean,
  ): CancelablePromise<Member | Error> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/enterprises/{id}/members/{idMember}/licensed',
      path: {
        id: id,
        idMember: idMember,
      },
      query: {
        value: value,
      },
      errors: {
        401: `Unauthorized`,
        404: `The specified resource was not found`,
      },
    });
  }

  /**
   * Deactivate a Member of an Enterprise.
   * Deactivate a Member of an Enterprise.
   *
   * NOTE: Deactivation is not possible for enterprises that have opted in to user management via AdminHub.
   * @param id ID of the enterprise to retrieve.
   * @param idMember ID of the Member to deactive.
   * @param value Determines whether the user is deactivated or not.
   * @param fields A comma separated list of any valid values that the [nested member field resource]() accepts.
   * @param organizationFields Any valid value that the [nested organization resource](/cloud/trello/guides/rest-api/nested-resources/) accepts.
   * @param boardFields Any valid value that the [nested board resource](/cloud/trello/guides/rest-api/nested-resources/) accepts.
   * @returns any Success
   * @throws ApiError
   */
  public enterprisesIdMembersIdMemberDeactivated(
    id: TrelloID,
    idMember: TrelloID,
    value: boolean,
    fields: MemberFields = 'avatarHash, fullName, initials, username',
    organizationFields: OrganizationFields = 'displayName',
    boardFields: BoardFields = 'name',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/enterprises/{id}/members/{idMember}/deactivated',
      path: {
        id: id,
        idMember: idMember,
      },
      query: {
        value: value,
        fields: fields,
        organization_fields: organizationFields,
        board_fields: boardFields,
      },
    });
  }

  /**
   * Update Member to be admin of Enterprise
   * Make Member an admin of Enterprise.
   *
   * NOTE: This endpoint is not available to enterprises that have opted in to user management via AdminHub.
   * @param id ID of the enterprise to retrieve.
   * @param idMember ID of member to be made an admin of enterprise.
   * @returns any Success
   * @throws ApiError
   */
  public putEnterprisesIdAdminsIdmember(id: TrelloID, idMember: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/enterprises/{id}/admins/{idMember}',
      path: {
        id: id,
        idMember: idMember,
      },
    });
  }

  /**
   * Remove a Member as admin from Enterprise.
   * Remove a member as admin from an enterprise.
   *
   * NOTE: This endpoint is not available to enterprises that have opted in to user management via AdminHub.
   * @param id ID of the Enterprise to retrieve.
   * @param idMember ID of the member to be removed as an admin from enterprise.
   * @returns any Success
   * @throws ApiError
   */
  public enterprisesIdOrganizationsIdmember(
    id: TrelloID,
    idMember: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/enterprises/{id}/admins/{idMember}',
      path: {
        id: id,
        idMember: idMember,
      },
    });
  }

  /**
   * Delete an Organization from an Enterprise.
   * Remove an organization from an enterprise.
   * @param id ID of the enterprise to retrieve.
   * @param idOrg ID of the organization to be removed from the enterprise.
   * @returns any Success
   * @throws ApiError
   */
  public deleteEnterprisesIdOrganizationsIdorg(
    id: TrelloID,
    idOrg: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/enterprises/{id}/organizations/{idOrg}',
      path: {
        id: id,
        idOrg: idOrg,
      },
    });
  }

  /**
   * Bulk accept a set of organizations to an Enterprise.
   * Accept an array of organizations to an enterprise.
   *
   * NOTE: For enterprises that have opted in to user management via AdminHub, this endpoint will result in organizations being added to the enterprise asynchronously. A 200 response only indicates receipt of the request, it does not indicate successful addition to the enterprise.
   * @param id ID of the enterprise to retrieve.
   * @param idOrganizations An array of IDs of the organizations to be removed from the enterprise.
   * @returns any Success
   * @returns Error Unexpected Error
   * @throws ApiError
   */
  public getEnterprisesIdOrganizationsBulkIdOrganizations(
    id: TrelloID,
    idOrganizations: Array<Organization>,
  ): CancelablePromise<any | Error> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/enterprises/{id}/organizations/bulk/{idOrganizations}',
      path: {
        id: id,
        idOrganizations: idOrganizations,
      },
      errors: {
        401: `Unauthorized`,
        404: `The specified resource was not found`,
      },
    });
  }

  /**
   * Get a Label
   * Get information about a single Label.
   * @param id The ID of the Label
   * @param fields all or a comma-separated list of [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getLabelsId(id: TrelloID, fields: string = 'all'): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/labels/{id}',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Update a Label
   * Update a label by ID.
   * @param id The ID of the Label
   * @param name The new name for the label
   * @param color The new color for the label. See: [fields](/cloud/trello/guides/rest-api/object-definitions/) for color options
   * @returns any Success
   * @throws ApiError
   */
  public putLabelsId(id: TrelloID, name?: string, color?: Color): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/labels/{id}',
      path: {
        id: id,
      },
      query: {
        name: name,
        color: color,
      },
    });
  }

  /**
   * Delete a Label
   * Delete a label by ID.
   * @param id The ID of the Label
   * @returns any Success
   * @throws ApiError
   */
  public deleteLabelsId(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/labels/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Update a field on a label
   * Update a field on a label.
   * @param id The id of the label
   * @param field The field on the Label to update.
   * @param value The new value for the field.
   * @returns any Success
   * @throws ApiError
   */
  public putLabelsIdField(
    id: string,
    field: 'color' | 'name',
    value: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/labels/{id}/{field}',
      path: {
        id: id,
        field: field,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Create a Label
   * Create a new Label on a Board.
   * @param name Name for the label
   * @param color The color for the label.
   * @param idBoard The ID of the Board to create the Label on.
   * @returns any Success
   * @throws ApiError
   */
  public postLabels(name: string, color: Color, idBoard: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/labels',
      query: {
        name: name,
        color: color,
        idBoard: idBoard,
      },
    });
  }

  /**
   * Get a List
   * Get information about a List
   * @param id The ID of the list
   * @param fields `all` or a comma separated list of List field names.
   * @returns any Success
   * @throws ApiError
   */
  public getListsId(
    id: string,
    fields: string = 'name,closed,idBoard,pos',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/lists/{id}',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Update a List
   * Update the properties of a List
   * @param id The ID of the list
   * @param name New name for the list
   * @param closed Whether the list should be closed (archived)
   * @param idBoard ID of a board the list should be moved to
   * @param pos New position for the list: `top`, `bottom`, or a positive floating point number
   * @param subscribed Whether the active member is subscribed to this list
   * @returns any Success
   * @throws ApiError
   */
  public putListsId(
    id: string,
    name?: string,
    closed?: boolean,
    idBoard?: TrelloID,
    pos?: number | 'top' | 'bottom',
    subscribed?: boolean,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/lists/{id}',
      path: {
        id: id,
      },
      query: {
        name: name,
        closed: closed,
        idBoard: idBoard,
        pos: pos,
        subscribed: subscribed,
      },
    });
  }

  /**
   * Create a new List
   * Create a new List on a Board
   * @param name Name for the list
   * @param idBoard The long ID of the board the list should be created on
   * @param idListSource ID of the List to copy into the new List
   * @param pos Position of the list. `top`, `bottom`, or a positive floating point number
   * @returns any Success
   * @throws ApiError
   */
  public postLists(
    name: string,
    idBoard: TrelloID,
    idListSource?: TrelloID,
    pos?: number | 'top' | 'bottom',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/lists',
      query: {
        name: name,
        idBoard: idBoard,
        idListSource: idListSource,
        pos: pos,
      },
    });
  }

  /**
   * Archive all Cards in List
   * Archive all cards in a list
   * @param id The ID of the list
   * @returns any Success
   * @throws ApiError
   */
  public postListsIdArchiveallcards(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/lists/{id}/archiveAllCards',
      path: {
        id: id,
      },
    });
  }

  /**
   * Move all Cards in List
   * Move all Cards in a List
   * @param id The ID of the list
   * @param idBoard The ID of the board the cards should be moved to
   * @param idList The ID of the list that the cards should be moved to
   * @returns any Success
   * @throws ApiError
   */
  public postListsIdMoveallcards(
    id: TrelloID,
    idBoard: TrelloID,
    idList: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/lists/{id}/moveAllCards',
      path: {
        id: id,
      },
      query: {
        idBoard: idBoard,
        idList: idList,
      },
    });
  }

  /**
   * Archive or unarchive a list
   * Archive or unarchive a list
   * @param id The ID of the list
   * @param value Set to true to close (archive) the list
   * @returns any Success
   * @throws ApiError
   */
  public putListsIdClosed(id: TrelloID, value?: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/lists/{id}/closed',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Move List to Board
   * Move a List to a different Board
   * @param id The ID of the list
   * @param value The ID of the board to move the list to
   * @returns any Success
   * @throws ApiError
   */
  public putIdIdboard(id: TrelloID, value: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/lists/{id}/idBoard',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Update a field on a List
   * Rename a list
   * @param id The ID of the list
   * @param field The field on the List to be updated
   * @param value The new value for the field
   * @returns any Success
   * @throws ApiError
   */
  public putListsIdField(
    id: TrelloID,
    field: 'name' | 'pos' | 'subscribed',
    value?: string | number | 'top' | 'bottom' | boolean,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/lists/{id}/{field}',
      path: {
        id: id,
        field: field,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Get Actions for a List
   * Get the Actions on a List
   * @param id The ID of the list
   * @param filter A comma-separated list of [action types](https://developer.atlassian.com/cloud/trello/guides/rest-api/action-types/).
   * @returns any Success
   * @throws ApiError
   */
  public getListsIdActions(id: string, filter?: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/lists/{id}/actions',
      path: {
        id: id,
      },
      query: {
        filter: filter,
      },
    });
  }

  /**
   * Get the Board a List is on
   * Get the board a list is on
   * @param id The ID of the list
   * @param fields `all` or a comma-separated list of board [fields](/cloud/trello/guides/rest-api/object-definitions/#board-object)
   * @returns any Success
   * @throws ApiError
   */
  public getListsIdBoard(id: string, fields: string = 'all'): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/lists/{id}/board',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get Cards in a List
   * List the cards in a list
   * @param id The ID of the list
   * @returns Card Success
   * @throws ApiError
   */
  public getListsIdCards(id: TrelloID): CancelablePromise<Array<Card>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/lists/{id}/cards',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get a Member
   * Get a member
   * @param id The ID or username of the member
   * @param actions See the [Actions Nested Resource](/cloud/trello/guides/rest-api/nested-resources/#actions-nested-resource)
   * @param boards See the [Boards Nested Resource](/cloud/trello/guides/rest-api/nested-resources/#boards-nested-resource)
   * @param boardBackgrounds One of: `all`, `custom`, `default`, `none`, `premium`
   * @param boardsInvited `all` or a comma-separated list of: closed, members, open, organization, pinned, public, starred, unpinned
   * @param boardsInvitedFields `all` or a comma-separated list of board [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param boardStars Whether to return the boardStars or not
   * @param cards See the [Cards Nested Resource](/cloud/trello/guides/rest-api/nested-resources/#cards-nested-resource) for additional options
   * @param customBoardBackgrounds `all` or `none`
   * @param customEmoji `all` or `none`
   * @param customStickers `all` or `none`
   * @param fields `all` or a comma-separated list of member [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param notifications See the [Notifications Nested Resource](/cloud/trello/guides/rest-api/nested-resources/#notifications-nested-resource)
   * @param organizations One of: `all`, `members`, `none`, `public`
   * @param organizationFields `all` or a comma-separated list of organization [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param organizationPaidAccount Whether or not to include paid account information in the returned workspace object
   * @param organizationsInvited One of: `all`, `members`, `none`, `public`
   * @param organizationsInvitedFields `all` or a comma-separated list of organization [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param paidAccount Whether or not to include paid account information in the returned member object
   * @param savedSearches
   * @param tokens `all` or `none`
   * @returns any Success
   * @throws ApiError
   */
  public getMembersId(
    id: TrelloID | string,
    actions?: string,
    boards?: string,
    boardBackgrounds: 'all' | 'custom' | 'default' | 'none' | 'premium' = 'none',
    boardsInvited?:
      | 'closed'
      | 'members'
      | 'open'
      | 'organization'
      | 'pinned'
      | 'public'
      | 'starred'
      | 'unpinned',
    boardsInvitedFields: BoardFields = 'name,closed,idOrganization,pinned',
    boardStars: boolean = false,
    cards: string = 'none',
    customBoardBackgrounds: 'all' | 'none' = 'none',
    customEmoji: 'all' | 'none' = 'none',
    customStickers: 'all' | 'none' = 'none',
    fields: MemberFields = 'all',
    notifications?: string,
    organizations: 'all' | 'members' | 'none' | 'public' = 'none',
    organizationFields: OrganizationFields = 'all',
    organizationPaidAccount: boolean = false,
    organizationsInvited: 'all' | 'members' | 'none' | 'public' = 'none',
    organizationsInvitedFields: OrganizationFields = 'all',
    paidAccount: boolean = false,
    savedSearches: boolean = false,
    tokens: 'all' | 'none' = 'none',
  ): CancelablePromise<Member> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}',
      path: {
        id: id,
      },
      query: {
        actions: actions,
        boards: boards,
        boardBackgrounds: boardBackgrounds,
        boardsInvited: boardsInvited,
        boardsInvited_fields: boardsInvitedFields,
        boardStars: boardStars,
        cards: cards,
        customBoardBackgrounds: customBoardBackgrounds,
        customEmoji: customEmoji,
        customStickers: customStickers,
        fields: fields,
        notifications: notifications,
        organizations: organizations,
        organization_fields: organizationFields,
        organization_paid_account: organizationPaidAccount,
        organizationsInvited: organizationsInvited,
        organizationsInvited_fields: organizationsInvitedFields,
        paid_account: paidAccount,
        savedSearches: savedSearches,
        tokens: tokens,
      },
    });
  }

  /**
   * Update a Member
   * Update a Member
   * @param id The ID or username of the member
   * @param fullName New name for the member. Cannot begin or end with a space.
   * @param initials New initials for the member. 1-4 characters long.
   * @param username New username for the member. At least 3 characters long, only lowercase letters, underscores, and numbers. Must be unique.
   * @param bio
   * @param avatarSource One of: `gravatar`, `none`, `upload`
   * @param prefsColorBlind
   * @param prefsLocale
   * @param prefsMinutesBetweenSummaries `-1` for disabled, `1`, or `60`
   * @returns any Success
   * @throws ApiError
   */
  public putMembersId(
    id: TrelloID,
    fullName?: string,
    initials?: string,
    username?: string,
    bio?: string,
    avatarSource?: 'gravatar' | 'none' | 'upload',
    prefsColorBlind?: boolean,
    prefsLocale?: string,
    prefsMinutesBetweenSummaries?: number,
  ): CancelablePromise<Member> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/members/{id}',
      path: {
        id: id,
      },
      query: {
        fullName: fullName,
        initials: initials,
        username: username,
        bio: bio,
        avatarSource: avatarSource,
        'prefs/colorBlind': prefsColorBlind,
        'prefs/locale': prefsLocale,
        'prefs/minutesBetweenSummaries': prefsMinutesBetweenSummaries,
      },
    });
  }

  /**
   * Get a field on a Member
   * Get a particular property of a member
   * @param id The ID or username of the member
   * @param field One of the member [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getMembersIdField(id: TrelloID, field: MemberFields): CancelablePromise<Member> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/{field}',
      path: {
        id: id,
        field: field,
      },
    });
  }

  /**
   * Get a Member's Actions
   * List the actions for a member
   * @param id The ID or username of the member
   * @param filter A comma-separated list of [action types](https://developer.atlassian.com/cloud/trello/guides/rest-api/action-types/).
   * @returns any Success
   * @throws ApiError
   */
  public getMembersIdActions(id: TrelloID, filter?: string): CancelablePromise<Array<Member>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/actions',
      path: {
        id: id,
      },
      query: {
        filter: filter,
      },
    });
  }

  /**
   * Get Member's custom Board backgrounds
   * Get a member's custom board backgrounds
   * @param id The ID or username of the member
   * @param filter One of: `all`, `custom`, `default`, `none`, `premium`
   * @returns any Success
   * @throws ApiError
   */
  public getMembersIdBoardbackgrounds(
    id: TrelloID,
    filter: 'all' | 'custom' | 'default' | 'none' | 'premium' = 'all',
  ): CancelablePromise<Array<BoardBackground>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/boardBackgrounds',
      path: {
        id: id,
      },
      query: {
        filter: filter,
      },
    });
  }

  /**
   * Upload new boardBackground for Member
   * Upload a new boardBackground
   * @param id The ID or username of the member
   * @param file
   * @returns any Success
   * @throws ApiError
   */
  public postMembersIdBoardbackgrounds1(
    id: TrelloID,
    file: Blob,
  ): CancelablePromise<Array<BoardBackground>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/members/{id}/boardBackgrounds',
      path: {
        id: id,
      },
      query: {
        file: file,
      },
    });
  }

  /**
   * Get a boardBackground of a Member
   * Get a member's board background
   * @param id The ID or username of the member
   * @param idBackground The ID of the board background
   * @param fields `all` or a comma-separated list of: `brightness`, `fullSizeUrl`, `scaled`, `tile`
   * @returns BoardBackground Success
   * @throws ApiError
   */
  public getMembersIdBoardbackgroundsIdbackground(
    id: TrelloID,
    idBackground: TrelloID,
    fields: 'all' | 'brightness' | 'fullSizeUrl' | 'scaled' | 'tile' = 'all',
  ): CancelablePromise<BoardBackground> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/boardBackgrounds/{idBackground}',
      path: {
        id: id,
        idBackground: idBackground,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Update a Member's custom Board background
   * Update a board background
   * @param id The ID or username of the member
   * @param idBackground The ID of the board background
   * @param brightness One of: `dark`, `light`, `unknown`
   * @param tile Whether the background should be tiled
   * @returns BoardBackground Success
   * @throws ApiError
   */
  public putMembersIdBoardbackgroundsIdbackground(
    id: TrelloID,
    idBackground: TrelloID,
    brightness?: 'dark' | 'light' | 'unknown',
    tile?: boolean,
  ): CancelablePromise<BoardBackground> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/members/{id}/boardBackgrounds/{idBackground}',
      path: {
        id: id,
        idBackground: idBackground,
      },
      query: {
        brightness: brightness,
        tile: tile,
      },
    });
  }

  /**
   * Delete a Member's custom Board background
   * Delete a board background
   * @param id The ID or username of the member
   * @param idBackground The ID of the board background
   * @returns any Success
   * @throws ApiError
   */
  public deleteMembersIdBoardbackgroundsIdbackground(
    id: TrelloID,
    idBackground: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/members/{id}/boardBackgrounds/{idBackground}',
      path: {
        id: id,
        idBackground: idBackground,
      },
    });
  }

  /**
   * Get a Member's boardStars
   * List a member's board stars
   * @param id The ID or username of the member
   * @returns any Success
   * @throws ApiError
   */
  public getMembersIdBoardstars(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/boardStars',
      path: {
        id: id,
      },
    });
  }

  /**
   * Create Star for Board
   * Star a new board on behalf of a Member
   * @param id The ID or username of the member
   * @param idBoard The ID of the board to star
   * @param pos The position of the newly starred board. `top`, `bottom`, or a positive float.
   * @returns BoardStars Success
   * @throws ApiError
   */
  public postMembersIdBoardstars(
    id: TrelloID | string,
    idBoard: TrelloID,
    pos: posStringOrNumber,
  ): CancelablePromise<Array<BoardStars>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/members/{id}/boardStars',
      path: {
        id: id,
      },
      query: {
        idBoard: idBoard,
        pos: pos,
      },
    });
  }

  /**
   * Get a boardStar of Member
   * Get a specific boardStar
   * @param id The ID or username of the member
   * @param idStar The ID of the board star
   * @returns BoardStars Success
   * @throws ApiError
   */
  public getMembersIdBoardstarsIdstar(
    id: TrelloID,
    idStar: TrelloID,
  ): CancelablePromise<BoardStars> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/boardStars/{idStar}',
      path: {
        id: id,
        idStar: idStar,
      },
    });
  }

  /**
   * Update the position of a boardStar of Member
   * Update the position of a starred board
   * @param id The ID or username of the member
   * @param idStar The ID of the board star
   * @param pos New position for the starred board. `top`, `bottom`, or a positive float.
   * @returns any Success
   * @throws ApiError
   */
  public putMembersIdBoardstarsIdstar(
    id: TrelloID,
    idStar: TrelloID,
    pos?: posStringOrNumber,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/members/{id}/boardStars/{idStar}',
      path: {
        id: id,
        idStar: idStar,
      },
      query: {
        pos: pos,
      },
    });
  }

  /**
   * Delete Star for Board
   * Unstar a board
   * @param id The ID or username of the member
   * @param idStar The ID of the board star
   * @returns any Success
   * @throws ApiError
   */
  public deleteMembersIdBoardstarsIdstar(id: TrelloID, idStar: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/members/{id}/boardStars/{idStar}',
      path: {
        id: id,
        idStar: idStar,
      },
    });
  }

  /**
   * Get Boards that Member belongs to
   * Lists the boards that the user is a member of.
   * @param id The ID or username of the member
   * @param filter `all` or a comma-separated list of: `closed`, `members`, `open`, `organization`, `public`, `starred`
   * @param fields `all` or a comma-separated list of board [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param lists Which lists to include with the boards. One of: `all`, `closed`, `none`, `open`
   * @param organization Whether to include the Organization object with the Boards
   * @param organizationFields `all` or a comma-separated list of organization [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns Board Success
   * @throws ApiError
   */
  public getMembersIdBoards(
    id: TrelloID,
    filter: 'all' | 'closed' | 'members' | 'open' | 'organization' | 'public' | 'starred' = 'all',
    fields: BoardFields = 'all',
    lists: 'all' | 'closed' | 'none' | 'open' = 'none',
    organization: boolean = false,
    organizationFields: OrganizationFields = 'name,displayName',
  ): CancelablePromise<Array<Board>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/boards',
      path: {
        id: id,
      },
      query: {
        filter: filter,
        fields: fields,
        lists: lists,
        organization: organization,
        organization_fields: organizationFields,
      },
    });
  }

  /**
   * Get Boards the Member has been invited to
   * Get the boards the member has been invited to
   * @param id The ID or username of the member
   * @param fields `all` or a comma-separated list of board [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns Board Success
   * @throws ApiError
   */
  public getMembersIdBoardsinvited(
    id: TrelloID,
    fields: BoardFields = 'all',
  ): CancelablePromise<Array<Board>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/boardsInvited',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get Cards the Member is on
   * Gets the cards a member is on
   * @param id The ID or username of the member
   * @param filter One of: `all`, `closed`, `none`, `open`, `visible`
   * @returns Card Success
   * @throws ApiError
   */
  public getMembersIdCards(
    id: TrelloID,
    filter: 'all' | 'closed' | 'none' | 'open' | 'visible' = 'visible',
  ): CancelablePromise<Array<Card>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/cards',
      path: {
        id: id,
      },
      query: {
        filter: filter,
      },
    });
  }

  /**
   * Get a Member's custom Board Backgrounds
   * Get a member's custom board backgrounds
   * @param id The ID or username of the member
   * @returns BoardBackground Success
   * @throws ApiError
   */
  public getMembersIdCustomboardbackgrounds(
    id: TrelloID,
  ): CancelablePromise<Array<BoardBackground>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/customBoardBackgrounds',
      path: {
        id: id,
      },
    });
  }

  /**
   * Create a new custom Board Background
   * Upload a new custom board background
   * @param id The ID or username of the member
   * @param file
   * @returns BoardBackground Success
   * @throws ApiError
   */
  public membersidcustomboardbackgrounds1(
    id: TrelloID,
    file: Blob,
  ): CancelablePromise<BoardBackground> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/members/{id}/customBoardBackgrounds',
      path: {
        id: id,
      },
      query: {
        file: file,
      },
    });
  }

  /**
   * Get custom Board Background of Member
   * Get a specific custom board background
   * @param id The ID or username of the member
   * @param idBackground The ID of the custom background
   * @returns BoardBackground Success
   * @throws ApiError
   */
  public getMembersIdCustomboardbackgroundsIdbackground(
    id: TrelloID | string,
    idBackground: TrelloID,
  ): CancelablePromise<BoardBackground> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/customBoardBackgrounds/{idBackground}',
      path: {
        id: id,
        idBackground: idBackground,
      },
    });
  }

  /**
   * Update custom Board Background of Member
   * Update a specific custom board background
   * @param id The ID or username of the member
   * @param idBackground The ID of the custom background
   * @param brightness One of: `dark`, `light`, `unknown`
   * @param tile Whether to tile the background
   * @returns BoardBackground Success
   * @throws ApiError
   */
  public putMembersIdCustomboardbackgroundsIdbackground(
    id: TrelloID | string,
    idBackground: TrelloID,
    brightness?: 'dark' | 'light' | 'unknown',
    tile?: boolean,
  ): CancelablePromise<BoardBackground> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/members/{id}/customBoardBackgrounds/{idBackground}',
      path: {
        id: id,
        idBackground: idBackground,
      },
      query: {
        brightness: brightness,
        tile: tile,
      },
    });
  }

  /**
   * Delete custom Board Background of Member
   * Delete a specific custom board background
   * @param id The ID or username of the member
   * @param idBackground The ID of the custom background
   * @returns any Success
   * @throws ApiError
   */
  public deleteMembersIdCustomboardbackgroundsIdbackground(
    id: TrelloID | string,
    idBackground: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/members/{id}/customBoardBackgrounds/{idBackground}',
      path: {
        id: id,
        idBackground: idBackground,
      },
    });
  }

  /**
   * Get a Member's customEmojis
   * Get a Member's uploaded custom Emojis
   * @param id The ID or username of the member
   * @returns CustomEmoji Success
   * @throws ApiError
   */
  public getMembersIdCustomemoji(id: TrelloID): CancelablePromise<Array<CustomEmoji>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/customEmoji',
      path: {
        id: id,
      },
    });
  }

  /**
   * Create custom Emoji for Member
   * Create a new custom Emoji
   * @param id The ID or username of the member
   * @param file
   * @param name Name for the emoji. 2 - 64 characters
   * @returns CustomEmoji Success
   * @throws ApiError
   */
  public postMembersIdCustomemoji(
    id: TrelloID,
    file: Blob,
    name: string,
  ): CancelablePromise<CustomEmoji> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/members/{id}/customEmoji',
      path: {
        id: id,
      },
      query: {
        file: file,
        name: name,
      },
    });
  }

  /**
   * Get a Member's custom Emoji
   * Get a Member's custom Emoji
   * @param id The ID or username of the member
   * @param idEmoji The ID of the custom emoji
   * @param fields `all` or a comma-separated list of `name`, `url`
   * @returns CustomEmoji Success
   * @throws ApiError
   */
  public membersidcustomemojiidemoji(
    id: TrelloID,
    idEmoji: TrelloID,
    fields: 'name' | 'url' | 'all' = 'all',
  ): CancelablePromise<CustomEmoji> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/customEmoji/{idEmoji}',
      path: {
        id: id,
        idEmoji: idEmoji,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get Member's custom Stickers
   * Get a Member's uploaded stickers
   * @param id The ID or username of the member
   * @returns CustomSticker Success
   * @throws ApiError
   */
  public getMembersIdCustomstickers(id: TrelloID): CancelablePromise<Array<CustomSticker>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/customStickers',
      path: {
        id: id,
      },
    });
  }

  /**
   * Create custom Sticker for Member
   * Upload a new custom sticker
   * @param id The ID or username of the member
   * @param file
   * @returns CustomSticker Success
   * @throws ApiError
   */
  public postMembersIdCustomstickers(id: TrelloID, file: Blob): CancelablePromise<CustomSticker> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/members/{id}/customStickers',
      path: {
        id: id,
      },
      query: {
        file: file,
      },
    });
  }

  /**
   * Get a Member's custom Sticker
   * Get a Member's custom Sticker
   * @param id The ID or username of the member
   * @param idSticker The ID of the uploaded sticker
   * @param fields `all` or a comma-separated list of `scaled`, `url`
   * @returns CustomSticker Success
   * @throws ApiError
   */
  public getMembersIdCustomstickersIdsticker(
    id: TrelloID,
    idSticker: TrelloID,
    fields: 'scaled' | 'url' | 'all' = 'all',
  ): CancelablePromise<CustomSticker> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/customStickers/{idSticker}',
      path: {
        id: id,
        idSticker: idSticker,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Delete a Member's custom Sticker
   * Delete a Member's custom Sticker
   * @param id The ID or username of the member
   * @param idSticker The ID of the uploaded sticker
   * @returns any Success
   * @throws ApiError
   */
  public deleteMembersIdCustomstickersIdsticker(
    id: TrelloID,
    idSticker: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/members/{id}/customStickers/{idSticker}',
      path: {
        id: id,
        idSticker: idSticker,
      },
    });
  }

  /**
   * Get Member's Notifications
   * Get a member's notifications
   * @param id The ID or username of the member
   * @param entities
   * @param display
   * @param filter
   * @param readFilter One of: `all`, `read`, `unread`
   * @param fields `all` or a comma-separated list of notification [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param limit Max 1000
   * @param page Max 100
   * @param before A notification ID
   * @param since A notification ID
   * @param memberCreator
   * @param memberCreatorFields `all` or a comma-separated list of member [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns Notification Success
   * @throws ApiError
   */
  public getMembersIdNotifications(
    id: TrelloID,
    entities: boolean = false,
    display: boolean = false,
    filter: string = 'all',
    readFilter: string = 'all',
    fields: string = 'all',
    limit: number = 50,
    page: number = 0,
    before?: string,
    since?: string,
    memberCreator: boolean = true,
    memberCreatorFields: string = 'avatarHash,fullName,initials,username',
  ): CancelablePromise<Array<Notification>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/notifications',
      path: {
        id: id,
      },
      query: {
        entities: entities,
        display: display,
        filter: filter,
        read_filter: readFilter,
        fields: fields,
        limit: limit,
        page: page,
        before: before,
        since: since,
        memberCreator: memberCreator,
        memberCreator_fields: memberCreatorFields,
      },
    });
  }

  /**
   * Get Member's Organizations
   * Get a member's Workspaces
   * @param id The ID or username of the member
   * @param filter One of: `all`, `members`, `none`, `public` (Note: `members` filters to only private Workspaces)
   * @param fields `all` or a comma-separated list of organization [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param paidAccount Whether or not to include paid account information in the returned workspace object
   * @returns Organization Success
   * @throws ApiError
   */
  public getMembersIdOrganizations(
    id: TrelloID,
    filter: 'all' | 'members' | 'none' | 'public' = 'all',
    fields: OrganizationFields = 'all',
    paidAccount: boolean = false,
  ): CancelablePromise<Array<Organization>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/organizations',
      path: {
        id: id,
      },
      query: {
        filter: filter,
        fields: fields,
        paid_account: paidAccount,
      },
    });
  }

  /**
   * Get Organizations a Member has been invited to
   * Get a member's Workspaces they have been invited to
   * @param id The ID or username of the member
   * @param fields `all` or a comma-separated list of organization [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns Organization Success
   * @throws ApiError
   */
  public getMembersIdOrganizationsinvited(
    id: TrelloID,
    fields: OrganizationFields = 'all',
  ): CancelablePromise<Array<Organization>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/organizationsInvited',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get Member's saved searched
   * List the saved searches of a Member
   * @param id The ID or username of the member
   * @returns SavedSearch Success
   * @throws ApiError
   */
  public getMembersIdSavedsearches(id: TrelloID): CancelablePromise<Array<SavedSearch>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/savedSearches',
      path: {
        id: id,
      },
    });
  }

  /**
   * Create saved Search for Member
   * Create a saved search
   * @param id The ID or username of the member
   * @param name The name for the saved search
   * @param query The search query
   * @param pos The position of the saved search. `top`, `bottom`, or a positive float.
   * @returns SavedSearch Success
   * @throws ApiError
   */
  public postMembersIdSavedsearches(
    id: TrelloID,
    name: string,
    query: string,
    pos: posStringOrNumber,
  ): CancelablePromise<SavedSearch> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/members/{id}/savedSearches',
      path: {
        id: id,
      },
      query: {
        name: name,
        query: query,
        pos: pos,
      },
    });
  }

  /**
   * Get a saved search
   * Get a saved search
   * @param id The ID or username of the member
   * @param idSearch The ID of the saved search to delete
   * @returns SavedSearch Success
   * @throws ApiError
   */
  public getMembersIdSavedsearchesIdsearch(
    id: string,
    idSearch: string,
  ): CancelablePromise<SavedSearch> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/savedSearches/{idSearch}',
      path: {
        id: id,
        idSearch: idSearch,
      },
    });
  }

  /**
   * Update a saved search
   * Update a saved search
   * @param id The ID or username of the member
   * @param idSearch The ID of the saved search to delete
   * @param name The new name for the saved search
   * @param query The new search query
   * @param pos New position for saves search. `top`, `bottom`, or a positive float.
   * @returns SavedSearch Success
   * @throws ApiError
   */
  public putMembersIdSavedsearchesIdsearch(
    id: string,
    idSearch: string,
    name?: string,
    query?: string,
    pos?: string,
  ): CancelablePromise<SavedSearch> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/members/{id}/savedSearches/{idSearch}',
      path: {
        id: id,
        idSearch: idSearch,
      },
      query: {
        name: name,
        query: query,
        pos: pos,
      },
    });
  }

  /**
   * Delete a saved search
   * Delete a saved search
   * @param id The ID or username of the member
   * @param idSearch The ID of the saved search to delete
   * @returns any Success
   * @throws ApiError
   */
  public deleteMembersIdSavedsearchesIdsearch(
    id: string,
    idSearch: string,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/members/{id}/savedSearches/{idSearch}',
      path: {
        id: id,
        idSearch: idSearch,
      },
    });
  }

  /**
   * Get Member's Tokens
   * List a members app tokens
   * @param id The ID or username of the member
   * @param webhooks Whether to include webhooks
   * @returns Token Success
   * @throws ApiError
   */
  public getMembersIdTokens(
    id: TrelloID,
    webhooks: boolean = false,
  ): CancelablePromise<Array<Token>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/tokens',
      path: {
        id: id,
      },
      query: {
        webhooks: webhooks,
      },
    });
  }

  /**
   * Create Avatar for Member
   * Create a new avatar for a member
   * @param id The ID or username of the member
   * @param file
   * @returns any Success
   * @throws ApiError
   */
  public membersidavatar(id: string, file: Blob): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/members/{id}/avatar',
      path: {
        id: id,
      },
      query: {
        file: file,
      },
    });
  }

  /**
   * Dismiss a message for Member
   * Dismiss a message
   * @param id The ID or username of the member
   * @param value The message to dismiss
   * @returns any Success
   * @throws ApiError
   */
  public postMembersIdOnetimemessagesdismissed(
    id: TrelloID,
    value: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/members/{id}/oneTimeMessagesDismissed',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Get a Member's notification channel settings
   * Get a member's notification channel settings
   * @param id The ID or username of the member
   * @returns NotificationChannelSettings Success
   * @throws ApiError
   */
  public getMembersIdNotificationChannelSettings(
    id: TrelloID | string,
  ): CancelablePromise<Array<NotificationChannelSettings>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/notificationsChannelSettings',
      path: {
        id: id,
      },
    });
  }

  /**
   * Update blocked notification keys of Member on a channel
   * Update blocked notification keys of Member on a specific channel
   * @param id The ID or username of the member
   * @param requestBody
   * @returns NotificationChannelSettings Success
   * @throws ApiError
   */
  public putMembersIdNotificationChannelSettingsChannelBlockedKeys(
    id: TrelloID | string,
    requestBody: {
      channel: Channel;
      /**
       * Blocked key or array of blocked keys.
       */
      blockedKeys: BlockedKey | Array<BlockedKey>;
    },
  ): CancelablePromise<NotificationChannelSettings> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/members/{id}/notificationsChannelSettings',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Get blocked notification keys of Member on this channel
   * Get blocked notification keys of Member on a specific channel
   * @param id The ID or username of the member
   * @param channel Channel to block notifications on
   * @returns NotificationChannelSettings Success
   * @throws ApiError
   */
  public getMembersIdNotificationChannelSettingsChannel(
    id: TrelloID | string,
    channel: Channel,
  ): CancelablePromise<NotificationChannelSettings> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/members/{id}/notificationsChannelSettings/{channel}',
      path: {
        id: id,
        channel: channel,
      },
    });
  }

  /**
   * Update blocked notification keys of Member on a channel
   * Update blocked notification keys of Member on a specific channel
   * @param id The ID or username of the member
   * @param channel Channel to block notifications on
   * @param requestBody
   * @returns NotificationChannelSettings Success
   * @throws ApiError
   */
  public putMembersIdNotificationChannelSettingsChannelBlockedKeys1(
    id: TrelloID | string,
    channel: Channel,
    requestBody: {
      /**
       * Singular key or array of notification keys
       */
      blockedKeys: BlockedKey | Array<BlockedKey>;
    },
  ): CancelablePromise<NotificationChannelSettings> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/members/{id}/notificationsChannelSettings/{channel}',
      path: {
        id: id,
        channel: channel,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Update blocked notification keys of Member on a channel
   * Update blocked notification keys of Member on a specific channel
   * @param id The ID or username of the member
   * @param channel Channel to block notifications on
   * @param blockedKeys Singular key or comma-separated list of notification keys
   * @returns NotificationChannelSettings Success
   * @throws ApiError
   */
  public putMembersIdNotificationChannelSettingsChannelBlockedKeys2(
    id: TrelloID | string,
    channel: Channel,
    blockedKeys: BlockedKey,
  ): CancelablePromise<NotificationChannelSettings> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/members/{id}/notificationsChannelSettings/{channel}/{blockedKeys}',
      path: {
        id: id,
        channel: channel,
        blockedKeys: blockedKeys,
      },
    });
  }

  /**
   * Get a Notification
   * @param id The ID of the notification
   * @param board Whether to include the board object
   * @param boardFields `all` or a comma-separated list of board [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param card Whether to include the card object
   * @param cardFields `all` or a comma-separated list of card [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param display Whether to include the display object with the results
   * @param entities Whether to include the entities object with the results
   * @param fields `all` or a comma-separated list of notification [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param list Whether to include the list object
   * @param member Whether to include the member object
   * @param memberFields `all` or a comma-separated list of member [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param memberCreator Whether to include the member object of the creator
   * @param memberCreatorFields `all` or a comma-separated list of member [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @param organization Whether to include the organization object
   * @param organizationFields `all` or a comma-separated list of organization [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getNotificationsId(
    id: TrelloID,
    board: boolean = false,
    boardFields: BoardFields = 'name',
    card: boolean = false,
    cardFields: CardFields = 'name',
    display: boolean = false,
    entities: boolean = false,
    fields: NotificationFields = 'all',
    list: boolean = false,
    member: boolean = true,
    memberFields: MemberFields = 'avatarHash,fullName,initials,username',
    memberCreator: boolean = true,
    memberCreatorFields: MemberFields = 'avatarHash,fullName,initials,username',
    organization: boolean = false,
    organizationFields: OrganizationFields = 'displayName',
  ): CancelablePromise<Notification> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/notifications/{id}',
      path: {
        id: id,
      },
      query: {
        board: board,
        board_fields: boardFields,
        card: card,
        card_fields: cardFields,
        display: display,
        entities: entities,
        fields: fields,
        list: list,
        member: member,
        member_fields: memberFields,
        memberCreator: memberCreator,
        memberCreator_fields: memberCreatorFields,
        organization: organization,
        organization_fields: organizationFields,
      },
    });
  }

  /**
   * Update a Notification's read status
   * Update the read status of a notification
   * @param id The ID of the notification
   * @param unread Whether the notification should be marked as read or not
   * @returns any Success
   * @throws ApiError
   */
  public putNotificationsId(id: TrelloID, unread?: boolean): CancelablePromise<Notification> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/notifications/{id}',
      path: {
        id: id,
      },
      query: {
        unread: unread,
      },
    });
  }

  /**
   * Get a field of a Notification
   * Get a specific property of a notification
   * @param id The ID of the notification
   * @param field A notification [field](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getNotificationsIdField(
    id: TrelloID,
    field: NotificationFields,
  ): CancelablePromise<Notification> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/notifications/{id}/{field}',
      path: {
        id: id,
        field: field,
      },
    });
  }

  /**
   * Mark all Notifications as read
   * Mark all notifications as read
   * @param read Boolean to specify whether to mark as read or unread (defaults to `true`, marking as read)
   * @param ids A comma-seperated list of IDs. Allows specifying an array of notification IDs to change the read state for. This will become useful as we add grouping of notifications to the UI, with a single button to mark all notifications in the group as read/unread.
   * @returns any Success
   * @throws ApiError
   */
  public postNotificationsAllRead(
    read: boolean = true,
    ids?: Array<TrelloID>,
  ): CancelablePromise<Notification> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/notifications/all/read',
      query: {
        read: read,
        ids: ids,
      },
    });
  }

  /**
   * Update Notification's read status
   * Update Notification's read status
   * @param id The ID of the notification
   * @param value
   * @returns any Success
   * @throws ApiError
   */
  public putNotificationsIdUnread(id: TrelloID, value?: string): CancelablePromise<Notification> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/notifications/{id}/unread',
      path: {
        id: id,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Get the Board a Notification is on
   * Get the board a notification is associated with
   * @param id The ID of the notification
   * @param fields `all` or a comma-separated list of board[fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getNotificationsIdBoard(
    id: TrelloID,
    fields: BoardFields = 'all',
  ): CancelablePromise<Board> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/notifications/{id}/board',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get the Card a Notification is on
   * Get the card a notification is associated with
   * @param id The ID of the notification
   * @param fields `all` or a comma-separated list of card [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getNotificationsIdCard(id: TrelloID, fields: CardFields = 'all'): CancelablePromise<Card> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/notifications/{id}/card',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get the List a Notification is on
   * Get the list a notification is associated with
   * @param id The ID of the notification
   * @param fields `all` or a comma-separated list of list [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getNotificationsIdList(
    id: TrelloID,
    fields: ListFields = 'all',
  ): CancelablePromise<TrelloList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/notifications/{id}/list',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get the Member a Notification is about (not the creator)
   * Get the member (not the creator) a notification is about
   * @param id The ID of the notification
   * @param fields `all` or a comma-separated list of member [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public notificationsidmember(
    id: TrelloID,
    fields: MemberFields = 'all',
  ): CancelablePromise<Member> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/notifications/{id}/member',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get the Member who created the Notification
   * Get the member who created the notification
   * @param id The ID of the notification
   * @param fields `all` or a comma-separated list of member [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getNotificationsIdMembercreator(
    id: TrelloID,
    fields: MemberFields = 'all',
  ): CancelablePromise<Member> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/notifications/{id}/memberCreator',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get a Notification's associated Organization
   * Get the organization a notification is associated with
   * @param id The ID of the notification
   * @param fields `all` or a comma-separated list of organization [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getNotificationsIdOrganization(
    id: TrelloID,
    fields: OrganizationFields = 'all',
  ): CancelablePromise<Organization> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/notifications/{id}/organization',
      path: {
        id: id,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Create a new Organization
   * Create a new Workspace
   * @param displayName The name to display for the Organization
   * @param desc The description for the organizations
   * @param name A string with a length of at least 3. Only lowercase letters, underscores, and numbers are allowed. If the name contains invalid characters, they will be removed. If the name conflicts with an existing name, a new name will be substituted.
   * @param website A URL starting with `http://` or `https://`
   * @returns any Success
   * @throws ApiError
   */
  public postOrganizations(
    displayName: string,
    desc?: string,
    name?: string,
    website?: string,
  ): CancelablePromise<Organization> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/organizations',
      query: {
        displayName: displayName,
        desc: desc,
        name: name,
        website: website,
      },
    });
  }

  /**
   * Get an Organization
   * @param id The ID or name of the Organization
   * @returns Organization Success
   * @throws ApiError
   */
  public getOrganizationsId(id: TrelloID): CancelablePromise<Organization> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/organizations/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Update an Organization
   * Update an organization
   * @param id The ID or name of the Organization
   * @param name A new name for the organization. At least 3 lowercase letters, underscores, and numbers. Must be unique
   * @param displayName A new displayName for the organization. Must be at least 1 character long and not begin or end with a space.
   * @param desc A new description for the organization
   * @param website A URL starting with `http://`, `https://`, or `null`
   * @param prefsAssociatedDomain The Google Apps domain to link this org to.
   * @param prefsExternalMembersDisabled Whether non-workspace members can be added to boards inside the Workspace
   * @param prefsGoogleAppsVersion `1` or `2`
   * @param prefsBoardVisibilityRestrictOrg Who on the Workspace can make Workspace visible boards. One of `admin`, `none`, `org`
   * @param prefsBoardVisibilityRestrictPrivate Who can make private boards. One of: `admin`, `none`, `org`
   * @param prefsBoardVisibilityRestrictPublic Who on the Workspace can make public boards. One of: `admin`, `none`, `org`
   * @param prefsOrgInviteRestrict An email address with optional wildcard characters. (E.g. `subdomain.*.trello.com`)
   * @param prefsPermissionLevel Whether the Workspace page is publicly visible. One of: `private`, `public`
   * @returns Organization Success
   * @throws ApiError
   */
  public putOrganizationsId(
    id: TrelloID,
    name?: string,
    displayName?: string,
    desc?: string,
    website?: string,
    prefsAssociatedDomain?: string,
    prefsExternalMembersDisabled?: boolean,
    prefsGoogleAppsVersion?: number,
    prefsBoardVisibilityRestrictOrg?: string,
    prefsBoardVisibilityRestrictPrivate?: string,
    prefsBoardVisibilityRestrictPublic?: string,
    prefsOrgInviteRestrict?: string,
    prefsPermissionLevel?: string,
  ): CancelablePromise<Organization> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/organizations/{id}',
      path: {
        id: id,
      },
      query: {
        name: name,
        displayName: displayName,
        desc: desc,
        website: website,
        'prefs/associatedDomain': prefsAssociatedDomain,
        'prefs/externalMembersDisabled': prefsExternalMembersDisabled,
        'prefs/googleAppsVersion': prefsGoogleAppsVersion,
        'prefs/boardVisibilityRestrict/org': prefsBoardVisibilityRestrictOrg,
        'prefs/boardVisibilityRestrict/private': prefsBoardVisibilityRestrictPrivate,
        'prefs/boardVisibilityRestrict/public': prefsBoardVisibilityRestrictPublic,
        'prefs/orgInviteRestrict': prefsOrgInviteRestrict,
        'prefs/permissionLevel': prefsPermissionLevel,
      },
    });
  }

  /**
   * Delete an Organization
   * Delete an Organization
   * @param id The ID or name of the Organization
   * @returns any Success
   * @throws ApiError
   */
  public deleteOrganizationsId(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/organizations/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get field on Organization
   * @param id The ID or name of the organization
   * @param field An organization [field](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns Organization Success
   * @throws ApiError
   */
  public getOrganizationsIdField(
    id: TrelloID,
    field: OrganizationFields,
  ): CancelablePromise<Organization> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/organizations/{id}/{field}',
      path: {
        id: id,
        field: field,
      },
    });
  }

  /**
   * Get Actions for Organization
   * List the actions on a Workspace
   * @param id The ID or name of the organization
   * @returns Action Success
   * @throws ApiError
   */
  public getOrganizationsIdActions(id: TrelloID): CancelablePromise<Array<Action>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/organizations/{id}/actions',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get Boards in an Organization
   * List the boards in a Workspace
   * @param id The ID or name of the organization
   * @param filter `all` or a comma-separated list of: `open`, `closed`, `members`, `organization`, `public`
   * @param fields `all` or a comma-separated list of board [fields](/cloud/trello/guides/rest-api/object-definitions/)
   * @returns any Success
   * @throws ApiError
   */
  public getOrganizationsIdBoards(
    id: TrelloID,
    filter: 'all' | 'open' | 'closed' | 'members' | 'organization' | 'public' = 'all',
    fields: BoardFields = 'all',
  ): CancelablePromise<Array<Board>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/organizations/{id}/boards',
      path: {
        id: id,
      },
      query: {
        filter: filter,
        fields: fields,
      },
    });
  }

  /**
   * Create Export for Organizations
   * Kick off CSV export for an organization
   * @param id The ID or name of the Workspace
   * @param attachments Whether the CSV should include attachments or not.
   * @returns Export Success
   * @throws ApiError
   */
  public postOrganizationsIdExports(
    id: TrelloID,
    attachments: boolean = true,
  ): CancelablePromise<Export> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/organizations/{id}/exports',
      path: {
        id: id,
      },
      query: {
        attachments: attachments,
      },
    });
  }

  /**
   * Retrieve Organization's Exports
   * Retrieve the exports that exist for the given organization
   * @param id The ID or name of the Workspace
   * @returns Export Success
   * @throws ApiError
   */
  public getOrganizationsIdExports(id: TrelloID): CancelablePromise<Array<Export>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/organizations/{id}/exports',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get the Members of an Organization
   * List the members in a Workspace
   * @param id The ID or name of the Organization
   * @returns any Success
   * @throws ApiError
   */
  public getOrganizationsIdMembers(id: TrelloID): CancelablePromise<Array<Member>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/organizations/{id}/members',
      path: {
        id: id,
      },
    });
  }

  /**
   * Update an Organization's Members
   * @param id The ID or name of the organization
   * @param email An email address
   * @param fullName Name for the member, at least 1 character not beginning or ending with a space
   * @param type One of: `admin`, `normal`
   * @returns any Success
   * @throws ApiError
   */
  public putOrganizationsIdMembers(
    id: TrelloID,
    email: string,
    fullName: string,
    type: 'admin' | 'normal' = 'normal',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/organizations/{id}/members',
      path: {
        id: id,
      },
      query: {
        email: email,
        fullName: fullName,
        type: type,
      },
    });
  }

  /**
   * Get Memberships of an Organization
   * List the memberships of a Workspace
   * @param id The ID or name of the organization
   * @param filter `all` or a comma-separated list of: `active`, `admin`, `deactivated`, `me`, `normal`
   * @param member Whether to include the Member objects with the Memberships
   * @returns any Success
   * @throws ApiError
   */
  public getOrganizationsIdMemberships(
    id: TrelloID,
    filter: 'all' | 'active' | 'admin' | 'deactivated' | 'me' | 'normal' = 'all',
    member: boolean = false,
  ): CancelablePromise<Array<Memberships>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/organizations/{id}/memberships',
      path: {
        id: id,
      },
      query: {
        filter: filter,
        member: member,
      },
    });
  }

  /**
   * Get a Membership of an Organization
   * Get a single Membership for an Organization
   * @param id The ID or name of the organization
   * @param idMembership The ID of the membership to load
   * @param member Whether to include the Member object in the response
   * @returns any Success
   * @throws ApiError
   */
  public getOrganizationsIdMembershipsIdmembership(
    id: TrelloID,
    idMembership: TrelloID,
    member: boolean = false,
  ): CancelablePromise<Memberships> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/organizations/{id}/memberships/{idMembership}',
      path: {
        id: id,
        idMembership: idMembership,
      },
      query: {
        member: member,
      },
    });
  }

  /**
   * Get the pluginData Scoped to Organization
   * Get organization scoped pluginData on this Workspace
   * @param id The ID or name of the organization
   * @returns any Success
   * @throws ApiError
   */
  public getOrganizationsIdPlugindata(id: TrelloID): CancelablePromise<Array<PluginData>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/organizations/{id}/pluginData',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get Tags of an Organization
   * List the organization's collections
   * @param id The ID or name of the Organization
   * @returns any Success
   * @throws ApiError
   */
  public getOrganizationsIdTags(id: string | TrelloID): CancelablePromise<Array<Tag>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/organizations/{id}/tags',
      path: {
        id: id,
      },
    });
  }

  /**
   * Create a Tag in Organization
   * Create a Tag in an Organization
   * @param id The ID or name of the Organization
   * @returns any Success
   * @throws ApiError
   */
  public postOrganizationsIdTags(id: string | TrelloID): CancelablePromise<Tag> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/organizations/{id}/tags',
      path: {
        id: id,
      },
    });
  }

  /**
   * Update a Member of an Organization
   * Add a member to a Workspace or update their member type.
   * @param id The ID or name of the organization
   * @param idMember The ID or username of the member to update
   * @param type One of: `admin`, `normal`
   * @returns any Success
   * @throws ApiError
   */
  public putOrganizationsIdMembersIdmember(
    id: TrelloID,
    idMember: string | TrelloID,
    type: 'admin' | 'normal',
  ): CancelablePromise<Member> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/organizations/{id}/members/{idMember}',
      path: {
        id: id,
        idMember: idMember,
      },
      query: {
        type: type,
      },
    });
  }

  /**
   * Remove a Member from an Organization
   * Remove a member from a Workspace
   * @param id The ID or name of the organization
   * @param idMember The ID of the Member to remove from the Workspace
   * @returns any Success
   * @throws ApiError
   */
  public deleteOrganizationsIdMembers(
    id: TrelloID | string,
    idMember: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/organizations/{id}/members/{idMember}',
      path: {
        id: id,
        idMember: idMember,
      },
    });
  }

  /**
   * Deactivate or reactivate a member of an Organization
   * Deactivate or reactivate a member of a Workspace
   * @param id The ID or name of the organization
   * @param idMember The ID or username of the member to update
   * @param value
   * @returns any Success
   * @throws ApiError
   */
  public putOrganizationsIdMembersIdmemberDeactivated(
    id: TrelloID,
    idMember: TrelloID | string,
    value: boolean,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/organizations/{id}/members/{idMember}/deactivated',
      path: {
        id: id,
        idMember: idMember,
      },
      query: {
        value: value,
      },
    });
  }

  /**
   * Update logo for an Organization
   * Set the logo image for a Workspace
   * @param id The ID or name of the Workspace
   * @param file Image file for the logo
   * @returns any Success
   * @throws ApiError
   */
  public postOrganizationsIdLogo(id: TrelloID, file?: Blob): CancelablePromise<Organization> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/organizations/{id}/logo',
      path: {
        id: id,
      },
      query: {
        file: file,
      },
    });
  }

  /**
   * Delete Logo for Organization
   * Delete a the logo from a Workspace
   * @param id The ID or name of the organization
   * @returns any Success
   * @throws ApiError
   */
  public deleteOrganizationsIdLogo(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/organizations/{id}/logo',
      path: {
        id: id,
      },
    });
  }

  /**
   * Remove a Member from an Organization and all Organization Boards
   * Remove a member from a Workspace and from all Workspace boards
   * @param id The ID or name of the organization
   * @param idMember The ID of the member to remove from the Workspace
   * @returns any Success
   * @throws ApiError
   */
  public organizationsIdMembersIdmemberAll(
    id: TrelloID,
    idMember: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/organizations/{id}/members/{idMember}/all',
      path: {
        id: id,
        idMember: idMember,
      },
    });
  }

  /**
   * Remove the associated Google Apps domain from a Workspace
   * Remove the associated Google Apps domain from a Workspace
   * @param id The ID or name of the organization
   * @returns any Success
   * @throws ApiError
   */
  public deleteOrganizationsIdPrefsAssociateddomain(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/organizations/{id}/prefs/associatedDomain',
      path: {
        id: id,
      },
    });
  }

  /**
   * Delete the email domain restriction on who can be invited to the Workspace
   * Remove the email domain restriction on who can be invited to the Workspace
   * @param id The ID or name of the organization
   * @returns any Success
   * @throws ApiError
   */
  public deleteOrganizationsIdPrefsOrginviterestrict(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/organizations/{id}/prefs/orgInviteRestrict',
      path: {
        id: id,
      },
    });
  }

  /**
   * Delete an Organization's Tag
   * Delete an organization's tag
   * @param id The ID or name of the organization
   * @param idTag The ID of the tag to delete
   * @returns any Success
   * @throws ApiError
   */
  public deleteOrganizationsIdTagsIdtag(id: string, idTag: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/organizations/{id}/tags/{idTag}',
      path: {
        id: id,
        idTag: idTag,
      },
    });
  }

  /**
   * Get Organizations new billable guests
   * Used to check whether the given board has new billable guests on it.
   * @param id The ID or name of the organization
   * @param idBoard The ID of the board to check for new billable guests.
   * @returns any Success
   * @throws ApiError
   */
  public getOrganizationsIdNewbillableguestsIdboard(
    id: TrelloID,
    idBoard: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/organizations/{id}/newBillableGuests/{idBoard}',
      path: {
        id: id,
        idBoard: idBoard,
      },
    });
  }

  /**
   * Get a Plugin
   * Get plugins
   * @param id The ID or name of the organization
   * @returns Plugin Success
   * @throws ApiError
   */
  public getPluginsId(id: TrelloID): CancelablePromise<Plugin> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/plugins/{id}/',
      path: {
        id: id,
      },
    });
  }

  /**
   * Update a Plugin
   * Update a Plugin
   * @param id The ID or name of the organization
   * @returns Plugin Success
   * @throws ApiError
   */
  public putPluginsId(id: TrelloID): CancelablePromise<Plugin> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/plugins/{id}/',
      path: {
        id: id,
      },
    });
  }

  /**
   * Create a Listing for Plugin
   * Create a new listing for a given locale for your Power-Up
   * @param idPlugin The ID of the Power-Up for which you are creating a new listing.
   * @param requestBody
   * @returns PluginListing Success
   * @throws ApiError
   */
  public postPluginsIdpluginListing(
    idPlugin: TrelloID,
    requestBody?: {
      /**
       * The description to show for the given locale
       */
      description?: string;
      /**
       * The locale that this listing should be displayed for.
       */
      locale?: string;
      /**
       * The overview to show for the given locale.
       */
      overview?: string;
      /**
       * The name to use for the given locale.
       */
      name?: string;
    },
  ): CancelablePromise<PluginListing> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/plugins/{idPlugin}/listing',
      path: {
        idPlugin: idPlugin,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Get Plugin's Member privacy compliance
   * @param id The ID of the Power-Up
   * @returns any Success
   * @throws ApiError
   */
  public getPluginsIdComplianceMemberprivacy(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/plugins/{id}/compliance/memberPrivacy',
      path: {
        id: id,
      },
    });
  }

  /**
   * Updating Plugin's Listing
   * Update an existing listing for your Power-Up
   * @param idPlugin The ID of the Power-Up whose listing is being updated.
   * @param idListing The ID of the existing listing for the Power-Up that is being updated.
   * @param requestBody
   * @returns PluginListing Success
   * @throws ApiError
   */
  public putPluginsIdpluginListingsIdlisting(
    idPlugin: TrelloID,
    idListing: TrelloID,
    requestBody?: {
      /**
       * The description to show for the given locale
       */
      description?: string;
      /**
       * The locale that this listing should be displayed for.
       */
      locale?: string;
      /**
       * The overview to show for the given locale.
       */
      overview?: string;
      /**
       * The name to use for the given locale.
       */
      name?: string;
    },
  ): CancelablePromise<PluginListing> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/plugins/{idPlugin}/listings/{idListing}',
      path: {
        idPlugin: idPlugin,
        idListing: idListing,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Search Trello
   * Find what you're looking for in Trello
   * @param query The search query with a length of 1 to 16384 characters
   * @param idBoards `mine` or a comma-separated list of Board IDs
   * @param idOrganizations A comma-separated list of Organization IDs
   * @param idCards A comma-separated list of Card IDs
   * @param modelTypes What type or types of Trello objects you want to search. all or a comma-separated list of: `actions`, `boards`, `cards`, `members`, `organizations`
   * @param boardFields all or a comma-separated list of: `closed`, `dateLastActivity`, `dateLastView`, `desc`, `descData`, `idOrganization`, `invitations`, `invited`, `labelNames`, `memberships`, `name`, `pinned`, `powerUps`, `prefs`, `shortLink`, `shortUrl`, `starred`, `subscribed`, `url`
   * @param boardsLimit The maximum number of boards returned. Maximum: 1000
   * @param boardOrganization Whether to include the parent organization with board results
   * @param cardFields all or a comma-separated list of: `badges`, `checkItemStates`, `closed`, `dateLastActivity`, `desc`, `descData`, `due`, `email`, `idAttachmentCover`, `idBoard`, `idChecklists`, `idLabels`, `idList`, `idMembers`, `idMembersVoted`, `idShort`, `labels`, `manualCoverAttachment`, `name`, `pos`, `shortLink`, `shortUrl`, `subscribed`, `url`
   * @param cardsLimit The maximum number of cards to return. Maximum: 1000
   * @param cardsPage The page of results for cards. Maximum: 100
   * @param cardBoard Whether to include the parent board with card results
   * @param cardList Whether to include the parent list with card results
   * @param cardMembers Whether to include member objects with card results
   * @param cardStickers Whether to include sticker objects with card results
   * @param cardAttachments Whether to include attachment objects with card results. A boolean value (true or false) or cover for only card cover attachments.
   * @param organizationFields all or a comma-separated list of billableMemberCount, desc, descData, displayName, idBoards, invitations, invited, logoHash, memberships, name, powerUps, prefs, premiumFeatures, products, url, website
   * @param organizationsLimit The maximum number of Workspaces to return. Maximum 1000
   * @param memberFields all or a comma-separated list of: avatarHash, bio, bioData, confirmed, fullName, idPremOrgsAdmin, initials, memberType, products, status, url, username
   * @param membersLimit The maximum number of members to return. Maximum 1000
   * @param partial By default, Trello searches for each word in your query against exactly matching words within Member content. Specifying partial to be true means that we will look for content that starts with any of the words in your query.  If you are looking for a Card titled "My Development Status Report", by default you would need to search for "Development". If you have partial enabled, you will be able to search for "dev" but not "velopment".
   * @returns any Success
   * @throws ApiError
   */
  public getSearch(
    query: string,
    idBoards?: 'mine' | TrelloID,
    idOrganizations?: string,
    idCards?: string,
    modelTypes: string = 'all',
    boardFields: string = 'name,idOrganization',
    boardsLimit: number = 10,
    boardOrganization: boolean = false,
    cardFields: string = 'all',
    cardsLimit: number = 10,
    cardsPage?: number,
    cardBoard: boolean = false,
    cardList: boolean = false,
    cardMembers: boolean = false,
    cardStickers: boolean = false,
    cardAttachments: string = 'false',
    organizationFields: string = 'name,displayName',
    organizationsLimit: number = 10,
    memberFields: string = 'avatarHash,fullName,initials,username,confirmed',
    membersLimit: number = 10,
    partial: boolean = false,
  ): CancelablePromise<Array<Member | Card | Board | Organization>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/search',
      query: {
        query: query,
        idBoards: idBoards,
        idOrganizations: idOrganizations,
        idCards: idCards,
        modelTypes: modelTypes,
        board_fields: boardFields,
        boards_limit: boardsLimit,
        board_organization: boardOrganization,
        card_fields: cardFields,
        cards_limit: cardsLimit,
        cards_page: cardsPage,
        card_board: cardBoard,
        card_list: cardList,
        card_members: cardMembers,
        card_stickers: cardStickers,
        card_attachments: cardAttachments,
        organization_fields: organizationFields,
        organizations_limit: organizationsLimit,
        member_fields: memberFields,
        members_limit: membersLimit,
        partial: partial,
      },
    });
  }

  /**
   * Search for Members
   * Search for Trello members.
   * @param query Search query 1 to 16384 characters long
   * @param limit The maximum number of results to return. Maximum of 20.
   * @param idBoard
   * @param idOrganization
   * @param onlyOrgMembers
   * @returns Member Success
   * @throws ApiError
   */
  public getSearchMembers(
    query: string,
    limit: number = 8,
    idBoard?: TrelloID,
    idOrganization?: TrelloID,
    onlyOrgMembers: boolean = false,
  ): CancelablePromise<Array<Member>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/search/members/',
      query: {
        query: query,
        limit: limit,
        idBoard: idBoard,
        idOrganization: idOrganization,
        onlyOrgMembers: onlyOrgMembers,
      },
    });
  }

  /**
   * Get a Token
   * Retrieve information about a token.
   * @param token
   * @param fields `all` or a comma-separated list of `dateCreated`, `dateExpires`, `idMember`, `identifier`, `permissions`
   * @param webhooks Determines whether to include webhooks.
   * @returns Token Success
   * @throws ApiError
   */
  public getTokensToken(
    token: string,
    fields: TokenFields = 'all',
    webhooks: boolean = false,
  ): CancelablePromise<Token> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/tokens/{token}',
      path: {
        token: token,
      },
      query: {
        fields: fields,
        webhooks: webhooks,
      },
    });
  }

  /**
   * Get Token's Member
   * Retrieve information about a token's owner by token.
   * @param token
   * @param fields `all` or a comma-separated list of valid fields for [Member Object](/cloud/trello/guides/rest-api/object-definitions/).
   * @returns Member Success
   * @throws ApiError
   */
  public getTokensTokenMember(
    token: string,
    fields: MemberFields = 'all',
  ): CancelablePromise<Member> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/tokens/{token}/member',
      path: {
        token: token,
      },
      query: {
        fields: fields,
      },
    });
  }

  /**
   * Get Webhooks for Token
   * Retrieve all webhooks created with a Token.
   * @param token
   * @returns Webhook Success
   * @throws ApiError
   */
  public getTokensTokenWebhooks(token: string): CancelablePromise<Array<Webhook>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/tokens/{token}/webhooks',
      path: {
        token: token,
      },
    });
  }

  /**
   * Create Webhooks for Token
   * Create a new webhook for a Token.
   * @param token
   * @param callbackUrl The URL that the webhook should POST information to.
   * @param idModel ID of the object to create a webhook on.
   * @param description A description to be displayed when retrieving information about the webhook.
   * @returns Webhook Success
   * @throws ApiError
   */
  public postTokensTokenWebhooks(
    token: string,
    callbackUrl: string,
    idModel: TrelloID,
    description?: string,
  ): CancelablePromise<Webhook> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/tokens/{token}/webhooks',
      path: {
        token: token,
      },
      query: {
        description: description,
        callbackURL: callbackUrl,
        idModel: idModel,
      },
    });
  }

  /**
   * Get a Webhook belonging to a Token
   * Retrieve a webhook created with a Token.
   * @param token
   * @param idWebhook ID of the [Webhooks](ref:webhooks) to retrieve.
   * @returns Webhook Success
   * @throws ApiError
   */
  public getTokensTokenWebhooksIdwebhook(
    token: string,
    idWebhook: TrelloID,
  ): CancelablePromise<Webhook> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/tokens/{token}/webhooks/{idWebhook}',
      path: {
        token: token,
        idWebhook: idWebhook,
      },
    });
  }

  /**
   * Delete a Webhook created by Token
   * Delete a webhook created with given token.
   * @param token
   * @param idWebhook ID of the [Webhooks](ref:webhooks) to retrieve.
   * @returns any Success
   * @throws ApiError
   */
  public deleteTokensTokenWebhooksIdwebhook(
    token: string,
    idWebhook: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/tokens/{token}/webhooks/{idWebhook}',
      path: {
        token: token,
        idWebhook: idWebhook,
      },
    });
  }

  /**
   * Update a Webhook created by Token
   * Update a Webhook created by Token
   * @param token
   * @param idWebhook ID of the [Webhooks](ref:webhooks) to retrieve.
   * @param description A description to be displayed when retrieving information about the webhook.
   * @param callbackUrl The URL that the webhook should `POST` information to.
   * @param idModel ID of the object that the webhook is on.
   * @returns any Success
   * @throws ApiError
   */
  public tokenstokenwebhooks1(
    token: string,
    idWebhook: TrelloID,
    description?: string,
    callbackUrl?: string,
    idModel?: TrelloID,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/tokens/{token}/webhooks/{idWebhook}',
      path: {
        token: token,
        idWebhook: idWebhook,
      },
      query: {
        description: description,
        callbackURL: callbackUrl,
        idModel: idModel,
      },
    });
  }

  /**
   * Delete a Token
   * Delete a token.
   * @param token
   * @returns any Success
   * @throws ApiError
   */
  public deleteToken(token: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/tokens/{token}/',
      path: {
        token: token,
      },
    });
  }

  /**
   * Create a Webhook
   * Create a new webhook.
   * @param callbackUrl A valid URL that is reachable with a `HEAD` and `POST` request.
   * @param idModel ID of the model to be monitored
   * @param description A string with a length from `0` to `16384`.
   * @param active Determines whether the webhook is active and sending `POST` requests.
   * @returns Webhook Success
   * @throws ApiError
   */
  public postWebhooks(
    callbackUrl: string,
    idModel: TrelloID,
    description?: string,
    active?: boolean,
  ): CancelablePromise<Webhook> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/webhooks/',
      query: {
        description: description,
        callbackURL: callbackUrl,
        idModel: idModel,
        active: active,
      },
    });
  }

  /**
   * Get a Webhook
   * Get a webhook by ID. You must use the token query parameter and pass in the token the webhook was created under, or else you will encounter a 'webhook does not belong to token' error.
   * @param id ID of the webhook to retrieve.
   * @returns Webhook Success
   * @throws ApiError
   */
  public getWebhooksId(id: TrelloID): CancelablePromise<Webhook> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/webhooks/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Update a Webhook
   * Update a webhook by ID.
   * @param id ID of the webhook to retrieve.
   * @param description A string with a length from `0` to `16384`.
   * @param callbackUrl A valid URL that is reachable with a `HEAD` and `POST` request.
   * @param idModel ID of the model to be monitored
   * @param active Determines whether the webhook is active and sending `POST` requests.
   * @returns Webhook Success
   * @throws ApiError
   */
  public putWebhooksId(
    id: TrelloID,
    description?: string,
    callbackUrl?: string,
    idModel?: TrelloID,
    active?: boolean,
  ): CancelablePromise<Webhook> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/webhooks/{id}',
      path: {
        id: id,
      },
      query: {
        description: description,
        callbackURL: callbackUrl,
        idModel: idModel,
        active: active,
      },
    });
  }

  /**
   * Delete a Webhook
   * Delete a webhook by ID.
   * @param id ID of the webhook to retrieve.
   * @returns any Success
   * @throws ApiError
   */
  public deleteWebhooksId(id: TrelloID): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/webhooks/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get a field on a Webhook
   * Get a field on a Webhook
   * @param id ID of the webhook.
   * @param field Field to retrieve. One of: `active`, `callbackURL`, `description`, `idModel`
   * @returns any Success
   * @throws ApiError
   */
  public webhooksidfield(
    id: TrelloID,
    field:
      | 'active'
      | 'callbackURL'
      | 'description'
      | 'idModel'
      | 'consecutiveFailures'
      | 'firstConsecutiveFailDate',
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/webhooks/{id}/{field}',
      path: {
        id: id,
        field: field,
      },
    });
  }
}
