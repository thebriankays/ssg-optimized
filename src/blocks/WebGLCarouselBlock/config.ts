import type { Block } from 'payload'

export const WebGLCarouselBlock: Block = {
  slug: 'webglCarousel',
  interfaceName: 'WebGLCarouselBlock',
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Carousel Items',
      minRows: 1,
      maxRows: 20,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Title',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
      ],
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      label: 'Autoplay',
      defaultValue: true,
    },
    {
      name: 'autoplaySpeed',
      type: 'number',
      label: 'Autoplay Speed (seconds)',
      defaultValue: 5,
      min: 1,
      max: 10,
      admin: {
        condition: (data) => data?.autoplay === true,
      },
    },
    {
      name: 'variant',
      type: 'select',
      label: 'Style Variant',
      defaultValue: 'default',
      options: [
        {
          label: 'Default',
          value: 'default',
        },
        {
          label: 'Cards',
          value: 'cards',
        },
        {
          label: 'Fullscreen',
          value: 'fullscreen',
        },
      ],
    },
    {
      name: 'showIndicators',
      type: 'checkbox',
      label: 'Show Indicators',
      defaultValue: true,
    },
    {
      name: 'showArrows',
      type: 'checkbox',
      label: 'Show Navigation Arrows',
      defaultValue: true,
    },
  ],
  labels: {
    plural: 'WebGL Carousels',
    singular: 'WebGL Carousel',
  },
}