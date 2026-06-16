import axios from 'axios';

export enum TrainDepartureStatus {
  ON_STATION = 'ON_STATION',
  INCOMING = 'INCOMING',
}

interface NsTrainResponse {
  direction: string;
  name: string;
  plannedDateTime: string;
  plannedTimeZoneOffset: number;
  actualDateTime: string;
  actualTimeZoneOffset: number;
  plannedTrack: string;
  actualTrack: string;
  product: {
    number: string;
    categoryCode: string;
    shortCategoryName: string;
    longCategoryName: string;
    operatorCode: string;
    operatorName: string;
    type: string;
  };
  trainCategory: string;
  cancelled: boolean;
  routeStations: {
    uicCode: string;
    mediumName: string;
  }[];
  messages: {
    style: string;
    message: string;
  }[];
  departureStatus: TrainDepartureStatus;
}

export interface TrainResponse {
  direction: string;
  plannedDateTime: string;
  delay: number;
  trainType: string;
  operator: string;
  cancelled: boolean;
  routeStations: string[];
  messages: {
    style: string;
    message: string;
  }[];
}

export default class NsTrainsService {
  public async getTrains() {
    const config = {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.NS_KEY,
      },
    };

    const departures = (
      await axios.get(
        'https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/departures' +
          '?station=EHV&maxJourneys=40',
        config,
      )
    ).data.payload.departures as NsTrainResponse[];
    const minDepartTime = new Date(new Date().getTime() + 8 * 60000);

    const futureDepartures = departures.filter((departure) => {
      const actualDepartTime = new Date(departure.actualDateTime);
      return minDepartTime <= actualDepartTime;
    });

    return futureDepartures.map((departure): TrainResponse => {
      let delay = 0;
      const actualDepartTime = new Date(departure.actualDateTime);
      if (departure.plannedDateTime !== departure.actualDateTime) {
        delay = new Date(
          actualDepartTime.getTime() - new Date(departure.plannedDateTime).getTime(),
        ).getMinutes();
      }

      const routeStations: string[] = departure.routeStations.map((s) => s.mediumName);

      return {
        direction: departure.direction,
        plannedDateTime: departure.plannedDateTime,
        delay,
        trainType: departure.product.categoryCode,
        operator: departure.product.operatorCode,
        cancelled: departure.cancelled,
        routeStations,
        messages: departure.messages,
      };
    });
  }
}
