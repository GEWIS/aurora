import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMedal, faPlus, faRankingStar } from '@fortawesome/free-solid-svg-icons';
import { CountryMedalResponse, getDutchOlympicMedals, getOlympicsMedalTable, MedalTableRecord } from '../../../api';
import VerticalScroll from '../../../components/VerticalScroll';

interface Props {
  visible: boolean;
}

function getMedalColor(medal: 'gold' | 'silver' | 'bronze'): string | undefined {
  switch (medal) {
    case 'gold':
      return 'gold';
    case 'silver':
      return 'silver';
    case 'bronze':
      return '#cd7f32';
  }
}

export default function OlympicsPoster({ visible }: Props) {
  const [medalTable, setMedalTable] = useState<MedalTableRecord[]>([]);
  const [dutchMedals, setDutchMedals] = useState<CountryMedalResponse | null>(null);

  // TODO what if data is not fetched?
  useEffect(() => {
    getOlympicsMedalTable()
      .then((res) => setMedalTable(res.data!))
      .catch((e) => console.error(e));
    getDutchOlympicMedals()
      .then((res) => setDutchMedals(res.data!))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div
      className="w-full h-full relative
      bg-gewis bg-cover text-shadow
      bg-olympics-2024 text-4xl font-semibold"
      style={{ fontFamily: 'Olympics2024' }}
    >
      <div className="absolute w-full h-full bg-black opacity-10" />
      <div className="absolute w-full h-full flex flex-col items-center p-10 pb-28 gap-8">
        <div
          className="font-olympics-2024 text-8xl font-medium text-white"
          style={{ fontFamily: 'Olympics2024', textShadow: '0 0 32px darkorange' }}
        >
          Summer Olympics Paris 2024
        </div>
        <div className="flex flex-row gap-12 w-full flex-1" style={{ textShadow: '0 0 5px black' }}>
          <div
            className="bg-black text-white bg-opacity-60 rounded-xl flex-1 h-full p-8 flex flex-col"
            style={{ maxHeight: 800 }}
          >
            <div className="text-center text-6xl font-medium pb-5" style={{ fontFamily: 'Olympics2024' }}>
              Medal table
            </div>
            <div className="w-full flex-1 overflow-hidden block">
              <VerticalScroll visible={visible} items={medalTable.length} scrollEmptySpace>
                <table className="w-full">
                  <thead>
                    <tr>
                      <td>
                        <FontAwesomeIcon icon={faRankingStar} />
                      </td>
                      <td>Country</td>
                      <td style={{ color: getMedalColor('gold') }}>
                        <FontAwesomeIcon icon={faMedal} />
                      </td>
                      <td style={{ color: getMedalColor('silver') }}>
                        <FontAwesomeIcon icon={faMedal} />
                      </td>
                      <td style={{ color: getMedalColor('bronze') }}>
                        <FontAwesomeIcon icon={faMedal} />
                      </td>
                      <td>
                        <FontAwesomeIcon icon={faPlus} />
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {medalTable.map((score) => (
                      <tr key={score.countryName}>
                        <td className="p-2">{score.rank}</td>
                        <td className="p-2 flex flex-row gap-2 items-center">
                          <img
                            alt="flag"
                            src={score.flagUrl}
                            style={{ height: '2rem', boxShadow: '0 0 5px #333333' }}
                          />
                          {score.countryName}
                        </td>
                        <td className="p-2">{score.gold}</td>
                        <td className="p-2">{score.silver}</td>
                        <td className="p-2">{score.bronze}</td>
                        <td className="p-2">{score.gold + score.silver + score.bronze}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </VerticalScroll>
            </div>
          </div>
          <div
            className="bg-black text-white bg-opacity-60 rounded-xl flex-1 h-full p-8 flex flex-col"
            style={{ maxHeight: 800 }}
          >
            <div
              className="text-center text-6xl font-medium pb-5 flex flex-row gap-6 items-center justify-center"
              style={{ fontFamily: 'Olympics2024' }}
            >
              <img
                alt="flag"
                src={dutchMedals?.flagUrl ?? ''}
                style={{ height: '4rem', boxShadow: '0 0 5px #333333' }}
              />
              Dutch medals
            </div>
            <div className="text-center flex flex-row gap-6 justify-center items-center mb-8">
              <div className="flex-1 flex flex-row gap-2 justify-center items-center">
                <FontAwesomeIcon style={{ color: getMedalColor('silver') }} icon={faMedal} />
                <span>{dutchMedals?.silver ?? 0}</span>
              </div>
              <div className="flex-1 text-5xl flex flex-row gap-2 justify-center items-center">
                <FontAwesomeIcon style={{ color: getMedalColor('gold') }} icon={faMedal} />
                {dutchMedals?.gold ?? 0}
              </div>
              <div className="flex-1 flex flex-row gap-2 justify-center items-center">
                <FontAwesomeIcon style={{ color: getMedalColor('bronze') }} icon={faMedal} />
                {dutchMedals?.bronze ?? 0}
              </div>
            </div>
            <div style={{ maxHeight: 570 }}>
              <VerticalScroll visible={visible} items={dutchMedals?.medals.length ?? 0} scrollEmptySpace>
                <table>
                  <tbody>
                    {dutchMedals?.medals.map((medal) => (
                      <tr key={medal.participantId + medal.eventId}>
                        <td className="pb-4 pr-4 text-6xl">
                          <FontAwesomeIcon style={{ color: getMedalColor(medal.medal) }} icon={faMedal} />
                        </td>
                        <td className="pb-4">
                          <p className="text-5xl">
                            {medal.sportName} - {medal.eventName}
                          </p>
                          <p className="italic">{medal.participantName}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </VerticalScroll>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
