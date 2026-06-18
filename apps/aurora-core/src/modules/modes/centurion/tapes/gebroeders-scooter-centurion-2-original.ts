import MixTape, { FeedEvent } from './mix-tape';
import SearchLight from '../../../lights/effects/movement/search-light';
import { StaticColor, Wave } from '../../../lights/effects/color';
import { RgbColor } from '../../../lights/color-definitions';

const centurion2Original: MixTape = {
  name: 'Centurion 2.0',
  artist: 'Gebroeders Scooter',
  songFile: 'https://avico.gewis.nl/centurion/gebroeders-scooter-centurion-2.mp3',
  coverUrl: 'https://i1.sndcdn.com/artworks-NnmwEpeM7d9X8Ptc-50Ev5w-t500x500.jpg',
  duration: 6165,
  feed: [
    {
      timestamp: 1,
      type: 'bpm',
      data: { bpm: 130 },
    },
    {
      timestamp: 1,
      type: 'effect',
      data: {
        effects: {
          pars: [StaticColor.build({ color: RgbColor.RED, beatToggle: true })],
          movingHeadWheelColor: [StaticColor.build({ color: RgbColor.BLINDINGWHITE })],
          movingHeadWheelMovement: [SearchLight.build()],
        },
      },
    },
    {
      timestamp: 81.5,
      type: 'effect',
      data: {
        effects: {
          pars: [
            StaticColor.build({
              color: RgbColor.RED,
              beatToggle: true,
              dimTimeMs: (89.1 - 81.5) * 1000,
            }),
          ],
          movingHeadWheelColor: [
            StaticColor.build({ color: RgbColor.BLINDINGWHITE, dimTimeMs: (89.1 - 81.5) * 1000 }),
          ],
          movingHeadWheelMovement: [SearchLight.build()],
        },
      },
    },
    {
      timestamp: 90,
      type: 'effect',
      data: {
        effects: {},
        reset: true,
      },
    },
    // Waves for the countdown from 10 to 1
    ...new Array(10)
      .fill(103.2)
      .map((baseTimestamp: number, i) => baseTimestamp + i * 1.95)
      .map(
        (timestamp): FeedEvent => ({
          timestamp: timestamp,
          type: 'effect',
          data: {
            effects: {
              pars: [Wave.build({ colors: [RgbColor.GOLD], singleWave: true, cycleTime: 1000 })],
            },
          },
        }),
      ),
    {
      timestamp: 123.8,
      type: 'horn',
      data: {
        counter: 1,
      },
    },
    {
      timestamp: 123.9,
      type: 'song',
      data: {
        artist: 'Lou bega',
        title: 'Mambo no. 5',
        bpm: 90,
      },
    },
    {
      timestamp: 188.5,
      type: 'horn',
      data: {
        counter: 2,
      },
    },
    {
      timestamp: 188.6,
      type: 'song',
      data: {
        artist: 'Monique Smit',
        title: 'Wild',
        bpm: 95,
      },
    },
    {
      timestamp: 257.7,
      type: 'horn',
      data: {
        counter: 3,
      },
    },
    {
      timestamp: 259.0,
      type: 'song',
      data: {
        artist: 'Britney Spears',
        title: '...Baby One More Time',
        bpm: 98,
      },
    },
    {
      timestamp: 309.0,
      type: 'horn',
      data: {
        counter: 4,
      },
    },
    {
      timestamp: 309.5,
      type: 'song',
      data: {
        artist: 'Nielson',
        title: 'Sexy Als Ik Dans',
        bpm: 98,
      },
    },
    {
      timestamp: 361.3,
      type: 'song',
      data: {
        artist: 'Luis Fonsi feat. Daddy Yankee',
        title: 'Despacito',
        bpm: 98,
      },
    },
    {
      timestamp: 370.0,
      type: 'horn',
      data: {
        counter: 5,
      },
    },
    {
      timestamp: 421.0,
      type: 'song',
      data: {
        artist: 'K3',
        title: 'Heyah Mama',
        bpm: 98,
      },
    },
    {
      timestamp: 429.6,
      type: 'horn',
      data: {
        counter: 6,
      },
    },
    {
      timestamp: 490.3,
      type: 'horn',
      data: {
        counter: 7,
      },
    },
    {
      timestamp: 490.4,
      type: 'song',
      data: {
        artist: 'Jan Smit',
        title: 'Als De Morgen Is Gekomen',
        bpm: 98,
      },
    },
    {
      timestamp: 549.9,
      type: 'horn',
      data: {
        counter: 8,
      },
    },
    {
      timestamp: 550.0,
      type: 'song',
      data: [
        {
          artist: 'The Blues Brothers',
          title: 'Everybody Needs Somebody to Love',
          bpm: 99,
        },
        {
          artist: 'Beyoncé',
          title: 'Single Ladies',
          bpm: 99,
        },
      ],
    },
    {
      timestamp: 598.5,
      type: 'song',
      data: {
        artist: 'Dio feat. Sef',
        title: 'Tijdmachine',
        bpm: 101,
      },
    },
    {
      timestamp: 615.7,
      type: 'horn',
      data: {
        counter: 9,
      },
    },
    {
      timestamp: 637.5,
      type: 'song',
      data: {
        artist: 'Alphabeat',
        title: 'Fascination',
        bpm: 100,
      },
    },
    {
      timestamp: 674.0,
      type: 'horn',
      data: {
        counter: 10,
      },
    },
    {
      timestamp: 693.0,
      type: 'song',
      data: {
        artist: 'De Jeugd Van Tegenwoordig',
        title: 'Sterrenstof',
        bpm: 100,
      },
    },
    {
      timestamp: 731.4,
      type: 'horn',
      data: {
        counter: 11,
      },
    },
    {
      timestamp: 779.4,
      type: 'song',
      data: {
        artist: 'Kid Rock',
        title: 'All Summer Long',
        bpm: 105,
      },
    },
    {
      timestamp: 787.4,
      type: 'horn',
      data: {
        counter: 12,
      },
    },
    {
      timestamp: 807.5,
      type: 'song',
      data: {
        artist: 'Lynyrd Skynyrd',
        title: 'Sweet Home Alabama',
        bpm: 105,
      },
    },
    {
      timestamp: 825,
      type: 'song',
      data: {
        artist: 'Kid Rock',
        title: 'All Summer Long',
        bpm: 105,
      },
    },
    {
      timestamp: 844.5,
      type: 'song',
      data: {
        artist: 'T-Spoon',
        title: 'Sex on the Beach',
        bpm: 105,
      },
    },
    {
      timestamp: 853.7,
      type: 'horn',
      data: {
        counter: 13,
      },
    },
    {
      timestamp: 900.0,
      type: 'song',
      data: {
        artist: 'Ultimate Kaos',
        title: 'Casanova',
        bpm: 105,
      },
    },
    {
      timestamp: 922.0,
      type: 'horn',
      data: {
        counter: 14,
      },
    },
    {
      timestamp: 951.0,
      type: 'song',
      data: {
        artist: 'DJ Ötzi feat. Hermes House Band',
        title: 'Live is Life',
        bpm: 105,
      },
    },
    {
      timestamp: 976.3,
      type: 'horn',
      data: {
        counter: 15,
      },
    },
    {
      timestamp: 1001.5,
      type: 'song',
      data: {
        artist: 'Nick & Simon',
        title: 'Rosanne',
        bpm: 105,
      },
    },
    {
      timestamp: 1038.2,
      type: 'horn',
      data: {
        counter: 16,
      },
    },
    {
      timestamp: 1040.5,
      type: 'song',
      data: {
        artist: 'Vengaboys',
        title: "We're Going To Ibiza!",
        bpm: 105,
      },
    },
    {
      timestamp: 1068.0,
      type: 'song',
      data: {
        artist: 'K3',
        title: '10.000 Luchtballonnen',
        bpm: 105,
      },
    },
    {
      timestamp: 1093.2,
      type: 'horn',
      data: {
        counter: 17,
      },
    },
    {
      timestamp: 1123.0,
      type: 'song',
      data: {
        artist: 'Bizzey feat. Jozo & Kraantje Pappie',
        title: 'Traag',
        bpm: 107,
      },
    },
    {
      timestamp: 1157.2,
      type: 'horn',
      data: {
        counter: 18,
      },
    },
    {
      timestamp: 1159.5,
      type: 'song',
      data: {
        artist: 'Natasha Bedingfield',
        title: 'Unwritten',
        bpm: 107,
      },
    },
    {
      timestamp: 1198.5,
      type: 'song',
      data: {
        artist: 'Bcaizm',
        title: 'Give Me Trumpets',
        bpm: 107,
      },
    },
    {
      timestamp: 1214.0,
      type: 'horn',
      data: {
        counter: 19,
      },
    },
    {
      timestamp: 1268.3,
      type: 'horn',
      data: {
        counter: 20,
      },
    },
    {
      timestamp: 1268.4,
      type: 'song',
      data: {
        artist: 'Backstreet Boys',
        title: "Everybody (Backstreet's Back)",
        bpm: 107,
      },
    },
    {
      timestamp: 1313.8,
      type: 'song',
      data: {
        artist: 'Survivor',
        title: 'Eye of the Tiger',
        bpm: 108,
      },
    },
    {
      timestamp: 1329.2,
      type: 'horn',
      data: {
        counter: 21,
      },
    },
    {
      timestamp: 1367.0,
      type: 'song',
      data: {
        artist: 'Hanson',
        title: 'Mmmbop',
        bpm: 110,
      },
    },
    {
      timestamp: 1391.4,
      type: 'horn',
      data: {
        counter: 22,
      },
    },
    {
      timestamp: 1394.0,
      type: 'song',
      data: {
        artist: 'Katrina & The Waves',
        title: 'Walking On Sunshine',
        bpm: 113,
      },
    },
    {
      timestamp: 1424.0,
      type: 'song',
      data: {
        artist: 'Frans Bauer',
        title: 'Heb Je Even Voor Mij?',
        bpm: 119,
      },
    },
    {
      timestamp: 1454.6,
      type: 'horn',
      data: {
        counter: 23,
      },
    },
    {
      timestamp: 1494.0,
      type: 'song',
      data: {
        artist: 'Monique Smit',
        title: 'Blijf Je Vanavond',
        bpm: 122,
      },
    },
    {
      timestamp: 1514.8,
      type: 'horn',
      data: {
        counter: 24,
      },
    },
    {
      timestamp: 1570.4,
      type: 'horn',
      data: {
        counter: 25,
      },
    },
    {
      timestamp: 1571.5,
      type: 'song',
      data: {
        artist: 'John De Bever',
        title: 'Jij Krijgt Die Lach Niet Van Mijn Gezicht',
        bpm: 122,
      },
    },
    {
      timestamp: 1607.0,
      type: 'song',
      data: {
        artist: 'Bloem',
        title: 'Even Aan Mijn Moeder Vragen',
        bpm: 122,
      },
    },
    {
      timestamp: 1631.0,
      type: 'horn',
      data: {
        counter: 26,
      },
    },
    {
      timestamp: 1632.0,
      type: 'song',
      data: {
        artist: 'Whitney Houston',
        title: 'I Wanna Dance with Somebody (Who Loves Me)',
        bpm: 122,
      },
    },
    {
      timestamp: 1688.3,
      type: 'horn',
      data: {
        counter: 27,
      },
    },
    {
      timestamp: 1704.3,
      type: 'song',
      data: {
        artist: 'Christina Aguilera',
        title: 'Car Wash (Shark Tale Mix)',
        bpm: 124,
      },
    },
    {
      timestamp: 1751.3,
      type: 'horn',
      data: {
        counter: 28,
      },
    },
    {
      timestamp: 1752.0,
      type: 'song',
      data: [
        {
          artist: 'Kool & The Gang',
          title: 'Celebration',
          bpm: 124,
        },
        {
          artist: 'Randy Marsh',
          title: 'Celebrate Good Obama',
          bpm: 124,
        },
      ],
    },
    {
      timestamp: 1752.01,
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
      timestamp: 1815.7,
      type: 'horn',
      data: {
        counter: 29,
      },
    },
    {
      timestamp: 1816.0,
      type: 'song',
      data: {
        artist: 'Pitbull feat. John Ryan',
        title: 'Fireball',
        bpm: 124,
      },
    },
    {
      timestamp: 1816.01,
      type: 'effect',
      data: {
        // Override the random change of effects when song changes to
        // keep on the disco ball turned on
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
      timestamp: 1839.4,
      type: 'effect',
      data: {
        discoBall: false,
        effects: {},
      },
    },
    {
      timestamp: 1841.07,
      type: 'effect',
      data: {
        random: true,
        effects: {},
      },
    },
    {
      timestamp: 1870.3,
      type: 'horn',
      data: {
        counter: 30,
      },
    },
    {
      timestamp: 1903.4,
      type: 'song',
      data: [
        {
          artist: "Kungs & Cookin' On 3 Burners",
          title: 'This Girl',
          bpm: 124,
        },
        {
          artist: 'Bon Jovi',
          title: "Livin' On A Prayer",
          bpm: 124,
        },
      ],
    },
    {
      timestamp: 1926.5,
      type: 'horn',
      data: {
        counter: 31,
      },
    },
    {
      timestamp: 1969.0,
      type: 'song',
      data: {
        artist: 'Carly Rae Jepsen',
        title: 'Call Me Maybe',
        bpm: 124,
      },
    },
    {
      timestamp: 1992.1,
      type: 'horn',
      data: {
        counter: 32,
      },
    },
    {
      timestamp: 2023.0,
      type: 'song',
      data: {
        artist: 'DJ Antoine feat. Timati & Kalenna',
        title: 'Welcome to St. Tropez',
        bpm: 124,
      },
    },
    {
      timestamp: 2053.7,
      type: 'horn',
      data: {
        counter: 33,
      },
    },
    {
      timestamp: 2072.8,
      type: 'song',
      data: [
        {
          artist: 'Jamai',
          title: 'Step Right Up',
          bpm: 128,
        },
        {
          artist: 'Kav Verhouzer feat. Sjaak',
          title: 'Stap Voor Stap',
          bpm: 128,
        },
      ],
    },
    {
      timestamp: 2112.8,
      type: 'horn',
      data: {
        counter: 34,
      },
    },
    {
      timestamp: 2129.8,
      type: 'song',
      data: {
        artist: 'Kav Verhouzer feat. Sjaak',
        title: 'Stap Voor Stap',
        bpm: 128,
      },
    },
    {
      timestamp: 2160.0,
      type: 'song',
      data: {
        artist: 'Beyoncé',
        title: 'Run the World (Girls)',
        bpm: 130,
      },
    },
    {
      timestamp: 2172.9,
      type: 'horn',
      data: {
        counter: 35,
      },
    },
    {
      timestamp: 2197.3,
      type: 'song',
      data: {
        artist: 'Europe',
        title: 'The Final Countdown',
        bpm: 129,
      },
    },
    {
      timestamp: 2238.4,
      type: 'horn',
      data: {
        counter: 36,
      },
    },
    {
      timestamp: 2264.5,
      type: 'song',
      data: {
        artist: 'Hermes House Band',
        title: 'I Will Survive',
        bpm: 130,
      },
    },
    {
      timestamp: 2288.6,
      type: 'horn',
      data: {
        counter: 37,
      },
    },
    {
      timestamp: 2347.5,
      type: 'horn',
      data: {
        counter: 38,
      },
    },
    {
      timestamp: 2364.5,
      type: 'song',
      data: {
        artist: 'Marianne Rosenberg',
        title: 'Ich bin wie du',
        bpm: 130,
      },
    },
    {
      timestamp: 2391.0,
      type: 'song',
      data: {
        artist: 'Marco Borsato',
        title: 'Dromen Zijn Bedrog',
        bpm: 132,
      },
    },
    {
      timestamp: 2417.3,
      type: 'horn',
      data: {
        counter: 39,
      },
    },
    {
      timestamp: 2450.0,
      type: 'song',
      data: {
        artist: 'Anton feat. DJ Ötzi',
        title: 'Anton aus Tirol',
        bpm: 134,
      },
    },
    {
      timestamp: 2473.7,
      type: 'horn',
      data: {
        counter: 40,
      },
    },
    {
      timestamp: 2489.7,
      type: 'song',
      data: {
        artist: 'Tim Toupet feat. Die Filue',
        title: 'Tote Enten',
        bpm: 134,
      },
    },
    {
      timestamp: 2518.7,
      type: 'song',
      data: {
        artist: 'DJ Ötzi',
        title: 'Sweet Caroline',
        bpm: 130,
      },
    },
    {
      timestamp: 2537.3,
      type: 'horn',
      data: {
        counter: 41,
      },
    },
    {
      timestamp: 2559.4,
      type: 'song',
      data: {
        artist: 'Flo Rida feat. Kesha',
        title: 'Right Round',
        bpm: 130,
      },
    },
    {
      timestamp: 2589.4,
      type: 'horn',
      data: {
        counter: 42,
      },
    },
    {
      timestamp: 2590.0,
      type: 'song',
      data: {
        artist: 'AronChupa feat. Little Sis Nora',
        title: "I'm an Albatraoz",
        bpm: 130,
      },
    },
    {
      timestamp: 2641.5,
      type: 'song',
      data: {
        artist: 'K3',
        title: 'Leonardo',
        bpm: 130,
      },
    },
    {
      timestamp: 2647.0,
      type: 'horn',
      data: {
        counter: 43,
      },
    },
    {
      timestamp: 2685.9,
      type: 'song',
      data: {
        artist: 'Martin Solveig feat. Dragonette',
        title: 'Hello',
        bpm: 130,
      },
    },
    {
      timestamp: 2715.6,
      type: 'horn',
      data: {
        counter: 44,
      },
    },
    {
      timestamp: 2745.0,
      type: 'song',
      data: {
        artist: 'Black Eyed Peas',
        title: 'I Gotta Feeling',
        bpm: 130,
      },
    },
    {
      timestamp: 2773.0,
      type: 'horn',
      data: {
        counter: 45,
      },
    },
    {
      timestamp: 2819.5,
      type: 'song',
      data: {
        artist: 'Sean Paul',
        title: 'Temperature',
        bpm: 130,
      },
    },
    {
      timestamp: 2832.1,
      type: 'horn',
      data: {
        counter: 46,
      },
    },
    {
      timestamp: 2878.5,
      type: 'song',
      data: {
        artist: 'Avicii feat. Sebastien Drums',
        title: 'My Feelings For You',
        bpm: 130,
      },
    },
    {
      timestamp: 2891.3,
      type: 'horn',
      data: {
        counter: 47,
      },
    },
    {
      timestamp: 2908.0,
      type: 'song',
      data: {
        artist: 'Otto Knows',
        title: 'Million Voices',
        bpm: 130,
      },
    },
    {
      timestamp: 2950.7,
      type: 'horn',
      data: {
        counter: 48,
      },
    },
    {
      timestamp: 2951.0,
      type: 'song',
      data: {
        artist: 'Chris Brown',
        title: 'Yeah 3x',
        bpm: 130,
      },
    },
    {
      timestamp: 2996.8,
      type: 'song',
      data: {
        artist: 'LMFAO',
        title: 'Sexy And I Know It',
        bpm: 130,
      },
    },
    {
      timestamp: 3011.6,
      type: 'horn',
      data: {
        counter: 49,
      },
    },
    {
      timestamp: 3055.9,
      type: 'song',
      data: {
        artist: 'Fatboy Slim feat. Beardyman',
        title: 'Eat Sleep Rave Repeat (Calvin Harris Edit)',
        bpm: 131,
      },
    },
    {
      timestamp: 3068.7,
      type: 'horn',
      data: {
        counter: 50,
      },
    },
    {
      timestamp: 3086.0,
      type: 'song',
      data: {
        artist: 'The Chainsmokers',
        title: '#SELFIE',
        bpm: 131,
      },
    },
    {
      timestamp: 3129.8,
      type: 'horn',
      data: {
        counter: 51,
      },
    },
    {
      timestamp: 3144.4,
      type: 'song',
      data: {
        artist: 'Martin Garrix',
        title: 'Animals',
        bpm: 131,
      },
    },
    {
      timestamp: 3186.8,
      type: 'horn',
      data: {
        counter: 52,
      },
    },
    {
      timestamp: 3189.0,
      type: 'song',
      data: {
        artist: 'Eiffel 65 feat. Gabry Ponte',
        title: 'Blue (Da Ba Dee)',
        bpm: 131,
      },
    },
    {
      timestamp: 3218.2,
      type: 'song',
      data: {
        artist: 'FISHER',
        title: 'Losing it',
        bpm: 131,
      },
    },
    {
      timestamp: 3246.2,
      type: 'horn',
      data: {
        counter: 53,
      },
    },
    {
      timestamp: 3262.6,
      type: 'song',
      data: {
        artist: 'Baha Men',
        title: 'Who Let The Dogs Out',
        bpm: 131,
      },
    },
    {
      timestamp: 3316.0,
      type: 'horn',
      data: {
        counter: 54,
      },
    },
    {
      timestamp: 3317.0,
      type: 'song',
      data: {
        artist: 'Snollebollekes',
        title: 'Snollebolleke',
        bpm: 131,
      },
    },
    {
      timestamp: 3349.4,
      type: 'song',
      data: {
        artist: 'Miranda',
        title: 'Vamos a la Playa',
        bpm: 131,
      },
    },
    {
      timestamp: 3364.3,
      type: 'song',
      data: [
        {
          artist: 'Britt',
          title: 'F*cking Vet!!!',
          bpm: 131,
        },
        {
          artist: 'Sak Noel',
          title: 'Loca People',
          bpm: 131,
        },
      ],
    },
    {
      timestamp: 3369.7,
      type: 'horn',
      data: {
        counter: 55,
      },
    },
    {
      timestamp: 3414.5,
      type: 'song',
      data: {
        artist: 'Deorro feat. Pitbull & Elvis Crespo',
        title: 'Bailar',
        bpm: 131,
      },
    },
    {
      timestamp: 3423.2,
      type: 'horn',
      data: {
        counter: 56,
      },
    },
    {
      timestamp: 3452.8,
      type: 'song',
      data: {
        artist: 'O-Zone',
        title: 'Dragostea din tei',
        bpm: 131,
      },
    },
    {
      timestamp: 3482.2,
      type: 'horn',
      data: {
        counter: 57,
      },
    },
    {
      timestamp: 3497.1,
      type: 'song',
      data: {
        artist: 'Rene Karst feat. Stef Ekkel',
        title: 'Liever Te Dik In De Kist',
        bpm: 131,
      },
    },
    {
      timestamp: 3542.2,
      type: 'horn',
      data: {
        counter: 58,
      },
    },
    {
      timestamp: 3543,
      type: 'song',
      data: {
        artist: 'SRV Mannen',
        title: 'Bier En... (De Essentie Van Karnaval)',
        bpm: 131,
      },
    },
    {
      timestamp: 3572.0,
      type: 'song',
      data: {
        artist: '',
        title: 'Ein Prosit der Gemütlichkeit',
        bpm: 131,
      },
    },
    {
      timestamp: 3586.7,
      type: 'song',
      data: [
        {
          artist: 'will.i.am, Britney Spears',
          title: 'Scream & Shout',
          bpm: 132,
        },
        {
          artist: 'Helene Fischer',
          title: 'Atemlos durch die Nacht',
          bpm: 132,
        },
      ],
    },
    {
      timestamp: 3621.1,
      type: 'horn',
      data: {
        counter: 59,
      },
    },
    {
      timestamp: 3665.0,
      type: 'horn',
      data: {
        counter: 60,
      },
    },
    {
      timestamp: 3670.5,
      type: 'song',
      data: {
        artist: 'Marco Mzee',
        title: 'Der DJ aus den Bergen',
        bpm: 135,
      },
    },
    {
      timestamp: 3699.3,
      type: 'song',
      data: {
        artist: 'Tobee',
        title: "Helikopter 177 (Mach' den Hub Hub Hub)",
        bpm: 135,
      },
    },
    {
      timestamp: 3722.8,
      type: 'horn',
      data: {
        counter: 61,
      },
    },
    {
      timestamp: 3737.2,
      type: 'song',
      data: {
        artist: 'Pitbull feat. Kesha',
        title: 'Timber',
        bpm: 131,
      },
    },
    {
      timestamp: 3793.9,
      type: 'horn',
      data: {
        counter: 62,
      },
    },
    {
      timestamp: 3794.0,
      type: 'song',
      data: {
        artist: 'Avicii',
        title: 'Wake Me Up',
        bpm: 131,
      },
    },
    {
      timestamp: 3839.7,
      type: 'song',
      data: {
        artist: 'Axwell /\\ Ingrosso',
        title: 'Sun Is Shining',
        bpm: 131,
      },
    },
    {
      timestamp: 3854.6,
      type: 'horn',
      data: {
        counter: 63,
      },
    },
    {
      timestamp: 3884.0,
      type: 'song',
      data: {
        artist: 'DVBBS feat. Borgeous',
        title: 'Tsunami',
        bpm: 131,
      },
    },
    {
      timestamp: 3915.2,
      type: 'horn',
      data: {
        counter: 64,
      },
    },
    {
      timestamp: 3944.5,
      type: 'song',
      data: [
        {
          artist: 'Benny Benassi feat. The Biz',
          title: 'Satisfaction',
          bpm: 133,
        },
        {
          artist: 'De Jeugd Van Tegenwoordig',
          title: 'Watskeburt?!',
          bpm: 133,
        },
      ],
    },
    {
      timestamp: 3973.7,
      type: 'horn',
      data: {
        counter: 65,
      },
    },
    {
      timestamp: 4002.3,
      type: 'song',
      data: {
        artist: 'Darude',
        title: 'Sandstorm',
        bpm: 133,
      },
    },
    {
      timestamp: 4029.9,
      type: 'horn',
      data: {
        counter: 66,
      },
    },
    {
      timestamp: 4032.0,
      type: 'song',
      data: {
        artist: 'A*Teens',
        title: 'Mamma Mia',
        bpm: 133,
      },
    },
    // Er is hier geen toeter?
    // Dus maar 9 toeters tussen minuut 60 en 70 :(
    {
      timestamp: 4100.0,
      type: 'song',
      data: {
        artist: 'Earth, Wind & Fire',
        title: "September '99 (Phats & Small Remix)",
        bpm: 134,
      },
    },
    {
      timestamp: 4100.1,
      type: 'effect',
      data: {
        // Turn on the disco ball; leave other effects intact.
        discoBall: true,
        effects: {},
      },
    },
    {
      timestamp: 4155.7,
      type: 'horn',
      data: {
        counter: 67,
      },
    },
    {
      timestamp: 4156.0,
      type: 'song',
      data: {
        artist: 'Patrick Hernandez',
        title: 'Born to be alive',
        bpm: 135,
      },
    },
    {
      timestamp: 4178.7,
      type: 'song',
      data: {
        artist: 'Jody Bernal',
        title: 'Que Si, Que No',
        bpm: 135,
      },
    },
    {
      timestamp: 4178.7,
      type: 'effect',
      data: {
        // Turn off only the disco ball
        discoBall: false,
        effects: {},
      },
    },
    {
      timestamp: 4208.9,
      type: 'horn',
      data: {
        counter: 68,
      },
    },
    {
      timestamp: 4235.5,
      type: 'song',
      data: {
        artist: 'Jennifer Lopez',
        title: "Let's Get Loud",
        bpm: 135,
      },
    },
    {
      timestamp: 4263.6,
      type: 'horn',
      data: {
        counter: 69,
      },
    },
    {
      timestamp: 4264.0,
      type: 'song',
      data: {
        artist: 'Kinderen voor Kinderen',
        title: 'Hallo Wereld',
        bpm: 137,
      },
    },
    {
      timestamp: 4294.1,
      type: 'song',
      data: {
        artist: 'Snollebollekes feat. Gerard Joling',
        title: 'Total Loss',
        bpm: 137,
      },
    },
    {
      timestamp: 4321.7,
      type: 'horn',
      data: {
        counter: 70,
      },
    },
    {
      timestamp: 4335.0,
      type: 'song',
      data: {
        artist: 'DJ Arnoud & DJ Jasper',
        title: 'De Soldaat - Party Mix',
        bpm: 137,
      },
    },
    {
      timestamp: 4356.6,
      type: 'song',
      data: {
        artist: 'André Hazes Jr.',
        title: 'Leef',
        bpm: 137,
      },
    },
    {
      timestamp: 4384.4,
      type: 'horn',
      data: {
        counter: 71,
      },
    },
    {
      timestamp: 4385.0,
      type: 'song',
      data: {
        artist: 'Jeroen van der Boom',
        title: 'Jij Bent Zo',
        bpm: 137,
      },
    },
    {
      timestamp: 4422.8,
      type: 'song',
      data: [
        {
          artist: 'Crazy Frog',
          title: 'Axel F',
          bpm: 140,
        },
        {
          artist: 'Big Shaq',
          title: "Man's Not Hot",
          bpm: 140,
        },
      ],
    },
    {
      timestamp: 4450.5,
      type: 'horn',
      data: {
        counter: 72,
      },
    },
    {
      timestamp: 4464.2,
      type: 'song',
      data: {
        artist: 'Scoop',
        title: 'Drop It',
        bpm: 140,
      },
    },
    {
      timestamp: 4492.0,
      type: 'song',
      data: {
        artist: 'Vengaboys',
        title: 'We Like To Party! (The Vengabus)',
        bpm: 140,
      },
    },
    {
      timestamp: 4504.0,
      type: 'horn',
      data: {
        counter: 73,
      },
    },
    {
      timestamp: 4533.0,
      type: 'song',
      data: {
        artist: 'Special D.',
        title: 'Home Alone',
        bpm: 140,
      },
    },
    {
      timestamp: 4560.7,
      type: 'horn',
      data: {
        counter: 74,
      },
    },
    {
      timestamp: 4588.0,
      type: 'song',
      data: {
        artist: 'Tim Toupet',
        title: 'Ich bin ein Döner',
        bpm: 140,
      },
    },
    {
      timestamp: 4615.5,
      type: 'horn',
      data: {
        counter: 75,
      },
    },
    {
      timestamp: 4616.0,
      type: 'song',
      data: {
        artist: 'Markus Becker',
        title: 'Helikopter',
        bpm: 140,
      },
    },
    {
      timestamp: 4649.7,
      type: 'song',
      data: {
        artist: 'Jörg & Dragan (Die Autohändler)',
        title: 'Sonne, Berge, Bier',
        bpm: 140,
      },
    },
    {
      timestamp: 4677.3,
      type: 'horn',
      data: {
        counter: 76,
      },
    },
    {
      timestamp: 4678.0,
      type: 'song',
      data: {
        artist: 'Peter Wackel',
        title: 'Die Nacht von Freitag auf Montag',
        bpm: 140,
      },
    },
    {
      timestamp: 4711.2,
      type: 'song',
      data: {
        artist: 'Almklausi feat. Specktakel',
        title: 'Mama Laudaaa',
        bpm: 140,
      },
    },
    {
      timestamp: 4738.8,
      type: 'horn',
      data: {
        counter: 77,
      },
    },
    {
      timestamp: 4740.0,
      type: 'song',
      data: {
        artist: 'Edina Menzel',
        title: 'Let It Go',
        bpm: 140,
      },
    },
    {
      timestamp: 4740.0,
      type: 'effect',
      data: {
        // Turn on only the disco ball
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
      timestamp: 4796.0,
      type: 'effect',
      data: {
        // Turn off the disco ball. The room is now completely black
        discoBall: false,
        effects: {},
      },
    },
    {
      timestamp: 4796.2,
      type: 'horn',
      data: {
        counter: 78,
      },
    },
    {
      timestamp: 4797.0,
      type: 'song',
      data: {
        artist: 'Vlammen - Totally Summer Anthem',
        title: 'Mr. Polska',
        bpm: 150,
      },
    },
    {
      timestamp: 4847.1,
      type: 'song',
      data: {
        artist: 'The Soca Boys feat. Van B. King',
        title: 'Follow The Leader',
        bpm: 150,
      },
    },
    {
      timestamp: 4858.5,
      type: 'horn',
      data: {
        counter: 79,
      },
    },
    {
      timestamp: 4885.6,
      type: 'song',
      data: {
        artist: 'FeestDJRuud',
        title: 'Gas Op Die Lollie',
        bpm: 150,
      },
    },
    {
      timestamp: 4911.2,
      type: 'song',
      data: {
        artist: 'Snollebollekes feat. Coen & Sander',
        title: 'Feest Waarvan Ik Morgen Niks Meer Weet',
        bpm: 150,
      },
    },
    {
      timestamp: 4922.5,
      type: 'horn',
      data: {
        counter: 80,
      },
    },
    {
      timestamp: 4967.0,
      type: 'song',
      data: {
        artist: 'Captain Jack',
        title: 'Captain Jack',
        bpm: 150,
      },
    },
    {
      timestamp: 4979.6,
      type: 'horn',
      data: {
        counter: 81,
      },
    },
    {
      timestamp: 4995.7,
      type: 'song',
      data: {
        artist: 'Macklemore & Ryan Lewis feat. Ray Dalton',
        title: "Can't Hold Us",
        bpm: 153,
      },
    },
    {
      timestamp: 5046.5,
      type: 'horn',
      data: {
        counter: 82,
      },
    },
    {
      timestamp: 5047.0,
      type: 'song',
      data: {
        artist: 'PartyfrieX feat. Schorre Chef & MC Vals',
        title: 'Ik Moet Zuipen!',
        bpm: 153,
      },
    },
    {
      timestamp: 5111.1,
      type: 'horn',
      data: {
        counter: 83,
      },
    },
    {
      timestamp: 5112.9,
      type: 'song',
      data: {
        artist: 'Starkoo',
        title: 'Zo Ver Weg',
        bpm: 153,
      },
    },
    {
      timestamp: 5132.0,
      type: 'effect',
      data: {
        // Turn on only the disco ball
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
      timestamp: 5158.9,
      type: 'horn',
      data: {
        counter: 84,
      },
    },
    {
      timestamp: 5159.0,
      type: 'effect',
      data: {
        // Turn on a random effect. Note that the disco ball is still on
        random: true,
        effects: {},
      },
    },
    {
      timestamp: 5181.6,
      type: 'effect',
      data: {
        // Turn off the disco ball
        discoBall: false,
        effects: {},
      },
    },
    {
      timestamp: 5181.6,
      type: 'song',
      data: {
        artist: 'Barry Badpak',
        title: 'Als Een Toeter',
        bpm: 153,
      },
    },
    {
      timestamp: 5217.5,
      type: 'horn',
      data: {
        counter: 85,
      },
    },
    {
      timestamp: 5219.0,
      type: 'song',
      data: {
        artist: 'Stefan en Sean feat. Bram Krikke',
        title: 'Potentie (DJ Ruud & Boevenbende Remix)',
        bpm: 153,
      },
    },
    {
      timestamp: 5280.5,
      type: 'horn',
      data: {
        counter: 86,
      },
    },
    {
      timestamp: 5282.5,
      type: 'song',
      data: {
        artist: 'The Opposites feat. Yellow Claw',
        title: 'Thunder',
        bpm: 153,
      },
    },
    {
      timestamp: 5320.0,
      type: 'song',
      data: {
        artist: 'Buren Van De Brandweer',
        title: 'Pilsies Voor De Vat',
        bpm: 153,
      },
    },
    {
      timestamp: 5345.4,
      type: 'horn',
      data: {
        counter: 87,
      },
    },
    {
      timestamp: 5370.6,
      type: 'song',
      data: {
        artist: 'Snollebollekes',
        title: 'Links Rechts',
        bpm: 153,
      },
    },
    {
      timestamp: 5408.6,
      type: 'horn',
      data: {
        counter: 88,
      },
    },
    {
      timestamp: 5437.0,
      type: 'song',
      data: {
        artist: 'Mickie Krause',
        title: 'Nur noch Schuhe an!',
        bpm: 153,
      },
    },
    {
      timestamp: 5460.6,
      type: 'horn',
      data: {
        counter: 89,
      },
    },
    {
      timestamp: 5500.2,
      type: 'song',
      data: {
        artist: 'Ina Colada',
        title: 'Wodka mit irgendwas',
        bpm: 153,
      },
    },
    {
      timestamp: 5525.3,
      type: 'horn',
      data: {
        counter: 90,
      },
    },
    {
      timestamp: 5526.0,
      type: 'song',
      data: {
        artist: 'Da Tweekaz',
        title: 'Jägermeister',
        bpm: 152,
      },
    },
    {
      timestamp: 5587.1,
      type: 'horn',
      data: {
        counter: 91,
      },
    },
    {
      timestamp: 5588.0,
      type: 'song',
      data: {
        artist: 'Zany & DV8',
        title: 'Vreet Spirit',
        bpm: 153,
      },
    },
    {
      timestamp: 5651.8,
      type: 'horn',
      data: {
        counter: 92,
      },
    },
    {
      timestamp: 5652.0,
      type: 'song',
      data: {
        artist: 'Jebroer feat. Paul Elstak',
        title: 'Kind Van De Duivel',
        bpm: 153,
      },
    },
    {
      timestamp: 5677.1,
      type: 'song',
      data: {
        artist: 'Paul Elstak',
        title: 'The Promised Land',
        bpm: 163,
      },
    },
    {
      timestamp: 5701.5,
      type: 'horn',
      data: {
        counter: 93,
      },
    },
    {
      timestamp: 5725.3,
      type: 'song',
      data: {
        artist: 'Dune',
        title: 'Hardcore Vibes',
        bpm: 163,
      },
    },
    {
      timestamp: 5764.2,
      type: 'horn',
      data: {
        counter: 94,
      },
    },
    {
      timestamp: 5787.7,
      type: 'song',
      data: {
        artist: 'a-ha',
        title: 'Take on Me',
        bpm: 163,
      },
    },
    {
      timestamp: 5822.3,
      type: 'horn',
      data: {
        counter: 95,
      },
    },
    {
      timestamp: 5845.3,
      type: 'song',
      data: {
        artist: 'Technohead',
        title: 'I Wanna Be a Hippy',
        bpm: 173,
      },
    },
    {
      timestamp: 5878.9,
      type: 'song',
      data: {
        artist: 'Gabber Piet',
        title: 'Hakke & Zage',
        bpm: 173,
      },
    },
    {
      timestamp: 5888.4,
      type: 'horn',
      data: {
        counter: 96,
      },
    },
    {
      timestamp: 5890.0,
      type: 'song',
      data: {
        artist: 'Hakkuhbar',
        title: 'Super Gabber',
        bpm: 175,
      },
    },
    {
      timestamp: 5911.9,
      type: 'song',
      data: {
        artist: 'The Opposites feat. Sef & Mc Marboo',
        title: 'Ey Ey Ey',
        bpm: 180,
      },
    },
    {
      timestamp: 5942.6,
      type: 'horn',
      data: {
        counter: 97,
      },
    },
    {
      timestamp: 5969.4,
      type: 'song',
      data: {
        artist: 'Krezip',
        title: 'I Would Stay',
        bpm: 100,
      },
    },
    {
      timestamp: 6004.2,
      type: 'song',
      data: {
        artist: 'Scooter',
        title: 'Bit A Bad Boy',
        bpm: 153,
      },
    },
    {
      timestamp: 6017.0,
      type: 'horn',
      data: {
        counter: 98,
      },
    },
    {
      timestamp: 6057.0,
      type: 'song',
      data: {
        artist: 'Andre Hazes',
        title: 'Bloed, Zweet en Tranen',
        bpm: 69,
      },
    },
    {
      timestamp: 6071.2,
      type: 'horn',
      data: {
        counter: 99,
      },
    },
    {
      timestamp: 6127.6,
      type: 'horn',
      data: {
        counter: 100,
      },
    },
  ],
};

export default centurion2Original;
