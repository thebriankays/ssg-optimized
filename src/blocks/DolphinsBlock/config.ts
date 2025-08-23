import type { Block } from 'payload'

export const DolphinsBlock: Block = {
  slug: 'dolphins',
  interfaceName: 'DolphinsBlock',
  fields: [
    {
      name: 'showWater',
      type: 'checkbox',
      label: 'Show Water',
      defaultValue: true,
    },
    {
      name: 'showSky',
      type: 'checkbox',
      label: 'Show Sky',
      defaultValue: true,
    },
    {
      name: 'dolphinCount',
      type: 'number',
      label: 'Number of Dolphins',
      defaultValue: 3,
      min: 1,
      max: 5,
    },
    {
      name: 'animationSpeed',
      type: 'number',
      label: 'Animation Speed',
      defaultValue: 1,
      min: 0.1,
      max: 3,
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'waterColor',
      type: 'text',
      label: 'Water Color (Hex)',
      defaultValue: '#001e0f',
    },
    {
      name: 'skyColor',
      type: 'text',
      label: 'Sky Color (Hex)',
      defaultValue: '#87CEEB',
    },
  ],
  labels: {
    plural: 'Dolphins Scenes',
    singular: 'Dolphins Scene',
  },
}