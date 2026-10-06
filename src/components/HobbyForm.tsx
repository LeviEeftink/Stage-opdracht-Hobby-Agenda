'use client'

import { useEffect, useRef, useState } from 'react'
import {
  HOBBY_COLORS,
  normalizeHobbyName,
  type HobbyInput,
  type HobbyOption,
} from '@/lib/hobbies'

type Props = {
  hobbies: HobbyOption[]
  onSave: (input: HobbyInput) => Promise<void>
  onCancel: () => void
}

export function HobbyForm({ hobbies, onSave, onCancel }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [color, setColor] = useState<HobbyInput['color']>('groen')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const label = String(new FormData(event.currentTarget).get('label') || '')
      .trim()
      .replace(/\s+/g, ' ')
    if (!label || label.length > 60) {
      setError('Vul een hobbynaam van maximaal 60 tekens in.')
      return
    }
    if (
      hobbies.some(
        (hobby) =>
          normalizeHobbyName(hobby.label) === normalizeHobbyName(label),
      )
    ) {
      setError('Deze hobby bestaat al. Kies een andere naam.')
      return
    }
    setError('')
    setBusy(true)
    try {
      await onSave({ label, color })
    } catch {
      setError(
        'Opslaan is niet gelukt. Je invoer blijft staan; probeer opnieuw.',
      )
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="hobby-heading"
      onCancel={(event) => {
        if (busy) event.preventDefault()
        else onCancel()
      }}
    >
      <h2 id="hobby-heading">Hobby toevoegen</h2>
      <p className="muted">Geef je hobby een naam en een herkenbare kleur.</p>
      <form onSubmit={submit} noValidate>
        {error && (
          <p role="alert" className="message error" id="hobby-error">
            {error}
          </p>
        )}
        <fieldset disabled={busy} className="form-fields">
          <div className="field">
            <label htmlFor="hobby-name">Naam *</label>
            <input
              id="hobby-name"
              name="label"
              required
              maxLength={60}
              placeholder="Bijvoorbeeld fotografie"
              autoFocus
              aria-describedby={error ? 'hobby-error' : undefined}
            />
          </div>
          <fieldset className="color-picker">
            <legend>Kleur *</legend>
            <div className="flex flex-wrap gap-2">
              {HOBBY_COLORS.map((item) => (
                <label key={item.value} className="color-option">
                  <input
                    type="radio"
                    name="color"
                    value={item.value}
                    checked={color === item.value}
                    onChange={() => setColor(item.value)}
                  />
                  <span
                    className="color-dot"
                    style={{ backgroundColor: item.hex }}
                    aria-hidden="true"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2 form-actions">
            <button type="submit" className="primary">
              {busy ? 'Opslaan…' : 'Hobby opslaan'}
            </button>
            <button type="button" onClick={onCancel}>
              Annuleren
            </button>
          </div>
        </fieldset>
      </form>
    </dialog>
  )
}
