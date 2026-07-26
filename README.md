# Maps for Möbius

Maps turns location-based answers into saved, interactive maps. Each map keeps
its places, source conversation, and the context that made the recommendations
useful.

The app includes a Möbius skill for researching and geocoding places, writing a
validated map record, and linking the saved map back into chat as a visual
preview.

## What it does

- Keeps generated maps in a newest-first visual library.
- Renders OpenStreetMap tiles with place markers and required attribution.
- Supports drag, pinch, double-tap, and one-finger double-tap zoom gestures.
- Opens the source conversation from each saved map.
- Ships stdlib-only helpers for geocoding and conflict-safe storage updates.

## Development

```bash
npm test
npm run smoke
```

Map records live in app-scoped Möbius storage and are never committed to this
repository.
