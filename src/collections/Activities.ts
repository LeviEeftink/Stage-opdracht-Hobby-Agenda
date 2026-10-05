import type { Access, CollectionConfig } from 'payload'
import { HOBBIES } from '../lib/hobbies'

// The app runs locally for one user. Reject browser writes from another origin.
const localAgenda: Access = ({ req }) => {
  const origin = req.headers.get('origin')
  return !origin || origin === req.payload.config.serverURL
}

export const Activities: CollectionConfig = {
  slug: 'activities',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'startsAt', 'hobby'] },
  access: { read: localAgenda, create: localAgenda, update: localAgenda, delete: localAgenda },
  fields: [
    {
      name: 'title', type: 'text', required: true, maxLength: 120,
      validate: (value: string | null | undefined) => Boolean(value?.trim()) || 'Vul een titel in.',
      hooks: { beforeValidate: [({ value }) => typeof value === 'string' ? value.trim() : value] },
    },
    { name: 'startsAt', type: 'date', required: true, index: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'hobby', type: 'select', required: true, options: HOBBIES.map(({ value, label }) => ({ value, label })) },
    { name: 'notes', type: 'textarea', maxLength: 5000 },
  ],
}
