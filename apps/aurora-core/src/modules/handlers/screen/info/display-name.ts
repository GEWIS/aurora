/**
 * Short names for the screen.
 *
 * A full name rarely fits: the workstation map has about a seat's width to draw
 * one in, and the room-responsible panel gives the first name a line of its own.
 * The given name almost always fits and is what people call each other anyway,
 * so that is the default — but only while it identifies one person. Two people
 * with the same given name would be indistinguishable on the map, so a clash
 * falls back to as much of the surname as it takes to tell them apart.
 */

/** Whoever a display name has to be derived for. */
export interface NamedPerson {
  id: number;
  /** Full name, as the association records it. */
  name: string;
  /** Backoffice override; when set it is used verbatim. */
  displayName?: string | null;
}

function words(name: string): string[] {
  return name.trim().split(/\s+/).filter(Boolean);
}

/** The first word of a full name, or the whole thing when there is only one. */
export function givenName(name: string): string {
  return words(name)[0] ?? '';
}

/**
 * A full name split the way Dutch names go: a given name, any number of middle
 * words, and a final surname. The lowercase middle words are tussenvoegsels
 * ("van", "de", "van den"); a capitalised one is a middle name and is not part
 * of what identifies the surname.
 */
function parts(name: string): { given: string; tussen: string[]; rest: string[]; last: string } {
  const all = words(name);
  const middles = all.slice(1, -1);
  return {
    given: all[0] ?? '',
    tussen: middles.filter((w) => w[0] === w[0].toLowerCase()),
    rest: middles,
    last: all.length > 1 ? all[all.length - 1] : '',
  };
}

/**
 * The surname shortened to what fits beside a given name: the tussenvoegsels
 * as their initials, then the surname's own initial. "van den Jansen" becomes
 * "vd. J.", "van Pietersen" becomes "v. P.", plain "Jacobs" becomes "J.".
 *
 * The tussenvoegsels are kept because they are how people tell two surnames
 * apart out loud, and dropping them would turn every "van X" into a bare "X."
 */
export function shortSurname(name: string): string {
  const { tussen, last } = parts(name);
  if (last === '') return '';
  const prefix = tussen.length > 0 ? `${tussen.map((w) => w[0]).join('')}. ` : '';
  return `${prefix}${last[0]}.`;
}

/** Everything after the given name, unabbreviated. */
function fullSurname(name: string): string {
  const { rest, last } = parts(name);
  return [...rest, last].filter(Boolean).join(' ');
}

/**
 * Effective display names for a whole registry, keyed by id. Computed over the
 * set rather than per person, because whether a given name is ambiguous depends
 * on everyone else — adding a second Jan has to rename the first one too.
 *
 * Overrides are taken verbatim and still count as taken, so an override cannot
 * be shadowed by a derived name.
 */
export function displayNames(people: NamedPerson[]): Map<number, string> {
  const result = new Map<number, string>();

  const overridden = people.filter((p) => (p.displayName ?? '').trim() !== '');
  for (const person of overridden) {
    result.set(person.id, person.displayName!.trim());
  }

  const derived = people.filter((p) => (p.displayName ?? '').trim() === '');

  // How many people want each given name, overrides included: an override of
  // "Jan" must still push the real Jans to "Jan J.".
  const wanted = new Map<string, number>();
  for (const person of people) {
    const key = (result.get(person.id) ?? givenName(person.name)).toLowerCase();
    wanted.set(key, (wanted.get(key) ?? 0) + 1);
  }

  for (const person of derived) {
    const given = givenName(person.name);
    if ((wanted.get(given.toLowerCase()) ?? 0) <= 1) {
      result.set(person.id, given);
      continue;
    }

    // Ambiguous: add the shortened surname, and the whole surname if that is
    // still not enough (two "Jan J."s). A person with no surname to add keeps
    // the bare given name; there is nothing better to say.
    const short = shortSurname(person.name);
    if (short === '') {
      result.set(person.id, given);
      continue;
    }
    const sameShort = derived.filter(
      (other) =>
        givenName(other.name).toLowerCase() === given.toLowerCase() &&
        shortSurname(other.name).toLowerCase() === short.toLowerCase(),
    ).length;
    result.set(
      person.id,
      sameShort > 1 ? `${given} ${fullSurname(person.name)}` : `${given} ${short}`,
    );
  }

  return result;
}
