import type { Block } from 'payload'

export const WhatameshBlock: Block = {
  slug: 'whatamesh',
  interfaceName: 'WhatameshBlock',
  fields: [
    {
      name: 'colors',
      type: 'array',
      label: 'Gradient Colors',
      minRows: 2,
      maxRows: 6,
      defaultValue: [
        { color: '#000000' },
        { color: '#1a1a1a' },
        { color: '#2a2a2a' },
        { color: '#3a3a3a' },
      ],
      fields: [
        {
          name: 'color',
          type: 'text',
          label: 'Color (Hex)',
          required: true,
          validate: (value: unknown) => {
            const strValue = value as string
            if (!strValue) return 'Color is required'
            if (!/^#[0-9A-F]{6}$/i.test(strValue)) {
              return 'Please enter a valid hex color (e.g., #FF0000)'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'amplitude',
      type: 'number',
      label: 'Wave Amplitude',
      defaultValue: 320,
      min: 50,
      max: 500,
      admin: {
        step: 10,
      },
    },
    {
      name: 'speed',
      type: 'number',
      label: 'Animation Speed',
      defaultValue: 1,
      min: 0.1,
      max: 5,
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'darkenTop',
      type: 'checkbox',
      label: 'Darken Top',
      defaultValue: true,
    },
  ],
  labels: {
    plural: 'Whatamesh Backgrounds',
    singular: 'Whatamesh Background',
  },
}