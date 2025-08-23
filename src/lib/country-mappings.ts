/**
 * Centralized country name mappings for the entire application
 * This handles various spellings, abbreviations, and alternative names
 * Used by both backend seeders and frontend components
 */

export const COUNTRY_NAME_MAPPINGS: Record<string, string> = {
  // Common variations and alternative names
  'united states': 'united states',
  'united states of america': 'united states',
  'usa': 'united states',
  'us': 'united states',
  'america': 'united states',
  
  'united kingdom': 'united kingdom',
  'uk': 'united kingdom',
  'great britain': 'united kingdom',
  'britain': 'united kingdom',
  'england': 'united kingdom', // Note: England is part of UK
  'united kingdom of great britain and northern ireland': 'united kingdom',
  
  // Countries with name changes
  'burma': 'myanmar',
  'macedonia': 'north macedonia',
  'swaziland': 'eswatini',
  'eswatini': 'eswatini',
  'czech republic': 'czechia',
  'turkey': 'türkiye',
  
  // Congo variations
  'congo': 'republic of the congo', // Default to Republic if not specified
  'congo (brazzaville)': 'republic of the congo',
  'congo-brazzaville': 'republic of the congo',
  'congo, republic of the': 'republic of the congo',
  'republic of congo': 'republic of the congo',
  'congo (kinshasa)': 'democratic republic of the congo',
  'congo-kinshasa': 'democratic republic of the congo',
  'congo, democratic republic of the': 'democratic republic of the congo',
  'democratic republic of the congo (kinshasa)': 'democratic republic of the congo',
  'dr congo': 'democratic republic of the congo',
  'drc': 'democratic republic of the congo',
  'congo (democratic republic)': 'democratic republic of the congo',
  'zaire': 'democratic republic of the congo', // Historical name
  
  // Ivory Coast variations
  "cote d'ivoire": "côte d'ivoire",
  "cote d ivoire": "côte d'ivoire",
  'ivory coast': "côte d'ivoire",
  "cote divoire": "côte d'ivoire",
  
  // Korea variations
  'south korea': 'south korea',
  'korea, south': 'south korea',
  'korea (republic of)': 'south korea',
  'republic of korea': 'south korea',
  'rok': 'south korea',
  'north korea': 'north korea',
  'korea, north': 'north korea',
  "korea (democratic people's republic of)": 'north korea',
  'democratic peoples republic of korea': 'north korea',
  'dprk': 'north korea',
  
  // China variations
  'china': 'china',
  'peoples republic of china': 'china',
  'prc': 'china',
  'mainland china': 'china',
  'mainland china, hong kong & macau': 'china',
  
  // Russia variations
  'russia': 'russia',
  'russian federation': 'russia',
  
  // Iran variations
  'iran': 'iran',
  'iran (islamic republic of)': 'iran',
  
  // Other name variations from components
  'laos': 'laos',
  "lao people's democratic republic": 'laos',
  'moldova': 'moldova',
  'moldova (republic of)': 'moldova',
  'vietnam': 'vietnam',
  'viet nam': 'vietnam',
  'venezuela': 'venezuela',
  'venezuela (bolivarian republic of)': 'venezuela',
  'bolivia': 'bolivia',
  'bolivia (plurinational state of)': 'bolivia',
  'tanzania': 'tanzania',
  'tanzania, united republic of': 'tanzania',
  'syria': 'syria',
  'syrian arab republic': 'syria',
  
  // Special Administrative Regions
  'hong kong': 'hong kong',
  'hong kong sar': 'hong kong',
  'macau': 'macao',
  'macao': 'macao',
  'macao sar': 'macao',
  
  // Island territories and dependencies
  'virgin islands': 'united states virgin islands',
  'us virgin islands': 'united states virgin islands',
  'british virgin islands': 'british virgin islands',
  'netherlands antilles': 'sint maarten', // Note: dissolved, now multiple entities
  'curacao': 'curaçao',
  
  // Timor variations
  'east timor': 'timor-leste',
  'timor leste': 'timor-leste',
  
  // São Tomé variations
  'sao tome and principe': 'são tomé and príncipe',
  'sao tome & principe': 'são tomé and príncipe',
  'st. tome and principe': 'são tomé and príncipe',
  
  // Saint variations
  'st. lucia': 'saint lucia',
  'st lucia': 'saint lucia',
  'st. vincent and the grenadines': 'saint vincent and the grenadines',
  'st vincent and the grenadines': 'saint vincent and the grenadines',
  'st. kitts and nevis': 'saint kitts and nevis',
  'st kitts and nevis': 'saint kitts and nevis',
  
  // Reunion variations
  'reunion': 'réunion',
  'la reunion': 'réunion',
  
  // Other territories
  'svalbard': 'svalbard and jan mayen',
  'saint helena': 'saint helena, ascension and tristan da cunha',
  'palestine': 'palestine',
  'palestinian territories': 'palestine',
  'west bank': 'palestine',
  'west bank and gaza': 'palestine',
  'kosovo': 'kosovo',
  
  // Atoll territories
  'johnston atoll': 'united states minor outlying islands',
  'wake island': 'united states minor outlying islands',
  'midway islands': 'united states minor outlying islands',
  
  // Vatican variations
  'vatican': 'vatican city',
  'vatican city state': 'vatican city',
  'holy see': 'vatican city',
  
  // Micronesia variations
  'micronesia': 'micronesia',
  'federated states of micronesia': 'micronesia',
  'fsm': 'micronesia',
  
  // Other common variations
  'brunei': 'brunei',
  'brunei darussalam': 'brunei',
  'cape verde': 'cabo verde',
  'gambia': 'gambia',
  'the gambia': 'gambia',
  'bahamas': 'bahamas',
  'the bahamas': 'bahamas',
  'netherlands': 'netherlands',
  'the netherlands': 'netherlands',
  'holland': 'netherlands',
  'marshall islands': 'marshall islands',
  'the marshall islands': 'marshall islands',
  'solomon islands': 'solomon islands',
  'the solomon islands': 'solomon islands',
  'philippines': 'philippines',
  'the philippines': 'philippines',
  'maldives': 'maldives',
  'the maldives': 'maldives',
  'seychelles': 'seychelles',
  'the seychelles': 'seychelles',
  'comoros': 'comoros',
  'the comoros': 'comoros',
  'chad': 'chad',
  'antarctica': 'antarctica',
}

