// lib/countries/specialCountryCases.ts

import { Country } from './countries.interface';
import { getByCode } from './countriesUtils';

// Define common US/UK cities that might be detected without proper country info
const US_CITIES = [
  'Seattle', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'San Francisco', 'Columbus', 'Fort Worth',
  'Indianapolis', 'Charlotte', 'Denver', 'Washington', 'Boston', 'El Paso',
  'Nashville', 'Detroit', 'Memphis', 'Portland', 'Oklahoma City', 'Las Vegas',
  'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Mesa',
  'Fresno', 'Sacramento', 'Atlanta', 'Kansas City', 'Miami', 'Omaha'
];

const UK_CITIES = [
  'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Bristol',
  'Edinburgh', 'Sheffield', 'Leeds', 'Leicester', 'Cardiff', 'Belfast',
  'Coventry', 'Nottingham', 'Newcastle', 'Southampton', 'Portsmouth',
  'Bradford', 'Brighton', 'Norwich', 'Oxford', 'Cambridge', 'York'
];

// Map of city to country code
const CITY_TO_COUNTRY: Record<string, string> = {};

// Add all US cities
US_CITIES.forEach(city => {
  CITY_TO_COUNTRY[city] = 'US';
});

// Add all UK cities
UK_CITIES.forEach(city => {
  CITY_TO_COUNTRY[city] = 'GB';
});

/**
 * Get country data by city name for special cases like US and UK
 * @param cityName Name of the city
 * @returns Country data if city is recognized, otherwise undefined
 */
export const getCountryByCity = (cityName: string): Country | undefined => {
  if (!cityName) return undefined;
  
  // Lookup country code for this city
  const countryCode = CITY_TO_COUNTRY[cityName];
  if (!countryCode) return undefined;
  
  // Return full country data from code
  return getByCode(countryCode);
};

/**
 * Check if string contains a known city name
 * @param text Text to check for city names
 * @returns Country data if city is found in text, otherwise undefined
 */
export const detectCityInText = (text: string): Country | undefined => {
  if (!text) return undefined;
  
  // Check for exact matches first
  const exactMatch = getCountryByCity(text);
  if (exactMatch) return exactMatch;
  
  // Then check if any cities are contained in the text
  for (const city of [...US_CITIES, ...UK_CITIES]) {
    if (text.includes(city)) {
      return getCountryByCity(city);
    }
  }
  
  return undefined;
};
