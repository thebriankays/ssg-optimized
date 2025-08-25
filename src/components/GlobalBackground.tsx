import { getCachedGlobal } from '@/utilities/getGlobals'
import { GlobalBackgroundClient } from './GlobalBackgroundClient'
import type { SiteSetting } from '@/payload-types'

export async function GlobalBackground() {
  const siteSettings = await getCachedGlobal('site-settings', 2)() as SiteSetting
  
  const backgroundSettings = siteSettings?.webgl?.background || {
    type: 'whatamesh',
    color1: '#dca8d8',
    color2: '#a3d3f9',
    color3: '#fcd6d6',
    color4: '#eae2ff',
    intensity: 0.5,
  }
  
  return <GlobalBackgroundClient backgroundSettings={backgroundSettings} />
}