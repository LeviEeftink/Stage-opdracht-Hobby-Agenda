import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Hobby Agenda' }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="nl"><body>{children}</body></html>
}
