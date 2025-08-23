import { readFileSync } from 'fs'
import path from 'path'

// Load the ISO 3166-2 data
let isoRegions: Record<string, string> = {}

try {
  const filePath = path.join(process.cwd(), 'public', 'iso-3166-2.json')
  const data = readFileSync(filePath, 'utf8')
  isoRegions = JSON.parse(data)
} catch (error) {
  console.error('Error loading ISO 3166-2 data:', error)
}

// Hardcoded region codes for specific countries
const COUNTRY_REGIONS: Record<string, string> = {
  'US': 'NY',   // Default region for US
  'GB': 'ENG',  // Default region for UK
  'CA': 'ON',   // Default region for Canada  
  'LC': '13',   // Saint Lucia
  'AU': 'NSW',  // Australia
  'DE': 'BY',   // Germany
  'FR': 'IDF',  // France
  'IT': 'LA',   // Italy
  'ES': 'MD',   // Spain
  'JP': 'TO',   // Japan
  'CN': 'BJ',   // China
  'IN': 'DL',   // India
  'BR': 'RJ',   // Brazil
  'MX': 'CMX',  // Mexico
  'RU': 'MOW'   // Russia
}

/**
 * Get the region from an ISO country code
 * First tries hardcoded regions, then falls back to ISO 3166-2 data
 * @param code Country code (e.g., "US" for United States)
 * @returns The region code if found, or the default region if not found
 */
export const getIsoRegion = (code: string): string => {
  // Default to NA if code is falsy
  if (!code) return 'NA';
  
  // First check hardcoded regions for specific countries
  if (code in COUNTRY_REGIONS) {
    return COUNTRY_REGIONS[code];
  }
  
  // Then try to get region from ISO 3166-2 data
  try {
    // Find all region codes for this country
    const countryRegions = Object.keys(isoRegions)
      .filter(key => key.startsWith(`${code}-`));
    
    if (countryRegions.length > 0) {
      // Get first region, safely extract second part of code-region format
      const parts = countryRegions[0].split('-');
      if (parts && parts.length > 1 && typeof parts[1] === 'string') {
        return parts[1];
      }
    }
  } catch (error) {
    console.error(`Error getting region for country ${code}:`, error);
  }
  
  // If no region found, return either the country code itself or NA
  return code;
}

// Export the full region data for direct access
export const getAllIsoRegions = (): Record<string, string> => isoRegions;
