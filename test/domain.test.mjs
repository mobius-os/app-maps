import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  googleMapsPlaceUrl,
  mapPointToPixel,
} from '../domain.js'

test('map preview projection keeps the center centered and east to the right', () => {
  const center = { lat: 43.859, lon: 18.43 }
  const size = { width: 760, height: 560 }
  assert.deepEqual(mapPointToPixel(center, center, 14, size), {
    x: size.width / 2,
    y: size.height / 2,
  })
  assert.ok(mapPointToPixel(
    { lat: center.lat, lon: center.lon + 0.01 },
    center,
    14,
    size,
  ).x > size.width / 2)
})

test('Google Maps links identify the venue instead of an anonymous coordinate', () => {
  assert.equal(
    googleMapsPlaceUrl({
      name: 'Aščinica ASDŽ',
      address: 'Ćurčiluk mali 3, Baščaršija',
      lat: 43.859,
      lon: 18.431,
    }),
    'https://www.google.com/maps/search/?api=1&query=A%C5%A1%C4%8Dinica%20ASD%C5%BD%2C%20%C4%86ur%C4%8Diluk%20mali%203%2C%20Ba%C5%A1%C4%8Dar%C5%A1ija',
  )
})

test('exact place links win while old coordinate searches are upgraded', () => {
  const exact = 'https://www.google.com/maps/place/?q=place_id:exact'
  assert.equal(googleMapsPlaceUrl({ google_maps_url: exact }), exact)
  assert.match(
    googleMapsPlaceUrl({
      name: 'Monmouth Coffee',
      address: '2 Park Street',
      maps_url: 'https://www.google.com/maps/search/?api=1&query=51.505,-0.091',
    }),
    /query=Monmouth%20Coffee%2C%202%20Park%20Street$/,
  )
  assert.match(
    googleMapsPlaceUrl({
      name: 'Safe fallback',
      address: '1 Example Street',
      google_maps_url: 'javascript:alert(1)',
    }),
    /^https:\/\/www\.google\.com\/maps\/search\//,
  )
  assert.match(
    googleMapsPlaceUrl({
      name: 'Safe fallback',
      address: '1 Example Street',
      google_maps_url: 'https://www.google.evil.com/maps/place/fake',
    }),
    /^https:\/\/www\.google\.com\/maps\/search\//,
  )
})
