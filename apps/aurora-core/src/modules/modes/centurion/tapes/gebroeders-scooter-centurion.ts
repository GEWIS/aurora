import MixTape from './mix-tape';
import SearchLight from '../../../lights/effects/movement/search-light';
import { Fire, SingleFlood, StaticColor } from '../../../lights/effects/color';
import { RgbColor } from '../../../lights/color-definitions';

const centurion: MixTape = {
  name: 'Centurion',
  artist: 'Gebroeders Scooter',
  songFile: 'https://avico.gewis.nl/centurion/gebroeders-scooter-centurion.mp3',
  coverUrl: 'https://i1.sndcdn.com/artworks-000660440143-nxgkca-t500x500.jpg',
  duration: 6075,
  feed: [
    {
      timestamp: 1,
      type: 'effect',
      data: {
        effects: {
          pars: [Fire.build()],
          movingHeadWheelColor: [StaticColor.build({ color: RgbColor.BLINDINGWHITE })],
          movingHeadWheelMovement: [SearchLight.build()],
        },
      },
    },
    {
      timestamp: 38.8,
      type: 'effect',
      data: {
        effects: {
          pars: [SingleFlood.build({ color: RgbColor.YELLOW })],
          movingHeadWheelColor: [],
          movingHeadWheelMovement: [],
        },
      },
    },
    {
      timestamp: 39.8,
      type: 'effect',
      data: {
        effects: {
          pars: [SingleFlood.build({ color: RgbColor.YELLOW })],
        },
      },
    },
    {
      timestamp: 40.8,
      type: 'effect',
      data: {
        effects: {
          pars: [SingleFlood.build({ color: RgbColor.YELLOW })],
        },
      },
    },
    {
      timestamp: 41.9,
      type: 'horn',
      data: {
        counter: 0,
      },
    },
    {
      timestamp: 42.0,
      type: 'song',
      data: {
        artist: 'Nena',
        title: '99 Luftballons',
        bpm: 100,
      },
    },
    {
      timestamp: 108.4,
      type: 'horn',
      data: {
        counter: 1,
      },
    },
    {
      timestamp: 148.0,
      type: 'song',
      data: {
        artist: 'Hermes House Band',
        title: 'Country Roads',
        bpm: 103,
      },
    },
    {
      timestamp: 166.9,
      type: 'horn',
      data: {
        counter: 2,
      },
    },
    {
      timestamp: 185.0,
      type: 'song',
      data: {
        artist: 'Vinzzent',
        title: 'Dromendans',
        bpm: 103,
      },
    },
    {
      timestamp: 222.8,
      type: 'horn',
      data: {
        counter: 3,
      },
    },
    {
      timestamp: 223.0,
      type: 'song',
      data: {
        artist: 'Linda, Roos & Jessica',
        title: 'Ademnood',
        bpm: 103,
      },
    },
    {
      timestamp: 283.5,
      type: 'horn',
      data: {
        counter: 4,
      },
    },
    {
      timestamp: 284.0,
      type: 'song',
      data: {
        artist: 'Peter de Koning',
        title: 'Het is altijd lente in de ogen van de tandarts-assistente',
        bpm: 103,
      },
    },
    {
      timestamp: 339.4,
      type: 'horn',
      data: {
        counter: 5,
      },
    },
    {
      timestamp: 340.0,
      type: 'song',
      data: {
        artist: 'Liquido',
        title: 'Narcotic',
        bpm: 103,
      },
    },
    {
      timestamp: 411.75,
      type: 'horn',
      data: {
        counter: 6,
      },
    },
    {
      timestamp: 412.0,
      type: 'song',
      data: {
        artist: 'Snoop Dogg feat. Pharrell',
        title: "Drop It Like It's Hot",
        bpm: 103,
      },
    },
    {
      timestamp: 449.0,
      type: 'song',
      data: {
        artist: 'M.O.P.',
        title: 'Ante Up',
        bpm: 103,
      },
    },
    {
      timestamp: 458.3,
      type: 'horn',
      data: {
        counter: 7,
      },
    },
    {
      timestamp: 514.0,
      type: 'song',
      data: {
        artist: 'Los Del Rio',
        title: 'Macarena',
        bpm: 103,
      },
    },
    {
      timestamp: 514.4,
      type: 'horn',
      data: {
        counter: 8,
      },
    },
    {
      timestamp: 560.0,
      type: 'song',
      data: {
        artist: 'Spice Girls',
        title: 'Wannabe',
        bpm: 110,
      },
    },
    {
      timestamp: 573.9,
      type: 'horn',
      data: {
        counter: 9,
      },
    },
    {
      timestamp: 617.0,
      type: 'song',
      data: {
        artist: 'Major Lazer feat. Busy Signal, The Flexican & FS Green',
        title: 'Watch Out For This (Bumaye)',
        bpm: 115,
      },
    },
    {
      timestamp: 634.5,
      type: 'horn',
      data: {
        counter: 10,
      },
    },
    {
      timestamp: 650.0,
      type: 'song',
      data: {
        artist: 'André van Duin',
        title: 'Er staat een paard in de gang',
        bpm: 115,
      },
    },
    {
      timestamp: 667.0,
      type: 'song',
      data: {
        artist: 'Lil Kleine & Ronnie Flex',
        title: 'Drank & Drugs',
        bpm: 118,
      },
    },
    {
      timestamp: 684.0,
      type: 'song',
      data: {
        artist: 'Kabouter Plop',
        title: 'Kabouterdans',
        bpm: 118,
      },
    },
    {
      timestamp: 698.83,
      type: 'horn',
      data: {
        counter: 11,
      },
    },
    {
      timestamp: 725.0,
      type: 'song',
      data: {
        artist: 'K3',
        title: 'Alle kleuren',
        bpm: 120,
      },
    },
    {
      timestamp: 756.1,
      type: 'horn',
      data: {
        counter: 12,
      },
    },
    {
      timestamp: 757.0,
      type: 'song',
      data: {
        artist: 'Kinderen voor Kinderen',
        title: 'Tietenlied',
        bpm: 122 / 2,
      },
    },
    {
      timestamp: 811.5,
      type: 'horn',
      data: {
        counter: 13,
      },
    },
    {
      timestamp: 812.0,
      type: 'song',
      data: {
        artist: 'Guus Meeuwis',
        title: 'Het dondert en het bliksemt',
        bpm: 123,
      },
    },
    {
      timestamp: 873.8,
      type: 'horn',
      data: {
        counter: 14,
      },
    },
    {
      timestamp: 876.0,
      type: 'song',
      data: {
        artist: 'Harry Vermeegen',
        title: '1-2-3-4 Dennis bier',
        bpm: 126,
      },
    },
    {
      timestamp: 906.0,
      type: 'song',
      data: {
        artist: 'Puhdys',
        title: "Hey, wir woll’n die Eisbär'n sehn!",
        bpm: 127,
      },
    },
    {
      timestamp: 934.9,
      type: 'horn',
      data: {
        counter: 15,
      },
    },
    {
      timestamp: 966.0,
      type: 'song',
      data: {
        artist: 'DJ Ötzi',
        title: 'Burger Dance',
        bpm: 127,
      },
    },
    {
      timestamp: 994.7,
      type: 'horn',
      data: {
        counter: 16,
      },
    },
    {
      timestamp: 996.0,
      type: 'song',
      data: {
        artist: 'Mickie Krause',
        title: 'Hütte auf der Alm',
        bpm: 127,
      },
    },
    {
      timestamp: 1030.0,
      type: 'song',
      data: {
        artist: 'Ali B & Yes-R & The Partysquad',
        title: 'Rampeneren',
        bpm: 127,
      },
    },
    {
      timestamp: 1045.7,
      type: 'horn',
      data: {
        counter: 17,
      },
    },
    {
      timestamp: 1106.41,
      type: 'horn',
      data: {
        counter: 18,
      },
    },
    {
      timestamp: 1107.0,
      type: 'song',
      data: {
        artist: 'Martin Solveig',
        title: 'Intoxicated',
        bpm: 127,
      },
    },
    {
      timestamp: 1137.0,
      type: 'song',
      data: {
        artist: 'Nicki Minaj',
        title: 'Starships',
        bpm: 127,
      },
    },
    {
      timestamp: 1172.8,
      type: 'horn',
      data: {
        counter: 19,
      },
    },
    {
      timestamp: 1174.0,
      type: 'song',
      data: [
        {
          artist: 'Icona Pop',
          title: 'I Love It (feat. Charli xcx)',
          bpm: 127,
        },
        {
          artist: 'Martin Garrix',
          title: 'Animals',
          bpm: 127,
        },
      ],
    },
    {
      timestamp: 1222.0,
      type: 'song',
      data: {
        artist: '2Unlimited',
        title: 'Get Ready For This',
        bpm: 127,
      },
    },
    {
      timestamp: 1235.2,
      type: 'horn',
      data: {
        counter: 20,
      },
    },
    {
      timestamp: 1275.0,
      type: 'song',
      data: {
        artist: 'The Village People',
        title: 'YMCA',
        bpm: 127,
      },
    },
    {
      timestamp: 1288.0,
      type: 'horn',
      data: {
        counter: 21,
      },
    },
    {
      timestamp: 1288.0,
      type: 'effect',
      data: {
        // Add the disco ball
        discoBall: true,
        effects: {},
      },
    },
    {
      timestamp: 1348.4,
      type: 'effect',
      data: {
        discoBall: false,
        effects: {},
      },
    },
    {
      timestamp: 1348.4,
      type: 'horn',
      data: {
        counter: 22,
      },
    },
    {
      timestamp: 1350.0,
      type: 'song',
      data: {
        artist: 'Carly Rae Jepsen ft Owl City',
        title: "It's Always A Good Time",
        bpm: 127,
      },
    },
    {
      timestamp: 1395.0,
      type: 'song',
      data: {
        artist: 'Avicii',
        title: 'Levels',
        bpm: 127,
      },
    },
    {
      timestamp: 1410.4,
      type: 'horn',
      data: {
        counter: 23,
      },
    },
    {
      timestamp: 1456.0,
      type: 'song',
      data: {
        artist: 'Flo-Rida feat. T-Pain',
        title: 'Low',
        bpm: 128,
      },
    },
    {
      timestamp: 1470.5,
      type: 'horn',
      data: {
        counter: 24,
      },
    },
    {
      timestamp: 1486.0,
      type: 'song',
      data: {
        artist: 'Taio Cruz',
        title: 'Hangover',
        bpm: 128,
      },
    },
    {
      timestamp: 1530.4,
      type: 'horn',
      data: {
        counter: 25,
      },
    },
    {
      timestamp: 1545.0,
      type: 'song',
      data: {
        artist: 'LMFAO',
        title: 'Party Rock Anthem',
        bpm: 130,
      },
    },
    {
      timestamp: 1589,
      type: 'bpm',
      data: { bpm: 1 },
    },
    {
      timestamp: 1593.7,
      type: 'horn',
      data: {
        counter: 26,
      },
    },
    {
      timestamp: 1594.0,
      type: 'song',
      data: {
        artist: 'Hans Entertainment vs. Finger & Kadel',
        title: 'Hoch die Hände',
        bpm: 130,
      },
    },
    {
      timestamp: 1623.0,
      type: 'song',
      data: {
        artist: 'Galantis',
        title: 'No Money',
        bpm: 130,
      },
    },
    {
      timestamp: 1653.0,
      type: 'horn',
      data: {
        counter: 27,
      },
    },
    {
      timestamp: 1683.0,
      type: 'song',
      data: {
        artist: 'Kid Cudi',
        title: 'Pursuit of Happiness (Steve Aoki remix)',
        bpm: 131,
      },
    },
    {
      timestamp: 1711.91,
      type: 'horn',
      data: {
        counter: 28,
      },
    },
    {
      timestamp: 1741.0,
      type: 'song',
      data: {
        artist: 'Yeah Yeah Yeahs',
        title: 'Heads Will Roll (A-Trak remix)',
        bpm: 131,
      },
    },
    {
      timestamp: 1768.8,
      type: 'horn',
      data: {
        counter: 29,
      },
    },
    {
      timestamp: 1814.0,
      type: 'song',
      data: {
        artist: 'Michael Calfan',
        title: 'Resurrection',
        bpm: 132,
      },
    },
    {
      timestamp: 1829.0,
      type: 'horn',
      data: {
        counter: 30,
      },
    },
    {
      timestamp: 1858.0,
      type: 'song',
      data: {
        artist: 'Basto!',
        title: 'Again and Again',
        bpm: 133,
      },
    },
    {
      timestamp: 1887.0,
      type: 'horn',
      data: {
        counter: 31,
      },
    },
    {
      timestamp: 1916.0,
      type: 'song',
      data: {
        artist: 'David Guetta feat. Sia',
        title: 'Titanium',
        bpm: 133,
      },
    },
    {
      timestamp: 1944.8,
      type: 'horn',
      data: {
        counter: 32,
      },
    },
    {
      timestamp: 1959.0,
      type: 'song',
      data: {
        artist: 'Gala',
        title: 'Freed From Desire',
        bpm: 133,
      },
    },
    {
      timestamp: 2004.1,
      type: 'horn',
      data: {
        counter: 33,
      },
    },
    {
      timestamp: 2005.0,
      type: 'song',
      data: {
        artist: 'Feestteam',
        title: 'Shirt Uit & Zwaaien',
        bpm: 138,
      },
    },
    {
      timestamp: 2034.0,
      type: 'song',
      data: {
        artist: 'Wolter Kroes',
        title: 'Viva Hollandia',
        bpm: 135,
      },
    },
    {
      timestamp: 2064.1,
      type: 'horn',
      data: {
        counter: 34,
      },
    },
    {
      timestamp: 2090.0,
      type: 'song',
      data: {
        artist: 'Spongebob Squarepants',
        title: 'Het Spongebob Squarepants-lied',
        bpm: 126,
      },
    },
    {
      timestamp: 2124.7,
      type: 'horn',
      data: {
        counter: 35,
      },
    },
    {
      timestamp: 2128.0,
      type: 'song',
      data: {
        artist: 'Westlife',
        title: 'Uptown Girl',
        bpm: 132,
      },
    },
    {
      timestamp: 2179.0,
      type: 'song',
      data: {
        artist: 'Aqua',
        title: 'Barbie Girl',
        bpm: 132,
      },
    },
    {
      timestamp: 2193.9,
      type: 'horn',
      data: {
        counter: 36,
      },
    },
    {
      timestamp: 2225.0,
      type: 'song',
      data: {
        artist: 'Guillermo & Tropical Danny',
        title: 'Toppertje',
        bpm: 132,
      },
    },
    {
      timestamp: 2244.8,
      type: 'horn',
      data: {
        counter: 37,
      },
    },
    {
      timestamp: 2304.7,
      type: 'horn',
      data: {
        counter: 38,
      },
    },
    {
      timestamp: 2305.0,
      type: 'song',
      data: {
        artist: 'The Bloody Beetroots feat. Steve Aoki',
        title: 'Warp 1.9',
        bpm: 133,
      },
    },
    {
      timestamp: 2373.4,
      type: 'horn',
      data: {
        counter: 39,
      },
    },
    {
      timestamp: 2374.0,
      type: 'song',
      data: {
        artist: 'David Guetta & Showtek feat. Vassy',
        title: 'Bad',
        bpm: 133,
      },
    },
    {
      timestamp: 2427.5,
      type: 'bpm',
      data: { bpm: 1 },
    },
    {
      timestamp: 2431.1,
      type: 'horn',
      data: {
        counter: 40,
      },
    },
    {
      timestamp: 2431.5,
      type: 'song',
      data: {
        artist: 'Showtek & Justin Prime',
        title: 'Cannonball',
        bpm: 134,
      },
    },
    {
      timestamp: 2460.0,
      type: 'song',
      data: {
        artist: 'Die Atzen',
        title: 'Disco Pogo',
        bpm: 134,
      },
    },
    {
      timestamp: 2488.6,
      type: 'horn',
      data: {
        counter: 41,
      },
    },
    {
      timestamp: 2534.0,
      type: 'song',
      data: {
        artist: 'Lorenz Büffel',
        title: 'Johnny Däpp',
        bpm: 134,
      },
    },
    {
      timestamp: 2555.0,
      type: 'horn',
      data: {
        counter: 42,
      },
    },
    {
      timestamp: 2587.0,
      type: 'song',
      data: {
        artist: 'Zware Jongens',
        title: 'Jodeljump',
        bpm: 132,
      },
    },
    {
      timestamp: 2606.3,
      type: 'horn',
      data: {
        counter: 43,
      },
    },
    {
      timestamp: 2635.0,
      type: 'song',
      data: {
        artist: 'Parla & Pardoux',
        title: 'Liberté',
        bpm: 135,
      },
    },
    {
      timestamp: 2663.55,
      type: 'horn',
      data: {
        counter: 44,
      },
    },
    {
      timestamp: 2695.0,
      type: 'song',
      data: {
        artist: 'Markus Becker',
        title: 'Das rote Pferd',
        bpm: 137,
      },
    },
    {
      timestamp: 2729.1,
      type: 'horn',
      data: {
        counter: 45,
      },
    },
    {
      timestamp: 2743.0,
      type: 'song',
      data: {
        artist: 'Olaf Henning',
        title: 'Cowboy und Indianer',
        bpm: 137,
      },
    },
    {
      timestamp: 2783.3,
      type: 'horn',
      data: {
        counter: 46,
      },
    },
    {
      timestamp: 2785.0,
      type: 'song',
      data: {
        artist: 'Ch!pz',
        title: 'Cowboy',
        bpm: 138,
      },
    },
    {
      timestamp: 2824.0,
      type: 'song',
      data: {
        artist: 'Toy-Box',
        title: 'Tarzan & Jane',
        bpm: 138,
      },
    },
    {
      timestamp: 2849.5,
      type: 'horn',
      data: {
        counter: 47,
      },
    },
    {
      timestamp: 2879.0,
      type: 'song',
      data: {
        artist: 'Toy-Box',
        title: 'Sailor Song',
        bpm: 138,
      },
    },
    {
      timestamp: 2919.0,
      type: 'horn',
      data: {
        counter: 48,
      },
    },
    {
      timestamp: 2922.0,
      type: 'song',
      data: {
        artist: 'Vengaboys',
        title: 'Boom, Boom, Boom, Boom!!',
        bpm: 138,
      },
    },
    {
      timestamp: 2974.7,
      type: 'horn',
      data: {
        counter: 49,
      },
    },
    {
      timestamp: 2998.0,
      type: 'song',
      data: {
        artist: 'Vengaboys',
        title: 'To Brazil!',
        bpm: 134,
      },
    },
    {
      timestamp: 3038.9,
      type: 'horn',
      data: {
        counter: 50,
      },
    },
    {
      timestamp: 3070.0,
      type: 'song',
      data: {
        artist: 'Snollebollekes',
        title: 'Bam bam (bam)',
        bpm: 134,
      },
    },
    {
      timestamp: 3103.3,
      type: 'horn',
      data: {
        counter: 51,
      },
    },
    {
      timestamp: 3120.0,
      type: 'song',
      data: {
        artist: 'Def Rhymz',
        title: 'Schudden',
        bpm: 135,
      },
    },
    {
      timestamp: 3160.25,
      type: 'horn',
      data: {
        counter: 52,
      },
    },
    {
      timestamp: 3190.0,
      type: 'song',
      data: {
        artist: 'Cooldown Café',
        title: 'Hey baby',
        bpm: 137,
      },
    },
    {
      timestamp: 3214.7,
      type: 'horn',
      data: {
        counter: 53,
      },
    },
    {
      timestamp: 3232.0,
      type: 'song',
      data: {
        artist: 'Gebroeders Ko',
        title: 'Schatje, mag ik je foto',
        bpm: 137,
      },
    },
    {
      timestamp: 3278.6,
      type: 'horn',
      data: {
        counter: 54,
      },
    },
    {
      timestamp: 3279.0,
      type: 'song',
      data: {
        artist: 'Guus Meeuwis',
        title: 'Het is een nacht',
        bpm: 69,
      },
    },
    {
      timestamp: 3279.0,
      type: 'effect',
      data: {
        // Turn on only the disco ball; all other lights should be off.
        discoBall: true,
        effects: {
          pars: [],
          movingHeadRgbColor: [],
          movingHeadRgbMovement: [],
          movingHeadWheelColor: [],
          movingHeadWheelMovement: [],
        },
      },
    },
    {
      timestamp: 3318.5,
      type: 'effect',
      data: {
        random: true,
        effects: {},
      },
    },
    {
      timestamp: 3340.8,
      type: 'horn',
      data: {
        counter: 55,
      },
    },
    {
      timestamp: 3356.0,
      type: 'song',
      data: {
        artist: 'Tom Waes',
        title: 'Dos cervezas',
        bpm: 136,
      },
    },
    {
      timestamp: 3369.8,
      type: 'effect',
      data: {
        discoBall: false,
        effects: {},
      },
    },
    {
      timestamp: 3369.8,
      type: 'effect',
      data: {
        random: true,
        effects: {},
      },
    },
    {
      timestamp: 3398.15,
      type: 'horn',
      data: {
        counter: 56,
      },
    },
    {
      timestamp: 3412.0,
      type: 'song',
      data: {
        artist: 'Peter Wackel',
        title: 'Vollgas',
        bpm: 140,
      },
    },
    {
      timestamp: 3439.0,
      type: 'song',
      data: {
        artist: 'Peter Wackel',
        title: 'Scheiß drauf!',
        bpm: 140,
      },
    },
    {
      timestamp: 3465.05,
      type: 'horn',
      data: {
        counter: 57,
      },
    },
    {
      timestamp: 3467.0,
      type: 'song',
      data: {
        artist: 'Ikke Hüftgold',
        title: 'Dicke titten, kartoffelsalat',
        bpm: 140,
      },
    },
    {
      timestamp: 3519.9,
      type: 'horn',
      data: {
        counter: 58,
      },
    },
    {
      timestamp: 3521.0,
      type: 'song',
      data: {
        artist: 'Tim Toupet',
        title: 'Fliegerlied (So ein schöner Tag)',
        bpm: 140,
      },
    },
    {
      timestamp: 3564.0,
      type: 'song',
      data: {
        artist: 'Cooldown Café',
        title: "Met z'n allen",
        bpm: 120,
      },
    },
    {
      timestamp: 3576.5,
      type: 'horn',
      data: {
        counter: 59,
      },
    },
    {
      timestamp: 3643.0,
      type: 'horn',
      data: {
        counter: 60,
      },
    },
    {
      timestamp: 3643,
      type: 'bpm',
      data: {
        bpm: 135,
      },
    },
    {
      timestamp: 3659.0,
      type: 'song',
      data: {
        artist: 'The Partysquad feat. Jayh, Sjaak & Reverse',
        title: 'Helemaal naar de klote',
        bpm: 135,
      },
    },
    {
      timestamp: 3687.0,
      type: 'song',
      data: {
        artist: 'K-Liber',
        title: 'Viben',
        bpm: 135, // BPM increases after the horn
      },
    },
    {
      timestamp: 3699.4,
      type: 'horn',
      data: {
        counter: 61,
      },
    },
    {
      timestamp: 3700,
      type: 'bpm',
      data: {
        bpm: 144,
      },
    },
    {
      timestamp: 3753.0,
      type: 'horn',
      data: {
        counter: 62,
      },
    },
    {
      timestamp: 3755.0,
      type: 'song',
      data: {
        artist: 'FeestDJRuud & Dirtcaps feat. Sjaak & Kraantje Pappie',
        title: 'Weekend',
        bpm: 145,
      },
    },
    {
      timestamp: 3807.6,
      type: 'horn',
      data: {
        counter: 63,
      },
    },
    {
      timestamp: 3808.0,
      type: 'song',
      data: {
        artist: 'Lawineboys',
        title: 'Joost',
        bpm: 145,
      },
    },
    {
      timestamp: 3860.0,
      type: 'song',
      data: {
        artist: 'Gebroeders Ko',
        title: 'Ik heb een toeter op mijn waterscooter',
        bpm: 145,
      },
    },
    {
      timestamp: 3873.7,
      type: 'horn',
      data: {
        counter: 64,
      },
    },
    {
      timestamp: 3904.0,
      type: 'song',
      data: {
        artist: 'Gebroeders Ko',
        title: 'Tringeling',
        bpm: 145,
      },
    },
    {
      timestamp: 3931.5,
      type: 'horn',
      data: {
        counter: 65,
      },
    },
    {
      timestamp: 3975.0,
      type: 'song',
      data: {
        artist: 'Basshunter',
        title: 'Boten Anna',
        bpm: 145,
      },
    },
    {
      timestamp: 3987.6,
      type: 'horn',
      data: {
        counter: 66,
      },
    },
    {
      timestamp: 4029.0,
      type: 'song',
      data: {
        artist: 'Lawineboys',
        title: 'Wat zullen we drinken',
        bpm: 145,
      },
    },
    {
      timestamp: 4050.1,
      type: 'horn',
      data: {
        counter: 67,
      },
    },
    {
      timestamp: 4081.0,
      type: 'song',
      data: {
        artist: 'Lamme Frans',
        title: 'Wakker met een biertje!',
        bpm: 145,
      },
    },
    {
      timestamp: 4112.7,
      type: 'horn',
      data: {
        counter: 68,
      },
    },
    {
      timestamp: 4124.18,
      type: 'song',
      data: {
        artist: 'Lawineboys feat. DJ Jerome',
        title: 'Seks met die kale',
        bpm: 145,
      },
    },
    {
      timestamp: 4175.1,
      type: 'horn',
      data: {
        counter: 69,
      },
    },
    {
      timestamp: 4177.0,
      type: 'song',
      data: {
        artist: 'Zombie Nation',
        title: 'Kernkraft 400',
        bpm: 145,
      },
    },
    {
      timestamp: 4227.7,
      type: 'horn',
      data: {
        counter: 70,
      },
    },
    {
      timestamp: 4230.0,
      type: 'song',
      data: {
        artist: 'DJ Boozywoozy',
        title: 'Party Affair',
        bpm: 146,
      },
    },
    {
      timestamp: 4280.2,
      type: 'horn',
      data: {
        counter: 71,
      },
    },
    {
      timestamp: 4289.0,
      type: 'song',
      data: {
        artist: '2Unlimited',
        title: 'No Limit',
        bpm: 146,
      },
    },
    {
      timestamp: 4340.9,
      type: 'horn',
      data: {
        counter: 72,
      },
    },
    {
      timestamp: 4343.0,
      type: 'song',
      data: {
        artist: 'DJ Kicken vs. MC-Q',
        title: "Ain't No Party",
        bpm: 147,
      },
    },
    {
      timestamp: 4408.1,
      type: 'horn',
      data: {
        counter: 73,
      },
    },
    {
      timestamp: 4411.0,
      type: 'song',
      data: {
        artist: 'Jan Wayne',
        title: 'Because the Night',
        bpm: 147,
      },
    },
    {
      timestamp: 4455.0,
      type: 'song',
      data: {
        artist: 'Cascada',
        title: 'Everytime We Touch',
        bpm: 147,
      },
    },
    {
      timestamp: 4467.0,
      type: 'horn',
      data: {
        counter: 74,
      },
    },
    {
      timestamp: 4510.0,
      type: 'song',
      data: {
        artist: "Gigi D'Agostino",
        title: "L'amour toujours",
        bpm: 147,
      },
    },
    {
      timestamp: 4521.0,
      type: 'horn',
      data: {
        counter: 75,
      },
    },
    {
      timestamp: 4573.0,
      type: 'song',
      data: {
        artist: 'Jason Paige',
        title: "Gotta Catch 'M All",
        bpm: 147,
      },
    },
    {
      timestamp: 4573.002,
      type: 'effect',
      data: {
        effects: {
          pars: [StaticColor.build({ color: RgbColor.GOLD, dimTimeMs: 3000 })],
          movingHeadWheelColor: [],
          movingHeadWheelMovement: [],
        },
      },
    },
    {
      timestamp: 4578.1,
      type: 'horn',
      data: {
        counter: 76,
      },
    },
    {
      timestamp: 4579.0,
      type: 'effect',
      data: {
        random: true,
        effects: {
          pars: [],
          movingHeadWheelColor: [],
          movingHeadWheelMovement: [],
        },
      },
    },
    {
      timestamp: 4636.0,
      type: 'song',
      data: {
        artist: 'Scooter',
        title: 'How Much Is The Fish',
        bpm: 147,
      },
    },
    {
      timestamp: 4645.1,
      type: 'horn',
      data: {
        counter: 77,
      },
    },
    {
      timestamp: 4674.0,
      type: 'song',
      data: {
        artist: 'Scooter',
        title: 'Weekend',
        bpm: 147,
      },
    },
    {
      timestamp: 4700.5,
      type: 'horn',
      data: {
        counter: 78,
      },
    },
    {
      timestamp: 4714.0,
      type: 'song',
      data: {
        artist: 'Scooter',
        title: 'One (Always Hardcore)',
        bpm: 147,
      },
    },
    {
      timestamp: 4764.0,
      type: 'horn',
      data: {
        counter: 79,
      },
    },
    {
      timestamp: 4766.0,
      type: 'song',
      data: {
        artist: 'Scooter',
        title: 'Maria (I Like It Loud)',
        bpm: 147,
      },
    },
    {
      timestamp: 4818.0,
      type: 'song',
      data: {
        artist: 'Scooter',
        title: "J'adore Hardcore",
        bpm: 147,
      },
    },
    {
      timestamp: 4829.1,
      type: 'horn',
      data: {
        counter: 80,
      },
    },
    {
      timestamp: 4860.0,
      type: 'song',
      data: {
        artist: 'Wildstylez feat. Niels Geusebroek',
        title: 'Year of Summer',
        bpm: 148,
      },
    },
    {
      timestamp: 4887.7,
      type: 'horn',
      data: {
        counter: 81,
      },
    },
    {
      timestamp: 4929.0,
      type: 'song',
      data: {
        artist: 'Brennan Heart & Wildstylez',
        title: 'Lose My Mind',
        bpm: 148,
      },
    },
    {
      timestamp: 4952.6,
      type: 'horn',
      data: {
        counter: 82,
      },
    },
    {
      timestamp: 5004.5,
      type: 'horn',
      data: {
        counter: 83,
      },
    },
    {
      timestamp: 5006.0,
      type: 'song',
      data: {
        artist: 'Starkoo',
        title: 'Ik wil je',
        bpm: 149,
      },
    },
    {
      timestamp: 5059.0,
      type: 'song',
      data: {
        artist: 'Feestteam',
        title: 'Let It Be / Hey Jude (mix)',
        bpm: 150 / 2,
      },
    },
    {
      timestamp: 5070.6,
      type: 'horn',
      data: {
        counter: 84,
      },
    },
    {
      timestamp: 5097.7,
      type: 'bpm',
      data: { bpm: 150 },
    },
    {
      timestamp: 5124.6,
      type: 'horn',
      data: {
        counter: 85,
      },
    },
    {
      timestamp: 5179.0,
      type: 'song',
      data: {
        artist: 'DJ Nikolai & DJ Mike van Dijk',
        title: 'Piano Man',
        bpm: 150,
      },
    },
    {
      timestamp: 5187.8,
      type: 'horn',
      data: {
        counter: 86,
      },
    },
    {
      timestamp: 5237.0,
      type: 'song',
      data: {
        artist: 'Robbie Williams',
        title: 'Angels',
        bpm: 75,
      },
    },
    {
      timestamp: 5237.01,
      type: 'effect',
      data: {
        // Turn on only the disco ball; all other lights should be off.
        discoBall: true,
        effects: {
          pars: [],
          movingHeadRgbColor: [],
          movingHeadRgbMovement: [],
          movingHeadWheelColor: [],
          movingHeadWheelMovement: [],
        },
      },
    },
    {
      timestamp: 5242.8,
      type: 'horn',
      data: {
        counter: 87,
      },
    },
    {
      timestamp: 5278.0,
      type: 'song',
      data: {
        artist: 'Enrique Iglesias',
        title: 'Hero',
        bpm: 76,
      },
    },
    {
      timestamp: 5278.01,
      type: 'effect',
      data: {
        // Keep the disco ball turned on; all other lights should be off.
        discoBall: true,
        effects: {
          pars: [],
          movingHeadRgbColor: [],
          movingHeadRgbMovement: [],
          movingHeadWheelColor: [],
          movingHeadWheelMovement: [],
        },
      },
    },
    {
      timestamp: 5307.7,
      type: 'horn',
      data: {
        counter: 88,
      },
    },
    {
      timestamp: 5331.0,
      type: 'song',
      data: {
        artist: 'Whitney Houston',
        title: 'I Will Always Love You',
        bpm: 76,
      },
    },
    {
      timestamp: 5331.01,
      type: 'effect',
      data: {
        // Keep the disco ball turned on; all other lights should be off.
        discoBall: true,
        effects: {
          pars: [],
          movingHeadRgbColor: [],
          movingHeadRgbMovement: [],
          movingHeadWheelColor: [],
          movingHeadWheelMovement: [],
        },
      },
    },
    {
      timestamp: 5373.85,
      type: 'horn',
      data: {
        counter: 89,
      },
    },
    {
      timestamp: 5373.85,
      type: 'effect',
      data: {
        discoBall: false,
        effects: {},
      },
    },
    {
      timestamp: 5373.9,
      type: 'song',
      data: {
        artist: 'Mariah Carey',
        title: 'All I Want For Christmas',
        bpm: 151,
      },
    },
    {
      timestamp: 5380.0,
      type: 'effect',
      data: {
        random: true,
        effects: {},
      },
    },
    {
      timestamp: 5431.3,
      type: 'horn',
      data: {
        counter: 90,
      },
    },
    {
      timestamp: 5444.0,
      type: 'song',
      data: {
        artist: 'Kraantje Pappie',
        title: 'Feesttent (FeestDJRuud remix)',
        bpm: 170,
      },
    },
    {
      timestamp: 5487.9,
      type: 'horn',
      data: {
        counter: 91,
      },
    },
    {
      timestamp: 5490.25,
      type: 'song',
      data: {
        artist: 'New Kids feat. DJ Paul Elstak',
        title: 'Turbo',
        bpm: 170,
      },
    },
    {
      timestamp: 5555.65,
      type: 'horn',
      data: {
        counter: 92,
      },
    },
    {
      timestamp: 5558.0,
      type: 'song',
      data: {
        artist: 'Lipstick',
        title: "I'm a Raver",
        bpm: 170,
      },
    },
    {
      timestamp: 5591.0,
      type: 'song',
      data: {
        artist: 'Nakatomi',
        title: 'Children of the Night',
        bpm: 170,
      },
    },
    {
      timestamp: 5612.1,
      type: 'horn',
      data: {
        counter: 93,
      },
    },
    {
      timestamp: 5614.0,
      type: 'song',
      data: {
        artist: 'Charly Lownoise & Mental Theo',
        title: 'Wonderful Days',
        bpm: 170,
      },
    },
    {
      timestamp: 5659.0,
      type: 'song',
      data: {
        artist: 'DJ Paul Elstak',
        title: 'Luv You More',
        bpm: 170,
      },
    },
    {
      timestamp: 5667.2,
      type: 'horn',
      data: {
        counter: 94,
      },
    },
    {
      timestamp: 5704.0,
      type: 'song',
      data: {
        artist: 'DJ Paul Elstak',
        title: 'Rainbow In The Sky',
        bpm: 170,
      },
    },
    {
      timestamp: 5730.7,
      type: 'horn',
      data: {
        counter: 95,
      },
    },
    {
      timestamp: 5733.0,
      type: 'song',
      data: {
        artist: 'Evil Activities',
        title: 'Nobody Said It Was Easy',
        bpm: 170 / 2,
      },
    },
    {
      timestamp: 5782.9,
      type: 'horn',
      data: {
        counter: 96,
      },
    },
    {
      timestamp: 5782.9,
      type: 'bpm',
      data: { bpm: 170 },
    },
    {
      timestamp: 5827.0,
      type: 'song',
      data: {
        artist: 'Melrose',
        title: 'O',
        bpm: 188,
      },
    },
    {
      timestamp: 5845.7,
      type: 'horn',
      data: {
        counter: 97,
      },
    },
    {
      timestamp: 5846,
      type: 'bpm',
      data: {
        bpm: 1,
      },
    },
    {
      timestamp: 5855.0,
      type: 'song',
      data: {
        artist: 'Backstreet Boys',
        title: 'I Want It That Way',
        bpm: 100,
      },
    },
    {
      timestamp: 5901.9,
      type: 'horn',
      data: {
        counter: 98,
      },
    },
    {
      timestamp: 5933.0,
      type: 'song',
      data: {
        artist: 'R. Kelly',
        title: "The World's Greatest",
        bpm: 100,
      },
    },
    {
      timestamp: 5969.8,
      type: 'horn',
      data: {
        counter: 99,
      },
    },
    {
      timestamp: 5970.0,
      type: 'song',
      data: {
        artist: 'Céline Dion',
        title: 'My Heart Will Go On',
        bpm: 50,
      },
    },
    {
      timestamp: 5970.0,
      type: 'effect',
      data: {
        discoBall: true,
        effects: {
          // Keep the disco ball turned on; all other lights should be off.
          pars: [],
          movingHeadRgbColor: [],
          movingHeadRgbMovement: [],
          movingHeadWheelColor: [],
          movingHeadWheelMovement: [],
        },
      },
    },
    {
      timestamp: 6020.3,
      type: 'horn',
      data: {
        counter: 100,
        strobeTime: 2000,
      },
    },
    {
      timestamp: 6021,
      type: 'effect',
      data: {
        discoBall: false,
        effects: {
          pars: [Fire.build()],
          movingHeadWheelColor: [StaticColor.build({ color: RgbColor.BLINDINGWHITE })],
          movingHeadWheelMovement: [SearchLight.build({ cycleTime: 20000, radiusFactor: 1.5 })],
        },
      },
    },
  ],
};

export default centurion;
