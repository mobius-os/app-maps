export const LINK_PREVIEW_WIDTH = 1200
export const LINK_PREVIEW_HEIGHT = 630
export const LINK_PREVIEW_FILENAME = 'preview.png'

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function trimTo(value, length) {
  const text = String(value ?? '').trim()
  if (text.length <= length) return text
  return `${text.slice(0, Math.max(0, length - 1)).trimEnd()}…`
}

export function wrapPreviewTitle(value, maxChars = 19, maxLines = 3) {
  const words = String(value ?? '').trim().split(/\s+/).filter(Boolean)
  const lines = []
  for (const word of words) {
    const current = lines.at(-1)
    if (!current || `${current} ${word}`.length > maxChars) {
      if (lines.length === maxLines) {
        lines[maxLines - 1] = trimTo(`${lines[maxLines - 1]} ${word}`, maxChars)
        continue
      }
      lines.push(trimTo(word, maxChars))
    } else {
      lines[lines.length - 1] = `${current} ${word}`
    }
  }
  if (!lines.length) return ['Untitled map']
  if (words.join(' ').length > lines.join(' ').replaceAll('…', '').length && !lines.at(-1).endsWith('…')) {
    lines[lines.length - 1] = trimTo(`${lines.at(-1)}…`, maxChars)
  }
  return lines
}

function previewBounds(record) {
  const points = [
    ...(Array.isArray(record?.places) ? record.places : []),
    record?.origin,
    record?.center,
  ].filter((point) => Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lon)))
  const lats = points.map((point) => Number(point.lat))
  const lons = points.map((point) => Number(point.lon))
  const minLat = Math.min(...lats, 51.4)
  const maxLat = Math.max(...lats, 51.6)
  const minLon = Math.min(...lons, -0.2)
  const maxLon = Math.max(...lons, 0.2)
  const latPad = Math.max((maxLat - minLat) * 0.13, 0.08)
  const lonPad = Math.max((maxLon - minLon) * 0.13, 0.08)
  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLon: minLon - lonPad,
    maxLon: maxLon + lonPad,
  }
}

function projectPoint(point, bounds) {
  const lonSpan = Math.max(bounds.maxLon - bounds.minLon, 0.01)
  const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.01)
  return {
    x: 54 + ((Number(point.lon) - bounds.minLon) / lonSpan) * 558,
    y: 74 + ((bounds.maxLat - Number(point.lat)) / latSpan) * 486,
  }
}

function titleMarkup(title) {
  return wrapPreviewTitle(title).map((line, index) => (
    `<tspan x="724" y="${142 + index * 58}">${escapeXml(line)}</tspan>`
  )).join('')
}

function placeListMarkup(places, titleLines) {
  const startY = titleLines.length === 3 ? 370 : 338
  return places.slice(0, 3).map((place, index) => {
    const y = startY + index * 58
    const name = escapeXml(trimTo(place?.short_name || place?.name || `Place ${index + 1}`, 28))
    return `
      <circle cx="750" cy="${y - 7}" r="16" fill="${index === 0 ? '#f4745f' : '#9b7cff'}"/>
      <text x="750" y="${y - 1}" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="800">${index + 1}</text>
      <text x="780" y="${y}" fill="#eaf0ed" font-size="23" font-weight="650">${name}</text>`
  }).join('')
}

function pinMarkup(record, bounds) {
  return (Array.isArray(record?.places) ? record.places : []).slice(0, 12).map((place, index) => {
    const point = projectPoint(place, bounds)
    const fill = index === 0 ? '#f4745f' : '#234f45'
    return `
      <g transform="translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})">
        <circle r="22" fill="rgba(16,21,20,.17)"/>
        <path d="M0 16C-15 0-17-8-12-17A15 15 0 0 1 12-17C17-8 15 0 0 16Z" fill="${fill}" stroke="#ffffff" stroke-width="4"/>
        <circle cy="-8" r="7" fill="#ffffff"/>
        <text y="-3.5" text-anchor="middle" fill="${fill}" font-size="12" font-weight="900">${index + 1}</text>
      </g>`
  }).join('')
}

export function mapLinkPreviewAlt(record) {
  const count = Array.isArray(record?.places) ? record.places.length : 0
  const area = String(record?.area || 'the selected area').trim()
  return `${record?.title || 'Interactive map'} — ${count} ${count === 1 ? 'place' : 'places'} in ${area}`
}

export function mapLinkPreviewMetadata(record) {
  return {
    title: String(record?.title || 'Interactive map').trim(),
    description: String(
      record?.subtitle
      || record?.area
      || 'Explore these recommendations on an interactive map.',
    ).trim(),
    image_path: LINK_PREVIEW_FILENAME,
    image_alt: mapLinkPreviewAlt(record),
    image_width: LINK_PREVIEW_WIDTH,
    image_height: LINK_PREVIEW_HEIGHT,
    site_name: 'Möbius Maps',
  }
}

