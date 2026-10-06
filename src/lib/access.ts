import type { Access } from 'payload'

// The app runs locally for one user. Reject browser requests from another origin.
export const localAgenda: Access = ({ req }) => {
  const origin = req.headers.get('origin')
  if (!origin) return true
  const localURL = new URL(req.payload.config.serverURL)
  return ['localhost', '127.0.0.1'].some((hostname) => {
    localURL.hostname = hostname
    return origin === localURL.origin
  })
}
