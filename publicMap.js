import { PUBLIC_VIEWER_ASSETS } from './viewerAssets.js'
import {
  LINK_PREVIEW_FILENAME,
  LINK_PREVIEW_HEIGHT,
  LINK_PREVIEW_WIDTH,
  mapLinkPreviewAlt,
} from './linkPreview.js'

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function safeJson(value) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')
}

export function mapPublicationProjectId(mapId) {
  const raw = String(mapId || 'map')
  let hashA = 2166136261
  let hashB = 2246822507
  for (let index = 0; index < raw.length; index += 1) {
    const code = raw.charCodeAt(index)
    hashA = Math.imul(hashA ^ code, 16777619)
    hashB = Math.imul(hashB ^ code, 3266489909)
  }
  const stem = raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 44) || 'map'
  const suffix = `${(hashA >>> 0).toString(36)}${(hashB >>> 0).toString(36)}`
  return `map-${stem}-${suffix}`
}

function publicMetaUrls(publicUrl) {
  if (!publicUrl) return null
  try {
    const canonical = new URL(publicUrl)
    if (!['http:', 'https:'].includes(canonical.protocol)) return null
    return {
      canonical: canonical.href,
      image: new URL(LINK_PREVIEW_FILENAME, canonical).href,
    }
  } catch {
    return null
  }
}

export function buildPublicMapHtml(record, { appId, publicUrl } = {}) {
  if (!Number.isInteger(Number(appId)) || Number(appId) <= 0) {
    throw new Error('A valid Maps app id is required to publish.')
  }
  const title = escapeHtml(record.title)
  const subtitle = escapeHtml(
    record.subtitle || `${record.places.length} places in ${record.area}`,
  )
  const assetRoot = `/app-assets/by-id/${encodeURIComponent(String(appId))}`
  const data = safeJson(record)
  const metaUrls = publicMetaUrls(publicUrl)
  const previewAlt = escapeHtml(mapLinkPreviewAlt(record))
  const meta = metaUrls ? `
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${subtitle}">
  <meta property="og:site_name" content="Möbius Maps">
  <meta property="og:url" content="${escapeHtml(metaUrls.canonical)}">
  <meta property="og:image" content="${escapeHtml(metaUrls.image)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="${LINK_PREVIEW_WIDTH}">
  <meta property="og:image:height" content="${LINK_PREVIEW_HEIGHT}">
  <meta property="og:image:alt" content="${previewAlt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${subtitle}">
  <meta name="twitter:image" content="${escapeHtml(metaUrls.image)}">
  <meta name="twitter:image:alt" content="${previewAlt}">
  <link rel="canonical" href="${escapeHtml(metaUrls.canonical)}">` : ''

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#101514">${meta}
  <title>${title} · Möbius Maps</title>
  <link rel="stylesheet" href="${assetRoot}/${PUBLIC_VIEWER_ASSETS.leafletCss}">
  <style>
    @font-face{font-family:Inter;src:url("/vendor/fonts/inter-400.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
    @font-face{font-family:Inter;src:url("/vendor/fonts/inter-700.woff2") format("woff2");font-weight:700 900;font-style:normal;font-display:swap}
    :root{color-scheme:dark;--bg:#101514;--surface:#171d1b;--surface-2:#202825;--text:#f4f7f5;--muted:#a5b0ab;--border:#303a36;--accent:#9b7cff;--font:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font-family:var(--font)}
    body{min-height:100vh}
    mobius-map-viewer{min-height:100vh}
  </style>
</head>
<body>
  <mobius-map-viewer></mobius-map-viewer>
  <script id="map-data" type="application/json">${data}</script>
  <script src="${assetRoot}/${PUBLIC_VIEWER_ASSETS.leafletJs}"></script>
  <script src="${assetRoot}/${PUBLIC_VIEWER_ASSETS.viewerJs}"></script>
  <script>
    document.querySelector('mobius-map-viewer').configure({
      mode: 'public',
      record: JSON.parse(document.getElementById('map-data').textContent),
      tileMode: 'direct'
    })
  </script>
</body>
</html>`
}
