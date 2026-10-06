import type { Activity } from '@/payload-types'
import { hobbyLabel, type HobbyOption } from './hobbies'

export async function downloadCalendar(
  activities: Activity[],
  hobbies: HobbyOption[],
): Promise<void> {
  const { default: ical, ICalCalendarMethod } = await import('ical-generator')
  const calendar = ical({
    name: 'Hobby Agenda',
    method: ICalCalendarMethod.PUBLISH,
  })
  for (const activity of activities) {
    calendar.createEvent({
      id: `${activity.id}@hobby-agenda-${window.location.host}`,
      start: new Date(activity.startsAt),
      end: new Date(Date.parse(activity.startsAt) + 60 * 60 * 1000),
      summary: activity.title,
      description: activity.notes || '',
      categories: [
        {
          name: hobbyLabel(activity.hobby, hobbies),
        },
      ],
      stamp: new Date(activity.updatedAt),
    })
  }
  const url = URL.createObjectURL(
    new Blob([calendar.toString()], { type: 'text/calendar;charset=utf-8' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'hobby-agenda.ics'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
