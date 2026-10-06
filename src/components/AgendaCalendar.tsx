'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FullCalendar, {
  type CalendarRef,
  type DateClickInfo,
  type DatesSetInfo,
  type EventClickInfo,
  type EventDisplayInfo,
  type EventInput,
} from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import timeGridPlugin from '@fullcalendar/react/timegrid'
import interactionPlugin from '@fullcalendar/react/interaction'
import themePlugin from '@fullcalendar/react/themes/classic'
import nlLocale from '@fullcalendar/react/locales/nl'
import type { Activity } from '@/payload-types'
import { hobbyColor, hobbyLabel, type HobbyOption } from '@/lib/hobbies'
import { localDate } from '@/lib/dates'

const plugins = [themePlugin, dayGridPlugin, timeGridPlugin, interactionPlugin]
const timeFormat = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
} as const

type Props = {
  activities: Activity[]
  hobbies: HobbyOption[]
  view: 'week' | 'month'
  date?: string
  readOnly: boolean
  onDateChange: (date: string) => void
  onSelect: (activity: Activity) => void
  onAdd: (startsAt: string) => void
}

function renderEvent(info: EventDisplayInfo) {
  return (
    <div className="calendar-event-content">
      <span className="calendar-event-time">{info.timeText}</span>
      <strong>{info.event.title}</strong>
      <span className="calendar-event-hobby">
        {info.event.extendedProps.hobbyLabel}
      </span>
    </div>
  )
}

export function AgendaCalendar({
  activities,
  hobbies,
  view,
  date,
  readOnly,
  onDateChange,
  onSelect,
  onAdd,
}: Props) {
  const calendar = useRef<CalendarRef>(null)
  const [title, setTitle] = useState('')

  useEffect(() => {
    calendar.current
      ?.getApi()
      .changeView(view === 'week' ? 'timeGridWeek' : 'dayGridMonth')
  }, [view])

  const events = useMemo<EventInput[]>(
    () =>
      activities.map((activity) => ({
        id: String(activity.id),
        title: activity.title,
        start: activity.startsAt,
        end: new Date(
          Date.parse(activity.startsAt) + 60 * 60 * 1000,
        ).toISOString(),
        color: hobbyColor(activity.hobby, hobbies),
        contrastColor: '#ffffff',
        extendedProps: { hobbyLabel: hobbyLabel(activity.hobby, hobbies) },
      })),
    [activities, hobbies],
  )

  const datesSet = useCallback(
    (info: DatesSetInfo) => {
      setTitle(info.view.title)
      onDateChange(localDate(info.view.calendar.getDate()))
    },
    [onDateChange],
  )

  const eventClick = useCallback(
    (info: EventClickInfo) => {
      const activity = activities.find(
        (item) => String(item.id) === info.event.id,
      )
      if (activity) onSelect(activity)
    },
    [activities, onSelect],
  )

  const dateClick = useCallback(
    (info: DateClickInfo) => {
      if (readOnly) return
      const startsAt = new Date(info.date)
      if (info.allDay) startsAt.setHours(18, 0, 0, 0)
      onAdd(startsAt.toISOString())
    },
    [onAdd, readOnly],
  )

  return (
    <section aria-label={view === 'week' ? 'Weekkalender' : 'Maandkalender'}>
      <div className="calendar-navigation flex flex-wrap items-center justify-between gap-3">
        <h3 aria-live="polite">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => calendar.current?.getApi().today()}
          >
            Vandaag
          </button>
          <button
            type="button"
            aria-label={view === 'week' ? 'Vorige week' : 'Vorige maand'}
            onClick={() => calendar.current?.getApi().prev()}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label={view === 'week' ? 'Volgende week' : 'Volgende maand'}
            onClick={() => calendar.current?.getApi().next()}
          >
            ›
          </button>
        </div>
      </div>
      <div className={`calendar-scroll calendar-${view}`}>
        <div className="calendar-panel">
          <FullCalendar
            ref={calendar}
            className="hobby-calendar"
            plugins={plugins}
            locale={nlLocale}
            firstDay={1}
            initialView={view === 'week' ? 'timeGridWeek' : 'dayGridMonth'}
            initialDate={date}
            timeZone="local"
            headerToolbar={false}
            events={events}
            eventContent={renderEvent}
            eventClick={eventClick}
            dateClick={dateClick}
            datesSet={datesSet}
            eventInteractive
            editable={false}
            allDaySlot={false}
            nowIndicator
            height={640}
            scrollTime="08:00:00"
            slotDuration="00:30:00"
            slotHeaderFormat={timeFormat}
            eventTimeFormat={timeFormat}
            dayHeaderFormat={
              view === 'week'
                ? { weekday: 'short', day: 'numeric' }
                : { weekday: 'short' }
            }
            dayMaxEvents={3}
            fixedWeekCount={false}
          />
        </div>
      </div>
      {!readOnly && (
        <p className="calendar-hint muted">
          Klik op een dag of tijdvak om een activiteit te plannen.
        </p>
      )}
    </section>
  )
}
