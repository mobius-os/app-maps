import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  buildPublicMapHtml,
  mapPublicationProjectId,
} from '../publicMap.js'
import {
  absolutePublicMapUrl,
  publishedMapFromToken,
  readPublishedMap,
} from '../share.js'

const record = {
  id: 'coffee-map',
  title: 'Coffee map',
  subtitle: 'Three good stops',
  area: 'Borough Market',
  center: { lat: 51.505, lon: -0.091 },
  zoom: 15,
  places: [{
    id: 'monmouth',
    name: 'Monmouth Coffee',
    address: '2 Park Street',
    note: 'A dependable first stop.',
    best_for: 'Coffee',
    price: '£',
    walk: '3 min walk',
    website: 'https://example.com',
    phone: '+44 20 7946 0123',
    rating: 4.6,
    review_count: 238,
    rating_source: 'Google Maps',
    lat: 51.505,
    lon: -0.091,
  }],
}

test('public map HTML embeds safe data and a real interactive map', () => {
  const html = buildPublicMapHtml({
    ...record,
    title: 'Coffee <script>alert(1)</script>',
  })

  assert.match(html, /Shared from Möbius Maps/)
  assert.match(html, /tile\.openstreetmap\.org/)
  assert.match(html, /pointerdown/)
  assert.match(html, /gesture\.pinch/)
  assert.match(html, /wheelDelta/)
  assert.match(html, /deltaMode/)
  assert.match(html, /clamp\(nextZoom,13,18\)/)
  assert.match(html, /WEB/)
  assert.match(html, /Google Maps/)
  assert.match(html, /coordinateOnlyMapsSearch/)
  assert.match(html, /Open directions/)
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/)
  assert.match(html, /Coffee \\u003cscript>alert\(1\)\\u003c\/script>/)
})

test('publication project ids are stable, bounded, and path-safe', () => {
  const first = mapPublicationProjectId('../../Coffee map with spaces')
  const second = mapPublicationProjectId('../../Coffee map with spaces')

  assert.equal(first, second)
  assert.match(first, /^[A-Za-z0-9_-]{1,64}$/)
  assert.ok(first.length <= 64)
  assert.notEqual(
    first,
    mapPublicationProjectId('../../Coffee map with spaces!'),
  )
})

test('an existing publication is recovered from the platform token hint', async () => {
  const token = 'a'.repeat(32)
  let requestedPath = ''
  const publication = await readPublishedMap({
    record,
    storage: {
      async getText(path) {
        requestedPath = path
        return token
      },
    },
  })

  assert.match(requestedPath, /^projects\/map-coffee-map-/)
  assert.deepEqual(
    publication,
    {
      projectId: mapPublicationProjectId(record.id),
      token,
      url: `/sites/${token}/`,
    },
  )
  assert.equal(
    absolutePublicMapUrl(publication.url, 'https://mobius.test/api/apps/101/frame'),
    `https://mobius.test/sites/${token}/`,
  )
})

test('invalid publication hints never become public links', () => {
  assert.equal(publishedMapFromToken(record, '../not-a-token'), null)
})