/**
 * Country name mapping for mixed case (used by TravelDataGlobe)
 * Maps common variations to formal names
 */
export const countryNameMap: Record<string, string> = {
  // Common variations
  'United States': 'United States of America',
  'USA': 'United States of America',
  'US': 'United States of America',
  'United Kingdom': 'United Kingdom',
  'UK': 'United Kingdom',
  'Britain': 'United Kingdom',
  'Great Britain': 'United Kingdom',
  
  // Formal vs common names
  'Russia': 'Russian Federation',
  'South Korea': 'Korea, Republic of',
  'North Korea': "Korea, Democratic People's Republic of",
  'Taiwan': 'Taiwan, Province of China',
  'Vietnam': 'Viet Nam',
  'Venezuela': 'Venezuela, Bolivarian Republic of',
  'Bolivia': 'Bolivia, Plurinational State of',
  'Tanzania': 'Tanzania, United Republic of',
  'Syria': 'Syrian Arab Republic',
  'Iran': 'Iran, Islamic Republic of',
  'Laos': "Lao People's Democratic Republic",
  'Moldova': 'Moldova, Republic of',
  'Macedonia': 'Macedonia, the former Yugoslav Republic of',
  'Palestine': 'Palestine, State of',
  
  // Alternative spellings
  'Ivory Coast': "Côte d'Ivoire",
  'Cote d\'Ivoire': "Côte d'Ivoire",
  'Czech Republic': 'Czechia',
  'Swaziland': 'Eswatini',
  'Cape Verde': 'Cabo Verde',
  'East Timor': 'Timor-Leste',
  'Burma': 'Myanmar',
  
  // Islands and territories
  'Falkland Islands': 'Falkland Islands (Malvinas)',
  'Virgin Islands, U.S.': 'Virgin Islands, US',
  'Virgin Islands, British': 'Virgin Islands, British',
  'Hong Kong': 'Hong Kong SAR China',
  'Macao': 'Macao SAR China',
  'Macau': 'Macao SAR China',
  
  // Compound names
  'Bosnia': 'Bosnia and Herzegovina',
  'Trinidad': 'Trinidad and Tobago',
  'Saint Vincent': 'Saint Vincent and the Grenadines',
  'Antigua': 'Antigua and Barbuda',
  'Saint Kitts': 'Saint Kitts and Nevis',
  
  // Special cases
  'Congo': 'Congo',
  'Democratic Republic of Congo': 'Congo, Democratic Republic of the',
  'DRC': 'Congo, Democratic Republic of the',
  'Republic of Congo': 'Congo',
  'South Sudan': 'South Sudan',
  'Western Sahara': 'Western Sahara',
  'Vatican': 'Holy See (Vatican City State)',
  'Vatican City': 'Holy See (Vatican City State)',
}

/**
 * ISO code to country name mapping
 */
