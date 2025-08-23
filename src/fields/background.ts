import { Field } from 'payload'
import { colorPickerField } from './ColorPicker/ColorPicker'

interface BackgroundData {
  backgroundType?: 'color' | 'transparent' | 'image'
  [key: string]: unknown
}

export const backgroundFields: Field[] = [
  {
    name: 'background',
    type: 'group',
    label: 'Background',
    fields: [
      {
        name: 'backgroundType',
        type: 'radio',
        label: 'Background Type',
        dbName: 'type',
        options: [
          {
            label: 'Color',
            value: 'color',
          },
          {
            label: 'Transparent',
            value: 'transparent',
          },
          {
            label: 'Image',
            value: 'image',
          },
        ],
        defaultValue: 'transparent',
        admin: {
          layout: 'horizontal',
          description: 'Select the type of background for this block',
        },
      },
      colorPickerField({
        name: 'backgroundColor',
        label: 'Background Color',
        admin: {
          condition: (data: BackgroundData, siblingData: BackgroundData) =>
            siblingData?.backgroundType === 'color',
          description: 'Select a background color for the entire component',
        },
      }),
      {
        name: 'backgroundImage',
        type: 'upload',
        label: 'Background Image',
        relationTo: 'media',
        admin: {
          condition: (data: BackgroundData, siblingData: BackgroundData) =>
            siblingData?.backgroundType === 'image',
          description: 'Select a background image for the entire component',
        },
      },
    ],
  },
]