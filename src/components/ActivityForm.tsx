'use client'

import { useRef, useState } from 'react'
import type { Activity } from '@/payload-types'
import type { ActivityInput } from '@/lib/activities'
import type { HobbyInput, HobbyOption } from '@/lib/hobbies'
import { localDate, localTime, toISO } from '@/lib/dates'
import { HobbyForm } from './HobbyForm'

type Props = {
  activity?: Activity
  hobbies: HobbyOption[]
  initialHobby: string
  initialStartsAt?: string
  onCreateHobby: (input: HobbyInput) => Promise<HobbyOption>
  onSave: (input: ActivityInput) => Promise<void>
  onCancel: () => void
}

export function ActivityForm({
  activity,
  hobbies,
  initialHobby,
  initialStartsAt,
  onCreateHobby,
  onSave,
  onCancel,
}: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState('')
  const [busy, setBusy] = useState(false)
  const [selectedHobby, setSelectedHobby] = useState(
    activity?.hobby || initialHobby,
  )
  const [creatingHobby, setCreatingHobby] = useState(false)
  const summary = useRef<HTMLDivElement>(null)
  const [initialDate] = useState(
    () => new Date(activity?.startsAt || initialStartsAt || Date.now()),
  )

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const title = String(data.get('title') || '').trim()
    const startsAt = toISO(
      String(data.get('date') || ''),
      String(data.get('time') || ''),
    )
    const hobby = hobbies.find(
      (item) => item.value === data.get('hobby'),
    )?.value
    const notes = String(data.get('notes') || '').trim()
    const validation: Record<string, string> = {}
    if (!title || title.length > 120)
      validation.title = 'Vul een titel van maximaal 120 tekens in.'
    if (!startsAt) validation.date = 'Vul een geldige datum en tijd in.'
    if (!hobby) validation.hobby = 'Kies een hobby.'
    if (notes.length > 5000)
      validation.notes = 'Gebruik maximaal 5000 tekens voor je notities.'
    setErrors(validation)
    setSaveError('')
    if (!startsAt || !hobby || Object.keys(validation).length) {
      requestAnimationFrame(() => summary.current?.focus())
      return
    }
    setBusy(true)
    try {
      await onSave({ title, startsAt, hobby, notes })
    } catch {
      setSaveError(
        'Opslaan is niet gelukt. Je invoer blijft staan; probeer opnieuw.',
      )
      setBusy(false)
    }
  }

  return (
    <section className="panel activity-form" aria-labelledby="form-heading">
      <h2 id="form-heading">
        {activity ? 'Activiteit bewerken' : 'Activiteit toevoegen'}
      </h2>
      <p className="muted">Velden met * zijn verplicht.</p>
      <form onSubmit={submit} noValidate>
        {Object.keys(errors).length > 0 && (
          <div
            ref={summary}
            role="alert"
            tabIndex={-1}
            className="message error"
          >
            <ul>
              {Object.entries(errors).map(([key, message]) => (
                <li key={key}>
                  <a href={`#${key}`}>{message}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {saveError && (
          <p role="alert" className="message error">
            {saveError}
          </p>
        )}
        <fieldset disabled={busy} className="form-fields">
          <div className="field">
            <label htmlFor="title">Titel *</label>
            <input
              id="title"
              name="title"
              required
              maxLength={120}
              placeholder="Wat ga je doen?"
              defaultValue={activity?.title}
              aria-invalid={Boolean(errors.title)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="date">Datum *</label>
              <input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={localDate(initialDate)}
                aria-invalid={Boolean(errors.date)}
              />
            </div>
            <div className="field">
              <label htmlFor="time">Tijd *</label>
              <input
                id="time"
                name="time"
                type="time"
                required
                defaultValue={
                  activity || initialStartsAt ? localTime(initialDate) : '18:00'
                }
                aria-invalid={Boolean(errors.date)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="hobby">Hobby *</label>
            <select
              id="hobby"
              name="hobby"
              required
              value={selectedHobby}
              onChange={(event) => setSelectedHobby(event.target.value)}
              aria-invalid={Boolean(errors.hobby)}
            >
              <option value="">Kies een hobby</option>
              {hobbies.map((hobby) => (
                <option key={hobby.value} value={hobby.value}>
                  {hobby.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="text-button"
              onClick={() => setCreatingHobby(true)}
            >
              Nieuwe hobby maken
            </button>
          </div>
          <div className="field">
            <label htmlFor="notes">Notities</label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              maxLength={5000}
              placeholder="Iets om te onthouden?"
              defaultValue={activity?.notes || ''}
              aria-invalid={Boolean(errors.notes)}
            />
          </div>
          <div className="flex flex-wrap gap-2 form-actions">
            <button type="submit" className="primary">
              {busy ? 'Opslaan…' : 'Opslaan'}
            </button>
            <button type="button" onClick={onCancel}>
              Annuleren
            </button>
          </div>
        </fieldset>
      </form>
      {creatingHobby && (
        <HobbyForm
          hobbies={hobbies}
          onCancel={() => setCreatingHobby(false)}
          onSave={async (input) => {
            const hobby = await onCreateHobby(input)
            setSelectedHobby(hobby.value)
            setCreatingHobby(false)
          }}
        />
      )}
    </section>
  )
}
