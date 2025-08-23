// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { TravelAdvisories } from './collections/TravelAdvisories'
import { VisaRequirements } from './collections/VisaRequirements'
import { Airports } from './collections/Airports'
import { MichelinRestaurants } from './collections/MichelinRestaurants'
import { Countries } from './collections/Countries'
import { Regions } from './collections/Regions'
import { Destinations } from './collections/Destinations'
import { Languages } from './collections/Languages'
import { Currencies } from './collections/Currencies'
import { Airlines } from './collections/Airlines'
import { Bookings } from './collections/Bookings'
import { ChatSessions } from './collections/ChatSessions'
import { ClubMembers } from './collections/ClubMembers'
import { CountryDetails } from './collections/CountryDetails'
import { CountryMedia } from './collections/CountryMedia'
import { CountryReligions } from './collections/CountryReligions'
import { CrimeIndexScores } from './collections/CrimeIndexScores'
import { CrimeTrends } from './collections/CrimeTrends'
import { Customers } from './collections/Customers'
import { DestinationCategories } from './collections/DestinationCategories'
import { DestinationTypes } from './collections/DestinationTypes'
import { Experiences } from './collections/Experiences'
import { ExperienceTypes } from './collections/ExperienceTypes'
import { FlightCache } from './collections/FlightCache'
import { Leads } from './collections/Leads'
import { MapDataCache } from './collections/MapDataCache'
import { Religions } from './collections/Religions'
import { Routes } from './collections/Routes'
import { SalesFunnel } from './collections/SalesFunnel'
import { SocialMediaPosts } from './collections/SocialMediaPosts'
import { Timezones } from './collections/Timezones'
import { TravelDiaries } from './collections/TravelDiaries'
import { TravelItineraries } from './collections/TravelItineraries'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { SiteSettings } from './payload/globals/SiteSettings'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  collections: [
    Pages, 
    Posts, 
    Media, 
    Categories, 
    Users,
    TravelAdvisories,
    VisaRequirements,
    Airports,
    MichelinRestaurants,
    Countries,
    Regions,
    Destinations,
    Languages,
    Currencies,
    Airlines,
    Bookings,
    ChatSessions,
    ClubMembers,
    CountryDetails,
    CountryMedia,
    CountryReligions,
    CrimeIndexScores,
    CrimeTrends,
    Customers,
    DestinationCategories,
    DestinationTypes,
    Experiences,
    ExperienceTypes,
    FlightCache,
    Leads,
    MapDataCache,
    Religions,
    Routes,
    SalesFunnel,
    SocialMediaPosts,
    Timezones,
    TravelDiaries,
    TravelItineraries
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, SiteSettings],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
