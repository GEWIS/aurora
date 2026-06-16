import MixTape, { FeedEvent } from './mix-tape';
import centurion2Original from './gebroeders-scooter-centurion-2-original';

const missingHorn: FeedEvent = {
  timestamp: 4092.9,
  type: 'horn',
  data: {
    counter: 66,
  },
};

const centurion2Fixed: MixTape = {
  ...centurion2Original,
  name: 'Centurion 2.0 (Fixed)',
  songFile: 'https://avico.gewis.nl/centurion/gebroeders-scooter-centurion-2-fixed.mp3',
  feed: centurion2Original.feed
    .map((e) => {
      // Only change horns
      if (e.type !== 'horn') return e;
      // Only change horns before the missing horn
      if (e.timestamp > missingHorn.timestamp) return e;

      // Decrement the counter by one, because we are inserting the missing one
      return {
        ...e,
        data: {
          ...e.data,
          counter: e.data.counter - 1,
        },
      };
    })
    .concat([missingHorn])
    .sort((a, b) => a.timestamp - b.timestamp),
};

export default centurion2Fixed;
