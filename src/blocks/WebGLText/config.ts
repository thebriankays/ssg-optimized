import type { Block } from 'payload'

export const WebGLText: Block = {
  slug: 'webgl-text',
  labels: {
    singular: 'WebGL Text',
    plural: 'WebGL Texts',
  },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      label: 'Text Content',
      required: true,
      admin: {
        description: 'The text to display in 3D',
      },
    },
    {
      name: 'typography',
      type: 'group',
      label: 'Typography Settings',
      fields: [
        {
          name: 'font',
          type: 'select',
          label: 'Font',
          options: [
            { label: 'Inter Bold', value: '/fonts/inter-bold.woff' },
            { label: 'Inter Regular', value: '/fonts/inter-regular.woff' },
            { label: 'Monument Extended', value: '/fonts/monument-extended.woff' },
            { label: 'FK Grotesk', value: '/fonts/fk-grotesk.woff' },
          ],
          defaultValue: '/fonts/inter-bold.woff',
        },
        {
          name: 'fontSize',
          type: 'number',
          label: 'Font Size',
          defaultValue: 1,
          min: 0.1,
          max: 10,
          admin: {
            step: 0.1,
          },
        },
        {
          name: 'letterSpacing',
          type: 'number',
          label: 'Letter Spacing',
          defaultValue: 0,
          min: -0.5,
          max: 1,
          admin: {
            step: 0.05,
          },
        },
        {
          name: 'lineHeight',
          type: 'number',
          label: 'Line Height',
          defaultValue: 1.2,
          min: 0.8,
          max: 2,
          admin: {
            step: 0.1,
          },
        },
        {
          name: 'maxWidth',
          type: 'number',
          label: 'Max Width',
          admin: {
            description: 'Maximum width before text wraps',
          },
        },
        {
          name: 'textAlign',
          type: 'select',
          label: 'Text Align',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
            { label: 'Justify', value: 'justify' },
          ],
          defaultValue: 'center',
        },
      ],
    },
    {
      name: 'appearance',
      type: 'group',
      label: 'Appearance',
      fields: [
        {
          name: 'color',
          type: 'text',
          label: 'Color',
          defaultValue: '#ffffff',
          admin: {
            description: 'Text color (hex format)',
          },
        },
        {
          name: 'emissive',
          type: 'text',
          label: 'Emissive Color',
          admin: {
            description: 'Glow color (hex format)',
          },
        },
        {
          name: 'emissiveIntensity',
          type: 'number',
          label: 'Emissive Intensity',
          defaultValue: 0,
          min: 0,
          max: 2,
          admin: {
            step: 0.1,
          },
        },
        {
          name: 'material',
          type: 'select',
          label: 'Material Type',
          options: [
            { label: 'Basic', value: 'basic' },
            { label: 'Standard', value: 'standard' },
            { label: 'Physical', value: 'physical' },
          ],
          defaultValue: 'standard',
        },
        {
          name: 'metalness',
          type: 'number',
          label: 'Metalness',
          defaultValue: 0,
          min: 0,
          max: 1,
          admin: {
            step: 0.1,
            condition: (data, siblingData) => 
              ['standard', 'physical'].includes(siblingData?.material),
          },
        },
        {
          name: 'roughness',
          type: 'number',
          label: 'Roughness',
          defaultValue: 0.5,
          min: 0,
          max: 1,
          admin: {
            step: 0.1,
            condition: (data, siblingData) => 
              ['standard', 'physical'].includes(siblingData?.material),
          },
        },
      ],
    },
    {
      name: 'outline',
      type: 'group',
      label: 'Outline/Stroke',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enable Outline',
          defaultValue: false,
        },
        {
          name: 'outlineColor',
          type: 'text',
          label: 'Outline Color',
          defaultValue: '#000000',
          admin: {
            condition: (data, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'outlineWidth',
          type: 'number',
          label: 'Outline Width',
          defaultValue: 0.1,
          min: 0,
          max: 1,
          admin: {
            step: 0.05,
            condition: (data, siblingData) => siblingData?.enabled,
          },
        },
        {
          name: 'outlineOpacity',
          type: 'number',
          label: 'Outline Opacity',
          defaultValue: 1,
          min: 0,
          max: 1,
          admin: {
            step: 0.1,
            condition: (data, siblingData) => siblingData?.enabled,
          },
        },
      ],
    },
    {
      name: 'animation',
      type: 'group',
      label: 'Animation',
      fields: [
        {
          name: 'type',
          type: 'select',
          label: 'Animation Type',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Typewriter', value: 'typewriter' },
            { label: 'Fade In', value: 'fade' },
            { label: 'Wave', value: 'wave' },
            { label: 'Glitch', value: 'glitch' },
          ],
          defaultValue: 'none',
        },
        {
          name: 'duration',
          type: 'number',
          label: 'Duration (ms)',
          defaultValue: 1000,
          min: 100,
          max: 10000,
          admin: {
            step: 100,
            condition: (data, siblingData) => siblingData?.type !== 'none',
          },
        },
        {
          name: 'delay',
          type: 'number',
          label: 'Delay (ms)',
          defaultValue: 0,
          min: 0,
          max: 5000,
          admin: {
            step: 100,
            condition: (data, siblingData) => siblingData?.type !== 'none',
          },
        },
        {
          name: 'stagger',
          type: 'number',
          label: 'Stagger',
          defaultValue: 0.1,
          min: 0,
          max: 1,
          admin: {
            step: 0.05,
            condition: (data, siblingData) => siblingData?.type === 'wave',
            description: 'Delay between each character animation',
          },
        },
      ],
    },
    {
      name: 'transform',
      type: 'group',
      label: '3D Transform',
      fields: [
        {
          name: 'position',
          type: 'group',
          label: 'Position',
          fields: [
            {
              name: 'x',
              type: 'number',
              label: 'X',
              defaultValue: 0,
            },
            {
              name: 'y',
              type: 'number',
              label: 'Y',
              defaultValue: 0,
            },
            {
              name: 'z',
              type: 'number',
              label: 'Z',
              defaultValue: 0,
            },
          ],
        },
        {
          name: 'rotation',
          type: 'group',
          label: 'Rotation (degrees)',
          fields: [
            {
              name: 'x',
              type: 'number',
              label: 'X',
              defaultValue: 0,
            },
            {
              name: 'y',
              type: 'number',
              label: 'Y',
              defaultValue: 0,
            },
            {
              name: 'z',
              type: 'number',
              label: 'Z',
              defaultValue: 0,
            },
          ],
        },
        {
          name: 'scale',
          type: 'number',
          label: 'Scale',
          defaultValue: 1,
          min: 0.1,
          max: 10,
          admin: {
            step: 0.1,
          },
        },
      ],
    },
    {
      name: 'layout',
      type: 'group',
      label: 'Layout Settings',
      fields: [
        {
          name: 'height',
          type: 'text',
          label: 'Container Height',
          defaultValue: '400px',
          admin: {
            description: 'CSS height value (e.g., 400px, 50vh)',
          },
        },
        {
          name: 'fullWidth',
          type: 'checkbox',
          label: 'Full Width',
          defaultValue: true,
        },
        {
          name: 'backgroundColor',
          type: 'text',
          label: 'Background Color',
          defaultValue: 'transparent',
        },
      ],
    },
  ],
}