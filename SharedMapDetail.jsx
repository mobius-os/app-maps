import React, { useEffect, useRef, useState } from 'react'
import {
  LEAFLET_VERSION,
  PUBLIC_VIEWER_ASSETS,
  VIEWER_VERSION,
} from './viewerAssets.js'

const assetPromises = new Map()

function loadStyle(id, href) {
  const existing = document.getElementById(id)
  if (existing) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = href
    link.onload = resolve
    link.onerror = () => reject(new Error(`Could not load ${href}`))
    document.head.appendChild(link)
  })
}

function loadScript(id, src) {
  const existing = document.getElementById(id)
  if (existing) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.onload = resolve
    script.onerror = () => reject(new Error(`Could not load ${src}`))
    document.head.appendChild(script)
  })
}

function ensureViewer(appId) {
  const key = String(appId)
  if (assetPromises.has(key)) return assetPromises.get(key)
  const base = `/app-assets/by-id/${encodeURIComponent(appId)}`
  const promise = loadStyle(
    `maps-leaflet-${LEAFLET_VERSION}`,
    `${base}/vendor/leaflet-${LEAFLET_VERSION}.css`,
  ).then(() => loadScript(
    `maps-leaflet-${LEAFLET_VERSION}-script`,
    `${base}/vendor/leaflet-${LEAFLET_VERSION}.js`,
  )).then(() => loadScript(
    `maps-viewer-${VIEWER_VERSION}`,
    `${base}/map-viewer-${VIEWER_VERSION}.js`,
  )).then(() => customElements.whenDefined('mobius-map-viewer'))
  assetPromises.set(key, promise)
  return promise
}

export function SharedMapDetail({
  appId,
  token,
  record,
  onBack,
  onShare,
  onSourceChat,
}) {
  const viewerRef = useRef(null)
  const callbacksRef = useRef({ onBack, onShare, onSourceChat })
  const [status, setStatus] = useState('loading')
  callbacksRef.current = { onBack, onShare, onSourceChat }

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    ensureViewer(appId).then(
      () => { if (!cancelled) setStatus('ready') },
      () => { if (!cancelled) setStatus('error') },
    )
    return () => { cancelled = true }
  }, [appId])

  useEffect(() => {
    if (status !== 'ready' || !viewerRef.current) return undefined
    const viewer = viewerRef.current
    const handleAction = (event) => {
      if (event.detail?.action === 'back') callbacksRef.current.onBack()
      if (event.detail?.action === 'share') callbacksRef.current.onShare()
      if (event.detail?.action === 'source') callbacksRef.current.onSourceChat()
    }
    viewer.addEventListener('map-action', handleAction)
    viewer.configure({
      mode: 'private',
      record,
      tileMode: 'proxy',
      token,
    })
    return () => {
      viewer.removeEventListener('map-action', handleAction)
      viewer.destroy?.()
    }
  }, [record, status, token])

  if (status === 'error') {
    return (
      <div className="mb-loading">
        <span>Couldn’t open the shared map view.</span>
      </div>
    )
  }

  return (
    <>
      {status === 'loading' && (
        <div className="mb-loading">
          <span>Opening map…</span>
        </div>
      )}
      <mobius-map-viewer
        ref={viewerRef}
        style={{ display: status === 'ready' ? 'block' : 'none' }}
      />
    </>
  )
}

export { PUBLIC_VIEWER_ASSETS }
