import type { Block } from 'payload'

export const Storytelling: Block = {
  slug: 'storytelling',
  labels: {
    singular: '3D Storytelling',
    plural: '3D Storytelling Blocks',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Story Details',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Story Title',
              required: true,
            },
            {
              name: 'date',
              type: 'text',
              label: 'Date/Period',
              admin: {
                description: 'e.g., "1967" or "Summer 2024"',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Story Description',
            },
            {
              name: 'createdBy',
              type: 'text',
              label: 'Author/Creator',
            },
            {
              name: 'coverImage',
              type: 'upload',
              label: 'Cover Image',
              relationTo: 'media',
            },
            {
              name: 'imageCredit',
              type: 'text',
              label: 'Cover Image Credit',
            },
          ],
        },
        {
          label: 'Chapters',
          fields: [
            {
              name: 'chapters',
              type: 'array',
              label: 'Story Chapters',
              minRows: 1,
              admin: {
                description: 'Add chapters to your story. Each chapter represents a location in your narrative.',
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Chapter Title',
                  required: true,
                },
                {
                  name: 'content',
                  type: 'textarea',
                  label: 'Chapter Content',
                  admin: {
                    description: 'The main text content for this chapter',
                  },
                },
                {
                  name: 'dateTime',
                  type: 'text',
                  label: 'Date/Time',
                  admin: {
                    description: 'e.g., "Aug 10-12 1967"',
                  },
                },
                {
                  name: 'location',
                  type: 'point',
                  label: 'Location',
                  required: true,
                  admin: {
                    description: 'The geographic location for this chapter',
                  },
                },
                {
                  name: 'address',
                  type: 'text',
                  label: 'Address/Place Name',
                  admin: {
                    description: 'e.g., "The Fillmore | 1805 Geary Blvd"',
                  },
                },
                {
                  name: 'chapterImage',
                  type: 'upload',
                  label: 'Chapter Image',
                  relationTo: 'media',
                },
                {
                  name: 'imageCredit',
                  type: 'text',
                  label: 'Image Credit',
                },
                {
                  type: 'collapsible',
                  label: 'Camera Settings',
                  fields: [
                    {
                      name: 'cameraZoom',
                      type: 'number',
                      label: 'Zoom Level',
                      defaultValue: 17,
                      min: 10,
                      max: 22,
                      admin: {
                        description: 'Map zoom level (10=far, 22=close)',
                      },
                    },
                    {
                      name: 'cameraTilt',
                      type: 'number',
                      label: 'Tilt (degrees)',
                      defaultValue: 65,
                      min: 0,
                      max: 80,
                      admin: {
                        description: 'Camera tilt angle (0=top-down, 80=oblique)',
                      },
                    },
                    {
                      name: 'cameraHeading',
                      type: 'number',
                      label: 'Heading (degrees)',
                      defaultValue: 0,
                      min: 0,
                      max: 360,
                      admin: {
                        description: 'Camera rotation (0=north, 90=east, 180=south, 270=west)',
                      },
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Focus Options',
                  fields: [
                    {
                      name: 'showLocationMarker',
                      type: 'checkbox',
                      label: 'Show Location Marker',
                      defaultValue: true,
                      admin: {
                        description: 'Display a pin at the exact location',
                      },
                    },
                    {
                      name: 'showFocusRadius',
                      type: 'checkbox',
                      label: 'Show Focus Radius',
                      defaultValue: false,
                      admin: {
                        description: 'Display a circular area highlight',
                      },
                    },
                    {
                      name: 'focusRadius',
                      type: 'number',
                      label: 'Focus Radius (meters)',
                      defaultValue: 3000,
                      min: 500,
                      max: 10000,
                      admin: {
                        description: 'Radius of the focus area',
                        condition: (data, siblingData) => siblingData?.showFocusRadius,
                        step: 500,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Appearance',
          fields: [
            {
              name: 'theme',
              type: 'radio',
              label: 'Theme',
              options: [
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ],
              defaultValue: 'dark',
            },
            {
              name: 'autoPlay',
              type: 'checkbox',
              label: 'Auto-play chapters',
              defaultValue: false,
              admin: {
                description: 'Automatically advance through chapters',
              },
            },
            {
              name: 'autoPlayDelay',
              type: 'number',
              label: 'Auto-play Delay (seconds)',
              defaultValue: 5,
              min: 3,
              max: 30,
              admin: {
                description: 'Time to stay on each chapter',
                condition: (data, siblingData) => siblingData?.autoPlay,
              },
            },
          ],
        },
      ],
    },
  ],
}
