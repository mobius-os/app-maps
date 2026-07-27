import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Chat,
  ChevronRight,
  Compass,
  Maps as MapIcon,
  MapsDirections,
  MapPin,
  Sparkles,
} from '@openai/apps-sdk-ui/components/Icon'
import {
  clamp,
  mapPointToPixel,
  panMapCenter,
  pinchZoom,
  tileRangeForViewport,
  oneFingerZoom,
  zoomMapAtPixel,
} from './domain.js'
import { subscribeToMapLibrary } from './storage.js'
import { SKILLS_ICON } from './skillIcon.js'
import { CSS } from './theme.js'

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
        <span className="mb-library-mark" aria-hidden="true">
          <img src={`/api/apps/${appId}/icon?size=64`} alt="" />
        </span>
        <div>
          <h1>Maps</h1>
          <p>{maps.length} {maps.length === 1 ? 'map' : 'maps'} · {placeCount} places · {areaCount} {areaCount === 1 ? 'area' : 'areas'}</p>
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

function TileMap({ record, selectedPlaceId, onSelectPlace }) {
  const frameRef = useRef(null)
  const pointersRef = useRef(new Map())
  const gestureRef = useRef({
    drag: null,
    pinch: null,
    doubleDrag: null,
    moved: false,
    lastTap: null,
  })
  const [size, setSize] = useState({ width: 400, height: 360 })
  const [view, setView] = useState({
    center: record.center,
    zoom: record.zoom || 16,
  })
  const [tiles, setTiles] = useState({})

  useEffect(() => {
    setView({ center: record.center, zoom: record.zoom || 16 })
  }, [record.id, record.center, record.zoom])

  useEffect(() => {
    if (!frameRef.current) return undefined
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(frameRef.current)
    return () => observer.disconnect()
  }, [])

  const tileZoom = Math.floor(view.zoom)
  const tileScale = 2 ** (view.zoom - tileZoom)
  const visibleTiles = useMemo(() => tileRangeForViewport(
    view.center,
    tileZoom,
    {
      width: (size.width / tileScale) + TILE_SIZE,
      height: (size.height / tileScale) + TILE_SIZE,
    },
    TILE_SIZE,
  ), [size, tileScale, tileZoom, view.center])

  useEffect(() => {
    let cancelled = false
    const missing = visibleTiles.filter((tile) => !tiles[tile.key])
    if (!missing.length) return undefined

    Promise.allSettled(
      missing.map(async (tile) => {
        const url = `https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`
        const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, {
          headers: { Authorization: `Bearer ${record.token}` },
        })
        if (!response.ok) throw new Error(`Map tile ${response.status}`)
        return [tile.key, await blobToDataUrl(await response.blob())]
      }),
    ).then((results) => {
      if (cancelled) return
      const loaded = {}
      results.forEach((result) => {
        if (result.status === 'fulfilled') loaded[result.value[0]] = result.value[1]
      })
      if (Object.keys(loaded).length) setTiles((current) => ({ ...current, ...loaded }))
    })

    return () => { cancelled = true }
  }, [record.token, tiles, visibleTiles])

  const zoomAt = (pixel, delta) => {
    setView((current) => {
      const nextZoom = clamp(current.zoom + delta, 13, 18)
      if (nextZoom === current.zoom) return current
      return {
        zoom: nextZoom,
        center: zoomMapAtPixel(current.center, pixel, current.zoom, nextZoom, size),
      }
    })
  }

  const resetDragFromPointer = (pointer) => {
    gestureRef.current.drag = pointer ? {
      x: pointer.x,
      y: pointer.y,
      center: view.center,
    } : null
    gestureRef.current.moved = false
  }

  const handlePointerDown = (event) => {
    if (event.target.closest('.mb-pin, .mb-attribution')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = { x: event.clientX, y: event.clientY }
    pointersRef.current.set(event.pointerId, point)
    const pointers = [...pointersRef.current.values()]
    if (pointers.length === 1) {
      const rect = frameRef.current.getBoundingClientRect()
      const localPoint = { x: point.x - rect.left, y: point.y - rect.top }
      const last = gestureRef.current.lastTap
      if (
        last
        && Date.now() - last.time < 350
        && Math.hypot(localPoint.x - last.x, localPoint.y - last.y) < 36
      ) {
        gestureRef.current.doubleDrag = {
          pointerId: event.pointerId,
          startY: event.clientY,
          startZoom: view.zoom,
          startCenter: view.center,
          point: localPoint,
        }
        gestureRef.current.drag = null
        gestureRef.current.moved = true
      } else {
        resetDragFromPointer(point)
      }
    } else if (pointers.length === 2) {
      const rect = frameRef.current.getBoundingClientRect()
      gestureRef.current.pinch = {
        distance: Math.hypot(
          pointers[0].x - pointers[1].x,
          pointers[0].y - pointers[1].y,
        ),
        startZoom: view.zoom,
        startCenter: view.center,
        point: {
          x: ((pointers[0].x + pointers[1].x) / 2) - rect.left,
          y: ((pointers[0].y + pointers[1].y) / 2) - rect.top,
        },
      }
      gestureRef.current.doubleDrag = null
      gestureRef.current.drag = null
      gestureRef.current.moved = true
    }
  }

  const handlePointerMove = (event) => {
    if (!pointersRef.current.has(event.pointerId)) return
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    const doubleDrag = gestureRef.current.doubleDrag
    if (doubleDrag?.pointerId === event.pointerId) {
      // Match Google Maps: hold the second tap, slide down to zoom in and
      // slide up to zoom out, keeping the touched location anchored.
      const nextZoom = oneFingerZoom(
        doubleDrag.startZoom,
        doubleDrag.startY,
        event.clientY,
      )
      setView({
        zoom: nextZoom,
        center: zoomMapAtPixel(
          doubleDrag.startCenter,
          doubleDrag.point,
          doubleDrag.startZoom,
          nextZoom,
          size,
        ),
      })
      return
    }

    const pointers = [...pointersRef.current.values()]
    if (pointers.length >= 2) {
      const pinch = gestureRef.current.pinch
      if (!pinch) return
      const distance = Math.hypot(
        pointers[0].x - pointers[1].x,
        pointers[0].y - pointers[1].y,
      )
      const nextZoom = pinchZoom(pinch.startZoom, pinch.distance, distance)
      setView({
        zoom: nextZoom,
        center: zoomMapAtPixel(
          pinch.startCenter,
          pinch.point,
          pinch.startZoom,
          nextZoom,
          size,
        ),
      })
      return
    }

    const drag = gestureRef.current.drag
    if (!drag || !pointers.length) return
    const dx = pointers[0].x - drag.x
    const dy = pointers[0].y - drag.y
    if (Math.hypot(dx, dy) > 4) gestureRef.current.moved = true
    setView((current) => ({
      ...current,
      center: panMapCenter(drag.center, dx, dy, current.zoom),
    }))
  }

  const handlePointerEnd = (event) => {
    if (!pointersRef.current.has(event.pointerId)) return
    const point = pointersRef.current.get(event.pointerId)
    pointersRef.current.delete(event.pointerId)
    const remaining = [...pointersRef.current.values()]

    const doubleDrag = gestureRef.current.doubleDrag
    if (doubleDrag?.pointerId === event.pointerId) {
      if (Math.abs(event.clientY - doubleDrag.startY) < 10) {
        zoomAt(doubleDrag.point, 1)
      }
      gestureRef.current.doubleDrag = null
      gestureRef.current.lastTap = null
    } else if (!remaining.length && !gestureRef.current.moved) {
      const rect = frameRef.current.getBoundingClientRect()
      const localPoint = { x: point.x - rect.left, y: point.y - rect.top }
      gestureRef.current.lastTap = { ...localPoint, time: Date.now() }
    }

    gestureRef.current.pinch = null
    resetDragFromPointer(remaining[0])
  }

  const handleKeyDown = (event) => {
    const step = 44
    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      zoomAt({ x: size.width / 2, y: size.height / 2 }, 1)
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      zoomAt({ x: size.width / 2, y: size.height / 2 }, -1)
    } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault()
      const dx = event.key === 'ArrowLeft' ? step : event.key === 'ArrowRight' ? -step : 0
      const dy = event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0
      setView((current) => ({
        ...current,
        center: panMapCenter(current.center, dx, dy, current.zoom),
      }))
    }
  }

  return (
    <section className="mb-map-wrap" aria-label={`${record.title} map`}>
      <div
        ref={frameRef}
        className="mb-map-frame"
        data-zoom={view.zoom}
        tabIndex="0"
        aria-label="Interactive map. Drag to move, pinch or double-tap to zoom. Keyboard users can use arrow keys and plus or minus."
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className="mb-map-fallback" />
        {visibleTiles.map((tile) => {
          const point = mapPointToPixel(
            { lat: tile.northWest.lat, lon: tile.northWest.lon },
            view.center,
            view.zoom,
            size,
          )
          return tiles[tile.key] ? (
            <img
              alt=""
              aria-hidden="true"
              className="mb-tile"
              key={tile.key}
              src={tiles[tile.key]}
              style={{
                left: point.x,
                top: point.y,
                width: TILE_SIZE * tileScale,
                height: TILE_SIZE * tileScale,
              }}
            />
          ) : null
        })}

        <div
          className="mb-station"
          style={{
            left: mapPointToPixel(record.origin, view.center, view.zoom, size).x,
            top: mapPointToPixel(record.origin, view.center, view.zoom, size).y,
          }}
        >
          <span><Compass width={15} height={15} /></span>
          <strong>{record.origin.label}</strong>
        </div>

        {record.places.map((place, index) => {
          const point = mapPointToPixel(place, view.center, view.zoom, size)
          const selected = selectedPlaceId === place.id
          return (
            <button
              type="button"
              key={place.id}
              aria-label={`${place.name}, ${place.walk}`}
              aria-pressed={selected}
              className={`mb-pin${selected ? ' is-selected' : ''}`}
              style={{ left: point.x, top: point.y }}
              onClick={() => onSelectPlace(place.id)}
            >
              <span>{index + 1}</span>
            </button>
          )
        })}

        <a
          className="mb-attribution"
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          © OpenStreetMap
        </a>
      </div>
    </section>
  )
}

