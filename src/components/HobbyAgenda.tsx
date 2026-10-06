'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Activity } from '@/payload-types'
import {
  deleteActivity,
  getActivities,
  readCache,
  saveActivity,
  sortActivities,
  writeCache,
  type ActivityInput,
} from '@/lib/activities'
import { formatDate, formatTime, localDate } from '@/lib/dates'
import {
  HOBBIES,
  getHobbies,
  hobbyColor,
  hobbyLabel,
  readHobbyCache,
  saveHobby,
  writeHobbyCache,
  type HobbyInput,
  type HobbyOption,
} from '@/lib/hobbies'
import { downloadCalendar } from '@/lib/calendar'
import { ActivityForm } from './ActivityForm'
import { ActivityDetail } from './ActivityDetail'
import { HobbyForm } from './HobbyForm'
import { AgendaCalendar } from './AgendaCalendar'

export function HobbyAgenda() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [hobbies, setHobbies] = useState<HobbyOption[]>(HOBBIES)
  const [creatingHobby, setCreatingHobby] = useState(false)
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState('')
  const [cacheWarning, setCacheWarning] = useState(false)
  const [notice, setNotice] = useState('')
  const [hobby, setHobby] = useState('')
  const [selected, setSelected] = useState<Activity | null>(null)
  const [editor, setEditor] = useState<{
    activity?: Activity
    startsAt?: string
  } | null>(null)
  const [view, setView] = useState<'week' | 'month' | 'list'>('week')
  const [calendarDate, setCalendarDate] = useState<string>()
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  const load = useCallback(
    (signal?: AbortSignal) =>
      Promise.all([getActivities(signal), getHobbies(signal)])
        .then(([items, hobbyItems]) => {
          if (signal?.aborted) return
          setActivities(sortActivities(items))
          setHobbies(hobbyItems)
          const activitiesCached = writeCache(items)
          const hobbiesCached = writeHobbyCache(hobbyItems)
          setCacheWarning(!activitiesCached || !hobbiesCached)
          setConnectionError('')
        })
        .catch(() => {
          if (signal?.aborted) return
          setActivities(sortActivities(readCache()))
          setHobbies(readHobbyCache())
          setConnectionError(
            'De server is niet bereikbaar. De laatst bewaarde browserkopie wordt getoond.',
          )
        })
        .finally(() => {
          if (!signal?.aborted) setLoading(false)
        }),
    [],
  )

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  function updateActivities(items: Activity[]) {
    setActivities(sortActivities(items))
    const activitiesCached = writeCache(items)
    const hobbiesCached = writeHobbyCache(hobbies)
    setCacheWarning(!activitiesCached || !hobbiesCached)
    setConnectionError('')
  }

  async function createHobby(input: HobbyInput) {
    const doc = await saveHobby(input)
    const items = [...hobbies, doc]
    setHobbies(items)
    const activitiesCached = writeCache(activities)
    const hobbiesCached = writeHobbyCache(items)
    setCacheWarning(!activitiesCached || !hobbiesCached)
    setNotice('Hobby toegevoegd.')
    return doc
  }

  async function save(input: ActivityInput) {
    const doc = await saveActivity(input, editor?.activity?.id)
    updateActivities([...activities.filter((item) => item.id !== doc.id), doc])
    if (hobby && hobby !== doc.hobby) setHobby(doc.hobby)
    setCalendarDate(localDate(new Date(doc.startsAt)))
    setNotice(
      editor?.activity ? 'Activiteit bijgewerkt.' : 'Activiteit toegevoegd.',
    )
    setEditor(null)
  }

  async function remove() {
    if (!selected) return
    await deleteActivity(selected.id)
    updateActivities(activities.filter((item) => item.id !== selected.id))
    setSelected(null)
    setNotice('Activiteit verwijderd.')
  }

  const filtered = activities.filter((item) => !hobby || item.hobby === hobby)
  async function exportAgenda() {
    setExporting(true)
    setExportError('')
    try {
      await downloadCalendar(filtered, hobbies)
    } catch {
      setExportError('Downloaden is niet gelukt. Probeer opnieuw.')
    } finally {
      setExporting(false)
    }
  }
  const groups = new Map<string, Activity[]>()
  for (const activity of filtered) {
    const day = localDate(new Date(activity.startsAt))
    groups.set(day, [...(groups.get(day) || []), activity])
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Hobby Agenda</h1>
        <p>Tijd voor wat je leuk vindt.</p>
      </header>
      {loading ? (
        <p role="status" className="panel">
          Agenda laden…
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hobby-sidebar" aria-labelledby="hobbies-heading">
            <h2 id="hobbies-heading">Mijn hobby&apos;s</h2>
            <div
              className="flex flex-wrap gap-1 md:flex-col"
              aria-label="Filter op hobby"
            >
              <button
                className="hobby-filter"
                aria-pressed={!hobby}
                disabled={Boolean(editor)}
                onClick={() => setHobby('')}
              >
                <span>Alle hobby&apos;s</span>
                <span className="count" aria-hidden="true">
                  {activities.length}
                </span>
              </button>
              {hobbies.map((item) => (
                <button
                  key={item.value}
                  className="hobby-filter"
                  aria-pressed={hobby === item.value}
                  aria-label={item.label}
                  disabled={Boolean(editor)}
                  onClick={() => setHobby(item.value)}
                >
                  <span className="hobby-name">
                    <span
                      className="color-dot"
                      style={{
                        backgroundColor: hobbyColor(item.value, hobbies),
                      }}
                      aria-hidden="true"
                    />
                    {item.label}
                  </span>
                  <span className="count" aria-hidden="true">
                    {
                      activities.filter(
                        (activity) => activity.hobby === item.value,
                      ).length
                    }
                  </span>
                </button>
              ))}
            </div>
            <button
              className="add-hobby"
              disabled={Boolean(connectionError) || Boolean(editor)}
              onClick={() => {
                setNotice('')
                setCreatingHobby(true)
              }}
            >
              <span aria-hidden="true">+ </span>Hobby toevoegen
            </button>
          </aside>
          <div className="agenda-content">
            {connectionError && (
              <p role="alert" className="message error">
                {connectionError}{' '}
                <button onClick={() => load()}>Opnieuw verbinden</button>
              </p>
            )}
            {cacheWarning && (
              <p className="message">
                De agenda staat op de server, maar de browserkopie kon niet
                worden bewaard.
              </p>
            )}
            {notice && !editor && (
              <p role="status" className="message success">
                {notice}
              </p>
            )}
            {editor ? (
              <ActivityForm
                activity={editor.activity}
                hobbies={hobbies}
                initialHobby={hobby}
                initialStartsAt={editor.startsAt}
                onCreateHobby={createHobby}
                onSave={save}
                onCancel={() => setEditor(null)}
              />
            ) : (
              <>
                <div className="agenda-heading flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2>Mijn agenda</h2>
                    <p className="muted">
                      {hobby
                        ? hobbyLabel(hobby, hobbies)
                        : 'Al je activiteiten op één plek.'}
                    </p>
                  </div>
                  <button
                    className="primary"
                    onClick={() => {
                      setNotice('')
                      setEditor({})
                    }}
                    disabled={Boolean(connectionError)}
                  >
                    <span aria-hidden="true">+ </span>Activiteit toevoegen
                  </button>
                </div>
                <div className="agenda-toolbar flex flex-wrap items-center justify-between gap-2">
                  <div
                    className="view-switch flex gap-1"
                    role="group"
                    aria-label="Agendaweergave"
                  >
                    <button
                      type="button"
                      aria-pressed={view === 'week'}
                      onClick={() => setView('week')}
                    >
                      Week
                    </button>
                    <button
                      type="button"
                      aria-pressed={view === 'month'}
                      onClick={() => setView('month')}
                    >
                      Maand
                    </button>
                    <button
                      type="button"
                      aria-pressed={view === 'list'}
                      onClick={() => setView('list')}
                    >
                      Agenda
                    </button>
                  </div>
                  {activities.length > 0 && (
                    <button
                      className="text-button"
                      onClick={exportAgenda}
                      disabled={exporting || filtered.length === 0}
                    >
                      {exporting ? 'Downloaden…' : 'Download agenda (.ics)'}
                    </button>
                  )}
                </div>
                {exportError && (
                  <p role="alert" className="message error">
                    {exportError}
                  </p>
                )}
                {view !== 'list' ? (
                  <AgendaCalendar
                    activities={filtered}
                    hobbies={hobbies}
                    view={view}
                    date={calendarDate}
                    readOnly={Boolean(connectionError)}
                    onDateChange={setCalendarDate}
                    onSelect={setSelected}
                    onAdd={(startsAt) => {
                      setNotice('')
                      setEditor({ startsAt })
                    }}
                  />
                ) : (
                  <>
                    {filtered.length === 0 && (
                      <div className="panel empty-state">
                        <h3>
                          {hobby
                            ? 'Nog niets gepland'
                            : 'Je agenda is nog leeg'}
                        </h3>
                        <p className="muted">
                          {hobby
                            ? 'Geen activiteiten voor deze hobby.'
                            : 'Nog geen activiteiten. Voeg je eerste activiteit toe.'}
                        </p>
                      </div>
                    )}
                    {[...groups].map(([day, items]) => (
                      <section
                        key={day}
                        className="day-group"
                        aria-labelledby={`day-${day}`}
                      >
                        <h3 id={`day-${day}`}>
                          {formatDate(items[0].startsAt)}
                        </h3>
                        <ul className="activity-list">
                          {items.map((activity) => (
                            <li key={activity.id}>
                              <button
                                className="activity-row"
                                aria-label={activity.title}
                                onClick={() => setSelected(activity)}
                              >
                                <time dateTime={activity.startsAt}>
                                  {formatTime(activity.startsAt)}
                                </time>
                                <span className="activity-title">
                                  {activity.title}
                                </span>
                                <span className="hobby-badge">
                                  <span
                                    className="color-dot"
                                    style={{
                                      backgroundColor: hobbyColor(
                                        activity.hobby,
                                        hobbies,
                                      ),
                                    }}
                                    aria-hidden="true"
                                  />
                                  {hobbyLabel(activity.hobby, hobbies)}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </>
                )}
              </>
            )}
            {selected && (
              <ActivityDetail
                key={selected.id}
                activity={selected}
                hobbies={hobbies}
                readOnly={Boolean(connectionError)}
                onClose={() => setSelected(null)}
                onEdit={() => {
                  setEditor({ activity: selected })
                  setSelected(null)
                }}
                onDelete={remove}
              />
            )}
            {creatingHobby && (
              <HobbyForm
                hobbies={hobbies}
                onCancel={() => setCreatingHobby(false)}
                onSave={async (input) => {
                  await createHobby(input)
                  setCreatingHobby(false)
                }}
              />
            )}
          </div>
        </div>
      )}
    </main>
  )
}
