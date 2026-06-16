import gebroedersScooterCenturion from './gebroeders-scooter-centurion';
import gebroedersScooterCenturion2Fixed from './gebroeders-scooter-centurion-2-fixed';
import gebroedersScooterCenturion2Original from './gebroeders-scooter-centurion-2-original';
import gebroedersScooterTotaleEscalatien from './gebroeders-scooter-totale-escalatien';
import gebroedersScooterTotaleEscalatieNegendarisch from './gebroeders-scooter-totale-escalatie-negendarisch';
import athenaCenturion from './athena-centurion';
import boomCenturion from './boom-centurion';
import MixTape, { Horn } from './mix-tape';

const tapes = [
  gebroedersScooterCenturion,
  gebroedersScooterCenturion2Fixed,
  gebroedersScooterCenturion2Original,
  gebroedersScooterTotaleEscalatieNegendarisch,
  gebroedersScooterTotaleEscalatien,
  athenaCenturion,
  boomCenturion,
];

/**
 * Simple checks to see if we did not make any stupid mistakes in Centurion transciptions
 * @param tape
 */
export function validateTape(tape: MixTape) {
  // Events must be sorted
  tape.feed.forEach((event, i, all) => {
    if (i === 0) return;
    const prevEvent = all[i - 1];
    if (prevEvent.timestamp > event.timestamp) {
      throw new Error(
        `[Tape "${tape.name}"] Timestamp of event with index ${i - 1} (${prevEvent.timestamp}) is greater than the event with index ${i} (${event.timestamp})`,
      );
    }
  });

  //
  const hornExceptions = [
    {
      // This horn is excluded, because the two are very, very close together
      tapeName: gebroedersScooterTotaleEscalatien.name,
      hornCount: 41,
    },
  ];
  const isExcluded = (hornEvent: Horn) => {
    return hornExceptions.some(
      (h) => h.tapeName === tape.name && h.hornCount === hornEvent.data.counter,
    );
  };

  tape.feed
    .filter((e) => e.type === 'horn')
    .forEach((hornEvent, i, all) => {
      if (i === 0) return;
      const prevHornEvent = all[i - 1];
      if (prevHornEvent.data.counter + 1 !== hornEvent.data.counter && !isExcluded(hornEvent)) {
        throw new Error(
          `[Tape "${tape.name}"] Horn ${prevHornEvent.data.counter} is not succeeded by horn ${prevHornEvent.data.counter}, but ${hornEvent.data.counter}`,
        );
      }
    });
}

export default tapes;

export { default as MixTape } from './mix-tape';
