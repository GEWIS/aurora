import { RoomStatusResponse } from '@gewis/aurora-api-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faStar, faStarHalfStroke, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { sBool, WidgetSettings } from '../settings';

interface Props {
  status: RoomStatusResponse | null;
  settings?: WidgetSettings;
}

type Responsible = RoomStatusResponse['responsible'][number];

/** The board/keyholder icon for a responsible person, or null. */
export function responsibleIcon(person: Responsible): IconDefinition | null {
  if (person.isBoard) return faStar;
  if (person.isCandidateBoard && person.isKeyholder) return faKey;
  if (person.isCandidateBoard) return faStarHalfStroke;
  if (person.isKeyholder) return faKey;
  return null;
}

/** Hour at which the room/beer state resets (matches the server's 06:00). */
const RESET_HOUR = 6;

/**
 * Resolve a "HH:mm" beer time to an absolute Date on the current *logical* day.
 * The day resets at 06:00, so between midnight and 06:00 an evening beer time
 * still belongs to the previous calendar day — otherwise the countdown would
 * wrongly restart towards today's beer time just after midnight.
 */
export function nextBeerTime(beerTime: string, from: Date): Date | null {
  const match = beerTime.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const target = new Date(from);
  target.setHours(hour, Number(match[2]), 0, 0);
  // Early morning (before the reset) + an evening beer time ⇒ it was yesterday.
  if (from.getHours() < RESET_HOUR && hour >= RESET_HOUR) {
    target.setDate(target.getDate() - 1);
  }
  return target;
}

export default function RoomStatusWidget({ status, settings }: Props) {
  const showPhotos = sBool(settings, 'showPhotos', true);
  const showSymbols = sBool(settings, 'showSymbols', true);

  if (!status || !status.open) {
    return (
      <div className="flex h-full flex-col items-center justify-center font-raleway text-white text-shadow">
        <span className="text-4xl font-semibold">{status?.closedMessage || 'GEWIS is closed'}</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col font-raleway text-white text-shadow">
      <div className="mb-3 shrink-0 text-2xl text-white/60">Room responsible</div>

      <div className="flex min-h-0 flex-1 flex-col divide-y divide-white/15">
        {status.responsible.length === 0 && (
          <div className="flex flex-1 items-center text-3xl">Nobody assigned</div>
        )}
        {status.responsible.map((person) => {
          const [first, ...rest] = person.name.trim().split(/\s+/);
          const last = rest.join(' ');
          const icon = responsibleIcon(person);
          return (
            // Each responsible person fills an equal share of the widget's height
            // (with a divider between them). First name big with the photo/keyholder
            // icon aligned on the same line (right), last name small below.
            <div key={person.name} className="flex flex-1 flex-col justify-center py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-5xl font-semibold">{first}</span>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center text-3xl">
                  {showPhotos && person.photoUrl ? (
                    <img
                      src={person.photoUrl}
                      alt={person.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    showSymbols && icon && <FontAwesomeIcon icon={icon} />
                  )}
                </div>
              </div>
              {last && <span className="mt-1 truncate text-2xl opacity-75">{last}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
