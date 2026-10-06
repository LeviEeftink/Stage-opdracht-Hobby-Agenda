import { request } from './api'

export const HOBBY_COLORS = [
  { value: 'groen', label: 'Groen', hex: '#39745b' },
  { value: 'blauw', label: 'Blauw', hex: '#4368b0' },
  { value: 'paars', label: 'Paars', hex: '#8663ae' },
  { value: 'oranje', label: 'Oranje', hex: '#b86532' },
  { value: 'roze', label: 'Roze', hex: '#b6537d' },
  { value: 'geel', label: 'Geel', hex: '#997221' },
] as const

export type HobbyColor = (typeof HOBBY_COLORS)[number]['value']
export type HobbyOption = { value: string; label: string; color: HobbyColor }
export type HobbyInput = Pick<HobbyOption, 'label' | 'color'>

export const HOBBIES: HobbyOption[] = []

export const HOBBY_CACHE_KEY = 'hobby-agenda.hobbies.v1'

export function normalizeHobbyName(value: string): string {
  return value
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('nl-NL')
}

export function hobbyLabel(
  value: string,
  hobbies: HobbyOption[] = HOBBIES,
): string {
  return hobbies.find((hobby) => hobby.value === value)?.label || value
}

export function hobbyColor(value: string, hobbies: HobbyOption[]): string {
  const hobby = hobbies.find((item) => item.value === value)
  return (
    HOBBY_COLORS.find((item) => item.value === hobby?.color)?.hex || '#64748b'
  )
}

function isHobby(value: unknown): value is HobbyOption {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.value === 'string' &&
    Boolean(item.value.trim()) &&
    typeof item.label === 'string' &&
    Boolean(item.label.trim()) &&
    HOBBY_COLORS.some((color) => color.value === item.color)
  )
}

export function readHobbyCache(): HobbyOption[] {
  try {
    const data: unknown = JSON.parse(
      window.localStorage.getItem(HOBBY_CACHE_KEY) || 'null',
    )
    if (!Array.isArray(data) || !data.every(isHobby)) return HOBBIES
    const seededValues = new Set([
      'sport',
      'muziek',
      'lezen',
      'gamen',
      'custom-spelletjes spelen',
    ])
    return data.filter((hobby) => !seededValues.has(hobby.value))
  } catch {
    return HOBBIES
  }
}

export function writeHobbyCache(hobbies: HobbyOption[]): boolean {
  try {
    window.localStorage.setItem(HOBBY_CACHE_KEY, JSON.stringify(hobbies))
    return true
  } catch {
    return false
  }
}

export async function getHobbies(signal?: AbortSignal): Promise<HobbyOption[]> {
  const hobbies = [...HOBBIES]
  let page = 1
  while (true) {
    const result = await request<{ docs: HobbyOption[]; hasNextPage: boolean }>(
      `/api/hobbies?sort=label&limit=100&page=${page}`,
      { signal },
    )
    if (!Array.isArray(result.docs) || !result.docs.every(isHobby))
      throw new Error('De hobbylijst bevat ongeldige gegevens.')
    hobbies.push(...result.docs)
    if (!result.hasNextPage) return hobbies
    page++
  }
}

export async function saveHobby(input: HobbyInput): Promise<HobbyOption> {
  const { doc } = await request<{ doc: HobbyOption }>('/api/hobbies', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return doc
}