export const isoToCountryMap: Record<string, string> = {
  'US': 'United States of America',
  'GB': 'United Kingdom',
  'FR': 'France',
  'DE': 'Germany',
  'IT': 'Italy',
  'ES': 'Spain',
  'CA': 'Canada',
  'AU': 'Australia',
  'JP': 'Japan',
  'CN': 'China',
  'IN': 'India',
  'BR': 'Brazil',
  'RU': 'Russian Federation',
  'MX': 'Mexico',
  'KR': 'Korea, Republic of',
  'ID': 'Indonesia',
  'TR': 'Turkey',
  'SA': 'Saudi Arabia',
  'AR': 'Argentina',
  'EG': 'Egypt',
  'TH': 'Thailand',
  'NG': 'Nigeria',
  'PK': 'Pakistan',
  'MY': 'Malaysia',
  'BD': 'Bangladesh',
  'VN': 'Viet Nam',
  'PH': 'Philippines',
  'ET': 'Ethiopia',
  'IR': 'Iran, Islamic Republic of',
  'CD': 'Congo, Democratic Republic of the',
  'TZ': 'Tanzania, United Republic of',
  'KE': 'Kenya',
  'UA': 'Ukraine',
  'UG': 'Uganda',
  'IQ': 'Iraq',
  'DZ': 'Algeria',
  'SD': 'Sudan',
  'MA': 'Morocco',
  'AF': 'Afghanistan',
  'PL': 'Poland',
  'AO': 'Angola',
  'UZ': 'Uzbekistan',
  'YE': 'Yemen',
  'PE': 'Peru',
  'GH': 'Ghana',
  'MZ': 'Mozambique',
  'NP': 'Nepal',
  'MG': 'Madagascar',
  'CM': 'Cameroon',
  'CI': "Côte d'Ivoire",
  'NE': 'Niger',
  'LK': 'Sri Lanka',
  'BF': 'Burkina Faso',
  'ML': 'Mali',
  'MW': 'Malawi',
  'CL': 'Chile',
  'KZ': 'Kazakhstan',
  'ZM': 'Zambia',
  'EC': 'Ecuador',
  'SY': 'Syrian Arab Republic',
  'NL': 'Netherlands',
  'SN': 'Senegal',
  'TD': 'Chad',
  'SO': 'Somalia',
  'ZW': 'Zimbabwe',
  'RW': 'Rwanda',
  'GN': 'Guinea',
  'BJ': 'Benin',
  'TN': 'Tunisia',
  'BE': 'Belgium',
  'BO': 'Bolivia, Plurinational State of',
  'CU': 'Cuba',
  'HT': 'Haiti',
  'DO': 'Dominican Republic',
  'CZ': 'Czechia',
  'GR': 'Greece',
  'PT': 'Portugal',
  'JO': 'Jordan',
  'HU': 'Hungary',
  'AZ': 'Azerbaijan',
  'SE': 'Sweden',
  'AE': 'United Arab Emirates',
  'BY': 'Belarus',
  'TJ': 'Tajikistan',
  'AT': 'Austria',
  'CH': 'Switzerland',
  'IL': 'Israel',
  'TG': 'Togo',
  'SL': 'Sierra Leone',
  'HK': 'Hong Kong SAR China',
  'LA': "Lao People's Democratic Republic",
  'PY': 'Paraguay',
  'BG': 'Bulgaria',
  'LY': 'Libya',
  'LB': 'Lebanon',
  'NI': 'Nicaragua',
  'KG': 'Kyrgyzstan',
  'SV': 'El Salvador',
  'TM': 'Turkmenistan',
  'SG': 'Singapore',
  'DK': 'Denmark',
  'FI': 'Finland',
  'SK': 'Slovakia',
  'NO': 'Norway',
  'OM': 'Oman',
  'PS': 'Palestine, State of',
  'CR': 'Costa Rica',
  'LR': 'Liberia',
  'IE': 'Ireland',
  'NZ': 'New Zealand',
  'CF': 'Central African Republic',
  'MR': 'Mauritania',
  'PA': 'Panama',
  'KW': 'Kuwait',
  'HR': 'Croatia',
  'MD': 'Moldova, Republic of',
  'GE': 'Georgia',
  'ER': 'Eritrea',
  'UY': 'Uruguay',
  'BA': 'Bosnia and Herzegovina',
  'MN': 'Mongolia',
  'AM': 'Armenia',
  'JM': 'Jamaica',
  'AL': 'Albania',
  'QA': 'Qatar',
  'LT': 'Lithuania',
  'NA': 'Namibia',
  'GM': 'Gambia',
  'BW': 'Botswana',
  'GA': 'Gabon',
  'LS': 'Lesotho',
  'MK': 'Macedonia, the former Yugoslav Republic of',
  'SI': 'Slovenia',
  'GW': 'Guinea-Bissau',
  'LV': 'Latvia',
  'BH': 'Bahrain',
  'GQ': 'Equatorial Guinea',
  'TT': 'Trinidad and Tobago',
  'EE': 'Estonia',
  'TL': 'Timor-Leste',
  'MU': 'Mauritius',
  'CY': 'Cyprus',
  'SZ': 'Eswatini',
  'DJ': 'Djibouti',
  'FJ': 'Fiji',
  'RE': 'Réunion',
  'KM': 'Comoros',
  'GY': 'Guyana',
  'BT': 'Bhutan',
  'SB': 'Solomon Islands',
  'MO': 'Macao SAR China',
  'ME': 'Montenegro',
  'LU': 'Luxembourg',
  'EH': 'Western Sahara',
  'SR': 'Suriname',
  'CV': 'Cabo Verde',
  'GP': 'Guadeloupe',
  'MQ': 'Martinique',
  'MT': 'Malta',
  'MV': 'Maldives',
  'BN': 'Brunei Darussalam',
  'GF': 'French Guiana',
  'IS': 'Iceland',
  'BS': 'Bahamas',
  'BZ': 'Belize',
  'BB': 'Barbados',
  'PF': 'French Polynesia',
  'NC': 'New Caledonia',
  'VU': 'Vanuatu',
  'YT': 'Mayotte',
  'ST': 'Sao Tome and Principe',
  'WS': 'Samoa',
  'CW': 'Curaçao',
  'GU': 'Guam',
  'VI': 'Virgin Islands, US',
  'KI': 'Kiribati',
  'GD': 'Grenada',
  'FM': 'Micronesia, Federated States of',
  'AW': 'Aruba',
  'TO': 'Tonga',
  'VC': 'Saint Vincent and the Grenadines',
  'JE': 'Jersey',
  'SC': 'Seychelles',
  'AG': 'Antigua and Barbuda',
  'IM': 'Isle of Man',
  'AD': 'Andorra',
  'DM': 'Dominica',
  'KY': 'Cayman Islands',
  'BM': 'Bermuda',
  'MH': 'Marshall Islands',
  'GL': 'Greenland',
  'AS': 'American Samoa',
  'MP': 'Northern Mariana Islands',
  'GG': 'Guernsey',
  'FO': 'Faroe Islands',
  'KN': 'Saint Kitts and Nevis',
  'SX': 'Sint Maarten (Dutch part)',
  'LC': 'Saint Lucia',
  'LI': 'Liechtenstein',
  'MC': 'Monaco',
  'SM': 'San Marino',
  'GI': 'Gibraltar',
  'VG': 'Virgin Islands, British',
  'TC': 'Turks and Caicos Islands',
  'PW': 'Palau',
  'CK': 'Cook Islands',
  'AI': 'Anguilla',
  'WF': 'Wallis and Futuna',
  'NR': 'Nauru',
  'TV': 'Tuvalu',
  'FK': 'Falkland Islands (Malvinas)',
  'MS': 'Montserrat',
  'NU': 'Niue',
  'TK': 'Tokelau',
  'VA': 'Holy See (Vatican City State)',
  'SH': 'Saint Helena, Ascension and Tristan da Cunha',
  'PN': 'Pitcairn',
  'AQ': 'Antarctica',
  'XK': 'Kosovo',
}

