export const HOBBIES = [
  { value: 'sport', label: 'Sport', icon: '🏃' },
  { value: 'muziek', label: 'Muziek', icon: '🎵' },
  { value: 'lezen', label: 'Lezen', icon: '📚' },
  { value: 'gamen', label: 'Gamen', icon: '🎮' },
] as const

export type Hobby = typeof HOBBIES[number]['value']

export function hobbyLabel(value: Hobby): string {
  const hobby = HOBBIES.find((item) => item.value === value)!
  return `${hobby.icon} ${hobby.label}`
}
