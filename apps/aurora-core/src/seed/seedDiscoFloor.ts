import RootLightsService, { LightsInGroup } from '../modules/root/root-lights-service';

export async function seedDiscoFloor(
  width: number,
  height: number,
  channelOrder: number[] = [3, 2, 0, 1],
) {
  if (channelOrder.length !== 4) {
    throw new Error('Channel order must contain exactly four panels.');
  }

  const service = new RootLightsService();
  const controller = await service.createController({ name: 'DISCO-FLOOR' });
  const fixture = await service.createLightsPar({
    name: 'Disco floor panel',
    nrChannels: 3,
    colorRedChannel: 1,
    colorGreenChannel: 2,
    colorBlueChannel: 3,
  });

  const pars: LightsInGroup[] = [];
  for (let positionY = 0; positionY < height * 2; positionY += 2) {
    for (let positionX = 0; positionX < width * 2; positionX += 2) {
      channelOrder.forEach((c) => {
        if (c === 3)
          pars.push({
            fixtureId: fixture.id,
            firstChannel: pars.length * fixture.nrChannels + 1,
            positionX: positionX + 1,
            positionY: positionY + 1,
          });
        if (c === 2)
          pars.push({
            fixtureId: fixture.id,
            firstChannel: pars.length * fixture.nrChannels + 1,
            positionX,
            positionY: positionY + 1,
          });
        if (c === 1)
          pars.push({
            fixtureId: fixture.id,
            firstChannel: pars.length * fixture.nrChannels + 1,
            positionX: positionX + 1,
            positionY,
          });
        if (c === 0)
          pars.push({
            fixtureId: fixture.id,
            firstChannel: pars.length * fixture.nrChannels + 1,
            positionX,
            positionY,
          });
      });
    }
  }

  return await service.createLightGroup(controller.id, {
    name: 'Disco floor',
    defaultHandler: '',
    groupInMiddle: true,
    gridSizeX: width * 2,
    gridSizeY: height * 2,
    pars,
    movingHeadWheels: [],
    movingHeadRgbs: [],
  });
}