/**
 * Helper function to normalize country names
 * @param name The country name to normalize
 * @returns The normalized country name
 */
export function normalizeCountryName(name: string): string {
  if (!name) return ''
  
  // Check direct mapping first (mixed case)
  const directMatch = countryNameMap[name]
  if (directMatch) return directMatch
  
  // Check ISO code
  const isoMatch = isoToCountryMap[name.toUpperCase()]
  if (isoMatch) return isoMatch
  
  // Convert to lowercase and trim
  const normalized = name.toLowerCase().trim()
  
  // Remove common prefixes
  const withoutPrefix = normalized
    .replace(/^the\s+/i, '')
    .replace(/^republic\s+of\s+/i, '')
    .replace(/^kingdom\s+of\s+/i, '')
    .replace(/^state\s+of\s+/i, '')
    .replace(/^commonwealth\s+of\s+/i, '')
    .replace(/^union\s+of\s+/i, '')
    .replace(/\s+\(.*\)$/i, '')
    .replace(/,\s+the$/i, '')
  
  // Check lowercase mappings
  const lowercaseMatch = COUNTRY_NAME_MAPPINGS[withoutPrefix] || COUNTRY_NAME_MAPPINGS[normalized]
  if (lowercaseMatch) return lowercaseMatch
  
  // Check mapping again with normalized name
  const normalizedMatch = countryNameMap[withoutPrefix] || countryNameMap[normalized]
  if (normalizedMatch) return normalizedMatch
  
  // Return original if no match found
  return name
}

