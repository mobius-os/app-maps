import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  LINK_PREVIEW_HEIGHT,
  LINK_PREVIEW_WIDTH,
  buildMapLinkPreviewSvg,
  mapLinkPreviewAlt,
  mapLinkPreviewMetadata,
  wrapPreviewTitle,
} from '../linkPreview.js'

const record = {
  id: 'bookshop-map',
  title: 'Independent bookshops around Edinburgh',
  area: 'Central Edinburgh',
  center: { lat: 55.953, lon: -3.189 },
  origin: { label: 'Edinburgh Waverley', lat: 55.952, lon: -3.189 },
  places: [
    { id: 'one', name: 'Topping & Company Booksellers', short_name: 'Topping & Company', lat: 55.957, lon: -3.181 },
    { id: 'two', name: 'Lighthouse Bookshop', short_name: 'Lighthouse', lat: 55.947, lon: -3.186 },
  ],
}

test('link previews are a stable social-card size with map-specific content', () => {
  const svg = buildMapLinkPreviewSvg(record)

  assert.equal(LINK_PREVIEW_WIDTH, 1200)
  assert.equal(LINK_PREVIEW_HEIGHT, 630)
  assert.match(svg, /width="1200" height="630"/)
  assert.match(svg, /Independent bookshops/)
  assert.match(svg, /Topping &amp; Company/)
  assert.match(svg, /2 places · Interactive map/)
  assert.match(svg, /MÖBIUS MAPS/)
})

test('link-preview copy is escaped and long titles stay bounded', () => {
  const lines = wrapPreviewTitle('A deliberately very long map title that needs a calm final line', 18, 2)
  const svg = buildMapLinkPreviewSvg({
    ...record,
    title: 'Safe <script>alert("no")</script> map',
  })

  assert.ok(lines.length <= 2)
  assert.ok(lines.every((line) => line.length <= 18))
  assert.doesNotMatch(svg, /<script>/)
  assert.match(svg, /&lt;script&gt;/)
  assert.equal(
    mapLinkPreviewAlt(record),
    'Independent bookshops around Edinburgh — 2 places in Central Edinburgh',
  )
})

test('publication metadata names the generated preview once', () => {
  assert.deepEqual(mapLinkPreviewMetadata(record), {
    title: 'Independent bookshops around Edinburgh',
    description: 'Central Edinburgh',
    image_path: 'preview.png',
    image_alt: 'Independent bookshops around Edinburgh — 2 places in Central Edinburgh',
    image_width: 1200,
    image_height: 630,
    site_name: 'Möbius Maps',
  })
})