function PlacePanel({ record, place, placeNumber }) {
  const openSourceChat = () => {
    if (!record.source_chat?.id) return
    window.parent.postMessage(
      { type: 'moebius:open-chat', chatId: record.source_chat.id },
      '*',
    )
  }

  return (
    <aside className="mb-place-panel">
      <div className="mb-place-topline">
        <span className="mb-place-number">{placeNumber}</span>
        <span className="mb-walk"><MapsDirections width={14} height={14} /> {place.walk}</span>
      </div>
      <div className="mb-place-heading">
        <div>
          <p className="mb-kicker">{place.best_for}</p>
          <h2>{place.name}</h2>
        </div>
        <span className="mb-price">{place.price}</span>
      </div>
      <p className="mb-place-note">{place.note}</p>
      <p className="mb-address"><MapPin width={15} height={15} /> {place.address}</p>
      <div className="mb-actions">
        <a
          className="mb-primary"
          href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
          target="_blank"
          rel="noreferrer"
        >
          <MapsDirections width={17} height={17} />
          Directions
          <ArrowUpRight width={15} height={15} />
        </a>
        <button
          type="button"
          className="mb-secondary"
          onClick={openSourceChat}
          disabled={!record.source_chat?.id}
        >
          <Chat width={17} height={17} />
          Source chat
        </button>
      </div>
      <p className="mb-source-note">
        Prices were recorded when this map was created and may change.
      </p>
    </aside>
  )
}

