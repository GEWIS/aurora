export enum SecurityGroup {
  ADMIN = 'admin',
  BOARD = 'board',
  KEY_HOLDER = 'key-holder',
  BAC = 'bac',
  AVICO = 'avico',

  // Entities
  SCREEN_SUBSCRIBER = 'screen-subscriber',
  AUDIO_SUBSCRIBER = 'audio-subscriber',
  LIGHTS_SUBSCRIBER = 'lights-subscriber',
  INTEGRATION_USER = 'integration-user',
}

export enum SecurityNames {
  LOCAL = 'local',
  INTEGRATION = 'integration',
}

/**
 * Parse the roles and adds to security groups
 * @param roles - roles to parse
 */
export function parseRoles(roles: string[]): SecurityGroup[] {
  const rolesToProcess = roles.filter((r) => r !== '');
  const securityGroups: SecurityGroup[] = [];
  if (rolesToProcess.includes(process.env.ROLE_ADMIN || ''))
    securityGroups.push(SecurityGroup.ADMIN);
  if (rolesToProcess.includes(process.env.ROLE_BOARD || ''))
    securityGroups.push(SecurityGroup.BOARD);
  if (rolesToProcess.includes(process.env.ROLE_KEY_HOLDER || ''))
    securityGroups.push(SecurityGroup.KEY_HOLDER);
  if (rolesToProcess.includes(process.env.ROLE_BAC || '')) securityGroups.push(SecurityGroup.BAC);
  if (rolesToProcess.includes(process.env.ROLE_AVICO || ''))
    securityGroups.push(SecurityGroup.AVICO);
  return securityGroups;
}
