import { normalizeMapRecord } from './domain.js'

async function loadRecords(index) {
  const ids = Array.isArray(index?.ids) ? index.ids : []
  const settled = await Promise.allSettled(
    ids.map((id) => window.mobius.storage.get(`maps/${id}.json`)),
  )
  return settled
    .filter((result) => result.status === 'fulfilled')
    .map((result) => normalizeMapRecord(result.value))
    .filter(Boolean)
    .sort((a, b) => {
      const right = Date.parse(b.created_at || '')
      const left = Date.parse(a.created_at || '')
      return (Number.isFinite(right) ? right : 0) - (Number.isFinite(left) ? left : 0)
    })
}

export function subscribeToMapLibrary({ onMaps, onError }) {
  let disposed = false
  let loadSequence = 0

  const publishIndex = async (index) => {
    const sequence = ++loadSequence
    try {
      const records = await loadRecords(index)
      if (!disposed && sequence === loadSequence) onMaps(records)
    } catch (error) {
      if (!disposed && sequence === loadSequence) onError(error)
    }
  }

  // Subscribe owns live agent-written updates, while the explicit read removes
  // any dependency on the cache subscription's first-emission timing at boot.
  const unsubscribe = window.mobius.storage.subscribe(
    'maps/index.json',
    publishIndex,
  )
  window.mobius.storage.get('maps/index.json').then(publishIndex).catch(onError)

  return () => {
    disposed = true
    unsubscribe?.()
  }
}
