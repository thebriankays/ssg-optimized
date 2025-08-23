import type { Block } from 'payload'
import { backgroundFields } from '@/fields/background'
import { colorPickerField } from '@/fields/ColorPicker/ColorPicker'

export const DestinationDetailBlockConfig: Block = {
  slug: 'destinationDetailBlock',
  dbName: 'ddb',
  imageURL: '/components/destinationdetailblock.png',
  labels: {
    singular: 'Destination Detail Block',
    plural: 'Destination Detail Blocks',
  },
  admin: {
    group: 'Destination Blocks',
  },
  fields: [
    ...backgroundFields,
    {
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      required: true,
      admin: {
        description: 'Select the destination to display details for',
      },
    },
    {
      name: 'flagSettings',
      type: 'group',
      label: 'Flag Animation Settings',
      fields: [
        {
          name: 'flagImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Override the destination flag image (optional)',
          },
        },
        {
          name: 'animationSpeed',
          type: 'number',
          defaultValue: 6,
          min: 0,
          max: 20,
          admin: {
            description: 'Speed of the flag animation (0-20)',
          },
        },
        {
          name: 'wireframe',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Show wireframe mode',
          },
        },
        {
          name: 'segments',
          type: 'number',
          defaultValue: 64,
          min: 8,
          max: 256,
          admin: {
            description: 'Number of segments for flag geometry (8-256)',
          },
        },
        {
          name: 'frequencyX',
          type: 'number',
          defaultValue: 5,
          min: 0,
          max: 12,
          admin: {
            description: 'Wave frequency X (0-12)',
          },
        },
        {
          name: 'frequencyY',
          type: 'number',
          defaultValue: 3,
          min: 0,
          max: 12,
          admin: {
            description: 'Wave frequency Y (0-12)',
          },
        },
        {
          name: 'strength',
          type: 'number',
          defaultValue: 0.2,
          min: 0.05,
          max: 0.3,
          admin: {
            description: 'Wave strength (0.05-0.3)',
          },
        },
        {
          name: 'showControls',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Show interactive controls overlay',
          },
        },
      ],
    },
    {
      name: 'customTitle',
      type: 'text',
      admin: {
        description: 'Optional custom title (defaults to "Quick Look")',
      },
    },
    colorPickerField({
      name: 'textColor',
      label: 'Field Content Text Color',
      admin: {
        description: 'Text color for field values and content',
      },
    }),
    {
      name: 'quickLookText',
      type: 'text',
      defaultValue: 'Quick Look',
      admin: {
        description: 'Custom text for the section title (defaults to "Quick Look")',
      },
    },
    colorPickerField({
      name: 'quickLookColor',
      label: 'Section Title Color',
      admin: {
        description: 'Color for the "Quick Look" section title',
      },
    }),
    colorPickerField({
      name: 'destinationTitleColor',
      label: 'Destination Title Color',
      admin: {
        description: 'Color for the destination name (e.g., "Montego Bay, Jamaica")',
      },
    }),
    colorPickerField({
      name: 'fieldLabelsColor',
      label: 'Field Labels Color',
      admin: {
        description: 'Color for field labels (Country, Capital, etc.)',
      },
    }),
    colorPickerField({
      name: 'separatorLinesColor',
      label: 'Separator Lines Color',
      admin: {
        description: 'Color for the lines between fields',
      },
    }),
  ],
  interfaceName: 'DestinationDetailBlock',
}

// Export with the original name for backward compatibility
export const DestinationDetailBlock = DestinationDetailBlockConfig