import type { Block } from 'payload'

export const Background: Block = {
  slug: 'background',
  labels: {
    singular: 'Background',
    plural: 'Backgrounds',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      label: 'Background Type',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Gradient Mesh (Whatamesh)', value: 'whatamesh' },
        { label: 'Simple Gradient', value: 'gradient' },
        { label: 'Particles', value: 'particles' },
        { label: 'Fluid', value: 'fluid' },
      ],
      defaultValue: 'whatamesh',
      required: true,
    },
    {
      name: 'colors',
      type: 'group',
      label: 'Color Settings',
      fields: [
        {
          name: 'color1',
          type: 'text',
          label: 'Primary Color',
          defaultValue: '#c3e4ff',
          admin: {
            description: 'Hex color format (e.g., #c3e4ff)',
          },
        },
        {
          name: 'color2',
          type: 'text',
          label: 'Secondary Color',
          defaultValue: '#6ec3f4',
          admin: {
            description: 'Hex color format (e.g., #6ec3f4)',
          },
        },
        {
          name: 'color3',
          type: 'text',
          label: 'Tertiary Color',
          defaultValue: '#eae2ff',
          admin: {
            description: 'Hex color format (e.g., #eae2ff)',
          },
        },
        {
          name: 'color4',
          type: 'text',
          label: 'Quaternary Color',
          defaultValue: '#b9beff',
          admin: {
            description: 'Hex color format (e.g., #b9beff)',
          },
        },
      ],
    },
    {
      name: 'intensity',
      type: 'number',
      label: 'Effect Intensity',
      min: 0,
      max: 1,
      defaultValue: 0.5,
      admin: {
        step: 0.1,
        description: 'Controls the strength of the background effect',
      },
    },
    {
      name: 'animationSpeed',
      type: 'number',
      label: 'Animation Speed',
      min: 0,
      max: 5,
      defaultValue: 1,
      admin: {
        step: 0.1,
        description: 'Speed multiplier for animations',
      },
    },
    {
      name: 'fullScreen',
      type: 'checkbox',
      label: 'Full Screen',
      defaultValue: true,
      admin: {
        description: 'Make background cover the entire viewport',
      },
    },
    {
      name: 'fixed',
      type: 'checkbox',
      label: 'Fixed Position',
      defaultValue: true,
      admin: {
        description: 'Fix background to viewport (parallax effect)',
      },
    },
  ],
}