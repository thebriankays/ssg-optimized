// lib/countries/countriesUtils.ts

import { countries } from './countries'
import { Country } from './countries.interface'

export const getByRegion = (region: string): Country[] =>
  countries.filter((country: Country) => country.region === region)

export const getByCode = (code: string): Country | undefined =>
  countries.find((country: Country) => country.code === code)

// Map of alternative country names to official names
const COUNTRY_NAME_ALIASES: Record<string, string> = {
  Czechia: 'Czech Republic',
  Czech: 'Czech Republic',
  Türkiye: 'Turkey',
  USA: 'United States of America',
  'United States': 'United States of America',
  US: 'United States of America',
  UK: 'United Kingdom',
  Britain: 'United Kingdom',
  'Great Britain': 'United Kingdom',
  England: 'United Kingdom',
  Scotland: 'United Kingdom',
  Wales: 'United Kingdom',
  'Northern Ireland': 'United Kingdom',
  Russia: 'Russian Federation',
  'South Korea': 'Korea (Republic of)',
  'North Korea': "Korea (Democratic People's Republic of)",
  Iran: 'Iran (Islamic Republic of)',
  Bolivia: 'Bolivia (Plurinational State of)',
  Venezuela: 'Venezuela (Bolivarian Republic of)',
  Tanzania: 'Tanzania, United Republic of',
  Moldova: 'Moldova (Republic of)',
  Macedonia: 'Macedonia (the former Yugoslav Republic of)',
  Laos: "Lao People's Democratic Republic",
  Vietnam: 'Viet Nam',
  Brunei: 'Brunei Darussalam',
  'Cape Verde': 'Cabo Verde',
  Congo: 'Congo (Democratic Republic of the)',
  'Ivory Coast': "Côte d'Ivoire",
  'East Timor': 'Timor-Leste',
  Swaziland: 'Swaziland',
  Syria: 'Syrian Arab Republic',
  Kosovo: 'Republic of Kosovo',
  Palestine: 'Palestine',
  'U.S Virgin Islands': 'Virgin Islands (U.S.)',
  'U.S. Virgin Islands': 'Virgin Islands (U.S.)',
  'US Virgin Islands': 'Virgin Islands (U.S.)',
  'United States Virgin Islands': 'Virgin Islands (U.S.)',
  'USVI': 'Virgin Islands (U.S.)',
  // Add common variations for Caribbean and other countries
  'The Bahamas': 'Bahamas',
  'The Gambia': 'Gambia',
  'The Netherlands': 'Netherlands',
  'UAE': 'United Arab Emirates',
  'St. Lucia': 'Saint Lucia',
  'St Lucia': 'Saint Lucia',
  'St. Vincent': 'Saint Vincent and the Grenadines',
  'St Vincent': 'Saint Vincent and the Grenadines',
  'St. Kitts': 'Saint Kitts and Nevis',
  'St Kitts': 'Saint Kitts and Nevis',
}

export const getByCountryName = (countryName: string): Country | undefined => {
  // First try exact match
  let country = countries.find((country: Country) => country.label === countryName)

  // If no exact match, try with alias
  if (!country && COUNTRY_NAME_ALIASES[countryName]) {
    const officialName = COUNTRY_NAME_ALIASES[countryName]
    country = countries.find((country: Country) => country.label === officialName)
  }

  // If still no match, try case-insensitive search
  if (!country) {
    country = countries.find(
      (country: Country) => country.label.toLowerCase() === countryName.toLowerCase(),
    )
  }

  return country
}

export const getByCurrency = (currencyCode: string): Country[] =>
  countries.filter((country: Country) => country.currency.code === currencyCode)

export const getByLanguage = (languageCode: string): Country[] =>
  countries.filter((country: Country) => country.language.code === languageCode)

export const getByCountryCode = (countryCode: string): Country | undefined =>
  countries.find((country: Country) => country.countryCode === countryCode)

export const listCountries = (): Country[] => countries

// Export the aliases for use in other modules if needed
export const getCountryNameAliases = (): Record<string, string> => COUNTRY_NAME_ALIASES
