import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronRight,
  Maps as MapIcon,
  Sparkles,
} from '@openai/apps-sdk-ui/components/Icon'
import {
  clamp,
  mapPointToPixel,
  tileRangeForViewport,
} from './domain.js'
import { subscribeToMapLibrary } from './storage.js'
import { copyPlainText } from './clipboard.js'
import { ShareSheet } from './shareSheet.jsx'
import {
  absolutePublicMapUrl,
  publishMap,
  readPublishedMap,
  unpublishMap,
} from './share.js'
import { SKILLS_ICON } from './skillIcon.js'
import { CSS } from './theme.js'
import { SharedMapDetail } from './SharedMapDetail.jsx'

const TILE_SIZE = 256

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function EmptyState() {
  const askForMap = () => {
    window.parent.postMessage(
      {
        type: 'moebius:new-chat',
        draft: 'Create a useful map for me and save it to Maps.',
      },
      '*',
    )
  }

  return (
    <main className="mb-empty">
      <div className="mb-empty-icon"><MapIcon width={28} height={28} /></div>
      <p className="mb-kicker">Your map library</p>
      <h1>Put places in perspective.</h1>
      <p>Ask Möbius for a map and it will appear here, linked to the conversation that created it.</p>
      <button type="button" className="mb-primary" onClick={askForMap}>
        <Sparkles width={18} height={18} />
        Ask for a map
      </button>
    </main>
  )
}

function parseRecordDate(record) {
  const date = new Date(record.created_at)
  return Number.isNaN(date.getTime()) ? null : date
}

function dateKey(date) {
  if (!date) return 'unknown'
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function dateHeading(date) {
  if (!date) return 'Earlier'
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (dateKey(date) === dateKey(today)) return 'Today'
  if (dateKey(date) === dateKey(yesterday)) return 'Yesterday'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  }).format(date)
}

