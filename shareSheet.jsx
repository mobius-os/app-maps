import React, { useEffect, useRef } from 'react'
import {
  ArrowUpRight,
  Copy,
} from '@openai/apps-sdk-ui/components/Icon'

export function ShareSheet({ open, url, busy, onClose, onPublish, onCopy, onStop }) {
  const sheetRef = useRef(null)
  const busyRef = useRef(busy)
  const closeRef = useRef(onClose)
  const locked = Boolean(busy && busy !== 'loading')
  busyRef.current = locked
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement
    const focusable = () => Array.from(
      sheetRef.current?.querySelectorAll('button:not(:disabled), a[href], input') || [],
    )
    const timer = window.setTimeout(() => focusable()[0]?.focus(), 0)
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busyRef.current) {
        event.preventDefault()
        closeRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus?.()
    }
  }, [open])

  if (!open) return null
  const shared = Boolean(url)

  return (
    <div
      className="mb-share-scrim"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mb-share-title"
      onClick={locked ? undefined : onClose}
    >
      <div ref={sheetRef} className="mb-share-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="mb-share-handle" aria-hidden="true" />
        <p className="mb-kicker">Public map</p>
        <h3 id="mb-share-title">{shared ? 'Shared map' : 'Share this map'}</h3>
        <p className="mb-share-sheet-body">
          {busy === 'loading'
            ? 'Checking for an existing public link…'
            : shared
              ? 'Anyone with this link can explore the current public map.'
              : 'Publish the current map as a stable public page.'}
        </p>
        {shared && (
          <div className="mb-share-url">
            <input
              aria-label="Public map link"
              value={url}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
            />
            <button type="button" aria-label="Copy public link" onClick={onCopy} disabled={Boolean(busy)}>
              <Copy width={18} height={18} />
            </button>
          </div>
        )}
        {shared && (
          <a className="mb-secondary mb-share-open" href={url} target="_blank" rel="noreferrer">
            Open public map <ArrowUpRight width={15} height={15} />
          </a>
        )}
        <div className="mb-share-sheet-actions">
          {!shared && busy !== 'loading' && (
            <button type="button" className="mb-primary" onClick={onPublish} disabled={Boolean(busy)}>
              {busy === 'publish' ? 'Publishing…' : 'Create public link'}
            </button>
          )}
          {shared && (
            <button type="button" className="mb-secondary" onClick={onPublish} disabled={Boolean(busy)}>
              {busy === 'publish' ? 'Updating…' : 'Update public map'}
            </button>
          )}
          {shared && (
            <button type="button" className="mb-share-stop" onClick={onStop} disabled={Boolean(busy)}>
              {busy === 'stop' ? 'Stopping…' : 'Stop sharing'}
            </button>
          )}
          <button type="button" className="mb-secondary" onClick={onClose} disabled={locked}>Done</button>
        </div>
      </div>
    </div>
  )
}
