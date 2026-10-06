import type { Activity } from '@/payload-types'
import { request } from './api'

export type ActivityInput = Pick<Activity, 'title' | 'startsAt' | 'hobby'> & {
  notes: string
}
export const CACHE_KEY = 'hobby-agenda.cache.v1'

export function isActivity(value: unknown): value is Activity {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'number' &&
    Number.isInteger(item.id) &&
    typeof item.title === 'string' &&
    Boolean(item.title.trim()) &&
    typeof item.startsAt === 'string' &&
    Number.isFinite(Date.parse(item.startsAt)) &&
    typeof item.hobby === 'string' &&
    Boolean(item.hobby.trim()) &&
    (item.notes === undefined ||
      item.notes === null ||
      typeof item.notes === 'string') &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string'
  )
}

export function readCache(): Activity[] {
  try {
    const data: unknown = JSON.parse(
      window.localStorage.getItem(CACHE_KEY) || '[]',
    )
    return Array.isArray(data) && data.every(isActivity) ? data : []
  } catch {
    return []
  }
}

export function writeCache(activities: Activity[]): boolean {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(activities))
    return true
  } catch {
    return false
  }
}

export async function getActivities(signal?: AbortSignal): Promise<Activity[]> {
  const activities: Activity[] = []
  let page = 1
  while (true) {
    const result = await request<{ docs: Activity[]; hasNextPage: boolean }>(
      `/api/activities?sort=startsAt&limit=100&page=${page}`,
      { signal },
    )
    if (!Array.isArray(result.docs) || !result.docs.every(isActivity))
      throw new Error('De agenda bevat ongeldige gegevens.')
    activities.push(...result.docs)
    if (!result.hasNextPage) return activities
    page++
  }
}

export async function saveActivity(
  input: ActivityInput,
  id?: number,
): Promise<Activity> {
  const { doc } = await request<{ doc: Activity }>(
    id === undefined ? '/api/activities' : `/api/activities/${id}`,
    {
      method: id === undefined ? 'POST' : 'PATCH',
      body: JSON.stringify(input),
    },
  )
  return doc
}

export async function deleteActivity(id: number): Promise<void> {
  await request(`/api/activities/${id}`, { method: 'DELETE' })
}

export function sortActivities(activities: Activity[]): Activity[] {
  return [...activities].sort(
    (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt) || a.id - b.id,
  )
}