function cardDate(date) {
  if (!date) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function groupMaps(maps) {
  const groups = []
  maps.forEach((record) => {
    const date = parseRecordDate(record)
    const key = dateKey(date)
    let group = groups[groups.length - 1]
    if (!group || group.key !== key) {
      group = { key, label: dateHeading(date), maps: [] }
      groups.push(group)
    }
    group.maps.push(record)
  })
  return groups
}

function MapPreview({ record, token, paused }) {
  const frameRef = useRef(null)
  const [active, setActive] = useState(false)
  const [size, setSize] = useState({ width: 360, height: 150 })
  const [tiles, setTiles] = useState({})
  const previewZoom = clamp(Math.floor(record.zoom || 15) - 2, 11, 15)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return undefined
    const resize = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    resize.observe(frame)
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setActive(true)
    }, { rootMargin: '160px' })
    visibility.observe(frame)
    return () => {
      resize.disconnect()
      visibility.disconnect()
    }
  }, [])

  const visibleTiles = useMemo(() => (
    active ? tileRangeForViewport(record.center, previewZoom, size, TILE_SIZE) : []
  ), [active, previewZoom, record.center, size])

  useEffect(() => {
    if (paused) return undefined
    let cancelled = false
    const missing = visibleTiles.filter((tile) => !tiles[tile.key])
    if (!missing.length) return undefined
    Promise.allSettled(missing.map(async (tile) => {
      const url = `https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error(`Map tile ${response.status}`)
      return [tile.key, await blobToDataUrl(await response.blob())]
    })).then((results) => {
      if (cancelled) return
      const loaded = {}
      results.forEach((result) => {
        if (result.status === 'fulfilled') loaded[result.value[0]] = result.value[1]
      })
      if (Object.keys(loaded).length) setTiles((current) => ({ ...current, ...loaded }))
    })
    return () => { cancelled = true }
  }, [paused, tiles, token, visibleTiles])

  return (
    <span ref={frameRef} className="mb-card-preview" aria-hidden="true">
      <span className="mb-preview-fallback" />
      {visibleTiles.map((tile) => {
        if (!tiles[tile.key]) return null
        const point = mapPointToPixel(tile.northWest, record.center, previewZoom, size)
        return (
          <img
            alt=""
            className="mb-preview-tile"
            key={tile.key}
            src={tiles[tile.key]}
            style={{ left: point.x, top: point.y }}
          />
        )
      })}
      {record.places.map((place) => {
        const point = mapPointToPixel(place, record.center, previewZoom, size)
        return <i className="mb-preview-pin" key={place.id} style={{ left: point.x, top: point.y }} />
      })}
      <span className="mb-preview-count">{record.places.length} places</span>
      <span className="mb-preview-credit">© OpenStreetMap</span>
    </span>
  )
}

function MapCard({ record, token, previewPaused, onSelect }) {
  const created = parseRecordDate(record)
  return (
    <button
      type="button"
      className="mb-map-card"
      onClick={() => onSelect(record.id)}
    >
      <MapPreview record={record} token={token} paused={previewPaused} />
      <span className="mb-map-card-copy">
        <strong>{record.title}</strong>
        {record.subtitle && <span>{record.subtitle}</span>}
        <small>{cardDate(created)} · {record.area} · {record.places.length} places</small>
      </span>
      <ChevronRight width={18} height={18} aria-hidden="true" />
    </button>
  )
}

function MapLibrary({ appId, maps, token, onOpen }) {
  const groups = groupMaps(maps)
  const placeCount = maps.reduce((total, record) => total + record.places.length, 0)
  const areaCount = new Set(maps.map((record) => record.area).filter(Boolean)).size
  const scrollingRef = useRef(false)
  const scrollTimerRef = useRef(null)
  const [previewPaused, setPreviewPaused] = useState(false)

  useEffect(() => () => {
    if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current)
  }, [])

  const pausePreviewsWhileScrolling = () => {
    if (!scrollingRef.current) {
      scrollingRef.current = true
      setPreviewPaused(true)
    }
    if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current)
    scrollTimerRef.current = window.setTimeout(() => {
      scrollingRef.current = false
      scrollTimerRef.current = null
      setPreviewPaused(false)
    }, 140)
  }
  return (
    <div className="mb-library">
      <header className="mb-library-header">
        <div className="mb-library-header-inner">
        <span className="mb-library-mark" aria-hidden="true">
          <img src={`/api/apps/${appId}/icon?size=64`} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'grid' }} />
          <span className="mb-library-mark-fallback" style={{ display: 'none' }}>M</span>
        </span>
        <div>
          <h1>Maps</h1>
          <p>{maps.length} {maps.length === 1 ? 'map' : 'maps'} · {placeCount} places · {areaCount} {areaCount === 1 ? 'area' : 'areas'}</p>
        </div>
        </div>
      </header>

      <main className="mb-library-scroll" onScroll={pausePreviewsWhileScrolling}>
        <div className="mb-library-page">
          <section className="mb-skill-note" aria-label="About Maps">
            <img className="mb-skill-note-icon" src={SKILLS_ICON} alt="" aria-hidden="true" />
            <div>
              <strong>Maps comes with a location skill.</strong>
              <span>Ask for a map in any chat; Möbius will keep it here and preserve the link back to that conversation.</span>
            </div>
          </section>

          <div className="mb-map-history">
            {groups.map((group) => (
              <section className="mb-date-group" key={group.key} aria-labelledby={`date-${group.key}`}>
                <h2 id={`date-${group.key}`}>{group.label}</h2>
                <div className="mb-date-list">
                  {group.maps.map((record) => (
                    <MapCard
                      key={record.id}
                      record={record}
                      token={token}
                      previewPaused={previewPaused}
                      onSelect={onOpen}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function App({ appId, token }) {
  const [maps, setMaps] = useState([])
  const [selectedMapId, setSelectedMapId] = useState('')
  const [status, setStatus] = useState('loading')
  const [shareNotice, setShareNotice] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareBusy, setShareBusy] = useState('')
  const navRef = useRef(null)
  const shareTimerRef = useRef(null)

  const closeMap = useCallback(() => {
    try { navRef.current?.close?.() } catch {}
    navRef.current = null
    setSelectedMapId('')
  }, [])

  const openMap = useCallback(async (id, { ownBackEntry = true } = {}) => {
    if (!id) return
    if (!ownBackEntry) {
      // The shell intent already owns the outer Back entry. Adding an app
      // sentinel here would make Back stop at the library instead of the chat.
      try { navRef.current?.close?.() } catch {}
      navRef.current = null
      setSelectedMapId(id)
      return
    }
    if (id === selectedMapId) return
    try { navRef.current?.close?.() } catch {}
    const nav = window.mobius?.nav
    if (!nav?.open) {
      setSelectedMapId(id)
      return
    }
    const handle = nav.open('map-detail', () => {
      navRef.current = null
      setSelectedMapId('')
    })
    navRef.current = handle
    setSelectedMapId(id)
    const outcome = await handle.outcome
    if (navRef.current !== handle) return
    if (outcome.status !== 'owned' && outcome.status !== 'standalone') {
      navRef.current = null
      setSelectedMapId('')
    }
  }, [selectedMapId])

  useEffect(() => subscribeToMapLibrary({
    onMaps(nextMaps) {
      setMaps(nextMaps)
      setSelectedMapId((current) => (
        nextMaps.some((record) => record.id === current)
          ? current
          : ''
      ))
      setStatus('ready')
    },
    onError() {
      setStatus('error')
    },
  }), [])

  useEffect(() => {
    const onIntent = (event) => {
      if (event.source !== window.parent) return
      if (event.data?.type !== 'moebius:app-intent') return
      const match = /^map:([a-z0-9][a-z0-9-]{0,127})$/.exec(String(event.data.intent || ''))
      if (match) void openMap(match[1], { ownBackEntry: false })
    }
    window.addEventListener('message', onIntent)
    return () => window.removeEventListener('message', onIntent)
  }, [openMap])

  useEffect(() => () => {
    try { navRef.current?.close?.() } catch {}
    if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current)
  }, [])

  const selectedMap = maps.find((record) => record.id === selectedMapId)

  useEffect(() => {
    setShareOpen(false)
    setShareUrl('')
    setShareBusy('')
  }, [selectedMap?.id])

  if (status === 'loading') {
    return (
      <div className="mb-root">
        <style>{CSS}</style>
        <div className="mb-loading"><MapIcon width={26} height={26} /><span>Opening your maps…</span></div>
      </div>
    )
  }

  if (!maps.length) {
    return (
      <div className="mb-root">
        <style>{CSS}</style>
        <EmptyState />
      </div>
    )
  }

  if (!selectedMap) {
    return (
      <div className="mb-root">
        <style>{CSS}</style>
        <MapLibrary appId={appId} maps={maps} token={token} onOpen={openMap} />
      </div>
    )
  }

  const openSourceChat = () => {
    if (!selectedMap.source_chat?.id) return
    window.parent.postMessage(
      { type: 'moebius:open-chat', chatId: selectedMap.source_chat.id },
      '*',
    )
  }
  const showShareNotice = (message) => {
    setShareNotice(message)
    if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current)
    shareTimerRef.current = window.setTimeout(() => {
      shareTimerRef.current = null
      setShareNotice('')
    }, 2600)
  }
  const openShare = async () => {
    if (shareOpen) return
    setShareOpen(true)
    setShareUrl('')
    setShareBusy('loading')
    try {
      const existing = await readPublishedMap({
        storage: window.mobius.storage,
        record: selectedMap,
      })
      if (existing) {
        setShareUrl(absolutePublicMapUrl(existing.url, window.location.href))
      }
    } catch {
      showShareNotice('Couldn’t check this map’s public link')
    } finally {
      setShareBusy('')
    }
  }
  const publishShare = async () => {
    if (shareBusy) return
    setShareBusy('publish')
    try {
      const published = await publishMap({ appId, token, record: selectedMap })
      setShareUrl(absolutePublicMapUrl(published.url, window.location.href))
      showShareNotice(shareUrl ? 'Public map updated' : 'Public link created')
    } catch (error) {
      showShareNotice(error?.message || 'Couldn’t publish this map')
    } finally {
      setShareBusy('')
    }
  }
  const copyShare = async () => {
    if (!shareUrl) return
    if (await copyPlainText(shareUrl)) {
      showShareNotice('Public link copied')
    } else {
      showShareNotice('Select the link and use Copy on your device')
    }
  }
  const stopShare = async () => {
    if (shareBusy) return
    setShareBusy('stop')
    try {
      await unpublishMap({ appId, token, record: selectedMap })
      setShareUrl('')
      showShareNotice('Public link removed')
    } catch (error) {
      showShareNotice(error?.message || 'Couldn’t stop sharing this map')
    } finally {
      setShareBusy('')
    }
  }

  return (
    <div className="mb-root">
      <style>{CSS}</style>
      <div className="mb-detail">
        <SharedMapDetail
          appId={appId}
          token={token}
          record={selectedMap}
          onBack={closeMap}
          onShare={openShare}
          onSourceChat={openSourceChat}
        />
        <div className={`mb-share-notice${shareNotice ? ' is-visible' : ''}`} role="status" aria-live="polite">
          {shareNotice}
        </div>
        <ShareSheet
          open={shareOpen}
          record={selectedMap}
          url={shareUrl}
          busy={shareBusy}
          onClose={() => setShareOpen(false)}
          onPublish={publishShare}
          onCopy={copyShare}
          onStop={stopShare}
        />
      </div>
    </div>
  )
}
