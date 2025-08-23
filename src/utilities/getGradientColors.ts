// utilities/getGradientColors.ts

import { getCachedGlobal } from './getGlobals'

const DEFAULT_GRADIENT_COLORS: [string, string, string, string] = [
  '#dca8d8', // light purple
  '#a3d3f9', // light blue
  '#fcd6d6', // light pink
  '#eae2ff', // light lavender
]

export interface SiteSettingsType {
  backgroundGradient?: {
    color1?: string
    color2?: string
    color3?: string
    color4?: string
  }
}

/**
 * Gets the gradient colors from site settings
 * Falls back to defaults if not set
 */
export async function getGradientColors(): Promise<[string, string, string, string]> {
  try {
    // Get the site settings from the global
    const getSettings = getCachedGlobal('site-settings')
    const settings = (await getSettings()) as SiteSettingsType

    // Extract gradient colors
    const { backgroundGradient } = settings || {}

    // If we have gradient settings, use them
    if (backgroundGradient) {
      const { color1, color2, color3, color4 } = backgroundGradient

      return [
        color1 || DEFAULT_GRADIENT_COLORS[0],
        color2 || DEFAULT_GRADIENT_COLORS[1],
        color3 || DEFAULT_GRADIENT_COLORS[2],
        color4 || DEFAULT_GRADIENT_COLORS[3],
      ]
    }

    // Fall back to defaults
    return DEFAULT_GRADIENT_COLORS
  } catch (error) {
    console.error('Error fetching gradient colors:', error)
    return DEFAULT_GRADIENT_COLORS
  }
}

export { DEFAULT_GRADIENT_COLORS }
