import assert from 'node:assert/strict'
import test from 'node:test'

import {
  mapPointToPixel,
  normalizeMapRecord,
  oneFingerZoom,
  panMapCenter,
  pinchZoom,
  tileRangeForViewport,
} from '../domain.js'

test('gesture zooms stay inside the supported interactive range', () => {
  assert.equal(oneFingerZoom(17.5, 100, 300), 18)
  assert.equal(oneFingerZoom(13.5, 300, 100), 13)
  assert.equal(pinchZoom(15, 100, 200), 16)
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
