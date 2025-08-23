import type { Block } from 'payload'

export const AreaExplorer: Block = {
  slug: 'area-explorer',
  labels: {
    singular: 'Area Explorer',
    plural: 'Area Explorers',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'googleMapsApiKey',
      type: 'text',
      label: 'Google Maps API Key',
      required: true,
      admin: {
        description: 'Your Google Maps API key with Maps JavaScript API and Map3D enabled',
      },
    },
    {
      name: 'mapSettings',
      type: 'group',
      label: 'Map Settings',
      fields: [
        {
          name: 'mapId',
          type: 'text',
          label: 'Map ID',
          required: true,
          admin: {
            description: 'Google Maps Map ID configured for 3D maps',
          },
        },
        {
          name: 'defaultLocation',
          type: 'group',
          label: 'Default Location',
          fields: [
            {
              name: 'lat',
              type: 'number',
              label: 'Latitude',
              required: true,
              defaultValue: 40.7128,
            },
            {
              name: 'lng',
              type: 'number',
              label: 'Longitude',
              required: true,
              defaultValue: -74.0060,
            },
            {
              name: 'altitude',
              type: 'number',
              label: 'Altitude (meters)',
              defaultValue: 1000,
              min: 0,
              max: 10000,
            },
            {
              name: 'heading',
              type: 'number',
              label: 'Heading (degrees)',
              defaultValue: 0,
              min: 0,
              max: 360,
            },
            {
              name: 'tilt',
              type: 'number',
              label: 'Tilt (degrees)',
              defaultValue: 60,
              min: 0,
              max: 90,
            },
            {
              name: 'range',
              type: 'number',
              label: 'Range (meters)',
              defaultValue: 2000,
              min: 100,
              max: 50000,
            },
          ],
        },
        {
          name: 'gestureHandling',
          type: 'select',
          label: 'Gesture Handling',
          options: [
            { label: 'Greedy', value: 'greedy' },
            { label: 'Cooperative', value: 'cooperative' },
            { label: 'None', value: 'none' },
            { label: 'Auto', value: 'auto' },
          ],
          defaultValue: 'greedy',
        },
      ],
    },
    {
      name: 'pois',
      type: 'array',
      label: 'Points of Interest',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
        {
          name: 'category',
          type: 'select',
          label: 'Category',
          options: [
            { label: 'Landmark', value: 'landmark' },
            { label: 'Restaurant', value: 'restaurant' },
            { label: 'Hotel', value: 'hotel' },
            { label: 'Museum', value: 'museum' },
            { label: 'Park', value: 'park' },
            { label: 'Shopping', value: 'shopping' },
            { label: 'Entertainment', value: 'entertainment' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'location',
          type: 'group',
          label: 'Location',
          fields: [
            {
              name: 'lat',
              type: 'number',
              label: 'Latitude',
              required: true,
            },
            {
              name: 'lng',
              type: 'number',
              label: 'Longitude',
              required: true,
            },
            {
              name: 'altitude',
              type: 'number',
              label: 'Altitude',
              defaultValue: 0,
            },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Image',
          relationTo: 'media',
        },
        {
          name: 'icon',
          type: 'text',
          label: '3D Model URL',
          admin: {
            description: 'URL to a 3D model file (GLTF/GLB) for the marker',
          },
        },
      ],
    },
    {
      name: 'tours',
      type: 'array',
      label: 'Guided Tours',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Tour Name',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Tour Description',
        },
        {
          name: 'waypoints',
          type: 'array',
          label: 'Tour Waypoints',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Waypoint Name',
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Waypoint Description',
            },
            {
              name: 'location',
              type: 'group',
              label: 'Location',
              fields: [
                {
                  name: 'lat',
                  type: 'number',
                  label: 'Latitude',
                  required: true,
                },
                {
                  name: 'lng',
                  type: 'number',
                  label: 'Longitude',
                  required: true,
                },
                {
                  name: 'altitude',
                  type: 'number',
                  label: 'Altitude',
                  defaultValue: 500,
                },
                {
                  name: 'heading',
                  type: 'number',
                  label: 'Heading',
                  defaultValue: 0,
                },
                {
                  name: 'tilt',
                  type: 'number',
                  label: 'Tilt',
                  defaultValue: 60,
                },
                {
                  name: 'range',
                  type: 'number',
                  label: 'Range',
                  defaultValue: 1000,
                },
              ],
            },
            {
              name: 'duration',
              type: 'number',
              label: 'Duration (seconds)',
              defaultValue: 5,
              min: 1,
              max: 60,
              admin: {
                description: 'How long to stay at this waypoint',
              },
            },
            {
              name: 'transitionDuration',
              type: 'number',
              label: 'Transition Duration (seconds)',
              defaultValue: 3,
              min: 1,
              max: 30,
              admin: {
                description: 'How long to transition to the next waypoint',
              },
            },
          ],
        },
      ],
    },
  ],
}