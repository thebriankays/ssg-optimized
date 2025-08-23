import type { Block } from 'payload'

export const Storytelling: Block = {
  slug: 'storytelling',
  labels: {
    singular: 'Storytelling',
    plural: 'Storytelling Blocks',
  },
  fields: [
    {
      name: 'sections',
      type: 'array',
      label: 'Story Sections',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'type',
          type: 'select',
          label: 'Section Type',
          required: true,
          options: [
            { label: 'Intro', value: 'intro' },
            { label: 'Chapter', value: 'chapter' },
            { label: 'Quote', value: 'quote' },
            { label: 'Parallax', value: 'parallax' },
            { label: 'Outro', value: 'outro' },
          ],
          defaultValue: 'chapter',
        },
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          admin: {
            condition: (data, siblingData) => ['intro', 'chapter', 'outro'].includes(siblingData?.type),
          },
        },
        {
          name: 'subtitle',
          type: 'text',
          label: 'Subtitle',
          admin: {
            condition: (data, siblingData) => ['intro', 'quote'].includes(siblingData?.type),
          },
        },
        {
          name: 'content',
          type: 'richText',
          label: 'Content',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'chapter',
          },
        },
        {
          name: 'quote',
          type: 'textarea',
          label: 'Quote Text',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'quote',
          },
        },
        {
          name: 'simpleContent',
          type: 'textarea',
          label: 'Content',
          admin: {
            condition: (data, siblingData) => ['intro', 'outro'].includes(siblingData?.type),
          },
        },
        {
          name: 'media',
          type: 'group',
          label: 'Media',
          fields: [
            {
              name: 'type',
              type: 'select',
              label: 'Media Type',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Image', value: 'image' },
                { label: 'Video', value: 'video' },
                { label: 'WebGL', value: 'webgl' },
              ],
              defaultValue: 'none',
            },
            {
              name: 'image',
              type: 'upload',
              label: 'Image',
              relationTo: 'media',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'image',
              },
            },
            {
              name: 'video',
              type: 'upload',
              label: 'Video',
              relationTo: 'media',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'video',
              },
            },
            {
              name: 'webglComponent',
              type: 'select',
              label: 'WebGL Component',
              options: [
                { label: 'Spiral', value: 'spiral' },
                { label: 'Particles', value: 'particles' },
                { label: 'Waves', value: 'waves' },
              ],
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'webgl',
              },
            },
            {
              name: 'webglProps',
              type: 'json',
              label: 'WebGL Props',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'webgl',
                description: 'JSON object with props to pass to the WebGL component',
              },
            },
          ],
        },
        {
          name: 'layout',
          type: 'select',
          label: 'Layout',
          options: [
            { label: 'Center', value: 'center' },
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
            { label: 'Fullscreen', value: 'fullscreen' },
          ],
          defaultValue: 'center',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'chapter',
          },
        },
        {
          name: 'animation',
          type: 'group',
          label: 'Animation Settings',
          fields: [
            {
              name: 'type',
              type: 'select',
              label: 'Animation Type',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Fade', value: 'fade' },
                { label: 'Slide', value: 'slide' },
                { label: 'Scale', value: 'scale' },
                { label: 'Parallax', value: 'parallax' },
              ],
              defaultValue: 'fade',
            },
            {
              name: 'duration',
              type: 'number',
              label: 'Duration (seconds)',
              defaultValue: 1,
              min: 0.1,
              max: 5,
              admin: {
                step: 0.1,
              },
            },
            {
              name: 'delay',
              type: 'number',
              label: 'Delay (seconds)',
              defaultValue: 0,
              min: 0,
              max: 2,
              admin: {
                step: 0.1,
              },
            },
          ],
        },
        {
          name: 'background',
          type: 'group',
          label: 'Background Settings',
          fields: [
            {
              name: 'color',
              type: 'text',
              label: 'Background Color',
              admin: {
                description: 'CSS color value (e.g., #000000, rgba(0,0,0,0.5))',
              },
            },
            {
              name: 'gradient',
              type: 'text',
              label: 'Background Gradient',
              admin: {
                description: 'CSS gradient (e.g., linear-gradient(to bottom, #000, #333))',
              },
            },
            {
              name: 'image',
              type: 'upload',
              label: 'Background Image',
              relationTo: 'media',
            },
            {
              name: 'blur',
              type: 'number',
              label: 'Background Blur (px)',
              min: 0,
              max: 20,
              defaultValue: 0,
            },
            {
              name: 'overlay',
              type: 'text',
              label: 'Overlay Color',
              admin: {
                description: 'Color overlay for background image',
              },
            },
          ],
        },
      ],
    },
  ],
}