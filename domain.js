const MAX_LATITUDE = 85.05112878

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function oneFingerZoom(startZoom, startY, currentY) {
  return clamp(startZoom + ((currentY - startY) / 110), 13, 18)
}

export function pinchZoom(startZoom, startDistance, currentDistance) {
  return clamp(
    startZoom + Math.log2(currentDistance / Math.max(1, startDistance)),
    13,
    18,
  )
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

export function worldPixelToPoint(pixel, zoom, tileSize = 256) {
  const scale = tileSize * (2 ** zoom)
  const lon = (pixel.x / scale) * 360 - 180
  const n = Math.PI - ((2 * Math.PI * pixel.y) / scale)
  return {
    lat: (180 / Math.PI) * Math.atan(Math.sinh(n)),
    lon,
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

export function panMapCenter(center, dx, dy, zoom) {
  const origin = worldPixel(center, zoom)
  return worldPixelToPoint(
    { x: origin.x - dx, y: origin.y - dy },
    zoom,
  )
}

export function zoomMapAtPixel(center, pixel, zoom, nextZoom, size) {
  const currentCenter = worldPixel(center, zoom)
  const targetAtCurrentZoom = {
    x: currentCenter.x + pixel.x - (size.width / 2),
    y: currentCenter.y + pixel.y - (size.height / 2),
  }
  const target = worldPixelToPoint(targetAtCurrentZoom, zoom)
  const targetAtNextZoom = worldPixel(target, nextZoom)
  return worldPixelToPoint(
    {
      x: targetAtNextZoom.x - pixel.x + (size.width / 2),
      y: targetAtNextZoom.y - pixel.y + (size.height / 2),
    },
    nextZoom,
  )
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
