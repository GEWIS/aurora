import { InfoScreenSettings } from './info-screen-settings';

export type UnknownNumberDisplay = InfoScreenSettings['InfoScreen.CallerId.UnknownNumber'];

const PHONE_NUMBER = /^\+?[\d\s()./-]*\d[\d\s()./-]*$/;

const NL_TWO_DIGIT_AREA_CODES = new Set([
  '10', '13', '15', '20', '23', '24', '26', '30', '33', '35', '36', '38', '40', '43', '45', '46',
  '50', '53', '55', '58', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '85', '88',
]); // prettier-ignore

const TWO_DIGIT_COUNTRY_CODES = new Set([
  '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47',
  '48', '49', '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65',
  '66', '81', '82', '84', '86', '90', '91', '92', '93', '94', '95', '98',
]); // prettier-ignore

export function parsePhoneNumber(value: string | null | undefined): string | null {
  const id = (value ?? '')
    .trim()
    .replace(/^(tel|sip):/i, '')
    .replace(/[@;].*$/, '');
  if (!PHONE_NUMBER.test(id)) return null;
  const digits = id.replace(/[^\d+]/g, '');
  return digits.startsWith('00') ? `+${digits.slice(2)}` : digits;
}

function dutchAreaCodeLength(national: string): number {
  if (national.startsWith('6')) return 1;
  return NL_TWO_DIGIT_AREA_CODES.has(national.slice(0, 2)) ? 2 : 3;
}

function countryCodeLength(digits: string): number {
  if (digits.startsWith('1') || digits.startsWith('7')) return 1;
  return TWO_DIGIT_COUNTRY_CODES.has(digits.slice(0, 2)) ? 2 : 3;
}

function mask(prefix: string, rest: string): string {
  const visible = rest.slice(-4);
  return `${prefix} ${'*'.repeat(rest.length - visible.length)}${visible}`.trim();
}

export function censorPhoneNumber(number: string): string {
  if (number.startsWith('+31')) {
    const national = number.slice(3);
    const areaCode = national.slice(0, dutchAreaCodeLength(national));
    return mask(`+31 ${areaCode}`, national.slice(areaCode.length));
  }
  if (number.startsWith('+')) {
    const digits = number.slice(1);
    const countryCode = digits.slice(0, countryCodeLength(digits));
    return mask(`+${countryCode}`, digits.slice(countryCode.length));
  }
  if (number.startsWith('0')) {
    const national = number.slice(1);
    const areaCode = national.slice(0, dutchAreaCodeLength(national));
    return mask(`0${areaCode}`, national.slice(areaCode.length));
  }
  // An internal extension has no area code.
  return mask('', number);
}

export function presentUnknownCaller(
  number: string | null | undefined,
  reportedName: string | null | undefined,
  display: UnknownNumberDisplay,
): string | null {
  const name = reportedName?.trim() || null;
  if (name && !parsePhoneNumber(name)) return name;

  const id = number?.trim() || name;
  if (!id) return null;
  const phoneNumber = parsePhoneNumber(id);

  switch (display) {
    case 'full':
      return phoneNumber ?? id;
    case 'censored':
      // A SIP address has no area code to keep, so it is not shown at all.
      return phoneNumber ? censorPhoneNumber(phoneNumber) : null;
    default:
      return null;
  }
}
