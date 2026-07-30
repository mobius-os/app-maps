const MAX_LATITUDE = 85.05112878

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function isCoordinateOnlyMapsSearch(value) {
  try {
    const query = new URL(value).searchParams.get('query') || ''
    return /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(query)
  } catch {
    return false
  }
}

function isGoogleMapsUrl(value) {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const googleHost = host === 'google.com'
      || host.endsWith('.google.com')
      || /^(?:www|maps)\.google\.[a-z]{2,3}(?:\.[a-z]{2})?$/.test(host)
      || host === 'goo.gl'
      || host.endsWith('.goo.gl')
    return url.protocol === 'https:' && googleHost
  } catch {
    return false
  }
}

export function googleMapsPlaceUrl(place = {}) {
  const saved = String(place.google_maps_url || place.maps_url || '').trim()
  if (saved && isGoogleMapsUrl(saved) && !isCoordinateOnlyMapsSearch(saved)) return saved

  const placeQuery = [place.name, place.address]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(', ')
  const query = placeQuery || `${place.lat},${place.lon}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function worldPixel(point, zoom, tileSize = 256) {
  const scale = tileSize * (2 ** zoom)
  const lat = clamp(point.lat, -MAX_LATITUDE, MAX_LATITUDE)
  const sin = Math.sin((lat * Math.PI) / 180)
  return {
    x: ((point.lon + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  }
}

export function mapPointToPixel(point, center, zoom, size) {
  const target = worldPixel(point, zoom)
  const origin = worldPixel(center, zoom)
  return {
    x: target.x - origin.x + (size.width / 2),
    y: target.y - origin.y + (size.height / 2),
  }
}

function tileNorthWest(x, y, zoom) {
  const n = Math.PI - ((2 * Math.PI * y) / (2 ** zoom))
  return {
    lon: (x / (2 ** zoom)) * 360 - 180,
    lat: (180 / Math.PI) * Math.atan(Math.sinh(n)),
  }
}

export function tileRangeForViewport(center, zoom, size, tileSize = 256) {
  const centerPixel = worldPixel(center, zoom, tileSize)
  const minX = Math.floor((centerPixel.x - (size.width / 2)) / tileSize)
  const maxX = Math.floor((centerPixel.x + (size.width / 2)) / tileSize)
  const minY = Math.floor((centerPixel.y - (size.height / 2)) / tileSize)
  const maxY = Math.floor((centerPixel.y + (size.height / 2)) / tileSize)
  const tiles = []
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      tiles.push({
        z: zoom,
        x,
        y,
        key: `${zoom}/${x}/${y}`,
        northWest: tileNorthWest(x, y, zoom),
      })
    }
  }
  return tiles
}

export function normalizeMapRecord(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.places)) return null
  if (!value.id || !value.title || !value.center || !value.origin) return null
  const places = value.places.filter((place) => (
    place
    && place.id
    && place.name
    && Number.isFinite(place.lat)
    && Number.isFinite(place.lon)
  ))
  if (!places.length) return null
  return { ...value, places }
}
