import type { Block } from 'payload'

export const ScrollingImagesBlock: Block = {
  slug: 'scrollingImages',
  interfaceName: 'ScrollingImagesBlock',
  fields: [
    {
      name: 'images',
      type: 'array',
      label: 'Images',
      minRows: 3,
      maxRows: 20,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Alt Text',
        },
      ],
    },
    {
      name: 'direction',
      type: 'select',
      label: 'Scroll Direction',
      defaultValue: 'horizontal',
      options: [
        {
          label: 'Horizontal',
          value: 'horizontal',
        },
        {
          label: 'Vertical',
          value: 'vertical',
        },
      ],
    },
    {
      name: 'speed',
      type: 'number',
      label: 'Scroll Speed',
      defaultValue: 1,
      min: 0.1,
      max: 5,
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'gap',
      type: 'number',
      label: 'Gap Between Images (px)',
      defaultValue: 20,
      min: 0,
      max: 100,
    },
    {
      name: 'autoScroll',
      type: 'checkbox',
      label: 'Auto Scroll',
      defaultValue: true,
    },
    {
      name: 'pauseOnHover',
      type: 'checkbox',
      label: 'Pause on Hover',
      defaultValue: true,
    },
  ],
  labels: {
    plural: 'Scrolling Images',
    singular: 'Scrolling Images',
  },
}