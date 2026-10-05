import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig } from 'payload'
import { Activities } from './collections/Activities'
import { Users } from './collections/Users'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: { user: 'users', importMap: { baseDir: dirname } },
  collections: [Users, Activities],
  db: sqliteAdapter({ client: { url: process.env.DATABASE_URL || 'file:./agenda.db' } }),
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
})
