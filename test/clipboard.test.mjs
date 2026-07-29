import { test } from 'node:test'
import assert from 'node:assert/strict'

import { copyPlainText } from '../clipboard.js'

test('copy uses the async clipboard when the host permits it', async () => {
  const writes = []
  const copied = await copyPlainText('public link', {
    navigatorRef: { clipboard: { writeText: async (value) => writes.push(value) } },
    documentRef: null,
  })

  assert.equal(copied, true)
  assert.deepEqual(writes, ['public link'])
})

test('copy falls back to a temporary selection in framed and older hosts', async () => {
  const events = []
  const textarea = {
    style: {},
    value: '',
    setAttribute() {},
    focus() { events.push('focus') },
    select() { events.push('select') },
    setSelectionRange() { events.push('range') },
    remove() { events.push('remove') },
  }
  const copied = await copyPlainText('public link', {
    navigatorRef: { clipboard: { async writeText() { throw new Error('denied') } } },
    documentRef: {
      activeElement: null,
      body: { appendChild() { events.push('append') } },
      createElement: () => textarea,
      execCommand(command) {
        assert.equal(command, 'copy')
        events.push('copy')
        return true
      },
    },
  })

  assert.equal(copied, true)
  assert.equal(textarea.value, 'public link')
  assert.deepEqual(events, ['append', 'focus', 'select', 'range', 'copy', 'remove'])
})
