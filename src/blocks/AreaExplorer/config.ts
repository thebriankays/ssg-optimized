import type { Block } from 'payload'

export const AreaExplorer: Block = {
  slug: 'area-explorer',
  labels: {
    singular: 'Area Explorer',
    plural: 'Area Explorers',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Location',
          fields: [
            {
              name: 'locationName',
              type: 'text',
              label: 'Location Name',
              defaultValue: 'Area Explorer',
            },
            {
              name: 'locationDescription',
              type: 'textarea',
              label: 'Location Description',
            },
            {
              name: 'location',
              type: 'point',
              label: 'Starting Location',
              admin: {
                description: 'Latitude and longitude for the initial map center (default: NYC)',
              },
            },
          ],
        },
        {
          label: 'Camera',
          fields: [
            {
              name: 'cameraOrbitType',
              type: 'radio',
              label: 'Camera Orbit Type',
              options: [
                {
                  label: 'Fixed Orbit - Circular orbit at fixed height',
                  value: 'fixed-orbit',
                },
                {
                  label: 'Dynamic Orbit - Sine wave trajectory with varying height',
                  value: 'dynamic-orbit',
                },
              ],
              defaultValue: 'fixed-orbit',
            },
            {
              name: 'cameraSpeed',
              type: 'number',
              label: 'Camera Speed (RPM)',
              defaultValue: 2.2,
              min: 0.5,
              max: 10,
              admin: {
                description: 'Revolutions per minute for auto-orbit',
                step: 0.1,
              },
            },
          ],
        },
        {
          label: 'Points of Interest',
          fields: [
            {
              name: 'poiTypes',
              type: 'select',
              label: 'POI Types',
              hasMany: true,
              options: [
                { label: 'Tourist Attraction', value: 'tourist_attraction' },
                { label: 'Restaurant', value: 'restaurant' },
                { label: 'Cafe', value: 'cafe' },
                { label: 'Bar', value: 'bar' },
                { label: 'Lodging', value: 'lodging' },
                { label: 'Museum', value: 'museum' },
                { label: 'Park', value: 'park' },
                { label: 'Shopping Mall', value: 'shopping_mall' },
                { label: 'Movie Theater', value: 'movie_theater' },
                { label: 'Parking', value: 'parking' },
                { label: 'Bus Station', value: 'bus_station' },
                { label: 'School', value: 'school' },
                { label: 'Hospital', value: 'hospital' },
                { label: 'Bank', value: 'bank' },
                { label: 'ATM', value: 'atm' },
                { label: 'Gas Station', value: 'gas_station' },
                { label: 'Pharmacy', value: 'pharmacy' },
                { label: 'Gym', value: 'gym' },
                { label: 'Spa', value: 'spa' },
              ],
              defaultValue: ['tourist_attraction', 'restaurant', 'cafe'],
              admin: {
                description: 'Types of places to display on the map',
              },
            },
            {
              name: 'poiDensity',
              type: 'number',
              label: 'POI Density',
              defaultValue: 40,
              min: 10,
              max: 100,
              admin: {
                description: 'Maximum number of POIs to display',
              },
            },
            {
              name: 'poiSearchRadius',
              type: 'number',
              label: 'Search Radius (meters)',
              defaultValue: 1500,
              min: 500,
              max: 10000,
              admin: {
                description: 'Radius in meters to search for POIs',
                step: 100,
              },
            },
          ],
        },
      ],
    },
  ],
}
