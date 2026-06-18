export interface MedalTableRecord {
  countryName: string;
  flagUrl: string;
  rank?: number;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

export interface CountryMedalResponse extends MedalTableRecord {
  medals: OlympicMedal[];
}

interface OlympicMedal {
  participantId: number;
  eventId: number;
  participantName: string;
  sportName: string;
  eventName: string;
  medal: 'gold' | 'silver' | 'bronze';
}

interface MedalTableAPIResponse {
  MedalTableInfo: {
    c_AsOfDate: string;
    n_EventsTotal: number;
    n_EventsFinished: number;
    n_EventsScheduled: number;
    n_MedalsGold: number;
    n_MedalsSilver: number;
    n_MedalsBronze: number;
    n_MedalsTotal: number;
  };
  MedalTableNOC: {
    n_NOCID: number;
    n_NOCGeoID: number;
    c_NOC: string;
    c_NOCShort: string;
    n_Gold: number;
    n_Silver: number;
    n_Bronze: number;
    n_Total: number;
    n_RankGold: number;
    n_RankSortGold: number;
    n_RankTotal: number;
    n_RankSortTotal: number;
  }[];
}

interface SportApiResponse {
  n_ID: number;
  n_TypeId: number;
  c_Name: string;
  c_Short: string;
}

interface MedalListAPIResponse {
  Participant: {
    n_PersonID: number;
    n_TeamID: number;
    n_ParticipantTypeId: number;
    c_Participant: string;
    c_ParticipantShort: string;
    c_ParticipantFirstName: string;
    c_ParticipantLastName: string;
  };
  n_EventPhaseId: number;
  GenderEvent: {
    n_ID: number;
    c_Name: string;
  };
  Event: {
    n_ID: number;
    n_TypeID: number;
    c_Name: string;
    c_Short: string;
  };
  Gender: {
    n_ID: number;
    c_Name: string;
    c_Short: string;
  };
  TeamMembers: {
    n_PersonID: number;
    c_Person: string;
    c_PersonShort: string;
    c_PersonFirstName: string;
    c_PersonLastName: string;
  }[];
}

interface CountryMedalsAPIResponse {
  NOCMedals: {
    NOC: {
      n_ID: number;
      c_Name: string;
      c_Short: string;
      n_GeoID: number;
    };
    Medals: {
      n_Gold: number;
      n_Silver: number;
      n_Bronze: number;
      n_Total: number;
    };
  } | null;
  SportList: {
    Sport: SportApiResponse;
    Medals: {
      n_Gold: number;
      n_Silver: number;
      n_Bronze: number;
      n_Total: number;
      n_RankGold: number;
      n_RankSortGold: number;
      n_RankTotal: number;
      n_RankSortTotal: number;
    };
    GoldMedalList: MedalListAPIResponse[];
    SilverMedalList: MedalListAPIResponse[];
    BronzeMedalList: MedalListAPIResponse[];
  }[];
}

export default class OlympicsService {
  private getFlagUrl(id: number) {
    return `https://images.sports.gracenote.com/images/lib/basic/geo/country/flag/SVG/${id}.svg`;
  }

  public async getMedalTable(): Promise<MedalTableRecord[]> {
    const olympicsApiResponse = await fetch(
      'https://og2024-api.sports.gracenote.com/svc/games_v2.svc/json/GetMedalTable_Season?competitionSetId=1&season=2024&languageCode=2',
    );
    const body: MedalTableAPIResponse = await olympicsApiResponse.json();

    return body.MedalTableNOC.map((r) => ({
      countryName: r.c_NOC,
      flagUrl: this.getFlagUrl(r.n_NOCGeoID),
      rank: r.n_RankGold,
      gold: r.n_Gold,
      silver: r.n_Silver,
      bronze: r.n_Bronze,
      total: r.n_Total,
    }));
  }

  public async getDutchMedals(): Promise<CountryMedalResponse | null> {
    const netherlandsId = 1;
    const response = await fetch(
      `https://og2024-api.sports.gracenote.com/svc/games_v2.svc/json/GetMedalTableNOCDetail_Season?competitionSetId=1&season=2024&languageCode=2&nocid=${netherlandsId}`,
    );
    const body: CountryMedalsAPIResponse = await response.json();

    const parseMedalApiResponse = (
      s: SportApiResponse,
      m: MedalListAPIResponse,
      medal: 'gold' | 'silver' | 'bronze',
    ): OlympicMedal => ({
      participantId: m.Participant.n_PersonID ?? m.Participant.n_TeamID,
      eventId: m.n_EventPhaseId,
      participantName: m.Participant.c_Participant,
      sportName: s.c_Name,
      eventName: m.GenderEvent.c_Name,
      medal,
    });

    if (body.NOCMedals == null) {
      return null;
    }

    const medals: OlympicMedal[] = body.SportList.map((s): OlympicMedal[] => [
      ...s.GoldMedalList.map((m) => parseMedalApiResponse(s.Sport, m, 'gold')),
      ...s.SilverMedalList.map((m) => parseMedalApiResponse(s.Sport, m, 'silver')),
      ...s.BronzeMedalList.map((m) => parseMedalApiResponse(s.Sport, m, 'bronze')),
    ])
      .flat()
      // Shuffle array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    return {
      countryName: body.NOCMedals.NOC.c_Name,
      flagUrl: this.getFlagUrl(body.NOCMedals.NOC.n_GeoID),
      gold: body.NOCMedals.Medals.n_Gold,
      silver: body.NOCMedals.Medals.n_Silver,
      bronze: body.NOCMedals.Medals.n_Bronze,
      total: body.NOCMedals.Medals.n_Total,
      medals,
    };
  }
}
