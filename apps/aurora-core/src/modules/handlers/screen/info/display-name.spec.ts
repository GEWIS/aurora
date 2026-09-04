import { describe, it, expect } from 'vitest';
import { displayNames, givenName, shortSurname, NamedPerson } from './display-name';

const person = (id: number, name: string, displayName: string | null = null): NamedPerson => ({
  id,
  name,
  displayName,
});

/** The derived names in input order, for readable assertions. */
function names(people: NamedPerson[]): string[] {
  const map = displayNames(people);
  return people.map((p) => map.get(p.id)!);
}

describe('givenName', () => {
  it('takes the first word', () => {
    expect(givenName('Jan van den Jansen')).toBe('Jan');
  });

  it('copes with a single word and with padding', () => {
    expect(givenName('Jan')).toBe('Jan');
    expect(givenName('  Jan   de Jacobs ')).toBe('Jan');
  });
});

describe('shortSurname', () => {
  it('abbreviates a plain surname to its initial', () => {
    expect(shortSurname('Jan Jansen')).toBe('J.');
  });

  it('keeps the tussenvoegsels, as initials before the surname', () => {
    expect(shortSurname('Jan van den Jansen')).toBe('vd. J.');
    expect(shortSurname('Jan van Pietersen')).toBe('v. P.');
    expect(shortSurname('Jan de Jacobs')).toBe('d. J.');
  });

  it('treats a capitalised middle word as a middle name, not a tussenvoegsel', () => {
    expect(shortSurname('Jan Pietersen Jansen')).toBe('J.');
  });

  it('is empty when there is no surname', () => {
    expect(shortSurname('Jan')).toBe('');
  });
});

describe('displayNames', () => {
  it('uses the given name while it identifies one person', () => {
    expect(names([person(1, 'Jan Jansen')])).toEqual(['Jan']);
  });

  it('adds the surname initial when two people share a given name', () => {
    expect(names([person(1, 'Jan Jansen'), person(2, 'Jan Pietersen')])).toEqual([
      'Jan J.',
      'Jan P.',
    ]);
  });

  it('renames both, not just the second one', () => {
    // Whichever order they arrive in, neither may keep the bare given name.
    const [first, second] = names([person(1, 'Jan Pietersen'), person(2, 'Jan Jansen')]);
    expect(first).toBe('Jan P.');
    expect(second).toBe('Jan J.');
  });

  it('keeps the tussenvoegsels when telling two people apart', () => {
    expect(names([person(1, 'Jan Jacobs'), person(2, 'Jan van den Jansen')])).toEqual([
      'Jan J.',
      'Jan vd. J.',
    ]);
  });

  it('tells two tussenvoegsel surnames apart by their initials', () => {
    expect(names([person(1, 'Jan van Jansen'), person(2, 'Jan de Jansen')])).toEqual([
      'Jan v. J.',
      'Jan d. J.',
    ]);
  });

  it('falls back to the full surname when the initial is not enough', () => {
    expect(names([person(1, 'Jan Jansen'), person(2, 'Jan Jacobs')])).toEqual([
      'Jan Jansen',
      'Jan Jacobs',
    ]);
  });

  it('keeps the tussenvoegsels in that full fallback too', () => {
    expect(names([person(1, 'Jan van den Jansen'), person(2, 'Jan van de Jacobs')])).toEqual([
      'Jan van den Jansen',
      'Jan van de Jacobs',
    ]);
  });

  it('matches given names case-insensitively', () => {
    expect(names([person(1, 'jan Jansen'), person(2, 'Jan Pietersen')])).toEqual([
      'jan J.',
      'Jan P.',
    ]);
  });

  it('keeps the given name when there is no surname to add', () => {
    expect(names([person(1, 'Jan'), person(2, 'Jan Jansen')])).toEqual(['Jan', 'Jan J.']);
  });

  it('takes an override verbatim', () => {
    expect(names([person(1, 'Jan van den Jansen', 'Jantje')])).toEqual(['Jantje']);
  });

  it('ignores a blank override rather than showing an empty name', () => {
    expect(names([person(1, 'Jan van den Jansen', '   ')])).toEqual(['Jan']);
  });

  it('does not let a derived name collide with an override', () => {
    // "Jan" is taken by hand, so the real Jan has to be told apart from it.
    expect(names([person(1, 'Jan Jacobs', 'Jan'), person(2, 'Jan Jansen')])).toEqual([
      'Jan',
      'Jan J.',
    ]);
  });
});