export default function App({ appId, token }) {
  const [maps, setMaps] = useState([])
  const [selectedMapId, setSelectedMapId] = useState('')
  const [selectedPlaceId, setSelectedPlaceId] = useState('')
  const [status, setStatus] = useState('loading')
  const navRef = useRef(null)

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
  }, [])

  const selectedMap = maps.find((record) => record.id === selectedMapId)

  useEffect(() => {
    if (!selectedMap) return
    setSelectedPlaceId((current) => (
      selectedMap.places.some((place) => place.id === current)
        ? current
        : selectedMap.places[0]?.id || ''
    ))
  }, [selectedMap])

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

  const selectedPlace = selectedMap.places.find((place) => place.id === selectedPlaceId)
    || selectedMap.places[0]
  const placeNumber = selectedMap.places.findIndex((place) => place.id === selectedPlace.id) + 1
  const runtimeRecord = { ...selectedMap, token }
  const openSourceChat = () => {
    if (!selectedMap.source_chat?.id) return
    window.parent.postMessage(
      { type: 'moebius:open-chat', chatId: selectedMap.source_chat.id },
      '*',
    )
  }

  return (
    <div className="mb-root">
      <style>{CSS}</style>
      <div className="mb-detail">
      <header className="mb-header mb-detail-header">
        <button
          type="button"
          className="mb-back"
          onClick={closeMap}
          aria-label="Back to all maps"
        >
          <ArrowLeft width={19} height={19} />
        </button>
        <div className="mb-detail-title">
          <p className="mb-kicker">Maps</p>
          <h1>{selectedMap.title}</h1>
          <p>{selectedMap.subtitle}</p>
        </div>
        <button
          type="button"
          className="mb-source-chip"
          onClick={openSourceChat}
          disabled={!selectedMap.source_chat?.id}
        >
          <Chat width={16} height={16} />
          <span>Source chat</span>
        </button>
      </header>

      <div className="mb-layout">
        <section className="mb-map-column">
          <TileMap
            record={runtimeRecord}
            selectedPlaceId={selectedPlace.id}
            onSelectPlace={setSelectedPlaceId}
          />
          <div className="mb-place-strip" aria-label="Places">
            {selectedMap.places.map((place, index) => (
              <button
                type="button"
                key={place.id}
                className={place.id === selectedPlace.id ? 'is-selected' : ''}
                onClick={() => setSelectedPlaceId(place.id)}
              >
                <span>{index + 1}</span>
                <strong>{place.short_name || place.name}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-info-column">
          <PlacePanel
            record={selectedMap}
            place={selectedPlace}
            placeNumber={placeNumber}
          />
        </section>
      </div>
      </div>
    </div>
  )
}
