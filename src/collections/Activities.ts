import type { CollectionConfig, PayloadRequest } from 'payload'
import { HOBBIES } from '../lib/hobbies'
import { localAgenda } from '../lib/access'

export const Activities: CollectionConfig = {
  slug: 'activities',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'hobby'],
  },
  access: {
    read: localAgenda,
    create: localAgenda,
    update: localAgenda,
    delete: localAgenda,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 120,
      validate: (value: string | null | undefined) =>
        Boolean(value?.trim()) || 'Vul een titel in.',
      hooks: {
        beforeValidate: [
          ({ value }) => (typeof value === 'string' ? value.trim() : value),
        ],
      },
    },
    {
      name: 'startsAt',
      type: 'date',
      required: true,
      index: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'hobby',
      type: 'text',
      required: true,
      validate: async (
        value: string | null | undefined,
        { req }: { req: PayloadRequest },
      ) => {
        if (!value) return 'Kies een hobby.'
        if (HOBBIES.some((hobby) => hobby.value === value)) return true
        const result = await req.payload.find({
          collection: 'hobbies',
          where: { value: { equals: value } },
          limit: 1,
          depth: 0,
          req,
        })
        return result.docs.length > 0 || 'Kies een bestaande hobby.'
      },
    },
    { name: 'notes', type: 'textarea', maxLength: 5000 },
  ],
}
