export type Country = {
  /** ISO 3166-1 alpha-2 code, e.g. "KE" */
  code: string;
  name: string;
  /** Dial code with the plus sign, e.g. "+254" */
  dialCode: string;
  /** Flag emoji, derived from the ISO code */
  flag: string;
};

// Flag emoji = two "regional indicator" characters built from the ISO code.
const toFlag = (iso: string) =>
  iso
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');

// [ISO code, name, dial code]
const RAW: [string, string, string][] = [
  ['KE', 'Kenya', '+254'], ['UG', 'Uganda', '+256'], ['TZ', 'Tanzania', '+255'],
  ['RW', 'Rwanda', '+250'], ['BI', 'Burundi', '+257'], ['SS', 'South Sudan', '+211'],
  ['ET', 'Ethiopia', '+251'], ['SO', 'Somalia', '+252'], ['DJ', 'Djibouti', '+253'],
  ['ER', 'Eritrea', '+291'], ['SD', 'Sudan', '+249'], ['EG', 'Egypt', '+20'],
  ['NG', 'Nigeria', '+234'], ['GH', 'Ghana', '+233'], ['ZA', 'South Africa', '+27'],
  ['ZM', 'Zambia', '+260'], ['ZW', 'Zimbabwe', '+263'], ['MW', 'Malawi', '+265'],
  ['MZ', 'Mozambique', '+258'], ['AO', 'Angola', '+244'], ['BW', 'Botswana', '+267'],
  ['NA', 'Namibia', '+264'], ['MG', 'Madagascar', '+261'], ['MU', 'Mauritius', '+230'],
  ['CD', 'DR Congo', '+243'], ['CG', 'Republic of the Congo', '+242'], ['CM', 'Cameroon', '+237'],
  ['CI', "Côte d'Ivoire", '+225'], ['SN', 'Senegal', '+221'], ['ML', 'Mali', '+223'],
  ['BF', 'Burkina Faso', '+226'], ['NE', 'Niger', '+227'], ['TD', 'Chad', '+235'],
  ['GA', 'Gabon', '+241'], ['SL', 'Sierra Leone', '+232'], ['LR', 'Liberia', '+231'],
  ['GM', 'Gambia', '+220'], ['TG', 'Togo', '+228'], ['BJ', 'Benin', '+229'],
  ['MA', 'Morocco', '+212'], ['DZ', 'Algeria', '+213'], ['TN', 'Tunisia', '+216'],
  ['LY', 'Libya', '+218'],
  ['US', 'United States', '+1'], ['CA', 'Canada', '+1'], ['MX', 'Mexico', '+52'],
  ['BR', 'Brazil', '+55'], ['AR', 'Argentina', '+54'], ['CL', 'Chile', '+56'],
  ['CO', 'Colombia', '+57'], ['PE', 'Peru', '+51'], ['VE', 'Venezuela', '+58'],
  ['JM', 'Jamaica', '+1876'], ['TT', 'Trinidad and Tobago', '+1868'],
  ['GB', 'United Kingdom', '+44'], ['IE', 'Ireland', '+353'], ['FR', 'France', '+33'],
  ['DE', 'Germany', '+49'], ['ES', 'Spain', '+34'], ['PT', 'Portugal', '+351'],
  ['IT', 'Italy', '+39'], ['NL', 'Netherlands', '+31'], ['BE', 'Belgium', '+32'],
  ['CH', 'Switzerland', '+41'], ['AT', 'Austria', '+43'], ['SE', 'Sweden', '+46'],
  ['NO', 'Norway', '+47'], ['DK', 'Denmark', '+45'], ['FI', 'Finland', '+358'],
  ['PL', 'Poland', '+48'], ['CZ', 'Czechia', '+420'], ['GR', 'Greece', '+30'],
  ['RO', 'Romania', '+40'], ['HU', 'Hungary', '+36'], ['UA', 'Ukraine', '+380'],
  ['RU', 'Russia', '+7'], ['TR', 'Türkiye', '+90'],
  ['AE', 'United Arab Emirates', '+971'], ['SA', 'Saudi Arabia', '+966'], ['QA', 'Qatar', '+974'],
  ['KW', 'Kuwait', '+965'], ['OM', 'Oman', '+968'], ['BH', 'Bahrain', '+973'],
  ['IL', 'Israel', '+972'], ['JO', 'Jordan', '+962'], ['LB', 'Lebanon', '+961'],
  ['IR', 'Iran', '+98'], ['IQ', 'Iraq', '+964'],
  ['IN', 'India', '+91'], ['PK', 'Pakistan', '+92'], ['BD', 'Bangladesh', '+880'],
  ['LK', 'Sri Lanka', '+94'], ['NP', 'Nepal', '+977'], ['CN', 'China', '+86'],
  ['JP', 'Japan', '+81'], ['KR', 'South Korea', '+82'], ['HK', 'Hong Kong', '+852'],
  ['SG', 'Singapore', '+65'], ['MY', 'Malaysia', '+60'], ['TH', 'Thailand', '+66'],
  ['VN', 'Vietnam', '+84'], ['ID', 'Indonesia', '+62'], ['PH', 'Philippines', '+63'],
  ['AU', 'Australia', '+61'], ['NZ', 'New Zealand', '+64'],
];

export const COUNTRIES: Country[] = RAW.map(([code, name, dialCode]) => ({
  code,
  name,
  dialCode,
  flag: toFlag(code),
}));

export const DEFAULT_COUNTRY: Country = COUNTRIES.find((c) => c.code === 'KE')!;

/** Case-insensitive search by name, ISO code or dial code ("ken", "ke", "254", "+254"). */
export function filterCountries(list: Country[], query: string): Country[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  const digits = q.replace(/^\+/, '');
  return list.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase() === q ||
      (digits !== '' && /^\d+$/.test(digits) && c.dialCode.slice(1).startsWith(digits)),
  );
}