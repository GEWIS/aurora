import { describe, it, expect } from 'vitest';
import { Entry } from 'ldapts';
import LdapKeyholderSyncService, { LdapKeyholder } from './ldap-keyholder-sync-service';
import Keyholder from './entities/keyholder';
import { escapeFilterValue, guidToHex } from '../../../../helpers/ldap';

const remote = (guid: string, name: string, flags: Partial<LdapKeyholder> = {}): LdapKeyholder => ({
  guid,
  name,
  usernames: [],
  isBoard: false,
  isCandidateBoard: false,
  isKeyholder: true,
  ...flags,
});

/** A local row without touching the database. */
const local = (
  id: number,
  name: string,
  ldapGuid: string | null = null,
  ldapName: string | null = ldapGuid ? name : null,
): Keyholder =>
  ({ id, name, ldapGuid, ldapName, usernames: [], photoUrl: null }) as unknown as Keyholder;

describe('LdapKeyholderSyncService.toKeyholder', () => {
  const entry = {
    objectGUID: Buffer.from('0123456789abcdef0123456789abcdef', 'hex'),
    displayName: 'Jane Doe',
    cn: 'jdoe',
    sAMAccountName: 'JDoe',
    uid: 'jane',
  } as unknown as Entry;

  it('maps a directory entry and grants the flag of the group it came from', () => {
    const person = LdapKeyholderSyncService.toKeyholder(entry, 'isBoard');
    expect(person).toEqual({
      guid: '0123456789abcdef0123456789abcdef',
      name: 'Jane Doe',
      usernames: ['jdoe', 'jane'],
      isBoard: true,
      isCandidateBoard: false,
      isKeyholder: false,
    });
  });

  it('falls back to cn when there is no displayName', () => {
    const person = LdapKeyholderSyncService.toKeyholder(
      { ...entry, displayName: undefined } as unknown as Entry,
      'isKeyholder',
    );
    expect(person.name).toBe('jdoe');
  });

  it('de-duplicates login names that differ only in case', () => {
    const person = LdapKeyholderSyncService.toKeyholder(
      { ...entry, uid: 'jdoe' } as unknown as Entry,
      'isKeyholder',
    );
    expect(person.usernames).toEqual(['jdoe']);
  });
});

describe('LdapKeyholderSyncService.guard', () => {
  it('drops entries without a GUID or without a name', () => {
    expect(LdapKeyholderSyncService.guard(remote('abc', 'Jane'))).toBe(true);
    expect(LdapKeyholderSyncService.guard(remote('', 'Jane'))).toBe(false);
    expect(LdapKeyholderSyncService.guard(remote('abc', ''))).toBe(false);
  });
});

describe('LdapKeyholderSyncService.mergeFlags', () => {
  it('ORs the flags of someone found in several groups', () => {
    const board = remote('a', 'Jane', { isBoard: true, isKeyholder: false, usernames: ['jane'] });
    const key = remote('a', 'Jane', { isKeyholder: true, usernames: ['j.doe'] });
    const merged = LdapKeyholderSyncService.mergeFlags(board, key);

    expect(merged.isBoard).toBe(true);
    expect(merged.isKeyholder).toBe(true);
    expect(merged.isCandidateBoard).toBe(false);
    expect(merged.usernames).toEqual(['jane', 'j.doe']);
  });

  it('returns the incoming entry when the person is new', () => {
    const person = remote('a', 'Jane');
    expect(LdapKeyholderSyncService.mergeFlags(undefined, person)).toBe(person);
  });
});

describe('LdapKeyholderSyncService.plan', () => {
  it('creates rows for directory entries that are not in the registry', () => {
    const plan = LdapKeyholderSyncService.plan([remote('a', 'Jane')], []);
    expect(plan.create.map((p) => p.name)).toEqual(['Jane']);
    expect(plan.update).toHaveLength(0);
    expect(plan.remove).toHaveLength(0);
  });

  it('matches an existing row by GUID, even after a rename', () => {
    const plan = LdapKeyholderSyncService.plan(
      [remote('a', 'Jane Doe-Smith')],
      [local(1, 'Jane Doe', 'a')],
    );
    expect(plan.create).toHaveLength(0);
    expect(plan.remove).toHaveLength(0);
    expect(plan.update).toHaveLength(1);
    expect(plan.update[0].local.id).toBe(1);
    expect(plan.update[0].remote.name).toBe('Jane Doe-Smith');
  });

  it('adopts a manually added row by name instead of recreating it', () => {
    // The manual row carries a backoffice-set photo; recreating would lose it.
    const manual = local(7, 'Jane Doe');
    const plan = LdapKeyholderSyncService.plan([remote('a', 'jane doe')], [manual]);

    expect(plan.create).toHaveLength(0);
    expect(plan.remove).toHaveLength(0);
    expect(plan.update[0].local).toBe(manual);
  });

  it('removes every row the directory does not account for', () => {
    const plan = LdapKeyholderSyncService.plan(
      [remote('a', 'Jane')],
      [local(1, 'Jane', 'a'), local(2, 'Departed', 'b'), local(3, 'Added by hand')],
    );
    expect(plan.update).toHaveLength(1);
    expect(plan.remove.map((k) => k.name)).toEqual(['Departed', 'Added by hand']);
  });

  it('does not match one directory entry to two local rows', () => {
    const plan = LdapKeyholderSyncService.plan(
      [remote('a', 'Jane')],
      [local(1, 'Jane', 'a'), local(2, 'Jane')],
    );
    expect(plan.update).toHaveLength(1);
    expect(plan.update[0].local.id).toBe(1);
    expect(plan.remove.map((k) => k.id)).toEqual([2]);
  });
});

describe('LdapKeyholderSyncService.nameIsOverridden', () => {
  it('is false for a manual row, which has no directory name to differ from', () => {
    expect(LdapKeyholderSyncService.nameIsOverridden(local(1, 'Jane'))).toBe(false);
  });

  it('is false while the name still matches the directory', () => {
    expect(LdapKeyholderSyncService.nameIsOverridden(local(1, 'Jane Doe', 'a'))).toBe(false);
  });

  it('is true once the name was changed in the backoffice', () => {
    // Shown as "JW", the directory still says "Jan-Willem de Vries".
    const renamed = local(1, 'JW', 'a', 'Jan-Willem de Vries');
    expect(LdapKeyholderSyncService.nameIsOverridden(renamed)).toBe(true);
  });
});

describe('LDAP helpers', () => {
  it('normalises an objectGUID from a buffer, an array or a braced string', () => {
    expect(guidToHex(Buffer.from('ab', 'hex'))).toBe('ab');
    expect(guidToHex([Buffer.from('ab', 'hex')])).toBe('ab');
    expect(guidToHex('{01234567-89AB-CDEF-0123-456789ABCDEF}')).toBe(
      '0123456789abcdef0123456789abcdef',
    );
    expect(guidToHex(undefined)).toBeNull();
    expect(guidToHex('')).toBeNull();
  });

  it('escapes the characters that would change a filter’s structure', () => {
    expect(escapeFilterValue('CN=A(B)*,DC=x')).toBe('CN=A\\28B\\29\\2a,DC=x');
    expect(escapeFilterValue('CN=back\\slash')).toBe('CN=back\\5cslash');
    expect(escapeFilterValue('CN=Bestuur,OU=Groups,DC=gewis,DC=nl')).toBe(
      'CN=Bestuur,OU=Groups,DC=gewis,DC=nl',
    );
  });
});
