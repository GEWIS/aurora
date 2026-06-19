import { useEffect, useState } from 'react';
import { getTrains, TrainResponse } from '../../../api';
import './TrainPoster.scss';
import VerticalScroll from '../../../components/VerticalScroll';

interface Props {
  visible: boolean;
  timeout: number;
}

export default function TrainPoster({ visible, timeout }: Props) {
  const [trains, setTrains] = useState<TrainResponse[] | undefined>();

  useEffect(() => {
    getTrains()
      .then((res) => setTrains(res.data))
      .catch((e) => console.error(e));
  }, [visible]);

  const parseTime = (d: Date) => {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderMessages = (messages: { message: string }[]) => {
    return messages.map((m) => {
      if (m.message === 'Rijdt niet') {
        return (
          <div className="text-red-700" key={m.message}>
            CANCELLED
          </div>
        );
      }
      if (m.message.startsWith('Rijdt niet')) {
        return (
          <div key={m.message}>
            <span className="text-red-700">Cancelled</span>: {m.message}
          </div>
        );
      }
      return <div key={m.message}>{m.message}</div>;
    });
  };

  const renderDeparture = (t: TrainResponse) => {
    const departure = new Date(t.plannedDateTime);
    const relativeDeparture = Math.floor((departure.getTime() - new Date().getTime()) / 60000 + t.delay);
    const formatter = new Intl.ListFormat('en-gb', { style: 'long', type: 'conjunction' });

    return (
      <tr className={t.cancelled ? 'opacity-20' : ''} key={t.direction + '-' + t.plannedDateTime}>
        <td>
          <div className="flex flex-row gap-2 mr-8 whitespace-nowrap">
            <div>{parseTime(departure)}</div>
            <div className="text-3xl text-red-700">{t.delay ? `+${t.delay}` : ''}</div>
          </div>
        </td>
        <td className="text-2xl italic whitespace-nowrap">(in {relativeDeparture}m)</td>
        <td className="flex flex-row gap-4 items-center">
          <div className="whitespace-nowrap">{t.direction}</div>
          <div className="text-2xl">
            <div className="flex flex-col justify-start">
              <div>
                <span className="italic">
                  <img className="inline-block" src={`trains/${t.operator}.svg`} alt={`${t.operator}`} /> {t.trainType}
                </span>{' '}
                {t.routeStations.length > 0 && `via ${formatter.format(t.routeStations)}`}
              </div>
              {renderMessages(t.messages)}
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div
      className="w-full h-full text-6xl"
      style={{
        backgroundColor: '#FEC917',
        color: '#003082',
      }}
    >
      <VerticalScroll visible={visible} timeout={timeout} items={trains ? trains.length : 0}>
        <div className="py-10 px-20">
          <div
            className="text-center w-full text-6xl flex justify-center items-center gap-8"
            style={{ backgroundColor: '#003082', color: '#FEC917' }}
          >
            <img alt="train" src="trains/train.svg" className="align-bottom mb-2 h-32" />
            <div>Departures from Eindhoven Centraal</div>
            <img
              alt="train"
              src="trains/train.svg"
              className="align-bottom mb-2 h-32"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
          <table className="w-full poster-train-departures-table">
            <tbody>{trains && trains.map((t) => renderDeparture(t))}</tbody>
          </table>
        </div>
      </VerticalScroll>
    </div>
  );
}
