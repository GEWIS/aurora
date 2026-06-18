import '../env';
import { Command, Option } from 'commander';
import dataSource from '../database';
import seedDatabase, { seedBorrelLights, seedOpeningSequence, seedPosters } from './seedGewis';
import logger from '../logger';
import seedDatabaseHubble from './seedHubble';
import { seedDiscoFloor } from './seedDiscoFloor';

function commaSeparatedListInt(value: any, _: any): number[] {
  return value.split(',').map((s: any) => parseInt(s, 10));
}

const program = new Command();
program
  .name('aurora-seeder')
  .description('Functions to seed the database.')
  .addOption(
    new Option('--gewis', 'Seed for GEWIS').conflicts(['gewis-posters', 'hubble', 'disco-floor']),
  )
  .addOption(
    new Option('--gewis-posters', 'Seed for GEWIS (Default posters only)').conflicts([
      'gewis',
      'hubble',
      'disco-floor',
    ]),
  )
  .addOption(
    new Option('--hubble', 'Seed for Hubble').conflicts(['gewis', 'gewis-posters', 'disco-floor']),
  )
  .addOption(
    new Option('--disco-floor', 'Seed the disco floor').conflicts([
      'gewis',
      'gewis-posters',
      'hubble',
    ]),
  )
  .option('-w, --width <number>', 'Width of the disco floor (int)', parseInt)
  .option('-h, --height <number>', 'Height of the disco floor (int)', parseInt)
  .option(
    '--channel-order <items>',
    'DMX channel order of all light panels on a single floor tile',
    commaSeparatedListInt,
  );

/**
 * Channel order tile indices, where the top left is 0,0 in the lights group grid.
 * |---+---|
 * | 0 | 1 |
 * |---+---|
 * | 2 | 3 |
 * |---+---|
 */

async function createSeeder() {
  await dataSource.initialize();
  await dataSource.synchronize();

  program.parse();

  if (program.opts().hubble) {
    console.info('Seeding database for Hubble');
    await seedDatabaseHubble();
  } else if (program.opts().gewis) {
    console.info('Seeding database for GEWIS');
    const [room, bar, lounge, movingHeadsGEWIS, movingHeadsRoy] = await seedDatabase();
    await seedBorrelLights(room!, bar!, lounge!, movingHeadsGEWIS!);
    await seedOpeningSequence(room!, bar!, movingHeadsGEWIS!, movingHeadsRoy!);
    await seedPosters();
  } else if (program.opts().gewisPosters) {
    console.info('Seeding default posters for GEWIS');
    await seedPosters();
  } else if (program.opts().discoFloor) {
    console.info('Seeding database for disco floor');
    const { width, height, channelOrder } = program.opts();
    if (!width) {
      console.error('ERROR: No width given.');
    } else if (!height) {
      console.error('ERROR: No height given.');
    } else {
      await seedDiscoFloor(width, height, channelOrder);
    }
  }

  await dataSource.destroy();
}

if (require.main === module) {
  process.on('SIGINT', () => {
    // this is only called on ctrl+c, not restart
    process.kill(process.pid, 'SIGINT');
  });

  // Only execute the application directly if this is the main execution file.
  createSeeder().catch((e) => {
    logger.fatal(e);
  });
}
