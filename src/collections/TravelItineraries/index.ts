import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
// import { glassCollectionComponents } from '@/components/admin/collectionOverrides'

export const TravelItineraries: CollectionConfig = {
  slug: 'travel-itineraries',
  
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: () => true,
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'travelDates', 'createdAt'],
    // components: glassCollectionComponents,
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },

    // Storytelling Configuration
    {
      name: 'enable3DStorytelling',
      type: 'checkbox',
      label: 'Enable 3D Storytelling View',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Enable photorealistic 3D map storytelling for this itinerary',
      },
    },

    // Travel Details Tab
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Brief description of the itinerary',
              },
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Cover image for the itinerary',
              },
            },
            {
              name: 'travelDates',
              type: 'group',
              fields: [
                {
                  name: 'startDate',
                  type: 'date',
                  required: true,
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                    },
                  },
                },
                {
                  name: 'endDate',
                  type: 'date',
                  required: true,
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                    },
                  },
                },
              ],
            },
            {
              name: 'groupType',
              type: 'select',
              required: true,
              options: [
                { label: 'Solo', value: 'solo' },
                { label: 'Couple', value: 'couple' },
                { label: 'Family', value: 'family' },
                { label: 'Friends', value: 'friends' },
                { label: 'Business', value: 'business' },
              ],
            },
            {
              name: 'budgetRange',
              type: 'select',
              required: true,
              options: [
                { label: 'Budget', value: 'budget' },
                { label: 'Mid-Range', value: 'mid-range' },
                { label: 'Luxury', value: 'luxury' },
                { label: 'Ultra-Luxury', value: 'ultra-luxury' },
              ],
            },
          ],
        },
        {
          label: 'Story Chapters',
          fields: [
            {
              name: 'storyChapters',
              type: 'array',
              label: '3D Story Chapters',
              labels: {
                singular: 'Chapter',
                plural: 'Chapters',
              },
              admin: {
                description: 'Build your travel story with location-based chapters',
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Chapter title (e.g., "Arriving in Paris")',
                  },
                },
                {
                  name: 'content',
                  type: 'textarea',
                  required: true,
                  admin: {
                    description: 'Chapter content/narration',
                  },
                },
                {
                  name: 'dateTime',
                  type: 'text',
                  admin: {
                    placeholder: 'Day 1 - Morning',
                    description: 'When this happens in the itinerary',
                  },
                },
                {
                  name: 'locationType',
                  type: 'radio',
                  defaultValue: 'coordinates',
                  options: [
                    { label: 'Search for Location', value: 'search' },
                    { label: 'Enter Coordinates', value: 'coordinates' },
                    { label: 'Use Destination', value: 'destination' },
                  ],
                },
                {
                  name: 'locationSearch',
                  type: 'text',
                  admin: {
                    placeholder: 'e.g., Eiffel Tower, Paris',
                    condition: (data, siblingData) => siblingData?.locationType === 'search',
                    description: 'Search for a place (we\'ll fetch coordinates)',
                    components: {
                      afterInput: ['@/components/admin/GeocodeLocationButton'],
                    },
                  },
                },
                {
                  name: 'destination',
                  type: 'relationship',
                  relationTo: 'destinations',
                  admin: {
                    condition: (data, siblingData) => siblingData?.locationType === 'destination',
                  },
                },
                {
                  name: 'coordinates',
                  type: 'group',
                  admin: {
                    condition: (data, siblingData) => siblingData?.locationType === 'coordinates',
                  },
                  fields: [
                    {
                      name: 'lat',
                      type: 'number',
                      required: true,
                      admin: {
                        step: 0.000001,
                      },
                    },
                    {
                      name: 'lng',
                      type: 'number',
                      required: true,
                      admin: {
                        step: 0.000001,
                      },
                    },
                  ],
                },
                {
                  name: 'address',
                  type: 'text',
                  admin: {
                    description: 'Address or location name for display',
                  },
                },
                {
                  name: 'media',
                  type: 'group',
                  fields: [
                    {
                      name: 'type',
                      type: 'radio',
                      defaultValue: 'none',
                      options: [
                        { label: 'None', value: 'none' },
                        { label: 'Image', value: 'image' },
                        { label: 'YouTube Video', value: 'youtube' },
                      ],
                    },
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      admin: {
                        condition: (data, siblingData) => siblingData?.type === 'image',
                      },
                    },
                    {
                      name: 'youtubeUrl',
                      type: 'text',
                      admin: {
                        placeholder: 'https://youtube.com/watch?v=...',
                        condition: (data, siblingData) => siblingData?.type === 'youtube',
                      },
                    },
                    {
                      name: 'imageCredit',
                      type: 'text',
                      admin: {
                        placeholder: 'Photo credit',
                        condition: (data, siblingData) => siblingData?.type === 'image',
                      },
                    },
                  ],
                },
                {
                  name: 'focusOptions',
                  type: 'group',
                  label: 'Focus Options',
                  fields: [
                    {
                      name: 'showFocus',
                      type: 'checkbox',
                      label: 'Show Focus Circle',
                      defaultValue: false,
                    },
                    {
                      name: 'focusRadius',
                      type: 'number',
                      label: 'Focus Radius (meters)',
                      defaultValue: 250,
                      min: 50,
                      max: 5000,
                      admin: {
                        condition: (data, siblingData) => siblingData?.showFocus,
                      },
                    },
                    {
                      name: 'showLocationMarker',
                      type: 'checkbox',
                      label: 'Show Location Marker',
                      defaultValue: true,
                    },
                  ],
                },
                {
                  name: 'cameraOptions',
                  type: 'group',
                  label: 'Camera Settings',
                  admin: {
                    description: 'Optional: Override automatic camera positioning',
                  },
                  fields: [
                    {
                      name: 'useCustomCamera',
                      type: 'checkbox',
                      label: 'Use Custom Camera Position',
                      defaultValue: false,
                    },
                    {
                      name: 'heading',
                      type: 'number',
                      admin: {
                        condition: (data, siblingData) => siblingData?.useCustomCamera,
                        description: 'Camera heading in degrees (0-360)',
                      },
                    },
                    {
                      name: 'pitch',
                      type: 'number',
                      admin: {
                        condition: (data, siblingData) => siblingData?.useCustomCamera,
                        description: 'Camera pitch in degrees (-90 to 90)',
                      },
                    },
                    {
                      name: 'roll',
                      type: 'number',
                      admin: {
                        condition: (data, siblingData) => siblingData?.useCustomCamera,
                        description: 'Camera roll in degrees',
                      },
                    },
                  ],
                },
                {
                  name: 'duration',
                  type: 'number',
                  label: 'Chapter Duration (seconds)',
                  defaultValue: 10,
                  min: 5,
                  max: 60,
                  admin: {
                    description: 'How long to stay on this chapter during autoplay',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Storytelling Settings',
          admin: {
            condition: (data) => data?.enable3DStorytelling,
          },
          fields: [
            {
              name: 'storytellingConfig',
              type: 'group',
              label: 'Display Settings',
              fields: [
                {
                  name: 'theme',
                  type: 'radio',
                  label: 'Theme',
                  defaultValue: 'dark',
                  options: [
                    { label: 'Dark', value: 'dark' },
                    { label: 'Light', value: 'light' },
                  ],
                },
                {
                  name: 'autoPlay',
                  type: 'checkbox',
                  label: 'Auto Play on Load',
                  defaultValue: false,
                },
                {
                  name: 'autoPlayDelay',
                  type: 'number',
                  label: 'Auto Play Delay Between Chapters (seconds)',
                  defaultValue: 2,
                  min: 1,
                  max: 10,
                  admin: {
                    condition: (data, siblingData) => siblingData?.autoPlay,
                  },
                },
                {
                  name: 'showNavigation',
                  type: 'checkbox',
                  label: 'Show Navigation Controls',
                  defaultValue: true,
                },
                {
                  name: 'showTimeline',
                  type: 'checkbox',
                  label: 'Show Timeline',
                  defaultValue: true,
                },
                {
                  name: 'transparentBackground',
                  type: 'checkbox',
                  label: 'Transparent Background',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
      ],
    },

    // Summary & Stats
    {
      name: 'summary',
      type: 'group',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'totalDays',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'totalChapters',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
      ],
    },

    {
      name: 'shareToken',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },

    ...slugField(),
  ],

  indexes: [
    // Unique slug
    {
      fields: ['slug'],
      unique: true,
    },
    // For filtering by status
    {
      fields: ['status'],
    },
    // For user's itineraries
    {
      fields: ['user', 'status'],
    },
    // For date-based queries
    {
      fields: ['travelDates.startDate'],
    },
    {
      fields: ['travelDates.endDate'],
    },
    // For filtering by travel preferences
    {
      fields: ['groupType', 'budgetRange'],
    },
    // For 3D storytelling feature
    {
      fields: ['enable3DStorytelling'],
    },
    // For share tokens
    {
      fields: ['shareToken'],
      unique: true,
      // Note: sparse option is not supported in Payload's index type
      // Null values will be handled by the application logic
    },
    // Compound index for common queries
    {
      fields: ['status', 'user', 'travelDates.startDate'],
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Calculate summary stats
        if (data.travelDates?.startDate && data.travelDates?.endDate) {
          const start = new Date(data.travelDates.startDate)
          const end = new Date(data.travelDates.endDate)
          const diffTime = Math.abs(end.getTime() - start.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
          
          if (!data.summary) data.summary = {}
          data.summary.totalDays = diffDays
          data.summary.totalChapters = data.storyChapters?.length || 0
        }

        // Generate share token if not exists
        if (!data.shareToken && operation === 'create') {
          data.shareToken = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15)
        }

        // Geocode locations if needed
        if (data.storyChapters && Array.isArray(data.storyChapters)) {
          for (const chapter of data.storyChapters) {
            if (chapter.locationType === 'search' && chapter.locationSearch && !chapter.coordinates) {
              // In a real implementation, you would call Google Geocoding API here
              // For now, we'll just set a flag that geocoding is needed
              chapter._needsGeocoding = true
            }
          }
        }

        return data
      },
    ],
  },
}

export default TravelItineraries