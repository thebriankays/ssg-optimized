import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'webgl',
      type: 'group',
      label: 'WebGL Settings',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enable WebGL',
          defaultValue: true,
          admin: {
            description: 'Enable WebGL features globally',
          },
        },
        {
          name: 'quality',
          type: 'select',
          label: 'Quality',
          options: [
            { label: 'Auto', value: 'auto' },
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
          ],
          defaultValue: 'auto',
        },
        {
          name: 'background',
          type: 'group',
          label: 'Background Options',
          fields: [
            {
              name: 'type',
              type: 'select',
              label: 'Background Type',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Gradient', value: 'gradient' },
                { label: 'Particles', value: 'particles' },
                { label: 'Fluid', value: 'fluid' },
                { label: 'Whatamesh', value: 'whatamesh' },
              ],
              defaultValue: 'whatamesh',
            },
            {
              name: 'color1',
              type: 'text',
              label: 'Color 1',
              defaultValue: '#000000',
              admin: {
                description: 'Primary background color (hex format)',
              },
            },
            {
              name: 'color2',
              type: 'text',
              label: 'Color 2',
              defaultValue: '#1a1a1a',
              admin: {
                description: 'Secondary background color (hex format)',
              },
            },
            {
              name: 'color3',
              type: 'text',
              label: 'Color 3',
              defaultValue: '#2a2a2a',
              admin: {
                description: 'Tertiary background color (hex format)',
              },
            },
            {
              name: 'color4',
              type: 'text',
              label: 'Color 4',
              defaultValue: '#3a3a3a',
              admin: {
                description: 'Quaternary background color (hex format)',
              },
            },
            {
              name: 'intensity',
              type: 'number',
              label: 'Intensity',
              min: 0,
              max: 1,
              defaultValue: 0.5,
              admin: {
                step: 0.1,
                description: 'Background effect intensity',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'animations',
      type: 'group',
      label: 'Animation Settings',
      fields: [
        {
          name: 'smoothScroll',
          type: 'checkbox',
          label: 'Smooth Scroll',
          defaultValue: true,
        },
        {
          name: 'pageTransitions',
          type: 'checkbox',
          label: 'Page Transitions',
          defaultValue: true,
        },
        {
          name: 'reducedMotion',
          type: 'checkbox',
          label: 'Respect Reduced Motion',
          defaultValue: true,
          admin: {
            description: 'Respect prefers-reduced-motion setting',
          },
        },
      ],
    },
    {
      name: 'glass',
      type: 'group',
      label: 'Glass Design Settings',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enable Glass Effects',
          defaultValue: true,
        },
        {
          name: 'variant',
          type: 'select',
          label: 'Default Glass Variant',
          options: [
            { label: 'Clear', value: 'clear' },
            { label: 'Frosted', value: 'frosted' },
            { label: 'Refractive', value: 'refractive' },
            { label: 'Holographic', value: 'holographic' },
            { label: 'Liquid', value: 'liquid' },
          ],
          defaultValue: 'frosted',
        },
        {
          name: 'webglOverlay',
          type: 'group',
          label: 'WebGL Glass Overlay',
          admin: {
            description: 'Configure the global WebGL glass overlay effect that enhances the entire interface',
          },
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              label: 'Enable WebGL Glass Overlay',
              defaultValue: true,
              admin: {
                description: 'Adds a liquid glass distortion effect over the entire canvas',
              },
            },
            {
              name: 'intensity',
              type: 'number',
              label: 'Intensity',
              min: 0,
              max: 1,
              defaultValue: 0.3,
              admin: {
                step: 0.05,
                description: 'Overall intensity of the glass effect (0 = off, 1 = maximum)',
              },
            },
            {
              name: 'speed',
              type: 'number',
              label: 'Animation Speed',
              min: 0,
              max: 2,
              defaultValue: 0.2,
              admin: {
                step: 0.1,
                description: 'Speed of the glass animation',
              },
            },
            {
              name: 'distortion',
              type: 'number',
              label: 'Distortion Amount',
              min: 0,
              max: 5,
              defaultValue: 1.2,
              admin: {
                step: 0.1,
                description: 'Amount of liquid distortion',
              },
            },
            {
              name: 'frequency',
              type: 'number',
              label: 'Wave Frequency',
              min: 0.5,
              max: 10,
              defaultValue: 2.0,
              admin: {
                step: 0.5,
                description: 'Frequency of the distortion waves',
              },
            },
            {
              name: 'amplitude',
              type: 'number',
              label: 'Wave Amplitude',
              min: 0,
              max: 0.1,
              defaultValue: 0.015,
              admin: {
                step: 0.005,
                description: 'Amplitude of the distortion waves',
              },
            },
            {
              name: 'brightness',
              type: 'number',
              label: 'Brightness',
              min: 0.5,
              max: 1.5,
              defaultValue: 1.02,
              admin: {
                step: 0.02,
                description: 'Brightness adjustment',
              },
            },
            {
              name: 'contrast',
              type: 'number',
              label: 'Contrast',
              min: 0.5,
              max: 1.5,
              defaultValue: 1.02,
              admin: {
                step: 0.02,
                description: 'Contrast adjustment',
              },
            },
            {
              name: 'followMouse',
              type: 'checkbox',
              label: 'Follow Mouse',
              defaultValue: true,
              admin: {
                description: 'Glass distortion follows mouse movement',
              },
            },
          ],
        },
      ],
    },
  ],
}