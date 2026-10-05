import type { CollectionConfig } from 'payload'

// This account is only for the optional Payload admin, not for using the agenda.
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    create: () => false,
    read: ({ req }) => req.user ? { id: { equals: req.user.id } } : false,
    update: ({ req }) => req.user ? { id: { equals: req.user.id } } : false,
    delete: () => false,
  },
  fields: [],
}