/**
 * Helper function to find a country in a map
 * @param countryMap Map of country names to country objects
 * @param searchName The name to search for
 * @returns The country object if found, null otherwise
 */
export function findCountryInMap<T>(
  countryMap: Map<string, T>,
  searchName: string
): T | null {
  if (!searchName) return null
  
  // Try exact match first
  const exactMatch = countryMap.get(searchName.toLowerCase())
  if (exactMatch) return exactMatch
  
  // Try normalized name
  const normalizedName = normalizeCountryName(searchName)
  const normalizedMatch = countryMap.get(normalizedName)
  if (normalizedMatch) return normalizedMatch
  
  // Try all mappings
  for (const [variant, standard] of Object.entries(COUNTRY_NAME_MAPPINGS)) {
    if (variant === searchName.toLowerCase() || standard === searchName.toLowerCase()) {
      const mapped = countryMap.get(standard)
      if (mapped) return mapped
    }
  }
  
  // Try partial matching as last resort
  const searchLower = searchName.toLowerCase()
  for (const [name, country] of countryMap.entries()) {
    if (name.includes(searchLower) || searchLower.includes(name)) {
      return country
    }
  }
  
  return null
}

/**
 * Get all possible variations of a country name
 * @param standardName The standard country name
 * @returns Array of all known variations
 */
export function getCountryNameVariations(standardName: string): string[] {
  const variations = new Set<string>()
  const normalized = normalizeCountryName(standardName)
  
  // Add the standard name
  variations.add(normalized)
  variations.add(standardName.toLowerCase())
  
  // Find all variations that map to this standard name
  for (const [variant, standard] of Object.entries(COUNTRY_NAME_MAPPINGS)) {
    if (standard === normalized) {
      variations.add(variant)
    }
  }
  
  return Array.from(variations)
}

/**
 * Get country code from name (for flag images, etc)
 * @param countryName The country name
 * @param countries Array of country objects with name and code
 * @returns The country code or null
 */
export function getCountryCode(
  countryName: string, 
  countries: Array<{ name: string; code: string }>
): string | null {
  const normalized = normalizeCountryName(countryName)
  
  // Try exact match
  const country = countries.find(c => 
    c.name.toLowerCase() === normalized ||
    c.name.toLowerCase() === countryName.toLowerCase()
  )
  
  if (country) return country.code
  
  // Special cases for countries with non-standard codes
  const specialCodes: Record<string, string> = {
    'kosovo': 'XK',
    'antarctica': 'AQ',
    'chad': 'TD',
    'eswatini': 'SZ',
  }
  
  const specialCode = specialCodes[normalized] || specialCodes[countryName.toLowerCase()]
  if (specialCode) return specialCode
  
  return null
}

/**
 * Country mapping specifically for travel advisories
 * (preserves original names that might be needed for display)
 */
export const TRAVEL_ADVISORY_MAPPINGS: Record<string, string> = {
  'Cote d Ivoire': "Côte d'Ivoire",
  'Congo, Democratic Republic of the': 'Democratic Republic of the Congo',
  'Democratic Republic of the Congo (Kinshasa)': 'Democratic Republic of the Congo',
  'Congo, Republic of the': 'Republic of the Congo',
  'Burma': 'Myanmar',
  'Mainland China, Hong Kong & Macau': 'China',
}

/**
 * Get country by name or ISO code (used by TravelDataGlobe)
 * @param searchTerm The search term (name or ISO code)
 * @param countries Array of country objects
 * @returns The matching country object or undefined
 */
export function findCountryMatch(
  searchTerm: string,
  countries: Array<{ name: string; code?: string }>
): { name: string; code?: string } | undefined {
  if (!searchTerm) return undefined
  
  const normalized = normalizeCountryName(searchTerm)
  
  // Try exact match first
  let match = countries.find(c => c.name === normalized)
  if (match) return match
  
  // Try ISO code match
  match = countries.find(c => c.code === searchTerm.toUpperCase())
  if (match) return match
  
  // Try case-insensitive match
  match = countries.find(
    c => c.name.toLowerCase() === normalized.toLowerCase()
  )
  if (match) return match
  
  // Try partial match
  match = countries.find(
    c => c.name.toLowerCase().includes(normalized.toLowerCase())
  )
  if (match) return match
  
  return undefined
}