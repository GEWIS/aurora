import { vi, type MockInstance } from 'vitest';

/**
 * Stub for the Gracenote Olympics API that `OlympicsService` calls.
 *
 * These endpoints used to be exercised against the live service, which made the suite
 * depend on a third party being up, unthrottled and still serving 2024 data. Responses here
 * are trimmed captures of the real payloads — enough fields for the service to parse, in
 * the same shape.
 */
const MEDAL_TABLE = {
  MedalTableInfo: {},
  MedalTableNOC: [
    {
      n_NOCID: 5,
      n_NOCGeoID: 2209,
      c_NOC: 'United States',
      c_NOCShort: 'USA',
      n_Gold: 40,
      n_Silver: 44,
      n_Bronze: 42,
      n_Total: 126,
      n_RankGold: 1,
      n_RankSortGold: 1,
      n_RankTotal: 1,
      n_RankSortTotal: 1,
    },
    {
      n_NOCID: 1,
      n_NOCGeoID: 1,
      c_NOC: 'Netherlands',
      c_NOCShort: 'NED',
      n_Gold: 15,
      n_Silver: 7,
      n_Bronze: 12,
      n_Total: 34,
      n_RankGold: 6,
      n_RankSortGold: 6,
      n_RankTotal: 7,
      n_RankSortTotal: 7,
    },
  ],
};

const participant = (id: number, name: string) => ({
  n_PersonID: id,
  n_TeamID: null,
  n_ParticipantTypeID: 1,
  c_Participant: name,
  c_ParticipantShort: name,
});

const COUNTRY_MEDALS = {
  NOCMedals: {
    NOC: { c_Name: 'Netherlands', n_GeoID: 1 },
    Medals: { n_Gold: 15, n_Silver: 7, n_Bronze: 12, n_Total: 34 },
  },
  SportList: [
    {
      Sport: { n_ID: 128, n_TypeID: 3, c_Name: 'Rowing', c_Short: 'ROW' },
      Medals: { n_Gold: 4, n_Silver: 3, n_Bronze: 1, n_Total: 8 },
      GoldMedalList: [
        {
          n_EventPhaseId: 1,
          Participant: participant(1389976, 'Karolien Florijn'),
          GenderEvent: { c_Name: "Women's Single Sculls" },
        },
      ],
      SilverMedalList: [
        {
          n_EventPhaseId: 2,
          Participant: participant(1389977, 'Simon van Dorp'),
          GenderEvent: { c_Name: "Men's Single Sculls" },
        },
      ],
      BronzeMedalList: [],
    },
  ],
};

const json = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

/**
 * Answer the Olympics endpoints from fixtures.
 *
 * Any other URL throws rather than reaching the network: a test that unexpectedly calls out
 * should say so, not quietly depend on someone else's uptime. Restore with
 * `vi.restoreAllMocks()`.
 */
export function stubOlympicsApi(): MockInstance {
  return vi.spyOn(global, 'fetch').mockImplementation((input) => {
    const url = String(input instanceof Request ? input.url : input);

    if (url.includes('GetMedalTableNOCDetail_Season')) return Promise.resolve(json(COUNTRY_MEDALS));
    if (url.includes('GetMedalTable_Season')) return Promise.resolve(json(MEDAL_TABLE));

    return Promise.reject(new Error(`Unstubbed outbound request in test: ${url}`));
  });
}
