import {
  buildPublicMapHtml,
  mapPublicationProjectId,
} from './publicMap.js'
import {
  LINK_PREVIEW_FILENAME,
  mapLinkPreviewMetadata,
  renderMapLinkPreviewPng,
} from './linkPreview.js'

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
  const storage = window.mobius.storage
  const root = `projects/${projectId}/build/site`

  async function stageHtml(publicUrl) {
    const saved = await storage.setText(
      `${root}/index.html`,
      buildPublicMapHtml(record, { appId, publicUrl }),
      { contentType: 'text/html;charset=utf-8' },
    )
    if (saved?.queued) {
      throw new Error('Connect to the internet before sharing this map.')
    }
  }

  async function stagePreview() {
    const preview = await renderMapLinkPreviewPng(record)
    const saved = await storage.setBlob(`${root}/${LINK_PREVIEW_FILENAME}`, preview)
    if (saved?.queued) {
      throw new Error('Connect to the internet before sharing this map.')
    }
  }

  async function publishStaged() {
    const response = await fetch(`/api/apps/${encodeURIComponent(appId)}/publish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        link_preview: mapLinkPreviewMetadata(record),
      }),
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

  await Promise.all([stageHtml(), stagePreview()])
  let result = await publishStaged()

  // Older Möbius releases safely ignore the new request field and return only
  // a relative URL. Keep one explicit fallback until Maps can require a
  // platform release with snapshot-owned link previews.
  if (!result.public_url) {
    await stageHtml(absolutePublicMapUrl(result.url, window.location.href))
    result = await publishStaged()
  }
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
