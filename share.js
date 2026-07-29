import {
  buildPublicMapHtml,
  mapPublicationProjectId,
} from './publicMap.js'

async function responseMessage(response, fallback) {
  try {
    const body = await response.json()
    return body?.detail || body?.error || fallback
  } catch {
    return fallback
  }
}

export async function publishMap({ appId, token, record }) {
  const projectId = mapPublicationProjectId(record.id)
  const path = `projects/${projectId}/build/site/index.html`
  const saved = await window.mobius.storage.setText(
    path,
    buildPublicMapHtml(record),
    { contentType: 'text/html;charset=utf-8' },
  )
  if (saved?.queued) {
    throw new Error('Connect to the internet before sharing this map.')
  }

  const response = await fetch(`/api/apps/${encodeURIComponent(appId)}/publish`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ project_id: projectId }),
  })
  if (!response.ok) {
    throw new Error(await responseMessage(
      response,
      `Could not publish this map (${response.status}).`,
    ))
  }
  const result = await response.json()
  if (!result?.url) throw new Error('The public map link was missing.')
  return result
}

export function absolutePublicMapUrl(url, baseUrl) {
  return new URL(url, baseUrl).href
}

export function publishedMapFromToken(record, token) {
  const clean = String(token || '').trim()
  if (!/^[a-f0-9]{16,64}$/.test(clean)) return null
  return {
    projectId: mapPublicationProjectId(record.id),
    token: clean,
    url: `/sites/${clean}/`,
  }
}

export async function readPublishedMap({ storage, record }) {
  const projectId = mapPublicationProjectId(record.id)
  const token = await storage.getText(`projects/${projectId}/build/publish-token.txt`)
  return publishedMapFromToken(record, token)
}

export async function unpublishMap({ appId, token, record }) {
  const projectId = mapPublicationProjectId(record.id)
  const response = await fetch(
    `/api/apps/${encodeURIComponent(appId)}/publish?project_id=${encodeURIComponent(projectId)}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  )
  if (!response.ok && response.status !== 404) {
    throw new Error(await responseMessage(
      response,
      `Could not stop sharing this map (${response.status}).`,
    ))
  }
}
