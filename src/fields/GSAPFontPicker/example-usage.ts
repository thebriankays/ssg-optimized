// Example usage in a collection

import type { CollectionConfig } from 'payload'

export const ExampleCollection: CollectionConfig = {
  slug: 'example-with-font-picker',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'typography',
      type: 'group',
      fields: [
        {
          name: 'headingFont',
          type: 'text',
          label: 'Heading Font',
          admin: {
            components: {
              Field: '@/fields/GSAPFontPicker/GSAPFontPicker#GSAPFontPicker',
            },
          },
        },
        {
          name: 'bodyFont',
          type: 'text',
          label: 'Body Font',
          admin: {
            components: {
              Field: '@/fields/GSAPFontPicker/GSAPFontPicker#GSAPFontPicker',
            },
          },
        },
      ],
    },
  ],
}