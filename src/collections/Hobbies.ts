import type { CollectionConfig } from 'payload'
import { localAgenda } from '../lib/access'
import { HOBBIES, HOBBY_COLORS, normalizeHobbyName } from '../lib/hobbies'

export const Hobbies: CollectionConfig = {
  slug: 'hobbies',
  admin: { useAsTitle: 'label', defaultColumns: ['label', 'color'] },
  access: {
    read: localAgenda,
    create: localAgenda,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      maxLength: 60,
      hooks: {
        beforeValidate: [
          ({ value }) =>
            typeof value === 'string'
              ? value.trim().replace(/\s+/g, ' ')
              : value,
        ],
      },
      validate: (value: string | null | undefined) => {
        if (!value?.trim() || value.length > 60)
          return 'Vul een hobbynaam van maximaal 60 tekens in.'
        if (
          HOBBIES.some(
            (hobby) =>
              normalizeHobbyName(hobby.label) === normalizeHobbyName(value),
          )
        )
          return 'Deze hobby bestaat al.'
        return true
      },
    },
    {
      name: 'value',
      type: 'text',
      required: true,
      unique: true,
      admin: { hidden: true },
      hooks: {
        beforeValidate: [
          ({ siblingData }) =>
            `custom-${normalizeHobbyName(String(siblingData.label || ''))}`,
        ],
      },
    },
    {
      name: 'color',
      type: 'select',
      required: true,
      options: HOBBY_COLORS.map(({ value, label }) => ({ value, label })),
    },
  ],
}
