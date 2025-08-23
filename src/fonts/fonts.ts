// src/fonts/fonts.ts

import { Saira_Extra_Condensed } from 'next/font/google'
import localFont from 'next/font/local'

// 1) Saira Extra Condensed (from Google)
export const sairaExtraCondensed = Saira_Extra_Condensed({
  subsets: ['latin'],
  weight: ['700', '800'],
  display: 'swap',
  variable: '--font-saira-extra-condensed',
})

// 2) New Order (local fonts)
export const newOrder = localFont({
  src: [
    {
      path: '../../public/fonts/New_Order_Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/New_Order_Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-new-order',
  display: 'swap',
})

// 3) Graphie (local fonts)
export const graphie = localFont({
  src: [
    {
      path: '../../public/fonts/Graphie_Thin.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Graphie_ExtraLight.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Graphie_Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Graphie_Book.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Graphie_Book_Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Graphie_Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Graphie_Bold_Italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-graphie',
  display: 'swap',
})

// 4) Antique Olive (local font)
export const antiqueOlive = localFont({
  src: [
    {
      path: '../../public/fonts/AntiqueOlive.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-antique-olive',
  display: 'swap',
})

export const ppNeueCorp = localFont({
  src: [
    {
      path: '../../public/fonts/PPNeueCorp-TightUltrabold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-pp-neue-corp',
  display: 'swap',
})

// 5) Oakes Grotesk (local font)
export const oakesGrotesk = localFont({
  src: [
    {
      path: '../../public/fonts/OakesGrotesk-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/OakesGrotesk-Semi-Bold.woff',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-oakes-grotesk',
  display: 'swap',
})

// 6) Six Caps (local font)
export const sixCaps = localFont({
  src: [
    {
      path: '../../public/fonts/SixCaps.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-six-caps',
  display: 'swap',
})

// 7) Monument Extended (local fonts)
export const monumentExtended = localFont({
  src: [
    {
      path: '../../public/fonts/monument-extended-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/monument-extended-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-monument-extended',
  display: 'swap',
})

// 8) FK Grotesk Neue (local font)
export const fkGroteskNeue = localFont({
  src: [
    {
      path: '../../public/fonts/FKGroteskNeue-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-fk-grotesk-neue',
  display: 'swap',
})
