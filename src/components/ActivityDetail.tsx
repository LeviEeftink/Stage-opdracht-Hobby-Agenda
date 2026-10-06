'use client'

import { useEffect, useRef, useState } from 'react'
import type { Activity } from '@/payload-types'
import { formatDate, formatTime } from '@/lib/dates'
import { hobbyColor, hobbyLabel, type HobbyOption } from '@/lib/hobbies'

type Props = {
  activity: Activity
  hobbies: HobbyOption[]
  onClose: () => void
  onEdit: () => void
  onDelete: () => Promise<void>
  readOnly: boolean
}

export function ActivityDetail({
  activity,
  hobbies,
  onClose,
  onEdit,
  onDelete,
  readOnly,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  async function remove() {
    setBusy(true)
    try {
      await onDelete()
    } catch {
      setError('Verwijderen is niet gelukt. Probeer opnieuw.')
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="activity-title"
      onCancel={(event) => {
        if (busy) event.preventDefault()
        else onClose()
      }}
    >
      <p className="eyebrow">Activiteit</p>
      <h2 id="activity-title">{activity.title}</h2>
      <dl>
        <dt>Datum</dt>
        <dd>{formatDate(activity.startsAt)}</dd>
        <dt>Tijd</dt>
        <dd>{formatTime(activity.startsAt)}</dd>
        <dt>Hobby</dt>
        <dd>
          <span className="hobby-badge">
            <span
              className="color-dot"
              style={{ backgroundColor: hobbyColor(activity.hobby, hobbies) }}
              aria-hidden="true"
            />
            {hobbyLabel(activity.hobby, hobbies)}
          </span>
        </dd>
        <dt>Notities</dt>
        <dd className="whitespace-pre-wrap">
          {activity.notes || 'Geen notities'}
        </dd>
      </dl>
      {error && (
        <p role="alert" className="message error">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2 form-actions">
        <button onClick={onClose} disabled={busy}>
          Terug
        </button>
        <button
          className="primary"
          onClick={onEdit}
          disabled={busy || readOnly}
        >
          Bewerken
        </button>
        {!confirmDelete ? (
          <button
            className="danger"
            onClick={() => setConfirmDelete(true)}
            disabled={readOnly}
          >
            Verwijderen
          </button>
        ) : (
          <div className="delete-confirmation">
            <p>Wil je deze activiteit verwijderen?</p>
            <button className="danger" onClick={remove} disabled={busy}>
              {busy ? 'Verwijderen…' : 'Ja, verwijderen'}
            </button>{' '}
            <button onClick={() => setConfirmDelete(false)} disabled={busy}>
              Annuleren
            </button>
          </div>
        )}
      </div>
    </dialog>
  )
}
