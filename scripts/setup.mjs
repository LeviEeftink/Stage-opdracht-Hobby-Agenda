import { randomBytes } from 'node:crypto'
import { existsSync, writeFileSync } from 'node:fs'

if (existsSync('.env')) {
  console.log('.env bestaat al. Je instellingen blijven behouden.')
} else {
  writeFileSync('.env', `PAYLOAD_SECRET=${randomBytes(32).toString('hex')}\nDATABASE_URL=file:./agenda.db\nNEXT_PUBLIC_SERVER_URL=http://localhost:3000\n`, { flag: 'wx' })
  console.log('.env aangemaakt. Start met npm run dev.')
}
