import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const theme = readFileSync(new URL('../theme.js', import.meta.url), 'utf8')

test('compact library divider stays inset from both pane edges', () => {
  assert.doesNotMatch(theme, /\.mb-library-header-inner\s*\{[^}]*border-bottom/s)
  assert.match(theme, /\.mb-library-header-inner::after\s*\{[^}]*inset-inline:\s*18px[^}]*background:\s*var\(--border\)/s)
  assert.match(theme, /@media\s*\(max-width:\s*720px\)[\s\S]*?\.mb-library-header-inner::after\s*\{[^}]*inset-inline:\s*16px/s)
})
