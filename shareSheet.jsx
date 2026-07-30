import React, { useEffect, useMemo, useRef } from 'react'
import {
  ArrowUpRight,
  Copy,
  X,
} from '@openai/apps-sdk-ui/components/Icon'
import {
  mapLinkPreviewAlt,
  mapLinkPreviewDataUrl,
} from './linkPreview.js'

export function ShareSheet({ open, record, url, busy, onClose, onPublish, onCopy, onStop }) {
  const sheetRef = useRef(null)
  const busyRef = useRef(busy)
  const closeRef = useRef(onClose)
  const locked = Boolean(busy && busy !== 'loading')
  const previewUrl = useMemo(() => mapLinkPreviewDataUrl(record), [record])
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
        <div className="mb-share-heading">
          <div>
            <p className="mb-kicker">Public map</p>
            <h3 id="mb-share-title">{shared ? 'Ready to share' : 'Share this map'}</h3>
          </div>
          <button
            type="button"
            className="mb-share-close"
            aria-label="Close sharing"
            onClick={onClose}
            disabled={locked}
          >
            <X width={18} height={18} aria-hidden="true" />
          </button>
        </div>
        <img className="mb-share-preview" src={previewUrl} alt={mapLinkPreviewAlt(record)} />
        <p className="mb-share-sheet-body">
          {busy === 'loading'
            ? 'Checking for an existing public link…'
            : shared
              ? 'Anyone with the link can explore the map. Its preview updates with the public page.'
              : 'Create one stable link with an interactive map and its own rich preview.'}
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
        <div className="mb-share-sheet-actions">
          {!shared && busy !== 'loading' && (
            <button type="button" className="mb-primary" onClick={onPublish} disabled={Boolean(busy)}>
              {busy === 'publish' ? 'Creating…' : 'Create link'}
            </button>
          )}
          {shared && (
            <>
              <button type="button" className="mb-primary" onClick={onCopy} disabled={Boolean(busy)}>
                <Copy width={16} height={16} aria-hidden="true" />
                Copy link
              </button>
              <a className="mb-secondary" href={url} target="_blank" rel="noreferrer">
                Open <ArrowUpRight width={15} height={15} aria-hidden="true" />
              </a>
            </>
          )}
        </div>
        {shared && (
          <div className="mb-share-maintenance">
            <button type="button" onClick={onPublish} disabled={Boolean(busy)}>
              {busy === 'publish' ? 'Updating…' : 'Update map & preview'}
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" className="is-danger" onClick={onStop} disabled={Boolean(busy)}>
              {busy === 'stop' ? 'Stopping…' : 'Stop sharing'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