export function buildMapLinkPreviewSvg(record) {
  const places = Array.isArray(record?.places) ? record.places : []
  const titleLines = wrapPreviewTitle(record?.title)
  const bounds = previewBounds(record)
  const area = escapeXml(trimTo(record?.area || record?.subtitle || 'Interactive recommendations', 43))
  const count = places.length

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LINK_PREVIEW_WIDTH}" height="${LINK_PREVIEW_HEIGHT}" viewBox="0 0 ${LINK_PREVIEW_WIDTH} ${LINK_PREVIEW_HEIGHT}" role="img" aria-label="${escapeXml(mapLinkPreviewAlt(record))}">
  <defs>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#17201d"/>
      <stop offset="1" stop-color="#0d1211"/>
    </linearGradient>
    <linearGradient id="map" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e8efe9"/>
      <stop offset="1" stop-color="#cddcd1"/>
    </linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#18322d" flood-opacity=".22"/>
    </filter>
    <clipPath id="map-clip"><rect width="664" height="630"/></clipPath>
  </defs>

  <rect width="1200" height="630" fill="#101514"/>
  <g clip-path="url(#map-clip)">
    <rect width="664" height="630" fill="url(#map)"/>
    <path d="M-40 500C86 456 144 531 258 495C378 457 438 369 704 408V680H-40Z" fill="#bed9dd" opacity=".85"/>
    <path d="M-70 104C52 25 163 60 247 142C322 214 374 174 462 74C516 12 596 0 714 32V-30H-70Z" fill="#c3d9c9" opacity=".92"/>
    <path d="M4 48C104 125 144 188 240 205S403 172 505 252S592 381 709 408" fill="none" stroke="#ffffff" stroke-width="20" stroke-linecap="round"/>
    <path d="M4 48C104 125 144 188 240 205S403 172 505 252S592 381 709 408" fill="none" stroke="#e0a85f" stroke-width="6" stroke-linecap="round"/>
    <path d="M-20 384C90 350 162 285 252 318S380 432 482 454S590 431 710 338" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round"/>
    <path d="M-20 384C90 350 162 285 252 318S380 432 482 454S590 431 710 338" fill="none" stroke="#d8b779" stroke-width="4" stroke-linecap="round"/>
    <g fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity=".9">
      <path d="M56-30C80 90 78 184 156 274S256 420 240 680"/>
      <path d="M292-28C270 92 324 132 363 220S348 430 422 680"/>
      <path d="M534-30C558 88 492 177 512 299S618 462 588 680"/>
      <path d="M-20 238C117 225 156 255 260 258S434 217 690 242"/>
      <path d="M-30 548C100 518 197 564 303 550S492 500 706 540"/>
    </g>
    <g fill="#8eb39b" opacity=".26">
      <circle cx="107" cy="118" r="51"/><circle cx="542" cy="104" r="64"/>
      <circle cx="382" cy="513" r="58"/><circle cx="124" cy="522" r="31"/>
    </g>
    <g filter="url(#shadow)">${pinMarkup(record, bounds)}</g>
    <g transform="translate(24 24)">
      <rect width="166" height="42" rx="21" fill="rgba(255,255,255,.9)"/>
      <circle cx="24" cy="21" r="9" fill="#234f45"/>
      <path d="M24 12v18M15 21h18" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <text x="43" y="27" fill="#18322d" font-size="17" font-weight="800">MÖBIUS MAPS</text>
    </g>
  </g>

  <rect x="664" width="536" height="630" fill="url(#panel)"/>
  <rect x="664" width="7" height="630" fill="#9b7cff"/>
  <text x="724" y="77" fill="#9b7cff" font-size="16" font-weight="850" letter-spacing="3">CURATED MAP</text>
  <text fill="#f4f7f5" font-size="43" font-weight="780" letter-spacing="-1.2">${titleMarkup(record?.title)}</text>
  <text x="724" y="${titleLines.length === 3 ? 327 : 295}" fill="#a9b7b1" font-size="22" font-weight="520">${area}</text>
  <line x1="724" x2="1140" y1="${titleLines.length === 3 ? 347 : 315}" y2="${titleLines.length === 3 ? 347 : 315}" stroke="#34413d"/>
  ${placeListMarkup(places, titleLines)}
  <g transform="translate(724 554)">
    <rect width="416" height="47" rx="23.5" fill="#202a27" stroke="#34413d"/>
    <circle cx="25" cy="23.5" r="8" fill="#f4745f"/>
    <text x="44" y="30" fill="#dce5e1" font-size="18" font-weight="700">${count} ${count === 1 ? 'place' : 'places'} · Interactive map</text>
  </g>
</svg>`
}

export function mapLinkPreviewDataUrl(record) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildMapLinkPreviewSvg(record))}`
}

export async function renderMapLinkPreviewPng(record) {
  const image = new Image()
  image.decoding = 'async'
  const loaded = new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = () => reject(new Error('Could not render the map link preview.'))
  })
  image.src = mapLinkPreviewDataUrl(record)
  await loaded

  const canvas = document.createElement('canvas')
  canvas.width = LINK_PREVIEW_WIDTH
  canvas.height = LINK_PREVIEW_HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Image previews are unavailable in this browser.')
  context.drawImage(image, 0, 0, LINK_PREVIEW_WIDTH, LINK_PREVIEW_HEIGHT)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Could not prepare the map link preview.')
  return blob
}
