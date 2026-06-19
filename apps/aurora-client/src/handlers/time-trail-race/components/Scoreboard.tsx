import { CSSProperties } from 'react';
import { PlayerParams, ScoreboardItem } from '../../../api';
import { toStopwatchString } from '../helpers/time';
import '../../poster/components/ScrollAnimation.scss';
import VerticalScroll from '../../../components/VerticalScroll';
import { bacShadow, redShadow } from '../../../style/shadows';

interface Props {
  scoreboard: ScoreboardItem[];
  player?: PlayerParams;
}

export default function Scoreboard({ scoreboard, player }: Props) {
  const getTimeDifference = (i: number) => {
    if (i === 0) return null;
    const current = scoreboard[i].timeMs;
    const competitor = scoreboard[i - 1].timeMs;
    const difference = current - competitor;
    return '+' + toStopwatchString(difference, false);
  };

  const getScoreStyle = (score: ScoreboardItem): CSSProperties => {
    if (score.uuid === player?.uuid) return redShadow;
    if (score.bac) return bacShadow;
    return {};
  };

  return (
    <div className="h-full" style={{ marginBottom: '-5rem' }}>
      <VerticalScroll scrollEmptySpace visible={true}>
        <table className="border-separate text-4xl" style={{ borderSpacing: '3rem 1rem' }}>
          <tbody>
            {scoreboard.map((score, i) => (
              <tr key={score.uuid} style={getScoreStyle(score)}>
                <td className="">{i + 1})</td>
                <td className="">{score.name}</td>
                <td className="" style={{ fontFamily: 'Consolas,monaco,monospace' }}>
                  {toStopwatchString(score.timeMs)}
                </td>
                <td className="" style={{ fontFamily: 'Consolas,monaco,monospace' }}>
                  {getTimeDifference(i)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </VerticalScroll>
    </div>
  );
}
