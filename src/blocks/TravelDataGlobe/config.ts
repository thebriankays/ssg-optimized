import type { Block } from 'payload'

export const TravelDataGlobe: Block = {
  slug: 'travel-data-globe',
  labels: {
    singular: 'Travel Data Globe',
    plural: 'Travel Data Globes',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      defaultValue: 'Interactive Travel Data Globe',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Optional description text to display above the globe',
      },
    },
    {
      name: 'defaultView',
      type: 'select',
      label: 'Default View',
      options: [
        { label: 'Travel Advisories', value: 'advisories' },
        { label: 'Visa Requirements', value: 'visa' },
        { label: 'Michelin Restaurants', value: 'michelin' },
        { label: 'International Airports', value: 'airports' },
      ],
      defaultValue: 'advisories',
    },
    {
      name: 'globeSettings',
      type: 'group',
      label: 'Globe Settings',
      fields: [
        {
          name: 'autoRotate',
          type: 'checkbox',
          label: 'Auto Rotate',
          defaultValue: true,
        },
        {
          name: 'autoRotateSpeed',
          type: 'number',
          label: 'Auto Rotate Speed',
          min: 0,
          max: 5,
          defaultValue: 0.5,
          admin: {
            step: 0.1,
            description: 'Speed of automatic rotation',
          },
        },
        {
          name: 'atmosphereColor',
          type: 'text',
          label: 'Atmosphere Color',
          defaultValue: '#3386f4',
          admin: {
            description: 'Hex color for the globe atmosphere',
          },
        },
        {
          name: 'atmosphereAltitude',
          type: 'number',
          label: 'Atmosphere Altitude',
          min: 0,
          max: 1,
          defaultValue: 0.25,
          admin: {
            step: 0.05,
            description: 'Height of the atmosphere layer',
          },
        },
      ],
    },
    {
      name: 'glassSettings',
      type: 'group',
      label: 'Glass Effect Settings',
      fields: [
        {
          name: 'tint',
          type: 'text',
          label: 'Tint Color',
          defaultValue: '#000000',
          admin: {
            description: 'Glass tint color (hex format)',
          },
        },
        {
          name: 'opacity',
          type: 'number',
          label: 'Opacity',
          min: 0,
          max: 1,
          defaultValue: 0.8,
          admin: {
            step: 0.1,
          },
        },
        {
          name: 'blur',
          type: 'number',
          label: 'Blur Amount',
          min: 0,
          max: 20,
          defaultValue: 10,
          admin: {
            step: 1,
            description: 'Backdrop blur in pixels',
          },
        },
      ],
    },
    {
      name: 'dataSettings',
      type: 'group',
      label: 'Data Display Settings',
      fields: [
        {
          name: 'maxAirports',
          type: 'number',
          label: 'Max Airports to Display',
          defaultValue: 50,
          min: 10,
          max: 200,
          admin: {
            description: 'Limit number of airports shown for performance',
          },
        },
        {
          name: 'maxRestaurants',
          type: 'number',
          label: 'Max Restaurants to Display',
          defaultValue: 100,
          min: 10,
          max: 500,
          admin: {
            description: 'Limit number of restaurants shown for performance',
          },
        },
        {
          name: 'showOnlyThreeStars',
          type: 'checkbox',
          label: 'Show Only 3-Star Restaurants',
          defaultValue: false,
        },
      ],
    },
  ],
}