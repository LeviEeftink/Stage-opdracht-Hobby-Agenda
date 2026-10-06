const pad = (value: number) => String(value).padStart(2, '0')

export function localDate(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}

export function localTime(value: Date): string {
  return `${pad(value.getHours())}:${pad(value.getMinutes())}`
}

export function toISO(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
    return null
  const parsed = new Date(`${date}T${time}:00`)
  if (
    !Number.isFinite(parsed.getTime()) ||
    localDate(parsed) !== date ||
    localTime(parsed) !== time
  )
    return null
  return parsed.toISOString()
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
