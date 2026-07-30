import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const root = new URL('../', import.meta.url)

test('private and public detail views use one shared map component', async () => {
  const [privateSource, publicSource, viewerSource] = await Promise.all([
    readFile(new URL('index.jsx', root), 'utf8'),
    readFile(new URL('publicMap.js', root), 'utf8'),
    readFile(new URL('map-viewer-0.2.0.js', root), 'utf8'),
  ])

  assert.match(privateSource, /<SharedMapDetail/)
  assert.doesNotMatch(privateSource, /function TileMap|function PlacePanel/)
  assert.match(publicSource, /<mobius-map-viewer>/)
  assert.match(viewerSource, /customElements\.define\('mobius-map-viewer'/)
  assert.match(viewerSource, /global\.L\.map/)
  assert.match(viewerSource, /keepBuffer: 2/)
  assert.match(viewerSource, /minZoom: 4/)
  assert.match(viewerSource, /maxZoom: 19/)
})
