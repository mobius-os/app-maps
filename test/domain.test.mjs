import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  googleMapsPlaceUrl,
  mapPointToPixel,
  normalizeMapRecord,
  oneFingerZoom,
  panMapCenter,
  pinchZoom,
  tileRangeForViewport,
  wheelZoomDelta,
  worldPixel,
  worldPixelToPoint,
  zoomMapAtPixel,
} from '../domain.js'

test('gesture zooms stay inside the supported interactive range', () => {
  assert.equal(oneFingerZoom(17.5, 100, 300), 18)
  assert.equal(oneFingerZoom(13.5, 300, 100), 13)
  assert.equal(pinchZoom(15, 100, 200), 16)
})

test('anchored zoom keeps the touched location under the same pixel', () => {
  const center = { lat: 43.859, lon: 18.43 }
  const size = { width: 760, height: 560 }
  const touchedPixel = { x: 164, y: 207 }
  const startZoom = 14
  const nextZoom = 15.35
  const centerWorld = worldPixel(center, startZoom)
  const touchedPlace = worldPixelToPoint({
    x: centerWorld.x + touchedPixel.x - (size.width / 2),
    y: centerWorld.y + touchedPixel.y - (size.height / 2),
  }, startZoom)
  const nextCenter = zoomMapAtPixel(
    center,
    touchedPixel,
    startZoom,
    nextZoom,
    size,
  )
  const nextPixel = mapPointToPixel(touchedPlace, nextCenter, nextZoom, size)

  assert.ok(Math.abs(nextPixel.x - touchedPixel.x) < 0.0001)
  assert.ok(Math.abs(nextPixel.y - touchedPixel.y) < 0.0001)
})

test('trackpad wheel gestures zoom gradually in the expected direction', () => {
  assert.equal(wheelZoomDelta(-4), 0.025)
  assert.equal(wheelZoomDelta(4), -0.025)
  assert.equal(wheelZoomDelta(-1000), 0.5)
  assert.equal(wheelZoomDelta(1000), -0.5)
  assert.equal(wheelZoomDelta(-5, 1), 0.5)
})

test('panning moves the center while keeping its projection reversible', () => {
  const center = { lat: 51.525, lon: -0.087 }
  const next = panMapCenter(center, 80, -35, 15)
  const point = mapPointToPixel(center, next, 15, { width: 400, height: 300 })
  assert.ok(Math.abs(point.x - 280) < 0.001)
  assert.ok(Math.abs(point.y - 115) < 0.001)
})

test('tile planning covers the viewport with stable tile identities', () => {
  const tiles = tileRangeForViewport(
    { lat: 51.525, lon: -0.087 },
    13,
    { width: 420, height: 160 },
  )
  assert.ok(tiles.length >= 2)
  assert.equal(new Set(tiles.map((tile) => tile.key)).size, tiles.length)
})

test('map records keep valid places and reject an unusable record', () => {
  const record = normalizeMapRecord({
    id: 'coffee',
    title: 'Coffee',
    center: { lat: 51.5, lon: -0.1 },
    origin: { lat: 51.5, lon: -0.1 },
    places: [
      { id: 'one', name: 'One', lat: 51.51, lon: -0.11 },
      { id: 'broken', name: 'Broken', lat: 'north', lon: -0.12 },
    ],
  })
  assert.deepEqual(record.places.map((place) => place.id), ['one'])
  assert.equal(normalizeMapRecord({ title: 'Missing identity', places: [] }), null)
})

test('Google Maps links identify the venue instead of an anonymous coordinate', () => {
  assert.equal(
    googleMapsPlaceUrl({
      name: 'Example Coffee',
      address: '2 Park Street',
      lat: 51.505,
      lon: -0.091,
    }),
    'https://www.google.com/maps/search/?api=1&query=Example%20Coffee%2C%202%20Park%20Street',
  )
})

test('exact Google place links win while unsafe and coordinate links are upgraded', () => {
  const exact = 'https://www.google.com/maps/place/?q=place_id:exact'
  assert.equal(googleMapsPlaceUrl({ google_maps_url: exact }), exact)
  for (const saved of [
    'https://www.google.com/maps/search/?api=1&query=51.505,-0.091',
    'javascript:alert(1)',
    'https://www.google.evil.com/maps/place/fake',
  ]) {
    assert.match(
      googleMapsPlaceUrl({
        name: 'Example Coffee',
        address: '2 Park Street',
        maps_url: saved,
      }),
      /query=Example%20Coffee%2C%202%20Park%20Street$/,
    )
  }
})

test('chat deep links reuse the shell Back entry instead of adding a library stop', async () => {
  const source = await readFile(new URL('../index.jsx', import.meta.url), 'utf8')
  assert.match(source, /openMap\(match\[1\], \{ ownBackEntry: false \}\)/)
  assert.match(
    source,
    /if \(!ownBackEntry\) \{[\s\S]*setSelectedMapId\(id\)[\s\S]*return[\s\S]*\}\n    if \(id === selectedMapId\) return/,
  )
})
